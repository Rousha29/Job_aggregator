import json
import ollama
from app.config.db import get_connection
from app.services.embedding_service import embed_profile

def get_suggestions(profile: dict, limit: int = 5) -> list[dict]:
    """
    1. Crée un embedding du profil utilisateur
    2. Cherche les offres les plus similaires en base
    3. Demande au LLM d'expliquer pourquoi chaque offre correspond
    """
    
    # Étape 1 : Embedding du profil
    profile_embedding = embed_profile(profile)
    embedding_str = '[' + ','.join(map(str, profile_embedding)) + ']'
    
    # Étape 2 : Recherche par similarité dans PostgreSQL
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            id, title, company, location, contract_type, 
            level, salary_min, salary_max, remote, description,
            1 - (embedding <=> %s::vector) as similarity
        FROM offers
        WHERE is_visible = true
          AND embedding IS NOT NULL
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (embedding_str, embedding_str, limit * 3))
    
    candidates = cursor.fetchall()
    conn.close()
    
    if not candidates:
        return []
    
    # Étape 3 : LLM génère les explications
    skills = ', '.join(profile.get('skills', []))
    offers_text = '\n'.join([
        f"- [{o['id']}] {o['title']} chez {o['company']} "
        f"({o['contract_type']}, {o['level']}, {o['location']})"
        for o in candidates[:limit * 2]
    ])
    
    prompt = f"""Tu es un assistant de recherche d'emploi tech.

Profil du candidat :
- Niveau : {profile.get('level', 'non précisé')}
- Contrat recherché : {profile.get('contract_type', 'non précisé')}
- Compétences : {skills}

Voici des offres d'emploi disponibles :
{offers_text}

Sélectionne les {limit} offres les plus adaptées à ce profil.
Réponds UNIQUEMENT en JSON valide, sans texte autour :
{{
  "suggestions": [
    {{
      "offer_id": "uuid de l'offre",
      "score": 85,
      "reason": "Explication courte en français (1 phrase)"
    }}
  ]
}}"""

    response = ollama.chat(
        model='mistral',
        messages=[{'role': 'user', 'content': prompt}]
    )
    
    try:
        content = response['message']['content']
        # Extraire le JSON de la réponse
        start = content.find('{')
        end = content.rfind('}') + 1
        data = json.loads(content[start:end])
        return data.get('suggestions', [])
    except Exception:
        # Fallback : retourner les offres les plus similaires sans explication
        return [
            {
                'offer_id': str(o['id']),
                'score': round(float(o['similarity']) * 100),
                'reason': f"Bonne correspondance avec votre profil {skills}"
            }
            for o in candidates[:limit]
        ]

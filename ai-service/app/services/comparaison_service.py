import json
import ollama
from app.config.db import get_connection

def compare_offers(offer_id_1: str, offer_id_2: str, profile: dict) -> dict:
    """
    Compare deux offres par rapport au profil utilisateur.
    Retourne une analyse structurée.
    """
    
    # Récupérer les deux offres en base
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, company, location, contract_type,
               level, salary_min, salary_max, remote, description
        FROM offers
        WHERE id = ANY(%s)
    """, ([offer_id_1, offer_id_2],))
    
    offers = cursor.fetchall()
    conn.close()
    
    if len(offers) < 2:
        return {'error': 'Une ou plusieurs offres non trouvées'}
    
    offer1 = dict(offers[0])
    offer2 = dict(offers[1])
    skills = ', '.join(profile.get('skills', []))
    
    def format_salary(min_s, max_s):
        if min_s and max_s:
            return f"{min_s}k€ - {max_s}k€/an"
        return "Non précisé"
    
    prompt = f"""Tu es un conseiller en recrutement tech expert.

Profil du candidat :
- Niveau : {profile.get('level', 'non précisé')}
- Contrat recherché : {profile.get('contract_type', 'non précisé')}
- Compétences : {skills}

Offre 1 — {offer1['title']} chez {offer1['company']}
- Lieu : {offer1['location']}
- Contrat : {offer1['contract_type']}
- Niveau : {offer1['level']}
- Salaire : {format_salary(offer1['salary_min'], offer1['salary_max'])}
- Télétravail : {'Oui' if offer1['remote'] else 'Non'}
- Description : {str(offer1['description'])[:400]}

Offre 2 — {offer2['title']} chez {offer2['company']}
- Lieu : {offer2['location']}
- Contrat : {offer2['contract_type']}
- Niveau : {offer2['level']}
- Salaire : {format_salary(offer2['salary_min'], offer2['salary_max'])}
- Télétravail : {'Oui' if offer2['remote'] else 'Non'}
- Description : {str(offer2['description'])[:400]}

Compare ces deux offres pour ce candidat.
Réponds UNIQUEMENT en JSON valide :
{{
  "winner": "offer1" ou "offer2",
  "winner_reason": "Pourquoi cette offre est la meilleure pour ce profil (2 phrases)",
  "offer1": {{
    "pros": ["avantage 1", "avantage 2"],
    "cons": ["inconvénient 1"],
    "match_score": 78
  }},
  "offer2": {{
    "pros": ["avantage 1"],
    "cons": ["inconvénient 1", "inconvénient 2"],
    "match_score": 65
  }},
  "summary": "Résumé de la comparaison en 1 phrase"
}}"""

    response = ollama.chat(
        model='mistral',
        messages=[{'role': 'user', 'content': prompt}]
    )
    
    try:
        content = response['message']['content']
        start = content.find('{')
        end = content.rfind('}') + 1
        result = json.loads(content[start:end])
        result['offer1_data'] = offer1
        result['offer2_data'] = offer2
        return result
    except Exception as e:
        return {
            'error': 'Erreur lors de la comparaison',
            'detail': str(e),
            'offer1_data': offer1,
            'offer2_data': offer2
        }
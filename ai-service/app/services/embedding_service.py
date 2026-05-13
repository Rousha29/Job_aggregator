from sentence_transformers import SentenceTransformer
import numpy as np

# Chargé une seule fois au démarrage du service
model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str) -> list[float]:
    if not text or not text.strip():
        return [0.0] * 384 # Retourne un vecteur nul pour les textes vides ou composés uniquement d'espaces pour éviter que ça plante
    
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def embed_offer(offer: dict) -> list[float]: 
    # On concatène les champs les plus importants
    text = f"""
    Poste : {offer.get('title', '')}
    Entreprise : {offer.get('company', '')}
    Localisation : {offer.get('location', '')}
    Contrat : {offer.get('contract_type', '')}
    Niveau : {offer.get('level', '')}
    Description : {offer.get('description', '')[:400]}
    """.strip()
    
    return embed_text(text)

def embed_profile(profile: dict) -> list[float]: # l'ofrre parfaite pour un profil
    skills = ', '.join(profile.get('skills', []))
    text = f"""
    Niveau : {profile.get('level', '')}
    Contrat recherché : {profile.get('contract_type', '')}
    Compétences : {skills}
    Localisation souhaitée : {profile.get('location', '')}
    """.strip()
    
    return embed_text(text)
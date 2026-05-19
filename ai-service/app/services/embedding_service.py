from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str) -> list[float]:
    if not text or not text.strip():
        return [0.0] * 384
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def embed_offer(offer: dict) -> list[float]:
    text = f"""
    Poste : {offer.get('title', '')}
    Entreprise : {offer.get('company', '')}
    Localisation : {offer.get('location', '')}
    Contrat : {offer.get('contract_type', '')}
    Niveau : {offer.get('level', '')}
    Description : {offer.get('description', '')[:400]}
    """.strip()
    return embed_text(text)

def embed_ideal_offer(ideal: dict) -> list[float]:
    """
    Transforme l'offre parfaite décrite par l'utilisateur en vecteur.
    L'utilisateur fournit les champs qu'il juge importants, les autres sont ignorés.
    Même format qu'une vraie offre pour que la comparaison soit cohérente.
    """
    skills = ', '.join(ideal.get('skills', []))
    text = f"""
    Poste : {ideal.get('title', '')}
    Localisation : {ideal.get('location', '')}
    Contrat : {ideal.get('contract_type', '')}
    Niveau : {ideal.get('level', '')}
    Compétences : {skills}
    Description : {ideal.get('description', '')[:400]}
    """.strip()
    return embed_text(text)
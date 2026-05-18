import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.config.db import get_connection
from app.services.embedding_service import embed_ideal_offer

def compare_offers(offer_id_1: str, offer_id_2: str, ideal_offer: dict) -> dict:

    conn = get_connection()
    cursor = conn.cursor()

    # On lit l'embedding déjà calculé par indexing_service — pas de recalcul
    cursor.execute("""
        SELECT id, title, company, location, contract_type,
               level, salary_min, salary_max, remote, description,
               embedding  -- ← le vecteur déjà stocké
        FROM offers
        WHERE id = ANY(%s)
        ORDER BY CASE id
            WHEN %s THEN 1
            WHEN %s THEN 2
        END
    """, ([offer_id_1, offer_id_2], offer_id_1, offer_id_2))

    offers = cursor.fetchall()
    conn.close()

    if len(offers) < 2:
        return {'error': 'Une ou plusieurs offres non trouvées'}

    offer1 = dict(offers[0])
    offer2 = dict(offers[1])

    # Vérifier que les offres sont bien indexées
    if offer1['embedding'] is None or offer2['embedding'] is None:
        return {'error': 'Une ou plusieurs offres ne sont pas encore indexées'}

    # Offre idéale → vecteur (calculé à la volée car vient de l'utilisateur)
    ideal_vec  = np.array(embed_ideal_offer(ideal_offer)).reshape(1, -1)

    # Offres réelles → vecteurs lus depuis la BDD
    offer1_vec = np.array(offer1['embedding']).reshape(1, -1)
    offer2_vec = np.array(offer2['embedding']).reshape(1, -1)

    score1 = round(float(cosine_similarity(ideal_vec, offer1_vec)[0][0]) * 100)
    score2 = round(float(cosine_similarity(ideal_vec, offer2_vec)[0][0]) * 100)
    winner = "offer1" if score1 >= score2 else "offer2"

    def build_pros_cons(offer, other):
        pros, cons = [], []
        if offer.get('salary_max') and other.get('salary_max'):
            if offer['salary_max'] > other['salary_max']:
                pros.append(f"Salaire plus élevé ({offer['salary_max']}k€/an)")
            elif offer['salary_max'] < other['salary_max']:
                cons.append(f"Salaire plus bas ({offer['salary_max']}k€/an)")
        if offer.get('remote') and not other.get('remote'):
            pros.append("Télétravail disponible")
        elif not offer.get('remote') and other.get('remote'):
            cons.append("Pas de télétravail")
        if ideal_offer.get('level'):
            if offer.get('level') == ideal_offer['level']:
                pros.append(f"Niveau correspondant ({offer['level']})")
            else:
                cons.append(f"Niveau différent (cherché : {ideal_offer['level']}, proposé : {offer['level']})")
        if ideal_offer.get('contract_type'):
            if offer.get('contract_type') == ideal_offer['contract_type']:
                pros.append(f"Contrat correspondant ({offer['contract_type']})")
            else:
                cons.append(f"Contrat différent ({offer['contract_type']})")
        if ideal_offer.get('location'):
            if ideal_offer['location'].lower() in (offer.get('location') or '').lower():
                pros.append(f"Localisation souhaitée ({offer['location']})")
        return pros, cons

    pros1, cons1 = build_pros_cons(offer1, offer2)
    pros2, cons2 = build_pros_cons(offer2, offer1)

    # On retire l'embedding du résultat (inutile pour le frontend)
    offer1.pop('embedding', None)
    offer2.pop('embedding', None)

    return {
        "winner": winner,
        "offer1": {"pros": pros1, "cons": cons1, "match_score": score1},
        "offer2": {"pros": pros2, "cons": cons2, "match_score": score2},
        "offer1_data": offer1,
        "offer2_data": offer2,
        "ideal_offer": ideal_offer
    }

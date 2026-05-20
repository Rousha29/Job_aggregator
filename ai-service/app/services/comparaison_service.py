import uuid
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.config.db import get_connection
from app.services.embedding_service import embed_ideal_offer


def compare_offers(offer_id_1: str, offer_id_2: str, ideal_offer: dict) -> dict:

    try:
        id1 = str(uuid.UUID(offer_id_1))
        id2 = str(uuid.UUID(offer_id_2))
    except Exception:
        return {"error": "UUID invalide pour une ou plusieurs offres"}

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, title, company, location, contract_type,
               level, salary_min, salary_max, remote, description,
               embedding
        FROM offers
        WHERE id = ANY(%s::uuid[])
        ORDER BY CASE id
            WHEN %s THEN 1
            WHEN %s THEN 2
        END
        """,
        ([id1, id2], id1, id2),
    )

    offers = cursor.fetchall()
    conn.close()

    if len(offers) < 2:
        return {"error": "Une ou plusieurs offres non trouvées"}

    offer1 = dict(offers[0])
    offer2 = dict(offers[1])

    if offer1["embedding"] is None or offer2["embedding"] is None:
        return {"error": "Une ou plusieurs offres ne sont pas encore indexées"}

    ideal_vec = np.array(embed_ideal_offer(ideal_offer)).reshape(1, -1)

    def to_vector(value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except Exception:
                value = []
        return np.array(value, dtype=float).reshape(1, -1)

    offer1_vec = to_vector(offer1["embedding"])
    offer2_vec = to_vector(offer2["embedding"])

    def normalize_text(value: str) -> str:
        return (value or "").lower().strip()

    def has_word_match(text: str, query: str) -> bool:
        text = normalize_text(text)
        query = normalize_text(query)
        if not text or not query:
            return False
        if query in text:
            return True
        for word in query.split():
            if len(word) >= 4 and word in text:
                return True
        return False

    def priority_score(offer: dict) -> float:
        weights = {
            "title": 1.2,
            "contract": 1.4,
            "level": 1.4,
            "location": 1.2,
            "skills": 2.2,
            "description": 1.6,
        }
        total = sum(weights.values())
        score = 0.0

        if ideal_offer.get("title"):
            if has_word_match(offer.get("title", ""), ideal_offer["title"]):
                score += weights["title"]

        if ideal_offer.get("contract_type"):
            if normalize_text(offer.get("contract_type", "")) == normalize_text(
                ideal_offer["contract_type"]
            ):
                score += weights["contract"]

        if ideal_offer.get("level"):
            if normalize_text(offer.get("level", "")) == normalize_text(
                ideal_offer["level"]
            ):
                score += weights["level"]

        if ideal_offer.get("location"):
            if has_word_match(offer.get("location", ""), ideal_offer["location"]):
                score += weights["location"]

        skills = [
            normalize_text(s)
            for s in (ideal_offer.get("skills") or [])
            if normalize_text(s)
        ]
        if skills:
            text_blob = " ".join(
                [
                    normalize_text(offer.get("title", "")),
                    normalize_text(offer.get("company", "")),
                    normalize_text(offer.get("description", "")),
                ]
            )
            matched = sum(1 for s in skills if s in text_blob)
            score += (matched / len(skills)) * weights["skills"]

        if ideal_offer.get("description"):
            if has_word_match(offer.get("description", ""), ideal_offer["description"]):
                score += weights["description"]

        return score / total if total > 0 else 0.0

    sim1 = float(cosine_similarity(ideal_vec, offer1_vec)[0][0])
    sim2 = float(cosine_similarity(ideal_vec, offer2_vec)[0][0])
    sim1 = max(0.0, min(1.0, sim1))
    sim2 = max(0.0, min(1.0, sim2))

    priority1 = priority_score(offer1)
    priority2 = priority_score(offer2)

    # On privilégie les paramètres de l'offre idéale
    score1 = round((priority1 * 70) + (sim1 * 30))
    score2 = round((priority2 * 70) + (sim2 * 30))
    winner = "offer1" if score1 >= score2 else "offer2"

    # ← build_pros_cons est DANS compare_offers, elle voit ideal_offer
    def build_pros_cons(offer, other):
        pros, cons = [], []

        if offer.get("salary_max") and other.get("salary_max"):
            if offer["salary_max"] > other["salary_max"]:
                pros.append(f"Salaire plus élevé ({offer['salary_max']}k€/an)")
            elif offer["salary_max"] < other["salary_max"]:
                cons.append(f"Salaire plus bas ({offer['salary_max']}k€/an)")

        if offer.get("remote") and not other.get("remote"):
            pros.append("Télétravail disponible")
        elif not offer.get("remote") and other.get("remote"):
            cons.append("Pas de télétravail")

        if ideal_offer.get("level"):
            if (offer.get("level") or "").lower() == ideal_offer["level"].lower():
                pros.append(f"Niveau correspondant ({offer['level']})")
            else:
                cons.append(
                    f"Niveau différent (cherché : {ideal_offer['level']}, proposé : {offer['level']})"
                )

        if ideal_offer.get("contract_type"):
            if (offer.get("contract_type") or "").lower() == ideal_offer[
                "contract_type"
            ].lower():
                pros.append(f"Contrat correspondant ({offer['contract_type']})")
            else:
                cons.append(f"Contrat différent ({offer['contract_type']})")

        if ideal_offer.get("location"):
            if ideal_offer["location"].lower() in (offer.get("location") or "").lower():
                pros.append(f"Localisation souhaitée ({offer['location']})")
            else:
                cons.append(f"Localisation différente ({offer['location']})")

        return pros, cons

    def matched_skills(offer: dict) -> list[str]:
        skills_raw = ideal_offer.get("skills") or []
        if not skills_raw:
            return []

        text_blob = " ".join(
            [
                normalize_text(offer.get("title", "")),
                normalize_text(offer.get("company", "")),
                normalize_text(offer.get("description", "")),
            ]
        )
        matched = []
        for skill in skills_raw:
            skill_norm = normalize_text(skill)
            if skill_norm and skill_norm in text_blob:
                matched.append(skill)
        return matched

    # ← ces appels sont APRÈS la définition, pas avant
    pros1, cons1 = build_pros_cons(offer1, offer2)
    pros2, cons2 = build_pros_cons(offer2, offer1)
    matched_skills1 = matched_skills(offer1)
    matched_skills2 = matched_skills(offer2)

    offer1.pop("embedding", None)
    offer2.pop("embedding", None)

    return {
        "winner": winner,
        "offer1": {
            "pros": pros1,
            "cons": cons1,
            "match_score": score1,
            "matched_skills": matched_skills1,
        },
        "offer2": {
            "pros": pros2,
            "cons": cons2,
            "match_score": score2,
            "matched_skills": matched_skills2,
        },
        "offer1_data": offer1,
        "offer2_data": offer2,
        "ideal_offer": ideal_offer,
    }

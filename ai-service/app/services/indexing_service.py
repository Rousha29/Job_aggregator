from app.config.db import get_connection
from app.services.embedding_service import embed_offer
import time
import uuid


def index_all_offers():
    """
    Parcourt toutes les offres sans embedding et les indexe.
    À appeler après chaque ingestion.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Récupérer les offres non indexées
    cursor.execute("""
        SELECT id, title, company, location, 
               contract_type, level, description
        FROM offers
        WHERE embedding IS NULL
        LIMIT 100
    """)

    offers = cursor.fetchall()
    indexed = 0

    for offer in offers:
        try:
            embedding = embed_offer(dict(offer))
            embedding_str = "[" + ",".join(map(str, embedding)) + "]"

            cursor.execute(
                "UPDATE offers SET embedding = %s::vector WHERE id = %s",
                (embedding_str, offer["id"]),
            )
            indexed += 1
            time.sleep(0.1)  # Éviter de surcharger le CPU
        except Exception as e:
            print(f"Erreur indexation offre {offer['id']}: {e}")

    conn.commit()
    conn.close()

    print(f"Indexation : {indexed} offres traitées")
    return {"indexed": indexed}


def index_offer_by_id(offer_id: str) -> dict:
    try:
        offer_uuid = str(uuid.UUID(offer_id))
    except Exception:
        return {"indexed": 0, "error": "UUID invalide"}

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, title, company, location,
               contract_type, level, description, embedding
        FROM offers
        WHERE id = %s
    """,
        (offer_uuid,),
    )

    offer = cursor.fetchone()

    if not offer:
        conn.close()
        return {"indexed": 0, "error": "Offre non trouvée"}

    if offer.get("embedding") is not None:
        conn.close()
        return {"indexed": 0, "skipped": "Déjà indexée"}

    try:
        embedding = embed_offer(dict(offer))
        embedding_str = "[" + ",".join(map(str, embedding)) + "]"
        cursor.execute(
            "UPDATE offers SET embedding = %s::vector WHERE id = %s",
            (embedding_str, offer["id"]),
        )
        conn.commit()
        return {"indexed": 1}
    except Exception as e:
        return {"indexed": 0, "error": str(e)}
    finally:
        conn.close()

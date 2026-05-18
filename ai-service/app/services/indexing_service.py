from app.config.db import get_connection
from app.services.embedding_service import embed_offer
import time

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
            embedding_str = '[' + ','.join(map(str, embedding)) + ']'
            
            cursor.execute(
                "UPDATE offers SET embedding = %s::vector WHERE id = %s",
                (embedding_str, offer['id'])
            )
            indexed += 1
            time.sleep(0.1)  # Éviter de surcharger le CPU
        except Exception as e:
            print(f"Erreur indexation offre {offer['id']}: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"Indexation : {indexed} offres traitées")
    return {'indexed': indexed}
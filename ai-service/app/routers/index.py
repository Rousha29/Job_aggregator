from fastapi import APIRouter
from app.services.indexing_service import index_all_offers

router = APIRouter()

@router.post("/index")
def index_offers():
    result = index_all_offers()
    return result
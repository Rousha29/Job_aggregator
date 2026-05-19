from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.indexing_service import index_all_offers, index_offer_by_id

router = APIRouter()


class OfferIndexRequest(BaseModel):
    offer_id: str


@router.post("/index")
def index_offers():
    result = index_all_offers()
    return result


@router.post("/index/offer")
def index_offer(request: OfferIndexRequest):
    result = index_offer_by_id(request.offer_id)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.comparaison_service import compare_offers

router = APIRouter()


class IdealOffer(BaseModel):
    title: str = ""
    location: str = ""
    contract_type: str = ""
    level: str = ""
    skills: list[str] = []
    description: str = ""


class CompareRequest(BaseModel):
    offer_id_1: str
    offer_id_2: str
    ideal_offer: IdealOffer  # ← était "profile: Profile"


@router.post("/compare")
def compare(request: CompareRequest):
    result = compare_offers(
        request.offer_id_1,
        request.offer_id_2,
        request.ideal_offer.model_dump()  # ← était request.profile
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

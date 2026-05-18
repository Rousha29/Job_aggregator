from fastapi import APIRouter
from pydantic import BaseModel
from app.services.comparaison_service import compare_offers

router = APIRouter()

class Profile(BaseModel):
    level: str = ''
    contract_type: str = ''
    skills: list[str] = []

class CompareRequest(BaseModel):
    offer_id_1: str
    offer_id_2: str
    profile: Profile

@router.post("/compare")
def compare(request: CompareRequest):
    result = compare_offers(
        request.offer_id_1,
        request.offer_id_2,
        request.profile.model_dump()
    )
    return result
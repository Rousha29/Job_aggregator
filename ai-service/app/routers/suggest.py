from fastapi import APIRouter
from pydantic import BaseModel
from app.services.suggestions_service import get_suggestions

router = APIRouter()

class Profile(BaseModel):
    level: str = ''
    contract_type: str = ''
    skills: list[str] = []
    location: str = ''

class SuggestRequest(BaseModel):
    profile: Profile
    limit: int = 5

@router.post("/suggest")
def suggest(request: SuggestRequest):
    suggestions = get_suggestions(
        request.profile.model_dump(),
        request.limit
    )
    return {"suggestions": suggestions}
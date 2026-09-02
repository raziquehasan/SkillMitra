"""AI Chatbot API Routes for SkillMitra."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ai_chatbot_service import AIChatbotService
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging

router = APIRouter()

# Configure logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    """Request model for AI chatbot."""
    message: str = Field(..., description="User's message to the AI assistant")
    context: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Context information like district, sector, role"
    )
    language: Optional[str] = Field(
        default="en",
        description="Language for response (en, hi, mr)"
    )

class ChatResponse(BaseModel):
    """Response model for AI chatbot."""
    answer: str = Field(..., description="AI-generated answer")
    sources: List[str] = Field(default_factory=list, description="Data sources used")
    data_context: Dict[str, Any] = Field(default_factory=dict, description="SkillMitra data context")
    language: str = Field(..., description="Language of the response")
    fallback: Optional[bool] = Field(default=False, description="Whether fallback data was used")
    detected_intent: Optional[str] = Field(default=None, description="Detected query intent")
    detected_district: Optional[str] = Field(default=None, description="Detected district from query")

    model_config = {"extra": "ignore"}


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    AI Chatbot endpoint for SkillMitra.
    
    This endpoint:
    1. Retrieves relevant SkillMitra data from the database
    2. Sends structured context to OpenAI for intelligent response
    3. Returns grounded answers with data sources
    
    Security: OpenAI API key is server-side only, never exposed to client.
    """
    # Validate language
    valid_languages = ["en", "hi", "mr"]
    if request.language not in valid_languages:
        request.language = "en"
    
    # Initialize AI service
    ai_service = AIChatbotService(db)
    
    logger.info(f"Processing chat request: '{request.message}' in language '{request.language}'")
    
    # Generate AI response with SkillMitra data grounding
    response = ai_service.generate_ai_response(
        query=request.message,
        context=request.context,
        language=request.language
    )
    
    return ChatResponse(**response)

@router.get("/health")
async def health_check():
    """Health check endpoint for AI chatbot service."""
    return {
        "status": "ok",
        "service": "skillmitra-ai-chatbot",
        "description": "SkillMitra AI Assistant with data-grounded responses"
    }
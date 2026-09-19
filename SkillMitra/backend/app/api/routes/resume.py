"""
Resume upload and processing endpoints for candidates.
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pathlib import Path
import os

from app.core.database import get_db
from app.core.auth import require_roles
from app.models.identity import User, CandidateProfile, CandidateResume
from app.schemas.resume import (
    ResumeUploadResponse, ResumeProcessingResponse, 
    SkillExtractionResult, ResumeReviewData, 
    SkillConfirmationRequest, SkillConfirmationResponse
)
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/api/v1/candidates/resume", tags=["Candidate Resume"])

# Allowed file types and max size (5MB)
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_resume_file(file: UploadFile) -> tuple[bool, str]:
    """Validate resume file type and size."""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Check file size will be validated during upload
    return True, "Valid"


@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Upload a resume for skill extraction.
    
    Supported formats: PDF, DOCX
    Maximum file size: 5MB
    """
    # Validate file
    is_valid, message = validate_resume_file(file)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404, detail="Candidate profile not found")
    
    # Read file content
    file_content = await file.read()
    file_size = len(file_content)
    
    # Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Store file (in production, use proper storage service)
    upload_dir = Path("uploads/resumes")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / f"{profile.id}_{uuid.uuid4()}{Path(file.filename).suffix}"
    
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save file"
        )
    
    # Create resume record
    resume = CandidateResume(
        candidate_id=profile.id,
        file_name=file.filename,
        file_type=Path(file.filename).suffix.lower().replace(".", ""),
        file_size=file_size,
        file_path=str(file_path),
        processing_status="pending",
        uploaded_at=datetime.now(timezone.utc)
    )
    
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return ResumeUploadResponse(
        id=resume.id,
        candidate_id=resume.candidate_id,
        file_name=resume.file_name,
        file_type=resume.file_type,
        file_size=resume.file_size,
        processing_status=resume.processing_status,
        uploaded_at=resume.uploaded_at,
        message="Resume uploaded successfully. Processing started."
    )


@router.post("/{resume_id}/process", response_model=ResumeProcessingResponse)
async def process_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Process uploaded resume to extract skills, education, and experience.
    """
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404, detail="Candidate profile not found")
    
    # Get resume record
    resume = db.scalar(
        select(CandidateResume).where(
            CandidateResume.id == resume_id,
            CandidateResume.candidate_id == profile.id
        )
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404, detail="Resume not found")
    
    # Update status to processing
    resume.processing_status = "processing"
    db.commit()
    
    try:
        # Process resume using service
        service = ResumeService(db)
        result = service.process_resume(resume)
        
        # Update resume record with results
        resume.processing_status = "completed"
        resume.processed_at = datetime.now(timezone.utc)
        resume.extracted_text = result.get("extracted_text")
        db.commit()
        db.refresh(resume)  # Ensure we have the latest DB state
        
        # Log for debugging
        print(f"Resume {resume.id} processed successfully. Status: {resume.processing_status}")
        
        return ResumeProcessingResponse(
            resume_id=resume.id,
            processing_status=resume.processing_status,
            extracted_skills=result.get("extracted_skills", []),
            extracted_education=result.get("extracted_education", []),
            extracted_experience=result.get("extracted_experience", []),
            processing_error=None,
            message="Resume processed successfully. Please review extracted skills."
        )
        
    except Exception as e:
        # Log the actual error for debugging
        print(f"Resume processing failed for {resume.id}: {str(e)}")
        
        # Update status to failed
        resume.processing_status = "failed"
        resume.processing_error = str(e)
        db.commit()
        db.refresh(resume)  # Ensure we have the latest DB state
        
        return ResumeProcessingResponse(
            resume_id=resume.id,
            processing_status="failed",
            extracted_skills=[],
            extracted_education=[],
            extracted_experience=[],
            processing_error=str(e),
            message=f"Processing failed: {str(e)}. You can continue by adding your skills manually."
        )


@router.get("/{resume_id}/review", response_model=ResumeReviewData)
async def get_resume_review(
    resume_id: uuid.UUID,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Get extracted data for candidate review.
    """
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404, detail="Candidate profile not found")
    
    # Get resume record
    resume = db.scalar(
        select(CandidateResume).where(
            CandidateResume.id == resume_id,
            CandidateResume.candidate_id == profile.id
        )
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404, detail="Resume not found")
    
    # Refresh to ensure we have the latest DB state
    db.refresh(resume)
    
    # Log current status for debugging
    print(f"Resume {resume.id} review request. Current status: {resume.processing_status}")
    
    # Return appropriate response based on processing status
    if resume.processing_status == "completed":
        # Parse extracted data (in real implementation, this would come from structured storage)
        service = ResumeService(db)
        review_data = service.get_review_data(resume)
        
        return ResumeReviewData(
            resume_id=resume.id,
            extracted_skills=review_data.get("extracted_skills", []),
            extracted_education=review_data.get("extracted_education", []),
            extracted_experience=review_data.get("extracted_experience", []),
            candidate_id=profile.id
        )
    elif resume.processing_status == "failed":
        # Return empty data for failed processing
        print(f"Resume {resume.id} processing failed. Error: {resume.processing_error}")
        return ResumeReviewData(
            resume_id=resume.id,
            extracted_skills=[],
            extracted_education=[],
            extracted_experience=[],
            candidate_id=profile.id
        )
    else:
        # Processing or pending - return empty data to allow manual entry
        print(f"Resume {resume.id} still in status: {resume.processing_status}")
        return ResumeReviewData(
            resume_id=resume.id,
            extracted_skills=[],
            extracted_education=[],
            extracted_experience=[],
            candidate_id=profile.id
        )


@router.post("/{resume_id}/confirm-skills", response_model=SkillConfirmationResponse)
async def confirm_skills(
    resume_id: uuid.UUID,
    data: SkillConfirmationRequest,
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    Confirm/reject extracted skills and save to candidate profile.
    """
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404, detail="Candidate profile not found")
    
    # Get resume record
    resume = db.scalar(
        select(CandidateResume).where(
            CandidateResume.id == resume_id,
            CandidateResume.candidate_id == profile.id
        )
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404, detail="Resume not found")
    
    try:
        service = ResumeService(db)
        result = service.confirm_skills(
            profile.id, 
            data.confirmed_skills, 
            data.rejected_skills,
            data.additional_skills
        )
        
        return SkillConfirmationResponse(
            message="Skills confirmed and saved to your profile successfully.",
            confirmed_count=result["confirmed_count"],
            rejected_count=result["rejected_count"],
            added_count=result["added_count"],
            total_skills=result["total_skills"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm skills: {str(e)}"
        )


@router.get("/list")
async def list_resumes(
    current_user: User = Depends(require_roles("candidate")),
    db: Session = Depends(get_db),
):
    """
    List all resumes uploaded by the candidate.
    """
    # Get candidate profile
    profile = db.scalar(
        select(CandidateProfile).where(CandidateProfile.user_id == current_user.id)
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404, detail="Candidate profile not found")
    
    # Get resumes
    resumes = db.scalars(
        select(CandidateResume).where(CandidateResume.candidate_id == profile.id)
        .order_by(CandidateResume.uploaded_at.desc())
    ).all()
    
    return [
        {
            "id": str(resume.id),
            "file_name": resume.file_name,
            "file_type": resume.file_type,
            "file_size": resume.file_size,
            "processing_status": resume.processing_status,
            "uploaded_at": resume.uploaded_at.isoformat() if resume.uploaded_at else None,
            "processed_at": resume.processed_at.isoformat() if resume.processed_at else None
        }
        for resume in resumes
    ]
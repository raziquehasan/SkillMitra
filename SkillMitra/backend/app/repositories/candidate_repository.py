
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.identity import CandidateProfile, CandidateEducationHistory, CandidateCareerInterest


class CandidateRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: uuid.UUID) -> CandidateProfile | None:
        stmt = (
            select(CandidateProfile)
            .where(CandidateProfile.user_id == user_id)
            .options(
                selectinload(CandidateProfile.education_history),
                selectinload(CandidateProfile.career_interests),
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def create_profile(self, user_id: uuid.UUID) -> CandidateProfile:
        profile = CandidateProfile(user_id=user_id)
        self.db.add(profile)
        self.db.flush()
        return profile

    def update_profile(self, profile: CandidateProfile, update_data: dict) -> CandidateProfile:
        for key, value in update_data.items():
            setattr(profile, key, value)
        self.db.flush()
        return profile

    def add_education(self, profile_id: uuid.UUID, data: dict) -> CandidateEducationHistory:
        edu = CandidateEducationHistory(candidate_id=profile_id, **data)
        self.db.add(edu)
        self.db.flush()
        return edu

    def get_education(self, edu_id: uuid.UUID, profile_id: uuid.UUID) -> CandidateEducationHistory | None:
        return self.db.scalar(
            select(CandidateEducationHistory).where(
                CandidateEducationHistory.id == edu_id,
                CandidateEducationHistory.candidate_id == profile_id,
            )
        )

    def delete_education(self, profile_id: uuid.UUID, edu_id: uuid.UUID) -> bool:
        edu = self.get_education(edu_id, profile_id)
        if edu:
            self.db.delete(edu)
            self.db.flush()
            return True
        return False

    def add_interest(self, profile_id: uuid.UUID, data: dict) -> CandidateCareerInterest:
        interest = CandidateCareerInterest(candidate_id=profile_id, **data)
        self.db.add(interest)
        self.db.flush()
        return interest

    def delete_interest(self, profile_id: uuid.UUID, interest_id: uuid.UUID) -> bool:
        obj = self.db.scalar(
            select(CandidateCareerInterest).where(
                CandidateCareerInterest.id == interest_id,
                CandidateCareerInterest.candidate_id == profile_id,
            )
        )
        if obj:
            self.db.delete(obj)
            self.db.flush()
            return True
        return False

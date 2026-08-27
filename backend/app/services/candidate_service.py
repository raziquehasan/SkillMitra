
import uuid
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.repositories.candidate_repository import CandidateRepository
from app.schemas.candidates import CandidateProfileUpdate, CandidateEducationCreate, CandidateInterestCreate
from app.models.career import JobRole, JobRoleSkill


class CandidateService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CandidateRepository(db)

    def get_or_create_profile(self, user_id: uuid.UUID):
        profile = self.repo.get_by_user_id(user_id)
        if not profile:
            profile = self.repo.create_profile(user_id)
            self.db.commit()
            profile = self.repo.get_by_user_id(user_id)
        return profile

    def update_profile(self, user_id: uuid.UUID, update_data: CandidateProfileUpdate):
        profile = self.repo.get_by_user_id(user_id)
        if not profile:
            profile = self.repo.create_profile(user_id)
        self.repo.update_profile(profile, update_data.model_dump(exclude_unset=True))
        self.db.commit()
        return self.repo.get_by_user_id(user_id)

    def add_education(self, user_id: uuid.UUID, edu: CandidateEducationCreate):
        profile = self.get_or_create_profile(user_id)
        new_edu = self.repo.add_education(profile.id, edu.model_dump())
        self.db.commit()
        self.db.refresh(new_edu)
        return new_edu

    def delete_education(self, user_id: uuid.UUID, edu_id: uuid.UUID):
        profile = self.get_or_create_profile(user_id)
        if not self.repo.delete_education(profile.id, edu_id):
            raise HTTPException(status_code=404, detail="Education record not found")
        self.db.commit()

    def add_interest(self, user_id: uuid.UUID, interest: CandidateInterestCreate):
        profile = self.get_or_create_profile(user_id)
        new_i = self.repo.add_interest(profile.id, interest.model_dump())
        self.db.commit()
        self.db.refresh(new_i)
        return new_i

    def delete_interest(self, user_id: uuid.UUID, interest_id: uuid.UUID):
        profile = self.get_or_create_profile(user_id)
        if not self.repo.delete_interest(profile.id, interest_id):
            raise HTTPException(status_code=404, detail="Interest not found")
        self.db.commit()

    def get_skill_gaps(self, user_id: uuid.UUID, job_role_id: uuid.UUID | None):
        from app.schemas.candidates import SkillGapResponse
        profile = self.repo.get_by_user_id(user_id)
        if not profile:
            return []

        cand_skill_ids = {cs.skill_id for cs in getattr(profile, "candidate_skills", [])}
        roles_to_check = [job_role_id] if job_role_id else [i.target_job_role_id for i in profile.career_interests]

        if not roles_to_check:
            return []

        results = []
        for rid in roles_to_check:
            role = self.db.scalar(
                select(JobRole)
                .where(JobRole.id == rid)
                .options(selectinload(JobRole.job_role_skills).selectinload(JobRoleSkill.skill))
            )
            if not role:
                continue
            matched = [str(jrs.skill_id) for jrs in role.job_role_skills if jrs.skill_id in cand_skill_ids]
            missing = [str(jrs.skill_id) for jrs in role.job_role_skills if jrs.skill_id not in cand_skill_ids]
            results.append(SkillGapResponse(
                job_role_id=role.id,
                job_role_title=role.title,
                matched_skill_ids=matched,
                missing_skill_ids=missing,
                proficiency_gaps=[],
            ))
        return results

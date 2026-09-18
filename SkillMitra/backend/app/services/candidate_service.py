
import uuid
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.repositories.candidate_repository import CandidateRepository
from app.schemas.candidates import CandidateProfileUpdate, CandidateEducationCreate, CandidateInterestCreate, SkillVerificationRequest
from app.models.career import JobRole, JobRoleSkill
from app.models.phase4 import CandidateSkill
from app.models.identity import CandidateCareerInterest
from app.models.skills import SkillProficiencyLevel


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

    def calculate_profile_completion(self, profile):
        """
        Calculate profile completion percentage based on:
        - Personal info (25%): name, email, phone, date_of_birth, gender
        - Education (25%): education_level + education_history
        - Career interests (25%): career_interests
        - Skills (25%): candidate_skills
        - Resume (optional, tracked separately)
        """
        from app.models.phase4 import CandidateSkill
        from app.models.resume import CandidateResume
        
        score = 0
        max_score = 100
        
        # Personal info (25 points)
        user = profile.user
        if user.full_name:
            score += 5
        if user.email:
            score += 5
        if user.phone:
            score += 5
        if profile.date_of_birth:
            score += 5
        if profile.gender:
            score += 5
        
        # Education (25 points)
        if profile.education_level:
            score += 10
        if profile.education_history and len(profile.education_history) > 0:
            score += 15
        
        # Career interests (25 points)
        if profile.career_interests and len(profile.career_interests) > 0:
            score += 25
        
        # Skills (25 points)
        from sqlalchemy import func
        skills_count = self.db.scalar(
            select(func.count()).select_from(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
        )
        if skills_count and skills_count > 0:
            score += 25
        
        return round((score / max_score) * 100)

    def get_skill_gaps(self, user_id: uuid.UUID, job_role_id: uuid.UUID | None):
        from app.schemas.candidates import SkillGapResponse
        from app.models.skills import Skill
        profile = self.repo.get_by_user_id(user_id)
        if not profile:
            return []

        candidate_skills = self.db.scalars(
            select(CandidateSkill).where(CandidateSkill.candidate_id == profile.id)
        ).all()
        candidate_by_skill = {candidate_skill.skill_id: candidate_skill for candidate_skill in candidate_skills}
        
        # Get career interests to determine which roles to check
        interests = self.db.scalars(
            select(CandidateCareerInterest).where(CandidateCareerInterest.candidate_id == profile.id)
        ).all()
        roles_to_check = [job_role_id] if job_role_id else [i.target_job_role_id for i in interests]

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
            proficiency_ids = {jrs.proficiency_level_id for jrs in role.job_role_skills}
            proficiency_ids.update(cs.proficiency_level_id for cs in candidate_skills)
            proficiency_rows = self.db.scalars(
                select(SkillProficiencyLevel).where(SkillProficiencyLevel.id.in_(proficiency_ids))
            ).all()
            ranks = {row.id: row.rank_score for row in proficiency_rows}
            names = {row.id: row.name for row in proficiency_rows}
            matched = []
            missing = []
            proficiency_gaps = []
            for requirement in role.job_role_skills:
                candidate_skill = candidate_by_skill.get(requirement.skill_id)
                skill_name = requirement.skill.name if requirement.skill else str(requirement.skill_id)
                if candidate_skill is None:
                    missing.append(skill_name)
                    proficiency_gaps.append({
                        "skill_id": str(requirement.skill_id),
                        "skill_name": skill_name,
                        "required_proficiency": names.get(requirement.proficiency_level_id),
                        "candidate_proficiency": None,
                        "importance": requirement.importance,
                    })
                elif ranks.get(candidate_skill.proficiency_level_id, 0) >= ranks.get(requirement.proficiency_level_id, 0):
                    matched.append(skill_name)
                else:
                    proficiency_gaps.append({
                        "skill_id": str(requirement.skill_id),
                        "skill_name": skill_name,
                        "required_proficiency": names.get(requirement.proficiency_level_id),
                        "candidate_proficiency": names.get(candidate_skill.proficiency_level_id),
                        "importance": requirement.importance,
                    })
            results.append(SkillGapResponse(
                job_role_id=role.id,
                job_role_title=role.title,
                matched_skill_ids=matched,
                missing_skill_ids=missing,
                proficiency_gaps=proficiency_gaps,
            ))
        return results

    def list_skills(self, user_id: uuid.UUID):
        from app.models.skills import Skill, SkillProficiencyLevel
        from sqlalchemy.orm import selectinload
        from app.schemas.candidates import CandidateSkillResponse
        
        profile = self.get_or_create_profile(user_id)
        skills = self.db.scalars(
            select(CandidateSkill)
            .where(CandidateSkill.candidate_id == profile.id)
            .options(
                selectinload(CandidateSkill.skill),
                selectinload(CandidateSkill.proficiency_level)
            )
        ).all()
        
        # Enrich with human-readable names for API response
        result = []
        for skill in skills:
            skill_data = {
                "id": skill.id,
                "candidate_id": skill.candidate_id,
                "skill_id": skill.skill_id,
                "skill_name": skill.skill.name if skill.skill else None,
                "proficiency_level_id": skill.proficiency_level_id,
                "proficiency_level_name": skill.proficiency_level.name if skill.proficiency_level else None,
                "source": skill.source,
                "verification_status": skill.verification_status,
                "last_assessed_date": skill.last_assessed_date,
                "evidence_reference": skill.evidence_reference,
            }
            result.append(CandidateSkillResponse(**skill_data))
        
        return result

    def add_skill(self, user_id: uuid.UUID, data):
        from app.models.skills import Skill, SkillProficiencyLevel
        from sqlalchemy.orm import selectinload
        from app.schemas.candidates import CandidateSkillResponse
        
        profile = self.get_or_create_profile(user_id)
        skill = CandidateSkill(candidate_id=profile.id, **data.model_dump())
        self.db.add(skill)
        self.db.commit()
        self.db.refresh(skill)
        
        # Load relationships for response
        skill_with_relations = self.db.scalar(
            select(CandidateSkill)
            .where(CandidateSkill.id == skill.id)
            .options(
                selectinload(CandidateSkill.skill),
                selectinload(CandidateSkill.proficiency_level)
            )
        )
        
        # Enrich with human-readable names
        skill_data = {
            "id": skill_with_relations.id,
            "candidate_id": skill_with_relations.candidate_id,
            "skill_id": skill_with_relations.skill_id,
            "skill_name": skill_with_relations.skill.name if skill_with_relations.skill else None,
            "proficiency_level_id": skill_with_relations.proficiency_level_id,
            "proficiency_level_name": skill_with_relations.proficiency_level.name if skill_with_relations.proficiency_level else None,
            "source": skill_with_relations.source,
            "verification_status": skill_with_relations.verification_status,
            "last_assessed_date": skill_with_relations.last_assessed_date,
            "evidence_reference": skill_with_relations.evidence_reference,
        }
        return CandidateSkillResponse(**skill_data)

    def update_skill(self, user_id: uuid.UUID, skill_id: uuid.UUID, data):
        from app.models.skills import Skill, SkillProficiencyLevel
        from sqlalchemy.orm import selectinload
        from app.schemas.candidates import CandidateSkillResponse
        
        profile = self.get_or_create_profile(user_id)
        skill = self.db.scalar(
            select(CandidateSkill)
            .where(CandidateSkill.id == skill_id, CandidateSkill.candidate_id == profile.id)
            .options(
                selectinload(CandidateSkill.skill),
                selectinload(CandidateSkill.proficiency_level)
            )
        )
        if not skill:
            raise HTTPException(status_code=404, detail="Candidate skill not found")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(skill, key, value)
        self.db.commit()
        self.db.refresh(skill)
        
        # Enrich with human-readable names
        skill_data = {
            "id": skill.id,
            "candidate_id": skill.candidate_id,
            "skill_id": skill.skill_id,
            "skill_name": skill.skill.name if skill.skill else None,
            "proficiency_level_id": skill.proficiency_level_id,
            "proficiency_level_name": skill.proficiency_level.name if skill.proficiency_level else None,
            "source": skill.source,
            "verification_status": skill.verification_status,
            "last_assessed_date": skill.last_assessed_date,
            "evidence_reference": skill.evidence_reference,
        }
        return CandidateSkillResponse(**skill_data)

    def delete_skill(self, user_id: uuid.UUID, skill_id: uuid.UUID):
        profile = self.get_or_create_profile(user_id)
        skill = self.db.scalar(select(CandidateSkill).where(CandidateSkill.id == skill_id, CandidateSkill.candidate_id == profile.id))
        if not skill:
            raise HTTPException(status_code=404, detail="Candidate skill not found")
        self.db.delete(skill)
        self.db.commit()

    def request_skill_verification(self, user_id: uuid.UUID, skill_id: uuid.UUID, data: SkillVerificationRequest):
        from app.models.skills import Skill, SkillProficiencyLevel
        from sqlalchemy.orm import selectinload
        from app.schemas.candidates import CandidateSkillResponse
        
        profile = self.get_or_create_profile(user_id)
        skill = self.db.scalar(
            select(CandidateSkill)
            .where(CandidateSkill.id == skill_id, CandidateSkill.candidate_id == profile.id)
            .options(
                selectinload(CandidateSkill.skill),
                selectinload(CandidateSkill.proficiency_level)
            )
        )
        if not skill:
            raise HTTPException(status_code=404, detail="Candidate skill not found")
        
        # Update verification status to pending and optionally update evidence
        skill.verification_status = "pending"
        if data.evidence_reference:
            skill.evidence_reference = data.evidence_reference
        if data.last_assessed_date:
            skill.last_assessed_date = data.last_assessed_date
        
        self.db.commit()
        self.db.refresh(skill)
        
        # Enrich with human-readable names
        skill_data = {
            "id": skill.id,
            "candidate_id": skill.candidate_id,
            "skill_id": skill.skill_id,
            "skill_name": skill.skill.name if skill.skill else None,
            "proficiency_level_id": skill.proficiency_level_id,
            "proficiency_level_name": skill.proficiency_level.name if skill.proficiency_level else None,
            "source": skill.source,
            "verification_status": skill.verification_status,
            "last_assessed_date": skill.last_assessed_date,
            "evidence_reference": skill.evidence_reference,
        }
        return CandidateSkillResponse(**skill_data)

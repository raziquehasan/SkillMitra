"""Phase 4 training supply, candidate skills, curriculum, and planning models."""
import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class CandidateSkill(TimestampMixin, Base):
    __tablename__ = "candidate_skills"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skill_proficiency_levels.id", ondelete="RESTRICT"), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False, default="candidate_claim")
    verification_status: Mapped[str] = mapped_column(String(30), nullable=False, default="unverified")
    last_assessed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    evidence_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    __table_args__ = (
        UniqueConstraint("candidate_id", "skill_id", name="uq_candidate_skill"),
        CheckConstraint("verification_status IN ('unverified', 'pending', 'verified')", name="ck_candidate_skills_verification"),
        Index("ix_candidate_skills_candidate_id", "candidate_id"),
        Index("ix_candidate_skills_skill_id", "skill_id"),
    )


class Curriculum(TimestampMixin, Base):
    __tablename__ = "curricula"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    __table_args__ = (UniqueConstraint("course_id", "title", name="uq_curriculum_course_title"),)


class CurriculumVersion(TimestampMixin, Base):
    __tablename__ = "curriculum_versions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    curriculum_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("curricula.id", ondelete="CASCADE"), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    effective_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    effective_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    __table_args__ = (
        UniqueConstraint("curriculum_id", "version_number", name="uq_curriculum_version"),
        CheckConstraint("version_number > 0", name="ck_curriculum_version_positive"),
        CheckConstraint("status IN ('draft', 'active', 'retired')", name="ck_curriculum_version_status"),
    )


class CurriculumSkill(Base):
    __tablename__ = "curriculum_skills"
    curriculum_version_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("curriculum_versions.id", ondelete="CASCADE"), primary_key=True)
    skill_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    proficiency_level_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skill_proficiency_levels.id", ondelete="RESTRICT"), nullable=False)
    importance: Mapped[str] = mapped_column(String(20), nullable=False, default="mandatory")
    sequence_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    __table_args__ = (
        CheckConstraint("importance IN ('mandatory', 'preferred', 'nice_to_have')", name="ck_curriculum_skills_importance"),
        Index("ix_curriculum_skills_skill_id", "skill_id"),
    )


class TrainingProvider(TimestampMixin, Base):
    __tablename__ = "training_providers"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    district_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    provider_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    registration_number: Mapped[str | None] = mapped_column(String(100), nullable=True, unique=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    verification_status: Mapped[str] = mapped_column(String(30), nullable=False, default="unverified")
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    # --- Phase 6.4 Source Fields ---
    source_scheme: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_city: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_sector: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # --- End Phase 6.4 Source Fields ---
    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive', 'suspended')", name="ck_training_providers_status"),
        CheckConstraint("provider_type IS NULL OR provider_type IN ('government', 'private', 'ngo', 'ppp')", name="ck_training_providers_provider_type"),
        CheckConstraint("verification_status IN ('unverified', 'pending_verification', 'verified', 'rejected')", name="ck_training_providers_verification_status"),
    )


class CourseOffering(TimestampMixin, Base):
    __tablename__ = "course_offerings"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("training_providers.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False)
    district_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    sanctioned_seats: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active_seats: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    utilized_seats: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    __table_args__ = (
        UniqueConstraint("provider_id", "course_id", "district_id", name="uq_course_offering_scope"),
        CheckConstraint("sanctioned_seats >= 0 AND active_seats >= 0 AND utilized_seats >= 0", name="ck_course_offering_nonnegative"),
        CheckConstraint("active_seats <= sanctioned_seats", name="ck_course_offering_active_limit"),
        CheckConstraint("utilized_seats <= active_seats", name="ck_course_offering_utilized_limit"),
        CheckConstraint("status IN ('active', 'inactive')", name="ck_course_offering_status"),
        Index("ix_course_offerings_district_id", "district_id"),
    )


class Trainer(TimestampMixin, Base):
    __tablename__ = "trainers"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("training_providers.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    __table_args__ = (CheckConstraint("status IN ('active', 'inactive')", name="ck_trainers_status"), Index("ix_trainers_provider_id", "provider_id"))


class TrainerSkill(Base):
    __tablename__ = "trainer_skills"
    trainer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trainers.id", ondelete="CASCADE"), primary_key=True)
    skill_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    proficiency_level_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skill_proficiency_levels.id", ondelete="RESTRICT"), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(20), nullable=False, default="unverified")
    __table_args__ = (CheckConstraint("verification_status IN ('unverified', 'pending', 'verified')", name="ck_trainer_skills_verification"),)


class Equipment(TimestampMixin, Base):
    __tablename__ = "equipment"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("training_providers.id", ondelete="CASCADE"), nullable=False)
    district_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    available_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    __table_args__ = (
        CheckConstraint("quantity >= 0 AND available_quantity >= 0 AND available_quantity <= quantity", name="ck_equipment_quantities"),
        CheckConstraint("status IN ('active', 'inactive', 'maintenance')", name="ck_equipment_status"),
        Index("ix_equipment_provider_id", "provider_id"),
        Index("ix_equipment_district_id", "district_id"),
    )


class CourseEquipmentRequirement(Base):
    __tablename__ = "course_equipment_requirements"
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)
    equipment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("equipment.id", ondelete="CASCADE"), primary_key=True)
    required_quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    __table_args__ = (CheckConstraint("required_quantity > 0", name="ck_course_equipment_required_positive"),)


class DistrictTrainingPlan(TimestampMixin, Base):
    __tablename__ = "district_training_plans"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    district_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    __table_args__ = (
        UniqueConstraint("district_id", "period_start", "period_end", name="uq_district_training_plan_period"),
        CheckConstraint("period_start <= period_end", name="ck_district_plan_period"),
        CheckConstraint("status IN ('draft', 'approved', 'archived')", name="ck_district_plan_status"),
        Index("ix_district_training_plans_district_id", "district_id"),
    )


class DistrictTrainingPlanItem(Base):
    __tablename__ = "district_training_plan_items"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("district_training_plans.id", ondelete="CASCADE"), nullable=False)
    skill_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="RESTRICT"), nullable=False)
    job_role_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True)
    proficiency_level_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("skill_proficiency_levels.id", ondelete="RESTRICT"), nullable=False)
    course_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    demand_value: Mapped[float | None] = mapped_column(nullable=True)
    supply_value: Mapped[float | None] = mapped_column(nullable=True)
    gap_value: Mapped[float | None] = mapped_column(nullable=True)
    recommended_action: Mapped[str | None] = mapped_column(String(40), nullable=True)
    rationale: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    __table_args__ = (
        CheckConstraint(
            "recommended_action IS NULL OR recommended_action IN ('increase_capacity', 'maintain_capacity', 'reduce_capacity', 'new_course', 'curriculum_update', 'trainer_upskilling', 'equipment_upgrade')",
            name="ck_district_plan_items_recommended_action",
        ),
        CheckConstraint(
            "review_status IS NULL OR review_status IN ('pending_review', 'approved', 'rejected', 'needs_more_evidence')",
            name="ck_district_plan_items_review_status",
        ),
        Index("ix_district_plan_items_plan_id", "plan_id"),
        Index("ix_district_plan_items_skill_id", "skill_id"),
    )

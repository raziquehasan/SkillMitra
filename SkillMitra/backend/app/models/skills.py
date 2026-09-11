"""
Skill taxonomy models:
- skill_proficiency_levels  (reference — BEG/INT/ADV/EXP)
- skill_categories          (reference — Programming, Soft Skills, etc.)
- skills                    (canonical register)
- skill_aliases             (synonyms, globally unique alias)

Phase 2A scope.
Phase 1 source: docs/database/ENTITY_DICTIONARY.md §4
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, utcnow


class SkillProficiencyLevel(Base):
    """
    Central vocabulary for proficiency across the whole system.
    Rows: BEG(1), INT(2), ADV(3), EXP(4).
    All FK references to proficiency_level come here.
    """
    __tablename__ = "skill_proficiency_levels"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    rank_score: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)

    # Back-references (not loaded eagerly)
    job_role_skills: Mapped[list["JobRoleSkill"]] = relationship(
        "JobRoleSkill", back_populates="proficiency_level"
    )
    course_skills: Mapped[list["CourseSkill"]] = relationship(
        "CourseSkill", back_populates="proficiency_level"
    )
    candidate_skills: Mapped[list["CandidateSkill"]] = relationship(
        "CandidateSkill", back_populates="proficiency_level"
    )


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    skills: Mapped[list["Skill"]] = relationship("Skill", back_populates="category")


class Skill(Base):
    """
    Canonical skill register.
    skill_type: 'technical' | 'soft'
    Future: skill_embedding vector(384) will be added in Phase 3 for pgvector.
    """
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skill_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    skill_type: Mapped[str] = mapped_column(String(20), nullable=False)   # technical | soft
    is_emerging: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    # Relationships
    category: Mapped["SkillCategory"] = relationship("SkillCategory", back_populates="skills")
    aliases: Mapped[list["SkillAlias"]] = relationship(
        "SkillAlias", back_populates="skill", cascade="all, delete-orphan"
    )

    job_role_skills: Mapped[list["JobRoleSkill"]] = relationship(
        "JobRoleSkill", back_populates="skill"
    )
    course_skills: Mapped[list["CourseSkill"]] = relationship(
        "CourseSkill", back_populates="skill"
    )
    candidate_skills: Mapped[list["CandidateSkill"]] = relationship(
        "CandidateSkill", back_populates="skill"
    )

    __table_args__ = (
        Index("ix_skills_category_id", "category_id"),
        Index("ix_skills_is_active", "is_active"),
        Index("ix_skills_is_emerging", "is_emerging"),
    )


class SkillAlias(Base):
    """
    Maps synonyms/alternate spellings to a canonical Skill.

    Phase 1 rule: alias must be GLOBALLY UNIQUE — one alias
    cannot point to two different canonical skills.
    Enforced via: UniqueConstraint on alias column.
    """
    __tablename__ = "skill_aliases"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
    )
    alias: Mapped[str] = mapped_column(
        String(150), nullable=False, unique=True   # UNIQUE enforced at DB level
    )

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill", back_populates="aliases")

    __table_args__ = (
        Index("ix_skill_aliases_skill_id", "skill_id"),
    )

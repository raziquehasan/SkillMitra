"""
Resume processing service for text extraction and skill analysis.
"""

import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.identity import CandidateResume, CandidateProfile
from app.models.skills import Skill, SkillProficiencyLevel
from app.models.phase4 import CandidateSkill


class ResumeService:
    """Service for processing resumes and extracting candidate information."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def process_resume(self, resume: CandidateResume) -> Dict[str, Any]:
        """
        Process uploaded resume to extract text and identify skills.
        
        Returns dict with:
        - extracted_text: str
        - extracted_skills: list of dicts
        - extracted_education: list of dicts
        - extracted_experience: list of dicts
        """
        try:
            # Step 1: Extract text from resume file
            print(f"Resume {resume.id}: Starting text extraction...")
            extracted_text = self._extract_text(resume)
            print(f"Resume {resume.id}: Text extracted. Length: {len(extracted_text)}")
            
            # Step 2: Extract skills from text
            print(f"Resume {resume.id}: Starting skill extraction...")
            extracted_skills = self._extract_skills(extracted_text)
            print(f"Resume {resume.id}: Skills extracted. Count: {len(extracted_skills)}")
            
            # Step 3: Extract education information
            print(f"Resume {resume.id}: Starting education extraction...")
            extracted_education = self._extract_education(extracted_text)
            print(f"Resume {resume.id}: Education extracted. Count: {len(extracted_education)}")
            
            # Step 4: Extract work experience
            print(f"Resume {resume.id}: Starting experience extraction...")
            extracted_experience = self._extract_experience(extracted_text)
            print(f"Resume {resume.id}: Experience extracted. Count: {len(extracted_experience)}")
            
            return {
                "extracted_text": extracted_text,
                "extracted_skills": extracted_skills,
                "extracted_education": extracted_education,
                "extracted_experience": extracted_experience
            }
            
        except Exception as e:
            print(f"Resume {resume.id}: Processing failed with error: {str(e)}")
            raise Exception(f"Resume processing failed: {str(e)}")
    
    def _extract_text(self, resume: CandidateResume) -> str:
        """Extract text from resume file based on file type."""
        file_path = Path(resume.file_path) if resume.file_path else None
        
        if not file_path or not file_path.exists():
            raise Exception("Resume file not found")
        
        try:
            if resume.file_type == "pdf":
                return self._extract_pdf_text(file_path)
            elif resume.file_type in ["docx", "doc"]:
                return self._extract_docx_text(file_path)
            else:
                raise Exception(f"Unsupported file type: {resume.file_type}")
        except Exception as e:
            raise Exception(f"Text extraction failed: {str(e)}")
    
    def _extract_pdf_text(self, file_path: Path) -> str:
        """Extract text from PDF file."""
        try:
            # Try to use PyPDF2
            import PyPDF2
            text = ""
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except ImportError:
            # Fallback to simple text extraction if library not available
            raise Exception("PDF text extraction library not available")
        except Exception as e:
            # Log error but don't crash
            print(f"PDF extraction error: {str(e)}")
            raise Exception("Unable to extract text from PDF file")
    
    def _extract_docx_text(self, file_path: Path) -> str:
        """Extract text from DOCX file."""
        try:
            # Try to use python-docx
            import docx
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except ImportError:
            # Fallback message if library not available
            raise Exception("DOCX text extraction library not available")
        except Exception as e:
            # Log error but don't crash
            print(f"DOCX extraction error: {str(e)}")
            raise Exception("Unable to extract text from DOCX file")
    
    def _extract_skills(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract skills from resume text using pattern matching and database lookup.
        
        Returns list of dicts with:
        - skill_name: str
        - confidence: str ("high", "medium", "low")
        - category: str ("technical", "soft", "certification")
        - source_context: str | None
        """
        if not text:
            return []
        
        # Get all skills from database for matching
        skills = self.db.scalars(select(Skill)).all()
        skill_names = {skill.name.lower(): skill for skill in skills}
        
        extracted_skills = []
        text_lower = text.lower()
        
        # Define skill patterns (this is a simplified version - in production, use NLP)
        technical_keywords = [
            "python", "java", "javascript", "react", "node.js", "sql", "mysql", 
            "postgresql", "mongodb", "docker", "kubernetes", "aws", "azure", "gcp",
            "machine learning", "data science", "artificial intelligence", "ai",
            "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
            "react native", "flutter", "android", "ios", "swift", "kotlin",
            "html", "css", "typescript", "angular", "vue.js", "next.js",
            "django", "flask", "spring boot", "express.js", "graphql",
            "git", "github", "gitlab", "ci/cd", "jenkins", "linux", "bash",
            "excel", "power bi", "tableau", "sap", "salesforce", "jira"
        ]
        
        soft_skills = [
            "communication", "leadership", "teamwork", "problem solving",
            "critical thinking", "time management", "adaptability", "creativity",
            "collaboration", "presentation", "negotiation", "mentoring"
        ]
        
        certifications = [
            "aws certified", "google cloud certified", "microsoft certified",
            "pmp", "scrum master", "agile", "six sigma", "itil",
            "ccna", "comptia", "oracle certified", "salesforce certified"
        ]
        
        # Extract technical skills
        for keyword in technical_keywords:
            if keyword in text_lower:
                confidence = "high" if text_lower.count(keyword) >= 2 else "medium"
                
                # Try to match with database skill
                matched_skill = None
                for skill_name, skill in skill_names.items():
                    if keyword in skill_name or skill_name in keyword:
                        matched_skill = skill
                        break
                
                if matched_skill:
                    extracted_skills.append({
                        "skill_id": str(matched_skill.id),
                        "skill_name": matched_skill.name,
                        "confidence": confidence,
                        "category": "technical",
                        "source_context": self._find_context(text, keyword)
                    })
        
        # Extract soft skills
        for keyword in soft_skills:
            if keyword in text_lower:
                confidence = "medium"  # Soft skills are harder to extract confidently
                
                matched_skill = None
                for skill_name, skill in skill_names.items():
                    if keyword in skill_name or skill_name in keyword:
                        matched_skill = skill
                        break
                
                if matched_skill:
                    extracted_skills.append({
                        "skill_id": str(matched_skill.id),
                        "skill_name": matched_skill.name,
                        "confidence": confidence,
                        "category": "soft",
                        "source_context": self._find_context(text, keyword)
                    })
        
        # Extract certifications
        for keyword in certifications:
            if keyword in text_lower:
                confidence = "high"  # Certifications are usually explicit
                
                matched_skill = None
                for skill_name, skill in skill_names.items():
                    if keyword in skill_name or skill_name in keyword:
                        matched_skill = skill
                        break
                
                if matched_skill:
                    extracted_skills.append({
                        "skill_id": str(matched_skill.id),
                        "skill_name": matched_skill.name,
                        "confidence": confidence,
                        "category": "certification",
                        "source_context": self._find_context(text, keyword)
                    })
        
        # Remove duplicates based on skill_id
        seen_skill_ids = set()
        unique_skills = []
        for skill in extracted_skills:
            if skill["skill_id"] not in seen_skill_ids:
                seen_skill_ids.add(skill["skill_id"])
                unique_skills.append(skill)
        
        return unique_skills
    
    def _find_context(self, text: str, keyword: str, context_length: 100) -> str:
        """Find the context around a keyword in the text."""
        text_lower = text.lower()
        index = text_lower.find(keyword.lower())
        if index == -1:
            return None
        
        start = max(0, index - context_length)
        end = min(len(text), index + len(keyword) + context_length)
        return text[start:end].strip()
    
    def _extract_education(self, text: str) -> List[Dict[str, Any]]:
        """Extract education information from resume text."""
        if not text:
            return []
        
        education_entries = []
        
        # Simple pattern matching for education
        education_keywords = ["bachelor", "master", "phd", "mba", "b.tech", "m.tech", "b.e", "m.e", "bsc", "msc"]
        text_lower = text.lower()
        
        for keyword in education_keywords:
            if keyword in text_lower:
                # Find context around the keyword
                context = self._find_context(text, keyword, 150)
                if context:
                    education_entries.append({
                        "degree": keyword,
                        "context": context,
                        "confidence": "medium"
                    })
        
        return education_entries
    
    def _extract_experience(self, text: str) -> List[Dict[str, Any]]:
        """Extract work experience information from resume text."""
        if not text:
            return []
        
        experience_entries = []
        
        # Simple pattern matching for experience indicators
        experience_keywords = ["experience", "worked", "employed", "position", "role", "company"]
        text_lower = text.lower()
        
        for keyword in experience_keywords:
            if keyword in text_lower:
                context = self._find_context(text, keyword, 150)
                if context:
                    experience_entries.append({
                        "type": keyword,
                        "context": context,
                        "confidence": "low"
                    })
        
        return experience_entries
    
    def get_review_data(self, resume: CandidateResume) -> Dict[str, Any]:
        """
        Get review data for candidate confirmation.
        
        Returns dict with extracted information formatted for review.
        """
        print(f"Resume {resume.id}: get_review_data called. extracted_text length: {len(resume.extracted_text) if resume.extracted_text else 0}")
        
        if not resume.extracted_text:
            print(f"Resume {resume.id}: No extracted_text available, returning empty data")
            return {
                "extracted_skills": [],
                "extracted_education": [],
                "extracted_experience": []
            }
        
        # Re-process or use stored extracted data
        # In production, this would come from structured storage
        print(f"Resume {resume.id}: Re-extracting skills from stored text...")
        extracted_skills = self._extract_skills(resume.extracted_text)
        print(f"Resume {resume.id}: Re-extracted skills. Count: {len(extracted_skills)}")
        
        print(f"Resume {resume.id}: Re-extracting education from stored text...")
        extracted_education = self._extract_education(resume.extracted_text)
        print(f"Resume {resume.id}: Re-extracted education. Count: {len(extracted_education)}")
        
        print(f"Resume {resume.id}: Re-extracting experience from stored text...")
        extracted_experience = self._extract_experience(resume.extracted_text)
        print(f"Resume {resume.id}: Re-extracted experience. Count: {len(extracted_experience)}")
        
        return {
            "extracted_skills": extracted_skills,
            "extracted_education": extracted_education,
            "extracted_experience": extracted_experience
        }
    
    def confirm_skills(
        self, 
        candidate_id: uuid.UUID, 
        confirmed_skill_ids: List[uuid.UUID],
        rejected_skill_ids: List[uuid.UUID],
        additional_skills: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """
        Confirm/reject extracted skills and save to candidate profile.
        
        Returns dict with counts:
        - confirmed_count: int
        - rejected_count: int
        - added_count: int
        - total_skills: int
        """
        # Get default proficiency level (Intermediate)
        default_proficiency = self.db.scalar(
            select(SkillProficiencyLevel).where(SkillProficiencyLevel.rank_score == 2)
        )
        
        if not default_proficiency:
            raise Exception("Default proficiency level not found")
        
        confirmed_count = 0
        rejected_count = len(rejected_skill_ids)
        added_count = 0
        
        # Add confirmed skills
        for skill_id in confirmed_skill_ids:
            # Check if skill already exists for candidate
            existing = self.db.scalar(
                select(CandidateSkill).where(
                    CandidateSkill.candidate_id == candidate_id,
                    CandidateSkill.skill_id == skill_id
                )
            )
            
            if not existing:
                candidate_skill = CandidateSkill(
                    candidate_id=candidate_id,
                    skill_id=skill_id,
                    proficiency_level_id=default_proficiency.id,
                    source="resume_extraction",
                    verification_status="unverified"
                )
                self.db.add(candidate_skill)
                confirmed_count += 1
        
        # Add additional skills manually specified by candidate
        for skill_data in additional_skills:
            skill_name = skill_data.get("skill_name")
            if not skill_name:
                continue
            
            # Find or create skill
            skill = self.db.scalar(
                select(Skill).where(Skill.name.ilike(f"%{skill_name}%"))
            )
            
            if not skill:
                # Create new skill (in production, this might need admin approval)
                from app.models.skills import SkillCategory
                default_category = self.db.scalar(
                    select(SkillCategory).where(SkillCategory.name == "General")
                )
                
                skill = Skill(
                    name=skill_name,
                    description=f"Skill added by candidate: {skill_name}",
                    category_id=default_category.id if default_category else None
                )
                self.db.add(skill)
                self.db.flush()
            
            # Check if already exists
            existing = self.db.scalar(
                select(CandidateSkill).where(
                    CandidateSkill.candidate_id == candidate_id,
                    CandidateSkill.skill_id == skill.id
                )
            )
            
            if not existing:
                candidate_skill = CandidateSkill(
                    candidate_id=candidate_id,
                    skill_id=skill.id,
                    proficiency_level_id=default_proficiency.id,
                    source="candidate_claim",
                    verification_status="unverified"
                )
                self.db.add(candidate_skill)
                added_count += 1
        
        self.db.commit()
        
        # Get total skill count
        total_skills = self.db.scalar(
            select(CandidateSkill).where(CandidateSkill.candidate_id == candidate_id).count()
        )
        
        return {
            "confirmed_count": confirmed_count,
            "rejected_count": rejected_count,
            "added_count": added_count,
            "total_skills": total_skills
        }
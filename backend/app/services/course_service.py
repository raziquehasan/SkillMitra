
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func
from app.repositories.course_repository import CourseRepository
from app.models.career import Course, CourseSkill
from app.models.skills import Skill

class CourseService:
    def __init__(self, db: Session):
        self.repo = CourseRepository(db)

    def get_courses(self, skip: int, limit: int):
        return self.repo.get_courses(skip, limit)

    def get_course(self, course_id: uuid.UUID):
        course = self.repo.get_course_detail(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return course

    def get_homepage_courses(self):
        """Get recommended courses for homepage with verified source mappings
        
        Uses verified source/provider mappings rather than deriving URLs from nqr_code.
        Only returns courses with verified URLs. Excludes legacy and typing courses.
        """
        from app.models.geography import District
        from app.models.demand import IndustryDemand
        from sqlalchemy import func
        
        # Verified source mappings based on real official sources
        # These are temporary until proper provider mapping tables are implemented
        VERIFIED_SOURCE_MAPPINGS = {
            # C-DAC PGCP-BDA — Big Data Analytics (RELATED PROGRAMME, not direct provider)
            # For SkillMitra's Data Analytics with Python course, C-DAC PGCP-BDA is a related pathway
            "data analytics": {
                "source_name": "C-DAC ACTS Pune",
                "source_course_code": "PGCP-BDA",
                "source_course_title": "PGCP-BDA — Big Data Analytics",
                "course_url": "https://www.cdac.in/index.aspx?courseid=65&id=DAC",
                "provider_url": "https://www.cdac.in/",
                "provider_name": "C-DAC ACTS Pune",
                "location": "Pashan, Pune",
                "is_related_programme": True  # Indicates this is a related pathway, not direct provider
            },
            # C-DAC PGCP-AI — Artificial Intelligence (DIRECT C-DAC COURSE)
            # Match the exact course title in database: "PG Certificate Programme in Artificial Intelligence (PGCP-AI)"
            "pgcp-ai": {
                "source_name": "C-DAC ACTS Pune",
                "source_course_code": "PGCP-AI",
                "source_course_title": "PG Certificate Programme in Artificial Intelligence (PGCP-AI)",
                "course_url": "https://www.cdac.in/index.aspx?courseid=30&id=DAC",
                "provider_url": "https://www.cdac.in/",
                "provider_name": "C-DAC ACTS Pune",
                "location": "Pashan, Pune",
                "is_related_programme": False  # This is a direct C-DAC course
            },
            "artificial intelligence": {
                "source_name": "C-DAC ACTS Pune",
                "source_course_code": "PGCP-AI",
                "source_course_title": "PG Certificate Programme in Artificial Intelligence (PGCP-AI)",
                "course_url": "https://www.cdac.in/index.aspx?courseid=30&id=DAC",
                "provider_url": "https://www.cdac.in/",
                "provider_name": "C-DAC ACTS Pune",
                "location": "Pashan, Pune",
                "is_related_programme": False
            },
            # Government ITI Aundh Pune — Automotive CNC Machining Technician
            "cnc machining": {
                "source_name": "Government ITI Aundh Pune",
                "source_course_code": "ASC/Q3503",
                "source_course_title": "Automotive CNC Machining Technician",
                "course_url": "https://msbsvet.edu.in/Public/ITIShortTermTraining.aspx",
                "provider_url": "https://msbsvet.edu.in/",
                "provider_name": "Government ITI Aundh Pune",
                "location": "Aundh, Pune",
                "is_listing_url": True  # This is a listing page, not course-specific
            },
            # Maharashtra Government ITI — Solar PV Installer (Suryamitra)
            "solar pv installer": {
                "source_name": "Maharashtra Government ITI",
                "source_course_code": "SGJ/Q0101",
                "source_course_title": "Solar PV Installer (Suryamitra)",
                "course_url": "https://msbsvet.edu.in/Public/ITIShortTermTraining.aspx",
                "provider_url": "https://msbsvet.edu.in/",
                "provider_name": "Maharashtra Government ITI",
                "location": "Multiple locations",
                "is_listing_url": True  # This is a listing page, not course-specific
            }
        }
        
        # Get active courses with skills, excluding legacy and typing courses
        stmt = (
            select(Course)
            .where(
                Course.status == "active",
                ~Course.title.ilike("%legacy%"),
                ~Course.title.ilike("%typing%")
            )
            .options(selectinload(Course.course_skills).selectinload(CourseSkill.skill))
        )
        
        courses = self.repo.db.scalars(stmt).all()
        
        # Calculate demand scores for each course based on industry demand
        course_demand_scores = {}
        for course in courses:
            skill_ids = [cs.skill_id for cs in course.course_skills]
            if skill_ids:
                demand_count = self.repo.db.scalar(
                    select(func.count())
                    .select_from(IndustryDemand)
                    .where(IndustryDemand.skill_id.in_(skill_ids))
                ) or 0
                course_demand_scores[course.id] = demand_count
            else:
                course_demand_scores[course.id] = 0
        
        # Filter courses that have verified source mappings
        verified_courses = []
        for course in courses:
            course_title_lower = course.title.lower()
            
            # Check if this course has a verified mapping
            has_verified_mapping = False
            mapping_info = None
            
            for keyword, mapping in VERIFIED_SOURCE_MAPPINGS.items():
                if keyword in course_title_lower:
                    has_verified_mapping = True
                    mapping_info = mapping
                    break
            
            if has_verified_mapping and mapping_info:
                verified_courses.append((course, mapping_info, course_demand_scores.get(course.id, 0)))
        
        # Sort by demand score (descending), then by duration
        verified_courses.sort(
            key=lambda x: (-x[2], x[0].duration_hours or 0)
        )
        
        # Take top 4
        top_courses = verified_courses[:4]
        
        # Format response
        result = []
        for course, mapping, demand_score in top_courses:
            # Get district name if available
            district_name = None
            if course.district_id:
                district = self.repo.db.scalar(
                    select(District).where(District.id == course.district_id)
                )
                if district:
                    district_name = district.name
            
            # Get skill names
            skill_names = [cs.skill.name for cs in course.course_skills if cs.skill][:5]
            
            # Determine demand level based on score
            if demand_score >= 5:
                demand_level = "High Demand"
            elif demand_score >= 2:
                demand_level = "Growing"
            else:
                demand_level = "Available"
            
            result.append({
                "id": str(course.id),
                "title": course.title,
                "demandLevel": demand_level,
                "district": district_name or mapping.get("location"),
                "skills": skill_names,
                "durationHours": course.duration_hours,
                "courseUrl": mapping["course_url"],  # Verified URL (clean, no tracking params)
                "providerUrl": mapping["provider_url"],  # Verified provider URL
                "providerName": mapping["provider_name"],  # Verified provider name
                "relatedProgrammeName": mapping.get("source_course_title") if mapping.get("is_related_programme") else None,  # Related programme name
                "isRelatedProgramme": mapping.get("is_related_programme", False),  # Distinguish related vs direct
                "isListingUrl": mapping.get("is_listing_url", False)  # Distinguish listing vs course-specific
            })
        
        return result

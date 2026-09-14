#!/usr/bin/env python3
"""Populate course offerings and provider assignments for existing courses."""

import uuid
import random
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.phase4 import TrainingProvider, CourseOffering
from app.models.career import Course
from app.models.geography import District

def populate_course_offerings():
    """Populate course offerings for courses that don't have them using existing providers."""
    db = SessionLocal()
    try:
        # Get all existing training providers
        providers = db.scalars(select(TrainingProvider)).all()
        if not providers:
            print("No training providers found. Please create providers first.")
            return
        
        print(f"Found {len(providers)} existing training providers")
        
        # Build district -> provider mapping
        district_providers = {}
        for provider in providers:
            if provider.district_id not in district_providers:
                district_providers[provider.district_id] = []
            district_providers[provider.district_id].append(provider)
        
        print(f"Providers available in {len(district_providers)} districts")
        
        # Get all active courses
        courses = db.scalars(
            select(Course).where(Course.status == 'active')
        ).all()
        
        print(f"Found {len(courses)} active courses")
        
        # Check which courses already have offerings
        courses_with_offerings = set(
            db.scalars(
                select(CourseOffering.course_id).distinct()
            ).all()
        )
        
        print(f"Courses with existing offerings: {len(courses_with_offerings)}")
        
        # Create offerings for courses that don't have them
        created_count = 0
        for course in courses:
            if course.id not in courses_with_offerings:
                # Use course's district if available, otherwise use first available district
                district_id = course.district_id if course.district_id else list(district_providers.keys())[0]
                
                # Get available providers for this district
                available_providers = district_providers.get(district_id, [])
                
                if available_providers:
                    # Use first available provider
                    provider = available_providers[0]
                    
                    offering = CourseOffering(
                        provider_id=provider.id,
                        course_id=course.id,
                        district_id=district_id,
                        sanctioned_seats=30,
                        active_seats=20,
                        utilized_seats=10,
                        status="active"
                    )
                    db.add(offering)
                    created_count += 1
                    print(f"  Created offering for course: {course.title} with provider: {provider.name}")
                else:
                    print(f"  Warning: No provider found for district {district_id}, skipping course: {course.title}")
        
        db.commit()
        print(f"\nCompleted: Created {created_count} course offerings")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    populate_course_offerings()
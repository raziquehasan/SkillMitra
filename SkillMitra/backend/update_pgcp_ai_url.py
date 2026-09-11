#!/usr/bin/env python
"""Update PGCP-AI course with CDAC URL"""

import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal
from sqlalchemy import text

def main():
    db = SessionLocal()
    try:
        print("=== UPDATE PGCP-AI COURSE URL ===")
        
        # Update PGCP-AI course with CDAC URL
        course_id = "1555a11d-6096-4da4-8e5b-8ca76351d931"
        
        result = db.execute(text("""
            UPDATE courses 
            SET course_url = 'https://cdac.in/index.php',
                provider_url = 'https://cdac.in/index.php'
            WHERE id = :course_id
            RETURNING id, title, course_url, provider_url
        """), {"course_id": course_id}).fetchone()
        
        db.commit()
        
        if result:
            print(f'Updated course: {result[1]}')
            print(f'New Course URL: {result[2]}')
            print(f'New Provider URL: {result[3]}')
        else:
            print('Course not found')
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
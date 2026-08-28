#!/usr/bin/env python
"""
Script to load Phase 6.9 datasets into staging tables.
This script ingests the specified CSV and PDF files into the raw and staging tables
without promoting them to the canonical schema.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the path so imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.staging_ingestion import VerifiedDatasetIngestion
from app.core.database import SessionLocal
from app.models.demand import DataSource # Assuming DataSource exists for linking, even if not used directly
from sqlalchemy import select


def get_or_create_staging_data_source(db_session):
    """
    Gets an existing 'Staging Input' data source or creates one if it doesn't exist.
    """
    staging_source_name = "Staging Input Source - Phase 6.9"
    source = db_session.execute(
        select(DataSource).where(DataSource.name == staging_source_name)
    ).scalar_one_or_none()

    if not source:
        source = DataSource(
            name=staging_source_name,
            source_category="staging_input",
            description="Temporary source for datasets ingested into the staging area during Phase 6.9.",
            source_url="local_filesystem",
            organization="SkillMitra Internal",
            status="active"
        )
        db_session.add(source)
        db_session.flush() # Get the ID
        print(f"Created new staging DataSource: {source.id}")
    else:
        print(f"Found existing staging DataSource: {source.id}")
    return source.id


def main():
    # Define the paths to the source files
    base_db_path = Path("../database") # Relative to the backend directory where the script will run
    csv_file_path = base_db_path / "maharashtra_real_skills_data.csv"
    pdf1_file_path = base_db_path / "Chhatrapati_Sambhajinagar_SkillMitra_Dataset (1).pdf"
    pdf2_file_path = base_db_path / "Mumbai_SkillMitra_Dataset.pdf"

    datasets = [
        (csv_file_path, "MAHARASHTRA_REAL_SKILLS_CSV", "ingest_csv_dataset"),
        (pdf1_file_path, "CHATRAPATI_SAMBHAJINAGAR_PDF", "ingest_pdf_dataset"),
        (pdf2_file_path, "MUMBAI_PDF", "ingest_pdf_dataset"),
    ]

    # Use the database session
    db = SessionLocal()
    try:
        # Get or create the staging data source
        staging_source_id = get_or_create_staging_data_source(db)
        
        ingestion_service = VerifiedDatasetIngestion(session=db, data_source_id=staging_source_id)

        for file_path, label, method_name in datasets:
            if not file_path.exists():
                print(f"ERROR: File {file_path} does not exist.")
                continue

            print(f"Starting ingestion for {file_path.name} with label '{label}'...")
            method = getattr(ingestion_service, method_name)
            result = method(file_path, label, artifact_metadata={"source_url": "local_filesystem", "is_official": False})
            print(f"Finished ingestion for {file_path.name}. Result: {result}")
            print("-" * 20)

        # Commit the transaction to persist the data
        db.commit()
        print("All datasets ingested and committed to staging tables.")

    except Exception as e:
        print(f"An error occurred during ingestion: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
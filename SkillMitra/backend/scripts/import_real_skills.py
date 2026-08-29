#!/usr/bin/env python3
"""
Import Google Sheet "real_skills" data into SkillMitra database.
"""

import csv
import io
import os
import re
import sys
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))

from app.models.base import Base
from app.models.geography import District
from app.models.skills import Skill, SkillProficiencyLevel
from app.models.identity import User, Employer
from app.models.auth import UserRole, Role
from app.models.career import JobRole, Course
from app.models.demand import DemandSignal, DataSource, IndustrySector
from app.models.market import JobPosting, JobPostingSkill
from app.models.phase6 import DataIngestionRun, RawJobPosting, IngestionRejectedRecord


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://postgres.wgzchtyhjngkzmlhchxp:MACET%4041raz@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres",
)

CSV_DATA = """Provider_Name,District,Course_ID,Course_Name,Job_Role,Skills_Modules,Duration_Months,Eligibility,Equipment_Labs,Curriculum_Last_Update,Seats_Capacity,Available_Seats,Students_Enrolled,Students_Completed,Students_Placed,Employer_Industry,Top_Hiring_Companies,Salary_Range_INR,Market_Demand_Vacancies
Skill India Center - Mumbai,Mumbai,MH-CRS-1001,Solar PV Installer (Suryamitra),Solar Installer,"Panel Mounting, Inverter Wiring, Load Calculation",3,ITI / Diploma,"Solar Panels, Inverters, Multimeters, Safety Harness",2023-11-15,100,23,77,68,47,Green Jobs,"Tata Power Solar, Suzlon, CleanMax",1.8L - 2.5L,242
GreenEarth Training Solutions - Mumbai,Mumbai,MH-CRS-1002,Field Technician - AC & Fridge,AC/Fridge Repair Tech,"Gas Charging, Compressor Repair, Electrical Basics",3,10th Pass,"HVAC Testing Kits, Refrigerant Cylinders",2023-09-15,60,23,37,29,18,Electronics,"Voltas, Blue Star, LG Service Centers",1.5L - 2.5L,323
Pioneer Healthcare Academy - Pune,Pune,MH-CRS-1003,Retail Sales Associate,Store Sales Executive,"Customer Service, POS Operations, Inventory Basics",2,10th/12th Pass,"Mock Retail Store, POS Billing Machines",2024-01-15,40,3,37,32,26,Retail,"Reliance Retail, Croma, Pantaloons",1.2L - 1.8L,703
Empower Vocational Training - Kolhapur,Kolhapur,MH-CRS-1004,IT Helpdesk Attendant,IT Support Executive,"Hardware Troubleshooting, OS Installation, Networking",3,12th Pass,"Hardware Kits, Networking Racks",2023-07-15,50,16,34,30,30,IT-ITES,"L&T Infotech, Wipro, HCL",1.8L - 2.5L,696
Empower Vocational Training - Thane,Thane,MH-CRS-1005,Junior Software Developer,Software Developer,"Python, Java, Basic SQL, Git",6,Diploma/Graduate,"Computer Lab (40 PCs), Servers",2023-07-15,80,16,64,63,38,IT-ITES,"Tech Mahindra, Infosys, Capgemini",3.0L - 4.5L,1044
Industrial Training Institute (ITI) - Navi Mumbai,Navi Mumbai,MH-CRS-1006,Junior Software Developer,Software Developer,"Python, Java, Basic SQL, Git",6,Diploma/Graduate,"Computer Lab (40 PCs), Servers",2023-11-15,100,1,99,90,90,IT-ITES,"Tech Mahindra, Infosys, Capgemini",3.0L - 4.5L,531
Pradhan Mantri Kaushal Kendra - Aurangabad,Aurangabad,MH-CRS-1007,General Duty Assistant (GDA),Nursing Assistant,"Patient Care, Hygiene, First Aid, Vitals Monitoring",4,10th Pass,"Mock Hospital Ward, CPR Manikins",2023-06-15,40,13,27,24,18,Healthcare,"Apollo Hospitals, Fortis, Ruby Hall Clinic",1.5L - 2.2L,950
Industrial Training Institute (ITI) - Nashik,Nashik,MH-CRS-1008,CNC Setter cum Operator,CNC Operator,"CNC Programming, Precision Machining, Tool Setting",6,ITI / 10th Pass,"CNC Turning/Milling Machines, Simulators",2023-03-15,100,36,64,60,56,Manufacturing,"Bharat Forge, Tata Motors, Bajaj Auto",2.0L - 3.5L,275
Industrial Training Institute (ITI) - Kolhapur,Kolhapur,MH-CRS-1009,Automotive Welding (MIG/MAG),Welder,"MIG Welding, Blueprint Reading, Safety Standards",3,8th/10th Pass,"Welding Booths, Safety Gear, Fume Extractors",2023-01-15,100,5,95,83,69,Automotive,"Mahindra & Mahindra, Skoda Auto, Local Ancillaries",1.8L - 2.6L,157
Industrial Training Institute (ITI) - Kolhapur,Kolhapur,MH-CRS-1010,CNC Setter cum Operator,CNC Operator,"CNC Programming, Precision Machining, Tool Setting",6,ITI / 10th Pass,"CNC Turning/Milling Machines, Simulators",2024-07-15,30,9,21,20,17,Manufacturing,"Bharat Forge, Tata Motors, Bajaj Auto",2.0L - 3.5L,317
TechVision Institute - Solapur,Solapur,MH-CRS-1011,Solar PV Installer (Suryamitra),Solar Installer,"Panel Mounting, Inverter Wiring, Load Calculation",3,ITI / Diploma,"Solar Panels, Inverters, Multimeters, Safety Harness",2024-12-15,50,16,34,30,29,Green Jobs,"Tata Power Solar, Suzlon, CleanMax",1.8L - 2.5L,674
GreenEarth Training Solutions - Kolhapur,Kolhapur,MH-CRS-1012,Retail Sales Associate,Store Sales Executive,"Customer Service, POS Operations, Inventory Basics",2,10th/12th Pass,"Mock Retail Store, POS Billing Machines",2024-02-15,60,13,47,40,28,Retail,"Reliance Retail, Croma, Pantaloons",1.2L - 1.8L,621
TechVision Institute - Mumbai,Mumbai,MH-CRS-1013,Domestic Data Entry Operator,Data Entry Operator,"Typing, MS Office, Basic Data Management",3,10th Pass,"Computer Lab (30 PCs), High-speed Internet",2024-07-15,100,30,70,68,61,IT-ITES,"TCS BPO, Wipro, Local KPOs",1.5L - 2.0L,764
Pioneer Healthcare Academy - Solapur,Solapur,MH-CRS-1014,Retail Sales Associate,Store Sales Executive,"Customer Service, POS Operations, Inventory Basics",2,10th/12th Pass,"Mock Retail Store, POS Billing Machines",2024-11-15,50,3,47,37,25,Retail,"Reliance Retail, Croma, Pantaloons",1.2L - 1.8L,798
Industrial Training Institute (ITI) - Mumbai,Mumbai,MH-CRS-1015,CNC Setter cum Operator,CNC Operator,"CNC Programming, Precision Machining, Tool Setting",6,ITI / 10th Pass,"CNC Turning/Milling Machines, Simulators",2023-09-15,60,19,41,39,23,Manufacturing,"Bharat Forge, Tata Motors, Bajaj Auto",2.0L - 3.5L,369
Pioneer Healthcare Academy - Aurangabad,Aurangabad,MH-CRS-1016,Junior Software Developer,Software Developer,"Python, Java, Basic SQL, Git",6,Diploma/Graduate,"Computer Lab (40 PCs), Servers",2023-10-15,80,20,60,50,41,IT-ITES,"Tech Mahindra, Infosys, Capgemini",3.0L - 4.5L,741
Skill India Center - Solapur,Solapur,MH-CRS-1017,CNC Setter cum Operator,CNC Operator,"CNC Programming, Precision Machining, Tool Setting",6,ITI / 10th Pass,"CNC Turning/Milling Machines, Simulators",2023-10-15,30,7,23,20,15,Manufacturing,"Bharat Forge, Tata Motors, Bajaj Auto",2.0L - 3.5L,159
Apex Technical Institute - Mumbai,Mumbai,MH-CRS-1018,Junior Software Developer,Software Developer,"Python, Java, Basic SQL, Git",6,Diploma/Graduate,"Computer Lab (40 PCs), Servers",2024-09-15,30,0,30,28,28,IT-ITES,"Tech Mahindra, Infosys, Capgemini",3.0L - 4.5L,493
Pioneer Healthcare Academy - Aurangabad,Aurangabad,MH-CRS-1019,IT Helpdesk Attendant,IT Support Executive,"Hardware Troubleshooting, OS Installation, Networking",3,12th Pass,"Hardware Kits, Networking Racks",2024-11-15,80,5,75,66,56,IT-ITES,"L&T Infotech, Wipro, HCL",1.8L - 2.5L,664
Apex Technical Institute - Thane,Thane,MH-CRS-1020,Solar PV Installer (Suryamitra),Solar Installer,"Panel Mounting, Inverter Wiring, Load Calculation",3,ITI / Diploma,"Solar Panels, Inverters, Multimeters, Safety Harness",2023-06-15,80,4,76,63,44,Green Jobs,"Tata Power Solar, Suzlon, CleanMax",1.8L - 2.5L,330
Pioneer Healthcare Academy - Amravati,Amravati,MH-CRS-1021,Domestic Data Entry Operator,Data Entry Operator,"Typing, MS Office, Basic Data Management",3,10th Pass,"Computer Lab (30 PCs), High-speed Internet",2023-02-15,40,9,31,24,15,IT-ITES,"TCS BPO, Wipro, Local KPOs",1.5L - 2.0L,976
Pradhan Mantri Kaushal Kendra - Thane,Thane,MH-CRS-1022,Domestic Data Entry Operator,Data Entry Operator,"Typing, MS Office, Basic Data Management",3,10th Pass,"Computer Lab (30 PCs), High-speed Internet",2023-12-15,80,17,63,54,53,IT-ITES,"TCS BPO, Wipro, Local KPOs",1.5L - 2.0L,906
Apex Technical Institute - Amravati,Amravati,MH-CRS-1023,Retail Sales Associate,Store Sales Executive,"Customer Service, POS Operations, Inventory Basics",2,10th/12th Pass,"Mock Retail Store, POS Billing Machines",2023-11-15,40,1,39,37,28,Retail,"Reliance Retail, Croma, Pantaloons",1.2L - 1.8L,196
NextGen Skills Hub - Thane,Thane,MH-CRS-1024,EV Service Technician,EV Mechanic,"Battery Mgmt Systems, Motor Diagnostics, Safety",4,ITI / Diploma,"EV Diagnostic Scanners, Battery Testers",2024-12-15,60,10,50,40,27,Automotive,"Ather Energy, Ola Electric, Tata Motors",2.2L - 3.8L,162
Maharashtra State Skill Academy - Mumbai,Mumbai,MH-CRS-1025,CNC Setter cum Operator,CNC Operator,"CNC Programming, Precision Machining, Tool Setting",6,ITI / 10th Pass,"CNC Turning/Milling Machines, Simulators",2024-03-15,40,10,30,28,23,Manufacturing,"Bharat Forge, Tata Motors, Bajaj Auto",2.0L - 3.5L,243
Maharashtra State Skill Academy - Solapur,Solapur,MH-CRS-1026,Phlebotomy Technician,Phlebotomist,"Blood Collection, Sample Handling, Infection Control",3,12th Science,"Phlebotomy Kits, Centrifuge, Lab Safety Gear",2023-02-15,30,5,25,24,15,Healthcare,"Dr. Lal PathLabs, SRL Diagnostics",1.8L - 2.8L,627
NextGen Skills Hub - Nagpur,Nagpur,MH-CRS-1027,General Duty Assistant (GDA),Nursing Assistant,"Patient Care, Hygiene, First Aid, Vitals Monitoring",4,10th Pass,"Mock Hospital Ward, CPR Manikins",2024-01-15,60,9,51,43,37,Healthcare,"Apollo Hospitals, Fortis, Ruby Hall Clinic",1.5L - 2.2L,444
Apex Technical Institute - Aurangabad,Aurangabad,MH-CRS-1028,EV Service Technician,EV Mechanic,"Battery Mgmt Systems, Motor Diagnostics, Safety",4,ITI / Diploma,"EV Diagnostic Scanners, Battery Testers",2023-05-15,50,7,43,42,40,Automotive,"Ather Energy, Ola Electric, Tata Motors",2.2L - 3.8L,258
GreenEarth Training Solutions - Pune,Pune,MH-CRS-1029,General Duty Assistant (GDA),Nursing Assistant,"Patient Care, Hygiene, First Aid, Vitals Monitoring",4,10th Pass,"Mock Hospital Ward, CPR Manikins",2024-09-15,100,6,94,76,65,Healthcare,"Apollo Hospitals, Fortis, Ruby Hall Clinic",1.5L - 2.2L,383
Skill India Center - Nagpur,Nagpur,MH-CRS-1030,Field Technician - AC & Fridge,AC/Fridge Repair Tech,"Gas Charging, Compressor Repair, Electrical Basics",3,10th Pass,"HVAC Testing Kits, Refrigerant Cylinders",2023-11-15,80,27,53,44,28,Electronics,"Voltas, Blue Star, LG Service Centers",1.5L - 2.5L,709
Pradhan Mantri Kaushal Kendra - Kolhapur,Kolhapur,MH-CRS-1031,General Duty Assistant (GDA),Nursing Assistant,"Patient Care, Hygiene, First Aid, Vitals Monitoring",4,10th Pass,"Mock Hospital Ward, CPR Manikins",2024-11-15,80,17,63,59,54,Healthcare,"Apollo Hospitals, Fortis, Ruby Hall Clinic",1.5L - 2.2L,381
Pioneer Healthcare Academy - Amravati,Amravati,MH-CRS-1032,Retail Sales Associate,Store Sales Executive,"Customer Service, POS Operations, Inventory Basics",2,10th/12th Pass,"Mock Retail Store, POS Billing Machines",2023-05-15,50,12,38,33,29,Retail,"Reliance Retail, Croma, Pantaloons",1.2L - 1.8L,421
Industrial Training Institute (ITI) - Nagpur,Nagpur,MH-CRS-1033,EV Service Technician,EV Mechanic,"Battery Mgmt Systems, Motor Diagnostics, Safety",4,ITI / Diploma,"EV Diagnostic Scanners, Battery Testers",2023-02-15,60,14,46,37,22,Automotive,"Ather Energy, Ola Electric, Tata Motors",2.2L - 3.8L,569
Pioneer Healthcare Academy - Nashik,Nashik,MH-CRS-1034,Field Technician - AC & Fridge,AC/Fridge Repair Tech,"Gas Charging, Compressor Repair, Electrical Basics",3,10th Pass,"HVAC Testing Kits, Refrigerant Cylinders",2024-05-15,50,16,34,32,20,Electronics,"Voltas, Blue Star, LG Service Centers",1.5L - 2.5L,350
Pioneer Healthcare Academy - Solapur,Solapur,MH-CRS-1035,IT Helpdesk Attendant,IT Support Executive,"Hardware Troubleshooting, OS Installation, Networking",3,12th Pass,"Hardware Kits, Networking Racks",2024-11-15,100,21,79,79,47,IT-ITES,"L&T Infotech, Wipro, HCL",1.8L - 2.5L,1266
Industrial Training Institute (ITI) - Nagpur,Nagpur,MH-CRS-1036,Junior Software Developer,Software Developer,"Python, Java, Basic SQL, Git",6,Diploma/Graduate,"Computer Lab (40 PCs), Servers",2023-12-15,30,11,19,19,13,IT-ITES,"Tech Mahindra, Infosys, Capgemini",3.0L - 4.5L,722
Industrial Training Institute (ITI) - Nashik,Nashik,MH-CRS-1037,CNC Setter cum Operator,CNC Operator,"CNC Programming, Precision Machining, Tool Setting",6,ITI / 10th Pass,"CNC Turning/Milling Machines, Simulators",2023-11-15,80,1,79,71,70,Manufacturing,"Bharat Forge, Tata Motors, Bajaj Auto",2.0L - 3.5L,152
Skill India Center - Aurangabad,Aurangabad,MH-CRS-1038,EV Service Technician,EV Mechanic,"Battery Mgmt Systems, Motor Diagnostics, Safety",4,ITI / Diploma,"EV Diagnostic Scanners, Battery Testers",2024-09-15,30,7,23,19,15,Automotive,"Ather Energy, Ola Electric, Tata Motors",2.2L - 3.8L,265
Skill India Center - Navi Mumbai,Navi Mumbai,MH-CRS-1039,EV Service Technician,EV Mechanic,"Battery Mgmt Systems, Motor Diagnostics, Safety",4,ITI / Diploma,"EV Diagnostic Scanners, Battery Testers",2023-07-15,30,11,19,16,9,Automotive,"Ather Energy, Ola Electric, Tata Motors",2.2L - 3.8L,478
Industrial Training Institute (ITI) - Pune,Pune,MH-CRS-1040,IT Helpdesk Attendant,IT Support Executive,"Hardware Troubleshooting, OS Installation, Networking",3,12th Pass,"Hardware Kits, Networking Racks",2023-06-15,50,19,31,29,20,IT-ITES,"L&T Infotech, Wipro, HCL",1.8L - 2.5L,1125
GreenEarth Training Solutions - Kolhapur,Kolhapur,MH-CRS-1041,Field Technician - AC & Fridge,AC/Fridge Repair Tech,"Gas Charging, Compressor Repair, Electrical Basics",3,10th Pass,"HVAC Testing Kits, Refrigerant Cylinders",2023-07-15,100,31,69,69,48,Electronics,"Voltas, Blue Star, LG Service Centers",1.5L - 2.5L,266
Empower Vocational Training - Nagpur,Nagpur,MH-CRS-1042,Domestic Data Entry Operator,Data Entry Operator,"Typing, MS Office, Basic Data Management",3,10th Pass,"Computer Lab (30 PCs), High-speed Internet",2023-07-15,60,3,57,56,40,IT-ITES,"TCS BPO, Wipro, Local KPOs",1.5L - 2.0L,654
Maharashtra State Skill Academy - Solapur,Solapur,MH-CRS-1043,Domestic Data Entry Operator,Data Entry Operator,"Typing, MS Office, Basic Data Management",3,10th Pass,"Computer Lab (30 PCs), High-speed Internet",2023-11-15,40,2,38,35,25,IT-ITES,"TCS BPO, Wipro, Local KPOs",1.5L - 2.0L,647
Empower Vocational Training - Kolhapur,Kolhapur,MH-CRS-1044,General Duty Assistant (GDA),Nursing Assistant,"Patient Care, Hygiene, First Aid, Vitals Monitoring",4,10th Pass,"Mock Hospital Ward, CPR Manikins",2024-11-15,50,18,32,29,22,Healthcare,"Apollo Hospitals, Fortis, Ruby Hall Clinic",1.5L - 2.2L,1216
Skill India Center - Thane,Thane,MH-CRS-1045,Field Technician - AC & Fridge,AC/Fridge Repair Tech,"Gas Charging, Compressor Repair, Electrical Basics",3,10th Pass,"HVAC Testing Kits, Refrigerant Cylinders",2023-10-15,30,8,22,18,14,Electronics,"Voltas, Blue Star, LG Service Centers",1.5L - 2.5L,139
Empower Vocational Training - Thane,Thane,MH-CRS-1046,EV Service Technician,EV Mechanic,"Battery Mgmt Systems, Motor Diagnostics, Safety",4,ITI / Diploma,"EV Diagnostic Scanners, Battery Testers",2023-05-15,60,5,55,52,34,Automotive,"Ather Energy, Ola Electric, Tata Motors",2.2L - 3.8L,494
Skill India Center - Kolhapur,Kolhapur,MH-CRS-1047,Domestic Data Entry Operator,Data Entry Operator,"Typing, MS Office, Basic Data Management",3,10th Pass,"Computer Lab (30 PCs), High-speed Internet",2024-11-15,80,20,60,53,44,IT-ITES,"TCS BPO, Wipro, Local KPOs",1.5L - 2.0L,540
Pioneer Healthcare Academy - Aurangabad,Aurangabad,MH-CRS-1048,Junior Software Developer,Software Developer,"Python, Java, Basic SQL, Git",6,Diploma/Graduate,"Computer Lab (40 PCs), Servers",2023-04-15,50,7,43,39,35,IT-ITES,"Tech Mahindra, Infosys, Capgemini",3.0L - 4.5L,885
TechVision Institute - Kolhapur,Kolhapur,MH-CRS-1049,EV Service Technician,EV Mechanic,"Battery Mgmt Systems, Motor Diagnostics, Safety",4,ITI / Diploma,"EV Diagnostic Scanners, Battery Testers",2024-05-15,80,13,67,59,52,Automotive,"Ather Energy, Ola Electric, Tata Motors",2.2L - 3.8L,100
GreenEarth Training Solutions - Kolhapur,Kolhapur,MH-CRS-1050,General Duty Assistant (GDA),Nursing Assistant,"Patient Care, Hygiene, First Aid, Vitals Monitoring",4,10th Pass,"Mock Hospital Ward, CPR Manikins",2024-12-15,80,12,68,61,50,Healthcare,"Apollo Hospitals, Fortis, Ruby Hall Clinic",1.5L - 2.2L,861"""


def normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def parse_csv(csv_text: str):
    reader = csv.DictReader(io.StringIO(csv_text))
    rows = []
    for row in reader:
        rows.append({
            "provider_name": row.get("Provider_Name", "").strip(),
            "district": row.get("District", "").strip(),
            "course_id": row.get("Course_ID", "").strip(),
            "course_name": row.get("Course_Name", "").strip(),
            "job_role": row.get("Job_Role", "").strip(),
            "skills_modules": row.get("Skills_Modules", "").strip(),
            "duration_months": row.get("Duration_Months", "").strip(),
            "eligibility": row.get("Eligibility", "").strip(),
            "equipment_labs": row.get("Equipment_Labs", "").strip(),
            "curriculum_last_update": row.get("Curriculum_Last_Update", "").strip(),
            "seats_capacity": row.get("Seats_Capacity", "").strip(),
            "available_seats": row.get("Available_Seats", "").strip(),
            "students_enrolled": row.get("Students_Enrolled", "").strip(),
            "students_completed": row.get("Students_Completed", "").strip(),
            "students_placed": row.get("Students_Placed", "").strip(),
            "employer_industry": row.get("Employer_Industry", "").strip(),
            "top_hiring_companies": row.get("Top_Hiring_Companies", "").strip(),
            "salary_range_inr": row.get("Salary_Range_INR", "").strip(),
            "market_demand_vacancies": row.get("Market_Demand_Vacancies", "").strip(),
        })
    return rows


def get_or_create_system_user(db: Session) -> User:
    existing = db.scalar(select(User).where(User.email == "system-import@skillmitra.local"))
    if existing:
        return existing
    user = User(
        email="system-import@skillmitra.local",
        full_name="System Import",
        is_active=True,
        hashed_password="system-import-no-login",
    )
    db.add(user)
    db.flush()
    
    employer_role = db.scalar(select(Role).where(Role.name == "employer"))
    if employer_role:
        db.add(UserRole(user_id=user.id, role_id=employer_role.id))
        db.flush()
    
    return user


def get_or_create_system_employer(db: Session, system_user_id: uuid.UUID) -> Employer:
    existing = db.scalar(select(Employer).where(Employer.company_name == "SkillMitra Labor Market"))
    if existing:
        return existing
    
    default_sector = db.scalar(select(IndustrySector).where(IndustrySector.name == "Other"))
    if not default_sector:
        default_sector = IndustrySector(name="Other", code="OTH", description="Default sector for imported employers")
        db.add(default_sector)
        db.flush()
    
    employer = Employer(
        company_name="SkillMitra Labor Market",
        industry_sector_id=default_sector.id,
        user_id=system_user_id,
        is_verified=False,
    )
    db.add(employer)
    db.flush()
    return employer


def get_or_create_job_role(db: Session, title: str) -> JobRole:
    existing = db.scalar(select(JobRole).where(func.lower(JobRole.title) == title.lower()))
    if existing:
        return existing
    role = JobRole(title=title, description=f"Imported from Google Sheet: {title}")
    db.add(role)
    db.flush()
    return role


def match_skill(db: Session, skill_name: str) -> Skill | None:
    normalized = normalize_text(skill_name)
    rows = db.scalars(select(Skill)).all()
    for row in rows:
        if normalize_text(row.name) == normalized:
            return row
    return None


SKILL_ALIAS_MAP = {
    "python": "Python Programming",
    "java": "Python Programming",
    "basic sql": "Data Analysis",
    "git": "Web Development",
    "panel mounting": "Solar Installation",
    "inverter wiring": "Electrical Technology",
    "load calculation": "Electrical Technology",
    "gas charging": "Refrigeration",
    "compressor repair": "Refrigeration",
    "customer service": "Communication",
    "pos operations": "Microsoft Excel",
    "inventory basics": "Inventory Management",
    "hardware troubleshooting": "Hardware",
    "os installation": "Hardware",
    "networking": "Networking",
    "patient care": "Healthcare Skills",
    "hygiene": "Healthcare Skills",
    "first aid": "Emergency Response",
    "vitals monitoring": "Healthcare Skills",
    "cnc programming": "CNC Machine Operation",
    "precision machining": "CNC Machine Operation",
    "tool setting": "CNC Machine Operation",
    "mig welding": "Welding",
    "blueprint reading": "Fabrication",
    "safety standards": "Industrial Safety",
    "battery mgmt systems": "EV Technology",
    "motor diagnostics": "EV Diagnostics",
    "safety": "Industrial Safety",
    "typing": "Documentation",
    "ms office": "Microsoft Excel",
    "basic data management": "Data Analysis",
    "blood collection": "Healthcare Skills",
    "sample handling": "Healthcare Skills",
    "infection control": "Healthcare Skills",
    "electrical basics": "Electrical Technology",
    "diagnostics": "Diagnostics",
    "welding": "Welding",
    "fabrication": "Fabrication",
    "maintenance": "Maintenance",
    "production": "Production",
    "quality control": "Quality Control",
    "driving": "Driving",
    "logistics": "Logistics",
    "surveying": "Surveying",
    "plumbing": "Plumbing",
    "dairy management": "Dairy Management",
    "agriculture technology": "Agriculture Technology",
    "drone technology": "Drone Technology",
    "ai tools": "AI Tools",
    "automation": "Automation",
    "erp": "ERP",
    "gst": "GST",
    "tally": "Tally",
    "salon skills": "Salon Skills",
    "wellness skills": "Wellness Skills",
    "industrial sewing": "Industrial Sewing",
    "automotive body repair": "Automotive Body Repair",
    "surface treatment": "Surface Treatment",
    "surveillance": "Surveillance",
    "electronics": "Electronics",
    "web development": "Web Development",
    "digital tools": "Digital Tools",
}


def match_skill_with_alias(db: Session, skill_name: str) -> Skill | None:
    skill = match_skill(db, skill_name)
    if skill:
        return skill
    alias_target = SKILL_ALIAS_MAP.get(normalize_text(skill_name))
    if alias_target:
        return match_skill(db, alias_target)
    return None


def match_district(db: Session, district_name: str) -> District | None:
    DISTRICT_ALIAS_MAP = {
        "aurangabad": "Chhatrapati Sambhajinagar",
        "mumbai": "Mumbai City",
        "navi mumbai": "Thane",
    }
    target_name = DISTRICT_ALIAS_MAP.get(normalize_text(district_name), district_name)
    rows = db.scalars(select(District)).all()
    for row in rows:
        if normalize_text(row.name) == normalize_text(target_name):
            return row
    return None


def match_industry_sector(db: Session, sector_name: str) -> IndustrySector | None:
    rows = db.scalars(select(IndustrySector)).all()
    for row in rows:
        if normalize_text(row.name) == normalize_text(sector_name):
            return row
    return None


def main():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        proficiency_levels = {p.code: p for p in db.scalars(select(SkillProficiencyLevel)).all()}
        default_proficiency = proficiency_levels.get("L2")

        source = db.scalar(select(DataSource).where(DataSource.name == "Google Sheet - real_skills"))
        if not source:
            source = DataSource(
                name="Google Sheet - real_skills",
                source_category="google_sheet",
                description="Training provider and labor market data from SkillMitra real_skills Google Sheet",
                source_url="https://docs.google.com/spreadsheets/d/1L2zyGLERanzMVuRvtGSXRmuy1Zhxj5t5wdJrY0yl5Pg",
                organization="SkillMitra",
                status="active",
            )
            db.add(source)
            db.flush()

        run = DataIngestionRun(
            source_id=source.id,
            started_at=datetime.now(),
            records_received=0,
            status="started",
        )
        db.add(run)
        db.flush()

        # Create system import user and employer
        system_user = get_or_create_system_user(db)
        system_employer = get_or_create_system_employer(db, system_user.id)

        rows = parse_csv(CSV_DATA)
        run.records_received = len(rows)

        valid_count = 0
        skipped_count = 0
        duplicate_rows = 0
        unmatched_districts = set()
        unmatched_skills = set()
        accepted_ids = []

        for idx, row in enumerate(rows, 1):
            external_id = row["course_id"]
            if not external_id:
                skipped_count += 1
                continue

            existing_raw = db.scalar(select(RawJobPosting.id).where(
                RawJobPosting.source_id == source.id,
                RawJobPosting.external_id == external_id,
            ))
            if existing_raw:
                duplicate_rows += 1
                continue

            district = match_district(db, row["district"])
            if not district:
                unmatched_districts.add(row["district"])
                skipped_count += 1
                continue

            job_role = get_or_create_job_role(db, row["job_role"])
            sector = match_industry_sector(db, row["employer_industry"])

            top_companies = [c.strip() for c in row["top_hiring_companies"].split(",") if c.strip()]
            employer = system_employer

            skill_names = [s.strip() for s in row["skills_modules"].split(",") if s.strip()]
            matched_skills = []
            for skill_name in skill_names:
                skill = match_skill_with_alias(db, skill_name)
                if skill:
                    matched_skills.append(skill)
                else:
                    unmatched_skills.add(skill_name)

            try:
                vacancies = int(row["market_demand_vacancies"]) if row["market_demand_vacancies"] else 0
            except ValueError:
                vacancies = 0

            posted_date = None
            if row["curriculum_last_update"]:
                try:
                    posted_date = date.fromisoformat(row["curriculum_last_update"])
                except ValueError:
                    pass

            raw = RawJobPosting(
                ingestion_run_id=run.id,
                source_id=source.id,
                external_id=external_id,
                employer_name=row["top_hiring_companies"],
                title=row["job_role"],
                description=f"Course: {row['course_name']} | Provider: {row['provider_name']} | Salary: {row['salary_range_inr']} | Vacancies: {vacancies}",
                district_id=district.id,
                posted_date=posted_date,
                raw_payload={
                    "provider_name": row["provider_name"],
                    "course_id": row["course_id"],
                    "course_name": row["course_name"],
                    "job_role": row["job_role"],
                    "skills_modules": row["skills_modules"],
                    "duration_months": row["duration_months"],
                    "eligibility": row["eligibility"],
                    "equipment_labs": row["equipment_labs"],
                    "seats_capacity": row["seats_capacity"],
                    "available_seats": row["available_seats"],
                    "students_enrolled": row["students_enrolled"],
                    "students_completed": row["students_completed"],
                    "students_placed": row["students_placed"],
                    "employer_industry": row["employer_industry"],
                    "top_hiring_companies": row["top_hiring_companies"],
                    "salary_range_inr": row["salary_range_inr"],
                    "market_demand_vacancies": vacancies,
                    "unmatched_skills": [s for s in skill_names if s not in [sk.name for sk in matched_skills]],
                },
                normalization_status="accepted",
            )
            db.add(raw)
            db.flush()

            if employer and job_role and district and matched_skills and default_proficiency:
                posting = JobPosting(
                    employer_id=employer.id,
                    job_role_id=job_role.id,
                    district_id=district.id,
                    data_source_id=source.id,
                    title=row["job_role"],
                    status="open",
                    posted_date=posted_date,
                )
                db.add(posting)
                db.flush()

                seen_skill_ids = set()
                for skill in matched_skills:
                    if skill.id in seen_skill_ids:
                        continue
                    seen_skill_ids.add(skill.id)
                    db.add(JobPostingSkill(
                        job_posting_id=posting.id,
                        skill_id=skill.id,
                        proficiency_level_id=default_proficiency.id,
                        importance="mandatory",
                    ))

                if vacancies > 0:
                    db.add(DemandSignal(
                        skill_id=matched_skills[0].id,
                        job_role_id=job_role.id,
                        district_id=district.id,
                        job_posting_id=posting.id,
                        raw_weight=Decimal(str(vacancies)),
                        scaled_weight=Decimal(str(vacancies)),
                        detected_at=datetime.now(),
                    ))

                raw.canonical_job_posting_id = posting.id
                valid_count += 1
                accepted_ids.append(posting.id)
            else:
                raw.normalization_status = "unmapped"
                raw.rejection_reason = f"Missing required fields: employer={employer is not None}, role={job_role is not None}, district={district is not None}, skills={len(matched_skills) > 0}"
                skipped_count += 1

        # Create/update courses
        seen_courses = set()
        for row in rows:
            title = row["course_name"]
            if title in seen_courses:
                continue
            seen_courses.add(title)

            district = match_district(db, row["district"])
            sector = match_industry_sector(db, row["employer_industry"])
            duration_months = None
            try:
                duration_months = int(row["duration_months"]) if row["duration_months"] else None
            except ValueError:
                pass
            existing_course = db.scalar(select(Course).where(func.lower(Course.title) == title.lower()))
            if not existing_course:
                course = Course(
                    title=title,
                    source_course_code=row["course_id"],
                    district_id=district.id if district else None,
                    industry_sector_id=sector.id if sector else None,
                    data_source_id=source.id,
                    status="active",
                    duration_hours=duration_months * 160 if duration_months else None,
                    qualification=row["eligibility"] or None,
                )
                db.add(course)

        run.records_accepted = valid_count
        run.records_rejected = skipped_count
        run.records_deduplicated = duplicate_rows
        run.status = "completed"
        run.completed_at = datetime.now()

        db.commit()

        print("=" * 60)
        print("IMPORT SUMMARY")
        print("=" * 60)
        print(f"Total source rows: {len(rows)}")
        print(f"Valid imported: {valid_count}")
        print(f"Skipped: {skipped_count}")
        print(f"Duplicates skipped: {duplicate_rows}")
        print(f"Unmatched districts: {len(unmatched_districts)}")
        if unmatched_districts:
            for d in sorted(unmatched_districts):
                print(f"  - {d}")
        print(f"Unmatched skills: {len(unmatched_skills)}")
        if unmatched_skills:
            for s in sorted(unmatched_skills)[:20]:
                print(f"  - {s}")
            if len(unmatched_skills) > 20:
                print(f"  ... and {len(unmatched_skills) - 20} more")
        print(f"Accepted job posting IDs: {len(accepted_ids)}")
        print("=" * 60)


if __name__ == "__main__":
    main()

"""
Government Filter Utilities
Canonical filter parameter handling for Government analytics
"""

from pydantic import BaseModel
from typing import Optional
from datetime import date
import uuid


class GovernmentFilterParams(BaseModel):
    """Standard filter parameters for Government analytics"""
    district_id: Optional[uuid.UUID] = None
    sector_id: Optional[uuid.UUID] = None
    job_role_id: Optional[uuid.UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    
    def is_active(self) -> bool:
        """Check if any filter is active (demo vs live mode)"""
        return bool(
            self.district_id or 
            self.sector_id or 
            self.job_role_id or 
            self.start_date or 
            self.end_date
        )
    
    def get_filter_metadata(self) -> dict:
        """Get metadata about active filters for debugging"""
        return {
            "district_id": str(self.district_id) if self.district_id else None,
            "sector_id": str(self.sector_id) if self.sector_id else None,
            "job_role_id": str(self.job_role_id) if self.job_role_id else None,
            "start_date": str(self.start_date) if self.start_date else None,
            "end_date": str(self.end_date) if self.end_date else None,
            "is_active": self.is_active(),
        }


def build_date_filter(start_date: Optional[date], end_date: Optional[date]) -> dict:
    """
    Build date filter for industry demand queries.
    Handles overlapping periods correctly.
    
    For industry demand, we want periods that overlap with the selected date range:
    period_start <= end_date AND period_end >= start_date
    """
    conditions = []
    params = {}
    
    if start_date and end_date:
        conditions.append("period_start <= :end_date")
        conditions.append("period_end >= :start_date")
        params["start_date"] = start_date
        params["end_date"] = end_date
    elif start_date:
        conditions.append("period_end >= :start_date")
        params["start_date"] = start_date
    elif end_date:
        conditions.append("period_start <= :end_date")
        params["end_date"] = end_date
    
    return {
        "conditions": conditions,
        "params": params
    }


def build_district_filter(district_id: Optional[uuid.UUID]) -> dict:
    """Build district filter condition"""
    if district_id:
        return {
            "condition": "district_id = :district_id",
            "params": {"district_id": district_id}
        }
    return {
        "condition": None,
        "params": {}
    }


def build_sector_filter(sector_id: Optional[uuid.UUID]) -> dict:
    """Build sector filter condition"""
    if sector_id:
        return {
            "condition": "industry_sector_id = :sector_id",
            "params": {"sector_id": sector_id}
        }
    return {
        "condition": None,
        "params": {}
    }


def build_job_role_filter(job_role_id: Optional[uuid.UUID]) -> dict:
    """Build job role filter condition"""
    if job_role_id:
        return {
            "condition": "job_role_id = :job_role_id",
            "params": {"job_role_id": job_role_id}
        }
    return {
        "condition": None,
        "params": {}
    }
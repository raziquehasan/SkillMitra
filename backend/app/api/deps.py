"""
Common FastAPI dependencies.
"""
from fastapi import Query

def get_pagination(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
) -> dict:
    return {"skip": (page - 1) * page_size, "limit": page_size, "page": page, "page_size": page_size}

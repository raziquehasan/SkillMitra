"""
Common Pydantic schemas for pagination and standard responses.
"""
from typing import Generic, TypeVar, Sequence
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: Sequence[T]
    total: int
    page: int
    page_size: int
    pages: int

class MessageResponse(BaseModel):
    message: str

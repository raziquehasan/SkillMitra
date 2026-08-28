"""
Standard error schemas.
"""
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    loc: list[str] | None = None
    msg: str
    type: str

class ErrorResponse(BaseModel):
    detail: str | list[ErrorDetail]

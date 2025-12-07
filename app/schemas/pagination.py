from pydantic import BaseModel
from typing import List, TypeVar, Generic

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    items: List[T]
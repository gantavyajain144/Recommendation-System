from typing import Optional
from pydantic import BaseModel

class ContentBase(BaseModel):
    show_id: str
    type: str # Movie / TV Show
    title: str
    director: Optional[str] = None
    cast: Optional[str] = None
    country: Optional[str] = None
    date_added: Optional[str] = None
    release_year: Optional[int] = None
    rating: Optional[str] = None
    duration: Optional[str] = None
    listed_in: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class ContentCreate(ContentBase):
    pass

class Content(ContentBase):
    id: int
    
    class Config:
        from_attributes = True

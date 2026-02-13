from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.api import deps
from app.models.content import Content
from app.schemas.content import Content as ContentSchema
from app.schemas.content import ContentCreate

router = APIRouter()

@router.get("/", response_model=List[ContentSchema])
def read_contents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve contents.
    """
    contents = db.query(Content).offset(skip).limit(limit).all()
    return contents

@router.post("/", response_model=ContentSchema)
def create_content(
    *,
    db: Session = Depends(deps.get_db),
    content_in: ContentCreate,
):
    """
    Create new content.
    """
    content = Content(**content_in.dict())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content

@router.get("/search", response_model=List[ContentSchema])
def search_contents(
    query: str,
    db: Session = Depends(deps.get_db),
    limit: int = 20,
):
    """
    Search contents by title or genre.
    """
    search = f"%{query}%"
    contents = db.query(Content).filter(
        or_(
            Content.title.like(search),
            Content.listed_in.like(search)
        )
    ).limit(limit).all()
    return contents

@router.get("/filter", response_model=List[ContentSchema])
def filter_contents(
    type: Optional[str] = None, # Movie or TV Show
    genre: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(deps.get_db),
    limit: int = 20,
):
    """
    Filter contents by type, genre, or year.
    """
    query = db.query(Content)
    
    if type:
        query = query.filter(Content.type == type)
    if genre:
        query = query.filter(Content.listed_in.like(f"%{genre}%"))
    if year:
        query = query.filter(Content.release_year == year)
        
    return query.limit(limit).all()

@router.get("/random", response_model=List[ContentSchema])
def read_random_contents(
    db: Session = Depends(deps.get_db),
    limit: int = 10,
    type: Optional[str] = None
):
    """
    Get random contents (e.g. for Trending or Hero section).
    """
    query = db.query(Content)
    if type:
        query = query.filter(Content.type == type)
    return query.order_by(func.random()).limit(limit).all()

@router.get("/new", response_model=List[ContentSchema])
def get_new_contents(
    db: Session = Depends(deps.get_db),
    limit: int = 10,
):
    """
    Get most recently added content (New on Netflix).
    """
    return db.query(Content).order_by(Content.id.desc()).limit(limit).all()

@router.get("/{content_id}", response_model=ContentSchema)
def read_content(
    content_id: int,
    db: Session = Depends(deps.get_db),
):
    """
    Get content by ID.
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

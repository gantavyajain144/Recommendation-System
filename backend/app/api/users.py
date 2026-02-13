from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.services import user_service
from app.schemas.user import User

router = APIRouter()

@router.get("/me", response_model=User)
def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/{user_id}", response_model=User)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = user_service.get_user(db, user_id=user_id)
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/list/{content_id}", response_model=Any)
def add_content_to_list(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add content to current user's list.
    """
    try:
        updated_list = user_service.add_to_list(db, user_id=current_user.id, content_id=content_id)
        if updated_list is None:
             raise HTTPException(status_code=404, detail="Content not found")
        return {"status": "success", "message": "Content added to list"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/list/{content_id}", response_model=Any)
def remove_content_from_list(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove content from current user's list.
    """
    try:
        updated_list = user_service.remove_from_list(db, user_id=current_user.id, content_id=content_id)
        if updated_list is None:
             raise HTTPException(status_code=404, detail="Content not found")
        return {"status": "success", "message": "Content removed from list"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/list", response_model=Any)
def get_my_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's list.
    """
    return user_service.get_user_list(db, user_id=current_user.id)

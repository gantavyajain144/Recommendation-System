from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.services import user_service
from app.schemas.user import UserCreate, User, Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = user_service.get_user_by_email(db, email=form_data.username)
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=User)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    import traceback
    try:
        user = user_service.get_user_by_email(db, email=user_in.email)
        if user:
            raise HTTPException(
                status_code=400,
                detail="The user with this username already exists in the system.",
            )
        user = user_service.create_user(db=db, user=user_in)
        return user
    except HTTPException:
        raise
    except Exception as e:
        with open("debug_error.log", "a") as f:
            f.write(f"Error creating user: {str(e)}\n")
            f.write(traceback.format_exc())
            f.write("\n" + "="*50 + "\n")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/google", response_model=Token)
def google_authentication(
    token: str, 
    mode: str = "login",  # 'login' or 'register'
    db: Session = Depends(get_db)
):
    """
    Verify Google ID Token and return JWT Access Token
    mode='login': Fail if user doesn't exist.
    mode='register': Create user if doesn't exist.
    """
    try:
        # Verify the token
        print(f"Verifying token for Client ID: {settings.GOOGLE_CLIENT_ID}")
        id_info = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID, clock_skew_in_seconds=60)
        print("Token verified successfully")

        # Google ID token verified, check if user exists or create one
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")
        
        if not email:
             raise HTTPException(status_code=400, detail="Invalid Google Token: No email found")

        user = user_service.get_user_by_email(db, email=email)
        
        if not user:
            if mode == "login":
                # User tried to login but has no account
                raise HTTPException(status_code=404, detail="User not found. Please register first.")
            elif mode == "register":
                # Create a new user
                user = user_service.create_google_user(db, email=email, full_name=name, picture=picture)
            else:
                raise HTTPException(status_code=400, detail="Invalid mode")
        else:
            # User exists
            if mode == "register":
                 # If registering but user exists, just log them in (or could raise error says "already exists")
                 # For better UX, we usually just log them in. 
                 pass

        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        # Invalid token
        print(f"Google Token Verification Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Google Token: {str(e)}")

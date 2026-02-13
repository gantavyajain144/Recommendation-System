# Contains functions to interact with the database (e.g., get_user_by_email, create_user, create_google_user). The API calls these functions.
# user management and my list management
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_google_user(db: Session, email: str, full_name: str, picture: str):
    db_user = User(
        email=email,
        full_name=full_name,
        picture=picture,
        is_active=True,
        hashed_password=None # Google users don't have a password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def add_to_list(db: Session, user_id: int, content_id: int):
    user = get_user(db, user_id)
    if not user:
        return None
    
    # Check if content exists
    from app.models.content import Content
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None
        
    if content not in user.my_list:
        user.my_list.append(content)
        db.commit()
        db.refresh(user)
    return user.my_list

def remove_from_list(db: Session, user_id: int, content_id: int):
    user = get_user(db, user_id)
    if not user:
        return None
        
    # Check if content exists
    from app.models.content import Content
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        return None
        
    if content in user.my_list:
        user.my_list.remove(content)
        db.commit()
        db.refresh(user)
    return user.my_list

def get_user_list(db: Session, user_id: int):
    user = get_user(db, user_id)
    if not user:
        return []
    return user.my_list

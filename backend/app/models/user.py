from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True) # Open for OAuth users
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    picture = Column(String(255), nullable=True)
    
    my_list = relationship("Content", secondary="user_content_list", backref="fans")

class UserContentList(Base):
    __tablename__ = "user_content_list"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    content_id = Column(Integer, ForeignKey("contents.id"), primary_key=True)

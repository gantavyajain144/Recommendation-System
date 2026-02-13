from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(String(50), unique=True, index=True) # Mapped from CSV 'show_id'
    type = Column(String(50), index=True) # Movie / TV Show
    title = Column(String(255), index=True)
    director = Column(String(255), nullable=True)
    cast = Column(Text, nullable=True)
    country = Column(String(255), nullable=True)
    date_added = Column(String(100), nullable=True)
    release_year = Column(Integer, index=True)
    rating = Column(String(50), index=True)
    duration = Column(String(50))
    listed_in = Column(String(255), index=True) # Genres
    description = Column(Text)
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)

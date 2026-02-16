"""
API endpoint to seed the database with Netflix content from CSV
Visit /api/v1/seed to populate the database
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import os

from app.api.deps import get_db
from app.models.content import Content

router = APIRouter()

@router.post("/seed", tags=["admin"])
async def seed_database(db: Session = Depends(get_db)):
    """
    Seed the database with Netflix content from CSV file.
    This endpoint can only be called once to populate the database.
    """
    try:
        # Check if database already has content
        existing_count = db.query(Content).count()
        
        # Read CSV file
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "NetFlix.csv")
        
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail=f"CSV file not found at {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Process and insert data
        added_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                # Check if this content already exists (by title)
                existing = db.query(Content).filter(Content.title == row['title']).first()
                if existing:
                    skipped_count += 1
                    continue
                
                # Create content object
                content = Content(
                    title=row['title'],
                    type=row['type'],
                    description=row.get('description', ''),
                    release_year=int(row['release_year']) if pd.notna(row.get('release_year')) else None,
                    rating=row.get('rating', ''),
                    duration=row.get('duration', ''),
                    genres=row.get('listed_in', ''),
                    cast=row.get('cast', ''),
                    director=row.get('director', ''),
                    country=row.get('country', ''),
                    date_added=row.get('date_added', ''),
                    poster_url=row.get('poster_url', ''),
                    video_url=row.get('video_url', '')
                )
                
                db.add(content)
                added_count += 1
                
                # Commit in batches of 100
                if added_count % 100 == 0:
                    db.commit()
                    
            except Exception as e:
                print(f"Error processing row {index}: {e}")
                continue
        
        # Final commit
        db.commit()
        
        return {
            "success": True,
            "message": "Database seeding complete!",
            "added": added_count,
            "skipped": skipped_count,
            "total": db.query(Content).count(),
            "existing_before": existing_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error seeding database: {str(e)}")

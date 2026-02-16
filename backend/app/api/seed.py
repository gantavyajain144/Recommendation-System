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
        
        print(f"Looking for CSV at: {csv_path}")
        print(f"File exists: {os.path.exists(csv_path)}")
        print(f"Current directory: {os.getcwd()}")
        print(f"__file__: {__file__}")
        
        if not os.path.exists(csv_path):
            # Try alternative path
            csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "NetFlix.csv")
            csv_path = os.path.abspath(csv_path)
            print(f"Trying alternative path: {csv_path}")
            print(f"Alternative exists: {os.path.exists(csv_path)}")
            
            if not os.path.exists(csv_path):
                raise HTTPException(status_code=404, detail=f"CSV file not found. Tried: {csv_path}")
        
        print(f"Reading CSV from: {csv_path}")
        df = pd.read_csv(csv_path)
        print(f"CSV loaded successfully. Rows: {len(df)}, Columns: {list(df.columns)}")
        
        # Process and insert data
        added_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                # Check if this content already exists (by title or show_id)
                existing = db.query(Content).filter(
                    (Content.title == row['title']) | (Content.show_id == row.get('show_id', ''))
                ).first()
                if existing:
                    skipped_count += 1
                    continue
                
                # Create content object - use exact field names from Content model
                content = Content(
                    show_id=str(row.get('show_id', '')),
                    title=row['title'],
                    type=row['type'],
                    description=str(row.get('description', '')) if pd.notna(row.get('description')) else '',
                    release_year=int(row['release_year']) if pd.notna(row.get('release_year')) else None,
                    rating=str(row.get('rating', '')) if pd.notna(row.get('rating')) else '',
                    duration=str(row.get('duration', '')) if pd.notna(row.get('duration')) else '',
                    listed_in=str(row.get('genres', '')) if pd.notna(row.get('genres')) else '',  # CSV has 'genres', model has 'listed_in'
                    cast=str(row.get('cast', '')) if pd.notna(row.get('cast')) else '',
                    director=str(row.get('director', '')) if pd.notna(row.get('director')) else '',
                    country=str(row.get('country', '')) if pd.notna(row.get('country')) else '',
                    date_added=str(row.get('date_added', '')) if pd.notna(row.get('date_added')) else '',
                    image_url='',  # Model has 'image_url', not 'poster_url'
                    video_url=''
                )
                
                db.add(content)
                added_count += 1
                
                # Commit in batches of 100
                if added_count % 100 == 0:
                    db.commit()
                    print(f"Progress: {added_count} items added...")
                    
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

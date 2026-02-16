"""
Seed script to populate the production database with Netflix content from CSV
Run this script to load data into your Render PostgreSQL database
"""
import os
import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# Define Content model directly
class Content(Base):
    __tablename__ = "content"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    type = Column(String)
    description = Column(Text)
    release_year = Column(Integer)
    rating = Column(String)
    duration = Column(String)
    genres = Column(String)
    cast = Column(Text)
    director = Column(String)
    country = Column(String)
    date_added = Column(String)
    poster_url = Column(String)
    video_url = Column(String)

def seed_database():
    """Load Netflix content from CSV into the database"""
    
    # Get database URL from environment or use default
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set!")
        print("Please set it to your Render PostgreSQL URL")
        return
    
    print(f"Connecting to database...")
    
    # Create engine and session
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        
        # Read CSV file
        csv_path = os.path.join(os.path.dirname(__file__), "NetFlix.csv")
        print(f"Reading CSV file: {csv_path}")
        
        df = pd.read_csv(csv_path)
        print(f"Found {len(df)} records in CSV")
        
        # Check if content already exists
        existing_count = db.query(Content).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} content items.")
            response = input("Do you want to clear existing data and reload? (yes/no): ")
            if response.lower() == 'yes':
                print("Deleting existing content...")
                db.query(Content).delete()
                db.commit()
            else:
                print("Keeping existing data and adding new items...")
        
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
                    print(f"Progress: {added_count} items added...")
                    
            except Exception as e:
                print(f"Error processing row {index}: {e}")
                continue
        
        # Final commit
        db.commit()
        
        print("\n" + "="*50)
        print(f"✅ Database seeding complete!")
        print(f"   Added: {added_count} items")
        print(f"   Skipped: {skipped_count} items (already exist)")
        print(f"   Total in database: {db.query(Content).count()} items")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("="*50)
    print("Netflix Content Database Seeder")
    print("="*50)
    seed_database()

import csv
import sys
import os

# Add backend directory to sys.path to allow imports from app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.content import Content
from app.db.base import Base
def import_data():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    csv_file_path = os.path.join(os.path.dirname(__file__), "../../NetFlix.csv")
    
    if not os.path.exists(csv_file_path):
        print(f"Error: CSV file not found at {csv_file_path}")
        return

    print("Importing Netflix data...")
    
    try:
        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            contents = []
            
            for row in reader:
                # Check if show_id already exists to avoid duplicates
                existing = db.query(Content).filter(Content.show_id == row['show_id']).first()
                if existing:
                    continue

                content = Content(
                    show_id=row['show_id'],
                    type=row['type'],
                    title=row['title'],
                    director=row['director'] if row['director'] else None,
                    cast=row['cast'] if row['cast'] else None,
                    country=row['country'] if row['country'] else None,
                    date_added=row['date_added'] if row['date_added'] else None,
                    release_year=int(row['release_year']) if row['release_year'] else None,
                    rating=row['rating'] if row['rating'] else None,
                    duration=row['duration'] if row['duration'] else None,
                    listed_in=row['genres'], # CSV header is 'genres' but mapped to 'listed_in' in model? 
                                           # Wait, CSV header in previous view_file was 'genres'. 
                                           # Model has 'listed_in'. Let's map row['genres'] to listed_in.
                    description=row['description']
                )
                contents.append(content)
                count += 1
                
                if len(contents) >= 100:
                    db.add_all(contents)
                    db.commit()
                    contents = []
                    print(f"Imported {count} rows...")

            if contents:
                db.add_all(contents)
                db.commit()
                
            print(f"Successfully imported {count} items.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_data()

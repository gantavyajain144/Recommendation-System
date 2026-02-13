from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "static/videos"

@router.post("/", response_model=dict)
async def upload_video(file: UploadFile = File(...)):
    try:
        # Validate file type (basic check)
        if not file.content_type.startswith("video/"):
             raise HTTPException(status_code=400, detail="File must be a video")

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return URL (assuming backend is running on localhost:8000)
        # In production, this should be a full URL or relative path handled by frontend
        video_url = f"http://127.0.0.1:8000/static/videos/{unique_filename}"
        
        return {"url": video_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

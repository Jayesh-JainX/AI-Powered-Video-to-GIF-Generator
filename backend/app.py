import os
import shutil
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import uvicorn

from services.video_processor import VideoProcessor

# Initialize FastAPI app
app = FastAPI(title="AI-Powered Video to GIF Generator")

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs(os.path.join("static", "uploads"), exist_ok=True)
os.makedirs(os.path.join("static", "gifs"), exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Video processor service
video_processor = VideoProcessor()

class VideoURL(BaseModel):
    url: str
    prompt: str
    is_direct_mp4: bool = False  # Flag to indicate if URL is a direct MP4 link


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return "Hello"


@app.post("/process-youtube")
async def process_youtube(data: VideoURL):
    try:
        # Generate a unique ID for this job
        job_id = str(uuid.uuid4())
        
        # Download video
        try:
            if data.is_direct_mp4:
                # For direct MP4 URLs, download using requests
                video_path = await video_processor.download_direct_mp4(data.url, job_id)
            else:
                # For YouTube URLs, use the YouTube downloader
                video_path = await video_processor.download_youtube(data.url, job_id)
        except Exception as e:
            # Provide specific error for video download issues
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download video: {str(e)}"
            )
        
        # Process the video
        try:
            gif_paths = await video_processor.process_video(video_path, data.prompt, job_id)
        except Exception as e:
            # Provide specific error for video processing issues
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process video: {str(e)}"
            )
        
        return {"status": "success", "gifs": gif_paths, "job_id": job_id}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Generic fallback error
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.post("/process-upload")
async def process_upload(
    prompt: str = Form(...),
    video: UploadFile = File(...)
):
    try:
        # Check if the file is a video
        if not video.content_type.startswith("video/"):
            raise HTTPException(status_code=400, detail="Uploaded file is not a video")
        
        # Generate a unique ID for this job
        job_id = str(uuid.uuid4())
        
        # Create directory for this job
        upload_dir = os.path.join("static", "uploads", job_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the uploaded video
        video_path = os.path.join(upload_dir, "input.mp4")
        try:
            with open(video_path, "wb") as buffer:
                shutil.copyfileobj(video.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save uploaded video: {str(e)}"
            )
        
        # Process the video
        try:
            gif_paths = await video_processor.process_video(video_path, prompt, job_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process video: {str(e)}"
            )
        
        return {"status": "success", "gifs": gif_paths, "job_id": job_id}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Generic fallback error
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.get("/download/{job_id}/{gif_index}")
async def download_gif(job_id: str, gif_index: int):
    try:
        gif_path = os.path.join("static", "gifs", job_id, f"gif_{gif_index}.gif")
        if not os.path.exists(gif_path):
            raise HTTPException(status_code=404, detail="GIF not found")
        
        return FileResponse(
            path=gif_path, 
            filename=f"gif_{gif_index}.gif", 
            media_type="image/gif"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 
import os
import tempfile
from typing import List, Dict, Any, Tuple
import yt_dlp
import moviepy.editor as mp
from faster_whisper import WhisperModel
import cv2
import numpy as np
from PIL import Image, ImageFont, ImageDraw
import time
import subprocess
import requests

class VideoProcessor:
    def __init__(self):
        # Initialize the Whisper model
        self.model = WhisperModel("base.en", device="cpu", compute_type="int8")
    
    async def download_youtube(self, url: str, job_id: str) -> str:
        """
        Download a YouTube video and return the local path using yt-dlp Python module.
        """
        # Create directory for this job
        upload_dir = os.path.join("static", "uploads", job_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        video_path = os.path.join(upload_dir, "input.mp4")
        
        try:
            print(f"Attempting to download YouTube video from URL: {url}")
            
            # Configure yt-dlp options
            ydl_opts = {
                'format': 'best[ext=mp4]/best',
                'outtmpl': video_path,
                'quiet': False,
                'no_warnings': False,
                'restrictfilenames': True,
                'noplaylist': True,
                'ignoreerrors': False,
            }
            
            print(f"Using yt-dlp Python module to download to: {video_path}")
            
            # Use yt-dlp Python module directly
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            # Verify the file exists and has content
            if not os.path.exists(video_path):
                raise Exception("Downloaded file doesn't exist")
            
            file_size = os.path.getsize(video_path)
            print(f"Downloaded file size: {file_size} bytes")
            
            if file_size == 0:
                raise Exception("Downloaded file is empty")
            
            return video_path
            
        except Exception as e:
            print(f"YouTube download failed: {str(e)}")
            raise Exception(f"Failed to download YouTube video: {str(e)}")
    
    async def download_direct_mp4(self, url: str, job_id: str) -> str:
        """
        Download a direct MP4 URL using requests.
        """
        # Create directory for this job
        upload_dir = os.path.join("static", "uploads", job_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        video_path = os.path.join(upload_dir, "input.mp4")
        
        try:
            print(f"Downloading direct MP4 from URL: {url}")
            
            # Stream the download to avoid loading the whole file into memory
            with requests.get(url, stream=True) as response:
                response.raise_for_status()  # Raise an error for bad responses
                
                # Write the content to the file
                with open(video_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
            
            # Verify the file exists and has content
            if not os.path.exists(video_path):
                raise Exception("Downloaded file doesn't exist")
            
            file_size = os.path.getsize(video_path)
            print(f"Downloaded file size: {file_size} bytes")
            
            if file_size == 0:
                raise Exception("Downloaded file is empty")
            
            return video_path
            
        except Exception as e:
            print(f"MP4 download failed: {str(e)}")
            raise Exception(f"Failed to download MP4: {str(e)}")
    
    async def transcribe_video(self, video_path: str) -> List[Dict[str, Any]]:
        """
        Transcribe the video and return segments with timestamps.
        """
        try:
            # Load the video
            video = mp.VideoFileClip(video_path)
            
            # Check if the video has an audio track
            if video.audio is None:
                print("Warning: Video has no audio track. Creating segments based on video duration.")
                # If no audio, create dummy segments based on video duration
                duration = video.duration
                segment_length = min(5.0, duration / 3)  # Split into segments of max 5 seconds
                
                # Create dummy segments
                result = []
                current_time = 0
                segment_index = 1
                
                while current_time < duration:
                    end_time = min(current_time + segment_length, duration)
                    result.append({
                        "text": f"Segment {segment_index} (No audio)",
                        "start": current_time,
                        "end": end_time,
                        "words": []
                    })
                    current_time = end_time
                    segment_index += 1
                
                return result
            
            # Extract audio from video
            audio_path = video_path.replace(".mp4", ".wav")
            video.audio.write_audiofile(audio_path, codec='pcm_s16le')
            
            # Transcribe using faster-whisper
            segments, _ = self.model.transcribe(audio_path, word_timestamps=True)
            
            # Convert segments to list of dicts with timestamps
            result = []
            for segment in segments:
                result.append({
                    "text": segment.text,
                    "start": segment.start,
                    "end": segment.end,
                    "words": [{"word": word.word, "start": word.start, "end": word.end} for word in segment.words]
                })
            
            # Remove temporary audio file
            os.remove(audio_path)
            
            return result
        except Exception as e:
            raise Exception(f"Failed to transcribe video: {str(e)}")
    
    async def analyze_transcript(self, transcript: List[Dict[str, Any]], prompt: str) -> List[Dict[str, Any]]:
        """
        Analyze the transcript and prompt to identify key segments.
        This is a simplified version that looks for segments containing prompt keywords.
        """
        # Convert prompt to lowercase for case-insensitive matching
        prompt_keywords = prompt.lower().split()
        
        # Score each segment based on keywords and length
        scored_segments = []
        for segment in transcript:
            score = 0
            text = segment["text"].lower()
            
            # Score based on prompt keywords
            for keyword in prompt_keywords:
                if keyword in text:
                    score += 5
            
            # Score based on segment length (favor medium-length segments)
            duration = segment["end"] - segment["start"]
            if 2 <= duration <= 7:  # Ideal GIF length between 2-7 seconds
                score += 3
            
            # Add to scored segments if it has any score
            if score > 0:
                scored_segments.append({"segment": segment, "score": score})
        
        # Sort by score and take top segments
        scored_segments.sort(key=lambda x: x["score"], reverse=True)
        
        # Return top 3 segments or all if less than 3
        top_segments = [item["segment"] for item in scored_segments[:3]]
        
        # If we don't have any high-scoring segments, take the longest ones
        if not top_segments and transcript:
            transcript.sort(key=lambda x: x["end"] - x["start"], reverse=True)
            top_segments = transcript[:min(3, len(transcript))]
        
        return top_segments
    
    async def create_gif_with_captions(
        self, 
        video_path: str, 
        segment: Dict[str, Any], 
        output_path: str, 
        gif_index: int
    ) -> str:
        """
        Create a GIF from a video segment with captions.
        """
        try:
            # Get segment timestamps
            start_time = max(0, segment["start"] - 0.5)  # Start half a second earlier for context
            end_time = min(segment["end"] + 0.5, mp.VideoFileClip(video_path).duration)  # End half a second later
            
            # Extract clip from video
            video = mp.VideoFileClip(video_path).subclip(start_time, end_time)
            
            # Add captions to the clip
            captioned_clip = video.fl_image(lambda img: self.add_caption_to_frame(img, segment["text"]))
            
            # Create the GIF and save it
            gif_path = os.path.join(output_path, f"gif_{gif_index}.gif")
            
            # Improved GIF quality settings
            captioned_clip.resize(width=540).write_gif(
                gif_path, 
                fps=12,  # Reduced from 15 to 12 for smaller file size
                program='ffmpeg',  # Use ffmpeg for better quality
                opt='optimizeplus',  # Optimize the GIF
                fuzz=10  # Reduce colors slightly for better compression
            )
            
            return gif_path
        except Exception as e:
            raise Exception(f"Failed to create GIF: {str(e)}")
    
    def add_caption_to_frame(self, frame: np.ndarray, text: str) -> np.ndarray:
        """
        Add captions to a video frame.
        """
        # Convert frame to PIL Image
        img = Image.fromarray(frame)
        draw = ImageDraw.Draw(img)
        
        # Set up font (use default if custom font not available)
        try:
            font = ImageFont.truetype("Arial.ttf", 36)  # Increased from 24 to 36
        except IOError:
            font = ImageFont.load_default()
        
        # Limit text length and add ellipsis if necessary
        max_chars = 35  # Reduced from 40 to 35 due to larger font
        if len(text) > max_chars:
            # Split into multiple lines
            words = text.split()
            lines = []
            current_line = ''
            
            for word in words:
                if len(current_line + ' ' + word) <= max_chars:
                    current_line += ' ' + word if current_line else word
                else:
                    lines.append(current_line)
                    current_line = word
            
            if current_line:
                lines.append(current_line)
            
            text = '\n'.join(lines)
        
        # Calculate text position (centered at bottom with padding)
        width, height = img.size
        text_size = draw.multiline_textbbox((0, 0), text, font=font)
        text_width = text_size[2] - text_size[0]
        text_height = text_size[3] - text_size[1]
        
        # Position text higher from bottom for better visibility
        text_position = ((width - text_width) // 2, height - text_height - 80)  # Increased bottom padding from 60 to 80
        
        # Draw text background (semi-transparent black box)
        padding = 15  # Increased from 10 to 15
        box_position = (
            text_position[0] - padding,
            text_position[1] - padding,
            text_position[0] + text_width + padding,
            text_position[1] + text_height + padding
        )
        draw.rectangle(box_position, fill=(0, 0, 0, 180))  # Increased opacity from 128 to 180
        
        # Draw text (white)
        draw.multiline_text(text_position, text, font=font, fill=(255, 255, 255), align="center")
        
        # Convert back to numpy array
        return np.array(img)
    
    async def process_video(self, video_path: str, prompt: str, job_id: str) -> List[str]:
        """
        Process a video to generate captioned GIFs.
        """
        try:
            # Create output directory
            output_dir = os.path.join("static", "gifs", job_id)
            os.makedirs(output_dir, exist_ok=True)
            
            # Transcribe the video
            transcript = await self.transcribe_video(video_path)
            
            # Analyze transcript to find key segments
            key_segments = await self.analyze_transcript(transcript, prompt)
            
            # Create GIFs for each key segment
            gif_paths = []
            for i, segment in enumerate(key_segments):
                gif_path = await self.create_gif_with_captions(
                    video_path, 
                    segment, 
                    output_dir, 
                    i
                )
                # Convert to relative path for frontend
                relative_path = gif_path.replace("\\", "/")
                relative_path = "/" + relative_path.replace("static/", "static/")
                gif_paths.append(relative_path)
            
            return gif_paths
        except Exception as e:
            raise Exception(f"Failed to process video: {str(e)}") 
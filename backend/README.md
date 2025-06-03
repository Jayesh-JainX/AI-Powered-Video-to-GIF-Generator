# Backend – AI-Powered Video to GIF Generator 🧠➡️📸

This is the **FastAPI** backend that powers the GIF generation system. It handles:

- Transcription of video content
- AI prompt matching
- GIF generation using MoviePy

---

## 💡 Features

- 🎙️ Transcribes video using `faster-whisper`
- 🤖 Matches transcript with user prompt
- 🎞️ Creates captioned GIFs from relevant moments
- 🧾 Returns downloadable GIF URLs

---

## ⚙️ Tech Stack

- Python 3.10+
- [FastAPI](https://fastapi.tiangolo.com/)
- [faster-whisper](https://github.com/guillaumekln/faster-whisper)
- [MoviePy](https://zulko.github.io/moviepy/)

---

## 🚀 Run Backend

Make sure you have Python and `ffmpeg` installed.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Server will be available at http://localhost:8000

# Frontend – AI-Powered Video to GIF Generator 🎬✨

This is the **frontend** of the AI-powered GIF generator app, built with **Next.js** and integrated with **Supabase Auth** for user authentication.

---

## 🚀 Features

- 🔐 Login/Sign-up with Supabase
- 🎥 Input YouTube URL or upload a video
- 🧠 AI-powered prompt-based GIF generation
- 📥 Download generated GIFs

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Auth](https://supabase.com/)
- REST API for GIF generation

---

## 📦 .env Setup

Create a `.env.local` file in the `frontend/` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://spnedzyzlwtlfhwgiguj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Replace your_anon_key_here with your real Supabase anon key.

## 🔧 Getting Started

```
cd frontend
npm install --force  # force install due to version conflicts
npm run dev
```

Visit: http://localhost:3000

Make sure the backend is running at http://localhost:8000

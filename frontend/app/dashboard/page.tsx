"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"youtube" | "upload">("youtube");
  const [loading, setLoading] = useState(false);
  const [loading_auth, setLoading_auth] = useState(true);
  const [error, setError] = useState("");
  const [gifs, setGifs] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  // Form fields
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ytPrompt, setYtPrompt] = useState("");
  const [isDirectMp4, setIsDirectMp4] = useState(false);

  const [uploadPrompt, setUploadPrompt] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const router = useRouter();

  // Notification checkbox and tutorial
  const [notifyWhenComplete, setNotifyWhenComplete] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(
      typeof Notification !== "undefined" ? Notification.permission : "default"
    );
  const [showNotificationTutorial, setShowNotificationTutorial] =
    useState(false);

  // Audio for notifications
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Initialize notification sound
  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audio.preload = "auto";
    audio.volume = 0.5;

    audio.addEventListener("error", (e) => {
      console.error("Audio failed to load:", e);
    });

    notificationSound.current = audio;
  }, []);

  // Play notification sound
  function playNotificationSound() {
    if (notificationSound.current) {
      notificationSound.current.play().catch((err) => {
        console.error("Failed to play notification sound:", err);
      });
    }
  }

  // Helpers
  function resetState() {
    setGifs([]);
    setError("");
    setJobId(null);
  }

  // Enhanced notification permission request with tutorial
  useEffect(() => {
    if (notifyWhenComplete && notificationPermission !== "granted") {
      if (
        typeof Notification !== "undefined" &&
        Notification.requestPermission
      ) {
        setShowNotificationTutorial(true);

        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
          setShowNotificationTutorial(false);

          if (permission !== "granted") {
            setNotifyWhenComplete(false);
          }
        });
      } else {
        setNotifyWhenComplete(false);
      }
    }
  }, [notifyWhenComplete, notificationPermission]);

  // Auto-uncheck notification checkbox if permission is denied
  useEffect(() => {
    if (notificationPermission === "denied" && notifyWhenComplete) {
      setNotifyWhenComplete(false);
      setShowNotificationTutorial(false);
    }
  }, [notificationPermission]);

  // Enhanced notification function with sound
  function showNotification(title: string, body: string) {
    if (notificationPermission === "granted") {
      new Notification(title, { body });
      playNotificationSound();
    }
  }

  async function handleYoutubeSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!youtubeUrl || !ytPrompt) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    resetState();

    try {
      const response = await fetch(`${backendBaseUrl}/process-youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: youtubeUrl,
          prompt: ytPrompt,
          is_direct_mp4: isDirectMp4,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGifs(data.gifs || []);
        setJobId(data.job_id || null);
        if (notifyWhenComplete) {
          showNotification(
            "GIF Generation Complete",
            "Your GIFs from the YouTube video are ready!"
          );
        }
      } else {
        setError(data.detail || "Unknown error");
        if (notifyWhenComplete) {
          showNotification(
            "GIF Generation Failed",
            data.detail || "Unknown error"
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      if (notifyWhenComplete) {
        showNotification(
          "GIF Generation Failed",
          err.message || "An unexpected error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!videoFile || !uploadPrompt) {
      setError("Please fill in all fields.");
      return;
    }

    if (videoFile.size > 100 * 1024 * 1024) {
      setError("File too large. Maximum size is 100MB.");
      return;
    }

    setLoading(true);
    resetState();

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("prompt", uploadPrompt);

      const response = await fetch(`${backendBaseUrl}/process-upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setGifs(data.gifs || []);
        setJobId(data.job_id || null);
        if (notifyWhenComplete) {
          showNotification(
            "GIF Generation Complete",
            "Your GIFs from the uploaded video are ready!"
          );
        }
      } else {
        setError(data.detail || "Unknown error");
        if (notifyWhenComplete) {
          showNotification(
            "GIF Generation Failed",
            data.detail || "Unknown error"
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      if (notifyWhenComplete) {
        showNotification(
          "GIF Generation Failed",
          err.message || "An unexpected error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!session || error) {
        router.replace("/auth/login");
      } else {
        setLoading_auth(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading_auth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            AI-Powered Video to GIF Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create captioned GIFs from videos based on your prompt
          </p>
        </header>

        {/* Notification Permission Tutorial Dialog */}
        <Dialog
          open={showNotificationTutorial}
          onOpenChange={setShowNotificationTutorial}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center">
                🔔 Enable Notifications
              </DialogTitle>
              <DialogDescription className="text-center">
                Please allow notifications so we can inform you when your GIFs
                are ready!
              </DialogDescription>
            </DialogHeader>
            <div className="relative py-8">
              <div className="tutorial-container">
                <div className="browser-mockup">
                  <div className="permission-dialog">
                    <div className="permission-icon">🔔</div>
                    <div className="permission-text">
                      {typeof window !== "undefined"
                        ? window.location.hostname
                        : "example.com"}{" "}
                      wants to send notifications
                    </div>
                    <div className="permission-buttons">
                      <button className="deny-button">Block</button>
                      <button className="allow-button">Allow</button>
                    </div>
                  </div>
                </div>
                {/* Animated arrow pointing to the allow button */}
                <div className="animated-arrow">👆</div>
                <div className="tutorial-text">
                  Click "Allow" to enable notifications
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          {/* Tabs */}
          <nav className="flex border-b border-gray-300 dark:border-gray-700">
            <button
              className={`flex-1 py-3 text-center font-semibold text-sm sm:text-base transition-colors ${
                activeTab === "youtube"
                  ? "border-b-4 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
              onClick={() => setActiveTab("youtube")}
              type="button"
              aria-selected={activeTab === "youtube"}
            >
              Video URL
            </button>
            <button
              className={`flex-1 py-3 text-center font-semibold text-sm sm:text-base transition-colors ${
                activeTab === "upload"
                  ? "border-b-4 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
              onClick={() => setActiveTab("upload")}
              type="button"
              aria-selected={activeTab === "upload"}
            >
              Upload Video
            </button>
          </nav>

          {/* Form */}
          <div className="p-6">
            {activeTab === "youtube" && (
              <form onSubmit={handleYoutubeSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="yt-prompt"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    GIF Theme Prompt
                  </label>
                  <input
                    type="text"
                    id="yt-prompt"
                    placeholder="Eg: funny moments, motivational quotes, etc."
                    value={ytPrompt}
                    onChange={(e) => setYtPrompt(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-300 dark:focus:ring-indigo-500 transition"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    What kind of moments are you looking for?
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="youtube-url"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Video URL
                  </label>
                  <input
                    type="url"
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=a1b2c3"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-300 dark:focus:ring-indigo-500 transition"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter a YouTube URL
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify-me"
                    checked={notifyWhenComplete}
                    onChange={(e) => setNotifyWhenComplete(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="notify-me"
                    className="text-sm text-gray-700 dark:text-gray-300 select-none"
                  >
                    🔔 Notify me when GIF generation is complete
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-md transition"
                >
                  {loading ? "Processing..." : "Generate GIFs"}
                </button>
              </form>
            )}

            {activeTab === "upload" && (
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="upload-prompt"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    GIF Theme Prompt
                  </label>
                  <input
                    type="text"
                    id="upload-prompt"
                    placeholder="Eg: funny moments, motivational quotes, etc."
                    value={uploadPrompt}
                    onChange={(e) => setUploadPrompt(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-300 dark:focus:ring-indigo-500 transition"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    What kind of moments are you looking for?
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="video-file"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Upload Video
                  </label>
                  <input
                    type="file"
                    id="video-file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files) setVideoFile(e.target.files[0]);
                    }}
                    required
                    className="mt-1 block w-full text-gray-900 dark:text-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maximum file size: 100MB
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify-me-upload"
                    checked={notifyWhenComplete}
                    onChange={(e) => setNotifyWhenComplete(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="notify-me-upload"
                    className="text-sm text-gray-700 dark:text-gray-300 select-none"
                  >
                    🔔 Notify me when GIF generation is complete
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-md transition"
                >
                  {loading ? "Processing..." : "Generate GIFs"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center mt-8 space-y-3 max-w-2xl mx-auto text-center">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p className="text-indigo-700 dark:text-indigo-300 font-medium">
              Processing your video... This may take a few minutes.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              GIF generation is a complex process and may take some time
              depending on video length and server load.
            </p>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto text-center">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* GIF results */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
          {gifs.length === 0 && !loading && !error && (
            <div className="col-span-full bg-blue-100 border border-blue-300 text-blue-700 rounded-lg py-4 px-6 text-center max-w-2xl mx-auto">
              No GIFs generated yet. Submit a video or URL to start.
            </div>
          )}

          {gifs.map((gifUrl, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col"
              style={{ maxWidth: "300px" }}
            >
              <img
                src={`${backendBaseUrl}${gifUrl}`}
                alt={`Generated GIF ${index + 1}`}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-center">
                <a
                  href={`${backendBaseUrl}/static/gifs/${jobId}/gif_${index}.gif`}
                  target="_blank"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md transition"
                  download={`gif_${index}.gif`}
                >
                  Download GIF
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .tutorial-container {
          position: relative;
          width: 100%;
          height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

        .browser-mockup {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: #f9fafb;
          width: 100%;
          max-width: 400px;
          position: relative;
        }

        .permission-dialog {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 16px;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .permission-icon {
          font-size: 24px;
          text-align: center;
          margin-bottom: 12px;
        }

        .permission-text {
          margin-bottom: 16px;
          font-weight: 500;
          color: #374151;
          text-align: center;
          font-size: 14px;
        }

        .permission-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .deny-button,
        .allow-button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .deny-button {
          background: #f3f4f6;
          color: #374151;
        }

        .allow-button {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          position: relative;
        }

        .animated-arrow {
          position: absolute;
          right: 20%;
          bottom: 35%;
          font-size: 24px;
          animation: bounce 1s infinite;
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        }

        .tutorial-text {
          color: #6b7280;
          font-size: 14px;
          text-align: center;
          font-weight: 500;
          margin-top: 10px;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0) rotate(-20deg);
          }
          50% {
            transform: translateY(-8px) rotate(-20deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animated-arrow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

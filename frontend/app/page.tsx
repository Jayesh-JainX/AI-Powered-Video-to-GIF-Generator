export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-24 px-6 text-center bg-gradient-to-br from-indigo-100 to-white dark:from-gray-800 dark:to-gray-950">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-indigo-700 dark:text-indigo-400 mb-6">
            Transform Any Video into Stunning GIFs with AI
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10">
            Upload a video or paste a YouTube link, describe what you want, and
            let our AI do the rest.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition shadow-lg hover:shadow-xl"
          >
            🚀 Get Started for Free
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            {
              icon: "🎬",
              title: "Upload or Link",
              desc: "Use a YouTube link or upload your own video (up to 100MB).",
            },
            {
              icon: "🧠",
              title: "AI-Powered Extraction",
              desc: "Describe what you want, and AI will extract the best GIF moments.",
            },
            {
              icon: "⚡",
              title: "Fast & Shareable",
              desc: "Generate high-quality, captioned GIFs in minutes.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:shadow-md transition"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="py-24 px-6 bg-gray-100 dark:bg-gray-900"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-left">
            {[
              "Paste a YouTube link or upload your own video.",
              "Describe the theme for the GIFs you want (e.g., funny, inspirational).",
              "Let our AI process the video and create optimized GIFs for you.",
              "Download and share instantly with friends or social media.",
            ].map((step, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg">
                  {i + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        className="py-24 px-6 text-center bg-indigo-600 text-white dark:bg-indigo-700"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Create Some Magic?
          </h2>
          <p className="mb-6 text-lg">
            Start generating GIFs from your videos in just a few clicks. No
            signup required.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center bg-white text-indigo-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition shadow-lg hover:shadow-xl"
          >
            ✨ Try It Now
          </a>
        </div>
      </section>
    </div>
  );
}

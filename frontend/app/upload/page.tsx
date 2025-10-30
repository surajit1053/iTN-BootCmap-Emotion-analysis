"use client";

import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return alert("Please enter text for analysis.");
    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/api/v1/analyze", { text });
      const data = res.data;
      if (data.emotions) {
        const formatted = Object.entries(data.emotions)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        setResult(formatted);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setResult("Error during emotion analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an audio or media file.");
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/analyze/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.result);
    } catch (err: any) {
      setResult("Error during file-based emotion evaluation.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-pink-100 py-10 px-4">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">
          🎭 Emotion Analysis Studio
        </h1>
        <div className="flex gap-3">
          <button
            onClick={goToDashboard}
            className="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200 shadow-md"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-2xl transition-all duration-300">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center justify-center">
          ✏️ Text-Based Emotion Analysis
        </h2>
        <form onSubmit={handleTextSubmit} className="flex flex-col gap-5">
          <textarea
            className="border border-gray-300 p-4 rounded-lg shadow-inner h-40 resize-none placeholder-gray-400 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all duration-200"
            placeholder="Enter or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-transform transform hover:scale-[1.03] duration-200 shadow-md ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {loading ? "Analyzing..." : "✨ Analyze Text Emotions"}
          </button>
        </form>
      </section>

      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-2xl mt-10 transition-all duration-300">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 flex items-center justify-center">
          🎵 File Upload Emotion Analysis
        </h2>
        <p className="text-center text-gray-500 text-sm mb-5">
          Supported file types: <strong>.wav, .mp3, .m4a, .ogg, .flac, .aac, .mp4, .mov, .webm, .mkv, .avi</strong>
        </p>
        <form onSubmit={handleFileSubmit} className="flex flex-col gap-5">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="border border-gray-300 p-3 rounded-lg text-gray-700 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition-transform transform hover:scale-[1.03] duration-200 shadow-md ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {loading ? "Uploading..." : "🎧 Analyze File Emotions"}
          </button>
        </form>
      </section>

      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-2xl mt-10 transition-all duration-300">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center justify-center">
          📷 Image Upload Emotion Analysis
        </h2>
        <p className="text-center text-gray-500 text-sm mb-5">
          Supported image formats: <strong>.jpg, .jpeg, .png, .bmp, .webp</strong>
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!file) return alert("Please select an image file.");
            try {
              setLoading(true);
              const formData = new FormData();
              formData.append("file", file);
              const res = await fetch("http://127.0.0.1:8000/api/v1/analyze/image", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              if (data.error) {
                alert(`Error: ${data.error}`);
              } else if (data.emotions) {
                const formatted = Object.entries(data.emotions)
                  .map(([emotion, score]) => `${emotion}: ${score}`)
                  .join(", ");
                setResult(formatted);
              }
            } catch (err) {
              alert("Error during image-based emotion detection.");
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          className="flex flex-col gap-5"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="border border-gray-300 p-3 rounded-lg text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-transform transform hover:scale-[1.03] duration-200 shadow-md ${
              loading ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {loading ? "Analyzing..." : "🧠 Analyze Image Emotions"}
          </button>
        </form>
      </section>

      <section className="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-2xl mt-10 transition-all duration-300">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center justify-center">
          🎙️ Speech to Text Emotion Analysis
        </h2>
        <p className="text-gray-600 text-center mb-4 text-sm">
          Record your voice to auto-convert speech to text and analyze emotions instantly.
        </p>
        <div className="flex justify-center">
          <button
            onClick={async () => {
              try {
                const mediaRecorder = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(mediaRecorder);
                const audioChunks: any[] = [];
                recorder.ondataavailable = (e) => audioChunks.push(e.data);

                recorder.start();
                const startPopup = document.createElement("div");
                startPopup.innerHTML = "🎙️ <strong>Recording started!</strong><br/><span style='font-size:14px;'>Speak now and express your emotions!</span>";
                Object.assign(startPopup.style, {
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  background: "linear-gradient(135deg, #2563eb, #9333ea)",
                  color: "white",
                  padding: "16px 20px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  zIndex: "10000",
                  fontFamily: "system-ui, sans-serif",
                  textAlign: "center",
                  animation: "fadeInOut 6s ease-in-out forwards"
                });

                const fadeKeyframes = document.createElement("style");
                fadeKeyframes.innerHTML = `
                  @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10%, 90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                  }
                `;
                document.head.appendChild(fadeKeyframes);
                document.body.appendChild(startPopup);
                setTimeout(() => startPopup.remove(), 5500);

                setTimeout(async () => {
                  recorder.stop();
                  const stopPopup = document.createElement("div");
                  stopPopup.innerHTML = "🛑 <strong>Recording stopped</strong><br/><span style='font-size:14px;'>Processing your voice for emotion analysis...</span>";
                  Object.assign(stopPopup.style, {
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    color: "white",
                    padding: "16px 20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: "10000",
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "center",
                    animation: "fadeInOut 6s ease-in-out forwards"
                  });

                  const fadeKeyframes = document.createElement("style");
                  fadeKeyframes.innerHTML = `
                    @keyframes fadeInOut {
                      0% { opacity: 0; transform: translateY(-10px); }
                      10%, 90% { opacity: 1; transform: translateY(0); }
                      100% { opacity: 0; transform: translateY(-10px); }
                    }
                  `;
                  document.head.appendChild(fadeKeyframes);
                  document.body.appendChild(stopPopup);
                  setTimeout(() => stopPopup.remove(), 5500);

                  recorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    const formData = new FormData();
                    formData.append("file", audioBlob, "recording.wav");

                    const response = await fetch("http://127.0.0.1:8000/api/v1/analyze/speech", {
                      method: "POST",
                      body: formData,
                    });

                    const data = await response.json();
                    if (data.error) {
                      alert(`Error: ${data.error}`);
                    } else {
                      const convertedPopup = document.createElement("div");
                      convertedPopup.innerHTML = `💬 <strong>Speech converted to text</strong><br/><span style='font-size:14px;'>\"${data.transcribed_text}\"</span>`;
                      Object.assign(convertedPopup.style, {
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        background: "linear-gradient(135deg, #10b981, #14b8a6)",
                        color: "white",
                        padding: "16px 22px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                        zIndex: "10000",
                        fontFamily: "system-ui, sans-serif",
                        textAlign: "center",
                        lineHeight: "1.4",
                        animation: "fadeInOut 7s ease-in-out forwards"
                      });

                      const fadeKeyframes = document.createElement("style");
                      fadeKeyframes.innerHTML = `
                        @keyframes fadeInOut {
                          0% { opacity: 0; transform: translateY(-10px); }
                          10%, 90% { opacity: 1; transform: translateY(0); }
                          100% { opacity: 0; transform: translateY(-10px); }
                        }
                      `;
                      document.head.appendChild(fadeKeyframes);
                      document.body.appendChild(convertedPopup);
                      setTimeout(() => convertedPopup.remove(), 6500);
                      if (data.emotions) {
                        const formatted = Object.entries(data.emotions)
                          .map(([label, score]) => `${label}: ${score}`)
                          .join(", ");
                        setResult(formatted);
                      } else {
                        setResult(JSON.stringify(data, null, 2));
                      }
                    }
                  };
                }, 5000); // Record for 5 seconds
              } catch (err) {
                alert("Error accessing microphone. Please enable permissions.");
                console.error(err);
              }
            }}
            className="py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md transform transition-transform hover:scale-[1.03] duration-200"
          >
            🎤 Start Speech Analysis
          </button>
        </div>
      </section>

      {result && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50 transition-colors duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setResult(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative animate-fadeIn border border-gray-200">
            <button
              onClick={() => setResult(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <h3 className="font-bold text-2xl text-gray-800 mb-4">💡 Emotion Analysis Result</h3>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{result}</p>
          </div>
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </main>
  );
}
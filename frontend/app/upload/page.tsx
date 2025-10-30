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
        <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center justify-center">
          🎵 File Upload Emotion Analysis
        </h2>
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

      {result && (
        <div className="mt-10 p-6 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-xl text-center shadow-inner border border-gray-100 w-full max-w-2xl">
          <h3 className="font-bold text-2xl text-gray-800 mb-4">💡 Emotion Analysis Result</h3>
          <p className="text-gray-700 text-lg leading-relaxed">{result}</p>
        </div>
      )}
    </main>
  );
}
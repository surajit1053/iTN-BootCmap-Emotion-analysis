"use client";

import React, { useState } from "react";
import { fetchEmotionAnalysis } from "@/lib/api";
import Layout from "@/components/Layout";

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmotionAnalysis(text);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-3xl font-bold mb-6">Emotion Analysis</h1>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md mb-4"
          rows={5}
          placeholder="Enter text to analyze..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-md"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {result && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-2">Results:</h2>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
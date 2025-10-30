import React from "react";
import Layout from "@/components/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-12">
        <h1 className="text-3xl font-bold mb-6">About Emotion Analysis</h1>
        <p className="text-lg leading-8 text-gray-700">
          This project uses advanced emotion analysis models to interpret the tone and emotional state
          from user text input. It demonstrates seamless integration between a FastAPI backend and a 
          Next.js frontend, enabling real-time emotional insight generation.
        </p>
        <p className="mt-4 text-md text-gray-600">
          Developed with ❤️ using Next.js 16, React 19, Tailwind, and FastAPI.
        </p>
      </div>
    </Layout>
  );
}
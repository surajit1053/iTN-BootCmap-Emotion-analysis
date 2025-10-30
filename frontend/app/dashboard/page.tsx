"use client";

import { useState } from "react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function DashboardPage() {
  const [accuracyData] = useState([82, 85, 88, 90, 92, 94, 95, 97]);
  const [epochs] = useState([1, 2, 3, 4, 5, 6, 7, 8]);

  const chartData = {
    labels: epochs,
    datasets: [
      {
        label: "Model Accuracy (%)",
        data: accuracyData,
        backgroundColor: "rgba(59,130,246,0.3)",
        borderColor: "rgba(59,130,246,0.8)",
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      tooltip: { callbacks: { label: (ctx: any) => `Accuracy: ${ctx.raw}%` } },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: "#374151" } },
      x: { ticks: { color: "#374151" } },
    },
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 py-10 px-4">
      <div className="w-full max-w-3xl bg-white/80 rounded-2xl shadow-2xl p-8 backdrop-blur border border-gray-200 transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
          📊 Prediction Dashboard
        </h1>
        <div className="bg-white p-4 rounded-xl shadow-inner">
          <Line data={chartData} options={chartOptions} />
        </div>
        <p className="text-gray-700 text-center mt-6 text-lg">
          The chart above shows model accuracy improvement across training epochs.
        </p>
        <div className="text-center mt-8">
          <Link
            href="/upload"
            className="inline-block px-6 py-3 text-white text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md transition-transform transform hover:scale-[1.05]"
          >
            Go to Upload Screen
          </Link>
        </div>
      </div>
    </main>
  );
}
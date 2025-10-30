"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/api/v1/auth/login", formData);
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        router.push("/upload");
      } else {
        setError("Invalid credentials");
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        const registerData = new FormData();
        registerData.append("username", username);
        registerData.append("password", password);
        try {
          await axios.post("http://127.0.0.1:8000/api/v1/auth/register", registerData);
          const loginData = new FormData();
          loginData.append("username", username);
          loginData.append("password", password);
          const response = await axios.post("http://127.0.0.1:8000/api/v1/auth/login", loginData);
          if (response.data.access_token) {
            localStorage.setItem("token", response.data.access_token);
            router.push("/upload");
          }
        } catch {
          setError("Signup failed. Please try another username.");
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/80 border border-white/40">
        <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800 tracking-tight">
          Welcome Back 👋
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-black border border-gray-300 p-3 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-black border border-gray-300 p-3 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            required
          />
          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="py-3 rounded-md font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-transform transform hover:scale-[1.02] duration-200 shadow-md"
          >
            Log In
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6 text-sm">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-700 font-semibold hover:underline"
          >
            Sign Up
          </a>
        </p>
        <p className="text-center text-gray-500 mt-2 text-xs">
          Tip: Use <span className="font-semibold text-gray-800">admin / admin</span> to log in 🪄
        </p>
      </div>
    </main>
  );
}
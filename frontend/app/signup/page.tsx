"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/api/v1/auth/register", formData);

      if (response.status === 200) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError("Signup failed. Username may already exist.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-white to-blue-100">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/80 border border-white/40">
        <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800 tracking-tight">
          Create an Account ✨
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-black border border-gray-300 p-3 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-black border border-gray-300 p-3 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
            required
          />

          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-700 text-center bg-green-50 border border-green-200 rounded-md p-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="py-3 rounded-md font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-transform transform hover:scale-[1.02] duration-200 shadow-md"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-green-700 font-semibold hover:underline">
            Log In
          </a>
        </p>
      </div>
    </main>
  );
}
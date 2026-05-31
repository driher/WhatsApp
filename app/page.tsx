"use client";

import { useState } from "react";

// ============================================
// SIMPLE LOGIN PAGE
// username: sejati
// password: sejiwa
// ============================================

export const viewport = {
  themeColor: "#202c33",
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (
      username === "sehati" &&
      password === "sejiwa"
    ) {
      // redirect ke page.txt
      window.location.href = "/dashboard";
    } else {
      setError("Username atau password salah");
    }
  };

  return (
    <main className="min-h-screen bg-[#111b21] flex items-center justify-center p-5">
      <div
        className="
          w-full
          max-w-sm
          bg-white
          rounded-2xl
          shadow-2xl
          p-6
        "
      >
        {/* LOGO */}
        <div className="text-center mb-6">
          <div
            className="
              w-20 h-20
              rounded-full
              bg-[#00a884]
              mx-auto
              flex items-center justify-center
              text-white text-3xl
              font-bold
            "
          >
            🔒
          </div>

          <h1 className="text-2xl font-bold mt-4">
            Login Relay
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Masuk untuk mengakses sistem
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="
              bg-red-100
              text-red-700
              text-sm
              p-3
              rounded-lg
              mb-4
            "
          >
            {error}
          </div>
        )}

        {/* USERNAME */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Masukkan username"
            className="
              w-full
              border
              rounded-xl
              px-4 py-3
              outline-none
              focus:ring-2
              focus:ring-[#00a884]
            "
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-5">
          <label className="text-sm font-medium mb-1 block">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Masukkan password"
            className="
              w-full
              border
              rounded-xl
              px-4 py-3
              outline-none
              focus:ring-2
              focus:ring-[#00a884]
            "
            onKeyDown={(e) =>
              e.key === "Enter" && handleLogin()
            }
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="
            w-full
            bg-[#00a884]
            hover:bg-[#06cf9c]
            text-white
            font-semibold
            py-3
            rounded-xl
            transition
          "
        >
          Login
        </button>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-5">
          WhatsApp Relay System
        </p>
      </div>
    </main>
  );
}
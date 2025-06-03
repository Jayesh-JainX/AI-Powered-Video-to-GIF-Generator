"use client";

import { useState } from "react";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (email: string, password: string) => void;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <input
        type="email"
        className="w-full px-4 py-2 border border-gray-300 rounded"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full px-4 py-2 border border-gray-300 rounded"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {type === "login" ? "Login" : "Sign Up"}
      </button>
    </form>
  );
}

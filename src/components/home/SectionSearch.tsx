"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  large?: boolean;
}

export default function SectionSearch({ large = false }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a section code.");
      return;
    }
    setError("");
    router.push(`/section/${trimmed}`);
  }

  return (
    <div className="w-full">
      <p className={`text-center font-medium mb-3 ${large ? "text-base text-slate-700 dark:text-slate-300" : "text-sm text-slate-500"}`}>
        Enter your section code to get started
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="e.g. SWE-SE221-42-A"
          className={`flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            large ? "px-4 py-3 text-base" : "px-3 py-2 text-sm"
          }`}
        />
        <button
          type="submit"
          className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shrink-0 ${
            large ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
          }`}
        >
          Enter →
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
      <p className="mt-2 text-xs text-slate-400 text-center">
        Your CR will share the section code with you
      </p>
    </div>
  );
}
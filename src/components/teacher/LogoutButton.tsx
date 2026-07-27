"use client";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/teacher-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.replace("/teacher/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
    >
      Logout
    </button>
  );
}
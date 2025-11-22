/* eslint-disable no-empty */
import React, { useState } from "react";

export default function SummarizeButton({ article }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(() => {
    try {
      const key = "summary:" + (article.link || article.title || "");
      return sessionStorage.getItem(key) || null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const getText = () => article.fullText || article.content || article.summary || article.description || article.title;

  const handleSummarize = async () => {
    if (summary) {
      setOpen(!open);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const payload = { text: getText(), max_length: 60, min_length: 10, num_beams: 4 };
      const res = await fetch("/api/news/summarize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Summarize failed");
      }
      const data = await res.json();
      const s = data.summary || "No summary returned";
      setSummary(s);
      try {
        const key = "summary:" + (article.link || article.title || "");
        sessionStorage.setItem(key, s);
      } catch {}
      setOpen(true);
    } catch (e) {
      setError(e.message || "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={handleSummarize}
        disabled={loading}
        className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
      >
        {loading ? "Summarizing..." : summary ? (open ? "Hide Summary" : "Show Summary") : "Summarize"}
      </button>

      {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

      {open && summary && (
        <div className="mt-3 p-3 bg-gray-50 border rounded-md text-sm text-gray-800">
          {summary}
        </div>
      )}
    </div>
  );
}

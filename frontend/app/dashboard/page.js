"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAudit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to run an audit.");
      }

      const res = await fetch("http://localhost:8000/api/audits/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to start audit");
      }

      const data = await res.json();
      
      router.push(`/audit-progress/${data.id}`);
      setUrl("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-10 py-15">
      <section className="relative flex justify-center mt-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#10B981]/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="flex flex-col gap-8 w-[60%] items-center z-10">
          <h1 className="text-4xl text-center font-semibold">Run a New Audit</h1>
          <p className="text-center text-text-secondary">Enter a client domain below to start a comprehensive SEO and GEO analysis.</p>
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          
          <form onSubmit={handleAudit} className="flex items-center gap-2 justify-center border border-outline p-2 rounded-2xl bg-surface-card w-full max-w-2xl mt-4 shadow-lg shadow-black/20">
            <div className="flex items-center pl-4 flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-text-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              <input 
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="p-3 bg-transparent outline-none text-text-main w-full placeholder:text-text-muted ml-2 text-lg" 
                placeholder="https://clients-domain.com"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-primary-emerald hover:bg-primary-bright transition-colors duration-200 text-[#1A1C1E] rounded-xl font-semibold disabled:opacity-50 min-w-[140px]">
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </form>
        </div>
      </section>
      
      <section className="mt-32">
        <h2 className="text-2xl font-semibold mb-6">Recent Audits</h2>
        <div className="border border-outline bg-surface rounded-2xl p-10 flex flex-col items-center justify-center text-text-muted min-h-[300px]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 text-text-secondary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p>No recent audits found.</p>
          <p className="text-sm mt-1">Run an audit above to see your history.</p>
        </div>
      </section>
    </div>
  );
}

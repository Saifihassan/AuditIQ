"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await res.json();
      
      if (data.access_token) {
        // Store token in localStorage
        localStorage.setItem("token", data.access_token);
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full mt-20 mb-20 relative">
      <div className="flex flex-col gap-6 w-[400px] border border-outline p-8 rounded-3xl bg-surface-card z-10">
        <div className="text-center">
          <h1 className="text-3xl text-text-main font-semibold mb-2">Welcome Back</h1>
          <p className="text-text-secondary text-sm">Sign in to your AuditIQ account</p>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary pl-1" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border border-outline rounded-2xl bg-surface-overlay text-text-main outline-none focus:border-primary-emerald transition-colors placeholder:text-text-muted" 
              placeholder="name@company.com" 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-secondary pl-1" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border border-outline rounded-2xl bg-surface-overlay text-text-main outline-none focus:border-primary-emerald transition-colors placeholder:text-text-muted" 
              placeholder="••••••••" 
            />
          </div>
          
          <div className="flex justify-end">
            <Link href="#" className="text-xs text-primary-emerald hover:text-primary-bright transition-colors">Forgot password?</Link>
          </div>
          
          <button type="submit" disabled={loading} className="w-full mt-2 px-6 py-3 bg-primary-emerald hover:bg-primary-bright transition-colors duration-200 text-[#1A1C1E] rounded-2xl font-semibold text-center block disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className="text-center mt-2">
          <p className="text-sm text-text-muted">
            Don't have an account? <Link href="/signup" className="text-primary-emerald hover:text-primary-bright transition-colors font-medium">Sign up</Link>
          </p>
        </div>
      </div>
      
      {/* Background glow effect to match landing page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10B981]/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
    </div>
  );
}

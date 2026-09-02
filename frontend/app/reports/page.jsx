"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/?session_expired=true");
                    return;
                }

                const res = await fetch("http://localhost:8000/api/reports/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem("token");
                        router.push("/?session_expired=true");
                        return;
                    }
                    throw new Error("Failed to fetch reports");
                }

                const data = await res.json();
                setReports(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [router]);

    const getGradeColor = (grade) => {
        if (!grade) return "text-text-muted";
        const g = grade.toUpperCase();
        if (g === "A" || g === "A+") return "text-emerald-400";
        if (g === "B" || g === "B+") return "text-primary-bright";
        if (g === "C" || g === "C+") return "text-orange-400";
        return "text-red-400";
    };

    const getScoreColor = (score) => {
        if (score == null) return "text-text-muted";
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-orange-400";
        return "text-red-400";
    };

    const getScoreRingStyle = (score) => {
        const pct = Math.min(Math.max(score || 0, 0), 100);
        const circumference = 2 * Math.PI * 36;
        const offset = circumference - (pct / 100) * circumference;
        let strokeColor = "#10B981";
        if (score < 60) strokeColor = "#F87171";
        else if (score < 80) strokeColor = "#FB923C";
        return { circumference, offset, strokeColor };
    };

    const formatDate = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const extractDomain = (url) => {
        try {
            const u = new URL(url);
            return u.hostname;
        } catch {
            return url;
        }
    };

    /* ─── Loading state ─── */
    if (loading) {
        return (
            <section className="min-h-screen px-6 py-10 w-full">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10">
                        <div className="h-10 w-64 bg-surface rounded-xl animate-pulse mb-3" />
                        <div className="h-5 w-96 bg-surface rounded-lg animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-64 bg-surface border border-outline rounded-2xl animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    /* ─── Error state ─── */
    if (error) {
        return (
            <section className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-950/30 border border-red-900/50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
                    <p className="text-text-muted mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-surface border border-outline rounded-xl text-white hover:bg-surface-bright transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    /* ─── Empty state ─── */
    if (reports.length === 0) {
        return (
            <section className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface border border-outline flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-text-muted">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-3">No reports yet</h2>
                    <p className="text-text-muted mb-8 leading-relaxed">
                        Once you complete an SEO audit, your reports will appear here for review.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-8 py-3 bg-primary-emerald text-[#1A1C1E] font-semibold rounded-xl hover:bg-primary-bright transition-colors"
                    >
                        Start an Audit
                    </button>
                </div>
            </section>
        );
    }

    /* ─── Reports grid ─── */
    return (
        <section className="min-h-screen px-6 py-10 w-full overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                {/* Page header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-8 bg-primary-emerald rounded-full" />
                        <h1 className="text-4xl font-semibold text-white tracking-tight">
                            Audit Reports
                        </h1>
                    </div>
                    <p className="text-text-muted text-lg ml-5">
                        {reports.length} completed {reports.length === 1 ? "report" : "reports"} — click to view full details
                    </p>
                </div>

                {/* Report cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reports.map((report) => {
                        const { circumference, offset, strokeColor } = getScoreRingStyle(report.overall_score);

                        return (
                            <button
                                key={report.id}
                                onClick={() => router.push(`/reports/${report.id}`)}
                                className="group relative bg-surface border border-outline rounded-2xl p-6 text-left transition-all duration-300 hover:border-primary-emerald/50 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-emerald"
                            >
                                {/* Top row: score ring + grade badge */}
                                <div className="flex items-start justify-between mb-5">
                                    <div className="relative w-[84px] h-[84px] flex-shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                                            <circle
                                                cx="40" cy="40" r="36"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                                className="text-outline-variant"
                                            />
                                            <circle
                                                cx="40" cy="40" r="36"
                                                fill="none"
                                                stroke={strokeColor}
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                className="transition-all duration-700 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className={`text-xl font-bold ${getScoreColor(report.overall_score)}`}>
                                                {report.overall_score ?? "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {report.overall_grade && (
                                        <span className={`text-sm font-semibold px-3 py-1 rounded-lg border border-outline bg-surface-bright ${getGradeColor(report.overall_grade)}`}>
                                            Grade {report.overall_grade}
                                        </span>
                                    )}
                                </div>

                                {/* Domain */}
                                <h2 className="text-lg font-medium text-white mb-1 truncate group-hover:text-primary-bright transition-colors">
                                    {extractDomain(report.url)}
                                </h2>
                                <p className="text-sm text-text-muted truncate mb-4">{report.url}</p>

                                {/* Summary */}
                                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-5">
                                    {report.executive_summary || "No summary available."}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                                    <span className="text-xs text-text-muted flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                        </svg>
                                        {formatDate(report.created_at)}
                                    </span>
                                    <span className="text-xs font-medium text-primary-emerald flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        View Report
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
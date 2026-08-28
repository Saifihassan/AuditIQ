"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function ReportPage({ params }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const res = await fetch(`http://localhost:8000/api/audits/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch report");
                }

                const data = await res.json();
                if (data.status !== "completed") {
                    router.push(`/audit-progress/${id}`);
                    return;
                }

                setReport({ ...data.result_data, created_at: data.created_at });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAudit();
    }, [id, router]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-text-muted">Loading report...</div>;
    }

    if (error || !report) {
        return <div className="h-screen flex items-center justify-center text-red-500">{error || "Failed to load report"}</div>;
    }

    // Map the report sections to the recommendations format
    const recommendations = [
        {
            severity: report.technical_audit?.status === "Poor" ? "HIGH SEVERITY" : report.technical_audit?.status === "Fair" ? "MEDIUM SEVERITY" : "LOW SEVERITY",
            severityColor: report.technical_audit?.status === "Poor" ? "text-red-500 bg-red-950/30 border-red-900/50" : report.technical_audit?.status === "Fair" ? "text-orange-400 bg-orange-950/30 border-orange-900/50" : "text-emerald-500 bg-emerald-950/30 border-emerald-900/50",
            borderColor: report.technical_audit?.status === "Poor" ? "border-l-red-500" : report.technical_audit?.status === "Fair" ? "border-l-orange-400" : "border-l-emerald-500",
            category: report.technical_audit?.title || "Technical Audit",
            title: report.technical_audit?.key_findings?.[0] || "Technical Review",
            description: report.technical_audit?.remediation_steps?.join(". ") || "No significant issues found.",
            time: "N/A",
            score: "-",
        },
        {
            severity: report.content_audit?.status === "Poor" ? "HIGH SEVERITY" : report.content_audit?.status === "Fair" ? "MEDIUM SEVERITY" : "LOW SEVERITY",
            severityColor: report.content_audit?.status === "Poor" ? "text-red-500 bg-red-950/30 border-red-900/50" : report.content_audit?.status === "Fair" ? "text-orange-400 bg-orange-950/30 border-orange-900/50" : "text-emerald-500 bg-emerald-950/30 border-emerald-900/50",
            borderColor: report.content_audit?.status === "Poor" ? "border-l-red-500" : report.content_audit?.status === "Fair" ? "border-l-orange-400" : "border-l-emerald-500",
            category: report.content_audit?.title || "Content Audit",
            title: report.content_audit?.key_findings?.[0] || "Content Review",
            description: report.content_audit?.remediation_steps?.join(". ") || "No significant issues found.",
            time: "N/A",
            score: "-",
        },
        {
            severity: report.performance_audit?.status === "Poor" ? "HIGH SEVERITY" : report.performance_audit?.status === "Fair" ? "MEDIUM SEVERITY" : "LOW SEVERITY",
            severityColor: report.performance_audit?.status === "Poor" ? "text-red-500 bg-red-950/30 border-red-900/50" : report.performance_audit?.status === "Fair" ? "text-orange-400 bg-orange-950/30 border-orange-900/50" : "text-emerald-500 bg-emerald-950/30 border-emerald-900/50",
            borderColor: report.performance_audit?.status === "Poor" ? "border-l-red-500" : report.performance_audit?.status === "Fair" ? "border-l-orange-400" : "border-l-emerald-500",
            category: report.performance_audit?.title || "Performance Audit",
            title: report.performance_audit?.key_findings?.[0] || "Performance Review",
            description: report.performance_audit?.remediation_steps?.join(". ") || "No significant issues found.",
            time: "N/A",
            score: "-",
        }
    ];

    const issueCount = (report.technical_audit?.key_findings?.length || 0) + 
                       (report.content_audit?.key_findings?.length || 0) + 
                       (report.performance_audit?.key_findings?.length || 0);

    return (
        <section className="h-screen px-4 py-6 w-full overflow-y-auto">
            <header className="w-full pb-8 flex border-b-2 border-outline justify-between">
                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <span className="bg-surface-bright px-4 text-text-muted py-1 border border-outline rounded-2xl">Audit Report</span>
                        <span className="text-text-muted"><p>Generated at: {new Date(report.created_at).toLocaleDateString()}</p></span>
                    </div>
                    <h1 className="text-4xl text-white font-medium">Domain Audit Result</h1>
                    <p className="text-primary-bright text-lg">{report.target_url}</p>
                </div>

                <div className="flex flex-col col-end gap-3 text-right items-center">
                    <span className="text-text-muted">OVERALL HEALTH</span>
                    <p><span className="text-4xl font-semibold text-primary-emerald">{report.overall_score}</span>/100</p>
                    <button className="bg-primary-emerald text-[#1A1C1E] border border-outline px-6 py-2 rounded-4xl w-full flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download PDF
                    </button>
                </div>
            </header>

            <section className="mt-10 pb-20">
                <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="flex flex-col gap-6">
                        <div className="p-6 rounded-2xl bg-surface flex flex-col gap-5 border border-outline">
                            <h3 className="text-xl font-semibold text-white">Executive Summary</h3>
                            <p className="text-text-secondary leading-relaxed">{report.executive_summary}</p>
                            <hr className="border-outline" />
                            <div>
                                <div className="flex flex-col">    
                                    <span className="text-text-muted text-sm uppercase tracking-wider mb-1">Total Issues Detected</span>
                                    <span className="text-3xl font-semibold text-white">{issueCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-surface flex flex-col gap-5 border border-outline">
                            <h3 className="text-xl font-semibold text-white">Top 3 Priorities</h3>
                            <ul className="list-disc pl-5 text-text-secondary flex flex-col gap-3">
                                {report.top_3_priorities?.map((priority, i) => (
                                    <li key={i}>{priority}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-semibold text-white">Actionable Recommendations</h1>
                        </div>

                        <div className="flex flex-col gap-4">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className={`flex justify-between items-start bg-surface border border-outline border-l-4 ${rec.borderColor} rounded-2xl p-6`}>
                                    <div className="flex-1 pr-6">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${rec.severityColor}`}>{rec.severity}</span>
                                            <span className="text-text-muted text-sm font-medium">{rec.category}</span>
                                        </div>
                                        <h2 className="text-xl font-medium mb-3 text-white">{rec.title}</h2>
                                        <p className="text-text-secondary text-sm leading-relaxed max-w-3xl">{rec.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 p-6 rounded-2xl bg-surface border border-outline">
                            <h2 className="text-2xl font-medium mb-6 text-white">30-Day Action Plan</h2>
                            <ul className="space-y-5">
                                {report.thirty_day_action_plan?.map((step, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center text-primary-emerald font-semibold border border-outline">
                                            {idx + 1}
                                        </span>
                                        <p className="text-text-secondary mt-1">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
}

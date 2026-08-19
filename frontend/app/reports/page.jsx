const recommendations = [
    {
        severity: "HIGH SEVERITY",
        severityColor: "text-red-500 bg-red-950/30 border-red-900/50",
        borderColor: "border-l-red-500",
        category: "Security",
        title: "Implement Rate Limiting on Authentication Endpoints",
        description: "Login and password reset endpoints currently lack strict rate limiting, making the application vulnerable to brute force and credential stuffing attacks. Implement IP-based sliding window limits immediately.",
        time: "4 hrs",
        score: "+3",
    },
    {
        severity: "MEDIUM SEVERITY",
        severityColor: "text-orange-400 bg-orange-950/30 border-orange-900/50",
        borderColor: "border-l-orange-400",
        category: "Performance",
        title: "Optimize Core JavaScript Bundle",
        description: "The initial payload for the dashboard exceeds 2.4MB uncompressed. Implement aggressive code splitting for charting libraries and defer non-critical CSS to improve First Contentful Paint.",
        time: "12 hrs",
        score: "+2",
    },
    {
        severity: "LOW SEVERITY",
        severityColor: "text-emerald-500 bg-emerald-950/30 border-emerald-900/50",
        borderColor: "border-l-emerald-500",
        category: "SEO / Accessibility",
        title: "Missing ARIA Labels on Navigation",
        description: "Secondary navigation elements in the mobile menu lack appropriate ARIA attributes, reducing screen reader compatibility. Update the component library to enforce these props.",
        time: "1 hr",
        score: "+1",
    }
];

export default function Reports() {
    return (
        <section className="h-screen px-4 py-6  w-full ">
            <header className="w-full h-40 flex border-b-2 border-outline justify-between">
                <div className="flex flex-col gap-5">

                    <div className="flex items-center gap-4">
                        <span className="bg-surface-bright px-4 text-text-muted py-1 border border-outline rounded-2xl">Audit Report</span>
                        <span className="text-text-muted"><p>Generated at: August 19 2026 </p></span>
                    </div>

                    {/* <div> */}

                    <h1 className="text-4xl text-white font-medium">AcmeCorp Tech Stack</h1>

                    <p className="text-primary-bright ">www.acmecorp.com</p>
                    {/* </div> */}

                </div>

                <div className="flex flex-col col-end gap-3 text-right items-center">
                    <span className="text-text-muted">OVERALL HEALTH</span>
                    <p><span className="text-4xl font-semibold text-primary-emerald">87</span>/100</p>
                    <button className="bg-primary-emerald text-[#1A1C1E] border border-outline px-6 py-2 rounded-4xl w-full flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download PDF
                    </button>
                </div>

            </header>

            <section className="mt-10 p-5">
                <div className="w-full h-full grid grid-cols-3 gap-10">
                    <div className="flex flex-col">
                    <div className="p-6 rounded-2xl bg-surface flex flex-col gap-5 border border-outline ">
                        <h3 className="text-xl">Executive Summary</h3>
                        <p className="text-text-secondary">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Praesentium similique illo officia harum, aliquam beatae ex, incidunt facere nostrum reiciendis facilis aspernatur in quisquam? Alias mollitia rem ratione voluptate facere?</p>
                        <hr />
                        <div>
                            <div className="flex flex-col ">    
                                <span className="text-text-muted text-sm">TOTAL ISSUES</span>
                                <span>24</span>

                            </div>
                        </div>

                    </div>
                        <div>severity distribution</div>

                    </div>

                    <div className="col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-semibold text-white">Prioritized Recommendations</h1>
                            <div className="flex items-center gap-4 text-text-muted">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer hover:text-white transition-colors">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer hover:text-white transition-colors">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className={`flex justify-between items-center bg-surface border border-outline border-l-4 ${rec.borderColor} rounded-2xl p-6`}>
                                    <div className="flex-1 pr-6">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${rec.severityColor}`}>{rec.severity}</span>
                                            <span className="text-text-muted text-sm font-medium">{rec.category}</span>
                                        </div>
                                        <h2 className="text-xl font-medium mb-3 text-white">{rec.title}</h2>
                                        <p className="text-text-secondary text-sm mb-6 leading-relaxed max-w-3xl">{rec.description}</p>
                                        
                                        <div className="flex items-center gap-6 text-text-muted text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                                <span>Est. {rec.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                                                </svg>
                                                <span>{rec.score} Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center gap-4 pl-6 border-l border-outline min-w-[140px] shrink-0">
                                        <button className="px-5 py-2 border border-outline rounded-lg text-sm font-medium hover:bg-surface-bright text-white transition-colors w-full">
                                            View Details
                                        </button>
                                        <button className="text-sm text-text-muted hover:text-white transition-colors font-medium">
                                            Create Ticket
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

        </section>
    )
}
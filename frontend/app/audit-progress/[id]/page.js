"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_MAP = {
  "pending": 0,
  "processing": 0,
  "extracting": 1,
  "analyzing": 2,
  "scoring": 3,
  "generating_report": 4,
  "completed": 5,
};

export default function AuditProgress({ params }) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState(null);

  // Unwrap params for Next.js 15
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    let intervalId;
    
    const fetchStatus = async () => {
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
          throw new Error("Failed to fetch audit status");
        }

        const data = await res.json();
        
        if (data.status === "completed") {
          router.push(`/reports/${id}`);
          return;
        }

        if (data.status === "failed") {
          setError("Audit processing failed.");
          clearInterval(intervalId);
          return;
        }
        
        const mappedIndex = STATUS_MAP[data.status] || 0;
        setCurrentStepIndex(mappedIndex);

      } catch (err) {
        console.error("Error fetching audit status:", err);
      }
    };

    // Fetch immediately, then poll
    fetchStatus();
    intervalId = setInterval(fetchStatus, 5000);

    return () => clearInterval(intervalId);
  }, [id, router]);

  const rawSteps = [
    {
      id: 1,
      title: "Audit Initialization",
      description: "Setting up parameters and agents.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Extractor Agent",
      description: "Crawling website and extracting structured data.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Analysis Agents",
      description: "Technical, Content, and Performance agents running in parallel.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Strategic Agent",
      description: "Scoring and evaluating overall strategic impact.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      )
    },
    {
      id: 5,
      title: "Report Generator Agent",
      description: "Compiling final insights and actionable roadmap.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      )
    }
  ];

  const steps = rawSteps.map((step, idx) => {
    let status = "pending";
    if (idx < currentStepIndex) status = "done";
    else if (idx === currentStepIndex) status = "processing";
    
    return { ...step, status };
  });

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-background text-text-main">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-semibold mb-3">Audit in Progress</h1>
        <p className="text-text-secondary">AI Agents are analyzing your target properties.</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="relative w-full max-w-3xl">
        {/* The continuous vertical line behind the icons */}
        <div className="absolute top-10 bottom-10 left-[48px] w-px bg-outline-variant z-0"></div>

        <div className="flex flex-col gap-6 relative z-10">
          {steps.map((step) => {
            const isDone = step.status === "done";
            const isProcessing = step.status === "processing";

            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-6 p-6 rounded-3xl border transition-colors duration-300 ${
                  isProcessing ? 'border-primary-emerald bg-surface-card bg-opacity-70' : 'border-outline-variant bg-surface'
                }`}
              >
                {/* Icon Circle */}
                <div 
                  className={`flex items-center justify-center w-12 h-12 rounded-full border shrink-0 ${
                    isDone || isProcessing ? 'border-primary-emerald bg-[#16181A]' : 'border-text-muted bg-[#1C1B1B]'
                  }`}
                >
                  {isDone ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary-emerald">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className={isProcessing ? 'text-primary-emerald' : 'text-text-muted'}>{step.icon}</span>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl font-medium ${isDone ? 'line-through text-text-muted' : isProcessing ? 'text-primary-emerald' : 'text-text-main'}`}>
                      {step.title}
                    </h3>
                    {isProcessing && (
                      <span className="px-2 py-0.5 text-xs font-semibold tracking-wider text-primary-emerald bg-primary-emerald/10 border border-primary-emerald/20 rounded-md">
                        PROCESSING
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${isDone ? 'text-text-muted' : 'text-text-secondary'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

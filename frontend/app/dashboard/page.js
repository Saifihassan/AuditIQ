"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState("");
  const [modelName, setModelName] = useState("");
  const [availableProviders, setAvailableProviders] = useState({});
  const [savedKeys, setSavedKeys] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audits, setAudits] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingAudits(false);
          return;
        }

        // Fetch Audits
        const resAudits = await fetch("http://localhost:8000/api/audits/?audit_status=completed", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resAudits.ok) {
          const data = await resAudits.json();
          setAudits(data);
        } else if (resAudits.status === 401) {
          localStorage.removeItem("token");
          router.push("/?session_expired=true");
          return;
        }

        // Fetch Provider Registry
        const resProv = await fetch("http://localhost:8000/api/keys/providers", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resProv.ok) {
          const data = await resProv.json();
          setAvailableProviders(data);
        }

        // Fetch Saved Keys
        const resKeys = await fetch("http://localhost:8000/api/keys/", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resKeys.ok) {
          const data = await resKeys.json();
          const keys = data.map(k => k.provider);
          setSavedKeys(keys);
          if (keys.length > 0) {
            setProvider(keys[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoadingAudits(false);
      }
    };

    fetchData();
  }, []);

  const [dynamicModels, setDynamicModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch models dynamically when provider changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!provider) {
        setDynamicModels([]);
        setModelName("");
        return;
      }
      
      setLoadingModels(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/keys/${provider}/models`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setDynamicModels(data);
          if (data.length > 0) {
            setModelName(data[0].id);
          } else {
            setModelName("");
          }
        } else {
          console.error("Failed to fetch models for provider", provider);
          setDynamicModels([]);
          setModelName("");
        }
      } catch (err) {
        console.error(err);
        setDynamicModels([]);
        setModelName("");
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [provider]);

  const handleAudit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to run an audit.");

      const payload = { url };
      if (provider && modelName) {
        payload.provider = provider;
        payload.model_name = modelName;
      }

      const res = await fetch("http://localhost:8000/api/audits/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/?session_expired=true");
          return;
        }
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to start audit");
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
          
          <form onSubmit={handleAudit} className="flex flex-col gap-4 p-6 rounded-2xl bg-surface-card w-full max-w-2xl mt-4 shadow-lg shadow-black/20 border border-outline">
            
            <div className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary font-medium">Target URL</label>
                <div className="flex items-center bg-surface border border-outline rounded-xl p-2 focus-within:border-primary-emerald transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-muted ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                <input 
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="p-2 bg-transparent outline-none text-text-main w-full placeholder:text-text-muted ml-2 text-md" 
                    placeholder="https://clients-domain.com"
                    required
                />
                </div>
            </div>

            {savedKeys.length > 0 && (
                <div className="flex gap-4 mt-2">
                    <div className="flex-1 flex flex-col gap-2">
                        <label className="text-sm text-text-secondary font-medium flex justify-between">
                            Provider
                            <Link href="/settings/api-keys" className="text-xs text-primary-emerald hover:underline">Manage Keys</Link>
                        </label>
                        <select 
                            value={provider} 
                            onChange={(e) => setProvider(e.target.value)}
                            className="bg-surface border border-outline rounded-xl p-3 outline-none text-sm text-text-main"
                        >
                            <option value="">Default (Global)</option>
                            {(savedKeys || []).map(key => (
                                <option key={key} value={key}>
                                    {availableProviders[key]?.label || key}
                                </option>
                            ))}
                        </select>
                    </div>

                    {provider && availableProviders[provider] && (
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm text-text-secondary font-medium">Model</label>
                            {loadingModels ? (
                                <div className="bg-surface border border-outline rounded-xl p-3 flex items-center justify-center text-sm text-text-muted">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-emerald" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Fetching live models...
                                </div>
                            ) : (
                                <select 
                                    value={modelName} 
                                    onChange={(e) => setModelName(e.target.value)}
                                    className="bg-surface border border-outline rounded-xl p-3 outline-none text-sm text-text-main"
                                >
                                    {(dynamicModels || []).map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.label}
                                        </option>
                                    ))}
                                    {(!dynamicModels || dynamicModels.length === 0) && (
                                        <option value="" disabled>No models found</option>
                                    )}
                                </select>
                            )}
                        </div>
                    )}
                </div>
            )}

            {savedKeys.length === 0 && (
                <div className="text-sm text-text-muted bg-surface/50 border border-outline/50 p-3 rounded-xl flex items-center justify-between">
                    <span>Using default global models.</span>
                    <Link href="/settings/api-keys" className="text-primary-emerald hover:underline font-medium">Bring Your Own Key</Link>
                </div>
            )}

            <button type="submit" disabled={loading} className="mt-4 px-8 py-3 bg-primary-emerald hover:bg-primary-bright transition-colors duration-200 text-[#1A1C1E] rounded-xl font-semibold disabled:opacity-50 w-full">
              {loading ? "Analyzing..." : "Start Analysis"}
            </button>
          </form>
        </div>
      </section>
      
      <section className="mt-32">
        <h2 className="text-2xl font-semibold mb-6">Recent Audits</h2>
        {loadingAudits ? (
          <div className="border border-outline bg-surface rounded-2xl p-10 flex items-center justify-center min-h-[300px]">
            <p className="text-text-muted">Loading recent audits...</p>
          </div>
        ) : audits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(audits || []).map((audit) => (
              <Link href={`/reports/${audit.id}`} key={audit.id} className="border border-outline bg-surface hover:bg-surface-card transition-colors duration-200 rounded-2xl p-6 flex flex-col gap-4 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-emerald/20 flex items-center justify-center text-primary-emerald">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main truncate max-w-[200px]" title={audit.url}>{audit.url}</h3>
                    <p className="text-sm text-text-muted">{new Date(audit.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="px-3 py-1 rounded-full bg-primary-emerald/10 text-primary-emerald text-xs font-medium border border-primary-emerald/20">
                    Completed
                  </span>
                  <span className="text-text-muted text-sm group-hover:text-primary-emerald transition-colors">
                    View Report &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-outline bg-surface rounded-2xl p-10 flex flex-col items-center justify-center text-text-muted min-h-[300px]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 text-text-secondary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p>No recent audits found.</p>
            <p className="text-sm mt-1">Run an audit above to see your history.</p>
          </div>
        )}
      </section>
    </div>
  );
}

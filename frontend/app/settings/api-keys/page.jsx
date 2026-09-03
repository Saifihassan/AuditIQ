"use client";
import React, { useState, useEffect } from "react";


export default function ApiKeys() {
    const [providers, setProviders] = useState({});
    const [savedKeys, setSavedKeys] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        try {
            // Fetch provider registry
            const provRes = await fetch("http://localhost:8000/api/keys/providers", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (provRes.ok) {
                const provData = await provRes.json();
                setProviders(provData);
                if (Object.keys(provData).length > 0) {
                    setSelectedProvider(Object.keys(provData)[0]);
                }
            }

            // Fetch saved keys
            const keysRes = await fetch("http://localhost:8000/api/keys/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (keysRes.ok) {
                const keysData = await keysRes.json();
                setSavedKeys(keysData.map(k => k.provider));
            }
        } catch (error) {
            console.error("Failed to fetch API keys data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!apiKey) return;
        setSaving(true);
        setMessage(null);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/api/keys/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ provider: selectedProvider, api_key: apiKey })
            });
            if (res.ok) {
                setMessage({ type: "success", text: "API Key saved successfully!" });
                setApiKey("");
                if (!savedKeys.includes(selectedProvider)) {
                    setSavedKeys([...savedKeys, selectedProvider]);
                }
            } else {
                setMessage({ type: "error", text: "Failed to save API Key." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Network error." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (providerToDelete) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/api/keys/${providerToDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setSavedKeys(savedKeys.filter(p => p !== providerToDelete));
                setMessage({ type: "success", text: "API Key deleted." });
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <article className="bg-surface p-10 rounded-2xl flex justify-center w-full">
            <div className="w-[50vw]">
                <header>
                    <div>
                        <h1 className="text-2xl">API Keys</h1>
                        <p className="text-text-secondary mt-2">Manage your LLM provider API keys to run custom audits (Bring Your Own Key).</p>
                    </div>
                </header>

                <section className="mt-8 border-b border-outline pb-8">
                    <h2 className="text-lg font-semibold mb-4">Add a New Key</h2>
                    {message && (
                        <div className={`p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm text-text-secondary">Select Provider</label>
                            <select 
                                value={selectedProvider} 
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="w-full bg-transparent border border-outline rounded-xl p-3 mt-1 outline-none"
                            >
                                {Object.keys(providers).map(pKey => (
                                    <option key={pKey} value={pKey} className="bg-surface text-text-primary">
                                        {providers[pKey].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">API Key</label>
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={`Enter your ${providers[selectedProvider]?.label || 'API'} key`} 
                                className="border border-outline bg-transparent rounded-xl mt-1 p-3 w-full outline-none" 
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={saving || !apiKey}
                            className="px-8 py-3 bg-primary-emerald hover:bg-primary-bright disabled:opacity-50 transition-colors duration-200 text-[#1A1C1E] rounded-2xl font-semibold"
                        >
                            {saving ? 'Saving...' : 'Save Key'}
                        </button>
                    </div>
                </section>

                <section className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Saved Integrations</h2>
                    {savedKeys.length === 0 ? (
                        <p className="text-text-secondary text-sm">No API keys saved yet.</p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {savedKeys.map(prov => (
                                <li key={prov} className="flex items-center justify-between p-4 border border-outline rounded-xl bg-surface-light">
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-primary-emerald">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        <span className="font-medium">{providers[prov]?.label || prov}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(prov)}
                                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                                        title="Delete API Key"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </article>
    );
}
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function settings() {
    const [user, setUser] = useState({ username: "", email: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No token found. Please login.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://localhost:8000/api/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem("token");
                        router.push("/?session_expired=true");
                        return;
                    }
                    throw new Error("Failed to fetch user data.");
                }

                const data = await res.json();
                setUser({ username: data.username, email: data.email });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div className="p-10 flex justify-center text-text-muted">Loading profile...</div>;
    }

    if (error) {
        return <div className="p-10 flex justify-center text-red-500">{error}</div>;
    }

    return (
        <>



            <article className="bg-surface p-10 rounded-2xl flex justify-center">
                <div className="w-[50vw]">
                    <header>
                        <div>
                            <h1 className="text-2xl">User Profile</h1>
                            <p className="text-text-secondary">Update your personal details and public branding</p>
                        </div>
                    </header>

                    <section>
                        <div className="mt-10 flex gap-10 items-center">
                            <div className="border border-outline w-32 h-32 rounded-full bg-surface-card flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-text-muted">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <div>
                                <button className="bg-surface px-2 py-3 border rounded-2xl">Upload Avatar</button>
                                <p className="text-text-muted mt-4">Recommended size 256x256px. JPG, PNG, or GIF.</p>
                            </div>
                        </div>


                        <div className="flex gap-10 mt-10">
                            <div className="w-full">
                                <label htmlFor="username">Username</label><br />
                                <input type="text" id="username" value={user.username} onChange={(e) => setUser({...user, username: e.target.value})} className="border border-outline rounded-xl mt-2 p-3 w-full bg-transparent"></input><br />
                            </div>
                            <div className="w-full">
                                <label htmlFor="email">Email</label><br />
                                <input type="email" id="email" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} className="border border-outline rounded-xl mt-2 p-3 w-full bg-transparent"></input>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-between items-center">
                            <button onClick={handleLogout} className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors duration-200 rounded-2xl font-semibold">
                                Logout
                            </button>
                            <button className="px-8 py-3 bg-primary-emerald hover:bg-primary-bright transition-colors duration-200 text-[#1A1C1E] rounded-2xl font-semibold">
                                Save Changes
                            </button>
                        </div>
                    </section>
                </div>
            </article>


        </>

    )
}
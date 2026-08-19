import React from "react";

export default function ApiKeys() {
    return (
        <article className="bg-surface p-10 rounded-2xl flex justify-center w-full">
            <div className="w-[50vw]">
                <header>
                    <div>
                        <h1 className="text-2xl">API Keys</h1>
                        <p className="text-text-secondary">Manage your third-party API keys and integrations</p>
                    </div>
                </header>

                <section>
                    <div className="mt-10">
                        <label htmlFor="openai"> API Key</label><br />
                        <input type="password" id="openai" placeholder="sk-..." className="border border-outline bg-transparent rounded-xl mt-2 p-3 w-full" />
                    </div>
{/* 
                    <div className="mt-10">
                        <label htmlFor="pagespeed">Google PageSpeed Insights Key</label><br />
                        <input type="password" id="pagespeed" placeholder="AIza..." className="border border-outline bg-transparent rounded-xl mt-2 p-3 w-full" />
                    </div>

                    <div className="mt-10">
                        <label htmlFor="searchconsole">Google Search Console API Key</label><br />
                        <input type="password" id="searchconsole" placeholder="AIza..." className="border border-outline bg-transparent rounded-xl mt-2 p-3 w-full" />
                    </div> */}

                    <div className="mt-10 flex justify-end">
                        <button className="px-8 py-3 bg-primary-emerald hover:bg-primary-bright transition-colors duration-200 text-[#1A1C1E] rounded-2xl font-semibold">
                            Save Keys
                        </button>
                    </div>
                </section>
            </div>
        </article>
    );
}
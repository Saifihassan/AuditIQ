import React from "react";

export default function settings() {
    return (
        <>



            <article className="bg-surface p-10 rounded-2xl flex justify-center">
                <div className="w-[50vw]">
                    <header>
                        <div>
                            <h1 className="text-2xl">Profile</h1>
                            <p className="text-text-secondary">Update your agency details and public branding</p>
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
                                <button className="bg-surface px-2 py-3 border rounded-2xl">Upload Logo</button>
                                <p className="text-text-muted mt-4">Recommended size 256x256px. JPG,PNG,or GIF.</p>
                            </div>
                        </div>


                        <div className="flex gap-10 mt-10">
                            <div className="w-full">
                                <label htmlFor="agencyname">Agency Name</label><br />
                                <input type="text" className="border border-outline rounded-xl mt-2 p-3 w-full"></input><br />
                            </div>
                            <div className="w-full">
                                <label htmlFor="contact">Contact Email</label><br />
                                <input type="email" className="border border-outline rounded-xl mt-2 p-3 w-full"></input>
                            </div>

                        </div>

                        <div className="mt-10">
                            <label htmlFor="website">Website</label><br />
                            <input type="url" className="border border-outline bg-transparent rounded-xl mt-2 p-3 w-full"></input>
                        </div>

                        <div className="mt-10 flex justify-end">
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
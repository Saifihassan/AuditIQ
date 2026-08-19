import Link from "next/link";

export default function SettingsLayout({ children }) {
    return (
        <>

            <header className="p-8 h-28">
                <h1 className="text-3xl font-semibold text-text-secondary">Settings</h1>
                <p className="text-text-secondary">Manage your profile and api keys here</p>


            </header>
            <section className="flex justify-around">

                <nav className="flex flex-col gap-8  w-100 p-6">
                    <div className="flex flex-col gap-8 p-4">
                        <Link href="/settings" className="flex items-center gap-3 cursor-pointer p-4 focus:bg-surface focus:border focus:border-outline focus:rounded-2xl hover:bg-surface-bright hover:rounded-2xl text-text-secondary hover:text-primary-bright transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <span>Profile</span>
                        </Link>
                        <Link href="/settings/api-keys" className="flex items-center gap-3 cursor-pointer p-4 focus:bg-surface focus:border focus:border-outline focus:rounded-2xl hover:bg-surface-bright hover:rounded-2xl text-text-secondary hover:text-primary-bright transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                            </svg>
                            <span>API Keys</span>
                        </Link>
                    </div>
                </nav>

                <div className="w-full flex justify-center">
                    {children}
                </div>

            </section>
        </>

    )
}   
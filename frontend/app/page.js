import Image from "next/image";

export default function Home() {
  return (
    <div className="">

      <section className="relative flex justify-center mt-15">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#10B981]/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="flex flex-col gap-8 w-[50%] items-center z-10">
          <h1 className="text-5xl text-center">Automated SEO & GEO Audits</h1>
          <p className="text-center text-text-secondary">Drop A URL . Get A client Ready Report In Minutes , Analyze Performance,Discover Technical Gaps, And Uncover Growth Opportunities</p>
          <form className="flex items-center gap-2 justify-center border border-outline p-2 rounded-2xl bg-surface-card">
            <div className="flex items-center pl-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              <input className="p-2 bg-transparent outline-none text-text-main w-64" placeholder="https://clients-domain.com"></input>
            </div>
            <button className="px-6 py-2 bg-primary-emerald hover:bg-primary-bright transition-colors duration-200 text-[#1A1C1E] rounded-2xl font-semibold">Run Audit</button>
          </form>
        </div>
      </section>

      <section>
        <div className="w-full flex justify-center gap-5 mt-30 px-5">

          <article className="flex flex-col gap-5 border w-100 px-4 rounded-2xl bg-surface justify-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-emerald">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            <span className="text-text-secondary">Lightning Fast</span>
            <span className="text-text-secondary">Compelete techinical crawls and rendering analysis under 3 minutes
            </span>
          </article>
          <article className="flex flex-col gap-5 border justify-center rounded-2xl bg-surface px-4 w-100 py-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-emerald">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            <span className="text-text-secondary">Lightning Fast</span>
            <span className="text-text-secondary">Compelete techinical crawls and rendering analysis under 3 minutes
            </span>
          </article>
          <article className="flex flex-col gap-5 border justify-center rounded-2xl bg-surface w-100 p-4 ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-emerald">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            <span className="text-text-secondary">Lightning Fast</span>
            <span className="text-text-secondary">Compelete techinical crawls and rendering analysis under 3 minutes
            </span>
          </article>

        </div>
      </section>

      <footer className="border-t-2 flex gap-10 items-center h-32 justify-evenly border-outline mt-15">

        <h3 className="text-lg">AuditIQ</h3>
        <ul className="flex gap-6">
          <li className="cursor-pointer hover:text-primary-bright">Privacy Policy</li>
          <li className="cursor-pointer hover:text-primary-bright">Terms of Service</li>
          <li className="cursor-pointer hover:text-primary-bright">Contact</li>
        </ul>

        <p>© 2026 AuditIQ. All Rights Reserved</p>

      </footer>


    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // For the sake of this prototype, we simulate auth state based on the route.
  // If the user is on the landing page, login, or signup, they are "logged out".
  // Otherwise, they are "logged in" and can see the dashboard links.
  const isLoggedOut = pathname === "/" || pathname === "/login" || pathname === "/signup";

  return (
    <nav className="sticky top-0 z-50 flex justify-between bg-surface w-[100%] text-text-secondary py-3 px-10 bg-[#1A1C1E] items-center border-b border-outline">
      <Link href={isLoggedOut ? "/" : "/dashboard"} className="text-primary-emerald text-xl font-medium cursor-pointer">
        AuditIQ
      </Link>

      {!isLoggedOut && (
        <ul className="list-none flex gap-10 justify-evenly items-center">
          <Link href="/dashboard" className="hover:text-primary-bright cursor-pointer">DASHBOARD</Link>
          <Link href="/reports" className="hover:text-primary-bright cursor-pointer">REPORTS</Link>
          <Link href="/settings" className="hover:text-primary-bright cursor-pointer">SETTINGS</Link>
        </ul>
      )}

      <div className="flex gap-4 items-center">
        {isLoggedOut ? (
          <>
            {pathname !== "/login" && (
              <Link href="/login" className="hover:text-primary-bright cursor-pointer font-medium">Log In</Link>
            )}
            {pathname !== "/signup" && (
              <Link href="/signup" className="px-5 py-2.5 bg-primary-emerald hover:bg-primary-bright transition-colors duration-200 text-[#1A1C1E] rounded-2xl font-semibold">
                Sign Up
              </Link>
            )}
          </>
        ) : (
          <Link href="/dashboard" className="px-5 py-2.5 hover:bg-primary-bright text-[#1A1C1E] bg-primary-emerald rounded-2xl transition-colors duration-200 block text-center font-semibold">
            + New Audit
          </Link>
        )}
      </div>
    </nav>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import MemberLogoutButton from "@/components/MemberLogoutButton";

const navigation = [
  {
    label: "Member Dashboard",
    href: "/member/dashboard",
    icon: "⌂",
  },
  {
    label: "Member Information",
    href: "/member/dashboard/member-information",
    icon: "♙",
  },
  {
    label: "Membership Fee",
    href: "/member/dashboard/membership-fee",
    icon: "₹",
  },
  {
    label: "Current Month Payment",
    href: "/member/dashboard/current-payment",
    icon: "▣",
  },
  {
    label: "Submit Monthly Payment",
    href: "/member/dashboard/submit-payment",
    icon: "+",
  },
  {
    label: "Fee Change Request",
    href: "/member/dashboard/fee-change-request",
    icon: "₹",
  },
  {
    label: "Monthly Payment Status",
    href: "/member/dashboard/payment-status",
    icon: "▤",
  },
  {
    label: "My Payment History",
    href: "/member/dashboard/payment-history",
    icon: "▥",
  },
];

export default function MemberDashboardShell({
  children,
  memberName,
}: {
  children: React.ReactNode;
  memberName: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/member/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-wide text-gray-900 sm:text-2xl">
              <span className="text-[#c9a44c]">K</span> KASRAT GYM
            </h1>

            <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
              Member Panel · Welcome, {memberName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden lg:block">
              <MemberLogoutButton />
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-expanded={menuOpen}
              aria-controls="member-mobile-navigation"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-xl text-gray-700 transition hover:bg-amber-50 hover:text-amber-800 lg:hidden"
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div
          id="member-mobile-navigation"
          className="relative z-30 border-b border-gray-200 bg-gray-100 p-4 lg:hidden"
        >
          <nav className="rounded-xl bg-white p-3 shadow-sm">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Member Menu
            </p>

            <div className="grid gap-1 sm:grid-cols-2">
              {navigation.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-amber-50 text-amber-800"
                        : "text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 font-bold">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 lg:hidden">
              <MemberLogoutButton />
            </div>
          </nav>
        </div>
      )}

      {/* Dashboard Layout */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:flex-row lg:px-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 self-start rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:block">
          <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Member Menu
          </h2>

          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-amber-50 text-amber-800"
                      : "text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-base font-bold">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1">
          {children}

          <footer className="mt-8 border-t border-gray-200 py-6 text-center">
            <p className="font-bold tracking-wider text-gray-900">
              KASRAT GYM
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Stronger together. Train with purpose, grow with discipline.
            </p>

            <p className="mt-3 text-xs text-gray-400">
              © 2026 KASRAT GYM. All rights reserved.
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}


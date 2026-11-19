
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import LogoutButton from "@/components/LogoutButton";

async function OwnerPanel({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    redirect("/login");
  }

  await connectDB();

  const admin = await Admin.findById(session.id).select(
    "name role isActive"
  );

  if (!admin || !admin.isActive || admin.role !== "owner") {
    redirect("/login");
  }

  const navigation = [
    {
      label: "Owner Dashboard",
      href: "/owner/dashboard",
      icon: "⌂",
    },
    {
      label: "Add Staff Member",
      href: "/owner/dashboard/staff",
      icon: "+",
    },
    {
      label: "Add New Member",
      href: "/owner/dashboard/add-member",
      icon: "+",
    },
    {
      label: "Pending Member Approvals",
      href: "/owner/dashboard/approvals",
      icon: "♧",
      alert: true,
    },
    {
      label: "Gym Members",
      href: "/owner/dashboard/members",
      icon: "♙",
    },
    {
      label: "Record New Payment",
      href: "/owner/dashboard/record-payment",
      icon: "₹",
      alert: true,
    },
    {
      label: "Payment Requests",
      href: "/owner/dashboard/payment-requests",
      icon: "₹",
      alert: true,
    },
    {
      label: "Payment History",
      href: "/owner/dashboard/payment-history",
      icon: "▤",
    },
    {
      label: "Payment Reports",
      href: "/owner/dashboard/reports",
      icon: "▥",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-5 sm:px-8">
        <div>
          <h1 className="text-xl font-extrabold tracking-wide text-gray-900 sm:text-2xl">
            KASRAT GYM
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Owner Panel · Welcome, {admin.name}
          </p>
        </div>

        <LogoutButton />
      </header>

      {/* SIDEBAR AND CONTENT */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 rounded-xl bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit lg:w-72">
          <h2 className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Management
          </h2>

          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-amber-50 hover:text-amber-800"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-base font-bold">
                    {item.icon}
                  </span>

                  {item.label}
                </span>

                {item.alert && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                    !
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

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

export default function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 p-8 text-center">
          Loading KASRAT GYM Owner Panel...
        </div>
      }
    >
      <OwnerPanel>{children}</OwnerPanel>
    </Suspense>
  );
}

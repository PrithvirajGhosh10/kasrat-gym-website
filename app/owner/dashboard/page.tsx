
export const instant = false;

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

import LogoutButton from "@/components/LogoutButton";
import StaffManagement from "@/components/StaffManagement";
import MemberManagement from "@/components/MemberManagement";
import MemberList from "@/components/MemberList";
import PaymentManagement from "@/components/PaymentManagement";
import PaymentHistory from "@/components/PaymentHistory";

export default async function OwnerDashboard() {
  // 1. Check login session
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // 2. Only owners can access this page
  if (session.role !== "owner") {
    redirect("/login");
  }

  // 3. Verify owner account
  await connectDB();

  const admin = await Admin.findById(session.id).select(
    "name email role isActive"
  );

  if (!admin || !admin.isActive || admin.role !== "owner") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              KASRAT FITNESS CLUB
            </h1>

            <p className="mt-2 text-gray-600">
              Owner Dashboard
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Welcome, {admin.name}!
            </p>
          </div>

          <LogoutButton />
        </header>

        {/* Welcome Panel */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Owner Panel
          </h2>

          <p className="mt-2 text-gray-600">
            Manage your gym, staff members, gym members, and membership payments from one place.
          </p>
        </section>

        {/* Staff Management */}
        <section className="mb-8">
          <StaffManagement />
        </section>

        {/* Member Registration */}
        <section className="mb-8">
          <MemberManagement />
        </section>

        {/* Complete Member List */}
        <section className="mb-8">
          <MemberList />
        </section>

        {/* Payment Management */}
        <section className="mb-8">
          <PaymentManagement />
        </section>

        {/* Payment History */}
        <section className="mb-8">
          <PaymentHistory />
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-6 text-center">
          <p className="font-bold tracking-wider text-gray-900">
            KASRAT FITNESS CLUB
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Stronger together. Train with purpose, grow with discipline.
          </p>

          <p className="mt-3 text-xs text-gray-400">
            © {new Date().getFullYear()} KASRAT Fitness Club. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  );
}

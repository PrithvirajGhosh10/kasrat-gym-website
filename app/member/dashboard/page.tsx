
"use client";

import Link from "next/link";

import {
  useMemberDashboard,
  formatMoney,
  formatFeeMonth,
  getStatusStyle,
} from "@/hooks/useMemberDashboard";

const sections = [
  {
    title: "Member Information",
    description: "View your registered details and membership information.",
    href: "/member/dashboard/member-information",
    icon: "♙",
  },
  {
    title: "Membership Fee",
    description: "Check your monthly fee and outstanding dues.",
    href: "/member/dashboard/membership-fee",
    icon: "₹",
  },
  {
    title: "Current Month Payment",
    description: "View your current billing month's payment details.",
    href: "/member/dashboard/current-payment",
    icon: "▣",
  },
  {
    title: "Submit Monthly Payment",
    description: "Submit a cash or online payment request.",
    href: "/member/dashboard/submit-payment",
    icon: "+",
  },
  {
    title: "Fee Change Request",
    description: "Request a change to your monthly membership fee.",
    href: "/member/dashboard/fee-change-request",
    icon: "₹",
  },
  {
    title: "Monthly Payment Status",
    description: "Track the status of your monthly payments.",
    href: "/member/dashboard/payment-status",
    icon: "▤",
  },
  {
    title: "My Payment History",
    description: "View your previously recorded payments.",
    href: "/member/dashboard/payment-history",
    icon: "▥",
  },
];

export default function MemberDashboard() {
  const { data, loading, error } = useMemberDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-amber-600" />
          <p className="mt-4 text-sm text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Unable to Load Dashboard
        </h2>
        <p className="mt-3 text-sm text-red-600">
          {error || "Dashboard information is unavailable."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
          KASRAT GYM · Member Area
        </p>

        <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Welcome back, {data.member.name.trim().split(/\s+/)[0]}!
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your membership, monthly fees and payment records.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            Monthly Membership Fee
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            {formatMoney(data.member.monthlyFee)}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your current monthly fee.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            Outstanding Dues
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-red-600">
            {formatMoney(data.outstandingDues)}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total unpaid membership fees.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            Current Month Status
          </p>

          <div className="mt-4">
            <span
              className={`inline-block rounded-full px-3 py-2 text-sm font-bold ${getStatusStyle(data.currentMonth.status)}`}
            >
              {data.currentMonth.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {formatFeeMonth(data.currentMonth.feeMonth)}
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Member Services
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose a section to manage your membership.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-xl font-bold text-amber-700 transition group-hover:bg-amber-100">
                {section.icon}
              </div>

              <h3 className="mt-5 font-bold text-gray-900">
                {section.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {section.description}
              </p>

              <p className="mt-4 text-sm font-bold text-amber-700">
                View Section →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Current Payment Details */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-gray-900">
          Current Payment Overview
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          A quick look at your current month's payment.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Billing Month</p>
            <p className="mt-2 font-bold text-gray-900">
              {formatFeeMonth(data.currentMonth.feeMonth)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Amount</p>
            <p className="mt-2 font-bold text-gray-900">
              {formatMoney(data.currentMonth.amount)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Deadline</p>
            <p className="mt-2 font-bold text-gray-900">
              5th of the month
            </p>
          </div>
        </div>

        <Link
          href="/member/dashboard/current-payment"
          className="mt-6 inline-flex rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
        >
          View Payment Details
        </Link>
      </section>
    </div>
  );
}

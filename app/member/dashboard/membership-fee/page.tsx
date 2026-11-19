
"use client";

import {
  useMemberDashboard,
  formatMoney,
  formatDate,
} from "@/hooks/useMemberDashboard";

export default function MembershipFeePage() {
  const { data, loading, error } = useMemberDashboard();

  if (loading) return <p className="rounded-xl bg-white p-6">Loading...</p>;
  if (error || !data) return <p className="rounded-xl bg-white p-6 text-red-600">{error || "Unable to load data."}</p>;

  return (
    <section className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a9822f]">KASRAT GYM</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Membership Fee</h1>
        <p className="mt-2 text-sm text-gray-500">Your current monthly membership fee details.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm text-gray-500">Monthly Membership Fee</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatMoney(data.member.monthlyFee)}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm text-gray-500">Outstanding Dues</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{formatMoney(data.outstandingDues)}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900">Fee Information</h2>
        <p className="text-sm text-gray-600">Member: <strong>{data.member.name}</strong></p>
        <p className="text-sm text-gray-600">SL Number: <strong>{data.member.slNo ?? "Not assigned"}</strong></p>
        <p className="text-sm text-gray-600">Joining Date: <strong>{formatDate(data.member.membershipStartDate)}</strong></p>
        <p className="text-sm text-gray-600">Payment deadline: <strong>5th of every month</strong></p>
      </div>

      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        If you want to change your monthly membership fee, submit a fee change request for the owner to review.
      </p>
    </section>
  );
}

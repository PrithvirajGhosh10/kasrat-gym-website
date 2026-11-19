
"use client";

import {
  useMemberDashboard,
  formatMoney,
  formatFeeMonth,
  formatDate,
  getStatusStyle,
} from "@/hooks/useMemberDashboard";

export default function CurrentPaymentPage() {
  const { data, loading, error } = useMemberDashboard();

  if (loading) return <p className="rounded-xl bg-white p-6">Loading...</p>;
  if (error || !data) return <p className="rounded-xl bg-white p-6 text-red-600">{error || "Unable to load data."}</p>;

  const payment = data.currentMonth;

  return (
    <section className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a9822f]">KASRAT GYM</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Current Payment</h1>
        <p className="mt-2 text-sm text-gray-500">Your payment details for the current month.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm text-gray-500">Payment Month</p>
        <h2 className="mt-1 text-xl font-bold text-gray-900">{formatFeeMonth(payment.feeMonth)}</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Amount Due</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatMoney(payment.amount)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(payment.status)}`}>
              {payment.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="mt-1 font-semibold text-gray-900">{payment.dueDate ? formatDate(payment.dueDate) : "5th of this month"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Date</p>
            <p className="mt-1 font-semibold text-gray-900">{payment.paymentDate ? formatDate(payment.paymentDate) : "Not paid yet"}</p>
          </div>
        </div>
      </div>

      {payment.reviewNote && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Owner's Note</p>
          <p className="mt-1 text-sm text-amber-800">{payment.reviewNote}</p>
        </div>
      )}
    </section>
  );
}

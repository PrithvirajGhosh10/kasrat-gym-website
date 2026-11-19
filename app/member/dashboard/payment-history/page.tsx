
"use client";

import {
  useMemberDashboard,
  formatMoney,
  formatDate,
  formatFeeMonth,
} from "@/hooks/useMemberDashboard";

export default function PaymentHistoryPage() {
  const { data, loading, error } = useMemberDashboard();

  if (loading) return <p className="rounded-xl bg-white p-6">Loading...</p>;
  if (error || !data) return <p className="rounded-xl bg-white p-6 text-red-600">{error || "Unable to load data."}</p>;

  return (
    <section className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a9822f]">KASRAT GYM</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="mt-2 text-sm text-gray-500">View your previously recorded payments.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Payment Month</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment Date</th>
              <th className="p-4">Method</th>
              <th className="p-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {data.paymentHistory.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-900">{formatFeeMonth(payment.feeMonth)}</td>
                <td className="p-4">{formatMoney(payment.amount)}</td>
                <td className="p-4">{formatDate(payment.paymentDate)}</td>
                <td className="p-4 capitalize">{payment.paymentMethod.replaceAll("_", " ")}</td>
                <td className="p-4">{payment.note || "-"}</td>
              </tr>
            ))}

            {data.paymentHistory.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No payment history available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

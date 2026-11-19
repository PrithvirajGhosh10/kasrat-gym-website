
"use client";

import {
  useMemberDashboard,
  formatMoney,
  getStatusStyle,
} from "@/hooks/useMemberDashboard";

export default function PaymentStatusPage() {
  const { data, loading, error } = useMemberDashboard();

  if (loading) return <p className="rounded-xl bg-white p-6">Loading...</p>;
  if (error || !data) return <p className="rounded-xl bg-white p-6 text-red-600">{error || "Unable to load data."}</p>;

  return (
    <section className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a9822f]">KASRAT GYM</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Payment Status</h1>
        <p className="mt-2 text-sm text-gray-500">Check the payment status for each month.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Month</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.monthlyStatus.map((item) => (
              <tr key={item.feeMonth} className="border-b border-gray-100">
                <td className="p-4 font-medium text-gray-900">{item.monthName}</td>
                <td className="p-4">{formatMoney(item.amount)}</td>
                <td className="p-4">{item.dueDate}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                  {item.reviewNote && (
                    <p className="mt-2 max-w-xs text-xs text-gray-500">{item.reviewNote}</p>
                  )}
                </td>
              </tr>
            ))}

            {data.monthlyStatus.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-gray-500">No payment records available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

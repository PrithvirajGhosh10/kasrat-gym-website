
"use client";

import { useEffect, useState } from "react";

interface Payment {
  _id: string;
  amount: number;
  feeMonth?: string;
  paymentDate: string;
  paymentMethod: string;
  note?: string;
  member: {
    name: string;
    phone: string;
  } | null;
  recordedBy: {
    name: string;
    role: string;
  } | null;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetch("/api/payments");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load payment history."
          );
        }

        setPayments(data.payments);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN");
  }

  function formatFeeMonth(month?: string) {
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return "Not assigned";
    }

    const [year, monthNumber] = month.split("-");

    return new Date(
      Number(year),
      Number(monthNumber) - 1,
      1
    ).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Payment History
      </h2>

      <p className="mt-2 text-gray-600">
        View all payments recorded by Owner and Staff.
      </p>

      {loading && (
        <p className="mt-5 text-gray-500">
          Loading payments...
        </p>
      )}

      {error && (
        <p className="mt-5 text-red-600">{error}</p>
      )}

      {!loading && !error && payments.length === 0 && (
        <p className="mt-5 text-gray-500">
          No payments recorded yet.
        </p>
      )}

      {!loading && !error && payments.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Member</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Fee Month</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Method</th>
                <th className="p-3">Recorded By</th>
                <th className="p-3">Note</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b">
                  <td className="p-3 font-medium">
                    {payment.member?.name || "Deleted member"}
                  </td>

                  <td className="p-3">
                    {payment.member?.phone || "-"}
                  </td>

                  <td className="p-3">
                    {formatFeeMonth(payment.feeMonth)}
                  </td>

                  <td className="p-3 font-medium">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </td>

                  <td className="p-3">
                    {formatDate(payment.paymentDate)}
                  </td>

                  <td className="p-3 capitalize">
                    {payment.paymentMethod.replace("_", " ")}
                  </td>

                  <td className="p-3">
                    {payment.recordedBy?.name || "Unknown"}
                  </td>

                  <td className="p-3">
                    {payment.note || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

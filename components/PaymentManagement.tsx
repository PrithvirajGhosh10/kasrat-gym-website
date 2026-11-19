
"use client";

import { useEffect, useState } from "react";

interface MonthlyFeeHistory {
  amount: number;
  effectiveFrom: string;
  updatedAt?: string;
}

interface Member {
  _id: string;
  name: string;
  phone: string;
  monthlyFee: number;
  membershipStartDate: string;
  monthlyFeeHistory?: MonthlyFeeHistory[];
}

export default function PaymentManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState("");

  const [paymentDate, setPaymentDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [feeMonth, setFeeMonth] = useState(
    new Date().toLocaleDateString("en-CA").slice(0, 7)
  );

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const selectedMember = members.find(
    (member) => member._id === memberId
  );

  // Find the fee applicable to the selected billing month.
  function getFeeForMonth(member: Member, selectedMonth: string) {
    const applicableHistory = (member.monthlyFeeHistory || [])
      .filter(
        (item) =>
          item.effectiveFrom &&
          /^\d{4}-(0[1-9]|1[0-2])$/.test(item.effectiveFrom) &&
          item.effectiveFrom <= selectedMonth
      )
      .sort((a, b) =>
        a.effectiveFrom.localeCompare(b.effectiveFrom)
      );

    if (applicableHistory.length > 0) {
      return applicableHistory[applicableHistory.length - 1].amount;
    }

    return member.monthlyFee;
  }

  const amount =
    selectedMember && feeMonth
      ? getFeeForMonth(selectedMember, feeMonth)
      : 0;

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/members/options");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load members.");
        }

        setMembers(data.members);
      } catch (err) {
        setError(true);
        setMessage(
          err instanceof Error
            ? err.message
            : "Unable to load members."
        );
      }
    }

    fetchMembers();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          amount,
          feeMonth,
          paymentDate,
          paymentMethod,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to record payment.");
      }

      setMessage(data.message || "Payment recorded successfully!");

      setMemberId("");
      setPaymentMethod("cash");
      setNote("");
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Record New Payment
      </h2>

      <p className="mt-2 text-gray-600">
        Record the full monthly membership fee received from a gym member.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Select Member
          </label>

          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="">Choose a member</option>

            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} - {member.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Full Monthly Fee (₹)
          </label>

          <input
            type="number"
            value={amount}
            readOnly
            placeholder="Select a member first"
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2"
          />

          <p className="mt-1 text-xs text-gray-500">
            Automatically calculated using the selected month's fee history.
            Full payment only; partial payments are not allowed.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Fee Month
          </label>

          <input
            type="month"
            value={feeMonth}
            onChange={(e) => setFeeMonth(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />

          <p className="mt-1 text-xs text-gray-500">
            Select the month this payment is for. The fee updates automatically.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Payment Date
          </label>

          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">
            Note (Optional)
          </label>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. November membership fee"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading || members.length === 0 || !memberId}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Recording..." : "Record Full Payment"}
          </button>
        </div>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            error ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      {!error && members.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Register a member before recording a payment.
        </p>
      )}
    </div>
  );
}

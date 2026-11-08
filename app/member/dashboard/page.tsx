
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  monthlyFee: number;
  membershipStartDate: string;
}

interface MonthlyStatus {
  feeMonth: string;
  monthName: string;
  amount: number;
  status: string;
  isCurrentMonth: boolean;
  dueDate: string;
}

interface Payment {
  id: string;
  amount: number;
  feeMonth: string | null;
  paymentDate: string;
  paymentMethod: string;
  note?: string;
}

interface DashboardData {
  member: Member;
  currentMonth: {
    feeMonth: string;
    amount: number;
    status: string;
    dueDate: string | null;
    paymentDate: string | null;
  };
  outstandingDues: number;
  monthlyStatus: MonthlyStatus[];
  paymentHistory: Payment[];
}

export default function MemberDashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/members/dashboard", {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/member/login");
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load dashboard.");
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/members/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Logout failed.");
      }

      router.replace("/member/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log out."
      );
      setLoggingOut(false);
    }
  }

  function formatDate(date: string | null | undefined) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatFeeMonth(month: string | null) {
    if (!month) return "Not assigned";

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

  function formatMoney(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Overdue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="mt-4 text-sm text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Unable to Load Dashboard
          </h2>

          <p className="mt-3 text-sm text-red-600">
            {error || "Something went wrong."}
          </p>

          <button
            onClick={() => router.replace("/member/login")}
            className="mt-6 rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 rounded-2xl bg-gray-900 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-semibold tracking-[0.25em] text-gray-400">
                KASRAT FITNESS CLUB
              </p>

              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                Member Dashboard
              </h1>

              <p className="mt-2 text-gray-300">
                Welcome back, {data.member.name.trim().split(/\s+/)[0]}!
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Member Information */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Member Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your registered membership details.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="mt-2 font-semibold text-gray-900">
                {data.member.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="mt-2 font-semibold text-gray-900">
                {data.member.phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="mt-2 break-all font-semibold text-gray-900">
                {data.member.email || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Joining Date</p>
              <p className="mt-2 font-semibold text-gray-900">
                {formatDate(data.member.membershipStartDate)}
              </p>
            </div>
          </div>
        </section>

        {/* Fee Summary */}
        <section className="mb-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Monthly Membership Fee
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {formatMoney(data.member.monthlyFee)}
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Your monthly gym membership charge.
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700">
                Payment deadline
              </p>
              <p className="mt-1 text-sm text-gray-500">
                On or before the 5th of every month.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Outstanding Dues
            </p>

            <h2 className="mt-3 text-3xl font-bold text-red-600">
              {formatMoney(data.outstandingDues)}
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Total unpaid membership fees.
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700">
                Payment Status
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(data.currentMonth.status)}`}
              >
                {data.currentMonth.status}
              </span>
            </div>
          </div>
        </section>

        {/* Current Month */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">
            Current Month Payment
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your payment information for the current billing month.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Billing Month</p>
              <p className="mt-2 font-semibold text-gray-900">
                {formatFeeMonth(data.currentMonth.feeMonth)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Amount</p>
              <p className="mt-2 font-semibold text-gray-900">
                {formatMoney(data.currentMonth.amount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Deadline</p>
              <p className="mt-2 font-semibold text-gray-900">
                5th of the month
              </p>
            </div>
          </div>

          {data.currentMonth.paymentDate && (
            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Payment successfully recorded.
              </p>

              <p className="mt-1 text-sm text-green-700">
                Paid on: {formatDate(data.currentMonth.paymentDate)}
              </p>
            </div>
          )}
        </section>

        {/* Monthly Payment Status */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Monthly Payment Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track your monthly membership payments and outstanding fees.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 font-semibold">Month</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {data.monthlyStatus.map((item) => (
                  <tr
                    key={item.feeMonth}
                    className={`border-b last:border-0 ${
                      item.isCurrentMonth ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {item.monthName}

                      {item.isCurrentMonth && (
                        <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          Current
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-gray-700">
                      {formatMoney(item.amount)}
                    </td>

                    <td className="p-4 text-gray-700">
                      {formatDate(item.dueDate)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.monthlyStatus.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No monthly payment records available.
            </p>
          )}
        </section>

        {/* Payment History */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              My Payment History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View all your previously recorded payments.
            </p>
          </div>

          {data.paymentHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
              <p className="font-medium text-gray-700">
                No payment history yet.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Your payment records will appear here after a payment is recorded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-4 font-semibold">Fee Month</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Payment Date</th>
                    <th className="p-4 font-semibold">Method</th>
                  </tr>
                </thead>

                <tbody>
                  {data.paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        {formatFeeMonth(payment.feeMonth)}
                      </td>

                      <td className="p-4 font-semibold text-gray-900">
                        {formatMoney(payment.amount)}
                      </td>

                      <td className="p-4 text-gray-700">
                        {formatDate(payment.paymentDate)}
                      </td>

                      <td className="p-4 capitalize text-gray-700">
                        {payment.paymentMethod.replace("_", " ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="py-8 text-center">
          <h3 className="text-lg font-extrabold tracking-wider text-gray-900">
            KASRAT FITNESS CLUB
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Stronger together. Train with purpose, grow with discipline.
          </p>

          <p className="mt-4 text-xs text-gray-400">
            © {new Date().getFullYear()} KASRAT Fitness Club. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  );
}

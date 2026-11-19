
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface Member {
  id: string;
  slNo: number | null;
  name: string;
  phone: string;
  email?: string;
  monthlyFee: number;
  membershipStartDate: string;
}

export interface MonthlyStatus {
  feeMonth: string;
  monthName: string;
  amount: number;
  status: string;
  isCurrentMonth: boolean;
  dueDate: string;
  reviewNote?: string;
}

export interface Payment {
  id: string;
  amount: number;
  feeMonth: string | null;
  paymentDate: string;
  paymentMethod: string;
  note?: string;
}

export interface DashboardData {
  member: Member;
  currentMonth: {
    feeMonth: string;
    amount: number;
    status: string;
    dueDate: string | null;
    paymentDate: string | null;
    reviewNote?: string;
  };
  outstandingDues: number;
  monthlyStatus: MonthlyStatus[];
  paymentHistory: Payment[];
}

export function useMemberDashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

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
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refreshDashboard: fetchDashboard,
    setError,
  };
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatFeeMonth(month: string | null) {
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

export function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getStatusStyle(status: string) {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";

    case "Overdue":
    case "Payment Rejected":
      return "bg-red-100 text-red-700";

    case "Verification Pending":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-amber-100 text-amber-800";
  }
}


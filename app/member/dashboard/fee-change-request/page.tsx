
"use client";

import { useCallback, useEffect, useState } from "react";

import {
  useMemberDashboard,
  formatMoney,
  formatDate,
} from "@/hooks/useMemberDashboard";

interface FeeRequest {
  currentFee: number;
  requestedFee: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  effectiveFrom?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
}

function formatEffectiveMonth(month?: string) {
  if (!month) return "-";

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

function getStatusStyle(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export default function FeeChangeRequestPage() {
  const { data, loading, error } = useMemberDashboard();

  const [feeRequest, setFeeRequest] = useState<FeeRequest | null>(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const [requestLoadError, setRequestLoadError] = useState("");

  const [requestedFee, setRequestedFee] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchFeeRequest = useCallback(async () => {
    setRequestLoading(true);
    setRequestLoadError("");

    try {
      const response = await fetch(
        "/api/members/fee-change-request",
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load fee request."
        );
      }

      setFeeRequest(result.request ?? null);
    } catch (err) {
      setRequestLoadError(
        err instanceof Error
          ? err.message
          : "Unable to load fee request."
      );
    } finally {
      setRequestLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeRequest();
  }, [fetchFeeRequest]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!data?.member) {
      setMessage("Unable to load your member information.");
      return;
    }

    if (feeRequest?.status === "pending") {
      setMessage(
        "You already have a pending fee change request."
      );
      return;
    }

    const amount = Number(requestedFee);

    if (
      !Number.isInteger(amount) ||
      amount < 1 ||
      amount > 1000000
    ) {
      setMessage(
        "Please enter a valid monthly fee between ₹1 and ₹10,00,000."
      );
      return;
    }

    if (amount === data.member.monthlyFee) {
      setMessage(
        "The requested fee is already your current applicable fee."
      );
      return;
    }

    if (!reason.trim()) {
      setMessage("Please provide a reason for your request.");
      return;
    }

    if (reason.trim().length > 500) {
      setMessage("Reason cannot exceed 500 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/members/fee-change-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestedFee: amount,
            reason: reason.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to submit request."
        );
      }

      setMessage(
        result.message || "Fee change request submitted successfully."
      );
      setSuccess(true);
      setRequestedFee("");
      setReason("");

      await fetchFeeRequest();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || requestLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        Loading fee information...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white p-6 text-red-600 shadow-sm">
        {error || "Unable to load member information."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#a9822f]">
            KASRAT GYM
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Fee Change Request
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Request a change to your monthly membership fee.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Current Monthly Fee
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900">
            {formatMoney(data.member.monthlyFee)}
          </p>
        </div>

        {requestLoadError ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-700">
              {requestLoadError}
            </p>

            <button
              type="button"
              onClick={fetchFeeRequest}
              className="mt-3 rounded-lg bg-[#c9a44c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a9822f]"
            >
              Retry
            </button>
          </div>
        ) : feeRequest?.status === "pending" ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-gray-900">
                Your Fee Change Request
              </h2>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Pending
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Current Fee
                </p>
                <p className="mt-1 font-semibold">
                  {formatMoney(feeRequest.currentFee)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Requested Fee
                </p>
                <p className="mt-1 font-semibold">
                  {formatMoney(feeRequest.requestedFee)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Submitted On
                </p>
                <p className="mt-1 font-semibold">
                  {formatDate(feeRequest.createdAt)}
                </p>
              </div>
            </div>

            {feeRequest.reason && (
              <p className="mt-4 text-sm text-gray-700">
                <strong>Reason:</strong> {feeRequest.reason}
              </p>
            )}

            <p className="mt-4 text-sm text-amber-800">
              Your request is waiting for the owner's decision.
              You cannot submit another request until this one is reviewed.
            </p>
          </div>
        ) : (
          <>
            {feeRequest && (
              <div className="mt-6 rounded-lg border border-gray-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold text-gray-900">
                    Previous Fee Change Request
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(feeRequest.status)}`}
                  >
                    {feeRequest.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Previous Fee
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatMoney(feeRequest.currentFee)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Requested Fee
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatMoney(feeRequest.requestedFee)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Submitted On
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatDate(feeRequest.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Reviewed On
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatDate(feeRequest.reviewedAt)}
                    </p>
                  </div>
                </div>

                {feeRequest.reason && (
                  <p className="mt-4 text-sm text-gray-700">
                    <strong>Your Reason:</strong> {feeRequest.reason}
                  </p>
                )}

                {feeRequest.reviewNote && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Owner's Note
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {feeRequest.reviewNote}
                    </p>
                  </div>
                )}

                {feeRequest.status === "approved" && (
                  <p className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
                    Your request was approved. The requested fee is
                    scheduled to take effect from{" "}
                    <strong>
                      {formatEffectiveMonth(feeRequest.effectiveFrom)}
                    </strong>.
                  </p>
                )}

                {feeRequest.status === "rejected" && (
                  <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    Your fee change request was rejected. You may
                    submit a new request.
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">
                Submit a New Request
              </h2>

              <div>
                <label
                  htmlFor="requestedFee"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Requested Monthly Fee (₹)
                </label>

                <input
                  id="requestedFee"
                  type="number"
                  min="1"
                  max="1000000"
                  step="1"
                  value={requestedFee}
                  onChange={(e) => setRequestedFee(e.target.value)}
                  placeholder="Enter requested amount"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#c9a44c]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Reason for Request
                </label>

                <textarea
                  id="reason"
                  rows={4}
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are requesting this fee change..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#c9a44c]"
                  required
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {reason.length}/500
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#c9a44c] px-5 py-3 font-semibold text-white transition hover:bg-[#a9822f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Fee Change Request"}
              </button>
            </form>
          </>
        )}

        {message && (
          <p
            className={`mt-5 rounded-lg p-3 text-sm ${
              success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Any approved fee change should take effect from the next
          billing month. Your existing monthly fee remains unchanged
          until then.
        </p>
      </section>
    </div>
  );
}


"use client";

import { useCallback, useEffect, useState } from "react";

interface FeeChangeRequest {
  _id: string;
  member: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    slNo: number | null;
    monthlyFee: number;
  } | null;
  currentFee: number;
  requestedFee: number;
  reason: string;
  status: string;
  createdAt: string;
}

export default function FeeChangeRequests() {
  const [requests, setRequests] = useState<FeeChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      setMessage("");

      const response = await fetch("/api/owner/fee-change-requests", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load requests.");
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Unable to load requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleReview(
    id: string,
    action: "approve" | "reject"
  ) {
    if (processingId) return;

    const reviewNote = reviewNotes[id] || "";

    if (action === "reject" && !reviewNote.trim()) {
      setError(true);
      setMessage("Please enter a reason before rejecting the request.");
      return;
    }

    const confirmed = window.confirm(
      action === "approve"
        ? "Are you sure you want to approve this fee-change request? The new fee will apply from the next billing month."
        : "Are you sure you want to reject this fee-change request?"
    );

    if (!confirmed) return;

    setProcessingId(id);
    setMessage("");
    setError(false);

    try {
      const response = await fetch(
        `/api/owner/fee-change-requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            reviewNote: reviewNote.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to review request.");
      }

      setMessage(data.message || "Request reviewed successfully.");

      setRequests((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setReviewNotes((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProcessingId("");
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Loading fee-change requests...
      </p>
    );
  }

  return (
    <div>
      {message && (
        <div
          role="alert"
          className={`mb-5 rounded-lg p-4 text-sm font-medium ${
            error
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Pending requests:{" "}
          <span className="font-bold text-gray-900">
            {requests.length}
          </span>
        </p>

        <button
          type="button"
          onClick={fetchRequests}
          disabled={Boolean(processingId)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center">
          <p className="text-lg font-semibold text-gray-800">
            No pending fee-change requests
          </p>

          <p className="mt-2 text-sm text-gray-500">
            New member requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-gray-200 p-5"
            >
              {item.member ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Member Details
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-gray-900">
                        {item.member.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        SL No: {item.member.slNo ?? "Not assigned"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Phone: {item.member.phone}
                      </p>

                      {item.member.email && (
                        <p className="mt-1 text-sm text-gray-500">
                          Email: {item.member.email}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      Pending Approval
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        Current Applicable Fee
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹{item.currentFee.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Requested Fee
                      </p>
                      <p className="mt-1 text-lg font-bold text-amber-700">
                        ₹{item.requestedFee.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Difference
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {item.requestedFee > item.currentFee ? "+" : "-"}₹
                        {Math.abs(
                          item.requestedFee - item.currentFee
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Member's Reason
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                      {item.reason || "No reason provided."}
                    </p>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    Submitted on: {formatDate(item.createdAt)}
                  </p>

                  <div className="mt-5">
                    <label
                      htmlFor={`review-${item._id}`}
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Owner Review Note
                    </label>

                    <textarea
                      id={`review-${item._id}`}
                      value={reviewNotes[item._id] || ""}
                      onChange={(e) =>
                        setReviewNotes((previous) => ({
                          ...previous,
                          [item._id]: e.target.value,
                        }))
                      }
                      maxLength={500}
                      rows={2}
                      placeholder="Required when rejecting. Optional when approving."
                      disabled={Boolean(processingId)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-700 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleReview(item._id, "approve")}
                      disabled={Boolean(processingId)}
                      className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                    >
                      {processingId === item._id
                        ? "Processing..."
                        : "Approve Request"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReview(item._id, "reject")}
                      disabled={Boolean(processingId)}
                      className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      Reject Request
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Approved fee changes take effect from the next billing month.
                  </p>
                </>
              ) : (
                <p className="text-sm text-red-600">
                  The associated member account could not be found.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

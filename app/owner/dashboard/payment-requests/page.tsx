
"use client";

import { useEffect, useState } from "react";

interface PaymentRequest {
  _id: string;
  memberName: string;
  phone: string;
  amount: number;
  feeMonth: string;
  paymentMethod: "cash" | "online";
  transactionId?: string;
  proofImageUrl?: string;
  createdAt: string;
}

export default function PaymentRequestsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/owner/payment-requests", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load payment requests.");
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function reviewRequest(
    id: string,
    action: "approve" | "reject"
  ) {
    let reviewNote = "";

    if (action === "reject") {
      reviewNote =
        window.prompt("Enter the reason for rejection:") || "";

      if (!reviewNote.trim()) {
        alert("Please enter a rejection reason.");
        return;
      }
    }

    const confirmed = window.confirm(
      action === "approve"
        ? "Are you sure you want to approve this payment?"
        : "Are you sure you want to reject this payment?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      const response = await fetch(
        `/api/owner/payment-requests/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action, reviewNote }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to review payment.");
      }

      alert(
        action === "approve"
          ? "Payment approved successfully."
          : "Payment rejected successfully."
      );

      await loadRequests();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return <div className="p-6">Loading payment requests...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Requests</h1>
        <p className="mt-2 text-gray-600">
          Review and approve member payment submissions.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
          <button onClick={loadRequests} className="ml-3 underline">
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Pending Requests</p>
        <p className="mt-1 text-3xl font-bold">{requests.length}</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">
            No Pending Requests
          </h2>
          <p className="mt-2 text-gray-500">
            New member payment submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((request, index) => (
            <div
              key={`${request._id || "request"}-${request.feeMonth}-${index}`}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {request.memberName}
                  </h2>
                  <p className="text-gray-500">{request.phone}</p>
                </div>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  Pending Verification
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold">₹{request.amount}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Fee Month</p>
                  <p className="font-semibold">{request.feeMonth}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold capitalize">
                    {request.paymentMethod}
                  </p>
                </div>

                {request.transactionId && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Transaction ID
                    </p>
                    <p className="break-all font-semibold">
                      {request.transactionId}
                    </p>
                  </div>
                )}
              </div>

              {request.proofImageUrl && (
                <div className="mt-5">
                  <p className="mb-2 text-sm text-gray-500">
                    Payment Screenshot
                  </p>

                  <a
                    href={request.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={request.proofImageUrl}
                      alt="Payment proof"
                      className="max-h-64 rounded-lg border object-contain"
                    />
                  </a>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    reviewRequest(request._id, "approve")
                  }
                  disabled={processingId === request._id}
                  className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId === request._id
                    ? "Processing..."
                    : "Approve Payment"}
                </button>

                <button
                  onClick={() =>
                    reviewRequest(request._id, "reject")
                  }
                  disabled={processingId === request._id}
                  className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

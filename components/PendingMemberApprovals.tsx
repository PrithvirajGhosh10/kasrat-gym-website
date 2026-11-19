
"use client";

import { useCallback, useEffect, useState } from "react";

interface PendingMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  registeredAt: string;
  approvalStatus: "pending";
}

export default function PendingMemberApprovals() {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchPendingMembers = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/members/pending");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load registrations.");
      }

      setMembers(data.members || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingMembers();
  }, [fetchPendingMembers]);

  async function handleApproval(
    memberId: string,
    status: "approved" | "rejected"
  ) {
    const action = status === "approved" ? "Approve" : "Reject";

    if (
      status === "rejected" &&
      !window.confirm("Are you sure you want to reject this registration?")
    ) {
      return;
    }

    try {
      setActionLoading(memberId);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/members/${memberId}/approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approvalStatus: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${action} failed.`);
      }

      setMessage(data.message);
      await fetchPendingMembers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setActionLoading("");
    }
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Pending Member Approvals
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review and approve new member registrations.
          </p>
        </div>

        <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">
          {members.length} Pending
        </span>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-6 text-center text-gray-500">
          Loading pending registrations...
        </p>
      ) : members.length === 0 ? (
        <div className="rounded-lg bg-gray-50 px-4 py-8 text-center">
          <p className="font-semibold text-gray-700">
            No pending registrations
          </p>

          <p className="mt-1 text-sm text-gray-500">
            New member sign-ups will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-bold text-gray-900">
                  {member.name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Phone: {member.phone}
                </p>

                {member.email && (
                  <p className="mt-1 text-sm text-gray-600">
                    Email: {member.email}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-500">
                  Registered:{" "}
                  {new Date(member.registeredAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>

                <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                  Pending
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleApproval(member.id, "approved")
                  }
                  disabled={actionLoading !== ""}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === member.id
                    ? "Please wait..."
                    : "Approve"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApproval(member.id, "rejected")
                  }
                  disabled={actionLoading !== ""}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={fetchPendingMembers}
        disabled={loading || actionLoading !== ""}
        className="mt-5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Refresh List
      </button>
    </section>
  );
}

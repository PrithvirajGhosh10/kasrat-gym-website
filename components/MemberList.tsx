
"use client";

import { useEffect, useState } from "react";

interface Member {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  membershipStartDate: string;
  monthlyFee: number;
  isActive: boolean;
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/members/list");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load members.");
        }

        setMembers(data.members);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN");
  }

  async function handleResetPassword(memberId: string) {
    const newPassword = passwords[memberId] || "";

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    setSavingId(memberId);
    setMessage("");

    try {
      const response = await fetch("/api/members/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setMessage(`Password reset successfully for member.`);
      setPasswords((previous) => ({
        ...previous,
        [memberId]: "",
      }));
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Gym Members
      </h2>

      <p className="mt-2 text-gray-600">
        View all registered gym members and manage their passwords.
      </p>

      {loading && (
        <p className="mt-5 text-gray-500">Loading members...</p>
      )}

      {error && (
        <p className="mt-5 text-red-600">{error}</p>
      )}

      {message && (
        <p className="mt-4 text-sm text-blue-600">{message}</p>
      )}

      {!loading && !error && members.length === 0 && (
        <p className="mt-5 text-gray-500">
          No members registered yet.
        </p>
      )}

      {!loading && !error && members.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Joining Date</th>
                <th className="p-3">Monthly Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reset Password</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-b">
                  <td className="p-3 font-medium">{member.name}</td>
                  <td className="p-3">{member.phone}</td>
                  <td className="p-3">{member.email || "-"}</td>
                  <td className="p-3">
                    {formatDate(member.membershipStartDate)}
                  </td>
                  <td className="p-3">₹{member.monthlyFee}</td>
                  <td className="p-3">
                    {member.isActive ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="New password"
                        minLength={8}
                        value={passwords[member._id] || ""}
                        onChange={(e) =>
                          setPasswords((previous) => ({
                            ...previous,
                            [member._id]: e.target.value,
                          }))
                        }
                        className="w-36 rounded-lg border border-gray-300 px-2 py-2"
                      />

                      <button
                        type="button"
                        onClick={() => handleResetPassword(member._id)}
                        disabled={savingId === member._id}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {savingId === member._id ? "Saving..." : "Save"}
                      </button>
                    </div>
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

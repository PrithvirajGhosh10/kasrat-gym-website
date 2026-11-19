
"use client";

import { useEffect, useMemo, useState } from "react";

interface Member {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  membershipStartDate: string;
  slNo?: number;
  monthlyFee: number;
  isActive: boolean;
}

type SortOption = "sl-asc" | "sl-desc" | "name-asc" | "name-desc";

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState("");

  const [slNumbers, setSlNumbers] = useState<Record<string, string>>({});
  const [savingSlNoId, setSavingSlNoId] = useState("");

  const [monthlyFees, setMonthlyFees] = useState<Record<string, string>>({});
  const [savingFeeId, setSavingFeeId] = useState("");

  const [updatingStatusId, setUpdatingStatusId] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Search and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("sl-asc");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch("/api/members/list");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load members.");
        }

        setMembers(data.members);

        const initialSlNumbers: Record<string, string> = {};
        const initialMonthlyFees: Record<string, string> = {};

        for (const member of data.members) {
          initialSlNumbers[member._id] =
            member.slNo?.toString() || "";

          initialMonthlyFees[member._id] =
            member.monthlyFee?.toString() || "";
        }

        setSlNumbers(initialSlNumbers);
        setMonthlyFees(initialMonthlyFees);
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

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  // Search and sort members
  const filteredMembers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = members.filter((member) => {
      return (
        member.name.toLowerCase().includes(search) ||
        member.phone.toLowerCase().includes(search) ||
        (member.slNo !== undefined &&
          member.slNo.toString().includes(search))
      );
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "sl-asc":
          return (a.slNo ?? Infinity) - (b.slNo ?? Infinity);

        case "sl-desc":
          return (b.slNo ?? -Infinity) - (a.slNo ?? -Infinity);

        case "name-asc":
          return a.name.localeCompare(b.name);

        case "name-desc":
          return b.name.localeCompare(a.name);

        default:
          return 0;
      }
    });
  }, [members, searchTerm, sortOption]);

  // Update member SL number (Owner only)
  async function handleUpdateSlNo(memberId: string) {
    const slNoValue = slNumbers[memberId]?.trim() || "";
    const slNo = Number(slNoValue);

    if (!slNoValue || !Number.isInteger(slNo) || slNo < 1) {
      showMessage("Please enter a valid positive SL number.", "error");
      return;
    }

    setSavingSlNoId(memberId);
    setMessage("");

    try {
      const response = await fetch("/api/members/list", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          slNo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update SL number.");
      }

      setMembers((previous) =>
        previous.map((member) =>
          member._id === memberId
            ? { ...member, slNo: data.member.slNo }
            : member
        )
      );

      setSlNumbers((previous) => ({
        ...previous,
        [memberId]: data.member.slNo.toString(),
      }));

      showMessage(
        `SL number updated successfully for ${data.member.name}.`,
        "success"
      );
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Something went wrong.",
        "error"
      );
    } finally {
      setSavingSlNoId("");
    }
  }

  // Update monthly membership fee (Owner only)
  async function handleUpdateMonthlyFee(memberId: string) {
    const feeValue = monthlyFees[memberId]?.trim() || "";
    const monthlyFee = Number(feeValue);

    if (
      !feeValue ||
      !Number.isFinite(monthlyFee) ||
      monthlyFee <= 0 ||
      monthlyFee > 1000000
    ) {
      showMessage("Please enter a valid monthly fee.", "error");
      return;
    }

    setSavingFeeId(memberId);
    setMessage("");

    try {
      const response = await fetch("/api/members/list", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          monthlyFee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update monthly fee.");
      }

      setMembers((previous) =>
        previous.map((member) =>
          member._id === memberId
            ? { ...member, monthlyFee: data.member.monthlyFee }
            : member
        )
      );

      setMonthlyFees((previous) => ({
        ...previous,
        [memberId]: data.member.monthlyFee.toString(),
      }));

      showMessage(
        `Monthly fee updated successfully for ${data.member.name}.`,
        "success"
      );
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Something went wrong.",
        "error"
      );
    } finally {
      setSavingFeeId("");
    }
  }

  // Deactivate or reactivate member (Owner only)
  async function handleToggleMemberStatus(member: Member) {
    const action = member.isActive ? "deactivate" : "reactivate";

    const confirmed = window.confirm(
      member.isActive
        ? `Are you sure you want to deactivate ${member.name}?\n\nThey will no longer be able to log in. Their payment history and records will be preserved.`
        : `Are you sure you want to reactivate ${member.name}?\n\nThey will be able to log in again.`
    );

    if (!confirmed) return;

    setUpdatingStatusId(member._id);
    setMessage("");

    try {
      const response = await fetch("/api/members/list", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member._id,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update member status."
        );
      }

      setMembers((previous) =>
        previous.map((item) =>
          item._id === member._id
            ? { ...item, isActive: data.member.isActive }
            : item
        )
      );

      showMessage(
        data.message || "Member status updated successfully.",
        "success"
      );
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Something went wrong.",
        "error"
      );
    } finally {
      setUpdatingStatusId("");
    }
  }

  // Reset member password
  async function handleResetPassword(memberId: string) {
    const newPassword = passwords[memberId] || "";

    if (newPassword.length < 8) {
      showMessage("Password must be at least 8 characters long.", "error");
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

      showMessage("Password reset successfully for member.", "success");

      setPasswords((previous) => ({
        ...previous,
        [memberId]: "",
      }));
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Something went wrong.",
        "error"
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
        View all registered gym members and manage their SL numbers,
        monthly fees, passwords, and membership status.
      </p>

      {loading && (
        <p className="mt-5 text-gray-500">Loading members...</p>
      )}

      {error && (
        <p className="mt-5 text-red-600">{error}</p>
      )}

      {message && (
        <p
          className={`mt-4 text-sm ${
            messageType === "success"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {!loading && !error && members.length === 0 && (
        <p className="mt-5 text-gray-500">
          No members registered yet.
        </p>
      )}

      {!loading && !error && members.length > 0 && (
        <>
          {/* Search and sorting controls */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-md">
              <label
                htmlFor="member-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search Members
              </label>

              <input
                id="member-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone number or SL number..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="w-full md:w-64">
              <label
                htmlFor="member-sort"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Sort Members By
              </label>

              <select
                id="member-sort"
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value as SortOption)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="sl-asc">SL Number: Low to High</option>
                <option value="sl-desc">SL Number: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredMembers.length} of {members.length} members
            </p>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Members table */}
          {filteredMembers.length === 0 ? (
            <p className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-500">
              No members found matching your search.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1650px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">SL No.</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Joining Date</th>
                    <th className="p-3">Monthly Fee</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reset Password</th>
                    <th className="p-3">Membership Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member._id} className="border-b">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={slNumbers[member._id] || ""}
                            onChange={(e) =>
                              setSlNumbers((previous) => ({
                                ...previous,
                                [member._id]: e.target.value,
                              }))
                            }
                            className="w-20 rounded-lg border border-gray-300 px-2 py-2"
                          />

                          <button
                            type="button"
                            onClick={() => handleUpdateSlNo(member._id)}
                            disabled={savingSlNoId === member._id}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            {savingSlNoId === member._id
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </div>
                      </td>

                      <td className="p-3 font-medium">{member.name}</td>

                      <td className="p-3">{member.phone}</td>

                      <td className="p-3">{member.email || "-"}</td>

                      <td className="p-3">
                        {formatDate(member.membershipStartDate)}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span>₹</span>

                          <input
                            type="number"
                            min="1"
                            max="1000000"
                            step="1"
                            value={monthlyFees[member._id] || ""}
                            onChange={(e) =>
                              setMonthlyFees((previous) => ({
                                ...previous,
                                [member._id]: e.target.value,
                              }))
                            }
                            className="w-24 rounded-lg border border-gray-300 px-2 py-2"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateMonthlyFee(member._id)
                            }
                            disabled={savingFeeId === member._id}
                            className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {savingFeeId === member._id
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={
                            member.isActive
                              ? "font-medium text-green-600"
                              : "font-medium text-red-600"
                          }
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
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

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleMemberStatus(member)}
                          disabled={updatingStatusId === member._id}
                          className={`rounded-lg px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                            member.isActive
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {updatingStatusId === member._id
                            ? "Updating..."
                            : member.isActive
                              ? "Deactivate"
                              : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

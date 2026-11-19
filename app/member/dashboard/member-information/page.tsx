
"use client";

import {
  useMemberDashboard,
  formatDate,
} from "@/hooks/useMemberDashboard";

export default function MemberInformationPage() {
  const { data, loading, error } = useMemberDashboard();

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        Loading member information...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-red-600 shadow-sm">
        {error || "Unable to load member information."}
      </div>
    );
  }

  const member = data.member;

  const details = [
    { label: "SL Number", value: member.slNo ?? "Not assigned" },
    { label: "Full Name", value: member.name },
    { label: "Phone Number", value: member.phone },
    { label: "Email Address", value: member.email || "Not provided" },
    {
      label: "Joining Date",
      value: formatDate(member.membershipStartDate),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 border-b border-gray-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#a9822f]">
            KASRAT GYM
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Member Information
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View your registered membership details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {details.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {item.label}
              </p>

              <p className="mt-2 break-words text-base font-semibold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Your SL Number is assigned and managed by the gym owner.
            Contact the gym owner if any registered information needs correction.
          </p>
        </div>
      </section>
    </div>
  );
}

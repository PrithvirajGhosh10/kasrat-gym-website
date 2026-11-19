
import Link from "next/link";

const sections = [
  {
    title: "Add Staff Member",
    description: "Create and manage gym staff accounts.",
    href: "/owner/dashboard/staff",
    icon: "👤",
  },
  {
    title: "Add New Member",
    description: "Register a new gym member.",
    href: "/owner/dashboard/add-member",
    icon: "➕",
  },
  {
    title: "Pending Member Approvals",
    description: "Review new member registration requests.",
    href: "/owner/dashboard/approvals",
    icon: "🔔",
    notification: true,
  },
  {
    title: "Gym Members",
    description: "Search and manage all gym members.",
    href: "/owner/dashboard/members",
    icon: "👥",
  },
  {
    title: "Fee Change Requests",
    description: "Review and approve or reject monthly fee change requests.",
    href: "/owner/dashboard/fee-requests",
    icon: "💰",
    notification: true,
  },
  {
    title: "Record New Payment",
    description: "Record monthly membership fee payments.",
    href: "/owner/dashboard/record-payment",
    icon: "💳",
    notification: true,
  },
  {
    title: "Payment History",
    description: "View all previously recorded payments.",
    href: "/owner/dashboard/payment-history",
    icon: "📋",
  },
];

export default function OwnerDashboard() {
  return (
    <div>
      <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
          Management Dashboard
        </p>

        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Welcome to the Owner Panel
        </h2>

        <p className="mt-2 text-gray-600">
          Manage your gym staff, members, approvals, and payments
          from their individual sections.
        </p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
          >
            {section.notification && (
              <span className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                !
              </span>
            )}

            <div className="mb-4 text-3xl">
              {section.icon}
            </div>

            <h3 className="pr-8 text-lg font-bold text-gray-900 transition group-hover:text-amber-800">
              {section.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {section.description}
            </p>

            <p className="mt-5 text-sm font-bold text-amber-700">
              Open section →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

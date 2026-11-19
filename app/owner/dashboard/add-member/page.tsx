
import MemberManagement from "@/components/MemberManagement";

export default function AddMemberPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Add New Member
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Register a new gym member and manage their membership details.
        </p>
      </div>

      <MemberManagement />
    </div>
  );
}


import MemberList from "@/components/MemberList";

export default function GymMembersPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Gym Members
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          View and manage all registered KASRAT GYM members.
          Search members by name or phone number.
        </p>
      </div>

      <MemberList />
    </div>
  );
}

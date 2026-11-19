
import StaffManagement from "@/components/StaffManagement";

export default function AddStaffPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Add Staff Member
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Create and manage staff accounts for KASRAT GYM.
        </p>
      </div>

      <StaffManagement />
    </div>
  );
}

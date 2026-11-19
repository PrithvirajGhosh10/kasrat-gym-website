
import PendingMemberApprovals from "@/components/PendingMemberApprovals";

export default function PendingApprovalsPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Pending Member Approvals
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Review new gym membership requests and approve or reject applications.
        </p>
      </div>

      <PendingMemberApprovals />
    </div>
  );
}

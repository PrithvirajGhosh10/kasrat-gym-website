
import FeeChangeRequests from "@/components/FeeChangeRequests";

export default function FeeChangeRequestsPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Fee Change Requests
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Review members' requests to change their monthly membership fees.
          Approved changes take effect from the next billing month.
        </p>
      </div>

      <FeeChangeRequests />
    </div>
  );
}

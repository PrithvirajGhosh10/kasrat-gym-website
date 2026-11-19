
import PaymentHistory from "@/components/PaymentHistory";

export default function PaymentHistoryPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Payment History
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          View previously recorded membership payments and their details.
        </p>
      </div>

      <PaymentHistory />
    </div>
  );
}

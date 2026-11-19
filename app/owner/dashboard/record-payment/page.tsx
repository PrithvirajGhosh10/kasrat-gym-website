
import PaymentManagement from "@/components/PaymentManagement";

export default function RecordPaymentPage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Record New Payment
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Record monthly membership fee payments received from gym members.
        </p>
      </div>

      <PaymentManagement />
    </div>
  );
}

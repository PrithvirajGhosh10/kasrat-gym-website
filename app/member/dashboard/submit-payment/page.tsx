
"use client";

import { useState } from "react";

import {
  useMemberDashboard,
  formatMoney,
  formatFeeMonth,
} from "@/hooks/useMemberDashboard";

export default function SubmitPaymentPage() {
  const { data, loading, error, refreshDashboard } =
    useMemberDashboard();

  const [method, setMethod] = useState<"cash" | "online">("cash");
  const [transactionId, setTransactionId] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    if (submitting) return;

    if (!data) {
      setMessageType("error");
      setMessage("Unable to load your billing information.");
      return;
    }

    // Validate billing month.
    const feeMonth = data.currentMonth?.feeMonth;

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(feeMonth || "")) {
      setMessageType("error");
      setMessage(
        "Unable to identify your current billing month. Please refresh the page."
      );
      return;
    }

    // Validate online payment details.
    if (method === "online") {
      if (!transactionId.trim()) {
        setMessageType("error");
        setMessage("Please enter your transaction ID.");
        return;
      }

      if (!proof) {
        setMessageType("error");
        setMessage("Please upload your payment screenshot.");
        return;
      }
    }

    // Validate screenshot.
    if (proof) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(proof.type)) {
        setMessageType("error");
        setMessage("Only JPG, PNG and WEBP images are allowed.");
        return;
      }

      if (proof.size === 0) {
        setMessageType("error");
        setMessage("The selected screenshot is empty.");
        return;
      }

      if (proof.size > 5 * 1024 * 1024) {
        setMessageType("error");
        setMessage("Screenshot must not exceed 5 MB.");
        return;
      }
    }

    setSubmitting(true);

    try {
      let proofUrl = "";

      // 1. Upload screenshot for online payments.
      if (method === "online" && proof) {
        const formData = new FormData();
        formData.append("file", proof);

        const uploadResponse = await fetch(
          "/api/members/upload-proof",
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult.message || "Screenshot upload failed."
          );
        }

        // IMPORTANT: Upload API returns imageUrl, not url.
        if (
          typeof uploadResult.imageUrl !== "string" ||
          !uploadResult.imageUrl.trim()
        ) {
          throw new Error(
            "Screenshot uploaded, but its URL was not received."
          );
        }

        proofUrl = uploadResult.imageUrl.trim();
      }

      // 2. Submit payment request.
      const response = await fetch(
        "/api/members/payment-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feeMonth,
            paymentMethod: method,
            transactionId:
              method === "online" ? transactionId.trim() : "",
            proofUrl,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Payment request failed."
        );
      }

      // 3. Show success message.
      setMessageType("success");
      setMessage(
        result.message ||
          "Payment request submitted successfully."
      );

      // 4. Reset form.
      setTransactionId("");
      setProof(null);

      const fileInput = document.getElementById(
        "payment-proof"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      // 5. Refresh member dashboard.
      await refreshDashboard();
    } catch (err) {
      console.error("Payment submission error:", err);

      setMessageType("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="rounded-xl bg-white p-6">
        Loading...
      </p>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded-xl bg-white p-6 text-red-600">
        {error || "Unable to load data."}
      </p>
    );
  }

  return (
    <section className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
      {/* Heading */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a9822f]">
          KASRAT GYM
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Submit Payment
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Submit your monthly membership payment for verification.
        </p>
      </div>

      {/* Payment Information */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm text-gray-500">
          Payment Month
        </p>

        <p className="mt-1 text-lg font-bold text-gray-900">
          {formatFeeMonth(data.currentMonth.feeMonth)}
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Amount to Pay
        </p>

        <p className="mt-1 text-3xl font-bold text-gray-900">
          {formatMoney(data.currentMonth.amount)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Payment Method */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Payment Method
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-lg border p-4 ${
                method === "cash"
                  ? "border-[#c9a44c] bg-amber-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="method"
                value="cash"
                checked={method === "cash"}
                onChange={() => setMethod("cash")}
              />

              <span className="ml-2 font-semibold text-gray-900">
                Cash
              </span>

              <p className="mt-1 text-xs text-gray-500">
                Pay directly at the gym.
              </p>
            </label>

            <label
              className={`cursor-pointer rounded-lg border p-4 ${
                method === "online"
                  ? "border-[#c9a44c] bg-amber-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="method"
                value="online"
                checked={method === "online"}
                onChange={() => setMethod("online")}
              />

              <span className="ml-2 font-semibold text-gray-900">
                Online
              </span>

              <p className="mt-1 text-xs text-gray-500">
                Pay using UPI or bank transfer.
              </p>
            </label>
          </div>
        </div>

        {/* Online Payment Details */}
        {method === "online" && (
          <div className="space-y-4 rounded-lg border border-gray-200 p-5">
            {/* QR Code Placeholder */}
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="font-semibold text-gray-800">
                Payment QR Code
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Your gym QR code will be displayed here.
              </p>

              <p className="mt-3 text-xs text-gray-400">
                QR code placeholder
              </p>
            </div>

            {/* Transaction ID */}
            <div>
              <label
                htmlFor="transactionId"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Transaction ID / UTR Number
              </label>

              <input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) =>
                  setTransactionId(e.target.value)
                }
                placeholder="Enter transaction ID"
                autoComplete="off"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#c9a44c]"
                required={method === "online"}
                disabled={submitting}
              />
            </div>

            {/* Payment Screenshot */}
            <div>
              <label
                htmlFor="payment-proof"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Payment Screenshot
              </label>

              <input
                id="payment-proof"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  setProof(e.target.files?.[0] || null)
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                required={method === "online"}
                disabled={submitting}
              />

              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG or WEBP. Maximum size: 5 MB.
              </p>

              {proof && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {proof.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success and Error Messages */}
        {message && (
          <p
            role="alert"
            className={`rounded-lg p-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#c9a44c] px-5 py-3 font-semibold text-white transition hover:bg-[#a9822f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Submitting..." : "Submit Payment"}
        </button>
      </form>

      {/* Payment Verification Notice */}
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Your payment request will remain pending until the gym owner verifies it.
      </p>
    </section>
  );
}

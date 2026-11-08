
"use client";

import { useState } from "react";

export default function MemberManagement() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("400");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
          membershipStartDate: startDate,
          monthlyFee,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to register member.");
      }

      setMessage("Member registered successfully!");

      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setStartDate("");
      setMonthlyFee("400");
      setShowPassword(false);
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

      {/* Heading */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Member Management
        </p>

        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Add New Member
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Register a new gym member and create their login account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Details */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-gray-900">
            Personal Information
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label htmlFor="member-name" className={labelClass}>
                Member Name
              </label>

              <input
                id="member-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Enter member name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="member-phone" className={labelClass}>
                Phone Number
              </label>

              <input
                id="member-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="numeric"
                placeholder="Enter phone number"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="member-email" className={labelClass}>
                Email Address
                <span className="ml-2 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="member-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className={inputClass}
              />
            </div>

          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Login Details */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-gray-900">
            Login Credentials
          </h3>

          <div>
            <label htmlFor="member-password" className={labelClass}>
              Member Password
            </label>

            <div className="relative">
              <input
                id="member-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                className={`${inputClass} pr-16`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 hover:text-gray-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              The member will use their phone number and this password to log in.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Membership Details */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-gray-900">
            Membership Details
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label htmlFor="monthly-fee" className={labelClass}>
                Monthly Fee (₹)
              </label>

              <input
                id="monthly-fee"
                type="number"
                min="1"
                step="1"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                required
                className={inputClass}
              />

              <p className="mt-2 text-xs text-gray-400">
                Default membership fee is ₹400 per month.
              </p>
            </div>

            <div>
              <label htmlFor="joining-date" className={labelClass}>
                Joining Date
              </label>

              <input
                id="joining-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                max={new Date().toLocaleDateString("en-CA")}
                className={inputClass}
              />
            </div>

          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            role="alert"
            className={`rounded-lg p-4 text-sm font-medium ${
              error
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Registering Member..." : "Register Member"}
          </button>
        </div>

      </form>
    </section>
  );
}

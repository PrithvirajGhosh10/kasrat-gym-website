
import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getMemberSession } from "@/lib/member-auth";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import MemberDashboardShell from "@/components/MemberDashboardShell";

async function AuthenticatedMemberPanel({
  children,
}: {
  children: ReactNode;
}) {
  await connection();

  const session = await getMemberSession();

  if (!session || session.role !== "member") {
    redirect("/member/login");
  }

  await connectDB();

  const member = await Member.findById(session.id).select(
    "name isActive approvalStatus"
  );

  if (
    !member ||
    !member.isActive ||
    member.approvalStatus !== "approved"
  ) {
    redirect("/member/login");
  }

  return (
    <MemberDashboardShell memberName={member.name}>
      {children}
    </MemberDashboardShell>
  );
}

export default function MemberDashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="font-semibold text-gray-600">
            Loading member dashboard...
          </p>
        </div>
      }
    >
      <AuthenticatedMemberPanel>
        {children}
      </AuthenticatedMemberPanel>
    </Suspense>
  );
}


import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const MEMBER_SESSION_COOKIE = "kasrat_member_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is missing from .env.local");
  }

  return new TextEncoder().encode(secret);
}

export async function createMemberSession(memberId: string) {
  const token = await new SignJWT({
    role: "member",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(memberId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(MEMBER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getMemberSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (
      typeof payload.sub !== "string" ||
      payload.role !== "member"
    ) {
      return null;
    }

    return {
      id: payload.sub,
      role: "member" as const,
    };
  } catch {
    return null;
  }
}

export async function deleteMemberSession() {
  const cookieStore = await cookies();

  cookieStore.set(MEMBER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

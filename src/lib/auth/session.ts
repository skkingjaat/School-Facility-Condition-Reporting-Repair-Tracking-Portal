import { cookies } from "next/headers";

import {
  createAuthToken,
  verifyAuthToken,
  type AuthTokenPayload,
} from "@/lib/auth/jwt";

const AUTH_COOKIE_NAME = "school_facility_auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setAuthCookie(
  payload: AuthTokenPayload
): Promise<void> {
  const token = await createAuthToken(payload);

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function getAuthSession(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
}
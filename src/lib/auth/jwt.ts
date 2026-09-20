import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export type AuthTokenPayload = {
  userId: string;
  role: "PARENT" | "TEACHER" | "ADMIN";
  schoolId: string;
};

export async function createAuthToken(
  payload: AuthTokenPayload
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    schoolId: payload.schoolId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(
  token: string
): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secret);

  if (
    typeof payload.userId !== "string" ||
    typeof payload.schoolId !== "string" ||
    (payload.role !== "PARENT" &&
      payload.role !== "TEACHER" &&
      payload.role !== "ADMIN")
  ) {
    throw new Error("Invalid authentication token");
  }

  return {
    userId: payload.userId,
    role: payload.role,
    schoolId: payload.schoolId,
  };
}
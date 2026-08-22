import type { NextFunction, Request, Response } from "express";
import { adminAuth, db } from "./firebaseAdmin.js";

export type ClubRole = "PLAYER" | "LEVEL_ADMIN" | "SUPER_ADMIN";

export type AuthenticatedMember = {
  uid: string;
  email: string;
  role: ClubRole;
  fullName: string;
  memberId: string;
  flightId?: string;
  activityIds?: string[];
};

declare global {
  namespace Express {
    interface Request {
      member?: AuthenticatedMember;
    }
  }
}

function bearerToken(request: Request): string | null {
  const value = request.headers.authorization;
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice("Bearer ".length).trim() || null;
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  try {
    const token = bearerToken(request);
    if (!token) return response.status(401).json({ message: "Missing sign-in token." });

    const decoded = await adminAuth.verifyIdToken(token);
    const memberDocument = await db.collection("members").doc(decoded.uid).get();

    if (!memberDocument.exists) {
      return response.status(403).json({
        message: "This Firebase account is not an approved Indian Club member account."
      });
    }

    const member = memberDocument.data() as Omit<AuthenticatedMember, "uid" | "email">;
    if (!member || !["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role)) {
      return response.status(403).json({ message: "Your Indian Club role is not valid." });
    }

    request.member = {
      uid: decoded.uid,
      email: decoded.email || "",
      role: member.role,
      fullName: member.fullName,
      memberId: member.memberId,
      flightId: member.flightId || undefined,
      activityIds: member.activityIds || []
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return response.status(401).json({ message: "Your login session is invalid or expired." });
  }
}

export function requireRole(...allowedRoles: ClubRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.member) return response.status(401).json({ message: "Sign in required." });
    if (!allowedRoles.includes(request.member.role)) {
      return response.status(403).json({ message: "You do not have permission for this action." });
    }
    next();
  };
}

export function requireFlightAccess(flightId: string | undefined, member: AuthenticatedMember) {
  if (member.role === "SUPER_ADMIN") return true;
  if (member.role === "LEVEL_ADMIN" && member.flightId === flightId) return true;
  return false;
}

export function requireOwnMember(targetUid: string, member: AuthenticatedMember) {
  return member.role === "SUPER_ADMIN" || member.uid === targetUid;
}

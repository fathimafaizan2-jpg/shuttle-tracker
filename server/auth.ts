import type { NextFunction, Request, Response } from "express";
import { adminAuth, db } from "./firebaseAdmin.js";

export type Role = "SUPER_ADMIN" | "LEVEL_ADMIN" | "PLAYER";
export type Member = {
  uid: string;
  clubId: string;
  fullName: string;
  memberId: string;
  phone: string;
  role: Role;
  flightId: string | null;
  active: boolean;
  mustChangePassword: boolean;
};

declare global {
  namespace Express { interface Request { member?: Member } }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Sign in required" });
    const token = await adminAuth.verifyIdToken(header.slice(7));
    const snap = await db.collection("members").doc(token.uid).get();
    if (!snap.exists) return res.status(403).json({ error: "Account must be created by Super Admin" });
    const member = { uid: token.uid, ...snap.data() } as Member;
    if (!member.active) return res.status(403).json({ error: "Account inactive" });
    req.member = member;
    next();
  } catch { res.status(401).json({ error: "Invalid sign-in token" }); }
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.member || !roles.includes(req.member.role)) return res.status(403).json({ error: "Not allowed" });
    next();
  };
}

export function requireSameFlight(flightId: string, req: Request) {
  if (req.member?.role === "SUPER_ADMIN") return;
  if (req.member?.flightId !== flightId) throw new Error("Flight access denied");
}

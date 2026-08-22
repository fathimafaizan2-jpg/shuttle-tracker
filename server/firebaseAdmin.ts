import "dotenv/config";
import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is missing");

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });

export const adminAuth = getAuth(app);
export const db = getFirestore(app);

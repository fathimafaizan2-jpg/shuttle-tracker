import admin from "firebase-admin";
import { readFileSync } from "node:fs";

type FirebaseServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function readServiceAccount(): FirebaseServiceAccount {
  /*
    Production hosting: Render will provide this complete JSON as a secret.
    Local development: FIREBASE_SERVICE_ACCOUNT_PATH may point to a JSON file
    outside the GitHub project folder.
  */
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    try {
      return JSON.parse(inlineJson) as FirebaseServiceAccount;
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (filePath) {
    try {
      return JSON.parse(readFileSync(filePath, "utf8")) as FirebaseServiceAccount;
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH cannot be read as Firebase service-account JSON.");
    }
  }

  throw new Error(
    "Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON as a private hosting secret."
  );
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const account = readServiceAccount();
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error("Firebase service-account JSON is missing project_id, client_email, or private_key.");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key.replace(/\\n/g, "\n")
    })
  });
}

export const firebaseAdminApp = initializeFirebaseAdmin();
export const adminAuth = admin.auth(firebaseAdminApp);
export const db = admin.firestore(firebaseAdminApp);
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
export const FILS_PER_BHD = 1000;

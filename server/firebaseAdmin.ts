## `server/firebaseAdmin.ts`

Replace the entire content of **`server/firebaseAdmin.ts`** with this code.

> Create the Firebase service-account JSON from Firebase Console → **Project settings** → **Service accounts** → **Generate new private key**. Save it outside the project folder, for example `C:\club-secrets\indian-club-firebase-admin.json`. Never upload it to GitHub.

```ts
import admin from "firebase-admin";
import path from "node:path";

function getServiceAccountPath(): string {
  const value = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!value) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_PATH. Set it in your local .env file to the full path of the Firebase Admin service-account JSON."
    );
  }
  return path.resolve(value);
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccountPath = getServiceAccountPath();

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
}

export const firebaseAdminApp = initializeFirebaseAdmin();
export const adminAuth = admin.auth(firebaseAdminApp);
export const db = admin.firestore(firebaseAdminApp);
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

/* All money is stored as integer fils: 1 BHD = 1,000 fils. */
export const FILS_PER_BHD = 1000;
```

The next file is **`server/auth.ts`**.

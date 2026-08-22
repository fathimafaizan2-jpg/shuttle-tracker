import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/*
  Paste the values from:
  Firebase Console → Project settings → Your apps → Web app → SDK setup and configuration.

  These are PUBLIC web values. They identify your Firebase project; they are not
  administrator credentials and do not grant Firestore access by themselves.
*/
const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_WEB_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_WEB_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig );
const firebaseAuth = getAuth(firebaseApp);

/* Keep the signed-in member available after a browser refresh. */
await setPersistence(firebaseAuth, browserLocalPersistence);

export { firebaseApp, firebaseAuth };

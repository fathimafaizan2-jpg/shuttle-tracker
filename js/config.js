import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/*
  Copy these three values directly from Firebase Console → Project settings
  → General → Your apps → SDK setup and configuration.
  Do not send them in chat.
*/
const firebaseConfig = {
  apiKey: "AIzaSyAZEE6jX1o5r5a4pS5uqrKkdZFEgsLlaTQ",
  authDomain: "shuttle-platform-icb.firebaseapp.com",
  projectId: "shuttle-platform-icb",
  storageBucket: "shuttle-platform-icb.firebasestorage.app",
  messagingSenderId: "135658920486",
  appId: "1:135658920486:web:56101e2f46de24747324e7"
};

const firebaseApp = initializeApp(firebaseConfig );
const firebaseAuth = getAuth(firebaseApp);

/* Keep the approved Player/Admin signed in after a browser refresh. */
await setPersistence(firebaseAuth, browserLocalPersistence);

export { firebaseApp, firebaseAuth };

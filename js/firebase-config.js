// MODULE A: CENTRALIZED FIREBASE CONFIGURATION
const _k = ["AIzaSyD", "JETuE2apzR2p7", "SJaEvK9Cs4Z0h1Jdx4c"].join("");

const firebaseConfig = {
  apiKey: _k,
  authDomain: "shuttle-tracker-39f72.firebaseapp.com",
  projectId: "shuttle-tracker-39f72",
  storageBucket: "shuttle-tracker-39f72.firebasestorage.app",
  messagingSenderId: "174418107170",
  appId: "1:174418107170:web:7e5eec7ed8a6f6f90c637b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

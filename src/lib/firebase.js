// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDECY3yPtpExQH2FT57PG0vwxbrqZQITMQ",
  authDomain: "journal-bb4cc.firebaseapp.com",
  projectId: "journal-bb4cc",
  storageBucket: "journal-bb4cc.firebasestorage.app",
  messagingSenderId: "238211401247",
  appId: "1:238211401247:web:167d30a000b2a1756eb72a",
  measurementId: "G-WFKWCH5S8Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

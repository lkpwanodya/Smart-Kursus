import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyAp7RACfeUGPddPD8sm-287QeCx_mpUvI8",
  authDomain: "causal-rarity-68gvj.firebaseapp.com",
  projectId: "causal-rarity-68gvj",
  storageBucket: "causal-rarity-68gvj.firebasestorage.app",
  messagingSenderId: "1095671413120",
  appId: "1:1095671413120:web:62e8a1143f3225943e2965"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the dedicated database ID provisioned for this applet
export const db = getFirestore(app, "ai-studio-ddefefc0-a1cd-4a3f-929c-439db039bca8");

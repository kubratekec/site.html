// Import functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh1rkeUspv5SGl63kJQXIqKKWdqbKCJqs",
  authDomain: "mod-gunlugum.firebaseapp.com",
  projectId: "mod-gunlugum",
  storageBucket: "mod-gunlugum.firebasestorage.app",
  messagingSenderId: "1054496347282",
  appId: "1:1054496347282:web:cce6d613bd45fb028a824b",
  measurementId: "G-YEQCNPZ1EK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, analytics, auth };

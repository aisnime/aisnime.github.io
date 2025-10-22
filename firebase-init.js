// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkSf56I0akk5poCZ5t8QI1MNlUvZ8Aiu0",
  authDomain: "aisnime.firebaseapp.com",
  projectId: "aisnime",
  storageBucket: "aisnime.appspot.com",
  messagingSenderId: "736632750777",
  appId: "1:736632750777:web:8756d28d0ffe2698739168",
  measurementId: "G-1WF1269W5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn("Firestore persistence failed, probably due to multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            console.warn("Firestore persistence is not supported in this browser.");
        }
    });

// Define and export collection references
const contentCollRef = collection(db, 'content');
const settingsCollRef = collection(db, 'settings');
const seriesCollRef = collection(db, 'series');
const globalChatCollRef = collection(db, 'globalChat');

// Export all needed by other files
export { auth, db, contentCollRef, settingsCollRef, seriesCollRef, globalChatCollRef };


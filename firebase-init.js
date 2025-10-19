// ====================================================================
// Versi ini untuk digunakan langsung di browser melalui CDN
// ====================================================================

// Import functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkSf56I0akk5poCZ5t8QI1MNlUvZ8Aiu0",
  authDomain: "aisnime.firebaseapp.com",
  projectId: "aisnime",
  storageBucket: "aisnime.firebasestorage.app",
  messagingSenderId: "736632750777",
  appId: "1:736632750777:web:8756d28d0ffe2698739168",
  measurementId: "G-1WF1269W5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Aktifkan persistensi offline untuk pengalaman yang lebih baik
enableIndexedDbPersistence(db)
    .then(() => console.log("Firestore persistence enabled."))
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn("Firestore persistence failed, probably due to multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            console.warn("Firestore persistence is not supported in this browser.");
        }
    });

// Definisikan dan ekspor referensi koleksi
const contentCollRef = collection(db, 'content');
const settingsCollRef = collection(db, 'settings');

// Ekspor semua yang dibutuhkan oleh file lain
export { auth, db, contentCollRef, settingsCollRef };


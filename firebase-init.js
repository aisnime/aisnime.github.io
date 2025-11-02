// Impor fungsi-fungsi inti
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection as firestoreCollection, 
    query as firestoreQuery, 
    where as firestoreWhere, 
    orderBy as firestoreOrderBy, 
    onSnapshot as firestoreOnSnapshot, 
    doc as firestoreDoc, 
    getDoc as firestoreGetDoc, 
    getDocs as firestoreGetDocs, 
    updateDoc as firestoreUpdateDoc, 
    deleteDoc as firestoreDeleteDoc, 
    setDoc as firestoreSetDoc, 
    Timestamp as firestoreTimestamp, 
    increment as firestoreIncrement, 
    limit as firestoreLimit,
    arrayUnion as firestoreArrayUnion,
    arrayRemove as firestoreArrayRemove,
    addDoc as firestoreAddDoc // [DIPERBAIKI] Pastikan addDoc diekspor
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Konfigurasi (Placeholder)
// GANTI DENGAN KUNCI API ANDA
const firebaseConfig = {
  apiKey: "AIzaSyBkSf56I0akk5poCZ5t8QI1MNlUvZ8Aiu0",
  authDomain: "aisnime.firebaseapp.com",
  projectId: "aisnime",
  storageBucket: "aisnime.firebasestorage.app",
  messagingSenderId: "736632750777",
  appId: "1:736632750777:web:8756d28d0ffe2698739168",
  measurementId: "G-1WF1269W5W"
};

// Inisialisasi
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Referensi Koleksi
const seriesCollRef = firestoreCollection(db, 'series');
const settingsCollRef = firestoreCollection(db, 'settings');

// Ekspor fungsi-fungsi dengan nama yang disingkat (alias)
const collection = firestoreCollection;
const query = firestoreQuery;
const where = firestoreWhere;
const orderBy = firestoreOrderBy;
const onSnapshot = firestoreOnSnapshot;
const doc = firestoreDoc;
const getDoc = firestoreGetDoc;
const getDocs = firestoreGetDocs;
const updateDoc = firestoreUpdateDoc;
const deleteDoc = firestoreDeleteDoc;
const setDoc = firestoreSetDoc;
const Timestamp = firestoreTimestamp;
const increment = firestoreIncrement;
const limit = firestoreLimit;
const arrayUnion = firestoreArrayUnion;
const arrayRemove = firestoreArrayRemove;
const addDoc = firestoreAddDoc; // [DIPERBAIKI]

// Ekspor semua
export { 
    db, 
    auth, 
    seriesCollRef, 
    settingsCollRef,
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    setDoc, 
    Timestamp, 
    increment, 
    limit,
    arrayUnion,
    arrayRemove,
    addDoc // [DIPERBAIKI]
};


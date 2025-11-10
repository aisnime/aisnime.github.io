// Impor fungsi-fungsi inti dari Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
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
    addDoc as firestoreAddDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBkSf56I0akk5poCZ5t8QI1MNlUvZ8Aiu0",
  authDomain: "aisnime.firebaseapp.com",
  projectId: "aisnime",
  storageBucket: "aisnime.firebasestorage.app",
  messagingSenderId: "736632750777",
  appId: "1:736632750777:web:8756d28d0ffe2698739168",
  measurementId: "G-1WF1269W5W" // [DITAMBAHKAN] ID Pengukuran untuk Analytics
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app); // Inisialisasi Analytics

// [PENTING] Logika App ID untuk Firestore
// Ini penting agar aplikasi Anda dapat mengakses data di Firestore
const appId = typeof __app_id !== 'undefined' ? __app_id : 'aisnime';

// Referensi Koleksi (Menggunakan path Firestore yang benar)
const seriesCollRef = firestoreCollection(db, 'artifacts', appId, 'public', 'data', 'series');
const settingsCollRef = firestoreCollection(db, 'artifacts', appId, 'public', 'data', 'settings');
const contentRowsCollRef = firestoreCollection(db, 'artifacts', appId, 'public', 'data', 'contentRows');
const reportsCollRef = firestoreCollection(db, 'artifacts', appId, 'public', 'data', 'reports');
const navLinksCollRef = firestoreCollection(db, 'artifacts', appId, 'public', 'data', 'navigationLinks');
const chatCollRef = firestoreCollection(db, 'artifacts', appId, 'public', 'data', 'chat');


// Ekspor fungsi-fungsi dengan nama yang disingkat (alias)
// Ini agar kita bisa menggunakannya di file lain
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
const addDoc = firestoreAddDoc;

// Ekspor semua variabel dan fungsi yang diperlukan
export { 
    db, 
    auth, 
    analytics,
    signInAnonymously,
    seriesCollRef, 
    settingsCollRef,
    contentRowsCollRef,
    reportsCollRef,
    navLinksCollRef,
    chatCollRef,
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
    addDoc
};

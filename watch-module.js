// [BARU] Fail ini memuatkan semua kod untuk tetingkap video dan senarai episod.
// Ia hanya dimuatkan apabila pengguna mengklik kad konten di index.html.

// Variabel global untuk modul ini
let db, seriesCollRef, auth, settingsCollRef;
let collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs, updateDoc, setDoc, Timestamp, increment, limit, arrayUnion, arrayRemove;

// Fungsi-fungsi Firebase (diimpor oleh file lain)
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
    addDoc as firestoreAddDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Konfigurasi Firebase Anda (WAJIB ADA)
const firebaseConfig = {
    apiKey: "AIza...", // Ganti dengan kunci API Anda
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);
const firebaseAuth = getAuth(app);

// Ekspor variabel dan fungsi yang telah diinisialisasi
db = firestoreDb;
auth = firebaseAuth;
seriesCollRef = firestoreCollection(db, 'series');
settingsCollRef = firestoreCollection(db, 'settings');

// Ekspor fungsi-fungsi Firestore agar bisa digunakan di modul lain
collection = firestoreCollection;
query = firestoreQuery;
where = firestoreWhere;
orderBy = firestoreOrderBy;
onSnapshot = firestoreOnSnapshot;
doc = firestoreDoc;
getDoc = firestoreGetDoc;
getDocs = firestoreGetDocs;
updateDoc = firestoreUpdateDoc;
deleteDoc = firestoreDeleteDoc;
setDoc = firestoreSetDoc;
Timestamp = firestoreTimestamp;
increment = firestoreIncrement;
limit = firestoreLimit;
arrayUnion = firestoreArrayUnion;
arrayRemove = firestoreArrayRemove;
addDoc = firestoreAddDoc; // Pastikan addDoc juga diekspor

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
    addDoc
};


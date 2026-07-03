import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBfOrW348C9BWrgCHeu8VsKhC14292p77A",
    authDomain: "animals-1cb2d.firebaseapp.com",
    projectId: "animals-1cb2d",
    storageBucket: "animals-1cb2d.firebasestorage.app",
    messagingSenderId: "353507738450",
    appId: "1:353507738450:web:29367b67a633cf71c2308b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
 

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { initializeFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
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
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
});
const auth = getAuth(app);

// Ativar persistência offline do Firestore (desativado temporariamente para evitar travamento em navegadores com bloqueio de cookies/storage)
/*
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

if (!isIOS) {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn("A persistência falhou: Múltiplas abas abertas.");
        } else if (err.code == 'unimplemented') {
            console.warn("O browser não suporta persistência de dados offline.");
        }
    });
}
*/

export { db, auth };

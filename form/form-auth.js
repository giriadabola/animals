import { auth, db } from "../js/firebase-config.js?v=5";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const overlay = document.getElementById('loading-overlay');
const status = document.getElementById('loading-status');

function setStatus(message) {
    if (status) status.textContent = message;
}

function goToLogin() {
    const redirectTarget = 'form/form.html';
    window.location.href = `../login.html?redirect=${encodeURIComponent(redirectTarget)}`;
}

onAuthStateChanged(auth, async (user) => {
    try {
        if (!user) {
            goToLogin();
            return;
        }

        setStatus('A confirmar permissões...');
        const userDocSnap = await getDoc(doc(db, 'users', user.uid));
        const userData = userDocSnap.exists() ? userDocSnap.data() : null;
        const canAccess = userData && userData.status === 'on' && ['ruler', 'estafeta'].includes(userData.rule);

        if (!canAccess) {
            setStatus('Sem autorização para aceder ao formulário.');
            setTimeout(() => { window.location.href = '../index.html'; }, 1200);
            return;
        }

        overlay?.remove();
    } catch (error) {
        console.error('Erro na autorização do formulário:', error);
        setStatus('Erro ao verificar autorização.');
    }
});

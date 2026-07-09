console.log("Auth Script: A iniciar...");
import { auth, db } from "../js/firebase-config.js?v=5";
console.log("Auth Script: Imports de Firebase concluídos.", { auth, db });
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const overlay = document.getElementById('loading-overlay');
const statusText = document.getElementById('loading-status');

console.log("Auth Script: A registar escutador onAuthStateChanged...");
onAuthStateChanged(auth, async (user) => {
    console.log("Auth Script: Estado de Auth recebido! Utilizador:", user ? (user.email || user.uid) : "Nenhum (Anónimo)");
    if (!user) {
        statusText.textContent = "Não autenticado. A redirecionar...";
        setTimeout(() => {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
        }, 1000);
        return;
    }

    try {
        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.status === 'on' && (userData.rule === 'ruler' || userData.rule === 'estafeta')) {
                // Authorized: Fade out overlay
                overlay.style.opacity = '0';
                overlay.style.visibility = 'hidden';
                setTimeout(() => {
                    overlay.remove();
                }, 400);
                return;
            }
        }
        statusText.textContent = "Acesso recusado. Sem permissões de acesso.";
        setTimeout(() => {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
        }, 1500);
    } catch (error) {
        console.error("Erro na verificação de permissões:", error);
        statusText.textContent = "Erro ao verificar permissões. Tente novamente.";
        setTimeout(() => {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
        }, 1500);
    }
});

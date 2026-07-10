import { auth } from "../js/firebase-config.js?v=5";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const overlay = document.getElementById('loading-overlay');
const status = document.getElementById('loading-status');
let overlayClosed = false;
let redirected = false;

window.__FORM_AUTH_VERIFIED = false;

function setStatus(message) {
    if (status) status.textContent = message;
}

function showFormChrome() {
    const title = document.getElementById('formTitle');
    const subtitle = document.getElementById('formSubtitle');
    if (title) title.style.display = '';
    if (subtitle) subtitle.style.display = '';
}

function hideLoadingOverlay(reason = 'ready') {
    if (overlayClosed) return;
    overlayClosed = true;

    window.__FORM_AUTH_VERIFIED = true;
    document.body.classList.remove('form-auth-pending');
    document.body.classList.add('form-auth-ready');
    showFormChrome();

    if (overlay) {
        overlay.classList.add('form-loading-hidden');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';

        requestAnimationFrame(() => {
            if (overlay && overlay.parentNode) overlay.remove();
        });
    }

    console.log(`Form Auth: overlay fechado (${reason}).`);
}

function goToLogin(reason = 'no-user') {
    if (redirected) return;
    redirected = true;

    // Mantém o formulário oculto até sair da página. Isto evita o “flash” de 1 segundo.
    document.body.classList.add('form-auth-pending');
    document.body.classList.remove('form-auth-ready', 'form-ui-ready');

    const currentPath = `${window.location.pathname}${window.location.search}`;
    const target = new URL('../login.html', window.location.href);
    target.searchParams.set('redirect', currentPath);
    target.searchParams.set('reason', reason);

    window.location.replace(target.href);
}

setStatus('A verificar autorização...');

onAuthStateChanged(auth, (user) => {
    console.log('Form Auth: estado recebido:', user ? (user.email || user.uid) : 'sem utilizador');

    if (!user) {
        setStatus('Sessão não encontrada. A redirecionar...');
        goToLogin('no-session');
        return;
    }

    setStatus('Autorizado. A abrir formulário...');
    requestAnimationFrame(() => hideLoadingOverlay('auth-ready'));
}, (error) => {
    console.error('Form Auth: erro ao verificar autenticação:', error);
    setStatus('Não foi possível verificar a sessão. A redirecionar...');
    setTimeout(() => goToLogin('auth-error'), 250);
});

// Segurança: se o Firebase não responder, não mostramos o form sem autorização.
// Em vez de desbloquear a página, mantemos o form oculto e voltamos ao login.
setTimeout(() => {
    if (!window.__FORM_AUTH_VERIFIED && !redirected) {
        console.warn('Form Auth: timeout de verificação. A redirecionar para login.');
        setStatus('Sessão não confirmada. A redirecionar...');
        goToLogin('auth-timeout');
    }
}, 10000);

window.hideFormLoadingOverlay = hideLoadingOverlay;

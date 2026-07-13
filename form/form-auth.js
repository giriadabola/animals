import { auth, db } from "../js/firebase-config.js?v=5";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const overlay = document.getElementById('loading-overlay');
const status = document.getElementById('loading-status');
let overlayClosed = false;
let redirected = false;

window.__FORM_AUTH_VERIFIED = false;

function setStatus(message) {
    if (status) status.textContent = message;
}

function applyRoleUI(role) {
    const gestorIndexBtn = document.getElementById('gestorIndexBtn');
    const isAdmin = role === 'ruler' || role === 'estafeta';

    if (gestorIndexBtn) {
        gestorIndexBtn.style.display = isAdmin ? '' : 'none';
    }

    document.body.classList.toggle('form-role-admin', isAdmin);
    document.body.classList.toggle('form-role-collaborator', role === 'colaborador');
}

function hideLoadingOverlay(reason = 'ready') {
    if (overlayClosed) return;
    overlayClosed = true;

    document.body.classList.remove('form-auth-pending');
    document.body.classList.add('form-auth-ready');

    if (overlay) {
        overlay.classList.add('form-loading-hidden');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
        requestAnimationFrame(() => overlay?.remove());
    }

    setTimeout(() => {
        const sciInput = document.getElementById('nomeCientifico');
        if (sciInput && !sciInput.disabled && !sciInput.readOnly) {
            sciInput.focus({ preventScroll: true });
            const len = sciInput.value.length;
            if (typeof sciInput.setSelectionRange === 'function') {
                sciInput.setSelectionRange(len, len);
            }
        }
    }, 100);

    console.log(`Form Auth: overlay fechado (${reason}).`);
}

function redirectTo(path, reason) {
    if (redirected) return;
    redirected = true;
    document.body.classList.add('form-auth-pending');
    document.body.classList.remove('form-auth-ready', 'form-ui-ready');

    const target = new URL(path, window.location.href);
    if (reason) target.searchParams.set('reason', reason);
    window.location.replace(target.href);
}

function goToLogin(reason = 'no-user') {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const target = new URL('../login.html', window.location.href);
    target.searchParams.set('redirect', currentPath);
    target.searchParams.set('reason', reason);
    redirectTo(target.href);
}

setStatus('A verificar autorização...');

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        setStatus('Sessão não encontrada. A redirecionar...');
        goToLogin('no-session');
        return;
    }

    try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        const role = String(userData.rule || '').toLowerCase();
        const accountStatus = String(userData.status || '').toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const isSuggestionMode = params.get('mode') === 'suggestion';
        const hasAnimalToEdit = Boolean(params.get('edit'));
        const isAdmin = accountStatus === 'on' && (role === 'ruler' || role === 'estafeta');
        const isCollaborator = accountStatus === 'on' && (
            role === 'colaborador' ||
            String(userData.colaborador || '').toLowerCase() === 'on'
        );

        if (isAdmin) {
            applyRoleUI(role);
            setStatus('Autorizado. A abrir formulário...');
            window.__FORM_AUTH_VERIFIED = true;
            document.dispatchEvent(new CustomEvent('form:auth-ready', { detail: { role } }));
            return;
        }

        if (isCollaborator && isSuggestionMode && hasAnimalToEdit) {
            applyRoleUI('colaborador');
            setStatus('Modo de sugestão autorizado. A abrir formulário...');
            window.__FORM_AUTH_VERIFIED = true;
            document.dispatchEvent(new CustomEvent('form:auth-ready', { detail: { role: 'colaborador' } }));
            return;
        }

        if (isCollaborator) {
            setStatus('Colaboradores apenas podem enviar sugestões de edição. A redirecionar...');
            redirectTo('../myperfil.html?tab=collaboration', 'suggestion-mode-required');
            return;
        }

        setStatus('Acesso recusado. Sem permissões para abrir o formulário.');
        redirectTo('../myperfil.html?tab=contribute', 'not-authorized');
    } catch (error) {
        console.error('Form Auth: erro ao verificar permissões:', error);
        setStatus('Não foi possível verificar as permissões. A redirecionar...');
        setTimeout(() => goToLogin('auth-error'), 250);
    }
}, (error) => {
    console.error('Form Auth: erro ao verificar autenticação:', error);
    setStatus('Não foi possível verificar a sessão. A redirecionar...');
    setTimeout(() => goToLogin('auth-error'), 250);
});

setTimeout(() => {
    if (!window.__FORM_AUTH_VERIFIED && !redirected) {
        setStatus('Sessão não confirmada. A redirecionar...');
        goToLogin('auth-timeout');
    }
}, 10000);

window.hideFormLoadingOverlay = hideLoadingOverlay;

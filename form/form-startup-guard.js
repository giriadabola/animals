(function () {
  'use strict';

  const READY_CLASS = 'form-ui-ready';

  function authIsReady() {
    return document.body.classList.contains('form-auth-ready') || window.__FORM_AUTH_VERIFIED === true;
  }

  function removeAuthBlockers() {
    // Nunca remover o overlay enquanto o login não estiver confirmado.
    // Isto evita ver o formulário por 1 segundo antes do redirecionamento para login.
    if (!authIsReady()) return;

    document.querySelectorAll('#loading-overlay').forEach((el) => {
      el.classList.add('form-loading-hidden');
      el.setAttribute('aria-hidden', 'true');
      Object.assign(el.style, {
        display: 'none',
        visibility: 'hidden',
        opacity: '0',
        pointerEvents: 'none'
      });
      if (el.parentNode) el.remove();
    });

    document.querySelectorAll('.modal-overlay').forEach((el) => {
      const isActive = el.classList.contains('active') || el.classList.contains('show') || el.classList.contains('open');
      const hasInlineVisible = el.style.display && el.style.display !== 'none';
      if (!isActive && !hasInlineVisible) {
        el.style.display = 'none';
      }
    });
  }

  function ensureScientificNameGate() {
    const form = document.getElementById('animalForm');
    const scientificInput = document.getElementById('nomeCientifico');
    if (!form || !scientificInput) return;

    let hint = form.querySelector('.scientific-name-gate-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'scientific-name-gate-hint';
      hint.innerHTML = '<i class="fa-solid fa-lock"></i> Primeiro escreve o nome científico para desbloquear o restante formulário.';
      const warning = document.getElementById('nomeCientificoWarning');
      (warning || scientificInput).insertAdjacentElement('afterend', hint);
    }

    const applyGate = () => {
      const hasScientificName = scientificInput.value.trim().length > 0;
      form.classList.toggle('scientific-gate-active', !hasScientificName);
    };

    scientificInput.addEventListener('input', applyGate);
    scientificInput.addEventListener('change', applyGate);
    applyGate();
  }

  function markReady() {
    if (!authIsReady()) return;
    document.body.classList.remove('form-auth-pending');
    document.body.classList.add(READY_CLASS);
    removeAuthBlockers();
    ensureScientificNameGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markReady, { once: true });
  } else {
    markReady();
  }

  window.addEventListener('pageshow', markReady);
  document.addEventListener('form:modules-loaded', markReady);

  // Failsafe só depois do auth confirmado. Não desbloqueia visitantes sem login.
  setTimeout(markReady, 700);
  setTimeout(markReady, 2500);
})();

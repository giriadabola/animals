(function () {
  'use strict';

  const READY_CLASS = 'form-ui-ready';
  let revealCompleted = false;
  let revealAttemptCount = 0;
  let revealCheckScheduled = false;

  function authIsReady() {
    return window.__FORM_AUTH_VERIFIED === true || document.body.classList.contains('form-auth-ready');
  }

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number.parseFloat(style.opacity || '1') > 0
      && rect.width > 0
      && rect.height > 0;
  }

  function focusScientificName(force = false) {
    const input = document.getElementById('nomeCientifico');
    if (!input || input.disabled || input.readOnly) return false;

    const active = document.activeElement;
    const userAlreadyFocusedAnotherField = !force
      && active
      && active !== document.body
      && active !== document.documentElement
      && active !== input;

    if (userAlreadyFocusedAnotherField) return active === input;

    try {
      input.focus({ preventScroll: true });
    } catch (_) {
      input.focus();
    }

    const end = input.value.length;
    if (typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(end, end);
    }

    return document.activeElement === input;
  }

  function scheduleScientificNameFocus(force = false) {
    requestAnimationFrame(() => {
      focusScientificName(force);
      setTimeout(() => focusScientificName(force), 40);
      setTimeout(() => focusScientificName(force), 250);
    });
  }

  function ensureScientificNameGate() {
    const form = document.getElementById('animalForm');
    const scientificInput = document.getElementById('nomeCientifico');
    if (!form || !scientificInput) return false;

    let hint = form.querySelector('.scientific-name-gate-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'scientific-name-gate-hint';
      hint.innerHTML = '<i class="fa-solid fa-lock"></i> Primeiro escreve o nome cientÃ­fico para desbloquear o restante formulÃ¡rio.';
      const warning = document.getElementById('nomeCientificoWarning');
      (warning || scientificInput).insertAdjacentElement('afterend', hint);
    }

    if (!scientificInput.dataset.startupGateBound) {
      const applyGate = () => {
        const hasScientificName = scientificInput.value.trim().length > 0;
        form.classList.toggle('scientific-gate-active', !hasScientificName);
      };

      scientificInput.addEventListener('input', applyGate);
      scientificInput.addEventListener('change', applyGate);
      scientificInput.dataset.startupGateBound = 'true';
    }

    const hasScientificName = scientificInput.value.trim().length > 0;
    form.classList.toggle('scientific-gate-active', !hasScientificName);
    return true;
  }

  function isScientificFieldReadyForReveal() {
    const form = document.getElementById('animalForm');
    const group = document.querySelector('.scientific-name-priority');
    const input = document.getElementById('nomeCientifico');
    const hint = document.querySelector('.scientific-name-gate-hint');

    if (!form || !group || !input) return false;
    if (!form.classList.contains('scientific-gate-active')) return false;
    if (!isVisible(group) || !isVisible(input)) return false;

    const groupStyle = window.getComputedStyle(group);
    const inputStyle = window.getComputedStyle(input);
    const hintVisible = hint ? window.getComputedStyle(hint).display !== 'none' : false;
    const groupHasHighlight = groupStyle.boxShadow !== 'none';
    const inputHasHighlight = inputStyle.boxShadow !== 'none';

    return hintVisible && groupHasHighlight && inputHasHighlight;
  }

  function isEditButtonReady() {
    const button = document.getElementById('openEditModalBtn');
    if (!button || button.disabled) return false;
    return button.textContent.toLowerCase().includes('procurar');
  }

  function removeInactiveModalBlockers() {
    document.querySelectorAll('.modal-overlay').forEach((element) => {
      const isActive = element.classList.contains('active')
        || element.classList.contains('show')
        || element.classList.contains('open');
      const hasInlineVisible = element.style.display && element.style.display !== 'none';
      if (!isActive && !hasInlineVisible) {
        element.style.display = 'none';
      }
    });
  }

  function finalizeReady(reason = 'ready') {
    if (revealCompleted || !authIsReady()) return;

    ensureScientificNameGate();
    document.body.classList.add(READY_CLASS);

    focusScientificName(true);
    if (!isScientificFieldReadyForReveal() || !isEditButtonReady()) {
      scheduleReadyCheck(`retry:${reason}`);
      return;
    }

    focusScientificName(true);
    removeInactiveModalBlockers();
    revealCompleted = true;
    window.hideFormLoadingOverlay?.(reason);
  }

  function scheduleReadyCheck(reason = 'scheduled') {
    if (revealCompleted || revealCheckScheduled) return;
    revealCheckScheduled = true;

    requestAnimationFrame(() => {
      revealCheckScheduled = false;
      revealAttemptCount += 1;

      ensureScientificNameGate();
      focusScientificName(revealAttemptCount > 1);

      if (!authIsReady()) return;

      if (isScientificFieldReadyForReveal() && document.activeElement === document.getElementById('nomeCientifico')) {
        finalizeReady(reason);
        return;
      }

      if (revealAttemptCount < 24) {
        setTimeout(() => scheduleReadyCheck(`wait:${reason}`), revealAttemptCount < 6 ? 30 : 80);
        return;
      }

      finalizeReady(`forced:${reason}`);
    });
  }

  function markReady(reason = 'event') {
    if (!authIsReady()) return;
    ensureScientificNameGate();
    scheduleScientificNameFocus(true);
    scheduleReadyCheck(reason);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => markReady('dom-content-loaded'), { once: true });
  } else {
    markReady('document-already-ready');
  }

  window.addEventListener('pageshow', () => markReady('pageshow'));
  document.addEventListener('form:auth-ready', () => markReady('auth-ready'));
  document.addEventListener('form:modules-loaded', () => markReady('modules-loaded'));
  document.addEventListener('form:scientificGateReady', () => markReady('scientific-gate-ready'));
  document.addEventListener('form:edit-button-ready', () => markReady('edit-button-ready'));

  setTimeout(() => markReady('failsafe-700ms'), 700);
  setTimeout(() => markReady('failsafe-2500ms'), 2500);
})();

// Ordenação alfabética uniforme de todos os dropdowns do formulário
// e foco inicial no campo "Nome Científico".
(function () {
    const dropdownPolishApi = window.formDropdownPolish || {};
    const collator = new Intl.Collator('pt-PT', {
        sensitivity: 'base',
        numeric: true,
        ignorePunctuation: true
    });

    function optionLabel(option) {
        return (option?.textContent || '').trim();
    }

    function isFixedOption(option) {
        return option.value === ''
            || option.disabled
            || option.dataset.keepPosition === 'true';
    }

    function sortSelectOptionsAlphabetically(select) {
        if (!(select instanceof HTMLSelectElement)) return;
        if (select.dataset.keepOptionOrder === 'true') return;

        const options = [...select.options];
        if (options.length < 2) return;

        const selectedValues = [...select.selectedOptions].map(option => option.value);
        const fixed = options.filter(isFixedOption);
        const sortable = options.filter(option => !isFixedOption(option));

        const sorted = [...sortable].sort((a, b) => collator.compare(optionLabel(a), optionLabel(b)));
        const desiredOrder = [...fixed, ...sorted];

        // Evita substituir novamente opções que já se encontram na ordem correta.
        const alreadySorted = desiredOrder.every((option, index) => option === options[index]);
        if (alreadySorted) return;

        select.replaceChildren(...desiredOrder);

        if (select.multiple) {
            [...select.options].forEach(option => {
                option.selected = selectedValues.includes(option.value);
            });
        } else if (selectedValues.length && [...select.options].some(option => option.value === selectedValues[0])) {
            select.value = selectedValues[0];
        }
    }

    function sortAllDropdowns(root = document) {
        if (root instanceof HTMLSelectElement) {
            sortSelectOptionsAlphabetically(root);
        }

        root.querySelectorAll?.('select').forEach(sortSelectOptionsAlphabetically);
    }

    let sortScheduled = false;
    function scheduleSort(root = document) {
        if (sortScheduled) return;
        sortScheduled = true;

        requestAnimationFrame(() => {
            sortScheduled = false;
            sortAllDropdowns(root);
        });
    }

    dropdownPolishApi.sortSelectOptionsAlphabetically = sortSelectOptionsAlphabetically;
    dropdownPolishApi.sortAllDropdowns = sortAllDropdowns;
    dropdownPolishApi.scheduleSort = scheduleSort;
    window.formDropdownPolish = dropdownPolishApi;

    sortAllDropdowns(document);

    const dropdownObserver = new MutationObserver(mutations => {
        let mustSortDocument = false;

        for (const mutation of mutations) {
            if (mutation.target instanceof HTMLSelectElement) {
                sortSelectOptionsAlphabetically(mutation.target);
                continue;
            }

            for (const node of mutation.addedNodes) {
                if (!(node instanceof Element)) continue;

                const owningSelect = node.closest('select');
                if (owningSelect) {
                    sortSelectOptionsAlphabetically(owningSelect);
                } else if (node.matches('select') || node.querySelector?.('select')) {
                    mustSortDocument = true;
                }
            }
        }

        if (mustSortDocument) scheduleSort(document);
    });

    if (document.body) {
        dropdownObserver.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            dropdownObserver.observe(document.body, { childList: true, subtree: true });
            sortAllDropdowns(document);
        }, { once: true });
    }

    function focusScientificName() {
        const input = document.getElementById('nomeCientifico');
        if (!(input instanceof HTMLInputElement)) return;
        if (input.disabled || input.readOnly) return;

        // Não interrompe o utilizador se já estiver a escrever noutro campo.
        const active = document.activeElement;
        const userAlreadyFocusedField = active
            && active !== document.body
            && active !== document.documentElement
            && active !== input;
        if (userAlreadyFocusedField) return;

        input.focus({ preventScroll: true });
        const end = input.value.length;
        input.setSelectionRange(end, end);
    }

    function scheduleScientificNameFocus() {
        requestAnimationFrame(() => {
            setTimeout(focusScientificName, 0);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleScientificNameFocus, { once: true });
    } else {
        scheduleScientificNameFocus();
    }

    // Repete o foco quando os módulos e o bloqueio inicial terminarem,
    // porque a autenticação/loading podem retirar o foco durante a abertura.
    document.addEventListener('form:modules-loaded', scheduleScientificNameFocus, { once: true });
    document.addEventListener('form:scientificGateReady', scheduleScientificNameFocus, { once: true });
})();

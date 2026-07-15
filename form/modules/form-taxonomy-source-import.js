// Ponte entre o formulário e a pesquisa automática das fontes taxonómicas.
(function initTaxonomySourceImport() {
    const modal = document.getElementById('importTaxModalOverlay');
    const textarea = document.getElementById('importTaxTextarea');
    const openButton = document.getElementById('taxonomyOpenSourcesBtn');
    const status = document.getElementById('taxonomySourceStatus');
    const animalLabel = document.getElementById('taxonomySourceAnimalLabel');
    const closeTabsInput = document.getElementById('taxonomyCloseTabs');

    if (!modal || !textarea || !openButton || !status || !animalLabel || !closeTabsInput) return;

    let extensionReady = false;
    let extensionRequestTimer = null;

    function setStatus(message = '', kind = '') {
        status.textContent = message;
        status.dataset.state = kind;
    }

    function getAnimalNames() {
        return {
            scientificName: document.getElementById('nomeCientifico')?.value.trim() || '',
            commonName: document.getElementById('nomeAnimal')?.value.trim() || ''
        };
    }

    function refreshAnimalLabel() {
        const { scientificName, commonName } = getAnimalNames();
        animalLabel.textContent = [commonName, scientificName ? `(${scientificName})` : '']
            .filter(Boolean)
            .join(' ') || 'Preenche primeiro o nome do animal.';
    }

    window.getTaxonomySourceUrls = () => ({});
    window.setTaxonomySourceUrls = () => {};

    function handleExtensionMessage(event) {
        if (event.source !== window || !event.data || event.data.source !== 'animals-taxonomy-extension') return;
        const message = event.data;

        if (message.type === 'taxonomy-extension-ready') {
            extensionReady = true;
            setStatus('Extensão ligada.');
            return;
        }

        if (message.type === 'taxonomy-import-accepted') {
            clearTimeout(extensionRequestTimer);
            setStatus('A pesquisar os três sites automaticamente…');
            return;
        }

        if (message.type === 'taxonomy-import-progress') {
            setStatus(message.message || 'A ler as fontes…');
            return;
        }

        if (message.type !== 'taxonomy-import-complete') return;

        openButton.disabled = false;
        clearTimeout(extensionRequestTimer);
        const importedText = String(message.text || '').trim();
        if (importedText) textarea.value = importedText;

        const errors = Array.isArray(message.errors) ? message.errors : [];
        setStatus(
            errors.length
                ? `Importação concluída com avisos: ${errors.join(' | ')}`
                : 'Importação concluída. Confirma o texto e clica em “Importar”.',
            errors.length ? 'warning' : 'success'
        );
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
    }

    window.addEventListener('message', handleExtensionMessage);
    refreshAnimalLabel();
    document.getElementById('nomeCientifico')?.addEventListener('input', refreshAnimalLabel);
    document.getElementById('nomeAnimal')?.addEventListener('input', refreshAnimalLabel);

    openButton.addEventListener('click', () => {
        const names = getAnimalNames();
        if (!names.scientificName && !names.commonName) {
            setStatus('Preenche primeiro o nome científico ou o nome comum.', 'error');
            return;
        }

        modal.style.display = 'flex';
        openButton.disabled = true;
        textarea.value = 'A pesquisar automaticamente as três fontes…';
        setStatus(extensionReady ? 'A procurar as páginas do animal…' : 'A aguardar a extensão…');

        window.postMessage({
            source: 'animals-form',
            type: 'taxonomy-import-start',
            ...names,
            closeTabs: closeTabsInput.checked
        }, '*');

        extensionRequestTimer = setTimeout(() => {
            if (!openButton.disabled) return;
            openButton.disabled = false;
            textarea.value = '';
            setStatus('Extensão não encontrada. Instala-a e recarrega o formulário.', 'error');
        }, 4000);
    });
})();

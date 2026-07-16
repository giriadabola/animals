(function () {
    const scientificNameInput = document.getElementById('nomeCientifico');
    const searchLink = document.getElementById('xenoCantoSearchLink');
    if (!scientificNameInput || !searchLink) return;

    function updateSearchLink() {
        const scientificName = scientificNameInput.value.trim();
        searchLink.href = scientificName
            ? `https://xeno-canto.org/explore?query=${encodeURIComponent(scientificName)}`
            : 'https://xeno-canto.org/';
    }

    scientificNameInput.addEventListener('input', updateSearchLink);
    scientificNameInput.addEventListener('change', updateSearchLink);
    searchLink.addEventListener('click', updateSearchLink);
    updateSearchLink();
})();

// Endpoints públicos usados pelo formulário. Segredos ficam no proxy local.
window.ANIMAL_API_CONFIG = Object.freeze({
    speciesPlusProxy: 'http://127.0.0.1:5510/api/speciesplus/taxon',
    xenoCantoProxy: 'http://127.0.0.1:5510/api/xeno-canto/search',
    iucnProxy: 'http://127.0.0.1:5510/api/iucn/search',
    ebirdProxy: 'http://127.0.0.1:5510/api/ebird/search',
});
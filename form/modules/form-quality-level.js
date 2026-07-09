// Nível de qualidade/conteúdo do registo do animal
// Guarda no documento Firebase e mostra uma miniatura no popup de edição.
        const QUALITY_LEVEL_DEFAULT = 'basico';
        const QUALITY_LEVELS = {
            forte: {
                id: 'forte',
                label: 'Forte',
                icon: 'fa-solid fa-shield-halved',
                className: 'quality-forte'
            },
            melhorar: {
                id: 'melhorar',
                label: 'Melhorar',
                icon: 'fa-solid fa-wand-magic-sparkles',
                className: 'quality-melhorar'
            },
            basico: {
                id: 'basico',
                label: 'Básico',
                icon: 'fa-solid fa-circle-exclamation',
                className: 'quality-basico'
            }
        };

        const animalQualitySelector = document.getElementById('animalQualitySelector');
        let currentQualityLevel = QUALITY_LEVEL_DEFAULT;

        function normalizeQualityLevel(value) {
            const key = (value || '').toString().trim().toLowerCase();
            return QUALITY_LEVELS[key] ? key : QUALITY_LEVEL_DEFAULT;
        }

        function getQualityLevelMeta(value = currentQualityLevel) {
            return QUALITY_LEVELS[normalizeQualityLevel(value)] || QUALITY_LEVELS[QUALITY_LEVEL_DEFAULT];
        }

        function setQualityLevelData(animal = {}) {
            const savedLevel = animal.nivelQualidade || animal.qualidadeRegisto?.nivel || animal.qualidadeRegisto?.id || QUALITY_LEVEL_DEFAULT;
            currentQualityLevel = normalizeQualityLevel(savedLevel);
            renderQualityLevelSelector();
        }

        function resetQualityLevelData() {
            currentQualityLevel = QUALITY_LEVEL_DEFAULT;
            renderQualityLevelSelector();
        }

        function getQualityLevelSaveData() {
            const meta = getQualityLevelMeta(currentQualityLevel);
            return {
                id: meta.id,
                nivel: meta.id,
                label: meta.label,
                icon: meta.icon,
                atualizadoEm: Date.now()
            };
        }

        function renderQualityLevelSelector() {
            if (!animalQualitySelector) return;
            animalQualitySelector.querySelectorAll('[data-quality]').forEach(button => {
                button.classList.toggle('active', normalizeQualityLevel(button.dataset.quality) === currentQualityLevel);
            });
        }

        animalQualitySelector?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-quality]');
            if (!button) return;
            currentQualityLevel = normalizeQualityLevel(button.dataset.quality);
            renderQualityLevelSelector();
        });

        renderQualityLevelSelector();

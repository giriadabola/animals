// Tipo de registo científico/personalizado
// Resolve casos em que vários registos partilham o mesmo nome científico
// (ex.: raças de cães/gatos), sem alterar o campo existente
// "Subespécies de (outros animais)", que continua a servir apenas para
// ligar este animal a outros animais da base de dados.
        const RECORD_TYPE_DEFAULT = 'Espécie';
        const RECORD_TYPE_COMPOSITE_TYPES = new Set(['Subespécie', 'Raça', 'Variedade', 'Híbrido', 'Outro']);
        const personalizarTipoRegistoInput = document.getElementById('personalizarTipoRegisto');
        const tipoRegistoSelect = document.getElementById('tipoRegisto');
        const tipoRegistoCustomArea = document.getElementById('tipoRegistoCustomArea');
        const tipoRegistoHint = document.getElementById('tipoRegistoHint');
        const nomeAnimalInput = document.getElementById('nomeAnimal');

        function normalizeRecordIdSegment(value) {
            return (value || '')
                .toString()
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
        }

        function getSelectedRecordType() {
            if (!personalizarTipoRegistoInput?.checked) return RECORD_TYPE_DEFAULT;
            return tipoRegistoSelect?.value || RECORD_TYPE_DEFAULT;
        }

        function isCompositeRecordType(tipoRegisto) {
            return RECORD_TYPE_COMPOSITE_TYPES.has(tipoRegisto || RECORD_TYPE_DEFAULT);
        }

        function updateRecordTypeUi() {
            const isCustom = !!personalizarTipoRegistoInput?.checked;
            if (tipoRegistoCustomArea) {
                tipoRegistoCustomArea.style.display = isCustom ? 'block' : 'none';
            }
            if (!isCustom && tipoRegistoSelect) {
                tipoRegistoSelect.value = RECORD_TYPE_DEFAULT;
            }

            const tipoRegisto = getSelectedRecordType();
            if (tipoRegistoHint) {
                if (isCompositeRecordType(tipoRegisto)) {
                    tipoRegistoHint.textContent = `${tipoRegisto}: este registo pode partilhar o mesmo nome científico com outros. O ID será criado com o nome científico + nome comum.`;
                } else {
                    tipoRegistoHint.textContent = 'Espécie: o ID será criado apenas com o nome científico.';
                }
            }
            updateRecordDuplicateWarning();
        }

        function getRecordIdentity() {
            const scientificName = nomeCientificoInput.value.trim();
            const scientificNameKey = normalizeRecordIdSegment(scientificName);
            const tipoRegisto = getSelectedRecordType();
            const personalizado = !!personalizarTipoRegistoInput?.checked;
            const useCompositeId = isCompositeRecordType(tipoRegisto);
            const commonName = nomeAnimalInput?.value.trim() || '';
            const suffixKey = useCompositeId ? normalizeRecordIdSegment(commonName) : '';

            if (!scientificNameKey) {
                return {
                    docId: '',
                    scientificName,
                    scientificNameKey,
                    tipoRegisto,
                    personalizado,
                    useCompositeId,
                    commonName,
                    suffixKey,
                    designacaoRegisto: ''
                };
            }

            if (useCompositeId && !suffixKey) {
                return {
                    docId: '',
                    scientificName,
                    scientificNameKey,
                    tipoRegisto,
                    personalizado,
                    useCompositeId,
                    commonName,
                    suffixKey,
                    designacaoRegisto: commonName
                };
            }

            const docId = useCompositeId ? `${scientificNameKey}_${suffixKey}` : scientificNameKey;
            return {
                docId,
                scientificName,
                scientificNameKey,
                tipoRegisto,
                personalizado,
                useCompositeId,
                commonName,
                suffixKey,
                designacaoRegisto: useCompositeId ? commonName : ''
            };
        }

        function animalMatchesRecordIdentity(animal, identity) {
            if (!animal || !identity?.docId) return false;
            if (animal.id === identity.docId) return true;

            const animalTipoRegisto = animal.tipoRegisto || RECORD_TYPE_DEFAULT;
            const animalScientificKey = normalizeRecordIdSegment(animal.nomeCientifico || '');
            const animalBaseId = animal.registoBaseId || animal.especieBaseId || animalScientificKey;
            const animalSuffix = animal.sufixoRegisto || normalizeRecordIdSegment(animal.designacaoRegisto || animal.nome || '');

            if (!identity.useCompositeId) {
                return !isCompositeRecordType(animalTipoRegisto) && animalScientificKey === identity.scientificNameKey;
            }

            return animalBaseId === identity.scientificNameKey && animalSuffix === identity.suffixKey && animalTipoRegisto === identity.tipoRegisto;
        }

        function recordIdentityExists(identity = getRecordIdentity()) {
            if (!identity.docId) return false;
            return allAnimals.some(animal => {
                if (isEditMode && animal.id === currentEditingId) return false;
                return animalMatchesRecordIdentity(animal, identity);
            });
        }

        function updateRecordDuplicateWarning() {
            if (!nomeCientificoWarning) return false;
            if (isEditMode) {
                nomeCientificoWarning.style.display = 'none';
                return false;
            }
            const identity = getRecordIdentity();
            const exists = recordIdentityExists(identity);
            nomeCientificoWarning.style.display = exists ? 'inline-block' : 'none';
            return exists;
        }

        function setRecordTypeData(animal = {}) {
            const tipoRegisto = animal.tipoRegisto || animal.registoTaxonomico?.tipo || RECORD_TYPE_DEFAULT;
            const personalized = !!animal.tipoRegistoPersonalizado || tipoRegisto !== RECORD_TYPE_DEFAULT;

            if (personalizarTipoRegistoInput) {
                personalizarTipoRegistoInput.checked = personalized;
            }
            if (tipoRegistoSelect) {
                tipoRegistoSelect.value = [...tipoRegistoSelect.options].some(option => option.value === tipoRegisto)
                    ? tipoRegisto
                    : RECORD_TYPE_DEFAULT;
            }
            updateRecordTypeUi();
        }

        function resetRecordTypeData() {
            if (personalizarTipoRegistoInput) personalizarTipoRegistoInput.checked = false;
            if (tipoRegistoSelect) tipoRegistoSelect.value = RECORD_TYPE_DEFAULT;
            updateRecordTypeUi();
        }

        function getRecordTypeSaveData(identity = getRecordIdentity()) {
            return {
                tipoRegisto: identity.tipoRegisto || RECORD_TYPE_DEFAULT,
                tipoRegistoPersonalizado: !!identity.personalizado,
                registoBaseId: identity.scientificNameKey || '',
                sufixoRegisto: identity.suffixKey || '',
                designacaoRegisto: identity.designacaoRegisto || '',
                especieBaseId: identity.useCompositeId ? identity.scientificNameKey : '',
                registoTaxonomico: {
                    tipo: identity.tipoRegisto || RECORD_TYPE_DEFAULT,
                    personalizado: !!identity.personalizado,
                    usaIdComposto: !!identity.useCompositeId,
                    baseCientificaId: identity.scientificNameKey || '',
                    sufixoId: identity.suffixKey || '',
                    designacao: identity.designacaoRegisto || ''
                }
            };
        }

        personalizarTipoRegistoInput?.addEventListener('change', updateRecordTypeUi);
        tipoRegistoSelect?.addEventListener('change', updateRecordTypeUi);
        nomeAnimalInput?.addEventListener('input', updateRecordDuplicateWarning);
        updateRecordTypeUi();

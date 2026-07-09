        import { db, auth } from "../js/firebase-config.js?v=5";
        import { doc, setDoc, collection, getDocs, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
        import { feedingTypes, feedingTypeDescriptions, getFeedingVisualMeta, getFeedingModelSvg } from "../js/feeding-visuals.js";
        import { feedingAnimalOptions } from "../js/feeding-animal-options.js?v=2";
        import { getFeedingStrategyMeta, getFeedingStrategySvg } from "../js/feeding-strategies.js";
        import { matingSystems, getMatingMeta, getMatingSystemSvg } from "../js/mating-systems.js";
        import { generalVisualOptions as generalVisualCatalogOptions, generalVisualUnits as generalVisualCatalogUnits, getGeneralVisualMeta as getGeneralVisualCatalogMeta, getGeneralVisualOption as getGeneralVisualCatalogOption, getGeneralVisualSelectConfig, getGeneralVisualSelectOptions, getGeneralModelSvg as getGeneralCatalogModelSvg, getActivityMeta, getActivitySvg, getSocialMeta, getSocialSvg, getEcologicalFunctionMeta, getEcologicalFunctionSvg, getLocomotionMeta, getLocomotionSvg, isDropdownOnlyGeneralModel as isGeneralVisualCatalogDropdownOnly } from "../js/general-visual-catalog.js";
        import { GENDER_BOTH, collapseCombinedGenderItems, expandCombinedGenderItems, getGenderUi, getNextGenderValue, normalizeGenderValue } from "../js/gender-utils.js?v=2";

        let allAnimals = [];
        let existingFamilies = new Set();
        let existingReinos = new Set();
        let existingFilos = new Set();
        let existingSubfilos = new Set();
        let existingClasses = new Set();
        let existingSuperordens = new Set();
        let existingOrdens = new Set();
        let existingSubordens = new Set();
        let existingInfraordens = new Set();
        let existingGeneros = new Set();
        let existingEspeciesList = new Set();
        
        let selectedSubespecies = []; // Guarda IDs dos animais selecionados

        let isEditMode = false;
        let currentEditingId = null;

        const animalForm = document.getElementById('animalForm');
        const saveButton = document.getElementById('saveButton');
        const formTitle = document.getElementById('formTitle');
        const formSubtitle = document.getElementById('formSubtitle');
        const statusMessage = document.getElementById('statusMessage');
        const nomeCientificoInput = document.getElementById('nomeCientifico');
        const scientificPriorityGroup = nomeCientificoInput.closest('.scientific-name-priority');
        const nomeCientificoWarning = document.getElementById('nomeCientificoWarning');
        const familiaInput = document.getElementById('familia');
        const familiaResultsContainer = document.getElementById('familiaResults');

        // Novos campos avançados
        const reinoInput = document.getElementById('reino');
        const reinoResultsContainer = document.getElementById('reinoResults');
        const filoInput = document.getElementById('filo');
        const filoResultsContainer = document.getElementById('filoResults');
        const subfiloInput = document.getElementById('subfilo');
        const subfiloResultsContainer = document.getElementById('subfiloResults');
        const classeInput = document.getElementById('classe');
        const classeResultsContainer = document.getElementById('classeResults');
        const superordemInput = document.getElementById('superordem');
        const superordemResultsContainer = document.getElementById('superordemResults');
        const ordemInput = document.getElementById('ordem');
        const ordemResultsContainer = document.getElementById('ordemResults');
        const subordemInput = document.getElementById('subordem');
        const subordemResultsContainer = document.getElementById('subordemResults');
        const infraordemInput = document.getElementById('infraordem');
        const infraordemResultsContainer = document.getElementById('infraordemResults');
        const generoInput = document.getElementById('genero');
        const generoResultsContainer = document.getElementById('generoResults');
        const especiesInput = document.getElementById('especies');
        const especiesResultsContainer = document.getElementById('especiesResults');
        
        const subespeciesDeSearchInput = document.getElementById('subespeciesDeSearch');
        const subespeciesDeResultsContainer = document.getElementById('subespeciesDeResults');
        const selectedSubespeciesList = document.getElementById('selectedSubespeciesList');
        
        const toggleAdvancedBtn = document.getElementById('toggleAdvancedBtn');
        const advancedFieldsContainer = document.getElementById('advancedFieldsContainer');
        const advancedChevron = document.getElementById('advancedChevron');

        const openEditModalBtn = document.getElementById('openEditModalBtn');
        const closeEditModalBtn = document.getElementById('closeEditModalBtn');
        const editModalOverlay = document.getElementById('editModalOverlay');
        const editSearchInput = document.getElementById('editSearchInput');
        const editListContainer = document.getElementById('editListContainer');
        const dimensionRowsContainer = document.getElementById('dimensionRows');
        const addDimensionBtn = document.getElementById('addDimensionBtn');
        const animalSilhouette = document.getElementById('animalSilhouette');
        const previewHeightValue = document.getElementById('previewHeightValue');
        const previewWeightValue = document.getElementById('previewWeightValue');
        const previewLengthValue = document.getElementById('previewLengthValue');
        const previewDimensionModels = document.getElementById('previewDimensionModels');
        const generalVisualRowsContainer = document.getElementById('generalVisualRows');
        const addGeneralVisualBtn = document.getElementById('addGeneralVisualBtn');


        const previewGeneralVisualModels = document.getElementById('previewGeneralVisualModels');
        const feedingRowsContainer = document.getElementById('feedingRows');
        const addFeedingBtn = document.getElementById('addFeedingBtn');
        const feedingAnimalDropdown = document.getElementById('feedingAnimalDropdown');
        const feedingAnimalTrigger = document.getElementById('feedingAnimalTrigger');
        const feedingAnimalSearch = document.getElementById('feedingAnimalSearch');
        const feedingAnimalList = document.getElementById('feedingAnimalList');
        const feedingHeroIcon = document.getElementById('feedingHeroIcon');
        const feedingHeroTitle = document.getElementById('feedingHeroTitle');
        const previewFeedingModels = document.getElementById('previewFeedingModels');
        const reproductionRowsContainer = document.getElementById('reproductionRows');
        const addReproductionBtn = document.getElementById('addReproductionBtn');
        const reproductionCategoryIcon = document.getElementById('reproductionCategoryIcon');
        const reproductionCategoryName = document.getElementById('reproductionCategoryName');
        const previewReproductionModels = document.getElementById('previewReproductionModels');
        const feedingNutritionType = document.getElementById('feedingNutritionType');
        const feedingNutritionDetail = document.getElementById('feedingNutritionDetail');
        const feedingFoodMin = document.getElementById('feedingFoodMin');
        const feedingFoodMax = document.getElementById('feedingFoodMax');
        const feedingFoodUnit = document.getElementById('feedingFoodUnit');
        const feedingWaterMin = document.getElementById('feedingWaterMin');
        const feedingWaterMax = document.getElementById('feedingWaterMax');
        const feedingWaterUnit = document.getElementById('feedingWaterUnit');
        const ecologyRowsContainer = document.getElementById('ecologyRows');
        const addEcologyBtn = document.getElementById('addEcologyBtn');
        const ecologyHeroIcon = document.getElementById('ecologyHeroIcon');
        const ecologyHeroTitle = document.getElementById('ecologyHeroTitle');
        const previewEcologyModels = document.getElementById('previewEcologyModels');
        const curiosidadesRowsContainer = document.getElementById('curiosidadesRows');
        const addCuriosidadesBtn = document.getElementById('addCuriosidadesBtn');
        const curiosidadesPreviewList = document.getElementById('curiosidadesPreviewList');
        const baseDimensionOptions = [
            { label: 'Altura', unit: 'cm' },
            { label: 'Altura ao ombro', unit: 'm' },
            { label: 'Comprimento total', unit: 'm' },
            { label: 'Comprimento do corpo', unit: 'cm' },
            { label: 'Comprimento da língua', unit: 'cm' },
            { label: 'Peso', unit: 'kg' },
            { label: 'Largura do corpo', unit: 'cm' },
            { label: 'Altura do corpo', unit: 'cm' },
            { label: 'Diâmetro do corpo', unit: 'cm' },
            { label: 'Espessura do corpo', unit: 'cm' },
            { label: 'Comprimento de grandes molares', unit: 'mm' }
        ];

        const dimensionOptionsByCategory = {
            Mamiferos: [
                { label: 'Altura', unit: 'cm' },
                { label: 'Altura ao ombro', unit: 'm' },
                { label: 'Comprimento total', unit: 'm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'kg' },
                { label: 'Largura do corpo', unit: 'cm' },
                { label: 'Perímetro torácico', unit: 'cm' },
                { label: 'Comprimento da cauda', unit: 'cm' },
                { label: 'Comprimento das patas', unit: 'cm' },
                { label: 'Comprimento da orelha', unit: 'cm' },
                { label: 'Comprimento do focinho', unit: 'cm' },
                { label: 'Comprimento do pescoço', unit: 'cm' },
                { label: 'Comprimento da tromba', unit: 'cm' },
                { label: 'Comprimento das presas', unit: 'cm' },
                { label: 'Comprimento dos caninos', unit: 'cm' },
                { label: 'Comprimento dos cornos', unit: 'cm' },
                { label: 'Comprimento das galhadas', unit: 'cm' },
                { label: 'Comprimento da juba', unit: 'cm' },
                { label: 'Largura da pata', unit: 'cm' },
                { label: 'Comprimento da garra', unit: 'cm' },
                { label: 'Comprimento do casco', unit: 'cm' },
                { label: 'Comprimento da nadadeira', unit: 'cm' },
                { label: 'Comprimento da barbatana dorsal', unit: 'cm' },
                { label: 'Comprimento dos bigodes', unit: 'cm' },
                { label: 'Envergadura', unit: 'm' },
                { label: 'Comprimento de grandes molares', unit: 'mm' }
            ],
            Aves: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'kg' },
                { label: 'Altura', unit: 'cm' },
                { label: 'Envergadura', unit: 'cm' },
                { label: 'Comprimento da asa', unit: 'cm' },
                { label: 'Comprimento do bico', unit: 'cm' },
                { label: 'Comprimento da cauda', unit: 'cm' },
                { label: 'Comprimento das patas', unit: 'cm' },
                { label: 'Tamanho do ovo', unit: 'cm' },
                { label: 'Peso do bico', unit: 'g' },
                { label: 'Peso da cauda', unit: 'g' }
            ],
            Peixes: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'kg' },
                { label: 'Altura do corpo', unit: 'cm' },
                { label: 'Largura do corpo', unit: 'cm' },
                { label: 'Diâmetro do corpo', unit: 'cm' },
                { label: 'Comprimento da cabeça', unit: 'cm' },
                { label: 'Comprimento da cauda', unit: 'cm' },
                { label: 'Comprimento da boca', unit: 'cm' },
                { label: 'Largura da boca', unit: 'cm' },
                { label: 'Comprimento da barbatana dorsal', unit: 'cm' },
                { label: 'Altura da barbatana dorsal', unit: 'cm' },
                { label: 'Comprimento da barbatana caudal', unit: 'cm' },
                { label: 'Largura da barbatana caudal', unit: 'cm' },
                { label: 'Comprimento das barbatanas peitorais', unit: 'cm' },
                { label: 'Comprimento das barbatanas pélvicas', unit: 'cm' },
                { label: 'Comprimento da barbatana anal', unit: 'cm' },
                { label: 'Comprimento dos barbilhos', unit: 'cm' },
                { label: 'Comprimento do rostro', unit: 'cm' },
                { label: 'Comprimento da espada', unit: 'cm' },
                { label: 'Comprimento dos dentes', unit: 'cm' },
                { label: 'Comprimento das mandíbulas', unit: 'cm' },
                { label: 'Largura das guelras', unit: 'cm' },
                { label: 'Comprimento dos espinhos', unit: 'cm' },
                { label: 'Comprimento dos tentáculos / filamentos', unit: 'cm' },
                { label: 'Envergadura das barbatanas', unit: 'cm' },
                { label: 'Largura do disco corporal', unit: 'cm' }
            ],
            Moluscos: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'kg' },
                { label: 'Largura do corpo', unit: 'cm' },
                { label: 'Altura do corpo', unit: 'cm' },
                { label: 'Diâmetro do corpo', unit: 'cm' },
                { label: 'Comprimento da concha', unit: 'cm' },
                { label: 'Largura da concha', unit: 'cm' },
                { label: 'Altura da concha', unit: 'cm' },
                { label: 'Diâmetro da concha', unit: 'cm' },
                { label: 'Espessura da concha', unit: 'mm' },
                { label: 'Peso da concha', unit: 'g' },
                { label: 'Comprimento da abertura da concha', unit: 'cm' },
                { label: 'Largura da abertura da concha', unit: 'cm' },
                { label: 'Comprimento do manto', unit: 'cm' },
                { label: 'Largura do manto', unit: 'cm' },
                { label: 'Comprimento dos braços', unit: 'cm' },
                { label: 'Comprimento dos tentáculos', unit: 'cm' },
                { label: 'Comprimento do maior tentáculo', unit: 'cm' },
                { label: 'Diâmetro das ventosas', unit: 'mm' },
                { label: 'Comprimento do pé', unit: 'cm' },
                { label: 'Largura do pé', unit: 'cm' },
                { label: 'Comprimento dos tentáculos oculares', unit: 'cm' },
                { label: 'Comprimento dos tentáculos sensoriais', unit: 'cm' },
                { label: 'Número de braços', unit: 'unid.' },
                { label: 'Número de tentáculos', unit: 'unid.' }
            ],
            Crustaceos: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'kg' },
                { label: 'Largura do corpo', unit: 'cm' },
                { label: 'Altura do corpo', unit: 'cm' },
                { label: 'Comprimento da carapaça', unit: 'cm' },
                { label: 'Largura da carapaça', unit: 'cm' },
                { label: 'Altura da carapaça', unit: 'cm' },
                { label: 'Comprimento das pinças', unit: 'cm' },
                { label: 'Largura das pinças', unit: 'cm' },
                { label: 'Peso das pinças', unit: 'g' },
                { label: 'Comprimento das patas', unit: 'cm' },
                { label: 'Envergadura das patas', unit: 'cm' },
                { label: 'Comprimento das antenas', unit: 'cm' },
                { label: 'Comprimento do abdómen', unit: 'cm' },
                { label: 'Comprimento da cauda', unit: 'cm' },
                { label: 'Largura da cauda', unit: 'cm' },
                { label: 'Diâmetro da base', unit: 'cm' },
                { label: 'Largura da base', unit: 'cm' },
                { label: 'Comprimento do pedúnculo', unit: 'cm' },
                { label: 'Largura do pedúnculo', unit: 'cm' }
            ],
            Aracnideos: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'g' },
                { label: 'Largura do corpo', unit: 'cm' },
                { label: 'Altura do corpo', unit: 'cm' },
                { label: 'Comprimento do abdómen', unit: 'cm' },
                { label: 'Largura do abdómen', unit: 'cm' },
                { label: 'Comprimento do cefalotórax', unit: 'cm' },
                { label: 'Largura do cefalotórax', unit: 'cm' },
                { label: 'Comprimento das patas', unit: 'cm' },
                { label: 'Envergadura das patas', unit: 'cm' },
                { label: 'Comprimento dos pedipalpos', unit: 'cm' },
                { label: 'Comprimento das quelíceras', unit: 'mm' },
                { label: 'Comprimento das presas', unit: 'mm' },
                { label: 'Comprimento da cauda', unit: 'cm' },
                { label: 'Comprimento do ferrão', unit: 'mm' },
                { label: 'Comprimento das pinças', unit: 'cm' },
                { label: 'Largura das pinças', unit: 'cm' },
                { label: 'Diâmetro do corpo', unit: 'mm' }
            ],
            Vermes: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'g' },
                { label: 'Largura do corpo', unit: 'mm' },
                { label: 'Diâmetro do corpo', unit: 'mm' },
                { label: 'Espessura do corpo', unit: 'mm' },
                { label: 'Número de segmentos', unit: 'unid.' },
                { label: 'Comprimento dos segmentos', unit: 'mm' },
                { label: 'Comprimento da cabeça', unit: 'mm' },
                { label: 'Largura da cabeça', unit: 'mm' },
                { label: 'Comprimento da cauda', unit: 'mm' },
                { label: 'Comprimento da boca', unit: 'mm' },
                { label: 'Comprimento das cerdas', unit: 'mm' },
                { label: 'Comprimento dos parapódios', unit: 'mm' },
                { label: 'Comprimento dos proglótides', unit: 'mm' },
                { label: 'Número de proglótides', unit: 'unid.' },
                { label: 'Comprimento dos espículos', unit: 'mm' }
            ],
            Repteis: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'kg' },
                { label: 'Largura do corpo', unit: 'cm' },
                { label: 'Altura do corpo', unit: 'cm' },
                { label: 'Comprimento da cauda', unit: 'cm' },
                { label: 'Comprimento da cabeça', unit: 'cm' },
                { label: 'Largura da cabeça', unit: 'cm' },
                { label: 'Comprimento do focinho', unit: 'cm' },
                { label: 'Largura do focinho', unit: 'cm' },
                { label: 'Comprimento da mandíbula', unit: 'cm' },
                { label: 'Comprimento dos dentes', unit: 'cm' },
                { label: 'Comprimento das presas', unit: 'cm' },
                { label: 'Comprimento da língua', unit: 'cm' },
                { label: 'Comprimento das patas', unit: 'cm' },
                { label: 'Comprimento das garras', unit: 'cm' },
                { label: 'Comprimento da carapaça', unit: 'cm' },
                { label: 'Largura da carapaça', unit: 'cm' },
                { label: 'Altura da carapaça', unit: 'cm' },
                { label: 'Comprimento do pescoço', unit: 'cm' },
                { label: 'Comprimento da crista', unit: 'cm' },
                { label: 'Altura da crista', unit: 'cm' },
                { label: 'Diâmetro do corpo', unit: 'cm' }
            ],
            Anfibios: [
                { label: 'Comprimento total', unit: 'cm' },
                { label: 'Comprimento do corpo', unit: 'cm' },
                { label: 'Peso', unit: 'g' },
                { label: 'Largura do corpo', unit: 'cm' },
                { label: 'Altura do corpo', unit: 'cm' },
                { label: 'Comprimento da cabeça', unit: 'cm' },
                { label: 'Largura da cabeça', unit: 'cm' },
                { label: 'Comprimento das patas', unit: 'cm' },
                { label: 'Comprimento das patas dianteiras', unit: 'cm' },
                { label: 'Comprimento das patas traseiras', unit: 'cm' },
                { label: 'Comprimento dos dedos', unit: 'cm' },
                { label: 'Largura dos discos adesivos', unit: 'mm' },
                { label: 'Comprimento da cauda', unit: 'cm' },
                { label: 'Distância entre os olhos', unit: 'mm' },
                { label: 'Diâmetro dos olhos', unit: 'mm' },
                { label: 'Comprimento das guelras externas', unit: 'cm' },
                { label: 'Comprimento da crista dorsal', unit: 'cm' },
                { label: 'Diâmetro do corpo', unit: 'cm' }
            ],
            Insetos: [
                { label: 'Comprimento total', unit: 'mm' },
                { label: 'Comprimento do corpo', unit: 'mm' },
                { label: 'Peso', unit: 'mg' },
                { label: 'Largura do corpo', unit: 'mm' },
                { label: 'Altura do corpo', unit: 'mm' },
                { label: 'Comprimento da cabeça', unit: 'mm' },
                { label: 'Largura da cabeça', unit: 'mm' },
                { label: 'Comprimento do tórax', unit: 'mm' },
                { label: 'Largura do tórax', unit: 'mm' },
                { label: 'Comprimento do abdómen', unit: 'mm' },
                { label: 'Largura do abdómen', unit: 'mm' },
                { label: 'Envergadura', unit: 'mm' },
                { label: 'Comprimento da asa', unit: 'mm' },
                { label: 'Largura da asa', unit: 'mm' },
                { label: 'Comprimento das asas anteriores', unit: 'mm' },
                { label: 'Comprimento das asas posteriores', unit: 'mm' },
                { label: 'Largura das asas anteriores', unit: 'mm' },
                { label: 'Largura das asas posteriores', unit: 'mm' },
                { label: 'Comprimento das antenas', unit: 'mm' },
                { label: 'Comprimento das patas', unit: 'mm' },
                { label: 'Comprimento das patas dianteiras', unit: 'mm' },
                { label: 'Comprimento das patas médias', unit: 'mm' },
                { label: 'Comprimento das patas traseiras', unit: 'mm' },
                { label: 'Comprimento das mandíbulas', unit: 'mm' },
                { label: 'Comprimento da probóscide', unit: 'mm' },
                { label: 'Comprimento do aparelho bucal', unit: 'mm' },
                { label: 'Comprimento do ferrão', unit: 'mm' },
                { label: 'Comprimento dos cornos', unit: 'mm' },
                { label: 'Comprimento dos élitros', unit: 'mm' },
                { label: 'Comprimento do ovipositor', unit: 'mm' }
            ],
            Microscopicos: [
                { label: 'Comprimento total', unit: 'µm' },
                { label: 'Comprimento do corpo', unit: 'µm' },
                { label: 'Peso', unit: 'pg' },
                { label: 'Comprimento celular', unit: 'µm' },
                { label: 'Largura celular', unit: 'µm' },
                { label: 'Diâmetro celular', unit: 'µm' },
                { label: 'Espessura do corpo', unit: 'µm' },
                { label: 'Espessura da parede celular', unit: 'nm' },
                { label: 'Volume celular', unit: 'µm³' },
                { label: 'Comprimento do flagelo', unit: 'µm' },
                { label: 'Número de flagelos', unit: 'unid.' },
                { label: 'Comprimento dos cílios', unit: 'µm' },
                { label: 'Comprimento dos pili', unit: 'µm' },
                { label: 'Comprimento dos pseudópodes', unit: 'µm' },
                { label: 'Tamanho do núcleo', unit: 'µm' },
                { label: 'Tamanho do vacúolo', unit: 'µm' },
                { label: 'Comprimento dos filamentos', unit: 'µm' },
                { label: 'Diâmetro da colónia', unit: 'µm' },
                { label: 'Número de células por colónia', unit: 'unid.' },
                { label: 'Comprimento das patas', unit: 'µm' },
                { label: 'Comprimento dos apêndices', unit: 'µm' },
                { label: 'Comprimento das garras', unit: 'µm' },
                { label: 'Comprimento do aparelho bucal', unit: 'µm' },
                { label: 'Diâmetro da partícula viral', unit: 'nm' },
                { label: 'Comprimento da partícula viral', unit: 'nm' },
                { label: 'Diâmetro do capsídeo', unit: 'nm' },
                { label: 'Comprimento da cauda viral', unit: 'nm' }
            ],
            Extintos: [
                { label: 'Comprimento total', unit: 'm' },
                { label: 'Comprimento do corpo', unit: 'm' },
                { label: 'Altura', unit: 'cm' },
                { label: 'Altura ao ombro', unit: 'm' },
                { label: 'Peso', unit: 'kg' },
                { label: 'Comprimento da cauda', unit: 'm' },
                { label: 'Comprimento da cabeça', unit: 'cm' },
                { label: 'Largura da cabeça', unit: 'cm' },
                { label: 'Comprimento do crânio', unit: 'cm' },
                { label: 'Largura do crânio', unit: 'cm' },
                { label: 'Comprimento dos dentes', unit: 'cm' },
                { label: 'Comprimento das presas', unit: 'cm' },
                { label: 'Comprimento dos cornos', unit: 'cm' },
                { label: 'Comprimento das garras', unit: 'cm' },
                { label: 'Envergadura', unit: 'm' },
                { label: 'Comprimento da asa', unit: 'cm' }
            ]
        };

        const dimensionDefaultsByCategory = {
            Mamiferos: ['Altura', 'Comprimento total', 'Peso'],
            Aves: ['Comprimento total', 'Envergadura', 'Peso'],
            Peixes: ['Comprimento total', 'Altura do corpo', 'Peso'],
            Moluscos: ['Comprimento total', 'Peso', 'Comprimento da concha'],
            Crustaceos: ['Comprimento total', 'Largura da carapaça', 'Peso'],
            Aracnideos: ['Comprimento do corpo', 'Envergadura das patas', 'Peso'],
            Vermes: ['Comprimento total', 'Largura do corpo', 'Peso'],
            Repteis: ['Comprimento total', 'Comprimento da cauda', 'Peso'],
            Anfibios: ['Comprimento total', 'Comprimento do corpo', 'Peso'],
            Insetos: ['Comprimento total', 'Envergadura', 'Peso'],
            Microscopicos: ['Comprimento celular', 'Diâmetro celular', 'Comprimento do flagelo'],
            Extintos: ['Comprimento total', 'Altura', 'Peso']
        };

        const reproductionTypesByCategory = {
            Mamiferos: ['Vivíparo', 'Placental', 'Marsupial', 'Ovíparo'],
            Aves: ['Ovíparo', 'Incubação externa', 'Nidícola', 'Nidífugo'],
            Peixes: ['Ovíparo', 'Vivíparo', 'Ovovivíparo', 'Desova externa', 'Fertilização interna', 'Hermafrodita'],
            Moluscos: ['Ovíparo', 'Hermafrodita', 'Sexos separados', 'Fertilização interna', 'Fertilização externa', 'Desenvolvimento larvar'],
            Crustaceos: ['Ovíparo', 'Sexos separados', 'Fertilização interna', 'Ovos transportados pela fêmea', 'Desenvolvimento larvar', 'Metamorfose'],
            Aracnideos: ['Ovíparo', 'Vivíparo', 'Fertilização interna', 'Saco de ovos', 'Cuidado parental', 'Canibalismo sexual'],
            Vermes: ['Sexuada', 'Assexuada', 'Hermafrodita', 'Fragmentação', 'Regeneração', 'Postura de ovos', 'Ciclo parasitário'],
            Repteis: ['Ovíparo', 'Vivíparo', 'Ovovivíparo', 'Fertilização interna', 'Incubação externa', 'Determinação sexual por temperatura'],
            Anfibios: ['Ovíparo', 'Fertilização externa', 'Fertilização interna', 'Postura em água', 'Postura em locais húmidos', 'Metamorfose', 'Fase larvar'],
            Insetos: ['Ovíparo', 'Vivíparo', 'Partenogénese', 'Metamorfose completa', 'Metamorfose incompleta', 'Postura de ovos', 'Reprodução social'],
            Microscopicos: ['Divisão binária', 'Assexuada', 'Sexuada', 'Esporulação', 'Brotamento', 'Conjugação', 'Multiplicação celular'],
            Extintos: ['Ovíparo provável', 'Vivíparo provável', 'Fertilização interna provável', 'Postura de ovos fossilizados', 'Cuidados parentais prováveis', 'Desconhecido', 'Estimado por comparação']
        };

        const reproductionTypeDescriptions = {
            'Vivíparo': 'Crias nascem vivas',
            'Placental': 'Desenvolvimento com placenta',
            'Marsupial': 'Crias continuam na bolsa',
            'Ovíparo': 'Postura de ovos',
            'Incubação externa': 'Ovos chocados fora do corpo',
            'Nidícola': 'Crias dependentes no ninho',
            'Nidífugo': 'Crias móveis cedo',
            'Ovovivíparo': 'Ovos desenvolvem-se internamente',
            'Desova externa': 'Ovos libertados no ambiente',
            'Fertilização interna': 'Fecundação dentro do corpo',
            'Fertilização externa': 'Fecundação no ambiente',
            'Hermafrodita': 'Pode ter Ã³rgãos dos dois sexos',
            'Sexos separados': 'Macho e fêmea separados',
            'Desenvolvimento larvar': 'Passa por fase de larva',
            'Ovos transportados pela fêmea': 'Ovos presos ao corpo da fêmea',
            'Metamorfose': 'Mudança corporal durante o crescimento',
            'Saco de ovos': 'Ovos protegidos num saco',
            'Cuidado parental': 'Adultos protegem ovos ou crias',
            'Canibalismo sexual': 'Pode ocorrer após acasalamento',
            'Sexuada': 'Envolve gâmetas',
            'Assexuada': 'Sem parceiro sexual',
            'Fragmentação': 'Corpo divide-se em partes',
            'Regeneração': 'Partes regeneram novo indivíduo',
            'Postura de ovos': 'Deposita ovos no ambiente',
            'Ciclo parasitário': 'Depende de hospedeiros',
            'Incubação externa': 'Ovos desenvolvem-se fora do corpo',
            'Determinação sexual por temperatura': 'Temperatura influencia o sexo',
            'Postura em água': 'Ovos colocados na água',
            'Postura em locais húmidos': 'Ovos em ambientes húmidos',
            'Fase larvar': 'Fase inicial diferente do adulto',
            'Partenogénese': 'Desenvolvimento sem fecundação',
            'Metamorfose completa': 'Ovo, larva, pupa e adulto',
            'Metamorfose incompleta': 'Ovo, ninfa e adulto',
            'Reprodução social': 'Organizada em colónias',
            'Divisão binária': 'Uma célula divide-se em duas',
            'Esporulação': 'Forma esporos resistentes',
            'Brotamento': 'Novo organismo brota do corpo',
            'Conjugação': 'Troca de material genético',
            'Multiplicação celular': 'Aumento por divisão celular',
            'Ovíparo provável': 'Provável postura de ovos',
            'Vivíparo provável': 'Provável nascimento vivo',
            'Fertilização interna provável': 'Inferido por comparação',
            'Postura de ovos fossilizados': 'Evidência fóssil de ovos',
            'Cuidados parentais prováveis': 'Inferido por fósseis ou parentes',
            'Desconhecido': 'Sem dados suficientes',
            'Estimado por comparação': 'Baseado em espécies semelhantes'
        };

        const birdEggVisuals = [
            { label: 'Branco', image: '../assets/ovos/ovo_branco.png', average: '2-5 ovos' },
            { label: 'Creme', image: '../assets/ovos/ovo_creme.png', average: '2-5 ovos' },
            { label: 'Bege salpicado', image: '../assets/ovos/ovo_bege_salpicado.png', average: '2-5 ovos' },
            { label: 'Castanho', image: '../assets/ovos/ovo_castanho.png', average: '2-5 ovos' },
            { label: 'Azul claro', image: '../assets/ovos/ovo_azul_claro.png', average: '2-5 ovos' },
            { label: 'Azul-esverdeado', image: '../assets/ovos/ovo_azul_esverdeado_salpicado.png', average: '2-5 ovos' },
            { label: 'Manchado', image: '../assets/ovos/ovo_manchado_escuro.png', average: '2-5 ovos' },
            { label: 'Camuflado', image: '../assets/ovos/ovo_camuflado_moteado.png', average: '2-5 ovos' }
        ];

        function getBirdEggVisualByLabel(label = '') {
            return birdEggVisuals.find(egg => egg.label === label);
        }

        function isBirdEggSelection(item = {}) {
            return !!getBirdEggVisualByLabel(item.tipo || item);
        }

        const plumageVisualGroups = {
            plumagem: 'Tipo de plumagem',
            pena: 'Tipo de pena'
        };

        const plumageTypes = [
            'Penugem',
            'Plumagem juvenil',
            'Plumagem adulta',
            'Plumagem nupcial',
            'Plumagem de eclipse',
            'Plumagem de inverno',
            'Plumagem de verão',
            'Plumagem de camuflagem',
            'Plumagem ornamental',
            'Plumagem impermeável',
            'Plumagem sexualmente dimórfica'
        ];

        const featherTypes = [
            'Rémiges',
            'Retrizes',
            'Tectrizes',
            'Penugem',
            'Semiplumas',
            'Filoplumas',
            'Cerdas'
        ];

        const plumageOptionsByGroup = {
            plumagem: plumageTypes,
            pena: featherTypes
        };

        const plumageTypeDescriptions = {
            'Penugem': 'Penas muito macias e isolantes',
            'Plumagem juvenil': 'Primeira plumagem após a penugem',
            'Plumagem adulta': 'Aspeto típico da ave madura',
            'Plumagem nupcial': 'Mais vistosa durante a reprodução',
            'Plumagem de eclipse': 'Fase mais discreta após reprodução',
            'Plumagem de inverno': 'Mais isolante e discreta',
            'Plumagem de verão': 'Mais leve, definida e sazonal',
            'Plumagem de camuflagem': 'Mistura-se com o bioma',
            'Plumagem ornamental': 'Usada em exibição e atração',
            'Plumagem impermeável': 'Adaptada Ã  repelência da água',
            'Plumagem sexualmente dimórfica': 'Macho e fêmea com visuais distintos',
            'Rémiges': 'Penas de voo das asas',
            'Retrizes': 'Penas da cauda, direção e travagem',
            'Tectrizes': 'Penas de cobertura do corpo e asas',
            'Semiplumas': 'Misturam estrutura com suavidade',
            'Filoplumas': 'Penas finas de função sensorial',
            'Cerdas': 'Estruturas rígidas perto do bico e olhos'
        };

        const plumageVisualAssets = {
            'Penugem': { image: '../assets/plumagem/penugem.png', group: 'plumagem' },
            'Plumagem juvenil': { image: '../assets/plumagem/semiplumas.png', group: 'plumagem' },
            'Plumagem adulta': { image: '../assets/plumagem/remiges.png', group: 'plumagem' },
            'Plumagem nupcial': { image: '../assets/plumagem/retrizes.png', group: 'plumagem' },
            'Plumagem de eclipse': { image: '../assets/plumagem/tectrizes.png', group: 'plumagem' },
            'Plumagem de inverno': { image: '../assets/plumagem/semiplumas.png', group: 'plumagem' },
            'Plumagem de verão': { image: '../assets/plumagem/remiges.png', group: 'plumagem' },
            'Plumagem de camuflagem': { image: '../assets/plumagem/tectrizes.png', group: 'plumagem' },
            'Plumagem ornamental': { image: '../assets/plumagem/retrizes.png', group: 'plumagem' },
            'Plumagem impermeável': { image: '../assets/plumagem/remiges.png', group: 'plumagem' },
            'Plumagem sexualmente dimórfica': { image: '../assets/plumagem/retrizes.png', group: 'plumagem' },
            'Rémiges': { image: '../assets/plumagem/remiges.png', group: 'pena' },
            'Retrizes': { image: '../assets/plumagem/retrizes.png', group: 'pena' },
            'Tectrizes': { image: '../assets/plumagem/tectrizes.png', group: 'pena' },
            'Semiplumas': { image: '../assets/plumagem/semiplumas.png', group: 'pena' },
            'Filoplumas': { image: '../assets/plumagem/filoplumas.png', group: 'pena' },
            'Cerdas': { image: '../assets/plumagem/cerdas.png', group: 'pena' }
        };

        const dimensionUnits = ['nm', 'µm', 'mm', 'cm', 'm', 'km', 'pg', 'ng', 'µg', 'mg', 'g', 'kg', 't', 'unid.', 'mm²', 'cm²', 'µm²', 'mm³', 'cm³', 'µm³'];


        // --- SALVAR OU ATUALIZAR ---
        animalForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            saveButton.disabled = true;
            saveButton.textContent = isEditMode ? 'A atualizar...' : 'A gravar...';
            
            try {
                const scientificNameKey = document.getElementById('nomeCientifico').value.trim().toLowerCase().replace(/\s+/g, '_');
                const docId = isEditMode ? currentEditingId : scientificNameKey;
                if (!docId) { throw new Error("Não foi possível determinar o ID do documento."); }
                
                let timestamp = Date.now();
                let editado = [];
                let criadoPor = auth.currentUser ? auth.currentUser.uid : null;
                
                if (isEditMode) {
                    const existingAnimal = allAnimals.find(a => a.id === docId);
                    if (existingAnimal && existingAnimal.timestamp) {
                        timestamp = existingAnimal.timestamp;
                    }
                    if (existingAnimal && existingAnimal.criadoPor) {
                        criadoPor = existingAnimal.criadoPor;
                    }
                    if (existingAnimal && existingAnimal.editado) {
                        editado = Array.isArray(existingAnimal.editado) ? [...existingAnimal.editado] : [];
                    }
                    editado.push({
                        timestamp: Date.now(),
                        editadoPor: auth.currentUser ? auth.currentUser.uid : null
                    });
                }

                const curiosidadesDetalhadas = getCuriosidadesData();
                const ecologiaDetalhada = getEcologyData();

                const animalData = {
                    nome: document.getElementById('nomeAnimal').value,
                    nomeCientifico: document.getElementById('nomeCientifico').value,
                    familia: document.getElementById('familia').value.trim(),
                    reino: document.getElementById('reino').value.trim(),
                    filo: document.getElementById('filo').value.trim(),
                    subfilo: document.getElementById('subfilo').value.trim(),
                    classe: document.getElementById('classe').value.trim(),
                    superordem: document.getElementById('superordem').value.trim(),
                    ordem: document.getElementById('ordem').value.trim(),
                    subordem: document.getElementById('subordem').value.trim(),
                    infraordem: document.getElementById('infraordem').value.trim(),
                    genero: document.getElementById('genero').value.trim(),
                    especie: document.getElementById('especies').value.trim(),
                    subespeciesDe: selectedSubespecies,
                    imagemUrl: document.getElementById('imagemUrl').value,
                    imagemObjectPosition: document.getElementById('imagemObjectPosition').value || 'center center',
                    categoria: getSelectedCategoriesMap(),
                    timestamp: timestamp,
                    editado: editado,
                    criadoPor: criadoPor,
                    informacao: {
                        geral: document.getElementById('infoGeral').value,
                        geralDetalhada: expandCombinedGenderItems(getGeneralVisualData()),
                        dimensoes: document.getElementById('infoDimensoes').value,
                        dimensoesDetalhadas: expandCombinedGenderItems(getDimensionData()),
                        alimentacao: document.getElementById('infoAlimentacao').value,
                        alimentacaoDetalhada: getFeedingData(),
                        ecologia: buildEcologyInfoObject(ecologiaDetalhada),
                        reproducao: document.getElementById('infoReproducao').value,
                        reproducaoDetalhada: getReproductionData(),
                        plumagem: document.getElementById('infoPlumagem').value || '',
                        plumagemDetalhada: getPlumageData(),
                        distribuicao: {
                            paises: selectedCountries,
                            paisesDetalhes: paisesDetalhes,
                            descricao: document.getElementById('infoDistribuicao').value || ''
                        },
                        curiosidades: {
                            cor: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Cor do animal'),
                            estadoConservacao: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Estado de Conservação'),
                            tipoComunicacao: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Tipo de Comunicação'),
                            tipoComunicacaoDescricao: getPreferredCuriosidadeDescription(curiosidadesDetalhadas, 'Tipo de Comunicação'),
                            temperaturaAmbiente: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Temperatura do Ambiente'),
                            relacaoHumanos: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Relação com Humanos'),
                            tambemConhecidoComo: parseAlsoKnownAsNames(getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Também conhecido como') || curiosidadesDetalhadas.filter(item => item.tipo === 'Também conhecido como').map(item => item.valor).join(', ')),
                            detalhes: curiosidadesDetalhadas,
                            texto: document.getElementById('infoCuriosidades').value
                        }
                    },
                    videos: [
                        document.getElementById('video1').value,
                        document.getElementById('video2').value,
                        document.getElementById('video3').value,
                        document.getElementById('video4').value,
                        document.getElementById('video5').value
                    ].filter(url => url)
                };

                await setDoc(doc(db, "animais", docId), animalData);



                statusMessage.className = 'grid-span-3 success';
                statusMessage.textContent = `Animal ${isEditMode ? 'atualizado' : 'gravado'} com sucesso!`;
                
                await initializePage();
                switchToCreateMode();
            } catch (error) {
                console.error("Erro ao gravar no Firestore:", error);
                statusMessage.className = 'grid-span-3 error';
                statusMessage.textContent = 'Ocorreu um erro ao gravar. Verifique a consola.';
            } finally {
                saveButton.disabled = false;
            }
        });

        // --- DIMENSÕES E MODELO VISUAL ---
        function getSelectedCategory() {
            return document.getElementById('categoria').value || '';
        }

        function getDimensionOptionsForCategory(category = getSelectedCategory()) {
            const categoryOptions = dimensionOptionsByCategory[category] || [];
            const merged = [...categoryOptions, ...baseDimensionOptions];
            const seen = new Set();
            return merged.filter(option => {
                if (!option?.label || seen.has(option.label)) return false;
                seen.add(option.label);
                return true;
            });
        }

        function getDimensionOption(metric, category = getSelectedCategory()) {
            return getDimensionOptionsForCategory(category).find(option => option.label === metric) ||
                   Object.values(dimensionOptionsByCategory).flat().find(option => option.label === metric) ||
                   baseDimensionOptions.find(option => option.label === metric);
        }

        function fillDimensionMetricSelect(select, selectedValue = '') {
            const options = [...getDimensionOptionsForCategory()].sort((a, b) => a.label.localeCompare(b.label));
            const hasSelected = selectedValue && options.some(option => option.label === selectedValue);
            select.innerHTML = `<option value="">Escolha uma medida</option>` +
                options.map(option => `<option value="${option.label}">${option.label}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — fora desta categoria</option>` : '');
            select.value = selectedValue;
        }

        function updateAllDimensionMetricSelects() {
            dimensionRowsContainer.querySelectorAll('.dimension-row').forEach(row => {
                const metricSelect = row.querySelector('.dimension-metric');
                const currentMetric = metricSelect.value;
                fillDimensionMetricSelect(metricSelect, currentMetric);
            });
        }

        function getDefaultDimensionsForCategory(category = getSelectedCategory()) {
            const defaults = dimensionDefaultsByCategory[category] || ['Altura', 'Peso', 'Comprimento total'];
            return defaults.map(label => {
                const option = getDimensionOption(label, category) || { label, unit: 'cm' };
                return { tipo: option.label, valorMin: '', valorMax: '', unidade: option.unit };
            });
        }

        function createDimensionRow(metric = '', minValue = '', unit = '', maxValue = '', gender = GENDER_BOTH, fase = 'Adulto') {
            const row = document.createElement('div');
            row.className = 'dimension-row';

            const metricSelect = document.createElement('select');
            metricSelect.className = 'dimension-metric';
            fillDimensionMetricSelect(metricSelect, metric);

            const minInput = document.createElement('input');
            minInput.className = 'dimension-min';
            minInput.type = 'number';
            minInput.step = '0.01';
            minInput.min = '0';
            minInput.placeholder = 'Ex: 66';
            minInput.value = minValue;

            const maxInput = document.createElement('input');
            maxInput.className = 'dimension-max';
            maxInput.type = 'number';
            maxInput.step = '0.01';
            maxInput.min = '0';
            maxInput.placeholder = 'Ex: 76';
            maxInput.value = maxValue;
            maxInput.title = 'Opcional. Usa para intervalos, como 66-76 cm.';

            const unitSelect = document.createElement('select');
            unitSelect.className = 'dimension-unit';
            unitSelect.innerHTML = dimensionUnits.map(u => `<option value="${u}">${u}</option>`).join('');
            unitSelect.value = unit || getDimensionOption(metric)?.unit || 'cm';

            const genderBtn = document.createElement('button');
            genderBtn.type = 'button';
            genderBtn.className = 'gender-toggle-btn dimension-gender-toggle';
            genderBtn.dataset.value = normalizeGenderValue(gender, GENDER_BOTH);
            function updateGenderBtnUI() {
                const ui = getGenderUi(genderBtn.dataset.value);
                genderBtn.dataset.value = ui.value;
                genderBtn.innerHTML = ui.html;
                genderBtn.title = ui.title;
            }
            updateGenderBtnUI();

            const faseBtn = document.createElement('button');
            faseBtn.type = 'button';
            faseBtn.className = 'fase-toggle-btn dimension-fase-toggle';
            faseBtn.dataset.value = fase || 'Adulto';
            function updateFaseBtnUI() {
                if (faseBtn.dataset.value === 'Adulto') {
                    faseBtn.innerHTML = '<i class="fa-solid fa-paw" style="color: #10b981; font-size: 0.9rem;"></i>';
                    faseBtn.title = 'Adulto';
                } else {
                    faseBtn.innerHTML = '<i class="fa-solid fa-baby" style="color: #f59e0b; font-size: 0.9rem;"></i>';
                    faseBtn.title = 'Cria';
                }
            }
            updateFaseBtnUI();

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover medida';

            metricSelect.addEventListener('change', () => {
                const selected = getDimensionOption(metricSelect.value);
                if (selected && !unitSelect.dataset.userChanged) unitSelect.value = selected.unit;
                updateDimensionPreview();
            });
            minInput.addEventListener('input', updateDimensionPreview);
            maxInput.addEventListener('input', updateDimensionPreview);
            unitSelect.addEventListener('change', () => {
                unitSelect.dataset.userChanged = 'true';
                updateDimensionPreview();
            });
            genderBtn.addEventListener('click', () => {
                genderBtn.dataset.value = getNextGenderValue(genderBtn.dataset.value);
                updateGenderBtnUI();
                updateDimensionPreview();
            });
            faseBtn.addEventListener('click', () => {
                faseBtn.dataset.value = faseBtn.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                updateFaseBtnUI();
                updateDimensionPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (dimensionRowsContainer.children.length === 0) createDimensionRow();
                updateDimensionPreview();
            });

            row.append(metricSelect, minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
            dimensionRowsContainer.appendChild(row);
            updateDimensionPreview();
        }

        function getDimensionData() {
            return [...dimensionRowsContainer.querySelectorAll('.dimension-row')]
                .map(row => {
                    const min = row.querySelector('.dimension-min')?.value || '';
                    const max = row.querySelector('.dimension-max')?.value || '';
                    return {
                        tipo: row.querySelector('.dimension-metric').value,
                        valor: min,
                        valorMin: min,
                        valorMax: max,
                        unidade: row.querySelector('.dimension-unit').value,
                        genero: normalizeGenderValue(row.querySelector('.dimension-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.dimension-fase-toggle')?.dataset.value || 'Adulto'
                    };
                })
                .filter(item => item.tipo && (item.valorMin || item.valorMax));
        }

        function setDimensionData(dimensions = []) {
            dimensionRowsContainer.innerHTML = '';
            const normalizedDimensions = collapseCombinedGenderItems(dimensions);
            if (!Array.isArray(normalizedDimensions) || normalizedDimensions.length === 0) {
                getDefaultDimensionsForCategory().forEach(item => createDimensionRow(item.tipo, '', item.unidade, '', item.genero || GENDER_BOTH, item.fase || 'Adulto'));
                return;
            }
            normalizedDimensions.forEach(item => createDimensionRow(
                item.tipo,
                item.valorMin ?? item.valor ?? '',
                item.unidade,
                item.valorMax ?? '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto'
            ));
            updateDimensionPreview();
        }

        function findDimension(labels) {
            const labelList = labels.map(label => label.toLowerCase());
            const dimensions = getDimensionData();
            return dimensions.find(item => labelList.includes(item.tipo.toLowerCase())) ||
                   dimensions.find(item => labelList.some(label => item.tipo.toLowerCase().includes(label)));
        }

        function formatDimension(item, fallback) {
            if (!item) return fallback;
            const min = item.valorMin ?? item.valor ?? '';
            const max = item.valorMax ?? '';
            const unit = item.unidade || '';
            const value = min && max ? `${min}-${max}` : `${min || max}`;
            return `${value}${unit ? ` ${unit}` : ''}`.trim() || fallback;
        }

        function normalizeDimensionKey(label = '') {
            return String(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function getDimensionVisualMeta(metric = '') {
            const normalized = normalizeDimensionKey(metric);
            if (normalized.includes('bico') && normalized.includes('peso')) return { key: 'peso-bico', title: metric || 'Peso do bico', accent: 'accent-beak' };
            if (normalized.includes('cauda') && normalized.includes('peso')) return { key: 'peso-cauda', title: metric || 'Peso da cauda', accent: 'accent-tail' };
            if (normalized.includes('altura')) return { key: 'altura', title: metric || 'Altura', accent: 'accent-height' };
            if (normalized.includes('peso')) return { key: 'peso', title: metric || 'Peso', accent: 'accent-weight' };
            if (normalized.includes('envergadura')) return { key: 'envergadura', title: metric || 'Envergadura', accent: 'accent-wing' };
            if (normalized.includes('asa')) return { key: 'asa', title: metric || 'Comprimento da asa', accent: 'accent-wing' };
            if (normalized.includes('bico')) return { key: 'bico', title: metric || 'Comprimento do bico', accent: 'accent-beak' };
            if (normalized.includes('lingua')) return { key: 'lingua', title: metric || 'Comprimento da língua', accent: 'accent-tongue' };
            if (normalized.includes('cauda')) return { key: 'cauda', title: metric || 'Comprimento da cauda', accent: 'accent-tail' };
            if (normalized.includes('molares') || normalized.includes('molar')) return { key: 'molares', title: metric || 'Comprimento de grandes molares', accent: 'accent-beak' };
            if (normalized.includes('pata')) return { key: 'patas', title: metric || 'Comprimento das patas', accent: 'accent-leg' };
            if (normalized.includes('ovo')) return { key: 'ovo', title: metric || 'Tamanho do ovo', accent: 'accent-egg' };
            if (normalized.includes('largura')) return { key: 'largura', title: metric || 'Largura', accent: 'accent-width' };
            if (normalized.includes('diametro')) return { key: 'diametro', title: metric || 'Diâmetro do corpo', accent: 'accent-width' };
            if (normalized.includes('comprimento')) return { key: 'comprimento', title: metric || 'Comprimento', accent: 'accent-length' };
            return { key: 'medida', title: metric || 'Medida', accent: 'accent-generic' };
        }

        function getCategoryModelSvg(category = '') {
            const normalized = normalizeDimensionKey(category);
            const bird = `<svg class="animal-model-svg bird-model-svg real-bird-model" viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path class="bird-shadow" d="M52 102C80 110 133 110 171 99"/>
                <ellipse class="bird-head-fill" cx="69" cy="54" rx="18" ry="15"/>
                <path class="bird-beak-fill" d="M47 53L22 60L47 67L58 60L47 53Z"/>
                <path class="bird-body-fill" d="M79 44C96 30 119 26 142 31C163 35 181 49 189 69C191 75 189 81 184 85L171 95H147L129 106H93L99 93H86C74 93 65 86 62 76C60 67 65 55 79 44Z"/>
                <path class="bird-tail-fill" d="M187 67H214L192 84H172C180 80 185 74 187 67Z"/>
                <path class="bird-wing-fill" d="M96 45C117 45 135 58 145 80C134 83 119 82 106 76C96 71 89 63 86 53C89 49 92 47 96 45Z"/>
                <path class="bird-leg-line" d="M101 92L92 113"/>
                <path class="bird-leg-line" d="M116 92L109 113"/>
                <path class="bird-body-line" d="M58 60C59 48 67 40 78 39C96 30 119 26 142 31C163 35 181 49 189 69H214L192 84H171L154 95H130L116 106H90L96 93H86C74 93 65 86 62 76L47 67L22 60L47 53L58 60Z"/>
                <path class="bird-wing-line" d="M90 53C101 57 112 66 120 80"/>
                <path class="bird-wing-line soft" d="M108 48C122 55 134 67 141 81"/>
                <path class="bird-wing-line soft" d="M125 47C138 53 149 64 156 76"/>
                <path class="bird-body-line" d="M58 60C60 51 66 43 74 40"/>
                <circle class="bird-eye" cx="63" cy="51" r="4"/>
            </svg>`;
            const models = {
                                mamiferos: `<svg class="animal-model-svg mammal-model-svg real-mammal-model" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="mammal-shadow" d="M54 101C88 109 147 109 187 100"/>
                    <path class="mammal-body-fill" d="M42 73L26 69L43 63H56L67 50L80 38L92 48C107 42 126 41 144 45C162 49 176 59 184 72L198 80L184 86L173 84C165 94 152 100 137 102H120L113 108H102L106 102H86L81 108H70L74 101H58L51 108H40L48 97C40 93 35 84 37 76L42 73Z"/>
                    <path class="mammal-body-line" d="M42 73L26 69L43 63H56L67 50L80 38L92 48C107 42 126 41 144 45C162 49 176 59 184 72L198 80L184 86L173 84C165 94 152 100 137 102H120L113 108H102L106 102H86L81 108H70L74 101H58L51 108H40L48 97C40 93 35 84 37 76L42 73Z"/>
                    <path class="mammal-snout-line" d="M42 73L21 67L42 62"/>
                    <path class="mammal-ear-line" d="M67 50L79 37L91 47"/>
                    <path class="mammal-back-line" d="M93 48C113 45 135 47 153 56"/>
                    <path class="mammal-tail-line" d="M183 72L204 66"/>
                    <path class="mammal-leg-line" d="M69 100L62 115"/>
                    <path class="mammal-leg-line" d="M88 100L84 115"/>
                    <path class="mammal-leg-line" d="M118 101L116 115"/>
                    <path class="mammal-leg-line" d="M144 100L144 115"/>
                    <circle class="mammal-eye" cx="61" cy="60" r="3.5"/>
                </svg>`,
                aves: bird,
                ave: bird,
                peixes: `<svg class="animal-model-svg fish-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M22 55C39 34 62 24 91 24C121 24 145 35 163 55C145 75 121 86 91 86C62 86 39 76 22 55Z"/><path class="animal-line" d="M22 55C39 34 62 24 91 24C121 24 145 35 163 55C145 75 121 86 91 86C62 86 39 76 22 55Z"/><path class="animal-line" d="M163 55L177 35V75L163 55Z"/><path class="animal-line" d="M87 29L73 10"/><path class="animal-line" d="M87 81L73 100"/><circle class="animal-dot" cx="62" cy="50" r="3.5"/></svg>`,
                                repteis: `<svg class="animal-model-svg reptile-model-svg real-reptile-model" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="reptile-shadow" d="M44 101C78 109 143 109 193 99"/>
                    <path class="reptile-body-fill" d="M39 73L24 66L41 59H57C65 47 77 39 91 37C104 28 121 25 139 27C161 30 180 41 190 57L211 54L201 66L189 68C183 79 173 87 160 91H143L133 101H121L126 90H103L98 102H86L91 90H70L60 102H47L55 88C47 86 41 81 39 73Z"/>
                    <path class="reptile-body-line" d="M39 73L24 66L41 59H57C65 47 77 39 91 37C104 28 121 25 139 27C161 30 180 41 190 57L211 54L201 66L189 68C183 79 173 87 160 91H143L133 101H121L126 90H103L98 102H86L91 90H70L60 102H47L55 88C47 86 41 81 39 73Z"/>
                    <path class="reptile-head-line" d="M39 73L18 66L39 59"/>
                    <path class="reptile-back-line" d="M100 36C122 33 144 36 162 47"/>
                    <path class="reptile-tail-line" d="M188 58L214 46"/>
                    <path class="reptile-leg-line" d="M71 89L61 108"/>
                    <path class="reptile-leg-line" d="M95 90L89 108"/>
                    <path class="reptile-leg-line" d="M130 90L126 108"/>
                    <path class="reptile-leg-line" d="M155 88L155 106"/>
                    <circle class="reptile-eye" cx="56" cy="62" r="3.5"/>
                </svg>`,
                anfibios: `<svg class="animal-model-svg amphibian-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M38 64C38 38 59 21 90 21C121 21 142 38 142 64C142 86 125 101 99 101H81C55 101 38 86 38 64Z"/><path class="animal-line" d="M38 64C38 38 59 21 90 21C121 21 142 38 142 64C142 86 125 101 99 101H81C55 101 38 86 38 64Z"/><path class="animal-line" d="M64 86L45 104"/><path class="animal-line" d="M78 91L65 108"/><path class="animal-line" d="M102 91L115 108"/><path class="animal-line" d="M116 86L135 104"/><circle class="animal-line" cx="73" cy="42" r="7"/><circle class="animal-line" cx="107" cy="42" r="7"/></svg>`,
                insetos: `<svg class="animal-model-svg insect-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="58" rx="22" ry="31"/><ellipse class="animal-line" cx="90" cy="58" rx="22" ry="31"/><path class="animal-line" d="M90 20V31"/><path class="animal-line" d="M58 39L74 49"/><path class="animal-line" d="M122 39L106 49"/><path class="animal-line" d="M59 79L75 68"/><path class="animal-line" d="M121 79L105 68"/><path class="animal-line" d="M75 35C61 21 43 21 31 30C35 50 52 58 75 56"/><path class="animal-line" d="M105 35C119 21 137 21 149 30C145 50 128 58 105 56"/></svg>`,
                crustaceos: `<svg class="animal-model-svg crab-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M55 55C55 36 70 25 90 25C110 25 125 36 125 55C125 77 112 91 90 91C68 91 55 77 55 55Z"/><path class="animal-line" d="M55 55C55 36 70 25 90 25C110 25 125 36 125 55C125 77 112 91 90 91C68 91 55 77 55 55Z"/><path class="animal-line" d="M57 51L26 34L18 19L38 26"/><path class="animal-line" d="M123 51L154 34L162 19L142 26"/><path class="animal-line" d="M66 78L45 98"/><path class="animal-line" d="M82 84L74 104"/><path class="animal-line" d="M98 84L106 104"/><path class="animal-line" d="M114 78L135 98"/><circle class="animal-dot" cx="78" cy="46" r="3"/><circle class="animal-dot" cx="102" cy="46" r="3"/></svg>`,
                aracnideos: `<svg class="animal-model-svg spider-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="59" rx="25" ry="22"/><ellipse class="animal-line" cx="90" cy="59" rx="25" ry="22"/><circle class="animal-line" cx="90" cy="34" r="13"/><path class="animal-line" d="M66 52L36 34L17 37"/><path class="animal-line" d="M64 61L32 61L14 70"/><path class="animal-line" d="M68 70L40 91L19 94"/><path class="animal-line" d="M114 52L144 34L163 37"/><path class="animal-line" d="M116 61L148 61L166 70"/><path class="animal-line" d="M112 70L140 91L161 94"/></svg>`,
                moluscos: `<svg class="animal-model-svg mollusc-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M38 76C42 45 65 25 94 25C120 25 139 41 142 67C130 87 108 98 76 98C58 98 45 91 38 76Z"/><path class="animal-line" d="M38 76C42 45 65 25 94 25C120 25 139 41 142 67C130 87 108 98 76 98C58 98 45 91 38 76Z"/><path class="animal-line" d="M62 82C74 63 89 47 111 35"/><path class="animal-line" d="M86 96C99 76 116 60 139 50"/><path class="animal-line" d="M39 79L15 92"/><path class="animal-line" d="M47 87L20 104"/></svg>`,
                vermes: `<svg class="animal-model-svg worm-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-line" d="M20 68C42 38 61 89 86 58C111 27 130 78 160 44"/><path class="animal-line" d="M36 53L45 61"/><path class="animal-line" d="M68 73L78 63"/><path class="animal-line" d="M103 44L113 54"/><path class="animal-line" d="M136 59L145 49"/></svg>`,
                microscopicos: `<svg class="animal-model-svg micro-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="58" rx="38" ry="27"/><ellipse class="animal-line" cx="90" cy="58" rx="38" ry="27"/><path class="animal-line" d="M62 39L50 24"/><path class="animal-line" d="M75 33L72 14"/><path class="animal-line" d="M103 33L108 14"/><path class="animal-line" d="M120 42L136 26"/><path class="animal-line" d="M55 70L38 80"/><path class="animal-line" d="M124 72L143 83"/><circle class="animal-dot" cx="78" cy="55" r="3"/><circle class="animal-dot" cx="100" cy="50" r="3"/><circle class="animal-dot" cx="95" cy="67" r="3"/></svg>`,
                extintos: `<svg class="animal-model-svg dino-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M24 74C34 42 60 27 98 31C122 34 139 46 151 65L170 68L157 82H142C137 96 119 104 92 104H73L67 109H53L58 98H39L33 109H19L29 91C23 86 21 80 24 74Z"/><path class="animal-line" d="M24 74C34 42 60 27 98 31C122 34 139 46 151 65L170 68L157 82H142C137 96 119 104 92 104H73L67 109H53L58 98H39L33 109H19L29 91C23 86 21 80 24 74Z"/><path class="animal-line" d="M96 33L111 12"/><path class="animal-line" d="M111 12L125 25"/><circle class="animal-dot" cx="58" cy="44" r="3.5"/></svg>`
            };
            return models[normalized] || bird;
        }

        function getMetricModelSvg(key = 'medida') {
            const icons = {
                altura: `<svg class="metric-model-svg metric-height" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 10v60"/><path d="M18 10l-7 8"/><path d="M18 10l7 8"/><path d="M18 70l-7-8"/><path d="M18 70l7-8"/><path d="M40 19c10 0 18 9 18 24s-8 24-18 24"/><path d="M40 19c-6 5-9 13-9 24s3 19 9 24"/></svg>`,
                peso: `<svg class="metric-model-svg metric-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M25 68h30"/><path d="M40 13l-12 14h24L40 13Z"/><path d="M28 27h24l9 31H19l9-31Z"/><path d="M40 35v8"/></svg>`,
                'peso-bico': `<svg class="metric-model-svg metric-beak-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 43h22l24-15v30L37 43H15Z"/><circle cx="23" cy="36" r="3"/><path d="M58 12v12"/><path d="M50 18h16"/><path d="M53 25h10"/></svg>`,
                comprimento: `<svg class="metric-model-svg metric-length" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M11 45h58"/><path d="M11 45l8-8"/><path d="M11 45l8 8"/><path d="M69 45l-8-8"/><path d="M69 45l-8 8"/><path d="M20 31c12-12 28-12 40 0"/></svg>`,
                largura: `<svg class="metric-model-svg metric-width" viewBox="0 0 80 80" fill="none" aria-hidden="true"><ellipse cx="40" cy="41" rx="21" ry="27"/><path d="M18 41h44"/><path d="M18 41l7-7"/><path d="M18 41l7 7"/><path d="M62 41l-7-7"/><path d="M62 41l-7 7"/></svg>`,
                diametro: `<svg class="metric-model-svg metric-diameter" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M15 40h50"/><path d="M15 40l7-7"/><path d="M15 40l7 7"/><path d="M65 40l-7-7"/><path d="M65 40l-7 7"/></svg>`,
                bico: `<svg class="metric-model-svg metric-beak" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M13 44c8-15 22-24 37-22c8 1 13 5 16 11h8L61 44H42l-9 9H18l5-9H13Z"/><path d="M57 33h17"/><path d="M57 44h17"/><circle cx="35" cy="31" r="3"/></svg>`,
                lingua: `<svg class="metric-model-svg metric-tongue" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 39c8-13 22-20 37-18c8 1 14 5 17 11"/><path d="M18 49c10 8 25 10 39 3c8-4 13-10 13-18"/><path d="M35 48c7 11 21 16 31 8c6-5 6-14-1-18c-9-5-19 4-24 11"/><path d="M38 52c7 4 15 4 22-1"/><circle cx="35" cy="31" r="3"/></svg>`,
                cauda: `<svg class="metric-model-svg metric-tail" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 44h19"/><path d="M35 44L66 22"/><path d="M35 44L70 44"/><path d="M35 44L66 66"/><path d="M15 33v22"/><path d="M54 22v44"/></svg>`,
                'peso-cauda': `<svg class="metric-model-svg metric-tail-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M12 44h17"/><path d="M29 44L58 23"/><path d="M29 44L62 44"/><path d="M29 44L58 65"/><path d="M56 13v12"/><path d="M48 19h16"/><path d="M51 26h10"/></svg>`,
                asa: `<svg class="metric-model-svg metric-wing" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 55C27 30 44 16 67 13C63 34 51 52 30 66H14V55Z"/><path d="M31 28C38 36 42 46 43 59"/><path d="M45 21C51 30 53 40 53 50"/></svg>`,
                envergadura: `<svg class="metric-model-svg metric-wingspan" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M7 42h66"/><path d="M7 42l8-8"/><path d="M7 42l8 8"/><path d="M73 42l-8-8"/><path d="M73 42l-8 8"/><path d="M17 55c8-13 15-20 23-23"/><path d="M63 55c-8-13-15-20-23-23"/></svg>`,
                patas: `<svg class="metric-model-svg metric-legs" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M28 13v39"/><path d="M52 13v39"/><path d="M24 52l-10 12"/><path d="M28 52l4 13"/><path d="M32 52l12 10"/><path d="M48 52l-10 12"/><path d="M52 52l4 13"/><path d="M56 52l12 10"/></svg>`,
                ovo: `<svg class="metric-model-svg metric-egg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c13 0 23 17 23 33c0 15-9 27-23 27S17 58 17 43C17 27 27 10 40 10Z"/><path d="M20 70h40"/></svg>`,
                molares: `<svg class="metric-model-svg metric-molar" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 20c0-5 10-10 20-10s20 5 20 10c0 10-5 22-5 35c0 5-5 5-5 5c-5 0-5-10-10-10s-5 10-10 10c0 0-5 0-5-5c0-13-5-25-5-35Z"/><path d="M40 12v18"/></svg>`,
                medida: `<svg class="metric-model-svg metric-generic" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 59L58 17l6 6l-42 42l-8-6Z"/><path d="M26 49l6 6"/><path d="M36 39l6 6"/><path d="M46 29l6 6"/></svg>`
            };
            return icons[key] || icons.medida;
        }

        function getDimensionSortOrder(item) {
            const key = getDimensionVisualMeta(item?.tipo).key;
            const order = {
                altura: 0,
                peso: 1,
                comprimento: 2,
                largura: 3,
                diametro: 4,
                envergadura: 5,
                asa: 6,
                bico: 7,
                lingua: 8,
                'peso-bico': 9,
                cauda: 10,
                'peso-cauda': 11,
                patas: 12,
                ovo: 13,
                medida: 99
            };
            return order[key] ?? 50;
        }

        function renderDimensionModelCard(item) {
            const meta = getDimensionVisualMeta(item.tipo);
            return `
                <article class="dimension-model-card ${meta.accent}">
                    <div class="dimension-model-icon">${getMetricModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${formatDimension(item, '—')}</div>
                    </div>
                </article>`;
        }

        function updateAnimalSilhouette() {
            const category = document.getElementById('categoria').value;
            animalSilhouette.innerHTML = getCategoryModelSvg(category);
        }

        function updateDimensionPreview() {
            updateAnimalSilhouette();
            const allDimensions = getDimensionData();
            const height = findDimension(['Altura', 'Altura ao ombro']);
            const weight = findDimension(['Peso']);
            const length = findDimension(['Comprimento total', 'Comprimento do corpo', 'Envergadura']);

            previewHeightValue.textContent = height ? formatDimension(height, '') : '';
            previewHeightValue.closest('.height-ruler')?.classList.toggle('is-empty', !height);

            previewWeightValue.textContent = weight ? formatDimension(weight, '') : '';
            previewWeightValue.classList.toggle('is-empty', !weight);

            previewLengthValue.textContent = length ? formatDimension(length, '') : '';
            previewLengthValue.classList.toggle('is-empty', !length);

            const ordered = [...allDimensions].sort((a, b) => getDimensionSortOrder(a) - getDimensionSortOrder(b));
            previewDimensionModels.innerHTML = ordered.length
                ? ordered.map(renderDimensionModelCard).join('')
                : '<div class="dimension-model-empty">Adiciona medidas para ver um modelo próprio para cada aspeto.</div>';
        }


        // --- INFORMAÇÃO GERAL E MODELO VISUAL ---
        const generalVisualOptions = [
            { tipo: 'Vida útil', unidade: 'anos' },
            { tipo: 'Velocidade máxima', unidade: 'km/h' },
            { tipo: 'Velocidade média', unidade: 'km/h' },
            { tipo: 'Força da mordida', unidade: 'PSI' },
            { tipo: 'Tempo de Amamentação', unidade: 'meses' },
            { tipo: 'Estratégia para obter alimento', unidade: '' },
            { tipo: 'Tamanho da População', unidade: 'milhares' },
            { tipo: 'Atividade', unidade: '' },
            { tipo: 'Vida Social', unidade: '' },
            { tipo: 'Função ecológica', unidade: '' },
            { tipo: 'Locomoção', unidade: '' },
            { tipo: 'Zona Climática', unidade: '' },
            { tipo: 'Bioma', unidade: '' }
        ];

        const generalVisualUnits = ['', 'dias', 'meses', 'anos', 'km/h', 'm/s', 'PSI', 'indivíduos', 'dezenas', 'centenas', 'milhares', 'milhões'];

        function getGeneralVisualOption(type = '') {
            return getGeneralVisualCatalogOption(type);
        }

        const ecologyFunctionLabel = 'Função ecológica';
        function isEcologyFunctionType(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('funcao ecologica') || normalized.includes('função ecológica');
        }

        generalVisualOptions.length = 0;
        generalVisualOptions.push(...generalVisualCatalogOptions.filter(option => !isEcologyFunctionType(option.tipo)));
        if (!generalVisualOptions.some(option => option.tipo === 'Espetativa média de vida')) {
            generalVisualOptions.unshift({ tipo: 'Espetativa média de vida', unidade: 'anos' });
        }
        generalVisualUnits.length = 0;
        generalVisualUnits.push(...generalVisualCatalogUnits);
        ['segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos', 'milénios'].forEach(unit => {
            if (!generalVisualUnits.includes(unit)) generalVisualUnits.push(unit);
        });
        if (!generalVisualOptions.some(option => option.tipo === 'Tempo de Amamentação')) {
            generalVisualOptions.splice(5, 0, { tipo: 'Tempo de Amamentação', unidade: 'meses' });
        }

        function fillGeneralVisualTypeSelect(select, selectedValue = '') {
            const options = generalVisualOptions.map(option => option.tipo).sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && options.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe um modelo</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
        }

        function isDropdownOnlyGeneralModel(type = '') {
            return isGeneralVisualCatalogDropdownOnly(type);
        }

        function isPopulationGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('popul');
        }

        function isNursingGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('amament');
        }

        function isLifeExpectancyGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('espetativa media de vida') || normalized.includes('expectativa media de vida') || (normalized.includes('vida') && normalized.includes('media'));
        }

        function getLifeExpectancyUnits() {
            return ['segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos', 'milénios'];
        }

        function getGeneralUnitOptions(type = '') {
            if (isLifeExpectancyGeneralModel(type)) return getLifeExpectancyUnits();
            if (isNursingGeneralModel(type)) return ['dias', 'meses', 'anos'];
            if (isPopulationGeneralModel(type)) return ['dezenas', 'centenas', 'milhares', 'milhões'];
            return [...generalVisualUnits];
        }

        function getGeneralDefaultUnit(type = '') {
            if (isLifeExpectancyGeneralModel(type)) return 'anos';
            if (isNursingGeneralModel(type)) return 'meses';
            if (isPopulationGeneralModel(type)) return 'milhares';
            return getGeneralVisualOption(type)?.unidade || 'anos';
        }

        function updateGeneralUnitSelect(unitSelect, type, selectedUnit = '', preserveUserChoice = false) {
            const options = getGeneralUnitOptions(type);
            unitSelect.innerHTML = options.map(option => `<option value="${option}">${option}</option>`).join('');
            const nextUnit = preserveUserChoice && selectedUnit && options.includes(selectedUnit)
                ? selectedUnit
                : (selectedUnit && options.includes(selectedUnit) ? selectedUnit : getGeneralDefaultUnit(type));
            unitSelect.value = nextUnit;
        }

        function getGeneralMinPlaceholder(type = '') {
            if (isPopulationGeneralModel(type)) return 'Ex: 1200';
            if (isNursingGeneralModel(type)) return 'Ex: 2';
            if (isLifeExpectancyGeneralModel(type)) return 'Ex: 8';
            return type && type.includes('Velocidade') ? 'Ex: 40' : 'Ex: 10';
        }

        function getGeneralMaxPlaceholder(type = '') {
            if (isPopulationGeneralModel(type)) return 'Ex: 3500';
            if (isNursingGeneralModel(type)) return 'Ex: 8';
            if (isLifeExpectancyGeneralModel(type)) return 'Ex: 15';
            return type && type.includes('Velocidade') ? 'Ex: 80' : 'Ex: 15';
        }

        function configureGeneralVisualRowControls(type, minInput, maxInput, unitSelect, strategySelect) {
            const isStrategy = isDropdownOnlyGeneralModel(type);
            
            if (isStrategy) {
                minInput.style.display = 'none';
                maxInput.style.display = 'none';
                unitSelect.style.display = 'none';
                if (strategySelect) {
                    strategySelect.style.display = '';
                    strategySelect.style.gridColumn = 'span 3';
                }
                maxInput.value = '';
                unitSelect.value = '';
            } else {
                minInput.style.display = '';
                maxInput.style.display = '';
                unitSelect.style.display = '';
                if (strategySelect) {
                    strategySelect.style.display = 'none';
                    strategySelect.style.gridColumn = '';
                }
                minInput.step = '0.01';
                minInput.min = '0';
            }
            minInput.placeholder = getGeneralMinPlaceholder(type);
            maxInput.placeholder = getGeneralMaxPlaceholder(type);
        }

        function createGeneralVisualRow(type = '', minValue = '', unit = '', maxValue = '', gender = GENDER_BOTH, fase = 'Adulto') {
            const row = document.createElement('div');
            row.className = 'general-visual-row';

            const typeSelect = document.createElement('select');
            typeSelect.className = 'general-visual-type';
            fillGeneralVisualTypeSelect(typeSelect, type);

            const minInput = document.createElement('input');
            minInput.className = 'general-visual-min';
            minInput.type = 'number';
            minInput.step = '0.01';
            minInput.min = '0';
            minInput.placeholder = getGeneralMinPlaceholder(type);
            minInput.value = minValue;

            const strategySelect = document.createElement('select');
            strategySelect.className = 'general-visual-strategy';
            strategySelect.style.display = 'none';
            function populateDropdownSelect(selectedType) {
                const config = getGeneralVisualSelectConfig(selectedType);
                const options = [...getGeneralVisualSelectOptions(selectedType)].sort((a, b) => a.localeCompare(b));
                strategySelect.innerHTML = `<option value="">${config?.placeholder || 'Escolhe uma opção'}</option>` +
                    options.map(option => `<option value="${option}">${option}</option>`).join('');
            }
            populateDropdownSelect(type);
            if (isDropdownOnlyGeneralModel(type)) {
                strategySelect.value = minValue;
            }

            const maxInput = document.createElement('input');
            maxInput.className = 'general-visual-max';
            maxInput.type = 'number';
            maxInput.step = '0.01';
            maxInput.min = '0';
            maxInput.placeholder = getGeneralMaxPlaceholder(type);
            maxInput.value = maxValue;
            maxInput.title = 'Opcional. Usa para intervalos, como 10-15 anos ou 40-80 km/h.';

            const unitSelect = document.createElement('select');
            unitSelect.className = 'general-visual-unit';
            updateGeneralUnitSelect(unitSelect, type, unit);
            configureGeneralVisualRowControls(type, minInput, maxInput, unitSelect, strategySelect);

            const genderBtn = document.createElement('button');
            genderBtn.type = 'button';
            genderBtn.className = 'gender-toggle-btn general-visual-gender-toggle';
            genderBtn.dataset.value = normalizeGenderValue(gender, GENDER_BOTH);
            function updateGenderBtnUI() {
                const ui = getGenderUi(genderBtn.dataset.value);
                genderBtn.dataset.value = ui.value;
                genderBtn.innerHTML = ui.html;
                genderBtn.title = ui.title;
            }
            updateGenderBtnUI();

            const faseBtn = document.createElement('button');
            faseBtn.type = 'button';
            faseBtn.className = 'fase-toggle-btn general-visual-fase-toggle';
            faseBtn.dataset.value = fase || 'Adulto';
            function updateFaseBtnUI() {
                if (faseBtn.dataset.value === 'Adulto') {
                    faseBtn.innerHTML = '<i class="fa-solid fa-paw" style="color: #10b981; font-size: 0.9rem;"></i>';
                    faseBtn.title = 'Adulto';
                } else {
                    faseBtn.innerHTML = '<i class="fa-solid fa-baby" style="color: #f59e0b; font-size: 0.9rem;"></i>';
                    faseBtn.title = 'Cria';
                }
            }
            updateFaseBtnUI();

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover modelo visual';

            typeSelect.addEventListener('change', () => {
                const previousUnit = unitSelect.value;
                updateGeneralUnitSelect(unitSelect, typeSelect.value, previousUnit, unitSelect.dataset.userChanged === 'true');
                populateDropdownSelect(typeSelect.value);
                configureGeneralVisualRowControls(typeSelect.value, minInput, maxInput, unitSelect, strategySelect);
                updateGeneralVisualPreview();
            });
            minInput.addEventListener('input', updateGeneralVisualPreview);
            strategySelect.addEventListener('change', updateGeneralVisualPreview);
            maxInput.addEventListener('input', updateGeneralVisualPreview);
            unitSelect.addEventListener('change', () => {
                unitSelect.dataset.userChanged = 'true';
                updateGeneralVisualPreview();
            });
            genderBtn.addEventListener('click', () => {
                genderBtn.dataset.value = getNextGenderValue(genderBtn.dataset.value);
                updateGenderBtnUI();
                updateGeneralVisualPreview();
            });
            faseBtn.addEventListener('click', () => {
                faseBtn.dataset.value = faseBtn.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                updateFaseBtnUI();
                updateGeneralVisualPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (generalVisualRowsContainer.children.length === 0) setGeneralVisualData();
                updateGeneralVisualPreview();
            });

            row.append(typeSelect, minInput, strategySelect, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
            generalVisualRowsContainer.appendChild(row);
            updateGeneralVisualPreview();
        }

        function getGeneralVisualData() {
            return [...generalVisualRowsContainer.querySelectorAll('.general-visual-row')]
                .map(row => {
                    const type = row.querySelector('.general-visual-type')?.value || '';
                    const isStrategy = isDropdownOnlyGeneralModel(type);
                    const min = isStrategy 
                        ? (row.querySelector('.general-visual-strategy')?.value || '')
                        : (row.querySelector('.general-visual-min')?.value || '');
                    const max = isStrategy ? '' : (row.querySelector('.general-visual-max')?.value || '');
                    return {
                        tipo: type,
                        valor: min,
                        valorMin: min,
                        valorMax: max,
                        unidade: isStrategy ? '' : (row.querySelector('.general-visual-unit')?.value || ''),
                        genero: normalizeGenderValue(row.querySelector('.general-visual-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.general-visual-fase-toggle')?.dataset.value || 'Adulto'
                    };
                })
                .filter(item => item.tipo && (item.valorMin || item.valorMax || item.valor));
        }

        function getDefaultGeneralVisualOptions() {
            const hiddenByDefault = new Set(['Velocidade média', 'Força da mordida', 'Estratégia para obter alimento', 'Tempo de Amamentação']);
            return generalVisualOptions.filter(option => !hiddenByDefault.has(option.tipo));
        }

        function isLegacyGeneralMatingItem(item = {}) {
            return normalizeSearchText(item?.tipo || '').includes('acasalamento') && !!(item?.valor || item?.valorMin || item?.valorMax);
        }

        function filterLegacyGeneralMatingItems(items = []) {
            return Array.isArray(items) ? items.filter(item => !isLegacyGeneralMatingItem(item)) : [];
        }

        function extractLegacyGeneralMatingItems(items = []) {
            return collapseCombinedGenderItems(
                Array.isArray(items) ? items.filter(item => isLegacyGeneralMatingItem(item)) : []
            )
                .map(item => ({
                    tipo: 'Acasalamento',
                    detalhe: item.valorMin || item.valor || item.valorMax || ''
                }))
                .filter(item => item.detalhe);
        }

        function mergeUniqueReproductionItems(items = []) {
            const seen = new Set();
            return items.filter(item => {
                const key = `${item?.tipo || ''}::${item?.detalhe || ''}`;
                if (!item?.tipo || seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        function setGeneralVisualData(items = []) {
            generalVisualRowsContainer.innerHTML = '';
            const normalizedItems = collapseCombinedGenderItems(filterLegacyGeneralMatingItems(items));
            if (!Array.isArray(normalizedItems) || normalizedItems.length === 0) {
                getDefaultGeneralVisualOptions().forEach(option => {
                    if (option.tipo !== 'Velocidade média' && option.tipo !== 'Força da mordida') {
                        createGeneralVisualRow(option.tipo, '', option.unidade, '', option.genero || GENDER_BOTH, option.fase || 'Adulto');
                    }
                });
                updateGeneralVisualPreview();
                return;
            }
            normalizedItems.forEach(item => createGeneralVisualRow(
                item.tipo || '',
                item.valorMin ?? item.valor ?? '',
                item.unidade || getGeneralVisualOption(item.tipo)?.unidade || '',
                item.valorMax ?? '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto'
            ));
            updateGeneralVisualPreview();
        }

        function formatGeneralVisualValue(item, fallback = '—') {
            if (!item) return fallback;
            const min = item.valorMin ?? item.valor ?? '';
            const max = item.valorMax ?? '';
            const unit = item.unidade || '';
            const value = min && max ? `${min}-${max}` : `${min || max}`;
            return `${value}${unit ? ` ${unit}` : ''}`.trim() || fallback;
        }

        function getGeneralVisualMeta(type = '') {
            if (isLifeExpectancyGeneralModel(type)) {
                return { key: 'expectativa-vida', title: type || 'Espetativa média de vida', accent: 'accent-life-expectancy' };
            }
            if (isNursingGeneralModel(type)) {
                return { key: 'amamentacao', title: type || 'Tempo de Amamentação', accent: 'accent-life' };
            }
            return getGeneralVisualCatalogMeta(type);
        }

        function getClimateZoneMeta(value = '') {
            const normalized = normalizeSearchText(value);
            const zones = {
                tropical: { image: '../assets/zonas-climaticas/01_Tropical.png', accent: 'accent-climate-tropical' },
                subtropical: { image: '../assets/zonas-climaticas/02_Subtropical.png', accent: 'accent-climate-subtropical' },
                temperada: { image: '../assets/zonas-climaticas/03_Temperada.png', accent: 'accent-climate-temperada' },
                polar: { image: '../assets/zonas-climaticas/04_Polar.png', accent: 'accent-climate-polar' },
                artica: { image: '../assets/zonas-climaticas/05_Artica.png', accent: 'accent-climate-artica' },
                antartica: { image: '../assets/zonas-climaticas/06_Antartica.png', accent: 'accent-climate-antartica' },
                desertica: { image: '../assets/zonas-climaticas/07_Desertica.png', accent: 'accent-climate-desertica' },
                semiarida: { image: '../assets/zonas-climaticas/08_Semiarida.png', accent: 'accent-climate-semiarida' },
                mediterranica: { image: '../assets/zonas-climaticas/09_Mediterranica.png', accent: 'accent-climate-mediterranica' },
                montanhosa_alpina: { image: '../assets/zonas-climaticas/10_Montanhosa_Alpina.png', accent: 'accent-climate-montanhosa' }
            };
            if (normalized.includes('montanhosa') || normalized.includes('alpina')) return zones.montanhosa_alpina;
            return zones[normalized.replace(/\s+/g, '_')] || zones[normalized] || null;
        }

        function getBiomaMeta(value = '') {
            const normalized = normalizeSearchText(value);
            const biomas = {
                areas_rochosas: { image: '../assets/bioma/15_Areas_Rochosas.png', accent: 'accent-bioma-areas-rochosas' },
                bosque: { image: '../assets/bioma/03_Bosque.png', accent: 'accent-bioma-bosque' },
                calota_de_gelo: { image: '../assets/bioma/07_Calota_de_Gelo.png', accent: 'accent-bioma-calota-gelo' },
                caverna: { image: '../assets/bioma/05_Caverna.png', accent: 'accent-bioma-caverna' },
                chaparral: { image: '../assets/bioma/10_Chaparral.png', accent: 'accent-bioma-chaparral' },
                costa: { image: '../assets/bioma/14_Costa.png', accent: 'accent-bioma-costa' },
                duna: { image: '../assets/bioma/06_Duna.png', accent: 'accent-bioma-duna' },
                estepe: { image: '../assets/bioma/09_Estepe.png', accent: 'accent-bioma-estepe' },
                fauna_urbana: { image: '../assets/bioma/12_Fauna_Urbana.png', accent: 'accent-bioma-fauna-urbana' },
                floresta: { image: '../assets/bioma/16_floresta.png', accent: 'accent-bioma-floresta' },
                marinho: { image: '../assets/bioma/01_Marinho.png', accent: 'accent-bioma-marinho' },
                marinho_corais: { image: '../assets/bioma/13_Marinho_corais.png', accent: 'accent-bioma-marinho-corais' },
                matagal: { image: '../assets/bioma/17_Matagal.png', accent: 'accent-bioma-matagal' },
                montanha: { image: '../assets/bioma/11_Montanha.png', accent: 'accent-bioma-montanha' },
                pantano: { image: '../assets/bioma/04_Pantano.png', accent: 'accent-bioma-pantano' },
                pradaria: { image: '../assets/bioma/08_Pradaria.png', accent: 'accent-bioma-pradaria' },
                savana: { image: '../assets/bioma/02_Savana.png', accent: 'accent-bioma-savana' }
            };
            const key = normalized.replace(/[^a-z0-9_]+/g, '_').replace(/\s+/g, '_').replace(/__+/g, '_').replace(/^_|_$/g, '');
            return biomas[key] || null;
        }

        function getGeneralModelSvg(key = 'geral') {
            if (key === 'expectativa-vida') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M25 10h30"/><path d="M25 70h30"/><path d="M29 10c0 12 7 18 11 22c4-4 11-10 11-22"/><path d="M29 70c0-12 7-18 11-22c4 4 11 10 11 22"/><path d="M32 34h16"/><path d="M40 48c-8-6-14-11-14-18c0-5 4-9 9-9c3 0 5 1 5 3c1-2 3-3 6-3c5 0 9 4 9 9c0 7-7 12-15 18Z"/></svg>`;
            }
            if (key === 'amamentacao') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M26 20c8 0 14 6 14 14v8c0 8-6 14-14 14s-14-6-14-14v-8c0-8 6-14 14-14Z"/><path d="M54 30c7 0 12 5 12 12s-5 12-12 12"/><path d="M40 38h12"/><path d="M52 34v16"/><path d="M24 58h30"/></svg>`;
            }
            return getGeneralCatalogModelSvg(key);
            const icons = {
                vida: `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M28 10h24"/><path d="M28 70h24"/><path d="M31 10c0 15 18 16 18 30S31 55 31 70"/><path d="M49 10c0 15-18 16-18 30s18 15 18 30"/><path d="M34 53h12"/><path d="M37 59h6"/></svg>`,
                'velocidade-maxima': `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 58a26 26 0 0 1 52 0"/><path d="M24 58h32"/><path d="M40 58l18-24"/><path d="M28 30l-5-6"/><path d="M52 30l5-6"/><path d="M40 24v-9"/><path d="M61 58h7"/></svg>`,
                'velocidade-media': `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M13 58a27 27 0 0 1 54 0"/><path d="M22 58h36"/><path d="M40 58l8-18"/><path d="M23 43h8"/><path d="M49 43h8"/><path d="M30 28l-4-7"/><path d="M50 28l4-7"/></svg>`,
                'forca-mordida': `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 30c0-6 10-10 20-10s20 4 20 10v6H20v-6z"/><path d="M20 50c0 6 10 10 20 10s20-4 20-10v-6H20v6z"/><path d="M28 30l2 6M36 30l1 6M44 30l-1 6M52 30l-2 6"/><path d="M28 50l2-6M36 50l1-6M44 50l-1-6M52 50l-2-6"/></svg>`,
                geral: `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M40 25v18"/><path d="M40 53v2"/></svg>`,
                acasalamento: `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="28" cy="30" r="8"/><circle cx="52" cy="30" r="8"/><path d="M28 38v10"/><path d="M52 38v10"/><path d="M22 54c4-5 8-8 14-8"/><path d="M58 54c-4-5-8-8-14-8"/><path d="M36 30h8"/><path d="M44 30h8"/></svg>`
            };
            return icons[key] || icons.geral;
        }

        function renderGeneralVisualCard(item, isSuggestion = false) {
            const type = item.tipo || item;
            const meta = getGeneralVisualMeta(type);
            const value = isSuggestion ? 'Por preencher' : formatGeneralVisualValue(item);
            const normalizedType = normalizeDimensionKey(type);
            const isStrategy = normalizedType.includes('estrategia');
            const isActivity = normalizedType.includes('atividade');
            const isSocial = normalizedType.includes('vida social');
            const isEcologicalFunction = normalizedType.includes('funcao ecologica');
            const isLocomotion = normalizedType.includes('locomocao');
            const isClimateZone = normalizedType.includes('zona');
            const isBioma = normalizedType.includes('bioma');
            const strategyMeta = isStrategy && !isSuggestion ? getFeedingStrategyMeta(item.valorMin || item.valor || '') : null;
            const activityMeta = isActivity && !isSuggestion ? getActivityMeta(item.valorMin || item.valor || '') : null;
            const socialMeta = isSocial && !isSuggestion ? getSocialMeta(item.valorMin || item.valor || '') : null;
            const ecologicalMeta = isEcologicalFunction && !isSuggestion ? getEcologicalFunctionMeta(item.valorMin || item.valor || '') : null;
            const locomotionMeta = isLocomotion && !isSuggestion ? getLocomotionMeta(item.valorMin || item.valor || '') : null;
            const climateMeta = isClimateZone && !isSuggestion ? getClimateZoneMeta(item.valorMin || item.valor || '') : null;
            const biomaMeta = isBioma && !isSuggestion ? getBiomaMeta(item.valorMin || item.valor || '') : null;
            const icon = climateMeta
                ? `<img class="climate-zone-model-image" src="${climateMeta.image}" alt="Zona climática ${item.valorMin || item.valor || ''}" loading="lazy">`
                : biomaMeta
                    ? `<img class="climate-zone-model-image" src="${biomaMeta.image}" alt="Bioma ${item.valorMin || item.valor || ''}" loading="lazy">`
                    : ecologicalMeta
                        ? getEcologicalFunctionSvg(ecologicalMeta.key)
                    : locomotionMeta
                        ? getLocomotionSvg(locomotionMeta.key)
                    : strategyMeta
                        ? getFeedingStrategySvg(strategyMeta.key)
                        : activityMeta
                            ? getActivitySvg(activityMeta.key)
                            : socialMeta
                                ? getSocialSvg(socialMeta.key)
                            : getGeneralModelSvg(meta.key);
            return `
                <article class="dimension-model-card general-model-card ${climateMeta?.accent || biomaMeta?.accent || ecologicalMeta?.accent || locomotionMeta?.accent || strategyMeta?.accent || activityMeta?.accent || socialMeta?.accent || meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="dimension-model-icon ${climateMeta || biomaMeta ? 'climate-zone-model-icon' : ''}">${icon}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${value}</div>
                    </div>
                </article>`;
        }

        function updateGeneralVisualPreview() {
            const selected = getGeneralVisualData();
            if (selected.length) {
                previewGeneralVisualModels.innerHTML = selected.map(item => renderGeneralVisualCard(item)).join('');
                return;
            }
            previewGeneralVisualModels.innerHTML = getDefaultGeneralVisualOptions().map(option => renderGeneralVisualCard(option, true)).join('');
        }

        addGeneralVisualBtn.addEventListener('click', () => createGeneralVisualRow());
        setGeneralVisualData();

        addDimensionBtn.addEventListener('click', () => createDimensionRow());
        document.getElementById('categoria').addEventListener('change', () => {
            const hasFilledDimensions = getDimensionData().length > 0;
            if (!hasFilledDimensions) {
                setDimensionData();
            } else {
                updateAllDimensionMetricSelects();
                updateDimensionPreview();
            }

            updateAllReproductionTypeSelects();
            updateReproductionPreview();
        });
        setDimensionData();


        function createModelGenderButton(initialValue = GENDER_BOTH, onChange = () => {}, extraClass = '') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `gender-toggle-btn ${extraClass}`.trim();
            button.dataset.value = normalizeGenderValue(initialValue, GENDER_BOTH);
            const sync = () => {
                const ui = getGenderUi(button.dataset.value);
                button.dataset.value = ui.value;
                button.innerHTML = ui.html;
                button.title = ui.title;
            };
            sync();
            button.addEventListener('click', () => {
                button.dataset.value = getNextGenderValue(button.dataset.value);
                sync();
                onChange();
            });
            return button;
        }

        function createModelFaseButton(initialValue = 'Adulto', onChange = () => {}, extraClass = '') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `fase-toggle-btn ${extraClass}`.trim();
            button.dataset.value = initialValue || 'Adulto';
            const sync = () => {
                if (button.dataset.value === 'Adulto') {
                    button.innerHTML = '<i class="fa-solid fa-paw" style="color: #10b981; font-size: 0.9rem;"></i>';
                    button.title = 'Adulto';
                } else {
                    button.innerHTML = '<i class="fa-solid fa-baby" style="color: #f59e0b; font-size: 0.9rem;"></i>';
                    button.title = 'Cria';
                }
            };
            sync();
            button.addEventListener('click', () => {
                button.dataset.value = button.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                sync();
                onChange();
            });
            return button;
        }

        // --- ALIMENTAÇÃO E MODELO VISUAL ---
        function normalizeSearchText(value = '') {
            return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function closeFeedingAnimalDropdown() {
            feedingAnimalDropdown.classList.remove('open');
            feedingAnimalTrigger.setAttribute('aria-expanded', 'false');
        }

        function renderFeedingAnimalOptions(query = '') {
            const normalizedQuery = normalizeSearchText(query);
            const filteredOptions = feedingAnimalOptions.filter(option => normalizeSearchText(option.label).includes(normalizedQuery));

            if (!filteredOptions.length) {
                feedingAnimalList.innerHTML = '<div class="feeding-animal-empty">Sem resultados</div>';
                return;
            }

            feedingAnimalList.innerHTML = filteredOptions.map(option => `
                <button type="button" class="feeding-animal-option" role="option" data-label="${option.label}">
                    <img class="feeding-animal-thumb" src="${option.src}" alt="${option.label}" loading="lazy">
                    <span class="feeding-animal-option-copy">
                        <strong>${option.label}</strong>
                        <small>${option.feedingType}</small>
                    </span>
                </button>
            `).join('');
        }

        function getFeedingAnimalOption(label = '') {
            return feedingAnimalOptions.find(option => option.label === label);
        }

        function selectFeedingAnimal(label) {
            const option = feedingAnimalOptions.find(item => item.label === label);
            if (!option) return;

            const emptyRow = [...feedingRowsContainer.querySelectorAll('.feeding-row')].find(row => !getFeedingRowData(row));

            if (emptyRow) {
                const modelSelect = emptyRow.querySelector('.feeding-model-kind');
                modelSelect.value = 'Tipo de Alimentação';
                renderFeedingDetailControls(emptyRow, 'Tipo de Alimentação', `${option.feedingType} | ${option.label}`);
                updateFeedingPreview();
            } else {
                createFeedingRow('Tipo de Alimentação', `${option.feedingType} | ${option.label}`);
            }

            feedingAnimalSearch.value = '';
            renderFeedingAnimalOptions();
            closeFeedingAnimalDropdown();
        }

        function initFeedingAnimalDropdown() {
            renderFeedingAnimalOptions();

            feedingAnimalTrigger.addEventListener('click', () => {
                const isOpen = feedingAnimalDropdown.classList.toggle('open');
                feedingAnimalTrigger.setAttribute('aria-expanded', String(isOpen));
                if (isOpen) feedingAnimalSearch.focus();
            });

            feedingAnimalSearch.addEventListener('input', event => renderFeedingAnimalOptions(event.target.value));
            feedingAnimalList.addEventListener('click', event => {
                const optionButton = event.target.closest('.feeding-animal-option');
                if (optionButton) selectFeedingAnimal(optionButton.dataset.label);
            });

            document.addEventListener('click', event => {
                if (!feedingAnimalDropdown.contains(event.target)) closeFeedingAnimalDropdown();
            });

            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') closeFeedingAnimalDropdown();
            });
        }

        const feedingModelOptions = [
            'Tipo de Alimentação',
            'Alimento Ingerido em Média',
            'Água bebida em Média'
        ];

        const feedingFoodUnits = ['g/dia', 'g/semana', 'g/mes', 'g/ano', 'kg/dia', 'kg/semana', 'kg/mes', 'kg/ano'];
        const feedingWaterUnits = ['l/dia', 'l/semana', 'l/mes', 'l/ano'];

        function fillFeedingTypeSelect(select, selectedValue = '') {
            const sortedTypes = [...feedingTypes].sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && sortedTypes.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe um tipo</option>` +
                sortedTypes.map(type => `<option value="${type}">${type}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — personalizado</option>` : '');
            select.value = selectedValue;
        }

        function fillFeedingModelSelect(select, selectedValue = '') {
            const value = feedingModelOptions.includes(selectedValue) ? selectedValue : 'Tipo de Alimentação';
            select.innerHTML = feedingModelOptions.map(option => `<option value="${option}">${option}</option>`).join('');
            select.value = value;
        }

        function createUnitSelect(className, units, selectedValue) {
            const select = document.createElement('select');
            select.className = className;
            select.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
            select.value = units.includes(selectedValue) ? selectedValue : units[0];
            select.addEventListener('change', updateFeedingPreview);
            return select;
        }

        function parseFeedingTypeDetail(detail = '') {
            const clean = String(detail || '').trim();
            if (clean.includes(' | ')) {
                const parts = clean.split(' | ');
                return { type: parts[0] || '', detail: parts.slice(1).join(' | ') || '' };
            }
            if (feedingTypes.includes(clean)) return { type: clean, detail: '' };
            return { type: '', detail: clean };
        }

        function renderFeedingDetailControls(row, tipo = 'Tipo de Alimentação', detail = '') {
            const oldControls = row.querySelector('.feeding-detail-controls');
            if (oldControls) oldControls.remove();

            const controls = document.createElement('div');
            controls.className = 'feeding-detail-controls';

            if (tipo === 'Alimento Ingerido em Média' || tipo === 'Água bebida em Média') {
                controls.classList.add('measure-controls');
                const fallbackUnit = tipo === 'Água bebida em Média' ? 'l/dia' : 'kg/dia';
                const units = tipo === 'Água bebida em Média' ? feedingWaterUnits : feedingFoodUnits;
                const parsed = parseNutritionRange(detail, fallbackUnit);

                const minInput = document.createElement('input');
                minInput.type = 'text';
                minInput.className = 'feeding-measure-min';
                minInput.placeholder = 'Mín.';
                minInput.inputMode = 'decimal';
                minInput.value = parsed.min;

                const maxInput = document.createElement('input');
                maxInput.type = 'text';
                maxInput.className = 'feeding-measure-max';
                maxInput.placeholder = 'Máx.';
                maxInput.inputMode = 'decimal';
                maxInput.value = parsed.max;

                const unitSelect = createUnitSelect('feeding-measure-unit', units, parsed.unit || fallbackUnit);

                [minInput, maxInput].forEach(input => input.addEventListener('input', updateFeedingPreview));
                controls.append(minInput, maxInput, unitSelect);
            } else {
                const parsed = parseFeedingTypeDetail(detail);

                const typeSelect = document.createElement('select');
                typeSelect.className = 'feeding-type-value';
                fillFeedingTypeSelect(typeSelect, parsed.type);

                const detailInput = document.createElement('input');
                detailInput.className = 'feeding-detail-value';
                detailInput.type = 'text';
                detailInput.placeholder = 'Ex: folhas jovens';
                detailInput.value = parsed.detail;

                typeSelect.addEventListener('change', updateFeedingPreview);
                detailInput.addEventListener('input', updateFeedingPreview);
                controls.append(typeSelect, detailInput);
            }

            const anchorBtn = row.querySelector('.feeding-gender-toggle') || row.querySelector('.remove-dimension-btn');
            row.insertBefore(controls, anchorBtn);
        }

        function createFeedingRow(type = 'Tipo de Alimentação', detail = '', gender = GENDER_BOTH, fase = 'Adulto') {
            const row = document.createElement('div');
            row.className = 'feeding-row';

            const modelSelect = document.createElement('select');
            modelSelect.className = 'feeding-model-kind';
            fillFeedingModelSelect(modelSelect, type);

            const genderBtn = createModelGenderButton(gender, updateFeedingPreview, 'feeding-gender-toggle');
            const faseBtn = createModelFaseButton(fase, updateFeedingPreview, 'feeding-fase-toggle');

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover modelo de alimentação';

            modelSelect.addEventListener('change', () => {
                renderFeedingDetailControls(row, modelSelect.value, '');
                updateFeedingPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (feedingRowsContainer.children.length === 0) createFeedingRow();
                updateFeedingPreview();
            });

            row.append(modelSelect, genderBtn, faseBtn, removeBtn);
            feedingRowsContainer.appendChild(row);
            renderFeedingDetailControls(row, modelSelect.value, detail);
            updateFeedingPreview();
        }

        function getFeedingRowData(row) {
            const tipo = row.querySelector('.feeding-model-kind')?.value || 'Tipo de Alimentação';
            const meta = {
                genero: normalizeGenderValue(row.querySelector('.feeding-gender-toggle')?.dataset.value, GENDER_BOTH),
                fase: row.querySelector('.feeding-fase-toggle')?.dataset.value || 'Adulto'
            };
            if (tipo === 'Alimento Ingerido em Média' || tipo === 'Água bebida em Média') {
                const detail = buildRangeDetail(
                    row.querySelector('.feeding-measure-min')?.value,
                    row.querySelector('.feeding-measure-max')?.value,
                    row.querySelector('.feeding-measure-unit')?.value || (tipo === 'Água bebida em Média' ? 'l/dia' : 'kg/dia')
                );
                return detail ? { tipo, detalhe: detail, ...meta } : null;
            }

            const feedingTypeVal = row.querySelector('.feeding-type-value')?.value || '';
            const detailVal = row.querySelector('.feeding-detail-value')?.value.trim() || '';
            if (!feedingTypeVal && !detailVal) return null;
            return {
                tipo: 'Tipo de Alimentação',
                detalhe: feedingTypeVal && detailVal ? `${feedingTypeVal} | ${detailVal}` : (feedingTypeVal || detailVal),
                ...meta
            };
        }

        function getFeedingData() {
            return [...feedingRowsContainer.querySelectorAll('.feeding-row')]
                .map(getFeedingRowData)
                .filter(Boolean);
        }

        function setFeedingData(items = []) {
            feedingRowsContainer.innerHTML = '';
            if (!Array.isArray(items) || items.length === 0) {
                createFeedingRow();
                updateFeedingPreview();
                return;
            }
            items.forEach(item => createFeedingRow(
                item.tipo || 'Tipo de Alimentação',
                item.detalhe || item.descricao || '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto'
            ));
            if (feedingRowsContainer.children.length === 0) createFeedingRow();
            updateFeedingPreview();
        }
        function renderFeedingModelCard(item, isSuggestion = false) {
            const type = item.tipo || item;
            const rawDetail = item.detalhe || '';
            const nutritionMetaByType = {
                'Tipo de Alimentação': { key: 'alimentacaoTipo', title: 'Tipo de Alimentação', accent: 'accent-food', fallback: 'Seleciona o tipo e escreve o detalhe livre' },
                'Alimento Ingerido em Média': { key: 'alimentoMedio', title: 'Alimento Ingerido em Média', accent: 'accent-meal', fallback: 'Indica mínimo, máximo e unidade' },
                'Água bebida em Média': { key: 'aguaMedia', title: 'Água bebida em Média', accent: 'accent-water', fallback: 'Indica mínimo, máximo e unidade' }
            };
            if (nutritionMetaByType[type]) {
                const meta = nutritionMetaByType[type];
                let detail = rawDetail || meta.fallback;
                if (type === 'Tipo de Alimentação' && detail.includes(' | ')) {
                    const [feedingType, freeText] = detail.split(' | ');
                    detail = freeText ? `${feedingType} — ${freeText}` : feedingType;
                }
                return `
                    <article class="dimension-model-card feeding-model-card reproduction-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                        <div class="dimension-model-icon">${getReproductionModelSvg(meta.key)}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">${meta.title}</div>
                            <div class="dimension-model-value">${detail}</div>
                            <div class="dimension-model-meta">${isSuggestion ? 'Disponível' : 'Modelo visual próprio'}</div>
                        </div>
                    </article>`;
            }

            const meta = getFeedingVisualMeta(type);
            const detail = rawDetail || feedingTypeDescriptions[type] || 'Tipo de dieta';
            const animalOption = getFeedingAnimalOption(rawDetail || '');
            const visual = animalOption?.src
                ? `<img class="feeding-model-animal-image" src="${animalOption.src}" alt="${animalOption.label}">`
                : getFeedingModelSvg(meta.key);
            return `
                <article class="dimension-model-card feeding-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="dimension-model-icon">${visual}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${detail}</div>
                        <div class="dimension-model-meta">${isSuggestion ? 'Disponível' : 'Modelo visual'}</div>
                    </div>
                </article>`;
        }
        function updateFeedingPreview() {
            const selected = getFeedingData();
            const hero = selected[0]?.tipo || 'Alimentação';
            const heroMeta = getFeedingVisualMeta(hero);
            feedingHeroIcon.innerHTML = getFeedingModelSvg(heroMeta.key);
            feedingHeroTitle.textContent = selected[0]?.tipo || 'Tipos de alimentação';

            if (selected.length) {
                previewFeedingModels.innerHTML = selected.map(item => renderFeedingModelCard(item)).join('');
                return;
            }

            previewFeedingModels.innerHTML = feedingTypes.map(type => renderFeedingModelCard(type, true)).join('');
        }

        addFeedingBtn.addEventListener('click', () => createFeedingRow());
        initFeedingAnimalDropdown();

        setFeedingData();

        // --- ECOLOGIA E MODELO VISUAL ---
        const ecologyModelOptions = [
            'Função Ecológica',
            'Predadores naturais',
            'Presas',
            'Competidores',
            'Ameaças naturais',
            'Relações Simbióticas'
        ];

        const ecologyRelationKeys = {
            'Predadores naturais': 'predadoresNaturais',
            'Presas': 'presas',
            'Competidores': 'competidores',
            'Ameaças naturais': 'ameacasNaturais',
            'Relações Simbióticas': 'relacoesSimbioticas'
        };

        function normalizeEcologyType(type = '') {
            const normalized = normalizeSearchText(type);
            if (normalized.includes('funcao ecologica')) return 'Função Ecológica';
            if (normalized.includes('predador')) return 'Predadores naturais';
            if (normalized.includes('presa')) return 'Presas';
            if (normalized.includes('competidor')) return 'Competidores';
            if (normalized.includes('ameaca') || normalized.includes('ameaça')) return 'Ameaças naturais';
            if (normalized.includes('simbiot')) return 'Relações Simbióticas';
            return type || '';
        }

        function fillEcologyTypeSelect(select, selectedValue = '') {
            const selected = normalizeEcologyType(selectedValue);
            const hasSelected = selected && ecologyModelOptions.includes(selected);
            select.innerHTML = '<option value="">Escolhe um modelo</option>' +
                ecologyModelOptions.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selected && !hasSelected ? `<option value="${selected}">${selected}</option>` : '');
            select.value = selected;
        }

        function getEcologicalFunctionOptions() {
            return [...getGeneralVisualSelectOptions('Função ecológica')].sort((a, b) => a.localeCompare(b));
        }

        function findAnimalByRef(ref) {
            const id = typeof ref === 'string' ? ref : (ref?.id || ref?.animalId || '');
            return allAnimals.find(animal => animal.id === id) || null;
        }

        function getAnimalDisplayName(ref) {
            const animal = findAnimalByRef(ref);
            if (animal) return `${animal.nome || animal.id}${animal.nomeCientifico ? ` (${animal.nomeCientifico})` : ''}`;
            if (typeof ref === 'string') return ref;
            return `${ref?.nome || ref?.label || ref?.id || 'Animal'}${ref?.nomeCientifico ? ` (${ref.nomeCientifico})` : ''}`;
        }

        function animalToEcologyRef(animalOrRef) {
            const animal = typeof animalOrRef === 'string' ? findAnimalByRef(animalOrRef) : (findAnimalByRef(animalOrRef) || animalOrRef);
            if (!animal) return null;
            return {
                id: animal.id || animal.animalId || '',
                nome: animal.nome || animal.label || animal.id || '',
                nomeCientifico: animal.nomeCientifico || ''
            };
        }

        function normalizeEcologyRefs(items = []) {
            if (!Array.isArray(items)) return [];
            return items.map(animalToEcologyRef).filter(ref => ref && ref.id);
        }

        function getEcologySelectedRefs(hiddenInput) {
            try {
                return normalizeEcologyRefs(JSON.parse(hiddenInput.value || '[]'));
            } catch (_) {
                return [];
            }
        }

        function setEcologySelectedRefs(hiddenInput, refs) {
            hiddenInput.value = JSON.stringify(normalizeEcologyRefs(refs));
        }

        function renderEcologyTags(tagsContainer, hiddenInput, onChange = updateEcologyPreview) {
            const refs = getEcologySelectedRefs(hiddenInput);
            tagsContainer.innerHTML = refs.map(ref => `
                <span class="ecology-tag" data-id="${ref.id}">
                    <span>${getAnimalDisplayName(ref)}</span>
                    <button type="button" aria-label="Remover ${ref.nome || ref.id}">&times;</button>
                </span>
            `).join('');
            tagsContainer.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    const tag = button.closest('.ecology-tag');
                    const nextRefs = getEcologySelectedRefs(hiddenInput).filter(ref => ref.id !== tag.dataset.id);
                    setEcologySelectedRefs(hiddenInput, nextRefs);
                    renderEcologyTags(tagsContainer, hiddenInput, onChange);
                    onChange();
                });
            });
        }

        function renderEcologySearchResults(input, resultsContainer, hiddenInput, tagsContainer) {
            const query = normalizeSearchText(input.value.trim());
            if (!query) {
                resultsContainer.classList.remove('open');
                resultsContainer.innerHTML = '';
                return;
            }
            const selectedIds = new Set(getEcologySelectedRefs(hiddenInput).map(ref => ref.id));
            const matches = allAnimals
                .filter(animal => !selectedIds.has(animal.id))
                .filter(animal => normalizeSearchText(`${animal.nome || ''} ${animal.nomeCientifico || ''}`).includes(query))
                .slice(0, 8);

            if (!matches.length) {
                resultsContainer.innerHTML = '<div class="ecology-search-result" style="cursor: default; opacity: 0.75;">Sem resultados</div>';
                resultsContainer.classList.add('open');
                return;
            }

            resultsContainer.innerHTML = matches.map(animal => `
                <button type="button" class="ecology-search-result" data-id="${animal.id}">
                    <strong>${animal.nome || animal.id}</strong>
                    <small>${animal.nomeCientifico || ''}</small>
                </button>
            `).join('');
            resultsContainer.classList.add('open');
            resultsContainer.querySelectorAll('button.ecology-search-result').forEach(button => {
                button.addEventListener('click', () => {
                    const animal = allAnimals.find(item => item.id === button.dataset.id);
                    if (!animal) return;
                    const refs = getEcologySelectedRefs(hiddenInput);
                    refs.push(animalToEcologyRef(animal));
                    setEcologySelectedRefs(hiddenInput, refs);
                    renderEcologyTags(tagsContainer, hiddenInput);
                    input.value = '';
                    resultsContainer.classList.remove('open');
                    resultsContainer.innerHTML = '';
                    updateEcologyPreview();
                });
            });
        }

        function createEcologyAnimalSelector(initialRefs = [], extraText = '') {
            const controls = document.createElement('div');
            controls.className = 'ecology-detail-controls';

            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.className = 'ecology-selected-animals';
            setEcologySelectedRefs(hiddenInput, initialRefs);

            const searchWrap = document.createElement('div');
            searchWrap.className = 'ecology-animal-search-wrap';
            const searchInput = document.createElement('input');
            searchInput.type = 'search';
            searchInput.className = 'ecology-animal-search';
            searchInput.placeholder = 'Pesquisar animal por nome comum ou científico...';
            searchInput.autocomplete = 'off';
            const results = document.createElement('div');
            results.className = 'ecology-search-results';
            searchWrap.append(searchInput, results);

            const tags = document.createElement('div');
            tags.className = 'ecology-selected-tags';
            renderEcologyTags(tags, hiddenInput);

            searchInput.addEventListener('input', () => renderEcologySearchResults(searchInput, results, hiddenInput, tags));
            searchInput.addEventListener('focus', () => renderEcologySearchResults(searchInput, results, hiddenInput, tags));
            document.addEventListener('click', event => {
                if (!controls.contains(event.target)) results.classList.remove('open');
            });

            controls.append(hiddenInput, searchWrap, tags);
            if (extraText !== null) {
                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.className = 'ecology-free-text';
                textInput.placeholder = 'Texto livre — ex: seca, incêndios, parasitas, doenças...';
                textInput.value = extraText || '';
                textInput.addEventListener('input', updateEcologyPreview);
                controls.append(textInput);
            }
            return controls;
        }

        function createEcologyFunctionSelector(value = '') {
            const controls = document.createElement('div');
            controls.className = 'ecology-detail-controls';
            const select = document.createElement('select');
            select.className = 'ecology-function-value';
            const options = getEcologicalFunctionOptions();
            const hasSelected = value && options.includes(value);
            select.innerHTML = '<option value="">Escolhe a função ecológica</option>' +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (value && !hasSelected ? `<option value="${value}">${value}</option>` : '');
            select.value = value || '';
            select.addEventListener('change', updateEcologyPreview);
            controls.append(select);
            return controls;
        }

        function createEcologyRow(type = '', data = {}) {
            const row = document.createElement('div');
            row.className = 'ecology-row';

            const typeSelect = document.createElement('select');
            typeSelect.className = 'ecology-type';
            fillEcologyTypeSelect(typeSelect, type || data.tipo || '');

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover relação ecológica';

            function renderControls() {
                const oldControls = row.querySelector('.ecology-detail-controls');
                if (oldControls) oldControls.remove();
                const currentType = normalizeEcologyType(typeSelect.value);
                const controls = currentType === 'Função Ecológica'
                    ? createEcologyFunctionSelector(data.valor || data.detalhe || '')
                    : createEcologyAnimalSelector(data.animais || data.animalIds || [], currentType === 'Ameaças naturais' ? (data.texto || data.detalhe || '') : null);
                row.insertBefore(controls, removeBtn);
            }

            typeSelect.addEventListener('change', () => {
                data = {};
                renderControls();
                updateEcologyPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                updateEcologyPreview();
            });

            row.append(typeSelect, removeBtn);
            ecologyRowsContainer.appendChild(row);
            renderControls();
            updateEcologyPreview();
        }

        function getEcologyData() {
            return [...ecologyRowsContainer.querySelectorAll('.ecology-row')]
                .map(row => {
                    const tipo = normalizeEcologyType(row.querySelector('.ecology-type')?.value || '');
                    if (!tipo) return null;
                    if (tipo === 'Função Ecológica') {
                        const valor = row.querySelector('.ecology-function-value')?.value || '';
                        return valor ? { tipo, valor } : null;
                    }
                    const hidden = row.querySelector('.ecology-selected-animals');
                    const animais = hidden ? getEcologySelectedRefs(hidden) : [];
                    const texto = row.querySelector('.ecology-free-text')?.value.trim() || '';
                    if (!animais.length && !texto) return null;
                    return { tipo, animais, animalIds: animais.map(animal => animal.id), texto };
                })
                .filter(Boolean);
        }

        function getDefaultEcologyRows() {
            return ecologyModelOptions.map(tipo => ({ tipo, valor: '', animais: [], texto: '' }));
        }

        function extractLegacyEcologyItems(generalItems = []) {
            return (Array.isArray(generalItems) ? generalItems : [])
                .filter(item => isEcologyFunctionType(item?.tipo || ''))
                .map(item => ({ tipo: 'Função Ecológica', valor: item.valorMin || item.valor || item.valorMax || '' }))
                .filter(item => item.valor);
        }

        function filterLegacyEcologyItems(generalItems = []) {
            return Array.isArray(generalItems) ? generalItems.filter(item => !isEcologyFunctionType(item?.tipo || '')) : [];
        }

        function normalizeEcologyData(ecologia = {}, legacyItems = []) {
            let items = [];
            if (Array.isArray(ecologia?.detalhes)) {
                items = ecologia.detalhes.map(item => ({
                    tipo: normalizeEcologyType(item.tipo || ''),
                    valor: item.valor || item.detalhe || '',
                    animais: normalizeEcologyRefs(item.animais || item.animalIds || []),
                    animalIds: item.animalIds || [],
                    texto: item.texto || ''
                }));
            } else {
                if (ecologia?.funcaoEcologica) items.push({ tipo: 'Função Ecológica', valor: ecologia.funcaoEcologica });
                Object.entries(ecologyRelationKeys).forEach(([tipo, key]) => {
                    if (Array.isArray(ecologia?.[key]) && ecologia[key].length) {
                        items.push({ tipo, animais: normalizeEcologyRefs(ecologia[key]), texto: tipo === 'Ameaças naturais' ? (ecologia.ameacasNaturaisTexto || '') : '' });
                    }
                });
            }
            legacyItems.forEach(item => {
                if (!items.some(existing => existing.tipo === 'Função Ecológica' && existing.valor)) items.unshift(item);
            });
            return items;
        }

        function setEcologyData(items, options = {}) {
            ecologyRowsContainer.innerHTML = '';
            const useDefaultRows = Object.prototype.hasOwnProperty.call(options, 'useDefaultRows')
                ? Boolean(options.useDefaultRows)
                : arguments.length === 0;
            const normalizedItems = Array.isArray(items) && items.length
                ? items
                : (useDefaultRows ? getDefaultEcologyRows() : []);
            normalizedItems.forEach(item => createEcologyRow(item.tipo || '', item));
            updateEcologyPreview();
        }

        function getPreferredEcologyValue(items, type) {
            const selected = items.find(item => item.tipo === type);
            return selected?.valor || '';
        }

        function getEcologyRelation(items, type) {
            return items.find(item => item.tipo === type)?.animais || [];
        }

        function buildEcologyInfoObject(items = getEcologyData()) {
            const result = {
                resumo: document.getElementById('infoEcologia')?.value || '',
                detalhes: items,
                funcaoEcologica: getPreferredEcologyValue(items, 'Função Ecológica'),
                predadoresNaturais: getEcologyRelation(items, 'Predadores naturais'),
                presas: getEcologyRelation(items, 'Presas'),
                competidores: getEcologyRelation(items, 'Competidores'),
                ameacasNaturais: getEcologyRelation(items, 'Ameaças naturais'),
                ameacasNaturaisTexto: items.find(item => item.tipo === 'Ameaças naturais')?.texto || '',
                relacoesSimbioticas: getEcologyRelation(items, 'Relações Simbióticas')
            };
            return result;
        }

        function getEcologyVisualMeta(type = '') {
            const normalized = normalizeSearchText(type);
            if (normalized.includes('funcao')) return { key: 'funcao', title: 'Função Ecológica', accent: 'accent-ecology-function' };
            if (normalized.includes('predador')) return { key: 'predadores', title: 'Predadores naturais', accent: 'accent-predator' };
            if (normalized.includes('presa')) return { key: 'presas', title: 'Presas', accent: 'accent-prey' };
            if (normalized.includes('competidor')) return { key: 'competidores', title: 'Competidores', accent: 'accent-competitor' };
            if (normalized.includes('ameaca') || normalized.includes('ameaça')) return { key: 'ameacas', title: 'Ameaças naturais', accent: 'accent-threat' };
            if (normalized.includes('simbiot')) return { key: 'simbioticas', title: 'Relações Simbióticas', accent: 'accent-symbiosis' };
            return { key: 'ecologia', title: type || 'Ecologia', accent: 'accent-ecology-function' };
        }

        function getEcologyModelSvg(key = 'ecologia') {
            const icons = {
                funcao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 68V38"/><path d="M40 38c-13 0-22-8-24-22c13 0 22 8 24 22Z"/><path d="M40 38c13 0 22-8 24-22c-13 0-22 8-24 22Z"/><path d="M22 68h36"/></svg>`,
                predadores: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 45c10-18 28-26 50-20"/><path d="M63 25l-8-9"/><path d="M63 25l-3 12"/><circle cx="48" cy="31" r="4"/><path d="M24 53c10 10 25 12 40 3"/><path d="M31 54l-5 10"/><path d="M52 57l5 10"/></svg>`,
                presas: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 50c7-15 20-23 38-21c7 5 9 13 5 23c-9 8-22 10-38 5"/><circle cx="55" cy="38" r="3"/><path d="M27 57l-7 10"/><path d="M47 59l5 9"/><path d="M18 44l-8-4"/></svg>`,
                competidores: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="28" cy="35" r="13"/><circle cx="52" cy="35" r="13"/><path d="M28 48v18"/><path d="M52 48v18"/><path d="M20 58h16"/><path d="M44 58h16"/><path d="M36 35h8"/></svg>`,
                ameacas: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10l30 56H10L40 10Z"/><path d="M40 28v18"/><path d="M40 56v2"/></svg>`,
                simbioticas: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="30" cy="40" r="17"/><circle cx="50" cy="40" r="17"/><path d="M40 28c6 6 6 18 0 24"/><path d="M30 23c5-8 15-8 20 0"/><path d="M30 57c5 8 15 8 20 0"/></svg>`,
                ecologia: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M40 16v48"/><path d="M16 40h48"/><path d="M25 25c10 10 20 10 30 0"/><path d="M25 55c10-10 20-10 30 0"/></svg>`
            };
            return icons[key] || icons.ecologia;
        }

        function formatEcologyAnimals(item = {}) {
            const names = normalizeEcologyRefs(item.animais || item.animalIds || []).map(ref => ref.nome || getAnimalDisplayName(ref));
            const animalText = names.length ? names.join(', ') : 'Seleciona animais da base de dados';
            if (item.tipo === 'Ameaças naturais' && item.texto) {
                return names.length ? `${animalText} — ${item.texto}` : item.texto;
            }
            return animalText;
        }

        function renderEcologyModelCard(item, isSuggestion = false) {
            const type = item.tipo || item;
            if (type === 'Função Ecológica') {
                const value = item.valor || 'Escolhe uma função ecológica';
                const ecologicalMeta = item.valor && !isSuggestion ? getEcologicalFunctionMeta(item.valor) : null;
                return `
                    <article class="dimension-model-card ecology-model-card ${ecologicalMeta?.accent || 'accent-ecology-function'}${isSuggestion ? ' is-suggestion' : ''}">
                        <div class="dimension-model-icon">${ecologicalMeta ? getEcologicalFunctionSvg(ecologicalMeta.key) : getEcologyModelSvg('funcao')}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">Função Ecológica</div>
                            <div class="dimension-model-value">${value}</div>
                            <div class="dimension-model-meta">Modelo ecológico</div>
                        </div>
                    </article>`;
            }
            const meta = getEcologyVisualMeta(type);
            return `
                <article class="dimension-model-card ecology-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="dimension-model-icon">${getEcologyModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${isSuggestion ? 'Pesquisa e adiciona espécies' : formatEcologyAnimals(item)}</div>
                        <div class="dimension-model-meta">${isSuggestion ? 'Disponível' : 'Modelo visual próprio'}</div>
                    </div>
                </article>`;
        }

        function updateEcologyPreview() {
            const selected = getEcologyData();
            const firstType = selected[0]?.tipo || 'Ecologia';
            const meta = getEcologyVisualMeta(firstType);
            if (ecologyHeroIcon) ecologyHeroIcon.innerHTML = getEcologyModelSvg(meta.key);
            if (ecologyHeroTitle) ecologyHeroTitle.textContent = firstType === 'Ecologia' ? 'Relações ecológicas' : firstType;
            if (!previewEcologyModels) return;
            previewEcologyModels.innerHTML = selected.length
                ? selected.map(item => renderEcologyModelCard(item)).join('')
                : ecologyModelOptions.map(type => renderEcologyModelCard(type, true)).join('');
        }

        addEcologyBtn?.addEventListener('click', () => createEcologyRow());
        setEcologyData();

        // --- REPRODUÇÃO E MODELO VISUAL ---
        function isBirdCategory(category = getSelectedCategory()) {
            return category === 'Aves';
        }

        function getReproductionOptionsForCategory(category = getSelectedCategory()) {
            if (isBirdCategory(category)) return birdEggVisuals.map(egg => egg.label);
            const options = reproductionTypesByCategory[category] || [];
            return [...new Set(options)];
        }

        function fillReproductionTypeSelect(select, selectedValue = '') {
            const options = [...getReproductionOptionsForCategory()].sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && options.includes(selectedValue);
            const placeholder = isBirdCategory() ? 'Escolhe a cor/padrão do ovo' : 'Escolhe um tipo';
            select.innerHTML = `<option value="">${placeholder}</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — fora desta categoria</option>` : '');
            select.value = selectedValue;
        }

        function fillMatingTypeSelect(select, selectedValue = '') {
            const options = [...matingSystems].sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && options.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe um tipo de acasalamento</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
        }

        function isMatingReproductionItem(type = '') {
            const normalizedType = normalizeSearchText(type);
            return normalizedType.includes('acasalamento') || matingSystems.some(option => normalizeSearchText(option) === normalizedType);
        }

        function applyReproductionEditorLabels() {
            addReproductionBtn.textContent = '+ Adicionar campo';
            if (isBirdCategory()) {
                reproductionHint.textContent = 'Seleciona "Tipo de reprodução" para escolher a cor do ovo, ou adiciona também acasalamento, incubação, maturidade sexual, tipo de alimentação, alimento ingerido e água bebida em média.';
                return;
            }
            reproductionHint.textContent = 'Escolhe as opções de reprodução, acasalamento, gestação, maturidade sexual, crias, tipo de alimentação, alimento ingerido ou água bebida em média.';
        }

        function updateReproductionEditorLabels() {
            applyReproductionEditorLabels();
        }

        function updateAllReproductionTypeSelects() {
            applyReproductionEditorLabels();
            reproductionRowsContainer.querySelectorAll('.reproduction-row').forEach(row => {
                const rowModeSelect = row.querySelector('.reproduction-row-mode');
                const typeSelect = row.querySelector('.reproduction-type');
                if (rowModeSelect && rowModeSelect.value === 'tipo' && typeSelect) {
                    fillReproductionTypeSelect(typeSelect, typeSelect.value);
                }
                const matingSelect = row.querySelector('.reproduction-mating-type');
                if (rowModeSelect && rowModeSelect.value === 'acasalamento' && matingSelect) {
                    fillMatingTypeSelect(matingSelect, matingSelect.value);
                }
            });
        }

        function createReproductionRow(type = '', detail = '', gender = GENDER_BOTH, fase = 'Adulto') {
            const typeStr = String(type || '');
            const detailStr = String(detail || '');
            const row = document.createElement('div');
            row.className = 'reproduction-row';

            const rowModeSelect = document.createElement('select');
            rowModeSelect.className = 'reproduction-row-mode';
            
            const optTipo = document.createElement('option');
            optTipo.value = 'tipo';
            const optAcasalamento = document.createElement('option');
            optAcasalamento.value = 'acasalamento';
            optAcasalamento.textContent = 'Acasalamento';
            optTipo.textContent = 'Tipo de reprodução';
            
            const optGestacao = document.createElement('option');
            optGestacao.value = 'gestacao';
            optGestacao.textContent = 'Tempo de Gestação';

            const optCrias = document.createElement('option');
            optCrias.value = 'crias';
            optCrias.textContent = 'Número de Crias';

            const optMaturidade = document.createElement('option');
            optMaturidade.value = 'maturidade_sexual';
            optMaturidade.textContent = 'Maturidade Sexual';

            const optAlimentacaoTipo = document.createElement('option');
            optAlimentacaoTipo.value = 'alimentacao_tipo';
            optAlimentacaoTipo.textContent = 'Tipo de Alimentação';

            const optAlimentoMedio = document.createElement('option');
            optAlimentoMedio.value = 'alimento_medio';
            optAlimentoMedio.textContent = 'Alimento Ingerido em Média';

            const optAguaMedia = document.createElement('option');
            optAguaMedia.value = 'agua_media';
            optAguaMedia.textContent = 'Água bebida em Média';
            
            rowModeSelect.append(optTipo, optAcasalamento, optGestacao, optMaturidade, optCrias);

            const typeSelect = document.createElement('select');
            typeSelect.className = 'reproduction-type';

            const matingSelect = document.createElement('select');
            matingSelect.className = 'reproduction-mating-type';

            const feedingTypeSelect = document.createElement('select');
            feedingTypeSelect.className = 'reproduction-feeding-type';
            fillFeedingTypeSelect(feedingTypeSelect, '');

            const feedingDetailInput = document.createElement('input');
            feedingDetailInput.className = 'reproduction-feeding-detail';
            feedingDetailInput.type = 'text';
            feedingDetailInput.placeholder = 'Ex: folhas jovens, pequenos insetos...';

            const minInput = document.createElement('input');
            minInput.className = 'reproduction-gestation-min';
            minInput.type = 'text';
            minInput.placeholder = 'Ex: 10';

            const maxInput = document.createElement('input');
            maxInput.className = 'reproduction-gestation-max';
            maxInput.type = 'text';
            maxInput.placeholder = 'Ex: 15';

            const unitSelect = document.createElement('select');
            unitSelect.className = 'reproduction-gestation-unit';
            
            const optDias = document.createElement('option');
            optDias.value = 'dias';
            optDias.textContent = 'dias';
            
            const optSemanas = document.createElement('option');
            optSemanas.value = 'semanas';
            optSemanas.textContent = 'semanas';
            
            const optMeses = document.createElement('option');
            optMeses.value = 'meses';
            optMeses.textContent = 'meses';

            unitSelect.append(optDias, optSemanas, optMeses);
            unitSelect.value = 'meses';

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover campo';

            const genderBtn = createModelGenderButton(gender, updateReproductionPreview, 'reproduction-gender-toggle');
            const faseBtn = createModelFaseButton(fase, updateReproductionPreview, 'reproduction-fase-toggle');

            const initialMatingValue = normalizeSearchText(typeStr).includes('acasalamento') ? detailStr : typeStr;
            const isMating = isMatingReproductionItem(typeStr);

            const isGestation = typeStr === 'Tempo de Gestação' || typeStr.toLowerCase().includes('gestação') || typeStr.toLowerCase().includes('gestacao');
            const isCrias = typeStr === 'Número de Crias' || typeStr.toLowerCase().includes('cria');
            const isMaturidade = typeStr === 'Maturidade Sexual' || normalizeSearchText(typeStr).includes('maturidade sexual');
            const isAlimentacaoTipo = typeStr === 'Tipo de Alimentação';
            const isAlimentoMedio = typeStr === 'Alimento Ingerido em Média';
            const isAguaMedia = typeStr === 'Água bebida em Média';

            if (isGestation) {
                rowModeSelect.value = 'gestacao';
                if (detailStr) {
                    let minVal = '';
                    let maxVal = '';
                    let unitVal = 'meses';
                    const match = detailStr.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*(dias|dia|meses|mês|mes|semanas|semana)/i);
                    if (match) {
                        minVal = match[1] || '';
                        maxVal = match[2] || '';
                        const matchedUnit = match[3].toLowerCase();
                        if (matchedUnit.includes('mes')) {
                            unitVal = 'meses';
                        } else if (matchedUnit.includes('semana')) {
                            unitVal = 'semanas';
                        } else {
                            unitVal = 'dias';
                        }
                    } else {
                        const numbers = detailStr.match(/\d+(?:\.\d+)?/g);
                        if (numbers) {
                            minVal = numbers[0] || '';
                            maxVal = numbers[1] || '';
                        }
                        if (detailStr.toLowerCase().includes('mes')) unitVal = 'meses';
                        if (detailStr.toLowerCase().includes('semana')) unitVal = 'semanas';
                    }
                    minInput.value = minVal;
                    maxInput.value = maxVal;
                    unitSelect.value = unitVal;
                }
            } else if (isCrias) {
                rowModeSelect.value = 'crias';
                if (detailStr) {
                    let minVal = '';
                    let maxVal = '';
                    const match = detailStr.match(/(\d+)(?:\s*-\s*(\d+))?/);
                    if (match) {
                        minVal = match[1] || '';
                        maxVal = match[2] || '';
                    } else {
                        const numbers = detailStr.match(/\d+/g);
                        if (numbers) {
                            minVal = numbers[0] || '';
                            maxVal = numbers[1] || '';
                        }
                    }
                    minInput.value = minVal;
                    maxInput.value = maxVal;
                }
            } else if (isMaturidade) {
                rowModeSelect.value = 'maturidade_sexual';
                let minVal = '';
                let maxVal = '';
                let unitVal = 'anos';
                if (detailStr) {
                    const match = detailStr.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(dias|dia|semanas|semana|meses|mês|mes|anos|ano)/i);
                    if (match) {
                        minVal = match[1] || '';
                        maxVal = match[2] || '';
                        const matchedUnit = match[3].toLowerCase();
                        if (matchedUnit.includes('ano')) unitVal = 'anos';
                        else if (matchedUnit.includes('mes') || matchedUnit.includes('mês')) unitVal = 'meses';
                        else if (matchedUnit.includes('semana')) unitVal = 'semanas';
                        else unitVal = 'dias';
                    } else {
                        const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g);
                        if (numbers) {
                            minVal = numbers[0] || '';
                            maxVal = numbers[1] || '';
                        }
                        if (detailStr.toLowerCase().includes('dia')) unitVal = 'dias';
                        if (detailStr.toLowerCase().includes('semana')) unitVal = 'semanas';
                        if (detailStr.toLowerCase().includes('mes') || detailStr.toLowerCase().includes('mês')) unitVal = 'meses';
                        if (detailStr.toLowerCase().includes('ano')) unitVal = 'anos';
                    }
                }
                minInput.value = minVal;
                maxInput.value = maxVal;
                unitSelect.dataset.maturidadeUnit = unitVal;
                unitSelect.value = unitVal;
            } else if (isMating) {
                rowModeSelect.value = 'acasalamento';
                fillMatingTypeSelect(matingSelect, initialMatingValue);
            } else if (isAlimentacaoTipo) {
                rowModeSelect.value = 'alimentacao_tipo';
                let feedingTypeVal = '';
                let feedingDetailVal = '';
                if (detailStr.includes(' | ')) {
                    const parts = detailStr.split(' | ');
                    feedingTypeVal = parts[0] || '';
                    feedingDetailVal = parts[1] || '';
                } else {
                    feedingTypeVal = detailStr;
                }
                fillFeedingTypeSelect(feedingTypeSelect, feedingTypeVal);
                feedingDetailInput.value = feedingDetailVal;
            } else if (isAlimentoMedio) {
                rowModeSelect.value = 'alimento_medio';
                if (detailStr) {
                    let minVal = '';
                    let maxVal = '';
                    let unitVal = 'kg/dia';
                    const match = detailStr.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*([gkm]+\/[a-zçíõâêôáéíóú]+)/i);
                    if (match) {
                        minVal = match[1] || '';
                        maxVal = match[2] || '';
                        unitVal = match[3] || 'kg/dia';
                    }
                    minInput.value = minVal;
                    maxInput.value = maxVal;
                    unitSelect.innerHTML = '';
                    ['g/dia', 'g/semana', 'g/mes', 'g/ano', 'kg/dia', 'kg/semana', 'kg/mes', 'kg/ano'].forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = unitVal;
                }
            } else if (isAguaMedia) {
                rowModeSelect.value = 'agua_media';
                if (detailStr) {
                    let minVal = '';
                    let maxVal = '';
                    let unitVal = 'l/dia';
                    const match = detailStr.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*(l\/[a-zçíõâêôáéíóú]+)/i);
                    if (match) {
                        minVal = match[1] || '';
                        maxVal = match[2] || '';
                        unitVal = match[3] || 'l/dia';
                    }
                    minInput.value = minVal;
                    maxInput.value = maxVal;
                    unitSelect.innerHTML = '';
                    ['l/dia', 'l/semana', 'l/mes', 'l/ano'].forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = unitVal;
                }
            } else {
                rowModeSelect.value = 'tipo';
                fillReproductionTypeSelect(typeSelect, typeStr);
            }

            function updateRowVisibility() {
                row.innerHTML = '';
                row.append(rowModeSelect);
                if (rowModeSelect.value === 'tipo') {
                    fillReproductionTypeSelect(typeSelect, typeSelect.value || (!isGestation && !isCrias && !isMaturidade && !isMating && !isAlimentacaoTipo && !isAlimentoMedio && !isAguaMedia ? typeStr : ''));
                    row.append(typeSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'acasalamento') {
                    fillMatingTypeSelect(matingSelect, matingSelect.value || initialMatingValue);
                    row.append(matingSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'alimentacao_tipo') {
                    row.append(feedingTypeSelect, feedingDetailInput, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'maturidade_sexual') {
                    minInput.className = 'reproduction-gestation-min reproduction-maturity-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-maturity-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 5';
                    const timeUnits = ['dias', 'semanas', 'meses', 'anos'];
                    const preferredUnit = unitSelect.dataset.maturidadeUnit || 'anos';
                    unitSelect.innerHTML = '';
                    timeUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = timeUnits.includes(preferredUnit) ? preferredUnit : 'anos';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'crias') {
                    minInput.className = 'reproduction-gestation-min';
                    maxInput.className = 'reproduction-gestation-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 5';
                    const spacer = document.createElement('div');
                    row.append(minInput, maxInput, spacer, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'alimento_medio') {
                    minInput.className = 'reproduction-gestation-min nutrition-amount-min';
                    maxInput.className = 'reproduction-gestation-max nutrition-amount-max';
                    minInput.placeholder = 'Mín: 0.1';
                    maxInput.placeholder = 'Máx: 5';
                    const previousUnit = unitSelect.value;
                    const foodUnits = ['g/dia', 'g/semana', 'g/mes', 'g/ano', 'kg/dia', 'kg/semana', 'kg/mes', 'kg/ano'];
                    unitSelect.innerHTML = '';
                    foodUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = foodUnits.includes(previousUnit) ? previousUnit : 'kg/dia';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'agua_media') {
                    minInput.className = 'reproduction-gestation-min nutrition-water-min';
                    maxInput.className = 'reproduction-gestation-max nutrition-water-max';
                    minInput.placeholder = 'Mín: 0.5';
                    maxInput.placeholder = 'Máx: 2';
                    const previousUnit = unitSelect.value;
                    const waterUnits = ['l/dia', 'l/semana', 'l/mes', 'l/ano'];
                    unitSelect.innerHTML = '';
                    waterUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = waterUnits.includes(previousUnit) ? previousUnit : 'l/dia';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else {
                    minInput.className = 'reproduction-gestation-min';
                    maxInput.className = 'reproduction-gestation-max';
                    minInput.placeholder = 'Ex: 10';
                    maxInput.placeholder = 'Ex: 15';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                }
            }

            rowModeSelect.addEventListener('change', () => {
                updateRowVisibility();
                updateReproductionPreview();
            });


            typeSelect.addEventListener('change', updateReproductionPreview);
            matingSelect.addEventListener('change', updateReproductionPreview);
            feedingTypeSelect.addEventListener('change', updateReproductionPreview);
            feedingDetailInput.addEventListener('input', updateReproductionPreview);
            minInput.addEventListener('input', updateReproductionPreview);
            maxInput.addEventListener('input', updateReproductionPreview);
            unitSelect.addEventListener('change', () => {
                if (rowModeSelect.value === 'maturidade_sexual') {
                    unitSelect.dataset.maturidadeUnit = unitSelect.value;
                }
                updateReproductionPreview();
            });

            removeBtn.addEventListener('click', () => {
                row.remove();
                if (reproductionRowsContainer.children.length === 0) createReproductionRow();
                updateReproductionPreview();
            });

            updateRowVisibility();
            reproductionRowsContainer.appendChild(row);
            updateReproductionPreview();
        }

        function buildRangeDetail(min = '', max = '', unit = '') {
            const minVal = String(min || '').trim();
            const maxVal = String(max || '').trim();
            const unitVal = String(unit || '').trim();
            if (minVal && maxVal) return `${minVal}-${maxVal} ${unitVal}`.trim();
            if (minVal) return `${minVal} ${unitVal}`.trim();
            if (maxVal) return `${maxVal} ${unitVal}`.trim();
            return '';
        }

        function parseNutritionRange(detail = '', fallbackUnit = '') {
            const clean = String(detail || '').trim();
            const result = { min: '', max: '', unit: fallbackUnit };
            const match = clean.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*([a-zA-Záéíóúãõâêôç]+\/[a-zA-Záéíóúãõâêôç]+)/i);
            if (match) {
                result.min = match[1] || '';
                result.max = match[2] || '';
                result.unit = match[3] || fallbackUnit;
            }
            return result;
        }

        function getFeedingNutritionData() {
            const items = [];
            const feedingTypeVal = feedingNutritionType?.value || '';
            const feedingDetailVal = feedingNutritionDetail?.value.trim() || '';
            if (feedingTypeVal || feedingDetailVal) {
                items.push({
                    tipo: 'Tipo de Alimentação',
                    detalhe: feedingTypeVal && feedingDetailVal ? `${feedingTypeVal} | ${feedingDetailVal}` : (feedingTypeVal || feedingDetailVal)
                });
            }

            const foodDetail = buildRangeDetail(feedingFoodMin?.value, feedingFoodMax?.value, feedingFoodUnit?.value || 'kg/dia');
            if (foodDetail) {
                items.push({ tipo: 'Alimento Ingerido em Média', detalhe: foodDetail });
            }

            const waterDetail = buildRangeDetail(feedingWaterMin?.value, feedingWaterMax?.value, feedingWaterUnit?.value || 'l/dia');
            if (waterDetail) {
                items.push({ tipo: 'Água bebida em Média', detalhe: waterDetail });
            }
            return items;
        }

        function resetFeedingNutritionFields() {
            if (feedingNutritionType) fillFeedingTypeSelect(feedingNutritionType, '');
            if (feedingNutritionDetail) feedingNutritionDetail.value = '';
            if (feedingFoodMin) feedingFoodMin.value = '';
            if (feedingFoodMax) feedingFoodMax.value = '';
            if (feedingFoodUnit) feedingFoodUnit.value = 'kg/dia';
            if (feedingWaterMin) feedingWaterMin.value = '';
            if (feedingWaterMax) feedingWaterMax.value = '';
            if (feedingWaterUnit) feedingWaterUnit.value = 'l/dia';
        }

        function setFeedingNutritionItem(item = {}) {
            const tipo = item.tipo || '';
            const detalhe = item.detalhe || item.descricao || '';
            if (tipo === 'Tipo de Alimentação') {
                let feedingTypeVal = '';
                let feedingDetailVal = '';
                if (String(detalhe).includes(' | ')) {
                    const parts = String(detalhe).split(' | ');
                    feedingTypeVal = parts[0] || '';
                    feedingDetailVal = parts.slice(1).join(' | ') || '';
                } else if (feedingTypes.includes(detalhe)) {
                    feedingTypeVal = detalhe;
                } else {
                    feedingDetailVal = detalhe;
                }
                fillFeedingTypeSelect(feedingNutritionType, feedingTypeVal);
                feedingNutritionDetail.value = feedingDetailVal;
                return true;
            }
            if (tipo === 'Alimento Ingerido em Média') {
                const parsed = parseNutritionRange(detalhe, 'kg/dia');
                feedingFoodMin.value = parsed.min;
                feedingFoodMax.value = parsed.max;
                feedingFoodUnit.value = [...feedingFoodUnit.options].some(opt => opt.value === parsed.unit) ? parsed.unit : 'kg/dia';
                return true;
            }
            if (tipo === 'Água bebida em Média') {
                const parsed = parseNutritionRange(detalhe, 'l/dia');
                feedingWaterMin.value = parsed.min;
                feedingWaterMax.value = parsed.max;
                feedingWaterUnit.value = [...feedingWaterUnit.options].some(opt => opt.value === parsed.unit) ? parsed.unit : 'l/dia';
                return true;
            }
            return false;
        }

        function getReproductionData() {
            const dynamicItems = [...reproductionRowsContainer.querySelectorAll('.reproduction-row')]
                .map(row => {
                    const rowModeSelect = row.querySelector('.reproduction-row-mode');
                    if (!rowModeSelect) return null;
                    const rowMeta = {
                        genero: normalizeGenderValue(row.querySelector('.reproduction-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.reproduction-fase-toggle')?.dataset.value || 'Adulto'
                    };
                    if (rowModeSelect.value === 'tipo') {
                        const typeVal = row.querySelector('.reproduction-type')?.value || '';
                        return {
                            ...rowMeta,
                            tipo: typeVal,
                            detalhe: ''
                        };
                    } else if (rowModeSelect.value === 'acasalamento') {
                        const matingVal = row.querySelector('.reproduction-mating-type')?.value || '';
                        return {
                            ...rowMeta,
                            tipo: 'Acasalamento',
                            detalhe: matingVal
                        };
                    } else if (rowModeSelect.value === 'alimentacao_tipo') {
                        const feedingTypeVal = row.querySelector('.reproduction-feeding-type')?.value || '';
                        const feedingDetailVal = row.querySelector('.reproduction-feeding-detail')?.value.trim() || '';
                        return {
                            ...rowMeta,
                            tipo: 'Tipo de Alimentação',
                            detalhe: `${feedingTypeVal} | ${feedingDetailVal}`
                        };
                    } else if (rowModeSelect.value === 'alimento_medio') {
                        const min = row.querySelector('.reproduction-gestation-min')?.value || '';
                        const max = row.querySelector('.reproduction-gestation-max')?.value || '';
                        const unit = row.querySelector('.reproduction-gestation-unit')?.value || 'kg/dia';
                        let detail = '';
                        if (min && max) {
                            detail = `${min}-${max} ${unit}`;
                        } else if (min) {
                            detail = `${min} ${unit}`;
                        } else if (max) {
                            detail = `${max} ${unit}`;
                        }
                        return {
                            ...rowMeta,
                            tipo: 'Alimento Ingerido em Média',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'agua_media') {
                        const min = row.querySelector('.reproduction-gestation-min')?.value || '';
                        const max = row.querySelector('.reproduction-gestation-max')?.value || '';
                        const unit = row.querySelector('.reproduction-gestation-unit')?.value || 'l/dia';
                        let detail = '';
                        if (min && max) {
                            detail = `${min}-${max} ${unit}`;
                        } else if (min) {
                            detail = `${min} ${unit}`;
                        } else if (max) {
                            detail = `${max} ${unit}`;
                        }
                        return {
                            ...rowMeta,
                            tipo: 'Água bebida em Média',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'maturidade_sexual') {
                        const detail = buildRangeDetail(
                            row.querySelector('.reproduction-gestation-min')?.value || '',
                            row.querySelector('.reproduction-gestation-max')?.value || '',
                            row.querySelector('.reproduction-gestation-unit')?.value || 'anos'
                        );
                        return {
                            ...rowMeta,
                            tipo: 'Maturidade Sexual',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'crias') {
                        const min = row.querySelector('.reproduction-gestation-min')?.value || '';
                        const max = row.querySelector('.reproduction-gestation-max')?.value || '';
                        let detail = '';
                        if (min && max) {
                            detail = `${min}-${max} crias`;
                        } else if (min) {
                            detail = `${min} crias`;
                        } else if (max) {
                            detail = `${max} crias`;
                        }
                        return {
                            ...rowMeta,
                            tipo: 'Número de Crias',
                            detalhe: detail
                        };
                    } else {
                        const min = row.querySelector('.reproduction-gestation-min')?.value || '';
                        const max = row.querySelector('.reproduction-gestation-max')?.value || '';
                        const unit = row.querySelector('.reproduction-gestation-unit')?.value || 'dias';
                        let detail = '';
                        if (min && max) {
                            detail = `${min}-${max} ${unit}`;
                        } else if (min) {
                            detail = `${min} ${unit}`;
                        } else if (max) {
                            detail = `${max} ${unit}`;
                        }
                        return {
                            ...rowMeta,
                            tipo: 'Tempo de Gestação',
                            detalhe: detail
                        };
                    }
                })
                .filter(item => item && (item.tipo || item.detalhe));
            return dynamicItems;
        }

        function setReproductionData(reproduction = []) {
            reproductionRowsContainer.innerHTML = '';
            if (!Array.isArray(reproduction) || reproduction.length === 0) {
                createReproductionRow();
                updateReproductionPreview();
                return;
            }
            const normalRows = [];
            reproduction.forEach(item => {
                if (!['Tipo de Alimentação', 'Alimento Ingerido em Média', 'Água bebida em Média'].includes(item?.tipo || '')) {
                    normalRows.push(item);
                }
            });
            if (normalRows.length === 0) {
                createReproductionRow();
            } else {
                normalRows.forEach(item => createReproductionRow(
                    item.tipo || '',
                    item.detalhe || item.descricao || '',
                    item.genero || GENDER_BOTH,
                    item.fase || 'Adulto'
                ));
            }
            updateReproductionPreview();
        }

        function getReproductionVisualMeta(type = '') {
            const normalized = normalizeDimensionKey(type);
            if (normalized.includes('acasalamento')) return { key: 'acasalamento', title: type || 'Acasalamento', accent: 'accent-generic' };
            if (normalized.includes('maturidade sexual') || normalized.includes('maturidade')) return { key: 'maturidade', title: type || 'Maturidade Sexual', accent: 'accent-maturity' };
            if (normalized.includes('gestacao') || normalized.includes('gestação') || normalized.includes('gravidez') || normalized.includes('tempo')) {
                return { key: 'gestacao', title: type || 'Gestação', accent: 'accent-weight' };
            }
            if (normalized.includes('cria') || normalized.includes('filhote')) {
                return { key: 'cuidado', title: type || 'Número de Crias', accent: 'accent-tail' };
            }
            if (normalized.includes('tipo de alimentacao') || normalized.includes('tipo de alimentação')) {
                return { key: 'alimentacaoTipo', title: type || 'Tipo de Alimentação', accent: 'accent-food' };
            }
            if (normalized.includes('alimento ingerido') || normalized.includes('alimento medio') || normalized.includes('alimento médio')) {
                return { key: 'alimentoMedio', title: type || 'Alimento Ingerido em Média', accent: 'accent-meal' };
            }
            if (normalized.includes('agua bebida') || normalized.includes('água bebida') || normalized.includes('agua media') || normalized.includes('água média')) {
                return { key: 'aguaMedia', title: type || 'Água bebida em Média', accent: 'accent-water' };
            }
            if (normalized.includes('oviparo') || normalized.includes('ovo')) return { key: 'ovo', title: type || 'Ovíparo', accent: 'accent-egg' };
            if (normalized.includes('viviparo') || normalized.includes('placental')) return { key: 'viviparo', title: type || 'Vivíparo', accent: 'accent-weight' };
            if (normalized.includes('marsupial')) return { key: 'marsupial', title: type || 'Marsupial', accent: 'accent-tail' };
            if (normalized.includes('larvar') || normalized.includes('metamorfose') || normalized.includes('girino') || normalized.includes('ninfa') || normalized.includes('pupa')) return { key: 'metamorfose', title: type || 'Metamorfose', accent: 'accent-wing' };
            if (normalized.includes('fertilizacao') || normalized.includes('sexuada') || normalized.includes('sexos separados')) return { key: 'fertilizacao', title: type || 'Fertilização', accent: 'accent-length' };
            if (normalized.includes('hermafrodita') || normalized.includes('partenogenese')) return { key: 'hermafrodita', title: type || 'Hermafrodita', accent: 'accent-width' };
            if (normalized.includes('divisao') || normalized.includes('assexuada') || normalized.includes('brotamento') || normalized.includes('conjugacao') || normalized.includes('multiplicacao') || normalized.includes('esporulacao') || normalized.includes('fragmentacao') || normalized.includes('regeneracao')) return { key: 'celular', title: type || 'Reprodução celular', accent: 'accent-generic' };
            if (normalized.includes('fossil') || normalized.includes('provavel') || normalized.includes('desconhecido') || normalized.includes('estimado')) return { key: 'fossil', title: type || 'Estimado', accent: 'accent-beak' };
            if (normalized.includes('parental') || normalized.includes('ninho') || normalized.includes('nidicola') || normalized.includes('nidifugo') || normalized.includes('saco')) return { key: 'cuidado', title: type || 'Cuidado parental', accent: 'accent-leg' };
            return { key: 'reproducao', title: type || 'Reprodução', accent: 'accent-generic' };
        }

        function getReproductionModelSvg(key = 'reproducao') {
            const icons = {
                gestacao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M22 26h36v36H22V26Z"/><path d="M22 38h36"/><path d="M31 16v10"/><path d="M49 16v10"/><circle cx="40" cy="50" r="7"/><path d="M40 46v4h4"/></svg>`,
                ovo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c13 0 23 17 23 33c0 15-9 27-23 27S17 58 17 43C17 27 27 10 40 10Z"/><path d="M29 47c7 5 15 5 22 0"/></svg>`,
                viviparo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 12c15 12 24 24 24 38c0 13-10 22-24 22S16 63 16 50c0-14 9-26 24-38Z"/><circle cx="40" cy="48" r="12"/><path d="M40 36v-9"/></svg>`,
                marsupial: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 62c2-26 13-43 33-48c9 9 13 19 11 32c-2 13-11 22-26 27"/><path d="M28 48c7 12 20 14 31 3"/><circle cx="42" cy="51" r="6"/></svg>`,
                metamorfose: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M17 54c12-18 29-23 46-14"/><path d="M57 34l8 8l-10 4"/><circle cx="25" cy="25" r="8"/><path d="M43 59c5 9 15 10 22 3"/><path d="M49 65l-8 5"/></svg>`,
                fertilizacao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="28" cy="39" r="13"/><circle cx="52" cy="39" r="13"/><path d="M40 25v28"/><path d="M26 63h28"/></svg>`,
                hermafrodita: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="34" r="15"/><path d="M40 49v21"/><path d="M29 60h22"/><path d="M50 24l14-14"/><path d="M54 10h10v10"/></svg>`,
                celular: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="30" cy="40" r="18"/><circle cx="50" cy="40" r="18"/><path d="M40 23v34"/><circle cx="30" cy="40" r="4"/><circle cx="50" cy="40" r="4"/></svg>`,
                fossil: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M19 59c12-25 31-39 52-42c-3 22-17 39-42 52L19 59Z"/><path d="M31 56L58 29"/><path d="M23 67h35"/></svg>`,
                cuidado: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 43c6-16 18-25 36-24c11 1 20 7 25 17"/><path d="M21 47c8 13 20 20 36 20"/><circle cx="39" cy="47" r="8"/><path d="M55 35l12-4"/></svg>`,
                alimentacaoTipo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M22 20c13 0 23 8 23 21c0 12-9 20-23 20V20Z"/><path d="M48 23c8 3 13 10 13 19s-5 16-13 19"/><path d="M18 38h44"/><path d="M29 31c3 5 3 13 0 18"/></svg>`,
                alimentoMedio: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M24 28h32l-4 35H28L24 28Z"/><path d="M20 28h40"/><path d="M31 28c0-8 18-8 18 0"/><path d="M33 43h14"/><path d="M33 53h10"/></svg>`,
                aguaMedia: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c12 16 22 29 22 42c0 12-9 20-22 20S18 64 18 52c0-13 10-26 22-42Z"/><path d="M30 55c4 6 11 8 18 4"/><path d="M50 27c7 9 10 16 9 24"/></svg>`,
                maturidade: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="24"/><path d="M40 18v14"/><path d="M40 48v14"/><path d="M28 40h24"/><path d="M52 28l10-10"/><path d="M54 18h8v8"/><path d="M28 59c4-7 8-10 12-10s8 3 12 10"/></svg>`,
                reproducao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 13c15 0 27 12 27 27S55 67 40 67S13 55 13 40S25 13 40 13Z"/><path d="M40 25v30"/><path d="M25 40h30"/></svg>`
            };
            return icons[key] || icons.reproducao;
        }

        function renderReproductionModelCard(item, isSuggestion = false) {
            const egg = getBirdEggVisualByLabel(item.tipo || item);
            if (isBirdCategory() && egg) {
                const numberOfEggs = item.detalhe || 'Indica o n.º de ovos';
                return `
                    <article class="dimension-model-card reproduction-model-card bird-egg-selected-card ${isSuggestion ? 'is-suggestion' : ''}">
                        <div class="bird-egg-selected-image"><img src="${egg.image}" alt="Ovo ${egg.label}" loading="lazy"></div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">${egg.label}</div>
                            <div class="dimension-model-value">${numberOfEggs}</div>
                            <div class="dimension-model-meta">Ovo escolhido</div>
                        </div>
                    </article>`;
            }

            const matingValue = normalizeSearchText(item.tipo || '').includes('acasalamento')
                ? (item.detalhe || '')
                : (isMatingReproductionItem(item.tipo || '') ? (item.tipo || '') : '');
            if (matingValue) {
                const meta = getMatingMeta(matingValue);
                return `
                    <article class="dimension-model-card reproduction-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                        <div class="dimension-model-icon">${getMatingSystemSvg(meta.key)}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">Acasalamento</div>
                            <div class="dimension-model-value">${matingValue}</div>
                            <div class="dimension-model-meta">${isSuggestion ? 'Disponível para a categoria' : 'Modelo visual'}</div>
                        </div>
                    </article>`;
            }

            const meta = getReproductionVisualMeta(item.tipo || item);
            let detail = item.detalhe || reproductionTypeDescriptions[item.tipo || item] || 'Opção desta categoria';
            if ((item.tipo || '') === 'Tipo de Alimentação' && detail.includes(' | ')) {
                const [feedingType, freeText] = detail.split(' | ');
                detail = freeText ? `${feedingType} — ${freeText}` : feedingType;
            }
            return `
                <article class="dimension-model-card reproduction-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="dimension-model-icon">${getReproductionModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${detail}</div>
                        <div class="dimension-model-meta">${isSuggestion ? 'Disponível para a categoria' : 'Modelo visual'}</div>
                    </div>
                </article>`;
        }

        function updateReproductionPreview() {
            updateReproductionEditorLabels();
            const category = getSelectedCategory();
            const categoryLabel = getSelectedCategoryLabels().join(', ') || 'Seleciona uma categoria';
            reproductionCategoryName.textContent = categoryLabel;
            reproductionCategoryIcon.innerHTML = getCategoryModelSvg(category);

            const selected = getReproductionData();
            if (selected.length) {
                previewReproductionModels.innerHTML = selected.map(item => renderReproductionModelCard(item)).join('');
                return;
            }

            if (isBirdCategory(category)) {
                previewReproductionModels.innerHTML = '<div class="dimension-model-empty">Escolhe uma cor/padrão de ovo e escreve o número médio de ovos para aparecer aqui a imagem correta.</div>';
                return;
            }

            const suggestions = getReproductionOptionsForCategory(category);
            previewReproductionModels.innerHTML = suggestions.length
                ? suggestions.map(type => renderReproductionModelCard(type, true)).join('')
                : '<div class="dimension-model-empty">Seleciona uma categoria para ver os modelos de reprodução próprios desse grupo.</div>';
        }

        [feedingNutritionType, feedingNutritionDetail, feedingFoodMin, feedingFoodMax, feedingFoodUnit, feedingWaterMin, feedingWaterMax, feedingWaterUnit]
            .filter(Boolean)
            .forEach(el => {
                const eventName = el.tagName === 'SELECT' ? 'change' : 'input';
                el.addEventListener(eventName, updateFeedingPreview);
            });

        if (feedingNutritionType) fillFeedingTypeSelect(feedingNutritionType, '');
        addReproductionBtn.addEventListener('click', () => createReproductionRow());
        setReproductionData();


        // --- PLUMAGEM E MODELO VISUAL ---
        const plumageRowsContainer = document.getElementById('plumageRows');
        const addPlumageBtn = document.getElementById('addPlumageBtn');
        const previewPlumageModels = document.getElementById('previewPlumageModels');
        const plumageHeroImage = document.getElementById('plumageHeroImage');
        const plumageHeroTitle = document.getElementById('plumageHeroTitle');
        const plumageHeroText = document.getElementById('plumageHeroText');

        function getPlumageOptions(group = 'plumagem') {
            return plumageOptionsByGroup[group] || [];
        }

        function fillPlumageTypeSelect(select, group = 'plumagem', selectedValue = '') {
            const options = [...getPlumageOptions(group)].sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && options.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe um tipo</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — personalizado</option>` : '');
            select.value = selectedValue;
        }

        function getPlumageVisualMeta(type = '', group = 'plumagem') {
            const asset = plumageVisualAssets[type] || plumageVisualAssets['Rémiges'];
            return {
                label: type || 'Modelo visual',
                groupLabel: plumageVisualGroups[group] || 'Plumagem',
                image: asset.image,
                description: plumageTypeDescriptions[type] || 'Representação visual desta característica.'
            };
        }

        function createPlumageRow(group = 'plumagem', type = '', detail = '') {
            const row = document.createElement('div');
            row.className = 'plumage-row';

            const groupSelect = document.createElement('select');
            groupSelect.className = 'plumage-group';
            groupSelect.innerHTML = `
                <option value="plumagem">Tipo de plumagem</option>
                <option value="pena">Tipo de pena</option>
            `;
            groupSelect.value = group;

            const typeSelect = document.createElement('select');
            typeSelect.className = 'plumage-type';
            fillPlumageTypeSelect(typeSelect, group, type);

            const detailInput = document.createElement('input');
            detailInput.type = 'text';
            detailInput.className = 'plumage-detail';
            detailInput.placeholder = 'Ex: isolante, ornamental, voo...';
            detailInput.value = detail;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.setAttribute('aria-label', 'Remover tipo de plumagem');

            groupSelect.addEventListener('change', () => {
                fillPlumageTypeSelect(typeSelect, groupSelect.value);
                updatePlumagePreview();
            });
            typeSelect.addEventListener('change', updatePlumagePreview);
            detailInput.addEventListener('input', updatePlumagePreview);
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (plumageRowsContainer.children.length === 0) createPlumageRow();
                updatePlumagePreview();
            });

            row.append(groupSelect, typeSelect, detailInput, removeBtn);
            plumageRowsContainer.appendChild(row);
            updatePlumagePreview();
        }

        function getPlumageData() {
            return [...plumageRowsContainer.querySelectorAll('.plumage-row')].map(row => ({
                grupo: row.querySelector('.plumage-group')?.value || 'plumagem',
                tipo: row.querySelector('.plumage-type')?.value || '',
                detalhe: row.querySelector('.plumage-detail')?.value.trim() || ''
            })).filter(item => item.tipo || item.detalhe);
        }

        function setPlumageData(items = []) {
            plumageRowsContainer.innerHTML = '';
            if (!Array.isArray(items) || items.length === 0) {
                createPlumageRow();
                return;
            }
            items.forEach(item => createPlumageRow(item.grupo || 'plumagem', item.tipo || '', item.detalhe || ''));
            updatePlumagePreview();
        }

        function renderPlumageModelCard(item, isSuggestion = false) {
            const group = item.grupo || item.group || 'plumagem';
            const type = item.tipo || item;
            const meta = getPlumageVisualMeta(type, group);
            const detail = item.detalhe || meta.description;
            return `
                <article class="plumage-model-card${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="plumage-model-figure">
                        <img src="${meta.image}" alt="${meta.label}">
                    </div>
                    <div class="plumage-model-copy">
                        <div class="plumage-model-label">${meta.label}</div>
                        <div class="plumage-model-value">${detail}</div>
                        <div class="plumage-model-meta">${meta.groupLabel}</div>
                    </div>
                </article>`;
        }

        function updatePlumagePreview() {
            const selected = getPlumageData();
            const isBird = getSelectedCategory() === 'Aves';
            const hero = selected[0] || { grupo: 'pena', tipo: 'Rémiges' };
            const heroMeta = getPlumageVisualMeta(hero.tipo || 'Rémiges', hero.grupo || 'pena');
            plumageHeroImage.src = heroMeta.image;
            plumageHeroImage.alt = heroMeta.label;
            plumageHeroTitle.textContent = heroMeta.label;
            plumageHeroText.textContent = selected[0]?.detalhe || heroMeta.description;

            if (!isBird) {
                previewPlumageModels.innerHTML = '<div class="dimension-model-empty">A secção de plumagem só fica ativa quando a categoria é <strong>Aves</strong>.</div>';
                return;
            }

            if (selected.length) {
                previewPlumageModels.innerHTML = selected.map(item => renderPlumageModelCard(item)).join('');
                return;
            }

            const suggestions = [
                { grupo: 'pena', tipo: 'Rémiges' },
                { grupo: 'pena', tipo: 'Retrizes' },
                { grupo: 'pena', tipo: 'Tectrizes' },
                { grupo: 'pena', tipo: 'Penugem' },
                { grupo: 'pena', tipo: 'Filoplumas' },
                { grupo: 'plumagem', tipo: 'Plumagem nupcial' },
                { grupo: 'plumagem', tipo: 'Plumagem de camuflagem' },
                { grupo: 'plumagem', tipo: 'Plumagem ornamental' }
            ];
            previewPlumageModels.innerHTML = suggestions.map(item => renderPlumageModelCard(item, true)).join('');
        }

        addPlumageBtn.addEventListener('click', () => createPlumageRow());
        setPlumageData();

        // --- BUSCA AUTOMÁTICA DE VÍDEOS VIA YOUTUBE API ---
        const YOUTUBE_API_KEY = "AIzaSyAum4ZdzQbhJbTVQG1bjV-xrKBkratnsWk";
        let debounceTimer;
        const debounce = (callback, time) => {
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(callback, time);
        };

        const searchAndFillVideos = async () => {
            if (isEditMode) return;
            const searchTerm = nomeCientificoInput.value.trim();
            if (searchTerm.length < 3) return;
            const api_url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&maxResults=5&type=video&key=${YOUTUBE_API_KEY}`;
            try {
                const response = await fetch(api_url);
                if (!response.ok) { throw new Error('Erro na API do YouTube'); }
                const data = await response.json();
                for (let i = 1; i <= 5; i++) { document.getElementById(`video${i}`).value = ''; }
                if (data.items) {
                    data.items.forEach((item, index) => {
                        if (index < 5) { document.getElementById(`video${index + 1}`).value = `https://www.youtube.com/watch?v=${item.id.videoId}`; }
                    });
                }
            } catch (error) { console.error("Erro ao pesquisar vídeos:", error); }
        };
        nomeCientificoInput.addEventListener('input', () => {
            if (!isEditMode) {
                const enteredName = nomeCientificoInput.value.trim().toLowerCase();
                const exists = allAnimals.some(animal => 
                    (animal.nomeCientifico && animal.nomeCientifico.trim().toLowerCase() === enteredName) || 
                    (animal.id && animal.id === enteredName.replace(/\s+/g, '_'))
                );
                if (exists && enteredName.length > 0) {
                    nomeCientificoWarning.style.display = 'inline-block';
                } else {
                    nomeCientificoWarning.style.display = 'none';
                }
            } else {
                nomeCientificoWarning.style.display = 'none';
            }
            updateScientificNameGate();
            debounce(searchAndFillVideos, 800);
        });

        // --- AUTOCOMPLETE DE FAMÍLIA E CAMPOS AVANÇADOS ---
        async function loadExistingFamilies() {
            existingFamilies.clear();
            existingReinos.clear();
            existingFilos.clear();
            existingSubfilos.clear();
            existingClasses.clear();
            existingSuperordens.clear();
            existingOrdens.clear();
            existingSubordens.clear();
            existingInfraordens.clear();
            existingGeneros.clear();
            existingEspeciesList.clear();
            allAnimals.forEach(animal => {
                if (animal.familia) existingFamilies.add(animal.familia);
                if (animal.reino) existingReinos.add(animal.reino);
                if (animal.filo) existingFilos.add(animal.filo);
                if (animal.subfilo) existingSubfilos.add(animal.subfilo);
                if (animal.classe) existingClasses.add(animal.classe);
                if (animal.superordem) existingSuperordens.add(animal.superordem);
                if (animal.ordem) existingOrdens.add(animal.ordem);
                if (animal.subordem) existingSubordens.add(animal.subordem);
                if (animal.infraordem) existingInfraordens.add(animal.infraordem);
                if (animal.genero) existingGeneros.add(animal.genero);
                if (animal.especie) existingEspeciesList.add(animal.especie);
            });
        }

        function setupAutocomplete(inputEl, resultsContainer, cacheSet) {
            inputEl.addEventListener('input', () => {
                const searchTerm = inputEl.value.toLowerCase().trim();
                if (!searchTerm) {
                    resultsContainer.style.display = 'none';
                    return;
                }
                const filtered = [...cacheSet].filter(val => val.toLowerCase().includes(searchTerm));
                resultsContainer.innerHTML = '';
                if (filtered.length > 0) {
                    filtered.forEach(value => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = value;
                        item.addEventListener('click', () => {
                            inputEl.value = value;
                            resultsContainer.style.display = 'none';
                        });
                        resultsContainer.appendChild(item);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.style.display = 'none';
                }
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.autocomplete-container') && e.target !== inputEl) {
                    resultsContainer.style.display = 'none';
                }
            });
        }

        // Configurar todos os autocompletes de texto
        setupAutocomplete(familiaInput, familiaResultsContainer, existingFamilies);
        setupAutocomplete(reinoInput, reinoResultsContainer, existingReinos);
        setupAutocomplete(filoInput, filoResultsContainer, existingFilos);
        setupAutocomplete(subfiloInput, subfiloResultsContainer, existingSubfilos);
        setupAutocomplete(classeInput, classeResultsContainer, existingClasses);
        setupAutocomplete(superordemInput, superordemResultsContainer, existingSuperordens);
        setupAutocomplete(ordemInput, ordemResultsContainer, existingOrdens);
        setupAutocomplete(subordemInput, subordemResultsContainer, existingSubordens);
        setupAutocomplete(infraordemInput, infraordemResultsContainer, existingInfraordens);
        setupAutocomplete(generoInput, generoResultsContainer, existingGeneros);
        setupAutocomplete(especiesInput, especiesResultsContainer, existingEspeciesList);

        // Lógica de Subespécies de (outros animais)
        subespeciesDeSearchInput.addEventListener('input', () => {
            const searchTerm = subespeciesDeSearchInput.value.toLowerCase().trim();
            if (!searchTerm) {
                subespeciesDeResultsContainer.style.display = 'none';
                return;
            }
            const filtered = allAnimals.filter(animal => {
                if (isEditMode && animal.id === currentEditingId) return false;
                const nome = (animal.nome || '').toLowerCase();
                const cientifico = (animal.nomeCientifico || '').toLowerCase();
                return nome.includes(searchTerm) || cientifico.includes(searchTerm);
            });

            subespeciesDeResultsContainer.innerHTML = '';
            if (filtered.length > 0) {
                filtered.forEach(animal => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = `${animal.nome} (${animal.nomeCientifico})`;
                    item.addEventListener('click', () => {
                        addSubespecie(animal.id, animal.nome);
                        subespeciesDeSearchInput.value = '';
                        subespeciesDeResultsContainer.style.display = 'none';
                    });
                    subespeciesDeResultsContainer.appendChild(item);
                });
                subespeciesDeResultsContainer.style.display = 'block';
            } else {
                subespeciesDeResultsContainer.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target !== subespeciesDeSearchInput) {
                subespeciesDeResultsContainer.style.display = 'none';
            }
        });

        function addSubespecie(id, nome) {
            if (!selectedSubespecies.includes(id)) {
                selectedSubespecies.push(id);
                renderSubespeciesTags();
            }
        }

        function removeSubespecie(id) {
            selectedSubespecies = selectedSubespecies.filter(sid => sid !== id);
            renderSubespeciesTags();
        }

        function renderSubespeciesTags() {
            selectedSubespeciesList.innerHTML = '';
            selectedSubespecies.forEach(id => {
                const animal = allAnimals.find(a => a.id === id);
                const nome = animal ? animal.nome : id;
                
                const tag = document.createElement('span');
                tag.className = 'country-tag';
                tag.innerHTML = `${nome} <i class="fa-solid fa-xmark" style="cursor: pointer; margin-left: 5px;"></i>`;
                tag.querySelector('i').addEventListener('click', () => removeSubespecie(id));
                selectedSubespeciesList.appendChild(tag);
            });
        }

        // CONTROLAR EXIBIÇÃO DE CAMPOS AVANÇADOS
        toggleAdvancedBtn.addEventListener('click', () => {
            const isHidden = advancedFieldsContainer.style.display === 'none';
            if (isHidden) {
                advancedFieldsContainer.style.display = 'grid';
                toggleAdvancedBtn.classList.add('active');
            } else {
                advancedFieldsContainer.style.display = 'none';
                toggleAdvancedBtn.classList.remove('active');
            }
        });

        // --- CONTROLO DO MODAL DE EDIÇÃO ---
        function normalizeString(str) {
            if (!str) return '';
            return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');
        }

        function populateEditList(animals) {
            editListContainer.innerHTML = '';
            if (animals.length === 0) {
                editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">Nenhum animal encontrado.</p>';
                return;
            }
            animals.forEach(animal => {
                let catDisplay = '';
                if (typeof animal.categoria === 'string') {
                    catDisplay = animal.categoria;
                } else if (animal.categoria && typeof animal.categoria === 'object') {
                    catDisplay = Object.keys(animal.categoria)
                        .filter(key => animal.categoria[key] === true)
                        .join(', ');
                }

                const item = document.createElement('div');
                item.className = 'edit-item';
                item.innerHTML = `
                    <div class="edit-item-info">
                        <div class="nome">${animal.nome} (${animal.nomeCientifico})</div>
                        <div class="categoria">${catDisplay}</div>
                    </div>
                    <button class="edit-item-btn" data-id="${animal.id}">Editar</button>`;
                editListContainer.appendChild(item);
            });
        }

        editSearchInput.addEventListener('input', () => {
            const normalizedSearchTerm = normalizeString(editSearchInput.value.trim());
            if (normalizedSearchTerm.length === 0) {
                populateEditList(allAnimals);
                return;
            }
            const filtered = allAnimals.filter(animal => {
                return normalizeString(animal.nome).includes(normalizedSearchTerm) || 
                       normalizeString(animal.nomeCientifico).includes(normalizedSearchTerm);
            });
            populateEditList(filtered);
        });

        function loadDataIntoForm(animalId) {
            const animal = allAnimals.find(a => a.id === animalId);
            if (!animal) return;
            document.getElementById('nomeAnimal').value = animal.nome || '';
            document.getElementById('nomeCientifico').value = animal.nomeCientifico || '';
            document.getElementById('familia').value = animal.familia || '';
            document.getElementById('imagemUrl').value = animal.imagemUrl || '';
            document.getElementById('imagemObjectPosition').value = animal.imagemObjectPosition || 'center center';
            setCategoryData(animal.categoria);
            
            // Carregar campos avançados
            document.getElementById('reino').value = animal.reino || '';
            document.getElementById('filo').value = animal.filo || '';
            document.getElementById('subfilo').value = animal.subfilo || '';
            document.getElementById('classe').value = animal.classe || '';
            document.getElementById('superordem').value = animal.superordem || '';
            document.getElementById('ordem').value = animal.ordem || '';
            document.getElementById('subordem').value = animal.subordem || '';
            document.getElementById('infraordem').value = animal.infraordem || '';
            document.getElementById('genero').value = animal.genero || '';
            document.getElementById('especies').value = animal.especie || '';
            selectedSubespecies = animal.subespeciesDe || [];
            renderSubespeciesTags();

            const generalVisualData = animal.informacao.geralDetalhada || [];
            const legacyMatingItems = extractLegacyGeneralMatingItems(generalVisualData);
            const legacyEcologyItems = extractLegacyEcologyItems(generalVisualData);
            const cleanGeneralVisualData = filterLegacyEcologyItems(generalVisualData);

            document.getElementById('infoGeral').value = animal.informacao.geral || '';
            setGeneralVisualData(cleanGeneralVisualData);
            document.getElementById('infoDimensoes').value = animal.informacao.dimensoes || '';
            setDimensionData(animal.informacao.dimensoesDetalhadas || []);
            document.getElementById('infoAlimentacao').value = animal.informacao.alimentacao || '';
            const rawAlimentacaoDetalhada = animal.informacao.alimentacaoDetalhada || [];
            const rawReproducaoDetalhada = animal.informacao.reproducaoDetalhada || [];
            const legacyNutritionItems = rawReproducaoDetalhada.filter(item => ['Tipo de Alimentação', 'Alimento Ingerido em Média', 'Água bebida em Média'].includes(item.tipo || ''));
            const cleanedReproducaoDetalhada = rawReproducaoDetalhada.filter(item => !['Tipo de Alimentação', 'Alimento Ingerido em Média', 'Água bebida em Média'].includes(item.tipo || ''));
            setFeedingData([...rawAlimentacaoDetalhada, ...legacyNutritionItems]);
            const ecoData = animal.informacao.ecologia || {};
            setEcologyData(normalizeEcologyData(ecoData, legacyEcologyItems), { useDefaultRows: false });
            document.getElementById('infoEcologia').value = ecoData.resumo || ecoData.texto || '';
            document.getElementById('infoReproducao').value = animal.informacao.reproducao || '';
            document.getElementById('infoPlumagem').value = animal.informacao.plumagem || '';
            setReproductionData(mergeUniqueReproductionItems([...cleanedReproducaoDetalhada, ...legacyMatingItems]));
            setPlumageData(animal.informacao.plumagemDetalhada || []);
            
            const distData = animal.informacao.distribuicao || { paises: [], paisesDetalhes: {}, descricao: '' };
            selectedCountries = distData.paises || [];
            paisesDetalhes = distData.paisesDetalhes || {};
            document.getElementById('infoDistribuicao').value = distData.descricao || '';
            renderSelectedCountries();
            if (mapForm) {
                mapForm.setSelectedRegions(selectedCountries);
                setTimeout(() => {
                    selectedCountries.forEach(code => {
                        applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
                    });
                }, 100);
            }

            const curiData = animal.informacao.curiosidades || { cor: '', estadoConservacao: '', texto: '' };
            setCuriosidadesData(normalizeCuriosidadesData(curiData), { useDefaultRows: false });
            document.getElementById('infoCuriosidades').value = curiData.texto || '';
            updateCuriosidadesPreview();

            let hasVideos = false;
            for (let i = 0; i < 5; i++) {
                const videoVal = animal.videos && animal.videos[i] ? animal.videos[i] : '';
                document.getElementById(`video${i + 1}`).value = videoVal;
                if (videoVal) hasVideos = true;
            }
            toggleVideosFieldset(hasVideos);
            closeModal();
            switchToEditMode(animalId);
            updatePlumagemTabVisibility();
        }

        function switchToEditMode(animalId) {
            isEditMode = true;
            currentEditingId = animalId;
            formTitle.style.display = 'block';
            formSubtitle.style.display = 'block';
            formTitle.textContent = "Editar Animal";
            formSubtitle.textContent = `A editar: ${document.getElementById('nomeAnimal').value}`;
            saveButton.textContent = "Atualizar Dados";
            document.getElementById('nomeCientifico').disabled = true;
            document.body.classList.add('edit-theme');
            updateScientificNameGate();
        }

        function switchToCreateMode() {
            isEditMode = false;
            currentEditingId = null;
            animalForm.reset();
            setCategoryData('');
            selectedSubespecies = [];
            renderSubespeciesTags();
            advancedFieldsContainer.style.display = 'none';
            toggleAdvancedBtn.classList.remove('active');
            
            document.getElementById('infoPlumagem').value = '';
            document.getElementById('imagemObjectPosition').value = 'center center';
            setGeneralVisualData();
            setDimensionData();
            setFeedingData();
            setEcologyData();
            document.getElementById('infoEcologia').value = '';
            setReproductionData();
            setPlumageData();
            updatePlumagemTabVisibility();
            
            setCuriosidadesData();
            document.getElementById('infoCuriosidades').value = '';
            updateCuriosidadesPreview();
            
            selectedCountries = [];
            paisesDetalhes = {};
            document.getElementById('infoDistribuicao').value = '';
            renderSelectedCountries();
            if (mapForm) {
                mapForm.setSelectedRegions([]);
            }
            const formMapPaths = document.querySelectorAll('#distributionMapForm [data-code]');
            formMapPaths.forEach(path => {
                path.removeAttribute('fill');
                path.style.fill = '';
            });
            const svgDefs = document.querySelector('#aurora-gradient-svg defs');
            if (svgDefs) {
                const grads = svgDefs.querySelectorAll('linearGradient[id^="grad-"]');
                grads.forEach(g => g.remove());
            }

            const geralBtn = document.querySelector('[data-tab="geral"]');
            if (geralBtn) geralBtn.click();
            formTitle.style.display = 'none';
            formSubtitle.style.display = 'none';
            formTitle.textContent = "Gerir Grandes Projetos";
            formSubtitle.textContent = "Formulário de Criação de Animais";
            saveButton.textContent = "Gravar Novo Animal";
            document.getElementById('nomeCientifico').disabled = false;
            nomeCientificoWarning.style.display = 'none';
            statusMessage.style.display = 'none';
            document.body.classList.remove('edit-theme');
            toggleVideosFieldset(false);
            updateScientificNameGate({ focusScientificField: true });
        }

        function openModal() {
            populateEditList(allAnimals);
            editModalOverlay.style.display = 'flex';
            editSearchInput.value = '';
            editSearchInput.focus();
        }
        function closeModal() { editModalOverlay.style.display = 'none'; }
        
        openEditModalBtn.addEventListener('click', openModal);
        closeEditModalBtn.addEventListener('click', closeModal);
        editModalOverlay.addEventListener('click', (e) => { if (e.target === editModalOverlay) closeModal(); });
        editListContainer.addEventListener('click', (e) => { if (e.target.classList.contains('edit-item-btn')) { loadDataIntoForm(e.target.dataset.id); } });
        document.addEventListener('click', (e) => { if (!e.target.closest('.autocomplete-container')) { familiaResultsContainer.style.display = 'none'; } });

        // --- IMPORTAÇÃO DE CLASSIFICAÇÃO CIENTÍFICA ---
        const importTaxModalOverlay = document.getElementById('importTaxModalOverlay');
        const btnOpenImportTaxModal = document.getElementById('btnOpenImportTaxModal');
        const closeImportTaxModalBtn = document.getElementById('closeImportTaxModalBtn');
        const confirmImportTaxBtn = document.getElementById('confirmImportTaxBtn');
        const importTaxTextarea = document.getElementById('importTaxTextarea');

        if (btnOpenImportTaxModal) {
            btnOpenImportTaxModal.addEventListener('click', () => {
                importTaxTextarea.value = '';
                importTaxModalOverlay.style.display = 'flex';
                importTaxTextarea.focus();
            });
        }

        const closeImportTaxModal = () => {
            importTaxModalOverlay.style.display = 'none';
        };

        if (closeImportTaxModalBtn) {
            closeImportTaxModalBtn.addEventListener('click', closeImportTaxModal);
        }
        if (importTaxModalOverlay) {
            importTaxModalOverlay.addEventListener('click', (e) => {
                if (e.target === importTaxModalOverlay) closeImportTaxModal();
            });
        }

        if (confirmImportTaxBtn) {
            confirmImportTaxBtn.addEventListener('click', () => {
                const rawText = importTaxTextarea.value;
                if (!rawText.trim()) {
                    closeImportTaxModal();
                    return;
                }

                const parsed = parseClassificationText(rawText);
                
                const keyToDomId = {
                    'reino': 'reino',
                    'filo': 'filo',
                    'subfilo': 'subfilo',
                    'classe': 'classe',
                    'superordem': 'superordem',
                    'ordem': 'ordem',
                    'subordem': 'subordem',
                    'infraordem': 'infraordem',
                    'família': 'familia',
                    'familia': 'familia',
                    'género': 'genero',
                    'genero': 'genero',
                    'espécie': 'especies',
                    'espécies': 'especies',
                    'especie': 'especies',
                    'especies': 'especies'
                };

                for (const [key, value] of Object.entries(parsed)) {
                    const domId = keyToDomId[key.toLowerCase()];
                    if (domId) {
                        const el = document.getElementById(domId);
                        if (el) {
                            el.value = value;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                }

                closeImportTaxModal();
            });
        }

        function parseClassificationText(text) {
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const result = {};
            const normalizeClassificationKey = (value = '') => String(value)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();
            const knownKeys = ['reino', 'filo', 'subfilo', 'classe', 'superordem', 'ordem', 'subordem', 'infraordem', 'familia', 'genero', 'especie', 'especies'];
            
            let parsedAnySeparator = false;
            for (let line of lines) {
                const match = line.match(/^([^:-]+)\s*[:-]\s*(.+)$/);
                if (match) {
                    const rawKey = normalizeClassificationKey(match[1]);
                    if (knownKeys.includes(rawKey)) {
                        result[rawKey] = match[2].trim();
                        parsedAnySeparator = true;
                    }
                }
            }
            
            if (!parsedAnySeparator) {
                for (let i = 0; i < lines.length - 1; i++) {
                    const potentialKey = normalizeClassificationKey(lines[i]);
                    if (knownKeys.includes(potentialKey)) {
                        result[potentialKey] = lines[i+1];
                        i++;
                    }
                }
            }
            
            return result;
        }


        // --- CONTROLO DAS ABAS DO FORMULÁRIO ---
        const tabButtons = document.querySelectorAll('.form-tab-nav-btn');
        const tabPanels = document.querySelectorAll('.form-tab-panel');
        const subTabButtons = document.querySelectorAll('.form-subtab-nav-btn');
        const subTabPanels = document.querySelectorAll('.form-subtab-panel');
        const tabsWrapper = document.querySelector('.form-tabs-wrapper');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active tab theme class on wrapper
                tabsWrapper.classList.remove('active-geral', 'active-dimensoes', 'active-alimentacao', 'active-reproducao', 'active-plumagem', 'active-distribuicao', 'active-curiosidades');
                tabsWrapper.classList.add(`active-${targetTab}`);
                
                tabButtons.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
                });

                tabPanels.forEach(panel => {
                    const isActive = panel.id === `tabpanel-${targetTab}`;
                    panel.classList.toggle('active', isActive);
                });

                if (targetTab === 'distribuicao') {
                    setTimeout(() => {
                        if (!mapForm) {
                            initMapForm();
                        } else {
                            mapForm.updateSize();
                        }
                    }, 50);
                }
            });
        });

        subTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSubTab = btn.dataset.subtab;
                const scope = btn.closest('.form-tab-panel');
                const scopedButtons = scope.querySelectorAll('.form-subtab-nav-btn');
                const scopedPanels = scope.querySelectorAll('.form-subtab-panel');

                scopedButtons.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
                });

                scopedPanels.forEach(panel => {
                    const isActive = panel.id === `subtabpanel-${targetSubTab}`;
                    panel.classList.toggle('active', isActive);
                });
            });
        });

        // --- CONTROLO DO FIELDSET COLAPSÁVEL DE VÍDEOS ---
        function toggleVideosFieldset(open = null) {
            const fieldset = document.getElementById('videosFieldset');
            const content = fieldset.querySelector('.fieldset-content');
            const chevron = document.getElementById('videosLegend').querySelector('i');
            
            const shouldOpen = open !== null ? open : fieldset.classList.contains('collapsed');
            
            if (shouldOpen) {
                fieldset.classList.remove('collapsed');
                content.style.display = 'grid';
                chevron.style.transform = 'rotate(180deg)';
            } else {
                fieldset.classList.add('collapsed');
                content.style.display = 'none';
                chevron.style.transform = 'rotate(0deg)';
            }
        }
        document.getElementById('videosLegend').addEventListener('click', () => toggleVideosFieldset());

        // --- VISIBILIDADE DA ABA PLUMAGEM PARA AVES ---
        const categorySelect = document.getElementById('categoria');
        const tabBtnPlumagem = document.getElementById('tab-btn-plumagem');

        function updatePlumagemTabVisibility() {
            if (categorySelect.value === 'Aves') {
                tabBtnPlumagem.style.display = 'inline-block';
            } else {
                tabBtnPlumagem.style.display = 'none';
                if (tabBtnPlumagem.classList.contains('active')) {
                    const dimensoesBtn = document.querySelector('[data-tab="dimensoes"]');
                    if (dimensoesBtn) dimensoesBtn.click();
                }
            }
        }

        categorySelect.addEventListener('change', updatePlumagemTabVisibility);
        categorySelect.addEventListener('change', () => {
            updateReproductionPreview();
            updatePlumagePreview();
        });

        // --- CURIOSIDADES E MODELO VISUAL ---
        const curiosidadesTypeOptions = [
            'Cor do animal',
            'Estado de Conservação',
            'Relação com Humanos',
            'Também conhecido como',
            'Temperatura do Ambiente',
            'Tipo de Comunicação'
        ];
        const curiosidadesColorMap = {
            'Amarelo': '#ffd000',
            'Azul': '#1a5fb4',
            'Bege': '#e8d8c8',
            'Branco': '#fcfcfc',
            'Castanho': '#6b4423',
            'Cinzento': '#8c8c8c',
            'Creme': '#fffbcf',
            'Dourado': '#d4af37',
            'Laranja': '#ff7700',
            'Prateado': '#c0c0c0',
            'Preto': '#111111',
            'Rosa': '#ff94b8',
            'Roxo': '#9141ac',
            'Verde': '#2ec27e',
            'Vermelho': '#e01b1b'
        };

        const curiosidadesCommunicationDescriptions = {
            'Vocalizações': 'Sons produzidos pela boca, garganta, laringe ou estruturas semelhantes. Ex.: rugidos, cantos, grunhidos, assobios.',
            'Sons emitidos': 'Lista concreta dos sons conhecidos da espécie. Ex.: guinchos, estalos, zumbidos, roncos, chiados, uivos.',
            'Frequência dos sons': 'Tipo de frequência sonora usada: audível, infrassónica, ultrassónica ou baixa frequência.',
            'Intensidade vocal': 'Indica se o animal é silencioso, pouco vocal, moderadamente vocal ou muito vocal.',
            'Comunicação visual': 'Uso de sinais visíveis, como cores, padrões, posturas, movimentos, exibições ou mudanças corporais.',
            'Linguagem corporal': 'Posturas e movimentos usados para comunicar intenção, ameaça, submissão, cortejo, medo ou dominância.',
            'Sinais de cor': 'Cores ou padrões corporais usados como aviso, camuflagem, atração sexual ou reconhecimento entre indivíduos.',
            'Comunicação química / olfativa': 'Comunicação através de cheiros, feromonas, urina, fezes ou secreções glandulares.',
            'Marcação de território': 'Uso de cheiro, urina, fezes, arranhões, vocalizações ou sinais visuais para indicar posse de território.',
            'Comunicação tátil': 'Comunicação por contacto físico. Ex.: toques, lambidelas, grooming, roçar o corpo, antenas ou bicadas suaves.',
            'Grooming social': 'Limpeza ou cuidado corporal entre indivíduos, muitas vezes usado para reforçar laços sociais.',
            'Comunicação vibratória': 'Uso de vibrações transmitidas pelo solo, água, folhas, troncos ou teias.',
            'Comunicação sísmica': 'Tipo específico de comunicação vibratória feita através do solo. Ex.: elefantes, insetos e alguns roedores.',
            'Comunicação elétrica': 'Uso de campos ou impulsos elétricos para orientação, reconhecimento ou comunicação. Comum em alguns peixes.',
            'Bioluminescência comunicativa': 'Produção de luz para atrair parceiros, confundir predadores, sinalizar ou reconhecer indivíduos.',
            'Comunicação acústica não vocal': 'Sons produzidos sem vocalização direta. Ex.: bater asas, tamborilar, estalar mandíbulas, bater cauda.',
            'Chamadas de alarme': 'Sinais usados para avisar outros indivíduos sobre predadores ou perigo.',
            'Chamadas de contacto': 'Sinais usados para manter ligação entre membros do grupo, crias e progenitores ou parceiros.',
            'Chamadas de acasalamento': 'Sinais usados para atrair parceiros durante a época reprodutiva.',
            'Sinais de ameaça': 'Comportamentos usados para intimidar rivais ou predadores. Ex.: eriçar pelo, abrir asas, mostrar dentes.',
            'Sinais de submissão': 'Posturas ou sons usados para reduzir conflito e mostrar que o animal não representa ameaça.',
            'Sinais parentais': 'Comunicação entre progenitores e crias, incluindo chamamentos, toques, alimentação ou proteção.',
            'Comunicação social': 'Sinais usados para coordenar o grupo, manter hierarquias ou reforçar relações sociais.',
            'Comunicação territorial': 'Sinais usados para defender área, ninho, toca, recursos ou parceiro.',
            'Comunicação de cortejo': 'Danças, cantos, cores, ofertas, exibições ou movimentos usados para atrair parceiro.',
            'Comunicação defensiva': 'Sinais usados para afastar predadores. Ex.: cores de aviso, silvos, bufos, fingir ser maior.',
            'Comunicação multimodal': 'Uso de vários tipos de comunicação ao mesmo tempo. Ex.: canto + dança + cores + cheiro.',
            'Distância da comunicação': 'Indica se os sinais funcionam a curta, média ou longa distância.',
            'Contexto da comunicação': 'Situação em que a comunicação ocorre: alarme, acasalamento, alimentação, território, cuidado parental ou vida social.',
            'Complexidade comunicativa': 'Grau de variedade e sofisticação dos sinais: simples, moderada ou complexa.'
        };

        const curiosidadesHumanRelationOptions = [
            'Agrícola / Pecuário',
            'Cativeiro / Zoológico',
            'Companhia',
            'Exótico de companhia',
            'Laboratório',
            'Perigoso para humanos',
            'Trabalho'
        ];

        const curiosidadesStatusMeta = {
            'NE': { bg: '#5c6773', text: '#ffffff', name: 'Não Avaliado' },
            'DD': { bg: '#835d90', text: '#ffffff', name: 'Dados Insuficientes' },
            'LC': { bg: '#007a5e', text: '#ffffff', name: 'Pouco Preocupante' },
            'NT': { bg: '#85bb65', text: '#000000', name: 'Quase Ameaçado' },
            'VU': { bg: '#e69f00', text: '#000000', name: 'Vulnerável' },
            'EN': { bg: '#d55e00', text: '#ffffff', name: 'Em Perigo' },
            'CR': { bg: '#c00000', text: '#ffffff', name: 'Criticamente em Perigo' },
            'EW': { bg: '#542788', text: '#ffffff', name: 'Extinto na Natureza' },
            'EX': { bg: '#000000', text: '#ffffff', name: 'Extinto' }
        };

        function getCuriosidadeValueOptions(type = '') {
            if (type === 'Cor do animal') return Object.keys(curiosidadesColorMap).sort((a, b) => a.localeCompare(b, 'pt-PT'));
            if (type === 'Estado de Conservação') {
                return Object.entries(curiosidadesStatusMeta).map(([code, meta]) => ({ value: code, label: `${meta.name} (${code})` }));
            }
            if (type === 'Tipo de Comunicação') return Object.keys(curiosidadesCommunicationDescriptions).sort((a, b) => a.localeCompare(b));
            if (type === 'Relação com Humanos') return [...curiosidadesHumanRelationOptions].sort((a, b) => a.localeCompare(b, 'pt-PT'));
            return [];
        }

        function fillCuriosidadeTypeSelect(select, selectedValue = '') {
            const hasSelected = selectedValue && curiosidadesTypeOptions.includes(selectedValue);
            select.innerHTML = '<option value="">Escolhe uma propriedade</option>' +
                curiosidadesTypeOptions.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
        }

        function fillCuriosidadeValueSelect(select, type = '', selectedValue = '') {
            const options = getCuriosidadeValueOptions(type);
            const hasSelected = selectedValue && options.some(option => (option.value || option) === selectedValue);
            const placeholder = type ? 'Escolhe um valor' : 'Seleciona primeiro a propriedade';
            select.innerHTML = `<option value="">${placeholder}</option>` + options.map(option => {
                if (typeof option === 'string') return `<option value="${option}">${option}</option>`;
                return `<option value="${option.value}">${option.label}</option>`;
            }).join('') + (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
            select.disabled = !type;
        }

        function updateCuriosidadeFaseBtnUI(button) {
            if (!button) return;
            if (button.dataset.value === 'Adulto') {
                button.innerHTML = '<i class="fa-solid fa-paw" style="color: #10b981; font-size: 0.9rem;"></i>';
                button.title = 'Adulto';
            } else {
                button.innerHTML = '<i class="fa-solid fa-baby" style="color: #f59e0b; font-size: 0.9rem;"></i>';
                button.title = 'Cria';
            }
        }

        function parseCuriosidadeTemperature(item = {}) {
            const raw = String(item.valor || item.detalhe || '').trim();
            const result = { min: item.valorMin || '', max: item.valorMax || '', unit: item.unidade || '°C' };
            if ((!result.min && !result.max) && raw) {
                const match = raw.match(/(-?\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(-?\d+(?:[.,]\d+)?))?/);
                if (match) {
                    result.min = match[1] || '';
                    result.max = match[2] || '';
                }
            }
            return result;
        }

        function buildCuriosidadeTemperatureValue(min = '', max = '') {
            const minVal = String(min || '').trim();
            const maxVal = String(max || '').trim();
            if (minVal && maxVal) return `${minVal}-${maxVal} °C`;
            if (minVal) return `${minVal} °C`;
            if (maxVal) return `${maxVal} °C`;
            return '';
        }

        function escapeCuriosidadeHtml(value = '') {
            return String(value).replace(/[&<>"]/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char]));
        }

        function parseAlsoKnownAsNames(value = '') {
            return String(value || '')
                .split(',')
                .map(name => name.trim())
                .filter(Boolean)
                .filter((name, index, list) => list.findIndex(item => item.toLowerCase() === name.toLowerCase()) === index);
        }

        function buildAlsoKnownAsValue(value = '') {
            return parseAlsoKnownAsNames(value).join(', ');
        }

        function renderCuriosidadeValueControls(row, type = '', data = {}) {
            const oldWrapper = row.querySelector('.curiosidade-value-wrapper');
            if (oldWrapper) oldWrapper.remove();

            const wrapper = document.createElement('div');
            wrapper.className = 'curiosidade-value-wrapper';

            if (type === 'Temperatura do Ambiente') {
                wrapper.classList.add('temperature-controls');
                const parsed = parseCuriosidadeTemperature(data);
                const minInput = document.createElement('input');
                minInput.type = 'number';
                minInput.step = '0.1';
                minInput.className = 'curiosidade-temp-min';
                minInput.placeholder = 'Mín.';
                minInput.value = parsed.min;
                const maxInput = document.createElement('input');
                maxInput.type = 'number';
                maxInput.step = '0.1';
                maxInput.className = 'curiosidade-temp-max';
                maxInput.placeholder = 'Máx.';
                maxInput.value = parsed.max;
                const unitBadge = document.createElement('div');
                unitBadge.className = 'curiosidade-unit-badge';
                unitBadge.textContent = '°C';
                minInput.addEventListener('input', updateCuriosidadesPreview);
                maxInput.addEventListener('input', updateCuriosidadesPreview);
                wrapper.append(minInput, maxInput, unitBadge);
            } else if (type === 'Também conhecido como') {
                wrapper.classList.add('alias-controls');
                const aliasInput = document.createElement('input');
                aliasInput.type = 'text';
                aliasInput.className = 'curiosidade-aliases curiosidade-value';
                aliasInput.placeholder = 'Ex.: nome 1, nome 2, nome 3';
                aliasInput.value = data.valor || '';
                aliasInput.addEventListener('input', updateCuriosidadesPreview);
                wrapper.append(aliasInput);
            } else {
                const valueSelect = document.createElement('select');
                valueSelect.className = 'curiosidade-value';
                fillCuriosidadeValueSelect(valueSelect, type, data.valor || '');
                valueSelect.addEventListener('change', updateCuriosidadesPreview);
                wrapper.append(valueSelect);
            }

            const anchor = row.querySelector('.curiosidade-gender-toggle');
            row.insertBefore(wrapper, anchor);
        }

        function createCuriosidadeRow(type = '', value = '', gender = GENDER_BOTH, fase = 'Adulto', extra = {}) {
            const row = document.createElement('div');
            row.className = 'curiosidades-row';

            const typeSelect = document.createElement('select');
            typeSelect.className = 'curiosidade-type';
            fillCuriosidadeTypeSelect(typeSelect, type);

            const genderBtn = document.createElement('button');
            genderBtn.type = 'button';
            genderBtn.className = 'gender-toggle-btn curiosidade-gender-toggle';
            genderBtn.dataset.value = normalizeGenderValue(gender, GENDER_BOTH);
            const syncGenderBtn = () => {
                const ui = getGenderUi(genderBtn.dataset.value);
                genderBtn.dataset.value = ui.value;
                genderBtn.innerHTML = ui.html;
                genderBtn.title = ui.title;
            };
            syncGenderBtn();

            const faseBtn = document.createElement('button');
            faseBtn.type = 'button';
            faseBtn.className = 'fase-toggle-btn curiosidade-fase-toggle';
            faseBtn.dataset.value = fase || 'Adulto';
            updateCuriosidadeFaseBtnUI(faseBtn);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover campo';

            typeSelect.addEventListener('change', () => {
                renderCuriosidadeValueControls(row, typeSelect.value, {});
                updateCuriosidadesPreview();
            });
            genderBtn.addEventListener('click', () => {
                genderBtn.dataset.value = getNextGenderValue(genderBtn.dataset.value);
                syncGenderBtn();
                updateCuriosidadesPreview();
            });
            faseBtn.addEventListener('click', () => {
                faseBtn.dataset.value = faseBtn.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                updateCuriosidadeFaseBtnUI(faseBtn);
                updateCuriosidadesPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                updateCuriosidadesPreview();
            });

            row.append(typeSelect, genderBtn, faseBtn, removeBtn);
            curiosidadesRowsContainer.appendChild(row);
            renderCuriosidadeValueControls(row, type, { valor: value, ...extra });
            updateCuriosidadesPreview();
        }

        function getCuriosidadesData() {
            return [...curiosidadesRowsContainer.querySelectorAll('.curiosidades-row')]
                .map(row => {
                    const tipo = row.querySelector('.curiosidade-type')?.value || '';
                    let valor = row.querySelector('.curiosidade-value')?.value || '';
                    const item = {
                        tipo,
                        valor,
                        descricao: tipo === 'Tipo de Comunicação' ? (curiosidadesCommunicationDescriptions[valor] || '') : '',
                        genero: normalizeGenderValue(row.querySelector('.curiosidade-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.curiosidade-fase-toggle')?.dataset.value || 'Adulto'
                    };
                    if (tipo === 'Temperatura do Ambiente') {
                        const min = row.querySelector('.curiosidade-temp-min')?.value || '';
                        const max = row.querySelector('.curiosidade-temp-max')?.value || '';
                        valor = buildCuriosidadeTemperatureValue(min, max);
                        item.valor = valor;
                        item.valorMin = min;
                        item.valorMax = max;
                        item.unidade = '°C';
                    }
                    if (tipo === 'Também conhecido como') {
                        valor = buildAlsoKnownAsValue(row.querySelector('.curiosidade-aliases')?.value || valor);
                        item.valor = valor;
                        item.nomes = parseAlsoKnownAsNames(valor);
                    }
                    return item;
                })
                .filter(item => item.tipo && item.valor);
        }

        function getDefaultCuriosidadesRows() {
            return [
                { tipo: 'Cor do animal', valor: '', genero: GENDER_BOTH, fase: 'Adulto' },
                { tipo: 'Estado de Conservação', valor: '', genero: GENDER_BOTH, fase: 'Adulto' },
                { tipo: 'Temperatura do Ambiente', valor: '', valorMin: '', valorMax: '', unidade: '°C', genero: GENDER_BOTH, fase: 'Adulto' },
                { tipo: 'Relação com Humanos', valor: '', genero: GENDER_BOTH, fase: 'Adulto' },
                { tipo: 'Também conhecido como', valor: '', genero: GENDER_BOTH, fase: 'Adulto' }
            ];
        }

        function normalizeCuriosidadesData(curiosidades = {}) {
            if (Array.isArray(curiosidades?.detalhes) && curiosidades.detalhes.length) {
                return collapseCombinedGenderItems(curiosidades.detalhes).map(item => ({
                    tipo: item.tipo || '',
                    valor: item.valor || '',
                    valorMin: item.valorMin || '',
                    valorMax: item.valorMax || '',
                    unidade: item.unidade || (item.tipo === 'Temperatura do Ambiente' ? '°C' : ''),
                    descricao: item.descricao || (item.tipo === 'Tipo de Comunicação' ? (curiosidadesCommunicationDescriptions[item.valor] || '') : ''),
                    genero: item.genero || GENDER_BOTH,
                    fase: item.fase || 'Adulto'
                }));
            }
            const legacyItems = [];
            if (curiosidades?.cor) legacyItems.push({ tipo: 'Cor do animal', valor: curiosidades.cor, genero: GENDER_BOTH, fase: 'Adulto' });
            if (curiosidades?.estadoConservacao) legacyItems.push({ tipo: 'Estado de Conservação', valor: curiosidades.estadoConservacao, genero: GENDER_BOTH, fase: 'Adulto' });
            if (curiosidades?.tipoComunicacao) legacyItems.push({
                tipo: 'Tipo de Comunicação',
                valor: curiosidades.tipoComunicacao,
                descricao: curiosidades.tipoComunicacaoDescricao || curiosidadesCommunicationDescriptions[curiosidades.tipoComunicacao] || '',
                genero: GENDER_BOTH,
                fase: 'Adulto'
            });
            if (curiosidades?.temperaturaAmbiente) {
                const parsed = parseCuriosidadeTemperature({ valor: curiosidades.temperaturaAmbiente });
                legacyItems.push({ tipo: 'Temperatura do Ambiente', valor: curiosidades.temperaturaAmbiente, valorMin: parsed.min, valorMax: parsed.max, unidade: '°C', genero: GENDER_BOTH, fase: 'Adulto' });
            }
            if (curiosidades?.relacaoHumanos) legacyItems.push({ tipo: 'Relação com Humanos', valor: curiosidades.relacaoHumanos, genero: GENDER_BOTH, fase: 'Adulto' });
            if (Array.isArray(curiosidades?.tambemConhecidoComo) && curiosidades.tambemConhecidoComo.length) {
                legacyItems.push({ tipo: 'Também conhecido como', valor: curiosidades.tambemConhecidoComo.join(', '), nomes: curiosidades.tambemConhecidoComo, genero: GENDER_BOTH, fase: 'Adulto' });
            }
            return legacyItems;
        }

        function setCuriosidadesData(items, options = {}) {
            curiosidadesRowsContainer.innerHTML = '';
            const useDefaultRows = Object.prototype.hasOwnProperty.call(options, 'useDefaultRows')
                ? Boolean(options.useDefaultRows)
                : arguments.length === 0;
            const normalizedItems = Array.isArray(items) && items.length
                ? items
                : (useDefaultRows ? getDefaultCuriosidadesRows() : []);
            normalizedItems.forEach(item => createCuriosidadeRow(
                item.tipo || '',
                item.valor || '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto',
                { valorMin: item.valorMin || '', valorMax: item.valorMax || '', unidade: item.unidade || '' }
            ));
            updateCuriosidadesPreview();
        }

        function getPreferredCuriosidadeValue(items, type) {
            const preferred = items.find(item => item.tipo === type && item.genero === GENDER_BOTH && item.fase === 'Adulto');
            if (preferred) return preferred.valor || '';
            return items.find(item => item.tipo === type)?.valor || '';
        }

        function getPreferredCuriosidadeDescription(items, type) {
            const preferred = items.find(item => item.tipo === type && item.genero === GENDER_BOTH && item.fase === 'Adulto');
            const selected = preferred || items.find(item => item.tipo === type);
            if (!selected) return '';
            return selected.descricao || (type === 'Tipo de Comunicação' ? (curiosidadesCommunicationDescriptions[selected.valor] || '') : '');
        }

        function renderCuriosidadeMeta(item) {
            const genderUi = getGenderUi(item.genero || GENDER_BOTH);
            const faseHtml = item.fase === 'Cria'
                ? '<i class="fa-solid fa-baby" style="color: #f59e0b;"></i><span>Cria</span>'
                : '<i class="fa-solid fa-paw" style="color: #10b981;"></i><span>Adulto</span>';
            return `
                <div class="curiosidades-preview-meta">
                    <span class="curiosidades-preview-badge">${genderUi.html}<span>${genderUi.title}</span></span>
                    <span class="curiosidades-preview-badge">${faseHtml}</span>
                </div>
            `;
        }

        function renderCuriosidadePreviewCard(item) {
            if (item.tipo === 'Cor do animal') {
                const hexColor = curiosidadesColorMap[item.valor] || '#cccccc';
                const circleBorder = (item.valor === 'Branco' || item.valor === 'Creme') ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.1)';
                return `
                    <div class="curiosidades-preview-item">
                        <div class="color-preview-circle-wrapper"><div class="color-preview-circle" style="background-color: ${hexColor}; border: ${circleBorder};"></div></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Cor do Animal</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Tipo de Comunicação') {
                return `
                    <div class="curiosidades-preview-item communication-preview-item">
                        <div class="communication-preview-icon"><i class="fa-solid fa-comments"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Tipo de Comunicação</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            <div class="communication-preview-desc">A descrição fica guardada para a página do animal.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Temperatura do Ambiente') {
                return `
                    <div class="curiosidades-preview-item environment-preview-item">
                        <div class="environment-preview-icon"><i class="fa-solid fa-temperature-half"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Temperatura do Ambiente</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Também conhecido como') {
                const names = parseAlsoKnownAsNames(item.valor);
                return `
                    <div class="curiosidades-preview-item alias-preview-item">
                        <div class="alias-preview-icon"><i class="fa-solid fa-tags"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Também conhecido como</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${names.map(name => escapeCuriosidadeHtml(name)).join(' • ')}</strong>
                            <div class="communication-preview-desc">Estes nomes também contam na pesquisa do site.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Relação com Humanos') {
                return `
                    <div class="curiosidades-preview-item human-relation-preview-item">
                        <div class="human-relation-preview-icon"><i class="fa-solid fa-handshake-angle"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Relação com Humanos</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            <div class="communication-preview-desc">Modelo visual próprio desta relação.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            const statusMeta = curiosidadesStatusMeta[item.valor] || { bg: '#666', text: '#fff', name: item.valor };
            return `
                <div class="curiosidades-preview-item">
                    <div class="status-preview-badge" style="background-color: ${statusMeta.bg}; color: ${statusMeta.text};">${item.valor}</div>
                    <div class="curiosidades-preview-info">
                        <span class="preview-label">Estado de Conservação</span>
                        <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${statusMeta.name}</strong>
                        ${renderCuriosidadeMeta(item)}
                    </div>
                </div>`;
        }

        function updateCuriosidadesPreview() {
            const selected = getCuriosidadesData();
            const emptyPreview = document.getElementById('curiosidadesEmptyPreview');
            if (!selected.length) {
                curiosidadesPreviewList.innerHTML = '';
                emptyPreview.style.display = 'flex';
                return;
            }
            curiosidadesPreviewList.innerHTML = selected.map(renderCuriosidadePreviewCard).join('');
            emptyPreview.style.display = 'none';
        }

        addCuriosidadesBtn.addEventListener('click', () => createCuriosidadeRow());
        setCuriosidadesData();

        // --- LÓGICA DO SELETOR DE CATEGORIAS MÚLTIPLAS ---
        function getSelectedCategoriesMap() {
            const categoriesMap = {};
            document.querySelectorAll('.categoria-checkbox').forEach(cb => {
                categoriesMap[cb.value] = cb.checked;
            });
            return categoriesMap;
        }

        function getSelectedCategoryLabels() {
            return Array.from(document.querySelectorAll('.categoria-checkbox:checked'))
                .map(cb => cb.getAttribute('data-label'));
        }

        function updateCategorySelectionUI() {
            const checkedBoxes = Array.from(document.querySelectorAll('.categoria-checkbox:checked'));
            const labels = checkedBoxes.map(cb => cb.getAttribute('data-label'));
            
            const labelEl = document.getElementById('multiselect-label');
            if (labels.length > 0) {
                labelEl.textContent = labels.join(', ');
            } else {
                labelEl.textContent = 'Selecione Categorias';
            }
            
            // Compatibilidade com código legado e silhuetas que esperam um único valor no input oculto #categoria
            const selectEl = document.getElementById('categoria');
            selectEl.value = checkedBoxes.length > 0 ? checkedBoxes[0].value : '';
            selectEl.dispatchEvent(new Event('change'));
        }

        function setCategoryData(categoria) {
            document.querySelectorAll('.categoria-checkbox').forEach(cb => {
                cb.checked = false;
            });
            
            if (typeof categoria === 'string') {
                const cb = document.querySelector(`.categoria-checkbox[value="${categoria}"]`);
                if (cb) cb.checked = true;
            } else if (categoria && typeof categoria === 'object') {
                Object.keys(categoria).forEach(key => {
                    const cb = document.querySelector(`.categoria-checkbox[value="${key}"]`);
                    if (cb) cb.checked = !!categoria[key];
                });
            }
            
            updateCategorySelectionUI();
        }

        document.getElementById('multiselect-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('multiselect-options').classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            const options = document.getElementById('multiselect-options');
            if (options && !document.getElementById('categoria-multiselect').contains(e.target)) {
                options.classList.remove('show');
            }
        });
        
        document.querySelectorAll('.categoria-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCategorySelectionUI);
        });

        // --- INICIALIZAÇÃO ---
        async function initializePage() {
            try {
                allAnimals = [];
                const querySnapshot = await getDocs(collection(db, "animais"));
                querySnapshot.forEach(doc => { allAnimals.push({ id: doc.id, ...doc.data() }); });
                allAnimals.sort((a, b) => {
                    const dateA = a.timestamp || 0;
                    const dateB = b.timestamp || 0;
                    return dateB - dateA;
                });
                await loadExistingFamilies();
                
                // Carregar lista de países
                const countriesRes = await fetch('../js/countries.json');
                countryList = await countriesRes.json();
                
                openEditModalBtn.disabled = false;
                openEditModalBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass" style="margin-right: 8px;"></i> Procurar p/ Editar';
            } catch (error) {
                console.error("Erro fatal na inicialização:", error);
                openEditModalBtn.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="margin-right: 8px;"></i> Erro';
            }
        }

        // --- CONTROLO DA PERSPETIVA DA IMAGEM ---
        const btnPreviewImage = document.getElementById('btnPreviewImage');
        const perspectiveModalOverlay = document.getElementById('perspectiveModalOverlay');
        const closePerspectiveModalBtn = document.getElementById('closePerspectiveModalBtn');
        const confirmPerspectiveBtn = document.getElementById('confirmPerspectiveBtn');
        const perspectivePreviewImg = document.getElementById('perspectivePreviewImg');
        const perspectivePreviewImgMobile = document.getElementById('perspectivePreviewImgMobile');
        const posXSlider = document.getElementById('posXSlider');
        const posYSlider = document.getElementById('posYSlider');
        const posXVal = document.getElementById('posXVal');
        const posYVal = document.getElementById('posYVal');
        const hiddenObjectPositionInput = document.getElementById('imagemObjectPosition');
        const previewCardTitle = document.getElementById('previewCardTitle');
        const previewCardSubtitle = document.getElementById('previewCardSubtitle');
        const previewCardTitleMobile = document.getElementById('previewCardTitleMobile');
        const previewCardSubtitleMobile = document.getElementById('previewCardSubtitleMobile');
        const cardPreviewContainer = document.querySelector('.animal-list-item-preview-card');
        const cardPreviewContainerMobile = document.querySelector('.animal-list-item-preview-card-mobile');

        function getScientificNameGateControls() {
            return [...animalForm.querySelectorAll('input, textarea, select, button')]
                .filter(element => {
                    if (element === nomeCientificoInput) return false;
                    if (element.type === 'hidden') return false;
                    return true;
                });
        }

        function updateScientificNameGate({ focusScientificField = false } = {}) {
            const shouldLock = !isEditMode && !nomeCientificoInput.value.trim();
            animalForm.classList.toggle('scientific-gate-active', shouldLock);
            scientificPriorityGroup?.classList.toggle('is-active', shouldLock);

            getScientificNameGateControls().forEach(control => {
                control.disabled = shouldLock;
            });

            if (shouldLock && focusScientificField) {
                nomeCientificoInput.focus();
            }
        }

        btnPreviewImage.addEventListener('click', () => {
            const imgUrl = document.getElementById('imagemUrl').value.trim();
            if (!imgUrl) {
                alert("Por favor, introduza primeiro o URL de uma imagem.");
                return;
            }

            perspectivePreviewImg.src = imgUrl;
            perspectivePreviewImgMobile.src = imgUrl;
            
            const animalName = document.getElementById('nomeAnimal').value.trim() || 'Nome do Animal';
            const scientificName = document.getElementById('nomeCientifico').value.trim() || 'Nome científico';
            previewCardTitle.textContent = animalName;
            previewCardSubtitle.textContent = `(${scientificName})`;
            previewCardTitleMobile.textContent = animalName;
            previewCardSubtitleMobile.textContent = `(${scientificName})`;

            const currentPosition = hiddenObjectPositionInput.value || 'center center';
            let x = 50;
            let y = 50;
            
            const parts = currentPosition.split(' ');
            if (parts.length === 2) {
                const parsePart = (part) => {
                    if (part.endsWith('%')) return parseInt(part);
                    if (part === 'left' || part === 'top') return 0;
                    if (part === 'right' || part === 'bottom') return 100;
                    if (part === 'center') return 50;
                    return 50;
                };
                x = parsePart(parts[0]);
                y = parsePart(parts[1]);
            }

            posXSlider.value = x;
            posYSlider.value = y;
            posXVal.textContent = `${x}%`;
            posYVal.textContent = `${y}%`;

            updatePreviewPosition();
            perspectiveModalOverlay.style.display = 'flex';
        });

        closePerspectiveModalBtn.addEventListener('click', () => {
            perspectiveModalOverlay.style.display = 'none';
        });

        perspectiveModalOverlay.addEventListener('click', (e) => {
            if (e.target === perspectiveModalOverlay) {
                perspectiveModalOverlay.style.display = 'none';
            }
        });

        confirmPerspectiveBtn.addEventListener('click', () => {
            const x = posXSlider.value;
            const y = posYSlider.value;
            hiddenObjectPositionInput.value = `${x}% ${y}%`;
            perspectiveModalOverlay.style.display = 'none';
        });

        posXSlider.addEventListener('input', () => {
            posXVal.textContent = `${posXSlider.value}%`;
            updatePreviewPosition();
        });

        posYSlider.addEventListener('input', () => {
            posYVal.textContent = `${posYSlider.value}%`;
            updatePreviewPosition();
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const x = btn.dataset.x;
                const y = btn.dataset.y;
                posXSlider.value = x;
                posYSlider.value = y;
                posXVal.textContent = `${x}%`;
                posYVal.textContent = `${y}%`;
                updatePreviewPosition();
            });
        });

        function updatePreviewPosition() {
            perspectivePreviewImg.style.objectPosition = `${posXSlider.value}% ${posYSlider.value}%`;
            perspectivePreviewImgMobile.style.objectPosition = `${posXSlider.value}% ${posYSlider.value}%`;
        }

        // Dragging implementation
        let isDragging = false;
        let startX, startY;
        let startPosXSliderVal, startPosYSliderVal;
        let activeDragContainer = null;

        const onMouseDown = (e, container) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startPosXSliderVal = parseInt(posXSlider.value);
            startPosYSliderVal = parseInt(posYSlider.value);
            container.style.cursor = 'grabbing';
            activeDragContainer = container;
        };

        cardPreviewContainer.addEventListener('mousedown', (e) => onMouseDown(e, cardPreviewContainer));
        cardPreviewContainerMobile.addEventListener('mousedown', (e) => onMouseDown(e, cardPreviewContainerMobile));

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const sensitivity = 0.4;
            let newX = startPosXSliderVal - Math.round(deltaX * sensitivity);
            let newY = startPosYSliderVal - Math.round(deltaY * sensitivity);

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            posXSlider.value = newX;
            posYSlider.value = newY;
            posXVal.textContent = `${newX}%`;
            posYVal.textContent = `${newY}%`;
            updatePreviewPosition();
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (activeDragContainer) {
                    activeDragContainer.style.cursor = 'move';
                    activeDragContainer = null;
                }
            }
        });

        const onTouchStart = (e) => {
            if (e.touches.length !== 1) return;
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startPosXSliderVal = parseInt(posXSlider.value);
            startPosYSliderVal = parseInt(posYSlider.value);
        };

        cardPreviewContainer.addEventListener('touchstart', onTouchStart, { passive: true });
        cardPreviewContainerMobile.addEventListener('touchstart', onTouchStart, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;

            const sensitivity = 0.4;
            let newX = startPosXSliderVal - Math.round(deltaX * sensitivity);
            let newY = startPosYSliderVal - Math.round(deltaY * sensitivity);

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            posXSlider.value = newX;
            posYSlider.value = newY;
            posXVal.textContent = `${newX}%`;
            posYVal.textContent = `${newY}%`;
            updatePreviewPosition();
        }, { passive: true });

        // --- DISTRIBUIÇÃO E MAPA ---
        let countryList = {};

        let selectedCountries = [];
        let paisesDetalhes = {};
        let mapForm = null;

        // Elementos do Modal de Subregião
        const subregionModalOverlay = document.getElementById('subregionModalOverlay');
        const subregionSelectModal = document.getElementById('subregionSelectModal');
        const subregionModalTitle = document.getElementById('subregionModalTitle');
        const closeSubregionModalBtn = document.getElementById('closeSubregionModalBtn');
        const saveSubregionModalBtn = document.getElementById('saveSubregionModalBtn');
        let activeModalCountryCode = null;

         const removeSubregionCountryBtn = document.getElementById('removeSubregionCountryBtn');

        function openSubregionModal(code) {
            activeModalCountryCode = code;
            const countryName = countryList[code] || code;
            subregionModalTitle.textContent = `Área - ${countryName}`;
            subregionSelectModal.value = paisesDetalhes[code] || 'inteiro';
            subregionModalOverlay.style.display = 'flex';
        }

        function closeSubregionModal() {
            subregionModalOverlay.style.display = 'none';
            activeModalCountryCode = null;
        }

        closeSubregionModalBtn.addEventListener('click', closeSubregionModal);
        subregionModalOverlay.addEventListener('click', (e) => { if (e.target === subregionModalOverlay) closeSubregionModal(); });

        saveSubregionModalBtn.addEventListener('click', () => {
            if (activeModalCountryCode) {
                const choice = subregionSelectModal.value;
                paisesDetalhes[activeModalCountryCode] = choice;
                applySubregionGradient(activeModalCountryCode, choice);
                renderSelectedCountries();
            }
            closeSubregionModal();
        });

        removeSubregionCountryBtn.addEventListener('click', () => {
            if (activeModalCountryCode) {
                removeCountry(activeModalCountryCode);
            }
            closeSubregionModal();
        });

        function applySubregionGradient(code, subregion) {
            const svgDefs = document.querySelector('#aurora-gradient-svg defs');
            if (!svgDefs) return;

            const existingGrad = document.getElementById(`grad-${code}`);
            if (existingGrad) existingGrad.remove();

            if (subregion === 'inteiro') {
                const paths = document.querySelectorAll(`[data-code="${code}"]`);
                paths.forEach(path => {
                    path.setAttribute('fill', '#f59e0b');
                    path.style.fill = '#f59e0b';
                });
                return;
            }

            const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
            grad.setAttribute('id', `grad-${code}`);
            
            let stopColor1 = '#f59e0b';
            let stopColor2 = '#2e2e38';
            let offset = '50%';
            let x1 = '0%', y1 = '0%', x2 = '0%', y2 = '0%';

            if (subregion === 'esquerdo') { // Oeste
                x2 = '100%';
                if (code === 'US') {
                    offset = '60%';
                }
            } else if (subregion === 'direito') { // Este
                x2 = '100%';
                if (code === 'US') {
                    offset = '60%';
                }
                stopColor1 = '#2e2e38';
                stopColor2 = '#f59e0b';
            } else if (subregion === 'cima') { // Norte
                y2 = '100%';
                if (code === 'US') {
                    offset = '65%';
                }
            } else if (subregion === 'baixo') { // Sul
                y2 = '100%';
                if (code === 'US') {
                    offset = '65%';
                }
                stopColor1 = '#2e2e38';
                stopColor2 = '#f59e0b';
            }

            grad.setAttribute('x1', x1);
            grad.setAttribute('y1', y1);
            grad.setAttribute('x2', x2);
            grad.setAttribute('y2', y2);

            const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop1.setAttribute('offset', offset);
            stop1.setAttribute('stop-color', stopColor1);

            const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop2.setAttribute('offset', offset);
            stop2.setAttribute('stop-color', stopColor2);

            grad.appendChild(stop1);
            grad.appendChild(stop2);

            svgDefs.appendChild(grad);

            setTimeout(() => {
                const paths = document.querySelectorAll(`[data-code="${code}"]`);
                paths.forEach(path => {
                    path.setAttribute('fill', `url(#grad-${code})`);
                    path.style.fill = `url(#grad-${code})`;
                });
            }, 80);
        }

        function initMapForm() {
            const container = document.getElementById('distributionMapForm');
            if (!container) return;
            container.innerHTML = '';
            
            mapForm = new jsVectorMap({
                selector: '#distributionMapForm',
                map: 'world',
                regionsSelectable: true,
                regionsSelectableOne: false,
                selectedRegions: selectedCountries,
                regionStyle: {
                    initial: {
                        fill: '#2e2e38',
                        fillOpacity: 1,
                        stroke: '#3b3b4f',
                        strokeWidth: 0.5
                    },
                    hover: {
                        fill: '#f59e0b',
                        fillOpacity: 0.5,
                        cursor: 'pointer'
                    },
                    selected: {
                        fill: '#f59e0b',
                        fillOpacity: 1
                    }
                },
                onRegionSelected: function(code, isSelected) {
                    if (window.isUpdatingMapSelection) return;
                    if (isSelected) {
                        if (!selectedCountries.includes(code)) {
                            selectedCountries.push(code);
                            paisesDetalhes[code] = 'inteiro';
                            renderSelectedCountries();
                            applySubregionGradient(code, 'inteiro');
                            openSubregionModal(code);
                        }
                    } else {
                        if (selectedCountries.includes(code)) {
                            // User clicked an already selected country, so it was deselected.
                            // We want to KEEP it selected and open the modal!
                            window.isUpdatingMapSelection = true;
                            mapForm.setSelectedRegions(selectedCountries);
                            window.isUpdatingMapSelection = false;
                            applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
                            openSubregionModal(code);
                        }
                    }
                },
                onRegionClick: function(event, code) {
                    if (selectedCountries.includes(code)) {
                        openSubregionModal(code);
                    }
                }
            });
        }

        const countrySearchInput = document.getElementById('countrySearchInput');
        const countryAutocompleteDropdown = document.getElementById('countryAutocompleteDropdown');
        const selectedCountriesList = document.getElementById('selectedCountriesList');

        const normalizeStr = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        let englishNames;
        try {
            englishNames = new Intl.DisplayNames(['en'], { type: 'region' });
        } catch (e) {
            console.error("Intl.DisplayNames is not supported in this browser.", e);
        }

        function findCountryCode(searchText) {
            const clean = (s) => {
                return normalizeStr(s)
                    .replace(/[\s\-().,]+/g, ' ')
                    .replace(/\b(de|do|da|dos|das|o|a|os|as|of|the|and|e)\b/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            };

            const valClean = clean(searchText);
            if (!valClean) return null;

            const entries = Object.entries(countryList).map(([code, name]) => {
                let enName = '';
                if (englishNames) {
                    try {
                        enName = englishNames.of(code.toUpperCase()) || '';
                    } catch (e) {}
                }
                return {
                    code,
                    ptClean: clean(name),
                    enClean: clean(enName),
                    codeClean: clean(code)
                };
            });

            // 1. Exact match on cleaned name
            let match = entries.find(e => e.ptClean === valClean || e.enClean === valClean || e.codeClean === valClean);
            if (match) return match.code;

            // 2. StartsWith or includes
            match = entries.find(e => e.ptClean.includes(valClean) || valClean.includes(e.ptClean) || e.enClean.includes(valClean) || valClean.includes(e.enClean));
            if (match) return match.code;

            // Common custom variants & typo mappings
            const normalizedVal = normalizeStr(searchText);
            if (normalizedVal.includes("burquina fass") || normalizedVal.includes("burkina fas")) {
                return "BF";
            }
            if (normalizedVal.includes("democratica do congo") || normalizedVal.includes("congo dem") || normalizedVal.includes("dr congo")) {
                return "CD";
            }
            if (normalizedVal.includes("republica do congo") || normalizedVal.includes("congo republica")) {
                return "CG";
            }
            if (normalizedVal.includes("marfim") || normalizedVal.includes("ivory coast")) {
                return "CI";
            }
            if (normalizedVal.includes("centro-africana") || normalizedVal.includes("centro africana") || normalizedVal.includes("central african")) {
                return "CF";
            }
            if (normalizedVal.includes("guine-bissau") || normalizedVal.includes("guine bissau")) {
                return "GW";
            }
            if (normalizedVal.includes("guine equatorial") || normalizedVal.includes("equatorial guinea")) {
                return "GQ";
            }

            return null;
        }

        countrySearchInput.addEventListener('input', () => {
            const rawVal = countrySearchInput.value;
            if (rawVal.includes(',')) {
                const parts = rawVal.split(',').map(p => p.trim()).filter(Boolean);
                parts.forEach(part => {
                    const code = findCountryCode(part);
                    if (code) {
                        addCountrySilently(code);
                    }
                });
                countrySearchInput.value = '';
                countryAutocompleteDropdown.style.display = 'none';
                return;
            }

            const val = normalizeStr(rawVal.trim());
            if (!val) {
                countryAutocompleteDropdown.style.display = 'none';
                return;
            }

            const matches = Object.entries(countryList).filter(([code, name]) => {
                let enName = '';
                if (englishNames) {
                    try {
                        enName = englishNames.of(code.toUpperCase()) || '';
                    } catch (e) {}
                }
                return normalizeStr(name).includes(val) || 
                       normalizeStr(code).includes(val) || 
                       normalizeStr(enName).includes(val);
            }).slice(0, 10);

            if (matches.length === 0) {
                countryAutocompleteDropdown.style.display = 'none';
                return;
            }

            countryAutocompleteDropdown.innerHTML = '';
            matches.forEach(([code, name]) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = name;
                item.addEventListener('click', () => {
                    addCountry(code);
                    countrySearchInput.value = '';
                    countryAutocompleteDropdown.style.display = 'none';
                });
                countryAutocompleteDropdown.appendChild(item);
            });
            countryAutocompleteDropdown.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (e.target !== countrySearchInput) {
                countryAutocompleteDropdown.style.display = 'none';
            }
        });

        function addCountry(code) {
            if (!selectedCountries.includes(code)) {
                selectedCountries.push(code);
                paisesDetalhes[code] = 'inteiro';
                renderSelectedCountries();
                if (mapForm) {
                    mapForm.setSelectedRegions(selectedCountries);
                }
                openSubregionModal(code);
            }
        }

        function addCountrySilently(code) {
            if (!selectedCountries.includes(code)) {
                selectedCountries.push(code);
                paisesDetalhes[code] = 'inteiro';
                renderSelectedCountries();
                if (mapForm) {
                    mapForm.setSelectedRegions(selectedCountries);
                }
                applySubregionGradient(code, 'inteiro');
            }
        }

        function removeCountry(code) {
            selectedCountries = selectedCountries.filter(c => c !== code);
            delete paisesDetalhes[code];
            const existingGrad = document.getElementById(`grad-${code}`);
            if (existingGrad) existingGrad.remove();
            
            // Reset path styles for the removed country
            const paths = document.querySelectorAll(`[data-code="${code}"]`);
            paths.forEach(path => {
                path.removeAttribute('fill');
                path.style.fill = '';
            });

            renderSelectedCountries();
            if (mapForm) {
                mapForm.setSelectedRegions(selectedCountries);
            }
        }

        function renderSelectedCountries() {
            selectedCountriesList.innerHTML = '';
            selectedCountries.forEach(code => {
                const name = countryList[code] || code;
                const subLabels = {
                    'inteiro': 'País inteiro',
                    'esquerdo': 'Lado esquerdo',
                    'direito': 'Lado direito',
                    'cima': 'Lado de cima',
                    'baixo': 'Lado de baixo'
                };
                const subregion = paisesDetalhes[code] || 'inteiro';
                const tag = document.createElement('div');
                tag.className = 'country-tag';
                tag.style.cursor = 'pointer';
                tag.innerHTML = `
                    <span>${name} (${subLabels[subregion]})</span>
                    <button type="button" data-code="${code}">&times;</button>
                `;
                tag.querySelector('span').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openSubregionModal(code);
                });
                tag.querySelector('button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeCountry(code);
                });
                selectedCountriesList.appendChild(tag);
            });
        }

        initializePage();
        updateScientificNameGate({ focusScientificField: true });

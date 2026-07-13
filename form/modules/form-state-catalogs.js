// Estado, referências DOM e catálogos base
        let allAnimals = [];
        let editModalAnimals = [];
        let activeEditQualityFilter = '';
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
        const isSuggestionMode = new URLSearchParams(window.location.search).get('mode') === 'suggestion';

        const animalForm = document.getElementById('animalForm');
        const saveButton = document.getElementById('saveButton');
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
        const infraclasseInput = document.getElementById('infraclasse');
        const classeResultsContainer = document.getElementById('classeResults');
        const superordemInput = document.getElementById('superordem');
        const superordemResultsContainer = document.getElementById('superordemResults');
        const ordemInput = document.getElementById('ordem');
        const ordemResultsContainer = document.getElementById('ordemResults');
        const subordemInput = document.getElementById('subordem');
        const subordemResultsContainer = document.getElementById('subordemResults');
        const infraordemInput = document.getElementById('infraordem');
        const infraordemResultsContainer = document.getElementById('infraordemResults');
        const subfamiliaInput = document.getElementById('subfamilia');
        const generoInput = document.getElementById('genero');
        const subgeneroInput = document.getElementById('subgenero');
        const generoResultsContainer = document.getElementById('generoResults');
        const especiesInput = document.getElementById('especies');
        const autoridadeTaxonomicaInput = document.getElementById('autoridadeTaxonomica');
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
            { label: 'Comprimento furcal', unit: 'cm' },
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
                { label: 'Distância entre os caninos', unit: 'cm' },
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
                { label: 'Número de escamas da linha lateral', unit: 'unid.' },
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


        const advancedReproductionValues = ['Sistema social reprodutivo','Armazenamento de esperma','Implantação embrionária','Harém','Reprodução cooperativa','Reprodução em pares','Promiscuidade','Eusocialidade'];
        Object.keys(reproductionTypesByCategory).forEach(category => {
            reproductionTypesByCategory[category] = [...new Set([...(reproductionTypesByCategory[category] || []), ...advancedReproductionValues])];
        });

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

        const bodyCoveringCategoryConfig = {
            Aves: {
                title: 'Plumagem', icon: 'fa-feather-pointed',
                groups: { plumagem: 'Tipo de plumagem', pena: 'Tipo de pena', cor_plumagem: 'Cor da plumagem', cor_penas_ornamentais: 'Cor das penas ornamentais', cor_asas: 'Cor das asas', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_membros: 'Cor dos membros', cor_cauda: 'Cor da cauda', manchas: 'Manchas' },
                options: {
                    plumagem: ['Penugem','Plumagem juvenil','Plumagem adulta','Plumagem nupcial','Plumagem de eclipse','Plumagem de inverno','Plumagem de verão','Plumagem de camuflagem','Plumagem ornamental','Plumagem impermeável','Plumagem sexualmente dimórfica'],
                    pena: ['Rémiges','Retrizes','Tectrizes','Penugem','Semiplumas','Filoplumas','Cerdas'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares']
                }
            },
            Mamiferos: {
                title: 'Pelagem', icon: 'fa-paw',
                groups: { pelagem: 'Tipo de pelagem', pelo: 'Características do pelo', cor_pelagem: 'Cor da pelagem', cor_pele: 'Cor da pele', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_membros: 'Cor dos membros', cor_cauda: 'Cor da cauda', manchas: 'Manchas' },
                options: {
                    pelagem: ['Pelagem curta','Pelagem longa','Pelagem densa','Pelagem lanosa','Pelagem impermeável','Pelagem sazonal','Pelagem de camuflagem','Pelagem com riscas','Pelagem com manchas','Pelagem sexualmente dimórfica'],
                    pelo: ['Pelo liso','Pelo ondulado','Pelo encaracolado','Pelo áspero','Subpelo isolante','Vibrissas','Espinhos modificados','Sem pelo aparente'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares']
                }
            },
            Peixes: {
                title: 'Escamas e coloração', icon: 'fa-fish-fins',
                groups: { escama: 'Tipo de escama', pele: 'Revestimento corporal', cor_escamas: 'Cor das escamas', cor_pele: 'Cor da pele', cor_barbatanas: 'Cor das barbatanas', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_cauda: 'Cor da cauda', manchas: 'Manchas' },
                options: {
                    escama: ['Escamas placoides','Escamas ganoides','Escamas cicloides','Escamas ctenoides','Escamas reduzidas','Sem escamas'],
                    pele: ['Pele lisa','Pele mucosa','Placas dérmicas','Dentículos dérmicos','Bioluminescência','Coloração iridescente','Mudança de cor'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares']
                }
            },
            Repteis: {
                title: 'Escamas e coloração', icon: 'fa-dragon',
                groups: { escama: 'Tipo de escama', pele: 'Revestimento corporal', cor_escamas: 'Cor das escamas', cor_pele: 'Cor da pele', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_cauda: 'Cor da cauda', manchas: 'Manchas' },
                options: {
                    escama: ['Escamas lisas','Escamas quilhadas','Escamas sobrepostas','Escudos córneos','Placas ósseas','Carapaça','Plastrão'],
                    pele: ['Pele seca','Muda completa','Muda em fragmentos','Cristas cutâneas','Osteodermes'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares']
                }
            },
            Anfibios: {
                title: 'Pele e coloração', icon: 'fa-frog',
                groups: { pele: 'Tipo de pele', estrutura: 'Estruturas cutâneas', cor_pele: 'Cor da pele', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_membros: 'Cor dos membros', cor_cauda: 'Cor da cauda', manchas: 'Manchas' },
                options: {
                    pele: ['Pele lisa','Pele rugosa','Pele granulosa','Pele húmida','Pele verrugosa','Pele translúcida'],
                    estrutura: ['Glândulas mucosas','Glândulas de veneno','Dobras cutâneas','Tubérculos','Coloração aposemática','Mudança de cor'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares']
                }
            },
            Insetos: {
                title: 'Exoesqueleto e coloração', icon: 'fa-bug',
                groups: { exoesqueleto: 'Tipo de exoesqueleto', estrutura: 'Estruturas externas', cor_exoesqueleto: 'Cor do exoesqueleto', cor_asas: 'Cor das asas', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_membros: 'Cor dos membros', manchas: 'Manchas' },
                options: {
                    exoesqueleto: ['Exoesqueleto rígido','Exoesqueleto flexível','Exoesqueleto quitinoso','Élitros','Cutícula cerosa','Muda do exoesqueleto'],
                    estrutura: ['Cerdas','Escamas microscópicas','Espinhos','Placas','Brilho metálico','Bioluminescência'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares']
                }
            },
            Aracnideos: { title: 'Exoesqueleto e coloração', icon: 'fa-spider', groups: { exoesqueleto: 'Tipo de exoesqueleto', estrutura: 'Estruturas externas', cor_exoesqueleto: 'Cor do exoesqueleto', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_membros: 'Cor dos membros', manchas: 'Manchas' }, options: { exoesqueleto: ['Exoesqueleto quitinoso','Exoesqueleto rígido','Exoesqueleto flexível','Muda do exoesqueleto'], estrutura: ['Cerdas sensoriais','Espinhos','Placas','Pelos urticantes'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares'] } },
            Crustaceos: { title: 'Carapaça e coloração', icon: 'fa-shrimp', groups: { carapaca: 'Tipo de carapaça', estrutura: 'Estruturas externas', cor_carapaca: 'Cor da carapaça', cor_exoesqueleto: 'Cor do exoesqueleto', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_membros: 'Cor dos membros', manchas: 'Manchas' }, options: { carapaca: ['Carapaça calcificada','Carapaça rígida','Carapaça flexível','Exoesqueleto segmentado','Muda da carapaça'], estrutura: ['Espinhos','Placas','Cerdas','Pinças especializadas'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares'] } },
            Moluscos: { title: 'Concha, pele e coloração', icon: 'fa-shell', groups: { concha: 'Tipo de concha', pele: 'Revestimento corporal', cor_concha: 'Cor da concha', cor_manto: 'Cor do manto', cor_pele: 'Cor da pele', cor_ventre: 'Cor do ventre', cor_dorso: 'Cor do dorso', cor_cabeca: 'Cor da cabeça', cor_membros: 'Cor dos membros', manchas: 'Manchas' }, options: { concha: ['Concha univalve','Concha bivalve','Concha espiral','Concha interna','Sem concha externa'], pele: ['Pele lisa','Pele rugosa','Manto','Cromatóforos','Bioluminescência','Mudança de cor'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares'] } },
            Vermes: { title: 'Pele e revestimento', icon: 'fa-wave-square', groups: { pele: 'Tipo de pele', estrutura: 'Revestimento corporal', cor: 'Cor do revestimento', manchas: 'Manchas' }, options: { pele: ['Pele lisa','Pele segmentada','Cutícula','Pele mucosa','Pele ciliada'], estrutura: ['Cerdas','Anéis corporais','Placas','Tubérculos'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares'] } },
            Microscopicos: { title: 'Revestimento corporal', icon: 'fa-microscope', groups: { revestimento: 'Tipo de revestimento', estrutura: 'Estruturas externas', cor: 'Cor do revestimento', manchas: 'Manchas' }, options: { revestimento: ['Membrana celular','Película','Parede externa','Cápsula','Carapaça microscópica'], estrutura: ['Cílios','Flagelos','Pseudópodes','Espículas'], cor: ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'], manchas: ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares'] } }
        };



        // Parâmetros transversais do revestimento corporal.
        const advancedBodyCoveringGroups = {
            propriedade_optica: 'Propriedade óptica da coloração',
            mudanca_dinamica_cor: 'Mudança dinâmica de cor',
            padrao_manchas: 'Padrão das manchas'
        };
        const advancedBodyCoveringOptions = {
            propriedade_optica: ['Mate','Metálica','Iridescente','Fluorescente','Bioluminescente','Estrutural','Translúcida','Opaca'],
            mudanca_dinamica_cor: ['Não muda','Sazonal','Com a idade','Em resposta ao stress','Durante o acasalamento','Durante a defesa territorial','Segundo a fase sexual','Camuflagem ativa'],
            padrao_manchas: ['Triangulares','Anéis','Linhas longitudinais','Linhas faciais','Moteado','Salpicado','Margens contrastantes','Padrão específico por segmento']
        };
        Object.values(bodyCoveringCategoryConfig).forEach(config => {
            Object.assign(config.groups, advancedBodyCoveringGroups);
            Object.entries(advancedBodyCoveringOptions).forEach(([key, values]) => { config.options[key] = [...values]; });
        });

        // Todos os campos cromáticos usam o mesmo catálogo de cores, mas conservam
        // um grupo próprio para que cada região/revestimento tenha modelo visual único.
        const bodyCoveringDynamicColorGroups = {
            Aves: ['cor_plumagem','cor_penas_ornamentais','cor_asas','cor_ventre','cor_dorso','cor_cabeca','cor_membros','cor_cauda'],
            Mamiferos: ['cor_pelagem','cor_pele','cor_ventre','cor_dorso','cor_cabeca','cor_membros','cor_cauda'],
            Peixes: ['cor_escamas','cor_pele','cor_barbatanas','cor_ventre','cor_dorso','cor_cabeca','cor_cauda'],
            Repteis: ['cor_escamas','cor_pele','cor_ventre','cor_dorso','cor_cabeca','cor_membros','cor_cauda'],
            Anfibios: ['cor_pele','cor_ventre','cor_dorso','cor_cabeca','cor_membros','cor_cauda'],
            Insetos: ['cor_exoesqueleto','cor_asas','cor_ventre','cor_dorso','cor_cabeca','cor_membros'],
            Aracnideos: ['cor_exoesqueleto','cor_ventre','cor_dorso','cor_cabeca','cor_membros'],
            Crustaceos: ['cor_carapaca','cor_exoesqueleto','cor_ventre','cor_dorso','cor_membros'],
            Moluscos: ['cor_concha','cor_manto','cor_pele','cor_ventre','cor_dorso','cor_cabeca','cor_membros']
        };
        const bodyCoveringColorValues = ['Preto','Branco','Cinzento','Castanho','Bege','Creme','Amarelo','Dourado','Laranja','Vermelho','Rosa','Verde','Azul','Roxo','Prateado','Multicolor','Iridescente'];
        Object.entries(bodyCoveringDynamicColorGroups).forEach(([category, groups]) => {
            groups.forEach(group => { bodyCoveringCategoryConfig[category].options[group] = [...bodyCoveringColorValues]; });
        });


        const bodyCoveringSpotPatterns = ['Pintas', 'Máculas', 'Rosetas', 'Ocelos', 'Anéis', 'Salpicado', 'Mosqueado', 'Malhado', 'Marmoreado', 'Mesclado', 'Reticulado', 'Tigrado', 'Arlequim', 'Merle', 'Ruão', 'Tartaruga', 'Tricolor', 'Manchas em sela', 'Manchas irregulares'];
        const bodyCoveringColorOptions = ['Preto', 'Branco', 'Cinzento', 'Castanho', 'Bege', 'Creme', 'Amarelo', 'Dourado', 'Laranja', 'Vermelho', 'Rosa', 'Verde', 'Azul', 'Roxo', 'Prateado', 'Multicolor', 'Iridescente'];

        const bodyCoveringDescriptions = {

            'Cor da pele': 'Cor predominante da pele exposta', 'Cor da carapaça': 'Cor predominante da carapaça',
            'Cor do exoesqueleto': 'Cor predominante do exoesqueleto', 'Cor da concha': 'Cor predominante da concha',
            'Cor do manto': 'Cor predominante do manto', 'Cor das penas ornamentais': 'Cor das penas ornamentais',
            'Cor das barbatanas': 'Cor das barbatanas', 'Cor das asas': 'Cor das asas', 'Cor do ventre': 'Cor da região ventral',
            'Cor do dorso': 'Cor da região dorsal', 'Cor da cabeça': 'Cor da cabeça', 'Cor dos membros': 'Cor dos membros', 'Cor da cauda': 'Cor da cauda',
            'Manchas': 'Padrão de manchas visível no revestimento corporal', 'Cor da plumagem': 'Cores predominantes das penas', 'Cor da pelagem': 'Cores predominantes do pelo', 'Coloração': 'Cores e padrões visíveis do corpo',
            'Pelagem curta': 'Pelo curto e rente ao corpo', 'Pelagem longa': 'Pelo longo e protetor', 'Pelagem densa': 'Grande densidade de pelo', 'Pelagem lanosa': 'Pelo espesso e encaracolado',
            'Escamas placoides': 'Escamas semelhantes a pequenos dentes', 'Escamas ganoides': 'Escamas duras e brilhantes', 'Escamas cicloides': 'Escamas finas de margem lisa', 'Escamas ctenoides': 'Escamas com margem serrilhada',
            'Pele lisa': 'Superfície corporal lisa', 'Pele rugosa': 'Superfície corporal irregular', 'Pele húmida': 'Pele mantida húmida por secreções', 'Pele granulosa': 'Textura com pequenos grânulos',
            'Exoesqueleto rígido': 'Estrutura externa protetora e rígida', 'Carapaça calcificada': 'Carapaça endurecida por minerais', 'Mudança de cor': 'Capacidade de alterar a coloração',
            'Penugem': 'Penas muito macias e isolantes','Plumagem juvenil': 'Primeira plumagem após a penugem','Plumagem adulta': 'Aspeto típico do adulto','Plumagem nupcial': 'Mais vistosa durante a reprodução','Plumagem de eclipse': 'Fase mais discreta após a reprodução','Plumagem de inverno': 'Mais isolante e discreta','Plumagem de verão': 'Mais leve e sazonal','Plumagem de camuflagem': 'Mistura-se com o ambiente','Plumagem ornamental': 'Usada em exibição','Plumagem impermeável': 'Adaptada a repelir água','Plumagem sexualmente dimórfica': 'Macho e fêmea com aspeto distinto','Rémiges': 'Penas de voo das asas','Retrizes': 'Penas da cauda','Tectrizes': 'Penas de cobertura','Semiplumas': 'Penas intermédias e macias','Filoplumas': 'Penas finas sensoriais','Cerdas': 'Estruturas rígidas junto ao bico e olhos'
        };

        const bodyCoveringIconMap = {
            'Manchas':'fa-circle-dot','Penugem':'fa-cloud','Plumagem juvenil':'fa-egg','Plumagem adulta':'fa-feather','Plumagem nupcial':'fa-heart','Plumagem de eclipse':'fa-moon','Plumagem de inverno':'fa-snowflake','Plumagem de verão':'fa-sun','Plumagem de camuflagem':'fa-leaf','Plumagem ornamental':'fa-gem','Plumagem impermeável':'fa-droplet','Plumagem sexualmente dimórfica':'fa-venus-mars','Rémiges':'fa-plane','Retrizes':'fa-arrows-left-right','Tectrizes':'fa-shield-halved','Semiplumas':'fa-wind','Filoplumas':'fa-lines-leaning','Cerdas':'fa-grip-lines',
            'Pelagem curta':'fa-scissors','Pelagem longa':'fa-wave-square','Pelagem densa':'fa-layer-group','Pelagem lanosa':'fa-cloud','Pelagem impermeável':'fa-umbrella','Pelagem sazonal':'fa-arrows-rotate','Pelagem de camuflagem':'fa-leaf','Pelagem com riscas':'fa-bars','Pelagem com manchas':'fa-circle-dot','Pelagem sexualmente dimórfica':'fa-venus-mars','Pelo liso':'fa-minus','Pelo ondulado':'fa-water','Pelo encaracolado':'fa-hurricane','Pelo áspero':'fa-grip-lines','Subpelo isolante':'fa-temperature-half','Vibrissas':'fa-lines-leaning','Espinhos modificados':'fa-burst','Sem pelo aparente':'fa-circle',
            'Escamas placoides':'fa-tooth','Escamas ganoides':'fa-gem','Escamas cicloides':'fa-circle-notch','Escamas ctenoides':'fa-fan','Escamas reduzidas':'fa-compress','Sem escamas':'fa-ban','Pele mucosa':'fa-droplet','Placas dérmicas':'fa-shield','Dentículos dérmicos':'fa-teeth','Bioluminescência':'fa-lightbulb','Coloração iridescente':'fa-wand-magic-sparkles','Mudança de cor':'fa-palette',
            'Escamas lisas':'fa-diamond','Escamas quilhadas':'fa-chevron-up','Escamas sobrepostas':'fa-layer-group','Escudos córneos':'fa-shield-halved','Placas ósseas':'fa-table-cells-large','Carapaça':'fa-shield','Plastrão':'fa-square','Pele seca':'fa-sun','Muda completa':'fa-arrows-rotate','Muda em fragmentos':'fa-puzzle-piece','Cristas cutâneas':'fa-mountain','Osteodermes':'fa-shield-virus',
            'Pele lisa':'fa-circle','Pele rugosa':'fa-braille','Pele granulosa':'fa-grip','Pele húmida':'fa-droplet','Pele verrugosa':'fa-circle-nodes','Pele translúcida':'fa-eye','Glândulas mucosas':'fa-water','Glândulas de veneno':'fa-flask','Dobras cutâneas':'fa-wave-square','Tubérculos':'fa-circle-dot','Coloração aposemática':'fa-triangle-exclamation',
            'Exoesqueleto rígido':'fa-shield-halved','Exoesqueleto flexível':'fa-link','Exoesqueleto quitinoso':'fa-shield','Élitros':'fa-door-closed','Cutícula cerosa':'fa-droplet','Muda do exoesqueleto':'fa-arrows-rotate','Cerdas sensoriais':'fa-satellite-dish','Espinhos':'fa-burst','Placas':'fa-table-cells','Brilho metálico':'fa-bolt','Pelos urticantes':'fa-fire','Carapaça calcificada':'fa-gem','Carapaça rígida':'fa-shield','Carapaça flexível':'fa-link','Exoesqueleto segmentado':'fa-layer-group','Muda da carapaça':'fa-arrows-rotate','Pinças especializadas':'fa-scissors',
            'Concha univalve':'fa-circle-notch','Concha bivalve':'fa-book-open','Concha espiral':'fa-hurricane','Concha interna':'fa-circle-half-stroke','Sem concha externa':'fa-ban','Manto':'fa-sheet-plastic','Cromatóforos':'fa-palette','Pele segmentada':'fa-grip-lines','Cutícula':'fa-layer-group','Pele ciliada':'fa-lines-leaning','Anéis corporais':'fa-ring','Membrana celular':'fa-circle','Película':'fa-circle-notch','Parede externa':'fa-border-all','Cápsula':'fa-capsules','Carapaça microscópica':'fa-shield','Cílios':'fa-lines-leaning','Flagelos':'fa-wave-square','Pseudópodes':'fa-hand','Espículas':'fa-burst'
        };

        function getBodyCoveringConfig(category = '') {
            return bodyCoveringCategoryConfig[category] || bodyCoveringCategoryConfig.Microscopicos;
        }

        const plumageVisualGroups = bodyCoveringCategoryConfig.Aves.groups;
        const plumageOptionsByGroup = bodyCoveringCategoryConfig.Aves.options;
        const plumageTypeDescriptions = bodyCoveringDescriptions;
        const plumageVisualAssets = {};

        const dimensionUnits = ['nm', 'µm', 'mm', 'cm', 'm', 'km', 'pg', 'ng', 'µg', 'mg', 'g', 'kg', 't', 'unid.', 'mm²', 'cm²', 'µm²', 'mm³', 'cm³', 'µm³'];


        // --- SALVAR OU ATUALIZAR ---
        animalForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            saveButton.disabled = true;
            saveButton.textContent = isSuggestionMode ? 'A enviar sugestão...' : (isEditMode ? 'A atualizar...' : 'A gravar...');
            
            try {
                if (typeof window.syncCategoryFromScientificClass === 'function') {
                    window.syncCategoryFromScientificClass();
                }

                const kingdomValue = String(document.getElementById('reino')?.value || '').trim();
                if (kingdomValue.toLowerCase() !== 'animalia') {
                    throw new Error('O campo Reino tem de ser Animalia para gravar este registo.');
                }

                const selectedCategories = Array.from(document.querySelectorAll('.categoria-checkbox:checked'));
                if (!selectedCategories.length) {
                    throw new Error('O campo Categorias é obrigatório. Seleciona uma categoria antes de gravar.');
                }

                const recordIdentity = getRecordIdentity();
                const docId = isEditMode ? currentEditingId : recordIdentity.docId;
                if (!recordIdentity.scientificNameKey) { throw new Error("Preenche o nome científico antes de gravar."); }
                if (!docId) {
                    throw new Error(recordIdentity.useCompositeId
                        ? "Para este tipo de registo, preenche também o Nome Comum para criar um ID único."
                        : "Não foi possível determinar o ID do documento.");
                }

                if (!isEditMode) {
                    const existingDocSnap = await getDoc(doc(db, "animais", docId));
                    if (existingDocSnap.exists() || recordIdentityExists(recordIdentity)) {
                        nomeCientificoWarning.style.display = 'inline-block';
                        throw new Error("Este registo já se encontra registado.");
                    }
                }

                const recordTypeSaveData = getRecordTypeSaveData(recordIdentity);
                
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
                const qualitySaveData = getQualityLevelSaveData();
                const profilePhotosSaveData = typeof getProfilePhotosData === 'function' ? getProfilePhotosData() : { primary: {}, profileImages: [] };
                const xenoCantoAudioId = String(document.getElementById('xenoCantoAudioId')?.value || '').replace(/\D/g, '').trim();
                const distributionRegionsSaveData = typeof window.getDistributionRegionsData === 'function'
                    ? window.getDistributionRegionsData()
                    : [];
                const distributionAreasSaveData = typeof window.getDistributionAreasData === 'function'
                    ? window.getDistributionAreasData()
                    : [];
                const distributionPointsSaveData = typeof window.getDistributionPointsData === 'function'
                    ? window.getDistributionPointsData()
                    : [];
                const automaticDistributionCountries = typeof window.getAutoDetectedDistributionCountryCodes === 'function'
                    ? window.getAutoDetectedDistributionCountryCodes()
                    : [];

                const animalData = {
                    nome: document.getElementById('nomeAnimal').value,
                    nomeCientifico: document.getElementById('nomeCientifico').value,
                    familia: document.getElementById('familia').value.trim(),
                    reino: document.getElementById('reino').value.trim(),
                    filo: document.getElementById('filo').value.trim(),
                    subfilo: document.getElementById('subfilo').value.trim(),
                    classe: document.getElementById('classe').value.trim(),
                    infraclasse: document.getElementById('infraclasse')?.value.trim() || '',
                    superordem: document.getElementById('superordem').value.trim(),
                    ordem: document.getElementById('ordem').value.trim(),
                    subordem: document.getElementById('subordem').value.trim(),
                    infraordem: document.getElementById('infraordem').value.trim(),
                    subfamilia: document.getElementById('subfamilia')?.value.trim() || '',
                    genero: document.getElementById('genero').value.trim(),
                    subgenero: document.getElementById('subgenero')?.value.trim() || '',
                    especie: document.getElementById('especies').value.trim(),
                    autoridadeTaxonomica: document.getElementById('autoridadeTaxonomica')?.value.trim() || '',
                    subespeciesDe: selectedSubespecies,
                    tipoRegisto: recordTypeSaveData.tipoRegisto,
                    tipoRegistoPersonalizado: recordTypeSaveData.tipoRegistoPersonalizado,
                    registoBaseId: recordTypeSaveData.registoBaseId,
                    sufixoRegisto: recordTypeSaveData.sufixoRegisto,
                    designacaoRegisto: recordTypeSaveData.designacaoRegisto,
                    especieBaseId: recordTypeSaveData.especieBaseId,
                    registoTaxonomico: recordTypeSaveData.registoTaxonomico,
                    imagemUrl: document.getElementById('imagemUrl').value,
                    imagemObjectPosition: document.getElementById('imagemObjectPosition').value || 'center center',
                    imagemPerfilSexo: profilePhotosSaveData.primary?.gender || '',
                    imagemPerfilFase: profilePhotosSaveData.primary?.phase || '',
                    profileImages: profilePhotosSaveData.profileImages || [],
                    imagemRodape: document.getElementById('imagemRodape').value || '',
                    rodapeHasEsqueleto: document.getElementById('rodapeHasEsqueleto').checked,
                    rodapeHasAnatomia: document.getElementById('rodapeHasAnatomia').checked,
                    categoria: getSelectedCategoriesMap(),
                    qualidadeRegisto: qualitySaveData,
                    nivelQualidade: qualitySaveData.nivel,
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
                            paisesAutomaticos: automaticDistributionCountries,
                            areas: distributionAreasSaveData,
                            pontos: distributionPointsSaveData,
                            descricao: document.getElementById('infoDistribuicao').value || '',
                            regioesBiogeograficas: distributionRegionsSaveData,
                            regioes: distributionRegionsSaveData
                        },
                        audioXenoCantoId: xenoCantoAudioId,
                        xenoCantoAudioId: xenoCantoAudioId,
                        audio: xenoCantoAudioId ? {
                            origem: 'xeno-canto',
                            codigo: xenoCantoAudioId,
                            urlDownload: `https://xeno-canto.org/${xenoCantoAudioId}/download`,
                            urlPagina: `https://xeno-canto.org/${xenoCantoAudioId}`
                        } : null,
                        curiosidades: {
                            tambemConhecidoComo: [...new Set(curiosidadesDetalhadas
                                .filter(item => item.tipo === 'Também conhecido como')
                                .flatMap(item => typeof parseAlsoKnownAsValues === 'function' ? parseAlsoKnownAsValues(item.valor) : [item.valor])
                                .map(value => String(value || '').trim())
                                .filter(Boolean))],
                            cor: (getPlumageData().find(item => item.grupo === 'cor')?.tipo || ''),
                            estadoConservacao: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Estado de Conservação'),
                            tipoComunicacao: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Tipo de Comunicação'),
                            tipoComunicacaoDescricao: getPreferredCuriosidadeDescription(curiosidadesDetalhadas, 'Tipo de Comunicação'),
                            temperaturaAmbiente: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Temperatura do Ambiente'),
                            relacaoHumanos: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Relação com Humanos'),
                            importanciaEconomicaHumanos: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Importância económica para os humanos'),
                            horasSono: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Horas de Sono'),
                            distanciaPercorrida: getPreferredCuriosidadeValue(curiosidadesDetalhadas, 'Distância Percorrida'),
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
                    ].filter(url => url),
                    xenoCantoAudioId: xenoCantoAudioId,
                    audioXenoCantoId: xenoCantoAudioId
                };

                if (isSuggestionMode) {
                    const currentUser = auth.currentUser;
                    if (!currentUser) throw new Error('Tens de iniciar sessão para enviar uma sugestão.');
                    const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
                    const collaboratorEnabled = userSnap.exists() && String(userSnap.data().colaborador || '').toLowerCase() === 'on';
                    if (!collaboratorEnabled) throw new Error('A tua conta ainda não foi aprovada como colaborador.');

                    const suggestionId = `${currentUser.uid}_${docId}_${Date.now()}`;
                    await setDoc(doc(db, 'animalSuggestions', suggestionId), {
                        animalId: docId,
                        animalName: animalData.nome || '',
                        animalScientificName: animalData.nomeCientifico || '',
                        proposedData: animalData,
                        submittedBy: currentUser.uid,
                        submittedByEmail: currentUser.email || '',
                        status: 'pending',
                        submittedAt: Date.now(),
                        updatedAt: Date.now(),
                        type: 'edit'
                    });

                    statusMessage.className = 'grid-span-3 success';
                    statusMessage.textContent = 'Sugestão enviada. Um administrador terá de a aprovar antes de alterar o animal.';
                    saveButton.disabled = false;
                    saveButton.textContent = 'Enviar sugestão';
                    return;
                }

                await setDoc(doc(db, "animais", docId), animalData);
                await backfillEcologyManualRefsForAnimal(docId, animalData);

                const savedAnimalForCache = { id: docId, ...animalData };

                statusMessage.className = 'grid-span-3 success';
                statusMessage.textContent = `Animal ${isEditMode ? 'atualizado' : 'gravado'} com sucesso!`;
                
                await initializePage();

                // Mantém o popup "Selecionar Animal para Editar" sincronizado em direto.
                // Isto evita que o ícone Forte/Melhorar/Básico fique preso ao valor antigo
                // quando o animal é criado/editado e a lista do popup já estava em cache.
                const upsertAnimalInList = (list, animal) => {
                    if (!Array.isArray(list) || !animal?.id) return;
                    const index = list.findIndex(item => item.id === animal.id);
                    if (index >= 0) {
                        list[index] = { ...list[index], ...animal };
                    } else {
                        list.unshift(animal);
                    }
                };

                upsertAnimalInList(allAnimals, savedAnimalForCache);
                if (Array.isArray(editModalAnimals) && editModalAnimals.length) {
                    upsertAnimalInList(editModalAnimals, savedAnimalForCache);
                }
                if (typeof refreshEditList === 'function') {
                    refreshEditList();
                }

                switchToCreateMode();
            } catch (error) {
                console.error("Erro ao gravar no Firestore:", error);
                statusMessage.className = 'grid-span-3 error';
                statusMessage.textContent = error.message || 'Ocorreu um erro ao gravar. Verifique a consola.';
            } finally {
                saveButton.disabled = false;
                saveButton.textContent = isSuggestionMode ? 'Enviar sugestão' : (isEditMode ? 'Atualizar Dados' : 'Gravar Novo Animal');
            }
        });

        // --- DIMENSÕES E MODELO VISUAL ---

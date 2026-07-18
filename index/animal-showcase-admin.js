import { db } from '../js/firebase-config.js?v=5';
import { collection, doc, getDoc, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { getGeneralVisualSelectOptions } from '../js/general-visual-catalog.js';
import { matingSystems } from '../js/mating-systems.js?v=3';
import { feedingTypes } from '../js/feeding-visuals.js?v=5';

const settingsRef = doc(db, 'settings', 'index-lists');
const state = { selectedAnimalId: '', characteristic: '', characteristicValue: '', randomAnimals: true, quantity: 6 };

async function save() {
    await setDoc(settingsRef, { animalShowcase: state }, { merge: true });
}

function getParameterOptions(parameter) {
    try {
        const opts = getGeneralVisualSelectOptions(parameter);
        if (opts && opts.length) return opts;
    } catch (e) {}

    const pNorm = parameter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (pNorm.includes('alimentacao')) {
        return feedingTypes;
    }
    if (pNorm.includes('acasalamento')) {
        return matingSystems;
    }
    if (pNorm.includes('estrategia para obter') || pNorm.includes('estrategia de alimentacao') || pNorm.includes('estrategia alimentar')) {
        return [
            'Caça', 'Perseguição', 'Emboscada', 'Mergulho', 'Pesca', 'Filtração', 'Pastoreio',
            'Ramoneio', 'Escavação', 'Raspagem', 'Sucção', 'Picagem', 'Coleta', 'Procura no solo',
            'Procura em árvores', 'Necrofagia', 'Parasitismo', 'Roubo de alimento', 'Armadilha',
            'Camuflagem', 'Cooperação em grupo', 'Migração para alimento', 'Armazenamento de alimento'
        ];
    }
    if (pNorm === 'sistema sexual') {
        return ['Dióico', 'Monoico', 'Hermafrodita simultâneo', 'Hermafrodita sequencial', 'Protândrico', 'Protogínico'];
    }
    if (pNorm === 'epoca de reproducao') {
        return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Primavera', 'Verão', 'Outono', 'Inverno'];
    }
    if (pNorm === 'tipo de reproducao') {
        return ['Ovíparo', 'Vivíparo', 'Ovovivíparo', 'Partenogénese', 'Fragmentação', 'Bipartição', 'Gemulação'];
    }
    
    return null;
}

async function mount() {
    const item = document.querySelector('input[data-key="animais-destaque"]')?.closest('.setting-item');
    if (!item) return setTimeout(mount, 250);
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) Object.assign(state, snapshot.data().animalShowcase || {});
    const info = item.querySelector('.setting-info');
    const editor = document.createElement('div');
    editor.className = 'showcase-editor';
    editor.innerHTML = `
        <label>Nome do animal selecionado
            <input id="showcaseAnimalInput" list="showcaseAnimalOptions" type="search" placeholder="Sem animal fixo">
            <datalist id="showcaseAnimalOptions"></datalist>
        </label>
        <label>Pesquisar característica
            <input id="showcaseCharacteristic" list="showcaseCharacteristicOptions" type="search" placeholder="Ex.: Tipo de alimentação, Savana..."><datalist id="showcaseCharacteristicOptions"></datalist>
        </label>
        <div id="showcaseValueWrapper" style="display:none; flex-direction:column; gap:5px; font-size:.78rem; font-weight:700;">
            <label style="display:flex; flex-direction:column; gap:5px;">Valor da característica
                <select id="showcaseValueSelect" style="padding:8px; border:1px solid #446b55; border-radius:8px; background:#0b1d14; color:inherit;"></select>
            </label>
        </div>
        <label class="showcase-check"><input id="showcaseRandom" type="checkbox"> Animais aleatórios</label>
        <label>Quantidade de animais
            <select id="showcaseQuantity">${[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => `<option value="${n}">${n}</option>`).join('')}</select>
        </label>`;
    info.appendChild(editor);
    const formParameters = [
        'Altura', 'Peso', 'Comprimento',
        'Temperatura corporal', 'Vida útil', 'Espetativa média de vida', 'Velocidade máxima', 'Velocidade média',
        'Força da mordida', 'Número de dentes', 'Número de mamas', 'Termorregulação', 'Simetria corporal',
        'Abertura dos olhos', 'Início da marcha', 'Início da corrida', 'Saída do esconderijo', 'Independência',
        'Início do voo', 'Primeira alimentação sólida', 'Saída do ninho', 'Saída da toca', 'Desmame',
        'Primeira vocalização', 'Maturidade física', 'Tamanho do grupo social', 'Composição do grupo social',
        'Composição do grupo', 'Tipo de agrupamento social', 'Tamanho do território', 'Taxa de sucesso da caça',
        'Taxa de mortalidade', 'Taxa de mortalidade (cativeiro)', 'Altitude mínima', 'Altitude máxima',
        'Transformações do desenvolvimento', 'Número de segmentos', 'Número de patas', 'Número de poros',
        'Número de brânquias', 'Número de barbatanas', 'Número de vértebras', 'Número de escamas',
        'Número de miômeros', 'Tipo de esqueleto', 'Tamanho da População', 'Estratégia para obter alimento',
        'Atividade', 'Vida social', 'Organização social', 'Liderança e hierarquia', 'Parentesco e linhagem social',
        'Tipo de Comunicação', 'Função ecológica', 'Locomoção', 'Zona Climática', 'Zona Climática Secundária',
        'Bioma', 'Habitats', 'Estrato ecológico',
        'Água bebida em Média', 'Alimento Ingerido em Média', 'Estratégia para obter alimentos',
        'Mecanismo de ingestão', 'Tipo de Alimentação',
        'Ameaças naturais', 'Competidores', 'Função Ecológica', 'Predadores naturais', 'Presas',
        'Relações Simbióticas', 'Tipo de hospedeiro', 'Localização no hospedeiro', 'Tipo de parasita',
        'Acasalamento', 'Duração do estro', 'Época de reprodução', 'Estratégia reprodutiva',
        'Frequência de acasalamento durante o estro', 'Idade da metamorfose', 'Investimento Parental',
        'Intervalo entre nascimentos', 'Maturidade Sexual', 'Número de Crias', 'Número de estádios larvais',
        'Número de mudas', 'Número de ovos', 'Sistema sexual', 'Taxa de sucesso reprodutivo',
        'Tempo até à eclosão', 'Tempo de Gestação', 'Tipo de reprodução'
    ];
    const uniqueParams = [...new Set(formParameters)].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));

    const input = editor.querySelector('#showcaseAnimalInput');
    const datalist = editor.querySelector('#showcaseAnimalOptions');
    const animals = await getDocs(collection(db, 'animais'));
    const animalsList = [];
    animals.forEach(animalDoc => {
        const animal = animalDoc.data();
        const displayName = animal.nome || animal.nomeCientifico || animalDoc.id;
        animalsList.push({ id: animalDoc.id, name: displayName });
        
        const option = document.createElement('option');
        option.value = displayName;
        datalist.appendChild(option);
    });
    
    const selectedAnimal = animalsList.find(a => a.id === state.selectedAnimalId);
    if (selectedAnimal) {
        input.value = selectedAnimal.name;
    } else {
        input.value = '';
    }
    
    function updateValueSelector() {
        const charInput = editor.querySelector('#showcaseCharacteristic');
        const valueWrapper = editor.querySelector('#showcaseValueWrapper');
        if (!valueWrapper) return;
        
        const param = charInput.value.trim();
        const options = getParameterOptions(param);
        
        if (options && options.length) {
            valueWrapper.style.display = 'flex';
            const valSelect = valueWrapper.querySelector('#showcaseValueSelect');
            valSelect.innerHTML = `<option value="">Escolha um valor...</option>` + options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            valSelect.value = state.characteristicValue || '';
        } else {
            valueWrapper.style.display = 'none';
            state.characteristicValue = '';
        }
    }
    
    editor.querySelector('#showcaseCharacteristicOptions').innerHTML = uniqueParams.map(value => '<option value="' + value.replace(/"/g, '&quot;') + '">').join(''); editor.querySelector('#showcaseCharacteristic').value = state.characteristic;
    updateValueSelector();
    
    editor.querySelector('#showcaseRandom').checked = state.randomAnimals;
    input.disabled = state.randomAnimals;
    editor.querySelector('#showcaseQuantity').value = state.quantity;
    
    editor.querySelectorAll('select, input').forEach(control => control.addEventListener('change', async (e) => {
        const selectedName = input.value.trim();
        const matched = animalsList.find(a => a.name === selectedName);
        state.selectedAnimalId = matched ? matched.id : '';
        state.characteristic = editor.querySelector('#showcaseCharacteristic').value.trim();
        
        if (e.target.id !== 'showcaseValueSelect') {
            updateValueSelector();
        }
        const valSelect = editor.querySelector('#showcaseValueSelect');
        state.characteristicValue = valSelect ? valSelect.value : '';
        
        state.randomAnimals = editor.querySelector('#showcaseRandom').checked;
        input.disabled = state.randomAnimals;
        state.quantity = Number(editor.querySelector('#showcaseQuantity').value) || 6;
        await save();
    }));
}

mount();

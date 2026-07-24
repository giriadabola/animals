import { auth, db } from './firebase-config.js?v=5';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import { doc, getDoc, setDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

(() => {
  'use strict';

  // Global error logger for diagnostics
  window.addEventListener('error', event => {
    alert('Erro detetado: ' + event.message + ' em ' + event.filename + ':' + event.lineno);
  });

  const STORAGE_KEY = 'mundoanimal_meu_zoo_v2_cloud';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const translateCategory = (cat) => {
    const translations = {
      'Mamiferos': 'Mamíferos',
      'Aves': 'Aves',
      'Peixes': 'Peixes',
      'Moluscos': 'Moluscos',
      'Crustaceos': 'Crustáceos',
      'Aracnideos': 'Aracnídeos',
      'Vermes': 'Vermes',
      'Repteis': 'Répteis',
      'Anfibios': 'Anfíbios',
      'Insetos': 'Insetos',
      'Microscopicos': 'Microscópicos',
      'Extintos': 'Extintos'
    };
    return translations[cat] || cat;
  };

  const getAnimalMiniEmojiUrl = (scientific) => {
    if (!scientific || scientific === '—') return 'assets/placeholder.png';
    const clean = scientific.trim().replace(/\s+/g, '_');
    return `assets/mini/${clean}_clay.png`;
  };

  const getFirstActiveCategory = (categoria) => {
    if (typeof categoria === 'string') return categoria;
    if (categoria && typeof categoria === 'object') {
      const active = Object.keys(categoria).filter(k => categoria[k] === true);
      return active[0] || '';
    }
    return '';
  };

  const getAnimalStatus = (animal) => {
    const detalhes = animal.informacao?.curiosidades?.detalhes || [];
    const statusDetail = detalhes.find(d => d.tipo === 'Estado de Conservação' || d.tipo === 'Estado de conservação (IUCN)');
    if (statusDetail) return statusDetail.valor;
    if (animal.statusConservacao) return animal.statusConservacao;
    if (animal.iucnStatus) return animal.iucnStatus;
    if (animal.status) return animal.status;
    return 'LC';
  };

  const getAnimalDiet = (animal) => {
    if (animal.alimentacao?.tipo) return animal.alimentacao.tipo;
    const detalhes = animal.informacao?.curiosidades?.detalhes || [];
    const dietDetail = detalhes.find(d => d.tipo === 'Tipo de alimentação' || d.tipo === 'Dieta');
    if (dietDetail) return dietDetail.valor;
    return 'Omnívoro';
  };

  const getAnimalHabitat = (animal) => {
    if (animal.habitat) return animal.habitat;
    const detalhes = animal.informacao?.curiosidades?.detalhes || [];
    const habDetail = detalhes.find(d => d.tipo === 'Habitat' || d.tipo === 'Bioma');
    if (habDetail) return habDetail.valor;
    return 'Terrestre';
  };

  const getAnimalActivity = (animal) => {
    if (animal.atividade) return animal.atividade;
    const detalhes = animal.informacao?.curiosidades?.detalhes || [];
    const actDetail = detalhes.find(d => d.tipo === 'Atividade' || d.tipo === 'Locomoção');
    if (actDetail) return actDetail.valor;
    return 'Diurno';
  };

  const getAnimalCountry = (animal) => {
    if (animal.paises && animal.paises.length) return animal.paises.join(', ');
    if (animal.distribuicao?.paises) return animal.distribuicao.paises;
    return 'Global';
  };

  const getAnimalContinent = (animal) => {
    if (animal.continente) return animal.continente;
    if (animal.distribuicao?.continentes && animal.distribuicao.continentes.length) return animal.distribuicao.continentes[0];
    return 'Global';
  };

  const defaultState = {
    created: false,
    name: 'O Meu Zoo Selvagem',
    description: 'Uma coleção dedicada à biodiversidade, às espécies ameaçadas e aos grandes habitats do planeta.',
    icon: '🐾',
    visibility: 'public',
    style: 'map',
    scienceMode: true,
    editMode: false,
    zoneIds: ['savanna', 'asian-forest', 'polar', 'ocean', 'aviary', 'reptiles'],
    animalIds: [],
    featuredAnimalId: '',
    collections: [
      { id: 'favorites', name: 'Os meus favoritos', icon: '❤️', description: 'As espécies de que mais gosto.', animals: [] },
      { id: 'threatened', name: 'Espécies ameaçadas', icon: '🛡️', description: 'Animais em risco de extinção.', animals: [] },
      { id: 'giants', name: 'Gigantes da natureza', icon: '🐘', description: 'Grandes animais terrestres e marinhos.', animals: [] }
    ],
    updatedAt: new Date().toISOString(),
    zonePositions: {},
    animalZones: {}
  };

  let currentUser = null;
  let allDatabaseAnimals = [];
  const ZOO_DATA = {
    zones: [
      { id: 'savanna', name: 'Savana Africana', icon: '🌾', fauna: '🦒', tone: 'savanna-tone', description: 'Grandes herbívoros, felinos e outras espécies das savanas africanas.', continent: 'África', x: 4, y: 8, w: 42, h: 39 },
      { id: 'asian-forest', name: 'Floresta Asiática', icon: '🌳', fauna: '🐼', tone: 'forest-tone', description: 'Espécies das florestas temperadas e tropicais da Ásia.', continent: 'Ásia', x: 53, y: 6, w: 42, h: 40 },
      { id: 'polar', name: 'Zona Polar', icon: '❄️', fauna: '🐧', tone: 'polar-tone', description: 'Animais adaptados ao gelo, ao frio e aos oceanos polares.', continent: 'Antártida', x: 5, y: 56, w: 39, h: 36 },
      { id: 'ocean', name: 'Aquário', icon: '🌊', fauna: '🐬', tone: 'water-tone', description: 'Peixes, mamíferos marinhos e outras espécies aquáticas.', continent: 'Oceânico', x: 53, y: 54, w: 42, h: 39 },
      { id: 'aviary', name: 'Aviário', icon: '🪶', fauna: '🦜', tone: 'aviary-tone', description: 'Aves de diferentes continentes, habitats e estratégias de voo.', continent: 'Global', x: 29, y: 30, w: 38, h: 36 },
      { id: 'reptiles', name: 'Répteis', icon: '☀️', fauna: '🦎', tone: 'reptile-tone', description: 'Répteis terrestres, arborícolas, aquáticos e fossoriais.', continent: 'Global', x: 57, y: 35, w: 34, h: 35 },
      { id: 'mountains', name: 'Montanhas', icon: '⛰️', fauna: '🐐', tone: 'mountain-tone', description: 'Espécies adaptadas à altitude, ao relevo e a climas extremos.', continent: 'Global', x: 8, y: 34, w: 35, h: 35 },
      { id: 'threatened', name: 'Espécies Ameaçadas', icon: '🛡️', fauna: '🐯', tone: 'custom-tone', description: 'Coleção educativa dedicada às espécies em maior risco.', continent: 'Global', x: 33, y: 59, w: 37, h: 34 }
    ],
    animals: []
  };

  let state = { ...defaultState };
  let enclosureViewMode = 'grid';
  let draftState = null;
  let wizardStep = 1;
  let wizardZones = new Set(['savanna', 'asian-forest', 'polar']);
  let wizardAnimals = new Set([]);
  let dragState = null;

  function defaultZoneForAnimal(animal) {
    const cat = String(animal.class || '').toLowerCase();
    if (cat.includes('ave')) return 'aviary';
    if (cat.includes('peix')) return 'ocean';
    if (cat.includes('rept') || cat.includes('répt')) return 'reptiles';
    const cont = String(animal.continent || '').toLowerCase();
    if (cont.includes('áfric')) return 'savanna';
    if (cont.includes('ásia')) return 'asian-forest';
    if (cont.includes('antár') || cont.includes('árti')) return 'polar';
    return 'savanna';
  }

  async function loadZooState() {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().myZooState) {
        state = { ...defaultState, ...snap.data().myZooState };
        state.animalZones = state.animalZones || {};
        state.zonePositions = state.zonePositions || {};
        state.collections = state.collections || [];
      } else {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            state = { ...defaultState, ...JSON.parse(local) };
            state.animalZones = state.animalZones || {};
            state.zonePositions = state.zonePositions || {};
            await saveZooState();
          } catch (e) {
            state = { ...defaultState };
          }
        } else {
          state = { ...defaultState };
        }
      }
    } catch (err) {
      console.error("Erro ao carregar o Zoo do Firestore:", err);
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try { state = { ...defaultState, ...JSON.parse(local) }; } catch (e) {}
      }
    }
  }

  async function saveZooState() {
    if (!currentUser) return;
    state.updatedAt = new Date().toISOString();
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, { myZooState: state }, { merge: true });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Erro ao guardar o Zoo no Firestore:", err);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  function activeState() { return draftState || state; }
  function getZones(s = activeState()) { return s.zoneIds.map(id => ZOO_DATA.zones.find(z => z.id === id)).filter(Boolean); }
  function getAnimals(s = activeState()) { return s.animalIds.map(id => ZOO_DATA.animals.find(a => a.id === id)).filter(Boolean); }
  function animalsInZone(zoneId, s = activeState()) { return getAnimals(s).filter(a => a.zone === zoneId); }
  function threatenedCount(animals) { return animals.filter(a => ['VU', 'EN', 'CR'].includes(a.status)).length; }
  function uniqueCount(items, field) { return new Set(items.map(item => item[field]).filter(Boolean)).size; }
  function escapeHtml(value = '') { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]); }

  function showView(name) {
    ['welcomeView', 'wizardView', 'zooView'].forEach(id => $('#' + id).classList.add('hidden'));
    $('#' + name).classList.remove('hidden');
  }

  function initialRoute() {
    if (state.created) {
      showView('zooView');
      renderAll();
    } else {
      showView('welcomeView');
    }
  }

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function openModal(title, eyebrow, html) {
    $('#modalTitle').innerHTML = title;
    $('#modalEyebrow').innerHTML = eyebrow;
    $('#modalBody').innerHTML = html;
    const extra = $('#modalHeaderExtra');
    if (extra) extra.innerHTML = '';
    $('#modalBackdrop').classList.remove('hidden');
    $('#modalBackdrop').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    $('#modalBackdrop').classList.add('hidden');
    $('#modalBackdrop').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderWizardZones() {
    $('#wizardZoneChoices').innerHTML = ZOO_DATA.zones.map(zone => `
      <button type="button" class="choice-card ${wizardZones.has(zone.id) ? 'selected' : ''}" data-wizard-zone="${zone.id}">
        <span class="choice-icon">${zone.icon}</span><b>${zone.name}</b><small>${zone.description}</small>
      </button>`).join('');
  }

  function renderWizardAnimals(query = '') {
    const filtered = ZOO_DATA.animals.filter(a => `${a.name} ${a.scientific}`.toLowerCase().includes(query.toLowerCase()));
    $('#wizardAnimalChoices').innerHTML = filtered.map(animal => `
      <button type="button" class="animal-choice ${wizardAnimals.has(animal.id) ? 'selected' : ''}" data-wizard-animal="${animal.id}">
        <img src="${animal.emoji}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
        <span><b>${animal.name}</b><small>${animal.scientific}</small></span>
      </button>`).join('');
    $('#wizardAnimalCount').textContent = `${wizardAnimals.size} selecionado${wizardAnimals.size === 1 ? '' : 's'}`;
  }

  function updateWizardUI() {
    $$('.wizard-step').forEach(step => step.classList.toggle('hidden', Number(step.dataset.step) !== wizardStep));
    $$('.step-list li').forEach((li, index) => {
      li.classList.toggle('active', index + 1 === wizardStep);
      li.classList.toggle('done', index + 1 < wizardStep);
    });
    $('#wizardBackBtn').disabled = wizardStep === 1;
    $('#wizardNextBtn').textContent = wizardStep === 4 ? 'Criar o meu zoo' : 'Continuar';
    $('#wizardFeedback').textContent = '';
    if (wizardStep === 3) renderWizardZones();
    if (wizardStep === 4) renderWizardAnimals($('#wizardAnimalSearch').value);
  }

  function validateWizardStep() {
    if (wizardStep === 1 && !$('#wizardName').value.trim()) return 'Escreve um nome para o zoo.';
    if (wizardStep === 3 && wizardZones.size < 3) return 'Seleciona pelo menos três zonas.';
    if (wizardStep === 3 && wizardZones.size > 6) return 'Seleciona no máximo seis zonas iniciais.';
    if (wizardStep === 4 && wizardAnimals.size < 1) return 'Seleciona pelo menos um animal.';
    return '';
  }

  async function finishWizard() {
    const visibility = $('input[name="visibility"]:checked')?.value || 'private';
    const style = $('input[name="layoutStyle"]:checked')?.value || 'map';
    state = {
      ...defaultState,
      created: true,
      name: $('#wizardName').value.trim(),
      description: $('#wizardDescription').value.trim(),
      icon: $('#wizardIcon').value,
      visibility,
      style,
      zoneIds: [...wizardZones],
      animalIds: [...wizardAnimals],
      featuredAnimalId: [...wizardAnimals][0] || '',
      collections: [
        { id: 'favorites', name: 'Os meus favoritos', icon: '❤️', description: 'As espécies de que mais gosto.', animals: [] },
        { id: 'threatened', name: 'Espécies ameaçadas', icon: '🛡️', description: 'Animais classificados como em perigo.', animals: [...wizardAnimals].filter(id => {
          const a = ZOO_DATA.animals.find(x => x.id === id);
          return a && ['VU', 'EN', 'CR'].includes(a.status);
        }) },
        { id: 'giants', name: 'Gigantes da natureza', icon: '🐘', description: 'Grandes animais terrestres e marinhos.', animals: [] }
      ],
      updatedAt: new Date().toISOString(),
      animalZones: {},
      zonePositions: {}
    };

    state.animalIds.forEach(id => {
      const a = ZOO_DATA.animals.find(x => x.id === id);
      if (a) {
        let matchingZone = [...wizardZones].find(z => z === a.defaultZone);
        state.animalZones[id] = matchingZone || [...wizardZones][0];
        a.zone = state.animalZones[id];
      }
    });

    await saveZooState();
    showView('zooView');
    renderAll();
    toast('O teu zoo foi criado com sucesso.');
  }

  function renderAll() {
    const s = activeState();
    s.animalZones = s.animalZones || {};
    s.zonePositions = s.zonePositions || {};

    ZOO_DATA.animals.forEach(a => {
      a.zone = s.animalZones[a.id] || defaultZoneForAnimal(a);
    });

    const animals = getAnimals(s);
    const zones = getZones(s);
    $('#zooIcon').textContent = s.icon;
    $('#zooName').textContent = s.name;
    $('#zooDescription').textContent = s.description;
    $('#heroSpecies').textContent = `${animals.length} espécies`;
    $('#heroZones').textContent = `${zones.length} zonas`;
    $('#heroContinents').textContent = `${uniqueCount(animals, 'continent')} continentes`;
    $('#heroThreatened').textContent = `${threatenedCount(animals)} ameaçadas`;
    $('#scienceModeToggle').checked = s.scienceMode;
    $('#aboutName').textContent = s.name;
    $('#aboutDescription').textContent = s.description;
    $('#aboutVisibility').textContent = formatDate(s.updatedAt); // wait, visibility is s.visibility, let's fix it!
    $('#aboutVisibility').textContent = visibilityLabel(s.visibility);
    $('#aboutCreator').textContent = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Utilizador';
    $('#aboutCreatedAt').textContent = formatDate(s.createdAt || s.updatedAt);
    $('#lastUpdated').textContent = formatDate(s.updatedAt);
    $('#settingsName').value = s.name;
    $('#settingsDescription').value = s.description;
    $('#settingsVisibility').value = s.visibility;
    renderMap($('#overviewMap'), true);
    renderMap($('#fullMap'), false);
    renderZones($('#overviewZones'), zones.slice(0, 3));
    renderZones($('#allZones'), zones);
    renderAnimals();
    renderFeatured();
    renderQuickStats();
    renderCollections();
    renderStatistics();
    renderAchievements();
    toggleEditUI();
  }

  function visibilityLabel(value) {
    return ({ private: 'Privado', unlisted: 'Não listado', public: 'Público' })[value] || 'Privado';
  }

  function formatDate(value) {
    try { return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)); }
    catch { return 'Agora'; }
  }

  function positionForZone(zone, index, compact) {
    const s = activeState();
    const custom = s.zonePositions?.[zone.id];
    if (custom) return custom;
    return { x: zone.x, y: zone.y, w: zone.w, h: zone.h };
  }

  function renderMap(container, compact) {
    const zones = getZones();
    container.innerHTML = zones.map((zone, index) => {
      const p = positionForZone(zone, index, compact);
      const count = animalsInZone(zone.id).length;
      return `<button type="button" class="map-zone ${zone.tone}" data-zone-id="${zone.id}" style="left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%">
        <span class="zone-label"><b>${zone.name}</b><small>${count} espécie${count === 1 ? '' : 's'}</small></span><span class="zone-fauna">${zone.fauna}</span>
      </button>`;
    }).join('');
    if (!compact && activeState().editMode) enableMapDragging(container);
  }

  function enableMapDragging(container) {
    $$('.map-zone', container).forEach(node => {
      node.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        const rect = container.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        dragState = {
          node,
          zoneId: node.dataset.zoneId,
          rect,
          offsetX: event.clientX - nodeRect.left,
          offsetY: event.clientY - nodeRect.top,
          startX: event.clientX,
          startY: event.clientY,
          hasMoved: false
        };
        node.classList.add('dragging');
        node.setPointerCapture(event.pointerId);
      });
      node.addEventListener('pointermove', event => {
        if (!dragState || dragState.node !== node) return;
        const dist = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
        if (dist > 4) {
          dragState.hasMoved = true;
        }
        const x = Math.max(0, Math.min(100 - parseFloat(node.style.width), ((event.clientX - dragState.rect.left - dragState.offsetX) / dragState.rect.width) * 100));
        const y = Math.max(0, Math.min(100 - parseFloat(node.style.height), ((event.clientY - dragState.rect.top - dragState.offsetY) / dragState.rect.height) * 100));
        node.style.left = `${x}%`;
        node.style.top = `${y}%`;
      });
      node.addEventListener('pointerup', () => {
        if (!dragState || dragState.node !== node) return;
        const s = activeState();
        s.zonePositions ||= {};
        s.zonePositions[dragState.zoneId] = {
          x: parseFloat(node.style.left), y: parseFloat(node.style.top),
          w: parseFloat(node.style.width), h: parseFloat(node.style.height)
        };
        const wasTap = !dragState.hasMoved;
        node.classList.remove('dragging');
        const zId = dragState.zoneId;
        dragState = null;
        if (wasTap) {
          showZone(zId);
        }
      });
    });
  }

  function renderZones(container, zones) {
    container.innerHTML = zones.map(zone => {
      const count = animalsInZone(zone.id).length;
      return `<article class="zone-card">
        <div class="zone-cover ${zone.tone}"><span>${zone.fauna}</span></div>
        <div class="zone-card-content"><h3>${zone.name}</h3><p>${zone.description}</p>
        <div class="zone-card-meta"><span>${count} espécie${count === 1 ? '' : 's'}</span><span>${zone.continent}</span></div>
        <div class="zone-card-actions"><button class="btn btn-secondary" type="button" data-view-zone="${zone.id}">Abrir zona</button><button class="btn btn-ghost edit-only ${activeState().editMode ? '' : 'hidden'}" type="button" data-remove-zone="${zone.id}">Remover</button></div></div>
      </article>`;
    }).join('') || '<p>Ainda não existem zonas.</p>';
  }

  function animalCard(animal) {
    const zone = ZOO_DATA.zones.find(z => z.id === animal.zone);
    return `<article class="animal-card" data-animal-card="${animal.id}">
      <div class="animal-card-visual" style="position:relative;overflow:hidden;display:grid;place-items:center;height:160px;background:#0d0f22;">
        <img src="${animal.photo}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;filter:blur(4px) brightness(0.65);transform:scale(1.15);position:absolute;inset:0;">
        <img src="${animal.emoji}" alt="" style="width:104px;height:104px;object-fit:contain;z-index:2;position:relative;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
      </div>
      <div class="animal-card-body">
        <h3>${animal.name}</h3><small>${animal.scientific}</small>
        <div class="animal-card-meta"><span>${zone?.name || 'Sem zona'}</span><span class="status-badge status-${animal.status}">${animal.status}</span></div>
        <div class="animal-actions"><button class="btn btn-secondary" type="button" data-view-animal="${animal.id}">Ver ficha</button><button class="btn btn-ghost edit-only ${activeState().editMode ? '' : 'hidden'}" type="button" data-remove-animal="${animal.id}">Remover</button></div>
      </div></article>`;
  }

  function renderAnimals() {
    const all = getAnimals();
    const query = ($('#animalSearch').value || '').toLowerCase();
    const classFilter = $('#animalClassFilter').value;
    const statusFilter = $('#animalStatusFilter').value;
    const filtered = all.filter(a => {
      const textMatch = `${a.name} ${a.scientific} ${a.continent}`.toLowerCase().includes(query);
      const classMatch = classFilter === 'all' || a.class === classFilter;
      const statusMatch = statusFilter === 'all' || a.status === statusFilter;
      return textMatch && classMatch && statusMatch;
    });
    $('#allAnimals').innerHTML = filtered.map(animalCard).join('') || '<p>Nenhum animal corresponde aos filtros.</p>';
    $('#recentAnimals').innerHTML = all.slice(-4).reverse().map(animalCard).join('');
  }

  function renderFeatured() {
    const s = activeState();
    const getMs = (a) => {
      if (!a || !a.timestamp) return 0;
      if (typeof a.timestamp.toMillis === 'function') return a.timestamp.toMillis();
      if (a.timestamp instanceof Date) return a.timestamp.getTime();
      return Number(a.timestamp) || 0;
    };
    
    // Sort all database animals by timestamp descending to find the newest
    const sorted = [...ZOO_DATA.animals].sort((a, b) => getMs(b) - getMs(a));
    const animal = sorted[0];

    if (!animal) { $('#featuredAnimal').innerHTML = '<p style="color:#7886a8;text-align:center;padding:20px 0;">Nenhum animal na base de dados.</p>'; return; }
    $('#featuredAnimal').innerHTML = `
      <span class="eyebrow">Último adicionado</span>
      <div class="featured-visual" style="position:relative;overflow:hidden;display:grid;place-items:center;height:200px;background:#0d0f22;border-radius:18px;">
        <img src="${animal.photo}" alt="" style="width:100%;height:100%;object-fit:cover;filter:blur(5px) brightness(0.55);transform:scale(1.15);position:absolute;inset:0;">
        <img src="${animal.emoji}" alt="" style="width:120px;height:120px;object-fit:contain;z-index:2;position:relative;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.65));">
      </div>
      <h3>${animal.name}</h3>
      <div class="scientific-name">${animal.scientific}</div>
      <div class="tag-row"><span class="tag">${animal.class}</span><span class="tag">${animal.continent}</span><span class="tag">${animal.status}</span></div>
      <button class="btn btn-secondary" type="button" data-view-animal="${animal.id}">Ver ficha rápida</button>
    `;
  }

  function renderQuickStats() {
    const animals = getAnimals();
    const values = [
      ['Espécies', animals.length], ['Zonas', getZones().length], ['Ameaçadas', threatenedCount(animals)], ['Continentes', uniqueCount(animals, 'continent')]
    ];
    $('#quickStats').innerHTML = values.map(([label, value]) => `<div class="quick-stat"><b>${value}</b><small>${label}</small></div>`).join('');
  }

  function renderCollections() {
    const s = activeState();
    $('#collectionsGrid').innerHTML = (s.collections || []).map(collection => {
      const count = (collection.animals || []).filter(id => s.animalIds.includes(id)).length;
      return `<article class="collection-card" data-icon="${collection.icon}"><span>${count} espécies</span><h3>${collection.name}</h3><p>${collection.description}</p><button class="btn btn-light" type="button" data-view-collection="${collection.id}">Abrir coleção</button></article>`;
    }).join('');
  }

  function countBy(items, field) {
    return items.reduce((acc, item) => { acc[item[field]] = (acc[item[field]] || 0) + 1; return acc; }, {});
  }

  function renderBars(container, counts) {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...entries.map(([, value]) => value));
    container.innerHTML = entries.map(([label, value]) => `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${(value / max) * 100}%"></div></div><b>${value}</b></div>`).join('') || '<p>Sem dados.</p>';
  }

  function renderStatistics() {
    const animals = getAnimals();
    const metrics = [
      ['Total de espécies', animals.length], ['Classes', uniqueCount(animals, 'class')], ['Países/regiões', uniqueCount(animals, 'country')], ['Ameaçadas', threatenedCount(animals)]
    ];
    $('#statMetrics').innerHTML = metrics.map(([label, value]) => `<article class="metric-card"><span>${label}</span><b>${value}</b></article>`).join('');
    renderBars($('#classBars'), countBy(animals, 'class'));
    renderBars($('#continentBars'), countBy(animals, 'continent'));
    renderBars($('#statusBars'), countBy(animals, 'status'));
    renderBars($('#dietBars'), countBy(animals, 'diet'));
  }

  function renderAchievements() {
    const animals = getAnimals();
    const achievements = [
      { icon: '🌍', name: 'Zoo multicontinental', text: 'Representa cinco continentes ou regiões.', current: uniqueCount(animals, 'continent'), goal: 5 },
      { icon: '🛡️', name: 'Protetor de espécies', text: 'Adiciona dez espécies ameaçadas.', current: threatenedCount(animals), goal: 10 },
      { icon: '📚', name: 'Colecionador dedicado', text: 'Constrói uma coleção com vinte espécies.', current: animals.length, goal: 20 }
    ];
    $('#achievementGrid').innerHTML = achievements.map(a => {
      const done = a.current >= a.goal;
      const pct = Math.min(100, (a.current / a.goal) * 100);
      return `<article class="achievement-card ${done ? '' : 'locked'}"><div class="achievement-icon">${a.icon}</div><div><span class="eyebrow">${done ? 'Concluída' : `${a.current}/${a.goal}`}</span><h3>${a.name}</h3><p>${a.text}</p><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div></article>`;
    }).join('');
  }

  function toggleEditUI() {
    const editing = activeState().editMode;
    $('#editToolbar').classList.toggle('hidden', !editing);
    $('#editModeBtn').classList.toggle('hidden', editing);
    $$('.edit-only').forEach(el => el.classList.toggle('hidden', !editing));
  }

  function switchTab(tabName) {
    $$('.zoo-tabs button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === tabName));
    if (tabName === 'map') renderMap($('#fullMap'), false);
    window.scrollTo({ top: $('.zoo-tabs').offsetTop - 75, behavior: 'smooth' });
  }

  function showAnimal(animalId) {
    const animal = ZOO_DATA.animals.find(a => a.id === animalId);
    if (!animal) return;
    const zone = ZOO_DATA.zones.find(z => z.id === animal.zone);
    openModal(animal.name, animal.scientific, `<div class="modal-animal-detail"><div class="modal-animal-visual" style="position:relative;overflow:hidden;display:grid;place-items:center;height:220px;background:#0d0f22;border-radius:20px;"><img src="${animal.photo}" alt="" style="width:100%;height:100%;object-fit:cover;filter:blur(5px) brightness(0.6);transform:scale(1.15);position:absolute;inset:0;"><img src="${animal.emoji}" alt="" style="width:144px;height:144px;object-fit:contain;z-index:2;position:relative;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.65));"></div><div><div class="tag-row"><span class="tag">${animal.class}</span><span class="tag">${animal.status}</span><span class="tag">${animal.continent}</span></div><div class="detail-list"><div><small>Zona</small><b>${zone?.name || 'Sem zona'}</b></div><div><small>Alimentação</small><b>${animal.diet}</b></div><div><small>Habitat</small><b>${animal.habitat}</b></div><div><small>Atividade/Locomoção</small><b>${animal.activity}</b></div><div><small>Distribuição</small><b>${animal.country}</b></div><div><small>Conservação</small><b>${animal.status}</b></div></div><div class="button-row" style="margin-top:18px;"><a class="btn btn-primary" style="width:100%;white-space:nowrap;padding:12px 14px;font-size:0.9rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;" href="animal.html?id=${animal.id}">Ficha Completa</a></div></div></div>`);
  }

  function enableEnclosureDragging(container, zoneId) {
    $$('.enclosure-circle', container).forEach(node => {
      node.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        const rect = container.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        dragState = {
          node,
          enclosureId: node.dataset.enclosureId,
          rect,
          offsetX: event.clientX - nodeRect.left,
          offsetY: event.clientY - nodeRect.top
        };
        node.classList.add('dragging');
        node.setPointerCapture(event.pointerId);
      });
      node.addEventListener('pointermove', event => {
        if (!dragState || dragState.node !== node) return;
        const x = Math.max(0, Math.min(100 - (120 / dragState.rect.width) * 100, ((event.clientX - dragState.rect.left - dragState.offsetX) / dragState.rect.width) * 100));
        const y = Math.max(0, Math.min(100 - (120 / dragState.rect.height) * 100, ((event.clientY - dragState.rect.top - dragState.offsetY) / dragState.rect.height) * 100));
        node.style.left = `${x}%`;
        node.style.top = `${y}%`;
      });
      node.addEventListener('pointerup', async () => {
        if (!dragState || dragState.node !== node) return;
        const s = activeState();
        const enc = (s.enclosures || []).find(e => e.id === dragState.enclosureId);
        if (enc) {
          enc.x = parseFloat(node.style.left);
          enc.y = parseFloat(node.style.top);
        }
        node.classList.remove('dragging');
        dragState = null;
        if (!draftState) await saveZooState();
      });
    });
  }

  function showZone(zoneId) {
    const zone = ZOO_DATA.zones.find(z => z.id === zoneId);
    if (!zone) return;
    const s = activeState();
    s.enclosures ||= [];
    
    const animals = animalsInZone(zoneId);
    const warning = s.scienceMode && animals.some(a => zone.continent !== 'Global' && zone.continent !== a.continent);
    
    const zoneEnclosures = s.enclosures.filter(e => e.zoneId === zoneId);
    const animalIdsInEnclosures = new Set();
    zoneEnclosures.forEach(e => {
      e.animalIds ||= [];
      e.animalIds.forEach(id => animalIdsInEnclosures.add(id));
    });
    
    const unassignedAnimals = animals.filter(a => !animalIdsInEnclosures.has(a.id));
    const editing = s.editMode;

    const isAquarium = zoneId === 'ocean';
    const labelPlural = isAquarium ? 'Tanques' : 'Recintos';
    const labelSingular = isAquarium ? 'Tanque' : 'Recinto';
    const labelCerca = isAquarium ? 'Tanque' : 'Cerca';
    const labelSemCerca = isAquarium ? 'Soltos / Sem Tanque' : 'Soltos / Sem Cerca';

    let html = `
      <div class="enclosures-section" style="margin-top: 0; padding-top: 0; border-top: 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 style="margin:0;font-size:1.2rem;">Mapa dos ${labelPlural}</h3>
          ${editing ? `<button class="btn btn-primary btn-xs" type="button" data-create-enclosure-zone="${zoneId}">+ Novo ${labelCerca}</button>` : ''}
        </div>
        
        <div class="zone-internal-map ${zone.tone}" id="zoneInternalMap">
          ${zoneEnclosures.map((enc, idx) => {
            const posX = enc.x !== undefined ? enc.x : 20 + (idx * 25) % 60;
            const posY = enc.y !== undefined ? enc.y : 25 + (idx * 20) % 50;
            const encAnimals = enc.animalIds.map(id => ZOO_DATA.animals.find(x => x.id === id)).filter(Boolean);
            return `
              <div class="enclosure-circle" data-enclosure-id="${enc.id}" style="left:${posX}%;top:${posY}%;cursor:${editing ? 'grab' : 'pointer'};">
                <h5>${escapeHtml(enc.name)}</h5>
                <div class="enclosure-circle-animals">
                  ${encAnimals.map(a => `<img class="enclosure-circle-animal-avatar" src="${a.emoji}" title="${a.name}">`).join('') || '<span style="font-size:0.75rem;color:#7886a8;">Vazio</span>'}
                </div>
                ${editing ? `
                  <div class="enclosure-circle-actions">
                    <button class="btn-xs btn-xs-danger" style="font-size:0.6rem;padding:2px 4px;" type="button" data-delete-enclosure="${enc.id}" title="Apagar ${labelSingular.toLowerCase()}">Apagar</button>
                    ${encAnimals.length > 0 ? `<button class="btn-xs btn-xs-secondary" style="font-size:0.6rem;padding:2px 4px;" type="button" data-clear-enclosure-animals="${enc.id}" title="Esvaziar ${labelSingular.toLowerCase()}">Soltar todos</button>` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('') || `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#7886a8;font-size:0.9rem;">Nenhum ${labelSingular.toLowerCase()} construído.</div>`}
        </div>
      </div>

      <div class="zone-cover ${zone.tone}" style="border-radius:18px;height:100px;margin-top:20px;">
        <span>${zone.fauna}</span>
      </div>
      <p style="margin-top: 12px; margin-bottom: 8px;">${zone.description}</p>
      ${warning ? '<p style="background:rgba(245,158,11,0.18);border:1px solid rgba(245,158,11,0.3);padding:10px;border-radius:12px;color:#ffd58f;font-size:0.85rem;margin-bottom:12px;"><b>⚠ Sugestão científica:</b> existem espécies cuja distribuição não corresponde totalmente ao tema desta zona.</p>' : ''}
    `;

    html += `
      <div class="unassigned-section">
        <h3 style="margin:0;font-size:1.1rem;color:#fff;">Animais ${labelSemCerca}</h3>
        <div class="unassigned-animals-list">
          ${unassignedAnimals.map(a => `
            <div class="unassigned-animal-item">
              <div style="display:flex;align-items:center;gap:10px;">
                <img src="${a.emoji}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
                <div class="info">
                  <b>${a.name}</b>
                  <small>${a.scientific}</small>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                ${editing && zoneEnclosures.length > 0 ? `
                  <select class="btn-xs btn-xs-secondary" data-assign-animal-select="${a.id}" style="background:#1d283c;color:#fff;border:1px solid #334460;padding:4px 8px;border-radius:6px;">
                    <option value="">Colocar em ${labelSingular.toLowerCase()}...</option>
                    ${zoneEnclosures.map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('')}
                  </select>
                ` : ''}
                <button class="btn btn-secondary btn-xs" type="button" data-view-animal="${a.id}">Ficha</button>
              </div>
            </div>
          `).join('') || `<p style="color:#7886a8;font-size:0.85rem;margin:8px 0 0 0;">Todos os animais desta zona estão em ${labelPlural.toLowerCase()}.</p>`}
        </div>
      </div>
    `;

    openModal(zone.name, `${animals.length} espécies nesta zona`, html);
    
    // Bind dragging events to circles inside map
    const mapContainer = $('#zoneInternalMap');
    if (mapContainer && editing) {
      enableEnclosureDragging(mapContainer, zoneId);
    }
  }

  function showEnclosure(enclosureId) {
    const s = activeState();
    const enc = (s.enclosures || []).find(e => e.id === enclosureId);
    if (!enc) return;
    const encAnimals = enc.animalIds.map(id => ZOO_DATA.animals.find(x => x.id === id)).filter(Boolean);
    
    const isAquarium = enc.zoneId === 'ocean';
    const labelSingular = isAquarium ? 'tanque' : 'recinto';

    const backBtnHtml = `<button class="btn-ghost" style="padding:0;font-size:0.9rem;display:inline-flex;align-items:center;gap:6px;color:#aeb7ce;border:0;background:transparent;cursor:pointer;" type="button" data-view-zone="${enc.zoneId}"><i class="fa-solid fa-chevron-left"></i> Voltar ao mapa</button>`;

    const togglesHtml = `
      <div class="view-toggle" style="display:flex;gap:4px;background:rgba(255,255,255,0.04);padding:4px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-right:4px;">
        <button class="btn btn-xs ${enclosureViewMode === 'grid' ? 'btn-xs-primary' : 'btn-xs-secondary'}" style="padding:6px 10px;border-radius:6px;cursor:pointer;" type="button" data-toggle-enclosure-view="grid" data-enclosure-id="${enc.id}" title="Vista em Grelha"><i class="fa-solid fa-table-cells"></i></button>
        <button class="btn btn-xs ${enclosureViewMode === 'list' ? 'btn-xs-primary' : 'btn-xs-secondary'}" style="padding:6px 10px;border-radius:6px;cursor:pointer;" type="button" data-toggle-enclosure-view="list" data-enclosure-id="${enc.id}" title="Vista em Lista"><i class="fa-solid fa-list"></i></button>
      </div>
    `;

    let bodyHtml = `
      <div style="margin-bottom:18px;">
        <span style="font-size:0.95rem;color:#aeb7ce;font-weight:700;">Espécies neste ${labelSingular}</span>
      </div>
    `;

    if (enclosureViewMode === 'grid') {
      bodyHtml += `
        <div class="enclosure-animals-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:14px;">
          ${encAnimals.map(a => `
            <div class="animal-card compact" style="margin:0;background:#151833;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;min-height:220px;">
              <div style="height:120px;position:relative;overflow:hidden;display:grid;place-items:center;background:#0d0f22;">
                <img src="${a.photo}" style="width:100%;height:100%;object-fit:cover;filter:blur(4px) brightness(0.65);transform:scale(1.15);position:absolute;inset:0;">
                <img src="${a.emoji}" style="width:86px;height:86px;object-fit:contain;z-index:2;position:relative;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
              </div>
              <div style="padding:10px;display:flex;flex-direction:column;gap:4px;flex-grow:1;justify-content:space-between;">
                <div>
                  <h4 style="font-size:0.95rem;margin:0;color:#fff;font-weight:800;">${a.name}</h4>
                  <small style="font-size:0.75rem;color:#aeb7ce;font-style:italic;display:block;">${a.scientific}</small>
                </div>
                <button class="btn btn-secondary btn-xs" style="width:100%;margin-top:8px;padding:6px;" type="button" data-view-animal="${a.id}">Ver ficha</button>
              </div>
            </div>
          `).join('') || `<p style="grid-column:1/-1;color:#7886a8;text-align:center;margin:20px 0;">Este ${labelSingular} não tem animais.</p>`}
        </div>
      `;
    } else {
      bodyHtml += `
        <div class="modal-list">
          ${encAnimals.map(a => `
            <div class="modal-list-row" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
              <div style="display:flex;align-items:center;gap:12px;">
                <img class="animal-emoji" src="${a.emoji}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">
                <span><b>${a.name}</b><small style="display:block;color:#aeb7ce;font-style:italic">${a.scientific}</small></span>
              </div>
              <button class="btn btn-secondary btn-xs" type="button" data-view-animal="${a.id}">Ver ficha</button>
            </div>
          `).join('') || `<p style="color:#7886a8;text-align:center;margin:20px 0;">Este ${labelSingular} não tem animais.</p>`}
        </div>
      `;
    }

    openModal(enc.name, backBtnHtml, bodyHtml);
    const extra = $('#modalHeaderExtra');
    if (extra) extra.innerHTML = togglesHtml;
  }

  function showCollection(collectionId) {
    const collection = activeState().collections.find(c => c.id === collectionId);
    if (!collection) return;
    const animals = (collection.animals || []).filter(id => activeState().animalIds.includes(id)).map(id => ZOO_DATA.animals.find(a => a.id === id)).filter(Boolean);
    openModal(collection.name, 'Coleção especial', `<p>${collection.description}</p><div class="modal-list">${animals.map(a => `<div class="modal-list-row"><div><img class="animal-emoji" src="${a.emoji}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;"><span><b>${a.name}</b><small style="display:block;color:#aeb7ce;font-style:italic">${a.scientific}</small></span></div><button class="btn btn-secondary" type="button" data-view-animal="${a.id}">Ver ficha</button></div>`).join('') || '<p>Esta coleção ainda não tem animais do zoo.</p>'}</div>`);
  }

  function openAddAnimal() {
    const s = activeState();
    const available = ZOO_DATA.animals.filter(a => !s.animalIds.includes(a.id));
    openModal('Adicionar espécies', 'Base de dados animal', `<div style="margin-bottom:15px;"><input id="modalAnimalSearch" type="search" placeholder="Pesquisar..." style="width:100%;padding:10px;border-radius:10px;"></div><div id="modalAnimalList" class="modal-list">${renderModalAnimalRows(available)}</div>`);

    const searchInput = $('#modalAnimalSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = available.filter(a => `${a.name} ${a.scientific}`.toLowerCase().includes(query));
        $('#modalAnimalList').innerHTML = renderModalAnimalRows(filtered);
      });
    }
  }

  function renderModalAnimalRows(list) {
    return list.map(a => `<div class="modal-list-row"><div><img class="animal-emoji" src="${a.emoji}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;"><span><b>${a.name}</b><small style="display:block;color:#aeb7ce;font-style:italic">${a.scientific}</small></span></div><button class="btn btn-primary" type="button" data-add-animal="${a.id}">Adicionar</button></div>`).join('') || '<p>Nenhuma espécie disponível.</p>';
  }

  function openAddZone() {
    const s = activeState();
    const available = ZOO_DATA.zones.filter(z => !s.zoneIds.includes(z.id));
    openModal('Criar ou adicionar zona', 'Organização do zoo', `<div class="choice-grid">${available.map(z => `<button type="button" class="choice-card" data-add-zone="${z.id}"><span class="choice-icon">${z.icon}</span><b>${z.name}</b><small>${z.description}</small></button>`).join('') || '<p>Todas as zonas predefinidas já foram adicionadas.</p>'}</div><hr style="border:0;border-top:1px solid rgba(255,255,255,0.09);margin:24px 0"><h3>Zona personalizada</h3><label>Nome da zona<input id="customZoneName" type="text" placeholder="Ex.: Animais de Portugal"></label><label>Descrição<textarea id="customZoneDescription" rows="3" placeholder="Descreve o tema desta zona..."></textarea></label><button class="btn btn-primary" type="button" id="createCustomZoneBtn" style="margin-top:14px">Criar zona personalizada</button>`);
  }

  function openNewCollection() {
    openModal('Nova coleção', 'Lista pessoal', `<label>Nome<input id="newCollectionName" type="text" placeholder="Ex.: Animais que quero ver"></label><label>Descrição<textarea id="newCollectionDescription" rows="3"></textarea></label><label>Ícone<select id="newCollectionIcon"><option>⭐</option><option>❤️</option><option>👁️</option><option>🌍</option><option>🛡️</option><option>📚</option></select></label><button id="createCollectionBtn" class="btn btn-primary" type="button" style="margin-top:16px">Criar coleção</button>`);
  }

  function previewPublic() {
    const s = activeState();
    const animals = getAnimals();
    openModal(s.name, 'Pré-visualização pública', `<div style="text-align:center;padding:18px"><div style="font-size:64px">${s.icon}</div><p style="font-size:18px;line-height:1.6">${escapeHtml(s.description)}</p><div class="metric-grid" style="grid-template-columns:repeat(3,1fr);margin-top:20px;"><article class="metric-card"><span>Espécies</span><b>${animals.length}</b></article><article class="metric-card"><span>Zonas</span><b>${getZones().length}</b></article><article class="metric-card"><span>Ameaçadas</span><b>${threatenedCount(animals)}</b></article></div><p style="color:#aeb7ce;margin-top:20px;">Esta é a versão que outros visitantes veriam, sem ferramentas de edição.</p></div>`);
  }

  function enterEditMode() {
    draftState = JSON.parse(JSON.stringify(state));
    draftState.editMode = true;
    renderAll();
    toast('Modo de edição ativado.');
  }

  function cancelEdit() {
    draftState = null;
    renderAll();
    toast('Alterações canceladas.');
  }

  async function saveEdit() {
    if (!draftState) return;
    draftState.editMode = false;
    state = draftState;
    draftState = null;
    await saveZooState();
    renderAll();
    toast('Alterações guardadas no Firestore.');
  }

  document.addEventListener('click', async event => {
    const target = event.target.closest('button, [data-open-tab], .enclosure-circle');
    if (!target) return;

    if (target.classList.contains('enclosure-circle')) {
      if (!activeState().editMode) {
        showEnclosure(target.dataset.enclosureId);
      }
      return;
    }

    if (target.id === 'startWizardBtn') { showView('wizardView'); updateWizardUI(); }
    if (target.id === 'loadDemoBtn') {
      const randomIds = ZOO_DATA.animals.slice(0, 8).map(a => a.id);
      state = {
        ...defaultState,
        created: true,
        animalIds: randomIds,
        featuredAnimalId: randomIds[0] || ''
      };
      state.animalIds.forEach(id => {
        const a = ZOO_DATA.animals.find(x => x.id === id);
        if (a) state.animalZones[id] = defaultZoneForAnimal(a);
      });
      await saveZooState();
      showView('zooView');
      renderAll();
    }
    if (target.id === 'wizardBackBtn') { wizardStep = Math.max(1, wizardStep - 1); updateWizardUI(); }
    if (target.id === 'wizardNextBtn') {
      const error = validateWizardStep();
      if (error) { $('#wizardFeedback').textContent = error; return; }
      if (wizardStep < 4) { wizardStep += 1; updateWizardUI(); } else finishWizard();
    }
    if (target.dataset.wizardZone) {
      const id = target.dataset.wizardZone;
      wizardZones.has(id) ? wizardZones.delete(id) : wizardZones.add(id);
      renderWizardZones();
    }
    if (target.dataset.wizardAnimal) {
      const id = target.dataset.wizardAnimal;
      wizardAnimals.has(id) ? wizardAnimals.delete(id) : wizardAnimals.add(id);
      renderWizardAnimals($('#wizardAnimalSearch').value);
    }
    if (target.dataset.tab) switchTab(target.dataset.tab);
    if (target.dataset.openTab) switchTab(target.dataset.openTab);
    if (target.dataset.viewAnimal) showAnimal(target.dataset.viewAnimal);
    if (target.dataset.viewZone) showZone(target.dataset.viewZone);
    if (target.dataset.toggleEnclosureView) {
      enclosureViewMode = target.dataset.toggleEnclosureView;
      showEnclosure(target.dataset.enclosureId);
    }
    if (target.dataset.zoneId && !activeState().editMode) showZone(target.dataset.zoneId);
    if (target.dataset.viewCollection) showCollection(target.dataset.viewCollection);
    if (target.id === 'editModeBtn') enterEditMode();
    if (target.id === 'cancelEditBtn') cancelEdit();
    if (target.id === 'saveEditBtn') saveEdit();
    if (target.id === 'previewBtn') previewPublic();
    if (target.id === 'shareBtn') {
      if (navigator.share) {
        navigator.share({ title: state.name, text: state.description, url: window.location.href }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast('Link do zoo copiado!');
      }
    }
    if (['addAnimalBtn'].includes(target.id)) openAddAnimal();
    if (['addZoneBtn', 'addZoneFromMapBtn'].includes(target.id)) openAddZone();
    if (target.id === 'addCollectionBtn') openNewCollection();
    if (target.id === 'closeModalBtn') closeModal();
    if (target.dataset.setFeatured) { activeState().featuredAnimalId = target.dataset.setFeatured; closeModal(); renderAll(); toast('Animal em destaque atualizado.'); }
    if (target.dataset.addAnimal) {
      const aId = target.dataset.addAnimal;
      activeState().animalIds.push(aId);
      const aObj = ZOO_DATA.animals.find(x => x.id === aId);
      if (aObj) activeState().animalZones[aId] = defaultZoneForAnimal(aObj);
      closeModal();
      renderAll();
      toast('Espécie adicionada ao zoo.');
    }
    if (target.dataset.addZone) { activeState().zoneIds.push(target.dataset.addZone); closeModal(); renderAll(); toast('Zona adicionada.'); }
    if (target.dataset.removeAnimal) { activeState().animalIds = activeState().animalIds.filter(id => id !== target.dataset.removeAnimal); renderAll(); toast('Animal removido do zoo.'); }
    if (target.dataset.removeZone) {
      const count = animalsInZone(target.dataset.removeZone).length;
      if (count) { toast('Move ou remove primeiro os animais desta zona.'); return; }
      activeState().zoneIds = activeState().zoneIds.filter(id => id !== target.dataset.removeZone); renderAll(); toast('Zona removida.');
    }
    if (target.id === 'createCustomZoneBtn') {
      const name = $('#customZoneName').value.trim();
      if (!name) return toast('Escreve um nome para a zona.');
      const id = `custom-${Date.now()}`;
      ZOO_DATA.zones.push({ id, name, icon: '🌿', fauna: '🦋', tone: 'custom-tone', description: $('#customZoneDescription').value.trim() || 'Zona personalizada pelo utilizador.', continent: 'Personalizada', x: 30, y: 30, w: 35, h: 34 });
      activeState().zoneIds.push(id); closeModal(); renderAll(); toast('Zona personalizada criada.');
    }
    if (target.id === 'createCollectionBtn') {
      const name = $('#newCollectionName').value.trim();
      if (!name) return toast('Escreve um nome para a coleção.');
      activeState().collections.push({ id: `collection-${Date.now()}`, name, description: $('#newCollectionDescription').value.trim() || 'Coleção pessoal.', icon: $('#newCollectionIcon').value, animals: [] });
      closeModal(); renderAll(); toast('Coleção criada.');
    }
    if (target.dataset.deleteEnclosure) {
      const encId = target.dataset.deleteEnclosure;
      const s = activeState();
      const enc = (s.enclosures || []).find(e => e.id === encId);
      const zId = enc ? enc.zoneId : '';
      s.enclosures = (s.enclosures || []).filter(e => e.id !== encId);
      if (!draftState) await saveZooState();
      if (zId) showZone(zId);
      toast(zId === 'ocean' ? 'Tanque removido.' : 'Recinto removido.');
    }
    if (target.dataset.removeAnimalEnclosure) {
      const aId = target.dataset.removeAnimalEnclosure;
      const s = activeState();
      let zId = '';
      (s.enclosures || []).forEach(e => {
        if ((e.animalIds || []).includes(aId)) {
          zId = e.zoneId;
          e.animalIds = e.animalIds.filter(id => id !== aId);
        }
      });
      if (!draftState) await saveZooState();
      if (zId) showZone(zId);
      toast(zId === 'ocean' ? 'Animal libertado do tanque.' : 'Animal libertado do recinto.');
    }
    if (target.dataset.clearEnclosureAnimals) {
      const encId = target.dataset.clearEnclosureAnimals;
      const s = activeState();
      const enc = (s.enclosures || []).find(e => e.id === encId);
      if (enc) {
        enc.animalIds = [];
        if (!draftState) await saveZooState();
        showZone(enc.zoneId);
        toast(enc.zoneId === 'ocean' ? 'Todos os animais foram libertados deste tanque.' : 'Todos os animais foram libertados deste recinto.');
      }
    }
    if (target.dataset.createEnclosureZone) {
      const zId = target.dataset.createEnclosureZone;
      const isAquarium = zId === 'ocean';
      const name = prompt(isAquarium ? "Nome do novo tanque:" : "Nome do novo recinto/cerca:");
      if (name && name.trim()) {
        const s = activeState();
        s.enclosures ||= [];
        s.enclosures.push({
          id: `enclosure-${Date.now()}`,
          name: name.trim(),
          zoneId: zId,
          animalIds: []
        });
        if (!draftState) await saveZooState();
        showZone(zId);
        toast(isAquarium ? 'Tanque criado.' : 'Recinto criado.');
      }
    }
  });

  document.addEventListener('change', async event => {
    const target = event.target;
    if (target && target.dataset.assignAnimalSelect) {
      const aId = target.dataset.assignAnimalSelect;
      const encId = target.value;
      if (!encId) return;
      const s = activeState();
      s.enclosures ||= [];
      s.enclosures.forEach(e => {
        e.animalIds = (e.animalIds || []).filter(id => id !== aId);
      });
      const dest = s.enclosures.find(e => e.id === encId);
      if (dest) {
        dest.animalIds ||= [];
        dest.animalIds.push(aId);
      }
      if (!draftState) await saveZooState();
      const animal = ZOO_DATA.animals.find(a => a.id === aId);
      if (animal) showZone(animal.zone);
      const isAquarium = animal && animal.zone === 'ocean';
      toast(isAquarium ? 'Animal colocado no tanque.' : 'Animal colocado no recinto.');
    }
  });

  const searchInput = $('#wizardAnimalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', event => renderWizardAnimals(event.target.value));
  }

  ['animalSearch', 'animalClassFilter', 'animalStatusFilter'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener('input', renderAnimals);
  });

  const scienceToggle = $('#scienceModeToggle');
  if (scienceToggle) {
    scienceToggle.addEventListener('change', async event => {
      activeState().scienceMode = event.target.checked;
      if (!draftState) await saveZooState();
      toast(event.target.checked ? 'Alertas científicos ativados.' : 'Alertas científicos desativados.');
    });
  }

  const saveSettings = $('#saveSettingsBtn');
  if (saveSettings) {
    saveSettings.addEventListener('click', async () => {
      state.name = $('#settingsName').value.trim() || state.name;
      state.description = $('#settingsDescription').value.trim();
      state.visibility = $('#settingsVisibility').value;
      await saveZooState(); renderAll(); toast('Definições guardadas.');
    });
  }

  const resetZoo = $('#resetZooBtn');
  if (resetZoo) {
    resetZoo.addEventListener('click', async () => {
      if (confirm("Tens a certeza que queres apagar todo o teu Zoo?")) {
        state = { ...defaultState, created: false };
        draftState = null;
        await saveZooState();
        showView('welcomeView');
        toast('Dados do Zoo limpos.');
      }
    });
  }

  // Radio button styling toggle
  const layoutStyleRadios = $$('input[name="layoutStyle"]');
  layoutStyleRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      $$('.style-option').forEach(option => {
        option.classList.toggle('selected', option.contains($('input[name="layoutStyle"]:checked')));
      });
    });
  });

  $('#modalBackdrop').addEventListener('click', event => { if (event.target === $('#modalBackdrop')) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

  onAuthStateChanged(auth, async user => {
    if (!user) {
      location.href = `login.html?redirect=${encodeURIComponent(location.href)}`;
      return;
    }
    currentUser = user;

    try {
      // 1. Fetch real animals from database
      const querySnapshot = await getDocs(collection(db, "animais"));
      allDatabaseAnimals = [];
      querySnapshot.forEach(docSnap => {
        allDatabaseAnimals.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Populate filter dropdown with unique classes (categories)
      const classes = [...new Set(allDatabaseAnimals.map(a => getFirstActiveCategory(a.categoria)).filter(Boolean))];
      const classFilterSelect = $('#animalClassFilter');
      if (classFilterSelect) {
        classFilterSelect.innerHTML = `<option value="all">Todas as classes</option>` + classes.map(c => `<option value="${translateCategory(c)}">${translateCategory(c)}</option>`).join('');
      }

      // Map to frontend ZOO_DATA.animals structure
      ZOO_DATA.animals = allDatabaseAnimals.map(a => {
        const categoryTranslated = translateCategory(getFirstActiveCategory(a.categoria));
        const sciName = a.nomeCientifico || '—';
        return {
          id: a.id,
          name: a.nome || 'Sem nome',
          scientific: sciName,
          photo: a.imagemUrl || 'assets/placeholder.png',
          emoji: getAnimalMiniEmojiUrl(sciName),
          class: categoryTranslated,
          continent: getAnimalContinent(a),
          status: getAnimalStatus(a),
          diet: getAnimalDiet(a),
          habitat: getAnimalHabitat(a),
          activity: getAnimalActivity(a),
          country: getAnimalCountry(a),
          timestamp: a.timestamp,
          defaultZone: defaultZoneForAnimal({ class: categoryTranslated, continent: getAnimalContinent(a) })
        };
      });

      // Load initial Wizard animals recommendation
      wizardAnimals = new Set(ZOO_DATA.animals.slice(0, 3).map(a => a.id));

      // 2. Fetch User's Zoo State
      await loadZooState();

      // Hide loading screen
      $('#zoo-loading')?.classList.add('hidden');

      initialRoute();
    } catch (err) {
      console.error(err);
      // Hide loading overlay and show error message
      const loaderContent = $('#zoo-loading .loader-content');
      if (loaderContent) {
        loaderContent.innerHTML = `
          <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; color: #ef4444;"></i>
          <p style="margin-top: 15px; font-weight: 700; color: #ef4444;">Erro ao carregar os dados. Recarregue a página.</p>
        `;
      }
      toast('Erro ao carregar o Zoo.');
    }
  });

})();

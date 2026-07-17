(function initLanguagesForm() {
    const rowsContainer = document.getElementById('idiomasRows');
    const emptyMessage = document.getElementById('idiomasEmpty');
    const addButton = document.getElementById('addIdiomaBtn');
    if (!rowsContainer || !emptyMessage || !addButton) return;
    const codeNames = { af:'África do Sul', an:'Aragão', ar:'Países árabes', arz:'Egipto', bg:'Bulgária', br:'Brasil', ca:'Catalunha', ceb:'Filipinas', cs:'Chéquia', da:'Dinamarca', de:'Alemanha', el:'Grécia', en:'Reino Unido', es:'Espanha', et:'Estónia', eu:'País Basco', fa:'Irão', fi:'Finlândia', fr:'França', ga:'Irlanda', gl:'Galiza', he:'Israel', hi:'Índia', hr:'Croácia', hu:'Hungria', id:'Indonésia', is:'Islândia', it:'Itália', ja:'Japão', ka:'Geórgia', ko:'Coreia do Sul', lt:'Lituânia', lv:'Letónia', ms:'Malásia', nl:'Países Baixos', no:'Noruega', pl:'Polónia', pt:'Portugal', ro:'Roménia', ru:'Rússia', sk:'Eslováquia', sl:'Eslovénia', sr:'Sérvia', sv:'Suécia', sw:'Tanzânia', th:'Tailândia', tr:'Turquia', uk:'Ucrânia', ur:'Paquistão', vi:'Vietname', zh:'China', zu:'África do Sul' };
    const countryFromCode = code => codeNames[String(code || '').toLowerCase()] || String(code || '').toUpperCase();
    const updateEmptyState = () => { emptyMessage.hidden = rowsContainer.children.length > 0; };
    function addRow(item = {}) {
        const row = document.createElement('tr');
        row.innerHTML = '<td><input type="text" class="idioma-pais" placeholder="Ex.: Portugal"></td><td><input type="text" class="idioma-nome" placeholder="Nome do animal"></td><td><button type="button" class="remove-idioma-btn" title="Remover linha" aria-label="Remover linha">&times;</button></td>';
        row.querySelector('.idioma-pais').value = item.pais || item.country || '';
        row.querySelector('.idioma-nome').value = item.nome || item.name || '';
        row.querySelector('.remove-idioma-btn').addEventListener('click', () => { row.remove(); updateEmptyState(); });
        rowsContainer.appendChild(row); updateEmptyState();
    }
    function setData(items = []) { rowsContainer.innerHTML = ''; const normalized = Array.isArray(items) ? items : Object.entries(items || {}).map(([pais, nome]) => ({ pais, nome })); normalized.forEach(addRow); updateEmptyState(); }
    function getData() { return [...rowsContainer.querySelectorAll('tr')].map(row => ({ pais: row.querySelector('.idioma-pais')?.value.trim() || '', nome: row.querySelector('.idioma-nome')?.value.trim() || '' })).filter(item => item.pais && item.nome); }
    function mergeImported(items = []) {
        const existing = getData(); const seen = new Set(existing.map(item => (item.pais + '|' + item.nome).toLocaleLowerCase('pt-PT')));
        (Array.isArray(items) ? items : []).forEach(item => { const pais = item.pais || item.country || countryFromCode(item.code); const nome = item.nome || item.name || item.label; if (!pais || !nome) return; const key = (pais + '|' + nome).toLocaleLowerCase('pt-PT'); if (!seen.has(key)) { addRow({ pais, nome }); seen.add(key); } });
    }
    addButton.addEventListener('click', () => addRow());
    window.getIdiomasData = getData; window.setIdiomasData = setData; window.mergeImportedIdiomas = mergeImported; window.countryNameFromWikidataCode = countryFromCode;
    window.applyImportedTaxonomySupplemental = data => {
        if (!data) return;
        mergeImported(data.idiomas || []);
        const getCuriosidades = typeof getCuriosidadesData === 'function' ? getCuriosidadesData : window.getCuriosidadesData;
        const setCuriosidades = typeof setCuriosidadesData === 'function' ? setCuriosidadesData : window.setCuriosidadesData;
        if (typeof getCuriosidades !== 'function' || typeof setCuriosidades !== 'function') return;
        const current = getCuriosidades();
        const known = new Set(current.filter(item => item.tipo === 'Também conhecido como').map(item => String(item.valor || '').trim().toLocaleLowerCase('pt-PT')));
        (Array.isArray(data.alsoKnownAs) ? data.alsoKnownAs : []).forEach(value => { const text = String(value || '').trim(); if (text && !known.has(text.toLocaleLowerCase('pt-PT'))) { current.push({ tipo: 'Também conhecido como', valor: text, genero: 'MF', fase: 'Adulto' }); known.add(text.toLocaleLowerCase('pt-PT')); } });
        setCuriosidades(current, { useDefaults: false });
    };
})();
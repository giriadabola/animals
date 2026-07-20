(function() {
    const topTabBtns = document.querySelectorAll('.top-level-tab-btn');
    const panelParametros = document.querySelector('.form-header-fields');
    const panelParametrosTabs = document.querySelector('.form-tabs-wrapper');
    const panelRodape = document.getElementById('top-tabpanel-rodape');
    const panelFeed = document.getElementById('top-tabpanel-feed');
    const panelVideos = document.getElementById('videosFieldset');
    
    topTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.topTab;
            topTabBtns.forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            
            if (tab === 'parametros') {
                panelParametros.style.display = 'grid';
                panelParametrosTabs.style.display = 'block';
                panelRodape.style.display = 'none';
                panelFeed.style.display = 'none';
                if (panelVideos) panelVideos.style.display = '';
            } else if (tab === 'rodape') {
                panelParametros.style.display = 'none';
                panelParametrosTabs.style.display = 'none';
                panelRodape.style.display = 'flex';
                panelFeed.style.display = 'none';
                if (panelVideos) panelVideos.style.display = 'none';
                updateRodapeParametersList();
            } else {
                panelParametros.style.display = 'none';
                panelParametrosTabs.style.display = 'none';
                panelRodape.style.display = 'none';
                panelFeed.style.display = 'block';
                if (panelVideos) panelVideos.style.display = 'none';
            }
        });
    });

    const selectedRodapeParams = new Set();

    window.getSelectedRodapeParams = function() {
        return Array.from(selectedRodapeParams);
    };

    window.setSelectedRodapeParams = function(params) {
        selectedRodapeParams.clear();
        if (Array.isArray(params)) {
            params.forEach(p => selectedRodapeParams.add(p));
        }
        updateRodapeParametersList();
    };

    function getDisplayValue(item) {
        if (!item) return '';
        if (item.valor) return item.valor;
        if (item.detalhe) return item.detalhe;
        if (item.texto) return item.texto;
        if (item.valorMin || item.valorMax) {
            const min = item.valorMin || '';
            const max = item.valorMax || '';
            const unit = item.unidade || '';
            if (min && max) return `${min}-${max} ${unit}`.trim();
            return `${min || max} ${unit}`.trim();
        }
        if (item.animais && item.animais.length) {
            return item.animais.map(a => a.nome || a.id).join(', ');
        }
        return '';
    }

    function updateRodapeParametersList() {
        const listContainer = document.getElementById('rodapeParametersList');
        if (!listContainer) return;

        let items = [];
        try {
            if (typeof readCurrentStatisticItems === 'function') {
                items = readCurrentStatisticItems();
            }
        } catch(e) {
            console.error(e);
        }

        if (!items || items.length === 0) {
            listContainer.innerHTML = `<p style="color: var(--text-secondary); font-style: italic;">Nenhum parâmetro preenchido em "Parâmetros".</p>`;
            return;
        }

        const uniqueParams = new Map();
        items.forEach(item => {
            if (!item) return;
            const label = item.tipo || item.type || item.label || item.categoria || '';
            const val = getDisplayValue(item);
            if (label && val) {
                uniqueParams.set(label, val);
            }
        });

        if (uniqueParams.size === 0) {
            listContainer.innerHTML = `<p style="color: var(--text-secondary); font-style: italic;">Nenhum parâmetro preenchido em "Parâmetros".</p>`;
            return;
        }

        listContainer.innerHTML = '';
        uniqueParams.forEach((val, label) => {
            const isChecked = selectedRodapeParams.has(label);
            
            const row = document.createElement('div');
            row.className = 'rodape-parameter-row';

            const info = document.createElement('div');
            info.className = 'rodape-parameter-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'rodape-parameter-name';
            nameSpan.textContent = label;

            const valSpan = document.createElement('span');
            valSpan.className = 'rodape-parameter-value';
            valSpan.textContent = val;

            info.appendChild(nameSpan);
            info.appendChild(valSpan);

            const toggleLabel = document.createElement('label');
            toggleLabel.style.display = 'inline-flex';
            toggleLabel.style.alignItems = 'center';
            toggleLabel.style.cursor = 'pointer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'rodape-parameter-checkbox';
            checkbox.checked = isChecked;
            
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (selectedRodapeParams.size >= 10) {
                        alert('Pode selecionar no máximo 10 parâmetros.');
                        checkbox.checked = false;
                        return;
                    }
                    selectedRodapeParams.add(label);
                } else {
                    selectedRodapeParams.delete(label);
                }
            });

            toggleLabel.appendChild(checkbox);
            row.appendChild(info);
            row.appendChild(toggleLabel);
            listContainer.appendChild(row);
        });
    }
})();

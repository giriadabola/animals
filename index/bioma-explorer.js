const biomaData = {
    terrestres: [
        { title: 'Floresta tropical', img: 'assets/capas/biomas_capas/01_floresta_tropical.png' },
        { title: 'Floresta temperada', img: 'assets/capas/biomas_capas/02_floresta_temperada.png' },
        { title: 'Floresta boreal / Taiga', img: 'assets/capas/biomas_capas/03_floresta_boreal_taiga.png' },
        { title: 'Savana', img: 'assets/capas/biomas_capas/04_savana.png' },
        { title: 'Pradaria / Campos temperados', img: 'assets/capas/biomas_capas/05_pradaria_campos_temperados.png' },
        { title: 'Estepe', img: 'assets/capas/biomas_capas/06_estepe.png' },
        { title: 'Deserto', img: 'assets/capas/biomas_capas/07_deserto.png' },
        { title: 'Tundra', img: 'assets/capas/biomas_capas/08_tundra.png' },
        { title: 'Chaparral / Matagal mediterrânico', img: 'assets/capas/biomas_capas/09_chaparral_matagal_mediterranico.png' },
        { title: 'Montanha / Alpino', img: 'assets/capas/biomas_capas/10_montanha_alpino.png' },
        { title: 'Polar / Gelo', img: 'assets/capas/biomas_capas/11_polar_gelo.png' }
    ],
    aquaticos: [
        { title: 'Marinho', img: 'assets/capas/biomas_capas/12_marinho.png' },
        { title: 'Oceânico', img: 'assets/capas/biomas_capas/13_oceanico.png' },
        { title: 'Costeiro', img: 'assets/capas/biomas_capas/14_costeiro.png' },
        { title: 'Recife de coral', img: 'assets/capas/biomas_capas/15_recife_de_coral.png' },
        { title: 'Estuário', img: 'assets/capas/biomas_capas/16_estuario.png' },
        { title: 'Manguezal / Mangal', img: 'assets/capas/biomas_capas/17_manguezal_mangal.png' },
        { title: 'Água doce', img: 'assets/capas/biomas_capas/18_agua_doce.png' },
        { title: 'Rio', img: 'assets/capas/biomas_capas/19_rio.png' },
        { title: 'Lago', img: 'assets/capas/biomas_capas/20_lago.png' },
        { title: 'Pântano / Zona húmida', img: 'assets/capas/biomas_capas/21_pantano_zona_humida.png' }
    ],
    transicao: [
        { title: 'Manguezal', img: 'assets/capas/biomas_capas/22_manguezal_entre_terra_e_mar.png', query: 'Manguezal' },
        { title: 'Estuário', img: 'assets/capas/biomas_capas/23_estuario_agua_doce_e_salgada.png', query: 'Estuário' },
        { title: 'Zona húmida', img: 'assets/capas/biomas_capas/24_zona_humida_pantanos_charcos_turfeiras.png', query: 'Pântano' },
        { title: 'Ecossistema urbano', img: 'assets/capas/biomas_capas/25_ecossistema_urbano.png', query: 'Fauna urbana' },
        { title: 'Cavernas', img: 'assets/capas/biomas_capas/26_cavernas.png', query: 'Caverna' }
    ]
};

export function initBiomaExplorer() {
    const biomaExplorerCard = document.getElementById('biomaExplorerCard');
    const biomaPreviewTitle = document.getElementById('biomaPreviewTitle');
    const biomaExploreLink = document.getElementById('biomaExploreLink');
    const biomaListPane = document.getElementById('biomaListPane');
    const biomaTabButtons = document.querySelectorAll('.bioma-tab-btn');

    if (!biomaListPane) return;

    function selectBioma(item) {
        if (biomaExplorerCard) {
            biomaExplorerCard.style.backgroundImage = `url('${item.img}')`;
            biomaExplorerCard.style.setProperty('--bioma-bg-position', item.pos || '78% center');
            biomaExplorerCard.style.setProperty('--bioma-bg-position-mobile', item.mobilePos || '72% center');
        }
        if (biomaPreviewTitle) {
            biomaPreviewTitle.textContent = item.title;
        }
        if (biomaExploreLink) {
            const queryValue = item.query || item.title;
            biomaExploreLink.href = `filtros.html?tipo=bioma&valor=${encodeURIComponent(queryValue)}`;
        }
    }

    function renderBiomaTab(tabKey) {
        biomaListPane.innerHTML = '';
        const items = biomaData[tabKey] || [];
        
        items.forEach((item, index) => {
            const queryValue = item.query || item.title;
            const itemEl = document.createElement('div');
            itemEl.className = `bioma-item ${index === 0 ? 'active' : ''}`;
            itemEl.innerHTML = `
                <div class="bioma-item-left">
                    <span class="bioma-item-dot"></span>
                    <span class="bioma-item-title">${item.title}</span>
                </div>
                <button type="button" class="bioma-item-mobile-link" data-href="filtros.html?tipo=bioma&valor=${encodeURIComponent(queryValue)}">
                    <span>Ver animais deste bioma</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            `;

            const mobileLinkEl = itemEl.querySelector('.bioma-item-mobile-link');
            if (mobileLinkEl) {
                mobileLinkEl.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const href = mobileLinkEl.dataset.href;
                    if (href) {
                        window.location.href = href;
                    }
                });
            }
            
            itemEl.addEventListener('mouseenter', () => {
                document.querySelectorAll('.bioma-item').forEach(el => el.classList.remove('active'));
                itemEl.classList.add('active');
                selectBioma(item);
            });

            itemEl.addEventListener('click', (event) => {
                if (event.target.closest('.bioma-item-mobile-link')) return;
                document.querySelectorAll('.bioma-item').forEach(el => el.classList.remove('active'));
                itemEl.classList.add('active');
                selectBioma(item);
            });

            biomaListPane.appendChild(itemEl);
        });

        if (items.length > 0) {
            selectBioma(items[0]);
        }
    }

    biomaTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            biomaTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBiomaTab(btn.dataset.tab);
        });
    });

    // Inicializar biomas com aba terrestres
    renderBiomaTab('terrestres');
}

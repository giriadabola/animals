(function initFeedTab() {
    const panel = document.getElementById('top-tabpanel-feed');
    if (!panel) return;

    const groups = [
        {
            key: 'coluna1',
            title: 'Coluna 1 · Imagem e classificação',
            description: 'Elementos de identificação e navegação do animal.',
            items: [
                ['imagem', 'Imagem principal', 'Imagem e controlos multimédia do animal.'],
                ['pageNav', 'Barra de navegação da página', 'Menu de atalhos rápidos (Geral, Medidas, etc.) no topo da página.'],
                ['classificacao', 'Classificação científica', 'Reino, filo, classe, ordem, família e restantes níveis.'],
                ['subespecies', 'Subespécies / animal-pai', 'Ligação a animais dos quais este é subespécie.'],
                ['relacionados', 'Animais relacionados', 'Animais da mesma subfamília ou tribo.']
            ]
        },
        {
            key: 'coluna2',
            title: 'Coluna 2 · Informação do animal',
            description: 'Secções de texto, galeria, ecologia e distribuição.',
            items: [
                ['galeria', 'Galeria', 'Fotografias carregadas do iNaturalist.'],
                ['geral', 'Informação geral', 'Descrição e informação geral.'],
                ['dimensoes', 'Dimensões', 'Medidas e dimensões do animal.'],
                ['alimentacao', 'Alimentação', 'Alimentação e estratégias alimentares.'],
                ['ecologia', 'Ecologia', 'Habitat, relações ecológicas e função ecológica.'],
                ['reproducao', 'Reprodução', 'Reprodução, acasalamento e desenvolvimento.'],
                ['plumagem', 'Plumagem / revestimento', 'Plumagem, pelo, pele, escamas ou exoesqueleto.'],
                ['distribuicao', 'Distribuição', 'Mapa, regiões e países de distribuição.'],
                ['curiosidades', 'Curiosidades', 'Estado de conservação, comunicação e outros dados.']
            ]
        },
        {
            key: 'coluna3',
            title: 'Coluna 3 · Modelos visuais',
            description: 'Modelos visuais e informação ambiental.',
            items: [
                ['modelos', 'Modelos visuais', 'Cartões de informação, medidas e dimensões.'],
                ['ambiente', 'Ambiente', 'Clima, bioma, habitat e ambiente do animal.']
            ]
        }
    ];

    const defaults = {
        feedEnabled: true
    };
    groups.forEach(group => group.items.forEach(([key]) => { defaults[key] = true; }));
    const values = { ...defaults };

    function render() {
        panel.innerHTML = `
            <div class="feed-intro-card">
                <div class="feed-intro-icon"><i class="fa-solid fa-rss" aria-hidden="true"></i></div>
                <div>
                    <h3>Feed da página do animal</h3>
                    <p>Escolhe as secções que aparecem neste animal. As alterações ficam guardadas no Firebase quando gravares o formulário.</p>
                </div>
            </div>
            <div class="feed-master-card" style="margin-bottom: 24px;">
                <label class="feed-switch-row" for="feed-feedEnabled" style="background: var(--bg-card, #13192e); border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none;">
                    <span class="feed-switch-copy"><strong style="font-size: 1.1rem; color: #ffffff;">Exibir Feed na Página do Animal</strong><small style="display: block; color: rgba(226, 232, 240, 0.65); margin-top: 4px;">Ativar ou desativar a exibição do bloco de modelos visuais (abas Geral, Medidas e Dimensões) na página de detalhes do animal.</small></span>
                    <input class="feed-switch-input" type="checkbox" id="feed-feedEnabled" data-feed-section="feedEnabled" ${values.feedEnabled !== false ? 'checked' : ''}>
                    <span class="feed-switch-ui" aria-hidden="true"><span></span></span>
                </label>
            </div>
            <div class="feed-groups">
                ${groups.map(group => `
                    <section class="feed-column-card" aria-labelledby="feed-${group.key}-title">
                        <div class="feed-column-heading">
                            <div><h4 id="feed-${group.key}-title">${group.title}</h4><p>${group.description}</p></div>
                            <span class="feed-column-badge">${group.items.length} secções</span>
                        </div>
                        <div class="feed-switch-list">
                            ${group.items.map(([key, label, description]) => `
                                <label class="feed-switch-row" for="feed-${key}">
                                    <span class="feed-switch-copy"><strong>${label}</strong><small>${description}</small></span>
                                    <input class="feed-switch-input" type="checkbox" id="feed-${key}" data-feed-section="${key}" ${values[key] ? 'checked' : ''}>
                                    <span class="feed-switch-ui" aria-hidden="true"><span></span></span>
                                </label>`).join('')}
                        </div>
                    </section>`).join('')}
            </div>
        `;

        panel.querySelectorAll('[data-feed-section]').forEach(input => {
            input.addEventListener('change', () => {
                values[input.dataset.feedSection] = input.checked;
            });
        });
    }

    window.getFeedSectionsData = () => ({ ...values });
    window.setFeedSectionsData = (data = {}) => {
        Object.keys(defaults).forEach(key => {
            values[key] = data[key] !== false;
        });
        render();
    };

    render();
})();
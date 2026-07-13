// Extensão 2026-07: novos parâmetros científicos e modelos visuais únicos.
(function initAdvancedScientificParameters(){
    const iconByType = {
      'Duração do mergulho':'fa-stopwatch','Percentagem de gordura corporal':'fa-percent','Espessura da camada de gordura':'fa-layer-group','Número de fases do ciclo de vida':'fa-diagram-project','Tempo à superfície':'fa-water','Tempo de recuperação entre mergulhos':'fa-heart-pulse','Frequência de mergulho':'fa-arrow-down-up-across-line','Organização social':'fa-people-group','Construção de local de repouso':'fa-house','Autoinfeção':'fa-rotate','Tipo de perceção':'fa-eye','Alcance de deteção':'fa-satellite-dish','Taxa de emissão de sinais':'fa-wave-square','Presença/ausência de sistema digestivo':'fa-stomach','Lado corporal da estrutura':'fa-left-right','Forma da estrutura':'fa-shapes','Capacidade de regeneração':'fa-arrows-rotate','Mecanismo de ingestão':'fa-utensils','Tipo de hospedeiro':'fa-person-shelter','Localização no hospedeiro':'fa-location-dot','Tipo de parasita':'fa-bug','Periculosidade':'fa-triangle-exclamation','Tipo de toxina':'fa-flask-vial','Via de administração da toxina':'fa-syringe','Antídoto disponível':'fa-kit-medical','Propriedade óptica da coloração':'fa-wand-magic-sparkles','Mudança dinâmica de cor':'fa-palette','Padrão das manchas':'fa-circle-dot','Sistema social reprodutivo':'fa-people-roof','Armazenamento de esperma':'fa-box-archive','Implantação embrionária':'fa-seedling'
    };
    const dedicatedVisualLabels = new Set([
      'Duração do mergulho',
      'Percentagem de gordura corporal',
      'Espessura da camada de gordura',
      'Tempo à superfície',
      'Tempo de recuperação entre mergulhos',
      'Frequência de mergulho',
      'Alcance de deteção',
      'Taxa de emissão de sinais',
      'Organização social',
      'Autoinfeção',
      'Construção de local de repouso',
      'Presença/ausência de sistema digestivo',
      'Lado corporal da estrutura',
      'Forma da estrutura',
      'Tipo de perceção',
      'Capacidade de regeneração',
      'Cornos, hastes e protuberâncias',
      'Cristas, pregas, bolsas e expansões',
      'Estruturas produtoras de seda, muco ou secreções',
      'Estruturas elétricas, luminosas e térmicas'
    ]);
    window.formAdvancedParameterIcons = iconByType;
    function applyUniqueVisuals(root=document) {
      root.querySelectorAll?.('.dimension-model-card, .plumage-model-card, .metric-model-card, .visual-model-card').forEach(card => {
        const label = card.querySelector('.dimension-model-label, .plumage-model-label, .metric-model-label, .visual-model-label')?.textContent?.trim();
        const icon = iconByType[label];
        if (!icon || dedicatedVisualLabels.has(label) || card.dataset.advancedVisualApplied === '1') return;
        const figure = card.querySelector('.dimension-model-icon, .plumage-model-figure, .metric-model-icon, .visual-model-icon');
        if (figure) {
          figure.innerHTML = `<span class="advanced-parameter-unique-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>`;
          figure.setAttribute('aria-label', `Modelo visual de ${label}`);
        }
        card.dataset.advancedVisualApplied='1';
      });
    }
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === 1) applyUniqueVisuals(node);
    })));
    observer.observe(document.body,{subtree:true,childList:true});
    applyUniqueVisuals();
    document.documentElement.dataset.advancedScientificParameters='ready';
    document.dispatchEvent(new CustomEvent('form:advanced-parameters-ready',{detail:{count:Object.keys(iconByType).length}}));
})();

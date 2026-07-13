// Revestimento corporal dinâmico por categoria
        function normalizeBodyCoveringCategory(value = '') {
            const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
            const aliases = {
                aves: 'Aves', mamiferos: 'Mamiferos', peixes: 'Peixes', moluscos: 'Moluscos',
                crustaceos: 'Crustaceos', aracnideos: 'Aracnideos', vermes: 'Vermes',
                repteis: 'Repteis', anfibios: 'Anfibios', insetos: 'Insetos', microscopicos: 'Microscopicos'
            };
            return aliases[normalized] || 'Microscopicos';
        }

        function getSelectedBodyCoveringCategoryValue() {
            return (typeof getSelectedCategory === 'function' ? getSelectedCategory() : '')
                || document.querySelector('.categoria-checkbox:checked')?.value
                || document.getElementById('categoria')?.value
                || '';
        }

        function hasSelectedBodyCoveringCategory() {
            return String(getSelectedBodyCoveringCategoryValue() || '').trim() !== '';
        }

        function getActiveBodyCoveringCategory() {
            const selected = getSelectedBodyCoveringCategoryValue();
            return normalizeBodyCoveringCategory(selected || 'Aves');
        }

        function getActiveBodyCoveringConfig() {
            return getBodyCoveringConfig(getActiveBodyCoveringCategory());
        }

        function getPlumageOptions(group = '') {
            const config = getActiveBodyCoveringConfig();
            return config.options[group] || [];
        }

        function fillBodyCoveringGroupSelect(select, selectedValue = '') {
            const config = getActiveBodyCoveringConfig();
            const entries = Object.entries(config.groups);
            select.innerHTML = entries.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
            select.value = entries.some(([value]) => value === selectedValue) ? selectedValue : (entries[0]?.[0] || 'revestimento');
        }

        function fillPlumageTypeSelect(select, group = '', selectedValue = '') {
            const options = [...getPlumageOptions(group)].sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && options.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe uma opção</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — personalizado</option>` : '');
            select.value = selectedValue;
        }

        function getPlumageVisualMeta(type = '', group = '') {
            const config = getActiveBodyCoveringConfig();
            return {
                label: type || 'Modelo visual',
                groupLabel: config.groups[group] || config.title,
                icon: bodyCoveringIconMap[type] || (String(group).startsWith('cor_') || group === 'cor' ? 'fa-palette' : config.icon),
                description: bodyCoveringDescriptions[type] || `Característica de ${config.title.toLowerCase()}.`
            };
        }


        function escapeBodyCoveringSvgText(value = '') {
            return String(value || '').replace(/[&<>"']/g, char => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[char]));
        }

        function getBodyCoveringModelColors(type = '', group = '') {
            const normalized = String(type || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const namedColors = {
                preto: '#20242d', branco: '#f4f2ea', cinzento: '#8a9099', castanho: '#8a5a3b', bege: '#d8c3a5',
                amarelo: '#f4c542', laranja: '#e8792e', vermelho: '#d94b4b', rosa: '#dd7fa5', verde: '#4f9d69',
                azul: '#3978c5', roxo: '#7554a8', dourado: '#d8aa34', translucida: '#9fd8dc', translucido: '#9fd8dc',
                incolor: '#dfe8ea', multicolor: '#9a6bd2', metalica: '#84919f', iridescente: '#7a8fe8'
            };
            const direct = namedColors[normalized];
            if (direct) return { primary: direct, secondary: normalized === 'branco' ? '#b9bec7' : '#ffffff', accent: '#6d4aff' };
            let hash = 0;
            for (const char of `${group}:${type}`) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
            const hue = Math.abs(hash) % 360;
            return {
                primary: `hsl(${hue} 64% 43%)`,
                secondary: `hsl(${(hue + 42) % 360} 70% 63%)`,
                accent: `hsl(${(hue + 205) % 360} 72% 48%)`
            };
        }

        function renderBodyCoveringSvg(type = '', group = '', extraClass = '', selectedColor = '') {
            const label = escapeBodyCoveringSvgText(type || 'Revestimento corporal');
            const n = String(type || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const g = String(group || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const colorSource = selectedColor || (g === 'cor' || g.startsWith('cor_') ? type : '');
            const modelColors = getBodyCoveringModelColors(colorSource || type, group);
            const start = `<svg class="body-covering-custom-svg ${extraClass}" style="color:${modelColors.primary} !important" viewBox="0 0 64 64" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">`;
            let art = '';
            if (g === 'cor' || g.startsWith('cor_')) {
                if (g.includes('penas_ornamentais')) {
                    art = `<path d="M12 50c8-22 20-35 39-38-2 19-12 34-31 40Z"/><path d="m17 47 29-30M24 39l-8-2m17-8-8-5"/><path d="M45 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('plumagem')) {
                    art = `<path d="M15 49c5-20 15-33 34-38 1 18-9 32-34 38Z"/><path d="m19 45 25-29M27 36l-8-1m16-9-7-4"/><circle cx="49" cy="47" r="6" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('pelagem')) {
                    art = `<path d="M15 51c4-24 11-39 17-39s13 15 17 39"/><path d="M20 50c7-13-4-24 5-37M31 50c7-14-4-25 5-38M42 50c6-12-3-22 4-34"/><circle cx="50" cy="47" r="6" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('escamas')) {
                    art = `<path d="M11 19h39v27H11Z"/><path d="M11 26c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 15 0M11 35c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 15 0M11 44c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 15 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('pele')) {
                    art = `<path d="M10 24c9-12 35-12 44 0v17c-9 12-35 12-44 0Z"/><path d="M16 29c8-4 24-4 32 0M16 38c8-4 24-4 32 0"/><circle cx="50" cy="48" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('carapaca')) {
                    art = `<path d="M10 42c2-18 10-28 22-28s20 10 22 28Z"/><path d="M15 35h34M22 19v23M32 14v28M42 19v23"/><circle cx="51" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('exoesqueleto')) {
                    art = `<path d="M19 18c7-8 19-8 26 0l6 15-7 18H20l-7-18Z"/><path d="M32 13v38M17 29h30M19 42h26"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('concha')) {
                    art = `<path d="M10 46c2-22 14-34 30-32 13 2 18 13 12 24-6 10-18 14-42 8Z"/><path d="M38 21c8 0 13 6 10 13-3 6-11 9-17 5-5-3-5-10-1-14 4-3 9-2 12 2"/><circle cx="51" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('manto')) {
                    art = `<path d="M18 48c-3-17 2-31 14-38 12 7 17 21 14 38-8 5-20 5-28 0Z"/><path d="M23 49l-5 7M30 50l-2 7M37 50l2 7M44 49l5 7"/><circle cx="51" cy="18" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('barbatanas')) {
                    art = `<path d="M12 35c9-13 24-17 39-8-8 3-13 9-15 18-7-8-15-11-24-10Z"/><path d="M37 24 32 10c8 2 13 7 16 14M37 44l-3 11c7-2 12-6 15-12"/><circle cx="52" cy="50" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('asas')) {
                    art = `<path d="M31 48C15 44 8 33 12 17c10 4 17 12 20 23M33 48c16-4 23-15 19-31-10 4-17 12-20 23"/><path d="M18 25l12 17M46 25 34 42"/><circle cx="52" cy="51" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('ventre')) {
                    art = `<path d="M20 13c-7 12-8 28-2 39h28c6-11 5-27-2-39-7 5-17 5-24 0Z"/><path d="M23 27c6 4 12 4 18 0M21 39c7 4 15 4 22 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('dorso')) {
                    art = `<path d="M10 43c8-20 18-30 22-30s14 10 22 30"/><path d="M16 39c10-8 22-8 32 0M22 29c7-5 13-5 20 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('cabeca')) {
                    art = `<circle cx="31" cy="31" r="18"/><path d="M19 21 14 12l12 5M43 21l5-9-12 5M24 34h1M38 34h1M26 43c4 3 8 3 12 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('membros')) {
                    art = `<path d="M20 12v25c0 8-4 12-9 15M44 12v25c0 8 4 12 9 15M20 29h24M25 52h-14M39 52h14"/><circle cx="52" cy="17" r="5" fill="currentColor" stroke="none"/>`;
                } else if (g.includes('cauda')) {
                    art = `<path d="M14 18c18 1 30 9 34 23 2 8-4 14-12 11-7-3-9-11-5-17 3-5 9-6 14-3"/><path d="M14 18c7 5 12 11 15 18"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                } else {
                    art = `<path d="M12 23c10-12 30-12 40 0v18c-10 11-30 11-40 0Z"/><circle cx="51" cy="49" r="6" fill="currentColor" stroke="none"/>`;
                }
            } else if (n === 'penugem') {
                art = `<path d="M18 43c-5-2-7-8-4-12 2-4 6-5 10-3-1-6 3-11 9-11 5 0 9 3 10 8 5-1 10 3 10 9 0 6-5 10-11 10H20"/>`;
            } else if (n.includes('juvenil')) {
                art = `<path d="M32 10c10 8 15 17 15 27 0 9-6 16-15 16s-15-7-15-16c0-10 5-19 15-27Z"/><path d="M23 29h18M21 38h22M26 47h12"/>`;
            } else if (n.includes('adulta')) {
                art = `<path d="M16 51c4-19 13-34 32-40 2 18-8 34-32 40Z"/><path d="m19 47 25-30M27 37l-8-1m16-9-7-4m14-1-5-6"/>`;
            } else if (n.includes('nupcial')) {
                art = `<path d="M32 52C14 39 13 26 21 22c5-3 9 0 11 5 2-5 6-8 11-5 8 4 7 17-11 30Z"/><path d="M32 27v17M25 35h14"/>`;
            } else if (n.includes('eclipse')) {
                art = `<circle cx="29" cy="30" r="15"/><path d="M39 19a15 15 0 1 0 0 22M17 50c9-4 20-4 30 0"/>`;
            } else if (n.includes('inverno')) {
                art = `<path d="M32 10v44M13 21l38 22M51 21 13 43M21 13l22 38M43 13 21 51"/><circle cx="32" cy="32" r="5"/>`;
            } else if (n.includes('verao')) {
                art = `<circle cx="32" cy="32" r="10"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/>`;
            } else if (n.includes('remiges')) {
                art = `<path d="M13 48c8-22 20-34 39-37-3 18-12 33-30 41Z"/><path d="m18 48 28-31M25 38l-9-1m17-8-9-4m17-1-6-7"/>`;
            } else if (n.includes('retrizes')) {
                art = `<path d="M31 52 15 15c10 4 16 12 18 25M32 52 27 11c9 7 12 17 9 29M33 52 43 14c7 9 7 19 1 30M34 52l17-30c3 10 0 19-9 27"/><circle cx="33" cy="53" r="3"/>`;
            } else if (n.includes('tectrizes')) {
                art = `<path d="M11 27c5-9 12-14 20-14 0 9-4 16-11 22Z"/><path d="M28 26c5-9 12-14 20-14 0 9-4 16-11 22Z"/><path d="M19 44c5-9 12-14 20-14 0 9-4 16-11 22Z"/><path d="M36 43c5-9 12-14 20-14 0 9-4 16-11 22Z"/>`;
            } else if (n.includes('semiplumas')) {
                art = `<path d="M17 51c4-19 12-34 30-40 3 17-5 33-30 40Z"/><path d="m20 48 24-32M27 37c-6 3-9 6-10 10M34 28c-5 1-9 4-12 8M39 21c4 1 8 3 11 6"/>`;
            } else if (n.includes('filoplumas')) {
                art = `<path d="M32 53c0-19 2-31 7-42M24 53c1-14 0-23-3-31M42 53c-1-13 1-22 4-29"/><circle cx="39" cy="11" r="3"/><circle cx="36" cy="19" r="2"/>`;
            } else if (n.includes('cerdas')) {
                art = `<path d="m16 52 9-38M28 53l5-42M40 53V15M52 51l-5-33"/><circle cx="25" cy="14" r="2"/><circle cx="33" cy="11" r="2"/><circle cx="40" cy="15" r="2"/><circle cx="47" cy="18" r="2"/>`;
            } else if (g === 'manchas') {
                const pattern = n;
                const base = `<path d="M10 19c8-7 36-7 44 0v26c-8 7-36 7-44 0Z"/>`;
                if (pattern.includes('tigrado')) art = `${base}<path d="M17 19l5 26M28 18l3 28M40 18l-2 28M49 20l-5 24"/>`;
                else if (pattern.includes('reticulado')) art = `${base}<path d="M14 24h36M14 33h36M14 42h36M20 19v26M32 18v28M44 19v26"/>`;
                else if (pattern.includes('anel') || pattern.includes('ocelo')) art = `${base}<circle cx="22" cy="29" r="6"/><circle cx="22" cy="29" r="2"/><circle cx="41" cy="37" r="7"/><circle cx="41" cy="37" r="2.5"/>`;
                else if (pattern.includes('roseta')) art = `${base}<path d="M18 30c3-6 9-6 12 0-3 6-9 6-12 0ZM35 38c3-7 10-7 13 0-3 7-10 7-13 0Z"/><circle cx="24" cy="30" r="1.5" fill="currentColor" stroke="none"/><circle cx="41.5" cy="38" r="1.5" fill="currentColor" stroke="none"/>`;
                else if (pattern.includes('marmoreado') || pattern.includes('mesclado') || pattern.includes('merle')) art = `${base}<path d="M14 28c8-8 12 8 20 0s12 8 17 0M13 39c7-7 12 7 19 0s13 7 20 0"/>`;
                else if (pattern.includes('sela')) art = `${base}<path d="M18 20c3 8 3 16 0 24M46 20c-3 8-3 16 0 24M18 31h28"/>`;
                else if (pattern.includes('tricolor') || pattern.includes('arlequim') || pattern.includes('tartaruga')) art = `${base}<path d="M10 31h44M31 19v26M19 31l12-12M33 45l11-14"/>`;
                else art = `${base}<circle cx="20" cy="28" r="3" fill="currentColor" stroke="none"/><circle cx="33" cy="23" r="2.5" fill="currentColor" stroke="none"/><circle cx="43" cy="35" r="4" fill="currentColor" stroke="none"/><circle cx="27" cy="41" r="2" fill="currentColor" stroke="none"/>`;
            } else if (g.includes('escama')) {
                art = `<path d="M13 18h38v28H13Z"/><path d="M13 25c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 14 0M13 34c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 14 0M13 43c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 14 0"/>`;
            } else if (g.includes('pelo') || g.includes('pelagem')) {
                art = `<path d="M15 52c4-25 12-40 17-40s13 15 17 40"/><path d="M20 51c8-13-5-24 5-38M31 51c8-14-5-25 5-39M42 51c7-12-4-22 4-35"/>`;
            } else if (g.includes('pele') || g.includes('revestimento')) {
                art = `<path d="M11 23c10-12 32-12 42 0v18c-10 12-32 12-42 0Z"/><path d="M15 29c9-6 25-6 34 0M15 38c9-6 25-6 34 0"/><circle cx="22" cy="33" r="2"/><circle cx="39" cy="42" r="2"/>`;
            } else if (g.includes('concha')) {
                art = `<path d="M10 47c2-23 14-36 31-34 14 2 19 14 13 26-6 11-19 15-44 8Z"/><path d="M39 21c9 0 14 7 11 14-3 7-12 10-19 6-6-4-6-12-1-16 4-4 10-3 13 1 2 4 0 8-4 9-3 1-6-1-6-4"/><path d="M10 48h43"/>`;
            } else if (g.includes('carapaca') || g.includes('exoesqueleto')) {
                art = `<path d="M11 33c0-14 9-22 21-22s21 8 21 22v17H11Z"/><path d="M11 33h42M18 17c4 6 8 9 14 9s10-3 14-9M22 20v30M32 26v24M42 20v30"/><circle cx="19" cy="31" r="2"/><circle cx="45" cy="31" r="2"/>`;
            } else if (g.includes('estrutura') || g.includes('extern')) {
                art = `<circle cx="32" cy="32" r="9"/><path d="M32 23V8M32 56V41M23 32H8M56 32H41M26 26 15 15M49 49 38 38M49 15 38 26M26 38 15 49"/>`;
            } else {
                art = `<path d="M14 45c6-20 16-31 36-34-1 18-11 31-36 34Z"/><path d="m18 42 27-27"/>`;
            }
            return `${start}${art}</svg>`;
        }

        function createPlumageRow(group = '', type = '', detail = '', extra = {}) {
            const config = getActiveBodyCoveringConfig();
            const defaultGroup = config.groups[group] ? group : (Object.keys(config.groups)[0] || 'revestimento');
            const row = document.createElement('div');
            row.className = 'plumage-row';

            const groupSelect = document.createElement('select');
            groupSelect.className = 'plumage-group';
            fillBodyCoveringGroupSelect(groupSelect, defaultGroup);

            const typeSelect = document.createElement('select');
            typeSelect.className = 'plumage-type';
            fillPlumageTypeSelect(typeSelect, groupSelect.value, type);

            const detailControl = document.createElement('div');
            detailControl.className = 'plumage-detail-control';

            const metaControls = document.createElement('div');
            metaControls.className = 'plumage-meta-controls';
            metaControls.innerHTML = `
                <div class="plumage-icon-toggle-group plumage-gender-toggle" aria-label="Sexo">
                    <button type="button" class="plumage-icon-toggle" data-gender="M" title="Macho" aria-label="Macho"><span aria-hidden="true">♂</span></button>
                    <button type="button" class="plumage-icon-toggle" data-gender="F" title="Fêmea" aria-label="Fêmea"><span aria-hidden="true">♀</span></button>
                </div>
                <div class="plumage-icon-toggle-group plumage-phase-toggle" aria-label="Fase de vida">
                    <button type="button" class="plumage-icon-toggle" data-phase="Adulto" title="Adulto" aria-label="Adulto"><i class="fa-solid fa-paw" aria-hidden="true"></i></button>
                    <button type="button" class="plumage-icon-toggle" data-phase="Cria" title="Cria" aria-label="Cria"><i class="fa-solid fa-baby" aria-hidden="true"></i></button>
                </div>`;

            const genderButtons = [...metaControls.querySelectorAll('[data-gender]')];
            const phaseButtons = [...metaControls.querySelectorAll('[data-phase]')];
            const initialGender = String(extra.genero || 'MF').toUpperCase();
            genderButtons.forEach(button => {
                const value = button.dataset.gender;
                button.classList.toggle('is-active', initialGender === 'MF' || initialGender === value);
                button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false');
                button.addEventListener('click', () => {
                    button.classList.toggle('is-active');
                    if (!genderButtons.some(item => item.classList.contains('is-active'))) button.classList.add('is-active');
                    genderButtons.forEach(item => item.setAttribute('aria-pressed', item.classList.contains('is-active') ? 'true' : 'false'));
                    updatePlumagePreview();
                });
            });
            const initialPhase = extra.fase === 'Cria' ? 'Cria' : 'Adulto';
            phaseButtons.forEach(button => {
                button.classList.toggle('is-active', button.dataset.phase === initialPhase);
                button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false');
                button.addEventListener('click', () => {
                    phaseButtons.forEach(item => {
                        item.classList.toggle('is-active', item === button);
                        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
                    });
                    updatePlumagePreview();
                });
            });

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn plumage-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.setAttribute('aria-label', 'Remover modelo');
            removeBtn.title = 'Apagar modelo';

            function rebuildDetailControl() {
                detailControl.innerHTML = '';
                const isSpots = groupSelect.value === 'manchas';
                if (isSpots) {
                    const colorSelect = document.createElement('select');
                    colorSelect.className = 'plumage-detail plumage-spot-color';
                    colorSelect.innerHTML = `<option value="">Cor das manchas</option>` + bodyCoveringColorOptions.map(color => `<option value="${color}">${color}</option>`).join('');
                    colorSelect.value = extra.cor || detail || '';
                    colorSelect.addEventListener('change', updatePlumagePreview);
                    detailControl.appendChild(colorSelect);
                } else {
                    const detailInput = document.createElement('input');
                    detailInput.type = 'text';
                    detailInput.className = 'plumage-detail';
                    detailInput.placeholder = 'Detalhe curto ou padrão observado...';
                    detailInput.value = detail || '';
                    detailInput.addEventListener('input', updatePlumagePreview);
                    detailControl.appendChild(detailInput);
                }
            }

            groupSelect.addEventListener('change', () => {
                fillPlumageTypeSelect(typeSelect, groupSelect.value);
                rebuildDetailControl();
                updatePlumagePreview();
            });
            typeSelect.addEventListener('change', updatePlumagePreview);
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (plumageRowsContainer.children.length === 0) createPlumageRow();
                updatePlumagePreview();
            });

            row.append(groupSelect, typeSelect, detailControl, metaControls, removeBtn);
            plumageRowsContainer.appendChild(row);
            rebuildDetailControl();
            updatePlumagePreview();
        }

        function getPlumageData() {
            return [...plumageRowsContainer.querySelectorAll('.plumage-row')].map(row => {
                const grupo = row.querySelector('.plumage-group')?.value || '';
                const tipo = row.querySelector('.plumage-type')?.value || '';
                const detailEl = row.querySelector('.plumage-detail');
                const detalhe = String(detailEl?.value || '').trim();
                const genderButtons = [...row.querySelectorAll('[data-gender].is-active')].map(button => button.dataset.gender);
                const genero = genderButtons.length === 2 ? 'MF' : (genderButtons[0] || 'MF');
                const fase = row.querySelector('[data-phase].is-active')?.dataset.phase || 'Adulto';
                return grupo === 'manchas'
                    ? { grupo, tipo, detalhe: detalhe ? `Cor: ${detalhe}` : '', cor: detalhe, genero, fase }
                    : { grupo, tipo, detalhe, genero, fase };
            }).filter(item => item.detalhe);
        }

        function setPlumageData(items = []) {
            plumageRowsContainer.innerHTML = '';
            if (!Array.isArray(items) || items.length === 0) {
                createPlumageRow();
                return;
            }
            items.forEach(item => {
                if (item.grupo === 'cor') {
                    const config = getActiveBodyCoveringConfig();
                    item = { ...item, grupo: Object.keys(config.groups).find(key => key.startsWith('cor_')) || 'cor' };
                }
                const inferredColor = item.cor || (item.grupo === 'manchas' ? String(item.detalhe || '').replace(/^Cor:\s*/i, '') : '');
                createPlumageRow(item.grupo || '', item.tipo || '', item.grupo === 'manchas' ? '' : (item.detalhe || ''), { cor: inferredColor, genero: item.genero || 'MF', fase: item.fase || 'Adulto' });
            });
            updatePlumagePreview();
        }

        function renderPlumageModelCard(item, isSuggestion = false) {
            const group = item.grupo || item.group || '';
            const type = item.tipo || item;
            const meta = getPlumageVisualMeta(type, group);
            const detail = item.grupo === 'manchas' ? [item.tipo, item.cor ? `Cor: ${item.cor}` : ''].filter(Boolean).join(' · ') : (item.detalhe || meta.description);
            return `
                <article class="plumage-model-card${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="plumage-model-figure body-covering-icon body-covering-${String(type).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')}">
                        ${renderBodyCoveringSvg(type, group, '', item.cor || '')}
                    </div>
                    <div class="plumage-model-copy">
                        <div class="plumage-model-label">${meta.label}</div>
                        <div class="plumage-model-value">${detail}</div>
                        <div class="plumage-model-meta">${meta.groupLabel}<span class="plumage-model-symbols">${item.genero === 'M' ? '♂' : item.genero === 'F' ? '♀' : '♂♀'} <i class="fa-solid ${item.fase === 'Cria' ? 'fa-baby' : 'fa-paw'}" aria-hidden="true"></i></span></div>
                    </div>
                </article>`;
        }

        function updateBodyCoveringInterface(resetRows = false) {
            const config = getActiveBodyCoveringConfig();
            const tab = document.getElementById('tab-btn-plumagem');
            const panel = document.getElementById('tabpanel-plumagem');
            const hasCategory = hasSelectedBodyCoveringCategory();

            if (!hasCategory) {
                if (tab) tab.style.display = 'none';
                if (panel) panel.style.display = 'none';
                return;
            }

            if (panel) panel.style.display = '';
            if (tab) {
                tab.style.display = 'inline-block';
                tab.title = config.title;
                tab.setAttribute('aria-label', config.title);
                tab.innerHTML = `<i class="fa-solid ${config.icon}"></i>`;
            }
            panel?.setAttribute('data-covering-category', getActiveBodyCoveringCategory());
            document.querySelectorAll('[data-body-covering-title]').forEach(el => el.textContent = config.title);
            const summaryLabel = document.querySelector('label[for="infoPlumagem"]');
            if (summaryLabel) summaryLabel.textContent = `${config.title} — resumo textual`;
            const summary = document.getElementById('infoPlumagem');
            if (summary) summary.placeholder = `Descreve a ${config.title.toLowerCase()}, cores, padrões, textura e alterações sazonais...`;
            const hint = document.getElementById('bodyCoveringHint');
            if (hint) hint.innerHTML = `Adiciona características próprias de <strong>${config.title}</strong>. Cada opção tem um modelo visual exclusivo.`;
            const add = document.getElementById('addPlumageBtn');
            if (add) add.innerHTML = '+ Adicionar modelo';
            if (resetRows) {
                const old = getPlumageData();
                const compatible = old.filter(item => config.groups[item.grupo]);
                setPlumageData(compatible);
            } else {
                [...plumageRowsContainer.querySelectorAll('.plumage-row')].forEach(row => {
                    const group = row.querySelector('.plumage-group');
                    const type = row.querySelector('.plumage-type');
                    const oldGroup = group?.value || '';
                    const oldType = type?.value || '';
                    fillBodyCoveringGroupSelect(group, oldGroup);
                    fillPlumageTypeSelect(type, group.value, oldType);
                });
            }
            updatePlumagePreview();
        }

        function updatePlumagePreview() {
            const selected = getPlumageData();
            const config = getActiveBodyCoveringConfig();
            const firstGroup = Object.keys(config.groups)[0];
            const firstType = config.options[firstGroup]?.[0] || '';
            const hero = selected[0] || { grupo: firstGroup, tipo: firstType };
            const heroMeta = getPlumageVisualMeta(hero.tipo, hero.grupo);
            if (plumageHeroImage) {
                plumageHeroImage.style.display = 'none';
                const holder = plumageHeroImage.parentElement;
                if (holder) holder.innerHTML = renderBodyCoveringSvg(hero.tipo, hero.grupo, 'body-covering-hero-icon', hero.cor || '');
            }
            plumageHeroTitle.textContent = heroMeta.label || config.title;
            plumageHeroText.textContent = hero.grupo === 'manchas' ? [hero.tipo, hero.cor ? `Cor: ${hero.cor}` : ''].filter(Boolean).join(' · ') : (selected[0]?.detalhe || heroMeta.description);
            const eyebrow = document.querySelector('.plumage-hero-copy > span');
            if (eyebrow) eyebrow.textContent = `Modelo visual de ${config.title.toLowerCase()}`;

            if (selected.length) {
                previewPlumageModels.innerHTML = selected.map(item => renderPlumageModelCard(item)).join('');
                return;
            }

            const suggestions = [];
            Object.entries(config.options).forEach(([group, options]) => options.slice(0, 3).forEach(tipo => suggestions.push({ grupo: group, tipo })));
            previewPlumageModels.innerHTML = suggestions.slice(0, 8).map(item => renderPlumageModelCard(item, true)).join('');
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
            updateRecordDuplicateWarning();
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

        function getEditModalSourceAnimals() {
            const source = [];
            const seen = new Set();
            const addAnimal = (animal) => {
                if (!animal?.id || seen.has(animal.id)) return;
                seen.add(animal.id);
                source.push(animal);
            };

            if (Array.isArray(editModalAnimals)) editModalAnimals.forEach(addAnimal);
            if (Array.isArray(allAnimals)) allAnimals.forEach(addAnimal);
            return source;
        }

        function getAnimalQualityLevel(animal = {}) {
            return normalizeQualityLevel(animal.nivelQualidade || animal.qualidadeRegisto?.nivel || animal.qualidadeRegisto?.id || 'basico');
        }

        function getEditFilteredAnimals() {
            const normalizedSearchTerm = normalizeString(editSearchInput.value.trim());
            return getEditModalSourceAnimals().filter(animal => {
                const matchesSearch = !normalizedSearchTerm ||
                    normalizeString(animal.nome).includes(normalizedSearchTerm) ||
                    normalizeString(animal.nomeCientifico).includes(normalizedSearchTerm);
                const matchesQuality = !activeEditQualityFilter || getAnimalQualityLevel(animal) === activeEditQualityFilter;
                return matchesSearch && matchesQuality;
            });
        }

        function renderCategoryWithQuality(animal, catDisplay) {
            const qualityLevel = getAnimalQualityLevel(animal);
            const qualityMeta = getQualityLevelMeta(qualityLevel);
            const categoryText = catDisplay || 'Sem categoria';
            return `<span class="edit-category-text">${categoryText}</span><span class="quality-mini-icon ${qualityMeta.className}" title="${qualityMeta.label}" aria-label="${qualityMeta.label}"><i class="${qualityMeta.icon}"></i></span>`;
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
                        <div class="categoria edit-item-category-line">${renderCategoryWithQuality(animal, catDisplay)}</div>
                    </div>
                    <button class="edit-item-btn" data-id="${animal.id}">Editar</button>`;
                editListContainer.appendChild(item);
            });
        }

        function refreshEditList() {
            populateEditList(getEditFilteredAnimals());
        }

        let editModalFullSearchLoaded = false;
        let editModalFullSearchPromise = null;
        let editModalSearchDebounceTimer = null;

        function mergeAnimalsIntoEditCache(animals = []) {
            if (!Array.isArray(animals) || !animals.length) return;
            if (!Array.isArray(editModalAnimals)) editModalAnimals = [];
            if (!Array.isArray(allAnimals)) allAnimals = [];

            const upsert = (list, animal) => {
                if (!animal?.id) return;
                const index = list.findIndex(item => item.id === animal.id);
                if (index >= 0) {
                    list[index] = { ...list[index], ...animal };
                } else {
                    list.push(animal);
                }
            };

            animals.forEach(animal => {
                upsert(editModalAnimals, animal);
                upsert(allAnimals, animal);
            });
        }

        async function ensureEditModalFullSearchLoaded() {
            if (editModalFullSearchLoaded) return;
            if (editModalFullSearchPromise) return editModalFullSearchPromise;

            editModalFullSearchPromise = (async () => {
                const startTime = performance.now();
                logEditModal('Pesquisa global: a carregar todos os animais para procurar fora dos últimos 15...');
                const querySnapshot = await withEditModalTimeout(
                    getDocs(collection(db, "animais")),
                    12000,
                    'getDocs pesquisa global de animais'
                );

                const fetchedAnimals = [];
                querySnapshot.forEach(doc => fetchedAnimals.push({ id: doc.id, ...doc.data() }));
                mergeAnimalsIntoEditCache(fetchedAnimals);
                editModalFullSearchLoaded = true;

                logEditModal('Pesquisa global: concluída.', {
                    total: fetchedAnimals.length,
                    ms: Math.round(performance.now() - startTime)
                });
            })().finally(() => {
                editModalFullSearchPromise = null;
            });

            return editModalFullSearchPromise;
        }

        async function refreshEditListWithGlobalSearch() {
            const searchTerm = editSearchInput.value.trim();

            refreshEditList();

            // O popup abre rápido com os últimos 15. Só quando o utilizador pesquisa é que
            // carregamos o resto da coleção, para encontrar animais que não estão nessa lista.
            if (searchTerm.length < 2 || editModalFullSearchLoaded) return;

            const currentToken = normalizeString(searchTerm);
            const currentResults = getEditFilteredAnimals();
            if (currentResults.length) return;

            editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">A procurar na base de dados...</p>';

            try {
                await ensureEditModalFullSearchLoaded();
            } catch (error) {
                warnEditModal('Pesquisa global falhou. A manter resultados já carregados.', error);
            }

            // Se o utilizador mudou a pesquisa durante o carregamento, não repomos resultados antigos.
            if (normalizeString(editSearchInput.value.trim()) !== currentToken) return;
            refreshEditList();
        }

        editSearchInput.addEventListener('input', () => {
            clearTimeout(editModalSearchDebounceTimer);
            editModalSearchDebounceTimer = setTimeout(refreshEditListWithGlobalSearch, 220);
        });

        const editQualityFilterBtn = document.getElementById('editQualityFilterBtn');
        const editQualityFilterPanel = document.getElementById('editQualityFilterPanel');
        editQualityFilterBtn?.addEventListener('click', () => {
            editQualityFilterPanel.style.display = editQualityFilterPanel.style.display === 'none' ? 'flex' : 'none';
        });
        editQualityFilterPanel?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-quality-filter]');
            if (!btn) return;

            const selectedFilter = btn.dataset.qualityFilter || '';
            const isClearButton = !selectedFilter || btn.classList.contains('quality-filter-clear');

            activeEditQualityFilter = isClearButton ? '' : normalizeQualityLevel(selectedFilter);
            editQualityFilterPanel.querySelectorAll('.quality-filter-choice').forEach(item => {
                item.classList.toggle('active', !!activeEditQualityFilter && item.dataset.qualityFilter === activeEditQualityFilter);
            });

            if (isClearButton) {
                editQualityFilterPanel.style.display = 'none';
            }

            refreshEditList();
        });

        function loadDataIntoForm(animalId) {
            const animal = allAnimals.find(a => a.id === animalId) || editModalAnimals.find(a => a.id === animalId);
            if (!animal) return;
            if (!allAnimals.some(a => a.id === animal.id)) {
                allAnimals.push(animal);
                loadExistingFamilies();
            }
            document.getElementById('nomeAnimal').value = animal.nome || '';
            document.getElementById('nomeCientifico').value = animal.nomeCientifico || '';
            document.getElementById('familia').value = animal.familia || '';
            document.getElementById('imagemUrl').value = animal.imagemUrl || '';
            document.getElementById('imagemObjectPosition').value = animal.imagemObjectPosition || 'center center';
            document.getElementById('imagemRodape').value = animal.imagemRodape || '';
            document.getElementById('rodapeHasEsqueleto').checked = !!animal.rodapeHasEsqueleto;
            document.getElementById('rodapeHasAnatomia').checked = !!animal.rodapeHasAnatomia;
            if (typeof window.setSelectedRodapeParams === 'function') {
                window.setSelectedRodapeParams(animal.rodapeParamsOn || []);
            }
            if (typeof setProfilePhotosData === 'function') setProfilePhotosData(animal);
            setCategoryData(animal.categoria);
            setRecordTypeData(animal);
            setQualityLevelData(animal);
            
            // Carregar campos avançados
            document.getElementById('reino').value = animal.reino || '';
            document.getElementById('filo').value = animal.filo || '';
            document.getElementById('subfilo').value = animal.subfilo || '';
            document.getElementById('classe').value = animal.classe || '';
            if (typeof window.syncCategoryFromScientificClass === 'function') {
                window.syncCategoryFromScientificClass();
            }
            if (document.getElementById('infraclasse')) document.getElementById('infraclasse').value = animal.infraclasse || '';
            document.getElementById('superordem').value = animal.superordem || '';
            document.getElementById('ordem').value = animal.ordem || '';
            document.getElementById('subordem').value = animal.subordem || '';
            document.getElementById('infraordem').value = animal.infraordem || '';
            if (document.getElementById('subfamilia')) document.getElementById('subfamilia').value = animal.subfamilia || '';
            document.getElementById('genero').value = animal.genero || '';
            if (document.getElementById('subgenero')) document.getElementById('subgenero').value = animal.subgenero || '';
            document.getElementById('especies').value = animal.especie || '';
            if (document.getElementById('autoridadeTaxonomica')) document.getElementById('autoridadeTaxonomica').value = animal.autoridadeTaxonomica || '';
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
            setEcologyData(normalizeEcologyData(ecoData, legacyEcologyItems));
            document.getElementById('infoEcologia').value = ecoData.resumo || ecoData.texto || '';
            document.getElementById('infoReproducao').value = animal.informacao.reproducao || '';
            document.getElementById('infoPlumagem').value = animal.informacao.plumagem || '';
            setReproductionData(mergeUniqueReproductionItems([...cleanedReproducaoDetalhada, ...legacyMatingItems]));
            const coveringItems = Array.isArray(animal.informacao.plumagemDetalhada) ? [...animal.informacao.plumagemDetalhada] : [];
            const legacyColor = animal.informacao?.curiosidades?.cor || '';
            if (legacyColor && !coveringItems.some(item => item.grupo === 'cor' || item.tipo === legacyColor)) {
                coveringItems.push({ grupo: 'cor', tipo: legacyColor, detalhe: '' });
            }
            setPlumageData(coveringItems);
            
            const distData = animal.informacao.distribuicao || { paises: [], paisesDetalhes: {}, paisesAutomaticos: [], descricao: '', regioesBiogeograficas: [], areas: [], pontos: [] };
            selectedCountries = distData.paises || [];
            paisesDetalhes = distData.paisesDetalhes || {};
            const savedAutomaticCountries = new Set(Array.isArray(distData.paisesAutomaticos) ? distData.paisesAutomaticos : []);
            manualSelectedCountryCodes.clear();
            autoSelectedCountryCodes.clear();
            selectedCountries.forEach(code => {
                if (savedAutomaticCountries.has(code)) autoSelectedCountryCodes.add(code);
                else manualSelectedCountryCodes.add(code);
            });
            distributionAreas = window.DistributionAreas?.normalizeDistributionAreas?.(distData.areas || []) || [];
            distributionPoints = window.DistributionAreas?.normalizeDistributionPoints?.(distData.pontos || distData.marcadores || []) || [];
            document.getElementById('infoDistribuicao').value = distData.descricao || '';
            if (typeof window.setDistributionRegionsData === 'function') {
                window.setDistributionRegionsData(distData.regioesBiogeograficas || distData.regioes || []);
            }
            renderSelectedCountries();
            renderHabitatAreas();
            if (mapForm) {
                mapForm.setSelectedRegions(getHighlightedCountryCodes());
                setTimeout(() => {
                    getHighlightedCountryCodes().forEach(code => {
                        applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
                    });
                }, 100);
            }

            const curiData = animal.informacao.curiosidades || { cor: '', estadoConservacao: '', texto: '' };
            const ecologyLegacyImportance = animal.informacao.ecologia?.importanciaEconomicaHumanos || '';
            const normalizedCuriData = {
                ...curiData,
                importanciaEconomicaHumanos: curiData.importanciaEconomicaHumanos || ecologyLegacyImportance
            };
            setCuriosidadesData(normalizeCuriosidadesData(normalizedCuriData));
            document.getElementById('infoCuriosidades').value = curiData.texto || '';
            updateCuriosidadesPreview();

            let hasVideos = false;
            for (let i = 0; i < 5; i++) {
                const videoVal = animal.videos && animal.videos[i] ? animal.videos[i] : '';
                document.getElementById(`video${i + 1}`).value = videoVal;
                if (videoVal) hasVideos = true;
            }
            const audioVal = String(
                animal.xenoCantoAudioId ||
                animal.audioXenoCantoId ||
                animal.xenoCantoId ||
                animal.informacao?.xenoCantoAudioId ||
                animal.informacao?.audioXenoCantoId ||
                animal.informacao?.audio?.codigo ||
                ''
            ).replace(/\D/g, '');
            const audioInput = document.getElementById('xenoCantoAudioId');
            if (audioInput) audioInput.value = audioVal;
            toggleVideosFieldset(hasVideos || Boolean(audioVal));
            closeModal();
            switchToEditMode(animalId);
            updatePlumagemTabVisibility();
        }

        function switchToEditMode(animalId) {
            isEditMode = true;
            currentEditingId = animalId;
            saveButton.textContent = "Atualizar Dados";
            document.getElementById('nomeCientifico').disabled = true;
            document.body.classList.add('edit-theme');
            updateScientificNameGate();
        }

        function switchToCreateMode() {
            isEditMode = false;
            currentEditingId = null;
            animalForm.reset();
            setRecordTypeData();
            resetQualityLevelData();
            setCategoryData('');
            selectedSubespecies = [];
            renderSubespeciesTags();
            advancedFieldsContainer.style.display = 'none';
            toggleAdvancedBtn.classList.remove('active');
            
            document.getElementById('infoPlumagem').value = '';
            document.getElementById('imagemObjectPosition').value = 'center center';
            if (typeof resetProfilePhotosData === 'function') resetProfilePhotosData();
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
            toggleExpandedDistributionMap(false);
            manualSelectedCountryCodes.clear();
            autoSelectedCountryCodes.clear();
            distributionAreas = [];
            distributionPoints = [];
            habitatDraftPoints = [];
            setHabitatDrawMode(false);
            document.getElementById('infoDistribuicao').value = '';
            if (typeof window.setDistributionRegionsData === 'function') {
                window.setDistributionRegionsData([]);
            }
            renderSelectedCountries();
            renderHabitatAreas();
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
            saveButton.textContent = "Gravar Novo Animal";
            document.getElementById('nomeCientifico').disabled = false;
            nomeCientificoWarning.style.display = 'none';
            statusMessage.style.display = 'none';
            document.body.classList.remove('edit-theme');
            toggleVideosFieldset(false);
            updateScientificNameGate({ focusScientificField: true });
        }

        let editModalLoadPromise = null;

        function logEditModal(...args) {
            console.log('[FORM][EDIT-MODAL]', ...args);
        }
        function warnEditModal(...args) {
            console.warn('[FORM][EDIT-MODAL]', ...args);
        }
        function errorEditModal(...args) {
            console.error('[FORM][EDIT-MODAL]', ...args);
        }
        function withEditModalTimeout(promise, ms, label) {
            return Promise.race([
                promise,
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`${label} demorou mais de ${ms}ms`)), ms);
                })
            ]);
        }

        async function loadAllAnimalsForEditModal() {
            const startTime = performance.now();
            logEditModal('loadAllAnimalsForEditModal: início', { cached: editModalAnimals.length, allAnimals: allAnimals.length });

            if (editModalAnimals.length) {
                logEditModal('A usar cache editModalAnimals.', { total: editModalAnimals.length });
                return editModalAnimals;
            }

            if (editModalLoadPromise) {
                logEditModal('Já existe carregamento em curso. A reutilizar a mesma Promise.');
                return editModalLoadPromise;
            }

            editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">A carregar os últimos 15 animais...</p>';

            editModalLoadPromise = (async () => {
                try {
                    let querySnapshot = null;

                    try {
                        logEditModal('Firestore: tentativa 1 — últimos 15 por timestamp...', { collection: 'animais', orderBy: 'timestamp desc', limit: 15 });
                        querySnapshot = await withEditModalTimeout(
                            getDocs(firestoreQuery(collection(db, "animais"), orderBy("timestamp", "desc"), limit(15))),
                            5000,
                            'getDocs últimos 15 por timestamp'
                        );
                    } catch (primaryError) {
                        warnEditModal('Tentativa 1 falhou/demorou. Vou tentar fallback sem orderBy timestamp.', primaryError);
                        querySnapshot = await withEditModalTimeout(
                            getDocs(firestoreQuery(collection(db, "animais"), limit(15))),
                            5000,
                            'getDocs fallback limit(15) sem orderBy'
                        );
                    }

                    editModalAnimals = [];
                    querySnapshot.forEach(doc => { editModalAnimals.push({ id: doc.id, ...doc.data() }); });
                    editModalAnimals.sort((a, b) => {
                        const ta = typeof a.timestamp?.toMillis === 'function' ? a.timestamp.toMillis() : (a.timestamp || 0);
                        const tb = typeof b.timestamp?.toMillis === 'function' ? b.timestamp.toMillis() : (b.timestamp || 0);
                        return tb - ta;
                    });

                    logEditModal('Firestore: popup carregado.', {
                        total: editModalAnimals.length,
                        ms: Math.round(performance.now() - startTime),
                        ids: editModalAnimals.map(a => a.id)
                    });

                    return editModalAnimals;
                } finally {
                    editModalLoadPromise = null;
                }
            })();

            return editModalLoadPromise;
        }

        async function openModal() {
            logEditModal('Clique no botão Procurar p/ Editar.', {
                disabled: openEditModalBtn?.disabled,
                allAnimals: allAnimals.length,
                cachedEditAnimals: editModalAnimals.length
            });

            editModalOverlay.style.display = 'flex';
            editSearchInput.value = '';
            activeEditQualityFilter = '';
            document.getElementById('editQualityFilterPanel').style.display = 'none';
            document.querySelectorAll('.quality-filter-choice').forEach(item => item.classList.remove('active'));

            try {
                await loadAllAnimalsForEditModal();
                refreshEditList();
                logEditModal('Lista renderizada.', { rendered: getEditFilteredAnimals().length });
            } catch (error) {
                errorEditModal('Erro ao carregar os últimos 15 animais para edição. Vou usar allAnimals como fallback.', error);
                if (Array.isArray(allAnimals) && allAnimals.length) {
                    populateEditList(allAnimals);
                    warnEditModal('Fallback allAnimals usado.', { total: allAnimals.length });
                } else {
                    editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">Não foi possível carregar a lista. Vê a consola para o motivo.</p>';
                }
            } finally {
                requestAnimationFrame(() => editSearchInput.focus());
            }
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
                    'infraclasse': 'infraclasse',
                    'superordem': 'superordem',
                    'ordem': 'ordem',
                    'subordem': 'subordem',
                    'infraordem': 'infraordem',
                    'família': 'familia',
                    'familia': 'familia',
                    'subfamilia': 'subfamilia',
                    'género': 'genero',
                    'genero': 'genero',
                    'subgenero': 'subgenero',
                    'espécie': 'especies',
                    'espécies': 'especies',
                    'especie': 'especies',
                    'especies': 'especies',
                    'autoridade taxonómica': 'autoridadeTaxonomica',
                    'autoridade taxonomica': 'autoridadeTaxonomica',
                    'autoridadetaxonomica': 'autoridadeTaxonomica',
                    'taxonomic authority': 'autoridadeTaxonomica',
                    'authority': 'autoridadeTaxonomica'
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
            const lines = String(text || '')
                .replace(/\r/g, '')
                .split('\n')
                .map(line => line.replace(/\u00a0/g, ' ').trim())
                .filter(Boolean);

            const result = {};
            const aliases = {
                reino: 'reino', kingdom: 'reino',
                filo: 'filo', phylum: 'filo',
                subfilo: 'subfilo', subphylum: 'subfilo',
                classe: 'classe', class: 'classe',
                infraclasse: 'infraclasse', infraclass: 'infraclasse',
                superordem: 'superordem', superorder: 'superordem',
                ordem: 'ordem', order: 'ordem',
                subordem: 'subordem', suborder: 'subordem',
                infraordem: 'infraordem', infraorder: 'infraordem',
                familia: 'familia', family: 'familia',
                subfamilia: 'subfamilia', subfamily: 'subfamilia',
                genero: 'genero', genus: 'genero',
                subgenero: 'subgenero', subgenus: 'subgenero',
                especie: 'especies', especies: 'especies', species: 'especies',
                autoridadetaxonomica: 'autoridadeTaxonomica', taxonomicauthority: 'autoridadeTaxonomica', authority: 'autoridadeTaxonomica'
            };

            const normalizeKey = (value = '') => String(value)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[.:\-–—]+$/g, '')
                .replace(/\s+/g, '')
                .trim();

            const savePair = (rawKey, rawValue) => {
                const key = aliases[normalizeKey(rawKey)];
                const value = String(rawValue || '').replace(/^[:\-–—\t\s]+/, '').trim();
                if (key && value) result[key] = value;
                return !!(key && value);
            };

            // Formatos "Kingdom: Animalia", com dois-pontos, hífen ou tabulação.
            for (const line of lines) {
                const separatorMatch = line.match(/^(.+?)(?:\s*:\s*|\s+\t+\s*|\s+[–—-]\s+)(.+)$/);
                if (separatorMatch) savePair(separatorMatch[1], separatorMatch[2]);
            }

            // Formato em linhas alternadas: Kingdom / Animalia / Phylum / Chordata.
            for (let index = 0; index < lines.length; index++) {
                const canonicalKey = aliases[normalizeKey(lines[index])];
                if (!canonicalKey) continue;

                let valueIndex = index + 1;
                while (valueIndex < lines.length && !lines[valueIndex]) valueIndex++;
                if (valueIndex < lines.length && !aliases[normalizeKey(lines[valueIndex])]) {
                    result[canonicalKey] = lines[valueIndex].replace(/^[:\-–—\t\s]+/, '').trim();
                    index = valueIndex;
                }
            }

            // Expande abreviaturas de espécie, por exemplo "B. quarlesi" → "Bubalus quarlesi".
            if (result.especies && result.genero) {
                const abbreviated = result.especies.match(/^([A-Za-z])\.\s*(.+)$/);
                if (abbreviated && result.genero.charAt(0).toLowerCase() === abbreviated[1].toLowerCase()) {
                    result.especies = `${result.genero} ${abbreviated[2].trim()}`;
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
                        focusDistributionMapContent();
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

        // --- ABA DE REVESTIMENTO CORPORAL DINÂMICA ---
        const categorySelect = document.getElementById('categoria');
        const tabBtnPlumagem = document.getElementById('tab-btn-plumagem');

        function updatePlumagemTabVisibility() {
            updateBodyCoveringInterface(true);
        }

        categorySelect.addEventListener('change', () => {
            updatePlumagemTabVisibility();
            updateReproductionPreview();
        });
        document.querySelectorAll('.categoria-checkbox').forEach(cb => cb.addEventListener('change', () => {
            window.setTimeout(() => updateBodyCoveringInterface(true), 0);
        }));

        // Atualiza também quando a categoria é preenchida automaticamente (edição/autocomplete).
        window.setTimeout(() => updateBodyCoveringInterface(false), 0);
        if (categorySelect) {
            new MutationObserver(() => updateBodyCoveringInterface(false)).observe(categorySelect, {
                attributes: true,
                attributeFilter: ['value']
            });
        }

        // --- CURIOSIDADES E MODELO VISUAL ---
        const curiosidadesTypeOptions = [
            'Cor do animal',
            'Distância Percorrida',
            'Estado de Conservação',
            'Horas de Sono',
            'Importância económica para os humanos',
            'Maior peso registado',
            'Maior idade registada',
            'Maior comprimento registado',
            'Maior altura registada',
            'Maior envergadura registada',
            'Tendência populacional',
            'Dependência de áreas protegidas',
            'Relação com Humanos',
            'Também conhecido como',
            'Temperatura do Ambiente',
            'Tipo de Comunicação',
            'Periculosidade',
            'Tipo de toxina',
            'Via de administração da toxina',
            'Antídoto disponível'
        ];
        const curiosidadesColorMap = {
            'Preto': '#111111',
            'Branco': '#fcfcfc',
            'Cinzento': '#8c8c8c',
            'Castanho': '#6b4423',
            'Bege': '#e8d8c8',
            'Creme': '#fffbcf',
            'Amarelo': '#ffd000',
            'Dourado': '#d4af37',
            'Laranja': '#ff7700',
            'Vermelho': '#e01b1b',
            'Rosa': '#ff94b8',
            'Azul': '#1a5fb4',
            'Verde': '#2ec27e',
            'Roxo': '#9141ac',
            'Prateado': '#c0c0c0'
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
            'Companhia',
            'Agrícola / Pecuário',
            'Trabalho',
            'Laboratório',
            'Cativeiro / Zoológico',
            'Exótico de companhia'
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

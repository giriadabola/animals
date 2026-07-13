// Modelo visual de reprodução
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

            const optPlaceholder = document.createElement('option');
            optPlaceholder.value = '';
            optPlaceholder.textContent = 'Escolhe um modelo';

            const optAcasalamento = document.createElement('option');
            optAcasalamento.value = 'acasalamento';
            optAcasalamento.textContent = 'Acasalamento';

            const optEpocaReproducao = document.createElement('option');
            optEpocaReproducao.value = 'epoca_reproducao';
            optEpocaReproducao.textContent = 'Época de reprodução';

            const optParental = document.createElement('option');
            optParental.value = 'parental_investment';
            optParental.textContent = 'Investimento Parental';

            const optMaturidade = document.createElement('option');
            optMaturidade.value = 'maturidade_sexual';
            optMaturidade.textContent = 'Maturidade Sexual';

            const optCrias = document.createElement('option');
            optCrias.value = 'crias';
            optCrias.textContent = 'Número de Crias';

            const optNumeroOvos = document.createElement('option');
            optNumeroOvos.value = 'numero_ovos';
            optNumeroOvos.textContent = 'Número de ovos';

            const optTempoEclosao = document.createElement('option');
            optTempoEclosao.value = 'tempo_eclosao';
            optTempoEclosao.textContent = 'Tempo até à eclosão';

            const optEstro = document.createElement('option');
            optEstro.value = 'duracao_estro';
            optEstro.textContent = 'Duração do estro';

            const optFrequenciaEstro = document.createElement('option');
            optFrequenciaEstro.value = 'frequencia_acasalamento_estro';
            optFrequenciaEstro.textContent = 'Frequência de acasalamento durante o estro';

            const optSucessoReprodutivo = document.createElement('option');
            optSucessoReprodutivo.value = 'taxa_sucesso_reprodutivo';
            optSucessoReprodutivo.textContent = 'Taxa de sucesso reprodutivo';

            const optIntervaloNascimentos = document.createElement('option');
            optIntervaloNascimentos.value = 'intervalo_nascimentos';
            optIntervaloNascimentos.textContent = 'Intervalo entre nascimentos';

            const optIdadeMetamorfose = document.createElement('option');
            optIdadeMetamorfose.value = 'idade_metamorfose';
            optIdadeMetamorfose.textContent = 'Idade da metamorfose';

            const optNumeroMudas = document.createElement('option');
            optNumeroMudas.value = 'numero_mudas';
            optNumeroMudas.textContent = 'Número de mudas';

            const optNumeroEstadiosLarvais = document.createElement('option');
            optNumeroEstadiosLarvais.value = 'numero_estadios_larvais';
            optNumeroEstadiosLarvais.textContent = 'Número de estádios larvais';

            const optSistemaSexual = document.createElement('option');
            optSistemaSexual.value = 'sistema_sexual';
            optSistemaSexual.textContent = 'Sistema sexual';

            const optGestacao = document.createElement('option');
            optGestacao.value = 'gestacao';
            optGestacao.textContent = 'Tempo de Gestação';

            const optTipo = document.createElement('option');
            optTipo.value = 'tipo';
            optTipo.textContent = 'Tipo de reprodução';
            
            rowModeSelect.append(optPlaceholder, optAcasalamento, optEpocaReproducao, optParental, optMaturidade, optCrias, optNumeroOvos, optTempoEclosao, optEstro, optFrequenciaEstro, optSucessoReprodutivo, optIntervaloNascimentos, optIdadeMetamorfose, optNumeroMudas, optNumeroEstadiosLarvais, optSistemaSexual, optGestacao, optTipo);
            window.formDropdownPolish?.sortSelectOptionsAlphabetically?.(rowModeSelect);

            const typeSelect = document.createElement('select');
            typeSelect.className = 'reproduction-type';

            const matingSelect = document.createElement('select');
            matingSelect.className = 'reproduction-mating-type';

            const sexualSystemSelect = document.createElement('select');
            sexualSystemSelect.className = 'reproduction-sexual-system';
            const sexualSystemOptions = ['Dióico', 'Monoico', 'Hermafrodita simultâneo', 'Hermafrodita sequencial', 'Protândrico', 'Protogínico'];
            function fillSexualSystemSelect(selectedValue = '') {
                const normalizedSelected = normalizeSearchText(selectedValue);
                sexualSystemSelect.innerHTML = '<option value="">Escolhe o sistema sexual</option>' +
                    sexualSystemOptions.map(option => `<option value="${option}">${option}</option>`).join('');
                const match = sexualSystemOptions.find(option => normalizeSearchText(option) === normalizedSelected);
                sexualSystemSelect.value = match || '';
            }
            fillSexualSystemSelect('');

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

            const seasonStartSelect = document.createElement('select');
            seasonStartSelect.className = 'reproduction-season-start';
            const seasonEndSelect = document.createElement('select');
            seasonEndSelect.className = 'reproduction-season-end';
            const reproductionSeasonOptions = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro', 'Primavera', 'Verão', 'Outono', 'Inverno'];
            function fillReproductionSeasonSelect(select, selectedValue = '', placeholder = 'Escolhe') {
                const hasSelected = selectedValue && reproductionSeasonOptions.includes(selectedValue);
                select.innerHTML = `<option value="">${placeholder}</option>` +
                    reproductionSeasonOptions.map(option => `<option value="${option}">${option}</option>`).join('') +
                    (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
                select.value = selectedValue || '';
            }
            fillReproductionSeasonSelect(seasonStartSelect, '', 'Início');
            fillReproductionSeasonSelect(seasonEndSelect, '', 'Fim');

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover campo';

            const genderBtn = createModelGenderButton(gender, updateReproductionPreview, 'reproduction-gender-toggle');
            const faseBtn = createModelFaseButton(fase, updateReproductionPreview, 'reproduction-fase-toggle');

            const initialMatingValue = normalizeSearchText(typeStr).includes('acasalamento') ? detailStr : typeStr;
            const isMating = isMatingReproductionItem(typeStr);

            const isParental = typeStr === 'Investimento Parental' || typeStr === 'parental_investment';
            const isGestation = typeStr === 'Tempo de Gestação' || typeStr.toLowerCase().includes('gestação') || typeStr.toLowerCase().includes('gestacao');
            const isCrias = typeStr === 'Número de Crias' || typeStr.toLowerCase().includes('cria');
            const isMaturidade = typeStr === 'Maturidade Sexual' || normalizeSearchText(typeStr).includes('maturidade sexual');
            const isAlimentacaoTipo = typeStr === 'Tipo de Alimentação';
            const isAlimentoMedio = typeStr === 'Alimento Ingerido em Média';
            const isAguaMedia = typeStr === 'Água bebida em Média';
            const normalizedReproductionType = normalizeSearchText(typeStr);
            const isEpocaReproducao = normalizedReproductionType.includes('epoca de reproducao') || normalizedReproductionType.includes('época de reprodução');
            const isNumeroOvos = normalizedReproductionType.includes('numero de ovos') || normalizedReproductionType.includes('número de ovos');
            const isTempoEclosao = normalizedReproductionType.includes('tempo ate a eclosao') || normalizedReproductionType.includes('tempo até à eclosão') || normalizedReproductionType.includes('eclosao');
            const isDuracaoEstro = normalizedReproductionType.includes('duracao do estro');
            const isFrequenciaAcasalamentoEstro = normalizedReproductionType.includes('frequencia de acasalamento durante o estro');
            const isTaxaSucessoReprodutivo = normalizedReproductionType.includes('taxa de sucesso reprodutivo');
            const isIntervaloNascimentos = normalizedReproductionType.includes('intervalo entre nascimentos');
            const isIdadeMetamorfose = normalizedReproductionType.includes('idade da metamorfose');
            const isNumeroMudas = normalizedReproductionType.includes('numero de mudas');
            const isNumeroEstadiosLarvais = normalizedReproductionType.includes('numero de estadios larvais');
            const isSistemaSexual = normalizedReproductionType.includes('sistema sexual');

            if (isSistemaSexual) {
                rowModeSelect.value = 'sistema_sexual';
                fillSexualSystemSelect(detailStr);
            } else             if (isParental) {
                rowModeSelect.value = 'parental_investment';
                if (detailStr) {
                    const parentalParts = detailStr.split(/\s*(?:•|\||;|,)\s*/).map(part => part.trim()).filter(Boolean);
                    minInput.value = parentalParts[0] || '';
                    maxInput.value = parentalParts[1] || '';
                    const actorValue = parentalParts[2] || '';
                    if (actorValue) {
                        const customActorOption = document.createElement('option');
                        customActorOption.value = actorValue;
                        customActorOption.textContent = actorValue;
                        unitSelect.append(customActorOption);
                        unitSelect.value = actorValue;
                    }
                }
            } else if (isGestation) {
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
            } else if (isDuracaoEstro) {
                rowModeSelect.value = 'duracao_estro';
                let unitVal = 'dias';
                if (detailStr) {
                    const match = detailStr.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(horas|hora|dias|dia|semanas|semana)/i);
                    if (match) {
                        minInput.value = match[1] || '';
                        maxInput.value = match[2] || '';
                        const matchedUnit = match[3].toLowerCase();
                        if (matchedUnit.includes('hora')) unitVal = 'horas';
                        else if (matchedUnit.includes('semana')) unitVal = 'semanas';
                    }
                }
                unitSelect.dataset.estroUnit = unitVal;
                unitSelect.value = unitVal;
            } else if (isFrequenciaAcasalamentoEstro) {
                rowModeSelect.value = 'frequencia_acasalamento_estro';
                const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g) || [];
                minInput.value = numbers[0] || '';
                maxInput.value = numbers[1] || '';
            } else if (isTaxaSucessoReprodutivo) {
                rowModeSelect.value = 'taxa_sucesso_reprodutivo';
                const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g) || [];
                minInput.value = numbers[0] || '';
                maxInput.value = numbers[1] || '';
            } else if (isIntervaloNascimentos) {
                rowModeSelect.value = 'intervalo_nascimentos';
                let unitVal = 'meses';
                const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g) || [];
                minInput.value = numbers[0] || '';
                maxInput.value = numbers[1] || '';
                const normalizedDetail = normalizeSearchText(detailStr);
                if (normalizedDetail.includes('minuto')) unitVal = 'minutos';
                else if (normalizedDetail.includes('hora')) unitVal = 'horas';
                else if (normalizedDetail.includes('dia')) unitVal = 'dias';
                else if (normalizedDetail.includes('semana')) unitVal = 'semanas';
                else if (normalizedDetail.includes('ano')) unitVal = 'anos';
                unitSelect.dataset.intervaloNascimentosUnit = unitVal;
                unitSelect.value = unitVal;
            } else if (isIdadeMetamorfose) {
                rowModeSelect.value = 'idade_metamorfose';
                let unitVal = 'meses';
                const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g) || [];
                minInput.value = numbers[0] || '';
                maxInput.value = numbers[1] || '';
                const normalizedDetail = normalizeSearchText(detailStr);
                if (normalizedDetail.includes('dia')) unitVal = 'dias';
                else if (normalizedDetail.includes('semana')) unitVal = 'semanas';
                else if (normalizedDetail.includes('ano')) unitVal = 'anos';
                unitSelect.dataset.idadeMetamorfoseUnit = unitVal;
                unitSelect.value = unitVal;
            } else if (isNumeroMudas) {
                rowModeSelect.value = 'numero_mudas';
                const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g) || [];
                minInput.value = numbers[0] || '';
                maxInput.value = numbers[1] || '';
                const normalizedDetail = normalizeSearchText(detailStr);
                let unitVal = 'centenas';
                if (normalizedDetail.includes('unidade')) unitVal = 'unidade';
                else if (normalizedDetail.includes('milhar')) unitVal = 'milhares';
                else if (normalizedDetail.includes('milhao')) unitVal = 'milhões';
                unitSelect.dataset.numeroMudasUnit = unitVal;
                unitSelect.value = unitVal;
            } else if (isNumeroEstadiosLarvais) {
                rowModeSelect.value = 'numero_estadios_larvais';
                const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g) || [];
                minInput.value = numbers[0] || '';
                maxInput.value = numbers[1] || '';
                const normalizedDetail = normalizeSearchText(detailStr);
                let unitVal = 'unidade';
                if (normalizedDetail.includes('centena')) unitVal = 'centenas';
                else if (normalizedDetail.includes('milhar')) unitVal = 'milhares';
                else if (normalizedDetail.includes('milhao')) unitVal = 'milhões';
                unitSelect.dataset.numeroEstadiosLarvaisUnit = unitVal;
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
            } else if (isEpocaReproducao) {
                rowModeSelect.value = 'epoca_reproducao';
                if (detailStr) {
                    const parts = detailStr.split(/\s*(?:[-–—]|\ba\b)\s*/i).map(part => part.trim()).filter(Boolean);
                    fillReproductionSeasonSelect(seasonStartSelect, parts[0] || '', 'Início');
                    fillReproductionSeasonSelect(seasonEndSelect, parts[1] || parts[0] || '', 'Fim');
                }
            } else if (isNumeroOvos) {
                rowModeSelect.value = 'numero_ovos';
                if (detailStr) {
                    const numbers = detailStr.match(/\d+(?:[.,]\d+)?/g);
                    if (numbers) {
                        minInput.value = numbers[0] || '';
                        maxInput.value = numbers[1] || '';
                    }
                }
            } else if (isTempoEclosao) {
                rowModeSelect.value = 'tempo_eclosao';
                let unitVal = 'dias';
                if (detailStr) {
                    const match = detailStr.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(segundos|segundo|minutos|minuto|horas|hora|dias|dia|semanas|semana|meses|mês|mes|anos|ano)/i);
                    if (match) {
                        minInput.value = match[1] || '';
                        maxInput.value = match[2] || '';
                        const matchedUnit = match[3].toLowerCase();
                        if (matchedUnit.includes('segundo')) unitVal = 'segundos';
                        else if (matchedUnit.includes('minuto')) unitVal = 'minutos';
                        else if (matchedUnit.includes('hora')) unitVal = 'horas';
                        else if (matchedUnit.includes('semana')) unitVal = 'semanas';
                        else if (matchedUnit.includes('mes') || matchedUnit.includes('mês')) unitVal = 'meses';
                        else if (matchedUnit.includes('ano')) unitVal = 'anos';
                        else unitVal = 'dias';
                    }
                }
                unitSelect.dataset.eclosaoUnit = unitVal;
                unitSelect.value = unitVal;
            } else if (isParental) {
                rowModeSelect.value = 'parental_investment';
            } else if (typeStr) {
                rowModeSelect.value = 'tipo';
                fillReproductionTypeSelect(typeSelect, typeStr);
            } else {
                rowModeSelect.value = '';
            }

            function updateRowVisibility() {
                row.innerHTML = '';
                unitSelect.disabled = false;
                minInput.removeAttribute('max');
                maxInput.removeAttribute('max');
                row.append(rowModeSelect);
                if (rowModeSelect.value === '') {
                    const spacer = document.createElement('div');
                    spacer.style.gridColumn = 'span 3';
                    row.append(spacer, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'parental_investment') {
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'tipo') {
                    fillReproductionTypeSelect(typeSelect, typeSelect.value || (!isGestation && !isCrias && !isMaturidade && !isMating && !isAlimentacaoTipo && !isAlimentoMedio && !isAguaMedia && !isEpocaReproducao && !isNumeroOvos && !isTempoEclosao && !isDuracaoEstro && !isFrequenciaAcasalamentoEstro && !isTaxaSucessoReprodutivo && !isIntervaloNascimentos && !isIdadeMetamorfose && !isNumeroMudas && !isNumeroEstadiosLarvais && !isSistemaSexual && !isParental ? typeStr : ''));
                    row.append(typeSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'acasalamento') {
                    fillMatingTypeSelect(matingSelect, matingSelect.value || initialMatingValue);
                    row.append(matingSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'sistema_sexual') {
                    fillSexualSystemSelect(sexualSystemSelect.value || detailStr);
                    sexualSystemSelect.style.gridColumn = 'span 3';
                    row.append(sexualSystemSelect, genderBtn, faseBtn, removeBtn);
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
                } else if (rowModeSelect.value === 'epoca_reproducao') {
                    fillReproductionSeasonSelect(seasonStartSelect, seasonStartSelect.value, 'Início');
                    fillReproductionSeasonSelect(seasonEndSelect, seasonEndSelect.value, 'Fim');
                    row.append(seasonStartSelect, seasonEndSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'numero_ovos') {
                    minInput.className = 'reproduction-gestation-min';
                    maxInput.className = 'reproduction-gestation-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 5';
                    const spacer = document.createElement('div');
                    row.append(minInput, maxInput, spacer, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'intervalo_nascimentos') {
                    minInput.className = 'reproduction-gestation-min reproduction-birth-interval-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-birth-interval-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 3';
                    const previousUnit = unitSelect.dataset.intervaloNascimentosUnit || unitSelect.value;
                    const birthIntervalUnits = ['minutos', 'horas', 'dias', 'semanas', 'meses', 'anos'];
                    unitSelect.innerHTML = '';
                    birthIntervalUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = birthIntervalUnits.includes(previousUnit) ? previousUnit : 'meses';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'idade_metamorfose') {
                    minInput.className = 'reproduction-gestation-min reproduction-metamorphosis-age-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-metamorphosis-age-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 6';
                    const previousUnit = unitSelect.dataset.idadeMetamorfoseUnit || unitSelect.value;
                    const metamorphosisUnits = ['dias', 'semanas', 'meses', 'anos'];
                    unitSelect.innerHTML = '';
                    metamorphosisUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = metamorphosisUnits.includes(previousUnit) ? previousUnit : 'meses';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'numero_mudas') {
                    minInput.className = 'reproduction-gestation-min reproduction-moults-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-moults-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 5';
                    const previousUnit = unitSelect.dataset.numeroMudasUnit || unitSelect.value;
                    const moultUnits = ['unidade', 'centenas', 'milhares', 'milhões'];
                    unitSelect.innerHTML = '';
                    moultUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = moultUnits.includes(previousUnit) ? previousUnit : 'centenas';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'numero_estadios_larvais') {
                    minInput.className = 'reproduction-gestation-min reproduction-larval-stages-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-larval-stages-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 5';
                    const previousUnit = unitSelect.dataset.numeroEstadiosLarvaisUnit || unitSelect.value;
                    const larvalStageUnits = ['unidade', 'centenas', 'milhares', 'milhões'];
                    unitSelect.innerHTML = '';
                    larvalStageUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = larvalStageUnits.includes(previousUnit) ? previousUnit : 'unidade';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'duracao_estro') {
                    minInput.className = 'reproduction-gestation-min reproduction-estrus-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-estrus-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 5';
                    const previousUnit = unitSelect.dataset.estroUnit || unitSelect.value;
                    const estrusUnits = ['horas', 'dias', 'semanas'];
                    unitSelect.innerHTML = '';
                    estrusUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = estrusUnits.includes(previousUnit) ? previousUnit : 'dias';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'frequencia_acasalamento_estro') {
                    minInput.className = 'reproduction-gestation-min reproduction-mating-frequency-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-mating-frequency-max';
                    minInput.placeholder = 'Mín: 1';
                    maxInput.placeholder = 'Máx: 5';
                    const spacer = document.createElement('div');
                    spacer.className = 'reproduction-unit-spacer';
                    row.append(minInput, maxInput, spacer, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'taxa_sucesso_reprodutivo') {
                    minInput.className = 'reproduction-gestation-min reproduction-success-rate-min';
                    maxInput.className = 'reproduction-gestation-max reproduction-success-rate-max';
                    minInput.placeholder = 'Mín: 0';
                    maxInput.placeholder = 'Máx: 100';
                    minInput.min = '0';
                    maxInput.min = '0';
                    minInput.max = '100';
                    maxInput.max = '100';
                    unitSelect.innerHTML = '<option value="%">%</option>';
                    unitSelect.value = '%';
                    unitSelect.disabled = true;
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
                } else if (rowModeSelect.value === 'tempo_eclosao') {
                    minInput.className = 'reproduction-gestation-min';
                    maxInput.className = 'reproduction-gestation-max';
                    minInput.placeholder = 'Mín: 10';
                    maxInput.placeholder = 'Máx: 15';
                    const previousUnit = unitSelect.dataset.eclosaoUnit || unitSelect.value;
                    const hatchUnits = ['segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos'];
                    unitSelect.innerHTML = '';
                    hatchUnits.forEach(u => {
                        const opt = document.createElement('option');
                        opt.value = u;
                        opt.textContent = u;
                        unitSelect.append(opt);
                    });
                    unitSelect.value = hatchUnits.includes(previousUnit) ? previousUnit : 'dias';
                    row.append(minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
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
            sexualSystemSelect.addEventListener('change', updateReproductionPreview);
            feedingDetailInput.addEventListener('input', updateReproductionPreview);
            minInput.addEventListener('input', updateReproductionPreview);
            maxInput.addEventListener('input', updateReproductionPreview);
            seasonStartSelect.addEventListener('change', updateReproductionPreview);
            seasonEndSelect.addEventListener('change', updateReproductionPreview);
            unitSelect.addEventListener('change', () => {
                if (rowModeSelect.value === 'maturidade_sexual') {
                    unitSelect.dataset.maturidadeUnit = unitSelect.value;
                }
                if (rowModeSelect.value === 'tempo_eclosao') {
                    unitSelect.dataset.eclosaoUnit = unitSelect.value;
                }
                if (rowModeSelect.value === 'duracao_estro') {
                    unitSelect.dataset.estroUnit = unitSelect.value;
                }
                if (rowModeSelect.value === 'intervalo_nascimentos') {
                    unitSelect.dataset.intervaloNascimentosUnit = unitSelect.value;
                }
                if (rowModeSelect.value === 'idade_metamorfose') {
                    unitSelect.dataset.idadeMetamorfoseUnit = unitSelect.value;
                }
                if (rowModeSelect.value === 'numero_mudas') {
                    unitSelect.dataset.numeroMudasUnit = unitSelect.value;
                }
                if (rowModeSelect.value === 'numero_estadios_larvais') {
                    unitSelect.dataset.numeroEstadiosLarvaisUnit = unitSelect.value;
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
                    if (rowModeSelect.value === 'parental_investment') {
                        const etapa = row.querySelector('.parental-stage-select, .reproduction-gestation-min')?.value || '';
                        const cuidado = row.querySelector('.parental-care-select, .reproduction-gestation-max')?.value || '';
                        const responsavel = row.querySelector('.parental-actor-select, .reproduction-gestation-unit')?.value || '';
                        const detalhe = [etapa, cuidado, responsavel].filter(Boolean).join(' • ');
                        return {
                            ...rowMeta,
                            tipo: 'Investimento Parental',
                            etapa,
                            cuidado,
                            responsavel,
                            valorMin: etapa,
                            valorMax: cuidado,
                            unidade: responsavel,
                            detalhe
                        };
                    } else if (rowModeSelect.value === 'tipo') {
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
                    } else if (rowModeSelect.value === 'sistema_sexual') {
                        const detail = row.querySelector('.reproduction-sexual-system')?.value || '';
                        return detail ? {
                            ...rowMeta,
                            tipo: 'Sistema sexual',
                            detalhe: detail
                        } : null;
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
                    } else if (rowModeSelect.value === 'epoca_reproducao') {
                        const inicio = row.querySelector('.reproduction-season-start')?.value || '';
                        const fim = row.querySelector('.reproduction-season-end')?.value || '';
                        const detail = inicio && fim ? `${inicio}-${fim}` : (inicio || fim);
                        return {
                            ...rowMeta,
                            tipo: 'Época de reprodução',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'numero_ovos') {
                        const min = row.querySelector('.reproduction-gestation-min')?.value || '';
                        const max = row.querySelector('.reproduction-gestation-max')?.value || '';
                        let detail = '';
                        if (min && max) {
                            detail = `${min}-${max} ovos`;
                        } else if (min) {
                            detail = `${min} ovos`;
                        } else if (max) {
                            detail = `${max} ovos`;
                        }
                        return {
                            ...rowMeta,
                            tipo: 'Número de ovos',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'frequencia_acasalamento_estro') {
                        const min = row.querySelector('.reproduction-gestation-min')?.value || '';
                        const max = row.querySelector('.reproduction-gestation-max')?.value || '';
                        const detalhe = min && max ? `${min}-${max}` : (min || max);
                        return {
                            ...rowMeta,
                            tipo: 'Frequência de acasalamento durante o estro',
                            detalhe
                        };
                    } else if (rowModeSelect.value === 'taxa_sucesso_reprodutivo') {
                        const min = row.querySelector('.reproduction-gestation-min')?.value || '';
                        const max = row.querySelector('.reproduction-gestation-max')?.value || '';
                        const detalhe = min && max ? `${min}-${max} %` : ((min || max) ? `${min || max} %` : '');
                        return {
                            ...rowMeta,
                            tipo: 'Taxa de sucesso reprodutivo',
                            detalhe
                        };
                    } else if (rowModeSelect.value === 'intervalo_nascimentos') {
                        const detail = buildRangeDetail(
                            row.querySelector('.reproduction-gestation-min')?.value || '',
                            row.querySelector('.reproduction-gestation-max')?.value || '',
                            row.querySelector('.reproduction-gestation-unit')?.value || 'meses'
                        );
                        return {
                            ...rowMeta,
                            tipo: 'Intervalo entre nascimentos',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'idade_metamorfose') {
                        const detail = buildRangeDetail(
                            row.querySelector('.reproduction-gestation-min')?.value || '',
                            row.querySelector('.reproduction-gestation-max')?.value || '',
                            row.querySelector('.reproduction-gestation-unit')?.value || 'meses'
                        );
                        return {
                            ...rowMeta,
                            tipo: 'Idade da metamorfose',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'numero_mudas') {
                        const detail = buildRangeDetail(
                            row.querySelector('.reproduction-gestation-min')?.value || '',
                            row.querySelector('.reproduction-gestation-max')?.value || '',
                            row.querySelector('.reproduction-gestation-unit')?.value || 'centenas'
                        );
                        return {
                            ...rowMeta,
                            tipo: 'Número de mudas',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'numero_estadios_larvais') {
                        const detail = buildRangeDetail(
                            row.querySelector('.reproduction-gestation-min')?.value || '',
                            row.querySelector('.reproduction-gestation-max')?.value || '',
                            row.querySelector('.reproduction-gestation-unit')?.value || 'unidade'
                        );
                        return {
                            ...rowMeta,
                            tipo: 'Número de estádios larvais',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'duracao_estro') {
                        const detail = buildRangeDetail(
                            row.querySelector('.reproduction-gestation-min')?.value || '',
                            row.querySelector('.reproduction-gestation-max')?.value || '',
                            row.querySelector('.reproduction-gestation-unit')?.value || 'dias'
                        );
                        return {
                            ...rowMeta,
                            tipo: 'Duração do estro',
                            detalhe: detail
                        };
                    } else if (rowModeSelect.value === 'tempo_eclosao') {
                        const detail = buildRangeDetail(
                            row.querySelector('.reproduction-gestation-min')?.value || '',
                            row.querySelector('.reproduction-gestation-max')?.value || '',
                            row.querySelector('.reproduction-gestation-unit')?.value || 'dias'
                        );
                        return {
                            ...rowMeta,
                            tipo: 'Tempo até à eclosão',
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
                .filter(item => item && (item.tipo === 'Investimento Parental' ? (item.etapa || item.cuidado || item.responsavel) : item.detalhe));
            return dynamicItems;
        }

        const reproductionDefaultModels = [
            'Acasalamento',
            'Duração do estro',
            'Época de reprodução',
            'Frequência de acasalamento durante o estro',
            'Idade da metamorfose',
            'Investimento Parental',
            'Intervalo entre nascimentos',
            'Maturidade Sexual',
            'Número de Crias',
            'Número de estádios larvais',
            'Número de mudas',
            'Número de ovos',
            'Sistema sexual',
            'Taxa de sucesso reprodutivo',
            'Tempo até à eclosão',
            'Tempo de Gestação',
            'Tipo de reprodução'
        ].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));

        function createAllReproductionRows() {
            reproductionDefaultModels.forEach(type => createReproductionRow(type));
        }

        function setReproductionData(reproduction = []) {
            reproductionRowsContainer.innerHTML = '';
            if (!Array.isArray(reproduction) || reproduction.length === 0) {
                createAllReproductionRows();
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
                normalRows.forEach(item => {
                    const isParentalItem = item?.tipo === 'Investimento Parental' || item?.tipo === 'parental_investment';
                    const parentalDetail = isParentalItem
                        ? [
                            item.etapa || item.valorMin || '',
                            item.cuidado || item.valorMax || '',
                            item.responsavel || item.unidade || ''
                        ].filter(Boolean).join(' • ')
                        : '';
                    createReproductionRow(
                        item.tipo || '',
                        parentalDetail || item.detalhe || item.descricao || '',
                        item.genero || GENDER_BOTH,
                        item.fase || 'Adulto'
                    );
                });
            }
            updateReproductionPreview();
        }

        function getReproductionVisualMeta(type = '') {
            const normalized = normalizeDimensionKey(type);
            if (normalized.includes('acasalamento')) return { key: 'acasalamento', title: type || 'Acasalamento', accent: 'accent-generic' };
            if (normalized.includes('epoca de reproducao') || normalized.includes('época de reprodução')) return { key: 'epocaReproducao', title: type || 'Época de reprodução', accent: 'accent-season' };
            if (normalized.includes('numero de ovos') || normalized.includes('número de ovos')) return { key: 'numeroOvos', title: type || 'Número de ovos', accent: 'accent-egg' };
            if (normalized.includes('tempo ate a eclosao') || normalized.includes('tempo até à eclosão') || normalized.includes('eclosao')) return { key: 'tempoEclosao', title: type || 'Tempo até à eclosão', accent: 'accent-hatching' };
            if (normalized.includes('duracao do estro')) return { key: 'duracaoEstro', title: type || 'Duração do estro', accent: 'accent-mating-polygamy' };
            if (normalized.includes('sistema sexual')) return { key: 'sistemaSexual', title: type || 'Sistema sexual', accent: 'accent-width' };
            if (normalized.includes('idade da metamorfose')) return { key: 'idadeMetamorfose', title: type || 'Idade da metamorfose', accent: 'accent-wing' };
            if (normalized.includes('numero de mudas')) return { key: 'numeroMudas', title: type || 'Número de mudas', accent: 'accent-tail' };
            if (normalized.includes('numero de estadios larvais')) return { key: 'numeroEstadiosLarvais', title: type || 'Número de estádios larvais', accent: 'accent-egg' };
            if (normalized.includes('frequencia de acasalamento durante o estro')) return { key: 'frequenciaAcasalamentoEstro', title: type || 'Frequência de acasalamento durante o estro', accent: 'accent-speed-average' };
            if (normalized.includes('taxa de sucesso reprodutivo')) return { key: 'taxaSucessoReprodutivo', title: type || 'Taxa de sucesso reprodutivo', accent: 'accent-life' };
            if (normalized.includes('intervalo entre nascimentos')) return { key: 'intervaloNascimentos', title: type || 'Intervalo entre nascimentos', accent: 'accent-maturity' };
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
                idadeMetamorfose: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="22" cy="25" r="8"/><path d="M17 51c9-17 24-24 42-17"/><path d="M53 27l9 8l-10 5"/><path d="M43 55c6 9 16 11 24 4"/><path d="M50 64l-8 5"/></svg>`,
                numeroMudas: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M19 40c0-13 9-23 21-23s21 10 21 23s-9 23-21 23S19 53 19 40Z"/><path d="M28 30c8 7 16 7 24 0"/><path d="M28 50c8-7 16-7 24 0"/><path d="M40 17v46"/></svg>`,
                numeroEstadiosLarvais: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="18" cy="40" r="6"/><circle cx="34" cy="40" r="8"/><circle cx="54" cy="40" r="10"/><path d="M24 40h2M42 40h2"/><path d="M62 32l8 8l-8 8"/></svg>`,
                sistemaSexual: `<svg class="metric-model-svg reproduction-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="27" cy="28" r="12"/><path d="M27 40v23M18 52h18"/><circle cx="54" cy="50" r="12"/><path d="M62 42l10-10M64 32h8v8"/></svg>`,
                duracaoEstro: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M24 18h32v44H24V18Z"/><path d="M24 30h32"/><path d="M32 12v12M48 12v12"/><path d="M33 46c0-5 3-9 7-9s7 4 7 9s-3 10-7 15c-4-5-7-10-7-15Z"/><path d="M17 67h46"/></svg>`,
                frequenciaAcasalamentoEstro: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 42c8-14 18-21 30-21c8 0 14 3 19 9"/><path d="M18 55c8-10 17-15 28-15c9 0 16 4 21 11"/><path d="M18 29h9M14 35h13M22 22h8"/><circle cx="57" cy="27" r="8"/><path d="M57 19v16M49 27h16"/></svg>`,
                taxaSucessoReprodutivo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="27"/><path d="M25 55l30-30"/><circle cx="29" cy="29" r="5"/><circle cx="51" cy="51" r="5"/><path d="M31 42l7 7l13-16"/></svg>`,
                intervaloNascimentos: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 20h44v42H18V20Z"/><path d="M18 32h44"/><path d="M29 13v14M51 13v14"/><circle cx="31" cy="46" r="6"/><circle cx="51" cy="46" r="6"/><path d="M37 46h8"/><path d="M41 42l4 4l-4 4"/></svg>`,
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
                epocaReproducao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><rect x="18" y="18" width="44" height="44" rx="6"/><path d="M18 30h44"/><path d="M30 12v12"/><path d="M50 12v12"/><path d="M28 42h8"/><path d="M44 42h8"/><path d="M28 52h8"/><path d="M44 52h8"/></svg>`,
                numeroOvos: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M30 17c8 0 14 11 14 22c0 10-5 18-14 18S16 49 16 39c0-11 6-22 14-22Z"/><path d="M50 24c8 0 14 10 14 20c0 9-5 16-14 16s-14-7-14-16c0-10 6-20 14-20Z"/><path d="M26 63h30"/></svg>`,
                tempoEclosao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c13 0 23 17 23 33c0 15-9 27-23 27S17 58 17 43C17 27 27 10 40 10Z"/><path d="M33 30l8 10l-7 4l10 9"/><path d="M50 30l-8 10l7 4l-10 9"/><path d="M28 62c7 5 17 6 25 0"/></svg>`,
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

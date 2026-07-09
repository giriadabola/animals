export const communicationTypeCatalog = [
    { label: 'Vocalizações', description: 'Sons produzidos pela boca, garganta, laringe ou estruturas semelhantes. Ex.: rugidos, cantos, grunhidos, assobios.' },
    { label: 'Sons emitidos', description: 'Lista concreta dos sons conhecidos da espécie. Ex.: guinchos, estalos, zumbidos, roncos, chiados, uivos.' },
    { label: 'Frequência dos sons', description: 'Tipo de frequência sonora usada: audível, infrassónica, ultrassónica ou baixa frequência.' },
    { label: 'Intensidade vocal', description: 'Indica se o animal é silencioso, pouco vocal, moderadamente vocal ou muito vocal.' },
    { label: 'Comunicação visual', description: 'Uso de sinais visíveis, como cores, padrões, posturas, movimentos, exibições ou mudanças corporais.' },
    { label: 'Linguagem corporal', description: 'Posturas e movimentos usados para comunicar intenção, ameaça, submissão, cortejo, medo ou dominância.' },
    { label: 'Sinais de cor', description: 'Cores ou padrões corporais usados como aviso, camuflagem, atração sexual ou reconhecimento entre indivíduos.' },
    { label: 'Comunicação química / olfativa', description: 'Comunicação através de cheiros, feromonas, urina, fezes ou secreções glandulares.' },
    { label: 'Marcação de território', description: 'Uso de cheiro, urina, fezes, arranhões, vocalizações ou sinais visuais para indicar posse de território.' },
    { label: 'Comunicação tátil', description: 'Comunicação por contacto físico. Ex.: toques, lambidelas, grooming, roçar o corpo, antenas ou bicadas suaves.' },
    { label: 'Grooming social', description: 'Limpeza ou cuidado corporal entre indivíduos, muitas vezes usado para reforçar laços sociais.' },
    { label: 'Comunicação vibratória', description: 'Uso de vibrações transmitidas pelo solo, água, folhas, troncos ou teias.' },
    { label: 'Comunicação sísmica', description: 'Tipo específico de comunicação vibratória feita através do solo. Ex.: elefantes, insetos e alguns roedores.' },
    { label: 'Comunicação elétrica', description: 'Uso de campos ou impulsos elétricos para orientação, reconhecimento ou comunicação. Comum em alguns peixes.' },
    { label: 'Bioluminescência comunicativa', description: 'Produção de luz para atrair parceiros, confundir predadores, sinalizar ou reconhecer indivíduos.' },
    { label: 'Comunicação acústica não vocal', description: 'Sons produzidos sem vocalização direta. Ex.: bater asas, tamborilar, estalar mandíbulas, bater cauda.' },
    { label: 'Chamadas de alarme', description: 'Sinais usados para avisar outros indivíduos sobre predadores ou perigo.' },
    { label: 'Chamadas de contacto', description: 'Sinais usados para manter ligação entre membros do grupo, crias e progenitores ou parceiros.' },
    { label: 'Chamadas de acasalamento', description: 'Sinais usados para atrair parceiros durante a época reprodutiva.' },
    { label: 'Sinais de ameaça', description: 'Comportamentos usados para intimidar rivais ou predadores. Ex.: eriçar pelo, abrir asas, mostrar dentes.' },
    { label: 'Sinais de submissão', description: 'Posturas ou sons usados para reduzir conflito e mostrar que o animal não representa ameaça.' },
    { label: 'Sinais parentais', description: 'Comunicação entre progenitores e crias, incluindo chamamentos, toques, alimentação ou proteção.' },
    { label: 'Comunicação social', description: 'Sinais usados para coordenar o grupo, manter hierarquias ou reforçar relações sociais.' },
    { label: 'Comunicação territorial', description: 'Sinais usados para defender área, ninho, toca, recursos ou parceiro.' },
    { label: 'Comunicação de cortejo', description: 'Danças, cantos, cores, ofertas, exibições ou movimentos usados para atrair parceiro.' },
    { label: 'Comunicação defensiva', description: 'Sinais usados para afastar predadores. Ex.: cores de aviso, silvos, bufos, fingir ser maior.' },
    { label: 'Comunicação multimodal', description: 'Uso de vários tipos de comunicação ao mesmo tempo. Ex.: canto + dança + cores + cheiro.' },
    { label: 'Distância da comunicação', description: 'Indica se os sinais funcionam a curta, média ou longa distância.' },
    { label: 'Contexto da comunicação', description: 'Situação em que a comunicação ocorre: alarme, acasalamento, alimentação, território, cuidado parental ou vida social.' },
    { label: 'Complexidade comunicativa', description: 'Grau de variedade e sofisticação dos sinais: simples, moderada ou complexa.' }
];

const communicationDescriptionMap = new Map(
    communicationTypeCatalog.map(item => [item.label, item.description])
);

export function getCommunicationTypeOptions() {
    return communicationTypeCatalog.map(item => item.label);
}

export function getCommunicationDescription(label = '') {
    return communicationDescriptionMap.get(label) || '';
}

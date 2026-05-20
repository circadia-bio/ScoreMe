/**
 * data/questionnaires/neurodevelopmental.js — Neurodevelopmental domain instruments
 *
 * Glasgow Sensory Questionnaire (GSQ) · AQ-10
 *
 * All instruments carry beta: true.
 *
 * Note on AQ-10 vs AQ-50: The full 50-item Autism Spectrum Quotient (Baron-Cohen
 * et al., 2001) is available as a custom JSON import. The AQ-10 (Allison et al.,
 * 2012) is the validated brief screener derived from it and is more practical for
 * in-app administration.
 */

const GSQ_OPTS5 = [
  { value: 0, label: 'Not at all a problem' },
  { value: 1, label: 'A slight problem' },
  { value: 2, label: 'A moderate problem' },
  { value: 3, label: 'A great problem' },
  { value: 4, label: 'Always a problem' },
];

// ─── Glasgow Sensory Questionnaire ────────────────────────────────────────────
export const GSQ = {
  id: 'gsq',
  title: 'Glasgow Sensory Questionnaire',
  shortTitle: 'GSQ',
  version: 'GSQ',
  beta: true,
  domain: 'Neurodevelopmental',
  construct: 'Sensory processing differences',
  constructDescription: 'Assesses the degree to which sensory processing difficulties are experienced across seven sensory modalities: visual, auditory, tactile, olfactory, gustatory, proprioceptive, and vestibular.',
  timeframe: 'General / typical experience',
  languages: ['English'],
  instructions: 'The following are a list of everyday experiences. Please indicate how much of a problem each has been for you.',
  reference: 'Robertson, A. E., & Simmons, D. R. (2013). The relationship between sensory sensitivity and autistic traits in the general population. Journal of Autism and Developmental Disorders, 43(4), 775-784.',
  credit: 'Ashley E. Robertson & David R. Simmons, University of Glasgow.',
  copyright: '© A. E. Robertson & D. R. Simmons. Available for research use.',
  maxScore: 112,
  scoringMethod: { type: 'sum', items: Array.from({ length: 28 }, (_, i) => `gsq_${i + 1}`) },
  scoringNote: 'Sum of 28 items rated 0-4. Total range: 0-112. Higher scores indicate greater sensory processing difficulties.',
  scoreBands: [
    { min: 0,  max: 28,  label: 'Low sensory sensitivity',      color: '#2E7D32', description: 'Low level of sensory processing difficulties.' },
    { min: 29, max: 56,  label: 'Mild sensory sensitivity',     color: '#F59E0B', description: 'Mild sensory processing difficulties.' },
    { min: 57, max: 84,  label: 'Moderate sensory sensitivity', color: '#EA580C', description: 'Moderate sensory processing difficulties.' },
    { min: 85, max: 112, label: 'High sensory sensitivity',     color: '#DC2626', description: 'High level of sensory processing difficulties.' },
  ],
  items: [
    { id: 'gsq_1',  number: 1,  text: 'Flickering lights (e.g. fluorescent lights, reflections, sunlight through leaves)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_2',  number: 2,  text: 'Bright lights', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_3',  number: 3,  text: 'Intense or bright colours', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_4',  number: 4,  text: 'Depth perception (e.g. judging distances)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_5',  number: 5,  text: 'Loud sounds (e.g. music in a shopping centre)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_6',  number: 6,  text: 'Sudden or unexpected sounds (e.g. alarm, cough)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_7',  number: 7,  text: 'High-pitched sounds', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_8',  number: 8,  text: 'Certain frequencies of sound', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_9',  number: 9,  text: 'Clothes being tight or touching certain parts of the body (e.g. neck, wrists)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_10', number: 10, text: 'Clothes with certain textures (e.g. itchy material)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_11', number: 11, text: 'Labels in clothing', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_12', number: 12, text: 'Being touched or bumped into by other people', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_13', number: 13, text: 'Strong perfumes or colognes', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_14', number: 14, text: 'Cooking smells', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_15', number: 15, text: 'Body odour of other people', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_16', number: 16, text: 'Chemical smells (e.g. cleaning products)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_17', number: 17, text: 'Strong food tastes or flavours', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_18', number: 18, text: 'Mixed textures in foods', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_19', number: 19, text: 'Food that is too hot or too cold', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_20', number: 20, text: 'Specific food textures', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_21', number: 21, text: 'Knowing where your body is in space (e.g. misjudging heights of steps)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_22', number: 22, text: 'Difficulty knowing how hard you are pressing on an object', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_23', number: 23, text: 'Judging how much force to use (e.g. breaking things accidentally)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_24', number: 24, text: 'Knowing where your limbs are without looking at them', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_25', number: 25, text: 'Travelling in a car, bus or boat', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_26', number: 26, text: 'Theme park rides or similar experiences', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_27', number: 27, text: 'Watching fast-moving objects', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_28', number: 28, text: 'Moving lifts / elevators', type: 'single_choice', options: GSQ_OPTS5 },
  ],
  score: (answers) => Array.from({ length: 28 }, (_, i) => `gsq_${i + 1}`).reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 28) return { label: 'Low sensory sensitivity',      color: '#2E7D32', description: 'Low level of sensory processing difficulties.' };
    if (score <= 56) return { label: 'Mild sensory sensitivity',     color: '#F59E0B', description: 'Mild sensory processing difficulties.' };
    if (score <= 84) return { label: 'Moderate sensory sensitivity', color: '#EA580C', description: 'Moderate sensory processing difficulties.' };
    return                 { label: 'High sensory sensitivity',      color: '#DC2626', description: 'High level of sensory processing difficulties.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'A seguir está uma lista de experiências do cotidiano. Por favor, indique o quanto cada uma delas tem sido um problema para você.',
      items: {
        gsq_1:  { text: 'Luzes piscantes (ex.: lâmpadas fluorescentes, reflexões, luz solar filtrando por folhas)' },
        gsq_2:  { text: 'Luzes fortes' },
        gsq_3:  { text: 'Cores intensas ou brilhantes' },
        gsq_4:  { text: 'Percepção de profundidade (ex.: calcular distâncias)' },
        gsq_5:  { text: 'Sons altos (ex.: música em um shopping)' },
        gsq_6:  { text: 'Sons súbitos ou inesperados (ex.: alarme, tosse)' },
        gsq_7:  { text: 'Sons agudos' },
        gsq_8:  { text: 'Certas frequências de som' },
        gsq_9:  { text: 'Roupas apertadas ou que tocam certas partes do corpo (ex.: pescoço, pulsos)' },
        gsq_10: { text: 'Roupas com certas texturas (ex.: material áspero)' },
        gsq_11: { text: 'Etiquetas nas roupas' },
        gsq_12: { text: 'Ser tocado(a) ou esbarrado(a) por outras pessoas' },
        gsq_13: { text: 'Perfumes ou colônias fortes' },
        gsq_14: { text: 'Cheiro de comida' },
        gsq_15: { text: 'Odor corporal de outras pessoas' },
        gsq_16: { text: 'Cheiros químicos (ex.: produtos de limpeza)' },
        gsq_17: { text: 'Gostos ou sabores fortes' },
        gsq_18: { text: 'Texturas misturadas nos alimentos' },
        gsq_19: { text: 'Alimentos muito quentes ou muito frios' },
        gsq_20: { text: 'Texturas específicas de alimentos' },
        gsq_21: { text: 'Saber onde seu corpo está no espaço (ex.: subestimar a altura de degraus)' },
        gsq_22: { text: 'Dificuldade em saber com que força está pressionando um objeto' },
        gsq_23: { text: 'Calcular a força a ser usada (ex.: quebrar coisas sem querer)' },
        gsq_24: { text: 'Saber onde estão seus membros sem olhar para eles' },
        gsq_25: { text: 'Viajar de carro, ônibus ou barco' },
        gsq_26: { text: 'Montanhas-russas ou experiências similares' },
        gsq_27: { text: 'Observar objetos em movimento rápido' },
        gsq_28: { text: 'Elevadores em movimento' },
      },
      scoreBands: [
        { label: 'Baixa sensibilidade sensorial',     description: 'Baixo nível de dificuldades de processamento sensorial.' },
        { label: 'Sensibilidade sensorial leve',      description: 'Dificuldades leves de processamento sensorial.' },
        { label: 'Sensibilidade sensorial moderada',  description: 'Dificuldades moderadas de processamento sensorial.' },
        { label: 'Alta sensibilidade sensorial',      description: 'Alto nível de dificuldades de processamento sensorial.' },
      ],
    },
  },
};

// ─── AQ-10 ────────────────────────────────────────────────────────────────────
export const AQ10 = {
  id: 'aq10',
  title: 'Autism Spectrum Quotient — 10 item screener',
  shortTitle: 'AQ-10',
  version: 'AQ-10 (derived from AQ-50)',
  beta: true,
  domain: 'Neurodevelopmental',
  construct: 'Autistic traits',
  constructDescription: 'Brief screener for autistic traits in adults derived from the full 50-item AQ-50 (Baron-Cohen et al., 2001). A score >= 6 is the recommended clinical referral threshold.',
  timeframe: 'General / how you usually are',
  languages: ['English'],
  instructions: 'Please read each statement carefully and rate how strongly it applies to you.',
  reference: 'Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). Toward brief "red flags" for autism spectrum disorders: The Short Autism Spectrum Quotient and the Short Quantitative Checklist for Autism in Toddlers. Journal of the American Academy of Child & Adolescent Psychiatry, 51(2), 202-212.',
  credit: 'Simon Baron-Cohen, Autism Research Centre, University of Cambridge.',
  copyright: '© Autism Research Centre, University of Cambridge. Available for research use.',
  maxScore: 10,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Each item scores 1 if the response is in the autistic direction, 0 otherwise. Items 1, 7, 8, 10 score 1 for "Definitely agree" or "Slightly agree". Items 2, 3, 4, 5, 6, 9 score 1 for "Definitely disagree" or "Slightly disagree". Total range: 0-10. Clinical referral threshold: >= 6.',
  scoreBands: [
    { min: 0, max: 5,  label: 'Below threshold',                     color: '#2E7D32', description: 'Score below the clinical referral threshold.' },
    { min: 6, max: 10, label: 'Above threshold — consider referral', color: '#DC2626', description: 'Score at or above the recommended referral threshold. Consider clinical assessment.' },
  ],
  items: [
    { id: 'aq10_1',  number: 1,  text: 'I often notice small sounds when others do not', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_2',  number: 2,  text: 'I usually concentrate more on the whole picture, rather than the small details', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_3',  number: 3,  text: 'I find it easy to do more than one thing at once', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_4',  number: 4,  text: 'If there is an interruption, I can switch back to what I was doing very quickly', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_5',  number: 5,  text: 'I find it easy to "read between the lines" when someone is talking to me', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_6',  number: 6,  text: 'I know how to tell if someone listening to me is getting bored', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_7',  number: 7,  text: "When I am reading a story, I find it difficult to work out the characters' intentions", type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_8',  number: 8,  text: 'I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant, etc.)', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_9',  number: 9,  text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_10', number: 10, text: "I find it difficult to work out people's intentions", type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
  ],
  score: (answers) => {
    const agreeItems = new Set([1, 7, 8, 10]);
    let total = 0;
    for (let i = 1; i <= 10; i++) {
      const v = answers[`aq10_${i}`];
      total += agreeItems.has(i) ? (v === 'da' || v === 'sa' ? 1 : 0) : (v === 'dd' || v === 'sd' ? 1 : 0);
    }
    return total;
  },
  interpret: (score) => {
    if (score <= 5) return { label: 'Below threshold',                     color: '#2E7D32', description: 'Score below the clinical referral threshold.' };
    return               { label: 'Above threshold — consider referral',  color: '#DC2626', description: 'Score at or above the recommended referral threshold. Consider clinical assessment.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Por favor, leia cada afirmação com atenção e avalie o quanto ela se aplica a você.',
      items: {
        aq10_1:  { text: 'Frequentemente noto sons pequenos que os outros não percebem' },
        aq10_2:  { text: 'Geralmente me concentro mais no quadro geral do que nos pequenos detalhes' },
        aq10_3:  { text: 'Acho fácil fazer mais de uma coisa ao mesmo tempo' },
        aq10_4:  { text: 'Se há uma interrupção, consigo retomar o que estava fazendo muito rapidamente' },
        aq10_5:  { text: 'Acho fácil “ler nas entrelinhas” quando alguém está falando comigo' },
        aq10_6:  { text: 'Sei dizer quando alguém que está me ouvindo está ficando entediado' },
        aq10_7:  { text: 'Quando estou lendo uma história, acho difícil descobrir as intenções dos personagens' },
        aq10_8:  { text: 'Gosto de colecionar informações sobre categorias de coisas (ex.: tipos de carro, pássaros, trens, plantas etc.)' },
        aq10_9:  { text: 'Acho fácil descobrir o que uma pessoa está pensando ou sentindo apenas olhando para o seu rosto' },
        aq10_10: { text: 'Acho difícil entender as intenções das pessoas' },
      },
      scoreBands: [
        { label: 'Abaixo do limiar',                             description: 'Pontuação abaixo do limiar de encaminhamento clínico.' },
        { label: 'Acima do limiar — considere encaminhamento', description: 'Pontuação igual ou acima do limiar recomendado. Considere avaliação clínica.' },
      ],
    },
  },
};

export const NEURODEVELOPMENTAL_QUESTIONNAIRES = [GSQ, AQ10];

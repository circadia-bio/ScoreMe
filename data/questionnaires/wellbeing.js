/**
 * data/questionnaires/wellbeing.js — Wellbeing domain instruments
 *
 * WHOQOL-BREF · MacArthur SSS
 *
 * All instruments carry beta: true.
 */

const WHOQOL_OPTS5 = [
  { value: 1, label: 'Very poor / Very dissatisfied / Not at all' },
  { value: 2, label: 'Poor / Dissatisfied / A little' },
  { value: 3, label: 'Neither poor nor good / Neither / A moderate amount' },
  { value: 4, label: 'Good / Satisfied / Mostly' },
  { value: 5, label: 'Very good / Very satisfied / Completely' },
];

const WHOQOL_SAT5 = [
  { value: 1, label: 'Very dissatisfied' },
  { value: 2, label: 'Dissatisfied' },
  { value: 3, label: 'Neither satisfied nor dissatisfied' },
  { value: 4, label: 'Satisfied' },
  { value: 5, label: 'Very satisfied' },
];

const LADDER_OPTS = [
  { value: 1, label: '1 — Bottom' }, { value: 2, label: '2' }, { value: 3, label: '3' },
  { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6' },
  { value: 7, label: '7' }, { value: 8, label: '8' }, { value: 9, label: '9' },
  { value: 10, label: '10 — Top' },
];

// ─── WHOQOL-BREF ──────────────────────────────────────────────────────────────
export const WHOQOL_BREF = {
  id: 'whoqol_bref',
  title: 'World Health Organization Quality of Life — Brief version',
  shortTitle: 'WHOQOL-BREF',
  version: 'WHOQOL-BREF',
  beta: true,
  domain: 'Wellbeing',
  construct: 'Quality of life',
  constructDescription: 'Assesses quality of life across four domains — Physical Health, Psychological, Social Relationships, and Environment — as well as two standalone global items.',
  timeframe: 'Past two weeks',
  languages: ['English', 'Arabic', 'Chinese', 'French', 'German', 'Hindi', 'Japanese', 'Portuguese', 'Russian', 'Spanish', 'Thai'],
  instructions: 'This questionnaire asks how you feel about your quality of life, health, or other areas of your life. Please answer all the questions thinking about your life over the past two weeks.',
  reference: 'WHOQOL Group. (1998). Development of the World Health Organization WHOQOL-BREF quality of life assessment. Psychological Medicine, 28(3), 551-558.',
  credit: 'World Health Organization Quality of Life Group.',
  copyright: '© World Health Organization. Freely available for non-commercial research use.',
  maxScore: 100,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Four domain scores each transformed to 0-100: Physical Health (items 3,4,10,15,16,17,18); Psychological (items 5,6,7,11,19,26); Social (items 20,21,22); Environment (items 8,9,12,13,14,23,24,25). Items 3, 4, 26 are reverse-scored. Overall = mean of four domains. score() returns { total, physical, psychological, social, environment }.',
  scoreBands: [
    { min: 0,   max: 40,  label: 'Poor QoL',      color: '#DC2626', description: 'Poor quality of life.' },
    { min: 41,  max: 60,  label: 'Moderate QoL',  color: '#EA580C', description: 'Moderate quality of life.' },
    { min: 61,  max: 80,  label: 'Good QoL',      color: '#F59E0B', description: 'Good quality of life.' },
    { min: 81,  max: 100, label: 'Very good QoL', color: '#2E7D32', description: 'Very good quality of life.' },
  ],
  items: [
    { id: 'whoqol_1',  number: 1,  text: 'How would you rate your quality of life?', type: 'single_choice', options: [{ value: 1, label: 'Very poor' },{ value: 2, label: 'Poor' },{ value: 3, label: 'Neither poor nor good' },{ value: 4, label: 'Good' },{ value: 5, label: 'Very good' }] },
    { id: 'whoqol_2',  number: 2,  text: 'How satisfied are you with your health?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_3',  number: 3,  text: 'To what extent do you feel that physical pain prevents you from doing what you need to do?', type: 'single_choice', options: WHOQOL_OPTS5, hint: 'Reverse-scored.' },
    { id: 'whoqol_4',  number: 4,  text: 'How much do you need any medical treatment to function in your daily life?', type: 'single_choice', options: WHOQOL_OPTS5, hint: 'Reverse-scored.' },
    { id: 'whoqol_5',  number: 5,  text: 'How much do you enjoy life?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_6',  number: 6,  text: 'To what extent do you feel your life to be meaningful?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_7',  number: 7,  text: 'How well are you able to concentrate?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_8',  number: 8,  text: 'How safe do you feel in your daily life?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_9',  number: 9,  text: 'How healthy is your physical environment?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_10', number: 10, text: 'Do you have enough energy for everyday life?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_11', number: 11, text: 'Are you able to accept your bodily appearance?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_12', number: 12, text: 'Have you enough money to meet your needs?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_13', number: 13, text: 'How available to you is the information that you need in your day-to-day life?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_14', number: 14, text: 'To what extent do you have the opportunity for leisure activities?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_15', number: 15, text: 'How well are you able to get around?', type: 'single_choice', options: WHOQOL_OPTS5 },
    { id: 'whoqol_16', number: 16, text: 'How satisfied are you with your sleep?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_17', number: 17, text: 'How satisfied are you with your ability to perform your daily living activities?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_18', number: 18, text: 'How satisfied are you with your capacity for work?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_19', number: 19, text: 'How satisfied are you with yourself?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_20', number: 20, text: 'How satisfied are you with your personal relationships?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_21', number: 21, text: 'How satisfied are you with your sex life?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_22', number: 22, text: 'How satisfied are you with the support you get from your friends?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_23', number: 23, text: 'How satisfied are you with the conditions of your living place?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_24', number: 24, text: 'How satisfied are you with your access to health services?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_25', number: 25, text: 'How satisfied are you with your transport?', type: 'single_choice', options: WHOQOL_SAT5 },
    { id: 'whoqol_26', number: 26, text: 'How often do you have negative feelings such as blue mood, despair, anxiety, depression?', type: 'single_choice', options: [{ value: 5, label: 'Never' },{ value: 4, label: 'Seldom' },{ value: 3, label: 'Quite often' },{ value: 2, label: 'Very often' },{ value: 1, label: 'Always' }], hint: 'Reverse-scored.' },
  ],
  score: (answers) => {
    const r = (k) => answers[k] ?? 0;
    const phys = Math.round((r('whoqol_3') + r('whoqol_4') + r('whoqol_10') + r('whoqol_15') + r('whoqol_16') + r('whoqol_17') + r('whoqol_18')) / 35 * 100);
    const psy  = Math.round((r('whoqol_5') + r('whoqol_6') + r('whoqol_7') + r('whoqol_11') + r('whoqol_19') + r('whoqol_26')) / 30 * 100);
    const soc  = Math.round((r('whoqol_20') + r('whoqol_21') + r('whoqol_22')) / 15 * 100);
    const env  = Math.round((r('whoqol_8') + r('whoqol_9') + r('whoqol_12') + r('whoqol_13') + r('whoqol_14') + r('whoqol_23') + r('whoqol_24') + r('whoqol_25')) / 40 * 100);
    return { total: Math.round((phys + psy + soc + env) / 4), physical: phys, psychological: psy, social: soc, environment: env };
  },
  interpret: (score) => {
    const s = typeof score === 'object' ? score.total : score;
    if (s <= 40) return { label: 'Poor QoL',      color: '#DC2626', description: 'Poor quality of life.' };
    if (s <= 60) return { label: 'Moderate QoL',  color: '#EA580C', description: 'Moderate quality of life.' };
    if (s <= 80) return { label: 'Good QoL',      color: '#F59E0B', description: 'Good quality of life.' };
    return             { label: 'Very good QoL',  color: '#2E7D32', description: 'Very good quality of life.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Este questionário pergunta como você avalia a sua qualidade de vida, saúde ou outras áreas de sua vida. Por favor, responda a todas as perguntas pensando em sua vida nas últimas duas semanas.',
      items: {
        whoqol_1:  { text: 'Como você avaliaria a sua qualidade de vida?', options: [{ label: 'Péssima' }, { label: 'Ruim' }, { label: 'Nem ruim nem boa' }, { label: 'Boa' }, { label: 'Ótima' }] },
        whoqol_2:  { text: 'Quão satisfeito(a) você está com a sua saúde?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_3:  { text: 'Em que medida você acha que sua dor (física) impede você de fazer o que precisa?', hint: 'Pontuado inversamente.' },
        whoqol_4:  { text: 'O quanto você precisa de algum tratamento médico para levar sua vida diária?', hint: 'Pontuado inversamente.' },
        whoqol_5:  { text: 'O quanto você aproveita a vida?' },
        whoqol_6:  { text: 'Em que medida você acha que sua vida tem sentido?' },
        whoqol_7:  { text: 'O quanto você consegue se concentrar?' },
        whoqol_8:  { text: 'Quão seguro(a) você se sente em sua vida diária?' },
        whoqol_9:  { text: 'Quão saudável é o seu ambiente físico (clima, barulho, poluição, atrativo)?' },
        whoqol_10: { text: 'Você tem energia suficiente para o seu dia a dia?' },
        whoqol_11: { text: 'Você é capaz de aceitar sua aparência física?' },
        whoqol_12: { text: 'Você tem dinheiro suficiente para satisfazer suas necessidades?' },
        whoqol_13: { text: 'Quão disponíveis para você estão as informações que precisa no seu dia a dia?' },
        whoqol_14: { text: 'Em que medida você tem oportunidades de atividade de lazer?' },
        whoqol_15: { text: 'Quão bem você é capaz de se locomover?' },
        whoqol_16: { text: 'Quão satisfeito(a) você está com seu sono?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_17: { text: 'Quão satisfeito(a) você está com sua capacidade de desempenhar as atividades do seu dia a dia?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_18: { text: 'Quão satisfeito(a) você está com sua capacidade para o trabalho?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_19: { text: 'Quão satisfeito(a) você está consigo mesmo(a)?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_20: { text: 'Quão satisfeito(a) você está com suas relações pessoais?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_21: { text: 'Quão satisfeito(a) você está com sua vida sexual?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_22: { text: 'Quão satisfeito(a) você está com o apoio que recebe de seus amigos?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_23: { text: 'Quão satisfeito(a) você está com as condições do local onde mora?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_24: { text: 'Quão satisfeito(a) você está com o seu acesso aos serviços de saúde?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_25: { text: 'Quão satisfeito(a) você está com o seu meio de transporte?', options: [{ label: 'Muito insatisfeito(a)' }, { label: 'Insatisfeito(a)' }, { label: 'Nem satisfeito(a) nem insatisfeito(a)' }, { label: 'Satisfeito(a)' }, { label: 'Muito satisfeito(a)' }] },
        whoqol_26: { text: 'Com que frequência você tem sentimentos negativos como mau humor, desespero, ansiedade, depressão?', hint: 'Pontuado inversamente.', options: [{ label: 'Nunca' }, { label: 'Raramente' }, { label: 'Com certa frequência' }, { label: 'Com muita frequência' }, { label: 'Sempre' }] },
      },
      scoreBands: [
        { label: 'QV ruim',         description: 'Qualidade de vida ruim.' },
        { label: 'QV moderada',     description: 'Qualidade de vida moderada.' },
        { label: 'QV boa',          description: 'Qualidade de vida boa.' },
        { label: 'QV muito boa',    description: 'Qualidade de vida muito boa.' },
      ],
    },
  },
};

// ─── MacArthur SSS ────────────────────────────────────────────────────────────
export const MACARTHUR_SSS = {
  id: 'macarthur_sss',
  title: 'MacArthur Scale of Subjective Social Status',
  shortTitle: 'MacArthur SSS',
  version: 'MacArthur SSS',
  beta: true,
  domain: 'Wellbeing',
  construct: 'Subjective social status',
  constructDescription: "Assesses an individual's subjective perception of their position in the social hierarchy relative to others in their society and in their local community, using a 10-rung ladder metaphor.",
  timeframe: 'Current perception',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese'],
  instructions: 'Think of this ladder as representing where people stand in their communities. People at the top of the ladder are those who are best off — they have the most money, the most education, and the most respected jobs. People at the bottom are those who are worst off. Where would you place yourself on this ladder?',
  reference: 'Adler, N. E., Epel, E. S., Castellazzo, G., & Ickovics, J. R. (2000). Relationship of subjective and objective social status with psychological and physiological functioning: Preliminary data in healthy White women. Health Psychology, 19(6), 586-592.',
  credit: 'Nancy E. Adler, University of California, San Francisco.',
  copyright: '© The MacArthur Research Network on SES and Health. Freely available for research use.',
  maxScore: 20,
  scoringMethod: { type: 'sum', items: ['mac_sss_society', 'mac_sss_community'] },
  scoringNote: 'Two ladder ratings (Society and Community), each 1-10. Total range: 2-20.',
  scoreBands: [
    { min: 2,  max: 8,  label: 'Low social status',      color: '#EA580C', description: 'Low perceived social status.' },
    { min: 9,  max: 14, label: 'Moderate social status', color: '#F59E0B', description: 'Moderate perceived social status.' },
    { min: 15, max: 20, label: 'High social status',     color: '#2E7D32', description: 'High perceived social status.' },
  ],
  items: [
    { id: 'mac_sss_society',   number: 1, text: 'Society ladder: Think of this ladder as representing where people stand in society as a whole. Where would you place yourself on this ladder?', type: 'scale_1_10', options: LADDER_OPTS },
    { id: 'mac_sss_community', number: 2, text: 'Community ladder: Think of this ladder as representing where people stand in your local community. Where would you place yourself on this ladder?', type: 'scale_1_10', options: LADDER_OPTS },
  ],
  score: (answers) => (answers['mac_sss_society'] ?? 0) + (answers['mac_sss_community'] ?? 0),
  interpret: (score) => {
    if (score <= 8)  return { label: 'Low social status',      color: '#EA580C', description: 'Low perceived social status.' };
    if (score <= 14) return { label: 'Moderate social status', color: '#F59E0B', description: 'Moderate perceived social status.' };
    return                 { label: 'High social status',      color: '#2E7D32', description: 'High perceived social status.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Pense nessa escada como representando onde as pessoas se posicionam na sua comunidade. As pessoas no topo são as mais bem-sucedidas — têm mais dinheiro, mais educação e os empregos mais respeitados. As pessoas na base estão nas piores condições. Onde você se colocaria nessa escada?',
      items: {
        mac_sss_society:   { text: 'Escada da sociedade: Pense nessa escada como representando onde as pessoas estão na sociedade como um todo. Onde você se colocaria?' },
        mac_sss_community: { text: 'Escada da comunidade: Pense nessa escada como representando onde as pessoas estão em sua comunidade local. Onde você se colocaria?' },
      },
      scoreBands: [
        { label: 'Status social baixo',     description: 'Baixo status social percebido.' },
        { label: 'Status social moderado',  description: 'Status social percebido moderado.' },
        { label: 'Status social elevado',   description: 'Elevado status social percebido.' },
      ],
    },
  },
};

export const WELLBEING_QUESTIONNAIRES = [WHOQOL_BREF, MACARTHUR_SSS];

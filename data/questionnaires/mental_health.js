/**
 * data/questionnaires/mental_health.js — Mental Health domain instruments
 *
 * PHQ-2 · PHQ-9 · PHQ-15 · GAD-7 · GAD-2 · BDI-II · BAI · DASS-21 · PANSS · STAI-S · STAI-T
 *
 * All instruments carry beta: true.
 */

// ─── Shared option sets ───────────────────────────────────────────────────────

const PHQ_FREQ4 = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

const DASS_FREQ4 = [
  { value: 0, label: 'Did not apply to me at all' },
  { value: 1, label: 'Applied to me to some degree, or some of the time' },
  { value: 2, label: 'Applied to me to a considerable degree, or a good part of the time' },
  { value: 3, label: 'Applied to me very much, or most of the time' },
];

const BAI_OPTS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Mildly — it did not bother me much' },
  { value: 2, label: 'Moderately — it was very unpleasant but I could stand it' },
  { value: 3, label: 'Severely — I could barely stand it' },
];

const STAI_STATE_OPTS = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Moderately so' },
  { value: 4, label: 'Very much so' },
];

const STAI_TRAIT_OPTS = [
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Almost always' },
];

const PANSS_OPTS = [
  { value: 1, label: 'Absent' },
  { value: 2, label: 'Minimal' },
  { value: 3, label: 'Mild' },
  { value: 4, label: 'Moderate' },
  { value: 5, label: 'Moderate-severe' },
  { value: 6, label: 'Severe' },
  { value: 7, label: 'Extreme' },
];

// ─── PHQ-2 ────────────────────────────────────────────────────────────────────
export const PHQ2 = {
  id: 'phq2',
  title: 'Patient Health Questionnaire — 2 items',
  shortTitle: 'PHQ-2',
  version: 'PHQ-2',
  beta: true,
  domain: 'Mental Health',
  construct: 'Depression screening',
  constructDescription: 'Two-item ultra-brief screen for depressive symptoms over the past two weeks; positive screen (score >= 3) warrants follow-up with PHQ-9.',
  timeframe: 'Past two weeks',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese', 'Arabic'],
  instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  reference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2003). The Patient Health Questionnaire-2: Validity of a two-item depression screener. Medical Care, 41(11), 1284-1292.',
  credit: 'Kurt Kroenke & Robert L. Spitzer.',
  copyright: 'In the public domain. No restrictions on use.',
  maxScore: 6,
  scoringMethod: { type: 'sum', items: ['phq2_1', 'phq2_2'] },
  scoringNote: 'Sum of 2 items rated 0-3. Total range: 0-6. Cut-off >= 3 indicates positive screen.',
  scoreBands: [
    { min: 0, max: 2, label: 'Negative screen', color: '#2E7D32', description: 'Negative screen for depression.' },
    { min: 3, max: 6, label: 'Positive screen', color: '#DC2626', description: 'Positive screen. Consider follow-up with PHQ-9 or clinical evaluation.' },
  ],
  items: [
    { id: 'phq2_1', number: 1, text: 'Little interest or pleasure in doing things', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq2_2', number: 2, text: 'Feeling down, depressed, or hopeless', type: 'frequency_4', options: PHQ_FREQ4 },
  ],
  score: (answers) => ['phq2_1', 'phq2_2'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 2) return { label: 'Negative screen', color: '#2E7D32', description: 'Negative screen for depression.' };
    return               { label: 'Positive screen',  color: '#DC2626', description: 'Positive screen. Consider follow-up with PHQ-9 or clinical evaluation.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Nas últimas 2 semanas, com que frequência você foi incomodado(a) por algum dos problemas a seguir?',
      items: {
        phq2_1: { text: 'Pouco interesse ou prazer em fazer as coisas' },
        phq2_2: { text: 'Sentir-se para baixo, deprimido(a) ou sem perspectiva' },
      },
      scoreBands: [
        { label: 'Triagem negativa', description: 'Triagem negativa para depressão.' },
        { label: 'Triagem positiva', description: 'Triagem positiva. Considere seguimento com PHQ-9 ou avaliação clínica.' },
      ],
    },
  },
};

// ─── PHQ-9 ────────────────────────────────────────────────────────────────────
export const PHQ9 = {
  id: 'phq9',
  title: 'Patient Health Questionnaire — 9 items',
  shortTitle: 'PHQ-9',
  version: 'PHQ-9',
  beta: true,
  domain: 'Mental Health',
  construct: 'Depression severity',
  constructDescription: 'Measures severity of depressive symptoms corresponding to the nine DSM-IV criteria for major depressive disorder over the past two weeks.',
  timeframe: 'Past two weeks',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Dutch', 'Italian', 'Chinese', 'Japanese', 'Arabic', 'Korean'],
  instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  reference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606-613.',
  credit: 'Kurt Kroenke & Robert L. Spitzer.',
  copyright: 'In the public domain. No restrictions on use.',
  maxScore: 27,
  scoringMethod: { type: 'sum', items: ['phq9_1','phq9_2','phq9_3','phq9_4','phq9_5','phq9_6','phq9_7','phq9_8','phq9_9'] },
  scoringNote: 'Sum of 9 items rated 0-3. Total range: 0-27.',
  scoreBands: [
    { min: 0,  max: 4,  label: 'Minimal depression',  color: '#2E7D32', description: 'Minimal or no depressive symptoms.' },
    { min: 5,  max: 9,  label: 'Mild depression',     color: '#F59E0B', description: 'Mild depression. Watchful waiting recommended.' },
    { min: 10, max: 14, label: 'Moderate depression', color: '#EA580C', description: 'Moderate depression. Consider treatment plan.' },
    { min: 15, max: 19, label: 'Moderately severe',   color: '#DC2626', description: 'Moderately severe depression. Active treatment warranted.' },
    { min: 20, max: 27, label: 'Severe depression',   color: '#7C2D12', description: 'Severe depression. Immediate treatment or referral indicated.' },
  ],
  items: [
    { id: 'phq9_1', number: 1, text: 'Little interest or pleasure in doing things', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_2', number: 2, text: 'Feeling down, depressed, or hopeless', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_3', number: 3, text: 'Trouble falling or staying asleep, or sleeping too much', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_4', number: 4, text: 'Feeling tired or having little energy', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_5', number: 5, text: 'Poor appetite or overeating', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_6', number: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_7', number: 7, text: 'Trouble concentrating on things, such as reading the newspaper or watching television', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_8', number: 8, text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'phq9_9', number: 9, text: 'Thoughts that you would be better off dead, or of hurting yourself in some way', type: 'frequency_4', options: PHQ_FREQ4 },
  ],
  score: (answers) => ['phq9_1','phq9_2','phq9_3','phq9_4','phq9_5','phq9_6','phq9_7','phq9_8','phq9_9'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 4)  return { label: 'Minimal depression',  color: '#2E7D32', description: 'Minimal or no depressive symptoms.' };
    if (score <= 9)  return { label: 'Mild depression',     color: '#F59E0B', description: 'Mild depression. Watchful waiting recommended.' };
    if (score <= 14) return { label: 'Moderate depression', color: '#EA580C', description: 'Moderate depression. Consider treatment plan.' };
    if (score <= 19) return { label: 'Moderately severe',   color: '#DC2626', description: 'Moderately severe depression. Active treatment warranted.' };
    return                 { label: 'Severe depression',    color: '#7C2D12', description: 'Severe depression. Immediate treatment or referral indicated.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Nas últimas 2 semanas, com que frequência você foi incomodado(a) por algum dos problemas a seguir?',
      items: {
        phq9_1: { text: 'Pouco interesse ou prazer em fazer as coisas' },
        phq9_2: { text: 'Sentir-se para baixo, deprimido(a) ou sem perspectiva' },
        phq9_3: { text: 'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir demais' },
        phq9_4: { text: 'Sentir-se cansado(a) ou com pouca energia' },
        phq9_5: { text: 'Falta de apetite ou comer em excesso' },
        phq9_6: { text: 'Sentir-se mal consigo mesmo(a) — ou achar que é um fracasso ou que decepcionou a si mesmo(a) ou à sua família' },
        phq9_7: { text: 'Dificuldade para se concentrar nas coisas, como ler o jornal ou assistir à televisão' },
        phq9_8: { text: 'Mover-se ou falar tão devagar que outras pessoas poderiam ter notado? Ou ao contrário — estar tão agitado(a) ou inquieto(a) que ficou andando de um lado para o outro muito mais do que de costume' },
        phq9_9: { text: 'Pensamentos de que seria melhor estar morto(a) ou de se machucar de alguma forma' },
      },
      scoreBands: [
        { label: 'Depressão mínima',          description: 'Sintomas depressivos mínimos ou ausentes.' },
        { label: 'Depressão leve',            description: 'Depressão leve. Monitoramento recomendado.' },
        { label: 'Depressão moderada',        description: 'Depressão moderada. Considere plano de tratamento.' },
        { label: 'Depressão moderadamente grave', description: 'Depressão moderadamente grave. Tratamento ativo indicado.' },
        { label: 'Depressão grave',           description: 'Depressão grave. Tratamento imediato ou encaminhamento indicado.' },
      ],
    },
  },
};

// ─── PHQ-15 ───────────────────────────────────────────────────────────────────
export const PHQ15 = {
  id: 'phq15',
  title: 'Patient Health Questionnaire — 15 items (Somatic Symptoms)',
  shortTitle: 'PHQ-15',
  version: 'PHQ-15',
  beta: true,
  domain: 'Mental Health',
  construct: 'Somatic symptom severity',
  constructDescription: 'Assesses the severity of 15 somatic symptoms over the past four weeks, covering pain, gastrointestinal, fatigue, and pseudoneurological symptom clusters.',
  timeframe: 'Past four weeks',
  languages: ['English', 'German', 'Spanish', 'French', 'Portuguese', 'Dutch'],
  instructions: 'During the last 4 weeks, how much have you been bothered by any of the following problems?',
  reference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2002). The PHQ-15: Validity of a new measure for evaluating the severity of somatic symptoms. Psychosomatic Medicine, 64(2), 258-266.',
  credit: 'Kurt Kroenke & Robert L. Spitzer.',
  copyright: 'In the public domain. No restrictions on use.',
  maxScore: 30,
  scoringMethod: { type: 'sum', items: ['phq15_1','phq15_2','phq15_3','phq15_4','phq15_5','phq15_6','phq15_7','phq15_8','phq15_9','phq15_10','phq15_11','phq15_12','phq15_13','phq15_14','phq15_15'] },
  scoringNote: 'Sum of 15 items, each rated 0-2. Total range: 0-30.',
  scoreBands: [
    { min: 0,  max: 4,  label: 'Minimal somatic symptoms', color: '#2E7D32', description: 'Minimal somatic symptom burden.' },
    { min: 5,  max: 9,  label: 'Low somatic symptoms',     color: '#F59E0B', description: 'Low somatic symptom severity.' },
    { min: 10, max: 14, label: 'Medium somatic symptoms',  color: '#EA580C', description: 'Medium somatic symptom severity. Consider clinical review.' },
    { min: 15, max: 30, label: 'High somatic symptoms',    color: '#DC2626', description: 'High somatic symptom burden. Clinical attention warranted.' },
  ],
  items: [
    { id: 'phq15_1',  number: 1,  text: 'Stomach pain', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_2',  number: 2,  text: 'Back pain', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_3',  number: 3,  text: 'Pain in your arms, legs, or joints (knees, hips, etc.)', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_4',  number: 4,  text: 'Menstrual cramps or other problems with your periods (women only)', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_5',  number: 5,  text: 'Headaches', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_6',  number: 6,  text: 'Chest pain', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_7',  number: 7,  text: 'Dizziness', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_8',  number: 8,  text: 'Fainting spells', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_9',  number: 9,  text: 'Feeling your heart pound or race', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_10', number: 10, text: 'Shortness of breath', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_11', number: 11, text: 'Pain or problems during sexual intercourse', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_12', number: 12, text: 'Constipation, loose bowels, or diarrhoea', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_13', number: 13, text: 'Nausea, gas, or indigestion', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_14', number: 14, text: 'Feeling tired or having low energy', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
    { id: 'phq15_15', number: 15, text: 'Trouble sleeping', type: 'single_choice', options: [{ value: 0, label: 'Not bothered at all' }, { value: 1, label: 'Bothered a little' }, { value: 2, label: 'Bothered a lot' }] },
  ],
  score: (answers) => ['phq15_1','phq15_2','phq15_3','phq15_4','phq15_5','phq15_6','phq15_7','phq15_8','phq15_9','phq15_10','phq15_11','phq15_12','phq15_13','phq15_14','phq15_15'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 4)  return { label: 'Minimal somatic symptoms', color: '#2E7D32', description: 'Minimal somatic symptom burden.' };
    if (score <= 9)  return { label: 'Low somatic symptoms',     color: '#F59E0B', description: 'Low somatic symptom severity.' };
    if (score <= 14) return { label: 'Medium somatic symptoms',  color: '#EA580C', description: 'Medium somatic symptom severity. Consider clinical review.' };
    return                 { label: 'High somatic symptoms',     color: '#DC2626', description: 'High somatic symptom burden. Clinical attention warranted.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Nas últimas 4 semanas, o quanto você foi incomodado(a) por algum dos problemas a seguir?',
      items: {
        phq15_1:  { text: 'Dor de estômago', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_2:  { text: 'Dor nas costas', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_3:  { text: 'Dor nos braços, pernas ou articulações (joelhos, quadris etc.)', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_4:  { text: 'Cólicas menstruais ou outros problemas com o ciclo (somente mulheres)', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_5:  { text: 'Dores de cabeça', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_6:  { text: 'Dor no peito', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_7:  { text: 'Tontura', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_8:  { text: 'Desmaio', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_9:  { text: 'Sensação de coração acelerado ou disparado', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_10: { text: 'Falta de ar', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_11: { text: 'Dor ou problemas durante relações sexuais', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_12: { text: 'Constipação, fezes soltas ou diarreia', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_13: { text: 'Náusea, gases ou má digestão', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_14: { text: 'Sentir-se cansado(a) ou com pouca energia', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
        phq15_15: { text: 'Problemas para dormir', options: [{ label: 'Nada incomodado(a)' }, { label: 'Um pouco incomodado(a)' }, { label: 'Muito incomodado(a)' }] },
      },
      scoreBands: [
        { label: 'Sintomas somáticos mínimos', description: 'Carga mínima de sintomas somáticos.' },
        { label: 'Sintomas somáticos baixos',  description: 'Baixa gravidade de sintomas somáticos.' },
        { label: 'Sintomas somáticos médios',  description: 'Gravidade média de sintomas somáticos. Considere avaliação clínica.' },
        { label: 'Sintomas somáticos elevados', description: 'Alta carga de sintomas somáticos. Atenção clínica indicada.' },
      ],
    },
  },
};

// ─── GAD-7 ────────────────────────────────────────────────────────────────────
export const GAD7 = {
  id: 'gad7',
  title: 'Generalised Anxiety Disorder — 7 items',
  shortTitle: 'GAD-7',
  version: 'GAD-7',
  beta: true,
  domain: 'Mental Health',
  construct: 'Anxiety severity',
  constructDescription: 'Measures severity of generalised anxiety disorder symptoms corresponding to DSM-IV criteria over the past two weeks.',
  timeframe: 'Past two weeks',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Dutch', 'Italian', 'Chinese', 'Arabic', 'Japanese', 'Korean'],
  instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  reference: 'Spitzer, R. L., Kroenke, K., Williams, J. B. W., & Lowe, B. (2006). A brief measure for assessing generalized anxiety disorder. Archives of Internal Medicine, 166(10), 1092-1097.',
  credit: 'Robert L. Spitzer, Kurt Kroenke, Janet B. W. Williams, Bernd Lowe.',
  copyright: 'In the public domain. No restrictions on use.',
  maxScore: 21,
  scoringMethod: { type: 'sum', items: ['gad7_1','gad7_2','gad7_3','gad7_4','gad7_5','gad7_6','gad7_7'] },
  scoringNote: 'Sum of 7 items rated 0-3. Total range: 0-21.',
  scoreBands: [
    { min: 0,  max: 4,  label: 'Minimal anxiety',  color: '#2E7D32', description: 'Minimal anxiety symptoms.' },
    { min: 5,  max: 9,  label: 'Mild anxiety',     color: '#F59E0B', description: 'Mild anxiety. Consider watchful waiting.' },
    { min: 10, max: 14, label: 'Moderate anxiety', color: '#EA580C', description: 'Moderate anxiety. Consider further assessment.' },
    { min: 15, max: 21, label: 'Severe anxiety',   color: '#DC2626', description: 'Severe anxiety. Active treatment indicated.' },
  ],
  items: [
    { id: 'gad7_1', number: 1, text: 'Feeling nervous, anxious, or on edge', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'gad7_2', number: 2, text: 'Not being able to stop or control worrying', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'gad7_3', number: 3, text: 'Worrying too much about different things', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'gad7_4', number: 4, text: 'Trouble relaxing', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'gad7_5', number: 5, text: "Being so restless that it's hard to sit still", type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'gad7_6', number: 6, text: 'Becoming easily annoyed or irritable', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'gad7_7', number: 7, text: 'Feeling afraid as if something awful might happen', type: 'frequency_4', options: PHQ_FREQ4 },
  ],
  score: (answers) => ['gad7_1','gad7_2','gad7_3','gad7_4','gad7_5','gad7_6','gad7_7'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 4)  return { label: 'Minimal anxiety',  color: '#2E7D32', description: 'Minimal anxiety symptoms.' };
    if (score <= 9)  return { label: 'Mild anxiety',     color: '#F59E0B', description: 'Mild anxiety. Consider watchful waiting.' };
    if (score <= 14) return { label: 'Moderate anxiety', color: '#EA580C', description: 'Moderate anxiety. Consider further assessment.' };
    return                 { label: 'Severe anxiety',    color: '#DC2626', description: 'Severe anxiety. Active treatment indicated.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Nas últimas 2 semanas, com que frequência você foi incomodado(a) por algum dos problemas a seguir?',
      items: {
        gad7_1: { text: 'Sentir-se nervoso(a), ansioso(a) ou no limite' },
        gad7_2: { text: 'Não conseguir parar ou controlar as preocupações' },
        gad7_3: { text: 'Preocupar-se demais com as mais diversas coisas' },
        gad7_4: { text: 'Dificuldade para relaxar' },
        gad7_5: { text: 'Ficar tão agitado(a) que é difícil ficar parado(a)' },
        gad7_6: { text: 'Ficar facilmente aborrecido(a) ou irritado(a)' },
        gad7_7: { text: 'Sentir medo como se algo terrível fosse acontecer' },
      },
      scoreBands: [
        { label: 'Ansiedade mínima',   description: 'Sintomas de ansiedade mínimos.' },
        { label: 'Ansiedade leve',     description: 'Ansiedade leve. Considere monitoramento.' },
        { label: 'Ansiedade moderada', description: 'Ansiedade moderada. Considere avaliação adicional.' },
        { label: 'Ansiedade grave',    description: 'Ansiedade grave. Tratamento ativo indicado.' },
      ],
    },
  },
};

// ─── GAD-2 ────────────────────────────────────────────────────────────────────
export const GAD2 = {
  id: 'gad2',
  title: 'Generalised Anxiety Disorder — 2 items',
  shortTitle: 'GAD-2',
  version: 'GAD-2',
  beta: true,
  domain: 'Mental Health',
  construct: 'Anxiety screening',
  constructDescription: 'Two-item ultra-brief screen for generalised anxiety disorder; positive screen (score >= 3) warrants follow-up with GAD-7.',
  timeframe: 'Past two weeks',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Dutch', 'Chinese'],
  instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  reference: 'Kroenke, K., Spitzer, R. L., Williams, J. B. W., Monahan, P. O., & Lowe, B. (2007). Anxiety disorders in primary care: Prevalence, impairment, comorbidity, and detection. Annals of Internal Medicine, 146(5), 317-325.',
  credit: 'Robert L. Spitzer, Kurt Kroenke, Janet B. W. Williams, Bernd Lowe.',
  copyright: 'In the public domain. No restrictions on use.',
  maxScore: 6,
  scoringMethod: { type: 'sum', items: ['gad2_1', 'gad2_2'] },
  scoringNote: 'Sum of 2 items rated 0-3. Total range: 0-6. Cut-off >= 3 indicates positive screen.',
  scoreBands: [
    { min: 0, max: 2, label: 'Negative screen', color: '#2E7D32', description: 'Negative screen for generalised anxiety.' },
    { min: 3, max: 6, label: 'Positive screen', color: '#DC2626', description: 'Positive screen. Consider follow-up with GAD-7 or clinical evaluation.' },
  ],
  items: [
    { id: 'gad2_1', number: 1, text: 'Feeling nervous, anxious, or on edge', type: 'frequency_4', options: PHQ_FREQ4 },
    { id: 'gad2_2', number: 2, text: 'Not being able to stop or control worrying', type: 'frequency_4', options: PHQ_FREQ4 },
  ],
  score: (answers) => ['gad2_1', 'gad2_2'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 2) return { label: 'Negative screen', color: '#2E7D32', description: 'Negative screen for generalised anxiety.' };
    return               { label: 'Positive screen',  color: '#DC2626', description: 'Positive screen. Consider follow-up with GAD-7 or clinical evaluation.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Nas últimas 2 semanas, com que frequência você foi incomodado(a) por algum dos problemas a seguir?',
      items: {
        gad2_1: { text: 'Sentir-se nervoso(a), ansioso(a) ou no limite' },
        gad2_2: { text: 'Não conseguir parar ou controlar as preocupações' },
      },
      scoreBands: [
        { label: 'Triagem negativa', description: 'Triagem negativa para ansiedade generalizada.' },
        { label: 'Triagem positiva', description: 'Triagem positiva. Considere seguimento com GAD-7 ou avaliação clínica.' },
      ],
    },
  },
};

// ─── BDI-II ───────────────────────────────────────────────────────────────────
export const BDI2 = {
  id: 'bdi2',
  title: 'Beck Depression Inventory — Second Edition',
  shortTitle: 'BDI-II',
  version: 'BDI-II',
  beta: true,
  domain: 'Mental Health',
  construct: 'Depression severity',
  constructDescription: 'Measures the severity of depressive symptoms in adults and adolescents aged 13 and over across 21 items reflecting DSM-IV criteria.',
  timeframe: 'Past two weeks (including today)',
  languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Dutch', 'Italian', 'Chinese', 'Arabic', 'Japanese'],
  instructions: 'This questionnaire consists of 21 groups of statements. Please read each group of statements carefully. Then pick out the one statement in each group that best describes the way you have been feeling during the past two weeks, including today.',
  reference: 'Beck, A. T., Steer, R. A., & Brown, G. K. (1996). BDI-II: Beck Depression Inventory manual (2nd ed.). The Psychological Corporation.',
  credit: 'Aaron T. Beck.',
  copyright: '© 1996 Aaron T. Beck. Published by The Psychological Corporation. All rights reserved. Permission required for use.',
  maxScore: 63,
  scoringMethod: { type: 'sum', items: ['bdi2_1','bdi2_2','bdi2_3','bdi2_4','bdi2_5','bdi2_6','bdi2_7','bdi2_8','bdi2_9','bdi2_10','bdi2_11','bdi2_12','bdi2_13','bdi2_14','bdi2_15','bdi2_16','bdi2_17','bdi2_18','bdi2_19','bdi2_20','bdi2_21'] },
  scoringNote: 'Sum of 21 items each rated 0-3. Total range: 0-63.',
  scoreBands: [
    { min: 0,  max: 13, label: 'Minimal depression',  color: '#2E7D32', description: 'Minimal depression.' },
    { min: 14, max: 19, label: 'Mild depression',     color: '#F59E0B', description: 'Mild depression.' },
    { min: 20, max: 28, label: 'Moderate depression', color: '#EA580C', description: 'Moderate depression.' },
    { min: 29, max: 63, label: 'Severe depression',   color: '#DC2626', description: 'Severe depression.' },
  ],
  items: [
    { id: 'bdi2_1',  number: 1,  text: 'Sadness', type: 'single_choice', options: [{ value: 0, label: 'I do not feel sad.' }, { value: 1, label: 'I feel sad much of the time.' }, { value: 2, label: 'I am sad all the time.' }, { value: 3, label: 'I am so sad or unhappy that I cannot stand it.' }] },
    { id: 'bdi2_2',  number: 2,  text: 'Pessimism', type: 'single_choice', options: [{ value: 0, label: 'I am not discouraged about my future.' }, { value: 1, label: 'I feel more discouraged about my future than I used to be.' }, { value: 2, label: 'I do not expect things to work out for me.' }, { value: 3, label: 'I feel my future is hopeless and will only get worse.' }] },
    { id: 'bdi2_3',  number: 3,  text: 'Past failure', type: 'single_choice', options: [{ value: 0, label: 'I do not feel like a failure.' }, { value: 1, label: 'I have failed more than I should have.' }, { value: 2, label: 'As I look back, I see a lot of failures.' }, { value: 3, label: 'I feel I am a total failure as a person.' }] },
    { id: 'bdi2_4',  number: 4,  text: 'Loss of pleasure', type: 'single_choice', options: [{ value: 0, label: 'I get as much pleasure as I ever did from the things I enjoy.' }, { value: 1, label: "I don't enjoy things as much as I used to." }, { value: 2, label: 'I get very little pleasure from the things I used to enjoy.' }, { value: 3, label: "I can't get any pleasure from the things I used to enjoy." }] },
    { id: 'bdi2_5',  number: 5,  text: 'Guilty feelings', type: 'single_choice', options: [{ value: 0, label: "I don't feel particularly guilty." }, { value: 1, label: 'I feel guilty over many things I have done or should have done.' }, { value: 2, label: 'I feel quite guilty most of the time.' }, { value: 3, label: 'I feel guilty all of the time.' }] },
    { id: 'bdi2_6',  number: 6,  text: 'Punishment feelings', type: 'single_choice', options: [{ value: 0, label: "I don't feel I am being punished." }, { value: 1, label: 'I feel I may be punished.' }, { value: 2, label: 'I expect to be punished.' }, { value: 3, label: 'I feel I am being punished.' }] },
    { id: 'bdi2_7',  number: 7,  text: 'Self-dislike', type: 'single_choice', options: [{ value: 0, label: 'I feel the same about myself as ever.' }, { value: 1, label: 'I have lost confidence in myself.' }, { value: 2, label: 'I am disappointed in myself.' }, { value: 3, label: 'I dislike myself.' }] },
    { id: 'bdi2_8',  number: 8,  text: 'Self-criticalness', type: 'single_choice', options: [{ value: 0, label: "I don't criticize or blame myself more than usual." }, { value: 1, label: 'I am more critical of myself than I used to be.' }, { value: 2, label: 'I criticize myself for all of my faults.' }, { value: 3, label: 'I blame myself for everything bad that happens.' }] },
    { id: 'bdi2_9',  number: 9,  text: 'Suicidal thoughts or wishes', type: 'single_choice', options: [{ value: 0, label: "I don't have any thoughts of killing myself." }, { value: 1, label: 'I have thoughts of killing myself, but I would not carry them out.' }, { value: 2, label: 'I would like to kill myself.' }, { value: 3, label: 'I would kill myself if I had the chance.' }] },
    { id: 'bdi2_10', number: 10, text: 'Crying', type: 'single_choice', options: [{ value: 0, label: "I don't cry any more than I used to." }, { value: 1, label: 'I cry more than I used to.' }, { value: 2, label: 'I cry over every little thing.' }, { value: 3, label: "I feel like crying, but I can't." }] },
    { id: 'bdi2_11', number: 11, text: 'Agitation', type: 'single_choice', options: [{ value: 0, label: 'I am no more restless or wound up than usual.' }, { value: 1, label: 'I feel more restless or wound up than usual.' }, { value: 2, label: "I am so restless or agitated that it's hard to stay still." }, { value: 3, label: 'I am so restless or agitated that I have to keep moving or doing something.' }] },
    { id: 'bdi2_12', number: 12, text: 'Loss of interest', type: 'single_choice', options: [{ value: 0, label: 'I have not lost interest in other people or activities.' }, { value: 1, label: 'I am less interested in other people or things than before.' }, { value: 2, label: 'I have lost most of my interest in other people or things.' }, { value: 3, label: "It's hard to get interested in anything." }] },
    { id: 'bdi2_13', number: 13, text: 'Indecisiveness', type: 'single_choice', options: [{ value: 0, label: 'I make decisions about as well as ever.' }, { value: 1, label: 'I find it more difficult to make decisions than usual.' }, { value: 2, label: 'I have much greater difficulty in making decisions than I used to.' }, { value: 3, label: 'I have trouble making any decisions at all.' }] },
    { id: 'bdi2_14', number: 14, text: 'Worthlessness', type: 'single_choice', options: [{ value: 0, label: 'I do not feel I am worthless.' }, { value: 1, label: "I don't consider myself as worthwhile and useful as I used to be." }, { value: 2, label: 'I feel more worthless as compared to other people.' }, { value: 3, label: 'I feel utterly worthless.' }] },
    { id: 'bdi2_15', number: 15, text: 'Loss of energy', type: 'single_choice', options: [{ value: 0, label: 'I have as much energy as ever.' }, { value: 1, label: 'I have less energy than I used to have.' }, { value: 2, label: "I don't have enough energy to do very much." }, { value: 3, label: "I don't have enough energy to do anything." }] },
    { id: 'bdi2_16', number: 16, text: 'Changes in sleeping pattern', type: 'single_choice', options: [{ value: 0, label: 'I have not experienced any change in my sleeping pattern.' }, { value: 1, label: 'I sleep somewhat more / less than usual.' }, { value: 2, label: 'I sleep a lot more / less than usual.' }, { value: 3, label: "I sleep most of the day / I wake up 1-2 hours early and can't get back to sleep." }] },
    { id: 'bdi2_17', number: 17, text: 'Irritability', type: 'single_choice', options: [{ value: 0, label: 'I am no more irritable than usual.' }, { value: 1, label: 'I am more irritable than usual.' }, { value: 2, label: 'I am much more irritable than usual.' }, { value: 3, label: 'I am irritable all the time.' }] },
    { id: 'bdi2_18', number: 18, text: 'Changes in appetite', type: 'single_choice', options: [{ value: 0, label: 'I have not experienced any change in my appetite.' }, { value: 1, label: 'My appetite is somewhat less / greater than usual.' }, { value: 2, label: 'My appetite is much less / greater than before.' }, { value: 3, label: 'I have no appetite at all / I crave food all the time.' }] },
    { id: 'bdi2_19', number: 19, text: 'Concentration difficulty', type: 'single_choice', options: [{ value: 0, label: 'I can concentrate as well as ever.' }, { value: 1, label: "I can't concentrate as well as usual." }, { value: 2, label: "It's hard to keep my mind on anything for very long." }, { value: 3, label: "I find I can't concentrate on anything." }] },
    { id: 'bdi2_20', number: 20, text: 'Tiredness or fatigue', type: 'single_choice', options: [{ value: 0, label: 'I am no more tired or fatigued than usual.' }, { value: 1, label: 'I get more tired or fatigued more easily than usual.' }, { value: 2, label: 'I am too tired or fatigued to do a lot of the things I used to do.' }, { value: 3, label: 'I am too tired or fatigued to do most of the things I used to do.' }] },
    { id: 'bdi2_21', number: 21, text: 'Loss of interest in sex', type: 'single_choice', options: [{ value: 0, label: 'I have not noticed any recent change in my interest in sex.' }, { value: 1, label: 'I am less interested in sex than I used to be.' }, { value: 2, label: 'I have almost no interest in sex.' }, { value: 3, label: 'I have lost interest in sex completely.' }] },
  ],
  score: (answers) => ['bdi2_1','bdi2_2','bdi2_3','bdi2_4','bdi2_5','bdi2_6','bdi2_7','bdi2_8','bdi2_9','bdi2_10','bdi2_11','bdi2_12','bdi2_13','bdi2_14','bdi2_15','bdi2_16','bdi2_17','bdi2_18','bdi2_19','bdi2_20','bdi2_21'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 13) return { label: 'Minimal depression',  color: '#2E7D32', description: 'Minimal depression.' };
    if (score <= 19) return { label: 'Mild depression',     color: '#F59E0B', description: 'Mild depression.' };
    if (score <= 28) return { label: 'Moderate depression', color: '#EA580C', description: 'Moderate depression.' };
    return                 { label: 'Severe depression',    color: '#DC2626', description: 'Severe depression.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Este questionário é composto por 21 grupos de afirmações. Por favor, leia cada grupo com atenção. Depois, escolha a afirmação de cada grupo que melhor descreve como você tem se sentido nas últimas duas semanas, incluindo hoje.',
      items: {
        bdi2_1:  { text: 'Tristeza', options: [{ label: 'Não me sinto triste.' }, { label: 'Sinto-me triste na maior parte do tempo.' }, { label: 'Estou sempre triste.' }, { label: 'Estou tão triste ou infeliz que não consigo suportar.' }] },
        bdi2_2:  { text: 'Pessimismo', options: [{ label: 'Não estou desanimado(a) em relação ao meu futuro.' }, { label: 'Sinto-me mais desanimado(a) em relação ao meu futuro do que antes.' }, { label: 'Não espero que as coisas melhorem para mim.' }, { label: 'Sinto que meu futuro não tem esperança e só vai piorar.' }] },
        bdi2_3:  { text: 'Fracassos do passado', options: [{ label: 'Não me sinto um fracasso.' }, { label: 'Fracassei mais do que deveria.' }, { label: 'Quando olho para trás, vejo muitos fracassos.' }, { label: 'Sinto que sou um fracasso total como pessoa.' }] },
        bdi2_4:  { text: 'Perda de prazer', options: [{ label: 'Tenho tanto prazer nas coisas quanto antes.' }, { label: 'Não tenho tanto prazer nas coisas como costumava ter.' }, { label: 'Tenho muito pouco prazer nas coisas que costumava gostar.' }, { label: 'Não consigo ter nenhum prazer nas coisas que costumava gostar.' }] },
        bdi2_5:  { text: 'Sentimentos de culpa', options: [{ label: 'Não me sinto particularmente culpado(a).' }, { label: 'Sinto-me culpado(a) por muitas coisas que fiz ou deveria ter feito.' }, { label: 'Sinto-me bastante culpado(a) na maior parte do tempo.' }, { label: 'Sinto-me culpado(a) o tempo todo.' }] },
        bdi2_6:  { text: 'Sentimentos de punição', options: [{ label: 'Não sinto que estou sendo punido(a).' }, { label: 'Sinto que posso ser punido(a).' }, { label: 'Espero ser punido(a).' }, { label: 'Sinto que estou sendo punido(a).' }] },
        bdi2_7:  { text: 'Autodepreciação', options: [{ label: 'Sinto o mesmo em relação a mim de sempre.' }, { label: 'Perdi a confiança em mim mesmo(a).' }, { label: 'Estou decepcionado(a) comigo mesmo(a).' }, { label: 'Não gosto de mim mesmo(a).' }] },
        bdi2_8:  { text: 'Autocrítica', options: [{ label: 'Não me critico ou culpo mais do que o normal.' }, { label: 'Sou mais crítico(a) de mim mesmo(a) do que costumava ser.' }, { label: 'Critico-me por todas as minhas falhas.' }, { label: 'Culpo-me por tudo de ruim que acontece.' }] },
        bdi2_9:  { text: 'Pensamentos suicidas', options: [{ label: 'Não tenho pensamentos de me matar.' }, { label: 'Tenho pensamentos de me matar, mas não os realizaria.' }, { label: 'Gostaria de me matar.' }, { label: 'Me mataria se tivesse oportunidade.' }] },
        bdi2_10: { text: 'Choro', options: [{ label: 'Não choro mais do que antes.' }, { label: 'Choro mais do que costumava.' }, { label: 'Choro por qualquer coisa.' }, { label: 'Sinto vontade de chorar, mas não consigo.' }] },
        bdi2_11: { text: 'Agitação', options: [{ label: 'Não estou mais agitado(a) do que de costume.' }, { label: 'Sinto-me mais agitado(a) do que de costume.' }, { label: 'Estou tão agitado(a) que é difícil ficar parado(a).' }, { label: 'Estou tão agitado(a) que preciso me mexer ou fazer algo o tempo todo.' }] },
        bdi2_12: { text: 'Perda de interesse', options: [{ label: 'Não perdi o interesse pelas outras pessoas ou atividades.' }, { label: 'Estou menos interessado(a) nos outros ou em coisas do que antes.' }, { label: 'Perdi a maior parte do interesse pelas outras pessoas ou coisas.' }, { label: 'É difícil me interessar por qualquer coisa.' }] },
        bdi2_13: { text: 'Indecisão', options: [{ label: 'Tomo decisões tão bem quanto antes.' }, { label: 'Acho mais difícil do que de costume tomar decisões.' }, { label: 'Tenho muito mais dificuldade em tomar decisões do que antes.' }, { label: 'Tenho dificuldade para tomar qualquer decisão.' }] },
        bdi2_14: { text: 'Inutilidade', options: [{ label: 'Não me sinto inútil.' }, { label: 'Não me considero tão valioso(a) e útil como costumava.' }, { label: 'Sinto-me mais inútil do que os outros.' }, { label: 'Sinto-me completamente inútil.' }] },
        bdi2_15: { text: 'Perda de energia', options: [{ label: 'Tenho tanta energia quanto sempre tive.' }, { label: 'Tenho menos energia do que costumava ter.' }, { label: 'Não tenho energia suficiente para fazer muitas coisas.' }, { label: 'Não tenho energia suficiente para fazer nada.' }] },
        bdi2_16: { text: 'Mudança no padrão de sono', options: [{ label: 'Não houve mudança no meu padrão de sono.' }, { label: 'Durmo um pouco mais / menos do que de costume.' }, { label: 'Durmo muito mais / menos do que de costume.' }, { label: 'Durmo a maior parte do dia / acordo 1–2 horas mais cedo e não consigo voltar a dormir.' }] },
        bdi2_17: { text: 'Irritabilidade', options: [{ label: 'Não estou mais irritado(a) do que de costume.' }, { label: 'Estou mais irritado(a) do que de costume.' }, { label: 'Estou muito mais irritado(a) do que de costume.' }, { label: 'Estou irritado(a) o tempo todo.' }] },
        bdi2_18: { text: 'Mudança no apetite', options: [{ label: 'Não houve mudança no meu apetite.' }, { label: 'Meu apetite está um pouco menor / maior do que de costume.' }, { label: 'Meu apetite está muito menor / maior do que antes.' }, { label: 'Não tenho apetite nenhum / Tenho fome o tempo todo.' }] },
        bdi2_19: { text: 'Dificuldade de concentração', options: [{ label: 'Consigo me concentrar tão bem quanto antes.' }, { label: 'Não consigo me concentrar tão bem quanto de costume.' }, { label: 'É difícil manter a atenção por muito tempo.' }, { label: 'Não consigo me concentrar em nada.' }] },
        bdi2_20: { text: 'Cansaço ou fadiga', options: [{ label: 'Não estou mais cansado(a) ou fatigado(a) do que de costume.' }, { label: 'Canso-me mais facilmente do que de costume.' }, { label: 'Estou cansado(a) demais para fazer muitas coisas.' }, { label: 'Estou cansado(a) demais para fazer qualquer coisa.' }] },
        bdi2_21: { text: 'Perda de interesse por sexo', options: [{ label: 'Não percebi mudança recente no meu interesse por sexo.' }, { label: 'Tenho menos interesse por sexo do que costumava ter.' }, { label: 'Tenho quase nenhum interesse por sexo.' }, { label: 'Perdi completamente o interesse por sexo.' }] },
      },
      scoreBands: [
        { label: 'Depressão mínima',   description: 'Depressão mínima.' },
        { label: 'Depressão leve',     description: 'Depressão leve.' },
        { label: 'Depressão moderada', description: 'Depressão moderada.' },
        { label: 'Depressão grave',    description: 'Depressão grave.' },
      ],
    },
  },
};

// ─── BAI ──────────────────────────────────────────────────────────────────────
export const BAI = {
  id: 'bai',
  title: 'Beck Anxiety Inventory',
  shortTitle: 'BAI',
  version: 'BAI',
  beta: true,
  domain: 'Mental Health',
  construct: 'Anxiety severity',
  constructDescription: 'Measures the subjective, somatic, and panic-related dimensions of anxiety experienced during the past week across 21 items.',
  timeframe: 'Past week (including today)',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Dutch', 'Italian', 'Chinese', 'Arabic'],
  instructions: 'Below is a list of common symptoms of anxiety. Please carefully read each item in the list. Indicate how much you have been bothered by that symptom during the past week, including today.',
  reference: 'Beck, A. T., Epstein, N., Brown, G., & Steer, R. A. (1988). An inventory for measuring clinical anxiety: Psychometric properties. Journal of Consulting and Clinical Psychology, 56(6), 893-897.',
  credit: 'Aaron T. Beck.',
  copyright: '© 1987 Aaron T. Beck. Published by The Psychological Corporation. All rights reserved. Permission required for use.',
  maxScore: 63,
  scoringMethod: { type: 'sum', items: ['bai1','bai2','bai3','bai4','bai5','bai6','bai7','bai8','bai9','bai10','bai11','bai12','bai13','bai14','bai15','bai16','bai17','bai18','bai19','bai20','bai21'] },
  scoringNote: 'Sum of 21 items each rated 0-3. Total range: 0-63.',
  scoreBands: [
    { min: 0,  max: 7,  label: 'Minimal anxiety',  color: '#2E7D32', description: 'Minimal anxiety.' },
    { min: 8,  max: 15, label: 'Mild anxiety',     color: '#F59E0B', description: 'Mild anxiety.' },
    { min: 16, max: 25, label: 'Moderate anxiety', color: '#EA580C', description: 'Moderate anxiety.' },
    { min: 26, max: 63, label: 'Severe anxiety',   color: '#DC2626', description: 'Severe anxiety.' },
  ],
  items: [
    { id: 'bai1',  number: 1,  text: 'Numbness or tingling', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai2',  number: 2,  text: 'Feeling hot', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai3',  number: 3,  text: 'Wobbliness in legs', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai4',  number: 4,  text: 'Unable to relax', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai5',  number: 5,  text: 'Fear of worst happening', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai6',  number: 6,  text: 'Dizzy or lightheaded', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai7',  number: 7,  text: 'Heart pounding or racing', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai8',  number: 8,  text: 'Unsteady', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai9',  number: 9,  text: 'Terrified or afraid', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai10', number: 10, text: 'Nervous', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai11', number: 11, text: 'Feeling of choking', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai12', number: 12, text: 'Hands trembling', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai13', number: 13, text: 'Shaky or unsteady', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai14', number: 14, text: 'Fear of losing control', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai15', number: 15, text: 'Difficulty breathing', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai16', number: 16, text: 'Fear of dying', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai17', number: 17, text: 'Scared', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai18', number: 18, text: 'Indigestion or discomfort in abdomen', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai19', number: 19, text: 'Faint', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai20', number: 20, text: 'Face flushed', type: 'single_choice', options: BAI_OPTS },
    { id: 'bai21', number: 21, text: 'Hot or cold sweats', type: 'single_choice', options: BAI_OPTS },
  ],
  score: (answers) => ['bai1','bai2','bai3','bai4','bai5','bai6','bai7','bai8','bai9','bai10','bai11','bai12','bai13','bai14','bai15','bai16','bai17','bai18','bai19','bai20','bai21'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 7)  return { label: 'Minimal anxiety',  color: '#2E7D32', description: 'Minimal anxiety.' };
    if (score <= 15) return { label: 'Mild anxiety',     color: '#F59E0B', description: 'Mild anxiety.' };
    if (score <= 25) return { label: 'Moderate anxiety', color: '#EA580C', description: 'Moderate anxiety.' };
    return                 { label: 'Severe anxiety',    color: '#DC2626', description: 'Severe anxiety.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Abaixo está uma lista de sintomas comuns de ansiedade. Por favor, leia cada item com atenção. Indique o quanto você foi incomodado(a) por esse sintoma durante a última semana, incluindo hoje.',
      items: {
        bai1:  { text: 'Dormência ou formigamento', options: [{ label: 'Nada' }, { label: 'Levemente — não me incomodou muito' }, { label: 'Moderadamente — foi desagradável, mas suportável' }, { label: 'Gravemente — mal consegui suportar' }] },
        bai2:  { text: 'Sensação de calor', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai3:  { text: 'Fraqueza nas pernas', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai4:  { text: 'Incapaz de relaxar', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai5:  { text: 'Medo de que algo terrível aconteça', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai6:  { text: 'Tontura ou vertigem', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai7:  { text: 'Coração acelerado ou palpitante', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai8:  { text: 'Instabilidade', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai9:  { text: 'Apavorado(a) ou com muito medo', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai10: { text: 'Nervosismo', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai11: { text: 'Sensação de sufocamento', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai12: { text: 'Tremor nas mãos', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai13: { text: 'Tremor ou instabilidade geral', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai14: { text: 'Medo de perder o controle', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai15: { text: 'Dificuldade para respirar', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai16: { text: 'Medo de morrer', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai17: { text: 'Assustado(a)', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai18: { text: 'Indigestão ou desconforto abdominal', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai19: { text: 'Sensação de desmaio', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai20: { text: 'Rosto ruborizado', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
        bai21: { text: 'Suores quentes ou frios', options: [{ label: 'Nada' }, { label: 'Levemente' }, { label: 'Moderadamente' }, { label: 'Gravemente' }] },
      },
      scoreBands: [
        { label: 'Ansiedade mínima',   description: 'Ansiedade mínima.' },
        { label: 'Ansiedade leve',     description: 'Ansiedade leve.' },
        { label: 'Ansiedade moderada', description: 'Ansiedade moderada.' },
        { label: 'Ansiedade grave',    description: 'Ansiedade grave.' },
      ],
    },
  },
};

// ─── DASS-21 ──────────────────────────────────────────────────────────────────
export const DASS21 = {
  id: 'dass21',
  title: 'Depression Anxiety Stress Scales — 21 items',
  shortTitle: 'DASS-21',
  version: 'DASS-21',
  beta: true,
  domain: 'Mental Health',
  construct: 'Depression, anxiety, and stress',
  constructDescription: 'Measures three negative emotional states — depression, anxiety, and stress — over the past week using 21 items (7 per subscale). Each subscale score is doubled to align with DASS-42 norms.',
  timeframe: 'Past week',
  languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Dutch', 'Italian', 'Chinese', 'Arabic', 'Persian', 'Turkish'],
  instructions: "Please read each statement and indicate a number 0, 1, 2, or 3 that indicates how much the statement applied to you over the past week. There are no right or wrong answers.",
  reference: 'Lovibond, S. H., & Lovibond, P. F. (1995). Manual for the Depression Anxiety Stress Scales (2nd ed.). Psychology Foundation.',
  credit: 'Sydney H. Lovibond & Peter F. Lovibond, University of New South Wales.',
  copyright: '© P. F. Lovibond & S. H. Lovibond. Available free of charge for non-commercial use.',
  maxScore: 42,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Three subscales (Depression, Anxiety, Stress), each summing 7 items rated 0-3. Each subscale raw score is multiplied by 2 for DASS-42 norm comparison. Depression: items 3,5,10,13,16,17,21. Anxiety: items 2,4,7,9,15,19,20. Stress: items 1,6,8,11,12,14,18. score() returns { total, depression, anxiety, stress }.',
  scoreBands: [
    { min: 0,  max: 13, label: 'Normal-Mild',    color: '#2E7D32', description: 'Total score in the normal to mild range. Refer to subscale breakdown.' },
    { min: 14, max: 28, label: 'Moderate',       color: '#F59E0B', description: 'Moderate overall distress. Refer to subscale breakdown.' },
    { min: 29, max: 42, label: 'Severe-Extreme', color: '#DC2626', description: 'Severe to extreme distress. Clinical evaluation recommended.' },
  ],
  items: [
    { id: 'dass21_1',  number: 1,  text: 'I found it hard to wind down', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_2',  number: 2,  text: 'I was aware of dryness of my mouth', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_3',  number: 3,  text: "I couldn't seem to experience any positive feeling at all", type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_4',  number: 4,  text: 'I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_5',  number: 5,  text: 'I found it difficult to work up the initiative to do things', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_6',  number: 6,  text: 'I tended to over-react to situations', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_7',  number: 7,  text: 'I experienced trembling (e.g. in the hands)', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_8',  number: 8,  text: 'I felt that I was using a lot of nervous energy', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_9',  number: 9,  text: 'I was worried about situations in which I might panic and make a fool of myself', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_10', number: 10, text: 'I felt that I had nothing to look forward to', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_11', number: 11, text: 'I found myself getting agitated', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_12', number: 12, text: 'I found it difficult to relax', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_13', number: 13, text: 'I felt down-hearted and blue', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_14', number: 14, text: 'I was intolerant of anything that kept me from getting on with what I was doing', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_15', number: 15, text: 'I felt I was close to panic', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_16', number: 16, text: 'I was unable to become enthusiastic about anything', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_17', number: 17, text: "I felt I wasn't worth much as a person", type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_18', number: 18, text: 'I felt that I was rather touchy', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_19', number: 19, text: 'I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_20', number: 20, text: 'I felt scared without any good reason', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_21', number: 21, text: 'I felt that life was meaningless', type: 'single_choice', options: DASS_FREQ4 },
  ],
  score: (answers) => {
    const dep    = ['dass21_3','dass21_5','dass21_10','dass21_13','dass21_16','dass21_17','dass21_21'].reduce((s, k) => s + (answers[k] ?? 0), 0) * 2;
    const anx    = ['dass21_2','dass21_4','dass21_7','dass21_9','dass21_15','dass21_19','dass21_20'].reduce((s, k) => s + (answers[k] ?? 0), 0) * 2;
    const stress = ['dass21_1','dass21_6','dass21_8','dass21_11','dass21_12','dass21_14','dass21_18'].reduce((s, k) => s + (answers[k] ?? 0), 0) * 2;
    return { total: dep + anx + stress, depression: dep, anxiety: anx, stress };
  },
  interpret: (score) => {
    const s = typeof score === 'object' ? score.total : score;
    if (s <= 13) return { label: 'Normal-Mild',    color: '#2E7D32', description: 'Total score in the normal to mild range. Refer to subscale breakdown.' };
    if (s <= 28) return { label: 'Moderate',       color: '#F59E0B', description: 'Moderate overall distress. Refer to subscale breakdown.' };
    return             { label: 'Severe-Extreme',  color: '#DC2626', description: 'Severe to extreme distress. Clinical evaluation recommended.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Por favor, leia cada afirmação e indique um número de 0 a 3 que indica o quanto a afirmação se aplicou a você durante a última semana. Não há respostas certas ou erradas.',
      items: {
        dass21_1:  { text: 'Tive dificuldade em me acalmar' },
        dass21_2:  { text: 'Percebi que minha boca estava seca' },
        dass21_3:  { text: 'Não consegui sentir nenhum sentimento positivo' },
        dass21_4:  { text: 'Tive dificuldade para respirar (ex.: respiração muito rápida, falta de ar sem esforço físico)' },
        dass21_5:  { text: 'Tive dificuldade em tomar iniciativa para fazer as coisas' },
        dass21_6:  { text: 'Tive tendência a reagir de forma exagerada às situações' },
        dass21_7:  { text: 'Senti tremores (ex.: nas mãos)' },
        dass21_8:  { text: 'Senti que estava usando muita energia nervosa' },
        dass21_9:  { text: 'Fiquei preocupado(a) com situações em que poderia entrar em pânico e me envergonhar' },
        dass21_10: { text: 'Senti que não tinha nada para esperar com prazer' },
        dass21_11: { text: 'Percebi que estava ficando agitado(a)' },
        dass21_12: { text: 'Tive dificuldade em relaxar' },
        dass21_13: { text: 'Senti-me desanimado(a) e deprimido(a)' },
        dass21_14: { text: 'Fui intolerante com qualquer coisa que me impedisse de continuar o que estava fazendo' },
        dass21_15: { text: 'Senti que estava perto de entrar em pânico' },
        dass21_16: { text: 'Não consegui me entusiasmar com nada' },
        dass21_17: { text: 'Senti que não tinha muito valor como pessoa' },
        dass21_18: { text: 'Percebi que estava bastante sensível' },
        dass21_19: { text: 'Percebi as batidas do meu coração sem esforço físico (ex.: sensação de aumento da frequência cardíaca, coração falhando)' },
        dass21_20: { text: 'Senti medo sem nenhum motivo aparente' },
        dass21_21: { text: 'Senti que a vida não tinha sentido' },
      },
      scoreBands: [
        { label: 'Normal–Leve',        description: 'Pontuação total na faixa normal a leve. Consulte os resultados por subescala.' },
        { label: 'Moderado',           description: 'Sofrimento geral moderado. Consulte os resultados por subescala.' },
        { label: 'Grave–Extremo',      description: 'Sofrimento grave a extremo. Avaliação clínica recomendada.' },
      ],
    },
  },
};

// ─── PANSS ────────────────────────────────────────────────────────────────────
export const PANSS = {
  id: 'panss',
  title: 'Positive and Negative Syndrome Scale',
  shortTitle: 'PANSS',
  version: 'PANSS',
  beta: true,
  domain: 'Mental Health',
  construct: 'Psychopathology in schizophrenia',
  constructDescription: 'Assesses the severity of positive symptoms, negative symptoms, and general psychopathology in patients with schizophrenia spectrum disorders across 30 items rated by a trained clinician.',
  timeframe: 'Past week (clinician-rated)',
  languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Dutch', 'Chinese', 'Japanese'],
  instructions: 'This scale is intended for clinician administration. Rate each item on a 7-point scale based on your clinical interview and all available information from the past week.',
  reference: 'Kay, S. R., Fiszbein, A., & Opler, L. A. (1987). The Positive and Negative Syndrome Scale (PANSS) for schizophrenia. Schizophrenia Bulletin, 13(2), 261-276.',
  credit: 'Stanley R. Kay, Abraham Fiszbein, & Lewis A. Opler.',
  copyright: '© Multi-Health Systems (MHS). All rights reserved. Licensing required for clinical and research use.',
  maxScore: 210,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Three subscales: Positive (P1-P7, range 7-49), Negative (N1-N7, range 7-49), General Psychopathology (G1-G16, range 16-112). Total = sum of all three (range 30-210). Each item rated 1 (absent) to 7 (extreme). score() returns { total, positive, negative, general }.',
  scoreBands: [
    { min: 30,  max: 58,  label: 'Minimal psychopathology', color: '#2E7D32', description: 'Minimal symptom burden.' },
    { min: 59,  max: 75,  label: 'Mild',                    color: '#F59E0B', description: 'Mild psychopathology.' },
    { min: 76,  max: 95,  label: 'Moderate',                color: '#EA580C', description: 'Moderate psychopathology.' },
    { min: 96,  max: 210, label: 'Severe-Extreme',          color: '#DC2626', description: 'Severe to extreme psychopathology.' },
  ],
  items: [
    { id: 'panss_p1', number: 'P1', text: 'Delusions', type: 'single_choice', hint: 'Beliefs which are unfounded, unrealistic and idiosyncratic.', options: PANSS_OPTS },
    { id: 'panss_p2', number: 'P2', text: 'Conceptual disorganization', type: 'single_choice', hint: 'Disorganized process of thinking characterised by disruption of goal-directed sequencing.', options: PANSS_OPTS },
    { id: 'panss_p3', number: 'P3', text: 'Hallucinatory behaviour', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_p4', number: 'P4', text: 'Excitement', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_p5', number: 'P5', text: 'Grandiosity', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_p6', number: 'P6', text: 'Suspiciousness/persecution', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_p7', number: 'P7', text: 'Hostility', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_n1', number: 'N1', text: 'Blunted affect', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_n2', number: 'N2', text: 'Emotional withdrawal', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_n3', number: 'N3', text: 'Poor rapport', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_n4', number: 'N4', text: 'Passive/apathetic social withdrawal', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_n5', number: 'N5', text: 'Difficulty in abstract thinking', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_n6', number: 'N6', text: 'Lack of spontaneity and flow of conversation', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_n7', number: 'N7', text: 'Stereotyped thinking', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g1',  number: 'G1',  text: 'Somatic concern', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g2',  number: 'G2',  text: 'Anxiety', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g3',  number: 'G3',  text: 'Guilt feelings', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g4',  number: 'G4',  text: 'Tension', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g5',  number: 'G5',  text: 'Mannerisms and posturing', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g6',  number: 'G6',  text: 'Depression', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g7',  number: 'G7',  text: 'Motor retardation', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g8',  number: 'G8',  text: 'Uncooperativeness', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g9',  number: 'G9',  text: 'Unusual thought content', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g10', number: 'G10', text: 'Disorientation', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g11', number: 'G11', text: 'Poor attention', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g12', number: 'G12', text: 'Lack of judgement and insight', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g13', number: 'G13', text: 'Disturbance of volition', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g14', number: 'G14', text: 'Poor impulse control', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g15', number: 'G15', text: 'Preoccupation', type: 'single_choice', options: PANSS_OPTS },
    { id: 'panss_g16', number: 'G16', text: 'Active social avoidance', type: 'single_choice', options: PANSS_OPTS },
  ],
  score: (answers) => {
    const pItems = ['panss_p1','panss_p2','panss_p3','panss_p4','panss_p5','panss_p6','panss_p7'];
    const nItems = ['panss_n1','panss_n2','panss_n3','panss_n4','panss_n5','panss_n6','panss_n7'];
    const gItems = ['panss_g1','panss_g2','panss_g3','panss_g4','panss_g5','panss_g6','panss_g7','panss_g8','panss_g9','panss_g10','panss_g11','panss_g12','panss_g13','panss_g14','panss_g15','panss_g16'];
    const positive = pItems.reduce((s, k) => s + (answers[k] ?? 1), 0);
    const negative = nItems.reduce((s, k) => s + (answers[k] ?? 1), 0);
    const general  = gItems.reduce((s, k) => s + (answers[k] ?? 1), 0);
    return { total: positive + negative + general, positive, negative, general };
  },
  interpret: (score) => {
    const s = typeof score === 'object' ? score.total : score;
    if (s <= 58) return { label: 'Minimal psychopathology', color: '#2E7D32', description: 'Minimal symptom burden.' };
    if (s <= 75) return { label: 'Mild',                    color: '#F59E0B', description: 'Mild psychopathology.' };
    if (s <= 95) return { label: 'Moderate',                color: '#EA580C', description: 'Moderate psychopathology.' };
    return             { label: 'Severe-Extreme',           color: '#DC2626', description: 'Severe to extreme psychopathology.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Esta escala é destinada à administração por clínico. Avalie cada item em uma escala de 7 pontos com base em sua entrevista clínica e todas as informações disponíveis da última semana.',
      items: {
        panss_p1: { text: 'Delírios', hint: 'Crenças infundadas, não realistas e idiossincráticas.' },
        panss_p2: { text: 'Desorganização conceitual', hint: 'Processo de pensamento desorganizado, com perturbação do sequenciamento orientado a objetivos.' },
        panss_p3: { text: 'Comportamento alucinatório' },
        panss_p4: { text: 'Excitação' },
        panss_p5: { text: 'Grandiosidade' },
        panss_p6: { text: 'Desconfiança/perseguição' },
        panss_p7: { text: 'Hostilidade' },
        panss_n1: { text: 'Afeto embotado' },
        panss_n2: { text: 'Retraimento emocional' },
        panss_n3: { text: 'Fraco rapport' },
        panss_n4: { text: 'Retraimento social passivo/apático' },
        panss_n5: { text: 'Dificuldade no pensamento abstrato' },
        panss_n6: { text: 'Falta de espontaneidade e fluência da conversa' },
        panss_n7: { text: 'Pensamento estereotipado' },
        panss_g1:  { text: 'Preocupação somática' },
        panss_g2:  { text: 'Ansiedade' },
        panss_g3:  { text: 'Sentimentos de culpa' },
        panss_g4:  { text: 'Tensão' },
        panss_g5:  { text: 'Maneirismos e postura' },
        panss_g6:  { text: 'Depressão' },
        panss_g7:  { text: 'Retardo motor' },
        panss_g8:  { text: 'Falta de cooperação' },
        panss_g9:  { text: 'Conteúdo incomum do pensamento' },
        panss_g10: { text: 'Desorientação' },
        panss_g11: { text: 'Atenção prejudicada' },
        panss_g12: { text: 'Falta de julgamento e insight' },
        panss_g13: { text: 'Distúrbio da volição' },
        panss_g14: { text: 'Controle deficiente dos impulsos' },
        panss_g15: { text: 'Preocupação' },
        panss_g16: { text: 'Esquiva social ativa' },
      },
      scoreBands: [
        { label: 'Psicopatologia mínima', description: 'Carga mínima de sintomas.' },
        { label: 'Leve',                  description: 'Psicopatologia leve.' },
        { label: 'Moderada',              description: 'Psicopatologia moderada.' },
        { label: 'Grave–Extrema',         description: 'Psicopatologia grave a extrema.' },
      ],
    },
  },
};

// ─── STAI-S ───────────────────────────────────────────────────────────────────
export const STAI_S = {
  id: 'stai_s',
  title: 'State-Trait Anxiety Inventory — State subscale',
  shortTitle: 'STAI-S',
  version: 'STAI Form Y-1',
  beta: true,
  domain: 'Mental Health',
  construct: 'State anxiety',
  constructDescription: 'Measures current (state) anxiety — transitory emotional state characterised by feelings of tension, apprehension, nervousness, and worry right now.',
  timeframe: 'Right now, at this moment',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Chinese', 'Japanese'],
  instructions: 'A number of statements which people have used to describe themselves are given below. Read each statement and then select the appropriate option to indicate how you feel RIGHT NOW, that is, at this moment.',
  reference: 'Spielberger, C. D., Gorsuch, R. L., Lushene, R., Vagg, P. R., & Jacobs, G. A. (1983). Manual for the State-Trait Anxiety Inventory. Consulting Psychologists Press.',
  credit: 'Charles D. Spielberger.',
  copyright: '© 1968, 1977 by Charles D. Spielberger. Published by Mind Garden, Inc. Permission required for use.',
  maxScore: 80,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Sum of 20 items rated 1-4. Items 1, 2, 5, 8, 10, 11, 15, 16, 19, 20 are reverse-scored (4=1, 3=2, 2=3, 1=4). Total range: 20-80.',
  scoreBands: [
    { min: 20, max: 37, label: 'Low state anxiety',      color: '#2E7D32', description: 'Low anxiety at this moment.' },
    { min: 38, max: 44, label: 'Moderate state anxiety', color: '#F59E0B', description: 'Moderate state anxiety.' },
    { min: 45, max: 80, label: 'High state anxiety',     color: '#DC2626', description: 'High state anxiety.' },
  ],
  items: [
    { id: 'stais_1',  number: 1,  text: 'I feel calm', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_2',  number: 2,  text: 'I feel secure', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_3',  number: 3,  text: 'I am tense', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_4',  number: 4,  text: 'I feel strained', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_5',  number: 5,  text: 'I feel at ease', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_6',  number: 6,  text: 'I feel upset', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_7',  number: 7,  text: 'I am presently worrying over possible misfortunes', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_8',  number: 8,  text: 'I feel satisfied', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_9',  number: 9,  text: 'I feel frightened', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_10', number: 10, text: 'I feel comfortable', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_11', number: 11, text: 'I feel self-confident', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_12', number: 12, text: 'I feel nervous', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_13', number: 13, text: 'I am jittery', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_14', number: 14, text: 'I feel indecisive', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_15', number: 15, text: 'I am relaxed', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_16', number: 16, text: 'I feel content', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_17', number: 17, text: 'I am worried', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_18', number: 18, text: 'I feel confused', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_19', number: 19, text: 'I feel steady', type: 'single_choice', options: STAI_STATE_OPTS },
    { id: 'stais_20', number: 20, text: 'I feel pleasant', type: 'single_choice', options: STAI_STATE_OPTS },
  ],
  score: (answers) => {
    const reverseItems = new Set([1, 2, 5, 8, 10, 11, 15, 16, 19, 20]);
    let total = 0;
    for (let i = 1; i <= 20; i++) {
      const raw = answers[`stais_${i}`] ?? 0;
      total += reverseItems.has(i) ? (5 - raw) : raw;
    }
    return total;
  },
  interpret: (score) => {
    if (score <= 37) return { label: 'Low state anxiety',      color: '#2E7D32', description: 'Low anxiety at this moment.' };
    if (score <= 44) return { label: 'Moderate state anxiety', color: '#F59E0B', description: 'Moderate state anxiety.' };
    return                 { label: 'High state anxiety',      color: '#DC2626', description: 'High state anxiety.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Abaixo estão uma série de afirmações que as pessoas usam para se descrever. Leia cada afirmação e selecione a opção adequada para indicar como você se sente AGORA, ou seja, neste momento.',
      items: {
        stais_1:  { text: 'Sinto-me calmo(a)' },
        stais_2:  { text: 'Sinto-me seguro(a)' },
        stais_3:  { text: 'Estou tenso(a)' },
        stais_4:  { text: 'Sinto-me sob pressão' },
        stais_5:  { text: 'Sinto-me à vontade' },
        stais_6:  { text: 'Sinto-me perturbado(a)' },
        stais_7:  { text: 'Estou preocupado(a) no momento com possíveis infortúnios' },
        stais_8:  { text: 'Sinto-me satisfeito(a)' },
        stais_9:  { text: 'Sinto-me com medo' },
        stais_10: { text: 'Sinto-me confortável' },
        stais_11: { text: 'Sinto-me autoconfiante' },
        stais_12: { text: 'Sinto-me nervoso(a)' },
        stais_13: { text: 'Estou agitado(a)' },
        stais_14: { text: 'Sinto-me indeciso(a)' },
        stais_15: { text: 'Estou relaxado(a)' },
        stais_16: { text: 'Sinto-me contente' },
        stais_17: { text: 'Estou preocupado(a)' },
        stais_18: { text: 'Sinto-me confuso(a)' },
        stais_19: { text: 'Sinto-me firme' },
        stais_20: { text: 'Sinto-me bem' },
      },
      scoreBands: [
        { label: 'Ansiedade-estado baixa',     description: 'Baixa ansiedade neste momento.' },
        { label: 'Ansiedade-estado moderada',  description: 'Ansiedade-estado moderada.' },
        { label: 'Ansiedade-estado elevada',   description: 'Ansiedade-estado elevada.' },
      ],
    },
  },
};

// ─── STAI-T ───────────────────────────────────────────────────────────────────
export const STAI_T = {
  id: 'stai_t',
  title: 'State-Trait Anxiety Inventory — Trait subscale',
  shortTitle: 'STAI-T',
  version: 'STAI Form Y-2',
  beta: true,
  domain: 'Mental Health',
  construct: 'Trait anxiety',
  constructDescription: 'Measures relatively stable individual differences in anxiety proneness — how people generally feel.',
  timeframe: 'General / how you usually feel',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Chinese', 'Japanese'],
  instructions: 'A number of statements which people have used to describe themselves are given below. Read each statement and select the option that indicates how you GENERALLY feel.',
  reference: 'Spielberger, C. D., Gorsuch, R. L., Lushene, R., Vagg, P. R., & Jacobs, G. A. (1983). Manual for the State-Trait Anxiety Inventory. Consulting Psychologists Press.',
  credit: 'Charles D. Spielberger.',
  copyright: '© 1968, 1977 by Charles D. Spielberger. Published by Mind Garden, Inc. Permission required for use.',
  maxScore: 80,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Sum of 20 items rated 1-4. Items 21, 26, 27, 30, 33, 34, 36, 39 are reverse-scored (4=1, 3=2, 2=3, 1=4). Total range: 20-80.',
  scoreBands: [
    { min: 20, max: 37, label: 'Low trait anxiety',      color: '#2E7D32', description: 'Low anxiety proneness.' },
    { min: 38, max: 44, label: 'Moderate trait anxiety', color: '#F59E0B', description: 'Moderate trait anxiety.' },
    { min: 45, max: 80, label: 'High trait anxiety',     color: '#DC2626', description: 'High trait anxiety.' },
  ],
  items: [
    { id: 'stait_21', number: 21, text: 'I feel pleasant', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_22', number: 22, text: 'I feel nervous and restless', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_23', number: 23, text: 'I feel satisfied with myself', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_24', number: 24, text: 'I wish I could be as happy as others seem to be', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_25', number: 25, text: 'I feel like a failure', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_26', number: 26, text: 'I feel rested', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_27', number: 27, text: 'I am "calm, cool, and collected"', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_28', number: 28, text: 'I feel that difficulties are piling up so that I cannot overcome them', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_29', number: 29, text: 'I worry too much over something that really does not matter', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_30', number: 30, text: 'I am happy', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_31', number: 31, text: 'I have disturbing thoughts', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_32', number: 32, text: 'I lack self-confidence', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_33', number: 33, text: 'I feel secure', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_34', number: 34, text: 'I make decisions easily', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_35', number: 35, text: 'I feel inadequate', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_36', number: 36, text: 'I am content', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_37', number: 37, text: 'Some unimportant thought runs through my mind and bothers me', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_38', number: 38, text: 'I take disappointments so keenly that I cannot put them out of my mind', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_39', number: 39, text: 'I am a steady person', type: 'single_choice', options: STAI_TRAIT_OPTS },
    { id: 'stait_40', number: 40, text: 'I get in a state of tension or turmoil as I think over my recent concerns and interests', type: 'single_choice', options: STAI_TRAIT_OPTS },
  ],
  score: (answers) => {
    const reverseItems = new Set([21, 26, 27, 30, 33, 34, 36, 39]);
    let total = 0;
    for (let i = 21; i <= 40; i++) {
      const raw = answers[`stait_${i}`] ?? 0;
      total += reverseItems.has(i) ? (5 - raw) : raw;
    }
    return total;
  },
  interpret: (score) => {
    if (score <= 37) return { label: 'Low trait anxiety',      color: '#2E7D32', description: 'Low anxiety proneness.' };
    if (score <= 44) return { label: 'Moderate trait anxiety', color: '#F59E0B', description: 'Moderate trait anxiety.' };
    return                 { label: 'High trait anxiety',      color: '#DC2626', description: 'High trait anxiety.' };
  },

  translations: {
    'pt-BR': {
      instructions: 'Abaixo estão uma série de afirmações que as pessoas usam para se descrever. Leia cada afirmação e selecione a opção que indica como você geralmente se sente.',
      items: {
        stait_21: { text: 'Sinto-me bem' },
        stait_22: { text: 'Sinto-me nervoso(a) e agitado(a)' },
        stait_23: { text: 'Sinto-me satisfeito(a) comigo mesmo(a)' },
        stait_24: { text: 'Gostaria de ser tão feliz quanto os outros parecem ser' },
        stait_25: { text: 'Sinto-me um fracasso' },
        stait_26: { text: 'Sinto-me descansado(a)' },
        stait_27: { text: 'Sou calmo(a), tranquilo(a) e controlado(a)' },
        stait_28: { text: 'Sinto que as dificuldades estão se acumulando de tal forma que não consigo superá-las' },
        stait_29: { text: 'Preocupo-me demais com coisas que na verdade não importam' },
        stait_30: { text: 'Sou feliz' },
        stait_31: { text: 'Tenho pensamentos perturbadores' },
        stait_32: { text: 'Falta-me autoconfiança' },
        stait_33: { text: 'Sinto-me seguro(a)' },
        stait_34: { text: 'Tomo decisões com facilidade' },
        stait_35: { text: 'Sinto-me inadequado(a)' },
        stait_36: { text: 'Estou contente' },
        stait_37: { text: 'Algum pensamento sem importância fica rodando na minha cabeça e me incomoda' },
        stait_38: { text: 'Fico tão abalado(a) com as decepções que não consigo tirá-las da cabeça' },
        stait_39: { text: 'Sou uma pessoa estável' },
        stait_40: { text: 'Fico tenso(a) ou agitado(a) quando penso nas minhas preocupações e interesses recentes' },
      },
      scoreBands: [
        { label: 'Ansiedade-traço baixa',     description: 'Baixa propensão à ansiedade.' },
        { label: 'Ansiedade-traço moderada',  description: 'Ansiedade-traço moderada.' },
        { label: 'Ansiedade-traço elevada',   description: 'Ansiedade-traço elevada.' },
      ],
    },
  },
};

export const MENTAL_HEALTH_QUESTIONNAIRES = [PHQ2, PHQ9, PHQ15, GAD7, GAD2, BDI2, BAI, DASS21, PANSS, STAI_S, STAI_T];

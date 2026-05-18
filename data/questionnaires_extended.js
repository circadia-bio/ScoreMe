/**
 * data/questionnaires_extended.js — Extended questionnaire definitions for ScoreMe
 *
 * Additional validated instruments spanning Mental Health, Wellbeing,
 * Physical Activity, and Neurodevelopmental domains.
 *
 * All instruments carry beta: true — scoring algorithms and item text have been
 * carefully reproduced from primary sources, but should be verified against the
 * originals before use in production studies.
 *
 * Domains covered:
 *   Mental Health  — PHQ-2, PHQ-9, PHQ-15, GAD-7, GAD-2, BDI-II, BAI,
 *                    DASS-21, PANSS, STAI-S, STAI-T
 *   Wellbeing      — WHOQOL-BREF, MacArthur SSS
 *   Physical Act.  — IPAQ (Short), GPAQ
 *   Neurodevelopment — Glasgow Sensory Questionnaire, AQ-10
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

const STAI_FREQ4 = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Moderately so' },
  { value: 4, label: 'Very much so' },
];

const STAI_FREQ4_TRAIT = [
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Almost always' },
];

const WHOQOL_OPTS5 = [
  { value: 1, label: 'Very poor / Very dissatisfied / Not at all' },
  { value: 2, label: 'Poor / Dissatisfied / A little' },
  { value: 3, label: 'Neither poor nor good / Neither / A moderate amount' },
  { value: 4, label: 'Good / Satisfied / Mostly' },
  { value: 5, label: 'Very good / Very satisfied / Completely' },
];

const GSQ_OPTS5 = [
  { value: 0, label: 'Not at all a problem' },
  { value: 1, label: 'A slight problem' },
  { value: 2, label: 'A moderate problem' },
  { value: 3, label: 'A great problem' },
  { value: 4, label: 'Always a problem' },
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
  constructDescription: 'Two-item ultra-brief screen for depressive symptoms over the past two weeks; positive screen (score ≥ 3) warrants follow-up with PHQ-9.',
  timeframe: 'Past two weeks',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese', 'Arabic'],

  instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',

  reference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2003). The Patient Health Questionnaire-2: Validity of a two-item depression screener. Medical Care, 41(11), 1284–1292.',
  credit: 'Kurt Kroenke & Robert L. Spitzer.',
  copyright: 'In the public domain. No restrictions on use.',

  maxScore: 6,
  scoringMethod: { type: 'sum', items: ['phq2_1', 'phq2_2'] },
  scoringNote: 'Sum of 2 items rated 0–3. Total range: 0–6. Cut-off ≥ 3 indicates positive screen.',
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

  reference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613.',
  credit: 'Kurt Kroenke & Robert L. Spitzer.',
  copyright: 'In the public domain. No restrictions on use.',

  maxScore: 27,
  scoringMethod: { type: 'sum', items: ['phq9_1','phq9_2','phq9_3','phq9_4','phq9_5','phq9_6','phq9_7','phq9_8','phq9_9'] },
  scoringNote: 'Sum of 9 items rated 0–3. Total range: 0–27.',
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

  reference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2002). The PHQ-15: Validity of a new measure for evaluating the severity of somatic symptoms. Psychosomatic Medicine, 64(2), 258–266.',
  credit: 'Kurt Kroenke & Robert L. Spitzer.',
  copyright: 'In the public domain. No restrictions on use.',

  maxScore: 30,
  scoringMethod: { type: 'sum', items: ['phq15_1','phq15_2','phq15_3','phq15_4','phq15_5','phq15_6','phq15_7','phq15_8','phq15_9','phq15_10','phq15_11','phq15_12','phq15_13','phq15_14','phq15_15'] },
  scoringNote: 'Sum of 15 items, each rated 0–2. Total range: 0–30.',
  scoreBands: [
    { min: 0,  max: 4,  label: 'Minimal somatic symptoms',  color: '#2E7D32', description: 'Minimal somatic symptom burden.' },
    { min: 5,  max: 9,  label: 'Low somatic symptoms',      color: '#F59E0B', description: 'Low somatic symptom severity.' },
    { min: 10, max: 14, label: 'Medium somatic symptoms',   color: '#EA580C', description: 'Medium somatic symptom severity. Consider clinical review.' },
    { min: 15, max: 30, label: 'High somatic symptoms',     color: '#DC2626', description: 'High somatic symptom burden. Clinical attention warranted.' },
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

  score: (answers) => {
    const keys = ['phq15_1','phq15_2','phq15_3','phq15_4','phq15_5','phq15_6','phq15_7','phq15_8','phq15_9','phq15_10','phq15_11','phq15_12','phq15_13','phq15_14','phq15_15'];
    return keys.reduce((s, k) => s + (answers[k] ?? 0), 0);
  },
  interpret: (score) => {
    if (score <= 4)  return { label: 'Minimal somatic symptoms', color: '#2E7D32', description: 'Minimal somatic symptom burden.' };
    if (score <= 9)  return { label: 'Low somatic symptoms',     color: '#F59E0B', description: 'Low somatic symptom severity.' };
    if (score <= 14) return { label: 'Medium somatic symptoms',  color: '#EA580C', description: 'Medium somatic symptom severity. Consider clinical review.' };
    return                 { label: 'High somatic symptoms',     color: '#DC2626', description: 'High somatic symptom burden. Clinical attention warranted.' };
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

  reference: 'Spitzer, R. L., Kroenke, K., Williams, J. B. W., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder. Archives of Internal Medicine, 166(10), 1092–1097.',
  credit: 'Robert L. Spitzer, Kurt Kroenke, Janet B. W. Williams, Bernd Löwe.',
  copyright: 'In the public domain. No restrictions on use.',

  maxScore: 21,
  scoringMethod: { type: 'sum', items: ['gad7_1','gad7_2','gad7_3','gad7_4','gad7_5','gad7_6','gad7_7'] },
  scoringNote: 'Sum of 7 items rated 0–3. Total range: 0–21.',
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
  constructDescription: 'Two-item ultra-brief screen for generalised anxiety disorder; positive screen (score ≥ 3) warrants follow-up with GAD-7.',
  timeframe: 'Past two weeks',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Dutch', 'Chinese'],

  instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',

  reference: 'Kroenke, K., Spitzer, R. L., Williams, J. B. W., Monahan, P. O., & Löwe, B. (2007). Anxiety disorders in primary care: Prevalence, impairment, comorbidity, and detection. Annals of Internal Medicine, 146(5), 317–325.',
  credit: 'Robert L. Spitzer, Kurt Kroenke, Janet B. W. Williams, Bernd Löwe.',
  copyright: 'In the public domain. No restrictions on use.',

  maxScore: 6,
  scoringMethod: { type: 'sum', items: ['gad2_1', 'gad2_2'] },
  scoringNote: 'Sum of 2 items rated 0–3. Total range: 0–6. Cut-off ≥ 3 indicates positive screen.',
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
};

// ─── BDI-II ───────────────────────────────────────────────────────────────────
export const BDI2 = {
  id: 'bdi2',
  title: "Beck Depression Inventory — Second Edition",
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
  scoringNote: 'Sum of 21 items each rated 0–3. Total range: 0–63.',
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
    { id: 'bdi2_4',  number: 4,  text: 'Loss of pleasure', type: 'single_choice', options: [{ value: 0, label: 'I get as much pleasure as I ever did from the things I enjoy.' }, { value: 1, label: 'I don\'t enjoy things as much as I used to.' }, { value: 2, label: 'I get very little pleasure from the things I used to enjoy.' }, { value: 3, label: 'I can\'t get any pleasure from the things I used to enjoy.' }] },
    { id: 'bdi2_5',  number: 5,  text: 'Guilty feelings', type: 'single_choice', options: [{ value: 0, label: 'I don\'t feel particularly guilty.' }, { value: 1, label: 'I feel guilty over many things I have done or should have done.' }, { value: 2, label: 'I feel quite guilty most of the time.' }, { value: 3, label: 'I feel guilty all of the time.' }] },
    { id: 'bdi2_6',  number: 6,  text: 'Punishment feelings', type: 'single_choice', options: [{ value: 0, label: 'I don\'t feel I am being punished.' }, { value: 1, label: 'I feel I may be punished.' }, { value: 2, label: 'I expect to be punished.' }, { value: 3, label: 'I feel I am being punished.' }] },
    { id: 'bdi2_7',  number: 7,  text: 'Self-dislike', type: 'single_choice', options: [{ value: 0, label: 'I feel the same about myself as ever.' }, { value: 1, label: 'I have lost confidence in myself.' }, { value: 2, label: 'I am disappointed in myself.' }, { value: 3, label: 'I dislike myself.' }] },
    { id: 'bdi2_8',  number: 8,  text: 'Self-criticalness', type: 'single_choice', options: [{ value: 0, label: 'I don\'t criticize or blame myself more than usual.' }, { value: 1, label: 'I am more critical of myself than I used to be.' }, { value: 2, label: 'I criticize myself for all of my faults.' }, { value: 3, label: 'I blame myself for everything bad that happens.' }] },
    { id: 'bdi2_9',  number: 9,  text: 'Suicidal thoughts or wishes', type: 'single_choice', options: [{ value: 0, label: 'I don\'t have any thoughts of killing myself.' }, { value: 1, label: 'I have thoughts of killing myself, but I would not carry them out.' }, { value: 2, label: 'I would like to kill myself.' }, { value: 3, label: 'I would kill myself if I had the chance.' }] },
    { id: 'bdi2_10', number: 10, text: 'Crying', type: 'single_choice', options: [{ value: 0, label: 'I don\'t cry any more than I used to.' }, { value: 1, label: 'I cry more than I used to.' }, { value: 2, label: 'I cry over every little thing.' }, { value: 3, label: 'I feel like crying, but I can\'t.' }] },
    { id: 'bdi2_11', number: 11, text: 'Agitation', type: 'single_choice', options: [{ value: 0, label: 'I am no more restless or wound up than usual.' }, { value: 1, label: 'I feel more restless or wound up than usual.' }, { value: 2, label: 'I am so restless or agitated that it\'s hard to stay still.' }, { value: 3, label: 'I am so restless or agitated that I have to keep moving or doing something.' }] },
    { id: 'bdi2_12', number: 12, text: 'Loss of interest', type: 'single_choice', options: [{ value: 0, label: 'I have not lost interest in other people or activities.' }, { value: 1, label: 'I am less interested in other people or things than before.' }, { value: 2, label: 'I have lost most of my interest in other people or things.' }, { value: 3, label: 'It\'s hard to get interested in anything.' }] },
    { id: 'bdi2_13', number: 13, text: 'Indecisiveness', type: 'single_choice', options: [{ value: 0, label: 'I make decisions about as well as ever.' }, { value: 1, label: 'I find it more difficult to make decisions than usual.' }, { value: 2, label: 'I have much greater difficulty in making decisions than I used to.' }, { value: 3, label: 'I have trouble making any decisions at all.' }] },
    { id: 'bdi2_14', number: 14, text: 'Worthlessness', type: 'single_choice', options: [{ value: 0, label: 'I do not feel I am worthless.' }, { value: 1, label: 'I don\'t consider myself as worthwhile and useful as I used to be.' }, { value: 2, label: 'I feel more worthless as compared to other people.' }, { value: 3, label: 'I feel utterly worthless.' }] },
    { id: 'bdi2_15', number: 15, text: 'Loss of energy', type: 'single_choice', options: [{ value: 0, label: 'I have as much energy as ever.' }, { value: 1, label: 'I have less energy than I used to have.' }, { value: 2, label: 'I don\'t have enough energy to do very much.' }, { value: 3, label: 'I don\'t have enough energy to do anything.' }] },
    { id: 'bdi2_16', number: 16, text: 'Changes in sleeping pattern', type: 'single_choice', options: [{ value: 0, label: 'I have not experienced any change in my sleeping pattern.' }, { value: 1, label: 'I sleep somewhat more / less than usual.' }, { value: 2, label: 'I sleep a lot more / less than usual.' }, { value: 3, label: 'I sleep most of the day / I wake up 1–2 hours early and can\'t get back to sleep.' }] },
    { id: 'bdi2_17', number: 17, text: 'Irritability', type: 'single_choice', options: [{ value: 0, label: 'I am no more irritable than usual.' }, { value: 1, label: 'I am more irritable than usual.' }, { value: 2, label: 'I am much more irritable than usual.' }, { value: 3, label: 'I am irritable all the time.' }] },
    { id: 'bdi2_18', number: 18, text: 'Changes in appetite', type: 'single_choice', options: [{ value: 0, label: 'I have not experienced any change in my appetite.' }, { value: 1, label: 'My appetite is somewhat less / greater than usual.' }, { value: 2, label: 'My appetite is much less / greater than before.' }, { value: 3, label: 'I have no appetite at all / I crave food all the time.' }] },
    { id: 'bdi2_19', number: 19, text: 'Concentration difficulty', type: 'single_choice', options: [{ value: 0, label: 'I can concentrate as well as ever.' }, { value: 1, label: 'I can\'t concentrate as well as usual.' }, { value: 2, label: 'It\'s hard to keep my mind on anything for very long.' }, { value: 3, label: 'I find I can\'t concentrate on anything.' }] },
    { id: 'bdi2_20', number: 20, text: 'Tiredness or fatigue', type: 'single_choice', options: [{ value: 0, label: 'I am no more tired or fatigued than usual.' }, { value: 1, label: 'I get more tired or fatigued more easily than usual.' }, { value: 2, label: 'I am too tired or fatigued to do a lot of the things I used to do.' }, { value: 3, label: 'I am too tired or fatigued to do most of the things I used to do.' }] },
    { id: 'bdi2_21', number: 21, text: 'Loss of interest in sex', type: 'single_choice', options: [{ value: 0, label: 'I have not noticed any recent change in my interest in sex.' }, { value: 1, label: 'I am less interested in sex than I used to be.' }, { value: 2, label: 'I have almost no interest in sex.' }, { value: 3, label: 'I have lost interest in sex completely.' }] },
  ],

  score: (answers) => {
    const keys = ['bdi2_1','bdi2_2','bdi2_3','bdi2_4','bdi2_5','bdi2_6','bdi2_7','bdi2_8','bdi2_9','bdi2_10','bdi2_11','bdi2_12','bdi2_13','bdi2_14','bdi2_15','bdi2_16','bdi2_17','bdi2_18','bdi2_19','bdi2_20','bdi2_21'];
    return keys.reduce((s, k) => s + (answers[k] ?? 0), 0);
  },
  interpret: (score) => {
    if (score <= 13) return { label: 'Minimal depression',  color: '#2E7D32', description: 'Minimal depression.' };
    if (score <= 19) return { label: 'Mild depression',     color: '#F59E0B', description: 'Mild depression.' };
    if (score <= 28) return { label: 'Moderate depression', color: '#EA580C', description: 'Moderate depression.' };
    return                 { label: 'Severe depression',    color: '#DC2626', description: 'Severe depression.' };
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

  reference: 'Beck, A. T., Epstein, N., Brown, G., & Steer, R. A. (1988). An inventory for measuring clinical anxiety: Psychometric properties. Journal of Consulting and Clinical Psychology, 56(6), 893–897.',
  credit: 'Aaron T. Beck.',
  copyright: '© 1987 Aaron T. Beck. Published by The Psychological Corporation. All rights reserved. Permission required for use.',

  maxScore: 63,
  scoringMethod: { type: 'sum', items: ['bai1','bai2','bai3','bai4','bai5','bai6','bai7','bai8','bai9','bai10','bai11','bai12','bai13','bai14','bai15','bai16','bai17','bai18','bai19','bai20','bai21'] },
  scoringNote: 'Sum of 21 items each rated 0–3. Total range: 0–63.',
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

  score: (answers) => {
    const keys = ['bai1','bai2','bai3','bai4','bai5','bai6','bai7','bai8','bai9','bai10','bai11','bai12','bai13','bai14','bai15','bai16','bai17','bai18','bai19','bai20','bai21'];
    return keys.reduce((s, k) => s + (answers[k] ?? 0), 0);
  },
  interpret: (score) => {
    if (score <= 7)  return { label: 'Minimal anxiety',  color: '#2E7D32', description: 'Minimal anxiety.' };
    if (score <= 15) return { label: 'Mild anxiety',     color: '#F59E0B', description: 'Mild anxiety.' };
    if (score <= 25) return { label: 'Moderate anxiety', color: '#EA580C', description: 'Moderate anxiety.' };
    return                 { label: 'Severe anxiety',    color: '#DC2626', description: 'Severe anxiety.' };
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

  instructions: "Please read each statement and circle a number 0, 1, 2, or 3 that indicates how much the statement applied to you over the past week. There are no right or wrong answers. Do not spend too much time on any statement.",

  reference: 'Lovibond, S. H., & Lovibond, P. F. (1995). Manual for the Depression Anxiety Stress Scales (2nd ed.). Psychology Foundation.',
  credit: 'Sydney H. Lovibond & Peter F. Lovibond, University of New South Wales.',
  copyright: '© P. F. Lovibond & S. H. Lovibond. Available free of charge for non-commercial use.',

  maxScore: 42,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Three subscales (Depression, Anxiety, Stress), each summing 7 items rated 0–3. Each subscale raw score is multiplied by 2 for comparison with DASS-42 norms. Depression items: 3, 5, 10, 13, 16, 17, 21. Anxiety items: 2, 4, 7, 9, 15, 19, 20. Stress items: 1, 6, 8, 11, 12, 14, 18.',
  scoreBands: [
    { min: 0,  max: 13, label: 'Normal–Mild',   color: '#2E7D32', description: 'Total score in the normal to mild range. Refer to subscale breakdown.' },
    { min: 14, max: 28, label: 'Moderate',      color: '#F59E0B', description: 'Moderate overall distress. Refer to subscale breakdown.' },
    { min: 29, max: 42, label: 'Severe–Extreme', color: '#DC2626', description: 'Severe to extreme distress. Clinical evaluation recommended.' },
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
    { id: 'dass21_17', number: 17, text: 'I felt I wasn\'t worth much as a person', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_18', number: 18, text: 'I felt that I was rather touchy', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_19', number: 19, text: 'I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_20', number: 20, text: 'I felt scared without any good reason', type: 'single_choice', options: DASS_FREQ4 },
    { id: 'dass21_21', number: 21, text: 'I felt that life was meaningless', type: 'single_choice', options: DASS_FREQ4 },
  ],

  score: (answers) => {
    const depItems   = ['dass21_3','dass21_5','dass21_10','dass21_13','dass21_16','dass21_17','dass21_21'];
    const anxItems   = ['dass21_2','dass21_4','dass21_7','dass21_9','dass21_15','dass21_19','dass21_20'];
    const stressItems = ['dass21_1','dass21_6','dass21_8','dass21_11','dass21_12','dass21_14','dass21_18'];
    const dep    = depItems.reduce((s, k) => s + (answers[k] ?? 0), 0) * 2;
    const anx    = anxItems.reduce((s, k) => s + (answers[k] ?? 0), 0) * 2;
    const stress = stressItems.reduce((s, k) => s + (answers[k] ?? 0), 0) * 2;
    return { total: dep + anx + stress, depression: dep, anxiety: anx, stress };
  },
  interpret: (score) => {
    const s = typeof score === 'object' ? score.total : score;
    if (s <= 13) return { label: 'Normal–Mild',    color: '#2E7D32', description: 'Total score in the normal to mild range. Refer to subscale breakdown.' };
    if (s <= 28) return { label: 'Moderate',       color: '#F59E0B', description: 'Moderate overall distress. Refer to subscale breakdown.' };
    return             { label: 'Severe–Extreme',  color: '#DC2626', description: 'Severe to extreme distress. Clinical evaluation recommended.' };
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

  reference: 'Kay, S. R., Fiszbein, A., & Opler, L. A. (1987). The Positive and Negative Syndrome Scale (PANSS) for schizophrenia. Schizophrenia Bulletin, 13(2), 261–276.',
  credit: 'Stanley R. Kay, Abraham Fiszbein, & Lewis A. Opler.',
  copyright: '© Multi-Health Systems (MHS). All rights reserved. Licensing required for clinical and research use.',

  maxScore: 210,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Three subscales: Positive (P1–P7, range 7–49), Negative (N1–N7, range 7–49), General Psychopathology (G1–G16, range 16–112). Total score = sum of all three subscales (range 30–210). Each item rated 1 (absent) to 7 (extreme).',
  scoreBands: [
    { min: 30,  max: 58,  label: 'Minimal psychopathology', color: '#2E7D32', description: 'Minimal symptom burden.' },
    { min: 59,  max: 75,  label: 'Mild',                    color: '#F59E0B', description: 'Mild psychopathology.' },
    { min: 76,  max: 95,  label: 'Moderate',                color: '#EA580C', description: 'Moderate psychopathology.' },
    { min: 96,  max: 210, label: 'Severe–Extreme',          color: '#DC2626', description: 'Severe to extreme psychopathology.' },
  ],

  items: [
    // Positive scale
    { id: 'panss_p1', number: 'P1', text: 'Delusions', type: 'scale_0_4', hint: 'Beliefs which are unfounded, unrealistic and idiosyncratic.', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_p2', number: 'P2', text: 'Conceptual disorganization', type: 'scale_0_4', hint: 'Disorganized process of thinking characterised by disruption of goal-directed sequencing.', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_p3', number: 'P3', text: 'Hallucinatory behaviour', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_p4', number: 'P4', text: 'Excitement', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_p5', number: 'P5', text: 'Grandiosity', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_p6', number: 'P6', text: 'Suspiciousness/persecution', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_p7', number: 'P7', text: 'Hostility', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    // Negative scale
    { id: 'panss_n1', number: 'N1', text: 'Blunted affect', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_n2', number: 'N2', text: 'Emotional withdrawal', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_n3', number: 'N3', text: 'Poor rapport', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_n4', number: 'N4', text: 'Passive/apathetic social withdrawal', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_n5', number: 'N5', text: 'Difficulty in abstract thinking', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_n6', number: 'N6', text: 'Lack of spontaneity and flow of conversation', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_n7', number: 'N7', text: 'Stereotyped thinking', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    // General Psychopathology scale
    { id: 'panss_g1',  number: 'G1',  text: 'Somatic concern', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g2',  number: 'G2',  text: 'Anxiety', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g3',  number: 'G3',  text: 'Guilt feelings', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g4',  number: 'G4',  text: 'Tension', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g5',  number: 'G5',  text: 'Mannerisms and posturing', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g6',  number: 'G6',  text: 'Depression', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g7',  number: 'G7',  text: 'Motor retardation', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g8',  number: 'G8',  text: 'Uncooperativeness', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g9',  number: 'G9',  text: 'Unusual thought content', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g10', number: 'G10', text: 'Disorientation', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g11', number: 'G11', text: 'Poor attention', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g12', number: 'G12', text: 'Lack of judgement and insight', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g13', number: 'G13', text: 'Disturbance of volition', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g14', number: 'G14', text: 'Poor impulse control', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g15', number: 'G15', text: 'Preoccupation', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
    { id: 'panss_g16', number: 'G16', text: 'Active social avoidance', type: 'scale_0_4', options: [{ value: 1, label: 'Absent' },{ value: 2, label: 'Minimal' },{ value: 3, label: 'Mild' },{ value: 4, label: 'Moderate' },{ value: 5, label: 'Moderate–severe' },{ value: 6, label: 'Severe' },{ value: 7, label: 'Extreme' }] },
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
    if (s <= 58)  return { label: 'Minimal psychopathology', color: '#2E7D32', description: 'Minimal symptom burden.' };
    if (s <= 75)  return { label: 'Mild',                    color: '#F59E0B', description: 'Mild psychopathology.' };
    if (s <= 95)  return { label: 'Moderate',                color: '#EA580C', description: 'Moderate psychopathology.' };
    return              { label: 'Severe–Extreme',           color: '#DC2626', description: 'Severe to extreme psychopathology.' };
  },
};

// ─── STAI-S (State Anxiety) ────────────────────────────────────────────────────
export const STAI_S = {
  id: 'stai_s',
  title: 'State–Trait Anxiety Inventory — State subscale',
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
  scoringNote: 'Sum of 20 items rated 1–4. Items 1, 2, 5, 8, 10, 11, 15, 16, 19, 20 are reverse-scored (R: 4=1, 3=2, 2=3, 1=4). Total range: 20–80.',
  scoreBands: [
    { min: 20, max: 37, label: 'Low state anxiety',      color: '#2E7D32', description: 'Low anxiety at this moment.' },
    { min: 38, max: 44, label: 'Moderate state anxiety', color: '#F59E0B', description: 'Moderate state anxiety.' },
    { min: 45, max: 80, label: 'High state anxiety',     color: '#DC2626', description: 'High state anxiety.' },
  ],

  items: [
    { id: 'stais_1',  number: 1,  text: 'I feel calm', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_2',  number: 2,  text: 'I feel secure', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_3',  number: 3,  text: 'I am tense', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_4',  number: 4,  text: 'I feel strained', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_5',  number: 5,  text: 'I feel at ease', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_6',  number: 6,  text: 'I feel upset', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_7',  number: 7,  text: 'I am presently worrying over possible misfortunes', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_8',  number: 8,  text: 'I feel satisfied', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_9',  number: 9,  text: 'I feel frightened', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_10', number: 10, text: 'I feel comfortable', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_11', number: 11, text: 'I feel self-confident', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_12', number: 12, text: 'I feel nervous', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_13', number: 13, text: 'I am jittery', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_14', number: 14, text: 'I feel indecisive', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_15', number: 15, text: 'I am relaxed', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_16', number: 16, text: 'I feel content', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_17', number: 17, text: 'I am worried', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_18', number: 18, text: 'I feel confused', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_19', number: 19, text: 'I feel steady', type: 'single_choice', options: STAI_FREQ4 },
    { id: 'stais_20', number: 20, text: 'I feel pleasant', type: 'single_choice', options: STAI_FREQ4 },
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
};

// ─── STAI-T (Trait Anxiety) ────────────────────────────────────────────────────
export const STAI_T = {
  id: 'stai_t',
  title: 'State–Trait Anxiety Inventory — Trait subscale',
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
  scoringNote: 'Sum of 20 items rated 1–4. Items 21, 26, 27, 30, 33, 34, 36 are reverse-scored (R: 4=1, 3=2, 2=3, 1=4). Total range: 20–80.',
  scoreBands: [
    { min: 20, max: 37, label: 'Low trait anxiety',      color: '#2E7D32', description: 'Low anxiety proneness.' },
    { min: 38, max: 44, label: 'Moderate trait anxiety', color: '#F59E0B', description: 'Moderate trait anxiety.' },
    { min: 45, max: 80, label: 'High trait anxiety',     color: '#DC2626', description: 'High trait anxiety.' },
  ],

  items: [
    { id: 'stait_21', number: 21, text: 'I feel pleasant', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_22', number: 22, text: 'I feel nervous and restless', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_23', number: 23, text: 'I feel satisfied with myself', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_24', number: 24, text: 'I wish I could be as happy as others seem to be', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_25', number: 25, text: 'I feel like a failure', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_26', number: 26, text: 'I feel rested', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_27', number: 27, text: 'I am "calm, cool, and collected"', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_28', number: 28, text: 'I feel that difficulties are piling up so that I cannot overcome them', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_29', number: 29, text: 'I worry too much over something that really does not matter', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_30', number: 30, text: 'I am happy', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_31', number: 31, text: 'I have disturbing thoughts', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_32', number: 32, text: 'I lack self-confidence', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_33', number: 33, text: 'I feel secure', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_34', number: 34, text: 'I make decisions easily', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_35', number: 35, text: 'I feel inadequate', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_36', number: 36, text: 'I am content', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_37', number: 37, text: 'Some unimportant thought runs through my mind and bothers me', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_38', number: 38, text: 'I take disappointments so keenly that I cannot put them out of my mind', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_39', number: 39, text: 'I am a steady person', type: 'single_choice', options: STAI_FREQ4_TRAIT },
    { id: 'stait_40', number: 40, text: 'I get in a state of tension or turmoil as I think over my recent concerns and interests', type: 'single_choice', options: STAI_FREQ4_TRAIT },
  ],

  score: (answers) => {
    // Item numbers 21–40; reverse items: 21, 26, 27, 30, 33, 34, 36, 39 (positive affect items)
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
};

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

  instructions: 'This questionnaire asks how you feel about your quality of life, health, or other areas of your life. Please answer all the questions. If you are unsure about which response to give to a question, please choose the one that appears most appropriate. Please answer all the questions thinking about your life over the past two weeks.',

  reference: 'WHOQOL Group. (1998). Development of the World Health Organization WHOQOL-BREF quality of life assessment. Psychological Medicine, 28(3), 551–558.',
  credit: 'World Health Organization Quality of Life Group.',
  copyright: '© World Health Organization. Freely available for non-commercial research use.',

  maxScore: 100,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Four domain scores, each transformed to a 0–100 scale: Physical Health (items 3, 4, 10, 15, 16, 17, 18); Psychological (items 5, 6, 7, 11, 19, 26); Social (items 20, 21, 22); Environment (items 8, 9, 12, 13, 14, 23, 24, 25). Items 3, 4, 26 are reverse-scored. Global items 1 and 2 are scored separately.',
  scoreBands: [
    { min: 0,  max: 40, label: 'Poor QoL',     color: '#DC2626', description: 'Poor quality of life.' },
    { min: 41, max: 60, label: 'Moderate QoL', color: '#EA580C', description: 'Moderate quality of life.' },
    { min: 61, max: 80, label: 'Good QoL',     color: '#F59E0B', description: 'Good quality of life.' },
    { min: 81, max: 100, label: 'Very good QoL', color: '#2E7D32', description: 'Very good quality of life.' },
  ],

  items: [
    { id: 'whoqol_1',  number: 1,  text: 'How would you rate your quality of life?', type: 'single_choice', options: [{ value: 1, label: 'Very poor' },{ value: 2, label: 'Poor' },{ value: 3, label: 'Neither poor nor good' },{ value: 4, label: 'Good' },{ value: 5, label: 'Very good' }] },
    { id: 'whoqol_2',  number: 2,  text: 'How satisfied are you with your health?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
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
    { id: 'whoqol_16', number: 16, text: 'How satisfied are you with your sleep?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_17', number: 17, text: 'How satisfied are you with your ability to perform your daily living activities?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_18', number: 18, text: 'How satisfied are you with your capacity for work?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_19', number: 19, text: 'How satisfied are you with yourself?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_20', number: 20, text: 'How satisfied are you with your personal relationships?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_21', number: 21, text: 'How satisfied are you with your sex life?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_22', number: 22, text: 'How satisfied are you with the support you get from your friends?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_23', number: 23, text: 'How satisfied are you with the conditions of your living place?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_24', number: 24, text: 'How satisfied are you with your access to health services?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_25', number: 25, text: 'How satisfied are you with your transport?', type: 'single_choice', options: [{ value: 1, label: 'Very dissatisfied' },{ value: 2, label: 'Dissatisfied' },{ value: 3, label: 'Neither satisfied nor dissatisfied' },{ value: 4, label: 'Satisfied' },{ value: 5, label: 'Very satisfied' }] },
    { id: 'whoqol_26', number: 26, text: 'How often do you have negative feelings such as blue mood, despair, anxiety, depression?', type: 'single_choice', options: [{ value: 5, label: 'Never' },{ value: 4, label: 'Seldom' },{ value: 3, label: 'Quite often' },{ value: 2, label: 'Very often' },{ value: 1, label: 'Always' }], hint: 'Reverse-scored.' },
  ],

  score: (answers) => {
    const r = (k) => answers[k] ?? 0;
    const physRaw = r('whoqol_3') + r('whoqol_4') + r('whoqol_10') + r('whoqol_15') + r('whoqol_16') + r('whoqol_17') + r('whoqol_18');
    const psyRaw  = r('whoqol_5') + r('whoqol_6') + r('whoqol_7') + r('whoqol_11') + r('whoqol_19') + r('whoqol_26');
    const socRaw  = r('whoqol_20') + r('whoqol_21') + r('whoqol_22');
    const envRaw  = r('whoqol_8') + r('whoqol_9') + r('whoqol_12') + r('whoqol_13') + r('whoqol_14') + r('whoqol_23') + r('whoqol_24') + r('whoqol_25');
    // Transform each domain to 0–100: (raw / max) * 100
    const phys = Math.round(physRaw / 35 * 100);
    const psy  = Math.round(psyRaw  / 30 * 100);
    const soc  = Math.round(socRaw  / 15 * 100);
    const env  = Math.round(envRaw  / 40 * 100);
    const overall = Math.round((phys + psy + soc + env) / 4);
    return { total: overall, physical: phys, psychological: psy, social: soc, environment: env };
  },
  interpret: (score) => {
    const s = typeof score === 'object' ? score.total : score;
    if (s <= 40)  return { label: 'Poor QoL',     color: '#DC2626', description: 'Poor quality of life.' };
    if (s <= 60)  return { label: 'Moderate QoL', color: '#EA580C', description: 'Moderate quality of life.' };
    if (s <= 80)  return { label: 'Good QoL',     color: '#F59E0B', description: 'Good quality of life.' };
    return              { label: 'Very good QoL', color: '#2E7D32', description: 'Very good quality of life.' };
  },
};

// ─── MacArthur Subjective Social Status ───────────────────────────────────────
export const MACARTHUR_SSS = {
  id: 'macarthur_sss',
  title: 'MacArthur Scale of Subjective Social Status',
  shortTitle: 'MacArthur SSS',
  version: 'MacArthur SSS',
  beta: true,
  domain: 'Wellbeing',

  construct: 'Subjective social status',
  constructDescription: 'Assesses an individual\'s subjective perception of their position in the social hierarchy relative to others in their society and in their local community, using a 10-rung ladder metaphor.',
  timeframe: 'Current perception',
  languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese'],

  instructions: 'Think of this ladder as representing where people stand in their communities. People at the top of the ladder are those who are best off — they have the most money, the most education, and the most respected jobs. People at the bottom are those who are worst off. Where would you place yourself on this ladder?',

  reference: 'Adler, N. E., Epel, E. S., Castellazzo, G., & Ickovics, J. R. (2000). Relationship of subjective and objective social status with psychological and physiological functioning: Preliminary data in healthy White women. Health Psychology, 19(6), 586–592.',
  credit: 'Nancy E. Adler, University of California, San Francisco.',
  copyright: '© The MacArthur Research Network on SES and Health. Freely available for research use.',

  maxScore: 10,
  scoringMethod: { type: 'sum', items: ['mac_sss_society', 'mac_sss_community'] },
  scoringNote: 'Two ladder ratings (Society and Community), each 1–10. Society ladder: position in society overall. Community ladder: position in the local community.',
  scoreBands: [
    { min: 2,  max: 8,  label: 'Low social status',      color: '#EA580C', description: 'Low perceived social status.' },
    { min: 9,  max: 14, label: 'Moderate social status', color: '#F59E0B', description: 'Moderate perceived social status.' },
    { min: 15, max: 20, label: 'High social status',     color: '#2E7D32', description: 'High perceived social status.' },
  ],

  items: [
    { id: 'mac_sss_society',   number: 1, text: 'Society ladder: Think of this ladder as representing where people stand in society. Where would you place yourself on this ladder?', type: 'scale_1_10', options: [{ value: 1, label: '1 — Bottom' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' }, { value: 9, label: '9' }, { value: 10, label: '10 — Top' }] },
    { id: 'mac_sss_community', number: 2, text: 'Community ladder: Think of this ladder as representing where people stand in your local community. Where would you place yourself on this ladder?', type: 'scale_1_10', options: [{ value: 1, label: '1 — Bottom' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' }, { value: 9, label: '9' }, { value: 10, label: '10 — Top' }] },
  ],

  score: (answers) => (answers['mac_sss_society'] ?? 0) + (answers['mac_sss_community'] ?? 0),
  interpret: (score) => {
    if (score <= 8)  return { label: 'Low social status',      color: '#EA580C', description: 'Low perceived social status.' };
    if (score <= 14) return { label: 'Moderate social status', color: '#F59E0B', description: 'Moderate perceived social status.' };
    return                 { label: 'High social status',      color: '#2E7D32', description: 'High perceived social status.' };
  },
};

// ─── IPAQ (Short Form) ────────────────────────────────────────────────────────
export const IPAQ_SHORT = {
  id: 'ipaq_short',
  title: 'International Physical Activity Questionnaire — Short Form',
  shortTitle: 'IPAQ-S',
  version: 'IPAQ Short Form',
  beta: true,
  domain: 'Physical Activity',

  construct: 'Physical activity level',
  constructDescription: 'Estimates weekly physical activity across vigorous, moderate, walking, and sitting time over the last 7 days. Output is MET-minutes/week; categorical classification (Low, Moderate, High) is also provided.',
  timeframe: 'Last 7 days',
  languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Dutch', 'Chinese', 'Arabic', 'Japanese'],

  instructions: 'We are interested in finding out about the kinds of physical activities that people do as part of their everyday lives. The questions will ask you about the time you spent being physically active in the last 7 days.',

  reference: 'Craig, C. L., Marshall, A. L., Sjostrom, M., et al. (2003). International Physical Activity Questionnaire: 12-country reliability and validity. Medicine & Science in Sports & Exercise, 35(8), 1381–1395.',
  credit: 'IPAQ Research Committee.',
  copyright: 'Freely available for non-commercial research use. See ipaq.ki.se.',

  maxScore: null,
  scoringMethod: { type: 'composite' },
  scoringNote: 'MET-minutes/week: Vigorous MET = days × minutes × 8.0; Moderate MET = days × minutes × 4.0; Walking MET = days × minutes × 3.3. Total = sum. Low: < 600; Moderate: 600–3000 or 3 days vigorous ≥ 20 min or 5 days moderate/walking ≥ 30 min; High: 7 days any activity ≥ 3000 MET-min/week or ≥ 5 days vigorous ≥ 1500 MET-min/week.',
  scoreBands: [
    { min: 0,    max: 599,  label: 'Inactive (Low)',      color: '#DC2626', description: 'Low physical activity level. Does not meet recommended activity guidelines.' },
    { min: 600,  max: 2999, label: 'Minimally active (Moderate)', color: '#F59E0B', description: 'Minimally active. Meets some but not all activity guidelines.' },
    { min: 3000, max: Infinity, label: 'HEPA Active (High)', color: '#2E7D32', description: 'Health-enhancing physical activity level.' },
  ],

  items: [
    { id: 'ipaq_vigd', number: 1, text: 'During the last 7 days, on how many days did you do vigorous physical activities like heavy lifting, digging, aerobics, or fast bicycling?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'ipaq_vigm', number: 2, text: 'How much time did you usually spend doing vigorous physical activities on one of those days?', type: 'duration_min', min: 0, max: 960, unit: 'min', hint: 'Enter 0 if no vigorous activity.' },
    { id: 'ipaq_modd', number: 3, text: 'During the last 7 days, on how many days did you do moderate physical activities like carrying light loads, bicycling at regular pace, or doubles tennis?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'ipaq_modm', number: 4, text: 'How much time did you usually spend doing moderate physical activities on one of those days?', type: 'duration_min', min: 0, max: 960, unit: 'min', hint: 'Enter 0 if no moderate activity.' },
    { id: 'ipaq_walkd', number: 5, text: 'During the last 7 days, on how many days did you walk for at least 10 minutes at a time?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'ipaq_walkm', number: 6, text: 'How much time did you usually spend walking on one of those days?', type: 'duration_min', min: 0, max: 960, unit: 'min', hint: 'Include walking at work and home, for transport, and for recreation and sport.' },
    { id: 'ipaq_sitm',  number: 7, text: 'During the last 7 days, how much time did you spend sitting on a week day?', type: 'duration_min', min: 0, max: 1440, unit: 'min', hint: 'Include time spent at work, at home, while doing coursework, and during leisure time.' },
  ],

  score: (answers) => {
    const vigd  = answers['ipaq_vigd'] ?? 0;
    const vigm  = answers['ipaq_vigm'] ?? 0;
    const modd  = answers['ipaq_modd'] ?? 0;
    const modm  = answers['ipaq_modm'] ?? 0;
    const walkd = answers['ipaq_walkd'] ?? 0;
    const walkm = answers['ipaq_walkm'] ?? 0;
    const total = (vigd * vigm * 8.0) + (modd * modm * 4.0) + (walkd * walkm * 3.3);
    return Math.round(total);
  },
  interpret: (score) => {
    if (score < 600)  return { label: 'Inactive (Low)',               color: '#DC2626', description: 'Low physical activity level. Does not meet recommended activity guidelines.' };
    if (score < 3000) return { label: 'Minimally active (Moderate)',  color: '#F59E0B', description: 'Minimally active. Meets some but not all activity guidelines.' };
    return                  { label: 'HEPA Active (High)',            color: '#2E7D32', description: 'Health-enhancing physical activity level.' };
  },
};

// ─── GPAQ ─────────────────────────────────────────────────────────────────────
export const GPAQ = {
  id: 'gpaq',
  title: 'Global Physical Activity Questionnaire',
  shortTitle: 'GPAQ',
  version: 'GPAQ v2',
  beta: true,
  domain: 'Physical Activity',

  construct: 'Physical activity and sedentary behaviour',
  constructDescription: 'Assesses physical activity in three domains (work, transport, leisure) and sedentary behaviour over a typical week using 16 items. Developed by the WHO for surveillance in developing countries.',
  timeframe: 'Typical week',
  languages: ['English', 'Arabic', 'Chinese', 'French', 'Portuguese', 'Russian', 'Spanish'],

  instructions: 'I am going to ask you about the time you spend doing different types of physical activity in a typical week. Please answer these questions even if you do not consider yourself to be a physically active person.',

  reference: 'Bull, F. C., Maslin, T. S., & Armstrong, T. (2009). Global Physical Activity Questionnaire (GPAQ): Nine country reliability and validity study. Journal of Physical Activity and Health, 6(6), 790–804.',
  credit: 'World Health Organization.',
  copyright: '© World Health Organization. Freely available for non-commercial research use.',

  maxScore: null,
  scoringMethod: { type: 'composite' },
  scoringNote: 'MET-minutes/week: Work vigorous = days × min × 8.0; Work moderate = days × min × 4.0; Transport = days × min × 4.0; Leisure vigorous = days × min × 8.0; Leisure moderate = days × min × 4.0. Categories: Insufficiently active < 600 MET-min/week; Sufficiently active ≥ 600 MET-min/week.',
  scoreBands: [
    { min: 0,   max: 599, label: 'Insufficiently active', color: '#DC2626', description: 'Insufficient physical activity. Below WHO minimum recommendations.' },
    { min: 600, max: Infinity, label: 'Sufficiently active', color: '#2E7D32', description: 'Sufficient physical activity. Meets WHO minimum recommendations.' },
  ],

  items: [
    // Work
    { id: 'gpaq_p1',  number: 'P1',  text: 'Does your work involve vigorous-intensity activity that causes large increases in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p2',  number: 'P2',  text: 'In a typical week, on how many days do you do vigorous-intensity activities as part of your work?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p3',  number: 'P3',  text: 'How much time do you spend doing vigorous-intensity activities at work on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    { id: 'gpaq_p4',  number: 'P4',  text: 'Does your work involve moderate-intensity activity that causes a small increase in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p5',  number: 'P5',  text: 'In a typical week, on how many days do you do moderate-intensity activities as part of your work?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p6',  number: 'P6',  text: 'How much time do you spend doing moderate-intensity activities at work on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    // Transport
    { id: 'gpaq_p7',  number: 'P7',  text: 'Do you walk or use a bicycle (pedal cycle) for at least 10 minutes continuously to get to and from places?', type: 'yes_no' },
    { id: 'gpaq_p8',  number: 'P8',  text: 'In a typical week, on how many days do you walk or cycle for at least 10 minutes continuously to get to and from places?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p9',  number: 'P9',  text: 'How much time do you spend walking or cycling for travel on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    // Recreational / Leisure
    { id: 'gpaq_p10', number: 'P10', text: 'Do you do any vigorous-intensity sports, fitness or recreational activities that cause large increases in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p11', number: 'P11', text: 'In a typical week, on how many days do you do vigorous-intensity sports, fitness or recreational activities?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p12', number: 'P12', text: 'How much time do you spend doing vigorous-intensity sports, fitness or recreational activities on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    { id: 'gpaq_p13', number: 'P13', text: 'Do you do any moderate-intensity sports, fitness or recreational activities that cause a small increase in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p14', number: 'P14', text: 'In a typical week, on how many days do you do moderate-intensity sports, fitness or recreational activities?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p15', number: 'P15', text: 'How much time do you spend doing moderate-intensity sports, fitness or recreational activities on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    // Sedentary
    { id: 'gpaq_p16', number: 'P16', text: 'How much time do you usually spend sitting or reclining on a typical day?', type: 'duration_min', min: 0, max: 1440, unit: 'min', hint: 'Include time at work, at home, getting to and from places, and with friends.' },
  ],

  score: (answers) => {
    const g = (k) => answers[k] ?? 0;
    const yn = (k) => answers[k] === 'yes' ? 1 : 0;
    const workVig  = yn('gpaq_p1')  * g('gpaq_p2')  * g('gpaq_p3')  * 8.0;
    const workMod  = yn('gpaq_p4')  * g('gpaq_p5')  * g('gpaq_p6')  * 4.0;
    const transport = yn('gpaq_p7') * g('gpaq_p8')  * g('gpaq_p9')  * 4.0;
    const leisVig  = yn('gpaq_p10') * g('gpaq_p11') * g('gpaq_p12') * 8.0;
    const leisMod  = yn('gpaq_p13') * g('gpaq_p14') * g('gpaq_p15') * 4.0;
    return Math.round(workVig + workMod + transport + leisVig + leisMod);
  },
  interpret: (score) => {
    if (score < 600) return { label: 'Insufficiently active', color: '#DC2626', description: 'Insufficient physical activity. Below WHO minimum recommendations.' };
    return                 { label: 'Sufficiently active',    color: '#2E7D32', description: 'Sufficient physical activity. Meets WHO minimum recommendations.' };
  },
};

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

  reference: 'Robertson, A. E., & Simmons, D. R. (2013). The relationship between sensory sensitivity and autistic traits in the general population. Journal of Autism and Developmental Disorders, 43(4), 775–784.',
  credit: 'Ashley E. Robertson & David R. Simmons, University of Glasgow.',
  copyright: '© A. E. Robertson & D. R. Simmons. Available for research use.',

  maxScore: 112,
  scoringMethod: { type: 'sum', items: Array.from({ length: 28 }, (_, i) => `gsq_${i + 1}`) },
  scoringNote: 'Sum of 28 items rated 0–4. Total range: 0–112. Higher scores indicate greater sensory processing difficulties.',
  scoreBands: [
    { min: 0,  max: 28, label: 'Low sensory sensitivity',      color: '#2E7D32', description: 'Low level of sensory processing difficulties.' },
    { min: 29, max: 56, label: 'Mild sensory sensitivity',     color: '#F59E0B', description: 'Mild sensory processing difficulties.' },
    { min: 57, max: 84, label: 'Moderate sensory sensitivity', color: '#EA580C', description: 'Moderate sensory processing difficulties.' },
    { min: 85, max: 112, label: 'High sensory sensitivity',   color: '#DC2626', description: 'High level of sensory processing difficulties.' },
  ],

  items: [
    // Visual
    { id: 'gsq_1',  number: 1,  text: 'Flickering lights (e.g. fluorescent lights, reflections, sunlight through leaves)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_2',  number: 2,  text: 'Bright lights', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_3',  number: 3,  text: 'Intense or bright colours', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_4',  number: 4,  text: 'Depth perception (e.g. judging distances)', type: 'single_choice', options: GSQ_OPTS5 },
    // Auditory
    { id: 'gsq_5',  number: 5,  text: 'Loud sounds (e.g. music in a shopping centre)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_6',  number: 6,  text: 'Sudden or unexpected sounds (e.g. alarm, cough)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_7',  number: 7,  text: 'High-pitched sounds', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_8',  number: 8,  text: 'Certain frequencies of sound', type: 'single_choice', options: GSQ_OPTS5 },
    // Tactile
    { id: 'gsq_9',  number: 9,  text: 'Clothes being tight or touching certain parts of the body (e.g. neck, wrists)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_10', number: 10, text: 'Clothes with certain textures (e.g. itchy material)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_11', number: 11, text: 'Labels in clothing', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_12', number: 12, text: 'Being touched or bumped into by other people', type: 'single_choice', options: GSQ_OPTS5 },
    // Olfactory
    { id: 'gsq_13', number: 13, text: 'Strong perfumes or colognes', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_14', number: 14, text: 'Cooking smells', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_15', number: 15, text: 'Body odour of other people', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_16', number: 16, text: 'Chemical smells (e.g. cleaning products)', type: 'single_choice', options: GSQ_OPTS5 },
    // Gustatory
    { id: 'gsq_17', number: 17, text: 'Strong food tastes or flavours', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_18', number: 18, text: 'Mixed textures in foods', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_19', number: 19, text: 'Food that is too hot or too cold', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_20', number: 20, text: 'Specific food textures', type: 'single_choice', options: GSQ_OPTS5 },
    // Proprioceptive
    { id: 'gsq_21', number: 21, text: 'Knowing where your body is in space (e.g. misjudging heights of steps)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_22', number: 22, text: 'Difficulty knowing how hard you are pressing on an object', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_23', number: 23, text: 'Judging how much force to use (e.g. breaking things accidentally)', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_24', number: 24, text: 'Knowing where your limbs are without looking at them', type: 'single_choice', options: GSQ_OPTS5 },
    // Vestibular
    { id: 'gsq_25', number: 25, text: 'Travelling in a car, bus or boat', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_26', number: 26, text: 'Theme park rides or similar experiences', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_27', number: 27, text: 'Watching fast-moving objects', type: 'single_choice', options: GSQ_OPTS5 },
    { id: 'gsq_28', number: 28, text: 'Moving lifts / elevators', type: 'single_choice', options: GSQ_OPTS5 },
  ],

  score: (answers) => {
    const keys = Array.from({ length: 28 }, (_, i) => `gsq_${i + 1}`);
    return keys.reduce((s, k) => s + (answers[k] ?? 0), 0);
  },
  interpret: (score) => {
    if (score <= 28)  return { label: 'Low sensory sensitivity',      color: '#2E7D32', description: 'Low level of sensory processing difficulties.' };
    if (score <= 56)  return { label: 'Mild sensory sensitivity',     color: '#F59E0B', description: 'Mild sensory processing difficulties.' };
    if (score <= 84)  return { label: 'Moderate sensory sensitivity', color: '#EA580C', description: 'Moderate sensory processing difficulties.' };
    return                  { label: 'High sensory sensitivity',      color: '#DC2626', description: 'High level of sensory processing difficulties.' };
  },
};

// ─── AQ-10 ────────────────────────────────────────────────────────────────────
// The AQ-50 (Baron-Cohen et al., 2001) is the full instrument; the AQ-10
// (Allison et al., 2012) is the validated 10-item brief screener derived from it.
// This implementation provides the AQ-10 for practical administration within ScoreMe.
// If you require the full AQ-50, it can be imported as a custom JSON questionnaire.
export const AQ10 = {
  id: 'aq10',
  title: 'Autism Spectrum Quotient — 10 item screener',
  shortTitle: 'AQ-10',
  version: 'AQ-10 (derived from AQ-50)',
  beta: true,
  domain: 'Neurodevelopmental',

  construct: 'Autistic traits',
  constructDescription: 'Brief screener for autistic traits in adults. Derived from the full 50-item Autism Spectrum Quotient (AQ-50). A score ≥ 6 is the recommended threshold for clinical referral.',
  timeframe: 'General / how you usually are',
  languages: ['English'],

  instructions: 'Please read each statement carefully and rate how strongly it applies to you.',

  reference: 'Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). Toward brief "red flags" for autism spectrum disorders: The Short Autism Spectrum Quotient and the Short Quantitative Checklist for Autism in Toddlers. Journal of the American Academy of Child & Adolescent Psychiatry, 51(2), 202–212.',
  credit: 'Simon Baron-Cohen, Autism Research Centre, University of Cambridge.',
  copyright: '© Autism Research Centre, University of Cambridge. Available for research use.',

  maxScore: 10,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Each item scores 1 if the response is in the "autistic" direction, 0 otherwise. Items 1, 7, 8, 10 score 1 for "Definitely agree" or "Slightly agree". Items 2, 3, 4, 5, 6, 9 score 1 for "Definitely disagree" or "Slightly disagree". Total range: 0–10. Threshold ≥ 6.',
  scoreBands: [
    { min: 0, max: 5, label: 'Below threshold', color: '#2E7D32', description: 'Score below the clinical referral threshold.' },
    { min: 6, max: 10, label: 'Above threshold — consider referral', color: '#DC2626', description: 'Score at or above the recommended referral threshold. Consider clinical assessment.' },
  ],

  items: [
    { id: 'aq10_1',  number: 1,  text: 'I often notice small sounds when others do not', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_2',  number: 2,  text: 'I usually concentrate more on the whole picture, rather than the small details', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_3',  number: 3,  text: "I find it easy to do more than one thing at once", type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_4',  number: 4,  text: 'If there is an interruption, I can switch back to what I was doing very quickly', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_5',  number: 5,  text: 'I find it easy to "read between the lines" when someone is talking to me', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_6',  number: 6,  text: 'I know how to tell if someone listening to me is getting bored', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_7',  number: 7,  text: 'When I am reading a story, I find it difficult to work out the characters\' intentions', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_8',  number: 8,  text: 'I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant, etc.)', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_9',  number: 9,  text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
    { id: 'aq10_10', number: 10, text: 'I find it difficult to work out people\'s intentions', type: 'single_choice', options: [{ value: 'da', label: 'Definitely agree' }, { value: 'sa', label: 'Slightly agree' }, { value: 'sd', label: 'Slightly disagree' }, { value: 'dd', label: 'Definitely disagree' }] },
  ],

  score: (answers) => {
    // Items where agree = 1 (autistic direction)
    const agreeItems = new Set([1, 7, 8, 10]);
    let total = 0;
    for (let i = 1; i <= 10; i++) {
      const v = answers[`aq10_${i}`];
      if (agreeItems.has(i)) {
        if (v === 'da' || v === 'sa') total += 1;
      } else {
        if (v === 'dd' || v === 'sd') total += 1;
      }
    }
    return total;
  },
  interpret: (score) => {
    if (score <= 5) return { label: 'Below threshold',                       color: '#2E7D32', description: 'Score below the clinical referral threshold.' };
    return               { label: 'Above threshold — consider referral',    color: '#DC2626', description: 'Score at or above the recommended referral threshold. Consider clinical assessment.' };
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────
export const EXTENDED_QUESTIONNAIRES = [
  PHQ2, PHQ9, PHQ15,
  GAD7, GAD2,
  BDI2, BAI,
  DASS21,
  PANSS,
  STAI_S, STAI_T,
  WHOQOL_BREF, MACARTHUR_SSS,
  IPAQ_SHORT, GPAQ,
  GSQ,
  AQ10,
];

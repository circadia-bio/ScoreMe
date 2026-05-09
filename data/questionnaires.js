/**
 * data/questionnaires.js — Questionnaire definitions for ScoreMe
 *
 * ─── Schema ───────────────────────────────────────────────────────────────────
 *
 * Every questionnaire object (built-in or imported JSON) may contain:
 *
 * IDENTITY
 *   id            string        unique identifier, snake_case
 *   title         string        full instrument name
 *   shortTitle    string        abbreviation shown in chips and headers
 *   version       string?       instrument version (e.g. "DBAS-16", "ISI-7")
 *   beta          boolean?      flag unreleased / experimental instruments
 *   domain        string?       clinical domain (e.g. "Sleep", "Mental Health", "Pain", "Neurology")
 *
 * CONTENT
 *   instructions  string        shown to participant before item 1
 *   construct     string        what the instrument measures (e.g. "Daytime sleepiness")
 *   constructDescription string  one-sentence description of the construct
 *   timeframe     string?       recall period (e.g. "Past month", "Right now", "General")
 *   languages     string[]?     validated languages (e.g. ["English", "French"])
 *
 * ATTRIBUTION
 *   reference     string        primary citation (APA format)
 *   credit        string?       authorship credit if different from reference
 *   copyright     string?       copyright holder / licence note
 *
 * SCORING (declarative — used for imported JSON)
 *   maxScore      number?       maximum possible numeric score
 *   scoringMethod object?       declarative scoring descriptor:
 *     {
 *       type: 'sum'            simple sum of all item answer values
 *            | 'mean'          mean of item values (useful for DBAS-style)
 *            | 'weighted_sum'  sum of option.value weights (same as sum in practice)
 *            | 'composite'     complex multi-step algorithm — use scoringNote
 *       itemPrefix: string?    common prefix to build item keys (e.g. 'ess')
 *       items: string[]?       explicit list of item ids to include in scoring
 *       yesValue: number?      for yes_no items: value assigned to 'yes' (default 1)
 *       multiplier: number?    multiply result by this (e.g. for mean × maxScale)
 *     }
 *   scoringNote   string?       plain-English description of the scoring algorithm
 *                               (shown in detail panel for complex instruments)
 *   scoreBands    object[]?     declarative interpretation bands:
 *     [{
 *       min: number,            inclusive lower bound (use -Infinity for open lower)
 *       max: number,            inclusive upper bound (use Infinity for open upper)
 *       label: string,
 *       color: string,          hex colour
 *       description: string
 *     }]
 *   scoreBandDirection: 'asc'|'desc'?
 *                               'asc' (default): higher score = worse/more
 *                               'desc': higher score = better (e.g. MEQ morning type)
 *
 * ITEMS
 *   items         object[]      array of item descriptors:
 *     {
 *       id        string        unique item id
 *       number    string|number display number (e.g. 1, '5a', 'S')
 *       text      string        item stem
 *       type      string        input type (see below)
 *       options   object[]?     [{value, label}] for choice types
 *       min       number?       for number/duration types
 *       max       number?       for number/duration types
 *       unit      string?       display unit (e.g. 'min', 'hrs')
 *       defaultValue any?       pre-filled value
 *       hint      string?       shown below the item stem
 *     }
 *
 * ITEM TYPES
 *   scale_0_3 | scale_0_4 | scale_0_10 | scale_1_10
 *   single_choice | yes_no | frequency_3 | frequency_4
 *   time | duration_min | number
 *
 * ─── Runtime functions (built-in only, not serialisable to JSON) ─────────────
 *   score(answers)  => number | object   computes the score
 *   interpret(score) => { label, color, description }  interprets the score
 *
 * For imported JSON questionnaires, ScoreMe compiles score() and interpret()
 * from scoringMethod and scoreBands at import time via compileQuestionnaire().
 */

// ─── Shared option sets ────────────────────────────────────────────────────────

const SCALE_0_3 = [
  { value: 0, label: 'Would never doze' },
  { value: 1, label: 'Slight chance of dozing' },
  { value: 2, label: 'Moderate chance of dozing' },
  { value: 3, label: 'High chance of dozing' },
];

const FREQUENCY_4 = [
  { value: 0, label: 'Not during the past month' },
  { value: 1, label: 'Less than once a week' },
  { value: 2, label: 'Once or twice a week' },
  { value: 3, label: 'Three or more times a week' },
];

// ─── ESS ──────────────────────────────────────────────────────────────────────
export const ESS = {
  id: 'ess',
  title: 'Epworth Sleepiness Scale',
  shortTitle: 'ESS',
  version: 'ESS-8',
  domain: 'Sleep',

  construct: 'Daytime sleepiness',
  constructDescription: 'Measures the general level of daytime sleepiness by asking about the likelihood of dozing in eight common everyday situations.',
  timeframe: 'Recent / usual way of life',
  languages: ['English', 'French', 'German', 'Portuguese', 'Spanish', 'Italian', 'Dutch', 'Swedish', 'Japanese', 'Chinese'],

  instructions: 'How likely are you to doze off or fall asleep in the following situations, in contrast to feeling just tired? This refers to your usual way of life in recent times.',

  reference: 'Johns, M. W. (1991). A new method for measuring daytime sleepiness: The Epworth Sleepiness Scale. Sleep, 14(6), 540–545.',
  credit: 'Murray W. Johns, Epworth Sleep Centre, Melbourne, Australia.',
  copyright: '© Murray W. Johns, 1990–1997. Reproduced with permission for non-commercial research and clinical use.',

  maxScore: 24,
  scoringMethod: { type: 'sum', itemPrefix: 'ess', items: ['ess1','ess2','ess3','ess4','ess5','ess6','ess7','ess8'] },
  scoringNote: 'Sum of 8 items, each rated 0–3. Total range: 0–24.',
  scoreBands: [
    { min: 0,  max: 7,  label: 'Normal',     color: '#2E7D32', description: 'Daytime sleepiness is within the normal range.' },
    { min: 8,  max: 9,  label: 'Borderline', color: '#F59E0B', description: 'Borderline score. Consider monitoring sleep habits.' },
    { min: 10, max: 15, label: 'Excessive',  color: '#EA580C', description: 'Excessive daytime sleepiness. Consider clinical review.' },
    { min: 16, max: 24, label: 'Severe',     color: '#DC2626', description: 'Severe excessive daytime sleepiness. Recommend medical advice.' },
  ],

  items: [
    { id: 'ess1', number: 1, text: 'Sitting and reading', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess2', number: 2, text: 'Watching TV', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess3', number: 3, text: 'Sitting inactive in a public place (e.g. a theatre or meeting)', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess4', number: 4, text: 'As a passenger in a car for an hour without a break', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess5', number: 5, text: 'Lying down to rest in the afternoon when circumstances permit', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess6', number: 6, text: 'Sitting and talking to someone', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess7', number: 7, text: 'Sitting quietly after a lunch without alcohol', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess8', number: 8, text: 'In a car, while stopped for a few minutes in traffic', type: 'scale_0_3', options: SCALE_0_3 },
  ],

  score: (answers) => ['ess1','ess2','ess3','ess4','ess5','ess6','ess7','ess8'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 7)  return { label: 'Normal',     color: '#2E7D32', description: 'Daytime sleepiness is within the normal range.' };
    if (score <= 9)  return { label: 'Borderline', color: '#F59E0B', description: 'Borderline score. Consider monitoring sleep habits.' };
    if (score <= 15) return { label: 'Excessive',  color: '#EA580C', description: 'Excessive daytime sleepiness. Consider clinical review.' };
    return                 { label: 'Severe',      color: '#DC2626', description: 'Severe excessive daytime sleepiness. Recommend medical advice.' };
  },
};

// ─── ISI ──────────────────────────────────────────────────────────────────────
export const ISI = {
  id: 'isi',
  title: 'Insomnia Severity Index',
  shortTitle: 'ISI',
  version: 'ISI-7',
  domain: 'Sleep',

  construct: 'Insomnia severity',
  constructDescription: 'Assesses the nature, severity, and impact of insomnia symptoms over the past two weeks, including sleep onset, maintenance, and early morning awakening difficulties.',
  timeframe: 'Past two weeks',
  languages: ['English', 'French', 'Portuguese', 'Spanish', 'Italian', 'Dutch', 'German', 'Chinese', 'Japanese', 'Korean'],

  instructions: 'For each of the following questions, please rate the current severity of your insomnia problem over the past two weeks.',

  reference: 'Morin, C. M., Belleville, G., Bélanger, L., & Ivers, H. (2011). The Insomnia Severity Index: Psychometric indicators to detect insomnia cases and evaluate treatment response. Sleep, 34(5), 601–608.',
  credit: 'Charles M. Morin, Université Laval, Québec, Canada.',
  copyright: '© Charles M. Morin. Freely available for clinical and research use.',

  maxScore: 28,
  scoringMethod: { type: 'sum', items: ['isi1','isi2','isi3','isi4','isi5','isi6','isi7'] },
  scoringNote: 'Sum of 7 items, each rated 0–4. Total range: 0–28.',
  scoreBands: [
    { min: 0,  max: 7,  label: 'No clinically significant insomnia', color: '#2E7D32', description: 'No clinically significant insomnia.' },
    { min: 8,  max: 14, label: 'Subthreshold insomnia',              color: '#F59E0B', description: 'Subthreshold insomnia. Consider sleep hygiene education.' },
    { min: 15, max: 21, label: 'Clinical insomnia (moderate)',        color: '#EA580C', description: 'Moderate clinical insomnia. Consider professional support.' },
    { min: 22, max: 28, label: 'Clinical insomnia (severe)',          color: '#DC2626', description: 'Severe clinical insomnia. Recommend medical evaluation.' },
  ],

  items: [
    { id: 'isi1', number: 1, text: 'Difficulty falling asleep', type: 'scale_0_4', options: [{ value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Severe' }, { value: 4, label: 'Very severe' }] },
    { id: 'isi2', number: 2, text: 'Difficulty staying asleep', type: 'scale_0_4', options: [{ value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Severe' }, { value: 4, label: 'Very severe' }] },
    { id: 'isi3', number: 3, text: 'Problem waking up too early', type: 'scale_0_4', options: [{ value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Severe' }, { value: 4, label: 'Very severe' }] },
    { id: 'isi4', number: 4, text: 'How satisfied or dissatisfied are you with your current sleep pattern?', type: 'scale_0_4', options: [{ value: 0, label: 'Very satisfied' }, { value: 1, label: 'Satisfied' }, { value: 2, label: 'Neutral' }, { value: 3, label: 'Dissatisfied' }, { value: 4, label: 'Very dissatisfied' }] },
    { id: 'isi5', number: 5, text: 'To what extent do you consider your sleep problem to interfere with your daily functioning?', type: 'scale_0_4', options: [{ value: 0, label: 'Not at all' }, { value: 1, label: 'A little' }, { value: 2, label: 'Somewhat' }, { value: 3, label: 'Much' }, { value: 4, label: 'Very much' }] },
    { id: 'isi6', number: 6, text: 'How noticeable to others do you think your sleeping problem is in terms of impairing quality of life?', type: 'scale_0_4', options: [{ value: 0, label: 'Not at all noticeable' }, { value: 1, label: 'Barely' }, { value: 2, label: 'Somewhat' }, { value: 3, label: 'Much' }, { value: 4, label: 'Very much noticeable' }] },
    { id: 'isi7', number: 7, text: 'How worried or distressed are you about your current sleep problem?', type: 'scale_0_4', options: [{ value: 0, label: 'Not at all' }, { value: 1, label: 'A little' }, { value: 2, label: 'Somewhat' }, { value: 3, label: 'Much' }, { value: 4, label: 'Very much' }] },
  ],

  score: (answers) => ['isi1','isi2','isi3','isi4','isi5','isi6','isi7'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score <= 7)  return { label: 'No clinically significant insomnia', color: '#2E7D32', description: 'No clinically significant insomnia.' };
    if (score <= 14) return { label: 'Subthreshold insomnia',              color: '#F59E0B', description: 'Subthreshold insomnia. Consider sleep hygiene education.' };
    if (score <= 21) return { label: 'Clinical insomnia (moderate)',        color: '#EA580C', description: 'Moderate clinical insomnia. Consider professional support.' };
    return                 { label: 'Clinical insomnia (severe)',          color: '#DC2626', description: 'Severe clinical insomnia. Recommend medical evaluation.' };
  },
};

// ─── DBAS-16 ──────────────────────────────────────────────────────────────────
export const DBAS16 = {
  id: 'dbas16',
  title: 'Dysfunctional Beliefs and Attitudes about Sleep',
  shortTitle: 'DBAS-16',
  version: 'DBAS-16',
  domain: 'Sleep',

  construct: 'Sleep-related cognitive distortions',
  constructDescription: 'Assesses maladaptive cognitions about sleep, including unrealistic expectations, misconceptions about the causes of insomnia, and faulty beliefs about the consequences of poor sleep.',
  timeframe: 'General / current beliefs',
  languages: ['English', 'French', 'Portuguese', 'Spanish', 'Italian', 'German', 'Dutch', 'Chinese'],

  instructions: "Listed below are statements reflecting people's beliefs and attitudes about sleep. Please indicate to what extent you personally agree or disagree with each statement. Use a scale from 0 (strongly disagree) to 10 (strongly agree).",

  reference: 'Morin, C. M., Vallières, A., & Ivers, H. (2007). Dysfunctional Beliefs and Attitudes about Sleep (DBAS): Validation of a brief version (DBAS-16). Sleep, 30(11), 1547–1554.',
  credit: 'Charles M. Morin, Université Laval, Québec, Canada.',
  copyright: '© Charles M. Morin. Freely available for clinical and research use.',

  maxScore: 10,
  scoringMethod: { type: 'mean', items: ['dbas1','dbas2','dbas3','dbas4','dbas5','dbas6','dbas7','dbas8','dbas9','dbas10','dbas11','dbas12','dbas13','dbas14','dbas15','dbas16'], multiplier: 1 },
  scoringNote: 'Mean of 16 items each rated 0–10. Score range: 0–10 (one decimal place). Higher scores indicate more dysfunctional beliefs.',
  scoreBands: [
    { min: 0,   max: 4,  label: 'Within normal range',    color: '#2E7D32', description: 'Beliefs and attitudes about sleep are broadly within the normal range.' },
    { min: 4.1, max: 10, label: 'Clinically relevant beliefs', color: '#EA580C', description: 'Dysfunctional beliefs about sleep that may be worth exploring in therapy.' },
  ],

  items: [
    { id: 'dbas1',  number: 1,  text: 'I need 8 hours of sleep to feel refreshed and function well during the day.', type: 'scale_0_10' },
    { id: 'dbas2',  number: 2,  text: "When I don't get the proper amount of sleep on a given night, I need to catch up on the next day by napping or on the next night by sleeping longer.", type: 'scale_0_10' },
    { id: 'dbas3',  number: 3,  text: 'I am concerned that chronic insomnia may have serious consequences on my physical health.', type: 'scale_0_10' },
    { id: 'dbas4',  number: 4,  text: 'I am worried that I may lose control over my abilities to sleep.', type: 'scale_0_10' },
    { id: 'dbas5',  number: 5,  text: "After a poor night's sleep, I know that it will interfere with my daily activities on the next day.", type: 'scale_0_10' },
    { id: 'dbas6',  number: 6,  text: "In order to be alert and function well during the day, I believe I would be better off taking a sleeping pill rather than having a poor night's sleep.", type: 'scale_0_10' },
    { id: 'dbas7',  number: 7,  text: 'When I feel irritable, depressed, or anxious during the day, it is mostly because I did not sleep well the night before.', type: 'scale_0_10' },
    { id: 'dbas8',  number: 8,  text: "When I sleep poorly on one night, I know it will disturb my sleep schedule for the whole week.", type: 'scale_0_10' },
    { id: 'dbas9',  number: 9,  text: "Without an adequate night's sleep, I can hardly function the next day.", type: 'scale_0_10' },
    { id: 'dbas10', number: 10, text: "I can't ever predict whether I'll have a good or poor night's sleep.", type: 'scale_0_10' },
    { id: 'dbas11', number: 11, text: 'I have little ability to manage the negative consequences of disturbed sleep.', type: 'scale_0_10' },
    { id: 'dbas12', number: 12, text: 'When I feel tired, have no energy, or just seem not to function well during the day, it is generally because I did not sleep well the night before.', type: 'scale_0_10' },
    { id: 'dbas13', number: 13, text: 'I believe insomnia is essentially the result of a chemical imbalance.', type: 'scale_0_10' },
    { id: 'dbas14', number: 14, text: 'I feel that insomnia is ruining my ability to enjoy life and prevents me from doing what I want.', type: 'scale_0_10' },
    { id: 'dbas15', number: 15, text: 'Medication is probably the only solution to sleeplessness.', type: 'scale_0_10' },
    { id: 'dbas16', number: 16, text: "I avoid or cancel obligations (social, family) after a poor night's sleep.", type: 'scale_0_10' },
  ],

  score: (answers) => {
    const keys = ['dbas1','dbas2','dbas3','dbas4','dbas5','dbas6','dbas7','dbas8','dbas9','dbas10','dbas11','dbas12','dbas13','dbas14','dbas15','dbas16'];
    return Math.round(keys.reduce((s, k) => s + (answers[k] ?? 0), 0) / keys.length * 10) / 10;
  },
  interpret: (score) => {
    if (score <= 4) return { label: 'Within normal range',        color: '#2E7D32', description: 'Beliefs and attitudes about sleep are broadly within the normal range.' };
    return                { label: 'Clinically relevant beliefs', color: '#EA580C', description: 'Dysfunctional beliefs about sleep that may be worth exploring in therapy.' };
  },
};

// ─── MEQ ──────────────────────────────────────────────────────────────────────
export const MEQ = {
  id: 'meq',
  title: 'Morningness–Eveningness Questionnaire',
  shortTitle: 'MEQ',
  version: 'MEQ-19',
  domain: 'Sleep',

  construct: 'Chronotype',
  constructDescription: 'Assesses an individual\'s circadian preference — whether they are naturally inclined towards morning activity ("early bird") or evening activity ("night owl").',
  timeframe: 'General / habitual preference',
  languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Italian', 'Swedish', 'Finnish', 'Norwegian', 'Japanese', 'Chinese', 'Korean'],

  instructions: 'Please read each question carefully before answering. Answer ALL questions. Each question should be answered independently of the others. Answer according to how you truly feel, not how you think you should feel.',

  reference: 'Horne, J. A., & Östberg, O. (1976). A self-assessment questionnaire to determine morningness-eveningness in human circadian rhythms. International Journal of Chronobiology, 4(2), 97–110.',
  credit: 'J. A. Horne & O. Östberg.',
  copyright: 'In the public domain. No copyright restriction.',

  maxScore: 86,
  scoringMethod: { type: 'weighted_sum', items: ['meq1','meq2','meq3','meq4','meq5','meq6','meq7','meq8','meq9','meq10','meq11','meq12','meq13','meq14','meq15','meq16','meq17','meq18','meq19'] },
  scoringNote: 'Weighted sum of 19 items. Each item has options with pre-assigned weights (not sequential values). Total range: 16–86. Higher scores indicate greater morningness.',
  scoreBandDirection: 'desc',
  scoreBands: [
    { min: 70, max: 86, label: 'Definite morning type',  color: '#F59E0B', description: 'Definite morning type (early bird).' },
    { min: 59, max: 69, label: 'Moderate morning type',  color: '#84CC16', description: 'Moderate preference for mornings.' },
    { min: 42, max: 58, label: 'Intermediate type',      color: '#2E7D32', description: 'Intermediate chronotype — neither strongly morning nor evening.' },
    { min: 31, max: 41, label: 'Moderate evening type',  color: '#6366F1', description: 'Moderate preference for evenings.' },
    { min: 0,  max: 30, label: 'Definite evening type',  color: '#7C3AED', description: 'Definite evening type (night owl).' },
  ],

  items: [
    { id: 'meq1',  number: 1,  text: 'Considering only your own "feeling best" rhythm, at what time would you get up if you were entirely free to plan your day?', type: 'single_choice', options: [{ value: 5, label: '5:00–6:30 AM' }, { value: 4, label: '6:30–7:45 AM' }, { value: 3, label: '7:45–9:45 AM' }, { value: 2, label: '9:45–11:00 AM' }, { value: 1, label: '11:00 AM–12:00 PM' }] },
    { id: 'meq2',  number: 2,  text: 'Considering only your own "feeling best" rhythm, at what time would you go to bed if you were entirely free to plan your evening?', type: 'single_choice', options: [{ value: 5, label: '8:00–9:00 PM' }, { value: 4, label: '9:00–10:15 PM' }, { value: 3, label: '10:15 PM–12:30 AM' }, { value: 2, label: '12:30–1:45 AM' }, { value: 1, label: '1:45–3:00 AM' }] },
    { id: 'meq3',  number: 3,  text: 'If there is a specific time at which you have to get up in the morning, to what extent do you depend on being woken by an alarm clock?', type: 'single_choice', options: [{ value: 4, label: 'Not at all dependent' }, { value: 3, label: 'Slightly dependent' }, { value: 2, label: 'Fairly dependent' }, { value: 1, label: 'Very dependent' }] },
    { id: 'meq4',  number: 4,  text: 'Assuming adequate environmental conditions, how easy do you find getting up in the morning?', type: 'single_choice', options: [{ value: 1, label: 'Not at all easy' }, { value: 2, label: 'Not very easy' }, { value: 3, label: 'Fairly easy' }, { value: 4, label: 'Very easy' }] },
    { id: 'meq5',  number: 5,  text: 'How alert do you feel during the first half hour after you wake up in the morning?', type: 'single_choice', options: [{ value: 1, label: 'Not at all alert' }, { value: 2, label: 'Slightly alert' }, { value: 3, label: 'Fairly alert' }, { value: 4, label: 'Very alert' }] },
    { id: 'meq6',  number: 6,  text: 'How is your appetite during the first half hour after you wake up in the morning?', type: 'single_choice', options: [{ value: 1, label: 'Very poor' }, { value: 2, label: 'Fairly poor' }, { value: 3, label: 'Fairly good' }, { value: 4, label: 'Very good' }] },
    { id: 'meq7',  number: 7,  text: 'During the first half hour after you wake up in the morning, how tired do you feel?', type: 'single_choice', options: [{ value: 1, label: 'Very tired' }, { value: 2, label: 'Fairly tired' }, { value: 3, label: 'Fairly refreshed' }, { value: 4, label: 'Very refreshed' }] },
    { id: 'meq8',  number: 8,  text: 'When you have no commitments the next day, at what time do you go to bed compared to your usual bedtime?', type: 'single_choice', options: [{ value: 4, label: 'Seldom or never later' }, { value: 3, label: 'Less than one hour later' }, { value: 2, label: '1–2 hours later' }, { value: 1, label: 'More than two hours later' }] },
    { id: 'meq9',  number: 9,  text: 'A friend suggests you exercise together between 7:00–8:00 AM twice a week. How do you think you would perform?', type: 'single_choice', options: [{ value: 4, label: 'Would be in good form' }, { value: 3, label: 'Would be in reasonable form' }, { value: 2, label: 'Would find it difficult' }, { value: 1, label: 'Would find it very difficult' }] },
    { id: 'meq10', number: 10, text: 'At what time in the evening do you feel tired and in need of sleep?', type: 'single_choice', options: [{ value: 5, label: '8:00–9:00 PM' }, { value: 4, label: '9:00–10:15 PM' }, { value: 3, label: '10:15 PM–12:45 AM' }, { value: 2, label: '12:45–2:00 AM' }, { value: 1, label: '2:00–3:00 AM' }] },
    { id: 'meq11', number: 11, text: 'You want to be at your peak for a 2-hour mentally exhausting test. Which testing time would you choose?', type: 'single_choice', options: [{ value: 6, label: '8:00–10:00 AM' }, { value: 4, label: '11:00 AM–1:00 PM' }, { value: 2, label: '3:00–5:00 PM' }, { value: 0, label: '7:00–9:00 PM' }] },
    { id: 'meq12', number: 12, text: 'If you went to bed at 11:00 PM, at what level of tiredness would you be?', type: 'single_choice', options: [{ value: 0, label: 'Not at all tired' }, { value: 2, label: 'A little tired' }, { value: 3, label: 'Fairly tired' }, { value: 5, label: 'Very tired' }] },
    { id: 'meq13', number: 13, text: 'You have gone to bed several hours later than usual, but there is no need to get up at any particular time. Which is most likely?', type: 'single_choice', options: [{ value: 4, label: 'Will wake up at usual time and will NOT fall asleep again' }, { value: 3, label: 'Will wake up at usual time and will doze thereafter' }, { value: 2, label: 'Will wake up at usual time but will fall asleep again' }, { value: 1, label: 'Will NOT wake up until later than usual' }] },
    { id: 'meq14', number: 14, text: 'One night you have to remain awake between 4:00–6:00 AM for a night watch. Which suits you best?', type: 'single_choice', options: [{ value: 1, label: 'Would NOT go to bed until watch was over' }, { value: 2, label: 'Would take a nap before and sleep after' }, { value: 3, label: 'Would take a good sleep before and nap after' }, { value: 4, label: 'Would take ALL sleep before watch' }] },
    { id: 'meq15', number: 15, text: 'You have to do two hours of hard physical work. Which time would you choose?', type: 'single_choice', options: [{ value: 4, label: '8:00–10:00 AM' }, { value: 3, label: '11:00 AM–1:00 PM' }, { value: 2, label: '3:00–5:00 PM' }, { value: 1, label: '7:00–9:00 PM' }] },
    { id: 'meq16', number: 16, text: 'A friend suggests you exercise together between 10:00–11:00 PM twice a week. How well do you think you would perform?', type: 'single_choice', options: [{ value: 1, label: 'Would be in good form' }, { value: 2, label: 'Would be in reasonable form' }, { value: 3, label: 'Would find it difficult' }, { value: 4, label: 'Would find it very difficult' }] },
    { id: 'meq17', number: 17, text: 'Suppose you can choose your own work hours. You work a 5-hour day and are paid based on results. At approximately what time would you choose to begin?', type: 'single_choice', options: [{ value: 5, label: '5 hours starting at 4:00–8:00 AM' }, { value: 4, label: '5 hours starting at 8:00–9:00 AM' }, { value: 3, label: '5 hours starting at 9:00 AM–2:00 PM' }, { value: 2, label: '5 hours starting at 2:00–5:00 PM' }, { value: 1, label: '5 hours starting at 5:00 PM–4:00 AM' }] },
    { id: 'meq18', number: 18, text: 'At what time of the day do you think you reach your "feeling best" peak?', type: 'single_choice', options: [{ value: 5, label: '5:00–8:00 AM' }, { value: 4, label: '8:00–10:00 AM' }, { value: 3, label: '10:00 AM–5:00 PM' }, { value: 2, label: '5:00–10:00 PM' }, { value: 1, label: '10:00 PM–5:00 AM' }] },
    { id: 'meq19', number: 19, text: 'One hears about "morning" and "evening" types of people. Which ONE of these types do you consider yourself to be?', type: 'single_choice', options: [{ value: 6, label: 'Definitely a morning type' }, { value: 4, label: 'More a morning type than an evening type' }, { value: 2, label: 'More an evening type than a morning type' }, { value: 0, label: 'Definitely an evening type' }] },
  ],

  score: (answers) => ['meq1','meq2','meq3','meq4','meq5','meq6','meq7','meq8','meq9','meq10','meq11','meq12','meq13','meq14','meq15','meq16','meq17','meq18','meq19'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score >= 70) return { label: 'Definite morning type', color: '#F59E0B', description: 'Definite morning type (early bird).' };
    if (score >= 59) return { label: 'Moderate morning type', color: '#84CC16', description: 'Moderate preference for mornings.' };
    if (score >= 42) return { label: 'Intermediate type',     color: '#2E7D32', description: 'Intermediate chronotype — neither strongly morning nor evening.' };
    if (score >= 31) return { label: 'Moderate evening type', color: '#6366F1', description: 'Moderate preference for evenings.' };
    return                 { label: 'Definite evening type',  color: '#7C3AED', description: 'Definite evening type (night owl).' };
  },
};

// ─── PSQI ─────────────────────────────────────────────────────────────────────
export const PSQI = {
  id: 'psqi',
  title: 'Pittsburgh Sleep Quality Index',
  shortTitle: 'PSQI',
  version: 'PSQI',
  domain: 'Sleep',

  construct: 'Sleep quality',
  constructDescription: 'Measures sleep quality and disturbances over the past month across seven component scores: subjective sleep quality, sleep latency, sleep duration, habitual sleep efficiency, sleep disturbances, use of sleeping medication, and daytime dysfunction.',
  timeframe: 'Past month',
  languages: ['English', 'French', 'German', 'Spanish', 'Portuguese', 'Italian', 'Dutch', 'Chinese', 'Japanese', 'Korean', 'Arabic'],

  instructions: 'The following questions relate to your usual sleep habits during the past month only. Your answers should indicate the most accurate reply for the majority of days and nights in the past month.',

  reference: 'Buysse, D. J., Reynolds, C. F., Monk, T. H., Berman, S. R., & Kupfer, D. J. (1989). The Pittsburgh Sleep Quality Index: A new instrument for psychiatric practice and research. Psychiatry Research, 28(2), 193–213.',
  credit: 'Daniel J. Buysse, University of Pittsburgh.',
  copyright: '© Daniel J. Buysse, MD, 1988. All rights reserved. Available for non-commercial research and clinical use with permission.',

  maxScore: 21,
  scoringMethod: { type: 'composite' },
  scoringNote: 'Seven component scores (C1–C7), each 0–3, are summed. C1 = subjective sleep quality; C2 = sleep latency; C3 = sleep duration; C4 = habitual sleep efficiency; C5 = sleep disturbances; C6 = use of sleep medication; C7 = daytime dysfunction. Global score range: 0–21.',
  scoreBands: [
    { min: 0,  max: 4,  label: 'Good sleep quality',      color: '#2E7D32', description: 'Good overall sleep quality.' },
    { min: 5,  max: 10, label: 'Poor sleep quality',      color: '#F59E0B', description: 'Poor sleep quality. Consider sleep hygiene improvements.' },
    { min: 11, max: 21, label: 'Severe sleep difficulties', color: '#DC2626', description: 'Severe sleep difficulties. Recommend medical evaluation.' },
  ],

  items: [
    { id: 'psqi1',  number: 1,    text: 'During the past month, what time have you usually gone to bed at night?', type: 'time', defaultValue: { hour: 23, minute: 0 } },
    { id: 'psqi2',  number: 2,    text: 'During the past month, how long (in minutes) has it usually taken you to fall asleep each night?', type: 'duration_min', defaultValue: 20, min: 0, max: 180, unit: 'min' },
    { id: 'psqi3',  number: 3,    text: 'During the past month, what time have you usually gotten up in the morning?', type: 'time', defaultValue: { hour: 7, minute: 0 } },
    { id: 'psqi4',  number: 4,    text: 'During the past month, how many hours of actual sleep did you get at night?', type: 'number', defaultValue: 7, min: 0, max: 24, unit: 'hrs' },
    { id: 'psqi5a', number: '5a', text: 'During the past month, how often have you had trouble sleeping because you cannot get to sleep within 30 minutes?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5b', number: '5b', text: 'How often have you had trouble sleeping because you wake up in the middle of the night or early morning?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5c', number: '5c', text: 'How often have you had trouble sleeping because you have to get up to use the bathroom?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5d', number: '5d', text: 'How often have you had trouble sleeping because you cannot breathe comfortably?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5e', number: '5e', text: 'How often have you had trouble sleeping because you cough or snore loudly?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5f', number: '5f', text: 'How often have you had trouble sleeping because you feel too cold?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5g', number: '5g', text: 'How often have you had trouble sleeping because you feel too hot?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5h', number: '5h', text: 'How often have you had trouble sleeping because you had bad dreams?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5i', number: '5i', text: 'How often have you had trouble sleeping because you have pain?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi6',  number: 6,    text: 'During the past month, how often have you taken medicine to help you sleep (prescribed or over the counter)?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi7',  number: 7,    text: 'During the past month, how often have you had trouble staying awake while driving, eating meals, or engaging in social activity?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi8',  number: 8,    text: 'During the past month, how much of a problem has it been for you to keep up enough enthusiasm to get things done?', type: 'single_choice', options: [{ value: 0, label: 'No problem at all' }, { value: 1, label: 'Only a very slight problem' }, { value: 2, label: 'Somewhat of a problem' }, { value: 3, label: 'A very big problem' }] },
    { id: 'psqi9',  number: 9,    text: 'During the past month, how would you rate your sleep quality overall?', type: 'single_choice', options: [{ value: 0, label: 'Very good' }, { value: 1, label: 'Fairly good' }, { value: 2, label: 'Fairly bad' }, { value: 3, label: 'Very bad' }] },
  ],

  score: (answers) => {
    const c1 = answers['psqi9'] ?? 0;
    const sol = answers['psqi2'] ?? 0;
    const solScore = sol <= 15 ? 0 : sol <= 30 ? 1 : sol <= 60 ? 2 : 3;
    const c2 = (() => { const r = solScore + (answers['psqi5a'] ?? 0); return r === 0 ? 0 : r <= 2 ? 1 : r <= 4 ? 2 : 3; })();
    const sd = answers['psqi4'] ?? 7;
    const c3 = sd >= 7 ? 0 : sd >= 6 ? 1 : sd >= 5 ? 2 : 3;
    const bt = answers['psqi1'] ? answers['psqi1'].hour * 60 + answers['psqi1'].minute : 23 * 60;
    const wt = answers['psqi3'] ? answers['psqi3'].hour * 60 + answers['psqi3'].minute : 7 * 60;
    let tib = wt - bt; if (tib <= 0) tib += 1440;
    const hse = tib > 0 ? (sd / (tib / 60)) * 100 : 0;
    const c4 = hse >= 85 ? 0 : hse >= 75 ? 1 : hse >= 65 ? 2 : 3;
    const distSum = ['psqi5b','psqi5c','psqi5d','psqi5e','psqi5f','psqi5g','psqi5h','psqi5i'].reduce((s, k) => s + (answers[k] ?? 0), 0);
    const c5 = distSum === 0 ? 0 : distSum <= 9 ? 1 : distSum <= 18 ? 2 : 3;
    const c6 = answers['psqi6'] ?? 0;
    const c7 = (() => { const r = (answers['psqi7'] ?? 0) + (answers['psqi8'] ?? 0); return r === 0 ? 0 : r <= 2 ? 1 : r <= 4 ? 2 : 3; })();
    return c1 + c2 + c3 + c4 + c5 + c6 + c7;
  },
  interpret: (score) => {
    if (score <= 4)  return { label: 'Good sleep quality',       color: '#2E7D32', description: 'Good overall sleep quality.' };
    if (score <= 10) return { label: 'Poor sleep quality',       color: '#F59E0B', description: 'Poor sleep quality. Consider sleep hygiene improvements.' };
    return                 { label: 'Severe sleep difficulties', color: '#DC2626', description: 'Severe sleep difficulties. Recommend medical evaluation.' };
  },
};

// ─── RU-SATED ─────────────────────────────────────────────────────────────────
const RUSATED_OPTIONS = [
  { value: 0, label: 'Never' }, { value: 1, label: 'Rarely' }, { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' }, { value: 4, label: 'Always' },
];

export const RUSATED = {
  id: 'rusated',
  title: 'Ru-SATED Sleep Health Scale',
  shortTitle: 'RU-SATED',
  version: 'RU-SATED v2.0',
  domain: 'Sleep',

  construct: 'Sleep health',
  constructDescription: 'Measures multidimensional sleep health across six domains: Regularity, satisfaction, alertness, timing, efficiency, and duration — reflecting the RU-SATED acronym.',
  timeframe: 'Past month',
  languages: ['English'],

  instructions: 'The following statements refer to your sleep during the past one month. Please indicate the best response for each statement.',

  reference: 'Buysse, D. J. (2014). Sleep health: Can we define it? Does it matter? Sleep, 37(1), 9–17.',
  credit: 'Daniel J. Buysse, University of Pittsburgh.',
  copyright: '© Daniel J. Buysse, MD. Available for non-commercial research use.',

  maxScore: 24,
  scoringMethod: { type: 'sum', items: ['rus1','rus2','rus3','rus4','rus5','rus6'] },
  scoringNote: 'Sum of 6 items each rated 0–4. Total range: 0–24. Higher scores indicate better sleep health.',
  scoreBandDirection: 'desc',
  scoreBands: [
    { min: 17, max: 24, label: 'Good sleep health',     color: '#2E7D32', description: 'Good multidimensional sleep health.' },
    { min: 9,  max: 16, label: 'Moderate sleep health', color: '#F59E0B', description: 'Moderate sleep health. There may be room for improvement.' },
    { min: 0,  max: 8,  label: 'Poor sleep health',     color: '#DC2626', description: 'Poor sleep health across multiple dimensions.' },
  ],

  items: [
    { id: 'rus1', number: 1, text: 'I go to sleep and wake up at about the same time every day.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus2', number: 2, text: 'I sleep 7–9 hours per night.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus3', number: 3, text: 'The middle of my sleep period is between 2:00 AM and 4:00 AM.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus4', number: 4, text: 'I am awake for less than 30 minutes between the time I go to bed and the time I get out of bed.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus5', number: 5, text: 'I stay awake all day without dozing.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus6', number: 6, text: 'I am satisfied with my sleep.', type: 'single_choice', options: RUSATED_OPTIONS },
  ],

  score: (answers) => ['rus1','rus2','rus3','rus4','rus5','rus6'].reduce((s, k) => s + (answers[k] ?? 0), 0),
  interpret: (score) => {
    if (score >= 17) return { label: 'Good sleep health',     color: '#2E7D32', description: 'Good multidimensional sleep health.' };
    if (score >= 9)  return { label: 'Moderate sleep health', color: '#F59E0B', description: 'Moderate sleep health. There may be room for improvement.' };
    return                 { label: 'Poor sleep health',      color: '#DC2626', description: 'Poor sleep health across multiple dimensions.' };
  },
};

// ─── STOP-BANG ────────────────────────────────────────────────────────────────
export const STOPBANG = {
  id: 'stopbang',
  title: 'STOP-BANG Questionnaire',
  shortTitle: 'STOP-BANG',
  version: 'STOP-BANG v3',
  domain: 'Sleep',

  construct: 'Obstructive sleep apnoea risk',
  constructDescription: 'Screens for the risk of obstructive sleep apnoea (OSA) using eight dichotomous items covering snoring, tiredness, observed apnoeas, blood pressure, BMI, age, neck circumference, and gender.',
  timeframe: 'Current / general',
  languages: ['English', 'French', 'Spanish', 'Portuguese', 'Italian', 'German', 'Dutch', 'Chinese', 'Arabic', 'Turkish'],

  instructions: 'Please answer YES or NO to each of the following questions. This questionnaire screens for the risk of obstructive sleep apnoea.',

  reference: 'Chung, F., Abdullah, H. R., & Liao, P. (2016). STOP-Bang Questionnaire: A practical approach to screen for obstructive sleep apnea. Chest, 149(3), 631–638.',
  credit: 'Frances Chung, University of Toronto.',
  copyright: '© Frances Chung, MD, FRCPC, 2008. All rights reserved for commercial use; freely available for clinical and research use.',

  maxScore: 8,
  scoringMethod: { type: 'sum', items: ['sb_s','sb_t','sb_o','sb_p','sb_b','sb_a','sb_n','sb_g'], yesValue: 1 },
  scoringNote: 'Count of YES answers across 8 items. Each YES = 1, NO = 0. Total range: 0–8.',
  scoreBands: [
    { min: 0, max: 2, label: 'Low OSA risk',          color: '#2E7D32', description: 'Low risk for obstructive sleep apnoea.' },
    { min: 3, max: 4, label: 'Intermediate OSA risk', color: '#F59E0B', description: 'Intermediate OSA risk. Consider further evaluation.' },
    { min: 5, max: 8, label: 'High OSA risk',         color: '#DC2626', description: 'High OSA risk. Recommend medical evaluation.' },
  ],

  items: [
    { id: 'sb_s', number: 'S', text: 'Do you snore loudly (louder than talking or loud enough to be heard through closed doors)?', type: 'yes_no' },
    { id: 'sb_t', number: 'T', text: 'Do you often feel tired, fatigued, or sleepy during the daytime?', type: 'yes_no' },
    { id: 'sb_o', number: 'O', text: 'Has anyone observed you stop breathing, or choking/gasping, during your sleep?', type: 'yes_no' },
    { id: 'sb_p', number: 'P', text: 'Do you have or are you being treated for high blood pressure?', type: 'yes_no' },
    { id: 'sb_b', number: 'B', text: 'Is your BMI greater than 35 kg/m²?', type: 'yes_no' },
    { id: 'sb_a', number: 'A', text: 'Are you older than 50 years?', type: 'yes_no' },
    { id: 'sb_n', number: 'N', text: 'Is your neck circumference greater than 40 cm?', type: 'yes_no' },
    { id: 'sb_g', number: 'G', text: 'Are you male?', type: 'yes_no' },
  ],

  score: (answers) => ['sb_s','sb_t','sb_o','sb_p','sb_b','sb_a','sb_n','sb_g'].reduce((s, k) => s + (answers[k] === 'yes' ? 1 : 0), 0),
  interpret: (score) => {
    if (score <= 2) return { label: 'Low OSA risk',          color: '#2E7D32', description: 'Low risk for obstructive sleep apnoea.' };
    if (score <= 4) return { label: 'Intermediate OSA risk', color: '#F59E0B', description: 'Intermediate OSA risk. Consider further evaluation.' };
    return                { label: 'High OSA risk',          color: '#DC2626', description: 'High OSA risk. Recommend medical evaluation.' };
  },
};

// ─── KSS ──────────────────────────────────────────────────────────────────────
export const KSS = {
  id: 'kss',
  beta: true,
  title: 'Karolinska Sleepiness Scale',
  shortTitle: 'KSS',
  version: 'KSS-9',
  domain: 'Sleep',

  construct: 'Momentary sleepiness',
  constructDescription: 'Measures subjective sleepiness at the moment of administration using a single 9-point verbal rating scale, sensitive to acute changes in alertness.',
  timeframe: 'Right now (momentary)',
  languages: ['English', 'Swedish', 'German', 'French', 'Finnish', 'Norwegian'],

  instructions: 'Using the scale below, please indicate how sleepy you feel right now, at this moment.',

  reference: 'Åkerstedt, T., & Gillberg, M. (1990). Subjective and objective sleepiness in the active individual. International Journal of Neuroscience, 52(1–2), 29–37.',
  credit: 'Torbjörn Åkerstedt & Mats Gillberg, Karolinska Institute, Stockholm, Sweden.',
  copyright: '© Karolinska Institute. Contact the authors for permission for commercial use.',

  maxScore: 10,
  scoringMethod: { type: 'sum', items: ['kss1'] },
  scoringNote: 'Single item rated 1–10. Score = the selected value. Higher scores indicate greater sleepiness.',
  scoreBands: [
    { min: 1,  max: 5,  label: 'Alert',               color: '#2E7D32', description: 'Adequately alert for most tasks.' },
    { min: 6,  max: 6,  label: 'Onset of sleepiness', color: '#F59E0B', description: 'Early signs of sleepiness. Caution for safety-critical tasks.' },
    { min: 7,  max: 8,  label: 'Moderate sleepiness', color: '#EA580C', description: 'Moderate sleepiness — performance impairment likely.' },
    { min: 9,  max: 10, label: 'Severe sleepiness',   color: '#DC2626', description: 'Severe sleepiness — significant risk of performance failure.' },
  ],

  items: [
    { id: 'kss1', number: 1, text: 'How sleepy do you feel right now?', type: 'scale_1_10', options: [
      { value: 1,  label: 'Extremely alert' },
      { value: 2,  label: 'Very alert' },
      { value: 3,  label: 'Alert' },
      { value: 4,  label: 'Rather alert' },
      { value: 5,  label: 'Neither alert nor sleepy' },
      { value: 6,  label: 'Some signs of sleepiness' },
      { value: 7,  label: 'Sleepy, but no difficulty remaining awake' },
      { value: 8,  label: 'Sleepy, some effort to keep alert' },
      { value: 9,  label: 'Very sleepy, great effort to keep alert, fighting sleep' },
      { value: 10, label: 'Extremely sleepy, cannot keep awake' },
    ]},
  ],

  score: (answers) => answers['kss1'] ?? 0,
  interpret: (score) => {
    if (score <= 5)  return { label: 'Alert',               color: '#2E7D32', description: 'Adequately alert for most tasks.' };
    if (score === 6) return { label: 'Onset of sleepiness', color: '#F59E0B', description: 'Early signs of sleepiness. Caution for safety-critical tasks.' };
    if (score <= 8)  return { label: 'Moderate sleepiness', color: '#EA580C', description: 'Moderate sleepiness — performance impairment likely.' };
    return                 { label: 'Severe sleepiness',    color: '#DC2626', description: 'Severe sleepiness — significant risk of performance failure.' };
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────
export const QUESTIONNAIRES = [ESS, ISI, DBAS16, MEQ, PSQI, RUSATED, STOPBANG, KSS];
export const getQuestionnaire = (id) => QUESTIONNAIRES.find((q) => q.id === id) ?? null;

// ─── compileQuestionnaire ─────────────────────────────────────────────────────
// Compiles score() and interpret() from declarative fields for imported JSON.
// Call this on any imported questionnaire before adding it to the registry.
export function compileQuestionnaire(q) {
  // Build score() from scoringMethod
  if (!q.score && q.scoringMethod) {
    const { type, items, yesValue = 1, multiplier = 1 } = q.scoringMethod;
    const keys = items ?? q.items.map(i => i.id);

    if (type === 'sum' || type === 'weighted_sum') {
      q.score = (answers) => keys.reduce((s, k) => {
        const v = answers[k];
        return s + (v === 'yes' ? yesValue : v === 'no' ? 0 : (v ?? 0));
      }, 0) * multiplier;
    } else if (type === 'mean') {
      q.score = (answers) => {
        const total = keys.reduce((s, k) => s + (answers[k] ?? 0), 0);
        return Math.round((total / keys.length) * multiplier * 10) / 10;
      };
    }
    // 'composite' — cannot be compiled declaratively; score() must be provided as JS
  }

  // Build interpret() from scoreBands
  if (!q.interpret && Array.isArray(q.scoreBands) && q.scoreBands.length > 0) {
    q.interpret = (score) => {
      const band = q.scoreBands.find(b => score >= b.min && score <= b.max);
      return band ?? q.scoreBands[q.scoreBands.length - 1];
    };
  }

  return q;
}

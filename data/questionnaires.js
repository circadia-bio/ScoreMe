/**
 * data/questionnaires.js — Questionnaire definitions for ScoreMe
 *
 * Same JSON format as SleepDiaries. Each questionnaire object:
 *   {
 *     id:           string
 *     title:        string
 *     shortTitle:   string
 *     instructions: string
 *     reference:    string
 *     credit:       string
 *     items: [{ id, number, text, type, options?, min?, max?, unit?, defaultValue? }]
 *     score:     (answers) => number | object
 *     interpret: (score)   => { label, color, description }
 *   }
 *
 * Input types:
 *   scale_0_3 | scale_0_4 | scale_0_10 | scale_1_10
 *   single_choice | yes_no | frequency_3 | frequency_4
 *   time | duration_min | number
 *
 * To add a custom questionnaire: follow the same structure and add it to
 * the QUESTIONNAIRES array at the bottom. Users can also import JSON files
 * that follow this schema via the Import screen.
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
  id: 'ess', maxScore: 24, title: 'Epworth Sleepiness Scale', shortTitle: 'ESS',
  credit: 'Johns, M. W. (1991). Sleep, 14(6), 540–545.',
  instructions: 'How likely are you to doze off or fall asleep in the following situations, in contrast to feeling just tired? This refers to your usual way of life in recent times.',
  reference: 'Johns, M. W. (1991). Sleep, 14(6), 540–545.',
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
  score: (answers) => [1,2,3,4,5,6,7,8].reduce((s, n) => s + (answers[`ess${n}`] ?? 0), 0),
  interpret: (score) => {
    if (score <= 7)  return { label: 'Normal',     color: '#2E7D32', description: 'Daytime sleepiness is within the normal range.' };
    if (score <= 9)  return { label: 'Borderline', color: '#F59E0B', description: 'Borderline score. Consider monitoring sleep.' };
    if (score <= 15) return { label: 'Excessive',  color: '#EA580C', description: 'Excessive daytime sleepiness. Consider clinical review.' };
    return               { label: 'Severe',      color: '#DC2626', description: 'Severe excessive daytime sleepiness. Recommend medical advice.' };
  },
};

// ─── ISI ──────────────────────────────────────────────────────────────────────
export const ISI = {
  id: 'isi', maxScore: 28, title: 'Insomnia Severity Index', shortTitle: 'ISI',
  credit: 'Morin, C. M., et al. (2011). Sleep, 34(5), 601–608.',
  instructions: 'For each of the following questions, please rate the current severity of your insomnia problem over the past two weeks.',
  reference: 'Morin, C. M., et al. (2011). Sleep, 34(5), 601–608.',
  items: [
    { id: 'isi1', number: 1, text: 'Difficulty falling asleep', type: 'scale_0_4', options: [{ value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Severe' }, { value: 4, label: 'Very severe' }] },
    { id: 'isi2', number: 2, text: 'Difficulty staying asleep', type: 'scale_0_4', options: [{ value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Severe' }, { value: 4, label: 'Very severe' }] },
    { id: 'isi3', number: 3, text: 'Problem waking up too early', type: 'scale_0_4', options: [{ value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Moderate' }, { value: 3, label: 'Severe' }, { value: 4, label: 'Very severe' }] },
    { id: 'isi4', number: 4, text: 'How satisfied or dissatisfied are you with your current sleep pattern?', type: 'scale_0_4', options: [{ value: 0, label: 'Very satisfied' }, { value: 1, label: 'Satisfied' }, { value: 2, label: 'Neutral' }, { value: 3, label: 'Dissatisfied' }, { value: 4, label: 'Very dissatisfied' }] },
    { id: 'isi5', number: 5, text: 'To what extent do you consider your sleep problem to interfere with your daily functioning?', type: 'scale_0_4', options: [{ value: 0, label: 'Not at all' }, { value: 1, label: 'A little' }, { value: 2, label: 'Somewhat' }, { value: 3, label: 'Much' }, { value: 4, label: 'Very much' }] },
    { id: 'isi6', number: 6, text: 'How noticeable to others do you think your sleeping problem is in terms of impairing quality of life?', type: 'scale_0_4', options: [{ value: 0, label: 'Not at all noticeable' }, { value: 1, label: 'Barely' }, { value: 2, label: 'Somewhat' }, { value: 3, label: 'Much' }, { value: 4, label: 'Very much noticeable' }] },
    { id: 'isi7', number: 7, text: 'How worried or distressed are you about your current sleep problem?', type: 'scale_0_4', options: [{ value: 0, label: 'Not at all' }, { value: 1, label: 'A little' }, { value: 2, label: 'Somewhat' }, { value: 3, label: 'Much' }, { value: 4, label: 'Very much' }] },
  ],
  score: (answers) => [1,2,3,4,5,6,7].reduce((s, n) => s + (answers[`isi${n}`] ?? 0), 0),
  interpret: (score) => {
    if (score <= 7)  return { label: 'No clinically significant insomnia', color: '#2E7D32', description: 'No clinically significant insomnia.' };
    if (score <= 14) return { label: 'Subthreshold insomnia',              color: '#F59E0B', description: 'Subthreshold insomnia. Consider sleep hygiene.' };
    if (score <= 21) return { label: 'Clinical insomnia (moderate)',        color: '#EA580C', description: 'Moderate clinical insomnia. Consider professional support.' };
    return               { label: 'Clinical insomnia (severe)',          color: '#DC2626', description: 'Severe clinical insomnia. Recommend medical advice.' };
  },
};

// ─── DBAS-16 ──────────────────────────────────────────────────────────────────
export const DBAS16 = {
  id: 'dbas16', maxScore: 10, title: 'Dysfunctional Beliefs and Attitudes about Sleep', shortTitle: 'DBAS-16',
  credit: 'Morin, C. M., Vallières, A., & Ivers, H. (2007). Sleep, 30(11), 1547–1554.',
  instructions: "Listed below are statements reflecting people's beliefs and attitudes about sleep. Please indicate to what extent you personally agree or disagree with each statement. Use a scale from 0 (strongly disagree) to 10 (strongly agree).",
  reference: 'Morin, C. M., Vallières, A., & Ivers, H. (2007). Sleep, 30(11), 1547–1554.',
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
    const total = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].reduce((s, n) => s + (answers[`dbas${n}`] ?? 0), 0);
    return Math.round((total / 16) * 10) / 10;
  },
  interpret: (score) => {
    if (score <= 4) return { label: 'Within normal range',    color: '#2E7D32', description: 'Beliefs and attitudes about sleep are broadly within the normal range.' };
    return           { label: 'Clinically relevant beliefs', color: '#EA580C', description: 'Dysfunctional beliefs about sleep that may be worth exploring.' };
  },
};

// ─── MEQ ──────────────────────────────────────────────────────────────────────
export const MEQ = {
  id: 'meq', maxScore: 86, title: 'Morningness–Eveningness Questionnaire', shortTitle: 'MEQ',
  credit: 'Horne, J. A., & Östberg, O. (1976). International Journal of Chronobiology, 4(2), 97–110.',
  instructions: 'Please read each question carefully before answering. Answer ALL questions. Each question should be answered independently of the others. Answer according to how you truly feel, not how you think you should feel.',
  reference: 'Horne, J. A., & Östberg, O. (1976). International Journal of Chronobiology, 4(2), 97–110.',
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
  score: (answers) => [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].reduce((s, n) => s + (answers[`meq${n}`] ?? 0), 0),
  interpret: (score) => {
    if (score >= 70) return { label: 'Definite morning type',  color: '#F59E0B', description: 'Definite morning type (early bird).' };
    if (score >= 59) return { label: 'Moderate morning type',  color: '#84CC16', description: 'Moderate preference for mornings.' };
    if (score >= 42) return { label: 'Intermediate type',      color: '#2E7D32', description: 'Intermediate chronotype — neither strongly morning nor evening.' };
    if (score >= 31) return { label: 'Moderate evening type',  color: '#6366F1', description: 'Moderate preference for evenings.' };
    return               { label: 'Definite evening type',   color: '#7C3AED', description: 'Definite evening type (night owl).' };
  },
};

// ─── PSQI ─────────────────────────────────────────────────────────────────────
export const PSQI = {
  id: 'psqi', maxScore: 21, title: 'Pittsburgh Sleep Quality Index', shortTitle: 'PSQI',
  credit: 'Buysse, D. J., et al. (1989). Psychiatry Research, 28(2), 193–213.',
  instructions: 'The following questions relate to your usual sleep habits during the past month only. Your answers should indicate the most accurate reply for the majority of days and nights in the past month.',
  reference: 'Buysse, D. J., et al. (1989). Psychiatry Research, 28(2), 193–213.',
  items: [
    { id: 'psqi1', number: 1, text: 'During the past month, what time have you usually gone to bed at night?', type: 'time', defaultValue: { hour: 23, minute: 0 } },
    { id: 'psqi2', number: 2, text: 'During the past month, how long (in minutes) has it usually taken you to fall asleep each night?', type: 'duration_min', defaultValue: 20, min: 0, max: 180, unit: 'min' },
    { id: 'psqi3', number: 3, text: 'During the past month, what time have you usually gotten up in the morning?', type: 'time', defaultValue: { hour: 7, minute: 0 } },
    { id: 'psqi4', number: 4, text: 'During the past month, how many hours of actual sleep did you get at night?', type: 'number', defaultValue: 7, min: 0, max: 24, unit: 'hrs' },
    { id: 'psqi5a', number: '5a', text: 'During the past month, how often have you had trouble sleeping because you cannot get to sleep within 30 minutes?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5b', number: '5b', text: 'How often have you had trouble sleeping because you wake up in the middle of the night or early morning?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5c', number: '5c', text: 'How often have you had trouble sleeping because you have to get up to use the bathroom?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5d', number: '5d', text: 'How often have you had trouble sleeping because you cannot breathe comfortably?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5e', number: '5e', text: 'How often have you had trouble sleeping because you cough or snore loudly?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5f', number: '5f', text: 'How often have you had trouble sleeping because you feel too cold?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5g', number: '5g', text: 'How often have you had trouble sleeping because you feel too hot?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5h', number: '5h', text: 'How often have you had trouble sleeping because you had bad dreams?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi5i', number: '5i', text: 'How often have you had trouble sleeping because you have pain?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi6', number: 6, text: 'During the past month, how often have you taken medicine to help you sleep (prescribed or over the counter)?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi7', number: 7, text: 'During the past month, how often have you had trouble staying awake while driving, eating meals, or engaging in social activity?', type: 'frequency_4', options: FREQUENCY_4 },
    { id: 'psqi8', number: 8, text: 'During the past month, how much of a problem has it been for you to keep up enough enthusiasm to get things done?', type: 'single_choice', options: [{ value: 0, label: 'No problem at all' }, { value: 1, label: 'Only a very slight problem' }, { value: 2, label: 'Somewhat of a problem' }, { value: 3, label: 'A very big problem' }] },
    { id: 'psqi9', number: 9, text: 'During the past month, how would you rate your sleep quality overall?', type: 'single_choice', options: [{ value: 0, label: 'Very good' }, { value: 1, label: 'Fairly good' }, { value: 2, label: 'Fairly bad' }, { value: 3, label: 'Very bad' }] },
  ],
  score: (answers) => {
    const c1 = answers['psqi9'] ?? 0;
    const sol = answers['psqi2'] ?? 0;
    const solScore = sol <= 15 ? 0 : sol <= 30 ? 1 : sol <= 60 ? 2 : 3;
    const q5a = answers['psqi5a'] ?? 0;
    const c2raw = solScore + q5a;
    const c2 = c2raw === 0 ? 0 : c2raw <= 2 ? 1 : c2raw <= 4 ? 2 : 3;
    const sd = answers['psqi4'] ?? 7;
    const c3 = sd >= 7 ? 0 : sd >= 6 ? 1 : sd >= 5 ? 2 : 3;
    const bt = answers['psqi1'] ? answers['psqi1'].hour * 60 + answers['psqi1'].minute : 23 * 60;
    const wt = answers['psqi3'] ? answers['psqi3'].hour * 60 + answers['psqi3'].minute : 7 * 60;
    let tib = wt - bt; if (tib <= 0) tib += 1440;
    const hse = tib > 0 ? (sd / (tib / 60)) * 100 : 0;
    const c4 = hse >= 85 ? 0 : hse >= 75 ? 1 : hse >= 65 ? 2 : 3;
    const distItems = ['psqi5b','psqi5c','psqi5d','psqi5e','psqi5f','psqi5g','psqi5h','psqi5i'];
    const distSum = distItems.reduce((s, k) => s + (answers[k] ?? 0), 0);
    const c5 = distSum === 0 ? 0 : distSum <= 9 ? 1 : distSum <= 18 ? 2 : 3;
    const c6 = answers['psqi6'] ?? 0;
    const c7raw = (answers['psqi7'] ?? 0) + (answers['psqi8'] ?? 0);
    const c7 = c7raw === 0 ? 0 : c7raw <= 2 ? 1 : c7raw <= 4 ? 2 : 3;
    return c1 + c2 + c3 + c4 + c5 + c6 + c7;
  },
  interpret: (score) => {
    if (score <= 4)  return { label: 'Good sleep quality',      color: '#2E7D32', description: 'Good overall sleep quality.' };
    if (score <= 10) return { label: 'Poor sleep quality',      color: '#F59E0B', description: 'Poor sleep quality. Consider sleep hygiene improvements.' };
    return               { label: 'Severe sleep difficulties', color: '#DC2626', description: 'Severe sleep difficulties. Recommend medical advice.' };
  },
};

// ─── STOP-BANG ────────────────────────────────────────────────────────────────
export const STOPBANG = {
  id: 'stopbang', maxScore: 8, title: 'STOP-BANG Questionnaire', shortTitle: 'STOP-BANG',
  credit: 'Chung, F., et al. (2016). Chest, 149(3), 631–638.',
  instructions: 'Please answer YES or NO to each of the following questions. This questionnaire screens for the risk of obstructive sleep apnoea.',
  reference: 'Chung, F., et al. (2016). Chest, 149(3), 631–638.',
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
    return              { label: 'High OSA risk',           color: '#DC2626', description: 'High OSA risk. Recommend medical evaluation.' };
  },
};

// ─── KSS ──────────────────────────────────────────────────────────────────────
export const KSS = {
  id: 'kss', beta: true, maxScore: 10, title: 'Karolinska Sleepiness Scale', shortTitle: 'KSS',
  credit: 'Åkerstedt, T., & Gillberg, M. (1990). International Journal of Neuroscience, 52(1–2), 29–37.',
  instructions: 'Using the scale below, please indicate how sleepy you feel right now, at this moment.',
  reference: 'Åkerstedt, T., & Gillberg, M. (1990). International Journal of Neuroscience, 52(1–2), 29–37.',
  items: [
    { id: 'kss1', number: 1, text: 'How sleepy do you feel right now?', type: 'scale_1_10', options: [
      { value: 1, label: 'Extremely alert' }, { value: 2, label: 'Very alert' }, { value: 3, label: 'Alert' },
      { value: 4, label: 'Rather alert' }, { value: 5, label: 'Neither alert nor sleepy' },
      { value: 6, label: 'Some signs of sleepiness' }, { value: 7, label: 'Sleepy, but no difficulty remaining awake' },
      { value: 8, label: 'Sleepy, some effort to keep alert' },
      { value: 9, label: 'Very sleepy, great effort to keep alert, fighting sleep' },
      { value: 10, label: 'Extremely sleepy, cannot keep awake' },
    ]},
  ],
  score: (answers) => answers['kss1'] ?? 0,
  interpret: (score) => {
    if (score <= 5) return { label: 'Alert',               color: '#2E7D32', description: 'Adequately alert for most tasks.' };
    if (score === 6) return { label: 'Onset of sleepiness', color: '#F59E0B', description: 'Early signs of sleepiness. Caution for safety-critical tasks.' };
    if (score <= 8) return { label: 'Moderate sleepiness', color: '#EA580C', description: 'Moderate sleepiness — performance impairment likely.' };
    return              { label: 'Severe sleepiness',    color: '#DC2626', description: 'Severe sleepiness — significant risk of performance failure.' };
  },
};

// ─── RU-SATED ─────────────────────────────────────────────────────────────────
const RUSATED_OPTIONS = [
  { value: 0, label: 'Never' }, { value: 1, label: 'Rarely' }, { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' }, { value: 4, label: 'Always' },
];
export const RUSATED = {
  id: 'rusated', maxScore: 24, title: 'Ru-SATED Sleep Health Scale', shortTitle: 'RU-SATED',
  credit: 'Buysse, D. J. (2014). Sleep, 37(1), 9–17.',
  instructions: 'The following statements refer to your sleep during the past one month. Please indicate the best response for each statement.',
  reference: 'Buysse, D. J. (2014). Sleep, 37(1), 9–17.',
  items: [
    { id: 'rus1', number: 1, text: 'I go to sleep and wake up at about the same time every day.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus2', number: 2, text: 'I sleep 7–9 hours per night.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus3', number: 3, text: 'The middle of my sleep period is between 2:00 AM and 4:00 AM.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus4', number: 4, text: 'I am awake for less than 30 minutes between the time I go to bed and the time I get out of bed.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus5', number: 5, text: 'I stay awake all day without dozing.', type: 'single_choice', options: RUSATED_OPTIONS },
    { id: 'rus6', number: 6, text: 'I am satisfied with my sleep.', type: 'single_choice', options: RUSATED_OPTIONS },
  ],
  score: (answers) => [1,2,3,4,5,6].reduce((s, n) => s + (answers[`rus${n}`] ?? 0), 0),
  interpret: (score) => {
    if (score >= 17) return { label: 'Good sleep health',     color: '#2E7D32', description: 'Good multidimensional sleep health.' };
    if (score >= 9)  return { label: 'Moderate sleep health', color: '#F59E0B', description: 'Moderate sleep health. There may be room for improvement.' };
    return               { label: 'Poor sleep health',      color: '#DC2626', description: 'Poor sleep health across multiple dimensions.' };
  },
};

// ─── Registry ──────────────────────────────────────────────────────────────────
export const QUESTIONNAIRES = [ESS, ISI, DBAS16, MEQ, PSQI, RUSATED, STOPBANG, KSS];
export const getQuestionnaire = (id) => QUESTIONNAIRES.find((q) => q.id === id) ?? null;

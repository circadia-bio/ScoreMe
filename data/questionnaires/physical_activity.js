/**
 * data/questionnaires/physical_activity.js — Physical Activity domain instruments
 *
 * IPAQ (Short Form) · GPAQ v2
 *
 * All instruments carry beta: true.
 * Both instruments score in MET-minutes/week (unbounded upper end).
 */

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
  reference: 'Craig, C. L., Marshall, A. L., Sjostrom, M., et al. (2003). International Physical Activity Questionnaire: 12-country reliability and validity. Medicine & Science in Sports & Exercise, 35(8), 1381-1395.',
  credit: 'IPAQ Research Committee.',
  copyright: 'Freely available for non-commercial research use. See ipaq.ki.se.',
  maxScore: null,
  scoringMethod: { type: 'composite' },
  scoringNote: 'MET-minutes/week: Vigorous = days x minutes x 8.0; Moderate = days x minutes x 4.0; Walking = days x minutes x 3.3. Total = sum. Categories: Low < 600; Moderate 600-2999; High >= 3000.',
  scoreBands: [
    { min: 0,    max: 599,      label: 'Inactive (Low)',              color: '#DC2626', description: 'Low physical activity level. Does not meet recommended activity guidelines.' },
    { min: 600,  max: 2999,     label: 'Minimally active (Moderate)', color: '#F59E0B', description: 'Minimally active. Meets some but not all activity guidelines.' },
    { min: 3000, max: Infinity, label: 'HEPA Active (High)',          color: '#2E7D32', description: 'Health-enhancing physical activity level.' },
  ],
  items: [
    { id: 'ipaq_vigd',  number: 1, text: 'During the last 7 days, on how many days did you do vigorous physical activities like heavy lifting, digging, aerobics, or fast bicycling?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'ipaq_vigm',  number: 2, text: 'How much time did you usually spend doing vigorous physical activities on one of those days?', type: 'duration_min', min: 0, max: 960, unit: 'min', hint: 'Enter 0 if no vigorous activity.' },
    { id: 'ipaq_modd',  number: 3, text: 'During the last 7 days, on how many days did you do moderate physical activities like carrying light loads, bicycling at regular pace, or doubles tennis?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'ipaq_modm',  number: 4, text: 'How much time did you usually spend doing moderate physical activities on one of those days?', type: 'duration_min', min: 0, max: 960, unit: 'min', hint: 'Enter 0 if no moderate activity.' },
    { id: 'ipaq_walkd', number: 5, text: 'During the last 7 days, on how many days did you walk for at least 10 minutes at a time?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'ipaq_walkm', number: 6, text: 'How much time did you usually spend walking on one of those days?', type: 'duration_min', min: 0, max: 960, unit: 'min', hint: 'Include walking at work and home, for transport, and for recreation and sport.' },
    { id: 'ipaq_sitm',  number: 7, text: 'During the last 7 days, how much time did you spend sitting on a week day?', type: 'duration_min', min: 0, max: 1440, unit: 'min', hint: 'Include time spent at work, at home, while doing coursework, and during leisure time.' },
  ],
  score: (answers) => Math.round(
    ((answers['ipaq_vigd'] ?? 0) * (answers['ipaq_vigm'] ?? 0) * 8.0) +
    ((answers['ipaq_modd'] ?? 0) * (answers['ipaq_modm'] ?? 0) * 4.0) +
    ((answers['ipaq_walkd'] ?? 0) * (answers['ipaq_walkm'] ?? 0) * 3.3)
  ),
  interpret: (score) => {
    if (score < 600)  return { label: 'Inactive (Low)',              color: '#DC2626', description: 'Low physical activity level. Does not meet recommended activity guidelines.' };
    if (score < 3000) return { label: 'Minimally active (Moderate)', color: '#F59E0B', description: 'Minimally active. Meets some but not all activity guidelines.' };
    return                  { label: 'HEPA Active (High)',           color: '#2E7D32', description: 'Health-enhancing physical activity level.' };
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
  constructDescription: 'Assesses physical activity in three domains (work, transport, leisure) and sedentary behaviour over a typical week using 16 items. Developed by the WHO for population surveillance.',
  timeframe: 'Typical week',
  languages: ['English', 'Arabic', 'Chinese', 'French', 'Portuguese', 'Russian', 'Spanish'],
  instructions: 'I am going to ask you about the time you spend doing different types of physical activity in a typical week. Please answer these questions even if you do not consider yourself to be a physically active person.',
  reference: 'Bull, F. C., Maslin, T. S., & Armstrong, T. (2009). Global Physical Activity Questionnaire (GPAQ): Nine country reliability and validity study. Journal of Physical Activity and Health, 6(6), 790-804.',
  credit: 'World Health Organization.',
  copyright: '© World Health Organization. Freely available for non-commercial research use.',
  maxScore: null,
  scoringMethod: { type: 'composite' },
  scoringNote: 'MET-minutes/week: Work vigorous = days x min x 8.0; Work moderate = days x min x 4.0; Transport = days x min x 4.0; Leisure vigorous = days x min x 8.0; Leisure moderate = days x min x 4.0. Categories: Insufficiently active < 600; Sufficiently active >= 600.',
  scoreBands: [
    { min: 0,   max: 599,      label: 'Insufficiently active', color: '#DC2626', description: 'Insufficient physical activity. Below WHO minimum recommendations.' },
    { min: 600, max: Infinity, label: 'Sufficiently active',   color: '#2E7D32', description: 'Sufficient physical activity. Meets WHO minimum recommendations.' },
  ],
  items: [
    { id: 'gpaq_p1',  number: 'P1',  text: 'Does your work involve vigorous-intensity activity that causes large increases in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p2',  number: 'P2',  text: 'In a typical week, on how many days do you do vigorous-intensity activities as part of your work?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p3',  number: 'P3',  text: 'How much time do you spend doing vigorous-intensity activities at work on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    { id: 'gpaq_p4',  number: 'P4',  text: 'Does your work involve moderate-intensity activity that causes a small increase in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p5',  number: 'P5',  text: 'In a typical week, on how many days do you do moderate-intensity activities as part of your work?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p6',  number: 'P6',  text: 'How much time do you spend doing moderate-intensity activities at work on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    { id: 'gpaq_p7',  number: 'P7',  text: 'Do you walk or use a bicycle for at least 10 minutes continuously to get to and from places?', type: 'yes_no' },
    { id: 'gpaq_p8',  number: 'P8',  text: 'In a typical week, on how many days do you walk or cycle for at least 10 minutes continuously to get to and from places?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p9',  number: 'P9',  text: 'How much time do you spend walking or cycling for travel on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    { id: 'gpaq_p10', number: 'P10', text: 'Do you do any vigorous-intensity sports, fitness or recreational activities that cause large increases in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p11', number: 'P11', text: 'In a typical week, on how many days do you do vigorous-intensity sports, fitness or recreational activities?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p12', number: 'P12', text: 'How much time do you spend doing vigorous-intensity sports, fitness or recreational activities on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    { id: 'gpaq_p13', number: 'P13', text: 'Do you do any moderate-intensity sports, fitness or recreational activities that cause a small increase in breathing or heart rate for at least 10 minutes continuously?', type: 'yes_no' },
    { id: 'gpaq_p14', number: 'P14', text: 'In a typical week, on how many days do you do moderate-intensity sports, fitness or recreational activities?', type: 'number', min: 0, max: 7, unit: 'days' },
    { id: 'gpaq_p15', number: 'P15', text: 'How much time do you spend doing moderate-intensity sports, fitness or recreational activities on a typical day?', type: 'duration_min', min: 0, max: 960, unit: 'min' },
    { id: 'gpaq_p16', number: 'P16', text: 'How much time do you usually spend sitting or reclining on a typical day?', type: 'duration_min', min: 0, max: 1440, unit: 'min', hint: 'Include time at work, at home, getting to and from places, and with friends.' },
  ],
  score: (answers) => {
    const g  = (k) => answers[k] ?? 0;
    const yn = (k) => answers[k] === 'yes' ? 1 : 0;
    return Math.round(
      yn('gpaq_p1')  * g('gpaq_p2')  * g('gpaq_p3')  * 8.0 +
      yn('gpaq_p4')  * g('gpaq_p5')  * g('gpaq_p6')  * 4.0 +
      yn('gpaq_p7')  * g('gpaq_p8')  * g('gpaq_p9')  * 4.0 +
      yn('gpaq_p10') * g('gpaq_p11') * g('gpaq_p12') * 8.0 +
      yn('gpaq_p13') * g('gpaq_p14') * g('gpaq_p15') * 4.0
    );
  },
  interpret: (score) => {
    if (score < 600) return { label: 'Insufficiently active', color: '#DC2626', description: 'Insufficient physical activity. Below WHO minimum recommendations.' };
    return                 { label: 'Sufficiently active',    color: '#2E7D32', description: 'Sufficient physical activity. Meets WHO minimum recommendations.' };
  },
};

export const PHYSICAL_ACTIVITY_QUESTIONNAIRES = [IPAQ_SHORT, GPAQ];

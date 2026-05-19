/**
 * data/questionnaires/index.js — Central registry for all ScoreMe questionnaires
 *
 * Import structure:
 *   data/questionnaires/
 *     sleep.js              ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, KSS
 *     mental_health.js      PHQ-2, PHQ-9, PHQ-15, GAD-7, GAD-2, BDI-II, BAI, DASS-21,
 *                           PANSS, STAI-S, STAI-T
 *     wellbeing.js          WHOQOL-BREF, MacArthur SSS
 *     physical_activity.js  IPAQ-S, GPAQ
 *     neurodevelopmental.js GSQ, AQ-10
 *     index.js              ← this file
 *
 * To add a new domain: create a new domain file, export a FOO_QUESTIONNAIRES
 * array from it, import and spread it into QUESTIONNAIRES below.
 *
 * Public API (unchanged from data/questionnaires.js):
 *   QUESTIONNAIRES            — full flat array of all instruments
 *   getQuestionnaire(id)      — look up by id
 *   compileQuestionnaire(q)   — compile score()/interpret() for imported JSON
 */

import { SLEEP_QUESTIONNAIRES }              from './sleep.js';
import { MENTAL_HEALTH_QUESTIONNAIRES }      from './mental_health.js';
import { WELLBEING_QUESTIONNAIRES }          from './wellbeing.js';
import { PHYSICAL_ACTIVITY_QUESTIONNAIRES }  from './physical_activity.js';
import { NEURODEVELOPMENTAL_QUESTIONNAIRES } from './neurodevelopmental.js';

// ─── Registry ─────────────────────────────────────────────────────────────────

export const QUESTIONNAIRES = [
  ...SLEEP_QUESTIONNAIRES,
  ...MENTAL_HEALTH_QUESTIONNAIRES,
  ...WELLBEING_QUESTIONNAIRES,
  ...PHYSICAL_ACTIVITY_QUESTIONNAIRES,
  ...NEURODEVELOPMENTAL_QUESTIONNAIRES,
];

export const getQuestionnaire = (id) => QUESTIONNAIRES.find((q) => q.id === id) ?? null;

// ─── compileQuestionnaire ─────────────────────────────────────────────────────
// Compiles score() and interpret() from declarative fields for imported JSON.
// Call this on any imported questionnaire before adding it to the registry.
export function compileQuestionnaire(q) {
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

  if (!q.interpret && Array.isArray(q.scoreBands) && q.scoreBands.length > 0) {
    q.interpret = (score) => {
      const band = q.scoreBands.find(b => score >= b.min && score <= b.max);
      return band ?? q.scoreBands[q.scoreBands.length - 1];
    };
  }

  return q;
}

// Re-export individual domain arrays for any consumer that needs them
export { SLEEP_QUESTIONNAIRES }              from './sleep.js';
export { MENTAL_HEALTH_QUESTIONNAIRES }      from './mental_health.js';
export { WELLBEING_QUESTIONNAIRES }          from './wellbeing.js';
export { PHYSICAL_ACTIVITY_QUESTIONNAIRES }  from './physical_activity.js';
export { NEURODEVELOPMENTAL_QUESTIONNAIRES } from './neurodevelopmental.js';

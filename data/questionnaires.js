/**
 * data/questionnaires.js
 *
 * Compatibility shim — re-exports everything from the domain-split registry.
 * All questionnaire definitions now live under data/questionnaires/:
 *
 *   sleep.js              ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, KSS
 *   mental_health.js      PHQ-2, PHQ-9, PHQ-15, GAD-7, GAD-2, BDI-II, BAI, DASS-21,
 *                         PANSS, STAI-S, STAI-T
 *   wellbeing.js          WHOQOL-BREF, MacArthur SSS
 *   physical_activity.js  IPAQ-S, GPAQ
 *   neurodevelopmental.js GSQ, AQ-10
 *   index.js              central registry + compileQuestionnaire
 *
 * Existing imports of the form:
 *   import { QUESTIONNAIRES, getQuestionnaire, compileQuestionnaire } from '../data/questionnaires';
 * continue to work unchanged.
 */

export {
  QUESTIONNAIRES,
  getQuestionnaire,
  compileQuestionnaire,
  SLEEP_QUESTIONNAIRES,
  MENTAL_HEALTH_QUESTIONNAIRES,
  WELLBEING_QUESTIONNAIRES,
  PHYSICAL_ACTIVITY_QUESTIONNAIRES,
  NEURODEVELOPMENTAL_QUESTIONNAIRES,
} from './questionnaires/index.js';

/**
 * storage/storage.js — AsyncStorage persistence for ScoreMe
 *
 * Participants are stored as a list; each has an id, name, notes, and a map
 * of questionnaire results keyed by questionnaire id.
 *
 * Key schema:
 *   scoreme:participants   → JSON array of participant objects
 *   scoreme:custom_qs      → JSON array of user-imported questionnaire objects
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { compileQuestionnaire } from '../data/questionnaires';

const KEYS = {
  participants: 'scoreme:participants',
  customQs:     'scoreme:custom_qs',
  disabledQs:   'scoreme:disabled_qs',
  onboarded:    'scoreme:onboarded',
};

// ─── Participants ──────────────────────────────────────────────────────────────

export async function loadParticipants() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.participants);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveParticipants(participants) {
  await AsyncStorage.setItem(KEYS.participants, JSON.stringify(participants));
}

export async function addParticipant(code, name = '', demographics = {}, study = {}, clinical = {}, customFields = []) {
  const participants = await loadParticipants();
  const newP = {
    id:          Date.now().toString(),
    code:        code.trim(),
    name:        name.trim(),
    // Demographics
    age:         demographics.age ?? '',
    sex:         demographics.sex ?? '',
    bmi:         demographics.bmi ?? '',
    // Study
    group:       study.group ?? '',
    site:        study.site ?? '',
    session:     study.session ?? '',
    // Clinical
    diagnosis:   clinical.diagnosis ?? '',
    medication:  clinical.medication ?? '',
    referral:    clinical.referral ?? '',
    // Free fields
    customFields: customFields,
    // Legacy
    notes:       '',
    createdAt:   new Date().toISOString(),
    results:     {},
  };
  participants.push(newP);
  await saveParticipants(participants);
  return newP;
}

export async function updateParticipant(id, updates) {
  const participants = await loadParticipants();
  const idx = participants.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  participants[idx] = { ...participants[idx], ...updates };
  await saveParticipants(participants);
  return participants[idx];
}

export async function deleteParticipant(id) {
  const participants = await loadParticipants();
  const filtered = participants.filter((p) => p.id !== id);
  await saveParticipants(filtered);
}

export async function saveResult(participantId, questionnaireId, answers, score) {
  const participants = await loadParticipants();
  const idx = participants.findIndex((p) => p.id === participantId);
  if (idx === -1) return null;
  const result = {
    id:            `${participantId}_${questionnaireId}_${Date.now()}`,
    questionnaireId,
    answers,
    score,
    completedAt:   new Date().toISOString(),
  };
  if (!participants[idx].results) participants[idx].results = {};
  participants[idx].results[questionnaireId] = result;
  await saveParticipants(participants);
  return result;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────
export async function hasSeenOnboarding() {
  try { return !!(await AsyncStorage.getItem(KEYS.onboarded)); }
  catch { return false; }
}

export async function markOnboardingComplete() {
  await AsyncStorage.setItem(KEYS.onboarded, '1');
}

// ─── Disabled questionnaires ──────────────────────────────────────────────────

export async function loadDisabledQs() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.disabledQs);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export async function setQDisabled(id, disabled) {
  const set = await loadDisabledQs();
  if (disabled) set.add(id); else set.delete(id);
  await AsyncStorage.setItem(KEYS.disabledQs, JSON.stringify([...set]));
}

// ─── Custom questionnaires ─────────────────────────────────────────────────────

export async function loadCustomQuestionnaires() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.customQs);
    const qs  = raw ? JSON.parse(raw) : [];
    // Re-compile score() and interpret() — lost during JSON serialisation
    return qs.map(compileQuestionnaire);
  } catch {
    return [];
  }
}

export async function saveCustomQuestionnaire(q) {
  const existing = await loadCustomQuestionnaires();
  const idx = existing.findIndex((e) => e.id === q.id);
  if (idx >= 0) existing[idx] = q;
  else existing.push(q);
  await AsyncStorage.setItem(KEYS.customQs, JSON.stringify(existing));
}

export async function deleteCustomQuestionnaire(id) {
  const existing = await loadCustomQuestionnaires();
  await AsyncStorage.setItem(KEYS.customQs, JSON.stringify(existing.filter((q) => q.id !== id)));
}

// ─── Export helpers ────────────────────────────────────────────────────────────

/**
 * Produce a full JSON export: participants with all results including raw item-level answers.
 */
export function participantsToJSON(participants, questionnaires) {
  const data = participants.map((p) => ({
    id:          p.id,
    code:        p.code ?? p.name,
    name:        p.name ?? '',
    age:         p.age ?? '',
    sex:         p.sex ?? '',
    bmi:         p.bmi ?? '',
    group:       p.group ?? '',
    site:        p.site ?? '',
    session:     p.session ?? '',
    diagnosis:   p.diagnosis ?? '',
    medication:  p.medication ?? '',
    referral:    p.referral ?? '',
    customFields: p.customFields ?? [],
    notes:       p.notes ?? '',
    createdAt:   p.createdAt,
    results:   Object.fromEntries(
      Object.entries(p.results ?? {}).map(([qid, r]) => [
        qid,
        {
          questionnaireId: r.questionnaireId,
          completedAt:     r.completedAt,
          answers:         r.answers,
          score:           r.score,
        },
      ])
    ),
  }));

  return JSON.stringify({
    exportedAt:     new Date().toISOString(),
    exportVersion:  '1.0',
    participantCount: participants.length,
    participants:   data,
  }, null, 2);
}

/**
 * Produce a CSV string for all participants × all questionnaire scores.
 */
export function participantsToCSV(participants, questionnaireIds) {
  const header = ['id', 'code', 'name', 'age', 'sex', 'bmi', 'group', 'site', 'session', 'diagnosis', 'medication', 'referral', 'notes', 'createdAt', ...questionnaireIds].join(',');
  const rows = participants.map((p) => {
    const scores = questionnaireIds.map((qid) => {
      const r = p.results?.[qid];
      if (!r) return '';
      if (typeof r.score === 'object') return JSON.stringify(r.score);
      return String(r.score);
    });
    return [
      p.id,
      `"${p.code ?? p.name ?? ''}"`,
      `"${p.name ?? ''}"`,
      p.age ?? '', p.sex ?? '', p.bmi ?? '',
      `"${p.group ?? ''}"`, `"${p.site ?? ''}"`, `"${p.session ?? ''}"`,
      `"${p.diagnosis ?? ''}"`, `"${p.medication ?? ''}"`, `"${p.referral ?? ''}"`,
      `"${p.notes ?? ''}"`,
      p.createdAt,
      ...scores,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

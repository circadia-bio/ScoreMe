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

export async function addParticipant(name, notes = '') {
  const participants = await loadParticipants();
  const newP = {
    id:        Date.now().toString(),
    name:      name.trim(),
    notes:     notes.trim(),
    createdAt: new Date().toISOString(),
    results:   {},
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
 * Produce a CSV string for all participants × all questionnaire scores.
 */
export function participantsToCSV(participants, questionnaireIds) {
  const header = ['ID', 'Name', 'Notes', 'Created', ...questionnaireIds].join(',');
  const rows = participants.map((p) => {
    const scores = questionnaireIds.map((qid) => {
      const r = p.results?.[qid];
      if (!r) return '';
      if (typeof r.score === 'object') return JSON.stringify(r.score);
      return String(r.score);
    });
    return [p.id, `"${p.name}"`, `"${p.notes}"`, p.createdAt, ...scores].join(',');
  });
  return [header, ...rows].join('\n');
}

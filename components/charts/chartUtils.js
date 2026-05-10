/**
 * components/charts/chartUtils.js
 * Pure stat helpers — no React, no RN imports.
 */

/** Extract numeric score from a result (returns null for object/missing) */
export function numericScore(result) {
  if (!result) return null;
  if (typeof result.score === 'number') return result.score;
  return null;
}

/** Descriptive stats for an array of numbers */
export function describe(values) {
  const v = values.filter(x => x !== null && x !== undefined && !isNaN(x));
  if (v.length === 0) return null;
  const sorted = [...v].sort((a, b) => a - b);
  const n    = v.length;
  const mean = v.reduce((s, x) => s + x, 0) / n;
  const sd   = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / n);
  const q1   = percentile(sorted, 25);
  const med  = percentile(sorted, 50);
  const q3   = percentile(sorted, 75);
  const iqr  = q3 - q1;
  const lo   = q1 - 1.5 * iqr;
  const hi   = q3 + 1.5 * iqr;
  const whiskerLo = sorted.find(x => x >= lo) ?? sorted[0];
  const whiskerHi = [...sorted].reverse().find(x => x <= hi) ?? sorted[sorted.length - 1];
  const outliers  = sorted.filter(x => x < lo || x > hi);
  return { n, mean, sd, min: sorted[0], max: sorted[n - 1], q1, median: med, q3, whiskerLo, whiskerHi, outliers };
}

function percentile(sorted, p) {
  if (sorted.length === 1) return sorted[0];
  const idx = (p / 100) * (sorted.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Group participants by a field value */
export function groupBy(participants, field) {
  const map = {};
  for (const p of participants) {
    const key = (field === 'all')
      ? 'All'
      : (p[field] ? String(p[field]) : 'Unknown');
    if (!map[key]) map[key] = [];
    map[key].push(p);
  }
  return map;
}

/** Collect numeric scores for a questionnaire across participants (latest result only) */
export function collectScores(participants, qid) {
  return participants
    .map(p => {
      const entry = p.results?.[qid];
      if (!entry) return null;
      const r = Array.isArray(entry) ? entry[entry.length - 1] : entry;
      return numericScore(r);
    })
    .filter(x => x !== null);
}

/** Completion rate 0–1 (any result present) */
export function completionRate(participants, qid) {
  if (!participants.length) return 0;
  return participants.filter(p => {
    const entry = p.results?.[qid];
    return entry && (Array.isArray(entry) ? entry.length > 0 : true);
  }).length / participants.length;
}

/** Palette for groups */
const GROUP_PALETTE = [
  '#4A7BB5', '#6B3FA0', '#E07A20', '#2E7D32',
  '#EA580C', '#0891B2', '#BE185D', '#65A30D',
];
export function groupColor(index) {
  return GROUP_PALETTE[index % GROUP_PALETTE.length];
}

export function round2(x) { return Math.round(x * 100) / 100; }

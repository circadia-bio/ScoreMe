/**
 * storage/scoreFormat.js
 *
 * Shared score-formatting utility for composite / object scores.
 *
 * Currently handles:
 *   - µMCTQ / MCTQ: { msfsc: <decimal hours> } → "HH:MM MSFsc"
 *   - Legacy: score stored as a JSON string (pre-fix) → parsed first
 *   - Primitive scores → String(score)
 *
 * Pass `{ compact: true }` to omit the " MSFsc" label (used in CSV/table cells).
 */

const pad = (n) => String(n).padStart(2, '0');

/**
 * @param {*} score  Raw score value from storage (may be object, number, or legacy JSON string)
 * @param {{ compact?: boolean }} [opts]
 * @returns {string}
 */
export function fmtScore(score, { compact = false } = {}) {
  // Handle legacy JSON-string encoding (saved before composite-score fix)
  let s = score;
  if (typeof s === 'string') {
    try { s = JSON.parse(s); } catch { /* leave as string */ }
  }

  if (typeof s === 'object' && s !== null) {
    // µMCTQ / MCTQ: decimal hours → HH:MM
    if (s.msfsc !== undefined) {
      const h = Math.floor(s.msfsc);
      const m = Math.round((s.msfsc % 1) * 60);
      return compact ? `${pad(h)}:${pad(m)}` : `${pad(h)}:${pad(m)} MSFsc`;
    }
    // Unknown composite — JSON fallback so nothing is silently lost
    return compact ? JSON.stringify(s) : '—';
  }

  return String(s);
}

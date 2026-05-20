/**
 * data/questionnaires/utils.js — Localisation helper
 *
 * localise(questionnaire, locale) returns a shallow copy of the questionnaire
 * object with translatable strings replaced by the requested locale's
 * translations, falling back to English (the base object) for any missing keys.
 *
 * Translatable fields:
 *   • questionnaire.instructions
 *   • questionnaire.scoringNote        (shown in detail panel)
 *   • item.text                        (question stem)
 *   • item.hint                        (shown below the stem)
 *   • item.options[].label             (response option labels)
 *   • scoreBand.label / .description   (result screen)
 *
 * Fields intentionally NOT translated (proper names / citations):
 *   • title, shortTitle, version, reference, credit, copyright
 *   • construct, constructDescription
 *
 * Usage:
 *   import { localise } from '../data/questionnaires/utils';
 *   import { locale }   from '../i18n';
 *   const q = localise(questionnaire, locale);
 */

/**
 * Merge translated options array over the base options array.
 * Matches by index — translated array must be the same length.
 */
function mergeOptions(baseOptions, translatedOptions) {
  if (!translatedOptions || !Array.isArray(baseOptions)) return baseOptions;
  return baseOptions.map((opt, i) => {
    const tOpt = translatedOptions[i];
    if (!tOpt) return opt;
    return { ...opt, label: tOpt.label ?? opt.label };
  });
}

/**
 * Merge translated items over base items.
 * Keyed by item.id so order doesn't matter.
 */
function mergeItems(baseItems, translatedItems) {
  if (!translatedItems) return baseItems;
  return baseItems.map((item) => {
    const tItem = translatedItems[item.id];
    if (!tItem) return item;
    const merged = { ...item };
    if (tItem.text)    merged.text = tItem.text;
    if (tItem.hint)    merged.hint = tItem.hint;
    if (tItem.options) merged.options = mergeOptions(item.options, tItem.options);
    return merged;
  });
}

/**
 * Merge translated score bands over base score bands.
 * Matched by index.
 */
function mergeScoreBands(baseBands, translatedBands) {
  if (!translatedBands || !Array.isArray(baseBands)) return baseBands;
  return baseBands.map((band, i) => {
    const tBand = translatedBands[i];
    if (!tBand) return band;
    return {
      ...band,
      label:       tBand.label       ?? band.label,
      description: tBand.description ?? band.description,
    };
  });
}

/**
 * Return a localised copy of a questionnaire object.
 * If no translation exists for the requested locale, returns the original.
 */
export function localise(questionnaire, locale) {
  if (!locale || locale === 'en' || !questionnaire.translations) return questionnaire;

  const tr = questionnaire.translations[locale];
  if (!tr) return questionnaire;

  const localised = { ...questionnaire };

  if (tr.instructions) localised.instructions = tr.instructions;
  if (tr.scoringNote)  localised.scoringNote  = tr.scoringNote;

  if (tr.items) {
    localised.items = mergeItems(questionnaire.items, tr.items);
  }

  if (tr.scoreBands) {
    localised.scoreBands = mergeScoreBands(questionnaire.scoreBands, tr.scoreBands);
  }

  return localised;
}

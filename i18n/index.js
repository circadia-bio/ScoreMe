/**
 * i18n/index.js — Locale detection and t() helper
 *
 * Mirrors the exact same pattern as SleepDiaries/i18n/index.js.
 * Detects the device locale at startup and selects the matching
 * translation object, falling back to English for unsupported locales.
 *
 * Usage anywhere in the app:
 *
 *   import { t, locale } from '../i18n';
 *
 *   t('dashboard.title')
 *   t('export.participants', { count: 3 })   // _one / _other pluralisation
 *
 * Supported locales: en (default), pt-BR
 */

import { getLocales } from 'expo-localization';
import en   from './en';
import ptBR from './pt-BR';

const TRANSLATIONS = {
  en,
  'pt-BR': ptBR,
  pt:      ptBR,  // bare 'pt' → pt-BR
};

function resolveTranslations() {
  try {
    const locales = getLocales();
    for (const { languageTag, languageCode } of locales) {
      if (TRANSLATIONS[languageTag])  return { bundle: TRANSLATIONS[languageTag], locale: languageTag };
      if (TRANSLATIONS[languageCode]) return { bundle: TRANSLATIONS[languageCode], locale: languageCode };
    }
  } catch (_) {
    // getLocales() can throw in some environments (e.g. Jest without setup)
  }
  return { bundle: en, locale: 'en' };
}

const { bundle: strings, locale } = resolveTranslations();

/**
 * Retrieve a translated string by dot-separated key.
 * Supports {{variable}} interpolation and _one / _other pluralisation
 * when a `count` option is provided.
 */
function t(key, options = {}) {
  const parts = key.split('.');
  let value   = strings;
  for (const part of parts) {
    if (value == null || typeof value !== 'object') { value = null; break; }
    value = value[part];
  }

  if ((value === null || value === undefined) && options.count !== undefined) {
    const pluralKey = options.count === 1 ? `${key}_one` : `${key}_other`;
    return t(pluralKey, options);
  }

  if (typeof value !== 'string') return key;

  return value.replace(/\{\{(\w+)\}\}/g, (_, varName) =>
    options[varName] !== undefined ? String(options[varName]) : `{{${varName}}}`
  );
}

export { t, locale, strings };
export default t;

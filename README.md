# 📋 ScoreMe

**A cross-platform research questionnaire scorer for Circadia Lab.**

[![MIT License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2055-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react)](https://reactnative.dev)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-4A7BB5)](https://expo.dev)

---

## 📖 What is ScoreMe?

ScoreMe is a mobile and desktop app for administering and scoring validated clinical and sleep health questionnaires across multiple research participants. It is designed for lab-based or clinic-based research sessions where a researcher needs to collect structured self-report data from a cohort, track completion, and export results for analysis.

It is part of the Circadia Lab toolchain and shares its visual identity with [SleepDiaries](https://github.com/circadia-bio/SleepDiaries).

---

## ✨ Features

- 📋 **25 built-in validated instruments** across 5 clinical domains — Sleep (ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, KSS), Mental Health (PHQ-2, PHQ-9, PHQ-15, GAD-7, GAD-2, BDI-II, BAI, DASS-21, PANSS, STAI-S, STAI-T), Wellbeing (WHOQOL-BREF, MacArthur SSS), Physical Activity (IPAQ-S, GPAQ), and Neurodevelopmental (GSQ, AQ-10)
- 👥 **Rich participant profiles** — mandatory participant code plus optional name, demographics (age, sex, BMI), study fields (group, site, session), clinical fields (diagnosis, medication, referral), and arbitrary custom key–value pairs
- 🔍 **Search and sort** — filter participants by code, name, group, site, or session; sort by date added, A–Z, or completion %
- 🎯 **Step-by-step questionnaire runner** — one item at a time, automatic scoring and interpretation on completion, coloured result badge with glow shadow
- 🕐 **Score history** — re-scoring appends to a timestamped history array; no data is ever overwritten; attempt count shown in detail view; full history in JSON export
- 🔀 **Enable/disable instruments** — per-questionnaire toggles persisted across sessions; animated pill toggle; group by clinical domain
- 📊 **Analytics tab** — score distributions (SVG box plots with whiskers, mean, median), descriptive statistics table (n, mean ± SD, median, range), completion rates, switchable grouping by group/condition, sex, session, or site
- 📥 **Custom questionnaire import** — import any instrument as a JSON file following the built-in schema
- 📤 **CSV and JSON export** — CSV includes all participant metadata fields and custom fields as dynamic columns, with latest score per questionnaire; JSON includes full timestamped score history with item-level answers; preview table in the export panel
- 🖥️ **Desktop split-panel layout** — left participant list, right detail/scoring/edit panel, glassmorphic sidebar with About modal
- 🌐 **Cross-platform** — runs as a web app, iOS app, and Android app from the same codebase
- 🌍 **Localisation** — English and Brazilian Portuguese (PT-BR) for both UI strings and instrument content (item text, response options, instructions, score band labels), detected automatically from the device locale
- 🎉 **First-run onboarding** — 3-slide centred modal walkthrough, shown once; resettable from the About modal

---

## 🗂️ Project Structure

```
ScoreMe/
├── app/
│   ├── _layout.jsx              Root layout — fonts, WebShell, Stack
│   ├── index.jsx                Redirects to tabs
│   ├── export.jsx               Export screen + DesktopExportModal
│   ├── score/[pid]/[qid].jsx   Mobile scoring route
│   ├── participant/[id].jsx     Mobile participant detail + inline edit
│   └── (tabs)/
│       ├── _layout.jsx          Desktop shell; onboarding modal
│       ├── index.jsx            Dashboard
│       ├── participants.jsx     Participant list + search/sort + FAB + detail panel
│       ├── questionnaires.jsx   Questionnaire library + toggles + domain grouping
│       └── analytics.jsx        Score distributions, stats table, completion rates
├── components/
│   ├── QuestionnaireRunner.jsx  Step-by-step runner (desktop + mobile); applies localise()
│   ├── OnboardingModal.jsx      First-run centred square modal
│   ├── ScreenBackground.jsx     SVG gradient background (mobile)
│   ├── DesktopBackground.jsx    Dot-grid pattern background (desktop)
│   ├── DesktopSidebar.jsx       Sidebar nav + About modal + onboarding reset
│   └── charts/
│       ├── BoxPlot.jsx          SVG box-and-whisker plot with group support
│       ├── CompletionBar.jsx    Horizontal completion rate bars
│       └── chartUtils.js        Descriptive stats, grouping, palette helpers
├── data/
│   ├── questionnaires.js        Compatibility shim — re-exports from questionnaires/index.js
│   └── questionnaires/
│       ├── index.js             Central registry — QUESTIONNAIRES, getQuestionnaire,
│       │                        compileQuestionnaire; imports all domain files
│       ├── sleep.js             ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, KSS
│       ├── mental_health.js     PHQ-2, PHQ-9, PHQ-15, GAD-7, GAD-2, BDI-II, BAI,
│       │                        DASS-21, PANSS, STAI-S, STAI-T
│       ├── wellbeing.js         WHOQOL-BREF, MacArthur SSS
│       ├── physical_activity.js IPAQ-S, GPAQ
│       ├── neurodevelopmental.js GSQ, AQ-10
│       └── utils.js             localise(questionnaire, locale) — merges pt-BR translations
│                                over the base EN instrument object at runtime
├── i18n/
│   ├── index.js                 Locale detection + t() helper
│   ├── en.js                    English UI strings
│   └── pt-BR.js                 Brazilian Portuguese UI strings
├── storage/
│   └── storage.js               AsyncStorage CRUD, score history, export helpers,
│                                 disabled-Qs, onboarding flag
│                                 Exports: getLatestResult, getAllResults
├── theme/
│   ├── typography.js            FONTS, SIZES, COLOURS
│   └── responsive.js            useLayout(), SIDEBAR_W, SIDEBAR_TOTAL
├── docs/
│   └── questionnaire-schema.md  Full schema reference + LLM prompt template
└── scripts/
    └── setup.js                 Copies fonts + logo.png from SleepDiaries sibling repo
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- The [SleepDiaries](https://github.com/circadia-bio/SleepDiaries) repo cloned as a sibling directory (for fonts and logo)

### Installation

```bash
git clone https://github.com/circadia-bio/ScoreMe
cd ScoreMe
npm install
node scripts/setup.js     # copies fonts + logo.png from SleepDiaries
```

> If SleepDiaries is not present, `setup.js` will skip missing files gracefully and the app will fall back to system fonts.

### Run

```bash
# Web (recommended for development)
npx expo start --web

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android
```

---

## 👤 Participant Data Model

Each participant stores a mandatory code and a set of optional fields exported in both CSV and JSON:

| Field | Type | Notes |
|---|---|---|
| `code` | string | **Required.** Unique participant identifier (e.g. `P001`) |
| `name` | string | Full name (optional) |
| `age` | string | Age in years |
| `sex` | string | Male / Female / Non-binary / Prefer not to say |
| `bmi` | string | Body mass index |
| `group` | string | Group or condition label (e.g. Control, Treatment A) |
| `site` | string | Recruitment or testing site |
| `session` | string | Session label (e.g. Baseline, Week 4) |
| `diagnosis` | string | Clinical diagnosis |
| `medication` | string | Current medication |
| `referral` | string | Referral source |
| `customFields` | `{label, value}[]` | Arbitrary researcher-defined key–value pairs; each becomes its own CSV column |
| `notes` | string | Free-text notes |

Metadata chips in the detail panel are colour-coded by category (demographics, study, clinical).

### Score history

Each questionnaire result is stored as a timestamped array. Re-scoring appends a new entry rather than overwriting. `getLatestResult(participant, qid)` and `getAllResults(participant, qid)` are exported from `storage.js` for use across screens. Legacy single-object results are migrated automatically on next save.

---

## 📥 Custom Questionnaire Import

Any validated questionnaire can be imported as a `.json` file. ScoreMe compiles scoring and interpretation logic from declarative fields — no code required.

To import: **Questionnaires tab → Import JSON**.

The minimum required fields are `id`, `title`, and `items`. A complete example:

```json
{
  "id": "pss10",
  "title": "Perceived Stress Scale — 10 items",
  "shortTitle": "PSS-10",
  "domain": "Mental Health",
  "construct": "Perceived stress",
  "timeframe": "Past month",
  "maxScore": 40,
  "scoringMethod": { "type": "sum", "items": ["pss1","pss2","pss3","pss4","pss5","pss6","pss7","pss8","pss9","pss10"] },
  "scoreBands": [
    { "min": 0,  "max": 13, "label": "Low stress",      "color": "#2E7D32", "description": "Low perceived stress." },
    { "min": 14, "max": 26, "label": "Moderate stress",  "color": "#F59E0B", "description": "Moderate perceived stress." },
    { "min": 27, "max": 40, "label": "High stress",      "color": "#DC2626", "description": "High perceived stress." }
  ],
  "items": [
    {
      "id": "pss1", "number": 1,
      "text": "In the last month, how often have you been upset because of something that happened unexpectedly?",
      "type": "frequency_4",
      "options": [
        { "value": 0, "label": "Never" },
        { "value": 1, "label": "Almost never" },
        { "value": 2, "label": "Sometimes" },
        { "value": 3, "label": "Fairly often" },
        { "value": 4, "label": "Very often" }
      ]
    }
  ]
}
```

See [`docs/questionnaire-schema.md`](docs/questionnaire-schema.md) for the full schema reference, all supported item types, and a ready-to-paste LLM prompt for generating new questionnaire files.

---

## 🌍 Localisation

ScoreMe detects the device locale at startup using `expo-localization` and selects the matching translation bundle, falling back to English for unsupported locales.

**Supported languages:**

| Code | Language | Status |
|---|---|---|
| `en` | English | ✅ Default |
| `pt-BR` | Portuguese (Brazil) | ✅ Complete |

### UI strings

All interface strings are keyed in `i18n/en.js` and `i18n/pt-BR.js`. To add a new language, duplicate either file and register the new locale tag in `i18n/index.js`.

The `t()` helper supports `{{variable}}` interpolation and `_one` / `_other` pluralisation:

```js
import t from '../i18n';

t('dashboard.title')                          // "Dashboard" / "Painel"
t('export.participants', { count: 3 })        // "3 participants" / "3 participantes"
```

### Instrument content translations

Item text, response option labels, instructions, hints, and score band labels for all 25 built-in instruments are translated inside a `translations` block on each instrument definition. The `localise(questionnaire, locale)` helper in `data/questionnaires/utils.js` merges the requested locale over the base English object at runtime, with per-key English fallback for any missing keys.

```js
// Applied automatically in QuestionnaireRunner before rendering:
import { localise } from '../data/questionnaires/utils';
import { locale }   from '../i18n';

const q = localise(questionnaire, locale);
// q.instructions, q.items[n].text, q.items[n].options[n].label
// are now in the device locale where translations exist
```

Fields intentionally left in English: `title`, `shortTitle`, `version`, `reference`, `credit`, `copyright`, `construct`, `constructDescription` — these are proper names and citations.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~55 | App framework and build toolchain |
| `expo-router` | ~55 | File-based navigation |
| `expo-blur` | ~14 | Glassmorphic BlurView components |
| `expo-document-picker` | ~55 | JSON import from device |
| `expo-file-system` | ~18 | File write for CSV/JSON export |
| `expo-font` | ~55 | Custom font loading |
| `expo-localization` | ~55 | Device locale detection for i18n |
| `expo-sharing` | ~55 | Share sheet for export |
| `@react-native-async-storage/async-storage` | 2.2 | Persistent storage |
| `react-native-safe-area-context` | 5.6 | Safe area insets |
| `react-native-svg` | 15.15 | SVG charts in analytics tab |
| `@expo/vector-icons` | ~15 | Ionicons icon set |

---

## 👥 Authors

| Role | Name | Affiliation |
|---|---|---|
| Developer / Researcher | Lucas França | Circadia Lab |
| Researcher | Mario Leocadio-Miguel | Circadia Lab |

---

## 🤝 Related Tools

- 🌙 [**SleepDiaries**](https://github.com/circadia-bio/SleepDiaries) — participant-facing sleep diary app; shares visual identity and font assets with ScoreMe
- 🔬 [**tallieR**](https://github.com/circadia-bio/tallieR) — companion R package for importing ScoreMe JSON exports, rescoring questionnaires, and returning tidy data frames
- 🔬 [**circadia-bio**](https://github.com/circadia-bio) — the Circadia Lab GitHub organisation

---

## 📄 Licence

![](assets/images/logo.png)

Copyright © Lucas França, Mario Leocadio-Miguel, 2026

Released under the [MIT License](./LICENSE).

> **Note on third-party questionnaire instruments:** The validated questionnaires included in this app are the intellectual property of their respective authors and institutions. Their inclusion in this open-source repository does not grant any rights to use them beyond what is permitted by each instrument's licence. See the `credit` and `copyright` fields in `data/questionnaires/` for per-instrument details.

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

- 📋 **8 built-in validated instruments** — ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, KSS
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
│   ├── QuestionnaireRunner.jsx  Step-by-step runner (desktop + mobile)
│   ├── OnboardingModal.jsx      First-run centred square modal
│   ├── ScreenBackground.jsx     SVG gradient background (mobile)
│   ├── DesktopBackground.jsx    Dot-grid pattern background (desktop)
│   ├── DesktopSidebar.jsx       Sidebar nav + About modal + onboarding reset
│   └── charts/
│       ├── BoxPlot.jsx          SVG box-and-whisker plot with group support
│       ├── CompletionBar.jsx    Horizontal completion rate bars
│       └── chartUtils.js        Descriptive stats, grouping, palette helpers
├── data/
│   └── questionnaires.js        8 built-in instruments + compileQuestionnaire()
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
  "id": "gad2",
  "title": "Generalised Anxiety Disorder 2-item Scale",
  "shortTitle": "GAD-2",
  "domain": "Mental Health",
  "construct": "Anxiety screening",
  "timeframe": "Past two weeks",
  "maxScore": 6,
  "scoringMethod": { "type": "sum", "items": ["gad2_1", "gad2_2"] },
  "scoreBands": [
    { "min": 0, "max": 2, "label": "Minimal anxiety",  "color": "#2E7D32", "description": "Minimal anxiety symptoms." },
    { "min": 3, "max": 6, "label": "Possible anxiety", "color": "#DC2626", "description": "Possible anxiety disorder. Consider further assessment." }
  ],
  "items": [
    {
      "id": "gad2_1", "number": 1,
      "text": "Feeling nervous, anxious, or on edge",
      "type": "frequency_4",
      "options": [
        { "value": 0, "label": "Not at all" },
        { "value": 1, "label": "Several days" },
        { "value": 2, "label": "More than half the days" },
        { "value": 3, "label": "Nearly every day" }
      ]
    },
    {
      "id": "gad2_2", "number": 2,
      "text": "Not being able to stop or control worrying",
      "type": "frequency_4",
      "options": [
        { "value": 0, "label": "Not at all" },
        { "value": 1, "label": "Several days" },
        { "value": 2, "label": "More than half the days" },
        { "value": 3, "label": "Nearly every day" }
      ]
    }
  ]
}
```

See [`docs/questionnaire-schema.md`](docs/questionnaire-schema.md) for the full schema reference, all supported item types, and a ready-to-paste LLM prompt for generating new questionnaire files.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~55 | App framework and build toolchain |
| `expo-router` | ~55 | File-based navigation |
| `expo-blur` | ~14 | Glassmorphic BlurView components |
| `expo-document-picker` | ~55 | JSON import from device |
| `expo-file-system` | ~18 | File write for CSV/JSON export |
| `expo-sharing` | ~55 | Share sheet for export |
| `expo-font` | ~55 | Custom font loading |
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
- 🔬 [**circadia-bio**](https://github.com/circadia-bio) — the Circadia Lab GitHub organisation

---

## 📄 Licence

Released under the [MIT License](./LICENSE).

Copyright © Lucas França, Mario Leocadio-Miguel, 2026

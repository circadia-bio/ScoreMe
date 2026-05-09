# 📋 ScoreMe

**A cross-platform research questionnaire scorer for Circadia Lab.**

[![MIT License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)](https://reactnative.dev)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-4A7BB5)](https://expo.dev)

---

## 📖 What is ScoreMe?

ScoreMe is a mobile and desktop app for administering and scoring validated clinical and sleep health questionnaires across multiple research participants. It is designed for lab-based or clinic-based research sessions where a researcher needs to collect structured self-report data from a cohort, track completion, and export results for analysis.

It is part of the Circadia Lab toolchain and shares its visual identity with [SleepDiaries](https://github.com/circadia-bio/SleepDiaries).

---

## ✨ Features

- 📋 **8 built-in validated instruments** — ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, KSS
- 👥 **Multi-participant management** — add, track, and delete participants; progress rings colour-coded by completion
- 🎯 **Step-by-step questionnaire runner** — one item at a time, automatic scoring and interpretation on completion
- 🔀 **Enable/disable instruments** — per-questionnaire toggles persisted across sessions; group by clinical domain
- 📥 **Custom questionnaire import** — import any instrument as a JSON file following the built-in schema
- 📤 **CSV and JSON export** — CSV for scores-only spreadsheet analysis; JSON for full item-level responses with metadata
- 🖥️ **Desktop split-panel layout** — left participant list, right detail and inline scoring panel, glassmorphic sidebar
- 🌐 **Cross-platform** — runs as a web app, iOS app, and Android app from the same codebase
- 🎉 **First-run onboarding** — centred modal walkthrough, shown once on first launch

---

## 🗂️ Project Structure

```
ScoreMe/
├── app/
│   ├── _layout.jsx              Root layout — fonts, WebShell, Stack
│   ├── index.jsx                Redirects to tabs
│   ├── export.jsx               Export screen + DesktopExportModal
│   └── (tabs)/
│       ├── _layout.jsx          Desktop shell; onboarding modal
│       ├── index.jsx            Dashboard
│       ├── participants.jsx     Participant list + FAB + detail panel
│       └── questionnaires.jsx   Questionnaire library + toggles + domain grouping
├── components/
│   ├── QuestionnaireRunner.jsx  Step-by-step runner (desktop + mobile)
│   ├── OnboardingModal.jsx      First-run centred square modal
│   ├── ScreenBackground.jsx     SVG gradient background (mobile)
│   ├── DesktopBackground.jsx    Dot-grid pattern background (desktop)
│   └── DesktopSidebar.jsx       Sidebar nav + About modal
├── data/
│   └── questionnaires.js        8 built-in instruments + compileQuestionnaire()
├── storage/
│   └── storage.js               AsyncStorage CRUD, export helpers, onboarding flag
├── theme/
│   ├── typography.js            FONTS, SIZES, COLOURS
│   └── responsive.js            useLayout(), SIDEBAR_W, SIDEBAR_TOTAL
└── scripts/
    └── setup.js                 Copies fonts + logo.png from SleepDiaries sibling repo
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

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
| `expo` | ~52 | App framework and build toolchain |
| `expo-router` | ~4 | File-based navigation |
| `expo-blur` | ~14 | Glassmorphic BlurView components |
| `expo-document-picker` | ~12 | JSON import from device |
| `expo-file-system` | ~17 | File write for CSV/JSON export |
| `expo-sharing` | ~12 | Share sheet for export |
| `expo-font` | ~12 | Custom font loading |
| `@react-native-async-storage/async-storage` | ~2 | Persistent storage |
| `react-native-safe-area-context` | ~4 | Safe area insets |
| `@expo/vector-icons` | ~14 | Ionicons icon set |

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

Copyright © Lucas França, Mario Leocadio-Miguel, 2025

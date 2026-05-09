# ScoreMe

**Research questionnaire scorer for Circadia Lab.**

ScoreMe is a cross-platform app (iOS, Android, web/desktop) for administering and scoring validated clinical and sleep health questionnaires across multiple research participants. It is part of the Circadia Lab toolchain and shares its visual identity with SleepDiaries.

---

## Features

- **8 built-in instruments** — ESS, ISI, DBAS-16, MEQ, PSQI, RU-SATED, STOP-BANG, KSS
- **Multi-participant management** — add, track, and delete participants; progress rings colour-coded by completion
- **Step-by-step questionnaire runner** — one item at a time, automatic scoring on completion
- **Enable/disable instruments** — per-questionnaire toggles, persisted across sessions; group by clinical domain
- **Custom questionnaire import** — import any instrument as a JSON file following the built-in schema
- **CSV and JSON export** — CSV for scores-only spreadsheet analysis; JSON for full item-level responses
- **Desktop split-panel layout** — left participant list, right detail/scoring panel, glassy sidebar navigation
- **First-run onboarding** — centred modal walkthrough, shown once

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo (SDK 52) + Expo Router |
| UI | React Native + expo-blur |
| Persistence | AsyncStorage |
| Export | expo-sharing + expo-file-system |
| Fonts | Livvic-Bold, Afacad (shared with SleepDiaries) |

---

## Repository layout

```
ScoreMe/
├── app/
│   ├── _layout.jsx              Root layout — fonts, WebShell, Stack, onboarding gate
│   ├── index.jsx                Redirect to tabs
│   ├── export.jsx               Export screen + DesktopExportModal
│   ├── (tabs)/
│   │   ├── _layout.jsx          Desktop shell; onboarding modal wired here
│   │   ├── index.jsx            Dashboard
│   │   ├── participants.jsx     Participant list + FAB + desktop detail panel
│   │   └── questionnaires.jsx   Questionnaire library + toggles + domain grouping
│   ├── participant/[id].jsx     Participant detail (mobile)
│   └── score/[pid]/[qid].jsx   Full-screen questionnaire runner (mobile)
├── components/
│   ├── QuestionnaireRunner.jsx  Step-by-step runner (shared desktop + mobile)
│   ├── OnboardingModal.jsx      First-run centred square modal
│   ├── ScreenBackground.jsx     Blue SVG gradient background (mobile)
│   ├── DesktopBackground.jsx    Dot-grid pattern background (desktop)
│   └── DesktopSidebar.jsx       Sidebar nav + About modal (tap wordmark)
├── data/
│   └── questionnaires.js        8 built-in instruments + compileQuestionnaire()
├── storage/
│   └── storage.js               AsyncStorage CRUD, export helpers, onboarding flag
├── theme/
│   ├── typography.js            FONTS, SIZES, COLOURS
│   └── responsive.js           useLayout(), SIDEBAR_W, SIDEBAR_TOTAL
└── scripts/
    └── setup.js                 Copies fonts + logo.png from SleepDiaries sibling repo
```

---

## Setup

ScoreMe shares font assets with its sibling repo **SleepDiaries**. Both repos must sit in the same parent directory:

```
GitHub/
  SleepDiaries/    ← source of fonts and Circadia logo
  ScoreMe/         ← this repo
```

**Install:**

```bash
git clone <this-repo> ScoreMe
cd ScoreMe
npm install
node scripts/setup.js   # copies fonts + logo.png from SleepDiaries
npx expo start --web
```

> If SleepDiaries is not present, `setup.js` will skip missing files gracefully and the app will fall back to system fonts.

---

## Custom questionnaires

Any questionnaire can be imported as a JSON file. See [`docs/questionnaire-schema.md`](docs/questionnaire-schema.md) for the full schema and a step-by-step guide for creating new instruments with LLM assistance.

A minimal valid import looks like:

```json
{
  "id": "gad2",
  "title": "Generalised Anxiety Disorder 2-item Scale",
  "shortTitle": "GAD-2",
  "domain": "Mental Health",
  "construct": "Anxiety screening",
  "timeframe": "Past two weeks",
  "maxScore": 6,
  "scoringMethod": {
    "type": "sum",
    "items": ["gad2_1", "gad2_2"]
  },
  "scoreBands": [
    { "min": 0, "max": 2, "label": "Minimal anxiety",    "color": "#2E7D32", "description": "Minimal anxiety symptoms." },
    { "min": 3, "max": 6, "label": "Possible anxiety",   "color": "#DC2626", "description": "Possible anxiety disorder. Consider further assessment." }
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

---

## AsyncStorage keys

| Key | Contents |
|---|---|
| `scoreme:participants` | JSON array of participant objects |
| `scoreme:custom_qs` | JSON array of imported questionnaire objects |
| `scoreme:disabled_qs` | JSON array of disabled questionnaire IDs |
| `scoreme:onboarded` | `"1"` once onboarding has been dismissed |

---

## Design tokens

| Token | Value |
|---|---|
| Background | `#EEF5FF` |
| Primary blue | `#4A7BB5` |
| Primary dark | `#1E3A5F` |
| Primary light | `#C8DFF5` |
| Accent orange | `#E07A20` |
| Card background | `rgba(255,255,255,0.72)` |
| Card border | `rgba(255,255,255,0.9)` |
| Heading font | Livvic-Bold |
| Body font | Afacad-Medium / Afacad-Regular |

---

## Credits

Lucas França · Mario Leocadio-Miguel  
© Circadia Lab · MIT Licence · [circadia-lab.uk](https://circadia-lab.uk)

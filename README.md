# ScoreMe

**ScoreMe** is a React Native (Expo) app for researchers to administer and score validated sleep questionnaires across multiple participants. It shares the visual identity of [SleepDiaries](https://github.com/circadia-bio/SleepDiaries) — same fonts, colours, card styles, and step-by-step questionnaire UX — and uses the same JSON questionnaire format, making definitions interoperable between the two apps.

---

## Screens

| Screen | Description |
|---|---|
| **Dashboard** | Stat bar, per-questionnaire coverage heatmap, all participants with colour-coded score badges |
| **Participants** | Add / delete participants with name and notes |
| **Participant detail** | All results for one person + launch scoring for any questionnaire |
| **Questionnaire runner** | Step-by-step scoring (identical UX to SleepDiaries) |
| **Questionnaire library** | Browse all built-in instruments + import custom JSON |
| **Export** | Preview all scores and download as CSV |

---

## Built-in questionnaires

| ID | Name | Items |
|---|---|---|
| `ess` | Epworth Sleepiness Scale | 8 |
| `isi` | Insomnia Severity Index | 7 |
| `dbas16` | Dysfunctional Beliefs and Attitudes about Sleep | 16 |
| `meq` | Morningness–Eveningness Questionnaire | 19 |
| `psqi` | Pittsburgh Sleep Quality Index | 17 |
| `rusated` | Ru-SATED Sleep Health Scale | 6 |
| `stopbang` | STOP-BANG Questionnaire | 8 |
| `kss` | Karolinska Sleepiness Scale | 1 |

---

## Getting started

**Prerequisites:** Node.js ≥ 18, Expo CLI

```bash
# 1. Copy shared assets from SleepDiaries (fonts + icons)
node scripts/setup.js

# 2. Install dependencies
npm install

# 3. Start
npx expo start          # Opens Expo Go / dev client
npx expo start --web    # Opens in browser as PWA
```

---

## Questionnaire JSON format

Custom questionnaires can be imported via the Questionnaires tab as `.json` files.
The schema is identical to SleepDiaries — copy definitions directly between projects.

```json
{
  "id": "my_scale",
  "title": "My Custom Scale",
  "shortTitle": "MCS",
  "instructions": "Please answer each question honestly.",
  "reference": "Author et al. (Year). Journal, vol(issue), pp–pp.",
  "items": [
    {
      "id": "mcs1",
      "number": 1,
      "text": "How often do you feel X?",
      "type": "single_choice",
      "options": [
        { "value": 0, "label": "Never" },
        { "value": 1, "label": "Sometimes" },
        { "value": 2, "label": "Always" }
      ]
    }
  ]
}
```

**Supported item types:**

| Type | Description |
|---|---|
| `scale_0_3` | 4-option labelled scale (0–3) |
| `scale_0_4` | 5-option labelled scale (0–4) |
| `scale_0_10` | 11-point grid (0–10), "strongly disagree → agree" |
| `scale_1_10` | 10-option labelled scale (1–10) |
| `single_choice` | Pick one from labelled options with explicit values |
| `yes_no` | Large Yes / No buttons |
| `frequency_3` | 3-point frequency (Rarely / Sometimes / Usually) |
| `frequency_4` | 4-point frequency (Not past month / <once/wk / 1–2×/wk / ≥3×/wk) |
| `time` | HH:MM stepper with long-press repeat |
| `duration_min` | Integer minutes stepper |
| `number` | Integer stepper with min/max/unit |

> **Note:** For programmatic scoring of imported questionnaires, add a `score` function to the definition in `data/questionnaires.js`. Imported-only JSON stores raw answers; scoring can be done externally from the CSV export.

---

## Project structure

```
ScoreMe/
├── app/
│   ├── _layout.jsx               Root layout, font loading, web shell
│   ├── export.jsx                CSV export screen
│   ├── (tabs)/
│   │   ├── _layout.jsx           Tab bar (Dashboard / Participants / Questionnaires)
│   │   ├── index.jsx             Dashboard
│   │   ├── participants.jsx      Participant management
│   │   └── questionnaires.jsx    Questionnaire library + JSON import
│   ├── participant/[id].jsx      Participant detail & scoring hub
│   └── score/[pid]/[qid].jsx     Questionnaire runner for a participant
│
├── components/
│   ├── QuestionnaireRunner.jsx   Full step-by-step questionnaire UX
│   └── ScreenBackground.jsx      Soft-blue SVG gradient (matches SleepDiaries)
│
├── data/
│   └── questionnaires.js         All 8 built-in questionnaire definitions
│
├── storage/
│   └── storage.js                AsyncStorage: participants, results, custom Qs, CSV export
│
├── theme/
│   └── typography.js             FONTS, SIZES, COLOURS (identical to SleepDiaries)
│
└── scripts/
    └── setup.js                  Copies fonts & icons from SleepDiaries sibling repo
```

---

## Relationship to SleepDiaries

ScoreMe and SleepDiaries share:
- Font set: Livvic-Bold, Afacad-Bold/Medium/Regular
- Colour palette: `#EEF5FF` background, `#4A7BB5` primary, `#6B3FA0` questionnaire purple, `#E07A20` accent
- Glassmorphic card style: `rgba(255,255,255,0.72)` + `rgba(255,255,255,0.9)` border
- Questionnaire JSON schema and all scoring/interpretation logic
- Step-by-step questionnaire runner UX

Questionnaire definitions can be copied directly between the two codebases.

---

## License

MIT

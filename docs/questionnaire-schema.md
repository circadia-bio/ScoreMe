# Questionnaire Schema Guide

How to create a custom questionnaire JSON file for import into ScoreMe — including how to prompt an LLM to do it for you.

---

## Overview

ScoreMe can import any validated questionnaire as a `.json` file. On import, the app compiles scoring and interpretation logic from the declarative fields — no code required. The JSON is validated, saved to local storage, and immediately available in the questionnaire library alongside the built-ins.

To import: open ScoreMe → Questionnaires tab → **Import JSON**.

---

## Full schema reference

```json
{
  "id":           "unique_snake_case_id",
  "title":        "Full Instrument Name",
  "shortTitle":   "ABBREV",
  "version":      "Optional version string, e.g. GAD-7 or PHQ-9",
  "beta":         false,

  "domain":       "Clinical domain — e.g. Sleep, Mental Health, Pain, Neurology",
  "construct":    "What the instrument measures — e.g. Anxiety severity",
  "constructDescription": "One sentence describing the construct in plain language.",
  "timeframe":    "Recall window — e.g. Past two weeks, Right now, Past month, General",
  "languages":    ["English", "French"],

  "instructions": "Text shown to the participant before item 1.",

  "reference":    "Primary citation in APA format.",
  "credit":       "Author attribution if different from reference.",
  "copyright":    "Copyright holder and licence note.",

  "maxScore":     21,
  "scoringMethod": {
    "type":   "sum",
    "items":  ["item_id_1", "item_id_2"]
  },
  "scoringNote":  "Plain-English description of the scoring algorithm.",
  "scoreBandDirection": "asc",
  "scoreBands": [
    {
      "min": 0, "max": 4,
      "label": "Minimal",
      "color": "#2E7D32",
      "description": "Minimal symptoms."
    }
  ],

  "items": [
    {
      "id":           "item_id_1",
      "number":       1,
      "text":         "Item stem as it appears in the questionnaire.",
      "type":         "frequency_4",
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

## Field-by-field reference

### Identity

| Field | Required | Description |
|---|---|---|
| `id` | ✅ | Unique identifier, `snake_case`. Use the instrument abbreviation, e.g. `gad7`, `phq9`, `fss`. Must be unique across all questionnaires in the app. |
| `title` | ✅ | Full name of the instrument. |
| `shortTitle` | ✅ | Abbreviation shown in chips and headers, e.g. `GAD-7`. |
| `version` | — | Version identifier if relevant, e.g. `"PHQ-9"` or `"ISI-7"`. |
| `beta` | — | Set to `true` to show a BETA badge on the questionnaire. |
| `domain` | — | Clinical domain. Common values: `Sleep`, `Mental Health`, `Pain`, `Fatigue`, `Neurology`, `Wellbeing`. Drives the "By domain" grouping in the Questionnaires tab. |

### Content

| Field | Required | Description |
|---|---|---|
| `construct` | — | What the instrument measures, 2–5 words, e.g. `"Anxiety severity"`. |
| `constructDescription` | — | One sentence expanding on the construct. |
| `timeframe` | — | Recall period shown as a tag: `Past two weeks`, `Right now`, `Past month`, `General`. |
| `languages` | — | Array of validated language names. |
| `instructions` | — | Full instructions shown before item 1. |

### Attribution

| Field | Required | Description |
|---|---|---|
| `reference` | — | Primary citation in APA format. |
| `credit` | — | Author and institution if different from citation. |
| `copyright` | — | Copyright holder. Note if freely available for research use. |

### Scoring

| Field | Required | Description |
|---|---|---|
| `maxScore` | — | Maximum possible numeric score. Used for display and validation. |
| `scoringMethod` | — | Declarative scoring descriptor (see below). |
| `scoringNote` | — | Plain-English description shown in the detail panel. |
| `scoreBandDirection` | — | `"asc"` (default — higher score = worse/more symptoms) or `"desc"` (higher = better, e.g. MEQ chronotype, RU-SATED sleep health). |
| `scoreBands` | — | Array of interpretation bands (see below). |

#### `scoringMethod` types

| Type | Behaviour |
|---|---|
| `"sum"` | Adds all item answer values. For `yes_no` items, set `yesValue` (default 1). |
| `"mean"` | Averages item values, rounded to 1 decimal place. Optionally multiply by `multiplier`. |
| `"weighted_sum"` | Same as `sum` — item options carry their own numeric values already. |
| `"composite"` | Complex multi-step algorithm. Provide `scoringNote` to describe it; auto-compilation is not supported and the score will default to 0. |

```json
"scoringMethod": {
  "type":      "sum",
  "items":     ["phq1", "phq2", "phq3"],
  "yesValue":  1,
  "multiplier": 1
}
```

#### `scoreBands`

Each band specifies `min` and `max` (both inclusive), a `label`, a hex `color`, and a `description` shown to the researcher.

```json
"scoreBands": [
  { "min": 0,  "max": 4,  "label": "Minimal",  "color": "#2E7D32", "description": "Minimal symptoms." },
  { "min": 5,  "max": 9,  "label": "Mild",      "color": "#F59E0B", "description": "Mild symptoms." },
  { "min": 10, "max": 14, "label": "Moderate",  "color": "#EA580C", "description": "Moderate symptoms." },
  { "min": 15, "max": 27, "label": "Severe",    "color": "#DC2626", "description": "Severe symptoms." }
]
```

Recommended colour conventions:

| Severity | Hex |
|---|---|
| Good / normal / low risk | `#2E7D32` |
| Borderline / mild | `#F59E0B` |
| Moderate | `#EA580C` |
| Severe / high risk | `#DC2626` |
| Categorical (no severity ordering) | `#4A7BB5`, `#6B3FA0`, `#0F6E56` |

### Items

| Field | Required | Description |
|---|---|---|
| `id` | ✅ | Unique item identifier within this questionnaire. Convention: `prefix_N`, e.g. `gad7_1`. |
| `number` | ✅ | Display number shown to participant — integer or string (e.g. `"5a"`). |
| `text` | ✅ | Item stem, verbatim from the instrument. |
| `type` | ✅ | Input widget type (see below). |
| `options` | — | Required for `single_choice`; optional to override default labels for scale types. Array of `{ "value": number, "label": string }`. |
| `hint` | — | Explanatory text shown below the stem in smaller type. |
| `defaultValue` | — | Pre-filled starting value. Number, or `{ "hour": 23, "minute": 0 }` for `time`. |
| `min` / `max` | — | Bounds for `number` and `duration_min` inputs. |
| `unit` | — | Display unit for `number` / `duration_min`, e.g. `"min"`, `"hrs"`. |

#### Item types

| Type | Widget | Answer values |
|---|---|---|
| `scale_0_3` | 4 labelled buttons | 0, 1, 2, 3 |
| `scale_0_4` | 5 labelled buttons | 0, 1, 2, 3, 4 |
| `scale_0_10` | 11 labelled buttons | 0–10 |
| `scale_1_10` | 10 labelled buttons | 1–10 |
| `single_choice` | Labelled buttons from `options` | Option `value` |
| `yes_no` | Yes / No pill buttons | `"yes"` or `"no"` |
| `frequency_3` | 3-point frequency buttons | 0, 1, 2 |
| `frequency_4` | 4-point frequency buttons | 0, 1, 2, 3 |
| `time` | Hour:minute stepper | `{ "hour": N, "minute": N }` |
| `duration_min` | Minutes stepper | number |
| `number` | +/− stepper | number |

For `scale_*` types without explicit `options`, ScoreMe renders default generic labels. Always supply `options` when the scale has named anchors that matter clinically.

---

## LLM prompt template

Copy the block below into Claude, GPT-4, or any capable LLM. Fill in the sections marked `[...]`. The model will return a JSON object ready to import into ScoreMe.

---

```
You are a clinical research assistant helping to encode a validated questionnaire into JSON for the ScoreMe app.

## Instrument details

Name:         [Full instrument name, e.g. Fatigue Severity Scale]
Abbreviation: [e.g. FSS]
Domain:       [e.g. Fatigue]
Timeframe:    [e.g. Past two weeks]
Instructions: [Paste the verbatim participant instructions]

Items:
[Paste the full item list here, numbered, with all response options and their values]

Scoring:
[Describe the algorithm precisely, e.g.:
 "Sum of all 9 items rated 1–7. Score range 9–63. Cut-off: ≥ 36 = clinically significant fatigue."]

Score interpretation:
[List each band with its range and clinical meaning]

Reference:   [APA citation]
Copyright:   [e.g. © Author, Year. Freely available for non-commercial research use.]

## Output rules

1. Return a single valid JSON object only. No markdown fences, no comments, no trailing commas, no JavaScript.
2. Use the following field names exactly: id, title, shortTitle, version, domain, construct, constructDescription, timeframe, languages, instructions, reference, copyright, maxScore, scoringMethod, scoringNote, scoreBands, scoreBandDirection, items.
3. id must be snake_case, e.g. "fss". All item ids must be unique within the file, e.g. "fss_1", "fss_2".
4. scoringMethod must be: { "type": "sum" | "mean" | "weighted_sum", "items": ["fss_1", ...] }
   - Use "sum" for summed scales, "mean" for averaged scales.
   - For yes/no items that score 1 for yes: add "yesValue": 1 to scoringMethod.
   - If the algorithm cannot be expressed as sum or mean, use "composite" and explain in scoringNote.
5. scoreBands must cover every possible score. Use these colors:
   - #2E7D32  good / normal / low
   - #F59E0B  borderline / mild
   - #EA580C  moderate
   - #DC2626  severe / high risk
6. scoreBandDirection: "asc" if higher score = worse (default); "desc" if higher = better.
7. options arrays must use numbers for value, not strings.
8. Output only the JSON — nothing else.
```

---

### Tips for reliable output

- **Paste the full item list verbatim** — do not paraphrase. LLMs reproduce text they can see; they reconstruct (and hallucinate) text they have to imagine.
- **Specify non-sequential option values explicitly** — some instruments (e.g. MEQ, SF-36) assign weights that are not 0, 1, 2, 3. If this is the case, list the exact option values in your prompt.
- **Reverse-scored items** — mention them explicitly: "Items 3, 5, and 7 are reverse-scored: a response of 1 maps to 5, 2→4, 3→3, 4→2, 5→1."
- **Composite scoring** — if the algorithm cannot be expressed as a simple sum or mean (e.g. PSQI with its seven component scores), set `"type": "composite"` and describe the algorithm in `scoringNote`. Scoring will display as 0 until a `score()` function is provided in code.
- **Validate before importing** — paste the JSON into [jsonlint.com](https://jsonlint.com) to catch syntax errors. ScoreMe will show an alert if `id`, `title`, or `items` are missing.

---

## Validation checklist

Before importing, confirm:

- [ ] `id` is unique and uses `snake_case` (no spaces, no hyphens)
- [ ] All item `id` values are unique within the file
- [ ] `scoringMethod.items` includes every item that contributes to the total score
- [ ] `scoreBands` covers the full numeric range from the minimum possible score to `maxScore`
- [ ] `min` and `max` in each band are numbers, not strings
- [ ] `color` values are valid 6-digit hex strings starting with `#`
- [ ] No JavaScript — no comments (`//`), no trailing commas, no `undefined` or `null` where a value is expected
- [ ] File is saved as `.json`, UTF-8 encoded

---

## Built-in instruments for reference

The following instruments are included in ScoreMe as built-ins and can serve as structural reference when creating custom JSON:

| ID | Instrument | Items | Scoring | Domain |
|---|---|---|---|---|
| `ess` | Epworth Sleepiness Scale | 8 × scale_0_3 | Sum | Sleep |
| `isi` | Insomnia Severity Index | 7 × scale_0_4 | Sum | Sleep |
| `dbas16` | Dysfunctional Beliefs about Sleep | 16 × scale_0_10 | Mean | Sleep |
| `meq` | Morningness–Eveningness Questionnaire | 19 × single_choice | Weighted sum | Sleep |
| `psqi` | Pittsburgh Sleep Quality Index | Mixed | Composite | Sleep |
| `rusated` | RU-SATED Sleep Health | 6 × single_choice | Sum (desc) | Sleep |
| `stopbang` | STOP-BANG | 8 × yes_no | Sum | Sleep |
| `kss` | Karolinska Sleepiness Scale | 1 × scale_1_10 | Sum | Sleep |

Full source definitions are in `data/questionnaires.js`.

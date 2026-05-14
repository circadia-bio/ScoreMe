/**
 * i18n/en.js — English strings for ScoreMe
 */
export default {

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabs: {
    dashboard:      'Dashboard',
    participants:   'Participants',
    questionnaires: 'Questionnaires',
    analytics:      'Analytics',
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    title:    'Dashboard',
    subtitle: 'Research Questionnaire Scorer',
    stats: {
      participants: 'Participants',
      scored:       'Scored',
      totalScores:  'Total scores',
    },
    noParticipants:    'No participants yet',
    noParticipantsSub: 'Add participants in the Participants tab, then score them on any questionnaire.',
    addParticipant:    'Add participant',
    addFirst:          'Add first participant',
    exportData:        'Export data',
    exportDataSub:     'Download scores as CSV or full JSON',
    scoredCount:       '{{n}}/{{total}} scored',
    selectParticipant: 'Select a participant',
  },

  // ── Participants ───────────────────────────────────────────────────────────
  participants: {
    title:        'Participants',
    add:          'Add',
    cancel:       'Cancel',
    noParticipants: 'No participants yet',
    searchPlaceholder: 'Search by code, name, group…',
    noMatches:    'No matches for "{{query}}"',
    added:        'Added {{date}}',
    scoredN:      '{{n}} scored',
    sort: {
      added:      'Added',
      alpha:      'A–Z',
      completion: '% Done',
    },
    selectOrAdd:  'Select a participant\nor add a new one',
    ofScored:     '{{scored}} of {{total}} scored',
    // Detail panel
    results:      'RESULTS',
    scoreNow:     'SCORE NOW',
    redo:         'Redo',
    start:        'Start',
    items:        '{{n}} items',
    // Add / Edit form
    newParticipant: 'New Participant',
    newParticipantSub: 'Fill in at least a code to continue',
    saveChanges:  'Save changes',
    saving:       'Saving…',
    adding:       'Adding…',
    addParticipant: 'Add Participant',
    deleteConfirm: 'Remove "{{name}}" and all their scores? This cannot be undone.',
    // Form sections
    sectionIdentity:     'Identity',
    sectionDemographics: 'Demographics',
    sectionStudy:        'Study',
    sectionClinical:     'Clinical',
    sectionCustom:       'Custom fields',
    sectionNotes:        'Notes',
    // Form fields
    fieldCode:       'Participant Code',
    fieldCodePh:     'e.g. P001',
    fieldName:       'Name',
    fieldNamePh:     'Full name (optional)',
    fieldAge:        'Age',
    fieldAgePh:      'e.g. 34',
    fieldSex:        'Sex',
    fieldBmi:        'BMI',
    fieldBmiPh:      'e.g. 24.5',
    fieldGroup:      'Group / Condition',
    fieldGroupPh:    'e.g. Control, Treatment A',
    fieldSite:       'Site',
    fieldSitePh:     'e.g. London',
    fieldSession:    'Session',
    fieldSessionPh:  'e.g. Baseline, Week 4',
    fieldDiagnosis:  'Diagnosis',
    fieldDiagnosisPh:'e.g. Insomnia disorder',
    fieldMedication: 'Medication',
    fieldMedicationPh:'e.g. None',
    fieldReferral:   'Referral',
    fieldReferralPh: 'e.g. GP, self-referred',
    fieldNotePh:     'Any additional notes…',
    fieldLabel:      'Label',
    fieldValue:      'Value',
    addField:        'Add field',
    sexOptions: {
      male:         'Male',
      female:       'Female',
      nonBinary:    'Non-binary',
      preferNot:    'Prefer not to say',
    },
  },

  // ── Questionnaires ─────────────────────────────────────────────────────────
  questionnaires: {
    title:       'Questionnaires',
    builtIn:     'Built-in',
    custom:      'Custom',
    byDomain:    'By domain',
    importJSON:  'Import JSON',
    import:      'Import',
    disableAll:  'Disable all',
    enableAll:   'Enable all',
    selectDetail: 'Select a questionnaire to view details',
    // Detail panel sections
    whatItMeasures:   'WHAT IT MEASURES',
    items:            'Items',
    format:           'Format',
    maxScore:         'Max score',
    instructions:     'INSTRUCTIONS',
    scoringMethod:    'SCORING METHOD',
    interpretation:   'SCORE INTERPRETATION',
    languages:        'VALIDATED LANGUAGES',
    reference:        'REFERENCE',
    credit:           'CREDIT',
    copyright:        'COPYRIGHT',
    // Delete
    removeTitle:      'Remove questionnaire',
    removeBody:       'Remove "{{title}}"? Scores already collected are not affected.',
    removeCancel:     'Cancel',
    removeConfirm:    'Remove',
    // Import errors
    importInvalid:    'The JSON must have at minimum: id, title, items[].',
    importFailed:     'Import failed',
    importedTitle:    'Imported!',
    importedBody:     '"{{title}}" added to your library.',
    // Item type labels
    itemTypes: {
      scale_0_3:    '0–3 scale',
      scale_0_4:    '0–4 scale',
      scale_0_10:   '0–10 scale',
      scale_1_10:   '1–10 scale',
      single_choice:'single choice',
      yes_no:       'yes / no',
      frequency_3:  'frequency',
      frequency_4:  'frequency',
      time:         'time (HH:MM)',
      duration_min: 'duration (min)',
      number:       'number',
    },
    importHint: 'Import custom questionnaires as JSON files following the same schema as the built-ins.',
  },

  // ── Questionnaire runner ───────────────────────────────────────────────────
  runner: {
    back:            'Back',
    next:            'Next',
    finish:          'Finish',
    done:            'Done',
    yes:             'Yes',
    no:              'No',
    itemOf:          'Item {{current}} of {{total}}',
    holdHint:        'hold for ±1 min',
    stronglyDisagree:'Strongly disagree',
    stronglyAgree:   'Strongly agree',
    interpretation:  'Interpretation',
  },

  // ── Export ─────────────────────────────────────────────────────────────────
  export: {
    title:            'Export Data',
    participants_one:   '{{count}} participant',
    participants_other: '{{count}} participants',
    scores_one:         '{{count}} score',
    scores_other:       '{{count}} scores',
    stats: {
      participants: 'Participants',
      scored:       'Scored',
      totalScores:  'Total scores',
    },
    exportLabel:    'EXPORT',
    csv:            'Export as CSV',
    csvExporting:   'Exporting…',
    csvSub:         'Scores only · one row per participant',
    json:           'Export as JSON',
    jsonExporting:  'Exporting…',
    jsonSub:        'Full item-level answers + metadata',
    preview:        'PREVIEW',
    noDataTitle:    'No data yet',
    noDataSub:      'Add participants and complete questionnaires to export results.',
    nothingToExport:'Nothing to export',
    nothingToExportSub: 'Add and score some participants first.',
    failed:         'Export failed',
    shareDialog:    'Export ScoreMe data',
    saved:          'Saved',
  },

  // ── Analytics ──────────────────────────────────────────────────────────────
  analytics: {
    title:   'Analytics',
    comingSoon: 'Coming soon',
  },

  // ── Onboarding ─────────────────────────────────────────────────────────────
  onboarding: {
    getStarted: 'Get Started',
    next:       'Next',
    back:       'Back',
  },

  // ── Common ─────────────────────────────────────────────────────────────────
  common: {
    ok:     'OK',
    cancel: 'Cancel',
    delete: 'Delete',
    close:  'Close',
  },
};

/**
 * i18n/pt-BR.js — Português (Brasil) — ScoreMe
 */
export default {

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabs: {
    dashboard:      'Painel',
    participants:   'Participantes',
    questionnaires: 'Questionários',
    analytics:      'Análises',
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    title:    'Painel',
    subtitle: 'Pontuador de Questionários de Pesquisa',
    stats: {
      participants: 'Participantes',
      scored:       'Pontuados',
      totalScores:  'Total de pontuações',
    },
    noParticipants:    'Nenhum participante ainda',
    noParticipantsSub: 'Adicione participantes na aba Participantes e depois pontue-os em qualquer questionário.',
    addParticipant:    'Adicionar participante',
    addFirst:          'Adicionar primeiro participante',
    exportData:        'Exportar dados',
    exportDataSub:     'Baixar pontuações em CSV ou JSON completo',
    scoredCount:       '{{n}}/{{total}} pontuados',
    selectParticipant: 'Selecione um participante',
  },

  // ── Participants ───────────────────────────────────────────────────────────
  participants: {
    title:        'Participantes',
    add:          'Adicionar',
    cancel:       'Cancelar',
    noParticipants: 'Nenhum participante ainda',
    searchPlaceholder: 'Buscar por código, nome, grupo…',
    noMatches:    'Nenhum resultado para "{{query}}"',
    added:        'Adicionado em {{date}}',
    scoredN:      '{{n}} pontuados',
    sort: {
      added:      'Adicionado',
      alpha:      'A–Z',
      completion: '% Concluído',
    },
    selectOrAdd:  'Selecione um participante\nou adicione um novo',
    ofScored:     '{{scored}} de {{total}} pontuados',
    // Detail panel
    results:      'RESULTADOS',
    scoreNow:     'PONTUAR AGORA',
    redo:         'Refazer',
    start:        'Iniciar',
    items:        '{{n}} itens',
    // Add / Edit form
    newParticipant: 'Novo Participante',
    newParticipantSub: 'Preencha pelo menos um código para continuar',
    saveChanges:  'Salvar alterações',
    saving:       'Salvando…',
    adding:       'Adicionando…',
    addParticipant: 'Adicionar Participante',
    deleteConfirm: 'Remover "{{name}}" e todas as pontuações? Essa ação não pode ser desfeita.',
    // Form sections
    sectionIdentity:     'Identidade',
    sectionDemographics: 'Dados demográficos',
    sectionStudy:        'Estudo',
    sectionClinical:     'Clínico',
    sectionCustom:       'Campos personalizados',
    sectionNotes:        'Notas',
    // Form fields
    fieldCode:       'Código do participante',
    fieldCodePh:     'ex.: P001',
    fieldName:       'Nome',
    fieldNamePh:     'Nome completo (opcional)',
    fieldAge:        'Idade',
    fieldAgePh:      'ex.: 34',
    fieldSex:        'Sexo',
    fieldBmi:        'IMC',
    fieldBmiPh:      'ex.: 24,5',
    fieldGroup:      'Grupo / Condição',
    fieldGroupPh:    'ex.: Controle, Tratamento A',
    fieldSite:       'Local',
    fieldSitePh:     'ex.: São Paulo',
    fieldSession:    'Sessão',
    fieldSessionPh:  'ex.: Linha de base, Semana 4',
    fieldDiagnosis:  'Diagnóstico',
    fieldDiagnosisPh:'ex.: Transtorno de insônia',
    fieldMedication: 'Medicação',
    fieldMedicationPh:'ex.: Nenhuma',
    fieldReferral:   'Encaminhamento',
    fieldReferralPh: 'ex.: Clínico geral, autorresferenciado',
    fieldNotePh:     'Quaisquer notas adicionais…',
    fieldLabel:      'Rótulo',
    fieldValue:      'Valor',
    addField:        'Adicionar campo',
    sexOptions: {
      male:         'Masculino',
      female:       'Feminino',
      nonBinary:    'Não-binário',
      preferNot:    'Prefiro não dizer',
    },
  },

  // ── Questionnaires ─────────────────────────────────────────────────────────
  questionnaires: {
    title:       'Questionários',
    builtIn:     'Integrado',
    custom:      'Personalizado',
    byDomain:    'Por domínio',
    importJSON:  'Importar JSON',
    import:      'Importar',
    disableAll:  'Desativar todos',
    enableAll:   'Ativar todos',
    selectDetail: 'Selecione um questionário para ver os detalhes',
    // Detail panel sections
    whatItMeasures:   'O QUE MEDE',
    items:            'Itens',
    format:           'Formato',
    maxScore:         'Pontuação máxima',
    instructions:     'INSTRUÇÕES',
    scoringMethod:    'MÉTODO DE PONTUAÇÃO',
    interpretation:   'INTERPRETAÇÃO DA PONTUAÇÃO',
    languages:        'IDIOMAS VALIDADOS',
    reference:        'REFERÊNCIA',
    credit:           'CRÉDITO',
    copyright:        'DIREITOS AUTORAIS',
    // Delete
    removeTitle:      'Remover questionário',
    removeBody:       'Remover "{{title}}"? As pontuações já coletadas não serão afetadas.',
    removeCancel:     'Cancelar',
    removeConfirm:    'Remover',
    // Import errors
    importInvalid:    'O JSON deve conter no mínimo: id, title, items[].',
    importFailed:     'Falha na importação',
    importedTitle:    'Importado!',
    importedBody:     '"{{title}}" adicionado à sua biblioteca.',
    // Item type labels
    itemTypes: {
      scale_0_3:    'escala 0–3',
      scale_0_4:    'escala 0–4',
      scale_0_10:   'escala 0–10',
      scale_1_10:   'escala 1–10',
      single_choice:'escolha única',
      yes_no:       'sim / não',
      frequency_3:  'frequência',
      frequency_4:  'frequência',
      time:         'horário (HH:MM)',
      duration_min: 'duração (min)',
      number:       'número',
    },
    importHint: 'Importe questionários personalizados como arquivos JSON seguindo o mesmo esquema dos integrados.',
  },

  // ── Questionnaire runner ───────────────────────────────────────────────────
  runner: {
    back:            'Voltar',
    next:            'Próximo',
    finish:          'Finalizar',
    done:            'Concluído',
    yes:             'Sim',
    no:              'Não',
    itemOf:          'Item {{current}} de {{total}}',
    holdHint:        'segure para ±1 min',
    stronglyDisagree:'Discordo totalmente',
    stronglyAgree:   'Concordo totalmente',
    interpretation:  'Interpretação',
  },

  // ── Export ─────────────────────────────────────────────────────────────────
  export: {
    title:            'Exportar Dados',
    participants_one:   '{{count}} participante',
    participants_other: '{{count}} participantes',
    scores_one:         '{{count}} pontuação',
    scores_other:       '{{count}} pontuações',
    stats: {
      participants: 'Participantes',
      scored:       'Pontuados',
      totalScores:  'Total de pontuações',
    },
    exportLabel:    'EXPORTAR',
    csv:            'Exportar como CSV',
    csvExporting:   'Exportando…',
    csvSub:         'Somente pontuações · uma linha por participante',
    json:           'Exportar como JSON',
    jsonExporting:  'Exportando…',
    jsonSub:        'Respostas completas por item + metadados',
    preview:        'PRÉVIA',
    noDataTitle:    'Sem dados ainda',
    noDataSub:      'Adicione participantes e complete questionários para exportar resultados.',
    nothingToExport:'Nada para exportar',
    nothingToExportSub: 'Adicione e pontue alguns participantes primeiro.',
    failed:         'Falha na exportação',
    shareDialog:    'Exportar dados do ScoreMe',
    saved:          'Salvo',
  },

  // ── Analytics ──────────────────────────────────────────────────────────────
  analytics: {
    title:      'Análises',
    comingSoon: 'Em breve',
  },

  // ── Onboarding ─────────────────────────────────────────────────────────────
  onboarding: {
    getStarted: 'Começar',
    next:       'Próximo',
    back:       'Voltar',
  },

  // ── Common ─────────────────────────────────────────────────────────────────
  common: {
    ok:     'OK',
    cancel: 'Cancelar',
    delete: 'Excluir',
    close:  'Fechar',
  },
};

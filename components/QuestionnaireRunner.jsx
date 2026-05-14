/**
 * components/QuestionnaireRunner.jsx
 *
 * Full-screen questionnaire runner. Identical UX to SleepDiaries
 * QuestionnaireModal but designed as a pushed screen (not a modal).
 *
 * Props:
 *   questionnaire   {object}  — from data/questionnaires.js
 *   onComplete      {function(answers, score)} — called on finish
 *   onBack          {function} — called on back/close
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Pressable, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, SIZES, COLOURS } from '../theme/typography';
import t from '../i18n';

const C = {
  primary:      COLOURS.primary,
  primaryLight: COLOURS.primaryLight,
  progressFill: COLOURS.primary,
};

const pad = (n) => String(n).padStart(2, '0');

// ─── Option list ───────────────────────────────────────────────────────────────
const OptionListInput = ({ value, onChange, options }) => (
  <View style={s.scaleCol}>
    {options.map((opt) => {
      const sel = value === opt.value;
      return (
        <TouchableOpacity
          key={opt.value}
          style={[s.scaleBtn, sel && { backgroundColor: C.primary, shadowColor: 'rgba(74,123,181,0.35)', shadowRadius: 12, elevation: 5 }]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.8}
        >
          {'value' in opt && typeof opt.value === 'number' && opt.value <= 10 && (
            <Text style={[s.scaleBtnValue, { color: sel ? '#fff' : C.primary }]}>{opt.value}</Text>
          )}
          <Text style={[s.scaleBtnLabel, { color: sel ? '#fff' : C.primary }]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── 0-10 slider-style ─────────────────────────────────────────────────────────
const Scale010Input = ({ value, onChange }) => {
  const cur = value ?? 5;
  return (
    <View style={s.scale010Container}>
      <View style={s.scale010Row}>
        {Array.from({ length: 11 }, (_, i) => {
          const sel = cur === i;
          return (
            <TouchableOpacity key={i} style={[s.scale010Btn, sel && { backgroundColor: C.primary, shadowColor: 'rgba(74,123,181,0.35)', shadowRadius: 10, elevation: 5 }]} onPress={() => onChange(i)} activeOpacity={0.7}>
              <Text style={[s.scale010BtnText, { color: sel ? '#fff' : C.primary }]}>{i}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={s.scale010Labels}>
        <Text style={s.scale010Anchor}>{t('runner.stronglyDisagree')}</Text>
        <Text style={s.scale010Anchor}>{t('runner.stronglyAgree')}</Text>
      </View>
    </View>
  );
};

// ─── Yes/No ───────────────────────────────────────────────────────────────────
const YesNoInput = ({ value, onChange }) => (
  <View style={s.yesNoRow}>
    {['yes', 'no'].map((opt) => {
      const sel = value === opt;
      return (
        <TouchableOpacity key={opt}
          style={[s.yesNoBtn, sel && { backgroundColor: C.primary, shadowColor: 'rgba(74,123,181,0.35)', shadowRadius: 12, elevation: 5 }]}
          onPress={() => onChange(opt)} activeOpacity={0.8}>
          <Text style={[s.yesNoText, { color: sel ? '#fff' : C.primary }]}>{opt === 'yes' ? t('runner.yes') : t('runner.no')}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Time stepper ─────────────────────────────────────────────────────────────
const TimeInput = ({ value, onChange }) => {
  const { hour, minute } = value ?? { hour: 23, minute: 0 };
  const intervalRef = useRef(null);
  const valueRef    = useRef(value ?? { hour: 23, minute: 0 });
  useEffect(() => { valueRef.current = value ?? { hour: 23, minute: 0 }; }, [value]);

  const adjust = useCallback((field, delta) => {
    const p = valueRef.current;
    if (field === 'hour')   onChange({ ...p, hour:   (p.hour   + delta + 24) % 24 });
    if (field === 'minute') onChange({ ...p, minute: (p.minute + delta + 60) % 60 });
  }, [onChange]);

  const startLong = useCallback((field, delta) => {
    adjust(field, delta);
    intervalRef.current = setInterval(() => adjust(field, delta), 150);
  }, [adjust]);
  const stopLong = useCallback(() => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }, []);
  useEffect(() => () => stopLong(), []);

  return (
    <View style={s.stepperWrapper}>
      <View style={s.timeRow}>
        {[['hour', 1, 1], ['minute', 5, 1]].map(([field, tapDelta, holdDelta], i) => (
          <React.Fragment key={field}>
            {i === 1 && <Text style={[s.timeSep, { color: C.primary }]}>:</Text>}
            <View style={s.stepperCol}>
              <Pressable style={[s.stepBtn, { backgroundColor: C.primaryLight }]}
                onPress={() => adjust(field, tapDelta)}
                onLongPress={() => startLong(field, holdDelta)}
                onPressOut={stopLong} delayLongPress={300}>
                <Ionicons name="caret-up" size={20} color={C.primary} />
              </Pressable>
              <Text style={[s.stepValue, { color: C.primary }]}>{pad(field === 'hour' ? hour : minute)}</Text>
              <Pressable style={[s.stepBtn, { backgroundColor: C.primaryLight }]}
                onPress={() => adjust(field, -tapDelta)}
                onLongPress={() => startLong(field, -holdDelta)}
                onPressOut={stopLong} delayLongPress={300}>
                <Ionicons name="caret-down" size={20} color={C.primary} />
              </Pressable>
            </View>
          </React.Fragment>
        ))}
      </View>
      <Text style={[s.stepHint, { color: C.primary }]}>{t('runner.holdHint')}</Text>
    </View>
  );
};

// ─── Number/Duration stepper ──────────────────────────────────────────────────
const NumberInput = ({ value, onChange, min = 0, max = 99, unit = '' }) => {
  const v = value ?? min;
  const intervalRef = useRef(null);
  const valueRef    = useRef(v);
  useEffect(() => { valueRef.current = value ?? min; }, [value]);
  const adjust = useCallback((delta) => { const next = Math.min(Math.max(valueRef.current + delta, min), max); onChange(next); }, [onChange, min, max]);
  const startLong = useCallback((delta) => { adjust(delta); intervalRef.current = setInterval(() => adjust(delta), 150); }, [adjust]);
  const stopLong  = useCallback(() => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }, []);
  useEffect(() => () => stopLong(), []);
  return (
    <View style={s.numberRow}>
      <Pressable style={s.numBtn} onPress={() => adjust(-1)} onLongPress={() => startLong(-1)} onPressOut={stopLong} delayLongPress={300}>
        <Ionicons name="remove" size={24} color={C.primary} />
      </Pressable>
      <Text style={[s.numValue, { color: C.primary }]}>{v}</Text>
      <Pressable style={s.numBtn} onPress={() => adjust(1)} onLongPress={() => startLong(1)} onPressOut={stopLong} delayLongPress={300}>
        <Ionicons name="add" size={24} color={C.primary} />
      </Pressable>
      {!!unit && <Text style={[s.numUnit, { color: C.primary }]}>{unit}</Text>}
    </View>
  );
};

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ current, total }) => (
  <View style={s.progressRow}>
    <View style={s.progressIcon}>
      <Ionicons name="document-text-outline" size={20} color={C.primary} />
    </View>
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${(current / total) * 100}%` }]} />
    </View>
    <Text style={s.progressLabel}>{current}/{total}</Text>
  </View>
);

// ─── Result screen ────────────────────────────────────────────────────────────
const ResultScreen = ({ questionnaire, score, onClose }) => {
  const insets = useSafeAreaInsets();
  const interpretation = questionnaire.interpret(score);
  let scoreDisplay = '', scoreMax = '';
  if (typeof score === 'object' && score !== null) {
    if (score.msf_sc !== undefined) {
      const h = Math.floor(score.msf_sc); const m = Math.round((score.msf_sc % 1) * 60);
      scoreDisplay = `${pad(h)}:${pad(m)}`; scoreMax = 'MSFsc';
    } else scoreDisplay = JSON.stringify(score);
  } else {
    scoreDisplay = String(score);
    scoreMax = questionnaire.maxScore != null ? `/ ${questionnaire.maxScore}` : '';
  }

  return (
    <ScrollView
      contentContainerStyle={[s.resultScroll, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Score badge */}
      <View style={[s.resultBadgeWrap, { backgroundColor: interpretation.color + '0C', shadowColor: interpretation.color, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 20, elevation: 6 }]}>
        <View style={[s.resultScoreRow]}>
          <Text style={[s.resultScoreNum, { color: interpretation.color }]}>{scoreDisplay}</Text>
          {!!scoreMax && <Text style={[s.resultScoreMax, { color: interpretation.color }]}>{scoreMax}</Text>}
        </View>
        <Text style={[s.resultLabel, { color: interpretation.color }]}>{interpretation.label}</Text>
      </View>

      {/* Interpretation card */}
      <View style={s.resultCard}>
        <View style={s.resultCardHeader}>
          <Ionicons name="checkmark-circle" size={18} color={interpretation.color} />
          <Text style={[s.resultCardTitle, { color: interpretation.color }]}>{t('runner.interpretation')}</Text>
        </View>
        <Text style={s.resultDesc}>{interpretation.description}</Text>
      </View>

      {/* Meta */}
      <View style={s.resultCard}>
        <View style={s.resultCardHeader}>
          <Ionicons name="clipboard-outline" size={18} color={COLOURS.primary} />
          <Text style={[s.resultCardTitle, { color: COLOURS.primaryDark }]}>{questionnaire.title}</Text>
        </View>
        {questionnaire.construct && (
          <Text style={s.resultMeta}>{questionnaire.construct}</Text>
        )}
        {questionnaire.reference && (
          <Text style={s.resultRef}>{questionnaire.reference}</Text>
        )}
      </View>

      {/* Done button */}
      <TouchableOpacity style={s.doneBtn} onPress={onClose} activeOpacity={0.85}>
        <Ionicons name="checkmark" size={20} color="#fff" />
        <Text style={s.doneBtnText}>{t('runner.done')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Build initial answers ────────────────────────────────────────────────────
const buildInitialAnswers = (items) => {
  const a = {};
  for (const item of items) {
    switch (item.type) {
      case 'time':         a[item.id] = item.defaultValue ?? { hour: 23, minute: 0 }; break;
      case 'duration_min': a[item.id] = item.defaultValue ?? 0; break;
      case 'number':       a[item.id] = item.defaultValue ?? (item.min ?? 0); break;
      case 'scale_0_10':   a[item.id] = item.defaultValue ?? 5; break;
      default:             a[item.id] = null; break;
    }
  }
  return a;
};

const isAnswered = (item, value) => {
  if (item.type === 'time' || item.type === 'duration_min' || item.type === 'number' || item.type === 'scale_0_10') return value !== null && value !== undefined;
  if (item.type === 'yes_no') return value === 'yes' || value === 'no';
  return value !== null && value !== undefined;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function QuestionnaireRunner({ questionnaire, onComplete, onBack }) {
  const insets = useSafeAreaInsets();
  const [answers, setAnswers]           = useState(() => buildInitialAnswers(questionnaire?.items ?? []));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult]             = useState(null);

  useEffect(() => {
    setAnswers(buildInitialAnswers(questionnaire?.items ?? []));
    setCurrentIndex(0);
    setResult(null);
  }, [questionnaire]);

  const items = questionnaire?.items ?? [];
  const total = items.length;
  const item  = items[currentIndex];
  const currentValue = answers[item?.id];
  const canProceed   = item ? isAnswered(item, currentValue) : false;

  const handleNext = async () => {
    if (!canProceed) return;
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      const score = questionnaire.score(answers);
      setResult({ score });
    }
  };

  const handleDone = () => {
    if (result) onComplete(answers, result.score);
  };

  const setAnswer = (id, val) => setAnswers((prev) => ({ ...prev, [id]: val }));

  if (!questionnaire) return null;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.closeBtn}>
          <Ionicons name="close" size={26} color={COLOURS.primaryDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{questionnaire.shortTitle}</Text>
        <View style={{ width: 34 }} />
      </View>

      {result ? (
        <ResultScreen questionnaire={questionnaire} score={result.score} onClose={handleDone} />
      ) : (
        <>
          <ProgressBar current={currentIndex + 1} total={total} />
          <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
            {currentIndex === 0 && (
              <View style={s.instructionsBox}>
                <Text style={s.instructionsText}>{questionnaire.instructions}</Text>
              </View>
            )}
            <Text style={s.itemNumber}>{t('runner.itemOf', { current: item?.number, total })}</Text>
            <Text style={s.itemText}>{item?.text}</Text>
            {item?.hint && (
              <View style={s.hintBox}>
                <Ionicons name="information-circle-outline" size={16} color={C.primary} />
                <Text style={s.hintText}>{item.hint}</Text>
              </View>
            )}
            <View style={s.inputArea}>
              {['scale_0_3','scale_0_4','scale_1_10','single_choice','frequency_3','frequency_4'].includes(item?.type) && (
                <OptionListInput value={currentValue} onChange={(v) => setAnswer(item.id, v)} options={item.options} />
              )}
              {item?.type === 'scale_0_10' && (
                <Scale010Input value={currentValue} onChange={(v) => setAnswer(item.id, v)} />
              )}
              {item?.type === 'yes_no' && (
                <YesNoInput value={currentValue} onChange={(v) => setAnswer(item.id, v)} />
              )}
              {item?.type === 'time' && (
                <TimeInput value={currentValue} onChange={(v) => setAnswer(item.id, v)} />
              )}
              {(item?.type === 'duration_min' || item?.type === 'number') && (
                <NumberInput value={currentValue} onChange={(v) => setAnswer(item.id, v)} min={item.min} max={item.max} unit={item.unit} />
              )}
            </View>
          </ScrollView>

          <View style={[s.navRow, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={s.backBtn} onPress={() => currentIndex > 0 ? setCurrentIndex((i) => i - 1) : onBack()}>
              <Ionicons name="chevron-back" size={22} color={C.primary} />
              <Text style={s.backBtnText}>{t('runner.back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.nextBtn, !canProceed && s.nextBtnDisabled, { backgroundColor: C.primary }]}
              onPress={handleNext} disabled={!canProceed}>
              <Text style={s.nextBtnText}>{currentIndex < total - 1 ? t('runner.next') : t('runner.finish')}</Text>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  closeBtn: { padding: 4 },

  progressRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  progressIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  progressTrack: { flex: 1, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.72)', overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  progressFill:  { height: '100%', borderRadius: 14, backgroundColor: C.progressFill },
  progressLabel: { fontSize: 16, fontFamily: FONTS.heading, color: C.primary, minWidth: 40, textAlign: 'right' },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  instructionsBox: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 8, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  instructionsText: { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, lineHeight: 24 },
  itemNumber: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', marginTop: 20, marginBottom: 6 },
  itemText:   { fontSize: 20, fontFamily: FONTS.heading, color: C.primary, lineHeight: 28, marginBottom: 12 },
  hintBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 10, padding: 12, marginBottom: 16 },
  hintText:   { flex: 1, fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: C.primary, lineHeight: 22 },
  inputArea:  { alignItems: 'stretch' },

  scaleCol:       { gap: 10 },
  scaleBtn:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.72)', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  scaleBtnValue:  { fontSize: 20, fontFamily: FONTS.heading, minWidth: 26, textAlign: 'center' },
  scaleBtnLabel:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, flex: 1 },

  scale010Container: { width: '100%', gap: 10 },
  scale010Row:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  scale010Btn:       { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  scale010BtnText:   { fontSize: 17, fontFamily: FONTS.heading },
  scale010Labels:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  scale010Anchor:    { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },

  yesNoRow: { flexDirection: 'row', gap: 20, marginTop: 8, justifyContent: 'center' },
  yesNoBtn: { width: 130, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  yesNoText: { fontSize: 20, fontFamily: FONTS.body },

  stepperWrapper: { alignItems: 'center', gap: 10 },
  stepHint:   { fontSize: 12, fontFamily: FONTS.bodyMedium, opacity: 0.5 },
  timeRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  stepperCol: { alignItems: 'center', gap: 12 },
  stepBtn:    { width: 52, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stepValue:  { fontSize: 40, fontFamily: FONTS.heading, minWidth: 52, textAlign: 'center' },
  timeSep:    { fontSize: 40, fontFamily: FONTS.heading, marginTop: -12 },

  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 20, justifyContent: 'center' },
  numBtn:    { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.72)', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  numValue:  { fontSize: 48, fontFamily: FONTS.heading, minWidth: 60, textAlign: 'center' },
  numUnit:   { fontSize: 16, fontFamily: FONTS.bodyMedium, marginLeft: 4 },

  navRow:          { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  backBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 14, paddingVertical: 14, gap: 4, backgroundColor: 'rgba(255,255,255,0.72)', shadowColor: 'rgba(74,123,181,0.15)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  backBtnText:     { fontSize: SIZES.body, fontFamily: FONTS.body, color: C.primary },
  nextBtn:         { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 14, gap: 4, shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5 },
  nextBtnDisabled: { opacity: 0.35 },
  nextBtnText:     { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },

  resultScroll:      { padding: 24, gap: 16 },
  resultBadgeWrap:    { borderRadius: 20, padding: 28, alignItems: 'center', gap: 8 },
  resultScoreRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  resultScoreNum:     { fontSize: 64, fontFamily: FONTS.heading, lineHeight: 72 },
  resultScoreMax:     { fontSize: 22, fontFamily: FONTS.bodyMedium },
  resultLabel:        { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading },
  resultCard:         { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 16, padding: 16, gap: 8, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2 },
  resultCardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultCardTitle:    { fontSize: SIZES.body, fontFamily: FONTS.body },
  resultDesc:         { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 24 },
  resultMeta:         { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primary },
  resultRef:          { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, lineHeight: 18, marginTop: 2 },
  doneBtn:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLOURS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignSelf: 'stretch', shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5 },
  doneBtnText:        { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

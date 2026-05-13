/**
 * app/(tabs)/questionnaires.jsx — Questionnaire library
 *
 * Desktop: music-log split pattern.
 *   Left  — selectable list of questionnaires
 *   Right — detail panel: what it measures, scoring, scale, reference
 * Mobile/tablet: ScreenBackground + compact cards
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';

import ScreenBackground from '../../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../../theme/responsive';
import { QUESTIONNAIRES, compileQuestionnaire } from '../../data/questionnaires';
import { loadCustomQuestionnaires, saveCustomQuestionnaire, deleteCustomQuestionnaire, loadDisabledQs, setQDisabled } from '../../storage/storage';

async function importJSON(onDone) {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled) return;
    const response = await fetch(result.assets[0].uri);
    const parsed   = JSON.parse(await response.text());
    if (!parsed.id || !parsed.title || !Array.isArray(parsed.items)) {
      Alert.alert('Invalid questionnaire', 'The JSON must have at minimum: id, title, items[].');
      return;
    }
    compileQuestionnaire(parsed); // build score() and interpret() from declarative fields
    await saveCustomQuestionnaire(parsed);
    onDone();
    Alert.alert('Imported!', `"${parsed.title}" added to your library.`);
  } catch (e) {
    Alert.alert('Import failed', e.message);
  }
}

// Get score bands — prefer declarative scoreBands, fall back to probing interpret()
function getScoreBands(q) {
  // Use declarative bands if available (sorted correctly for display)
  if (Array.isArray(q.scoreBands) && q.scoreBands.length > 0) {
    return q.scoreBandDirection === 'desc'
      ? [...q.scoreBands].sort((a, b) => b.min - a.min) // highest first for desc scales
      : [...q.scoreBands].sort((a, b) => a.min - b.min);
  }
  // Fall back: probe interpret() for imported questionnaires without declarative bands
  if (!q.interpret || typeof q.maxScore !== 'number') return null;
  const bands = [];
  const seen  = new Set();
  for (let s = 0; s <= q.maxScore; s++) {
    try {
      const r = q.interpret(s);
      if (!seen.has(r.label)) { seen.add(r.label); bands.push({ ...r, min: s }); }
    } catch { /* skip */ }
  }
  return bands.map((b, i) => ({ ...b, max: i < bands.length - 1 ? bands[i + 1].min - 1 : q.maxScore }));
}

// Infer item type label
function typeLabel(type) {
  switch (type) {
    case 'scale_0_3':    return '0–3 scale';
    case 'scale_0_4':    return '0–4 scale';
    case 'scale_0_10':   return '0–10 scale';
    case 'scale_1_10':   return '1–10 scale';
    case 'single_choice':return 'single choice';
    case 'yes_no':       return 'yes / no';
    case 'frequency_3':  return 'frequency';
    case 'frequency_4':  return 'frequency';
    case 'time':         return 'time (HH:MM)';
    case 'duration_min': return 'duration (min)';
    case 'number':       return 'number';
    default:             return type;
  }
}

// Unique item types used in the questionnaire
function itemTypes(items) {
  return [...new Set(items.map(i => typeLabel(i.type)))].join(', ');
}

// ─── Custom pill toggle ──────────────────────────────────────────────────────
function Toggle({ value, onValueChange }) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  React.useEffect(() => {
    // Snap immediately on mount, animate on subsequent changes
    anim.setValue(value ? 1 : 0);
  }, []);
  React.useEffect(() => {
    Animated.spring(anim, { toValue: value ? 1 : 0, useNativeDriver: false, speed: 40, bounciness: 4 }).start();
  }, [value]);
  const trackBg   = anim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(148,163,184,0.25)', COLOURS.primary] });
  const thumbLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 18] });
  return (
    <TouchableOpacity onPress={() => onValueChange(!value)} activeOpacity={0.85} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Animated.View style={[tog.track, { backgroundColor: trackBg, borderColor: value ? COLOURS.primary : 'rgba(148,163,184,0.35)' }]}>
        <Animated.View style={[tog.thumb, { left: thumbLeft, backgroundColor: value ? '#fff' : 'rgba(148,163,184,0.7)' }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}
const tog = StyleSheet.create({
  track: { width: 36, height: 20, borderRadius: 10, borderWidth: 1, justifyContent: 'center' },
  thumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, shadowColor: 'rgba(0,0,0,0.18)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 2 },
});

// ─── Desktop: questionnaire row ───────────────────────────────────────────────
function QRow({ q, selected, onPress, onDelete, disabled, onToggle }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={selected ? 52 : 36} tint="light"
        style={{ overflow: 'hidden', borderBottomWidth: 0 }}>
        <View style={[qr.row, selected && qr.rowSelected, disabled && qr.rowDisabled]}>
          <View style={[qr.iconWrap, selected && qr.iconWrapSelected, disabled && qr.iconWrapDisabled]}>
            <Ionicons name="clipboard-outline" size={17} color={selected ? '#fff' : disabled ? COLOURS.textMuted : COLOURS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={[qr.title, selected && { color: COLOURS.primary }, disabled && { color: COLOURS.textMuted }]}>{q.title}</Text>
              {q.beta && <View style={qr.betaChip}><Text style={qr.betaText}>BETA</Text></View>}
            </View>
            <Text style={[qr.meta, disabled && { color: COLOURS.textMuted }]}>{q.shortTitle} · {q.items?.length ?? '?'} items{q.domain ? ` · ${q.domain}` : ''}</Text>
          </View>
          <Toggle value={!disabled} onValueChange={(val) => onToggle(!val)} />
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={qr.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}
const qr = StyleSheet.create({
  row:             { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: 'rgba(255,255,255,0.48)', borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.07)' },
  rowSelected:     { backgroundColor: 'rgba(255,255,255,0.72)' },
  iconWrap:        { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  iconWrapSelected:{ backgroundColor: COLOURS.primary },
  title:           { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  meta:            { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, marginTop: 2 },
  betaChip:        { backgroundColor: COLOURS.purpleBg, borderWidth: 1, borderColor: COLOURS.purpleLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  betaText:        { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.purple },
  rowDisabled:     { opacity: 0.5 },
  iconWrapDisabled:{ backgroundColor: 'rgba(148,163,184,0.15)' },
  deleteBtn:       { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center' },
});

// ─── Desktop: right panel detail ─────────────────────────────────────────────
function DetailPanel({ q }) {
  if (!q) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Ionicons name="clipboard-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.35 }} />
      <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, opacity: 0.5 }}>
        Select a questionnaire to view details
      </Text>
    </View>
  );

  const bands = getScoreBands(q);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 28, paddingBottom: 48, gap: 20 }}>

      {/* Header */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark, flex: 1 }}>{q.title}</Text>
          {q.beta && <View style={qr.betaChip}><Text style={qr.betaText}>BETA</Text></View>}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>{q.shortTitle}</Text>
          {q.version && q.version !== q.shortTitle && (
            <View style={{ backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>{q.version}</Text>
            </View>
          )}
          {q.timeframe && (
            <View style={{ backgroundColor: 'rgba(224,122,32,0.10)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.accent }}>{q.timeframe}</Text>
            </View>
          )}
          {q.domain && (
            <View style={{ backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>{q.domain}</Text>
            </View>
          )}
        </View>
      </View>

      {/* What it measures */}
      {q.construct && (
        <>
          <Text style={dp.sectionLabel}>WHAT IT MEASURES</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={dp.cardInner}>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark, marginBottom: 6 }}>{q.construct}</Text>
              {q.constructDescription && (
                <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 24 }}>{q.constructDescription}</Text>
              )}
            </View>
          </BlurView>
        </>
      )}

      {/* Quick stats */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { icon: 'list-outline',   label: 'Items',     value: String(q.items?.length ?? '?') },
          { icon: 'shapes-outline', label: 'Format',    value: itemTypes(q.items ?? []) },
          ...(typeof q.maxScore === 'number' ? [{ icon: 'bar-chart-outline', label: 'Max score', value: String(q.maxScore) }] : []),
        ].map(({ icon, label, value }) => (
          <BlurView key={label} intensity={36} tint="light" style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.50)', padding: 12, gap: 4, alignItems: 'center' }}>
              <Ionicons name={icon} size={18} color={COLOURS.primary} />
              <Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.heading, color: COLOURS.primaryDark, textAlign: 'center' }}>{value}</Text>
            </View>
          </BlurView>
        ))}
      </View>

      {/* Instructions */}
      {q.instructions && (
        <>
          <Text style={dp.sectionLabel}>INSTRUCTIONS</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={dp.cardInner}>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, lineHeight: 26 }}>{q.instructions}</Text>
            </View>
          </BlurView>
        </>
      )}

      {/* Scoring note */}
      {q.scoringNote && (
        <>
          <Text style={dp.sectionLabel}>SCORING METHOD</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={dp.cardInner}>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 24 }}>{q.scoringNote}</Text>
            </View>
          </BlurView>
        </>
      )}

      {/* Score bands */}
      {bands && bands.length > 0 && (
        <>
          <Text style={dp.sectionLabel}>SCORE INTERPRETATION</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={dp.cardInner}>
              {bands.map((b, i) => (
                <View key={b.label} style={[dp.bandRow, i < bands.length - 1 && dp.bandDivider]}>
                  <View style={[dp.bandDot, { backgroundColor: b.color }]} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>{b.label}</Text>
                      <View style={{ backgroundColor: b.color + '18', borderWidth: 1, borderColor: b.color, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: b.color }}>{b.min}–{b.max}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 20 }}>{b.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </BlurView>
        </>
      )}

      {/* Languages */}
      {q.languages && q.languages.length > 0 && (
        <>
          <Text style={dp.sectionLabel}>VALIDATED LANGUAGES</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={[dp.cardInner, { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }]}>
              {q.languages.map(lang => (
                <View key={lang} style={{ backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark }}>{lang}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </>
      )}

      {/* Reference */}
      {q.reference && (
        <>
          <Text style={dp.sectionLabel}>REFERENCE</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={dp.cardInner}>
              <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 22 }}>{q.reference}</Text>
            </View>
          </BlurView>
        </>
      )}

      {/* Credit */}
      {q.credit && q.credit !== q.reference && (
        <>
          <Text style={dp.sectionLabel}>CREDIT</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={dp.cardInner}>
              <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 22 }}>{q.credit}</Text>
            </View>
          </BlurView>
        </>
      )}

      {/* Copyright */}
      {q.copyright && (
        <>
          <Text style={dp.sectionLabel}>COPYRIGHT</Text>
          <BlurView intensity={36} tint="light" style={dp.card}>
            <View style={dp.cardInner}>
              <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 22 }}>{q.copyright}</Text>
            </View>
          </BlurView>
        </>
      )}

    </ScrollView>
  );
}
const dp = StyleSheet.create({
  sectionLabel: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  card:         { borderRadius: 14, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2 },
  cardInner:    { backgroundColor: 'rgba(255,255,255,0.52)', padding: 16, gap: 0 },
  bandRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  bandDivider:  { borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.07)' },
  bandDot:      { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
});

// ─── Mobile row ───────────────────────────────────────────────────────────────
function MobileQRow({ q, isLast, onDelete, disabled, onToggle }) {
  return (
    <View>
      <View style={[mr.row]}>
        <View style={[mr.iconWrap, disabled && { backgroundColor: 'rgba(148,163,184,0.15)' }]}>
          <Ionicons name="clipboard-outline" size={17} color={disabled ? COLOURS.textMuted : COLOURS.primary} />
        </View>
        <View style={{ flex: 1, opacity: disabled ? 0.5 : 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={[mr.title, disabled && { color: COLOURS.textMuted }]}>{q.title}</Text>
            {q.beta && <View style={qr.betaChip}><Text style={qr.betaText}>BETA</Text></View>}
          </View>
          <Text style={[mr.meta, disabled && { color: COLOURS.textMuted }]}>{q.shortTitle} · {q.items?.length ?? '?'} items</Text>
        </View>
          <Toggle value={!disabled} onValueChange={(val) => onToggle(!val)} />
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={qr.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
            </TouchableOpacity>
          )}
      </View>
      {!isLast && <View style={{ height: 1, backgroundColor: 'rgba(74,123,181,0.07)', marginHorizontal: 14 }} />}
    </View>
  );
}
const mr = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconWrap: { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  meta:     { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, marginTop: 2 },
  lockBadge:{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(74,123,181,0.06)', alignItems: 'center', justifyContent: 'center' },
});

// ─── Section header with toggle-all ──────────────────────────────────────────
function SectionHeader({ label, qs, disabledQs, onToggleAll }) {
  const allOn = qs.every(q => !disabledQs.has(q.id));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {label} ({qs.length})
      </Text>
      {/* Plain View — no outer TouchableOpacity; only the Toggle itself is tappable */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>
          {allOn ? 'Disable all' : 'Enable all'}
        </Text>
        <Toggle value={allOn} onValueChange={() => onToggleAll(allOn)} />
      </View>
    </View>
  );
}

// ─── Group questionnaires by domain ─────────────────────────────────────────────
function groupByDomain(qs) {
  const map = {};
  for (const q of qs) {
    const key = q.domain ?? 'Other';
    if (!map[key]) map[key] = [];
    map[key].push(q);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function QuestionnairesScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const [customQs,     setCustomQs]     = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [disabledQs,   setDisabledQs]   = useState(new Set());
  const [byDomain,     setByDomain]     = useState(false);

  const load = useCallback(async () => {
    const [custom, disabled] = await Promise.all([loadCustomQuestionnaires(), loadDisabledQs()]);
    setCustomQs(custom);
    setDisabledQs(disabled);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleToggle = useCallback(async (id, disabled) => {
    await setQDisabled(id, disabled);
    setDisabledQs(prev => { const next = new Set(prev); if (disabled) next.add(id); else next.delete(id); return next; });
  }, []);

  const handleToggleAll = useCallback(async (qs, disable) => {
    await Promise.all(qs.map(q => setQDisabled(q.id, disable)));
    setDisabledQs(prev => {
      const next = new Set(prev);
      qs.forEach(q => disable ? next.add(q.id) : next.delete(q.id));
      return next;
    });
  }, []);

  const handleDelete = (q) => {
    Alert.alert('Remove questionnaire', `Remove "${q.title}"? Scores already collected are not affected.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await deleteCustomQuestionnaire(q.id);
        if (selectedId === q.id) setSelectedId(null);
        load();
      }},
    ]);
  };

  const allQs    = [...QUESTIONNAIRES, ...customQs];
  const selected = allQs.find(q => q.id === selectedId) ?? null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const renderSection = (qs, label, isCustom = false) => (
    <View key={label} style={{ marginBottom: 16 }}>
      <SectionHeader
        label={label}
        qs={qs}
        disabledQs={disabledQs}
        onToggleAll={(disable) => handleToggleAll(qs, disable)}
      />
      <View style={{ borderRadius: 14, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 }}>
        {qs.map(q => (
          <QRow
            key={q.id} q={q}
            selected={selectedId === q.id}
            disabled={disabledQs.has(q.id)}
            onToggle={(val) => handleToggle(q.id, val)}
            onPress={() => setSelectedId(prev => prev === q.id ? null : q.id)}
            onDelete={isCustom ? () => handleDelete(q) : undefined}
          />
        ))}
      </View>
    </View>
  );

  const renderMobileSection = (qs, label, isCustom = false) => (
    <View key={label}>
      <SectionHeader
        label={label}
        qs={qs}
        disabledQs={disabledQs}
        onToggleAll={(disable) => handleToggleAll(qs, disable)}
      />
      <View style={ms.card}>
        {qs.map((q, i) => (
          <MobileQRow key={q.id} q={q} isLast={i === qs.length - 1}
            disabled={disabledQs.has(q.id)}
            onToggle={(val) => handleToggle(q.id, val)}
            onDelete={isCustom ? () => handleDelete(q) : undefined}
          />
        ))}
      </View>
    </View>
  );

  // ── Group by domain mode ───────────────────────────────────────────────────
  const domainGroups     = byDomain ? groupByDomain(allQs) : null;
  const builtInDomains   = byDomain ? groupByDomain(QUESTIONNAIRES) : null;
  const customDomains    = byDomain && customQs.length > 0 ? groupByDomain(customQs) : null;

  // ── Desktop ──────────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={{ flex: 1 }}>
        {/* Glass card — left half */}
        <View style={{
          position: 'absolute', left: 0, right: '50%', top: 12, bottom: 12,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.28)',
          shadowColor: 'rgba(74,123,181,0.12)',
          shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 24, elevation: 2,
        }} />

        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Left col */}
          <View style={{ flex: 1, marginTop: 12, marginBottom: 12, overflow: 'hidden' }}>
            <ScrollView
              contentContainerStyle={{ paddingTop: 24, paddingBottom: 40, paddingLeft: SIDEBAR_TOTAL + 20, paddingRight: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 32, fontFamily: FONTS.heading, color: COLOURS.primaryDark, marginBottom: 12 }}>Questionnaires</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: byDomain ? COLOURS.primary : 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: byDomain ? COLOURS.primary : 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }}
                    onPress={() => setByDomain(v => !v)}
                  >
                    <Ionicons name="albums-outline" size={15} color={byDomain ? '#fff' : COLOURS.primary} />
                    <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: byDomain ? '#fff' : COLOURS.primary }}>By domain</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 }}
                    onPress={() => importJSON(load)}
                  >
                    <Ionicons name="cloud-upload-outline" size={15} color={COLOURS.primary} />
                    <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLOURS.primary }}>Import JSON</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {byDomain
                ? groupByDomain(allQs).map(([domain, qs]) => renderSection(qs, domain, qs.some(q => customQs.find(c => c.id === q.id))))
                : <>
                    {renderSection(QUESTIONNAIRES, `Built-in`)}
                    {customQs.length > 0 && renderSection(customQs, 'Custom', true)}
                  </>
              }
            </ScrollView>
          </View>

          {/* Right col — detail panel */}
          <View style={{ flex: 1, marginTop: 12, marginBottom: 12, marginRight: 12 }}>
            <DetailPanel q={selected} />
          </View>
        </View>
      </View>
    );
  }

  // ── Mobile / tablet ──────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <View style={[ms.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLOURS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 }}>
            <Ionicons name="clipboard" size={20} color="#fff" />
          </View>
          <Text style={ms.title}>Questionnaires</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[ms.importBtn, byDomain && { backgroundColor: COLOURS.primary, borderColor: COLOURS.primary }]}
            onPress={() => setByDomain(v => !v)}
          >
            <Ionicons name="albums-outline" size={16} color={byDomain ? '#fff' : COLOURS.primary} />
            <Text style={[ms.importText, byDomain && { color: '#fff' }]}>By domain</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.importBtn} onPress={() => importJSON(load)}>
            <Ionicons name="cloud-upload-outline" size={16} color={COLOURS.primary} />
            <Text style={ms.importText}>Import</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={[ms.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        {byDomain
          ? groupByDomain(allQs).map(([domain, qs]) => renderMobileSection(qs, domain, qs.some(q => customQs.find(c => c.id === q.id))))
          : <>
              {renderMobileSection(QUESTIONNAIRES, 'Built-in')}
              {customQs.length > 0 && renderMobileSection(customQs, 'Custom', true)}
            </>
        }
        <View style={ms.hint}>
          <Ionicons name="information-circle-outline" size={17} color={COLOURS.primary} />
          <Text style={ms.hintText}>Import custom questionnaires as JSON files following the same schema as the built-ins.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const ms = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title:       { fontSize: SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  importBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  importText:  { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  content:     { paddingHorizontal: 16, gap: 10 },
  sectionLabel:{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  card:        { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, overflow: 'hidden' },
  hint:        { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(74,123,181,0.07)', borderRadius: 12, padding: 14, marginTop: 8 },
  hintText:    { flex: 1, fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, lineHeight: 20 },
});

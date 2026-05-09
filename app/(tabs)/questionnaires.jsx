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
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';

import ScreenBackground from '../../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../../theme/responsive';
import { QUESTIONNAIRES } from '../../data/questionnaires';
import { loadCustomQuestionnaires, saveCustomQuestionnaire, deleteCustomQuestionnaire } from '../../storage/storage';

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
    await saveCustomQuestionnaire(parsed);
    onDone();
    Alert.alert('Imported!', `"${parsed.title}" added to your library.`);
  } catch (e) {
    Alert.alert('Import failed', e.message);
  }
}

// Derive score bands by probing interpret() with sentinel values
function getScoreBands(q) {
  if (!q.interpret || typeof q.maxScore !== 'number') return null;
  const bands = [];
  const seen  = new Set();
  for (let s = 0; s <= q.maxScore; s++) {
    try {
      const r = q.interpret(s);
      const key = r.label;
      if (!seen.has(key)) { seen.add(key); bands.push({ ...r, minScore: s }); }
    } catch { /* skip */ }
  }
  // attach maxScore to each band
  return bands.map((b, i) => ({
    ...b,
    maxScore: i < bands.length - 1 ? bands[i + 1].minScore - 1 : q.maxScore,
  }));
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

// ─── Desktop: questionnaire row ───────────────────────────────────────────────
function QRow({ q, selected, onPress, onDelete }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={selected ? 52 : 36} tint="light"
        style={{ overflow: 'hidden', borderBottomWidth: 0 }}>
        <View style={[qr.row, selected && qr.rowSelected]}>
          <View style={[qr.iconWrap, selected && qr.iconWrapSelected]}>
            <Ionicons name="document-text-outline" size={17} color={selected ? '#fff' : COLOURS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={[qr.title, selected && { color: COLOURS.primary }]}>{q.title}</Text>
              {q.beta && <View style={qr.betaChip}><Text style={qr.betaText}>BETA</Text></View>}
            </View>
            <Text style={qr.meta}>{q.shortTitle} · {q.items?.length ?? '?'} items</Text>
          </View>
          {onDelete ? (
            <TouchableOpacity onPress={onDelete} style={qr.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward" size={15} color={selected ? COLOURS.primary : COLOURS.textMuted} />
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
  deleteBtn:       { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center' },
});

// ─── Desktop: right panel detail ─────────────────────────────────────────────
function DetailPanel({ q }) {
  if (!q) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Ionicons name="document-text-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.35 }} />
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
        <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>{q.shortTitle}</Text>
      </View>

      {/* Quick stats row */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { icon: 'list-outline',          label: 'Items',  value: q.items?.length ?? '?' },
          { icon: 'shapes-outline',        label: 'Format', value: itemTypes(q.items ?? []) },
          ...(typeof q.maxScore === 'number' ? [{ icon: 'bar-chart-outline', label: 'Max score', value: String(q.maxScore) }] : []),
        ].map(({ icon, label, value }) => (
          <BlurView key={label} intensity={36} tint="light" style={{ flex: 1, borderRadius: 12, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.50)', padding: 12, gap: 4, alignItems: 'center' }}>
              <Ionicons name={icon} size={18} color={COLOURS.primary} />
              <Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.heading, color: COLOURS.primaryDark, textAlign: 'center' }}>{value}</Text>
            </View>
          </BlurView>
        ))}
      </View>

      {/* Instructions */}
      {q.instructions ? <>
        <Text style={dp.sectionLabel}>INSTRUCTIONS</Text>
        <BlurView intensity={36} tint="light" style={dp.card}>
          <View style={dp.cardInner}>
            <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, lineHeight: 26 }}>{q.instructions}</Text>
          </View>
        </BlurView>
      </> : null}

      {/* Scoring bands */}
      {bands && bands.length > 0 ? <>
        <Text style={dp.sectionLabel}>SCORING</Text>
        <BlurView intensity={36} tint="light" style={dp.card}>
          <View style={dp.cardInner}>
            {bands.map((b, i) => (
              <View key={b.label} style={[dp.bandRow, i < bands.length - 1 && dp.bandDivider]}>
                <View style={[dp.bandDot, { backgroundColor: b.color }]} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>{b.label}</Text>
                    <View style={{ backgroundColor: b.color + '18', borderWidth: 1, borderColor: b.color, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: b.color }}>{b.minScore}–{b.maxScore}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 20 }}>{b.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </BlurView>
      </> : null}

      {/* Reference */}
      {q.reference ? <>
        <Text style={dp.sectionLabel}>REFERENCE</Text>
        <BlurView intensity={36} tint="light" style={dp.card}>
          <View style={dp.cardInner}>
            <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 22 }}>{q.reference}</Text>
          </View>
        </BlurView>
      </> : null}

      {/* Copyright / credit */}
      {q.credit && q.credit !== q.reference ? <>
        <Text style={dp.sectionLabel}>CREDIT</Text>
        <BlurView intensity={36} tint="light" style={dp.card}>
          <View style={dp.cardInner}>
            <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 22 }}>{q.credit}</Text>
          </View>
        </BlurView>
      </> : null}

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
function MobileQRow({ q, isLast, onDelete }) {
  return (
    <View>
      <View style={[mr.row]}>
        <View style={mr.iconWrap}>
          <Ionicons name="document-text-outline" size={17} color={COLOURS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={mr.title}>{q.title}</Text>
            {q.beta && <View style={qr.betaChip}><Text style={qr.betaText}>BETA</Text></View>}
          </View>
          <Text style={mr.meta}>{q.shortTitle} · {q.items?.length ?? '?'} items</Text>
        </View>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} style={qr.deleteBtn}>
            <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
          </TouchableOpacity>
        ) : (
          <View style={mr.lockBadge}>
            <Ionicons name="lock-closed-outline" size={13} color={COLOURS.textMuted} />
          </View>
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function QuestionnairesScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const [customQs,   setCustomQs]   = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => { setCustomQs(await loadCustomQuestionnaires()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 32, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Questionnaires</Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
                  onPress={() => importJSON(load)}
                >
                  <Ionicons name="cloud-upload-outline" size={17} color={COLOURS.primary} />
                  <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLOURS.primary }}>Import JSON</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                BUILT-IN ({QUESTIONNAIRES.length})
              </Text>
              <View style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 }}>
                {QUESTIONNAIRES.map((q) => (
                  <QRow key={q.id} q={q} selected={selectedId === q.id} onPress={() => setSelectedId(selectedId === q.id ? null : q.id)} />
                ))}
              </View>

              {customQs.length > 0 && <>
                <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                  CUSTOM ({customQs.length})
                </Text>
                <View style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 }}>
                  {customQs.map((q) => (
                    <QRow key={q.id} q={q} selected={selectedId === q.id}
                      onPress={() => setSelectedId(selectedId === q.id ? null : q.id)}
                      onDelete={() => handleDelete(q)} />
                  ))}
                </View>
              </>}
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
        <Text style={ms.title}>Questionnaires</Text>
        <TouchableOpacity style={ms.importBtn} onPress={() => importJSON(load)}>
          <Ionicons name="cloud-upload-outline" size={18} color={COLOURS.primary} />
          <Text style={ms.importText}>Import JSON</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={[ms.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        <Text style={ms.sectionLabel}>BUILT-IN ({QUESTIONNAIRES.length})</Text>
        <View style={ms.card}>
          {QUESTIONNAIRES.map((q, i) => (
            <MobileQRow key={q.id} q={q} isLast={i === QUESTIONNAIRES.length - 1} />
          ))}
        </View>
        {customQs.length > 0 && <>
          <Text style={[ms.sectionLabel, { marginTop: 18 }]}>CUSTOM ({customQs.length})</Text>
          <View style={ms.card}>
            {customQs.map((q, i) => (
              <MobileQRow key={q.id} q={q} isLast={i === customQs.length - 1} onDelete={() => handleDelete(q)} />
            ))}
          </View>
        </>}
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
  importBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,123,181,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  importText:  { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  content:     { paddingHorizontal: 16, gap: 10 },
  sectionLabel:{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  card:        { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, overflow: 'hidden' },
  hint:        { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(74,123,181,0.07)', borderRadius: 12, padding: 14, marginTop: 8 },
  hintText:    { flex: 1, fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, lineHeight: 20 },
});

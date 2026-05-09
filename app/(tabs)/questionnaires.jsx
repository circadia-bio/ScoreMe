/**
 * app/(tabs)/questionnaires.jsx — Questionnaire library
 *
 * Desktop: music-log split pattern.
 *   Left panel — full list of questionnaires
 *   Right panel — detail / import hint (no selection needed, just info)
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

// ─── Questionnaire row ────────────────────────────────────────────────────────
function QRow({ q, isLast, onDelete }) {
  return (
    <View>
      <View style={qr.row}>
        <View style={qr.iconWrap}>
          <Ionicons name="document-text-outline" size={18} color={COLOURS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={qr.title}>{q.title}</Text>
            {q.beta && <View style={qr.betaChip}><Text style={qr.betaText}>BETA</Text></View>}
          </View>
          <Text style={qr.meta}>{q.shortTitle} · {q.items?.length ?? '?'} items</Text>
        </View>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} style={qr.deleteBtn}>
            <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
          </TouchableOpacity>
        ) : (
          <View style={qr.lockBadge}>
            <Ionicons name="lock-closed-outline" size={13} color={COLOURS.textMuted} />
          </View>
        )}
      </View>
      {!isLast && <View style={qr.divider} />}
    </View>
  );
}
const qr = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconWrap:  { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  meta:      { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, marginTop: 2 },
  betaChip:  { backgroundColor: COLOURS.purpleBg, borderWidth: 1, borderColor: COLOURS.purpleLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  betaText:  { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.purple },
  lockBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(74,123,181,0.06)', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center' },
  divider:   { height: 1, backgroundColor: 'rgba(74,123,181,0.07)', marginHorizontal: 14 },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function QuestionnairesScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const [customQs, setCustomQs] = useState([]);

  const load = useCallback(async () => { setCustomQs(await loadCustomQuestionnaires()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (q) => {
    Alert.alert('Remove questionnaire', `Remove "${q.title}"? Scores already collected are not affected.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteCustomQuestionnaire(q.id); load(); } },
    ]);
  };

  const allQs = [...QUESTIONNAIRES, ...customQs];

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
          {/* Left col — list */}
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

              {/* Built-in */}
              <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                BUILT-IN ({QUESTIONNAIRES.length})
              </Text>
              <BlurView intensity={36} tint="light" style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.48)' }}>
                  {QUESTIONNAIRES.map((q, i) => (
                    <QRow key={q.id} q={q} isLast={i === QUESTIONNAIRES.length - 1} />
                  ))}
                </View>
              </BlurView>

              {/* Custom */}
              {customQs.length > 0 && <>
                <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                  CUSTOM ({customQs.length})
                </Text>
                <BlurView intensity={36} tint="light" style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 }}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.48)' }}>
                    {customQs.map((q, i) => (
                      <QRow key={q.id} q={q} isLast={i === customQs.length - 1} onDelete={() => handleDelete(q)} />
                    ))}
                  </View>
                </BlurView>
              </>}
            </ScrollView>
          </View>

          {/* Right col — info panel */}
          <View style={{ flex: 1, marginTop: 12, marginBottom: 12, marginRight: 12, justifyContent: 'center', padding: 28, gap: 20 }}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{allQs.length} questionnaires</Text>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 26 }}>
                {QUESTIONNAIRES.length} built-in instruments{customQs.length > 0 ? ` and ${customQs.length} custom` : ''}.{'\n'}Select a participant to start scoring.
              </Text>
            </View>

            {/* Schema hint */}
            <BlurView intensity={36} tint="light" style={{ borderRadius: 14, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.48)', padding: 18, gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="cloud-upload-outline" size={18} color={COLOURS.primary} />
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>Import custom questionnaires</Text>
                </View>
                <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, lineHeight: 20 }}>
                  Upload any JSON file following the built-in schema: id, title, shortTitle, instructions, items[].
                </Text>
                <TouchableOpacity
                  style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 }}
                  onPress={() => importJSON(load)}
                >
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                  <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: '#fff' }}>Import JSON</Text>
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Built-in list summary */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>INSTRUMENTS</Text>
              {QUESTIONNAIRES.map(q => (
                <View key={q.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLOURS.primary }} />
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>{q.shortTitle}</Text>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, flex: 1 }} numberOfLines={1}>{q.title}</Text>
                </View>
              ))}
            </View>
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
            <QRow key={q.id} q={q} isLast={i === QUESTIONNAIRES.length - 1} />
          ))}
        </View>
        {customQs.length > 0 && <>
          <Text style={[ms.sectionLabel, { marginTop: 18 }]}>CUSTOM ({customQs.length})</Text>
          <View style={ms.card}>
            {customQs.map((q, i) => (
              <QRow key={q.id} q={q} isLast={i === customQs.length - 1} onDelete={() => handleDelete(q)} />
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

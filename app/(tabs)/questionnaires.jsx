/**
 * app/(tabs)/questionnaires.jsx — Questionnaire library
 *
 * Responsive:
 *   mobile/tablet → ScreenBackground, list cards
 *   desktop       → DesktopLayout, GlassCard list, 2-col grid for built-ins
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import ScreenBackground from '../../components/ScreenBackground';
import DesktopLayout    from '../../components/DesktopLayout';
import GlassCard        from '../../components/GlassCard';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout } from '../../theme/responsive';
import { QUESTIONNAIRES } from '../../data/questionnaires';
import { loadCustomQuestionnaires, saveCustomQuestionnaire, deleteCustomQuestionnaire } from '../../storage/storage';

// ─── Shared import handler ────────────────────────────────────────────────────
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

// ─── Questionnaire item row ───────────────────────────────────────────────────
function QRow({ q, isLast, onDelete, isDesktop }) {
  return (
    <View>
      <View style={[qr.row, isDesktop && qr.desktopRow]}>
        <View style={qr.iconWrap}>
          <Ionicons name="clipboard-outline" size={18} color={COLOURS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={qr.titleRow}>
            <Text style={qr.title}>{q.title}</Text>
            {q.beta && (
              <View style={qr.betaChip}>
                <Text style={qr.betaText}>BETA</Text>
              </View>
            )}
          </View>
          <Text style={qr.meta}>{q.shortTitle} · {q.items?.length ?? '?'} items</Text>
          {isDesktop && q.reference ? (
            <Text style={qr.ref} numberOfLines={1}>{q.reference}</Text>
          ) : null}
        </View>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} style={qr.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={COLOURS.danger} />
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
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  desktopRow: { paddingVertical: 16, paddingHorizontal: 16 },
  iconWrap:   { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  titleRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title:      { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  meta:       { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, marginTop: 2 },
  ref:        { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2, lineHeight: 16 },
  betaChip:   { backgroundColor: COLOURS.purpleBg, borderWidth: 1, borderColor: COLOURS.purpleLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  betaText:   { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.purple },
  lockBadge:  { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  deleteBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center' },
  divider:    { height: 1, backgroundColor: 'rgba(74,123,181,0.07)', marginHorizontal: 16 },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function QuestionnairesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDesktop } = useLayout();
  const [customQs, setCustomQs] = useState([]);

  const load = useCallback(async () => {
    setCustomQs(await loadCustomQuestionnaires());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (q) => {
    Alert.alert('Remove questionnaire', `Remove "${q.title}"? Scores already collected are not affected.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteCustomQuestionnaire(q.id); load(); } },
    ]);
  };

  // ── Desktop ─────────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={{ flex: 1 }}>
        <DesktopLayout
          activeTab="questionnaires"
          onNavigate={(tab) => {
            if (tab === 'dashboard')    router.push('/(tabs)');
            if (tab === 'participants') router.push('/(tabs)/participants');
          }}
          onExport={() => router.push('/export')}
        >
          <View style={ds.pageHeader}>
            <Text style={ds.pageTitle}>Questionnaires</Text>
            <TouchableOpacity style={ds.importBtn} onPress={() => importJSON(load)}>
              <Ionicons name="cloud-upload-outline" size={18} color={COLOURS.primary} />
              <Text style={ds.importText}>Import JSON</Text>
            </TouchableOpacity>
          </View>

          <Text style={ds.sectionLabel}>BUILT-IN ({QUESTIONNAIRES.length})</Text>
          {/* 2-col grid on desktop */}
          <View style={ds.grid}>
            {QUESTIONNAIRES.map((q) => (
              <GlassCard key={q.id} padding={0} style={ds.gridItem}>
                <QRow q={q} isLast isDesktop />
              </GlassCard>
            ))}
          </View>

          {customQs.length > 0 && (
            <>
              <Text style={[ds.sectionLabel, { marginTop: 20 }]}>CUSTOM ({customQs.length})</Text>
              <GlassCard padding={0} style={{ overflow: 'hidden' }}>
                {customQs.map((q, i) => (
                  <QRow key={q.id} q={q} isLast={i === customQs.length - 1} onDelete={() => handleDelete(q)} isDesktop />
                ))}
              </GlassCard>
            </>
          )}

          <View style={ds.hint}>
            <Ionicons name="information-circle-outline" size={18} color={COLOURS.primary} />
            <Text style={ds.hintText}>
              Import custom questionnaires as JSON files using the same schema as the built-ins (id, title, shortTitle, instructions, items[]).
            </Text>
          </View>
        </DesktopLayout>
      </View>
    );
  }

  // ── Mobile / tablet ─────────────────────────────────────────────────────────
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
            <QRow key={q.id} q={q} isLast={i === QUESTIONNAIRES.length - 1} isDesktop={false} />
          ))}
        </View>

        {customQs.length > 0 && (
          <>
            <Text style={[ms.sectionLabel, { marginTop: 18 }]}>CUSTOM ({customQs.length})</Text>
            <View style={ms.card}>
              {customQs.map((q, i) => (
                <QRow key={q.id} q={q} isLast={i === customQs.length - 1} onDelete={() => handleDelete(q)} isDesktop={false} />
              ))}
            </View>
          </>
        )}

        <View style={ms.hint}>
          <Ionicons name="information-circle-outline" size={17} color={COLOURS.primary} />
          <Text style={ms.hintText}>
            Import custom questionnaires as JSON files following the same schema as the built-ins.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const ds = StyleSheet.create({
  pageHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle:   { fontSize: 36, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  importBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  importText:  { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  sectionLabel:{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  gridItem:    { width: '47.5%', overflow: 'hidden' },
  hint:        { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(74,123,181,0.07)', borderRadius: 14, padding: 14, marginTop: 20 },
  hintText:    { flex: 1, fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, lineHeight: 20 },
});

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

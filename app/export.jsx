/**
 * app/export.jsx — Export scores as CSV
 *
 * Generates a CSV of all participants × all questionnaire scores and
 * lets the researcher share it via the system share sheet or download it.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ScreenBackground from '../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../theme/typography';
import { loadParticipants, participantsToCSV } from '../storage/storage';
import { QUESTIONNAIRES } from '../data/questionnaires';

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const formatScore = (q, score) => {
  if (typeof score === 'object' && score !== null) {
    if (score.msf_sc !== undefined) {
      const h = Math.floor(score.msf_sc); const m = Math.round((score.msf_sc % 1) * 60);
      return `${pad(h)}:${pad(m)}`;
    }
    return JSON.stringify(score);
  }
  return String(score);
};

export default function ExportScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [participants, setParticipants] = useState([]);
  const [exporting, setExporting]       = useState(false);

  useFocusEffect(useCallback(() => {
    loadParticipants().then(setParticipants);
  }, []));

  const handleExport = async () => {
    if (participants.length === 0) {
      Alert.alert('Nothing to export', 'Add and score some participants first.');
      return;
    }
    setExporting(true);
    try {
      const qids = QUESTIONNAIRES.map((q) => q.id);
      const csv  = participantsToCSV(participants, qids);

      if (Platform.OS === 'web') {
        // Web: trigger download via anchor
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `scoreme_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const path = `${FileSystem.cacheDirectory}scoreme_export_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export ScoreMe data' });
        } else {
          Alert.alert('Sharing not available', `CSV saved to: ${path}`);
        }
      }
    } catch (e) {
      Alert.alert('Export failed', e.message);
    } finally {
      setExporting(false);
    }
  };

  // Build preview table
  const allQs = QUESTIONNAIRES;
  const scoredParticipants = participants.filter((p) => Object.keys(p.results ?? {}).length > 0);

  return (
    <View style={s.root}>
      <ScreenBackground />

      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={26} color={COLOURS.primaryDark} />
        </TouchableOpacity>
        <Text style={s.title}>Export Data</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false} horizontal={false}>

        {/* Export button */}
        <TouchableOpacity style={[s.exportBtn, exporting && { opacity: 0.5 }]} onPress={handleExport} disabled={exporting}>
          <Ionicons name="download-outline" size={22} color="#fff" />
          <Text style={s.exportBtnText}>{exporting ? 'Exporting…' : 'Export as CSV'}</Text>
        </TouchableOpacity>

        <Text style={s.hint}>
          Exports all participants with their latest score for each questionnaire. One row per participant.
        </Text>

        {/* Preview */}
        {scoredParticipants.length > 0 && (
          <>
            <Text style={s.sectionLabel}>PREVIEW ({scoredParticipants.length} participant{scoredParticipants.length !== 1 ? 's' : ''})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator style={s.tableScroll}>
              <View>
                {/* Header row */}
                <View style={[s.tableRow, s.tableHeaderRow]}>
                  <Text style={[s.tableCell, s.tableHeader, { width: 120 }]}>Name</Text>
                  {allQs.map((q) => (
                    <Text key={q.id} style={[s.tableCell, s.tableHeader, { width: 80 }]}>{q.shortTitle}</Text>
                  ))}
                </View>
                {/* Data rows */}
                {scoredParticipants.map((p, i) => (
                  <View key={p.id} style={[s.tableRow, i % 2 === 1 && s.tableRowAlt]}>
                    <Text style={[s.tableCell, { width: 120, fontFamily: FONTS.body, color: COLOURS.primaryDark }]} numberOfLines={1}>{p.name}</Text>
                    {allQs.map((q) => {
                      const r = p.results?.[q.id];
                      const color = r ? q.interpret(r.score).color : COLOURS.textMuted;
                      return (
                        <View key={q.id} style={[s.tableCell, { width: 80, alignItems: 'center' }]}>
                          {r ? (
                            <View style={[s.miniChip, { backgroundColor: color + '18', borderColor: color }]}>
                              <Text style={[s.miniChipText, { color }]}>{formatScore(q, r.score)}</Text>
                            </View>
                          ) : (
                            <Text style={s.tableMissing}>—</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {participants.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="document-outline" size={52} color={COLOURS.textMuted} />
            <Text style={s.emptyTitle}>No data yet</Text>
            <Text style={s.emptyBody}>Add participants and score questionnaires to export results.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8 },
  backBtn: { width: 36, alignItems: 'flex-start' },
  title:   { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  content: { paddingHorizontal: 16, gap: 14 },

  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLOURS.primary, borderRadius: 14, paddingVertical: 16 },
  exportBtnText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },

  hint: { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, lineHeight: 22, textAlign: 'center', paddingHorizontal: 8 },

  sectionLabel: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },

  tableScroll: { borderRadius: 12, borderWidth: 1, borderColor: COLOURS.cardBorder },
  tableRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: COLOURS.cardBg, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tableRowAlt:    { backgroundColor: 'rgba(238,245,255,0.6)' },
  tableHeaderRow: { backgroundColor: COLOURS.primaryLight },
  tableCell:      { paddingHorizontal: 10, paddingVertical: 10, justifyContent: 'center' },
  tableHeader:    { fontSize: 13, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  tableMissing:   { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },

  miniChip:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 2 },
  miniChipText: { fontSize: 12, fontFamily: FONTS.body },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  emptyBody:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 },
});

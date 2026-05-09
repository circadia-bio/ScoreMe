/**
 * app/export.jsx — Export data as CSV or JSON
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform, Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ScreenBackground from '../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../theme/responsive';
import { loadParticipants, participantsToCSV, participantsToJSON } from '../storage/storage';
import { QUESTIONNAIRES } from '../data/questionnaires';
import { loadCustomQuestionnaires } from '../storage/storage';

const pad = (n) => String(n).padStart(2, '0');

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

async function doExport(content, filename, mime) {
  if (Platform.OS === 'web') {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  } else {
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: mime, dialogTitle: 'Export ScoreMe data' });
    } else {
      Alert.alert('Saved', path);
    }
  }
}

// ─── Inner content (shared between mobile screen and desktop modal) ───────────
function ExportContent({ participants, allQs, onClose }) {
  const [exportingCSV,  setExportingCSV]  = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);

  const scoredParticipants = participants.filter(p => Object.keys(p.results ?? {}).length > 0);
  const totalScores = participants.reduce((s, p) => s + Object.keys(p.results ?? {}).length, 0);

  const handleCSV = async () => {
    if (!participants.length) { Alert.alert('Nothing to export', 'Add and score some participants first.'); return; }
    setExportingCSV(true);
    try { await doExport(participantsToCSV(participants, allQs.map(q => q.id)), `scoreme_${Date.now()}.csv`, 'text/csv'); }
    catch (e) { Alert.alert('Export failed', e.message); }
    finally { setExportingCSV(false); }
  };

  const handleJSON = async () => {
    if (!participants.length) { Alert.alert('Nothing to export', 'Add and score some participants first.'); return; }
    setExportingJSON(true);
    try { await doExport(participantsToJSON(participants, allQs), `scoreme_${Date.now()}.json`, 'application/json'); }
    catch (e) { Alert.alert('Export failed', e.message); }
    finally { setExportingJSON(false); }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 28, paddingBottom: 48, gap: 20 }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Export Data</Text>
          <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>
            {participants.length} participant{participants.length !== 1 ? 's' : ''} · {totalScores} score{totalScores !== 1 ? 's' : ''}
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={18} color={COLOURS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stat pills */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { icon: 'people-outline',      label: 'Participants', value: participants.length },
          { icon: 'checkmark-circle-outline', label: 'Scored',  value: scoredParticipants.length },
          { icon: 'bar-chart-outline',   label: 'Total scores', value: totalScores },
        ].map(({ icon, label, value }) => (
          <BlurView key={label} intensity={36} tint="light" style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.50)', padding: 12, alignItems: 'center', gap: 3 }}>
              <Ionicons name={icon} size={18} color={COLOURS.primary} />
              <Text style={{ fontSize: 18, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{value}</Text>
              <Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
            </View>
          </BlurView>
        ))}
      </View>

      {/* Export buttons */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>EXPORT</Text>

        <TouchableOpacity style={[ec.btn, ec.btnPrimary, exportingCSV && { opacity: 0.5 }]} onPress={handleCSV} disabled={exportingCSV} activeOpacity={0.85}>
          <View style={ec.btnIcon}>
            <Ionicons name="document-text-outline" size={20} color={COLOURS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={ec.btnTitle}>{exportingCSV ? 'Exporting…' : 'Export as CSV'}</Text>
            <Text style={ec.btnSub}>Scores only · one row per participant</Text>
          </View>
          <Ionicons name="download-outline" size={18} color={COLOURS.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[ec.btn, ec.btnSolid, exportingJSON && { opacity: 0.5 }]} onPress={handleJSON} disabled={exportingJSON} activeOpacity={0.85}>
          <View style={ec.btnIconSolid}>
            <Ionicons name="code-slash-outline" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[ec.btnTitle, { color: '#fff' }]}>{exportingJSON ? 'Exporting…' : 'Export as JSON'}</Text>
            <Text style={[ec.btnSub, { color: 'rgba(255,255,255,0.72)' }]}>Full item-level answers + metadata</Text>
          </View>
          <Ionicons name="download-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Preview table */}
      {scoredParticipants.length > 0 && (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            PREVIEW ({scoredParticipants.length} participant{scoredParticipants.length !== 1 ? 's' : ''})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BlurView intensity={36} tint="light" style={{ borderRadius: 14, overflow: 'hidden' }}>
              {/* Header */}
              <View style={[pt.row, pt.headerRow]}>
                <Text style={[pt.cell, pt.headerCell, { width: 130 }]}>Participant</Text>
                {allQs.map(q => (
                  <Text key={q.id} style={[pt.cell, pt.headerCell, { width: 76 }]}>{q.shortTitle}</Text>
                ))}
              </View>
              {/* Rows */}
              {scoredParticipants.map((p, i) => (
                <View key={p.id} style={[pt.row, i % 2 === 1 && pt.rowAlt]}>
                  <Text style={[pt.cell, { width: 130, fontFamily: FONTS.body, color: COLOURS.primaryDark }]} numberOfLines={1}>{p.name}</Text>
                  {allQs.map(q => {
                    const r = p.results?.[q.id];
                    const color = r ? (q.interpret ? q.interpret(r.score).color : COLOURS.primary) : null;
                    return (
                      <View key={q.id} style={[pt.cell, { width: 76, alignItems: 'center' }]}>
                        {r ? (
                          <View style={{ borderWidth: 1, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 2, backgroundColor: color + '18', borderColor: color }}>
                            <Text style={{ fontSize: 12, fontFamily: FONTS.body, color }}>{formatScore(q, r.score)}</Text>
                          </View>
                        ) : (
                          <Text style={{ fontSize: 13, color: COLOURS.textMuted }}>—</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </BlurView>
          </ScrollView>
        </View>
      )}

      {participants.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
          <Ionicons name="document-outline" size={48} color={COLOURS.textMuted} style={{ opacity: 0.4 }} />
          <Text style={{ fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>No data yet</Text>
          <Text style={{ fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24 }}>
            Add participants and complete questionnaires to export results.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const ec = StyleSheet.create({
  btn:         { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16 },
  btnPrimary:  { backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  btnSolid:    { backgroundColor: COLOURS.primary, shadowColor: 'rgba(74,123,181,0.40)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5 },
  btnIcon:     { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  btnIconSolid:{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  btnTitle:    { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  btnSub:      { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
});

const pt = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.48)', borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.06)' },
  rowAlt:     { backgroundColor: 'rgba(238,245,255,0.55)' },
  headerRow:  { backgroundColor: 'rgba(200,223,245,0.55)' },
  cell:       { paddingHorizontal: 10, paddingVertical: 10, justifyContent: 'center' },
  headerCell: { fontSize: 12, fontFamily: FONTS.body, color: COLOURS.primaryDark },
});

// ─── Desktop modal overlay ────────────────────────────────────────────────────
function DesktopExportModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const [participants, setParticipants] = useState([]);
  const [allQs, setAllQs]              = useState(QUESTIONNAIRES);

  React.useEffect(() => {
    if (!visible) return;
    Promise.all([loadParticipants(), loadCustomQuestionnaires()]).then(([ps, customQs]) => {
      setParticipants(ps);
      setAllQs([...QUESTIONNAIRES, ...customQs]);
    });
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(30,58,95,0.30)' }} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: 'absolute', right: 24, top: insets.top + 24, bottom: 24,
            width: 520,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: 'rgba(238,245,255,0.97)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
            shadowColor: 'rgba(74,123,181,0.25)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 32, elevation: 12,
          }}
        >
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
          <ExportContent participants={participants} allQs={allQs} onClose={onClose} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Root screen (mobile) ─────────────────────────────────────────────────────
export default function ExportScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const [participants, setParticipants] = useState([]);
  const [allQs, setAllQs]              = useState(QUESTIONNAIRES);

  useFocusEffect(useCallback(() => {
    Promise.all([loadParticipants(), loadCustomQuestionnaires()]).then(([ps, customQs]) => {
      setParticipants(ps);
      setAllQs([...QUESTIONNAIRES, ...customQs]);
    });
  }, []));

  // On desktop, the sidebar's Export button pushes /export as a route —
  // we instead show a floating panel. Redirect back and let the tab handle it.
  // For simplicity, just render the content full-screen on desktop too.
  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      {/* Back button — mobile only */}
      {!isDesktop && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: insets.top + 16, paddingBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 36 }}>
            <Ionicons name="chevron-back" size={26} color={COLOURS.primaryDark} />
          </TouchableOpacity>
        </View>
      )}
      <ExportContent participants={participants} allQs={allQs} onClose={isDesktop ? () => router.back() : null} />
    </View>
  );
}

// Export the modal for use by the desktop sidebar
export { DesktopExportModal };

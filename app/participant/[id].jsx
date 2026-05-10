/**
 * app/participant/[id].jsx — Participant detail & scoring hub
 *
 * Shows all questionnaire results for a participant and lets the researcher
 * start scoring any questionnaire.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenBackground from '../../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { loadParticipants, loadCustomQuestionnaires, loadDisabledQs, updateParticipant } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const formatScore = (q, score) => {
  if (typeof score === 'object' && score !== null) {
    if (score.msf_sc !== undefined) {
      const h = Math.floor(score.msf_sc); const m = Math.round((score.msf_sc % 1) * 60);
      return `${pad(h)}:${pad(m)} MSFsc`;
    }
    return JSON.stringify(score);
  }
  return String(score);
};

export default function ParticipantScreen() {
  const { id }   = useLocalSearchParams();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const [participant, setParticipant] = useState(null);
  const [allQs, setAllQs]             = useState(QUESTIONNAIRES);
  const [editing, setEditing]         = useState(false);
  const [editName, setEditName]       = useState('');
  const [editNotes, setEditNotes]     = useState('');
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    const [ps, customQs, disabledQs] = await Promise.all([loadParticipants(), loadCustomQuestionnaires(), loadDisabledQs()]);
    setParticipant(ps.find((p) => p.id === id) ?? null);
    setAllQs([...QUESTIONNAIRES, ...customQs].filter(q => !disabledQs.has(q.id)));
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const startEdit = () => { setEditName(participant.name); setEditNotes(participant.notes ?? ''); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const saveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    await updateParticipant(id, { name: editName.trim(), notes: editNotes.trim() });
    await load();
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${participant.name} and all their scores? This cannot be undone.`)) {
        deleteParticipant(id).then(() => router.back());
      }
    } else {
      Alert.alert('Delete participant', `Delete ${participant.name} and all their scores?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteParticipant(id).then(() => router.back()) },
      ]);
    }
  };

  if (!participant) return null;

  const results  = participant.results ?? {};
  const scored   = allQs.filter((q) => results[q.id]);
  const unscored = allQs.filter((q) => !results[q.id]);

  return (
    <View style={s.root}>
      <ScreenBackground />

      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={26} color={COLOURS.primaryDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{participant.name}</Text>
        <TouchableOpacity onPress={startEdit} style={s.editBtn}>
          <Ionicons name="pencil-outline" size={20} color={COLOURS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={{ width: 36, alignItems: 'flex-end' }}>
          <Ionicons name="trash-outline" size={20} color={COLOURS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>

        {editing ? (
          <View style={[s.profileCard, { flexDirection: 'column', gap: 12 }]}>
            <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6 }}>Name *</Text>
            <TextInput
              style={s.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Participant name or ID"
              placeholderTextColor={COLOURS.textMuted}
              autoFocus
            />
            <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6 }}>Notes (optional)</Text>
            <TextInput
              style={[s.input, { height: 72, textAlignVertical: 'top' }]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="e.g. Group A, session date…"
              placeholderTextColor={COLOURS.textMuted}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={s.cancelBtn} onPress={cancelEdit}>
                <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, (!editName.trim() || saving) && { opacity: 0.4 }]}
                onPress={saveEdit}
                disabled={!editName.trim() || saving}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' }}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{participant.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{participant.name}</Text>
            {participant.notes ? <Text style={s.notes}>{participant.notes}</Text> : null}
            <Text style={s.meta}>Added {formatDate(participant.createdAt)}</Text>
          </View>
          <View style={s.scoreCount}>
            <Text style={s.scoreCountNum}>{scored.length}</Text>
            <Text style={s.scoreCountLabel}>of {allQs.length}</Text>
          </View>
        </View>
        )}

        {scored.length > 0 && (
          <>
            <Text style={s.sectionLabel}>RESULTS</Text>
            <View style={s.card}>
              {scored.map((q, i, arr) => {
                const result = results[q.id];
                const interp = q.interpret(result.score);
                return (
                  <View key={q.id}>
                    <View style={s.resultRow}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={s.qTitle}>{q.title}</Text>
                        <View style={[s.badge, { backgroundColor: interp.color + '18', borderColor: interp.color }]}>
                          <Text style={[s.badgeText, { color: interp.color }]}>
                            {formatScore(q, result.score)} — {interp.label}
                          </Text>
                        </View>
                        <Text style={s.resultDate}>{formatDate(result.completedAt)}</Text>
                      </View>
                      <TouchableOpacity
                        style={s.redoBtn}
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            if (window.confirm(`Re-score ${q.shortTitle} for ${participant.name}? Previous result will be replaced.`)) router.push(`/score/${participant.id}/${q.id}`);
                          } else {
                            Alert.alert('Re-score', `Re-score ${q.shortTitle} for ${participant.name}? Previous result will be replaced.`, [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Re-score', onPress: () => router.push(`/score/${participant.id}/${q.id}`) },
                            ]);
                          }
                        }}
                      >
                        <Text style={s.redoBtnText}>Redo</Text>
                      </TouchableOpacity>
                    </View>
                    {i < arr.length - 1 && <View style={s.divider} />}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {unscored.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { marginTop: scored.length > 0 ? 18 : 0 }]}>SCORE NOW</Text>
            <View style={s.card}>
              {unscored.map((q, i, arr) => (
                <View key={q.id}>
                  <View style={s.qRow}>
                    <View style={{ flex: 1 }}>
                      <View style={s.titleRow}>
                        <Text style={s.qTitle}>{q.title}</Text>
                        {q.beta && <View style={s.betaChip}><Text style={s.betaChipText}>BETA</Text></View>}
                      </View>
                      <Text style={s.qMeta}>{q.shortTitle} · {q.items.length} items</Text>
                      {(q.construct || q.domain || q.timeframe) && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                          {q.construct && <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }}>{q.construct}</Text>}
                          {q.domain && <View style={{ backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>{q.domain}</Text></View>}
                          {q.timeframe && <View style={{ backgroundColor: 'rgba(224,122,32,0.08)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.accent }}>{q.timeframe}</Text></View>}
                        </View>
                      )}
                    </View>
                    <TouchableOpacity style={s.startBtn} onPress={() => router.push(`/score/${participant.id}/${q.id}`)}>
                      <Text style={s.startBtnText}>Start</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLOURS.primary} />
                    </TouchableOpacity>
                  </View>
                  {i < arr.length - 1 && <View style={s.divider} />}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8 },
  backBtn: { width: 36, alignItems: 'flex-start' },
  headerTitle: { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark, flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: 16, gap: 10 },
  profileCard: { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar:  { width: 52, height: 52, borderRadius: 26, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:    { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:   { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  meta:    { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  scoreCount: { alignItems: 'center' },
  scoreCountNum:   { fontSize: 28, fontFamily: FONTS.heading, color: COLOURS.primary },
  scoreCountLabel: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  sectionLabel: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  card:    { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  badge:   { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: SIZES.label, fontFamily: FONTS.body },
  resultDate: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  redoBtn: { backgroundColor: 'rgba(74,123,181,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  redoBtnText: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  qRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  titleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  qTitle:  { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  qMeta:   { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  betaChip:{ backgroundColor: COLOURS.purpleBg, borderWidth: 1, borderColor: COLOURS.purpleLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  betaChipText: { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.purple },
  startBtn:{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(74,123,181,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  startBtnText: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  editBtn: { width: 36, alignItems: 'flex-end' },
  input:   { backgroundColor: 'rgba(255,255,255,0.80)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(74,123,181,0.08)' },
  saveBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 12, paddingVertical: 12, shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4 },
});

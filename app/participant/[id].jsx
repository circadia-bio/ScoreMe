/**
 * app/participant/[id].jsx — Participant detail & scoring hub (mobile)
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Platform, Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenBackground from '../../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { loadParticipants, loadCustomQuestionnaires, loadDisabledQs, updateParticipant, deleteParticipant, getLatestResult, getAllResults } from '../../storage/storage';
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

// ─── Inline edit form helpers ────────────────────────────────────────────────────
const SEX_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

function FieldRow({ label, value, onChange, placeholder, keyboardType, multiline }) {
  return (
    <>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.input, multiline && { height: 72, textAlignVertical: 'top' }]}
        value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor={COLOURS.textMuted} multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
      />
    </>
  );
}

function EditSection({ title }) {
  return <Text style={s.editSection}>{title}</Text>;
}

export default function ParticipantScreen() {
  const { id }   = useLocalSearchParams();
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const [participant, setParticipant] = useState(null);
  const [allQs, setAllQs]             = useState(QUESTIONNAIRES);
  const [editing, setEditing]         = useState(false);
  const EMPTY = { code: '', name: '', age: '', sex: '', bmi: '', group: '', site: '', session: '', diagnosis: '', medication: '', referral: '', notes: '', customFields: [] };
  const [ef, setEF]                   = useState(EMPTY);
  const setF = (k, v) => setEF(f => ({ ...f, [k]: v }));
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    const [ps, customQs, disabledQs] = await Promise.all([loadParticipants(), loadCustomQuestionnaires(), loadDisabledQs()]);
    setParticipant(ps.find((p) => p.id === id) ?? null);
    setAllQs([...QUESTIONNAIRES, ...customQs].filter(q => !disabledQs.has(q.id)));
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const startEdit = () => {
    setEF({ code: participant.code ?? participant.name ?? '', name: participant.name ?? '', age: participant.age ?? '', sex: participant.sex ?? '', bmi: participant.bmi ?? '', group: participant.group ?? '', site: participant.site ?? '', session: participant.session ?? '', diagnosis: participant.diagnosis ?? '', medication: participant.medication ?? '', referral: participant.referral ?? '', notes: participant.notes ?? '', customFields: participant.customFields ?? [] });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!ef.code.trim()) return;
    Keyboard.dismiss();
    setSaving(true);
    await updateParticipant(id, { ...ef, code: ef.code.trim(), name: ef.name.trim() });
    await load();
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = () => {
    const label = participant.code ?? participant.name;
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${label} and all their scores? This cannot be undone.`)) {
        deleteParticipant(id).then(() => router.back());
      }
    } else {
      Alert.alert('Delete participant', `Delete ${label} and all their scores?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteParticipant(id).then(() => router.back()) },
      ]);
    }
  };

  if (!participant) return null;

  const results  = participant.results ?? {};
  const scored   = allQs.filter((q) => !!getLatestResult(participant, q.id));
  const unscored = allQs.filter((q) => !getLatestResult(participant, q.id));
  const displayName = participant.code ?? participant.name;

  return (
    <View style={s.root}>
      <ScreenBackground />

      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={26} color={COLOURS.primaryDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{displayName}</Text>
        <TouchableOpacity onPress={startEdit} style={s.editBtn}>
          <Ionicons name="pencil-outline" size={20} color={COLOURS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={{ width: 36, alignItems: 'flex-end' }}>
          <Ionicons name="trash-outline" size={20} color={COLOURS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>

        {editing ? (
          <View style={[s.profileCard, { flexDirection: 'column' }]}>
            <EditSection title="Identity" />
            <FieldRow label="Code *" value={ef.code} onChange={v => setF('code', v)} placeholder="e.g. P001" />
            <FieldRow label="Name" value={ef.name} onChange={v => setF('name', v)} placeholder="Full name (optional)" />

            <EditSection title="Demographics" />
            <FieldRow label="Age" value={ef.age} onChange={v => setF('age', v)} placeholder="e.g. 34" keyboardType="numeric" />
            <Text style={s.fieldLabel}>Sex</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {SEX_OPTIONS.map(opt => (
                <TouchableOpacity key={opt}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, backgroundColor: ef.sex === opt ? COLOURS.primary : 'rgba(255,255,255,0.72)', borderColor: ef.sex === opt ? COLOURS.primary : 'rgba(74,123,181,0.2)' }}
                  onPress={() => setF('sex', ef.sex === opt ? '' : opt)}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: ef.sex === opt ? '#fff' : COLOURS.primaryDark }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <FieldRow label="BMI" value={ef.bmi} onChange={v => setF('bmi', v)} placeholder="e.g. 24.5" keyboardType="numeric" />

            <EditSection title="Study" />
            <FieldRow label="Group / Condition" value={ef.group} onChange={v => setF('group', v)} placeholder="e.g. Control" />
            <FieldRow label="Site" value={ef.site} onChange={v => setF('site', v)} placeholder="e.g. London" />
            <FieldRow label="Session" value={ef.session} onChange={v => setF('session', v)} placeholder="e.g. Baseline" />

            <EditSection title="Clinical" />
            <FieldRow label="Diagnosis" value={ef.diagnosis} onChange={v => setF('diagnosis', v)} placeholder="e.g. Insomnia disorder" />
            <FieldRow label="Medication" value={ef.medication} onChange={v => setF('medication', v)} placeholder="e.g. None" />
            <FieldRow label="Referral" value={ef.referral} onChange={v => setF('referral', v)} placeholder="e.g. GP" />

            <EditSection title="Custom fields" />
            {(ef.customFields ?? []).map((cf, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'flex-start' }}>
                <TextInput style={[s.input, { flex: 1 }]} value={cf.label} onChangeText={v => { const c = [...ef.customFields]; c[i] = { ...c[i], label: v }; setF('customFields', c); }} placeholder="Label" placeholderTextColor={COLOURS.textMuted} />
                <TextInput style={[s.input, { flex: 2 }]} value={cf.value} onChangeText={v => { const c = [...ef.customFields]; c[i] = { ...c[i], value: v }; setF('customFields', c); }} placeholder="Value" placeholderTextColor={COLOURS.textMuted} />
                <TouchableOpacity onPress={() => setF('customFields', ef.customFields.filter((_, idx) => idx !== i))} style={{ width: 36, height: 42, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close-circle" size={18} color={COLOURS.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setF('customFields', [...(ef.customFields ?? []), { label: '', value: '' }])} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <Ionicons name="add-circle-outline" size={18} color={COLOURS.primary} />
              <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>Add field</Text>
            </TouchableOpacity>

            <FieldRow label="Notes" value={ef.notes} onChange={v => setF('notes', v)} placeholder="Any additional notes…" multiline />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, (!ef.code.trim() || saving) && { opacity: 0.4 }]} onPress={saveEdit} disabled={!ef.code.trim() || saving}>
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' }}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.profileCard}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{displayName}</Text>
              {participant.name && participant.code ? <Text style={s.notes}>{participant.name}</Text> : null}
              <Text style={s.meta}>Added {formatDate(participant.createdAt)}</Text>
            </View>
            <View style={s.scoreCount}>
              <Text style={s.scoreCountNum}>{scored.length}</Text>
              <Text style={s.scoreCountLabel}>of {allQs.length}</Text>
            </View>
          </View>
        )}

        {/* Metadata chips */}
        {!editing && (participant.age || participant.sex || participant.bmi || participant.group || participant.site || participant.session || participant.diagnosis || participant.medication || participant.referral || participant.notes || participant.customFields?.length > 0) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {participant.age       ? <View style={s.chip}><Text style={s.chipText}>Age: {participant.age}</Text></View> : null}
            {participant.sex       ? <View style={s.chip}><Text style={s.chipText}>{participant.sex}</Text></View> : null}
            {participant.bmi       ? <View style={s.chip}><Text style={s.chipText}>BMI: {participant.bmi}</Text></View> : null}
            {participant.group     ? <View style={[s.chip, s.chipStudy]}><Text style={[s.chipText, s.chipStudyText]}>{participant.group}</Text></View> : null}
            {participant.site      ? <View style={[s.chip, s.chipStudy]}><Text style={[s.chipText, s.chipStudyText]}>{participant.site}</Text></View> : null}
            {participant.session   ? <View style={[s.chip, s.chipStudy]}><Text style={[s.chipText, s.chipStudyText]}>{participant.session}</Text></View> : null}
            {participant.diagnosis ? <View style={[s.chip, s.chipClinical]}><Text style={[s.chipText, s.chipClinicalText]}>{participant.diagnosis}</Text></View> : null}
            {participant.medication? <View style={[s.chip, s.chipClinical]}><Text style={[s.chipText, s.chipClinicalText]}>{participant.medication}</Text></View> : null}
            {participant.referral  ? <View style={[s.chip, s.chipClinical]}><Text style={[s.chipText, s.chipClinicalText]}>{participant.referral}</Text></View> : null}
            {(participant.customFields ?? []).map((cf, i) => cf.label ? <View key={i} style={s.chip}><Text style={s.chipText}>{cf.label}: {cf.value}</Text></View> : null)}
            {participant.notes     ? <View style={s.chip}><Text style={s.chipText} numberOfLines={2}>📝 {participant.notes}</Text></View> : null}
          </View>
        )}

        {scored.length > 0 && (
          <>
            <Text style={s.sectionLabel}>RESULTS</Text>
            <View style={s.card}>
              {scored.map((q, i, arr) => {
                const result = getLatestResult(participant, q.id);
                const history = getAllResults(participant, q.id);
                const interp = q.interpret(result.score);
                return (
                  <View key={q.id}>
                    <View style={s.resultRow}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={s.qTitle}>{q.title}</Text>
                        <View style={[s.badge, { backgroundColor: interp.color + '18', shadowColor: interp.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 }]}>
                          <Text style={[s.badgeText, { color: interp.color }]}>
                            {formatScore(q, result.score)} — {interp.label}
                          </Text>
                        </View>
                        <Text style={s.resultDate}>
                          {formatDate(result.completedAt)}{history.length > 1 ? ` · ${history.length} attempts` : ''}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={s.redoBtn}
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            if (window.confirm(`Re-score ${q.shortTitle} for ${displayName}? Previous result will be replaced.`)) router.push(`/score/${participant.id}/${q.id}`);
                          } else {
                            Alert.alert('Re-score', `Re-score ${q.shortTitle} for ${displayName}? Previous result will be replaced.`, [
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
  badge:   { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
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
  // Edit form
  fieldLabel:  { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 2 },
  editSection: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.10)', paddingBottom: 6 },
  input:   { backgroundColor: 'rgba(255,255,255,0.80)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, marginTop: 6 },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(74,123,181,0.08)' },
  saveBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 12, paddingVertical: 12, shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4 },
  // Metadata chips
  chip:            { backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  chipText:        { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark },
  chipStudy:       { backgroundColor: 'rgba(107,63,160,0.08)' },
  chipStudyText:   { color: COLOURS.purple },
  chipClinical:    { backgroundColor: 'rgba(220,38,38,0.07)' },
  chipClinicalText:{ color: '#B91C1C' },
});

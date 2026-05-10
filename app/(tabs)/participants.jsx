/**
 * app/(tabs)/participants.jsx — Participant management
 *
 * Desktop: music-log split pattern. Scoring opens inline in the right panel.
 * Mobile/tablet: compact cards + FAB.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ScreenBackground    from '../../components/ScreenBackground';
import QuestionnaireRunner from '../../components/QuestionnaireRunner';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../../theme/responsive';
import { loadParticipants, addParticipant, deleteParticipant, saveResult, updateParticipant } from '../../storage/storage';
import { loadCustomQuestionnaires } from '../../storage/storage';
import { loadDisabledQs } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const formatDate  = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const interpColor = (q, score) => { try { return q.interpret(score).color; } catch { return COLOURS.textMuted; } };
const interpLabel = (q, score) => { try { return q.interpret(score).label; } catch { return '—'; } };
const fmtScore    = (score) => typeof score === 'object' ? '—' : String(score);

// ─── Desktop list row ─────────────────────────────────────────────────────────
function ParticipantRow({ p, selected, onPress, onDelete, totalQs }) {
  const n   = Object.keys(p.results ?? {}).length;
  const pct = totalQs > 0 ? n / totalQs : 0;
  const col = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <View style={{ marginBottom: 10 }}>
      <BlurView intensity={selected ? 52 : 36} tint="light" style={{ borderRadius: 14, overflow: 'hidden', shadowColor: selected ? 'rgba(74,123,181,0.22)' : 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: selected ? 7 : 3 }, shadowOpacity: 1, shadowRadius: selected ? 22 : 12, elevation: selected ? 5 : 2 }}>
        <View style={{ backgroundColor: selected ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.48)', flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: col, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{p.name.charAt(0).toUpperCase()}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: selected ? COLOURS.primary : COLOURS.primaryDark }}>{p.code ?? p.name}</Text>
              {p.name ? <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }} numberOfLines={1}>{p.name}</Text> : null}
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 }}>Added {formatDate(p.createdAt)} · {n} scored</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={selected ? COLOURS.primary : COLOURS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

// ─── Shared field helpers ─────────────────────────────────────────────────────
const LABEL = { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 2 };
const SEX_OPTIONS = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say'];

function FieldInput({ label, value, onChange, placeholder, multiline, keyboardType, required }) {
  return (
    <>
      <Text style={[LABEL, { marginTop: 14 }]}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={[af.input, multiline && { height: 72, textAlignVertical: 'top' }]}
        value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor={COLOURS.textMuted} multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
      />
    </>
  );
}

function SexPicker({ value, onChange }) {
  return (
    <>
      <Text style={[LABEL, { marginTop: 14 }]}>Sex</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {SEX_OPTIONS.filter(Boolean).map(opt => (
          <TouchableOpacity key={opt}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
              backgroundColor: value === opt ? COLOURS.primary : 'rgba(255,255,255,0.72)',
              borderColor: value === opt ? COLOURS.primary : 'rgba(74,123,181,0.2)' }}
            onPress={() => onChange(value === opt ? '' : opt)}>
            <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: value === opt ? '#fff' : COLOURS.primaryDark }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function SectionHeader({ title }) {
  return <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.10)', paddingBottom: 6 }}>{title}</Text>;
}

// ─── Add / Edit form ──────────────────────────────────────────────────────────
function ParticipantForm({ fields, setField, onSubmit, onCancel, submitting, isEdit }) {
  const addCustomField = () => setField('customFields', [...(fields.customFields ?? []), { label: '', value: '' }]);
  const updateCustomField = (i, key, val) => {
    const cf = [...(fields.customFields ?? [])];
    cf[i] = { ...cf[i], [key]: val };
    setField('customFields', cf);
  };
  const removeCustomField = (i) => setField('customFields', (fields.customFields ?? []).filter((_, idx) => idx !== i));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark, marginBottom: 4 }}>{isEdit ? 'Edit Participant' : 'New Participant'}</Text>

      <SectionHeader title="Identity" />
      <FieldInput label="Participant Code" value={fields.code} onChange={v => setField('code', v)} placeholder="e.g. P001" required />
      <FieldInput label="Name" value={fields.name} onChange={v => setField('name', v)} placeholder="Full name (optional)" />

      <SectionHeader title="Demographics" />
      <FieldInput label="Age" value={fields.age} onChange={v => setField('age', v)} placeholder="e.g. 34" keyboardType="numeric" />
      <SexPicker value={fields.sex} onChange={v => setField('sex', v)} />
      <FieldInput label="BMI" value={fields.bmi} onChange={v => setField('bmi', v)} placeholder="e.g. 24.5" keyboardType="numeric" />

      <SectionHeader title="Study" />
      <FieldInput label="Group / Condition" value={fields.group} onChange={v => setField('group', v)} placeholder="e.g. Control, Treatment A" />
      <FieldInput label="Site" value={fields.site} onChange={v => setField('site', v)} placeholder="e.g. London" />
      <FieldInput label="Session" value={fields.session} onChange={v => setField('session', v)} placeholder="e.g. Baseline, Week 4" />

      <SectionHeader title="Clinical" />
      <FieldInput label="Diagnosis" value={fields.diagnosis} onChange={v => setField('diagnosis', v)} placeholder="e.g. Insomnia disorder" />
      <FieldInput label="Medication" value={fields.medication} onChange={v => setField('medication', v)} placeholder="e.g. None" />
      <FieldInput label="Referral" value={fields.referral} onChange={v => setField('referral', v)} placeholder="e.g. GP, self-referred" />

      <SectionHeader title="Custom fields" />
      {(fields.customFields ?? []).map((cf, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'flex-start' }}>
          <TextInput style={[af.input, { flex: 1 }]} value={cf.label} onChangeText={v => updateCustomField(i, 'label', v)} placeholder="Label" placeholderTextColor={COLOURS.textMuted} />
          <TextInput style={[af.input, { flex: 2 }]} value={cf.value} onChangeText={v => updateCustomField(i, 'value', v)} placeholder="Value" placeholderTextColor={COLOURS.textMuted} />
          <TouchableOpacity onPress={() => removeCustomField(i)} style={{ width: 36, height: 42, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close-circle" size={18} color={COLOURS.danger} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addCustomField} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <Ionicons name="add-circle-outline" size={18} color={COLOURS.primary} />
        <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>Add field</Text>
      </TouchableOpacity>

      <FieldInput label="Notes" value={fields.notes} onChange={v => setField('notes', v)} placeholder="Any additional notes…" multiline />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
        {onCancel && (
          <TouchableOpacity style={{ flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(74,123,181,0.08)' }} onPress={onCancel}>
            <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary }}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLOURS.primary, borderRadius: 12, paddingVertical: 13, shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5 }, (!fields.code?.trim() || submitting) && { opacity: 0.4 }]}
          onPress={onSubmit} disabled={!fields.code?.trim() || submitting}>
          <Ionicons name={isEdit ? 'checkmark' : 'person-add'} size={17} color="#fff" />
          <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' }}>{submitting ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save' : 'Add Participant')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const af = StyleSheet.create({
  input: { backgroundColor: 'rgba(255,255,255,0.80)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, marginTop: 6 },
});

// ─── Right panel detail ───────────────────────────────────────────────────────
function DetailPanel({ p, onScore, onClose, onEdit, allQs }) {
  if (!p) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Ionicons name="person-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.35 }} />
      <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, opacity: 0.5, textAlign: 'center' }}>{'Select a participant\nor add a new one'}</Text>
      <Image source={require('../../assets/images/logo.png')} style={{ position: 'absolute', bottom: 24, right: 24, width: 120, height: 45, opacity: 0.25 }} resizeMode="contain" />
    </View>
  );
  const results  = p.results ?? {};
  const scored   = allQs.filter(q => results[q.id]);
  const unscored = allQs.filter(q => !results[q.id]);
  const pct = scored.length / allQs.length;
  const col = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 28, paddingBottom: 48 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, borderColor: col, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{p.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{p.code ?? p.name}</Text>
          {p.name ? <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }}>{p.name}</Text> : null}
          <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>Added {formatDate(p.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={18} color={COLOURS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(74,123,181,0.08)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="pencil-outline" size={16} color={COLOURS.primary} />
        </TouchableOpacity>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: '#DDE8F5', overflow: 'hidden', marginBottom: 6 }}>
        <View style={{ height: '100%', borderRadius: 3, width: `${pct * 100}%`, backgroundColor: col }} />
      </View>
      <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: col, marginBottom: 16 }}>{scored.length} of {allQs.length} scored</Text>

      {/* Participant metadata chips */}
      {(p.age || p.sex || p.bmi || p.group || p.site || p.session || p.diagnosis || p.medication || p.referral || p.notes || (p.customFields?.length > 0)) && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {p.age      ? <View style={dp.chip}><Text style={dp.chipText}>🗓 Age: {p.age}</Text></View> : null}
          {p.sex      ? <View style={dp.chip}><Text style={dp.chipText}>{p.sex}</Text></View> : null}
          {p.bmi      ? <View style={dp.chip}><Text style={dp.chipText}>BMI: {p.bmi}</Text></View> : null}
          {p.group    ? <View style={[dp.chip, dp.chipStudy]}><Text style={[dp.chipText, dp.chipStudyText]}>{p.group}</Text></View> : null}
          {p.site     ? <View style={[dp.chip, dp.chipStudy]}><Text style={[dp.chipText, dp.chipStudyText]}>{p.site}</Text></View> : null}
          {p.session  ? <View style={[dp.chip, dp.chipStudy]}><Text style={[dp.chipText, dp.chipStudyText]}>{p.session}</Text></View> : null}
          {p.diagnosis  ? <View style={[dp.chip, dp.chipClinical]}><Text style={[dp.chipText, dp.chipClinicalText]}>{p.diagnosis}</Text></View> : null}
          {p.medication ? <View style={[dp.chip, dp.chipClinical]}><Text style={[dp.chipText, dp.chipClinicalText]}>{p.medication}</Text></View> : null}
          {p.referral   ? <View style={[dp.chip, dp.chipClinical]}><Text style={[dp.chipText, dp.chipClinicalText]}>{p.referral}</Text></View> : null}
          {(p.customFields ?? []).map((cf, i) => cf.label ? <View key={i} style={dp.chip}><Text style={dp.chipText}>{cf.label}: {cf.value}</Text></View> : null)}
          {p.notes    ? <View style={dp.chip}><Text style={dp.chipText} numberOfLines={1}>📝 {p.notes}</Text></View> : null}
        </View>
      )}

      {scored.length > 0 && <>
        <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>RESULTS</Text>
        {scored.map(q => {
          const r = results[q.id]; const c = interpColor(q, r.score);
          return (
            <BlurView key={q.id} intensity={40} tint="light" style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 10, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 3 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.52)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 3, borderRadius: 2, alignSelf: 'stretch', backgroundColor: c }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>{q.title}</Text>
                  {(q.construct || q.domain) && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {q.construct && <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }}>{q.construct}</Text>}
                      {q.domain && <View style={{ backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>{q.domain}</Text></View>}
                    </View>
                  )}
                  <View style={{ alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: c + '18', borderColor: c }}>
                    <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: c }}>{fmtScore(r.score)} — {interpLabel(q, r.score)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={{ backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 }} onPress={() => onScore(q.id)}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLOURS.primary }}>Redo</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          );
        })}
      </>}

      {unscored.length > 0 && <>
        <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: scored.length > 0 ? 18 : 0 }}>SCORE NOW</Text>
        {unscored.map(q => (
          <TouchableOpacity key={q.id} onPress={() => onScore(q.id)} activeOpacity={0.8} style={{ marginBottom: 10 }}>
            <BlurView intensity={30} tint="light" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.38)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>{q.title}</Text>
                  {(q.construct || q.domain || q.timeframe) && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                      {q.construct && <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }}>{q.construct}</Text>}
                      {q.domain && <View style={{ backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.primary }}>{q.domain}</Text></View>}
                      {q.timeframe && <View style={{ backgroundColor: 'rgba(224,122,32,0.08)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.accent }}>{q.timeframe}</Text></View>}
                    </View>
                  )}
                  <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 3 }}>{q.shortTitle} · {q.items.length} items</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: COLOURS.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: '#fff' }}>Start</Text>
                  <Ionicons name="chevron-forward" size={13} color="#fff" />
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </>}
    </ScrollView>
  );
}

const dp = StyleSheet.create({
  chip:            { backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  chipText:        { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark },
  chipStudy:       { backgroundColor: 'rgba(107,63,160,0.08)' },
  chipStudyText:   { color: COLOURS.purple },
  chipClinical:    { backgroundColor: 'rgba(220,38,38,0.07)' },
  chipClinicalText:{ color: '#B91C1C' },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ParticipantsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const [participants, setParticipants] = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const EMPTY_FIELDS = { code: '', name: '', age: '', sex: '', bmi: '', group: '', site: '', session: '', diagnosis: '', medication: '', referral: '', notes: '', customFields: [] };
  const [newFields,    setNewFieldsState] = useState(EMPTY_FIELDS);
  const [editFields,   setEditFieldsState] = useState(EMPTY_FIELDS);
  const setNewField  = (k, v) => setNewFieldsState(f => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditFieldsState(f => ({ ...f, [k]: v }));
  const [showAdd,    setShowAdd]    = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [adding,     setAdding]     = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [scoringQid, setScoringQid] = useState(null);
  const [allQs,        setAllQs]        = useState(QUESTIONNAIRES);

  const load = useCallback(async () => {
    const [ps, customQs, disabledQs] = await Promise.all([loadParticipants(), loadCustomQuestionnaires(), loadDisabledQs()]);
    setParticipants(ps);
    setAllQs([...QUESTIONNAIRES, ...customQs].filter(q => !disabledQs.has(q.id)));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    if (!newFields.code.trim()) return;
    setAdding(true);
    await addParticipant(
      newFields.code, newFields.name,
      { age: newFields.age, sex: newFields.sex, bmi: newFields.bmi },
      { group: newFields.group, site: newFields.site, session: newFields.session },
      { diagnosis: newFields.diagnosis, medication: newFields.medication, referral: newFields.referral },
      newFields.customFields,
    );
    setNewFieldsState(EMPTY_FIELDS); setShowAdd(false); setAdding(false);
    load();
  };

  const handleEdit = (p) => {
    setEditFieldsState({ code: p.code ?? p.name ?? '', name: p.name ?? '', age: p.age ?? '', sex: p.sex ?? '', bmi: p.bmi ?? '', group: p.group ?? '', site: p.site ?? '', session: p.session ?? '', diagnosis: p.diagnosis ?? '', medication: p.medication ?? '', referral: p.referral ?? '', notes: p.notes ?? '', customFields: p.customFields ?? [] });
    setShowEdit(true); setShowAdd(false); setScoringQid(null);
  };
  const handleSaveEdit = async () => {
    if (!editFields.code.trim() || !selectedId) return;
    setSaving(true);
    await updateParticipant(selectedId, { code: editFields.code.trim(), name: editFields.name.trim(), age: editFields.age, sex: editFields.sex, bmi: editFields.bmi, group: editFields.group, site: editFields.site, session: editFields.session, diagnosis: editFields.diagnosis, medication: editFields.medication, referral: editFields.referral, notes: editFields.notes, customFields: editFields.customFields });
    await load();
    setSaving(false);
    setShowEdit(false);
  };

  const handleDelete = (p) => {
    const doDelete = async () => {
      await deleteParticipant(p.id);
      if (selectedId === p.id) { setSelectedId(null); setScoringQid(null); }
      load();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove "${p.name}" and all their scores? This cannot be undone.`)) doDelete();
    } else {
      Alert.alert('Delete participant', `Remove ${p.name} and all their scores?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const selected  = participants.find(p => p.id === selectedId) ?? null;
  const scoringQ  = allQs.find(q => q.id === scoringQid) ?? null;

  const handleScore = (qid) => setScoringQid(qid);
  const handleScoringComplete = async (answers, score) => {
    await saveResult(selectedId, scoringQid, answers, score);
    setScoringQid(null);
    load();
  };

  // ── Desktop ──────────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={{ flex: 1 }}>
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
            <ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 40, paddingLeft: SIDEBAR_TOTAL + 20, paddingRight: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 32, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Participants</Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: showAdd ? COLOURS.primary : 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: showAdd ? COLOURS.primary : 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: 'rgba(74,123,181,0.20)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 3 }}
                  onPress={() => { setShowAdd(!showAdd); setSelectedId(null); setScoringQid(null); }}
                >
                  <Ionicons name={showAdd ? 'close' : 'person-add-outline'} size={16} color={showAdd ? '#fff' : COLOURS.primary} />
                  <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: showAdd ? '#fff' : COLOURS.primary }}>{showAdd ? 'Cancel' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
              {participants.length === 0 && !showAdd && (
                <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
                  <Ionicons name="person-add-outline" size={36} color={COLOURS.textMuted} style={{ opacity: 0.5 }} />
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>No participants yet</Text>
                </View>
              )}
              {participants.map(p => (
                <ParticipantRow key={p.id} p={p}
                  selected={!showAdd && selectedId === p.id}
                  totalQs={allQs.length}
                  onPress={() => { setShowAdd(false); setScoringQid(null); setSelectedId(selectedId === p.id ? null : p.id); }}
                  onDelete={() => handleDelete(p)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Right col */}
          <View style={{ flex: 1, marginTop: 12, marginBottom: 12, marginRight: 12 }}>
            {showAdd ? (
              <View style={{ flex: 1 }}>
                <BlurView intensity={40} tint="light" style={{ flex: 1, overflow: 'hidden', margin: 12, borderRadius: 20, shadowColor: 'rgba(74,123,181,0.14)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 22, elevation: 5 }}>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.55)' }}>
                    <ParticipantForm fields={newFields} setField={setNewField} onSubmit={handleAdd} onCancel={() => { setShowAdd(false); setNewFieldsState(EMPTY_FIELDS); }} submitting={adding} />
                  </View>
                </BlurView>
              </View>
            ) : showEdit && selected ? (
              <View style={{ flex: 1 }}>
                <BlurView intensity={40} tint="light" style={{ flex: 1, overflow: 'hidden', margin: 12, borderRadius: 20, shadowColor: 'rgba(74,123,181,0.14)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 22, elevation: 5 }}>
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.55)' }}>
                    <ParticipantForm fields={editFields} setField={setEditField} onSubmit={handleSaveEdit} onCancel={() => setShowEdit(false)} submitting={saving} isEdit />
                  </View>
                </BlurView>
              </View>
            ) : scoringQ && selected ? (
              <QuestionnaireRunner
                questionnaire={scoringQ}
                onComplete={handleScoringComplete}
                onBack={() => setScoringQid(null)}
              />
            ) : (
              <DetailPanel
                p={selected}
                allQs={allQs}
                onScore={handleScore}
                onEdit={() => selected && handleEdit(selected)}
                onClose={() => { setSelectedId(null); setShowEdit(false); }}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  // ── Mobile / tablet ──────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Participants</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {participants.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 64, gap: 10 }}>
            <Ionicons name="person-add-outline" size={52} color={COLOURS.textMuted} />
            <Text style={{ fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>No participants yet</Text>
            <Text style={{ fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 }}>Add participants to begin scoring questionnaires.</Text>
          </View>
        ) : participants.map(p => {
          const scored = Object.keys(p.results ?? {});
          return (
            <TouchableOpacity key={p.id} style={ms.card} onPress={() => router.push(`/participant/${p.id}`)} activeOpacity={0.85}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{p.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>{p.code ?? p.name}</Text>
                  {p.name ? <Text style={{ fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }} numberOfLines={1}>{p.name}</Text> : null}
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 }}>Added {formatDate(p.createdAt)} · {scored.length} scored</Text>
                </View>
                <TouchableOpacity style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)', alignItems: 'center', justifyContent: 'center' }} onPress={(e) => { e.stopPropagation(); handleDelete(p); }}>
                  <Ionicons name="trash-outline" size={18} color={COLOURS.danger} />
                </TouchableOpacity>
              </View>
              {scored.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {scored.map(qid => {
                    const q = allQs.find(q => q.id === qid);
                    return q ? <View key={qid} style={{ backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}><Text style={{ fontSize: 12, fontFamily: FONTS.body, color: COLOURS.primary }}>{q.shortTitle}</Text></View> : null;
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[ms.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add" size={22} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScreenBackground />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Add Participant</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Ionicons name="close" size={26} color={COLOURS.primaryDark} /></TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 4, flex: 1 }}>
            <ParticipantForm fields={newFields} setField={setNewField} onSubmit={handleAdd} submitting={adding} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const ms = StyleSheet.create({
  card: { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, gap: 10 },
  fab:  {
    position: 'absolute',
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLOURS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(74,123,181,0.45)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
});

/**
 * app/(tabs)/participants.jsx — Participant management
 *
 * Desktop: 2-column split panel (music-log pattern)
 *   Left  — participant list with glass background card, selectable rows
 *   Right — add form OR participant detail depending on selection
 *
 * Mobile/tablet: tab bar + compact cards + modal sheet for add
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ScreenBackground  from '../../components/ScreenBackground';
import DesktopBackground from '../../components/DesktopBackground';
import DesktopSidebar    from '../../components/DesktopSidebar';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_W } from '../../theme/responsive';
import { loadParticipants, addParticipant, deleteParticipant } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const interpColor = (q, score) => { try { return q.interpret(score).color; } catch { return COLOURS.textMuted; } };
const interpLabel = (q, score) => { try { return q.interpret(score).label; } catch { return '—'; } };
const fmtScore    = (score) => typeof score === 'object' ? '—' : String(score);

// ─── Selectable participant row ───────────────────────────────────────────────
function ParticipantRow({ p, selected, onPress, onDelete }) {
  const resultCount = Object.keys(p.results ?? {}).length;
  const pct         = resultCount / QUESTIONNAIRES.length;
  const ringColor   = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginBottom: 10 }}>
      <BlurView intensity={selected ? 52 : 36} tint="light"
        style={[pr.blur, selected && pr.blurSel]}>
        <View style={[pr.inner, selected && pr.innerSel]}>
          <View style={[pr.ring, { borderColor: ringColor }]}>
            <View style={pr.avatar}>
              <Text style={pr.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[pr.name, selected && { color: COLOURS.primary }]}>{p.name}</Text>
            {p.notes ? <Text style={pr.notes} numberOfLines={1}>{p.notes}</Text> : null}
            <Text style={pr.meta}>Added {formatDate(p.createdAt)} · {resultCount}/{QUESTIONNAIRES.length} scored</Text>
          </View>
          <TouchableOpacity onPress={onDelete} style={pr.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={15} color={selected ? COLOURS.primary : COLOURS.textMuted} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}
const pr = StyleSheet.create({
  blur:    { borderRadius: 14, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  blurSel: { shadowColor: 'rgba(74,123,181,0.20)', shadowOffset: { width: 0, height: 7 }, shadowRadius: 22, elevation: 5 },
  inner:   { backgroundColor: 'rgba(255,255,255,0.48)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  innerSel:{ backgroundColor: 'rgba(255,255,255,0.70)' },
  ring:    { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatar:  { width: 36, height: 36, borderRadius: 18, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:    { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:   { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  meta:    { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center' },
});

// ─── Add form ─────────────────────────────────────────────────────────────────
function AddForm({ name, notes, onName, onNotes, onSubmit, onCancel, adding }) {
  return (
    <View style={af.wrap}>
      <Text style={af.title}>New Participant</Text>
      <Text style={af.label}>Name *</Text>
      <TextInput
        style={af.input}
        placeholder="Participant name or ID"
        placeholderTextColor={COLOURS.textMuted}
        value={name}
        onChangeText={onName}
        returnKeyType="next"
        autoFocus
      />
      <Text style={[af.label, { marginTop: 14 }]}>Notes (optional)</Text>
      <TextInput
        style={[af.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="e.g. Group A, session date…"
        placeholderTextColor={COLOURS.textMuted}
        value={notes}
        onChangeText={onNotes}
        multiline
      />
      <View style={af.btnRow}>
        {onCancel && (
          <TouchableOpacity style={af.cancelBtn} onPress={onCancel}>
            <Text style={af.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[af.confirmBtn, (!name.trim() || adding) && { opacity: 0.4 }, onCancel && { flex: 1 }]}
          onPress={onSubmit}
          disabled={!name.trim() || adding}
        >
          <Ionicons name="person-add" size={17} color="#fff" />
          <Text style={af.confirmText}>Add Participant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const af = StyleSheet.create({
  wrap:       { padding: 24, gap: 4 },
  title:      { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark, marginBottom: 16 },
  label:      { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6 },
  input:      { backgroundColor: 'rgba(255,255,255,0.80)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, marginTop: 6, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  btnRow:     { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn:  { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(74,123,181,0.08)' },
  cancelText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary },
  confirmBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLOURS.primary, borderRadius: 12, paddingVertical: 13 },
  confirmText:{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

// ─── Right panel: participant detail ─────────────────────────────────────────
function ParticipantDetail({ p, onScore, onClose }) {
  if (!p) return (
    <View style={pd.empty}>
      <Ionicons name="person-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.4 }} />
      <Text style={pd.emptyText}>Select a participant{'\n'}or add a new one</Text>
    </View>
  );

  const results  = p.results ?? {};
  const scored   = QUESTIONNAIRES.filter((q) => results[q.id]);
  const unscored = QUESTIONNAIRES.filter((q) => !results[q.id]);
  const pct      = scored.length / QUESTIONNAIRES.length;
  const ringColor = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pd.scroll}>
      {/* Header */}
      <View style={pd.header}>
        <View style={[pd.ring, { borderColor: ringColor }]}>
          <View style={pd.avatar}>
            <Text style={pd.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={pd.name}>{p.name}</Text>
          {p.notes ? <Text style={pd.notes}>{p.notes}</Text> : null}
          <Text style={pd.meta}>Added {formatDate(p.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={pd.closeBtn}>
          <Ionicons name="close" size={17} color={COLOURS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={pd.progressTrack}>
        <View style={[pd.progressFill, { width: `${pct * 100}%`, backgroundColor: ringColor }]} />
      </View>
      <Text style={[pd.progressLabel, { color: ringColor }]}>
        {scored.length} of {QUESTIONNAIRES.length} questionnaires scored
      </Text>

      {/* Scores */}
      {scored.length > 0 && (
        <>
          <Text style={pd.sectionLabel}>RESULTS</Text>
          {scored.map((q) => {
            const r     = results[q.id];
            const color = interpColor(q, r.score);
            const label = interpLabel(q, r.score);
            return (
              <BlurView key={q.id} intensity={40} tint="light" style={pd.glassCard}>
                <View style={pd.glassInner}>
                  <View style={[pd.accentBar, { backgroundColor: color }]} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={pd.qTitle}>{q.title}</Text>
                    <View style={[pd.badge, { backgroundColor: color + '18', borderColor: color }]}>
                      <Text style={[pd.badgeText, { color }]}>{fmtScore(r.score)} — {label}</Text>
                    </View>
                    <Text style={pd.resultDate}>{formatDate(r.completedAt)}</Text>
                  </View>
                  <TouchableOpacity style={pd.redoBtn} onPress={() => onScore(q.id)}>
                    <Text style={pd.redoBtnText}>Redo</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            );
          })}
        </>
      )}

      {/* Score now */}
      {unscored.length > 0 && (
        <>
          <Text style={[pd.sectionLabel, { marginTop: scored.length > 0 ? 18 : 0 }]}>SCORE NOW</Text>
          {unscored.map((q) => (
            <TouchableOpacity key={q.id} onPress={() => onScore(q.id)} activeOpacity={0.8} style={{ marginBottom: 10 }}>
              <BlurView intensity={30} tint="light" style={pd.unscoredCard}>
                <View style={pd.unscoredInner}>
                  <View style={{ flex: 1 }}>
                    <Text style={pd.qTitle}>{q.title}</Text>
                    <Text style={pd.qMeta}>{q.shortTitle} · {q.items.length} items</Text>
                  </View>
                  <View style={pd.startBtn}>
                    <Text style={pd.startBtnText}>Start</Text>
                    <Ionicons name="chevron-forward" size={13} color={COLOURS.primary} />
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}
const pd = StyleSheet.create({
  scroll:        { padding: 24, paddingBottom: 48 },
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText:     { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textAlign: 'center', opacity: 0.6, lineHeight: 26 },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  ring:          { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatar:        { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:          { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  notes:         { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  meta:          { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  closeBtn:      { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#DDE8F5', overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 12, fontFamily: FONTS.bodyMedium, marginTop: 6, marginBottom: 6 },
  sectionLabel:  { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  glassCard:     { borderRadius: 14, overflow: 'hidden', marginBottom: 10, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 3 },
  glassInner:    { backgroundColor: 'rgba(255,255,255,0.52)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  accentBar:     { width: 3, borderRadius: 2, alignSelf: 'stretch' },
  badge:         { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText:     { fontSize: 13, fontFamily: FONTS.body },
  resultDate:    { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  redoBtn:       { backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  redoBtnText:   { fontSize: 13, fontFamily: FONTS.body, color: COLOURS.primary },
  qTitle:        { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  qMeta:         { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  unscoredCard:  { borderRadius: 14, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 1 },
  unscoredInner: { backgroundColor: 'rgba(255,255,255,0.38)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  startBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  startBtnText:  { fontSize: 13, fontFamily: FONTS.body, color: COLOURS.primary },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ParticipantsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isDesktop } = useLayout();

  const [participants, setParticipants] = useState([]);
  const [selectedId, setSelectedId]     = useState(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [newName, setNewName]           = useState('');
  const [newNotes, setNewNotes]         = useState('');
  const [adding, setAdding]             = useState(false);

  const load = useCallback(async () => { setParticipants(await loadParticipants()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await addParticipant(newName, newNotes);
    setNewName(''); setNewNotes(''); setShowAdd(false); setAdding(false);
    load();
  };

  const handleDelete = (p) => {
    Alert.alert('Delete participant', `Remove ${p.name} and all their scores? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteParticipant(p.id);
        if (selectedId === p.id) setSelectedId(null);
        load();
      }},
    ]);
  };

  const selectedParticipant = participants.find((p) => p.id === selectedId) ?? null;

  // ── Desktop two-column split ─────────────────────────────────────────────────
  if (isDesktop) {
    const SIDEBAR_TOTAL = SIDEBAR_W + 32;
    return (
      <View style={{ flex: 1 }}>
        <DesktopBackground />

        <View style={[ds.root, { paddingTop: insets.top }]}>
          {/* Sidebar */}
          <View style={{ width: SIDEBAR_TOTAL }}>
            <DesktopSidebar
              activeTab="participants"
              onNavigate={(tab) => {
                if (tab === 'dashboard')      router.push('/(tabs)');
                if (tab === 'questionnaires') router.push('/(tabs)/questionnaires');
              }}
              onExport={() => router.push('/export')}
            />
          </View>

          {/* Left panel */}
          <View style={ds.leftCol}>
            <View style={ds.leftBg} />
            <ScrollView contentContainerStyle={ds.leftScroll} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={ds.leftHeader}>
                <Text style={ds.panelTitle}>Participants</Text>
                <TouchableOpacity
                  style={[ds.addBtn, showAdd && { backgroundColor: 'rgba(74,123,181,0.15)' }]}
                  onPress={() => { setShowAdd(!showAdd); setSelectedId(null); }}
                >
                  <Ionicons name={showAdd ? 'close' : 'add'} size={18} color={COLOURS.primary} />
                  <Text style={ds.addBtnText}>{showAdd ? 'Cancel' : 'Add'}</Text>
                </TouchableOpacity>
              </View>

              {participants.length === 0 && !showAdd && (
                <View style={ds.empty}>
                  <Ionicons name="person-add-outline" size={36} color={COLOURS.textMuted} style={{ opacity: 0.5 }} />
                  <Text style={ds.emptyText}>No participants yet</Text>
                </View>
              )}

              {participants.map((p) => (
                <ParticipantRow
                  key={p.id}
                  p={p}
                  selected={!showAdd && selectedId === p.id}
                  onPress={() => { setShowAdd(false); setSelectedId(selectedId === p.id ? null : p.id); }}
                  onDelete={(e) => { e?.stopPropagation?.(); handleDelete(p); }}
                />
              ))}
            </ScrollView>
          </View>

          {/* Right panel */}
          <View style={ds.rightCol}>
            {showAdd ? (
              <BlurView intensity={40} tint="light" style={ds.addFormCard}>
                <AddForm
                  name={newName} notes={newNotes}
                  onName={setNewName} onNotes={setNewNotes}
                  onSubmit={handleAdd}
                  onCancel={() => { setShowAdd(false); setNewName(''); setNewNotes(''); }}
                  adding={adding}
                />
              </BlurView>
            ) : (
              <ParticipantDetail
                p={selectedParticipant}
                onScore={(qid) => selectedParticipant && router.push(`/score/${selectedParticipant.id}/${qid}`)}
                onClose={() => setSelectedId(null)}
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
      <View style={[ms.header, { paddingTop: insets.top + 16 }]}>
        <Text style={ms.title}>Participants</Text>
        <TouchableOpacity style={ms.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[ms.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        {participants.length === 0 ? (
          <View style={ms.empty}>
            <Ionicons name="person-add-outline" size={52} color={COLOURS.textMuted} />
            <Text style={ms.emptyTitle}>No participants yet</Text>
            <Text style={ms.emptyBody}>Add participants to begin scoring questionnaires.</Text>
          </View>
        ) : participants.map((p) => {
          const scored = Object.keys(p.results ?? {});
          return (
            <TouchableOpacity key={p.id} style={ms.card} onPress={() => router.push(`/participant/${p.id}`)} activeOpacity={0.85}>
              <View style={ms.cardRow}>
                <View style={ms.avatar}>
                  <Text style={ms.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ms.name}>{p.name}</Text>
                  {p.notes ? <Text style={ms.notes} numberOfLines={1}>{p.notes}</Text> : null}
                  <Text style={ms.meta}>Added {formatDate(p.createdAt)} · {scored.length} scored</Text>
                </View>
                <TouchableOpacity style={ms.deleteBtn} onPress={() => handleDelete(p)}>
                  <Ionicons name="trash-outline" size={18} color={COLOURS.danger} />
                </TouchableOpacity>
              </View>
              {scored.length > 0 && (
                <View style={ms.chips}>
                  {scored.map((qid) => {
                    const q = QUESTIONNAIRES.find((q) => q.id === qid);
                    return q ? (
                      <View key={qid} style={ms.chip}>
                        <Text style={ms.chipText}>{q.shortTitle}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScreenBackground />
          <View style={[ms.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={ms.modalTitle}>Add Participant</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Ionicons name="close" size={26} color={COLOURS.primaryDark} />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 4 }}>
            <AddForm
              name={newName} notes={newNotes}
              onName={setNewName} onNotes={setNewNotes}
              onSubmit={handleAdd} adding={adding}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const PANEL_MARGIN = 12;

const ds = StyleSheet.create({
  root:       { flex: 1, flexDirection: 'row' },
  leftCol:    { flex: 1, margin: PANEL_MARGIN, marginRight: PANEL_MARGIN / 2, position: 'relative' },
  leftBg:     {
    position: 'absolute', inset: 0,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.28)',
    shadowColor: 'rgba(74,123,181,0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 2,
  },
  leftScroll: { paddingTop: 24, paddingBottom: 40, paddingHorizontal: 20 },
  leftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  panelTitle: { fontSize: 32, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  addBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontSize: 14, fontFamily: FONTS.body, color: COLOURS.primary },
  rightCol:   { flex: 1, margin: PANEL_MARGIN, marginLeft: PANEL_MARGIN / 2 },
  addFormCard:{ borderRadius: 20, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.14)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 22, elevation: 5, margin: 24, backgroundColor: 'rgba(255,255,255,0.55)' },
  empty:      { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText:  { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
});

const ms = StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title:      { fontSize: SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  addBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primary, alignItems: 'center', justifyContent: 'center' },
  content:    { paddingHorizontal: 16, gap: 10 },
  card:       { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, gap: 10 },
  cardRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:     { width: 46, height: 46, borderRadius: 23, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:       { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:      { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  meta:       { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  deleteBtn:  { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)', alignItems: 'center', justifyContent: 'center' },
  chips:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:       { backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  chipText:   { fontSize: 12, fontFamily: FONTS.body, color: COLOURS.primary },
  empty:      { alignItems: 'center', paddingVertical: 64, gap: 10 },
  emptyTitle: { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  emptyBody:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 },
  modalHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  modalTitle: { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
});

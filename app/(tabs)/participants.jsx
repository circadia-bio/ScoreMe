/**
 * app/(tabs)/participants.jsx — Participant management
 *
 * Responsive:
 *   mobile/tablet → modal sheet for add
 *   desktop       → DesktopLayout sidebar + inline split panel (list | add form)
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenBackground from '../../components/ScreenBackground';
import DesktopLayout    from '../../components/DesktopLayout';
import GlassCard        from '../../components/GlassCard';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout } from '../../theme/responsive';
import { loadParticipants, addParticipant, deleteParticipant } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// ─── Shared add form ──────────────────────────────────────────────────────────
function AddForm({ name, notes, onName, onNotes, onSubmit, onCancel, adding, isDesktop }) {
  return (
    <View style={[af.wrap, isDesktop && af.desktopWrap]}>
      <Text style={af.title}>Add Participant</Text>

      <Text style={af.label}>Name *</Text>
      <TextInput
        style={af.input}
        placeholder="Participant name or ID"
        placeholderTextColor={COLOURS.textMuted}
        value={name}
        onChangeText={onName}
        returnKeyType="next"
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
          <Ionicons name="person-add" size={18} color="#fff" />
          <Text style={af.confirmText}>Add Participant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const af = StyleSheet.create({
  wrap:        { gap: 4 },
  desktopWrap: { gap: 6 },
  title:       { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark, marginBottom: 12 },
  label:       { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6 },
  input:       { backgroundColor: 'rgba(255,255,255,0.80)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, marginTop: 6, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  btnRow:      { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn:   { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(74,123,181,0.08)' },
  cancelText:  { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary },
  confirmBtn:  { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLOURS.primary, borderRadius: 12, paddingVertical: 14 },
  confirmText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

// ─── Participant row (desktop) ────────────────────────────────────────────────
function DesktopParticipantRow({ p, onPress, onDelete }) {
  const scored = Object.keys(p.results ?? {}).length;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={dpr.row}>
        <View style={dpr.avatar}>
          <Text style={dpr.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={dpr.name}>{p.name}</Text>
          {p.notes ? <Text style={dpr.notes} numberOfLines={1}>{p.notes}</Text> : null}
          <Text style={dpr.meta}>Added {formatDate(p.createdAt)} · {scored} questionnaire{scored !== 1 ? 's' : ''} scored</Text>
        </View>
        {scored > 0 && (
          <View style={dpr.chips}>
            {QUESTIONNAIRES.filter((q) => p.results?.[q.id]).map((q) => (
              <View key={q.id} style={dpr.chip}>
                <Text style={dpr.chipText}>{q.shortTitle}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity onPress={onDelete} style={dpr.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={COLOURS.danger} />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={16} color={COLOURS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
const dpr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 4 },
  avatar:  { width: 42, height: 42, borderRadius: 21, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:    { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:   { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  meta:    { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 5, maxWidth: 220 },
  chip:    { backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 2 },
  chipText:{ fontSize: 11, fontFamily: FONTS.body, color: COLOURS.primary },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center' },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ParticipantsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isDesktop } = useLayout();

  const [participants, setParticipants] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setParticipants(await loadParticipants());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await addParticipant(newName, newNotes);
    setNewName(''); setNewNotes(''); setShowAdd(false); setAdding(false);
    load();
  };

  const handleDelete = (p) => {
    Alert.alert(
      'Delete participant',
      `Remove ${p.name} and all their scores? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteParticipant(p.id); load(); } },
      ]
    );
  };

  // ── Desktop layout ──────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <View style={{ flex: 1 }}>
        <DesktopLayout
          activeTab="participants"
          onNavigate={(tab) => {
            if (tab === 'dashboard')      router.push('/(tabs)');
            if (tab === 'questionnaires') router.push('/(tabs)/questionnaires');
          }}
          onExport={() => router.push('/export')}
        >
          {/* Page header */}
          <View style={ds.pageHeader}>
            <Text style={ds.pageTitle}>Participants</Text>
            <TouchableOpacity style={ds.addBtn} onPress={() => setShowAdd(!showAdd)}>
              <Ionicons name={showAdd ? 'close' : 'add'} size={20} color="#fff" />
              <Text style={ds.addBtnText}>{showAdd ? 'Cancel' : 'Add participant'}</Text>
            </TouchableOpacity>
          </View>

          {/* Split: form (when open) + list */}
          <View style={ds.splitRow}>
            {/* List panel */}
            <View style={{ flex: 1 }}>
              {participants.length === 0 ? (
                <GlassCard>
                  <View style={ds.empty}>
                    <Ionicons name="people-outline" size={40} color={COLOURS.textMuted} />
                    <Text style={ds.emptyText}>No participants yet</Text>
                  </View>
                </GlassCard>
              ) : (
                <GlassCard padding={0} style={{ overflow: 'hidden' }}>
                  {participants.map((p, i) => (
                    <View key={p.id}>
                      <View style={{ paddingHorizontal: 20 }}>
                        <DesktopParticipantRow
                          p={p}
                          onPress={() => router.push(`/participant/${p.id}`)}
                          onDelete={() => handleDelete(p)}
                        />
                      </View>
                      {i < participants.length - 1 && <View style={ds.divider} />}
                    </View>
                  ))}
                </GlassCard>
              )}
            </View>

            {/* Add form panel — slides in */}
            {showAdd && (
              <View style={ds.formPanel}>
                <GlassCard>
                  <AddForm
                    name={newName} notes={newNotes}
                    onName={setNewName} onNotes={setNewNotes}
                    onSubmit={handleAdd} onCancel={() => setShowAdd(false)}
                    adding={adding} isDesktop
                  />
                </GlassCard>
              </View>
            )}
          </View>
        </DesktopLayout>
      </View>
    );
  }

  // ── Mobile / tablet layout ──────────────────────────────────────────────────
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
        ) : (
          participants.map((p) => {
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
                    <Text style={ms.meta}>Added {formatDate(p.createdAt)} · {scored.length} questionnaire{scored.length !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={ms.actions}>
                    <TouchableOpacity style={ms.scoreBtn} onPress={() => router.push(`/participant/${p.id}`)}>
                      <Text style={ms.scoreBtnText}>Score</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ms.deleteBtn} onPress={() => handleDelete(p)}>
                      <Ionicons name="trash-outline" size={18} color={COLOURS.danger} />
                    </TouchableOpacity>
                  </View>
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
          })
        )}
      </ScrollView>

      {/* Add modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScreenBackground />
          <View style={[ms.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={ms.modalTitle}>Add Participant</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Ionicons name="close" size={26} color={COLOURS.primaryDark} />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
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

const ds = StyleSheet.create({
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle:  { fontSize: 36, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  addBtn:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLOURS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  addBtnText: { fontSize: SIZES.label, fontFamily: FONTS.body, color: '#fff' },
  splitRow:   { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  formPanel:  { width: 340 },
  divider:    { height: 1, backgroundColor: 'rgba(74,123,181,0.07)', marginHorizontal: 20 },
  empty:      { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyText:  { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
});

const ms = StyleSheet.create({
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title:   { fontSize: SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  addBtn:  { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primary, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, gap: 10 },
  card:    { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, gap: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:  { width: 46, height: 46, borderRadius: 23, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:    { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:   { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  meta:    { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  scoreBtn:{ backgroundColor: 'rgba(74,123,181,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  scoreBtnText: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  deleteBtn:{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)', alignItems: 'center', justifyContent: 'center' },
  chips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:    { backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  chipText:{ fontSize: 12, fontFamily: FONTS.body, color: COLOURS.primary },
  empty:      { alignItems: 'center', paddingVertical: 64, gap: 10 },
  emptyTitle: { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  emptyBody:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  modalTitle:   { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
});

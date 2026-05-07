/**
 * app/(tabs)/participants.jsx — Participant management
 *
 * List, add, edit, and delete participants. Tap a participant to go to
 * their detail/scoring screen.
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
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { loadParticipants, addParticipant, deleteParticipant } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export default function ParticipantsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [participants, setParticipants] = useState([]);
  const [showAdd, setShowAdd]           = useState(false);
  const [newName, setNewName]           = useState('');
  const [newNotes, setNewNotes]         = useState('');
  const [adding, setAdding]             = useState(false);

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

  return (
    <View style={s.root}>
      <ScreenBackground />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <Text style={s.title}>Participants</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        {participants.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="person-add-outline" size={52} color={COLOURS.textMuted} />
            <Text style={s.emptyTitle}>No participants yet</Text>
            <Text style={s.emptyBody}>Add participants to begin scoring questionnaires.</Text>
          </View>
        ) : (
          participants.map((p) => {
            const scored = Object.keys(p.results ?? {});
            return (
              <TouchableOpacity key={p.id} style={s.card} onPress={() => router.push(`/participant/${p.id}`)} activeOpacity={0.85}>
                <View style={s.cardRow}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{p.name}</Text>
                    {p.notes ? <Text style={s.notes} numberOfLines={1}>{p.notes}</Text> : null}
                    <Text style={s.meta}>Added {formatDate(p.createdAt)} · {scored.length} questionnaire{scored.length !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={s.actions}>
                    <TouchableOpacity style={s.scoreBtn} onPress={() => router.push(`/participant/${p.id}`)}>
                      <Text style={s.scoreBtnText}>Score</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(p)}>
                      <Ionicons name="trash-outline" size={18} color={COLOURS.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                {scored.length > 0 && (
                  <View style={s.qChips}>
                    {scored.map((qid) => {
                      const q = QUESTIONNAIRES.find((q) => q.id === qid);
                      if (!q) return null;
                      return (
                        <View key={qid} style={s.qChip}>
                          <Text style={s.qChipText}>{q.shortTitle}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add participant modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalRoot}>
          <ScreenBackground />
          <View style={[s.modalHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={s.modalTitle}>Add Participant</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Ionicons name="close" size={26} color={COLOURS.primaryDark} />
            </TouchableOpacity>
          </View>
          <View style={s.modalContent}>
            <Text style={s.fieldLabel}>Name *</Text>
            <TextInput
              style={s.input}
              placeholder="Participant name or ID"
              placeholderTextColor={COLOURS.textMuted}
              value={newName}
              onChangeText={setNewName}
              returnKeyType="next"
            />
            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Notes (optional)</Text>
            <TextInput
              style={[s.input, { height: 88, textAlignVertical: 'top' }]}
              placeholder="e.g. Group A, session date…"
              placeholderTextColor={COLOURS.textMuted}
              value={newNotes}
              onChangeText={setNewNotes}
              multiline
            />
            <TouchableOpacity
              style={[s.confirmBtn, (!newName.trim() || adding) && { opacity: 0.4 }]}
              onPress={handleAdd}
              disabled={!newName.trim() || adding}
            >
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={s.confirmBtnText}>Add Participant</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
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
  qChips:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  qChip:   { backgroundColor: 'rgba(74,123,181,0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  qChipText: { fontSize: 12, fontFamily: FONTS.body, color: COLOURS.primary },

  emptyState: { alignItems: 'center', paddingVertical: 64, gap: 10 },
  emptyTitle: { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  emptyBody:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 },

  // Modal
  modalRoot:    { flex: 1 },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  modalTitle:   { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  modalContent: { paddingHorizontal: 20, paddingTop: 16, gap: 4 },
  fieldLabel:   { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6 },
  input:        { backgroundColor: COLOURS.cardBg, borderRadius: 12, borderWidth: 1, borderColor: COLOURS.cardBorder, paddingHorizontal: 16, paddingVertical: 14, fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, marginTop: 6 },
  confirmBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLOURS.primary, borderRadius: 14, paddingVertical: 16, marginTop: 28 },
  confirmBtnText:{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

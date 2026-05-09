/**
 * app/(tabs)/participants.jsx — Participant management
 *
 * Desktop: music-log split pattern. Scoring opens inline in the right panel.
 * Mobile/tablet: compact cards + modal sheet.
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

import ScreenBackground    from '../../components/ScreenBackground';
import QuestionnaireRunner from '../../components/QuestionnaireRunner';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../../theme/responsive';
import { loadParticipants, addParticipant, deleteParticipant, saveResult } from '../../storage/storage';
import { loadCustomQuestionnaires } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const formatDate  = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const interpColor = (q, score) => { try { return q.interpret(score).color; } catch { return COLOURS.textMuted; } };
const interpLabel = (q, score) => { try { return q.interpret(score).label; } catch { return '—'; } };
const fmtScore    = (score) => typeof score === 'object' ? '—' : String(score);

// ─── Desktop list row ─────────────────────────────────────────────────────────
function ParticipantRow({ p, selected, onPress, onDelete }) {
  const n   = Object.keys(p.results ?? {}).length;
  const pct = n / QUESTIONNAIRES.length;
  const col = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginBottom: 10 }}>
      <BlurView intensity={selected ? 52 : 36} tint="light" style={{ borderRadius: 14, overflow: 'hidden', shadowColor: selected ? 'rgba(74,123,181,0.22)' : 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: selected ? 7 : 3 }, shadowOpacity: 1, shadowRadius: selected ? 22 : 12, elevation: selected ? 5 : 2 }}>
        <View style={{ backgroundColor: selected ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.48)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: col, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: selected ? COLOURS.primary : COLOURS.primaryDark }}>{p.name}</Text>
            {p.notes ? <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }} numberOfLines={1}>{p.notes}</Text> : null}
            <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 }}>Added {formatDate(p.createdAt)} · {n} scored</Text>
          </View>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(220,38,38,0.08)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="trash-outline" size={15} color={COLOURS.danger} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={15} color={selected ? COLOURS.primary : COLOURS.textMuted} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

// ─── Add form ─────────────────────────────────────────────────────────────────
function AddForm({ name, notes, onName, onNotes, onSubmit, onCancel, adding }) {
  return (
    <View style={{ padding: 24, gap: 4 }}>
      <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark, marginBottom: 16 }}>New Participant</Text>
      <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6 }}>Name *</Text>
      <TextInput style={af.input} placeholder="Participant name or ID" placeholderTextColor={COLOURS.textMuted} value={name} onChangeText={onName} returnKeyType="next" autoFocus />
      <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14 }}>Notes (optional)</Text>
      <TextInput style={[af.input, { height: 80, textAlignVertical: 'top' }]} placeholder="e.g. Group A, session date…" placeholderTextColor={COLOURS.textMuted} value={notes} onChangeText={onNotes} multiline />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
        {onCancel && <TouchableOpacity style={{ flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(74,123,181,0.08)' }} onPress={onCancel}><Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary }}>Cancel</Text></TouchableOpacity>}
        <TouchableOpacity style={[{ flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLOURS.primary, borderRadius: 12, paddingVertical: 13 }, (!name.trim() || adding) && { opacity: 0.4 }, onCancel && { flex: 1 }]} onPress={onSubmit} disabled={!name.trim() || adding}>
          <Ionicons name="person-add" size={17} color="#fff" />
          <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' }}>Add Participant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const af = StyleSheet.create({
  input: { backgroundColor: 'rgba(255,255,255,0.80)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, marginTop: 6 },
});

// ─── Right panel detail ───────────────────────────────────────────────────────
function DetailPanel({ p, onScore, onClose, allQs }) {
  if (!p) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Ionicons name="person-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.35 }} />
      <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, opacity: 0.5, textAlign: 'center' }}>Select a participant{'\n'}or add a new one</Text>
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
          <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{p.name}</Text>
          {p.notes ? <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }}>{p.notes}</Text> : null}
          <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>Added {formatDate(p.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={18} color={COLOURS.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: '#DDE8F5', overflow: 'hidden', marginBottom: 6 }}>
        <View style={{ height: '100%', borderRadius: 3, width: `${pct * 100}%`, backgroundColor: col }} />
      </View>
      <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: col, marginBottom: 16 }}>{scored.length} of {allQs.length} scored</Text>

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
                <TouchableOpacity style={{ backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }} onPress={() => onScore(q.id)}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.body, color: COLOURS.primary }}>Start</Text>
                  <Ionicons name="chevron-forward" size={13} color={COLOURS.primary} />
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </>}
    </ScrollView>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ParticipantsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const [participants, setParticipants] = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [scoringQid,   setScoringQid]   = useState(null); // desktop inline scoring
  const [newName,      setNewName]      = useState('');
  const [newNotes,     setNewNotes]     = useState('');
  const [adding,       setAdding]       = useState(false);

  const [allQs,        setAllQs]       = useState(QUESTIONNAIRES);

  const load = useCallback(async () => {
    const [ps, customQs] = await Promise.all([loadParticipants(), loadCustomQuestionnaires()]);
    setParticipants(ps);
    setAllQs([...QUESTIONNAIRES, ...customQs]);
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
    Alert.alert('Delete participant', `Remove ${p.name} and all their scores?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteParticipant(p.id);
        if (selectedId === p.id) { setSelectedId(null); setScoringQid(null); }
        load();
      }},
    ]);
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
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: showAdd ? 'rgba(74,123,181,0.18)' : 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
                  onPress={() => { setShowAdd(!showAdd); setSelectedId(null); setScoringQid(null); }}
                >
                  <Ionicons name={showAdd ? 'close' : 'add'} size={18} color={COLOURS.primary} />
                  <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: COLOURS.primary }}>{showAdd ? 'Cancel' : 'Add'}</Text>
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
                  onPress={() => { setShowAdd(false); setScoringQid(null); setSelectedId(selectedId === p.id ? null : p.id); }}
                  onDelete={() => handleDelete(p)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Right col — add form / runner / detail */}
          <View style={{ flex: 1, marginTop: 12, marginBottom: 12, marginRight: 12 }}>
            {showAdd ? (
              <View style={{ padding: 28 }}>
                <BlurView intensity={40} tint="light" style={{ borderRadius: 20, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.14)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 22, elevation: 5 }}>
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}>
                    <AddForm name={newName} notes={newNotes} onName={setNewName} onNotes={setNewNotes}
                      onSubmit={handleAdd} onCancel={() => { setShowAdd(false); setNewName(''); setNewNotes(''); }} adding={adding} />
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Participants</Text>
        <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primary, alignItems: 'center', justifyContent: 'center' }} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>{p.name}</Text>
                  {p.notes ? <Text style={{ fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }} numberOfLines={1}>{p.notes}</Text> : null}
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 }}>Added {formatDate(p.createdAt)} · {scored.length} scored</Text>
                </View>
                <TouchableOpacity style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)', alignItems: 'center', justifyContent: 'center' }} onPress={() => handleDelete(p)}>
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

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScreenBackground />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Add Participant</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Ionicons name="close" size={26} color={COLOURS.primaryDark} /></TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 4 }}>
            <AddForm name={newName} notes={newNotes} onName={setNewName} onNotes={setNewNotes} onSubmit={handleAdd} adding={adding} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const ms = StyleSheet.create({
  card: { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, gap: 10 },
});

/**
 * app/(tabs)/index.jsx — Dashboard
 *
 * Desktop: music-log split pattern.
 * On desktop, scoring opens inline in the right panel instead of navigating.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, RefreshControl, Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ScreenBackground      from '../../components/ScreenBackground';
import QuestionnaireRunner   from '../../components/QuestionnaireRunner';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../../theme/responsive';
import { loadParticipants, saveResult, getLatestResult } from '../../storage/storage';
import { loadCustomQuestionnaires } from '../../storage/storage';
import { loadDisabledQs } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const formatDate  = (iso) => iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const interpColor = (q, score) => { try { return q.interpret(score).color; } catch { return COLOURS.textMuted; } };
const interpLabel = (q, score) => { try { return q.interpret(score).label; } catch { return '—'; } };
const fmtScore    = (score) => typeof score === 'object' ? '—' : String(score);
const hasResult   = (p, qid) => !!getLatestResult(p, qid);

// ─── Desktop list row ─────────────────────────────────────────────────────────
function ParticipantRow({ p, selected, onPress, totalQs }) {
  const n   = Object.keys(p.results ?? {}).length;
  const pct = n / totalQs;
  const col = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginBottom: 10 }}>
      <BlurView intensity={selected ? 52 : 36} tint="light" style={{ borderRadius: 14, overflow: 'hidden', shadowColor: selected ? 'rgba(74,123,181,0.22)' : 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: selected ? 7 : 3 }, shadowOpacity: 1, shadowRadius: selected ? 22 : 12, elevation: selected ? 5 : 2 }}>
        <View style={{ backgroundColor: selected ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.48)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: col, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{(p.code ?? p.name ?? '?').charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: selected ? COLOURS.primary : COLOURS.primaryDark }}>{p.code ?? p.name}</Text>
            {p.name && p.code ? <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }} numberOfLines={1}>{p.name}</Text> : null}
            <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 }}>{n}/{totalQs} scored</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={selected ? COLOURS.primary : COLOURS.textMuted} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

// ─── Desktop detail panel ─────────────────────────────────────────────────────
function DetailPanel({ p, onScore, onClose, allQs }) {
  if (!p) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Ionicons name="person-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.35 }} />
      <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, opacity: 0.5 }}>Select a participant</Text>
      <Image source={require('../../assets/images/logo.png')} style={{ position: 'absolute', bottom: 24, right: 24, width: 120, height: 45, opacity: 0.25 }} resizeMode="contain" />
    </View>
  );
  const results  = p.results ?? {};
  const scored   = allQs.filter(q => hasResult(p, q.id));
  const unscored  = allQs.filter(q => !hasResult(p, q.id));
  const pct = scored.length / allQs.length;
  const col = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 28, paddingBottom: 48 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, borderColor: col, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{(p.code ?? p.name ?? '?').charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{p.code ?? p.name}</Text>
          {p.name && p.code ? <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary }}>{p.name}</Text> : null}
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
          const r = getLatestResult(p, q.id); const c = interpColor(q, r.score);
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
                  <View style={{ alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: c + '18', shadowColor: c, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 }}>
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
        <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: scored.length > 0 ? 16 : 0 }}>SCORE NOW</Text>
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
                  <Ionicons name="chevron-forward" size={14} color="#fff" />
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </>}
    </ScrollView>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
function MobileCard({ p, onPress, allQs }) {
  const results = p.results ?? {};
  const n   = Object.keys(results).length;
  const pct = n / allQs.length;
  const col = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <TouchableOpacity style={mc.card} onPress={onPress} activeOpacity={0.85}>
      <View style={mc.row}>
        <View style={[mc.ring, { borderColor: col }]}>
          <View style={mc.avatar}><Text style={mc.at}>{(p.code ?? p.name ?? '?').charAt(0).toUpperCase()}</Text></View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={mc.name}>{p.code ?? p.name}</Text>
          {p.name && p.code ? <Text style={mc.notes} numberOfLines={1}>{p.name}</Text> : null}
          <Text style={mc.date}>{formatDate(p.createdAt)}</Text>
        </View>
        <View style={{ alignItems: 'center', minWidth: 44 }}>
          <Text style={{ fontSize: 24, fontFamily: FONTS.heading, color: col }}>{n}</Text>
          <Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>/ {allQs.length}</Text>
        </View>
      </View>
      {n > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {allQs.filter(q => hasResult(p, q.id)).map(q => {
            const r = getLatestResult(p, q.id);
            const c = interpColor(q, r.score);
            return <View key={q.id} style={{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: c + '18', shadowColor: c, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 5, elevation: 2 }}><Text style={{ fontSize: 12, fontFamily: FONTS.body, color: c }}>{q.shortTitle} {fmtScore(r.score)}</Text></View>;
          })}
        </View>
      )}
      {n === 0 && <Text style={{ fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, fontStyle: 'italic' }}>No questionnaires scored yet</Text>}
      <View style={{ height: 4, borderRadius: 2, backgroundColor: '#DDE8F5', overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: 2, width: `${pct * 100}%`, backgroundColor: col }} />
      </View>
    </TouchableOpacity>
  );
}
const mc = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 16, padding: 16, gap: 10, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  row:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  at:   { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name: { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:{ fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  date: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { isDesktop, isTablet } = useLayout();
  const [participants, setParticipants] = useState([]);
  const [refreshing,   setRefreshing]   = useState(false);
  const [selectedId,   setSelectedId]   = useState(null);
  const [scoringQid,   setScoringQid]   = useState(null);
  const [allQs,        setAllQs]        = useState(QUESTIONNAIRES);

  const load = useCallback(async () => {
    const [ps, customQs, disabledQs] = await Promise.all([loadParticipants(), loadCustomQuestionnaires(), loadDisabledQs()]);
    setParticipants(ps);
    setAllQs([...QUESTIONNAIRES, ...customQs].filter(q => !disabledQs.has(q.id)));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false); }, [load]);
  const selected = participants.find(p => p.id === selectedId) ?? null;
  const scoringQ = allQs.find(q => q.id === scoringQid) ?? null;

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
            <ScrollView
              contentContainerStyle={{ paddingTop: 24, paddingBottom: 40, paddingLeft: SIDEBAR_TOTAL + 20, paddingRight: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOURS.primary} />}
            >
              <Text style={{ fontSize: 32, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Dashboard</Text>
              <Text style={{ fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginBottom: 20 }}>Research Questionnaire Scorer</Text>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: 'people',           label: 'Participants', value: participants.length },
                  { icon: 'checkmark-circle', label: 'Scored',       value: participants.filter(p => Object.keys(p.results ?? {}).length > 0).length },
                  { icon: 'bar-chart',        label: 'Total scores', value: participants.reduce((s, p) => s + Object.keys(p.results ?? {}).length, 0) },
                ].map(({ icon, label, value }) => (
                  <BlurView key={label} intensity={40} tint="light" style={{ flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 3 }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.55)', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={icon} size={22} color={COLOURS.primary} />
                      </View>
                      <View>
                        <Text style={{ fontSize: 26, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{value}</Text>
                        <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>{label}</Text>
                      </View>
                    </View>
                  </BlurView>
                ))}
              </View>

              <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                PARTICIPANTS ({participants.length})
              </Text>

              {participants.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
                  <Ionicons name="people-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.5 }} />
                  <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>No participants yet</Text>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4 }} onPress={() => router.push('/(tabs)/participants')}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' }}>Add participant</Text>
                  </TouchableOpacity>
                </View>
              ) : participants.map(p => (
                <ParticipantRow
                  key={p.id} p={p}
                  selected={selectedId === p.id}
                  onPress={() => { setScoringQid(null); setSelectedId(selectedId === p.id ? null : p.id); }}
                  totalQs={allQs.length}
                />
              ))}
            </ScrollView>
          </View>

          {/* Right col — detail OR inline runner */}
          <View style={{ flex: 1, marginTop: 12, marginBottom: 12, marginRight: 12 }}>
            {scoringQ && selected ? (
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOURS.primary} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 34, fontFamily: FONTS.heading, color: COLOURS.primaryDark, lineHeight: 40 }}>ScoreMe</Text>
            <Text style={{ fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>Research Questionnaire Scorer</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, paddingTop: 6 }}>
            <TouchableOpacity style={mob.iconBtn} onPress={() => router.push('/export')}><Ionicons name="download-outline" size={20} color={COLOURS.primary} /></TouchableOpacity>
            <TouchableOpacity style={mob.iconBtn} onPress={() => router.push('/(tabs)/participants')}><Ionicons name="person-add-outline" size={20} color={COLOURS.primary} /></TouchableOpacity>
          </View>
        </View>

        {participants.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
            <Ionicons name="people-outline" size={52} color={COLOURS.textMuted} />
            <Text style={{ fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>No participants yet</Text>
            <Text style={{ fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 }}>Add participants in the Participants tab, then score them on any questionnaire.</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8, shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5 }} onPress={() => router.push('/(tabs)/participants')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' }}>Add first participant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={mob.label}>PARTICIPANTS ({participants.length})</Text>
            <View style={isTablet ? { flexDirection: 'row', flexWrap: 'wrap', gap: 10 } : { gap: 10 }}>
              {participants.map(p => (
                <View key={p.id} style={isTablet && { width: '48.5%' }}>
                  <MobileCard p={p} allQs={allQs} onPress={() => router.push(`/participant/${p.id}`)} />
                </View>
              ))}
            </View>
            <TouchableOpacity style={mob.exportCard} onPress={() => router.push('/export')} activeOpacity={0.85}>
              <Ionicons name="download-outline" size={22} color={COLOURS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark }}>Export data</Text>
                <Text style={{ fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>Download scores as CSV or full JSON</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLOURS.textMuted} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const mob = StyleSheet.create({
  iconBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2, alignItems: 'center', justifyContent: 'center' },
  label:      { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  exportCard: { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
});

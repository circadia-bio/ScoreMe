/**
 * app/(tabs)/index.jsx — Dashboard
 *
 * Desktop: 2-column split panel (music-log pattern)
 *   Left  — participant list, each row is a selectable glass card
 *   Right — selected participant detail with stacked BlurView cards
 *   Left column has a glass background card behind it (absolute positioned)
 *
 * Mobile/tablet: unchanged — tab bar + compact cards
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, RefreshControl, Platform,
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
import { loadParticipants } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const interpColor = (q, score) => { try { return q.interpret(score).color; } catch { return COLOURS.textMuted; } };
const interpLabel = (q, score) => { try { return q.interpret(score).label; } catch { return '—'; } };
const fmtScore    = (score) => typeof score === 'object' ? '—' : String(score);

// ─── Glass card (BlurView on native, rgba on web) ─────────────────────────────
function Glass({ children, style, intensity = 40, selected = false }) {
  const inner = (
    <View style={[gc.inner, selected && gc.innerSelected, style]}>
      {children}
    </View>
  );
  if (Platform.OS === 'web') return inner;
  return (
    <BlurView intensity={selected ? 52 : intensity} tint="light"
      style={[gc.blur, selected && gc.blurSelected, style]}>
      <View style={[gc.inner, selected && gc.innerSelected]}>{children}</View>
    </BlurView>
  );
}
const gc = StyleSheet.create({
  blur:          { borderRadius: 16, overflow: 'hidden', marginBottom: 10, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 3 },
  blurSelected:  { shadowColor: 'rgba(74,123,181,0.22)', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 6 },
  inner:         { backgroundColor: 'rgba(255,255,255,0.50)', padding: 14 },
  innerSelected: { backgroundColor: 'rgba(255,255,255,0.62)' },
});

// ─── Score pill ───────────────────────────────────────────────────────────────
function ScorePill({ q, result }) {
  if (!result) return null;
  const color   = interpColor(q, result.score);
  const display = fmtScore(result.score);
  return (
    <View style={[sp.wrap, { backgroundColor: color + '18', borderColor: color }]}>
      <Text style={[sp.label, { color }]}>{q.shortTitle}</Text>
      <Text style={[sp.score, { color }]}>{display}</Text>
    </View>
  );
}
const sp = StyleSheet.create({
  wrap:  { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', gap: 5, alignItems: 'center' },
  label: { fontSize: 12, fontFamily: FONTS.body },
  score: { fontSize: 13, fontFamily: FONTS.heading },
});

// ─── Desktop: left panel participant row ──────────────────────────────────────
function ParticipantRow({ p, selected, onPress }) {
  const resultCount = Object.keys(p.results ?? {}).length;
  const pct         = resultCount / QUESTIONNAIRES.length;
  const ringColor   = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginBottom: 10 }}>
      <BlurView intensity={selected ? 52 : 36} tint="light" style={[pr.blur, selected && pr.blurSel]}>
        <View style={[pr.inner, selected && pr.innerSel]}>
          <View style={[pr.ring, { borderColor: ringColor }]}>
            <View style={pr.avatar}>
              <Text style={pr.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[pr.name, selected && { color: COLOURS.primary }]}>{p.name}</Text>
            {p.notes ? <Text style={pr.notes} numberOfLines={1}>{p.notes}</Text> : null}
            <Text style={pr.meta}>{resultCount}/{QUESTIONNAIRES.length} questionnaires scored</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={selected ? COLOURS.primary : COLOURS.textMuted} />
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
});

// ─── Desktop: right panel detail ──────────────────────────────────────────────
function ParticipantDetail({ p, onScore, onClose }) {
  if (!p) return (
    <View style={pd.empty}>
      <Ionicons name="person-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.4 }} />
      <Text style={pd.emptyText}>Select a participant to view their scores</Text>
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
          <Ionicons name="close" size={18} color={COLOURS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
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
              <Glass key={q.id} style={{ marginBottom: 10 }}>
                <View style={pd.scoreRow}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={pd.qTitle}>{q.title}</Text>
                    <View style={[pd.badge, { backgroundColor: color + '18', borderColor: color }]}>
                      <Text style={[pd.badgeText, { color }]}>
                        {fmtScore(r.score)} — {label}
                      </Text>
                    </View>
                    <Text style={pd.resultDate}>{formatDate(r.completedAt)}</Text>
                  </View>
                  <TouchableOpacity style={pd.redoBtn} onPress={() => onScore(q.id)}>
                    <Text style={pd.redoBtnText}>Redo</Text>
                  </TouchableOpacity>
                </View>
              </Glass>
            );
          })}
        </>
      )}

      {/* Score now */}
      {unscored.length > 0 && (
        <>
          <Text style={[pd.sectionLabel, { marginTop: scored.length > 0 ? 16 : 0 }]}>SCORE NOW</Text>
          {unscored.map((q) => (
            <TouchableOpacity key={q.id} onPress={() => onScore(q.id)} activeOpacity={0.8} style={{ marginBottom: 10 }}>
              <BlurView intensity={36} tint="light" style={pd.unscored}>
                <View style={pd.unscoredInner}>
                  <View style={{ flex: 1 }}>
                    <Text style={pd.qTitle}>{q.title}</Text>
                    <Text style={pd.qMeta}>{q.shortTitle} · {q.items.length} items</Text>
                  </View>
                  <View style={pd.startBtn}>
                    <Text style={pd.startBtnText}>Start</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLOURS.primary} />
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
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText:     { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textAlign: 'center', opacity: 0.6 },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  ring:          { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatar:        { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:          { fontSize: SIZES.cardTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  notes:         { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  meta:          { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  closeBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#DDE8F5', overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 12, fontFamily: FONTS.bodyMedium, marginTop: 6, marginBottom: 4 },
  sectionLabel:  { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  scoreRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge:         { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText:     { fontSize: 13, fontFamily: FONTS.body },
  resultDate:    { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  redoBtn:       { backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  redoBtnText:   { fontSize: 13, fontFamily: FONTS.body, color: COLOURS.primary },
  qTitle:        { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  qMeta:         { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  unscored:      { borderRadius: 14, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.07)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2 },
  unscoredInner: { backgroundColor: 'rgba(255,255,255,0.40)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  startBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  startBtnText:  { fontSize: 13, fontFamily: FONTS.body, color: COLOURS.primary },
});

// ─── Desktop stat row ─────────────────────────────────────────────────────────
function StatRow({ participants }) {
  const total       = participants.length;
  const scored      = participants.filter((p) => Object.keys(p.results ?? {}).length > 0).length;
  const totalScores = participants.reduce((s, p) => s + Object.keys(p.results ?? {}).length, 0);
  return (
    <View style={st.row}>
      {[
        { icon: 'people',           label: 'Participants', value: total       },
        { icon: 'checkmark-circle', label: 'Scored',       value: scored      },
        { icon: 'bar-chart',        label: 'Total scores', value: totalScores },
      ].map(({ icon, label, value }) => (
        <BlurView key={label} intensity={40} tint="light" style={st.card}>
          <View style={st.cardInner}>
            <View style={st.iconWrap}>
              <Ionicons name={icon} size={22} color={COLOURS.primary} />
            </View>
            <View>
              <Text style={st.value}>{value}</Text>
              <Text style={st.label}>{label}</Text>
            </View>
          </View>
        </BlurView>
      ))}
    </View>
  );
}
const st = StyleSheet.create({
  row:      { flexDirection: 'row', gap: 12, marginBottom: 20 },
  card:     { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 3 },
  cardInner:{ backgroundColor: 'rgba(255,255,255,0.55)', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  value:    { fontSize: 26, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  label:    { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
});

// ─── Mobile participant card ──────────────────────────────────────────────────
function MobileCard({ p, onPress }) {
  const results     = p.results ?? {};
  const resultCount = Object.keys(results).length;
  const pct         = resultCount / QUESTIONNAIRES.length;
  const ringColor   = pct === 0 ? COLOURS.textMuted : pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
  return (
    <TouchableOpacity style={mc.card} onPress={onPress} activeOpacity={0.85}>
      <View style={mc.header}>
        <View style={[mc.ring, { borderColor: ringColor }]}>
          <View style={mc.avatar}>
            <Text style={mc.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={mc.name}>{p.name}</Text>
          {p.notes ? <Text style={mc.notes} numberOfLines={1}>{p.notes}</Text> : null}
          <Text style={mc.date}>{formatDate(p.createdAt)}</Text>
        </View>
        <View style={mc.bubble}>
          <Text style={[mc.bubbleNum, { color: ringColor }]}>{resultCount}</Text>
          <Text style={mc.bubbleLabel}>/ {QUESTIONNAIRES.length}</Text>
        </View>
      </View>
      {resultCount > 0 && (
        <View style={mc.pills}>
          {QUESTIONNAIRES.filter((q) => results[q.id]).map((q) => (
            <ScorePill key={q.id} q={q} result={results[q.id]} />
          ))}
        </View>
      )}
      {resultCount === 0 && <Text style={mc.empty}>No questionnaires scored yet — tap to score</Text>}
      <View style={mc.progressTrack}>
        <View style={[mc.progressFill, { width: `${pct * 100}%`, backgroundColor: ringColor }]} />
      </View>
    </TouchableOpacity>
  );
}
const mc = StyleSheet.create({
  card:        { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, gap: 10 },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring:        { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:        { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:       { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  date:        { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  bubble:      { alignItems: 'center', minWidth: 44 },
  bubbleNum:   { fontSize: 24, fontFamily: FONTS.heading },
  bubbleLabel: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  pills:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  empty:       { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, fontStyle: 'italic' },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#DDE8F5', overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isDesktop, isTablet } = useLayout();
  const [participants, setParticipants] = useState([]);
  const [refreshing, setRefreshing]     = useState(false);
  const [selectedId, setSelectedId]     = useState(null);

  const load = useCallback(async () => {
    setParticipants(await loadParticipants());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, [load]);

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
              activeTab="dashboard"
              onNavigate={(tab) => {
                if (tab === 'participants')   router.push('/(tabs)/participants');
                if (tab === 'questionnaires') router.push('/(tabs)/questionnaires');
              }}
              onExport={() => router.push('/export')}
            />
          </View>

          {/* Left panel — glass background + list */}
          <View style={ds.leftCol}>
            {/* Frosted glass background card behind the list — music-log style */}
            <View style={ds.leftBg} />

            <ScrollView
              contentContainerStyle={ds.leftScroll}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOURS.primary} />}
            >
              <Text style={ds.panelTitle}>Dashboard</Text>
              <Text style={ds.panelSub}>Research Questionnaire Scorer</Text>

              <StatRow participants={participants} />

              <Text style={ds.sectionLabel}>PARTICIPANTS ({participants.length})</Text>

              {participants.length === 0 ? (
                <View style={ds.empty}>
                  <Ionicons name="people-outline" size={40} color={COLOURS.textMuted} style={{ opacity: 0.5 }} />
                  <Text style={ds.emptyText}>No participants yet</Text>
                  <TouchableOpacity style={ds.emptyBtn} onPress={() => router.push('/(tabs)/participants')}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={ds.emptyBtnText}>Add participant</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                participants.map((p) => (
                  <ParticipantRow
                    key={p.id}
                    p={p}
                    selected={selectedId === p.id}
                    onPress={() => setSelectedId(selectedId === p.id ? null : p.id)}
                  />
                ))
              )}
            </ScrollView>
          </View>

          {/* Right panel — detail */}
          <View style={ds.rightCol}>
            <ParticipantDetail
              p={selectedParticipant}
              onScore={(qid) => selectedParticipant && router.push(`/score/${selectedParticipant.id}/${qid}`)}
              onClose={() => setSelectedId(null)}
            />
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
        contentContainerStyle={[ms.content, { paddingTop: insets.top + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOURS.primary} />}
      >
        <View style={ms.appHeader}>
          <View>
            <Text style={ms.appName}>ScoreMe</Text>
            <Text style={ms.subtitle}>Research Questionnaire Scorer</Text>
          </View>
          <View style={ms.headerBtns}>
            <TouchableOpacity style={ms.iconBtn} onPress={() => router.push('/export')}>
              <Ionicons name="download-outline" size={20} color={COLOURS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={ms.iconBtn} onPress={() => router.push('/(tabs)/participants')}>
              <Ionicons name="person-add-outline" size={20} color={COLOURS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {participants.length === 0 ? (
          <View style={ms.empty}>
            <Ionicons name="people-outline" size={52} color={COLOURS.textMuted} />
            <Text style={ms.emptyTitle}>No participants yet</Text>
            <Text style={ms.emptyBody}>Add participants in the Participants tab, then score them on any questionnaire.</Text>
            <TouchableOpacity style={ms.emptyBtn} onPress={() => router.push('/(tabs)/participants')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={ms.emptyBtnText}>Add first participant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={ms.sectionLabel}>PARTICIPANTS ({participants.length})</Text>
            <View style={isTablet ? ms.tabletGrid : ms.mobileList}>
              {participants.map((p) => (
                <View key={p.id} style={isTablet && ms.tabletCol}>
                  <MobileCard p={p} onPress={() => router.push(`/participant/${p.id}`)} />
                </View>
              ))}
            </View>
            <TouchableOpacity style={ms.exportCard} onPress={() => router.push('/export')} activeOpacity={0.85}>
              <Ionicons name="download-outline" size={22} color={COLOURS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={ms.exportTitle}>Export data</Text>
                <Text style={ms.exportSub}>Download all scores as a CSV file</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLOURS.textMuted} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  rightCol:   { flex: 1, margin: PANEL_MARGIN, marginLeft: PANEL_MARGIN / 2 },
  panelTitle: { fontSize: 32, fontFamily: FONTS.heading, color: COLOURS.primaryDark, lineHeight: 38 },
  panelSub:   { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginBottom: 20 },
  sectionLabel:{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  empty:      { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText:  { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  emptyBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, marginTop: 4 },
  emptyBtnText:{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

const ms = StyleSheet.create({
  content:    { paddingHorizontal: 16, gap: 12 },
  appHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appName:    { fontSize: 34, fontFamily: FONTS.heading, color: COLOURS.primaryDark, lineHeight: 40 },
  subtitle:   { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: 8, paddingTop: 6 },
  iconBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: COLOURS.cardBg, borderWidth: 1, borderColor: COLOURS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  sectionLabel:{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  mobileList: { gap: 10 },
  tabletGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tabletCol:  { width: '48.5%' },
  exportCard: { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  exportTitle:{ fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  exportSub:  { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  empty:      { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  emptyBody:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  emptyBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  emptyBtnText:{ fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

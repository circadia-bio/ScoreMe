/**
 * app/(tabs)/index.jsx — Dashboard
 *
 * Responsive layout:
 *   mobile  → tab bar, ScreenBackground, compact cards (existing)
 *   tablet  → tab bar, ScreenBackground, 2-column card grid
 *   desktop → DesktopLayout sidebar, dot-grid background, GlassCard grid
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenBackground from '../../components/ScreenBackground';
import DesktopLayout    from '../../components/DesktopLayout';
import GlassCard        from '../../components/GlassCard';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout } from '../../theme/responsive';
import { loadParticipants } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const getInterpColor = (q, score) => {
  try { return q.interpret(score).color; } catch { return COLOURS.textMuted; }
};
const getInterpLabel = (q, score) => {
  try { return q.interpret(score).label; } catch { return '—'; }
};

// ─── Score pill (mobile/tablet) ───────────────────────────────────────────────
function ScorePill({ q, result }) {
  if (!result) return null;
  const color   = getInterpColor(q, result.score);
  const display = typeof result.score === 'object' ? '—' : String(result.score);
  return (
    <View style={[pill.wrap, { backgroundColor: color + '18', borderColor: color }]}>
      <Text style={[pill.label, { color }]}>{q.shortTitle}</Text>
      <Text style={[pill.score, { color }]}>{display}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  wrap:  { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', gap: 5, alignItems: 'center' },
  label: { fontSize: 12, fontFamily: FONTS.body },
  score: { fontSize: 13, fontFamily: FONTS.heading },
});

// ─── Stat cards ───────────────────────────────────────────────────────────────
function StatCards({ participants, isDesktop }) {
  const total       = participants.length;
  const scored      = participants.filter((p) => Object.keys(p.results ?? {}).length > 0).length;
  const totalScores = participants.reduce((s, p) => s + Object.keys(p.results ?? {}).length, 0);

  const stats = [
    { icon: 'people',           label: 'Participants', value: total },
    { icon: 'checkmark-circle', label: 'Scored',       value: scored },
    { icon: 'bar-chart',        label: 'Total scores', value: totalScores },
  ];

  if (isDesktop) {
    return (
      <View style={sb.desktopRow}>
        {stats.map(({ icon, label, value }) => (
          <GlassCard key={label} style={{ flex: 1 }} padding={20}>
            <View style={sb.desktopCard}>
              <View style={sb.desktopIconWrap}>
                <Ionicons name={icon} size={24} color={COLOURS.primary} />
              </View>
              <View>
                <Text style={sb.desktopValue}>{value}</Text>
                <Text style={sb.desktopLabel}>{label}</Text>
              </View>
            </View>
          </GlassCard>
        ))}
      </View>
    );
  }

  return (
    <View style={sb.mobileRow}>
      {stats.map(({ icon, label, value }) => (
        <View key={label} style={sb.mobileCard}>
          <Ionicons name={icon} size={22} color={COLOURS.primary} />
          <Text style={sb.mobileValue}>{value}</Text>
          <Text style={sb.mobileLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}
const sb = StyleSheet.create({
  // desktop
  desktopRow:     { flexDirection: 'row', gap: 16, marginBottom: 4 },
  desktopCard:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  desktopIconWrap:{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  desktopValue:   { fontSize: 28, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  desktopLabel:   { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  // mobile
  mobileRow:  { flexDirection: 'row', gap: 10 },
  mobileCard: { flex: 1, backgroundColor: COLOURS.cardBg, borderRadius: 14, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 14, alignItems: 'center', gap: 4 },
  mobileValue:{ fontSize: 24, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  mobileLabel:{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textAlign: 'center' },
});

// ─── Coverage heatmap ─────────────────────────────────────────────────────────
function CoverageHeatmap({ participants, isDesktop }) {
  return (
    <View style={hm.row}>
      {QUESTIONNAIRES.map((q) => {
        const n   = participants.filter((p) => p.results?.[q.id]).length;
        const pct = participants.length > 0 ? n / participants.length : 0;
        const color = pct === 0 ? COLOURS.textMuted
          : pct < 0.5 ? COLOURS.warning
          : pct < 1   ? COLOURS.primary
          : COLOURS.success;
        return (
          <View key={q.id} style={hm.item}>
            <View style={[hm.barBg, isDesktop && { height: 72 }]}>
              <View style={[hm.barFill, { height: `${Math.max(pct * 100, 4)}%`, backgroundColor: color }]} />
            </View>
            <Text style={hm.label}>{q.shortTitle}</Text>
            <Text style={[hm.count, { color }]}>{n}/{participants.length}</Text>
          </View>
        );
      })}
    </View>
  );
}
const hm = StyleSheet.create({
  row:    { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  item:   { alignItems: 'center', gap: 4, minWidth: 52 },
  barBg:  { width: 28, height: 56, borderRadius: 6, backgroundColor: '#DDE8F5', overflow: 'hidden', justifyContent: 'flex-end' },
  barFill:{ width: '100%', borderRadius: 6 },
  label:  { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.primaryDark, textAlign: 'center' },
  count:  { fontSize: 11, fontFamily: FONTS.bodyMedium, textAlign: 'center' },
});

// ─── Desktop participant row ──────────────────────────────────────────────────
function DesktopParticipantRow({ p, onPress }) {
  const results     = p.results ?? {};
  const resultCount = Object.keys(results).length;
  const completePct = QUESTIONNAIRES.length > 0 ? resultCount / QUESTIONNAIRES.length : 0;
  const ringColor   = completePct === 0 ? COLOURS.textMuted
                    : completePct < 0.5 ? COLOURS.warning
                    : completePct < 1   ? COLOURS.primary
                    : COLOURS.success;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={dr.row}>
        {/* Avatar */}
        <View style={[dr.avatarRing, { borderColor: ringColor }]}>
          <View style={dr.avatar}>
            <Text style={dr.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* Name + notes */}
        <View style={{ width: 180 }}>
          <Text style={dr.name} numberOfLines={1}>{p.name}</Text>
          {p.notes ? <Text style={dr.notes} numberOfLines={1}>{p.notes}</Text> : null}
        </View>

        {/* Score pills */}
        <View style={dr.pills}>
          {QUESTIONNAIRES.filter((q) => results[q.id]).map((q) => {
            const color   = getInterpColor(q, results[q.id].score);
            const display = typeof results[q.id].score === 'object' ? '—' : String(results[q.id].score);
            return (
              <View key={q.id} style={[dr.pill, { backgroundColor: color + '18' }]}>
                <Text style={[dr.pillText, { color }]}>{q.shortTitle} {display}</Text>
              </View>
            );
          })}
          {resultCount === 0 && (
            <Text style={dr.noScores}>No scores yet</Text>
          )}
        </View>

        {/* Progress + count */}
        <View style={dr.meta}>
          <Text style={[dr.countText, { color: ringColor }]}>{resultCount}/{QUESTIONNAIRES.length}</Text>
          <View style={dr.progressTrack}>
            <View style={[dr.progressFill, { width: `${completePct * 100}%`, backgroundColor: ringColor }]} />
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={COLOURS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
const dr = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, paddingHorizontal: 4 },
  avatarRing:  { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatar:      { width: 36, height: 36, borderRadius: 18, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 16, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:        { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:       { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  pills:       { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill:        { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pillText:    { fontSize: 12, fontFamily: FONTS.body },
  noScores:    { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, fontStyle: 'italic' },
  meta:        { width: 80, alignItems: 'flex-end', gap: 4 },
  countText:   { fontSize: 13, fontFamily: FONTS.heading },
  progressTrack: { width: 60, height: 4, borderRadius: 2, backgroundColor: '#DDE8F5', overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
});

// ─── Mobile participant card ──────────────────────────────────────────────────
function MobileParticipantCard({ p, onPress }) {
  const results     = p.results ?? {};
  const resultCount = Object.keys(results).length;
  const completePct = QUESTIONNAIRES.length > 0 ? resultCount / QUESTIONNAIRES.length : 0;
  const ringColor   = completePct === 0 ? COLOURS.textMuted
                    : completePct < 0.5 ? COLOURS.warning
                    : completePct < 1   ? COLOURS.primary
                    : COLOURS.success;
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
      {resultCount === 0 && (
        <Text style={mc.empty}>No questionnaires scored yet — tap to score</Text>
      )}
      <View style={mc.progressTrack}>
        <View style={[mc.progressFill, { width: `${completePct * 100}%`, backgroundColor: ringColor }]} />
      </View>
    </TouchableOpacity>
  );
}
const mc = StyleSheet.create({
  card:   { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring:   { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  name:   { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  notes:  { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  date:   { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  bubble: { alignItems: 'center', minWidth: 44 },
  bubbleNum:   { fontSize: 24, fontFamily: FONTS.heading },
  bubbleLabel: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  pills:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  empty:  { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, fontStyle: 'italic' },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#DDE8F5', overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
});

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd, isDesktop }) {
  return (
    <View style={[es.wrap, isDesktop && { paddingVertical: 64 }]}>
      <Ionicons name="people-outline" size={56} color={COLOURS.textMuted} />
      <Text style={es.title}>No participants yet</Text>
      <Text style={es.body}>Add participants in the Participants tab, then score them on any questionnaire.</Text>
      <TouchableOpacity style={es.btn} onPress={onAdd}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={es.btnText}>Add first participant</Text>
      </TouchableOpacity>
    </View>
  );
}
const es = StyleSheet.create({
  wrap:    { alignItems: 'center', paddingVertical: 48, gap: 12 },
  title:   { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  body:    { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  btn:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  btnText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

// ─── Desktop dashboard content ────────────────────────────────────────────────
function DesktopDashboard({ participants, onParticipant, onNavigate, onExport, onRefresh, refreshing }) {
  const sectionLabel = (t) => <Text style={ds.sectionLabel}>{t}</Text>;

  return (
    <>
      {/* Page title */}
      <View style={ds.pageHeader}>
        <View>
          <Text style={ds.pageTitle}>Dashboard</Text>
          <Text style={ds.pageSubtitle}>Research Questionnaire Scorer</Text>
        </View>
        <TouchableOpacity style={ds.exportBtn} onPress={onExport}>
          <Ionicons name="download-outline" size={18} color={COLOURS.primary} />
          <Text style={ds.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      {sectionLabel('OVERVIEW')}
      <StatCards participants={participants} isDesktop />

      {/* Heatmap */}
      {participants.length > 0 && (
        <>
          {sectionLabel('QUESTIONNAIRE COVERAGE')}
          <GlassCard style={{ marginBottom: 4 }}>
            <CoverageHeatmap participants={participants} isDesktop />
          </GlassCard>
        </>
      )}

      {/* Participants */}
      {participants.length === 0 ? (
        <EmptyState onAdd={() => onNavigate('participants')} isDesktop />
      ) : (
        <>
          {sectionLabel(`PARTICIPANTS (${participants.length})`)}
          <GlassCard padding={0} style={{ overflow: 'hidden' }}>
            {participants.map((p, i) => (
              <View key={p.id}>
                <View style={{ paddingHorizontal: 20 }}>
                  <DesktopParticipantRow p={p} onPress={() => onParticipant(p.id)} />
                </View>
                {i < participants.length - 1 && <View style={ds.divider} />}
              </View>
            ))}
          </GlassCard>
        </>
      )}
    </>
  );
}
const ds = StyleSheet.create({
  pageHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  pageTitle:     { fontSize: 36, fontFamily: FONTS.heading, color: COLOURS.primaryDark, lineHeight: 42 },
  pageSubtitle:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  exportBtn:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(74,123,181,0.10)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  exportBtnText: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  sectionLabel:  { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 6 },
  divider:       { height: 1, backgroundColor: 'rgba(74,123,181,0.07)', marginHorizontal: 20 },
});

// ─── Mobile/tablet dashboard content ─────────────────────────────────────────
function MobileDashboard({ participants, onParticipant, router, insets, isTablet, refreshing, onRefresh }) {
  return (
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
          <TouchableOpacity style={ms.iconBtn} onPress={() => router.push('/participants')}>
            <Ionicons name="person-add-outline" size={20} color={COLOURS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={ms.sectionLabel}>OVERVIEW</Text>
      <StatCards participants={participants} isDesktop={false} />

      {participants.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}>
            <CoverageHeatmap participants={participants} isDesktop={false} />
          </View>
        </ScrollView>
      )}

      {participants.length === 0 ? (
        <EmptyState onAdd={() => router.push('/participants')} isDesktop={false} />
      ) : (
        <>
          <Text style={[ms.sectionLabel, { marginTop: 8 }]}>PARTICIPANTS ({participants.length})</Text>
          {/* 2-col grid on tablet */}
          <View style={isTablet ? ms.tabletGrid : ms.mobileList}>
            {participants.map((p) => (
              <View key={p.id} style={isTablet && ms.tabletCol}>
                <MobileParticipantCard p={p} onPress={() => onParticipant(p.id)} />
              </View>
            ))}
          </View>

          <TouchableOpacity style={ms.exportCard} onPress={() => router.push('/export')} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={24} color={COLOURS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={ms.exportTitle}>Export data</Text>
              <Text style={ms.exportSub}>Download all scores as a CSV file</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLOURS.textMuted} />
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
const ms = StyleSheet.create({
  content:    { paddingHorizontal: 16, gap: 12 },
  appHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appName:    { fontSize: 34, fontFamily: FONTS.heading, color: COLOURS.primaryDark, lineHeight: 40 },
  subtitle:   { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: 8, paddingTop: 6 },
  iconBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: COLOURS.cardBg, borderWidth: 1, borderColor: COLOURS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  mobileList:   { gap: 10 },
  tabletGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tabletCol:    { width: '48.5%' },
  exportCard:   { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  exportTitle:  { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  exportSub:    { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
});

// ─── Root screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { isDesktop, isTablet } = useLayout();
  const [participants, setParticipants] = useState([]);
  const [refreshing, setRefreshing]     = useState(false);

  const load = useCallback(async () => {
    setParticipants(await loadParticipants());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await load(); setRefreshing(false);
  }, [load]);

  const goParticipant = (id) => router.push(`/participant/${id}`);

  if (isDesktop) {
    return (
      <View style={{ flex: 1 }}>
        <DesktopLayout
          activeTab="dashboard"
          onNavigate={(tab) => {
            if (tab === 'participants')   router.push('/(tabs)/participants');
            if (tab === 'questionnaires') router.push('/(tabs)/questionnaires');
          }}
          onExport={() => router.push('/export')}
        >
          <DesktopDashboard
            participants={participants}
            onParticipant={goParticipant}
            onNavigate={(tab) => {
              if (tab === 'participants') router.push('/(tabs)/participants');
            }}
            onExport={() => router.push('/export')}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </DesktopLayout>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScreenBackground />
      <MobileDashboard
        participants={participants}
        onParticipant={goParticipant}
        router={router}
        insets={insets}
        isTablet={isTablet}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

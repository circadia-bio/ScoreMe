/**
 * app/(tabs)/index.jsx — Dashboard
 *
 * Overview of all participants with score summaries across questionnaires.
 * Colour-coded interpretation badges per participant, stat bar at the top,
 * and a quick Export button.
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
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { loadParticipants } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// ─── Score pill ───────────────────────────────────────────────────────────────
const ScorePill = ({ q, result }) => {
  if (!result) return null;
  let color;
  try { color = q.interpret(result.score).color; } catch { color = COLOURS.textMuted; }
  let display = typeof result.score === 'object' ? '—' : String(result.score);
  return (
    <View style={[pill.wrap, { backgroundColor: color + '18', borderColor: color }]}>
      <Text style={[pill.label, { color }]}>{q.shortTitle}</Text>
      <Text style={[pill.score, { color }]}>{display}</Text>
    </View>
  );
};
const pill = StyleSheet.create({
  wrap:  { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', gap: 5, alignItems: 'center' },
  label: { fontSize: 12, fontFamily: FONTS.body },
  score: { fontSize: 13, fontFamily: FONTS.heading },
});

// ─── Stat bar ─────────────────────────────────────────────────────────────────
const StatBar = ({ participants }) => {
  const total       = participants.length;
  const scored      = participants.filter((p) => Object.keys(p.results ?? {}).length > 0).length;
  const totalScores = participants.reduce((s, p) => s + Object.keys(p.results ?? {}).length, 0);
  return (
    <View style={sb.row}>
      {[
        { icon: 'people',          label: 'Participants', value: total },
        { icon: 'checkmark-circle', label: 'Scored',      value: scored },
        { icon: 'bar-chart',        label: 'Total scores', value: totalScores },
      ].map(({ icon, label, value }) => (
        <View key={label} style={sb.card}>
          <Ionicons name={icon} size={22} color={COLOURS.primary} />
          <Text style={sb.value}>{value}</Text>
          <Text style={sb.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
};
const sb = StyleSheet.create({
  row:   { flexDirection: 'row', gap: 10 },
  card:  { flex: 1, backgroundColor: COLOURS.cardBg, borderRadius: 14, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 14, alignItems: 'center', gap: 4 },
  value: { fontSize: 24, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  label: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textAlign: 'center' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [participants, setParticipants] = useState([]);
  const [refreshing, setRefreshing]     = useState(false);

  const load = useCallback(async () => {
    setParticipants(await loadParticipants());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScreenBackground />

      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOURS.primary} />}
      >
        {/* ── App header ── */}
        <View style={s.appHeader}>
          <View>
            <Text style={s.appName}>ScoreMe</Text>
            <Text style={s.subtitle}>Research Questionnaire Scorer</Text>
          </View>
          <View style={s.headerBtns}>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/export')}>
              <Ionicons name="download-outline" size={20} color={COLOURS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/participants')}>
              <Ionicons name="person-add-outline" size={20} color={COLOURS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats ── */}
        <Text style={s.sectionLabel}>OVERVIEW</Text>
        <StatBar participants={participants} />

        {/* ── Questionnaire coverage heatmap row ── */}
        {participants.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.heatmapScroll}>
            <View style={s.heatmapRow}>
              {QUESTIONNAIRES.map((q) => {
                const scoredCount = participants.filter((p) => p.results?.[q.id]).length;
                const pct = participants.length > 0 ? scoredCount / participants.length : 0;
                const barColor = pct === 0 ? COLOURS.textMuted :
                  pct < 0.5 ? COLOURS.warning : pct < 1 ? COLOURS.primary : COLOURS.success;
                return (
                  <View key={q.id} style={s.heatmapItem}>
                    <View style={s.heatmapBarBg}>
                      <View style={[s.heatmapBarFill, { height: `${Math.max(pct * 100, 4)}%`, backgroundColor: barColor }]} />
                    </View>
                    <Text style={s.heatmapLabel}>{q.shortTitle}</Text>
                    <Text style={[s.heatmapCount, { color: barColor }]}>{scoredCount}/{participants.length}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* ── Participants ── */}
        {participants.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="people-outline" size={56} color={COLOURS.textMuted} />
            <Text style={s.emptyTitle}>No participants yet</Text>
            <Text style={s.emptyBody}>
              Add participants in the Participants tab, then score them on any questionnaire.
            </Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/participants')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={s.emptyBtnText}>Add first participant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[s.sectionLabel, { marginTop: 8 }]}>
              PARTICIPANTS ({participants.length})
            </Text>
            {participants.map((p) => {
              const resultCount = Object.keys(p.results ?? {}).length;
              const completePct = QUESTIONNAIRES.length > 0 ? resultCount / QUESTIONNAIRES.length : 0;
              const ringColor   = completePct === 0 ? COLOURS.textMuted
                                : completePct < 0.5 ? COLOURS.warning
                                : completePct < 1   ? COLOURS.primary
                                : COLOURS.success;

              return (
                <TouchableOpacity
                  key={p.id}
                  style={s.card}
                  onPress={() => router.push(`/participant/${p.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={s.cardHeader}>
                    {/* Avatar + completion ring */}
                    <View style={[s.avatarRing, { borderColor: ringColor }]}>
                      <View style={s.avatar}>
                        <Text style={s.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={s.cardName}>{p.name}</Text>
                      {p.notes ? (
                        <Text style={s.cardNotes} numberOfLines={1}>{p.notes}</Text>
                      ) : null}
                      <Text style={s.cardDate}>Added {formatDate(p.createdAt)}</Text>
                    </View>

                    <View style={s.scoreBubble}>
                      <Text style={[s.scoreBubbleNum, { color: ringColor }]}>{resultCount}</Text>
                      <Text style={s.scoreBubbleLabel}>/ {QUESTIONNAIRES.length}</Text>
                    </View>
                  </View>

                  {/* Score pills */}
                  {resultCount > 0 && (
                    <View style={s.pillsRow}>
                      {QUESTIONNAIRES.filter((q) => p.results?.[q.id]).map((q) => (
                        <ScorePill key={q.id} q={q} result={p.results[q.id]} />
                      ))}
                    </View>
                  )}

                  {resultCount === 0 && (
                    <Text style={s.noScoresHint}>No questionnaires scored yet — tap to score</Text>
                  )}

                  {/* Progress bar */}
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, {
                      width: `${completePct * 100}%`,
                      backgroundColor: ringColor,
                    }]} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Export CTA */}
            <TouchableOpacity style={s.exportCard} onPress={() => router.push('/export')} activeOpacity={0.85}>
              <Ionicons name="download-outline" size={24} color={COLOURS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={s.exportTitle}>Export data</Text>
                <Text style={s.exportSub}>Download all scores as a CSV file</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLOURS.textMuted} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },

  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appName:   { fontSize: 34, fontFamily: FONTS.heading, color: COLOURS.primaryDark, lineHeight: 40 },
  subtitle:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 2 },
  headerBtns:{ flexDirection: 'row', gap: 8, paddingTop: 6 },
  iconBtn:   { width: 40, height: 40, borderRadius: 20, backgroundColor: COLOURS.cardBg, borderWidth: 1, borderColor: COLOURS.cardBorder, alignItems: 'center', justifyContent: 'center' },

  sectionLabel: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Heatmap
  heatmapScroll: { marginHorizontal: -16 },
  heatmapRow:    { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  heatmapItem:   { alignItems: 'center', gap: 4, width: 52 },
  heatmapBarBg:  { width: 28, height: 56, borderRadius: 6, backgroundColor: '#E2EBF5', overflow: 'hidden', justifyContent: 'flex-end' },
  heatmapBarFill:{ width: '100%', borderRadius: 6 },
  heatmapLabel:  { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.primaryDark, textAlign: 'center' },
  heatmapCount:  { fontSize: 11, fontFamily: FONTS.bodyMedium, textAlign: 'center' },

  // Participant cards
  card:       { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: COLOURS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  cardName:   { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  cardNotes:  { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary },
  cardDate:   { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  scoreBubble:{ alignItems: 'center', minWidth: 44 },
  scoreBubbleNum:   { fontSize: 24, fontFamily: FONTS.heading },
  scoreBubbleLabel: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },

  pillsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  noScoresHint:{ fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, fontStyle: 'italic' },

  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#E2EBF5', overflow: 'hidden', marginTop: 2 },
  progressFill:  { height: '100%', borderRadius: 2 },

  // Export card
  exportCard: { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  exportTitle: { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  exportSub:   { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  emptyBody:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  emptyBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLOURS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

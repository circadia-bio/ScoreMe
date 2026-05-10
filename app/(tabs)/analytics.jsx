/**
 * app/(tabs)/analytics.jsx — Questionnaire outcome analytics
 *
 * Per questionnaire:
 *   • Box plot (score distribution, optionally by group)
 *   • Stats table (n, mean ± SD, min–max, median)
 *   • Completion bar
 *
 * Grouping: All | Group/Condition | Sex
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions, Platform, Image,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ScreenBackground   from '../../components/ScreenBackground';
import BoxPlot            from '../../components/charts/BoxPlot';
import CompletionBar      from '../../components/charts/CompletionBar';
import { describe, groupBy, collectScores, completionRate, groupColor, round2 }
  from '../../components/charts/chartUtils';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../../theme/responsive';
import { loadParticipants, loadCustomQuestionnaires, loadDisabledQs } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

// ─── Grouping options ─────────────────────────────────────────────────────────
const GROUP_OPTIONS = [
  { id: 'all',     label: 'All',       field: 'all'     },
  { id: 'group',   label: 'Group',     field: 'group'   },
  { id: 'sex',     label: 'Sex',       field: 'sex'     },
  { id: 'session', label: 'Session',   field: 'session' },
  { id: 'site',    label: 'Site',      field: 'site'    },
];

// ─── Stats table row ──────────────────────────────────────────────────────────
function StatRow({ label, color, stats }) {
  if (!stats) return (
    <View style={st.row}>
      <View style={[st.dot, { backgroundColor: color }]} />
      <Text style={st.groupLabel}>{label}</Text>
      <Text style={[st.cell, { flex: 1, color: COLOURS.textMuted, fontStyle: 'italic' }]}>No data</Text>
    </View>
  );
  return (
    <View style={st.row}>
      <View style={[st.dot, { backgroundColor: color }]} />
      <Text style={st.groupLabel} numberOfLines={1}>{label}</Text>
      <Text style={st.cell}>{stats.n}</Text>
      <Text style={st.cell}>{round2(stats.mean)} ± {round2(stats.sd)}</Text>
      <Text style={st.cell}>{round2(stats.median)}</Text>
      <Text style={st.cell}>{round2(stats.min)}–{round2(stats.max)}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  header:     { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 4, marginBottom: 2 },
  headerCell: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.06)' },
  dot:        { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  groupLabel: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, flex: 1.2, minWidth: 0 },
  cell:       { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, flex: 1.4, textAlign: 'right' },
});

// ─── Per-questionnaire card ───────────────────────────────────────────────────
function QCard({ q, participants, groupField, chartWidth }) {
  const grouped = groupBy(participants, groupField);
  const entries = Object.entries(grouped);

  // Build per-group stats
  const groups = entries.map(([label, ps], i) => ({
    label,
    color: groupColor(i),
    stats: describe(collectScores(ps, q.id)),
    rate:  completionRate(ps, q.id),
    n:     ps.length,
  }));

  // Overall completion
  const overallRate = completionRate(participants, q.id);
  const hasData     = groups.some(g => g.stats !== null);

  return (
    <BlurView intensity={36} tint="light" style={qc.card}>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.52)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Header */}
        <View style={qc.header}>
          <View style={{ flex: 1 }}>
            <Text style={qc.title}>{q.shortTitle}</Text>
            <Text style={qc.subtitle} numberOfLines={1}>{q.title}</Text>
          </View>
          {/* Overall completion pill */}
          <View style={[qc.pill, { backgroundColor: overallRate >= 0.8 ? '#2E7D3218' : overallRate >= 0.5 ? '#F59E0B18' : 'rgba(148,163,184,0.12)', borderColor: overallRate >= 0.8 ? '#2E7D32' : overallRate >= 0.5 ? '#F59E0B' : COLOURS.textMuted }]}>
            <Text style={[qc.pillText, { color: overallRate >= 0.8 ? '#2E7D32' : overallRate >= 0.5 ? '#F59E0B' : COLOURS.textMuted }]}>
              {Math.round(overallRate * 100)}% complete
            </Text>
          </View>
        </View>

        {!hasData ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Ionicons name="bar-chart-outline" size={32} color={COLOURS.textMuted} style={{ opacity: 0.3 }} />
            <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 8 }}>
              No scores recorded yet
            </Text>
          </View>
        ) : (
          <>
            {/* Box plot */}
            {typeof q.maxScore === 'number' && (
              <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
                <Text style={qc.sectionLabel}>DISTRIBUTION</Text>
                <BoxPlot
                  groups={groups.filter(g => g.stats)}
                  maxVal={q.maxScore}
                  width={chartWidth - 24}
                  height={150}
                />
                {/* Legend */}
                {groups.length > 1 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 4 }}>
                    {groups.filter(g => g.stats).map(g => (
                      <View key={g.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: g.color }} />
                        <Text style={{ fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>{g.label}</Text>
                      </View>
                    ))}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 10, color: COLOURS.textMuted }}>◆ mean  ━ median</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Stats table */}
            <View style={{ marginTop: 8 }}>
              <Text style={[qc.sectionLabel, { paddingHorizontal: 12 }]}>STATISTICS</Text>
              <View style={st.header}>
                <View style={{ width: 14 }} />
                <Text style={[st.headerCell, { flex: 1.2 }]}>Group</Text>
                <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>n</Text>
                <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>Mean ± SD</Text>
                <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>Median</Text>
                <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>Range</Text>
              </View>
              {groups.map((g, i) => <StatRow key={g.label} {...g} />)}
            </View>

            {/* Completion rates */}
            {groups.length > 1 && (
              <View style={{ paddingHorizontal: 12, paddingBottom: 12, marginTop: 8 }}>
                <Text style={qc.sectionLabel}>COMPLETION BY GROUP</Text>
                {groups.map((g, i) => (
                  <View key={g.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, width: 80 }} numberOfLines={1}>{g.label}</Text>
                    <View style={{ flex: 1, height: 10, backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                      <View style={{ width: `${g.rate * 100}%`, height: '100%', backgroundColor: g.color, borderRadius: 5 }} />
                    </View>
                    <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, width: 36, textAlign: 'right' }}>
                      {Math.round(g.rate * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </BlurView>
  );
}

const qc = StyleSheet.create({
  card:        { borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 3 },
  header:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.07)' },
  title:       { fontSize: SIZES.body, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  subtitle:    { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, marginTop: 1 },
  sectionLabel:{ fontSize: 11, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  pill:        { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pillText:    { fontSize: 12, fontFamily: FONTS.bodyMedium },
});

// ─── Summary overview cards ───────────────────────────────────────────────────
function OverviewCards({ participants, allQs }) {
  const totalScores  = participants.reduce((s, p) => s + Object.keys(p.results ?? {}).length, 0);
  const scoredCount  = participants.filter(p => Object.keys(p.results ?? {}).length > 0).length;
  const avgCompletion = allQs.length > 0
    ? Math.round(allQs.reduce((s, q) => s + completionRate(participants, q.id), 0) / allQs.length * 100)
    : 0;

  const stats = [
    { icon: 'people',           label: 'Participants', value: participants.length },
    { icon: 'checkmark-circle', label: 'Scored',       value: scoredCount },
    { icon: 'bar-chart',        label: 'Total scores', value: totalScores },
    { icon: 'pie-chart',        label: 'Avg complete', value: `${avgCompletion}%` },
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
      {stats.map(({ icon, label, value }) => (
        <BlurView key={label} intensity={40} tint="light" style={{ flex: 1, minWidth: 120, borderRadius: 14, overflow: 'hidden' }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.55)', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={icon} size={20} color={COLOURS.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 22, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{value}</Text>
              <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>{label}</Text>
            </View>
          </View>
        </BlurView>
      ))}
    </View>
  );
}

// ─── Grouping pill selector ───────────────────────────────────────────────────
function GroupPicker({ value, onChange, participants }) {
  // Only show options where at least one participant has that field set
  const available = GROUP_OPTIONS.filter(opt => {
    if (opt.id === 'all') return true;
    return participants.some(p => p[opt.field]);
  });

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
      <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, alignSelf: 'center', marginRight: 4 }}>Group by</Text>
      {available.map(opt => {
        const active = value === opt.id;
        return (
          <TouchableOpacity key={opt.id}
            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, backgroundColor: active ? COLOURS.primary : 'rgba(255,255,255,0.72)', borderColor: active ? COLOURS.primary : 'rgba(255,255,255,0.9)', shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 }}
            onPress={() => onChange(opt.id)}
          >
            <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: active ? '#fff' : COLOURS.primary }}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const { width: screenW } = useWindowDimensions();
  const [participants, setParticipants] = useState([]);
  const [allQs,        setAllQs]        = useState(QUESTIONNAIRES);
  const [grouping,     setGrouping]     = useState('all');

  const load = useCallback(async () => {
    const [ps, customQs, disabledQs] = await Promise.all([
      loadParticipants(), loadCustomQuestionnaires(), loadDisabledQs(),
    ]);
    setParticipants(ps);
    setAllQs([...QUESTIONNAIRES, ...customQs].filter(q => !disabledQs.has(q.id)));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Questionnaires that have at least one score
  const scoredQs = allQs.filter(q =>
    participants.some(p => p.results?.[q.id] != null)
  );

  const groupField = GROUP_OPTIONS.find(o => o.id === grouping)?.field ?? 'all';

  // Chart width accounting for sidebar on desktop
  const chartWidth = isDesktop
    ? Math.min((screenW - SIDEBAR_TOTAL) / 2 - 32, 460)
    : screenW - 32;

  const content = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: isDesktop ? 24 : insets.top + 16,
        paddingBottom: 60,
        paddingHorizontal: isDesktop ? 20 : 16,
        paddingLeft: isDesktop ? SIDEBAR_TOTAL + 20 : 16,
      }}
    >
      <Text style={{ fontSize: isDesktop ? 32 : SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark, marginBottom: 4 }}>
        Analytics
      </Text>
      <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginBottom: 20 }}>
        Questionnaire outcomes across {participants.length} participant{participants.length !== 1 ? 's' : ''}
      </Text>

      {participants.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <Ionicons name="bar-chart-outline" size={52} color={COLOURS.textMuted} style={{ opacity: 0.4 }} />
          <Text style={{ fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>No data yet</Text>
          <Text style={{ fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 }}>
            Add participants and complete questionnaires to see analytics here.
          </Text>
        </View>
      ) : (
        <>
          <OverviewCards participants={participants} allQs={allQs} />

          <GroupPicker value={grouping} onChange={setGrouping} participants={participants} />

          {/* Completion overview — all questionnaires */}
          <BlurView intensity={36} tint="light" style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: 'rgba(74,123,181,0.08)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.52)', padding: 16 }}>
              <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
                COMPLETION RATES
              </Text>
              {allQs.map(q => {
                const rate = completionRate(participants, q.id);
                const n    = participants.filter(p => p.results?.[q.id] != null).length;
                return (
                  <View key={q.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, width: 76 }} numberOfLines={1}>{q.shortTitle}</Text>
                    <View style={{ flex: 1, height: 10, backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                      <View style={{ width: `${rate * 100}%`, height: '100%', backgroundColor: rate >= 0.8 ? COLOURS.success : rate >= 0.5 ? COLOURS.warning : COLOURS.primary, borderRadius: 5 }} />
                    </View>
                    <Text style={{ fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, width: 48, textAlign: 'right' }}>
                      {n}/{participants.length}
                    </Text>
                  </View>
                );
              })}
            </View>
          </BlurView>

          {/* Per-questionnaire cards */}
          {scoredQs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>No questionnaires scored yet</Text>
            </View>
          ) : (
            isDesktop ? (
              // Desktop: 2-column grid
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                {scoredQs.map(q => (
                  <View key={q.id} style={{ width: chartWidth }}>
                    <QCard q={q} participants={participants} groupField={groupField} chartWidth={chartWidth} />
                  </View>
                ))}
              </View>
            ) : (
              scoredQs.map(q => (
                <QCard key={q.id} q={q} participants={participants} groupField={groupField} chartWidth={chartWidth} />
              ))
            )
          )}
        </>
      )}
    </ScrollView>
  );

  if (isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: COLOURS.screenBg }}>
        <ScreenBackground />
        {content}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLOURS.screenBg }}>
      <ScreenBackground />
      {content}
    </View>
  );
}

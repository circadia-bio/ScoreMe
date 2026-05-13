/**
 * app/(tabs)/analytics.jsx — Questionnaire outcome analytics
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import ScreenBackground from '../../components/ScreenBackground';
import BoxPlot          from '../../components/charts/BoxPlot';
import { describe, groupBy, collectScores, completionRate, groupColor, round2 }
  from '../../components/charts/chartUtils';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { useLayout, SIDEBAR_TOTAL } from '../../theme/responsive';
import { loadParticipants, loadCustomQuestionnaires, loadDisabledQs, getLatestResult } from '../../storage/storage';
import { QUESTIONNAIRES } from '../../data/questionnaires';

// ─── Shared glass card wrapper — matches dashboard/participants recipe ─────────
function GlassCard({ children, style, intensity = 40 }) {
  return (
    <BlurView intensity={intensity} tint="light" style={[g.card, style]}>
      <View style={g.inner}>
        {children}
      </View>
    </BlurView>
  );
}
const g = StyleSheet.create({
  card:  { borderRadius: 16, overflow: 'hidden', shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 3 },
  inner: { backgroundColor: 'rgba(255,255,255,0.48)', flex: 1 },
});

// ─── Grouping options ─────────────────────────────────────────────────────────
const GROUP_OPTIONS = [
  { id: 'all',     label: 'All',     field: 'all'     },
  { id: 'group',   label: 'Group',   field: 'group'   },
  { id: 'sex',     label: 'Sex',     field: 'sex'     },
  { id: 'session', label: 'Session', field: 'session' },
  { id: 'site',    label: 'Site',    field: 'site'    },
];

// ─── Stats table ──────────────────────────────────────────────────────────────
function StatRow({ label, color, stats }) {
  return (
    <View style={st.row}>
      <View style={[st.dot, { backgroundColor: color }]} />
      <Text style={st.groupLabel} numberOfLines={1}>{label}</Text>
      {stats ? (
        <>
          <Text style={st.cell}>{stats.n}</Text>
          <Text style={st.cell}>{round2(stats.mean)} ± {round2(stats.sd)}</Text>
          <Text style={st.cell}>{round2(stats.median)}</Text>
          <Text style={st.cell}>{round2(stats.min)}–{round2(stats.max)}</Text>
        </>
      ) : (
        <Text style={[st.cell, { flex: 4, color: COLOURS.textMuted, fontStyle: 'italic' }]}>No data</Text>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  headerRow:  { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.07)', backgroundColor: 'rgba(74,123,181,0.04)' },
  headerCell: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.05)' },
  dot:        { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  groupLabel: { fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, flex: 1.4, minWidth: 0 },
  cell:       { fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, flex: 1.4, textAlign: 'right' },
});

// ─── Per-questionnaire card ───────────────────────────────────────────────────
function QCard({ q, participants, groupField, chartWidth }) {
  const groups = Object.entries(groupBy(participants, groupField)).map(([label, ps], i) => ({
    label,
    color: groupColor(i),
    stats: describe(collectScores(ps, q.id)),
    rate:  completionRate(ps, q.id),
  }));

  const overallRate = completionRate(participants, q.id);
  const hasData     = groups.some(g => g.stats !== null);
  const rateColor   = overallRate >= 0.8 ? COLOURS.success : overallRate >= 0.5 ? COLOURS.warning : COLOURS.textMuted;

  return (
    <GlassCard style={{ marginBottom: 14 }}>
      {/* Header */}
      <View style={qc.header}>
        <View style={{ flex: 1 }}>
          <Text style={qc.title}>{q.shortTitle}</Text>
          <Text style={qc.subtitle} numberOfLines={1}>{q.title}</Text>
        </View>
        <View style={[qc.pill, { borderColor: rateColor, backgroundColor: rateColor + '15', shadowColor: rateColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 2 }]}>
          <Text style={[qc.pillText, { color: rateColor }]}>{Math.round(overallRate * 100)}% complete</Text>
        </View>
      </View>

      {!hasData ? (
        <View style={{ padding: 28, alignItems: 'center', gap: 8 }}>
          <Ionicons name="bar-chart-outline" size={32} color={COLOURS.textMuted} style={{ opacity: 0.3 }} />
          <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>No scores yet</Text>
        </View>
      ) : (
        <>
          {/* Box plot */}
          {typeof q.maxScore === 'number' && (
            <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 }}>
              <Text style={qc.sectionLabel}>DISTRIBUTION</Text>
              <BoxPlot groups={groups.filter(g => g.stats)} maxVal={q.maxScore} width={chartWidth - 28} height={150} />
              {groups.length > 1 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                  {groups.filter(g => g.stats).map(g => (
                    <View key={g.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: g.color }} />
                      <Text style={{ fontSize: SIZES.meta, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>{g.label}</Text>
                    </View>
                  ))}
                  <Text style={{ fontSize: SIZES.meta, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>◆ mean  ━ median</Text>
                </View>
              )}
            </View>
          )}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: 'rgba(74,123,181,0.07)', marginTop: 8 }} />

          {/* Stats table */}
          <View>
            <Text style={[qc.sectionLabel, { paddingHorizontal: 14, paddingTop: 10 }]}>STATISTICS</Text>
            <View style={st.headerRow}>
              <View style={{ width: 16 }} />
              <Text style={[st.headerCell, { flex: 1.4 }]}>Group</Text>
              <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>n</Text>
              <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>Mean±SD</Text>
              <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>Median</Text>
              <Text style={[st.headerCell, { flex: 1.4, textAlign: 'right' }]}>Range</Text>
            </View>
            {groups.map(g => <StatRow key={g.label} {...g} />)}
          </View>

          {/* Per-group completion */}
          {groups.length > 1 && (
            <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
              <Text style={[qc.sectionLabel, { marginBottom: 8 }]}>COMPLETION BY GROUP</Text>
              {groups.map(g => (
                <View key={g.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Text style={{ fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, flexShrink: 1, minWidth: 40 }} numberOfLines={1}>{g.label}</Text>
                  <View style={{ flex: 1, height: 8, backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ width: `${g.rate * 100}%`, height: '100%', backgroundColor: g.color, borderRadius: 4 }} />
                  </View>
                  <Text style={{ fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, width: 34, textAlign: 'right' }}>{Math.round(g.rate * 100)}%</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </GlassCard>
  );
}

const qc = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(74,123,181,0.07)' },
  title:       { fontSize: SIZES.body, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  subtitle:    { fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, marginTop: 1 },
  sectionLabel:{ fontSize: SIZES.chip, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  pill:        { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pillText:    { fontSize: SIZES.meta, fontFamily: FONTS.bodyMedium },
});

// ─── Overview stat cards ──────────────────────────────────────────────────────
function OverviewCards({ participants, allQs }) {
  const totalScores   = participants.reduce((s, p) => s + Object.keys(p.results ?? {}).length, 0);
  const scoredCount   = participants.filter(p => Object.keys(p.results ?? {}).length > 0).length;
  const avgCompletion = allQs.length > 0
    ? Math.round(allQs.reduce((s, q) => s + completionRate(participants, q.id), 0) / allQs.length * 100)
    : 0;

  const items = [
    { icon: 'people',           label: 'Participants', value: participants.length,  color: COLOURS.primary, bg: 'rgba(74,123,181,0.12)'  },
    { icon: 'checkmark-circle', label: 'Scored',       value: scoredCount,           color: COLOURS.success, bg: 'rgba(46,125,50,0.10)'   },
    { icon: 'bar-chart',        label: 'Total scores', value: totalScores,           color: COLOURS.accent,  bg: 'rgba(224,122,32,0.12)'  },
    { icon: 'pie-chart',        label: 'Avg complete', value: `${avgCompletion}%`,   color: COLOURS.purple,  bg: 'rgba(107,63,160,0.10)'  },
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
      {items.map(({ icon, label, value, color, bg }) => (
        <BlurView key={label} intensity={44} tint="light"
          style={{ flex: 1, minWidth: 130, borderRadius: 18, overflow: 'hidden', shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 14, elevation: 4 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.55)', padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={icon} size={17} color={color} />
              </View>
              <Text style={{ fontSize: 26, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>{value}</Text>
            </View>
            <Text style={{ fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, letterSpacing: 0.3 }}>{label}</Text>
            <View style={{ height: 3, borderRadius: 2, backgroundColor: bg, overflow: 'hidden' }}>
              <View style={{ width: '100%', height: '100%', backgroundColor: color, opacity: 0.5 }} />
            </View>
          </View>
        </BlurView>
      ))}
    </View>
  );
}

// ─── Group-by pill row ────────────────────────────────────────────────────────
function GroupPicker({ value, onChange, participants }) {
  const available = GROUP_OPTIONS.filter(opt =>
    opt.id === 'all' || participants.some(p => p[opt.field])
  );
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 }}>Group by</Text>
      {available.map(opt => {
        const active = value === opt.id;
        return (
          <TouchableOpacity key={opt.id} activeOpacity={0.8}
            style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
              backgroundColor: active ? COLOURS.primary : 'rgba(255,255,255,0.72)',
              borderColor:     active ? COLOURS.primary : 'rgba(255,255,255,0.9)',
              shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 }}
            onPress={() => onChange(opt.id)}>
            <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: active ? '#fff' : COLOURS.primary }}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Completion overview panel ────────────────────────────────────────────────
function CompletionPanel({ participants, allQs }) {
  return (
    <GlassCard style={{ marginBottom: 20 }}>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
          COMPLETION RATES
        </Text>
        {allQs.map(q => {
          const rate = completionRate(participants, q.id);
          const n    = participants.filter(p => p.results?.[q.id] != null).length;
          const col  = rate >= 0.8 ? COLOURS.success : rate >= 0.5 ? COLOURS.warning : COLOURS.primary;
          return (
            <View key={q.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark, flexShrink: 1, minWidth: 48 }} numberOfLines={1}>{q.shortTitle}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: 'rgba(74,123,181,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${rate * 100}%`, height: '100%', backgroundColor: col, borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: SIZES.chip, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, width: 44, textAlign: 'right' }}>
                {n}/{participants.length}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
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

  const scoredQs   = allQs.filter(q => participants.some(p => p.results?.[q.id] != null));
  const groupField = GROUP_OPTIONS.find(o => o.id === grouping)?.field ?? 'all';
  const chartWidth = isDesktop
    ? Math.min((screenW - SIDEBAR_TOTAL) / 2 - 32, 460)
    : screenW - 32;

  const content = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop:    isDesktop ? 24 : insets.top + 16,
        paddingBottom: 60,
        paddingLeft:   isDesktop ? SIDEBAR_TOTAL + 20 : 16,
        paddingRight:  isDesktop ? 20 : 16,
      }}
    >
      {!isDesktop && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLOURS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 }}>
            <Ionicons name="bar-chart" size={20} color="#fff" />
          </View>
          <Text style={{ fontSize: SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>Analytics</Text>
        </View>
      )}
      {isDesktop && (
        <Text style={{ fontSize: 32, fontFamily: FONTS.heading, color: COLOURS.primaryDark, marginBottom: 4 }}>
          Analytics
        </Text>
      )}
      <Text style={{ fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginBottom: 20 }}>
        Questionnaire outcomes · {participants.length} participant{participants.length !== 1 ? 's' : ''}
      </Text>

      {participants.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <Ionicons name="bar-chart-outline" size={52} color={COLOURS.textMuted} style={{ opacity: 0.35 }} />
          <Text style={{ fontSize: SIZES.sectionTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark }}>No data yet</Text>
          <Text style={{ fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 }}>
            Add participants and complete questionnaires to see analytics here.
          </Text>
        </View>
      ) : (
        <>
          <OverviewCards participants={participants} allQs={allQs} />
          <GroupPicker value={grouping} onChange={setGrouping} participants={participants} />
          <CompletionPanel participants={participants} allQs={allQs} />

          {scoredQs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted }}>No questionnaires scored yet</Text>
            </View>
          ) : isDesktop ? (
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
          )}
        </>
      )}
    </ScrollView>
  );

  if (isDesktop) {
    return <View style={{ flex: 1, backgroundColor: 'transparent' }}>{content}</View>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      <ScreenBackground />
      {content}
    </View>
  );
}

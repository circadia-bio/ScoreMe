/**
 * app/(tabs)/_layout.jsx
 *
 * Exact music-log pattern:
 *   Desktop: desktopLayout (flex:1, position:relative) contains
 *     - DesktopSidebar (position:absolute, width:220, left:0)
 *     - desktopContent (flex:1) — screens render here
 *   Mobile: standard bottom tab bar
 *
 * Screens handle their own paddingLeft to clear the sidebar.
 */
import { Tabs, useRouter, usePathname } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, COLOURS } from '../../theme/typography';
import { useLayout } from '../../theme/responsive';
import DesktopBackground from '../../components/DesktopBackground';
import DesktopSidebar from '../../components/DesktopSidebar';
import OnboardingModal from '../../components/OnboardingModal';
import { DesktopExportModal } from '../export';
import { hasSeenOnboarding, markOnboardingComplete } from '../../storage/storage';

export default function TabLayout() {
  const { isDesktop } = useLayout();
  const router        = useRouter();
  const pathname      = usePathname();
  const [showExport,     setShowExport]     = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = 'ScoreMe';
  }, []);

  useEffect(() => {
    hasSeenOnboarding().then(seen => { if (!seen) setShowOnboarding(true); });
  }, []);

  const handleDismissOnboarding = async () => {
    await markOnboardingComplete();
    setShowOnboarding(false);
  };

  const activeTab =
    pathname.includes('participants')   ? 'participants'   :
    pathname.includes('questionnaires') ? 'questionnaires' :
    pathname.includes('analytics')      ? 'analytics'      : 'dashboard';

  // Custom tab icon — icon in rounded square, matching sidebar nav items
  const TabIcon = ({ name, nameActive, focused, label }) => (
    <View style={ti.wrap}>
      <View style={[ti.box, focused && ti.boxActive]}>
        <Ionicons
          name={focused ? nameActive : name}
          size={20}
          color={focused ? '#fff' : COLOURS.textMuted}
        />
      </View>
      <Text style={[ti.label, focused && ti.labelActive]}>{label}</Text>
    </View>
  );

  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : {
              backgroundColor: '#E2EDF8',
              borderTopColor: 'rgba(74,123,181,0.12)',
              borderTopWidth: 1,
              height: 72,
              paddingBottom: 0,
              paddingTop: 0,
            },
      }}
    >
      <Tabs.Screen name="index"          options={{ tabBarIcon: ({ focused }) => <TabIcon name="grid-outline"      nameActive="grid"       focused={focused} label="Dashboard"     /> }} />
      <Tabs.Screen name="participants"   options={{ tabBarIcon: ({ focused }) => <TabIcon name="people-outline"    nameActive="people"     focused={focused} label="Participants"  /> }} />
      <Tabs.Screen name="questionnaires" options={{ tabBarIcon: ({ focused }) => <TabIcon name="clipboard-outline" nameActive="clipboard"  focused={focused} label="Questionnaires" /> }} />
      <Tabs.Screen name="analytics"      options={{ tabBarIcon: ({ focused }) => <TabIcon name="bar-chart-outline" nameActive="bar-chart" focused={focused} label="Analytics"    /> }} />
    </Tabs>
  );

  if (isDesktop) {
    return (
      <View style={s.desktopOuter}>
        <DesktopBackground />
        {/* desktopLayout: flex row, position relative — sidebar is absolute inside */}
        <View style={s.desktopLayout}>
          <DesktopSidebar
            activeTab={activeTab}
            onNavigate={(tab) => {
              if (tab === 'dashboard')      router.push('/(tabs)');
              if (tab === 'participants')   router.push('/(tabs)/participants');
              if (tab === 'questionnaires') router.push('/(tabs)/questionnaires');
              if (tab === 'analytics')      router.push('/(tabs)/analytics');
            }}
            onExport={() => isDesktop ? setShowExport(true) : router.push('/export')}
          />
          {/* desktopContent: flex 1, screens render here */}
          <View style={s.desktopContent}>
            {tabs}
          </View>
        </View>
        <DesktopExportModal visible={showExport} onClose={() => setShowExport(false)} />
        <OnboardingModal visible={showOnboarding} onDismiss={handleDismissOnboarding} />
      </View>
    );
  }

  return (
    <>
      {tabs}
      <OnboardingModal visible={showOnboarding} onDismiss={handleDismissOnboarding} />
    </>
  );
}

const s = StyleSheet.create({
  desktopOuter:   { flex: 1 },
  desktopLayout:  { flex: 1, flexDirection: 'row', alignItems: 'stretch', position: 'relative' },
  desktopContent: { flex: 1, overflow: 'hidden' },
});

const ti = StyleSheet.create({
  wrap:        { alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 8 },
  box:         { width: 40, height: 36, borderRadius: 10, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  boxActive:   { backgroundColor: COLOURS.primary, shadowColor: 'rgba(74,123,181,0.40)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
  label:       { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.textMuted, letterSpacing: 0.1 },
  labelActive: { color: COLOURS.primary, fontFamily: FONTS.bodyMedium },
});

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
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, COLOURS } from '../../theme/typography';
import { useLayout } from '../../theme/responsive';
import DesktopBackground from '../../components/DesktopBackground';
import DesktopSidebar from '../../components/DesktopSidebar';
import OnboardingModal from '../../components/OnboardingModal';
import { DesktopExportModal } from '../export';
import { hasSeenOnboarding } from '../../storage/storage';

export default function TabLayout() {
  const { isDesktop } = useLayout();
  const router        = useRouter();
  const pathname      = usePathname();
  const [showExport,     setShowExport]     = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    hasSeenOnboarding().then(seen => { if (!seen) setShowOnboarding(true); });
  }, []);

  const activeTab =
    pathname.includes('participants')   ? 'participants'   :
    pathname.includes('questionnaires') ? 'questionnaires' :
    pathname.includes('analytics')      ? 'analytics'      : 'dashboard';

  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLOURS.primary,
        tabBarInactiveTintColor: COLOURS.textMuted,
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : { backgroundColor: 'rgba(238,245,255,0.97)', borderTopColor: 'rgba(200,223,245,0.6)', borderTopWidth: 1 },
        tabBarLabelStyle: { fontFamily: FONTS.body, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index"          options={{ title: 'Dashboard',     tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline"         color={color} size={size} /> }} />
      <Tabs.Screen name="participants"   options={{ title: 'Participants',   tabBarIcon: ({ color, size }) => <Ionicons name="people-outline"       color={color} size={size} /> }} />
      <Tabs.Screen name="questionnaires" options={{ title: 'Questionnaires', tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline"    color={color} size={size} /> }} />
      <Tabs.Screen name="analytics"      options={{ title: 'Analytics',     tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline"    color={color} size={size} /> }} />
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
        <OnboardingModal visible={showOnboarding} onDismiss={() => setShowOnboarding(false)} />
      </View>
    );
  }

  return (
    <>
      {tabs}
      <OnboardingModal visible={showOnboarding} onDismiss={() => setShowOnboarding(false)} />
    </>
  );
}

const s = StyleSheet.create({
  desktopOuter:   { flex: 1 },
  desktopLayout:  { flex: 1, flexDirection: 'row', alignItems: 'stretch', position: 'relative' },
  desktopContent: { flex: 1, overflow: 'hidden' },
});

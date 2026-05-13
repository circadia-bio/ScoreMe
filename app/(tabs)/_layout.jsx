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
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  // Custom bottom tab bar — full control over layout
  const NAV_ITEMS = [
    { name: 'index',          route: '/(tabs)',                  icon: 'grid-outline',      iconActive: 'grid',       label: 'Dashboard'      },
    { name: 'participants',   route: '/(tabs)/participants',     icon: 'people-outline',    iconActive: 'people',     label: 'Participants'   },
    { name: 'questionnaires', route: '/(tabs)/questionnaires',  icon: 'clipboard-outline', iconActive: 'clipboard',  label: 'Questionnaires' },
    { name: 'analytics',     route: '/(tabs)/analytics',       icon: 'bar-chart-outline', iconActive: 'bar-chart',  label: 'Analytics'     },
  ];

  function CustomTabBar({ state, navigation }) {
    const insets = useSafeAreaInsets();
    return (
      <View style={[tb.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {NAV_ITEMS.map((item, i) => {
          const focused = state.index === i;
          return (
            <TouchableOpacity
              key={item.name}
              style={tb.item}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.8}
            >
              <View style={[tb.box, focused && tb.boxActive]}>
                <Ionicons
                  name={focused ? item.iconActive : item.icon}
                  size={20}
                  color={focused ? '#fff' : COLOURS.textMuted}
                />
              </View>
              <Text style={[tb.label, focused && tb.labelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const tabs = (
    <Tabs
      tabBar={isDesktop ? () => null : (props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="participants" />
      <Tabs.Screen name="questionnaires" />
      <Tabs.Screen name="analytics" />
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

const tb = StyleSheet.create({
  bar:       {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderTopWidth: 1,
    borderTopColor: 'rgba(74,123,181,0.12)',
    paddingTop: 8,
  },
  item:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  box:       { width: 40, height: 36, borderRadius: 10, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center' },
  boxActive: { backgroundColor: COLOURS.primary, shadowColor: 'rgba(74,123,181,0.40)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
  label:     { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.textMuted, letterSpacing: 0.1 },
  labelActive: { color: COLOURS.primary, fontFamily: FONTS.bodyMedium },
});

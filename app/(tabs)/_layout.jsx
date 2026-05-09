/**
 * app/(tabs)/_layout.jsx
 *
 * Tab bar is hidden on desktop (≥1024px) — navigation handled by DesktopSidebar.
 * On mobile/tablet the standard tab bar is shown.
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, COLOURS } from '../../theme/typography';
import { useLayout } from '../../theme/responsive';

export default function TabLayout() {
  const { isDesktop } = useLayout();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   COLOURS.primary,
        tabBarInactiveTintColor: COLOURS.textMuted,
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : {
              backgroundColor: 'rgba(238,245,255,0.97)',
              borderTopColor:  'rgba(200,223,245,0.6)',
              borderTopWidth:  1,
            },
        tabBarLabelStyle: {
          fontFamily: FONTS.body,
          fontSize:   12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="participants"
        options={{
          title: 'Participants',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="questionnaires"
        options={{
          title: 'Questionnaires',
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

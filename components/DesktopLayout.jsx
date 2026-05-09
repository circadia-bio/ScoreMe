/**
 * components/DesktopLayout.jsx
 *
 * Desktop shell: sidebar on the left, scrollable content on the right.
 * The root is a row — sidebar is fixed width, content area takes all remaining space.
 */
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DesktopBackground from './DesktopBackground';
import DesktopSidebar from './DesktopSidebar';
import { SIDEBAR_W } from '../theme/responsive';

const SIDEBAR_MARGIN = 16; // matches sidebar's own margin in DesktopSidebar

export default function DesktopLayout({ children, activeTab, onNavigate, onExport }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <DesktopBackground />

      {/* Row: sidebar + content side by side */}
      <View style={[s.row, { paddingTop: insets.top }]}>

        {/* Sidebar occupies its fixed column — the floating BlurView is positioned inside */}
        <View style={s.sidebarCol}>
          <DesktopSidebar
            activeTab={activeTab}
            onNavigate={onNavigate}
            onExport={onExport}
          />
        </View>

        {/* Content fills everything to the right */}
        <View style={s.contentCol}>
          <ScrollView
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>

      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarCol: {
    // Same total width as the sidebar + its margins so content aligns flush
    width: SIDEBAR_W + SIDEBAR_MARGIN * 2,
  },
  contentCol: {
    flex: 1,
  },
  scrollContent: {
    padding: 28,
    paddingBottom: 60,
  },
});

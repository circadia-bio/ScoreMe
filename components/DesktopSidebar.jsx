/**
 * components/DesktopSidebar.jsx
 *
 * Desktop left-rail navigation. Floating glass pill inside its column.
 * Uses margin rather than position:absolute so the layout flow is correct.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLOURS, FONTS } from '../theme/typography';

const NAV = [
  { id: 'dashboard',      label: 'Dashboard',     icon: 'grid',      iconOut: 'grid-outline'      },
  { id: 'participants',   label: 'Participants',   icon: 'people',    iconOut: 'people-outline'    },
  { id: 'questionnaires', label: 'Questionnaires', icon: 'clipboard', iconOut: 'clipboard-outline' },
];

export default function DesktopSidebar({ activeTab, onNavigate, onExport }) {
  return (
    <BlurView intensity={40} tint="light" style={s.sidebar}>
      {/* Wordmark */}
      <View style={s.logoRow}>
        <View style={s.logoIcon}>
          <Ionicons name="moon" size={18} color="#fff" />
        </View>
        <Text style={s.logoText}>ScoreMe</Text>
      </View>

      {/* Nav */}
      <View style={s.navContainer}>
        {NAV.map((item) => {
          const active = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[s.navItem, active && s.navItemActive]}
              onPress={() => onNavigate(item.id)}
              activeOpacity={0.75}
            >
              <View style={[s.iconWrap, active && s.iconWrapActive]}>
                <Ionicons
                  name={active ? item.icon : item.iconOut}
                  size={19}
                  color={active ? '#fff' : COLOURS.primary}
                />
              </View>
              <Text style={[s.navLabel, active && s.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {/* Export shortcut */}
      <TouchableOpacity style={s.exportBtn} onPress={onExport} activeOpacity={0.8}>
        <Ionicons name="download-outline" size={18} color={COLOURS.primary} />
        <Text style={s.exportLabel}>Export CSV</Text>
      </TouchableOpacity>
    </BlurView>
  );
}

const s = StyleSheet.create({
  sidebar: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.30)',
    shadowColor: 'rgba(74,123,181,0.18)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'web' ? 28 : 52,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLOURS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLOURS.primaryDark,
    letterSpacing: -0.3,
  },
  navContainer: {
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderRadius: 16,
    padding: 6,
    shadowColor: 'rgba(74,123,181,0.10)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(74,123,181,0.10)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(74,123,181,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLOURS.primary,
  },
  navLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLOURS.textMuted,
  },
  navLabelActive: {
    fontFamily: FONTS.body,
    color: COLOURS.primaryDark,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(74,123,181,0.08)',
  },
  exportLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLOURS.primary,
  },
});

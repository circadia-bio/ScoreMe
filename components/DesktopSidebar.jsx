/**
 * components/DesktopSidebar.jsx
 *
 * Music-log Sidebar pattern — position:absolute, floats inside desktopLayout.
 * Tap the wordmark to open the About sheet.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Linking, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { COLOURS, FONTS, SIZES } from '../theme/typography';

export const SIDEBAR_W = 220;

const NAV = [
  { id: 'dashboard',      label: 'Dashboard',     icon: 'grid',       iconOut: 'grid-outline'      },
  { id: 'participants',   label: 'Participants',   icon: 'people',     iconOut: 'people-outline'    },
  { id: 'questionnaires', label: 'Questionnaires', icon: 'clipboard',  iconOut: 'clipboard-outline' },
  { id: 'analytics',      label: 'Analytics',      icon: 'bar-chart',  iconOut: 'bar-chart-outline' },
];

// ─── About modal ──────────────────────────────────────────────────────────────
function AboutModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={am.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[am.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={am.inner}>

            {/* Close */}
            <TouchableOpacity style={am.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLOURS.textMuted} />
            </TouchableOpacity>

            {/* Logo */}
            <Image source={require('../assets/images/logo.png')} style={am.logo} resizeMode="contain" />

            {/* Meta */}
            <Text style={am.version}>v{version}</Text>
            <Text style={am.copy}>© Circadia Lab</Text>
            <Text style={am.licence}>MIT Licence</Text>

            <View style={am.divider} />

            {/* Team */}
            <Text style={am.sectionLabel}>RESEARCHERS</Text>
            <Text style={am.name}>Lucas França</Text>
            <Text style={am.name}>Mario Leocadio-Miguel</Text>

            <View style={am.divider} />

            {/* Links */}
            <TouchableOpacity onPress={() => Linking.openURL('https://circadia-lab.uk')}>
              <Text style={am.link}>circadia-lab.uk</Text>
            </TouchableOpacity>

            <Text style={am.heart}>Made with ❤️</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const am = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(30,58,95,0.35)', alignItems: 'center', justifyContent: 'center' },
  sheet:       { width: 300, borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(238,245,255,0.97)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: 'rgba(74,123,181,0.25)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 32, elevation: 12 },
  inner:       { padding: 28, alignItems: 'center', gap: 6 },
  closeBtn:    { position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(74,123,181,0.10)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  logo:       { width: 160, height: 60, marginBottom: 4 },
  version:     { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  copy:        { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  licence:     { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
  divider:     { width: '80%', height: 1, backgroundColor: 'rgba(74,123,181,0.12)', marginVertical: 6 },
  sectionLabel:{ fontSize: 11, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  name:        { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.primaryDark },
  link:        { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary, textDecorationLine: 'underline', marginTop: 4 },
  heart:       { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.textMuted, marginTop: 8 },
});

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function DesktopSidebar({ activeTab, onNavigate, onExport }) {
  const insets = useSafeAreaInsets();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <BlurView intensity={40} tint="light" style={[s.sidebar, { paddingTop: Math.max(insets.top, 24) }]}>

        {/* Wordmark — tap to open About */}
        <TouchableOpacity style={s.logoRow} onPress={() => setShowAbout(true)} activeOpacity={0.75}>
          <View style={s.logoIcon}>
            <Ionicons name="document-text" size={18} color="#fff" />
          </View>
          <Text style={s.logoText}>Score<Text style={{ color: COLOURS.accent }}>Me</Text></Text>
        </TouchableOpacity>

        {/* Nav */}
        <View style={s.navContainer}>
          {NAV.map(item => {
            const active = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[s.navItem, active && s.navItemActive]}
                onPress={() => onNavigate(item.id)}
                activeOpacity={0.75}
              >
                <View style={[s.iconWrap, active && s.iconWrapActive]}>
                  <Ionicons name={active ? item.icon : item.iconOut} size={20} color="#fff" />
                </View>
                <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={s.exportBtn} onPress={onExport} activeOpacity={0.8}>
          <Ionicons name="download-outline" size={18} color={COLOURS.primary} />
          <Text style={s.exportLabel}>Export Data</Text>
        </TouchableOpacity>
      </BlurView>

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}

const s = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_W,
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    marginTop: 24,
    marginLeft: 14,
    marginRight: 12,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.28)',
    shadowColor: 'rgba(74,123,181,0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    overflow: 'hidden',
    paddingBottom: 24,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  logoRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  logoIcon:      { width: 32, height: 32, borderRadius: 8, backgroundColor: COLOURS.primary, alignItems: 'center', justifyContent: 'center' },
  logoText:      { fontFamily: FONTS.heading, fontSize: 24, color: COLOURS.primaryDark, letterSpacing: -0.3 },
  navContainer:  { gap: 2, backgroundColor: 'rgba(255,255,255,0.50)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.70)', padding: 6, shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  navItem:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 12 },
  navItemActive: { backgroundColor: 'rgba(74,123,181,0.10)' },
  iconWrap:      { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(74,123,181,0.15)', alignItems: 'center', justifyContent: 'center' },
  iconWrapActive:{ backgroundColor: COLOURS.primary },
  navLabel:      { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLOURS.textMuted },
  navLabelActive:{ fontFamily: FONTS.body, color: COLOURS.primaryDark },
  exportBtn:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: 'rgba(74,123,181,0.12)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  exportLabel:   { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLOURS.primary },
});

/**
 * components/GlassCard.jsx
 *
 * Reusable glass card for desktop/tablet views.
 * BlurView on native, rgba fallback on web.
 * No hard border — shadow-only depth (music-log convention).
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

const SHADOW = {
  shadowColor:   'rgba(74,123,181,0.14)',
  shadowOffset:  { width: 0, height: 6 },
  shadowOpacity: 1,
  shadowRadius:  22,
  elevation:     5,
};

export default function GlassCard({ children, style, intensity = 45, padding = 20 }) {
  if (Platform.OS === 'web') {
    return (
      <View style={[s.webCard, SHADOW, style]}>
        <View style={{ padding }}>{children}</View>
      </View>
    );
  }
  return (
    <BlurView intensity={intensity} tint="light" style={[s.blurWrap, SHADOW, style]}>
      <View style={[s.inner, { padding }]}>{children}</View>
    </BlurView>
  );
}

const s = StyleSheet.create({
  blurWrap: { borderRadius: 18, overflow: 'hidden' },
  inner:    { backgroundColor: 'rgba(255,255,255,0.55)' },
  webCard:  { borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.68)' },
});

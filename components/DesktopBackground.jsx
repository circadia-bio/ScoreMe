/**
 * components/DesktopBackground.jsx
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function DesktopBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F2F2' }]} pointerEvents="none" />
  );
}

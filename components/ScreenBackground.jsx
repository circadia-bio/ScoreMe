/**
 * components/ScreenBackground.jsx
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ScreenBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F2F2F2' }]} pointerEvents="none" />
  );
}

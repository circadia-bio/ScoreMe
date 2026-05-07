/**
 * components/ScreenBackground.jsx
 * Soft blue gradient background — mirrors SleepDiaries visual identity.
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, Ellipse } from 'react-native-svg';

export default function ScreenBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        viewBox="0 0 393 852"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="bg1" cx="50%" cy="0%" r="80%">
            <Stop offset="0%" stopColor="#C8DFF5" stopOpacity="1" />
            <Stop offset="100%" stopColor="#EEF5FF" stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#4A7BB5" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#4A7BB5" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#6B3FA0" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#6B3FA0" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="393" height="852" fill="url(#bg1)" />
        <Ellipse cx="320" cy="120" rx="180" ry="160" fill="url(#blob1)" />
        <Ellipse cx="60"  cy="500" rx="160" ry="200" fill="url(#blob2)" />
        <Ellipse cx="350" cy="720" rx="140" ry="120" fill="url(#blob1)" />
      </Svg>
    </View>
  );
}

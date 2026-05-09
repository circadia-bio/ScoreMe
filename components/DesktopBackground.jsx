/**
 * components/DesktopBackground.jsx
 *
 * Desktop/tablet background: flat blue base + subtle dot grid.
 * Same pattern as music-log's AppBackground, ScoreMe colours.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Pattern, Defs } from 'react-native-svg';

export default function DesktopBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#E2EDF8' }]} />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="sdots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="1.5" cy="1.5" r="1.5" fill="rgba(74,123,181,0.16)" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sdots)" />
      </Svg>
    </View>
  );
}

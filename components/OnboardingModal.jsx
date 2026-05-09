/**
 * components/OnboardingModal.jsx
 *
 * First-run modal sheet. Shown once over the main tabs.
 * Three short slides — swipe or tap Next. Dismiss with Get started.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { FONTS, SIZES, COLOURS } from '../theme/typography';

const STEPS = [
  {
    icon:  'people-outline',
    color: COLOURS.primary,
    title: 'Add participants',
    body:  'Create a profile for each research participant and track their questionnaire progress in one place.',
  },
  {
    icon:  'clipboard-outline',
    color: '#6B3FA0',
    title: 'Score questionnaires',
    body:  '8 validated sleep instruments built in. Import custom ones as JSON. Scores are computed automatically.',
  },
  {
    icon:  'download-outline',
    color: '#E07A20',
    title: 'Export your data',
    body:  'Download all participant responses as a tidy CSV or a full JSON with item-level answers.',
  },
];

export default function OnboardingModal({ visible, onDismiss }) {
  const [step, setStep] = useState(0);
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const animateTo = (nextStep) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) animateTo(step + 1);
    else onDismiss();
  };

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Dimmed backdrop — tap to dismiss */}
      <TouchableOpacity
        style={s.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      />

      {/* Sheet */}
      <View style={s.sheet}>
        <BlurView intensity={52} tint="light" style={StyleSheet.absoluteFill} />
        <View style={s.sheetInner}>

      {/* No handle for centred modal */}

          {/* Dismiss */}
          <TouchableOpacity style={s.closeBtn} onPress={onDismiss} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={18} color={COLOURS.textMuted} />
          </TouchableOpacity>

          {/* Animated content */}
          <Animated.View style={[s.content, { opacity: fadeAnim }]}>
            {/* Icon */}
            <View style={[s.iconWrap, { backgroundColor: current.color + '12', borderColor: current.color + '30' }]}>
              <Ionicons name={current.icon} size={34} color={current.color} />
            </View>

            <Text style={s.title}>{current.title}</Text>
            <Text style={s.body}>{current.body}</Text>
          </Animated.View>

          {/* Dots + actions */}
          <View style={s.footer}>
            {/* Step dots */}
            <View style={s.dots}>
              {STEPS.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => animateTo(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <View style={[s.dot, i === step && s.dotActive, i === step && { backgroundColor: current.color }]} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <View style={s.btnRow}>
              {!isLast && (
                <TouchableOpacity style={s.skipBtn} onPress={onDismiss} activeOpacity={0.7}>
                  <Text style={s.skipText}>Skip</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.nextBtn, { backgroundColor: current.color, flex: isLast ? 0 : 1 }]}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={s.nextText}>{isLast ? 'Get started' : 'Next'}</Text>
                {!isLast && <Ionicons name="chevron-forward" size={16} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,58,95,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  sheet: {
    width: 340,
    height: 340,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(238,245,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(74,123,181,0.25)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1, shadowRadius: 32, elevation: 16,
  },
  sheetInner: { flex: 1, padding: 28, gap: 0 },

  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(74,123,181,0.25)',
    alignSelf: 'center', marginBottom: 4,
  },
  closeBtn: {
    position: 'absolute', top: 20, right: 20,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(74,123,181,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  iconWrap: {
    width: 60, height: 60, borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontFamily: FONTS.heading, color: COLOURS.primaryDark, textAlign: 'center' },
  body:  { fontSize: SIZES.bodySmall, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 4 },

  footer: { gap: 10 },
  dots:   { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(74,123,181,0.20)' },
  dotActive: { width: 24 },

  btnRow:  { flexDirection: 'row', gap: 10 },
  skipBtn: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  skipText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14,
    shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 5,
  },
  nextText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },

  logo: { width: 120, height: 42, alignSelf: 'center', opacity: 0.55, marginTop: 4 },
});

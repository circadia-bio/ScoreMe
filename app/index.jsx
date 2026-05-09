/**
 * app/index.jsx — First-run onboarding gate
 */
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../theme/typography';
import { hasSeenOnboarding, markOnboardingComplete } from '../storage/storage';

const STEPS = [
  {
    icon:  'clipboard-outline',
    title: 'Research-grade scoring',
    body:  'Administer and score validated sleep health and clinical questionnaires across multiple research participants.',
  },
  {
    icon:  'people-outline',
    title: 'Manage participants',
    body:  'Add participants, run questionnaires one by one, and track completion progress across your cohort.',
  },
  {
    icon:  'cloud-upload-outline',
    title: 'Extend with custom instruments',
    body:  'Import any questionnaire as a JSON file following the built-in schema. Export all data as CSV or JSON.',
  },
];

export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [step,  setStep]  = useState(0);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    hasSeenOnboarding().then(seen => {
      if (seen) { router.replace('/(tabs)'); }
      else      { setReady(true); animateIn(); }
    });
  }, []);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
    ]).start();
  };

  const goNext = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setStep(s => s + 1);
      animateIn();
    });
  };

  const finish = async () => {
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  if (!ready) return null;

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <View style={s.root}>
      <ScreenBackground />

      <View style={[s.logoWrap, { paddingTop: insets.top + 32 }]}>
        <Image source={require('../assets/images/logo.png')} style={s.logo} resizeMode="contain" />
      </View>

      <View style={s.center}>
        <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.iconPill}>
            <Ionicons name={current.icon} size={36} color={COLOURS.primary} />
          </View>
          <Text style={s.title}>{current.title}</Text>
          <Text style={s.body}>{current.body}</Text>
          <View style={s.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[s.dot, i === step && s.dotActive]} />
            ))}
          </View>
        </Animated.View>
      </View>

      <View style={[s.actions, { paddingBottom: insets.bottom + 32 }]}>
        {isLast ? (
          <TouchableOpacity style={[s.primaryBtn, { flex: 0 }]} onPress={finish} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={s.primaryBtnText}>Get started</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.navRow}>
            <TouchableOpacity style={s.skipBtn} onPress={finish} activeOpacity={0.7}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.primaryBtn} onPress={goNext} activeOpacity={0.85}>
              <Text style={s.primaryBtnText}>Next</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1 },
  logoWrap:  { alignItems: 'center' },
  logo:      { width: 160, height: 56, opacity: 0.9 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  card: {
    width: '100%', maxWidth: 440,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    padding: 32, alignItems: 'center', gap: 16,
    shadowColor: 'rgba(74,123,181,0.18)', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 6,
  },
  iconPill: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(74,123,181,0.08)',
    borderWidth: 1, borderColor: 'rgba(74,123,181,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title:     { fontSize: 24, fontFamily: FONTS.heading, color: COLOURS.primaryDark, textAlign: 'center', lineHeight: 32 },
  body:      { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textSecondary, textAlign: 'center', lineHeight: 26 },
  dots:      { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(74,123,181,0.20)' },
  dotActive: { backgroundColor: COLOURS.primary, width: 24 },
  actions:   { paddingHorizontal: 28 },
  navRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skipBtn: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: 'rgba(74,123,181,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  skipText:      { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primary },
  primaryBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 24,
    backgroundColor: COLOURS.primary, borderRadius: 14,
    shadowColor: 'rgba(74,123,181,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 5,
  },
  primaryBtnText: { fontSize: SIZES.body, fontFamily: FONTS.body, color: '#fff' },
});

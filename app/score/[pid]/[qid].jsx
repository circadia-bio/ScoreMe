/**
 * app/score/[pid]/[qid].jsx — Questionnaire scoring screen
 *
 * Wraps QuestionnaireRunner for a specific participant + questionnaire.
 * On completion, saves the result and navigates back to the participant screen.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QuestionnaireRunner from '../../../components/QuestionnaireRunner';
import ScreenBackground from '../../../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../../../theme/typography';
import { loadParticipants, saveResult } from '../../../storage/storage';
import { QUESTIONNAIRES } from '../../../data/questionnaires';

export default function ScoreScreen() {
  const { pid, qid } = useLocalSearchParams();
  const router       = useRouter();
  const insets       = useSafeAreaInsets();

  const [participant, setParticipant] = useState(null);
  const questionnaire = QUESTIONNAIRES.find((q) => q.id === qid) ?? null;

  useFocusEffect(useCallback(() => {
    loadParticipants().then((ps) => setParticipant(ps.find((p) => p.id === pid) ?? null));
  }, [pid]));

  if (!participant || !questionnaire) {
    return (
      <View style={s.root}>
        <ScreenBackground />
        <Text style={s.notFound}>Questionnaire not found.</Text>
      </View>
    );
  }

  const handleComplete = async (answers, score) => {
    await saveResult(pid, qid, answers, score);
    // Navigate back two levels — back to participant screen
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLOURS.screenBg }}>
      <ScreenBackground />
      <QuestionnaireRunner
        questionnaire={questionnaire}
        onComplete={handleComplete}
        onBack={() => router.back()}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: SIZES.body, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted },
});

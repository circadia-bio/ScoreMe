/**
 * app/(tabs)/questionnaires.jsx — Questionnaire library
 *
 * Shows all built-in + custom imported questionnaires.
 * Users can import a custom questionnaire as a JSON file.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import ScreenBackground from '../../components/ScreenBackground';
import { FONTS, SIZES, COLOURS } from '../../theme/typography';
import { QUESTIONNAIRES } from '../../data/questionnaires';
import { loadCustomQuestionnaires, saveCustomQuestionnaire, deleteCustomQuestionnaire } from '../../storage/storage';

export default function QuestionnairesScreen() {
  const insets = useSafeAreaInsets();
  const [customQs, setCustomQs] = useState([]);

  const load = useCallback(async () => {
    setCustomQs(await loadCustomQuestionnaires());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;

      const response = await fetch(result.assets[0].uri);
      const text     = await response.text();
      const parsed   = JSON.parse(text);

      // Validate minimal required fields
      if (!parsed.id || !parsed.title || !Array.isArray(parsed.items) || typeof parsed.score !== 'undefined') {
        // For custom questionnaires, score/interpret can be simple or omitted
      }
      if (!parsed.id || !parsed.title || !Array.isArray(parsed.items)) {
        Alert.alert('Invalid questionnaire', 'The JSON file must have at minimum: id, title, items[].');
        return;
      }

      // If score/interpret are strings (serialised functions), skip — just store the definition
      await saveCustomQuestionnaire(parsed);
      load();
      Alert.alert('Imported!', `"${parsed.title}" has been added to your library.`);
    } catch (e) {
      Alert.alert('Import failed', e.message);
    }
  };

  const handleDeleteCustom = (q) => {
    Alert.alert('Remove questionnaire', `Remove "${q.title}" from your library? This does not affect scores already collected.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteCustomQuestionnaire(q.id); load(); } },
    ]);
  };

  const allQs = [...QUESTIONNAIRES, ...customQs];

  return (
    <View style={s.root}>
      <ScreenBackground />

      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <Text style={s.title}>Questionnaires</Text>
        <TouchableOpacity style={s.importBtn} onPress={handleImport}>
          <Ionicons name="cloud-upload-outline" size={18} color={COLOURS.primary} />
          <Text style={s.importBtnText}>Import JSON</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>

        <Text style={s.sectionLabel}>BUILT-IN ({QUESTIONNAIRES.length})</Text>
        <View style={s.card}>
          {QUESTIONNAIRES.map((q, i, arr) => (
            <View key={q.id}>
              <View style={s.qRow}>
                <View style={{ flex: 1 }}>
                  <View style={s.titleRow}>
                    <Text style={s.qTitle}>{q.title}</Text>
                    {q.beta && <View style={s.betaChip}><Text style={s.betaChipText}>BETA</Text></View>}
                  </View>
                  <Text style={s.qShort}>{q.shortTitle} · {q.items.length} items</Text>
                  <Text style={s.qRef} numberOfLines={2}>{q.reference}</Text>
                </View>
                <View style={s.builtInBadge}>
                  <Ionicons name="lock-closed-outline" size={14} color={COLOURS.textMuted} />
                </View>
              </View>
              {i < arr.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        {customQs.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { marginTop: 18 }]}>CUSTOM ({customQs.length})</Text>
            <View style={s.card}>
              {customQs.map((q, i, arr) => (
                <View key={q.id}>
                  <View style={s.qRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.qTitle}>{q.title}</Text>
                      <Text style={s.qShort}>{q.shortTitle ?? q.id} · {q.items?.length ?? '?'} items</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteCustom(q)} style={s.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color={COLOURS.danger} />
                    </TouchableOpacity>
                  </View>
                  {i < arr.length - 1 && <View style={s.divider} />}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={s.importHint}>
          <Ionicons name="information-circle-outline" size={18} color={COLOURS.primary} />
          <Text style={s.importHintText}>
            You can import custom questionnaires as JSON files following the same schema as the built-in ones (id, title, shortTitle, instructions, items[], score, interpret).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  title:   { fontSize: SIZES.screenTitle, fontFamily: FONTS.heading, color: COLOURS.primaryDark },
  importBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,123,181,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  importBtnText: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.primary },
  content: { paddingHorizontal: 16, gap: 10 },
  sectionLabel: { fontSize: SIZES.label, fontFamily: FONTS.body, color: COLOURS.accent, textTransform: 'uppercase', letterSpacing: 0.8 },

  card:    { backgroundColor: COLOURS.cardBg, borderRadius: 16, borderWidth: 1, borderColor: COLOURS.cardBorder, overflow: 'hidden' },
  qRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  titleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  qTitle:  { fontSize: SIZES.body, fontFamily: FONTS.body, color: COLOURS.primaryDark },
  qShort:  { fontSize: SIZES.caption, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, marginTop: 2 },
  qRef:    { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.textMuted, marginTop: 3, lineHeight: 18 },
  betaChip:{ backgroundColor: COLOURS.purpleBg, borderWidth: 1, borderColor: COLOURS.purpleLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  betaChipText: { fontSize: 11, fontFamily: FONTS.body, color: COLOURS.purple },
  builtInBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  deleteBtn:    { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },

  importHint: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(74,123,181,0.07)', borderRadius: 12, padding: 14, marginTop: 8 },
  importHintText: { flex: 1, fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLOURS.primary, lineHeight: 20 },
});

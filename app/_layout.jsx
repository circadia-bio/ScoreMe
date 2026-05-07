/**
 * app/_layout.jsx — Root layout for ScoreMe
 *
 * Loads custom fonts shared with SleepDiaries (Livvic, Afacad).
 * Falls back gracefully if fonts haven't been copied yet — the app will still
 * work with system fonts until `assets/fonts/` is populated.
 *
 * Web: constrains the layout to 480px centred, matching SleepDiaries' web shell.
 */
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function useAppFonts() {
  try {
    return useFonts({
      'Livvic-Bold':    require('../assets/fonts/Livvic-Bold.ttf'),
      'Afacad-Bold':    require('../assets/fonts/Afacad-Bold.ttf'),
      'Afacad-Medium':  require('../assets/fonts/Afacad-Medium.ttf'),
      'Afacad-Regular': require('../assets/fonts/Afacad-Regular.ttf'),
    });
  } catch {
    return [true, null];
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  if (!fontsLoaded) return null;

  const content = (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="participant/[id]"  options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="score/[pid]/[qid]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="export"            options={{ animation: 'slide_from_right' }} />
      </Stack>
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={s.webOuter}>
        <View style={s.webInner}>{content}</View>
      </View>
    );
  }
  return content;
}

const s = StyleSheet.create({
  webOuter: { flex: 1, backgroundColor: '#EEF5FF', alignItems: 'center' },
  webInner: { flex: 1, width: '100%', maxWidth: 480, overflow: 'hidden' },
});

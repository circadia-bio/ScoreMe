/**
 * app/index.jsx — Redirects immediately to tabs.
 * Onboarding is handled as a modal in (tabs)/_layout.jsx.
 */
import { Redirect } from 'expo-router';
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

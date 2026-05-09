/**
 * theme/responsive.js
 *
 * Breakpoint hook and layout constants for adaptive mobile/tablet/desktop layouts.
 *
 * Breakpoints (matching Expo's web behaviour):
 *   mobile  < 600px   → tab bar, compact cards
 *   tablet  600–1023  → tab bar, wider cards (2-col grid on dashboard)
 *   desktop ≥ 1024px  → sidebar nav, music-log glass aesthetic
 */
import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet:  600,
  desktop: 1024,
};

export const SIDEBAR_W  = 220;
export const CONTENT_MAX = 960; // max content width on desktop

export function useLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isTablet  = width >= BREAKPOINTS.tablet && !isDesktop;
  const isMobile  = !isDesktop && !isTablet;
  return { width, isDesktop, isTablet, isMobile, isNarrow: isMobile };
}

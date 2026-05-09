import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = { tablet: 600, desktop: 1024 };

// Total horizontal space the sidebar occupies (width + left margin + right margin)
// music-log uses 200 + 14 + 12 = 226. We use 220 + 14 + 12 = 246.
export const SIDEBAR_W       = 220;
export const SIDEBAR_TOTAL   = 220 + 14 + 12; // = 246 — paddingLeft screens need
export const CONTENT_PADDING = 20;             // padding inside the content area

export function useLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isTablet  = width >= BREAKPOINTS.tablet && !isDesktop;
  const isMobile  = !isDesktop && !isTablet;
  return { width, isDesktop, isTablet, isMobile };
}

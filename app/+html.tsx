import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#4A7BB5" />

        <title>ScoreMe</title>
        <meta name="description" content="Research questionnaire scorer · Circadia Lab" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple PWA */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="1024x1024" href="/icon-1024.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ScoreMe" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ScoreMe" />
        <meta property="og:description" content="Research questionnaire scorer · Circadia Lab" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter / iMessage */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ScoreMe" />
        <meta name="twitter:image" content="/og-image.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';

/* Οι γραμματοσειρές φορτώνουν από Google Fonts με preconnect: και οι δύο
   έχουν ελληνικά, που είναι ο λόγος που επιλέχθηκαν. */
export const metadata: Metadata = {
  metadataBase: new URL('https://apexhub.gr'),
  title: 'APEXHUB — Trading Community',
  description:
    'Μια ελληνική κοινότητα traders που μαθαίνουν μαζί, δουλεύουν με πειθαρχία '
    + 'και μοιράζονται ό,τι ξέρουν. Κοινότητα, εκπαίδευση, ευκαιρία.',
  openGraph: {
    title: 'APEXHUB — Χτίζουμε ανθρώπους με αξία',
    description:
      'Ένα πρότυπο. Μια κοινότητα. Trading, εκπαίδευση και στήριξη, κάθε μέρα στο Telegram.',
    url: 'https://apexhub.gr',
    siteName: 'APEXHUB',
    locale: 'el_GR',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0C0C0E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Commissioner:wght@200;300;400;500;600;800&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

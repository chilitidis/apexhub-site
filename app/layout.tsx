import type { Metadata, Viewport } from 'next';
import { Noto_Serif_Display } from 'next/font/google';
import './globals.css';

/**
 * Η SERIF ΤΩΝ ΤΙΤΛΩΝ, για ΟΛΟ το site.
 *
 * Ορίζεται εδώ και όχι χωριστά σε κάθε layout: η δημόσια σελίδα και η
 * πλατφόρμα μελών χρησιμοποιούν την ίδια: δύο ξεχωριστές δηλώσεις θα
 * ρίσκαραν δύο κατεβάσματα του ίδιου αρχείου.
 *
 * ΤΟ `greek` SUBSET ΔΕΝ ΕΙΝΑΙ ΠΡΟΑΙΡΕΤΙΚΟ. Χωρίς αυτό ο browser κατεβάζει
 * τη serif, δεν βρίσκει μέσα της ελληνικά γράμματα και πέφτει σιωπηλά στη
 * Georgia — δηλαδή όλη η δουλειά της τυπογραφίας πάει χαμένη και το
 * καταλαβαίνει μόνο όποιος ξέρει τι κοιτάζει.
 */
const serif = Noto_Serif_Display({
  subsets: ['greek', 'latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-serif',
});

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
    <html lang="el" className={serif.variable}>
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

/**
 * Η ύλη της ακαδημίας.
 *
 * ΓΙΑΤΙ ΕΔΩ ΚΑΙ ΟΧΙ ΣΕ ΒΑΣΗ: δεν υπάρχει ακόμη περιεχόμενο. Μια βάση για
 * άδειους πίνακες είναι μηδενικό κέρδος και τρία νέα πράγματα που μπορούν να
 * χαλάσουν — πίνακες, κλειδιά πρόσβασης, και ένα service role key μέσα στο
 * δημόσιο site που θα μπορούσε να διαβάσει τα πάντα, μέχρι και τις προμήθειες.
 *
 * Όταν μπουν τα βίντεο και θελήσουμε πραγματική πρόοδο ανά μέλος, η ύλη
 * μεταφέρεται σε πίνακα και αυτό το αρχείο γίνεται seed. Μέχρι τότε, η σειρά
 * των μαθημάτων είναι η μόνη πληροφορία που χρειαζόμαστε, και είναι σταθερή.
 */

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  minutes?: number;
  /** Χωρίς βίντεο ακόμη. Όταν μπει, εδώ πάει το embed URL. */
  video?: string;
};

export type Section = {
  slug: string;
  title: string;
  kicker: string;
  intro: string;
  lessons: Lesson[];
};

export const SECTIONS: Section[] = [
  {
    slug: 'vaseis',
    title: 'Βάσεις',
    kicker: 'Ενότητα Ι',
    intro:
      'Τι είναι πραγματικά μια αγορά, ποιος είναι απέναντί σου και γιατί '
      + 'υπάρχει η τιμή που βλέπεις. Χωρίς αυτά, όλα τα υπόλοιπα είναι αντιγραφή.',
    lessons: [
      { slug: 'ti-einai-i-agora', title: 'Τι είναι η αγορά', summary: 'Αγοραστές, πωλητές και γιατί κινείται η τιμή.' },
      { slug: 'orologia', title: 'Η ορολογία που χρειάζεσαι', summary: 'Spread, μόχλευση, lot, pip — μόνο όσα θα χρησιμοποιείς.' },
      { slug: 'platforma', title: 'Η πλατφόρμα σου', summary: 'Πώς ανοίγεις, κλείνεις και διαβάζεις μια θέση.' },
    ],
  },
  {
    slug: 'domi-agoras',
    title: 'Δομή αγοράς',
    kicker: 'Ενότητα ΙΙ',
    intro:
      'Πώς διαβάζεται ένα chart χωρίς δείκτες. Πού είναι η προσφορά, πού η '
      + 'ζήτηση, και πότε αλλάζει χέρια η αγορά.',
    lessons: [
      { slug: 'taseis', title: 'Τάσεις και διορθώσεις', summary: 'Πότε συνεχίζει και πότε γυρίζει.' },
      { slug: 'epipeda', title: 'Επίπεδα που μετράνε', summary: 'Ποια επίπεδα κρατάνε και ποια είναι θόρυβος.' },
      { slug: 'xronika-plaisia', title: 'Χρονικά πλαίσια', summary: 'Γιατί το ίδιο chart λέει δύο διαφορετικά πράγματα.' },
    ],
  },
  {
    slug: 'risko',
    title: 'Διαχείριση ρίσκου',
    kicker: 'Ενότητα ΙΙΙ',
    intro:
      'Το κομμάτι που κρατάει κάποιον στις αγορές περισσότερο από έναν χρόνο. '
      + 'Το μέγεθος θέσης και το stop έρχονται πριν από τον στόχο.',
    lessons: [
      { slug: 'megethos-thesis', title: 'Μέγεθος θέσης', summary: 'Πόσο ρισκάρεις ανά κίνηση, και γιατί αυτό το νούμερο δεν αλλάζει.' },
      { slug: 'stop', title: 'Πού μπαίνει το stop', summary: 'Το stop δεν είναι απόσταση. Είναι το σημείο που ακυρώνει την ιδέα.' },
      { slug: 'drawdown', title: 'Σειρές ζημιών', summary: 'Τι σημαίνει στατιστικά μια κακή εβδομάδα, και πότε είναι πρόβλημα.' },
    ],
  },
  {
    slug: 'psychologia',
    title: 'Ψυχολογία',
    kicker: 'Ενότητα ΙV',
    intro:
      'Αυτό που ρίχνει τους περισσότερους δεν είναι η ανάλυση. Είναι η '
      + 'ανυπομονησία, η εκδίκηση και η απομόνωση.',
    lessons: [
      { slug: 'peitharxia', title: 'Πειθαρχία χωρίς θέληση', summary: 'Κανόνες που δουλεύουν ακόμη και σε κακή μέρα.' },
      { slug: 'imerologio', title: 'Το ημερολόγιο ως καθρέφτης', summary: 'Τι καταγράφεις, και τι βλέπεις μετά από 50 κινήσεις.' },
      { slug: 'ypomoni', title: 'Η αναμονή ως θέση', summary: 'Το να μην κάνεις τίποτα είναι απόφαση, όχι αδράνεια.' },
    ],
  },
];

export const allLessons = () =>
  SECTIONS.flatMap((s) => s.lessons.map((l) => ({ ...l, section: s })));

export function findLesson(slug: string) {
  for (const s of SECTIONS) {
    const i = s.lessons.findIndex((l) => l.slug === slug);
    if (i >= 0) return { section: s, lesson: s.lessons[i], index: i };
  }
  return null;
}

/** Η επόμενη και η προηγούμενη, διασχίζοντας τις ενότητες σαν ένα βιβλίο. */
export function neighbours(slug: string) {
  const flat = allLessons();
  const i = flat.findIndex((l) => l.slug === slug);
  return { prev: i > 0 ? flat[i - 1] : null, next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : null };
}

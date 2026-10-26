import type { Lang } from '@/lib/i18n';

/**
 * Τα κείμενα της αρχικής, σε δύο γλώσσες.
 *
 * Ένα αντικείμενο ανά γλώσσα με την ΙΔΙΑ ακριβώς μορφή: αν προστεθεί κάτι στο
 * ένα και ξεχαστεί στο άλλο, το TypeScript σταματά το build.
 *
 * Οι μαρτυρίες των μελών γράφτηκαν στα ελληνικά, στο Telegram. Στα αγγλικά
 * είναι μετάφραση, και η σελίδα το λέει.
 */
const el = {
  nav: { who: 'Ποιοι είμαστε', pillars: 'Οι πυλώνες', voices: 'Μέλη', offer: 'Τι προσφέρουμε', login: 'Σύνδεση' },
  rail: ['Trading', 'Κοινότητα', 'Affiliate'],
  kicker: ['TRADING', 'ΚΟΙΝΟΤΗΤΑ', 'ΕΚΠΑΙΔΕΥΣΗ'],
  h1: ['Χτίζουμε', 'ανθρώπους', 'με', 'αξία.'],
  lede:
    'Ένα πρότυπο. Μια κοινότητα. Το APEXHUB είναι μια ελληνική κοινότητα traders που μαθαίνουν μαζί, '
    + 'δουλεύουν με πειθαρχία και μοιράζονται ό,τι ξέρουν — στο Telegram, κάθε μέρα.',
  ctaJoin: 'Μπες στο κανάλι μας',
  ctaInside: 'Τι θα βρεις μέσα',
  note: 'Ανοιχτό σε όλους. Χωρίς κάρτα, χωρίς δέσμευση.',
  values: ['Πειθαρχία', 'Ακεραιότητα', 'Σεβασμός', 'Εξέλιξη'],

  who: {
    lbl: 'Ποιοι είμαστε',
    h2: 'Μια ομάδα με ονόματα, όχι ένα λογότυπο.',
    sub: 'Οι περισσότερες κοινότητες trading κρύβονται πίσω από ψευδώνυμα και screenshot κερδών. Εμείς βάζουμε τα ονόματά μας στην πόρτα.',
    p1a: 'Το APEXHUB δεν φτιάχτηκε για να πουλήσει ένα μάθημα και να φύγει. Φτιάχτηκε για να υπάρχει κάπου που κάποιος μπορεί να ρωτήσει',
    p1b: '«γιατί μπήκες εκεί;»',
    p1c: 'και να πάρει πραγματική απάντηση από τον άνθρωπο που μπήκε.',
    p2: 'Λειτουργούμε μέσα από το Telegram, γιατί εκεί είναι ήδη ο κόσμος και εκεί γίνεται η συζήτηση την ώρα που μετράει. Γύρω από αυτό χτίζουμε την πλατφόρμα μελών: αρχείο, εργαλεία και την ακαδημία.',
    p3a: 'Στόχος μας δεν είναι το επόμενο σήμα. Είναι η',
    p3b: 'εκπαίδευση, η πειθαρχία και η σωστή διαχείριση ρίσκου',
    p3c: '— τα μόνα τρία πράγματα που κρατάνε κάποιον στις αγορές περισσότερο από έναν χρόνο.',
    roster: [['Φώτης Χιλιτίδης', 'CEO'], ['Ιωάννης Χιλιτίδης', 'CTO']],
  },

  pillars: {
    lbl: 'Οι πυλώνες',
    h2: 'Τρεις πυλώνες. Ένα οικοσύστημα.',
    sub: 'Trading χωρίς εκπαίδευση είναι αντιγραφή. Εκπαίδευση χωρίς κοινότητα είναι ένα PDF που δεν άνοιξες ποτέ. Και μια κοινότητα μεγαλώνει από τους ίδιους τους ανθρώπους της. Το ένα κρατάει το άλλο όρθιο.',
    items: [
      {
        h: 'Trading',
        kick: 'Η δουλειά της ημέρας — εκπαιδευτικό υλικό, live sessions και trading ideas.',
        li: [
          ['Trading ideas με σκεπτικό', 'Γιατί τώρα, πού είναι το ρίσκο, τι ακυρώνει την ιδέα.'],
          ['Live sessions', 'Βλέπεις τη διαδικασία την ώρα που γίνεται, όχι μόνο το αποτέλεσμα.'],
          ['Εκπαίδευση', 'Δομημένη ύλη από τις βάσεις μέχρι το ρίσκο και την ψυχολογία, μέσα στην πλατφόρμα.'],
        ],
      },
      {
        h: 'Κοινότητα',
        kick: 'Στήριξη και εξέλιξη. Άνθρωποι που κάνουν το ίδιο πράγμα, στον ίδιο χρόνο.',
        li: [
          ['Ενεργή κοινότητα στο Telegram', 'Η συζήτηση γίνεται εκεί που είσαι ήδη.'],
          ['Λύσεις σε κάθε απορία', 'Ρωτάς και σου απαντά ο ίδιος που άνοιξε την κίνηση — όχι φόρμα υποστήριξης.'],
          ['Συνέπεια και καθοδήγηση', 'Το κομμάτι που ρίχνει τους περισσότερους δεν είναι η ανάλυση. Είναι η απομόνωση.'],
        ],
      },
      {
        h: 'Affiliate',
        kick: 'Για όσους θέλουν να χτίσουν κάτι δικό τους μέσα στην κοινότητα — με κανόνες γραμμένους και αριθμούς ορατούς.',
        li: [
          ['Δικός σου σύνδεσμος', 'Όποιος έρθει από εσένα καταγράφεται αυτόματα. Χωρίς κωδικούς και χειρόγραφες λίστες.'],
          ['Προμήθεια με σταθερό κανόνα', 'Υπολογίζεται κάθε μήνα πάνω στα ενεργά μέλη, και τη βλέπεις αναλυτικά στο back office.'],
          ['Βαθμίδες που ανεβαίνουν με τη δουλειά', 'Όσο μεγαλώνει η ομάδα σου αλλάζει το ποσοστό σου. Οι κανόνες είναι ίδιοι για όλους.'],
        ],
      },
    ],
  },

  paths: {
    lbl: 'Εκτέλεση',
    h2: 'Δύο δρόμοι. Διάλεξε αυτόν που σου ταιριάζει.',
    sub: 'Η εκπαίδευση είναι η ίδια. Αυτό που αλλάζει είναι με ποιανού το κεφάλαιο δουλεύεις.',
    a: {
      tp: 'Δρόμος Α', h: 'Funded account',
      li: [
        'Δουλεύεις με κεφάλαιο που σου παρέχεται μέσω funded account.',
        'Κρατάς ποσοστό από τα κέρδη, σύμφωνα με τους όρους του provider.',
        'Δυνατότητα κλιμάκωσης κεφαλαίου με βάση την απόδοσή σου.',
      ],
    },
    b: {
      tp: 'Δρόμος Β', h: 'Real account',
      li: [
        'Δουλεύεις με δικό σου κεφάλαιο.',
        'Τα κέρδη και οι ζημιές αφορούν αποκλειστικά τον δικό σου λογαριασμό.',
        'Πλήρης έλεγχος στις συναλλαγές και στη στρατηγική σου.',
      ],
    },
  },

  voices: {
    lbl: 'Μέλη',
    h2: 'Τι λέει η κοινότητα.',
    sub: 'Πραγματικοί άνθρωποι, με τα ονόματά τους. Τα λόγια είναι δικά τους, όπως γράφτηκαν στο Telegram.',
    member: 'Μέλος',
    items: [
      { q: 'Δεν έχω πολύ χρόνο γιατί είμαι φαντάρος, αλλά το community με στηρίζει και με βοηθάει πολύ. Μου λύνει απορίες όποτε χρειάζεται και με κρατάει συνεπή στο ταξίδι μου.', av: 'Ν', name: 'Νίκος' },
      { q: 'Ξεκίνησε χωρίς προηγούμενη εμπειρία και χρειάστηκε 10–15 ημέρες για να κατανοήσει τη διαδικασία. Με το εκπαιδευτικό υλικό και τα live sessions έμαθε να διαβάζει καλύτερα τα charts και απέκτησε αυτοπεποίθηση στις δικές του αποφάσεις.', av: 'ΧΑ', name: 'Χρήστος Αλατζάς' },
      { q: 'Ξεκίνησε με επιφυλάξεις, χωρίς προηγούμενη επαφή με τον χώρο. Με τον χρόνο κατανόησε τη διαδικασία και, παρά τον περιορισμένο χρόνο του, κατάφερε να γίνει κερδοφόρος στις αγορές.', av: 'ΧΜ', name: 'Χρήστος Μάνος' },
      { q: 'Ξεκίνησε με επιφυλάξεις, χωρίς προηγούμενη επαφή με τον χώρο του trading. Με την εκπαίδευση και την καθοδήγηση κατάφερε να κατανοήσει τη διαδικασία. Σήμερα συνεχίζει με κίνητρο, συνέπεια και σωστή οργάνωση.', av: 'ΧΚ', name: 'Χρήστος Κυπαρίσσης' },
    ],
    translated: '',
    swipe: 'Σύρε για περισσότερα →',
    disclaim: 'Ατομικά αποτελέσματα μελών. Δεν αποτελούν εγγύηση ούτε ένδειξη μελλοντικών αποτελεσμάτων. Τα περισσότερα άτομα που ασχολούνται με το trading δεν είναι κερδοφόρα.',
  },

  offer: {
    lbl: 'Τι προσφέρουμε',
    h2: 'Τι παίρνεις στα χέρια σου.',
    sub: 'Το κανάλι είναι ανοιχτό σε όλους. Τα υπόλοιπα ζουν μέσα στην κοινότητα των μελών.',
    open: 'Ανοιχτό', members: 'Μέλη', soon: 'Έρχεται',
    items: [
      ['Κανάλι Telegram', 'Αναλύσεις, κομμάτια από τη δουλειά της ημέρας και ανακοινώσεις.'],
      ['VIP κοινότητα', 'Το κυρίως δωμάτιο. Trading ideas, live sessions και άμεση πρόσβαση στην ομάδα.'],
      ['Εκπαιδευτικό υλικό', 'Δομημένη ύλη από τις βάσεις μέχρι τη διαχείριση ρίσκου και την ψυχολογία.'],
      ['Πλατφόρμα μελών', 'Το αρχείο, τα εργαλεία και η πρόοδός σου, στο apexhub.gr.'],
      ['Ultimate Trading Journal', 'Το ημερολόγιό σου. Καταγράφεις κάθε κίνηση και βλέπεις τα δικά σου μοτίβα.'],
      ['Ακαδημία', 'Δομημένα μαθήματα με σειρά και πρόοδο, μέσα στην πλατφόρμα.'],
    ],
  },

  access: {
    lbl: 'Πρόσβαση',
    h2: 'Ξεκίνα από εκεί που δεν κοστίζει τίποτα.',
    sub: 'Δεν χρειάζεται να αποφασίσεις σήμερα. Μπες στο κανάλι, δες τη δουλειά για όσο θέλεις, και αν σου ταιριάζει προχωράς.',
    ch: 'Το κανάλι μας στο Telegram',
    chP: 'Ανοιχτό σε όλους. Από εκεί ανακοινώνεται και πότε ανοίγουν θέσεις για νέα μέλη.',
    chBtn: 'Άνοιγμα στο Telegram',
    mem: 'Είσαι ήδη μέλος;',
    memP: 'Η είσοδος στην πλατφόρμα γίνεται με τον λογαριασμό Telegram σου. Αναγνωρίζεσαι αυτόματα — αν είσαι μέσα στην κοινότητα, περνάς.',
    memBtn: 'Σύνδεση',
  },

  risk: {
    lbl: 'Ρίσκο',
    h2: 'Αποποίηση ευθύνης.',
    sub: 'Το APEXHUB παρέχει ανάλυση αγοράς, εκπαιδευτικό περιεχόμενο και trading ideas, για ενημερωτικούς και εκπαιδευτικούς σκοπούς.',
    items: [
      ['Δεν είναι επενδυτική συμβουλή', 'Τα trading ideas δεν λαμβάνουν υπόψη την προσωπική οικονομική κατάσταση ή το επενδυτικό προφίλ κάθε μέλους.'],
      ['Υψηλό ρίσκο', 'Το trading μπορεί να οδηγήσει σε σημαντική ή και πλήρη απώλεια κεφαλαίου. Δεν υπάρχουν εγγυημένα κέρδη.'],
      ['Δική σου απόφαση', 'Δεν διαχειριζόμαστε κεφάλαια ούτε πραγματοποιούμε συναλλαγές για λογαριασμό μελών. Κάθε απόφαση και το ρίσκο της ανήκουν αποκλειστικά σε εσένα.'],
    ],
    foot: 'Στόχος μας είναι η εκπαίδευση, η πειθαρχία και η σωστή διαχείριση ρίσκου. Μην επενδύσεις χρήματα που δεν αντέχεις να χάσεις.',
  },

  footer: { platform: 'Πλατφόρμα μελών', pillars: 'Οι πυλώνες' },
};

type Copy = typeof el;

const en: Copy = {
  nav: { who: 'Who we are', pillars: 'The pillars', voices: 'Members', offer: 'What we offer', login: 'Log in' },
  rail: ['Trading', 'Community', 'Affiliate'],
  kicker: ['TRADING', 'COMMUNITY', 'EDUCATION'],
  h1: ['We build', 'people', 'of', 'value.'],
  lede:
    'One standard. One community. APEXHUB is a trading community of people who learn together, '
    + 'work with discipline and share what they know — on Telegram, every day.',
  ctaJoin: 'Join our channel',
  ctaInside: 'What you’ll find inside',
  note: 'Open to everyone. No card, no commitment.',
  values: ['Discipline', 'Integrity', 'Respect', 'Growth'],

  who: {
    lbl: 'Who we are',
    h2: 'A team with names, not a logo.',
    sub: 'Most trading communities hide behind nicknames and screenshots of profits. We put our names on the door.',
    p1a: 'APEXHUB was not built to sell a course and disappear. It was built so there is a place where someone can ask',
    p1b: '“why did you enter there?”',
    p1c: 'and get a real answer from the person who took the trade.',
    p2: 'We operate through Telegram, because that is where people already are and where the conversation happens at the moment it matters. Around it we build the members’ platform: the archive, the tools and the academy.',
    p3a: 'Our goal is not the next signal. It is',
    p3b: 'education, discipline and proper risk management',
    p3c: '— the only three things that keep someone in the markets for more than a year.',
    roster: [['Fotis Chilitidis', 'CEO'], ['Ioannis Chilitidis', 'CTO']],
  },

  pillars: {
    lbl: 'The pillars',
    h2: 'Three pillars. One ecosystem.',
    sub: 'Trading without education is copying. Education without a community is a PDF you never opened. And a community grows through its own people. Each one holds the other up.',
    items: [
      {
        h: 'Trading',
        kick: 'The day’s work — educational material, live sessions and trading ideas.',
        li: [
          ['Trading ideas with reasoning', 'Why now, where the risk is, what invalidates the idea.'],
          ['Live sessions', 'You watch the process as it happens, not just the result.'],
          ['Education', 'Structured material from the basics to risk and psychology, inside the platform.'],
        ],
      },
      {
        h: 'Community',
        kick: 'Support and growth. People doing the same thing, at the same time.',
        li: [
          ['An active community on Telegram', 'The conversation happens where you already are.'],
          ['Answers to every question', 'You ask, and the person who opened the trade answers — not a support form.'],
          ['Consistency and guidance', 'What breaks most traders is not the analysis. It is isolation.'],
        ],
      },
      {
        h: 'Affiliate',
        kick: 'For those who want to build something of their own inside the community — with written rules and visible numbers.',
        li: [
          ['Your own link', 'Everyone who comes through you is recorded automatically. No codes, no handwritten lists.'],
          ['Commission on a fixed rule', 'Calculated every month on active members, and shown in detail in the back office.'],
          ['Tiers that rise with the work', 'As your team grows, your rate changes. The rules are the same for everyone.'],
        ],
      },
    ],
  },

  paths: {
    lbl: 'Execution',
    h2: 'Two paths. Choose the one that fits you.',
    sub: 'The education is the same. What changes is whose capital you trade.',
    a: {
      tp: 'Path A', h: 'Funded account',
      li: [
        'You trade capital provided to you through a funded account.',
        'You keep a share of the profits, according to the provider’s terms.',
        'Capital can be scaled up based on your performance.',
      ],
    },
    b: {
      tp: 'Path B', h: 'Real account',
      li: [
        'You trade your own capital.',
        'Profits and losses concern your own account only.',
        'Full control over your trades and your strategy.',
      ],
    },
  },

  voices: {
    lbl: 'Members',
    h2: 'What the community says.',
    sub: 'Real people, with their names. The words are theirs, as written on Telegram.',
    member: 'Member',
    items: [
      { q: 'I don’t have much time because I’m doing my military service, but the community supports me and helps me a lot. It answers my questions whenever I need and keeps me consistent on my journey.', av: 'N', name: 'Nikos' },
      { q: 'He started with no prior experience and needed 10–15 days to understand the process. With the educational material and the live sessions he learned to read charts better and gained confidence in his own decisions.', av: 'CA', name: 'Christos Alatzas' },
      { q: 'He started with reservations and no previous contact with the field. Over time he understood the process and, despite his limited time, managed to become profitable in the markets.', av: 'CM', name: 'Christos Manos' },
      { q: 'He started with reservations and no previous contact with trading. Through education and guidance he came to understand the process. Today he continues with motivation, consistency and proper organisation.', av: 'CK', name: 'Christos Kyparissis' },
    ],
    translated: 'Translated from Greek.',
    swipe: 'Swipe for more →',
    disclaim: 'Individual member results. They are not a guarantee or an indication of future results. Most people who trade are not profitable.',
  },

  offer: {
    lbl: 'What we offer',
    h2: 'What you get.',
    sub: 'The channel is open to everyone. Everything else lives inside the members’ community.',
    open: 'Open', members: 'Members', soon: 'Coming',
    items: [
      ['Telegram channel', 'Analysis, pieces of the day’s work and announcements.'],
      ['VIP community', 'The main room. Trading ideas, live sessions and direct access to the team.'],
      ['Educational material', 'Structured material from the basics to risk management and psychology.'],
      ['Members’ platform', 'Your archive, your tools and your progress, at apexhub.gr.'],
      ['Ultimate Trading Journal', 'Your journal. You log every trade and see your own patterns.'],
      ['Academy', 'Structured lessons in order, with progress tracking, inside the platform.'],
    ],
  },

  access: {
    lbl: 'Access',
    h2: 'Start where it costs nothing.',
    sub: 'You don’t need to decide today. Join the channel, watch the work for as long as you want, and if it fits you, move forward.',
    ch: 'Our Telegram channel',
    chP: 'Open to everyone. That is also where we announce when places open for new members.',
    chBtn: 'Open in Telegram',
    mem: 'Already a member?',
    memP: 'You log in to the platform with your Telegram account. You are recognised automatically — if you are in the community, you are in.',
    memBtn: 'Log in',
  },

  risk: {
    lbl: 'Risk',
    h2: 'Disclaimer.',
    sub: 'APEXHUB provides market analysis, educational content and trading ideas, for informational and educational purposes.',
    items: [
      ['Not investment advice', 'Trading ideas do not take into account the personal financial situation or investment profile of each member.'],
      ['High risk', 'Trading can lead to significant or even total loss of capital. There are no guaranteed profits.'],
      ['Your own decision', 'We do not manage funds or execute trades on behalf of members. Every decision and its risk belong solely to you.'],
    ],
    foot: 'Our goal is education, discipline and proper risk management. Do not invest money you cannot afford to lose.',
  },

  footer: { platform: 'Members’ platform', pillars: 'The pillars' },
};

export const HOME: Record<Lang, Copy> = { el, en };

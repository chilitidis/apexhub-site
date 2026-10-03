/**
 * Εικονίδια σε λεπτή γραμμή, γραμμένα με το χέρι.
 *
 * Όχι βιβλιοθήκη: χρειάζομαι οκτώ σχήματα. Ένα πακέτο με χίλια θα πρόσθετε
 * εξάρτηση, χρόνο build και μια ακόμη έκδοση να συντηρώ, για να μου δώσει
 * οκτώ διαδρομές SVG που χωράνε σε μία οθόνη.
 */
type P = { className?: string };
const base = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

export const IHome = (p: P) => (
  <svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" /></svg>
);
export const IBook = (p: P) => (
  <svg {...base} {...p}><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 0 4 20.5z" /><path d="M4 17.5h15" /></svg>
);
export const IJournal = (p: P) => (
  <svg {...base} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="M8 14.5l3-3.5 2.5 2.5L17 9" /></svg>
);
export const ISend = (p: P) => (
  <svg {...base} {...p}><path d="M21 3 10.5 13.5" /><path d="M21 3l-6.5 18-4-8-8-4z" /></svg>
);
export const IBriefcase = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="7.5" width="18" height="12.5" rx="2" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" /></svg>
);
export const IGear = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z" /></svg>
);
export const IOut = (p: P) => (
  <svg {...base} {...p}><path d="M7 17 17 7" /><path d="M9 7h8v8" /></svg>
);
export const ILock = (p: P) => (
  <svg {...base} {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
);
export const ICheck = (p: P) => (
  <svg {...base} {...p}><path d="M4.5 12.5 9.5 17.5 19.5 6.5" /></svg>
);
export const IPlay = (p: P) => (
  <svg {...base} {...p}><path d="M8 5.5v13l11-6.5z" /></svg>
);
export const IMenu = (p: P) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IChevron = (p: P) => (
  <svg {...base} {...p}><path d="M9 6l6 6-6 6" /></svg>
);
export const ISearch = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
);
export const IShield = (p: P) => (
  <svg {...base} {...p}><path d="M12 3l7.5 3v6c0 4.5-3 7.8-7.5 9-4.5-1.2-7.5-4.5-7.5-9V6z" /></svg>
);

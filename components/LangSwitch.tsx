'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { Lang } from '@/lib/i18n';

/**
 * Το κουμπί EL / EN.
 *
 * Γράφει το cookie για έναν χρόνο, σε όλο το `.apexhub.gr` όταν τρέχει εκεί,
 * και ζητά από τον server να αποδώσει ξανά τη σελίδα. Δεν αλλάζει διεύθυνση.
 */
export default function LangSwitch({ lang, className = '' }: { lang: Lang; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const set = (to: Lang) => {
    if (to === lang) return;
    const host = typeof location !== 'undefined' ? location.hostname : '';
    const domain = host.endsWith('apexhub.gr') ? '; domain=.apexhub.gr' : '';
    document.cookie = `lang=${to}; path=/; max-age=31536000; samesite=lax${domain}`;
    document.documentElement.lang = to;
    start(() => router.refresh());
  };

  return (
    <div className={`langsw ${className}`} role="group" aria-label="Language / Γλώσσα"
         aria-busy={pending || undefined}>
      <button type="button" className={lang === 'el' ? 'on' : ''} aria-pressed={lang === 'el'}
              onClick={() => set('el')} lang="el">EL</button>
      <button type="button" className={lang === 'en' ? 'on' : ''} aria-pressed={lang === 'en'}
              onClick={() => set('en')} lang="en">EN</button>
    </div>
  );
}

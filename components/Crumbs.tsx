'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ISearch } from './Icons';

/**
 * Η μπάρα πάνω από το περιεχόμενο.
 *
 * Το breadcrumb χτίζεται από τη διαδρομή, όχι από χειροκίνητη λίστα: κάθε νέα
 * σελίδα το αποκτά δωρεάν, και δεν υπάρχει περίπτωση να ξεχαστεί.
 */
const NAMES: Record<string, string> = {
  app: 'Αρχική',
  academy: 'Ακαδημία',
  journal: 'Trading Journal',
  telegram: 'Telegram',
  backoffice: 'Back office',
  admin: 'Διαχείριση',
  settings: 'Ρυθμίσεις',
};

const pretty = (seg: string) =>
  NAMES[seg] ?? decodeURIComponent(seg).replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

export default function Crumbs() {
  const path = usePathname();
  const parts = path.split('/').filter(Boolean);

  /* Οι τίτλοι μαθήματος και lesson δεν υπάρχουν στη διαδρομή — μόνο τα slug.
     Τους ζητάμε μία φορά ανά σελίδα· μέχρι να έρθουν, δείχνουμε το slug σε
     αναγνώσιμη μορφή, ώστε να μη «χοροπηδάει» η μπάρα. */
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [course, lesson] = [parts[2], parts[3]];

  useEffect(() => {
    if (parts[1] !== 'academy' || !course) { setTitles({}); return; }
    const p = new URLSearchParams({ course });
    if (lesson) p.set('lesson', lesson);
    let alive = true;
    fetch(`/api/crumbs?${p}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => { if (alive) setTitles(d); })
      .catch(() => {});
    return () => { alive = false; };
  }, [parts, course, lesson]);

  const crumbs = parts.map((seg, i) => ({
    label: titles[seg] ?? pretty(seg),
    href: '/' + parts.slice(0, i + 1).join('/'),
    last: i === parts.length - 1,
  }));

  return (
    <header className="topbar">
      <nav className="crumbs" aria-label="Διαδρομή">
        {crumbs.map((c) => (
          <span key={c.href}>
            {c.last ? <b>{c.label}</b> : <Link href={c.href}>{c.label}</Link>}
            {!c.last && <i aria-hidden>/</i>}
          </span>
        ))}
      </nav>
      <form className="topsearch" action="/app/academy">
        <ISearch className="topsearch-ico" />
        <input name="q" placeholder="Αναζήτηση στην ακαδημία" aria-label="Αναζήτηση" />
      </form>
    </header>
  );
}

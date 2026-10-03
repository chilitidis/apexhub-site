'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IHome, IBook, IJournal, ISend, IBriefcase, IGear, IOut, IMenu, IShield,
} from './Icons';

type Item = {
  href: string; label: string; icon: React.ComponentType<{ className?: string }>;
  external?: boolean; show?: boolean;
};

export default function AppSidebar({
  name, role, photo, isAdmin, isPartner, journalUrl, portalUrl,
}: {
  name: string; role: string; photo?: string;
  isAdmin: boolean; isPartner: boolean; journalUrl: string; portalUrl: string;
}) {
  const path = usePathname();
  const [narrow, setNarrow] = useState(false);
  const [open, setOpen] = useState(false);   // drawer σε κινητό

  /* Η προτίμηση για στενό sidebar είναι ευκολία ανά συσκευή, όχι κοινή
     κατάσταση — ζει τοπικά και δεν πειράζει κανέναν άλλον. */
  useEffect(() => {
    try { setNarrow(localStorage.getItem('apex_nav') === 'narrow'); } catch { /* private mode */ }
  }, []);
  const toggleNarrow = () => {
    setNarrow((v) => {
      try { localStorage.setItem('apex_nav', v ? 'wide' : 'narrow'); } catch { /* ignore */ }
      return !v;
    });
  };

  /* Το drawer κλείνει σε κάθε αλλαγή σελίδας: αλλιώς μένει ανοιχτό πάνω από
     το περιεχόμενο που μόλις ζήτησε ο χρήστης. */
  useEffect(() => { setOpen(false); }, [path]);

  const items: Item[] = [
    { href: '/app',          label: 'Αρχική',          icon: IHome },
    { href: '/app/academy',  label: 'Ακαδημία',        icon: IBook },
    { href: '/app/journal',  label: 'Trading Journal', icon: IJournal },
    { href: '/app/telegram', label: 'Telegram',        icon: ISend },
    { href: '/app/backoffice', label: 'Back office',   icon: IBriefcase, show: isPartner },
    { href: '/app/admin',    label: 'Διαχείριση',      icon: IShield, show: isAdmin },
    { href: '/app/settings', label: 'Ρυθμίσεις',       icon: IGear },
  ].filter((i) => i.show !== false);

  const active = (href: string) =>
    href === '/app' ? path === '/app' : path === href || path.startsWith(href + '/');

  return (
    <>
      <button className="nav-burger" onClick={() => setOpen(true)} aria-label="Μενού">
        <IMenu />
      </button>

      {open && <button className="nav-scrim" onClick={() => setOpen(false)} aria-label="Κλείσιμο" />}

      <aside className={`nav ${narrow ? 'nav-narrow' : ''} ${open ? 'nav-open' : ''}`}>
        <Link className="nav-brand" href="/app" aria-label="ApexHub">
          <svg viewBox="0 0 104 100" aria-hidden>
            <defs>
              <linearGradient id="nl" x1=".1" y1="0" x2=".9" y2="1">
                <stop offset="0" stopColor="#FBEFC6" /><stop offset=".55" stopColor="#EBC862" />
                <stop offset="1" stopColor="#C9A043" />
              </linearGradient>
              <linearGradient id="nd" x1=".1" y1="0" x2="1" y2=".9">
                <stop offset="0" stopColor="#B98F32" /><stop offset=".6" stopColor="#8F6D22" />
                <stop offset="1" stopColor="#6E5319" />
              </linearGradient>
            </defs>
            <path fill="url(#nl)" d="M52 3 100 97H76L52 45Z" />
            <path fill="url(#nd)" d="M52 3 52 45 28 97H4Z" />
            <path fill="url(#nl)" d="M38 68h28l7 14H31Z" opacity=".92" />
          </svg>
          <span className="nav-word">Apex<i>Hub</i></span>
        </Link>

        <nav className="nav-list">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <Link key={it.href} href={it.href}
                    className={`nav-item ${active(it.href) ? 'on' : ''}`}
                    title={narrow ? it.label : undefined}>
                <Icon className="nav-ico" />
                <span>{it.label}</span>
                {it.href === '/app/telegram' && <IOut className="nav-ext" />}
              </Link>
            );
          })}
        </nav>

        <div className="nav-foot">
          <div className="nav-me">
            {photo
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={photo} alt="" />
              : <span className="nav-av">{(name || '?').trim().charAt(0).toUpperCase()}</span>}
            <span className="nav-who">
              <b>{name}</b>
              <em>{role}</em>
            </span>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="nav-out" type="submit">Αποσύνδεση</button>
          </form>
          <button className="nav-collapse" onClick={toggleNarrow}
                  aria-label={narrow ? 'Άνοιγμα μενού' : 'Σύμπτυξη μενού'}>
            {narrow ? '»' : '«'}
          </button>
        </div>
      </aside>
    </>
  );
}

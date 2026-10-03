import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { SECTIONS } from '@/lib/academy';
import { SectionProgress } from '@/components/Progress';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Ακαδημία — APEXHUB',
  robots: { index: false, follow: false },
};

export default function Academy() {
  if (!currentSession()) redirect('/login');

  return (
    <main className="wrap hub">
      <header className="hub-top">
        <div>
          <div className="lbl kicker"><span>ΑΚΑΔΗΜΙΑ</span></div>
          <h1>Με σειρά, όχι με σκόρπια βίντεο.</h1>
        </div>
        <a className="btn btn-line btn-sm" href="/members">← Πλατφόρμα</a>
      </header>

      <p className="lede" style={{ maxWidth: '58ch', marginBottom: 48 }}>
        Τέσσερις ενότητες. Κάθε μία πατάει στην προηγούμενη. Το περιεχόμενο
        ανεβαίνει σταδιακά — η δομή είναι εδώ ώστε να ξέρεις πού πηγαίνεις.
      </p>

      <div className="sections">
        {SECTIONS.map((s) => (
          <section key={s.slug} className="sec">
            <div className="sec-head">
              <div className="tp">{s.kicker}</div>
              <h2>{s.title}</h2>
              <p>{s.intro}</p>
              <SectionProgress slugs={s.lessons.map((l) => l.slug)} />
            </div>

            <ol className="lessons">
              {s.lessons.map((l, i) => (
                <li key={l.slug}>
                  <a href={`/members/academy/${l.slug}`}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="txt">
                      <b>{l.title}</b>
                      <span>{l.summary}</span>
                    </span>
                    {!l.video && <span className="soon">Έρχεται</span>}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}

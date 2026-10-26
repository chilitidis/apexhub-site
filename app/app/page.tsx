import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, catalogue, resumePoint, announcements } from '@/lib/academy';
import { IPlay, IJournal, ISend } from '@/components/Icons';
import ProgressRing from '@/components/ProgressRing';
import { currentLang } from '@/lib/lang';
import { LOCALE } from '@/lib/i18n';

const T = {
  el: {
    hi: 'Καλώς ήρθες', sub: 'Η διαδρομή σου μέχρι εδώ και το μάθημα που σε περιμένει.',
    cont: 'Συνεχισε', of: 'από', lessons: 'μαθήματα', contBtn: 'Συνέχισε το μάθημα',
    none: 'Δεν έχεις ξεκινήσει ακόμα.', noneA: 'Διάλεξε μια ενότητα από την', noneLink: 'Ακαδημία', noneB: 'και θα τη βρίσκεις εδώ κάθε φορά που επιστρέφεις.',
    prog: 'Η προοδος σου', all: 'Όλες οι ενότητες', news: 'Ανακοινωσεις',
    noNews: 'Καμία ανακοίνωση.', noNewsP: 'Εδώ θα βλέπεις ό,τι ανακοινώνει η ομάδα.', pinned: 'Καρφιτσωμένη',
    quick: 'Γρηγορη προσβαση', jP: 'Κατέγραψε τις κινήσεις σου', tP: 'Η καθημερινή συζήτηση',
  },
  en: {
    hi: 'Welcome', sub: 'Your path so far and the lesson waiting for you.',
    cont: 'Continue', of: 'of', lessons: 'lessons', contBtn: 'Continue the lesson',
    none: 'You haven’t started yet.', noneA: 'Pick a course from the', noneLink: 'Academy', noneB: 'and you’ll find it here every time you come back.',
    prog: 'Your progress', all: 'All courses', news: 'Announcements',
    noNews: 'No announcements.', noNewsP: 'Team announcements will appear here.', pinned: 'Pinned',
    quick: 'Quick access', jP: 'Log your trades', tP: 'The daily conversation',
  },
};

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const lang = currentLang();
  const t = T[lang];
  const [courses, resume, notes] = await Promise.all([
    catalogue(v), resumePoint(v), announcements(5),
  ]);

  const total = courses.reduce((a, c) => a + c.lessons, 0);
  const done = courses.reduce((a, c) => a + c.done, 0);
  const first = s.name.split(' ')[0];
  const pct = resume && resume.total ? (resume.done / resume.total) * 100 : 0;

  return (
    <>
      <header className="hero">
        <h1 className="h1">{t.hi}, {first}.</h1>
        <p className="sub">{t.sub}</p>
      </header>

      {/* ── Συνέχισε ───────────────────────────────────────────────────
          Η μία κίνηση που θέλει να κάνει το μέλος όταν ανοίγει τη σελίδα.
          Παίρνει όλο το πλάτος επειδή είναι η μόνη. */}
      <section className="sec">
        <span className="eyebrow">{t.cont}</span>
        {resume ? (
          <article className="resume2">
            <Link className="resume2-cover" aria-label={resume.lessonTitle}
                  href={`/app/academy/${resume.courseSlug}/${resume.lessonSlug}`}>
              <span className="cover-art"><span>{resume.lessonTitle}</span></span>
              <span className="resume2-play"><IPlay /></span>
            </Link>
            <div className="resume2-body">
              <span className="eyebrow sm">{resume.courseTitle}</span>
              <h2 className="display resume2-title">{resume.lessonTitle}</h2>
              {/* Το νούμερο πάνω, η μπάρα κάτω. Ανάποδα, η γραμμή των 2px
                  κάθεται ακριβώς κάτω από τον τίτλο και διαβάζεται ως
                  υπογράμμισή του — ακριβώς αυτό που δεν θέλουμε πουθενά. */}
              <div className="resume2-prog">
                <span className="meta num">{resume.done} {t.of} {resume.total} {t.lessons}</span>
                <div className="bar"><span style={{ width: `${pct}%` }} /></div>
              </div>
              <Link className="gold-btn"
                    href={`/app/academy/${resume.courseSlug}/${resume.lessonSlug}`}>
                {t.contBtn} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ) : (
          <div className="empty2">
            <b>{t.none}</b>
            {t.noneA} <Link href="/app/academy">{t.noneLink}</Link> {t.noneB}
          </div>
        )}
      </section>

      {/* ── Πρόοδος ───────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="sec-top">
          <h2>{t.prog}</h2>
          <Link href="/app/academy">{t.all}</Link>
        </div>
        <div className="prog2">
          <ProgressRing value={done} total={total} />
          <ul className="prog2-list">
            {courses.map((c) => (
              <li key={c.id}>
                <Link href={`/app/academy/${c.slug}`}>
                  <span className="prog2-name">{c.title}</span>
                  <span className="prog2-bar">
                    <span className="bar">
                      <span style={{ width: `${c.lessons ? (c.done / c.lessons) * 100 : 0}%` }} />
                    </span>
                  </span>
                  <span className="meta num">{c.done}/{c.lessons}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Ανακοινώσεις ──────────────────────────────────────────────── */}
      <section className="sec">
        <div className="sec-top"><h2>{t.news}</h2></div>
        {notes.length === 0 ? (
          <div className="empty2"><b>{t.noNews}</b>{t.noNewsP}</div>
        ) : (
          <ul className="notes">
            {notes.map((nt) => (
              <li key={nt.id}>
                <time dateTime={nt.published_at} className="num">
                  {new Date(nt.published_at).toLocaleDateString(LOCALE[lang], {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </time>
                <div>
                  <b>{nt.pinned && <span className="pinned" aria-label={t.pinned}>●</span>}{nt.title}</b>
                  {nt.body && <p>{nt.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Γρήγορη πρόσβαση ──────────────────────────────────────────── */}
      <section className="sec">
        <div className="sec-top"><h2>{t.quick}</h2></div>
        <div className="grid g2">
          <Link className="card2 quick" href="/app/journal">
            <IJournal /><span><b>Trading Journal</b><em>{t.jP}</em></span>
          </Link>
          <Link className="card2 quick" href="/app/telegram">
            <ISend /><span><b>Telegram</b><em>{t.tP}</em></span>
          </Link>
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, catalogue, resumePoint, announcements } from '@/lib/academy';
import { IPlay, IJournal, ISend } from '@/components/Icons';
import ProgressRing from '@/components/ProgressRing';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
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
        <h1 className="h1">Καλώς ήρθες, {first}.</h1>
        <p className="sub">
          Η διαδρομή σου μέχρι εδώ και το μάθημα που σε περιμένει.
        </p>
      </header>

      {/* ── Συνέχισε ───────────────────────────────────────────────────
          Η μία κίνηση που θέλει να κάνει το μέλος όταν ανοίγει τη σελίδα.
          Παίρνει όλο το πλάτος επειδή είναι η μόνη. */}
      <section className="sec">
        <span className="eyebrow">Συνεχισε</span>
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
                <span className="meta num">{resume.done} από {resume.total} μαθήματα</span>
                <div className="bar"><span style={{ width: `${pct}%` }} /></div>
              </div>
              <Link className="gold-btn"
                    href={`/app/academy/${resume.courseSlug}/${resume.lessonSlug}`}>
                Συνέχισε το μάθημα <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ) : (
          <div className="empty2">
            <b>Δεν έχεις ξεκινήσει ακόμα.</b>
            Διάλεξε μια ενότητα από την <Link href="/app/academy">Ακαδημία</Link> και
            θα τη βρίσκεις εδώ κάθε φορά που επιστρέφεις.
          </div>
        )}
      </section>

      {/* ── Πρόοδος ───────────────────────────────────────────────────── */}
      <section className="sec">
        <div className="sec-top">
          <h2>Η προοδος σου</h2>
          <Link href="/app/academy">Όλες οι ενότητες</Link>
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
        <div className="sec-top"><h2>Ανακοινωσεις</h2></div>
        {notes.length === 0 ? (
          <div className="empty2"><b>Καμία ανακοίνωση.</b>Εδώ θα βλέπεις ό,τι ανακοινώνει η ομάδα.</div>
        ) : (
          <ul className="notes">
            {notes.map((nt) => (
              <li key={nt.id}>
                <time dateTime={nt.published_at} className="num">
                  {new Date(nt.published_at).toLocaleDateString('el-GR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </time>
                <div>
                  <b>{nt.pinned && <span className="pinned" aria-label="Καρφιτσωμένη">●</span>}{nt.title}</b>
                  {nt.body && <p>{nt.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Γρήγορη πρόσβαση ──────────────────────────────────────────── */}
      <section className="sec">
        <div className="sec-top"><h2>Γρηγορη προσβαση</h2></div>
        <div className="grid g2">
          <Link className="card2 quick" href="/app/journal">
            <IJournal /><span><b>Trading Journal</b><em>Κατέγραψε τις κινήσεις σου</em></span>
          </Link>
          <Link className="card2 quick" href="/app/telegram">
            <ISend /><span><b>Telegram</b><em>Η καθημερινή συζήτηση</em></span>
          </Link>
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, catalogue, resumePoint, announcements } from '@/lib/academy';
import { IPlay, IJournal, ISend } from '@/components/Icons';

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

  return (
    <>
      <h1 className="h1">Καλώς ήρθες, {first}.</h1>
      <p className="sub">Η πρόοδός σου και ό,τι άφησες στη μέση.</p>

      <div className="sec">
        <div className="sec-top"><h2>Συνέχισε</h2></div>
        {resume ? (
          <Link className="card2 resume" href={`/app/academy/${resume.courseSlug}/${resume.lessonSlug}`}>
            <span className="resume-ico"><IPlay /></span>
            <span className="resume-txt">
              <em>{resume.courseTitle}</em>
              <b>{resume.lessonTitle}</b>
              <span className="bar">
                <span style={{ width: `${resume.total ? (resume.done / resume.total) * 100 : 0}%` }} />
              </span>
              <span className="meta">{resume.done}/{resume.total} στο μάθημα</span>
            </span>
            <span className="meta go">Συνέχεια →</span>
          </Link>
        ) : (
          <div className="empty2">
            <b>Δεν έχεις ξεκινήσει ακόμα κάποιο μάθημα.</b>
            Διάλεξε ένα από την <Link href="/app/academy">Ακαδημία</Link> και θα το βρίσκεις εδώ.
          </div>
        )}
      </div>

      <div className="sec">
        <div className="sec-top">
          <h2>Η πρόοδός σου</h2>
          <Link href="/app/academy">Όλα τα μαθήματα</Link>
        </div>
        <div className="card2">
          <div className="prog-head">
            <b className="h2">{done} από {total} μαθήματα</b>
            <span className="meta">{total ? Math.round(done / total * 100) : 0}%</span>
          </div>
          <div className="bar" style={{ marginTop: 12 }}>
            <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-top"><h2>Ανακοινώσεις</h2></div>
        {notes.length === 0 ? (
          <div className="empty2"><b>Καμία ανακοίνωση.</b>Εδώ θα βλέπεις ό,τι ανακοινώνει η ομάδα.</div>
        ) : (
          <ul className="notes">
            {notes.map((nt) => (
              <li key={nt.id}>
                <time dateTime={nt.published_at}>
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
      </div>

      <div className="sec">
        <div className="sec-top"><h2>Γρήγορη πρόσβαση</h2></div>
        <div className="grid g2">
          <Link className="card2 quick" href="/app/journal">
            <IJournal /><span><b>Trading Journal</b><em>Κατέγραψε τις κινήσεις σου</em></span>
          </Link>
          <Link className="card2 quick" href="/app/telegram">
            <ISend /><span><b>Telegram</b><em>Η καθημερινή συζήτηση</em></span>
          </Link>
        </div>
      </div>
    </>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, catalogue, resumePoint } from '@/lib/academy';
import { IPlay, IJournal, ISend } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const [courses, resume] = await Promise.all([catalogue(v), resumePoint(v)]);

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
            </span>
            <span className="meta">Συνέχεια →</span>
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

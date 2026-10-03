import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, courseBySlug, LEVEL_EL } from '@/lib/academy';
import { ILock, ICheck, IPlay } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function CoursePage({ params }: { params: { course: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const data = await courseBySlug(v, params.course);
  if (!data) notFound();

  const { course, modules, total, done } = data;

  return (
    <>
      <h1 className="h1">
        {course.title}{' '}
        {course.title.startsWith('Δείγμα') && <span className="tagdemo">Δείγμα</span>}
      </h1>
      {course.subtitle && <p className="sub">{course.subtitle}</p>}

      <div className="card2 coursehead">
        <div>
          <span className="meta">{LEVEL_EL[course.level]} · {total} μαθήματα</span>
          <div className="bar" style={{ marginTop: 10, maxWidth: 320 }}>
            <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </div>
        <span className="meta">{done}/{total}</span>
      </div>

      {course.description && <p className="coursedesc">{course.description}</p>}

      <div className="sec">
        {modules.length === 0 ? (
          <div className="empty2"><b>Δεν υπάρχουν ακόμη ενότητες.</b>Το περιεχόμενο ανεβαίνει σταδιακά.</div>
        ) : modules.map((m, mi) => (
          /* Ανοιχτή η πρώτη ενότητα: ο χρήστης βλέπει αμέσως τι περιέχει το
             μάθημα αντί για μια λίστα από κλειστά κουτιά. */
          <details key={m.id} className="mod" open={mi === 0}>
            <summary>
              <span className="mod-n">{String(mi + 1).padStart(2, '0')}</span>
              <span className="mod-t">
                <b>{m.title}</b>
                {m.summary && <em>{m.summary}</em>}
              </span>
              <span className="meta">{m.items.filter((l) => l.done).length}/{m.items.length}</span>
            </summary>
            <ol className="lessons2">
              {m.items.map((l) => (
                <li key={l.id}>
                  <Link href={`/app/academy/${course.slug}/${l.slug}`}
                        className={l.locked ? 'lk locked' : 'lk'}>
                    <span className="lk-ic">
                      {l.locked ? <ILock /> : l.done ? <ICheck /> : <IPlay />}
                    </span>
                    <span className="lk-t">
                      <b>{l.title}</b>
                      {l.summary && <em>{l.summary}</em>}
                    </span>
                    {l.duration_sec ? <span className="meta">{Math.round(l.duration_sec / 60)}′</span> : null}
                  </Link>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </>
  );
}

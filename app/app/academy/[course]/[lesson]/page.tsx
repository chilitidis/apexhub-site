import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, lessonBySlug } from '@/lib/academy';
import { ILock, ICheck, IPlay } from '@/components/Icons';
import DoneButton from '@/components/DoneButton';

export const dynamic = 'force-dynamic';

export default async function LessonPage({
  params,
}: { params: { course: string; lesson: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const d = await lessonBySlug(v, params.course, params.lesson);
  if (!d) notFound();

  const { course, lesson, files, prev, next, siblings } = d;

  return (
    <div className="lesson2">
      <div className="lesson2-main">
        <h1 className="h1">{lesson.title}</h1>
        {lesson.summary && <p className="sub">{lesson.summary}</p>}

        {lesson.locked ? (
          /* ΚΛΕΙΔΩΜΕΝΟ: ο server δεν έστειλε ποτέ vimeo_id ούτε κείμενο. Εδώ
             δεν κρύβουμε τίποτα — δεν υπάρχει τίποτα να κρυφτεί. */
          <div className="gate2">
            <span className="gate2-ic"><ILock /></span>
            <b>Αυτό το μάθημα δεν περιλαμβάνεται στο πακέτο σου.</b>
            <p>
              Το μάθημα υπάρχει και είναι έτοιμο. Χρειάζεται πρόσβαση ανώτερου
              πακέτου για να το δεις.
            </p>
            <a className="btn btn-solid" href="https://t.me/ApexHubChannel"
               target="_blank" rel="noopener">Πώς αποκτώ πρόσβαση</a>
          </div>
        ) : lesson.vimeo_id ? (
          <div className="player2">
            <iframe
              src={`https://player.vimeo.com/video/${lesson.vimeo_id}?color=E9C45C&title=0&byline=0&portrait=0&dnt=1`}
              title={lesson.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="empty2" style={{ marginTop: 20 }}>
            <b>Το βίντεο δεν έχει ανέβει ακόμη.</b>
            Η δομή είναι εδώ· το υλικό γυρίζεται με σειρά.
          </div>
        )}

        {!lesson.locked && lesson.body && (
          <div className="prose">{lesson.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
        )}

        {!lesson.locked && files.length > 0 && (
          <div className="sec">
            <div className="sec-top"><h2>Αρχεία</h2></div>
            <ul className="files">
              {files.map((f) => (
                <li key={f.id}>
                  <a href={f.url} download>{f.name}</a>
                  {f.size_bytes ? <span className="meta">{Math.round(f.size_bytes / 1024)} KB</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!lesson.locked && <div className="sec"><DoneButton lessonId={lesson.id} done={lesson.done} /></div>}

        <div className="pager2">
          {prev ? (
            <Link href={`/app/academy/${course.slug}/${prev.slug}`}>
              <span>Προηγούμενο</span><b>{prev.title}</b>
            </Link>
          ) : <span />}
          {next ? (
            <Link className="nx" href={`/app/academy/${course.slug}/${next.slug}`}>
              <span>Επόμενο</span><b>{next.title}</b>
            </Link>
          ) : <span />}
        </div>
      </div>

      <aside className="lesson2-side">
        <div className="sec-top"><h2>Στην ενότητα</h2></div>
        <ol className="sidelist">
          {siblings.map((l) => (
            <li key={l.id}>
              <Link href={`/app/academy/${course.slug}/${l.slug}`}
                    className={`${l.slug === lesson.slug ? 'here' : ''} ${l.locked ? 'locked' : ''}`}>
                <span className="lk-ic">{l.locked ? <ILock /> : l.done ? <ICheck /> : <IPlay />}</span>
                <span>{l.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

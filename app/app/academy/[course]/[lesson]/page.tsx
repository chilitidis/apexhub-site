import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf, lessonBySlug } from '@/lib/academy';
import { ILock, ICheck, IPlay } from '@/components/Icons';
import DoneButton from '@/components/DoneButton';
import Quiz from '@/components/Quiz';
import { quizForLesson } from '@/lib/quiz';
import { vimeoSrc } from '@/lib/admin';

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

  /* Το τεστ φορτώνεται μόνο για μάθημα που ο χρήστης δικαιούται να δει. Σε
     κλειδωμένο μάθημα δεν έχει νόημα — και δεν θα έπρεπε να φαίνεται καν ότι
     υπάρχει. */
  const quiz = lesson.locked || lesson.gated ? null : await quizForLesson(s.tid, lesson.id);

  return (
    <div className="lesson2">
      <div className="lesson2-main">
        <h1 className="h1">{lesson.title}</h1>
        {lesson.summary && <p className="sub">{lesson.summary}</p>}

        {lesson.gated ? (
          /* ΚΛΕΙΔΩΜΕΝΟ ΑΠΟ ΤΗ ΣΕΙΡΑ, ΟΧΙ ΑΠΟ ΤΟ ΠΑΚΕΤΟ. Ο χρήστης το ΕΧΕΙ
             πληρωμένο· απλώς δεν έχει φτάσει ακόμη εδώ. Το μήνυμα λέει τι
             ακριβώς λείπει και δίνει τον σύνδεσμο — όχι «αναβάθμισε». */
          <div className="gate2">
            <span className="gate2-ic"><ILock /></span>
            <b>Πρώτα ολοκλήρωσε το προηγούμενο μάθημα.</b>
            <p>
              Τα μαθήματα ανοίγουν με τη σειρά: κάθε τεστ ξεκλειδώνει το επόμενο
              μάθημα. {lesson.gatedBy ? <>Έχεις μείνει στο «{lesson.gatedBy.title}».</> : null}
            </p>
            {lesson.gatedBy && (
              <Link className="btn btn-solid"
                    href={`/app/academy/${course.slug}/${lesson.gatedBy.slug}`}>
                Πήγαινε στο «{lesson.gatedBy.title}»
              </Link>
            )}
          </div>
        ) : lesson.locked ? (
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
              src={vimeoSrc(lesson.vimeo_id)}
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

        {!lesson.locked && !lesson.gated && lesson.body && (
          <div className="prose">{lesson.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
        )}

        {!lesson.locked && !lesson.gated && files.length > 0 && (
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

        {!lesson.locked && !lesson.gated && (
          <div className="sec"><DoneButton lessonId={lesson.id} done={lesson.done} /></div>
        )}

        {quiz && (
          <Quiz
            quizId={quiz.id}
            questions={quiz.questions}
            needed={quiz.needed}
            passed={quiz.passed}
            attempts={quiz.attempts}
            nextTitle={next?.title ?? null}
          />
        )}

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
                    className={`${l.slug === lesson.slug ? 'here' : ''} ${l.locked || l.gated ? 'locked' : ''}`}>
                <span className="lk-ic">
                  {l.locked || l.gated ? <ILock /> : l.quizPassed || l.done ? <ICheck /> : <IPlay />}
                </span>
                <span>{l.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

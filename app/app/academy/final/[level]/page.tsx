import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { currentSession } from '@/lib/session';
import {
  viewerOf, catalogue, unlockedLevels, unlockedBy, levelName, LEVEL_ORDER,
  type Level,
} from '@/lib/academy';
import {
  finalQuiz, trackQuiz, overallQuiz, passedFinalLevels, passedTracks,
  type QuizView,
} from '@/lib/quiz';
import Quiz from '@/components/Quiz';
import { ILock } from '@/components/Icons';
import { currentLang } from '@/lib/lang';
import type { Lang } from '@/lib/i18n';

const T = {
  el: {
    level: 'Επιπεδο', notOpen: 'Αυτό το επίπεδο δεν έχει ανοίξει ακόμη.',
    opensWith: (lv: string) => `Ανοίγει με το Τελικό τεστ ${lv === 'Αρχάριος' ? 'Αρχαρίων' : lv}.`,
    preparing: 'Το περιεχόμενο ετοιμάζεται.', notDone: 'Δεν έχεις ολοκληρώσει ακόμη τη διαδρομή.',
    trackNotDone: (c: string) => `Δεν έχεις τελειώσει ακόμη τα μαθήματα «${c}».`,
    all: 'Ολη η ακαδημια', overallEnd: 'Το ολικό τεστ ανοίγει στο τέλος.',
    missing: (n: number, list: string) => `Θέλει και τα πέντε τελικά τεστ περασμένα. Σου ${n === 1 ? 'λείπει' : 'λείπουν'}: ${list}.`,
    finalT: 'Τελικό τεστ',
    introDef: (total: number, need: number) => `${total} ερωτήσεις από όλη την ύλη. Χρειάζονται ${need} σωστές.`,
    certE: 'Το πιστοποιητικο σου', ready: 'Είναι έτοιμο', certP: 'Με το όνομά σου, την ημερομηνία και το ποσοστό σου.', see: 'Δες το →',
    back: 'Πίσω στην Ακαδημία',
    left: (n: number) => `Το τελικό τεστ ανοίγει όταν τελειώσεις όλα τα μαθήματα. Σου ${n === 1 ? 'μένει 1 μάθημα' : `μένουν ${n} μαθήματα`}.`,
  },
  en: {
    level: 'Level', notOpen: 'This level hasn’t opened yet.',
    opensWith: (lv: string) => `It opens with the ${lv} Final test.`,
    preparing: 'The content is being prepared.', notDone: 'You haven’t completed the path yet.',
    trackNotDone: (c: string) => `You haven’t finished the “${c}” lessons yet.`,
    all: 'The whole academy', overallEnd: 'The overall test opens at the end.',
    missing: (_n: number, list: string) => `It requires all five final tests passed. Missing: ${list}.`,
    finalT: 'Final test',
    introDef: (total: number, need: number) => `${total} questions from the whole syllabus. You need ${need} correct.`,
    certE: 'Your certificate', ready: 'It’s ready', certP: 'With your name, the date and your score.', see: 'View it →',
    back: 'Back to the Academy',
    left: (n: number) => `The final test opens when you finish all the lessons. ${n === 1 ? '1 lesson left' : `${n} lessons left`}.`,
  },
};

export const dynamic = 'force-dynamic';

/* Τα tracks που μπορούν να έχουν δικό τους τελικό τεστ. */
const TRACKS = ['psychology', 'mindset'];

/**
 * =============================================================================
 * Κάθε τελικό τεστ της ακαδημίας, σε μία σελίδα
 * =============================================================================
 *
 * ΕΞΙ ΚΛΕΙΔΙΑ, ΕΝΑ ΑΡΧΕΙΟ: `beginner`, `intermediate`, `advanced` για τα τρία
 * επίπεδα, `psychology` και `mindset` για τα δύο tracks, και `overall` για το
 * ολικό τεστ που δίνει το πιστοποιητικό. (Ο φάκελος λέγεται ακόμη `[level]`
 * από τότε που υπήρχε μόνο το τεστ του Αρχάριου· το όνομα του φακέλου δεν
 * φαίνεται πουθενά, και η μετονομασία θα έσπαγε τα links που κυκλοφορούν.)
 *
 * ΤΟ ΚΛΕΙΔΩΜΑ ΔΕΝ ΕΙΝΑΙ ΤΟ ΙΔΙΟ ΓΙΑ ΟΛΑ:
 *   · Επίπεδο — πρέπει να έχει ανοίξει ΚΑΙ να έχει τελειώσει η διαδρομή του.
 *   · Track   — δεν κλειδώνεται από επίπεδο· αρκεί να έχει τελειώσει το ίδιο
 *               το track. Τα δύο tracks δεν κλειδώνουν το ένα το άλλο.
 *   · Ολικό   — θέλει και τα πέντε τελικά περασμένα. Το πιστοποιητικό λέει
 *               «ολοκλήρωσε την ακαδημία»· αν άνοιγε νωρίτερα, θα έλεγε ψέματα.
 *
 * Ο διαχειριστής μπαίνει πάντα: πρέπει να μπορεί να ελέγξει το τεστ χωρίς να
 * περάσει ενενήντα οκτώ μαθήματα πρώτα.
 */
export default async function FinalQuizPage({
  params,
}: { params: { level: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');
  const key = params.level;

  const isLevel = (LEVEL_ORDER as string[]).includes(key);
  const isTrack = TRACKS.includes(key);
  if (!isLevel && !isTrack && key !== 'overall') notFound();

  const v = await viewerOf(s.tid);
  const courses = await catalogue(v);
  const lang = currentLang();
  const t = T[lang];

  let quiz: QuizView | null = null;
  let eyebrow = '';
  let blocked: { title: string; why: ReactNode } | null = null;

  if (isLevel) {
    const level = key as Level;
    const [q, open] = await Promise.all([finalQuiz(s.tid, level), unlockedLevels(v)]);
    quiz = q;
    eyebrow = `${t.level} ${LEVEL_ORDER.indexOf(level) + 1} · ${levelName(level, lang)}`;

    const prev = unlockedBy(level);
    const left = courses
      .filter((c) => c.level === level && c.category !== 'track')
      .reduce((a, c) => a + (c.lessons - c.done), 0);

    if (!open.has(level)) {
      blocked = {
        title: t.notOpen,
        why: prev ? t.opensWith(levelName(prev, lang)) : t.preparing,
      };
    } else if (left > 0) {
      blocked = { title: t.notDone, why: leftText(left, lang) };
    }
  } else if (isTrack) {
    const course = courses.find((c) => c.slug === key);
    if (!course) notFound();
    quiz = await trackQuiz(s.tid, course.id);
    eyebrow = course.title;
    const left = course.lessons - course.done;
    if (left > 0) blocked = { title: t.trackNotDone(course.title), why: leftText(left, lang) };
  } else {
    const [q, lv, tr] = await Promise.all([
      overallQuiz(s.tid), passedFinalLevels(s.tid), passedTracks(s.tid),
    ]);
    quiz = q;
    eyebrow = t.all;

    const missing = [
      ...LEVEL_ORDER.filter((l) => !lv.has(l)).map((l) => levelName(l, lang)),
      ...courses.filter((c) => TRACKS.includes(c.slug) && !tr.has(c.id)).map((c) => c.title),
    ];
    if (missing.length) {
      blocked = {
        title: t.overallEnd,
        why: t.missing(missing.length, missing.join(', ')),
      };
    }
  }

  if (!quiz) notFound();
  const ready = v.admin || !blocked;

  return (
    <>
      <header className="hero">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="h1" style={{ marginTop: 14 }}>{quiz.title ?? t.finalT}</h1>
        <p className="sub">
          {quiz.intro
            ?? t.introDef(quiz.total, quiz.needed)}
        </p>
      </header>

      {/* Περασμένο ολικό: η σελίδα δείχνει πρώτα τον δρόμο προς το
          πιστοποιητικό, και μετά το τεστ για όποιον θέλει να το ξαναδώσει. */}
      {key === 'overall' && quiz.passed && (
        <Link href="/app/academy/certificate" className="finalcard" style={{ marginTop: 28 }}>
          <span className="finalcard-txt">
            <span className="eyebrow sm">{t.certE}</span>
            <b className="h2">{t.ready}</b>
            <em>{t.certP}</em>
          </span>
          <span className="meta">{t.see}</span>
        </Link>
      )}

      {!ready && blocked ? (
        <div className="gate2" style={{ marginTop: 34 }}>
          <span className="gate2-ic"><ILock /></span>
          <b>{blocked.title}</b>
          <p>{blocked.why}</p>
          <Link className="gold-btn" href="/app/academy">{t.back}</Link>
        </div>
      ) : (
        <Quiz
          quizId={quiz.id}
          questions={quiz.questions}
          needed={quiz.needed}
          passed={quiz.passed}
          attempts={quiz.attempts}
          nextTitle={null}
          final
          lang={lang}
        />
      )}
    </>
  );
}

function leftText(left: number, lang: Lang) {
  return T[lang].left(left);
}

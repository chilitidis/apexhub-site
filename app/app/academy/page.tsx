import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import {
  viewerOf, catalogue, unlockedLevels, unlockedBy, levelName,
  type Level, type CourseView,
} from '@/lib/academy';
import { finalQuiz, trackQuiz, overallQuiz, type QuizView } from '@/lib/quiz';
import { ILock, ICheck } from '@/components/Icons';
import { currentLang } from '@/lib/lang';

const T = {
  el: {
    finalT: 'Τελικό τεστ', done: 'Ολοκληρώθηκε', go: 'Δώσ’ το →', of: 'σωστές από',
    draft: 'Πρόχειρο', lessons: 'μαθήματα', minutes: 'λεπτά',
    h1: 'Ακαδημία',
    sub: 'Δομημένη διαδρομή. Κάθε ενότητα πατάει στην προηγούμενη, και κάθε επίπεδο ανοίγει με το τελικό του τεστ.',
    lvGroup: 'Επίπεδο', all: 'Όλα',
    noHit: 'Δεν βρέθηκε ενότητα.', tryOther: (q: string) => `Δοκίμασε άλλον όρο από το «${q}».`,
    level: 'Επιπεδο',
    notOpen: 'Δεν έχει ανοίξει ακόμη',
    waiting: (n: number) => `${n === 1 ? 'Μία ενότητα' : `${n} ενότητες`} σε αναμονή`,
    unlocksWith: (lv: string) => `Ξεκλειδώνει με το Τελικό τεστ ${lv === 'Αρχάριος' ? 'Αρχαρίων' : lv}.`,
    preparing: 'Το περιεχόμενο ετοιμάζεται.',
    closesLevel: 'Κλεινει το επιπεδο',
    passedLast: 'Το έχεις περάσει. Έκλεισες τη διαδρομή των επιπέδων.',
    passedNext: 'Το έχεις περάσει. Το επόμενο επίπεδο σε περιμένει.',
    todoLast: 'για να κλείσει η διαδρομή.', todoNext: 'για να ανοίξει το επόμενο επίπεδο.',
    mind: 'Το μυαλο του trader', mindSub: 'Ανοιχτά από την πρώτη μέρα, σε όποιο επίπεδο κι αν βρίσκεσαι.',
    closesTrack: 'Κλεινει την ενοτητα',
    trackDone: 'Το έχεις περάσει. Μετράει για το ολικό τεστ.', trackTodo: 'για να μετρήσει στο ολικό τεστ.',
    end: 'Το τελος της διαδρομης', allAcademy: 'Ολη η ακαδημια',
    overallDone: 'Το πέρασες. Το πιστοποιητικό σου είναι έτοιμο.', overallTodo: 'για το πιστοποιητικό ολοκλήρωσης.',
    cert: 'Πιστοποιητικο', certT: 'Το πιστοποιητικό σου', certP: 'Με το όνομά σου, την ημερομηνία και το ποσοστό σου.', see: 'Δες το →',
  },
  en: {
    finalT: 'Final test', done: 'Completed', go: 'Take it →', of: 'correct out of',
    draft: 'Draft', lessons: 'lessons', minutes: 'min',
    h1: 'Academy',
    sub: 'A structured path. Each course builds on the previous one, and each level opens with its final test.',
    lvGroup: 'Level', all: 'All',
    noHit: 'No course found.', tryOther: (q: string) => `Try a different term than “${q}”.`,
    level: 'Level',
    notOpen: 'Not open yet',
    waiting: (n: number) => `${n === 1 ? 'One course' : `${n} courses`} waiting`,
    unlocksWith: (lv: string) => `Unlocks with the ${lv} Final test.`,
    preparing: 'The content is being prepared.',
    closesLevel: 'Closes the level',
    passedLast: 'You’ve passed it. You have completed the level path.',
    passedNext: 'You’ve passed it. The next level is waiting for you.',
    todoLast: 'to complete the path.', todoNext: 'to open the next level.',
    mind: 'The trader’s mind', mindSub: 'Open from day one, whatever level you are at.',
    closesTrack: 'Closes the course',
    trackDone: 'You’ve passed it. It counts towards the overall test.', trackTodo: 'to count towards the overall test.',
    end: 'The end of the path', allAcademy: 'The whole academy',
    overallDone: 'You passed it. Your certificate is ready.', overallTodo: 'for the certificate of completion.',
    cert: 'Certificate', certT: 'Your certificate', certP: 'With your name, the date and your score.', see: 'View it →',
  },
};

export const dynamic = 'force-dynamic';

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Ο κατάλογος της ακαδημίας.
 *
 * ΟΧΙ ΜΙΑ ΣΟΥΠΑ ΑΠΟ ΚΑΡΤΕΣ. Η ύλη έχει σειρά και η σελίδα τη δείχνει: τα
 * επίπεδα είναι ενότητες, μέσα σε κάθε επίπεδο η ΔΙΑΔΡΟΜΗ (τα μαθήματα που
 * χτίζουν το ένα πάνω στο άλλο) κλείνει με το τελικό τεστ, και τα TRACKS —
 * όσα διαβάζονται όποτε θέλει κανείς — κάθονται χωριστά από κάτω.
 *
 * Ένα επίπεδο χωρίς περιεχόμενο ΔΕΝ εξαφανίζεται· φαίνεται κλειδωμένο. Το
 * μέλος πρέπει να ξέρει ότι υπάρχει συνέχεια και με τι ανοίγει.
 */
export default async function Catalogue({
  searchParams,
}: { searchParams: { q?: string; level?: string } }) {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const lang = currentLang();
  const t = T[lang];
  /* ΤΟ ΤΕΛΙΚΟ ΤΕΣΤ ΚΑΘΕ ΕΠΙΠΕΔΟΥ, ΟΧΙ ΜΟΝΟ ΤΟΥ ΑΡΧΑΡΙΟΥ. Όσο υπήρχε ένα
     μόνο τεστ, η σελίδα το ζητούσε με το όνομά του. Με τρία επίπεδα αυτό θα
     έδειχνε διαδρομές που τελειώνουν πουθενά: ο Μεσαίος θα τελείωνε χωρίς
     πόρτα προς τον Προχωρημένο. */
  const [all, finals, open] = await Promise.all([
    catalogue(v),
    Promise.all(LEVELS.map((l) => finalQuiz(s.tid, l))),
    unlockedLevels(v),
  ]);
  const finalOf = new Map(LEVELS.map((l, i) => [l, finals[i]]));

  const q = (searchParams.q ?? '').trim().toLowerCase();
  const level = searchParams.level ?? '';

  const matches = (c: CourseView) =>
    !q || `${c.title} ${c.subtitle ?? ''} ${c.description ?? ''}`.toLowerCase().includes(q);

  const shown = LEVELS.filter((l) => !level || level === l);
  const hits = all.filter(matches);

  /* ΤΑ TRACKS ΔΕΝ ΑΝΗΚΟΥΝ ΣΕ ΕΠΙΠΕΔΟ. Η ψυχολογία και η νοοτροπία αφορούν
     τον αρχάριο όσο και τον προχωρημένο, δεν κλειδώνουν τίποτα και δεν τα
     κλειδώνει τίποτα. Γι' αυτό βγαίνουν ΜΙΑ φορά, τέρμα κάτω, και όχι μέσα
     σε κάθε επίπεδο — αλλιώς το ίδιο υλικό θα φαινόταν τρεις φορές. */
  const tracks = hits.filter((c) => c.category === 'track');

  /* Το τελικό τεστ κάθε track, και το ολικό που κλείνει τα πάντα. Το δεύτερο
     ερώτημα γίνεται εδώ και όχι πιο πάνω επειδή χρειάζεται τα ίδια τα tracks:
     το τεστ του track δένεται στο μάθημα, όχι σε επίπεδο. */
  const [trackFinals, overall] = await Promise.all([
    Promise.all(tracks.map((c) => trackQuiz(s.tid, c.id))),
    overallQuiz(s.tid),
  ]);

  const href = (l: string) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (l) p.set('level', l);
    const qs = p.toString();
    return qs ? `/app/academy?${qs}` : '/app/academy';
  };

  /* Η κάρτα ενός τεστ που κλείνει κάτι: επίπεδο, track ή όλη την ακαδημία.
     Μία συνάρτηση για τα τρία, γιατί είναι η ίδια κάρτα — αλλάζει μόνο το
     τι υπόσχεται όταν περαστεί. */
  const testCard = (to: string, fin: QuizView, eyebrow: string, done: string, todo: string) => (
    <Link key={to} href={to} className="finalcard">
      <span className="finalcard-ic">{fin.passed ? <ICheck /> : <ILock />}</span>
      <span className="finalcard-txt">
        <span className="eyebrow sm">{eyebrow}</span>
        <b className="h2">{fin.title ?? t.finalT}</b>
        <em>{fin.passed ? done : `${fin.needed} ${t.of} ${fin.total} ${todo}`}</em>
      </span>
      <span className="meta">{fin.passed ? t.done : t.go}</span>
    </Link>
  );

  const card = (c: CourseView) => (
    <Link key={c.id} href={`/app/academy/${c.slug}`}
          className={`card2 course ${c.locked ? 'locked' : ''}`}>
      <span className="course-cover">
        <span className="cover-art"><span>{c.title}</span></span>
        {c.locked && <span className="lockpill"><ILock /></span>}
        {c.status === 'draft' && <span className="draftpill">{t.draft}</span>}
      </span>
      <span className="course-body">
        <b className="h2">{c.title}</b>
        {c.subtitle && <span className="course-sub">{c.subtitle}</span>}
        <span className="meta num course-facts">
          {c.lessons} {t.lessons}{c.minutes ? ` · ${c.minutes} ${t.minutes}` : ''}
        </span>
        <span className="course-prog">
          <span className="bar">
            <span style={{ width: `${c.lessons ? (c.done / c.lessons) * 100 : 0}%` }} />
          </span>
          <span className="meta num">{c.done}/{c.lessons}</span>
        </span>
      </span>
    </Link>
  );

  return (
    <>
      <header className="hero">
        <h1 className="h1">{t.h1}</h1>
        <p className="sub">{t.sub}</p>
      </header>

      {/* Segmented control: ένα πλαίσιο, ο δείκτης γλιστράει μέσα του. */}
      <div className="seg" role="group" aria-label={t.lvGroup}>
        <Link href={href('')} className={!level ? 'on' : ''}>{t.all}</Link>
        {LEVELS.map((l) => (
          <Link key={l} href={href(l)} className={level === l ? 'on' : ''}>{levelName(l, lang)}</Link>
        ))}
      </div>

      {q && hits.length === 0 && (
        <div className="empty2" style={{ marginTop: 28 }}>
          <b>{t.noHit}</b>
          {t.tryOther(q)}
        </div>
      )}

      {shown.map((l, i) => {
        const path = hits.filter((c) => c.level === l && c.category !== 'track');
        const empty = path.length === 0;
        /* Κλειδωμένο επίπεδο: υπάρχει υλικό, αλλά δεν έχει ανοίξει ακόμη. */
        const locked = !open.has(l);
        const prev = unlockedBy(l);

        /* Ένα κενό επίπεδο κατά την αναζήτηση δεν είναι «κλειδωμένο», είναι
           απλώς εκτός αποτελεσμάτων. Δεν δείχνουμε λουκέτο εκεί. */
        if (empty && q) return null;

        return (
          <section className="sec level" key={l}>
            <div className="sec-top">
              <h2>{t.level} {i + 1} · {levelName(l, lang).toUpperCase()}</h2>
            </div>

            {empty || locked ? (
              <div className="locked-level">
                <span className="locked-ic"><ILock /></span>
                <div>
                  <b className="h2">
                    {empty ? t.notOpen : t.waiting(path.length)}
                  </b>
                  <p>
                    {prev
                      ? t.unlocksWith(levelName(prev, lang))
                      : t.preparing}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {path.length > 0 && <div className="grid g3">{path.map(card)}</div>}

                {/* Το τελικό τεστ κλείνει τη διαδρομή του επιπέδου. Το
                    τελευταίο επίπεδο δεν ξεκλειδώνει κάτι επόμενο — το λέει. */}
                {(() => {
                  const fin = finalOf.get(l);
                  if (!fin || q) return null;
                  const last = i === LEVELS.length - 1;
                  return testCard(
                    `/app/academy/final/${l}`, fin, t.closesLevel,
                    last ? t.passedLast : t.passedNext,
                    last ? t.todoLast : t.todoNext,
                  );
                })()}

              </>
            )}
          </section>
        );
      })}

      {/* Η ΝΟΟΤΡΟΠΙΑ, ΜΙΑ ΦΟΡΑ, ΤΕΡΜΑ ΚΑΤΩ. Ανοιχτά από την πρώτη μέρα και σε
          κάθε επίπεδο: δύο κάρτες, ψυχολογία και νοοτροπία. */}
      {tracks.length > 0 && !level && (
        <section className="sec level">
          <div className="sec-top">
            <h2>{t.mind}</h2>
          </div>
          <p className="sub tracks-sub">{t.mindSub}</p>
          <div className="grid g3">{tracks.map(card)}</div>

          {/* Ένα τελικό τεστ ανά track. Δεν ξεκλειδώνουν επίπεδο — μετράνε
              για το ολικό, και μόνο γι' αυτό. */}
          {!q && tracks.map((c, n) => {
            const fin = trackFinals[n];
            return fin ? testCard(
              `/app/academy/final/${c.slug}`, fin, t.closesTrack,
              t.trackDone,
              t.trackTodo,
            ) : null;
          })}
        </section>
      )}

      {/* ΤΟ ΟΛΙΚΟ ΤΕΣΤ, ΤΕΛΕΥΤΑΙΟ ΣΤΗ ΣΕΛΙΔΑ ΟΠΩΣ ΚΑΙ ΣΤΗ ΔΙΑΔΡΟΜΗ.
          Ανοίγει μόνο με τα πέντε τελικά περασμένα, και δίνει το χαρτί. */}
      {overall && !q && !level && (
        <section className="sec level">
          <div className="sec-top">
            <h2>{t.end}</h2>
          </div>
          {testCard(
            '/app/academy/final/overall', overall, t.allAcademy,
            t.overallDone,
            t.overallTodo,
          )}
          {overall.passed && (
            <Link href="/app/academy/certificate" className="finalcard">
              <span className="finalcard-ic"><ICheck /></span>
              <span className="finalcard-txt">
                <span className="eyebrow sm">{t.cert}</span>
                <b className="h2">{t.certT}</b>
                <em>{t.certP}</em>
              </span>
              <span className="meta">{t.see}</span>
            </Link>
          )}
        </section>
      )}
    </>
  );
}

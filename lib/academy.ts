import 'server-only';
import { db } from './db';
import { lessonsWithQuiz, passedLessons, passedFinalLevels } from './quiz';
import { currentLang } from './lang';
import { loc, type Lang } from './i18n';

/**
 * =============================================================================
 * Το περιεχόμενο και ποιος το βλέπει
 * =============================================================================
 *
 * ΟΛΟΣ Ο ΕΛΕΓΧΟΣ ΠΡΟΣΒΑΣΗΣ ΕΙΝΑΙ ΕΔΩ, ΣΤΟΝ SERVER. Το front-end δεν «κρύβει»
 * κλειδωμένα μαθήματα — ο server δεν στέλνει ποτέ το vimeo_id ενός μαθήματος
 * που το μέλος δεν δικαιούται. Αν το έκρυβε μόνο το CSS, θα αρκούσε ένα
 * δεξί κλικ για να φανεί.
 *
 * Ο ΚΑΝΟΝΑΣ ΠΡΟΣΒΑΣΗΣ:
 *   · διαχειριστής                → τα πάντα
 *   · is_free                     → κάθε μέλος
 *   · κανένα πακέτο δηλωμένο      → κάθε μέλος (ανοιχτό εξ ορισμού)
 *   · δηλωμένα πακέτα             → μόνο όποιος κρατάει ένα από αυτά
 *
 * Κάθε μέλος που περνάει την πύλη του Telegram κρατάει αυτομάτως το «vip»:
 * η είσοδος ΑΠΑΙΤΕΙ συμμετοχή στο VIP group, οπότε μια δεύτερη λίστα με τα
 * ίδια 70 άτομα θα ήταν αντίγραφο που θα ξεσυγχρονιζόταν.
 */

export type Level = 'beginner' | 'intermediate' | 'advanced';

export const LEVEL_EL: Record<Level, string> = {
  beginner: 'Αρχάριος', intermediate: 'Μεσαίος', advanced: 'Προχωρημένος',
};
export const LEVEL_EN: Record<Level, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};
/** Το όνομα του επιπέδου στη γλώσσα της σελίδας. */
export const levelName = (lv: Level, lang: Lang) => (lang === 'en' ? LEVEL_EN : LEVEL_EL)[lv];

/* Τα πεδία που έχουν αγγλικό δίδυμο στη βάση (`<πεδίο>_en`). */
const C_F = ['title', 'subtitle', 'description'];
const M_F = ['title', 'summary'];
const L_F = ['title', 'summary', 'body'];

/** Η σειρά των επιπέδων. Από αυτήν βγαίνει ποιο ξεκλειδώνει ποιο. */
export const LEVEL_ORDER: Level[] = ['beginner', 'intermediate', 'advanced'];

/**
 * =============================================================================
 * ΠΟΙΑ ΕΠΙΠΕΔΑ ΕΧΕΙ ΑΝΟΙΧΤΑ ΤΟ ΜΕΛΟΣ
 * =============================================================================
 *
 * Ο ΚΑΝΟΝΑΣ: το πρώτο επίπεδο είναι πάντα ανοιχτό. Κάθε επόμενο ανοίγει μόνο
 * όταν έχει περαστεί το ΤΕΛΙΚΟ τεστ του προηγούμενου.
 *
 * Η ΣΑΡΩΣΗ ΣΤΑΜΑΤΑ ΣΤΟ ΠΡΩΤΟ ΚΛΕΙΔΩΜΑ, δεν συνεχίζει. Αν κάποιος περνούσε
 * το τελικό του «Μεσαίου» χωρίς να έχει περάσει του «Αρχάριου» — πράγμα που
 * θα γινόταν αν άνοιγε η σελίδα με απευθείας διεύθυνση — δεν πρέπει να
 * ξεκλειδώνει ο «Προχωρημένος» πηδώντας ένα επίπεδο.
 *
 * ΕΠΙΠΕΔΟ ΧΩΡΙΣ ΤΕΛΙΚΟ ΤΕΣΤ ΜΠΛΟΚΑΡΕΙ ΟΣΑ ΕΡΧΟΝΤΑΙ ΜΕΤΑ, και σωστά: δεν
 * υπάρχει τρόπος να το περάσεις, άρα δεν υπάρχει τρόπος να το προσπεράσεις.
 * Σήμερα αυτό αφορά τον «Μεσαίο», που δεν έχει ακόμη τελικό τεστ.
 *
 * Ο ΔΙΑΧΕΙΡΙΣΤΗΣ ΤΑ ΒΛΕΠΕΙ ΟΛΑ: πρέπει να μπορεί να ελέγξει το υλικό χωρίς
 * να περάσει τριάντα ερωτήσεις.
 */
export async function unlockedLevels(v: Viewer): Promise<Set<Level>> {
  if (v.admin) return new Set(LEVEL_ORDER);
  const passed = await passedFinalLevels(v.tid);
  const out = new Set<Level>();
  for (const lv of LEVEL_ORDER) {
    out.add(lv);
    if (!passed.has(lv)) break;
  }
  return out;
}

/** Ποιο επίπεδο πρέπει να κλείσει κανείς για να ανοίξει το `lv`. */
export function unlockedBy(lv: Level): Level | null {
  const i = LEVEL_ORDER.indexOf(lv);
  return i > 0 ? LEVEL_ORDER[i - 1] : null;
}

export interface Course {
  id: string; slug: string; title: string; subtitle: string | null;
  description: string | null; cover_url: string | null;
  level: Level; category: string | null; sort: number; status: string;
}
export interface Module { id: string; course_id: string; title: string; summary: string | null; sort: number; status: string }
export interface Lesson {
  id: string; module_id: string; course_id: string; slug: string; title: string;
  summary: string | null; body: string | null; vimeo_id: string | null;
  duration_sec: number | null; sort: number; status: string; is_free: boolean;
}
export interface LessonFile { id: string; lesson_id: string; name: string; url: string; size_bytes: number | null; sort: number }

export interface Viewer { tid: number; admin: boolean; partner: boolean; tiers: Set<string> }

/** Ποιος είναι ο θεατής: διαχειριστής; ποια πακέτα κρατάει; */
export async function viewerOf(tid: number): Promise<Viewer> {
  const s = db();
  const [{ data: adm }, { data: acc }, { data: prt }] = await Promise.all([
    s.from('platform_admins').select('telegram_id').eq('telegram_id', tid).maybeSingle(),
    s.from('member_access').select('access_tiers(slug)').eq('telegram_id', tid),
    /* Το back office δεν αφορά κάθε μέλος — μόνο όποιον έχει καρτέλα
       συνεργάτη. Χωρίς αυτόν τον έλεγχο, και τα 70 μέλη έβλεπαν στο μενού
       μια πόρτα που τους ζητούσε σύνδεση που δεν έχουν. */
    s.from('partners').select('id').eq('telegram_id', tid).maybeSingle(),
  ]);

  const tiers = new Set<string>(['vip']);          // βλ. σχόλιο παραπάνω
  for (const row of (acc ?? []) as Array<{ access_tiers: { slug: string } | { slug: string }[] | null }>) {
    const t = Array.isArray(row.access_tiers) ? row.access_tiers[0] : row.access_tiers;
    if (t?.slug) tiers.add(t.slug);
  }
  return { tid, admin: Boolean(adm), partner: Boolean(prt), tiers };
}

/** Χάρτης «τι απαιτεί τι»: scope+target → σύνολο slug πακέτων. */
async function accessMap(): Promise<Map<string, Set<string>>> {
  const { data } = await db()
    .from('content_access')
    .select('scope, target_id, access_tiers(slug)');
  const m = new Map<string, Set<string>>();
  for (const r of (data ?? []) as Array<{ scope: string; target_id: string; access_tiers: { slug: string } | { slug: string }[] | null }>) {
    const t = Array.isArray(r.access_tiers) ? r.access_tiers[0] : r.access_tiers;
    if (!t?.slug) continue;
    const k = `${r.scope}:${r.target_id}`;
    if (!m.has(k)) m.set(k, new Set());
    m.get(k)!.add(t.slug);
  }
  return m;
}

function allowed(v: Viewer, req: Set<string> | undefined): boolean {
  if (v.admin) return true;
  if (!req || req.size === 0) return true;       // κανένα πακέτο = ανοιχτό
  for (const slug of req) if (v.tiers.has(slug)) return true;
  return false;
}

export interface LessonView extends Omit<Lesson, 'vimeo_id' | 'body'> {
  /** Κλειδωμένο γιατί δεν το καλύπτει το πακέτο του μέλους. */
  locked: boolean;
  /**
   * Κλειδωμένο γιατί δεν έχει περάσει το τεστ του ΠΡΟΗΓΟΥΜΕΝΟΥ μαθήματος.
   *
   * Ξεχωριστό πεδίο από το `locked` επειδή είναι ΤΕΛΕΙΩΣ άλλο πρόβλημα για τον
   * χρήστη: το ένα λύνεται με αναβάθμιση πακέτου, το άλλο με δέκα λεπτά
   * διάβασμα. Ένα κοινό λουκέτο με το ίδιο μήνυμα θα έστελνε κόσμο να πληρώσει
   * για κάτι που ήδη έχει.
   */
  gated: boolean;
  /** Το μάθημα που πρέπει να ολοκληρώσει πρώτα. Μόνο όταν `gated`. */
  gatedBy?: { slug: string; title: string };
  hasQuiz: boolean;
  quizPassed: boolean;
  done: boolean;
  /** Μόνο αν ΔΕΝ είναι κλειδωμένο. Αλλιώς δεν φεύγει ποτέ από τον server. */
  vimeo_id?: string | null;
  body?: string | null;
}

export interface CourseView extends Course {
  lessons: number; done: number; locked: boolean; minutes: number;
  /** Κλειδωμένο επειδή δεν έχει ανοίξει το επίπεδο, όχι το πακέτο. */
  levelLocked: boolean;
}

/**
 * =============================================================================
 * ΤΟ 404 ΣΤΑ ΕΛΛΗΝΙΚΑ SLUGS
 * =============================================================================
 *
 * ΤΟ ΣΦΑΛΜΑ: τα slugs των μαθημάτων είναι ελληνικά — `οι-4-συνεδριες`,
 * `τι-ειναι-το-forex`. Ο browser ΔΕΝ στέλνει ποτέ ελληνικά γράμματα στη
 * διαδρομή· τα στέλνει ως percent-encoding: `%CE%BF%CE%B9-4-%CF%83...`.
 * Το `params.lesson` του App Router φτάνει εδώ έτσι όπως ήρθε στο δίκτυο,
 * δηλαδή κωδικοποιημένο. Η σύγκριση `l.slug === lessonSlug` έβγαζε λοιπόν
 * πάντα ψέμα και η σελίδα κατέληγε σε `notFound()`.
 *
 * ΓΙΑΤΙ ΤΟ ΕΙΔΑΜΕ ΜΟΝΟ ΤΩΡΑ: όσο τα slugs ήταν λατινικά (`spread`,
 * `stop-loss`) κωδικοποιημένη και ακατέργαστη μορφή ήταν ταυτόσημες. Τα
 * 404 εμφανίστηκαν την ημέρα που μπήκαν τα πρώτα ελληνικά μαθήματα.
 *
 * ΓΙΑΤΙ ΔΕΝ ΑΛΛΑΖΟΥΜΕ ΤΑ SLUGS ΣΕ ΛΑΤΙΝΙΚΑ: το `slugify()` του admin κρατά
 * ελληνικά εσκεμμένα, ώστε οι διευθύνσεις να διαβάζονται. Αν το λύναμε με
 * μεταγραφή, το σφάλμα θα επέστρεφε στο επόμενο ελληνικό μάθημα που θα
 * έφτιαχνε ο admin από το πάνελ.
 *
 * ΤΟ NFC: στο macOS το ίδιο ελληνικό κείμενο γράφεται και με χωριστούς
 * τόνους (NFD). Δύο μορφές που δείχνουν ίδιες αλλά δεν είναι ίσες ως
 * strings. Κανονικοποιούμε και τις δύο πλευρές στην ίδια μορφή.
 */
export function urlSlug(raw: string): string {
  let s = raw;
  if (s.includes('%')) {
    try {
      s = decodeURIComponent(s);
    } catch {
      /* Κακοσχηματισμένο encoding: κρατάμε το ακατέργαστο και αφήνουμε τη
         σύγκριση να αποτύχει καθαρά, αντί να πετάξουμε 500. */
    }
  }
  return s.normalize('NFC');
}

/** Ο κατάλογος, με πρόοδο και κλειδώματα υπολογισμένα. */
export async function catalogue(v: Viewer): Promise<CourseView[]> {
  const s = db();
  const q = s.from('courses').select('*').order('sort');
  const { data: courses } = v.admin ? await q : await q.eq('status', 'published');

  const ids = (courses ?? []).map((c) => (c as Course).id);
  if (!ids.length) return [];

  const [{ data: lessons }, { data: prog }, am, open] = await Promise.all([
    s.from('lessons').select('id, course_id, module_id, is_free, duration_sec, status').in('course_id', ids),
    s.from('lesson_progress').select('lesson_id, completed_at').eq('telegram_id', v.tid),
    accessMap(),
    unlockedLevels(v),
  ]);

  const doneSet = new Set(
    ((prog ?? []) as Array<{ lesson_id: string; completed_at: string | null }>)
      .filter((p) => p.completed_at).map((p) => p.lesson_id),
  );

  const lang = currentLang();
  return (courses ?? []).map((raw) => {
    const c = loc(raw as unknown as Course, lang, C_F);
    const ls = ((lessons ?? []) as Array<{ id: string; course_id: string; module_id: string; is_free: boolean; duration_sec: number | null; status: string }>)
      .filter((l) => l.course_id === c.id && (v.admin || l.status === 'published'));
    const levelLocked = !open.has(c.level);
    return {
      ...c,
      lessons: ls.length,
      done: ls.filter((l) => doneSet.has(l.id)).length,
      minutes: Math.round(ls.reduce((a, l) => a + (l.duration_sec ?? 0), 0) / 60),
      locked: levelLocked || !allowed(v, am.get(`course:${c.id}`)),
      levelLocked,
    };
  });
}

/** Ένα μάθημα με τις ενότητες και τα lessons του, κλειδώματα υπολογισμένα. */
export async function courseBySlug(v: Viewer, rawSlug: string) {
  const s = db();
  const slug = urlSlug(rawSlug);
  const { data: c } = await s.from('courses').select('*').eq('slug', slug).maybeSingle();
  if (!c) return null;
  const lang = currentLang();
  const course = loc(c as unknown as Course, lang, C_F);
  if (course.status !== 'published' && !v.admin) return null;

  const [{ data: mods }, { data: les }, { data: prog }, am, open] = await Promise.all([
    s.from('modules').select('*').eq('course_id', course.id).order('sort'),
    s.from('lessons').select('*').eq('course_id', course.id).order('sort'),
    s.from('lesson_progress').select('lesson_id, completed_at').eq('telegram_id', v.tid),
    accessMap(),
    unlockedLevels(v),
  ]);

  const doneSet = new Set(
    ((prog ?? []) as Array<{ lesson_id: string; completed_at: string | null }>)
      .filter((p) => p.completed_at).map((p) => p.lesson_id),
  );

  /* Το κλείδωμα επιπέδου μπαίνει ΕΔΩ, μαζί με το κλείδωμα πακέτου, γιατί από
     εδώ περνάει και η σελίδα του μαθήματος: ό,τι είναι `locked` δεν παίρνει
     ποτέ vimeo_id (βλ. `lessonBySlug`). Αν το κλείδωμα ζούσε μόνο στον
     κατάλογο, θα αρκούσε η απευθείας διεύθυνση για να το προσπεράσει κανείς. */
  const levelLocked = !open.has(course.level);
  const courseLocked = levelLocked || !allowed(v, am.get(`course:${course.id}`));

  const modules = ((mods ?? []) as unknown as Module[])
    .filter((m) => v.admin || m.status === 'published')
    .map((m0) => {
      const m = loc(m0, lang, M_F);
      const modLocked = courseLocked || !allowed(v, am.get(`module:${m.id}`));
      const items = ((les ?? []) as unknown as Lesson[])
        .filter((l) => l.module_id === m.id && (v.admin || l.status === 'published'))
        .map((l0) => {
          const l = loc(l0, lang, L_F);
          /* Το `is_free` ανοίγει ένα μάθημα μέσα σε κλειδωμένο ΠΑΚΕΤΟ — είναι
             το δείγμα. Δεν ανοίγει όμως κλειδωμένο ΕΠΙΠΕΔΟ: εκεί η σειρά της
             ύλης είναι ο λόγος, και ένα δείγμα θα την έσπαγε. */
          const locked = levelLocked ? true
            : l.is_free ? false
            : modLocked || !allowed(v, am.get(`lesson:${l.id}`));
          const out: LessonView = {
            id: l.id, module_id: l.module_id, course_id: l.course_id, slug: l.slug,
            title: l.title, summary: l.summary, duration_sec: l.duration_sec,
            sort: l.sort, status: l.status, is_free: l.is_free,
            locked, done: doneSet.has(l.id),
            gated: false, hasQuiz: false, quizPassed: false,
          };
          return out;
        });
      return { ...m, locked: modLocked, items };
    });

  const all = modules.flatMap((m) => m.items);

  /**
   * ==========================================================================
   * ΣΕΙΡΙΑΚΟ ΚΛΕΙΔΩΜΑ
   * ==========================================================================
   *
   * Ο ΚΑΝΟΝΑΣ: ένα μάθημα ανοίγει όταν έχει περαστεί το τεστ του αμέσως
   * προηγούμενου. Το πρώτο μάθημα είναι πάντα ανοιχτό — δεν υπάρχει
   * προηγούμενο.
   *
   * ΑΝ ΤΟ ΠΡΟΗΓΟΥΜΕΝΟ ΔΕΝ ΕΧΕΙ ΤΕΣΤ, ΔΕΝ ΜΠΛΟΚΑΡΕΙ. Όσο ανεβαίνει υλικό, θα
   * υπάρχουν μαθήματα που περιμένουν ακόμη τις ερωτήσεις τους. Ένα τέτοιο
   * μάθημα δεν επιτρέπεται να σταματήσει ολόκληρη τη σειρά: ο χρήστης θα
   * έβλεπε λουκέτο χωρίς τρόπο να το ανοίξει, και θα το ανέφερε ως βλάβη.
   *
   * ΜΟΛΙΣ ΤΟ ΚΛΕΙΔΩΜΑ ΠΙΑΣΕΙ, ΠΙΑΝΕΙ ΓΙΑ ΟΛΑ ΤΑ ΕΠΟΜΕΝΑ. Αν άνοιγε κάθε
   * μάθημα ανεξάρτητα, όποιος περνούσε το τεστ του 1 θα έβλεπε το 2 — αλλά και
   * όποιος κολλούσε στο 2 θα έφτανε στο 3 από τη λίστα στο πλάι.
   *
   * Ο ΔΙΑΧΕΙΡΙΣΤΗΣ ΔΕΝ ΜΠΛΟΚΑΡΕΤΑΙ ΠΟΤΕ: πρέπει να μπορεί να ελέγξει το
   * μάθημα 9 χωρίς να περάσει οκτώ τεστ.
   */
  if (!v.admin && all.length > 1) {
    const ids = all.map((l) => l.id);
    const [withQuiz, passed] = await Promise.all([
      lessonsWithQuiz(ids),
      passedLessons(v.tid, ids),
    ]);

    let blocker: LessonView | null = null;
    for (const l of all) {
      l.hasQuiz = withQuiz.has(l.id);
      l.quizPassed = passed.has(l.id);

      if (blocker) {
        l.gated = true;
        l.gatedBy = { slug: blocker.slug, title: blocker.title };
      } else if (l.hasQuiz && !l.quizPassed) {
        blocker = l;        // από το ΕΠΟΜΕΝΟ και κάτω, όλα κλειστά
      }
    }
  } else {
    const ids = all.map((l) => l.id);
    const [withQuiz, passed] = await Promise.all([
      lessonsWithQuiz(ids),
      passedLessons(v.tid, ids),
    ]);
    for (const l of all) { l.hasQuiz = withQuiz.has(l.id); l.quizPassed = passed.has(l.id); }
  }

  return {
    course,
    modules,
    total: all.length,
    done: all.filter((l) => l.done).length,
    locked: courseLocked,
    levelLocked,
  };
}

/** Ένα lesson. Το βίντεο και το κείμενο φεύγουν ΜΟΝΟ αν δικαιούται. */
export async function lessonBySlug(v: Viewer, courseSlug: string, lessonSlug: string) {
  const full = await courseBySlug(v, courseSlug);
  if (!full) return null;

  const flat = full.modules.flatMap((m) => m.items.map((l) => ({ ...l, moduleTitle: m.title })));
  const want = urlSlug(lessonSlug);
  const idx = flat.findIndex((l) => urlSlug(l.slug) === want);
  if (idx < 0) return null;

  const head = flat[idx];
  let body: string | null = null;
  let vimeo: string | null = null;
  let files: LessonFile[] = [];

  /* `gated` όπως και `locked`: αν δεν δικαιούται να το δει, το vimeo_id δεν
     φεύγει από τον server. Το κλείδωμα δεν είναι διακοσμητικό CSS. */
  if (!head.locked && !head.gated) {
    const { data: l } = await db().from('lessons')
      .select('body, body_en, vimeo_id, vimeo_id_en').eq('id', head.id).maybeSingle();
    /* Αγγλικά: αγγλικό κείμενο και αγγλικό βίντεο όπου υπάρχουν, αλλιώς το
       ελληνικό. Ένα μάθημα που δεν έχει ακόμη αγγλική εκδοχή δεν κλειδώνει. */
    const row = loc((l ?? {}) as { body: string | null; vimeo_id: string | null }, currentLang(), ['body', 'vimeo_id']);
    body = row.body ?? null;
    vimeo = row.vimeo_id ?? null;
    const { data: f } = await db().from('lesson_files')
      .select('*').eq('lesson_id', head.id).order('sort');
    files = (f ?? []) as unknown as LessonFile[];
  }

  return {
    course: full.course,
    module: full.modules.find((m) => m.id === head.module_id)!,
    lesson: { ...head, body, vimeo_id: vimeo },
    files,
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
    /**
     * ΟΛΟΚΛΗΡΗ Η ΔΙΑΔΡΟΜΗ ΤΟΥ ΜΑΘΗΜΑΤΟΣ, όχι μόνο η τρέχουσα ενότητα.
     *
     * Έδειχνε μόνο τα «αδέρφια» της ίδιας ενότητας. Όσο το μάθημα είχε μία
     * ενότητα, αυτό ήταν ολόκληρη η ύλη και κανείς δεν το πρόσεξε. Μόλις ο
     * «Μεσαίος» χωρίστηκε σε πέντε ενότητες, ο μαθητής στο μάθημα 1 έβλεπε
     * επτά τίτλους από τους δεκαπέντε και νόμιζε ότι λείπει υλικό.
     *
     * Η λίστα στο πλάι είναι ο χάρτης της διαδρομής. Ένας χάρτης που δείχνει
     * μόνο τον δρόμο όπου στέκεσαι δεν είναι χάρτης.
     */
    outline: full.modules,
  };
}

/** Σήμανση ολοκλήρωσης. Επιστρέφει τη νέα κατάσταση. */
export async function setDone(tid: number, lessonId: string, done: boolean) {
  /* Ο τύπος του upsert χωρίς generated types καταλήγει `never[]`· η ρητή
     δήλωση λέει στον μεταγλωττιστή τι στέλνουμε, χωρίς να χαλαρώσουμε
     τον έλεγχο αλλού. */
  const row: Record<string, unknown> = {
    telegram_id: tid,
    lesson_id: lessonId,
    completed_at: done ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  await db().from('lesson_progress').upsert(row, { onConflict: 'telegram_id,lesson_id' });
  return done;
}

export interface Note { id: string; title: string; body: string | null; published_at: string; pinned: boolean }

/**
 * Οι ανακοινώσεις της ομάδας.
 *
 * Από τον ΥΠΑΡΧΟΝΤΑ πίνακα του back office, όχι από δεύτερο δικό μας. Δύο
 * λίστες ανακοινώσεων σημαίνει ότι κάποια στιγμή η μία θα ξεχαστεί, και τα
 * μέλη θα διαβάζουν παλιά νέα χωρίς να το ξέρει κανείς.
 */
export async function announcements(limit = 5): Promise<Note[]> {
  const now = new Date().toISOString();
  const { data } = await db()
    .from('announcements')
    .select('id, title, body, published_at, pinned, ends_at')
    .not('published_at', 'is', null)
    .lte('published_at', now)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit * 2);

  return ((data ?? []) as Array<Note & { ends_at: string | null }>)
    .filter((n) => !n.ends_at || n.ends_at > now)   // οι ληγμένες δεν εμφανίζονται
    .slice(0, limit)
    .map(({ id, title, body, published_at, pinned }) => ({ id, title, body, published_at, pinned }));
}

/** Πού έμεινε: το τελευταίο μάθημα που άγγιξε και δεν ολοκλήρωσε. */
export async function resumePoint(v: Viewer) {
  const { data } = await db()
    .from('lesson_progress')
    .select('lesson_id, completed_at, updated_at')
    .eq('telegram_id', v.tid)
    .order('updated_at', { ascending: false })
    .limit(20);

  const rows = (data ?? []) as Array<{ lesson_id: string; completed_at: string | null }>;
  const open = rows.find((r) => !r.completed_at) ?? rows[0];
  if (!open) return null;

  const { data: l } = await db().from('lessons')
    .select('slug, title, title_en, course_id, courses(slug, title, title_en)').eq('id', open.lesson_id).maybeSingle();
  if (!l) return null;
  type T = { slug: string; title: string; title_en?: string | null };
  const lang = currentLang();
  const row0 = l as unknown as T & { courses: T | T[] };
  const row = loc(row0, lang, ['title']);
  const c0 = Array.isArray(row0.courses) ? row0.courses[0] : row0.courses;
  const c = c0 ? loc(c0, lang, ['title']) : c0;
  /* Η πρόοδος ΤΟΥ μαθήματος στο οποίο επιστρέφει: χωρίς αυτήν η κάρτα λέει
     «συνέχισε» χωρίς να δείχνει πόσο έχει μείνει. */
  const { data: sibs } = await db().from('lessons')
    .select('id').eq('course_id', (l as { course_id: string }).course_id).eq('status', 'published');
  const ids = ((sibs ?? []) as Array<{ id: string }>).map((x) => x.id);
  const doneCount = rows.filter((r) => r.completed_at && ids.includes(r.lesson_id)).length;

  return {
    lessonSlug: row.slug, lessonTitle: row.title,
    courseSlug: c?.slug, courseTitle: c?.title,
    done: doneCount, total: ids.length,
  };
}

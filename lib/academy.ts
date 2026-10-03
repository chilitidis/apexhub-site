import 'server-only';
import { db } from './db';

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

export interface Viewer { tid: number; admin: boolean; tiers: Set<string> }

/** Ποιος είναι ο θεατής: διαχειριστής; ποια πακέτα κρατάει; */
export async function viewerOf(tid: number): Promise<Viewer> {
  const s = db();
  const [{ data: adm }, { data: acc }] = await Promise.all([
    s.from('platform_admins').select('telegram_id').eq('telegram_id', tid).maybeSingle(),
    s.from('member_access').select('access_tiers(slug)').eq('telegram_id', tid),
  ]);

  const tiers = new Set<string>(['vip']);          // βλ. σχόλιο παραπάνω
  for (const row of (acc ?? []) as Array<{ access_tiers: { slug: string } | { slug: string }[] | null }>) {
    const t = Array.isArray(row.access_tiers) ? row.access_tiers[0] : row.access_tiers;
    if (t?.slug) tiers.add(t.slug);
  }
  return { tid, admin: Boolean(adm), tiers };
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
  locked: boolean;
  done: boolean;
  /** Μόνο αν ΔΕΝ είναι κλειδωμένο. Αλλιώς δεν φεύγει ποτέ από τον server. */
  vimeo_id?: string | null;
  body?: string | null;
}

export interface CourseView extends Course {
  lessons: number; done: number; locked: boolean; minutes: number;
}

/** Ο κατάλογος, με πρόοδο και κλειδώματα υπολογισμένα. */
export async function catalogue(v: Viewer): Promise<CourseView[]> {
  const s = db();
  const q = s.from('courses').select('*').order('sort');
  const { data: courses } = v.admin ? await q : await q.eq('status', 'published');

  const ids = (courses ?? []).map((c) => (c as Course).id);
  if (!ids.length) return [];

  const [{ data: lessons }, { data: prog }, am] = await Promise.all([
    s.from('lessons').select('id, course_id, module_id, is_free, duration_sec, status').in('course_id', ids),
    s.from('lesson_progress').select('lesson_id, completed_at').eq('telegram_id', v.tid),
    accessMap(),
  ]);

  const doneSet = new Set(
    ((prog ?? []) as Array<{ lesson_id: string; completed_at: string | null }>)
      .filter((p) => p.completed_at).map((p) => p.lesson_id),
  );

  return (courses ?? []).map((raw) => {
    const c = raw as unknown as Course;
    const ls = ((lessons ?? []) as Array<{ id: string; course_id: string; module_id: string; is_free: boolean; duration_sec: number | null; status: string }>)
      .filter((l) => l.course_id === c.id && (v.admin || l.status === 'published'));
    return {
      ...c,
      lessons: ls.length,
      done: ls.filter((l) => doneSet.has(l.id)).length,
      minutes: Math.round(ls.reduce((a, l) => a + (l.duration_sec ?? 0), 0) / 60),
      locked: !allowed(v, am.get(`course:${c.id}`)),
    };
  });
}

/** Ένα μάθημα με τις ενότητες και τα lessons του, κλειδώματα υπολογισμένα. */
export async function courseBySlug(v: Viewer, slug: string) {
  const s = db();
  const { data: c } = await s.from('courses').select('*').eq('slug', slug).maybeSingle();
  if (!c) return null;
  const course = c as unknown as Course;
  if (course.status !== 'published' && !v.admin) return null;

  const [{ data: mods }, { data: les }, { data: prog }, am] = await Promise.all([
    s.from('modules').select('*').eq('course_id', course.id).order('sort'),
    s.from('lessons').select('*').eq('course_id', course.id).order('sort'),
    s.from('lesson_progress').select('lesson_id, completed_at').eq('telegram_id', v.tid),
    accessMap(),
  ]);

  const doneSet = new Set(
    ((prog ?? []) as Array<{ lesson_id: string; completed_at: string | null }>)
      .filter((p) => p.completed_at).map((p) => p.lesson_id),
  );

  const courseLocked = !allowed(v, am.get(`course:${course.id}`));

  const modules = ((mods ?? []) as unknown as Module[])
    .filter((m) => v.admin || m.status === 'published')
    .map((m) => {
      const modLocked = courseLocked || !allowed(v, am.get(`module:${m.id}`));
      const items = ((les ?? []) as unknown as Lesson[])
        .filter((l) => l.module_id === m.id && (v.admin || l.status === 'published'))
        .map((l) => {
          const locked = l.is_free ? false
            : modLocked || !allowed(v, am.get(`lesson:${l.id}`));
          const out: LessonView = {
            id: l.id, module_id: l.module_id, course_id: l.course_id, slug: l.slug,
            title: l.title, summary: l.summary, duration_sec: l.duration_sec,
            sort: l.sort, status: l.status, is_free: l.is_free,
            locked, done: doneSet.has(l.id),
          };
          return out;
        });
      return { ...m, locked: modLocked, items };
    });

  const all = modules.flatMap((m) => m.items);
  return {
    course,
    modules,
    total: all.length,
    done: all.filter((l) => l.done).length,
    locked: courseLocked,
  };
}

/** Ένα lesson. Το βίντεο και το κείμενο φεύγουν ΜΟΝΟ αν δικαιούται. */
export async function lessonBySlug(v: Viewer, courseSlug: string, lessonSlug: string) {
  const full = await courseBySlug(v, courseSlug);
  if (!full) return null;

  const flat = full.modules.flatMap((m) => m.items.map((l) => ({ ...l, moduleTitle: m.title })));
  const idx = flat.findIndex((l) => l.slug === lessonSlug);
  if (idx < 0) return null;

  const head = flat[idx];
  let body: string | null = null;
  let vimeo: string | null = null;
  let files: LessonFile[] = [];

  if (!head.locked) {
    const { data: l } = await db().from('lessons')
      .select('body, vimeo_id').eq('id', head.id).maybeSingle();
    body = (l as { body: string | null } | null)?.body ?? null;
    vimeo = (l as { vimeo_id: string | null } | null)?.vimeo_id ?? null;
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
    siblings: full.modules.find((m) => m.id === head.module_id)!.items,
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
    .select('slug, title, course_id, courses(slug, title)').eq('id', open.lesson_id).maybeSingle();
  if (!l) return null;
  const row = l as unknown as { slug: string; title: string; courses: { slug: string; title: string } | { slug: string; title: string }[] };
  const c = Array.isArray(row.courses) ? row.courses[0] : row.courses;
  return { lessonSlug: row.slug, lessonTitle: row.title, courseSlug: c?.slug, courseTitle: c?.title };
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin, slugify, vimeoId, upload } from '@/lib/admin';

/* Κάθε action ξεκινά με requireAdmin(). Αν λείψει από μία, λείπει η
   κλειδαριά από μία πόρτα — και δεν φαίνεται πουθενά στο UI. */

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const num = (f: FormData, k: string) => Number(f.get(k) ?? 0) || 0;

/* ── μαθήματα ─────────────────────────────────────────────────────────── */

export async function createCourse(f: FormData) {
  await requireAdmin();
  const title = str(f, 'title') || 'Χωρίς τίτλο';
  const { data, error } = await db().from('courses').insert({
    title, slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 5)}`,
    status: 'draft', sort: 999,
  }).select('id').single();
  if (error) throw new Error(error.message);
  revalidatePath('/app/admin');
  redirect(`/app/admin/${(data as { id: string }).id}`);
}

export async function saveCourse(f: FormData) {
  await requireAdmin();
  const id = str(f, 'id');
  const cover = f.get('cover') as File | null;

  const patch: Record<string, unknown> = {
    title: str(f, 'title'),
    subtitle: str(f, 'subtitle') || null,
    description: str(f, 'description') || null,
    level: str(f, 'level') || 'beginner',
    category: str(f, 'category') || null,
    status: str(f, 'status') === 'published' ? 'published' : 'draft',
    updated_at: new Date().toISOString(),
  };
  if (str(f, 'slug')) patch.slug = slugify(str(f, 'slug'));
  if (cover && cover.size > 0) patch.cover_url = await upload(cover, 'covers');

  const { error } = await db().from('courses').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/app/admin');
  revalidatePath(`/app/admin/${id}`);
}

export async function deleteCourse(f: FormData) {
  await requireAdmin();
  const id = str(f, 'id');
  /* Τα modules και τα lessons φεύγουν μαζί του μέσω ON DELETE CASCADE —
     δηλωμένο στη βάση, όχι διορθωμένο εδώ με τρία ξεχωριστά delete. */
  await db().from('courses').delete().eq('id', id);
  revalidatePath('/app/admin');
  redirect('/app/admin');
}

/* ── ενότητες ─────────────────────────────────────────────────────────── */

export async function createModule(f: FormData) {
  await requireAdmin();
  const course_id = str(f, 'course_id');
  const { data: last } = await db().from('modules')
    .select('sort').eq('course_id', course_id).order('sort', { ascending: false }).limit(1);
  const sort = ((last?.[0] as { sort: number } | undefined)?.sort ?? 0) + 1;
  await db().from('modules').insert({
    course_id, title: str(f, 'title') || 'Νέα ενότητα', sort,
  });
  revalidatePath(`/app/admin/${course_id}`);
}

export async function saveModule(f: FormData) {
  await requireAdmin();
  await db().from('modules').update({
    title: str(f, 'title'),
    summary: str(f, 'summary') || null,
    status: str(f, 'status') === 'draft' ? 'draft' : 'published',
  }).eq('id', str(f, 'id'));
  revalidatePath(`/app/admin/${str(f, 'course_id')}`);
}

export async function deleteModule(f: FormData) {
  await requireAdmin();
  await db().from('modules').delete().eq('id', str(f, 'id'));
  revalidatePath(`/app/admin/${str(f, 'course_id')}`);
}

/* ── μαθήματα (lessons) ───────────────────────────────────────────────── */

export async function createLesson(f: FormData) {
  await requireAdmin();
  const module_id = str(f, 'module_id');
  const course_id = str(f, 'course_id');
  const title = str(f, 'title') || 'Νέο μάθημα';
  const { data: last } = await db().from('lessons')
    .select('sort').eq('module_id', module_id).order('sort', { ascending: false }).limit(1);
  const sort = ((last?.[0] as { sort: number } | undefined)?.sort ?? 0) + 1;
  await db().from('lessons').insert({
    module_id, course_id, title,
    slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 5)}`,
    sort, status: 'draft',
  });
  revalidatePath(`/app/admin/${course_id}`);
}

export async function saveLesson(f: FormData) {
  await requireAdmin();
  const id = str(f, 'id');
  const course_id = str(f, 'course_id');
  const raw = str(f, 'vimeo');

  const patch: Record<string, unknown> = {
    title: str(f, 'title'),
    summary: str(f, 'summary') || null,
    body: str(f, 'body') || null,
    duration_sec: num(f, 'minutes') * 60 || null,
    status: str(f, 'status') === 'published' ? 'published' : 'draft',
    is_free: f.get('is_free') === 'on',
    updated_at: new Date().toISOString(),
  };
  if (str(f, 'slug')) patch.slug = slugify(str(f, 'slug'));
  /* Κενό πεδίο σημαίνει «βγάλε το βίντεο», όχι «άσε ό,τι είχε». */
  patch.vimeo_id = raw ? vimeoId(raw) : null;

  const { error } = await db().from('lessons').update(patch).eq('id', id);
  if (error) throw new Error(error.message);

  const file = f.get('file') as File | null;
  if (file && file.size > 0) {
    const url = await upload(file, `files/${id}`);
    await db().from('lesson_files').insert({ lesson_id: id, name: file.name, url, size_bytes: file.size });
  }

  revalidatePath(`/app/admin/${course_id}`);
}

export async function deleteLesson(f: FormData) {
  await requireAdmin();
  await db().from('lessons').delete().eq('id', str(f, 'id'));
  revalidatePath(`/app/admin/${str(f, 'course_id')}`);
}

export async function deleteFile(f: FormData) {
  await requireAdmin();
  await db().from('lesson_files').delete().eq('id', str(f, 'id'));
  revalidatePath(`/app/admin/${str(f, 'course_id')}`);
}

/* ── σειρά ────────────────────────────────────────────────────────────── */

export async function reorder(table: 'modules' | 'lessons', ids: string[], courseId: string) {
  await requireAdmin();
  /* Το όνομα του πίνακα είναι ένα από δύο σταθερά, ποτέ κείμενο από τον
     χρήστη. Αλλιώς θα ήταν ανοιχτή πόρτα προς κάθε πίνακα της βάσης. */
  const t = table === 'modules' ? 'modules' : 'lessons';
  await Promise.all(ids.map((id, i) => db().from(t).update({ sort: i + 1 }).eq('id', id)));
  revalidatePath(`/app/admin/${courseId}`);
}

/* ── πακέτα πρόσβασης ─────────────────────────────────────────────────── */

export async function createTier(f: FormData) {
  await requireAdmin();
  const name = str(f, 'name') || 'Νέο πακέτο';
  await db().from('access_tiers').insert({
    name, slug: slugify(str(f, 'slug') || name), rank: num(f, 'rank'),
  });
  revalidatePath('/app/admin/tiers');
}

export async function deleteTier(f: FormData) {
  await requireAdmin();
  await db().from('access_tiers').delete().eq('id', str(f, 'id'));
  revalidatePath('/app/admin/tiers');
}

/** Ποια πακέτα ξεκλειδώνουν ένα συγκεκριμένο στοιχείο. */
export async function setAccess(f: FormData) {
  await requireAdmin();
  const scope = str(f, 'scope') as 'course' | 'module' | 'lesson';
  if (!['course', 'module', 'lesson'].includes(scope)) throw new Error('Άγνωστο scope.');
  const target_id = str(f, 'target_id');
  const tiers = f.getAll('tier').map(String).filter(Boolean);

  await db().from('content_access').delete().eq('scope', scope).eq('target_id', target_id);
  if (tiers.length) {
    await db().from('content_access')
      .insert(tiers.map((tier_id) => ({ scope, target_id, tier_id })));
  }
  revalidatePath(`/app/admin/${str(f, 'course_id')}`);
}

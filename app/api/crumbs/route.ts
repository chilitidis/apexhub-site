import { NextRequest, NextResponse } from 'next/server';
import { currentSession } from '@/lib/session';
import { db } from '@/lib/db';
import { currentLang } from '@/lib/lang';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Τίτλοι για το breadcrumb.
 *
 * ΓΙΑΤΙ ΞΕΧΩΡΙΣΤΗ ΚΛΗΣΗ: το breadcrumb χτίζεται στον browser από τη διαδρομή,
 * και η διαδρομή κουβαλάει slug («vaseis»), όχι τίτλο («Βάσεις»). Η εναλλακτική
 * ήταν να φορτώνει το layout ΟΛΟΥΣ τους τίτλους σε κάθε σελίδα — σπατάλη που
 * μεγαλώνει με κάθε μάθημα που προσθέτεις.
 */
export async function GET(req: NextRequest) {
  if (!currentSession()) return NextResponse.json({}, { status: 401 });

  const u = new URL(req.url);
  const course = u.searchParams.get('course');
  const lesson = u.searchParams.get('lesson');
  const out: Record<string, string> = {};
  const en = currentLang() === 'en';
  const pick = (r: { title: string; title_en?: string | null }) => (en && r.title_en) || r.title;

  if (course) {
    const { data: c } = await db().from('courses')
      .select('id, title, title_en').eq('slug', course).maybeSingle();
    if (c) {
      const row = c as { id: string; title: string; title_en: string | null };
      out[course] = pick(row);
      if (lesson) {
        const { data: l } = await db().from('lessons')
          .select('title, title_en').eq('course_id', row.id).eq('slug', lesson).maybeSingle();
        if (l) out[lesson] = pick(l as { title: string; title_en: string | null });
      }
    }
  }
  return NextResponse.json(out);
}

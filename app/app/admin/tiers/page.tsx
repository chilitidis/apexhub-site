import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { createTier, deleteTier } from '../actions';

export const dynamic = 'force-dynamic';

export default async function TiersPage() {
  await requireAdmin();
  const { data } = await db().from('access_tiers').select('*').order('rank');
  const tiers = (data ?? []) as Array<{ id: string; slug: string; name: string; rank: number }>;

  return (
    <>
      <h1 className="h1">Πακέτα πρόσβασης</h1>
      <p className="sub">
        Η λίστα είναι δική σου. Σε κάθε μάθημα, ενότητα ή lesson επιλέγεις ποια
        πακέτα το ξεκλειδώνουν.
      </p>

      <form action={createTier} className="adm-new" style={{ marginTop: 20 }}>
        <input name="name" placeholder="Όνομα πακέτου" required aria-label="Όνομα" />
        <input name="rank" type="number" placeholder="Σειρά" style={{ width: 90 }} aria-label="Σειρά" />
        <button className="btn btn-solid btn-sm" type="submit">Προσθήκη</button>
      </form>

      <ul className="adm-list" style={{ marginTop: 16 }}>
        {tiers.map((t) => (
          <li key={t.id}>
            <span className="adm-row">
              <span className="adm-t"><b>{t.name}</b><em>{t.slug} · σειρά {t.rank}</em></span>
              {t.slug === 'vip' ? (
                <span className="meta">Το κρατούν όλα τα μέλη</span>
              ) : (
                <form action={deleteTier}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="danger" type="submit">Διαγραφή</button>
                </form>
              )}
            </span>
          </li>
        ))}
      </ul>

      <p className="meta" style={{ marginTop: 18, maxWidth: '62ch', lineHeight: 1.65 }}>
        Το «vip» το κρατάει αυτόματα κάθε μέλος που περνάει την πύλη του Telegram
        — η είσοδος απαιτεί συμμετοχή στο VIP group, οπότε μια δεύτερη λίστα με
        τα ίδια άτομα θα ξεσυγχρονιζόταν. Τα υπόλοιπα πακέτα δίνονται χειροκίνητα.
      </p>
    </>
  );
}

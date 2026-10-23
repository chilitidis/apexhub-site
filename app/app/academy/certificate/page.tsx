import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/session';
import { viewerOf } from '@/lib/academy';
import { certificate } from '@/lib/quiz';
import PrintButton from '@/components/PrintButton';
import { ILock } from '@/components/Icons';

export const dynamic = 'force-dynamic';

/**
 * Το πιστοποιητικό ολοκλήρωσης.
 *
 * ΔΕΝ ΕΙΝΑΙ ΑΝΑΓΝΩΡΙΣΜΕΝΟΣ ΤΙΤΛΟΣ ΣΠΟΥΔΩΝ, ΚΑΙ ΤΟ ΛΕΕΙ ΤΟ ΙΔΙΟ. Η ApexHub
 * δεν είναι εκπαιδευτικό ίδρυμα· το χαρτί βεβαιώνει ότι κάποιος πέρασε από
 * όλη την ύλη και απάντησε σωστά στο ολικό τεστ, τίποτα παραπάνω. Μια τέτοια
 * γραμμή πάνω στο ίδιο το χαρτί κοστίζει μηδέν και γλιτώνει παρεξηγήσεις.
 *
 * ΦΤΙΑΧΝΕΤΑΙ ΤΗ ΣΤΙΓΜΗ ΠΟΥ ΤΟ ΖΗΤΑΣ, ΑΠΟ ΤΗ ΒΑΣΗ. Δεν αποθηκεύεται αρχείο
 * πουθενά: η μόνη πηγή είναι η περασμένη προσπάθεια στο ολικό τεστ. Αν δεν
 * υπάρχει, δεν υπάρχει και πιστοποιητικό — ούτε με απευθείας διεύθυνση.
 */
export default async function CertificatePage() {
  const s = currentSession();
  if (!s) redirect('/login');
  const v = await viewerOf(s.tid);
  const cert = await certificate(s.tid);

  if (!cert) {
    return (
      <>
        <header className="hero">
          <span className="eyebrow">Πιστοποιητικο</span>
          <h1 className="h1" style={{ marginTop: 14 }}>Δεν έχει εκδοθεί ακόμη</h1>
        </header>
        <div className="gate2" style={{ marginTop: 30 }}>
          <span className="gate2-ic"><ILock /></span>
          <b>Το πιστοποιητικό βγαίνει με το ολικό τεστ.</b>
          <p>
            Ανοίγει όταν περάσεις και τα πέντε τελικά τεστ: Αρχάριος, Μεσαίος,
            Προχωρημένος, Ψυχολογία και Νοοτροπία.
          </p>
          <Link className="gold-btn" href="/app/academy">Πίσω στην Ακαδημία</Link>
        </div>
      </>
    );
  }

  const date = new Date(cert.at).toLocaleDateString('el-GR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <header className="hero noprint">
        <span className="eyebrow">Πιστοποιητικο</span>
        <h1 className="h1" style={{ marginTop: 14 }}>Το ολοκλήρωσες</h1>
        <p className="sub">
          Πέρασες το ολικό τεστ με {cert.score} σωστές από {cert.total}. Το χαρτί
          είναι από κάτω — τύπωσέ το ή κράτα το PDF.
        </p>
      </header>

      <div className="cert">
        <div className="cert-in">
          <span className="cert-mark">ApexHub</span>
          <span className="cert-kind">Πιστοποιητικό ολοκλήρωσης</span>

          <b className="cert-name">{s.name}</b>

          <p className="cert-body">
            ολοκλήρωσε το σύνολο της ύλης της <b>ApexHub Academy</b> — ενενήντα
            οκτώ μαθήματα σε τρία επίπεδα, μαζί με την Ψυχολογία και τη Νοοτροπία
            του trader — και απάντησε σωστά σε {cert.score} από τις {cert.total}
            {' '}ερωτήσεις του ολικού τεστ.
          </p>

          <div className="cert-foot">
            <span><em>Ποσοστό</em><b className="num">{cert.pct}%</b></span>
            <span><em>Ημερομηνία</em><b>{date}</b></span>
          </div>

          <p className="cert-fine">
            Αναμνηστικό ολοκλήρωσης της ApexHub Academy. Δεν αποτελεί
            αναγνωρισμένο τίτλο σπουδών ούτε πιστοποίηση επαγγελματικής επάρκειας.
          </p>
        </div>
      </div>

      <div className="cert-acts noprint">
        <PrintButton />
        <Link className="btn btn-line" href="/app/academy">Πίσω στην Ακαδημία</Link>
      </div>

      {v.admin && (
        <p className="meta noprint" style={{ marginTop: 18 }}>
          Το βλέπεις ως διαχειριστής· το περιεχόμενο είναι η δική σου περασμένη
          προσπάθεια.
        </p>
      )}
    </>
  );
}

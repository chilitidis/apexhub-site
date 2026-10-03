import dynamic from 'next/dynamic';
import Chrome from '@/components/Chrome';

/* Η σκηνή φορτώνει μόνο στον browser. Το `ssr: false` δεν είναι προαίρεση:
   το three.js αγγίζει document κατά την αρχικοποίηση, και ένα μισό MB
   γραφικών δεν έχει δουλειά στο server render μιας σελίδας που πρέπει να
   δείξει κείμενο αμέσως. */
const Peak = dynamic(() => import('@/components/Peak'), { ssr: false });

export default function Home() {
  return (
    <>
      <Peak />
      <Chrome />
      <header className="bar">
        <div className="wrap bar-in">
          <a className="mark" href="#top" aria-label="ApexHub — Trading Community">
            <svg viewBox="0 0 104 100" aria-hidden>
              <defs>
                <linearGradient id="gla" x1=".1" y1="0" x2=".9" y2="1">
                  <stop offset="0" stopColor="#FBEFC6"/><stop offset=".55" stopColor="#EBC862"/>
                  <stop offset="1" stopColor="#C9A043"/>
                </linearGradient>
                <linearGradient id="gda" x1=".1" y1="0" x2="1" y2=".9">
                  <stop offset="0" stopColor="#B98F32"/><stop offset=".6" stopColor="#8F6D22"/>
                  <stop offset="1" stopColor="#6E5319"/>
                </linearGradient>
              </defs>
              {/* δεξιά όψη, στο φως */}
              <path fill="url(#gla)" d="M52 3 100 97H76L52 45Z"/>
              {/* αριστερή όψη, στη σκιά */}
              <path fill="url(#gda)" d="M52 3 52 45 28 97H4Z"/>
              {/* η εγκοπή: η οριζόντια του A, ανοιχτή στην κορυφή */}
              <path fill="url(#gla)" d="M38 68h28l7 14H31Z" opacity=".92"/>
            </svg>
            <span className="lock">
              <span className="wm">Apex<i>Hub</i></span>
              <span className="tc">Trading Community</span>
            </span>
          </a>
          <nav>
            <a href="#who">Ποιοι είμαστε</a>
            <a href="#pillars">Οι πυλώνες</a>
            <a href="#voices">Μέλη</a>
            <a href="#offer">Τι προσφέρουμε</a>
          </nav>
          <a className="btn btn-line btn-sm" href="https://apexhub.gr/login">Σύνδεση</a>
        </div>
      </header>

      <main id="top">

        <div className="stage" id="stage">
        <div className="wrap hero">
          <div className="lbl kicker rise">
            <span>TRADING</span><span className="dot"></span>
            <span>ΚΟΙΝΟΤΗΤΑ</span><span className="dot"></span>
            <span>ΕΚΠΑΙΔΕΥΣΗ</span>
          </div>
          <h1><span className="w">Χτίζουμε</span><br /><span className="w"><b>ανθρώπους</b></span><br /><span className="w">με</span> <span className="w"><em>αξία.</em></span></h1>
          <p className="lede rise">
            Ένα πρότυπο. Μια κοινότητα. Το APEXHUB είναι μια ελληνική κοινότητα
            traders που μαθαίνουν μαζί, δουλεύουν με πειθαρχία και μοιράζονται ό,τι
            ξέρουν — στο Telegram, κάθε μέρα.
          </p>
          <div className="ctas rise">
            <a className="btn btn-solid" href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">Μπες στο κανάλι μας</a>
            <a className="btn btn-line" href="#pillars">Τι θα βρεις μέσα</a>
          </div>
          <p className="note rise">Ανοιχτό σε όλους. Χωρίς κάρτα, χωρίς δέσμευση.</p>
        </div>
        </div>

        <div className="wrap">
          <div className="values">
            <div>Πειθαρχία</div><div>Ακεραιότητα</div><div>Σεβασμός</div><div>Εξέλιξη</div>
          </div>
        </div>

        {/* ΠΟΙΟΙ ΕΙΜΑΣΤΕ */}
        <section id="who">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">01</span><span className="lbl">Ποιοι είμαστε</span></div>
              <div>
                <h2>Μια ομάδα με ονόματα, όχι ένα λογότυπο.</h2>
                <p className="sub">
                  Οι περισσότερες κοινότητες trading κρύβονται πίσω από ψευδώνυμα και
                  screenshot κερδών. Εμείς βάζουμε τα ονόματά μας στην πόρτα.
                </p>
              </div>
            </div>

            <div className="who">
              <div className="body" data-rev>
                <p>
                  Το APEXHUB δεν φτιάχτηκε για να πουλήσει ένα μάθημα και να φύγει.
                  Φτιάχτηκε για να υπάρχει κάπου που κάποιος μπορεί να ρωτήσει
                  <strong>«γιατί μπήκες εκεί;»</strong> και να πάρει πραγματική
                  απάντηση από τον άνθρωπο που μπήκε.
                </p>
                <p>
                  Λειτουργούμε μέσα από το Telegram, γιατί εκεί είναι ήδη ο κόσμος και
                  εκεί γίνεται η συζήτηση την ώρα που μετράει. Γύρω από αυτό χτίζουμε
                  την πλατφόρμα μελών: αρχείο, εργαλεία και την ακαδημία.
                </p>
                <p>
                  Στόχος μας δεν είναι το επόμενο σήμα. Είναι η <strong>εκπαίδευση, η
                  πειθαρχία και η σωστή διαχείριση ρίσκου</strong> — τα μόνα τρία
                  πράγματα που κρατάνε κάποιον στις αγορές περισσότερο από έναν χρόνο.
                </p>
              </div>

              <div className="roster" data-rev>
                <div className="row"><span className="nm">Φώτης Χιλιτίδης</span><span className="rl">CEO</span></div>
                <div className="row"><span className="nm">Ιωάννης Χιλιτίδης</span><span className="rl">CTO</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ΟΙ ΠΥΛΩΝΕΣ */}
        <section id="pillars">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">02</span><span className="lbl">Οι πυλώνες</span></div>
              <div>
                <h2>Τρεις πυλώνες. Ένα οικοσύστημα.</h2>
                <p className="sub">
                  Trading χωρίς εκπαίδευση είναι αντιγραφή. Εκπαίδευση χωρίς κοινότητα
                  είναι ένα PDF που δεν άνοιξες ποτέ. Κοινότητα χωρίς τα άλλα δύο είναι
                  απλώς παρέα. Το ένα κρατάει το άλλο όρθιο.
                </p>
              </div>
            </div>

            <div className="pillars">

              <article className="pillar" data-rev id="p1">
                <div className="no">Ι</div>
                <div>
                  <h3>Trading</h3>
                  <p className="kick">Η δουλειά της ημέρας — εκπαιδευτικό υλικό, live sessions και trading ideas.</p>
                </div>
                <ul>
                  <li><span className="d"></span><div><b>Trading ideas με σκεπτικό</b><span>Γιατί τώρα, πού είναι το ρίσκο, τι ακυρώνει την ιδέα.</span></div></li>
                  <li><span className="d"></span><div><b>Live sessions</b><span>Βλέπεις τη διαδικασία την ώρα που γίνεται, όχι μόνο το αποτέλεσμα.</span></div></li>
                  <li><span className="d"></span><div><b>Διαχείριση πριν από στόχο</b><span>Το μέγεθος θέσης και το stop έρχονται πρώτα.</span></div></li>
                </ul>
              </article>

              <article className="pillar" data-rev id="p2">
                <div className="no">ΙΙ</div>
                <div>
                  <h3>Κοινότητα</h3>
                  <p className="kick">Στήριξη και εξέλιξη. Άνθρωποι που κάνουν το ίδιο πράγμα, στον ίδιο χρόνο.</p>
                </div>
                <ul>
                  <li><span className="d"></span><div><b>Ενεργή κοινότητα στο Telegram</b><span>Η συζήτηση γίνεται εκεί που είσαι ήδη.</span></div></li>
                  <li><span className="d"></span><div><b>Λύσεις σε κάθε απορία</b><span>Ρωτάς και σου απαντά ο ίδιος που άνοιξε την κίνηση — όχι φόρμα υποστήριξης.</span></div></li>
                  <li><span className="d"></span><div><b>Συνέπεια και καθοδήγηση</b><span>Το κομμάτι που ρίχνει τους περισσότερους δεν είναι η ανάλυση. Είναι η απομόνωση.</span></div></li>
                </ul>
              </article>

              <article className="pillar" data-rev id="p3">
                <div className="no">ΙΙΙ</div>
                <div>
                  <h3>Εκπαίδευση</h3>
                  <p className="kick">Από το μηδέν μέχρι να έχεις δική σου μέθοδο — με σειρά, όχι με σκόρπια βίντεο.</p>
                </div>
                <ul>
                  <li><span className="d"></span><div><b>Δομημένη διαδρομή</b><span>Βάσεις, δομή αγοράς, ρίσκο, ψυχολογία. Κάθε ενότητα πατάει στην προηγούμενη.</span></div></li>
                  <li><span className="d"></span><div><b>Το δικό σου ημερολόγιο</b><span>Καταγράφεις τις κινήσεις σου και βλέπεις τα δικά σου μοτίβα.</span></div></li>
                  <li><span className="d"></span><div><b>Εφαρμογή, όχι θεωρία</b><span>Ό,τι μαθαίνεις το βλέπεις να εφαρμόζεται ζωντανά την επόμενη μέρα.</span></div></li>
                </ul>
              </article>

            </div>
          </div>
        </section>

        {/* ΔΥΟ ΔΡΟΜΟΙ */}
        <section id="paths">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">03</span><span className="lbl">Εκτέλεση</span></div>
              <div>
                <h2>Δύο δρόμοι. Διάλεξε αυτόν που σου ταιριάζει.</h2>
                <p className="sub">
                  Η εκπαίδευση είναι η ίδια. Αυτό που αλλάζει είναι με ποιανού το
                  κεφάλαιο δουλεύεις.
                </p>
              </div>
            </div>

            <div className="paths">
              <div className="path" data-rev>
                <div className="tp">Δρόμος Α</div>
                <h4>Funded account</h4>
                <ul>
                  <li><span className="d"></span><span>Δουλεύεις με κεφάλαιο που σου παρέχεται μέσω funded account.</span></li>
                  <li><span className="d"></span><span>Κρατάς ποσοστό από τα κέρδη, σύμφωνα με τους όρους του provider.</span></li>
                  <li><span className="d"></span><span>Δυνατότητα κλιμάκωσης κεφαλαίου με βάση την απόδοσή σου.</span></li>
                </ul>
              </div>
              <div className="seam" aria-hidden></div>
              <div className="path" data-rev>
                <div className="tp">Δρόμος Β</div>
                <h4>Real account</h4>
                <ul>
                  <li><span className="d"></span><span>Δουλεύεις με δικό σου κεφάλαιο.</span></li>
                  <li><span className="d"></span><span>Τα κέρδη και οι ζημιές αφορούν αποκλειστικά τον δικό σου λογαριασμό.</span></li>
                  <li><span className="d"></span><span>Πλήρης έλεγχος στις συναλλαγές και στη στρατηγική σου.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ΤΙ ΛΕΕΙ Η ΚΟΙΝΟΤΗΤΑ */}
        <section id="voices">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">04</span><span className="lbl">Μέλη</span></div>
              <div>
                <h2>Τι λέει η κοινότητα.</h2>
                <p className="sub">
                  Πραγματικοί άνθρωποι, με τα ονόματά τους. Τα λόγια είναι δικά τους,
                  όπως γράφτηκαν στο Telegram.
                </p>
              </div>
            </div>

            <div className="voices">
              <figure className="voice" data-rev>
                <blockquote>
                  Δεν έχω πολύ χρόνο γιατί είμαι φαντάρος, αλλά το community με στηρίζει
                  και με βοηθάει πολύ. Μου λύνει απορίες όποτε χρειάζεται και με κρατάει
                  συνεπή στο ταξίδι μου.
                </blockquote>
                <figcaption>
                  <span className="av">Ν</span>
                  <span className="who2">Νίκος</span>
                  <span className="meta">Μέλος</span>
                </figcaption>
              </figure>

              <figure className="voice" data-rev>
                <blockquote>
                  Ξεκίνησε χωρίς προηγούμενη εμπειρία και χρειάστηκε 10–15 ημέρες για να
                  κατανοήσει τη διαδικασία. Με το εκπαιδευτικό υλικό και τα live sessions
                  έμαθε να διαβάζει καλύτερα τα charts και απέκτησε αυτοπεποίθηση στις
                  δικές του αποφάσεις.
                </blockquote>
                <figcaption>
                  <span className="av">ΧΑ</span>
                  <span className="who2">Χρήστος Αλατζάς</span>
                  <span className="meta">Μέλος</span>
                </figcaption>
              </figure>

              <figure className="voice" data-rev>
                <blockquote>
                  Ξεκίνησε με επιφυλάξεις, χωρίς προηγούμενη επαφή με τον χώρο. Με τον
                  χρόνο κατανόησε τη διαδικασία και, παρά τον περιορισμένο χρόνο του,
                  κατάφερε να γίνει κερδοφόρος στις αγορές.
                </blockquote>
                <figcaption>
                  <span className="av">ΧΜ</span>
                  <span className="who2">Χρήστος Μάνος</span>
                  <span className="meta">Μέλος</span>
                </figcaption>
              </figure>

              <figure className="voice" data-rev>
                <blockquote>
                  Ξεκίνησε με επιφυλάξεις, χωρίς προηγούμενη επαφή με τον χώρο του
                  trading. Με την εκπαίδευση και την καθοδήγηση κατάφερε να κατανοήσει
                  τη διαδικασία. Σήμερα συνεχίζει με κίνητρο, συνέπεια και σωστή
                  οργάνωση.
                </blockquote>
                <figcaption>
                  <span className="av">ΧΚ</span>
                  <span className="who2">Χρήστος Κυπαρίσσης</span>
                  <span className="meta">Μέλος</span>
                </figcaption>
              </figure>
            </div>

            <p className="swipe">Σύρε για περισσότερα →</p>

            <p className="disclaim">
              Ατομικά αποτελέσματα μελών. Δεν αποτελούν εγγύηση ούτε ένδειξη
              μελλοντικών αποτελεσμάτων. Τα περισσότερα άτομα που ασχολούνται με το
              trading δεν είναι κερδοφόρα.
            </p>
          </div>
        </section>

        {/* ΤΙ ΠΡΟΣΦΕΡΟΥΜΕ */}
        <section id="offer">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">05</span><span className="lbl">Τι προσφέρουμε</span></div>
              <div>
                <h2>Τι παίρνεις στα χέρια σου.</h2>
                <p className="sub">
                  Το κανάλι είναι ανοιχτό σε όλους. Τα υπόλοιπα ζουν μέσα στην
                  κοινότητα των μελών.
                </p>
              </div>
            </div>

            <div className="offer">
              <div className="item" data-rev>
                <div className="tp">Ανοιχτό</div>
                <h4>Κανάλι Telegram</h4>
                <p>Αναλύσεις, κομμάτια από τη δουλειά της ημέρας και ανακοινώσεις.</p>
              </div>
              <div className="item wide" data-rev>
                <div className="tp">Μέλη</div>
                <h4>VIP κοινότητα</h4>
                <p>Το κυρίως δωμάτιο. Trading ideas, live sessions και άμεση πρόσβαση στην ομάδα.</p>
              </div>
              <div className="item" data-rev>
                <div className="tp">Μέλη</div>
                <h4>Εκπαιδευτικό υλικό</h4>
                <p>Δομημένη ύλη από τις βάσεις μέχρι τη διαχείριση ρίσκου και την ψυχολογία.</p>
              </div>
              <div className="item" data-rev>
                <div className="tp">Μέλη</div>
                <h4>Πλατφόρμα μελών</h4>
                <p>Το αρχείο, τα εργαλεία και η πρόοδός σου, στο apexhub.gr.</p>
              </div>
              <div className="item wide" data-rev>
                <div className="tp">Μέλη</div>
                <h4>Ultimate Trading Journal</h4>
                <p>Το ημερολόγιό σου. Καταγράφεις κάθε κίνηση και βλέπεις τα δικά σου μοτίβα.</p>
              </div>
              <div className="item soon">
                <div className="tp">Έρχεται</div>
                <h4>Ακαδημία</h4>
                <p>Δομημένα μαθήματα με σειρά και πρόοδο, μέσα στην πλατφόρμα.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ΠΡΟΣΒΑΣΗ */}
        <section id="access">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">06</span><span className="lbl">Πρόσβαση</span></div>
              <div>
                <h2>Ξεκίνα από εκεί που δεν κοστίζει τίποτα.</h2>
                <p className="sub">
                  Δεν χρειάζεται να αποφασίσεις σήμερα. Μπες στο κανάλι, δες τη δουλειά
                  για όσο θέλεις, και αν σου ταιριάζει προχωράς.
                </p>
              </div>
            </div>

            <div className="access">
              <div className="card lead" data-rev>
                <div>
                  <h3>Το κανάλι μας στο Telegram</h3>
                  <p>
                    Ανοιχτό σε όλους. Από εκεί ανακοινώνεται και πότε ανοίγουν θέσεις
                    για νέα μέλη.
                  </p>
                </div>
                <a className="btn btn-solid" href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">Άνοιγμα στο Telegram</a>
              </div>

              <div className="card" data-rev>
                <div>
                  <h3>Είσαι ήδη μέλος;</h3>
                  <p>
                    Η είσοδος στην πλατφόρμα γίνεται με τον λογαριασμό Telegram σου.
                    Αναγνωρίζεσαι αυτόματα — αν είσαι μέσα στην κοινότητα, περνάς.
                  </p>
                </div>
                <a className="btn btn-line" href="https://apexhub.gr/login">Σύνδεση</a>
              </div>
            </div>
          </div>
        </section>

        {/* ΑΠΟΠΟΙΗΣΗ */}
        <section className="risk">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">07</span><span className="lbl">Ρίσκο</span></div>
              <div>
                <h2>Αποποίηση ευθύνης.</h2>
                <p className="sub">
                  Το APEXHUB παρέχει ανάλυση αγοράς, εκπαιδευτικό περιεχόμενο και
                  trading ideas, για ενημερωτικούς και εκπαιδευτικούς σκοπούς.
                </p>
              </div>
            </div>

            <div className="rk">
              <div>
                <div className="n">01</div>
                <h4>Δεν είναι επενδυτική συμβουλή</h4>
                <p>
                  Τα trading ideas δεν λαμβάνουν υπόψη την προσωπική οικονομική
                  κατάσταση ή το επενδυτικό προφίλ κάθε μέλους.
                </p>
              </div>
              <div>
                <div className="n">02</div>
                <h4>Υψηλό ρίσκο</h4>
                <p>
                  Το trading μπορεί να οδηγήσει σε σημαντική ή και πλήρη απώλεια
                  κεφαλαίου. Δεν υπάρχουν εγγυημένα κέρδη.
                </p>
              </div>
              <div>
                <div className="n">03</div>
                <h4>Δική σου απόφαση</h4>
                <p>
                  Δεν διαχειριζόμαστε κεφάλαια ούτε πραγματοποιούμε συναλλαγές για
                  λογαριασμό μελών. Κάθε απόφαση και το ρίσκο της ανήκουν αποκλειστικά
                  σε εσένα.
                </p>
              </div>
            </div>

            <p className="rk-foot">
              Στόχος μας είναι η εκπαίδευση, η πειθαρχία και η σωστή διαχείριση ρίσκου.
              Μην επενδύσεις χρήματα που δεν αντέχεις να χάσεις.
            </p>
          </div>
        </section>

      </main>

      <footer>
        <div className="wrap foot">
          <a className="mark" href="#top" aria-label="ApexHub — Trading Community">
            <svg viewBox="0 0 104 100" aria-hidden>
              <defs>
                <linearGradient id="glb" x1=".1" y1="0" x2=".9" y2="1">
                  <stop offset="0" stopColor="#FBEFC6"/><stop offset=".55" stopColor="#EBC862"/>
                  <stop offset="1" stopColor="#C9A043"/>
                </linearGradient>
                <linearGradient id="gdb" x1=".1" y1="0" x2="1" y2=".9">
                  <stop offset="0" stopColor="#B98F32"/><stop offset=".6" stopColor="#8F6D22"/>
                  <stop offset="1" stopColor="#6E5319"/>
                </linearGradient>
              </defs>
              {/* δεξιά όψη, στο φως */}
              <path fill="url(#glb)" d="M52 3 100 97H76L52 45Z"/>
              {/* αριστερή όψη, στη σκιά */}
              <path fill="url(#gdb)" d="M52 3 52 45 28 97H4Z"/>
              {/* η εγκοπή: η οριζόντια του A, ανοιχτή στην κορυφή */}
              <path fill="url(#glb)" d="M38 68h28l7 14H31Z" opacity=".92"/>
            </svg>
            <span className="lock">
              <span className="wm">Apex<i>Hub</i></span>
              <span className="tc">Trading Community</span>
            </span>
          </a>
          <a href="https://apexhub.gr/login">Πλατφόρμα μελών</a>
          <a href="#pillars">Οι πυλώνες</a>
          <a href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">Telegram</a>
          <span className="cr">© 2026 Chilitidis &amp; Co</span>
        </div>
      </footer>
    </>
  );
}

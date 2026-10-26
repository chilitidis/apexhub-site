import dynamic from 'next/dynamic';
import Chrome from '@/components/Chrome';
import LangSwitch from '@/components/LangSwitch';
import { currentLang } from '@/lib/lang';
import { HOME } from './home-copy';

/* Η σκηνή φορτώνει μόνο στον browser. Το `ssr: false` δεν είναι προαίρεση:
   το three.js αγγίζει document κατά την αρχικοποίηση, και ένα μισό MB
   γραφικών δεν έχει δουλειά στο server render μιας σελίδας που πρέπει να
   δείξει κείμενο αμέσως. */
const Peak = dynamic(() => import('@/components/Peak'), { ssr: false });

export default function Home() {
  const lang = currentLang();
  const c = HOME[lang];
  const P = c.pillars.items;
  const NUMS = lang === 'en' ? ['I', 'II', 'III'] : ['Ι', 'ΙΙ', 'ΙΙΙ'];
  const offerTp = [c.offer.open, c.offer.members, c.offer.members, c.offer.members, c.offer.members, c.offer.soon];
  const offerCls = ['item', 'item wide', 'item', 'item', 'item wide', 'item soon'];
  return (
    <>
      <Peak />
      <Chrome rail={c.rail} />
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
            <a href="#who">{c.nav.who}</a>
            <a href="#pillars">{c.nav.pillars}</a>
            <a href="#voices">{c.nav.voices}</a>
            <a href="#offer">{c.nav.offer}</a>
          </nav>
          <div className="bar-acts">
            <LangSwitch lang={lang} />
            <a className="btn btn-line btn-sm" href="https://apexhub.gr/login">{c.nav.login}</a>
          </div>
        </div>
      </header>

      <main id="top">

        <div className="stage" id="stage">
        <div className="wrap hero">
          <div className="lbl kicker rise">
            <span>{c.kicker[0]}</span><span className="dot"></span>
            <span>{c.kicker[1]}</span><span className="dot"></span>
            <span>{c.kicker[2]}</span>
          </div>
          <h1><span className="w">{c.h1[0]}</span><br /><span className="w"><b>{c.h1[1]}</b></span><br /><span className="w">{c.h1[2]}</span> <span className="w"><em>{c.h1[3]}</em></span></h1>
          <p className="lede rise">{c.lede}</p>
          <div className="ctas rise">
            <a className="btn btn-solid" href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">{c.ctaJoin}</a>
            <a className="btn btn-line" href="#pillars">{c.ctaInside}</a>
          </div>
          <p className="note rise">{c.note}</p>
        </div>
        </div>

        <div className="wrap">
          <div className="values">
            {c.values.map((v) => <div key={v}>{v}</div>)}
          </div>
        </div>

        {/* ΠΟΙΟΙ ΕΙΜΑΣΤΕ */}
        <section id="who">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">01</span><span className="lbl">{c.who.lbl}</span></div>
              <div>
                <h2>{c.who.h2}</h2>
                <p className="sub">{c.who.sub}</p>
              </div>
            </div>

            <div className="who">
              <div className="body" data-rev>
                <p>{c.who.p1a} <strong>{c.who.p1b}</strong> {c.who.p1c}</p>
                <p>{c.who.p2}</p>
                <p>{c.who.p3a} <strong>{c.who.p3b}</strong> {c.who.p3c}</p>
              </div>

              <div className="roster" data-rev>
                {c.who.roster.map(([nm, rl]) => (
                  <div className="row" key={nm}><span className="nm">{nm}</span><span className="rl">{rl}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ΟΙ ΠΥΛΩΝΕΣ */}
        <section id="pillars">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">02</span><span className="lbl">{c.pillars.lbl}</span></div>
              <div>
                <h2>{c.pillars.h2}</h2>
                <p className="sub">{c.pillars.sub}</p>
              </div>
            </div>

            <div className="pillars">
              {P.map((p, i) => (
                <article className="pillar" data-rev id={`p${i + 1}`} key={p.h}>
                  <div className="no">{NUMS[i]}</div>
                  <div>
                    <h3>{p.h}</h3>
                    <p className="kick">{p.kick}</p>
                  </div>
                  <ul>
                    {p.li.map(([b, t]) => (
                      <li key={b}><span className="d"></span><div><b>{b}</b><span>{t}</span></div></li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ΔΥΟ ΔΡΟΜΟΙ */}
        <section id="paths">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">03</span><span className="lbl">{c.paths.lbl}</span></div>
              <div>
                <h2>{c.paths.h2}</h2>
                <p className="sub">{c.paths.sub}</p>
              </div>
            </div>

            <div className="paths">
              {[c.paths.a, c.paths.b].map((pt, i) => (
                <PathCard key={pt.tp} pt={pt} seam={i === 0} />
              ))}
            </div>
          </div>
        </section>

        {/* ΤΙ ΛΕΕΙ Η ΚΟΙΝΟΤΗΤΑ */}
        <section id="voices">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">04</span><span className="lbl">{c.voices.lbl}</span></div>
              <div>
                <h2>{c.voices.h2}</h2>
                <p className="sub">{c.voices.sub}{c.voices.translated ? ` ${c.voices.translated}` : ''}</p>
              </div>
            </div>

            <div className="voices">
              {c.voices.items.map((v) => (
                <figure className="voice" data-rev key={v.name}>
                  <blockquote>{v.q}</blockquote>
                  <figcaption>
                    <span className="av">{v.av}</span>
                    <span className="who2">{v.name}</span>
                    <span className="meta">{c.voices.member}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <p className="swipe">{c.voices.swipe}</p>

            <p className="disclaim">{c.voices.disclaim}</p>
          </div>
        </section>

        {/* ΤΙ ΠΡΟΣΦΕΡΟΥΜΕ */}
        <section id="offer">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">05</span><span className="lbl">{c.offer.lbl}</span></div>
              <div>
                <h2>{c.offer.h2}</h2>
                <p className="sub">{c.offer.sub}</p>
              </div>
            </div>

            <div className="offer">
              {c.offer.items.map(([h, t], i) => (
                /* Το «Έρχεται» δεν παίρνει reveal: δεν είναι κάτι που υπάρχει ακόμη. */
                <div className={offerCls[i]} key={h} {...(i < 5 ? { 'data-rev': true } : {})}>
                  <div className="tp">{offerTp[i]}</div>
                  <h4>{h}</h4>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ΠΡΟΣΒΑΣΗ */}
        <section id="access">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">06</span><span className="lbl">{c.access.lbl}</span></div>
              <div>
                <h2>{c.access.h2}</h2>
                <p className="sub">{c.access.sub}</p>
              </div>
            </div>

            <div className="access">
              <div className="card lead" data-rev>
                <div>
                  <h3>{c.access.ch}</h3>
                  <p>{c.access.chP}</p>
                </div>
                <a className="btn btn-solid" href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">{c.access.chBtn}</a>
              </div>

              <div className="card" data-rev>
                <div>
                  <h3>{c.access.mem}</h3>
                  <p>{c.access.memP}</p>
                </div>
                <a className="btn btn-line" href="https://apexhub.gr/login">{c.access.memBtn}</a>
              </div>
            </div>
          </div>
        </section>

        {/* ΑΠΟΠΟΙΗΣΗ */}
        <section className="risk">
          <div className="wrap">
            <div className="head" data-rev>
              <div className="idx"><span className="num">07</span><span className="lbl">{c.risk.lbl}</span></div>
              <div>
                <h2>{c.risk.h2}</h2>
                <p className="sub">{c.risk.sub}</p>
              </div>
            </div>

            <div className="rk">
              {c.risk.items.map(([h, t], i) => (
                <div key={h}>
                  <div className="n">{String(i + 1).padStart(2, '0')}</div>
                  <h4>{h}</h4>
                  <p>{t}</p>
                </div>
              ))}
            </div>

            <p className="rk-foot">{c.risk.foot}</p>
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
          <a href="https://apexhub.gr/login">{c.footer.platform}</a>
          <a href="#pillars">{c.footer.pillars}</a>
          <a href="https://t.me/ApexHubChannel" target="_blank" rel="noopener">Telegram</a>
          <span className="cr">© 2026 Chilitidis &amp; Co</span>
        </div>
      </footer>
    </>
  );
}

function PathCard({ pt, seam }: { pt: { tp: string; h: string; li: string[] }; seam: boolean }) {
  return (
    <>
      <div className="path" data-rev>
        <div className="tp">{pt.tp}</div>
        <h4>{pt.h}</h4>
        <ul>
          {pt.li.map((x) => <li key={x}><span className="d"></span><span>{x}</span></li>)}
        </ul>
      </div>
      {seam && <div className="seam" aria-hidden></div>}
    </>
  );
}

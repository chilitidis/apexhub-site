/* Η 3D κορυφή του σήματος.
   Ζει σε δικό της αρχείο JavaScript, χωρίς τύπους: είναι γραφικός κώδικας
   που μιλάει κατευθείαν με το WebGL, και η προσπάθεια να τυποποιηθεί κάθε
   μήτρα και κάθε υλικό θα πρόσθετε θόρυβο χωρίς να πιάσει κανένα λάθος
   που δεν το πιάνει ήδη η ίδια η σκηνή όταν δεν ζωγραφιστεί.

   Επιστρέφει συνάρτηση καθαρισμού: το React το ξαναστήνει σε κάθε
   navigation, και χωρίς αυτήν θα μέναμε με δεκάδες WebGL contexts. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function startPeak() {
    let raf = 0, live = true, rt;

  /* ──────────────────────────────────────────────────────────────────────────
     Η ΚΟΡΥΦΗ — το σήμα του ApexHub, εξωθημένο σε χρυσό.

     ΤΙ ΕΦΤΑΙΓΕ ΠΡΙΝ, ονομαστικά:

     • Οι σκούροι κύκλοι ήταν τα sprites της «λάμψης». Ένα radial gradient σε
       καμβά σβήνει σε rgba(…,0): ο καμβάς αποθηκεύει premultiplied χρώμα, άρα
       στις άκρες το RGB πάει στο μηδέν. Ο WebGL το ξαναδιαιρεί με το άλφα και
       παίρνει σκούρο δαχτυλίδι. Με depthWrite:false τα δαχτυλίδια επικάλυπταν
       και το φόντο. Λύση: κανένα sprite. Το bloom γίνεται σωστά, σε pass.
     • Το «μπεζ πλαστικό» ήταν το ACES tone mapping πάνω σε emissive χρυσό: το
       emissive ανεβάζει όλα τα κανάλια, το tone mapping ξεπλένει τον κορεσμό
       και το χρυσό γίνεται κρεμ. Το μπλε κερί ήταν η ανάκλαση του ψυχρού
       rim light πάνω σε σκούρο μέταλλο — σωστή φυσική, λάθος σύνθεση.
       Λύση: μηδέν emissive. Ο χρυσός έρχεται από το χρώμα και το περιβάλλον.

     Τώρα: ένα αντικείμενο, στο δεξί 45%, ποτέ πίσω από κείμενο.
     ────────────────────────────────────────────────────────────────────── */






  const cv   = document.getElementById('scene');
  const wrap = document.getElementById('sceneWrap');
  const root = document.documentElement;
  const stage = document.getElementById('stage');
  if (!cv || !wrap || !stage) return () => {};

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small  = matchMedia('(max-width: 900px)').matches;
  const fine   = matchMedia('(hover: hover) and (pointer: fine)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  } catch (e) { return () => {}; }
  if (!renderer || !renderer.getContext()) return () => {};

  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  /* ── περιβάλλον: RoomEnvironment + PMREM ──────────────────────────────
     Αυτό είναι όλη η διαφορά ανάμεσα σε «χρυσό χρώμα» και σε χρυσό. Το
     metalness:1 δεν έχει δικό του χρώμα· δείχνει το δωμάτιο. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* ── το γλυπτό: το ίδιο σχήμα με το SVG του header ───────────────────
     Συντεταγμένες του σήματος (viewBox 104×100), με το Υ αναποδογυρισμένο
     και κανονικοποιημένες γύρω από το κέντρο. */
  const U = 26, CX = 52, CY = 97;
  const pt = (x, y) => new THREE.Vector2((x - CX) / U, (CY - y) / U);

  function shapeOf(pairs){
    const s = new THREE.Shape();
    pairs.forEach(([x, y], i) => {
      const p = pt(x, y);
      i ? s.lineTo(p.x, p.y) : s.moveTo(p.x, p.y);
    });
    s.closePath();
    return s;
  }

  const peak = shapeOf([[52,3],[100,97],[76,97],[52,45],[28,97],[4,97]]);
  const bar  = shapeOf([[38,68],[66,68],[73,82],[31,82]]);

  const EXT = {
    depth: 0.52, bevelEnabled: true,
    bevelSize: 0.045, bevelThickness: 0.045, bevelSegments: 4,
    curveSegments: 1, steps: 1
  };

  /* Γυαλισμένος χρυσός. Καθόλου emissive: το emissive είναι που έκανε τον
     χρυσό μπεζ κάτω από το tone mapping. */
  /* Το metalness:1 βάφει το αντικείμενο με ό,τι ανακλά. Το RoomEnvironment
     είναι ένα ζεστό δωμάτιο, οπότε ένα μεσαίο χρυσό κατέληγε χαλκός. Η λύση
     δεν είναι λιγότερο περιβάλλον — είναι ΑΝΟΙΧΤΟΤΕΡΗ βάση: ξεκινάμε από το
     ανοιχτό χρυσό των ακμών (#F3DC9A) και αφήνουμε τη σκίαση να το φέρει
     στο #E9C45C του λογοτύπου. */
  const gold = new THREE.MeshStandardMaterial({
    color: '#F3DC9A',
    metalness: 1.0, roughness: 0.15, envMapIntensity: 1.5
  });

  const art = new THREE.Group();
  [peak, bar].forEach(sh => {
    const g = new THREE.ExtrudeGeometry(sh, EXT);
    g.center();
    const m = new THREE.Mesh(g, gold);
    art.add(m);
  });
  /* Το ExtrudeGeometry.center() κεντράρει κάθε κομμάτι χωριστά, οπότε τα
     ξαναβάζουμε στη σωστή τους σχέση με το χέρι. */
  art.children[0].position.set(0, 0, 0);
  art.children[1].position.set(0, -1.18, 0);

  const hold = new THREE.Group();
  hold.add(art);
  scene.add(hold);

  /* ── το δάπεδο ───────────────────────────────────────────────────────
     Το καθρεφτισμένο αντίγραφο που δοκίμασα πρώτα διαβαζόταν ως ΔΕΥΤΕΡΟ
     γλυπτό, όχι ως αντανάκλαση: η κάμερα είναι σχεδόν στο ύψος του
     αντικειμένου, οπότε ο καθρέφτης φαίνεται ολόκληρος αντί να χάνεται σε
     προοπτική. Αντ' αυτού, μια απαλή λίμνη φωτός στη βάση — αυτό ακριβώς
     κάνει ένα γυαλισμένο αντικείμενο πάνω σε σκοτεινό δάπεδο. */
  const FLOOR = -2.05;
  const poolTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0.00, 'rgba(233,196,92,.42)');
    g.addColorStop(0.35, 'rgba(201,160,67,.16)');
    g.addColorStop(1.00, 'rgba(201,160,67,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 3.2),
    new THREE.MeshBasicMaterial({
      map: poolTex, transparent: true, depthWrite: false, toneMapped: false,
      blending: THREE.AdditiveBlending
    })
  );
  pool.position.set(0, FLOOR - 0.35, -0.9);
  hold.add(pool);

  /* ── φωτισμός ─────────────────────────────────────────────────────────
     Ζεστό key αριστερά, ψυχρό rim πίσω, ένα ασθενές fill για να μη
     κλείνουν εντελώς οι σκιασμένες όψεις. */
  const key = new THREE.DirectionalLight(0xFFFBF0, 2.1);
  key.position.set(-7, 4, 6);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xD6E4FF, 0.9);
  rim.position.set(6.5, 1.5, -8);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xFFFFFF, 0.28);
  fill.position.set(2, -4, 4);
  scene.add(fill);

  /* ── bloom: μόνο στις φωτεινές ακμές ─────────────────────────────────
     Υψηλό threshold σημαίνει ότι περνάει μόνο ό,τι είναι ήδη σχεδόν λευκό —
     δηλαδή τα highlights του φάλτσου, όχι ολόκληρο το αντικείμενο. */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.07, 0.75, 0.98);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ── μέγεθος: το γλυπτό χωράει ΠΑΝΤΑ ─────────────────────────────────
     Υπολογίζουμε την απόσταση από το bounding sphere και το μικρότερο από
     τα δύο fov (κάθετο / οριζόντιο). Έτσι δεν κόβεται ποτέ, σε καμία
     αναλογία — ούτε σε στενό κινητό ούτε σε φαρδιά οθόνη. */
  const box = new THREE.Box3().setFromObject(art);
  const bs  = box.getBoundingSphere(new THREE.Sphere());

  function size(){
    const w = Math.max(1, wrap.clientWidth), h = Math.max(1, wrap.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.9));
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    /* Η απόσταση βγαίνει από τη σφαίρα που περικλείει το γλυπτό, ελεγμένη
       ΚΑΙ στις δύο γωνίες θέασης. Η σφαίρα δεν αλλάζει όταν το γλυπτό
       γυρίζει, άρα η κάδρωση ισχύει σε κάθε στιγμή της περιστροφής και σε
       κάθε αναλογία — δεν κόβεται ούτε σε στενό κινητό. */
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const margin = small ? 1.30 : 1.46;
    const d = (bs.radius * margin) / Math.sin(Math.min(vFov, hFov) / 2);

    const cy = bs.center.y + 0.1;
    camera.position.set(bs.center.x, cy, d);
    camera.lookAt(bs.center.x, cy, 0);
  }
  size();

  /* Ένα μόνο size() στο load δεν αρκεί: όταν ο καμβάς μετράται πριν
     σταθεροποιηθεί το layout (iframe, svh, γραμματοσειρές), η απόσταση
     βγαίνει λάθος και το γλυπτό κόβεται. Ο ResizeObserver το πιάνει πάντα. */
  if ('ResizeObserver' in window){
    let first = true;
    new ResizeObserver(() => {
      size(); if (reduce || first){ first = false; draw(); }
    }).observe(wrap);
  }
  window.addEventListener('load', () => { size(); draw(); });

  window.addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => { size(); draw(); }, 160);
  });

  function draw(){ composer.render(); }

  cv.classList.add('on');

  if (reduce){
    hold.rotation.set(-0.06, -0.42, 0);
    draw();
    return () => { renderer.dispose(); composer.dispose && composer.dispose(); };
  } else {
    /* ── κίνηση ─────────────────────────────────────────────────────────
       Αργή περιστροφή με το scroll, ήπιο αιώρημα, και 2.5 μοίρες από το
       ποντίκι με αδράνεια. Τίποτα δεν αναπηδά, τίποτα δεν κουνιέται πιο
       γρήγορα απ' όσο το μάτι προλαβαίνει. */
    const P = { s: 0 };
    {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to(P, { s: 1, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: 0.6 } });
    }

    let mx = 0, my = 0, rx = 0, ry = 0, sS = 0, dimS = -1;
    const MAXR = 2.5 * Math.PI / 180;
    if (fine && !small){
      window.addEventListener('pointermove', e => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    live = true; raf = 0; let t0 = performance.now();

    const loop = now => {
      raf = 0; if (!live) return;
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      const t  = now / 1000;

      sS += (P.s - sS) * Math.min(1, dt * 6);
      ry += (mx * MAXR - ry) * Math.min(1, dt * 3.2);
      rx += (my * MAXR - rx) * Math.min(1, dt * 3.2);

      hold.rotation.y = -0.42 + sS * 1.15 + Math.sin(t * 0.26) * 0.055 + ry;
      hold.rotation.x = -0.05 + Math.sin(t * 0.21) * 0.028 + rx * 0.6;
      hold.position.y = Math.sin(t * 0.33) * 0.07 - sS * 0.5;

      const d = Math.round(Math.min(0.78, sS * 0.9) * 100) / 100;
      if (d !== dimS){ dimS = d; root.style.setProperty('--dim', d); }

      draw();
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && live){ t0 = performance.now(); raf = requestAnimationFrame(loop); } };
    document.addEventListener('visibilitychange', () => { live = !document.hidden; kick(); });
    kick();
  }

  return () => {
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(rt);
    ScrollTrigger.getAll().forEach(t => t.kill());
    renderer.dispose();
    pmrem.dispose();
  };
}

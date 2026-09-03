// Promena pisma/teme usred pitanja crta pitanje ponovo (current.redraw) — do sada je to mešalo
// redosled ponuda, brisalo izbor, a odgovoreno pitanje vraćalo na „neodgovoreno" (beleženje je
// bilo zaštićeno lastRecordKey-em, ali prikaz nije). Sada se po ključu prolaza pamte redosled,
// izbor i dat odgovor, pa ponovni prikaz izgleda isto. Simulacija ima svoje (sq.order/chosen).
import fs from 'node:fs';
const P = new URL('../../app.js', import.meta.url);
let a = fs.readFileSync(P, 'utf8');
let pao = 0;
const rep = (o, n, ime) => { const c = a.split(o).length - 1; if (c !== 1) { console.log('FAIL [' + ime + '] ' + c); pao++; return; } a = a.split(o).join(n); console.log('ok [' + ime + ']'); };

rep(`  function renderQuestion(opts) {
    const q = opts.q;
    const c = opts.container;
    c.dataset.qid = q.id;
    const shuffled = q.ch.slice();
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }

    const sel = new Set();
    let answered = false;
`,
`  // Isti prikaz istog pitanja (promena pisma/teme usred rada) mora da izgleda isto: isti
  // redosled ponuda, isti izbor, a već dat odgovor ostaje dat. Ključ je opts.recordKey
  // (prolaz|pozicija) — isti koji čuva i od dvostrukog beleženja.
  const prikazPitanja = new Map();
  function renderQuestion(opts) {
    const q = opts.q;
    const c = opts.container;
    c.dataset.qid = q.id;
    const zapamceno = opts.recordKey ? prikazPitanja.get(opts.recordKey) : null;
    let shuffled;
    if (zapamceno) {
      shuffled = zapamceno.order.map((id) => q.ch.find((x) => x.id === id)).filter(Boolean);
    } else {
      shuffled = q.ch.slice();
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    }

    const sel = new Set(zapamceno ? zapamceno.sel : []);
    let answered = false;
    const zapamti = (odgovoreno) => {
      if (!opts.recordKey) return;
      prikazPitanja.set(opts.recordKey, { order: shuffled.map((x) => x.id), sel: [...sel], odgovoreno: odgovoreno || (zapamceno && zapamceno.odgovoreno) || null });
      if (prikazPitanja.size > 300) prikazPitanja.delete(prikazPitanja.keys().next().value);   // ne raste beskonačno
    };
`, 'zaglavlje renderQuestion');

rep(`        else if (sel.size < q.req) { sel.add(ch.id); b.classList.add('sel'); }
        confirmBtn.disabled = sel.size !== q.req;
      });
      b._ch = ch;
      btns.push(b); c.appendChild(b);
    }`,
`        else if (sel.size < q.req) { sel.add(ch.id); b.classList.add('sel'); }
        confirmBtn.disabled = sel.size !== q.req;
        zapamti();
      });
      if (sel.has(ch.id)) b.classList.add('sel');   // izbor zapamćen pre ponovnog prikaza
      b._ch = ch;
      btns.push(b); c.appendChild(b);
    }`, 'klik na ponudu');

rep(`    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'primary'; confirmBtn.disabled = true;`,
`    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'primary'; confirmBtn.disabled = sel.size !== q.req;`, 'confirm po zapamćenom izboru');

rep(`    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('mark')));
    actions.appendChild(markWrap);
    c.appendChild(actions);

    function finish(chosen) {
      answered = true;`,
`    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('mark')));
    actions.appendChild(markWrap);
    c.appendChild(actions);
    // već odgovoreno u ovom prolazu: pokaži isti ishod (beleženje preskače lastRecordKey čuvar)
    if (zapamceno && zapamceno.odgovoreno) finish(shuffled.filter((ch) => zapamceno.odgovoreno.includes(ch.id)));

    function finish(chosen) {
      answered = true;
      zapamti(chosen.map((x) => x.id));`, 'finish pamti odgovor');

if (pao) { console.log('*** NE PIŠEM ***'); process.exit(1); }
fs.writeFileSync(P, a);
console.log('--- upisano: app.js ---');

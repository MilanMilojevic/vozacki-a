import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function repA(o, n, label) {
  const cnt = a.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  a = a.split(o).join(n);
  console.log('ok  [' + label + ']');
}
function repC(o, n, label) {
  const cnt = c.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return; }
  c = c.split(o).join(n);
  console.log('ok  [' + label + ']');
}

// ---------- 1) TRAKA IZNAD PITANJA: fiksna mreža, naslov se ne prelama ----------
// Ranije: flex space-between — dugačak naziv podoblasti je prelamao red i gurao "Idi" polje,
// pa su kontrole "skakale" zavisno od dužine naziva.
repA(`    el('qProgress').innerHTML = \`<span>\${onBack ? \`<a href="#" id="backToList" class="bcLink">‹ \${L('backToList')}</a> &nbsp; \` : ''}\${escapeHtml(title)}: <b>\${pos}</b> \${L('ofQ')} \${max}</span>
      <span class="jumpBox"><input id="jumpN" type="number" min="1" max="\${max}" placeholder="\${pos}">
      <button id="jumpGo" class="secondary sBtn">\${L('goto')}</button></span>
      <span class="mut kbNote">\${L('kbHint')}</span>\`;`,
`    el('qProgress').innerHTML = \`<span class="qpTitle" title="\${escapeHtml(title)}">\${onBack ? \`<a href="#" id="backToList" class="bcLink">‹ \${L('backToList')}</a> &nbsp; \` : ''}\${escapeHtml(title)}</span>
      <span class="qpPos"><b>\${pos}</b> \${L('ofQ')} \${max}</span>
      <span class="jumpBox"><input id="jumpN" type="number" min="1" max="\${max}" placeholder="\${pos}">
      <button id="jumpGo" class="secondary sBtn">\${L('goto')}</button></span>
      <span class="mut kbNote">\${L('kbHint')}</span>\`;`, 'traka-html');

repC(`.qProgress { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: var(--mut); font-size: .9rem; flex-wrap: wrap; gap: 6px; }`,
`/* Traka iznad pitanja: FIKSNA mreža — naslov (skraćen po potrebi) · brojač · Idi · prečice.
   Kontrole ostaju na istom mestu bez obzira na dužinu naziva podoblasti. */
.qProgress { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center;
  column-gap: 14px; row-gap: 6px; margin-bottom: 10px; color: var(--mut); font-size: .9rem; }
.qpTitle { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qpPos { white-space: nowrap; font-variant-numeric: tabular-nums; }
.qProgress .jumpBox { justify-self: end; }
.qProgress .kbNote { grid-column: 1 / -1; justify-self: end; }
@media (max-width: 560px) {
  .qProgress { grid-template-columns: minmax(0, 1fr) auto; }
  .qProgress .jumpBox { grid-column: 2; }
}`, 'traka-css');

// ---------- 2) PRIJAVA GREŠKE: Issues su isključeni → forma koja radi za svakoga ----------
repA(`    feedback: { l: 'Prijavi grešku ili predlog', c: 'Пријави грешку или предлог' },`,
`    feedback: { l: 'Prijavi grešku ili predlog', c: 'Пријави грешку или предлог' },
    fbTitle: { l: '✉️ Prijavi grešku ili predlog', c: '✉️ Пријави грешку или предлог' },
    fbIntro: { l: 'Napiši šta ne valja ili šta bi dodao. Ako je u pitanju konkretno pitanje, ostavi njegov broj (npr. #9948) — najbrže se nađe.', c: 'Напиши шта не ваља или шта би додао. Ако је у питању конкретно питање, остави његов број (нпр. #9948) — најбрже се нађе.' },
    fbPh: { l: 'Opis greške ili predloga…', c: 'Опис грешке или предлога…' },
    fbCopy: { l: 'Kopiraj prijavu', c: 'Копирај пријаву' },
    fbCopied: { l: 'Kopirano — nalepi u poruku i pošalji', c: 'Копирано — налепи у поруку и пошаљи' },
    fbMail: { l: 'Pošalji e-poštom', c: 'Пошаљи е-поштом' },
    fbClose: { l: 'Zatvori', c: 'Затвори' },`, 'fb-str');

repA(`        <a href="https://github.com/MilanMilojevic/vozacki-a/issues" target="_blank" rel="noopener">\${L('feedback')}</a></div>\`;`,
`        <button class="linklike" id="btnFeedback">\${L('feedback')}</button></div>\`;`, 'fb-dugme');

repA(`    el('examDate').addEventListener('change', () => {`,
`    el('btnFeedback').addEventListener('click', otvoriPrijavu);
    el('examDate').addEventListener('change', () => {`, 'fb-veza');

// sam prozor prijave — bez naloga, bez servera: sastavi tekst, kopiraj ili pošalji e-poštom
repA(`  function otvoriPojmovnikProba() {}`, `  function otvoriPojmovnikProba() {}`, 'proba');   // očekivani promašaj

if (fails !== 1) { console.log('NEOČEKIVANO'); process.exit(1); }
fails = 0;

repA(`  // ---------- Nagoveštaj rada bez interneta ----------`,
`  // ---------- Prijava greške/predloga (bez naloga i bez servera) ----------
  function otvoriPrijavu() {
    if (document.getElementById('fbBox')) return;
    const box = document.createElement('div');
    box.id = 'fbBox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', L('fbTitle'));
    box.innerHTML = \`<div class="fbCard">
      <h3 style="margin:0 0 6px">\${L('fbTitle')}</h3>
      <p class="mut" style="font-size:.88rem;margin:0 0 8px">\${L('fbIntro')}</p>
      <textarea id="fbText" rows="5" placeholder="\${escapeHtml(L('fbPh'))}" style="width:100%"></textarea>
      <div class="qActions" style="margin-top:10px">
        <button class="primary" id="fbCopy">\${L('fbCopy')}</button>
        <a class="secondary fbMail" id="fbMail" href="#">\${L('fbMail')}</a>
        <button class="linklike" id="fbClose">\${L('fbClose')}</button>
      </div>
      <div class="mut" id="fbStatus" style="margin-top:8px;font-size:.85rem"></div>
    </div>\`;
    document.body.appendChild(box);
    const zatvori = () => box.remove();
    const podaci = () => {
      const t = el('fbText').value.trim();
      const kontekst = '\\n\\n---\\nverzija: ' + (window.APP_V || '?') + ' · stranica: ' + (curHash || '#/') +
        ' · baza: ' + D.generated + ' · pregledač: ' + navigator.userAgent.slice(0, 120);
      return t ? t + kontekst : '';
    };
    el('fbClose').addEventListener('click', zatvori);
    box.addEventListener('click', (e) => { if (e.target === box) zatvori(); });
    el('fbCopy').addEventListener('click', async () => {
      const p = podaci();
      if (!p) { el('fbText').focus(); return; }
      try { await navigator.clipboard.writeText(p); el('fbStatus').textContent = L('fbCopied'); }
      catch (e) { el('fbText').select(); }
    });
    el('fbMail').addEventListener('click', (e) => {
      const p = podaci();
      if (!p) { e.preventDefault(); el('fbText').focus(); return; }
      el('fbMail').href = 'mailto:milanmilojevic93@gmail.com?subject=' +
        encodeURIComponent('Vozacki A — prijava') + '&body=' + encodeURIComponent(p);
    });
    setTimeout(() => el('fbText').focus(), 50);
    document.addEventListener('keydown', function esc(ev) {
      if (ev.key === 'Escape') { zatvori(); document.removeEventListener('keydown', esc); }
    });
  }

  // ---------- Nagoveštaj rada bez interneta ----------`, 'fb-prozor');

c += [
  '',
  '/* Prozor za prijavu greške/predloga */',
  '#fbBox { position: fixed; inset: 0; background: rgba(8, 14, 20, .55); z-index: 1400;',
  '  display: flex; align-items: center; justify-content: center; padding: 16px; }',
  '#fbBox .fbCard { background: var(--card); color: var(--ink); border: 1px solid var(--line);',
  '  border-radius: 12px; padding: 18px 20px; max-width: 560px; width: 100%; box-shadow: 0 12px 40px rgba(0,0,0,.3); }',
  '#fbBox textarea { padding: 10px 12px; border: 1.5px solid var(--line); border-radius: 10px;',
  '  font: inherit; background: var(--card); color: var(--ink); resize: vertical; }',
  '.fbMail { text-decoration: none; display: inline-block; border-radius: 8px; padding: 8px 14px; }',
  '',
].join('\n');

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('traka i prijava sređeni');

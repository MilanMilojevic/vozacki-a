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

// ---------- Prijava greške: Google forma, unapred popunjena ----------
// Podešavanje je na JEDNOM mestu: čim stigne link forme, popune se PRIJAVA_URL i imena polja,
// i dugme se samo pojavljuje. Dok je URL prazan, dugmeta nema (bolje ništa nego nešto što ne radi).
repA(`  // ---------- Prijava greške/predloga (bez naloga i bez servera) ----------
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
  }`,
`  // ---------- Prijava greške/predloga ----------
  // Google forma, otvorena sa VEĆ POPUNJENIM tehničkim podacima — korisniku ostaje samo opis.
  // PODEŠAVANJE (jedino mesto): kad stigne "unapred popunjen link" forme, upiši adresu i imena polja.
  const PRIJAVA = {
    url: '',            // npr. 'https://docs.google.com/forms/d/e/XXXX/viewform'
    poljeOpis: '',      // npr. 'entry.123456789'  — polje "Opis greške ili predloga"
    poljeKontekst: '',  // npr. 'entry.987654321'  — polje "Tehnički podaci (ne diraj)"
  };
  const prijavaRadi = () => !!(PRIJAVA.url && PRIJAVA.poljeKontekst);

  function otvoriPrijavu() {
    if (!prijavaRadi()) return;
    const kontekst = 'verzija ' + (window.APP_V || '?') + ' · stranica ' + (curHash || '#/') +
      ' · baza ' + D.generated + ' · ' + (navigator.userAgent || '').slice(0, 120);
    const u = new URL(PRIJAVA.url);
    u.searchParams.set('usp', 'pp_url');
    u.searchParams.set(PRIJAVA.poljeKontekst, kontekst);
    if (PRIJAVA.poljeOpis) u.searchParams.set(PRIJAVA.poljeOpis, '');
    window.open(u.toString(), '_blank', 'noopener');
  }`, 'prijava');

// dugme se prikazuje samo ako je forma podešena
repA(`        <button class="linklike" id="btnFeedback">\${L('feedback')}</button></div>\`;`,
`        \${prijavaRadi() ? \`<button class="linklike" id="btnFeedback">\${L('feedback')}</button>\` : ''}</div>\`;`, 'dugme');

repA(`    el('btnFeedback').addEventListener('click', otvoriPrijavu);`,
`    { const bf = el('btnFeedback'); if (bf) bf.addEventListener('click', otvoriPrijavu); }`, 'veza');

// nepotrebni tekstovi prozora — ostaju samo naslov dugmeta
repA(`    fbTitle: { l: '✉️ Prijavi grešku ili predlog', c: '✉️ Пријави грешку или предлог' },
    fbIntro: { l: 'Napiši šta ne valja ili šta bi dodao. Ako je u pitanju konkretno pitanje, ostavi njegov broj (npr. #9948) — najbrže se nađe.', c: 'Напиши шта не ваља или шта би додао. Ако је у питању конкретно питање, остави његов број (нпр. #9948) — најбрже се нађе.' },
    fbPh: { l: 'Opis greške ili predloga…', c: 'Опис грешке или предлога…' },
    fbCopy: { l: 'Kopiraj prijavu', c: 'Копирај пријаву' },
    fbCopied: { l: 'Kopirano — nalepi u poruku i pošalji', c: 'Копирано — налепи у поруку и пошаљи' },
    fbMail: { l: 'Pošalji e-poštom', c: 'Пошаљи е-поштом' },
    fbClose: { l: 'Zatvori', c: 'Затвори' },`, '', 'ciscenje-str');

// stil prozora više ne treba
const cssBlok = [
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
if (c.split(cssBlok).length - 1 === 1) { c = c.split(cssBlok).join('\n'); console.log('ok  [ciscenje-css]'); }
else { console.log('FAIL [ciscenje-css]'); fails++; }

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('prijava spremna za Google formu');

import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let h = fs.readFileSync('../../index.html', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// ---------- TEKSTOVI ----------
a = rep(a, "    feedback: { l: 'Prijavi grešku ili predlog', c: 'Пријави грешку или предлог' },",
`    feedback: { l: 'Prijavi grešku ili predlog', c: 'Пријави грешку или предлог' },
    trustTitle: { l: '🛡️ Zašto verovati ovoj vežbaonici', c: '🛡️ Зашто веровати овој вежбаоници' },
    trustBody: { l: \`<ul class="trustList">
      <li><b>Baza je zvanična.</b> Svih 1327 pitanja, odgovora i slika dolazi sa eUprava servisa za kandidate (MUP). Poslednja provera: <b>29. 8. 2026.</b> — nula izmena.</li>
      <li><b>Simulacija je merena, ne "po osećaju".</b> Sastav testa je upoređen sa <b>šest zvaničnih izvlačenja</b> pravog ispita i identičan je do poslednjeg poena (41 pitanje, 98 poena, ista matrica oblasti).</li>
      <li><b>Objašnjenja su pisana ručno</b>, uz doslovnu proveru ZOBS-a i Pravilnika, sa brojem člana — i nezavisno recenzirana. Tamo gde se ispitna baza razilazi sa važećim zakonom, to otvoreno piše.</li>
      <li><b>Kôd je javan.</b> Sve što aplikacija radi može da se proveri: <a href="https://github.com/MilanMilojevic/vozacki-a" target="_blank" rel="noopener">github.com/MilanMilojevic/vozacki-a</a>.</li>
      <li><b>Privatnost:</b> bez naloga, bez reklama; napredak ostaje samo na tvom uređaju. Meri se jedino anoniman broj poseta (bez kolačića; poštuje se „Do Not Track").</li>
    </ul>\`, c: \`<ul class="trustList">
      <li><b>База је званична.</b> Свих 1327 питања, одговора и слика долази са еУправа сервиса за кандидате (МУП). Последња провера: <b>29. 8. 2026.</b> — нула измена.</li>
      <li><b>Симулација је мерена, не „по осећају".</b> Састав теста је упоређен са <b>шест званичних извлачења</b> правог испита и идентичан је до последњег поена (41 питање, 98 поена, иста матрица области).</li>
      <li><b>Објашњења су писана ручно</b>, уз дословну проверу ЗОБС-а и Правилника, са бројем члана — и независно рецензирана. Тамо где се испитна база разилази са важећим законом, то отворено пише.</li>
      <li><b>Кôд је јаван.</b> Све што апликација ради може да се провери: <a href="https://github.com/MilanMilojevic/vozacki-a" target="_blank" rel="noopener">github.com/MilanMilojevic/vozacki-a</a>.</li>
      <li><b>Приватност:</b> без налога, без реклама; напредак остаје само на твом уређају. Мери се једино анониман број посета (без колачића; поштује се „Do Not Track").</li>
    </ul>\` },
    iosHint: { l: '📲 Dodaj vežbaonicu na početni ekran: dugme <b>Deli</b> (kvadrat sa strelicom) → <b>Dodaj na početni ekran</b>. Radi i bez interneta.', c: '📲 Додај вежбаоницу на почетни екран: дугме <b>Дели</b> (квадрат са стрелицом) → <b>Додај на почетни екран</b>. Ради и без интернета.' },
    installBtn: { l: '📲 Instaliraj kao aplikaciju', c: '📲 Инсталирај као апликацију' },
    linkCopied: { l: 'kopirano ✓', c: 'копирано ✓' },
    qNumTip2: { l: 'Klik: kopiraj adresu ovog pitanja', c: 'Клик: копирај адресу овог питања' },`, 'str');

// ---------- STANJE: iOS podsetnik viđen ----------
a = rep(a, "      noUpd: obj.noUpd === 1 ? 1 : 0,",
`      noUpd: obj.noUpd === 1 ? 1 : 0,
      iosSeen: obj.iosSeen === 1 ? 1 : 0,`, 'state');

// ---------- RUTA: adresa pojedinačnog pitanja #/p/<id> ----------
a = rep(a, `    if (h === '#/uci') return startLearn();`,
`    if (h === '#/uci') return startLearn();
    if (h.startsWith('#/p/')) {
      const qid = parseInt(h.slice(4), 10);
      if (byId.has(qid)) return startList([qid], () => '#' + qid, null, 'filter', { origin: () => renderHome() });
      return goHomeReplace();
    }`, 'ruta-p');

// ---------- KOD PITANJA = link za kopiranje (samo van file:// i van simulacije) ----------
a = rep(a, `      <span><span class="qNum" title="\${escapeHtml(L('qNumTip'))}">#\${q.id}</span> · \${q.pts} \${L('points')}\${hist}</span>\`;`,
`      <span><span class="qNum" data-qid="\${q.id}" title="\${escapeHtml(FILE_MODE ? L('qNumTip') : L('qNumTip2'))}">#\${q.id}</span> · \${q.pts} \${L('points')}\${hist}</span>\`;`, 'qnum-attr');

a = rep(a, `  // Klik na sliku pitanja otvara uvećan prikaz preko celog ekrana; klik ili Escape zatvara.`,
`  // Klik na kôd pitanja (#9557) kopira adresu tog pitanja — za deljenje u porukama/grupama.
  document.addEventListener('click', (ev) => {
    const qn = ev.target.closest && ev.target.closest('.qNum[data-qid]');
    if (!qn || FILE_MODE) return;
    const adresa = location.origin + location.pathname + '#/p/' + qn.dataset.qid;
    const potvrdi = () => {
      const staro = qn.textContent;
      qn.textContent = L('linkCopied');
      setTimeout(() => { qn.textContent = staro; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(adresa).then(potvrdi).catch(() => {});
  });

  // Klik na sliku pitanja otvara uvećan prikaz preko celog ekrana; klik ili Escape zatvara.`, 'qnum-copy');

// ---------- KARTICA POVERENJA na početnoj (sklopiva, posle FAQ) ----------
a = rep(a, `    const fq = el('faqCard');`,
`    const tc = el('trustCard');
    if (tc) {
      tc.innerHTML = \`<div><button class="linklike explCardBtn" style="font-size:1.05rem;font-weight:600">\${L('trustTitle')}</button><div class="explCard" style="display:none">\${L('trustBody')}</div></div>\`;
      const tb = tc.querySelector('.explCardBtn');
      tb.addEventListener('click', () => {
        const cd = tb.nextElementSibling;
        cd.style.display = cd.style.display === 'none' ? '' : 'none';
      });
    }

    const fq = el('faqCard');`, 'trust-card');

// ---------- INSTALACIJA: Android dugme + iOS jednokratni podsetnik ----------
a = rep(a, `  // ---------- Instalacija kao aplikacija (PWA) ----------`,
`  // ---------- Ponuda instalacije ----------
  // Android/Chromium: uhvati ponudu pregledača i prikaži diskretno dugme u alatima (van toka učenja).
  // iOS Safari: nema automatske ponude — jednokratni podsetnik kako se dodaje na početni ekran.
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvt = e;
    const b = el('btnInstall');
    if (b) b.style.display = '';
  });
  const jeStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function renderInstallHint() {
    if (FILE_MODE || jeStandalone() || S.iosSeen) return;
    const jeIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!jeIOS) return;
    const strip = document.createElement('div');
    strip.id = 'iosHint';
    strip.innerHTML = \`<span>\${L('iosHint')}</span><button class="linklike" id="iosHintX" aria-label="Zatvori">✕</button>\`;
    document.body.appendChild(strip);
    el('iosHintX').addEventListener('click', () => { S.iosSeen = 1; save(); strip.remove(); });
  }
  renderInstallHint();

  // ---------- Instalacija kao aplikacija (PWA) ----------`, 'install');

// dugme u alatima (skriveno dok pregledač ne ponudi instalaciju)
a = rep(a, `        <button class="linklike" id="btnCheckUpd">\${L('updRepoCheck')}</button>`,
`        <button class="secondary" id="btnInstall" style="display:none">\${L('installBtn')}</button>
        <button class="linklike" id="btnCheckUpd">\${L('updRepoCheck')}</button>`, 'install-dugme');
a = rep(a, `    el('btnCheckUpd').addEventListener('click', () => { S.noUpd = 0; save(); proveriRepo(true); });`,
`    if (installEvt) { const bi = el('btnInstall'); if (bi) bi.style.display = ''; }
    el('btnInstall').addEventListener('click', async () => {
      if (!installEvt) return;
      installEvt.prompt();
      await installEvt.userChoice.catch(() => {});
      installEvt = null;
      el('btnInstall').style.display = 'none';
    });
    el('btnCheckUpd').addEventListener('click', () => { S.noUpd = 0; save(); proveriRepo(true); });`, 'install-veza');

// ---------- HTML: kartica poverenja + SEO meta + JSON-LD ----------
h = rep(h, `    <div class="card" id="faqCard"></div>`,
`    <div class="card" id="faqCard"></div>
    <div class="card" id="trustCard"></div>`, 'html-trust');

h = rep(h, `<meta name="viewport" content="width=device-width, initial-scale=1">`,
`<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Besplatno vežbanje teorijskog ispita za A kategoriju (motocikli) — zvanična baza od 1327 pitanja, objašnjenja uz svaki odgovor i simulacija verna pravom ispitu. Бесплатно вежбање теоријског испита за А категорију.">
<link rel="canonical" href="https://milanmilojevic.github.io/vozacki-a/">
<meta property="og:title" content="Возачки А — вежбаоница за теоријски испит">
<meta property="og:description" content="Zvanična baza pitanja, objašnjenja uz svaki odgovor, simulacija verna ispitu. Besplatno, bez naloga i bez reklama.">
<meta property="og:url" content="https://milanmilojevic.github.io/vozacki-a/">
<meta property="og:image" content="https://milanmilojevic.github.io/vozacki-a/icon-512.png">
<meta property="og:type" content="website">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Возачки А — вежбаоница",
  "alternateName": "Vozacki A — vezbanje teorijskog ispita",
  "url": "https://milanmilojevic.github.io/vozacki-a/",
  "description": "Besplatno vežbanje teorijskog ispita za A kategoriju: zvanična baza od 1327 pitanja, objašnjenja uz svaki odgovor, simulacija verna pravom ispitu.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Any",
  "inLanguage": "sr",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RSD" }
}
</script>`, 'html-seo');

// ---------- CSS: lista poverenja + iOS traka ----------
c += `
/* Kartica poverenja */
.trustList { margin: 8px 0 0; padding-left: 20px; line-height: 1.5; }
.trustList li { margin-bottom: 8px; }

/* iOS podsetnik za dodavanje na početni ekran */
#iosHint { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 1100;
  background: var(--card); color: var(--ink); border: 1px solid var(--blue); border-radius: 12px;
  padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start; font-size: .92rem;
  box-shadow: 0 8px 30px rgba(0,0,0,.25); }
#iosHint button { flex: 0 0 auto; }
`;

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../index.html', h);
fs.writeFileSync('../../style.css', c);
console.log('faza1b primenjena');

import fs from 'node:fs';
let a = fs.readFileSync('../../app.js', 'utf8');
let c = fs.readFileSync('../../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// tekstovi
a = rep(a, `    updBtn: { l: 'Osveži', c: 'Освежи' },`,
`    updBtn: { l: 'Osveži', c: 'Освежи' },
    updRepoTitle: { l: 'Postoji novija verzija aplikacije', c: 'Постоји новија верзија апликације' },
    updRepoBody: { l: 'Imaš verziju #A, a objavljena je #B. Preuzmi novu i prekopiraj preko postojeće fascikle — tvoj napredak ostaje netaknut (čuva se u pregledaču).', c: 'Имаш верзију #A, а објављена је #B. Преузми нову и прекопирај преко постојеће фасцикле — твој напредак остаје нетакнут (чува се у прегледачу).' },
    updRepoGet: { l: 'Preuzmi novu verziju', c: 'Преузми нову верзију' },
    updRepoLater: { l: 'Ne sad', c: 'Не сад' },
    updRepoCheck: { l: 'Proveri ima li novije verzije', c: 'Провери има ли новије верзије' },
    updRepoNone: { l: 'Imaš najnoviju verziju (#A).', c: 'Имаш најновију верзију (#A).' },
    updRepoFail: { l: 'Provera nije uspela (nema veze sa internetom ili je izvor nedostupan).', c: 'Провера није успела (нема везе са интернетом или је извор недоступан).' },
    updRepoOff: { l: 'Ne proveravaj automatski', c: 'Не проверавај аутоматски' },`, 'str');

// stanje: pamćenje da korisnik ne želi automatsku proveru + kad je zadnji put provereno
a = rep(a, `      guide: obj.guide === 1 ? 1 : 0,
    };`,
`      guide: obj.guide === 1 ? 1 : 0,
      noUpd: obj.noUpd === 1 ? 1 : 0,
      updSeen: nInt(obj.updSeen, 0, 1e6, 0),
      updAt: nNum(obj.updAt, 0, maxTs(), 0),
    };`, 'state');

// sama provera — čita SAMO broj verzije iz javnog fajla, nikada ne izvršava preuzeti kod
a = rep(a, `  setInterval(checkVersion, 5 * 60 * 1000);`,
`  // ---------- Provera novije verzije na javnom repozitorijumu ----------
  // Čita se isključivo BROJ verzije (obični tekst) i poredi sa lokalnim.
  // Preuzeti sadržaj se NIKADA ne izvršava; ako nema interneta, tiho se odustaje.
  const REPO = 'https://github.com/MilanMilojevic/vozacki-a';
  const REPO_VER = 'https://raw.githubusercontent.com/MilanMilojevic/vozacki-a/main/version.js';
  const REPO_ZIP = REPO + '/archive/refs/heads/main.zip';

  async function dohvatiUdaljenuVerziju() {
    const res = await fetch(REPO_VER + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const tekst = (await res.text()).slice(0, 200);
    const m = tekst.match(/APP_V\\s*=\\s*(\\d{1,6})/);
    if (!m) throw new Error('neočekivan sadržaj');
    return parseInt(m[1], 10);
  }

  function prikaziNovuVerziju(nova, rucno) {
    if (document.getElementById('repoUpd')) return;
    const b = document.createElement('div');
    b.id = 'repoUpd';
    b.setAttribute('role', 'status');
    b.innerHTML = \`<div><b>\${escapeHtml(L('updRepoTitle'))}</b>
      <div class="mut" style="font-size:.86rem;margin-top:2px">\${escapeHtml(L('updRepoBody').replace('#A', BOOT_V).replace('#B', nova))}</div></div>
      <div class="repoUpdBtns">
        <a class="primary repoUpdLink" href="\${REPO_ZIP}" target="_blank" rel="noopener">\${escapeHtml(L('updRepoGet'))}</a>
        <button class="linklike" id="repoUpdLater">\${escapeHtml(L('updRepoLater'))}</button>
        <button class="linklike" id="repoUpdOff">\${escapeHtml(L('updRepoOff'))}</button>
      </div>\`;
    document.body.appendChild(b);
    const zatvori = () => { S.updSeen = nova; save(); b.remove(); };
    b.querySelector('#repoUpdLater').addEventListener('click', zatvori);
    b.querySelector('#repoUpdOff').addEventListener('click', () => { S.noUpd = 1; zatvori(); renderHome(); });
  }

  async function proveriRepo(rucno) {
    try {
      const nova = await dohvatiUdaljenuVerziju();
      if (nova > BOOT_V && (rucno || nova !== S.updSeen)) { prikaziNovuVerziju(nova, rucno); return; }
      if (rucno) alert(L('updRepoNone').replace('#A', BOOT_V));
    } catch (e) {
      if (rucno) alert(L('updRepoFail'));
    }
  }

  // automatska provera najviše jednom dnevno, i to samo ako korisnik nije isključio
  function mozdaProveriRepo() {
    if (S.noUpd || !BOOT_V) return;
    const dan = 24 * 60 * 60 * 1000;
    if (S.updAt && Date.now() - S.updAt < dan) return;
    S.updAt = Date.now(); save();
    setTimeout(() => proveriRepo(false), 2500);
  }
  mozdaProveriRepo();

  setInterval(checkVersion, 5 * 60 * 1000);`, 'provera');

// dugme za ručnu proveru u odeljku sa podacima
a = rep(a, `        <button class="linklike" id="btnTourReplay">\${L('tourReplay')}</button>`,
`        <button class="linklike" id="btnCheckUpd">\${L('updRepoCheck')}</button>
        <button class="linklike" id="btnTourReplay">\${L('tourReplay')}</button>`, 'dugme');
a = rep(a, `    el('btnTourReplay').addEventListener('click', tourStart);`,
`    el('btnCheckUpd').addEventListener('click', () => { S.noUpd = 0; save(); proveriRepo(true); });
    el('btnTourReplay').addEventListener('click', tourStart);`, 'dugme-veza');

c += `
/* Obaveštenje o novijoj verziji na repozitorijumu */
#repoUpd { position: fixed; right: 16px; bottom: 16px; max-width: min(420px, calc(100vw - 32px));
  background: var(--card); color: var(--ink); border: 1px solid var(--blue); border-radius: 12px;
  padding: 14px 16px; z-index: 1200; box-shadow: 0 8px 30px rgba(0,0,0,.28); }
.repoUpdBtns { display: flex; gap: 12px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
.repoUpdLink { text-decoration: none; display: inline-block; border-radius: 8px; }
`;

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../../app.js', a);
fs.writeFileSync('../../style.css', c);
console.log('provera novije verzije ugrađena');

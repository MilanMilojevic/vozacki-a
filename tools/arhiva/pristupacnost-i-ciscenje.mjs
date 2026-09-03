// Pristupačnost i čišćenje (moja revizija koda, 03.09.2026):
// (1) strana nije imala NIJEDAN h1 — čitač ekrana nije imao naslov strane;
// (2) html lang je ostajao 'sr' i pri promeni pisma → 'sr-Latn' / 'sr-Cyrl';
// (3) veza „preskoči na sadržaj" — sa lepljivim zaglavljem i donjom trakom tastatura je inače
//     svaki put prolazila kroz zaglavlje;
// (4) dodirne mete manje od 24px (WCAG 2.2 AA, Target Size Minimum): dugme „?" i „✕";
// (5) mrtav kod: 4 STR ključa i 6 CSS razreda iz uklonjene tabele statistike i uklonjenog .linklike.
import fs from 'node:fs';
const A = new URL('../../app.js', import.meta.url), C = new URL('../../style.css', import.meta.url), H = new URL('../../index.html', import.meta.url);
let a = fs.readFileSync(A, 'utf8'), s = fs.readFileSync(C, 'utf8'), h = fs.readFileSync(H, 'utf8');
let pao = 0;
const mk = (get, set, tag) => (o, n, ime, br = 1) => { const t = get(); const c = t.split(o).length - 1; if (c !== br) { console.log('FAIL ' + tag + ' [' + ime + '] ' + c + '/' + br); pao++; return; } set(t.split(o).join(n)); console.log('ok ' + tag + ' [' + ime + ']'); };
const rep = mk(() => a, (v) => { a = v; }, 'js');
const repS = mk(() => s, (v) => { s = v; }, 'css');
const repH = mk(() => h, (v) => { h = v; }, 'html');

// ---- 1) h1 + skip veza + id na main ----
repH(`<main>`,
`<a class="preskoci" href="#glavni">Прескочи на садржај</a>
<main id="glavni" tabindex="-1">
  <h1 class="samoZaCitace" id="naslovStrane">Возачки А — вежбаоница за теоријски испит, А категорија</h1>`, 'h1 + preskoci');
repS(`.brand { font-size: var(--fs-lg);`,
`/* naslov strane i veza „preskoči" postoje za čitače ekrana i tastaturu, ne za oko */
.samoZaCitace { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.preskoci { position: absolute; left: -9999px; top: 0; z-index: 2000; background: var(--card); color: var(--ink);
  padding: 12px 16px; border: 2px solid var(--blue); border-radius: 0 0 10px 0; text-decoration: none; }
.preskoci:focus { left: 0; }
.brand { font-size: var(--fs-lg);`, 'preskoci css');

// ---- 2) lang prati pismo + naslov strane ----
rep(`    el('brandTitle').textContent = L('brand');`,
`    // čitač ekrana mora da zna KOJIM pismom je tekst — inače srpski čita kao da je latinica uvek
    document.documentElement.lang = S.script === 'c' ? 'sr-Cyrl' : 'sr-Latn';
    { const n = el('naslovStrane'); if (n) n.textContent = L('brand') + ' — ' + L('podnozjeOpis'); }
    el('brandTitle').textContent = L('brand');`, 'lang + naslov');

// ---- 3) dodirne mete ≥ 24px (WCAG 2.2 AA) ----
repS(`.pomocBtn { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px;`,
`.pomocBtn { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px;`, 'pomocBtn 26px');
repS(`.zatvoriX { background: var(--btn2); color: var(--ink); border: 1px solid var(--line);
  border-radius: 6px; padding: 3px 9px; font-size: var(--fs-sm); line-height: 1.2; }`,
`.zatvoriX { background: var(--btn2); color: var(--ink); border: 1px solid var(--line);
  border-radius: 6px; padding: 5px 10px; font-size: var(--fs-sm); line-height: 1.2;
  min-height: 26px; min-width: 26px; }`, 'zatvoriX 26px');

// ---- 4) mrtav kod: STR ključevi iz uklonjene tabele statistike i zamenjene poruke ----
rep(`    statExpand: { l: 'Klikni za raspis po podoblastima', c: 'Кликни за распис по подобластима' },\n`, '', 'STR statExpand');
rep(`    weakTitle: { l: 'Najslabije podoblasti (min. 3 odgovora)', c: 'Најслабије подобласти (мин. 3 одговора)' },\n`, '', 'STR weakTitle');
rep(`    thSeen: { l: 'Odgovarano', c: 'Одговарано' },\n`, '', 'STR thSeen');
rep(`    updRepoNone: { l: 'Imaš najnoviju verziju (#A).', c: 'Имаш најновију верзију (#A).' },\n`, '', 'STR updRepoNone');

// ---- 5) mrtav kod: CSS razredi iz uklonjene tabele statistike ----
repS(`.catChev { display: inline-block; width: 15px; color: var(--mut); }\n`, '', 'CSS catChev');
repS(`tr.totalRow td { border-top: 2px solid var(--blue); }\n`, '', 'CSS totalRow');
repS(`.statCatRow { cursor: pointer; }
.statCatRow:hover td { background: var(--optHover); }
.statSubRow td { font-size: var(--fs-sm); color: var(--mut); border-bottom: 1px dashed var(--line); }
.statSubName { padding-left: 26px !important; }
`, '', 'CSS stat tabela');
repS(`.catRow, .statCatRow { scroll-margin-top: 74px; }`, `.catRow { scroll-margin-top: 74px; }`, 'CSS statCatRow scroll');
repS(`/* Malo dugme za zatvaranje traka i saveta. Nasledilo je mesto .linklike razreda, koji je
   uklonjen jer u aplikaciji vise nema nijedne akcije nacrtane kao link (Milanova odluka). */`,
`/* Malo dugme za zatvaranje traka i saveta. Nasledilo je mesto razreda za akcije-kao-link, kojih
   u aplikaciji više nema (Milanova odluka: svaka radnja je dugme). */`, 'komentar linklike');

if (pao) { console.log('*** NE PIŠEM (' + pao + ') ***'); process.exit(1); }
fs.writeFileSync(A, a); fs.writeFileSync(C, s); fs.writeFileSync(H, h);
console.log('--- upisano: app.js, style.css, index.html ---');

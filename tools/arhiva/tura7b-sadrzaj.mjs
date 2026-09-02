// Tri sadržajne ispravke po Milanovim nalazima (2026-09-02):
// 1) kosnik je crtan kao tri vodoravne pruge — na stvarnom znaku (img/10834) su TRI KOSE crvene
//    pruge na uspravnoj beloj tabli; 2) podoblast 163 (svetlosne oznake) bila je mapirana na
//    karticu o oznakama na kolovozu koja ih ne pominje — nova kartica; 3) kartica 'razno-pravila'
//    je zbirna, pa se uz pitanje prikazivalo sve — odeljci dobijaju data-sub, a aplikacija uz
//    pitanje pokazuje samo odeljak te podoblasti.
import fs from 'node:fs';
let t = fs.readFileSync('../build-explanations.mjs', 'utf8');   // NUL bajtovi ostaju
let pao = 0;
const rep = (o, n, br, ime) => {
  const c = t.split(o).length - 1;
  if (c !== br) { console.log(`FAIL [${ime}] očekivano ${br}, nađeno ${c}`); pao++; return; }
  t = t.split(o).join(n); console.log(`ok [${ime}] x${br}`);
};

// ---- 1) KOSNIK: uspravna bela tabla, tri kose crvene pruge (kao na znaku sa slike 10834) ----
// Traži se po sidru (naslov ćelije), jer izvornik ima prelome reda unutar SVG-a.
{
  const sidro = t.indexOf('<b>KOSNICI — 240 · 160 · 80 m</b>');
  const svgOd = sidro === -1 ? -1 : t.lastIndexOf('<svg', sidro);
  const svgDo = svgOd === -1 ? -1 : t.indexOf('</svg>', svgOd) + 6;
  const spanOd = sidro === -1 ? -1 : t.indexOf('<span>', sidro);
  const spanDo = spanOd === -1 ? -1 : t.indexOf('</span>', spanOd) + 7;
  if (sidro === -1 || svgOd === -1 || svgDo < svgOd || spanOd === -1 || sidro - svgDo > 40) { console.log('FAIL [kosnik] sidro=' + sidro + ' svg=' + svgOd + '..' + svgDo); pao++; }
  else {
    const noviSvg = '<svg viewBox="0 0 120 120"><rect x="38" y="4" width="44" height="112" rx="3" fill="#fff" stroke="#8a99a8" stroke-width="2"/><g fill="#e0451c"><polygon points="38,30 82,12 82,24 38,42"/><polygon points="38,56 82,38 82,50 38,68"/><polygon points="38,82 82,64 82,76 38,94"/></g></svg>';
    const noviSpan = '<span>uspravna tabla ispod znaka: tri kose pruge = 240 m do pruge, dve = 160 m, jedna = 80 m</span>';
    t = t.slice(0, svgOd) + noviSvg + t.slice(svgDo, spanOd) + noviSpan + t.slice(spanDo);
    console.log('ok [kosnik] x1');
  }
}

// ---- 2) nova kartica: svetlosne oznake (podoblast 163) ----
const NOVA = `CARDS['svetlosne-oznake'] = {
  title: 'Svetlosne oznake na putu — smerokazi, štapovi, table',
  html: \`
<p><b>Ključ za pamćenje:</b> pitanja traže da razvrstaš pet naziva u dve grupe — šta obeležava <b>ivicu kolovoza</b>, a šta <b>putni objekat</b> (most, tunel, stub, izdignuti ivičnjak). Mamci su uvek nazivi iz druge grupe.</p>
<table>
<tr><th>Obeležava IVICU KOLOVOZA</th><th>Obeležava PUTNI OBJEKAT</th></tr>
<tr><td><b>katadiopter</b></td><td><b>tabla za označavanje stalnih prepreka</b> unutar gabarita slobodnog profila puta</td></tr>
<tr><td><b>smerokazi</b></td><td><b>indikator za označavanje putnog objekta</b> i zona izdignutih ivičnjaka</td></tr>
<tr><td><b>štap za označavanje puta u zimskim uslovima</b></td><td></td></tr>
</table>
<div class="signRow">
<div class="signCell"><svg viewBox="0 0 120 120"><rect x="20" y="30" width="80" height="60" rx="3" fill="#f5d000" stroke="#8a99a8" stroke-width="2"/><g fill="#e0451c"><polygon points="20,30 40,30 20,50"/><polygon points="40,30 60,30 20,70"/><polygon points="60,30 80,30 20,90"/><polygon points="80,30 100,30 40,90"/><polygon points="100,30 100,50 60,90"/><polygon points="100,70 100,90 80,90"/></g></svg><b>TABLA — stalna prepreka</b><span>crveno-žute kose pruge na ivici tunela, mosta, stuba (slika uz pitanje 11039)</span></div>
<div class="signCell"><svg viewBox="0 0 120 120"><rect x="52" y="6" width="16" height="108" rx="3" fill="#f5d000"/><rect x="52" y="24" width="16" height="16" fill="#e0451c"/><rect x="52" y="56" width="16" height="16" fill="#e0451c"/><rect x="52" y="88" width="16" height="16" fill="#e0451c"/></svg><b>ŠTAP — zimski uslovi</b><span>visok žuto-crveni štap koji se vidi i iznad snega (slika uz 11058)</span></div>
<div class="signCell"><svg viewBox="0 0 120 120"><rect x="50" y="10" width="20" height="104" rx="2" fill="#fff" stroke="#8a99a8" stroke-width="2"/><rect x="50" y="10" width="20" height="10" fill="#111"/><rect x="55" y="30" width="10" height="22" fill="#e0451c"/></svg><b>SMEROKAZ</b><span>beli stubić uz ivicu; na slici uz 11059 je smerokaz za <b>desnu</b> ivicu kolovoza (osim na autoputu)</span></div>
</div>
<p class="mut">Zamke po pitanjima: kod „ivice kolovoza“ nude tablu za prepreke i indikator (to su putni objekti); kod „putnih objekata“ nude smerokaze, štap i katadiopter (to je ivica). Štap na slici nije „stub saobraćajnog znaka“, a smerokaz nije „saobraćajni znak“ — svetlosne oznake su posebna vrsta signalizacije.</p>
\`,
};

`;
rep(`CARDS['vozac-zdravlje-alkohol'] = {`, NOVA + `CARDS['vozac-zdravlje-alkohol'] = {`, 1, 'nova kartica');
rep(`BYSUB[163] = 'oznake-kolovoz';         // svetlosne oznake na putu`,
    `BYSUB[163] = 'svetlosne-oznake';       // svetlosne oznake na putu (smerokazi, štapovi, table)`, 1, 'BYSUB 163');

// ---- 3) razno-pravila: odeljci sa data-sub, da se uz pitanje vidi samo odeljak te podoblasti ----
const s = t.indexOf("CARDS['razno-pravila']");
const e = t.indexOf("CARDS['", s + 10);
let k = t.slice(s, e);
const GRANICE = [
  ['<p><b>Nasilnička vožnja (čl. 41):</b>', '138'],
  ['<p><b>Vučenje vozila:</b>', '141'],
  ['<p><b>Žuto rotaciono svetlo (čl. 111):</b>', '149'],
  ['<p><b>Prepreke na putu (čl. 112 i Pravilnik):</b>', '165'],
  ['<p><b>Osnovna načela:</b>', null],                                   // opšte — samo u celoj kartici
  ['<p style="margin-top:18px"><b>TRAMVAJ I ŽIVOTINJE (čl. 84 i 87)</b></p>', '143'],
  ['<p style="margin-top:18px"><b>RADOVI NA PUTU — RADNIK SA ZASTAVICOM (č', '165'],
  ['<p style="margin-top:18px"><b>NASILNIČKA VOŽNJA — DOPUNA (čl. 41)</b>', '138'],
  ['<p style="margin-top:18px"><b>VUČENJE — DOPUNA (čl. 71, 72 i 73)</b>', '141'],
  ['<p style="margin-top:18px"><b>ŽUTO ROTACIONO SVETLO — ŠTA TI RADIŠ (čl', '149'],
];
const poz = GRANICE.map(([p]) => k.indexOf(p));
if (poz.some((x) => x === -1) || poz.some((x, i) => i && x <= poz[i - 1])) { console.log('FAIL granice: ' + JSON.stringify(poz)); pao++; }
else {
  const kraj = k.lastIndexOf('`,');   // zatvarajući beketik html šablona
  let out = k.slice(0, poz[0]);
  for (let i = 0; i < GRANICE.length; i++) {
    const od = poz[i], doK = i + 1 < GRANICE.length ? poz[i + 1] : kraj;
    const deo = k.slice(od, doK);
    const sub = GRANICE[i][1];
    out += sub ? `<div class="kSek" data-sub="${sub}">\n${deo}</div>\n` : deo;
  }
  out += k.slice(kraj);
  t = t.slice(0, s) + out + t.slice(e);
  console.log('ok [razno-pravila odeljci] ' + GRANICE.filter((g) => g[1]).length + ' odeljaka obeleženo');
}

if (pao) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../build-explanations.mjs', t);
console.log('--- upisano; sledi build ---');

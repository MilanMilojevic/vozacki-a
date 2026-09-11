// Gradi ../explanations.js iz latiničnog izvora (automatska transliteracija u ćirilicu,
// SI oznake ostaju latinicom kao u zvaničnoj bazi). Iz korena: node tools/build-explanations.mjs; putanje su vezane za modul.
import fs from 'node:fs/promises';
import { napraviAtlas, SUB_KARTICA_SVE } from './atlas.mjs';

// ---------------- IZVOR (latinica) ----------------
const road = (w, h) => `<rect x="0" y="0" width="${w}" height="${h}" fill="#9aa7b4"/>`;
const noSign = (x, y) => `<g transform="translate(${x} ${y})"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>`;
const yesSign = (x, y) => `<g transform="translate(${x} ${y})"><circle r="11" fill="#fff" stroke="#1f7a3f" stroke-width="3"/><path d="M-5 0 L-1 5 L5 -5" stroke="#1f7a3f" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
// crtež automobila iz ptičje perspektive (telo + vetrobran + zadnje staklo + točkovi)
const carG = (x, y, color, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="${color}"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g>`;
const arr = (x1, y1, x2, y2, color, w = 3.5) => {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (a) => x2 - 9 * Math.cos(ang - a), hy = (a) => y2 - 9 * Math.sin(ang - a);
  return `<path d="M${x1} ${y1} L${x2} ${y2} M${hx(0.45)} ${hy(0.45)} L${x2} ${y2} L${hx(-0.45)} ${hy(-0.45)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
};
// Sličica znaka IZ SAME BAZE (img/<qId>.jpg) — u koloni „Znak" umesto opisa rečima.
// Klik otvara uvećanje samo od sebe: osmatrač za '.qImgBtn, img.qImg' stoji na document.
const zn = (id) => `<button type="button" class="znTd qImgBtn" aria-label="Uvećaj sliku"><img class="qImg znTdImg" loading="lazy" src="img/${id}.jpg" alt=""></button>`;

const CARDS = {
  'kategorije-vozila': {
    title: 'Kategorije vozila (moped, tricikl, motocikl...)',
    html: `
<p><b>Ključ za pamćenje:</b> raspored točkova ti kaže <i>vrstu</i> (2 = moped/motocikl; 3 asimetrična = motocikl sa bočnim sedištem; 3 simetrična = tricikl; 4 = četvorocikl),
a granice su <b>45 km/h</b>, <b>50 cm³</b> (motor sa unutrašnjim sagorevanjem) i <b>4 kW</b> (električni pogon):
<b>sve u granicama = moped / "laki"</b>; <b>bilo koja granica probijena = motocikl / "teški"</b>. (ZOBS čl. 7)</p>
<p class="mut" style="text-align:center;">Iz ptice: isprekidana linija je <b>srednja podužna ravan</b> vozila. Da li su točkovi raspoređeni ogledalski oko nje (simetrično) ili jedan stoji sa strane (asimetrično) — to odlučuje tricikl ili motocikl.</p>
<div class="signRow lineRow" style="grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:12px">
  <div class="signCell">
    <svg viewBox="0 0 120 150" role="img" aria-label="dva točka na osi"><line x1="60" y1="6" x2="60" y2="144" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5" opacity=".55"/><rect x="53" y="42" width="14" height="66" rx="7" fill="currentColor" opacity=".18"/><line x1="42" y1="50" x2="78" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".6"/><rect x="55" y="16" width="10" height="24" rx="4" fill="currentColor"/><rect x="55" y="108" width="10" height="24" rx="4" fill="currentColor"/></svg>
    <b>2 TOČKA</b><span>oba na osi — moped / motocikl</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150" role="img" aria-label="tri točka asimetrično"><line x1="44" y1="6" x2="44" y2="144" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5" opacity=".55"/><rect x="37" y="42" width="14" height="66" rx="7" fill="currentColor" opacity=".18"/><line x1="26" y1="50" x2="62" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".6"/><rect x="39" y="16" width="10" height="24" rx="4" fill="currentColor"/><rect x="39" y="108" width="10" height="24" rx="4" fill="currentColor"/><line x1="51" y1="70" x2="74" y2="70" stroke="currentColor" stroke-width="3" opacity=".6"/><line x1="51" y1="96" x2="74" y2="96" stroke="currentColor" stroke-width="3" opacity=".6"/><rect x="72" y="56" width="28" height="52" rx="8" fill="currentColor" opacity=".18"/><rect x="93" y="86" width="10" height="24" rx="4" fill="currentColor" stroke="#2c6aa0" stroke-width="2.5"/></svg>
    <b>3 ASIMETRIČNO</b><span>treći točak SA STRANE (bočno sedište) — i dalje MOTOCIKL</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150" role="img" aria-label="tri točka simetrično"><line x1="60" y1="6" x2="60" y2="144" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5" opacity=".55"/><path d="M50 30 H70 L92 112 H28 Z" fill="currentColor" opacity=".18"/><line x1="42" y1="50" x2="78" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".6"/><rect x="55" y="16" width="10" height="24" rx="4" fill="currentColor"/><rect x="31" y="106" width="10" height="24" rx="4" fill="currentColor" stroke="#2c6aa0" stroke-width="2.5"/><rect x="79" y="106" width="10" height="24" rx="4" fill="currentColor" stroke="#2c6aa0" stroke-width="2.5"/></svg>
    <b>3 SIMETRIČNO</b><span>par točkova jednako oko ose (ili dva napred, jedan pozadi) — TRICIKL</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150" role="img" aria-label="četiri točka"><line x1="60" y1="6" x2="60" y2="144" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5" opacity=".55"/><rect x="34" y="24" width="52" height="102" rx="12" fill="currentColor" opacity=".18"/><rect x="31" y="20" width="10" height="24" rx="4" fill="currentColor"/><rect x="79" y="20" width="10" height="24" rx="4" fill="currentColor"/><rect x="31" y="106" width="10" height="24" rx="4" fill="currentColor"/><rect x="79" y="106" width="10" height="24" rx="4" fill="currentColor"/></svg>
    <b>4 TOČKA</b><span>po dva sa svake strane — ČETVOROCIKL</span>
  </div>
</div>
<div class="vgrid">
  <div class="vg vgHead"></div><div class="vg vgHead">2 točka</div><div class="vg vgHead">3 točka (simetrično)</div><div class="vg vgHead">4 točka</div>
  <div class="vg vgHead">sve u granicama</div><div class="vg vgSlow">🛵 MOPED</div><div class="vg vgSlow">LAKI TRICIKL</div><div class="vg vgSlow">LAKI ČETVOROCIKL</div>
  <div class="vg vgHead">preko bilo koje granice</div><div class="vg vgFast">🏍️ MOTOCIKL</div><div class="vg vgFast">TEŠKI TRICIKL</div><div class="vg vgFast">TEŠKI ČETVOROCIKL</div>
</div>
<table>
<tr><th>Vozilo</th><th>Točkovi</th><th>Brzina/motor</th></tr>
<tr><td><b>moped</b></td><td>2</td><td>do 45 km/h; motor sa unutrašnjim sagorevanjem do 50 cm³, električni do 4 kW</td></tr>
<tr><td><b>motocikl</b></td><td>2 (ili 3 asimetrična — sa bočnim sedištem)</td><td>preko 45 km/h, ili motor sa unutrašnjim sagorevanjem preko 50 cm³, ili električni preko 4 kW</td></tr>
<tr><td><b>laki tricikl</b></td><td>3</td><td>do 45 km/h; benzinski do 50 cm³, ostali motori do 4 kW</td></tr>
<tr><td><b>teški tricikl</b></td><td>3 (simetrična)</td><td>preko 45 km/h, ili benzinski preko 50 cm³, ili ostali motori preko 4 kW</td></tr>
<tr><td><b>laki četvorocikl</b></td><td>4</td><td>granice kao laki tricikl + masa praznog vozila do 350 kg (bez baterija)</td></tr>
<tr><td><b>teški četvorocikl</b></td><td>4</td><td>ostali četvorocikli: masa praznog vozila do 400 kg (teretni 550 kg; bez baterija), snaga do 15 kW</td></tr>
</table>
<p><b>Zamka:</b> granica od 50 cm³ kod mopeda i motocikla važi za SVAKI motor sa unutrašnjim sagorevanjem (i dizel!),
a samo kod tricikala i četvorocikala isključivo za benzinski — ostali se tamo cene po snazi (4 kW).
Moped sa motorom sa unutrašnjim sagorevanjem NEMA granicu snage: 5 kW efektivne, a i dalje je moped ako su brzina i kubikaža u granicama.</p>`,
  },
};

CARDS['prvenstvo-prolaza'] = {
  title: 'Prvenstvo prolaza, rotacije i hijerarhija znakova',
  html: `
<div class="kSek" data-sub="131">
<p><b>Hijerarhija (ZOBS čl. 20)</b> — redosled postupanja kada se značenja razlikuju:</p>
<svg viewBox="0 0 320 246" role="img" aria-label="Redosled prvenstva prolaza: 1. saobraćajac, 2. semafor, 3. saobraćajni znakovi, 4. oznake na kolovozu, 5. pravila (desna strana)" style="max-width:320px;width:100%;display:block;margin:6px auto">
  <rect x="60"   y="6"   width="200" height="40" rx="8" fill="#c0392b"/>
  <text x="160" y="31" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">1. SAOBRAĆAJAC</text>

  <rect x="47.5" y="52"  width="225" height="40" rx="8" fill="#8a5a00"/>
  <text x="160" y="77" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">2. SEMAFOR</text>

  <rect x="32.5" y="98"  width="255" height="40" rx="8" fill="#2c6aa0"/>
  <text x="160" y="123" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">3. SAOBRAĆAJNI ZNAKOVI</text>

  <rect x="20"   y="144" width="280" height="40" rx="8" fill="#64748b"/>
  <text x="160" y="169" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">4. OZNAKE NA KOLOVOZU</text>

  <rect x="7"    y="190" width="306" height="50" rx="8" fill="#94a3b8"/>
  <text x="160" y="211" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">5. PRAVILA</text>
  <text x="160" y="230" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">(desna strana...)</text>
</svg>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">Prati viši nalog kada se razlikuje od nižeg. Pravila koja nisu njime drugačije uređena i dalje važe.</p>
</div>
<div class="kSek" data-sub="148">
<div class="signRow" style="max-width:340px;margin:6px auto">
  <div class="signCell">
    <svg viewBox="0 0 120 46"><rect x="10" y="26" width="100" height="14" rx="7" fill="#4a5a6a"/><circle cx="45" cy="18" r="12" fill="#c0392b"/><circle cx="75" cy="18" r="12" fill="#2c6aa0"/></svg>
    <span><b>POD PRATNJOM</b><br>crveno + plavo</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 46"><rect x="10" y="26" width="100" height="14" rx="7" fill="#4a5a6a"/><circle cx="60" cy="18" r="12" fill="#2c6aa0"/></svg>
    <span><b>PRAVO PRVENSTVA</b><br>samo plavo</span>
  </div>
</div>
<table>
<tr><th></th><th>Vozilo POD PRATNJOM</th><th>Vozilo SA PRAVOM PRVENSTVA</th></tr>
<tr><td><b>svetla</b></td><td><b>crveno + plavo</b> trepćuće (čl. 106)</td><td><b>plavo</b> trepćuće/rotaciono (čl. 108)</td></tr>
<tr><td><b>ko</b></td><td>vozila koja prati policija/vojska/BIA + samo policijsko/vojno vozilo kad daje te znake</td><td>policija, hitna pomoć, vatrogasci, vojska, BIA...</td></tr>
<tr><td><b>tvoja obaveza</b></td><td colspan="2">propusti ga, omogući mimoilaženje/preticanje, po potrebi se skloni ili zaustavi (čl. 107 i 109)</td></tr>
</table>
</div>
<div class="kSek" data-sub="131,148">
<p><b>Za test zapamti:</b> rotacija NE gasi semafor — na semaforizovanoj raskrsnici prvenstvo je „regulisano semaforom"; semafor „gasi" samo saobraćajac. Obaveza propuštanja važi kad te takvo vozilo susretne ili sustigne na putu.</p>
</div>
<div class="kSek" data-sub="136">
<p><b>A) Nesignalisana raskrsnica — pet pravila (čl. 47)</b><br>
Signalizacija određuje kome je prolaz dozvoljen. Među vozilima sa istovremenim pravom prolaza i dalje važe <b>pravila desne strane i levog skretanja</b>, uključujući kada im prolaz istovremeno dozvole semafor ili ovlašćeno lice (čl. 47 st. 6–8).</p>
<table>
<tr><th>Pravilo</th><th>Šta se stvarno pita</th></tr>
<tr><td><b>1. Tramvaj</b></td><td>Propuštaš ga u <b>SVIM slučajevima</b> — i kad ti dolazi <b>sleva</b>, i kad iz suprotnog smera skreće preko tvoje putanje. Ponuda „samo ako dolazi sa desne strane" je netačna. Zakon ima jedan izuzetak: ni tramvaj nema prednost kad preseca biciklističku stazu ili traku.</td></tr>
<tr><td><b>2. Desna strana</b></td><td>Propuštaš vozilo koje ti dolazi <b>zdesna</b> — i na raskrsnici i pri susretu sa drugim vozilom.</td></tr>
<tr><td><b>3. Levo skretanje</b></td><td>Kad skrećeš ulevo, propuštaš vozilo iz suprotnog smera koje <b>zadržava pravac ILI skreće udesno</b> — dakle oba. Zamka je ponuda koja ih razdvaja („onaj koji ide pravo ima prednost, a onaj koji skreće udesno nema"). Obrnuto važi isto: kad ti ideš pravo, a neko iz suprotnog smera skreće ulevo, prednost je tvoja.</td></tr>
<tr><td><b>4. Zemljani put</b></td><td>Kad se uključuješ sa zemljanog puta (ili sa površine na kojoj se ne vrši javni saobraćaj — dvorište, parking) na put sa savremenim kolovoznim zastorom, propuštaš <b>SVA</b> vozila, <b>i onda kad taj put nije znakom označen kao put sa prvenstvom</b>. Netačno: „samo motorna vozila", „samo kada je to određeno znakom".</td></tr>
<tr><td><b>5. Biciklistička staza i traka</b></td><td>Kad skretanjem presecaš stazu ili traku, propuštaš <b>sva</b> vozila koja se njome kreću — ne samo ona koja ti dolaze zdesna.</td></tr>
</table>
<p style="margin-top:12px"><b>Četiri od pet pravila iz ptičje perspektive</b> — zeleno ide prvo, crveno čeka; ti si uvek plavo vozilo dole. Crteži prikazuju raskrsnice bez signalizacije. Kada signalizacija drugačije uređuje prvenstvo, postupi po njoj. Pravilo levog skretanja primeni kad tebi i vozilu iz suprotnog smera istovremeno pripada pravo prolaza.</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 136"><rect x="0" y="34" width="120" height="44" fill="#9aa7b4"/><rect x="38" y="0" width="44" height="136" fill="#9aa7b4"/>
      <line x1="2" y1="56" x2="34" y2="56" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><line x1="86" y1="56" x2="118" y2="56" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/>
      <line x1="60" y1="2" x2="60" y2="30" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><line x1="60" y1="82" x2="60" y2="134" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/>
      <path d="M71 100 L71 40" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <g transform="translate(102 45) rotate(-90)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><path d="M84 45 L26 45 M34.10402392117409 41.085310192998925 L26 45 L34.10402392117409 48.914689807001075" stroke="#2e7d32" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(71 118) rotate(0)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><g transform="translate(71 88)"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g></svg>
    <b>DESNA STRANA</b><span>propuštaš vozilo koje ti dolazi zdesna — i na raskrsnici i pri prestrojavanju u istu traku</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 136"><rect x="0" y="34" width="120" height="44" fill="#9aa7b4"/><rect x="38" y="0" width="44" height="136" fill="#9aa7b4"/>
      <line x1="2" y1="56" x2="34" y2="56" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><line x1="86" y1="56" x2="118" y2="56" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/>
      <line x1="60" y1="2" x2="60" y2="30" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><line x1="60" y1="82" x2="60" y2="134" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/>
      <path d="M71 100 Q71 45 30 45" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <g transform="translate(49 16) rotate(180)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><path d="M49 36 L49 104 M45.085310192998925 95.89597607882591 L49 104 L52.914689807001075 95.89597607882591" stroke="#2e7d32" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M49 36 Q49 45 26 45 M32 40 L26 45 L32 50" stroke="#2e7d32" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(71 118) rotate(0)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><g transform="translate(71 88)"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g></svg>
    <b>LEVO SKRETANJE</b><span>iz suprotnog smera propuštaš i onog koji ide pravo (preseca ti putanju) i onog koji skreće udesno (ulazi u istu traku kao ti)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 136"><rect x="0" y="34" width="120" height="44" fill="#9aa7b4"/><rect x="38" y="0" width="44" height="136" fill="#9aa7b4"/>
      <line x1="2" y1="56" x2="34" y2="56" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><line x1="86" y1="56" x2="118" y2="56" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/>
      <line x1="60" y1="2" x2="60" y2="30" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><line x1="60" y1="82" x2="60" y2="134" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/>
      <line x1="0" y1="62" x2="120" y2="62" stroke="#7a8a99" stroke-width="1.5"/><line x1="0" y1="72" x2="120" y2="72" stroke="#7a8a99" stroke-width="1.5"/>
      <path d="M71 100 L71 40" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <rect x="-4" y="60" width="48" height="14" rx="3" fill="#c0392b"/><rect x="2" y="63" width="10" height="8" rx="1" fill="#eef3f7"/><rect x="16" y="63" width="10" height="8" rx="1" fill="#eef3f7"/><rect x="30" y="63" width="10" height="8" rx="1" fill="#eef3f7"/>
      <path d="M48 67 L106 67 M97.89597607882591 70.91468980700107 L106 67 L97.89597607882591 63.085310192998925" stroke="#2e7d32" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(71 118) rotate(0)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><g transform="translate(71 88)"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g></svg>
    <b>TRAMVAJ</b><span>propuštaš ga u svim slučajevima — „dolazi mi sleva" nije izgovor</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 136"><rect x="0" y="34" width="120" height="44" fill="#9aa7b4"/><rect x="38" y="78" width="44" height="58" fill="#e8dcc2"/>
      <g fill="#c9b892"><circle cx="46" cy="92" r="1.6"/><circle cx="58" cy="104" r="1.6"/><circle cx="76" cy="96" r="1.6"/><circle cx="44" cy="120" r="1.6"/><circle cx="56" cy="128" r="1.6"/><circle cx="78" cy="126" r="1.6"/><circle cx="66" cy="84" r="1.6"/></g>
      <line x1="2" y1="56" x2="118" y2="56" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/>
      <path d="M71 100 L71 50" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <g transform="translate(18 67) rotate(90)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><path d="M38 67 L108 67 M99.89597607882591 70.91468980700107 L108 67 L99.89597607882591 63.085310192998925" stroke="#2e7d32" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(102 45) rotate(-90)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><path d="M82 45 L12 45 M20.10402392117409 41.085310192998925 L12 45 L20.10402392117409 48.914689807001075" stroke="#2e7d32" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(71 118) rotate(0)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g><g transform="translate(71 88)"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g></svg>
    <b>ZEMLJANI PUT</b><span>sa zemlje (ili sa parkinga, iz dvorišta) na asfalt: propuštaš SVA vozila iz oba smera, i bez znaka</span>
  </div>
</div>
<p><b>Kako to izgleda na slici.</b> Na slici prvo proveri signalizaciju, zatim pravilo koje uređuje odnos sa konkretnim vozilom.</p>
<table>
<tr><th>Na slici vidiš</th><th>Tačan odgovor</th></tr>
<tr><td>Tramvaj ti dolazi <b>iz suprotnog smera, tvojim putem</b>, i skreće preko tvoje putanje — svejedno da li pored puta stoji žuti romb</td><td>Propuštaš <b>tramvaj</b>. Romb tu ne pomaže: i ti i tramvaj ste na istom putu sa prvenstvom</td></tr>
<tr><td>Tramvaj ti dolazi <b>sa poprečnog puta, sleva</b>, i nema nijednog znaka</td><td>Propuštaš <b>tramvaj</b> — „dolazi mi sleva" nije izgovor</td></tr>
<tr><td>Tramvaj je na <b>poprečnom</b> putu, a uz tvoj put stoji <b>žuti romb</b> (put sa prvenstvom, obično uz plavi znak pešačkog prelaza)</td><td>Prednost je <b>tvoja</b>, i u odnosu na tramvaj. To je ono „ako znakom nije drugačije određeno"</td></tr>
<tr><td>Tramvaj <b>i</b> putničko vozilo koje ti dolazi <b>zdesna</b>, bez ijednog znaka</td><td>Propuštaš <b>oba</b> (tramvaj po pravilu tramvaja, vozilo po pravilu desne strane)</td></tr>
<tr><td>Vozilo iz suprotnog smera skreće ulevo preko tvoje putanje, a ti ideš pravo (na slici tvoj semafor svetli zeleno)</td><td>Prednost je <b>tvoja</b> — pravilo levog skretanja važi i na semaforu, kad obojica istovremeno dobijete zeleno</td></tr>
<tr><td>Skrećeš udesno, a preko izlaza ide <b>biciklistički prelaz — dva reda belih kvadratića</b> (ne zebra), i bicikl mu prilazi</td><td>Propuštaš bicikl</td></tr>
<tr><td>Stojiš na <b>neasfaltiranom, zemljanom prilazu</b>; sleva bicikl, zdesna autobus</td><td>Propuštaš <b>oba</b> — vrsta vozila i strana ne menjaju ništa</td></tr>
<tr><td>Ispred tebe <b>trougao „ustupi prvenstvo"</b> (i beli trouglići na kolovozu) ili <b>STOP</b></td><td>Propuštaš <b>sve</b> — i bicikl sleva i taksi zdesna</td></tr>
</table>
<p><b>UPOZORENJE — vrsta vozila NE menja prvenstvo.</b> Traktor, autobus, kamion, bicikl: prvenstvo određuju samo <b>pravac</b> i <b>znak</b>. Kad ti traktor dolazi sa desne strane, tačan odgovor je „dužni ste da propustite oba vozila" — nikad „propustite putničko vozilo, a imate prvenstvo u odnosu na traktor". Ponude su namerno pisane tako da razdvajaju vozila po vrsti; ta razlika ne postoji. Isto važi i za bicikl: on nije „slabiji učesnik kome se ne daje prednost", nego vozilo kao i svako drugo.</p>
<p><b>Kružni tok: proveri znakove koji uređuju prvenstvo.</b> Plavi znak određuje kružni smer kretanja, ne prvenstvo. U #9987 uz njega stoji trougao „ustupi prvenstvo", pa propuštaš vozilo sleva. U #9991 na prikazanom prilazu nema znaka ustupanja prvenstva: imaš prednost prema vozilu sleva po pravilu desne strane, jer mu dolaziš zdesna (čl. 47).</p>
<p><b>Kad se svi blokiraju.</b> Postoji i pitanje sa četiri vozila gde svako ima prednost u odnosu na ono sa svoje leve strane, pa niko ne može prvi. Tačan odgovor nije „pokažite odlučnost i prvi prođite", nego: <b>vizuelnim kontaktom i odgovarajućim znakom rukom</b> omogući prolaz onom vozilu koje ima prednost u odnosu na treće, a sam propusti vozilo koje tebi dolazi zdesna.</p>
</div>

<div class="kSek" data-sub="148">
<p><b>B) Vozila pod pratnjom i sa pravom prvenstva — ono na čemu se pada</b><br>
Tabela iznad je „ko je ko". Ostatak podoblasti (najveće u pravilima, sa preko pedeset pitanja) pita dve stvari: <b>šta za njih prestaje da važi</b> i <b>kad ni oni nemaju prednost</b>.</p>
<p><b>Prvo pogledaj da li svetla GORE.</b> Bez uključenih posebnih znakova policijsko vozilo je obično vozilo i tačan odgovor je „nije vozilo pod pratnjom, ni vozilo sa pravom prvenstva prolaza". Na fotografijama se upaljena rampa vidi po <b>sjaju (oreolu)</b> oko lampi — ista slika sa ugašenom rampom daje suprotan odgovor. Na crtežima to su nacrtani bljesci oko vozila: <b>crveni + plavi = pod pratnjom</b>, <b>samo plavi = sa pravom prvenstva</b>, a <b>žuti bljesak je samo žmigavac</b> i ne znači ništa. Na slici sa tri vozila (dva policijska i vozilo hitne pomoći) vozilo sa prvenstvom prolaza je jedino ono kome plava svetla gore.</p>
<div class="signRow" style="max-width:340px;margin:6px auto">
  <div class="signCell">
    <svg viewBox="0 0 120 46"><circle cx="45" cy="18" r="19" fill="#c0392b" opacity=".3"/><circle cx="75" cy="18" r="19" fill="#2c6aa0" opacity=".3"/><rect x="10" y="26" width="100" height="14" rx="7" fill="#4a5a6a"/><circle cx="45" cy="18" r="12" fill="#c0392b"/><circle cx="75" cy="18" r="12" fill="#2c6aa0"/></svg>
    <span><b>SVETLA GORE</b><br>pod pratnjom / sa prvenstvom</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 46"><rect x="10" y="26" width="100" height="14" rx="7" fill="#4a5a6a"/><circle cx="45" cy="18" r="12" fill="#94a3b8"/><circle cx="75" cy="18" r="12" fill="#94a3b8"/></svg>
    <span><b>SVETLA NE GORE</b><br>obično vozilo</span>
  </div>
</div>
<table>
<tr><th>NE primenjuje se na njih (čl. 106 i 108)</th><th>I dalje ih obavezuje</th></tr>
<tr><td>ograničenje brzine<br>propuštanje pešaka<br>zabrana presecanja kolone pešaka<br>zabrana preticanja i obilaženja vozila</td><td>postupanje po svetlosnim saobraćajnim znakovima<br>dozvoljeni smer kretanja<br>upotreba svetala<br>i uvek: da ne ugroze bezbednost ostalih</td></tr>
</table>
<p class="mut">Leva kolona važi samo <b>pod uslovom da ne ugrožavaju bezbednost drugih učesnika u saobraćaju</b> — ta rečenica stoji u oba člana i u skoro svakom tačnom odgovoru. Vozač takvog vozila je i dalje dužan da vodi računa o bezbednosti ostalih, a ne o „efikasnosti izvršenja zadatka".</p>
<p><b>Iste slike, jedina razlika je rotacija.</b> Policijsko vozilo u naselju (znak sa crnom siluetom grada pored puta) sa upaljenom rotacijom <b>sme</b> da se kreće brže od 50 km/h, tako da ne ugrožava druge; isto vozilo sa ugašenom rampom <b>ne sme</b>. Na pešačkom prelazu, sa upaljenim znacima <b>ne mora</b> da propusti pešaka (pod uslovom da ga ne ugrožava), a bez znakova <b>mora</b>. Preko pune razdelne linije, sa upaljenom plavom rotacijom preticanje <b>jeste</b> dozvoljeno, a kad gori samo žmigavac <b>nije</b>.</p>
<p><b>Kad ni oni nemaju prednost.</b></p>
<table>
<tr><th>Raskrsnicom upravlja</th><th>Tačan odgovor</th></tr>
<tr><td>Semafor</td><td>„prvenstvo prolaza je regulisano semaforom"</td></tr>
<tr><td>Policajac</td><td>„prvenstvo prolaza je regulisano znakovima koje daje policijski službenik" — i kad iza njega stoji vozilo sa upaljenom rotacijom</td></tr>
<tr><td>Saobraćajni znakovi i oznake na kolovozu</td><td>vozilo pod pratnjom / sa prvenstvom <b>ima</b> prednost — čak i kad na njegovom prilazu stoji STOP, a na poprečnom putu žuti romb</td></tr>
<tr><td>Samo pravila saobraćaja</td><td>vozilo <b>ima</b> prednost; zamka je ponuda „prednost ima žuto vozilo, po pravilu desne strane"</td></tr>
</table>
<p>Međusobno: <b>vozilo pod pratnjom ima prednost u odnosu na vozilo sa prvenstvom prolaza</b>. A kad se sretnu dva ista (dva vozila sa upaljenom rotacijom), njihovo međusobno prvenstvo rešava se po <b>opštim odredbama o prvenstvu prolaza</b> — dakle celom lestvicom: prvo policajac i semafor, pa <b>znakovi i oznake na kolovozu</b> (STOP, žuti romb, linija zaustavljanja); među vozilima kojima je istovremeno dozvoljen prolaz primenjuju se desna strana i levo skretanje (čl. 47). <span class="mut">Baza to proverava parovima skoro istih slika: bez ijednog znaka odlučuje desna strana, a čim se pojavi linija zaustavljanja ili STOP pred jednim vozilom — prednost ima drugo.</span></p>
<p><b>Samo svetla, bez sirene.</b> Pravilo je davanje i zvučnih i svetlosnih znakova. Vozilo <b>pod pratnjom</b> sme bez sirene ako su omogućene dovoljna vidljivost vozila i bezbednost učesnika i ako ne prekoračuje dozvoljenu brzinu (čl. 106 st. 3; #10569). Za vozilo <b>sa prvenstvom prolaza</b> važi i dodatni uslov: sirena bi onemogućila ili omela uspešno izvršenje službenog zadatka (čl. 108 st. 4; #10585). Samo mesto vožnje — u naselju ili van njega — nije jedan od tih uslova.</p>
<p><b>Uređaji za posebne znake</b> ugrađuju se samo na zakonom određenim vozilima. Za pratnju: na vozilima policije, Bezbednosno-informativne agencije, Vojske Srbije i Vojno-bezbednosne agencije namenjenim pratnji (čl. 106 st. 1 i 5). Za prvenstvo prolaza zakon obuhvata i vozila hitne medicinske pomoći i vatrogasne službe, kao i vozila ministarstva nadležnog za izvršenje zavodskih sankcija kada prevoze lica lišena slobode (čl. 108 st. 1, 2 i 5). Dozvola ili naknadno ispitivanje sami po sebi ne proširuju taj krug vozila. Uređaji se upotrebljavaju samo dok se vrši pratnja, odnosno kada je to neophodno za efikasno i bezbedno izvršenje službene radnje koja ne trpi odlaganje.</p>
<p><b>Pri susretu sa ovim vozilima (čl. 107 i 109):</b> propusti ta vozila, omogući im mimoilaženje i preticanje odnosno obilaženje, <b>po potrebi</b> zaustavi vozilo i <b>po potrebi</b> ga pomeri sa kolovoza, pridržavaj se naredbi lica iz pratnje i kreni tek kad prođu <b>sva</b> vozila. Obaveza postupanja po naređenjima ostaje; posebna zaustavljanja uz policijsko vozilo iz čl. 110 prikazana su u tabeli ispod (#10383, #10384). Kad vozilo sa prvenstvom obezbeđuje prolaz koloni iza sebe, prema celoj toj koloni postupaš kao prema vozilima sa prvenstvom — a ne tako što joj se i sam priključiš. I obrnuta zamka: preticanje <b>pojedinačnog</b> vozila sa prvenstvom prolaza jeste dozvoljeno, ako policijski službenik iz vozila ne daje druge znake i naredbe; <b>kolonu</b> vozila pod pratnjom ne smeš da pretičeš.</p>
<p><b>Policija i naizmenična duga svetla (čl. 110) — dve situacije koje se lako pobrkaju:</b></p>
<table>
<tr><th>Gde si ti</th><th>Šta moraš</th></tr>
<tr><td>Policijsko vozilo je <b>iza tebe</b>, uz rotaciju daje i svetlosni znak upozorenja (uzastopno ili naizmenično uključivanje dugih svetala)</td><td><b>Odmah bezbedno zaustavi</b> vozilo uz desnu ivicu kolovoza, po mogućnosti van kolovoza. Nije dovoljno usporiti niti se samo pomeriti udesno da bi ga propustio</td></tr>
<tr><td>Ti se krećeš <b>neposredno iza</b> policijskog vozila koje daje posebne znake i iz kojeg policajac daje naredbe</td><td>Postupi po znacima i naredbama, <b>prati policijsko vozilo do pogodnog mesta</b> i bezbedno stani <b>iza njega</b>. Ne staješ odmah i ne uklanjaš vozilo sa kolovoza</td></tr>
</table>
<p class="mut">Mnemonik: <b>policija iza tebe — ti staješ desno; policija ispred tebe — ti je pratiš i staješ iza nje.</b></p>
</div>
`,
};

CARDS['brzine'] = {
  title: 'Ograničenja brzine (50-80-100-130)',
  html: `
<svg viewBox="0 0 320 300" role="img" aria-label="Opšta ograničenja: u naselju 50; izvan naselja 80 na ostalim putevima, 100 na motoputu, 130 na autoputu." style="max-width:320px;width:100%;display:block;margin:6px auto">
  <g>
    <circle cx="48" cy="44" r="30" fill="#fff" stroke="#c0392b" stroke-width="8"/>
    <text x="48" y="52" text-anchor="middle" font-size="23" font-weight="bold" fill="#111">50</text>
    <text x="94" y="42" font-size="14" font-weight="bold" fill="currentColor">NASELJE</text>
    <rect x="94" y="52" width="75" height="7" rx="3" fill="currentColor" opacity="0.35"/>
  </g>
  <g>
    <circle cx="48" cy="116" r="30" fill="#fff" stroke="#c0392b" stroke-width="8"/>
    <text x="48" y="124" text-anchor="middle" font-size="23" font-weight="bold" fill="#111">80</text>
    <text x="94" y="114" font-size="14" font-weight="bold" fill="currentColor">OSTALI PUTEVI</text>
    <rect x="94" y="124" width="121" height="7" rx="3" fill="currentColor" opacity="0.35"/>
  </g>
  <g>
    <circle cx="48" cy="188" r="30" fill="#fff" stroke="#c0392b" stroke-width="8"/>
    <text x="48" y="196" text-anchor="middle" font-size="23" font-weight="bold" fill="#111">100</text>
    <text x="94" y="186" font-size="14" font-weight="bold" fill="currentColor">MOTOPUT</text>
    <rect x="94" y="196" width="151" height="7" rx="3" fill="currentColor" opacity="0.35"/>
  </g>
  <g>
    <circle cx="48" cy="260" r="30" fill="#fff" stroke="#c0392b" stroke-width="8"/>
    <text x="48" y="268" text-anchor="middle" font-size="23" font-weight="bold" fill="#111">130</text>
    <text x="94" y="258" font-size="14" font-weight="bold" fill="currentColor">AUTOPUT</text>
    <rect x="94" y="268" width="196" height="7" rx="3" fill="currentColor" opacity="0.35"/>
  </g>
</svg>
<p><b>Opšta ograničenja:</b> u naselju 50 km/h (čl. 43); izvan naselja 80 na ostalim putevima, 100 na motoputu i 130 na autoputu (čl. 44). Pamti <b>50 → 80 → 100 → 130</b> uz odgovarajuću vrstu puta.</p>
<p><b>Proveri znak i zakonsko ograničenje.</b> U naselju znak može odrediti niže ograničenje ili, kada uslovi puta dopuštaju, najviše 80 km/h (čl. 43). Izvan naselja uporedi znak sa ograničenjem za vrstu puta i primeni strože (čl. 20 st. 6 i čl. 44). Proveri i posebna ograničenja za konkretno vozilo i vozača (čl. 20 st. 6–7).</p>
<p><b>Čemu se brzina prilagođava (čl. 42):</b> osobinama i stanju PUTA, VIDLJIVOSTI, preglednosti, ATMOSFERSKIM prilikama, stanju VOZILA i tereta, GUSTINI saobraćaja — tako da možeš da staneš pred svakom preprekom koju vidiš ili imaš razloga da predvidiš.</p>
<p><b>U #10488 i #10489</b> biraju se uslovi vožnje iz čl. 42; ponuđeni raspoloživo vreme, žurba i udobnost ne zamenjuju te uslove.</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<div class="kPodH"><b class="kPodNaslov">Ograničenje brzine: pročitaj značenje znaka</b>
<svg viewBox="0 0 320 178" style="max-width:320px;width:100%;display:block;margin:6px auto" role="img" aria-label="Ograničenje brzine: pročitaj znak i primeni odgovarajuća zakonska pravila. U naselju znak može dozvoliti do 80 km/h; posebna stroža ograničenja ostaju važeća.">
  <rect x="6" y="4" width="308" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="160" y="24" text-anchor="middle" font-size="12" fill="currentColor">Koliko je dozvoljeno?</text>
  <line x1="160" y1="34" x2="160" y2="46" stroke="currentColor" stroke-width="2"/>
  <rect x="48" y="46" width="224" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="160" y="66" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">znak ograničenja brzine?</text>
  <path d="M160 76L160 88M80 88L240 88M80 88L80 106M240 88L240 106" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="96" y="103" font-size="12" font-weight="bold" fill="currentColor">DA</text>
  <text x="224" y="103" text-anchor="end" font-size="12" font-weight="bold" fill="currentColor">NE</text>
  <rect x="6" y="106" width="148" height="62" rx="6" fill="none" stroke="#1f7a3f" stroke-width="2"/>
  <text x="80" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">znak + važeća pravila</text>
  <text x="80" y="154" text-anchor="middle" font-size="11.5" fill="currentColor">uključi i izuzetke</text>
  <rect x="166" y="106" width="148" height="62" rx="6" fill="none" stroke="#2c6aa0" stroke-width="2"/>
  <text x="240" y="132" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">pročitaj značenje</text>
  <text x="240" y="154" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">primeni pravila</text>
</svg>
<svg viewBox="0 0 320 172" style="max-width:320px;width:100%;display:block;margin:6px auto" role="img" aria-label="Primeri: 40 km/h u naselju; 80 km/h u naselju kada je dozvoljeno znakom; 60 km/h na motoputu.">
  <text x="160" y="16" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">PRIMERI OGRANIČENJA BRZINE</text>
  <g fill="#fff" stroke="#c0392b" stroke-width="5"><circle cx="40" cy="54" r="21"/><circle cx="40" cy="98" r="21"/><circle cx="40" cy="142" r="21"/></g>
  <text x="40" y="61" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">40</text>
  <text x="40" y="105" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">80</text>
  <text x="40" y="149" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">60</text>
  <text x="76" y="60" font-size="12.5" fill="currentColor">ispod opšteg pravila</text>
  <text x="76" y="104" font-size="12.5" fill="currentColor">iznad njega, u naselju</text>
  <text x="76" y="148" font-size="12.5" fill="currentColor">tamo gde bi bilo 100</text>
</svg>
<svg viewBox="0 0 320 152" style="max-width:320px;width:100%;display:block;margin:6px auto" role="img" aria-label="Znak naselje i znak završetak naselja. U prikazanim primerima bez drugog ograničenja: 50 km/h u naselju, 80 km/h na ostalom putu izvan naselja.">
  <text x="160" y="16" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">ZNAK BEZ BROJA → čitaš značenje</text>
  <rect x="8" y="34" width="54" height="38" rx="3" fill="#fff" stroke="#111" stroke-width="1.5"/>
  <g fill="#111"><path d="M14 66L14 54L22 47L30 54L30 66Z"/><rect x="34" y="52" width="10" height="14"/><rect x="47" y="57" width="8" height="9"/></g>
  <path d="M70 53L92 53M86 48L92 53L86 58" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="100" y="61" font-size="18" font-weight="bold" fill="currentColor">50</text>
  <text x="130" y="58" font-size="12" fill="currentColor">ulazak u naselje</text>
  <rect x="8" y="93" width="54" height="38" rx="3" fill="#fff" stroke="#111" stroke-width="1.5"/>
  <g fill="#111"><path d="M14 125L14 113L22 106L30 113L30 125Z"/><rect x="34" y="111" width="10" height="14"/><rect x="47" y="116" width="8" height="9"/></g>
  <line x1="10" y1="129" x2="60" y2="95" stroke="#c0392b" stroke-width="3"/>
  <path d="M70 112L92 112M86 107L92 112L86 117" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="100" y="120" font-size="18" font-weight="bold" fill="currentColor">80</text>
  <text x="130" y="111" font-size="12" fill="currentColor">prestanak naselja</text>
  <text x="130" y="127" font-size="11.5" fill="currentColor">put koji nije auto/motoput</text>
</svg>
<p><b>Prepoznaj konkretan znak.</b> U #9946, #9947 i #9949 znak ograničava brzinu na 40, 80 i 60 km/h. U #9878 i #9948 znak označava početak odnosno završetak naselja. U #9908 označava završetak motoputa, pa se primenjuje ograničenje za put kojim nastavljaš.</p>
<table>
<tr><th>Šta znak kaže</th><th>Koliko smeš</th></tr>
<tr><td>broj 40 uz ulazak u naselje</td><td><b>40</b> — znak obara opštih 50 (#9946)</td></tr>
<tr><td>broj 80 uz ulazak u naselje</td><td><b>80</b> — znakom sme da se dozvoli i više od 50, kada put to omogućava (#9947, čl. 43 st. 2)</td></tr>
<tr><td>broj 60 na putu za motorna vozila</td><td><b>60</b>, a ne opštih 100 (#9949)</td></tr>
<tr><td>završetak motoputa, bez broja na znaku</td><td><b>80</b> — u prikazanoj situaciji nastavljaš ostalim putem izvan naselja (#9908, čl. 44)</td></tr>
<tr><td>ulazak u naselje, bez broja</td><td><b>50</b> — opšte ograničenje u naselju (#9878, čl. 43)</td></tr>
<tr><td>prestanak naselja, bez broja</td><td><b>80</b> na putu koji nije ni autoput ni motoput (#9948, čl. 44)</td></tr>
</table>
<p>Proveri i navedeno vozilo: #9946 obuhvata moped i motocikl; #9947 i #9949 pitaju za motocikl.</p>
</div>
<div class="kPodH"><b class="kPodNaslov">Kad pitanje traži da PRILAGODIŠ brzinu (čl. 42)</b>
<svg viewBox="0 0 320 175" role="img" aria-label="Prilagođena brzina omogućava zaustavljanje pre prepreke koju vozač može da vidi ili ima razloga da predvidi." style="max-width:320px;width:100%;display:block;margin:6px auto">
  <text x="160" y="18" text-anchor="middle" font-size="13" fill="currentColor">koliko VIDIŠ ili imaš razloga</text>
  <text x="160" y="39" text-anchor="middle" font-size="13" fill="currentColor">da PREDVIDIŠ</text>
  <g stroke="currentColor" stroke-width="2" fill="none">
    <line x1="34" y1="56" x2="298" y2="56"/>
    <line x1="34" y1="49" x2="34" y2="63"/>
    <line x1="298" y1="49" x2="298" y2="63"/>
  </g>
  <g stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4">
    <line x1="34" y1="63" x2="34" y2="112"/>
    <line x1="298" y1="63" x2="298" y2="84"/>
  </g>
  <g stroke="currentColor" stroke-width="3" fill="none">
    <line x1="34" y1="78" x2="232" y2="78"/>
    <line x1="34" y1="71" x2="34" y2="85"/>
    <line x1="232" y1="71" x2="232" y2="85"/>
  </g>
  <text x="133" y="101" text-anchor="middle" font-size="13" font-weight="bold" fill="currentColor">staješ PRE prepreke</text>
  <rect x="0" y="112" width="320" height="34" fill="none"/>
  <g fill="none" stroke="currentColor" stroke-width="2.5">
    <circle cx="26" cy="132" r="8"/>
    <circle cx="56" cy="132" r="8"/>
    <path d="M26 132L38 118L56 132"/>
    <path d="M34 120L46 120"/>
    <path d="M38 118L44 110"/>
  </g>
  <rect x="284" y="84" width="26" height="28" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="313" y="162" text-anchor="end" font-size="13" font-weight="bold" fill="currentColor">PREPREKA</text>
</svg>
<p><b>Prilagođena brzina</b> mora omogućiti blagovremeno zaustavljanje pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš. To može zahtevati vožnju sporiju od najveće dozvoljene brzine. U #9870 (magla) i #9873 (oštećen kolovoz) ponuđeni brojevi i procenat ne zamenjuju taj uslov (čl. 42).</p>
<p><b>U ovim primerima razlikuj uslove vožnje i potreban ishod:</b></p>
<ul>
<li><b>„…prilagodi TAKO DA…"</b> → tačno je ono što opisuje ISHOD: da vozilo blagovremeno zaustaviš pred preprekom (#9868, #9870, #9873), da ne ugrožavaš bezbednost saobraćaja (#9868), da ne ugrožavaš sebe i druge učesnike u saobraćaju (#9873).</li>
<li><b>„…prilagodi:"</b> pa spisak → tačno je ono što je USLOV vožnje: osobine i stanje puta, vidljivost i preglednost, stanje vozila i tereta (#10488), atmosferske prilike, gustina saobraćaja i drugi saobraćajni uslovi (#10489).</li>
</ul>
<svg viewBox="0 0 320 196" style="max-width:320px;width:100%;display:block;margin:6px auto" role="img" aria-label="U ovim primerima razlikuju se uslovi vožnje od ishoda: blagovremeno zaustavljanje pred preprekom i bezbedno upravljanje.">
  <rect x="6" y="4" width="308" height="80" rx="6" fill="none" stroke="#1f7a3f" stroke-width="2"/>
  <text x="160" y="25" text-anchor="middle" font-size="12.5" font-weight="bold" fill="currentColor">„…prilagodi TAKO DA…"</text>
  <text x="160" y="46" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">odgovor opisuje ISHOD</text>
  <text x="160" y="64" text-anchor="middle" font-size="11.5" fill="currentColor">zaustaviš pred preprekom</text>
  <text x="160" y="79" text-anchor="middle" font-size="11.5" fill="currentColor">ne ugrožavaš sebe ni druge</text>
  <rect x="6" y="94" width="308" height="96" rx="6" fill="none" stroke="#2c6aa0" stroke-width="2"/>
  <text x="160" y="115" text-anchor="middle" font-size="12.5" font-weight="bold" fill="currentColor">„…prilagodi:" pa spisak</text>
  <text x="160" y="136" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">odgovor je USLOV vožnje</text>
  <text x="160" y="154" text-anchor="middle" font-size="11.5" fill="currentColor">stanje puta · vidljivost i preglednost</text>
  <text x="160" y="169" text-anchor="middle" font-size="11.5" fill="currentColor">stanje vozila i tereta · atmosferske prilike</text>
  <text x="160" y="184" text-anchor="middle" font-size="11.5" fill="currentColor">gustina saobraćaja i drugi uslovi</text>
</svg><p><b>Ne broji kvačice:</b> tačnih odgovora nema uvek isto — u #9870 tačan je samo jedan, u #9868, #9873 i #10489 po dva, u #10488 tri. Svaku ponudu ceni zasebno.</p>
<p class="mut">Nabrajanje uslova iz čl. 42 nije kontrolna lista: poslednja stavka i sama glasi „gustini saobraćaja i drugim saobraćajnim uslovima" (#10489), a tačan ume da bude i odgovor koji uopšte nije uslov, nego ishod (#9868, #9873).</p>
<table>
<tr><th>Ponuđeno u ovim pitanjima</th><th>Vredi?</th></tr>
<tr><td>da ne ugrožavaš bezbednost saobraćaja</td><td><b>TAČNO</b> (#9868)</td></tr>
<tr><td>da ne ugrožavaš sebe i druge učesnike</td><td><b>TAČNO</b> (#9873)</td></tr>
<tr><td>smeš da ometaš, samo ne da ugroziš</td><td>netačno (#9868)</td></tr>
<tr><td>najmanje 20% manje od dozvoljene</td><td>netačno (#9870, #9873)</td></tr>
<tr><td>najviše 60 km/h · najviše 80 km/h</td><td>netačno (#9870, #9873)</td></tr>
<tr><td>prema vozilima koja se najbrže kreću</td><td>netačno (#10488)</td></tr>
</table>
<p class="mut">Svaki ponuđeni odgovor proceni prema situaciji i pravilu, ne samo prema formulaciji pitanja.</p>
</div>
`,
};



CARDS['zamke-odgovori'] = {
  title: 'Zamke u ponuđenim odgovorima',
  html: `
<p><b>Zakon ne poznaje "malo sme".</b> Odgovori koji UBLAŽAVAJU obavezu su gotovo uvek netačni — izmereno na celoj bazi:</p>
<table>
<tr><th>Obrazac u odgovoru</th><th>Tačan u bazi</th></tr>
<tr><td>"na kratkom delu puta"</td><td>0 od 3</td></tr>
<tr><td>"raspoloživom vremenu" / "udobnost"</td><td>0 od 3</td></tr>
<tr><td>"ako time ne ometa, odnosno ne ugrožava druge" (kao izgovor za zabranjeno)</td><td>0 od 3</td></tr>
<tr><td>"što pre (stigne)"</td><td>1 od 9</td></tr>
<tr><td>"uz povećanu opreznost"</td><td>2 od 16</td></tr>
</table>
<p><b>Zabrana naspram dozvole:</b> "nije dozvoljeno" je tačno u 84% svojih pojavljivanja, a "je dozvoljeno" u samo 22% — kad dvoumiš, zakon je verovatno STROŽIJI nego što misliš.</p>
<p><b>Brojevi-mamci</b> — vrednosti koje se u ponuđenim odgovorima pojavljuju više puta, a NIJEDNOM nisu tačne (izmereno na celoj trenutnoj bazi):</p>
<table>
<tr><th>Tema</th><th>Mamac</th><th>Koliko puta ponuđen</th></tr>
<tr><td>Brzina</td><td><b>120 km/h</b> · <b>20 km/h</b></td><td>7× · 4×</td></tr>
<tr><td>Rastojanje</td><td><b>250 m</b> · <b>1 m</b> · <b>0,5 m</b></td><td>7× · 4× · 5×</td></tr>
<tr><td>Novčane kazne</td><td><b>10.000</b> · <b>50.000 dinara</b></td><td>8× · 7×</td></tr>
<tr><td>Kazneni poeni</td><td><b>10 poena</b></td><td>8×</td></tr>
<tr><td>Rokovi</td><td><b>24 sata/časa</b></td><td>8×</td></tr>
</table>
<p><b>Večiti tekst-mamci</b> (nikad tačni u bazi): "potvrdu pravca kretanja posle prolaska raskrsnice" — mamac SAMO kod pitanja o POKAZIVAČIMA PRAVCA (11×: žmigavac se isključuje kad završiš radnju). Pažnja: znak obaveštenja „Potvrda pravca" POSTOJI — kod pitanja #9176 to je tačan odgovor · "put sa jednosmernim saobraćajem" kao opis autoputa/motoputa (10×) · "laki tricikl" (9×) · "imate prednost u odnosu na oba vozila" (5×).</p>
<p class="mut"><b>Važno:</b> ovo su tendencije za proveru intuicije, NE pravila za slepo zaokruživanje — izuzeci postoje ("uz povećanu opreznost" je 2 puta tačno!). Prvo znanje, pa tek onda ovaj filter.</p>`,
};

CARDS['nezgoda'] = {
  title: 'Postupak kod saobraćajne nezgode',
  html: `
<div class="vgrid" style="grid-template-columns:1fr 1fr">
  <div class="vg vgFast"><b>SA POVREĐENIMA</b></div><div class="vg vgSlow"><b>SAMO MANJA ŠTETA</b></div>
  <div class="vg" style="text-align:left">1. Zaustavi se i OSTANI do kraja uviđaja<br>2. Pomozi povređenima (po svom znanju i mogućnostima)<br>3. Obavesti policiju/hitnu pomoć<br>4. Obezbedi tragove (ako time ne ugrožavaš bezbednost), spreči nove nezgode, upozori druge<br>5. Vozila se NE pomeraju do uviđaja</div>
  <div class="vg" style="text-align:left">1. Skloni vozilo sa kolovoza ako smeta<br>2. Upozori ostale učesnike<br>3. Razmeni podatke sa drugim učesnikom<br>4. Popunite Evropski izveštaj o nezgodi<br>5. Ako oštećeni nije tu: ostavi podatke i obavesti policiju<br>6. Svako može tražiti da policija izađe na uviđaj</div>
</div>
<p><b>Udaljiti se sa mesta nezgode sa povređenima smeš SAMO:</b> ako je tebi neophodna hitna pomoć, radi prevoza povređenog do zdravstvene ustanove, ili da bi obavestio policiju — pa se vraćaš. (ZOBS čl. 167-172)</p>
<p><b>Još tri činjenice koje test voli:</b> davanje krvi/urina na uviđaju je OBAVEZNO · fotografisanje na uviđaju bez poginulih/povređenih je obavezno · oduzete tablice se vraćaju kad dostaviš dokaz da je vozilo tehnički ispravno.</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<div class="kPodH"><b class="kPodNaslov">Sat nezgode — dokle šta važi</b>
<div style="display:flex;justify-content:center;margin:6px 0"><svg viewBox="0 0 306 246" style="max-width:340px;width:100%" role="img" aria-label="traka vremena od nastanka nezgode do završetka uviđaja: zabrana alkohola i psihoaktivnih supstanci važi celo vreme, za svakog učesnika i bez uslova; kod povređenih, poginulih ili velike štete ostaješ na mestu do kraja uviđaja; kod manje štete ostaješ samo ako je neko zahtevao uviđaj"><text x="153" y="16" font-size="12" text-anchor="middle" fill="currentColor">ne uzimaš alkohol ni psihoaktivne supstance</text><text x="153" y="34" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity=".7">svaki učesnik, u svakoj nezgodi — bez uslova</text><rect x="34" y="42" width="210" height="16" rx="4" fill="#c0392b" fill-opacity=".12" stroke="#c0392b" stroke-width="2"/><text x="153" y="82" font-size="12" text-anchor="middle" fill="currentColor">ostaješ na mestu nezgode do kraja uviđaja</text><text x="153" y="100" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity=".7">ako ima povređenih, poginulih ili velike štete</text><rect x="34" y="108" width="210" height="16" rx="4" fill="#c0392b" fill-opacity=".12" stroke="#c0392b" stroke-width="2"/><text x="153" y="148" font-size="12" text-anchor="middle" fill="currentColor">ostaješ do kraja uviđaja</text><text x="153" y="166" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity=".7">samo ako je neko zahtevao uviđaj — manja šteta</text><rect x="34" y="174" width="210" height="16" rx="4" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="7 5"/><line x1="6" y1="214" x2="288" y2="214" stroke="currentColor" stroke-width="2"/><path d="M282 208 L298 214 L282 220 Z" fill="currentColor"/><line x1="34" y1="206" x2="34" y2="222" stroke="currentColor" stroke-width="2"/><line x1="244" y1="206" x2="244" y2="222" stroke="currentColor" stroke-width="2"/><text x="34" y="236" font-size="12" text-anchor="middle" fill="currentColor">NEZGODA</text><text x="139" y="236" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity=".6">uviđaj traje</text><text x="244" y="236" font-size="12" text-anchor="middle" fill="currentColor">KRAJ UVIĐAJA</text></svg></div>
<div style="display:flex;justify-content:center;margin:6px 0"><svg viewBox="0 0 306 130" style="max-width:340px;width:100%" role="img" aria-label="posle završenog uviđaja kolovoz se oslobađa: levo kolovoz sa vozilom i rasutim materijalom, desno slobodan kolovoz"><text x="69" y="26" font-size="12" text-anchor="middle" fill="currentColor">rasuto po kolovozu</text><text x="240" y="26" font-size="12" text-anchor="middle" fill="currentColor">kolovoz slobodan</text><rect x="6" y="36" width="126" height="46" fill="#9aa7b4" fill-opacity=".45"/><rect x="16" y="48" width="42" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="76" cy="56" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="92" cy="72" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="118" cy="52" r="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="98" y="60" width="14" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="140" y1="59" x2="156" y2="59" stroke="currentColor" stroke-width="2"/><path d="M154 53 L170 59 L154 65 Z" fill="currentColor"/><rect x="178" y="36" width="122" height="46" fill="#9aa7b4" fill-opacity=".45"/><path d="M222 60 L234 72 L258 46" fill="none" stroke="#1f7a3f" stroke-width="3"/><text x="153" y="102" font-size="12" text-anchor="middle" fill="currentColor">posle uviđaja uklanjaš bez odlaganja</text><text x="153" y="122" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity=".7">nema uslova „ako je vozilo u voznom stanju“</text></svg></div>
<ul>
<li><b>Alkohol — bez ijednog uslova.</b> Od nastanka saobraćajne nezgode do završetka uviđaja učesnicima nije dozvoljeno uzimanje alkoholnih pića, odnosno psihoaktivnih supstanci (čl. 174). Zabrana ne čeka da ti je saopšti lice koje vrši uviđaj i ne pada time što je ispitivanje već sprovedeno.</li>
<li><b>Povređeni, poginuli ili velika materijalna šteta:</b> obavesti policiju i <b>ostani</b> na mestu nezgode do dolaska policije i završetka uviđaja (čl. 168).</li>
<li><b>Samo manja materijalna šteta:</b> bilo koji učesnik ili lice koje je pretrpelo štetu <b>može</b> zahtevati da policijski službenik izađe i izvrši uviđaj — saglasnost ostalih se za taj zahtev ne traži (čl. 171). Ako je neko to zahtevao, ostali su dužni da ostanu do završetka uviđaja (čl. 171 st. 2).</li>
<li><b>Posle uviđaja:</b> bez odlaganja ukloni sa kolovoza vozilo, teret, stvari ili drugi materijal rasut po putu (čl. 177).</li>
</ul>
<p class="mut">Pamtilica: šest pitanja počinje istim stemom — „telesne povrede, odnosno poginulo, <b>ili je nastala velika materijalna šteta</b>". Velika šteta bez ijednog povređenog ide u isti režim kao nezgoda sa povređenima, ne u manju štetu.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Kolovoz: šta ostaje, šta se sklanja</b>
<div style="display:flex;justify-content:center;margin:6px 0"><svg viewBox="0 0 306 218" style="max-width:340px;width:100%" role="img" aria-label="nezgoda sa povređenima, poginulima ili velikom materijalnom štetom: vozila ostaju na kolovozu, tragove obezbeđuješ ako time ne ugrožavaš bezbednost saobraćaja, a ljude upozoravaš da se sklone sa kolovoza"><text x="153" y="16" font-size="12.5" font-weight="bold" text-anchor="middle" fill="currentColor">POVREĐENI, POGINULI</text><text x="153" y="36" font-size="12.5" font-weight="bold" text-anchor="middle" fill="currentColor">ILI VELIKA MATERIJALNA ŠTETA</text><circle cx="230" cy="52" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M230 57 L230 68 M222 61 L238 61 M230 68 L224 78 M230 68 L236 78" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="262" cy="52" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M262 57 L262 68 M254 61 L270 61 M262 68 L256 78 M262 68 L268 78" fill="none" stroke="currentColor" stroke-width="2"/><rect x="6" y="86" width="294" height="52" fill="#9aa7b4" fill-opacity=".45"/><line x1="6" y1="112" x2="300" y2="112" stroke="currentColor" stroke-opacity=".45" stroke-width="2" stroke-dasharray="10 8"/><rect x="44" y="98" width="46" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><g transform="rotate(18 110 109)"><rect x="110" y="98" width="46" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="2"/></g><line x1="10" y1="124" x2="38" y2="118" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/><line x1="10" y1="134" x2="38" y2="128" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/><text x="26" y="152" font-size="12" text-anchor="middle" fill="currentColor">tragovi</text><path d="M198 98 L216 84" fill="none" stroke="currentColor" stroke-width="2"/><path d="M224 78 L218 89 L212 81 Z" fill="currentColor"/><text x="153" y="174" font-size="12" text-anchor="middle" fill="currentColor">vozila stoje · ljudi se sklanjaju sa kolovoza</text><text x="153" y="192" font-size="12" text-anchor="middle" fill="currentColor">tragove obezbeđuješ AKO time ne ugrožavaš</text><text x="153" y="210" font-size="12" text-anchor="middle" fill="currentColor">bezbednost saobraćaja</text></svg></div>
<div style="display:flex;justify-content:center;margin:6px 0"><svg viewBox="0 0 306 186" style="max-width:340px;width:100%" role="img" aria-label="nezgoda sa samo manjom materijalnom štetom: vozila se sklanjaju sa kolovoza ako smetaju saobraćaju ili preti opasnost od novih nezgoda, a učesnici popunjavaju Evropski izveštaj"><text x="153" y="16" font-size="12.5" font-weight="bold" text-anchor="middle" fill="currentColor">SAMO MANJA MATERIJALNA ŠTETA</text><rect x="52" y="32" width="46" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="188" y="32" width="46" height="22" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="6" y="72" width="294" height="52" fill="#9aa7b4" fill-opacity=".45"/><line x1="6" y1="98" x2="300" y2="98" stroke="currentColor" stroke-opacity=".45" stroke-width="2" stroke-dasharray="10 8"/><rect x="52" y="86" width="46" height="22" rx="5" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="2" stroke-dasharray="5 4"/><rect x="188" y="86" width="46" height="22" rx="5" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="2" stroke-dasharray="5 4"/><line x1="75" y1="84" x2="75" y2="66" stroke="currentColor" stroke-width="2"/><path d="M75 56 L69 68 L81 68 Z" fill="currentColor"/><line x1="211" y1="84" x2="211" y2="66" stroke="currentColor" stroke-width="2"/><path d="M211 56 L205 68 L217 68 Z" fill="currentColor"/><text x="153" y="142" font-size="12" text-anchor="middle" fill="currentColor">vozilo sklanjaš AKO smeta saobraćaju</text><text x="153" y="160" font-size="12" text-anchor="middle" fill="currentColor">ili preti opasnost od novih nezgoda</text><text x="153" y="178" font-size="12" text-anchor="middle" fill="currentColor" fill-opacity=".7">učesnici popunjavaju Evropski izveštaj</text></svg></div>
<p><b>Povređeni, poginuli ili velika materijalna šteta (čl. 168) — dužan si da:</b></p>
<ul>
<li><b>ukažeš pomoć povređenima</b>, odnosno prvu pomoć ili medicinsku pomoć — u skladu sa svojim znanjima, sposobnostima i mogućnostima;</li>
<li><b>preduzmeš sve mere zaštite</b> koje su u tvojoj moći da se spreči nastajanje novih i uvećavanje postojećih posledica i povreda;</li>
<li><b>obezbediš tragove</b> i predmete nezgode — <i>pod uslovom da time ne ugrožavaš bezbednost saobraćaja</i>. Taj uslov je deo tačnog odgovora, ne zamka;</li>
<li><b>upozoriš sva lica da se sklone sa kolovoza</b> da ne bi bila povređena i da ne bi uništavala tragove nezgode. Nije tačno da „nisi dužan da daješ upozorenja".</li>
</ul>
<p><b>Samo manja materijalna šteta (čl. 172) — dužan si da:</b></p>
<ul>
<li><b>ukloniš vozilo i druge predmete sa kolovoza</b>, ako onemogućavaju ili ugrožavaju odvijanje saobraćaja, odnosno ako preti opasnost od novih saobraćajnih nezgoda;</li>
<li>ako ih sam ne možeš ukloniti — <b>upozoriš ostale učesnike</b> u saobraćaju o postojanju vozila i drugih prepreka na putu;</li>
<li><b>preduzmeš mere zaštite</b> u svojoj moći da se spreči nastajanje novih i uvećavanje postojećih posledica nezgode;</li>
<li><b>ostaviš podatke o sebi i vozilu</b> vozaču oštećenog vozila <b>ili držaocu druge oštećene stvari</b> u nezgodi, <b>odnosno policiji</b>.</li>
</ul>
<p><b>Evropski izveštaj, ne poziv policiji.</b> Posle nezgode sa manjom materijalnom štetom učesnici <b>popunjavaju Evropski izveštaj o saobraćajnoj nezgodi</b> (čl. 172) — nisu obavezni da obaveste policiju radi vršenja uviđaja. Policija se tu javlja izuzetno: kad neko zahteva uviđaj (čl. 171) i kad je vozač oštećenog vozila odsutan (čl. 172 st. 2).</p>
<p><b>Vozača oštećenog vozila nema:</b> obavesti policiju i saopšti svoje lične podatke i podatke o oštećenom vozilu. Ceduljica na vozilu i poziv svom osiguravajućem društvu nisu zakonska opcija (čl. 172 st. 2).</p>
<p class="mut">Pamtilica: kod manje štete vozilo sklanjaš ako smeta — suprotno od nezgode sa povređenima, gde se do uviđaja ništa ne pomera. Regulisanje saobraćaja do dolaska policije nije dužnost vozača ni u jednom od ta dva slučaja — to rade ovlašćena lica.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Ako samo naiđeš na nezgodu (nisi učesnik)</b>
<div style="display:flex;justify-content:center;margin:6px 0"><svg viewBox="0 0 306 164" style="max-width:340px;width:100%" role="img" aria-label="ako naiđeš na nezgodu, odmah obaveštavaš policiju odnosno službu hitne medicinske pomoći; porodica povređenog, upravljač puta i služba pomoći na putu nisu tačan odgovor"><rect x="10" y="28" width="32" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="2"/><line x1="16" y1="38" x2="36" y2="38" stroke="currentColor" stroke-width="2"/><circle cx="26" cy="74" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M46 46 L60 46 L60 32 L74 32" fill="none" stroke="currentColor" stroke-width="2"/><path d="M72 27 L82 32 L72 37 Z" fill="currentColor"/><path d="M46 64 L60 64 L60 94 L74 94" fill="none" stroke="currentColor" stroke-width="2"/><path d="M72 89 L82 94 L72 99 Z" fill="currentColor"/><rect x="84" y="18" width="214" height="28" rx="5" fill="none" stroke="#1f7a3f" stroke-width="2"/><text x="191" y="37" font-size="12" text-anchor="middle" fill="currentColor">POLICIJA</text><rect x="84" y="70" width="214" height="48" rx="5" fill="none" stroke="#1f7a3f" stroke-width="2"/><text x="191" y="90" font-size="12" text-anchor="middle" fill="currentColor">SLUŽBA HITNE</text><text x="191" y="108" font-size="12" text-anchor="middle" fill="currentColor">MEDICINSKE POMOĆI</text><rect x="6" y="130" width="292" height="30" rx="5" fill="none" stroke="#c0392b" stroke-width="2"/><path d="M14 137 L30 153 M30 137 L14 153" stroke="#c0392b" stroke-width="2"/><text x="168" y="150" font-size="12" text-anchor="middle" fill="currentColor">porodica · upravljač puta · pomoć na putu</text></svg></div>
<ul>
<li>Odmah obavesti <b>policiju, odnosno službu hitne medicinske pomoći</b> — ne porodicu povređenog, ne upravljača puta, ne službu pomoći na putu.</li>
<li>Pruži pomoć <b>u skladu sa svojim znanjima, sposobnostima i mogućnostima</b> i po potrebi prevezi povređenog do najbliže zdravstvene ustanove.</li>
<li>Preduzmi sve što je u tvojoj moći da <b>sprečiš uvećavanje postojećih i nastajanje novih posledica</b>.</li>
</ul>
<p class="mut">Obaveza pomoći važi za svakoga, ne samo za učesnike (čl. 167) — a učesnik ima te iste dužnosti i sam (čl. 168, gore). Odgovori „nije obavezno da preduzima bilo kakve radnje" i „što pre se udalji" su zamke.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Uviđaj: uzorci, isključenje, tablice</b>
<table>
<tr><th>Na uviđaju</th><th>Obavezno je</th></tr>
<tr><td>IMA poginulih ili povređenih</td><td>uzimanje uzorka <b>krvi, odnosno urina</b></td></tr>
<tr><td>NEMA poginulih ni povređenih</td><td>ispitivanje sredstvima — <b>alkometar, droga-test</b></td></tr>
</table>
<p class="mut">Pamtilica: i jedno i drugo je obavezno i nijedno ne zavisi od toga da li neki učesnik to zahteva. Kad ima poginulih ili povređenih, uzorak krvi je obavezan i onda kada je provera već izvršena odgovarajućim sredstvima — alkometar ga ne zamenjuje (čl. 174).</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="vozilu koje nije u voznom stanju oduzimaju se registarske tablice"><path d="M12 40 L20 24 L42 24 L46 32 L52 26 L58 40" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="38" width="56" height="12" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="52" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="52" r="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="24" y="58" width="30" height="10" rx="2" fill="none" stroke="#c0392b" stroke-width="2"/><path d="M24 58 L54 68 M54 58 L24 68" stroke="#c0392b" stroke-width="2"/></svg>
    <b>NIJE U VOZNOM STANJU</b><span>ili su znatno oštećeni uređaji bitni za bezbedno kretanje → isključenje i oduzimanje tablica</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="dokaz o tehničkoj ispravnosti vraća oduzete registarske tablice"><rect x="14" y="6" width="38" height="44" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 18 L45 18 M21 26 L45 26 M21 34 L37 34" stroke="currentColor" stroke-width="2"/><path d="M40 44 L48 54 L68 28" fill="none" stroke="#1f7a3f" stroke-width="3"/><rect x="20" y="56" width="30" height="10" rx="2" fill="none" stroke="#1f7a3f" stroke-width="2"/></svg>
    <b>DOKAZ O TEHNIČKOJ ISPRAVNOSTI</b><span>dostaviš ga nadležnom organu → tablice se vraćaju (čl. 175)</span>
  </div>
</div>
<p><b>Merilo je stanje vozila posle nezgode.</b> Meru isključenja i oduzimanja registarskih tablica policijski službenik primenjuje na vozila koja nisu u voznom stanju, odnosno na kojima su znatno oštećeni ili neispravni sistemi, sklopovi i uređaji bitni za bezbedno kretanje. Ne primenjuje se na sva vozila zato što u nezgodi ima povređenih, ni samo na vozilo onoga čije je nepropisno ponašanje dovelo do nezgode. Oduzete tablice se vraćaju vlasniku, odnosno korisniku, kada nadležnom organu dostavi dokaz da je vozilo tehnički ispravno — ni veštačenje ni sama popravka nisu dovoljni (čl. 175).</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Mamci koji se stalno vraćaju</b>
<table>
<tr><th>Ponuđeno u odgovoru</th><th>Zašto pada</th></tr>
<tr><td>„do dolaska policije reguliše saobraćaj kao ovlašćeno lice"</td><td>nije dužnost vozača — ni kod povređenih i velike štete, ni kod manje štete</td></tr>
<tr><td>„udalji se ako preti opasnost od novih nezgoda" / „ako nemaš znanja da pomogneš"</td><td>ni jedno ni drugo nije razlog za odlazak; udaljiti se smeš kad je <b>tebi</b> neophodna hitna medicinska pomoć i radi <b>prevoženja povređenog</b> do najbliže zdravstvene ustanove — uz obavezu da se vratiš</td></tr>
<tr><td>„dužan si da ostaneš do dolaska policije bez obzira na svoje i tuđe povrede"</td><td>i to pada, zbog ta dva izuzetka iznad</td></tr>
<tr><td>„obavesti službu pomoći na putu"</td><td>zovu se policija, odnosno služba hitne medicinske pomoći</td></tr>
<tr><td>„odmah nadoknadi štetu drugim učesnicima ako si izazvao nezgodu"</td><td>kod manje štete dužnost je da <b>ostaviš podatke</b> o sebi i vozilu, ne da plaćaš na licu mesta</td></tr>
<tr><td>„popuni Evropski izveštaj" kod povređenih, poginulih ili velike štete</td><td>Evropski izveštaj je obrazac za <b>manju</b> materijalnu štetu</td></tr>
<tr><td>„obavezni ste da obavestite policiju radi vršenja uviđaja" (manja šteta)</td><td>učesnici popunjavaju Evropski izveštaj; policija izlazi na zahtev, to nije obaveza učesnika</td></tr>
<tr><td>„povređene ukloni sa kolovoza i ostavi ih na bezbednom"</td><td>pomoć pružaš u skladu sa svojim znanjima, sposobnostima i mogućnostima — ne „izbavi pa ostavi"</td></tr>
<tr><td>„posle uviđaja ukloni vozilo <b>ukoliko je u voznom stanju</b>"</td><td>tačan odgovor je bez tog uslova: bez odlaganja ukloni sa kolovoza vozilo, teret, stvari i rasuti materijal</td></tr>
<tr><td>„uzorak krvi nije obavezan ako je provera izvršena odgovarajućim sredstvima"</td><td>kad ima poginulih ili povređenih, uzorak je obavezan</td></tr>
</table>
</div>

<!-- ============================================================
     NE ULAZI U KARTICU — mapiranje tvrdnji na brojeve pitanja
     (STIL.md t.2). Obrisati pre unosa u build-explanations.mjs.

  Sat nezgode
  - alkohol/psihoaktivne supstance zabranjeni od nezgode do kraja uviđaja,
    bez uslova ......................................................... #8535
  - ostani do dolaska policije i završetka uviđaja (povrede/poginuli/
    velika šteta) ...................................................... #8538
  - kod manje štete svako može zahtevati uviđaj, bez saglasnosti ostalih . #8540
  - ako je neko zahtevao uviđaj, ostali ostaju do kraja .................. #8541
  - posle uviđaja bez odlaganja ukloni vozilo, teret, stvari, rasuti
    materijal .......................................................... #8550
  - stem „...ili je nastala velika materijalna šteta"
    ................................ #8531 #8532 #8536 #8537 #8538 #8539

  Kolovoz / duznosti ucesnika
  - pomoć povređenima u skladu sa znanjima, sposobnostima, mogućnostima .. #8532
  - sve mere zaštite da se spreče nove i uvećanje postojećih posledica ... #8536
  - obezbedi tragove, pod uslovom da ne ugrožavaš bezbednost saobraćaja .. #8531
  - upozori sva lica da se sklone sa kolovoza ........................... #8537
  - ukloni vozilo/predmete AKO smetaju ili preti opasnost od novih
    nezgoda ............................................................ #8542
  - upozori ostale učesnike na prepreke ako ih sam ne možeš ukloniti ..... #8542
  - mere zaštite kod manje štete ........................................ #8545
  - ostavi podatke vozaču oštećenog vozila ili držaocu druge oštećene
    stvari, odnosno policiji ........................................... #8545
  - popunjavaju Evropski izveštaj; nisu obavezni da zovu policiju ........ #8551
  - policija izuzetno: zahtev za uviđaj #8540 #8541; odsutan vozač ....... #8546
  - regulisanje saobraćaja nije dužnost vozača ........... #8537 #8542 #8545
  - „do uviđaja se ništa ne pomera" — kontrast iz postojećeg objašnjenja
    uz to pitanje ...................................................... #8542

  Nisi ucesnik
  - obavesti policiju, odnosno hitnu medicinsku pomoć ................... #8530
  - pomoć u skladu sa znanjima i prevoz do ustanove; spreči uvećanje
    posledica; „nije obavezno" i „udalji se" su zamke ................... #8533

  Uvidjaj / tablice
  - uzorak krvi, odnosno urina obavezan kad ima poginulih/povređenih ..... #8543
  - alkometar/droga-test obavezan kad nema poginulih ni povređenih ....... #8548
  - isključenje i oduzimanje tablica: vozila koja nisu u voznom stanju,
    odnosno sa znatno oštećenim uređajima bitnim za bezbedno kretanje ... #10719
  - tablice se vraćaju uz dokaz o tehničkoj ispravnosti (čl. 175) ........ #8547

  Mamci
  - razlozi za udaljavanje ............................................. #8539
  - „ostani bez obzira na povrede" ..................................... #8539
  - „služba pomoći na putu" .................... #8530 #8531 #8536 #8538
  - „nadoknadi štetu na licu mesta" .................................... #8545
  - „Evropski izveštaj" kod teške nezgode ....................... #8531 #8551
  - „izbavi povređene pa ih ostavi" .................................... #8532
  - „ukloni vozilo ukoliko je u voznom stanju" ......................... #8550
  - „uzorak nije obavezan ako su korišćena sredstva" ................... #8543

  PRIJAVA GRESKE U POSTOJECOJ KARTICI (STIL.md t.7)
  Postojeći pasus glasi: „Udaljiti se sa mesta nezgode sa povređenima smeš
  SAMO: ako je tebi neophodna hitna pomoć, radi prevoza povređenog do
  zdravstvene ustanove, ili da bi obavestio policiju — pa se vraćaš."
  Treći razlog („da bi obavestio policiju") nema oslonca u građi: #8539 ima
  tačno dva tačna odgovora, a postojeće objašnjenje uz #8539 doslovno kaže
  „samo iz dva razloga". Ovaj dodatak zato NIGDE ne broji razloge, da učenik
  ne bi dobio dva različita brojanja na istom ekranu. Predlog ispravke
  postojećeg teksta: obrisati „ili da bi obavestio policiju".
============================================================ -->
`,
};

CARDS['dozvole'] = {
  title: 'Vozačka dozvola, kazneni poeni i probna dozvola',
  html: `
<p><b>Dozvola:</b> uvek KOD SEBE i daje se na uvid · koristi pomagala upisana u dozvolu · promenu prebivališta prijavi u roku od 30 dana · ne smeš: dve dozvole (ni naša+strana), prijavljeno-nestalu, međunarodnu izdatu u Srbiji na teritoriji Srbije.</p>
<p><b>Sa dozvolom A kategorije smeš:</b> motocikl + moped + teški tricikl (i sve niže A potkategorije).</p>
<p><b>Kazneni poeni:</b> 18 poena = oduzimanje dozvole · brišu se posle 24 meseca od pravnosnažnosti (ZOBS čl. 196-198).</p>
<table>
<tr><th colspan="2">PROBNA DOZVOLA (čl. 182) — stroža pravila</th></tr>
<tr><td>autoput</td><td><b>najviše 110 km/h</b></td></tr>
<tr><td>motoput</td><td><b>najviše 90 km/h</b></td></tr>
<tr><td>ostali putevi</td><td><b>najviše 90% ograničenja</b> na tom delu puta</td></tr>
<tr><td>alkohol</td><td><b>0,00</b> (kao i svi vozači A kategorija)</td></tr>
</table>
<p class="mut">Pamćenje: probna skida "deseticu": 130→110 na autoputu, 100→90 na motoputu, ostalo −10%.</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<div class="kPodH"><b class="kPodNaslov">A dozvola: šta smeš, a šta ne</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 278" style="max-width:330px;width:100%" role="img" aria-label="vozačka dozvola A kategorije: smeš moped, motocikl i teški tricikl; ne smeš teški četvorocikl, koji ide uz B1 odnosno B kategoriju, ni radnu mašinu, koja ide uz F kategoriju">
<rect x="86" y="6" width="134" height="44" rx="6" stroke="currentColor" fill="none"/>
<text x="153" y="25" font-size="11" text-anchor="middle" fill="currentColor">VOZAČKA DOZVOLA</text>
<text x="153" y="43" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">kategorija A</text>
<path d="M153 50 L153 62" stroke="currentColor" stroke-width="1.5"/>
<rect x="6" y="64" width="294" height="94" rx="8" stroke="#1f7a3f" fill="none"/>
<text x="18" y="84" font-size="13" font-weight="600" fill="#1f7a3f">SMEŠ</text>
<g stroke="#1f7a3f" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 103 l5 6 l10 -13"/><path d="M18 125 l5 6 l10 -13"/><path d="M18 147 l5 6 l10 -13"/></g>
<text x="42" y="108" font-size="12.5" fill="currentColor">moped</text>
<text x="42" y="130" font-size="12.5" fill="currentColor">motocikl</text>
<text x="42" y="152" font-size="12.5" fill="currentColor">teški tricikl</text>
<rect x="6" y="168" width="294" height="104" rx="8" stroke="#c0392b" fill="none"/>
<text x="18" y="188" font-size="13" font-weight="600" fill="#c0392b">NE SMEŠ</text>
<g stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"><path d="M19 202 L31 214 M31 202 L19 214"/><path d="M19 238 L31 250 M31 238 L19 250"/></g>
<text x="42" y="208" font-size="12.5" fill="currentColor">teški četvorocikl</text>
<text x="42" y="224" font-size="11" fill="currentColor">ide uz B1, odnosno B</text>
<text x="42" y="244" font-size="12.5" fill="currentColor">radna mašina</text>
<text x="42" y="260" font-size="11" fill="currentColor">ide uz F kategoriju</text>
</svg>
</div>
<p><b>Rečima:</b> sa dozvolom A kategorije smeš <b>moped, motocikl i teški tricikl</b>. <b>Teški četvorocikl</b> ne smeš — četvorocikli idu uz B1, odnosno B kategoriju. <b>Radnom mašinom</b> sme da upravlja samo vozač sa F kategorijom (čl. 195). Pitanje se rešava po nazivu vozila, ne po izgledu — uči spisak.</p>
<p class="mut">Pamtilica: u obe verzije ovog pitanja netačna su ista dva — teški ČETVOROcikl i RADNA MAŠINA. Sve ostalo što se u njima nudi (moped, motocikl, teški tricikl) je tačno. Tricikl se ne pojavi u svakoj verziji — ne traži ga po svaku cenu.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Kad MUP oduzima dozvolu (čl. 197)</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 212" style="max-width:330px;width:100%" role="img" aria-label="četiri stanja vode do istog ishoda: najmanje osamnaest kaznenih poena, odnosno devet za probnu dozvolu; jedna pravnosnažna presuda za krivično delo protiv bezbednosti javnog saobraćaja sa smrtnom posledicom; više od jedne takve presude u pet godina za teške telesne povrede; više od jedne takve presude u tri godine za telesne povrede ili imovinsku štetu. U svakom od ta četiri slučaja MUP oduzima vozačku dozvolu.">
<rect x="6" y="4" width="294" height="28" rx="6" stroke="currentColor" fill="none"/>
<text x="16" y="23" font-size="12" font-weight="600" fill="currentColor">KAZNENI POENI</text>
<text x="290" y="23" font-size="12" text-anchor="end" fill="currentColor">najmanje 18 (probna: 9)</text>
<rect x="6" y="38" width="294" height="28" rx="6" stroke="currentColor" fill="none"/>
<text x="16" y="57" font-size="12" font-weight="600" fill="currentColor">SMRT LICA</text>
<text x="290" y="57" font-size="12" text-anchor="end" fill="currentColor">dovoljna 1 presuda</text>
<rect x="6" y="72" width="294" height="28" rx="6" stroke="currentColor" fill="none"/>
<text x="16" y="91" font-size="12" font-weight="600" fill="currentColor">TEŠKE POVREDE</text>
<text x="290" y="91" font-size="12" text-anchor="end" fill="currentColor">više od 1 u 5 godina</text>
<rect x="6" y="106" width="294" height="28" rx="6" stroke="currentColor" fill="none"/>
<text x="16" y="125" font-size="12" font-weight="600" fill="currentColor">POVREDE / ŠTETA</text>
<text x="290" y="125" font-size="12" text-anchor="end" fill="currentColor">više od 1 u 3 godine</text>
<path d="M153 136 L153 150" stroke="currentColor" stroke-width="2"/>
<path d="M148 148 L153 158 L158 148 Z" fill="currentColor"/>
<rect x="6" y="162" width="294" height="46" rx="8" stroke="currentColor" stroke-width="2" fill="none"/>
<text x="153" y="181" font-size="11" text-anchor="middle" fill="currentColor">u svakom od ova četiri slučaja</text>
<text x="153" y="200" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">MUP ODUZIMA VOZAČKU DOZVOLU</text>
</svg>
</div>
<table>
<tr><th colspan="2">Ne upravlja savesno i na propisan način vozač koji…</th></tr>
<tr><td>ima kaznene poene</td><td><b>najmanje 18</b> (za probnu dozvolu: <b>9</b>)</td></tr>
<tr><td>je pravnosnažno osuđen za krivično delo protiv bezbednosti javnog saobraćaja sa posledicom <b>smrt lica</b></td><td>dovoljna je <b>jedna</b> presuda</td></tr>
<tr><td>je za isto delo osuđen sa posledicom <b>teške telesne povrede</b> drugog lica</td><td><b>više od jednom u 5 godina</b></td></tr>
<tr><td>je za isto delo osuđen sa posledicom <b>telesne povrede ili imovinska šteta</b></td><td><b>više od jednom u 3 godine</b></td></tr>
</table>
<p><b>Šta sledi:</b> u sva četiri slučaja organizaciona jedinica MUP-a koja te vodi u evidenciji <b>oduzeće vozačku dozvolu</b> — neće ti „izreći odgovarajući broj kaznenih poena" ni „privremeno zabraniti upravljanje u trajanju do jedne godine". To su dve ponuđene zamke.</p>
<p class="mut">Pamtilica: 5 godina ide uz TEŠKE povrede, 3 godine uz obične povrede i štetu, a za smrt se ne broji — dovoljna je jedna presuda. Prag poena je 18, a za probnu dozvolu upola manje — 9.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Kazneni poeni: odakle se meri 24 meseca</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 196" style="max-width:330px;width:100%" role="img" aria-label="vremenska traka odozgo nadole: prekršaj, zatim pravnosnažnost odluke kao početak roka, pa 24 meseca do brisanja kaznenih poena">
<path d="M30 22 L30 178" stroke="currentColor"/>
<path d="M25 176 L30 190 L35 176 Z" fill="currentColor"/>
<path d="M30 96 L30 170" stroke="currentColor" stroke-width="5"/>
<circle cx="30" cy="44" r="5" fill="currentColor"/>
<text x="46" y="41" font-size="12.5" fill="currentColor">prekršaj</text>
<text x="46" y="59" font-size="11" fill="#c0392b">rok NE kreće ovde</text>
<path d="M18 96 L42 96" stroke="#1f7a3f" stroke-width="4"/>
<text x="48" y="93" font-size="12.5" fill="currentColor">pravnosnažna odluka</text>
<text x="48" y="111" font-size="11" font-weight="600" fill="#1f7a3f">START</text>
<path d="M30 134 L54 134" stroke="currentColor" stroke-dasharray="3 3"/>
<rect x="54" y="120" width="196" height="28" rx="6" stroke="currentColor" fill="none"/>
<text x="152" y="139" font-size="13" font-weight="600" text-anchor="middle" fill="currentColor">24 meseca</text>
<path d="M18 170 L42 170" stroke="currentColor" stroke-width="4"/>
<text x="48" y="167" font-size="12.5" fill="currentColor">poeni se brišu</text>
</svg>
</div>
<p><b>Rečima:</b> poeni se brišu <b>nakon isteka 24 meseca od dana pravnosnažnosti odluke o prekršaju</b> (čl. 198) — a ne od dana kada je prekršaj izvršen. Same poene ne izriče MUP: izriču se odlukom kojom si kažnjen za prekršaj, a jedinica MUP-a ih samo vodi u evidenciji.</p>
<p class="mut">Zamka iz baze: „ako u toku 24 meseca nije ponovo kažnjen…" — takav uslov ne postoji; rok teče od pravnosnažnosti i gotovo.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Zabrana, isključenje, zaštitna mera — nula izuzetaka</b>
<table>
<tr><th>Ponuđeni „izuzetak"</th><th>Tačno</th></tr>
<tr><td>Zabranjeno ti je upravljanje odlukom nadležnog organa — „ali smem samo lokalne puteve / samo skup vozila / samo vozila čija najveća konstruktivna brzina nije veća od 45 km/h"</td><td>NE — nije dozvoljeno upravljanje motornim vozilom, odnosno skupom vozila. Bez izuzetaka.</td></tr>
<tr><td>Isključen si iz saobraćaja — „ali smem samo do prebivališta, odnosno do sedišta firme"</td><td>NE — nema vožnje ni do kuće ni do sedišta</td></tr>
<tr><td>Isključen si — „zabrana važi samo za kategoriju kojom sam upravljao"</td><td>NE — važi za sva motorna vozila i skupove vozila</td></tr>
<tr><td>Traje ti zaštitna mera, odnosno mera bezbednosti zabrane upravljanja — „ali smem obuku, ili bar teorijsku obuku i teorijski ispit"</td><td>NE — dok mera traje ne možeš ni započeti obuku, ni vršiti je, ni polagati ispit</td></tr>
</table>
<p class="mut">Pamtilica: kod zabrane odlukom organa i kod isključenja iz saobraćaja svaki netačan odgovor ima reč „samo" — tačan je onaj bez nje. Kod zaštitne mere zamka je drugačija: nude ti pola prava (samo obuka, ili samo teorija i teorijski ispit) — tačno je da ne smeš ništa od toga.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Papiri: obuka &rarr; ispit &rarr; dozvola</b>
<p><b>Na praktičnoj obuci kandidat kod sebe mora imati i staviti na uvid tri stvari:</b></p>
<ul>
<li>ličnu kartu</li>
<li>dokaz o zdravstvenoj sposobnosti za vozača</li>
<li>potvrdu o položenom teorijskom ispitu</li>
</ul>
<p>Ne traže se: ugovor o uslovima pod kojima će se obaviti obuka, potvrda o završenoj teorijskoj obuci, knjižica obuke kandidata za vozača.</p>
<table>
<tr><th>Traži se</th><th>Zamka koja stoji odmah do nje</th></tr>
<tr><td>potvrda o <b>položenom teorijskom ISPITU</b></td><td>potvrda o <b>završenoj teorijskoj OBUCI</b></td></tr>
</table>
<p class="mut">Pamtilica: traži se dokaz da si POLOŽIO, a ne da si POHAĐAO.</p>
<p><b>Samostalna vožnja:</b> sme onaj ko ispunjava propisane uslove <b>i ima vozačku dozvolu za tu kategoriju</b> vozila. Uverenje o položenom vozačkom ispitu nije dozvola, a ni golo „ima vozačku dozvolu" nije dovoljno ako nije za kategoriju kojom upravljaš.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Probna dozvola: uz 90% idu dve zamke</b>
<p><b>Rečima:</b> na putu koji nije autoput ni motoput vozaču sa probnom dozvolom <b>nije dozvoljena</b> brzina veća od <b>90% od brzine dozvoljene na tom delu puta</b> (čl. 182). Bez ograda — važi sve dok traje probna dozvola.</p>
<table>
<tr><th>Ponuđena zamka</th><th>Zašto pada</th></tr>
<tr><td>„nije dozvoljeno <b>samo do navršenih 18 godina</b> života"</td><td>ograničenje ne prestaje na 18. rođendan — traje koliko i probna dozvola</td></tr>
<tr><td>„nije dozvoljeno <b>samo u periodu od 23,00 do 06,00</b> časova"</td><td>u tom periodu vozač sa probnom dozvolom uopšte ne sme da upravlja vozilom (čl. 182) — to nije prozor u kom važi ograničenje brzine</td></tr>
</table>
<p class="mut">Pamtilica: i ovde tačan odgovor nema reč „samo" — glasi prosto „nije dozvoljeno".</p>
</div>
`,
};

CARDS['preticanje'] = {
  title: 'Preticanje i obilaženje (5 pitanja na svakom testu!)',
  html: `
<p><b>Osnovno (čl. 53):</b> pretiče se SA LEVE strane. Sa DESNE samo: vozilo koje skreće ULEVO · tramvaj na šinama po sredini kolovoza (ako desno postoji traka) · na raskrsnici na putu sa prvenstvom, vozilo koje skreće ulevo.</p>
<p><b>Zašto baš zdesna:</b> vozilo koje je zauzelo položaj uz razdelnu liniju i daje znak za levo skretanje, kao i tramvaj na šinama po sredini kolovoza, drže levu stranu zauzetu — slobodna je samo desna strana. Ponuda „sa bilo koje strane, u zavisnosti od saobraćajne situacije" je uvek mamac.</p>
<div class="signRow lineRow" style="max-width:360px;margin:6px auto">
  <div class="signCell">
    <svg viewBox="0 0 160 150" role="img" aria-label="Vozilo skreće ulevo — pretiče se s desne strane">
      <rect x="0" y="0" width="160" height="150" fill="#9aa7b4"/>
      <rect x="0" y="0" width="36" height="20" fill="#e8dcc2"/><rect x="124" y="0" width="36" height="20" fill="#e8dcc2"/>
      <rect x="0" y="70" width="36" height="80" fill="#e8dcc2"/><rect x="124" y="70" width="36" height="80" fill="#e8dcc2"/>
      <polygon points="142,80 151,89 142,98 133,89" fill="#f2c200" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="80" y1="76" x2="80" y2="148" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
      <line x1="80" y1="2" x2="80" y2="14" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
      <line x1="2" y1="45" x2="30" y2="45" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
      <line x1="130" y1="45" x2="158" y2="45" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
      <path d="M85 33 Q82 26 68 26 L52 26" stroke="#1c2e40" stroke-width="2.5" fill="none" stroke-dasharray="5 4"/>
      <path d="M57 20 L49 26 L57 32" stroke="#1c2e40" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(88 50) rotate(-12)">
        <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
        <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
        <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
        <circle cx="-7.5" cy="-15" r="2.6" fill="#f2c200"/>
      </g>
      <g transform="translate(108 126)">
        <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
        <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
        <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
      </g>
      <path d="M108 106 L108 10" stroke="#2e7d32" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <path d="M102 16 L108 6 L114 16" stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(140 40)"><circle r="11" fill="#fff" stroke="#1f7a3f" stroke-width="3"/><path d="M-5 0 L-1 5 L5 -5" stroke="#1f7a3f" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <path d="M100 114 C78 106 58 98 58 78 L58 44" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <path d="M52 52 L58 42 L64 52" stroke="#c0392b" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(58 94)"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>
    </svg>
    <b>SKREĆE ULEVO</b><span>zauzeo položaj uz razdelnu liniju + levi žmigavac → pretičeš ga ZDESNA (i na raskrsnici na putu sa prvenstvom)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 160 150" role="img" aria-label="Tramvaj na šinama po sredini kolovoza — pretiče se samo s desne strane">
      <rect x="0" y="0" width="160" height="150" fill="#9aa7b4"/>
      <rect x="0" y="0" width="10" height="150" fill="#e8dcc2"/><rect x="150" y="0" width="10" height="150" fill="#e8dcc2"/>
      <line x1="80" y1="2" x2="80" y2="148" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
      <line x1="74" y1="0" x2="74" y2="150" stroke="#4d5761" stroke-width="1.6"/><line x1="86" y1="0" x2="86" y2="150" stroke="#4d5761" stroke-width="1.6"/>
      <rect x="70" y="20" width="20" height="72" rx="4" fill="#b7332b"/>
      <rect x="73" y="23" width="14" height="8" rx="2" fill="#fff" opacity=".85"/>
      <rect x="73" y="36" width="14" height="6" rx="1.5" fill="#fff" opacity=".55"/><rect x="73" y="46" width="14" height="6" rx="1.5" fill="#fff" opacity=".55"/>
      <rect x="73" y="56" width="14" height="6" rx="1.5" fill="#fff" opacity=".55"/><rect x="73" y="66" width="14" height="6" rx="1.5" fill="#fff" opacity=".55"/>
      <rect x="73" y="76" width="14" height="6" rx="1.5" fill="#fff" opacity=".55"/>
      <g transform="translate(36 34) rotate(180)">
        <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
        <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
        <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
      </g>
      <g transform="translate(120 126)">
        <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
        <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
        <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
      </g>
      <path d="M120 106 L120 10" stroke="#2e7d32" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <path d="M114 16 L120 6 L126 16" stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(140 56)"><circle r="11" fill="#fff" stroke="#1f7a3f" stroke-width="3"/><path d="M-5 0 L-1 5 L5 -5" stroke="#1f7a3f" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <path d="M112 114 C92 106 56 104 56 82 L56 66" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <path d="M50 74 L56 64 L62 74" stroke="#c0392b" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(56 96)"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>
    </svg>
    <b>TRAMVAJ PO SREDINI</b><span>šine po sredini kolovoza → SAMO zdesna, i to samo ako desno postoji saobraćajna traka</span>
  </div>
</div>
<p><b>NIJE preticanje:</b> na putu sa ≥2 trake u istom smeru, brže kretanje jedne trake (kolone) od druge — ni u naselju prolaženje s desne strane vozila koje nije uz desnu ivicu.</p>
<div class="vgrid" style="grid-template-columns:1fr 1fr">
  <div class="vg vgFast"><b>❌ ZABRANJENO preticati (čl. 55 i 57)</b></div><div class="vg vgSlow"><b>✅ SME, iako zvuči opasno</b></div>
  <div class="vg" style="text-align:left">kolonu (posebno pod pratnjom) · kad te neko već pretiče · kad je vozač ispred dao znak za preticanje · kad ne možeš da se vratiš u svoju traku · zaustavnom/sporom trakom · preko neisprekidane linije · prevoj i nepregledna krivina* · tunel* · neposredno ISPRED raskrsnice i na raskrsnici (bez prvenstva) · ispred kružnog toka · prelaz preko pruge · vozilo koje propušta pešake na prelazu · na autoputu/motoputu s desne strane</div>
  <div class="vg" style="text-align:left">podvožnjak i nadvožnjak · NA raskrsnici sa kružnim tokom · na raskrsnici kad si na putu SA prvenstvom (i to: vozilo koje skreće levo — s desne strane; bicikl/moped/motocikl; kad reguliše semafor ili policajac) · po snegu (sneg sam po sebi ne zabranjuje)<br><br>* prevoj/krivina/tunel su dozvoljeni ako ima ≥2 trake u tvom smeru</div>
</div>
<p><b>Dužnosti (čl. 54 i 56):</b> pretican NE SME da ubrzava i pomera se desno; ti se posle preticanja vraćaš u svoju traku bez ugrožavanja drugih.</p>
<p class="mut">Pamćenje za kružni tok: "ISPRED — ne, NA njemu — da". Za tunele/prevoje: "jedna traka — ne, dve trake — da".</p>
<p style="margin-top:10px"><b>Zamka koju baza vrti u oba smera (preticanje i obilaženje):</b> vozilo ispred tebe se zaustavilo — ili se tek zaustavlja — pred „zebrom" da propusti pešaka, a tebi se nudi da prođeš pored njega. Ne smeš <b>ni da ga pretičeš ni da ga obilaziš</b>; mamac „nije Vam dozvoljeno, osim na putu van naselja" je netačan — izuzetka nema, zabrana važi svuda.</p>
<svg viewBox="0 0 220 170" role="img" style="max-width:250px;width:100%;display:block;margin:8px auto">
  <rect x="0" y="0" width="30" height="170" fill="#e8dcc2"/><rect x="190" y="0" width="30" height="170" fill="#e8dcc2"/>
  <rect x="30" y="0" width="160" height="170" fill="#9aa7b4"/>
  <line x1="110" y1="4" x2="110" y2="24" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
  <line x1="110" y1="68" x2="110" y2="166" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
  <rect x="38" y="30" width="9" height="32" fill="#fff"/><rect x="54" y="30" width="9" height="32" fill="#fff"/><rect x="70" y="30" width="9" height="32" fill="#fff"/><rect x="86" y="30" width="9" height="32" fill="#fff"/><rect x="102" y="30" width="9" height="32" fill="#fff"/><rect x="118" y="30" width="9" height="32" fill="#fff"/><rect x="134" y="30" width="9" height="32" fill="#fff"/><rect x="150" y="30" width="9" height="32" fill="#fff"/><rect x="166" y="30" width="9" height="32" fill="#fff"/>
  <g transform="translate(150 96)">
    <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
    <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
    <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
  </g>
  <g transform="translate(150 146)">
    <rect x="-2.5" y="-15" width="5" height="9" rx="2.5" fill="#333"/>
    <rect x="-2.5" y="6" width="5" height="9" rx="2.5" fill="#333"/>
    <rect x="-4" y="-9" width="8" height="19" rx="4" fill="#2c6aa0"/>
    <rect x="-9" y="-8" width="18" height="3" rx="1.5" fill="#333"/>
    <circle cy="2" r="4.5" fill="#c0392b"/>
  </g>
  <path d="M141 140 C115 132 100 120 100 100 L100 48" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
  <path d="M94 56 L100 46 L106 56" stroke="#c0392b" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(118 88)"><circle r="11" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>
  <g transform="translate(172 46)"><ellipse rx="8" ry="5" fill="#1c2e40"/><circle cx="-2" r="3.5" fill="#d9a066"/></g>
  <path d="M160 46 L146 46 M151 41 L145 46 L151 51" stroke="#1c2e40" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
};

CARDS['znakovi-porodice'] = {
  title: 'Porodice saobraćajnih znakova (oblik + boja = vrsta)',
  html: `
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 80 70"><polygon points="40,5 75,64 5,64" fill="#fff" stroke="#c0392b" stroke-width="8" stroke-linejoin="round"/><text x="40" y="56" text-anchor="middle" font-size="30" font-weight="bold" fill="#111">!</text></svg>
    <b>OPASNOSTI</b><span>trougao, crveni rub — upozorenje unapred</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 80 70"><circle cx="40" cy="35" r="30" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="40" y="45" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">40</text></svg>
    <b>ZABRANE</b><span>krug, crveni rub — šta NE SMEŠ</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 80 70"><circle cx="40" cy="35" r="31" fill="#2c6aa0"/><path d="M40 52 L40 22 M40 22 L30 33 M40 22 L50 33" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/></svg>
    <b>OBAVEZE</b><span>krug, plava podloga — šta MORAŠ</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 80 70"><rect x="8" y="4" width="64" height="62" rx="8" fill="#2c6aa0"/><text x="40" y="53" text-anchor="middle" font-size="42" font-weight="bold" fill="#fff">P</text></svg>
    <b>OBAVEŠTENJA</b><span>kvadrat/pravougaonik — informacija</span>
  </div>
</div>
<p style="margin-top:10px"><b>Zone i prestanak važenja</b> — jedan princip pokriva desetine znakova:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 110 130"><rect x="4" y="4" width="102" height="122" rx="8" fill="#fff" stroke="#2c6aa0" stroke-width="5"/>
      <circle cx="55" cy="52" r="30" fill="#fff" stroke="#c0392b" stroke-width="7"/><text x="55" y="63" text-anchor="middle" font-size="27" font-weight="bold" fill="#111">30</text>
      <text x="55" y="107" text-anchor="middle" font-size="17" font-weight="bold" fill="#111">ZONA</text></svg>
    <b>POČETAK ZONE</b><span>od ovog mesta važi režim zone (npr. 30 km/h)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 130"><rect x="4" y="4" width="102" height="122" rx="8" fill="#fff" stroke="#7d8792" stroke-width="5"/>
      <circle cx="55" cy="52" r="30" fill="#fff" stroke="#7d8792" stroke-width="7"/><text x="55" y="63" text-anchor="middle" font-size="27" font-weight="bold" fill="#5b636b">30</text>
      <text x="55" y="107" text-anchor="middle" font-size="17" font-weight="bold" fill="#5b636b">ZONA</text>
      <path d="M14 118 L98 16" stroke="#c0392b" stroke-width="7" stroke-linecap="round"/></svg>
    <b>KRAJ ZONE</b><span>isti znak, precrtan kosom crtom = režim prestaje</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="48" fill="#fff" stroke="#111" stroke-width="4"/>
      <text x="55" y="70" text-anchor="middle" font-size="34" font-weight="bold" fill="#111">60</text>
      <path d="M22 88 L88 22 M30 96 L96 30 M14 80 L80 14" stroke="#111" stroke-width="4"/></svg>
    <b>PRESTANAK ZABRANE</b><span>bela podloga + kose crte preko znaka = ograničenje više ne važi</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 220 110">
      <rect x="4" y="14" width="100" height="82" rx="8" fill="#1e8a3c"/>
      <path d="M34 88 L44 40 M74 88 L64 40 M24 62 L84 62" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="116" y="14" width="100" height="82" rx="8" fill="#2c6aa0"/>
      <path d="M140 74 L140 56 Q140 42 166 42 Q192 42 192 56 L192 74 Z" fill="#fff"/>
      <circle cx="150" cy="72" r="6" fill="#2c6aa0"/><circle cx="182" cy="72" r="6" fill="#2c6aa0"/></svg>
    <b>AUTOPUT / MOTOPUT</b><span>autoput — <b>ZELENA</b> tabla (dve trake i nadvožnjak); motoput — <b>PLAVA</b> tabla (automobil spreda). Kraj: ista tabla precrtana crvenom trakom</span>
  </div>
</div>
<p class="mut" style="text-align:center">Zabrane i obaveze su zajedno jedna zakonska porodica — znakovi IZRIČITIH NAREDBI (ZOBS čl. 135); porodice su dakle tri: opasnosti, izričite naredbe, obaveštenja.</p>
<p style="text-align:center"><b>Dva oblika koja moraš da prepoznaš i naopako:</b></p>
<div class="signRow" style="max-width:260px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 80 70"><polygon points="5,6 75,6 40,64" fill="#fff" stroke="#c0392b" stroke-width="8" stroke-linejoin="round"/></svg>
    <span>obrnuti trougao = ustupi prvenstvo</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 80 70"><polygon points="26,5 54,5 74,25 74,46 54,66 26,66 6,46 6,25" fill="#c0392b" stroke="#fff" stroke-width="3"/><text x="40" y="43" text-anchor="middle" font-size="17" font-weight="bold" fill="#fff">STOP</text></svg>
    <span>osmougao = obavezno zaustavljanje</span>
  </div>
</div>
<p><b>Dopunska tabla</b> stoji ISPOD znaka i precizira ga (udaljenost, dužina, vrsta vozila, vreme) — važi samo uz znak na kome je.</p>
<p><b>Taktika za slikovna pitanja:</b> prvo prepoznaj PORODICU po obliku i boji, pa tek onda simbol — većina zamki su znakovi iste porodice sa sličnim simbolom.</p>`,
};

CARDS['semafori'] = {
  title: 'Semafori — boje, kombinacije i strelice',
  html: `
<div style="display:flex;gap:18px;justify-content:center;align-items:center;margin:6px 0">
<svg viewBox="0 0 56 150" style="height:130px"><rect x="8" y="4" width="40" height="142" rx="10" fill="#2a333d"/><circle cx="28" cy="30" r="16" fill="#e34b3a"/><circle cx="28" cy="74" r="16" fill="#5a4a22"/><circle cx="28" cy="118" r="16" fill="#1f4a2e"/></svg>
<svg viewBox="0 0 150 56" style="height:52px"><rect x="4" y="8" width="142" height="40" rx="10" fill="#2a333d"/><circle cx="30" cy="28" r="16" fill="#e34b3a"/><circle cx="75" cy="28" r="16" fill="#5a4a22"/><circle cx="120" cy="28" r="16" fill="#4bb36b"/></svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">vertikalno: crveno GORE · horizontalno: crveno LEVO (zeleno desno)</p>
<div class="vgrid" style="grid-template-columns:auto 1fr">
  <div class="vg" style="background:#b91c1c;color:#fff"><b>🔴 CRVENO</b></div><div class="vg" style="text-align:left">zabranjen prolaz</div>
  <div class="vg" style="background:#b45309;color:#fff"><b>🔴+🟡 CRVENO + ŽUTO</b></div><div class="vg" style="text-align:left">i dalje zabranjen prolaz — najava zelenog (pripremi se)</div>
  <div class="vg" style="background:#8a5a00;color:#fff"><b>🟡 ŽUTO postojano</b></div><div class="vg" style="text-align:left">zabranjen prolaz — OSIM ako si toliko blizu da ne možeš bezbedno da se zaustaviš</div>
  <div class="vg" style="background:#8a5a00;color:#fff"><b>🟡 ŽUTO trepćuće</b></div><div class="vg" style="text-align:left">prolaz uz POJAČANU OPREZNOST i poštovanje znakova/pravila prvenstva (semafor "ne radi")</div>
  <div class="vg" style="background:#15803d;color:#fff"><b>🟢 ZELENO</b></div><div class="vg" style="text-align:left">slobodan prolaz (uz propuštanje pešaka na prelazu pri skretanju!)</div>
  <div class="vg" style="background:#15803d;color:#fff"><b>🟢 ZELENO trepćuće</b></div><div class="vg" style="text-align:left">najava prestanka zelenog — prolaz još uvek slobodan</div>
</div>
<p><b>Raspored (čl. 139):</b> vertikalno crveno GORE, žuto u sredini, zeleno DOLE; horizontalno (iznad trake): crveno LEVO, zeleno DESNO. <b>Kombinacije (čl. 141):</b> crveno i zeleno nikad zajedno; žuto sme uz crveno (pre zelenog).</p>
<p><b>Strelice (direkcioni semafor, čl. 138):</b> važi SAMO za smer koji strelica pokazuje. Zelena strelica u crnom krugu = slobodno samo u tom smeru.</p>
<p style="margin-top:10px"><b>Posebne vrste semafora</b> — baza ih pita, prepoznaj oblik:</p>
<div class="signRow wrapRow">
  <div class="signCell">
    <svg viewBox="0 0 120 62"><rect x="2" y="4" width="36" height="54" rx="6" fill="#2a333d"/><rect x="10" y="26" width="20" height="6" rx="2" fill="#fff"/>
      <rect x="42" y="4" width="36" height="54" rx="6" fill="#2a333d"/><rect x="57" y="14" width="6" height="34" rx="2" fill="#fff"/>
      <rect x="82" y="4" width="36" height="54" rx="6" fill="#2a333d"/><rect x="97" y="12" width="6" height="38" rx="2" fill="#fff" transform="rotate(35 100 31)"/></svg>
    <b>TRAMVAJSKI (bele crte)</b><span>položena ― = zabrana · uspravna i kosa = slobodan prolaz (čl. 147); važe i za autobus u zajedničkoj traci</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 60 100"><rect x="8" y="2" width="44" height="96" rx="8" fill="#2a333d"/>
      <circle cx="30" cy="27" r="17" fill="#c0392b"/><text x="30" y="34" text-anchor="middle" font-size="18">🚶</text>
      <circle cx="30" cy="72" r="17" fill="#1f7a3f"/><text x="30" y="79" text-anchor="middle" font-size="18">🚶</text></svg>
    <b>PEŠAČKI</b><span>dvobojni: crveno gore, zeleno dole; trepćuće zeleno = uskoro crveno (čl. 146)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 60 120"><rect x="8" y="2" width="44" height="116" rx="8" fill="#2a333d"/>
      <circle cx="30" cy="24" r="15" fill="#c0392b"/><text x="30" y="30" text-anchor="middle" font-size="15">🚲</text>
      <circle cx="30" cy="60" r="15" fill="#8a5a00"/><text x="30" y="66" text-anchor="middle" font-size="15">🚲</text>
      <circle cx="30" cy="96" r="15" fill="#1f7a3f"/><text x="30" y="102" text-anchor="middle" font-size="15">🚲</text></svg>
    <b>BICIKLISTIČKI</b><span>trobojni sa simbolom bicikla — za biciklističke trake/staze (čl. 140), ista značenja svetala</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 130 56"><rect x="2" y="4" width="38" height="48" rx="6" fill="#2a333d"/><path d="M12 16 L30 40 M30 16 L12 40" stroke="#c0392b" stroke-width="6" stroke-linecap="round"/>
      <rect x="46" y="4" width="38" height="48" rx="6" fill="#2a333d"/><path d="M65 14 L65 40 M65 40 L56 30 M65 40 L74 30" stroke="#1f9d55" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="90" y="4" width="38" height="48" rx="6" fill="#2a333d"/><path d="M100 14 L118 36 M118 36 L106 34 M118 36 L116 24" stroke="#d99a17" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <b>IZNAD SAOBRAĆAJNE TRAKE</b><span>crveni ✕ = traka zabranjena · zelena ↓ = slobodna · žuta trepćuća kosa = obavezno pređi u traku na koju pokazuje (čl. 145)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 96 62"><rect x="4" y="4" width="40" height="54" rx="8" fill="#2a333d"/><circle cx="24" cy="20" r="11" fill="#c0392b"/><circle cx="24" cy="44" r="11" fill="#3a3f45"/>
      <rect x="50" y="14" width="40" height="34" rx="6" fill="#2a333d"/><path d="M58 31 L80 31 M80 31 L71 23 M80 31 L71 39" stroke="#1f9d55" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <b>USLOVNA ZELENA STRELICA</b><span>uz crveno/žuto: smeš u smeru strelice, ali propuštaš SVA vozila i pešake (čl. 143)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 96 60"><rect x="10" y="6" width="76" height="48" rx="8" fill="#2a333d"/>
      <circle cx="34" cy="30" r="15" fill="#c0392b"/><circle cx="62" cy="30" r="15" fill="#5a2320"/></svg>
    <b>PRUGA — DVA CRVENA</b><span>naizmenično trepću = najava voza, OBAVEZNO zaustavljanje (čl. 101)</span>
  </div>
</div>
<p class="mut">Zamka: zeleno NE znači "prolaz bez obaveza" — pri skretanju propuštaš pešake na prelazu i vozila iz suprotnog smera kad skrećeš ulevo.</p>`,
};

CARDS['iskljucenje'] = {
  title: 'Isključenje vozača iz saobraćaja i zadržavanje',
  html: `
<p><b>Policija će privremeno ISKLJUČITI vozača (ZOBS čl. 279) ako:</b></p>
<table>
<tr><td>1</td><td>je očigledno smanjena sposobnost — umor, bolest, povreda</td></tr>
<tr><td>2</td><td>je pod dejstvom alkohola preko dozvoljenog / psihoaktivnih supstanci</td></tr>
<tr><td>3</td><td>ODBIJE ispitivanje (alkometar) ili stručni pregled</td></tr>
<tr><td>4</td><td>sam zahteva analizu krvi/urina (do rezultata)</td></tr>
<tr><td>5</td><td>ne poštuje naložena ograničenja</td></tr>
<tr><td>6</td><td>vozi nasilnički</td></tr>
<tr><td>7</td><td>nema dozvolu za tu kategoriju / dozvola istekla</td></tr>
</table>
<p><b>Zapamti:</b> isključenje je PRIVREMENA mera na licu mesta (nije oduzimanje dozvole); isključenom vozaču upravljanje nije dozvoljeno dok mera traje. Vozilo se isključuje posebno (tehnička neispravnost, tablice...).</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<div class="kPodH"><b class="kPodNaslov">VOZAČ ili VOZILO — dve različite mere</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 320 168" style="max-width:400px;width:100%" role="img" aria-label="Levo: isključen vozač — čovek je crvenom pregradom odvojen od motocikla i ne sme da upravlja. Desno: isključeno vozilo — motociklu se skidaju registarske tablice."><text x="80" y="15" text-anchor="middle" font-size="13" fill="currentColor">VOZAČ (čl. 279)</text><line x1="6" y1="112" x2="154" y2="112" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="48" r="9" fill="none" stroke="currentColor" stroke-width="2"/><line x1="24" y1="57" x2="24" y2="80" stroke="currentColor" stroke-width="2"/><line x1="12" y1="66" x2="36" y2="66" stroke="currentColor" stroke-width="2"/><line x1="24" y1="80" x2="17" y2="111" stroke="currentColor" stroke-width="2"/><line x1="24" y1="80" x2="31" y2="111" stroke="currentColor" stroke-width="2"/><rect x="44" y="34" width="7" height="78" fill="#c0392b"/><circle cx="80" cy="98" r="12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="128" cy="98" r="12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M80 98 L96 80 L118 80 L128 98" fill="none" stroke="currentColor" stroke-width="2"/><line x1="96" y1="80" x2="90" y2="66" stroke="currentColor" stroke-width="2"/><line x1="82" y1="62" x2="98" y2="69" stroke="currentColor" stroke-width="2"/><rect x="104" y="74" width="22" height="5" rx="2" fill="currentColor"/><text x="80" y="134" text-anchor="middle" font-size="13" fill="currentColor">čovek ne sme</text><text x="80" y="152" text-anchor="middle" font-size="13" fill="currentColor">da upravlja</text><line x1="160" y1="24" x2="160" y2="156" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5"/><text x="241" y="15" text-anchor="middle" font-size="13" fill="currentColor">VOZILO (čl. 289)</text><line x1="166" y1="112" x2="314" y2="112" stroke="currentColor" stroke-width="2"/><circle cx="196" cy="98" r="12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="244" cy="98" r="12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M196 98 L212 80 L234 80 L244 98" fill="none" stroke="currentColor" stroke-width="2"/><line x1="212" y1="80" x2="206" y2="66" stroke="currentColor" stroke-width="2"/><line x1="198" y1="62" x2="214" y2="69" stroke="currentColor" stroke-width="2"/><rect x="220" y="74" width="22" height="5" rx="2" fill="currentColor"/><rect x="258" y="84" width="24" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/><path d="M284 80 L296 64" fill="none" stroke="#c0392b" stroke-width="3"/><polygon points="301,57 297,70 290,63" fill="#c0392b"/><rect x="266" y="26" width="44" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="268" y="28" width="7" height="14" fill="#2c6aa0"/><text x="241" y="134" text-anchor="middle" font-size="13" fill="currentColor">skidaju se</text><text x="241" y="152" text-anchor="middle" font-size="13" fill="currentColor">registarske tablice</text></svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">levo: mera pogađa ČOVEKA · desno: mera pogađa VOZILO</p>
<p><b>Isto to rečima:</b> isključenje VOZAČA (čl. 279) pogađa čoveka — dok mera traje ne smeš da upravljaš, a ako te zateknu za volanom u toku isključenja, to je novi razlog za isključenje vozača (#8556, #8557). Isključenje VOZILA (čl. 289) pogađa mašinu: vozilu se oduzimaju REGISTARSKE tablice, uz potvrdu o oduzimanju — ne saobraćajna i ne vozačka dozvola (#8601). Svako pitanje prvo prelomi ovako: <b>pogađa li ovo čoveka ili mašinu?</b></p>
<p><b>Dopuna liste sa vrha kartice (čl. 279):</b></p>
<table>
<tr><td>8</td><td>Vozi za vreme trajanja ZAŠTITNE MERE ili mere bezbednosti</td><td>#8555, #8558</td></tr>
<tr><td>9</td><td>Zatečen je da vozi za vreme trajanja ISKLJUČENJA vozača</td><td>#8556, #8557</td></tr>
<tr><td>10</td><td>Na vozilu bez kabine (moped, motocikl, tricikl, četvorocikl) nema na glavi ZAKOPČANU homologovanu kacigu, na način propisan deklaracijom proizvođača — ili je nema putnik koga prevozi</td><td>#10701</td></tr>
<tr><td>11</td><td>Strana vozačka dozvola mu je nečitljiva</td><td>obj. #8553, #8558</td></tr>
</table>
<p class="mut">Stavke 8, 9 i 10 pitanja stvarno nude kao tačne odgovore. Stavka 11 stoji samo u objašnjenjima uz #8553 i #8558 kao deo liste iz čl. 279 — u ponuđenim odgovorima ove podoblasti se ne pojavljuje, pa je uči kao deo liste, ne kao očekivano pitanje.</p>
<p><b>Zamke — ovo NIJE razlog da isključe VOZAČA:</b></p>
<ul>
<li>obično prekoračenje brzine: od 51 do 70 km/h preko dozvoljene u naselju (#8552), preko 70 km/h van naselja (#8553), preko 50 km/h u zoni škole (#8556, #8557);</li>
<li>„prođe svetlosni saobraćajni znak kada je tim znakom zabranjen prolaz" (#8555, #8557, #8558);</li>
<li>noću nema uključena duga svetla (#8553); nije iskoristio dnevni odmor u roku od 24 sata nakon prethodnog odmora (#8556);</li>
<li>nema svetloodbojni prsluk — ni vozač ni putnik: prsluk se drži u putničkom, teretnom vozilu i autobusu (čl. 30), a za vozača mopeda/motocikla nošenje u vožnji nije propisan uslov (#10701);</li>
<li>tehnička neispravnost, uključujući neispravan uređaj za upravljanje ili uređaj za zaustavljanje — to je razlog za isključenje VOZILA (čl. 289), ne vozača (#8552, #8558, #8584);</li>
<li>preopterećenje — takođe stvar vozila, a ne vozača; zamka je ponuđena kao „opterećeno preko svoje NOSIVOSTI za više od 5%", dok se pravilo meri UKUPNOM MASOM preko najveće dozvoljene za više od 5% (#8555).</li>
</ul>
<p class="mut">Pamtilica: brzina i crveno ulaze na listu tek kroz nasilničku vožnju (čl. 41 — npr. brzina veća za više od 90 km/h u naselju, odnosno dva prolaska na crveno u roku od 10 minuta), a nasilnička vožnja jeste stavka liste (obj. #8557).</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Isključenje VOZILA (čl. 289) — i šta posle</b>
<table>
<tr><th>ISKLJUČUJE SE</th><th>NE isključuje se (zamke)</th><th>pitanje</th></tr>
<tr><td>neispravan uređaj za upravljanje ili uređaj za zaustavljanje</td><td>teret u rasutom stanju nije prekriven</td><td>#8584</td></tr>
<tr><td>uređaji i oprema neispravni tako da mogu ugroziti bezbednost saobraćaja i životnu sredinu</td><td>proglašeno neispravnim na kontrolnom pregledu — „BEZ OBZIRA na utvrđeni stepen neispravnosti"</td><td>#8584</td></tr>
<tr><td>nije upisano u jedinstveni registar vozila</td><td>registraciona nalepnica nije POSTAVLJENA na propisan način</td><td>#8590</td></tr>
<tr><td>istekao rok važenja registracione nalepnice, odnosno potvrde o korišćenju tablica za privremeno označavanje</td><td>nema oznake za duga, teška i spora vozila, a ima obavezu označavanja</td><td>#8590</td></tr>
<tr><td>umesto registarskim tablicama označeno NEPROPISNIM tablicama</td><td>registarske tablice nisu POSTAVLJENE na propisan način</td><td>#8588</td></tr>
<tr><td>nepropisno ugrađeni uređaji za davanje posebnih svetlosnih I zvučnih znakova, a vozač ih ne ukloni u roku iz naredbe policijskog službenika</td><td>nepropisno ugrađeno žuto rotaciono ili trepćuće svetlo</td><td>#8588</td></tr>
<tr><td>pojedinačno proizvedeno ili prepravljeno, a nije izvršeno ispitivanje i izdato uverenje o ispitivanju</td><td>nije obavljen periodični pregled uređaja za pogon na gas</td><td>#8592</td></tr>
<tr><td>učestvuje u saobraćaju za vreme trajanja isključenja</td><td>prevozi više lica nego što je označeno u saobraćajnoj dozvoli</td><td>#8592</td></tr>
<tr><td>preopterećenje: ukupna masa preko najveće dozvoljene za više od 5%</td><td>isto to kao razlog da se isključi VOZAČ</td><td>obj. #8555</td></tr>
</table>
<p><b>Zašto je „proglašeno neispravnim na kontrolnom pregledu" zamka:</b> zamka je u dodatku <b>bez obzira na stepen</b>. Vozilo se isključuje kad je neispravan uređaj za upravljanje ili zaustavljanje, odnosno kad su uređaji i oprema neispravni tako da mogu ugroziti bezbednost saobraćaja i životnu sredinu (#8584) — dakle po TEŽINI neispravnosti, a ne automatski po svakoj oceni sa kontrolnog pregleda. Kad kontrolni pregled utvrdi baš takvu neispravnost, vozilo jeste isključeno — i onda mu sledi vanredni pregled (#8599, #8600).</p>
<p class="mut">Pamtilica: NEPROPISNA tablica i ISTEKLA nalepnica = isključenje; propisna tablica/nalepnica samo loše POSTAVLJENA = nije (#8588, #8590). Kod posebnih znakova gleda se VRSTA uređaja — „uređaji za davanje posebnih svetlosnih i zvučnih znakova", i to tek ako ih ne ukloniš u roku iz naredbe; žuto rotaciono ili trepćuće svetlo nije razlog (#8588).</p>
<p><b>Šta sledi:</b> oduzimaju se REGISTARSKE tablice uz potvrdu o oduzimanju (#8601). <b>Isključenje VOZILA</b> traje DO PRESTANKA RAZLOGA — nema roka od 24 sata i nema procene policijskog službenika koliko je potrebno (#8598); tablice se vraćaju kad se utvrdi da su razlozi prestali, a ne posle 24 časa ni u roku od tri dana (#8603). Ako tablice ne predaš: privode te prekršajnom sudu i angažuje se stručno lice da ih skine o tvom trošku (#10717).</p>
<p><b>Put na kom ti kretanje nije dozvoljeno:</b> naređenje je da BEZ ODLAGANJA, NAJKRAĆIM putem napustiš taj put (#8594). Ako ne postupiš po toj naredbi → isključuje se VOZILO, ne vozač (#10716). Ako je razlog za isključenje nastao tamo gde bi vozilo ometalo, odnosno ugrožavalo bezbednost saobraćaja, naređuje ti se da ga odvezeš POD NADZOROM policijskog službenika do najbližeg mesta gde je isključenje moguće (#8597).</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Alkohol: test, osporavanje, zadržavanje</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 320 300" style="max-width:400px;width:100%" role="img" aria-label="Vozač pod dejstvom alkohola: sa sadržajem manjim od 1,20 mg per ml zadržava se samo ako preti da nastavi vožnju, sa sadržajem većim od 1,20 zadržava se obavezno do otrežnjenja najduže 12 sati. Odbijanje ispitivanja povlači isto obavezno zadržavanje. Donja granica pojma pod dejstvom alkohola nije prikazana jer je propisi ne daju."><defs><linearGradient id="alkPodDejstvom" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8b000" stop-opacity="0"/><stop offset="0.12" stop-color="#e8b000" stop-opacity="1"/><stop offset="1" stop-color="#e8b000" stop-opacity="1"/></linearGradient></defs><rect x="10" y="3" width="300" height="46" rx="5" fill="none" stroke="#c0392b" stroke-width="2"/><text x="160" y="22" text-anchor="middle" font-size="13" fill="#c0392b">ODBIJE ISPITIVANJE →</text><text x="160" y="41" text-anchor="middle" font-size="13" fill="#c0392b">isto: obavezno zadržavanje</text><path d="M255 49 L255 66" stroke="#c0392b" stroke-width="2"/><polygon points="255,77 249,64 261,64" fill="#c0392b"/><rect x="14" y="82" width="194" height="28" fill="url(#alkPodDejstvom)"/><rect x="212" y="82" width="94" height="28" fill="#c0392b"/><line x1="210" y1="74" x2="210" y2="118" stroke="currentColor" stroke-width="2"/><text x="210" y="70" text-anchor="middle" font-size="14" fill="currentColor">1,20</text><text x="120" y="101" text-anchor="middle" font-size="13" fill="#2a333d">POD DEJSTVOM ALKOHOLA</text><text x="286" y="130" text-anchor="middle" font-size="12" fill="currentColor">mg/ml</text><rect x="14" y="142" width="14" height="14" fill="#e8b000"/><text x="36" y="154" font-size="13" fill="currentColor">MANJI od 1,20 (npr. 1,00):</text><text x="36" y="172" font-size="13" fill="currentColor">zadržan SAMO ako preti da</text><text x="36" y="190" font-size="13" fill="currentColor">nastavi vožnju posle isključenja</text><rect x="14" y="206" width="14" height="14" fill="#c0392b"/><text x="36" y="218" font-size="13" fill="currentColor">VEĆI od 1,20:</text><text x="36" y="236" font-size="13" fill="currentColor">OBAVEZNO zadržan do otrežnjenja,</text><text x="36" y="254" font-size="13" fill="currentColor">najduže 12 h</text><text x="160" y="278" text-anchor="middle" font-size="12" fill="currentColor">žuta traka važi samo za vozača</text><text x="160" y="295" text-anchor="middle" font-size="12" fill="currentColor">POD DEJSTVOM alkohola</text></svg>
</div>
<p><b>Isto to rečima:</b> vozač koji je POD DEJSTVOM alkohola sa sadržajem u krvi VEĆIM od 1,20 mg/ml zadržava se OBAVEZNO, do otrežnjenja, najduže 12 sati (#8569). Vozač koji je POD DEJSTVOM alkohola, a sadržaj mu je MANJI od 1,20 mg/ml (recimo 1,00) — može biti zadržan SAMO ako izražava nameru, odnosno ako postoji opasnost da će nastaviti da upravlja vozilom pošto je isključen; nije uslov da je izazvao nezgodu i nema obaveznog zadržavanja (#8571, #8572). Uslov „pod dejstvom alkohola" je deo pravila: obe rečenice polaze od njega. Ko ODBIJE ispitivanje: isključenje iz saobraćaja <b>i obavezno zadržavanje</b> — ne „samo isključenje", i ne sprovođenje na analizu krvi (#8570).</p>
<p><b>Test i osporavanje:</b> po nalogu ovlašćenog lica dužan si da postupiš BEZ ODLAGANJA i omogućiš ispitivanje (alkometar i dr.); obaveza je bezuslovna — ne oslobađa te ni to što tražiš analizu krvi, ni to što prekineš vožnju (#8559, #8560). Analizu krvi, odnosno krvi i urina tražiš o SOPSTVENOM trošku i samo ako OSPORAVAŠ rezultat već izvršenog ispitivanja (#8561), i to u PISANOJ formi, NA LICU MESTA, u zapisnik u kome su utvrđeni rezultati — ne usmeno i ne „u roku od 24 sata" (#8562). <b>Ali pazi:</b> i sam zahtev za analizu krvi, odnosno urina jeste razlog da te privremeno isključe iz saobraćaja (#8553; stavka 4 liste sa vrha kartice) — traženje analize nije bezopasan potez, nego pravni lek koji te istovremeno skida sa puta.</p>
<p><b>Privođenje:</b> vozača zatečenog u prekršaju koji je NASTAVIO sa tim prekršajem ili izražava nameru da ga nastavi — privode prekršajnom sudu (#10714). Zadržavanje najduže 24 sata dolazi u obzir SAMO ako ne može odmah da bude priveden (#10715).</p>
<p class="mut">Pamtilica: dva roka — <b>12 sati</b> je otrežnjenje (#8569), <b>24 sata</b> je „ne može odmah pred sud" (#10715).</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Kontrolni i vanredni tehnički pregled</b>
<table>
<tr><th></th><th>KONTROLNI</th><th>VANREDNI</th></tr>
<tr><td>Kada</td><td>kad policijski službenik POSUMNJA u tehničku ispravnost — sumnja je dovoljna (#8575)</td><td>posle isključenja vozila zbog neispravnosti utvrđene na kontrolnom pregledu; i posle nezgode u kojoj su oštećeni vitalni sklopovi i uređaji (#8575, #8599, #8600)</td></tr>
<tr><td>Gde</td><td>samo u objektu KOJI ODREDI policijski službenik (#8576)</td><td>po pravilu u objektu u kom je obavljen kontrolni pregled (#8599); u drugom objektu samo kad to DOZVOLI organ čiji je službenik uputio vozilo na kontrolni (#8600)</td></tr>
</table>
<p><b>Redosled:</b> sumnja → kontrolni pregled → ako se na njemu utvrdi neispravnost koja ugrožava bezbednost, vozilo se isključuje (#8584) → vanredni pregled, po pravilu tamo gde je bio kontrolni (#8599, #8600).</p>
<p><b>Vozač:</b> po nalogu za kontrolni pregled postupaš BEZ ODLAGANJA i omogućavaš pregled — ne „najkasnije u roku od 24 sata" (#8577); obaveza važi i kad imaš potvrdu o tehničkoj ispravnosti i bez obzira na to da li je vozilo opterećeno (#8578). <b>Trošak</b> kontrolnog pregleda snosi vlasnik, odnosno korisnik vozila SAMO kada se na pregledu utvrdi tehnička neispravnost (#8579).</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Premeštanje, uklanjanje i ko šta plaća</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 320 304" style="max-width:400px;width:100%" role="img" aria-label="Premeštanje: gore isključeno vozilo stoji na kolovozu tako da saobraćaj ne može da prođe, pa sme da se premesti; dole isto takvo vozilo stoji tako da saobraćaj slobodno prolazi, pa se ne premešta. Kriterijum je ometanje saobraćaja, a ne mesto na kome vozilo stoji."><text x="160" y="15" text-anchor="middle" font-size="13" fill="currentColor">PREMEŠTANJE: pitanje je da li</text><text x="160" y="33" text-anchor="middle" font-size="13" fill="currentColor">vozilo OMETA saobraćaj</text><rect x="8" y="50" width="304" height="46" fill="#9aa7b4"/><rect x="112" y="56" width="76" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="130" cy="79" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="172" cy="79" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18 68 L84 68" fill="none" stroke="#c0392b" stroke-width="3"/><line x1="92" y1="60" x2="106" y2="76" stroke="#c0392b" stroke-width="3"/><line x1="106" y1="60" x2="92" y2="76" stroke="#c0392b" stroke-width="3"/><text x="160" y="118" text-anchor="middle" font-size="13" fill="currentColor">saobraćaj ne može da prođe</text><text x="160" y="136" text-anchor="middle" font-size="13" fill="currentColor">OMETA → sme da se premesti</text><rect x="8" y="154" width="304" height="64" fill="#9aa7b4"/><line x1="10" y1="194" x2="310" y2="194" stroke="#fff" stroke-width="2" stroke-dasharray="12 10"/><rect x="112" y="160" width="76" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="130" cy="183" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="172" cy="183" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 206 L286 206" fill="none" stroke="#1f7a3f" stroke-width="3"/><polygon points="300,206 286,200 286,212" fill="#1f7a3f"/><text x="160" y="240" text-anchor="middle" font-size="13" fill="currentColor">saobraćaj prolazi</text><text x="160" y="258" text-anchor="middle" font-size="13" fill="currentColor">NE OMETA → ne premešta se</text><text x="160" y="281" text-anchor="middle" font-size="12" fill="currentColor">isto vozilo na kolovozu — razlikuje se</text><text x="160" y="298" text-anchor="middle" font-size="12" fill="currentColor">samo to da li saobraćaj može da prođe</text></svg>
</div>
<p><b>Isto to rečima:</b> i vozilo kojim je upravljao isključeni vozač i vozilo koje je isključeno iz saobraćaja policijski službenik sme da premesti ili naloži da se premesti SAMO kada ono ometa nesmetano i bezbedno odvijanje saobraćaja — nikad „svako takvo vozilo" (#8563, #8564, #8565, #8566). Nije opcija ni da vozač završi započetu vožnju, ni da mu se vozilo privremeno oduzme (#8563, #8564). Jedini kriterijum je OMETANJE, a ne to gde vozilo stoji.</p>
<p><b>Uklanjanje je druga mera</b> — kod nje se ometanje uopšte ne pominje. Vozaču vozila parkiranog ili zaustavljenog suprotno propisima naređuje se da vozilo ODMAH ukloni, pod pretnjom prinudnog izvršenja; nije „u roku od 15 minuta" i rešenje mu se ne uručuje odmah na licu mesta (#8606). Rešenje dolazi kasnije i u njemu stoji rok: ako u tom roku ne ukloniš vozilo, ono se uklanja na za to određeno mesto o trošku vozača ili vlasnika, odnosno korisnika (#8609). Za štete od započinjanja uklanjanja do preuzimanja vozila odgovara pravno lice, odnosno preduzetnik kome je uklanjanje povereno (#8611).</p>
<table>
<tr><th>Trošak</th><th>Ko plaća</th><th>pitanje</th></tr>
<tr><td>premeštanje vozila (isključen vozač ili isključeno vozilo)</td><td>vlasnik, odnosno korisnik vozila</td><td>#8567, #8568</td></tr>
<tr><td>obezbeđenje isključenog vozila i tereta, smeštaj putnika</td><td>vlasnik, odnosno korisnik vozila</td><td>#8593</td></tr>
<tr><td>uklanjanje nepropisno parkiranog vozila posle roka iz rešenja</td><td>vozač ili vlasnik, odnosno korisnik vozila</td><td>#8609</td></tr>
<tr><td>skidanje tablica kad ih ne predaš</td><td>vozač</td><td>#10717</td></tr>
<tr><td>analiza krvi/urina koju sam tražiš</td><td>vozač — o sopstvenom trošku</td><td>#8561, #8562</td></tr>
<tr><td>kontrolni tehnički pregled</td><td>vlasnik, odnosno korisnik vozila — SAMO ako se utvrdi neispravnost</td><td>#8579</td></tr>
<tr><td>štete od započinjanja uklanjanja do preuzimanja vozila</td><td>pravno lice, odnosno preduzetnik kome je povereno uklanjanje</td><td>#8611</td></tr>
</table>
<p class="mut">Pamtilica: kod premeštanja i obezbeđenja tačan odgovor glasi doslovno „vlasnik, odnosno korisnik vozila" — ne „vozač" (#8567, #8568, #8593). Vozač se u odgovoru pojavljuje tek kod uklanjanja posle roka iz rešenja (#8609) i kod skidanja tablica (#10717).</p>
</div>
`,
};

CARDS['oznake-kolovoz'] = {
  title: 'Oznake na kolovozu (linije, strelice, prelazi)',
  html: `
<div class="vgrid" style="grid-template-columns:auto 1fr">
  <div class="vg vgFast"><b>―――― neisprekidana</b></div><div class="vg" style="text-align:left">ZABRANJENO je prelaziti je i kretati se po njoj (razdvajanje smerova, ivica...)</div>
  <div class="vg vgSlow"><b>- - - - isprekidana</b></div><div class="vg" style="text-align:left">SME da se prelazi (uz ostala pravila)</div>
  <div class="vg vgHead"><b>―― - - kombinovana</b></div><div class="vg" style="text-align:left">važi linija BLIŽA tvom vozilu</div>
  <div class="vg vgHead"><b>STOP linija</b></div><div class="vg" style="text-align:left">neisprekidana poprečna — mesto zaustavljanja</div>
  <div class="vg vgHead"><b>strelice u traci</b></div><div class="vg" style="text-align:left">obavezan smer kretanja iz te trake</div>
  <div class="vg vgHead"><b>pešački prelaz ("zebra")</b></div><div class="vg" style="text-align:left">na njemu je zabranjeno zaustavljanje, preticanje i obilaženje</div>
</div>
<p style="margin-top:12px"><b>Uzdužne linije (Pravilnik čl. 63-64)</b> — šta smeš, a šta ne:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<line x1="60" y1="4" x2="60" y2="146" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/>
      ${carG(34, 112, '#2c6aa0')}<path d="M34 92 Q34 66 86 56" stroke="#2c6aa0" stroke-width="3" fill="none" stroke-dasharray="6 5"/>${carG(86, 36, '#2c6aa0')}
      ${yesSign(100, 128)}</svg>
    <b>ISPREKIDANA</b><span>sme da se prelazi (uz ostala pravila)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<line x1="60" y1="4" x2="60" y2="146" stroke="#fff" stroke-width="4"/>
      ${carG(34, 100, '#2c6aa0')}<path d="M34 80 Q34 58 66 50" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      ${noSign(78, 44)}</svg>
    <b>NEISPREKIDANA</b><span>ne sme se prelaziti ni voziti po njoj</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<line x1="54" y1="4" x2="54" y2="146" stroke="#fff" stroke-width="4"/><line x1="66" y1="4" x2="66" y2="146" stroke="#fff" stroke-width="4"/>
      ${carG(30, 104, '#2c6aa0')}${carG(92, 46, '#5f6d7a', 180)}${noSign(60, 128)}</svg>
    <b>UDVOJENA NEISPREKIDANA</b><span>zabrana važi za oba smera</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<line x1="54" y1="6" x2="54" y2="144" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/><line x1="66" y1="6" x2="66" y2="144" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/>
      <rect x="26" y="6" width="68" height="26" rx="6" fill="#2a333d"/><path d="M42 12 L56 26 M56 12 L42 26" stroke="#c0392b" stroke-width="4" stroke-linecap="round"/>
      <path d="M74 12 L74 26 M74 26 L68 20 M74 26 L80 20" stroke="#1f9d55" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${carG(88, 100, '#2c6aa0')}</svg>
    <b>UDVOJENA ISPREKIDANA</b><span>traka sa izmenljivim smerom — važi semafor iznad trake</span>
  </div>
</div>
<div class="signRow lineRow">
  <div class="signCell wide">
    <svg viewBox="0 0 200 150">${road(200, 150)}<line x1="94" y1="4" x2="94" y2="146" stroke="#fff" stroke-width="4"/><line x1="106" y1="6" x2="106" y2="144" stroke="#fff" stroke-width="4" stroke-dasharray="16 12"/>
      ${carG(58, 104, '#2c6aa0')}<path d="M58 84 Q58 62 84 54" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5"/>${noSign(76, 40)}
      ${carG(146, 46, '#1f7a3f', 180)}<path d="M146 66 Q146 92 120 102" stroke="#1f7a3f" stroke-width="3" fill="none" stroke-dasharray="6 5"/>${yesSign(126, 118)}</svg>
    <b>KOMBINOVANA</b><span>gledaš liniju bliže SVOJOJ traci: <b>puna uz tebe = ne smeš</b> (levo vozilo) · <b>isprekidana uz tebe = smeš</b> (desno vozilo)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}
      <line x1="60" y1="4" x2="60" y2="86" stroke="#fff" stroke-width="4" stroke-dasharray="26 8"/><line x1="60" y1="90" x2="60" y2="146" stroke="#fff" stroke-width="4"/>
      ${carG(34, 118, '#2c6aa0')}<text x="60" y="80" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">▲</text></svg>
    <b>LINIJA UPOZORENJA</b><span>duže crte = puna linija samo što nije počela; završi preticanje</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150"><rect x="0" y="0" width="120" height="150" fill="#6b7f5e"/><rect x="16" y="0" width="104" height="150" fill="#9aa7b4"/>
      <line x1="22" y1="4" x2="22" y2="146" stroke="#fff" stroke-width="4"/><line x1="70" y1="6" x2="70" y2="144" stroke="#fff" stroke-width="3" stroke-dasharray="16 12"/>
      ${carG(46, 92, '#2c6aa0')}</svg>
    <b>IVIČNA LINIJA</b><span>označava gde se kolovoz završava (dalje je bankina)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<rect x="0" y="52" width="120" height="46" fill="#9aa7b4"/>
      <line x1="60" y1="4" x2="60" y2="48" stroke="#fff" stroke-width="4"/><line x1="60" y1="102" x2="60" y2="146" stroke="#fff" stroke-width="4"/>
      <line x1="36" y1="52" x2="36" y2="98" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/>
      <path d="M60 100 Q60 74 96 74" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 6"/>
      ${carG(60, 130, '#2c6aa0')}</svg>
    <b>LINIJA VODILJA</b><span>kratka isprekidana — vodi te kroz raskrsnicu</span>
  </div>
</div>
<p style="margin-top:12px"><b>Poprečne oznake (čl. 65-66)</b> — pružaju se popreko kolovoza:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<rect x="6" y="60" width="108" height="10" fill="#fff"/>
      <text x="60" y="96" text-anchor="middle" font-size="20" fill="#fff" font-weight="bold">STOP</text>${carG(60, 122, '#2c6aa0')}</svg>
    <b>LINIJA ZAUSTAVLJANJA</b><span>mesto ispred koga se staje (uz znak ili crveno svetlo)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<path d="M10 146 L58 20 M32 146 L80 20 M54 146 L102 20" stroke="#fff" stroke-width="7"/>
      ${carG(30, 120, '#2c6aa0')}<path d="M30 100 Q30 74 78 66" stroke="#2c6aa0" stroke-width="3" fill="none" stroke-dasharray="6 5"/></svg>
    <b>KOSNIK</b><span>zatvaranje ILI otvaranje trake: ako se broj traka ispred SMANJUJE — tvoja se uliva u susednu (pređi); ako se POVEĆAVA — nastaje nova (npr. izlazna)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}
      <path d="M14 132 L106 132 M22 116 L98 116 M30 100 L90 100 M38 84 L82 84 M46 68 L74 68" stroke="#fff" stroke-width="6"/>
      <path d="M104 40 Q84 52 70 62" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 5"/></svg>
    <b>GRANIČNIK</b><span>deo kolovoza na kome je saobraćaj zabranjen (ulivanje sa prilaza)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 150">${road(120, 150)}<path d="M18 142 L60 24 L102 142 Z" fill="none" stroke="#fff" stroke-width="5"/>
      <path d="M40 142 L60 86 L80 142" fill="none" stroke="#fff" stroke-width="5"/>
      ${carG(28, 96, '#2c6aa0')}${carG(92, 96, '#5f6d7a')}</svg>
    <b>POLJE ZA USMERAVANJE</b><span>razdvaja tokove — po njemu se ne vozi ni ne parkira</span>
  </div>
</div>
<p><b>Boje (Pravilnik o signalizaciji čl. 59):</b> oznake su po pravilu BELE; ŽUTE su izuzeci — zona radova, javni prevoz (BUS traka), elektronska naplata putarine, površine za posebne namene (mesta zabrane zaustavljanja/parkiranja, stajališta, taksi) i invalidska parking mesta (čiji se delovi smeju obeležiti i plavom).</p>`,
};

CARDS['skretanje'] = {
  title: 'Skretanje, prestrojavanje i polukružno okretanje',
  html: `
<div class="kSek" data-sub="133,137">
<p><b>Prestrojavanje (čl. 48):</b> na DOVOLJNOM ODSTOJANJU pred raskrsnicom zauzmi traku za svoj smer: za levo — krajnja leva, za desno — krajnja desna (na dvosmernom putu "krajnja leva" je uz središnju liniju!).</p>
<svg viewBox="0 0 306 190" role="img" aria-label="Kolovoz sa tri trake i strelice: za skretanje levo zauzimaš krajnju levu traku, za skretanje desno krajnju desnu traku, srednja traka vodi pravo." style="max-width:306px;width:100%;display:block;margin:6px auto">
  <rect x="20" y="8" width="266" height="130" fill="#9aa7b4"/>
  <line x1="109" y1="8" x2="109" y2="138" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
  <line x1="197" y1="8" x2="197" y2="138" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
  <g stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M64 126 L64 60 L36 60"/>
    <path d="M36 60 L48 50 M36 60 L48 70"/>
    <path d="M153 126 L153 46"/>
    <path d="M153 46 L141 58 M153 46 L165 58"/>
    <path d="M242 126 L242 60 L270 60"/>
    <path d="M270 60 L258 50 M270 60 L258 70"/>
  </g>
  <text x="64" y="158" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">levo:</text>
  <text x="64" y="175" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">krajnja leva</text>
  <text x="242" y="158" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">desno:</text>
  <text x="242" y="175" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">krajnja desna</text>
</svg>
<p><b>Propuštanja pri skretanju (čl. 47):</b> sa zemljanog puta/parkinga propuštaš SVE · pri skretanju preko biciklističke staze propuštaš bicikle · pravilo desne strane kad ništa drugo ne reguliše · pri skretanju ULEVO propuštaš vozila iz suprotnog smera.</p>
</div>
<div class="kSek" data-sub="137">
<p><b>Ne ulazi u raskrsnicu (čl. 49)</b> — ni kad imaš zeleno/prvenstvo — ako bi zbog gužve ostao na raskrsnici ili pešačkom prelazu i blokirao druge.</p>
</div>
<div class="kSek" data-sub="133">
<p><b>Polukružno okretanje ZABRANJENO (čl. 50):</b> tunel, most, vijadukt, podvožnjak, nadvožnjak, smanjena vidljivost, nedovoljna preglednost, nedovoljna širina puta. (Prepoznaješ listu? Skoro ista kao za preticanje — "opasna mesta".)</p>
</div>
<div class="kSek" data-sub="137">
<p style="margin-top:18px"><b>PRILAZ RASKRSNICI I PROLAZAK KROZ NJU (čl. 48 i 49)</b></p>
<p><b>Brzina na prilazu (čl. 48, stav 1):</b> vozač je dužan da <b>prilagodi vožnju uslovima saobraćaja na raskrsnici</b>, a naročito da vozi <b>brzinom pri kojoj može da se zaustavi i propusti</b> vozila koja na raskrsnici imaju prvenstvo prolaza.</p>
<p class="mut">Zamka: to pitanje traži <b>DVA</b> tačna odgovora, jer zakonska rečenica ima dva dela — „uslovima saobraćaja na raskrsnici" <b>i</b> „brzinom pri kojoj može da se zaustavi i propusti". Ako zaokružiš samo jedan, pitanje je netačno. Ponuđene zamke su „kako bi što pre stigao na odredište" i „da što pre prođe kroz raskrsnicu" — žurba nikad nije zakonski kriterijum.</p>
<p><b>Prestrojavanje — zamka „neposredno pred raskrsnicom":</b> sva tri ponuđena odgovora zvuče razumno, razlika je u <b>jednoj sintagmi</b>.</p>
<table>
<tr><th>Ponuđeni odgovor</th><th>Presuda</th></tr>
<tr><td>„može proći raskrsnicu u željenom smeru <b>bilo kojom trakom</b>, ako time ne ometa ili ugrožava"</td><td>Netačno — traka za smer nije stvar tvoje procene</td></tr>
<tr><td>„može i <b>neposredno pred raskrsnicom</b> da zauzme položaj na traci"</td><td>Netačno — to je prekasno</td></tr>
<tr><td>„dužan je da na <b>dovoljnom odstojanju</b> pred raskrsnicom izvrši prestrojavanje"</td><td><b>TAČNO</b> (čl. 48, stav 2)</td></tr>
</table>
<p><b>Ulazak na put sa prvenstvom prolaza:</b> propuštaš <b>SVA vozila</b> koja se kreću tim putem. Ne „samo ona zdesna", ne „samo ona sleva", ne „samo motorna". Tako glasi i sam znak <b>II-1 „ustupanje prvenstva prolaza"</b>: naredba vozaču da ustupi prvenstvo <b>vozilima koja se kreću putem na koji nailazi</b> (Pravilnik o saobraćajnoj signalizaciji, čl. 25).</p>
<p class="mut">Zašto ovde ne odlučuje „pravilo desne strane"? Zato što se ono primenjuje tek kad prvenstvo <b>nije regulisano na drugi način</b>. Pažnja: na raskrsnici koja jeste regulisana (znakom, semaforom ili policajcem) pravila desne strane i levog skretanja i dalje važe — ali samo za <b>međusobno</b> prvenstvo onih koji istovremeno dobiju pravo prolaza. Čim stoji znak II-1 ili II-2, prvenstvo <b>jeste</b> regulisano — i ti propuštaš ceo taj put, a ne polovinu.</p>
</div>

<div class="kSek" data-sub="133">
<p style="margin-top:16px"><b>Strelica u traci je naredba — slikovna pitanja</b></p>
<p>Kad si se već zaustavio u traci, smeš <b>samo tamo gde strelica na asfaltu pokazuje</b>. Zeleno svetlo ti ne otvara drugi smer, i nema „popravnog" iz pogrešne trake — jedini ispravan postupak je da nastaviš kuda strelica kaže i da se vratiš kasnije.</p>
<table>
<tr><th>Šta se vidi na slici</th><th>Šta se sme</th></tr>
<tr><td>Široka gradska ulica, pogled sa mopeda: <b>tri trake</b>, u levoj strelica savijena <b>ulevo</b>, u tvojoj (srednjoj) strelica <b>pravo</b>, u desnoj strelice savijene <b>udesno</b>. Ispred je pešački prelaz, semafor desno je <b>zelen</b>.</td><td>Samo <b>pravo</b>. Skretanje ulevo <b>nije dozvoljeno</b>, skretanje udesno <b>nije dozvoljeno</b> — bez obzira na zeleno.</td></tr>
<tr><td>Raskrsnica sa kolonom vozila, pogled sa mopeda: u tvojoj traci <b>jedna strelica savijena ulevo</b>. Desno na stubu znak <b>ustupanje prvenstva prolaza</b> (trougao vrhom nadole) i semafor sa <b>zelenim</b> svetlom.</td><td>Skretanje ulevo <b>JESTE dozvoljeno</b> — stojiš u traci za levo.</td></tr>
</table>
<p><b>Zamka nad zamkama:</b> ista fotografija sa tri strelice pojavljuje se u <b>tri različita pitanja</b> — jednom te pitaju „šta možete", drugi put „da li vam je dozvoljeno ulevo", treći put „da li vam je dozvoljeno udesno". Ne pamti odgovor po slici, nego pročitaj <b>šta te pitaju</b>. I obrnuto: kod slike sa strelicom ulevo tačan odgovor je potvrdan („jeste dozvoljeno"), pa te navika da uvek odgovoriš „nije dozvoljeno" tu obara.</p>
<p class="mut">Još jedna zamka iz istog seta: „nastaviti kretanje u sva tri smera, ukoliko ne ometate ili ugrožavate bezbednost saobraćaja". Netačno — oznaka na kolovozu se ne poništava time što nikoga ne ometaš.</p>
</div>

<div class="kSek" data-sub="137">
<p style="margin-top:16px"><b>Ne ulazi u raskrsnicu ako ćeš u njoj ostati (čl. 49)</b></p>
<p>Zakon kaže: vozač <b>ne sme</b> vozilom da uđe u raskrsnicu, <b>iako ima prvenstvo prolaza ili mu je semaforom to dozvoljeno</b>, ako će se zbog gustine saobraćaja zaustaviti <b>na raskrsnici ili pešačkom prelazu</b> i time ometati ili onemogućiti saobraćaj vozila, odnosno pešaka.</p>
<p>U testu se to isto pravilo pojavljuje u <b>dva ruha</b> — jednom kao „imam zeleno", drugi put kao „ja sam na putu sa prvenstvom prolaza". Odgovor je oba puta isti: <b>staneš i čekaš da se izlaz oslobodi</b>.</p>
<svg viewBox="0 0 306 232" role="img" aria-label="Raskrsnica: za tebe je zeleno svetlo, ali vozilo ispred stoji iza raskrsnice, pa ne ulaziš u raskrsnicu; ispred tebe je pešački prelaz." style="max-width:306px;width:100%;display:block;margin:8px auto">
  <rect x="96" y="0" width="114" height="214" fill="#9aa7b4"/>
  <rect x="0" y="60" width="306" height="80" fill="#9aa7b4"/>
  <line x1="153" y1="0" x2="153" y2="58" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
  <line x1="153" y1="170" x2="153" y2="212" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
  <line x1="0" y1="100" x2="94" y2="100" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
  <line x1="212" y1="100" x2="306" y2="100" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
  <g fill="#fff">
    <rect x="100" y="148" width="11" height="20"/>
    <rect x="119" y="148" width="11" height="20"/>
    <rect x="138" y="148" width="11" height="20"/>
    <rect x="157" y="148" width="11" height="20"/>
    <rect x="176" y="148" width="11" height="20"/>
    <rect x="195" y="148" width="11" height="20"/>
  </g>
  <rect x="96" y="60" width="114" height="80" fill="#c0392b" opacity=".5" stroke="#c0392b" stroke-width="2"/>
  <text x="153" y="106" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff">NE ULAZI</text>
  <rect x="168" y="22" width="34" height="32" rx="6" fill="#e0c53a" stroke="#8a7a10" stroke-width="1.5"/>
  <rect x="168" y="176" width="34" height="32" rx="6" fill="#c0392b" stroke="#7f1d1d" stroke-width="1.5"/>
  <text x="185" y="198" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff">ti</text>
  <rect x="56" y="176" width="20" height="30" rx="5" fill="#4a5560"/>
  <circle cx="66" cy="191" r="7" fill="#22c55e"/>
  <line x1="204" y1="38" x2="221" y2="38" stroke="currentColor" stroke-width="1.5"/>
  <line x1="208" y1="157" x2="221" y2="157" stroke="currentColor" stroke-width="1.5"/>
  <text x="224" y="18" font-size="12" fill="currentColor">vozilo</text>
  <text x="224" y="35" font-size="12" fill="currentColor">ispred</text>
  <text x="224" y="52" font-size="12" fill="currentColor">stoji</text>
  <text x="224" y="158" font-size="12" fill="currentColor">pešački</text>
  <text x="224" y="175" font-size="12" fill="currentColor">prelaz</text>
  <text x="48" y="188" text-anchor="end" font-size="12" fill="currentColor">zeleno</text>
  <text x="48" y="205" text-anchor="end" font-size="12" fill="currentColor">svetlo</text>
</svg>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">imaš zeleno, ali izlaz iz raskrsnice je zauzet — ostaješ ispred zebre</p>
<p><b>Četiri odgovora koji su ovde UVEK netačni</b> (vrte se kroz sva pitanja o gužvi na raskrsnici):</p>
<table>
<tr><th>Ponuđeno</th><th>Zašto pada</th></tr>
<tr><td>„<b>mora</b> da uđe, bez obzira na gustinu, da ne bi ometao vozila koja se kreću iza njega"</td><td>Kolona iza tebe nije zakonski razlog ni za šta</td></tr>
<tr><td>„može da uđe i stane na pešačkom prelazu, <b>ako je pešacima semaforom zabranjen prolaz</b>"</td><td>Crveno za pešake ne pretvara zebru u parking</td></tr>
<tr><td>„može, jer se <b>kreće putem sa prvenstvom prolaza</b>"</td><td>Čl. 49 izričito pominje prvenstvo — i svejedno zabranjuje ulazak</td></tr>
<tr><td>„može ako gustina dozvoljava da <b>ne stane na pešačkom prelazu</b>, iako time ometa saobraćaj vozila"</td><td>Zabrana pokriva i zebru <b>i</b> raskrsnicu; smetnja vozilima je isto smetnja</td></tr>
</table>
<p class="mut">Slikovne varijante su prepoznatljive: sa mopeda vidiš zebru tik ispred sebe, a iza nje kolonu koja stoji; ili je nacrtan pogled odozgo gde crveno vozilo ima <b>zeleno svetlo</b>, ali žuto vozilo odmah iza raskrsnice ne miče; ili crveno vozilo ide <b>putem sa prvenstvom prolaza</b> (žuti romb pored kolovoza), a ispred njega pešački prelaz i zaglavljena kolona. Situacija je različita, odgovor isti.</p>
<p><b>Ključ za celu ovu podoblast:</b> na raskrsnici te uvek pitaju tri iste stvari — <b>možeš li da staneš</b> (brzina na prilazu), <b>jesi li u pravoj traci</b> (prestrojavanje i strelica), i <b>gde ćeš stati</b> (nikad u raskrsnici, nikad na zebri). Prvenstvo prolaza i zeleno svetlo daju ti <b>pravo da prođeš</b>, ali ti nikad ne daju <b>pravo da blokiraš</b>.</p>
</div>
`,
};

CARDS['pokazivaci'] = {
  title: 'Pokazivači pravca i sva 4 žmigavca',
  html: `
<p><b>Pokazivač pravca daješ:</b> pre svake promene pravca ili trake — prestrojavanje, skretanje, preticanje, obilaženje, polukružno, uključivanje u saobraćaj — i to pre početka radnje, a prestaje čim radnju završiš.</p>
<p><b>SVA 4 pokazivača (čl. 61) obavezno uključuješ:</b></p>
<table>
<tr><td>1</td><td>za vreme ulaska/izlaska putnika</td></tr>
<tr><td>2</td><td>kad upozoravaš druge na OPASNOST u saobraćaju</td></tr>
<tr><td>3</td><td>u izrazito smanjenoj vidljivosti (gusta magla, dim)</td></tr>
<tr><td>4</td><td>kad si POSLEDNJI u zaustavljenoj koloni van naselja</td></tr>
<tr><td>5</td><td>kretanje UNAZAD</td></tr>
<tr><td>6</td><td>zaustavljanje na kolovozu (osim propisnog parkiranja/znaka)</td></tr>
</table>
<p><b>Zvučni i svetlosni znak upozorenja (čl. 59 i 60)</b> — cela ova podoblast staje u jednu rečenicu: <b>truba je za OPASNOST, nikad za nervozu.</b> Čim u pitanju piše da hoćeš nekoga da požuriš, tačan odgovor je strpljenje.</p>

<p><b>Zvučni znak si DUŽAN da upotrebiš</b> „kada to zahtevaju razlozi bezbednosti saobraćaja, a naročito" u tri nabrojana slučaja:</p>
<table>
<tr><th>Situacija</th><th>Gde</th></tr>
<tr><td>Upozoravaš vozača kog želiš da <b>pretekneš ili obiđeš</b>, ako bi bez tog znaka postojala opasnost od nezgode</td><td>na putu <b>van naselja</b></td></tr>
<tr><td>Pored kolovoza je <b>dete</b> koje ne obraća pažnju na kretanje vozila</td><td>svuda</td></tr>
<tr><td>Pre ulaska u <b>nepreglednu i uzanu krivinu</b> ili dolaska na <b>prevoj</b>, gde je mimoilaženje otežano</td><td>na putu <b>van naselja</b></td></tr>
</table>
<p class="mut">Reč „naročito" znači da lista nije zatvorena — obaveza postoji kad god bezbednost to traži. Zato i u gradskoj ulici (slika sa taksijem koji stoji sa uključenim pokazivačima, a ti ga obilaziš) tačan odgovor glasi da si dužan da daš zvučni znak, iako to nije nijedna od tri nabrojane tačke.</p>

<p><b>Koliko dugo?</b> „U meri koja je dovoljna da se drugi učesnici u saobraćaju upozore." Zakon ne pominje sekunde — i „ne duže od 3 sekunde" i „najmanje 5 sekundi" su izmišljene brojke. Zabranjen je zvučni znak <b>promenljive frekvencije</b> (sirena), osim u slučajevima koje zakon predviđa.</p>

<p><b>Šta se traži na svakoj slici iz ove podoblasti:</b></p>
<table>
<tr><th>Šta vidiš</th><th>Tačan odgovor</th></tr>
<tr><td>Put van naselja, vozilo <b>2</b> već pretiče u levoj traci, a vozilo <b>1</b> ispred njega uključilo levi pokazivač</td><td>dužan je zvučni znak</td></tr>
<tr><td>Gradska ulica, taksi zaustavljen ispred kolone parkiranih vozila sa uključenim pokazivačima — obilaziš ga</td><td>dužan si zvučni znak</td></tr>
<tr><td>Uzan put uz odsečenu stenu, iza odbojne ograde se ništa ne vidi — nepregledna krivina</td><td>dužan si zvučni znak</td></tr>
<tr><td>Dvoje dece trči za loptom preko kolovoza, ne gledaju u saobraćaj</td><td>dužan si zvučni znak</td></tr>
<tr><td>Iza vozila auto-škole si, leva traka zauzeta — nema uslova za preticanje</td><td><b>strpljivo</b> nastaviš vožnju do mesta gde smeš da pretekneš</td></tr>
<tr><td>Zeleno svetlo na semaforu, a vozilo auto-škole ispred tebe još nije krenulo</td><td><b>strpljivo</b> sačekaš da krene</td></tr>
<tr><td>Zaustavljena kolona na putu van naselja (radovi), ti si poslednji</td><td>pališ <b>sva četiri</b> pokazivača</td></tr>
</table>
<p class="mut">U dva slučaja sa strpljivim čekanjem (vozilo auto-škole i kolona na semaforu) nije tačan ni zvučni, ni svetlosni, ni „oba" — požurivanje nije razlog za znak upozorenja. A tamo gde jeste obavezan, traži se <b>samo zvučni</b>: ponuda „i zvučni i svetlosni znak" je pogrešna, jer je svetlosni tvoja mogućnost, a ne dodatna obaveza.</p>

<p><b>Svetlosni znak upozorenja</b> = <b>uzastopno ili naizmenično paljenje DUGIH svetala</b> — ne pozicionih, ne stop-svetala, ne pokazivača pravca — uz pažnju da ne zaslepiš vozače iz suprotnog smera.</p>
<svg viewBox="0 0 320 230" role="img" aria-label="Svetlosni znak upozorenja: uzastopno i naizmenično paljenje dugih svetala" style="max-width:320px;width:100%;display:block;margin:8px auto">
  <rect x="8" y="6" width="304" height="30" rx="6" fill="#2c6aa0"/>
  <text x="160" y="26" text-anchor="middle" fill="#fff" font-size="15" font-weight="bold">UZASTOPNO</text>

  <rect x="8" y="44" width="96" height="62" rx="8" fill="#3a3f47" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="36" cy="75" r="14" fill="#ffd84d" stroke="#b58900" stroke-width="2"/>
  <circle cx="76" cy="75" r="14" fill="#ffd84d" stroke="#b58900" stroke-width="2"/>

  <rect x="112" y="44" width="96" height="62" rx="8" fill="#3a3f47" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="140" cy="75" r="14" fill="#6b7280" stroke="#4b5563" stroke-width="2"/>
  <circle cx="180" cy="75" r="14" fill="#6b7280" stroke="#4b5563" stroke-width="2"/>

  <rect x="216" y="44" width="96" height="62" rx="8" fill="#3a3f47" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="244" cy="75" r="14" fill="#ffd84d" stroke="#b58900" stroke-width="2"/>
  <circle cx="284" cy="75" r="14" fill="#ffd84d" stroke="#b58900" stroke-width="2"/>

  <rect x="8" y="122" width="304" height="30" rx="6" fill="#8a5a00"/>
  <text x="160" y="142" text-anchor="middle" fill="#fff" font-size="15" font-weight="bold">NAIZMENIČNO</text>

  <rect x="8" y="160" width="96" height="62" rx="8" fill="#3a3f47" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="36" cy="191" r="14" fill="#ffd84d" stroke="#b58900" stroke-width="2"/>
  <circle cx="76" cy="191" r="14" fill="#6b7280" stroke="#4b5563" stroke-width="2"/>

  <rect x="112" y="160" width="96" height="62" rx="8" fill="#3a3f47" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="140" cy="191" r="14" fill="#6b7280" stroke="#4b5563" stroke-width="2"/>
  <circle cx="180" cy="191" r="14" fill="#ffd84d" stroke="#b58900" stroke-width="2"/>

  <rect x="216" y="160" width="96" height="62" rx="8" fill="#3a3f47" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="244" cy="191" r="14" fill="#ffd84d" stroke="#b58900" stroke-width="2"/>
  <circle cx="284" cy="191" r="14" fill="#6b7280" stroke="#4b5563" stroke-width="2"/>
</svg>
<table>
<tr><td>Noću, <b>umesto</b> zvučnog znaka</td><td>sme</td></tr>
<tr><td>Noću <b>u naselju</b>, prilikom preticanja drugog vozila</td><td>sme</td></tr>
<tr><td><b>Danju</b>, ako takav način upozorenja više odgovara uslovima na putu</td><td>sme</td></tr>
</table>
<p class="mut">Zbog trećeg reda odgovori „samo danju" i „samo noću" nikada nisu tačni.</p>

<p><b>Sva četiri pokazivača — dve zamke uz tabelu iznad (čl. 61):</b></p>
<table>
<tr><th>Ponuđeno</th><th>Zašto nije tačno</th></tr>
<tr><td>„kada se <b>kreće</b> kao poslednji u koloni na putu van naselja"</td><td>Obaveza važi samo za <b>zaustavljenu</b> kolonu — i ni tada, ako je kolona stala zbog postupanja po saobraćajnom znaku ili pravilu saobraćaja (semafor, ustupanje prvenstva, pešački prelaz)</td></tr>
<tr><td>„kada se zaustavio <b>iza</b> vozila u koje ulaze ili izlaze deca"</td><td>Sva četiri pali vozilo <b>iz kojeg</b> putnici ulaze ili izlaze, a ne ono koje stoji iza njega</td></tr>
</table>
<p class="mut">Na slici sa zaustavljenom kolonom van naselja poslednji vozač pali <b>sva četiri</b> pokazivača — ne levi.</p>
`,
};

CARDS['parkiranje'] = {
  title: 'Zaustavljanje i parkiranje — gde ne smeš',
  html: `
<p><b>Osnovno (čl. 64):</b> van naselja — van kolovoza kad god može · uz DESNU ivicu (jednosmerna: desna ILI leva) · ne uz šine.</p>
<p><b>Zabrane (čl. 66) sa magičnim brojevima:</b></p>
<table>
<tr><th>Mesto</th><th>Zona</th></tr>
<tr><td>pešački/biciklistički prelaz</td><td><b>+ 5 m</b> od njega</td></tr>
<tr><td>prelaz preko pruge/šina</td><td><b>+ 5 m</b></td></tr>
<tr><td>raskrsnica</td><td><b>+ 5 m</b> od ivice poprečnog kolovoza</td></tr>
<tr><td>Stajalište javnog prevoza</td><td>Na stajalištu i manje od 15 m ispred i iza oznake na kolovozu</td></tr>
<tr><td>Slobodan prolaz pored vozila</td><td>Najmanje 3 m; merilo i izuzetak za zaustavljanje su objašnjeni ispod</td></tr>
<tr><td>tunel, podvožnjak, galerija, most, nadvožnjak</td><td>zabranjeno</td></tr>
<tr><td>blizina vrha prevoja; krivina sa nedovoljnom preglednošću ili nebezbednim obilaženjem</td><td>zabranjeno</td></tr>
<tr><td>biciklistička staza/traka, zaklanjanje znaka</td><td>zabranjeno</td></tr>
</table>
<p>Tabela sažima osnovne zabrane. Izuzetak za manje od 5 m posle raskrsnice ili pešačkog/biciklističkog prelaza u jednosmernoj ulici i ostali izuzeci objašnjeni su ispod; ne odnose se automatski na svako mesto sa spiska.</p>
<svg viewBox="0 0 306 132" role="img" aria-label="dvosmerni put sa pešačkim prelazom i oznakom autobuskog stajališta na kolovozu: osnovna zabrana zaustavljanja i parkiranja 5 m sa obe strane prelaza i 15 m ispred i iza oznake stajališta" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <rect x="0" y="40" width="306" height="46" fill="#6b7280"/>
  <rect x="70" y="40" width="26" height="46" fill="none"/>
  <g fill="#fff"><rect x="72" y="43" width="22" height="6"/><rect x="72" y="54" width="22" height="6"/>
<rect x="72" y="65" width="22" height="6"/><rect x="72" y="76" width="22" height="6"/></g>
  <rect x="190" y="40" width="50" height="46" fill="#e0a030" opacity="0.55"/>
<text x="215" y="68" text-anchor="middle" font-size="12" font-weight="bold" fill="#111827">BUS</text>
  <path d="M40 26 L70 26" stroke="#fff" stroke-width="4"/>
<path d="M40 26 L70 26" stroke="#c0392b" stroke-width="2"/><path d="M96 26 L126 26" stroke="#fff" stroke-width="4"/>
<path d="M96 26 L126 26" stroke="#c0392b" stroke-width="2"/>
  <text x="55" y="19" text-anchor="middle" font-size="12" fill="currentColor" font-weight="bold">5 m</text>
  <text x="111" y="19" text-anchor="middle" font-size="12" fill="currentColor" font-weight="bold">5 m</text>
  <path d="M150 26 L190 26" stroke="#fff" stroke-width="4"/>
<path d="M150 26 L190 26" stroke="#c0392b" stroke-width="2"/><path d="M240 26 L280 26" stroke="#fff" stroke-width="4"/>
<path d="M240 26 L280 26" stroke="#c0392b" stroke-width="2"/>
  <text x="215" y="19" text-anchor="middle" font-size="12" fill="currentColor" font-weight="bold">15 m + 15 m</text>
  <text x="83" y="108" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">zona zabrane</text>
  <text x="83" y="122" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">oko prelaza</text>
  <text x="215" y="108" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">zona oko</text>
  <text x="215" y="122" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">stajališta</text>
</svg>
<p class="mut"><b>Pamćenje:</b> „5 - 5 - 5 - 15 - 3“ sažima osnovne udaljenosti. Izuzeci i mesta od kojih se meri navedeni su uz pravila ispod.</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<!-- IZVORI po temama (brojevi pitanja podoblasti 140 — sve tvrdnje se oslanjaju na tacne odgovore i postojeca objasnjenja tih pitanja):
     1  Zaustavljanje i parkiranje idu zajedno .......... 10052, 10058, 10101, 10141, 10142, 10507, 10091, 10092
     2  Uz koju ivicu se staje .......................... 10055, 10057, 10058, 10054, 10060
     3  Raskrsnica i pojas od 5 m ....................... 10142, 10065, 10066, 10068, 10071
     4  Pojas desno od pune bele linije ................. 10091, 10092, 10090
     5  Zamka "najmanje 1,60 m" ......................... 10111, 10113, 10117, 10118, 10120
     6  Izgleda kao slobodan prostor, a nije ............ 10061, 10101, 10141, 10507
     7  Uspon, nizbrdica, vrh prevoja, krivina .......... 10073, 10500, 10052, 10054
     8  Kad odlazis od vozila i kad stanes u kvaru ...... 10528, 10499
     9  Sve zamke na jednom mestu ....................... sve gore navedeno
     CRTEZI: svaki viewBox je sirok 306 (= telo kartice na ekranu od 375 px), font-size 12,
     pa se svaki natpis na telefonu vidi u velicini od 12 px (mereno: nijedan ispod 11 px).
     ANIMACIJE (klase su samo pozvane; definicija ide u style.css):
       animBiciklObilazi, animIzlaziIzSporednog, animVoziloSeKotrlja, animSinskoPrilazi
-->

<div class="kPodH"><b class="kPodNaslov">Zaustavljanje, parkiranje i izuzeci</b>
<p><b>Iznad svih spiskova:</b> tamo gde bi zaustavljeno ili parkirano vozilo ugrožavalo bezbednost drugih učesnika u saobraćaju ili bilo smetnja za normalno odvijanje saobraćaja i kretanje pešaka — ne smeš ni da zaustaviš ni da parkiraš, i onda kad to mesto nije ni na jednom spisku zabrana.</p>
<p><b>Zaustavljanje</b> traje do tri minuta, a vozač ne napušta vozilo; <b>parkiranje</b> je drugi prekid kretanja koji nije zaustavljanje. Prekidi radi postupanja po saobraćajnom znaku ili pravilu ne spadaju u ove pojmove (čl. 7 t. 71–72). Zabrane u ovoj grupi najčešće obuhvataju obe radnje, ali zakon poznaje i ograničene izuzetke.</p>
<p><b>Izuzeci nisu opšta dozvola:</b> čl. 66 st. 3 dopušta samo zaustavljanje na taksativno navedenim mestima, bez opasnosti ili smetnje. Auto-taksi sme da stane radi ulaska ili izlaska putnika i na stajalištu javnog prevoza, putu sa fizički odvojenim kolovoznim trakama, trotoaru i traci javnog prevoza kojom ne idu tramvaji; taj izuzetak ne obuhvata biciklističku traku (st. 4). Za određene službene dužnosti i komunalne delatnosti postoje posebni izuzeci pod uslovima iz čl. 62 st. 2.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Uz koju ivicu se staje</b>
<svg viewBox="0 0 306 140" role="img" aria-label="pogled odozgo na dvosmerni put: vozilo uz levu ivicu je precrtano, a vozilo uz desnu ivicu u tvom smeru nosi zelenu kvačicu" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">DVOSMERNI PUT</text>
  <text x="72" y="33" text-anchor="middle" font-size="12" fill="currentColor">leva ivica — ne sme</text>
  <rect x="0" y="38" width="306" height="70" fill="#6b7280"/>
  <path d="M0 73 H306" stroke="#fff" stroke-width="2" stroke-dasharray="14 10" fill="none"/>
  <path d="M210 52 H150 M162 46 L150 52 L162 58" stroke="#fff" stroke-width="2" fill="none"/>
  <rect x="26" y="41" width="80" height="26" rx="4" fill="#111827"/>
  <path d="M32 44 L100 64 M100 44 L32 64" stroke="#fff" stroke-width="5" fill="none"/>
<path d="M32 44 L100 64 M100 44 L32 64" stroke="#c0392b" stroke-width="3" fill="none"/>
  <rect x="26" y="79" width="80" height="26" rx="4" fill="#111827"/>
  <path d="M114 93 L122 101 L138 81" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M114 93 L122 101 L138 81" stroke="#1f7a3f" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M170 92 H250 M238 86 L250 92 L238 98" stroke="#06223a" stroke-width="3" fill="none"/>
  <text x="164" y="96" text-anchor="end" font-size="12" font-weight="bold" fill="#fff">TI</text>
  <text x="72" y="126" text-anchor="middle" font-size="12" fill="currentColor">desna ivica — sme</text>
</svg>
<svg viewBox="0 0 306 140" role="img" aria-label="pogled odozgo na jednosmerni put: i vozilo uz levu i vozilo uz desnu ivicu nose zelenu kvačicu, oba su dozvoljena" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">JEDNOSMERNI PUT</text>
  <text x="72" y="33" text-anchor="middle" font-size="12" fill="currentColor">leva ivica — sme</text>
  <rect x="0" y="38" width="306" height="70" fill="#6b7280"/>
  <path d="M0 73 H306" stroke="#fff" stroke-width="2" stroke-dasharray="14 10" fill="none"/>
  <path d="M150 52 H210 M198 46 L210 52 L198 58" stroke="#fff" stroke-width="2" fill="none"/>
  <rect x="26" y="41" width="80" height="26" rx="4" fill="#111827"/>
  <path d="M114 55 L122 63 L138 43" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M114 55 L122 63 L138 43" stroke="#1f7a3f" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="26" y="79" width="80" height="26" rx="4" fill="#111827"/>
  <path d="M114 93 L122 101 L138 81" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M114 93 L122 101 L138 81" stroke="#1f7a3f" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M170 92 H250 M238 86 L250 92 L238 98" stroke="#06223a" stroke-width="3" fill="none"/>
  <text x="164" y="96" text-anchor="end" font-size="12" font-weight="bold" fill="#fff">TI</text>
  <text x="72" y="126" text-anchor="middle" font-size="12" fill="currentColor">desna ivica — sme</text>
</svg>
<p><b>Rečima:</b> na putu na kome se saobraćaj odvija <b>u oba smera</b> vozilo se zaustavlja i parkira neposredno uz <b>desnu</b> ivicu kolovoza, pa ponude "desnu ili levu ivicu" i "levu ivicu" padaju. Na <b>jednosmernom</b> putu smeš uz <b>desnu ili levu</b> ivicu, pa tu padaju ponude "samo uz desnu" i "samo uz levu" (čl. 64 st. 2). Ponude su u ta dva pitanja gotovo iste (desna · desna ili leva · leva), pa prvo pročitaj da li se saobraćaj odvija u oba smera ili samo u jednom — od toga zavisi koja od njih je tačna.</p>
<p class="mut">Boje na crtežima: zeleno je ono što pitanje dopušta, crveno je zabrana ili opasnost (pa i pojas koji se meri i putanja koja preti), a plava strelica pokazuje tvoj smer kretanja.</p>
<svg viewBox="0 0 306 152" role="img" aria-label="pogled odozgo: uz desnu ivicu kolovoza idu tramvajske šine, vozilo koje je uz tu ivicu stalo na njima je precrtano, a sa leve strane po šinama nailazi šinsko vozilo" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">ŠINE UZ DESNU IVICU KOLOVOZA</text>
  <rect x="0" y="22" width="306" height="94" fill="#6b7280"/>
  <path d="M60 44 H140 M128 38 L140 44 L128 50" stroke="#06223a" stroke-width="3" fill="none"/>
  <text x="54" y="48" text-anchor="end" font-size="12" font-weight="bold" fill="#fff">TI</text>
  <g stroke="#111827" stroke-width="3" opacity="1" fill="none"><path d="M8 84 V112"/><path d="M32 84 V112"/><path d="M56 84 V112"/><path d="M80 84 V112"/><path d="M104 84 V112"/><path d="M128 84 V112"/><path d="M152 84 V112"/><path d="M176 84 V112"/><path d="M200 84 V112"/><path d="M224 84 V112"/><path d="M248 84 V112"/><path d="M272 84 V112"/><path d="M296 84 V112"/></g>
  <path d="M0 90 H306 M0 106 H306" stroke="#111827" stroke-width="4" fill="none"/>
  <g class="animSinskoPrilazi">
    <rect x="4" y="76" width="70" height="40" rx="7" fill="#111827" stroke="#fff" stroke-width="1.5"/>
    <rect x="12" y="84" width="20" height="14" rx="2" fill="#fff" opacity="0.75"/>
    <rect x="40" y="84" width="20" height="14" rx="2" fill="#fff" opacity="0.75"/>
    <path d="M82 96 H106 M98 90 L108 96 L98 102" stroke="#fff" stroke-width="4.5" fill="none"/>
<path d="M82 96 H106 M98 90 L108 96 L98 102" stroke="#c0392b" stroke-width="2.5" fill="none"/>
  </g>
  <rect x="150" y="82" width="96" height="30" rx="5" fill="#111827"/>
  <path d="M156 85 L240 109 M240 85 L156 109" stroke="#fff" stroke-width="5" fill="none"/>
<path d="M156 85 L240 109 M240 85 L156 109" stroke="#c0392b" stroke-width="3" fill="none"/>
  <text x="153" y="140" text-anchor="middle" font-size="12" fill="currentColor">tu se ne zaustavlja i ne parkira</text>
</svg>
<svg viewBox="0 0 306 146" role="img" aria-label="pogled odozgo na put van naselja: vozilo sklonjeno van kolovoza na bankinu nosi zelenu kvačicu, a vozilo koje je ostalo na kolovozu nosi napomenu samo ako van kolovoza ne može" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">PUT VAN NASELJA</text>
  <rect x="0" y="20" width="306" height="20" fill="currentColor" opacity="0.14"/>
  <rect x="0" y="40" width="306" height="62" fill="#6b7280"/>
  <rect x="0" y="102" width="306" height="26" fill="currentColor" opacity="0.14"/>
  <rect x="20" y="46" width="80" height="24" rx="4" fill="#111827"/>
  <text x="196" y="60" text-anchor="middle" font-size="12" fill="#fff">samo ako van kolovoza ne može</text>
  <rect x="176" y="104" width="80" height="24" rx="4" fill="#111827" stroke="currentColor" stroke-width="1.5"/>
  <path d="M264 118 L272 126 L288 106" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M264 118 L272 126 L288 106" stroke="#1f7a3f" stroke-width="4" fill="none" stroke-linecap="round"/>
  <text x="86" y="122" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">VAN KOLOVOZA</text>
  <text x="153" y="142" text-anchor="middle" font-size="12" fill="currentColor">kad god za to postoji mogućnost</text>
</svg>
<p><b>Šine uz desnu ivicu:</b> ako se uz desnu ivicu kolovoza nalaze tramvajske ili druge šine, tu ne smeš ni da zaustaviš ni da parkiraš (čl. 64 st. 3) — šinsko vozilo ne može da te obiđe. <b>Van naselja:</b> uvek kada za to postoji mogućnost, vozilo se zaustavlja ili parkira <b>van kolovoza</b> (čl. 64 st. 1), dakle na bankinu ili proširenje pre nego uz ivicu kolovoza; ponuda "uvek zaustavi ili parkira vozilo na kolovozu" je zamka.</p>
<svg viewBox="0 0 306 132" role="img" aria-label="pogled odozgo: mesta na sredini kolovoza označena plavim znakom za parkiranje i belim parking linijama; vozilo je u obeleženom mestu, a saobraćaj teče trakama sa obe strane" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">OBELEŽENO ZNAKOM ZA PARKIRANJE</text>
  <rect x="0" y="22" width="306" height="88" fill="#6b7280"/>
  <path d="M40 36 H120 M108 30 L120 36 L108 42" stroke="#fff" stroke-width="2" fill="none"/>
  <rect x="200" y="26" width="60" height="18" rx="3" fill="#111827"/>
  <rect x="60" y="52" width="150" height="30" fill="none" stroke="#fff" stroke-width="2.5"/>
  <path d="M110 52 V82 M160 52 V82" stroke="#fff" stroke-width="2" fill="none"/>
  <rect x="64" y="56" width="42" height="22" rx="3" fill="#111827"/>
  <path d="M220 70 L228 78 L244 58" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M220 70 L228 78 L244 58" stroke="#1f7a3f" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M266 96 H186 M198 90 L186 96 L198 102" stroke="#fff" stroke-width="2" fill="none"/>
  <rect x="46" y="88" width="60" height="18" rx="3" fill="#111827"/>
  <path d="M278 79 V90" stroke="currentColor" stroke-width="2"/>
  <rect x="264" y="48" width="28" height="31" rx="2" fill="#2c6aa0" stroke="#fff" stroke-width="1.5"/>
  <text x="278" y="71" text-anchor="middle" font-size="23" font-weight="bold" fill="#fff">P</text>
  <text x="153" y="126" text-anchor="middle" font-size="12" fill="currentColor">sme se parkirati</text>
</svg>
<svg viewBox="0 0 306 132" role="img" aria-label="pogled odozgo: ista sredina kolovoza bez ijedne oznake, vozilo koje je tu stalo je precrtano crvenom bojom" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">NIJE OBELEŽENO</text>
  <rect x="0" y="22" width="306" height="88" fill="#6b7280"/>
  <path d="M40 36 H120 M108 30 L120 36 L108 42" stroke="#fff" stroke-width="2" fill="none"/>
  <rect x="200" y="26" width="60" height="18" rx="3" fill="#111827"/>
  <rect x="120" y="54" width="70" height="26" rx="4" fill="#111827"/>
  <path d="M124 56 L186 78 M186 56 L124 78" stroke="#fff" stroke-width="5" fill="none"/>
<path d="M124 56 L186 78 M186 56 L124 78" stroke="#c0392b" stroke-width="3" fill="none"/>
  <path d="M266 96 H186 M198 90 L186 96 L198 102" stroke="#fff" stroke-width="2" fill="none"/>
  <rect x="46" y="88" width="60" height="18" rx="3" fill="#111827"/>
  <text x="153" y="126" text-anchor="middle" font-size="12" fill="currentColor">ne sme, ma koliko prostora bilo</text>
</svg>
<p><b>Sredina kolovoza:</b> zaustavljanje ili parkiranje dopušteno je samo na mestima koja su <b>saobraćajnim znakom obeležena za parkiranje</b> (čl. 64 st. 4). Sam slobodan prostor nije dovoljan. I na obeleženom mestu ostaje opšta zabrana ugrožavanja i ometanja drugih (čl. 62).</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Raskrsnica i pojas od 5 m</b>
<svg viewBox="0 0 306 206" role="img" aria-label="osnovni primer raskrsnice na dvosmernom putu: obeleženi su raskrsnica i pojas od pet metara sa obe strane najbliže ivice poprečnog kolovoza; vozilo u pojasu je precrtano; izuzetak za jednosmernu ulicu objašnjen je u tekstu" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="153" y="14" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">RASKRSNICA I POJAS OD 5 m</text>
  <text x="90" y="34" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">5 m</text>
  <text x="216" y="34" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">5 m</text>
  <g stroke="#fff" stroke-width="3.5" fill="none"><path d="M63 40 H118"/><path d="M63 36 V44"/><path d="M118 36 V44"/><path d="M188 40 H243"/><path d="M188 36 V44"/><path d="M243 36 V44"/></g>
<g stroke="#c0392b" stroke-width="1.5" fill="none"><path d="M63 40 H118"/><path d="M63 36 V44"/><path d="M118 36 V44"/><path d="M188 40 H243"/><path d="M188 36 V44"/><path d="M243 36 V44"/></g>
  <rect x="0" y="48" width="306" height="64" fill="#6b7280"/>
  <rect x="118" y="112" width="70" height="72" fill="#6b7280"/>
  <rect x="63" y="48" width="180" height="64" fill="#c0392b" opacity="0.2"/>
  <rect x="118" y="48" width="70" height="64" fill="#c0392b" opacity="0.34"/>
  <path d="M63 46 V116 M243 46 V116" stroke="#fff" stroke-width="3.5" stroke-dasharray="5 5" fill="none"/>
<path d="M63 46 V116 M243 46 V116" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5 5" fill="none"/>
  <text x="153" y="84" text-anchor="middle" font-size="12" fill="#fff">raskrsnica</text>
  <rect x="68" y="60" width="46" height="22" rx="4" fill="#111827"/>
  <path d="M72 62 L110 80 M110 62 L72 80" stroke="#fff" stroke-width="4.5" fill="none"/>
<path d="M72 62 L110 80 M110 62 L72 80" stroke="#c0392b" stroke-width="2.5" fill="none"/>
  <text x="6" y="104" text-anchor="start" font-size="12" font-weight="bold" fill="#fff">TI</text>
  <path d="M24 100 H58 M48 94 L58 100 L48 106" stroke="#06223a" stroke-width="3" fill="none"/>
  <text x="246" y="140" text-anchor="middle" font-size="12" fill="currentColor">tvoja desna strana</text>
  <text x="153" y="198" text-anchor="middle" font-size="12" fill="currentColor">ne staje se ni u pojasu ni na raskrsnici</text>
</svg>
<p><b>Raskrsnica:</b> zabranjeno je zaustavljanje i parkiranje na njoj i na manje od 5 m od najbliže ivice poprečnog kolovoza (čl. 66 st. 1 t. 3). Crtež prikazuje osnovno pravilo za dvosmerni put. U jednosmernoj ulici dozvoljeno je i manje od 5 m <b>posle raskrsnice</b>, gledano u dozvoljenom smeru (st. 2). Primer zaklonjenog pogleda ispod objašnjava opasnost; nije tumačenje zvanične slike #10142.</p>
<svg viewBox="0 0 306 178" role="img" aria-label="pogled odozgo: vozilo parkirano u pojasu ispred raskrsnice zaklanja pogled vozilu koje izlazi iz poprečnog puta, crvena isprekidana linija pokazuje zaklonjeni pogled" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">ZAŠTO: VOZILO ZAKLANJA POGLED</text>
  <rect x="0" y="24" width="306" height="64" fill="#6b7280"/>
  <rect x="140" y="88" width="70" height="66" fill="#6b7280"/>
  <rect x="70" y="40" width="56" height="24" rx="4" fill="#111827"/>
  <path d="M74 42 L122 62 M122 42 L74 62" stroke="#fff" stroke-width="4.5" fill="none"/>
<path d="M74 42 L122 62 M122 42 L74 62" stroke="#c0392b" stroke-width="2.5" fill="none"/>
  <path d="M172 92 L110 58" stroke="#fff" stroke-width="3.5" stroke-dasharray="4 4" fill="none"/>
<path d="M172 92 L110 58" stroke="#c0392b" stroke-width="1.5" stroke-dasharray="4 4" fill="none"/>
  <g class="animIzlaziIzSporednog">
    <rect x="150" y="96" width="48" height="30" rx="4" fill="#111827"/>
  </g>
  <text x="252" y="110" text-anchor="middle" font-size="12" fill="currentColor">vozilo iz</text>
  <text x="252" y="130" text-anchor="middle" font-size="12" fill="currentColor">sporednog puta</text>
  <text x="153" y="170" text-anchor="middle" font-size="12" fill="currentColor">parkirano vozilo mu zaklanja pogled</text>
</svg>
<p>Zabrana važi i na pešačkom prelazu, prelazu biciklističke staze preko kolovoza i prelazu puta preko železničke pruge, kao i na manje od 5 m od njih (čl. 66 st. 1 t. 1–2). U jednosmernoj ulici izuzetak dopušta manje od 5 m <b>posle pešačkog ili biciklističkog prelaza</b>; taj izuzetak ne obuhvata prelaz pruge. Četiri pitanja razlikuju samo mesto od mesta sa pojasom i 5 m od ponuđenih 10 m.</p>
<table>
<tr><th>Zamka u ponudi</th><th>Kako glasi tačan odgovor</th></tr>
<tr><td>mesto bez pojasa: "samo na pešačkom prelazu", "samo na raskrsnici"</td><td>i mesto <b>i</b> pojas: "na pešačkom prelazu kao i na udaljenosti manjoj od <b>5 m</b> od prelaza", odnosno "na raskrsnici kao i na udaljenosti manjoj od 5 m od najbliže ivice poprečnog kolovoza"</td></tr>
<tr><td>pogrešan broj: "na udaljenosti manjoj od <b>10 m</b>"</td><td>meri se <b>5 m</b> — u sva četiri pitanja</td></tr>
</table>
<p class="mut">Sami metri su u tabeli ove kartice (5-5-5-15-3); ovde je samo ono po čemu se ponude razlikuju.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Pojas desno od pune bele linije</b>
<svg viewBox="0 0 306 162" role="img" aria-label="pogled odozgo: gore je deo puta kojim idu automobili, ispod njega puna bela linija, a desno od nje biciklistička traka po kojoj se uz sam ivičnjak kreće biciklistkinja na biciklu" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">ŠTA JE DESNO OD PUNE LINIJE</text>
  <rect x="0" y="20" width="306" height="52" fill="#6b7280"/>
  <text x="86" y="36" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff">TUDA IDU AUTOMOBILI</text>
  <rect x="180" y="26" width="54" height="22" rx="4" fill="#111827"/>
  <rect x="244" y="26" width="54" height="22" rx="4" fill="#111827"/>
  <text x="238" y="64" text-anchor="middle" font-size="12" fill="#fff">puna bela linija</text>
  <rect x="0" y="72" width="306" height="54" fill="#6b7280"/>
  <rect x="0" y="69" width="306" height="5" fill="#fff"/>
  <text x="6" y="90" text-anchor="start" font-size="12" font-weight="bold" fill="#fff">BICIKLISTIČKA TRAKA</text>
  <text x="100" y="112" text-anchor="middle" font-size="12" fill="#fff">biciklistkinja</text>
  <path d="M154 108 H186" stroke="#fff" stroke-width="1.5" fill="none"/>
  <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
    <circle cx="200" cy="114" r="9"/><circle cx="242" cy="114" r="9"/>
    <path d="M200 114 L224 114 L233 98 L242 114"/><path d="M224 114 L216 98 L233 98"/>
    <path d="M233 98 L240 96"/>
    <circle cx="216" cy="78" r="6"/><path d="M216 84 L222 99"/><path d="M218 88 L233 97"/><path d="M222 99 L228 112"/><path d="M222 99 L214 110"/>
  </g>
  <rect x="0" y="126" width="306" height="14" fill="currentColor" opacity="0.22"/>
  <text x="40" y="158" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">IVIČNJAK</text>
</svg>
<svg viewBox="0 0 306 158" role="img" aria-label="pogled odozgo: vozilo je stalo na biciklističkoj traci; crvena isprekidana putanja pokazuje da obilaženje tog vozila vodi među automobile" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">AKO TU STANEŠ</text>
  <rect x="0" y="20" width="306" height="52" fill="#6b7280"/>
  <rect x="180" y="26" width="54" height="22" rx="4" fill="#111827"/>
  <rect x="244" y="26" width="54" height="22" rx="4" fill="#111827"/>
  <rect x="0" y="72" width="306" height="54" fill="#6b7280"/>
  <rect x="0" y="69" width="306" height="5" fill="#fff"/>
  <rect x="150" y="80" width="130" height="40" rx="5" fill="#111827"/>
  <rect x="178" y="89" width="74" height="20" rx="10" fill="#c0392b"/>
  <text x="215" y="103" text-anchor="middle" font-size="12" fill="#fff">ne staje se</text>
  <g class="animBiciklObilazi" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
    <circle cx="34" cy="114" r="9"/><circle cx="76" cy="114" r="9"/>
    <path d="M34 114 L58 114 L67 98 L76 114"/><path d="M58 114 L50 98 L67 98"/>
    <path d="M67 98 L74 96"/>
    <circle cx="50" cy="78" r="6"/><path d="M50 84 L56 99"/><path d="M52 88 L67 97"/><path d="M56 99 L62 112"/><path d="M56 99 L48 110"/>
  </g>
  <path d="M92 100 C 112 92, 122 66, 132 44" stroke="#fff" stroke-width="4" stroke-dasharray="6 5" fill="none"/>
<path d="M92 100 C 112 92, 122 66, 132 44" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 5" fill="none"/>
  <path d="M124 50 L133 40 L138 52" stroke="#fff" stroke-width="4" fill="none"/>
<path d="M124 50 L133 40 L138 52" stroke="#c0392b" stroke-width="2" fill="none"/>
  <rect x="0" y="126" width="306" height="14" fill="currentColor" opacity="0.22"/>
  <text x="153" y="154" text-anchor="middle" font-size="12" fill="currentColor">obilaženje vodi među automobile</text>
</svg>
<p><b>Na slikama #10091 i #10092</b> desno od pune bele linije je biciklistička traka. Ona je namenjena lakim električnim vozilima, biciklima, mopedima i lakim triciklima (čl. 7 t. 13). Na biciklističkoj traci i stazi zabranjeni su i zaustavljanje i parkiranje (čl. 66 st. 1 t. 8); zato su odgovori „samo traka“ i „samo staza“ pogrešni. Taksi izuzetak ne obuhvata ove površine. Vozilo na traci ometa njene korisnike i može ih dovesti u opasnost pri obilaženju.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Zamka "najmanje 1,60 m"</b>
<svg viewBox="0 0 306 156" role="img" aria-label="pogled odozgo na trotoar: vozilo je parkirano uz ivicu kolovoza, iza njega prema zgradi ostaje izmeren slobodan prolaz od 1,60 metara, a crvena napomena kaže da znaka nema pa metri ne pomažu" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <rect x="0" y="6" width="306" height="12" fill="currentColor" opacity="0.3"/>
  <rect x="0" y="18" width="306" height="78" fill="currentColor" opacity="0.12"/>
  <text x="298" y="32" text-anchor="end" font-size="12" font-weight="bold" fill="currentColor">TROTOAR</text>
  <g stroke="currentColor" stroke-width="1.5" fill="none"><path d="M30 26 V54"/><path d="M24 26 H36"/><path d="M24 54 H36"/></g>
  <text x="62" y="44" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">1,60 m</text>
  <text x="180" y="36" text-anchor="middle" font-size="12" fill="currentColor">slobodan prolaz</text>
  <text x="180" y="56" text-anchor="middle" font-size="12" fill="currentColor">nije uz ivicu kolovoza</text>
  <rect x="34" y="60" width="156" height="32" rx="5" fill="#111827"/>
  <rect x="66" y="66" width="92" height="20" rx="10" fill="#c0392b"/>
  <text x="112" y="80" text-anchor="middle" font-size="12" fill="#fff">ne parkira se</text>
  <rect x="0" y="96" width="306" height="40" fill="#6b7280"/>
  <text x="40" y="120" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff">KOLOVOZ</text>
  <text x="153" y="150" text-anchor="middle" font-size="12" fill="currentColor">nema znaka — metri ne pomažu</text>
</svg>
<p><b>Rečima:</b> ponuda sa slobodnim prolazom za pešake od 1,60 m vraća se u <b>pet</b> pitanja ove podoblasti i <b>ni u jednom nije tačan odgovor</b>. Ta širina je dodatni <b>uslov</b> tamo gde je parkiranje već dopušteno saobraćajnim znakom ili oznakom na kolovozu — nikad sama dozvola. Na crtežu je prolaz i izmeren i pomeren dalje od ivice kolovoza, pa ipak ne vredi: znaka koji bi parkiranje dopustio nema.</p>
<p><b>Ne mešaj 1,60 m i 3 m:</b> 1,60 m je najmanja širina prolaza za pešake kod izuzetka za trotoar. Za slobodan prolaz pored vozila meri se 3 m do neisprekidane uzdužne linije, suprotne ivice kolovoza ili prepreke (čl. 66 st. 1 t. 6). Za samo zaustavljanje postoji ograničeni izuzetak iz st. 3, ako nema opasnosti ili smetnje.</p>
<table>
<tr><th>Površina</th><th>Sme li se stati</th></tr>
<tr><td>Trotoar</td><td>Zaustavljanje ili parkiranje samo ako je dozvoljeno saobraćajnom signalizacijom; kada je vozilo parkirano, mora ostati slobodan prolaz za pešake najmanje 1,60 m, koji nije uz ivicu kolovoza (čl. 66 st. 1 t. 13)</td></tr>
<tr><td>Pešačka staza</td><td><b>Nije dozvoljeno</b> — izuzetak za trotoar ne važi (čl. 66 st. 1 t. 14)</td></tr>
<tr><td>Deo trotoara za kretanje lica sa posebnim potrebama</td><td><b>Nije dozvoljeno</b>; ostavljanje 1,60 m ne daje dozvolu (čl. 66 st. 1 t. 14)</td></tr>
<tr><td>Staza rezervisana za bicikliste i pešake</td><td>Zaustavljanje i parkiranje automobila nisu dozvoljeni na biciklističkoj i pešačkoj stazi (čl. 66 st. 1 t. 8 i 14)</td></tr>
</table>
<p>Na slici #10118 znak označava <b>stazu rezervisanu za bicikliste i pešake</b>. Po njemu prepoznaješ površine na kojima automobil ne sme da se zaustavi:</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="plavi okrugli znak podeljen uspravnom belom linijom: sa jedne strane lik pešaka, sa druge bicikl">
      <circle cx="39" cy="34" r="29" fill="#2c6aa0"/>
      <path d="M39 7 L39 61" stroke="#fff" stroke-width="2.5"/>
      <g fill="#fff"><circle cx="24" cy="20" r="4"/><rect x="22.5" y="25" width="3" height="14" rx="1.5"/></g>
      <g stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M24 39 L19 50"/><path d="M24 39 L29 50"/><path d="M24 28 L17 33"/><path d="M24 28 L31 33"/></g>
      <g stroke="#fff" stroke-width="2" fill="none"><circle cx="48" cy="44" r="5.5"/><circle cx="60" cy="44" r="5.5"/><path d="M48 44 L55 35 L60 44"/><path d="M55 35 L59 32"/></g>
    </svg>
    <b>STAZA REZERVISANA ZA BICIKLISTE I PEŠAKE</b><span>Znak II-41.1 označava put sa odvojenim delovima za bicikliste, pešake i vozače lakih električnih vozila. Raspored simbola odgovara rasporedu delova staze. Na tim površinama zabranjeni su zaustavljanje i parkiranje automobila (čl. 66 st. 1 t. 8 i 14).</span>
  </div>
</div>
<p>Na slici #10113 nije prikazana signalizacija koja dopušta parkiranje na trotoaru. Sam prolaz od 1,60 m zato nije dovoljan. Znak uz #10118 označava vrstu staze; za izuzetak pri parkiranju na trotoaru potrebna je signalizacija koja takvo parkiranje dopušta.</p>
<p class="mut">Pamtilica: nema signalizacije — nema merenja metara.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Izgleda kao slobodan prostor, a nije</b>
<svg viewBox="0 0 306 168" role="img" aria-label="pogled odozgo: dva toka saobraćaja se razdvajaju levo i desno, a između njih je polje za usmeravanje saobraćaja, bele kose pruge oivičene punom linijom; vozilo koje je stalo na polju je precrtano" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <defs><clipPath id="pusPolje140"><rect x="110" y="52" width="86" height="86"/></clipPath></defs>
  <text x="153" y="14" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">POLJE ZA USMERAVANJE SAOBRAĆAJA</text>
  <rect x="0" y="22" width="306" height="124" fill="#6b7280"/>
  <text x="56" y="42" text-anchor="middle" font-size="12" fill="#fff">jedan tok</text>
  <text x="250" y="42" text-anchor="middle" font-size="12" fill="#fff">drugi tok</text>
  <path d="M96 140 L66 62" stroke="#fff" stroke-width="3" fill="none"/>
  <path d="M80 74 L66 62 L63 80" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <path d="M210 140 L240 62" stroke="#fff" stroke-width="3" fill="none"/>
  <path d="M226 74 L240 62 L243 80" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <g clip-path="url(#pusPolje140)" stroke="#fff" stroke-width="2.5" fill="none">
    <path d="M110 72 L130 52"/><path d="M110 96 L154 52"/><path d="M110 120 L178 52"/><path d="M110 138 L196 52"/><path d="M128 138 L196 70"/><path d="M152 138 L196 94"/><path d="M176 138 L196 118"/>
  </g>
  <rect x="110" y="52" width="86" height="86" fill="none" stroke="#fff" stroke-width="3"/>
  <rect x="118" y="82" width="70" height="26" rx="4" fill="#111827"/>
  <path d="M122 84 L184 106 M184 84 L122 106" stroke="#fff" stroke-width="5" fill="none"/>
<path d="M122 84 L184 106 M184 84 L122 106" stroke="#c0392b" stroke-width="3" fill="none"/>
  <text x="153" y="160" text-anchor="middle" font-size="12" fill="currentColor">ovde se ne prelazi ni ne staje</text>
</svg>
<p><b>Rečima:</b> bele kose pruge oivičene punom linijom su <b>polje za usmeravanje saobraćaja</b> — površina koja mora da ostane prazna da bi se tokovi razdvojili na vreme, pa je i nacrtana između dva toka koja se razilaze. Vozilo na nju ne sme ni da pređe, pa je i ostavljanje vozila tu zabranjeno: vozilo ostavljeno na prugama stoji nepropisno, iako mesto na prvi pogled deluje kao slobodan prostor uz ivicu.</p>
<table>
<tr><th>Mesto</th><th>Pravilo</th></tr>
<tr><td>Kolovozne trake fizički odvojene (razdelno ostrvo)</td><td>Ni zaustavljanje ni parkiranje, osim ako je dozvoljeno saobraćajnim znakom (čl. 66 st. 1 t. 10); taksi izuzetak je naveden iznad</td></tr>
<tr><td>Površina na kojoj je signalizacijom zabranjen saobraćaj vozila</td><td>Zabranjen saobraćaj znači i zabranjeno zaustavljanje i parkiranje — jače pravilo uključuje slabije</td></tr>
<tr><td>Trg, pešačka zona, protivpožarni put</td><td>Ni zaustavljanje ni parkiranje (čl. 66 st. 1 t. 15)</td></tr>
</table>
<p>Na zvaničnoj slici #10142 beli krug sa crvenim obodom označava zabranu saobraćaja za vozila u oba smera (II-3). Na tako označenoj površini zabranjeni su zaustavljanje i parkiranje (čl. 66 st. 1 t. 22).</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Uspon i nizbrdica nisu na spisku, blizina vrha prevoja jeste</b>
<svg viewBox="0 0 306 156" role="img" aria-label="uzdužni profil puta sa prevojem: crvenom bojom obeležen je i sam vrh prevoja i pojas oko njega u kome se ne sme zaustaviti ni parkirati, dok su niži delovi uspona i nizbrdice samo imenovani" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <path d="M6 112 L70 112 L133 64 Q153 50 173 64 L236 112 L300 112 L300 122 L6 122 Z" fill="currentColor" opacity="0.1"/>
  <path d="M6 112 L70 112 L133 64 Q153 50 173 64 L236 112 L300 112" fill="none" stroke="currentColor" stroke-width="2.5"/>
  <path d="M113 79 L133 64 Q153 50 173 64 L193 79" fill="none" stroke="#fff" stroke-width="8"/>
<path d="M113 79 L133 64 Q153 50 173 64 L193 79" fill="none" stroke="#c0392b" stroke-width="6"/>
  <text x="153" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">blizina vrha prevoja</text>
  <text x="153" y="40" text-anchor="middle" font-size="12" fill="currentColor">ne zaustavlja se ni parkira</text>
  <g stroke="#fff" stroke-width="3.5" fill="none"><path d="M113 86 V132" stroke-dasharray="4 4"/><path d="M193 86 V132" stroke-dasharray="4 4"/><path d="M113 130 H193"/></g>
<g stroke="#c0392b" stroke-width="1.5" fill="none"><path d="M113 86 V132" stroke-dasharray="4 4"/><path d="M193 86 V132" stroke-dasharray="4 4"/><path d="M113 130 H193"/></g>
  <text x="60" y="104" text-anchor="middle" font-size="12" fill="currentColor">uspon</text>
  <text x="250" y="90" text-anchor="middle" font-size="12" fill="currentColor">nizbrdica</text>
  <text x="153" y="148" text-anchor="middle" font-size="12" fill="currentColor">i sam vrh i pojas oko njega</text>
</svg>
<p><b>Rečima:</b> u blizini vrha prevoja, kao i u krivini gde je preglednost nedovoljna ili se obilaženje vozila ne može izvršiti bez opasnosti, zabranjeni su zaustavljanje i parkiranje (čl. 66 st. 1 t. 5). Crveni pojas prikazuje primer blizine vrha prevoja. Zabrana važi i u tunelu, podvožnjaku, galeriji, na mostu i nadvožnjaku (t. 4).</p>
<svg viewBox="0 0 306 152" role="img" aria-label="pogled odozgo na nepreglednu krivinu: put se savija udesno, u samoj krivini stoji precrtano parkirano vozilo, a plava strelica pokazuje tvoj smer kretanja kroz krivinu" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="14" text-anchor="start" font-size="12" font-weight="bold" fill="currentColor">NEPREGLEDNA KRIVINA</text>
  <path d="M0 48 H150 A 54 54 0 0 1 204 102 V 152" stroke="#6b7280" stroke-width="42" fill="none"/>
  <path d="M0 48 H150 A 54 54 0 0 1 204 102 V 152" stroke="#fff" stroke-width="2" stroke-dasharray="12 9" fill="none"/>
  <path d="M40 48 H104 M92 42 L104 48 L92 54" stroke="#06223a" stroke-width="3" fill="none"/>
  <rect x="15" y="35" width="22" height="21" fill="#6b7280"/>
<text x="34" y="52" text-anchor="end" font-size="12" font-weight="bold" fill="#fff">TI</text>
  <g transform="translate(186 72) rotate(45)"><rect x="-24" y="-9" width="48" height="18" rx="4" fill="#111827"/></g>
  <path d="M166 54 L206 92 M206 54 L166 92" stroke="#fff" stroke-width="5" fill="none"/>
<path d="M166 54 L206 92 M206 54 L166 92" stroke="#c0392b" stroke-width="3" fill="none"/>
  <text x="100" y="140" text-anchor="middle" font-size="12" fill="currentColor">ne zaustavlja se ni parkira</text>
</svg>
<p>Sam <b>uspon</b>, sama <b>nizbrdica</b> i <b>put van naselja</b> nisu na spisku zabranjenih mesta, pa te tri ponude nisu tačni odgovori. To ipak nije dozvola: iznad svih spiskova ostaje pravilo da se ne staje tamo gde vozilo ugrožava ili ometa, a van naselja se vozilo sklanja van kolovoza kad god za to postoji mogućnost (čl. 64 st. 1).</p>
<p>Ovo nije ceo spisak zabrana: ostale površine, udaljenosti i relevantni izuzeci prikazani su u tabelama i temama ove kartice.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Kad odlaziš od vozila i kad staneš u kvaru</b>
<svg viewBox="0 0 306 142" role="img" aria-label="vozilo parkirano na nagibu dok se vozač udaljava; crvena isprekidana strelica pokazuje kako se vozilo samo kotrlja niz nagib" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <path d="M14 62 L292 106 L292 128 L14 128 Z" fill="currentColor" opacity="0.12"/>
  <path d="M14 62 L292 106" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <g stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
    <circle cx="46" cy="44" r="5"/><path d="M46 49 V62"/><path d="M46 62 L40 72"/><path d="M46 62 L53 72"/><path d="M46 53 L37 49"/><path d="M46 53 L55 57"/>
  </g>
  <text x="46" y="28" text-anchor="middle" font-size="12" fill="currentColor">vozač odlazi</text>
  <g transform="translate(116 68) rotate(9)"><g class="animVoziloSeKotrlja">
    <rect x="-40" y="-16" width="80" height="24" rx="5" fill="#111827" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="-24" cy="10" r="6" fill="currentColor"/><circle cx="24" cy="10" r="6" fill="currentColor"/>
  </g></g>
  <path d="M168 78 L224 87" stroke="#fff" stroke-width="4.5" stroke-dasharray="6 5" fill="none"/>
<path d="M168 78 L224 87" stroke="#c0392b" stroke-width="2.5" stroke-dasharray="6 5" fill="none"/>
  <path d="M217 81 L232 88 L216 93" stroke="#fff" stroke-width="4.5" fill="none" stroke-linejoin="round"/>
<path d="M217 81 L232 88 L216 93" stroke="#c0392b" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  <text x="222" y="42" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">sprečiti da se vozilo</text>
  <text x="222" y="62" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">samo pokrene s mesta</text>
</svg>
<p><b>Pre nego što napustiš parkirano vozilo:</b> preduzmi sve potrebne mere da se ono ne pokrene samo. Član 68 zahteva i obezbeđenje od neovlašćene upotrebe. U pitanju #10528 traži se sprečavanje samopokretanja: trougao i pokazivači pravca to ne mogu da zamene.</p>
<svg viewBox="0 0 306 180" role="img" aria-label="vozilo u kvaru stoji na šinama, sa leve strane po šinama nailazi šinsko vozilo, a između njih je crveni znak upozorenja" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="153" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="currentColor">1. vozilo ODMAH ukloni sa šina</text>
  <g stroke="currentColor" stroke-width="3" opacity="1" fill="none"><path d="M8 84 V112"/><path d="M30 84 V112"/><path d="M52 84 V112"/><path d="M74 84 V112"/><path d="M96 84 V112"/><path d="M118 84 V112"/><path d="M140 84 V112"/><path d="M162 84 V112"/><path d="M184 84 V112"/><path d="M206 84 V112"/><path d="M228 84 V112"/><path d="M250 84 V112"/><path d="M272 84 V112"/><path d="M294 84 V112"/></g>
  <path d="M0 90 H306 M0 106 H306" stroke="currentColor" stroke-width="4" fill="none"/>
  <g class="animSinskoPrilazi">
    <rect x="4" y="76" width="72" height="42" rx="7" fill="#111827" stroke="#fff" stroke-width="1.5"/>
    <rect x="12" y="84" width="20" height="14" rx="2" fill="#fff" opacity="0.75"/>
    <rect x="40" y="84" width="20" height="14" rx="2" fill="#fff" opacity="0.75"/>
    <path d="M84 97 H108 M100 91 L110 97 L100 103" stroke="#fff" stroke-width="4.5" fill="none"/>
<path d="M84 97 H108 M100 91 L110 97 L100 103" stroke="#c0392b" stroke-width="2.5" fill="none"/>
  </g>
  <circle cx="140" cy="46" r="14" fill="#c0392b" stroke="currentColor" stroke-width="1.5"/>
  <rect x="137" y="38" width="6" height="12" rx="2" fill="#fff"/><circle cx="140" cy="54" r="2.5" fill="#fff"/>
  <rect x="176" y="80" width="96" height="38" rx="6" fill="#111827" stroke="currentColor" stroke-width="1.5"/>
  <text x="224" y="134" text-anchor="middle" font-size="12" fill="currentColor">vozilo u kvaru</text>
  <text x="153" y="154" text-anchor="middle" font-size="12" fill="currentColor">2. ako ne može — odmah upozori</text>
  <text x="153" y="174" text-anchor="middle" font-size="12" fill="currentColor">vozače šinskog vozila</text>
</svg>
<p><b>Kvar na šinama:</b> vozilo <b>odmah</b> ukloni sa šina; ako to nije moguće, odmah preduzmi mere da vozači šinskog vozila na vreme budu upozoreni na opasnost (čl. 63 st. 2). Postavljanje trougla i uključivanje pokazivača pravca ne zamenjuju tu obavezu; obeležavanje vozila u propisanim situacijama posebno uređuje čl. 67.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Sve zamke na jednom mestu</b>
<p>Grafikon i tabela ispod opisuju ponude u <b>ovih 27 pitanja</b> podoblasti „Zaustavljanje i parkiranje“. Dužina trake pokazuje u koliko se pitanja ponuda javlja; nijedna od nabrojanih ponuda nije tačna u tim pitanjima. To je opis ove grupe pitanja, a ne opšte pravilo za sve saobraćajne situacije.</p>
<svg viewBox="0 0 306 318" role="img" aria-label="grafikon pogrešnih ponuda samo u 27 pitanja ove banke, ne opšte pravilo za druge situacije: zaustavljanje da a parkiranje ne šest puta, slobodan prolaz 1,60 m pet puta, manje od 10 m umesto 5 m četiri puta, samo na mestu bez pojasa četiri puta, izuzetak za auto-taksi dva puta, trougao i pokazivači pravca dva puta, samo staza ili samo traka jednom, najduže do 3 minuta jednom; nijedna od tih ponuda nije nijednom tačna" style="max-width:306px;width:100%;display:block;margin:6px auto">
  <text x="6" y="16" text-anchor="start" font-size="12" fill="currentColor">u ovih 27 pitanja — nijednom tačno</text>
  <text x="6" y="42" text-anchor="start" font-size="12" fill="currentColor">zaustavljanje da, parkiranje ne</text>
  <rect x="6" y="46" width="180" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="57" text-anchor="end" font-size="12" fill="currentColor">6</text>
  <text x="6" y="78" text-anchor="start" font-size="12" fill="currentColor">slobodan prolaz 1,60 m</text>
  <rect x="6" y="82" width="150" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="93" text-anchor="end" font-size="12" fill="currentColor">5</text>
  <text x="6" y="114" text-anchor="start" font-size="12" fill="currentColor">manje od 10 m umesto 5 m</text>
  <rect x="6" y="118" width="120" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="129" text-anchor="end" font-size="12" fill="currentColor">4</text>
  <text x="6" y="150" text-anchor="start" font-size="12" fill="currentColor">samo na mestu, bez pojasa</text>
  <rect x="6" y="154" width="120" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="165" text-anchor="end" font-size="12" fill="currentColor">4</text>
  <text x="6" y="186" text-anchor="start" font-size="12" fill="currentColor">izuzetak za auto-taksi</text>
  <rect x="6" y="190" width="60" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="201" text-anchor="end" font-size="12" fill="currentColor">2</text>
  <text x="6" y="222" text-anchor="start" font-size="12" fill="currentColor">trougao i pokazivači pravca</text>
  <rect x="6" y="226" width="60" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="237" text-anchor="end" font-size="12" fill="currentColor">2</text>
  <text x="6" y="258" text-anchor="start" font-size="12" fill="currentColor">samo staza ili samo traka</text>
  <rect x="6" y="262" width="30" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="273" text-anchor="end" font-size="12" fill="currentColor">1</text>
  <text x="6" y="294" text-anchor="start" font-size="12" fill="currentColor">najduže do 3 minuta</text>
  <rect x="6" y="298" width="30" height="14" fill="#c0392b" stroke="currentColor" stroke-width="1"/>
  <text x="286" y="309" text-anchor="end" font-size="12" fill="currentColor">1</text>
</svg>
<table>
<tr><th>Ponuda koja se stalno vraća</th><th>Šta stvarno stoji</th></tr>
<tr><td>"dozvoljeno je zaustavljanje, a nije dozvoljeno parkiranje"</td><td>zabranjeno je oboje</td></tr>
<tr><td>"slobodan prolaz za pešake najmanje širine 1,60 m"</td><td>uslov tamo gde je parkiranje već dopušteno znakom ili oznakom, nikad sama dozvola</td></tr>
<tr><td>"na udaljenosti manjoj od 10 m"</td><td>meri se 5 m</td></tr>
<tr><td>"samo na pešačkom prelazu", "samo na raskrsnici"</td><td>i mesto i pojas od 5 m oko njega</td></tr>
<tr><td>"dozvoljeno samo vozilima auto-taksi prevoza"</td><td>U pitanjima #10091 i #10092 taksi nije izuzet od zabrane na biciklističkoj traci</td></tr>
<tr><td>"sigurnosni trougao", "svi pokazivači pravca"</td><td>mere protiv samopokretanja vozila, odnosno uklanjanje sa šina i upozorenje</td></tr>
<tr><td>"samo na biciklističkoj stazi", "samo na biciklističkoj traci"</td><td>i na stazi i na traci</td></tr>
<tr><td>"sme da zaustavi vozilo najduže do 3 minuta"</td><td>ne sme ni da zaustavi ni da parkira</td></tr>
</table>
<p class="mut">Odgovor biraj po konkretnoj površini, signalizaciji i uslovima iz pitanja. Reči „dozvoljeno“, „samo“ ili navedena udaljenost same ne određuju tačan odgovor.</p>
</div>
`,
};

CARDS['svetla'] = {
  title: 'Upotreba svetala (kratka, duga, magla)',
  html: `
<p><b>Osnovno (čl. 77):</b> DANJU — kratka ili dnevna svetla (uvek uključena!). NOĆU — duga svetla.</p>
<p><b>Kratka UMESTO dugih (čl. 77):</b> mimoilaženje kad zaslepljuješ (a UVEK na manje od <b>200 m</b>) · kad ometaš vozača ispred sebe · ulica sa rasvetom · tunel · kad ometaš šinsko vozilo/plovilo · MAGLA · kad je vozilo zaustavljeno.</p>
<p><b>Magla (čl. 79):</b> kratka svetla i/ili svetla za maglu; ZADNJE svetlo za maglu samo po magli/smanjenoj vidljivosti.</p>
<p class="mut">Zamka: duga svetla NISU dozvoljena "uvek noću" — sedam izuzetaka gore. I obrnuto: danju svetla MORAJU (kratka/dnevna), nisu opcija.</p>
<p style="margin-top:10px"><b>Tabela za ispit — situacija → svetlo koje MORA da bude uključeno:</b></p>
<table>
<tr><th>Situacija</th><th>Obavezno svetlo</th></tr>
<tr><td>vožnja <b>DANJU</b></td><td><b>kratka, odnosno dnevna</b> svetla</td></tr>
<tr><td>vožnja <b>NOĆU</b> (osnovno pravilo)</td><td><b>duga</b> svetla</td></tr>
<tr><td>noću: mimoilaženje kad oceniš da zaslepljuješ vozača iz susreta — a <b>UVEK na odstojanju manjem od 200 m</b></td><td><b>kratka</b> umesto dugih</td></tr>
<tr><td>noću: ometaš vozača <b>ispred sebe</b></td><td><b>kratka</b> umesto dugih</td></tr>
<tr><td>noću: put osvetljen <b>uličnom rasvetom</b></td><td><b>kratka</b> umesto dugih</td></tr>
<tr><td>noću: u <b>tunelu</b></td><td><b>kratka</b> umesto dugih</td></tr>
<tr><td>noću: ometaš upravljača <b>šinskog vozila ili plovila</b></td><td><b>kratka</b> umesto dugih</td></tr>
<tr><td>noću: za vreme <b>magle</b></td><td><b>kratka</b> umesto dugih</td></tr>
<tr><td>noću: vozilo je <b>zaustavljeno</b></td><td><b>kratka</b> umesto dugih</td></tr>
<tr><td><b>MAGLA</b> (kao vremenski uslov)</td><td><b>kratka svetla, odnosno svetla za maglu ili obe vrste svetala</b> — ne dnevna, ne duga</td></tr>
<tr><td><b>zaustavljeno ili parkirano</b> na kolovozu, noću i u uslovima smanjene vidljivosti</td><td><b>poziciona, odnosno parkirna</b> svetla (NE kratka!)</td></tr>
<tr><td>isto to, ali ulično osvetljenje čini vozilo <b>dovoljno vidljivim</b> + posebno obeleženo mesto</td><td><b>ne moraju</b> biti uključena poziciona/parkirna</td></tr>
</table>
<p class="mut">Zamke: „na putu u naselju" se nudi u SVAKOM pitanju o kratkim umesto dugih — i nikad nije tačno (razlog je ulična rasveta, ne naselje). Odstojanje je <b>200 m</b>, mamac je 250 m. Pazi ŠTA pitanje pita: kad traži koja svetla <b>umesto dugih</b> (vožnja noću), „kada je vozilo zaustavljeno" JESTE tačan odgovor za kratka; ali kad pita koja svetla mora da ima <b>zaustavljeno/parkirano vozilo na kolovozu</b>, odgovor su POZICIONA, odnosno parkirna — kratka su tu mamac.</p>


<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<!-- IZVOR (podoblast 142 — upotreba svetala). Devet pitanja: 10210, 10211, 10217, 10218,
     10539, 10540, 10541, 10542, 10543. Mapa tema u ovom dodatku:
     tema 1 = 10210 + 10211 · tema 2 = 10539 + 10540 + 10541 + 10542 · tema 3 = 10539 (200 m) i
     mamac 250 m iz 10539/10540/10541/10542 · tema 4 = 10543 (+ magla kao jedna od sedam, 10541)
     · tema 5 = 10542 + 10217 + 10218 · tema 6 = sve ponude iz svih devet pitanja. -->
<p><b>Mapa podoblasti:</b> devet pitanja, svako po 2 poena, u četiri porodice — šta mora da bude uključeno <b>danju i noću</b> (2 pitanja) · kada idu <b>kratka umesto dugih</b> (4) · <b>magla</b> (1) · <b>zaustavljeno ili parkirano vozilo na kolovozu</b> (2).</p>

<!-- TEMA 1 — pitanja 10210 (danju) i 10211 (noću) -->
<div class="kPodH"><b class="kPodNaslov">Osnovno: danju i noću svetla MORAJU</b>
<div class="signRow lineRow" style="max-width:306px;margin:6px auto">
  <div class="signCell">
    <svg viewBox="0 0 150 120" style="width:100%;max-width:300px" role="img" aria-label="Vožnja danju: na vozilu su uključena kratka, odnosno dnevna svetla">
      <rect x="35" y="0" width="80" height="120" fill="#9aa7b4"/>
      <rect x="35" y="0" width="6" height="120" fill="#e8dcc2"/><rect x="109" y="0" width="6" height="120" fill="#e8dcc2"/>
      <line x1="75" y1="0" x2="75" y2="120" stroke="#fff" stroke-width="3" stroke-dasharray="12 9"/>
      <circle cx="17" cy="22" r="9" fill="#e8b000"/>
      <line x1="17" y1="5" x2="17" y2="10" stroke="#e8b000" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="17" y1="34" x2="17" y2="39" stroke="#e8b000" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="0" y1="22" x2="5" y2="22" stroke="#e8b000" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="29" y1="22" x2="34" y2="22" stroke="#e8b000" stroke-width="2.5" stroke-linecap="round"/>
      <g transform="translate(94 68)">
        <circle cx="-5" cy="-17" r="7" fill="#e8b000" opacity=".3"/><circle cx="5" cy="-17" r="7" fill="#e8b000" opacity=".3"/>
        <rect x="-13.5" y="-15" width="5" height="9" rx="2" fill="#333"/><rect x="8.5" y="-15" width="5" height="9" rx="2" fill="#333"/>
        <rect x="-13.5" y="6" width="5" height="9" rx="2" fill="#333"/><rect x="8.5" y="6" width="5" height="9" rx="2" fill="#333"/>
        <rect x="-10" y="-19" width="20" height="38" rx="8" fill="#2c6aa0"/>
        <path d="M-7 -10 Q0 -14 7 -10 L7 -4 Q0 -7 -7 -4 Z" fill="#fff" opacity=".85"/>
        <circle cx="-5" cy="-17" r="3" fill="#e8b000"/><circle cx="5" cy="-17" r="3" fill="#e8b000"/>
      </g>
    </svg>
    <b>DANJU — KRATKA, ODNOSNO DNEVNA</b><span>moraju biti uključena za vreme vožnje na putu (čl. 77 st. 1)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 150 120" style="width:100%;max-width:300px" role="img" aria-label="Vožnja noću: na vozilu su uključena duga svetla, snop dopire daleko">
      <rect x="35" y="0" width="80" height="120" fill="#9aa7b4"/>
      <rect x="35" y="0" width="6" height="120" fill="#e8dcc2"/><rect x="109" y="0" width="6" height="120" fill="#e8dcc2"/>
      <rect x="0" y="0" width="150" height="120" fill="#1c2e40" opacity=".42"/>
      <line x1="75" y1="0" x2="75" y2="120" stroke="#fff" stroke-width="3" stroke-dasharray="12 9" opacity=".8"/>
      <circle cx="14" cy="14" r="2" fill="#fff" opacity=".8"/><circle cx="26" cy="31" r="1.6" fill="#fff" opacity=".7"/><circle cx="9" cy="44" r="1.6" fill="#fff" opacity=".7"/><circle cx="136" cy="19" r="2" fill="#fff" opacity=".8"/>
      <polygon points="84,73 104,73 120,2 68,2" fill="#e8b000" opacity=".3"/>
      <g transform="translate(94 92)">
        <rect x="-13.5" y="-15" width="5" height="9" rx="2" fill="#333"/><rect x="8.5" y="-15" width="5" height="9" rx="2" fill="#333"/>
        <rect x="-13.5" y="6" width="5" height="9" rx="2" fill="#333"/><rect x="8.5" y="6" width="5" height="9" rx="2" fill="#333"/>
        <rect x="-10" y="-19" width="20" height="38" rx="8" fill="#2c6aa0"/>
        <path d="M-7 -10 Q0 -14 7 -10 L7 -4 Q0 -7 -7 -4 Z" fill="#fff" opacity=".85"/>
        <circle cx="-5" cy="-17" r="3" fill="#e8b000"/><circle cx="5" cy="-17" r="3" fill="#e8b000"/>
      </g>
    </svg>
    <b>NOĆU — DUGA</b><span>moraju biti uključena za vreme vožnje na putu (čl. 77 st. 2)</span>
  </div>
</div>
<p><b>Rečima (čl. 77):</b> danju za vreme vožnje na putu <b>moraju</b> biti uključena <b>kratka, odnosno dnevna</b> svetla (st. 1) — nisu opcija. Noću za vreme vožnje na putu <b>moraju</b> biti uključena <b>duga</b> svetla (st. 2) — a u sedam propisanih situacija umesto dugih idu kratka (sledeća tema).</p>
<p class="mut">Pamtilica: ta dva pitanja nude <b>ista četiri odgovora</b> — „svetla za maglu" · „kratka, odnosno dnevna" · „duga" · „svetla za osvetljavanje mesta gde se izvode radovi". Menja se samo koji je tačan: danju kratka/dnevna, noću duga. Preostala dva se nude i danju i noću, a nijednom nisu tačna.</p>
</div>

<!-- TEMA 2 — pitanja 10539, 10540, 10541, 10542 (kratka umesto dugih; sedam situacija iz objašnjenja, čl. 77 st. 3) -->
<div class="kPodH"><b class="kPodNaslov">Sedam situacija za kratka umesto dugih</b>
<div class="signRow wrapRow">
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="Dva vozila se mimoilaze iz suprotnih smerova, snopovi su kratki i ne dosežu do drugog vozila"><rect x="14" y="0" width="50" height="70" fill="#9aa7b4"/><rect x="14" y="0" width="50" height="70" fill="#1c2e40" opacity=".22"/><line x1="39" y1="0" x2="39" y2="70" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><polygon points="46,41 58,41 60,32 44,32" fill="#e8b000" opacity=".32"/><g class="animDolaziUSusret"><polygon points="20,29 32,29 34,38 18,38" fill="#e8b000" opacity=".32"/><g transform="translate(26 18) rotate(180)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#5f6d7a"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/></g></g><g transform="translate(52 52)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#2c6aa0"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/></g></svg>
    <b>1 · MIMOILAŽENJE</b><span>kad oceniš da zaslepljuješ vozača iz susreta — a uvek na odstojanju manjem od 200 m</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="Vozilo vozi iza drugog vozila u istoj traci, snop staje pre vozila ispred"><rect x="14" y="0" width="50" height="70" fill="#9aa7b4"/><rect x="14" y="0" width="50" height="70" fill="#1c2e40" opacity=".22"/><line x1="39" y1="0" x2="39" y2="70" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><polygon points="46,43 58,43 60,33 44,33" fill="#e8b000" opacity=".32"/><g transform="translate(52 20)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#5f6d7a"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="9.6" r="1.5" fill="#c0392b"/><circle cx="3.2" cy="9.6" r="1.5" fill="#c0392b"/></g><g transform="translate(52 54)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#2c6aa0"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/></g></svg>
    <b>2 · VOZILO ISPRED</b><span>ako ometaš vozača koji je ispred tebe</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="Ulična svetiljka osvetljava kolovoz sa vozilom"><rect x="14" y="0" width="50" height="70" fill="#9aa7b4"/><rect x="14" y="0" width="50" height="70" fill="#1c2e40" opacity=".22"/><line x1="39" y1="0" x2="39" y2="70" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><polygon points="54,11 64,11 74,60 34,60" fill="#e8b000" opacity=".3"/><line x1="70" y1="68" x2="70" y2="12" stroke="currentColor" stroke-width="2"/><path d="M70 13 L61 9" stroke="currentColor" stroke-width="2" fill="none"/><rect x="53" y="5" width="12" height="4.5" rx="2" fill="currentColor"/><g transform="translate(52 46)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#2c6aa0"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/></g></svg>
    <b>3 · ULIČNA RASVETA</b><span>put je osvetljen uličnom rasvetom — razlog je rasveta, NE „naselje"</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="Vozilo ulazi u tunel"><path d="M4 62 Q39 4 74 62 Z" fill="#5f6d7a" opacity=".45"/><path d="M22 62 V40 A17 17 0 0 1 56 40 V62 Z" fill="#2a333d"/><rect x="22" y="58" width="34" height="12" fill="#9aa7b4"/><g class="animUlazUTunel"><g transform="translate(39 58)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#2c6aa0"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/></g></g></svg>
    <b>4 · TUNEL</b><span>u tunelu</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="Vozilo sa kratkim snopom koji staje pre šina sa tramvajem i pre vode sa plovilom"><rect x="0" y="36" width="78" height="34" fill="#9aa7b4"/><rect x="0" y="36" width="78" height="34" fill="#1c2e40" opacity=".22"/><line x1="7" y1="2" x2="7" y2="32" stroke="#4d5761" stroke-width="1.6"/><line x1="25" y1="2" x2="25" y2="32" stroke="#4d5761" stroke-width="1.6"/><line x1="4" y1="6" x2="28" y2="6" stroke="#4d5761" stroke-width="1.4"/><line x1="4" y1="28" x2="28" y2="28" stroke="#4d5761" stroke-width="1.4"/><rect x="10" y="8" width="12" height="21" rx="3" fill="#b7332b"/><rect x="12" y="10" width="8" height="5" rx="1.5" fill="#fff" opacity=".8"/><rect x="12" y="18" width="8" height="4" rx="1.5" fill="#fff" opacity=".5"/><path d="M44 24 H73 L68 31 H49 Z" fill="#5f6d7a"/><rect x="54" y="17" width="8" height="7" rx="2" fill="#5f6d7a"/><path d="M40 33 q5 -3 10 0 t10 0 t10 0" stroke="#2c6aa0" fill="none" stroke-width="1.8" opacity=".85"/><polygon points="33,52 45,52 48,42 30,42" fill="#e8b000" opacity=".32"/><g transform="translate(39 60)"><rect x="-6" y="-9" width="12" height="18" rx="4" fill="#2c6aa0"/><path d="M-4 -4 Q0 -7 4 -4 L4 0 Q0 -2 -4 0 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-6.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-6.6" r="1.5" fill="#e8b000"/></g></svg>
    <b>5 · ŠINSKO VOZILO / PLOVILO</b><span>ako ometaš upravljača šinskog vozila ili plovila — na crtežu kratak snop staje pre šina, odnosno pre vode</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="Vozilo u magli, pojasevi magle preko puta"><rect x="14" y="0" width="50" height="70" fill="#9aa7b4"/><rect x="14" y="0" width="50" height="70" fill="#1c2e40" opacity=".22"/><line x1="39" y1="0" x2="39" y2="70" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><polygon points="46,29 58,29 61,17 43,17" fill="#e8b000" opacity=".32"/><g transform="translate(52 40)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#2c6aa0"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/></g><g class="animMaglaProlazi"><rect x="-14" y="13" width="106" height="7" rx="3.5" fill="#dfe6ec" opacity=".5"/><rect x="-14" y="33" width="106" height="7" rx="3.5" fill="#dfe6ec" opacity=".5"/><rect x="-14" y="53" width="106" height="7" rx="3.5" fill="#dfe6ec" opacity=".5"/></g></svg>
    <b>6 · MAGLA</b><span>za vreme magle — magla ima i sopstveno pitanje, vidi temu o magli</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="Zaustavljeno vozilo, strelica kretanja precrtana"><rect x="14" y="0" width="50" height="70" fill="#9aa7b4"/><rect x="14" y="0" width="50" height="70" fill="#1c2e40" opacity=".22"/><line x1="39" y1="0" x2="39" y2="70" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6"/><polygon points="46,35 58,35 61,24 43,24" fill="#e8b000" opacity=".28"/><g transform="translate(52 46)"><rect x="-6" y="-11" width="12" height="22" rx="4" fill="#2c6aa0"/><path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/><circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/></g><path d="M52 21 V8 M47 13 L52 7 L57 13" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="44" y1="6" x2="60" y2="21" stroke="#c0392b" stroke-width="3.5" stroke-linecap="round"/></svg>
    <b>7 · ZAUSTAVLJENO VOZILO</b><span>kada je vozilo zaustavljeno — vidi temu o zaustavljenom vozilu, tu je zamka</span>
  </div>
</div>
<p><b>Rečima (čl. 77 st. 3):</b> noću je vozač dužan da umesto dugih svetala upotrebljava kratka u sedam situacija — pri mimoilaženju kad oceni da zaslepljuje vozača iz susreta, a <b>uvek na odstojanju manjem od 200 m</b> · ako ometa vozača ispred sebe · na putu osvetljenom uličnom rasvetom · u tunelu · ako ometa upravljača šinskog vozila ili plovila · za vreme magle · kada je vozilo zaustavljeno.</p>
<p class="mut">Pamtilica: <b>tri</b> od sedam prepoznaješ po tome što nekome smetaš — <b>1</b> zaslepljuješ vozača iz susreta · <b>2</b> ometaš vozača ispred · <b>5</b> ometaš upravljača šinskog vozila ili plovila. <b>Tri</b> su mesto ili vreme — <b>3</b> ulična rasveta · <b>4</b> tunel · <b>6</b> magla. Sedma stoji sama: <b>7</b> kada je vozilo zaustavljeno.</p>
<p><b>Zamka koja rešava sva četiri pitanja:</b> u tim pitanjima ima ukupno osam netačnih ponuda. U šest stoji „na putu u naselju", u četiri stoji „250 m", a dve od njih spajaju oboje („na putu u naselju na odstojanju manjem od 250 m"). Zajedno pokrivaju svih osam — dakle: <b>ponuda u kojoj vidiš „u naselju" ili „250 m" nije tačna.</b> Nijedan tačan odgovor u ovoj podoblasti ne sadrži te reči. Na kratka te tera <b>ulična rasveta</b>, ne to što je put u naselju.</p>
<p class="mut">U sva četiri pitanja traže se po <b>dva</b> tačna odgovora. Svejedno pročitaj sve ponuđene pre nego što potvrdiš.</p>
</div>

<!-- TEMA 3 — 200 m: brojka iz tačnog odgovora u 10539; mamac 250 m stoji u 10539, 10540, 10541 i 10542.
     Crtež je u razmeri: moje vozilo na x=28, granica 200 m na x=178 (150 px = 200 m, 0,75 px po metru),
     pa oznaka 250 m pada na x=215,5. -->
<div class="kPodH"><b class="kPodNaslov">200 m — jedina brojka koja se javlja u tačnom odgovoru</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 300 188" style="max-width:300px;width:100%" role="img" aria-label="Odstojanje pri mimoilaženju: tvoje vozilo levo, vozilo iz susreta desno, uspravna isprekidana crta na 200 metara i precrtana oznaka 250 metara desno od nje">
  <rect x="0" y="52" width="300" height="72" fill="#9aa7b4"/>
  <rect x="0" y="52" width="300" height="72" fill="#1c2e40" opacity=".3"/>
  <rect x="0" y="52" width="300" height="5" fill="#e8dcc2"/><rect x="0" y="119" width="300" height="5" fill="#e8dcc2"/>
  <line x1="0" y1="88" x2="300" y2="88" stroke="#fff" stroke-width="3" stroke-dasharray="14 10" opacity=".85"/>
  <line x1="215.5" y1="28" x2="215.5" y2="52" stroke="currentColor" stroke-width="1.5" opacity=".65"/>
  <text x="215" y="24" text-anchor="middle" font-size="11" fill="currentColor">250 m</text>
  <line x1="196" y1="20" x2="235" y2="20" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="178" y1="46" x2="178" y2="130" stroke="currentColor" stroke-width="2" stroke-dasharray="6 5"/>
  <text x="178" y="42" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">200 m</text>
  <g transform="translate(28 104) rotate(90) scale(1.3)">
    <rect x="-6" y="-11" width="12" height="22" rx="4" fill="#2c6aa0"/>
    <path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/>
    <circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/>
  </g>
  <g class="animPrilaziGranici"><g transform="translate(266 72) rotate(-90) scale(1.3)">
    <rect x="-6" y="-11" width="12" height="22" rx="4" fill="#5f6d7a"/>
    <path d="M-4 -5 Q0 -8 4 -5 L4 -1 Q0 -3 -4 -1 Z" fill="#fff" opacity=".8"/>
    <circle cx="-3.2" cy="-9.6" r="1.5" fill="#e8b000"/><circle cx="3.2" cy="-9.6" r="1.5" fill="#e8b000"/>
  </g></g>
  <line x1="28" y1="140" x2="178" y2="140" stroke="currentColor" stroke-width="1.5"/>
  <line x1="28" y1="135" x2="28" y2="145" stroke="currentColor" stroke-width="1.5"/>
  <line x1="178" y1="135" x2="178" y2="145" stroke="currentColor" stroke-width="1.5"/>
  <line x1="182" y1="140" x2="294" y2="140" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <line x1="294" y1="135" x2="294" y2="145" stroke="currentColor" stroke-width="1.5"/>
  <text x="103" y="160" text-anchor="middle" font-size="12" fill="currentColor">MANJE OD 200 m — UVEK KRATKA</text>
  <text x="150" y="180" text-anchor="middle" font-size="11" fill="currentColor">preko 200 m: kratka ako oceniš da zaslepljuješ</text>
</svg>
</div>
<p><b>Rečima:</b> tačan odgovor ima <b>dva dela</b>. Prvi: kad pri mimoilaženju <b>oceniš</b> da svetlom svog vozila zaslepljuješ vozača koji ti dolazi u susret. Drugi: <b>uvek</b> na odstojanju <b>manjem od 200 m</b>. Drugi deo ne traži nikakvu ocenu — ispod 200 m kratka idu bez razmišljanja; iznad toga i dalje važi prvi deo, pa ako oceniš da zaslepljuješ — opet kratka.</p>
<p class="mut">Pamtilica: brojka <b>200 m</b> stoji u samo jednom od četiri pitanja o kratkim umesto dugih, i tamo je u <b>tačnom</b> odgovoru. Brojka <b>250 m</b> stoji u sva četiri i nijednom nije u tačnom odgovoru — to je čista zamena cifre.</p>
</div>

<!-- TEMA 4 — magla: 10543 (sopstveno pravilo, čl. 79) i magla kao jedna od sedam (10541, čl. 77 st. 3).
     „Duga se odbijaju o kapljice" je iz postojećeg objašnjenja uz 10543. -->
<div class="kPodH"><b class="kPodNaslov">Magla se pita na dva mesta</b>
<div class="signRow lineRow" style="max-width:306px;margin:6px auto">
  <div class="signCell">
    <svg viewBox="0 0 150 120" style="width:100%;max-width:300px" role="img" aria-label="Vozilo u magli sa kratkim snopom koji ne udara u pojas magle">
      <rect x="35" y="0" width="80" height="120" fill="#9aa7b4"/>
      <rect x="35" y="0" width="6" height="120" fill="#e8dcc2"/><rect x="109" y="0" width="6" height="120" fill="#e8dcc2"/>
      <line x1="75" y1="0" x2="75" y2="120" stroke="#fff" stroke-width="3" stroke-dasharray="12 9"/>
      <polygon points="66,74 84,74 88,56 62,56" fill="#e8b000" opacity=".4"/>
      <g transform="translate(75 92)">
        <rect x="-10" y="-19" width="20" height="38" rx="8" fill="#2c6aa0"/>
        <path d="M-7 -10 Q0 -14 7 -10 L7 -4 Q0 -7 -7 -4 Z" fill="#fff" opacity=".85"/>
        <circle cx="-5" cy="-17" r="3" fill="#e8b000"/><circle cx="5" cy="-17" r="3" fill="#e8b000"/>
      </g>
      <g class="animMaglaProlazi">
        <rect x="-16" y="8" width="182" height="8" rx="4" fill="#dfe6ec" opacity=".45"/>
        <rect x="-16" y="22" width="182" height="10" rx="5" fill="#dfe6ec" opacity=".55"/>
        <rect x="-16" y="38" width="182" height="10" rx="5" fill="#dfe6ec" opacity=".55"/>
      </g>
    </svg>
    <b>KRATKA — TAČNO</b><span>kratka svetla, odnosno svetla za maglu ili obe vrste svetala (čl. 79)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 150 120" style="width:100%;max-width:300px" role="img" aria-label="Duga svetla u magli: snop udara u pojas magle i vraća se ka vozilu, preko snopa je crveni krst">
      <rect x="35" y="0" width="80" height="120" fill="#9aa7b4"/>
      <rect x="35" y="0" width="6" height="120" fill="#e8dcc2"/><rect x="109" y="0" width="6" height="120" fill="#e8dcc2"/>
      <line x1="75" y1="0" x2="75" y2="120" stroke="#fff" stroke-width="3" stroke-dasharray="12 9"/>
      <polygon points="66,74 84,74 92,48 58,48" fill="#e8b000" opacity=".32"/>
      <g class="animMaglaProlazi">
        <rect x="-16" y="10" width="182" height="9" rx="4.5" fill="#dfe6ec" opacity=".5"/>
        <rect x="-16" y="28" width="182" height="18" rx="9" fill="#dfe6ec" opacity=".75"/>
      </g>
      <path d="M60 48 Q50 60 62 70" stroke="#e8b000" stroke-width="2.5" fill="none"/>
      <path d="M58 63 L62 72 L67 64" stroke="#e8b000" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M90 48 Q100 60 88 70" stroke="#e8b000" stroke-width="2.5" fill="none"/>
      <path d="M83 64 L88 72 L92 63" stroke="#e8b000" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(75 92)">
        <rect x="-10" y="-19" width="20" height="38" rx="8" fill="#2c6aa0"/>
        <path d="M-7 -10 Q0 -14 7 -10 L7 -4 Q0 -7 -7 -4 Z" fill="#fff" opacity=".85"/>
        <circle cx="-5" cy="-17" r="3" fill="#e8b000"/><circle cx="5" cy="-17" r="3" fill="#e8b000"/>
      </g>
      <line x1="61" y1="24" x2="89" y2="50" stroke="#c0392b" stroke-width="4" stroke-linecap="round"/>
      <line x1="89" y1="24" x2="61" y2="50" stroke="#c0392b" stroke-width="4" stroke-linecap="round"/>
    </svg>
    <b>DUGA — NETAČNO</b><span>u magli se odbijaju o kapljice, zato nisu tačan odgovor</span>
  </div>
</div>
<p><b>Rečima — dva različita pitanja:</b> (1) <b>za vreme vožnje noću</b> magla je jedna od sedam situacija u kojima umesto dugih ideš na kratka (čl. 77 st. 3); (2) kad pitanje traži koja svetla <b>moraju da budu uključena za vreme magle</b>, tačan odgovor je <b>kratka svetla, odnosno svetla za maglu ili obe vrste svetala</b> (čl. 79). U tom pitanju su ponuđena samo tri odgovora, a mamci su <b>dnevna</b> i <b>duga</b> svetla.</p>
<table>
<tr><th>Šta je uključeno</th><th>Da li je to u skladu s pravilom o magli?</th></tr>
<tr><td>samo <b>kratka</b> svetla</td><td><b>Da</b> — pravilo ih dozvoljava</td></tr>
<tr><td>samo <b>svetla za maglu</b></td><td><b>Da</b> — pravilo ih dozvoljava</td></tr>
<tr><td><b>obe vrste</b> zajedno</td><td><b>Da</b> — pravilo izričito kaže „ili obe vrste svetala"</td></tr>
<tr><td><b>dnevna</b> svetla</td><td><b>Ne</b> — nude se u pitanju o magli i netačna su</td></tr>
<tr><td><b>duga</b> svetla</td><td><b>Ne</b> — nude se u pitanju o magli i netačna su</td></tr>
</table>
<p class="mut">Pamtilica: tabela govori šta <b>pravilo</b> dozvoljava. U samom pitanju je ponuđen samo <b>jedan</b> odgovor u kome uopšte piše „kratka" ili „svetla za maglu", i on glasi cela rečenica — „kratka svetla, odnosno svetla za maglu ili obe vrste svetala". Ponude u kojoj piše samo jedna vrsta nema, pa je ne traži.</p>
</div>

<!-- TEMA 5 — zaustavljeno vozilo: 10542 (kratka umesto dugih), 10217 (poziciona, odnosno parkirna),
     10218 (ne moraju — izuzetak, ZOBS čl. 80) -->
<div class="kPodH"><b class="kPodNaslov">Zaustavljeno vozilo: kratka, poziciona — ili ne moraju?</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 300 312" style="max-width:300px;width:100%" role="img" aria-label="Stablo odluke sa tri grane: pitanje o svetlima umesto dugih pri vožnji noću vodi na kratka; pitanje o vozilu koje stoji na kolovozu noću i u uslovima smanjene vidljivosti vodi na poziciona odnosno parkirna; isto to uz posebno obeleženo mesto i uličnu rasvetu vodi na to da poziciona odnosno parkirna ne moraju biti uključena">
  <rect x="26" y="4" width="268" height="30" rx="8" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="160" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">ŠTA PITANJE PITA?</text>
  <path d="M14 34 V240" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <path d="M26 34 H14" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <path d="M14 58 H26 M14 146 H26 M14 240 H26" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <rect x="26" y="44" width="268" height="28" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="160" y="63" text-anchor="middle" font-size="12" fill="currentColor">UMESTO DUGIH — VOŽNJA NOĆU</text>
  <path d="M160 72 V80" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <polygon points="160,90 153,78 167,78" fill="currentColor"/>
  <rect x="56" y="90" width="208" height="28" rx="8" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="160" y="109" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">KRATKA</text>
  <rect x="26" y="126" width="268" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="160" y="144" text-anchor="middle" font-size="12" fill="currentColor">STOJI NA KOLOVOZU, NOĆU</text>
  <text x="160" y="160" text-anchor="middle" font-size="11" fill="currentColor">i u uslovima smanjene vidljivosti</text>
  <path d="M160 166 V174" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <polygon points="160,184 153,172 167,172" fill="currentColor"/>
  <rect x="26" y="184" width="268" height="28" rx="8" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="160" y="203" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">POZICIONA, ODNOSNO PARKIRNA</text>
  <rect x="26" y="220" width="268" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="160" y="238" text-anchor="middle" font-size="12" fill="currentColor">ISTO TO + OBELEŽENO MESTO</text>
  <text x="160" y="254" text-anchor="middle" font-size="11" fill="currentColor">i ulična rasveta ga čini vidljivim</text>
  <path d="M160 260 V268" stroke="currentColor" stroke-width="1.5" fill="none"/>
  <polygon points="160,278 153,266 167,266" fill="currentColor"/>
  <rect x="26" y="278" width="268" height="28" rx="8" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="160" y="297" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">NE MORAJU POZICIONA / PARKIRNA</text>
</svg>
</div>
<p class="mut" style="text-align:center">Ne odlučuje slika na putu — odlučuje početak pitanja.</p>
<div class="signRow lineRow" style="max-width:306px;margin:6px auto">
  <div class="signCell">
    <svg viewBox="0 0 300 152" style="width:100%;max-width:300px" role="img" aria-label="Vozilo stoji na kolovozu noću, poziciona svetla su upaljena: žuta napred i crvena nazad">
      <text x="150" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">STOJI NA KOLOVOZU, NOĆU</text>
      <rect x="0" y="22" width="300" height="130" fill="#9aa7b4"/>
      <rect x="0" y="22" width="16" height="130" fill="#e8dcc2"/><rect x="284" y="22" width="16" height="130" fill="#e8dcc2"/>
      <rect x="0" y="22" width="300" height="130" fill="#1c2e40" opacity=".34"/>
      <line x1="150" y1="24" x2="150" y2="150" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
      <circle cx="201" cy="65" r="11" fill="#e8b000" opacity=".35"/><circle cx="219" cy="65" r="11" fill="#e8b000" opacity=".35"/>
      <circle cx="201" cy="107" r="11" fill="#c0392b" opacity=".35"/><circle cx="219" cy="107" r="11" fill="#c0392b" opacity=".35"/>
      <g transform="translate(210 86) scale(1.5)">
        <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
        <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
      </g>
      <circle cx="201" cy="65" r="4" fill="#e8b000"/><circle cx="219" cy="65" r="4" fill="#e8b000"/>
      <circle cx="201" cy="107" r="4" fill="#c0392b"/><circle cx="219" cy="107" r="4" fill="#c0392b"/>
    </svg>
    <b>MORAJU — POZICIONA (PARKIRNA)</b><span>zaustavljeno ili parkirano na kolovozu, noću i u uslovima smanjene vidljivosti</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 300 152" style="width:100%;max-width:300px" role="img" aria-label="Vozilo na posebno obeleženom mestu na kolovozu ispod ulične rasvete, sva četiri svetla su ugašena">
      <text x="150" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">OBELEŽENO MESTO + RASVETA</text>
      <rect x="0" y="22" width="300" height="130" fill="#9aa7b4"/>
      <rect x="0" y="22" width="16" height="130" fill="#e8dcc2"/><rect x="284" y="22" width="16" height="130" fill="#e8dcc2"/>
      <rect x="0" y="22" width="300" height="130" fill="#1c2e40" opacity=".34"/>
      <line x1="150" y1="24" x2="150" y2="150" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
      <polygon points="258,34 274,34 296,140 150,140" fill="#e8b000" opacity=".3"/>
      <line x1="284" y1="34" x2="284" y2="150" stroke="currentColor" stroke-width="2.5"/>
      <path d="M284 36 L268 31" stroke="currentColor" stroke-width="2.5" fill="none"/>
      <rect x="254" y="26" width="16" height="6" rx="2" fill="currentColor"/>
      <path d="M180 54 V128 M244 54 V128 M180 128 H244" stroke="#fff" stroke-width="3.5" fill="none" opacity=".9"/>
      <g transform="translate(212 90) scale(1.5)">
        <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
        <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
        <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
      </g>
      <circle cx="203" cy="69" r="3.6" fill="#7d8792" stroke="#2a333d" stroke-width="1.2"/><circle cx="221" cy="69" r="3.6" fill="#7d8792" stroke="#2a333d" stroke-width="1.2"/>
      <circle cx="203" cy="111" r="3.6" fill="#7d8792" stroke="#2a333d" stroke-width="1.2"/><circle cx="221" cy="111" r="3.6" fill="#7d8792" stroke="#2a333d" stroke-width="1.2"/>
    </svg>
    <b>NE MORAJU</b><span>posebno obeleženo mesto, a ulično osvetljenje čini vozilo dovoljno vidljivim — izuzetak (ZOBS čl. 80)</span>
  </div>
</div>
<p><b>Rečima:</b> isti pojam — zaustavljeno vozilo — javlja se u <b>tri</b> različita pitanja i ima <b>tri</b> različita tačna odgovora. Ako pitanje traži koja se svetla upotrebljavaju <b>umesto dugih</b> za vreme vožnje noću, „kada je vozilo zaustavljeno" jeste tačan odgovor za <b>kratka</b>. Ako pita koja svetla mora da ima <b>zaustavljeno ili parkirano vozilo na kolovozu, noću i u uslovima smanjene vidljivosti</b>, odgovor su <b>poziciona, odnosno parkirna</b> — kratka su tu mamac. A ako se tome doda <b>posebno obeleženo mesto</b> na delu puta gde ulično osvetljenje čini vozilo dovoljno vidljivim, tačno je da <b>ne moraju</b> biti uključena poziciona, odnosno parkirna.</p>
<table>
<tr><th>Šta pitanje pita</th><th>Tačan odgovor</th></tr>
<tr><td>Vožnja <b>noću</b>: koja svetla <b>umesto dugih</b> (a među ponuđenim stoji „kada je vozilo zaustavljeno")</td><td><b>Kratka</b></td></tr>
<tr><td><b>Zaustavljeno ili parkirano na kolovozu</b>, noću i u uslovima smanjene vidljivosti</td><td><b>Poziciona, odnosno parkirna</b> — kratka su tu mamac</td></tr>
<tr><td>Isto, ali na <b>posebno obeleženom mestu</b> gde ga ulično osvetljenje čini dovoljno vidljivim</td><td><b>Ne moraju</b> biti uključena poziciona, odnosno parkirna</td></tr>
</table>
<p class="mut">Zamka na kraju: dve ponude počinju odricanjem. „Ne mora imati uključena svetla" nudi se u pitanju bez obeleženog mesta i netačno je; „ne moraju biti uključena <b>poziciona, odnosno parkirna</b>, svetla" tačno je samo uz obeleženo mesto i dovoljnu uličnu rasvetu.</p>
</div>

<!-- TEMA 6 — indeks svih ponuda iz svih devet pitanja podoblasti
     (10210, 10211, 10217, 10218, 10539, 10540, 10541, 10542, 10543) -->
<div class="kPodH"><b class="kPodNaslov">Sve ponuđene vrste svetala na jednom mestu</b>
<p>Ovo su sve vrste svetala koje se u ovoj podoblasti uopšte nude kao odgovor — i mesto na kome je svaka tačna, odnosno mesto na kome je mamac. U četiri pitanja o kratkim umesto dugih ponuđeni odgovori nisu vrste svetala nego situacije, pa ta pitanja ovde i nisu — red „kratka, odnosno dnevna svetla" govori samo o pitanju za osnovno pravilo noću i ne poriče sedam situacija u kojima kratka idu umesto dugih.</p>
<table>
<tr><th>Ponuda</th><th>Gde je TAČNA</th><th>Gde je MAMAC</th></tr>
<tr><td>„kratka, odnosno dnevna svetla"</td><td>vožnja <b>danju</b></td><td>vožnja <b>noću</b></td></tr>
<tr><td>„duga svetla"</td><td>vožnja <b>noću</b></td><td>vožnja danju · za vreme magle</td></tr>
<tr><td>„svetla za maglu" (sama)</td><td>nigde sama — ulaze u tačan odgovor o magli</td><td>i u pitanju o danu i u pitanju o noći</td></tr>
<tr><td>„svetla za osvetljavanje mesta gde se izvode radovi"</td><td>nigde u ovoj podoblasti</td><td>nude se dvaput — i za dan i za noć</td></tr>
<tr><td>„dnevna svetla" (bez reči „kratka")</td><td>nigde u ovoj podoblasti</td><td>za vreme magle</td></tr>
<tr><td>„kratka svetla, odnosno svetla za maglu ili obe vrste svetala"</td><td>za vreme <b>magle</b></td><td>—</td></tr>
<tr><td>„poziciona, odnosno parkirna svetla"</td><td>zaustavljeno ili parkirano <b>na kolovozu</b>, noću i u uslovima smanjene vidljivosti</td><td>isto to, ali na posebno obeleženom mestu uz dovoljnu uličnu rasvetu</td></tr>
<tr><td>„mora imati uključena kratka svetla"</td><td>nigde u ovoj podoblasti</td><td>zaustavljeno ili parkirano na kolovozu</td></tr>
<tr><td>„kratka i poziciona svetla" (zajedno)</td><td>nigde u ovoj podoblasti</td><td>obeleženo mesto uz uličnu rasvetu</td></tr>
<tr><td>„ne mora imati uključena svetla"</td><td>nigde u ovoj podoblasti</td><td>zaustavljeno ili parkirano na kolovozu</td></tr>
<tr><td>„ne moraju biti uključena poziciona, odnosno parkirna, svetla"</td><td>obeleženo mesto uz dovoljnu uličnu rasvetu</td><td>—</td></tr>
</table>
<p class="mut">Pamtilica: dve ponude liče, a nisu isto — „<b>kratka, odnosno dnevna</b> svetla" (tačna danju) i „<b>dnevna</b> svetla" (nigde tačna, nude se u pitanju o magli). Razlika je u prve dve reči, pa ponudu čitaj do kraja.</p>
</div>
`,
};

CARDS['pesaci-bicikli'] = {
  title: 'Pešaci, bicikli i dvotočkaši u saobraćaju',
  html: `
<p><b>Vozač prema pešacima (čl. 23):</b> pazi na pešake koji su na kolovozu, stupaju ili se vidi da nameravaju · pred pešačkim prelazom brzina takva da UVEK možeš da staneš · zona dece = naročita opreznost.</p>
<p><b>Na prelazu:</b> pešaku na prelazu (i kad tek stupa) — propusti; zabranjeno je preticanje i obilaženje vozila koje se zaustavilo radi propuštanja pešaka.</p>
<p><b>Za tebe kao vozača mopeda/motocikla:</b> kaciga OBAVEZNA (vozač i putnik) · svetla uvek · dete mlađe od 12 godina se ne prevozi · deca do 12 ne smeju upravljati biciklom na javnom putu.</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<!-- IZVORI (mapa tvrdnja -> broj pitanja; NE ulazi u karticu, brise se pri ubacivanju u build-explanations.mjs)
     zabranjen prolaz (svetlosni znak / znak policajca) -> zaustavis vozilo ... #10249, #10250, #10550
     tacan odgovor glasi "ispred pesackog prelaza" (tekstualna pitanja) ...... #10249, #10250
     tacan odgovor glasi "ispred linije zaustavljanja" (pitanje sa slikom) ... #10550
     policajac: prednja strana tela prema tebi = zabranjen prolaz ........... #10550 (objasnjenje)
       -> sta znace ostali polozaji tela i znaci rukom U GRADJI NE STOJI: kartica o tome NE tvrdi nista
     par sa gotovo istim tekstom, suprotni tacni odgovori:
       #10550 nudi odgovor "zaustavite vozilo ispred linije zaustavljanja" (tacan)
       #10255 taj odgovor NE nudi (ponuda: niste duzni / zvucni znak / propustate) -> tacno je propustanje
     dozvoljen prolaz + pesak prelazi -> propustis ...................... #10253, #10257, #10259, #10553
     zeleno ti otvara put, ali ne kroz ljude na prelazu ................. #10259 (objasnjenje)
     neregulisan prelaz -> prilagodjena brzina; nije obavezno zaustavljanje ni truba ... #10703
     dete na NEREGULISANOM prelazu -> zaustavis vozilo .................. #10264
     dete na prelazu bocnog puta uz prolaz dozvoljen svetlosnim znakom -> zaustavis vozilo ... #10552
     (za "dozvoljen prolaz + voznja pravo + dete" u gradji NEMA pitanja - ne tvrdi se nista)
     deca, nemocna i slepa lica: nema procene "stici ce da predje" ...... #10264 (objasnjenje)
     skretanje bez obelezenog prelaza, pesak vec na kolovozu -> propustis #10551, #10266
     skretanje uz dozvoljen prolaz -> propustis ......................... #10263, #10553
     prisustvo dece pored kolovoza -> narocita opreznost + blagovremeno zaustavljanje + zvucni znak ... #10270, #10264 (objasnjenje, cl. 59)
     zvucni znak nije resenje kad je neko vec na prelazu/kolovozu ....... #10255, #10259, #10263, #10264, #10266, #10551
     organizovana kolona pesaka se ne preseca ........................... #10271, #10273
     pesak van naselja -> LEVA ivica, u susret vozilima ................. #10244
     pridrzavanje za vozilo u pokretu je zabranjeno ..................... #10245
     autoput/motoput: koga zabrana kretanja pesaka ne obuhvata .......... #10248
     ANIMACIJE (klase dodaje integrator u style.css): animPesakPrelazi, animPutanjaSkretanja,
     animKolonaPrelazi, animVoziloUSusret
     PLATNA: svaki viewBox je sirok 300 (telo kartice na telefonu = 306 px), font-size 12 i 13.
-->
<div class="kPodH"><b class="kPodNaslov">Pešački prelaz — prvo pitanje je: da li je MENI prolaz dozvoljen?</b>
<table>
<tr><th>Kako je situacija postavljena</th><th>Šta si dužan</th></tr>
<tr><td>prolaz ti je <b>ZABRANJEN</b> — svetlosnim saobraćajnim znakom ili znakom policijskog službenika</td><td><b>zaustaviš vozilo</b> i čekaš</td></tr>
<tr><td>prolaz ti je <b>DOZVOLJEN</b>, a preko prelaza prelazi pešak</td><td><b>propustiš pešaka</b></td></tr>
<tr><td>prolaz ti je <b>DOZVOLJEN svetlosnim znakom</b>, skrećeš na bočni put, a preko prelaza na njegovom ulazu prelazi <b>DETE</b></td><td><b>zaustaviš vozilo</b> i propustiš ga</td></tr>
<tr><td>prelaz <b>NIJE REGULISAN</b> — nema ni semafora ni policajca</td><td><b>prilagodiš brzinu</b> tako da u svakoj situaciji koju vidiš ili imaš razloga da predvidiš možeš bezbedno da propustiš pešaka</td></tr>
<tr><td>prelaz <b>nije regulisan</b>, a na njega je stupilo ili stupa <b>DETE</b></td><td><b>zaustaviš vozilo</b> i propustiš ga</td></tr>
</table>
<p class="mut">Obrati pažnju gde tačno stoji „zaustaviš vozilo" zbog deteta: u pitanjima su to <b>neregulisan prelaz</b> i <b>prelaz na ulazu u bočni put u koji skrećeš</b>. To su dva slučaja koja baza pita — ne pravi od toga pravilo za svaki prelaz.</p>
<p><b>Ispred čega staješ kad ti je prolaz zabranjen.</b> Radnja je uvek ista: staješ pre nego što uđeš u prostor kojim pešak prelazi. Razlikuje se samo koju granicu tačan odgovor imenuje: u pitanjima koja su <b>samo tekst</b> glasi „zaustavi svoje vozilo ispred pešačkog prelaza", a u pitanju sa slikom, na raskrsnici kojom upravlja policijski službenik, glasi „zaustavite svoje vozilo ispred <b>linije zaustavljanja</b>".</p>
<p>Četiri puta ista ulica, a četiri različite dužnosti — razlikuje se samo ono što stoji <i>iznad</i> kolovoza. Zato na svakom od sledeća četiri crteža prvo gledaj tamo: to je ono što odlučuje.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 175" style="max-width:300px;width:100%" role="img" aria-label="semafor sa upaljenim crvenim svetlom pored pešačkog prelaza; vozilo stoji ispred prelaza dok pešak prelazi preko šara">
<text x="150" y="14" text-anchor="middle" font-size="13" fill="currentColor">SVETLOSNI ZNAK: ZABRANJEN PROLAZ</text>
<rect x="0" y="78" width="300" height="64" fill="#9aa7b4"/>
<rect x="120" y="26" width="24" height="48" rx="5" fill="#2a333d"/>
<circle cx="132" cy="38" r="6.5" fill="#c0392b"/>
<circle cx="132" cy="50" r="6.5" fill="#5a4a22"/>
<circle cx="132" cy="62" r="6.5" fill="#1f4a2e"/>
<rect x="150" y="82" width="56" height="9" fill="#fff"/>
<rect x="150" y="96" width="56" height="9" fill="#fff"/>
<rect x="150" y="110" width="56" height="9" fill="#fff"/>
<rect x="150" y="124" width="56" height="9" fill="#fff"/>
<g class="animPesakPrelazi">
<circle cx="178" cy="86" r="6" fill="#2c6aa0"/>
<path d="M178,94 L178,132 M172,126 L178,133 L184,126" fill="none" stroke="#2c6aa0" stroke-width="2"/>
</g>
<rect x="16" y="94" width="58" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="45" y="115" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<text x="52" y="50" text-anchor="middle" font-size="12" fill="#c0392b">STAJEŠ</text>
<text x="52" y="67" text-anchor="middle" font-size="12" fill="#c0392b">ispred prelaza</text>
<path d="M52,72 L52,90 M47,84 L52,91 L57,84" fill="none" stroke="#c0392b" stroke-width="2"/>
<text x="178" y="160" text-anchor="middle" font-size="12" fill="currentColor">pešački prelaz</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">na crtežu ti je svetlosnim znakom prolaz zabranjen (upaljeno crveno): zaustavljaš vozilo <b>ispred pešačkog prelaza</b> i čekaš, ceo prostor prelaza ostaje prazan za pešake · šare leže u smeru vožnje, a pešak ih gazi popreko</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 175" style="max-width:300px;width:100%" role="img" aria-label="policijski službenik okrenut prednjom stranom tela prema tebi stoji kraj kolovoza; vozilo stoji ispred bele linije zaustavljanja, a pešak prelazi preko šara">
<text x="150" y="14" text-anchor="middle" font-size="13" fill="currentColor">POLICAJAC OKRENUT LICEM KA TEBI</text>
<rect x="0" y="78" width="300" height="64" fill="#9aa7b4"/>
<circle cx="250" cy="32" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="240" y1="27" x2="260" y2="27" stroke="currentColor" stroke-width="3"/>
<circle cx="247" cy="33" r="1.5" fill="currentColor"/>
<circle cx="253" cy="33" r="1.5" fill="currentColor"/>
<path d="M239,44 L261,44 L264,76 L236,76 Z" fill="none" stroke="currentColor" stroke-width="2"/>
<line x1="239" y1="46" x2="232" y2="68" stroke="currentColor" stroke-width="2"/>
<line x1="261" y1="46" x2="268" y2="68" stroke="currentColor" stroke-width="2"/>
<rect x="118" y="78" width="8" height="64" fill="#fff"/>
<rect x="150" y="82" width="56" height="9" fill="#fff"/>
<rect x="150" y="96" width="56" height="9" fill="#fff"/>
<rect x="150" y="110" width="56" height="9" fill="#fff"/>
<rect x="150" y="124" width="56" height="9" fill="#fff"/>
<g class="animPesakPrelazi">
<circle cx="178" cy="86" r="6" fill="#2c6aa0"/>
<path d="M178,94 L178,132 M172,126 L178,133 L184,126" fill="none" stroke="#2c6aa0" stroke-width="2"/>
</g>
<rect x="16" y="94" width="58" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="45" y="115" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<text x="52" y="50" text-anchor="middle" font-size="12" fill="#c0392b">STAJEŠ</text>
<text x="52" y="67" text-anchor="middle" font-size="12" fill="#c0392b">ispred linije</text>
<path d="M52,72 L52,90 M47,84 L52,91 L57,84" fill="none" stroke="#c0392b" stroke-width="2"/>
<line x1="122" y1="146" x2="122" y2="152" stroke="currentColor" stroke-width="1"/>
<text x="122" y="166" text-anchor="middle" font-size="12" fill="currentColor">linija zaustavljanja</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">isti slučaj — prolaz ti je zabranjen — samo je znak dao policajac: tu tačan odgovor imenuje <b>liniju zaustavljanja</b>, pa staješ ispred nje</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 175" style="max-width:300px;width:100%" role="img" aria-label="semafor sa upaljenim zelenim svetlom; pešak prelazi preko šara, vozilo stoji i propušta ga, a zelena isprekidana strelica iza prelaza pokazuje da posle toga nastavlja">
<text x="150" y="14" text-anchor="middle" font-size="13" fill="currentColor">SVETLOSNI ZNAK: DOZVOLJEN PROLAZ</text>
<rect x="0" y="78" width="300" height="64" fill="#9aa7b4"/>
<rect x="120" y="26" width="24" height="48" rx="5" fill="#2a333d"/>
<circle cx="132" cy="38" r="6.5" fill="#5a2a26"/>
<circle cx="132" cy="50" r="6.5" fill="#5a4a22"/>
<circle cx="132" cy="62" r="6.5" fill="#1f7a3f"/>
<rect x="150" y="82" width="56" height="9" fill="#fff"/>
<rect x="150" y="96" width="56" height="9" fill="#fff"/>
<rect x="150" y="110" width="56" height="9" fill="#fff"/>
<rect x="150" y="124" width="56" height="9" fill="#fff"/>
<g class="animPesakPrelazi">
<circle cx="178" cy="86" r="6" fill="#2c6aa0"/>
<path d="M178,94 L178,132 M172,126 L178,133 L184,126" fill="none" stroke="#2c6aa0" stroke-width="2"/>
</g>
<rect x="16" y="94" width="58" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="45" y="115" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<text x="52" y="50" text-anchor="middle" font-size="12" fill="#1f7a3f">PROPUŠTAŠ</text>
<text x="52" y="67" text-anchor="middle" font-size="12" fill="#1f7a3f">pešaka</text>
<path d="M214,110 L274,110" fill="none" stroke="#1f7a3f" stroke-width="2" stroke-dasharray="7 5"/>
<path d="M272,104 L284,110 L272,116 Z" fill="#1f7a3f"/>
<text x="246" y="160" text-anchor="middle" font-size="12" fill="#1f7a3f">pa nastavljaš</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">zeleno ti otvara put, ali ne kroz ljude na prelazu: pešaka koji prelazi <b>propuštaš</b>, pa tek onda nastavljaš — i kad ideš pravo i kad skrećeš</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 175" style="max-width:300px;width:100%" role="img" aria-label="prelaz na kome nema ni semafora ni policijskog službenika — oba su nacrtana i precrtana crvenim krstom; vozilo smanjuje brzinu pri nailasku na prelaz">
<text x="150" y="14" text-anchor="middle" font-size="13" fill="currentColor">NEMA SEMAFORA NI POLICAJCA</text>
<rect x="0" y="78" width="300" height="64" fill="#9aa7b4"/>
<rect x="96" y="30" width="18" height="36" rx="3" fill="#2a333d"/>
<circle cx="105" cy="38" r="4.5" fill="#5a6672"/>
<circle cx="105" cy="48" r="4.5" fill="#5a6672"/>
<circle cx="105" cy="58" r="4.5" fill="#5a6672"/>
<path d="M92,26 L118,70 M118,26 L92,70" fill="none" stroke="#c0392b" stroke-width="3"/>
<circle cx="170" cy="36" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M161,48 L179,48 L182,70 L158,70 Z" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M154,26 L186,72 M186,26 L154,72" fill="none" stroke="#c0392b" stroke-width="3"/>
<rect x="150" y="82" width="56" height="9" fill="#fff"/>
<rect x="150" y="96" width="56" height="9" fill="#fff"/>
<rect x="150" y="110" width="56" height="9" fill="#fff"/>
<rect x="150" y="124" width="56" height="9" fill="#fff"/>
<rect x="16" y="94" width="58" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="45" y="115" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<rect x="86" y="102" width="6" height="24" fill="currentColor" opacity=".55"/>
<rect x="98" y="110" width="6" height="16" fill="currentColor" opacity=".55"/>
<rect x="110" y="118" width="6" height="8" fill="currentColor" opacity=".55"/>
<text x="150" y="160" text-anchor="middle" font-size="12" fill="currentColor">PRILAGOĐAVAŠ BRZINU</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">stubići koji se smanjuju = brzina koju spuštaš pri nailasku · pri nailasku na neregulisan prelaz obavezna je <b>prilagođena brzina</b>, ne zaustavljanje i ne truba — a ako je na prelaz stupilo ili stupa <b>dete</b>, zaustavljaš vozilo</p>
<p><b>Policijski službenik na raskrsnici — dva pitanja sa slikom počinju gotovo isto</b> („na raskrsnici na kojoj saobraćaj reguliše policijski službenik"), a tačni odgovori su im suprotni. Razlikuje ih <b>ono što je u pitanju ponuđeno</b>:</p>
<ul>
<li>gde je ponuđeno <b>„zaustavite svoje vozilo ispred linije zaustavljanja"</b> — to je tačan odgovor: policajac stoji okrenut <b>prednjom stranom tela prema tebi</b>, a taj položaj za tvoj smer znači <b>zabranjen prolaz</b>; propuštanje pešaka tu nije dovoljan odgovor jer ionako ne smeš preko linije;</li>
<li>gde tog odgovora <b>nema</b> u ponudi, biraš između „niste dužni da propustite", zvučnog znaka i propuštanja — i tačno je <b>da propustiš pešake</b>.</li>
</ul>
<p class="mut">Iz građe ovih pitanja izlazi samo jedno o položaju tela: prednja strana okrenuta prema tebi = tebi je prolaz zabranjen. Šta znače ostali položaji i znaci rukom, u njima ne piše — ne izvodi iz toga zaključak.</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Skretanje na bočni put — tu presecaš pešaka</b>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 192" style="max-width:300px;width:100%" role="img" aria-label="skretanje udesno na bočni put na čijem ulazu postoji obeležen pešački prelaz: isprekidana putanja vozila preseca pešaka koji prelazi preko šara">
<rect x="70" y="6" width="76" height="164" fill="#9aa7b4"/>
<rect x="146" y="54" width="154" height="64" fill="#9aa7b4"/>
<rect x="156" y="58" width="44" height="9" fill="#fff"/>
<rect x="156" y="72" width="44" height="9" fill="#fff"/>
<rect x="156" y="86" width="44" height="9" fill="#fff"/>
<rect x="156" y="100" width="44" height="9" fill="#fff"/>
<rect x="88" y="126" width="38" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="107" y="150" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<path class="animPutanjaSkretanja" d="M107,126 L107,98 Q107,82 132,82 L272,82" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 5"/>
<path d="M270,76 L282,82 L270,88 Z" fill="currentColor"/>
<circle cx="178" cy="62" r="6" fill="#2c6aa0"/>
<path d="M178,70 L178,110 M172,104 L178,111 L184,104" fill="none" stroke="#2c6aa0" stroke-width="2"/>
<circle cx="178" cy="82" r="13" fill="none" stroke="#c0392b" stroke-width="2.5"/>
<text x="150" y="186" text-anchor="middle" font-size="13" fill="currentColor">SA OBELEŽENIM PRELAZOM</text>
</svg>
</div>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 192" style="max-width:300px;width:100%" role="img" aria-label="skretanje udesno na bočni put na čijem ulazu nema obeleženog prelaza: pešak je već stupio na kolovoz, a isprekidana putanja vozila ga preseca">
<rect x="70" y="6" width="76" height="164" fill="#9aa7b4"/>
<rect x="146" y="54" width="154" height="64" fill="#9aa7b4"/>
<rect x="88" y="126" width="38" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="107" y="150" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<path class="animPutanjaSkretanja" d="M107,126 L107,98 Q107,82 132,82 L272,82" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 5"/>
<path d="M270,76 L282,82 L270,88 Z" fill="currentColor"/>
<circle cx="178" cy="62" r="6" fill="#2c6aa0"/>
<path d="M178,70 L178,110 M172,104 L178,111 L184,104" fill="none" stroke="#2c6aa0" stroke-width="2"/>
<circle cx="178" cy="82" r="13" fill="none" stroke="#c0392b" stroke-width="2.5"/>
<text x="150" y="186" text-anchor="middle" font-size="13" fill="currentColor">BEZ OBELEŽENOG PRELAZA</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">crveni krug = mesto gde tvoja putanja preseca pešaka · u oba crteža ga propuštaš — u donjem odlučuje to što je <b>već stupio na kolovoz</b></p>
<p>Kad skrećeš na bočni put, tvoja putanja preseca pešake koji prelaze kolovoz tog puta. Njih propuštaš:</p>
<ul>
<li>i kad na ulazu u bočni put <b>nema obeleženog prelaza</b> — odlučuje to što su <b>već stupili na kolovoz</b>, a ne to kuda prelaze;</li>
<li>i kad ti je <b>prolaz dozvoljen</b> — svetlosnim saobraćajnim znakom ili znakom policijskog službenika; zeleno ti otvara put, ali ne kroz ljude koji su već na prelazu;</li>
<li>a kad preko prelaza na ulazu u bočni put prelazi <b>dete</b>, i uz prolaz dozvoljen svetlosnim znakom <b>zaustavljaš vozilo</b> i propuštaš ga.</li>
</ul>
</div>

<div class="kPodH"><b class="kPodNaslov">Deca, kolona pešaka i zvučni znak</b>
<p><b>Dete na prelazu:</b> kad na pešački prelaz na kome nema ni semafora ni policajca stupa ili je već stupilo dete — zaustavljaš vozilo i propuštaš ga. Isto radiš i kad skrećeš na bočni put uz prolaz dozvoljen svetlosnim znakom, a preko prelaza na ulazu prelazi dete. Kod dece, nemoćnih i slepih lica nema procene „stići će da pređe" (ZOBS čl. 99).</p>
<p><b>Prisustvo dece pored kolovoza:</b> voziš sa naročitom opreznošću, tako da možeš blagovremeno da zaustaviš vozilo <b>i</b> da upotrebiš zvučni znak upozorenja — deca ne prate kretanje vozila (čl. 59). Samo prilagođavanje brzine tu nije potpun odgovor, a nastavak istom brzinom uz trubu je obrnuto od onoga što se traži.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 178" style="max-width:300px;width:100%" role="img" aria-label="dvoje dece stoji pored kolovoza; vozilo daje zvučni znak i smanjuje brzinu, a pešački prelaz ispred njega je prazan">
<text x="150" y="14" text-anchor="middle" font-size="13" fill="currentColor">DECA PORED KOLOVOZA</text>
<rect x="0" y="70" width="300" height="60" fill="#9aa7b4"/>
<rect x="16" y="84" width="58" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="45" y="105" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<path d="M80,92 Q88,100 80,108" fill="none" stroke="currentColor" stroke-width="1.6"/>
<path d="M88,87 Q99,100 88,113" fill="none" stroke="currentColor" stroke-width="1.6"/>
<path d="M96,82 Q110,100 96,118" fill="none" stroke="currentColor" stroke-width="1.6"/>
<rect x="112" y="92" width="6" height="24" fill="currentColor" opacity=".55"/>
<rect x="124" y="100" width="6" height="16" fill="currentColor" opacity=".55"/>
<rect x="136" y="108" width="6" height="8" fill="currentColor" opacity=".55"/>
<circle cx="170" cy="44" r="5.5" fill="#2c6aa0"/>
<line x1="170" y1="50" x2="170" y2="68" stroke="#2c6aa0" stroke-width="2"/>
<circle cx="194" cy="48" r="5.5" fill="#2c6aa0"/>
<line x1="194" y1="54" x2="194" y2="68" stroke="#2c6aa0" stroke-width="2"/>
<rect x="230" y="74" width="56" height="9" fill="#fff"/>
<rect x="230" y="88" width="56" height="9" fill="#fff"/>
<rect x="230" y="102" width="56" height="9" fill="#fff"/>
<rect x="230" y="116" width="56" height="9" fill="#fff"/>
<text x="150" y="150" text-anchor="middle" font-size="12" fill="currentColor">USPORAVAŠ · spreman da staneš</text>
<text x="150" y="168" text-anchor="middle" font-size="12" fill="currentColor">+ ZVUČNI ZNAK</text>
</svg>
</div>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 194" style="max-width:300px;width:100%" role="img" aria-label="prelaz bez semafora i bez policijskog službenika — oba su nacrtana i precrtana crvenim krstom; dete je stupilo na šare, a vozilo staje ispred prelaza bez upotrebe zvučnog znaka">
<text x="150" y="14" text-anchor="middle" font-size="13" fill="currentColor">DETE JE STUPILO NA PRELAZ</text>
<rect x="200" y="30" width="18" height="36" rx="3" fill="#2a333d"/>
<circle cx="209" cy="38" r="4.5" fill="#5a6672"/>
<circle cx="209" cy="48" r="4.5" fill="#5a6672"/>
<circle cx="209" cy="58" r="4.5" fill="#5a6672"/>
<path d="M196,26 L222,70 M222,26 L196,70" fill="none" stroke="#c0392b" stroke-width="3"/>
<circle cx="252" cy="38" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M243,50 L261,50 L264,70 L240,70 Z" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M236,26 L268,72 M268,26 L236,72" fill="none" stroke="#c0392b" stroke-width="3"/>
<rect x="0" y="84" width="300" height="60" fill="#9aa7b4"/>
<rect x="210" y="88" width="56" height="9" fill="#fff"/>
<rect x="210" y="102" width="56" height="9" fill="#fff"/>
<rect x="210" y="116" width="56" height="9" fill="#fff"/>
<rect x="210" y="130" width="56" height="9" fill="#fff"/>
<circle cx="238" cy="92" r="5" fill="#2c6aa0"/>
<path d="M238,99 L238,134 M232,128 L238,135 L244,128" fill="none" stroke="#2c6aa0" stroke-width="2"/>
<rect x="16" y="98" width="58" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="45" y="119" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<text x="46" y="76" text-anchor="middle" font-size="12" fill="#c0392b">STAJEŠ</text>
<path d="M46,80 L46,94 M41,88 L46,95 L51,88" fill="none" stroke="#c0392b" stroke-width="2"/>
<text x="150" y="166" text-anchor="middle" font-size="12" fill="currentColor">zaustavljaš i propuštaš ga</text>
<text x="150" y="184" text-anchor="middle" font-size="12" fill="#c0392b">ZVUČNI ZNAK: NE</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">gore: na prelazu ispred tebe nema nikoga, deca su pored kolovoza — usporavaš, spreman da staneš, <b>i</b> trubiš · dole: precrtani semafor i policajac znače da prelaz nije regulisan, a dete je već na njemu — <b>zaustavljaš vozilo</b>, truba ne pomaže</p>
<table>
<tr><th>Situacija</th><th>Zvučni znak?</th></tr>
<tr><td>pešak je stupio ili stupa <b>na pešački prelaz</b> ispred tebe — i onda kad ti je prolaz dozvoljen</td><td><b>NE</b> — propuštaš ga</td></tr>
<tr><td><b>DETE</b> je stupilo ili stupa na prelaz koji <b>nije regulisan</b>, ili na prelaz na ulazu u bočni put u koji skrećeš uz prolaz dozvoljen svetlosnim znakom</td><td><b>NE</b> — zaustavljaš vozilo i propuštaš ga</td></tr>
<tr><td>pešak je već <b>na kolovozu</b> ispred tebe, van obeleženog prelaza</td><td><b>NE</b> — propuštaš ga</td></tr>
<tr><td>nailaziš na prelaz koji <b>nije regulisan</b> — pitanje pita šta si dužan pri samom nailasku</td><td><b>NE</b> — prilagođavaš brzinu tako da možeš bezbedno da propustiš pešaka</td></tr>
<tr><td><b>prisustvo dece pored kolovoza</b>, niko nije stupio na prelaz ispred tebe</td><td><b>DA</b> — uz naročitu opreznost i blagovremeno zaustavljanje</td></tr>
</table>
<p class="mut">Pamtilica: truba je tačan odgovor samo tamo gde se pitanje vrti oko <b>prisustva dece</b> i naročite opreznosti. Čim je neko stupio na prelaz ili na kolovoz ispred tebe, trubljenje ne zamenjuje ni propuštanje ni zaustavljanje.</p>
<p><b>Organizovanu kolonu pešaka</b> koja se kreće po kolovozu <b>ne smeš da presecaš</b> — čekaš da cela pređe, pa tek onda krećeš; nema izuzetka ni kad su u koloni deca (ZOBS čl. 99). Ni u prazninu koja se otvori između dvoje njih ne uteruješ vozilo: kolona prolazi kao celina.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 156" style="max-width:300px;width:100%" role="img" aria-label="organizovana kolona pešaka prelazi kolovoz u nizu; isprekidana putanja vozila vodi u prazninu između dvoje pešaka i tu je precrtana crvenim krstom">
<rect x="0" y="44" width="300" height="68" fill="#9aa7b4"/>
<rect x="14" y="71" width="54" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="41" y="92" text-anchor="middle" font-size="12" fill="currentColor">TI</text>
<g class="animKolonaPrelazi">
<circle cx="186" cy="32" r="5" fill="#2c6aa0"/>
<circle cx="186" cy="54" r="5" fill="#2c6aa0"/>
<circle cx="186" cy="76" r="5" fill="#2c6aa0"/>
<circle cx="186" cy="98" r="5" fill="#2c6aa0"/>
<circle cx="186" cy="120" r="5" fill="#2c6aa0"/>
</g>
<path d="M214,110 L214,50 M208,56 L214,49 L220,56" fill="none" stroke="#2c6aa0" stroke-width="2"/>
<path d="M72,87 L172,87" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 5"/>
<path d="M180,81 L192,93 M192,81 L180,93" fill="none" stroke="#c0392b" stroke-width="3"/>
<text x="186" y="20" text-anchor="middle" font-size="13" fill="currentColor">ORGANIZOVANA KOLONA</text>
<text x="150" y="142" text-anchor="middle" font-size="12" fill="#c0392b">ne presecaš je — čekaš da cela pređe</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">plava strelica = smer kretanja kolone · crveni krst stoji tačno u praznini između dvoje pešaka: ni tuda ne prolaziš</p>
</div>

<div class="kPodH"><b class="kPodNaslov">Pešak van naselja, koturaljke i autoput</b>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 300 118" style="max-width:300px;width:100%" role="img" aria-label="pešak van naselja ide uz levu ivicu kolovoza u smeru svog kretanja, a vozila mu tom istom stranom dolaze u susret">
<rect x="0" y="40" width="300" height="64" fill="#9aa7b4"/>
<line x1="0" y1="72" x2="300" y2="72" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>
<circle cx="54" cy="50" r="6" fill="#2c6aa0"/>
<path d="M64,50 L92,50 M86,45 L93,50 L86,55" fill="none" stroke="#2c6aa0" stroke-width="2"/>
<line x1="54" y1="36" x2="54" y2="42" stroke="#2c6aa0" stroke-width="1.5"/>
<text x="70" y="14" text-anchor="middle" font-size="12" fill="#2c6aa0">PEŠAK: uz LEVU</text>
<text x="70" y="31" text-anchor="middle" font-size="12" fill="#2c6aa0">ivicu kolovoza</text>
<g class="animVoziloUSusret">
<rect x="196" y="46" width="52" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M190,56 L162,56 M168,51 L161,56 L168,61" fill="none" stroke="currentColor" stroke-width="2"/>
</g>
<text x="222" y="32" text-anchor="middle" font-size="12" fill="currentColor">vozila u susret</text>
<rect x="90" y="78" width="52" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
<path d="M148,88 L176,88 M170,83 L177,88 L170,93" fill="none" stroke="currentColor" stroke-width="2"/>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">pešak gore ide udesno, a vozilo u toj istoj polovini kolovoza dolazi mu u susret — zato ga vidi na vreme · dole vozilo ide u istom smeru kao pešak</p>
<p><b>Van naselja</b> pešak koji se kreće po kolovozu <b>mora</b> da ide što bliže <b>levoj</b> ivici kolovoza u smeru svog kretanja, tako da ne ometa i ne sprečava saobraćaj vozila. Nije „može levo ili desno" i nije desno — mora levo, suprotno od strane kojom idu vozila u njegovom smeru.</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="pešak na skejtbordu drži se za vozilo u pokretu, veza je precrtana crvenim krstom"><rect x="3" y="20" width="30" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2,14 L14,14 M8,9 L1,14 L8,19" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="60" cy="20" r="5" fill="none" stroke="currentColor" stroke-width="2"/><line x1="60" y1="25" x2="60" y2="42" stroke="currentColor" stroke-width="2"/><line x1="60" y1="42" x2="53" y2="52" stroke="currentColor" stroke-width="2"/><line x1="60" y1="42" x2="67" y2="52" stroke="currentColor" stroke-width="2"/><rect x="47" y="53" width="26" height="4" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="61" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="68" cy="61" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="56" y1="30" x2="35" y2="30" stroke="currentColor" stroke-width="2"/><path d="M39,24 L51,36 M51,24 L39,36" fill="none" stroke="#c0392b" stroke-width="3"/></svg>
    <b>NE DRŽIŠ SE ZA VOZILO</b><span>kolica, koturaljke, skejtbord — ni kad vozilo ide brzinom hoda</span>
  </div>
</div>
<p><b>Kolica za osobe sa invaliditetom, koturaljke, skejtbord:</b> pešak <b>ne sme da se pridržava za vozilo u pokretu</b> — ni onda kad se vozilo kreće brzinom hoda pešaka.</p>
<table>
<tr><th>Autoput i motoput: zabrana kretanja pešaka NE važi za</th><th>Zabrana važi — ne sme</th></tr>
<tr><td>lice koje otklanja posledice saobraćajne nezgode ili neispravnosti na vozilu i teretu</td><td>vozača koji se zaustavio radi odmora</td></tr>
<tr><td>vozača <b>prinudno</b> zaustavljenog vozila</td><td>vozača koji se zaustavio radi ulaska/izlaska putnika ili utovara/istovara tereta</td></tr>
</table>
<p class="mut">Pamtilica: izvela te <b>nevolja</b> iz vozila (nezgoda, kvar) — smeš da budeš pešak na autoputu; izašao si <b>svojom voljom</b> (odmor, putnici, teret) — ne smeš.</p>
</div>
`,
};

CARDS['pruga'] = {
  title: 'Prelaz puta preko železničke pruge',
  html: `
<p><b>Gvozdeno pravilo (čl. 100):</b> šinsko vozilo UVEK propuštaš — voz ne može da stane.</p>
<p><b>Približavanje prelazu:</b> brzina takva da možeš da staneš pred branikom/uređajem, odnosno pre pruge · spušten ili se spušta branik / crveno svetlo / zvučni signal = STOP · na prelazu je zabranjeno preticanje, obilaženje i zaustavljanje (+ 5 m zona za parkiranje).</p>
<p><b>Prelaz bez branika i uredjaja:</b> zaustavi se, pogledaj oba smera, pređi tek kad si siguran da voz ne nailazi.</p>
<p style="margin-top:10px"><b>Šta ćeš videti na putu</b> — prepoznaj svaki znak:</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="4" y="4" width="112" height="112" rx="8" fill="#fff" stroke="#c0392b" stroke-width="6"/>
      <path d="M26 26 L94 94 M94 26 L26 94" stroke="#111" stroke-width="9" stroke-linecap="round"/></svg>
    <b>ANDREJIN KRST — jedan kolosek</b><span>obeležava sam prelaz; postavlja se neposredno pred prugu</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="4" y="4" width="112" height="112" rx="8" fill="#fff" stroke="#c0392b" stroke-width="6"/>
      <path d="M26 34 L94 84 M94 34 L26 84 M26 56 L94 106 M94 56 L26 106" stroke="#111" stroke-width="8" stroke-linecap="round"/></svg>
    <b>DVOSTRUKI KRST — dva ili više koloseka</b><span>posle prvog voza može naići i drugi iz suprotnog smera</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="38" y="4" width="44" height="112" rx="3" fill="#fff" stroke="#8a99a8" stroke-width="2"/><g fill="#e0451c"><polygon points="38,30 82,12 82,24 38,42"/><polygon points="38,56 82,38 82,50 38,68"/><polygon points="38,82 82,64 82,76 38,94"/></g></svg>
    <b>KOSNICI — 240 · 160 · 80 m</b><span>uspravna tabla ispod znaka: tri kose pruge = 240 m do pruge, dve = 160 m, jedna = 80 m</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 120"><rect x="0" y="70" width="120" height="50" fill="#9aa7b4"/>
      <rect x="10" y="30" width="100" height="12" rx="4" fill="#c0392b"/><rect x="10" y="30" width="25" height="12" fill="#fff"/><rect x="60" y="30" width="25" height="12" fill="#fff"/>
      <circle cx="24" cy="58" r="9" fill="#c0392b"/><circle cx="52" cy="58" r="9" fill="#5a2320"/></svg>
    <b>BRANIK + DVA CRVENA</b><span>spušten ili se spušta branik, odnosno naizmenično trepću crvena svetla = obavezno stajanje</span>
  </div>
</div>`,
};

CARDS['put-pojmovi'] = {
  title: 'Put, kolovoz, trake — osnovni pojmovi',
  html: `
<div class="kSek" data-sub="109">
<p><b>Slojevi puta:</b> PUT (celina) ⊃ KOLOVOZ (deo za vozila) ⊃ KOLOVOZNA TRAKA (jedan smer) ⊃ SAOBRAĆAJNA TRAKA (jedan red vozila). Trotoar je deo puta za pešake, bankina je uz kolovoz.</p>
<svg viewBox="0 0 320 330" role="img" aria-label="Put kao celina: u putu su kolovoz i trotoar; u kolovozu je kolovozna traka za jedan smer, a u njoj saobraćajna traka za jedan red vozila" style="max-width:320px;width:100%;display:block;margin:6px auto">
  <rect x="5" y="5" width="310" height="317" rx="10" fill="none" stroke="currentColor" stroke-width="2"/>
  <text x="16" y="28" font-size="15" font-weight="bold" fill="currentColor">PUT (celina)</text>
  <text x="16" y="46" font-size="12" fill="currentColor">kolovoz + trotoar + bankina…</text>

  <rect x="14" y="56" width="292" height="188" rx="8" fill="#9aa7b4" fill-opacity=".28" stroke="currentColor" stroke-width="1.5"/>
  <text x="24" y="76" font-size="13" font-weight="bold" fill="currentColor">KOLOVOZ (za vozila)</text>

  <rect x="24" y="86" width="272" height="152" rx="6" fill="#9aa7b4" fill-opacity=".3" stroke="currentColor" stroke-width="1.5"/>
  <text x="34" y="105" font-size="13" font-weight="bold" fill="currentColor">KOLOVOZNA TRAKA</text>
  <text x="34" y="123" font-size="12" fill="currentColor">(jedan smer)</text>
  <g stroke="currentColor" stroke-width="2" fill="none">
    <line x1="200" y1="110" x2="274" y2="110"/>
    <path d="M266 103L280 110L266 117"/>
  </g>

  <rect x="34" y="130" width="252" height="100" rx="5" fill="#9aa7b4" fill-opacity=".32" stroke="currentColor" stroke-width="1.5"/>
  <text x="44" y="149" font-size="13" font-weight="bold" fill="currentColor">SAOBRAĆAJNA TRAKA</text>
  <text x="44" y="167" font-size="12" fill="currentColor">(jedan red vozila)</text>
  <g stroke="currentColor" stroke-width="1.5">
    <g fill="currentColor" fill-opacity=".25">
      <rect x="68" y="182" width="48" height="26" rx="6"/>
      <rect x="78" y="173" width="28" height="11" rx="4"/>
      <rect x="136" y="182" width="48" height="26" rx="6"/>
      <rect x="146" y="173" width="28" height="11" rx="4"/>
      <rect x="204" y="182" width="48" height="26" rx="6"/>
      <rect x="214" y="173" width="28" height="11" rx="4"/>
    </g>
    <g fill="none">
      <circle cx="81" cy="209" r="4"/><circle cx="103" cy="209" r="4"/>
      <circle cx="149" cy="209" r="4"/><circle cx="171" cy="209" r="4"/>
      <circle cx="217" cy="209" r="4"/><circle cx="239" cy="209" r="4"/>
    </g>
  </g>

  <rect x="14" y="256" width="292" height="56" rx="8" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-width="1.5"/>
  <text x="24" y="289" font-size="14" font-weight="bold" fill="currentColor">TROTOAR</text>
  <g stroke="currentColor" stroke-width="1.2" stroke-opacity=".55" fill="none">
    <line x1="152" y1="284" x2="292" y2="284"/>
    <line x1="166" y1="264" x2="166" y2="304"/>
    <line x1="194" y1="264" x2="194" y2="304"/>
    <line x1="222" y1="264" x2="222" y2="304"/>
    <line x1="250" y1="264" x2="250" y2="304"/>
    <line x1="278" y1="264" x2="278" y2="304"/>
  </g>
</svg>
<p><b>Vrste puteva:</b> autoput (fizički razdvojene kolovozne trake, bez ukrštanja u nivou) · motoput (za motorna vozila, može i bez razdvajanja) · javni put · zemljani put (sa njega propuštaš SVE pri uključenju!).</p>
<p><b>Ključne definicije (čl. 7):</b> ZAUSTAVLJANJE = prekid kretanja do 3 MINUTA (vozač ne napušta vozilo, osim po znaku/pravilu) · PARKIRANJE = svaki duži prekid · NASELJE = izgrađen prostor čije su granice obeležene znakom.</p>
</div>
<div class="kSek" data-sub="115">
<p><b>Zone (čl. 160-163) — četiri pojma koja baza vrti jedan protiv drugog.</b> Pitanja idu u OBA smera: jednom „Zona 30 je…", drugi put „Deo puta u kojoj je brzina ograničena do 30 km/h je…" — i tu se traži naziv. Zato uči par NAZIV ↔ DEFINICIJA, ne samo brzinu.</p>
<table>
<tr><th>Zona</th><th>Po čemu se prepoznaje</th><th>Brzina</th></tr>
<tr><td><b>Pešačka zona</b><br><span class="mut">čl. 160</span></td><td>prvenstveno namenjena saobraćaju PEŠAKA; vozila samo izuzetno, kad opština dozvoli</td><td><b>brzina kretanja pešaka</b> — bez ijedne brojke u km/h</td></tr>
<tr><td><b>Zona usporenog saobraćaja</b><br><span class="mut">čl. 161</span></td><td>kolovoz DELE pešaci i vozila</td><td>brzina kretanja pešaka, <b>a najviše 10 km/h</b></td></tr>
<tr><td><b>Zona „30"</b><br><span class="mut">čl. 162</span></td><td>samo ograničenje brzine — u definiciji nema pešaka</td><td><b>do 30 km/h</b></td></tr>
<tr><td><b>Zona škole</b><br><span class="mut">čl. 163</span></td><td>deo puta ili ulice u neposrednoj blizini škole</td><td><b>u naselju 30, van naselja 50</b> km/h, u vremenu od 7,00 do 21,00 (osim ako znak ne odredi drugačije)</td></tr>
</table>
<p><b>Tri zamke koje nose sve poene ove podoblasti:</b><br>
1) <b>Pešačka zona je jedina bez brojke.</b> Kad se traži brzina u pešačkoj zoni, ponuđeni „20 km/h" i „30 km/h" su mamci — tačan odgovor je „kretanja pešaka" i tu se staje. Brojku imaju usporena zona (10) i zona „30" (30).<br>
2) <b>Brzina pešaka se javlja dva puta</b> — u pešačkoj zoni i u zoni usporenog saobraćaja — ali samo usporena zona ima i tavanicu: najviše 10 km/h.<br>
3) <b>Dvojka je uvek mamac.</b> Kroz celu ovu podoblast, i kod zona i kod gašenja motora, „20 km/h" i „dva minuta" pojavljuju se isključivo kao netačni odgovori. Tačne brojke su 10, 30, 50, vreme 7,00-21,00, jedan minut i tri minuta.</p>
<p class="mut">Sve četiri zone moraju biti obeležene propisanom saobraćajnom signalizacijom — nema zone koja se podrazumeva bez znaka.</p>
<p><b>Kad se gasi motor (čl. 164)</b> — zakon nabraja tačno četiri situacije:</p>
<table>
<tr><th>Vozač mora isključiti motor</th><th>Zapamti</th></tr>
<tr><td>na zahtev policajca ili drugog službenog lica</td><td>bez rasprave, odmah</td></tr>
<tr><td>kada je to određeno saobraćajnom signalizacijom</td><td>znak koji to nalaže; crveno svetlo na semaforu nije nalog za gašenje</td></tr>
<tr><td>kad je vozilo zaustavljeno u <b>tunelu duže od jednog minuta</b></td><td>u tunelu je strože: izduvni gasovi nemaju kuda</td></tr>
<tr><td>kad vozilo <b>stoji duže od tri minuta</b></td><td>ista granica kao u definiciji zaustavljanja gore</td></tr>
</table>
<p><b>Semafor NIJE razlog za gašenje motora.</b> Kao mamac se dva puta nudi „prekid kretanja radi postupanja po svetlosnom znaku zabrane prolaska koji daje semafor" — jednom sa dodatkom „duže od dva minuta", jednom bez njega. Ni jedno ni drugo nije u zakonu: crveno svetlo motor ne gasi, gasi ga tunel (jedan minut), stajanje (tri minuta), znak i službeno lice.</p>
<p><b>Otpad i buka (isti čl. 164):</b> ispuštanje, odnosno odlaganje materija i otpada kojima se ugrožava život i zdravlje ljudi, životinja, biljaka ili zagađuje životna sredina <b>nije dozvoljeno</b> — ni na putu ni pored njega, dakle nigde. Svako sužavanje te zabrane rečju „samo" („samo van naseljenog mesta", „samo tamo gde postoji znak") je mamac. Iz istog člana je i pravilo da vozilo u saobraćaju ne sme da prouzrokuje prekomernu buku — kod motocikla to praktično znači neprepravljan, propisan izduvni sistem.</p>
</div>
`,
};

CARDS['autoput'] = {
  title: 'Autoput i motoput — posebna pravila',
  html: `
<p><b>Kretanje (čl. 104):</b> krajnjom DESNOM trakom (osim kolone/preticanja) · zaustavnom trakom je ZABRANJENO kretanje (izuzetak: pod pratnjom/pravo prvenstva kad je gužva, održavanje) · preticanje s desne strane zabranjeno.</p>
<p><b>Zabranjeno na autoputu/motoputu (čl. 105):</b> zaustavljanje i parkiranje (osim uređenih mesta) · polukružno okretanje · kretanje unazad.</p>
<p><b>Kvar (čl. 105):</b> zaustavi na zaustavnoj traci, sigurnosni trougao na ≥ 100 m, svi pokazivači, svetloodbojni prsluk van vozila — i ukloni vozilo što pre.</p>
<p><b>Zastoj:</b> ostavlja se slobodan prolaz za vozila pod pratnjom/sa pravom prvenstva (čl. 104).</p>
<p style="margin-top:14px"><b>Uključivanje na autoput — pogled odozgo:</b></p>
<svg viewBox="0 0 320 250" role="img" aria-label="Autoput odozgo, smer voznje udesno: leva traka, krajnja desna traka i zaustavna traka; crvenim je precrtan prelazak preko razdelnog pojasa i voznja zaustavnom trakom" style="max-width:340px;width:100%;display:block;margin:10px auto">
  <!-- razdelni pojas (zelena) sa prolazom -->
  <rect x="6" y="8" width="308" height="34" fill="#6b7f5e"/>
  <rect x="222" y="8" width="64" height="34" fill="#9aa7b4"/>
  <!-- bankina / zelena povrsina desno od kolovoza -->
  <rect x="6" y="216" width="308" height="26" fill="#6b7f5e"/>
  <!-- kolovoz -->
  <rect x="6" y="42" width="308" height="174" fill="#9aa7b4"/>
  <rect x="6" y="8" width="308" height="234" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
  <!-- oznake na kolovozu -->
  <line x1="6" y1="47" x2="314" y2="47" stroke="#fff" stroke-width="3"/>
  <line x1="10" y1="104" x2="310" y2="104" stroke="#fff" stroke-width="4" stroke-dasharray="18 13"/>
  <line x1="6" y1="164" x2="314" y2="164" stroke="#fff" stroke-width="3"/>
  <line x1="6" y1="211" x2="314" y2="211" stroke="#fff" stroke-width="3"/>
  <!-- vozilo u krajnjoj desnoj traci, smer voznje udesno -->
  <g transform="translate(170 134) rotate(90)">
    <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
    <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
    <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
  </g>
  <!-- zabranjen prelazak preko razdelnog pojasa -->
  <path d="M263 101 C263 76 254 58 252 30" stroke="#c0392b" stroke-width="4" fill="none" stroke-dasharray="7 6" stroke-linecap="round"/>
  <polygon points="246,30 258,30 252,14" fill="#c0392b"/>
  <g transform="translate(257 66)"><circle r="12" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>
  <!-- zabranjena voznja zaustavnom trakom -->
  <g transform="translate(252 187)"><circle r="12" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>
  <text x="18" y="80" font-size="13" font-weight="bold" fill="#2a333d">LEVA</text>
  <text x="18" y="139" font-size="13" font-weight="bold" fill="#2a333d">KRAJNJA DESNA</text>
  <text x="18" y="192" font-size="13" font-weight="bold" fill="#2a333d">ZAUSTAVNA</text>
</svg>
<svg viewBox="0 0 320 250" role="img" aria-label="Ukljucivanje sa ulivne trake na autoput: zelena strelica sa kvacicom vodi u krajnju desnu traku, crvena isprekidana strelica pravo u levu traku je precrtana" style="max-width:340px;width:100%;display:block;margin:10px auto">
  <!-- zelena povrsina: razdelni pojas gore i bankina dole -->
  <rect x="6" y="8" width="308" height="20" fill="#6b7f5e"/>
  <rect x="6" y="152" width="308" height="90" fill="#6b7f5e"/>
  <!-- ulivna traka koja se pri kraju suzava (klin) -->
  <polygon points="6,152 300,152 210,204 6,204" fill="#9aa7b4"/>
  <!-- glavni kolovoz: leva + krajnja desna traka -->
  <rect x="6" y="28" width="308" height="124" fill="#9aa7b4"/>
  <rect x="6" y="8" width="308" height="234" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
  <!-- oznake na kolovozu -->
  <line x1="6" y1="33" x2="314" y2="33" stroke="#fff" stroke-width="3"/>
  <line x1="10" y1="96" x2="310" y2="96" stroke="#fff" stroke-width="4" stroke-dasharray="18 13"/>
  <line x1="10" y1="152" x2="206" y2="152" stroke="#fff" stroke-width="4" stroke-dasharray="14 12"/>
  <line x1="210" y1="152" x2="314" y2="152" stroke="#fff" stroke-width="3"/>
  <polyline points="6,199 205,199 289,152" fill="none" stroke="#fff" stroke-width="3"/>
  <!-- vozilo u krajnjoj desnoj traci -->
  <g transform="translate(288 124) rotate(90)">
    <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#5f6d7a"/>
    <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
    <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
  </g>
  <!-- vozilo na ulivnoj traci -->
  <g transform="translate(155 177) rotate(90)">
    <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
    <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
    <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
    <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
  </g>
  <!-- ispravno: uklopi se u krajnju desnu traku -->
  <path d="M178 174 C212 172 216 128 246 124" stroke="#1f7a3f" stroke-width="5" fill="none" stroke-linecap="round"/>
  <polygon points="264,123 248,130 248,116" fill="#1f7a3f"/>
  <g transform="translate(210 150)"><circle r="12" fill="#fff" stroke="#1f7a3f" stroke-width="3"/><path d="M-5 0 L-1 5 L5 -5" stroke="#1f7a3f" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  <!-- pogresno: pravo u levu traku -->
  <path d="M172 164 C205 156 212 100 236 76" stroke="#c0392b" stroke-width="4" fill="none" stroke-dasharray="7 6" stroke-linecap="round"/>
  <g transform="translate(250 62)"><circle r="12" fill="#fff" stroke="#c0392b" stroke-width="3"/><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/></g>
  <text x="18" y="70" font-size="13" font-weight="bold" fill="#2a333d">LEVA</text>
  <text x="18" y="129" font-size="13" font-weight="bold" fill="#2a333d">KRAJNJA DESNA</text>
  <text x="18" y="184" font-size="13" font-weight="bold" fill="#2a333d">ULIVNA TRAKA</text>
</svg>
<p>Na autoput se uključuješ SAMO prilaznim putem: ulivnom trakom voziš do njenog kraja i ulivaš se u krajnju DESNU saobraćajnu traku (zelena putanja — na ispitnoj slici to je putanja br. 3), uz uključen LEVI pokazivač pravca i obavezu da propustiš vozila koja se već kreću autoputem. Prevremeno napuštanje ulivne trake — odmah u voznu traku (na slici mamac br. 2) ili sečenjem čak u levu (mamac br. 1) — nije propisno, a zaustavnom trakom kretanje NIJE dozvoljeno: mamac „osim motornim vozilima koja vuku neispravno vozilo" je netačan, izuzetka nema. Polukružno okretanje, i kroz prolaz u razdelnom pojasu, zabranjeno je bez ijednog izuzetka — „ako se može izvršiti bez manevrisanja" i „ako se time ne ugrožavaju drugi učesnici u saobraćaju" su mamci, a isto važi i na motoputu.</p>
`,
};

CARDS['vozilo-tehnika'] = {
  title: 'Vozilo, registracija i tehnički pregled',
  html: `
<div class="kSek" data-sub="126,127">
<p><b>U saobraćaju sme samo vozilo koje je:</b> REGISTROVANO (važeća registraciona nalepnica) + TEHNIČKI ISPRAVNO. Registracija važi godinu dana.</p>
</div>
<div class="kSek" data-sub="127">
<p><b>Tehnički pregled:</b> redovni — pre izdavanja registracione nalepnice · vozilo mora imati ispravne propisane uređaje (kočnice, upravljač, svetla, pneumatike...).</p>
<p><b>Pneumatici:</b> na istoj osovini ISTI (dimenzija, vrsta) · dubina šare: dublja od TWI oznake, a bez TWI oznake NAJMANJE 1,6 mm (moped/motocikl) · zimska oprema kad je propisana.</p>
<p><b>Za motocikl posebno:</b> ogledala, svetla i kočnice na oba točka su bezbednosno kritični — na testu se traži šta je OBAVEZNA oprema.</p>
<p style="margin-top:18px"><b>REDOVNI · VANREDNI · KONTROLNI TEHNIČKI PREGLED</b></p>
<p>Tri vrste pregleda su tri različita pitanja na testu, a zamke su gotovo uvek odgovori <b>pozajmljeni od druge vrste</b>. Razvrstaj jednom i ne mešaj:</p>
<table>
<tr><th></th><th>Redovni</th><th>Vanredni</th><th>Kontrolni</th></tr>
<tr><td><b>Šta je</b></td><td>Može biti <b>godišnji i šestomesečni</b></td><td>Pregled <b>pre puštanja u saobraćaj</b> vozila koje je „ispalo iz stroja"</td><td>Kontrola tehničke ispravnosti <b>po nalogu</b></td></tr>
<tr><td><b>Kada / povod</b></td><td>Godišnjem se vozilo podvrgava <b>pre upisa u jedinstveni registar vozila, odnosno izdavanja registracione nalepnice</b> · može se izvršiti <b>najranije 30 dana pre podnošenja zahteva</b> za upis/nalepnicu</td><td>1) kod vozila su <b>u saobraćajnoj nezgodi ili na drugi način oštećeni vitalni sklopovi i uređaji</b> bitni za bezbednost, odnosno vozilo posle toga <b>nije bilo u voznom stanju</b> · 2) vozilo je <b>isključeno iz saobraćaja zbog tehničke neispravnosti utvrđene na kontrolnom pregledu</b></td><td>Može se uputiti vozilo <b>koje je u voznom stanju</b></td></tr>
<tr><td><b>Ko upućuje</b></td><td>Vezan za registraciju (nalepnicu)</td><td>Obavlja se pre puštanja u saobraćaj — ne po nečijem nalogu</td><td><b>Po nalogu ovlašćenog lica MUP-a</b> ili <b>inspektora za drumski saobraćaj</b> — NE po zahtevu vozača ni vlasnika</td></tr>
</table>
<p class="mut">Zamke po vrstama: kod redovnog nude „tromesečni" i „petogodišnji" (ne postoje) i „najkasnije jednu godinu nakon prethodnog pregleda" — tačan odgovor je vezan za <b>nalepnicu</b>, ne za datum prošlog pregleda. Kod vanrednog nude „radi kontrole od strane ovlašćenog lica MUP-a/inspektora" (to je kontrolni!) i „pre isteka roka od šest meseci od početka važenja nalepnice" (to miriše na šestomesečni redovni). Kod kontrolnog nude vozilo „kojem su u nezgodi oštećeni uređaji" — to ide na <b>vanredni</b>; na kontrolni se može uputiti vozilo <b>u voznom stanju</b>.</p>
<p><b>Zajednička pravila za redovni i vanredni pregled:</b> vrše se samo na <b>čistom</b> vozilu koje je <b>u voznom stanju</b> i <b>neopterećeno</b> — zamka „na tehnički ispravnom vozilu" je besmislena, jer se ispravnost na pregledu tek utvrđuje. Lice koje je dovezlo vozilo kontroloru daje na uvid <b>saobraćajnu dozvolu i SVOJU ličnu kartu</b> (ne ličnu kartu vlasnika, ne vozačku dozvolu). Registrovano, neodjavljeno vozilo na redovnom pregledu mora imati <b>sve propisane registarske tablice, postavljene na predviđenim mestima</b> — „bar jedna tablica" nije dovoljna.</p>
</div>


<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<!-- DODATAK kartici vozilo-tehnika (podoblasti 126, 127). Sledljivost: ispred svakog bloka stoji HTML komentar sa brojevima pitanja iz gradje na koja se blok oslanja. Komentari se ne vide u kartici. -->
<div class="kSek" data-sub="126,127">
<div class="kPodH"><b class="kPodNaslov">Bez ovo troje vozilo ne sme na put</b>
<!-- izvor: #8423, #8424 -->
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 300 316" style="width:100%;max-width:340px" role="img" aria-label="sema: saobracajna dozvola plus registarske tablice plus registraciona nalepnica znaci da vozilo sme na put; ako fali bilo koje od troje, vozilo ne sme na put">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="20" y="6" width="260" height="32" rx="4"/>
<rect x="20" y="58" width="260" height="32" rx="4"/>
<rect x="20" y="110" width="260" height="32" rx="4"/>
<rect x="30" y="11" width="18" height="22" rx="2"/>
<line x1="34" y1="17" x2="44" y2="17"/>
<line x1="34" y1="22" x2="44" y2="22"/>
<line x1="34" y1="27" x2="41" y2="27"/>
<rect x="26" y="67" width="26" height="14" rx="2"/>
<circle cx="39" cy="126" r="11"/>
<circle cx="39" cy="126" r="5"/>
<line x1="150" y1="142" x2="150" y2="156"/>
</g>
<rect x="26" y="67" width="7" height="14" fill="#2c6aa0"/>
<polygon points="144,156 156,156 150,166" fill="currentColor"/>
<g fill="currentColor" text-anchor="middle" font-size="12">
<text x="172" y="27">SAOBRAĆAJNA DOZVOLA</text>
<text x="172" y="79">REGISTARSKE TABLICE</text>
<text x="172" y="131">REGISTRACIONA NALEPNICA</text>
</g>
<g fill="currentColor" text-anchor="middle" font-size="15">
<text x="150" y="53">+</text>
<text x="150" y="105">+</text>
</g>
<rect x="64" y="170" width="172" height="34" rx="4" fill="none" stroke="#1f7a3f" stroke-width="1.8"/>
<polyline points="80,188 87,195 100,180" fill="none" stroke="#1f7a3f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<text x="172" y="192" font-size="13" text-anchor="middle" fill="#1f7a3f">SME NA PUT</text>
<line x1="12" y1="212" x2="288" y2="212" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4" opacity="0.45"/>
<rect x="20" y="222" width="260" height="30" rx="4" fill="none" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="6 4"/>
<text x="150" y="242" font-size="12" text-anchor="middle" fill="#c0392b">fali BILO KOJE od troje</text>
<line x1="150" y1="252" x2="150" y2="264" stroke="#c0392b" stroke-width="1.5"/>
<polygon points="144,264 156,264 150,274" fill="#c0392b"/>
<rect x="64" y="278" width="172" height="34" rx="4" fill="none" stroke="#c0392b" stroke-width="1.8"/>
<g fill="none" stroke="#c0392b" stroke-width="2.4" stroke-linecap="round">
<circle cx="90" cy="295" r="9"/>
<line x1="84" y1="289" x2="96" y2="301"/>
</g>
<text x="172" y="300" font-size="13" text-anchor="middle" fill="#c0392b">NE SME NA PUT</text>
</svg>
</div>
<!-- izvor: #8423, #8424 -->
<p><b>Sva tri dokumenta zajedno:</b> saobraćajna dozvola + registarske tablice + registraciona nalepnica. Svejedno je koje od troje fali — vozilo ne sme na put.</p>
<!-- izvor: #8423, #8424 -->
<p><b>Mamci su uvek nepotpuni spiskovi:</b> „dozvola i tablice" (fali nalepnica), „dozvola i potvrda o tehničkoj ispravnosti" (fale i tablice i nalepnica), „potvrda o tehničkoj ispravnosti i registracioni list" (nema ni same dozvole). Tačan odgovor nabraja sva tri dokumenta, a „potvrda o tehničkoj ispravnosti" i „registracioni list" u tom spisku uopšte ne postoje.</p>
<!-- izvor: #8435, #8443 -->
<p><b>Isključeno vozilo</b> ne sme u saobraćaj — ni na kratkom delu puta, ni kad nikoga ne ometa. <b>Vozilo na lizingu ili u zakupu</b> smeš da voziš tek kad je podatak o korišćenju upisan u saobraćajnu dozvolu, ne odmah po zaključenju ugovora.</p>
<!-- izvor: #8433, #8434 (prvi red) · #8437, #8438 (drugi red) · #10707 (treći red) -->
<table>
<tr><th>Situacija</th><th>Kod sebe i na uvid</th><th>Ne zamenjuje ga</th></tr>
<tr><td>vožnja sa registarskim tablicama</td><td><b>saobraćajna dozvola</b></td><td>polisa osiguranja · važeća nalepnica</td></tr>
<tr><td>vožnja sa tablicama za privremeno označavanje</td><td><b>potvrda o korišćenju tih tablica</b></td><td>polisa osiguranja · potvrda o tehničkoj ispravnosti · dokaz o vlasništvu</td></tr>
<tr><td>dolazak na redovni ili vanredni pregled</td><td><b>saobraćajna dozvola + tvoja lična karta</b></td><td>vozačka dozvola · lična karta vlasnika</td></tr>
</table>
<!-- izvor: #8434, #8438 -->
<p class="mut">Pamtilica: na kontroli je odgovor uvek „Da" — i saobraćajna dozvola i potvrda o korišćenju privremenih tablica daju se na uvid, nijedan drugi papir ih ne menja.</p>
</div>
</div>
<div class="kSek" data-sub="126,127">
<div class="kPodH"><b class="kPodNaslov">Godina registracije — vremenska osa</b>
<!-- izvor: #10688 (30 dana) · #10687 (pregled pre izdavanja nalepnice) · #8428, #8429 (1 godina) · #8425 (po isteku ne sme) -->
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 300 304" style="width:100%;max-width:340px" role="img" aria-label="uspravna vremenska osa u razmeri: prozor od 30 dana pre podnosenja zahteva, zatim zahtev i izdavanje nalepnice, pa godina dana vazenja nalepnice, i istek posle koga vozilo ne sme na put">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="24" y="44" width="16" height="18" stroke-dasharray="3 3"/>
<rect x="24" y="62" width="16" height="216" rx="3"/>
</g>
<g fill="none" stroke="currentColor" stroke-width="1">
<path d="M40 53 H48 V32 H54"/>
<path d="M40 62 H48 V72 H54"/>
<path d="M40 170 H54"/>
</g>
<line x1="16" y1="280" x2="54" y2="280" stroke="#c0392b" stroke-width="3"/>
<g fill="currentColor">
<text x="58" y="28" font-size="12">PREGLED</text>
<text x="58" y="45" font-size="11">najranije 30 dana pre zahteva</text>
<text x="58" y="68" font-size="12">ZAHTEV</text>
<text x="58" y="85" font-size="11">izdavanje registracione nalepnice</text>
<text x="58" y="166" font-size="12">NALEPNICA VAŽI</text>
<text x="58" y="187" font-size="14">1 GODINU</text>
</g>
<g fill="#c0392b">
<text x="58" y="276" font-size="12">ISTEK</text>
<text x="58" y="296" font-size="13">NE SME NA PUT</text>
</g>
<g fill="none" stroke="#c0392b" stroke-width="2.2" stroke-linecap="round">
<circle cx="185" cy="291" r="9"/>
<line x1="179" y1="285" x2="191" y2="297"/>
</g>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">osa je u razmeri: prozor od 30 dana je dvanaest puta kraći od godine važenja</p>
<!-- izvor: #10688, #10687, #8428, #8429 -->
<p><b>Redosled:</b> redovni godišnji tehnički pregled → zahtev za upis u jedinstveni registar, odnosno za izdavanje registracione nalepnice → nalepnica važi <b>godinu dana</b>. Pregled se sme obaviti <b>najranije 30 dana pre podnošenja zahteva</b>, a vozilo mu se podvrgava <b>pre</b> upisa u registar odnosno izdavanja nalepnice — ne „najkasnije godinu dana od prethodnog pregleda" i ne „svake dve godine".</p>
<!-- izvor: #8425 -->
<p><b>Kad nalepnica istekne:</b> vozilo <b>ne sme</b> da učestvuje u saobraćaju — nema odlaganja ni od 5 ni od 15 dana.</p>
<!-- izvor: #8436, #8427, #8439 -->
<p><b>Jedini izlaz</b> je odlazak <b>na tehnički pregled, opravku ili ispitivanje</b>, i to samo ako je vozilo označeno <b>tablicama za privremeno označavanje</b> i ako mu je izdata <b>potvrda o njihovom korišćenju</b>. Tablice i potvrda izdaju se sa rokom važenja <b>najduže 15 dana</b>, a dužan si da se krećeš <b>relacijom i u vreme označeno u potvrdi</b> — ne po celoj Srbiji ni slobodno po području organa koji ih je izdao.</p>
<!-- izvor: #8444 (ODMAH) · #8427 (najduže 15 dana) · #8441, #8442 (u roku od 15 dana) · #10688 (30 dana) · #8428, #8429 (1 godina) -->
<table>
<tr><th>Rok</th><th>Na šta se odnosi</th></tr>
<tr><td><b>ODMAH</b></td><td>gubitak ili nestanak registarske tablice, odnosno registracione nalepnice → obaveštavaš <b>najbližu</b> organizacionu jedinicu MUP-a (ne onu koja ih je izdala, i ne „u roku od 7 dana")</td></tr>
<tr><td><b>najduže 15 dana</b></td><td>rok važenja tablica za privremeno označavanje i potvrde o njihovom korišćenju</td></tr>
<tr><td><b>u roku od 15 dana</b></td><td>odjava uništenog ili otpisanog vozila · prijava promene bilo kog podatka koji se upisuje u saobraćajnu dozvolu</td></tr>
<tr><td><b>najranije 30 dana</b></td><td>toliko pre podnošenja zahteva sme se obaviti redovni godišnji pregled</td></tr>
<tr><td><b>1 godina</b></td><td>rok važenja registracione nalepnice</td></tr>
</table>
<!-- izvor: #8441, #8442, #8444, #10688, #8436 -->
<p class="mut">Pamtilica: administrativne obaveze su <b>15 dana</b> (odjava, prijava promene), a gubitak tablice ili nalepnice nema rok — <b>ODMAH</b>, i to <b>najbližoj</b> jedinici MUP-a. „7 dana" nije tačan odgovor ni u jednom od ovih pitanja, a „30 dana" je tačno samo za pregled pre zahteva. Za vožnju posle isteka ne postoji nikakva „posebna dozvola nadležnog organa".</p>
</div>
</div>
<div class="kSek" data-sub="127">
<div class="kPodH"><b class="kPodNaslov">Put nazad u saobraćaj</b>
<!-- izvor: #8461 (prva dva reda) · #8449 (treći red) -->
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 300 248" style="width:100%;max-width:340px" role="img" aria-label="sema: vozilo kome su u saobracajnoj nezgodi osteceni vitalni sklopovi i uredjaji, ili vozilo iskljuceno zbog neispravnosti utvrdjene na kontrolnom pregledu, ide na vanredni pregled pa tek onda sme na put">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="4" y="6" width="292" height="58" rx="4"/>
<rect x="4" y="84" width="292" height="42" rx="4"/>
<rect x="40" y="154" width="220" height="32" rx="4"/>
<line x1="150" y1="126" x2="150" y2="140"/>
<line x1="150" y1="186" x2="150" y2="198"/>
</g>
<polygon points="144,140 156,140 150,150" fill="currentColor"/>
<polygon points="144,198 156,198 150,208" fill="currentColor"/>
<g fill="currentColor" text-anchor="middle">
<text x="150" y="24" font-size="11">u saobraćajnoj nezgodi oštećeni</text>
<text x="150" y="41" font-size="12">VITALNI SKLOPOVI I UREĐAJI</text>
<text x="150" y="57" font-size="11">ili vozilo nije bilo u voznom stanju</text>
<text x="150" y="78" font-size="11">ILI</text>
<text x="150" y="102" font-size="11">isključeno zbog neispravnosti sa</text>
<text x="150" y="118" font-size="12">KONTROLNOG PREGLEDA</text>
<text x="150" y="175" font-size="13">VANREDNI PREGLED</text>
</g>
<rect x="64" y="212" width="172" height="32" rx="4" fill="none" stroke="#1f7a3f" stroke-width="1.8"/>
<polyline points="82,228 89,235 102,220" fill="none" stroke="#1f7a3f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<text x="172" y="233" font-size="13" text-anchor="middle" fill="#1f7a3f">NA PUT</text>
</svg>
</div>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 300 176" style="width:100%;max-width:340px" role="img" aria-label="sema: prepravljeno vozilo ide na ispitivanje kojim se utvrdjuje da ispunjava propisane uslove, pa tek onda sme na put">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="30" y="6" width="240" height="32" rx="4"/>
<rect x="16" y="70" width="268" height="46" rx="4"/>
<line x1="150" y1="38" x2="150" y2="52"/>
<line x1="150" y1="116" x2="150" y2="128"/>
</g>
<polygon points="144,52 156,52 150,62" fill="currentColor"/>
<polygon points="144,128 156,128 150,138" fill="currentColor"/>
<g fill="currentColor" text-anchor="middle">
<text x="150" y="27" font-size="13">PREPRAVLJENO VOZILO</text>
<text x="150" y="92" font-size="13">ISPITIVANJE</text>
<text x="150" y="108" font-size="11">utvrđuje se da ispunjava uslove</text>
</g>
<rect x="64" y="142" width="172" height="32" rx="4" fill="none" stroke="#1f7a3f" stroke-width="1.8"/>
<polyline points="82,158 89,165 102,150" fill="none" stroke="#1f7a3f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<text x="172" y="163" font-size="13" text-anchor="middle" fill="#1f7a3f">NA PUT</text>
</svg>
</div>
<!-- izvor: #8461 -->
<p><b>Vanredni pregled</b> traži se u dva slučaja, oba <b>pre puštanja u saobraćaj</b>: kad su u saobraćajnoj nezgodi ili na drugi način oštećeni vitalni sklopovi i uređaji bitni za bezbedno učestvovanje u saobraćaju, odnosno kad vozilo nakon toga nije bilo u voznom stanju; i kad je vozilo isključeno iz saobraćaja zbog tehničke neispravnosti utvrđene na kontrolnom pregledu.</p>
<!-- izvor: #8449 -->
<p><b>Prepravljeno vozilo</b> ne rešava tehnički pregled — traži se <b>ispitivanje</b> i utvrđivanje da ispunjava propisane uslove, pa tek onda sme u saobraćaj. Nikako „odmah nakon izvršene prepravke".</p>
<!-- izvor: #8446, #8461 -->
<p class="mut">Pamtilica: na <b>kontrolni</b> pregled ide samo vozilo <b>u voznom stanju</b>; vozilo kojem su u nezgodi oštećeni sklopovi ide na <b>vanredni</b> — to je par koji se najčešće zamenjuje.</p>
</div>
<div class="kPodH"><b class="kPodNaslov">Ispravnost i identitet vozila</b>
<!-- izvor: #8448 -->
<table>
<tr><th>Tehnički ispravno je vozilo koje (oba uslova)</th><th>NIJE dokaz ispravnosti</th></tr>
<tr><td>zadovoljava sve tehničke normative <b>i</b> ima ispravne sve propisane uređaje i opremu</td><td>„u voznom stanju, bez vidljivih oštećenja" · „redovni pregled obavljen u propisanom roku"</td></tr>
</table>
<!-- izvor: #8450 -->
<p><b>Tehnički pregled utvrđuje dvoje:</b> da je vozilo tehnički ispravno <b>i</b> da ispunjava tehničke propise i uslove za učešće u saobraćaju — ne homologaciju i ne usklađenost sa smernicama proizvođača.</p>
<!-- izvor: #8447 -->
<p><b>Gde važi:</b> tehnički uslovi i ispravnost traže se <b>kada vozilo učestvuje u saobraćaju na putu</b> — na svakom putu, ne „samo na javnom putu" ni „samo na putu sa savremenim kolovoznim zastorom".</p>
<!-- izvor: #8451 -->
<p><b>Identitet:</b> vozilo jednoznačno određuje <b>identifikaciona oznaka koju određuje proizvođač</b>. Ne oznaka „i broj motora" (motor je zamenljiv deo), ni registraciona nalepnica (menja se pri svakoj registraciji).</p>
</div>
</div>
`,
};

CARDS['razno-pravila'] = {
  title: 'Nasilnička vožnja, vučenje i ostala pravila',
  html: `
<div class="kSek" data-sub="138">
<p><b>Nasilnička vožnja (čl. 41):</b> 2+ prolaska kroz crveno u 10 minuta · preticanje kolone preko neisprekidane linije · vožnja u naselju 90+ km/h preko ograničenja · gruba nepažnja prema drugima.</p>
</div>
<div class="kSek" data-sub="141">
<p><b>Vučenje vozila:</b> užetom (≥3 m), krutom vezom (rudom) ili oslanjanjem/podizanjem; noću i pri smanjenoj vidljivosti vučeno vozilo mora biti osvetljeno; brzina ograničena (40 km/h).</p>
</div>
<div class="kSek" data-sub="149">
<p><b>Žuto rotaciono svetlo (čl. 111):</b> radovi na putu, vozila pomoći na putu, vanredni prevoz, traktor/radna mašina noću.</p>
</div>
<div class="kSek" data-sub="165">
<p><b>Prepreke na putu (čl. 112 i Pravilnik):</b> obeležavaju se propisanim znakovima/svetlima — noću crveno svetlo.</p>
</div>
<p><b>Osnovna načela:</b> poverenje u druge učesnike + tvoja obaveza da ne ugrožavaš i ometaš druge — svaki učesnik odgovara za svoje postupke.</p>

<div class="kSek" data-sub="143">
<p style="margin-top:18px"><b>TRAMVAJ I ŽIVOTINJE (čl. 84 i 87)</b></p>
<p><b>Tramvaj nije izvan zakona.</b> Odredbe ZOBS-a <b>shodno se primenjuju</b> i na saobraćaj tramvaja i drugih vozila koja se po putu kreću po šinama — <b>osim ako to ne isključuju konstrukcione osobine tih vozila ili način njihovog kretanja</b>. Ponuđene zamke su „ne primenjuju se" i „ne primenjuju se, osim odredaba o ograničenju brzine" — obe su netačne. Nije stvar u brzini: tramvaj jednostavno ne može da uradi sve što zakon traži od ostalih vozila (ne može da siđe sa šina, ne može da obiđe prepreku), pa zakon unapred priznaje samo taj tip izuzetka.</p>
<p><b>Vođenje životinje iz vozila ili sa vozila je ZABRANJENO</b> — bez ijednog izuzetka. Domaće životinje smeju biti na putu samo u pratnji lica koje ih vodi i obezbeđuje tako da ne ugrožavaju bezbednost saobraćaja, a na autoput, motoput, državne puteve prvog reda i biciklističke staze im pristup uopšte nije dozvoljen.</p>
<p class="mut">Zamke su „dozvoljeno je" i, opasnija, <b>„dozvoljeno je samo ako se vozilo kreće brzinom kretanja pešaka"</b> — ta formulacija je pozajmljena iz pravila o pešačkoj zoni i ovde ne postoji. Slikovno pitanje pokazuje vozača mopeda koji jednom rukom drži upravljač, a drugom povodac psa koji trči pored njega: nije dozvoljeno, ma koliko sporo išao. Ako se životinja <b>prevozi</b> u vozilu, to jeste dozvoljeno, ali samo tako da ne ugrožava i ne ometa vozača ni ostale učesnike.</p>

</div>
<div class="kSek" data-sub="165">
<p style="margin-top:18px"><b>RADOVI NA PUTU — RADNIK SA ZASTAVICOM (čl. 155 i 166)</b></p>
<p>Tamo gde se izvode radovi i gde je nastala prepreka koja se ne može odmah ukloniti, saobraćaj mogu da regulišu <b>najmanje DVA radnika</b> određena od strane izvođača radova, odnosno upravljača puta. Ne jedan — dva, jer se propušta naizmenično iz dva smera.</p>
<table>
<tr><th>Znak</th><th>Značenje za tvoj smer</th></tr>
<tr><td><b>Podignuta CRVENA zastavica</b></td><td>Prolaz <b>zabranjen</b></td></tr>
<tr><td><b>Podignuta ZELENA zastavica</b></td><td>Prolaz <b>slobodan</b></td></tr>
</table>
<p class="mut">Pamti da je <b>svaka</b> poruka nošena <b>podignutom</b> zastavicom — nema „spuštena crvena znači slobodno". Zato su netačni svi odgovori tipa „regulisanje se vrši samo zastavicom crvene boje, podignuta zabranjuje a spuštena dozvoljava" i isto to sa zelenom. Na slikama radnik uvek drži <b>obe</b> zastavice: ona koju je podigao je poruka, ona koja mu visi niz nogu ne znači ništa.</p>
<p><b>Znak radnika je OBAVEZUJUĆI za tebe.</b> Znaci i naredbe ovlašćenih lica <b>imaju prvenstvo u odnosu na saobraćajnu signalizaciju i propisana pravila saobraćaja</b>. U dva slikovna pitanja tačni odgovori zato glase „slobodan prolaz <b>i obavezujući je za Vas</b>" i „zabranjen prolaz <b>i obavezujući je za Vas</b>", a zamke su upravo one koje ti nude izgovor: „nije obavezujući za Vas" i „nije obavezujući ako prohodna saobraćajna traka nije zauzeta vozilima iz suprotnog smera". Prazna traka ispred tebe nije dozvola.</p>
<p><b>Dve dužnosti kod radova (pitanje traži DVA odgovora):</b> ne smeš da <b>ometaš radnika</b> koji obavlja radove na putu ili pored puta, i <b>dužan si da ukloniš svoje vozilo na zahtev izvođača radova</b> — a taj zahtev može biti dat i kao javni poziv. Zamka je „moram ukloniti vozilo samo na zahtev saobraćajne policije": izvođač radova je ovde dovoljan.</p>
<p><b>Signalna tabla</b> (tabla sa treptavim strelicama, obično na prikolici) postavlja se <b>na zadnji deo motornog vozila ili prikolice, kada je vozilo zaustavljeno</b>. Zamke se lako razdvajaju po nameni: „razdvajajuća ograda" skreće saobraćaj u stranu, a „čeoni branik" ograđuje radilište sa čeone strane — ni jedno ni drugo se ne kači na vozilo.</p>

</div>
<div class="kSek" data-sub="138">
<p style="margin-top:18px"><b>NASILNIČKA VOŽNJA — DOPUNA (čl. 41)</b></p>
<p>Uz ono gore, zakon nabraja i <b>brzinu van naselja</b> i <b>alkohol</b>, a to su dva mesta gde su ponuđeni odgovori namerno bliski:</p>
<table>
<tr><th>Slučaj</th><th>Granica koja se traži</th><th>Ponuđene zamke</th></tr>
<tr><td>Brzina <b>u naselju</b></td><td>za više od <b>90 km/h</b> veća od dozvoljene</td><td>70, 80</td></tr>
<tr><td>Brzina <b>van naselja</b></td><td>za više od <b>100 km/h</b> veća od dozvoljene</td><td>80, 90</td></tr>
<tr><td><b>Alkohol</b> — potpuna alkoholisanost</td><td>više od <b>2,00 mg/ml</b></td><td>„veoma teška" (više od 1,60 do 2,00) i „teška" (više od 1,20 do 1,60)</td></tr>
</table>
<p class="mut">Merdevine za pamćenje: <b>90 u naselju, 100 van naselja</b> — veći broj ide tamo gde je i osnovno ograničenje veće. Kod alkohola pamti samo <b>najviši</b> stepen: teška i veoma teška alkoholisanost jesu teški prekršaji, ali <b>nisu</b> nasilnička vožnja; nasilnička je tek <b>potpuna</b>.</p>
<p><b>Kako to izgleda na slici.</b> Dva slikovna pitanja gađaju isti ishod iz dva različita ugla. U prvom sa mopeda vidiš vozilo koje ti <b>dolazi u susret tvojom saobraćajnom trakom</b> jer pretiče kolonu preko neisprekidane linije. U drugom nema ni kolone ni preticanja: put je <b>fizički razdvojen ostrvom</b>, na ostrvu stoji znak obaveznog smera okrenut ka tebi, a ti se krećeš <b>suprotnim smerom</b>. U oba slučaja tačan odgovor je isti i doslovno glasi „nepropisno postupanje koje je <b>u gruboj suprotnosti sa pravilima saobraćaja (nasilnička vožnja)</b>".</p>
<p class="mut">Zamka glasi: „nepropisno postupanje, <b>koje nije</b> u gruboj suprotnosti sa pravilima saobraćaja" (kod pitanja o preticanju kolone nastavlja se i sa „s obzirom da preticanje može izvesti bez ugrožavanja drugih učesnika u saobraćaju". Procena da „stiže da se vrati" ne skida kvalifikaciju — puna linija je tu upravo zato što se preglednost na tom mestu ne može proceniti.</p>

</div>
<div class="kSek" data-sub="141">
<p style="margin-top:18px"><b>VUČENJE — DOPUNA (čl. 71, 72 i 73)</b></p>
<p><b>Šta se uopšte NE SME vući.</b> Motorno vozilo ne sme da vuče <b>moped, motocikl, laki tricikl ni teški tricikl</b> — dakle jednotračna vozila i tricikle. Sme da vuče putničko vozilo, laki i teški četvorocikl i teretno vozilo. Pitanje traži <b>tri</b> odgovora.</p>
<p class="mut">Ovo pravilo samo rešava i slikovno pitanje o propisnom vučenju: vozilo broj 1 vuče <b>motocikl</b>, pa je nepropisno već po vrsti vučenog vozila, bez obzira na to čime ga vuče. Tačan odgovor je vozilo broj 2.</p>
<table>
<tr><th>Način vuče</th><th>Kada NE SME</th></tr>
<tr><td><b>Uže</b></td><td>Vučeno vozilo ima neispravan <b>uređaj za upravljanje</b> ili <b>uređaj za zaustavljanje</b>; užetom se, uz to, ne vuku teretno vozilo i autobus</td></tr>
<tr><td><b>Kruta veza (ruda)</b></td><td>Vučeno vozilo nema <b>ispravan uređaj za upravljanje</b>; ili mu je ukupna masa veća od ukupne mase vučnog vozila, a neispravna mu je radna kočnica</td></tr>
</table>
<p class="mut">Logika iza tabele: <b>uže</b> traži da vučeno vozilo ume i da skreće i da koči samo za sebe, jer ga ništa ne drži; <b>ruda</b> pomaže oko kočenja, ali upravljač i dalje mora da radi. Zato je ispravan upravljač uslov kod <b>oba</b> načina, a ispravne kočnice samo kod užeta. Vuče se, uz to, isključivo vozilo koje zbog neispravnosti ili nedostatka delova ne može samo da se kreće.</p>
<p><b>Obeležavanje:</b> sigurnosni trougao mora biti postavljen na <b>OBA</b> vozila — na vučnom sa <b>prednje</b> strane, na vučenom sa <b>zadnje</b>. Na vučnom vozilu moraju biti uključeni <b>svi pokazivači pravca</b>, a na vučenom ako su ispravni. Vučenim vozilom je zabranjen prevoz lica, osim vozača koji njime upravlja.</p>

</div>
<div class="kSek" data-sub="149">
<p style="margin-top:18px"><b>ŽUTO ROTACIONO SVETLO — ŠTA TI RADIŠ (čl. 111)</b></p>
<p>Kad se susretneš sa vozilom na kome je uključeno žuto rotaciono ili trepćuće svetlo, dužan si da <b>povećaš opreznost i prilagodiš brzinu i način kretanja</b> svog vozila — ne da obavezno staneš, niti da pomeriš vozilo sa kolovoza.</p>

</div>
`,
};

CARDS['kazne'] = {
  title: 'Kaznene mere — sistem (namerno bez cifara)',
  html: `
<p><b>⚠ Po izmerenom zvaničnom šablonu, ova oblast ne ulazi u ispitni test.</b> U bazi za učenje ipak postoji (111 pitanja) — pokrivena je, ali joj daj najniži prioritet i uči je radi razumevanja posledica.</p>
<p><b>Lestvica sankcija, od lakše ka težoj:</b></p>
<div class="ladderRow">
<span class="lchip" style="background:#2c6aa0">NOVČANA KAZNA</span><span class="lplus">+</span>
<span class="lchip" style="background:#e0a030;color:#3a2d12">KAZNENI POENI</span><span class="lplus">+</span>
<span class="lchip" style="background:#c0392b">ZABRANA UPRAVLJANJA</span><span class="lplus">+</span>
<span class="lchip" style="background:#5b21b6">ZATVOR</span>
</div>
<p>Teži prekršaj (i ponavljanje) nosi KOMBINACIJU mera — najteži nose i zatvor: visok stepen alkohola/psihoaktivne supstance, nasilnička vožnja, vožnja bez dozvole, izazivanje nezgode, ekstremna brzina u naselju.</p>
<p><b>Zašto ovde nema iznosa:</b> cifre se menjaju izmenama zakona. Kad pitanje traži konkretan iznos — nauči ga IZ TAČNOG ODGOVORA tog pitanja (baza je zvanična i merodavna); kartica ti daje sistem, ne brojke.</p>`,
};

// FAQ — prikazuje se na početnoj, ne u Pojmovniku
CARDS['faq'] = {
  title: 'Česta pitanja',
  html: `
<p><b>Gde se čuva moj napredak?</b><br>
Napredak se čuva u pregledaču, uz njegov profil i adresu aplikacije. Drugi pregledač, privatna kartica, druga adresa ili otvaranje fajla mogu imati odvojeno skladište. Ako ga ne vidiš, proveri gde si ranije vežbao. Za prenos koristi „Sačuvaj napredak”, pa „Učitaj napredak”.</p>
<p><b>Da li restart računara briše napredak?</b><br>
Uobičajen restart ne briše trajno sačuvan napredak. On ipak može nestati brisanjem podataka sajta ili profila, završetkom privatne sesije ili greškom skladišta. Izvezi kopiju preko „Sačuvaj napredak”. Ako povežeš fajl za automatsko čuvanje, proveri da li status potvrđuje završen upis; zatvaranje stranice ga ne garantuje.</p>
<p><b>Zašto simulacija izgleda "siromašnije" od učenja?</b><br>
Namerno je jednostavnija: tokom pokušaja nema objašnjenja ni pomoći, a tema je svetla. Raspored tema i poena prati šest posmatranih zvaničnih izvlačenja, što ne garantuje sastav svakog budućeg ispita. Objašnjenja su dostupna u učenju i pregledu posle predaje.</p>
<p><b>Kako radi Ponavljanje?</b><br>
Razmaknuto ponavljanje: pogrešiš → pitanje je odmah na redu; pogodiš ga → vraća se sutra; opet pogodiš →
za 3 dana; treći pogodak zaredom → utvrđeno je i izlazi iz reda. I pitanje koje si pogodio iz prve vraća se
jednom, za 3 dana, da se potvrdi — pa izlazi. Tačan odgovor PRE roka je vežbanje i ne pomera raspored;
pogrešan važi uvek. U dnevni cilj isto pitanje ulazi najviše jednom dnevno.</p>
<p><b>Šta je broj #1234 pored pitanja?</b><br>
To je identifikator pitanja u uvezenoj bazi. Koristi ga kada porediš isto pitanje ili prijavljuješ grešku.</p>
<p><b>Zašto odgovori počinju malim slovom, a "km/h" je latinicom i u ćirilici?</b><br>
Zadržavamo zapis iz uvezene baze: mnogi odgovori nastavljaju rečenicu pitanja, a oznaka km/h ostaje ista u oba pisma. Time ne menjamo sadržaj zvaničnih pitanja i odgovora.</p>
<p><b>Da li su objašnjenja zvanična?</b><br>
Ne. Dodata su za učenje i revizija njihove tačnosti traje. Pitanja i oznake tačnih odgovora preuzeti su iz zvanične baze.</p>`,
};

const X = {};
X[10574] = { x: 'Na semaforizovanoj raskrsnici prvenstvo prolaza određuje SEMAFOR — po hijerarhiji iz ZOBS čl. 20 od semafora su jače samo naredbe ovlašćenog lica (saobraćajca). Obaveza da propustiš vozilo pod pratnjom (čl. 107) nastaje kada te ono susretne ili sustigne na putu i ne menja odgovor na pitanje ČIME je regulisano prvenstvo na ovoj raskrsnici. Zapamti: rotacija ne gasi semafor.', card: 'prvenstvo-prolaza' };
X[10363] = { x: 'Isti princip kao kod vozila pod pratnjom: na semaforizovanoj raskrsnici prvenstvo je regulisano SEMAFOROM (hijerarhija iz ZOBS čl. 20 — jači od semafora je samo saobraćajac). Policijsko vozilo sa plavim svetlom je „vozilo sa pravom prvenstva" (čl. 108) i propuštaš ga kad te susretne na putu (čl. 109), ali pitanje traži čime je prvenstvo regulisano — semaforom.', card: 'prvenstvo-prolaza' };
X[8062] = { x: 'Na kontrolni zdravstveni pregled upućuje se vozač za koga se POSUMNJA da zbog psihofizičkih smetnji ili nedostataka nije u stanju da bezbedno upravlja vozilom (ZOBS čl. 191). Sama saobraćajna nezgoda ili broj prekršaja nisu zakonski osnov — presudna je sumnja u psihofizičku sposobnost.' };
X[8063] = { x: 'Ako se vozač u određenom roku ne podvrgne kontrolnom zdravstvenom pregledu, nadležni organ mu ODUZIMA vozačku dozvolu (ZOBS čl. 192). Dok se sumnja u sposobnost ne otkloni pregledom, gubi se pravo na upravljanje — zakon ne predviđa ni privremenu zabranu ni prekršajni postupak, nego baš oduzimanje dozvole.' };
X[8064] = { x: 'Zabrana je apsolutna: ko zbog umora, bolesti ili psihičkog stanja nije sposoban da bezbedno upravlja — NE SME da upravlja vozilom (ZOBS čl. 187 st. 1). Nema izuzetaka tipa "kratka deonica" ili "ako ne ugrožava druge"; takvi ublaženi odgovori su tipična zamka u testu.' };
X[8065] = { x: 'I za alkohol i psihoaktivne supstance zabrana je apsolutna (ZOBS čl. 187 st. 2): pod njihovim dejstvom ne sme se ni početi upravljanje vozilom. Uslovi poput "kratak deo puta", "samo javni put" ili "ako ne ugrožava druge" ne postoje u zakonu.' };
X[8074] = { x: 'Za vozače kategorija AM, A1, A2 i A važi NULTA tolerancija — ne smeju imati alkohola u organizmu (ZOBS čl. 187 st. 4 t. 4). Opšta granica od 0,20 mg/ml važi za obične vozače (npr. B kategorija), ali motociklisti su na listi izuzetaka, zajedno sa profesionalcima, instruktorima i kandidatima.' };
X[8075] = { x: 'Kandidat za vozača tokom praktične obuke i polaganja praktičnog ispita ne sme imati alkohola u organizmu (ZOBS čl. 187 st. 4 t. 6) — nulta tolerancija, ista kao za vozače A kategorija i vozače sa probnom dozvolom.' };
X[8077] = { x: 'Da li je vozač previše umoran ili bolestan da bezbedno vozi utvrđuje se STRUČNIM PREGLEDOM (ZOBS čl. 187) — dakle pregledom kod stručnog lica. Policajac neposrednim uvidom to ne utvrđuje, a aparati mere alkohol, ne umor.' };
X[8082] = { x: 'Lista nulte tolerancije (ZOBS čl. 187 st. 4) obuhvata, između ostalih: vozače kategorija AM/A1/A2/A (dakle i motocikl i moped) i kandidate tokom praktične obuke. Zamka: na listi je vozač sa probnom vozačkom DOZVOLOM, a ne vozač koji obavlja "probnu VOŽNJU" (isprobavanje vozila); motokultivator takođe nije na listi.' };
X[8624] = { x: 'Teret mora biti smešten i obezbeđen tako da NE umanjuje stabilnost i NE otežava upravljanje vozilom (ZOBS čl. 112) — bez izuzetaka. Odgovor sa "posebnom dozvolom i žutim svetlom" odnosi se na vanredni prevoz (prekoračenje gabarita/mase), ali ni tada teret ne sme da ugrožava stabilnost.' };
X[8638] = { x: 'Teret koji na teretnom ili priključnom vozilu prelazi najudaljeniju tačku na zadnjoj strani vozila označava se PROPISANOM TABLOM — kvadratnom, sa naizmeničnim kosim crveno-belim odsevnim prugama (ZOBS čl. 112). Kod ostalih vozila teret se označava crvenom tkaninom, a u uslovima smanjene vidljivosti crvenim svetlom ili odsevnom materijom.' };
X[8652] = { x: 'Sme se prevoziti tačno onoliko lica koliko je UPISANO U SAOBRAĆAJNOJ DOZVOLI, na mestima koja su za to predviđena (ZOBS čl. 116). Broj sedišta ili "koliko može da stane" nisu merilo — merodavan je isključivo upis u dozvoli.' };
const deca = 'Dete mlađe od 12 godina ne sme se prevoziti na mopedu, triciklu, motociklu ni četvorociklu (ZOBS čl. 118). Pravilo je jedno, a u bazi se pojavljuje kao više odvojenih pitanja za svako vozilo — zapamti samo granicu: 12 godina.';
X[8667] = { x: deca, card: 'kategorije-vozila' };
X[8668] = { x: deca, card: 'kategorije-vozila' };
X[8669] = { x: deca, card: 'kategorije-vozila' };
// pojmovnik uz pitanja o definicijama vozila (Značenje izraza)
for (const id of [8005, 8006, 8007, 8011, 10406]) X[id] = { card: 'kategorije-vozila' };

// kartice zakačene na CELE podoblasti (prikazuju se uz svako pitanje te podoblasti)
// --- znakovi-opasnosti (Tura 2 revizije pojmovnika; revizija bez primedbi) ---
CARDS['znakovi-opasnosti'] = {
  title: 'Znakovi opasnosti (trougao = najava, ne naredba)',
  html: `
<p><b>Ključ za slikovna pitanja:</b> znak opasnosti UPOZORAVA unapred, pa je tačan odgovor uvek NAJAVA — počinje sa <b>„nailazak na...", „približavanje...", „blizina...", „udaljenost...", „mesto od koga počinje..."</b>. Ako ponuđeni odgovor zvuči kao naredba („moraju se kretati", „zabranjeno je") ili kao opis izgrađenog objekta („posebno izgrađena staza", „mesto na kome se nalazi...") — to je zamka iz druge porodice znakova.</p>
<p><b>Oblik i boja:</b> jednakostranični trougao sa vrhom naviše, bela osnova, crveni okvir, crni simboli (Pravilnik čl. 19 i 20). Samo tri znaka opasnosti NISU trougao nego pravougaonik: <b>Andrejin krst</b> (jednostruki i dvostruki) i <b>kosnici</b>. Jedini trougao sa <b>ŽUTOM</b> osnovom je „radovi na putu".</p>

<div class="kPodH"><b class="kPodNaslov">Postavljanje — brojke koje se pitaju</b>
<table>
<tr><th>Gde je znak postavljen</th><th>Pravilo</th></tr>
<tr><td>Po pravilu</td><td>na udaljenosti od <b>150 m do 250 m</b> ispred opasnog mesta</td></tr>
<tr><td>U naselju, bliže od 150 m</td><td>sme — <b>NE MORA</b> imati dopunsku tablu</td></tr>
<tr><td>Van naselja, bliže od 150 m ILI dalje od 250 m</td><td><b>MORA</b> imati dopunsku tablu kojom se označava udaljenost do opasnog mesta</td></tr>
</table>
<p class="mut">Pamtilica: van naselja svako odstupanje od 150-250 traži tablu; u naselju sme bliže i bez table.</p>

</div>
<div class="kPodH"><b class="kPodNaslov">Pruga — pet znakova, jedan sistem</b>
<table>
<tr><th>Znak — slika i opis</th><th>Znači</th><th>Zamka — NIJE</th></tr>
<tr><td class="znCel">${zn(10825)}<span class="znOpis">Trougao + <b>OGRADA</b></span></td><td>ukrštanje sa železničkom prugom <b>SA branicima</b> ili polubranicima</td><td>prelaz bez branika; tramvajska pruga</td></tr>
<tr><td class="znCel">${zn(10830)}<span class="znOpis">Trougao + <b>LOKOMOTIVA</b></span></td><td>ukrštanje sa železničkom prugom <b>BEZ branika</b> i polubranika</td><td>prelaz sa branicima</td></tr>
<tr><td class="znCel">${zn(10829)}<span class="znOpis">Trougao + <b>TRAMVAJ</b></span></td><td>ukrštanje puta sa <b>tramvajskom</b> prugom u nivou</td><td>„tramvajska stanica"; železnička pruga</td></tr>
<tr><td class="znCel">${zn(10840)}<span class="znOpis"><b>JEDAN</b> Andrejin krst</span></td><td>pruga sa <b>jednim kolosekom</b></td><td>dva ili više koloseka</td></tr>
<tr><td class="znCel">${zn(10831)}<span class="znOpis"><b>DVOSTRUKI</b> Andrejin krst</span></td><td>pruga sa <b>dva ili više koloseka</b></td><td>jedan kolosek; „prelaz bez branika"</td></tr>
<tr><td class="znCel">${zn(10832)}<span class="znOpis">Kosnik (kose crvene crte)</span></td><td><b>udaljenost</b> do ukrštanja puta i pruge: <b>3 crte = 240 m, 2 crte = 160 m, 1 crta = 80 m</b></td><td>ponuđenih „280 m" ne postoji — računaj 80 × broj crta</td></tr>
</table>
<p class="mut">Iznad kosnika sa tri crte stoji trougao sa ogradom ili lokomotivom (Pravilnik čl. 23) — po NJEMU na pitanju „240 m" znaš da li je prelaz sa branicima ili bez njih.</p>

</div>
<div class="kPodH"><b class="kPodNaslov">Raskrsnice — prati debljinu crta</b>
<p>Debela uspravna crta = TVOJ put (sa prvenstvom prolaza), tanka crta = sporedni put. Gledaj <b>sa koje strane</b> tanka crta dolazi (leve/desne) i <b>pod kojim uglom</b> (pravi, oštri, tupi) — simbol odgovara stvarnoj situaciji na putu.</p>
<table>
<tr><th>Znak — slika i opis</th><th>Znači</th></tr>
<tr><td class="znCel">${zn(10817)}<span class="znOpis">Krst — <b>sve crte iste debljine</b></span></td><td>blizina raskrsnice puteva od kojih <b>nijedan</b> nije put sa prvenstvom prolaza</td></tr>
<tr><td class="znCel">${zn(10818)}<span class="znOpis">Tanka crta <b>preseca</b> debelu skroz</span></td><td>put sa prvenstvom se <b>UKRŠTA</b> sa sporednim putem</td></tr>
<tr><td class="znCel">${zn(10819)}<span class="znOpis">Tanka crta se <b>uliva</b> u debelu</span></td><td>sporedni put se <b>SPAJA</b> — pod pravim / oštrim / tupim uglom, sa leve ili desne strane</td></tr>
</table>
<p class="mut">Zamke su uvek iste: „iste važnosti" i „ukršta se" — prvo prebroj debljine, pa proveri da li tanka crta prolazi skroz ili se samo uliva.</p>

</div>
<div class="kPodH"><b class="kPodNaslov">Parovi-zamke: put i teren</b>
<table>
<tr><th>Znak — slika i opis</th><th>Znači</th><th>Zamka — NIJE</th></tr>
<tr><td class="znCel">${zn(10783)}<span class="znOpis">Savijena strelica</span></td><td>opasna KRIVINA <b>nalevo / nadesno</b> — kako strelica pokazuje</td><td>„smer kojim se vozila moraju kretati" (plavi krug) ni „jednosmerni put"</td></tr>
<tr><td class="znCel">${zn(10785)}<span class="znOpis">Dvostruko izlomljena strelica</span></td><td>više <b>uzastopnih krivina</b> — odgovor po PRVOJ (nalevo/nadesno)</td><td>obična krivina</td></tr>
<tr><td class="znCel">${zn(10787)}<span class="znOpis">Kosina sa procentom</span></td><td>opasna <b>NIZBRDICA</b> ili opasan <b>USPON</b> (procenat = nagib puta)</td><td>„tehnička sredstva za usporavanje saobraćaja"</td></tr>
<tr><td class="znCel">${zn(10789)}<span class="znOpis">Ivice puta se skupljaju</span></td><td><b>SUŽENJE</b> kolovoza: obostrano / samo sa leve / samo sa desne strane</td><td>„radovi na putu" ni „naizmenično uključivanje vozila u jednu traku"</td></tr>
<tr><td class="znCel">${zn(10805)}<span class="znOpis">Čovek sa lopatom, <b>žuta osnova</b></span></td><td><b>RADOVI</b> na putu</td><td>suženje</td></tr>
<tr><td class="znCel">${zn(10797)}<span class="znOpis">Vozilo sa vijugavim tragovima</span></td><td>moguća pojava <b>KLIZAVOG</b> kolovoza</td><td>bankina ni obala</td></tr>
<tr><td class="znCel">${zn(10794)}<span class="znOpis">Jedna grba / jedno udubljenje / grba i udubljenje</span></td><td>neravan kolovoz: <b>IZBOČINA</b> / <b>ULEGNUĆE</b> / <b>„izbočine i ulegnuća"</b> — čitaj sliku doslovno</td><td>međusobno se nude kao zamke — biraj tačno ono što je nacrtano</td></tr>
<tr><td class="znCel">${zn(10798)}<span class="znOpis">Točak izbacuje kamenčiće</span></td><td>moguća pojava <b>PRŠTANJA</b> kamenja</td><td>odron ni bankina</td></tr>
<tr><td class="znCel">${zn(10799)}<span class="znOpis">Kamenje pada niz kosinu</span></td><td><b>ODRON</b> kamenja — kosina je na strani sa koje kamenje preti: <b>sa leve ili sa desne</b> strane puta</td><td>prštanje ni bankina</td></tr>
<tr><td class="znCel">${zn(10837)}<span class="znOpis">Vozilo propada uz ivicu kolovoza</span></td><td>opasna <b>BANKINA</b> uz kolovoz (simbol = strana puta)</td><td>odron ni prštanje</td></tr>
<tr><td class="znCel">${zn(10793)}<span class="znOpis">Vozilo pada u vodu</span></td><td>put vodi do <b>OBALE</b>, odnosno pruža se u njenoj blizini</td><td>klizav kolovoz ni pokretni most</td></tr>
<tr><td class="znCel">${zn(10792)}<span class="znOpis">Most se podiže</span></td><td>blizina <b>POKRETNOG MOSTA</b></td><td>obala</td></tr>
<tr><td class="znCel">${zn(10820)}<span class="znOpis">Portal u trouglu</span></td><td>nailazak na <b>TUNEL</b></td><td>nadvožnjak ni podvožnjak</td></tr>
</table>

</div>
<div class="kPodH"><b class="kPodNaslov">Parovi-zamke: ljudi, životinje, saobraćaj</b>
<table>
<tr><th>Znak — slika i opis</th><th>Znači</th><th>Zamka — NIJE</th></tr>
<tr><td class="znCel">${zn(10800)}<span class="znOpis">Pešak na zebri u <b>TROUGLU</b></span></td><td>NAILAZAK na mesto gde je <b>obeležen pešački prelaz</b></td><td>„mesto na kome se nalazi pešački prelaz" (to je plavi KVADRAT) ni pešačka staza</td></tr>
<tr><td class="znCel">${zn(10801)}<span class="znOpis">Deca u trku</span></td><td>deo puta gde se često kreću <b>DECA</b> (blizina škole, obdaništa, igrališta)</td><td>„mesto od kojeg počinje zona škole" (to je plava tabla)</td></tr>
<tr><td class="znCel">${zn(10838)}<span class="znOpis">Pešak koji hoda</span></td><td>deo puta kojim se <b>PEŠACI često kreću</b></td><td>pešačka staza ni obeležen prelaz</td></tr>
<tr><td class="znCel">${zn(10802)}<span class="znOpis">Biciklista</span></td><td><b>BICIKLISTI</b> se često kreću, odnosno prelaze put</td><td>biciklistička staza ni zabrana saobraćaja za bicikle</td></tr>
<tr><td class="znCel">${zn(10804)}<span class="znOpis">Jelen u skoku</span></td><td>opasnost zbog prelaska <b>DIVLJAČI</b></td><td>domaće životinje ni „staza za jahanje"</td></tr>
<tr><td class="znCel">${zn(10826)}<span class="znOpis">Krava</span></td><td><b>DOMAĆE životinje pod nadzorom</b> prelaze preko puta, odnosno kreću se duž puta</td><td>divljač ni „staza za jahanje"</td></tr>
<tr><td class="znCel">${zn(10810)}<span class="znOpis">Dve strelice gore-dole</span></td><td>mesto od koga <b>POČINJE DVOSMERAN</b> saobraćaj</td><td>„prvenstvo na suženom delu" (plava tabla) ni „zabrana stupanja na suženi deo" (krug)</td></tr>
<tr><td class="znCel">${zn(10806)}<span class="znOpis">Semafor u trouglu</span></td><td>najava mesta gde je saobraćaj <b>regulisan SEMAFORIMA</b></td><td>prelaz preko pruge sa semaforima ni „pristup vozila reguliše se semaforima"</td></tr>
<tr><td class="znCel">${zn(10808)}<span class="znOpis">Avion</span></td><td>blizina piste: avioni preleću u <b>NISKOM LETU</b> pri sletanju, odnosno poletanju</td><td>„bočni vetar izazvan letom aviona" ni „blizina aerodroma" (to je obaveštenje)</td></tr>
<tr><td class="znCel">${zn(10809)}<span class="znOpis">Vetrokaz (vreća na stubu)</span></td><td>učestala pojava jakog <b>BOČNOG VETRA</b> — simbol odgovara smeru vetra</td><td>avioni</td></tr>
<tr><td class="znCel">${zn(10836)}<span class="znOpis">Vozila u nizu, crvena zadnja svetla</span></td><td>opasnost od <b>STVARANJA KOLONE</b> vozila (zastoj — vozila gledaš otpozadi)</td><td>„moraju se kretati u koloni" ni „zabranjeno kretanje u koloni"</td></tr>
<tr><td class="znCel">${zn(10824)}<span class="znOpis">Kružne strelice u trouglu</span></td><td>nailazak na raskrsnicu sa <b>KRUŽNIM TOKOM</b></td><td>„obavezan smer obilaska ostrva" (plavi krug) ni zabrana polukružnog okretanja</td></tr>
<tr><td class="znCel">${zn(10811)}<span class="znOpis">Uzvičnik</span></td><td>opasnost za koju <b>NIJE predviđen poseban znak</b></td><td>radovi ni „ustupi prvenstvo prolaza"</td></tr>
</table>

</div>
<p><b>Taktika:</b> prvo oblik (trougao = upozorenje), pa simbol, pa u odgovorima traži NAJAVU („nailazak", „približavanje"). Kod parova (levo/desno, sa/bez branika, jedan/dva koloseka, izbočina/ulegnuće) tačan odgovor je uvek DOSLOVNO ono što je nacrtano — ne biraj „logičniji", biraj nacrtani.</p>
`,
};

// --- znakovi-naredbi (Tura 2 revizije pojmovnika; revizija bez primedbi) ---
CARDS['znakovi-naredbi'] = {
  title: 'Znakovi izričitih naredbi — zabrane i obaveze',
  html: `<p><b>Svako pitanje iz ove podoblasti nosi 3 poena</b>, a 62 od 65 su slike. Dobra vest: ne bubaš 60 znakova napamet — <b>boja i oblik ti unapred kažu vrstu naredbe</b>, a razlika između sličnih znakova je uvek ista sitnica. Nauči parove, ne pojedinačne znakove.</p>

<p><b>Kako se čita znak:</b></p>
<table>
<tr><th>Vidiš</th><th>Vrsta</th><th>Poruka</th></tr>
<tr><td>beli krug, <b>crveni obod</b> (nekad i kose crvene crte)</td><td>zabrana / ograničenje</td><td>šta <b>NE SMEŠ</b></td></tr>
<tr><td><b>plavi krug</b>, beli simbol</td><td>obaveza</td><td>šta <b>MORAŠ</b></td></tr>
<tr><td>trougao <b>vrhom nadole</b></td><td>prvenstvo prolaza</td><td>moraš da <b>USTUPIŠ</b> prvenstvo vozilima na putu na koji nailaziš (i šinskom vozilu na pruzi)</td></tr>
<tr><td>crveni <b>osmougao „STOP"</b></td><td>prvenstvo prolaza</td><td>moraš da <b>ZAUSTAVIŠ VOZILO</b> — PA da ustupiš prvenstvo (i pred prelazom preko pruge)</td></tr>
</table>
<!-- SVG: red od cetiri znaka u signRow: 1) beli krug sa crvenim obodom i brojem 40; 2) plavi krug sa belom strelicom nagore; 3) obrnuti trougao sa crvenim rubom, prazan; 4) crveni osmougao sa belim natpisom STOP -->
<p class="mut">Sve je krug osim tri znaka: trougao (ustupanje), osmougao (STOP) i pravougaonik (obavezan smer za opasan teret) — Pravilnik o saobraćajnoj signalizaciji, čl. 28. <b>Trougao vs STOP:</b> trougao ne traži zaustavljanje, STOP uvek traži. Na slici sa numerisanim znakovima: trougao = „ustupanje prvenstva", osmougao = „obavezno zaustavljanje".</p>

<p><b>Odakle dokle važi naredba</b> — četiri pitanja, četiri kratka odgovora:</p>
<table>
<tr><th>Pitanje</th><th>Odgovor</th><th>Mamac</th></tr>
<tr><td>Od kada važi?</td><td>od <b>MESTA na kome je znak postavljen</b></td><td>„od 150 m", „od trenutka kada si znak uočio"</td></tr>
<tr><td>Dokle važi?</td><td>do <b>PRVE naredne raskrsnice</b>, odnosno do znaka obaveštenja o prestanku te naredbe</td><td>„do znaka prestanka bez obzira na raskrsnicu" — NE: raskrsnica sama gasi naredbu</td></tr>
<tr><td>Gde se postavlja?</td><td><b>NEPOSREDNO ispred</b> mesta odakle nastaje obaveza</td><td>„100 m" i „150–250 m ispred" — to je pravilo za znakove OPASNOSTI</td></tr>
<tr><td>Dopunska tabla „200 m" (samo broj)</td><td>znak je postavljen unapred: naredba važi <b>NA UDALJENOSTI od 200 m</b> od znaka</td><td rowspan="2">isto pravilo kao kod svih dopunskih tabli: <b>samo broj = udaljenost</b> do početka, <b>strelice = dužina</b> važenja</td></tr>
<tr><td>Dopunska tabla „200 m" sa strelicama</td><td>naredba važi <b>od znaka U DUŽINI od 200 m</b></td></tr>
</table>
<!-- SVG: dva ista znaka zabrane (npr. krug 40) jedan pored drugog; ispod levog dopunska tabla samo sa natpisom "200 m", ispod desnog tabla sa dve uspravne strelice i natpisom "200 m" -->
<p class="mut">Ako naredba važi i posle raskrsnice, znak se iza raskrsnice ponovo postavlja (Pravilnik, čl. 32).</p>

<p><b>MORAJU, SMEJU ili MOGU — plave zamke.</b> Pročitaj glagol u odgovoru i uporedi sa znakom:</p>
<table>
<tr><th>Znak</th><th>Znači</th><th>Ne mešaj sa</th></tr>
<tr><td>plavi krug, <b>jedna</b> strelica</td><td>smer kojim se vozila <b>MORAJU</b> kretati</td><td>„jednosmerni put" i „obaveštenje o jednosmernom putu" su mamci — jednosmerni put je PRAVOUGAONI znak obaveštenja, plavi krug NIKAD</td></tr>
<tr><td>plavi krug, <b>dva</b> ponuđena smera</td><td>smerovi u kojima se vozila <b>SMEJU</b> kretati</td><td>kad znak nudi izbor — „smeju"; kad ne nudi — „moraju"</td></tr>
<tr><td>plavi krug, kosa strelica pored ostrva</td><td>kolovoz kojim se vozila <b>MORAJU</b> kretati prilikom obilaženja pešačkih ostrva, ostrva za usmeravanje saobraćaja, odnosno drugih objekata na kolovozu</td><td>strelice na <b>OBE</b> strane = kojim se <b>MOGU</b> kretati (obilaženje sa obe strane — jedini „mogu" u grupi)</td></tr>
<tr><td>plavi krug, polukružna strelica</td><td><b>OBAVEZNO</b> polukružno okretanje</td><td>crveni krug sa precrtanom polukružnom strelicom = <b>ZABRANJENO</b> polukružno okretanje</td></tr>
<tr><td><b>broj u plavom krugu</b></td><td><b>najmanja dozvoljena brzina</b> — obavezno kretanje brzinom ne manjom od označene</td><td>broj u <b>crvenom krugu</b> = ograničenje (najviše toliko); broj u plavom <b>KVADRATU</b> = samo preporuka (znak obaveštenja)</td></tr>
</table>
<!-- SVG: signRow parovi: plavi krug jedna strelica naspram plavog kruga sa strelicama pravo+desno; plavi krug kosa strelica nadole-levo naspram plavog kruga sa dve kose strelice na obe strane; plavi krug "30" naspram crvenog kruga "30" naspram plavog kvadrata "30" -->

<p><b>Zabrane koje liče jedna na drugu:</b></p>
<table>
<tr><th>Par</th><th>Kako ih razdvojiš</th></tr>
<tr><td><b>prazan krug</b> vs „cigla"</td><td>beli krug sa crvenim obodom <b>bez simbola</b> = zabranjen saobraćaj za <b>SVA vozila</b> (znak „zabrana saobraćaja za vozila u oba smera"); drugi znak iz para = zabranjen saobraćaj vozilima <b>iz smera prema kome je okrenuto lice znaka</b> („u jednom smeru" — s druge strane se prolazi)</td></tr>
<tr><td>jedna kosa crta vs dve ukrštene</td><td>osnova ovih znakova je <b>plava</b> iako su zabrane (Pravilnik, čl. 29): <b>jedna crta = zabranjeno samo PARKIRANJE</b> (zaustaviti se smeš); <b>dve ukrštene crte = zabranjeno I ZAUSTAVLJANJE I PARKIRANJE</b>. Više crta — stroža zabrana. Tačan odgovor uvek počinje „STRANU puta…" — „deo puta" je mamac</td></tr>
<tr><td>oznaka <b>I</b> vs oznaka <b>II</b></td><td>naizmenično parkiranje: <b>I = zabranjeno NEPARNIM danima</b>, <b>II = zabranjeno PARNIM danima</b>. Pamtilica: I je jedan (neparan broj), II je dva (paran)</td></tr>
<tr><td>zabrana preticanja: auto vs kamion</td><td>od dva simbola vozila <b>levi je crven</b> (Pravilnik, čl. 29). Crven <b>auto</b> = zabrana preticanja za motorna vozila — ali <b>NE važi za motocikle sa dva točka bez prikolice i mopede</b>; crven <b>kamion</b> = zabrana preticanja za teretna vozila <b>čija najveća dozvoljena masa prelazi 3,5 t</b></td></tr>
<tr><td>Znakovi sa natpisom STOP</td><td>krug sa crvenim obodom + natpis = naredba da <b>zaustaviš vozilo iz razloga označenog na znaku</b>: policija, naplatno mesto za putarinu, carinarnica — tri znaka, ista rečenica, menja se samo razlog u zagradi</td></tr>
<tr><td>truba u krugu</td><td>zabrana davanja zvučnih znakova upozorenja — <b>OSIM u slučaju neposredne opasnosti</b></td></tr>
<tr><td>suženje: krug vs plava tabla</td><td>u krugu <b>crvena strelica pokazuje zabranjen smer</b> (Pravilnik, čl. 29) — tvoj: <b>zabrana STUPANJA na suženi deo</b> dok ne prođu vozila iz suprotnog smera. Plava TABLA sa sličnim strelicama je obaveštenje da <b>TI imaš prvenstvo</b> na suženju. Krug — čekaš; tabla — prolaziš</td></tr>
<tr><td>broj metara u crvenom krugu</td><td>najmanje <b>ODSTOJANJE</b> između vozila <b>u kretanju</b> — mamci: „rastojanje" i „najveće"</td></tr>
<tr><td>precrtana strelica levo / desno</td><td>zabranjeno skretanje <b>levo</b>, odnosno <b>desno</b> — odgovor kaže „MESTO na putu", ne deonica</td></tr>
</table>
<!-- SVG: signRow parovi: prazan beli krug sa crvenim obodom naspram punog crvenog kruga sa belom vodoravnom crtom; plavi krug crveni obod jedna kosa crta naspram istog sa dve ukrstene crte; dva ista plava znaka sa belim I odnosno II; krug sa dva auta (levi crven) naspram kruga sa dva kamiona (levi crven); krug sa crvenom strelicom nagore i crnom nadole naspram plave table sa belom strelicom nagore i crvenom nadole -->

<p><b>Kome je zabranjeno — životinjski svet vozila.</b> Znak zabranjuje tačno ono što je nacrtano (teretno vozilo, autobus, traktor, zaprežno vozilo, bicikl, ručna kolica, pešak…), ali četiri znaka nose skrivene repove:</p>
<table>
<tr><th>Na znaku</th><th>Zabranjeno za</th><th>Zamka</th></tr>
<tr><td><b>motocikl</b></td><td>motocikle, <b>TEŠKE tricikle i TEŠKE četvorocikle</b></td><td><b>moped</b> na znaku = mopedi, <b>LAKI tricikli i LAKI četvorocikli</b>. Motocikl vuče sve „teško", moped sve „lako"</td></tr>
<tr><td>samo <b>automobil</b></td><td>znak „zabrana saobraćaja za motorna vozila" — ali <b>NE važi za mopede i motocikle bez prikolice i bez bočnog sedišta</b></td><td>automobil <b>+ motocikl</b> = za <b>SVA motorna vozila</b>, bez izuzetka; automobil <b>+ zaprežno</b> = sva motorna <b>i zaprežna</b></td></tr>
<tr><td>vozilo <b>sa prikolicom</b></td><td>zabrana vuče priključnog vozila <b>OSIM poluprikolice ili prikolice sa jednom osovinom</b></td><td>postoji i varijanta <b>bez izuzetka</b>: zabranjena vuča bilo kog priključnog vozila — dva slična znaka, dva različita repa</td></tr>
<tr><td>točak <b>s lancem</b> (plavi krug)</td><td>lanci za sneg na pogonskim točkovima, <b>ako je na kolovozu sneg</b></td><td>obaveza <b>NE važi</b> za motocikle, mopede, tricikle, četvorocikle, radne mašine, traktore i motokultivatore — vozača A kategorije se ne tiče</td></tr>
<tr><td><b>pešak</b> u crvenom krugu</td><td>zabranjen saobraćaj za pešake</td><td>pešak u <b>PLAVOM</b> krugu = <b>pešačka staza</b> — samo pešaci, svi ostali zabranjeni; <b>konj</b> u plavom = staza za jahače (samo jahači i vodiči životinja)</td></tr>
<tr><td>opasan teret</td><td>tri zabrane: vozila koja prevoze <b>eksploziv ili lako zapaljive materije</b>; vozila koja prevoze <b>opasne terete</b>; vozila sa materijama koje mogu da <b>zagade vodu</b> (na tom znaku su dve PLAVE linije — voda; Pravilnik, čl. 29)</td><td>jedini <b>PRAVOUGAONIK</b> među naredbama: <b>obavezan smer kretanja za vozila koja prevoze opasan teret</b> — gore simbol tereta, dole obavezan smer</td></tr>
</table>
<p class="mut">Znak zabrane za teretna vozila + dopunska tabla sa masom → zabrana važi samo za teretna vozila preko te mase (Pravilnik, čl. 25).</p>

<p><b>Brojevi i kote — gabariti i mase.</b> Gledaj gde stoje strelice, a u odgovoru da li piše „ukupna":</p>
<table>
<tr><th>Na znaku</th><th>Zabrana za vozila čija…</th></tr>
<tr><td>broj (m) i kote <b>levo-desno</b></td><td><b>ŠIRINA</b> prelazi označenu (bez reči „ukupna")</td></tr>
<tr><td>broj (m) i kote <b>gore-dole</b></td><td><b>ukupna VISINA</b> prelazi označenu</td></tr>
<tr><td>silueta vozila + broj (m)</td><td><b>ukupna DUŽINA</b> prelazi označenu — važi i za skupove vozila</td></tr>
<tr><td>broj <b>t</b> na silueti vozila</td><td><b>ukupna MASA</b> prelazi označenu — i za skupove vozila</td></tr>
<tr><td>broj <b>t</b> na simbolu <b>osovine</b> (točkovi)</td><td><b>OSOVINSKO OPTEREĆENJE</b> veće od označenog</td></tr>
</table>
<!-- SVG: signRow pet krugova sa crvenim obodom: kote levo-desno "2m"; kote gore-dole "3,5m"; kamion sa kotama "10m"; silueta kamiona sa natpisom "5t"; osovina sa tockovima i natpisom "8t" -->

<p class="mut"><b>Taktika za slike:</b> prvo boja (crveno = ne smeš, plavo = moraš), pa simbol, pa <b>rep tačnog odgovora</b> — kod ovih pitanja gotovo svi odgovori počinju isto („put, odnosno deo puta na kome je zabranjen saobraćaj…"), a razlika je uvek na kraju rečenice: „osim…", „u kretanju", „stranu puta", „moraju/smeju/mogu".</p>`,
};

// --- znakovi-obavestenja (Tura 2; tri runde revizije, poslednja kontrola bez blokirajućih nalaza) ---
CARDS['znakovi-obavestenja'] = {
  title: 'Znakovi obaveštenja — kako ih čitaš (boja, oblik, precrtano)',
  html: `
<p><b>Šta rade znakovi obaveštenja:</b> po Pravilniku o saobraćajnoj signalizaciji (čl. 34) pružaju obaveštenja o putu kojim se krećeš, nazivima mesta i udaljenosti do njih, o <b>prestanku važenja znakova izričitih naredbi</b> i druga obaveštenja; postavljaju se tako da daju prethodna obaveštenja, obaveštenja o prestrojavanju i o skretanju, potvrdno obaveštenje o pravcu kretanja i da označe objekat, teren, ulicu, odnosno delove puta (čl. 51). Oblik im je <b>kvadrat, pravougaonik ili krug</b> (čl. 49) — okrugli su baš znakovi prestanka; sam Pravilnik navodi tri izuzetka od oblika: strelasti putokaz, znak „obilazak" i turistički strelasti putokaz. <b>Romb nije izuzetak</b> — to je kvadrat postavljen na vrh. Ovo je ubedljivo najveća grupa slikovnih pitanja (u banci ih je oko 146, sledeća grupa ima 68), ali skoro sva se rešavaju sa <b>četiri mehanizma i jednim ključem boja</b> — uči mehanizme, ne bubaj slike:</p>
<table>
<tr><th>Boja podloge</th><th>Šta ti kaže</th></tr>
<tr><td><b>zelena</b></td><td>autoput — znak autoputa i znakovi <b>traka</b> na autoputu (čl. 43). <b>Pažnja:</b> znak „mesto izlaska sa autoputa" je <b>PLAVI</b> kvadrat sa belom kosom strelicom</td></tr>
<tr><td><b>plava</b></td><td>motoput, ostali opšti znakovi obaveštenja, usluge, traka za spora vozila, znakovi zatvaranja/otvaranja/preusmeravanja traka</td></tr>
<tr><td><b>žuta</b> sa crnim simbolima</td><td>znakovi za vođenje na ostalim putevima; <b>skretanje saobraćajnih traka i devijacija</b>; u zoni radova žutu osnovu dobijaju i znakovi zatvaranja/otvaranja/preusmeravanja traka i znak prestanka svih zabrana (čl. 45)</td></tr>
<tr><td><b>bela</b></td><td>table „ZONA", naselje, naziv ulice, brojevi domaćih puteva (oznaka <b>evropskog</b> puta, npr. „E 75", je na <b>zelenoj</b> podlozi) — i, po čl. 43, znakovi za vođenje čije je odredište objekat, sadržaj ili deo naselja</td></tr>
<tr><td><b>fluorescentna žuto-zelena</b></td><td>samo tri znaka: <b>blizina škole</b> (čl. 50 st. 2 t. 10), tabla <b>OPASNOST / PAZI DECA</b> (t. 17) i tabla <b>POGREŠAN SMER</b> (t. 18)</td></tr>
</table>
<p><b>Taktika za sliku:</b> prvo <b>boja podloge</b> (zelena = autoput; plava = motoput, usluge, traka za spora vozila i znakovi zatvaranja/otvaranja/preusmeravanja traka; žuta = skretanje traka, devijacija i vođenje na ostalim putevima; bela = table „ZONA", naselje, brojevi i nazivi; fluorescentna žuto-zelena = blizina škole, OPASNOST, POGREŠAN SMER), pa mehanizam (crvena traka? crne kose crte? tabla „ZONA"? predznak ili mesto?), zatim porodica po obliku (tabla obaveštava — krug naređuje — trougao upozorava), pa tek onda simbol. Pazi: <b>beli KRUG sa crnim kosim crtama</b> znači prestanak zabrane, ali <b>bela TABLA</b> ne znači prestanak ničega — ona nosi zonu, naselje, naziv ili broj. Skoro svaki mamac je znak iz susedne kolone iste tabele.</p>`,
};

CARDS['zn-ob-kraj-zone'] = {
  title: 'Znakovi obaveštenja — kraj, prestanak i zone',
  html: `
<div class="signRow">
  <div class="signCell"><!-- SVG: zelena tabla sa simbolom autoputa preko koje ide debela crvena kosa traka --><b>CRVENA KOSA TRAKA</b><span>isti znak precrtan = KRAJ (autoputa, motoputa, naselja, staza, trake javnog prevoza, zone usporenog saobraćaja...) — znak zadržava svoju boju</span></div>
  <div class="signCell"><!-- SVG: beli krug sa crnim brojem 60 i snopom tankih crnih kosih crta preko --><b>TANKE CRNE CRTE</b><span>PRESTANAK zabrane/ograničenja koje je uveo crveni krug</span></div>
  <div class="signCell"><!-- SVG: bela tabla sa natpisom ZONA i umetnutim okruglim znakom 30 ispod natpisa --><b>TABLA „ZONA"</b><span>bela tabla + natpis + umetnut običan znak; ista tabla sa crnim kosim crtama i sivim umetkom = kraj zone</span></div>
  <div class="signCell"><!-- SVG: dva slična znaka zatvaranja trake jedan pored drugog, prvi označen kao najava, drugi kao mesto --><b>PREDZNAK → ZNAK</b><span>ista šema postoji kao najava („približavanje/blizina/udaljenost") i kao „mesto"</span></div>
</div>
<p style="margin-top:10px"><b>1. Precrtano crvenom trakom = KRAJ.</b> Znak koji nešto otvara postoji i u verziji precrtanoj <b>crvenom kosom trakom</b> koja to zatvara (Pravilnik čl. 50 st. 2 t. 5). Podloga ostaje ista — crvena je samo traka:</p>
<table>
<tr><th>Znak</th><th>Znak početka</th><th>Znak kraja</th></tr>
<tr><td>Autoput — <b>ZELENA</b> tabla, simbol autoputa (dve trake i nadvožnjak)</td><td>mesto odakle počinje autoput</td><td>mesto na kome se završava autoput</td></tr>
<tr><td>Motoput — <b>PLAVA</b> tabla, simbol vozila spreda</td><td>mesto odakle počinje motoput</td><td>mesto na kome se završava motoput</td></tr>
<tr><td>Tabla sa <b>siluetom</b> naselja (bela, crna silueta)</td><td>mesto od koga počinje <b>naselje</b></td><td>mesto na kome se završava naselje</td></tr>
<tr><td>Tabla sa <b>nazivom</b> mesta</td><td>granica od koje počinje <b>naseljeno mesto</b> (naziv je na znaku)</td><td>granica od koje se naseljeno mesto završava</td></tr>
<tr><td><b>Zona usporenog saobraćaja</b> — <b>PLAVA</b> tabla sa belim piktogramima: pešak, automobil, dete sa loptom i kuća (nema reči ZONA, nema umetnutog znaka)</td><td>mesto od kojeg počinje zona usporenog saobraćaja</td><td>ista plava tabla preko koje ide <b>debela crvena kosa traka</b> = mesto gde se završava zona usporenog saobraćaja</td></tr>
<tr><td>Pešačka staza (plavi krug)</td><td>—</td><td>mesto na kome se pešačka staza završava</td></tr>
<tr><td>Traka za javni prevoz</td><td>saobraćajna traka namenjena vozilima javnog prevoza putnika</td><td>mesto na kome se ta traka završava</td></tr>
<tr><td>Traka za <b>spora vozila</b> — plava šema traka sa brzinom u <b>kružiću</b> unutar trake</td><td>početak trake kojom <b>moraju</b> da se kreću vozila sporija od brzine označene na znaku</td><td><b>IZUZETAK — nema nikakve crte.</b> Kraj je ista plava šema na kojoj se traka sa upisanom brzinom <b>uliva nazad</b> u kolovoz = mesto na kome se ta traka završava</td></tr>
</table>
<p><b>Zamka — autoput ili motoput?</b> Boja odlučuje: <b>zelena</b> tabla + dve trake sa nadvožnjakom = autoput; <b>plava</b> tabla + prednja silueta automobila = motoput. Mamac na slici autoputa je i „nadvožnjak na putu" — nadvožnjak je deo simbola, ne značenje znaka.</p>
<p><b>Zamka — naselje ili naseljeno mesto?</b> Silueta grada bez naziva = „naselje". Tabla sa ispisanim nazivom = „naseljeno mesto". Na ispitu se nude jedno umesto drugog — gledaj da li na znaku piše ime.</p>
<p><b>Zamka — zona usporenog saobraćaja je JEDINA zona iz ove tačke.</b> Njen kraj ide crvenom trakom, a kraj sve četiri table „ZONA" iz tačke 4 ide crnim kosim crtama. Ako na slici vidiš plavu tablu sa figurama i crvenu traku — to nije „završetak zone škole" ni „završetak pešačke zone", nego kraj zone usporenog saobraćaja; ta tri odgovora se nude jedan umesto drugog.</p>
<p style="margin-top:10px"><b>2. Precrtano = PRESTANAK — ali postoje DVE porodice, razlikuje ih boja crte:</b></p>
<table>
<tr><th>Porodica</th><th>Kako izgleda</th><th>Šta je unutra</th></tr>
<tr><td><b>(a) tanke CRNE kose crte</b> (čl. 50 st. 2 t. 6)</td><td><b>beli</b> krug, <b>crn</b> simbol, preko njega snop tankih <b>crnih</b> crta</td><td>truba · dva vozila · teretno + vozilo · crni broj · samo crte bez simbola</td></tr>
<tr><td><b>(b) CRVENA kosa traka</b> (čl. 50 st. 2 t. 5)</td><td><b>plavi</b> znak (krug ili kvadrat) preko koga ide debela <b>crvena</b> traka</td><td>lanci · beli broj u plavom krugu · plavi kvadrat sa brojem</td></tr>
</table>
<table>
<tr><th>Precrtani simbol</th><th>Porodica</th><th>Tačan odgovor</th></tr>
<tr><td>truba</td><td>beli krug, crne crte</td><td>prestaje zabrana davanja zvučnih znakova upozorenja</td></tr>
<tr><td>dva vozila</td><td>beli krug, crne crte</td><td>prestaje zabrana preticanja za motorna vozila</td></tr>
<tr><td>teretno + vozilo</td><td>beli krug, crne crte</td><td>prestaje zabrana preticanja za teretna vozila najveće dozvoljene mase preko 3,5 t</td></tr>
<tr><td><b>crni</b> broj u <b>belom</b> krugu</td><td>beli krug, crne crte</td><td>prestaje ograničenje brzine</td></tr>
<tr><td>samo kose crte, bez simbola</td><td>beli krug, crne crte</td><td>mesto na putu odakle prestaju da važe prethodno postavljeni saobraćajni znakovi <b>zabrana, ograničenja i obaveza</b></td></tr>
<tr><td>lanci na točku</td><td><b>plavi krug, crvena traka</b></td><td>prestaje obaveza nošenja lanaca za sneg</td></tr>
<tr><td><b>beli</b> broj u <b>plavom</b> krugu</td><td><b>plavi krug, crvena traka</b></td><td>prestaje obaveza kretanja najmanje propisanom brzinom</td></tr>
<tr><td><b>beli</b> broj u <b>plavom kvadratu</b></td><td><b>plavi kvadrat, crvena traka</b></td><td>prestaje <b>preporuka</b> brzine</td></tr>
</table>
<p><b>Zamka — reč „svi" je marker netačnog odgovora.</b> Kod znaka sa samim kosim crtama nude se tri odgovora, a dva netačna počinju sa „prestaju da važe SVI...": „svi saobraćajni znakovi opasnosti" i „svi saobraćajni znakovi". Tačan odgovor <b>nema reč „svi"</b> i taksativno nabraja tri vrste: <b>zabrana, ograničenja i obaveza</b>. Naziv znaka u Pravilniku jeste „prestanak svih zabrana", ali njegovo značenje po čl. 35 nije „svi znakovi".</p>
<p><b>Zamka — tri znaka sa brojem</b> se stalno nude jedan umesto drugog. Prvo pogledaj <b>podlogu i boju crte</b>, pa tek onda broj. Beli krug + crne crte = prestanak <b>ograničenja</b>; plavi krug + crvena traka = prestanak <b>najmanje</b> brzine; plavi kvadrat + crvena traka = prestanak <b>preporuke</b>.</p>
<p style="margin-top:10px"><b>3. Zone — bela tabla sa natpisom i umetnutim običnim znakom</b> (čl. 50 st. 2 t. 3); ista tabla sa <b>crnim</b> kosim crtama i umetnutim znakom u <b>crno-beloj (sivoj)</b> verziji = kraj zone (t. 4 — ovde nema crvene trake). Ovakvih tabli ima tačno četiri:</p>
<table>
<tr><th>Tabla</th><th>Šta je umetnuto</th><th>Početak znači</th><th>Precrtana crnim crtama</th></tr>
<tr><td>ZONA</td><td>okrugli znak <b>30</b> u crvenom krugu</td><td>zona u kojoj je brzina vozila ograničena <b>do 30 km/h</b></td><td>završetak zone 30</td></tr>
<tr><td>ZONA ŠKOLE</td><td><b>fluorescentni žuto-zeleni kvadrat</b> sa crnim figurama dece</td><td>mesto od kojeg počinje zona škole</td><td>završetak zone škole</td></tr>
<tr><td>ZONA</td><td>plavi krug sa <b>figurom odraslog i deteta</b></td><td>početak zone namenjene kretanju pešaka</td><td>završetak pešačke zone</td></tr>
<tr><td>ZONA</td><td>običan znak <b>zabranjeno parkiranje</b>: plavo polje, crveni rub, jedna crvena dijagonala — <b>slova P nema</b></td><td>početak zone u kojoj je zabranjeno parkiranje</td><td>završetak zone zabrane parkiranja</td></tr>
</table>
<p class="mut">Zona usporenog saobraćaja NIJE u ovoj grupi — vidi tačku 1. Koja pravila važe unutar zona (10 km/h, brzina pešaka, 30/50 km/h...) — kartica o pojmovima puta i zonama.</p>`,
};

CARDS['zn-ob-parovi'] = {
  title: 'Znakovi obaveštenja — romb i parovi tabla/krug/trougao',
  html: `
<p style="margin-top:10px"><b>1. Romb — kvadrat postavljen na vrh:</b></p>
<div class="signRow" style="max-width:340px;margin:0 auto">
  <div class="signCell"><!-- SVG: beli romb sa crnim rubom i žutim kvadratom unutra --><b>PUT SA PRVENSTVOM</b><span>put ili deo puta na kome vozila imaju prvenstvo prolaza u odnosu na vozila koja se kreću putevima koji se s njim ukrštaju. Unutrašnji kvadrat je <b>žut</b>, pojas oko njega <b>beo</b> (čl. 50 st. 2 t. 8)</span></div>
  <div class="signCell"><!-- SVG: isti romb preko koga ide snop tankih crnih kosih crta --><b>ZAVRŠETAK</b><span>isti romb sa snopom tankih <b>crnih</b> kosih crta (porodica a, čl. 50 st. 2 t. 6) = mesto na kome se završava put ili deo puta sa prvenstvom prolaza</span></div>
</div>
<p class="mut">Mamci kod romba nisu drugi znakovi obaveštenja nego znakovi izričitih naredbi: „ustupi prvenstvo prolaza" i „obavezno zaustavljanje".</p>
<p style="margin-top:10px"><b>2. Parovi koji se najčešće mešaju</b> — kvadratna tabla OBAVEŠTAVA, krug NAREĐUJE, trougao UPOZORAVA:</p>
<table>
<tr><th>Ovo je...</th><th>...a mamac je</th></tr>
<tr><td><b>Jednosmerni put</b> — pravougaona/kvadratna tabla sa strelicom (postoji uspravna i položena varijanta)<!-- SVG: par — plava tabla sa strelicom nagore i plava tabla sa vodoravnom strelicom --></td><td>plavi <b>krug</b> sa strelicom = smer kojim se vozila <b>moraju</b> kretati (naredba); nudi se i „smer kojim nije dozvoljeno"</td></tr>
<tr><td><b>Pešački prelaz</b> — plavi kvadrat: mesto na kome prelaz <b>jeste</b></td><td>trougao sa pešakom = opasnost, najava prelaza (druga porodica!)</td></tr>
<tr><td>Varijante: pešački prelaz <b>i</b> prelaz biciklističke staze; samo prelaz biciklističke staze; figura na stepenicama = <b>podzemni/nadzemni</b> pešački prolaz</td><td>međusobno se nude kao mamci — broj figura i stepenice odlučuju</td></tr>
<tr><td><b>Blizina škole</b> — <b>fluorescentni žuto-zeleni kvadrat</b> sa dvema crnim figurama dece sa torbama, bez ikakvog natpisa (čl. 50 st. 2 t. 10): mesto u čijoj se blizini nalazi škola i gde se može nalaziti pešački prelaz koji deca često koriste<!-- SVG: par — go fluorescentni žuto-zeleni kvadrat sa crnim figurama dece; pored bela tabla sa natpisom ZONA ŠKOLE i istim kvadratom umetnutim ispod natpisa --></td><td><b>isti fluorescentni kvadrat umetnut u belu tablu sa natpisom ZONA ŠKOLE</b> = zona škole (režim za celu zonu) i trougao „deca" = opasnost. Ključ: go kvadrat = blizina škole; kvadrat unutar bele table sa natpisom = zona škole</td></tr>
<tr><td><b>Preporučena brzina</b> — plavi <b>kvadrat</b> sa brojem; sa crvenom trakom = prestanak preporuke</td><td>crveni krug = ograničenje (zabrana), plavi krug = obavezna najmanja brzina</td></tr>
<tr><td><b>Suženje — plava kvadratna tabla</b> sa dve strelice: obaveštenje da na suženom delu <b>TI imaš prvenstvo</b> nad vozilima iz suprotnog smera. Po čl. 50 st. 2 t. 7 na ovoj tabli je <b>kraća strelica bela, a duža crvena</b> — crvena ide nadole i to je tuđi smer<!-- SVG: tri znaka uporedo — plava kvadratna tabla sa manjom belom strelicom nagore i većom crvenom strelicom nadole; okrugli beli znak sa crvenim rubom, crnom dužom strelicom nadole i crvenom kraćom strelicom nagore; trougao sa crvenim rubom i dve jednake crne strelice --></td><td><b>Tri znaka, tri odgovora.</b> Okrugli znak sa crvenim rubom = <b>zabrana stupanja</b> na suženje dok ne prođu vozila iz suprotnog smera (naredba). Trougao sa crvenim rubom i dve <b>jednake crne</b> strelice = mesto od koga počinje <b>dvosmeran saobraćaj</b> (opasnost) — i on se nudi kao treći odgovor. <b>Oblik odlučuje: tabla = tebi prednost; krug = suprotnom smeru; trougao = dvosmeran saobraćaj.</b> Nemoj da učiš „crvena strelica je veća": to važi samo na plavoj tabli. Na okruglom znaku su obe strelice <b>iste dužine</b>: crvena je okrenuta nagore — tamo crvena označava <b>tvoj</b> smer, onaj koji mora da čeka. Na trouglu su obe strelice crne i jednake</td></tr>
<tr><td><b>Potvrda pravca kretanja posle prolaska raskrsnice</b> — tabla sa nazivima mesta koja stoji <b>posle</b> raskrsnice</td><td>„prethodno obaveštenje radi prestrojavanja" i „raskrsnica" (table <b>pre</b> raskrsnice)</td></tr>
<tr><td><b>P varijante:</b> samo P = parkiralište · P sa satom = parkiranje <b>vremenski ograničeno</b> · P pod krovom = <b>garaža</b> sa parking mestima · P + simbol prevoznog sredstva = parkiraj, pa putovanje nastavi drugim prevoznim sredstvom</td><td>sve četiri se nude međusobno — gledaj dodatak uz slovo P</td></tr>
<tr><td>Šema traka sa simbolom vozila <b>u crvenom krugu</b> iznad jedne trake = ta traka <b>NIJE namenjena</b> vrstama vozila čiji je simbol prikazan. Podloga je zelena na autoputu, plava na svim ostalim putevima (čl. 50 st. 2 t. 14)</td><td><b>traka javnog prevoza</b>: autobus u <b>običnom belom krugu, bez crvenog ruba</b>, uz tu traku ide <b>isprekidana žuta linija</b> (čl. 50 st. 2 t. 13) — značenje je suprotno („traka JESTE namenjena"). Crveni krug je jedina razlika u značenju; nudi se i „zabranjeno kretanje na deonici"</td></tr>
</table>
<p><b>Zamka nad zamkama:</b> „potvrda pravca kretanja" zvuči kao mamac, ali ovde, kao saobraćajni <b>znak</b>, ona postoji i JESTE tačan odgovor — za tablu koja stoji <b>posle</b> raskrsnice.</p>`,
};

CARDS['zn-ob-autoput'] = {
  title: 'Znakovi obaveštenja — trake, radovi i preusmeravanje',
  html: `
<p style="margin-top:10px"><b>1. Autoput — otvaranje i zatvaranje traka.</b> Svaka situacija ima dva znaka; odgovore razlikuje formulacija <b>„približavanje mestu"</b> (predznak, najava) protiv <b>„mesto"</b>:</p>
<table>
<tr><th>Situacija (ZELENI znakovi na autoputu)</th><th>Predznak — najava</th><th>Znak — mesto</th></tr>
<tr><td>otvara se saobraćajna traka</td><td>približavanje mestu <b>na autoputu</b> gde se otvara</td><td>mesto <b>na autoputu</b> gde se otvara</td></tr>
<tr><td>zatvara se saobraćajna traka</td><td>približavanje mestu <b>na autoputu</b> gde se zatvara</td><td>mesto <b>na autoputu</b> gde se zatvara</td></tr>
<tr><td>zatvara se zaustavna traka</td><td>približavanje mestu <b>na autoputu</b> gde se zatvara</td><td>mesto <b>na autoputu</b> gde se zatvara</td></tr>
<tr><td>autoput se spaja sa drugim autoputem</td><td>približavanje mestu spajanja</td><td>mesto spajanja</td></tr>
</table>
<p><b>Zamka — reči „na autoputu" su deo odgovora.</b> Iste situacije postoje i u plavoj verziji za obične puteve (tačka 7), pa se odgovori ukrštaju: uz <b>zeleni</b> znak ide „na autoputu", uz <b>plavi</b> ne ide. Ako na zelenom znaku vidiš najavu — traži „približavanje mestu na autoputu"; ako je plav — traži „udaljenost do mesta".</p>
<p><b>Zamka:</b> stalni mamac u ovoj grupi je „traka za spora vozila". Razlikuj po dve stvari — boji i broju:<!-- SVG: tri znaka uporedo — zeleni predznak otvaranja trake sa natpisom 500 m ispod šeme, plavi znak trake za spora vozila sa brojem 30 u kružiću unutar trake, plavi znak na kome se ta traka uliva nazad u kolovoz --></p>
<table>
<tr><th></th><th>Otvaranje/zatvaranje/spajanje</th><th>Traka za spora vozila</th></tr>
<tr><td>Boja</td><td><b>zelena</b> (na autoputu)</td><td><b>plava</b></td></tr>
<tr><td>Broj na znaku</td><td>predznak nosi <b>udaljenost</b> ispod šeme, npr. „500 m"</td><td><b>brzina u kružiću</b> unutar same trake, npr. 30</td></tr>
<tr><td>Značenje</td><td>najava, odnosno mesto otvaranja/zatvaranja trake</td><td>tom trakom se MORAJU kretati vozila sporija od brzine sa znaka; ista šema sa trakom koja se uliva nazad = kraj te trake</td></tr>
</table>
<p><b>Izlaz i odmorište:</b> mesto izlaska sa autoputa · <b>udaljenost do početka trake za izlaz</b> (znak sa brojem metara) · nailazak na odmorište čiji je sadržaj prikazan <b>piktogramima</b> · mesto izlaska sa puta <b>do odmorišta</b> — četiri različita znaka, nude se međusobno.</p>
<p style="margin-top:10px"><b>2. Radovi i preusmeravanje — ovde boja deli grupu na dva dela.</b> Znakovi zatvaranja, otvaranja i preusmeravanja traka su <b>PLAVI</b> (čl. 50 st. 2 t. 16), a znakovi <b>skretanja saobraćajnih traka i devijacije su ŽUTI sa crnim strelicama</b> (čl. 44). U zoni radova i plavi znakovi traka dobijaju žutu osnovu sa crnim simbolima (čl. 45):</p>
<table>
<tr><th>Situacija</th><th>Najava</th><th>Mesto</th></tr>
<tr><td>zatvara se saobraćajna traka (<b>plavi</b>)</td><td><b>udaljenost</b> do mesta zatvaranja</td><td>mesto gde <b>počinje</b> zatvaranje</td></tr>
<tr><td>otvara se saobraćajna traka (<b>plavi</b>)</td><td>udaljenost do mesta otvaranja</td><td>mesto gde počinje otvaranje (traka za isti smer)</td></tr>
<tr><td>dvosmerni saobraćaj sa fizički razdvojenih kolovoznih traka prelazi na kolovoz gde ih dele samo oznake (<b>plavi</b>)</td><td><b>blizina</b> mesta preusmeravanja</td><td>mesto preusmeravanja</td></tr>
<tr><td>skretanje saobraćajnih traka, <b>broj traka ostaje isti</b> (<b>ŽUTI</b>, crne strelice)</td><td><b>blizina</b> mesta skretanja</td><td>mesto skretanja traka</td></tr>
<tr><td>devijacija puta (<b>ŽUTI</b>, crne strelice)</td><td><b>približavanje</b> devijaciji</td><td>mesto devijacije</td></tr>
</table>
<p><b>Zamka — dva žuta znaka koja se najlakše zamene.</b> Boja ih ne razdvaja (oba su žuta sa crnim strelicama), ni broj metara (i jedan i drugi predznak nosi udaljenost, npr. „200 m"). Razdvajaju ih <b>smerovi strelica</b>:<!-- SVG: par žutih tabli sa crnim strelicama — levo obe strelice nagore sa bočnim pomakom u sredini; desno jedna talasasta strelica nadole i jedna talasasta nagore --></p>
<table>
<tr><th></th><th>Skretanje saobraćajnih traka</th><th>Devijacija puta</th></tr>
<tr><td>Strelice</td><td><b>obe nagore</b>, sa bočnim pomakom (lomom) u sredini — saobraćaj ide u istom smeru, samo pomeren u stranu</td><td><b>jedna nadole, jedna nagore</b> — suprotni smerovi, obe talasaste</td></tr>
<tr><td>Reč u odgovoru</td><td>„<b>blizinu</b> mesta gde se vrši skretanje..." / „mesto gde se vrši skretanje..."</td><td>„<b>približavanje</b> mestu na kome postoji devijacija" / „mesto devijacija na putu"</td></tr>
<tr><td>Ostali mamci</td><td>trouglovi opasnosti: „približavanje krivini nadesno" i „deo puta sa više uzastopnih krivina"</td><td>„neravan kolovoz zbog opasne izbočine" i „skretanje saobraćajnih traka"</td></tr>
</table>
<p class="mut">Plavi znak preusmeravanja takođe ima jednu strelicu nadole i jednu nagore, ali je <b>plav</b> i na njemu su nacrtana i <b>šrafirana ostrva</b> — zato boja ostaje prvi filter.</p>
<p>Još iz ove grupe: <b>predznak za obilazak</b> = smer i tok preusmerenog saobraćaja kada je put zatvoren · strelasto oblikovana tabla <b>„obilazak"</b> za usmeravanje vozila na obilazni put · obaveštenje da zbog radova/prepreka/oštećenja kolovoza saobraćaj regulišu <b>ovlašćena lica</b> · <b>poslednje upozorenje</b> da si na delu puta namenjenom vozilima iz suprotnog smera (fluorescentna žuto-zelena tabla sa natpisima STOP i POGREŠAN SMER, crnom šakom i znakom zabrane saobraćaja u jednom smeru) · mesto gde se zbog završetka trake ili suženja vozila <b>naizmenično uključuju</b> u jednu traku (patent-zatvarač).</p>`,
};

CARDS['zn-ob-vodjenje'] = {
  title: 'Znakovi obaveštenja — vođenje, usluge i tunel',
  html: `
<p style="margin-top:10px"><b>1. Vođenje saobraćaja — gledaj GDE tabla stoji:</b></p>
<table>
<tr><th>Položaj</th><th>Znak</th></tr>
<tr><td><b>PRE</b> raskrsnice, šema puteva</td><td>„raskrsnica" — međusobni položaj, pravci puteva i nazivi mesta; kružna šema = raskrsnica sa kružnim tokom</td></tr>
<tr><td><b>PRE</b> raskrsnice, strelice po trakama</td><td>prethodno obaveštenje radi <b>prestrojavanja</b> na putevima sa više traka; postoji i verzija za kružni tok</td></tr>
<tr><td><b>NA</b> raskrsnici</td><td>pravac puta do naseljenog mesta · pravac kretanja do naseljenih mesta · udaljenost i pravac kretanja</td></tr>
<tr><td><b>POSLE</b> raskrsnice</td><td><b>potvrda pravca</b> kretanja</td></tr>
<tr><td>iznad kolovoza</td><td>obaveštenje o načinu korišćenja saobraćajne trake za kretanje do naseljenog mesta</td></tr>
<tr><td>ostale table</td><td>udaljenost i putni pravci do naseljenih mesta · udaljenost do raskrsnice i pravci autoputeva · pravci autoputeva · naziv <b>petlje</b> na koju se nailazi</td></tr>
</table>
<p class="mut">Boja osnove znakova za vođenje (Pravilnik čl. 43): zelena = autoput, plava = motoput, žuta = ostali putevi, bela = znak čije je odredište objekat, sadržaj ili deo naselja. Isti ključ boja objašnjava i zašto su znakovi traka iz tačke 6 zeleni. Isto značenje ume da se pojavi i na zelenoj, i na žutoj i na plavoj podlozi — kod ovih znakova boja ti kaže KOJI je put, ne šta znak znači.</p>
<p>Poseban znak: put kojim je <b>dozvoljeno</b> kretanje kada nameravaš da skreneš ulevo na raskrsnici na kojoj je skretanje ulevo <b>zabranjeno</b> (tabla ti crta obilazni put oko bloka).</p>
<p style="margin-top:10px"><b>2. Usluge — simbol govori sve, mamci su uvek susedi iz iste grupe:</b><!-- SVG: mini-galerija plavih kvadrata sa belim poljem i crnim simbolom: šoljica na tacni, ukrštene kašika i viljuška, krevet, šator, prikolica, crveni krst, ključ, slušalica, pumpa --></p>
<table>
<tr><th>Znak</th><th>Kako ih razlikuješ</th></tr>
<tr><td><b>šoljica na tacni</b> = kafana · <b>ukrštene kašika i viljuška</b> = restoran · <b>krevet</b> = hotel/motel</td><td>nude se međusobno; na znaku za restoran <b>nema noža</b> — ukrštene su kašika i viljuška</td></tr>
<tr><td>šator = kampovanje <b>pod šatorima</b> · prikolica = boravak <b>u prikolicama</b> · šator + prikolica = <b>oba</b></td><td>odgovor mora tačno da pogodi simbole sa slike; mamci su i „izletnici" i „planinarski dom"</td></tr>
<tr><td><b>kuća + jelka</b> = planinarski dom · <b>sto i klupa + jelka</b> = teren uređen za izletnike</td><td>oba imaju drvo — odlučuje ono <b>pored</b> drveta: kuća ili sto sa klupom. Mešaju se i sa kampovima</td></tr>
<tr><td><b>crveni krst</b> na belom polju = stanica za prvu pomoć · <b>belo slovo H</b> i natpis BOLNICA = blizina bolnice i poruka da vozilom ne stvaraš buku</td><td>ovo su glavni mamci jedan drugom: krst = prva pomoć, slovo H = bolnica. Kod oba se nudi i „zdravstvena ustanova u kojoj se vrše pregledi vozača"</td></tr>
<tr><td><b>radionica</b> za opravku vozila · služba za <b>pomoć u slučaju kvara</b></td><td>mamac kod oba: „objekat za tehnički pregled"</td></tr>
<tr><td>slušalica = <b>telefonska govornica</b> · pumpa = <b>benzinska stanica</b></td><td>mamci: „turističke informacije", „telefon za vreme vožnje"</td></tr>
<tr><td>stanica <b>policije</b> · služba za <b>gašenje požara</b></td><td>mamci: „prolaz uz odobrenje policajca", „raskrsnica koju reguliše policajac", „aparat za gašenje požara"</td></tr>
<tr><td><b>autobusko stajalište</b> · <b>tramvajska stanica</b></td><td>nude se međusobno; kod tramvaja mamac je i „ukrštanje sa tramvajskom prugom" (trougao!)</td></tr>
<tr><td><b>brod na vodi</b> (bez sidra) = luka, pristanište, trajekt · avion = aerodrom</td><td>mamci su znakovi opasnosti: pokretni most, rečna/morska obala, bočni vetar, niski letovi aviona</td></tr>
</table>
<p style="margin-top:10px"><b>3. Tunel — tri znaka za slučaj opasnosti:</b></p>
<div class="signRow">
  <div class="signCell"><!-- SVG: zeleni kvadrat, bela figura trči ka belom pravougaoniku (vratima) --><b>IZLAZ ZA PEŠAKE</b><span>izlaz za pešake u slučaju opasnosti (mamac: „objekat za rekreaciju i sport")</span></div>
  <div class="signCell"><!-- SVG: zelena tabla oblikovana kao strelica (petougao) sa figurom, vodoravnom strelicom i natpisom 100 m --><b>SMER + UDALJENOST</b><span>smer u kome je izlaz za slučaj opasnosti i udaljenost do njega; tabla je <b>strelasto oblikovana</b> i pokazuje na stranu na kojoj je izlaz</span></div>
  <div class="signCell"><!-- SVG: plava tabla sa belom šemom kolovoza i proširenja (niše) sa desne strane, bez ikakvih simbola --><b>SOS NIŠA</b><span>deo puta za zaustavljanje/parkiranje u hitnom slučaju; može biti opremljen telefonom za hitne pozive i aparatom za gašenje požara (mamac: „parking mesto"). Na samom znaku je samo šema niše — telefon i aparat se ne crtaju</span></div>
</div>`,
};

CARDS['zn-ob-ostalo'] = {
  title: 'Znakovi obaveštenja — putarina, table i brojevi',
  html: `
<p style="margin-top:10px"><b>1. Putarina, radar, kamere:</b></p>
<table>
<tr><th>Znak</th><th>Znači</th></tr>
<tr><td>naplatna stanica (dve varijante znaka)</td><td>nailazak na objekat za naplatu putarine — mamac: „naredba da zaustaviš vozilo (naplatno mesto)"</td></tr>
<tr><td>traka sa elektronskom naplatom</td><td>saobraćajna traka u kojoj se putarina naplaćuje <b>elektronskim putem</b></td></tr>
<tr><td>kombinovana naplata</td><td>blizina mesta gde se putarina naplaćuje <b>i elektronski i ručno</b></td></tr>
<tr><td>radar</td><td>početak deonice na kojoj se <b>često vrši radarska kontrola</b> brzine</td></tr>
<tr><td>kamera</td><td>mesto na deonici od kojeg počinje <b>snimanje saobraćaja fiksnim tehničkim uređajima</b> — mamci: radarska kontrola, vozilo-presretač</td></tr>
</table>
<p style="margin-top:10px"><b>2. Tabla na granici:</b> plava tabla na kojoj je gore <b>zastava Srbije</b>, natpis „Srbija" i ovalna oznaka SRB, ispod nje <b>četiri reda</b> — crna silueta naselja, precrtana silueta naselja, <b>plavi</b> kvadrat sa automobilom (motoput) i <b>zeleni</b> kvadrat sa simbolom autoputa — i uz svaki red <b>ograničenje brzine u crvenom krugu</b> (50, 80, 100, 130), a na dnu <b>simbol svetlosnog snopa fara</b> sa oznakom „00-24".<!-- SVG: plava tabla sa zastavom, natpisom Srbija i oznakom SRB, ispod četiri bela reda sa siluetama i crvenim krugovima brzina, u dnu red sa simbolom fara i natpisom 00-24 --> Znači: <b>opšte ograničenje najveće dozvoljene brzine kretanja vozila prema kategoriji puta</b> i obaveza upotrebe <b>svetla</b> na teritoriji Republike Srbije. Mamci: „srednja brzina" i „preporučene brzine" — na tabli su opšta OGRANIČENJA, a brojevi stoje u crvenim krugovima, koji uvek znače zabranu.</p>
<p style="margin-top:10px"><b>3. Razdelno ostrvo i oštra krivina (žuto-crno / crno-belo):</b> tabla na vrhu razdelnog ostrva ima dve varijante, a od varijante zavisi koji se znak postavlja iznad nje (Pravilnik čl. 35):</p>
<table>
<tr><th>Varijanta table (uspravna, uska)</th><th>Šta ide IZNAD nje</th></tr>
<tr><td><b>vodoravna naizmenična crna i žuta polja</b> (kao pruge preko table)<!-- SVG: uska uspravna tabla sa vodoravnim naizmeničnim crnim i žutim poljima --></td><td>plavi krug sa <b>kosom belom strelicom nadole-udesno</b> ili <b>nadole-ulevo</b> = obavezno obilaženje s desne, odnosno s leve strane. Na pitanju sa četiri ponuđena znaka tačna su <b>OBA</b>, a mamci su plavi krug sa <b>vodoravnom</b> strelicom (obavezan smer) i znak kružnog toka</td></tr>
<tr><td><b>žuti ševroni (strelaste crte) na crnoj podlozi</b>, okrenuti nagore<!-- SVG: uska uspravna tabla sa žutim ševronima na crnoj podlozi --></td><td>plavi krug sa <b>dve strelice koje se razilaze</b> ulevo i udesno = obilaženje sa obe strane. Ovde je tačan samo <b>jedan</b> znak</td></tr>
</table>
<p class="mut">Sama tabla, u obe varijante, upozorava vozače da nailaze na <b>razdelno ostrvo</b>. Mamci na tom pitanju: „ukrštanje puta i železničke pruge u nivou" i „stalne prepreke unutar gabarita slobodnog profila puta".</p>
<table>
<tr><th>Znak</th><th>Znači</th></tr>
<tr><td>tabla sa <b>crnim strelicama na beloj podlozi</b> u krivini<!-- SVG: kvadratna tabla sa velikom crnom strelicom (šiljkom) na beloj podlozi, u varijantama usmerenim ulevo i udesno --></td><td>mesto gde se nailazi na <b>oštru krivinu</b> — više varijanti slike (jedna ili tri strelice, levo ili desno), uvek isti odgovor. Mamci su trouglovi: „približavanje krivini na levo/desno" i „više opasnih krivina"</td></tr>
</table>
<p style="margin-top:10px"><b>4. Brojevi, nazivi i sitnice koje ispadnu na ispitu:</b></p>
<table>
<tr><th>Znak</th><th>Znači</th></tr>
<tr><td>tabla sa slovom E i brojem</td><td>broj <b>međunarodnog</b> puta</td></tr>
<tr><td>mala tabla sa više brojeva</td><td>broj puta, broj deonice i stacionaža puta</td></tr>
<tr><td><b>go broj</b> i ispod njega „m.n.m." — bez naziva i bez ikakvog simbola</td><td><b>broj serpentine sa nadmorskom visinom</b></td></tr>
<tr><td>simbol nalik na dve zagrade okrenute leđima, ispod njega <b>naziv mesta</b> i „m.n.m."</td><td><b>planinski prevoj</b> sa nadmorskom visinom</td></tr>
<tr><td><b>piktogram objekta</b> (tunel, most, vijadukt) u belom polju, ispod njega naziv i broj sa oznakom „m" (bez „n.m.")</td><td><b>naziv putnog objekta</b> — taj broj je dužina objekta; mamci su baš „nadmorska visina" i „udaljenost od saobraćajnog znaka"</td></tr>
<tr><td>tabla na mostu</td><td>naziv <b>reke</b> preko koje put prelazi</td></tr>
<tr><td>tabla OTVOREN/ZATVOREN</td><td>da li je put, odnosno prelaz preko planinskog vrha otvoren ili zatvoren</td></tr>
<tr><td>naziv ulice</td><td>naziv ulice — ništa više od toga</td></tr>
<tr><td>put koji se završava poprečnom crtom</td><td>blizina i položaj puta koji <b>nema izlaz</b> (slepi put)</td></tr>
<tr><td>izbočina na plavom kvadratu</td><td><b>nailazak na mesto</b> gde su postavljena <b>tehnička sredstva za usporavanje</b> saobraćaja — mamci: „neravan kolovoz, izbočine/ulegnuća" (to je trougao opasnosti!)</td></tr>
<tr><td>tabla OPASNOST — <b>fluorescentna žuto-zelena</b> podloga, crn natpis i upisan znak opasnosti (trougao sa uzvičnikom)</td><td>nailazak na <b>posebno opasnu deonicu</b> puta — mamci: „radovi na putu", „opasno mesto"</td></tr>
</table>
<p class="mut">Tri table sa nadmorskom visinom i dužinom se stalno mešaju. Zapamti redosled provere: ima li <b>simbol</b>? Ako nema — serpentina. Ako ima simbol prevoja i ime — planinski prevoj. Ako ima piktogram tunela/mosta — putni objekat, a broj je dužina.</p>`,
};

// --- policajac-znaci (Tura 3; kontrola + ručna provera slika 9457/9464) ---
CARDS['policajac-znaci'] = {
  title: 'Znaci i naredbe policijskog službenika',
  html: `
<p><b>Ovo je najjači znak na putu.</b> Znaci i naredbe ovlašćenog lica <b>imaju prvenstvo u odnosu na saobraćajnu signalizaciju i propisana pravila saobraćaja</b> (ZOBS čl. 166). Zato na slikama iz ove oblasti namerno stoje i STOP znak i zeleno svetlo na semaforu — dok policajac reguliše, oni se ne gledaju. Isto važi i za pravilo desne strane: odgovor „mogu pravo kad propustim vozila sa puta koji se ukršta" je uvek mamac.</p>

<p><b>Čime se daju znaci:</b> rukama, odnosno <b>položajem tela</b>, uređajima za davanje svetlosnih i zvučnih znakova i <b>„stop tablicom"</b>. <span class="mut">Mamci: „zastavicom za regulisanje saobraćaja" — zastavice (crvena i zelena) idu uz regulisanje na mestu radova, gde saobraćaj regulišu najmanje dva radnika izvođača; „usmeno" — usmeno se daju <i>naredbe</i>, a ne znaci; „znakovima sa izmenljivim sadržajem poruka" — to je signalizacija na putu, ne znak policajca.</span></p>

<p><b>Šest znakova rukama.</b> Leva kolona je ono što stvarno vidiš na fotografiji, srednja je formulacija kojom to pitanje zove:</p>
<table>
<tr><th>Šta vidiš na slici</th><th>Kako to zove pitanje</th><th>Značenje</th></tr>
<tr><td>Ruka ispružena <b>pravo uvis</b>, otvorena šaka</td><td>ruka podignuta uvis</td><td><b>Obavezno zaustavljanje za SVE</b> učesnike — bez obzira na to da li mu vidiš prsa ili leđa. <span class="mut">Položaj tela je merilo samo kad su ruke spuštene ili odručene.</span></td></tr>
<tr><td>Ruka ispružena <b>vodoravno napred</b>, šaka ravna, <b>dlan okrenut nadole</b></td><td>predručena ruka</td><td><b>Zabrana prolaza</b> za sve čiji smer kretanja <b>seče</b> smer te ruke</td></tr>
<tr><td><b>Pun otvoren dlan uspravno okrenut ka tebi</b> (vidiš celu unutrašnjost šake), ruka ispružena ili savijena u laktu</td><td>znak kojim se naređuje zaustavljanje</td><td><b>Zaustaviš vozilo</b></td></tr>
<tr><td>Ruka ispružena <b>vodoravno u stranu</b>, dlan nadole, pored šake <b>strelica gore-dole</b></td><td>lagano mahanje horizontalno odručenom rukom gore-dole, dlanom nadole</td><td><b>Smanjiš brzinu</b></td></tr>
<tr><td>Podlaktica podignuta, otvorena šaka, oko šake <b>kružna strelica</b></td><td>predručena ruka savijena u laktu, kružno kretanje podlaktice i šake</td><td><b>Ubrzaš</b> kretanje</td></tr>
<tr><td>Podlaktica podignuta, šaka okrenuta <b>bočno</b> (vidiš joj ivicu, kao da te doziva), pored nje <b>strelica levo-desno</b></td><td>odručena ruka sa dlanom okrenutim nagore i mahanje podlaktice savijanjem u laktu</td><td><b>Primakneš vozilo</b> raskrsnici, odnosno ovlašćenom licu</td></tr>
</table>
<p><b>Kako da razlikuješ tri slične gradske slike.</b> Baza koristi istu ulicu i istog policajca, a menja samo ruku — i odgovor je svaki put drugi. Ruka uvis i pun dlan okrenut ka tebi znače <b>stani</b>; ista podignuta podlaktica sa <b>kružnom</b> strelicom znači <b>ubrzaj</b>. Za „priđi bliže" gledaj strelicu koja pokazuje <b>ka policajcu</b>: na gradskim fotografijama to je velika <b>žuta strelica pravo napred</b>, a na studijskim crtežima strelica <b>levo-desno</b> uz bočno okrenutu šaku. Ne pamti scenu — pamti šaku i smer strelice.</p>

<p><b>Položaj tela je znak i kad su ruke spuštene.</b> Kad policajac stoji mirno ili sa <b>obe ruke odručene</b>, važi isto pravilo: ko dolazi iz pravca u kome su okrenuta njegova <b>leđa, odnosno prsa</b> — <b>staje</b>; ko dolazi sa njegovih <b>bočnih strana</b> — <b>prolazi</b>. Raširene ruke ništa ne menjaju, samo ga čine uočljivijim. Obrnuta verzija te rečenice („bočne strane staju, prsa i leđa prolaze") je standardni mamac — čitaj redosled do kraja.</p>
<svg viewBox="0 0 320 300" role="img" aria-label="Pogled odozgo na raskrsnicu: policajac stoji u sredini sa rukama ispruženim u stranu; vozila koja mu dolaze sa prednje i zadnje strane staju, a vozila sa bočnih strana prolaze" style="max-width:320px;width:100%;display:block;margin:8px auto">
  <g fill="#9aa7b4" opacity=".38">
    <rect x="0" y="112" width="320" height="76"/>
    <rect x="112" y="0" width="76" height="300"/>
  </g>
  <path d="M150 40 L150 80" stroke="#c0392b" stroke-width="7" fill="none"/>
  <path d="M138 78 L150 94 L162 78" stroke="#c0392b" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="150" y="30" text-anchor="middle" font-size="13" font-weight="bold" fill="#c0392b">STAJE</text>
  <path d="M150 260 L150 220" stroke="#c0392b" stroke-width="7" fill="none"/>
  <path d="M138 222 L150 206 L162 222" stroke="#c0392b" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="150" y="286" text-anchor="middle" font-size="13" font-weight="bold" fill="#c0392b">STAJE</text>
  <path d="M16 130 L92 130" stroke="#1f7a3f" stroke-width="7" fill="none"/>
  <path d="M88 120 L104 130 L88 140" stroke="#1f7a3f" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="58" y="100" text-anchor="middle" font-size="13" font-weight="bold" fill="#1f7a3f">PROLAZI</text>
  <path d="M304 170 L228 170" stroke="#1f7a3f" stroke-width="7" fill="none"/>
  <path d="M232 160 L216 170 L232 180" stroke="#1f7a3f" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="252" y="212" text-anchor="middle" font-size="13" font-weight="bold" fill="#1f7a3f">PROLAZI</text>
  <line x1="110" y1="150" x2="190" y2="150" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <circle cx="150" cy="150" r="14" fill="currentColor"/>
  <path d="M136 150 A14 14 0 0 1 164 150 Z" fill="#c0392b"/>
  <path d="M92 244 L130 164" stroke="currentColor" stroke-width="1.5" opacity=".5" fill="none"/>
  <text x="58" y="256" text-anchor="middle" font-size="12" fill="#64748b">policajac</text>
</svg>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">crvena polovina figure = prsa; crta kroz figuru = odručene ruke, koje ovde ništa ne menjaju</p>

<p><b>Predručena ruka se gleda drugačije.</b> Zamisli je kao rampu koja se pruža u smeru u kome pokazuje: ako <b>tvoja putanja preseca tu rampu</b> — ne smeš. Ako je ne dodiruješ (na primer, prolaziš iza njegovih leđa, mimo pravca ruke) — smeš pravo.</p>
<svg viewBox="0 0 320 340" role="img" aria-label="Dva prikaza odozgo: gore vozilo čija putanja ne seče predručenu ruku policajca, pa može da prođe; dole vozilo čija putanja seče predručenu ruku, pa mora da stane" style="max-width:320px;width:100%;display:block;margin:8px auto">
  <text x="186" y="34" text-anchor="middle" font-size="12" fill="currentColor">smer predručene ruke</text>
  <circle cx="95" cy="72" r="14" fill="currentColor"/>
  <line x1="109" y1="72" x2="245" y2="72" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <rect x="239" y="62" width="26" height="20" rx="6" fill="currentColor"/>
  <text x="95" y="102" text-anchor="middle" font-size="12" fill="#64748b">policajac</text>
  <path d="M38 132 L38 46" stroke="#1f7a3f" stroke-width="7" fill="none"/>
  <path d="M26 56 L38 34 L50 56" stroke="#1f7a3f" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="72" y="158" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f7a3f">ne seče = možeš</text>
  <line x1="12" y1="176" x2="308" y2="176" stroke="currentColor" stroke-width="1" opacity=".25"/>
  <circle cx="95" cy="248" r="14" fill="currentColor"/>
  <line x1="109" y1="248" x2="245" y2="248" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
  <rect x="239" y="238" width="26" height="20" rx="6" fill="currentColor"/>
  <text x="95" y="278" text-anchor="middle" font-size="12" fill="#64748b">policajac</text>
  <path d="M186 300 L186 214" stroke="#c0392b" stroke-width="7" fill="none"/>
  <path d="M174 224 L186 202 L198 224" stroke="#c0392b" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="186" cy="248" r="9" fill="none" stroke="#c0392b" stroke-width="3"/>
  <text x="186" y="326" text-anchor="middle" font-size="12" font-weight="bold" fill="#c0392b">SEČE = stani</text>
</svg>
<p><b>Nemoj mešati dva pravila.</b> Kad su mu ruke spuštene ili obe odručene — gledaš <b>kuda je okrenut</b>. Kad je jedna ruka <b>predručena</b> — telo više nije merilo, gledaš samo <b>da li joj sečeš smer</b>. Zato na jednoj slici gledaš policajcu u leđa i moraš da staneš, a na drugoj mu takođe gledaš u leđa, ali je ruka predručena mimo tvoje putanje — i smeš pravo. I još jedno: predručena ruka <b>ne naređuje</b> da se krećeš u njenom smeru, ona samo zabranjuje onima koji je seku.</p>

<p><b>Zamke koje se ponavljaju kroz celu oblast</b></p>
<table>
<tr><th>Ponuđeni odgovor</th><th>Zašto je netačan</th></tr>
<tr><td>„...osim za one vozače čija se vozila, u času kada policijski službenik podigne ruku, ne mogu na bezbedan način zaustaviti"</td><td>Nudi se uz uzdignutu ruku, uz predručenu i uz oba položaja tela — <b>nijednom nije tačan</b>. Nema izuzetka „nisam stigao da stanem".</td></tr>
<tr><td>„obavezan je da ukloni vozilo sa kolovoza"</td><td>Nijedan znak rukom ne znači „skloni vozilo sa kolovoza".</td></tr>
<tr><td>„možete nastaviti pravo kada propustite vozila sa puta sa kojim se ukršta"</td><td>Dok policajac reguliše, prvenstvo ne odlučuju pravila ni znakovi — odlučuje njegov znak.</td></tr>
<tr><td>„preporuka za bezbedno kretanje" · „samo ako ste učinili prekršaj" · „samo ako ste prekoračili brzinu"</td><td>Svetlosni znaci sa policijskog vozila su uvek <b>obaveza</b>, i uvek bezuslovna.</td></tr>
</table>

<p><b>Pištaljka</b> — daje se <b>samo kad je policajac van vozila</b>, i to u kombinaciji sa znacima rukama. Nijedan zvižduk sam po sebi nije naredba za zaustavljanje:</p>
<table>
<tr><th>Zvuk</th><th>Znači</th><th>Ti radiš</th></tr>
<tr><td>Jedan <b>duži</b> zvižduk</td><td>Poziv svima koji ga čuju da <b>obrate pažnju</b> na policajca, koji će dati odgovarajući znak</td><td>Gledaš u njega i čekaš znak</td></tr>
<tr><td><b>Više uzastopnih kratkih</b> zvižduka</td><td>Neko je postupio protivno datom znaku, pravilima saobraćaja ili postavljenim znakovima</td><td><b>Osmatranjem policajca utvrdiš da li se znak odnosi na tebe</b> — ne staješ automatski i sigurno ne ubrzavaš</td></tr>
</table>
<p class="mut">Skraćeno: <b>dugo = pažnja</b>, <b>kratko-kratko-kratko = neko je pogrešio, proveri da li si to ti</b>.</p>

<p><b>Iz vozila i sa motocikla.</b> Znake za <b>smanjenje brzine</b>, <b>ubrzanje</b> i <b>zaustavljanje</b> policijski službenik <b>može</b> davati i iz vozila, odnosno sa motocikla — kada policajac, odnosno vozilo, <b>ima vidno obeležje policije</b> (ZOBS čl. 166: znaci i naredbe mogu se davati i iz vozila). Mamci su „ne može iz vozila" i „samo iz vozila sa prvenstvom prolaza" — <b>ne traži se rotacija, traži se obeležje</b>. Obrnuto od toga, pištaljka ide samo van vozila.</p>

<p><b>Baterijska lampa sa postojanim crvenim svetlom, kojom maše upravno na uzdužnu osu puta.</b> Dve noćne slike, dva različita odgovora:</p>
<table>
<tr><th>Šta je na slici</th><th>Šta radiš</th></tr>
<tr><td>Policajac stoji na <b>tvom</b> kolovozu, okrenut ka tebi, i maše crvenom lampom preko tvoje trake</td><td>Bezbedno zaustaviš vozilo na kolovozu, a <b>po mogućnosti van kolovoza</b> — <b>neposredno ISPRED policajca</b> koji daje znak</td></tr>
<tr><td>Policajac je <b>na drugoj strani puta</b> (zaokružen je žutim) i znak daje vozilu koje ide ka tebi iz suprotnog smera</td><td><b>Smanjiš brzinu</b>, odnosno krećeš se sa <b>povećanom opreznošću</b> — ne zaustavljaš se</td></tr>
</table>
<p class="mut">Reč koja odlučuje je „neposredno <b>ispred</b> policijskog službenika" — ne iza njega, ne pored njega. A kad znak nije upućen tebi, ostaje samo obaveza opreza.</p>

<p><b>Displej na policijskom vozilu.</b> Poruka je ispisana crvenim slovima na tamnoj podlozi, na zadnjem staklu vozila ispred tebe, i naizmenično se smenjuje sa rečju POLICIJA. Postupaš doslovno po tekstu — to je <b>obaveza</b>, a ne preporuka, i ne zavisi od toga da li si napravio prekršaj:</p>
<div class="signRow wrapRow" style="margin:10px 0">
  <div class="signCell">
    <svg viewBox="0 0 100 58"><rect x="3" y="7" width="94" height="44" rx="4" fill="#141414"/><text x="50" y="37" text-anchor="middle" fill="#ff4522" font-size="19" font-weight="bold" font-family="monospace">STOP</text></svg>
    <span><b>Staješ IZA</b><br>policijskog vozila</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 100 58"><rect x="3" y="7" width="94" height="44" rx="4" fill="#141414"/><text x="50" y="26" text-anchor="middle" fill="#ff4522" font-size="13" font-weight="bold" font-family="monospace">STANITE</text><text x="50" y="44" text-anchor="middle" fill="#ff4522" font-size="13" font-weight="bold" font-family="monospace">ISPRED</text></svg>
    <span><b>Staješ ISPRED</b><br>službenog vozila</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 100 58"><rect x="3" y="7" width="94" height="44" rx="4" fill="#141414"/><text x="50" y="37" text-anchor="middle" fill="#ff4522" font-size="14" font-weight="bold" font-family="monospace">USPORITE</text></svg>
    <span><b>Voziš brzinom</b><br>policijskog vozila</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 100 58"><rect x="3" y="7" width="94" height="44" rx="4" fill="#141414"/><text x="50" y="26" text-anchor="middle" fill="#ff4522" font-size="13" font-weight="bold" font-family="monospace">PRATITE</text><text x="50" y="44" text-anchor="middle" fill="#ff4522" font-size="13" font-weight="bold" font-family="monospace">NAS</text></svg>
    <span><b>Voziš za njim</b><br>dok daje znak</span>
  </div>
</div>
<p>Zašto goli „STOP" znači <i>iza</i>: vozač koji se kreće <b>neposredno iza</b> policijskog vozila koje daje posebne znake dužan je da postupi po znacima i naredbama policajca, odnosno da prati vozilo do pogodnog mesta i bezbedno se zaustavi <b>iza</b> njega (ZOBS čl. 110). Ispred staješ samo kad na displeju izričito piše da staneš ispred službenog vozila. Mamac na oba pitanja: „dužan sam samo ako uz displej dobijem i znak stop tablicom" — nije tačno, displej je dovoljan.</p>

<p><b>Duga svetla iza tebe.</b> Kada policijsko vozilo pod pratnjom, odnosno sa prvenstvom prolaza, uz posebna svetla daje i <b>svetlosni znak upozorenja</b> — a to je <b>uzastopno ili naizmenično paljenje dugih svetala</b> (ZOBS čl. 60) — vozač koji se kreće <b>neposredno ispred</b> njega mora <b>odmah bezbedno da zaustavi vozilo uz desnu ivicu kolovoza, a po mogućnosti van kolovoza</b> (ZOBS čl. 110). Mamci: „smanji brzinu" i „omogući mu preticanje". Ne — <b>staješ</b>, i to uz desnu ivicu.</p>

<p><b>Rotaciona svetla: četiri situacije.</b> Reč <b>„po potrebi"</b> je ovde skoro uvek deo tačnog odgovora:</p>
<table>
<tr><th>Svetlo</th><th>Vozilo</th><th>Tvoje obaveze</th></tr>
<tr><td><b>Crveno + plavo</b>, naizmenično</td><td>Vozilo <b>pod pratnjom</b>, u kretanju</td><td>Propustiš ga i omogućiš mu mimoilaženje, preticanje, odnosno obilaženje · <b>po potrebi</b> staneš ili skloniš vozilo sa kolovoza · strogo se pridržavaš naredbi <b>lica iz pratnje</b> · nastaviš tek pošto prođu <b>sva</b> vozila pod pratnjom (čl. 107)</td></tr>
<tr><td><b>Dva plava</b></td><td>Vozilo sa prvenstvom prolaza, <b>u kretanju</b></td><td>Obratiš pažnju na njega <b>i na vozila kojima ono obezbeđuje prolaz</b>, pa ih propustiš · po potrebi staneš ili skloniš vozilo dok prođu · strogo se pridržavaš naredbi lica iz tog vozila (čl. 109)</td></tr>
<tr><td><b>Jedno plavo</b></td><td>Vozilo sa prvenstvom prolaza, <b>u kretanju</b></td><td>Obratiš pažnju i <b>ustupiš mu prvenstvo</b>, odnosno propustiš ga · po potrebi staneš ili skloniš vozilo dok prođe <span class="mut">(bez dela o vozilima kojima obezbeđuje prolaz — to ide uz dva svetla)</span></td></tr>
<tr><td><b>Jedno ili dva plava</b></td><td>Vozilo sa prvenstvom prolaza koje <b>STOJI</b> na kolovozu</td><td><b>Smanjiš brzinu</b> · <b>po potrebi</b> staneš · <b>postupaš po naredbama policijskog službenika</b> — potpuno isto za jedno i za dva svetla</td></tr>
</table>
<p class="mut">Dva ključa: kod vozila <b>u kretanju</b> nikad se ne bira ni „smanji brzinu i nastavi kretanje" ni bezuslovno „zaustavi se" — bira se propuštanje uz zaustavljanje <b>po potrebi</b>. Kod <b>zaustavljenog</b> vozila „smanji brzinu" jeste tačno, ali opet uz „po potrebi zaustavi" i „postupaj po naredbama" — nikada samo suvo „zaustavi se".</p>

<p><b>Za test zapamti:</b> ruka uvis i pun dlan ka tebi znače stani; predručena ruka je rampa koju ne smeš da presečeš; spuštene i odručene ruke znače isto — prsa i leđa staju, bokovi prolaze; zvižduk nije naredba za zaustavljanje; crvena lampa znači stani <b>neposredno ispred</b> policajca, a iz suprotnog smera samo uspori; displej se čita doslovno; duga svetla iza tebe znače odmah uz desnu ivicu.</p>
`,
};

// --- uredjaji-oprema (Tura 4; kontrola bez blokirajućih nalaza) ---
CARDS['uredjaji-oprema'] = {
  title: 'Uređaji i oprema vozila',
  html: `
<p><b>Ova oblast je čista memorija brojeva.</b> Svako pitanje nosi <b>2 poena</b>, a ponuđeni odgovori razlikuju se samo po cifri ili po jednoj reči („najmanje" naspram „najviše", „bela" naspram „bela ili žuta"). Bliže uslove — dimenzije, uređaje, sklopove i opremu — propisuje <b>Pravilnik o podeli motornih i priključnih vozila i tehničkim uslovima za vozila u saobraćaju na putevima</b>. <span class="mut">Mamci: „Zakonom o bezbednosti saobraćaja na putevima" i „Pravilnikom o tehničkom pregledu vozila".</span> ZOBS (čl. 246) daje samo okvir: vozilo mora imati ispravne sve propisane uređaje i opremu, a napred ne sme davati ni odbijati <b>crvenu</b>, pozadi <b>belu</b> svetlost, osim izuzetaka koje predviđa taj pravilnik.</p>

<p><b>Dometi svetala — tabela koja nosi najviše pitanja:</b></p>
<table>
<tr><th>Svetlo</th><th>Mora da osvetli</th><th>Šta je mamac</th></tr>
<tr><td><b>Kratko svetlo</b> (sva motorna vozila osim traktora)</td><td><b>najmanje 40 m, najviše 80 m</b></td><td>„najmanje 40 m" bez gornje granice</td></tr>
<tr><td><b>Kratko svetlo MOPEDA</b></td><td><b>najmanje 10 m, najviše 50 m</b></td><td>„najmanje 40 m", „20–60 m"</td></tr>
<tr><td><b>Dugo svetlo</b> (osim traktora)</td><td><b>najmanje 100 m</b>, bez gornje granice</td><td>„najmanje 80 m", „najmanje 40 m"</td></tr>
<tr><td><b>Svetlo za maglu</b></td><td><b>najviše 35 m</b>, bez donje granice</td><td>„<b>najmanje</b> 35 m" — ista cifra, obrnuta reč</td></tr>
</table>
<svg viewBox="0 0 306 380" role="img" aria-label="Dometi svetala na zajedničkoj metarskoj skali od vozila: svetlo za maglu najviše 35 m, kratko svetlo na mopedu 10 do 50 m, kratko svetlo 40 do 80 m, dugo svetlo najmanje 100 m bez gornje granice" style="max-width:306px;width:100%;display:block;margin:8px auto">
  <defs><linearGradient id="uoDugoFade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#ffd84d"/><stop offset=".55" stop-color="#ffd84d"/><stop offset="1" stop-color="#ffd84d" stop-opacity="0"/></linearGradient></defs>

  <g fill="currentColor" font-size="11" opacity=".7">
    <text x="6" y="14">domet u metrima, mereno od vozila</text>
  </g>

  <g stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" opacity=".2">
    <line x1="30" y1="20" x2="30" y2="340"/>
    <line x1="53" y1="20" x2="53" y2="340"/>
    <line x1="110.5" y1="20" x2="110.5" y2="340"/>
    <line x1="122" y1="20" x2="122" y2="340"/>
    <line x1="145" y1="20" x2="145" y2="340"/>
    <line x1="214" y1="20" x2="214" y2="340"/>
    <line x1="260" y1="20" x2="260" y2="340"/>
  </g>

  <g fill="#ffd84d" opacity=".28">
    <polygon points="30,143 53,138 53,156 30,151"/>
    <polygon points="30,221 122,216 122,234 30,229"/>
    <polygon points="30,299 260,294 260,312 30,307"/>
  </g>

  <g fill="#ffd84d" stroke="#b58900" stroke-width="1.5">
    <rect x="30" y="60" width="80.5" height="18"/>
    <rect x="53" y="138" width="92" height="18"/>
    <rect x="122" y="216" width="92" height="18"/>
  </g>
  <rect x="260" y="294" width="42" height="18" fill="url(#uoDugoFade)"/>
  <path d="M260 294 h28 M260 312 h28" stroke="#b58900" stroke-width="1.5" fill="none"/>
  <path d="M288 297 l5 6 l-5 6 M295 297 l5 6 l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>

  <g fill="currentColor">
    <path d="M16 63 h6 a6 6 0 0 1 0 12 h-6 z"/>
    <path d="M16 141 h6 a6 6 0 0 1 0 12 h-6 z"/>
    <path d="M16 219 h6 a6 6 0 0 1 0 12 h-6 z"/>
    <path d="M16 297 h6 a6 6 0 0 1 0 12 h-6 z"/>
  </g>

  <g stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <line x1="110.5" y1="56" x2="110.5" y2="82"/>
    <line x1="53" y1="134" x2="53" y2="160"/><line x1="145" y1="134" x2="145" y2="160"/>
    <line x1="122" y1="212" x2="122" y2="238"/><line x1="214" y1="212" x2="214" y2="238"/>
    <line x1="260" y1="290" x2="260" y2="316"/>
  </g>

  <g fill="currentColor" font-size="13" font-weight="bold">
    <text x="6" y="37">MAGLA</text><text x="300" y="37" text-anchor="end">do 35 m</text>
    <text x="6" y="115">MOPED</text><text x="300" y="115" text-anchor="end">10–50 m</text>
    <text x="6" y="193">KRATKO</text><text x="300" y="193" text-anchor="end">40–80 m</text>
    <text x="6" y="271">DUGO</text><text x="300" y="271" text-anchor="end">od 100 m</text>
  </g>

  <g fill="currentColor" font-size="11" opacity=".7">
    <text x="6" y="55">svetlo za maglu</text>
    <text x="6" y="133">kratko svetlo</text>
    <text x="6" y="211">osim traktora</text>
    <text x="6" y="289">osim traktora</text>
  </g>

  <g fill="currentColor" font-size="11" opacity=".85">
    <text x="30" y="92">najviše 35 m · bez donje granice</text>
    <text x="30" y="170">najmanje 10 m · najviše 50 m</text>
    <text x="30" y="248">najmanje 40 m · najviše 80 m</text>
    <text x="30" y="326">najmanje 100 m · bez gornje granice</text>
  </g>

  <line x1="26" y1="340" x2="302" y2="340" stroke="currentColor" stroke-width="1.5"/>
  <g stroke="currentColor" stroke-width="1.5">
    <line x1="30" y1="340" x2="30" y2="345"/>
    <line x1="53" y1="340" x2="53" y2="345"/>
    <line x1="110.5" y1="340" x2="110.5" y2="361"/>
    <line x1="122" y1="340" x2="122" y2="345"/>
    <line x1="145" y1="340" x2="145" y2="345"/>
    <line x1="214" y1="340" x2="214" y2="345"/>
    <line x1="260" y1="340" x2="260" y2="345"/>
  </g>
  <g fill="currentColor" font-size="11" text-anchor="middle">
    <text x="30" y="357">0</text><text x="53" y="357">10</text><text x="122" y="357">40</text><text x="145" y="357">50</text><text x="214" y="357">80</text><text x="260" y="357">100 m</text>
    <text x="110.5" y="375">35</text>
  </g>
</svg>
<p class="mut">Puna crta je granica koju tačan odgovor mora da sadrži, otvoren kraj znači da granice nema: kratko svetlo ima <i>obe</i> (mora da osvetli, a ne sme da zaslepi), dugo samo donju, magla samo gornju — snop koji bi išao dalje odbijao bi se od magle nazad u oči. Moped je jedini sa sopstvenim, znatno kraćim rasponom — ista slika kao kratko, samo pomerena ulevo.</p>
<p><b>Oblik snopa:</b> kratko svetlo <b>traktora, mopeda, tricikla i četvorocikla</b> sme biti izvedeno kao simetrično <b>ili</b> desnosmerno asimetrično. <span class="mut">Motocikla u tom spisku nema.</span></p>

<p><b>Boje — celo pravilo staje u dve reči: napred NIKAD crvena, nazad NIKAD bela.</b> Sve ostalo je spisak koji se uči napamet:</p>
<table>
<tr><th>Uređaj</th><th>Boja svetlosti</th><th>Zamka u odgovorima</th></tr>
<tr><td>Glavni farovi</td><td><b>bela</b></td><td>„plave ili žute"</td></tr>
<tr><td>Dnevna svetla</td><td><b>samo bela</b></td><td>„bela ili žuta" — to važi za maglu, ne za dnevna</td></tr>
<tr><td>Svetla za maglu</td><td><b>bela ili žuta</b></td><td>„samo žuta"</td></tr>
<tr><td>Pokazivači pravca</td><td><b>žuta</b></td><td>„žute ili crvene", „bele"</td></tr>
<tr><td>Svetlo za vožnju unazad</td><td><b>bela</b></td><td>„crvene"</td></tr>
<tr><td>Svetlo zadnje registarske tablice</td><td><b>bela</b></td><td>ne mora ga biti na četvorociklima, motokultivatorima i priključnim vozilima za traktor</td></tr>
<tr><td>Zadnje poziciono svetlo na <b>mopedu i motociklu</b></td><td><b>crvena — jedno ili dva</b></td><td>„crvene <b>ili žute</b>", „ne moraju biti ugrađena"</td></tr>
<tr><td>Zadnji katadiopteri</td><td><b>crvena</b></td><td>„žute ili crvene"</td></tr>
</table>
<p class="mut">Odgovor „boje određene od strane proizvođača vozila" ponuđen je uz skoro svako pitanje o boji i <b>nijednom nije tačan</b>. Boje su propisane, proizvođač ih ne bira.</p>
<p><b>Bezuslovne zabrane.</b> Uređaji na vozilu koji daju ili odbijaju svetlost u bojama koje propisi ne predviđaju <b>nisu dozvoljeni</b> — bez „ako". <span class="mut">Oba mamca počinju sa „je dozvoljeno samo ako…" (ako ne ometaju druge; ako napred nisu crveni, a pozadi beli).</span> Udvojeni istovetni svetlosni uređaji na vozilu sa tri ili više točkova moraju biti <b>iste veličine i boje I dejstvovati ujednačenim intenzitetom</b> — sve troje zajedno, tako da je svaki odgovor sa „ne moraju" netačan.</p>

<p><b>Kontrolne lampe na tabli:</b></p>
<table>
<tr><th>Kada uključiš</th><th>Šta mora da svetli</th></tr>
<tr><td><b>Duga</b> svetla</td><td><b>plava</b> kontrolna lampa, automatski <span class="mut">(mamci: žuta, zelena)</span></td></tr>
<tr><td><b>Kratka</b> svetla</td><td><b>ne mora biti uključena lampa bilo koje boje</b> <span class="mut">(mamci: žuta, zelena)</span></td></tr>
</table>
<p>Ugradnja te plave lampe na motociklima je <b>obavezna, osim na motociklima čija radna zapremina motora ne prelazi 50 cm³</b>; na <b>lakim četvorociklima nije obavezna</b>. Kod vozila prvi put registrovanih u Srbiji <b>pre 1. jula 2011.</b> kontrola uključenosti pokazivača pravca obezbeđuje se <b>optičkom ILI zvučnom</b> napravom. <span class="mut">Mamac je „optičkom I zvučnom" — razlika je jedno slovo.</span></p>

<p><b>Kočenje — kod dvotočkaša manje funkcija, ali više točkova:</b></p>
<table>
<tr><th>Pitanje</th><th>Tačno</th><th>Mamac</th></tr>
<tr><td>Kočni sistem mopeda i motocikla mora da ostvari funkcije</td><td><b>radnog kočenja</b>, i to je sve</td><td>odgovori koji dodaju pomoćno i parkirno kočenje</td></tr>
<tr><td>Radno kočenje mopeda, motocikla, tricikla i četvorocikla dejstvuje</td><td><b>na SVE točkove</b></td><td>„najmanje na točkove pogonske osovine", „samo na gonjenu"</td></tr>
<tr><td>Stop svetla se uključuju pri aktiviranju</td><td><b>radnog kočenja</b></td><td>parkirnog kočenja; dugotrajnog usporavanja</td></tr>
<tr><td>Stop svetlo ne moraju imati vozila koja na ravnom putu ne mogu preko</td><td><b>25 km/h</b></td><td>30 km/h, 45 km/h</td></tr>
</table>
<p class="mut">Isto „na sve točkove" važi i za vozila za prevoz putnika, teretna i priključna vozila — izuzeti su samo traktori, radne mašine i priključna vozila za traktor.</p>

<p><b>Zadnji katadiopteri</b> su uvek <b>crveni</b> i <b>nisu trouglasti</b> (trouglasti oblik je rezervisan za priključna vozila). Razlikuje se samo broj:</p>
<table>
<tr><th>Vozilo</th><th>Broj zadnjih katadioptera</th></tr>
<tr><td>Motorno vozilo na <b>dva točka</b>, i ono na tri točka koje <b>nije šire od 1,3 m</b></td><td><b>jedan</b></td></tr>
<tr><td><b>Motocikl sa tri točka</b></td><td><b>dva</b></td></tr>
<tr><td><b>Četvorocikl širi od 1 m</b></td><td><b>dva</b></td></tr>
</table>
<p class="mut">Prvo pogledaj <b>vrstu vozila</b>, pa tek onda širinu: „motocikl sa tri točka" ide na <b>dva</b> i kad širina uopšte nije navedena. Broj nije dovoljan — i pogrešne ponude znaju da kažu „dva", pa uvek proveri i da su katadiopteri <b>crveni</b> i da <b>nisu trouglasti</b>. Odgovor „ne moraju biti ugrađeni" nije tačan ni u jednom od ta tri pitanja.</p>

<p><b>Dimenzije i registarska tablica:</b></p>
<table>
<tr><th>Šta se meri</th><th>Granica</th></tr>
<tr><td>Najveća dozvoljena dužina mopeda, motocikla, tricikla i četvorocikla</td><td><b>4,00 m</b> <span class="mut">(mamci 5,00 i 3,00)</span></td></tr>
<tr><td>Najveća dozvoljena visina istih vozila</td><td><b>2,50 m</b> <span class="mut">(mamci 1,50 i 2,00)</span></td></tr>
<tr><td>Priključno vozilo koje vuče moped ili motocikl</td><td>ne sme biti šire od <b>jednog metra</b> <span class="mut">(mamac: „širine vozila koje ga vuče")</span></td></tr>
<tr><td>Nagib registarske tablice u odnosu na ravan upravnu na podlogu</td><td>najviše <b>30° prema gore</b> i <b>15° prema dole</b></td></tr>
</table>
<p class="mut">Kod tablice je u bazi ispao znak za stepen, pa u odgovorima piše „300 prema gore" i „150 prema dole" — to su uglovi 30° i 15°. Redosled je zamka: veći ugao ide <b>nagore</b>.</p>

<p><b>Oznaka pneumatika — razloži je jednom i pokrio si devet pitanja:</b></p>
<table>
<tr><th>Kod u oznaci <b>195/65 R 16 89 N</b></th><th>Šta znači</th><th>Kako to pitanje zove</th></tr>
<tr><td><b>195</b></td><td>širina pneumatika</td><td>dimenzija</td></tr>
<tr><td><b>65</b></td><td>odnos visine i širine, izražen u procentima</td><td>dimenzija</td></tr>
<tr><td><b>R</b></td><td>pneumatik je radijalni</td><td><b>konstrukcija</b></td></tr>
<tr><td><b>16</b></td><td>prečnik naplatka</td><td>dimenzija</td></tr>
<tr><td><b>89</b></td><td>oznaka nosivosti</td><td><b>indeks nosivosti</b></td></tr>
<tr><td><b>N</b></td><td>brzinska oznaka</td><td><b>indeks brzine</b></td></tr>
</table>
<p>Pitanje „dimenzije su iskazane kodovima" traži <b>dva</b> odgovora: <b>195/65 i 16</b>. R, 89 i N nisu dimenzije. Ista podela radi i na drugom primeru iz baze, 180/60 R 14 82 T.</p>
<p><b>Istrošenost:</b> <b>TWI</b> označava <b>položaj indikatora istrošenosti pneumatika</b> <span class="mut">(mamci: indeks nosivosti, indeks brzine, „namenjen za letnju upotrebu", „može da se protektira")</span>. Dubina gazećeg sloja mora biti <b>veća od dubine označene TWI oznakama, odnosno najmanje 1,6 mm ako TWI oznaka nema</b>. <span class="mut">Pazi na formulaciju pitanja. Ako pitanje ne pominje TWI („dubina gazećeg sloja… mora biti"), tačan odgovor prvo pominje TWI pa tek onda cifru — goli „najmanje 1,6 mm" je tu mamac. Ali ako pitanje samo kaže „kada ne postoji TWI oznaka", tačan odgovor je upravo gola cifra <b>1,6 mm</b>, a mamci su 2,0 i 4,0 mm.</span> Sami pneumatici moraju biti <b>dimenzija koje je deklarisao proizvođač vozila</b>, ne „najvećih koje mogu da stanu".</p>

<p><b>Oprema i sirena.</b> Oprema za pružanje prve pomoći veličine „A" mora postojati u <b>motociklima, teškim triciklima i teškim četvorociklima</b> — <b>moped je ne mora imati</b>, a mamac je upravo odgovor koji moped ubacuje u spisak. Uređaj za davanje zvučnih znakova mora proizvoditi zvuk <b>čija je jačina u propisanim granicama</b>: ni „što veće jačine", ni „jačina nije propisana".</p>

<p><b>Tri oznake koje dolaze kao slika</b> — pitanje je uvek isto, koju vrstu vozila označavaju:</p>
<div class="signRow lineRow">
  <div class="signCell"><svg viewBox="0 0 150 44" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="134" height="28" fill="#f3c000"/>
    <g fill="#d81f26">
      <polygon points="8,10 10,8 8,8"/>
      <polygon points="8,20 8,30 30,8 20,8"/>
      <polygon points="12,36 22,36 50,8 40,8"/>
      <polygon points="32,36 42,36 70,8 60,8"/>
      <polygon points="52,36 62,36 90,8 80,8"/>
      <polygon points="72,36 82,36 110,8 100,8"/>
      <polygon points="92,36 102,36 130,8 120,8"/>
      <polygon points="140,8 112,36 122,36 142,16 142,8"/>
      <polygon points="132,36 142,36 142,26"/>
    </g>
    <rect x="4" y="4" width="142" height="36" fill="none" stroke="#e8b400" stroke-width="4"/>
  </svg><b>TEŠKA vozila</b><span>pravougaonik: naizmenične kose <b>crvene i žute</b> pruge preko celog polja, uz tanak žuti obod</span></div>
  <div class="signCell"><svg viewBox="0 0 150 44" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="134" height="28" fill="#f3c000"/>
    <rect x="5" y="5" width="140" height="34" fill="none" stroke="#d81f26" stroke-width="6"/>
  </svg><b>DUGA vozila</b><span>isti pravougaonik, ali čisto <b>žuto polje bez pruga</b>, uokvireno <b>širokom crvenom trakom</b></span></div>
  <div class="signCell"><svg viewBox="0 0 150 140" xmlns="http://www.w3.org/2000/svg">
    <polygon points="53,20 97,20 137,116 127,130 23,130 13,116" fill="#d81f26" stroke="#111" stroke-width="3"/>
    <polygon points="75,38 116,116 34,116" fill="#f0821c"/>
  </svg><b>SPORA vozila</b><span>trougao zasečenih uglova: crveni okvir, narandžasta sredina</span></div>
</div>
<p class="mut">Razlikuj ih po polju i obodu: <b>kose crveno-žute pruge preko celog polja = TEŠKA</b> vozila (obod je tanak i žut), a <b>čisto žuto polje u širokom crvenom okviru = DUGA</b> vozila; jedina tabla u obliku trougla je ona za <b>spora</b> vozila.</p>

<p class="mut"><b>Rezime mamaca u ovoj oblasti:</b> „najmanje" umesto „najviše" kod magle, 40 m umesto 10–50 m kod mopeda, „bela ili žuta" kod dnevnih svetala, „boju određuje proizvođač", „optička I zvučna", trouglasti katadiopteri, goli „1,6 mm" bez pominjanja TWI, i moped ubačen u spisak vozila koja moraju imati opremu prve pomoći.</p>
`,
};

// --- vozac-zdravlje-alkohol (Tura 4; kontrola bez blokirajućih nalaza) ---
CARDS['svetlosne-oznake'] = {
  title: 'Svetlosne oznake na putu — smerokazi, štapovi, table',
  html: `
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
`,
};

CARDS['vozac-zdravlje-alkohol'] = {
  title: 'Vozač — zdravlje, umor i alkohol',
  html: `<p><b>Osam pitanja, i jedno od njih te sigurno čeka.</b> Po izmerenom zvaničnom šablonu testa za A kategoriju, ova oblast ima <b>fiksni slot</b> — jedno pitanje, uvek <b>3 poena</b>. U bazi postoji svega 8 takvih pitanja i <b>svih 8 vredi po tri poena</b>. Test ima 41 pitanje i 98 poena, a prolaz je 84 — smeš da izgubiš svega 14 poena, pa ti jedan promašaj ovde pojede više od petine cele rezerve. A celo gradivo staje u četiri pravila.</p>

<table>
<tr><th>Pravilo</th><th>Šta ti nude kao mamac</th></tr>
<tr><td><b>1. Vozač A kategorije ne sme da ima alkohola u krvi</b> — nula <span class="mut">(zakon govori i o alkoholu u organizmu, ali odgovori u bazi glase „u krvi")</span></td><td>„sme najviše do 0,30 mg/ml", „sme najviše do 0,50 mg/ml"</td></tr>
<tr><td><b>2. Umoran, bolestan ili u lošem psihičkom stanju — ne sme da vozi</b>, bez ijednog izuzetka</td><td>„na kratkom delu puta", „ako time ne ometa, odnosno ne ugrožava druge", „ne sme <b>samo</b> na javnom putu"</td></tr>
<tr><td><b>3. Umor i bolest se utvrđuju stručnim pregledom</b></td><td>„neposrednim uvidom policijskog službenika", „pomoću odgovarajućih uređaja"</td></tr>
<tr><td><b>4. Kontrolni zdravstveni pregled: osnov je SUMNJA, cena neodazivanja je ODUZIMANJE dozvole</b></td><td>„jer je učestvovao u nezgodi", „jer je učinio više prekršaja", „privremeno će mu se zabraniti upravljanje"</td></tr>
</table>

<p class="mut"><b>Mamac koji ne ublažava nego sužava:</b> uz pitanje o vožnji pod dejstvom alkohola ponuđeno je i „ne sme da upravlja vozilom <b>samo</b> u saobraćaju na javnom putu". I to je netačno — zabrana važi na <b>svakom putu</b>, a javni put je samo jedna vrsta puta. Tačan odgovor glasi jednostavno: „ne sme da upravlja vozilom u saobraćaju na putu".</p>

<p><b>1. Nula alkohola (ZOBS čl. 187).</b> Opšte pravilo kaže da je „pod dejstvom alkohola" onaj kome se utvrdi sadržaj <b>veći od 0,20 mg/ml</b>. Tebe to ne dodiruje: vozači kategorija <b>AM, A1, A2 i A</b> su na zakonskoj listi onih kojima nije dozvoljena nijedna kap.</p>

<div class="vgrid" style="grid-template-columns:1fr 1fr">
  <div class="vg vgFast"><b>TI — moped i motocikl (AM, A1, A2, A)</b></div><div class="vg vgSlow"><b>Ostali vozači (npr. B kategorija)</b></div>
  <div class="vg">Ne sme da ima alkohola u organizmu — <b>0,00</b></div>
  <div class="vg">Pod dejstvom alkohola je tek <b>preko 0,20 mg/ml</b></div>
</div>
<p class="mut">Ni ta granica od 0,20 nije „dozvoljena čašica" — ona samo definiše od kada si po zakonu pod dejstvom alkohola. Za tebe na dvotočkašu ni nje nema. Zato se 0,20 u bazi nikada i ne pojavljuje kao ponuđen odgovor, a odgovori tipa „sme najviše do 0,30 / 0,50 mg/ml" ponuđeni su četiri puta i nijednom nisu tačni.</p>

<p><b>Ko sve mora imati nulu</b> — vredi pročitati celu listu iz istog člana, jer se pitanja prave tako što se iz nje neko izbaci ili se ubaci neko ko na njoj nije:</p>
<table>
<tr><td>Vozač vozila kategorija <b>AM, A1, A2 i A</b> — dakle <b>moped i motocikl</b></td></tr>
<tr><td><b>Kandidat za vozača</b> tokom praktične obuke i polaganja praktičnog ispita</td></tr>
<tr><td><b>Instruktor vožnje</b> kada obavlja praktičnu obuku i <b>ispitivač</b> na praktičnom ispitu</td></tr>
<tr><td>Vozač sa <b>probnom vozačkom dozvolom</b> i lice koje ga nadzire</td></tr>
<tr><td>Vozač vozila <b>pod pratnjom</b> i vozila <b>sa pravom prvenstva prolaza</b></td></tr>
<tr><td>Javni prevoz lica ili stvari; vozilo registrovano za više od osam lica osim vozača, odnosno najveće dozvoljene mase preko 3.500 kg; prevoz opasnih materija i vanredni prevoz</td></tr>
</table>
<p><b>Dve zamke iz te liste:</b> na listi je vozač sa probnom <b>DOZVOLOM</b>, a ne „vozač vozila kojim se vrši <b>probna vožnja</b>" — to je netačan odgovor. Nema ni <b>vozača motokultivatora</b>. U pitanju sa dva tačna odgovora tražena su baš <b>kandidat tokom praktične obuke</b> i <b>vozač motocikla i mopeda</b>.</p>
<p class="mut">Zabrana važi i pre polaska: pod dejstvom alkohola ili psihoaktivnih supstanci ne smeš ni da <b>počneš</b> da upravljaš, a smatra se da upravljaš vozilom onog trenutka kada si ga pokrenuo sa mesta na putu.</p>

<p><b>2. Umor, bolest, psihičko stanje.</b> Ko nije sposoban da bezbedno upravlja — <b>ne sme da vozi, i tu se rečenica završava</b>. Ublažavajući nastavci („na kratkom delu puta", „ako time ne ometa, odnosno ne ugrožava druge učesnike") u zakonu ne postoje. „Na kratkom delu puta" je u celoj bazi ponuđen tri puta i nijednom nije tačan — a dva od ta tri puta su baš ovde. Isti obrazac imaš na kartici „Zamke u ponuđenim odgovorima".</p>

<p><b>3. Čime se šta utvrđuje.</b> Ovo pitanje se najlakše promaši, jer se u ponuđenim odgovorima mešaju aparat i pregled:</p>
<table>
<tr><th>Šta se utvrđuje</th><th>Čime</th></tr>
<tr><td>Umor, bolest, psihofizičko stanje</td><td><b>Stručnim pregledom</b> — ne neposrednim uvidom policajca i ne uređajem</td></tr>
<tr><td>Alkohol i psihoaktivne supstance</td><td><b>Alkometrom, droga testom</b> i sličnim sredstvima na licu mesta; ako osporavaš rezultat, možeš tražiti analizu krvi, odnosno krvi i urina — pismeno, na licu mesta, u zapisnik</td></tr>
</table>
<p class="mut">Stručni pregled je po zakonu (čl. 281) pregled kojim se utvrđuju znaci poremećenosti u ponašanju koji mogu da prouzrokuju nebezbedno ponašanje u saobraćaju; na njemu stručno lice može odrediti i analizu telesnih materija. Pamti kratko: <b>aparat meri alkohol, stručno lice procenjuje stanje.</b></p>

<p><b>Detalj koji se tiče baš dvotočkaša:</b> policijski službenik sme alkometru da podvrgne i <b>lice koje se prevozi</b> na biciklu, mopedu, triciklu odnosno motociklu (čl. 280) — a ti kao vozač mopeda, tricikla ili motocikla <b>ne smeš da prevoziš lice pod uticajem alkohola ni psihoaktivnih supstanci</b>. Za to odgovara <b>vozač</b> — putnikovo stanje postaje tvoja obaveza.</p>

<p><b>4. Kontrolni zdravstveni pregled (čl. 191 i 192).</b> Osnov je jedan jedini: <b>sumnja</b> da zbog psihofizičkih smetnji, odnosno nedostataka, nisi u stanju bezbedno da upravljaš. Ni saobraćajna nezgoda, ni broj prekršaja u toku godine nisu zakonski osnov.</p>
<table>
<tr><th>Pitanje</th><th>Odgovor iz zakona</th></tr>
<tr><td>Ko se upućuje?</td><td>Vozač (i instruktor vožnje) za koga se <b>posumnja</b> da zbog psihofizičkih smetnji, odnosno nedostataka, nije u stanju bezbedno da upravlja vozilom</td></tr>
<tr><td>Ko može tražiti upućivanje?</td><td>Nadležna jedinica MUP, inspektor za drumski saobraćaj, javni tužilac, organ ovlašćen za vođenje prekršajnog postupka, poslodavac kod koga je vozač zaposlen, Agencija za bezbednost saobraćaja</td></tr>
<tr><td>Šta stoji u rešenju?</td><td>Zdravstvena ustanova koja vrši pregled i <b>rok</b> za izvršenje; žalba na rešenje <b>ne odlaže</b> izvršenje</td></tr>
<tr><td>Ne odazoveš se u roku?</td><td><b>Oduzima ti se vozačka dozvola</b></td></tr>
<tr><td>Odazoveš se, ali pregled pokaže nesposobnost?</td><td>Takođe <b>oduzimanje</b> — ali samo za kategorije na koje se nesposobnost odnosi; za ostale ti se izdaje dozvola</td></tr>
</table>
<p class="mut">I lekar koji te pregleda ili leči, ako osnovano posumnja da nisi sposoban da upravljaš, dužan je da o tome pismeno obavesti nadležnu jedinicu MUP odmah, a najkasnije u roku od 15 dana (čl. 193).</p>

<p><b>Ne mešaj tri mere</b> — test ih namerno nudi jednu umesto druge:</p>
<table>
<tr><th>Mera</th><th>Kad nastupa</th><th>Šta ti se dešava</th></tr>
<tr><td>Privremeno <b>isključenje</b> vozača iz saobraćaja</td><td>Na licu mesta: očigledan umor ili bolest, alkohol, odbijanje ispitivanja ili stručnog pregleda</td><td>Ne smeš da voziš dok mera traje — <b>dozvola ostaje tvoja</b></td></tr>
<tr><td><b>Oduzimanje dozvole</b> zbog zdravlja</td><td>Nisi se odazvao kontrolnom pregledu u roku, ili je na njemu utvrđena nesposobnost</td><td>Gubiš pravo da upravljaš vozilima tih kategorija</td></tr>
<tr><td><b>Oduzimanje dozvole</b> zbog kaznenih poena</td><td>Kad skupiš zakonski prag poena</td><td>Vidi karticu o dozvolama</td></tr>
</table>

<p><b>Veza sa karticom „Vozačka dozvola, kazneni poeni i probna dozvola":</b> tamo, u tabeli probne dozvole, stoji red „Alkohol 0,00". Ovde vidiš odakle ta nula i zašto ti probna dozvola tu ništa ne dodaje — kao vozač <b>A kategorije</b> ti si na listi nulte tolerancije po sopstvenom osnovu, iz istog člana. Probna dozvola ti obara brzine, ne alkohol: alkohol ti je nula i sa njom i bez nje.</p>
<p class="mut">Dalje: šta policija radi na licu mesta — kartica „Isključenje vozača iz saobraćaja i zadržavanje"; kolika je sankcija — kartica „Kaznene klase".</p>`,
};

CARDS['kretanje-po-putu'] = {
  title: 'Kretanje po putu i uključivanje u saobraćaj',
  html: `
<p><b>Osnovno (čl. 35):</b> vozilo se kreće <b>desnom stranom kolovoza</b> i drži se <b>što bliže desnoj ivici</b> —
toliko blizu da, s obzirom na brzinu i stanje puta, ne ugrožava druge ni sebe.</p>
<p><b>U naselju, kad za tvoj smer ima najmanje dve trake</b>, smeš i trakom koja nije uz desnu ivicu — ali samo
ako time <b>ne ometaš one iza sebe</b>. To ne važi za teretno vozilo preko 3.500 kg, za vozilo koje na ravnom
putu ne može preko 40 km/h i za vozila koja nisu motorna: oni ostaju desno, osim pred raskrsnicom, pred
skretanjem ulevo i pri preticanju.</p>

<p style="margin-top:10px"><b>Dvosmerni put — koja traka sme, a koja ne (čl. 36):</b></p>
<table>
<tr><th>Kakav je put</th><th>Pravilo</th><th>Zamka</th></tr>
<tr><td><b>TRI</b> saobraćajne trake</td><td>traka uz <b>levu ivicu</b> puta u tvom smeru je <b>zabranjena</b></td><td>zabrana nema izuzetak — <b>ni za preticanje ni za obilaženje ni zbog zastoja</b>; pretiče se srednjom trakom</td></tr>
<tr><td><b>ČETIRI</b> i više traka</td><td>ne smeš da se krećeš ni da prelaziš na kolovoznu traku za suprotan smer</td><td>„samo da zaobiđem" ne postoji</td></tr>
<tr><td>kolovozne trake <b>fizički odvojene</b></td><td>ne smeš na traku namenjenu suprotnom smeru</td><td>—</td></tr>
<tr><td><b>jednosmerni</b> put</td><td>ne smeš da se krećeš u zabranjenom smeru</td><td>ni unazad, ni „kratko"</td></tr>
<tr><td>traka se <b>završava</b> ili je na njoj saobraćaj onemogućen</td><td>vozač u traci pored dužan je da omogući uključenje <b>jednog</b> vozila</td><td>jednog, ne kolone</td></tr>
</table>

<p style="margin-top:10px"><b>Pre svake radnje (čl. 32):</b> uključivanje u saobraćaj, promena trake, prestrojavanje,
skretanje, polukružno okretanje, obilaženje, preticanje, vožnja unazad, isključenje, zaustavljanje i parkiranje
smeju da počnu tek <b>kad se uveriš</b> da radnju možeš da izvedeš bezbedno i propisno. O nameri obaveštavaš
<b>jasno i blagovremeno</b> pokazivačem pravca (ako ga nema — znakom rukom), znak daješ <b>sve vreme</b> radnje
i prestaješ čim je završiš.</p>
<p><b>Naglo menjanje načina vožnje</b> (naglo kočenje, usporavanje, skretanje) dozvoljeno je <b>samo radi
izbegavanja neposredne opasnosti</b>. Sve ostalo mora postepeno i predvidivo — zato „nisam na vreme zauzeo
položaj" nikad nije opravdanje.</p>
<p><b>Uključivanje iz dvorišta ili garaže</b> kad je preglednost ili vidljivost nedovoljna (čl. 33): uključenje se
izvodi <b>uz pomoć lica van vozila</b> koje ti daje znakove.</p>
<p><b>U naselju</b> si dužan da omogućiš uključenje <b>autobusu koji propisno kreće sa stajališta</b> (čl. 27).</p>
<p class="mut">Pamtilica: desno koliko možeš, levu ivicu na dvosmernom nikad, i nijedna radnja ne počinje
pre nego što si siguran — a znak ide pre radnje, ne u toku nje.</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<!-- DODATAK kartici kretanje-po-putu. Uz svaku celinu stoji izvor: brojevi pitanja iz gradje. -->
<!-- Crtezi: sva platna su siroka 306 (= sirina tela kartice na telefonu od 375 px), pa je font-size u SVG-u jednak stvarnim px. Najmanji upotrebljen font-size je 11. -->
<!-- Animacije: klase animTrepti, animUkljuci, animPropusti, animKoridorTok — definicije idu u style.css (opisane u odgovoru). -->
<!-- izvor: 9616 (tri saobracajne trake), 9612 (najmanje cetiri saobracajne trake), 9619 (fizicki odvojene kolovozne trake), 9621 (zeleno ostrvo + plavi znak, pitanje sa slikom) -->
<div class="kPodH"><b class="kPodNaslov">Koja traka je tvoja</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 134" style="max-width:306px;width:100%" role="img" aria-label="Dvosmerni put sa tri saobraćajne trake, pogled odozgo. Traka uz levu ivicu puta u tvom smeru obojena je crveno, u njoj je strelica koja pokazuje suprotan smer, a preko nje je crveni krst. Srednja traka je slobodna i kroz nju vodi zelena putanja preticanja. Tvoje plavo vozilo je u traci uz desnu ivicu.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">DVOSMERNI · TRI SAOBRAĆAJNE TRAKE</text>
<rect x="8" y="20" width="290" height="72" rx="3" fill="#9aa7b4"/>
<rect x="8" y="20" width="290" height="24" fill="#c0392b" opacity=".3"/>
<path d="M14 44 H292 M14 68 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".85" fill="none"/>
<path d="M250 32 H200" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M200 27 L190 32 L200 37 Z" fill="currentColor"/>
<path d="M258 22 L286 42 M286 22 L258 42" stroke="#c0392b" stroke-width="3" fill="none"/>
<rect x="30" y="71" width="44" height="15" rx="4" fill="#2c6aa0"/>
<text x="52" y="82.5" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<path d="M80 78 H140" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M140 72 L152 78 L140 84 Z" fill="currentColor"/>
<path d="M158 78 C182 78 186 56 210 56" stroke="#1f7a3f" stroke-width="2.4" fill="none"/>
<path d="M222 56 L210 50 L210 62 Z" fill="#1f7a3f"/>
<text x="153" y="110" font-size="12" text-anchor="middle" fill="currentColor">traka uz LEVU ivicu nije tvoja</text>
<text x="153" y="126" font-size="12" text-anchor="middle" fill="currentColor">pretiče se SREDNJOM trakom</text>
</svg>
</div>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 162" style="max-width:306px;width:100%" role="img" aria-label="Dvosmerni put sa četiri saobraćajne trake, bez ikakve pregrade, pogled odozgo. Gornja polovina kolovoza, namenjena suprotnom smeru, obojena je crveno, u njoj su dve strelice suprotnog smera i preko nje je crveni krst. Isprekidane bele linije nacrtane su samo između traka istog smera; na granici dva smera nema nikakve linije — tu se samo menja boja, iz crvene u sivu. Tvoje plavo vozilo je u traci uz desnu ivicu.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">DVOSMERNI PUT</text>
<text x="153" y="31" font-size="12" text-anchor="middle" fill="currentColor">NAJMANJE ČETIRI SAOBRAĆAJNE TRAKE</text>
<rect x="8" y="36" width="290" height="72" rx="3" fill="#9aa7b4"/>
<rect x="8" y="36" width="290" height="36" fill="#c0392b" opacity=".3"/>
<path d="M14 54 H292 M14 90 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".85" fill="none"/>
<path d="M250 45 H200 M250 63 H200" stroke="currentColor" stroke-width="2" fill="none"/>
<path d="M200 40.5 L191 45 L200 49.5 Z M200 58.5 L191 63 L200 67.5 Z" fill="currentColor"/>
<path d="M258 44 L286 64 M286 44 L258 64" stroke="#c0392b" stroke-width="3" fill="none"/>
<rect x="96" y="74" width="44" height="14" rx="4" fill="#2a333d"/>
<path d="M148 81 H190" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M190 75 L202 81 L190 87 Z" fill="currentColor"/>
<rect x="30" y="92" width="44" height="14" rx="4" fill="#2c6aa0"/>
<text x="52" y="102.5" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<path d="M80 99 H140" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M140 93 L152 99 L140 105 Z" fill="currentColor"/>
<text x="153" y="126" font-size="12" text-anchor="middle" fill="currentColor">suprotna kolovozna traka je zabranjena</text>
<text x="153" y="142" font-size="12" text-anchor="middle" fill="currentColor">i onda kad nema nikakve pregrade</text>
<text x="153" y="158" font-size="12" text-anchor="middle" fill="currentColor">o vrsti linije ovo pitanje ne govori</text>
</svg>
</div>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 130" style="max-width:306px;width:100%" role="img" aria-label="Dve kolovozne trake fizički odvojene zelenim ostrvom, pogled odozgo. Gornja kolovozna traka, namenjena suprotnom smeru, obojena je crveno, u njoj je strelica suprotnog smera i preko nje je crveni krst. Zeleno ostrvo naleže na obe kolovozne trake, bez razmaka. Tvoje plavo vozilo je u donjoj kolovoznoj traci.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">FIZIČKI ODVOJENE KOLOVOZNE TRAKE</text>
<rect x="8" y="20" width="290" height="28" rx="3" fill="#9aa7b4"/>
<rect x="8" y="20" width="290" height="28" rx="3" fill="#c0392b" opacity=".3"/>
<path d="M250 34 H200" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M200 29 L190 34 L200 39 Z" fill="currentColor"/>
<path d="M258 24 L286 44 M286 24 L258 44" stroke="#c0392b" stroke-width="3" fill="none"/>
<rect x="8" y="48" width="290" height="16" fill="#1f7a3f" opacity=".65"/>
<rect x="8" y="64" width="290" height="28" rx="3" fill="#9aa7b4"/>
<rect x="30" y="71" width="44" height="14" rx="4" fill="#2c6aa0"/>
<text x="52" y="81.5" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<path d="M80 78 H140" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M140 72 L152 78 L140 84 Z" fill="currentColor"/>
<text x="153" y="108" font-size="12" text-anchor="middle" fill="currentColor">zeleno ostrvo razdvaja smerove</text>
<text x="153" y="124" font-size="12" text-anchor="middle" fill="currentColor">prelazak je zabranjen — bez izuzetka</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">plavo = ti · crveno = zabranjeno · zelena strelica = dozvoljeno kretanje</p>
<p><b>Dva izraza, ne jedan.</b> Zabranjeni deo puta ne zove se u sva tri pitanja isto, pa se lako pomeša. Kod <b>tri</b> trake to je <b>saobraćajna traka koja se nalazi uz levu ivicu puta u pravcu kretanja vozila</b>; kod <b>najmanje četiri</b> trake i kod <b>fizički odvojenih</b> kolovoznih traka to je <b>kolovozna traka namenjena za saobraćaj vozila iz suprotnog smera</b>. Ni uslov nije uvek broj traka: u trećem pitanju se nikakav broj ne pominje — dovoljno je da su kolovozne trake fizički odvojene.</p>
<table>
<tr><th>Kako pitanje opisuje put</th><th>Šta ti je zabranjeno — rečima iz pitanja</th><th>Gde je to na crtežu</th></tr>
<tr><td>oba smera, <b>TRI</b> saobraćajne trake</td><td><b>saobraćajna traka</b> koja se nalazi <b>uz levu ivicu puta</b> u pravcu tvog kretanja</td><td>1. crtež — crvena traka na vrhu</td></tr>
<tr><td>oba smera, <b>NAJMANJE ČETIRI</b> saobraćajne trake</td><td><b>kolovozna traka namenjena za saobraćaj vozila iz suprotnog smera</b></td><td>2. crtež — crvena polovina, bez ikakve pregrade</td></tr>
<tr><td>oba smera, <b>FIZIČKI ODVOJENE</b> kolovozne trake <i>(broj traka se ne pominje)</i></td><td><b>kolovozna traka namenjena za saobraćaj vozila iz suprotnog smera</b></td><td>3. crtež — iza zelenog ostrva</td></tr>
</table>
<p>U sva tri pitanja netačne ponude su <b>iste dve</b>: „u slučaju <b>preticanja ili obilaženja</b>" i „u slučaju <b>zastoja</b>". Nijedna od njih ne otključava ništa — zabrana je <b>bezuslovna</b> u sva tri slučaja.</p>
<p class="mut">Samo kod <b>tri</b> trake objašnjenje ide korak dalje i kaže gde se onda pretiče: <b>srednjom</b> trakom, po opštim pravilima preticanja. Kod četiri trake i kod fizički odvojenih kolovoznih traka srednje trake nema — tu se pretiče levom trakom <b>svoje</b> kolovozne trake.</p>
<p><b>Pitanje sa slikom:</b> zeleno ostrvo i plavi znak zajedno.</p>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 166" style="max-width:306px;width:100%" role="img" aria-label="Situacija sa slike: dve kolovozne trake razdvojene zelenim ostrvom. Tvoje plavo vozilo nacrtano je u gornjoj kolovoznoj traci, onoj namenjenoj suprotnom smeru, i preko njega je veliki crveni krst. U toj traci je i strelica koja pokazuje da ona vodi u suprotnom smeru. Na ostrvu stoji plavi okrugli znak sa belom strelicom ukošenom naviše nadesno. U donjoj kolovoznoj traci je zelena strelica koja pokazuje gde je trebalo da budeš.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">SA SLIKE: KREĆEŠ SE NEPROPISNO</text>
<rect x="8" y="22" width="290" height="32" rx="3" fill="#9aa7b4"/>
<path d="M280 38 H230" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M230 33 L220 38 L230 43 Z" fill="currentColor"/>
<rect x="104" y="30" width="62" height="16" rx="4" fill="#2c6aa0"/>
<text x="120" y="42" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<path d="M138 26 L176 50 M176 26 L138 50" stroke="#c0392b" stroke-width="3.4" fill="none"/>
<rect x="8" y="54" width="290" height="26" fill="#1f7a3f" opacity=".65"/>
<circle cx="44" cy="67" r="12" fill="#2c6aa0"/>
<path d="M37 73 L47 63" stroke="#fff" stroke-width="3.5" fill="none"/>
<path d="M53 57 L43 60 L50 67 Z" fill="#fff"/>
<rect x="8" y="80" width="290" height="32" rx="3" fill="#9aa7b4"/>
<path d="M100 96 H180" stroke="#1f7a3f" stroke-width="3" fill="none"/>
<path d="M192 96 L180 90 L180 102 Z" fill="#1f7a3f"/>
<text x="153" y="130" font-size="12" text-anchor="middle" fill="currentColor">ti si na kolovoznoj traci suprotnog smera</text>
<text x="153" y="146" font-size="12" text-anchor="middle" fill="currentColor">znak: prepreku obilaziš S DESNE strane</text>
<text x="153" y="162" font-size="12" text-anchor="middle" fill="currentColor">tvoja je ona sa zelenom strelicom</text>
</svg>
</div>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="plavi okrugli znak sa belom strelicom ukošenom naviše nadesno"><circle cx="39" cy="34" r="26" fill="#2c6aa0"/><path d="M28 45 L47 26" stroke="#fff" stroke-width="5" fill="none"/><path d="M56 17 L40 21 L52 33 Z" fill="#fff"/></svg>
    <b>PLAVI KRUG · STRELICA NADESNO</b><span>prepreka se obilazi s desne strane — tvoja kolovozna traka je ona desno</span>
  </div>
</div>
<p>Kad su smerovi razdvojeni <b>zelenim ostrvom</b>, taj plavi okrugli znak sa strelicom nadesno govori ti da prepreku obiđeš <b>s desne strane</b>. Ako si sa leve strane ostrva, na kolovoznoj traci namenjenoj suprotnom smeru, krećeš se <b>nepropisno</b> — i tu izuzetka za preticanje nema.</p>
<p class="mut">Vrsta linije ne pominje se ni u jednom od ova tri pitanja — zato granicu smerova na crtežima ne obeležava nikakva linija, nego samo boja. Linija odlučuje u drugoj vrsti pitanja, o <b>razdelnoj</b> liniji, i ona je niže.</p>
</div>
<!-- izvor: 9593 + 9603 (cetiri netacne ponude), 9592 (zuta traka), 9600 (propustanje promenom trake u naselju) -->
<div class="kPodH"><b class="kPodNaslov">Desno — ali unutar trake koja je tvoja</b>
<p>Osnovno pravilo — <b>desna strana kolovoza</b>, <b>što bliže desnoj ivici</b> — napadaju <b>četiri</b> netačne ponude, po dve u svakom od dva pitanja:</p>
<ul>
<li>„sredinom kolovoza, jer na taj način ne ugrožava pešake i bicikliste"</li>
<li>„levom stranom kolovoza u smeru kretanja"</li>
<li>„sredinom kolovozne trake"</li>
<li>„što bliže razdelnoj liniji"</li>
</ul>
<p class="mut">Prve dve idu uz pitanje o <b>strani kolovoza</b>, druge dve uz pitanje o tome <b>čemu si blizu</b>. Odgovor je oba puta desno: desna strana, desna ivica.</p>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 140" style="max-width:306px;width:100%" role="img" aria-label="Dve saobraćajne trake u istom smeru. Donja traka, uz desnu ivicu, prekrivena je žutom bojom; u njoj je tvoje plavo vozilo i preko njega je crveni krst. Gornjom trakom se kreće drugo vozilo. Nijedan natpis ne stoji na samom kolovozu — svi su iznad i ispod njega.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">TRAKA ZA JAVNI PREVOZ I TAKSI</text>
<rect x="8" y="20" width="290" height="64" rx="3" fill="#9aa7b4"/>
<rect x="8" y="52" width="290" height="32" fill="#e8b000" opacity=".3"/>
<path d="M14 52 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".85" fill="none"/>
<rect x="130" y="28" width="46" height="16" rx="4" fill="#2a333d"/>
<path d="M184 36 H222" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M222 30 L234 36 L222 42 Z" fill="currentColor"/>
<rect x="30" y="60" width="58" height="15" rx="4" fill="#2c6aa0"/>
<text x="44" y="71.5" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<path d="M58 54 L96 82 M96 54 L58 82" stroke="#c0392b" stroke-width="3.4" fill="none"/>
<text x="153" y="102" font-size="12" text-anchor="middle" fill="currentColor">žuta boja i natpisi na kolovozu</text>
<text x="153" y="118" font-size="12" text-anchor="middle" fill="currentColor">moped i motocikl tu ne spadaju</text>
<text x="153" y="134" font-size="12" text-anchor="middle" fill="currentColor">kretanje je nepropisno</text>
</svg>
</div>
<p><b>Žuta traka za javni prevoz:</b> traka obeležena <b>žutom bojom i natpisima</b> namenjena je vozilima javnog prevoza i taksi vozilima, a moped odnosno motocikl u njih ne spada — krećeš se površinom koja <b>nije namenjena vozilu kojim upravljaš</b>, dakle nepropisno. Ne daje ti dodatno pravo ni to što je vozilo za osposobljavanje kandidata za vozača, a ne pomaže ni „ipak sam na desnoj strani kolovoza": desno se držiš <b>unutar traka koje smeš da koristiš</b>.</p>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 122" style="max-width:306px;width:100%" role="img" aria-label="Dve saobraćajne trake u istom smeru, u naselju. Tvoje plavo vozilo je u gornjoj, levoj traci; ispred njega je drugo vozilo koje ga sprečava u bržem kretanju. Zelena strelica pokazuje kako to vozilo prelazi u donju, desnu traku i propušta te.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">U NASELJU · SPREČAVA TE</text>
<rect x="8" y="20" width="290" height="64" rx="3" fill="#9aa7b4"/>
<path d="M14 52 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".85" fill="none"/>
<rect x="26" y="28" width="46" height="16" rx="4" fill="#2c6aa0"/>
<text x="49" y="40" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<path d="M80 36 H118" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M118 30 L130 36 L118 42 Z" fill="currentColor"/>
<g class="animPropusti"><rect x="142" y="28" width="46" height="16" rx="4" fill="#2a333d"/></g>
<path d="M194 36 C220 36 226 48 230 60" stroke="#1f7a3f" stroke-width="2.6" fill="none"/>
<path d="M230 72 L222 58 L238 58 Z" fill="#1f7a3f"/>
<text x="153" y="102" font-size="12" text-anchor="middle" fill="currentColor">dužan je da te propusti</text>
<text x="153" y="118" font-size="12" text-anchor="middle" fill="currentColor">promenom saobraćajne trake</text>
</svg>
</div>
<p><b>U naselju</b>, ako se vozilo ispred tebe kreće trakom koja nije uz desnu ivicu i time te <b>sprečava u bržem kretanju</b>, dužno je da te propusti <b>promenom saobraćajne trake</b>. Ne stoji izgovor da vozi najvećom dozvoljenom brzinom — pravilo se vezuje za <b>ometanje</b>, a ne za brzinomer. Ne stoji ni „preteci me zdesna": pretiče se s leve strane, a zdesna samo u posebnim, propisom određenim slučajevima.</p>
</div>
<!-- izvor: 9615 (dvostruka puna, cekanje isprekidanog dela), 9618 (kombinovana) -->
<div class="kPodH"><b class="kPodNaslov">Razdelna linija između smerova</b>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 62" role="img" aria-label="puna razdelna linija; strelica koja je prelazi precrtana je crvenim krstom"><rect x="2" y="8" width="116" height="46" rx="3" fill="#9aa7b4"/><path d="M8 31 H112" stroke="#fff" stroke-width="3" fill="none"/><path d="M60 50 V22" stroke="#c0392b" stroke-width="2.4" fill="none"/><path d="M60 10 L53 22 L67 22 Z" fill="#c0392b"/><path d="M52 28 L68 42 M68 28 L52 42" stroke="#c0392b" stroke-width="2.6" fill="none"/></svg>
    <b>PUNA</b><span>ne prelaziš — ni radi preticanja ni radi obilaženja</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 62" role="img" aria-label="dvostruka puna razdelna linija; strelice sa obe strane koje je prelaze precrtane su crvenim krstovima"><rect x="2" y="8" width="116" height="46" rx="3" fill="#9aa7b4"/><path d="M8 28 H112 M8 34 H112" stroke="#fff" stroke-width="2.6" fill="none"/><path d="M34 50 V22" stroke="#c0392b" stroke-width="2.2" fill="none"/><path d="M34 10 L28 22 L40 22 Z" fill="#c0392b"/><path d="M27 27 L41 41 M41 27 L27 41" stroke="#c0392b" stroke-width="2.4" fill="none"/><path d="M86 12 V40" stroke="#c0392b" stroke-width="2.2" fill="none"/><path d="M86 52 L80 40 L92 40 Z" fill="#c0392b"/><path d="M79 21 L93 35 M93 21 L79 35" stroke="#c0392b" stroke-width="2.4" fill="none"/></svg>
    <b>DVOSTRUKA PUNA</b><span>ne sme se preći ni sa jedne strane</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 62" role="img" aria-label="kombinovana razdelna linija: sa gornje strane je isprekidana i odatle zelena strelica sme da je pređe, sa donje strane je puna i strelica koja odatle prelazi precrtana je crvenim krstom"><rect x="2" y="8" width="116" height="46" rx="3" fill="#9aa7b4"/><path d="M8 34 H112" stroke="#fff" stroke-width="2.6" fill="none"/><path d="M8 27 H112" stroke="#fff" stroke-width="2.6" stroke-dasharray="8 6" fill="none"/><path d="M32 12 V40" stroke="#1f7a3f" stroke-width="2.4" fill="none"/><path d="M32 52 L26 40 L38 40 Z" fill="#1f7a3f"/><path d="M88 50 V22" stroke="#c0392b" stroke-width="2.4" fill="none"/><path d="M88 10 L82 22 L94 22 Z" fill="#c0392b"/><path d="M81 28 L95 42 M95 28 L81 42" stroke="#c0392b" stroke-width="2.6" fill="none"/></svg>
    <b>KOMBINOVANA</b><span>prelazi samo onaj kome je bliža isprekidana strana</span>
  </div>
</div>
<p>Preko <b>pune</b> razdelne linije se ne prelazi — ni radi preticanja, ni radi obilaženja; čeka se deo puta na kome je linija <b>isprekidana</b>. <b>Dvostruku punu</b> ne sme da pređe nijedna strana, pa su na crtežu precrtane obe strelice. Kod <b>kombinovane</b> gledaš koja je polovina okrenuta tebi: pređe je samo onaj kome je bliža <b>isprekidana</b> strana — zato je na crtežu jedna strelica zelena, a ona sa pune strane precrtana. Ako je sa tvoje strane puna, izlazak u levu traku je nepropisan i sa uključenim pokazivačem.</p>
<p class="mut">Pamtilica: uključen pokazivač ne pretvara zabranjenu radnju u dozvoljenu — on najavljuje nameru, ništa više.</p>
</div>
<!-- izvor: 9622 (netacne ponude: nema vozila iz suprotnog smera / najmanje dve trake), 9623 (znak sa slike i stanovanje) -->
<div class="kPodH"><b class="kPodNaslov">Jednosmerni put</b>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="saobraćajni znak: crveni krug sa belom vodoravnom prečkom"><circle cx="39" cy="34" r="26" fill="#c0392b"/><rect x="19" y="29" width="40" height="10" rx="2" fill="#fff"/></svg>
    <b>CRVENI KRUG · BELA PREČKA</b><span>zabranjuje ulazak u ulicu iz tog smera</span>
  </div>
</div>
<p>Na putu za saobraćaj vozila u <b>jednom smeru</b> ne smeš da se krećeš u smeru suprotnom od dozvoljenog. Ne otključava to ni „nema vozila iz suprotnog smera", ni „ima najmanje dve saobraćajne trake u tom smeru" — broj traka tu ništa ne menja.</p>
<p><b>Znak sa slike:</b> crveni krug sa belom vodoravnom prečkom zabranjuje <b>ulazak u ulicu iz tog smera</b>. Na toj slici je <b>postavljen sa obe strane kolovoza</b>, pa važi za celu širinu — vozilo se jednosmernom ulicom kreće u zabranjenom smeru. Zabrana <b>nema izuzetak po osnovu toga ko gde stanuje</b>: do kuće u toj ulici stiže se iz smera u kojem je saobraćaj dozvoljen, makar to značilo duži put oko bloka.</p>
</div>
<!-- izvor: 10454 (koridor spasa; tacan odgovor: vozila pod pratnjom i vozila sa pravom prvenstva prolaza) -->
<div class="kPodH"><b class="kPodNaslov">Zastoj — prolaz koji ostavljaš</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 188" style="max-width:306px;width:100%" role="img" aria-label="Zastoj na putu sa dve kolovozne trake koje su fizički odvojene zelenim ostrvom; ostrvo naleže na obe kolovozne trake, bez razmaka. U svakoj kolovoznoj traci vozila iz jedne saobraćajne trake stoje uz njenu jednu ivicu, a vozila iz druge uz drugu, pa u sredini ostaje slobodan prolaz označen zelenom strelicom. Tako je nacrtano u obe kolovozne trake. Tvoje vozilo je plavo, u donjoj kolovoznoj traci.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">ZASTOJ · ODVOJENE KOLOVOZNE TRAKE</text>
<rect x="8" y="20" width="290" height="56" rx="3" fill="#9aa7b4"/>
<path d="M14 48 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".35" fill="none"/>
<rect x="16" y="22" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="72" y="22" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="128" y="22" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="184" y="22" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="44" y="60" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="100" y="60" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="156" y="60" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="212" y="60" width="48" height="14" rx="4" fill="#2a333d"/>
<path d="M272 48 H52" stroke="#1f7a3f" stroke-width="3.2" fill="none" class="animKoridorTok"/>
<path d="M40 48 L54 41 L54 55 Z" fill="#1f7a3f"/>
<rect x="8" y="76" width="290" height="16" fill="#1f7a3f" opacity=".65"/>
<rect x="8" y="92" width="290" height="56" rx="3" fill="#9aa7b4"/>
<path d="M14 120 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".35" fill="none"/>
<rect x="16" y="94" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="72" y="94" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="128" y="94" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="184" y="94" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="44" y="132" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="100" y="132" width="48" height="14" rx="4" fill="#2c6aa0"/>
<text x="124" y="142.5" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<rect x="156" y="132" width="48" height="14" rx="4" fill="#2a333d"/>
<rect x="212" y="132" width="48" height="14" rx="4" fill="#2a333d"/>
<path d="M34 120 H254" stroke="#1f7a3f" stroke-width="3.2" fill="none" class="animKoridorTok"/>
<path d="M266 120 L252 113 L252 127 Z" fill="#1f7a3f"/>
<text x="153" y="166" font-size="12" text-anchor="middle" fill="currentColor">slobodan prolaz za vozila POD PRATNJOM</text>
<text x="153" y="182" font-size="12" text-anchor="middle" fill="currentColor">i za vozila SA PRAVOM PRVENSTVA PROLAZA</text>
</svg>
</div>
<p>U zastoju saobraćaja na putu sa <b>fizički odvojenim kolovoznim trakama</b> vozači su <b>uvek</b> dužni da zauzmu položaj <b>uz desnu, odnosno levu ivicu saobraćajne trake</b> i tako ostave slobodan prostor namenjen da, u slučaju potrebe, omogući prolaz <b>vozilima pod pratnjom i vozilima sa pravom prvenstva prolaza</b>. Reč <b>uvek</b> je u pitanju, pa nema situacije u kojoj se to preskače — zato je koridor nacrtan u <b>obe</b> kolovozne trake.</p>
<p>Taj prostor nije za „vozila koja vrše javni prevoz putnika", ni za „vozila čija širina omogućava kretanje tim prostorom".</p>
</div>
<!-- izvor: 9626 + 9630 (susedna traka zatvorena: duzan si, jedno vozilo), 9628 (najava i „zapocela radnju": nisi duzan), 9586 (auto-taksi sa parkinga, „zapoceo radnju", „javni prevoz": nisi duzan) -->
<div class="kPodH"><b class="kPodNaslov">Uključivanje u tvoju traku — kad si dužan, a kad nisi</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 104" style="max-width:306px;width:100%" role="img" aria-label="Saobraćajna traka pored tebe zatvorena je crvenom preprekom; u njoj su dva vozila, a prvo se zelenom strelicom uključuje u tvoju traku ispred tebe. Tvoje vozilo je plavo, u donjoj traci.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">TRAKA PORED TEBE JE ZATVORENA</text>
<rect x="8" y="20" width="290" height="56" rx="3" fill="#9aa7b4"/>
<rect x="8" y="20" width="290" height="28" fill="#c0392b" opacity=".22"/>
<path d="M14 48 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".85" fill="none"/>
<rect x="266" y="23" width="26" height="22" rx="3" fill="#c0392b" opacity=".85"/>
<g class="animUkljuci"><rect x="160" y="26" width="46" height="15" rx="4" fill="#2a333d"/><text x="183" y="37.5" font-size="12" text-anchor="middle" fill="#fff">1</text></g>
<rect x="96" y="26" width="46" height="15" rx="4" fill="#2a333d"/>
<text x="119" y="37.5" font-size="12" text-anchor="middle" fill="#fff">2</text>
<rect x="40" y="54" width="46" height="15" rx="4" fill="#2c6aa0"/>
<text x="63" y="65.5" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<path d="M210 34 C232 35 236 44 240 52" stroke="#1f7a3f" stroke-width="2.6" fill="none"/>
<path d="M240 64 L232 50 L248 50 Z" fill="#1f7a3f"/>
<text x="153" y="96" font-size="12" text-anchor="middle" fill="currentColor">DUŽAN SI — propuštaš jedno vozilo</text>
</svg>
</div>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 104" style="max-width:306px;width:100%" role="img" aria-label="Saobraćajna traka pored tebe se nastavlja, nije zatvorena. Dva vozila u njoj upaljenim žutim pokazivačem samo najavljuju ulazak u tvoju traku, a njihova namera nacrtana je isprekidanom strelicom. Tvoje vozilo je plavo, u donjoj traci.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">TRAKA PORED TEBE SE NASTAVLJA</text>
<rect x="8" y="20" width="290" height="56" rx="3" fill="#9aa7b4"/>
<path d="M14 48 H292" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".85" fill="none"/>
<rect x="84" y="26" width="46" height="15" rx="4" fill="#2a333d"/>
<circle cx="132" cy="42" r="4.5" fill="#e8b000" class="animTrepti"/>
<path d="M134 40 C152 42 156 47 158 55" stroke="currentColor" stroke-width="2" stroke-dasharray="6 5" opacity=".7" fill="none"/>
<path d="M158 66 L151 52 L165 52 Z" fill="currentColor" opacity=".7"/>
<rect x="176" y="26" width="46" height="15" rx="4" fill="#2a333d"/>
<circle cx="224" cy="42" r="4.5" fill="#e8b000" class="animTrepti"/>
<path d="M226 40 C244 42 248 47 250 55" stroke="currentColor" stroke-width="2" stroke-dasharray="6 5" opacity=".7" fill="none"/>
<path d="M250 66 L243 52 L257 52 Z" fill="currentColor" opacity=".7"/>
<rect x="22" y="54" width="46" height="15" rx="4" fill="#2c6aa0"/>
<text x="45" y="65.5" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<text x="153" y="96" font-size="12" text-anchor="middle" fill="currentColor">NISI dužan — samo najavljuju nameru</text>
</svg>
</div>
<p><b>Obaveza da omogućiš uključivanje u tvoju saobraćajnu traku ima tačno dva izvora:</b> susedna traka koja se <b>završava</b> ili u kojoj je <b>onemogućen saobraćaj</b> — tada za <b>jedno</b> vozilo — i <b>autobus koji propisno kreće sa stajališta u naselju</b>. Sve ostalo što ponude nude kao razlog nije na tom spisku i ne stvara ti tu obavezu.</p>
<table>
<tr><th>Šta se dešava pored tebe</th><th>Tvoja obaveza</th></tr>
<tr><td>Susedna traka se <b>završava</b> ili je u njoj <b>onemogućen saobraćaj</b></td><td><b>DUŽAN SI</b> — omogućavaš uključenje <b>jednog</b> vozila; sledeće pušta vozač iza tebe</td></tr>
<tr><td>Jedno ili više vozila ti pokazivačem samo <b>najavljuje</b> ulazak u tvoju traku</td><td><b>NISI</b> — najava sama po sebi ne stvara obavezu, ni za jedno ni za oba vozila</td></tr>
<tr><td>Vozilo je već <b>započelo</b> radnju uključivanja u saobraćaj</td><td><b>NISI</b> — započeta radnja nije na spisku razloga; ni jedno vozilo, ni oba koja su „započela izvođenje te radnje"</td></tr>
<tr><td><b>Auto-taksi</b> se sa parking mesta uključuje u saobraćaj</td><td><b>NISI</b> — parking mesto nije traka koja se završava, a ni „vozilo za javni prevoz putnika" nije razlog</td></tr>
</table>
<p><b>Gde onda „započeta radnja" ipak stoji:</b> u tačnom odgovoru, ali kao razlog <b>opreza</b>, a ne obaveze — nisi dužan, ali ćeš propustiti jer si nameru uočio <b>na vreme</b>, i tako izbeći opasnu situaciju <b>ukoliko vozač nastavi započetu radnju</b>. Ko to pomeša, izabraće ponudu „dužni ste… jer je vozilo započelo radnju uključivanja".</p>
<p>Kod zatvorene trake nije važno da li je ona <b>levo ili desno</b> od tebe — obaveza je ista i uvek za <b>jedno</b> vozilo. Netačno je i da propuštaš <b>sva</b> vozila redom, i da <b>imaš prvenstvo prolaza</b> nad vozilima iz trake u kojoj je saobraćaj onemogućen: kad bi ga imao, ta traka se nikad ne bi ispraznila.</p>
<p class="mut">Pamtilica: kad je susedna traka <b>zatvorena</b>, „niste dužni" je netačan odgovor — dužan si, za jedno vozilo. Kad se traka <b>nastavlja</b>, obaveze nemaš, ali tačan odgovor tu nije samo „niste dužni": ide sa nastavkom da ćeš ih ipak propustiti jer si nameru uočio na vreme i tako izbeći opasnu situaciju ako vozači nastave započetu radnju.</p>
</div>
<!-- izvor: 9575 + 9576 (skretanje udesno iz leve trake) -->
<div class="kPodH"><b class="kPodNaslov">Udesno se skreće iz desne trake</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 156" style="max-width:306px;width:100%" role="img" aria-label="Dve saobraćajne trake u istom smeru. Tvoje plavo vozilo je u levoj traci, sa upaljenim desnim pokazivačem; desnom trakom pored tebe kreće se drugo vozilo. Putanja skretanja udesno u sporednu ulicu nacrtana je crvenom isprekidanom linijom i precrtana crvenim krstom.">
<rect x="0" y="20" width="306" height="64" fill="#9aa7b4"/>
<rect x="186" y="84" width="56" height="52" fill="#9aa7b4"/>
<path d="M6 52 H300" stroke="#fff" stroke-width="2" stroke-dasharray="9 7" opacity=".85" fill="none"/>
<rect x="44" y="28" width="46" height="16" rx="4" fill="#2c6aa0"/>
<text x="67" y="40" font-size="12" text-anchor="middle" fill="#fff">ti</text>
<circle cx="92" cy="46" r="4.5" fill="#e8b000" class="animTrepti"/>
<rect x="54" y="60" width="46" height="16" rx="4" fill="#2a333d"/>
<path d="M108 68 H150" stroke="currentColor" stroke-width="2.2" fill="none"/>
<path d="M150 62 L162 68 L150 74 Z" fill="currentColor"/>
<path d="M96 40 C150 40 182 54 202 96" stroke="#c0392b" stroke-width="2.6" stroke-dasharray="7 6" fill="none"/>
<path d="M192 100 L232 132 M232 100 L192 132" stroke="#c0392b" stroke-width="4" fill="none"/>
<text x="153" y="152" font-size="12" text-anchor="middle" fill="currentColor">iz LEVE trake se ne skreće udesno</text>
</svg>
</div>
<p>Udesno se skreće iz položaja <b>uz desnu ivicu kolovoza</b>. Ako si u <b>levoj</b> traci, a desnom pored tebe se kreće drugo vozilo, <b>ne smeš da skreneš udesno</b> — ni kad si uključio pokazivač: pokazivač je najava namere, a ne pravo prolaza. Ne smeš ni <b>naglo da usporiš</b> da bi sebi napravio mesto za skretanje, jer se naglo usporava samo radi izbegavanja neposredne opasnosti.</p>
</div>
<!-- izvor: 9582 + 9583 (znak dok se uverava), 9580 (znak istovremeno / bez znaka), 10451 (samo znak / samo signalizacija), 9581 (samo na pocetku / dok drugi ne shvate), 9583 (levi pokazivac pri ukljucivanju sa desne ivice), 9589 (garaza na nepreglednom mestu), 9633 + 9635 + 10456 + 9574 (naglo; ponuda „nije blagovremeno zauzeo polozaj" stoji i u 9574 i u 10456) -->
<div class="kPodH"><b class="kPodNaslov">Znak i naglo kočenje — ponude koje padaju</b>
<div style="display:flex;justify-content:center;margin:6px 0">
<svg viewBox="0 0 306 98" style="max-width:306px;width:100%" role="img" aria-label="Traka od četiri koraka: prvi korak uveri se, drugi korak daj znak pokazivačem — ispod njega je žuta tačka koja trepće, treći korak radnja — žuta tačka i dalje trepće, četvrti korak kraj — tačka je ugašena.">
<rect x="2" y="6" width="68" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="36" y="28" font-size="14" text-anchor="middle" fill="currentColor">1</text>
<text x="36" y="44" font-size="11" text-anchor="middle" fill="currentColor">UVERI SE</text>
<path d="M70 28 L77 33 L70 38 Z" fill="currentColor"/>
<rect x="78" y="6" width="68" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="112" y="28" font-size="14" text-anchor="middle" fill="currentColor">2</text>
<text x="112" y="44" font-size="11" text-anchor="middle" fill="currentColor">DAJ ZNAK</text>
<circle cx="112" cy="53" r="4.5" fill="#e8b000" class="animTrepti"/>
<path d="M146 28 L153 33 L146 38 Z" fill="currentColor"/>
<rect x="154" y="6" width="68" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="188" y="28" font-size="14" text-anchor="middle" fill="currentColor">3</text>
<text x="188" y="44" font-size="11" text-anchor="middle" fill="currentColor">RADNJA</text>
<circle cx="188" cy="53" r="4.5" fill="#e8b000" class="animTrepti"/>
<path d="M222 28 L229 33 L222 38 Z" fill="currentColor"/>
<rect x="230" y="6" width="68" height="54" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
<text x="264" y="28" font-size="14" text-anchor="middle" fill="currentColor">4</text>
<text x="264" y="44" font-size="11" text-anchor="middle" fill="currentColor">KRAJ</text>
<circle cx="264" cy="53" r="4.5" fill="#2a333d"/>
<text x="153" y="78" font-size="12" text-anchor="middle" fill="currentColor">znak traje sve vreme radnje</text>
<text x="153" y="94" font-size="12" text-anchor="middle" fill="currentColor">i prestaje čim je završiš</text>
</svg>
</div>
<p>Redosled <b>uveri se → daj znak → izvedi radnju</b> već stoji na kartici. Ovo su ponude koje uz njega padaju, a lako zvuče tačno:</p>
<ul>
<li>„daje znak pokazivačem pravca <b>dok se uverava</b> da može da otpočne" — znak ide <b>posle</b> uveravanja, ne uporedo s njim;</li>
<li>„znak <b>istovremeno</b> sa započinjanjem radnje" i „uverio sam se da je bezbedno, pa mi <b>znak ne treba</b>";</li>
<li>„<b>dao sam propisan znak</b>, znači uvek smem da otpočnem" i „radnja je <b>u skladu sa signalizacijom</b>, znači smem" — traži se <b>oboje</b>: uveravanje da radnju možeš bezbedno <b>i</b> propisan znak;</li>
<li>znak „<b>samo na početku</b> radnje" i znak „samo dok se ne uveriš da su <b>drugi shvatili</b> tvoju nameru" — obe ponude gase znak prerano; kraj znaka određuje jedino <b>kraj radnje</b>, a ne ni njen početak ni tuđa reakcija.</li>
</ul>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 62" role="img" aria-label="tvoje plavo vozilo stoji uz desnu ivicu, pored kolovoza; zelena strelica pokazuje ulazak u traku koja je levo, a na prednjoj levoj strani vozila trepće žuta tačka"><rect x="2" y="6" width="116" height="26" rx="2" fill="#9aa7b4"/><rect x="16" y="36" width="34" height="12" rx="3" fill="#2c6aa0"/><circle cx="52" cy="35" r="3.5" fill="#e8b000" class="animTrepti"/><path d="M56 40 C68 40 70 30 72 24" stroke="#1f7a3f" stroke-width="2.4" fill="none"/><path d="M74 14 L66 25 L78 27 Z" fill="#1f7a3f"/></svg>
    <b>UKLJUČENJE SA DESNE IVICE</b><span>znak <b>levim</b> pokazivačem</span>
  </div>
</div>
<p><b>Uključivanje u saobraćaj sa desne ivice:</b> ulaziš u traku koja ti je sa <b>leve</b> strane, pa je i pokazivač levi — desnim bi najavio suprotno. Redosled je i tu isti: prvo uveravanje, pa znak.</p>
<p><b>Iz garaže na nepreglednom mestu</b> (moped odnosno motocikl) ne pomaže ni „postepeno ću pomerati vozilo i zauzeti položaj tela koji mi omogućava potrebnu preglednost", ni „uključiću se na nekom drugom, preglednijem mestu": propis ti kaže kako da se uključiš <b>baš tu gde jesi</b> — <b>uz pomoć lica koje se nalazi na pogodnom mestu van vozila</b> i daje ti odgovarajuće znakove.</p>
<div class="signRow lineRow">
  <div class="signCell">
    <svg viewBox="0 0 120 62" role="img" aria-label="kolovoz na kome je tvoje plavo vozilo, a ispred njega dete sa biciklom ulazi na kolovoz"><rect x="2" y="14" width="116" height="40" rx="3" fill="#9aa7b4"/><rect x="8" y="30" width="34" height="12" rx="3" fill="#2c6aa0"/><circle cx="83" cy="8" r="4" fill="currentColor"/><path d="M83 12 V22" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="76" cy="28" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="90" cy="28" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M76 28 L83 20 L90 28" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M83 36 V44" stroke="currentColor" stroke-width="2" fill="none"/><path d="M83 52 L78 42 L88 42 Z" fill="currentColor"/></svg>
    <b>NEPOSREDNA OPASNOST</b><span>dete sa biciklom ulazi na kolovoz pred tobom — <b>smeš</b> naglo da usporiš</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 62" role="img" aria-label="tvoje plavo vozilo prilazi raskrsnici, a neposredno iza njega je autobus — duže i više vozilo, sa nizom prozora"><rect x="2" y="18" width="116" height="30" fill="#9aa7b4"/><rect x="88" y="2" width="26" height="58" fill="#9aa7b4"/><rect x="4" y="21" width="46" height="22" rx="2" fill="#2a333d"/><rect x="8" y="25" width="8" height="7" rx="1" fill="#9aa7b4"/><rect x="19" y="25" width="8" height="7" rx="1" fill="#9aa7b4"/><rect x="30" y="25" width="8" height="7" rx="1" fill="#9aa7b4"/><rect x="41" y="25" width="7" height="7" rx="1" fill="#9aa7b4"/><rect x="56" y="29" width="30" height="12" rx="3" fill="#2c6aa0"/></svg>
    <b>NEMA OPASNOSTI</b><span>raskrsnica ispred, autobus neposredno iza — usporavaš <b>rano i postepeno</b></span>
  </div>
</div>
<table>
<tr><th>Situacija</th><th>Smeš li naglo</th></tr>
<tr><td>Dete sa biciklom izlazi na kolovoz pred tobom</td><td><b>DA</b> — neposredna opasnost; rešenje je naglo usporavanje, a ne skretanje ka suprotnom smeru ili ka parkiranim vozilima</td></tr>
<tr><td>Prilaziš raskrsnici, neposredno iza tebe je autobus</td><td><b>NE</b> naglo — ali brzinu <b>moraš</b> smanjiti: rano i postepeno, tako da onog iza sebe ne ugroziš ni ometeš</td></tr>
<tr><td>Da uskladiš brzinu sa znakom ograničenja</td><td><b>NE</b> — to se radi postepeno</td></tr>
<tr><td>„samo pri radnjama koje podrazumevaju obavezno uključivanje pokazivača pravca"</td><td><b>NE</b> — naglo se sme <b>samo</b> radi izbegavanja neposredne opasnosti</td></tr>
<tr><td>„u slučaju da <b>nije blagovremeno zauzeo položaj</b> vozilom na kolovozu za izvršenje određene radnje"</td><td><b>NE</b> — zakasneli položaj nije neposredna opasnost; ta ista ponuda stoji u <b>oba</b> pitanja o naglom, pa se isplati zapamtiti je</td></tr>
</table>
</div>
`,
};

// --- objašnjenja za slikovna pitanja (talas 1) ---
X[9404] = { x: 'Uređaj koji zatvara prelaz prepoznaje se po tome koliki deo kolovoza pokriva: ova spuštena greda ide preko cele širine puta, od jedne ivice do druge, pa nijedna traka nije ostala prohodna - zato su to branici. Polubranik bi zatvorio samo polovinu kolovoza i ostavio suprotnu stranu otvorenu, što ovde nije slučaj. Zaprečne trake su prenosive prepreke kojima se put privremeno zatvara ili sužava, najčešće kod radova, i sa prugom nemaju veze.' };
X[9405] = { x: 'Ovde svaka greda pokriva samo polovinu kolovoza sa svoje strane i suprotna traka ostaje otvorena - po tome se polubranik razlikuje od branika, koji zatvara celu širinu kolovoza. Ta slobodna polovina nije poziv da se prelaz obiđe, nego način da se vozila zatečena na prelazu isprazne sa njega. Zaprečna traka je prepreka za privremeno zatvaranje puta, a ne uređaj koji čuva prugu.' };
X[10276] = { x: 'Prelaz je obeležen samo Andrejinim krstom - nema ni branika ni uređaja koji bi te zaustavio, pa odluku donosiš sam, na osnovu onoga što vidiš. A vidiš voz koji sa leve strane već prilazi prelazu: on ne može da skrene niti da zakoči na vreme, pa prvenstvo nije na tvojoj strani. Ponuđeno prvenstvo u odnosu na šinsko vozilo ne postoji ni na jednom prelazu, bez obzira na to kako je obeležen.' };
X[10278] = { x: 'Situacija se ne menja kad voz nailazi sa desne strane: krst uz put govori da si na samom prelazu, a šinsko vozilo koje mu prilazi ima prednost i onda kad prelaz nije zatvoren branikom niti ga čuva svetlosni uređaj. Voz koji je već toliko blizu ne može da stane pred tobom, pa se ti zaustavljaš i sačekaš da prođe. Ponuda o tvom prvenstvu je zamka koja se ponavlja kroz celu ovu oblast - na pruzi ga nemaš nikada.' };
X[10282] = { x: 'Branici uz kolovoz stoje podignuti i uređaj ne daje znake, ali to nije dozvola da voziš kao da prelaza nema: prilazak podešavaš tako da možeš bezbedno da staneš pre branika ako se on aktivira dok mu se približavaš. Zato nastavak nepromenjenom brzinom pada - brzina se prilagođava unapred, a ne tek kad greda krene nadole. Zaustavljanje pred samom prugom je pravilo za prelaz koji nema ni branik ni uređaj, a ovaj ih ima.' };
X[10284] = { x: 'Ovaj prelaz nema branik - čuva ga samo uređaj koji svetlosnim znakom najavljuje voz, i on trenutno ćuti. Ipak prilaziš brzinom iz koje možeš da staneš pre tog uređaja, jer se znak može uključiti dok si još na prilazu, a ispred tebe je i vozilo koje tek prelazi prugu. Zato nastavak nepromenjenom brzinom nije tačan, a zaustavljanje pred samom prugom je obaveza sa prelaza koji ovakav uređaj uopšte nema.' };
X[10288] = { x: 'Podignuti branici i uređaj koji ne daje znake ne menjaju način prilaska: brzinu držiš takvu da vozilo možeš da zaustaviš pre branika, jer se on može spustiti u svakom trenutku - a automobil ispred tebe već koči pred prelazom. Nastavak nepromenjenom brzinom pada baš zato što se prilagođavanje traži pre nego što se bilo šta desi. Zaustavljanje pred prugom je pravilo za prelaz bez ikakvog uređaja, a ovde branik postoji.' };
X[10290] = { x: 'Branici zahvataju celu širinu kolovoza i upravo se spuštaju, a to je isti nalog kao i kad su već dole: staje se pre njih i čeka. Prostor ispod grede nije pravna rupa - prelaz važi za zatvoren od trenutka kad branik krene nadole, jer voz može naići pre nego što se provučeš, a i sama greda može da te zahvati u prolazu. Zato provlačenje ispod branika ne postoji kao dozvoljena radnja.' };
X[10292] = { x: 'Polubranik zatvara samo tvoju polovinu kolovoza i suprotna traka ostaje slobodna - baš to je zamka, jer izgleda kao da je zaobilaženje moguće. Spušten polubranik je zabrana prelaska bez izuzetka: ni tvoja procena da stižeš pre voza ni znak nekog lica sa strane nemaju nikakvu snagu, jer niko osim železnice ne zna šta dolazi po koloseku. Staje se pre polubranika i čeka da se podigne.' };
X[10294] = { x: 'Obe grede su spuštene i spojile su se preko celog kolovoza, pa je prelaz zatvoren i tu se svaka procena završava. Ni tvoja ocena da bi stigao pre voza ni znak nekog lica pored puta ne mogu da zamene ono što branik saopštava - samo železnica zna kada koloseci postaju slobodni. Krećeš tek pošto se branik podigne, i to je jedini znak na koji ovde smeš da se osloniš.' };
X[10415] = { x: 'Ista dva crvena svetla pokrivaju tri stanja odjednom: da voz nailazi, da greda kreće da se spušta i da je već spuštena. Zato se pale pre nego što se branik ili polubranik uopšte pokrene i ne gase se dok prelaz ponovo ne bude slobodan, pa naizmenično treptanje u svakom od ta tri trenutka znači isto - zabranu prelaska. Tramvajski prelaz, blizina raskrsnice sa semaforom i opasna raskrsnica najavljuju se sasvim drugom signalizacijom.' };
X[10557] = { x: 'Uređaj pored puta je uključen i daje crveno svetlo kojim se najavljuje nailazak voza, a to je izričita zabrana prelaska, iste snage kao spušten branik. Zaustavljaš se pre samog uređaja, dakle još pre pruge, jer se tu završava deo puta na kome smeš da budeš. Sopstvena procena da stižeš bezbedno tu ne vredi ništa, a nastavak nepromenjenom brzinom vodi pravo na kolosek po kome voz već dolazi.' };
X[10783] = { x: 'Trougao sa crvenim okvirom te samo upozorava na ono što sledi, a savijena strelica pokazuje na koju stranu put skreće — ovde ulevo. Zato tačan odgovor govori o približavanju opasnoj krivini, a ne o nekakvoj obavezi. Ponuda o smeru kojim se vozila moraju kretati je naredba iz plavog kruga, a jednosmerni put je plava tabla obaveštenja.' };
X[10784] = { x: 'Trougao sa crvenim okvirom samo najavljuje ono što sledi, a ovde se strelica povija nadesno, pa je reč o opasnoj krivini na tu stranu — uspori pre ulaska u nju. Obaveza kretanja u određenom smeru je plavi krug naredbe, a jednosmerni put plava tabla obaveštenja; trougao nikada ne naređuje smer kretanja.' };
X[10785] = { x: 'Strelica je dvostruko izlomljena, dakle iza prve krivine odmah dolazi sledeća — nije reč o jednoj krivini nego o nizu. Odgovor se određuje po prvoj krivini gledano iz tvog pravca, a ovde se donji deo strelice prvo povija ulevo. Zato pada i ponuda o običnoj krivini nalevo i ona kojoj niz počinje nadesno.' };
X[10786] = { x: 'Izlomljena strelica znači više uzastopnih krivina, a ne jednu; iza prve odmah sledi suprotna. Broji se smer prve krivine, a ovde se strelica najpre povija nadesno. Ponuda o jednoj opasnoj krivini nadesno pada zbog broja krivina, a ona sa prvom krivinom nalevo zbog smera — sve ostalo je isto.' };
X[10787] = { x: 'Nacrtana kosina se spušta, uz upisan procenat nagiba, pa trougao najavljuje opasnu nizbrdicu — mesto gde ti raste zaustavni put i gde se usporava i motorom, ne samo kočnicom. Uspon je isti simbol okrenut na drugu stranu, zato prvo proveri kuda kosina ide. Tehnička sredstva za usporavanje nisu trougao nego plavi kvadrat obaveštenja sa grbom na kolovozu.' };
X[10788] = { x: 'Kosina na simbolu raste, uz procenat nagiba, pa trougao najavljuje opasan uspon: pripremi niži stepen prenosa i računaj na sporija vozila ispred sebe. Ista slika okrenuta na drugu stranu bila bi nizbrdica, zato uvek proveri kuda se kosina penje. Tehnička sredstva za usporavanje nisu znak opasnosti nego plavi kvadrat obaveštenja sa grbom na kolovozu.' };
X[10789] = { x: 'Obe ivice kolovoza na simbolu se povlače ka sredini, dakle put se sužava sa obe strane, a trougao to samo najavljuje unapred. Radovi na putu su poseban znak, sa likom radnika i žutom osnovom, pa ovde ne dolaze u obzir. Naizmenično uključivanje u jednu traku nije znak opasnosti nego plava tabla obaveštenja sa vozilima koja se uklapaju u jednu traku.' };
X[10790] = { x: 'Desna ivica na simbolu ide pravo, a leva se lomi ka sredini — sužava se samo leva strana kolovoza, pa se položaj vozila prilagođava udesno. Radovi na putu imaju žutu osnovu i lik radnika, čega ovde nema, a tehnička sredstva za usporavanje nisu trougao nego plavi kvadrat obaveštenja sa grbom na kolovozu.' };
X[10791] = { x: 'Leva ivica je prava, a desna se povija ka sredini, pa se kolovoz sužava sa desne strane; trougao to najavljuje unapred da ne bi iznenada morao da menjaš položaj vozila. Naizmenično uključivanje vozila u jednu traku je plava tabla obaveštenja sa vozilima koja se uklapaju, a radovi na putu trougao sa žutom osnovom i likom radnika.' };
X[10792] = { x: 'Simbol prikazuje most čija se ploča podiže iznad vode, a to je jedina situacija u kojoj saobraćaj privremeno stoji dok prolaze plovila. Pošto je konstrukcija jasno nacrtana, ne radi se o putu koji vodi do obale — tamo vozilo propada u vodu bez ikakvog mosta. Klizav kolovoz ima sasvim drugi simbol, vozilo sa vijugavim tragovima.' };
X[10793] = { x: 'Na simbolu vozilo prelazi ivicu i propada u vodu, bez ikakve mostovske konstrukcije, pa znak najavljuje put koji vodi do obale ili se pruža u njenoj blizini. Pokretni most bi imao nacrtanu podignutu ploču između dva oslonca, a klizav kolovoz vozilo sa vijugavim tragovima iza točkova — nijedno nije ovde.' };
X[10794] = { x: 'Profil kolovoza na simbolu je talasast, dakle smenjuju se uzdignuća i udubljenja, a ne postoji jedna jedina neravnina. Zato ne prolaze ponude koje pominju samo ulegnuće ili samo izbočinu; u ovoj trojci znakova bira se doslovno ono što je nacrtano, a ne ono što zvuči verovatnije na putu.' };
X[10795] = { x: 'Površina kolovoza je na simbolu udubljena ka dole, i to jedno jedino ulegnuće, pa se bira upravo taj odgovor. Izbočina bi bila grba iznad linije kolovoza, a treća ponuda traži talasast profil sa više neravnina. Kod ove trojce znakova ne biraj šta je verovatnije, nego šta je nacrtano.' };
X[10796] = { x: 'Kolovoz je na simbolu izdignut u jednu grbu iznad ravne linije, pa je reč o opasnoj izbočini. Ulegnuće bi bilo udubljenje ispod te linije, a treća ponuda podrazumeva talasast kolovoz sa više izbočina i ulegnuća. Sve tri ponude razlikuju se samo po obliku profila, zato prvo pogledaj ide li linija gore ili dole.' };
X[10797] = { x: 'Vozilo sa vijugavim tragovima ispod točkova znači da guma gubi prianjanje, pa znak najavljuje moguć klizav kolovoz — kišu, led, blato ili prosuto ulje. Opasna bankina se crta kao vozilo koje propada uz ivicu kolovoza, a put uz obalu kao vozilo koje pada u vodu; obe zamke se tiču ivice puta, a ne prianjanja.' };
X[10798] = { x: 'Na simbolu točak vozila izbacuje kamenčiće u lepezu iza sebe, dakle opasnost stvara sam saobraćaj po nevezanoj podlozi, a ne nešto što pada odozgo. Odron bi bio kamenje koje se odvaja od strme kosine pored puta, a opasna bankina vozilo koje propada uz ivicu kolovoza. Zato se ovde smanjuje brzina i povećava odstojanje.' };
X[10799] = { x: 'Kamenje se na simbolu odvaja od strme kosine i pada na kolovoz, a kosina je nacrtana sa leve strane, pa se i opasnost najavljuje sa te strane puta. Prštanje kamenja je drugi simbol, točak koji izbacuje kamenčiće iza sebe, dok se opasna bankina odnosi na propadanje vozila uz ivicu kolovoza.' };
X[10800] = { x: 'Isti crtež pešaka na zebri postoji u dva znaka, pa oblik odlučuje: u trouglu je upozorenje i najavljuje da ispred tebe postoji obeležen prelaz, dok plavi kvadrat označava sam prelaz tamo gde se on nalazi. Zato ponuda o mestu na kome se prelaz nalazi pripada obaveštenju, a pešačka staza je poseban izgrađen objekat i opet drugi znak.' };
X[10801] = { x: 'Trougao sa crvenim okvirom samo najavljuje opasnost — ništa ne naređuje i ne opisuje izgrađen objekat. Zato je tačan onaj odgovor koji počinje sa nailazak: upozorava te da se na tom delu puta često kreću deca, jer je blizu škola, obdanište ili igralište. Zona škole se označava plavom tablom obaveštenja, a pešačka staza je posebno izgrađena površina sa zabranom za ostale učesnike — ni jedno ni drugo se ne najavljuje trouglom.' };
X[10802] = { x: 'Isti trougao opasnosti, samo drugi simbol: najavljuje ti da se biciklisti tu često kreću uz put ili ga presecaju, pa računaj na njih i smanji brzinu. Biciklistička staza je izgrađena površina i označava se plavim krugom, dakle znakom obaveze, a zabrana saobraćaja za bicikle dolazi u krugu sa crvenim obodom. Obe zamke opisuju objekat ili naredbu, a ovaj znak samo upozorava na ono što te čeka.' };
X[10803] = { x: 'Simbol pokazuje kosinu sa koje se odronjava kamenje, a strana na kojoj je kosina nacrtana govori sa koje strane puta ti opasnost preti — ovde je stena desno, pa je i kamenje sa desne strane. Prštanje kamenja je drugi znak: tamo točak vozila izbacuje kamenčiće sa kolovoza, ništa ne pada odozgo. Opasna bankina se crta kao vozilo koje propada uz ivicu kolovoza.' };
X[10804] = { x: 'Trougao ovde najavljuje divljač koja može nenadano da izleti na put, pa se od tebe traže manja brzina i spremnost na kočenje, naročito u šumovitim deonicama i u sumrak. Domaće životinje imaju svoj znak i podrazumevaju čoveka koji ih nadzire, što je druga situacija. Staza za jahanje je izgrađena površina i označava se plavim krugom, dakle naredbom, a ne najavom opasnosti.' };
X[10805] = { x: 'Ovo je jedini znak opasnosti sa žutom osnovom, i ta žuta je znak privremene situacije: radovi na putu. Čovek sa lopatom kaže da očekuješ ljude, mašine, blato ili šljunak na kolovozu i izmenjen režim vožnje. Suženje kolovoza se crta kao ivice puta koje se približavaju, a naizmenično uključivanje u jednu traku ima svoj simbol traka koje se spajaju — oba su na beloj osnovi.' };
X[10806] = { x: 'Tri svetla poređana jedno ispod drugog najavljuju da dalje na putu saobraćajem upravljaju semafori; znak sam po sebi ništa ne naređuje, nego ti daje vremena da smanjiš brzinu i pripremiš se za zaustavljanje. Zamka o prelazu preko pruge pada zato što na ovom znaku od pruge nema ni traga, samo svetala, a regulisanje pristupa vozila uopšte ne spada među znakove opasnosti.' };
X[10807] = { x: 'Poruka je ista kao kod uspravnog semafora — samo su tri svetla ovde poređana vodoravno, a raspored svetala nije deo značenja i ne traži drugi odgovor. Znak najavljuje mesto na putu gde saobraćaj vode semafori. Da je reč o prelazu preko pruge, pruga bi morala da se vidi na znaku, a ovde nema ničega osim svetala; regulisanje pristupa vozila je sasvim druga stvar i nije znak opasnosti.' };
X[10808] = { x: 'Avion na trouglu ne označava aerodrom nego deonicu iznad koje avioni prelaze u niskom letu pri sletanju i poletanju, pa te iznenadna senka i buka mogu iznenaditi. Blizina aerodroma se pokazuje znakovima obaveštenja, koji vode ka objektu i nisu upozorenje. Jak bočni vetar ima svoj znak sa vetrokazom i ne vezuje se za prelet aviona.' };
X[10809] = { x: 'Na znaku je vetrokaz, vreća razvučena vetrom na stubu, i on najavljuje deo puta gde često duva jak bočni vetar — za motocikl ozbiljna stvar, jer te udar može izbaciti iz putanje. Avioni imaju svoj simbol sa siluetom aviona, a odron se crta kao kamenje koje pada niz kosinu; nijedan od ta dva crteža ovde ne postoji.' };
X[10810] = { x: 'Dve strelice okrenute suprotno, jedna nagore a druga nadole, najavljuju da od tog mesta srećaš i vozila iz suprotnog smera — obično posle deonice sa razdvojenim ili jednosmernim kolovozom. Prvenstvo prolaza na suženom delu puta daje se plavom tablom obaveštenja, a zabrana stupanja na suženi deo dolazi u crvenom krugu; obe zamke su pravila o prvenstvu, a ovaj znak samo upozorava.' };
X[10811] = { x: 'Uzvičnik je opšti znak opasnosti: stavlja se tamo gde opasnost postoji, ali za nju nije predviđen poseban simbol, pa se često dopunjuje tablom koja bliže kaže o čemu je reč. Radovi na putu imaju svoj znak, na žutoj osnovi i sa čovekom koji radi. Naredba da ustupiš prvenstvo prolaza je trougao okrenut vrhom nadole i uopšte nema simbol u sredini.' };
X[10817] = { x: 'Kraći krsta su iste debljine i to je cela poruka: nijedan od puteva koji se ukrštaju nije put sa prvenstvom prolaza, pa prvenstvo rešavaš opštim pravilima, pre svega pravilom desne strane. Da jedan put ima prvenstvo, bio bi nacrtan deblje od drugog. Ukrštanje sa prugom bez branika ima sasvim drugi simbol, sa lokomotivom u trouglu.' };
X[10818] = { x: 'Debela uspravna crta je put kojim ti ideš i on ima prvenstvo prolaza, a tanka poprečna crta je sporedni put. Ovde tanka crta preseca debelu i izlazi na obe strane, dakle putevi se ukrštaju, a ne spajaju. Da su sve crte jednako debele, radilo bi se o raskrsnici puteva iste važnosti; pruga bi opet imala potpuno drugačiji crtež.' };
X[10819] = { x: 'Debela crta je tvoj put sa prvenstvom prolaza, tanka je sporedni put koji se uliva u njega sa leve strane pod pravim uglom i tu se završava. Pošto tanka crta ne prolazi kroz debelu, ovo je spajanje, a ne ukrštanje. Odgovor o putevima iste važnosti pada na prvi pogled: tamo bi sve crte bile jednako debele i činile bi krst.' };
X[10820] = { x: 'Nacrtan je zidani portal sa tamnim otvorom, dakle ulaz u tunel, pa te znak unapred priprema na nagli pad osvetljenja i na posebna pravila vožnje kroz tunel. Nadvožnjak i podvožnjak su objekti preko kojih, odnosno ispod kojih put prolazi, i sami po sebi nisu opasnost koja se najavljuje trouglom; ograničenje visine bi došlo kao okrugli znak zabrane.' };
X[10821] = { x: 'Isti sistem kao kod spajanja sa leve strane, samo u ogledalu: tanka crta sporednog puta pripaja se debeloj sa desne strane, pod pravim uglom, pa očekuj vozila koja ti izlaze zdesna iako ti imaš prvenstvo. Pošto se tanka crta završava na debeloj i ne nastavlja dalje, nije reč o ukrštanju, a različita debljina crta isključuje puteve iste važnosti.' };
X[10822] = { x: 'Debela crta je put sa prvenstvom prolaza, a tanka se sa desne strane priklanja uz nju koso, pod oštrim uglom, kao kod ulivanja. Takav ugao smanjuje preglednost jer vozilo sa sporednog puta stiže gotovo iza tebe, pa gledaj i ogledalo. Tanka crta se završava na debeloj, pa nema ukrštanja, a različita debljina crta isključuje puteve iste važnosti.' };
X[10823] = { x: 'I ovde se sporedni put spaja sa desne strane, ali je tanka crta nagnuta na drugu stranu i sa tvojim putem zaklapa tup ugao — po tom nagibu razlikuješ ovaj znak od varijante sa oštrim uglom, jer je sve ostalo isto. Pošto se tanka crta završava na debeloj, nema ukrštanja, a razlika u debljini crta govori da tvoj put ima prvenstvo prolaza.' };
X[10824] = { x: 'Beli trougao sa crvenim okvirom pripada znakovima opasnosti — on samo najavljuje ono što te čeka i ništa ne naređuje. Tri crne strelice povezane u krug kažu da raskrsnica ispred tebe ima kružni tok, pa usporavaš i spremaš se da ustupiš prolaz. Obilaženje ostrva na kolovozu propisuje plavi krug sa strelicom, a zabrana polukružnog okretanja je crveni krug — obe ponuđene zamke su izričite naredbe, a ne upozorenje.' };
X[10825] = { x: 'Trougao znači upozorenje, a nacrtana ograda je skraćenica za branik ili polubranik: prelaz preko železničke pruge koji jeste obezbeđen. Ponuda sa lokomotivom označava isti takav prelaz, samo bez branika i polubranika, pa čim na znaku vidiš letve ograde ona pada. Tramvajska pruga ima svoj znak, sa nacrtanim tramvajem na šinama, tako da ni treća ponuda ne prolazi.' };
X[10826] = { x: 'Trougao sa crvenim okvirom samo najavljuje opasnost na delu puta ispred tebe. Nacrtana krava stoji za domaće životinje pod nadzorom, koje prelaze preko puta ili se kreću duž njega, pa uz stoku očekuj i čoveka koji je vodi. Jelen u skoku je poseban znak za divljač, a staza za jahanje uopšte nije upozorenje nego oznaka posebno izgrađene staze.' };
X[10827] = { x: 'Kod raskrsničkih trouglova prati debljinu crta: debela uspravna crta je put sa prvenstvom kojim ti ideš, tanka je sporedni put. Ovde tanka crta ne preseca debelu nego se u nju uliva sa leve strane, i to pod oštrim uglom — dakle spajanje, a ne ukrštanje. Zato pada ponuda o ukrštanju, a pada i ona o raskrsnici na kojoj nijedan put nema prvenstvo, jer bi tada sve crte bile jednako debele.' };
X[10828] = { x: 'Isti ključ kao kod ostalih raskrsničkih trouglova: debela crta je tvoj put sa prvenstvom, tanka je sporedni. Tanka crta se sa leve strane uliva u debelu i sa njom zaklapa tup ugao, pa je reč o spajanju pod tupim uglom. Ukrštanje bi značilo da tanka crta prolazi kroz debelu i izlazi sa druge strane, a raskrsnicu bez prvenstva prepoznaješ po tome što su sve crte jednako debele.' };
X[10829] = { x: 'Trougao je upozorenje, a na njemu je tramvaj sa pantografom na šinama — znak najavljuje mesto na kome se put u nivou ukršta sa tramvajskom prugom. Železnički prelaz se crta drugačije, ogradom ili lokomotivom, pa ta ponuda pada. Mesto tramvajske stanice je obaveštenje putniku i nikada se ne saopštava crvenim trouglom.' };
X[10830] = { x: 'Trougao sa crvenim okvirom najavljuje opasnost, a nacrtana lokomotiva je oznaka za prelaz preko železničke pruge u nivou koji nije obezbeđen branicima ni polubranicima, pa mu prilaziš smanjenom brzinom i sam proveravaš prugu. Ograda na znaku bi značila upravo suprotno, prelaz sa branicima, a ukrštanje sa tramvajskom prugom nosi nacrtan tramvaj na šinama.' };
X[10831] = { x: 'Andrejin krst je jedan od retkih znakova opasnosti koji nije trougao nego pravougaona tabla sa crvenim kracima, i stoji neposredno pred prelazom preko pruge. Ovde su dva ukrštena krsta jedan ispod drugog, a to znači prugu sa dva ili više koloseka; jedan krst značio bi jedan kolosek. Da li prelaz ima branike ne čita se sa krsta nego sa trougla postavljenog ispred njega.' };
X[10832] = { x: 'Kosnik je pravougaona tabla sa kosim crvenim crtama i njegov jedini posao je da ti kaže koliko je ostalo do mesta gde put prelazi prugu: svaka crta vredi 80 m, pa tri crte znače 240 m, dve 160 m, a jedna 80 m. Zato je tačan odgovor udaljenost do ukrštanja puta i pruge. Izlaz sa autoputa i zatvaranje saobraćajne trake najavljuju sasvim druge table, bez kosih crvenih crta.' };
X[10833] = { x: 'Kosnik se čita brojanjem: svaka kosa crvena crta vredi 80 m do mesta gde put prelazi prugu. Na ovoj tabli su dve crte, dakle 160 m. Tri crte bi značile 240 m, a 280 m ne postoji ni na jednom kosniku jer se udaljenost uvek dobija množenjem broja crta sa 80 — ta ponuda je čista zamka.' };
X[10834] = { x: 'Pravilo kosnika je uvek isto: broj kosih crvenih crta pomnožen sa 80 m daje udaljenost, pa tri crte znače 240 m. Iznad table stoji trougao sa nacrtanom ogradom i po njemu znaš da je prelaz obezbeđen branicima ili polubranicima — sam kosnik o branicima ne govori ništa. Ponuda od 160 m tražila bi dve crte, a 280 m nije umnožak od 80, pa takvog kosnika nema.' };
X[10835] = { x: 'Kosnik sa tri kose crvene crte znači 240 m do prelaza, jer svaka crta vredi 80 m. Razliku u odnosu na skoro isto pitanje pravi trougao iznad table: na njemu je lokomotiva, a to je prelaz koji nije obezbeđen branicima ni polubranicima. Dve crte bi dale 160 m, dok 280 m ne postoji jer se udaljenost uvek dobija množenjem broja crta sa 80.' };
X[10836] = { x: 'Trougao sa crvenim okvirom je upozorenje, a tri vozila nacrtana jedno iza drugog i gledana otpozadi najavljuju deo puta na kome se lako stvara kolona, odnosno zastoj. Ponude o obavezi, odnosno o zabrani kretanja u koloni zvuče kao naredbe, a takve poruke nose okrugli znakovi — plavi za obavezu, sa crvenim obodom za zabranu. Trougao ništa ne naređuje, pa obe ponude padaju.' };
X[10837] = { x: 'Trougao najavljuje opasnost, a na njemu vozilo jednim točkom propada preko ivice kolovoza dok se ta ivica osipa — to je opasna bankina uz kolovoz. Odron je druga slika, kamenje koje pada niz kosinu pored puta, a prštanje kamenja se crta kao točak koji izbacuje kamenčiće. Ovde je opasnost u samoj ivici puta, a ne u kamenju sa strane.' };
X[10838] = { x: 'Trougao sa crvenim okvirom samo upozorava, a nacrtan je pešak koji hoda, bez zebre pod nogama: najavljuje se deo puta kojim se pešaci često kreću. Da je u pitanju obeležen pešački prelaz, pešak bi u trouglu stajao na zebri. Posebno izgrađena staza za pešake nije opasnost nego plavi znak iz sasvim druge porodice, pa ta ponuda otpada.' };
X[10839] = { x: 'Kosnik računaš tako što broj kosih crvenih crta pomnožiš sa 80 m. Na ovoj tabli je samo jedna crta, dakle do ukrštanja puta i pruge ostalo je 80 m — to je poslednji kosnik pred prelazom. Dve crte bi značile 160 m, a tri crte 240 m, pa se obe veće ponude obaraju prostim brojanjem crta na slici.' };
X[10840] = { x: 'Andrejin krst nije trougao nego pravougaona tabla sa crvenim kracima i postavlja se neposredno pred prelazom preko pruge. Ovde je nacrtan jedan krst, a to znači prugu sa jednim kolosekom; dva krsta jedan ispod drugog značila bi dva ili više koloseka. Da li prelaz ima branike govori trougao postavljen ispred, a ne sam krst, pa i ta ponuda pada.' };
X[11039] = { x: 'Crveno-žute kose pruge ovde ne stoje uz ivicu kolovoza nego na samom objektu - na bočnim zidovima i iznad otvora kroz koji put prolazi. To rešava pitanje: tabla obeležava stalnu prepreku unutar gabarita slobodnog profila, dakle nešto što je trajno tu i ne sklanja se. Ponuđena vertikalna zapreka i zaprečna traka spadaju u opremu kojom se saobraćaj privremeno zatvara ili usmerava, najčešće kod radova.' };
X[11058] = { x: 'Visok žuto-crveni štap zaboden uz ivicu i namerno izdignut visoko iznad snega sam odaje čemu služi: kad sneg zatrpa ivicu kolovoza, po njemu se vidi kuda put zapravo ide. Smerokaz je nizak beli stubić koji pod ovolikim snegom više ne bi značio ništa, a stub saobraćajnog znaka nosi znak na vrhu - ovaj štap na sebi nema ništa osim naizmeničnih polja.' };
X[11059] = { x: 'Beli stubić uz ivicu kolovoza je smerokaz, a koju ivicu obeležava kaže boja svetloodbojnog polja na njemu: crveno pripada desnoj ivici, pa ga vidiš sa svoje strane puta. Levu ivicu obeležava smerokaz sa odsevnikom druge boje, pa ta ponuda pada već na slici. Nije ni saobraćajni znak - smerokazi su svetlosne oznake na putu, posebna vrsta signalizacije.' };

// --- objašnjenja za slikovna pitanja (talas 2) ---
X[9010] = { x: 'Ispod crvenog kruga sa ograničenjem stoji dopunska tabla na kojoj piše samo broj metara, bez strelica — takva tabla kaže koliko još treba da voziš do mesta gde naredba počinje. Znak je, dakle, postavljen unapred i ograničenje te čeka tek posle te dužine. Da tabla ima strelice, značila bi dužinu deonice na kojoj naredba važi, a odgovor da važi već od stuba potpuno zanemaruje tablu.' };
X[9011] = { x: 'Na dopunskoj tabli, pored broja metara, stoje i strelice — one pokazuju deonicu, pa ograničenje počinje odmah kod stuba i traje narednih dvesta metara. Zamka sa udaljenošću vredi za tablu na kojoj piše samo broj, bez strelica; tada znak najavljuje mesto koje tek dolazi. Odgovor bez ikakvog broja metara ponaša se kao da table nema, a ona je sastavni deo znaka.' };
X[9017] = { x: 'Beli krug sa crvenim obodom je porodica zabrana, a nacrtano je baš ono na šta se zabrana odnosi — teretno vozilo. Da se od tebe nešto zahteva, znak bi bio plav; obavezan smer kretanja za neku vrstu vozila nikada nije crveni krug. Vozila sa opasnim teretom imaju svoje znake, sa simbolom eksplozije ili cisterne, a ne običnu siluetu kamiona.' };
X[9018] = { x: 'U crvenom krugu je motocikl, a taj simbol povlači sa sobom i sve što je u propisima teško — teške tricikle i teške četvorocikle. Ponuđeni mopedi sa lakim triciklima i četvorociklima idu uz poseban znak, na kome je nacrtan moped: motocikl vuče tešku, moped laku grupu. Bicikl ima svoj zaseban znak, pa ni on nije obuhvaćen ovim.' };
X[9019] = { x: 'Nacrtano vozilo je moped, bicikl sa ugrađenim motorom, pa zabrana hvata mopede i uz njih lake tricikle i lake četvorocikle. Znak sa motociklom nosi krupniju siluetu i uz nju tešku grupu tricikala i četvorocikala. Znak sa običnim biciklom nema motor i tiče se samo bicikala — boja i oblik su kod sva tri ista, razlikuje ih jedino ono što je nacrtano.' };
X[9022] = { x: 'Na znaku su i motorna vozila, automobil i motocikl, i zaprežno vozilo sa konjem, pa zabrana pokriva obe grupe zajedno. Odgovor da su zabranjena sva vozila ide predaleko — bicikl i ručna kolica su takođe vozila, a nisu nacrtani, pa ih ovaj znak ne dira. Treći odgovor obrće sliku: ono što je nacrtano proglašava dozvoljenim, iako crveni krug zabranjuje baš ono što prikazuje.' };
X[9023] = { x: 'Bicikl je nacrtan u belom krugu sa crvenim obodom, a to je porodica zabrana — biciklima je tuda prolaz zatvoren. Staza kojom se biciklisti moraju kretati je isti simbol u plavom krugu, jer obavezu uvek daje plava boja, a ovde plave nema. Prestanak zabrane prepoznao bi se po kosim crtama preko znaka, kojih na slici nema.' };
X[9024] = { x: 'Uz automobil je nacrtan i motocikl, pa zabrana hvata sva motorna vozila, bez izuzetka. Da je nacrtan samo automobil, mopedi i motocikli bez prikolice i bez bočnog sedišta bili bi izuzeti — dodati motocikl upravo gasi taj izuzetak. Zabrana za sva vozila nema nikakav simbol, to je prazan beli krug sa crvenim obodom, a odgovor koji baš automobilu i motociklu daje prolaz obrće ono što je nacrtano.' };
X[9025] = { x: 'Kote su postavljene levo i desno od broja, vrhovima jedan prema drugom, pa se mera čita vodoravno i tiče se širine vozila; šire od toga ne prolazi. Visina bi bila prikazana kotama iznad i ispod broja, a dužina se nikad ne daje golim kotama nego uz nacrtanu siluetu vozila. Primeti i da u tačnom odgovoru nema reči ukupna, što ide baš uz širinu.' };
X[9027] = { x: 'Kote stoje iznad i ispod broja, pa se mera čita uspravno i odnosi se na ukupnu visinu vozila zajedno sa teretom. Ista brojka sa kotama levo i desno značila bi širinu, a dužina ide uz nacrtanu siluetu vozila, koje ovde nema. Vrsta vozila nije bitna — bitno je samo da li prolaziš ispod prepreke koja sledi.' };
X[9033] = { x: 'Iznad vozila je nacrtan crveni prasak, simbol za eksploziv i lako zapaljive materije, pa se zabrana odnosi samo na vozila sa takvim teretom. Materije koje mogu da zagade vodu imaju svoj znak, na kome su nacrtane linije vode, a opšti opasan teret ide uz siluetu cisterne. Teretnom vozilu bez takvog tereta ovaj znak ništa ne brani.' };
X[9034] = { x: 'Nacrtana je cisterna sa istaknutim rezervoarom, simbol prevoza opasnog tereta uopšte, pa zabrana pokriva ceo taj prevoz, a ne samo jednu vrstu materije. Uža zabrana za eksploziv i lako zapaljive materije ima nacrtan prasak iznad vozila, čega ovde nema. Zabrana za teretna vozila bila bi obična silueta kamiona sa sandukom, bez naglašenog rezervoara.' };
X[9037] = { x: 'U belom krugu sa crvenim obodom je traktor, pa je baš njemu tuda prolaz zabranjen. Da se traktori moraju kretati tim putem, znak bi bio plavi krug — obavezu daje plava boja, nikada crvena. Zabrana za sva motorna vozila prikazuje automobil sa motociklom, pa se ovaj znak tiče samo traktora i ostala vozila prolaze.' };
X[9038] = { x: 'Nacrtan je konj upregnut u kola, dakle zaprežno vozilo, i samo se na njega zabrana odnosi. Domaće životinje koje se teraju putem imaju svoj znak, sa samom životinjom, bez upregnutih kola. Da su zabranjena i motorna vozila, na znaku bi uz zapregu stajali i automobil i motocikl, kao na znaku iz tog para.' };
X[9040] = { x: 'Pešak je u belom krugu sa crvenim obodom, pa mu je kretanje tim delom puta zabranjeno. Pešačka staza je ista figura u plavom krugu, jer plavo naređuje, a crveno uskraćuje. Najava obeleženog pešačkog prelaza je trougao sa crvenim okvirom, a trougao samo upozorava na ono što sledi i ništa ne zabranjuje.' };
X[9042] = { x: 'Ispod nacrtanog vozila stoji mera sa strelicama koje se šire u obe strane, duž same siluete, pa se broj čita kao ukupna dužina — važi i za skup vozila sa prikolicom. Širina se prikazuje golim kotama, bez vozila na znaku, a visina kotama iznad i ispod broja. Silueta ovde nije tu da odredi vrstu vozila, nego da pokaže šta se meri.' };
X[9044] = { x: 'Strelica sa brojem tona pokazuje nadole, tačno na nacrtanu osovinu sa dva točka, pa se ograničenje odnosi na opterećenje po jednoj osovini, a ne na težinu celog vozila. Ukupna masa se na znaku piše kao gola brojka sa oznakom tone, bez osovine ispod nje. Širina bi bila prikazana kotama sa strana, a ne teretom koji pritiska točkove.' };
X[9045] = { x: 'U krugu stoji samo brojka sa oznakom tone, bez nacrtane osovine i bez strelice nadole, pa se meri masa celog vozila, odnosno skupa vozila. Ograničenje po osovini uvek ima nacrtanu osovinu sa točkovima ispod broja. Meri se stvarno stanje u tom trenutku, sa teretom i putnicima, a ne najveća dozvoljena masa upisana u dokumentima.' };
X[9053] = { x: 'Plavi krug sa jednom belom strelicom je naredba: nudi ti se jedan jedini smer i njime moraš da se krećeš. Jednosmerni put se označava pravougaonom tablom obaveštenja, a obaveštenje nikada ne dolazi u obliku plavog kruga. Kad bi znak nudio dva kraka, odgovor bi glasio da se vozila smeju kretati; sa jednom strelicom ostaje moraju.' };
X[9058] = { x: 'Strelica je savijena, ali je i dalje jedna i stoji u plavom krugu, pa i dalje naređuje kojim se smerom moraš kretati. Opasna krivina se najavljuje trouglom sa crvenim okvirom, koji samo upozorava i ništa ne nalaže, pa taj odgovor pada već po obliku i boji. Jednosmerni put je pravougaono obaveštenje, a ne krug.' };
X[9061] = { x: 'Preko plave površine idu dve ukrštene crvene crte, a više crta znači strožu zabranu — tu ne smeš ni da se zaustaviš, ne samo da parkiraš. Isti znak sa samo jednom kosom crtom zabranjuje jedino parkiranje, i to je prva zamka. Zabrana važi za stranu puta na kojoj je znak postavljen, pa odgovor koji govori o delu puta promašuje.' };
X[9062] = { x: 'Preko plave površine ide samo jedna kosa crvena crta, pa je zabranjeno parkiranje, dok kratko zaustavljanje radi ulaska ili izlaska putnika ostaje dozvoljeno. Dve ukrštene crte bile bi stroža zabrana i gasile bi i zaustavljanje. I ovde je važno da se zabrana odnosi na stranu puta na kojoj znak stoji, pa odgovor sa delom puta ne prolazi.' };
X[9066] = { x: 'Plavi krug znači obavezu, a jedna jedina prava strelica ne ostavlja izbor: na tom mestu se mora ići baš u smeru koji ona pokazuje. Jednosmerni put i obaveštenje o jednosmernom putu daju se pravougaonim znakom iz porodice obaveštenja, pa takva poruka nikada ne može doći u plavom krugu.' };
X[9068] = { x: 'Strelice raspoređene u krug na plavoj podlozi nisu najava nego naredba: ostrvo za usmeravanje saobraćaja obilaziš tačno u smeru koji strelice pokazuju. Oba mamca počinju sa blizinom raskrsnice, a najavu daju znakovi opasnosti i obaveštenja. Plavi krug uvek propisuje kretanje na samom mestu na kome je postavljen.' };
X[9070] = { x: 'Savijena bela strelica u plavom krugu naređuje smer: na tom mestu se ide levo i druge mogućnosti nema. Približavanje opasnoj krivini je znak opasnosti, trougao sa crvenim okvirom, koji samo najavljuje ono što sledi i ništa ne naređuje. Jednosmerni put je opet pravougaono obaveštenje, ne plavi krug.' };
X[9071] = { x: 'Kada plavi krug ponudi dva kraka, menja se i glagol: vozila smeju da idu pravo ili levo, biraš jedan od ponuđenih smerova. Obilaženje ostrva propisuje drugi plavi znak, sa kosom strelicom pored objekta na kolovozu. Pružanje puteva sa jednosmernim saobraćajem je obaveštenje, a plavi krug ne obaveštava nego naređuje.' };
X[9072] = { x: 'Jedna strelica u plavom krugu ne ostavlja izbor: na tom mestu moraš skrenuti u smeru koji ona pokazuje. Oba mamca vode ka jednosmernom putu, ali je to znak obaveštenja pravougaonog oblika i on te samo informiše kako se saobraćaj odvija, dok plavi krug propisuje šta si dužan da uradiš.' };
X[9073] = { x: 'Dva ponuđena kraka u plavom krugu znače izbor, pa je i formulacija drugačija: smerovi u kojima se vozila smeju kretati, pravo ili desno. Obilaženje pešačkih ostrva propisuje drugi plavi znak, sa kosom strelicom pored objekta na kolovozu, a pružanje jednosmernih puteva je obaveštenje, ne naredba.' };
X[9251] = { x: 'Linija vodilja je isprekidana linija iscrtana unutar same raskrsnice da ti pokaže kojom putanjom da prođeš kroz nju, i strelica 2 pokazuje baš na taj isprekidani trag u sredini. Broj 1 je razdelna isprekidana linija na prilazu, broj 3 je njen neisprekidani nastavak neposredno pred raskrsnicom, a broj 4 razdelna linija na drugom kraku puta — nijedna od te tri te ne vodi kroz samu raskrsnicu.' };
X[9255] = { x: 'Traka kojoj se smer menja obeležava se udvojenom isprekidanom linijom sa obe strane, a iznad nje stoje posebni semafori sa ukrštenim crvenim crtama ili zelenom strelicom. Na slici jedino traka 2 ima takvu dvostruku isprekidanu liniju i levo i desno od sebe. Trake 1 i 3 su njome odvojene samo sa jedne strane, pa im smer kretanja ostaje stalan.' };
X[9256] = { x: 'Neisprekidanu liniju najavljuje linija upozorenja — isprekidana kod koje su crte znatno duže od praznina među njima, i to je deo koji pokazuje strelica 4, tik pred krivinu. Broj 3 pokazuje na deo bliži vozilu, gde su crte kratke a praznine duge, što je obična razdelna linija. Brojevi 1 i 2 su neisprekidane linije uz rubove kolovoza i ne najavljuju ništa.' };
X[9258] = { x: 'Razdelna linija je ona koja razdvaja saobraćajne trake: pod brojem 3 to je udvojena neisprekidana u sredini, između suprotnih smerova, a pod brojem 4 isprekidane linije koje razdvajaju po dve trake istog smera, levo i desno od nje. Brojevi 1 i 2 pokazuju na neisprekidane linije uz same rubove kolovoza — to su ivične linije, one obeležavaju gde kolovoz prestaje, a ne granicu među trakama.' };
X[9287] = { x: 'Strelica je iscrtana na podu zatvorene garaže i pokazuje kojim smerom se sme proći tim prolazom, jer se tamo saobraćaj ne vodi trakama ni raskrsnicama kao na putu. Strelica koja obaveštava o nameni saobraćajne trake stoji u traci pred raskrsnicom i kazuje u kojim smerovima iz nje smeš da nastaviš, a strelica za skretanje saobraćaja preusmerava tok vozila na drugi deo kolovoza — ovde nema ni jednog ni drugog.' };
X[9288] = { x: 'Duga povijena strelica iscrtana uz isprekidanu liniju govori ti da se ta linija uskoro pretvara u neisprekidanu, pa se na vreme vrati u traku na stranu na koju strelica pokazuje. Skretanje saobraćaja je nešto drugo — privremeno preusmeravanje toka na drugi deo kolovoza, obično kod radova. Strelica za namenu trake stoji u samoj traci pred raskrsnicom i kazuje kuda iz nje smeš, a ne šta se dešava sa linijom.' };
X[9290] = { x: 'Široko polje ispunjeno kosim belim crtama, koje razdvaja tokove vozila, jeste površina izvan saobraćaja — po njoj se ne vozi, niti se na njoj sme stati ili parkirati. Zato otpadaju oba odgovora koja nešto dopuštaju: to nije ni slobodna površina za vožnju, ni improvizovano parkiralište. Vozila ga zaobilaze i ostaju u svojim trakama.' };
X[9291] = { x: 'Bela linija sa nizom kosih crtica uz nju ograničava polje za usmeravanje saobraćaja, a to polje ti se pruža sa leve strane i po njemu se ne sme voziti. Zato ga zaobilaziš tako što se držiš desno, uz njegovu ivicu. Da bi prošao levo, morao bi da pređeš preko samog polja i da uđeš u tok vozila koji ono razdvaja, pa otpada i odgovor sa leve strane i onaj sa obe.' };
X[9292] = { x: 'Bela puna površina pod brojem 1 klinasto se širi tamo gde se jedan tok odvaja od drugog i služi samo da razdvoji putanje vozila. Po njoj se ne sme voziti, a kad je saobraćaj zabranjen, onda ni zaustavljanje ni parkiranje ne dolaze u obzir. Zamka je baš u tome što oba preostala odgovora nešto dopuštaju — ovde ne važi ni jedno ni drugo.' };
X[9293] = { x: 'Klinasta bela površina između kolovoza i trake za isključenje razdvaja vozila koja nastavljaju pravo od onih koja izlaze; ona nije saobraćajna traka nego oznaka izvan saobraćaja. Preko nje se ne vozi, a pošto je saobraćaj zabranjen, zaustavljanje i parkiranje otpadaju sami po sebi. Odgovori koji nešto dopuštaju mešaju je sa širokom ivičnom trakom.' };
X[9294] = { x: 'Žuti natpis na kolovozu, uz žute uzdužne linije, izdvaja traku rezervisanu za vozila javnog prevoza putnika — dakle ne samo za autobuse, nego i za druga vozila kojima se javni prevoz obavlja. Zato je odgovor koji traku svodi na autobuse preuzak, a onaj koji je vezuje isključivo za taksi vozila promašen: taksi tu sme samo ako je to posebno dozvoljeno.' };
X[9296] = { x: 'Na kolovozu je naslikan crveni krug sa brojem, isti onakav kakav inače stoji na stubu — oznaka koja ponavlja saobraćajni znak i dodatno te podseća na najveću dozvoljenu brzinu na tom delu puta. Preporučena brzina se ne obeležava crvenim krugom nego plavom tablom, a najmanja dozvoljena brzina ide u plavom krugu, pa ta dva odgovora pripadaju drugim porodicama znakova.' };
X[9305] = { x: 'Žuta izlomljena linija povučena uz ivicu kolovoza označava površinu posebne namene na kojoj se ne sme ni zaustaviti ni parkirati; na slici ide po asfaltu, tik uz bela parking mesta. Da je reč o trotoaru, ista linija bila bi iscrtana na samom trotoaru. Autobusko stajalište se uz takvu liniju obeležava i natpisom, kojeg ovde nema.' };
X[9308] = { x: 'Bele oznake u obliku slova T, koje uz ivicu kolovoza razgraničavaju prostor između parkiranih vozila, obeležavaju mesta za parkiranje. Da je zaustavljanje i parkiranje zabranjeno, oznaka ne bi bila bela nego žuta i pružala bi se duž ivice kolovoza; autobusko stajalište takođe ima žutu oznaku i uz nju natpis, čega ovde nema. Bela boja ti sama kaže da je stajanje na tom mestu dozvoljeno.' };
X[9309] = { x: 'Bela linija pruža se paralelno sa ivicom, a kratki krakovi upravni na nju samo razdvajaju jedno mesto od drugog — takav crtež znači da vozila stoje uzduž ivice, jedno iza drugog. Kod upravnog parkiranja granice mesta bile bi okrenute pod pravim uglom prema ivici, čega ovde nema. A ugao nije stvar tvog izbora: mesto je obeleženo tačno onako kako se na njemu parkira, pa ponuda o parkiranju pod bilo kojim uglom otpada.' };
X[9310] = { x: 'Bele linije zatvaraju pravougaono polje uz ivičnjak, taman toliko da u njega stane jedno vozilo, i to je oznaka parking mesta. Da je zaustavljanje i parkiranje zabranjeno, oznaka bi bila žuta izlomljena linija duž ivice, a ne beli pravougaonik. Autobusko stajalište se takođe obeležava žutom bojom i natpisom, čega ovde nema.' };
X[9312] = { x: 'Bela polja jednakih dimenzija, poređana jedno do drugog uz ivičnjak parkirališta, obeležavaju mesta za parkiranje — deo je zauzet vozilima, deo je prazan, ali oznaka je ista. Zabrana zaustavljanja i parkiranja obeležava se žutom linijom uz ivicu, a autobusko stajalište žutom površinom sa natpisom, pa bela boja sama po sebi isključuje oba ponuđena odgovora.' };
X[9313] = { x: 'Na kolovozu su iscrtana mesta čije su bočne linije okrenute pod pravim uglom u odnosu na ivicu, a vozilo u njima stoji poprečno na ivičnjak — to je upravno parkiranje. Podužno parkiranje bi bilo obeleženo mestima izduženim uz samu ivicu kolovoza, u pravcu kretanja, dok bi koso imalo linije nagnute pod uglom, pa se u mesto ulazi ukoso. Oblik ucrtanih linija ti, dakle, govori i kako se u to mesto staje.' };
X[9315] = { x: 'Ivična linija obeležava dokle ide površina kolovoza, pa je tražiš na samim rubovima — brojevi 1 i 2 stoje uz krajnje bele linije, levu i onu uz uzdignuto ostrvo sa desne strane. Broj 3 je isprekidana uzdužna linija između saobraćajnih traka, a 4 kratka isprekidana linija vodilja koja te provodi kroz raskrsnicu; nijedna od njih ne pokazuje rub kolovoza.' };
X[9338] = { x: 'Kroz raskrsnicu se prolazi u produžetku trake iz koje si u nju ušao, a u tome ti pomaže i kratka isprekidana linija vodilja sa leve strane — putanja 1 prati baš taj produžetak. Putanja 2 bi značila da usred raskrsnice pređeš u susednu traku, preko uzdužnih oznaka na izlazu iz nje. Traka se menja pre ili posle raskrsnice, uz pokazivač pravca i proveru da time nikoga ne ometaš.' };
X[10842] = { x: 'Crveni osmougao sa natpisom je znak prvenstva koji traži da vozilo zaista zaustaviš, pa tek onda ustupiš prvenstvo, i na raskrsnici i ispred prelaza puta preko pruge. Mamac je odgovor u kome se traži samo ustupanje prvenstva, bez zaustavljanja, jer to je poruka obrnutog trougla. Treći ponuđeni odgovor opisuje zabranu saobraćaja iz jednog smera i sa prvenstvom nema veze.' };
X[10843] = { x: 'Beli krug sa crvenim obodom i bez ijednog simbola ne izuzima nikoga: saobraćaj je zabranjen za sva vozila, iz oba smera. Da je u pitanju puna crvena podloga sa belom vodoravnom prečkom, zabrana bi važila samo iz smera prema kome je okrenuto lice znaka. Prazan krug ne pravi izuzetak ni za mopede ni za motocikle.' };
X[10844] = { x: 'Trougao vrhom nadole traži samo ustupanje prvenstva: usporiš, po potrebi i staneš, ali zaustavljanje nije naređeno. Zato odgovor koji izričito traži zaustavljanje vozila pripada crvenom osmouglu sa natpisom. Ovaj znak nije ni zabrana, jer nema crveni krug, pa zabrana saobraćaja za sva vozila otpada već po obliku.' };
X[10845] = { x: 'Puna crvena površina sa belom vodoravnom prečkom gleda samo tebe: ulazak je zabranjen iz smera iz kojeg mu vidiš lice, dok se sa suprotne strane tim delom puta normalno prolazi. Prazan beli krug sa crvenim obodom bio bi zabrana za sva vozila iz oba smera, i to je glavna zamka u ovom paru.' };
X[10846] = { x: 'Simbol putničkog automobila u crvenom krugu zabranjuje saobraćaj svim motornim vozilima, ali sa repom koji se uči napamet: ne odnosi se na mopede i motocikle bez prikolice i bez bočnog sedišta, što vozača A kategorije direktno zanima. Oba mamca izuzimaju putnička vozila, a upravo je putnički automobil ono što je na znaku nacrtano i zabranjeno.' };
X[10847] = { x: 'Silueta autobusa u crvenom krugu zabranjuje tačno ono što je nacrtano, dakle prolaz autobusa tim putem ili delom puta, dok ostali normalno prolaze. Autobusko stajalište je plavi znak obaveštenja, pa taj mamac otpada već po boji i obliku. Drugi mamac zabranjuje sve osim putničkih vozila, a na znaku nema nijednog simbola osim autobusa.' };
X[10848] = { x: 'Dva automobila u crvenom krugu, od kojih je levi crven, znače zabranu preticanja za motorna vozila. Rep koji se pamti: zabrana ne važi za motocikle sa dva točka bez prikolice i za mopede, pa su izuzeci sa teretnim vozilima, autobusima i skupovima vozila izmišljeni. Da su nacrtana dva kamiona, radilo bi se o zabrani preticanja za teretna vozila.' };
X[10849] = { x: 'Precrtana strelica koja se lomi ulevo zabranjuje skretanje na tu stranu, i to na mestu gde znak stoji, ne na celoj deonici. Polukružno okretanje ima svoj simbol, strelicu u obliku slova U, pa je taj odgovor mamac. Naredbu o obaveznom smeru daje plavi krug, a ovde je crveni obod sa kosom crtom, dakle zabrana.' };
X[10850] = { x: 'Strelica savijena u polukrug, prekrižena kosom crtom, zabranjuje polukružno okretanje na tom mestu. Zabrana skretanja ulevo bila bi nacrtana strelicom koja se lomi pod uglom, bez vraćanja unazad. Odgovor o čekanju vozila iz suprotnog smera pripada znaku sa dve uspravne strelice, gde crvena pokazuje smer kome je stupanje zabranjeno.' };
X[10851] = { x: 'Ista logika kao kod para levo i desno: precrtana strelica koja se lomi udesno zabranjuje skretanje na tu stranu, i važi za mesto na kome je znak postavljen. Strelica u obliku slova U bila bi zabrana polukružnog okretanja. Naredbu o obaveznom smeru prepoznaješ po plavom krugu, a ovde je crveno, dakle nešto se zabranjuje.' };
X[10852] = { x: 'Broj u belom krugu sa crvenim obodom je ograničenje: brže od označenog ne smeš, sporije možeš. Isti broj u plavom krugu značio bi najmanju dozvoljenu brzinu, a u plavom kvadratu samo preporučenu, i baš su ta dva slučaja ovde ponuđena kao mamci. Prvo pogledaj boju i oblik podloge, pa tek onda cifru.' };
X[10853] = { x: 'Krug sa crvenim obodom i natpisom je naredba da zaustaviš vozilo, a natpis kaže samo iz kog razloga, ovde zbog policijske kontrole. Isti znak postoji i sa razlogom naplate putarine ili carine, uvek sa istom rečenicom. Obaveštenje o mestu na kome se nalazi stanica policije je plavi pravougaonik i ništa ti ne naređuje.' };
X[10854] = { x: 'Crvena strelica u krugu pokazuje smer kome je nešto zabranjeno, a to je tvoj smer, dok crna strelica pokazuje smer koji ima prednost: čekaš da vozila iz suprotnog smera prođu suženjem, pa tek onda stupaš na njega. Zamka je odgovor da baš ti imaš prvenstvo, jer to je poruka plave table sa sličnim strelicama, dakle znaka obaveštenja, a ne crvenog kruga zabrane.' };
X[10855] = { x: 'Ključ su dve plave valovite linije ispod vozila, jer one označavaju vodu. Znak zabranjuje prolaz vozilima koja prevoze određenu količinu materije koja može da izazove zagađivanje vode. Zabrana za eksploziv i lako zapaljive materije nosi drugi simbol, a zabrana za teretna vozila je obična silueta kamiona, i nijedna nema plave talase.' };
X[10856] = { x: 'Crveni krug je zabrana, a nacrtano je vučno vozilo sa prikolicom na dve osovine — zato zabrana pogađa vuču priključnog vozila, ali sa repom „osim poluprikolice ili prikolice sa jednom osovinom“. Odgovor bez tog izuzetka pripada drugom, vrlo sličnom znaku koji zabranjuje vuču bilo kog priključnog vozila. Zabrana za teretna vozila je treći znak — na njemu je nacrtan samo kamion, bez prikolice.' };
X[10857] = { x: 'U crvenom krugu je čovek koji za sobom vuče ručna kolica, pa je to zabrana, a ne uputstvo: zabranjen je saobraćaj licima koja koriste ručna kolica. Zamka sa glagolom „moraju se kretati“ tražila bi plavi krug, jer obavezu naređuje plava boja, nikad crvena. Zabrana saobraćaja za pešake je poseban znak, sa figurom pešaka bez kolica.' };
X[10858] = { x: 'Plava podloga sa jednom kosom crvenom crtom zabranjuje samo parkiranje — zaustaviti se smeš; dve ukrštene crte zabranile bi i zaustavljanje i parkiranje. Belo I u sredini je oznaka naizmeničnog parkiranja i vezuje zabranu za neparne dane, dok II vezuje za parne. Zato odgovor počinje rečju „stranu“: zabrana važi za stranu puta na kojoj znak stoji, a ne za ceo deo puta.' };
X[10859] = { x: 'Broj u metrima uz dva vozila u crvenom krugu propisuje najmanje odstojanje između vozila u kretanju, dakle razmak koji ne smeš skratiti. Zamka „najveće“ izvrće smisao, jer znak postavlja donju, a ne gornju granicu. Druga zamka je reč rastojanje — to je bočni razmak, a odstojanje je uzdužni, između vozila koja idu jedno za drugim.' };
X[10860] = { x: 'Krug sa crvenim obodom i natpisom nije obaveštenje nego izričita naredba: moraš da zaustaviš vozilo iz razloga ispisanog na znaku, ovde zbog naplate putarine. Ista rečenica važi i za varijante sa natpisom policija ili carina, menja se samo razlog u zagradi. Nailazak na naplatnu stanicu i traka sa elektronskom naplatom su pravougaoni znakovi obaveštenja.' };
X[10861] = { x: 'Od dva vozila u crvenom krugu levo je obojeno crveno i ono je onaj kome je preticanje zabranjeno — ovde je to kamion, pa zabrana pogađa teretna vozila čija najveća dozvoljena masa prelazi 3,5 t. Rep „osim motocikla sa dva točka i mopeda“ pripada znaku na kome je crven putnički automobil. Izuzetak za teretna vozila i autobuse je izmišljen dodatak.' };
X[10862] = { x: 'Truba u krugu sa crvenim obodom i kosom crtom zabranjuje davanje zvučnih znakova upozorenja, ali sa važnim repom: u slučaju neposredne opasnosti sirenu ipak smeš upotrebiti. Prestanak te zabrane označava poseban znak obaveštenja sa precrtanim simbolom, pa taj odgovor ovde ne stoji. Kulturno istorijsko odredište nema veze sa ovom porodicom.' };
X[10863] = { x: 'Dve bele uspravne crte, oznaka II, vezuju zabranu za parne dane — dvojka je paran broj, a I neparan, i to je cela pamtilica. Jedna kosa crvena crta preko plave podloge zabranjuje samo parkiranje; da su crte ukrštene, bilo bi zabranjeno i zaustavljanje. Odgovor mora da počne rečju „stranu“, jer naizmenično parkiranje uvek važi za jednu stranu puta.' };
X[10867] = { x: 'Plavi krug je obaveza, a nacrtan je točak sa lancima, pa se lanci moraju staviti na pogonske točkove kada je na kolovozu sneg. Zamka je baš u spisku izuzetaka: obaveza ne važi za motocikle, mopede, tricikle, četvorocikle, radne mašine, traktore i motokultivatore, pa odgovor sa „sva motorna vozila“ pada. Ni zimske gume ne mogu da zamene lance, pa pada i odgovor koji ih nudi kao alternativu.' };
X[10869] = { x: 'Konj sa jahačem u plavom krugu nije upozorenje nego naredba: to je staza za jahanje i njome se ostali učesnici ne smeju kretati, izuzev vodiča koji vode životinje za jahanje. Zamke sa divljači i domaćim životinjama su znakovi opasnosti — trougao sa crvenim okvirom koji samo najavljuje moguć nailazak životinja, a ništa ne naređuje.' };
X[10871] = { x: 'Figure pešaka u plavom krugu daju naredbu: to je posebno izgrađena staza namenjena samo pešacima, pa se drugi učesnici u saobraćaju njome ne smeju kretati. Ponuđeni pešački prelaz je znak obaveštenja u obliku kvadrata, a nailazak na prelaz najavljuje trougao sa crvenim okvirom — nijedno nije plavi krug. Stazom se ide, prelaz se prelazi.' };
X[10872] = { x: 'Plavi krug znači obavezu, a kosa strelica pokazuje sa koje strane moraš da prođeš pored prepreke — pešačkog ostrva, ostrva za usmeravanje saobraćaja ili sličnog objekta na kolovozu. Glagol je „moraju“, jer je ponuđen samo jedan smer; da su strelice sa obe strane, obilaženje bi bilo dozvoljeno i levo i desno. Jednosmerni put je pravougaona tabla obaveštenja, nikad plavi krug.' };
X[10873] = { x: 'Isti mehanizam kao kod znaka sa strelicom nagnutom na suprotnu stranu: plavi krug naređuje, a nagib strelice kaže kojom stranom prolaziš pored ostrva ili drugog objekta na kolovozu. Pošto je ponuđen samo jedan smer, važi „moraju se kretati“. Podzemni prolaz i jednosmerni saobraćaj označavaju se pravougaonim tablama obaveštenja, pa ovde otpadaju.' };
X[10874] = { x: 'Naredbu da se vozilo obavezno zaustavi nosi jedini osmougaonik u signalizaciji, crveni znak sa natpisom STOP, a to je znak pod rednim brojem dva. Znak jedan je trougao okrenut vrhom nadole i on traži samo ustupanje prvenstva, bez zaustavljanja. Znak tri je trougao sa crvenim okvirom, dakle porodica opasnosti, koja raskrsnicu samo najavljuje.' };
X[10875] = { x: 'Ustupanje prvenstva bez obaveznog zaustavljanja nosi prazan trougao okrenut vrhom nadole, sa crvenim okvirom — na slici je to prvi znak. Osmougaonik sa natpisom STOP pod brojem dva je stroži: pred njim se vozilo mora zaustaviti pa tek onda ustupiti prvenstvo. Treći znak je uspravan trougao sa crtežom raskrsnice, znak opasnosti koji ništa ne naređuje.' };
X[10876] = { x: 'Broj u plavom krugu je obaveza, pa se moraš kretati brzinom koja nije manja od označene — to je najmanja dozvoljena brzina. Isti broj u krugu sa crvenim obodom bio bi ograničenje naviše, dakle zabrana bržeg kretanja, a broj u plavom kvadratu je samo preporuka i spada u znakove obaveštenja. Boja i oblik, a ne cifra, kažu o čemu se radi.' };
X[10877] = { x: 'Strelice usmerene na obe strane u plavom krugu daju ti izbor, pa je glagol „mogu“: pešačko ostrvo, ostrvo za usmeravanje saobraćaja ili drugi objekat na kolovozu smeš obići i levo i desno. Kad je strelica samo jedna, obilaženje je obavezno baš tom stranom. Jednosmerni putevi i njihova raskrsnica označavaju se pravougaonim tablama obaveštenja.' };
X[10878] = { x: 'Plava boja i krug znače obavezu, a strelica savijena u polukrug pokazuje šta se mora uraditi: polukružno okretanje na tom mestu. Zabrana polukružnog okretanja liči, ali je u krugu sa crvenim obodom i sa precrtanom strelicom. Opasna krivina nalevo je iz druge porodice — trougao sa crvenim okvirom, koji samo najavljuje, a ne naređuje.' };
X[10879] = { x: 'Ovo je jedini pravougaonik među znakovima izričitih naredbi: gore je vozilo sa tablom za opasan teret, a ispod plavi krug sa strelicom koji propisuje smer. Zato znak određuje obavezan smer kretanja za vozila koja prevoze opasan teret uopšte, bez sužavanja na eksploziv ili lako zapaljive materije. Materije koje mogu da zagade vodu imaju svoj znak, sa dve plave linije.' };
X[11002] = { x: 'Strelica 3 pokazuje dve paralelne pune bele linije po sredini kolovoza, a to je udvojena neisprekidana razdelna linija: razdvaja smerove i zabranjuje i prelazak preko nje i kretanje po njoj. Broj 4 je isprekidana linija između traka istog smera, preko koje se sme prelaziti, dok 1 i 2 obeležavaju rubove kolovoza levo i desno, pa sa razdvajanjem smerova nemaju veze.' };
X[11005] = { x: 'Kombinovana linija ima punu liniju sa jedne i isprekidanu sa druge strane, a važi ti ona koja je bliža tvom vozilu. Putanja 2 polazi sa one strane na kojoj je bliža isprekidana linija, pa je prelazak dozvoljen; kod putanje 1 uz vozilo je puna linija, tako da tuda ne smeš. Zato ne stoji ni odgovor da se sme bilo kojom putanjom — ista linija dozvoljava prelazak samo iz jednog smera.' };
X[11008] = { x: 'Zabranu prelaska nosi puna, neisprekidana razdelna linija, a ovde su to dve paralelne pune linije po sredini kolovoza na koje pokazuje strelica 3. Preko nje se ne prelazi niti se po njoj vozi, pa se na tom mestu ne sme zaći u suprotni smer, ni radi preticanja. Broj 4 je isprekidana linija između traka istog smera, koja se sme prelaziti, a 1 i 2 su ivične linije koje samo pokazuju dokle se pruža kolovoz.' };
X[11010] = { x: 'Idući ka krivini razdelna linija se menja: kod broja 4 su kratke crte, pa crte postaju duže kao upozorenje, a kod broja 3 linija je već puna, neisprekidana — nju ne smeš ni preći ni voziti po njoj. Broj 2 je ivična linija levog ruba kolovoza, a 1 je isprekidani deo ivične linije tamo gde se sa desne strane odvaja prilaz, pa nijedna od njih ne razdvaja smerove kretanja.' };
X[11012] = { x: 'Poprečna linija ispred crvenog vozila je puna, neisprekidana, a takva linija zaustavljanja ide uz naredbu obaveznog zaustavljanja: staje se uvek, pa i kada na putu nema nikoga. Zaustavlja se ispred te linije, a ne po sopstvenoj proceni — tek ako odatle nemaš pregled, oprezno se pomeriš napred. Zato ne stoje odgovori koji nude izbor između linije zaustavljanja i preglednosti.' };
X[11014] = { x: 'Poprečnu oznaku čine beli trouglovi okrenuti vrhom prema tebi, a sa desne strane puta stoji i trougao vrhom nadole — sve to najavljuje ustupanje prvenstva, a ne naredbu da se obavezno staje. Zato se na liniji zaustavljanja staje samo ako treba propustiti vozila sa puta na koji izlaziš; kad je slobodno, prolazi se bez zaustavljanja. Obavezno zaustavljanje bi tražila puna poprečna linija.' };
X[11016] = { x: 'Red belih trouglova okrenutih vrhom prema tebi obeležava mesto na kome se ustupa prvenstvo prolaza, a ne mesto obaveznog zaustavljanja. Staje se, dakle, na liniji zaustavljanja samo ako naiđe vozilo koje treba propustiti; ako je put slobodan, nastavljaš bez zaustavljanja. Da je poprečna linija puna, uz naredbu obaveznog zaustavljanja, stalo bi se svaki put, bez obzira na saobraćajnu situaciju.' };
X[11017] = { x: 'Pored puta stoji trougao vrhom nadole, a na kolovozu su beli trouglovi okrenuti vrhom ka vozilu koje prilazi — obe oznake govore isto: ustupi prvenstvo prolaza. Takva oznaka ne naređuje zaustavljanje po svaku cenu, nego se na liniji zaustavljanja staje samo ako ima vozila kojima treba ustupiti prolaz. Zaustavljanje u svakoj situaciji tražila bi puna poprečna linija uz naredbu stop.' };
X[11019] = { x: 'Poprečna linija ispred belog vozila je isprekidana, a isprekidana linija zaustavljanja ide uz ustupanje prvenstva prolaza, ne uz naredbu obaveznog zaustavljanja. Zato belo vozilo staje na toj liniji samo ako nailazi vozilo kome treba ustupiti prolaz, kao ovo koje se kreće putem levo; kad je slobodno, prolazi bez zaustavljanja. Puna linija bi značila zaustavljanje svaki put.' };
X[11021] = { x: 'Ispred pešačkog prelaza je red belih trouglova okrenutih vrhom prema tebi, a to je oznaka kojom se najavljuje da na ovoj raskrsnici ustupaš prvenstvo prolaza. Ona ne obavezuje na zaustavljanje uvek, nego samo kada treba propustiti vozila sa puta na koji izlaziš, i tada se staje na liniji zaustavljanja. Pešaci na prelazu se, razume se, propuštaju nezavisno od te oznake.' };
X[11022] = { x: 'Ispred žutog vozila su beli trouglovi okrenuti vrhom ka njemu, što je oznaka ustupanja prvenstva prolaza, a ne naredba obaveznog zaustavljanja. Zato žuto vozilo staje na liniji zaustavljanja samo ako treba da propusti vozilo sa puta na koji izlazi, kao zeleno na slici. Da je poprečna linija puna, uz naredbu stop, stajalo bi se i kada je put potpuno prazan.' };
X[11024] = { x: 'Poprečna linija zaustavljanja je isprekidana, pa te obavezuje da ustupiš prvenstvo prolaza, a ne da staneš u svakoj situaciji: na liniji se staje samo ako ima vozila koja treba propustiti. Zato ne stoji ni tvrdnja da se pred isprekidanom linijom uvek mora stati, ni ona da se ne staje jer vozilo dolazi sa leve strane — pravilo desne strane ovde ne važi, oznaka je već odredila ko kome ustupa prolaz.' };
X[11025] = { x: 'Niz širokih kosih belih pravougaonika koji ide ukoso preko kolovoza je kosnik, a ovde vodi ka mestu na kome se traka pored njega završava — otuda označava zatvaranje saobraćajne trake, pa se blagovremeno prelazi u susednu. Isto tako izgleda i kosnik kod otvaranja trake, ali se tamo broj traka ispred povećava, a ne smanjuje. Površina za zaustavljanje i parkiranje se obeležava sasvim drugačije.' };
X[11026] = { x: 'Bela površina u obliku klina, tamo gde se prilazni put spaja sa kolovozom, je graničnik: deo kolovoza na kome je saobraćaj zabranjen, jer razdvaja tok koji se uliva od onog na glavnom putu. Preko njega se ne prelazi, nego se sačeka mesto na kome se trake stvarno spajaju. Nije reč o kosniku, koji obeležava zatvaranje odnosno otvaranje trake, ni o površini za prinudno zaustavljanje.' };
X[11027] = { x: 'Prelaz je obeležen sa dva reda belih kvadrata duž ivica, dakle kao dve isprekidane linije, i nastavlja se na stazu kojom stižu biciklisti — to je prelaz biciklističke staze preko kolovoza. Pešački prelaz izgleda drugačije: široke pune bele pruge poređane preko cele širine prelaza. A linija ispred koje se vozilo zaustavlja je jedna poprečna linija preko trake, ne dvostruki niz kvadrata.' };
X[11028] = { x: 'Strelica u saobraćajnoj traci naređuje smer kretanja, a ova je nacrtana tako da telo ide pravo i tek se pri vrhu savija ulevo, dok niže preko tela stoji kratak poprečni krak ulevo bez vrha — levo se, dakle, ne sme na prvoj, nego tek na drugoj raskrsnici. Ovo nije obaveštenje o nameni traka jer oznaka naređuje, a skretanje saobraćaja znači preusmeravanje vozila na drugu putanju.' };
X[11029] = { x: 'Crveni trougao sa likovima dece naslikan na kolovozu ponavlja upozoravajući znak sa stuba i najavljuje deo puta na kome se često kreću deca, u blizini škole, vrtića ili igrališta. Početak zone škole obeležava se natpisom i posebnim znakom, a ne ovim trouglom. Pešačka staza je površina odvojena od kolovoza i obeležava se plavim znakom, ne oznakom nasred saobraćajne trake.' };
X[11030] = { x: 'Žute ukrštene linije iscrtane su na trotoaru, tačno ispred kolskog ulaza u dvorište — tu ne smeš da ostaviš vozilo ni nakratko, jer bi presekao prolaz vozilima koja ulaze i izlaze. Autobusko stajalište se obeležava žutim natpisom BUS i cik-cak linijom, a zabrana zaustavljanja na samom kolovozu ide kao žuta linija uz ivicu, ne kao krstovi na trotoaru.' };
X[11031] = { x: 'Veliki beli trougao okrenut vrhom nadole naslikan pred raskrsnicom ponavlja znak ustupanja prvenstva: usporavaš, gledaš put na koji izlaziš i propuštaš vozila po njemu, ali ne moraš da staneš ako je slobodno. Naredba obaveznog zaustavljanja crta se kao crveni osmougao ili natpis sa slovima, a zabrana saobraćaja za sva vozila je crveni krug na stubu, ne oznaka na asfaltu.' };
X[11032] = { x: 'Crveni osmougao naslikan na kolovozu je kopija znaka sa stuba koji stoji tik iznad njega: vozilo mora potpuno da stane pre raskrsnice i propusti vozila sa puta na koji izlazi, bez obzira na to koliko je pregledno. Trougao okrenut vrhom nadole tražio bi samo ustupanje prvenstva, bez obaveznog stajanja, a zabrana saobraćaja za sva vozila je crveni krug na stubu, ne oznaka na kolovozu.' };
X[11033] = { x: 'Krupna bela slova na asfaltu idu uz znak pored puta i uz debelu poprečnu liniju ispred raskrsnice — vozilo se potpuno zaustavlja pred tom linijom, pa tek onda propušta vozila sa puta koji preseca. Da je u pitanju samo ustupanje prvenstva, na kolovozu bi bio nacrtan trougao okrenut vrhom nadole. Zabrana saobraćaja za sva vozila obeležava se crvenim krugom na stubu.' };
X[11035] = { x: 'Beli simbol bicikla iscrtan je na površini koju od kolovoza odvaja uzdužna linija, a uz stazu stoji i plavi okrugli znak sa biciklom — sve to govori da je staza namenjena biciklistima. Spojena biciklistička i pešačka staza nosila bi uz bicikl i lik pešaka. Završetak staze se ne obeležava ovim simbolom, nego znakom sa precrtanim biciklom.' };
X[11036] = { x: 'Simbol invalidskih kolica naslikan je unutar žuto obeleženog parking mesta, a pored njega stoji plavi znak za parkiranje sa istim simbolom — mesto je rezervisano isključivo za vozila osoba sa invaliditetom i drugom vozilu tu nije mesto ni nakratko. Površina za kretanje osoba u kolicima ne bi bila iscrtana kao parking mesto uz ivicu kolovoza, a blizina pešačkog prelaza se najavljuje znakom.' };
X[11037] = { x: 'Žuti natpis i žuta izlomljena linija duž ivice kolovoza obeležavaju stajalište, mesto gde vozilo javnog prevoza staje samo dok putnici uđu i izađu — zato to nije parkiralište, niti se drugim vozilima dozvoljava zaustavljanje na njemu. Mesto za taksi vozila bilo bi obeleženo drugim natpisom, unutar žutog okvira uz ivicu kolovoza.' };
X[11038] = { x: 'Žuti natpis unutar žutog isprekidanog okvira uz ivicu kolovoza rezerviše prostor za taksi vozila koja čekaju vožnju. Ostalim vozilima tu nije dozvoljeno ni zaustavljanje, pa opcija koja im to dopušta ne može biti tačna. Mesto za vozila javnog gradskog prevoza obeležava se natpisom BUS i izlomljenom cik-cak linijom, a ne ovim natpisom.' };
X[11044] = { x: 'Semafor iznad kolovoza i onaj sa strane pokazuju zeleno, a prelaz ispred tebe je slobodan — zeleno svetlo dozvoljava prolaz, pa nema razloga da staješ. Ispred linije zaustavljanja se staje kada je upaljeno crveno ili kada znak naređuje obavezno zaustavljanje, a ovde nije ni jedno ni drugo. Linija preglednosti nije oznaka na kolovozu i sa zelenim svetlom nema nikakve veze.' };
X[11046] = { x: 'Semafori sa obe strane raskrsnice pokazuju crveno, a ispred tebe je poprečna neisprekidana linija — pred njom se staje i čeka, čak i kada je raskrsnica prazna i put slobodan. Prolazak bez zaustavljanja bio bi prolazak kroz crveno svetlo. Linija preglednosti dolazi u obzir tek tamo gde linija zaustavljanja nije iscrtana, a ovde je jasno obeležena.' };
X[11050] = { x: 'Znak pored puta traži bezuslovno zaustavljanje, a mesto na kome se staje je poprečna neisprekidana linija iscrtana ispred pešačkog prelaza, tik ispred tebe. Zato se tu ne bira: prvo se obavezno staje kod te linije, pa se tek ako se odatle ne vidi put na koji izlaziš oprezno prilazi mestu sa kog imaš pregled. Zaustavljanje samo na liniji preglednosti nije dovoljno.' };
X[11053] = { x: 'Ispred tebe je poprečna neisprekidana linija na kolovozu, a iza nje rampa i znak koji naređuje zaustavljanje radi kontrole. Kada je linija zaustavljanja iscrtana, ona je označeno mesto zaustavljanja i staje se ispred nje, a ne uz samu rampu, koja je prepreka a ne mesto zaustavljanja. Zato ni zaustavljanje uz zaprečno sredstvo ni izbor između to dvoje nisu tačni.' };
X[11054] = { x: 'Kosnik je široka kosa linija koja pod uglom povezuje ivicu kolovoza sa novom trakom, a uz nju ide široka isprekidana linija — takav sklop stoji tamo gde traka počinje, pa tvoja putanja ostaje ista. Kod zatvaranja trake klin bi te postepeno izmeštao u susednu traku. Bela obeležena površina uz ivicu nije prostor za zaustavljanje ni parkiranje, ona samo razdvaja tokove.' };
X[11065] = { x: 'Ivicu kolovoza obeležava neisprekidana bela linija uz sam rub asfalta, a to su ovde obe spoljne linije, leva i desna — iza njih je bankina, ne više kolovoz. Puna linija označena trojkom nalazi se u sredini kolovoza i razdvaja smerove vožnje, a četvorka pokazuje isprekidanu liniju uz nju, koja pripada traci suprotnog smera. Nijedna od te dve ne govori gde se kolovoz završava.' };
X[11068] = { x: 'U crvenom krugu je nacrtano samo priključno vozilo, bez ikakvog izuzetka, pa je zabranjena vuča bilo kog priključnog vozila. Vrlo slična zabrana sa repom „osim poluprikolice“ je poseban znak, na kome je uz prikolicu nacrtano i vučno vozilo. Zabrana za teretna vozila je treći znak — na njemu je kamion bez ičega prikačenog.' };

// --- objašnjenja za slikovna pitanja (talas 3) ---
X[9077] = { x: 'Slovo E ispred broja i zelena podloga su oznaka evropske, dakle međunarodne putne mreže — tabla ti samo govori kojim putem se krećeš i ništa ne naređuje. Domaći putevi nose broj bez slova E i na drugačijoj podlozi, pa su magistralni i regionalni put ovde samo mamci: brojevi jesu slični, ali oznaka sa slovom E pripada isključivo međunarodnom putu.' };
X[9082] = { x: 'Prednja silueta automobila na plavoj podlozi je simbol motoputa, a debela crvena kosa traka preko znaka je opšti mehanizam kraja — isti znak precrtan crvenom trakom zatvara ono što je bez nje otvarao. Autoput ima svoju zelenu tablu sa dve kolovozne trake i nadvožnjakom, pa taj odgovor pada već na boji i simbolu, a parkiralište bi nosilo slovo P.' };
X[9083] = { x: 'Zelena podloga i simbol dve kolovozne trake sa nadvožnjakom su znak autoputa, a crvena kosa traka preko njega znači kraj tog režima; isti znak bez trake označava mesto odakle autoput počinje. Nadvožnjak je samo deo crteža autoputa, a ne poruka znaka, pa odgovor o blizini nadvožnjaka otpada; ne završava se ni put, nego samo autoput kao vrsta puta.' };
X[9085] = { x: 'Ova mala tabla je putarska evidencija: prvi broj je oznaka puta, duži broj je oznaka deonice, a broj uz oznaku km je stacionaža, to jest koliko je kilometara prešao put od početka te deonice. Zato taj broj ne meri ni rastojanje do graničnog prelaza ni do kraja puta — udaljenosti do odredišta stoje na tablama za vođenje saobraćaja, uz naziv mesta.' };
X[9088] = { x: 'Plavi krug sa figurama pešaka je znak pešačke staze, a crvena kosa traka preko njega kaže da se staza tu završava. Zone se ne ukidaju ovako: kraj pešačke zone je bela tabla sa natpisom preko koje idu tanke crne kose crte, a kraj zone usporenog saobraćaja je plava tabla sa figurama i kućom, precrtana crvenom trakom. Gledaj oblik i vrstu crte.' };
X[9092] = { x: 'Ključ je ono što stoji uz slovo P: iznad njega je nacrtan krov, a krov znači da se parkira u objektu, dakle u garaži sa parking mestima. Golo slovo P je obično parkiralište, a P uz simbol parking-sata je parkiralište sa vremenski ograničenim parkiranjem. Sve tri varijante ti se nude zajedno, pa uvek prvo potraži dodatak uz slovo.' };
X[9094] = { x: 'Uz slovo P nacrtan je parking-sat, i baš taj sat kaže da je vreme parkiranja ograničeno. Da je P samo, bilo bi obično parkiralište; da iznad njega stoji krov, bila bi garaža; da je dodat simbol drugog prevoznog sredstva, bilo bi parkiralište sa koga putovanje nastavljaš vozom ili autobusom. Znači, dodatak uz P nosi celo značenje znaka.' };
X[9095] = { x: 'Uz slovo P na ovoj tabli nema ničega, a golo P znači obično parkiralište, prostor određen za parkiranje vozila. Garaža bi imala krov iznad slova, a vremenski ograničeno parkiranje simbol parking-sata pored njega. Kad na znaku nema dodatnog simbola, nema ni dodatnog uslova — nemoj u obaveštenje da učitavaš ograničenje koje na njemu ne piše.' };
X[9102] = { x: 'Znakovi usluga su plave table sa belim poljem i crnim simbolom, a simbol ti kaže šta te čeka pored puta: šoljica na tacni je kafana. Restoran ima ukrštene kašiku i viljušku, a hotel odnosno motel krevet, i ta tri znaka se na ispitu redovno nude jedan umesto drugog. Zapamti simbol, jer se odgovori razlikuju samo po vrsti objekta.' };
X[9106] = { x: 'Na znaku je nacrtan samo šator, pa on najavljuje teren uređen za kampovanje pod šatorima. Prikolica bi značila teren za boravak u prikolicama, a šator i prikolica zajedno teren za oboje. Teren za izletnike prikazuje sto sa klupom pored drveta, a planinarski dom kuću pored drveta — ni na jednom od njih nema šatora, pa oba odmah otpadaju.' };
X[9117] = { x: 'Na tabli su samo broj i nadmorska visina, bez naziva mesta i bez ikakvog simbola, a to je oznaka serpentine: broj je njen redni broj na usponu, a visina govori dokle si se popeo. Planinski prevoj bi uz visinu imao i ime i simbol sedla, a znak putnog objekta piktogram tunela ili mosta i dužinu u metrima. Prvo proveri ima li simbola i imena.' };
X[9118] = { x: 'Simbol talasa označava vodeni tok, a natpis ispod njega je ime tog toka, pa znak stoji tamo gde put prelazi reku i kaže ti kako se ona zove. Turističko odredište se označava znakom za vođenje sa strelicom ili simbolom sadržaja, a naziv putnog objekta ide uz piktogram tunela ili mosta i uz njegovu dužinu u metrima — toga ovde nema.' };
X[9120] = { x: 'Plava tabla sa natpisom policija je obaveštenje o objektu pored puta: u blizini je stanica policije. Obaveštenje ništa ne naređuje, pa iz njega ne sledi ni obaveza zaustavljanja ni traženje odobrenja za prolaz; to bi bila izričita naredba. Ni raskrsnicu na kojoj saobraćaj reguliše policijski službenik ne najavljuje tabla, nego samo lice na putu.' };
X[9121] = { x: 'Romb sa žutim poljem i belim pojasom oko njega je znak puta sa prvenstvom prolaza: dok se krećeš tim putem, vozila sa puteva koji ga presecaju moraju da te propuste. Oba mamca su iz porodice izričitih naredbi — trougao okrenut vrhom nadole nalaže tebi da ustupiš prvenstvo, a osmougaonik sa natpisom stop da se pre raskrsnice obavezno zaustaviš.' };
X[9122] = { x: 'To je isti romb puta sa prvenstvom prolaza, samo što preko njega ide snop tankih crnih kosih crta, a crne crte su opšti znak prestanka: odatle se put sa prvenstvom završava i dalje važe opšta pravila o raskrsnicama. Neprecrtan romb bi značio da prvenstvo i dalje traje, a jednosmerni put se označava tablom sa strelicom, nikako rombom.' };
X[9123] = { x: 'Simbol nalik na dve zagrade okrenute leđima crta sedlo prevoja, ispod njega stoji ime, a na dnu visina uz oznaku metara nadmorske visine — dakle planinski prevoj i visina na kojoj se nalazi. Taj broj nije dužina puta preko prevoja, pa taj odgovor otpada, a znak putnog objekta bi umesto sedla nosio piktogram tunela ili mosta.' };
X[9125] = { x: 'Bela tabla sa crnim natpisom i rečju ulica ispred imena je obična ulična tabla: kaže ti samo kako se ulica zove i ništa više od toga. Turističko odredište i kulturno-istorijski objekat označavaju se znakovima za vođenje, sa strelicom, simbolom sadržaja ili udaljenošću, a ovde nema ni strelice, ni simbola, ni broja kilometara.' };
X[9126] = { x: 'Četvorougaona tabla obaveštava, ne naređuje. Bela strelica nagore na plavoj kvadratnoj tabli kaže ti da se saobraćaj na tom putu odvija samo u jednom smeru, i to u smeru strelice. Da je isti crtež u plavom krugu, bila bi naredba o obaveznom smeru kretanja, a smer kojim kretanje nije dozvoljeno označava se crvenim krugom sa belom prečkom.' };
X[9127] = { x: 'Ovo je položena varijanta iste table: pravougaonik sa vodoravnom belom strelicom obaveštava te da je put jednosmeran i da se njime ide u smeru u koji strelica pokazuje. Znak i dalje ništa ne naređuje — obavezan smer kretanja bio bi plavi krug sa strelicom, a zabranjen smer crveni krug sa belom prečkom, pa te oblik table odvaja od obe naredbe.' };
X[9128] = { x: 'Plava kvadratna tabla obaveštava, ne naređuje: bela šema pokazuje put koji se posle poprečnog kraka završava crvenom prečkom, pa iz nje čitaš i gde se slepi krak nalazi i to da iz njega nema izlaza. Prethodno obaveštenje radi prestrojavanja je sasvim druga tabla, sa strelicama iznad saobraćajnih traka, i stoji pre raskrsnice. Stanica za prvu pomoć bi imala crveni krst na belom polju, a ovde je crvena samo prečka koja zatvara put.' };
X[9129] = { x: 'Bela kvadratna tabla sa jednom krupnom crnom strelastom oznakom nije ni krug ni trougao, pa ništa ne zabranjuje i ništa ne najavljuje: ona te vodi kroz zavoj i kaže da tu nailaziš na oštru krivinu, a vrh oznake pokazuje na koju stranu put skreće. Približavanje krivini nalevo opasnoj zbog fizičkih karakteristika ili slabe preglednosti je trougao sa crvenim rubom, dakle znak opasnosti. Jednosmerni put ima strelicu na plavoj podlozi, a ovde je podloga bela.' };
X[9130] = { x: 'Krupna crna strelasta oznaka na beloj podlozi pripada znakovima obaveštenja: ne zabranjuje i ne upozorava unapred, nego ti na licu mesta pokazuje da nailaziš na oštru krivinu i na koju stranu ona vodi. Najava krivine nadesno, opasne zbog fizičkih karakteristika ili nedovoljne preglednosti, je trougao sa crvenim rubom. Jednosmerni put je plava tabla sa strelicom, pa ni taj odgovor ne odgovara onome što vidiš.' };
X[9131] = { x: 'Izdužena bela tabla sa tri crne strelaste oznake okrenute u istu stranu je samo šira varijanta istog znaka: broj oznaka ne menja značenje, i dalje je reč o mestu gde se nailazi na oštru krivinu. Oba ponuđena mamca su trouglovi sa crvenim rubom, jedan za krivinu nalevo, drugi za niz uzastopnih opasnih krivina, a trougao upozorava unapred i razlikuje se već po obliku i boji ruba.' };
X[9132] = { x: 'Iako je reč o autoputu, ovaj znak je izuzetak od pravila boje: plav kvadrat sa belom kosom strelicom koja se odvaja u stranu označava baš mesto na kome se izlazi sa autoputa. Izlaz iz tunela u slučaju opasnosti izgleda sasvim drugačije, to je zelena tabla sa belom figurom koja trči ka vratima. Nikakav putni objekat na znaku nije nacrtan, pa ni treći odgovor nema uporište u slici.' };
X[9133] = { x: 'Tri crne strelaste oznake na beloj podlozi, okrenute na istu stranu, znače isto što i jedna: mesto gde se nailazi na oštru krivinu. Znak te vodi kroz zavoj i stoji u samoj krivini, pa nije najava opasnosti. Oba mamca su trouglovi sa crvenim rubom, jedan za krivinu nadesno, drugi za više uzastopnih opasnih krivina, a trougao upozorava unapred i po obliku se odmah razlikuje od ove table.' };
X[9135] = { x: 'Autobus je u običnom belom krugu, bez crvenog ruba, što znači da traka jeste namenjena tim vozilima, a debela crvena kosa traka preko znaka govori da se tu ta traka završava. Zabrana bi tražila crveni rub oko simbola, pa odgovor o traci kojom je autobusima zabranjeno kretanje otpada. Drugi mamac greši u opsegu: traka je namenjena vozilima javnog prevoza putnika, a autobus je samo simbol te grupe.' };
X[9143] = { x: 'Plava tabla sa pešakom, automobilom, detetom sa loptom i kućom je znak zone usporenog saobraćaja, a debela crvena kosa traka preko nje uvek znači kraj onoga što taj znak uvodi. Zona škole i pešačka zona su bele table sa ispisanim natpisom i umetnutim znakom, i njihov kraj se obeležava snopom tankih crnih kosih crta, nikad crvenom trakom. Pošto ovde nema ni natpisa ni umetnutog znaka, oba mamca otpadaju već po izgledu table.' };
X[9146] = { x: 'Ista plava tabla, ali bez ikakve crte preko nje, znači početak: od tog mesta počinje zona usporenog saobraćaja, koju prepoznaješ po figurama pešaka, automobila, deteta sa loptom i kuće. Zona škole i pešačka zona se ne crtaju ovako, one su bele table sa ispisanim natpisom i umetnutim okruglim ili kvadratnim znakom. Sam znak te obaveštava u kakvu sredinu ulaziš, a posebna pravila koja u toj zoni važe propisana su zakonom.' };
X[9149] = { x: 'Zeleno polje sa belom figurom koja trči ka uspravnom belom polju je oznaka izlaza za pešake u slučaju opasnosti, kakva se postavlja u tunelu. Sam znak samo pokazuje gde su ta vrata, bez strelice i bez upisane udaljenosti. Podzemni ili nadzemni pešački prolaz je plavi kvadrat sa figurom na stepenicama, dakle druga boja i drugi piktogram, a sa sportskim ili rekreativnim sadržajem ovaj simbol nema nikakve veze.' };
X[9151] = { x: 'Bela tabla sa ispisanim natpisom i umetnutim fluorescentnim žuto-zelenim kvadratom sa figurama dece je tipičan znak zone: natpis kaže koja je zona, umetnuti znak kakav režim u njoj važi, a pošto preko table nema nikakvih crta, reč je o njenom početku. Zona usporenog saobraćaja je plava tabla sa pešakom, automobilom i kućom, bez natpisa. Deo puta na kome se deca češće kreću najavljuje trougao opasnosti, a ovde imaš tablu koja obaveštava.' };
X[9152] = { x: 'Ista tabla zone škole, ali preko nje ide snop tankih crnih kosih crta, a umetnuti kvadrat je prebačen u sivu, crno-belu verziju; tako se obeležava kraj svake zone sa bele table. Kraj zone usporenog saobraćaja izgleda drugačije, to je plava tabla sa figurama preko koje ide debela crvena kosa traka. Deo puta na kome se deca češće kreću najavljuje trougao opasnosti, a znakovi opasnosti se ovakvom tablom sa natpisom ne ukidaju.' };
X[9153] = { x: 'Zelena podloga ti kaže da si na autoputu, a šema pokazuje trake sa strelicama u istom smeru; u levoj traci nacrtan je simbol teretnog vozila u crvenom krugu. Crveni krug isključuje, pa baš ta traka nije za vozila prikazanog simbola, dok ostalim trakama ona i dalje smeju da se kreću. Da simbol stoji u običnom belom krugu, značenje bi bilo obrnuto. Zabrana za celu deonicu bila bi samostalan okrugli znak, a ne šema traka.' };
X[9155] = { x: 'Zelena podloga je rezervisana za autoput, a beli simbol dva kolovoza koji se pružaju ispod poprečne grede označava mesto od koga autoput počinje i od koga važe njegova posebna pravila. Kraj autoputa je ista tabla preko koje ide debela crvena kosa traka, a nje ovde nema. Nadvožnjak je samo deo crteža kojim se dočarava put bez ukrštanja u nivou, pa nailazak na nadvožnjak nije značenje ovog znaka.' };
X[9156] = { x: 'Zeleno polje, bela figura koja trči i uspravno belo polje uz nju uvek znače isto: izlaz kojim pešaci napuštaju put u slučaju opasnosti. To što su vrata nacrtana sa leve strane prati stvarni raspored na licu mesta i ne menja značenje znaka. Prolaz za pešake ispod ili iznad puta je plav znak sa figurom na stepenicama, a odgovor o objektu za rekreaciju vezuje ovaj simbol za sadržaj koji sa njim nema veze.' };
X[9157] = { x: 'Tabla je strelasto oblikovana i sama pokazuje stranu na kojoj je izlaz, a pored figure nosi vodoravnu strelicu i upisanu udaljenost, pa zato govori i o smeru i o tome koliko ima do izlaza. Najbliži mamac je običan kvadratni znak sa figurom i vratima: on označava sam izlaz, ali nema ni strelicu ni broj metara. Objekat za rekreaciju ovde nije prikazan nijednim simbolom.' };
X[9158] = { x: 'Isti znak samo okrenut na drugu stranu: šiljak table i strelica pokazuju stranu na kojoj je izlaz, a upisani broj metara govori koliko ima do njega, pa odgovor mora da sadrži i smer i udaljenost. Kvadratni znak sa figurom i vratima označava sam izlaz i nema ni strelicu ni udaljenost, pa je zato netačan. Sa objektima za rekreaciju i sport ovaj simbol nema veze, a strana puta se navodi samo da bi mamac zvučao uverljivo.' };
X[9162] = { x: 'Boja odlučuje: plava tabla sa belim automobilom viđenim spreda označava mesto odakle počinje motoput, dok je autoput uvek zelena tabla sa simbolom dva kolovoza ispod poprečne grede. Parkiralište bi moralo da nosi slovo P, a na ovoj tabli nema nikakvog slova. Znak ništa ne naređuje, samo ti kaže od kog mesta počinje put sa posebnim režimom kretanja.' };
X[9176] = { x: 'Tabla nosi samo oznaku puta i spisak mesta sa udaljenostima, bez ijedne strelice i bez crteža puteva koji se ukrštaju; takva tabla stoji posle raskrsnice i potvrđuje ti da si ostao na pravcu koji si hteo. Prethodno obaveštenje radi prestrojavanja imalo bi strelice po saobraćajnim trakama i stajalo bi pre raskrsnice. Znak raskrsnice crta međusobni položaj puteva, a takve šeme ovde nema.' };
X[9185] = { x: 'Zelena podloga i simbol izlazne rampe sa autoputa govore da si na autoputu, a ime uz broj u kružiću je oznaka petlje koja te čeka za 400 metara — znak samo najavljuje kako se ta petlja zove. Potvrda pravca kretanja stoji tek posle raskrsnice i nosi nazive mesta, a ne ime petlje sa udaljenošću. Ni odgovor o položaju putnog pravca do naseljenog mesta ne prolazi: ovo ime je naziv same petlje, a ne odredišta do kog te znak vodi.' };
X[9186] = { x: 'Zelena podloga znači autoput, a simbol ukrštanja dva puta u dva nivoa, sa brojem u kružiću i imenom ispod njega, oznaka je petlje na koju nailaziš za 750 metara. Znak ništa ne naređuje — samo ti unapred kaže kako se ta petlja zove. Potvrda pravca kretanja postavlja se posle raskrsnice i ne nosi udaljenost, a ispisano ime ovde nije naseljeno mesto do kog te znak vodi, nego naziv petlje.' };
X[9188] = { x: 'Žuta podloga sa crnim strelicama je porodica znakova za skretanje traka i devijaciju. Obe strelice idu nagore i obe se u sredini lome u istu stranu: smer ostaje isti, broj traka se ne menja, samo su trake pomerene bočno. Zato nijedan od trouglova ne dolazi u obzir — ni najava krivine nadesno ni najava niza uzastopnih krivina, jer bi te tada upozoravao trougao sa crvenim rubom, a ne žuta pravougaona tabla.' };
X[9189] = { x: 'Tabla je oblikovana kao strelica i nosi natpis obilazak — to je jedan od retkih izuzetaka od pravila da znak obaveštenja bude kvadrat ili pravougaonik. Vrh strelice ti pokazuje kuda da skreneš dok je redovan put zatvoren, pa znak služi za usmeravanje vozila na obilazni put. Jednosmerni put obeležava tabla sa strelicom i bez natpisa, a turistički strelasti putokaz nosi ime odredišta ili objekta, ne reč obilazak.' };
X[10880] = { x: 'Plava kvadratna tabla obaveštava, ne naređuje: na suženom delu puta prednost pripada tvom smeru, koji je na znaku bela strelica, dok je crvena strelica smer koji mora da čeka. Zabranu stupanja na suženje nosi okrugli znak sa crvenim rubom — krug naređuje, a ovde kruga nema. Početak dvosmernog saobraćaja najavljuje trougao sa crvenim rubom i dve jednake crne strelice, dakle znak opasnosti iz sasvim druge porodice.' };
X[10881] = { x: 'Plavi kvadrat sa belim trouglom, pešakom i zebrom kaže gde prelaz stvarno jeste — to je obaveštenje o mestu pešačkog prelaza, a ne njegova najava. Nailazak na obeleženi prelaz najavljuje trougao sa crvenim rubom, dakle znak opasnosti koji stoji pre prelaza. Zabranu saobraćaja za pešake nosi beli krug sa crvenim rubom i crnim pešakom u sredini, bez ikakve crte preko njega, a zabrane ovaj plavi znak uopšte ne izriče.' };
X[10882] = { x: 'Na znaku su dve odvojene šeme jedna iznad druge: pešak na zebri i biciklista na svom obeleženom prelazu — plava tabla kaže da se na tom mestu nalaze i pešački prelaz i prelaz biciklističke staze. Put po kome se pešaci i biciklisti kreću odvojeno, svako svojom stazom, obeležava plavi krug, dakle obaveza, a čest prelazak pešaka i biciklista preko puta najavljuje trougao sa crvenim rubom, dakle opasnost.' };
X[10883] = { x: 'Figura koja silazi niz stepenice je ključ: stepenice znače da pešaci put prelaze ispod ili iznad kolovoza, pa je ovo obaveštenje o podzemnom, odnosno nadzemnom pešačkom prolazu. Zebra bez stepenica na plavoj tabli označava mesto pešačkog prelaza po kolovozu, a nailazak na obeleženi prelaz najavljuje trougao sa crvenim rubom — znak opasnosti, ne obaveštenja.' };
X[10884] = { x: 'Ime mesta je ispisano na tabli i preko njega ide crvena kosa traka — precrtano znači kraj, pa je ovo granica od koje se završava naseljeno mesto čiji naziv na znaku piše. Kraj naselja obeležava druga tabla, ona sa crnom siluetom kuća i bez ikakvog imena, zato prvo pogledaj da li na znaku stoji naziv. Odredište ili objekat turističkog značaja ima sasvim drugu tablu i ne ukida se ovako.' };
X[10885] = { x: 'Beli krug sa crnim simbolom i snopom tankih crnih kosih crta uvek znači prestanak nečega što je uveo crveni krug. Ispod crta je nacrtana truba, pa od ovog mesta prestaje zabrana davanja zvučnih znakova upozorenja. Sama zabrana je isti simbol u crvenom krugu, bez crta — nju ovde vidiš precrtanu. Odredište od kulturno istorijskog značaja nema veze sa ovom porodicom: ono se obeležava tablom sa natpisom.' };
X[10886] = { x: 'Plavi krug je porodica obaveza, a debela crvena kosa traka preko njega tu obavezu ukida. Simbol je točak sa lancima, pa od ovog mesta prestaje obaveza nošenja lanaca za sneg. Zimska oprema je širi pojam i ima svoj znak, koji ovde ne vidiš. Nova zabrana bi tražila crveni krug ili crveni rub oko simbola — crvena je ovde samo traka preko plavog znaka, a to je prestanak obaveze, ne uvođenje zabrane.' };
X[10888] = { x: 'Bela tabla sa natpisom zona i umetnutim znakom uvek govori o režimu za celu zonu, a ne za jednu stranu puta. Umetnut je znak zabranjenog parkiranja — plavo polje, crveni rub i jedna crvena dijagonala — pa je ovo mesto od kog zona zabrane parkiranja počinje. Obični znaci bez natpisa zona važe samo uz onu stranu puta na kojoj su postavljeni, a zabrana zaustavljanja i parkiranja ima dve crvene dijagonale.' };
X[10889] = { x: 'To je ista tabla zone, ali je umetnuti znak siv i preko cele table ide snop tankih crnih kosih crta — to znači kraj, pa se ovde završava zona zabrane parkiranja. Kod tabli sa natpisom zona kraj se obeležava crnim crtama, ne crvenom trakom. Odgovori o strani puta pripadaju običnim znakovima bez natpisa zona, koji važe samo uz onu stranu puta na kojoj stoje.' };
X[10890] = { x: 'Ispod slova P stoji dodatak koji sve odlučuje: automobil, strelica nadole i autobus znače parkiraj vozilo pa putovanje nastavi drugim prevoznim sredstvom, čiji je simbol prikazan na znaku. Vremenski ograničeno parkiranje ima uz slovo P nacrtan sat, a garaža krov nad parking mestom — nijedan od ta dva crteža ovde nije prikazan. Samo slovo P bez dodatka bilo bi obično parkiralište.' };
X[10891] = { x: 'Plava tabla sa belim poljem je porodica znakova za usluge uz put, a simbol alata u tom polju kaže koja te usluga čeka: radionica u kojoj se vozilo popravlja. Služba za pomoć u slučaju kvara na vozilu i objekat za tehnički pregled imaju svoje simbole i stalni su mamci uz ovaj znak. Kod usluga je podloga svuda ista, pa gledaj isključivo šta je nacrtano u belom polju.' };
X[10892] = { x: 'Belo slovo H i natpis bolnica su ključ: znak javlja da je bolnica u blizini i uz to ti poručuje da vozilom ne stvaraš buku. Stanica za prvu pomoć nosi crveni krst na belom polju, dakle sasvim drugi simbol, iako se ta dva znaka na ispitu stalno nude jedno umesto drugog. Zdravstvena ustanova u kojoj se pregledaju vozači je treći mamac uz oba znaka i nema ni slovo H ni ovaj natpis.' };
X[10893] = { x: 'U belom polju nacrtana je samo telefonska slušalica, pa znak obaveštava da je u blizini telefonska govornica. Turističke informacije imaju svoj, drugačiji simbol i redovno se nude kao mamac. Odgovor o korišćenju telefona za vreme vožnje je čista zamka: znak obaveštenja ne daje nikakvu dozvolu, on ti samo kaže šta te na putu čeka.' };
X[10894] = { x: 'Crveni krst na belom polju je simbol prve pomoći, pa plava tabla obaveštava da se na tom mestu ili u blizini nalazi stanica za prvu pomoć. Blizinu bolnice obeležava belo slovo H uz natpis bolnica i to je glavni mamac uz ovaj znak. Zdravstvena ustanova u kojoj se pregledaju vozači nudi se uz oba znaka, ali je krst na putnom znaku rezervisan za prvu pomoć.' };
X[10895] = { x: 'U belom polju nacrtana je pumpa sa crevom, pa ti znak javlja da je u blizini benzinska stanica. Telefonska govornica ima slušalicu, a turističke informacije svoj poseban simbol — oba se ovde nude kao mamci. Kod znakova usluga podloga je uvek ista plava, pa te boja ne razlikuje ništa: odlučuje isključivo crtež u belom polju.' };
X[10896] = { x: 'Krevet u belom polju je simbol prenoćišta, pa znak obaveštava da su u blizini hotel odnosno motel. Teren za kampovanje crta se šatorom, a boravak u prikolicama prikolicom — ni jedan ni drugi simbol ovde ne vidiš. Tehnička sredstva za usporavanje saobraćaja obeležava plava tabla sa izbočinom na kolovozu, dakle sasvim drugi crtež, pa i taj odgovor vodi u pogrešnu grupu.' };
X[10897] = { x: 'Znakovi usluga su plave table sa belim poljem; ovde su u polju drvo i sto sa klupom, a sto pored drveta označava uređeno izletište, mesto za predah i obed na otvorenom. Kamp pod šatorima nosi šator, a planinarski dom kuću pored drveta — pošto kućice nema, ostaje izletnik. Ključ je uvek ono što stoji pored drveta, jer je drvo zajedničko za oba znaka.' };
X[10898] = { x: 'Ukrštene kašika i viljuška u belom polju plave table znače mesto gde se jede, dakle restoran; znak te samo obaveštava da je usluga u blizini. Kafanu obeležava šoljica na tacni, a hotel ili motel krevet — oba se nude baš zato što su iz iste porodice usluga. Gledaj simbol, a ne koliko odgovori zvuče slično.' };
X[10900] = { x: 'U belom polju je nacrtana samo prikolica, bez šatora, pa znak najavljuje teren uređen za boravak u prikolicama. Da su nacrtana oba simbola, važio bi odgovor o kampovanju i pod šatorima i u prikolicama, zato prvo prebroj simbole. Teren za izletnike prepoznaješ po stolu i klupi pored drveta, čega ovde nema.' };
X[10902] = { x: 'Na znaku su dva simbola jedan iznad drugog, šator i prikolica, pa je to teren koji prima i one koji spavaju pod šatorom i one u prikolici. Da je nacrtan samo šator, tačan bi bio odgovor o kampovanju pod šatorima. Planinarski dom je kuća pored drveta, a izletište sto sa klupom — drveta na ovom znaku uopšte nema.' };
X[10903] = { x: 'Pored drveta je nacrtana kućica, a kuća uz drvo u ovoj grupi znači planinarski dom. Isti crtež sa stolom i klupom umesto kuće bio bi teren uređen za izletnike, zato ne gledaj drvo, ono je zajedničko, nego ono što stoji pored njega. Kampovanje pod šatorima imalo bi šator, koga ovde nema.' };
X[10904] = { x: 'Plava tabla sa belim poljem u ovoj grupi pokazuje uslugu uz put, a aparat iz koga mlaz izlazi na plamen simbol je vatrogasne službe. Zato ti znak kaže gde ti je najbliža služba za gašenje požara, a ne da tu stoji aparat na raspolaganju niti da nešto moraš da gasiš — obaveštenje nikada ništa ne naređuje.' };
X[10905] = { x: 'U belom polju je samo silueta autobusa, bez šeme kolovoza i traka, pa je reč o mestu na kome autobus staje. Traka za vozila javnog prevoza izgleda sasvim drugačije: to je široka tabla sa nacrtanim trakama i strelicama, a autobus je na njoj u kružiću. Tramvajsku stanicu odaje pantograf na krovu vozila.' };
X[10906] = { x: 'U belom polju je brod na talasima, a brod u grupi usluga označava luku, pristanište ili mesto ukrcavanja na trajekt. Pokretni most i izlazak puta na rečnu ili morsku obalu jesu opasnosti i idu na trougao sa crvenim rubom, a ne na plavu kvadratnu tablu — oblik i boja te odmah izvode iz te zamke.' };
X[10907] = { x: 'Vozilo u belom polju ima pantograf na krovu, po čemu ga prepoznaješ kao tramvaj, pa plava tabla označava mesto gde tramvaj staje. Ukrštanje puta i tramvajske pruge u nivou je opasnost i crta se na trouglu sa crvenim rubom, dakle druga porodica znakova. Autobusko stajalište ima istu tablu, ali sa siluetom autobusa i bez pantografa.' };
X[10908] = { x: 'Tabla nosi naziv planinskog vrha, a ispod njega polje sa porukom o prohodnosti prelaza; ovde je to polje zeleno i kaže da je put otvoren, dok polja ispod nose dodatna obaveštenja o uslovima, na primer o lancima. Naziv planinskog prevoja i naziv putnog objekta imaju svoje znakove, sa nadmorskom visinom, odnosno sa piktogramom tunela ili mosta.' };
X[10909] = { x: 'Silueta aviona na plavoj tabli sa belim poljem stoji u grupi usluga i vodi te do aerodroma. Niski letovi aviona iznad puta i bočni vetar koji oni izazivaju jesu opasnosti i idu na trougao sa crvenim rubom; kvadratna plava tabla nikada ne najavljuje opasnost, ona ti kaže šta se u blizini nalazi.' };
X[10910] = { x: 'U belom polju je piktogram tunela, ispod njega ime objekta i broj sa oznakom za metre, pa ti znak imenuje putni objekat na koji nailaziš. Taj broj je dužina objekta: da je reč o nadmorskoj visini, uz broj bi stajala oznaka m.n.m., a udaljenost od znaka do objekta se na ovakvoj tabli uopšte ne ispisuje.' };
X[10911] = { x: 'Broj stoji na plavoj kvadratnoj tabli, a ne u krugu, pa je reč o preporuci brzine za normalne uslove na tom delu puta. Crveni krug sa brojem bio bi zabrana kretanja brže od upisane brzine, a plavi krug obaveza da ne voziš sporije od nje. Tabla obaveštava i savetuje, dok krug naređuje — zato prvo gledaj oblik.' };
X[10912] = { x: 'Ista plava tabla sa brojem, ali preko nje ide crvena kosa traka, a ona uvek znači kraj onoga što je znak uveo, dakle prestaje preporuka te brzine. Prestanak ograničenja obeležava beli krug sa crnim brojem i snopom tankih crnih kosih crta, a prestanak obavezne najmanje brzine plavi krug sa belim brojem i crvenom trakom.' };
X[10914] = { x: 'Uska uspravna tabla sa naizmeničnim crnim i žutim vodoravnim poljima stoji na vrhu razdelnog ostrva i upozorava te da na njega nailaziš; sama tabla ništa ne naređuje, a s koje strane ostrvo obilaziš kaže plavi krug koji se postavlja iznad nje. Ukrštanje sa železničkom prugom u nivou najavljuju trougao i Andrejin krst, a stalne prepreke u profilu puta obeležavaju se na samoj prepreci, ne na vrhu ostrva.' };
X[10915] = { x: 'I ova tabla stoji na vrhu razdelnog ostrva, samo u drugoj varijanti: umesto vodoravnih polja tu su žuti šiljci na crnoj podlozi, okrenuti nagore. Poruka je ista kao kod varijante sa vodoravnim poljima — upozorava te da nailaziš na razdelno ostrvo. Pruga u nivou i stalne prepreke unutar profila puta imaju svoje znakove, pa ih ne traži u žuto-crnoj tabli.' };
X[10916] = { x: 'Tabla ispod znakova ima vodoravna crno-žuta polja, a uz tu varijantu ide plavi krug sa jednom kosom belom strelicom nadole: strelica ka dole-desno znači obilaženje s desne strane, a ka dole-levo s leve, pa su zato tačna dva znaka. Krug sa vodoravnom strelicom naređuje smer kretanja, a znak sa kružnim strelicama označava kružni tok.' };
X[10917] = { x: 'Uz tablu sa žutim šiljcima na crnoj podlozi ide plavi krug sa dve strelice koje se razilaze ulevo i udesno, jer se ostrvo tu sme obići sa obe strane; zato je tačan samo jedan znak. Krugovi sa jednom vodoravnom strelicom naređuju smer kretanja, a znak sa kružnim strelicama označava kružni tok i nad ovu tablu ne ide.' };
X[10918] = { x: 'Šema kolovoza na plavoj podlozi samo obaveštava čemu traka služi. Autobus je u običnom belom krugu, bez crvenog ruba, a uz tu traku ide isprekidana žuta linija — traka jeste namenjena vozilima javnog prevoza putnika; crveni krug bi značio suprotno. Autobusko stajalište je drugi znak, bez šeme traka, a formulacija samo za autobuse uža je od zakonskog pojma javnog prevoza putnika.' };
X[10919] = { x: 'Fluorescentni žuto-zeleni kvadrat sa dve crne figure dece sa torbama je znak obaveštenja, a ne trougao opasnosti: kaže ti da je blizu škola i da tu može biti pešački prelaz koji deca često koriste. Odgovor o delu puta na kome se deca često kreću pripada trouglastom znaku opasnosti, a zona škole je isti kvadrat umetnut u belu tablu sa natpisom — bele table ovde nema.' };
X[10920] = { x: 'Plava tabla sa zastavom i natpisom Srbija nabraja opšta ograničenja po kategoriji puta: silueta naselja 50, precrtana silueta 80, motoput 100, autoput 130, a u dnu simbol fara sa oznakom 00-24. Brojevi stoje u crvenim krugovima, a crveni krug uvek znači zabranu — zato to nisu preporučene brzine. Srednja brzina se ovakvim tablama uopšte ne propisuje.' };
X[10921] = { x: 'Plava tabla nosi naziv odmorišta, red piktograma sa uslugama i udaljenost u kilometrima — to je najava nailaska na odmorište čiji je sadržaj prikazan piktogramima. Znak za mesto izlaska do odmorišta ima kosu strelicu umesto broja kilometara. Naziv putnog objekta poput tunela ili mosta ide na sasvim drugoj tabli, bez simbola usluga.' };
X[10922] = { x: 'Plava šema traka sa brzinom upisanom u kružiću je znak trake za spora vozila, a strelica koja se sa desne strane priključuje kolovozu pokazuje da traka tu počinje. Njome moraju da se kreću vozila sporija od brzine sa znaka. Kraj te trake je ista plava šema na kojoj se traka uliva nazad u kolovoz. Broj u kružiću nije ograničenje brzine — ograničenje bi stajalo u crvenom krugu.' };
X[10924] = { x: 'Plava tabla prikazuje samo šemu kolovoza sa proširenjem sa desne strane, bez ijednog simbola — to je deo puta za zaustavljanje i parkiranje u hitnom slučaju, koji može imati telefon za hitne pozive i aparat za gašenje požara. Telefon i aparat se na znaku ne crtaju, pa ih ne traži. Nije obično parking mesto, a nema ni strelice kojom se crta otvaranje nove trake.' };
X[10925] = { x: 'Zelena podloga ti kaže da si na autoputu, a broj metara ispod šeme da je ovo najava, a ne samo mesto. Strelica koja se sa desne strane priključuje postojećim trakama znači da se tu otvara nova saobraćajna traka. Traka za spora vozila bila bi plava i nosila bi brzinu u kružiću, a spajanje dva autoputa se crta snopom strelica koje se stapaju.' };
X[10926] = { x: 'Isti zeleni znak kao i predznak, samo bez broja metara — kada udaljenosti nema, znak stoji na samom mestu gde se traka otvara. Šema pokazuje traku koja se sa desne strane priključuje kolovozu. Traka za spora vozila je plava i ima brzinu u kružiću, a spajanje sa drugim autoputem se crta strelicama koje se stapaju, ne jednom trakom koja se dodaje.' };
X[10928] = { x: 'Zelena podloga znači autoput, a šema pokazuje kako se desna traka gasi i uliva u susednu — traka se tu zatvara. Broja metara nema, pa nije reč o najavi nego o samom mestu. Zaustavna traka bi na znaku bila šrafirana kosim crtama i bez strelice, a kraj trake javnog prevoza je plavi znak sa autobusom, ne zeleni znak sa autoputa.' };
X[10929] = { x: 'Šrafura kosim crtama preko krajnje desne trake je oznaka za zaustavnu traku, a ne za saobraćajnu; zelena podloga govori da si na autoputu, a broj metara ispod šeme da je ovo najava. Kada se zatvara obična saobraćajna traka, na znaku je strelica koja se uliva u susednu. Suženje kolovoza kao opasnost najavljuje trougao, a ne zelena tabla.' };
X[10930] = { x: 'Ista šrafirana zaustavna traka kao na predznaku, ali bez broja metara — znak bez udaljenosti stoji na samom mestu gde se zaustavna traka zatvara. Zatvaranje obične saobraćajne trake crta se strelicom koja se uliva u susednu traku, a kraj trake javnog prevoza je plavi znak sa simbolom autobusa; ovaj je zelen, dakle sa autoputa.' };
X[10931] = { x: 'Snop od četiri strelice koje se stapaju u isti smer prikazuje spajanje dva autoputa, a ne otvaranje jedne trake — tada bi se sa strane dodavala samo jedna traka. Zelena podloga potvrđuje autoput, a broj metara ispod šeme govori da je ovo najava. Krivinu najavljuje trougao ili bela tabla sa crnom strelicom; ovde nijedna strelica ne skreće u stranu.' };
X[10932] = { x: 'Isti snop strelica koje se stapaju, ali bez broja metara — znak bez udaljenosti stoji na samom mestu gde se autoput spaja sa drugim autoputem. Otvaranje trake bilo bi prikazano jednom trakom koja se sa strane priključuje kolovozu. Oštra krivina je bela tabla sa velikom crnom strelicom, sasvim druga slika i druga boja podloge.' };
X[10933] = { x: 'Ista plava tabla odmorišta kao i predznak, ali umesto udaljenosti u kilometrima na dnu stoji kosa strelica nagore udesno — ona ti kaže da tu skrećeš sa puta ka odmorištu. Sa brojem kilometara ista tabla bila bi samo najava nailaska na odmorište. Naziv putnog objekta ide na tabli bez piktograma usluga.' };
X[10934] = { x: 'Bela tabla sa natpisom ZONA i umetnutim plavim krugom u kome su odrasli i dete uvodi režim za celu zonu, a ne za jedno mesto — to je početak zone namenjene kretanju pešaka. Sam plavi krug, bez bele table i natpisa, bio bi znak pešačke staze. Zona škole ima umetnut fluorescentni žuto-zeleni kvadrat sa figurama dece.' };
X[10935] = { x: 'Ista bela tabla ZONA, ali je umetnuti znak preveden u sivo i preko svega ide snop tankih crnih kosih crta — tako se kod tabli zone označava kraj, crvena traka se tu ne koristi. Umetnute figure su odrasli i dete, dakle završava se pešačka zona. Kraj pešačke staze bio bi go okrugli znak bez bele table, a kraj zone škole ima umetnut kvadrat sa figurama dece, ne krug.' };
X[10936] = { x: 'Bela tabla sa natpisom ZONA i umetnutim običnim znakom, crvenim krugom sa brojem 30, širi to ograničenje na celu zonu — zato je odgovor zona u kojoj je brzina ograničena do 30 km/h. Zona škole ima umetnut fluorescentni žuto-zeleni kvadrat sa figurama dece, a zona usporenog saobraćaja nije bela tabla sa natpisom nego plava tabla sa figurama.' };
X[10937] = { x: 'Ista tabla ZONA sa umetnutim znakom 30, samo je znak sada u sivoj verziji i preko cele table ide snop tankih crnih kosih crta — to je kraj zone sa ograničenjem do 30 km/h. Kraj zone škole imao bi umetnut kvadrat sa figurama dece, a kraj zone usporenog saobraćaja je plava tabla preko koje ide debela crvena traka, ne crne crte.' };
X[10938] = { x: 'Plavi kvadrat je znak obaveštenja, a ne upozorenja: unutar belog trougla nacrtana je izbočina u preseku, pa ti znak javlja da su na putu postavljena tehnička sredstva za usporavanje saobraćaja, dakle namerno ugrađena prepreka. Neravan kolovoz i opasna izbočina jesu znakovi opasnosti, a oni su trouglovi sa crvenim rubom, ne plavi kvadrati.' };
X[10939] = { x: 'Plava kvadratna tabla znači obaveštenje: ovde prelaz biciklističke staze preko kolovoza stvarno postoji, a ne da ti se tek najavljuje. Beli trougao sa biciklistom stoji iznad niza crnih pravougaonika koji predstavljaju obeležen prelaz — isti obrazac kao kod pešačkog prelaza. Zamka o delu puta na kome se biciklisti često kreću pripada trouglu opasnosti, a posebno izgrađena staza po kojoj drugi ne smeju plavom krugu, koji naređuje.' };
X[10940] = { x: 'Fluorescentna žuto-zelena podloga koristi se samo za nekoliko obaveštenja koja moraju da se vide izdaleka. Ovde je u tablu umetnut trougao sa uzvičnikom, i baš taj umetak razlikuje celu opasnu deonicu od jedne tačke na putu: goli trougao sa uzvičnikom, bez table oko sebe, znači opasno mesto na putu — zato je taj odgovor mamac. Radovi bi imali svoj piktogram radnika sa lopatom.' };
X[10941] = { x: 'Plava tabla te obaveštava kako se saobraćaj tu odvija: nacrtana su vozila iz dve trake koja se stapaju u jednu, jedno po jedno, po pravilu patent-zatvarača. Oba netačna odgovora su iz porodice trouglova opasnosti — i opasnost od stvaranja kolone i približavanje suženju kolovoza samo najavljuju nevolju ispred tebe, dok ti ovaj znak kaže gde si i kako se uključuješ.' };
X[10942] = { x: 'Plava tabla sa piktogramom radarskog pištolja i natpisom o kontroli brzine ništa ne naređuje — ona te obaveštava da od tog mesta počinje deonica na kojoj se brzina često meri. Zato su oba mamca pogrešna: ona govore o obavezi poštovanja najveće dozvoljene brzine, a to ograničenje uvodi crveni krug sa brojem, ne ovakvo obaveštenje. Svetlosni znak vozača iz suprotnog smera nije značenje nijednog znaka.' };
X[10943] = { x: 'Tabla ti crta mrežu ulica i debelu crnu strelicu koja obilazi blok pa izlazi ulevo — to je put kojim smeš da stigneš tamo gde bi inače skrenuo levo, na raskrsnici na kojoj je levo skretanje zabranjeno. Samu zabranu skretanja postavlja crveni krug sa precrtanom strelicom, a obilazak zbog radova se odnosi na zatvoren put, ne na jednu zabranjenu radnju na raskrsnici.' };
X[10944] = { x: 'Ova tabla stoji pre raskrsnice i nosi strelice raspoređene po trakama, pa ti unapred kaže iz koje trake možeš levo, pravo ili desno — to je prestrojavanje na putu sa više saobraćajnih traka. Potvrda pravca kretanja je tabla koja stoji tek posle raskrsnice, a pravac puta do određenog objekta bi nosio naziv ili simbol odredišta, čega na ovom znaku nema.' };
X[10945] = { x: 'I ovde su strelice nacrtane po trakama, dakle tabla stoji pre raskrsnice i služi da se na vreme prestrojiš, samo što je raskrsnica kružna — to ti kaže kružna petlja ucrtana uz strelice. Najava same raskrsnice sa kružnim tokom je znak opasnosti, trougao, a potvrda pravca kretanja je tabla sa nazivima mesta koja se postavlja posle raskrsnice.' };
X[10946] = { x: 'Na tabli je ispisano ime mesta i to je ceo ključ: naziv na znaku znači granicu naseljenog mesta kroz koje put prolazi. Mamac o mestu od koga počinje naselje pripada drugoj tabli — onoj sa crnom siluetom zgrada i bez ijednog slova. Turističko odredište ili objekat bi bio označen simbolom ili natpisom sadržaja, a ne golim imenom grada.' };
X[10948] = { x: 'Silueta zgrada bez ijednog slova znači naselje, a debela crvena kosa traka preko znaka je opšte pravilo ove grupe: isti znak precrtan crvenom trakom označava kraj onoga što je otvarao. Zato je ovo mesto na kome se naselje završava. Netačan odgovor o naseljenom mestu traži tablu na kojoj je ispisan naziv mesta, a njega na ovom znaku nema.' };
X[10949] = { x: 'Beli krug sa snopom tankih crnih kosih crta je porodica prestanka — crte poništavaju ono što je uveo crveni krug. Ispod crta su dva putnička automobila, pa se ukida zabrana preticanja za motorna vozila. Da je reč o teretnim vozilima, levo vozilo bi bilo kamion. Treći odgovor opisuje samu zabranu preticanja, a nju nosi znak sa crvenim rubom, bez kosih crta.' };
X[10950] = { x: 'Prvo gledaj podlogu, pa tek onda broj. Plava podloga i debela crvena kosa traka čine porodicu koja ukida obavezu, a obavezu kretanja najmanjom propisanom brzinom uvodi baš plavi krug sa belim brojem. Prestanak ograničenja brzine izgleda drugačije: beli krug, crni broj i tanke crne crte. Prestanak preporučene brzine je takođe plav, ali kvadrat, a ne krug.' };
X[10951] = { x: 'Beli krug sa tankim crnim kosim crtama uvek znači prestanak nečega što je uveo crveni krug, a koga se to tiče vidi se po vozilima ispod crta: levo je kamion, pa se ukida zabrana preticanja za teretna vozila teža od 3,5 t. Da su nacrtana dva putnička automobila, bila bi to zabrana za sva motorna vozila. Odgovor koji opisuje samu zabranu pripada znaku sa crvenim rubom, bez kosih crta.' };
X[10952] = { x: 'Beli krug, crn broj i snop tankih crnih kosih crta — to je tačno par znaku ograničenja brzine, koji je beli krug sa crvenim rubom i istim crnim brojem. Zato od ovog mesta prestaje ograničenje brzine. Prestanak najmanje dozvoljene brzine bio bi plavi krug sa belim brojem i crvenom trakom, a prestanak preporučene brzine plavi kvadrat sa crvenom trakom. Podloga odlučuje pre broja.' };
X[10953] = { x: 'Krug bez ijednog simbola, samo sa snopom tankih crnih kosih crta, ukida odjednom sve što su prethodni znakovi uveli — ali samo iz tri vrste: zabrane, ograničenja i obaveze. Zato je reč svi u oba netačna odgovora marker greške: znakovi opasnosti i znakovi obaveštenja ostaju na snazi, kao i naredbe koje budu postavljene posle ovog mesta.' };
X[10954] = { x: 'Tabla stoji pre raskrsnice i crta šemu puteva koji se ukrštaju, sa nazivima mesta na krajevima krakova — unapred ti pokazuje kako raskrsnica izgleda i kuda koji krak vodi. Nije prestrojavanje: ta tabla ima strelice raspoređene po trakama, a ne šemu puteva. Nije ni potvrda pravca, jer se ona postavlja tek posle raskrsnice. Žuta podloga samo kaže da je reč o ostalim putevima.' };
X[10955] = { x: 'Ista logika kao kod obične raskrsnice, samo je šema kružna: tabla ti pre ulaska crta kružni tok, krakove i nazive mesta do kojih vode. Prethodno obaveštenje radi prestrojavanja izgleda drugačije — na njemu su strelice raspoređene po trakama, jer ti kaže iz koje trake da kreneš. Potvrda pravca kretanja se postavlja posle raskrsnice, a ova tabla stoji pre nje.' };
X[10956] = { x: 'Ključ su strelice: raspoređene su po trakama, a uz njih stoje nazivi mesta, pa ti tabla pre raskrsnice kaže u koju traku da se prestrojiš. Šema puteva koji se ukrštaju izgleda drugačije — tamo je nacrtan raspored krakova, a ne trake. Potvrda pravca kretanja dolazi tek posle raskrsnice. Žuta podloga govori o kategoriji puta, ne o značenju znaka.' };
X[10957] = { x: 'Tabla je oblikovana kao strelica i nosi samo ime mesta — takav putokaz pokazuje pravac puta do naseljenog mesta i postavlja se na raskrsnici, okrenut na stranu na koju treba da skreneš. Jednosmerni put bi bio pravougaona tabla sa belom strelicom, bez naziva mesta. Potvrda pravca kretanja je pravougaona tabla posle raskrsnice, a ne šiljasta strelica na njoj.' };
X[10958] = { x: 'Pravougaona tabla sa strelicom uz svaki naziv pokazuje kojim pravcem se stiže do mesta ispisanog na znaku; brojevi u okvirima su oznake puteva, a udaljenost nigde nije navedena. Potvrda pravca kretanja bi stajala posle raskrsnice i potvrđivala da si dobro skrenuo. Prethodno obaveštenje radi prestrojavanja nosi strelice raspoređene po trakama, a ne redove sa imenima.' };
X[10959] = { x: 'Znak obaveštenja ništa ne naređuje — kaže ti kuda se ide i koliko ima do tamo. Uz nazive mesta na donjoj tabli stoji i broj metara, pa dobijaš i pravac kretanja i udaljenost, dok zelena podloga vodi ka autoputu, a žuta ka ostalim putevima. Završetak autoputa je sasvim drugi znak, sa simbolom autoputa preko koga ide debela crvena kosa traka, a potvrdu pravca dobijaš tek pošto prođeš raskrsnicu.' };
X[10960] = { x: 'Tabla sa strelicom i nazivom mesta postavlja se na raskrsnici i pokazuje samo kojim smerom se stiže do tog mesta. Broja metara nema, pa nema ni udaljenosti — ostaje čist pravac kretanja. Kraj autoputa je drugi znak, sa simbolom autoputa preko koga ide debela crvena kosa traka, a potvrdu pravca dobijaš tek posle raskrsnice, kada si je već prošao.' };
X[10961] = { x: 'Žuta podloga kod znakova za vođenje znači da te vode ostalim putevima, a ne autoputem, a strelica uz naziv mesta kaže kojim smerom se do njega ide. Broja metara nema, pa nema ni udaljenosti, samo pravac. Kraj autoputa bi bio precrtan debelom crvenom kosom trakom, a potvrda pravca je tabla posle raskrsnice — ova stoji na samoj raskrsnici.' };
X[10962] = { x: 'Plava podloga kod znakova za vođenje kaže da si na putu koji nije autoput, a kosa strelica uz naziv mesta pokazuje smer kojim se do tog mesta stiže. Bez broja metara nema udaljenosti — dobijaš samo pravac kretanja. Početak motoputa je sasvim drugi znak, sa simbolom vozila, a potvrdu pravca dobijaš tek pošto prođeš raskrsnicu.' };
X[10963] = { x: 'Strelica na ovoj tabli ne pokazuje u stranu nego nadole, ka traci iznad koje tabla visi — zato ti znak kazuje kojom se trakom ide do ispisanih mesta, dakle način korišćenja trake. Potvrda pravca ne visi iznad kolovoza nego stoji uz put posle raskrsnice, a znak sa nazivom petlje nosio bi ime petlje, a ne spisak odredišta sa oznakama puteva.' };
X[10964] = { x: 'Strelica je okrenuta nadole i udesno, ka traci iznad koje tabla stoji, pa je poruka koja te traka vodi do ispisanih mesta — to je obaveštenje o korišćenju saobraćajne trake. Da je reč o potvrdi pravca, tabla bi stajala pored puta pošto prođeš raskrsnicu, a naziv petlje bio bi ispisan kao ime, ne kao odredišta sa brojevima puteva.' };
X[10965] = { x: 'Kosa strelica nadole i ulevo pokazuje traku iznad koje tabla visi, pa je poruka koja traka vodi do ispisanih mesta, a ne gde je raskrsnica. Potvrdu pravca dobijaš tek pošto prođeš raskrsnicu i ona stoji uz put, dok bi znak sa nazivom petlje nosio ime petlje umesto spiska odredišta sa oznakama puteva.' };
X[10966] = { x: 'Na tabli je nacrtana šema puta sa krakom koji se odvaja, uz nazive mesta i broj metara u dnu — dakle i putni pravci i udaljenost do njih. Potvrda pravca nema nikakvu šemu i stoji tek posle raskrsnice, a znak sa nazivom petlje je kratka tabla sa imenom petlje, bez skice puteva i bez metara.' };
X[10967] = { x: 'Šema pokazuje kako se put račva, uz nazive mesta, oznake autoputeva na oba kraka i broj metara u dnu — zato je to najava raskrsnice sa udaljenošću i pravcima autoputeva. Naziv petlje bio bi samo ime, bez skice i bez metara, a tabla koja vodi do jednog mesta ima prostu strelicu uz naziv, a ne nacrtana dva kraka.' };
X[10968] = { x: 'Šema je ista kao na predznaku, ali bez broja metara u dnu, pa ti ostaje samo raspored autoputnih pravaca: koji krak kuda vodi. Zato ovo nije tabla koja vodi do jednog naseljenog mesta, jer su nacrtana dva kraka sa oznakama autoputeva, ni naziv petlje, koji bi bio ispisan kao ime petlje bez ikakve skice.' };
X[10969] = { x: 'Na tabli je nacrtan glavni put ka mestima ispisanim na znaku, a na njemu stoji mali okrugli znak zabrane — tim delom puta se ne prolazi. Pored njega je nacrtan krak koji taj zatvoreni deo zaobilazi, pa znak pokazuje kuda i u kom smeru ide preusmereni saobraćaj. Slepi put bi bio krak koji se završava poprečnom crtom, bez ikakvog obilaznog puta, a tabla za obilazak zabranjenog levog skretanja crta raskrsnicu na kojoj je skretanje ulevo zabranjeno, a ne zatvoren put.' };
X[10970] = { x: 'Obe strelice idu nagore, dakle saobraćaj ostaje u istom smeru, a lom u sredini kaže da se trake pomeraju u stranu — broj traka je isti, menja se samo njihov položaj; broj metara u dnu čini znak najavom. Zamke su trouglovi opasnosti: krivina i niz uzastopnih krivina najavljuju zaokret samog puta, a ovde put ide pravo.' };
X[10971] = { x: 'Leva traka se sliva u desnu i tu se završava, pa je ovo mesto na kome počinje zatvaranje trake, a ne najava — ispod šeme nema broja metara. Traka za spora vozila nosila bi brzinu u kružiću unutar same trake, a suženje kolovoza kao opasnost dolazi na trouglu sa crvenim rubom, dok je ovde plava tabla obaveštenja.' };
X[10972] = { x: 'Šema je ista kao na znaku koji označava samo mesto, ali broj metara ispod nje pretvara znak u najavu: toliko ti je ostalo do mesta gde se traka zatvara. Suženje kolovoza kao opasnost najavljuje trougao sa crvenim rubom, a traka za spora vozila prepoznaje se po brzini upisanoj u kružiću unutar trake, čega ovde nema.' };
X[10973] = { x: 'Jedna strelica ide nadole, druga nagore i prelazi pored šrafiranih ostrva na drugu stranu — tako se crta prelazak dvosmernog saobraćaja sa fizički razdvojenih kolovoza na kolovoz gde trake dele samo oznake; broj metara znači da je to tek najava. Skretanje traka bilo bi žuto i sa obe strelice nagore, a ovde su smerovi suprotni.' };
X[10974] = { x: 'Šema je ista, ali ispod nje nema broja metara, pa znak stoji baš na mestu gde saobraćaj prelazi sa fizički razdvojenih kolovoznih traka na kolovoz na kome ih dele samo oznake. Skretanje saobraćajnih traka bilo bi žuto, sa obe strelice nagore i bez ostrva, dok su ovde smerovi suprotni i ostrva su nacrtana šrafirano.' };
X[10975] = { x: 'Uz postojeću traku se sa strane dodaje nova, za vozila u istom smeru, a broj metara ispod šeme kaže da to tek sledi — dakle udaljenost do mesta otvaranja trake. Da je reč o autoputu, znak bi bio zelen i u odgovoru bi stajalo da se traka otvara na autoputu, a skretanje traka ne dodaje traku nego pomera postojeće u stranu.' };
X[10976] = { x: 'Ista šema, ali bez broja metara ispod nje, znači da si baš na mestu gde se otvara nova traka za vozila iz tvog smera. Plava podloga te drži van autoputa, pa odgovor sa rečima o autoputu otpada — tamo bi znak bio zelen. Skretanje traka ne dodaje novu traku, nego obe postojeće pomera u stranu.' };
X[10977] = { x: 'Uz nacrtan deo puta stoji ljudska figura koja rukom usmerava saobraćaj, a žuta podloga i broj metara u dnu kažu da te ispred čeka privremeni režim zbog radova, prepreka ili oštećenja kolovoza. Policijska kontrola i sportska priredba na putu imaju svoje znakove sa drugim simbolima, a ovde nema ni vozila ni sportskog obeležja.' };
X[10978] = { x: 'Žuta tabla sa crnim strelicama i brojem metara ispod crteža je najava, a ne samo oznaka mesta. Dve talasaste strelice okrenute jedna nadole, a druga nagore znače da se oba smera zajedno izmeštaju sa svoje trase, a to je devijacija. Opasna izbočina se najavljuje trouglom opasnosti, a kod skretanja saobraćajnih traka obe strelice idu nagore i broj traka ostaje isti, pa nijedna ponuđena zamka ne odgovara ovom crtežu.' };
X[10979] = { x: 'Isti žuti znak sa dve talasaste strelice u suprotnim smerovima, ali bez broja metara ispod crteža: nema najavljene udaljenosti, pa si već na mestu na kome je put izmešten sa svoje trase. Kod skretanja saobraćajnih traka obe strelice bi išle nagore uz bočni pomak, a početak dvosmernog saobraćaja se označava trouglom sa dve jednake crne strelice, ne žutom tablom.' };
X[10980] = { x: 'Fluorescentna žuto-zelena tabla sa natpisima STOP i POGREŠAN SMER, crnom šakom i umetnutim znakom zabrane saobraćaja u jednom smeru je obaveštenje, i to poslednje pre nego što se sretneš sa vozilima koja idu ka tebi. Reč STOP na tabli nije naredba da zaustaviš vozilo, jer naredbe daju okrugli i osmougaoni znakovi, a ni polukružno okretanje ti se ne nalaže: tabla te upozorava, a kako ćeš bezbedno izaći zavisi od situacije.' };
X[10981] = { x: 'Zelena podloga te veže za autoput, a natpis o putarini sa podatkom da je naplatno mesto na hiljadu metara samo najavljuje da nailaziš na objekat za naplatu. Ispisana reč STOP nije naredba: naredbu da zaustaviš vozilo daje crveni osmougaoni znak, a ovo je pravougaona tabla obaveštenja. Nije ni naziv putnog objekta, jer tabla kaže šta te čeka na putu, a ne kako se neki objekat zove.' };
X[10982] = { x: 'Zelena podloga govori da si na autoputu, a reč putarina ispisana na više jezika, sa udaljenošću ispisanom ispod okvira, najavljuje da nailaziš na objekat za naplatu putarine. Na tabli nema naziva nijednog putnog objekta niti njegovog simbola, pa taj odgovor otpada: broj metara je rastojanje do naplatnog mesta. Naredbe da staneš ovde nema, jer tabla obaveštenja ništa ne naređuje, nego ti unapred kaže šta te čeka.' };
X[10983] = { x: 'Oznaka ENP na žutom polju znači elektronsku naplatu putarine, a strelica ispod nje pokazuje pravo nadole, na traku iznad koje znak stoji. Zato ovo nije putokaz do nekog karakterističnog objekta: strelica ne vodi u stranu nego označava baš tu traku. Naredbe da zaustaviš vozilo takođe nema, jer se u traci sa elektronskom naplatom ne staje pred rampom da bi platio.' };
X[10984] = { x: 'Tabla je podeljena u dva reda: gore je žuta oznaka ENP uz natpis o elektronskoj naplati, dole simbol ručne naplate uz svoj natpis. Kad su oba načina navedena na istoj tabli, znak najavljuje naplatno mesto na kome putarinu možeš da platiš i elektronski i ručno. Nije putokaz do nekog objekta, niti naredba da staneš: nabrajanje načina plaćanja je čisto obaveštenje o onome što te čeka.' };
X[10985] = { x: 'Plavi kvadrat sa simbolom fotoaparata označava uređaj koji je trajno postavljen uz put, pa od tog mesta saobraćaj snima nepokretna kamera. Obe zamke govore o povremenoj kontroli koju sprovodi patrola: radarska kontrola brzine se vrši s vremena na vreme, a presretač je vozilo u pokretu sa ugrađenim uređajem. Ovde uređaj nije ni u čijem vozilu i radi stalno, pa je zato reč o snimanju fiksnim tehničkim uređajima.' };
X[11064] = { x: 'Na belom polju je vozilo sa dizalicom za vuču, dakle služba koja izlazi na put kad ti se vozilo pokvari i ne može dalje samo. Radionica za opravku se označava simbolom alata i podrazumeva da si do nje stigao, a na tehnički pregled sam dovoziš vozilo koje vozi. Ovde je nacrtano vučno vozilo, pa je poenta pomoć koja dolazi do tebe na mestu kvara.' };
X[11067] = { x: 'Bela tabla sa crnom siluetom kuća i bez ijednog natpisa kaže samo jedno: odatle počinje naselje, sa svim pravilima koja u naselju važe. Odgovor sa nazivom naseljenog mesta pada zato što na ovoj tabli imena nema, a to je baš ono po čemu se te dve table razlikuju. Turističko ili istorijsko odredište bi imalo svoj simbol ili ispisan naziv, dok je ovde samo obris grada.' };
X[11069] = { x: 'Tri uspravne plave table sa kosim belim trakama i brojevima metara rade kao odbrojavanje: tri trake na tristo metara, dve na dvesta, jedna na sto, pa ti kažu koliko je ostalo do početka trake kojom se izlazi sa autoputa. Isto odbrojavanje postoji i pred prelazom preko železničke pruge, ali su te table bele sa crvenim kosim trakama, pa taj odgovor otpada. Razdelno ostrvo se označava uskom uspravnom tablom sa crno-žutim poljima, na kojoj nema nikakvih metara.' };
X[11070] = { x: 'Na šemi se desna traka uliva nazad u kolovoz, a strelica iz nje skreće ulevo, dakle traka se gasi umesto da se otvara. Broj trideset u kružiću nije ograničenje brzine nego prag: tom trakom se kreću vozila sporija od te brzine, pa znak označava mesto na kome se ona završava. Odgovor o vozilima bržim od označene brzine izvrće smisao trake za spora vozila, a odgovor o početku trake protivreči crtežu.' };
X[11071] = { x: 'Zelena podloga te odmah stavlja na autoput, a broj metara ispod šeme znači da je ovo najava, a ne oznaka samog mesta. Traka koja se gasi odvojena je sa leve strane isprekidanom linijom, dakle to je saobraćajna traka; zaustavnu traku bi od kolovoza delila puna ivična linija. Suženje kolovoza sa desne strane najavljuje trougao opasnosti, a ovo je tabla obaveštenja: ona ne upozorava, nego kaže šta te čeka za petsto metara.' };

// --- objašnjenja za slikovna pitanja (talas 4) ---
X[9447] = { x: 'Na slici policajac stoji okrenut prsima ka tebi, sa rukom ispruženom pravo uvis i otvorenim dlanom. Uzdignuta ruka je naredba za obavezno zaustavljanje, i odnosi se na sve, pa i na tebe koji mu gledaš u prsa i u dlan. Ponuđeni izuzetak za vozila koja ne mogu bezbedno da se zaustave ne postoji. Pravilo o leđima, prsima i bočnim stranama gleda se samo kada su mu ruke spuštene ili odručene, a ovde nisu.' };
X[9448] = { x: 'Policajca vidiš iz profila, sa jednom rukom ispruženom vodoravno napred i dlanom okrenutim nadole. To je predručena ruka: ona zabranjuje prolaz svakome čiji smer kretanja preseca smer u kome je ruka upravljena. Ona ti ne naređuje da se krećeš u smeru ruke, pa je taj ponuđeni odgovor mamac, a izuzetka za one koji ne stignu bezbedno da se zaustave nema.' };
X[9450] = { x: 'Policajac stoji na kolovozu ispred tebe, okrenut ka tebi, sa rukom ispruženom pravo uvis i otvorenom šakom. Uzdignuta ruka znači obavezno zaustavljanje za sve učesnike u saobraćaju, bez izuzetka i bez obzira na to kojim se putem krećeš. Zato ni nastavak kretanja ni puko smanjenje brzine ne dolaze u obzir: zaustavljaš se i čekaš njegov sledeći znak.' };
X[9452] = { x: 'Policajac je na raskrsnici sa rukom predručenom preko kolovoza, a u kadru namerno stoje i STOP znak i zeleno svetlo na semaforu. Dok on reguliše saobraćaj, njegov znak je jači i od znaka i od semafora. Predručena ruka zabranjuje prolaz svakome čija putanja preseca smer te ruke, pa smeš samo onuda gde je ne sečeš. Ona ti ne naređuje da se krećeš u njenom smeru.' };
X[9454] = { x: 'Policajac stoji uz desnu ivicu puta, okrenut ka tebi, sa rukom odručenom vodoravno u stranu i dlanom nadole, a strelica pored šake pokazuje lagano mahanje gore-dole. To je znak da smanjiš brzinu. Da traži ubrzanje, podlaktica bi bila podignuta i kružila; da traži primicanje, šaka bi bila okrenuta bočno i mahala savijanjem u laktu.' };
X[9455] = { x: 'Ruka je odručena vodoravno u stranu, dlan otvorene šake gleda nadole, a strelice gore-dole pokazuju lagano mahanje. Taj znak od tebe traži da smanjiš brzinu kretanja. Ne meša se sa ubrzavanjem, gde je podlaktica podignuta i kruži, ni sa primicanjem, gde je šaka okrenuta bočno i maše se savijanjem u laktu. Ovde se šaka drži ravno i pomera samo gore-dole.' };
X[9457] = { x: 'Ovde policajcu gledaš u leđa, pa je lako pomisliti da se znak ne odnosi na tebe. Ruka mu je ispružena pravo uvis, a uzdignuta ruka znači obavezno zaustavljanje za sve učesnike, bez obzira na to sa koje mu strane prilaziš. Položaj tela bi bio merilo samo da su mu ruke spuštene ili odručene. Zato staješ, a ne nastavljaš smanjenom brzinom.' };
X[9459] = { x: 'Policajac je okrenut ka tebi, podlaktica mu je podignuta i savijena u laktu, šaka otvorena, a kružna strelica oko šake pokazuje kružno kretanje podlaktice. To je znak da ubrzaš kretanje vozila. Za smanjenje brzine ruka bi bila odručena u stranu sa dlanom nadole, a za primicanje bi strelica pokazivala ka policajcu; ovde je strelica kružna.' };
X[9460] = { x: 'Levog policajca gledaš spreda: ruka mu je savijena u laktu, a pun otvoren dlan uspravno je okrenut ka tebi. Desni je snimljen sa strane, sa ispruženom rukom i dlanom okrenutim ka vozaču u tom smeru. Oba puta je to znak da zaustaviš vozilo. Smanjenje brzine izgleda drugačije: ruka je odručena u stranu, dlan gleda nadole i maše gore-dole. Nijedan znak rukom ne znači da vozilo ukloniš sa kolovoza.' };
X[9462] = { x: 'Policajac stoji na kolovozu ispred tebe, ruka mu je savijena u laktu, a pun otvoren dlan okrenut je ka tebi. To je znak za zaustavljanje vozila i odnosi se upravo na tebe, jer dlan gleda u tvom smeru. Da traži smanjenje brzine, ruka bi bila odručena u stranu, dlanom nadole, uz mahanje gore-dole. Uklanjanje vozila sa kolovoza nije značenje nijednog znaka rukom.' };
X[9464] = { x: 'Policajac je okrenut ka tebi, podlaktica mu je podignuta sa otvorenom šakom, a velika žuta strelica pored njega pokazuje pravo napred, ka mestu na kome on stoji. Ta strelica je ključ: traži se da vozilo pomeriš bliže raskrsnici, odnosno njemu. Da traži ubrzanje, strelica bi bila kružna oko šake; da traži usporenje, ruka bi bila odručena u stranu sa dlanom nadole.' };
X[9466] = { x: 'Policajac ti stoji leđima okrenut, sa obe ruke spuštene niz telo. Kada su ruke spuštene, znak je položaj tela: ko dolazi iz pravca u kome su okrenuta njegova leđa, odnosno prsa, zaustavlja vozilo, a ko mu prilazi sa bočnih strana, prolazi. Ti mu gledaš u leđa, pa staješ. Dok on reguliše saobraćaj, pravilo o propuštanju vozila sa puta koji se ukršta ne odlučuje.' };
X[9467] = { x: 'Policajac stoji sa obe ruke odručene vodoravno, i taj se znak čita po položaju tela. Vozači kojima su okrenuta njegova leđa, odnosno prsa, zaustavljaju svoja vozila, a oni koji dolaze sa njegovih bočnih strana imaju pravo prolaza. Raširene ruke tu ništa ne menjaju, samo ga čine uočljivijim. Obrnuta verzija te rečenice je stalni mamac, zato je čitaj do kraja.' };
X[9469] = { x: 'Na raskrsnici je policajac okrenut prsima ka tebi, sa obe ruke odručene vodoravno. Kada su ruke odručene, merilo je položaj tela: prsa i leđa znače stani, bočne strane znače prolaz. Ti mu dolaziš pravo u prsa, pa zaustavljaš vozilo. Nijedan njegov znak ti ne dozvoljava prolaz pravo, a dok on reguliše, propuštanje vozila sa puta koji se ukršta ništa ne menja.' };
X[9470] = { x: 'Na obe figure podlaktica je podignuta, a šaka okrenuta bočno tako da joj vidiš ivicu; strelice levo-desno pokazuju mahanje savijanjem u laktu. Taj znak znači da vozilo pomeriš bliže raskrsnici, odnosno policajcu koji ga daje. Za ubrzanje bi strelica bila kružna oko šake, a za smanjenje brzine ruka bi bila odručena u stranu, sa dlanom okrenutim nadole.' };
X[9471] = { x: 'Policajac na slici stoji mirno, sa obe ruke spuštene niz telo, i ne daje nikakav znak rukom. Tada odlučuje položaj njegovog tela: ko dolazi iz pravca u kome su okrenuta njegova leđa, odnosno prsa, zaustavlja vozilo, a ko dolazi sa bočnih strana, prolazi. Izuzetak za vozila koja ne mogu bezbedno da se zaustave ne postoji ni uz jedan njegov znak.' };
X[9472] = { x: 'Ruka je predručena i savijena u laktu, šaka otvorena, a kružna strelica pokazuje kružno kretanje podlaktice i šake. To je poziv da ubrzaš kretanje vozila. Smanjenje brzine izgleda drugačije, kao odručena ruka sa dlanom nadole i mahanje gore-dole, a primicanje traži bočno okrenutu šaku i mahanje levo-desno, bez kružnice.' };
X[9474] = { x: 'Policajac ti stoji bočno, a ruka mu je predručena preko druge polovine kolovoza, ka vozilima koja dolaze iz suprotnog smera. Predručena ruka zaustavlja samo one čiji smer kretanja seče smer te ruke, a tvoja putanja pravo prolazi pored njega i tu ruku ne preseca. Zato nastavljaš pravo; ni zaustavljanje ni primicanje ovim znakom ti se ne naređuje.' };
X[9490] = { x: 'Ispred tebe je zaustavljeno policijsko vozilo sa upaljenim plavim trepćućim svetlima, a ljudi stoje tik uz kolovoz. Zato prilaziš smanjenom brzinom, postupaš po naredbama policijskog službenika i, po potrebi, zaustavljaš svoje vozilo. Bezuslovno zaustavljanje nije propisano, a ubrzavanje pored zaustavljenog policijskog vozila je suprotno svemu što ta svetla znače.' };
X[9493] = { x: 'Policajac stoji na tvojoj polovini kolovoza, okrenut ka tebi, i crvenom lampom maše popreko preko tvoje trake, pa je znak upućen upravo tebi. Zato bezbedno zaustavljaš vozilo na kolovozu, a po mogućnosti van njega, i to neposredno ispred policajca koji znak daje, ne pored njega i ne iza njega. Samo usporavanje nije dovoljno kada crveni znak dobiješ ti.' };
X[9495] = { x: 'Policajac je žutim krugom označen daleko na levoj strani puta i crvenom lampom zaustavlja vozilo koje dolazi iz suprotnog smera, dakle ne tebe. Zato ne staješ, nego smanjuješ brzinu i krećeš se sa povećanom opreznošću, jer se vozilo zaustavlja tik pored tvoje putanje, a policajac stoji uz samu ivicu kolovoza. Da je znak tvoj, on bi stajao na tvojoj strani, okrenut ka tebi.' };
X[9497] = { x: 'Na zadnjem staklu policijskog vozila ispred tebe naizmenično se pale natpisi POLICIJA i USPORITE. Postupaš doslovno po tekstu: usporavaš i dalje se krećeš brzinom kojom se kreće policijsko vozilo dok daje taj znak. To je obaveza, a ne preporuka, i ne zavisi od toga da li si prekoračio dozvoljenu brzinu ili napravio bilo kakav prekršaj.' };
X[9499] = { x: 'Displej na zadnjem staklu policijskog vozila naizmenično prikazuje POLICIJA i PRATITE NAS. Znak znači da se krećeš za tim vozilom sve dok ga ono daje. Nije reč o preporuci za bezbedno kretanje, niti obaveza zavisi od toga da li si u vožnji napravio prekršaj: svetlosni znaci sa policijskog vozila su uvek bezuslovna obaveza.' };
X[9502] = { x: 'Po hijerarhiji postupanja svetlosni znak je jači od saobraćajnog znaka, a slabiji jedino od naredbe ovlašćenog lica. Uz put crvenog vozila stoje i STOP tabla i semafor koji mu pokazuje zeleno — dok semafor radi, tabla se ne primenjuje. Opšte pravilo o prvenstvu dolazi na red tek kada nema ni semafora ni znaka.' };
X[9504] = { x: 'Semafor pobija saobraćajni znak, pa iako se desno vidi STOP tabla, tvoje postupanje određuje upaljeno svetlo — a ono je crveno, što znači zaustavljanje ispred raskrsnice. Opšte pravilo o prvenstvu prolaza ovde uopšte ne dolazi na red, jer se ono primenjuje samo kada prvenstvo nije regulisano ni semaforom ni znakom.' };
X[9505] = { x: 'Ovde prema tebi nema ni semafora ni saobraćajnog znaka, ali kolovoz nije prazan: pred tobom su iscrtani pešački prelaz i neisprekidana bela linija koja preseca ulaz u raskrsnicu. I jedno i drugo su oznake na kolovozu, a one su u hijerarhiji iznad opštih pravila saobraćaja. Zato tvrdnja da postupanje nije regulisano zato što nema znaka pada — izostanak znaka ne znači izostanak regulacije, a opšte pravilo dolazi na red tek kada nema ni znaka ni oznake.' };
X[9509] = { x: 'Na ovoj raskrsnici nema semafora, niti znaka ili oznake koja bi delila prvenstvo, pa se spuštaš do poslednje stepenice hijerarhije — opšteg pravila saobraćaja. Ono ti nalaže da propustiš vozilo koje nailazi sa tvoje desne strane, a odatle ti se i približava crveni automobil. Pešački prelaz uređuje odnos prema pešacima, a ne prvenstvo među vozilima.' };
X[9510] = { x: 'Saobraćajni znak je u hijerarhiji iznad oznake na kolovozu. Uz kolovoz je postavljen plavi znak obaveznog smera i on određuje kuda smeš da se krećeš, iako su na kolovozu iscrtane strelice koje govore drugačije. Kada se to dvoje razilazi, jača karika odlučuje, a slabija se zanemaruje — zato smer kretanja ovde diktira znak, ne strelica.' };
X[9511] = { x: 'I ovde odlučuje odnos znaka i oznake: plavi znak obaveznog smera kraj kolovoza dopušta samo smerove prikazane na njemu, a skretanje ulevo nije među njima. Strelica iscrtana na kolovozu je slabija karika i ne daje ti pravo koje joj znak oduzima. Ovakva neusaglašenost signalizacije je česta zamka — uvek gledaj znak.' };
X[9512] = { x: 'Na kraku kojim vozilo prilazi raskrsnici postavljen je trougaoni znak za ustupanje prvenstva, a saobraćajni znak je jači i od oznake na kolovozu i od opštih pravila. Zato kratka poprečna linija na kolovozu ne odlučuje sama za sebe — ona samo pokazuje gde se ustupa prvenstvo koje je znakom već određeno, a pravilo o desnoj strani pada čim se pojavi znak.' };
X[9517] = { x: 'Iako je iznad semafora postavljena STOP tabla, dok semafor radi važi njegovo svetlo — ono je u hijerarhiji odmah ispod naredbe ovlašćenog lica, a iznad saobraćajnog znaka. Žutom vozilu je upaljeno zeleno, pa prolazi bez zaustavljanja, dok poprečnom pravcu gori crveno. Opštem pravilu o prvenstvu ovde nema šta da se reši.' };
X[9518] = { x: 'Na semaforizovanoj raskrsnici odlučuje semafor: jači je od svakog saobraćajnog znaka, pa STOP tabla gore desno ne traži zaustavljanje dok svetla rade. Tebi je upaljeno zeleno i to je ono po čemu postupaš. Pravilo o prvenstvu prolaza primenjuje se tek kada prvenstvo nije regulisano ni semaforom ni znakom, a ovde jeste.' };
X[9519] = { x: 'Ulazak u raskrsnicu ti određuje semafor — zeleno ti daje slobodan prolaz i time gasi i STOP tablu iznad njega. Ali semafor ne rešava sve: vozilo iz suprotnog smera takođe ima zeleno i skreće preko tvoje putanje, a njihov međusobni odnos deli opšte pravilo, po kojem onaj ko skreće ulevo propušta vozilo iz suprotnog smera. Zato su tačna oba odgovora, dok dopunska tabla samo opisuje oblik raskrsnice.' };
X[9521] = { x: 'Semafor ti pokazuje zeleno i on određuje ulazak u raskrsnicu — jači je od STOP table iznad njega, pa se ona ne primenjuje dok svetla rade. Semafor ipak ne rešava odnos prema vozilu koje u istom trenutku preseca tvoju putanju; tu odlučuje opšte pravilo o prvenstvu prolaza, zbog čega su tačna oba odgovora. Oznake na kolovozu su najslabija karika i ovde ništa ne menjaju.' };
X[9524] = { x: 'Na vrhu hijerarhije je naredba ovlašćenog lica: kada policajac reguliše saobraćaj, njegovi znaci gase i semafor i svaki saobraćajni znak, pa i STOP tablu desno. Zato ne gledaš upaljeno zeleno svetlo nego njega. Opšte pravilo o prvenstvu prolaza je poslednja stepenica i primenjuje se samo kada nema ničeg jačeg — ovde ima.' };
X[9526] = { x: 'Policajac koji reguliše saobraćaj je najjača karika — njegovi znaci pobijaju i semafor i saobraćajni znak. Zato ni žuti romb sa desne strane, znak koji označava put sa prvenstvom prolaza, ne odlučuje umesto njega. Postupaš isključivo po njegovim znacima, a opšte pravilo o prvenstvu dolazi na red tek kada saobraćaj niko i ništa ne reguliše.' };
X[9528] = { x: 'Ovlašćeno lice je iznad svega ostalog u hijerarhiji, pa i iznad oznaka na kolovozu — linija zaustavljanja te ne obavezuje dok saobraćajem upravlja policajac. On stoji bokom prema tvom pravcu, a to je položaj koji znači slobodan prolaz. Opšte pravilo o prvenstvu važi samo kada saobraćaj nije regulisan ni ovlašćenim licem, ni semaforom, ni znakom.' };
X[9530] = { x: 'Znak ovlašćenog lica je jači od oznake na kolovozu, pa linija zaustavljanja ne traži da staneš kada ti policajac daje prolaz — on stoji bokom prema tvom pravcu, a taj položaj znači slobodno kretanje. Zato tu i nema pravog sukoba dva znaka: hijerarhija ga rešava odmah, a opšte pravilo o prvenstvu se u ovakvoj situaciji uopšte ne primenjuje.' };
X[9538] = { x: 'Posebnu pažnju duguješ pešacima koji su na kolovozu, jer su oni neposredno ugroženi: jedan prelazi preko kolovoza ispred tebe, a drugi se kreće duž kolovoza uz desnu ivicu, izvan zaštićene površine. Pešaci koji su na trotoaru, uključujući i onog koji je prelaz već završio, nisu u tvojoj putanji i zato nisu tačan izbor.' };
X[9542] = { x: 'Autobus stoji na stajalištu uz trotoar i iz njega izlaze odrasli putnici — tada se traži da prilagodiš brzinu tako da vozilo možeš bezbedno zaustaviti i ne ugroziti ta lica. Bezuslovno zaustavljanje propisano je kod vozila kojim se prevoze deca, što ovde nije slučaj. Nastavak vožnje bez usporavanja takođe otpada, jer se ljudi kreću po kolovozu oko autobusa.' };
X[9545] = { x: 'Tramvaj stoji na stajalištu koje nema izdignuto ostrvo, pa putnici koji ulaze i izlaze moraju da koriste kolovoz kojim se ti krećeš. U toj situaciji si dužan da sačekaš iza njega dok ulaženje i izlaženje ne prestane. Obilaženje u brzini hoda nije dozvoljeno, a ni to što su te ljudi primetili ne skida obavezu zaustavljanja.' };
X[9554] = { x: 'Narandžasta kvadratna tabla sa likovima dece nije znak pored puta nego oznaka na samom vozilu: njome se obeležava autobus ili drugo vozilo kojim se obavlja organizovan prevoz dece. Blizinu škole i mesta na kojima se deca češće kreću najavljuje trougaoni znak opasnosti sa sličnim simbolom — po obliku i boji ih razlikuješ na prvi pogled.' };
X[9555] = { x: 'Vozilo kojim se prevoze deca obeležava se narandžastom kvadratnom tablom sa crnim likovima dece — to je oznaka na vozilu, a ne znak pored puta. Crveni trougao je znak opasnosti koji najavljuje decu na putu, dok su plavi znakovi obaveštenja, uključujući i onaj sa natpisom o školskoj zoni. Narandžasta podloga ti govori da su deca u vozilu ispred tebe.' };
X[9559] = { x: 'U naselju si dužan da omogućiš autobusu da se sa stajališta uključi u saobraćaj kada on to najavi pokazivačem pravca — smanjuješ brzinu i po potrebi staješ. Nemaš prvenstvo nad svakim vozilom koje se uključuje, jer je ovo izuzetak propisan baš za vozila javnog prevoza. Ali obaveza nije ni bezuslovno zaustavljanje: staješ samo ako je to potrebno.' };
X[9721] = { x: 'Pretiče se sa leve strane, a desna dolazi u obzir samo kod vozila koje skreće ulevo i kod tramvaja čije su šine po sredini kolovoza. Crveni automobil ispred tebe drži svoju traku i ne daje nikakav znak, pa nema ničega što bi otvorilo desnu stranu. Zato pada ponuda zdesna, a sa njom i ona koja ti nudi obe strane odjednom.' };
X[9723] = { x: 'Oba vozila drže uključen levi pokazivač pravca, ali prednje je taj znak dalo za sebe i najavljuje pomeranje ulevo. Zabranjeno je preticati vozilo koje je dalo znak da menja pravac ulevo ili da i samo pretiče, jer biste u istom trenutku krenuli na istu stranu kolovoza. Sačekaj da prednje vozilo završi svoju radnju, pa tek onda proceni ima li mesta.' };
X[9725] = { x: 'Vozilo ispred tebe uključilo je levi pokazivač pravca i najavljuje skretanje ulevo, pa levu stranu kolovoza drži zauzetom. To je jedan od izuzetaka u kojima se sme preticati zdesna, jer je slobodna upravo desna strana. Pre nego što kreneš, uveri se da desno ima dovoljno prostora i da tuda niko ne dolazi uz samu ivicu.' };
X[9728] = { x: 'Šine tramvaja postavljene su po sredini kolovoza, pa on levu stranu drži zauzetom, dok desno od njega ostaje slobodna saobraćajna traka. Baš zato zakon pravi izuzetak i dozvoljava da se takav tramvaj pretekne zdesna. Odgovor sa levom stranom pada jer bi te odveo na deo kolovoza namenjen suprotnom smeru.' };
X[9730] = { x: 'Na kolovozu sa najmanje dve saobraćajne trake u istom smeru brže kretanje vozila u jednoj traci od vozila u drugoj zakon ne smatra preticanjem — svako se prosto kreće svojom trakom. Mimoilaženje otpada jer se mimoilaze vozila koja dolaze iz suprotnih smerova, a zeleno vozilo i vozila u levoj traci kreću se na istu stranu.' };
X[9731] = { x: 'Pravilo je isto i kada je brža leva traka: na putu sa dve ili više traka u istom smeru kretanje jedne kolone brže od druge nije preticanje, bez obzira koja je traka u pitanju. Na slici se sva vozila kreću u istom smeru, pa otpada i mimoilaženje — ono postoji samo između vozila iz suprotnih smerova.' };
X[9734] = { x: 'U naselju, na putu sa najmanje dve saobraćajne trake u tvom smeru, prolaženje desnom trakom pored vozila koje se kreće levom trakom nije preticanje, već obično kretanje po trakama. Zakon za to ne traži da se vozila kreću u koloni, pa ponuda koja uslovljava kolonom nije tačna. Znak za naselje na slici potvrđuje da si baš u toj situaciji.' };
X[9739] = { x: 'Belo vozilo je prešlo u levu traku, uključilo levi pokazivač i pretiče crveni automobil koji ide ispred tebe. Vozač koga pretiču ima jednu izričitu zabranu: ne sme da povećava brzinu, a treba da se drži bliže desnoj ivici kolovoza. Propis ga ipak ne tera da koči, niti mu daje pravo da ubrza do najveće dozvoljene brzine dok traje tuđe preticanje.' };
X[9741] = { x: 'Ti si sa uključenim levim pokazivačem izašao u levu traku i pretičeš teretno vozilo. Od trenutka kada preticanje počne, njegov vozač ne sme da povećava brzinu i treba da se drži uz desnu ivicu kolovoza — to važi za svako vozilo koje se pretiče. Obrnuto ne važi: niko ga ne obavezuje da koči, dovoljno je da zadrži brzinu.' };
X[9745] = { x: 'Levu traku već zauzima cisterna koja pretiče, a ispred tebe je i putnički automobil, pa ti pogled na suprotni smer ostaje potpuno zatvoren. Preticanje smeš da otpočneš tek kada se sam uveriš da je put slobodan, a ovde to ne možeš. Tuđa procena ne vredi umesto tvoje, niti te vozilo ispred štiti od onoga što dolazi u susret.' };
X[9747] = { x: 'Žuto teretno vozilo je sa levim pokazivačem izašlo u suprotnu traku i pretiče drugi kamion, pa dve prikolice zajedno zatvaraju ceo pogled napred. Dok ne vidiš da je suprotni smer slobodan, ne smeš ni da otpočneš preticanje. To što je vozač ispred tebe procenio da može, za tebe ne znači ništa — obavezan si da se lično uveriš.' };
X[9748] = { x: 'Vozilo 3 je već u suprotnoj traci, a iz suprotnog smera prilazi vozilo sa upaljenim svetlima. Preticanje smeš da nastaviš samo dok si siguran da ćeš bezbedno stići nazad u svoju traku, pa vozač vozila 3 mora da se vrati čim prođe vozilo 1. Automatsko pravo da se u istom zaletu pretekne i sledeće vozilo ne postoji, a pred vozilom koje nailazi u susret za to nema ni vremena ni prostora.' };
X[9750] = { x: 'Desni pokazivač na teretnom vozilu ispred tebe znači da ono skreće ili se pomera udesno, a nije poziv tebi da kreneš u preticanje. Iza njegove karoserije ne vidiš ništa od puta, pa uslov da se neposredno uveriš u bezbednost nije ispunjen. Ni znak rukom to ne bi promenilo — nijedan vozač ti ne može dati dozvolu umesto tvoje procene.' };
X[9752] = { x: 'I ovde je ista zamka: teretno vozilo daje desni pokazivač, što govori da ono skreće ili staje desno, a ne da je tebi javilo da je put slobodan. Odgovornost je uvek na onome ko pretiče, pa moraš sam da se uveriš da radnju možeš bezbedno da izvršiš. Dodatni razlog za oprez je što takvo vozilo pred skretanjem može naglo da uspori.' };
X[9754] = { x: 'Ispred tebe je dugačak autobus, a iz suprotnog smera već dolazi vozilo sa upaljenim svetlima. Da bi prošao pored autobusa, morao bi predugo da ostaneš u suprotnoj traci, a toliko slobodnog puta nema. Snaga motora i ubrzanje nisu razlozi koje propis priznaje — važno je jedino da li radnju možeš da završiš bez ometanja drugih.' };
X[9757] = { x: 'Ispred tebe je kolona vozila koja se kreću jedno za drugim, a preticanje kolone je izričito zabranjeno. Razlog je praktičan: da bi je prošao, ostao bi predugo u suprotnoj traci i ne bi imao gde da se vratiš ako ti neko naiđe u susret. Zabrana ne zavisi od tvoje procene da imaš dovoljno snage i prostora — kolona se ne pretiče.' };
X[9759] = { x: 'Vozilo 2 se kreće iza vozila 1, već je zauzelo levu stranu i uključilo levi pokazivač, dakle otpočelo je preticanje. Pravilo je jasno: ne otpočinješ preticanje kada je vozač iza tebe već krenuo u tu radnju, jer bi mu ušao pravo u putanju. Prednost zato što si bliži vozilu ispred ne postoji, a linija na kolovozu je isprekidana i ništa ne zabranjuje.' };
X[9760] = { x: 'Vozilo 2 se već izmestilo u levu traku i otpočelo preticanje — drži levu stranu kolovoza i daje levi pokazivač pravca. Zato vozač vozila 1, iako je i on upalio levi pokazivač, ne sme da krene ulevo: ušao bi pravo u putanju onoga koji ga već pretiče. Ni to što je bliži vozilu ispred ne daje mu prednost, a snaga motora nikada nije pravni razlog za preticanje.' };
X[9761] = { x: 'Plavo vozilo je iza žutog već prešlo u levu traku i sa upaljenim levim pokazivačem otpočelo radnju. Ko je prvi izašao, taj je i završava, pa žuti mora da odustane i ostane iza crvenog — inače bi se dva vozila našla jedno pored drugog u istoj traci. Blizina vozila ispred ne stvara prednost, a ni jako ubrzanje nije uslov koji propis poznaje.' };
X[9762] = { x: 'Uz desnu ivicu puta stoji znak zabrane preticanja svih motornih vozila osim motocikala, a kolovoz pred tobom ulazi u krivinu. Zabrana važi od mesta na kome je znak postavljen, pa bi se cela radnja odvijala unutar zone zabrane. To što bi preticanje započeo koji metar pre znaka ne daje ti pravo da ga nastaviš iza njega.' };
X[9764] = { x: 'Plavo vozilo 2 je iza žutog, potpuno je prešlo u levu traku, daje levi pokazivač pravca i ima slobodan put ispred sebe — to je preticanje sa leve strane, onako kako propis traži. Vozilo 1 se tek izmiče ulevo iako ga onaj iza njega već pretiče, pa njegova radnja nije ispravna. Zbog toga u odgovoru stoji samo jedan broj, a ne oba.' };
X[9765] = { x: 'Žuto vozilo 1 se izmiče ulevo da pretekne crveno, ali ga plavo vozilo 2 iza njega već pretiče — potpuno je u levoj traci sa upaljenim levim pokazivačem. Ko je prvi otpočeo radnju, taj je i dovršava, pa vozilo 1 mora da sačeka i zadrži svoju traku. Vozilo 2 sve radi po pravilima, zbog čega odgovor nije ni ono ni oba zajedno.' };
X[9768] = { x: 'Posle preticanja se u svoju traku vraćaš čim to možeš bez ometanja i ugrožavanja drugih — praktično tek kad u ogledalu vidiš celo teretno vozilo i imaš dovoljno odstojanja ispred njega. Zato naglo vraćanje odmah po prolasku pored kamiona nije ispravno, a nije ni ostajanje u levoj traci samo zato što je put ispred prazan.' };
X[9769] = { x: 'Preticanje smeš da izvedeš samo tako da druge ne ometaš i ne ugrožavaš. Crveno vozilo je preticalo trakom za suprotni smer i sada se koso vraća ispred žutog — žutom vozilu iza njega upaljena su stop-svetla, a upaljena su i zelenom vozilu koje mu dolazi u susret. To što nezgoda nije nastala ništa ne menja, a ni obaveza drugih da izbegavaju opasnost ne skida odgovornost sa onoga ko pretiče.' };
X[9770] = { x: 'Autoput ima najmanje dve trake u tvom smeru — levo od tebe je isprekidana razdelna linija, desno puna ivična. Pravilo ostaje isto kao svuda: pretiče se sa leve strane, pa vozilo koje ti je ispred ne smeš da prođeš njegovom desnom stranom. Brže kretanje desnom trakom priznaje se samo kad se saobraćaj odvija u kolonama, a vozila su ovde razređena. Naselje sa ovim pravilom nema veze.' };
X[9772] = { x: 'Znak sa brojem 120 potvrđuje da si na autoputu, a žuta strelica te vodi udesno pored teretnog vozila — upravo ono što propis zabranjuje. Pretiče se isključivo sa leve strane, a desna je rezervisana za posebne slučajeve, kao što je vozilo koje skreće ulevo. Uslov o naselju je izmišljen: pravilo o levoj strani ne zavisi od toga da li si u naselju ili van njega.' };
X[9774] = { x: 'Ispred tebe je teretno vozilo, a žuta strelica te vodi da ga zaobiđeš sa desne strane, uz upaljen desni pokazivač pravca. To nije dozvoljeno: pretiče se sa leve strane, a desno od kamiona i nema trake namenjene tvom kretanju, već samo ivica kolovoza. Vezivanje pravila za naselje je izmišljen uslov — pravilo o levoj strani važi na svakom putu jednako.' };
X[9776] = { x: 'Teretno vozilo ti je ispred u istoj traci, a isprekidana linija levo od tebe otvara traku kojom ga možeš pretići. Zato važi osnovno pravilo: pretiče se sa leve strane. Desno od kamiona je samo ivica kolovoza, a i da tamo ima prostora, prolazak zdesna ti ne bi bio dozvoljen — otud ni ponuda sa obe strane ne stoji.' };
X[9781] = { x: 'Klizav kolovoz nije među zakonskim zabranama preticanja: on te obavezuje da prilagodiš brzinu, odstojanje i način kočenja, ali ti samu radnju ne uskraćuje. Na putu sa tri saobraćajne trake preticanje se izvodi srednjom trakom, koja je za to i namenjena, dok traku uz levu ivicu ne smeš da koristiš. Zato smeš da pretekneš cisternu, uz krajnji oprez na snegu.' };
X[9783] = { x: 'Put ispred tebe skreće ulevo i zaklonjen je rastinjem, pa ne vidiš dovoljno dug slobodan deo trake za suprotni smer. Preticanje teretnog vozila značilo bi ulazak u tu traku naslepo, a radnju smeš da započneš samo kad je preglednost dovoljna da je bezbedno i završiš. Zbog toga preticanje ovde otpada.' };
X[9785] = { x: 'Znak najavljuje dvostruku krivinu, a kolovoz pred tobom nestaje iza stenovitog useka — traku za suprotni smer jednostavno ne vidiš. Preticanje tamnog vozila tražilo bi ulazak u tu traku bez ikakve preglednosti, što propis zabranjuje. Ograničenje od 50 je dodatni znak da je deo puta zahtevan, ali odlučuje nedostatak preglednosti.' };
X[9787] = { x: 'U tvom smeru postoje dve trake: levu od tvoje odvaja isprekidana linija, a od suprotnog smera te deli dvostruka puna linija. Preticanje zato ne znači ulazak u traku za suprotni smer, pa zabrana koja važi na vrhu prevoja tebe ne pogađa — ona štiti od sudara sa vozilom koje ne vidiš iza prevoja. Pravilo važi jednako za sve vozače, ne samo za putnička vozila.' };
X[9789] = { x: 'Od suprotnog smera te deli dvostruka puna linija, a isprekidana linija desno od tvoje trake otvara još jednu traku istog smera — njome se kreće crveno vozilo. Pošto u tvom smeru postoje dve trake, preticanje ne traži ulazak u traku za suprotni smer, pa zabrana zbog nepregledne krivine ovde ne važi. Podela na putnička i ostala vozila ne postoji ni u jednom propisu.' };
X[9793] = { x: 'Vozilo ispred tebe koči i zaustavlja se pred pešačkim prelazom, koji je označen i znakom i oznakama na kolovozu, a pešak se sa desne strane sprema da pređe. Preticanje vozila koje staje radi propuštanja pešaka zabranjeno je zato što bi ti izleteo pred pešaka koga zbog tog vozila uopšte ne vidiš. Zabrana važi svuda, i u naselju i van njega.' };
X[9796] = { x: 'Ispred tebe je prelaz puta preko železničke pruge u istom nivou — šine se jasno vide preko kolovoza, a vozila su već tik uz njih. Na samom prelazu preticanje je zabranjeno, jer bi se dva vozila uporedo našla na mestu sa koga se ne mogu brzo skloniti, a radnja započeta odavde završavala bi se baš na šinama. Slobodna traka za suprotni smer tu ništa ne menja: zabrana je vezana za mesto.' };
X[9797] = { x: 'Pored puta stoje Andrejin krst i znak obavezno zaustavljanje, a šine seku kolovoz odmah iza vozila ispred tebe — to je prelaz preko pruge u istom nivou. Na njemu i neposredno pre njega preticanje je zabranjeno, pa ni prav put ni prazna suprotna traka ne menjaju stvar. Prvo bezbedno pređeš prugu, pa tek onda razmišljaš o preticanju.' };
X[9799] = { x: 'Desno od puta je Andrejin krst, a kolovoz ispred crvenog vozila seku šine — voziš ka prelazu preko pruge u istom nivou, gde preticanje nije dozvoljeno, kao ni neposredno ispred njega. Svetlosni znak upozorenja tu ništa ne menja: on je samo najava tvoje namere, a ne dozvola koja ukida zabranu. Ostani iza vozila dok ne pređeš prugu.' };
X[9801] = { x: 'Ispred tebe je vozilo policije sa upaljenim rotacionim svetlima koje prati autobus — to je kolona vozila pod pratnjom, a nju ne smeš ni da pretičeš ni da obilaziš. Zato ni uključen levi pokazivač pravca ni svetlosni znak upozorenja ne daju pravo prolaska: pratnja se kreće kao celina i ti ostaješ iza nje.' };
X[9804] = { x: 'Vozilo ispred tebe je u levoj traci, a ti si u desnoj — pretekao bi ga samo prolaskom sa desne strane, a pretiče se sa leve. Zdesna se sme izuzetno, na primer vozilo koje je zauzelo položaj za skretanje ulevo, a ovo nije takav slučaj. Uz to plava tabla desno najavljuje da se dve trake spajaju u jednu, pa prostor za preticanje nestaje.' };
X[9807] = { x: 'Uz tvoju saobraćajnu traku ide neisprekidana uzdužna linija, a nju ne smeš preći da bi pretekao teretno vozilo ispred sebe; levom stranom kolovoza pritom prolazi autobus iz suprotnog smera. Ne pomaže ni čekanje da vozilo ispred tebe završi svoje preticanje — zabrana koju postavlja puna linija time ne prestaje, već tek tamo gde linija ponovo postane isprekidana.' };
X[9809] = { x: 'Sredinom kolovoza idu dve linije jedna uz drugu: sa tvoje strane puna, sa strane suprotnog smera isprekidana — a vozača obavezuje ona koja mu je bliža. Belo vozilo je već prešlo preko pune linije u levu traku i upravo to je ono što se ne sme. Ni prazna suprotna traka ni dovoljno prostora tu ništa ne menjaju.' };
X[9811] = { x: 'Desno stoji znak zabrane preticanja svih motornih vozila, a njegov jedini izuzetak je preticanje motocikla bez bočne prikolice — ispred tebe je putnički automobil, dakle vozilo na koje se zabrana odnosi. Uz to se put savija udesno i preglednost je kratka. Zabrana traje do raskrsnice ili do znaka koji je ukida.' };
X[9813] = { x: 'Uz put stoji znak zabrane preticanja svih motornih vozila, a ispod njega ograničenje brzine. Izuzetak od te zabrane je samo preticanje motocikla bez bočne prikolice, a teretno vozilo ispred tebe to nije. Ni isprekidana linija na kolovozu tu ne pomaže: oznaka na putu dozvoljava prelazak, ali ne može da poništi zabranu koju postavlja znak.' };
X[9815] = { x: 'Uz tvoju stranu kolovoza ide neisprekidana linija, a preko nje se ne prelazi radi preticanja. Osim toga, belo vozilo je već u levoj traci pored traktora sa prikolicom, pa bi ti krenuo da pretičeš iza vozila koje već pretiče — a to je zabranjeno, jer nemaš gde da se vratiš ako ono uspori. Ostani u svojoj traci.' };
X[9819] = { x: 'Sredinom kolovoza idu dve linije jedna uz drugu, puna i isprekidana, a svakog vozača obavezuje ona koja mu je bliža. Crnom vozilu je sa njegove strane bliža puna linija, pa ono nije smelo da izađe levo radi preticanja; isprekidana strana važi za vozila koja dolaze iz suprotnog smera. Zato je ovo prelazak preko zabranjene linije.' };
X[9820] = { x: 'Put ima dve trake u istom smeru, razdvojene isprekidanom linijom, i plavo vozilo pretiče crveno upravo sa leve strane — tačno onako kako pravilo nalaže. Levo od njega je ivica kolovoza sa zaštitnom ogradom, a ne traka za suprotan smer, pa uslov da suprotna traka bude slobodna ovde nema šta da traži.' };
X[9821] = { x: 'Vozilo koje bi pretekao je u levoj traci, a ti si u desnoj — prolaz bi bio sa desne strane, a pretiče se sa leve. Zdesna se sme samo izuzetno: vozilo koje je zauzelo položaj za skretanje ulevo ili tramvaj sa šinama po sredini kolovoza. Olakšica po kojoj se prolaženje s desne strane ne smatra preticanjem važi samo u naselju, a ovde si van njega.' };
X[9823] = { x: 'Levo od tebe je slobodna traka, odvojena isprekidanom linijom, i tuda se izlazi u preticanje — osnovno pravilo je da se pretiče sa leve strane. Sa desne se sme samo izuzetno: vozilo koje je zauzelo položaj za skretanje ulevo ili tramvaj sa šinama po sredini kolovoza. Ovde ničeg takvog nema, pa i desna strana i kombinacija obe strane otpadaju.' };
X[9826] = { x: 'Razdelna linija je isprekidana, dakle sme se preći radi preticanja, i nema znaka koji preticanje zabranjuje — zato tvrdnja da te oznake na kolovozu zaustavljaju ne stoji. Ne stoji ni pozivanje na opšta pravila: nisi ni pred raskrsnicom ni pred prelazom preko pruge, a deo puta je pregledan. Pretičeš sa leve strane, kada se uveriš da je suprotna traka slobodna dovoljno dugo.' };
X[9829] = { x: 'Razdelna linija je isprekidana, put je prav, nema znaka zabrane ni mesta na kojem se po pravilima ne sme preticati — zato ti preticanje jeste dozvoljeno. Ostaje tvoja procena: ispred tebe je dugačko teretno vozilo, za koje ti treba osetno više puta nego za putnički automobil, a u daljini se na putu već nazire vozilo.' };
X[9836] = { x: 'Sa tvoje desne strane je teretno vozilo, a ispred njega niz vozila koja se kreću jedno za drugim — to je kolona, a preticanje kolone je zabranjeno. Zato ne prolazi ni ideja da pretekneš samo teretno vozilo, jer bi i to bio ulazak u preticanje kolone. Uključen levi pokazivač pravca ne daje ti pravo prolaza niti ukida zabranu.' };
X[9839] = { x: 'Ispred tebe je niz vozila, a levom polovinom kolovoza ti u susret dolaze vozila sa upaljenim svetlima. Traka kojom bi pretekao je zauzeta, pa radnju ne bi mogao da završiš i vratiš se udesno bez ugrožavanja suprotnog smera — zato ti preticanje ovde nije dozvoljeno. Ponuda vezana za kolonu ne pomaže: i da kolone nema, vozila koja ti dolaze u susret sama zatvaraju preticanje. Sneg pod točkovima nije ono što ga zabranjuje, ali traži još veći oprez.' };
X[9847] = { x: 'Žuti romb pored puta znači da se krećeš putem sa prvenstvom prolaza, a na takvom putu preticanje neposredno ispred raskrsnice i na njoj jeste dozvoljeno (poprečni put ima znak STOP). Crveno vozilo je zauzelo položaj za skretanje ulevo i drži levu stranu, pa mu je slobodna samo desna — vozilo koje skreće ulevo pretiče se zdesna. Zato pada i ponuda o levoj strani i ona o zabrani.' };
X[9848] = { x: 'Put kojim se krećeš obeležen je žutim rombom, dakle put sa prvenstvom prolaza — na njemu zabrana preticanja ispred raskrsnice i na raskrsnici ne važi (poprečni put ima STOP). Plavo vozilo skreće udesno i pomera se ka desnoj ivici, pa leva strana ostaje slobodna i pretičeš ga na uobičajen način. Zabrana bi važila samo da si na putu bez prvenstva prolaza.' };
X[9849] = { x: 'Oba vozila prolaze raskrsnicu pravo, a žuti romb pokazuje da ste na putu sa prvenstvom prolaza — tu preticanje na raskrsnici nije zabranjeno, jer poprečni put ima znak STOP. Pošto zeleno vozilo ispred zadržava pravac i ne pomera se ka sredini kolovoza, važi osnovno pravilo i prolaziš mu sa leve strane. Desna bi dolazila u obzir samo da je zauzelo položaj za skretanje ulevo.' };
X[9850] = { x: 'Raskrsnica je semaforizovana i za tvoj smer gori zeleno — kada je saobraćaj na raskrsnici regulisan svetlosnim saobraćajnim znacima, zabrana preticanja na raskrsnici ne važi. Crveno vozilo ispred zadržava pravac i ne pomera se ka sredini kolovoza, pa nema razloga za prolazak zdesna: prolaziš pored njega sa leve strane, po osnovnom pravilu.' };
X[9851] = { x: 'Pretiče se sa leve strane, a žuta putanja te vodi u uzan procep između dva vozila: pored crvenog automobila prošao bi mu zdesna, a sam procep nije saobraćajna traka. Crveni je uz to upalio levi pokazivač pravca, dakle najavljuje da se pomera ulevo. U tunelu je preticanje dozvoljeno samo tamo gde u tvom smeru postoje najmanje dve saobraćajne trake — prolaz između dva vozila to nije.' };
X[9852] = { x: 'Motociklista prolazi pored vozila koja stoje sa njihove desne strane, i to po žutoj liniji, dakle ne krećući se nijednom saobraćajnom trakom. Pretiče se sa leve strane; zdesna samo izuzetno — kad vozilo ispred skreće ulevo ili kad je reč o tramvaju na šinama po sredini kolovoza. Nijednog od tih izuzetaka ovde nema, pa je način izvođenja radnje nepropisan.' };
X[9853] = { x: 'Motociklista prolazi sa leve strane, ima dovoljno prostora i može da se vrati u svoju traku, pa je sama radnja izvedena kako treba. Ali to što ne ulazi u traku namenjenu suprotnom smeru nije ono što radnju čini dopuštenom — ona ostaje dozvoljena samo ako na tom delu puta nema znaka koji preticanje zabranjuje. Zato je tačan odgovor uslovljen izostankom takvog znaka.' };
X[9854] = { x: 'Sa obe strane su kolone vozila koja stoje, a jedini prostor koji ostaje je uzan procep između njih — a to nije saobraćajna traka. Kolona vozila se ne sme ni preticati ni obilaziti, pa ni motociklu nije dozvoljeno da se provlači između dve kolone. Sačekaj da se kolona pokrene i kreći se svojom trakom.' };
X[9855] = { x: 'Ovde se pretiče vozač mopeda: vozilo auto-škole prolazi pored njega sa njegove leve strane. Vozač koga pretiču ne sme da povećava brzinu kretanja i dužan je da se pomeri ka desnoj ivici kolovoza, kako bi onaj koji pretiče što pre i bezbedno završio radnju. Usporavanje nije propisana obaveza, a ubrzavanje do najveće dozvoljene brzine je upravo ono što je zabranjeno.' };
X[9858] = { x: 'Na kolovozu je uzdignuto ostrvo — površina koja nije namenjena za saobraćaj vozila. Na putu na kome se saobraćaj odvija u oba smera takvu površinu obilaziš sa desne strane, jer bi te leva odvela na kolovoznu polovinu namenjenu vozilima iz suprotnog smera. Zato ni ponuda sa levom stranom ni ona koja ti daje slobodu izbora ne prolaze.' };
X[9860] = { x: 'Ispred tebe je obeležen pešački prelaz — vidiš i znak i oznake na kolovozu — a vozilo ispred se zaustavilo da propusti pešaka koji sa desne strane stupa na kolovoz. Vozilo koje se zaustavilo radi propuštanja pešaka ne smeš ni da pretičeš ni da obilaziš, i tu izuzetka nema, ni u naselju ni van njega. Sačekaj iza njega dok pešak ne pređe.' };
X[9862] = { x: 'Ispred tebe je uzdignuto ostrvo, a na njemu plavi okrugli znak sa strelicom usmerenom nadole udesno — obavezno obilaženje sa te strane. Reč je o površini koja nije namenjena za saobraćaj vozila, pa je obilaziš onuda kuda te znak upućuje; leva strana bi značila prelazak na deo kolovoza namenjen suprotnom smeru.' };
X[9865] = { x: 'Radovi zatvaraju sredinu kolovoza, a na prepreci stoje dva plava okrugla znaka sa strelicama — jedna usmerena nadole ulevo, druga nadole udesno. To znači da se zatvorena površina obilazi sa obe strane, što potvrđuju i čunjevi koji vode i levo i desno. Kad ti signalizacija otvara oba prolaza, ponude koje biraju samo jednu stranu su netačne.' };
X[10343] = { x: 'Na krovu naizmenično sevaju crveno i plavo trepćuće svetlo, pa ovo nije obično policijsko vozilo nego vozilo pod pratnjom. Vozač takvog vozila ne mora da se drži propisa o ograničenju brzine, pa ga ne veže ni 50 km/h koje važi u naselju označenom znakom pored puta — jedini uslov je da ne ugrozi ostale učesnike. Zamka je baš taj znak naselja: on stoji na slici, ali za ovo vozilo ne odlučuje.' };
X[10344] = { x: 'Rampa na krovu je ugašena: nema ni crvenog ni plavog trepćućeg svetla, pa policijsko vozilo ovde nije ni vozilo pod pratnjom ni vozilo sa pravom prvenstva prolaza. Za njega važe ista pravila kao za tebe, a znak sa siluetom zgrada označava naselje, gde je najveća dozvoljena brzina 50 km/h. Boja i natpis na vozilu ne daju nikakva prava — daju ih samo upaljeni posebni znaci.' };
X[10345] = { x: 'Policijsko vozilo je prešlo u traku za suprotan smer i pokazivačima pravca najavljuje preticanje žutog vozila, a na krovu mu naizmenično sevaju crveno i plavo svetlo — to je vozilo pod pratnjom. Njegov vozač ne mora da se drži pravila o preticanju ni pune razdelne linije, pod uslovom da ne ugrožava druge, pa je manevar dozvoljen. Bez upaljenih svetala isto preticanje ne bi smelo.' };
X[10346] = { x: 'Vozilo daje crveno i plavo trepćuće svetlo, dakle reč je o vozilu pod pratnjom, a njegov vozač ne mora da postupa po pravilima o pešačkom prelazu. Zato nema obavezu da propusti pešaka, ali mora da vozi sa naročitom pažnjom i ne sme da ga ugrozi — zbog toga je odgovor uslovljen, a ne bezuslovan. Da svetla nisu upaljena, propuštanje bi bilo obavezno.' };
X[10347] = { x: 'Na krovu nema nijednog upaljenog posebnog svetla, pa je ovo obično vozilo u saobraćaju, bez obzira na oznake policije. Pešak je već stupio na obeleženi pešački prelaz, a vozač koji mu se približava dužan je da ga propusti. Poseban status i oslobađanje od ovog pravila daju samo upaljeni posebni svetlosni i zvučni znaci, kojih ovde nema.' };
X[10350] = { x: 'Oba vozila daju naizmenično crveno i plavo svetlo, dakle oba su vozila pod pratnjom i nijedno drugom ne može da nametne prvenstvo — odlučuje ono što je na kolovozu. Ispred vozila 2, tik pre pešačkog prelaza, povučena je puna poprečna linija zaustavljanja, pa ono staje i propušta vozilo 1. Zbog te linije se ne primenjuje pravilo desne strane, iako vozilo 2 nailazi vozilu 1 zdesna.' };
X[10351] = { x: 'Naredba ovlašćenog lica jača je od svih ostalih načina regulisanja, pa i od posebnih svetala koja daju oba policijska vozila. Kod raširenih ruku staje onaj kome je policajac okrenut licem ili leđima, a prolazi onaj ko nailazi sa strane, u pravcu ruku. Vozilo 2 nailazi baš duž ose njegovog tela i mora da čeka, dok vozilo 1 raskrsnicu preseca bočno i slobodno prolazi.' };
X[10352] = { x: 'Oba vozila daju crveno i plavo svetlo, pa nijedno nema prednost nad onim drugim i odlučuje postavljena signalizacija. Vozilo 1 se kreće putem sa prvenstvom prolaza (žuti romb), a pred vozilom 2 su znak obavezno zaustavljanje i puna linija zaustavljanja, pa ono mora da stane i propusti. Zato prolazi vozilo 1, iako mu vozilo 2 dolazi sa desne strane.' };
X[10353] = { x: 'Oba policijska vozila daju crveno i plavo svetlo, pa se njihov poseban status međusobno poništava i vrede obična pravila o prvenstvu. Vozilo 2 pokazivačem pravca najavljuje skretanje ulevo i time preseca putanju vozila 1, koje mu dolazi iz suprotnog smera. Ko skreće ulevo dužan je da propusti vozila iz suprotnog smera, pa prednost ima vozilo 1.' };
X[10354] = { x: 'Pravo prvenstva prolaza daje samo upaljeno plavo trepćuće svetlo uz zvučni znak, a jedino ga ima sanitetsko vozilo pod brojem 2, sa upaljenim plavim rotacijama na krovu. Vozila 1 i 3 jesu policijska, ali su im posebna svetla ugašena, pa se u saobraćaju vladaju kao svako drugo vozilo. Status daju upaljeni znaci, a ne boja i natpis na karoseriji.' };
X[10365] = { x: 'Policijsko vozilo daje samo plavo trepćuće svetlo, pa je vozilo sa pravom prvenstva prolaza. Njegovog vozača ne vezuju propisi o prvenstvu prolaza, tako da ga ne zaustavlja ni znak obavezno zaustavljanje na njegovom prilazu, a ostali su dužni da ga propuste — i žuto vozilo koje nailazi putem sa prvenstvom, obeleženim žutim rombom. Zato o prvenstvu ovde ne odlučuju postavljeni znakovi.' };
X[10366] = { x: 'Policijsko vozilo sa upaljenim plavim trepćućim svetlom je vozilo sa pravom prvenstva prolaza i svi ostali su dužni da ga propuste, iako na ovoj raskrsnici nema nijednog znaka. Da svetlo nije upaljeno, prednost bi po pravilu desne strane imalo žuto vozilo, jer policijskom vozilu nailazi zdesna — na to te vuče ponuđeni odgovor o pravilima saobraćaja.' };
X[10369] = { x: 'Upaljeno plavo trepćuće svetlo znači da je ovo vozilo sa pravom prvenstva prolaza, pa njegovog vozača ne vezuju propisi o ograničenju brzine — ni 50 km/h u naselju, ni bilo koji drugi broj. Jedina granica mu je bezbednost ostalih učesnika u saobraćaju, zbog čega su oba odgovora sa konkretnim kilometrima netačna.' };
X[10370] = { x: 'Rampa na krovu ne svetli, nema ni plavog ni crvenog trepćućeg svetla, pa je ovo obično vozilo u saobraćaju. Znak sa siluetom zgrada označava naselje, u kome je najveća dozvoljena brzina 50 km/h, i policijsko vozilo mora da poštuje to ograničenje. Oslobađanje od ograničenja brzine donose samo upaljeni posebni svetlosni i zvučni znaci.' };
X[10371] = { x: 'Policijsko vozilo daje plavo trepćuće svetlo, pokazivačem pravca najavljuje preticanje žutog vozila i već je prešlo preko pune razdelne linije u traku za suprotan smer. Kao vozilo sa pravom prvenstva prolaza ne mora da se drži pravila o preticanju ni oznaka na kolovozu, uz uslov da ne ugrožava druge, pa je manevar dozvoljen. Ostali su dužni da mu ga još i olakšaju.' };
X[10372] = { x: 'Policijsko vozilo nema upaljeno plavo rotaciono svetlo ni sirenu, pa u ovoj situaciji nije ni vozilo pod pratnjom ni vozilo sa pravom prvenstva prolaza — za njega važe ista pravila kao za tebe. Da bi preteklo žuti automobil, prešlo je preko neisprekidane uzdužne linije, u traku za suprotni smer, a to je zabranjeno. Sam natpis na vozilu ne daje nikakvu privilegiju; nju daju samo propisani svetlosni i zvučni znaci, dok se daju.' };
X[10373] = { x: 'Plavo trepćuće svetlo znači da je to vozilo sa pravom prvenstva prolaza, a takvo vozilo sme da odstupi od pravila saobraćaja, pa i od obaveze propuštanja pešaka na obeleženom prelazu, dok izvršava hitan zadatak. Granica je bezbednost: ako bi prolaskom ugrozilo pešaka koji je već na prelazu, mora da ga propusti. Znak pešačkog prelaza tu ništa ne menja, jer se odnosi na uobičajena pravila.' };
X[10376] = { x: 'Oba vozila daju isti znak, plavo trepćuće svetlo, pa nijedno nema prednost nad drugim: kad se sretnu dva vozila sa pravom prvenstva prolaza, među njima važe obična pravila. Raskrsnica nema ni znakove ni semafor, pa odlučuje pravilo desne strane, a vozilu broj 1, koje se kreće gornjom ulicom udesno, drugo vozilo prilazi zdesna. Zato ono ide prvo, iako su oba policijska.' };
X[10377] = { x: 'Naredba ovlašćenog lica je na vrhu hijerarhije i jača je i od semafora, i od znakova, i od prava prvenstva prolaza, pa i vozilo sa upaljenim plavim svetlom mora da postupi po njoj. Policajac stoji raširenih ruku: prolaz je slobodan onima koji mu nailaze bočno, a zabranjen onima kojima je okrenut licem ili leđima. Vozilo broj 1 dolazi iz poprečne ulice, sa strane, pa prolazi prvo.' };
X[10378] = { x: 'I sanitetsko i policijsko vozilo daju plavo trepćuće svetlo, pa su oba vozila sa pravom prvenstva prolaza i nijedno se ne može pozvati na prednost nad drugim. Kad su izjednačeni, važe obična pravila, a ovde su postavljeni znakovi: vozilo hitne pomoći nailazi putem sa prvenstvom prolaza, dok je pred drugim vozilom znak obaveznog zaustavljanja. Zato ono mora da stane i propusti.' };
X[10379] = { x: 'Oba vozila imaju upaljeno plavo trepćuće svetlo, pa među njima nema privilegije i primenjuju se obična pravila. Vozilo broj 2 pokazivačem pravca najavljuje skretanje ulevo, u bočnu ulicu, i time preseca putanju vozila koje mu dolazi iz suprotnog smera. Onaj ko skreće ulevo propušta vozilo iz suprotnog smera koje zadržava pravac, pa prvo prolazi vozilo broj 1.' };
X[10380] = { x: 'Ovde vozila nisu izjednačena: broj 2 ima upaljeno plavo trepćuće svetlo i to je vozilo sa pravom prvenstva prolaza, dok drugo policijsko vozilo ne daje nikakav poseban znak i vredi kao svako obično vozilo. Zato pravilo o skretanju ulevo pada: iako broj 2 pokazivačem najavljuje skretanje ulevo i preseca suprotni smer, njemu se mora omogućiti prolaz.' };
X[10385] = { x: 'Ovo policijsko vozilo daje samo plavo trepćuće svetlo, pa je vozilo sa pravom prvenstva prolaza, a ne vozilo pod pratnjom. Njega nije zabranjeno preticati: crveni automobil je uključio levi pokazivač i izlazi na preticanje uz isprekidanu liniju, i to je u redu sve dok službenik iz vozila ne da drugačiji znak ili naredbu. Nikakvo posebno odobrenje ti za to ne treba.' };
X[10432] = { x: 'Na displeju policijskog vozila smenjuju se natpisi STOP i POLICIJA. Goli natpis STOP znači da to vozilo pratiš do pogodnog mesta i da svoje vozilo bezbedno zaustaviš iza njega. Displej je sam po sebi dovoljan: ne čekaš da uz njega dobiješ i znak stop tablicom, i obaveza ne zavisi od toga da li si napravio prekršaj.' };
X[10433] = { x: 'Displej ispisuje poruku da staneš ispred službenog vozila, i baš ta reč odlučuje: zaustavljaš se ispred policijskog vozila, a ne iza njega, kao kod golog natpisa STOP. Sam displej je dovoljna naredba, ne traži se da uz njega dobiješ i znak stop tablicom, i ne zavisi od toga da li si u vožnji napravio prekršaj.' };
X[10436] = { x: 'Kraj ovog kraka nema nijednog saobraćajnog znaka, ali kolovoz nije prazan: ispred raskrsnice je iscrtana debela poprečna linija koja crvenom vozilu pokazuje dokle sme i gde propušta. Oznaka na kolovozu je u hijerarhiji iznad opštih pravila, pa se pravilo o desnoj strani ovde ne primenjuje — dok postoji jača karika, ona odlučuje.' };
X[10479] = { x: 'Zakon ne ograničava broj vozila koja smeš da pretekneš odjednom — granice od dva ili tri vozila nigde nema. Merilo je bezbednost: dok god radnju možeš da izvedeš bez ometanja onih iz suprotnog smera i da se bez smetnje vratiš desno između vozila pored kojih prolaziš, smeš da prođeš pored svih. Žuto vozilo je već izašlo levo i drži levi pokazivač pravca, pa nastavlja pored cele grupe.' };
X[10566] = { x: 'Vozilo postaje vozilo pod pratnjom ili vozilo sa pravom prvenstva prolaza tek dok daje propisane znake: naizmenično crveno i plavo trepćuće svetlo uz sirenu za pratnju, odnosno plavo trepćuće svetlo za pravo prvenstva. Na krovnoj rampi ovog vozila ništa ne svetli i ono se kreće u koloni kao i ostali. Boja i oznake vozila same po sebi ne daju nikakvu prednost.' };
X[10575] = { x: 'Vozilo daje crveno i plavo trepćuće svetlo, dakle reč je o pratnji, ali naredba ovlašćenog lica stoji iznad svega ostalog. I vozač vozila pod pratnjom sme da odstupi od pravila saobraćaja, ali ne i od znakova policajca koji reguliše saobraćaj na raskrsnici. Zato o tome ko prolazi ovde odlučuje čovek nasred ulice, a ne rotaciona svetla na krovu.' };
X[10576] = { x: 'Crvena i plava trepćuća svetla koja se naizmenično pale znak su vozila pod pratnjom, a takvo vozilo sme da odstupi od pravila i od saobraćajnih znakova; ostali su dužni da mu omoguće prolaz. Zato znak obaveznog zaustavljanja ispred njega ne prenosi prednost na crveni automobil, iako on nailazi putem sa prvenstvom prolaza. Znakovi uređuju odnose ostalih vozila, ali ne i ovog.' };
X[10577] = { x: 'Raskrsnica nije obeležena znakovima, pa bi inače odlučivalo pravilo desne strane i žuti automobil bi zaista nailazio zdesna. To pravilo je poslednje u hijerarhiji i pada čim se pojavi vozilo pod pratnjom, koje se prepoznaje po naizmeničnom crvenom i plavom trepćućem svetlu. Njemu moraš da omogućiš prolaz, po potrebi i da se skloniš ili zaustaviš.' };
X[10581] = { x: 'Na krovnoj rampi ovog vozila ne gori nijedno svetlo, vide se samo crveno i plavo staklo, i ništa ne ukazuje da se daje zvučni signal. Bez tih znakova policijsko vozilo je obično vozilo u saobraćaju i za njega važe ista pravila kao i za ostale. Prednost daju upaljena svetla i sirena dok traje zadatak, a ne izgled i natpis na vozilu.' };
X[10589] = { x: 'Policajac koji reguliše saobraćaj je na vrhu hijerarhije: njegovi znaci jači su od semafora, saobraćajnih znakova i opštih pravila, pa i od prava prvenstva prolaza. Zato ovde plavo trepćuće svetlo i sirena ne rešavaju ko ide prvi, nego vozač takvog vozila mora da postupi po naredbi ovlašćenog lica. Prvenstvo se čita sa ruku policajca, a ne sa krova vozila.' };
X[10631] = { x: 'Autobus je obeležen narandžastom tablom za organizovan prevoz dece i stoji dok deca izlaze — tada nije dovoljno prilagoditi brzinu, nego se vozila moraju zaustaviti dok ulaženje i izlaženje ne prestane. Obaveza važi za oba smera, pa ni prolazak pored autobusa bez ugrožavanja drugih nije dopušten. Dete može iznenada da istrči na kolovoz.' };
X[10632] = { x: 'Ključ je narandžasta tabla na autobusu: kod organizovanog prevoza dece staje i vozilo koje nailazi iza autobusa i vozilo iz suprotnog smera, sve dok deca ulaze i izlaze. Zato ne prolazi ni odgovor da suprotni smer može da produži, ni onaj da se autobus sme obići pošto propustiš vozilo iz suprotnog smera — dete se pojavljuje ispred ili iza autobusa.' };
X[10634] = { x: 'Autobus ispred tebe nosi narandžastu tablu za organizovan prevoz dece, pa se pravilo pooštrava: moraš da zaustaviš vozilo dok deca ulaze i izlaze, a ne samo da prilagodiš brzinu — prilagođavanje brzine važi kod običnih putnika na stajalištu. Obilaženje nije dozvoljeno ni kada proceniš da nikoga ne bi ugrozio, jer dete može da izađe iz zaklona.' };
X[10636] = { x: 'Obaveza zaustavljanja kod vozila sa narandžastom tablom za prevoz dece ne pogađa samo one koji nailaze iza autobusa — jednako važi i za vozilo iz suprotnog smera, jer deca često pređu kolovoz čim izađu. Zato belom putničkom vozilu nije dovoljno ni prilagođavanje brzine ni procena da prolaz može bez ugrožavanja: mora da stane.' };
X[10637] = { x: 'Trougaoni znak sa dopunskom tablom najavljuje opasno mesto na svega dvadesetak metara ispred tebe, a nalaziš se na početku prevoja. Tu je preglednost nedovoljna — ne vidiš da li ti neko dolazi u susret — pa je na putu sa po jednom saobraćajnom trakom u svakom smeru, kakav je ovaj, preticanje zabranjeno. Bilo bi dozvoljeno samo da u tvom smeru postoje najmanje dve trake.' };

// --- objašnjenja za slikovna pitanja (talas 5) ---
X[7935] = { ...(X[7935] || {}), x: 'Ne gleda se šta je pored tebe, nego šta radiš. Na slici 1 čovek sopstvenom snagom gura automobil, a čim vozilo guraš ili vučeš, ti si pešak. Na slici 4 lice se vozi na koturaljkama, što zakon takođe svrstava u pešake. Zamke su biciklista sa slike 2 i kočijaš na zaprežnim kolima sa slike 3: oni upravljaju vozilom, pa su vozači.' };
X[7941] = { ...(X[7941] || {}), x: 'Naziv radnje određuje šta radi onaj pored koga prolaziš. Vozilo broj 2 ti dolazi u susret, iz suprotnog smera, pa je prolaženje pored njega mimoilaženje. Preticanje bi tražilo da se kreće ispred tebe u istom smeru, obilaženje da stoji ili da je prepreka, a propuštanje uopšte nije prolaženje nego ustupanje prvenstva.' };
X[7943] = { ...(X[7943] || {}), x: 'Teretno vozilo se kreće, i to u istom smeru kao i ti, pa je prolaženje pored njega preticanje. Mimoilaženje otpada jer ti ne dolazi u susret, a obilaženje otpada jer se pomera: obilazi se samo ono što stoji, bilo da je zaustavljeno vozilo ili prepreka. Propuštanje nije prolaženje, već ustupanje prvenstva drugome.' };
X[7945] = { ...(X[7945] || {}), x: 'Putničko vozilo je zaustavljeno, dakle ne pomera se, pa je prolaženje pored njega obilaženje. Preticanje bi bilo samo da se kreće u istom smeru, a mimoilaženje da ti dolazi u susret. Zapamti pravilo: ako onaj pored koga prolaziš stoji, to je uvek obilaženje, svejedno da li je vozilo, objekat ili prepreka na putu.' };
X[7947] = { ...(X[7947] || {}), x: 'Vozilo ispred tebe je parkirano, dakle nepokretno, a prolaženje pored nečega što se ne pomera uvek je obilaženje. Preticanje bi tražilo da se to vozilo kreće u istom smeru, a mimoilaženje da ti dolazi u susret, pa oba otpadaju. Propuštanje nije prolaženje, nego ustupanje prolaza onome ko ima prvenstvo.' };
X[7950] = { ...(X[7950] || {}), x: "Radovi zauzimaju deo kolovoza, pa prolaženjem pored te nepokretne prepreke vršiš obilaženje. Preticanje je prolaženje pored učesnika koji se kreće kolovozom u istom smeru, a mimoilaženje pored učesnika koji dolazi iz suprotnog smera. Ovde se prolazi pored prepreke, ne pored učesnika u kretanju (čl. 7, tačke 73–75)." };
X[7952] = { ...(X[7952] || {}), x: "Gomila materijala zauzima desni deo kolovoza. Prolaženje pored te nepokretne prepreke je obilaženje. Za preticanje bi drugi učesnik morao da se kreće kolovozom u istom smeru, a za mimoilaženje da dolazi iz suprotnog smera (čl. 7, tačke 73–75)." };
X[7956] = { ...(X[7956] || {}), x: 'Radovi zauzimaju tvoju stranu kolovoza, pa da bi prošao moraš da izađeš u deo puta namenjen suprotnom smeru. Vozila koja odatle dolaze imaju prednost, a ti si dužan da usporiš ili staneš i pustiš ih, i to je propuštanje. Pored njih uopšte ne prolaziš, pa nema ni preticanja ni mimoilaženja; prepreku obilaziš tek kada se suprotna traka oslobodi.' };
X[7960] = { ...(X[7960] || {}), x: 'Kolonu čine najmanje tri vozila jedno iza drugog u istoj traci, čije je kretanje međusobno uslovljeno, dakle vozila koja učestvuju u saobraćaju i čekaju jedno na drugo. Ova vozila su parkirana uz ivicu kolovoza: ne kreću se niti čekaju priliku da krenu. Koliko god ih bilo poređanih u nizu, ona nisu kolona.' };
X[7961] = { ...(X[7961] || {}), x: "Autobus i automobili čekaju na crveno u istoj traci, jedno iza drugog. Ima ih najmanje tri, a njihovo kretanje je međusobno uslovljeno, pa čine kolonu i dok miruju. Čekanje po svetlosnom znaku nije zaustavljanje u smislu definicije iz člana 7, tačke 71, ali ne isključuje kolonu iz tačke 77." };
X[7967] = { ...(X[7967] || {}), x: 'Strelica meri prazan prostor između zadnjeg dela prednjeg vozila i prednjeg dela onog iza njega, dakle uzdužnu udaljenost, napred-nazad, a ona se zove odstojanje. Rastojanje je bočna udaljenost, između vozila koja su jedno pored drugog. Prepust je deo samog vozila ispred prve ili iza poslednje osovine, a ne razmak između dva vozila.' };
X[7968] = { ...(X[7968] || {}), x: 'Odstojanje je uzdužna udaljenost, i to samo prazan prostor između vozila: od zadnjeg kraja prednjeg do prednjeg kraja onog iza njega, što meri strelica 3. Strelice 1, 2 i 4 su duže jer u meru uključuju i dužinu jednog ili oba vozila, pa opisuju ukupno zauzet prostor, a ne razmak koji držiš iza vozila ispred sebe.' };
X[7970] = { ...(X[7970] || {}), x: "Strelica meri slobodan prostor bočno između vozila: to je rastojanje. Odstojanje je uzdužni razmak, napred–nazad. Na slici nije označena najmanja dozvoljena mera, već sam pravac i pojam udaljenosti (čl. 7, tačke 86–87)." };
X[7971] = { ...(X[7971] || {}), x: 'Rastojanje je bočna udaljenost, i to prazan prostor između vozila: od bočne strane jednog do bočne strane drugog, što meri strelica 3. Strelice 1 i 2 su šire jer obuhvataju i širinu jednog ili oba vozila, a strelica 4 meri razmak između uzdužnih osa vozila. Nijedna od te tri ne pokazuje slobodan prostor koji je stvarno ostao između njih.' };
X[7989] = { ...(X[7989] || {}), x: 'Vozilo je prevozno sredstvo namenjeno kretanju po putu, bez obzira na to šta ga pokreće. Zato su vozila zaprežna kola, bicikl, valjak kao radna mašina i automobil. Dečja kolica sa slike 2 su dečje prevozno sredstvo, a baštenska kolica sa slike 5 su ručna kolica: oba su izuzeta iz pojma vozila, pa je onaj ko ih gura po putu pešak.' };
X[7991] = { ...(X[7991] || {}), x: 'Bicikl je vozilo sa najmanje dva točka koje se pokreće snagom vozača ili putnika, prenetom pedalama ili ručicama na točkove. Zato su bicikli i klasičan dvotočkaš sa slike 1 i vozilo sa slike 4, koje ima više točkova i sedišta, ali se i dalje pokreće pedalama. Sredstvo sa slike 2 ima samo jedan točak, a ono sa slike 3 ima ugrađen motor.' };
X[7992] = { ...(X[7992] || {}), x: "Motorno vozilo pokreće sopstveni motor i namenjeno je i osposobljeno za prevoz, radove ili vuču priključnog vozila; šinska vozila su izuzeta iz te definicije (ZOBS čl. 7). Na slici su motorna vozila traktor 2, motokultivator 5 i automobil 6. Bicikl 1 pokreće vozač, zaprežna kola 3 vuku konji, a poluprikolica 4 je priključno vozilo koje vuče drugo vozilo." };
X[8038] = { ...(X[8038] || {}), x: 'Trolejbus se prepoznaje po dva kraka na krovu kojima uzima struju iz vazdušne mreže, a vozi po gumenim točkovima po kolovozu, i to je vozilo sa slike 3. Na slici 1 je autobus, koji ima sopstveni motor i nikakvu mrežu iznad sebe, a na slici 2 tramvaj, koji se kreće po šinama. Šine su ono što razdvaja tramvaj od trolejbusa.' };
X[8043] = { ...(X[8043] || {}), x: "Kamion sa slike 2 je TERETNO VOZILO: namenjen je prevozu tereta i odgovara uslovima iz čl. 7 ZOBS-a. Vozilo sa slike 1 ima tri točka, pa pripada triciklima. Na slici 3 je poluprikolica, a na slici 4 traktor sa prikolicom za traktor. Prikolice su priključna vozila, dok je traktor posebna vrsta motornog vozila; ne postaju teretna vozila samo zato što prevoze ili vuku teret." };
X[8057] = { ...(X[8057] || {}), x: 'Zaprežno vozilo je vozilo koje vuče upregnuta životinja, pa se prepoznaje po rudi i po tome što nema nikakav sopstveni pogon, a to su kola sa slike 3. Prikolica sa slike 1 i plug sa slike 2 se priključuju na traktor, dok slika 4 prikazuje motokultivator sa prikolicom, koji ima ugrađen motor. Kod sva tri vuče mašina, a ne zaprega.' };
X[8058] = { ...(X[8058] || {}), x: 'Tramvaj je šinsko vozilo za prevoz putnika koje struju uzima iz vazdušne mreže, a kreće se po šinama, i jedino vozilo na šinama ovde je ono sa slike 1. Na slici 2 je trolejbus: ima krakove za mrežu, ali vozi na gumenim točkovima. Slike 3 i 4 prikazuju turistički vozić i zglobni autobus, oba bez šina, pa nisu tramvaj.' };
X[8059] = { ...(X[8059] || {}), x: "Pun crveni trougao na pakovanju označava lek sa snažnim uticajem na sposobnost upravljanja vozilima ili mašinama. U ovom pitanju to je oznaka 1. Oznake 2, 3 i 4 nisu taj simbol: važni su i trouglasti oblik i puna crvena površina." };
X[8090] = { ...(X[8090] || {}), x: 'Kolovoz je deo puta namenjen za saobraćaj vozila, pa strelica mora da uhvati celu asfaltnu površinu, i tvoj i suprotni smer — to radi jedino 2. Strelica 1 pokriva samo jedan smer, dakle kolovoznu traku, 4 jednu saobraćajnu traku unutar tog smera, a 3 pojas pored kolovoza, uz ogradu, kojim vozila uopšte ne idu.' };
X[8091] = { ...(X[8091] || {}), x: 'Kolovozna traka je deo kolovoza namenjen saobraćaju vozila u jednom smeru, a to je 1: pojas od leve ivične linije do pune razdelne linije na sredini. Broj 2 hvata ceo kolovoz, oba smera zajedno, 4 je samo jedna saobraćajna traka u desnom smeru, a 3 je površina pored kolovoza. Razdelna linija je ključ — ona deli smerove.' };
X[8092] = { ...(X[8092] || {}), x: 'Na autoputu je svaka kolovozna traka podeljena na saobraćajne trake, plus zaustavna traka uz spoljnu ivicu. Levo su saobraćajne 2 i 3, desno 4 i 5, po dve za vožnju u svakom smeru, pa se traže oba para. Brojevi 1 i 6 su zaustavne trake, po njima se ne vozi, a 7 i 8 mere ceo jedan smer, dakle kolovozne trake.' };
X[8093] = { ...(X[8093] || {}), x: 'Saobraćajna traka je uzdužni deo kolovoza širine taman za jedan red vozila, a takva su ovde četiri pojasa: 4 i 5 levo od stuba, 6 i 7 desno. Zato prolaze obe ponude koje spajaju po dva od njih, i ona sa 5 i 6 i ona sa 4 i 7. Broj 1 meri ceo kolovoz od ivice do ivice, 2 i 3 po jedan smer, dakle kolovozne trake, a 8 i 9 zahvataju širi pojas od jednog reda vozila.' };
X[8094] = { ...(X[8094] || {}), x: 'Razdelna linija deli ovaj kolovoz na dva pojasa, svaki za po jedan red vozila — to su 2 i 3 i to su saobraćajne trake. Strelica 1 meri celu širinu asfalta po kojem se vozi, a to je kolovoz, pojam nivo iznad trake. Zato oba ponuđena para sa jedinicom padaju: kolovoz nije traka, on trake sadrži.' };
X[8095] = { ...(X[8095] || {}), x: 'Saobraćajna traka je uzdužni deo kolovoza, obeležen ili neobeležen, širine taman za jedan red vozila u kretanju. Na slici su takva četiri uža pojasa: 4 i 5 sa jedne strane pune razdelne linije, 6 i 7 sa druge, pa se traže oba para. Duže strelice mere širi deo kolovoza, ceo jedan smer, a to je već kolovozna traka.' };
X[8096] = { ...(X[8096] || {}), x: 'Biciklistička traka je deo kolovoza namenjen biciklima i od ostatka je odvojena samo uzdužnom linijom, na istom asfaltu — to je uzani pojas 3, uz koji se biciklista i kreće. Brojevi 1 i 2 su saobraćajne trake za vozila, a 4 je iza ivičnjaka, na uzdignutoj površini za pešake, što više nije deo kolovoza.' };
X[8097] = { ...(X[8097] || {}), x: 'Traka za spora vozila je dodatna traka uz desnu ivicu, na koju se sklanjaju vozila koja se kreću sporo — to je 4, pojas desno od isprekidane linije, a plava tabla gore desno prikazuje upravo tu dodatnu traku. Brojevi 2 i 3 su obične saobraćajne trake, a 5 obuhvata više traka odjednom, pa sam po sebi nije traka.' };
X[8098] = { ...(X[8098] || {}), x: 'Zaustavna traka je pojas uz spoljnu ivicu kolovoza autoputa, namenjen zaustavljanju u nuždi, a ne vožnji — na svakom smeru je po jedna, dakle 1 i 6, uvek uz spoljnu ivicu, nikad uz razdelnu traku. Brojevi 2, 3, 4 i 5 su saobraćajne trake kojima se vozi, a 7 i 8 mere ceo smer, to jest kolovozne trake.' };
X[8099] = { ...(X[8099] || {}), x: 'Traka za uključivanje služi da vozilo ubrza i uđe u tok, pa se ona spaja sa susednom saobraćajnom trakom — to je krajnja leva traka 1, koja dolazi sa priključnog kraka. Brojevi 2 i 3 su redovne saobraćajne trake kojima se vožnja samo nastavlja, a 4 ima suprotnu ulogu: njome se izlazi iz toka.' };
X[8100] = { ...(X[8100] || {}), x: 'Traka za isključivanje je ona kojom vozilo izlazi iz toka, pa se odvaja od ostalih traka i vodi ka izlazu — to je krajnja desna traka 4, iza široke isprekidane linije. Brojevi 2 i 3 su redovne saobraćajne trake kojima se nastavlja pravo, a 1 je na suprotnoj strani i ima obrnutu ulogu: njome se u tok ulazi.' };
X[8101] = { ...(X[8101] || {}), x: 'Traku za vozila javnog prevoza prepoznaješ po žutoj liniji kojom je odvojena od ostalih traka, i po tome što je krajnja desna u svom smeru. Takve su na shemi dve: 4 na gornjoj i 9 na donjoj kolovoznoj traci. Ponuda koja im dodaje broj 1 pada jer 1 meri ceo kolovoz, oba smera zajedno, a ne jednu traku.' };
X[8103] = { ...(X[8103] || {}), x: 'Tramvajska baštica je uzdignuti deo puta namenjen isključivo kretanju tramvaja i fizički je odvojen od kolovoza — na slici je to pojas sa šinama iza ivice asfalta, koji meri 2. Broj 1 leži na kolovozu kojim idu vozila, 4 je duga dijagonala koja seče ceo kolovoz i tek na kraju zalazi u pojas sa šinama, a 3 je na zelenoj površini pored puta.' };
X[8104] = { ...(X[8104] || {}), x: 'Trotoar je deo puta namenjen kretanju pešaka, uzdignut i ivičnjakom odvojen od kolovoza — takva su oba pojasa uz ivice, 1 levo i 5 desno, zato se traže dva broja. Brojevi 2 i 4 mere delove kolovoza kojima idu vozila, a 3 je na samom kolovozu, u zoni pešačkog prelaza; prelaz je deo kolovoza, a ne trotoar.' };
X[8105] = { ...(X[8105] || {}), x: 'Parkiralište je uređena površina namenjena parkiranju vozila, dakle cela ta površina sa obeleženim mestima — to meri 4. Broj 3 je širina jednog parking mesta, samo delić parkirališta, 2 je uzdignuta površina za pešake, a 1 je uz sam rub, van niza mesta. Razlika je u obimu: mesto je jedno, parkiralište je celina.' };
X[8106] = { ...(X[8106] || {}), x: 'Parking mesto je prostor za jedno vozilo, obeležen linijama — na slici je to razmak između dve linije koji meri 3, taman za jedan automobil. Broj 4 obuhvata ceo niz takvih mesta, dakle parkiralište, 2 je površina za pešake, a 1 je uz rub, izvan obeleženih mesta. Pazi na jedninu u pitanju: traži se mesto, ne celina.' };
X[8107] = { ...(X[8107] || {}), x: 'Pešački prelaz je deo kolovoza obeležen oznakama za prelazak pešaka, dakle same bele pruge na asfaltu — na njih pokazuje 1. Broj 3 je saobraćajni znak koji prelaz najavljuje, a znak nije prelaz nego obaveštenje o njemu. Broj 2 pokazuje površinu pored kolovoza, izvan njega, a prelaz može da postoji samo na kolovozu.' };
X[8108] = { ...(X[8108] || {}), x: 'Pešački prelaz se obeležava širokim punim prugama preko kolovoza — takve su pod 4. Oznaka pod 3 sastavljena je od kratkih kvadrata poređanih u dva reda, a tako se obeležava prelaz biciklističke staze preko kolovoza, ne pešački. Brojevi 1 i 2 pokazuju uzdignute površine pored kolovoza, a prelaz je uvek na kolovozu.' };
X[8109] = { ...(X[8109] || {}), x: 'Pešačka staza je put namenjen isključivo kretanju pešaka i odvojen je od kolovoza — na slici je to široka staza pod 3, a plavi okrugli znak podeljen crtom potvrđuje da su pešaci i biciklisti razdvojeni. Pod 2 je biciklistička staza sa nacrtanim biciklom, a 1 i 4 su bele pruge na kolovozu, dakle pešački prelaz.' };
X[8111] = { ...(X[8111] || {}), x: 'Biciklistička staza je put namenjen isključivo kretanju bicikala i odvojen je od kolovoza — to je crvenkasti pojas pod 2, po kome biciklista i vozi, a plavi znak sa biciklom i pešakom podeljen crtom potvrđuje razdvajanje. Broj 1 je kolovoz ulice sa leve strane, a 3 i 4 hvataju celu popločanu površinu, zajedno sa delom za pešake.' };
X[8113] = { ...(X[8113] || {}), x: 'Andrejin krst i podignuti polubranici postoje samo tamo gde put prelazi preko železničke pruge u istom nivou — to je ono što slika prikazuje. Tramvajska baštica ima šine u sopstvenom pojasu, ali nema ni krst ni branike; raskrsnica je ukrštanje puteva; parkiralište je uređena površina za parkiranje. Krst je ovde presudan detalj.' };
X[8114] = { ...(X[8114] || {}), x: 'Pešačko ostrvo je uzdignuta površina usred pešačkog prelaza, na kojoj pešak bezbedno čeka nastavak prelaska preko drugog dela kolovoza — na slici je to ostrvo pod 3, tačno između dva dela prelaza. Broj 1 pokazuje same pruge prelaza, 2 površinu uz ivicu kolovoza, a 4 kolovoz sa oznakama; nijedno od toga nije ostrvo.' };
X[8116] = { ...(X[8116] || {}), x: 'Bela tabla sa crnom siluetom zgrada je znak kojim počinje naselje, a sa njim i sva pravila koja u naselju važe, pre svega niže ograničenje brzine. Naseljeno mesto je geografski pojam i obeležava se tablom sa imenom mesta, pa je to zamka. Zona usporenog saobraćaja i turističko odredište imaju sasvim druge znakove.' };
X[8118] = { ...(X[8118] || {}), x: 'Ista silueta zgrada, ali precrtana crvenom kosom linijom, znači kraj: od tog mesta naselje prestaje, a sa njim i pravila koja u naselju važe. Precrtavanje je ključ — bez crvene linije isti znak bi označavao početak. Naseljeno mesto se obeležava tablom sa imenom, a zona usporenog saobraćaja ima svoj poseban znak.' };
X[8224] = { ...(X[8224] || {}), x: 'Ovo nije obično nepropisno preticanje: izlazak u suprotnu traku pred vozilima koja ti dolaze u susret je gruba, bezobzirna vožnja, pa ide u sam vrh lestvice — nasilničku vožnju. Zato se zatvor i kazneni poeni izriču zajedno, kumulativno, a ne jedno ili drugo. Ponuđena fiksna kazna i srednji raspon sa manje poena pripadaju blažim klasama, u kojima nema neposredne opasnosti od čeonog sudara.' };
X[8227] = { ...(X[8227] || {}), x: 'Na stajalištu bez ostrva za pešake dužan si da staneš dok putnici ulaze i izlaze iz tramvaja i da kreneš tek kad se sklone. Pešak koji silazi stupa pravo na kolovoz i nema kuda; opasnost je stvarna, ali ne kao kod ekstremne brzine — zato srednja klasa: novčani raspon uz mali broj kaznenih poena, a ne fiksna sitna kazna niti zatvor.' };
X[8235] = { ...(X[8235] || {}), x: 'Znak označava ulazak u naseljeno mesto, pa važi opšte ograničenje za naselje od 50 km/h. Sa 140 km/h prekoračenje je 90 km/h, dakle znatno preko praga od 70 km/h posle kojeg prekršaj ide u najtežu klasu: zatvor ili najviša novčana kazna, uz najviše kaznenih poena. U naselju su pešaci, deca i raskrsnice — ista brzina ovde ugrožava mnogo neposrednije nego na otvorenom putu.' };
X[8237] = { ...(X[8237] || {}), x: 'Precrtan znak naselja znači da si izašao iz naseljenog mesta, pa važi opšte ograničenje van naselja od 80 km/h. Sa 170 km/h prekoračenje je 90 km/h, preko praga od 70 km/h koji prekršaj gura u najtežu klasu — zatvor ili najviša novčana kazna uz najviše poena. Zamka je što se van naselja brzina čini bezopasnijom, a kočni put i energija sudara rastu sa kvadratom brzine.' };
X[8246] = { ...(X[8246] || {}), x: 'Zaustavna traka nije saobraćajna traka: kretanje po njoj je zabranjeno, jer je to jedini prostor za vozila u kvaru i za hitne službe. Preticanje po njoj u ispitnoj bazi je razvrstano u najtežu klasu — zatvor ili najviša novčana kazna uz najviše kaznenih poena. Zato ne prolaze ni fiksna sitna kazna ni srednji raspon: takvim manevrom udaraš u zaustavljene i blokiraš pomoć.' };
X[8251] = { ...(X[8251] || {}), x: 'Nepropisno preticanje je opasna radnja, ali bez one bezobzirnosti koja povlači sam vrh lestvice — zato srednja klasa: novčani raspon uz osetan broj kaznenih poena, bez zatvora. Najteža klasa iz drugog ponuđenog odgovora čuva se za grublje slučajeve, a najniža fiksna kazna je za administrativne propuste, ne za manevar kojim možeš da izazoveš sudar.' };
X[8254] = { ...(X[8254] || {}), x: 'Ušao si u naseljeno mesto, gde je ograničenje 50 km/h, pa je 110 km/h prekoračenje od 60. To je ispod praga od 70 km/h posle kojeg se prelazi u najtežu klasu, ali visoko na lestvici — otud viši novčani raspon i veliki broj kaznenih poena. Poeni tu mere ponašanje kumulativno: sabiraju se, i kad ih skupiš dovoljno, dozvola ti se oduzima.' };
X[8256] = { ...(X[8256] || {}), x: 'Precrtan znak naselja vraća te na opšte ograničenje van naselja od 80 km/h, pa je 150 km/h prekoračenje od tačno 70. Najteža klasa traži prekoračenje veće od 70, pa za dlaku ostaješ u srednjoj: visok novčani raspon uz veliki broj kaznenih poena, bez zatvora. Zato ponuđena najstroža kazna pada — prag se meri strogo, a ne odokativno.' };
X[8271] = { ...(X[8271] || {}), x: 'Crveno svetlo je bezuslovna zabrana prolaza, a svetlosni znak ima prednost nad znakom koji stoji uz njega. Prolazak na crveno je srednja klasa, sa velikim brojem kaznenih poena. U najtežu klasu prelazi tek ako u tom trenutku preko prelaza prelazi pešak, a ako na crveno prođeš dvaput u kratkom roku, to je već nasilnička vožnja — vrh lestvice.' };
X[8295] = { ...(X[8295] || {}), x: 'Vozilo za organizovani prevoz dece koje je stalo radi ulaska ili izlaska obavezuje te da se zaustaviš iza njega i sačekaš — deca izlaze naglo i ne procenjuju brzinu. Prekršaj je u srednjoj klasi: novčani raspon uz mali broj kaznenih poena. Vrh lestvice ostaje rezervisan za bezobzirnu vožnju i ekstremne brzine, ali ovo nije ni sitnica bez poena.' };
X[8298] = { ...(X[8298] || {}), x: 'U naselju važi 50 km/h, pa je 80 km/h prekoračenje od 30 — ozbiljno, ali daleko od praga za najtežu klasu. Zato niži novčani raspon uz nekoliko kaznenih poena: ni najstroža kazna, ni fiksna sitna kazna kakva ide uz prekoračenje od svega nekoliko kilometara na sat. Uz kaznu i poene, na ovom stepeniku dolazi i zabrana upravljanja.' };
X[8301] = { ...(X[8301] || {}), x: 'Izašao si iz naselja, pa je ograničenje 80 km/h i 130 km/h znači prekoračenje od 50. Van naselja se ista razlika u brzini vrednuje blaže nego u naselju, jer nema pešaka ni gustih raskrsnica — otud niži novčani raspon i manje poena nego što bi isto prekoračenje nosilo u naselju. Najteža klasa počinje tek preko 70 km/h prekoračenja.' };
X[8303] = { ...(X[8303] || {}), x: 'Preticanje čitave kolone vozila je zabranjeno jer ne vidiš šta se dešava ispred prvog vozila, ni koliko ti treba da se vratiš u svoju traku. Zato srednja klasa: novčani raspon uz mali broj kaznenih poena. Vrh lestvice postaje tek kad uz to pređeš punu liniju ili ugroziš susretno vozilo — tada je reč o nasilničkoj vožnji.' };
X[8310] = { ...(X[8310] || {}), x: 'Zeleno svetlo ti dozvoljava da skreneš, ali ti ne daje prednost nad pešakom koji prelazi kolovoz na koji skrećeš — njega si dužan da propustiš. Nepropuštanje pešaka je srednja klasa: novčani raspon uz nekoliko kaznenih poena. Zamka je da zeleno doživiš kao pravo prolaza po svaku cenu, a pešak je najnezaštićeniji učesnik.' };
X[8351] = { ...(X[8351] || {}), x: 'Precrtan znak naselja znači da važi opšte ograničenje van naselja od 80 km/h, pa je 110 km/h prekoračenje od 30. To je u nižem delu lestvice: fiksna novčana kazna, bez kaznenih poena. Zato oba stroža ponuđena odgovora padaju — poeni i visoki rasponi počinju na većim prekoračenjima, gde rizik po život raste naglo.' };
X[8375] = { ...(X[8375] || {}), x: 'Crveni krug sa precrtanim simbolom je znak zabrane, a ovaj zabranjuje skretanje udesno. Postupanje suprotno postavljenom znaku spada u najblažu klasu: fiksna novčana kazna, bez raspona i bez kaznenih poena. Logika je da sam taj propust ne ugrožava neposredno nečiji život — ako iz njega proistekne opasna radnja, ona se kažnjava posebno i strože.' };
X[8383] = { ...(X[8383] || {}), x: 'Znak naseljenog mesta uvodi ograničenje od 50 km/h, pa je 57 km/h prekoračenje od svega 7. To je najniži stepenik lestvice: fiksna, najmanja novčana kazna, bez kaznenih poena. Poeni se čuvaju za prekoračenja koja realno ugrožavaju, pa oba ponuđena odgovora otpadaju već po veličini prekoračenja.' };
X[8385] = { ...(X[8385] || {}), x: 'Precrtan znak naselja vraća opšte ograničenje van naselja od 80 km/h, pa je 95 km/h prekoračenje od 15. Van naselja se najniži stepenik proteže do većeg prekoračenja nego u naselju, pa ovo ostaje fiksna, najmanja novčana kazna bez kaznenih poena. Ista brzina u naselju bila bi znatno strože kažnjena — klasu određuje kontekst puta, a ne sam broj.' };
X[8397] = { ...(X[8397] || {}), x: 'U naselju je ograničenje 50 km/h, pa 80 km/h nije sitno prekoračenje: uz novčanu kaznu i kaznene poene obavezno ide i zaštitna mera zabrane upravljanja. Ona nije dodatna kazna nego zaštita drugih — vozača koji je pokazao da ne poštuje brzinu tamo gde su pešaci sistem privremeno sklanja sa puta.' };
X[8399] = { ...(X[8399] || {}), x: 'U naselju važi 50 km/h, pa je 60 km/h prekoračenje od 10 — najblaži stepenik, fiksna kazna bez kaznenih poena. Zaštitna mera zabrane upravljanja vezuje se za teže prekršaje, pa se ovde ne izriče. Uporedi: već 80 km/h na istom mestu nosi i poene i zabranu upravljanja — lestvica raste brzo.' };
X[8401] = { ...(X[8401] || {}), x: 'Izašao si iz naselja, gde važi 80 km/h, pa je 140 km/h prekoračenje od 60 — visoko na lestvici, sa velikim brojem kaznenih poena. Za prekršaje te težine zaštitna mera zabrane upravljanja izriče se obavezno, uz novčanu kaznu. Poenta nije naplata nego uklanjanje rizika: ko ovako vozi, privremeno ostaje bez prava da upravlja.' };
X[8403] = { ...(X[8403] || {}), x: 'Van naselja je ograničenje 80 km/h, pa 110 km/h znači prekoračenje od 30 — stepenik na kome sledi samo novčana kazna, bez kaznenih poena i bez zaštitne mere. Isto prekoračenje u naselju bilo bi strože ocenjeno, a zabrana upravljanja se aktivira na višim stepenicima, kada prekršaj postaje neposredna opasnost po život.' };
X[8409] = { ...(X[8409] || {}), x: 'Postupanje suprotno postavljenom saobraćajnom znaku, kao što je ova zabrana skretanja udesno, spada u najblažu klasu — fiksna novčana kazna bez kaznenih poena. Zaštitna mera zabrane upravljanja rezervisana je za prekršaje koji neposredno ugrožavaju život, pa se ovde ne izriče. Mera prati težinu dela, a ne samu činjenicu da je znak prekršen.' };
X[8760] = { ...(X[8760] || {}), x: 'Žuta tabla sa crvenim kosim prugama, postavljena pozadi na vozilo, obeležava teško vozilo — po njoj iz daljine prepoznaješ vozilo velike mase kojem treba mnogo duži put za zaustavljanje. Ne meša se sa tablom za duga vozila, koja je puno žuto polje sa crvenim okvirom i bez pruga, ni sa oznakom za spora vozila, koja je trougaona.' };
X[8761] = { ...(X[8761] || {}), x: 'Žuto polje uokvireno crvenim, bez kosih pruga i postavljeno pozadi, obeležava dugo vozilo — govori ti koliko dužine treba da pretekneš i koliko prostora to vozilo zauzima u krivini. Kose crveno-žute pruge nosi tabla za teška vozila, a spora vozila se obeležavaju trougaonom tablom sa crvenim rubom i narandžastim poljem.' };
X[8762] = { ...(X[8762] || {}), x: 'Trougaona tabla sa crvenim rubom i narandžastim poljem obeležava sporo vozilo, ono koje po svojoj konstrukciji ne može da razvije veću brzinu, kao što su traktor ili radna mašina. Cilj je da onaj ko nailazi mnogo brže na vreme shvati razliku u brzini. Kose pruge i puno žuto polje sa crvenim okvirom pripadaju teškim, odnosno dugim vozilima.' };
X[9203] = { ...(X[9203] || {}), x: 'Dopunska tabla uvek pripada znaku neposredno iznad sebe, a ovde stoji ispod donjeg kruga sa brojem, pa bliže određuje samo ograničenje brzine. Gornji crveni krug sa dva vozila je zaseban znak zabrane i važi nezavisno od table. Zato ni odgovor da tabla važi za oba znaka ne stoji: jedna tabla se ne deli na dva znaka na istom stubu.' };
X[9208] = { ...(X[9208] || {}), x: 'Bela tabla sa tekstom stoji ispod plavog znaka obaveštenja o parkiralištu sa naplatom, pa rečima objašnjava kako se to parkiralište koristi i koliko dugo sme da se stoji. Ona sama ne uvodi novu zabranu ni obavezu, jer to nose znakovi u crvenom, odnosno plavom krugu. Nije ni poruka nevezana za znak: bez znaka iznad sebe tabla nema nikakvo značenje.' };
X[9214] = { ...(X[9214] || {}), x: 'Crtež čitaj kao poprečni presek ulice: niži deo je kolovoz, a viši, iza ivičnjaka, trotoar. Vozilo je celo na nižem delu, dakle na kolovozu, i vidiš ga s prednje strane, što znači da je okrenuto duž ulice, paralelno sa podužnom osom. Da je upravno, bilo bi nacrtano iz čistog bočnog profila, a kod parkiranja pod uglom crtež je kos, u tri četvrtine.' };
X[9215] = { ...(X[9215] || {}), x: 'Niža linija je kolovoz, a viša, iza ivičnjaka, trotoar; vozilo stoji celo na tom višem delu, pa je reč o parkiranju na trotoaru. Prikazano je s prednje strane, a prednji izgled znači da je okrenuto duž ulice, dakle paralelno sa podužnom osom kolovoza. Bočni profil bi značio upravno parkiranje, a kosi crtež parkiranje pod uglom.' };
X[9220] = { ...(X[9220] || {}), x: 'Na tabli je debelim potezom nacrtan put sa prvenstvom prolaza i pokazano kuda se on pruža, dok su tanke crte sporedni krakovi. Uz osmougaoni znak koji te obavezuje da se zaustaviš, tabla ti unapred kaže odakle nailaze vozila kojima moraš da ustupiš prolaz. Strelica smera kretanja i oznaka slepog puta izgledaju sasvim drugačije.' };
X[9221] = { ...(X[9221] || {}), x: 'Žuti romb ti govori da si na putu sa prvenstvom prolaza, a tabla ispod njega crta oblik same raskrsnice: debeli potez je taj put sa prvenstvom, koji ovde skreće, a tanke crte su sporedni krakovi. Tabla te time unapred upozorava da prvenstvo prati skretanje, a ne obavezno pravac u kome ideš. Ne propisuje smer kretanja niti označava slepi put.' };
X[9226] = { ...(X[9226] || {}), x: 'Vozilo je celo na povišenom delu iza ivičnjaka, dakle na trotoaru, a nacrtano je koso, u tri četvrtine, što označava parkiranje pod uglom u odnosu na podužnu osu kolovoza. Da se traži upravno parkiranje, vozilo bi bilo prikazano iz čistog bočnog profila, a kod paralelnog parkiranja videlo bi se s prednje strane.' };
X[9227] = { ...(X[9227] || {}), x: 'Vozilo stoji celo na višem delu iza ivičnjaka, pa je reč o parkiranju na trotoaru. Nacrtano je iz čistog bočnog profila, što znači da je postavljeno poprečno na ulicu, dakle upravno na podužnu osu kolovoza. Kosi crtež u tri četvrtine značio bi parkiranje pod uglom, a prednji izgled vozila paralelno parkiranje.' };
X[9228] = { ...(X[9228] || {}), x: 'Vozilo je razapeto preko ivičnjaka: jednim delom točkova stoji na nižem kolovozu, a drugim na višem trotoaru, pa zauzima oba dela puta. Nacrtano je koso, u tri četvrtine, a takav crtež označava parkiranje pod uglom u odnosu na podužnu osu. Paralelno parkiranje prepoznalo bi se po prednjem izgledu vozila, a upravno po čistom bočnom profilu.' };
X[9229] = { ...(X[9229] || {}), x: 'Točkovi vozila su i na nižem kolovozu i na povišenom trotoaru, pa su zauzeta oba dela puta. Vozilo je nacrtano s prednje strane, samo nagnuto zbog ivičnjaka, a prednji izgled znači da je okrenuto duž ulice, paralelno sa podužnom osom kolovoza. Bočni profil bi značio upravno parkiranje, a kosi crtež parkiranje pod uglom.' };
X[9230] = { ...(X[9230] || {}), x: 'Jedan točak je na nižem kolovozu, a drugi na povišenom trotoaru, pa vozilo zauzima i jedan i drugi deo puta. Nacrtano je iz čistog bočnog profila, što znači da stoji poprečno na ulicu, dakle upravno na podužnu osu kolovoza. Kod paralelnog parkiranja videlo bi se s prednje strane, a kod parkiranja pod uglom crtež bi bio kos.' };
X[9234] = { ...(X[9234] || {}), x: 'Vozilo je celo na nižem delu, ispred ivičnjaka, dakle na kolovozu, a ne na trotoaru. Nacrtano je koso, u tri četvrtine, i takav crtež označava parkiranje pod uglom u odnosu na podužnu osu kolovoza. Da se traži upravno parkiranje, vozilo bi se videlo iz čistog bočnog profila, a kod paralelnog parkiranja s prednje strane.' };
X[9235] = { ...(X[9235] || {}), x: 'Simbol osobe u invalidskim kolicima na tabli ne opisuje prostor za kretanje, nego bliže određuje kome je namenjeno ono što znak iznad označava. Pošto je znak iznad parkiralište, i tabla govori o parkiranju: mesto je rezervisano za vozila lica sa invaliditetom. Garaža se označava drugim znakom, a tabla nikada ne menja vrstu objekta sa znaka.' };
X[9236] = { ...(X[9236] || {}), x: 'Na tabli su dve poruke: crtež i natpis kažu koja vrsta oštećenja te čeka na kolovozu — kolotrazi, udubljenja izlokana u tragovima točkova — a broj sa dve strelice nagore kazuje kolika je deonica na kojoj to važi. Zato tabla nije najava udaljenosti: takva nosi samo broj, bez strelica, i do označenog mesta znak još ne deluje. Ovde odredba znaka počinje odmah i prati te celom naznačenom dužinom.' };
X[9346] = { ...(X[9346] || {}), x: 'Na sva tri semafora iznad kolovoza gori donje, zeleno svetlo, a zeleno znači slobodan prolaz. Povećana opreznost kao obaveza vezuje se za žuto trepćuće svetlo, kada semafor praktično ne reguliše raskrsnicu, a zabrana za crveno — nijedno od njih ovde ne svetli. Zeleno ipak nije bezuslovno: ako skrećeš, propuštaš pešake koji prelaze kolovoz na koji ulaziš.' };
X[9348] = { ...(X[9348] || {}), x: 'Gori srednje, žuto svetlo, i ono je zabrana prolaza, ali sa jednim izuzetkom: ako si prišao toliko blizu da ne možeš bezbedno da se zaustaviš ispred semafora, prolaziš. Zato dozvola bez uslova nije tačna. Najavu skorog crvenog ne daje žuto nego zeleno trepćuće svetlo, a najavu zelenog kombinacija crvenog i žutog.' };
X[9351] = { ...(X[9351] || {}), x: 'Na semaforima gori gornje, crveno svetlo, a crveno je čista zabrana prolaza, bez izuzetka — zaustavljaš se ispred znaka. Ublažavanje sa izuzetkom kada se ne možeš bezbedno zaustaviti vezano je za žuto svetlo, ne za crveno. Prolaz uz povećanu opreznost daje samo žuto trepćuće, kada semafor u stvari ne reguliše raskrsnicu.' };
X[9353] = { ...(X[9353] || {}), x: 'Istovremeno gore crveno i žuto svetlo, a ta kombinacija je i dalje zabrana: žuto uz crveno samo najavljuje da će se upaliti zeleno, da spremiš vozilo za polazak. Zato nijedna ponuda sa dozvoljenim prolazom ne stoji. Prestanak zelenog najavljuje zeleno trepćuće, a povećanu opreznost žuto trepćuće svetlo.' };
X[9358] = { ...(X[9358] || {}), x: 'Na semaforima svetli zelena strelica ulevo, a strelica sužava dejstvo svetla samo na smer koji pokazuje — smeš ulevo, ne i pravo ili udesno. Obavezu kretanja uz povećanu opreznost daje žuto trepćuće svetlo. Puna zelena strelica nije uslovna: uslovna zelena strelica pali se uz crveno i tek uz nju propuštaš sva vozila i pešake.' };
X[9359] = { ...(X[9359] || {}), x: 'Iznad tvoje trake svetle dve zelene strelice, jedna ulevo i jedna pravo, pa su ti oba ta smera slobodna. Svaka strelica važi samo za svoj smer, zato nije tačno da je dozvoljen samo jedan od njih. Nije dozvoljeno ni u svim smerovima: za desno nema upaljene strelice, a smer koji nijedna strelica ne pokriva nije dozvoljen.' };
X[9360] = { ...(X[9360] || {}), x: 'Semafor koji reguliše levo skretanje pokazuje žutu strelicu, a žuto svetlo je zabrana sa poznatim izuzetkom: prolaziš samo ako si prišao toliko blizu da se ne možeš bezbedno zaustaviti ispred njega. Zato dozvola bez uslova nije tačna. Žuto ne najavljuje crveno — to radi zeleno trepćuće; smer pravo ovde je već na crvenoj strelici.' };
X[9361] = { ...(X[9361] || {}), x: 'Na oba semafora svetli crvena strelica, pa je prolaz zabranjen u smerovima koje strelice pokazuju, i to bez izuzetka. Ublažavanje kada se vozilo ne može bezbedno zaustaviti pripada žutoj strelici, a prolaz uz povećanu opreznost žutoj trepćućoj. Strelica menja samo opseg smera na koji se svetlo odnosi, ne i značenje boje.' };
X[9364] = { ...(X[9364] || {}), x: 'Iz te trake oba smera regulišu dve strelice: za ulevo gori crvena, a za pravo gore crveno i žuto zajedno. Crveno sa žutim je i dalje zabrana, samo najava skorog zelenog, pa nemaš prolaz ni pravo ni ulevo. Zamka je što žuto podseća na trepćuće; da bi prolaz pravo bio dozvoljen uz opreznost, žuto bi moralo da trepće samo, bez crvenog.' };
X[9371] = { ...(X[9371] || {}), x: 'Signali iznad traka govore koja traka radi. Iznad leve trake svetli crveni ukršteni signal koji kretanje njome zabranjuje, pa putanja 3 otpada. Iznad srednje i desne trake svetli zelena strelica nadole, što znači slobodan prolaz duž tih traka, i zato ostaju putanje 1 i 2. Nije ni samo putanja 1, jer i desna traka ima svoju zelenu strelicu.' };
X[9373] = { ...(X[9373] || {}), x: 'Žuta trepćuća kosa strelica iznad trake nije upozorenje nego naredba: napusti traku iznad koje svetli i nastavi onom trakom na koju vrh strelice pokazuje. Povećanu opreznost traži obično žuto trepćuće svetlo, puni žuti krug bez strelice. Levo od nje zelena strelica nadole pokazuje traku koja je slobodna, dakle onu u koju treba da pređeš.' };
X[9377] = { ...(X[9377] || {}), x: 'Brojka na tamnoj podlozi uz semafor nije ograničenje brzine, jer se ograničenje daje znakom u crvenom krugu na belom polju. Ovo je preporučena brzina zelenog talasa: krećeš li se približno tako, na naredni semafor stižeš dok je još zeleno. Najmanja dozvoljena brzina takođe je znak, plav krug sa brojem, i nema veze sa semaforom.' };
X[9380] = { ...(X[9380] || {}), x: 'Simbol bicikla u sva tri svetla kaže kome je semafor namenjen: biciklima i mopedima na biciklističkim trakama. Motocikl tu ne spada, jer nema pravo kretanja biciklističkom trakom ni stazom, pa svaka ponuda koja ga ubaci u ovu grupu pada. Boje znače isto kao na semaforu za vozila, samo važe za korisnike trake.' };
X[9381] = { ...(X[9381] || {}), x: 'Svetli zelena figura pešaka u donjem polju, pa je prelazak dozvoljen; brojač u zasebnom polju iznad njega pokazuje koliko sekundi zelenog još imaš, da proceniš stižeš li da pređeš. Sam pešački semafor je dvobojan — samo crvena i zelena figura, bez žutog međusvetla — pa se sa zelenog prelazi pravo na crveno. Kada zeleno počne da trepće ili brojač istekne, na prelaz se više ne stupa.' };
X[9382] = { ...(X[9382] || {}), x: 'Gori gornje svetlo sa crvenom figurom pešaka, a to je zabrana prelaska — čekaš na trotoaru, iza ivice kolovoza. Pešački semafor nema žuto međusvetlo, pa se sa crvenog prelazi pravo na zeleno, i zeleno bi bila figura u donjem polju. Sama upaljena crvena figura dovoljna je: pravilo ne zavisi od toga da li baš tada nailazi vozilo.' };
X[9386] = { ...(X[9386] || {}), x: 'Uređaj za tramvaje ne radi bojama nego belim svetlećim crtama, i oblik crte odlučuje: vodoravna, položena crta znači zabranu prolaska. Slobodan prolaz daju uspravna crta za kretanje pravo i kosa crta za skretanje, pa ponuda o slobodnom prolazu u pravcu crte ovde ne stoji. Uređaj ne prikazuje kuda se pružaju šine.' };
X[9388] = { ...(X[9388] || {}), x: 'Na uređaju za tramvaje svetle bela kosa i bela uspravna crta, a takve crte znače slobodan prolaz: uspravna za nastavak pravo, kosa za skretanje na stranu na koju je nagnuta. Zabranu bi dala jedino vodoravna, položena crta, a nje ovde nema. Uređaj ne crta pružanje šina, nego kao i semafor daje ili uskraćuje pravo prolaza.' };
X[9389] = { ...(X[9389] || {}), x: 'Ovi semafori imaju samo crveno i zeleno, bez žutog međusvetla, i takvi dvobojni uređaji služe za regulisanje pristupa vozila — ulazi, rampe, naplatna mesta i slična mesta gde se propušta vozilo po vozilo. Tramvajski uređaj radi belim crtama, a biciklistički ima tri svetla sa simbolom bicikla; ovde nema ni crta ni simbola.' };
X[9391] = { ...(X[9391] || {}), x: 'Za tvoje kretanje važe svi semafori postavljeni uz tvoju stranu kolovoza i iznad njega, a ovde ih ima tri: levo, desno i na konzolnom nosaču iznad puta. Postavljeni su tako da signal vidiš i kada ti veće vozilo zakloni jedan od njih, i svi prikazuju isto stanje. Zato nije tačno da važi samo levi ili samo desni semafor.' };
X[9438] = { ...(X[9438] || {}), x: 'Radnik drži obe zastavice, ali poruku nosi samo ona koja je podignuta, a to je zelena; crvena mu visi niz nogu i ne znači ništa. Znaci i naredbe ovlašćenih lica imaju prvenstvo nad saobraćajnom signalizacijom i nad pravilima, pa moraš da postupiš po njegovom znaku. Zato pada varijanta po kojoj bi to bila samo informacija koju smeš da zanemariš.' };
X[9440] = { ...(X[9440] || {}), x: 'Zelena zastavica je podignuta, a crvena mu visi uz telo, pa važi poruka podignute: prolaz je za tebe slobodan. Zastavicama se daju samo dve poruke, slobodno i zabranjeno, pa ne postoji znak kojim bi ti radnik naložio da usporiš; da hoće da te zaustavi, podigao bi crvenu. Zato otpadaju i zaustavljanje i usporavanje.' };
X[9444] = { ...(X[9444] || {}), x: 'Podignuta je crvena zastavica, a zelena visi uz telo i ne nosi nikakvu poruku, pa moraš da staneš i sačekaš. Zastavicama se daju samo dve poruke, slobodan i zabranjen prolaz, pa usporavanja u tom sistemu znakova uopšte nema. Ne pomaže ni to što je kolovoz ispred tebe trenutno prazan: radnici naizmenično propuštaju vozila iz jednog pa iz drugog smera.' };
X[9575] = { ...(X[9575] || {}), x: 'Skretanje udesno se izvodi iz položaja uz desnu ivicu kolovoza, a vozilo 1 je u levoj traci — desnom, uz njega, kreće se vozilo 2. Zato ono ovde ne sme da skrene udesno, ma šta radilo pokazivačem: pokazivač je najava namere, a ne pravo prolaza. Naglo usporavanje smeš samo radi izbegavanja neposredne opasnosti, pa ni tako ne možeš sebi da napraviš mesto za skretanje.' };
X[9576] = { ...(X[9576] || {}), x: 'Crveno vozilo je u levoj traci, a desnom trakom pored njega kreće se sivo vozilo — udesno se skreće tek kad si prestrojen uz desnu ivicu, pa crveni ovde ne sme da skrene. Uključen pokazivač govori šta vozač namerava, ali mu ne daje prednost nad onim ko već ide tom trakom. Naglo kočenje dozvoljeno je samo zbog neposredne opasnosti, a ne da bi se napravilo mesto za sopstvenu radnju.' };
X[9583] = { ...(X[9583] || {}), x: 'Redosled je uvek isti: prvo se uveriš da radnju možeš bezbedno i propisno da izvedeš, pa tek onda daješ znak i krećeš. Zato ne valja ni varijanta u kojoj pokazivač ide prvi, ni ona u kojoj trepćeš dok se tek uveravaš — znak ide pre radnje i traje sve dok je izvodiš. Levi pokazivač je pravi, jer sa desne ivice ulaziš u traku koja ti je sa leve strane; desnim bi najavio suprotno.' };
X[9586] = { ...(X[9586] || {}), x: 'Dužan si da propustiš samo autobus koji propisno kreće sa stajališta u naselju i vozilo iz trake koja se završava ili u kojoj je saobraćaj onemogućen — auto-taksi koji izlazi sa parking mesta nije ništa od toga, pa te propis ne obavezuje. Time pada i obrazloženje da se radi o javnom prevozu putnika. Pošto si njegovu nameru uočio na vreme, pustićeš ga iz opreza: ako započetu radnju nastavi, nastaje opasna situacija.' };
X[9589] = { ...(X[9589] || {}), x: 'Kad se iz garaže uključuješ na nepreglednom mestu, postepeno primicanje ne rešava ništa: na kolovoz izlaziš pre nego što si bilo šta video, a drugi te uočavaju tek kad si već pred njima. Zato se takvo uključivanje izvodi uz pomoć lica koje stoji na pogodnom mestu van vozila i daje ti znakove. Ni odlazak na drugo mesto nije odgovor — pravilo ti kaže kako da se uključiš baš tu gde jesi.' };
X[9592] = { ...(X[9592] || {}), x: 'Traka je žutom bojom i natpisima obeležena kao traka za vozila javnog prevoza i taksi vozila, a moped odnosno motocikl u njih ne spada — krećeš se površinom koja nije namenjena vozilu kojim upravljaš. To što je reč o vozilu za osposobljavanje ne daje nikakvo dodatno pravo, pravila važe isto kao za sve. Ne pomaže ni pozivanje na desnu stranu kolovoza: desno se držiš unutar traka koje smeš da koristiš.' };
X[9600] = { ...(X[9600] || {}), x: 'U naselju traku koja nije uz desnu ivicu smeš da koristiš samo dok time ne ometaš one iza sebe — čim ih usporavaš, dužan si da se pomeriš i propustiš ih promenom trake. Zato pada izgovor da vozi najvećom dozvoljenom brzinom: pravilo se vezuje za ometanje, a ne za brzinomer. Ni preticanje s desne strane nije tvoje rešenje, jer se pretiče s leve, a desno samo u posebnim, propisom određenim slučajevima.' };
X[9615] = { ...(X[9615] || {}), x: 'Žuta putanja te preko dvostruke pune razdelne linije vodi na deo kolovoza namenjen suprotnom smeru, a takva linija se ne sme preći ni sa jedne strane. Zato je kretanje nepropisno iako si uključio levi pokazivač — znak najavljuje nameru, ali ne pretvara zabranjenu radnju u dozvoljenu. Ni preticanje nije izuzetak: preko pune razdelne linije se ne pretiče, nego se čeka deo puta gde je linija isprekidana.' };
X[9618] = { ...(X[9618] || {}), x: 'Razdelna linija je kombinovana: sa tvoje strane je puna, a isprekidana polovina okrenuta je suprotnom smeru. Takvu liniju sme da pređe samo onaj kome je bliža isprekidana strana, a to ovde nisi ti — izlazak u levu traku je nepropisan i sa uključenim pokazivačem. Preticanje ne pravi izuzetak: dok je sa tvoje strane linija puna, preko nje se ne prelazi ni radi preticanja ni radi obilaženja.' };
X[9621] = { ...(X[9621] || {}), x: 'Kolovozne trake su ovde fizički odvojene zelenim ostrvom, a plavi okrugli znak sa strelicom nadesno je obaveza da se prepreka obiđe s desne strane — tvoja kolovozna traka je ona desno. Ti si na levoj, namenjenoj suprotnom smeru, pa se krećeš nepropisno. Kad su smerovi razdvojeni, izlazak na kolovoznu traku suprotnog smera nije dozvoljen ni radi preticanja, jer izuzetka od te zabrane nema.' };
X[9623] = { ...(X[9623] || {}), x: 'Crveni krug sa belom vodoravnom prečkom zabranjuje ulazak u ulicu iz tog smera, a postavljen je sa obe strane kolovoza, dakle važi za celu širinu — vozilo se jednosmernom ulicom kreće u zabranjenom smeru. Ta zabrana nema izuzetak po osnovu toga ko gde stanuje: do kuće u toj ulici stiže se iz smera u kojem je saobraćaj dozvoljen, makar to značilo duži put oko bloka.' };
X[9626] = { ...(X[9626] || {}), x: 'Vozila levo od tebe ne mogu dalje svojom trakom, pa moraju u tvoju, a za taj slučaj važi naizmenično uključivanje: vozač u susednoj traci dužan je da omogući uključenje jednog vozila. Zato ne stoji ni da propuštaš sve redom, ni da imaš prvenstvo nad njima — kad bi ga imao, traka u kojoj je saobraćaj onemogućen nikada se ne bi ispraznila. Ti pustiš jedno, sledeće je na vozaču iza tebe.' };
X[9628] = { ...(X[9628] || {}), x: 'Obavezu propuštanja imaš samo kad se susedna traka završava ili je u njoj saobraćaj onemogućen, i tada za jedno vozilo, i prema autobusu koji kreće sa stajališta u naselju. Ovde ti vozila pokazivačem samo najavljuju nameru da uđu u tvoju traku, a najava sama po sebi ne stvara tvoju obavezu — ni za jedno ni za oba. Pošto si ih uočio na vreme, propustićeš ih iz opreza i izbeći opasnu situaciju.' };
X[9630] = { ...(X[9630] || {}), x: 'Pošto je krajnjom desnom trakom saobraćaj onemogućen, vozila iz nje moraju u tvoju traku, pa nije tačno da nemaš nikakvu obavezu. Ali je obaveza precizna: omogućavaš uključenje jednog vozila, ne oba i ne cele kolone, jer se uključivanje odvija naizmenično. Kad ti propustiš prvo, drugo je briga vozača koji dolazi iza tebe, i tako se zatvorena traka prazni bez zastoja.' };
X[9633] = { ...(X[9633] || {}), x: 'Naglo usporavanje zabranjeno je kao način vožnje, ali ne i onda kad njime izbegavaš neposrednu opasnost — a dete koje sa biciklom ulazi na kolovoz ispred tebe upravo je takva opasnost. Zato smeš naglo da usporiš. Izbegavanje skretanjem je lošije rešenje: promenom pravca odlaziš ka suprotnom smeru ili ka parkiranim vozilima, pa umesto da staneš, sam biraš u šta ćeš da udariš.' };
X[9635] = { ...(X[9635] || {}), x: 'U ogledalima vidiš autobus neposredno iza sebe, a ispred je raskrsnica — brzinu moraš smanjiti, ali tako da vozača iza sebe ne ugroziš niti ometeš, dakle rano i postepeno. Naglo kočenje bi bilo dozvoljeno samo radi izbegavanja neposredne opasnosti, a nje ovde nema. Zato ne stoji ni da brzinu ne treba menjati: raskrsnici se ne prilazi istom brzinom kao otvorenom delu puta.' };
X[9640] = { ...(X[9640] || {}), x: 'Kad na kolovozu nema strelica koje određuju smer, važi opšte pravilo prestrojavanja: za skretanje udesno zauzimaš traku uz desnu ivicu kolovoza. To je ovde traka 1, ona uz ivičnjak. Traka 2 je uz razdelno ostrvo i iz nje se udesno ne skreće, pa pada i ponuda koja spaja obe trake — dve trake za isti smer postoje samo kad su tako obeležene strelicama.' };
X[9644] = { ...(X[9644] || {}), x: 'Oba vozila skreću ulevo istovremeno, pa im se putanje ne smeju preseći: svako ulazi u traku koja odgovara onoj iz koje je krenulo. Žuto vozilo, iz leve trake, ostaje uz razdelno ostrvo i propisno se kreće putanjom 4, a crveno, iz desne trake, ulazi u traku odmah do njega, dakle putanjom 1. Putanja 3 bi žuto vozilo odvela u traku koja pripada crvenom, a putanja 2 je nepotreban zamah crvenog preko susedne trake, skroz do spoljne ivice kolovoza.' };
X[9645] = { ...(X[9645] || {}), x: 'Vozilo 2 dolazi iz leve trake, pa i posle skretanja mora da ostane levo, uz razdelno ostrvo — to je putanja 4. Putanja 3 bi ga odvela u traku u koju ulazi vozilo iz desne trake, dakle preko tuđe putanje. Kad dva vozila skreću ulevo jedno pored drugog, jedini bezbedan raspored je onaj u kome zadržavaju redosled iz traka iz kojih su krenula.' };
X[9646] = { ...(X[9646] || {}), x: 'Vozilo 1 skreće iz desne trake, pa i posle skretanja ulazi u traku koja toj traci odgovara — u onu odmah do trake uz razdelno ostrvo, a to je putanja 1. Putanja 2 ga vodi preko susedne trake, skroz uz spoljnu ivicu novog kolovoza, dakle širokim zamahom preko trake koja mu ne pripada. Pravilo je jednostavno: ulaziš u traku koja odgovara onoj iz koje si krenuo.' };
X[9647] = { ...(X[9647] || {}), x: 'Za skretanje ulevo prestrojavaš se u krajnju levu traku svog smera. Sa leve strane je razdelno ostrvo, pa je tvoja krajnja leva traka ona označena brojem 2. Traka 1 je uz desnu ivicu kolovoza i iz nje se ide pravo ili udesno. Ponuda sa obe trake bi važila samo da su strelice na kolovozu tako odredile, a njih ovde nema.' };
X[9649] = { ...(X[9649] || {}), x: 'Znakovi zabranjenog saobraćaja u jednom smeru, postavljeni sa obe strane ulaza, pokazuju da se u ovu ulicu ne sme ući sa poprečnog puta — ulica je jednosmerna, pa su obe trake namenjene tvom smeru. Zato je krajnja leva traka ona uz levu ivicu kolovoza, dakle traka 1, i iz nje se skreće ulevo. Traka 2 je uz desnu ivicu, a strelica koja bi levo dozvolila iz obe trake ovde nije iscrtana.' };
X[9650] = { ...(X[9650] || {}), x: 'Ovde odlučuju strelice na kolovozu, a ne opšte pravilo. U traci 1 iscrtana je strelica koja pokazuje samo ulevo, a u traci 2 dvostruka strelica — jedan krak ulevo, drugi udesno. Pošto obe trake imaju krak za levo, skretanje ulevo je dozvoljeno iz obe. Zato ovde pada navika da se ulevo sme isključivo iz krajnje leve trake.' };
X[9653] = { ...(X[9653] || {}), x: 'Skretanje udesno se izvodi iz trake uz desnu ivicu kolovoza, a ti si u traci levo od nje, odvojen žutom linijom. Zato se prvo prestrojavaš udesno, a pri prestrojavanju ustupaš prolaz vozilu koje se već kreće tom trakom — u desnom retrovizoru ti se približava autobus. Prvenstvo, dakle, nije tvoje, ali nije rešenje ni da skreneš iz trake u kojoj si sada.' };
X[9675] = { ...(X[9675] || {}), x: 'Plavi krug je naredba, a ovaj pokazuje dva dozvoljena smera: pravo i udesno. Polukružno okretanje je po smeru kretanje ulevo, a levo ti znak ne daje, pa ono otpada bez obzira na to što bi propustio vozila iz suprotnog smera. Crveno svetlo te samo zaustavlja; ono ne menja koje ti je smerove znak dozvolio.' };
X[9677] = { ...(X[9677] || {}), x: 'Plavi krug ovde dozvoljava pravo i ulevo, a i strelica na kolovozu ispred tebe ima krak za pravo i krak za levo. Nijedno od to dvoje ne zabranjuje polukružno okretanje — ono ide uz skretanje ulevo, pa je dozvoljeno tamo gde je levo dozvoljeno i gde posebnom zabranom nije isključeno. Zato padaju obe ponude koje se pozivaju na znak, odnosno na oznaku.' };
X[9679] = { ...(X[9679] || {}), x: 'Oba plava kruga pored kolovoza pokazuju samo pravu strelicu, a i strelica na asfaltu ispred tebe je prava — dozvoljen smer je jedino pravo. Polukružno okretanje bi značilo kretanje ulevo, što ti naredba iz plavog kruga ne dopušta. Zeleno svetlo ti daje pravo prolaza, ali ne i pravo da biraš smer koji je znakom isključen.' };
X[9681] = { ...(X[9681] || {}), x: 'Nalaziš se u tunelu, a tunel je jedno od mesta na kojima je polukružno okretanje izričito zabranjeno. Zabrana je bezuslovna: ne pomaže ni to što bi propustio vozila iz suprotnog smera, ni to što bi okret izveo iz jednog poteza. Uz tunel su na istom spisku most, vijadukt, nadvožnjak i podvožnjak, kao i mesta sa nedovoljnom preglednošću.' };
X[9682] = { ...(X[9682] || {}), x: 'Ispred tebe je most, a most je jedno od mesta na kojima se polukružno okretanje ne sme izvesti. Zabrana ne trpi izuzetke: ne ukida je ni propuštanje vozila iz suprotnog smera ni okret bez manevrisanja. Razlog je isti kao kod tunela i nadvožnjaka — sužen prostor u kome nema kuda da se izmakne ni tebi ni onome ko naiđe.' };
X[9685] = { ...(X[9685] || {}), x: 'Trake razdvaja puna razdelna linija, a preko nje se ne sme prelaziti — polukružno okretanje bi značilo baš to, prelazak na deo kolovoza namenjen suprotnom smeru. Zato ovde otpada bez obzira na to što bi propustio vozila koja nailaze i što bi okret izveo iz jednog poteza: nijedno od toga ne ukida zabranu koju nosi sama linija. Okrenuti se smeš tek tamo gde je razdelna linija isprekidana.' };
X[9686] = { ...(X[9686] || {}), x: 'Put je ovde prav, širok i pregledan, razdelna linija je isprekidana, a nema ni znaka ni oznake koji bi okretanje zabranili. Nema ni jednog mesta sa spiska na kome je polukruženje zabranjeno — ni mosta, ni tunela, ni nadvožnjaka, ni smanjene preglednosti. Uslov da se okret izvede bez manevrisanja ne postoji u propisu; ti samo moraš da propustiš vozila i radnju izvedeš bezbedno.' };
X[9687] = { ...(X[9687] || {}), x: 'Prolaziš ispod nadvožnjaka, dakle kroz podvožnjak, a to je jedno od mesta na kojima je polukružno okretanje zabranjeno. Zabrana važi sama po sebi, pa je ne ukida ni propuštanje vozila iz suprotnog smera ni to što bi okret izveo bez manevrisanja. Isti spisak pokriva tunel, most, vijadukt i nadvožnjak — svuda gde je prostor skučen, a izmicanje nemoguće.' };
X[9693] = { ...(X[9693] || {}), x: 'Radovi i prepreka su na tvojoj polovini kolovoza, a plavi znak sa kosom strelicom te upućuje da ih obiđeš sa leve strane. Time ulaziš u deo kolovoza namenjen suprotnom smeru, pa nemaš nikakvo prvenstvo: usporavaš i, ako treba, zaustavljaš se dok ne prođu vozila iz suprotnog smera. I to ne samo prvo od njih, nego sva, jer je prepreka na tvojoj strani.' };
X[9706] = { ...(X[9706] || {}), x: 'Prepreka je na tvojoj strani kolovoza i mimoilaženje tu nije moguće, a vozilo iz suprotnog smera je već stupilo u suženi deo. Zato ti zaustavljaš vozilo, i to na mestu na kome se možete bezbedno mimoići. Uzbrdica ti sama po sebi ne daje prvenstvo, a od drugog vozača ne smeš da tražiš da se vraća unazad ni da izlazi na trotoar.' };
X[9715] = { ...(X[9715] || {}), x: 'Plavi krug sa kružnim strelicama najavljuje kružni tok, a obrnuti trougao iznad njega ti nalaže da propustiš vozila koja se u njemu već kreću. Kad izlaziš na prvom izlazu udesno, ostrvo ne obilaziš — skreneš udesno uz spoljnu ivicu i odmah izađeš. Obilaženje oko ostrva potrebno je tek za izlaze koji su dalje ulevo i za polukružno okretanje, ne i za prvi desni izlaz.' };
X[9717] = { ...(X[9717] || {}), x: 'U kružnom toku se saobraćaj odvija samo u jednom smeru, tako da ostrvo ostaje sa tvoje leve strane, a ti ga obilaziš sa desne. Zato se i polukružno okretanje izvodi tako što uđeš u krug, obiđeš ostrvo i izađeš na izlaz kojim se vraćaš nazad. Skretanje ulevo odmah, ispred ostrva, značilo bi vožnju u zabranjenom smeru kroz kružni tok.' };
X[9955] = { ...(X[9955] || {}), x: 'Oba vozila se prestrojavaju u istu traku, pa odlučuje pravilo desne strane: gledano u smeru kretanja, vozilo 2 je vozilu 1 sa desne strane, pa je vozilo 1 dužno da ga propusti. Brzina kolone nije merilo prvenstva — pravilo koje bi sporijoj ili bržoj koloni davalo prednost ne postoji, odlučuje samo ko je kome zdesna.' };
X[9965] = { ...(X[9965] || {}), x: 'Znak STOP te obavezuje da se zaustaviš i propustiš sva vozila koja se kreću putem sa prvenstvom, pa i traktor koji ti nailazi sa desne strane — to što sporo ide nije razlog da mu oduzmeš prednost. Uz to skrećeš ulevo, a pri levom skretanju propuštaš i vozilo iz suprotnog smera koje ti preseca putanju. Zato ovde nema polovične varijante.' };
X[9967] = { ...(X[9967] || {}), x: 'I ovde uz tvoj put stoji STOP: zaustavljaš se i propuštaš traktor, koji se kreće putem sa prvenstvom — to što je sporiji od tebe nije razlog da mu oduzmeš prednost. Putničko vozilo ti dolazi iz suprotnog smera, a ti skrećeš ulevo, pa si i njemu dužan da ustupiš prolaz. Zato pada svaka ponuda u kojoj propuštaš samo jedno od ta dva vozila.' };
X[9971] = { ...(X[9971] || {}), x: 'Znak i semafor nisu ravnopravni: semafor je jači od saobraćajnog znaka, pa zeleno svetlo poništava obavezu iz znaka STOP koji stoji iznad njega i ti se ne zaustavljaš. Prednost prema putničkom vozilu imaš i po pravilima: ti zadržavaš pravac, a ono skreće ulevo i preseca ti putanju. Jače od semafora je samo naredba ovlašćenog lica.' };
X[9973] = { ...(X[9973] || {}), x: 'Zeleno svetlo daje pravo da uđeš u raskrsnicu, ali ne rešava sukob putanja. Ti zadržavaš pravac, a vozilo koje skreće ulevo preseca ti putanju, pa je ono dužno da te propusti — pravilo levog skretanja važi i kada oba vozača istovremeno dobiju zeleno. Znak STOP iznad semafora tu ništa ne menja, jer je semafor jači od znaka.' };
X[9984] = { ...(X[9984] || {}), x: 'Žuti romb pored tvog puta znači da si na putu sa prvenstvom, pa putničko vozilo sa poprečnog puta mora da propusti tebe. Tramvaju taj romb ne oduzima ništa: on ti dolazi iz suprotnog smera tvojim istim putem, dakle i on je na putu sa prvenstvom, a tada važi pravilo da se tramvaj propušta.' };
X[9987] = { ...(X[9987] || {}), x: 'Trougao sa vrhom naniže obavezuje te da ustupiš prvenstvo svim vozilima na putu na koji se uključuješ, pa i onom koje ti dolazi sa leve strane — znak je jači od pravila desne strane. Plavi okrugli znak uz njega ne daje prvenstvo nikome, on samo pokazuje da se saobraćaj odvija u krug oko ostrva. Zato je baš ovde odgovor sa levom stranom tačan.' };
X[9991] = { ...(X[9991] || {}), x: 'Plavi znak određuje kružni smer kretanja, ne prvenstvo. Na prikazanom prilazu nema znaka ustupanja prvenstva. Prema vozilu sleva imaš prednost po pravilu desne strane, jer mu dolaziš zdesna (ZOBS čl. 47).' };
X[9995] = { ...(X[9995] || {}), x: 'Trougao sa vrhom naniže obavezuje te da propustiš sva vozila na putu sa prvenstvom, i ona sleva i ona zdesna. Bicikl je pritom vozilo isto koliko i automobil, pa za njega nema izuzetka. Zato ne prolazi ni varijanta u kojoj propuštaš samo automobil, ni pozivanje na desnu stranu: uz ovaj znak nemaš prednost ni prema kome.' };
X[9998] = { ...(X[9998] || {}), x: 'Sa zemljanog puta na put sa savremenim kolovoznim zastorom uključuješ se tako što propuštaš sva vozila, i onda kada nema nijednog znaka — odlučuje vrsta podloge sa koje izlaziš. Bicikl je vozilo isto koliko i autobus, pa ni za njega nema izuzetka, a pravilo desne strane se ovde uopšte ne primenjuje.' };
X[10000] = { ...(X[10000] || {}), x: 'Ti se već krećeš putem, a oba vozila tek izlaze sa površine pored puta na kojoj se ne obavlja javni saobraćaj. Ko se tako uključuje na put dužan je da propusti sva vozila koja se njime kreću, pa prednost imaš i prema levom i prema desnom. Pravilo desne strane ovde uopšte ne dolazi na red — ono rešava susret vozila koja su na putevima.' };
X[10004] = { ...(X[10004] || {}), x: 'Skretanjem presecaš biciklističku stazu, a tada si dužan da propustiš sva vozila koja se njome kreću, bez obzira na to da li ti dolaze sleva ili zdesna. Bicikl je vozilo, a ne pešak, i ne postoji pravilo po kome bi motocikl imao prednost zato što je brži ili veći. Zato ovde čekaš da biciklista prođe.' };
X[10005] = { ...(X[10005] || {}), x: 'Bicikl je vozilo i u raskrsnici ima ista prava kao automobil — pravilo po kome veće ili brže vozilo ima prednost ne postoji. Kreće se uz desnu ivicu kolovoza, pa se obojici vozača nalazi sa desne strane, a onome koji skreće udesno preseca i putanju. Zato ga propuštaju i jedan i drugi, bez obzira na to što je sporiji.' };
X[10010] = { ...(X[10010] || {}), x: 'Strelica na kolovozu u tvojoj traci je naredba, a ne predlog: u srednjoj traci nacrtana je strelica pravo, pa iz nje smeš samo pravo. Leva traka ima strelicu savijenu ulevo, desna udesno — njihove mogućnosti nisu tvoje. Zeleno svetlo ti dozvoljava da prođeš raskrsnicu u smeru koji tvoja traka propisuje, ne otvara ti sva tri smera, pa zamka sa uslovom da nikoga ne ometaš pada.' };
X[10012] = { ...(X[10012] || {}), x: 'Zauzeo si srednju traku, a u njoj je na asfaltu strelica koja pokazuje pravo. Za skretanje ulevo moraš se blagovremeno prestrojiti u krajnju levu traku, gde je nacrtana strelica savijena ulevo. Kada si već stao u traci za pravo, nema popravnog: skretanje ulevo odatle nije dozvoljeno, nego nastavljaš pravo i vraćaš se drugim putem.' };
X[10014] = { ...(X[10014] || {}), x: 'Iz srednje trake, u kojoj je nacrtana strelica pravo, ne smeš udesno — za desno se prestrojava u krajnju desnu traku, obeleženu strelicom savijenom udesno. Prestrojavanje se obavlja na dovoljnom odstojanju pred raskrsnicom, a ne u poslednjem trenutku ili prelaskom preko trake. Zato je i pored zelenog svetla jedini dozvoljen smer iz tvoje trake pravo.' };
X[10019] = { ...(X[10019] || {}), x: 'U tvojoj traci na kolovozu je strelica savijena ulevo, pa si u pravoj traci za taj smer i skretanje odatle nije sporno. Strelica ti, međutim, daje samo smer, ne i slobodan prolaz: pri skretanju ulevo prvo propuštaš vozila iz suprotnog smera, a zatim i pešake koji prelaze ulicu u koju ulaziš. Zamka je navika da na ovakvim slikama uvek odgovoriš da nije dozvoljeno.' };
X[10021] = { ...(X[10021] || {}), x: 'Prvenstvo prolaza ti daje pravo da prođeš pre drugih, ali ne i pravo da uđeš tamo gde nema mesta. Vozila ispred tebe stoje, pa bi ulaskom ostao na pešačkom prelazu ili u samoj raskrsnici i blokirao pešake i vozila sa poprečnog puta. Zato čekaš ispred prelaza dok se prostor iza raskrsnice ne oslobodi, iako imaš prvenstvo.' };
X[10022] = { ...(X[10022] || {}), x: 'Zeleno svetlo je dozvola da uđeš, a ne naredba: u raskrsnicu se ne ulazi ako zbog gužve ne možeš i da je napustiš. Zeleno i žuto vozilo ispred stoje, pa bi crveno vozilo ostalo zaustavljeno u raskrsnici i, čim se svetla promene, preseklo bi put onima koji tada dobiju zeleno. Ni pritisak vozila iza tebe nije razlog da uđeš.' };
X[10023] = { ...(X[10023] || {}), x: 'Isto pravilo važi i kada ideš putem sa prvenstvom prolaza, obeleženim žutim rombom: prvenstvo ne ukida zabranu blokiranja raskrsnice. Kolona ispred crvenog vozila stoji, pa bi ono ostalo na pešačkom prelazu ili u raskrsnici i smetalo pešacima i vozilima sa sporednog puta. Sačekaš ispred, pa uđeš tek kada možeš i da izađeš.' };
X[10025] = { ...(X[10025] || {}), x: 'Vozilo iz suprotnog smera pretiče kolonu i pri tom prelazi preko neisprekidane linije u tvoju traku, pa ti dolazi pravo u susret. Takvo postupanje zakon izdvaja kao grubo suprotno pravilima, jer se sudar izbegava samo tuđom reakcijom. Njegova procena da će stići da se vrati ništa ti ne vredi: ti si na mopedu, nemaš kud da se skloniš, a odluku o tom susretu doneo je neko drugi umesto tebe.' };
X[10027] = { ...(X[10027] || {}), x: 'Kolovozi su fizički razdvojeni ostrvom, a plavi znak na njemu okrenut je ka tebi i pokazuje na koju stranu ide saobraćaj — dakle ti se krećeš pogrešnom stranom. To potvrđuje i automobil koji ti tvojom trakom dolazi pravo u susret. Vožnja suprotnim smerom na razdvojenom putu je upravo ono što zakon izdvaja kao grubo suprotno pravilima, jer sudar izbegava neko drugi umesto tebe.' };
X[10029] = { ...(X[10029] || {}), x: 'Van naselja si dužan da daš zvučni znak kada upozoravaš vozača koga pretičeš ili obilaziš, a bez tog znaka bi postojala opasnost od nezgode. Vozilo 2 je već u levoj traci, a vozilo 1 pokazivačem najavljuje izlazak iz svoje trake — upravo situacija u kojoj truba sprečava sudar. Svetlosni znak je tvoja mogućnost, nikad dodatna obaveza, pa je ponuda sa oba znaka netačna.' };
X[10031] = { ...(X[10031] || {}), x: 'Obilaziš zaustavljeno vozilo koje je uključilo pokazivače, a između parkiranih kola i tvoje putanje niko nikoga ne vidi na vreme — bezbednost ovde traži zvučni znak, pa si dužan da ga daš. Obaveza ne postoji samo u tri slučaja koje zakon nabraja, jer u njemu stoji reč naročito: važi kad god razlozi bezbednosti to zahtevaju, pa i u gradskoj ulici.' };
X[10033] = { ...(X[10033] || {}), x: 'Truba i duga svetla postoje zbog opasnosti, nikad zbog nervoze. Ispred tebe je vozilo auto-škole, a leva traka je zauzeta vozilom koje se kreće, pa uslova za preticanje nema i strpljivo nastavljaš vožnju do mesta gde smeš da pretekneš. Znak upozorenja kojim bi nekoga požurio nije dozvoljena upotreba ni zvučnog ni svetlosnog signala.' };
X[10036] = { ...(X[10036] || {}), x: 'Van naselja si dužan da daš zvučni znak pre ulaska u nepreglednu i uzanu krivinu, kao i pred prevojem, gde je mimoilaženje otežano. Put je ovde uzan, sa jedne strane odsečena stena, sa druge odbojna ograda, a iza krivine se ne vidi ništa — vozač iz suprotnog smera može da sazna da nailaziš jedino po zvuku.' };
X[10039] = { ...(X[10039] || {}), x: 'Zeleno svetlo ti ne daje pravo da požuruješ onoga ispred sebe. Vozilo auto-škole tek kreće, nikakve opasnosti na koju bi upozoravao nema, pa strpljivo čekaš da nastavi kretanje. Zvučni i svetlosni znak upozorenja rezervisani su za opasnost, a upotreba trube da bi neko brže krenuo nije dozvoljena, ni sama ni uz duga svetla.' };
X[10042] = { ...(X[10042] || {}), x: 'Zvučni znak si dužan da daš kada je pored kolovoza ili na njemu dete koje ne obraća pažnju na kretanje vozila. Deca trče za loptom preko puta i ne gledaju u tvom pravcu, pa je truba tu upravo ono za šta služi — upozorenje na opasnost. Uz to smanjuješ brzinu tako da možeš odmah da staneš, jer se i lopta i dete kreću nepredvidivo.' };
X[10049] = { ...(X[10049] || {}), x: 'Sva četiri pokazivača pravca obavezno pališ kada si poslednji u zaustavljenoj koloni na putu van naselja — to je jedini način da vozač koji nailazi punom brzinom na vreme shvati da kolona stoji. Samo levi pokazivač značio bi nameru da se pomeriš ulevo, što ovu situaciju ne opisuje, a ne uključiti ništa znači nadati se da će te neko primetiti.' };
X[10061] = { ...(X[10061] || {}), x: 'Bele kose pruge oivičene punom linijom su polje za usmeravanje saobraćaja, površina koja mora da ostane prazna da bi se tokovi razdvojili na vreme. Na nju vozilo ne sme ni da pređe, pa je ostavljanje vozila tu zabranjeno. Automobili koje vidiš na prugama stoje nepropisno, iako mesto na prvi pogled deluje kao slobodan prostor uz ivicu.' };
X[10091] = { ...(X[10091] || {}), x: "Vozilo bi stalo na biciklističkoj traci, desno od pune bele linije. Na njoj je zabranjeno zaustavljanje; izuzetak za auto-taksi ne obuhvata biciklističku traku (ZOBS čl. 66 st. 1 t. 8 i st. 4)." };
X[10092] = { ...(X[10092] || {}), x: "Parkiranje na biciklističkoj traci prikazanoj na slici nije dozvoljeno, ni auto-taksi vozilima (ZOBS čl. 66 st. 1 t. 8 i st. 4)." };
X[10113] = { ...(X[10113] || {}), x: 'Trotoar je namenjen pešacima i vozilo se na njega ostavlja samo tamo gde to izričito dopušta saobraćajni znak ili oznaka na kolovozu. Ovde takvog znaka nema, pa zabrana važi bez obzira na to koliko je prostora ostalo iza vozila. Zato pada i zamka sa 1,60 m: ta širina slobodnog prolaza je dodatni uslov tamo gde je parkiranje već dopušteno, a ne sama dozvola.' };
X[10118] = { ...(X[10118] || {}), x: "Plavi znak „staza rezervisana za bicikliste i pešake” označava odvojene delove za kretanje pešaka, biciklista i vozača lakih električnih vozila. Srebrni automobil stoji na toj stazi, gde zaustavljanje nije dozvoljeno. Prolaz od 1,60 m odnosi se na izuzetak za parkiranje na trotoaru i ne dopušta zaustavljanje automobila na stazi." };
X[10142] = { ...(X[10142] || {}), x: "Na slici je znak zabrane saobraćaja za vozila u oba smera. Na tako označenoj površini zabranjeni su i zaustavljanje i parkiranje (ZOBS čl. 66 st. 1 t. 22)." };
X[10187] = { ...(X[10187] || {}), x: 'Motorno vozilo uopšte ne sme da vuče motocikl, moped ni tricikl, pa prvi prikaz pada već po vrsti vučenog vozila, ma koliko uže bilo uredno vezano. U drugom se vuče putničko vozilo, i to krutom vezom, pa su i vrsta vozila i način vuče u redu. Zbog toga ne mogu biti ispravna oba prikaza.' };
X[10226] = { ...(X[10226] || {}), x: 'Vođenje životinje sa vozila zabranjeno je bez ijednog izuzetka, a ovde vozač mopeda jednom rukom drži upravljač, a drugom povodac psa. Pas može da povuče, da stane ili da skrene, i tada nemaš pod kontrolom ni upravljanje ni kočenje. Brzina tu ništa ne menja: formulacija o kretanju brzinom pešaka pozajmljena je iz drugih pravila i na ovo se ne odnosi.' };
X[10237] = { ...(X[10237] || {}), x: 'Propisno upravlja onaj ko sedi na sedištu, drži upravljač obema rukama i nosi kacigu, a to je drugi vozač na slici. Prvi je skrstio ruke i uopšte ne drži upravljač, treći nosi alat preko ramena koji ga ometa i može nekoga da zakači, a četvrti vozi teret toliko širok i visok da zaklanja i vozilo i pogled unazad.' };
X[10255] = { ...(X[10255] || {}), x: 'To što raskrsnicom upravlja policijski službenik ne ukida tvoju obavezu prema pešacima: znak koji ti dozvoljava prolaz nikada ne znači i pravo da prođeš kroz ljude koji su već na obeleženom prelazu ispred tebe. Zato ih propuštaš. Zvučni znak nije rešenje — truba je za opasnost, a ne za rasterivanje pešaka koji propisno prelaze kolovoz.' };
X[10259] = { ...(X[10259] || {}), x: 'Zeleno svetlo ti otvara put, ali pešaci koji su već stupili na obeleženi prelaz ispred tebe imaju prednost, pa si dužan da ih propustiš i sačekaš da pređu. Pred pešačkim prelazom brzina mora biti takva da uvek možeš da staneš. Trubom ih ne teraš da požure: zvučni znak služi za upozorenje na opasnost, a ne za sticanje prolaza.' };
X[10263] = { ...(X[10263] || {}), x: 'Kada skrećeš, presecaš put pešacima koji prelaze kolovoz u koji ulaziš, pa njih propuštaš bez obzira na to što tebi semafor pokazuje zeleno. Pešakinja je označena kod prelaza preko ulice u koju skrećeš, tačno tamo kuda te vodi tvoja putanja. Zvučni znak tu ne bi bio upozorenje na opasnost nego požurivanje, pa nije tačan odgovor.' };
X[10266] = { ...(X[10266] || {}), x: 'Pešaka koji je već stupio na kolovoz dužan si da propustiš i kada ne prelazi obeleženim pešačkim prelazom — odlučuje to što je već na kolovozu ispred tebe, a ti tek počinješ skretanje udesno. Odsustvo obeleženog prelaza ne prebacuje obavezu na njega. Trubom ga ne teraš da se skloni: zvučni znak je upozorenje na opasnost, a ne način da sebi napraviš prolaz.' };
X[10270] = { ...(X[10270] || {}), x: 'Prisustvo dece traži naročitu opreznost: brzinu prilagođavaš tako da možeš blagovremeno da zaustaviš vozilo, a uz to si dužan i da upotrebiš zvučni znak upozorenja, jer deca pored kolovoza i na njemu ne prate kretanje vozila. Zato odgovor koji traži samo prilagođavanje brzine nije potpun, a nastavak istom brzinom uz trubu je obrnuto od onoga što se traži.' };
X[10273] = { ...(X[10273] || {}), x: 'Organizovana kolona pešaka prolazi kao celina i ne sme se presecati — čekaš da cela pređe, pa tek onda krećeš. Ovde preko ulice prelazi grupa dece pod nadzorom, u zoni škole, gde i najmanja greška najviše košta. Uterivanje vozila u prazninu između dvoje dece razbija kolonu i ostavlja onu decu koja su ostala iza tebe bez zaštite.' };
X[10304] = { ...(X[10304] || {}), x: 'Traka za uključivanje postoji da bi ubrzao do brzine saobraćaja na autoputu i koristi se do svog kraja, pa se tek onda ulivaš u krajnju desnu traku. Putanja 2 je napušta prerano, a putanja 1 seče čak do leve trake, tamo gde se vozila kreću najbrže i najmanje te očekuju. Ispravna je samo ona koja prati traku do kraja i uliva se u desnu.' };
X[10322] = { ...(X[10322] || {}), x: 'Prolaz u razdelnom pojasu koji vidiš nije poziv da se okreneš: polukružno okretanje na autoputu zabranjeno je bez ijednog izuzetka, kao i vožnja unazad i zaustavljanje van uređenih mesta. Vozila iza tebe nailaze velikom brzinom i ne očekuju nikoga ko preseca kolovoz. Zato dodaci da se okretanje izvodi bez manevrisanja ili bez ugrožavanja drugih ništa ne menjaju, jer zabrana ne zavisi od tvoje procene.' };
X[10323] = { ...(X[10323] || {}), x: 'Na motoputu važe ista posebna pravila kao na autoputu, pa i ovde okretanje u suprotan smer otpada bez izuzetka. Brzine su velike, a vozilo koje se okreće preseca ceo kolovoz i stvara prepreku koju onaj ko nailazi ne očekuje i ne stiže da izbegne. Uslovi da nema manevrisanja i da niko nije ugrožen su mamac, jer zabrana ne zavisi od procene vozača.' };
X[10409] = { ...(X[10409] || {}), x: 'Uz upaljeno crveno svetlo svetli dopunska zelena strelica udesno, a ona je uslovna dozvola: prolaziš samo u smeru strelice i tek pošto propustiš sva vozila na putu na koji ulaziš i pešake koji prelaze kolovoz. Ne daje ti prvenstvo, nego obrnuto, ti propuštaš. I ne odnosi se samo na javni prevoz, već na svakoga iz te trake.' };
X[10411] = { ...(X[10411] || {}), x: 'Crveni ukršteni signal iznad saobraćajne trake zabranjuje kretanje tom trakom celom njenom dužinom, dakle traka je zatvorena i blagovremeno prelaziš u susednu iznad koje svetli zelena strelica. Ne znači zaustavljanje ispod samog znaka, jer se zabrana odnosi na traku, a ne na tačku. Izuzetka za javni prevoz ovde nema.' };
X[10412] = { ...(X[10412] || {}), x: 'Žuta kosa strelica koja trepće iznad trake je naredba, ne obaveštenje: traku iznad koje stoji moraš da napustiš i da nastaviš onom trakom na koju vrh strelice pokazuje. Povećanu opreznost traži obično žuto trepćuće svetlo, puni žuti krug bez strelice. Traku za javni prevoz označavaju oznake na kolovozu i znak pored puta.' };
X[10413] = { ...(X[10413] || {}), x: 'Zelena strelica okrenuta nadole iznad trake znači da je ta traka otvorena i da njome smeš da se krećeš. Vezuje se za traku iznad koje visi, a ne za vrstu vozila, pa nije namenjena samo tramvajima. Obavezan prelazak u drugu traku nalaže žuta kosa trepćuća strelica, a traku zatvara crveni ukršteni signal.' };
X[10416] = { ...(X[10416] || {}), x: 'Ovde je vidiš na prikolici zaustavljenoj kod radova: lampe slažu veliku strelicu ulevo, a plavi znak ispod njih govori da radilište obilaziš s leve strane. Takva tabla ide na zadnji deo motornog vozila ili prikolice i poruku nosi samo dok to vozilo stoji. Razdvajajuća ograda i čeoni branik postavljaju se na sam put, pa ih na vozilu ni ne tražiš.' };
X[10419] = { ...(X[10419] || {}), x: 'Crvena zastavica je podignuta, pa je prolaz za tebe zatvoren, a zelena koja visi uz telo nije poruka. Znak radnika koji reguliše saobraćaj na radilištu ima prvenstvo nad signalizacijom i nad pravilima, pa je obavezujući za tebe. Prazna traka ispred tebe nije izgovor: radnik vidi kada pušta suprotni smer, a ti sa svog mesta to ne možeš da proceniš.' };
X[10462] = { ...(X[10462] || {}), x: 'U obe trake iscrtana je strelica sa dva kraka — jedan pokazuje pravo, drugi savija udesno. Kad je smer određen oznakom na kolovozu, ona je jača od opšteg pravila po kome se udesno skreće samo iz krajnje desne trake, pa se ovde udesno sme i iz trake 1 i iz trake 2. Zato padaju ponude koje izdvajaju samo jednu od njih.' };
X[10464] = { ...(X[10464] || {}), x: 'U traci 2, koja je uz levu ivicu kolovoza, strelica pokazuje ulevo, a u traci 1 do nje iscrtana je strelica sa dva kraka: pravo i ulevo. Pošto obe trake imaju krak za levo, skretanje ulevo je dozvoljeno iz obe. Oznaka na kolovozu ovde određuje smerove, pa se ne primenjuje opšte pravilo po kome bi levo bilo samo iz krajnje leve trake.' };
X[10550] = { ...(X[10550] || {}), x: 'Znak policijskog službenika jači je od svega ostalog na raskrsnici. On stoji okrenut prednjom stranom tela prema tebi, a taj položaj za tvoj smer znači zabranjen prolaz, pa zaustavljaš vozilo ispred linije zaustavljanja i tu čekaš. Propuštanje pešaka nije dovoljan odgovor, jer ti ionako ne smeš da pređeš liniju, a truba ne služi da bi pešaci brže prešli.' };
X[10563] = { ...(X[10563] || {}), x: 'Iz trake za uključivanje prelaziš u traku koja ti je sa leve strane, a pokazivač uvek najavljuje stranu na koju se pomeraš. Desni bi značio da ideš ka bankini i poslao bi pogrešnu poruku onima iza tebe. Nameru najavljuješ i onda kada si se već uverio da je manevar bezbedan, jer taj znak nije za tebe nego za druge koji ti se približavaju.' };
X[10564] = { ...(X[10564] || {}), x: 'Vozilo iz trake za uključivanje tek ulazi u tok saobraćaja i zato nema nikakvo prvenstvo: na njemu je da sačeka prazninu i da se uklopi. Kamion koji se već kreće autoputem nastavlja svojom trakom i ne mora zbog tebe ni da usporava ni da menja traku. Ubrzavanje dok si u traci jeste obaveza, ali ti ono ne daje pravo prolaza.' };
X[10565] = { ...(X[10565] || {}), x: 'Sa autoputa se izlazi tako što iz krajnje desne trake pređeš u traku za usporavanje na njenom početku i tek u njoj smanjuješ brzinu, a upravo to radi putanja 1. Putanja 2 napušta kolovoz kasnije i naglije, a putanja 3 kreće iz leve trake i preseca desnu, pa iznenađuje one koji tuda prolaze punom brzinom.' };
X[10614] = { ...(X[10614] || {}), x: 'Vozilo je celo na nižem delu, ispred ivičnjaka, dakle na kolovozu. Nacrtano je iz čistog bočnog profila, što znači da stoji poprečno u odnosu na ulicu, pa je parkiranje upravno na podužnu osu kolovoza. Da je paralelno, vozilo bi se videlo s prednje strane, a kod parkiranja pod uglom crtež bi bio kos, u tri četvrtine.' };
X[10616] = { ...(X[10616] || {}), x: 'Ovo je zatvoren krug: svako propušta onoga ko mu je zdesna, pa niko ne sme da krene prvi. Takva raskrsnica se ne rešava odlučnošću nego dogovorom — vizuelnim kontaktom i znakom rukom ustupiš prolaz crvenom vozilu, koje ima prednost u odnosu na belo, i krug se raspetlja. Traktor ti je zdesna, pa njega propuštaš u svakom slučaju.' };
X[10618] = { ...(X[10618] || {}), x: 'Nema nijednog saobraćajnog znaka, pa odlučuju opšta pravila, i to dva odjednom. Teretno vozilo ti dolazi sa desne strane i propuštaš ga po pravilu desne strane. Pošto skrećeš ulevo, dužan si da propustiš i putničko vozilo iz suprotnog smera koje ti preseca putanju. Nijednom od njih ne možeš da oduzmeš prednost.' };
X[10620] = { ...(X[10620] || {}), x: 'Ovde nema znaka koji bi odredio prvenstvo, pa važe opšta pravila. Traktor ti je sa desne strane i propuštaš ga — to što sporo ide nije razlog da mu oduzmeš prednost. Pošto skrećeš ulevo, propuštaš i putničko vozilo iz suprotnog smera. Dakle čekaš oba, pa tek onda ulaziš u skretanje.' };
X[10622] = { ...(X[10622] || {}), x: 'Bez saobraćajnog znaka raskrsnicu rešavaju opšta pravila. Traktor ti dolazi sa desne strane, pa ga propuštaš. Pošto skrećeš ulevo, propuštaš i vozilo iz suprotnog smera, jer pri levom skretanju prednost ima onaj ko zadržava pravac ili skreće udesno. Dva različita pravila vode do istog zaključka — čekaš oba.' };
X[10624] = { ...(X[10624] || {}), x: 'Tramvaj se propušta u svim slučajevima, pa i kada ti dolazi sa leve strane: pravilo o tramvaju stoji ispred pravila desne strane, pa „dolazi mi sleva” nije izgovor. Prema putničkom vozilu prednost je tvoja, jer ono skreće ulevo i preseca ti putanju, a onaj ko skreće ulevo propušta vozilo iz suprotnog smera.' };
X[10626] = { ...(X[10626] || {}), x: 'Žuti romb znači da si na putu sa prvenstvom, a pravilo o tramvaju važi samo ako znakom nije drugačije određeno. Tramvaj je ovde na poprečnom putu, pa i on mora da propusti tebe — to je ona retka situacija u kojoj tramvaj na raskrsnici nema prednost. Vozilo koje skreće ulevo takođe te propušta, pa prolaziš ispred oba.' };
X[10628] = { ...(X[10628] || {}), x: 'Nema znaka koji bi ti dao prvenstvo, pa važe dva opšta pravila. Tramvaj propuštaš uvek, bez obzira na to odakle ti dolazi i da li ti putanju preseca iz suprotnog smera. Putničko vozilo ti dolazi sa desne strane, pa i njega propuštaš. Zato nije tačna nijedna ponuda u kojoj prolaziš ispred jednog od njih.' };
X[10630] = { ...(X[10630] || {}), x: 'Dva pravila ovde daju dva različita ishoda. Tramvaj se propušta u svim slučajevima, pa ni to što ti dolazi tvojim putem ništa ne menja. Putničko vozilo ti dolazi sa leve strane, a prema levoj strani prednost je tvoja — pravilo te obavezuje samo prema onome ko ti je zdesna. Zato jedno čekaš, a ispred drugog prolaziš.' };
X[10988] = { ...(X[10988] || {}), x: 'Kada na tabli stoji samo broj metara, bez strelica, on meri rastojanje od mesta gde znak stoji do početka dela puta, odnosno mesta na koje se znak odnosi. Do tog mesta odredba znaka još ne deluje. Isti broj sa dve strelice nagore značio bi nešto sasvim drugo: dužinu deonice na kojoj znak važi od samog mesta postavljanja.' };
X[10989] = { ...(X[10989] || {}), x: 'Dve strelice nagore uz broj metara znače da odredba znaka iznad table važi celom tom deonicom, od mesta gde znak stoji pa do kraja te dužine. Isti broj bez strelica značio bi samo udaljenost do mesta na koje se znak odnosi, a dotle znak ne bi ni delovao. Zato ovde odmah moraš da se ponašaš po znaku.' };
X[10990] = { ...(X[10990] || {}), x: 'Na tabli piše goli vremenski raspon, pa on kazuje kada odredba znaka iznad nje uopšte deluje: van tog dela dana znak nema dejstvo. Tabla, dakle, ne ukida znak nego mu ograničava vreme važenja. Zamka je da isti raspon pročitaš obrnuto, kao vreme u kome zabrana miruje — a tabla ovde ne kaže ništa o izuzimanju. Nije ni obaveštenje o načinu korišćenja znaka.' };
X[10991] = { ...(X[10991] || {}), x: 'Poruka je data simbolom vozila, a simbol vozila na dopunskoj tabli uvek sužava krug onih na koje se znak iznad odnosi, ovde na teretna vozila. Sama tabla ne uvodi zabranu, ograničenje ni obavezu; to nosi znak iznad nje, a tabla samo kaže na koga se on primenjuje. Zato njena poruka nikada nije nevezana za značenje znaka.' };
X[10992] = { ...(X[10992] || {}), x: 'Trougao okrenut vrhom nadole obavezuje te da ustupiš prvenstvo prolaza, a tabla ispod njega crta oblik raskrsnice: debeli potez je put sa prvenstvom i pokazuje kuda se on pruža, dok su tanke crte sporedni krakovi. Tako unapred znaš odakle nailaze vozila kojima daješ prolaz. Strelica smera i oznaka slepog puta izgledaju drugačije.' };
X[10993] = { ...(X[10993] || {}), x: 'Tekst na tabli ne uvodi nikakvo novo pravilo, već bliže određuje značenje znaka iznad nje tako što izuzima jednu grupu korisnika. Zabranu, ograničenje ili obavezu nosi sam znak, a tabla mu samo sužava dejstvo. Zato poruka table nikada nije nezavisna od znaka: bez znaka iznad sebe ovaj tekst ne bi imao nikakav smisao.' };

const BYSUB = {
  148: 'prvenstvo-prolaza',   // vozila pod pratnjom i sa pravom prvenstva (56 pitanja)
  136: 'prvenstvo-prolaza',   // prvenstvo prolaza
  137: 'skretanje',   // saobraćaj na raskrsnici (prestrojavanje, ulazak, zaustavljanje u raskrsnici)
};

X[9868] = { x: "Brzina mora omogućiti da blagovremeno staneš pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš i da ne ugrožavaš bezbednost saobraćaja (ZOBS čl. 42). Brži dolazak nije cilj ovog pravila, niti ono daje dozvolu za ometanje drugih.", card: 'brzine' };
X[10488] = { x: "Među ponuđenim odgovorima, brzinu prilagođavaš osobinama i stanju puta, vidljivosti i preglednosti, kao i stanju vozila i tereta (ZOBS čl. 42). Raspoloživo vreme, žurba i brzina najbržih vozila ne zamenjuju te uslove za bezbedno upravljanje i zaustavljanje.", card: 'brzine' };
X[10489] = { x: "Brzinu prilagođavaš atmosferskim prilikama, gustini saobraćaja i drugim saobraćajnim uslovima, radi bezbednog upravljanja i blagovremenog zaustavljanja (ZOBS čl. 42). Udobnost i raspoloživo vreme za dolazak, ponuđeni u ovom pitanju, ne zamenjuju te uslove.", card: 'brzine' };
X[9870] = { x: "Magla na slici smanjuje vidljivost. Brzinu prilagodi tako da možeš blagovremeno da zaustaviš vozilo pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš (ZOBS čl. 42). Ponuđenih 60 km/h ili umanjenje za najmanje 20% ne zamenjuju tu obavezu.", card: 'brzine' };
X[9873] = { x: "Na slici su označena oštećenja kolovoza. Brzinu prilagodi tako da možeš blagovremeno da staneš pred preprekom koju možeš da vidiš ili imaš razloga da predvidiš i da ne ugrožavaš sebe ni druge (ZOBS čl. 42). Ponuđenih 80 km/h ili umanjenje za najmanje 20% ne zamenjuju te obaveze.", card: 'brzine' };
const znakJaci = 'Važi broj sa POSTAVLJENOG ZNAKA — konkretan znak je jači od opšteg ograničenja (ZOBS čl. 43 i 44: opšta pravila važe samo tamo gde znak ne kaže drugačije).';
X[9878] = { x: znakJaci, card: 'brzine' };
X[9908] = { x: 'Znak označava završetak motoputa. U prikazanoj situaciji nastavljaš ostalim putem izvan naselja, gde je opšte ograničenje 80 km/h (ZOBS čl. 44).', card: 'brzine' };
X[9948] = { x: znakJaci, card: 'brzine' };
X[9946] = { x: "Na slici je uz ulazak u naselje postavljeno ograničenje 40 km/h. Zato i za moped i za motocikl u ovom pitanju važi najviše 40 km/h (ZOBS čl. 43).", card: 'brzine' };
X[9947] = { x: "Znak na slici dopušta najviše 80 km/h za motocikl. U naselju znak može odrediti i više od opštih 50 km/h, do najviše 80 km/h kada uslovi puta to omogućavaju (ZOBS čl. 43 st. 2).", card: 'brzine' };
X[9949] = { x: 'Na prikazanom motoputu znak ograničava brzinu na 60 km/h, manje od opštih 100 km/h (ZOBS čl. 20 i 44).', card: 'brzine' };
X[9891] = { x: "Motoput van naselja: najviše 100 km/h (ZOBS čl. 44).", card: 'brzine' };
X[9903] = { x: "Put van naselja koji nije ni autoput ni motoput: najviše 80 km/h (ZOBS čl. 44).", card: 'brzine' };
X[10491] = { x: 'U naselju, bez znaka koji kaže drugačije: najviše 50 km/h (ZOBS čl. 43). Znakom može da se dozvoli i do 80 kada put to omogućava.', card: 'brzine' };
X[10641] = { x: 'Autoput van naselja: najviše 130 km/h (ZOBS čl. 44). Merdevine: 50 → 80 → 100 → 130.', card: 'brzine' };

// kartica "brzine" uz sva pitanja podoblasti Brzina
BYSUB[135] = 'brzine';



// --- Dužnosti kod nezgode (sub 175) ---
const nezPov = 'Kod nezgode SA povređenima ili poginulima (ZOBS čl. 168): zaustavi se i ostani do kraja uviđaja, obavesti policiju i hitnu pomoć, pomozi povređenima u skladu sa svojim znanjem i preduzmi sve mere u svojoj moći da sprečiš nove nezgode i uvećanje posledica. Odgovori koji dužnost ublažavaju ili je prebacuju na drugog su netačni.';
X[8530] = { x: 'Ko se zatekne na nezgodi sa povređenima, obaveštava policiju, odnosno hitnu pomoć (ZOBS čl. 167). Vatrogasce, osiguranje ili rodbinu — ne.' };
X[8531] = { x: "Dužan si da obezbediš tragove i predmete nezgode — ali samo pod uslovom da time ne ugrožavaš bezbednost saobraćaja (ZOBS čl. 168). Redak slučaj gde uslov \"da ne ugrožava\" JESTE deo tačnog odgovora, jer tako doslovno piše u zakonu. Zamke: Evropski izveštaj se popunjava kod nezgode sa manjom materijalnom štetom (čl. 172), ne ovde; sa mesta nezgode se ne udaljavaš — ostaješ do završetka uviđaja, a privremeno odlaženje je dozvoljeno samo radi hitne medicinske pomoći, odnosno prevoženja povređenog (čl. 168)." };
X[8532] = { x: "Pomoć povređenima pružaš u skladu sa SVOJIM znanjima, sposobnostima i mogućnostima (ZOBS čl. 168) — zakon ne traži medicinsku stručnost, ali traži da pomogneš. Mamci sa \"ukloni povređene pa ih ostavi\" i \"udalji se sa mesta nezgode\" padaju na istom članu: dužan si da OSTANEŠ na mestu nezgode do dolaska policije i završetka uviđaja — udaljiti se smeš samo radi hitne medicinske pomoći ili prevoženja povređenog, uz obavezu povratka." };
X[8533] = { x: nezPov };
X[8535] = { x: 'Od nastanka nezgode do završetka uviđaja pomeranje vozila NIJE dozvoljeno (kod nezgode sa povređenima) — tragovi su dokaz (ZOBS čl. 167-169).' };
X[8536] = { x: nezPov };
X[8537] = { x: nezPov };
X[8538] = { x: 'Kod nezgode sa povređenima: obavesti policiju i OSTANI na mestu do dolaska policije i završetka uviđaja (ZOBS čl. 168).' };
X[8539] = { x: 'Udaljavanje je izuzetno dozvoljeno samo iz tri razloga: tebi treba hitna pomoć, prevoziš povređenog do zdravstvene ustanove, ili ideš da obavestiš policiju — pa se vraćaš (ZOBS čl. 168).' };
X[8540] = { x: 'I kod MANJE materijalne štete svaki učesnik (ili oštećeni) može zahtevati da policija izađe i izvrši uviđaj (ZOBS čl. 170).' };
X[8541] = { x: 'Ako bilo koji učesnik/oštećeni zahteva uviđaj — svi su dužni da ostanu na mestu nezgode do njegovog završetka (ZOBS čl. 170).' };
X[8542] = { x: 'Kod manje štete: upozori ostale učesnike na prepreke i UKLONI vozilo/predmete sa kolovoza ako ometaju saobraćaj (ZOBS čl. 170) — suprotno od nezgode sa povređenima, gde se ništa ne pomera.' };
X[8543] = { x: 'Davanje uzorka krvi/urina radi utvrđivanja alkohola ili psihoaktivnih supstanci posle nezgode je OBAVEZNO (ZOBS čl. 169) — odbijanje je prekršaj.' };
X[8545] = { x: 'Kod manje štete: ostavi podatke o sebi i vozilu drugom učesniku/oštećenom i spreči nastajanje novih nezgoda (ZOBS čl. 170-171).' };
X[8546] = { x: 'Oštetio si tuđe vozilo/stvar a vlasnika nema: obavesti policiju i ostavi svoje podatke i podatke o oštećenom (ZOBS čl. 171). "Sačekati vlasnika" ili "otići" nisu opcije.' };
X[8547] = { x: 'Oduzete registarske tablice vraćaju se kad nadležnom organu dostaviš DOKAZ DA JE VOZILO TEHNIČKI ISPRAVNO — ne protekom vremena niti plaćanjem kazne.' };
X[8548] = { x: 'Fotografisanje na uviđaju nezgode BEZ poginulih/povređenih je obavezno — stanje se dokumentuje.' };
X[8550] = { x: 'Posle završenog uviđaja: bez odlaganja ukloni sa kolovoza vozilo, teret i rasuti materijal (ZOBS čl. 170) — put mora da se oslobodi.' };
X[8551] = { x: 'Kod manje materijalne štete učesnici popunjavaju EVROPSKI IZVEŠTAJ o saobraćajnoj nezgodi (ZOBS čl. 172) — standardni obrazac za osiguranje, umesto policijskog uviđaja.' };
X[10719] = { x: 'Isključenje i oduzimanje tablica primenjuje se na vozila koja posle nezgode NISU U VOZNOM STANJU, odnosno kojima su uređaji bitni za bezbednost znatno oštećeni.' };
BYSUB[175] = 'nezgoda';

// --- Vozačke dozvole (sub 172) + probna (sub 173) ---
const nesavestan = 'Dozvola se oduzima vozaču koji ne upravlja savesno i na propisan način — pragovi su: 18 ili više kaznenih poena (9 za probnu dozvolu), ili pravnosnažne osude za krivična dela protiv bezbednosti saobraćaja (ZOBS čl. 197). Pitanja iz ove grupe razlikuju se po broju osuda i periodu — čitaj pažljivo koje se tačno stanje traži.';
X[8464] = { x: 'Zabrana upravljanja odlukom nadležnog organa znači: ne smeš da upravljaš — bez izuzetaka i "osim ako" varijanti.' };
X[8465] = { x: "Isključen vozač ne sme da upravlja vozilom dok isključenje traje — isključenje se izriče na licu mesta (npr. alkohol, umor). Zabrana je potpuna: važi za sva motorna vozila i skupove vozila, ne samo za kategoriju kojom je vozio u trenutku isključenja, i nema vožnje \"do kuće\" ni do sedišta firme." };
X[8466] = { x: 'Dve vozačke dozvole dve države — korišćenje OBE nije dozvoljeno; koristi se jedna.' };
X[8467] = { x: 'Dozvola čiji si nestanak prijavio više ne važi (dobijaš novu) — korišćenje stare nije dozvoljeno čak i ako je nađeš.' };
X[8468] = { x: 'Promena prebivališta se prijavljuje nadležnom organu u roku od 30 DANA radi upisa u evidenciju vozača.' };
X[8469] = { x: "Vozačka (odnosno probna) dozvola mora biti KOD TEBE dok voziš — ne kod kuće, ne \"naknadno na uvid\". Ni lična karta uz \"proveru u registru\" ni međunarodna dozvola nisu zamena — međunarodna vozačka dozvola izdata u Srbiji ne sme se ni koristiti za upravljanje na teritoriji Srbije (ZOBS čl. 186)." };
X[8471] = { x: 'Međunarodna vozačka dozvola izdata u Srbiji služi za inostranstvo — na teritoriji Srbije se NE koristi (ovde važi tvoja obična).' };
X[8472] = { x: "Na zahtev ovlašćenog lica dozvola se daje NA UVID — obaveza, ne ljubaznost. Zamena ne postoji: ni lična karta uz proveru u registru, ni međunarodna dozvola ne ukidaju obavezu da vozačku, odnosno probnu dozvolu daš na uvid." };
X[8473] = { x: 'Pomagala upisana u dozvolu (naočare, sočiva...) OBAVEZNO koristiš dok voziš.' };
X[8474] = { x: nesavestan };
X[8475] = { x: "Dozvola se oduzima vozaču koji ne upravlja savesno i na propisan način — pragovi su: 18 ili više kaznenih poena (9 za probnu dozvolu), ili pravnosnažne osude za krivična dela protiv bezbednosti saobraćaja (ZOBS čl. 197). Pitanja iz ove grupe razlikuju se po broju osuda i periodu — čitaj pažljivo koje se tačno stanje traži. Kaznene poene ne izriče MUP, nego se izriču odlukom kojom je vozač kažnjen za prekršaj (ZOBS čl. 198) — jedinica MUP-a ih samo evidentira, a njena mera prema nesavesnom vozaču je ODUZIMANJE dozvole, ne \"privremena zabrana do godinu dana\"." };
X[8476] = { x: nesavestan };
X[8477] = { x: nesavestan };
X[8478] = { x: nesavestan };
X[8479] = { x: 'Kazneni poeni se brišu nakon 24 MESECA od pravnosnažnosti odluke o prekršaju (ZOBS čl. 198). Pamti: 2 godine.' };
X[8480] = { x: 'Dok traje zaštitna mera/zabrana upravljanja: ne može se ni započeti obuka ni polagati ispit — zabrana pokriva i sticanje prava.' };
X[8481] = { x: "Kandidat na praktičnoj obuci kod sebe mora imati: ličnu kartu + dokaz o zdravstvenoj sposobnosti + potvrdu o položenom teorijskom ispitu — sve tri stvari. Zamka: potvrda o završenoj teorijskoj OBUCI nije isto što i potvrda o položenom teorijskom ISPITU — traži se ova druga; ugovor o obuci i knjižica obuke nisu na spisku." };
X[8496] = { x: "Dozvola A kategorije pokriva i niže: smeš MOPED i MOTOCIKL (i teški tricikl). Vidi karticu za celu tabelu. Teški ČETVOROCIKL nije pokriven — četvorocikli idu uz B1, odnosno B kategoriju, a radnom mašinom sme da upravlja samo vozač sa F kategorijom (ZOBS čl. 195)." };
X[8501] = { x: 'Dozvola A kategorije: smeš MOTOCIKL i TEŠKI TRICIKL (i moped). A je najšira "dvotočkaška" dozvola.' };
X[10718] = { x: "Samostalno upravlja vozač koji ispunjava propisane uslove i ima dozvolu ZA TU KATEGORIJU vozila — dozvola druge kategorije ne pokriva. Uverenje o položenom ispitu nije dozvola — položen ispit je samo uslov za izdavanje, pa do preuzimanja vozačke dozvole samostalna vožnja nije dozvoljena." };
X[10691] = { x: 'Probna dozvola na AUTOPUTU: najviše 110 km/h (umesto 130) — ZOBS čl. 182.' };
X[10692] = { x: "Probna dozvola na MOTOPUTU: najviše 90 km/h (umesto 100) — ZOBS čl. 182. Zamka: 110 km/h je ograničenje probne dozvole na AUTOPUTU, a na ostalim putevima važi 90% od brzine dozvoljene na tom delu puta (čl. 182)." };
X[10693] = { x: "Probna dozvola na ostalim putevima: najviše 90% od ograničenja na tom delu puta (ZOBS čl. 182) — npr. gde važi 80, tebi važi 72. Ograničenje važi sve dok traje probna dozvola — ne samo do 18. godine. Period 23,00-06,00 je poseban mamac: tada vozač sa probnom dozvolom uopšte NE SME da upravlja (čl. 182), pa to nije \"prozor\" za ograničenje brzine." };
BYSUB[172] = 'dozvole';
BYSUB[173] = 'dozvole';


// --- Preticanje i obilaženje (sub 134) ---
const pretZabrane = 'Lista zabrana preticanja/obilaženja (ZOBS čl. 55 i 57): kolona (posebno pod pratnjom), kad te neko već pretiče, kad je vozač ispred dao znak, kad ne možeš da se vratiš u traku, zaustavnom i sporom trakom, preko neisprekidane linije, prevoj/nepregledna krivina i tunel (osim sa ≥2 trake u smeru), pred raskrsnicom, prelaz preko pruge, kod pešačkog prelaza. Pitanje traži tačne stavke sa liste — otvori karticu za celu tabelu.';
X[9718] = { x: 'Preticanje se vrši sa LEVE strane (ZOBS čl. 53 st. 1) — desna strana je izuzetak, ne pravilo.' };
X[9722] = { x: 'Kad je vozilo zauzelo položaj za skretanje ULEVO i daje znak — pretičeš ga SA DESNE strane (ZOBS čl. 53 st. 2). Upamti: skreće ulevo → pretičeš zdesna (uz tramvaj po sredini, ovo je najčešći slučaj desne strane — vidi karticu).' };
X[9729] = { x: 'Na putu sa ≥2 trake u istom smeru, brže kretanje vozila u jednoj traci od druge NE SMATRA SE preticanjem (ZOBS čl. 53 st. 4) — zato je dozvoljeno i "prolaženje s desne".' };
X[10476] = { x: 'U naselju, na putu sa ≥2 trake u istom smeru, prolaženje s desne strane vozila (koje nije uz desnu ivicu) ne smatra se preticanjem (ZOBS čl. 53 st. 5).' };
X[9736] = { x: 'Vozač kome je dat znak za preticanje dužan je da POMERI VOZILO KA DESNOJ IVICI kolovoza (ZOBS čl. 54).' };
X[9738] = { x: "Vozač koga pretiču NE SME DA POVEĆAVA BRZINU (ZOBS čl. 54) — klasika na testu. Usporavanje mu NIJE obaveza — dužan je samo da ne ubrzava i da se, kad mu je dat znak, pomeri ka desnoj ivici kolovoza." };
X[9743] = { x: 'Preticanje smeš SAMO kad ima dovoljno prostora za bezbedno izvođenje i kad ne ometaš vozila iz suprotnog smera, odnosno ne ugrožavaš druge (ZOBS čl. 55 st. 1-2). Pitanje traži OBA uslova — "rastojanje 0,5 m" i "nema poledice" nisu zakonski uslovi.' };
X[9863] = { x: 'Obilaženje smeš samo ako ne ugrožavaš druge i kad ima dovoljno prostora (ZOBS čl. 55) — ista dva uslova kao za preticanje.' };
X[9755] = { x: pretZabrane };
X[9763] = { x: pretZabrane };
X[9766] = { x: pretZabrane };
X[9794] = { x: pretZabrane };
X[10480] = { x: pretZabrane };
X[10481] = { x: "Na putu sa po jednom trakom po smeru: tunel, prevoj i nepregledna krivina su ZABRANJENI za preticanje (čl. 55) — dozvola važi tek sa najmanje 2 trake u tvom smeru. Most, vijadukt, nadvožnjak, podvožnjak i opasan uspon, odnosno nizbrdica NISU na listi iz čl. 55 — tamo preticanje samo po sebi nije zabranjeno (osim ako ga zabrani signalizacija)." };
X[10483] = { x: 'Ne pretiče se i ne obilazi vozilo koje se zaustavilo (ili se zaustavlja) radi propuštanja pešaka, niti vozilo koje se približava pešačkom prelazu — pešak može biti zaklonjen (čl. 55).' };
X[10484] = { x: "Lista zabrana preticanja/obilaženja (ZOBS čl. 55 i 57): kolona (posebno pod pratnjom), kad te neko već pretiče, kad je vozač ispred dao znak, kad ne možeš da se vratiš u traku, zaustavnom i sporom trakom, preko neisprekidane linije, prevoj/nepregledna krivina i tunel (osim sa najmanje 2 trake u smeru), pred raskrsnicom, prelaz preko pruge, kod pešačkog prelaza. Pitanje traži tačne stavke sa liste — otvori karticu za celu tabelu. Zamka: zabranjeno je preticanje preko neisprekidane linije SA korišćenjem trake za suprotni smer — sámo postojanje neisprekidane linije, dok suprotnu traku ne koristiš, nije na listi, kao ni dvosmerni put bez označenih saobraćajnih traka." };
X[9795] = { x: 'Preticanje JESTE dozvoljeno: u podvožnjaku i na nadvožnjaku (nisu na listi zabrana!) i na raskrsnici kad se krećeš putem SA prvenstvom prolaza (ZOBS čl. 57 st. 2). Test voli da pomeša podvožnjak sa tunelom — tunel je zabranjen, podvožnjak nije.' };
X[9834] = { x: 'Ako se posle obilaženja ne bi mogao bezbedno vratiti u svoju traku — obilaženje NIJE dozvoljeno (ZOBS čl. 55 st. 3 t. 5).' };
X[9840] = { x: "Pri preticanju drži potrebno ODSTOJANJE I RASTOJANJE od vozila koje pretičeš — bezbedan bočni razmak je tvoja obaveza. Zamka: formule i brojke iz ostalih odgovora (polovina zaustavnog puta, najmanje 1 m) nisu propisan uslov — zakon ne zadaje cifre, već potrebno odstojanje i rastojanje bez ometanja i ugrožavanja." };
X[9841] = { x: "Posle preticanja/obilaženja: vrati se u traku kojom si se kretao, bez ometanja i ugrožavanja drugih (ZOBS čl. 56). Jedini uslov je bezbedno vraćanje — \"polovina zaustavnog puta vozila koje se pretiče\" je izmišljen broj, a čekanje da se pojavi vozilo iz suprotnog smera je prekasno: vraćaš se čim to možeš bez ometanja." };
X[9842] = { x: 'Na putu BEZ prvenstva prolaza: preticanje neposredno ispred i na raskrsnici NIJE dozvoljeno (ZOBS čl. 57 st. 1).' };
X[9843] = { x: 'Neposredno ISPRED raskrsnice sa kružnim tokom preticanje NIJE dozvoljeno — a NA samoj kružnoj raskrsnici JESTE. Pamti: "ispred ne, na njemu da".' };
X[9844] = { x: 'NA raskrsnici sa kružnim tokom preticanje JE dozvoljeno (kružni tok je izuzetak od zabrane na raskrsnici). Ispred nje — nije.' };
X[9845] = { x: 'Kad se krećeš putem SA prvenstvom prolaza, preticanje neposredno ispred i na raskrsnici JE dozvoljeno (ZOBS čl. 57 st. 2).' };
X[9846] = { x: 'Na putu sa prvenstvom, vozilo koje na raskrsnici skreće ULEVO pretičeš SA DESNE strane (ZOBS čl. 57 st. 2 t. 1).' };
X[9832] = { x: 'Sneg na putu SAM PO SEBI ne zabranjuje preticanje — takve zabrane nema u zakonu; važe opšti uslovi (prostor, bezbednost, vidljivost).' };
X[10475] = { x: 'Tramvaj na šinama po SREDINI kolovoza pretiče se SAMO SA DESNE strane — i to ako između njega i desne ivice postoji traka (ZOBS čl. 53 st. 3).' };
X[10485] = { x: 'Obilaženje trakom za suprotni smer: samo kad ima dovoljno prostora za bezbedno izvođenje i bez ometanja vozila iz suprotnog smera (čl. 55).' };
X[10486] = { x: 'Ostrvo/objekat na sredini DVOSMERNOG kolovoza obilazi se SA DESNE strane (ZOBS čl. 58 st. 1).' };
X[10487] = { x: 'Na JEDNOSMERNOM putu ostrvo na sredini sme da se obilazi SA OBE strane, ako znakom nije drugačije određeno (ZOBS čl. 58 st. 2).' };
BYSUB[134] = 'preticanje';

// --- Porodice znakova (subs 155-160) + prvenstvo za 166 i 131 ---
BYSUB[155] = 'znakovi-porodice';
BYSUB[156] = 'znakovi-porodice';
BYSUB[157] = 'znakovi-opasnosti';
BYSUB[158] = 'znakovi-naredbi';
// BYSUB[159] — UKINUTO 05.09.2026: kartica je podeljena na šest manjih (deoba-znakova-obavestenja),
// pa pitanja podoblasti 159 dobijaju karticu PO PITANJU (X[id].card), ne po podoblasti.
BYSUB[160] = 'znakovi-porodice';
BYSUB[166] = 'policajac-znaci';   // znaci ovlašćenog lica — vrh hijerarhije
BYSUB[131] = 'prvenstvo-prolaza';   // opšte odredbe (hijerarhija postupanja)


BYSUB[118] = 'uredjaji-oprema';        // sklopovi, uređaji i oprema vozila
BYSUB[103] = 'vozac-zdravlje-alkohol'; // psihofizički uslovi, umor, alkohol
BYSUB[91] = 'razno-pravila';           // ko reguliše i ko kontroliše saobraćaj
BYSUB[163] = 'svetlosne-oznake';       // svetlosne oznake na putu (smerokazi, štapovi, table)
// BYSUB[168] — UKINUTO 04.09.2026: podoblast je o teretu i njegovom obeležavanju, a kartica
// „Vozilo, registracija i tehnički pregled" o teretu nema nijednu reč (oba pitanja su bez nje).
BYSUB[94] = 'slicni-pojmovi';         // opšti pojmovnik (vozač, pešak, kolona, mase...)
BYSUB[139] = 'pokazivaci';            // zvučni i svetlosni znak upozorenja
BYSUB[161] = 'oznake-kolovoz';
BYSUB[162] = 'semafori';
BYSUB[178] = 'iskljucenje';


BYSUB[133] = 'skretanje';
BYSUB[132] = 'kretanje-po-putu';   // 28 od 29 pitanja te podoblasti nisu o pokazivačima
BYSUB[139] = 'pokazivaci';
BYSUB[140] = 'parkiranje';


BYSUB[142] = 'svetla';
// BYSUB[144] — UKINUTO 04.09.2026: podoblast je o kretanju pešaka po putu (gde i kojom stranom),
// a kartica govori vozaču kako da propusti pešaka — drugoj strani istog susreta.
BYSUB[145] = 'pesaci-bicikli';
BYSUB[146] = 'pruga';
BYSUB[164] = 'pruga';
BYSUB[109] = 'put-pojmovi';
BYSUB[115] = 'put-pojmovi';
// BYSUB[91] uklonjen — pitanja o načelima imaju svoje tekstove, zbirna kartica tu ne pomaže
BYSUB[147] = 'autoput';
BYSUB[126] = 'vozilo-tehnika';
BYSUB[127] = 'vozilo-tehnika';
BYSUB[138] = 'razno-pravila';
BYSUB[141] = 'razno-pravila';
BYSUB[143] = 'razno-pravila';
BYSUB[149] = 'razno-pravila';
BYSUB[165] = 'razno-pravila';


BYSUB[182] = 'kazne';


// --- Prvenstvo prolaza (sub 136), tekstualna ---
const hijer = 'Hijerarhija postupanja (ZOBS čl. 20): naredbe ovlašćenog lica > svetlosni znak (semafor) > saobraćajni znak > oznake na kolovozu > pravila saobraćaja. Kad se dva izvora ne slažu, postupaš po JAČEM.';
X[9959] = { x: 'Pri skretanju ULEVO propuštaš vozila koja iz suprotnog smera idu pravo ili skreću udesno (ZOBS čl. 47) — levo skretanje je "najslabije" na raskrsnici bez druge regulacije.' };
X[9974] = { x: 'Tramvaj se propušta U SVIM SLUČAJEVIMA (i kad ti dolazi sleva!), osim ako saobraćajnim znakom nije drugačije određeno — šinsko vozilo teško staje.' };
X[9996] = { x: 'Sa zemljanog puta (ili površine bez javnog saobraćaja) ulaziš kao "gost": propuštaš SVA vozila na putu na koji se uključuješ, čak i ona koja dolaze sleva (ZOBS čl. 47 st. 1).' };
X[10459] = { x: 'Pravilo DESNE strane (ZOBS čl. 47 st. 3): kad prvenstvo nije regulisano ničim drugim, propuštaš vozilo koje dolazi sa tvoje desne strane.' };
const stazaTraka = 'Pri skretanju preko biciklističke staze/trake propuštaš bicikle koji se njome kreću (ZOBS čl. 47 st. 2) — staza je njihova "traka sa prvenstvom".';
X[10497] = { x: stazaTraka };
X[10498] = { x: stazaTraka };
// --- Raskrsnica (sub 137) ---
X[10006] = { x: 'Približavanje raskrsnici (ZOBS čl. 48): prilagodi vožnju USLOVIMA na raskrsnici i vozi brzinom pri kojoj možeš da se zaustaviš i propustiš one koji imaju prvenstvo.' };
X[10007] = { x: 'Prestrojavanje se vrši NA DOVOLJNOM ODSTOJANJU PRED raskrsnicom (ZOBS čl. 48 st. 2) — zauzmi traku za svoj smer na vreme, ne u poslednji čas.' };
X[10008] = { x: 'Ko ULAZI na put sa prvenstvom prolaza — propušta SVA vozila na tom putu (znak "ustupi prvenstvo" ili STOP na tvom prilazu).' };
const gustina = 'ZOBS čl. 49: ne ulazi u raskrsnicu — ni sa prvenstvom, ni na zeleno — ako bi zbog gužve stao NA raskrsnici ili pešačkom prelazu i blokirao poprečni saobraćaj. Zeleno svetlo nije dozvola da zapušiš raskrsnicu.';
X[10015] = { x: gustina };
X[10016] = { x: gustina };
// --- Opšte odredbe / hijerarhija (sub 131) ---
X[9513] = { x: hijer };
X[9514] = { x: hijer };
X[9523] = { x: hijer };
X[10434] = { x: 'Signalizacija je jača od opštih pravila saobraćaja (ZOBS čl. 20) — pravila važe tek tamo gde znakovi ne kažu drugačije.' };
X[10435] = { x: hijer };
X[10437] = { x: hijer };
X[10438] = { x: 'Kada je semafor na trepćućem žutom (ili ne radi), a znakova nema — prvenstvo se određuje PRAVILIMA saobraćaja (desna strana). Hijerarhija: čl. 20.' };
X[10439] = { x: hijer };
X[9531] = { x: 'Odstojanje (napred-nazad) i rastojanje (bočno) drži tako da NE IZAZIVAŠ OPASNOST i NE OMETAŠ druge (ZOBS čl. 30ih/42) — oba uslova, bez brojki: zavisi od brzine i uslova.' };
X[9533] = { x: "Predmet/prepreku koja ugrožava bezbednost UKLONI ako time ne ometaš bezbednost saobraćaja — mala obaveza građanske pažnje koju test voli. Obaveštavanje policije ili preduzeća koje održava put je tek rezervna varijanta — dužnost je to samo kad NISI u mogućnosti da ukloniš (ZOBS čl. 22)." };
X[9534] = { x: 'Ako prepreku ne možeš bezbedno da ukloniš: nastavi kretanje, ali OBAVESTI policiju ili preduzeće koje održava put.' };
X[9535] = { x: 'Pažnja na pešake važi za sve tri situacije: koji SU na kolovozu, koji STUPAJU i koji tek POKAZUJU NAMERU da stupe (ZOBS čl. 23 st. 1).' };
X[9536] = { x: 'Pred pešačkim prelazom: brzina takva da u SVAKOJ situaciji koju vidiš ili predvidiš možeš bezbedno da staneš ispred prelaza (ZOBS čl. 23 st. 2).' };
X[9539] = { x: "Zona dece (znakovi o učešću dece): NAROČITA opreznost + brzina koja omogućava blagovremeno zaustavljanje (ZOBS čl. 23 st. 3) — deca su nepredvidiva. Fiksnih 30 km/h je mamac iz zone škole (u naselju 30, van naselja 50 — ZOBS čl. 163) — uz ovaj znak broj nije propisan; a to što su te deca \"uočila i propuštaju te\" ne ukida obavezu naročite opreznosti." };
X[9540] = { x: "Obilaženje autobusa na stajalištu: tako da ne ugroziš lica koja ULAZE ili IZLAZE — očekuj pešake ispred i iza autobusa. Bezuslovno zaustavljanje na putu sa po jednom trakom po smeru važi samo iza vozila za organizovan prevoz DECE (ZOBS čl. 26); iza običnog autobusa zaustavljaš se samo kada putnici pri ulasku/izlasku moraju da pređu preko trake kojom se krećeš (čl. 25)." };
X[9543] = { x: 'Tramvaj na stajalištu bez ostrva: ZAUSTAVI se iza njega dok putnici ulaze/izlaze — oni prelaze preko tvoje trake.' };
X[9546] = { x: 'Vozilo koje prevozi decu (obeleženo) zaustavljeno na putu sa po jednom trakom po smeru: zaustavljaju se vozila iz OBA smera dok deca ulaze/izlaze.' };
X[9557] = { x: 'Telefon za vreme vožnje: SAMO preko opreme koja omogućava razgovor bez upotrebe ruku (zvučnik, slušalica sa mikrofonom). Sve ostalo je prekršaj — i "samo na semaforu".' };
X[9561] = { x: 'Maskiranje/ometanje očitavanja registarskih tablica: ZABRANJENO — bez izuzetaka i "opravdanih razloga".' };
X[10443] = { x: "U naselju: autobusu javnog prevoza koji isključuje sa stajališta i najavljuje pokazivačem — OMOGUĆI uključivanje (posebno pravilo u korist javnog prevoza). Zamka su krajnosti: nisi dužan da se UVEK zaustaviš (staješ samo kad je to potrebno), ali ne smeš ni produžiti kao da imaš bezuslovno prvenstvo." };
// --- Pruga (sub 146) ---
X[10274] = { x: 'Šinsko vozilo na prelazu preko pruge propuštaš UVEK (ZOBS čl. 100 st. 1) — voz ne može da stane niti da skrene.' };
X[10285] = { x: 'Spušten (ili se spušta) uređaj za zatvaranje = zaustavi se ISPRED uređaja i čekaj da se potpuno podigne — ne "provuci se".' };
X[10286] = { x: "Približavanje pruzi: brzina takva da možeš da staneš pred branikom/svetlosnim znakom, odnosno PRE stupanja na prugu (ZOBS čl. 100 st. 2). Obavezno zaustavljanje postoji samo kad je naloženo (ZOBS čl. 101): spušteni branici ili se spuštaju, svetlosni/zvučni znaci najave voza, odnosno prelaz bez branika i bez uređaja za najavu — tamo se prelazi tek posle zaustavljanja i uveravanja da voz ne nailazi. Inače je dužnost da MOŽEŠ da staneš, ne da uvek staneš." };
// --- Autoput/motoput (sub 147) ---
X[10308] = { x: 'Autoput: krajnja DESNA traka je tvoja podrazumevana (ZOBS čl. 104), osim kad je zauzeta kolonom i pri preticanju. Leva nije "brza traka za krstarenje".' };
X[10309] = { x: 'Zaustavna traka NIJE za vožnju (ZOBS čl. 104 st. 2) — izuzetak imaju samo vozila pod pratnjom/sa pravom prvenstva u zagušenju i služba održavanja.' };
const apZaust = 'Na autoputu/motoputu zaustavljanje i parkiranje su dozvoljeni SAMO na posebno uređenim i obeleženim mestima (odmorišta) — ZOBS čl. 105.';
X[10318] = { x: "Na autoputu/motoputu zaustavljanje i parkiranje su dozvoljeni SAMO na posebno uređenim i obeleženim mestima (odmorišta) — ZOBS čl. 105. Zaustavna traka nije za slobodno zaustavljanje — ona služi za PRINUDNO zaustavljanje (kvar i slično), i tada vozilo što pre uklanjaš sa puta." };
X[10319] = { x: "Na autoputu/motoputu zaustavljanje i parkiranje su dozvoljeni SAMO na posebno uređenim i obeleženim mestima (odmorišta) — ZOBS čl. 105. Zaustavna traka nije mesto za to: po definiciji je namenjena isključivo prinudnom zaustavljanju iz nepredvidivih razloga — neispravnost, iznenadna nesposobnost vozača i slično (ZOBS čl. 7)." };
const apPolu = 'Polukružno okretanje na autoputu/motoputu: ZABRANJENO (kao i kretanje unazad) — ZOBS čl. 105 st. 2. Promašio si izlaz? Voziš do sledećeg.';
X[10320] = { x: apPolu };
X[10321] = { x: apPolu };
X[10328] = { x: 'Kvar na autoputu (ZOBS čl. 105): zaustavi na ZAUSTAVNOJ traci, trougao na najmanje 100 m iza vozila, svi pokazivači, prsluk van vozila — i ukloni vozilo što pre.' };
const apKo = 'Autoputem i motoputem sme se kretati samo: motociklima, putničkim vozilima, teretnim vozilima i autobusima (ZOBS čl. 102). Mopedi, tricikli i četvorocikli NE smeju — iako su motorna vozila, nisu na listi — kao ni vozila koja ne mogu da razviju brzinu veću od 50 km/h.';
X[10558] = { x: apKo };
X[10559] = { x: apKo };
X[10562] = { x: 'Uključivanje/isključivanje SAMO prilaznim putem (petljom) — nikakvo skretanje preko razdelnog pojasa niti vožnja unazad do izlaza (ZOBS čl. 105a/104).' };
// --- Svetla (sub 142) ---
X[10210] = { x: 'DANJU: kratka ili dnevna svetla obavezno uključena (ZOBS čl. 77 st. 1) — u Srbiji se vozi sa svetlima 24/7.' };
X[10211] = { x: 'NOĆU: podrazumevano DUGA svetla (ZOBS čl. 77 st. 2) — a kratka umesto njih u sedam propisanih situacija (vidi karticu).' };
X[10217] = { x: 'Vozilo zaustavljeno na KOLOVOZU noću/u magli: poziciona (parkirna) svetla moraju biti uključena — da te vide.' };
X[10218] = { x: 'Van kolovoza (npr. na obeleženom parkingu) poziciona svetla NE moraju — obaveza važi za vozilo ostavljeno na kolovozu.' };
const kratkaUmesto = 'Sedam situacija za kratka umesto dugih (ZOBS čl. 77 st. 3): zaslepljivanje pri mimoilaženju (uvek ispod 200 m) · ometanje vozača ispred · ulična rasveta · tunel · ometanje šinskog vozila ili plovila · magla · zaustavljeno vozilo. Pitanja traže po dve — nauči celu listu.';
X[10539] = { x: kratkaUmesto };
X[10540] = { x: kratkaUmesto };
X[10541] = { x: kratkaUmesto };
X[10542] = { x: kratkaUmesto };
X[10543] = { x: 'Magla (ZOBS čl. 79): kratka svetla, svetla za maglu, ili OBOJE. Duga po magli su kontraproduktivna — odbijaju se o kapljice.' };
// --- Zvučni/svetlosni znaci upozorenja (sub 139) ---
X[10028] = { x: 'Zvučni znak VAN naselja: upozorenje da prestižeš/obilaziš, ako bi bez njega postojala opasnost nezgode (ZOBS čl. 59).' };
X[10034] = { x: 'Van naselja, pred nepreglednu uzanu krivinu ili prevoj gde je mimoilaženje otežano: zvučni znak je DUŽNOST (ZOBS čl. 59 st. 1 t. 3).' };
X[10037] = { x: 'Trubi se U MERI DOVOLJNOJ da se drugi upozore (ZOBS čl. 59 st. 2) — ne duže; sirena promenljive frekvencije je zabranjena običnim vozilima.' };
X[10040] = { x: 'Dete pored kolovoza koje ne obraća pažnju: zvučni znak je DUŽNOST (ZOBS čl. 59 st. 1 t. 2) — jedina situacija u naselju gde se trubljenje izričito traži.' };
X[10043] = { x: 'Noću umesto trube: SVETLOSNI znak upozorenja (blicanje dugih) — ZOBS čl. 60 st. 2.' };
X[10044] = { x: 'Svetlosni znak upozorenja = uzastopno/naizmenično paljenje DUGIH svetala (ZOBS čl. 60 st. 1), pazeći da ne zaslepiš druge.' };
X[10045] = { x: 'Svetlosni znak smeš i DANJU ako više odgovara uslovima (ZOBS čl. 60 st. 3) — i noću umesto zvučnog, i u naselju pri preticanju.' };
X[10048] = { x: 'Sva 4 pokazivača — lista iz ZOBS čl. 61: ulazak/izlazak putnika, upozorenje na opasnost, izrazito smanjena vidljivost, poslednji u zaustavljenoj koloni van naselja, kretanje unazad, zaustavljanje na kolovozu. Pitanja izvlače po dve stavke.' };


// --- Zaustavljanje i parkiranje (sub 140), tekstualna ---
X[10052] = { x: 'Opšte pravilo iznad svih spiskova: ne zaustavljaj i ne parkiraj tamo gde bi vozilo UGROŽAVALO bezbednost ili ometalo saobraćaj i pešake — čak i ako mesto nije ni na jednoj listi zabrana.' };
X[10054] = { x: 'Van naselja: kad god postoji mogućnost, vozilo ide VAN KOLOVOZA (ZOBS čl. 64 st. 1) — bankina/proširenje pre nego ivica kolovoza.' };
X[10055] = { x: 'Dvosmerni put: zaustavljanje/parkiranje uz DESNU ivicu kolovoza (ZOBS čl. 64 st. 2).' };
X[10057] = { x: 'JEDNOSMERNI put je izuzetak: sme uz desnu ILI levu ivicu (ZOBS čl. 64 st. 2).' };
X[10058] = { x: 'Šine uz desnu ivicu = nema zaustavljanja ni parkiranja (ZOBS čl. 64 st. 3) — šinsko vozilo ne može da te obiđe.' };
X[10060] = { x: "Na sredini kolovoza smeš da staneš ili parkiraš samo na mestu koje je saobraćajnim znakom obeleženo za parkiranje. Sam slobodan prostor nije dovoljan (ZOBS čl. 64 st. 4)." };
X[10065] = { x: "Zabranjeno je zaustavljanje i parkiranje na pešačkom prelazu i na manje od 5 m od njega. U jednosmernoj ulici izuzetak dopušta i manje od 5 m posle prelaza, gledano u dozvoljenom smeru (ZOBS čl. 66 st. 1 t. 1 i st. 2)." };
X[10066] = { x: "Zabranjeno je zaustavljanje i parkiranje na prelazu biciklističke staze preko kolovoza i na manje od 5 m od njega. U jednosmernoj ulici izuzetak dopušta i manje od 5 m posle prelaza, gledano u dozvoljenom smeru (ZOBS čl. 66 st. 1 t. 1 i st. 2)." };
X[10068] = { x: "Zabranjeno je zaustavljanje i parkiranje na prelazu puta preko železničke pruge i na manje od 5 m od prelaza (ZOBS čl. 66 st. 1 t. 2)." };
X[10071] = { x: "Zabranjeno je zaustavljanje i parkiranje na raskrsnici i na manje od 5 m od najbliže ivice poprečnog kolovoza. U jednosmernoj ulici izuzetak dopušta i manje od 5 m posle raskrsnice, gledano u dozvoljenom smeru (ZOBS čl. 66 st. 1 t. 3 i st. 2)." };
X[10073] = { x: "Od ponuđenih mesta zabrana važi za tunel i podvožnjak (ZOBS čl. 66 st. 1 t. 4). Uspon ili put van naselja sami po sebi nisu razlog za zabranu; i tu važi obaveza da vozilo ne ugrožava ili ometa druge (čl. 62)." };
X[10090] = { x: 'Biciklistička staza i traka su saobraćajne površine bicikala — parkiranje na njima je zabranjeno (ZOBS čl. 66).' };
X[10101] = { x: "Na putu sa fizički odvojenim kolovoznim trakama zaustavljanje i parkiranje su zabranjeni, osim ako je to dozvoljeno saobraćajnim znakom. Auto-taksi može da stane radi ulaska ili izlaska putnika (ZOBS čl. 66 st. 1 t. 10 i st. 4)." };
X[10111] = { x: "Na trotoaru zaustavljanje i parkiranje nisu dozvoljeni, osim ako ih dopušta saobraćajna signalizacija. Kada je vozilo parkirano, mora ostati slobodan prolaz za pešake najmanje 1,60 m, koji nije uz ivicu kolovoza (ZOBS čl. 66 st. 1 t. 13)." };
X[10117] = { x: "Na pešačkoj stazi zabranjeni su zaustavljanje i parkiranje (ZOBS čl. 66 st. 1 t. 14). Uslov o prolazu od 1,60 m pripada izuzetku za trotoar i ne dopušta stajanje na pešačkoj stazi." };
X[10120] = { x: "Na delu trotoara namenjenom kretanju lica sa posebnim potrebama zabranjeni su zaustavljanje i parkiranje (ZOBS čl. 66 st. 1 t. 14). Ostavljanje prolaza od 1,60 m ne dopušta zauzimanje tog dela trotoara." };
X[10141] = { x: 'Gde je signalizacijom zabranjen SAOBRAĆAJ vozila, zabranjeno je i zaustavljanje i parkiranje — jače pravilo uključuje slabije.' };
X[10499] = { x: 'Vozilo u kvaru na ŠINAMA: ukloni ga ODMAH; ako ne možeš — odmah preduzmi mere da vozači šinskih vozila budu na vreme upozoreni (ZOBS čl. 63 st. 2).' };
X[10500] = { x: "Od ponuđenih odgovora zabrana se odnosi na blizinu vrha prevoja i nepreglednu krivinu (ZOBS čl. 66 st. 1 t. 5). Sam položaj na nizbrdici ili van naselja nije takva zabrana." };
X[10507] = { x: "Trg, pešačka zona i protivpožarni put: nisu dozvoljeni ni zaustavljanje ni parkiranje (ZOBS čl. 66 st. 1 t. 15)." };
X[10528] = { x: "Pre napuštanja parkiranog vozila moraš preduzeti sve potrebne mere da se ono ne pokrene samo (ZOBS čl. 68)." };
// --- Skretanje i mimoilaženje (sub 133), tekstualna ---
X[9639] = { x: 'Skretanje UDESNO: iz krajnje desne trake, uz desnu ivicu kolovoza (ZOBS čl. 48) — bez "sečenja" iz srednje trake.' };
X[9643] = { x: 'Na JEDNOSMERNOM putu skretanje ulevo vrši se iz krajnje LEVE trake uz LEVU ivicu kolovoza — nema saobraćaja iz suprotnog smera pa je leva ivica tvoja.' };
X[10463] = { x: 'Skretanje ULEVO na dvosmernom putu: iz krajnje leve trake SVOJE kolovozne trake — uz razdelnu liniju, ne preko nje (ZOBS čl. 48).' };
const poluList = 'Polukružno okretanje je zabranjeno (ZOBS čl. 50): tunel, most, vijadukt, podvožnjak, nadvožnjak, smanjena vidljivost, nedovoljna preglednost, nedovoljna širina puta. Ista lista "opasnih mesta" kao za preticanje — nauči je jednom.';
X[9673] = { x: poluList };
X[10470] = { x: poluList };
X[9689] = { x: 'Mimoilaženje (ZOBS čl. 51): po potrebi pomeri vozilo ka DESNOJ ivici i ostavi dovoljno bočno rastojanje sa svoje leve strane.' };
X[9690] = { x: "Pri mimoilaženju sa PEŠAKOM: drži bezbedno rastojanje — pešak nema karoseriju; posebno noću i po kiši. \"Najmanje 1 m\" je izmišljena vrednost — zakon broj ne propisuje, traži samo bezbedno rastojanje (ZOBS čl. 51); a trubljenje da se pešak skloni nije dužnost i ne zamenjuje rastojanje." };
X[9691] = { x: 'Prepreka u TVOJOJ traci = ti nemaš prednost: uspori, po potrebi se zaustavi i propusti vozila iz suprotnog smera (oni idu svojom stranom).' };
X[9698] = { x: 'Kad je mimoilaženje onemogućeno zbog širine: zaustavlja se onaj kome je to LAKŠE s obzirom na karakteristike puta i saobraćajnu situaciju — pravilo zdravog razuma pretočeno u zakon.' };
X[9699] = { x: 'Oba vozila skreću ulevo iz suprotnih smerova: mimoilaze se sa DESNE strane (prolaze jedno pored drugog desnim bokovima).' };
const uspon = 'Označen opasan uspon/nizbrdica: po pravilu se zaustavlja vozilo koje ide NIZ nagib (onome koje ide uz nagib je teško ponovo da krene). Izuzetno staje ono UZ nagib kada mu je zaustavljanje očigledno lakše (npr. prepreka/proširenje na njegovoj strani). Čitaj pažljivo koji smer pitanje traži.';
X[9702] = { x: uspon };
X[9703] = { x: uspon };
X[10474] = { x: 'Redosled "jačine" pri mimoilaženju na usponu (ko se teže zaustavlja i kreće, taj ima prednost): skup vozila → autobus → teretno → radna mašina/traktor → putničko vozilo. Lakše vozilo se povlači.' };
// --- Radnje vozilom (sub 132), tekstualna ---
const naglo = 'Nagla promena načina vožnje (kočenje, usporavanje, menjanje trake) dozvoljena je SAMO za izbegavanje neposredne opasnosti (ZOBS čl. 32) — sve ostalo mora postepeno i predvidivo.';
X[9574] = { x: naglo };
X[10456] = { x: naglo };
const radnja = 'Redosled svake radnje vozilom (ZOBS čl. 32): 1) UVERI SE da možeš bezbedno, 2) DAJ ZNAK pokazivačem, 3) izvrši radnju — znak traje SVE VREME radnje i prestaje čim je završiš. Zato je kod pitanja o pokazivačima "potvrda pravca posle raskrsnice" netačan odgovor — žmigavac tome ne služi (znak obaveštenja s tim imenom postoji, ali to je druga priča).';
X[9580] = { x: radnja };
X[9581] = { x: radnja };
X[9582] = { x: radnja };
X[10451] = { x: radnja };
X[9593] = { x: 'Osnovno: vozilo se kreće DESNOM stranom kolovoza u smeru kretanja (ZOBS čl. 33).' };
X[9603] = { x: 'Drži se što bliže DESNOJ ivici kolovoza (ZOBS čl. 33) — leva strana je za preticanje i mimoilaženje, ne za krstarenje.' };
X[9612] = { x: 'Dvosmerni put sa ≥4 trake: ne prelazi na kolovoznu polovinu namenjenu suprotnom smeru — ni za preticanje (ZOBS čl. 34).' };
X[9616] = { x: 'Zabrana je bezuslovna: na dvosmernom putu sa TRI trake ne smeš u traku uz LEVU ivicu puta u svom smeru (ZOBS čl. 36 st. 2). Zakon tu ne daje nijedan izuzetak, pa su obe ponude koje tu traku dozvoljavaju netačne — ni preticanje ni zastoj je ne otključavaju, jer je namenjena vozilima iz suprotnog smera. Odatle sledi i gde se pretiče: srednjom trakom, po opštim pravilima preticanja.' };
X[9619] = { x: 'Fizički odvojene kolovozne trake: prelazak na suprotnu kolovoznu traku je apsolutno zabranjen (ZOBS čl. 34).' };
X[9622] = { x: 'Jednosmerni put: vožnja u suprotnom smeru zabranjena — uključujući i kretanje unazad "samo malo".' };
X[10454] = { x: 'U zastoju na putu sa odvojenim kolovoznim trakama pravi se slobodan prolaz za vozila POD PRATNJOM i SA PRAVOM PRVENSTVA (ZOBS čl. 104 st. 6) — "koridor spasa".' };
// --- Pešaci (sub 145), tekstualna ---
X[10244] = { x: 'Pešak van naselja ide što bliže LEVOJ ivici kolovoza — u susret vozilima, da ih vidi (suprotno od vozila!).' };
X[10245] = { x: 'Pridržavanje za vozilo u pokretu (kolica, romobil, sanke...) — zabranjeno: pad je pitanje trenutka.' };
X[10248] = { x: 'Pešaci na autoputu su zabranjeni, ali zabrana NE važi za: lica koja otklanjaju posledice nezgode/kvara i vozača prinudno zaustavljenog vozila (oni tu moraju biti — sa prslukom).' };
const stopPrelaz = 'Kad ti je prolaz ZABRANJEN (semafor ili znak policajca), zaustavljaš se ISPRED pešačkog prelaza — prelaz ostaje slobodan za pešake (ZOBS čl. 99 st. 1).';
X[10249] = { x: stopPrelaz };
X[10250] = { x: stopPrelaz };
const propustiPesaka = 'I kad ti je prolaz DOZVOLJEN (zeleno/znak policajca), pešaka koji je već na prelazu ili stupa na njega — PROPUŠTAŠ (posebno pri skretanju). Zeleno nije oružje.';
X[10253] = { x: propustiPesaka };
X[10257] = { x: propustiPesaka };
const detePrelaz = 'DETE na pešačkom prelazu (ili se sprema da stupi): obavezno ZAUSTAVI vozilo i propusti ga — kod dece, nemoćnih i slepih lica nema procene "stići će da pređe" (ZOBS čl. 99).';
X[10264] = { x: "DETE na pešačkom prelazu (ili se sprema da stupi): obavezno ZAUSTAVI vozilo i propusti ga — kod dece, nemoćnih i slepih lica nema procene \"stići će da pređe\" (ZOBS čl. 99). Zvučni znak je dužnost kad je dete PORED kolovoza i ne obraća pažnju na vozila (čl. 59) — kad dete već stupa na prelaz, trubljenje ne zamenjuje zaustavljanje." };
X[10552] = { x: detePrelaz };
X[10271] = { x: 'Organizovana kolona pešaka se NE preseca — čekaš da cela prođe (ZOBS čl. 98).' };
X[10551] = { x: 'Skretanje na bočni put BEZ pešačkog prelaza: pešake koji su VEĆ STUPILI na kolovoz tog puta propuštaš (ZOBS čl. 96).' };
X[10553] = { x: propustiPesaka };
X[10703] = { x: 'Neregulisan pešački prelaz: brzina takva da u svakoj situaciji koju vidiš ILI IMAŠ RAZLOGA DA PREDVIDIŠ možeš bezbedno da staneš ispred prelaza (ZOBS čl. 23 i 96).' };
// --- Moped/motocikl u saobraćaju (sub 144), tekstualna ---
const mopedNeSme = 'Vozač mopeda/motocikla NE SME (ZOBS čl. 90): da ispušta upravljač, sklanja noge sa pedala odnosno oslonca, da se pridržava za drugo vozilo, vodi/vuče/potiskuje druga vozila ili sam bude vučen, prevozi predmete koji ometaju upravljanje, niti da koristi slušalice na OBA uva. Sve što ugrožava ravnotežu i pažnju — zabranjeno.';
X[10234] = { x: mopedNeSme };
X[10235] = { x: mopedNeSme };
X[10236] = { x: mopedNeSme };
X[10243] = { x: mopedNeSme };
const putnikAlko = 'Na mopedu/triciklu/motociklu ne smeš prevoziti lice pod uticajem alkohola ili psihoaktivnih supstanci — putnik na dvotočkašu aktivno učestvuje u ravnoteži.';
X[10240] = { x: putnikAlko };
X[10241] = { x: putnikAlko };
X[10242] = { x: 'Priključno vozilo uz moped/motocikl: dozvoljeno samo SA DVA TOČKA i namenjeno prevozu TERETA (ne lica).' };
const kaciga = 'Zakopčana zaštitna kaciga je obavezna za vozača (i putnika) mopeda, motocikla i ČETVOROCIKLA — četvorocikl je iznenađenje koje test voli; laki/teški tricikl sa kabinom ima druga pravila (vidi pitanje).';
X[10546] = { x: kaciga };
X[10547] = { x: kaciga };
// --- Osnovna načela (sub 91) ---
X[7921] = { x: 'NEPOSREDNO regulisanje saobraćaja na putevima vrše UNIFORMISANI policijski službenici (ZOBS čl. 157) — "neposredno" znači znacima na licu mesta; zato komunalna policija i inspektori nisu tačni.' };
X[7922] = { x: "Kontrolu saobraćaja policijski službenici po pravilu vrše u uniformi, a izuzetno kontrolu vozača i vozila mogu vršiti u građanskom odelu (Pravilnik o načinu vršenja kontrole i neposrednog regulisanja saobraćaja, čl. 2). Zato su tačna oba ponuđena policijska odgovora; kontrola nije isto što i neposredno regulisanje." };
X[7923] = { x: 'U ZONI ŠKOLE regulisanje mogu vršiti i školske saobraćajne patrole i patrole građana (uz policiju) — poseban izuzetak za bezbednost đaka.' };
X[7924] = { x: 'Na RADOVIMA NA PUTU saobraćaj mogu regulisati i radnici izvođača/upravljača puta (uz policiju) — drugi poseban izuzetak.' };
X[7925] = { x: "ZOBS čl. 3 propisuje oba načela: učesnik ne sme da ometa, ugrožava ili povredi druge i mora da preduzme sve potrebne mere radi izbegavanja ili otklanjanja opasnih situacija nastalih ponašanjem drugih, ali samo ako sebe ili drugog time ne dovodi u opasnost." };
X[7927] = { x: 'Vlasnik/korisnik vozila odgovara da njegovo vozilo u saobraćaju bude TEHNIČKI ISPRAVNO — odgovornost postoji i kad ne voziš ti.' };
X[7928] = { x: 'Odgovornost PORODICE za decu u saobraćaju: sticanje znanja, veština i navika + pozitivni stavovi — zakon izričito imenuje porodicu, ne samo školu.' };
X[7929] = { x: 'Isto kao prethodno: porodica unapređuje i učvršćuje pozitivne stavove i ponašanja dece značajna za bezbedno učešće.' };
// --- Isključenje vozača i vozila (sub 178) ---
const isklj279 = 'Lista razloga za PRIVREMENO isključenje vozača (ZOBS čl. 279): umor/bolest/povreda, alkohol, psihoaktivne supstance, ODBIJANJE ispitivanja ili stručnog pregleda, sopstveni zahtev za analizu krvi, nepoštovanje ograničenja koja su vozaču lično naložena, nasilnička vožnja, vožnja bez dozvole za tu kategoriju ili sa isteklom dozvolom, nečitljiva strana dozvola, vožnja za vreme zaštitne mere ili za vreme trajanja isključenja, i vožnja bez zakopčane kacige. Obično prekoračenje brzine NIJE na listi — čest mamac. Pitanja izvlače po dve stavke — nauči celu listu.';
X[8552] = { x: isklj279 };
X[8553] = { x: isklj279 };
X[8555] = { x: isklj279 };
X[8556] = { x: isklj279 };
X[8557] = { x: isklj279 };
X[8558] = { x: isklj279 };
X[10701] = { x: "I vožnja BEZ ZAKOPČANE homologovane kacige (vozač ili putnik bez nje) je razlog za privremeno isključenje vozača motocikla/mopeda — kaciga nije preporuka nego uslov. Svetloodbojni prsluk mora da se NALAZI u putničkom, teretnom vozilu i autobusu (ZOBS čl. 30) — za vozača mopeda/motocikla nošenje prsluka u vožnji nije propisan uslov, pa ni razlog za isključenje." };
X[8559] = { x: 'Alkotest po nalogu ovlašćenog lica: dužan si da postupiš BEZ ODLAGANJA — odbijanje znači isključenje i obavezno zadržavanje.' };
X[8560] = { x: 'Da — obaveza testiranja je bezuslovna; svoje neslaganje rešavaš zahtevom za analizu krvi, ne odbijanjem.' };
X[8561] = { x: 'Analizu krvi/urina možeš zahtevati AKO OSPORAVAŠ rezultat alkometra — to je tvoj pravni lek protiv uređaja.' };
X[8562] = { x: 'Zahtev za analizu se podnosi U PISANOJ FORMI, NA LICU MESTA, u zapisnik — ne naknadno "sutra u stanici".' };
const premesti = 'Vozilo isključenog vozača (ili isključeno vozilo) koje OMETA saobraćaj policijski službenik može premestiti ili naložiti premeštanje — bezbednost saobraćaja je preča od parkiranog dokaza.';
X[8563] = { x: premesti };
X[8564] = { x: premesti };
X[8565] = { x: premesti };
X[8566] = { x: premesti };
const troskoviPrem = 'Troškove premeštanja snosi VLASNIK, odnosno korisnik vozila — ne policija, ne "budžet".';
X[8567] = { x: troskoviPrem };
X[8568] = { x: troskoviPrem };
X[8569] = { x: 'Prag za OBAVEZNO zadržavanje do otrežnjenja (najduže 12 sati): sadržaj alkohola veći od 1,20 mg/ml — ili odbijanje testiranja.' };
X[8570] = { x: "Odbijanje ispitivanja na alkohol/supstance = isključenje + OBAVEZNO zadržavanje — tretira se kao najteži slučaj. Sprovođenje na analizu nije posledica odbijanja: analizu krvi, odnosno urina vozač SAM zahteva kad osporava rezultat ispitivanja." };
const uslovnoZadrz = 'Ispod praga obaveznog zadržavanja: vozač pod dejstvom alkohola može biti zadržan USLOVNO — ako izražava nameru da nastavi vožnju, odnosno ako postoji opasnost da će nastaviti sa činjenjem prekršaja.';
X[8571] = { x: uslovnoZadrz };
X[8572] = { x: uslovnoZadrz };
X[8575] = { x: "Na KONTROLNI tehnički pregled vozilo se upućuje kad policijski službenik POSUMNJA u tehničku ispravnost — sumnja je dovoljna, ne mora kvar da bude očigledan. Posle nezgode sa oštećenim vitalnim sklopovima i posle isključenja zbog neispravnosti obavlja se VANREDNI pregled — to nisu razlozi za kontrolni." };
X[8576] = { x: 'Kontrolni pregled se vrši u objektu za tehnički pregled KOJI ODREDI policijski službenik — ne u onom koji vozač izabere.' };
X[8577] = { x: 'Po nalogu za kontrolni pregled postupaš BEZ ODLAGANJA i omogućavaš pregled — kao i kod alkotesta.' };
X[8578] = { x: "Da — bez odlaganja; odbijanje nosi sankcije i isključenje vozila. Obaveza je bezuslovna: ni potvrda o tehničkoj ispravnosti ne oslobađa (ona dokazuje stanje od ranije, kontrolni pregled proverava sadašnje), niti je uslov da vozilo bude neopterećeno." };
X[8579] = { x: 'Troškove kontrolnog pregleda snosi vlasnik/korisnik SAMO ako se utvrdi neispravnost — ako je vozilo ispravno, ne plaćaš (fer princip: pogrešna sumnja ne košta tebe).' };
const iskljVozilo = 'Vozilo se isključuje iz saobraćaja (ZOBS čl. 289) kada: ima neispravan uređaj za upravljanje ili zaustavljanje ili toliko neispravne druge uređaje da ugrožava bezbednost, nije upisano u jedinstveni registar ili mu je istekla registraciona nalepnica, nosi nepropisne tablice, ima nedozvoljeno ugrađene uređaje za posebne znake (rotacije/sirene), pojedinačno je proizvedeno ili prepravljeno bez ispitivanja, ili učestvuje u saobraćaju za vreme trajanja isključenja.';
X[8584] = { x: iskljVozilo };
X[8588] = { x: iskljVozilo };
X[8590] = { x: iskljVozilo };
X[8592] = { x: iskljVozilo };
X[8593] = { x: 'Troškovi obezbeđenja isključenog vozila i tereta: vlasnik, odnosno korisnik — isto kao premeštanje.' };
X[8594] = { x: 'Vozilo na putu na kome mu kretanje nije dozvoljeno: naređenje da BEZ ODLAGANJA, NAJKRAĆIM putem napusti taj put.' };
X[8597] = { x: 'Ako bi isključenje na licu mesta ometalo saobraćaj: vozač POD NADZOROM policijskog službenika odvozi vozilo do prvog mesta gde isključenje ne smeta.' };
X[8598] = { x: 'Isključenje vozila traje DO PRESTANKA RAZLOGA — nema fiksnog roka: popraviš/registruješ → vraćaš se u saobraćaj.' };
const vanredniPregled = 'Vanredni tehnički pregled posle isključenja zbog neispravnosti: po pravilu u objektu gde je vršen kontrolni pregled; u drugom objektu samo kad je to opravdano (udaljenost, vrsta kvara).';
X[8599] = { x: vanredniPregled };
X[8600] = { x: vanredniPregled };
X[8601] = { x: 'Uz isključenje vozila oduzimaju se REGISTARSKE TABLICE, uz potvrdu o oduzimanju — vozilo fizički ostaje, ali bez tablica ne sme na put.' };
X[8603] = { x: 'Tablice se vraćaju kad se utvrdi da su PRESTALI RAZLOZI isključenja (npr. dokaz o ispravnosti/registraciji).' };
X[8606] = { x: 'Nepropisno parkirano vozilo: naređenje da se ODMAH ukloni, pod pretnjom prinudnog izvršenja ("pauk").' };
X[8609] = { x: 'Ne ukloniš u roku iz rešenja → vozilo se uklanja na određeno mesto O TROŠKU vozača/vlasnika.' };
X[8611] = { x: 'Za štete od početka uklanjanja do preuzimanja vozila odgovara PRAVNO LICE/PREDUZETNIK kome je povereno uklanjanje — ne ti (tvoj je samo trošak uklanjanja).' };
const privodjenje = 'Prekršajnom sudu se PRIVODI vozač zatečen u prekršaju koji NASTAVLJA ili izražava nameru da nastavi sa prekršajem; zadržava se samo ako privođenje odmah nije moguće.';
X[10714] = { x: privodjenje };
X[10715] = { x: privodjenje };
X[10716] = { x: 'Ako vozač ne postupi po naređenju da napusti put na kome mu kretanje nije dozvoljeno — vozilo se ISKLJUČUJE iz saobraćaja.' };
X[10717] = { x: 'Ne predaš tablice isključenog vozila → privođenje prekršajnom sudu + angažuje se stručno lice da tablice skine — izbegavanje ne pomaže.' };


// --- Vozilo: uređaji i oprema (sub 118), tekstualna ---
X[8678] = { x: 'Detalje tehničkih uslova propisuje Pravilnik o podeli motornih i priključnih vozila i tehničkim uslovima — ZOBS daje okvir, pravilnik cifre.' };
X[8681] = { x: 'Gabariti dvotočkaša: najveća dozvoljena DUŽINA mopeda/motocikla/tricikla/četvorocikla je 4,00 m.' };
X[8688] = { x: 'Najveća dozvoljena VISINA mopeda/motocikla/tricikla/četvorocikla: 2,50 m (kao i za ostala vozila).' };
X[8682] = { x: 'Prikolica uz moped/motocikl: najviše 1 METAR širine — šira bi virila iz gabarita vučnog vozila.' };
X[8695] = { x: "Kočni sistem mopeda/motocikla mora da ostvari RADNO kočenje (parkirno nije obavezno kod dvotočkaša — drže se na osloncu). Ni pomoćno kočenje nije propisano za njih — obavezna je samo funkcija radnog kočenja." };
const kocSvi = 'Radno kočenje mora dejstvovati NA SVE TOČKOVE (i kod mopeda, motocikala, tricikala i četvorocikala) — kočenje samo jednim točkom je neispravnost.';
X[8707] = { x: kocSvi };
X[8709] = { x: kocSvi };
X[8710] = { x: "Uređaji koji DAJU ili ODBIJAJU svetlost mimo propisa (zatamnjene folije, neonke, svetleći prstenovi i trake bez homologacije) — zabranjeni. Zabrana je bezuslovna: nema izuzetka ni po boji svetlosti (napred/pozadi), ni po tome da li uređaj nekoga ometa." };
X[8711] = { x: 'Napred NIKAD crveno: uređaji na prednjoj strani ne smeju davati crvenu svetlost vidljivu spreda — crveno je rezervisano za zadnji kraj vozila.' };
X[8712] = { x: 'Nazad NIKAD belo (osim svetla za vožnju unazad i osvetljenja tablice) — belo pozadi zbunjuje: izgleda kao da ti vozilo dolazi u susret.' };
X[8713] = { x: 'Udvojeni (parni) svetlosni uređaji: ista veličina, ista boja, ujednačen intenzitet — asimetrija je neispravnost.' };
X[8719] = { x: 'Glavni farovi: BELA svetlost.' };
X[8720] = { x: 'Kontrolna lampa DUGIH svetala na tabli: PLAVE boje (standard u svim vozilima).' };
X[8721] = { x: 'Za kratka svetla kontrolna lampa NIJE obavezna (najčešće zelena postoji, ali ne mora).' };
X[8724] = { x: 'Domet KRATKIH svetala (osim traktora): najmanje 40 m, najviše 80 m.' };
X[8726] = { x: "Domet DUGIH svetala: najmanje 100 m — zato su \"duga\". Mamci 40 i 80 su cifre KRATKIH svetala (ona osvetljavaju najmanje 40, a najviše 80 m)." };
X[8728] = { x: 'Kratko svetlo traktora/mopeda/tricikla/četvorocikla sme biti simetrično ili desnosmerno asimetrično (asimetrija osvetljava desnu ivicu, ne zaslepljuje susret).' };
X[8729] = { x: 'Svetla za maglu: osvetljavaju NAJVIŠE 35 m — široko i nisko, ne daleko.' };
X[8730] = { x: 'Kratko svetlo MOPEDA: najmanje 10 m, najviše 50 m (slabije od motocikla — moped je sporiji).' };
X[8732] = { x: 'Svetlo za vožnju unazad: BELE boje — jedini dozvoljeni beli izvor pozadi (uz osvetljenje tablice).' };
X[8735] = { x: 'Svetla za maglu: BELA ili ŽUTA.' };
X[8737] = { x: 'Dnevna svetla: SAMO bela (žuta nisu dozvoljena kao dnevna).' };
X[8745] = { x: 'Moped/motocikl pozadi: jedno ili dva poziciona svetla CRVENE boje.' };
X[8752] = { x: 'Vozila na 2 točka (i uska na 3): JEDAN zadnji katadiopter, crven, NE-trouglast (trouglasti katadiopteri su rezervisani za prikolice!).' };
X[8753] = { x: 'Motocikl sa tri točka: DVA zadnja crvena katadioptera, ne-trouglasta.' };
X[8754] = { x: 'Četvorocikl širi od 1 m: DVA zadnja crvena katadioptera, ne-trouglasta — pravilo prati širinu vozila.' };
X[8770] = { x: 'STOP svetla se pale pri aktiviranju RADNOG kočenja (ne parkirnog, ne motornog kočenja).' };
X[8772] = { x: 'Pokazivači pravca: ŽUTA svetlost — uvek i svuda.' };
X[8773] = { x: 'Starija vozila (pre 1.7.2011): kontrola pokazivača pravca može biti optička ILI zvučna naprava.' };
X[8781] = { x: 'Sirena: jačina zvuka u PROPISANIM granicama — ni preslaba ni "vazdušna truba".' };
X[8783] = { x: 'Plava kontrolna lampa dugih svetala na motociklu: obavezna, OSIM do 50 cm³.' };
X[8784] = { x: 'Na LAKIM triciklima/četvorociklima plava kontrolna lampa NIJE obavezna.' };
X[8791] = { x: 'Brojevi u pitanju su UGLOVI (stepen se izgubio u bazi): najviše 30° prema gore i 15° prema dole.' };
X[8809] = { x: 'Oprema prve pomoći veličine "A": motocikli, TEŠKI tricikli i TEŠKI četvorocikli (moped i laki ne moraju).' };
X[8814] = { x: 'Pneumatici moraju biti DIMENZIJA KOJE JE DEKLARISAO PROIZVOĐAČ VOZILA — ne "šta može da stane".' };
const gume = 'Oznaka pneumatika, npr. 195/65 R 16 89 N: 195 = ŠIRINA (mm) · 65 = odnos visine i širine u % · R = radijalna konstrukcija · 16 = prečnik naplatka (coli) · 89 = indeks NOSIVOSTI · N = brzinska oznaka. Dimenzije su prva i četvrta vrednost (širina + naplatak).';
X[8815] = { x: gume };
X[8816] = { x: gume };
X[8817] = { x: gume };
X[8818] = { x: gume };
X[8819] = { x: gume };
X[8820] = { x: gume };
X[8821] = { x: gume };
X[8822] = { x: gume };
X[8823] = { x: gume };
X[8824] = { x: gume };
const twi = 'TWI = utisnuta oznaka na boku gume koja pokazuje gde su u kanalima šare INDIKATORI ISTROŠENOSTI. Minimalna dubina šare za moped/motocikl: 1,6 mm, odnosno dublje od tih ispupčenja ako oznaka postoji.';
X[8827] = { x: twi };
X[8828] = { x: twi };
X[8829] = { x: twi };
X[8830] = { x: twi };
X[10653] = { x: 'Osvetljenje zadnje registarske tablice: BELA svetlost (drugi dozvoljeni beli izvor pozadi).' };
X[10657] = { x: 'Stop svetlo ne moraju imati vozila koja na ravnom putu ne prelaze 25 km/h — ispod te brzine ni kočenje nije naglo.' };
// --- Registracija (sub 126) ---
const regTri = 'Za učešće u saobraćaju vozilo mora imati SVE TROJE: saobraćajnu dozvolu + registarske tablice + registracionu nalepnicu — bilo šta od toga da fali, vozilo ne sme na put.';
X[8423] = { x: regTri };
X[8424] = { x: regTri };
X[8425] = { x: 'Istekla registraciona nalepnica = vozilo NE SME u saobraćaj (nema "grejs perioda" za vožnju).' };
X[8427] = { x: 'Tablice za privremeno označavanje + potvrda: rok važenja 15 DANA.' };
const regGodina = 'Registraciona nalepnica važi JEDNU GODINU — registracija se obnavlja godišnje.';
X[8428] = { x: regGodina };
X[8429] = { x: regGodina };
X[8433] = { x: 'Saobraćajna dozvola (za vozilo) mora biti KOD VOZAČA tokom vožnje — kao i vozačka (za tebe).' };
X[8434] = { x: "Da — saobraćajna dozvola se daje na uvid ovlašćenom licu na zahtev. Polisa osiguranja ni važeća registraciona nalepnica je NE zamenjuju — to su odvojene obaveze, pa se dozvola pokazuje uvek." };
X[8435] = { x: 'Isključeno vozilo ne učestvuje u saobraćaju dok isključenje traje — vožnja isključenim vozilom je novi prekršaj.' };
X[8436] = { x: 'Posle isteka registracije, radi odvoženja na tehnički/registraciju: sme SAMO sa tablicama za privremeno označavanje i potvrdom.' };
X[8437] = { x: 'Uz privremene tablice kod sebe imaš POTVRDU o njihovom korišćenju — ona je "saobraćajna dozvola" tog režima.' };
X[8438] = { x: 'Da — potvrda o korišćenju privremenih tablica se daje na uvid.' };
X[8439] = { x: 'Sa privremenim tablicama krećeš se RELACIJOM I U VREME iz potvrde — nisu "slobodne tablice za svuda".' };
const rok15 = 'Rok od 15 DANA važi i za odjavu uništenog/otpisanog vozila i za prijavu promene bilo kog podatka o vozilu/vlasniku — zapamti: registarske administrativne obaveze = 15 dana (privremene tablice takođe 15).';
X[8441] = { x: rok15 };
X[8442] = { x: rok15 };
X[8443] = { x: 'Vozilo na lizingu: korisnik sme da ga vozi tek kad je UPISAN kao korisnik u saobraćajnu dozvolu/registar.' };
X[8444] = { x: 'Gubitak tablice/nalepnice: ODMAH obavesti najbližu jedinicu MUP-a — izgubljena tablica u pogrešnim rukama je tvoj problem dok je ne prijaviš.' };
// --- Tehnički pregledi (sub 127) ---
X[8445] = { x: 'Redovni tehnički pregledi: GODIŠNJI i ŠESTOMESEČNI (šestomesečni za posebne kategorije — taksi, autobusi, obuka...).' };
X[8446] = { x: 'Na kontrolni pregled se upućuje vozilo U VOZNOM STANJU (nepokretno se isključuje i tabli se skidaju bez pregleda).' };
X[8447] = { x: "Tehnički uslovi važe KAD VOZILO UČESTVUJE U SAOBRAĆAJU — u garaži može biti rastavljeno do šrafa. Ograničenja \"samo na javnom putu\" ili \"samo na putu sa savremenim zastorom\" su mamci — put je i nekategorisani i zemljani, pa obaveza važi na svakom putu." };
X[8448] = { x: "Tehnički ispravno = ISPRAVNI SVI propisani uređaji i oprema + zadovoljeni svi tehnički normativi — oba uslova. Vozno stanje bez vidljivih oštećenja ni redovan pregled obavljen u roku sami po sebi nisu dokaz ispravnosti — ispravnost je stvarno stanje uređaja i opreme, ne utisak ni papir." };
X[8449] = { x: 'PREPRAVLJENO vozilo: prvo ISPITIVANJE (atest) da ispunjava uslove, pa tek onda u saobraćaj.' };
X[8450] = { x: 'Tehnički pregled utvrđuje dvoje: da je vozilo TEHNIČKI ISPRAVNO i da ISPUNJAVA propisane uslove za saobraćaj.' };
X[8451] = { x: "Vozilo JEDNOZNAČNO određuje samo IDENTIFIKACIONA OZNAKA (broj šasije) koju određuje PROIZVOĐAČ — prati vozilo od fabrike do otpada. Registraciona nalepnica ne može: menja se pri svakoj registraciji i vezana je za rok, ne za vozilo. Mamac \"i brojem motora\" dodaje višak: motor je zamenljiv deo, pa njegov broj ne određuje vozilo — merodavna je samo oznaka proizvođača." };
X[8461] = { x: "VANREDNI pregled: posle nezgode/kvara sa oštećenjem bitnih uređaja i posle isključenja zbog neispravnosti — pre vraćanja u saobraćaj. Pregled radi kontrole po nalogu ovlašćenog lica je KONTROLNI, a pregled pre isteka šest meseci od početka važenja nalepnice je REDOVNI ŠESTOMESEČNI — ni jedan ni drugi nisu vanredni." };
X[8462] = { x: 'KONTROLNI pregled: po nalogu ovlašćenog lica MUP-a ili inspektora za drumski saobraćaj — na sumnju, ne po kalendaru.' };
X[10687] = { x: 'Redovni godišnji pregled: PRE upisa u registar odnosno izdavanja registracione nalepnice — bez pregleda nema registracije.' };
X[10688] = { x: 'Godišnji pregled važi za registraciju ako je obavljen najranije 30 DANA pre zahteva.' };
X[10705] = { x: "Na pregled se dolazi sa ČISTIM vozilom U VOZNOM STANJU — prljavo/nepokretno kontrolor može da odbije. Mamac \"može biti opterećeno\" ne prolazi — pregled se vrši na neopterećenom vozilu; a \"tehnički ispravno vozilo\" ne može biti uslov, jer se ispravnost pregledom tek utvrđuje." };
X[10706] = { x: 'Pregled se vrši na NEOPTEREĆENOM vozilu (bez tereta) — masa menja geometriju i kočenje.' };
X[10707] = { x: 'Na pregledu se kontroloru daju: SAOBRAĆAJNA dozvola (vozila) + LIČNA karta (donosioca).' };
X[10710] = { x: 'Registrovano neodjavljeno vozilo mora i NA PREGLEDU imati sve tablice na svojim mestima.' };


// --- Vozila pod pratnjom i sa pravom prvenstva (sub 148), tekstualna ---
const izuzOd = 'Vozila pod pratnjom i sa pravom prvenstva, dok daju posebne znake i ne ugrožavaju druge, IZUZETA su od odredbi o: ograničenju brzine, PROPUŠTANJU PEŠAKA, ZABRANI PRESECANJA KOLONE PEŠAKA i zabrani preticanja i obilaženja (ZOBS čl. 106 i 108). Nisu izuzeta od svetlosnih znakova kojima im je zabranjen prolaz ni od dozvoljenog smera kretanja — pitanja izvlače po dve stavke sa liste.';
X[10341] = { x: izuzOd };
X[10578] = { x: izuzOd };
X[10590] = { x: izuzOd };
X[10591] = { x: izuzOd };
const susretDuzn = 'Kad te takvo vozilo susretne ili sustigne (ZOBS čl. 107 i 109): propusti ga, omogući mimoilaženje/preticanje/obilaženje, po potrebi se zaustavi ili skloni s kolovoza, i postupaj po naredbama lica iz vozila/pratnje — nastavljaš tek kad sva prođu.';
X[10374] = { x: susretDuzn };
X[10375] = { x: susretDuzn };
X[10579] = { x: susretDuzn };
X[10580] = { x: susretDuzn };
X[10381] = { x: 'Kad vozilo sa prvenstvom OBEZBEĐUJE prolaz vozilima iza sebe (npr. policija vodi kolonu) — prema toj koloni postupaš kao prema vozilima sa prvenstvom prolaza (ZOBS čl. 109 st. 2).' };
X[10382] = { x: 'Ni vozač sa pravom prvenstva nije iznad bezbednosti: DUŽAN je da vodi računa o ostalim učesnicima (ZOBS čl. 109 st. 3) — rotacija ne ukida odgovornost.' };
X[10383] = { x: 'Policijsko vozilo sa plavim svetlom + SVETLOSNI ZNAK UPOZORENJA (blicanje) vozilu ISPRED: odmah bezbedno stani uz desnu ivicu, po mogućstvu van kolovoza (ZOBS čl. 110 st. 1) — tebe zaustavljaju.' };
X[10384] = { x: 'Vozilo NEPOSREDNO IZA policijskog sa znacima: prati policijsko vozilo do pogodnog mesta i bezbedno se zaustavi iza njega — postupaš po znacima policajca (ZOBS čl. 110 st. 2).' };
X[10567] = { x: 'Vozila koja VRŠE pratnju moraju davati posebne zvučne i svetlosne znake — bez znakova nema statusa pratnje.' };
X[10568] = { x: 'Znaci vozila POD PRATNJOM: CRVENO i PLAVO trepćuće svetlo (naizmenično) + sirena promenljive frekvencije (ZOBS čl. 106 st. 2). Crveno+plavo = pratnja; samo plavo = pravo prvenstva.' };
X[10583] = { x: "Znaci vozila SA PRVENSTVOM PROLAZA: najmanje JEDNO PLAVO trepćuće/rotaciono svetlo + sirena (ZOBS čl. 108 st. 3). Crveno i plavo svetlo koja se naizmenično pale + sirena su znaci vozila POD PRATNJOM (ZOBS čl. 106), a žuta rotaciona ili trepćuća svetla nose vozila koja obavljaju radove ili pomoć na putu (čl. 111) — nijedno od ta dva nije znak prvenstva prolaza." };
const bezSirene = 'Bez sirene, samo sa posebnim svetlosnim znacima, sme se kada su ISTOVREMENO ispunjeni uslovi: dovoljna vidljivost vozila i bezbednost učesnika, kretanje brzinom koja nije veća od dozvoljene, i kada je to neophodno za neometano izvršenje službenog zadatka (ZOBS čl. 106 i 108).';
X[10569] = { x: bezSirene };
X[10584] = { x: bezSirene };
X[10585] = { x: bezSirene };
const ugradnja = 'Rotacije i sirene smeju biti ugrađene SAMO na vozilima nadležnih državnih organa (i službi iz zakona) — privatna ugradnja je razlog za isključenje vozila.';
X[10571] = { x: ugradnja };
X[10586] = { x: ugradnja };
X[10572] = { x: 'Uređaji se koriste samo KADA SE VRŠI PRATNJA — ne za "probijanje gužve" van zadatka.' };
X[10587] = { x: 'Znaci se upotrebljavaju samo kad je to NEOPHODNO za bezbedno i efikasno izvršenje SLUŽBENE radnje — upotreba je vezana za zadatak, ne za vozilo.' };
const prednostNad = 'Prvenstvo tih vozila važi u odnosu na prvenstvo regulisano ZNAKOVIMA, OZNAKAMA i PRAVILIMA — ali ne "gasi" semafor za ostale učesnike niti obavezu prema pešacima (hijerarhija: kartica).';
X[10573] = { x: prednostNad };
X[10588] = { x: prednostNad };
X[10582] = { x: 'I vozila sa prvenstvom prolaza moraju DAVATI posebne znake da bi imala taj status — plavo svetlo + sirena; ugašena rotacija = obično vozilo.' };
// --- Put: pojam i vrste (sub 109) ---
const staJePut = 'PUT je svaka površina namenjena saobraćaju: i ulica, i pešačka staza, i biciklistička staza, i zemljani put — "put" je širi pojam od kolovoza i asfalta.';
X[8083] = { x: staJePut };
X[8084] = { x: staJePut };
const autoputDef = 'AUTOPUT: državni put sa POTPUNOM kontrolom pristupa (uključenje samo petljom), FIZIČKI razdvojenim kolovoznim trakama, najmanje 2 saobraćajne + 1 zaustavna traka PO SMERU, bez ukrštanja u nivou, obeležen propisanim znakom.';
X[8085] = { x: autoputDef };
X[8087] = { x: autoputDef };
const motoputDef = 'MOTOPUT: državni put namenjen isključivo motornim vozilima (motocikli, putnička, teretna...), obeležen propisanim znakom — sme biti i bez fizičkog razdvajanja smerova (po tome se razlikuje od autoputa).';
X[8088] = { x: motoputDef };
X[8089] = { x: "MOTOPUT: državni put namenjen isključivo motornim vozilima (motocikli, putnička, teretna...), obeležen propisanim znakom — sme biti i bez fizičkog razdvajanja smerova (po tome se razlikuje od autoputa). Potpuna kontrola pristupa i zaustavna traka za svaki smer su uslovi iz definicije AUTOPUTA, ne motoputa (ZOBS čl. 7) — a motoput definiše saobraćajni ZNAK, ne oznaka na kolovozu." };
X[8086] = { x: "ZEMLJANI put = put bez izgrađenog kolovoznog zastora — i kad na priključku ima par metara asfalta, ostaje zemljani (sa njega propuštaš sve pri uključenju!). Makadam (tucanik) jeste izgrađen kolovozni zastor, pa makadamski put NIJE zemljani." };
X[8102] = { x: 'RASKRSNICA = deo kolovoza gde se putevi ukrštaju, spajaju ili razdvajaju U ISTOM NIVOU — nadvožnjak nije raskrsnica (nema ukrštanja u nivou).' };
// --- Tehničko regulisanje (sub 115) ---
const zona30 = 'Zona "30" = deo puta/ulice/naselja sa ograničenjem do 30 km/h, obeležena posebnim znakom na ulazu — tipično oko škola i u stambenim ulicama.';
X[8124] = { x: zona30 };
X[8125] = { x: zona30 };
X[10702] = { x: "PEŠAČKA ZONA = deo prvenstveno namenjen pešacima — vozila samo izuzetno (dozvola/znak) i prilagođena pešacima. U zoni usporenog saobraćaja kolovoz ravnopravno koriste i pešaci i vozila (ZOBS čl. 161), a zona \"30\" je samo ograničenje brzine do 30 km/h (čl. 162) — nijedna od njih nije \"prvenstveno namenjena\" pešacima." };
X[10603] = { x: 'U pešačkoj zoni dozvoljena vozila kreću se brzinom KRETANJA PEŠAKA — pešak je merilo, ne broj na semaforu.' };
X[10604] = { x: 'ZONA USPORENOG SAOBRAĆAJA = kolovoz dele pešaci i vozila (deca se smeju igrati) — vozilo je gost.' };
X[10605] = { x: "U zoni usporenog saobraćaja: brzina kretanja pešaka, a NAJVIŠE 10 km/h. Mamac 30 km/h je granica za zonu \"30\" (ZOBS čl. 162) — ne mešaj te dve zone." };
X[10606] = { x: 'ZONA ŠKOLE u naselju: 30 km/h u vremenu 7-21h (osim ako znak odredi drugačije).' };
X[10607] = { x: 'Zona škole VAN naselja: 50 km/h u vremenu 7-21h (osim ako znak odredi drugačije). Par za pamćenje: naselje 30 / van naselja 50, oba 7-21.' };
X[10608] = { x: 'U TUNELU: motor se gasi već posle JEDNOG minuta prekida kretanja (izduvni gasovi u zatvorenom prostoru) — strože nego napolju.' };
X[10609] = { x: 'Motor gasiš i NA ZAHTEV policijskog ili drugog službenog lica — bez rasprave.' };
X[10610] = { x: 'Van tunela: motor se gasi kad prekid kretanja traje duže od TRI minuta (podsetnik: zaustavljanje je po definiciji do 3 minuta).' };
X[10611] = { x: 'Ispuštanje/odlaganje materija i otpada kojima se ugrožavaju ljudi i sredina: zabranjeno — bez izuzetaka.' };


// ===== REVIZIJA (nezavisna provera 415 tekstova, primenjeno 2026-08-26) =====
X[7921] = { ...(X[7921] || {}), x: "Neposredno regulisanje saobraćaja policijski službenici vrše u uniformi (Pravilnik o načinu vršenja kontrole i neposrednog regulisanja saobraćaja, čl. 2). ZOBS čl. 2 taj posao poverava MUP-u, uz posebne zakonske izuzetke, pa ponuđeni komunalni policajci i inspektori za drumski saobraćaj nisu tačan odgovor." };
X[7924] = { ...(X[7924] || {}), x: "Na delu puta na kome se izvode radovi neposredno regulisanje mogu vršiti uniformisani policijski službenici. Ako je nastala prepreka koja se ne može odmah ukloniti, ZOBS čl. 166 dopušta i najmanje dva za to određena radnika izvođača radova, odnosno upravljača puta." };
X[7929] = { ...(X[7929] || {}), x: "Porodica je odgovorna za saobraćajno obrazovanje i vaspitanje dece, uključujući unapređivanje i učvršćivanje pozitivnih stavova i ponašanja značajnih za bezbedno učešće u saobraćaju (ZOBS čl. 6). Donošenje programa i rad školskih saobraćajnih patrola i saobraćajnih patrola građana zakon poverava drugim nadležnim organima, a ne porodici." };
X[8083] = { ...(X[8083] || {}), x: "Put je izgrađena ili utvrđena površina koju kao saobraćajnu koriste učesnici u saobraćaju pod uslovima određenim zakonom — zato su i ulica i pešačka staza put (ZOBS čl. 7). Površina koju sme da koristi samo onaj kome vlasnik dozvoli, poligon i sportski teren nisu put — njihovu namenu određuje vlasnik, a ne propisi o saobraćaju." };
X[8084] = { ...(X[8084] || {}), x: "Put je izgrađena, odnosno utvrđena površina koju kao saobraćajnu koriste učesnici u saobraćaju (ZOBS čl. 7) — zato su i biciklistička staza i zemljani put putevi. Trkačka staza, plato za okupljanje i travnjaci nisu namenjeni saobraćaju na putu, pa nisu put." };
X[8102] = { ...(X[8102] || {}), x: "Raskrsnica je deo KOLOVOZA na kome se PUTEVI ukrštaju, spajaju ili razdvajaju u istom nivou (ZOBS čl. 7). Zamka: ukrštanje puta i pruge u istom nivou nije raskrsnica nego prelaz puta preko pruge." };
X[8438] = { ...(X[8438] || {}), x: "Da — potvrdu o korišćenju tablica za privremeno označavanje vozač daje na uvid pri kontroli; polisa osiguranja ili dokaz o tehničkoj ispravnosti je NE zamenjuju." };
X[8446] = { x: "Na kontrolni pregled se upućuje samo vozilo U VOZNOM STANJU — nepokretno vozilo se isključuje iz saobraćaja i tablice se skidaju bez pregleda. Ista zabrana važi i za vozilo kojem su u saobraćajnoj nezgodi mehanički oštećeni uređaji i sklopovi od presudnog značaja za bezbedno upravljanje — ni ono se ne upućuje na kontrolni pregled (ZOBS čl. 266 st. 2)." };
X[8476] = { ...(X[8476] || {}), x: "Ne upravlja savesno i na propisan način vozač pravnosnažno osuđen za krivično delo protiv bezbednosti saobraćaja sa SMRTNOM posledicom — dovoljna je već JEDNA osuda (ZOBS čl. 197). Zamke: za teške telesne povrede uslov je više od jedne osude u 5 godina." };
X[8477] = { ...(X[8477] || {}), x: "Vozač ne upravlja savesno i na propisan način ako je VIŠE OD JEDNOM u roku od 5 GODINA pravnosnažno osuđen za krivično delo protiv bezbednosti saobraćaja sa TEŠKIM telesnim povredama (ZOBS čl. 197). Zamke: jedna osuda dovoljna je samo za smrtnu posledicu, a rok od 3 godine važi za lakše povrede i štetu." };
X[8478] = { ...(X[8478] || {}), x: "Vozač ne upravlja savesno i na propisan način ako je VIŠE OD JEDNOM u roku od 3 GODINE pravnosnažno osuđen za krivično delo protiv bezbednosti saobraćaja sa telesnim povredama ili imovinskom štetom (ZOBS čl. 197). Rok od 5 godina je zamka — on važi za TEŠKE telesne povrede." };
X[8533] = { ...(X[8533] || {}), x: "Lice koje se ZATEKNE na mestu nezgode sa povređenima dužno je da pomogne u skladu sa svojim znanjem i mogućnostima i da preduzme sve što može da spreči uvećavanje posledica (ZOBS čl. 167). Odgovori \"nije obavezno\" i \"udalji se\" su zamke — obaveza pomoći važi za svakoga, ne samo za učesnike." };
X[8535] = { ...(X[8535] || {}), x: "Lice koje je učestvovalo u saobraćajnoj nezgodi ne sme uzimati alkoholna pića ni psihoaktivne supstance dok se ne izvrši uviđaj (ZOBS čl. 174) — stanje učesnika u trenutku nezgode mora ostati proverljivo. Zabrana važi sama po sebi, ne tek kad je neko saopšti." };
X[8536] = { ...(X[8536] || {}), x: "Kod nezgode SA povređenima ili poginulima: zaustavi se, obavesti policiju i hitnu pomoć, pomozi povređenima u skladu sa svojim znanjem, ostani do uviđaja i preduzmi sve mere u svojoj moći da sprečiš nove nezgode i uvećanje posledica (ZOBS čl. 168)." };
X[8539] = { ...(X[8539] || {}), x: "Udaljavanje sa mesta nezgode izuzetno je dozvoljeno samo iz dva razloga: ako je vozaču neophodna hitna medicinska pomoć ili radi prevoženja povređenog do najbliže zdravstvene ustanove (ZOBS čl. 168) — uz obavezu da se vrati čim bude u mogućnosti." };
X[8540] = { ...(X[8540] || {}), x: "I kod MANJE materijalne štete svaki učesnik (ili oštećeni) može zahtevati da policijski službenik izađe i izvrši uviđaj (ZOBS čl. 171) — saglasnost ostalih se ne traži, a oni ostaju do završetka uviđaja." };
X[8541] = { ...(X[8541] || {}), x: "Ako bilo koji učesnik ili lice koje je pretrpelo štetu zahteva uviđaj — svi ostali učesnici dužni su da ostanu na mestu nezgode do njegovog završetka (ZOBS čl. 171 st. 2)." };
X[8542] = { ...(X[8542] || {}), x: "Kod manje štete: upozori ostale učesnike na prepreke i UKLONI vozilo/predmete sa kolovoza ako ometaju saobraćaj (ZOBS čl. 172) — suprotno od nezgode sa povređenima, gde se ništa ne pomera." };
X[8543] = { ...(X[8543] || {}), x: "Uzimanje uzorka krvi, odnosno krvi i urina učesnicima nezgode u kojoj ima poginulih ili povređenih je OBAVEZNO — određuje ga lice koje vrši uviđaj (ZOBS čl. 174). Alkometar ga ne zamenjuje." };
X[8545] = { x: "Kod manje materijalne štete: ostavi podatke o sebi i vozilu vozaču oštećenog vozila, odnosno oštećenom, i preduzmi mere da se spreče nove nezgode (ZOBS čl. 172). Zamke: policija se kod manje štete obaveštava samo izuzetno — kad je vozač drugog (oštećenog) vozila odsutan (čl. 172 st. 2); regulisanje saobraćaja i nadoknada štete na licu mesta nisu među dužnostima." };
X[8546] = { x: "Oštetio si tuđe vozilo a vozača nema: obavesti policiju i dostavi svoje podatke i podatke o oštećenom vozilu (ZOBS čl. 172 st. 2). Ceduljica na vozilu nije zakonska opcija. Ni poziv svom osiguravajućem društvu ne zamenjuje policiju — osiguranje dolazi na red tek posle, kod naknade štete." };
X[8548] = { ...(X[8548] || {}), x: "Prilikom uviđaja nezgode u kojoj nema poginulih ni povređenih, ovlašćeno lice OBAVEZNO podvrgava neposredne učesnike ispitivanju odgovarajućim sredstvima — alkometar, droga-test (ZOBS čl. 174). Zamka: to nije stvar zahteva učesnika, ispitivanje je uvek obavezno." };
X[8550] = { ...(X[8550] || {}), x: "Posle završenog uviđaja: bez odlaganja ukloni sa kolovoza vozilo, teret i rasuti materijal (ZOBS čl. 177) — put mora da se oslobodi; inače uklanjanje nalaže MUP o tvom trošku." };
X[8552] = { x: "Ovde su tačni: odbijanje ispitivanja/stručnog pregleda i vožnja pod dejstvom alkohola — oba sa liste čl. 279. Obično prekoračenje brzine (npr. 51-70 km/h u naselju) NIJE razlog za isključenje vozača — to je zamka ovog pitanja. Celu listu vidi na kartici. Neispravan uređaj za upravljanje ili zaustavljanje je razlog za isključenje VOZILA (ZOBS čl. 289), ne vozača." };
X[8555] = { x: "Ovde su tačni: vožnja bez dozvole za tu kategoriju i vožnja za vreme zaštitne mere ili mere bezbednosti — oba na listi iz ZOBS čl. 279. Pitanja iz ove grupe izvlače po dve stavke sa liste — nauči je celu (kartica). Zamke: prolazak na crveno se kažnjava, ali nije na listi za isključenje vozača, a preopterećenje je osnov za isključenje VOZILA — kad ukupna masa prelazi najveću dozvoljenu za više od 5% (čl. 289)." };
X[8556] = { ...(X[8556] || {}), x: "Ovde su tačni: vožnja za vreme trajanja isključenja i vožnja posle isteka roka važenja dozvole (probne dozvole) — oba na listi iz ZOBS čl. 279. Dnevni odmor i prekoračenje brzine nisu na listi." };
X[8557] = { x: "Ovde su tačni: istekla dozvola i vožnja za vreme trajanja isključenja — oba na listi iz ZOBS čl. 279. Pitanja iz ove grupe izvlače po dve stavke — nauči celu listu (kartica). Prekoračenje brzine i jedan prolazak na crveno nisu na toj listi — razlog za isključenje postaju tek kao nasilnička vožnja (npr. brzina veća za više od 90 km/h u naselju, odnosno dva prolaska na crveno u roku od 10 minuta — ZOBS čl. 41)." };
X[8600] = { ...(X[8600] || {}), x: "Vanredni pregled vozila isključenog zbog neispravnosti po pravilu se vrši u objektu gde je obavljen kontrolni pregled; u DRUGOM objektu sme samo kada to DOZVOLI organ čiji je službenik uputio vozilo na kontrolni pregled, ako je to opravdano." };
X[9531] = { ...(X[9531] || {}), x: "Odstojanje (napred-nazad) i rastojanje (bočno) drži tako da NE IZAZIVAŠ OPASNOST i NE OMETAŠ druge učesnike (ZOBS čl. 21) — oba uslova, bez propisanih brojki: zavisi od brzine i uslova." };
X[9593] = { ...(X[9593] || {}), x: "Osnovno: vozilo se kreće DESNOM stranom kolovoza u smeru kretanja (ZOBS čl. 35)." };
X[9603] = { ...(X[9603] || {}), x: "Drži se što bliže DESNOJ ivici kolovoza (ZOBS čl. 35) — leva strana je za preticanje i mimoilaženje, ne za krstarenje." };
X[9612] = { ...(X[9612] || {}), x: "Dvosmerni put sa najmanje četiri trake: ne prelazi na kolovoznu traku namenjenu suprotnom smeru — ni za preticanje (ZOBS čl. 36 st. 1)." };
X[9616] = { ...(X[9616] || {}), x: 'Zabrana je bezuslovna: na dvosmernom putu sa TRI trake ne smeš u traku uz LEVU ivicu puta u svom smeru (ZOBS čl. 36 st. 2). Zakon tu ne daje nijedan izuzetak, pa su obe ponude koje tu traku dozvoljavaju netačne — ni preticanje ni zastoj je ne otključavaju, jer je namenjena vozilima iz suprotnog smera. Odatle sledi i gde se pretiče: srednjom trakom, po opštim pravilima preticanja.' };
X[9619] = { ...(X[9619] || {}), x: "Fizički odvojene kolovozne trake: kretanje trakom namenjenom za suprotni smer je apsolutno zabranjeno — bez izuzetka (ZOBS čl. 36)." };
X[9639] = { ...(X[9639] || {}), x: "Skretanje UDESNO: iz krajnje desne trake, uz desnu ivicu kolovoza (ZOBS čl. 46) — bez \"sečenja\" iz srednje trake, osim ako signalizacija odredi drugačije." };
X[10218] = { ...(X[10218] || {}), x: "Izuzetak iz ZOBS čl. 80: i vozilu zaustavljenom na KOLOVOZU poziciona/parkirna svetla ne moraju biti uključena ako stoji na posebno obeleženom mestu, na delu puta gde ga ulično osvetljenje čini dovoljno vidljivim. Van tog izuzetka, na kolovozu noću svetla su obavezna." };
X[10271] = { ...(X[10271] || {}), x: "Organizovana kolona pešaka na kolovozu se NE preseca — čekaš da cela prođe (ZOBS čl. 99), bez izuzetka po sastavu kolone." };
X[10438] = { ...(X[10438] || {}), x: "Semafor može istovremeno dati pravo prolaza dvojici učesnika (npr. zeleno i vozilu koje skreće ulevo i vozilu iz suprotnog smera, ili vozilu i pešacima) — njihov MEĐUSOBNI odnos tada rešavaju pravila saobraćaja, jer ga svetlosni znak ne rešava (ZOBS čl. 20)." };
X[10454] = { ...(X[10454] || {}), x: "U zastoju na putu sa fizički odvojenim kolovoznim trakama vozači zauzimaju položaj uz desnu, odnosno levu ivicu trake i ostavljaju slobodan prolaz za vozila POD PRATNJOM i SA PRAVOM PRVENSTVA PROLAZA (ZOBS čl. 35) — \"koridor spasa\"." };
X[10463] = { ...(X[10463] || {}), x: "Skretanje ULEVO vrši se iz krajnje leve trake koja se proteže uz razdelnu liniju — uz nju, ne preko nje (na jednosmernom putu uz levu ivicu), ako signalizacijom nije drugačije određeno (ZOBS čl. 46 st. 2)." };
X[10546] = { ...(X[10546] || {}), x: "Zakopčanu kacigu moraju nositi vozač i putnik motocikla, mopeda, tricikla i četvorocikla — jedini izuzetak je vozilo sa ugrađenom KABINOM (ZOBS čl. 91). Test voli da \"sakrije\" četvorocikl; traktor nije na listi." };
X[10551] = { ...(X[10551] || {}), x: "Skretanje na bočni put BEZ pešačkog prelaza: pešake koji su VEĆ STUPILI ili stupaju na kolovoz tog puta moraš da propustiš (ZOBS čl. 99) — zvučni znak te ne oslobađa obaveze." };
X[10559] = { ...(X[10559] || {}), x: "Motoputem (kao i autoputem) dozvoljeno je kretanje samo motociklima, putničkim vozilima, teretnim vozilima i autobusima (ZOBS čl. 102). Mopedi, tricikli i četvorocikli ne smeju — iako su motorna vozila, nisu na listi." };
X[10562] = { ...(X[10562] || {}), x: "Uključivanje i isključivanje SAMO prilaznim putem namenjenim za to (ZOBS čl. 103) — polukružno okretanje i kretanje unazad su zabranjeni (čl. 105), pa promašen izlaz znači vožnju do sledećeg." };
X[10568] = { ...(X[10568] || {}), x: "Znaci vozila POD PRATNJOM: CRVENO i PLAVO trepćuće svetlo koja se naizmenično pale + zvučni znak promenljive frekvencije (ZOBS čl. 106 st. 3). Crveno+plavo = pratnja; samo plavo = pravo prvenstva." };
X[10578] = { ...(X[10578] || {}), x: "Vozila pod pratnjom, dok daju posebne znake i ne ugrožavaju druge, izuzeta su od: ograničenja brzine, zabrane preticanja i obilaženja, ali i od propuštanja pešaka i presecanja kolone pešaka (ZOBS čl. 106). Ovde su od ponuđenog tačni brzina i preticanje/obilaženje." };
X[10590] = { ...(X[10590] || {}), x: "Vozila pod pratnjom, dok daju posebne znake i ne ugrožavaju druge, izuzeta su od odredbi o ograničenju brzine, PROPUŠTANJU PEŠAKA, ZABRANI PRESECANJA KOLONE PEŠAKA i zabrani preticanja i obilaženja (ZOBS čl. 106). Nisu izuzeta od upotrebe svetala, a svetlosne znakove kojima im je zabranjen prolaz moraju poštovati." };
X[10591] = { ...(X[10591] || {}), x: "Na vozila sa prvenstvom prolaza, dok daju posebne znake i ne ugrožavaju druge, NE primenjuju se odredbe o ograničenju brzine, PROPUŠTANJU PEŠAKA, ZABRANI PRESECANJA KOLONE PEŠAKA i zabrani preticanja i obilaženja (ZOBS čl. 108). I dalje moraju da poštuju svetlosne znakove kojima im je zabranjen prolaz i propisno koriste svetla — zato su ta dva ponuđena odgovora netačna." };


// ===== REVIZIJA 2. PROLAZ (14 proveravača, 415/415 provereno, primenjeno 2026-08-26) =====
X[9673] = { ...(X[9673] || {}), x: "Polukružno okretanje je zabranjeno u tunelu, na mostu, vijaduktu, podvožnjaku i nadvožnjaku, u uslovima smanjene vidljivosti, na mestu nedovoljne preglednosti i na delu puta koji nema dovoljnu širinu za okretanje tog vozila (ZOBS čl. 50). Pažnja: ova lista NIJE ista kao za preticanje — preticanje na mostu, vijaduktu, nadvožnjaku i u podvožnjaku nije izričito zabranjeno (čl. 55), a polukružno okretanje jeste." };
X[10438] = { ...(X[10438] || {}), x: "Kada dva ucesnika na semaforu istovremeno dobiju pravo prolaza (npr. vozilo koje skrece ulevo i vozilo iz suprotnog smera), njihov medjusobni odnos resavaju pravila saobracaja — pravilo desne strane i pravilo levog skretanja (ZOBS cl. 47). Semafor taj medjusobni odnos ne resava." };
X[10569] = { ...(X[10569] || {}), x: "Vozilo pod pratnjom sme davati samo posebne svetlosne znake, bez sirene, ako je omogućena dovoljna vidljivost tog vozila i bezbednost učesnika u saobraćaju — osim kada se kreće brzinom većom od dozvoljene na tom delu puta (ZOBS čl. 106 st. 3). Uslov vezan za izvršenje službenog zadatka odnosi se na vozila sa prvenstvom prolaza (čl. 108), ne na vozila pod pratnjom." };
X[10588] = { ...(X[10588] || {}), x: "Vozila sa prvenstvom prolaza imaju prvenstvo u odnosu na sva druga vozila, osim u odnosu na vozila pod pratnjom i na raskrsnicama na kojima je saobraćaj regulisan svetlosnim znacima ili znacima policijskog službenika, kada im je tim znacima zabranjen prolaz (ZOBS čl. 108). Zato njihovo prvenstvo važi na raskrsnicama regulisanim saobraćajnim znakovima, oznakama na kolovozu i pravilima saobraćaja — a ne semaforom i policajcem." };
X[8638] = { ...(X[8638] || {}), x: "Teret koji na teretnom ili priključnom vozilu prelazi najudaljeniju tačku na zadnjoj strani vozila označava se PROPISANOM TABLOM — kvadratnom, sa naizmeničnim kosim crveno-belim odsevnim prugama (tabla br. 1). Kod ostalih vozila teret se označava crvenom tkaninom, a u uslovima smanjene vidljivosti crvenim svetlom ili svetloodbojnom materijom crvene boje (ZOBS čl. 113)." };
X[9878] = { ...(X[9878] || {}), x: "Znak „naselje” označava početak naselja. Ovde nije prikazan znak koji određuje drugačije ograničenje, pa važi opštih 50 km/h (ZOBS čl. 43)." };
X[9948] = { ...(X[9948] || {}), x: "Znak na slici označava prestanak naselja — iza njega važi opšte ograničenje brzine van naselja (ZOBS čl. 44): 130 km/h na auto-putu, 100 km/h na motoputu, a na ostalim putevima 80 km/h. Prikazani put nije ni auto-put ni motoput, pa je najveća dozvoljena brzina 80 km/h." };
X[10703] = { ...(X[10703] || {}), x: "Neregulisan pešački prelaz: vozač prilagođava brzinu tako da u svakoj situaciji koju vidi ili ima razloga da predvidi može bezbedno da propusti pešaka koji je stupio ili stupa na prelaz (ZOBS čl. 99 st. 3; slično i čl. 23 st. 2). Nije obavezno ni zaustavljanje ni zvučni znak — obavezna je brzina koja omogućava propuštanje." };
X[8688] = { ...(X[8688] || {}), x: "Najveća dozvoljena visina mopeda, motocikla, tricikla i četvorocikla iznosi 2,50 m. To je posebno, strože pravilo za ova vozila — opšta granica visine za ostala vozila je 4,00 m." };
X[9755] = { ...(X[9755] || {}), x: "Vozač ne sme da pretiče ni obilazi kolonu vozila, kao ni kada je vozač koji se kreće iza njega već otpočeo preticanje ili obilaženje (ZOBS čl. 55 st. 3 tač. 1 i 2). Zamke: skup vozila (vučno + priključno vozilo) je jedno vozilo i sme da se pretiče — to nije kolona; poledica i sneg nisu na zakonskoj listi zabrana." };
X[10480] = { ...(X[10480] || {}), x: "Preticanje i obilaženje su zabranjeni u tunelu i na prevoju, odnosno ispred i u nepreglednoj krivini — osim kada postoje najmanje dve saobraćajne trake za kretanje u istom smeru (ZOBS čl. 55 st. 3 tač. 7 i 8). Zamka: most, vijadukt, nadvožnjak i podvožnjak su zabranjeni za POLUKRUŽNO OKRETANJE (čl. 50), a ne za preticanje; opasan uspon/nizbrdica takođe nije na listi." };
X[9763] = { ...(X[9763] || {}), x: "Preticanje ili obilaženje je zabranjeno ako je vozač ispred tebe na istoj traci dao znak za preticanje ili obilaženje i ako bi time ugrozio bezbednost saobraćaja ili ometao saobraćaj iz suprotnog smera (ZOBS čl. 55). Znak desnim pokazivačem pravca NIJE znak za preticanje, a fiksno rastojanje od 200 m ne postoji u zakonu — merilo je da ne ometaš vozila iz suprotnog smera." };
X[9794] = { ...(X[9794] || {}), x: "Zabranjeno je preticanje i obilaženje kolone vozila pod pratnjom i na prelazu puta preko železničke ili tramvajske pruge (ZOBS čl. 55 st. 3 tač. 11 i 12). Zamke: na raskrsnici je preticanje izuzetno dozvoljeno kada se krećeš putem sa prvenstvom prolaza (čl. 57 st. 2), a podvožnjak i nadvožnjak uopšte nisu na listi zabrana." };
X[8087] = { ...(X[8087] || {}), x: "Autoput (ZOBS čl. 7 t. 5) je državni put namenjen isključivo za saobraćaj motocikala, putničkih vozila, teretnih vozila i autobusa (sa ili bez priključnih vozila), sa potpunom kontrolom pristupa — uključenje i isključenje samo određenim i posebno izgrađenim javnim putem — sa fizički odvojenim kolovoznim trakama, najmanje dve saobraćajne i jednom zaustavnom trakom po smeru, bez ukrštanja u nivou, i kao takav obeležen propisanim saobraćajnim znakom. Zamka: uopšteno \"namenjen za saobraćaj motornih vozila\" nije iz definicije — zakon taksativno nabraja vrste vozila." };
X[8537] = { ...(X[8537] || {}), x: "Učesnik nezgode sa povređenima, poginulima ili velikom štetom dužan je, između ostalog, da upozori sva lica da se sklone sa kolovoza da ne bi bila povređena i da ne bi uništavala tragove nezgode (ZOBS čl. 168). Regulisanje saobraćaja do dolaska policije NIJE njegova dužnost — to rade ovlašćena lica; a upozorenja jeste dužan da daje." };
X[9703] = { ...(X[9703] || {}), x: "Na označenom opasnom usponu/nizbrdici po pravilu se zaustavlja vozilo koje se kreće niz nagib (ZOBS čl. 52 st. 1). Izuzetno je vozač koji se kreće UZ nagib dužan da zaustavi svoje vozilo ako ispred sebe ima pogodno mesto za zaustavljanje koje omogućava bezbedno mimoilaženje, a mimoilaženje bi inače zahtevalo kretanje unazad jednog od vozila (čl. 52 st. 2) — to je tačan odgovor ovde. Bankina i trotoar nisu površine za mimoilaženje." };
X[10584] = { ...(X[10584] || {}), x: "Vozilo sa prvenstvom prolaza sme da daje samo posebne svetlosne znake, bez sirene, ako je omogućena dovoljna vidljivost tog vozila i bezbednost učesnika u saobraćaju — osim kada se kreće brzinom većom od dozvoljene na tom delu puta (ZOBS čl. 108). Dakle ni \"uvek oba znaka\" ni \"samo zvučni\" nisu tačni: svetla bez sirene su dozvoljena samo pod ovim uslovima." };
X[10585] = { ...(X[10585] || {}), x: "Bez sirene, samo sa posebnim svetlosnim znacima, vozilo sa prvenstvom prolaza sme kada su ISTOVREMENO ispunjeni uslovi: dovoljna vidljivost vozila i bezbednost učesnika u saobraćaju, kretanje brzinom koja nije veća od dozvoljene i kada je to neophodno za neometano izvršenje službenog zadatka (ZOBS čl. 108 st. 4)." };
X[8547] = { ...(X[8547] || {}), x: "Oduzete tablice se vraćaju tek kad nadležnom organu dostaviš dokaz da je vozilo tehnički ispravno (ZOBS čl. 175). Ni veštačenje ni sama popravka nisu dovoljni — bez potvrde o tehničkoj ispravnosti tablice ostaju oduzete." };
X[10568] = { ...(X[10568] || {}), x: "Znaci vozila POD PRATNJOM: crveno i plavo trepcuce svetlo koja se naizmenicno pale + zvucni znak promenljive frekvencije (ZOBS cl. 106 st. 2). Crveno+plavo = pratnja; samo plavo = pravo prvenstva." };
X[8815] = { ...(X[8815] || {}), x: "Oznaka pneumatika 195/65 R 16 89 N: 195/65 = sirina u mm i odnos visine i sirine u % (dimenzija) · R = radijalna konstrukcija · 16 = precnik naplatka u colima (dimenzija) · 89 = indeks nosivosti · N = brzinska oznaka. Dimenzije su, dakle, iskazane kodovima 195/65 i 16." };
X[9766] = { ...(X[9766] || {}), x: "Zabrane preticanja/obilazenja (ZOBS cl. 55 i 57): kolona, kad te neko vec pretice, kad je vozac ispred dao znak, kad ne mozes da se vratis u svoju traku, zaustavnom i sporom trakom, preko neisprekidane linije, prevoj/nepregledna krivina i tunel (osim sa >=2 trake u smeru), neposredno pred raskrsnicom i na njoj, prelaz preko pruge, kod pesackog prelaza. Zona \"30\" i zona skole NISU na listi — tamo vazi samo ogranicenje brzine, ne i zabrana preticanja." };
X[8588] = { ...(X[8588] || {}), x: "Vozilo se isključuje iz saobraćaja (ZOBS čl. 289) kada je umesto registarskim tablicama označeno nepropisnim tablicama i kada ima nedozvoljeno ugrađene uređaje za davanje posebnih svetlosnih i zvučnih znakova, a vozač ih ne ukloni u roku određenom naredbom policijskog službenika. Zamke: žuto rotaciono/trepćuće svetlo i nepropisno postavljene (ali propisne) tablice nisu razlozi za isključenje vozila." };
X[8711] = { ...(X[8711] || {}), x: "Svetlosni uređaji na prednjoj strani vozila ne smeju davati crvenu svetlost vidljivu spreda, osim u slučajevima predviđenim propisima o uslovima za vozila — crvena je po pravilu rezervisana za zadnju stranu, dok su bela i žuta napred dozvoljene." };
X[9698] = { ...(X[9698] || {}), x: "Kad je mimoilaženje onemogućeno zbog širine puta, vozač kome je to s obzirom na karakteristike i stanje puta i saobraćajnu situaciju LAKŠE da izvede dužan je da se prvi zaustavi i, po potrebi, kretanjem unazad ili na drugi način pomeri vozilo i zauzme položaj koji omogućava mimoilaženje (ZOBS čl. 51). Obe tačne opcije su dve polovine iste obaveze istog vozača." };
X[8088] = { ...(X[8088] || {}), x: "Motoput je državni put namenjen isključivo za saobraćaj motocikala, putničkih vozila, teretnih vozila i autobusa, sa ili bez priključnih vozila, i kao takav obeležen propisanim saobraćajnim znakom (ZOBS čl. 7). Nije za SVA motorna vozila (mopedi, traktori i radne mašine ne smeju), a za razliku od autoputa ne mora imati fizički odvojene smerove ni zaustavnu traku." };
X[9834] = { ...(X[9834] || {}), x: "Obilaženje zaustavljene kolone zabranjeno je ako se vozač nakon obilaženja ne bi mogao bezbedno uključiti u saobraćajnu traku namenjenu kretanju u smeru kojim se kreće (ZOBS čl. 55 st. 4)." };
X[10374] = { ...(X[10374] || {}), x: "Kad te vozilo sa prvenstvom prolaza susretne ili sustigne (ZOBS čl. 109): propusti ga i omogući mu mimoilaženje i preticanje, odnosno obilaženje; zaustavljanje ili uklanjanje s kolovoza samo PO POTREBI — zato su odgovori sa 'obavezno' netačni. Kretanje nastavljaš tek pošto sva takva vozila prođu." };
X[10375] = { ...(X[10375] || {}), x: "Vozač koji susretne ili ga sustigne vozilo sa prvenstvom prolaza dužan je da ga propusti, omogući mu mimoilaženje, preticanje i obilaženje, PO POTREBI ukloni vozilo sa kolovoza ili se zaustavi, i da se pridržava naredbi koje mu daju lica iz tih vozila (ZOBS čl. 109 st. 1). Zamka je 'obavezno' — zaustavljaš se ili sklanjaš samo kad je to potrebno da vozila prođu." };
X[10235] = { ...(X[10235] || {}), x: "Vozač mopeda, odnosno motocikla, ne sme da dopusti da vozilo kojim upravlja bude vučeno ILI potiskivano (ZOBS čl. 90 tačka 5) — bez izuzetka za neispravno vozilo ili nagib. Isti član zabranjuje i ispuštanje upravljača, pridržavanje za drugo vozilo, vuču drugih vozila i slušalice na oba uva." };
X[10547] = { ...(X[10547] || {}), x: "Zakopčanu zaštitnu kacigu za vreme vožnje moraju nositi vozač i putnik mopeda, motocikla, tricikla i četvorocikla, osim ako vozilo ima ugrađenu kabinu (ZOBS čl. 91 st. 1). Od ponuđenog su tačni moped, motocikl i četvorocikl — za vozača radne mašine i traktora kaciga nije propisana." };
X[8821] = { ...(X[8821] || {}), x: "U oznaci 180/60 R 14 82 T broj 82 je INDEKS NOSIVOSTI pneumatika. Redom: 180 = širina u mm, 60 = odnos visine i širine u %, R = radijalna konstrukcija, 14 = prečnik naplatka u colima, 82 = nosivost, T = brzinska oznaka." };
X[8124] = { x: "Zona \"30\" je deo puta, ulice ili naselja u kojoj je brzina kretanja vozila ograničena do 30 km/h i mora biti obeležena propisanom saobraćajnom signalizacijom (ZOBS čl. 162). Ne mešaj sa \"zonom škole\" — deo puta u neposrednoj blizini škole je poseban pojam (čl. 163) i tipična zamka među ponuđenim odgovorima. Druga zamka — deo puta u kome kolovoz koriste pešaci i vozila — je definicija zone usporenog saobraćaja (čl. 161), u kojoj se vozi brzinom kretanja pešaka, najviše 10 km/h." };
X[8571] = { ...(X[8571] || {}), x: "Ispod 1,20 mg/ml nema obaveznog zadržavanja: takav vozač može biti zadržan samo ako izražava nameru, odnosno ako postoji opasnost da će nastaviti sa upravljanjem vozilom nakon što je isključen iz saobraćaja (ZOBS čl. 283 st. 2). Obavezno zadržavanje (do otrežnjenja, najduže 12 sati) važi tek kod teške, veoma teške i potpune alkoholisanosti — preko 1,20 mg/ml — i kod odbijanja ispitivanja." };
X[10579] = { ...(X[10579] || {}), x: "Kad susretneš ili te sustigne vozilo, odnosno vozila pod pratnjom (ZOBS čl. 107): dužan si da ih propustiš i da im omogućiš mimoilaženje i preticanje, odnosno obilaženje. Zaustavljanje ili uklanjanje vozila sa kolovoza je samo PO POTREBI — zato su odgovori sa \"obavezno\" pogrešni; kretanje nastavljaš tek kad prođu sva vozila pod pratnjom." };
X[8125] = { ...(X[8125] || {}), x: "Zona \"30\" je deo puta, ulice ili naselja u kojoj je brzina kretanja vozila ograničena do 30 km/h (ZOBS čl. 162), obeležena posebnim znakom na ulazu. Ne mešaj je sa pešačkom zonom (prvenstveno za pešake) ni sa zonom usporenog saobraćaja (vozi se brzinom kretanja pešaka, najviše 10 km/h)." };
X[10580] = { ...(X[10580] || {}), x: "Kad te vozilo pod pratnjom susretne ili sustigne (ZOBS čl. 107): propusti ga, omogući mimoilaženje/preticanje/obilaženje, PO POTREBI se zaustavi ili ukloni vozilo sa kolovoza, i pridržavaj se naredbi lica iz pratnje — kretanje nastavljaš tek kad prođu sva vozila pod pratnjom. Mamac su opcije sa 'obavezno': zaustavljanje i sklanjanje su samo po potrebi." };
X[10474] = { ...(X[10474] || {}), x: "Zakon klasifikuje od niže ka višoj vrsti: motocikl/moped/tricikl/četvorocikl → putničko vozilo → traktor → radna mašina → teretno vozilo → autobus → skup vozila (ZOBS čl. 52 st. 4). Od više ka nižoj to je upravo redosled iz tačnog odgovora: skup vozila, autobus, teretno vozilo, radna mašina, traktor, putničko vozilo, pa dvotočkaši — niže vozilo se povlači." };
X[8824] = { ...(X[8824] || {}), x: "U oznaci 180/60 R 14 82 T: 180 = širina u mm, 60 = odnos visine i širine u %, R = radijalna konstrukcija, 14 = prečnik naplatka u colima, 82 = indeks nosivosti, a poslednje slovo T = brzinska oznaka pneumatika (najveća dozvoljena brzina)." };
X[10090] = { ...(X[10090] || {}), x: "Zabranjeno je i zaustavljanje i parkiranje na biciklističkoj stazi, odnosno biciklističkoj traci (ZOBS čl. 66 st. 1 t. 8) — na obe površine, jer su namenjene saobraćaju bicikala, pa je odgovor 'samo staza' ili 'samo traka' pogrešan." };
X[10558] = { ...(X[10558] || {}), x: "Autoputem i motoputem sme se kretati samo motociklima, putničkim vozilima, teretnim vozilima i autobusima (ZOBS čl. 102) — mopedi, tricikli i četvorocikli NE smeju, iako su motorna vozila. Ni dozvoljena vozila ne smeju na autoput ako im je najveća konstruktivna brzina manja od 50 km/h (čl. 102 st. 2)." };


// ===== ZAVRŠNA KONTROLA 41 ZAMENE (2 proveravača — dijakritici i preciznost, 2026-08-26) =====
X[8815] = { ...(X[8815] || {}), x: "Oznaka pneumatika 195/65 R 16 89 N: dimenzije su kodovi 195/65 (širina u mm i odnos visine i širine u %) i 16 (prečnik naplatka u colima). R je konstrukcija, 89 nosivost, N brzinska oznaka — oni nisu dimenzije." };
X[9766] = { ...(X[9766] || {}), x: "Zabrane preticanja/obilaženja (ZOBS čl. 55 i 57): kolona, kad te neko već pretiče, kad je vozač ispred dao znak, kad ne možeš da se vratiš u svoju traku, zaustavnom i sporom trakom, preko neisprekidane linije, prevoj/nepregledna krivina i tunel (osim sa najmanje 2 trake u smeru), neposredno pred raskrsnicom i na njoj, prelaz preko pruge, kod pešačkog prelaza." };
X[10438] = { ...(X[10438] || {}), x: "Kada dva učesnika na semaforu istovremeno dobiju pravo prolaza (npr. vozilo koje skreće ulevo i vozilo iz suprotnog smera), njihov međusobni odnos rešavaju pravila saobraćaja — pravilo desne strane i pravilo levog skretanja (ZOBS čl. 47). Semafor taj međusobni odnos ne rešava." };
X[10474] = { ...(X[10474] || {}), x: "Zakon klasifikuje od niže ka višoj vrsti: motocikl/moped/tricikl/četvorocikl → putničko vozilo → traktor → radna mašina → teretno vozilo → autobus → skup vozila (ZOBS čl. 52 st. 4). Od više ka nižoj to je upravo redosled iz tačnog odgovora: skup vozila, autobus, teretno vozilo, radna mašina, traktor, putničko vozilo, pa grupa motocikl/moped/tricikl/četvorocikl — niže vozilo se povlači." };
X[10568] = { ...(X[10568] || {}), x: "Znaci vozila POD PRATNJOM: CRVENO i PLAVO trepćuće svetlo koja se naizmenično pale + zvučni znak promenljive frekvencije (ZOBS čl. 106). Crveno+plavo = pratnja; samo plavo = pravo prvenstva." };
X[10584] = { ...(X[10584] || {}), x: "Vozilo sa prvenstvom prolaza sme davati samo posebne svetlosne znake, bez sirene, kada su omogućene dovoljna vidljivost vozila i bezbednost učesnika (ZOBS čl. 108 st. 4). Puna zakonska formulacija vezuje još i kretanje brzinom koja nije veća od dozvoljene i uslov da bi sirena omela izvršenje službenog zadatka — srodno pitanje traži sva tri uslova." };


// --- Značenje izraza (sub 94), 46 pitanja — pisano pojedinačno (ZOBS čl. 7) ---
X[7930] = { ...(X[7930]||{}), x: "Saobraćaj je kretanje VOZILA I LICA na putevima (ZOBS čl. 7) — a put je površina koju kao saobraćajnu mogu da koriste svi ili određeni učesnici, pod uslovima iz zakona. Ulica, zemljani put i trotoar jesu put; trkačka staza, njiva i površina koju vlasnik otvara samo za odabrane NISU put, pa kretanje po njima nije saobraćaj." };
X[7931] = { ...(X[7931]||{}), x: 'Guranje bicikla pešačkom stazom JESTE saobraćaj (lice koje gura vozilo je PEŠAK — učesnik), kao i motokultivator zemljanim putem i bicikl stazom. Plato, trg i poligon za probne vožnje nisu put, pa kretanje po njima nije saobraćaj (ZOBS čl. 7).' };
X[7932] = { ...(X[7932]||{}), x: 'VOZAČ je lice koje NA PUTU UPRAVLJA vozilom (ZOBS čl. 7) — nije dovoljno imati dozvolu (to je samo vozač po ispravi, ne u saobraćaju), a ko vozilo gura ili vuče sopstvenom snagom — taj je PEŠAK.' };
X[7933] = { ...(X[7933]||{}), x: "PEŠAK je i lice u dečjem prevoznom sredstvu ili kolicima za nemoćna lica koje pokreće sopstvenom snagom ILI SNAGOM MOTORA, i lice koje se kreće po putu, i lice koje sopstvenom snagom vuče/gura vozilo ili kolica (ZOBS čl. 7). Ko UPRAVLJA biciklom, zapregom ili motokultivatorom — taj je vozač, ne pešak." };
X[7934] = { ...(X[7934]||{}), x: 'Pešak je i onaj ko GURA bicikl (ne vozi ga!) i ko se kreće klizaljkama, skijama, sankama, koturaljkama ili skejtbordom (ZOBS čl. 7). Čim sedneš na bicikl i voziš — postaješ vozač.' };
X[7936] = { ...(X[7936]||{}), x: 'ZAUSTAVLJANJE traži ISTOVREMENO tri uslova (ZOBS čl. 7): prekid do TRI minuta + nije nastupio po znaku ili pravilu + vozač NIJE napustio vozilo. Isključen motor, prazno vozilo ili "udaljio se 5 m" nisu deo definicije — to su mamci.' };
X[7937] = { ...(X[7937]||{}), x: "U ovom pitanju očekuje se odgovor zaustavljanje: prekid traje dva minuta, a vozač nije napustio vozilo. To važi ako prekid nije nastupio radi postupanja po znaku ili pravilu saobraćaja. Čekanje na crveno, na primer, izuzeto je iz ove zakonske definicije (čl. 7, tačka 71)." };
X[7938] = { ...(X[7938]||{}), x: "Ako vozač napusti vozilo, običan prekid kretanja smatra se parkiranjem i kada traje samo dva minuta. Trajanje kraće od tri minuta nije dovoljno za zaustavljanje: vozač mora ostati u vozilu. Prekidi radi postupanja po znaku ili pravilu izuzeti su iz obe definicije (čl. 7, tačke 71–72)." };
X[7940] = { ...(X[7940]||{}), x: 'Prolaženje pored učesnika koji dolazi IZ SUPROTNOG SMERA = MIMOILAŽENJE (ZOBS čl. 7). Preticanje je isti smer u kretanju, obilaženje je pored nepokretnog, propuštanje je radnja ustupanja.' };
X[7942] = { ...(X[7942]||{}), x: 'Prolaženje pored učesnika koji se KREĆE istim kolovozom U ISTOM SMERU = PRETICANJE (ZOBS čl. 7). Ključ za razlikovanje: kreće se → preticanje; stoji → obilaženje; suprotni smer → mimoilaženje.' };
X[7944] = { ...(X[7944]||{}), x: 'Prolaženje pored učesnika koji se NE POMERA (zaustavljeno vozilo, prepreka) = OBILAŽENJE (ZOBS čl. 7). Ako se pomera u istom smeru, to je preticanje.' };
X[7948] = { ...(X[7948]||{}), x: 'Odstojanje na kome se KOLOVOZ JASNO VIDI = VIDLJIVOST (zavisi od svetla, padavina, magle). PREGLEDNOST je drugo — nju ograničavaju FIZIČKE prepreke (krivina, objekat, teren). ZOBS čl. 7.' };
X[7953] = { ...(X[7953]||{}), x: "Radnja kojom omogućavaš kretanje drugog učesnika KOJI IMA PRVENSTVO PROLAZA — tako da on ne menja dotadašnji način kretanja i da ne dođe do kontakta — je PROPUŠTANJE (ZOBS čl. 7). Mimoilaženje, preticanje i obilaženje su prolaženja pored nekog; propuštanje je jedino ustupanje." };
X[7954] = { ...(X[7954]||{}), x: 'Smanjena vidljivost VAN naselja: vidljivost manja od 200 m (ZOBS čl. 7). U naselju je prag 100 m. Par za pamćenje: van naselja 200 / u naselju 100.' };
X[7957] = { ...(X[7957]||{}), x: "Od ponuđenih uslova biraju se najmanje tri vozila i njihova zaustavljenost u istoj saobraćajnoj traci. Cela definicija kolone traži i da su jedno iza drugog u istom smeru, da im je kretanje međusobno uslovljeno i da između njih drugo vozilo ne može da uđe bez ometanja. Dva vozila ili sam niz parkiranih vozila nisu kolona (čl. 7, tačka 77)." };
X[7958] = { ...(X[7958]||{}), x: 'Kolona U KRETANJU traži tri uslova: najmanje TRI vozila + jedno iza drugog istom trakom u istom smeru + međusobno uslovljeno kretanje u koje drugo vozilo ne može ući bez ometanja (ZOBS čl. 7). Razmak koji dozvoljava ubacivanje = nije kolona.' };
X[7962] = { ...(X[7962]||{}), x: 'U naselju su uslovi smanjene vidljivosti kada je vidljivost manja od 100 m. Izvan naselja: vidljivost manja od 200 m (ZOBS čl. 7, tač. 80).' };
X[7965] = { ...(X[7965]||{}), x: "SAOBRAĆAJNA NEZGODA traži: dogodila se NA PUTU (ili je započeta na putu), učestvovalo bar jedno vozilo U POKRETU, i nastala je šteta, povreda ili smrt (ZOBS čl. 7). Izletanje s puta uz rušenje ograde ispunjava sve uslove — šteta ne mora nastati na samom putu niti mora biti povređenih." };
X[7966] = { ...(X[7966]||{}), x: "U ovom ispitnom primeru nezgoda se dogodila na trkačkoj stazi koja se ne smatra putem, pa nije saobraćajna nezgoda u smislu člana 7, tačke 82. Povreda i materijalna šteta same nisu dovoljne: događaj mora da se dogodi ili započne na putu, uz najmanje jedno vozilo u pokretu. Ovo nije pravilo da svaka površina sa ograničenim pristupom nije put." };
X[7974] = { ...(X[7974]||{}), x: 'Srednja brzina = pređeni put / vreme. 300 km za 2 sata = 150 km/h. Ne mešaj sa trenutnom brzinom (ono što pokazuje brzinomer u jednom trenutku).' };
X[7977] = { ...(X[7977]||{}), x: 'UKUPNA masa = masa vozila + masa lica i tereta koji su NA njemu (stvarno stanje sada). NAJVEĆA DOZVOLJENA masa je gornja granica koju deklariše proizvođač — papirna vrednost, ne trenutna (ZOBS čl. 7).' };
X[7982] = { ...(X[7982]||{}), x: 'REGISTROVANO vozilo = upisano u jedinstveni registar + izdate registarske tablice i nalepnica + izdata saobraćajna dozvola — sva tri (ZOBS čl. 7). Privremene tablice nisu registracija, a učestvovanje u saobraćaju je posledica, ne uslov.' };
X[7983] = { ...(X[7983]||{}), x: 'Javna isprava (rešenje) koja s registracionom nalepnicom daje pravo korišćenja vozila = SAOBRAĆAJNA dozvola (za VOZILO). Vozačka je za tebe (lice), tablica je oznaka na vozilu — tri različite stvari.' };
X[7984] = { ...(X[7984]||{}), x: "Oznaka na vozilu da je upisano u jedinstveni registar = REGISTARSKA TABLICA (ZOBS čl. 7). Saobraćajna dozvola je isprava, ne oznaka na vozilu. Tablice za privremeno označavanje ne dokazuju taj upis: koriste se u posebnim slučajevima, uključujući odlazak registrovanog vozila sa isteklom nalepnicom na tehnički pregled, opravku ili ispitivanje (čl. 269)." };
X[7985] = { ...(X[7985]||{}), x: 'Oznaka kojom se određuje DA VOZILO SME U SAOBRAĆAJ U ODREĐENOM ROKU = REGISTRACIONA NALEPNICA (ZOBS čl. 7) — ona nosi rok; tablica nosi identitet, dozvola je isprava.' };
X[7986] = { ...(X[7986]||{}), x: 'Javna isprava koja LICU daje pravo da upravlja vozilom = VOZAČKA dozvola (ZOBS čl. 7). Saobraćajna prati vozilo; uverenje o položenom ispitu nije dozvola — s njim se tek vadi dozvola.' };
X[7987] = { ...(X[7987]||{}), x: "Dovođenje vozila, uređaja ili sklopova u ispravno stanje = POPRAVKA. PREPRAVKA menja konstruktivne karakteristike: namenu, vrstu vozila ili deklarisane karakteristike vozila, uređaja ili sklopova (ZOBS čl. 7). Tehnički pregled utvrđuje tehničku ispravnost i ispunjenost propisanih uslova, a ne popravlja vozilo (čl. 254)." };
X[7988] = { ...(X[7988]||{}), x: 'Promena KONSTRUKTIVNIH karakteristika (namena, vrsta vozila...) = PREPRAVKA (ZOBS čl. 7) — posle nje sledi ispitivanje vozila. Popravka samo vraća u ispravno stanje.' };
X[7990] = { ...(X[7990]||{}), x: 'BICIKL: NAJMANJE dva točka + pokreće se SNAGOM VOZAČA (pedale/ručice) — ZOBS čl. 7. Zamke: "ima dva točka" je preusko (tricikl-bicikl postoji), a 45 km/h i 4 kW su granice MOPEDA, ne definicija bicikla.' };
X[7996] = { ...(X[7996]||{}), x: "Brzina 40 km/h (do 45) + dva točka + motor sa unutrašnjim sagorevanjem do 50 cm³ = MOPED (ZOBS čl. 7). Efektivna snaga od 5 kW je mamac — moped sa motorom sa unutrašnjim sagorevanjem NEMA ograničenje snage; granica od 4 kW važi samo za električni pogon." };
X[7997] = { ...(X[7997]||{}), x: "I kad pogon nije na benzin, moped se ceni po zapremini: zakon granicu od 50 cm³ vezuje za motor sa unutrašnjim sagorevanjem uopšte, ne samo benzinski (ZOBS čl. 7). 45 cm³ je do 50, a 40 km/h do 45 → MOPED; snaga od 5 kW nije kriterijum za moped." };
X[7998] = { ...(X[7998]||{}), x: "Električni pogon: trajna nominalna snaga do 4 kW + brzina do 45 km/h + dva točka = MOPED (ZOBS čl. 7) — kod struje ulogu kubikaže igra snaga. Preko 4 kW ili preko 45 km/h → motocikl." };
X[8005] = { ...(X[8005]||{}), x: "U ovom pitanju zajedno se biraju raspored točkova (dva ili tri asimetrična) i najveća konstruktivna brzina preko 45 km/h. Za benzinski motocikl obavezan je taj raspored, a uz njega je dovoljan jedan od pragova: brzina preko 45 km/h ili zapremina preko 50 cm³ (ZOBS čl. 7). Zapremina do 50 cm³ zato ne isključuje motocikl ako je brzina veća od 45 km/h. „Najmanje dva točka” nije dovoljno precizan raspored." };
X[8006] = { ...(X[8006]||{}), x: "Isti uslovi kao za benzin: dva ili tri asimetrično raspoređena točka i najveća konstruktivna brzina preko 45 km/h dovoljni su za MOTOCIKL. Granica od 50 cm³ kod motocikla i mopeda važi za svaki motor sa unutrašnjim sagorevanjem, a ne samo benzinski. Kod lakog i teškog tricikla i lakog četvorocikla, kriterijum zapremine vezan je za benzinski motor; za druga goriva koristi se efektivna snaga (ZOBS čl. 7)." };
X[8007] = { ...(X[8007]||{}), x: 'U ovom pitanju dovoljna su oba uslova zajedno: dva točka ili tri asimetrično raspoređena točka, i najveća trajna nominalna snaga preko 4 kW. Snaga do 4 kW sama ne znači moped: električni moped ima dva točka, najveću konstruktivnu brzinu do 45 km/h i najveću trajnu nominalnu snagu do 4 kW. Električno vozilo sa dva točka i najvećom konstruktivnom brzinom preko 45 km/h može biti motocikl i sa snagom do 4 kW (ZOBS čl. 7, tač. 34 i 36).' };
X[8008] = { ...(X[8008]||{}), x: "Tri točka ASIMETRIČNO raspoređena + brzina preko 45 km/h = MOTOCIKL sa bočnim sedištem (ZOBS čl. 7) — ne tricikl! Simetričan raspored točkova pravi tricikl; asimetričan ostaje motocikl." };
X[8009] = { ...(X[8009]||{}), x: "50 km/h (preko 45) + tri ASIMETRIČNA točka = MOTOCIKL sa bočnim sedištem. Kubikaža od 45 cm³ je mamac za \"moped\" — moped mora imati DVA točka i brzinu do 45 km/h, a ovde ne važi nijedno; asimetrija isključuje tricikl." };
X[8010] = { ...(X[8010]||{}), x: "Električni pogon: trajna nominalna snaga 5 kW PRELAZI 4 kW → nije moped ni laki tricikl; TRI točka su ASIMETRIČNO raspoređena → nije tricikl, nego MOTOCIKL sa bočnim sedištem (ZOBS čl. 7). Brzina od 45 km/h ovde ne odlučuje (ne prelazi 45) — odlučuju snaga i asimetrija." };
X[8011] = { ...(X[8011]||{}), x: "U ovom pitanju dovoljni su zajedno tri simetrično raspoređena točka i najveća konstruktivna brzina preko 45 km/h. Benzinski TEŠKI TRICIKL uvek ima tri simetrično raspoređena točka, a uz njih je dovoljan jedan od pragova: brzina preko 45 km/h ili zapremina preko 50 cm³ (ZOBS čl. 7). Snaga preko 4 kW je kriterijum za druge vrste pogona. Simetričan raspored razlikuje ga od motocikla sa bočnim sedištem." };
X[8013] = { ...(X[8013]||{}), x: 'Električni: 5 kW (>4) + tri SIMETRIČNA točka = TEŠKI TRICIKL. Ista snaga sa dva točka dala bi motocikl — raspored točkova odlučuje.' };
X[8015] = { ...(X[8015]||{}), x: '50 km/h (>45) + tri SIMETRIČNA točka = TEŠKI TRICIKL — preko granice brzine, pa nije laki; simetrija, pa nije motocikl.' };
X[8016] = { ...(X[8016]||{}), x: 'Ista kombinacija (preko 45 km/h, tri simetrična točka) = TEŠKI TRICIKL, nezavisno od vrste motora.' };
X[10406] = { ...(X[10406]||{}), x: "U ovom pitanju označavaju se tri ponuđena uslova: tri simetrično raspoređena točka, najveća konstruktivna brzina preko 45 km/h i najveća trajna nominalna snaga preko 4 kW. Ta kombinacija jeste električni TEŠKI TRICIKL. Definicija uvek traži tri simetrično raspoređena točka, a uz njih najmanje jedan prag: brzinu preko 45 km/h ili najveću trajnu nominalnu snagu preko 4 kW. Ne moraju obe granice biti premašene (ZOBS čl. 7, tač. 37)." };
X[10613] = { ...(X[10613]||{}), x: "Odstojanje na kome se, s obzirom na fizičke prepreke (krivina, objekat, breg), u uslovima normalne vidljivosti jasno vidi drugi učesnik ili moguća prepreka na putu = PREGLEDNOST (ZOBS čl. 7). Vidljivost opisuje koliko daleko se jasno vidi kolovoz; na nju utiču, na primer, osvetljenje i magla. Preglednost posebno uzima u obzir fizičke prepreke." };
X[10683] = { ...(X[10683]||{}), x: "MASA PRAZNOG VOZILA — deklariše je PROIZVOĐAČ: neopterećeno vozilo sa karoserijom, najmanje 90% goriva, punim rezervoarima tečnosti, stalnim teretom, rezervnim točkom i alatom (ZOBS čl. 7). MASA VOZILA je šira (vozilo spremno za vožnju, kod većine vozila i vozač od 75 kg), a UKUPNA masa dodaje još lica i teret." };
X[10686] = { ...(X[10686]||{}), x: "NAJVEĆU DOZVOLJENU MASU deklariše proizvođač vozila. Razlikuj je od NAJVEĆE DOZVOLJENE UKUPNE MASE, koju propisuje nadležni državni organ. Nosivost je razlika najveće dozvoljene mase i mase vozila; prvi netačan odgovor koristi drugi pojam — najveću dozvoljenu ukupnu masu (ZOBS čl. 7, tač. 58–61)." };


// --- Semafori (sub 162), 20 tekstualnih pitanja — pisano pojedinačno (ZOBS čl. 136-147) ---
X[9339] = { x: 'Zakon obe namene navodi u istoj rečenici: semafori se upotrebljavaju "za regulisanje saobraćaja i označavanje radova i prepreka na putu" (ZOBS čl. 136). Obaveštenja i poruke sa izmenjivim sadržajem daju drugi uređaji, a vozila se semaforima ne označavaju.' };
X[9340] = { x: 'Svetlosne saobraćajne znakove emituju SEMAFORI (ZOBS čl. 136). Svetlosne oznake na putu i znakovi sa izmenljivim sadržajem poruka su druge kategorije signalizacije — nisu uređaji za davanje svetlosnih saobraćajnih znakova.' };
X[9341] = { x: 'Crveno svetlo = ZABRANJEN PROLAZ, bez ikakvog izuzetka (ZOBS čl. 142 t. 1). Izuzetak "osim kada se vozilo ne može bezbedno zaustaviti" važi za ŽUTO svetlo (t. 2) — to je glavni mamac; "prolaz uz povećanu opreznost" je trepćuće žuto.' };
X[9342] = { x: 'Zeleno svetlo = DOZVOLJEN PROLAZ (ZOBS čl. 142 t. 3). "Povećana opreznost" je značenje trepćućeg žutog, a zabrana je crveno — samo zapamti da pri skretanju i dalje propuštaš pešake na prelazu.' };
X[9343] = { x: 'Crveno + žuto ISTOVREMENO = i dalje ZABRANJEN prolaz + nagoveštaj da će se uključiti zeleno (ZOBS čl. 142 t. 4) — "pripremi se", ali kretanje još nije dozvoljeno. Najava crvenog ovom kombinacijom ne postoji: žuto uz crveno se pali samo pre zelenog (čl. 141).' };
X[9344] = { x: "Isto značenje kao crveno+žuto bez strelica, samo suženo na smer strelice: ZABRANJEN prolaz u smeru označenom strelicom + nagoveštaj da će se uključiti zeleno (ZOBS čl. 142 t. 4; direkcioni semafor po čl. 138 reguliše kretanje po smerovima). Oba mamca nude \"dozvoljen prolaz\" — dok je na ovom znaku uključeno crveno, prolaz u smeru strelice je zabranjen." };
X[9349] = { x: 'Trepćuće zeleno sa strelicom = DOZVOLJEN prolaz u smeru strelice + nagoveštaj skorog prestanka: sledi žuto, pa crveno (ZOBS čl. 142 t. 6; smerovi po čl. 138). Trepćuće zeleno nikad ne znači zabranu — to je poslednji deo zelene faze.' };
X[9354] = { x: "Zeleno svetlo sa strelicom (direkcioni semafor, ZOBS čl. 138) znači dozvoljen prolaz SAMO u smeru strelice (čl. 142 t. 3), inače važi kao obično zeleno. Mamac o \"povećanoj opreznosti\" je značenje trepćućeg ŽUTOG (čl. 142 t. 5), a mamac o propuštanju meša dva pravila: obavezu uz DODATNU zelenu strelicu (uslovni znak, čl. 143 — propuštaš vozila na putu na koji ulaziš i pešake, dok gori crveno ili žuto) i propuštanje vozila iz suprotnog smera pri skretanju ulevo (čl. 47) — nijedno nije značenje ovog znaka." };
X[9355] = { x: 'Trepćuće žuto = obaveza za SVE učesnike da se kreću uz povećanu opreznost (ZOBS čl. 142 t. 5) — semafor tada ništa ne zabranjuje, raskrsnicom vladaju znakovi i pravila prvenstva. Zabrana sa izuzetkom je značenje POSTOJANOG žutog.' };
X[9356] = { x: 'Trepćuće zeleno = prolaz i dalje DOZVOLJEN + nagoveštaj skorog prestanka: uključiće se žuto, pa crveno (ZOBS čl. 142 t. 6). Zabrane tu nema — to je najava kraja zelene faze.' };
X[9362] = { x: 'Žuto sa strelicom = ZABRANJEN prolaz u smeru strelice, OSIM ako se vozilo ne može bezbedno zaustaviti ispred znaka (ZOBS čl. 142 t. 2; smerovi po čl. 138). Žuto nikad ne znači "dozvoljen prolaz uz najavu crvenog" — žuto je zabrana sa jednim izuzetkom.' };
X[9365] = { x: 'Crveno sa strelicom = ZABRANJEN prolaz u smeru strelice, BEZ izuzetka (ZOBS čl. 142 t. 1; smerovi po čl. 138). Izuzetak "ne može bezbedno da se zaustavi" pripada žutom svetlu — kod crvenog ne postoji.' };
X[9366] = { x: 'Trepćuće žuto (i sa strelicom) = obaveza povećane opreznosti za sve učesnike (ZOBS čl. 142 t. 5) — ne zabranjuje prolaz. Par za pamćenje: POSTOJANO žuto = zabrana s izuzetkom; TREPĆUĆE žuto = oprez.' };
X[9367] = { x: 'Zelena strelica dodata semaforu (uslovni znak) dozvoljava prolaz SAMO u smeru strelice dok gori crveno ili žuto — ali uz obavezu da propustiš pešake koji prelaze kolovoz i SVA vozila na putu na koji ulaziš (ZOBS čl. 143). Uslovni prolaz znači: bez ikakvog prvenstva; ne važi samo za javni prevoz.' };
X[9369] = { x: 'Vertikalni raspored: CRVENO GORE, žuto u sredini, zeleno dole (ZOBS čl. 139). Pomoć za pamćenje: što opasnije, to više — crveno je na vrhu.' };
X[9378] = { x: 'Horizontalni raspored (kada je semafor iznad saobraćajne trake): CRVENO LEVO, žuto u sredini, zeleno desno (ZOBS čl. 139). Isto pravilo kao kod vertikale, samo "gore" postaje "levo".' };
X[9379] = { x: "Postojano žuto = ZABRANJEN prolaz, osim kada se vozilo ne može bezbedno zaustaviti ispred znaka (ZOBS čl. 142 t. 2). Žuto nikad ne znači \"dozvoljen prolaz uz najavu crvenog\" — takvo značenje ima trepćuće ZELENO, a žuto nije \"požuri\", nego \"stani ako bezbedno možeš\"." };
X[9383] = { x: 'Uređaji za tramvaje daju BELA svetla u obliku crta: POLOŽENA (vodoravna) crta = ZABRANA saobraćaja tramvaja, a uspravna ili kosa = slobodan prolaz u odgovarajućem smeru (ZOBS čl. 147). Položena crta = "spuštena rampa".' };
X[9385] = { x: 'Tramvajski svetlosni znakovi važe i za vozila javnog prevoza putnika, ali SAMO kada se ona kreću trakom kojom se kreću i tramvaji (ZOBS čl. 147). Mamac: traka rezervisana za javni prevoz na kojoj NEMA tramvaja ne potpada — uslov je zajednička traka sa tramvajima.' };
X[11055] = { x: 'Uspravna ili kosa bela crta = SLOBODAN PROLAZ u odgovarajućem smeru (ZOBS čl. 147); zabrana je položena crta. Crta pokazuje smer u kome je prolaz dozvoljen, a ne pravac pružanja šina.' };

// --- Oznake na kolovozu (sub 161), 18 tekstualnih pitanja — pisano pojedinačno
// (Pravilnik o saobraćajnoj signalizaciji čl. 58-66, ZOBS čl. 133; verbatim provereno u scratchpad tekstovima) ---
X[9244] = { x: 'Linija koja razdvaja kolovoz na kolovozne, odnosno saobraćajne trake je RAZDELNA linija (Pravilnik o signalizaciji čl. 63). Ivična linija označava ivicu kolovoza, a linija upozorenja najavljuje blizinu neisprekidane — obe su mamci iz susednih definicija.' };
X[9247] = { x: "NE — oznake na kolovozu i trotoaru su POSEBNA vrsta saobraćajne signalizacije, ravnopravna sa znakovima: signalizaciju čine saobraćajni znakovi, oznake na kolovozu i trotoaru, semafori, kao i svetlosne i druge oznake na putu (ZOBS čl. 133). Oznake često prate znakove, ali same nisu znakovi." };
X[9262] = { x: 'Udvojena ISPREKIDANA razdelna linija obeležava saobraćajnu traku sa IZMENLJIVIM smerom kretanja, na kojoj je saobraćaj regulisan semaforima iznad trake (Pravilnik o signalizaciji čl. 63) — zato idu OBA odgovora zajedno. Takva traka nije "za preticanje": kome je u kom trenutku dozvoljena, određuje semafor iznad nje.' };
X[9286] = { x: 'Na kolovozu pored pešačkog prelaza u blizini škole ispisuje se natpis "ŠKOLA" (Pravilnik o signalizaciji). "Zona škole" je naziv saobraćajnog ZNAKA (III-28), a natpis "DECA NA PUTU" ne postoji — na asfaltu piše samo ŠKOLA.' };
X[10994] = { x: 'Površine za POSEBNE NAMENE (mesta zabrane zaustavljanja/parkiranja, autobuska stajališta, taksi mesta) obeležavaju se ŽUTOM bojom — jedan od izuzetaka od pravila da su oznake bele (Pravilnik o signalizaciji čl. 59). Plavom se, izuzetno, smeju obeležiti samo delovi oznaka invalidskih parking mesta.' };
X[10995] = { x: "Po pravilu, oznake na putu su BELE boje (Pravilnik o signalizaciji čl. 59). Žuta je rezervisana za pobrojane izuzetke (zona radova, javni prevoz, elektronska naplata putarine, posebne namene, invalidska mesta), narandžasta ne postoji, a plava se javlja samo izuzetno — njome se smeju obeležiti delovi oznaka invalidskih parking mesta." };
X[10996] = { x: "Oznake za regulisanje kretanja vozila JAVNOG PREVOZA putnika su ŽUTE (Pravilnik o signalizaciji čl. 59) — otud žuta BUS traka. Jedan od pet žutih izuzetaka od belog pravila; plavom se, izuzetno, smeju obeležiti samo delovi invalidskih parking mesta." };
X[10997] = { x: "Oznake u ZONI RADOVA na putu su ŽUTE (Pravilnik o signalizaciji čl. 59) — privremeni režim se bojom jasno razlikuje od stalnih belih oznaka; plava tu nije predviđena. U zoni radova i znakovi opasnosti i izričitih naredbi dobijaju žutu osnovu (čl. 45)." };
X[10998] = { x: "Traka za ELEKTRONSKU NAPLATU putarine obeležava se ŽUTOM bojom (Pravilnik o signalizaciji čl. 59). Žute izuzetke pamti kao celinu: radovi, javni prevoz, e-naplata, posebne namene, invalidska mesta — sve ostalo je belo, s tim što se plavom, izuzetno, smeju obeležiti samo delovi invalidskih parking mesta." };
X[11000] = { x: 'Razdelna NEISPREKIDANA linija = zabrana prelaska preko nje I zabrana kretanja po njoj, bezuslovno (Pravilnik o signalizaciji čl. 63) — ne zavisi od znaka "Zabrana preticanja". Mesto zaustavljanja označava poprečna linija zaustavljanja, ne razdelna.' };
X[11001] = { x: 'Linija vodilja = razdelna KRATKA ISPREKIDANA linija kojom se vozila VODE KROZ RASKRSNICU (Pravilnik o signalizaciji čl. 63). Druga dva odgovora opisuju neisprekidanu, odnosno kombinovanu liniju — druge vrste razdelnih linija.' };
X[11004] = { x: 'Kombinovana linija (neisprekidana i isprekidana uporedo): zabrana važi za vozila u čijoj je traci NEISPREKIDANA linija bliža desnoj ivici kolovoza (Pravilnik o signalizaciji čl. 63). Praktično: gledaj liniju BLIŽU sebi — puna uz tebe = ne smeš preko; isprekidana uz tebe = smeš.' };
X[11006] = { x: 'Kombinovana linija DOZVOLJAVA prelazak vozilima u čijoj je traci ISPREKIDANA linija bliža desnoj ivici kolovoza (Pravilnik o signalizaciji čl. 63) — isprekidana uz tebe = smeš, puna uz tebe = zabrana. Povlači se tamo gde preglednost dopušta preticanje samo u jednom smeru, zato jedna strana sme, a druga ne.' };
X[11011] = { x: 'Linija koja označava IVICU površine kolovoza je IVIČNA linija (Pravilnik o signalizaciji čl. 64). Razdelna deli trake unutar kolovoza, a linija upozorenja najavljuje blizinu neisprekidane.' };
X[11040] = { x: "Blizinu neisprekidane linije najavljuje razdelna LINIJA UPOZORENJA (Pravilnik o signalizaciji čl. 63). Njena poruka vozaču: uskoro puna linija — završi preticanje na vreme. Obična isprekidana samo razdvaja saobraćajne trake, a ivična označava ivicu površine kolovoza (čl. 64) — ništa ne najavljuje." };
X[11041] = { x: "Sve nabrojano — linija zaustavljanja, kosnik, graničnik, pešački prelaz i prelazi biciklističke staze — jesu POPREČNE oznake na putu (Pravilnik o signalizaciji čl. 66); obeležavaju se popreko kolovoza i mogu zahvatati jednu ili više saobraćajnih traka (čl. 65). Uzdužne su razdelne i ivične linije (čl. 62), a \"ostale oznake\" su strelice, natpisi, polja za usmeravanje i slično (čl. 67)." };
X[11042] = { x: 'Neisprekidana linija zaustavljanja ispred SEMAFORA obavezuje na zaustavljanje SAMO kada ti je svetlosnim znakom prolaz zabranjen (Pravilnik o signalizaciji) — na zeleno prolaziš bez zaustavljanja. Ista linija ispred znaka "Zabrana prolaska bez zaustavljanja" (carina, policija, putarina) znači bezuslovno zaustavljanje.' };
X[11051] = { x: 'Linija zaustavljanja ispred znaka "Zabrana prolaska bez zaustavljanja" (carina, policija, naplatno mesto) = MORAŠ zaustaviti vozilo, bezuslovno (Pravilnik o signalizaciji). Rampa ili znak ovlašćenog lica NISU uslov — zaustavljanje nalažu sami znak i linija.' };


// --- Znaci ovlašćenih lica (sub 166), 17 tekstualnih pitanja — pisano pojedinačno
// (Pravilnik o znacima koje daju policijski službenici, Sl. glasnik 56/2010, čl. 2-11; ZOBS čl. 107/109/110/166) ---
X[9475] = { x: 'Znake za SMANJENJE brzine, UBRZANJE i ZAUSTAVLJANJE policijski službenik može davati i iz vozila, odnosno sa motocikla — pod uslovom da službenik, odnosno vozilo, ima VIDNO OBELEŽJE policije (Pravilnik o znacima policijskih službenika čl. 2). Nije ograničeno na vozila sa prvenstvom prolaza — dovoljno je obeležje.' };
X[9476] = { x: 'Ista odredba kao za smanjenje brzine i zaustavljanje: ova tri znaka smeju se davati i iz vozila, odnosno sa motocikla, kada postoji vidno obeležje policije (Pravilnik o znacima policijskih službenika čl. 2). Uslov je obeležje, ne prvenstvo prolaza.' };
X[9477] = { x: "I znaci za zaustavljanje vozila spadaju u tri znaka koja se smeju davati iz vozila, odnosno sa motocikla sa vidnim obeležjem policije (Pravilnik o znacima policijskih službenika čl. 2) — zajedno sa smanjenjem brzine i ubrzanjem kretanja. Uslov je vidno obeležje, ne prvenstvo prolaza." };
X[9478] = { x: 'Pištaljka ide SAMO uz znake rukama i SAMO kad je policijski službenik VAN vozila (Pravilnik o znacima policijskih službenika čl. 6). Logika: zvižduk prati gestikulaciju pri regulisanju na raskrsnici — iz vozila ne bi imao smisla.' };
X[9479] = { x: 'Jedan DUŽI zvižduk = poziv da obratiš pažnju na policijskog službenika koji će dati odgovarajući znak (Pravilnik o znacima policijskih službenika čl. 6). Prekršaj označava VIŠE KRATKIH zvižduka, a obavezu zaustavljanja pištaljka sama po sebi ne izriče.' };
X[9480] = { x: "VIŠE uzastopnih KRATKIH zvižduka = neko je postupio protivno datom znaku, pravilima saobraćaja ili znakovima (Pravilnik o znacima policijskih službenika čl. 6). Par za pamćenje: jedan dug = \"pažnja\", više kratkih = \"prekršaj\" — a obavezu zaustavljanja pištaljka sama po sebi ne izriče." };
X[9481] = { x: 'Kad čuješ više kratkih zvižduka, dužnost je: OSMATRANJEM policijskog službenika utvrdi da li se znak odnosi na tebe (Pravilnik o znacima policijskih službenika čl. 6) — službenik istovremeno rukom pokazuje na koga se odnosi i šta treba da učini. Ne staješ automatski, a ubrzanje pogotovo nije odgovor.' };
X[10420] = { x: "Znaci policijskog službenika daju se: RUKAMA i položajem tela, UREĐAJIMA za svetlosne i zvučne znakove i \"stop tablicom\" (Pravilnik o znacima policijskih službenika čl. 1; ZOBS čl. 166). Zamke: usmeno se po ZOBS čl. 166 daju naredbe, zastavice koriste RADNICI na radovima na putu, a znakovi sa izmenjivim sadržajem poruka su saobraćajna signalizacija, ne znaci policijskog službenika." };
X[10422] = { x: "Crveno i plavo naizmenično = vozilo POD PRATNJOM: propusti ih i omogući mimoilaženje/preticanje/obilaženje, PO POTREBI zaustavi ili ukloni vozilo s kolovoza, strogo se pridržavaj naredbi lica iz pratnje, a nastavi tek kad SVA vozila pod pratnjom prođu (Pravilnik o znacima policijskih službenika čl. 9 t. 1; ZOBS čl. 107). Oba mamca padaju: bezuslovno \"zaustavi se\" — zaustavljanje je samo PO POTREBI, a \"smanji brzinu i nastavi\" — obaveza je propuštanje, ne samo usporavanje." };
X[10423] = { x: 'DVA plava svetla na vozilu s prvenstvom prolaza koje se KREĆE = ono obezbeđuje prolaz vozilima iza sebe: obrati pažnju na njega I na vozila kojima obezbeđuje prolaz, propusti ih, po potrebi zaustavi ili ukloni svoje vozilo, pridržavaj se naredbi lica iz vozila (Pravilnik o znacima policijskih službenika čl. 9 t. 2; ZOBS čl. 109). "Smanji brzinu i nastavi" i bezuslovno zaustavljanje su mamci.' };
X[10424] = { x: "JEDNO plavo svetlo na vozilu s prvenstvom prolaza u kretanju = obrati pažnju, ustupi mu prvenstvo odnosno propusti ga, i PO POTREBI zaustavi ili ukloni svoje vozilo dok prođe (Pravilnik o znacima policijskih službenika čl. 9 t. 3). Jedno svetlo = samo to vozilo; dva svetla znače da obezbeđuje prolaz i vozilima iza sebe. Mamci: \"smanji brzinu i nastavi\" nije propisana obaveza, a bezuslovno \"zaustavi se dok sva vozila prođu\" greši dvostruko — zaustavljanje je samo po potrebi, a reč je o JEDNOM vozilu." };
X[10425] = { x: 'Plavo svetlo na vozilu s prvenstvom prolaza koje STOJI na kolovozu = smanji brzinu, PO POTREBI zaustavi i postupaj po naredbama policijskog službenika (Pravilnik o znacima policijskih službenika čl. 9, poslednji stav). Vozilo koje stoji ne traži propuštanje nego oprez — bezuslovno zaustavljanje je opet mamac.' };
X[10426] = { x: 'Isto pravilo kao za jedno svetlo: i DVA plava svetla na vozilu koje STOJI znače — smanji brzinu, po potrebi zaustavi, postupaj po naredbama službenika (Pravilnik o znacima policijskih službenika čl. 9, poslednji stav pokriva i t. 2 i t. 3 kad vozilo stoji). Razlika jedno/dva svetla ima značaj samo za vozilo U KRETANJU.' };
X[10427] = { x: 'Kompletna obaveza prema vozilima POD PRATNJOM u jednoj rečenici: propusti + omogući mimoilaženje/preticanje/obilaženje + po potrebi zaustavi ili ukloni s kolovoza + pridržavaj se naredbi pratnje + nastavi tek kad SVA prođu (Pravilnik o znacima policijskih službenika čl. 9 t. 1; ZOBS čl. 107). Ponuđene kraće verzije ispuštaju delove obaveze — tačan je pun opis.' };
X[10428] = { x: 'Poruka na displeju policijskog vozila (STOP POLICIJA, PRATITE NAS, SMANJITE BRZINU...) je OBAVEZA, ne preporuka — vozač neposredno IZA postupa po znaku ispisanom na displeju (Pravilnik o znacima policijskih službenika čl. 9 t. 4).' };
X[10429] = { x: 'Postojano crveno svetlo baterijske lampe kojim službenik maše upravno na osu puta = BEZBEDNO zaustavi vozilo na kolovozu, po mogućnosti van njega, NEPOSREDNO ISPRED službenika (Pravilnik o znacima policijskih službenika čl. 11). Smanjenje brzine je obaveza OSTALIH učesnika — za onoga na koga se znak odnosi, znak znači: stani.' };
X[10431] = { x: "Kad vozilo pod pratnjom ili s prvenstvom prolaza uz svoje posebne svetlosne znake daje i SVETLOSNI ZNAK UPOZORENJA (uzastopno/naizmenično paljenje dugih svetala), vozač NEPOSREDNO ISPRED mora ODMAH bezbedno da stane uz DESNU ivicu kolovoza, po mogućnosti van njega (ZOBS čl. 110; Pravilnik o znacima policijskih službenika čl. 10). Ni smanjenje brzine ni puko omogućavanje preticanja nisu dovoljni — znak je upućen lično tebi: odmah stani uz desnu ivicu i skloni se s putanje." };


// --- Sitne podoblasti (138/141/143/149/155-160/163/165), 31 pitanje — pisano pojedinačno
// (ZOBS čl. 41/71/84/87/111/132/134/135/155/166; Pravilnik o signalizaciji čl. 6/10/22/32/87) ---
X[10711] = { x: 'NASILNIČKA vožnja u NASELJU: prekoračenje za više od 90 km/h preko dozvoljene (ZOBS čl. 41). Van naselja granica je 100 km/h preko dozvoljene — pamti par 90/100, u naselju je strože.' };
X[10712] = { x: 'NASILNIČKA vožnja VAN naselja: prekoračenje za više od 100 km/h preko dozvoljene (ZOBS čl. 41); u naselju je granica 90 km/h preko dozvoljene.' };
X[10713] = { x: 'Nasilnička vožnja je i upravljanje u stanju POTPUNE alkoholisanosti — više od 2,00 mg/ml (ZOBS čl. 41). Teška i veoma teška alkoholisanost su kažnjive, ali tek potpuna (preko 2,00) čini vožnju nasilničkom.' };
X[10531] = { x: 'Motorno vozilo NE SME da vuče: motocikl, moped i laki i teški TRICIKL (ZOBS čl. 71 — spisak je izričit). Četvorocikli, putnička i teretna vozila smeju da se vuku po pravilima o vuči; dvotočkaši i tricikli ne — vučeni su nestabilni.' };
X[10222] = { x: 'Odredbe ZOBS-a primenjuju se I NA vozače tramvaja — osim kad to isključuju konstrukcione osobine tih vozila ili način njihovog kretanja (ZOBS čl. 84). Tramvaj se, na primer, ne može skloniti sa šina, ali pravila za vozače važe i za tramvajdžije.' };
X[10225] = { x: 'Životinje je ZABRANJENO voditi iz vozila ili sa vozila (ZOBS čl. 87) — bez izuzetka za put van naselja. Domaće životinje na putu vode lica koja idu uz njih i obezbeđuju ih da ne ugrožavaju saobraćaj.' };
X[10400] = { x: 'Žuto rotaciono/trepćuće svetlo (radovi, vanredni prevoz, prinudno zaustavljeno vozilo...) = POVEĆAJ OPREZNOST i prilagodi brzinu i način kretanja (ZOBS čl. 111). Ne traži ni obavezno zaustavljanje ni pomeranje s kolovoza — takve obaveze nose plava svetla i znaci ovlašćenih lica.' };
X[8936] = { x: 'Dužnost vozača je dvostruka: pridržavaj se ograničenja, zabrana i obaveza iz saobraćajne signalizacije I prilagodi kretanje opasnostima na koje upozoravaju znakovi opasnosti (ZOBS čl. 132). Mamci nude "sopstvenu procenu" umesto signalizacije — sopstvena procena nikad ne pobija znak; a znakovi obaveštenja ne izriču naredbe.' };
X[8937] = { x: 'Učesnicima u saobraćaju NIJE dozvoljeno postavljanje, uklanjanje ni izmena značenja signalizacije i opreme puta (ZOBS čl. 134: zabranjeno je neovlašćeno) — to radi samo ovlašćeni upravljač puta. Izuzetak za garaže i kolske prilaze ne postoji.' };
X[8938] = { x: 'Zaklanjanje ili umanjivanje uočljivosti signalizacije tablama, znakovima, svetlima, stubovima i sličnim predmetima je ZABRANJENO (ZOBS čl. 134) — bez izuzetaka, pa ni uz odobrenje lokalne samouprave.' };
X[8939] = { x: 'Predmeti koji podražavaju ili liče na signalizaciju, zaslepljuju učesnike ili odvraćaju pažnju u meri opasnoj za bezbednost — ZABRANJENI su (ZOBS čl. 134). Nikakvo odobrenje ni namena (garaža, prilaz) to ne legalizuje.' };
X[8941] = { x: 'Znakovi sa izmenljivim sadržajem poruka mogu biti STALNO aktivirani ili se aktiviraju PREMA POTREBI — i isključuju kad potrebe nema (ZOBS čl. 135). Ne moraju se uklanjati niti stalno davati poruku — u tome i jeste smisao izmenljivog sadržaja.' };
X[8944] = { x: "SAOBRAĆAJNI ZNAKOVI su tri porodice: znakovi OPASNOSTI, IZRIČITIH NAREDBI i OBAVEŠTENJA (ZOBS čl. 135; dopunska tabla je sastavni deo znaka). Semafori i oznake na kolovozu jesu saobraćajna signalizacija, ali kao DRUGI njeni elementi (čl. 133) — nisu saobraćajni znakovi. Znaci koje daju policijski službenici uopšte nisu signalizacija: to su znaci i naredbe ovlašćenog lica, po kojima postupaš i kad su suprotni signalizaciji (čl. 166)." };
X[8946] = { x: 'Zabrane, ograničenja i obaveze izriču znakovi IZRIČITIH NAREDBI (ZOBS čl. 135). Znakovi opasnosti upozoravaju, znakovi obaveštenja obaveštavaju — naredbe naređuju.' };
X[8947] = { x: "Upozorenje na opasnost na određenom mestu ili delu puta i obaveštenje o prirodi te opasnosti daju znakovi OPASNOSTI (ZOBS čl. 135). Izričite naredbe zabranjuju i obavezuju, obaveštenja informišu — jedino znakovi opasnosti upozoravaju unapred." };
X[8948] = { x: "Potrebna obaveštenja o putu kojim se krećeš i druga korisna obaveštenja pružaju znakovi OBAVEŠTENJA (ZOBS čl. 135). Opasnosti upozoravaju, naredbe zabranjuju i obavezuju — kad znak samo informiše, to je znak obaveštenja." };
X[8949] = { x: 'Dopunska tabla: SASTAVNI je deo saobraćajnog znaka uz koji je postavljena i BLIŽE ODREĐUJE njegovo značenje (ZOBS čl. 135) — zato idu oba odgovora. Nije samostalan tekstualni znak niti putokaz.' };
X[10780] = { x: 'Znakovi se postavljaju sa DESNE strane puta; kad je potrebna bolja uočljivost ili dodatno upozorenje, znak se postavlja I NA LEVOJ strani (Pravilnik o signalizaciji čl. 10) — zato idu oba odgovora. "Desna ili leva po izboru" je pogrešno: leva je uvek dodatak desnoj.' };
X[8950] = { x: 'Znakovi opasnosti postavljaju se, po pravilu, na 150 m do 250 m ISPRED opasnog mesta (Pravilnik o signalizaciji čl. 22) — dovoljno unapred da stigneš da reaguješ. Neposredno ispred mesta postavljaju se znakovi izričitih naredbi (čl. 32), ne opasnosti.' };
X[10781] = { x: 'Pravilo za znakove opasnosti: 150 m do 250 m ispred opasnog mesta (Pravilnik o signalizaciji čl. 22). Izuzeci postoje (uz dopunsku tablu o udaljenosti van naselja, odnosno uz obrazloženje u projektu u naselju), ali pravilo je 150-250 m.' };
X[8952] = { x: 'U NASELJU znak opasnosti sme da stoji i na manje od 150 m od opasnog mesta BEZ dopunske table — dovoljno je obrazloženje u saobraćajnom projektu (Pravilnik o signalizaciji čl. 22). Dopunska tabla sa udaljenošću je obavezna VAN naselja, kad je znak izvan opsega 150-250 m.' };
X[10782] = { x: 'VAN naselja znak opasnosti postavljen bliže od 150 m ili dalje od 250 m MORA imati dopunsku tablu sa UDALJENOŠĆU do opasnog mesta (Pravilnik o signalizaciji čl. 22) — da znaš koliko još ima. Vrsta opasnosti se vidi iz samog znaka, nju tabla ne ponavlja.' };
X[9007] = { x: 'Izričita naredba važi do PRVE NAREDNE RASKRSNICE, odnosno do znaka obaveštenja o prestanku naredbe (Pravilnik o signalizaciji čl. 32: posle svake raskrsnice znak se mora PONOVO postaviti ako naredba važi i dalje). Zato "do znaka o prestanku bez obzira na raskrsnicu" nije tačno — neponovljen znak prestaje da važi na raskrsnici.' };
X[10612] = { x: 'Naredba važi OD MESTA na kome je znak postavljen (Pravilnik o signalizaciji čl. 32 — znak stoji neposredno ispred mesta odakle nastaje obaveza; najava unapred ide uz dopunsku tablu sa udaljenošću). Trenutak kada si znak uočio nije merilo — merilo je mesto znaka.' };
X[10841] = { x: 'Znak izričite naredbe postavlja se NEPOSREDNO ISPRED mesta odakle nastaje obaveza (Pravilnik o signalizaciji čl. 32). Razdaljina 150-250 m važi za znakove OPASNOSTI (čl. 22) — naredba ne sme da "visi" daleko od mesta primene.' };
X[9074] = { x: 'Prethodna obaveštenja, obaveštenja o prestrojavanju i skretanju, potvrda pravca i označavanje objekata, terena i ulica — sve su to znakovi OBAVEŠTENJA (ZOBS čl. 135). Opasnosti upozoravaju, naredbe naređuju — obaveštenja vode i informišu.' };
X[9202] = { x: 'Dopunska tabla postavlja se ISPOD DONJE IVICE znaka na koji se odnosi (Pravilnik o signalizaciji čl. 6) — uvek ispod, nikad sa strane niti iznad.' };
X[11056] = { x: 'Ivicu KOLOVOZA obeležavaju: SMEROKAZI (crveni sa desne, beli sa leve strane), KATADIOPTERI (na ogradama i bočnim smetnjama) i ŠTAP za označavanje puta u zimskim uslovima (Pravilnik o signalizaciji čl. 87). Table stalnih prepreka i indikator obeležavaju PUTNE OBJEKTE — to je drugi par iz istog člana.' };
X[11057] = { x: 'PUTNE OBJEKTE obeležavaju: INDIKATOR za označavanje putnog objekta i zona izdignutih ivičnjaka i TABLE za označavanje stalnih prepreka unutar gabarita slobodnog profila puta (Pravilnik o signalizaciji čl. 87). Smerokazi, katadiopteri i zimski štap obeležavaju ivicu kolovoza.' };
X[9406] = { x: 'Kod radova na putu: NE SMEŠ da ometaš radnika koji obavlja radove na putu ili pored puta i DUŽAN si da ukloniš vozilo na zahtev izvođača radova — zahtev može biti i javni poziv (ZOBS čl. 155). Znaci radnika koga je odredio izvođač obavezuju te (čl. 166), ne samo postavljena signalizacija; a zahtev ne mora doći od policije.' };
X[10417] = { x: "Na delu puta gde se izvode radovi saobraćaj regulišu najmanje DVA radnika određena od strane izvođača, zastavicama CRVENE i ZELENE boje: podignuta CRVENA = zabranjen prolaz, podignuta ZELENA = slobodan prolaz, za smer iz koga je zastavica podignuta (ZOBS čl. 166). Jedna zastavica sa \"podignuto/spušteno\" logikom nije propisani način." };


// --- Kaznene mere (sub 182) — kartica + podtura A: najteža klasa (ZOBS čl. 330), 14 pitanja ---
// PRISTUP (Milan): BEZ dinarskih iznosa u našim tekstovima — iznosi se menjaju izmenama zakona
// (u ovoj kopiji ZOBS-a čl. 332 već ima drugačiji raspon od ispitne baze!); učimo KLASE i logiku.
CARDS['kaznene-klase'] = {
  title: 'Kaznene klase — logika umesto iznosa',
  html: `
<p><b>Za ispit, prvo ovo:</b> u zvaničnom šablonu ispita za A kategoriju ova oblast
<b>nema nijedno pitanje</b> (provereno na 4 zvanična izvlačenja). Uči je radi razumevanja posledica, ne radi bodova.</p>
<p><b>Prekršaji su poređani u klase po težini</b> — ne pamti svaki iznos, prepoznaj klasu:</p>
<table>
<tr><th>Klasa</th><th>Kazna</th><th>Šta tu spada</th></tr>
<tr><td><b>Vrh: nasilnička vožnja</b> (čl. 329)</td><td>zatvor I novčana kazna ZAJEDNO + najviše kaznenih poena + najduža obavezna zabrana</td>
<td>gruba, bezobzirna vožnja (čl. 41): potpuna alkoholisanost (preko 2,00 mg/ml), dva prolaska na crveno u 10 minuta,
preticanje kolone preko pune linije, najekstremnija prekoračenja brzine</td></tr>
<tr><td><b>Najteža klasa prekršaja</b> (čl. 330)</td><td>zatvor ILI najviša novčana kazna + visoki kazneni poeni</td>
<td>vožnja bez dozvole; vožnja za vreme isključenja ili zabrane; odbijanje alko/droga testa;
prekoračenja preko zakonskih pragova u zonama; noću bez ijednog svetla; prolaz na crveno preko prelaza sa pešacima;
napuštanje nezgode sa povređenima. (Ispitna baza ovde svrstava i poneki prekršaj koji su kasnije izmene zakona
preselile u drugu klasu — npr. zaustavnu traku autoputa.)</td></tr>
<tr><td><b>Srednje</b></td><td>novčani rasponi + kazneni poeni (više stepenika)</td><td>opasne radnje bez ekstremnog rizika (nepropisno preticanje, svetla, prelazi...)</td></tr>
<tr><td><b>Lakše</b></td><td>fiksne manje novčane kazne, po pravilu bez poena</td><td>administrativni propusti i oprema</td></tr>
</table>
<p><b>Kazneni poeni</b> idu UZ kaznu (čl. 335); kad ih skupiš <b>18</b>, MUP ti ODUZIMA vozačku dozvolu —
zakon to zove "ne upravlja savesno i na propisan način" (čl. 197); za PROBNU dozvolu prag je već <b>9</b> poena.</p>
<p><b>Zaštitna mera zabrane upravljanja</b> izriče se obavezno, uz kaznu, za pobrojane prekršaje (čl. 338);
opšti okvir trajanja: od 30 dana do jedne godine (Zakon o prekršajima čl. 58).</p>
<p class="mut">Iznosi u dinarima se menjaju izmenama zakona — u vežbanju ih čitaj iz ponuđenih odgovora
(baza se osvežava), a trajno pamti klasu i logiku: što neposrednije ugrožava život, to viša klasa.</p>

<!-- ==== dopuna 07.09.2026 (tura 4): crtež + isto to rečima ==== -->
<!-- ISPRAVKA U POSTOJECOJ KARTICI (ne ide u tekst kartice, nego se menja postojeci red):
     red "Vrh: nasilnicka voznja" sada kaze "Zatvor I novcana kazna ZAJEDNO + najvise kaznenih poena +
     najduza obavezna zabrana". Tacan odgovor #8224 glasi doslovno "kaznom zatvora od 30 do 60 dana i
     15 kaznenih poena" - novcane kazne u njemu nema, kao ni zabrane. Predlog zamene za tu celiju:
     "Zatvor od 30 do 60 dana + 15 kaznenih poena (bez novcane kazne)". -->

<!-- OGRADA: ponavlja tvrdnju iz prve recenice postojece kartice ("u zvanicnom sablonu ispita za A
     kategoriju ova oblast nema nijedno pitanje"). Bez nje ceo dodatak zvuci ispitno-takticki. -->
<p class="mut">Pre svega ostalog: u zvaničnom šablonu ispita za A kategoriju ova oblast <b>nema nijedno pitanje</b> — to piše i na vrhu kartice. Sve ispod je za vežbanje baze i za razumevanje posledica, ne za bodove na ispitu.</p>

<!-- CELINA 1 - izvor: prebrojane sve 4 klase u 89 pitanja o klasi; oblici odgovora doslovno iz
     #8224 (nasilnicka), #8228/#8229/#8230/#8231/#8235/#8237/#8241/#8246/#8247 (najteza),
     #8349/#8351/#8376/#8385 (laksa), #8227/#8251/#8271/#8277/#8278/#8298/#8314 (srednja);
     peti oblik "kaznom zatvora do 30 dana" - prebrojano: javlja se tacno jednom (#8227) i nije tacan
     (tacan je raspon 6.000-20.000 + 2 poena); pamtilica 3 = 70 ponuda najstrozeg odgovora na 89
     pitanja, tacan 15 puta. -->
<div class="kPodH"><b class="kPodNaslov">Prepoznaj klasu po OBLIKU odgovora, ne po iznosu</b>
<p>Od 111 pitanja ove podoblasti, <b>89</b> pita isto: na koji stepenik pada prekršaj. Ponuđeni odgovori se razlikuju po obliku, i taj oblik ih razvrstava i pre nego što pročitaš cifre. Klase su četiri — a postoji i peti oblik, koji nije klasa nego mamac.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 298" style="max-width:306px;width:100%" role="img" aria-label="Četiri klase po obliku tačnog odgovora, jedna ispod druge: lakša — jedan iznos, bez poena, 25 pitanja; srednja — raspon od-do uz poene, 48 pitanja; najteža — zatvor ILI novčana i 14 poena, 15 pitanja; nasilnička vožnja — zatvor od 30 do 60 dana i 15 poena, bez novčane, 1 pitanje. Peti red je isprekidan i nije klasa: mamac koji glasi zatvor do 30 dana, bez reči ili, bez novčane i bez poena, nudi se jednom i nikad nije tačan.">
<rect x="6" y="6" width="294" height="46" fill="#1f7a3f" fill-opacity="0.16" stroke="#1f7a3f"/>
<rect x="6" y="6" width="6" height="46" fill="#1f7a3f" fill-opacity="0.55"/>
<rect x="6" y="58" width="294" height="46" fill="#e8b000" fill-opacity="0.20" stroke="#e8b000"/>
<rect x="6" y="58" width="11" height="46" fill="#e8b000" fill-opacity="0.65"/>
<rect x="6" y="110" width="294" height="46" fill="#c0392b" fill-opacity="0.18" stroke="#c0392b"/>
<rect x="6" y="110" width="16" height="46" fill="#c0392b" fill-opacity="0.55"/>
<rect x="6" y="162" width="294" height="62" fill="#c0392b" fill-opacity="0.40" stroke="#c0392b"/>
<rect x="6" y="162" width="21" height="62" fill="#c0392b" fill-opacity="0.85"/>
<rect x="6" y="230" width="294" height="62" fill="none" stroke="currentColor" stroke-dasharray="5 4" opacity="0.8"/>
<g fill="currentColor">
<text x="30" y="26" font-size="13">LAKŠA</text>
<text x="30" y="43" font-size="12">jedan iznos, bez poena</text>
<text x="294" y="26" font-size="12" text-anchor="end" opacity="0.8">25 pitanja</text>
<text x="30" y="78" font-size="13">SREDNJA</text>
<text x="30" y="95" font-size="12">raspon „od–do“, uz poene</text>
<text x="294" y="78" font-size="12" text-anchor="end" opacity="0.8">48 pitanja</text>
<text x="30" y="130" font-size="13">NAJTEŽA</text>
<text x="30" y="147" font-size="12">zatvor ILI novčana + 14 poena</text>
<text x="294" y="130" font-size="12" text-anchor="end" opacity="0.8">15 pitanja</text>
<text x="34" y="182" font-size="13">NASILNIČKA</text>
<text x="34" y="199" font-size="12">zatvor 30–60 dana + 15 poena</text>
<text x="34" y="216" font-size="12">bez novčane, bez reči „ili“</text>
<text x="294" y="182" font-size="12" text-anchor="end" opacity="0.8">1 pitanje</text>
<text x="30" y="250" font-size="13">MAMAC — nije klasa</text>
<text x="30" y="267" font-size="12">zatvor do 30 dana, bez „ili“</text>
<text x="30" y="284" font-size="12">bez novčane i bez poena</text>
<text x="294" y="250" font-size="12" text-anchor="end" opacity="0.8">0 tačnih</text>
</g>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">širina leve trake = težina klase · broj desno = koliko od 89 pitanja pada u tu klasu · isprekidani red nije klasa nego jedini zatvorski mamac u bazi</p>
<p><b>Isto rečima:</b> <b>jedan iznos, bez poena</b> = lakša klasa. <b>Raspon „od–do“</b> (u tri četvrtine slučajeva uz kaznene poene) = srednja. <b>„Zatvor od najmanje 15 dana ILI novčana kazna“ + 14 poena</b> = najteža — tu su zatvor i novčana <i>alternativa</i>, i to je jedini oblik odgovora u kome se pominju oboje. <b>„Zatvor od 30 do 60 dana“ + 15 poena</b> = nasilnička vožnja — fiksni broj dana, bez reči „ili“ i <b>bez novčane kazne</b>. Na tom jedinom pitanju o nasilničkoj vožnji druge dve ponude su jedan fiksni iznos i raspon sa 6 poena, dakle obe iz blažih klasa: odgovora u kome stoje i zatvor i novčana kazna tu uopšte nema, pa ga i ne traži.</p>
<p><b>Peti oblik je zamka:</b> „kaznom zatvora <b>do 30 dana</b>“ — zatvor bez reči „ili“, bez novčane kazne i bez poena. Po tom opisu liči na nasilničku, ali nije: nudi se tačno jednom, na pitanju o zaustavljanju dok putnici ulaze i izlaze iz tramvaja, i nije tačan (tamo je tačan raspon uz 2 kaznena poena). Zato ključ za nasilničku glasi punije — traži <b>i broj dana (30 do 60) i 15 poena</b>, a ne samo reč „zatvor“.</p>
<table>
<tr><th>Klasa</th><th>Šta tačno spada (spisak iz baze)</th></tr>
<tr><td><b>NASILNIČKA</b><br>zatvor + 15 poena</td><td>Jedno pitanje, sa slikom: nepropisno postupanje u <b>gruboj suprotnosti</b> sa pravilima — izlazak u suprotnu traku pred vozilima koja ti dolaze u susret.<br><i>Zamka:</i> alkohol preko 2,00 mg/ml zakon takođe zove nasilničkom vožnjom, ali je u bazi tačan odgovor onaj u obliku <b>najteže</b> klase (zatvor ILI novčana + 14 poena).</td></tr>
<tr><td><b>NAJTEŽA</b><br>zatvor ILI novčana, 14 poena</td><td>nemaš dozvolu za kategoriju kojom upravljaš (osim kad je dozvoli istekao rok) · alkohol preko 2,00 mg/ml · odbiješ alkotest ili droga-test · voziš dok traje <b>tvoje</b> isključenje iz saobraćaja · voziš <b>vozilom</b> koje je isključeno · voziš dok traje zabrana upravljanja · u naselju prekoračenje preko 70 km/h · van naselja prekoračenje preko 70 km/h · zona usporenog saobraćaja: preko 50 · zona škole u naselju: preko 60 · noću na neosvetljenom putu bez ijednog svetla · ne staneš kad ti je prolaz zabranjen, a na prelazu je pešak · učesnik si nezgode <b>sa povređenima</b> pa ne staneš odnosno ne javiš policiji · preticanje zaustavnom trakom motoputa · kretanje zaustavnom trakom autoputa.<br><span class="mut">15 stavki na 15 pitanja — spisak je potpun.</span></td></tr>
<tr><td><b>LAKŠA</b><br>jedan iznos, bez poena</td><td>ne omogućiš autobusu da krene sa stajališta u naselju · mobilni telefon na nepropisan način · traka kojom tvoja vrsta vozila ne sme · u naselju prekoračenje 11–20 · van naselja prekoračenje 30 · preticanje preko prelaza puta preko železničke pruge · parkiranje uz levu ivicu na dvosmernom putu · parkiranje na pešačkom prelazu · parkiranje na raskrsnici · duga svetla uz uličnu rasvetu · duga svetla u magli · bez zakopčane homologovane kacige · ne propustiš pešaka kad skrećeš na bočni put bez pešačkog prelaza · na autoputu ne držiš krajnju desnu traku · postupanje suprotno postavljenom znaku · moped ili motocikl u blagoj i umerenoj alkoholisanosti · kandidat bez dokaza o zdravstvenoj sposobnosti kod sebe · neispravan pokazivač pravca.<br><i>Najniži stepenik iste klase:</i> u naselju prekoračenje 7 · van naselja prekoračenje 15 · ne pomeriš se udesno dok te pretiču · danju bez kratkih odnosno dnevnih svetala · slušalice na oba uva (moped, motocikl) · motor radi dok vozilo stoji duže od tri minuta · dozvola nije kod tebe (a imaš je).<br><span class="mut">18 + 7 stavki na 25 pitanja — spisak je potpun.</span></td></tr>
<tr><td><b>SREDNJA</b><br>raspon</td><td>Sve ostalo među 89 pitanja o klasi — njih 48. Gornja tri reda nabrajaju svoje klase do kraja (nasilnička ima tačno jedno pitanje), pa: ako prekršaj nije naveden ni u jednom od njih, odgovor je <b>raspon</b>.</td></tr>
</table>
<p>Dva fiksna iznosa u istoj ponudi javljaju se samo dvaput. Jednom oblik sam razrešava (uz njih stoji i zatvorska opcija, i ona je tačna — noćna vožnja bez ijednog svetla). Drugi put su oba iznosa u lakšoj klasi i tačan je <b>manji</b> — „ne pomeriš se udesno dok te pretiču“ je sa najnižeg stepenika.</p>
<p class="mut">Pamtilica 1: kad su ti ponuđena <b>dva raspona „od–do“</b> i nijedan odgovor nema zatvor, tačan je treći — onaj sa jednim iznosom. U bazi 16 od 16 takvih pitanja.<br>Pamtilica 2: odgovor sa <b>10 kaznenih poena</b> nudi se sedam puta i nijednom nije tačan — čist mamac.<br>Pamtilica 3: najstroži odgovor (zatvor ILI novčana + 14 poena) nudi se u <b>70 od 89</b> pitanja o klasi — skoro četiri petine — a tačan je 15 puta, dakle otprilike <b>jednom od pet</b> puta kad se ponudi. Ne biraj ga refleksno zato što zvuči ozbiljno.</p>
</div>

<!-- CELINA 2 - izvor: #8224 (jedino pitanje o nasilnickoj voznji; tacan odgovor "kaznom zatvora od
     30 do 60 dana i 15 kaznenih poena"; postojece objasnjenje: "izlazak u suprotnu traku pred
     vozilima koja ti dolaze u susret", "neposredna opasnost od ceonog sudara", "zatvor i kazneni
     poeni se izricu zajedno, kumulativno"). Zamka iz #8229 (preko 2,00 mg/ml).
     Crtez: strelice na susretnim vozilima nose razliku prema obicnom preticanju - bez njih slika
     izgleda kao kolona u istom smeru. -->
<div class="kPodH"><b class="kPodNaslov">Vrh lestvice: šta se vidi na toj jednoj slici</b>
<p>Nasilnička vožnja je u bazi <b>jedno jedino pitanje</b>, i ono ima sliku. Isplati se da znaš šta se na njoj dešava, jer se po tome razlikuje od običnog nepropisnog preticanja (koje je srednja klasa).</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 166" style="max-width:306px;width:100%" role="img" aria-label="Dvosmerni put odozgo: plavo vozilo je izašlo iz svoje trake u traku suprotnog smera i vozi udesno, a iz suprotnog smera dolaze dva vozila čije strelice pokazuju ulevo, pravo prema njemu. Isprekidana strelica pokazuje put kojim je plavo vozilo izašlo iz svoje trake. Kazna: zatvor od 30 do 60 dana i 15 kaznenih poena, izriču se zajedno.">
<text x="78" y="14" font-size="12" text-anchor="middle" fill="currentColor">suprotan smer</text>
<text x="228" y="14" font-size="12" text-anchor="middle" fill="#c0392b">dolaze ti u susret</text>
<rect x="6" y="22" width="294" height="82" fill="#9aa7b4"/>
<line x1="6" y1="63" x2="300" y2="63" stroke="#fff" stroke-width="2" stroke-dasharray="12 9"/>
<g class="animSusret">
<g><rect x="202" y="32" width="40" height="16" rx="4" fill="#2a333d"/><rect x="212" y="26" width="22" height="7" rx="3" fill="#2a333d"/><circle cx="212" cy="49" r="3" fill="#2a333d"/><circle cx="232" cy="49" r="3" fill="#2a333d"/></g>
<g><rect x="250" y="32" width="40" height="16" rx="4" fill="#2a333d"/><rect x="260" y="26" width="22" height="7" rx="3" fill="#2a333d"/><circle cx="260" cy="49" r="3" fill="#2a333d"/><circle cx="280" cy="49" r="3" fill="#2a333d"/></g>
</g>
<line x1="196" y1="40" x2="182" y2="40" stroke="#c0392b" stroke-width="2"/>
<polygon points="182,34 172,40 182,46" fill="#c0392b"/>
<g class="animIzlazak">
<rect x="90" y="32" width="40" height="16" rx="4" fill="#2c6aa0"/><rect x="100" y="26" width="22" height="7" rx="3" fill="#2c6aa0"/><circle cx="100" cy="49" r="3" fill="#2a333d"/><circle cx="120" cy="49" r="3" fill="#2a333d"/>
</g>
<line x1="136" y1="40" x2="150" y2="40" stroke="#2c6aa0" stroke-width="2"/>
<polygon points="150,34 160,40 150,46" fill="#2c6aa0"/>
<g opacity="0.6"><rect x="26" y="74" width="40" height="16" rx="4" fill="none" stroke="#2c6aa0" stroke-dasharray="4 3"/><rect x="36" y="68" width="22" height="7" rx="3" fill="none" stroke="#2c6aa0" stroke-dasharray="4 3"/></g>
<line x1="70" y1="84" x2="86" y2="52" stroke="#2c6aa0" stroke-width="2" stroke-dasharray="5 4"/>
<polygon points="90,46 80,56 87,60" fill="#2c6aa0"/>
<g opacity="0.55"><rect x="140" y="74" width="40" height="16" rx="4" fill="#2a333d"/><rect x="150" y="68" width="22" height="7" rx="3" fill="#2a333d"/></g>
<text x="60" y="122" font-size="12" text-anchor="middle" fill="currentColor">tvoja traka</text>
<text x="153" y="144" font-size="12" text-anchor="middle" fill="#c0392b">zatvor 30–60 dana + 15 poena</text>
<text x="153" y="161" font-size="12" text-anchor="middle" fill="#c0392b">izriču se ZAJEDNO, nije „ili“</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">plavo = ti · sivo = ostali · strelice = smer kretanja, pa se vidi da su ona dva vozila u susretu · isprekidano vozilo i isprekidana strelica = odakle si i kojim putem izašao iz svoje trake</p>
<p><b>Isto rečima:</b> ovo nije obično nepropisno preticanje. Izlazak u <b>traku suprotnog smera pred vozilima koja ti dolaze u susret</b> je gruba, bezobzirna vožnja — otud sam vrh lestvice. Zato se ovde zatvor i kazneni poeni izriču <b>zajedno, kumulativno</b>, a ne jedno ili drugo, i zato u tačnom odgovoru nema reči „ili“. Obično nepropisno preticanje, bez te neposredne opasnosti od čeonog sudara, ostaje srednja klasa: raspon uz 6 poena.</p>
<p class="mut">Pamtilica: formulacija <b>„zatvor od 30 do 60 dana“</b> u celoj podoblasti postoji samo na tom jednom pitanju — i tamo je tačna. Ali pazi: zatvor <i>uopšte</i> nije siguran znak za nasilničku — jednom se nudi i „zatvor do 30 dana“, i to kao mamac (v. celinu iznad).</p>
</div>

<!-- CELINA 3 - izvor: naselje #8383 (+7 fiksno), #8349 (+11 do 20 fiksno), #8298 (+30 raspon + 4 poena),
     #8254 (+60 raspon + 7 poena), #8235 (+90 najteza); van naselja #8385 (+15 fiksno), #8351 (+30 fiksno),
     #8301 (+50 raspon + 3 poena), #8256 (+70 tacno raspon + 6 poena), #8237 (+90 najteza);
     zabrana #8399 (+10 naselje ne izrice), #8397 (+30 naselje izrice), #8403 (+30 van naselja ne izrice),
     #8401 (+60 van naselja izrice); zone: #8239 zona usporenog saobracaja (ogranicenje 10) preko 50,
     #8240 zona skole u naselju (ogranicenje 30, od 7 do 21 cas) i zona "30" preko 60.
     Dva crteza umesto jednog: iste ose i ista razmera, pa se vidi da ista brojka pada u druge boje.
     Ivica izmedju "fiksno" i "raspon" NIJE povucena - izmedju poslednje potvrdjene fiksne i prve
     potvrdjene raspon-tacke stoji isprekidani procep sa znakom pitanja. -->
<div class="kPodH"><b class="kPodNaslov">Brzina: ista brojka, druga klasa</b>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 190" style="max-width:306px;width:100%" role="img" aria-label="U naselju, dozvoljeno 50. Osa prekoračenja od 0 do 100 km/h: do plus 20 fiksna kazna bez poena, između plus 20 i plus 30 baza ne pita pa je procep, od plus 30 raspon uz kaznene poene, preko 70 najteža klasa. Zaštitna mera zabrane upravljanja: na plus 10 se ne izriče, na plus 30 se izriče.">
<text x="153" y="16" font-size="13" text-anchor="middle" fill="currentColor">U NASELJU — dozvoljeno 50</text>
<g font-size="12" text-anchor="middle" fill="currentColor" opacity="0.85"><text x="20" y="34">0</text><text x="73.2" y="34">20</text><text x="126.4" y="34">40</text><text x="179.6" y="34">60</text><text x="232.8" y="34">80</text><text x="286" y="34">100</text></g>
<text x="206.2" y="34" font-size="12" text-anchor="middle" fill="#c0392b">70</text>
<line x1="20" y1="40" x2="286" y2="40" stroke="currentColor" opacity="0.5"/>
<g stroke="currentColor" opacity="0.5"><line x1="20" y1="40" x2="20" y2="45"/><line x1="73.2" y1="40" x2="73.2" y2="45"/><line x1="126.4" y1="40" x2="126.4" y2="45"/><line x1="179.6" y1="40" x2="179.6" y2="45"/><line x1="232.8" y1="40" x2="232.8" y2="45"/><line x1="286" y1="40" x2="286" y2="45"/></g>
<line x1="206.2" y1="38" x2="206.2" y2="47" stroke="#c0392b" stroke-width="1.5"/>
<rect x="20" y="48" width="53.2" height="26" fill="#1f7a3f" fill-opacity="0.28"/>
<rect x="73.2" y="48" width="26.6" height="26" fill="none" stroke="currentColor" stroke-dasharray="3 3" opacity="0.75"/>
<rect x="99.8" y="48" width="106.4" height="26" fill="#e8b000" fill-opacity="0.32"/>
<rect x="206.2" y="48" width="79.8" height="26" fill="#c0392b" fill-opacity="0.40"/>
<g font-size="12" text-anchor="middle" fill="currentColor">
<text x="46.6" y="90">fiksna</text><text x="46.6" y="107">bez poena</text>
<text x="86.5" y="90">?</text>
<text x="153" y="90">raspon</text><text x="153" y="107">+ poeni</text>
<text x="246" y="90">NAJTEŽA</text><text x="246" y="107">preko 70</text>
</g>
<text x="153" y="129" font-size="12" text-anchor="middle" fill="currentColor">zaštitna mera zabrane upravljanja</text>
<circle cx="46.6" cy="152" r="11" fill="none" stroke="#1f7a3f"/>
<text x="46.6" y="157" font-size="15" text-anchor="middle" fill="#1f7a3f">✗</text>
<circle cx="99.8" cy="152" r="11" fill="none" stroke="#c0392b"/>
<text x="99.8" y="157" font-size="15" text-anchor="middle" fill="#c0392b">✓</text>
<g font-size="12" text-anchor="middle" fill="currentColor" opacity="0.85"><text x="46.6" y="182">+10</text><text x="99.8" y="182">+30</text></g>
</svg>
</div>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 190" style="max-width:306px;width:100%" role="img" aria-label="Van naselja, dozvoljeno 80. Ista osa i ista razmera: do plus 30 fiksna kazna bez poena, između plus 30 i plus 50 baza ne pita pa je procep, od plus 50 raspon uz kaznene poene, preko 70 najteža klasa — isto mesto kao u naselju. Zaštitna mera: na plus 30 se ne izriče, na plus 60 se izriče.">
<text x="153" y="16" font-size="13" text-anchor="middle" fill="currentColor">VAN NASELJA — dozvoljeno 80</text>
<g font-size="12" text-anchor="middle" fill="currentColor" opacity="0.85"><text x="20" y="34">0</text><text x="73.2" y="34">20</text><text x="126.4" y="34">40</text><text x="179.6" y="34">60</text><text x="232.8" y="34">80</text><text x="286" y="34">100</text></g>
<text x="206.2" y="34" font-size="12" text-anchor="middle" fill="#c0392b">70</text>
<line x1="20" y1="40" x2="286" y2="40" stroke="currentColor" opacity="0.5"/>
<g stroke="currentColor" opacity="0.5"><line x1="20" y1="40" x2="20" y2="45"/><line x1="73.2" y1="40" x2="73.2" y2="45"/><line x1="126.4" y1="40" x2="126.4" y2="45"/><line x1="179.6" y1="40" x2="179.6" y2="45"/><line x1="232.8" y1="40" x2="232.8" y2="45"/><line x1="286" y1="40" x2="286" y2="45"/></g>
<line x1="206.2" y1="38" x2="206.2" y2="47" stroke="#c0392b" stroke-width="1.5"/>
<rect x="20" y="48" width="79.8" height="26" fill="#1f7a3f" fill-opacity="0.28"/>
<rect x="99.8" y="48" width="53.2" height="26" fill="none" stroke="currentColor" stroke-dasharray="3 3" opacity="0.75"/>
<rect x="153" y="48" width="53.2" height="26" fill="#e8b000" fill-opacity="0.32"/>
<rect x="206.2" y="48" width="79.8" height="26" fill="#c0392b" fill-opacity="0.40"/>
<g font-size="12" text-anchor="middle" fill="currentColor">
<text x="59.9" y="90">fiksna</text><text x="59.9" y="107">bez poena</text>
<text x="126.4" y="90">?</text>
<text x="179.6" y="90">raspon</text><text x="179.6" y="107">+ poeni</text>
<text x="246" y="90">NAJTEŽA</text><text x="246" y="107">preko 70</text>
</g>
<text x="153" y="129" font-size="12" text-anchor="middle" fill="currentColor">zaštitna mera zabrane upravljanja</text>
<circle cx="99.8" cy="152" r="11" fill="none" stroke="#1f7a3f"/>
<text x="99.8" y="157" font-size="15" text-anchor="middle" fill="#1f7a3f">✗</text>
<circle cx="179.6" cy="152" r="11" fill="none" stroke="#c0392b"/>
<text x="179.6" y="157" font-size="15" text-anchor="middle" fill="#c0392b">✓</text>
<g font-size="12" text-anchor="middle" fill="currentColor" opacity="0.85"><text x="99.8" y="182">+30</text><text x="179.6" y="182">+60</text></g>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">oba crteža imaju istu osu i istu razmeru — vodoravno je za koliko km/h prelaziš dozvoljeno · isprekidani procep sa <b>?</b> = zona u kojoj baza ne pita, pa granica nije povučena · ✗ = mera se ne izriče, ✓ = izriče se, i to samo na tačkama koje baza pita · crvena crta na 70 = mesto na kome se dve lestvice spajaju</p>
<p><b>Isto rečima:</b> ista brojka prekoračenja pada za stepenik niže van naselja nego u naselju — <b>osim na vrhu, gde se lestvice spajaju</b>: preko 70 km/h prekoračenja je najteža klasa i u naselju i van njega (crvena crta na oba crteža, na istom mestu). Na <b>+30 km/h</b>: u naselju — raspon, kazneni poeni <b>i</b> zabrana upravljanja; van naselja — jedan iznos, bez poena i <b>bez</b> zabrane. Baza pita tačke, ne granice: u naselju potvrđuje fiksnu kaznu na +7 i na +11 do +20, a raspon sa poenima već na +30; van naselja fiksnu na +15 i na +30, a raspon sa poenima na +50. Zato između te dve potvrđene tačke na crtežu stoji procep sa znakom pitanja, a ne ivica: prelaz je negde između +20 i +30 u naselju, odnosno između +30 i +50 van naselja, a gde tačno — baza ne kaže. <b>Tačno 70 još nije najteža klasa</b> — jedno pitanje se lomi baš na toj razlici.</p>
<table>
<tr><th>Gde voziš</th><th>Dozvoljeno</th><th>Najteža klasa počinje na prekoračenju od</th></tr>
<tr><td>naselje / van naselja</td><td>50 / 80</td><td><b>preko 70</b></td></tr>
<tr><td>zona škole u naselju</td><td>30, od 7 do 21 č.</td><td><b>preko 60</b></td></tr>
<tr><td>zona „30“</td><td>—</td><td><b>preko 60</b></td></tr>
<tr><td>zona usporenog saobraćaja</td><td>10</td><td><b>preko 50</b></td></tr>
</table>
<p class="mut">Za zonu „30“ baza navodi samo prag (preko 60), ne i sâmo ograničenje — zato je to polje prazno.<br>Pamtilica: pragovi idu <b>70 · 60 · 50</b> — što je zona osetljivija, to ti manje treba da upadneš u najtežu klasu.<br>Druga pamtilica, i pazi na ogradu: <b>na brzinskim tačkama koje baza pita</b> poeni i zabrana idu u paru — gde ima kaznenih poena, izriče se i zabrana; gde ih nema, ne izriče se. Van brzine to <b>ne</b> važi: dva prekršaja nose po 2 kaznena poena, a mera se ipak ne izriče — istekla registraciona nalepnica i vozačka dozvola istekla najviše šest meseci (oba su niže, među sličicama).</p>
</div>

<!-- CELINA 4 - izvor: #8405 (0,30-0,50 mera se NE izrice, "kazna DA, zastitna mera NE"),
     #8404 (vise od 0,50 do 1,20 mera se IZRICE, "granica za meru je 0,50"), #8229 (preko 2,00 najteza,
     po slovu zakona nasilnicka, cl. 41), #8230 (odbijanje testa isti odgovor), #8278 (1,80 raspon +
     12 poena), #8277 (psihoaktivna supstanca raspon + 8 poena), #8376 (moped/motocikl blaga i umerena
     alkoholisanost - jedan iznos, nulta tolerancija ZOBS cl. 187), #8329 srednja alkoholisanost raspon
     + 6 poena, #8330 isto za kandidata na praktičnoj obuci.
     Dva crteza: prvi je SAMO o zastitnoj meri i ide do 1,40 - i ispod 0,30 i preko 1,20 baza ne pita,
     pa su oba kraja isprekidana. Drugi je lestvica klasa, gde "odbijanje testa" stoji uz "preko 2,00",
     a ne na levom kraju promilne ose. -->
<div class="kPodH"><b class="kPodNaslov">Alkohol: gde je koja granica</b>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 88" style="max-width:306px;width:100%" role="img" aria-label="Zaštitna mera zabrane upravljanja po sadržini alkohola: od 0,30 do 0,50 mg/ml mera se ne izriče, više od 0,50 do 1,20 mera se izriče. Ispod 0,30 i preko 1,20 baza ne pita, pa su ti krajevi isprekidani i označeni znakom pitanja.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">zaštitna mera zabrane upravljanja</text>
<rect x="30" y="22" width="54.9" height="30" fill="none" stroke="currentColor" stroke-dasharray="3 3" opacity="0.75"/>
<rect x="84.9" y="22" width="36.5" height="30" fill="#1f7a3f" fill-opacity="0.28"/>
<rect x="121.4" y="22" width="128.1" height="30" fill="#c0392b" fill-opacity="0.38"/>
<rect x="249.5" y="22" width="36.5" height="30" fill="none" stroke="currentColor" stroke-dasharray="3 3" opacity="0.75"/>
<text x="57.4" y="43" font-size="14" text-anchor="middle" fill="currentColor" opacity="0.8">?</text>
<text x="103.1" y="43" font-size="15" text-anchor="middle" fill="#1f7a3f">✗</text>
<text x="185.4" y="42" font-size="12" text-anchor="middle" fill="currentColor">✓ mera se izriče</text>
<text x="267.7" y="43" font-size="14" text-anchor="middle" fill="currentColor" opacity="0.8">?</text>
<line x1="30" y1="56" x2="286" y2="56" stroke="currentColor" opacity="0.5"/>
<g stroke="currentColor" opacity="0.6"><line x1="84.9" y1="56" x2="84.9" y2="62"/><line x1="121.4" y1="56" x2="121.4" y2="62"/><line x1="249.5" y1="56" x2="249.5" y2="62"/></g>
<g font-size="12" text-anchor="middle" fill="currentColor"><text x="84.9" y="76">0,30</text><text x="121.4" y="76">0,50</text><text x="249.5" y="76">1,20</text></g>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">vodoravno = mg/ml alkohola · ✗ kazna da, mera ne · ✓ uz kaznu ide i mera · <b>?</b> = baza tu ništa ne pita, ni ispod 0,30 ni preko 1,20</p>
<p><b>Isto rečima:</b> granica za <b>zabranu upravljanja je 0,50</b> — od 0,30 do 0,50 ide kazna ali ne i zabrana; više od 0,50 do 1,20 uz kaznu obavezno ide i zabrana. To su tačno dva opsega koja baza pita; preko 1,20 o meri ne pita ništa, pa crtež tu ne tvrdi ništa.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 200" style="max-width:306px;width:100%" role="img" aria-label="Lestvica klasa kazne po stepenu alkoholisanosti, od najblažeg ka najtežem: moped i motocikl u blagoj i umerenoj alkoholisanosti — lakša klasa, jedan iznos; srednja alkoholisanost — raspon i 6 kaznenih poena; psihoaktivna supstanca — raspon i 8 poena; 1,80 mg/ml — raspon i 12 poena; preko 2,00 — najteža klasa, 14 poena; odbijanje testa — isto kao preko 2,00.">
<rect x="6" y="6" width="294" height="38" fill="#1f7a3f" fill-opacity="0.16" stroke="#1f7a3f"/>
<rect x="6" y="6" width="6" height="38" fill="#1f7a3f" fill-opacity="0.55"/>
<rect x="6" y="49" width="294" height="25" fill="#e8b000" fill-opacity="0.20" stroke="#e8b000"/>
<rect x="6" y="49" width="10" height="25" fill="#e8b000" fill-opacity="0.65"/>
<rect x="6" y="79" width="294" height="25" fill="#e8b000" fill-opacity="0.28" stroke="#e8b000"/>
<rect x="6" y="79" width="13" height="25" fill="#e8b000" fill-opacity="0.8"/>
<rect x="6" y="109" width="294" height="25" fill="#e8b000" fill-opacity="0.38" stroke="#e8b000"/>
<rect x="6" y="109" width="16" height="25" fill="#e8b000" fill-opacity="0.95"/>
<rect x="6" y="139" width="294" height="25" fill="#c0392b" fill-opacity="0.35" stroke="#c0392b"/>
<rect x="6" y="139" width="20" height="25" fill="#c0392b" fill-opacity="0.85"/>
<rect x="6" y="169" width="294" height="25" fill="#c0392b" fill-opacity="0.35" stroke="#c0392b"/>
<rect x="6" y="169" width="20" height="25" fill="#c0392b" fill-opacity="0.85"/>
<g font-size="12" fill="currentColor">
<text x="30" y="22">moped i motocikl, blaga i umerena</text>
<text x="30" y="39">lakša klasa — jedan iznos</text>
<text x="30" y="66">srednja — raspon + 6 poena</text>
<text x="30" y="96">psihoaktivna — raspon + 8 poena</text>
<text x="30" y="126">1,80 mg/ml — raspon + 12 poena</text>
<text x="30" y="156">preko 2,00 — najteža, 14 poena</text>
<text x="30" y="186">odbijanje testa — isto kao 2,00</text>
</g>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">redovi idu od najblažeg ka najtežem · leva traka raste sa težinom · poslednja dva reda su isti odgovor: odbijanjem se ništa ne dobija</p>
<p><b>Isto rečima:</b> granica za <b>najtežu klasu je 2,00</b>: preko toga je zatvor ILI najviša novčana uz 14 poena, a po slovu zakona takva vožnja je već nasilnička (čl. 41) — ipak, u bazi je tačan odgovor u obliku najteže klase. <b>Odbijanje</b> alkotesta ili droga-testa kažnjava se istim odgovorom kao preko 2,00. Za <b>mopedistu i motociklistu</b>, kao i za kandidata na praktičnoj obuci, važi <b>nulta tolerancija</b> (ZOBS čl. 187): zabranjen je svaki alkohol, a stepen alkoholisanosti određuje samo visinu kazne — zato blaga i umerena kod njih ostaju lakša klasa, a srednja već nosi raspon uz 6 poena, isto kao i kod kandidata na obuci.</p>
</div>

<!-- CELINA 5 - izvor: #8225 (trajanje mere: najmanje 30 dana do najvise jedne godine; oba pogresna
     odgovora suzavaju okvir), i 20 pitanja "izrice se / ne izrice se": #8397 #8399 #8401 #8403 (brzina),
     #8404 #8405 (alkohol), #8406-#8411 (preticanje, svetlosni znak, znak, uslovna strelica, pesacki
     prelaz), #8412 (registar), #8413 (dozvola preko 6 meseci), #8414 (iskljuceno vozilo), #8417 (nocu
     bez svetala), #8418 (dete u krilu), #8420 (pruga), #8421 (nalepnica), #8422 (dozvola do 6 meseci).
     Kontraprimeri koji ruse intuiciju "malo poena -> nema mere": #8410 (uslovna strelica: mera SE
     izrice, a kazna je po #8321 samo raspon + 2 poena), i obrnuto #8421/#8422 (po 2 poena po
     #8337/#8326, a mera se NE izrice). -->
<div class="kPodH"><b class="kPodNaslov">Zaštitna mera zabrane upravljanja: koliko traje i kad se izriče</b>
<p>Jedno pitanje pita samo <b>trajanje</b> mere. Tačan odgovor je najširi ponuđeni okvir; oba mamca ga sužavaju, svaki sa svoje strane.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 146" style="max-width:306px;width:100%" role="img" aria-label="Trajanje zaštitne mere zabrane upravljanja: tačan okvir je od 30 dana do jedne godine; prvi netačan odgovor skraćuje gornju granicu na šest meseci, drugi podiže donju granicu na tri meseca.">
<g text-anchor="end" fill="currentColor" font-size="12"><text x="46" y="23">tačno</text><text x="46" y="53">mamac</text><text x="46" y="83">mamac</text></g>
<rect x="52" y="8" width="234" height="22" fill="#1f7a3f" fill-opacity="0.30" stroke="#1f7a3f"/>
<text x="169" y="23" font-size="12" text-anchor="middle" fill="currentColor">od 30 dana do 1 godine</text>
<rect x="52" y="38" width="106.5" height="22" fill="#c0392b" fill-opacity="0.20" stroke="#c0392b" stroke-dasharray="4 3"/>
<text x="165" y="53" font-size="12" text-anchor="start" fill="currentColor">30 dana – 6 meseci</text>
<rect x="94.5" y="68" width="191.5" height="22" fill="#c0392b" fill-opacity="0.20" stroke="#c0392b" stroke-dasharray="4 3"/>
<text x="190" y="83" font-size="12" text-anchor="middle" fill="currentColor">3 meseca – 1 godina</text>
<line x1="52" y1="100" x2="286" y2="100" stroke="currentColor" opacity="0.5"/>
<g stroke="currentColor" opacity="0.6"><line x1="52" y1="100" x2="52" y2="106"/><line x1="94.5" y1="100" x2="94.5" y2="106"/><line x1="158.5" y1="100" x2="158.5" y2="106"/><line x1="286" y1="100" x2="286" y2="106"/></g>
<g font-size="12" fill="currentColor" opacity="0.85"><text x="52" y="122" text-anchor="middle">30 dana</text><text x="158.5" y="122" text-anchor="middle">6 meseci</text><text x="298" y="122" text-anchor="end">1 godina</text><text x="94.5" y="140" text-anchor="middle">3 meseca</text></g>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">puna zelena ivica = tačan okvir · isprekidane crvene = ponude koje sužavaju okvir, svaka sa svoje strane</p>
<p><b>Isto rečima:</b> mera traje <b>najmanje 30 dana, najviše jednu godinu</b>. Jedan mamac ti skraćuje gornju granicu na šest meseci, drugi ti podiže donju na tri meseca. Zapamti obe krajnje tačke i biraj najširu ponudu.</p>
<p>Dvadeset pitanja pita samo da li se mera izriče, a odgovor su dve reči. Nauči spisak — pravilo ispod pokriva većinu, ali ne sve.</p>
<table>
<tr><th>IZRIČE SE</th><th>NE IZRIČE SE</th></tr>
<tr><td>u naselju: prekoračenje 30 km/h</td><td>u naselju: prekoračenje 10 km/h</td></tr>
<tr><td>van naselja: prekoračenje 60 km/h</td><td>van naselja: prekoračenje 30 km/h</td></tr>
<tr><td>alkohol preko 0,50 mg/ml</td><td>alkohol preko 0,30 do 0,50 mg/ml</td></tr>
<tr><td>preticanje preko neisprekidane linije, uz ulazak u traku suprotnog smera</td><td>pretičeš vozilo koje je već dalo znak da i samo pretiče</td></tr>
<tr><td>prolazak kad ti je svetlosnim znakom prolaz zabranjen</td><td>postupanje suprotno postavljenom saobraćajnom znaku</td></tr>
<tr><td>uslovna zelena strelica: ne propustiš vozilo na putu na koji ulaziš</td><td>parkiranje na pešačkom prelazu</td></tr>
<tr><td>vozilo nije upisano u jedinstveni registar</td><td>istekla registraciona nalepnica</td></tr>
<tr><td>dozvola istekla više od šest meseci</td><td>dozvola istekla najviše šest meseci</td></tr>
<tr><td>voziš vozilom isključenim iz saobraćaja</td><td></td></tr>
<tr><td>noću na neosvetljenom putu bez ijednog svetla</td><td></td></tr>
<tr><td>dete mlađe od 12 godina u krilu</td><td></td></tr>
<tr><td>ne staneš pred prugom kad svetlosni znak najavljuje voz (prelaz bez branika)</td><td></td></tr>
</table>
<p><b>Isto rečima:</b> mera prati <b>opasnu radnju u vožnji</b> — brzinu sa poenima, alkohol preko 0,50, crveno, mrak bez svetala, dete u krilu, prugu, kršenje isključenja. Ne prati <b>parkiranje, sam prekršeni znak, blago prekoračenje i blagi alkohol</b>. Ostaju tri reda koje to pravilo ne pokriva — dva preticanja i uslovna strelica — i dva para koja liče na čistu papirologiju. Njih zapamti kao slike i ključeve.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 196" style="max-width:306px;width:100%" role="img" aria-label="Dva preticanja, jedno ispod drugog. Gore: prelaziš preko pune uzdužne linije u traku suprotnog smera — zaštitna mera se izriče. Dole: pretičeš vozilo koje je već dalo znak da i samo pretiče, ostaješ u svojoj traci — mera se ne izriče.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="#c0392b">preko PUNE linije u suprotnu traku</text>
<rect x="8" y="20" width="214" height="50" fill="#9aa7b4"/>
<line x1="8" y1="45" x2="222" y2="45" stroke="#fff" stroke-width="2.5"/>
<g class="animIzlazak"><rect x="64" y="26" width="40" height="14" rx="4" fill="#2c6aa0"/><rect x="74" y="21" width="22" height="6" rx="3" fill="#2c6aa0"/></g>
<line x1="44" y1="58" x2="58" y2="42" stroke="#2c6aa0" stroke-width="2" stroke-dasharray="4 3"/>
<polygon points="62,38 53,47 60,51" fill="#2c6aa0"/>
<g opacity="0.6"><rect x="120" y="54" width="40" height="14" rx="4" fill="#2a333d"/><rect x="130" y="48" width="22" height="6" rx="3" fill="#2a333d"/></g>
<circle cx="262" cy="45" r="17" fill="none" stroke="#c0392b" stroke-width="2"/>
<text x="262" y="52" font-size="18" text-anchor="middle" fill="#c0392b">✓</text>
<text x="153" y="88" font-size="12" text-anchor="middle" fill="#c0392b">zaštitna mera SE IZRIČE</text>
<text x="153" y="112" font-size="12" text-anchor="middle" fill="currentColor">pretičeš onog ko je već dao znak</text>
<rect x="8" y="120" width="214" height="50" fill="#9aa7b4"/>
<line x1="8" y1="145" x2="222" y2="145" stroke="#fff" stroke-width="2" stroke-dasharray="12 9"/>
<g opacity="0.75"><rect x="130" y="126" width="40" height="14" rx="4" fill="#2a333d"/><rect x="140" y="121" width="22" height="6" rx="3" fill="#2a333d"/></g>
<circle class="animMigavac" cx="134" cy="123" r="3.5" fill="#e8b000"/>
<g><rect x="60" y="126" width="40" height="14" rx="4" fill="#2c6aa0"/><rect x="70" y="121" width="22" height="6" rx="3" fill="#2c6aa0"/></g>
<circle cx="262" cy="145" r="17" fill="none" stroke="#1f7a3f" stroke-width="2"/>
<text x="262" y="152" font-size="18" text-anchor="middle" fill="#1f7a3f">✗</text>
<text x="153" y="188" font-size="12" text-anchor="middle" fill="#1f7a3f">zaštitna mera se NE izriče</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">plavo = ti · žuta tačka = pokazivač pravca vozila ispred tebe, koje je već dalo znak da i samo pretiče · gore je puna linija i tuđa traka, dole si ostao u svojoj</p>
<p><b>Ključ za ta tri reda:</b> mera prati <b>traku suprotnog smera</b> — preticanje preko neisprekidane linije uz ulazak u tuđu traku je isti scenario kao kod nasilničke vožnje, čeoni sudar, pa mera ide. Preticanje onoga ko je već dao znak da i sâm pretiče je zabranjeno i kažnjivo, ali se odigrava u <b>tvojoj</b> traci — mera ne ide. Uslovna zelena strelica je treći slučaj i on je <b>kontraprimer intuiciji</b> „mala kazna, dakle nema mere“: kazna je raspon uz svega 2 poena, a mera se ipak <b>izriče</b>, jer je propuštanje vozila sam uslov pod kojim smeš da prođeš strelicu — prekršiš uslov, pao je ceo osnov prolaska.</p>
<p>Ostaju još dva para koja liče na čistu papirologiju, a razdvajaju se:</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="istekla registraciona nalepnica — zaštitna mera se ne izriče"><rect x="4" y="4" width="42" height="26" rx="3" fill="none" stroke="currentColor"/><circle cx="25" cy="15" r="7" fill="none" stroke="currentColor"/><line x1="9" y1="25" x2="41" y2="25" stroke="currentColor" opacity="0.6"/><circle cx="63" cy="12" r="10" fill="none" stroke="#1f7a3f"/><text x="63" y="17" font-size="13" text-anchor="middle" fill="#1f7a3f">✗</text><text x="39" y="47" font-size="11" text-anchor="middle" fill="currentColor">rok</text><text x="39" y="63" font-size="11" text-anchor="middle" fill="currentColor">istekao</text></svg>
    <b>NALEPNICA ISTEKLA</b><span>vozilo jeste u registru, samo je nalepnici istekao rok — mera se NE izriče</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="vozilo nije upisano u jedinstveni registar — zaštitna mera se izriče"><rect x="4" y="14" width="44" height="14" rx="4" fill="none" stroke="currentColor"/><rect x="14" y="7" width="24" height="8" rx="3" fill="none" stroke="currentColor"/><rect x="31" y="17" width="15" height="8" rx="2" fill="none" stroke="#c0392b" stroke-dasharray="3 2"/><circle cx="63" cy="12" r="10" fill="none" stroke="#c0392b"/><text x="63" y="17" font-size="13" text-anchor="middle" fill="#c0392b">✓</text><text x="39" y="47" font-size="11" text-anchor="middle" fill="currentColor">nije u</text><text x="39" y="63" font-size="11" text-anchor="middle" fill="currentColor">registru</text></svg>
    <b>NIJE U REGISTRU</b><span>vozilo van svake evidencije i kontrole — mera se IZRIČE</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="vozačka dozvola istekla najviše šest meseci — zaštitna mera se ne izriče"><rect x="4" y="4" width="44" height="26" rx="4" fill="none" stroke="currentColor"/><circle cx="15" cy="14" r="5" fill="none" stroke="currentColor"/><line x1="24" y1="12" x2="43" y2="12" stroke="currentColor" opacity="0.6"/><line x1="24" y1="20" x2="43" y2="20" stroke="currentColor" opacity="0.6"/><circle cx="63" cy="12" r="10" fill="none" stroke="#1f7a3f"/><text x="63" y="17" font-size="13" text-anchor="middle" fill="#1f7a3f">✗</text><text x="39" y="47" font-size="11" text-anchor="middle" fill="currentColor">do 6</text><text x="39" y="63" font-size="11" text-anchor="middle" fill="currentColor">meseci</text></svg>
    <b>DOZVOLA ISTEKLA DO 6 MESECI</b><span>administrativni propust — mera se NE izriče</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 78 70" role="img" aria-label="vozačka dozvola istekla više od šest meseci — zaštitna mera se izriče"><rect x="4" y="4" width="44" height="26" rx="4" fill="none" stroke="#c0392b"/><circle cx="15" cy="14" r="5" fill="none" stroke="#c0392b"/><line x1="24" y1="12" x2="43" y2="12" stroke="#c0392b" opacity="0.7"/><line x1="24" y1="20" x2="43" y2="20" stroke="#c0392b" opacity="0.7"/><circle cx="63" cy="12" r="10" fill="none" stroke="#c0392b"/><text x="63" y="17" font-size="13" text-anchor="middle" fill="#c0392b">✓</text><text x="39" y="47" font-size="11" text-anchor="middle" fill="currentColor">preko 6</text><text x="39" y="63" font-size="11" text-anchor="middle" fill="currentColor">meseci</text></svg>
    <b>DOZVOLA ISTEKLA PREKO 6 MESECI</b><span>predugo voziš bez provere uslova — mera se IZRIČE</span>
  </div>
</div>
<p class="mut">Pamtilica: u oba para <b>teža sličica je ona kod koje je nadzor prestao da postoji</b> — vozilo nije ni upisano, dozvola je istekla toliko davno da provera uslova više ne stoji ni na papiru. Zeleni ✗ znači „mera se ne izriče“, crveni ✓ znači „izriče se“ — isto kao na crtežima brzine. Ta dva ✗ su ujedno i dokaz da poeni ne odlučuju o meri: oba prekršaja nose po 2 kaznena poena, a mere nema.</p>
</div>

<!-- CELINA 6 - izvor parova: zaustavna traka #8314 (zaustavio se - srednja, nizi raspon, bez poena) vs
     #8247 (krece se zaustavnom trakom autoputa - najteza) i #8246 (preticanje zaustavnom trakom
     motoputa - najteza); svetla #8241/#8417 (nijedno svetlo - najteza + mera), #8260 (bez zadnjih
     pozicionih - raspon + 6 poena); nezgoda #8244 (ucesnik, ima povredenih - najteza), #8324 (naidjes
     i ne javis - raspon bez poena), #8273 (ucesnik, materijalna steta i neko zahteva uvidjaj, ne
     ostane do kraja - raspon + 2 poena); dozvola #8228 (nemas za kategoriju - najteza), #8326 (do 6
     meseci - raspon + 2 poena), #8274 (preko 6 meseci - raspon + 5 poena); registracija #8337/#8412/
     #8421; crveno #8271 (srednja, 6 poena; postojece objasnjenje: sa pesakom na prelazu najteza,
     dvaput na crveno u kratkom roku nasilnicka); odgovornost vlasnika #8340 i kazna #8341. -->
<div class="kPodH"><b class="kPodNaslov">Parovi i formulacije koje se stalno nude jedna uz drugu</b>
<p>Šest tema u bazi ima blažu i težu verziju, a razlikuju se u jednoj reči ili u jednoj okolnosti. Najopasniji par je zaustavna traka: sve zavisi od toga da li se <b>krećeš</b> ili <b>stojiš</b>.</p>
<div style="display:flex;justify-content:center;margin:8px 0">
<svg viewBox="0 0 306 202" style="max-width:306px;width:100%" role="img" aria-label="Zaustavna traka, dva slučaja jedan ispod drugog. Gore: vozilo stoji na zaustavnoj traci — srednja klasa, niži raspon bez kaznenih poena. Dole: vozilo se kreće zaustavnom trakom — najteža klasa, zatvor ili novčana kazna i 14 kaznenih poena.">
<text x="153" y="14" font-size="12" text-anchor="middle" fill="currentColor">ZAUSTAVIŠ SE NA NJOJ</text>
<rect x="8" y="22" width="290" height="32" fill="#9aa7b4"/>
<rect x="8" y="54" width="290" height="26" fill="#9aa7b4" fill-opacity="0.55"/>
<line x1="8" y1="54" x2="298" y2="54" stroke="#fff" stroke-width="2.5"/>
<g><rect x="110" y="62" width="40" height="14" rx="4" fill="#2c6aa0"/><rect x="120" y="57" width="22" height="6" rx="3" fill="#2c6aa0"/></g>
<text x="153" y="96" font-size="12" text-anchor="middle" fill="currentColor">stoji — SREDNJA klasa, bez poena</text>
<text x="153" y="120" font-size="12" text-anchor="middle" fill="#c0392b">VOZIŠ ILI PRETIČEŠ NJOME</text>
<rect x="8" y="128" width="290" height="32" fill="#9aa7b4"/>
<rect x="8" y="160" width="290" height="26" fill="#9aa7b4" fill-opacity="0.55"/>
<line x1="8" y1="160" x2="298" y2="160" stroke="#fff" stroke-width="2.5"/>
<g stroke="#c0392b" stroke-width="2" opacity="0.85"><line x1="112" y1="168" x2="130" y2="168"/><line x1="106" y1="174" x2="124" y2="174"/><line x1="112" y1="180" x2="130" y2="180"/></g>
<g class="animVoziTrakom"><rect x="140" y="167" width="40" height="14" rx="4" fill="#2c6aa0"/><rect x="150" y="162" width="22" height="6" rx="3" fill="#2c6aa0"/></g>
<text x="153" y="198" font-size="12" text-anchor="middle" fill="#c0392b">najteža — zatvor ILI novčana, 14 poena</text>
</svg>
</div>
<p class="mut" style="text-align:center;font-size:var(--fs-sm)">gornji pojas = saobraćajna traka, donji svetliji = zaustavna traka · plavo = ti · razlika između dva panela je samo u tome da li se vozilo pomera</p>
<p><b>Isto rečima:</b> zaustavna traka nije saobraćajna traka — po njoj se ne vozi, jer je to jedini prostor za vozila u kvaru i za hitne službe. Zato <b>zaustavljanje</b> na njoj ostaje srednja klasa (niži raspon), a <b>kretanje</b> odnosno <b>preticanje</b> njome ide u najtežu: takvim manevrom udaraš u zaustavljene i blokiraš pomoć.</p>
<table>
<tr><th>Tema</th><th>Blaže</th><th>Teže</th></tr>
<tr><td>Zaustavna traka</td><td><b>zaustaviš se</b> na njoj — raspon, bez poena</td><td><b>voziš</b> odnosno <b>pretičeš</b> njome — najteža, 14 poena</td></tr>
<tr><td>Svetla noću</td><td>samo poziciona, ili bez zadnjih pozicionih — raspon, 6 poena</td><td><b>nijedno</b> svetlo na neosvetljenom putu — najteža, 14 poena</td></tr>
<tr><td>Nezgoda</td><td>naiđeš i ne javiš — raspon, bez poena · učesnik si, ima materijalne štete i neko <b>zahteva uviđaj</b>, a ti ne ostaneš do kraja uviđaja — raspon, 2 poena</td><td>učesnik si, <b>ima povređenih</b>, ne staneš odnosno ne javiš — najteža, 14 poena</td></tr>
<tr><td>Vozačka dozvola</td><td>nije kod tebe — lakša · istekla do šest meseci — raspon, 2 poena · preko šest meseci — raspon, 5 poena</td><td><b>nemaš je za tu kategoriju</b> — najteža, 14 poena</td></tr>
<tr><td>Registracija</td><td>istekla <b>nalepnica</b> — raspon, 2 poena, bez zabrane</td><td>vozilo <b>nije u registru</b> — raspon, 6 poena, sa zabranom</td></tr>
<tr><td>Crveno svetlo</td><td>prođeš na crveno — raspon, 6 poena</td><td>na crveno, a <b>pešak je na prelazu</b> — najteža, 14 poena · dvaput na crveno u kratkom roku — nasilnička</td></tr>
</table>
<p class="mut">Pamtilica: teža strana je ona u kojoj je <b>nečiji život neposredno ugrožen</b> — pešak na prelazu, povređeni u nezgodi, zaustavljeni na zaustavnoj traci, ti sam kao nevidljivo vozilo u mraku — ili ona u kojoj <b>uopšte nemaš pravo</b> da voziš to vozilo. Jedini red koji ne ide po tom ključu je Registracija: tamo je teža strana vozilo koje uopšte <b>nije u registru</b> — van svake evidencije i kontrole.</p>
<p><b>Jedno pitanje ne pita kaznu nego odgovornost.</b> Kad vozač koji je učinio prekršaj nije identifikovan, vlasnik vozila <b>odgovoran je što je omogućio</b> da se njegovim vozilom učini prekršaj. Nije tačno ni „odgovoran je za prekršaj koji je tim vozilom učinjen“ ni „nije odgovoran“ — odgovara za propust nadzora nad svojim vozilom, ne za sam prekršaj. Blizanačko pitanje, koje pita kaznu za to isto, ide po opštem pravilu: raspon.</p>
</div>
`,
};
BYSUB[182] = 'kaznene-klase';

X[8225] = { x: "Opšti okvir zaštitne mere zabrane upravljanja: NAJMANJE 30 DANA, NAJVIŠE GODINU DANA (Zakon o prekršajima čl. 58). ZOBS uz to za pojedine prekršaje propisuje strože minimume trajanja (čl. 338). Oba pogrešna odgovora sužavaju okvir — pamti celu lestvicu: od 30 dana do jedne godine." };
X[8228] = { x: "Vožnja bez vozačke dozvole za kategoriju kojom upravljaš (a nije reč o isteklom roku!) u ispitnoj bazi je u NAJTEŽOJ prekršajnoj klasi — zatvor ili najviša novčana kazna uz najviše kaznenih poena (režim ZOBS čl. 330). Logika: vozač koji za to vozilo nikad nije položio je neproveren rizik za sve; istek roka je poseban, blaži slučaj." };
X[8229] = { x: 'Potpuna alkoholisanost (preko 2,00 mg/ml) je vrh lestvice — u ispitnoj bazi razvrstana u najtežu klasu (zatvor ili najviša novčana kazna uz najviše poena). Po slovu zakona takva vožnja je čak NASILNIČKA (ZOBS čl. 41) — u svakom slučaju, kažnjava se najstrože što postoji.' };
X[8230] = { x: 'Odbijanje utvrđivanja alkohola/psihoaktivnih supstanci (alkometar, droga-test, stručni pregled) = NAJTEŽA klasa (ZOBS čl. 330). Logika: odbijanjem se odgovornost ne izbegava — zakon odbijanje kažnjava kao da je nalaz najgori.' };
X[8231] = { x: 'Vožnja za vreme trajanja SVOG isključenja iz saobraćaja = najteža klasa (ZOBS čl. 330). Isključenje je naredba, a njeno kršenje je svesno izigravanje sistema — zato ide uz bok vožnji bez dozvole.' };
X[8232] = { x: 'Isto važi i kada je iz saobraćaja isključeno VOZILO: upravljanje njime za vreme isključenja je najteža klasa (ZOBS čl. 330) — svejedno je da li je "na snazi" zabrana za vozača ili za vozilo.' };
X[8233] = { x: 'Vožnja za vreme zaštitne mere, odnosno mere bezbednosti zabrane upravljanja = najteža klasa (ZOBS čl. 330) — kršenje sudski izrečene zabrane je među najtežim prekršajima uopšte.' };
X[8239] = { x: "U zoni usporenog saobraćaja sme se najviše 10 km/h — brzinom kretanja pešaka (ZOBS čl. 161). Vožnja od 80 km/h je prekoračenje za 70 km/h, a čl. 330 prekoračenje za više od 50 km/h u ovoj zoni svrstava u NAJTEŽU klasu — zatvor ili najviša novčana kazna uz najviše poena. Zone postoje baš zato što su tamo pešaci i deca na kolovozu." };
X[8240] = { x: "Zona škole u naselju: ograničenje 30 km/h, i to od 7 do 21 čas, osim ako znak odredi drugačije (ZOBS čl. 163) — u 14:00 zona svakako važi. Vožnja od 100 km/h je prekoračenje za 70 km/h, a čl. 330 prekoračenje za više od 60 km/h u zoni \"30\" i zoni škole svrstava u NAJTEŽU klasu." };
X[8241] = { x: 'Noćna vožnja na neosvetljenom putu BEZ IJEDNOG svetla (ni za osvetljavanje puta ni prednjeg pozicionog) = najteža klasa (ZOBS čl. 330) — nevidljivo vozilo u mraku je neposredna opasnost po život, tvoj i tuđi.' };
X[8242] = { x: 'Proći kad ti je prolaz zabranjen (semaforom ili znakom ovlašćenog lica) preko pešačkog prelaza NA KOME JE PEŠAK = najteža klasa (ZOBS čl. 330). Crveno + pešak na prelazu je scenario sa najvećim rizikom od gaženja — zato vrh lestvice.' };
X[8244] = { x: 'Učestvovati u nezgodi sa povređenima pa NE zaustaviti vozilo, odnosno NE obavestiti policiju = najteža klasa (ZOBS čl. 330; same dužnosti posle nezgode propisuje čl. 168). Ostavljanje povređenog bez pomoći može da bude i krivično delo.' };
X[8247] = { x: "Vožnja ZAUSTAVNOM trakom autoputa je izričito zabranjena (ZOBS čl. 104: zaustavnom trakom zabranjeno je kretanje vozila) i u ispitnoj bazi je razvrstana u NAJTEŽU klasu — zatvor ili najviša novčana kazna uz najviše kaznenih poena. Zaustavna traka je jedini prostor za nuždu i intervencije — vozilo koje njome vozi udara u zaustavljene i blokira pomoć." };
X[8340] = { x: "Kada vozač koji je učinio prekršaj NIJE identifikovan, vlasnik vozila odgovara što je OMOGUĆIO da se njegovim vozilom učini prekršaj — za propust nadzora nad vozilom, ne za sam prekršaj (zato su i \"odgovoran za taj prekršaj\" i \"nije odgovoran\" pogrešni). Napomena: ovo je pravilo ranijeg čl. 320 ZOBS; po izmenama iz 2018. vlasnik danas odgovara ako na zahtev policije ne otkrije identitet vozača — poenta je ista: vozilo je tvoja odgovornost i kad ga daš drugome." };


// --- Kaznene mere, podtura B: srednja klasa (novčani raspon + poeni), 16 pitanja — bez iznosa ---
X[8252] = { x: 'Obilaženje vozila koje se zaustavilo ispred pešačkog prelaza da propusti pešake u ispitnoj bazi je u SREDNJOJ klasi (novčani raspon + kazneni poeni). Pazi: po važećem zakonu ovo je preseljeno MEĐU NAJTEŽE prekršaje (čl. 330) — iza zaustavljenog vozila često izlazi pešak koga ne vidiš. U vožnji se ponašaj kao da je najteži prekršaj, jer po aktuelnom zakonu i jeste.' };
X[8260] = { x: 'Noću bez uključenih ZADNJIH pozicionih svetala = SREDNJA klasa (novčani raspon + poeni). Nevidljiv si otpozadi — realan rizik naletanja; ipak blaže od vožnje bez IJEDNOG svetla na neosvetljenom putu, koja je najteža klasa (čl. 330).' };
X[8261] = { x: 'Na neosvetljenom putu noću SAMO sa pozicionim svetlima (bez svetala za osvetljavanje puta) = SREDNJA klasa. Poziciona svetla te čine vidljivim, ali put ne osvetljavaju — voziš naslepo; bez ijednog svetla uopšte bila bi najteža klasa (čl. 330).' };
X[8264] = { x: 'Uključivanje na autoput mimo prilaznog puta namenjenog za uključenje = SREDNJA klasa (novčani raspon + poeni). Prilazni put postoji da ubrzaš i bezbedno se upišeš u tok — upad sa strane iznenađuje vozila u punoj brzini.' };
X[8265] = { x: 'Nepropuštanje vozila SA PRVENSTVOM PROLAZA = SREDNJA klasa (novčani raspon + poeni). Dužnost propuštanja propisuje ZOBS čl. 109 — hitna vozila gube sekunde koje nekoga koštaju života.' };
X[8266] = { x: 'Ne zaustaviti se kada policijsko vozilo s prvenstvom prolaza IZA tebe daje i svetlosni znak upozorenja = SREDNJA klasa, sa više poena nego obično nepropuštanje. Sama dužnost je iz ZOBS čl. 110: odmah bezbedno stani uz desnu ivicu — znak je upućen lično tebi.' };
X[8272] = { x: 'Zona škole u naselju (ograničenje 30 km/h): 85 km/h je prekoračenje za 55 — veliko, ali ispod praga od 60 km/h preko koga zakon u zonama prelazi u najtežu klasu (čl. 330) — zato SREDNJA klasa sa poenima. Uporedi: 100 km/h u istoj zoni (prekoračenje 70) je najteža klasa.' };
X[8273] = { x: 'Napustiti mesto nezgode SA MATERIJALNOM ŠTETOM pre završetka uviđaja (kada ga učesnik zahteva) = SREDNJA klasa sa malo poena. Kontrast: napuštanje nezgode sa POVREĐENIMA je najteža klasa (čl. 330) — težina kazne prati težinu posledica.' };
X[8274] = { x: "Vožnja sa dozvolom kojoj je rok istekao PRE VIŠE OD ŠEST MESECI u ispitnoj bazi je u SREDNJOJ klasi (novčani raspon + poeni). Šest meseci je i po važećem zakonu prekretnica — do šest meseci blaži prekršaj (čl. 333), preko toga teži (čl. 332a) — s tim što su danas obe kazne fiksni iznosi bez poena. Rok važenja postoji da vozač periodično prođe proveru uslova za upravljanje: što duže voziš sa isteklom dozvolom, duže si bez te provere." };
X[8275] = { x: "Korišćenje DVE vozačke dozvole izdate od dve države istovremeno u ispitnoj bazi je SREDNJA klasa (novčani raspon, bez poena); po važećem zakonu prekršaj je oštriji (čl. 331 — uz mogućnost i zatvora). Ne smeju se u isto vreme KORISTITI dve dozvole dve države (ZOBS čl. 183) — ko ima i srpsku i stranu, u Srbiji koristi srpsku. Dupla upotreba otvara prostor za izigravanje evidencije kazni i poena." };
X[8276] = { x: 'Korišćenje obrasca dozvole čiji si NESTANAK sam PRIJAVIO = SREDNJA klasa sa poenima. Prijavom nestanka taj obrazac je prestao da važi — vožnja s njim je vožnja sa nevažećom ispravom.' };
X[8277] = { x: 'Vožnja pod dejstvom PSIHOAKTIVNIH SUPSTANCI u ispitnoj bazi je u SREDNJOJ klasi sa visokim poenima. Suština je stroža od klase: nulta tolerancija — vozač ne sme biti ni pod kakvim dejstvom psihoaktivnih supstanci (ZOBS čl. 187), a zakon je kažnjavanje droge za volanom vremenom samo pooštravao.' };
X[8278] = { x: "Sadržina od 1,80 mg/ml je \"veoma teška alkoholisanost\" (kategorije iz ZOBS čl. 187). U ispitnoj bazi ovo je SREDNJA klasa sa mnogo poena; po važećem zakonu opseg više od 1,20 do 2,00 mg/ml spada u NAJTEŽU klasu (čl. 330), a preko 2,00 je nasilnička vožnja — još strože. U svakom slučaju: skoro vrh lestvice." };
X[8281] = { x: 'Vlasnik koji policiji NE DA PODATKE o tome kome je dao vozilo u ispitnoj bazi je u SREDNJOJ klasi (bez poena — nije prekršaj u vožnji). Danas je ta dužnost u ZOBS čl. 247 (na zahtev policije vlasnik otkriva identitet vozača), a zakon je odbijanje vremenom pooštrio.' };
X[8282] = { x: 'Učestvovanje u saobraćaju vozilom koje NIJE UPISANO u jedinstveni registar = SREDNJA klasa sa poenima, a uz kaznu ide i zaštitna mera zabrane upravljanja. Neregistrovano vozilo je van sistema: bez pregleda, bez osiguranja, bez odgovornosti.' };
X[8283] = { x: 'Ne omogućiti KONTROLNI tehnički pregled na koji je vozilo upućeno = SREDNJA klasa sa poenima. Kontrolni pregled je vanredna provera tehničke ispravnosti — izbegavanje provere se tretira ozbiljno, jer se u ispravnost već sumnja.' };


// --- Kaznene mere, podtura C: blaža srednja klasa (niži raspon, 0-6 poena), 22 pitanja — bez iznosa ---
X[8296] = { x: 'Uključivanje u saobraćaj bez prethodnog uveravanja da ne ometaš druge i bez obaveštavanja o nameri = srednja klasa, niži raspon, bez poena. Dužnost je dvostruka: uveri se + najavi (ZOBS čl. 32) — oba dela moraju.' };
X[8302] = { x: 'Polukružno okretanje U TUNELU = srednja klasa sa malo poena. Tunel je na spisku mesta gde je polukružno okretanje izričito zabranjeno (ZOBS čl. 50) — nema ni preglednosti ni prostora za manevar.' };
X[8305] = { x: 'Preticanje NEPOSREDNO ISPRED RASKRSNICE na putu koji nije sa prvenstvom prolaza = srednja klasa sa malo poena (zabrana iz ZOBS čl. 57 — izuzeci postoje samo na putu SA prvenstvom prolaza). Ispred raskrsnice pažnja mora biti na prvenstvu i pešacima, ne na manevru preticanja.' };
X[8306] = { x: 'Vožnja za vreme MAGLE bez uključenih svetala za osvetljavanje puta = srednja klasa sa poenima. U magli svetla nisu samo radi tvog vida — ona su tu da TEBE vide drugi.' };
X[8314] = { x: 'ZAUSTAVLJANJE vozila na zaustavnoj traci autoputa = srednja klasa, niži raspon. Zaustavna traka služi isključivo za prinudna zaustavljanja — zaustavljanje iz komocije pravi opasnu prepreku u zoni najvećih brzina. Uporedi: VOŽNJA zaustavnom trakom je u ispitnoj bazi najteža klasa.' };
X[8318] = { x: 'Prevoz VIŠE LICA nego što je označeno u saobraćajnoj dozvoli = srednja klasa sa poenima. Broj mesta iz dozvole je granica za koju je vozilo konstruisano i opremljeno — višak putnika je nezaštićen.' };
X[8320] = { x: 'Proći uslovnu zelenu strelicu pa NE PROPUSTITI PEŠAKA koji prelazi kolovoz = srednja klasa sa malo poena. Uslovna strelica dozvoljava prolaz dok gori crveno/žuto samo uz propuštanje pešaka i vozila (ZOBS čl. 143) — propuštanje je sam uslov prolaska.' };
X[8321] = { x: 'Proći uslovnu zelenu strelicu pa NE PROPUSTITI VOZILO na putu na koji ulaziš = srednja klasa sa malo poena, isto kao za pešaka (ZOBS čl. 143). Strelica ti daje mogućnost prolaza — ne prvenstvo.' };
X[8322] = { x: 'Vožnja PEŠAČKOM ZONOM = srednja klasa sa malo poena. Pešačka zona je prostor namenjen pešacima — vozilo tamo ne pripada.' };
X[8323] = { x: 'Zona škole VAN naselja: ograničenje brzine je više nego u naselju, pa je 85 km/h manje prekoračenje — zato srednja klasa sa poenima, blaže nego što bi ista brzina prošla u naselju. Ista brzina u zoni škole U NASELJU (ograničenje 30 km/h) bila bi mnogo strože kažnjena: mesto određuje težinu.' };
X[8324] = { x: 'Ko se ZATEKNE ili naiđe na nezgodu sa povređenima a ne obavesti policiju i/ili hitnu pomoć = srednja klasa, niži raspon. Dužnost pomoći važi za svakoga ko naiđe (ZOBS čl. 167) — ali je blaže kažnjena nego kada UČESNIK nezgode pobegne, što je najteža klasa.' };
X[8326] = { x: 'Vožnja sa dozvolom isteklom NAJVIŠE ŠEST MESECI = blaža srednja klasa sa malo poena. Ispod granice od šest meseci zakon gleda blaže; preko šest meseci ide teže — i u ispitnoj bazi i po važećem zakonu.' };
X[8328] = { x: 'Neprijavljivanje PROMENE PREBIVALIŠTA nadležnom organu u roku = srednja klasa, bez poena — administrativni propust, ne opasna radnja. Evidencija vozača mora da zna gde si, zbog dostave i kontrole.' };
X[8329] = { x: 'Vožnja u stanju SREDNJE alkoholisanosti (kategorije iz ZOBS čl. 187) = srednja klasa sa više poena. Lestvica prati promile: što viša kategorija alkoholisanosti, viša klasa kazne — do najteže (preko 1,20) i nasilničke (preko 2,00).' };
X[8330] = { x: 'Za KANDIDATA tokom praktične obuke srednja alkoholisanost se kažnjava isto kao za vozača — istom klasom. Pri tome za kandidata važi NULTA tolerancija (ZOBS čl. 187): zabrana počinje od prvog miligrama, a stepen alkoholisanosti određuje samo visinu kazne.' };
X[8333] = { x: 'Vožnja vozila tehnički neispravnog u pogledu UREĐAJA ZA ZAUSTAVLJANJE = srednja klasa, niži raspon. Kočnice su najkritičniji uređaj; zapamti da uz vozača odgovara i vlasnik koji takvo vozilo pusti u saobraćaj (ZOBS čl. 5).' };
X[8334] = { x: 'Kada neispravnim vozilom (kočnice) upravlja DRUGO lice, kažnjava se i VLASNIK — istom klasom kao vozač. Osnov: vlasnik je dužan da obezbedi da njegovo vozilo u saobraćaju bude tehnički ispravno (ZOBS čl. 5).' };
X[8335] = { x: 'PREPRAVLJENO vozilo ne sme u saobraćaj pre nego što nadležni organ utvrdi da ispunjava propisane uslove (ispitivanje posle prepravke — ZOBS čl. 249) = srednja klasa. Prepravkom se menjaju konstruktivne karakteristike, pa staro odobrenje više ne važi.' };
X[8337] = { x: 'Vožnja posle isteka roka važenja REGISTRACIONE NALEPNICE = srednja klasa sa malo poena. Nalepnica je oznaka roka u kome vozilo sme u saobraćaj — istekla nalepnica znači neproveren tehnički status vozila.' };
X[8338] = { x: 'Vlasnik koji posle isteka registracije NE VRATI registarske TABLICE izdavaocu u roku = srednja klasa, bez poena. Administrativna obaveza prema registru: tablice pripadaju evidenciji, ne vozilu zauvek.' };
X[8339] = { x: 'Neprijavljivanje PROMENE PODATAKA koji se upisuju u saobraćajnu dozvolu = srednja klasa, bez poena. Administrativni red: dozvola mora odgovarati stvarnom stanju vozila i vlasnika.' };
X[8341] = { x: 'Kada vozač koji je učinio prekršaj NIJE identifikovan, vlasnik se kažnjava srednjom klasom, nižim rasponom — za OMOGUĆAVANJE prekršaja, ne za sam prekršaj. Odgovornost je za propust nadzora nad sopstvenim vozilom. Napomena: ovo je pravilo ranijeg zakona — danas vlasnik odgovara ako policiji ne otkrije identitet vozača (čl. 247), i to znatno strože.' };


// --- Kartica "Slični pojmovi" (Milanov zahtev): 4 radnje prolaženja, odstojanje/rastojanje,
// vidljivost/preglednost, kolona — sve verbatim iz ZOBS čl. 7 (t. 71-79, 86-87) ---
CARDS['slicni-pojmovi'] = {
  title: 'Slični pojmovi — u čemu je razlika',
  html: `
<p><b>Četiri radnje prolaženja (čl. 7):</b> pitaj se samo — ŠTA radi onaj pored koga prolaziš?</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="25" y="0" width="60" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      ${carG(40, 66, '#2c6aa0')}${arr(40, 42, 40, 14, '#2c6aa0')}
      ${carG(70, 32, '#c0392b', 180)}${arr(70, 56, 70, 84, '#c0392b')}</svg>
    <b>MIMOILAŽENJE</b><span>dolazi iz SUPROTNOG smera</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="25" y="0" width="60" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      ${carG(70, 58, '#5f6d7a')}${arr(70, 34, 70, 16, '#5f6d7a', 3)}
      ${carG(40, 44, '#2c6aa0')}${arr(40, 20, 40, 4, '#2c6aa0')}</svg>
    <b>PRETICANJE</b><span>KREĆE SE u istom smeru</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="25" y="0" width="60" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      ${carG(70, 46, '#5f6d7a')}<text x="70" y="52" text-anchor="middle" font-size="16" fill="#fff" font-weight="bold">P</text>
      ${carG(40, 80, '#2c6aa0')}<path d="M40 60 L40 46 Q40 28 55 26 Q70 24 70 12" stroke="#2c6aa0" stroke-width="3.5" fill="none" stroke-dasharray="6 5" stroke-linecap="round"/>${arr(70, 20, 70, 8, '#2c6aa0')}</svg>
    <b>OBILAŽENJE</b><span>NE POMERA SE (vozilo, objekat, prepreka)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="0" y="26" width="110" height="40" fill="#9aa7b4"/><rect x="36" y="66" width="38" height="34" fill="#9aa7b4"/>
      <line x1="41" y1="62" x2="69" y2="62" stroke="#fff" stroke-width="3.5"/>
      ${carG(55, 84, '#2c6aa0')}
      ${carG(24, 46, '#c0392b', 90)}${arr(48, 46, 92, 46, '#c0392b')}</svg>
    <b>PROPUŠTANJE</b><span>omogućavaš prolaz onome KO IMA PRVENSTVO — on ne menja način kretanja</span>
  </div>
</div>
<p><b>Odstojanje i rastojanje (čl. 7):</b> ista reč "udaljenost", različit pravac merenja.</p>
<div class="signRow" style="max-width:460px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 90 120"><rect x="20" y="0" width="50" height="120" fill="#9aa7b4"/>
      ${carG(45, 22, '#2c6aa0')}${carG(45, 98, '#5f6d7a')}
      ${arr(45, 46, 45, 42, '#8a5a00')}${arr(45, 74, 45, 78, '#8a5a00')}<line x1="45" y1="44" x2="45" y2="76" stroke="#8a5a00" stroke-width="3"/></svg>
    <b>ODSTOJANJE</b><span>UZDUŽNA udaljenost (napred-nazad)</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 110 100"><rect x="10" y="0" width="90" height="100" fill="#9aa7b4"/><line x1="55" y1="0" x2="55" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      ${carG(32, 50, '#2c6aa0')}${carG(78, 50, '#5f6d7a')}
      ${arr(48, 50, 44, 50, '#8a5a00')}${arr(62, 50, 66, 50, '#8a5a00')}<line x1="46" y1="50" x2="64" y2="50" stroke="#8a5a00" stroke-width="3"/></svg>
    <b>RASTOJANJE</b><span>BOČNA udaljenost (levo-desno)</span>
  </div>
</div>
<div class="vgrid" style="grid-template-columns:auto 1fr">
  <div class="vg vgHead"><b>VIDLJIVOST</b></div><div class="vg" style="text-align:left">koliko jasno vidiš KOLOVOZ — zavisi od svetlosnih uslova (noć, magla, padavine). Smanjena: ispod 200 m van naselja, ispod 100 m u naselju</div>
  <div class="vg vgHead"><b>PREGLEDNOST</b></div><div class="vg" style="text-align:left">dokle vidiš DRUGOG UČESNIKA ili prepreku s obzirom na FIZIČKE prepreke (krivina, breg, objekat) — pri normalnoj vidljivosti</div>
  <div class="vg vgHead"><b>ZAUSTAVLJANJE</b></div><div class="vg" style="text-align:left">prekid do TRI minuta + vozač NE napušta vozilo (i nije po znaku/pravilu)</div>
  <div class="vg vgHead"><b>PARKIRANJE</b></div><div class="vg" style="text-align:left">svaki drugi prekid kretanja — i kraći od 3 minuta ako vozač NAPUSTI vozilo</div>
</div>
<p><b>Kolona (čl. 7):</b> najmanje TRI vozila, jedno iza drugog u ISTOJ traci, međusobno uslovljeno kretanje (bez mesta za ubacivanje).</p>
<div class="signRow" style="max-width:460px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 90 130"><rect x="20" y="0" width="50" height="130" fill="#9aa7b4"/>
      ${carG(45, 22, '#2c6aa0')}${carG(45, 65, '#2c6aa0')}${carG(45, 108, '#2c6aa0')}</svg>
    <b>✓ KOLONA</b><span>i zaustavljena vozila u traci jesu kolona</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 90 130"><rect x="20" y="0" width="50" height="130" fill="#9aa7b4"/><line x1="30" y1="0" x2="30" y2="130" stroke="#fff" stroke-width="2"/>
      ${carG(38, 22, '#5f6d7a')}${carG(38, 65, '#5f6d7a')}${carG(38, 108, '#5f6d7a')}
      <text x="60" y="70" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">P</text></svg>
    <b>✗ NIJE KOLONA</b><span>parkirana vozila nisu kolona</span>
  </div>
</div>
<p><b>Vozač ili pešak (čl. 7):</b> ne gleda se šta imaš u džepu ni šta držiš u rukama, nego <b>šta radiš</b>. <b>Vozač</b> je lice koje NA PUTU <b>upravlja</b> vozilom. Čim vozilo sopstvenom snagom guraš ili vučeš — nisi više vozač, <b>ti si pešak</b>.</p>
<div class="vgrid" style="grid-template-columns:1fr 1fr">
  <div class="vg vgHead">PEŠAK</div><div class="vg vgHead">VOZAČ</div>
  <div class="vg" style="text-align:left">kreće se po putu (hoda)<br>
  sopstvenom snagom <b>gura ili vuče</b> vozilo, ručna kolica, dečje prevozno sredstvo ili kolica za nemoćna lica<br>
  <b>gura bicikl</b><br>
  vozi se u dečjem prevoznom sredstvu ili u kolicima za nemoćna lica — svejedno da li ih pokreće sopstvenom snagom ili motorom<br>
  klizi klizaljkama, skijama ili sankama, vozi se na koturaljkama, skejtbordu i sl.</div>
  <div class="vg" style="text-align:left">upravlja <b>biciklom</b><br>
  upravlja <b>zaprežnim vozilom</b><br>
  upravlja <b>motokultivatorom</b><br>
  upravlja bilo kojim drugim vozilom na putu</div>
</div>
<p><span class="mut">Mamci: „svako lice koje ima vozačku dozvolu" (dozvola u novčaniku ne čini nikoga vozačem) i „lice koje po putu sopstvenom snagom gura ili vuče vozilo" (to je pešak). Na ispitnoj slici pešaci su čovek koji rukama gura automobil i čovek na koturaljkama, dok su biciklista i kočijaš na zaprežnim kolima vozači.</span></p>

<p><b>Saobraćaj = kretanje vozila i lica po PUTU (čl. 7).</b> Svako pitanje prevedi na jedno: <b>da li je ta površina put?</b> Ako nije put, nema ni saobraćaja — pa makar se vozilo kretalo 200 km/h.</p>
<table>
<tr><th>JESTE saobraćaj</th><th>NIJE saobraćaj</th></tr>
<tr><td>kretanje vozila ulicom</td><td>kretanje vozila <b>trkačkom stazom</b></td></tr>
<tr><td>kretanje zaprežnog vozila zemljanim putem</td><td>kretanje traktora <b>njivom</b></td></tr>
<tr><td>kretanje motokultivatora zemljanim putem</td><td>kretanje vozila <b>poligonom</b> za probne vožnje ili sportske priredbe</td></tr>
<tr><td>kretanje pešaka trotoarom</td><td>guranje vozila po <b>platou</b> namenjenom kretanju i okupljanju lica</td></tr>
<tr><td>kretanje bicikla biciklističkom stazom</td><td>kretanje lica po <b>trgu</b></td></tr>
<tr><td>guranje bicikla pešačkom stazom</td><td>kretanje po <b>privatnoj površini</b> koju smeju da koriste samo vozila i lica kojima je vlasnik to omogućio</td></tr>
</table>
<p><span class="mut">Zemljani put jeste put — i onda kad na priključku na drugi put ima izgrađen kolovozni zastor. Njiva, trkačka staza, poligon, plato i trg nisu. Biciklistička staza i trotoar jesu, pa guranje bicikla po njima jeste saobraćaj; samo je učesnik u njemu pešak, a ne vozač.</span></p>

<p><b>Saobraćajna nezgoda (čl. 7)</b> — tri uslova moraju da se poklope: (1) dogodila se <b>na putu ili je započeta na putu</b>, (2) učestvovalo je <b>najmanje jedno vozilo u pokretu</b>, (3) neko je <b>poginuo ili je povređen</b>, <b>ili</b> je nastala <b>materijalna šteta</b>.</p>
<div class="signRow lineRow" style="max-width:460px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 150 100"><rect x="0" y="0" width="150" height="100" fill="#c3d3bd"/>
      <rect x="6" y="0" width="54" height="100" fill="#9aa7b4"/><line x1="33" y1="0" x2="33" y2="100" stroke="#fff" stroke-dasharray="8 7" stroke-width="2"/>
      <line x1="100" y1="0" x2="100" y2="36" stroke="#8a5a00" stroke-width="3"/>
      <line x1="100" y1="72" x2="100" y2="100" stroke="#8a5a00" stroke-width="3"/>
      <g stroke="#8a5a00" stroke-width="2"><line x1="96" y1="6" x2="104" y2="6"/><line x1="96" y1="15" x2="104" y2="15"/><line x1="96" y1="24" x2="104" y2="24"/><line x1="96" y1="33" x2="104" y2="33"/><line x1="96" y1="78" x2="104" y2="78"/><line x1="96" y1="87" x2="104" y2="87"/><line x1="96" y1="96" x2="104" y2="96"/></g>
      <line x1="104" y1="45" x2="119" y2="38" stroke="#8a5a00" stroke-width="3"/>
      <line x1="106" y1="60" x2="121" y2="67" stroke="#8a5a00" stroke-width="3"/>
      <path d="M30 92 Q38 72 72 60" stroke="#c0392b" stroke-width="3" fill="none" stroke-dasharray="6 5" stroke-linecap="round"/>
      <g transform="translate(126 50) rotate(72)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#c0392b"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g></svg>
    <b>✓ JESTE nezgoda</b><span>izletanje sa puta i rušenje dvorišne ograde — nezgoda je započeta NA PUTU, a materijalne štete ima</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 150 100"><rect x="0" y="0" width="150" height="100" fill="#c3d3bd"/>
      <ellipse cx="75" cy="50" rx="58" ry="34" fill="none" stroke="#9aa7b4" stroke-width="20"/>
      <ellipse cx="75" cy="50" rx="58" ry="34" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="7 6"/>
      <g transform="translate(75 16) rotate(90)">
  <rect x="-11" y="-13" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="-13" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-11" y="6" width="4.5" height="8" rx="2" fill="#333"/><rect x="6.5" y="6" width="4.5" height="8" rx="2" fill="#333"/>
  <rect x="-9" y="-17" width="18" height="34" rx="7" fill="#2c6aa0"/>
  <path d="M-6 -9 Q0 -13 6 -9 L6 -4 Q0 -7 -6 -4 Z" fill="#fff" opacity=".85"/>
  <path d="M-6 9 Q0 12 6 9 L6 13 Q0 15 -6 13 Z" fill="#fff" opacity=".5"/>
</g></svg>
    <b>✗ NIJE nezgoda</b><span>povreda vozača i šteta na sportskom automobilu na trkačkoj stazi — staza nije put</span>
  </div>
</div>
<p><span class="mut">Mamci koji zvuče logično, a nisu tačni: „nije nezgoda jer je učestvovalo samo jedno vozilo", „nije nezgoda jer nema poginulih ili povređenih lica" i „nije nezgoda jer je materijalna šteta načinjena van puta". Jedno vozilo je dovoljno, sama šteta je dovoljna, a gde se šteta završila nije bitno — bitno je gde je nezgoda počela.</span></p>

<p><b>Šta se uopšte broji kao vozilo (čl. 7):</b> vozilo je sredstvo koje je po konstrukciji, uređajima i opremi <b>namenjeno i osposobljeno za kretanje po putu</b>. Odatle se granaju sve ostale vrste.</p>
<table>
<tr><th>Pojam</th><th>Uslovi</th><th>Nije to, iako liči</th></tr>
<tr><td><b>Vozilo</b></td><td>namenjeno i osposobljeno za kretanje po putu — zaprežna kola, bicikl, radna mašina (npr. valjak), automobil</td><td><b>dečja kolica</b> i <b>ručna kolica</b> — njih pešak gura</td></tr>
<tr><td><b>Bicikl</b></td><td><b>najmanje</b> dva točka <b>i</b> pokreće ga snaga vozača ili putnika, preneta pedalama ili ručicama na točkove</td><td><b>monocikl</b> (jedan točak) i <b>moped</b> (ima motor); četvorotočkaš na pedale JESTE bicikl, jer uslov glasi „najmanje dva", a ne „tačno dva"</td></tr>
<tr><td><b>Motorno vozilo</b></td><td>pokreće ga snaga <b>sopstvenog</b> motora — traktor, motokultivator, automobil (šinska vozila su izuzeta)</td><td><b>prikolica i poluprikolica</b> (priključna vozila, nemaju svoj pogon), bicikl, zaprežno vozilo</td></tr>
<tr><td><b>Zaprežno vozilo</b></td><td>namenjeno i osposobljeno da ga vuče <b>upregnuta životinja</b></td><td>traktorska prikolica, plug i druga priključna oruđa, motokultivator sa prikolicom</td></tr>
<tr><td><b>Teretno vozilo</b></td><td>motorno vozilo sa <b>najmanje četiri točka</b>, namenjeno prevozu tereta</td><td>poluprikolica i prikolica (nemaju motor); trotočkaš sa sandukom nema četiri točka, pa nije teretno vozilo — po rasporedu točkova je tricikl, laki ili teški zavisno od brzine i motora (vidi karticu o kategorijama)</td></tr>
</table>

<p><b>Tramvaj, trolejbus, autobus</b> — na slici ih razlikuješ za dve sekunde: prvo gledaj <b>šine</b>, pa <b>motke</b>.</p>
<div class="signRow">
  <div class="signCell">
    <svg viewBox="0 0 120 92"><line x1="0" y1="10" x2="120" y2="10" stroke="#5f6d7a" stroke-width="2"/>
      <g stroke="#8a5a00" stroke-width="2"><line x1="16" y1="70" x2="16" y2="82"/><line x1="40" y1="70" x2="40" y2="82"/><line x1="64" y1="70" x2="64" y2="82"/><line x1="88" y1="70" x2="88" y2="82"/><line x1="108" y1="70" x2="108" y2="82"/></g>
      <line x1="2" y1="72" x2="118" y2="72" stroke="#7a8a99" stroke-width="3"/>
      <line x1="2" y1="80" x2="118" y2="80" stroke="#7a8a99" stroke-width="3"/>
      <rect x="10" y="32" width="100" height="38" rx="6" fill="#c0392b"/>
      <rect x="16" y="38" width="34" height="16" rx="2" fill="#eef3f7"/><rect x="56" y="38" width="22" height="16" rx="2" fill="#eef3f7"/><rect x="84" y="38" width="20" height="16" rx="2" fill="#eef3f7"/>
      <line x1="60" y1="32" x2="52" y2="10" stroke="currentColor" stroke-width="2"/></svg>
    <b>TRAMVAJ</b><span>ŠINE + električni vod — šinsko vozilo</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 92"><line x1="0" y1="10" x2="120" y2="10" stroke="#5f6d7a" stroke-width="2"/>
      <rect x="0" y="76" width="120" height="16" fill="#9aa7b4"/>
      <rect x="10" y="30" width="100" height="38" rx="6" fill="#2e8b57"/>
      <rect x="16" y="36" width="34" height="16" rx="2" fill="#eef3f7"/><rect x="56" y="36" width="22" height="16" rx="2" fill="#eef3f7"/><rect x="84" y="36" width="20" height="16" rx="2" fill="#eef3f7"/>
      <line x1="66" y1="30" x2="50" y2="10" stroke="currentColor" stroke-width="2"/>
      <line x1="74" y1="30" x2="58" y2="10" stroke="currentColor" stroke-width="2"/>
      <circle cx="32" cy="70" r="8" fill="currentColor"/><circle cx="92" cy="70" r="8" fill="currentColor"/></svg>
    <b>TROLEJBUS</b><span>gumeni točkovi + DVE motke na vod; zakonski je to autobus na struju</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 120 92"><rect x="0" y="76" width="120" height="16" fill="#9aa7b4"/>
      <rect x="10" y="30" width="100" height="38" rx="6" fill="#e08a1e"/>
      <rect x="16" y="36" width="34" height="16" rx="2" fill="#eef3f7"/><rect x="56" y="36" width="22" height="16" rx="2" fill="#eef3f7"/><rect x="84" y="36" width="20" height="16" rx="2" fill="#eef3f7"/>
      <circle cx="32" cy="70" r="8" fill="currentColor"/><circle cx="92" cy="70" r="8" fill="currentColor"/></svg>
    <b>AUTOBUS</b><span>ni šina ni motki; više od devet mesta za sedenje, sa vozačem</span>
  </div>
</div>
<p><span class="mut">Zakonski: <b>trolejbus je autobus</b> koji se preko provodnika napaja električnom energijom, a tramvaj je <b>šinsko</b> vozilo povezano na električni vod. Putničko vozilo ima <b>najviše devet</b> mesta za sedenje uključujući i mesto vozača, autobus <b>više od devet</b>. Turistički vozić na gumenim točkovima nije tramvaj.</span></p>

<p><b>Mase (čl. 7)</b> — ključ je <b>ko određuje broj</b>: proizvođač deklariše šta vozilo jeste, država propisuje šta se sme, a ukupna masa je ono što se skupi na dan vožnje.</p>
<table>
<tr><th>Pojam</th><th>Šta obuhvata</th><th>Ko ga određuje</th></tr>
<tr><td><b>Masa praznog vozila</b></td><td>neopterećeno vozilo sa karoserijom (ili šasija sa kabinom ako proizvođač ne ugrađuje karoseriju), najmanje 90% goriva, puni rezervoari tehničkih tečnosti, stalni teret (trajno ugrađeni uređaji, npr. kran ili dizalica), rezervni točak i pripadajući alat</td><td><b>proizvođač</b></td></tr>
<tr><td><b>Masa vozila</b></td><td>masa praznog vozila + vozač od 75 kg, pri čemu se <b>tih 75 kg NE dodaje vozilima na dva i tri točka</b>, plus drugi član posade u autobusu i vučni uređaj gde postoje</td><td><b>proizvođač</b></td></tr>
<tr><td><b>Najveća dozvoljena masa vozila</b></td><td>gornja granica mase za to vozilo</td><td><b>proizvođač</b></td></tr>
<tr><td><b>Ukupna masa vozila</b></td><td>masa vozila + masa kojom je vozilo opterećeno, tj. <b>lica i teret</b></td><td>niko je ne deklariše — <b>zbir na licu mesta</b></td></tr>
<tr><td><b>Najveća dozvoljena ukupna masa</b></td><td>najveća masa opterećenog vozila, odnosno skupa vozila</td><td><b>nadležni državni organ</b></td></tr>
<tr><td><b>Nosivost vozila</b></td><td>razlika <b>najveće dozvoljene mase</b> vozila i <b>mase</b> vozila</td><td>računica iz prethodna dva broja</td></tr>
</table>
<p><span class="mut">Zamke: definicija „masa koju deklariše proizvođač vozila" bez ijednog dodatka je <b>najveća dozvoljena masa</b>; dugačak opis sa 90% goriva i rezervnim točkom je <b>masa praznog vozila</b>; „vozilo + lica + teret" je <b>ukupna masa</b>, a ne „najveća dozvoljena ukupna". Osovinsko opterećenje je deo ukupne mase kojim jedna osovina pritiska kolovoz dok vozilo <b>miruje</b>.</span></p>

<p><b>Srednja (prosečna) brzina (čl. 7)</b> = <b>dužina deonice podeljena vremenom</b> za koje je vozilo pređe. Ništa se ne prosečuje po očitavanjima brzinomera — samo se deli.</p>
<div class="vgrid" style="grid-template-columns:auto 1fr">
  <div class="vg vgHead">Formula</div><div class="vg" style="text-align:left">srednja brzina = pređeni put ÷ vreme</div>
  <div class="vg vgHead">Primer iz baze</div><div class="vg" style="text-align:left">300 km za 2 sata → 300 ÷ 2 = <b>150 km/h</b> <span class="mut">(mamci: 100, 120 i 200 km/h)</span></div>
</div>

<p><b>Dokument, oznaka ili pravo (čl. 7)</b> — četiri pojma koja se stalno mešaju. Najlakše ih razdvajaš po tome <b>na čemu stoje</b>: dozvole su papiri, tablica i nalepnica stoje na vozilu.</p>
<table>
<tr><th>Šta</th><th>Vrsta</th><th>Šta znači</th></tr>
<tr><td><b>Saobraćajna dozvola</b></td><td>javna isprava (rešenje)</td><td>zajedno sa registracionom nalepnicom daje <b>pravo na korišćenje vozila</b> u saobraćaju, za vreme važenja nalepnice</td></tr>
<tr><td><b>Registarska tablica</b></td><td>oznaka na vozilu</td><td>označava da je vozilo <b>upisano u jedinstveni registar vozila</b></td></tr>
<tr><td><b>Registraciona nalepnica</b></td><td>oznaka i dozvola na vozilu</td><td>određuje da vozilo može da učestvuje u saobraćaju <b>u određenom vremenskom roku</b></td></tr>
<tr><td><b>Vozačka dozvola</b></td><td>javna isprava (rešenje)</td><td>daje <b>licu</b> pravo da na putu upravlja vozilom <b>određene kategorije</b>, na određeno vreme</td></tr>
</table>
<p><b>Registrovano vozilo</b> je ono kod koga su <b>sva tri</b> uslova ispunjena istovremeno: upisano je u jedinstveni registar vozila, izdata mu je saobraćajna dozvola, i izdate su mu registarske tablice i registraciona nalepnica. <span class="mut">Mamci: „učestvuje u saobraćaju na putu" (registracija ne zavisi od toga da li vozilo negde ide) i „izdate su tablice za privremeno označavanje" (privremene tablice nisu registarske).</span></p>

<p><b>Popravka ili prepravka (čl. 7)</b> — pitaj se da li vozilo posle zahvata <b>radi kako treba</b> ili <b>više nije isto vozilo</b>.</p>
<div class="vgrid" style="grid-template-columns:auto 1fr">
  <div class="vg vgHead"><b>POPRAVKA</b></div><div class="vg" style="text-align:left">dovođenje vozila, odnosno uređaja i sklopova vozila, u <b>ispravno stanje</b> — vraćaš ono što je bilo</div>
  <div class="vg vgHead"><b>PREPRAVKA</b></div><div class="vg" style="text-align:left">promena <b>konstruktivnih karakteristika</b> kojom se menja namena ili vrsta vozila, odnosno deklarisane tehničke karakteristike vozila ili njegovih uređaja i sklopova — dobijaš drugačije vozilo</div>
</div>
<p><span class="mut">Mamci su „održavanje vozila" i „tehnički pregled vozila": održavanje je redovna briga, a tehnički pregled je provera — ni jedno ni drugo nije zahvat kojim se nešto menja ili vraća u ispravno stanje.</span></p>

<p><b>Oznaka na leku sa psihoaktivnom supstancom</b>, koji se ne sme upotrebljavati pre i za vreme vožnje, jeste <b>pun, ispunjen crveni trougao</b> na pakovanju.</p>
<div class="signRow" style="max-width:520px;margin:0 auto">
  <div class="signCell">
    <svg viewBox="0 0 60 56"><rect x="0" y="0" width="60" height="56" rx="4" fill="#eceff2"/><path d="M30 10 L52 46 L8 46 Z" fill="#d40000"/></svg>
    <b>✓ TAČNO</b><span>pun crveni trougao</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 60 56"><rect x="0" y="0" width="60" height="56" rx="4" fill="#eceff2"/><path d="M30 12 L52 46 L8 46 Z" fill="none" stroke="#d40000" stroke-width="4"/><rect x="28" y="26" width="4" height="10" rx="2" fill="#111"/><rect x="28" y="38" width="4" height="4" rx="2" fill="#111"/></svg>
    <b>✗ mamac</b><span>prazan trougao sa uzvičnikom</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 60 56"><rect x="0" y="0" width="60" height="56" rx="4" fill="#eceff2"/><circle cx="30" cy="28" r="19" fill="none" stroke="#d40000" stroke-width="4"/></svg>
    <b>✗ mamac</b><span>prazan crveni krug</span>
  </div>
  <div class="signCell">
    <svg viewBox="0 0 60 56"><rect x="0" y="0" width="60" height="56" rx="4" fill="#eceff2"/><circle cx="30" cy="28" r="19" fill="none" stroke="#d40000" stroke-width="4"/><rect x="28" y="18" width="4" height="12" rx="2" fill="#111"/><rect x="28" y="33" width="4" height="4" rx="2" fill="#111"/></svg>
    <b>✗ mamac</b><span>krug sa uzvičnikom</span>
  </div>
</div>
`,
};
X[7940] = { ...(X[7940]||{}), card: 'slicni-pojmovi' };
X[7942] = { ...(X[7942]||{}), card: 'slicni-pojmovi' };
X[7944] = { ...(X[7944]||{}), card: 'slicni-pojmovi' };
X[7953] = { ...(X[7953]||{}), card: 'slicni-pojmovi' };
X[7948] = { ...(X[7948]||{}), card: 'slicni-pojmovi' };
X[10613] = { ...(X[10613]||{}), card: 'slicni-pojmovi' };
X[7936] = { ...(X[7936]||{}), card: 'slicni-pojmovi' };
X[7937] = { ...(X[7937]||{}), card: 'slicni-pojmovi' };
X[7938] = { ...(X[7938]||{}), card: 'slicni-pojmovi' };
X[7957] = { ...(X[7957]||{}), card: 'slicni-pojmovi' };
X[7958] = { ...(X[7958]||{}), card: 'slicni-pojmovi' };
X[7960] = { ...(X[7960]||{}), card: 'slicni-pojmovi' };
X[7961] = { ...(X[7961]||{}), card: 'slicni-pojmovi' };
X[7967] = { ...(X[7967]||{}), card: 'slicni-pojmovi' };
X[7968] = { ...(X[7968]||{}), card: 'slicni-pojmovi' };
X[7970] = { ...(X[7970]||{}), card: 'slicni-pojmovi' };
X[7971] = { ...(X[7971]||{}), card: 'slicni-pojmovi' };


// --- Kaznene mere, podtura D: fiksne kazne (21) + zaštitna mera izriče se / ne izriče se (15) — bez iznosa ---
X[8343] = { x: 'Neomogućavanje autobusu da se propisno uključi sa stajališta (u naselju) = LAKŠA klasa — fiksna manja kazna, bez poena. Pravilo postoji da javni prevoz uopšte može da krene sa stajališta.' };
X[8344] = { x: 'Mobilni telefon na nepropisan način tokom vožnje = LAKŠA klasa (fiksna kazna). Ne daj da te blaga kazna zavara — telefon u ruci množi vreme reakcije; dozvoljena je samo upotreba opreme koja omogućava telefoniranje bez angažovanja ruku.' };
X[8348] = { x: 'Kretanje trakom koja nije namenjena tvojoj vrsti vozila (npr. žuta BUS traka) = LAKŠA klasa — fiksna kazna, bez poena.' };
X[8349] = { x: 'Prekoračenje u naselju za 11 do 20 km/h = nizak stepenik lestvice brzine — fiksna manja kazna (postoji i blaži: do 10 km/h, sa još manjom fiksnom kaznom). Lestvica brzine: što veće prekoračenje, viša klasa — do najteže i nasilničke vožnje.' };
X[8353] = { x: 'Preticanje preko prelaza puta preko železničke pruge nosi fiksnu manju kaznu — ali radnja je izuzetno opasna i za ispit je bitnije da znaš: preticanje na prelazu je ZABRANJENO (vidi karticu preticanja).' };
X[8354] = { x: 'Parkiranje uz LEVU ivicu kolovoza na dvosmernom putu = LAKŠA klasa (fiksna kazna). Parkira se uz desnu ivicu — uz levu samo na jednosmernoj ulici.' };
X[8355] = { x: 'Parkiranje NA PEŠAČKOM PRELAZU = fiksna manja kazna — ali pre svega zapamti ZABRANU: prelaz mora ostati slobodan za pešake. Za parkiranje se ne izriče zaštitna mera — nije radnja u vožnji.' };
X[8356] = { x: 'Parkiranje NA RASKRSNICI = fiksna manja kazna, bez poena. Raskrsnica mora ostati prohodna i pregledna — parkirano vozilo i zaklanja i blokira.' };
X[8366] = { x: 'Duga svetla na putu sa uključenom uličnom rasvetom = lakša klasa (fiksna kazna). Tamo duga ne trebaju, a zasenjuju druge vozače.' };
X[8367] = { x: 'Duga svetla U MAGLI = lakša klasa (fiksna kazna) — a i kontraproduktivna su: magla odbija svetlost nazad, pa sa dugim vidiš GORE nego sa kratkim, odnosno svetlima za maglu.' };
X[8368] = { x: 'Vožnja BEZ ZAKOPČANE homologovane kacige = fiksna kazna — ali i razlog za ISKLJUČENJE vozača iz saobraćaja, što je za motocikliste važnije od iznosa. Kazna je mala; posledica pada bez kacige — nenadoknadiva.' };
X[8369] = { x: 'Skrećeš na bočni put bez pešačkog prelaza, a pešak stupa na kolovoz: dužan si da ga PROPUSTIŠ — nepropuštanje nosi fiksnu kaznu. Pešak ima zaštitu pri tvom skretanju i tamo gde zebre nema.' };
X[8370] = { x: 'Na autoputu se vozi KRAJNJOM DESNOM trakom — ostale služe za preticanje; kršenje = fiksna manja kazna. Leva traka nije "brza traka" nego traka za preticanje.' };
X[8376] = { x: 'Za vozača MOPEDA/MOTOCIKLA blaga i umerena alkoholisanost nose fiksnu kaznu — iako je za A kategorije NULTA tolerancija (ZOBS čl. 187): zabranjen je svaki alkohol, a stepen određuje samo visinu kazne. Na dva točka alkohol direktno ruši ravnotežu.' };
X[8378] = { x: 'Kandidat bez dokaza o zdravstvenoj sposobnosti KOD SEBE tokom praktične obuke = fiksna kazna — administrativni propust: dokument moraš NOSITI, ne samo imati.' };
X[8379] = { x: 'Neispravan POKAZIVAČ PRAVCA = fiksna kazna. Mala kazna, velika šteta: bez pokazivača su tvoje namere drugima nevidljive.' };
X[8386] = { x: 'Ne pomeriti se ka desnoj ivici dok te pretiču = najniža klasa (fiksna najmanja kazna). Dužnost pretečenog: ne ubrzavaj + drži desno (ZOBS čl. 54).' };
X[8389] = { x: 'Vožnja DANJU bez uključenih kratkih, odnosno dnevnih svetala = najniža klasa (fiksna najmanja kazna). Dnevna svetla postoje da te drugi VIDE — obavezna su i po suncu.' };
X[8390] = { x: 'Slušalice na OBA uva za vozača mopeda/motocikla = najniža klasa (fiksna najmanja kazna). Na dva točka sluh je deo bezbednosti — sirene, vozilo iza tebe, saobraćaj koji ne vidiš.' };
X[8393] = { x: 'Motor uključen dok vozilo stoji duže od TRI minuta = najniža klasa (fiksna najmanja kazna) — pravilo protiv nepotrebnog rada motora u mestu.' };
X[8395] = { x: 'Nemati dozvolu KOD SEBE (a imaš je) = najniža klasa — fiksna najmanja kazna, čisto administrativno. Kontrast: vožnja BEZ POLOŽENE dozvole je najteža klasa — zaboravljen papir i nepostojanje prava na vožnju su dva sveta.' };
X[8404] = { x: 'Alkohol PREKO 0,50 mg/ml (do 1,20): zaštitna mera zabrane upravljanja se IZRIČE — preko te granice zakon uz kaznu obavezno dodaje i zabranu (lista iz ZOBS čl. 338). Granica za meru je 0,50.' };
X[8405] = { x: 'Alkohol 0,30-0,50 mg/ml: kazna DA, zaštitna mera NE — obavezna mera kreće tek preko 0,50 mg/ml (lista iz ZOBS čl. 338).' };
X[8406] = { x: 'Preticanje vozila čiji je vozač već DAO ZNAK da i sâm pretiče — zabranjeno je i kažnjivo, ali zaštitna mera se NE izriče: ta radnja nije na listi iz čl. 338. Mera prati najopasnije radnje.' };
X[8407] = { x: 'Preticanje preko NEISPREKIDANE linije uz korišćenje trake suprotnog smera: mera se IZRIČE (lista iz čl. 338) — frontalni sudar je najsmrtonosniji scenario u saobraćaju.' };
X[8408] = { x: 'Prolazak kada ti je svetlosnim znakom prolaz ZABRANJEN (crveno): zaštitna mera se IZRIČE (lista iz čl. 338) — uz kaznu ide i zabrana upravljanja.' };
X[8410] = { x: 'Uslovna zelena strelica: ako ne propustiš VOZILO na putu na koji ulaziš — mera se IZRIČE. Propuštanje je sam uslov prolaska kroz strelicu (čl. 143), pa je njegovo kršenje na listi iz čl. 338.' };
X[8411] = { x: 'PARKIRANJE na pešačkom prelazu: kazna DA, zaštitna mera NE — parkiranje nije radnja u vožnji, a mera zabrane upravljanja prati opasnu VOŽNJU (lista iz čl. 338).' };
X[8412] = { x: 'Vozilo koje NIJE upisano u jedinstveni registar: mera se IZRIČE uz kaznu (lista iz čl. 338) — neregistrovano vozilo je van svakog sistema kontrole.' };
X[8413] = { x: "Dozvola istekla VIŠE OD ŠEST meseci: u ispitnoj bazi mera se IZRIČE — preko šest meseci prestaje \"administrativni zaborav\": predugo voziš bez periodične provere uslova za upravljanje. Pazi: po važećem zakonu ovaj prekršaj (čl. 178) nije na listi obavezne mere iz čl. 338 — danas je to teži novčani prekršaj bez obavezne zabrane (sud je može izreći samo izuzetno)." };
X[8414] = { x: 'Vožnja vozila ISKLJUČENOG iz saobraćaja: mera se IZRIČE — kršenje naredbe o isključenju je teško u svakom pogledu (i kazna mu je u najtežoj klasi).' };
X[8417] = { x: 'Noću bez ijednog svetla na neosvetljenom delu puta: mera se IZRIČE — nevidljivo vozilo u mraku je među najopasnijim stvarima na putu (i kazna je u najtežoj klasi).' };
X[8418] = { x: "DETE MLAĐE OD 12 GODINA U KRILU vozača: mera se IZRIČE. Dete u vozačevom krilu je dete \"na mestu vozača\" — najteža kaznena klasa (ZOBS čl. 330), koja uz kaznu obavezno nosi i zabranu upravljanja. Vazdušni jastuk i udar za dete u krilu su smrtonosni." };
X[8420] = { x: 'Ne zaustaviti se pred prugom kada svetlosni znak najavljuje voz (prelaz bez branika): mera se IZRIČE — trka sa vozom je izgubljena unapred, zato uz kaznu ide i zabrana.' };
X[8421] = { x: 'ISTEKLA REGISTRACIONA NALEPNICA: kazna DA, zaštitna mera NE — administrativni propust bez neposredno opasne radnje. Uporedi: za vozilo koje uopšte NIJE registrovano mera se izriče.' };
X[8422] = { x: "Dozvola istekla NAJVIŠE ŠEST meseci: kazna DA (blaga), zaštitna mera NE — do šest meseci zakon to tretira kao administrativni propust. Preko šest meseci u ispitnoj bazi ide i mera (po važećem zakonu ni tada nije obavezna — ali prekršaj jeste teži)." };


// --- Kartica: dopunske table uz znak "Parkiralište" (princip mesto × položaj) ---
CARDS['parking-table'] = {
  title: 'Dopunske table uz znak "Parkiralište"',
  html: `
<p>Tabla ti kaže dve stvari odjednom: <b>GDE</b> se parkira (u odnosu na crtu ivičnjaka) i <b>KAKO</b> vozilo stoji.</p>
<p class="mut">Crta na tabli je ivičnjak: <b>iznad crte = trotoar</b>, <b>ispod crte = kolovoz</b>, <b>preko crte = i trotoar i kolovoz</b>.</p>
<div class="signRow lineRow">
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 62) rotate(90) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>NA KOLOVOZU · paralelno</b><span>vozilo uz podužnu osu kolovoza, celo ispod crte</span></div>
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 62) rotate(0) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>NA KOLOVOZU · upravno</b><span>vozilo pod pravim uglom na osu kolovoza</span></div>
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 62) rotate(55) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>NA KOLOVOZU · pod uglom</b><span>vozilo koso u odnosu na osu kolovoza</span></div>
</div>
<div class="signRow lineRow">
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 26) rotate(90) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>NA TROTOARU · paralelno</b><span>celo vozilo iznad crte</span></div>
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 26) rotate(0) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>NA TROTOARU · upravno</b><span>celo vozilo iznad crte, pod pravim uglom</span></div>
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 26) rotate(55) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>NA TROTOARU · pod uglom</b><span>celo vozilo iznad crte, koso</span></div>
</div>
<div class="signRow lineRow">
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 44) rotate(90) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>TROTOAR I KOLOVOZ · paralelno</b><span>vozilo preseca crtu — pola gore, pola dole</span></div>
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 44) rotate(0) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>TROTOAR I KOLOVOZ · upravno</b><span>preseca crtu, pod pravim uglom</span></div>
  <div class="signCell"><svg viewBox="0 0 96 96"><rect x="2" y="2" width="92" height="92" rx="6" fill="#fff" stroke="#111" stroke-width="3"/>
    <line x1="8" y1="44" x2="88" y2="44" stroke="#111" stroke-width="3"/>
    <g transform="translate(48 44) rotate(55) scale(0.85)">
      <rect x="-9" y="-16" width="18" height="32" rx="6" fill="#111"/>
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#fff"/>
    </g></svg><b>TROTOAR I KOLOVOZ · pod uglom</b><span>preseca crtu, koso</span></div>
</div>
<p class="mut">Na trotoaru se parkira samo tamo gde je to signalizacijom dozvoljeno, i mora ostati slobodan prolaz za pešake najmanje 1,60 m (ZOBS čl. 66).</p>`,
};
X[9214] = { ...(X[9214]||{}), card: 'parking-table' };
X[9215] = { ...(X[9215]||{}), card: 'parking-table' };
X[9226] = { ...(X[9226]||{}), card: 'parking-table' };
X[9227] = { ...(X[9227]||{}), card: 'parking-table' };
X[9228] = { ...(X[9228]||{}), card: 'parking-table' };
X[9229] = { ...(X[9229]||{}), card: 'parking-table' };
X[9230] = { ...(X[9230]||{}), card: 'parking-table' };
X[9234] = { ...(X[9234]||{}), card: 'parking-table' };
X[9235] = { ...(X[9235]||{}), card: 'parking-table' };
X[10614] = { ...(X[10614]||{}), card: 'parking-table' };

// ---------------- transliteracija ----------------
const MAP = { 'dž': 'џ', 'Dž': 'Џ', 'lj': 'љ', 'Lj': 'Љ', 'nj': 'њ', 'Nj': 'Њ', 'NJ': 'Њ', 'LJ': 'Љ', 'DŽ': 'Џ',
  a:'а',b:'б',c:'ц',d:'д',e:'е',f:'ф',g:'г',h:'х',i:'и',j:'ј',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',r:'р',s:'с',t:'т',u:'у',v:'в',z:'з',
  'č':'ч','ć':'ћ','đ':'ђ','š':'ш','ž':'ж',
  A:'А',B:'Б',C:'Ц',D:'Д',E:'Е',F:'Ф',G:'Г',H:'Х',I:'И',J:'Ј',K:'К',L:'Л',M:'М',N:'Н',O:'О',P:'П',R:'Р',S:'С',T:'Т',U:'У',V:'В',Z:'З',
  'Č':'Ч','Ć':'Ћ','Đ':'Ђ','Š':'Ш','Ž':'Ж' };
function toCyr(s) {
  s = s.replace(/Browser/g, 'Brauzer').replace(/browser/g, 'brauzer');
  // Natpisi koji i u ćiriličnom tekstu ostaju latinicom jer tako stoje na znaku/kolovozu/gumi
  const KEEP = [];
  s = s.replace(/\b(?:STOP|BUS|TWI)\b/g, (m) => { KEEP.push(m); return '\u0001' + (KEEP.length - 1) + '\u0001'; });
  // zaštiti SI oznake i HTML tagove
  const guards = [];
  // KOMENTAR IDE PRVI: /<[^>]+>/ staje na prvom „>", pa komentar koji u sebi ima strelicu
  // „->" ostane polurazbijen i njegov rep ode u transliteraciju (odatle „виеwБоx" u izlazu).
  let t = s.replace(/<!--[\s\S]*?-->|<[^>]+>|file:\/\/|localhost|Clear browsing data|mg\/ml|km\/h|kW|cm³|\bkg\b|\bAM\b|\bA1\b|\bA2\b|\bB\b|(\d[,.]?\d*\s?)m\b/g, (m0) => {
    guards.push(m0); return ` ${guards.length - 1} `;
  });
  t = t.replace(/DŽ|dž|Dž|LJ|lj|Lj|NJ|nj|Nj|[a-zA-ZčćđšžČĆĐŠŽ]/g, (ch) => MAP[ch] ?? ch);
  t = t.replace(/ (\d+) /g, (_, i) => guards[+i]);
  t = t.replace(/\u0001(\d+)\u0001/g, (_, i) => KEEP[+i]);
  t = t.replace(/>П</g, '>P<');   // slovo P na znaku za parking ostaje latinično
  // "A" kao oznaka kategorije ostaje latinicom kroz guard; "ZOBS" -> ЗОБС je ok (naziv zakona na ćirilici)
  return t;
}

// Veliko slovo na početku sadržaja ćelija (tabele i vgrid polja) — uređeniji pojmovnik
function capCells(html) {
  return html.replace(/(<(?:td|th)[^>]*>|<div class="vg"[^>]*>)(\s*)(<b>)?([a-zčćšđž])/g,
    (m, tag, sp, b, ch) => tag + sp + (b || '') + ch.toUpperCase());
}
// ---------- Velike kartice se čitaju PO TEMI ----------
// Kartica „Znakovi opasnosti" je uz pitanje o krivini otvarala 5.700 px (i prugu, i raskrsnice,
// i životinje), a „Prvenstvo prolaza" u pojmovniku 8.228 px. Zato blok koji počinje pasusom
// „<b>Naslov</b>" postaje sklopivi odeljak — app.js ga oživljava (oziviSekcije).
// Ide SAMO po spisku (prag = koliko tema mora da bude „teška" da dobije svoje dugme).
const PO_TEMAMA = {
  'slicni-pojmovi': 1400,
  'prvenstvo-prolaza': 1200,
  'oznake-kolovoz': 600,
  'uredjaji-oprema': 900,
  'policajac-znaci': 900,
  'preticanje': 900,
  'znakovi-naredbi': 800,
  'skretanje': 350,
  'vozac-zdravlje-alkohol': 700,
  'put-pojmovi': 350,
  'vozilo-tehnika': 350,
  'zn-ob-kraj-zone': 600,
  'zn-ob-autoput': 600,
  'zn-ob-ostalo': 600,
  'zn-ob-parovi': 300,
  'zn-ob-vodjenje': 600,
  'pokazivaci': 600,
  'semafori': 700,
  'znakovi-porodice': 700,
  'kretanje-po-putu': 400,
  'razno-pravila': 350,      // devet odeljaka po podoblasti; teme se seku UNUTAR odeljka
  'zamke-odgovori': 400,
  'pruga': 400,
  'autoput': 400,
};
// blokovi najvišeg nivoa (isti parser kao u deobi džin-kartice)
function blokovi(html) {
  const b = [];
  let dubina = 0, start = 0;
  const re = /<(\/?)(div|table|p|svg|h4|ul|ol)\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!m[1]) { if (dubina === 0) start = m.index; dubina++; }
    else { dubina--; if (dubina === 0) b.push(html.slice(start, re.lastIndex)); }
  }
  return dubina === 0 ? b : null;
}
function poTemama(html, prag, imaUvod) {
  const b = blokovi(html);
  if (!b || !b.length) return html;
  const jeNaslov = (x) => /^<p[^>]*>\s*<b>[^<]{3,120}<\/b>/.test(x);
  const grupe = [];
  for (const blok of b) {
    if (jeNaslov(blok) || !grupe.length) grupe.push({ naslov: jeNaslov(blok) ? blok : null, telo: jeNaslov(blok) ? [] : [blok] });
    else grupe[grupe.length - 1].telo.push(blok);
  }
  // sitne teme se pripajaju prethodnoj — inače dvadeset dugmadi od po dva reda
  const spojene = [];
  for (const g of grupe) {
    const duz = (g.naslov || '').length + g.telo.join('').length;
    if (g.naslov && duz < prag && spojene.length && spojene[spojene.length - 1].naslov) {
      spojene[spojene.length - 1].telo.push(g.naslov, ...g.telo);
    } else spojene.push(g);
  }
  // prva grupa KARTICE je uvod („Ova oblast je čista memorija brojeva.") — ostaje vidljiva.
  // Unutar kSek odeljka toga nema: odeljak je već izabrala podoblast, pa je i prva tema tema.
  if (imaUvod && spojene.length && spojene[0].naslov) spojene[0].uvod = 1;
  // jedna tema nije podela — osim ako je ta jedna toliko krupna da sama pravi džin-karticu
  const teme = spojene.filter((g) => g.naslov && !g.uvod);
  const krupna = teme.length === 1 && (teme[0].naslov + teme[0].telo.join('')).length > 1500;
  if (teme.length < 2 && !krupna) return html;
  let out = '';
  for (const g of spojene) {
    if (!g.naslov || g.uvod) { out += (g.naslov ? g.naslov + '\n' : '') + g.telo.join('\n') + '\n'; continue; }
    let naslov = g.naslov.match(/<b>([^<]+)<\/b>/)[1].replace(/\s*[.:]\s*$/, '');
    // dugme nosi IME teme, ne celu rečenicu — seče se na prvoj cezuri ako je predugačko
    if (naslov.length > 64) {
      const c = naslov.search(/ — |: /);
      naslov = c >= 3 ? naslov.slice(0, c) : naslov.slice(0, 60).replace(/\s+\S*$/, '') + '…';
    }
    const ostatak = g.naslov.replace(/^<p[^>]*>\s*<b>[^<]+<\/b>\s*/, '').replace(/<\/p>\s*$/, '').trim();
    out += '<div class="kPodH"><b class="kPodNaslov">' + naslov + '</b>\n'
      + (ostatak ? '<p>' + ostatak + '</p>\n' : '')
      + g.telo.join('\n') + '\n</div>\n';
  }
  return out;
}
// Kartica sa .kSek odeljcima: podoblast bira odeljak, pa se teme seku UNUTAR odeljka.
// Kartica sme da bude MEŠOVITA (odeljci + slobodni pasusi između njih) — dovoljno je da postoji
// jedan odeljak. Ranije se tražilo da su SVI blokovi odeljci, pa je „razno-pravila" (4 odeljka,
// pa slobodan pasus, pa još 5) išla celim putem: slobodan naslov je progutao pet odeljaka iza
// sebe i sakrio ih iza dugmeta „Osnovna načela" — dugmeta koje laže šta nosi.
function poTemamaKartica(html, prag) {
  const b = blokovi(html);
  if (b && b.some((x) => x.startsWith('<div class="kSek"'))) {
    return b.map((x) => {
      if (!x.startsWith('<div class="kSek"')) return x;      // blok van odeljka se ne dira
      const i = x.indexOf('>') + 1;
      const kr = x.lastIndexOf('</div>');
      return x.slice(0, i) + '\n' + poTemama(x.slice(i, kr), prag, false) + '</div>';
    }).join('\n');
  }
  return poTemama(html, prag, true);
}
for (const [k, prag] of Object.entries(PO_TEMAMA)) {
  if (!CARDS[k]) { console.log('⚠ po temama: nema kartice', k); continue; }
  CARDS[k].html = poTemamaKartica(CARDS[k].html, prag);
  if (!(CARDS[k].html.split('<div class="kPodH">').length - 1)) console.log('⚠ po temama: kartica', k, 'nije podeljena');
}

// Komentari u karticama su beleške za pisca (koji broj pitanja potpire koju tvrdnju) — u
// izvorniku ostaju i tamo služe, ali u isporučenu karticu ne idu: nevidljivi su, a nose bajtove
// u oba pisma.
for (const c of Object.values(CARDS)) c.html = capCells(c.html).replace(/<!--[\s\S]*?-->\s*/g, '');

// --- Pitanja koja NE dobijaju karticu svoje podoblasti (revizija 04.09.2026) ---
// Zvanične podoblasti su spojevi tema; kartica koja odgovara podoblasti često ne odgovara
// pojedinačnom pitanju. Merilo: pomaže li otvaranje BAŠ te kartice BAŠ tom pitanju.
// Bolje nijedna nego pogrešna — objašnjenje uz pitanje ostaje u svakom slučaju.
for (const id of [
  7921, 7922, 7923, 7927, 7928, 7929, 7996, 7997, 7998, 8005,
  8006, 8007, 8008, 8009, 8010, 8011, 8013, 8015, 8016, 8083,
  8086, 8087, 8088, 8089, 8096, 8097, 8099, 8100, 8101, 8102,
  8103, 8105, 8106, 8107, 8108, 8109, 8111, 8113, 8114, 8465,
  8667, 8668, 8669, 8937, 8938, 8939, 8941, 9214, 9215, 9220,
  9221, 9226, 9227, 9228, 9229, 9230, 9234, 9235, 9236, 9247,
  9286, 9287, 9296, 9305, 9309, 9313, 9339, 9340, 9377, 9391,
  9405, 9533, 9534, 9535, 9536, 9538, 9540, 9542, 9543, 9545,
  9546, 9554, 9555, 9557, 9559, 9561, 9615, 9618, 9644, 9645,
  9646, 9675, 9679, 9685, 9690, 9691, 9693, 9698, 9699, 9702,
  9703, 9706, 9715, 9717, 9750, 9752, 9853, 9858, 9862, 9865,
  10351, 10377, 10406, 10443, 10474, 10485, 10486, 10487, 10558, 10559,
  10565, 10614, 10631, 10632, 10634, 10636, 10780, 10988, 10989, 10992,
  11014, 11016, 11017, 11019, 11021, 11022, 11024, 11027, 11028, 11029,
  11030, 11031, 11032, 11033, 11035, 11037, 11038,
]) X[id] = { ...(X[id] || {}), nocard: 1 };

// --- Prava kartica umesto pogrešne (revizija 04.09.2026, drugi deo) ---
// Ova pitanja su ostala bez kartice svoje podoblasti, ali im odgovara druga postojeća kartica.
// Svaki par je potvrdilo DVA nezavisna suda; gde se nisu složili, kartice nema.
X[11044] = { ...(X[11044] || {}), nocard: 1 };

// --- Revizija svih pojmova (07.09.2026): pitanju se dodaje DRUGA kartica uz njegovu
// podoblasnu, jer mu i ona vodi do tačnog odgovora. Podoblasna ostaje — obe se vide.
X[9677] = { ...(X[9677] || {}), card: 'znakovi-naredbi' };   // znak „obavezan smer" uz skretanje (#9677)
X[9762] = { ...(X[9762] || {}), card: 'znakovi-naredbi' };   // zabrana preticanja važi od mesta znaka (#9762)
X[9813] = { ...(X[9813] || {}), card: 'znakovi-naredbi' };   // zabrana preticanja svih motornih vozila (#9813)
X[9539] = { ...(X[9539] || {}), card: 'pesaci-bicikli' };   // obaveza prema pešacima na prelazu (#9539)
X[7990] = { ...(X[7990] || {}), card: 'kategorije-vozila' };   // pojam vozila po kategoriji (#7990)
X[9531] = { ...(X[9531] || {}), card: 'zamke-odgovori' };   // večiti mamci u ponuđenim odgovorima (#9531)
X[9689] = { ...(X[9689] || {}), card: 'zamke-odgovori' };   // večiti mamci u ponuđenim odgovorima (#9689)
X[7925] = { ...(X[7925] || {}), card: 'zamke-odgovori' };   // večiti mamci u ponuđenim odgovorima (#7925)

for (const id of [7996, 7997, 7998, 8008, 8009, 8010, 8013, 8015, 8016]) X[id] = { ...(X[id] || {}), card: 'kategorije-vozila' };
for (const id of [9615, 9618, 9685, 10061]) X[id] = { ...(X[id] || {}), card: 'oznake-kolovoz' };
for (const id of [9675, 9679, 9862, 9865]) X[id] = { ...(X[id] || {}), card: 'znakovi-naredbi' };
for (const id of [9535, 9536, 9538]) X[id] = { ...(X[id] || {}), card: 'pesaci-bicikli' };
for (const id of [8113]) X[id] = { ...(X[id] || {}), card: 'pruga' };
for (const id of [8465]) X[id] = { ...(X[id] || {}), card: 'iskljucenje' };
for (const id of [11044]) X[id] = { ...(X[id] || {}), card: 'semafori' };
for (const id of [10550]) X[id] = { ...(X[id] || {}), card: 'policajac-znaci' };

// --- Znakovi obaveštenja: kartica PO PITANJU posle deobe na šest (05.09.2026) ---
// Dva nezavisna suda + čovek za nesložene; "nijedna" znači samo objašnjenje, bez kartice.
for (const id of [9074]) X[id] = { ...(X[id] || {}), card: 'znakovi-obavestenja' };
for (const id of [9077, 9085, 9117, 9118, 9123, 9125, 9128, 9129, 9130, 9131, 9133, 10908, 10910, 10914]) X[id] = { ...(X[id] || {}), card: 'zn-ob-ostalo' };
for (const id of [10915, 10916, 10917, 10920, 10938, 10940, 10942, 10981, 10982, 10983, 10984, 10985]) X[id] = { ...(X[id] || {}), card: 'zn-ob-ostalo' };
for (const id of [9082, 9083, 9088, 9135, 9143, 9146, 9151, 9152, 9155, 9162, 10884, 10885, 10886, 10888]) X[id] = { ...(X[id] || {}), card: 'zn-ob-kraj-zone' };
for (const id of [10889, 10912, 10934, 10935, 10936, 10937, 10946, 10948, 10949, 10950, 10951, 10952, 10953, 11067]) X[id] = { ...(X[id] || {}), card: 'zn-ob-kraj-zone' };
for (const id of [11070]) X[id] = { ...(X[id] || {}), card: 'zn-ob-kraj-zone' };
for (const id of [9092, 9094, 9095, 9121, 9122, 9126, 9127, 9153, 10880, 10881, 10882, 10883, 10890, 10911]) X[id] = { ...(X[id] || {}), card: 'zn-ob-parovi' };
for (const id of [10918, 10919, 10939]) X[id] = { ...(X[id] || {}), card: 'zn-ob-parovi' };
for (const id of [9102, 9106, 9120, 9149, 9156, 9157, 9158, 9176, 9185, 9186, 10891, 10892, 10893, 10894]) X[id] = { ...(X[id] || {}), card: 'zn-ob-vodjenje' };
for (const id of [10895, 10896, 10897, 10898, 10900, 10902, 10903, 10904, 10905, 10906, 10907, 10909, 10924, 10943]) X[id] = { ...(X[id] || {}), card: 'zn-ob-vodjenje' };
for (const id of [10944, 10945, 10954, 10955, 10956, 10957, 10958, 10959, 10960, 10961, 10962, 10963, 10964, 10965]) X[id] = { ...(X[id] || {}), card: 'zn-ob-vodjenje' };
for (const id of [10966, 10967, 10968, 11064]) X[id] = { ...(X[id] || {}), card: 'zn-ob-vodjenje' };
for (const id of [9132, 9188, 9189, 10921, 10922, 10925, 10926, 10928, 10929, 10930, 10931, 10932, 10933, 10941]) X[id] = { ...(X[id] || {}), card: 'zn-ob-autoput' };
for (const id of [10969, 10970, 10971, 10972, 10973, 10974, 10975, 10976, 10977, 10978, 10979, 10980, 11069, 11071]) X[id] = { ...(X[id] || {}), card: 'zn-ob-autoput' };

// ---- ATLAS ZNAKOVA: slike iz same baze pitanja (tools/atlas.mjs) ----
// Podaci, ne HTML — okvir crta app.js, pa se ne ponavlja 313 puta u dva pisma.
// situacije idu uz SVOJU karticu, ma koja bila — atlas.mjs zato mora da zna celu bySub mapu
Object.assign(SUB_KARTICA_SVE, BYSUB);
const { atlas: ATLAS, situacije: SITUACIJE, zamke: ZAMKE,
  ukupno: ATLAS_N, bezGrupe: ATLAS_VAN, vezaUkupno: ZAMKA_N, situacijaN: SIT_N } = napraviAtlas(X);
for (const k of Object.keys(ATLAS)) if (!CARDS[k]) console.log('⚠ atlas: nema kartice', k);
for (const k of Object.keys(SITUACIJE)) if (!CARDS[k]) console.log('⚠ situacije: nema kartice', k);

const out = {
  updated: new Date().toISOString().slice(0, 10),
  cards: Object.fromEntries(Object.entries(CARDS).map(([k, c]) => [k, { t: { l: c.title, c: toCyr(c.title) }, h: { l: c.html, c: toCyr(c.html) } }])),
  byQ: Object.fromEntries(Object.entries(X).map(([id, e]) => [id, {
    ...(e.x ? { x: { l: e.x, c: toCyr(e.x) } } : {}),
    ...(e.card ? { card: e.card } : {}),
    ...(e.nocard ? { nocard: 1 } : {}),
  }])),
  bySub: BYSUB,
  // Sve tri liste su SAMO brojevi pitanja: tekst (značenje, pitanje, tačan odgovor) stoji u
  // data.js, koji je ionako učitan. Ista istina na dva mesta pre ili kasnije postane dve istine.
  atlas: ATLAS,
  situacije: SITUACIJE,
  zamke: ZAMKE,
};

// Lokalno prevedi šest pristupačnih opisa kartice brzine. Opšti toCyr štiti HTML tagove.
// Broj je nameran: dodavanje opisa u ovu karticu zahteva ponovni pregled oba pisma.
{
  let count = 0;
  out.cards.brzine.h.c = out.cards.brzine.h.c.replace(/aria-label="([^"]*)"/g, (_, label) => {
    count++;
    return 'aria-label="' + toCyr(label) + '"';
  });
  if (count !== 6) throw new Error('Kartica brzine: očekivano šest pristupačnih opisa');
}

// Lokalni, pregledani opisi preostalih 19 crteža kartice parkiranje.
// Nepoznat novi opis zahteva novi pregled; opšti toCyr i druge kartice ostaju isti.
{
  const opisi = new Map([
  [
    "dvosmerni put sa pešačkim prelazom i oznakom autobuskog stajališta na kolovozu: osnovna zabrana zaustavljanja i parkiranja 5 m sa obe strane prelaza i 15 m ispred i iza oznake stajališta",
    "двосмерни пут са пешачким прелазом и ознаком аутобуског стајалишта на коловозу: основна забрана заустављања и паркирања 5 m са обе стране прелаза и 15 m испред и иза ознаке стајалишта"
  ],
  [
    "pogled odozgo na dvosmerni put: vozilo uz levu ivicu je precrtano, a vozilo uz desnu ivicu u tvom smeru nosi zelenu kvačicu",
    "поглед одозго на двосмерни пут: возило уз леву ивицу је прецртано, а возило уз десну ивицу у твом смеру носи зелену квачицу"
  ],
  [
    "pogled odozgo na jednosmerni put: i vozilo uz levu i vozilo uz desnu ivicu nose zelenu kvačicu, oba su dozvoljena",
    "поглед одозго на једносмерни пут: и возило уз леву и возило уз десну ивицу носе зелену квачицу, оба су дозвољена"
  ],
  [
    "pogled odozgo: uz desnu ivicu kolovoza idu tramvajske šine, vozilo koje je uz tu ivicu stalo na njima je precrtano, a sa leve strane po šinama nailazi šinsko vozilo",
    "поглед одозго: уз десну ивицу коловоза иду трамвајске шине, возило које је уз ту ивицу стало на њима је прецртано, а са леве стране по шинама наилази шинско возило"
  ],
  [
    "pogled odozgo na put van naselja: vozilo sklonjeno van kolovoza na bankinu nosi zelenu kvačicu, a vozilo koje je ostalo na kolovozu nosi napomenu samo ako van kolovoza ne može",
    "поглед одозго на пут ван насеља: возило склоњено ван коловоза на банкину носи зелену квачицу, а возило које је остало на коловозу носи напомену само ако ван коловоза не може"
  ],
  [
    "pogled odozgo: mesta na sredini kolovoza označena plavim znakom za parkiranje i belim parking linijama; vozilo je u obeleženom mestu, a saobraćaj teče trakama sa obe strane",
    "поглед одозго: места на средини коловоза означена плавим знаком за паркирање и белим паркинг линијама; возило је у обележеном месту, а саобраћај тече тракама са обе стране"
  ],
  [
    "pogled odozgo: ista sredina kolovoza bez ijedne oznake, vozilo koje je tu stalo je precrtano crvenom bojom",
    "поглед одозго: иста средина коловоза без иједне ознаке, возило које је ту стало је прецртано црвеном бојом"
  ],
  [
    "osnovni primer raskrsnice na dvosmernom putu: obeleženi su raskrsnica i pojas od pet metara sa obe strane najbliže ivice poprečnog kolovoza; vozilo u pojasu je precrtano; izuzetak za jednosmernu ulicu objašnjen je u tekstu",
    "основни пример раскрснице на двосмерном путу: обележени су раскрсница и појас од пет метара са обе стране најближе ивице попречног коловоза; возило у појасу је прецртано; изузетак за једносмерну улицу објашњен је у тексту"
  ],
  [
    "pogled odozgo: vozilo parkirano u pojasu ispred raskrsnice zaklanja pogled vozilu koje izlazi iz poprečnog puta, crvena isprekidana linija pokazuje zaklonjeni pogled",
    "поглед одозго: возило паркирано у појасу испред раскрснице заклања поглед возилу које излази из попречног пута, црвена испрекидана линија показује заклоњени поглед"
  ],
  [
    "pogled odozgo: gore je deo puta kojim idu automobili, ispod njega puna bela linija, a desno od nje biciklistička traka po kojoj se uz sam ivičnjak kreće biciklistkinja na biciklu",
    "поглед одозго: горе је део пута којим иду аутомобили, испод њега пуна бела линија, а десно од ње бициклистичка трака по којој се уз сам ивичњак креће бициклисткиња на бициклу"
  ],
  [
    "pogled odozgo: vozilo je stalo na biciklističkoj traci; crvena isprekidana putanja pokazuje da obilaženje tog vozila vodi među automobile",
    "поглед одозго: возило је стало на бициклистичкој траци; црвена испрекидана путања показује да обилажење тог возила води међу аутомобиле"
  ],
  [
    "pogled odozgo na trotoar: vozilo je parkirano uz ivicu kolovoza, iza njega prema zgradi ostaje izmeren slobodan prolaz od 1,60 metara, a crvena napomena kaže da znaka nema pa metri ne pomažu",
    "поглед одозго на тротоар: возило је паркирано уз ивицу коловоза, иза њега према згради остаје измерен слободан пролаз од 1,60 метара, а црвена напомена каже да знака нема па метри не помажу"
  ],
  [
    "plavi okrugli znak podeljen uspravnom belom linijom: sa jedne strane lik pešaka, sa druge bicikl",
    "плави округли знак подељен усправном белом линијом: са једне стране лик пешака, са друге бицикл"
  ],
  [
    "pogled odozgo: dva toka saobraćaja se razdvajaju levo i desno, a između njih je polje za usmeravanje saobraćaja, bele kose pruge oivičene punom linijom; vozilo koje je stalo na polju je precrtano",
    "поглед одозго: два тока саобраћаја се раздвајају лево и десно, а између њих је поље за усмеравање саобраћаја, беле косе пруге оивичене пуном линијом; возило које је стало на пољу је прецртано"
  ],
  [
    "uzdužni profil puta sa prevojem: crvenom bojom obeležen je i sam vrh prevoja i pojas oko njega u kome se ne sme zaustaviti ni parkirati, dok su niži delovi uspona i nizbrdice samo imenovani",
    "уздужни профил пута са превојем: црвеном бојом обележен је и сам врх превоја и појас око њега у коме се не сме зауставити ни паркирати, док су нижи делови успона и низбрдице само именовани"
  ],
  [
    "pogled odozgo na nepreglednu krivinu: put se savija udesno, u samoj krivini stoji precrtano parkirano vozilo, a plava strelica pokazuje tvoj smer kretanja kroz krivinu",
    "поглед одозго на непрегледну кривину: пут се савија удесно, у самој кривини стоји прецртано паркирано возило, а плава стрелица показује твој смер кретања кроз кривину"
  ],
  [
    "vozilo parkirano na nagibu dok se vozač udaljava; crvena isprekidana strelica pokazuje kako se vozilo samo kotrlja niz nagib",
    "возило паркирано на нагибу док се возач удаљава; црвена испрекидана стрелица показује како се возило само котрља низ нагиб"
  ],
  [
    "vozilo u kvaru stoji na šinama, sa leve strane po šinama nailazi šinsko vozilo, a između njih je crveni znak upozorenja",
    "возило у квару стоји на шинама, са леве стране по шинама наилази шинско возило, а између њих је црвени знак упозорења"
  ],
  [
    "grafikon pogrešnih ponuda samo u 27 pitanja ove banke, ne opšte pravilo za druge situacije: zaustavljanje da a parkiranje ne šest puta, slobodan prolaz 1,60 m pet puta, manje od 10 m umesto 5 m četiri puta, samo na mestu bez pojasa četiri puta, izuzetak za auto-taksi dva puta, trougao i pokazivači pravca dva puta, samo staza ili samo traka jednom, najduže do 3 minuta jednom; nijedna od tih ponuda nije nijednom tačna",
    "графикон погрешних понуда само у 27 питања ове банке, не опште правило за друге ситуације: заустављање да а паркирање не шест пута, слободан пролаз 1,60 m пет пута, мање од 10 m уместо 5 m четири пута, само на месту без појаса четири пута, изузетак за ауто-такси два пута, троугао и показивачи правца два пута, само стаза или само трака једном, најдуже до 3 минута једном; ниједна од тих понуда није ниједном тачна"
  ]
]);
  let prevedeno = 0;
  out.cards.parkiranje.h.c = out.cards.parkiranje.h.c.replace(/aria-label="([^"]*)"/g, (_, label) => {
    if (!opisi.has(label)) throw new Error("Kartica parkiranje: nepoznat pristupačni opis");
    prevedeno++;
    return 'aria-label="' + opisi.get(label) + '"';
  });
  if (prevedeno !== 19) throw new Error("Kartica parkiranje: očekivano 19 pristupačnih opisa");
  // Oznake znakova ostaju službeni identifikatori, sa rimskim brojevima.
  for (const [staro, novo] of [["ИИ-3", "II-3"], ["ИИ-41.1", "II-41.1"]]) {
    if (out.cards.parkiranje.h.c.split(staro).length - 1 !== 1) throw new Error("Kartica parkiranje: neočekivana oznaka znaka");
    out.cards.parkiranje.h.c = out.cards.parkiranje.h.c.replace(staro, novo);
  }
}

// Automatski skener: mešani latinično-ćirilični tokeni i zaostali digrafi u ćiriličnom izlazu
{
  const texts = [];
  for (const c of Object.values(out.cards)) { texts.push(c.t.c, c.h.c); }
  for (const e of Object.values(out.byQ)) { if (e.x) texts.push(e.x.c); }
  const bad = new Set();
  for (const t of texts) {
    const plain = t.replace(/<[^>]+>/g, ' ');
    for (const tok of plain.split(/[\s,.;:()„"—·!?']+/)) {
      const cyr = /[\u0400-\u04FF]/.test(tok), lat = /[a-zA-Z]/.test(tok);
      if (cyr && lat && tok !== 'AM/A1/A2/А') bad.add(tok);
    }
    for (const m of plain.matchAll(/[А-Яа-я][НЛ]Ј[А-Яа-я]|[А-Яа-я]ДЖ[А-Яа-я]/g)) bad.add(m[0]);
  }
  if (bad.size) console.log('⚠ UPOZORENJE — sumnjivi tokeni u ćirilici:', [...bad].join(', '));
  else console.log('skener pisma: čisto');
}

await fs.writeFile(new URL('../explanations.js', import.meta.url), 'window.EXPLAIN = ' + JSON.stringify(out) + ';\n');
console.log('explanations.js:', Object.keys(out.byQ).length, 'pitanja,', Object.keys(out.cards).length, 'kartica');
console.log('atlas:', ATLAS_N, 'slika u', Object.keys(ATLAS).length, 'kartica' + (ATLAS_VAN ? ' (van grupa: ' + ATLAS_VAN + ')' : ''));
console.log('situacije:', SIT_N, 'slika u', Object.keys(SITUACIJE).length, 'kartica');
console.log('zamke:', ZAMKA_N, 'veza uz', Object.keys(ZAMKE).length, 'pitanja');
console.log('proba ćirilice:', toCyr('Vozač ne sme (ZOBS čl. 187) — 0,20 mg/ml, kategorije AM, A1, A2 i A; 1,5 m; 45 km/h'));

// Мерена покривеност — да број у документацији не може да застари.
try {
  const baza = JSON.parse(await fs.readFile(new URL('./base-A.json', import.meta.url), 'utf8'));
  const tekst = baza.questions.filter((q) => !q.HasImage);
  const sa = tekst.filter((q) => out.byQ[q.qId] && out.byQ[q.qId].x).length;
  const slika = baza.questions.length - tekst.length;
  // kartica se broji samo ako se STVARNO prikazuje: nocard je isključuje iz kartice podoblasti
  const imaKarticu = (q) => { const e = out.byQ[q.qId]; return !!((e && e.card) || (!(e && e.nocard) && out.bySub[q.subcategoryId])); };
  const slKart = baza.questions.filter((q) => q.HasImage && imaKarticu(q)).length;
  const svePoj = baza.questions.filter(imaKarticu).length;
  console.log('pokrivenost: objašnjenje ' + Object.values(out.byQ).filter((e) => e.x).length + '/' + baza.questions.length + ' | tekstualna ' + sa + '/' + tekst.length + ' | slikovna sa karticom ' + slKart + '/' + slika + ' | uz karticu pojmovnika ' + svePoj + '/' + baza.questions.length);
} catch (e) { console.log('pokrivenost: base-A.json nije dostupan, preskočeno'); }

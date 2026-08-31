// Gradi ../explanations.js iz latiničnog izvora (automatska transliteracija u ćirilicu,
// SI oznake ostaju latinicom kao u zvaničnoj bazi). Pokreni: node build-explanations.mjs
import fs from 'node:fs/promises';

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
const CARDS = {
  'kategorije-vozila': {
    title: 'Kategorije vozila (moped, tricikl, motocikl...)',
    html: `
<p><b>Ključ za pamćenje:</b> raspored točkova ti kaže <i>vrstu</i> (2 = moped/motocikl; 3 asimetrična = motocikl sa bočnim sedištem; 3 simetrična = tricikl; 4 = četvorocikl),
a granice su <b>45 km/h</b>, <b>50 cm³</b> (motor sa unutrašnjim sagorevanjem) i <b>4 kW</b> (električni pogon):
<b>sve u granicama = moped / "laki"</b>; <b>bilo koja granica probijena = motocikl / "teški"</b>. (ZOBS čl. 7)</p>
<div class="vgrid">
  <div class="vg vgHead"></div><div class="vg vgHead">⚫⚫ 2 točka</div><div class="vg vgHead">⚫⚫⚫ 3 točka</div><div class="vg vgHead">⚫⚫⚫⚫ 4 točka</div>
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
<p><b>Hijerarhija (ZOBS čl. 20)</b> — jače pobija slabije:</p>
<svg viewBox="0 0 460 175" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <rect x="130" y="4"   width="200" height="27" rx="6" fill="#c0392b"/><text x="230" y="22" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">1. SAOBRAĆAJAC</text>
  <rect x="100" y="38"  width="260" height="27" rx="6" fill="#8a5a00"/><text x="230" y="56" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">2. SEMAFOR</text>
  <rect x="70"  y="72"  width="320" height="27" rx="6" fill="#2c6aa0"/><text x="230" y="90" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">3. SAOBRAĆAJNI ZNAKOVI</text>
  <rect x="40"  y="106" width="380" height="27" rx="6" fill="#64748b"/><text x="230" y="124" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">4. OZNAKE NA KOLOVOZU</text>
  <rect x="10"  y="140" width="440" height="27" rx="6" fill="#94a3b8"/><text x="230" y="158" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">5. PRAVILA (desna strana...)</text>
</svg>
<p class="mut" style="text-align:center;font-size:.85rem">što je traka viša — to je jača: saobraćajac pobija semafor, semafor pobija znakove...</p>
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
<p><b>Za test zapamti:</b> rotacija NE gasi semafor — na semaforizovanoj raskrsnici prvenstvo je „regulisano semaforom"; semafor „gasi" samo saobraćajac. Obaveza propuštanja važi kad te takvo vozilo susretne ili sustigne na putu.</p>`,
};

CARDS['brzine'] = {
  title: 'Ograničenja brzine (50-80-100-130)',
  html: `
<svg viewBox="0 0 460 120" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <g><circle cx="65" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="65" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">50</text><text x="65" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">NASELJE</text></g>
  <g><circle cx="175" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="175" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">80</text><text x="175" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">VAN NASELJA</text></g>
  <g><circle cx="285" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="285" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">100</text><text x="285" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">MOTOPUT</text></g>
  <g><circle cx="395" cy="45" r="36" fill="#fff" stroke="#c0392b" stroke-width="9"/><text x="395" y="53" text-anchor="middle" font-size="24" font-weight="bold" fill="#111">130</text><text x="395" y="108" text-anchor="middle" font-size="12" fill="#888" font-weight="bold">AUTOPUT</text></g>
</svg>
<p><b>Opšta ograničenja</b> (kad znak ne kaže drugačije): naselje 50 (čl. 43), van naselja 80, motoput 100, autoput 130 (čl. 44). Pamti merdevine: <b>50 → 80 → 100 → 130</b> — što bolji put, to više.</p>
<p><b>Znak uvek pobija opšte pravilo</b> — i naniže i naviše: znakom se u naselju može dozvoliti i do 80 (čl. 43 st. 2).</p>
<p><b>Čemu se brzina prilagođava (čl. 42):</b> osobinama i stanju PUTA, VIDLJIVOSTI, preglednosti, ATMOSFERSKIM prilikama, stanju VOZILA i tereta, GUSTINI saobraćaja — tako da možeš da staneš pred svakom preprekom koju vidiš ili imaš razloga da predvidiš.</p>
<p><b>Zamka u odgovorima:</b> varijante sa "raspoloživim vremenom", "udobnošću" ili "da što pre stigneš" su UVEK netačne — vreme dolaska nikad nije zakonski faktor.</p>`,
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
<p><b>Još tri činjenice koje test voli:</b> davanje krvi/urina na uviđaju je OBAVEZNO · fotografisanje na uviđaju bez poginulih/povređenih je obavezno · oduzete tablice se vraćaju kad dostaviš dokaz da je vozilo tehnički ispravno.</p>`,
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
<p class="mut">Pamćenje: probna skida "deseticu": 130→110 na autoputu, 100→90 na motoputu, ostalo −10%.</p>`,
};

CARDS['preticanje'] = {
  title: 'Preticanje i obilaženje (5 pitanja na svakom testu!)',
  html: `
<p><b>Osnovno (čl. 53):</b> pretiče se SA LEVE strane. Sa DESNE samo: vozilo koje skreće ULEVO · tramvaj na šinama po sredini kolovoza (ako desno postoji traka) · na raskrsnici na putu sa prvenstvom, vozilo koje skreće ulevo.</p>
<p><b>NIJE preticanje:</b> na putu sa ≥2 trake u istom smeru, brže kretanje jedne trake (kolone) od druge — ni u naselju prolaženje s desne strane vozila koje nije uz desnu ivicu.</p>
<div class="vgrid" style="grid-template-columns:1fr 1fr">
  <div class="vg vgFast"><b>❌ ZABRANJENO preticati (čl. 55 i 57)</b></div><div class="vg vgSlow"><b>✅ SME, iako zvuči opasno</b></div>
  <div class="vg" style="text-align:left">kolonu (posebno pod pratnjom) · kad te neko već pretiče · kad je vozač ispred dao znak za preticanje · kad ne možeš da se vratiš u svoju traku · zaustavnom/sporom trakom · preko neisprekidane linije · prevoj i nepregledna krivina* · tunel* · neposredno ISPRED raskrsnice i na raskrsnici (bez prvenstva) · ispred kružnog toka · prelaz preko pruge · vozilo koje propušta pešake na prelazu · na autoputu/motoputu s desne strane</div>
  <div class="vg" style="text-align:left">podvožnjak i nadvožnjak · NA raskrsnici sa kružnim tokom · na raskrsnici kad si na putu SA prvenstvom (i to: vozilo koje skreće levo — s desne strane; bicikl/moped/motocikl; kad reguliše semafor ili policajac) · po snegu (sneg sam po sebi ne zabranjuje)<br><br>* prevoj/krivina/tunel su dozvoljeni ako ima ≥2 trake u tvom smeru</div>
</div>
<p><b>Dužnosti (čl. 54 i 56):</b> pretican NE SME da ubrzava i pomera se desno; ti se posle preticanja vraćaš u svoju traku bez ugrožavanja drugih.</p>
<p class="mut">Pamćenje za kružni tok: "ISPRED — ne, NA njemu — da". Za tunele/prevoje: "jedna traka — ne, dve trake — da".</p>`,
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
<p class="mut" style="text-align:center;font-size:.82rem">vertikalno: crveno GORE · horizontalno: crveno LEVO (zeleno desno)</p>
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
<p><b>Zapamti:</b> isključenje je PRIVREMENA mera na licu mesta (nije oduzimanje dozvole); isključenom vozaču upravljanje nije dozvoljeno dok mera traje. Vozilo se isključuje posebno (tehnička neispravnost, tablice...).</p>`,
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
<p><b>Prestrojavanje (čl. 48):</b> na DOVOLJNOM ODSTOJANJU pred raskrsnicom zauzmi traku za svoj smer: za levo — krajnja leva, za desno — krajnja desna (na dvosmernom putu "krajnja leva" je uz središnju liniju!).</p>
<svg viewBox="0 0 460 140" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <rect x="100" y="0" width="260" height="120" fill="#9aa7b4"/>
  <line x1="186" y1="0" x2="186" y2="120" stroke="#fff" stroke-dasharray="10 8" stroke-width="3"/>
  <line x1="273" y1="0" x2="273" y2="120" stroke="#fff" stroke-dasharray="10 8" stroke-width="3"/>
  <g stroke="#fff" stroke-width="6" fill="none">
    <path d="M143 105 L143 45 M143 45 L118 45" marker-end="none"/><path d="M118 45 L128 35 M118 45 L128 55"/>
    <path d="M229 105 L229 35"/><path d="M229 35 L219 47 M229 35 L239 47"/>
    <path d="M316 105 L316 45 M316 45 L341 45"/><path d="M341 45 L331 35 M341 45 L331 55"/>
  </g>
  <text x="143" y="134" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">levo: krajnja leva</text>
  <text x="316" y="134" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">desno: krajnja desna</text>
</svg>
<p><b>Propuštanja pri skretanju (čl. 47):</b> sa zemljanog puta/parkinga propuštaš SVE · pri skretanju preko biciklističke staze propuštaš bicikle · pravilo desne strane kad ništa drugo ne reguliše · pri skretanju ULEVO propuštaš vozila iz suprotnog smera.</p>
<p><b>Ne ulazi u raskrsnicu (čl. 49)</b> — ni kad imaš zeleno/prvenstvo — ako bi zbog gužve ostao na raskrsnici ili pešačkom prelazu i blokirao druge.</p>
<p><b>Polukružno okretanje ZABRANJENO (čl. 50):</b> tunel, most, vijadukt, podvožnjak, nadvožnjak, smanjena vidljivost, nedovoljna preglednost, nedovoljna širina puta. (Prepoznaješ listu? Skoro ista kao za preticanje — "opasna mesta".)</p>`,
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
</table>`,
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
<tr><td>stajalište javnog prevoza</td><td><b>15 m</b> ispred i iza</td></tr>
<tr><td>slobodan prolaz pored vozila</td><td>mora ostati <b>≥ 3 m</b></td></tr>
<tr><td>tunel, podvožnjak, galerija, most, nadvožnjak</td><td>uvek zabranjeno</td></tr>
<tr><td>prevoj, nepregledna krivina</td><td>uvek zabranjeno</td></tr>
<tr><td>biciklistička staza/traka, zaklanjanje znaka</td><td>uvek zabranjeno</td></tr>
</table>
<svg viewBox="0 0 460 110" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <rect x="0" y="30" width="460" height="50" fill="#9aa7b4"/>
  <rect x="120" y="30" width="34" height="50" fill="#fff" opacity="0.9"/>
  <g fill="#fff"><rect x="123" y="33" width="28" height="7"/><rect x="123" y="45" width="28" height="7"/><rect x="123" y="57" width="28" height="7"/><rect x="123" y="69" width="28" height="7"/></g>
  <rect x="300" y="30" width="70" height="50" fill="#e0a030" opacity="0.55"/><text x="335" y="60" text-anchor="middle" font-size="10" font-weight="bold" fill="#333">BUS</text>
  <path d="M60 20 L120 20" stroke="#c0392b" stroke-width="2"/><path d="M154 20 L214 20" stroke="#c0392b" stroke-width="2"/>
  <text x="90" y="14" text-anchor="middle" font-size="11" fill="#c0392b" font-weight="bold">5 m</text>
  <text x="184" y="14" text-anchor="middle" font-size="11" fill="#c0392b" font-weight="bold">5 m</text>
  <path d="M255 20 L300 20" stroke="#c0392b" stroke-width="2"/><path d="M370 20 L415 20" stroke="#c0392b" stroke-width="2"/>
  <text x="335" y="14" text-anchor="middle" font-size="11" fill="#c0392b" font-weight="bold">15 m + 15 m</text>
  <text x="90" y="100" text-anchor="middle" font-size="10" fill="#888">zona zabrane oko prelaza</text>
  <text x="335" y="100" text-anchor="middle" font-size="10" fill="#888">zona oko stajališta</text>
</svg>
<p class="mut">Pamćenje: "5 - 5 - 5 - 15 - 3": prelazi i raskrsnica po 5 m, stajalište 15 m, prolaz 3 m. Lista "opasnih mesta" (tunel/most/prevoj/krivina) ista je kao kod preticanja i polukružnog.</p>`,
};

CARDS['svetla'] = {
  title: 'Upotreba svetala (kratka, duga, magla)',
  html: `
<p><b>Osnovno (čl. 77):</b> DANJU — kratka ili dnevna svetla (uvek uključena!). NOĆU — duga svetla.</p>
<p><b>Kratka UMESTO dugih (čl. 77):</b> mimoilaženje kad zaslepljuješ (a UVEK na manje od <b>200 m</b>) · kad ometaš vozača ispred sebe · ulica sa rasvetom · tunel · kad ometaš šinsko vozilo/plovilo · MAGLA · kad je vozilo zaustavljeno.</p>
<p><b>Magla (čl. 79):</b> kratka svetla i/ili svetla za maglu; ZADNJE svetlo za maglu samo po magli/smanjenoj vidljivosti.</p>
<p class="mut">Zamka: duga svetla NISU dozvoljena "uvek noću" — sedam izuzetaka gore. I obrnuto: danju svetla MORAJU (kratka/dnevna), nisu opcija.</p>`,
};

CARDS['pesaci-bicikli'] = {
  title: 'Pešaci, bicikli i dvotočkaši u saobraćaju',
  html: `
<p><b>Vozač prema pešacima (čl. 23):</b> pazi na pešake koji su na kolovozu, stupaju ili se vidi da nameravaju · pred pešačkim prelazom brzina takva da UVEK možeš da staneš · zona dece = naročita opreznost.</p>
<p><b>Na prelazu:</b> pešaku na prelazu (i kad tek stupa) — propusti; zabranjeno je preticanje i obilaženje vozila koje se zaustavilo radi propuštanja pešaka.</p>
<p><b>Za tebe kao vozača mopeda/motocikla:</b> kaciga OBAVEZNA (vozač i putnik) · svetla uvek · dete mlađe od 12 godina se ne prevozi · deca do 12 ne smeju upravljati biciklom na javnom putu.</p>`,
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
    <svg viewBox="0 0 120 120"><rect x="4" y="4" width="112" height="112" rx="8" fill="#fff" stroke="#c0392b" stroke-width="5"/>
      <rect x="18" y="24" width="84" height="18" rx="4" fill="#fff" stroke="#c0392b" stroke-width="5"/>
      <rect x="18" y="52" width="84" height="18" rx="4" fill="#fff" stroke="#c0392b" stroke-width="5"/>
      <rect x="18" y="80" width="84" height="18" rx="4" fill="#fff" stroke="#c0392b" stroke-width="5"/></svg>
    <b>KOSNICI — 240 · 160 · 80 m</b><span>tri crte = 240 m do pruge, dve = 160 m, jedna = 80 m (odbrojavanje)</span>
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
<p><b>Slojevi puta:</b> PUT (celina) ⊃ KOLOVOZ (deo za vozila) ⊃ KOLOVOZNA TRAKA (jedan smer) ⊃ SAOBRAĆAJNA TRAKA (jedan red vozila). Trotoar je deo puta za pešake, bankina je uz kolovoz.</p>
<svg viewBox="0 0 460 130" role="img" style="max-width:460px;width:100%;display:block;margin:6px auto">
  <rect x="2" y="2" width="456" height="126" rx="8" fill="#dcefdc" stroke="#7aa87a"/><text x="12" y="20" font-size="11" font-weight="bold" fill="#2f5b2f">PUT (celina: kolovoz + trotoar + bankina...)</text>
  <rect x="12" y="28" width="360" height="92" rx="6" fill="#b8c6d4" stroke="#64748b"/><text x="22" y="45" font-size="11" font-weight="bold" fill="#26374a">KOLOVOZ (za vozila)</text>
  <rect x="22" y="52" width="340" height="60" rx="4" fill="#9db3c8" stroke="#4a6076"/><text x="32" y="68" font-size="10" font-weight="bold" fill="#1c2e40">KOLOVOZNA TRAKA (jedan smer)</text>
  <rect x="32" y="74" width="320" height="30" rx="3" fill="#7e99b5" stroke="#33495e"/><text x="42" y="93" font-size="10" font-weight="bold" fill="#fff">SAOBRAĆAJNA TRAKA (jedan red vozila)</text>
  <rect x="382" y="28" width="66" height="92" rx="6" fill="#e8dcc2" stroke="#b49a5a"/><text x="415" y="76" text-anchor="middle" font-size="10" font-weight="bold" fill="#6b5520">TROTOAR</text>
</svg>
<p><b>Vrste puteva:</b> autoput (fizički razdvojene kolovozne trake, bez ukrštanja u nivou) · motoput (za motorna vozila, može i bez razdvajanja) · javni put · zemljani put (sa njega propuštaš SVE pri uključenju!).</p>
<p><b>Ključne definicije (čl. 7):</b> ZAUSTAVLJANJE = prekid kretanja do 3 MINUTA (vozač ne napušta vozilo, osim po znaku/pravilu) · PARKIRANJE = svaki duži prekid · NASELJE = izgrađen prostor čije su granice obeležene znakom.</p>`,
};

CARDS['autoput'] = {
  title: 'Autoput i motoput — posebna pravila',
  html: `
<p><b>Kretanje (čl. 104):</b> krajnjom DESNOM trakom (osim kolone/preticanja) · zaustavnom trakom je ZABRANJENO kretanje (izuzetak: pod pratnjom/pravo prvenstva kad je gužva, održavanje) · preticanje s desne strane zabranjeno.</p>
<p><b>Zabranjeno na autoputu/motoputu (čl. 105):</b> zaustavljanje i parkiranje (osim uređenih mesta) · polukružno okretanje · kretanje unazad.</p>
<p><b>Kvar (čl. 105):</b> zaustavi na zaustavnoj traci, sigurnosni trougao na ≥ 100 m, svi pokazivači, svetloodbojni prsluk van vozila — i ukloni vozilo što pre.</p>
<p><b>Zastoj:</b> ostavlja se slobodan prolaz za vozila pod pratnjom/sa pravom prvenstva (čl. 104).</p>`,
};

CARDS['vozilo-tehnika'] = {
  title: 'Vozilo, registracija i tehnički pregled',
  html: `
<p><b>U saobraćaju sme samo vozilo koje je:</b> REGISTROVANO (važeća registraciona nalepnica) + TEHNIČKI ISPRAVNO. Registracija važi godinu dana.</p>
<p><b>Tehnički pregled:</b> redovni — pre izdavanja registracione nalepnice · vozilo mora imati ispravne propisane uređaje (kočnice, upravljač, svetla, pneumatike...).</p>
<p><b>Pneumatici:</b> na istoj osovini ISTI (dimenzija, vrsta) · dubina šare: dublja od TWI oznake, a bez TWI oznake NAJMANJE 1,6 mm (moped/motocikl) · zimska oprema kad je propisana.</p>
<p><b>Za motocikl posebno:</b> ogledala, svetla i kočnice na oba točka su bezbednosno kritični — na testu se traži šta je OBAVEZNA oprema.</p>`,
};

CARDS['razno-pravila'] = {
  title: 'Nasilnička vožnja, vučenje i ostala pravila',
  html: `
<p><b>Nasilnička vožnja (čl. 41):</b> 2+ prolaska kroz crveno u 10 minuta · preticanje kolone preko neisprekidane linije · vožnja u naselju 90+ km/h preko ograničenja · gruba nepažnja prema drugima.</p>
<p><b>Vučenje vozila:</b> užetom (≥3 m), krutom vezom (rudom) ili oslanjanjem/podizanjem; noću i pri smanjenoj vidljivosti vučeno vozilo mora biti osvetljeno; brzina ograničena (40 km/h).</p>
<p><b>Žuto rotaciono svetlo (čl. 111):</b> radovi na putu, vozila pomoći na putu, vanredni prevoz, traktor/radna mašina noću.</p>
<p><b>Prepreke na putu (čl. 112 i Pravilnik):</b> obeležavaju se propisanim znakovima/svetlima — noću crveno svetlo.</p>
<p><b>Osnovna načela:</b> poverenje u druge učesnike + tvoja obaveza da ne ugrožavaš i ometaš druge — svaki učesnik odgovara za svoje postupke.</p>`,
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
U samom browseru, vezano za NAČIN otvaranja: aplikacija otvorena duplim klikom (file://) i preko adrese
(npr. localhost) su za browser dva odvojena skladišta. Drži se JEDNOG načina otvaranja. Ako ti napredak
"nestane" — najverovatnije je na onoj drugoj adresi: tamo klikni "Sačuvaj napredak", pa ovde "Učitaj napredak".</p>
<p><b>Da li restart računara briše napredak?</b><br>
Ne. Briše ga samo "brisanje podataka pregledanja" ("Clear browsing data") i slični alati za čišćenje. Zato jednom klikni
"Poveži fajl za automatsko čuvanje" — od tada se svaka promena upisuje i u fajl na disku.</p>
<p><b>Zašto simulacija izgleda "siromašnije" od učenja?</b><br>
Namerno: simulacija je verna pravom ispitu (isti sastav testa, redosled tema, bez objašnjenja, bez pomoći,
uvek svetla tema). Sve pomoći žive u učenju i u pregledu POSLE predaje.</p>
<p><b>Kako radi "Ponovi pogrešna"?</b><br>
Razmaknuto ponavljanje: pogrešiš → pitanje je odmah spremno; pogodiš ga → vraća se sutra; opet pogodiš →
za 3 dana; treći pogodak zaredom → utvrđeno je i izlazi iz reda.</p>
<p><b>Šta je broj #1234 pored pitanja?</b><br>
Zvanični broj pitanja u MUP bazi — isti broj važi i na eUpravi, pa možeš da uporediš.</p>
<p><b>Zašto odgovori počinju malim slovom, a "km/h" je latinicom i u ćirilici?</b><br>
Tako stoji u zvaničnoj bazi (odgovori su nastavak rečenice pitanja; SI oznake se uvek pišu latinicom) —
i tako će izgledati na ispitu. Ne diramo.</p>
<p><b>Da li su objašnjenja zvanična?</b><br>
Ne — pišemo ih sami, sa osnovom u ZOBS-u (uz broj člana). Tačni odgovori jesu zvanični, iz MUP baze.</p>`,
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

<p style="margin-top:10px"><b>Postavljanje — brojke koje se pitaju (Pravilnik čl. 22):</b></p>
<table>
<tr><th>Gde je znak postavljen</th><th>Pravilo</th></tr>
<tr><td>Po pravilu</td><td>na udaljenosti od <b>150 m do 250 m</b> ispred opasnog mesta</td></tr>
<tr><td>U naselju, bliže od 150 m</td><td>sme — <b>NE MORA</b> imati dopunsku tablu</td></tr>
<tr><td>Van naselja, bliže od 150 m ILI dalje od 250 m</td><td><b>MORA</b> imati dopunsku tablu kojom se označava udaljenost do opasnog mesta</td></tr>
</table>
<p class="mut">Pamtilica: van naselja svako odstupanje od 150-250 traži tablu; u naselju sme bliže i bez table.</p>

<p style="margin-top:10px"><b>Pruga — pet znakova, jedan sistem:</b></p>
<!-- SVG: red znakova: trougao sa ogradom (branici), trougao sa lokomotivom (bez branika), trougao sa tramvajem, jednostruki Andrejin krst, dvostruki Andrejin krst, tri kosnika sa 3/2/1 crvenom crtom i upisanim 240/160/80 m -->
<table>
<tr><th>Na slici</th><th>Znači</th><th>Zamka — NIJE</th></tr>
<tr><td>Trougao + <b>OGRADA</b></td><td>ukrštanje sa železničkom prugom <b>SA branicima</b> ili polubranicima</td><td>prelaz bez branika; tramvajska pruga</td></tr>
<tr><td>Trougao + <b>LOKOMOTIVA</b></td><td>ukrštanje sa železničkom prugom <b>BEZ branika</b> i polubranika</td><td>prelaz sa branicima</td></tr>
<tr><td>Trougao + <b>TRAMVAJ</b></td><td>ukrštanje puta sa <b>tramvajskom</b> prugom u nivou</td><td>„tramvajska stanica"; železnička pruga</td></tr>
<tr><td><b>JEDAN</b> Andrejin krst</td><td>pruga sa <b>jednim kolosekom</b></td><td>dva ili više koloseka</td></tr>
<tr><td><b>DVOSTRUKI</b> Andrejin krst</td><td>pruga sa <b>dva ili više koloseka</b></td><td>jedan kolosek; „prelaz bez branika"</td></tr>
<tr><td>Kosnik (kose crvene crte)</td><td><b>udaljenost</b> do ukrštanja puta i pruge: <b>3 crte = 240 m, 2 crte = 160 m, 1 crta = 80 m</b></td><td>ponuđenih „280 m" ne postoji — računaj 80 × broj crta</td></tr>
</table>
<p class="mut">Iznad kosnika sa tri crte stoji trougao sa ogradom ili lokomotivom (Pravilnik čl. 23) — po NJEMU na pitanju „240 m" znaš da li je prelaz sa branicima ili bez njih.</p>

<p style="margin-top:10px"><b>Raskrsnice — prati debljinu crta:</b> debela uspravna crta = TVOJ put (sa prvenstvom prolaza), tanka crta = sporedni put. Gledaj <b>sa koje strane</b> tanka crta dolazi (leve/desne) i <b>pod kojim uglom</b> (pravi, oštri, tupi) — simbol odgovara stvarnoj situaciji na putu.</p>
<!-- SVG: red znakova: trougao sa krstom čiji su kraci iste debljine; debela uspravna + tanka poprečna crta koja prolazi skroz; spajanje tanke crte pod pravim uglom sa desne strane; pod oštrim uglom sa leve; pod tupim uglom sa desne -->
<table>
<tr><th>Na slici</th><th>Znači</th></tr>
<tr><td>Krst — <b>sve crte iste debljine</b></td><td>blizina raskrsnice puteva od kojih <b>nijedan</b> nije put sa prvenstvom prolaza</td></tr>
<tr><td>Tanka crta <b>preseca</b> debelu skroz</td><td>put sa prvenstvom se <b>UKRŠTA</b> sa sporednim putem</td></tr>
<tr><td>Tanka crta se <b>uliva</b> u debelu</td><td>sporedni put se <b>SPAJA</b> — pod pravim / oštrim / tupim uglom, sa leve ili desne strane</td></tr>
</table>
<p class="mut">Zamke su uvek iste: „iste važnosti" i „ukršta se" — prvo prebroj debljine, pa proveri da li tanka crta prolazi skroz ili se samo uliva.</p>

<p style="margin-top:10px"><b>Parovi-zamke: put i teren</b></p>
<!-- SVG: tri para: izbočina / ulegnuće / izbočina+ulegnuće; prštanje kamenja (točak izbacuje kamenčiće) naspram odrona (kamenje pada niz kosinu); bankina (vozilo propada uz ivicu) -->
<table>
<tr><th>Na slici</th><th>Znači</th><th>Zamka — NIJE</th></tr>
<tr><td>Savijena strelica</td><td>opasna KRIVINA <b>nalevo / nadesno</b> — kako strelica pokazuje</td><td>„smer kojim se vozila moraju kretati" (plavi krug) ni „jednosmerni put"</td></tr>
<tr><td>Dvostruko izlomljena strelica</td><td>više <b>uzastopnih krivina</b> — odgovor po PRVOJ (nalevo/nadesno)</td><td>obična krivina</td></tr>
<tr><td>Kosina sa procentom</td><td>opasna <b>NIZBRDICA</b> ili opasan <b>USPON</b> (procenat = nagib puta)</td><td>„tehnička sredstva za usporavanje saobraćaja"</td></tr>
<tr><td>Ivice puta se skupljaju</td><td><b>SUŽENJE</b> kolovoza: obostrano / samo sa leve / samo sa desne strane</td><td>„radovi na putu" ni „naizmenično uključivanje vozila u jednu traku"</td></tr>
<tr><td>Čovek sa lopatom, <b>žuta osnova</b></td><td><b>RADOVI</b> na putu</td><td>suženje</td></tr>
<tr><td>Vozilo sa vijugavim tragovima</td><td>moguća pojava <b>KLIZAVOG</b> kolovoza</td><td>bankina ni obala</td></tr>
<tr><td>Jedna grba / jedno udubljenje / grba i udubljenje</td><td>neravan kolovoz: <b>IZBOČINA</b> / <b>ULEGNUĆE</b> / <b>„izbočine i ulegnuća"</b> — čitaj sliku doslovno</td><td>međusobno se nude kao zamke — biraj tačno ono što je nacrtano</td></tr>
<tr><td>Točak izbacuje kamenčiće</td><td>moguća pojava <b>PRŠTANJA</b> kamenja</td><td>odron ni bankina</td></tr>
<tr><td>Kamenje pada niz kosinu</td><td><b>ODRON</b> kamenja — kosina je na strani sa koje kamenje preti: <b>sa leve ili sa desne</b> strane puta</td><td>prštanje ni bankina</td></tr>
<tr><td>Vozilo propada uz ivicu kolovoza</td><td>opasna <b>BANKINA</b> uz kolovoz (simbol = strana puta)</td><td>odron ni prštanje</td></tr>
<tr><td>Vozilo pada u vodu</td><td>put vodi do <b>OBALE</b>, odnosno pruža se u njenoj blizini</td><td>klizav kolovoz ni pokretni most</td></tr>
<tr><td>Most se podiže</td><td>blizina <b>POKRETNOG MOSTA</b></td><td>obala</td></tr>
<tr><td>Portal u trouglu</td><td>nailazak na <b>TUNEL</b></td><td>nadvožnjak ni podvožnjak</td></tr>
</table>

<p style="margin-top:10px"><b>Parovi-zamke: ljudi, životinje, saobraćaj</b></p>
<!-- SVG: par: trougao sa pešakom na zebri (opasnost — najava prelaza) pored plavog kvadrata sa pešakom na zebri (obaveštenje — mesto prelaza); trojka za dvosmerni saobraćaj: trougao sa dve strelice gore-dole, plava tabla prvenstva na suženju, okrugli znak zabrane stupanja -->
<table>
<tr><th>Na slici</th><th>Znači</th><th>Zamka — NIJE</th></tr>
<tr><td>Pešak na zebri u <b>TROUGLU</b></td><td>NAILAZAK na mesto gde je <b>obeležen pešački prelaz</b></td><td>„mesto na kome se nalazi pešački prelaz" (to je plavi KVADRAT) ni pešačka staza</td></tr>
<tr><td>Deca u trku</td><td>deo puta gde se često kreću <b>DECA</b> (blizina škole, obdaništa, igrališta)</td><td>„mesto od kojeg počinje zona škole" (to je plava tabla)</td></tr>
<tr><td>Pešak koji hoda</td><td>deo puta kojim se <b>PEŠACI često kreću</b></td><td>pešačka staza ni obeležen prelaz</td></tr>
<tr><td>Biciklista</td><td><b>BICIKLISTI</b> se često kreću, odnosno prelaze put</td><td>biciklistička staza ni zabrana saobraćaja za bicikle</td></tr>
<tr><td>Jelen u skoku</td><td>opasnost zbog prelaska <b>DIVLJAČI</b></td><td>domaće životinje ni „staza za jahanje"</td></tr>
<tr><td>Krava</td><td><b>DOMAĆE životinje pod nadzorom</b> prelaze preko puta, odnosno kreću se duž puta</td><td>divljač ni „staza za jahanje"</td></tr>
<tr><td>Dve strelice gore-dole</td><td>mesto od koga <b>POČINJE DVOSMERAN</b> saobraćaj</td><td>„prvenstvo na suženom delu" (plava tabla) ni „zabrana stupanja na suženi deo" (krug)</td></tr>
<tr><td>Semafor u trouglu</td><td>najava mesta gde je saobraćaj <b>regulisan SEMAFORIMA</b></td><td>prelaz preko pruge sa semaforima ni „pristup vozila reguliše se semaforima"</td></tr>
<tr><td>Avion</td><td>blizina piste: avioni preleću u <b>NISKOM LETU</b> pri sletanju, odnosno poletanju</td><td>„bočni vetar izazvan letom aviona" ni „blizina aerodroma" (to je obaveštenje)</td></tr>
<tr><td>Vetrokaz (vreća na stubu)</td><td>učestala pojava jakog <b>BOČNOG VETRA</b> — simbol odgovara smeru vetra</td><td>avioni</td></tr>
<tr><td>Vozila u nizu, crvena zadnja svetla</td><td>opasnost od <b>STVARANJA KOLONE</b> vozila (zastoj — vozila gledaš otpozadi)</td><td>„moraju se kretati u koloni" ni „zabranjeno kretanje u koloni"</td></tr>
<tr><td>Kružne strelice u trouglu</td><td>nailazak na raskrsnicu sa <b>KRUŽNIM TOKOM</b></td><td>„obavezan smer obilaska ostrva" (plavi krug) ni zabrana polukružnog okretanja</td></tr>
<tr><td>Uzvičnik</td><td>opasnost za koju <b>NIJE predviđen poseban znak</b></td><td>radovi ni „ustupi prvenstvo prolaza"</td></tr>
</table>

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

const BYSUB = {
  148: 'prvenstvo-prolaza',   // vozila pod pratnjom i sa pravom prvenstva (56 pitanja)
  136: 'prvenstvo-prolaza',   // prvenstvo prolaza
  137: 'prvenstvo-prolaza',   // saobraćaj na raskrsnici
};

const prilagodi = 'Brzina se prilagođava USLOVIMA (ZOBS čl. 42): osobinama i stanju puta, vidljivosti, preglednosti, atmosferskim prilikama, stanju vozila i tereta, gustini saobraćaja — tako da vozilo možeš blagovremeno da zaustaviš pred svakom preprekom koju vidiš ili imaš razloga da predvidiš, bez ugrožavanja drugih. Odgovori sa "raspoloživim vremenom", "udobnošću" ili "što pre stigneš" su uvek netačni.';
X[9868] = { x: prilagodi, card: 'brzine' };
X[10488] = { x: prilagodi, card: 'brzine' };
X[10489] = { x: prilagodi, card: 'brzine' };
X[9870] = { x: prilagodi, card: 'brzine' };
X[9873] = { x: prilagodi, card: 'brzine' };
const znakJaci = 'Važi broj sa POSTAVLJENOG ZNAKA — konkretan znak je jači od opšteg ograničenja (ZOBS čl. 43 i 44: opšta pravila važe samo tamo gde znak ne kaže drugačije).';
X[9878] = { x: znakJaci, card: 'brzine' };
X[9908] = { x: znakJaci, card: 'brzine' };
X[9948] = { x: znakJaci, card: 'brzine' };
X[9946] = { x: 'Znak ograničenja (40) postavljen je uz sam ulazak u naselje — važi ZNAK, a ne opšte pravilo "u naselju 50" (čl. 43: opšte ograničenje važi samo gde znak ne kaže drugačije). Za mopede i motocikle nema posebne opšte granice u ovoj situaciji — čitaj znak.', card: 'brzine' };
X[9947] = { x: 'U naselju je opšte ograničenje 50, ali saobraćajnim znakom može da se DOZVOLI kretanje i do 80 km/h kada put to omogućava (ZOBS čl. 43 st. 2) — zato ovde važi 80 sa znaka, iako ulaziš u naselje. Ovo je omiljena zamka: znak može i da POVEĆA ograničenje u naselju.', card: 'brzine' };
X[9949] = { x: 'Na putu za motorna vozila / motoputu opšte ograničenje je 100 km/h (čl. 44), ali postavljeni znak (60) je jači — važi 60. Znak uvek pobija opšte pravilo.', card: 'brzine' };
X[9891] = { x: 'Motoput van naselja: najviše 100 km/h (ZOBS čl. 44). Merdevine opštih ograničenja: naselje 50 → van naselja 80 → motoput 100 → autoput 130.', card: 'brzine' };
X[9903] = { x: 'Put van naselja koji nije ni autoput ni motoput: najviše 80 km/h (ZOBS čl. 44). Merdevine: 50 (naselje) → 80 (van naselja) → 100 (motoput) → 130 (autoput).', card: 'brzine' };
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
BYSUB[159] = 'znakovi-porodice';
BYSUB[160] = 'znakovi-porodice';
BYSUB[166] = 'prvenstvo-prolaza';   // znaci ovlašćenog lica — vrh hijerarhije
BYSUB[131] = 'prvenstvo-prolaza';   // opšte odredbe (hijerarhija postupanja)


BYSUB[161] = 'oznake-kolovoz';
BYSUB[162] = 'semafori';
BYSUB[178] = 'iskljucenje';


BYSUB[133] = 'skretanje';
BYSUB[132] = 'pokazivaci';
BYSUB[139] = 'pokazivaci';
BYSUB[140] = 'parkiranje';


BYSUB[142] = 'svetla';
BYSUB[144] = 'pesaci-bicikli';
BYSUB[145] = 'pesaci-bicikli';
BYSUB[146] = 'pruga';
BYSUB[164] = 'pruga';
BYSUB[109] = 'put-pojmovi';
BYSUB[115] = 'put-pojmovi';
BYSUB[94]  = 'put-pojmovi';
// BYSUB[91] uklonjen — pitanja o načelima imaju svoje tekstove, zbirna kartica tu ne pomaže
BYSUB[147] = 'autoput';
BYSUB[118] = 'vozilo-tehnika';
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
X[10060] = { x: 'Mesta na SREDINI kolovoza smeju se koristiti samo ako su saobraćajnom signalizacijom obeležena za parkiranje (ZOBS čl. 64 st. 4).' };
const park5 = 'Zona od 5 m: pešački prelaz, prelaz biciklističke staze, prelaz preko pruge i raskrsnica — na njima i na manje od 5 m od njih nema ni zaustavljanja ni parkiranja (ZOBS čl. 66). Mnemotehnika na kartici: 5-5-5-15-3.';
X[10065] = { x: park5 };
X[10066] = { x: park5 };
X[10068] = { x: park5 };
X[10071] = { x: park5 };
X[10073] = { x: "Tunel, podvožnjak, galerija, most, nadvožnjak — \"zatvorena i uzdignuta mesta\" su uvek zabranjena za zaustavljanje i parkiranje (ZOBS čl. 66). Uspon sam po sebi nije zabranjen — zabrana važi tek u blizini vrha prevoja i u nepreglednoj krivini (čl. 66 t. 5); ni put van naselja nije zabranjen: tamo je pravilo samo da vozilo skloniš van kolovoza kad god je to moguće (čl. 64)." };
X[10090] = { x: 'Biciklistička staza i traka su saobraćajne površine bicikala — parkiranje na njima je zabranjeno (ZOBS čl. 66).' };
X[10101] = { x: 'Fizički odvojene kolovozne trake (razdelno ostrvo): nema zaustavljanja ni parkiranja — nemoguće je bezbedno obilaženje.' };
X[10111] = { x: 'Trotoar pripada pešacima: zaustavljanje i parkiranje NIJE dozvoljeno (osim ako je signalizacijom izričito dozvoljeno i ostane prolaz za pešake).' };
X[10117] = { x: "Pešačka staza = površina za pešake: nema zaustavljanja ni parkiranja. Uslov o slobodnom prolazu od najmanje 1,60 m važi za TROTOAR, i to samo tamo gde je parkiranje dozvoljeno saobraćajnom signalizacijom (ZOBS čl. 66 t. 13) — na pešačkoj stazi je zabrana bezuslovna (t. 14)." };
X[10120] = { x: 'Deo trotoara za lica sa posebnim potrebama (taktilne staze, rampe): zabrana bez izuzetka — blokiranje znači potpuno onemogućavanje kretanja tim licima.' };
X[10141] = { x: 'Gde je signalizacijom zabranjen SAOBRAĆAJ vozila, zabranjeno je i zaustavljanje i parkiranje — jače pravilo uključuje slabije.' };
X[10499] = { x: 'Vozilo u kvaru na ŠINAMA: ukloni ga ODMAH; ako ne možeš — odmah preduzmi mere da vozači šinskih vozila budu na vreme upozoreni (ZOBS čl. 63 st. 2).' };
X[10500] = { x: 'Vrh prevoja i nepregledna krivina: zabrana zaustavljanja i parkiranja (ZOBS čl. 66) — ista "opasna mesta" kao kod preticanja i polukružnog okretanja.' };
X[10507] = { x: 'Trg, pešačka zona i protivpožarni put: zabranjeno — protivpožarni put mora biti prohodan za intervencije u svakom trenutku.' };
X[10528] = { x: 'Pre napuštanja vozila: preduzmi mere da se vozilo ne pokrene samo (ručna kočnica, brzina, točkovi ka ivičnjaku na nagibu).' };
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
X[9616] = { x: 'Dvosmerni put sa TRI trake: traka uz LEVU ivicu je zabranjena za tebe (srednja služi za preticanje po pravilima) — ZOBS čl. 34.' };
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
X[7922] = { x: 'KONTROLU (nadzor) nad vozačima i vozilima vrše policijski službenici — i uniformisani I u građanskom odelu; kontrola je šira od neposrednog regulisanja.' };
X[7923] = { x: 'U ZONI ŠKOLE regulisanje mogu vršiti i školske saobraćajne patrole i patrole građana (uz policiju) — poseban izuzetak za bezbednost đaka.' };
X[7924] = { x: 'Na RADOVIMA NA PUTU saobraćaj mogu regulisati i radnici izvođača/upravljača puta (uz policiju) — drugi poseban izuzetak.' };
X[7925] = { x: 'Dva osnovna načela ponašanja (ZOBS čl. 3): ne ometaj/ne ugrožavaj/ne povredi druge + preduzmi sve mere da opasnost izbegneš ili otkloniš.' };
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
X[7921] = { ...(X[7921] || {}), x: "NEPOSREDNO regulisanje saobraćaja (znacima na licu mesta) vrše uniformisani policijski službenici — kontrolu i neposredno regulisanje vrši MUP (ZOBS čl. 2). Tehničko regulisanje je posao ministarstva i lokalne samouprave — zato komunalni policajci i inspektori nisu tačan odgovor." };
X[7924] = { ...(X[7924] || {}), x: "Na delu puta gde se izvode radovi saobraćaj, pored uniformisanih policijskih službenika, mogu neposredno regulisati i za to određeni radnici izvođača radova, odnosno upravljača puta (ZOBS čl. 166). Komunalni policajci nemaju to ovlašćenje." };
X[7929] = { ...(X[7929] || {}), x: "Porodica je odgovorna za saobraćajno obrazovanje i vaspitanje dece — unapređivanje i učvršćivanje pozitivnih stavova i ponašanja značajnih za bezbedno učešće u saobraćaju (ZOBS čl. 6). Programi i patrole su na ustanovama i školama." };
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
X[9616] = { ...(X[9616] || {}), x: "Dvosmerni put sa TRI trake: traka uz LEVU ivicu je zabranjena za tebe (srednja služi za preticanje po pravilima) — ZOBS čl. 36 st. 2." };
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
X[9878] = { ...(X[9878] || {}), x: "Znak na slici označava ulazak u naseljeno mesto. U naselju vozač ne sme da se kreće brzinom većom od 50 km/h, osim ako je saobraćajnim znakom dozvoljena veća brzina (ZOBS čl. 43) — ovde nema znaka ograničenja sa brojem, pa važi opštih 50 km/h." };
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
X[7937] = { ...(X[7937]||{}), x: 'Dva minuta, vozač u vozilu → sva tri uslova zaustavljanja ispunjena (do 3 min, nije po znaku, nije napustio vozilo) — ZAUSTAVLJANJE (ZOBS čl. 7).' };
X[7938] = { ...(X[7938]||{}), x: 'Dva minuta, ali je vozač NAPUSTIO vozilo → pao je uslov "nije napustio vozilo", pa to više nije zaustavljanje nego PARKIRANJE (ZOBS čl. 7) — trajanje ispod 3 minuta samo po sebi ne spasava.' };
X[7940] = { ...(X[7940]||{}), x: 'Prolaženje pored učesnika koji dolazi IZ SUPROTNOG SMERA = MIMOILAŽENJE (ZOBS čl. 7). Preticanje je isti smer u kretanju, obilaženje je pored nepokretnog, propuštanje je radnja ustupanja.' };
X[7942] = { ...(X[7942]||{}), x: 'Prolaženje pored učesnika koji se KREĆE istim kolovozom U ISTOM SMERU = PRETICANJE (ZOBS čl. 7). Ključ za razlikovanje: kreće se → preticanje; stoji → obilaženje; suprotni smer → mimoilaženje.' };
X[7944] = { ...(X[7944]||{}), x: 'Prolaženje pored učesnika koji se NE POMERA (zaustavljeno vozilo, prepreka) = OBILAŽENJE (ZOBS čl. 7). Ako se pomera u istom smeru, to je preticanje.' };
X[7948] = { ...(X[7948]||{}), x: 'Odstojanje na kome se KOLOVOZ JASNO VIDI = VIDLJIVOST (zavisi od svetla, padavina, magle). PREGLEDNOST je drugo — nju ograničavaju FIZIČKE prepreke (krivina, objekat, teren). ZOBS čl. 7.' };
X[7953] = { ...(X[7953]||{}), x: "Radnja kojom omogućavaš kretanje drugog učesnika KOJI IMA PRVENSTVO PROLAZA — tako da on ne menja dotadašnji način kretanja i da ne dođe do kontakta — je PROPUŠTANJE (ZOBS čl. 7). Mimoilaženje, preticanje i obilaženje su prolaženja pored nekog; propuštanje je jedino ustupanje." };
X[7954] = { ...(X[7954]||{}), x: 'Smanjena vidljivost VAN naselja: vidljivost manja od 200 m (ZOBS čl. 7). U naselju je prag 100 m. Par za pamćenje: van naselja 200 / u naselju 100.' };
X[7957] = { ...(X[7957]||{}), x: 'ZAUSTAVLJENA kolona: niz od najmanje TRI vozila ZAUSTAVLJENA u istoj saobraćajnoj traci (ZOBS čl. 7). Dva vozila nisu kolona, a parkirana vozila nisu kolona (parkiranje nije deo saobraćajnog toka).' };
X[7958] = { ...(X[7958]||{}), x: 'Kolona U KRETANJU traži tri uslova: najmanje TRI vozila + jedno iza drugog istom trakom u istom smeru + međusobno uslovljeno kretanje u koje drugo vozilo ne može ući bez ometanja (ZOBS čl. 7). Razmak koji dozvoljava ubacivanje = nije kolona.' };
X[7962] = { ...(X[7962]||{}), x: 'Smanjena vidljivost U naselju: manja od 100 m (ZOBS čl. 7). Van naselja prag je 200 m — u naselju rasveta pomaže, pa je prag niži.' };
X[7965] = { ...(X[7965]||{}), x: "SAOBRAĆAJNA NEZGODA traži: dogodila se NA PUTU (ili je započeta na putu), učestvovalo bar jedno vozilo U POKRETU, i nastala je šteta, povreda ili smrt (ZOBS čl. 7). Izletanje s puta uz rušenje ograde ispunjava sve uslove — šteta ne mora nastati na samom putu niti mora biti povređenih." };
X[7966] = { ...(X[7966]||{}), x: "Nezgoda na trkačkoj stazi NIJE saobraćajna nezgoda — fali ključni uslov: dogodila se NA PUTU (ZOBS čl. 7). Povreda i šteta postoje, ali trkačka staza nije put (nije otvorena za sve pod uslovima zakona), pa se ZOBS ne primenjuje." };
X[7974] = { ...(X[7974]||{}), x: 'Srednja brzina = pređeni put / vreme. 300 km za 2 sata = 150 km/h. Ne mešaj sa trenutnom brzinom (ono što pokazuje brzinomer u jednom trenutku).' };
X[7977] = { ...(X[7977]||{}), x: 'UKUPNA masa = masa vozila + masa lica i tereta koji su NA njemu (stvarno stanje sada). NAJVEĆA DOZVOLJENA masa je gornja granica koju deklariše proizvođač — papirna vrednost, ne trenutna (ZOBS čl. 7).' };
X[7982] = { ...(X[7982]||{}), x: 'REGISTROVANO vozilo = upisano u jedinstveni registar + izdate registarske tablice i nalepnica + izdata saobraćajna dozvola — sva tri (ZOBS čl. 7). Privremene tablice nisu registracija, a učestvovanje u saobraćaju je posledica, ne uslov.' };
X[7983] = { ...(X[7983]||{}), x: 'Javna isprava (rešenje) koja s registracionom nalepnicom daje pravo korišćenja vozila = SAOBRAĆAJNA dozvola (za VOZILO). Vozačka je za tebe (lice), tablica je oznaka na vozilu — tri različite stvari.' };
X[7984] = { ...(X[7984]||{}), x: "Oznaka NA VOZILU da je upisano u jedinstveni registar = REGISTARSKA TABLICA (ZOBS čl. 7). Saobraćajna dozvola je isprava (rešenje), ne oznaka na vozilu, a tablice za privremeno označavanje nose vozila koja NISU registrovana — ne dokazuju upis u registar." };
X[7985] = { ...(X[7985]||{}), x: 'Oznaka kojom se određuje DA VOZILO SME U SAOBRAĆAJ U ODREĐENOM ROKU = REGISTRACIONA NALEPNICA (ZOBS čl. 7) — ona nosi rok; tablica nosi identitet, dozvola je isprava.' };
X[7986] = { ...(X[7986]||{}), x: 'Javna isprava koja LICU daje pravo da upravlja vozilom = VOZAČKA dozvola (ZOBS čl. 7). Saobraćajna prati vozilo; uverenje o položenom ispitu nije dozvola — s njim se tek vadi dozvola.' };
X[7987] = { ...(X[7987]||{}), x: "Dovođenje vozila/uređaja u ISPRAVNO stanje = POPRAVKA, a PREPRAVKA je promena konstruktivnih karakteristika (menja se namena/vrsta) — obe definicije ZOBS čl. 7. Tehnički pregled ne popravlja ništa: samo utvrđuje da li je vozilo ispravno (čl. 254)." };
X[7988] = { ...(X[7988]||{}), x: 'Promena KONSTRUKTIVNIH karakteristika (namena, vrsta vozila...) = PREPRAVKA (ZOBS čl. 7) — posle nje sledi ispitivanje vozila. Popravka samo vraća u ispravno stanje.' };
X[7990] = { ...(X[7990]||{}), x: 'BICIKL: NAJMANJE dva točka + pokreće se SNAGOM VOZAČA (pedale/ručice) — ZOBS čl. 7. Zamke: "ima dva točka" je preusko (tricikl-bicikl postoji), a 45 km/h i 4 kW su granice MOPEDA, ne definicija bicikla.' };
X[7996] = { ...(X[7996]||{}), x: "Brzina 40 km/h (do 45) + dva točka + motor sa unutrašnjim sagorevanjem do 50 cm³ = MOPED (ZOBS čl. 7). Efektivna snaga od 5 kW je mamac — moped sa motorom sa unutrašnjim sagorevanjem NEMA ograničenje snage; granica od 4 kW važi samo za električni pogon." };
X[7997] = { ...(X[7997]||{}), x: "I kad pogon nije na benzin, moped se ceni po zapremini: zakon granicu od 50 cm³ vezuje za motor sa unutrašnjim sagorevanjem uopšte, ne samo benzinski (ZOBS čl. 7). 45 cm³ je do 50, a 40 km/h do 45 → MOPED; snaga od 5 kW nije kriterijum za moped." };
X[7998] = { ...(X[7998]||{}), x: "Električni pogon: trajna nominalna snaga do 4 kW + brzina do 45 km/h + dva točka = MOPED (ZOBS čl. 7) — kod struje ulogu kubikaže igra snaga. Preko 4 kW ili preko 45 km/h → motocikl." };
X[8005] = { ...(X[8005]||{}), x: 'Benzinski motor: MOTOCIKL je vozilo sa 2 (ili 3 ASIMETRIČNA) točka čija brzina PRELAZI 45 km/h (ili kubikaža prelazi 50 cm³) — dovoljno je da JEDNA granica bude probijena. "Najmanje dva točka" i "do 50 cm³" su definicije drugih vozila.' };
X[8006] = { ...(X[8006]||{}), x: "Isti uslovi kao za benzin: 2 ili 3 asimetrična točka + brzina preko 45 km/h = MOTOCIKL. Kod motocikla (i mopeda) granica od 50 cm³ važi za svaki motor sa unutrašnjim sagorevanjem, ne samo benzinski (ZOBS čl. 7) — jedino je kod tricikala kubikaža vezana isključivo za benzin." };
X[8007] = { ...(X[8007]||{}), x: 'Električni MOTOCIKL: 2 ili 3 asimetrična točka + trajna nominalna snaga PREKO 4 kW (ZOBS čl. 7) — kod struje snaga igra ulogu kubikaže. Do 4 kW bio bi moped.' };
X[8008] = { ...(X[8008]||{}), x: "Tri točka ASIMETRIČNO raspoređena + brzina preko 45 km/h = MOTOCIKL sa bočnim sedištem (ZOBS čl. 7) — ne tricikl! Simetričan raspored točkova pravi tricikl; asimetričan ostaje motocikl." };
X[8009] = { ...(X[8009]||{}), x: "50 km/h (preko 45) + tri ASIMETRIČNA točka = MOTOCIKL sa bočnim sedištem. Kubikaža od 45 cm³ je mamac za \"moped\" — moped mora imati DVA točka i brzinu do 45 km/h, a ovde ne važi nijedno; asimetrija isključuje tricikl." };
X[8010] = { ...(X[8010]||{}), x: "Električni pogon: trajna nominalna snaga 5 kW PRELAZI 4 kW → nije moped ni laki tricikl; TRI točka su ASIMETRIČNO raspoređena → nije tricikl, nego MOTOCIKL sa bočnim sedištem (ZOBS čl. 7). Brzina od 45 km/h ovde ne odlučuje (ne prelazi 45) — odlučuju snaga i asimetrija." };
X[8011] = { ...(X[8011]||{}), x: "TEŠKI TRICIKL (benzin): TRI SIMETRIČNA točka + brzina preko 45 km/h (ZOBS čl. 7). Simetrija ga deli od motocikla sa bočnim sedištem; kod benzinca merilo je kubikaža preko 50 cm³, dok se snaga preko 4 kW gleda kod ostalih motora i električnog pogona." };
X[8013] = { ...(X[8013]||{}), x: 'Električni: 5 kW (>4) + tri SIMETRIČNA točka = TEŠKI TRICIKL. Ista snaga sa dva točka dala bi motocikl — raspored točkova odlučuje.' };
X[8015] = { ...(X[8015]||{}), x: '50 km/h (>45) + tri SIMETRIČNA točka = TEŠKI TRICIKL — preko granice brzine, pa nije laki; simetrija, pa nije motocikl.' };
X[8016] = { ...(X[8016]||{}), x: 'Ista kombinacija (preko 45 km/h, tri simetrična točka) = TEŠKI TRICIKL, nezavisno od vrste motora.' };
X[10406] = { ...(X[10406]||{}), x: 'Električni TEŠKI TRICIKL — tri uslova zajedno: tri SIMETRIČNA točka + brzina preko 45 km/h + trajna snaga PREKO 4 kW (ZOBS čl. 7). "Najmanje tri točka" je mamac — traži se tačno tri, simetrično.' };
X[10613] = { ...(X[10613]||{}), x: "Odstojanje na kome se, s obzirom na FIZIČKE prepreke (krivina, objekat, breg), u uslovima NORMALNE vidljivosti jasno vidi drugi učesnik ili prepreka na putu = PREGLEDNOST (ZOBS čl. 7). Vidljivost zavisi od svetlosnih uslova; preglednost od geometrije puta." };
X[10683] = { ...(X[10683]||{}), x: "MASA PRAZNOG VOZILA — deklariše je PROIZVOĐAČ: neopterećeno vozilo sa karoserijom, najmanje 90% goriva, punim rezervoarima tečnosti, stalnim teretom, rezervnim točkom i alatom (ZOBS čl. 7). MASA VOZILA je šira (vozilo spremno za vožnju, kod većine vozila i vozač od 75 kg), a UKUPNA masa dodaje još lica i teret." };
X[10686] = { ...(X[10686]||{}), x: 'NAJVEĆU DOZVOLJENU masu deklariše PROIZVOĐAČ vozila (ZOBS čl. 7) — to je konstruktivna granica. Razlika NDM i mase vozila je NOSIVOST (to je prvi mamac).' };


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
(baza se osvežava), a trajno pamti klasu i logiku: što neposrednije ugrožava život, to viša klasa.</p>`,
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
      ${carG(70, 46, '#5f6d7a')}<text x="70" y="51" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold">P</text>
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
</div>`,
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
  let t = s.replace(/<[^>]+>|file:\/\/|localhost|Clear browsing data|mg\/ml|km\/h|kW|cm³|\bkg\b|\bAM\b|\bA1\b|\bA2\b|\bB\b|(\d[,.]?\d*\s?)m\b/g, (m0) => {
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
for (const c of Object.values(CARDS)) c.html = capCells(c.html);

const out = {
  updated: new Date().toISOString().slice(0, 10),
  cards: Object.fromEntries(Object.entries(CARDS).map(([k, c]) => [k, { t: { l: c.title, c: toCyr(c.title) }, h: { l: c.html, c: toCyr(c.html) } }])),
  byQ: Object.fromEntries(Object.entries(X).map(([id, e]) => [id, {
    ...(e.x ? { x: { l: e.x, c: toCyr(e.x) } } : {}),
    ...(e.card ? { card: e.card } : {}),
  }])),
  bySub: BYSUB,
};

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

await fs.writeFile('../explanations.js', 'window.EXPLAIN = ' + JSON.stringify(out) + ';\n');
console.log('explanations.js:', Object.keys(out.byQ).length, 'pitanja,', Object.keys(out.cards).length, 'kartica');
console.log('proba ćirilice:', toCyr('Vozač ne sme (ZOBS čl. 187) — 0,20 mg/ml, kategorije AM, A1, A2 i A; 1,5 m; 45 km/h'));

// Мерена покривеност — да број у документацији не може да застари.
try {
  const baza = JSON.parse(await fs.readFile('base-A.json', 'utf8'));
  const tekst = baza.questions.filter((q) => !q.HasImage);
  const sa = tekst.filter((q) => out.byQ[q.qId] && out.byQ[q.qId].x).length;
  const slika = baza.questions.length - tekst.length;
  const slKart = baza.questions.filter((q) => q.HasImage && (out.bySub[q.subcategoryId] || (out.byQ[q.qId] && out.byQ[q.qId].card))).length;
  console.log('pokrivenost: tekstualna ' + sa + '/' + tekst.length + ' | slikovna sa karticom ' + slKart + '/' + slika);
} catch (e) { console.log('pokrivenost: base-A.json nije dostupan, preskočeno'); }

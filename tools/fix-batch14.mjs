import fs from 'node:fs';

// 0) verifikacija: tehnički pregled = čl. 254?
const zobs = fs.readFileSync('C:/Users/milan/AppData/Local/Temp/claude/C--Users-milan-Desktop-zborapp/8990dfb3-e1f0-4953-85bf-4d493f56dfe2/scratchpad/zobs.txt', 'utf8');
const tp = zobs.indexOf('Na tehničkom pregledu');
const hdr = zobs.lastIndexOf('Član', tp);
const hdrTxt = zobs.slice(hdr, hdr + 12).replace(/\s+/g, ' ').trim();
console.log('tehnički pregled pod:', hdrTxt);
if (!hdrTxt.startsWith('Član 254')) { console.log('FAIL: nije čl. 254 — prekidam'); process.exit(1); }

let s = fs.readFileSync('build-explanations.mjs', 'utf8');
let fails = 0;
function rep(oldStr, newStr, label) {
  const n = s.split(oldStr).length - 1;
  if (n !== 1) { console.log('FAIL [' + label + '] count=' + n); fails++; return; }
  s = s.split(oldStr).join(newStr);
  console.log('ok  [' + label + ']');
}
function repX(id, newText) {
  const anchor = 'X[' + id + '] = ';
  const i = s.indexOf(anchor);
  if (i < 0 || s.indexOf(anchor, i + 1) >= 0) { console.log('FAIL [X' + id + '] anchor'); fails++; return; }
  const end = s.indexOf(';\n', i);
  if (end < 0) { console.log('FAIL [X' + id + '] end'); fails++; return; }
  s = s.slice(0, i) + 'X[' + id + '] = { ...(X[' + id + ']||{}), x: ' + JSON.stringify(newText).replace(/\u2192/g, '\u2192') + ' }' + s.slice(end);
  console.log('ok  [X' + id + ']');
}

// 1) per-question ispravke (po nalazima revizije, zakon proveren verbatim)
repX(7930, 'Saobraćaj je kretanje VOZILA I LICA na putevima (ZOBS čl. 7) — a put je površina koju kao saobraćajnu mogu da koriste svi ili određeni učesnici, pod uslovima iz zakona. Ulica, zemljani put i trotoar jesu put; trkačka staza, njiva i površina koju vlasnik otvara samo za odabrane NISU put, pa kretanje po njima nije saobraćaj.');
repX(7933, 'PEŠAK je i lice u dečjem prevoznom sredstvu ili kolicima za nemoćna lica koje pokreće sopstvenom snagom ILI SNAGOM MOTORA, i lice koje se kreće po putu, i lice koje sopstvenom snagom vuče/gura vozilo ili kolica (ZOBS čl. 7). Ko UPRAVLJA biciklom, zapregom ili motokultivatorom — taj je vozač, ne pešak.');
repX(7953, 'Radnja kojom omogućavaš kretanje drugog učesnika KOJI IMA PRVENSTVO PROLAZA — tako da on ne menja dotadašnji način kretanja i da ne dođe do kontakta — je PROPUŠTANJE (ZOBS čl. 7). Mimoilaženje, preticanje i obilaženje su prolaženja pored nekog; propuštanje je jedino ustupanje.');
repX(7965, 'SAOBRAĆAJNA NEZGODA traži: dogodila se NA PUTU (ili je započeta na putu), učestvovalo bar jedno vozilo U POKRETU, i nastala je šteta, povreda ili smrt (ZOBS čl. 7). Izletanje s puta uz rušenje ograde ispunjava sve uslove — šteta ne mora nastati na samom putu niti mora biti povređenih.');
repX(7966, 'Nezgoda na trkačkoj stazi NIJE saobraćajna nezgoda — fali ključni uslov: dogodila se NA PUTU (ZOBS čl. 7). Povreda i šteta postoje, ali trkačka staza nije put (nije otvorena za sve pod uslovima zakona), pa se ZOBS ne primenjuje.');
repX(10613, 'Odstojanje na kome se, s obzirom na FIZIČKE prepreke (krivina, objekat, breg), u uslovima NORMALNE vidljivosti jasno vidi drugi učesnik ili prepreka na putu = PREGLEDNOST (ZOBS čl. 7). Vidljivost zavisi od svetlosnih uslova; preglednost od geometrije puta.');
repX(7984, 'Oznaka NA VOZILU da je upisano u jedinstveni registar = REGISTARSKA TABLICA (ZOBS čl. 7). Saobraćajna dozvola je isprava (rešenje), ne oznaka na vozilu, a tablice za privremeno označavanje nose vozila koja NISU registrovana — ne dokazuju upis u registar.');
repX(7987, 'Dovođenje vozila/uređaja u ISPRAVNO stanje = POPRAVKA, a PREPRAVKA je promena konstruktivnih karakteristika (menja se namena/vrsta) — obe definicije ZOBS čl. 7. Tehnički pregled ne popravlja ništa: samo utvrđuje da li je vozilo ispravno (čl. 254).');
repX(10683, 'MASA PRAZNOG VOZILA — deklariše je PROIZVOĐAČ: neopterećeno vozilo sa karoserijom, najmanje 90% goriva, punim rezervoarima tečnosti, stalnim teretom, rezervnim točkom i alatom (ZOBS čl. 7). MASA VOZILA je šira (vozilo spremno za vožnju, kod većine vozila i vozač od 75 kg), a UKUPNA masa dodaje još lica i teret.');
repX(7996, 'Brzina 40 km/h (do 45) + dva točka + motor sa unutrašnjim sagorevanjem do 50 cm³ = MOPED (ZOBS čl. 7). Efektivna snaga od 5 kW je mamac — moped sa motorom sa unutrašnjim sagorevanjem NEMA ograničenje snage; granica od 4 kW važi samo za električni pogon.');
repX(7997, 'I kad pogon nije na benzin, moped se ceni po zapremini: zakon granicu od 50 cm³ vezuje za motor sa unutrašnjim sagorevanjem uopšte, ne samo benzinski (ZOBS čl. 7). 45 cm³ je do 50, a 40 km/h do 45 → MOPED; snaga od 5 kW nije kriterijum za moped.');
repX(7998, 'Električni pogon: trajna nominalna snaga do 4 kW + brzina do 45 km/h + dva točka = MOPED (ZOBS čl. 7) — kod struje ulogu kubikaže igra snaga. Preko 4 kW ili preko 45 km/h → motocikl.');
repX(8006, 'Isti uslovi kao za benzin: 2 ili 3 asimetrična točka + brzina preko 45 km/h = MOTOCIKL. Kod motocikla (i mopeda) granica od 50 cm³ važi za svaki motor sa unutrašnjim sagorevanjem, ne samo benzinski (ZOBS čl. 7) — jedino je kod tricikala kubikaža vezana isključivo za benzin.');
repX(8008, 'Tri točka ASIMETRIČNO raspoređena + brzina preko 45 km/h = MOTOCIKL sa bočnim sedištem (ZOBS čl. 7) — ne tricikl! Simetričan raspored točkova pravi tricikl; asimetričan ostaje motocikl.');
repX(8009, '50 km/h (preko 45) + tri ASIMETRIČNA točka = MOTOCIKL sa bočnim sedištem. Kubikaža od 45 cm³ je mamac za "moped" — moped mora imati DVA točka i brzinu do 45 km/h, a ovde ne važi nijedno; asimetrija isključuje tricikl.');
repX(8010, 'Električni pogon: trajna nominalna snaga 5 kW PRELAZI 4 kW → nije moped ni laki tricikl; TRI točka su ASIMETRIČNO raspoređena → nije tricikl, nego MOTOCIKL sa bočnim sedištem (ZOBS čl. 7). Brzina od 45 km/h ovde ne odlučuje (ne prelazi 45) — odlučuju snaga i asimetrija.');
repX(8011, 'TEŠKI TRICIKL (benzin): TRI SIMETRIČNA točka + brzina preko 45 km/h (ZOBS čl. 7). Simetrija ga deli od motocikla sa bočnim sedištem; kod benzinca merilo je kubikaža preko 50 cm³, dok se snaga preko 4 kW gleda kod ostalih motora i električnog pogona.');

// 2) uklanjanje pogrešnog zajedničkog ključa (const klas) — više ga niko ne koristi
{
  const i = s.indexOf("const klas = ");
  if (i < 0) { console.log('FAIL [klas] not found'); fails++; }
  else {
    const end = s.indexOf('\n', i);
    if (s.indexOf('+ klas', 0) >= 0 && s.indexOf('+ klas') < i === false) { /* checked below */ }
    s = s.slice(0, i) + s.slice(end + 1);
    console.log('ok  [klas removed]');
  }
}
if (s.includes('+ klas')) { console.log('FAIL: neko jos koristi klas'); fails++; }

// 3) kartica kategorije-vozila
rep(`<p><b>Ključ za pamćenje:</b> broj točkova ti kaže <i>vrstu</i> (2 = moped/motocikl, 3 = tricikl, 4 = četvorocikl),
a snaga/brzina ti kaže <i>laki ili teški</i>: <b>do 45 km/h i do 50 cm³ (ili do 4 kW) = "laki"/moped</b>;
<b>preko toga = motocikl / "teški"</b>. (ZOBS čl. 7)</p>`,
`<p><b>Ključ za pamćenje:</b> raspored točkova ti kaže <i>vrstu</i> (2 = moped/motocikl; 3 asimetrična = motocikl sa bočnim sedištem; 3 simetrična = tricikl; 4 = četvorocikl),
a granice su <b>45 km/h</b>, <b>50 cm³</b> (motor sa unutrašnjim sagorevanjem) i <b>4 kW</b> (električni pogon):
<b>sve u granicama = moped / "laki"</b>; <b>bilo koja granica probijena = motocikl / "teški"</b>. (ZOBS čl. 7)</p>`, 'card-key');

rep(`<div class="vg vgHead">do 45 km/h<br>i do 50 cm³</div>`, `<div class="vg vgHead">sve u granicama</div>`, 'card-grid-slow');
rep(`<div class="vg vgHead">preko toga</div>`, `<div class="vg vgHead">preko bilo koje granice</div>`, 'card-grid-fast');

rep(`<tr><td><b>moped</b></td><td>2</td><td>do 45 km/h, do 50 cm³ (ili do 4 kW)</td></tr>
<tr><td><b>motocikl</b></td><td>2 (ili 3 asimetrična — sa bočnim sedištem)</td><td>preko 45 km/h ili preko 50 cm³</td></tr>
<tr><td><b>laki tricikl</b></td><td>3 (simetrična)</td><td>do 45 km/h, do 50 cm³ (ili do 4 kW)</td></tr>
<tr><td><b>teški tricikl</b></td><td>3 (simetrična)</td><td>preko 45 km/h ili preko 50 cm³</td></tr>
<tr><td><b>laki četvorocikl</b></td><td>4</td><td>u granicama mopeda</td></tr>
<tr><td><b>teški četvorocikl</b></td><td>4</td><td>preko granica mopeda</td></tr>
</table>`,
`<tr><td><b>moped</b></td><td>2</td><td>do 45 km/h; motor sa unutrašnjim sagorevanjem do 50 cm³, električni do 4 kW</td></tr>
<tr><td><b>motocikl</b></td><td>2 (ili 3 asimetrična — sa bočnim sedištem)</td><td>preko 45 km/h, ili motor sa unutrašnjim sagorevanjem preko 50 cm³, ili električni preko 4 kW</td></tr>
<tr><td><b>laki tricikl</b></td><td>3</td><td>do 45 km/h; benzinski do 50 cm³, ostali motori do 4 kW</td></tr>
<tr><td><b>teški tricikl</b></td><td>3 (simetrična)</td><td>preko 45 km/h, ili benzinski preko 50 cm³, ili ostali motori preko 4 kW</td></tr>
<tr><td><b>laki četvorocikl</b></td><td>4</td><td>granice kao laki tricikl + masa praznog vozila do 350 kg</td></tr>
<tr><td><b>teški četvorocikl</b></td><td>4</td><td>ostali četvorocikli: masa do 400 kg (teretni 550 kg), snaga do 15 kW</td></tr>
</table>
<p><b>Zamka:</b> granica od 50 cm³ kod mopeda i motocikla važi za SVAKI motor sa unutrašnjim sagorevanjem (i dizel!),
a samo kod tricikala i četvorocikala isključivo za benzinski — ostali se tamo cene po snazi (4 kW).
Moped sa motorom sa unutrašnjim sagorevanjem NEMA granicu snage: 5 kW efektivne, a i dalje je moped ako su brzina i kubikaža u granicama.</p>`, 'card-table');

if (fails) { console.log('NE PIŠEM — ' + fails + ' promašaja'); process.exit(1); }
fs.writeFileSync('build-explanations.mjs', s);
console.log('sve primenjeno (16 tekstova + kartica + klas uklonjen)');

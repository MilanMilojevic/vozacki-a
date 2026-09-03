// Milanova primedba (03.09.2026): uz pitanja se otvara kartica koja sa pitanjem nema veze.
// Uzrok je merljiv: podoblast 132 („Upotreba pokazivača pravca, uključivanje vozila u saobraćaj
// i isključivanje iz saobraćaja, kretanje vozila po putu") ima 29 pitanja, a SAMO JEDNO pominje
// pokazivače — svih 29 je dobijalo karticu o žmigavcima. Zvanične podoblasti su spojevi više tema,
// pa kačenje kartice po podoblasti promašuje kad je podoblast mešavina.
// Rešenje: nova, uska kartica za ono što ta pitanja stvarno pitaju (kretanje po putu i uključivanje
// u saobraćaj), premapiranje 132 na nju, i uklanjanje mapiranja 170 (ta pitanja već imaju svoju
// karticu po pitanju). Svaka tvrdnja u kartici je prethodno pročitana u tekstu ZOBS-a.
import fs from 'node:fs';
const P = new URL('../build-explanations.mjs', import.meta.url);
let t = fs.readFileSync(P, 'utf8');
let pao = 0;
const rep = (o, n, ime) => { const c = t.split(o).length - 1; if (c !== 1) { console.log('FAIL [' + ime + '] ' + c); pao++; return; } t = t.split(o).join(n); console.log('ok [' + ime + ']'); };

const KARTICA = `CARDS['kretanje-po-putu'] = {
  title: 'Kretanje po putu i uključivanje u saobraćaj',
  html: \`
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
pre nego što si siguran — a znak ide pre radnje, ne u toku nje.</p>\`,
};

`;

rep('const BYSUB = {', KARTICA + 'const BYSUB = {', 'nova kartica');
rep("BYSUB[132] = 'pokazivaci';", "BYSUB[132] = 'kretanje-po-putu';   // 28 od 29 pitanja te podoblasti nisu o pokazivačima", 'premapiranje 132');

// 170 (Prevoz lica vozilima): ta pitanja već imaju karticu po pitanju (kategorije-vozila),
// a kartica o pešacima i dvotočkašima im ne odgovara — mapiranje se uklanja.
const m170 = t.match(/BYSUB\[170\] = '[^']*';[^\n]*\n/);
if (!m170) { console.log('FAIL [170] mapiranje nije nađeno'); pao++; }
else { t = t.replace(m170[0], ''); console.log('ok [uklonjeno mapiranje 170] ' + m170[0].trim()); }

if (pao) { console.log('*** NE PIŠEM ***'); process.exit(1); }
fs.writeFileSync(P, t);
console.log('--- upisano: tools/build-explanations.mjs ---');

import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const ids = [8296,8302,8305,8306,8314,8318,8320,8321,8322,8323,8324,8326,8328,8329,8330,8333,8334,8335,8337,8338,8339,8341];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] postoji'); process.exit(1); }
}
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const block = `
// --- Kaznene mere, podtura C: blaža srednja klasa (niži raspon, 0-6 poena), 22 pitanja — bez iznosa ---
X[8296] = { x: 'Uključivanje u saobraćaj bez prethodnog uveravanja da ne ometaš druge i bez obaveštavanja o nameri = srednja klasa, niži raspon, bez poena. Dužnost je dvostruka: uveri se + najavi (ZOBS čl. 35) — oba dela moraju.' };
X[8302] = { x: 'Polukružno okretanje U TUNELU = srednja klasa sa malo poena. Tunel je na spisku mesta gde je polukružno okretanje izričito zabranjeno (ZOBS čl. 50) — nema ni preglednosti ni prostora za manevar.' };
X[8305] = { x: 'Preticanje NEPOSREDNO ISPRED RASKRSNICE na putu koji nije sa prvenstvom prolaza = srednja klasa sa malo poena (zabrana iz ZOBS čl. 55). Ispred raskrsnice pažnja mora biti na prvenstvu i pešacima, ne na manevru preticanja.' };
X[8306] = { x: 'Vožnja za vreme MAGLE bez uključenih svetala za osvetljavanje puta = srednja klasa sa poenima. U magli svetla nisu samo radi tvog vida — ona su tu da TEBE vide drugi.' };
X[8314] = { x: 'ZAUSTAVLJANJE vozila na zaustavnoj traci autoputa = srednja klasa, niži raspon. Zaustavna traka služi isključivo za prinudna zaustavljanja — zaustavljanje iz komocije pravi opasnu prepreku u zoni najvećih brzina. Uporedi: VOŽNJA zaustavnom trakom je u ispitnoj bazi najteža klasa.' };
X[8318] = { x: 'Prevoz VIŠE LICA nego što je označeno u saobraćajnoj dozvoli = srednja klasa sa poenima. Broj mesta iz dozvole je granica za koju je vozilo konstruisano i opremljeno — višak putnika je nezaštićen.' };
X[8320] = { x: 'Proći uslovnu zelenu strelicu pa NE PROPUSTITI PEŠAKA koji prelazi kolovoz = srednja klasa sa malo poena. Uslovna strelica dozvoljava prolaz dok gori crveno/žuto samo uz propuštanje pešaka i vozila (ZOBS čl. 143) — propuštanje je sam uslov prolaska.' };
X[8321] = { x: 'Proći uslovnu zelenu strelicu pa NE PROPUSTITI VOZILO na putu na koji ulaziš = srednja klasa sa malo poena, isto kao za pešaka (ZOBS čl. 143). Strelica ti daje mogućnost prolaza — ne prvenstvo.' };
X[8322] = { x: 'Vožnja PEŠAČKOM ZONOM = srednja klasa sa malo poena. Pešačka zona je prostor namenjen pešacima — vozilo tamo ne pripada.' };
X[8323] = { x: 'Zona škole VAN naselja: ograničenje brzine je više nego u naselju, pa je 85 km/h manje prekoračenje — zato blaža klasa sa poenima. Ista brzina u zoni škole U NASELJU (ograničenje 30 km/h) bila bi mnogo strože kažnjena: mesto određuje težinu.' };
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
X[8341] = { x: 'Kada vozač koji je učinio prekršaj NIJE identifikovan, vlasnik se kažnjava srednjom klasom, nižim rasponom — za OMOGUĆAVANJE prekršaja, ne za sam prekršaj. Odgovornost je za propust nadzora nad sopstvenim vozilom.' };

`;
s = s.slice(0, ti) + block + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch19c (kaznene C, 22) inserted');

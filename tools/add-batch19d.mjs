import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const ids = [8343,8344,8348,8349,8353,8354,8355,8356,8366,8367,8368,8369,8370,8376,8378,8379,8386,8389,8390,8393,8395,8404,8405,8406,8407,8408,8410,8411,8412,8413,8414,8417,8418,8420,8421,8422];
for (const id of ids) {
  if (s.includes('X[' + id + ']')) { console.log('FAIL: X[' + id + '] postoji'); process.exit(1); }
}
const ti = s.indexOf('// ---------------- transliteracija');
if (ti < 0) { console.log('no anchor'); process.exit(1); }
const block = `
// --- Kaznene mere, podtura D: fiksne kazne (21) + zaštitna mera izriče se / ne izriče se (15) — bez iznosa ---
X[8343] = { x: 'Neomogućavanje autobusu da se propisno uključi sa stajališta (u naselju) = LAKŠA klasa — fiksna manja kazna, bez poena. Pravilo postoji da javni prevoz uopšte može da krene sa stajališta.' };
X[8344] = { x: 'Mobilni telefon na nepropisan način tokom vožnje = LAKŠA klasa (fiksna kazna). Ne daj da te blaga kazna zavara — telefon u ruci množi vreme reakcije; dozvoljena je samo upotreba opreme koja omogućava telefoniranje bez angažovanja ruku.' };
X[8348] = { x: 'Kretanje trakom koja nije namenjena tvojoj vrsti vozila (npr. žuta BUS traka) = LAKŠA klasa — fiksna kazna, bez poena.' };
X[8349] = { x: 'Prekoračenje u naselju za 11 do 20 km/h = najblaži kažnjivi stepenik brzine — fiksna manja kazna. Lestvica brzine: što veće prekoračenje, viša klasa — do najteže (preko 70-90) i nasilničke vožnje.' };
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
X[8413] = { x: 'Dozvola istekla VIŠE OD ŠEST meseci: mera se IZRIČE. Preko šest meseci prestaje "administrativni zaborav" — predugo voziš bez periodične provere uslova za upravljanje.' };
X[8414] = { x: 'Vožnja vozila ISKLJUČENOG iz saobraćaja: mera se IZRIČE — kršenje naredbe o isključenju je teško u svakom pogledu (i kazna mu je u najtežoj klasi).' };
X[8417] = { x: 'Noću bez ijednog svetla na neosvetljenom delu puta: mera se IZRIČE — nevidljivo vozilo u mraku je među najopasnijim stvarima na putu (i kazna je u najtežoj klasi).' };
X[8418] = { x: 'DETE MLAĐE OD 12 GODINA U KRILU vozača: mera se IZRIČE. Dete u krilu je i u najtežoj kaznenoj klasi (ZOBS čl. 330 kažnjava prevoz deteta mlađeg od 12 godina u krilu) — vazdušni jastuk i udar za dete u krilu su smrtonosni.' };
X[8420] = { x: 'Ne zaustaviti se pred prugom kada svetlosni znak najavljuje voz (prelaz bez branika): mera se IZRIČE — trka sa vozom je izgubljena unapred, zato uz kaznu ide i zabrana.' };
X[8421] = { x: 'ISTEKLA REGISTRACIONA NALEPNICA: kazna DA, zaštitna mera NE — administrativni propust bez neposredno opasne radnje. Uporedi: za vozilo koje uopšte NIJE registrovano mera se izriče.' };
X[8422] = { x: 'Dozvola istekla NAJVIŠE ŠEST meseci: kazna DA (blaga), zaštitna mera NE — do šest meseci zakon to tretira kao administrativni propust. Preko šest meseci: ide i mera.' };

`;
s = s.slice(0, ti) + block + s.slice(ti);
fs.writeFileSync('build-explanations.mjs', s);
console.log('batch19d (kaznene D, 36) inserted');

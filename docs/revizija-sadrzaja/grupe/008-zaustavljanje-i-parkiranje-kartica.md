# Grupa 008 — sadržaj kartice „Zaustavljanje i parkiranje”

Datum: 2026-09-10. Autor pregleda i kandidata: Codex `/root/learning_visual_second_review`. Ceo konačni sadržaj na oba pisma nezavisno pročitali i odobrili `/root` i `/root/a0_sanitize`. Nema potvrde instruktora ni nove provere sirovog MUP portala.

Paket menja samo karticu `parkiranje`, njen generatorski izvor, regresione provere i evidenciju. Svih **1.327 pojedinačnih objašnjenja**, drugih **38 kartica**, zvanična pitanja, opcije, ključevi, bodovi, sve **704 originalne slike** i mape `bySub`, `atlas`, `situacije`, `zamke` ostaju isti.

## Pročitani obuhvat

Pročitani su cela stara i nova kartica na oba pisma, svih pet tabela, vidljivi tekst i pristupačni opisi svih crteža, svih 27 pitanja podoblasti 140 sa svim opcijama i objašnjenjima, i šest originalnih slika: 10061, 10091, 10092, 10113, 10118, 10142. Ista fotografija se koristi uz 10091 i 10092. Kartica nema atlas; pet `situacije` stavki su iste originalne slike, bez 10061.

Tačni ID-jevi pitanja: **10052, 10054, 10055, 10057, 10058, 10060, 10061, 10065, 10066, 10068, 10071, 10073, 10090, 10091, 10092, 10101, 10111, 10113, 10117, 10118, 10120, 10141, 10142, 10499, 10500, 10507, 10528**. Svako nosi 2 boda. Dva odgovora traže 10073 i 10500; ostala jedan. Tačni ID-jevi svih odgovora navedeni su i nezavisno provereni u `tools/tests/parkiranje-card.browser.js`.

Pitanje **10061** dodatno otvara `oznake-kolovoz`. Pregled konkretnog crteža polja za usmeravanje nije pregled svih drugih delova te kartice; ta zavisnost ostaje otvorena.

## Potvrđene greške i izvršene ispravke

- Definicije zaustavljanja/parkiranja sada navode tri minuta, prisustvo vozača i prekide zbog pravila/znaka. Uklonjene su tvrdnje da zabrana nikad ne razlikuje radnje i da taksi nema izuzetke.
- Izuzeci iz čl. 62 i 66 opisani su uz granice primene: taksi, ograničeno zaustavljanje, jednosmerna ulica posle raskrsnice ili pešačkog/biciklističkog prelaza. Izuzetak nije prenet na prelaz pruge.
- Razjašnjeni su merilo 15 m od oznake stajališta na kolovozu, način merenja 3 m i njegov ograničeni izuzetak. Kod trotoara je izričito navedeno da uslov 1,60 m zakon vezuje za parkirano vozilo.
- Parkiranje na sredini kolovoza vezano je za saobraćajni znak i opštu zabranu ugrožavanja/ometanja. Crtež sada stvarno sadrži znak **P**, na oba pisma.
- Objašnjenje zvanične slike 10142 oslanja se na **II-3**, a ne na izmišljeno tumačenje razmaka od raskrsnice. Generički crteži raskrsnice jasno su odvojeni od te slike.
- Biciklistička traka više nije opisana kao površina samo za bicikle. **II-41.1** ima službeni naziv i važeću definiciju koja uključuje laka električna vozila; zabrana za automobil objašnjena je konkretnim površinama, bez pogrešnog razloga „nije kolovoz”.
- Uklonjeni su crtež koji univerzalno okreće točkove ka ivičnjaku i precrtani sigurnosni trougao. Sprečavanje samopokretanja, uklanjanje vozila sa šina i upozorenje drugih ne predstavljaju se kao zabrana propisanog obeležavanja vozila.
- Uklonjene su netačne apsolutne formulacije i izjednačavanje spiskova sa preticanjem/polukružnim okretanjem. Završni grafikon izričito opisuje samo ovih 27 pitanja; reči „dozvoljeno” i „samo” nisu prečica za pogađanje odgovora.
- Svih 19 zadržanih SVG-ova dobilo je pregledan ćirilični pristupačni opis. Oznake **P**, **II-3** i **II-41.1** čuvaju službeni oblik; opšte preslovljavanje i druge kartice nisu menjani.

## Primarni izvori

U registar su dodate samo dve uske reference, vezane za ovu karticu:

1. [PIS — Zakon o bezbednosti saobraćaja na putevima](https://reg.pravno-informacioni-sistem.rs/api/viewAct/8b57d1e9-9b34-4fa0-9693-7ceb6da65486?lawActId=438311), kroz 19/2025: član 7 tačke 13, 71 i 72, puni članovi 62–68. Sačuvani javni odgovor SHA-256 `e76c49f7cbdbfc90bf1282e11f1172f2d52626a1435c6940cfb824d5a2cb1904`. Root je nezavisno preuzeo isti odgovor i potvrdio podudarnost posle uklanjanja BOM oznake svog fajla.
2. [PIS — Pravilnik o saobraćajnoj signalizaciji](https://reg.pravno-informacioni-sistem.rs/api/viewdoc?doctype=reg&regactid=440491&uuid=2bd446cf-0965-4141-8323-d207a4216ed1), kroz 76/2026: čl. 25 t. 3, čl. 26 t. 41 i čl. 67 odeljak 2.3.2. Sačuvani odgovor SHA-256 `8f9b78ea7810a5d5028f3b2878773d37080cf9096a2239dc2a306101708c45d7`. Proverena je važeća definicija II-41.1; prelazni rok za usklađivanje postojeće signalizacije ne odlaže stupanje propisa.

Stare široke reference nisu proširivane. Root nije pripisao ovom paketu sopstveno čitanje celog pravilnika ili svake odredbe njegovih izmena.

## Dokaz i preostali posao

Konačni generatorski SHA-256: `4627d741aade165be0c10d6212c984b83cbba0c48fcc1d7d8108b07485725a95`; generisani `explanations.js`: `cd9af0edb55d6fb1ea0e5b6bf5c080edc89ae9f713014ccb4cc2f910cfb9ab17`. Obrnuta primena 40 preciznih operacija/42 pogodaka i lokalne dopune opisa/oznaka vraća prethodne bajtove izvora. Četiri NUL bajta su očuvana. Dvostruko generisanje je deterministično; parsirani izlaz razlikuje samo `parkiranje.h.l` i `.c`.

Privremena provera kandidata: **7/7**. Trajni `parkiranje-card.test.mjs`: stari sadržaj **0/3**, ispravljeni **3/3**. Trajni test nema zavisnost od starih Git commitova ili ignored izlaza. Proverava znak, pisma i stvarne ključeve/grafikon; ne potvrđuje pravnu tačnost teksta.

Autor i root nezavisno su pokrenuli novu browser matricu: **16 prikaza kartice, 304 provere SVG geometrije/zaklanjanja i 216 tokova pitanja**. Oba pisma, obe teme, širine 320/1280, direktna kartica i kartica posle odgovora; najveće podešavanje teksta u aplikaciji. Proverene su sve opcije i nezavisni ključevi, slike, potvrda odgovora, prikaz objašnjenja i stvarne veze ka karticama. Root je pregledao svih 19 novih desktop SVG snimaka; autor i mobilne ćirilične snimke. Ovo nije puna provera čitača ekrana ili izvornog zumiranja pregledača.

**Kartica ostaje `in-progress`.** Sadržaj, pravne reference i pisma su pregledani; `image` ostaje otvoren zbog poznatog slabog kontrasta i oznaka koje na telefonu padaju na približno **9,27 px**. Kontrast je zaseban paket 010; veličina/prelom natpisa paket 011. `image` ostaje otvoren do oba. Paket 009 tek treba da ispravi 16 pojedinačnih objašnjenja; zato ovim paketom nijedno pitanje ne dobija status `reviewed`. Evidencija razlikuje pročitan sadržaj od završenog pregleda svih njegovih zavisnosti.

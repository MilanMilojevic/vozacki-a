# Kako se vodi sadržajna revizija

Ovo je evidencija pregleda, ne potvrda da je baza tačna. Početno generisanje obuhvata 1.327 pitanja i 39 kartica, uključujući FAQ. Svi počinju kao `unreviewed`. Strukturna činjenica da pitanje nema sliku dozvoljava samo `checks.image: "not-applicable"`, uz razlog; ne potvrđuje ostali sadržaj.

## Komande

Iz korena radne kopije:

```powershell
node tools/audit-content.mjs --check
node tools/audit-content.mjs --write
node tools/audit-content.mjs --check --require-reviewed
node --test tools/tests/content-audit.test.mjs
```

Bez zastavice alat radi isto što i `--check`: samo čita. Putanje se računaju prema lokaciji skripte, pa može da se pozove i apsolutnom putanjom iz drugog direktorijuma. `--write` prvo proverava sve ulaze i postojeću evidenciju, pa osvežava tri generisana fajla. Zamena je atomska po fajlu, ne transakcija preko sva tri; posle prekinutog upisa ponoviti `--write` i `--check`.

Uspešan `--check` znači da su ID-jevi potpuni i otisci aktuelni. `--require-reviewed` dodatno pada dok postoji ijedno neprovereno ili sporno pitanje/kartica. Ni ovaj uslov ne može mašinski potvrditi istinitost beleške recenzenta.

## Javni ulazi i otisci

Alat parsira samo JSON dodele `window.QUIZ` iz `data.js` i `window.EXPLAIN` iz `explanations.js`; ne izvršava JavaScript. Ne čita harvest, ranije Git verzije, izvoz napretka, fajl automatske rezerve ili profil pregledača. Dodatni metapodaci van poznate javne šeme, nepotpuni ID-jevi, nepoznate veze i nebezbedne putanje obaraju proveru. Slike moraju biti lokalni `img/<ID>.jpg`; preusmerene putanje/symlink nisu dozvoljeni. Novi oblici resursa, npr. `srcset`, traže dopunu praćenja zavisnosti.

`manifest.json` beleži SHA-256 kanonski parsiranih javnih izvora i njihove deklarisane datume. To su datumi metapodataka, ne datum provere propisa. Beli prostor/redosled ključeva u JSON-u ne menja otisak; redosled odgovora i stavki prikaza se čuva. Slike se heširaju po bajtovima.

Pitanje obuhvata oba pisma teksta/odgovora i naziva oblasti, ID-jeve, redosled i oznake tačnih odgovora, bodove, broj potrebnih odgovora, originalnu sliku, objašnjenje i stvarne veze prema `nocard`, `card` i `bySub`. Zavisna kartica obuhvata naslov i ceo HTML/SVG na oba pisma, lokalne slike, atlas i situacije sa odgovarajućim pitanjima/slikama. Obuhvaćene su i zamke iz netačnih odgovora. Ceo atlas ulazi kao dodatni kontekst gde prikaz koristi zajedničke brojače istog značenja; zato promena znaka može konzervativno ponovo otvoriti više zapisa.

Hash ne obuhvata CSS, prevodne pomoćne poruke i algoritme prikaza u `app.js`, niti sam generativni alat. Njihove promene traže zasebnu funkcionalnu/vizuelnu proveru. Nije proverena podudarnost sa sirovim MUP bazama; to je budući sadržajni posao, ne tvrdnja ovog alata.

## Radna grupa od 25–50 pitanja

1. Početi sa `--check`. Izabrati grupu po `category`/`subcategory` i zapisati tačne ID-jeve, recenzenta i datum u belešci grupe. Prekinuta grupa ostaje nezavršena; nastavlja se prema ID-jevima i statusima, bez pretpostavke da je cela oblast proverena.
2. Pročitati obe verzije pitanja, sve opcije i objašnjenje. Otvoriti stvarnu sliku ako postoji. Pregledati povezane kartice, pododeljke, SVG, atlas/situacije i zamke navedene u `dependencies`. Odsustvo kartice samo po sebi nije greška.
3. Za uslove, izuzetke, negaciju, jedinice, brojeve i „zato što” proveriti dokaz. Razdvojiti odgovor u ispitnoj bazi od važećeg pravila i od pomoći za pamćenje. Za sporne tvrdnje tražiti drugi nezavisan prolaz; ne pripisivati potvrdu instruktoru ako je nije dao.
4. Izvor prvo dodati u `izvori.json`, povezati njegov ID kroz `legalSources` konkretnog pitanja/kartice i pokrenuti `--write`. Tek zatim pregledati nov dobijeni `contentHash` i uneti rezultat. Ne menjati hash ručno i ne označavati sadržaj unapred da bi prošao test.
5. U JSONL zapisu promeniti odgovarajuće `checks`, dodati stvarnu belešku `review` i ukupni status. Sačuvati nalaz, izvršenu ispravku i način ponovne provere. Posle izmene generatorskog izvora i generisanja runtime sadržaja ponovo pokrenuti `--write`: stari pregled se arhivira i ponovo otvara. Ispravku zatvoriti tek nakon pregleda novog sadržaja.
6. Pokrenuti `--write` radi kanonskog zapisa/zbirova, zatim `--check`. Prijaviti koliko je zaista pregledano, ispravljeno i ostalo sporno. Potpunost evidencije i potpunost semantičke revizije su odvojeni rezultati.

## Polja koja popunjava recenzent

| Polje | Sadržaj |
| --- | --- |
| `status` | `unreviewed`, `in-progress`, `needs-expert` ili `reviewed` |
| `checks.questionAnswers` | Ceo tekst i sve opcije, ID-jevi, potrebni odgovori i bodovi |
| `checks.image` | Originalna slika pitanja; na kartici njene slike/SVG |
| `checks.explanation` | Tačnost razloga, uslova, izuzetaka i objašnjenja netačnih opcija |
| `checks.legalSource` | Primarni izvor, relevantan član i važeća verzija |
| `checks.cardLinks` | Veza ka konkretnom korisnom pojmu/odeljku i zavisni sadržaj |
| `checks.scripts` | Latinični i ćirilični sadržaj, uključujući oznake na crtežima |
| `checks.content` | Na kartici zamenjuje pitanje/objašnjenje/veze: celokupan nastavni sadržaj |
| `review` | `reviewer`, datum `date` kao YYYY-MM-DD, `evidence`, `findings`, `verification`; sve su stvarne beleške, ne automatski tekst |
| `legalSources` | ID-jevi izvora iz registra; URL/član se ne nagađaju |
| `notApplicableReasons` | Obrazloženje za svako `not-applicable`; tekst, objašnjenje i oba pisma ne mogu se tako preskočiti |
| `history` | Automatski sačuvan prethodni pregled sa starim hashom; istorijski pregled ne potvrđuje današnji sadržaj |

Statusi pojedinačnih `checks` su `unreviewed`, `needs-expert`, `reviewed` ili opravdano `not-applicable`. Ukupno `reviewed` zahteva završene sve provere i autora/datum/dokaz/nalaz/ponovnu proveru. Pravni pregled zahteva povezan izvor, osim izričito obrazloženog slučaja bez pravne tvrdnje. Samostalna kartica i pitanje imaju zasebne zapise: zatvaranje kartice ne označava automatski sva pitanja kao pregledana.

## Registar izvora

`izvori.json` sadrži `schemaVersion: 1` i niz `sources`. Svaka stvarno proverena stavka ima `id` (stabilan naziv), javni `url`, `title`, `article`, `checkedOn` (YYYY-MM-DD) i `revision` (jasno imenovanu verziju/izmene propisa). Opciono `contentHash` sadrži SHA-256 sačuvanog javnog izvornog dokumenta. Ne unositi kredencijale, lične identifikatore ili privatne URL-ove.

Registar počinje prazan. Alat ne posećuje URL-ove i ne zna da li je zakon u međuvremenu izmenjen. Recenzent to proverava u primarnom izvoru i ažurira registar; promena registrovane stavke menja otiske vezanih pitanja/kartica i poništava njihove aktuelne preglede. Ako postoje nerešene razlike, ostaviti `needs-expert` i opisati šta nedostaje.

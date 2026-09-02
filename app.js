/* Возачки А — локална вежбаоница над званичном базом (eUprava practice, GUID za A kategoriju). */
(function () {
  'use strict';

  // Svaka neuhvaćena greška se prikazuje u crvenoj traci na vrhu — umesto neme prazne stranice.
  window.addEventListener('unhandledrejection', (e) => {
    window.dispatchEvent(new ErrorEvent('error', { message: 'Neuhvaćena greška: ' + (e.reason && e.reason.message || e.reason) }));
  });
  window.addEventListener('error', (e) => {
    try {
      let b = document.getElementById('errStrip');
      if (!b) {
        b = document.createElement('div');
        b.id = 'errStrip';
        b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#b91c1c;color:#fff;padding:8px 14px;font:13px monospace;white-space:pre-wrap';
        document.documentElement.appendChild(b);
      }
      b.textContent = 'Greška: ' + (e.message || e.type) + (e.filename ? '  @ ' + e.filename.split('/').pop() + ':' + e.lineno : '');
    } catch (ignore) { /* ništa */ }
  });

  const D = window.QUIZ;
  const Q = D.questions;                       // već sortirano: oblast → podoblast → qId
  const byId = new Map(Q.map((q) => [q.id, q]));
  const catName = new Map(D.cats.map((c) => [c.id, c]));
  const CATS = D.cats.filter((c) => Q.some((q) => q.cat === c.id));
  const DAY = 24 * 60 * 60 * 1000;
  const one = (n) => n % 10 === 1 && n % 100 !== 11;   // srpski: 1, 21, 31... "pitanje/dan"
  const poeni = (n) => n + ' ' + (one(n) ? L('pointsOne') : L('points'));   // "1 poen", "2 poena"
  const localDay = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  // Ponavljanje se zakazuje za POČETAK dana (00:00), da bi "sutra" zaista značilo sutra ujutru,
  // a ne 24 sata od trenutka odgovaranja.
  const pocetakDanaZa = (zaDana) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + zaDana); return d.getTime(); };

  // ---------- Prevodi UI ----------
  const STR = {
    brand: { l: 'Vozački A', c: 'Возачки А' },
    home: { l: 'Početna', c: 'Почетна' },
    learn: { l: 'Učenje redom', c: 'Учење редом' },
    drill: { l: 'Ponavljanje', c: 'Понављање' },
    marked: { l: 'Obeležena pitanja', c: 'Обележена питања' },
    sim: { l: 'Simulacija ispita', c: 'Симулација испита' },
    simSub: { l: '41 pitanje · 45 min · prag 85%', c: '41 питање · 45 мин · праг 85%' },
    stats: { l: 'Statistika', c: 'Статистика' },
    statsSub: { l: 'oblasti i najslabije tačke', c: 'области и најслабије тачке' },
    cats: { l: 'Oblasti — klikni za spisak pitanja i vežbanje', c: 'Области — кликни за списак питања и вежбање' },
    question: { l: 'Pitanje', c: 'Питање' },
    qNumTip: { l: 'Zvanični broj pitanja u MUP bazi (isti broj važi i na eUpravi)', c: 'Званични број питања у МУП бази (исти број важи и на еУправи)' },
    points: { l: 'poena', c: 'поена' },
    pointsOne: { l: 'poen', c: 'поен' },
    chooseN: { l: 'Izaberite odgovora:', c: 'Изаберите одговора:' },
    confirm: { l: 'Odgovori', c: 'Одговори' },
    next: { l: 'Sledeće pitanje', c: 'Следеће питање' },
    skip: { l: 'Preskoči', c: 'Прескочи' },
    prev: { l: 'Prethodno', c: 'Претходно' },
    correct: { l: 'Tačno!', c: 'Тачно!' },
    wrong: { l: 'Netačno.', c: 'Нетачно.' },
    correctIs: { l: 'Tačan odgovor je označen zelenim.', c: 'Тачан одговор је означен зеленим.' },
    mark: { l: 'Obeleži pitanje', c: 'Обележи питање' },
    tacnoLbl: { l: 'tačno', c: 'тачно' },
    osveziLbl: { l: 'za osvežavanje', c: 'за освежавање' },
    osveziBtn: { l: '🔄 Osveži znanje', c: '🔄 Освежи знање' },
    osveziTip: { l: 'Utvrđena pitanja koja nisi video duže od 21 dan. Tačan odgovor ih vraća na počinak; pogrešan ih vraća u red za ponavljanje.', c: 'Утврђена питања која ниси видео дуже од 21 дан. Тачан одговор их враћа на починак; погрешан их враћа у ред за понављање.' },
    osveziTitle: { l: 'Osvežavanje', c: 'Освежавање' },
    netacnoLbl: { l: 'netačno', c: 'нетачно' },
    today: { l: 'danas', c: 'данас' },
    yesterday: { l: 'juče', c: 'јуче' },
    daysAgo: { l: 'pre # dana', c: 'пре # дана' },
    ofQ: { l: 'od', c: 'од' },
    inQueue: { l: 'za ponavljanje', c: 'за понављање' },
    ready: { l: 'spremno', c: 'спремно' },
    waiting: { l: 'čeka', c: 'чека' },
    waitInfo: { l: 'Sva spremna pitanja si prošao. # pitanja čeka svoj termin (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Сва спремна питања си прошао. # питања чека свој термин (размакнуто понављање: сутра, па за 3 дана).' },
    drillWaitingBtn: { l: 'Vežbaj i ona koja čekaju', c: 'Вежбај и она која чекају' },
    drillEmpty: { l: 'Nema pitanja za ponavljanje — sve što si grešio je utvrđeno. 💪', c: 'Нема питања за понављање — све што си грешио је утврђено. 💪' },
    markedEmpty: { l: 'Nema obeleženih pitanja. Obeleži pitanje kvačicom dok vežbaš.', c: 'Нема обележених питања. Обележи питање квачицом док вежбаш.' },
    finishSim: { l: 'Završi ispit', c: 'Заврши испит' },
    simLeaveConfirm: { l: 'Napustiti simulaciju? Odgovori iz nje NEĆE biti sačuvani niti računati.', c: 'Напустити симулацију? Одговори из ње НЕЋЕ бити сачувани нити рачунати.' },
    passed: { l: 'POLOŽIO', c: 'ПОЛОЖИО' },
    failed: { l: 'NIJE POLOŽENO', c: 'НИЈЕ ПОЛОЖЕНО' },
    threshold: { l: 'prag', c: 'праг' },
    simWrongTitle: { l: 'Pogrešna i neodgovorena pitanja', c: 'Погрешна и неодговорена питања' },
    perCat: { l: 'Po oblastima', c: 'По областима' },
    backHome: { l: 'Na početnu', c: 'На почетну' },
    newSim: { l: 'Nova simulacija', c: 'Нова симулација' },
    history: { l: 'Simulacije do sada', c: 'Симулације до сада' },
    noSims: { l: 'Još nijedna simulacija.', c: 'Још ниједна симулација.' },
    statsTitle: { l: 'Tačnost po oblastima', c: 'Тачност по областима' },
    statExpand: { l: 'Klikni za raspis po podoblastima', c: 'Кликни за распис по подобластима' },
    catExpand: { l: 'Prikaži podoblasti', c: 'Прикажи подобласти' },
    catOpen: { l: 'Otvori oblast (spisak pitanja i vežbanje)', c: 'Отвори област (списак питања и вежбање)' },
    tour1: { l: 'Tvoj napredak u brojkama: koliko si odgovorio, koliko pogrešnih čeka ponavljanje i koliko si obeležio.', c: 'Твој напредак у бројкама: колико си одговорио, колико погрешних чека понављање и колико си обележио.' },
    tour2: { l: 'Odavde kreće učenje: sva pitanja redom, sa objašnjenjem posle svakog odgovora.', c: 'Одавде креће учење: сва питања редом, са објашњењем после сваког одговора.' },
    tour3: { l: 'Pogrešna pitanja se sama vraćaju: odmah, pa sutradan, pa za tri dana — dok ih ne savladaš.', c: 'Погрешна питања се сама враћају: одмах, па сутрадан, па за три дана — док их не савладаш.' },
    tour4: { l: 'Simulacija je verna kopija pravog ispita: 41 pitanje, 45 minuta, prag 85%. Ostavi je za kraj pripreme.', c: 'Симулација је верна копија правог испита: 41 питање, 45 минута, праг 85%. Остави је за крај припреме.' },
    tour5: { l: 'Oblasti: klik na red otklapa podoblasti, pa vežbaš baš ono što ti treba.', c: 'Области: клик на ред отклапа подобласти, па вежбаш баш оно што ти треба.' },
    tour6: { l: 'Pojmovnik: tematske kartice sa slikama i tabelama. Iste kartice iskaču i uz pitanja na koja se odnose.', c: 'Појмовник: тематске картице са сликама и табелама. Исте картице искачу и уз питања на која се односе.' },
    tour7: { l: 'Napredak se čuva u ovom pregledaču. Ovde ga izvezi u fajl ili poveži stalno čuvanje — uradi to odmah, za svaki slučaj.', c: 'Напредак се чува у овом прегледачу. Овде га извези у фајл или повежи стално чување — уради то одмах, за сваки случај.' },
    tourNext: { l: 'Dalje', c: 'Даље' },
    tourSkip: { l: 'Preskoči', c: 'Прескочи' },
    tourDone: { l: 'Završi', c: 'Заврши' },
    tourReplay: { l: 'Vodič kroz aplikaciju', c: 'Водич кроз апликацију' },
    guideTitle: { l: '🎓 Kako da učiš — predloženi redosled', c: '🎓 Како да учиш — предложени редослед' },
    guideSub: { l: 'za one koji kreću iz početka; ako već imaš predznanje, slobodno preskoči', c: 'за оне који крећу из почетка; ако већ имаш предзнање, слободно прескочи' },
    guideOpen: { l: 'Prikaži', c: 'Прикажи' },
    feedback: { l: 'Prijavi grešku ili predlog', c: 'Пријави грешку или предлог' },

    trustTitle: { l: '🛡️ Zašto verovati ovoj vežbaonici', c: '🛡️ Зашто веровати овој вежбаоници' },
    trustBody: { l: `<ul class="trustList">
      <li><b>Baza je zvanična.</b> Svih 1327 pitanja, odgovora i slika dolazi sa eUprava servisa za kandidate (MUP). Poslednja provera: <b>29. 8. 2026.</b> — nula izmena.</li>
      <li><b>Simulacija je merena, ne "po osećaju".</b> Sastav testa je upoređen sa <b>šest zvaničnih izvlačenja</b> pravog ispita i identičan je do poslednjeg poena (41 pitanje, 98 poena, ista matrica oblasti).</li>
      <li><b>Objašnjenja su pisana ručno</b>, uz doslovnu proveru ZOBS-a i Pravilnika, sa brojem člana — i nezavisno recenzirana. Tamo gde se ispitna baza razilazi sa važećim zakonom, to otvoreno piše.</li>
      <li><b>Kôd je javan.</b> Sve što aplikacija radi može da se proveri: <a href="https://github.com/MilanMilojevic/vozacki-a" target="_blank" rel="noopener">github.com/MilanMilojevic/vozacki-a</a>.</li>
      <li><b>Privatnost:</b> bez naloga, bez reklama; napredak ostaje samo na tvom uređaju. Meri se jedino anoniman broj poseta (bez kolačića; poštuje se „Do Not Track").</li>
    </ul>`, c: `<ul class="trustList">
      <li><b>База је званична.</b> Свих 1327 питања, одговора и слика долази са еУправа сервиса за кандидате (МУП). Последња провера: <b>29. 8. 2026.</b> — нула измена.</li>
      <li><b>Симулација је мерена, не „по осећају".</b> Састав теста је упоређен са <b>шест званичних извлачења</b> правог испита и идентичан је до последњег поена (41 питање, 98 поена, иста матрица области).</li>
      <li><b>Објашњења су писана ручно</b>, уз дословну проверу ЗОБС-а и Правилника, са бројем члана — и независно рецензирана. Тамо где се испитна база разилази са важећим законом, то отворено пише.</li>
      <li><b>Кôд је јаван.</b> Све што апликација ради може да се провери: <a href="https://github.com/MilanMilojevic/vozacki-a" target="_blank" rel="noopener">github.com/MilanMilojevic/vozacki-a</a>.</li>
      <li><b>Приватност:</b> без налога, без реклама; напредак остаје само на твом уређају. Мери се једино анониман број посета (без колачића; поштује се „Do Not Track").</li>
    </ul>` },
    iosHint: { l: '📲 Dodaj vežbaonicu na početni ekran: dugme <b>Deli</b> (kvadrat sa strelicom) → <b>Dodaj na početni ekran</b>. Radi i bez interneta.', c: '📲 Додај вежбаоницу на почетни екран: дугме <b>Дели</b> (квадрат са стрелицом) → <b>Додај на почетни екран</b>. Ради и без интернета.' },
    installBtn: { l: '📲 Instaliraj kao aplikaciju', c: '📲 Инсталирај као апликацију' },
    linkCopied: { l: 'kopirano ✓', c: 'копирано ✓' },
    offline: { l: 'Bez interneta — vežbanje radi i dalje, sve je sačuvano na uređaju.', c: 'Без интернета — вежбање ради и даље, све је сачувано на уређају.' },
    streakDani: { l: 'dan učenja zaredom', c: 'дан учења заредом' },
    examDateLabel: { l: 'Datum ispita (za odbrojavanje):', c: 'Датум испита (за одбројавање):' },
    examIn: { l: 'do ispita', c: 'до испита' },
    examDays: { l: 'dana', c: 'дана' },
    examDaysOne: { l: 'dan', c: 'дан' },
    examToday: { l: '📅 ispit je danas — srećno!', c: '📅 испит је данас — срећно!' },
    examPlan: { l: 'predlog tempa: ~# novih pitanja dnevno', c: 'предлог темпа: ~# нових питања дневно' },
    examPlanOne: { l: 'predlog tempa: ~# novo pitanje dnevno', c: 'предлог темпа: ~# ново питање дневно' },
    imgFail: { l: 'Slika nije dostupna bez interneta — otvori ovo pitanje kad budeš na mreži pa ostaje sačuvana.', c: 'Слика није доступна без интернета — отвори ово питање кад будеш на мрежи па остаје сачувана.' },
    planPonavljanja: { l: 'ponavljanja danas: #', c: 'понављања данас: #' },
    planSim: { l: 'predlog: uradi simulaciju danas', c: 'предлог: уради симулацију данас' },
    planSimNedelja: { l: 'poslednja nedelja — po jedna simulacija dnevno', c: 'последња недеља — по једна симулација дневно' },
    endTitle: { l: 'Kraj spiska — prošao si # &.', c: 'Крај списка — прошао си # &.' },
    pitanjeJd: { l: 'pitanje', c: 'питање' },
    pitanjaMn: { l: 'pitanja', c: 'питања' },
    endWrongBtn: { l: '🔁 Ponovi pogrešna iz ovog spiska (#)', c: '🔁 Понови погрешна из овог списка (#)' },
    endNextSub: { l: 'Sledeća podoblast: #', c: 'Следећа подобласт: #' },
    endNextCat: { l: 'Sledeća oblast: #', c: 'Следећа област: #' },
    endQueue: { l: 'Ponavljanje čeka: # spremno', c: 'Понављање чека: # спремно' },
    endAllClear: { l: 'Red za ponavljanje je potpuno prazan — sve što si učio je utvrđeno. 🎉', c: 'Ред за понављање је потпуно празан — све што си учио је утврђено. 🎉' },
    endSimBtn: { l: '🏁 Simulacija ispita', c: '🏁 Симулација испита' },
    naIspitu: { l: 'na ispitu: #', c: 'на испиту: #' },
    shareBtn: { l: '📷 Sačuvaj sliku rezultata', c: '📷 Сачувај слику резултата' },
    shareTitle: { l: 'Simulacija ispita — A kategorija', c: 'Симулација испита — А категорија' },
    shareFail: { l: 'Slika nije mogla da se napravi', c: 'Слика није могла да се направи' },
    freeNote: { l: 'besplatna vežbaonica', c: 'бесплатна вежбаоница' },
    fsSmaller: { l: 'Smanji slova', c: 'Смањи слова' },
    fsBigger: { l: 'Povećaj slova', c: 'Повећај слова' },
    close: { l: 'Zatvori', c: 'Затвори' },
    grupaNapredak: { l: 'Napredak', c: 'Напредак' },
    grupaAplikacija: { l: 'Aplikacija', c: 'Апликација' },
    grupaOprezno: { l: 'Oprezno', c: 'Опрезно' },
    resetNapomena: { l: 'Briše sve na ovom uređaju: odgovore, obeležena pitanja, simulacije i dnevni cilj. Ne može da se poništi.', c: 'Брише све на овом уређају: одговоре, обележена питања, симулације и дневни циљ. Не може да се поништи.' },
    podnozjeOpis: { l: 'Besplatna vežbaonica za teorijski ispit, A kategorija. Bez reklama, bez naloga i bez plaćanja.', c: 'Бесплатна вежбаоница за теоријски испит, А категорија. Без реклама, без налога и без плаћања.' },
    podnozjeBaza: { l: 'Zvanična baza eUprave · @1 pitanja · izvučena @2 · poslednja provera 29.08.2026 · verzija @3', c: 'Званична база еУправе · @1 питања · извучена @2 · последња провера 29.08.2026 · верзија @3' },
    podnozjePrivatnost: { l: 'Napredak ostaje na tvom uređaju. Ništa se ne šalje i ništa se ne čuva kod nas.', c: 'Напредак остаје на твом уређају. Ништа се не шаље и ништа се не чува код нас.' },
    podnozjeKod: { l: 'Kôd na GitHub-u', c: 'Кôд на GitHub-у' },
    datumLos: { l: 'Datum nije potpun. Unesi ga u obliku dan-mesec-godina, sa punom godinom (npr. 2026).', c: 'Датум није потпун. Унеси га у облику дан-месец-година, са пуном годином (нпр. 2026).' },
    datumOpseg: { l: 'Godina mora biti između @1. i @2. Ako si otkucao samo dve cifre, dopiši punu godinu.', c: 'Година мора бити између @1. и @2. Ако си откуцао само две цифре, допиши пуну годину.' },
    datumProslost: { l: 'Taj datum je prošao. Unesi datum ispita koji tek dolazi, ili obriši polje ako ne želiš odbrojavanje.', c: 'Тај датум је прошао. Унеси датум испита који тек долази, или обриши поље ако не желиш одбројавање.' },
    importPrevelik: { l: 'Ta datoteka je prevelika da bi bila sačuvan napredak. Izaberi datoteku koju je napravilo dugme „Sačuvaj napredak (fajl)".', c: 'Та датотека је превелика да би била сачуван напредак. Изабери датотеку коју је направило дугме „Сачувај напредак (фајл)".' },
    importDeo: { l: 'Uvezeno je # od @ zapisa. Ostali se ne nalaze u trenutnoj bazi pitanja, pa su izostavljeni.', c: 'Увезено је # од @ записа. Остали се не налазе у тренутној бази питања, па су изостављени.' },
    saveFail: { l: '⚠ Napredak ne može da se sačuva u ovom pregledaču — nestaće kad zatvoriš stranicu. Proveri da li su podaci sajta blokirani, ili sačuvaj napredak u datoteku preko „Sačuvaj napredak (fajl)".', c: '⚠ Напредак не може да се сачува у овом прегледачу — нестаће кад затвориш страницу. Провери да ли су подаци сајта блокирани, или сачувај напредак у датотеку преко „Сачувај напредак (фајл)".' },
    tabUpozorenje: { l: '⚠ Vežbaonica je otvorena u još jednom prozoru ili kartici. Rad u dva prozora se ne spaja — onaj koji poslednji sačuva prepisuje drugog. Zatvori jedan, pa osveži ovaj.', c: '⚠ Вежбаоница је отворена у још једном прозору или картици. Рад у два прозора се не спаја — онај који последњи сачува преписује другог. Затвори један, па освежи овај.' },
    fsMin: { l: 'Slova su već na najmanjoj veličini', c: 'Слова су већ на најмањој величини' },
    fsMax: { l: 'Slova su već na najvećoj veličini', c: 'Слова су већ на највећој величини' },
    planNaslov: { l: 'Dnevni cilj', c: 'Дневни циљ' },
    planNovih: { l: 'novih pitanja dnevno', c: 'нових питања дневно' },
    planPon: { l: 'ponavljanja dnevno', c: 'понављања дневно' },
    planSacuvaj: { l: 'Sačuvaj cilj', c: 'Сачувај циљ' },
    planIskljuci: { l: 'Ugasi cilj', c: 'Угаси циљ' },
    planPredlozi: { l: 'Predloži mi', c: 'Предложи ми' },
    planSacuvan: { l: 'Dnevni cilj je sačuvan.', c: 'Дневни циљ је сачуван.' },
    planUgasen: { l: 'Dnevni cilj je ugašen.', c: 'Дневни циљ је угашен.' },
    planIspunjen: { l: '✅ Dnevni cilj je ispunjen — vidimo se sutra.', c: '✅ Дневни циљ је испуњен — видимо се сутра.' },
    planVezbaj: { l: '▶ Vežbaj po planu', c: '▶ Вежбај по плану' },
    planNemaSta: { l: 'Za danas nema više — cilj je ispunjen.', c: 'За данас нема више — циљ је испуњен.' },
    planNemaDostupnih: { l: 'Nema više pitanja koja čekaju. Cilj ostaje za sutra.', c: 'Нема више питања која чекају. Циљ остаје за сутра.' },
    planBezDatuma: { l: 'Za predlog prvo unesi datum ispita, ispod.', c: 'За предлог прво унеси датум испита, испод.' },
    planDatumProsao: { l: 'Datum ispita je prošao — unesi novi da bih mogao da računam.', c: 'Датум испита је прошао — унеси нови да бих могао да рачунам.' },
    planPredlogGotov: { l: 'Predlog je upisan. Novo gradivo se završava # dana pre ispita — ti dani ostaju za ponavljanje i simulacije. Ako ti odgovara, sačuvaj.', c: 'Предлог је уписан. Ново градиво се завршава # дана пре испита — ти дани остају за понављање и симулације. Ако ти одговара, сачувај.' },
    planPredlogUsko: { l: 'Predlog je upisan. Ispit je blizu, pa nema rezerve — novo gradivo ide do poslednjeg dana.', c: 'Предлог је уписан. Испит је близу, па нема резерве — ново градиво иде до последњег дана.' },
    planPuno: { l: 'Sačuvano — ali # pitanja dnevno je puno. Računaj oko pola sata na svakih 100 pitanja. Uvek možeš da smanjiš.', c: 'Сачувано — али # питања дневно је пуно. Рачунај око пола сата на сваких 100 питања. Увек можеш да смањиш.' },
    installWhatTitle: { l: '📲 Šta dobijam ako je dodam kao aplikaciju?', c: '📲 Шта добијам ако је додам као апликацију?' },
    installWhatBody: {
      l: `<ul>
        <li><b>Više ekrana za pitanja.</b> Otvara se u svom prozoru, bez adresne trake — na telefonu je to oko desetine ekrana više.</li>
        <li><b>Svoja ikona.</b> Stoji na početnom ekranu kao svaka druga aplikacija; ne moraš da tražiš karticu u pregledaču.</li>
        <li><b>Sigurnije radi bez interneta.</b> Pitanja i objašnjenja su već na uređaju, a slike se čuvaju kako ih otvaraš.</li>
        </ul>
        <p><b>Šta se NE menja:</b> to je i dalje isti sajt — isti napredak, ista pitanja. Ništa se ne preuzima iz prodavnice i ništa se ne upisuje u sistem. Kad god hoćeš, obrišeš ikonu i nisi izgubio ništa.</p>
        <p><b>Kako:</b> na Androidu, u pregledaču Chrome → meni ⋮ → „Dodaj na početni ekran". Na iPhone-u, u pregledaču Safari → dugme „Podeli" → „Add to Home Screen".</p>`,
      c: `<ul>
        <li><b>Више екрана за питања.</b> Отвара се у свом прозору, без адресне траке — на телефону је то око десетине екрана више.</li>
        <li><b>Своја икона.</b> Стоји на почетном екрану као свака друга апликација; не мораш да тражиш картицу у прегледачу.</li>
        <li><b>Сигурније ради без интернета.</b> Питања и објашњења су већ на уређају, а слике се чувају како их отвараш.</li>
        </ul>
        <p><b>Шта се НЕ мења:</b> то је и даље исти сајт — исти напредак, иста питања. Ништа се не преузима из продавнице и ништа се не уписује у систем. Кад год хоћеш, обришеш икону и ниси изгубио ништа.</p>
        <p><b>Како:</b> на Андроиду, у прегледачу Chrome → мени ⋮ → „Додај на почетни екран". На iPhone-у, у прегледачу Safari → дугме „Подели" → „Add to Home Screen".</p>`,
    },
    planSveOdgovoreno: { l: 'nema više novih', c: 'нема више нових' },
    planObjasnjenje: { l: 'Ostavi oba polja prazna ako ne želiš cilj. Kad ga postaviš, dugme na početnoj daje tačno toliko pitanja — prvo ponavljanja, pa nova. U ponavljanja ulaze i pogrešna pitanja i ona koja si pogodio iz prve (ta dobiju jednu potvrdu posle 3 dana). Ako spremnih nema dovoljno, kvota se dopunjava utvrđenim pitanjima koja nisi video duže od 21 dan.', c: 'Остави оба поља празна ако не желиш циљ. Кад га поставиш, дугме на почетној даје тачно толико питања — прво понављања, па нова. У понављања улазе и погрешна питања и она која си погодио из прве (та добију једну потврду после 3 дана). Ако спремних нема довољно, квота се допуњава утврђеним питањима која ниси видео дуже од 21 дан.' },
    novihLbl: { l: 'novih', c: 'нових' },
    ponLbl: { l: 'ponavljanja', c: 'понављања' },
    unosPrazno: { l: 'Unesi ceo broj od @1 do @2.', c: 'Унеси цео број од @1 до @2.' },
    unosSamoCifre: { l: 'Dozvoljene su samo cifre — bez slova, razmaka i zareza. Unesi ceo broj od @1 do @2.', c: 'Дозвољене су само цифре — без слова, размака и зареза. Унеси цео број од @1 до @2.' },
    unosPremalo: { l: 'Najmanje što može da se unese je @1.', c: 'Најмање што може да се унесе је @1.' },
    unosPreveliko: { l: 'Toliko ih nema — najviše je @2.', c: 'Толико их нема — највише је @2.' },
    skokVanOpsega: { l: 'Ovaj spisak ima @2 pitanja. Unesi broj od @1 do @2.', c: 'Овај списак има @2 питања. Унеси број од @1 до @2.' },
    planMaxNovih: { l: 'Neodgovorenih je ostalo @2 — više od toga ne može stati u jedan dan.', c: 'Неодговорених је остало @2 — више од тога не може стати у један дан.' },
    officialBase: { l: 'zvanična baza pitanja', c: 'званична база питања' },
    naIspituTip: { l: 'Koliko pitanja iz ove podoblasti nosi svaki pravi ispit — izmereno iz pet zvaničnih izvlačenja simulacije.', c: 'Колико питања из ове подобласти носи сваки прави испит — измерено из пет званичних извлачења симулације.' },
    qNumTip2: { l: 'Klik: kopiraj adresu ovog pitanja', c: 'Клик: копирај адресу овог питања' },
    imgAlt: { l: 'Slika uz pitanje — saobraćajna situacija ili znak; pitanje se odnosi na ono što je na slici.', c: 'Слика уз питање — саобраћајна ситуација или знак; питање се односи на оно што је на слици.' },
    grp1: { l: '1 · Osnovni pojmovi', c: '1 · Основни појмови' },
    grp2: { l: '2 · Ko ide prvi — prvenstvo i signalizacija', c: '2 · Ко иде први — првенство и сигнализација' },
    grp3: { l: '3 · Radnje vozilom', c: '3 · Радње возилом' },
    grp4: { l: '4 · Posebne situacije', c: '4 · Посебне ситуације' },
    grp5: { l: '5 · Propisi, dozvole i posledice', c: '5 · Прописи, дозволе и последице' },
    guideHide: { l: 'Sakrij', c: 'Сакриј' },
    guideBody: { l: `<ol class="guideList">
      <li><b>Prvo pojmovi, pa pravila.</b> U Pojmovniku pročitaj redom: <i>Slični pojmovi</i> (šta je preticanje a šta obilaženje, odstojanje vs rastojanje), <i>Put, kolovoz, trake</i> i <i>Kategorije vozila</i>. Bez tih reči ostalo gradivo zvuči kao strani jezik.</li>
      <li><b>Ko ide prvi.</b> Kartice <i>Prvenstvo prolaza</i>, <i>Semafori</i> i <i>Porodice saobraćajnih znakova</i> — to je srce ispita i najviše pitanja.</li>
      <li><b>Radnje vozilom.</b> <i>Skretanje i prestrojavanje</i>, <i>Preticanje i obilaženje</i>, <i>Zaustavljanje i parkiranje</i>, <i>Pokazivači pravca</i>, <i>Upotreba svetala</i>.</li>
      <li><b>Posebne situacije.</b> <i>Pešaci i dvotočkaši</i>, <i>Prelaz preko pruge</i>, <i>Autoput i motoput</i>, <i>Vozila pod pratnjom</i>, <i>Postupak kod nezgode</i>.</li>
      <li><b>Tek onda pitanja.</b> Kreni na <i>Sva pitanja</i> i idi redom — posle svakog odgovora pročitaj objašnjenje, i kad pogrešiš i kad pogodiš.</li>
      <li><b>Pusti aplikaciju da te vodi.</b> U <i>Ponavljanje</i> se sama vraćaju pogrešna pitanja (odmah, pa sutradan, pa za tri dana) — ali i pitanja tačna iz prve, jednom posle tri dana: jedan pogodak još nije zapamćeno.</li>
      <li><b>Simulacije na kraju.</b> Kad u Statistici procena pređe prag, radi <i>Simulaciju ispita</i> — 41 pitanje, 45 minuta, kao pravi ispit. Posle svake pregledaj greške.</li>
    </ol>
    <p class="mut">Kaznene mere uči poslednje i bez učenja iznosa napamet — u zvaničnom ispitu za A kategoriju te oblasti nema.</p>`,
      c: `<ol class="guideList">
      <li><b>Прво појмови, па правила.</b> У Појмовнику прочитај редом: <i>Слични појмови</i> (шта је претицање а шта обилажење, одстојање vs растојање), <i>Пут, коловоз, траке</i> и <i>Категорије возила</i>. Без тих речи остало градиво звучи као страни језик.</li>
      <li><b>Ко иде први.</b> Картице <i>Првенство пролаза</i>, <i>Семафори</i> и <i>Породице саобраћајних знакова</i> — то је срце испита и највише питања.</li>
      <li><b>Радње возилом.</b> <i>Скретање и престројавање</i>, <i>Претицање и обилажење</i>, <i>Заустављање и паркирање</i>, <i>Показивачи правца</i>, <i>Употреба светала</i>.</li>
      <li><b>Посебне ситуације.</b> <i>Пешаци и двоточкаши</i>, <i>Прелаз преко пруге</i>, <i>Аутопут и мотопут</i>, <i>Возила под пратњом</i>, <i>Поступак код незгоде</i>.</li>
      <li><b>Тек онда питања.</b> Крени на <i>Сва питања</i> и иди редом — после сваког одговора прочитај објашњење, и кад погрешиш и кад погодиш.</li>
      <li><b>Пусти апликацију да те води.</b> У <i>Понављање</i> се сама враћају погрешна питања (одмах, па сутрадан, па за три дана) — али и питања тачна из прве, једном после три дана: један погодак још није запамћено.</li>
      <li><b>Симулације на крају.</b> Кад у Статистици процена пређе праг, ради <i>Симулацију испита</i> — 41 питање, 45 минута, као прави испит. После сваке прегледај грешке.</li>
    </ol>
    <p class="mut">Казнене мере учи последње и без учења износа напамет — у званичном испиту за А категорију те области нема.` },
    updNote: { l: 'Stigla je nova verzija aplikacije.', c: 'Стигла је нова верзија апликације.' },
    updBtn: { l: 'Osveži', c: 'Освежи' },
    updRepoTitle: { l: 'Postoji novija verzija aplikacije', c: 'Постоји новија верзија апликације' },
    updRepoBody: { l: 'Imaš verziju #A, a objavljena je #B. Preuzmi novu i prekopiraj preko postojeće fascikle — tvoj napredak ostaje netaknut (čuva se u pregledaču).', c: 'Имаш верзију #A, а објављена је #B. Преузми нову и прекопирај преко постојеће фасцикле — твој напредак остаје нетакнут (чува се у прегледачу).' },
    updRepoGet: { l: 'Preuzmi novu verziju', c: 'Преузми нову верзију' },
    updRepoLater: { l: 'Ne sad', c: 'Не сад' },
    updRepoCheck: { l: 'Proveri ima li novije verzije', c: 'Провери има ли новије верзије' },
    updRepoNone: { l: 'Imaš najnoviju verziju (#A).', c: 'Имаш најновију верзију (#A).' },
    updRepoFail: { l: 'Provera nije uspela (nema veze sa internetom ili je izvor nedostupan).', c: 'Провера није успела (нема везе са интернетом или је извор недоступан).' },
    updRepoOff: { l: 'Ne proveravaj automatski', c: 'Не проверавај аутоматски' },
    weakTitle: { l: 'Najslabije podoblasti (min. 3 odgovora)', c: 'Најслабије подобласти (мин. 3 одговора)' },
    thArea: { l: 'Oblast', c: 'Област' },
    thQ: { l: 'Pitanja', c: 'Питања' },
    thSeen: { l: 'Odgovarano', c: 'Одговарано' },
    thAcc: { l: 'Tačnost', c: 'Тачност' },
    export: { l: 'Sačuvaj napredak (fajl)', c: 'Сачувај напредак (фајл)' },
    import: { l: 'Učitaj napredak', c: 'Учитај напредак' },
    reset: { l: 'Obriši sav napredak', c: 'Обриши сав напредак' },
    resetConfirm: { l: 'Sigurno obrisati SAV napredak?', c: 'Сигурно обрисати САВ напредак?' },
    persistNote: { l: 'Napredak preživljava restart browsera i računara; briše ga samo „brisanje podataka pregledanja". Za svaki slučaj poveži fajl za automatski upis.', c: 'Напредак преживљава рестарт браузера и рачунара; брише га само „брисање података прегледања". За сваки случај повежи фајл за аутоматски упис.' },
    backupConnect: { l: '🔗 Poveži fajl za automatsko čuvanje', c: '🔗 Повежи фајл за аутоматско чување' },
    backupResume: { l: 'Nastavi automatsko čuvanje u fajl', c: 'Настави аутоматско чување у фајл' },
    backupOn: { l: 'Automatski se čuva u', c: 'Аутоматски се чува у' },
    backupNA: { l: '(automatski upis u fajl nije podržan u ovom browseru — koristi dugme za ručno čuvanje)', c: '(аутоматски упис у фајл није подржан у овом браузеру — користи дугме за ручно чување)' },
    answered: { l: 'odgovoreno', c: 'одговорено' },
    continueBtn: { l: 'Nastavi', c: 'Настави' },
    startBtn: { l: 'Počni', c: 'Почни' },
    goto: { l: 'Idi', c: 'Иди' },
    podoblasti: { l: 'Podoblasti', c: 'Подобласти' },
    allQuestions: { l: 'Pitanja', c: 'Питања' },
    onlyWrong: { l: 'Samo pogrešna', c: 'Само погрешна' },
    onlyUnseen: { l: 'Samo neodgovorena', c: 'Само неодговорена' },
    kbHint: { l: 'Prečice: ← → kretanje · 1–9 odgovor · Enter potvrda', c: 'Пречице: ← → кретање · 1–9 одговор · Enter потврда' },
    vezbaj: { l: 'Vežbaj', c: 'Вежбај' },
    vezbajReady: { l: 'Vežbaj spremna', c: 'Вежбај спремна' },
    dueTomorrow: { l: 'sutra', c: 'сутра' },
    dueDays: { l: 'za # dana', c: 'за # дана' },
    allPage: { l: 'Sva pitanja', c: 'Сва питања' },
    allPageSub: { l: 'redom, filteri, spisak', c: 'редом, филтери, списак' },
    fromStart: { l: 'Počni od 1.', c: 'Почни од 1.' },
    shuffleLbl: { l: 'Izmešaj redosled', c: 'Измешај редослед' },
    shuffled: { l: 'mešano', c: 'мешано' },
    ukupno: { l: 'Ukupno', c: 'Укупно' },
    backToList: { l: 'Spisak', c: 'Списак' },
    yourAnswer: { l: 'tvoj odgovor', c: 'твој одговор' },
    correctAnswer: { l: 'tačan odgovor', c: 'тачан одговор' },
    notAnswered: { l: 'Nisi odgovorio na ovo pitanje.', c: 'Ниси одговорио на ово питање.' },
    requiresN: { l: 'Traži # odgovora — priznaje se samo ako su označena SVA tačna.', c: 'Тражи # одговора — признаје се само ако су означена СВА тачна.' },
    correctOnesTitle: { l: 'Tačno odgovorena pitanja', c: 'Тачно одговорена питања' },
    reviewOldNote: { l: 'Starija simulacija — tvoji odgovori nisu bili sačuvani, prikazana su samo pogrešna pitanja sa tačnim odgovorima.', c: 'Старија симулација — твоји одговори нису били сачувани, приказана су само погрешна питања са тачним одговорима.' },
    historyTip: { l: 'Klikni na pokušaj za ceo pregled: svako pitanje, tvoj i tačan odgovor.', c: 'Кликни на покушај за цео преглед: свако питање, твој и тачан одговор.' },
    report: { l: 'Izveštaj', c: 'Извештај' },
    repAnswered: { l: 'Odgovoreno', c: 'Одговорено' },
    repMarked: { l: 'Obeleženo', c: 'Обележено' },
    backToTest: { l: 'Nazad na test', c: 'Назад на тест' },
    prevQ: { l: 'Prethodno pitanje', c: 'Претходно питање' },
    nextQ: { l: 'Sledeće pitanje', c: 'Следеће питање' },
    explTitle: { l: '💡 Objašnjenje', c: '💡 Објашњење' },
    explNote: { l: 'nezvanično objašnjenje, osnov u ZOBS-u', c: 'незванично објашњење, основ у ЗОБС-у' },
    pojmovnik: { l: 'Pojmovnik — tematske kartice', c: 'Појмовник — тематске картице' },
    pojmovnikSub: { l: 'jedna kartica objašnjava celu grupu pitanja; iste kartice iskaču i uz pitanja', c: 'једна картица објашњава целу групу питања; исте картице искачу и уз питања' },
    readyTitle: { l: '🎯 Spremnost za ispit (procena)', c: '🎯 Спремност за испит (процена)' },
    readyNote: { l: 'Ukrštanje tvoje tačnosti sa zvaničnim šablonom testa (41 pitanje, 98 poena, prag 84). Procena je pouzdanija što više vežbaš.', c: 'Укрштање твоје тачности са званичним шаблоном теста (41 питање, 98 поена, праг 84). Процена је поузданија што више вежбаш.' },
    readyLoss: { l: 'Najviše te košta', c: 'Највише те кошта' },
    readyRough: { l: '⚠ gruba procena — još je malo odgovora', c: '⚠ груба процена — још је мало одговора' },
    searchPh: { l: '🔎 Pretraga pitanja (tekst ili #broj)…', c: '🔎 Претрага питања (текст или #број)…' },
    // čuvar je @1, a NE #: u samoj rečenici stoji i doslovno „#broj pitanja"
    searchEmpty: { l: 'Nema pogodaka za „@1". Probaj kraću reč ili #broj pitanja.', c: 'Нема погодака за „@1". Пробај краћу реч или #број питања.' },
    todayLbl: { l: 'Danas', c: 'Данас' },
    okShort: { l: 'tačno', c: 'тачно' },
    shufTip: { l: 'Vežbanje pokrenuto sa ove strane ide nasumičnim redosledom (ne znaš koje je sledeće). Spisak dole ostaje po redu, a „Nastavi" uvek ide redom. Klik na pitanje u spisku: počinje od njega, pa nastavlja izmešano.', c: 'Вежбање покренуто са ове стране иде насумичним редоследом (не знаш које је следеће). Списак доле остаје по реду, а „Настави" увек иде редом. Клик на питање у списку: почиње од њега, па наставља измешано.' },
    queueTip: { l: 'Razmaknuto ponavljanje: pogrešiš → pitanje je odmah spremno; pogodiš ga → vraća se sutra; opet pogodiš → za 3 dana; treći pogodak zaredom → izlazi iz reda. I pitanje koje si pogodio iz prve vraća se jednom, za 3 dana, da se potvrdi — pa izlazi.', c: 'Размакнуто понављање: погрешиш → питање је одмах спремно; погодиш га → враћа се сутра; опет погодиш → за 3 дана; трећи погодак заредом → излази из реда. И питање које си погодио из прве враћа се једном, за 3 дана, да се потврди — па излази.' },
    legend: { l: '✓ utvrđeno · ✗ za ponavljanje · • neodgovoreno · 🔖 obeleženo · 🖼 sa slikom · desno: broj tačnih/netačnih', c: '✓ утврђено · ✗ за понављање · • неодговорено · 🔖 обележено · 🖼 са сликом · десно: број тачних/нетачних' },
    contTip: { l: 'Nastavlja tačno od mesta gde si stao (uvek redom).', c: 'Наставља тачно од места где си стао (увек редом).' },
    qOne: { l: 'pitanje', c: 'питање' },
    waitInfoOne: { l: 'Sva spremna pitanja si prošao. # pitanje čeka svoj termin (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Сва спремна питања си прошао. # питање чека свој термин (размакнуто понављање: сутра, па за 3 дана).' },
    daysAgoOne: { l: 'pre # dan', c: 'пре # дан' },
    dueDaysOne: { l: 'za # dan', c: 'за # дан' },
    simConfirm0: { l: 'Predati test?', c: 'Предати тест?' },
    simConfirmN: { l: 'Predati test? Neodgovorenih: # (nose 0 poena).', c: 'Предати тест? Неодговорених: # (носе 0 поена).' },
    importBad: { l: 'Fajl nije prepoznat kao ispravan napredak — ništa nije promenjeno.', c: 'Фајл није препознат као исправан напредак — ништа није промењено.' },
    importConfirm: { l: 'Učitavanje će ZAMENITI postojeći napredak ovim iz fajla. Nastaviti?', c: 'Учитавање ће ЗАМЕНИТИ постојећи напредак овим из фајла. Наставити?' },
    readyNoData: { l: 'Procena se prikazuje kada odgovoriš na bar 30 pitanja (do sada: #). Uradi prvi krug, pa se vrati ovde.', c: 'Процена се приказује када одговориш на бар 30 питања (до сада: #). Уради први круг, па се врати овде.' },
  };

  // ---------- Stanje ----------
  const KEY = 'vozackiA.v1';
  let S = load();
  // Svako stanje (učitano ili uvezeno) prolazi kroz normalizaciju — nedostajuća polja
  // dobijaju podrazumevane vrednosti, pa ni stari/oštećeni fajl ne može da obori aplikaciju.
  // Pomoćnici: iz nepouzdanog izvora (uvezeni fajl) uzimamo SAMO brojeve u očekivanom
  // opsegu. Time nijedno polje ne može da nosi HTML koji bi se kasnije ispisao u prikaz.
  // (deklaracije funkcija, da budu dostupne i pozivu load() iznad)
  function nInt(v, min, max, def) { return Number.isInteger(v) && v >= min && v <= max ? v : def; }
  function nNum(v, min, max, def) { return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : def; }
  function maxTs() { return 4102444800000; }   // 1.1.2100 — gornja granica za vremenske oznake
  function round2(x) { return Math.round(x * 100) / 100; }   // da se korak od 0,08 ne raspline u 0,8999999
  // Granice veličine slova — JEDNO mesto, koriste ih i dugmad i učitavanje stanja.
  var FS_MIN = 0.9, FS_MAX = 1.25, FS_KORAK = 0.08;

  function normalizeState(obj) {
    if (!obj || typeof obj !== 'object' || !obj.q || typeof obj.q !== 'object' || Array.isArray(obj.q)) return null;

    // napredak po pitanju: samo poznata pitanja i samo brojčana polja
    const q = {};
    for (const [id, r] of Object.entries(obj.q)) {
      if (!/^\d+$/.test(id) || !byId.has(+id)) continue;
      if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
      const rec = {
        a: nInt(r.a, 0, 1e6, 0),
        w: nInt(r.w, 0, 1e6, 0),
        streak: nInt(r.streak, 0, 1e3, 0),
        marked: r.marked ? 1 : 0,
      };
      const due = nNum(r.due, 0, maxTs(), null);
      const last = nNum(r.last, 0, maxTs(), null);
      if (due !== null) rec.due = due;
      if (last !== null) rec.last = last;
      q[id] = rec;
    }

    // simulacije: brojevi i liste identifikatora pitanja
    const sims = (Array.isArray(obj.sims) ? obj.sims : []).slice(0, 500).map((s) => {
      if (!s || typeof s !== 'object' || Array.isArray(s)) return null;
      const ids = (x) => (Array.isArray(x) ? x.filter((v) => Number.isInteger(v) && byId.has(v)).slice(0, 200) : []);
      return {
        d: nNum(s.d, 0, maxTs(), 0),
        score: nInt(s.score, 0, 1000, 0),
        total: nInt(s.total, 0, 1000, 0),
        passed: !!s.passed,
        wrong: ids(s.wrong),
        qs: Array.isArray(s.qs) ? s.qs.slice(0, 200).map((x) => (x && Number.isInteger(x.id) && byId.has(x.id)
          ? { id: x.id, ch: ids(x.ch) } : null)).filter(Boolean) : undefined,
      };
    }).filter(Boolean);

    // pozicije po oblastima: ključ mora biti postojeća oblast/podoblast
    const secPos = {};
    if (obj.secPos && typeof obj.secPos === 'object' && !Array.isArray(obj.secPos)) {
      for (const [k, v] of Object.entries(obj.secPos)) {
        if (!/^[cs]\d+$/.test(k)) continue;
        const p = nInt(v, 0, 1e5, null);
        if (p !== null) secPos[k] = p;
      }
    }

    const dan = obj.day && typeof obj.day === 'object' && !Array.isArray(obj.day)
      && typeof obj.day.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.day.d)
      ? { d: obj.day.d, n: nInt(obj.day.n, 0, 1e5, 0), ok: nInt(obj.day.ok, 0, 1e5, 0),
          novih: nInt(obj.day.novih, 0, 1e5, 0), pon: nInt(obj.day.pon, 0, 1e5, 0) }
      : null;

    // Dnevni cilj (null = ugašen). Granica je ovde namerno široka; pravu granicu —
    // koliko pitanja stvarno postoji — proverava samo polje pri unosu, uz poruku korisniku.
    const planObj = obj.plan && typeof obj.plan === 'object' && !Array.isArray(obj.plan)
      ? { novih: nInt(obj.plan.novih, 1, 5000, null), pon: nInt(obj.plan.pon, 1, 5000, null) }
      : null;
    const plan = planObj && (planObj.novih || planObj.pon) ? planObj : null;

    return {
      script: obj.script === 'c' ? 'c' : 'l',
      seqPos: nInt(obj.seqPos, 0, 1e5, 0),
      q,
      sims,
      secPos,
      lastSec: typeof obj.lastSec === 'string' && /^[cs]\d+$/.test(obj.lastSec) ? obj.lastSec : null,
      theme: obj.theme === 'dark' || obj.theme === 'light' ? obj.theme : null,
      fs: nNum(obj.fs, FS_MIN, FS_MAX, 1),
      day: dan,
      plan,
      tour: obj.tour === 1 ? 1 : 0,
      guide: obj.guide === 1 ? 1 : 0,
      noUpd: obj.noUpd === 1 ? 1 : 0,
      iosSeen: obj.iosSeen === 1 ? 1 : 0,
      streakD: typeof obj.streakD === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.streakD) ? obj.streakD : null,
      streakN: nInt(obj.streakN, 0, 10000, 0),
      examDate: typeof obj.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.examDate) ? obj.examDate : null,
      updSeen: nInt(obj.updSeen, 0, 1e6, 0),
      updAt: nNum(obj.updAt, 0, maxTs(), 0),
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const norm = normalizeState(JSON.parse(raw)); if (norm) return norm; }
    } catch (e) { /* korumpiran zapis — kreni ispočetka */ }
    return normalizeState({ q: {} });
  }
  // Ako pregledač odbije upis (puno skladište, blokirani podaci sajta, strogo blokiranje
  // kolačića), do sada se to videlo SAMO u konzoli: korisnik odradi ceo ispit, vidi rezultat,
  // a ništa nije zapisano — na prvo osvežavanje sve nestane. Zato se sada kaže naglas.
  // Zastavica je obična promenljiva: localStorage u tom trenutku ne radi, a poruka se ne
  // sme ponavljati jer se save() zove na svaki odgovor.
  // Traka namerno NIJE #errStrip — globalni rukovalac greške prepisuje textContent tog
  // istog elementa, pa bi se poruke gazile. Bez focus(): u simulaciji bi to izbacilo
  // korisnika iz odgovaranja.
  function trakaUpozorenja(tekst) {
    try {
      const b = document.createElement('div');
      b.className = 'upozorenjeTraka';
      b.setAttribute('role', 'alert');
      b.appendChild(document.createTextNode(tekst + ' '));
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'zatvoriX';
      x.textContent = L('close');
      x.addEventListener('click', () => b.remove());
      b.appendChild(x);
      // zajednički držač: dve poruke se ređaju jedna iznad druge, ne preko iste tačke
      let drz = document.getElementById('trakeDrzac');
      if (!drz) { drz = document.createElement('div'); drz.id = 'trakeDrzac'; document.body.appendChild(drz); }
      drz.appendChild(b);
    } catch (ignore) { /* ako ni ovo ne prođe, bar ne rušimo aplikaciju */ }
  }
  let upozorenONeuspehu = false;
  function upozoriDaSeNeCuva() {
    if (upozorenONeuspehu) return;
    upozorenONeuspehu = true;
    trakaUpozorenja(L('saveFail'));
  }
  // Dva otvorena prozora: stanje se učita JEDNOM pri pokretanju, pa onaj koji poslednji
  // sačuva prepiše ceo napredak drugog. Namerno NE diramo ni S ni simulaciju u toku —
  // samo kažemo šta se dešava, jednom.
  let upozorenODvaProzora = false;
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || upozorenODvaProzora) return;
    upozorenODvaProzora = true;
    trakaUpozorenja(L('tabUpozorenje'));
  });
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { console.warn('Napredak nije mogao da se sačuva u pregledaču:', e); upozoriDaSeNeCuva(); }
    scheduleBackup();
  }
  function qs(id) { let r = S.q[id]; if (!r) { r = { a: 0, w: 0, streak: 0, marked: 0 }; S.q[id] = r; } return r; }
  // Samo ČITANJE napretka (za prikaz) — ne pravi prazan zapis kao qs().
  const PRAZAN = Object.freeze({ a: 0, w: 0, streak: 0, marked: 0 });
  const qr = (id) => S.q[id] || PRAZAN;

  const L = (k) => STR[k][S.script];
  const T = (obj) => obj[S.script];
  const el = (id) => document.getElementById(id);
  const catOf = (q) => T(catName.get(q.cat));
  const nQ = (n) => n + ' ' + (one(n) ? L('qOne') : L('allQuestions').toLowerCase());
  const subOf = (q) => T({ l: D.subs[q.sub].l, c: D.subs[q.sub].c });
  function escapeHtml(s) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function relTime(ts) {
    const sod = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
    const days = Math.round((sod(Date.now()) - sod(ts)) / DAY);
    if (days <= 0) return L('today');
    if (days === 1) return L('yesterday');
    return (one(days) ? L('daysAgoOne') : L('daysAgo')).replace('#', days);
  }

  // ---------- Beleženje rezultata + razmaknuto ponavljanje ----------
  // Pogrešno → ulazi u red (due odmah). Tačno u redu: 1. put → sutra, 2. put → za 3 dana, 3. put → izlazi.
  // NAPOMENA: ponovni odgovor na isto pitanje (strelicama nazad-napred) NAMERNO se beleži —
  // to je svesna odluka, potvrđena testom u tools/provera-bodovanja.js. Zbog nje pitanje
  // pogrešeno pa odmah ispravljeno može da se utvrdi u istoj sesiji. Ograničenje se ovde
  // NE uvodi bez dogovora, jer menja pravila učenja, a ne ispravlja kvar.
  function record(id, ok) {
    const r = qs(id);
    const prviPut = !r.a;             // pre uvećanja: ovo pitanje se danas radi kao NOVO
    r.a++; r.last = Date.now();
    if (ok) {
      r.streak++;
      if (r.w > 0 && r.streak < 3) r.due = pocetakDanaZa(r.streak === 1 ? 1 : 3);
      else if (r.w === 0 && r.streak === 1) r.due = pocetakDanaZa(3);   // utvrđivanje: druga potvrda za 3 dana
      else delete r.due;                                               // utvrđeno / izašlo iz reda
    } else {
      r.w++; r.streak = 0; r.due = Date.now();
    }
    const today = localDay();
    if (!S.day || S.day.d !== today) S.day = { d: today, n: 0, ok: 0, novih: 0, pon: 0 };
    S.day.n++; if (ok) S.day.ok++;
    if (prviPut) S.day.novih = (S.day.novih || 0) + 1; else S.day.pon = (S.day.pon || 0) + 1;
    if (S.streakD !== today) {
      const juce = new Date(); juce.setDate(juce.getDate() - 1);
      const juceStr = juce.getFullYear() + '-' + String(juce.getMonth() + 1).padStart(2, '0') + '-' + String(juce.getDate()).padStart(2, '0');
      S.streakN = S.streakD === juceStr ? S.streakN + 1 : 1;
      S.streakD = today;
    }
    save();
  }
  const inQueue = (id) => {
    const r = S.q[id];
    if (!r) return false;
    if (r.w > 0) return r.streak < 3;                 // pogrešna: tri pogotka za izlaz
    return r.a >= 1 && r.streak === 1;                // tačna iz prve: čeka JEDNU potvrdu
  };
  // rok pitanja u redu; stariji zapisi bez roka (tačni iz prve od ranije) dobijaju rok = poslednji put + 3 dana
  const dueOf = (id) => {
    const r = S.q[id];
    if (!r) return 0;
    if (r.due) return r.due;
    if (r.w === 0 && r.streak === 1) return (r.last || 0) + 3 * 86400000;
    return 0;
  };
  function queueSplit() {
    const now = Date.now();
    const ready = [], waiting = [];
    for (const q of Q) {
      if (!inQueue(q.id)) continue;
      (dueOf(q.id) <= now ? ready : waiting).push(q.id);
    }
    const k = (id) => (S.q[id].streak * 1e15) + dueOf(id);
    ready.sort((a, b) => k(a) - k(b));
    waiting.sort((a, b) => (S.q[a].due || 0) - (S.q[b].due || 0));
    return { ready, waiting };
  }
  function markedIds() { return Q.filter((q) => S.q[q.id] && S.q[q.id].marked).map((q) => q.id); }

  // ---------- Osvežavanje davno naučenog ----------
  // Utvrđeno pitanje (izašlo iz reda) koje nije viđeno duže od 21 dan vraća se na jednu
  // proveru — krivulja zaboravljanja ne pita da li je pitanje nekad bilo utvrđeno.
  // Namerno NE dira red za ponavljanje (inQueue/dueOf su zaštićeni testovima): ovo je
  // zaseban, blaži spisak. Tačan odgovor samo obnovi r.last, pa pitanje nestane sa
  // spiska na sledeći 21 dan; pogrešan ga postojeća pravila vraćaju u pravi red.
  const OSVEZI_POSLE = 21 * DAY;
  function zaOsvezavanje() {
    const sad = Date.now();
    return Q.filter((q) => {
      const r = S.q[q.id];
      return r && r.a > 0 && r.last && !inQueue(q.id) && sad - r.last > OSVEZI_POSLE;
    }).map((q) => q.id).sort((x, y) => (S.q[x].last || 0) - (S.q[y].last || 0));
  }

  // ---------- Ruter + trenutni prikaz (za promenu pisma bez gubitka mesta) ----------
  const views = ['home', 'question', 'sim', 'simresult', 'stats', 'browse'];
  function show(v) {
    views.forEach((x) => el('view-' + x).classList.toggle('active', x === v));
    // podnožje se sklanja tokom ispita — pravi ispit ga nema
    document.body.classList.toggle('uSimulaciji', v === 'sim');
    window.scrollTo(0, 0);
  }
  let current = { redraw: renderHome };

  // ---------- Hash rutiranje: strelice browsera napred/nazad + deep-link ----------
  let curHash = null;
  const FILE_MODE = location.protocol === 'file:';
  function setHash(h) {
    curHash = h;
    if (FILE_MODE) return;                   // file:// — adresa se ne dira (origin je "null")
    if (location.hash !== h) location.hash = h;
  }
  // mrtva adresa (#/vezba, ugašena simulacija, loš pregled) se zamenjuje u istoriji —
  // inače bi svaki "Nazad" ponovo sletao na nju i korisnik bi se vrteo u krug
  function goHomeReplace() {
    if (FILE_MODE) { renderHome(); return; }
    location.replace('#/');
  }
  function routeTo(h) {
    if (!h || h === '#' || h === '#/') return renderHome();
    if (h === '#/sva') return browseAll();
    if (h.startsWith('#/sek/')) return browse(h.slice(6));
    if (h === '#/lista/wrong') return browseSet('wrong');
    if (h === '#/lista/marked') return browseSet('marked');
    if (h === '#/stats') return renderStats();
    if (h === '#/uci') return startLearn();
    if (h.startsWith('#/p/')) {
      const qid = parseInt(h.slice(4), 10);
      if (byId.has(qid)) return startList([qid], () => '#' + qid, null, 'filter', { origin: () => renderHome() });
      return goHomeReplace();
    }
    if (h.startsWith('#/pregled/')) {
      const i = parseInt(h.slice(10), 10);
      if (S.sims[i]) return renderSimReview(S.sims[i], false);
      return goHomeReplace();
    }
    if (h === '#/sim') {
      if (sim) { show('sim'); sim.showReport ? renderSimReport() : renderSimQ(); return; }
      return goHomeReplace();
    }
    return goHomeReplace();   // '#/vezba' i nepoznato: prolazna vežba se ne rekonstruiše
  }
  window.addEventListener('hashchange', () => {
    const h = location.hash || '#/';
    if (h === curHash) return;               // naš sopstveni upis, ne korisnikova strelica
    if (sim) {
      if (!confirm(L('simLeaveConfirm'))) { setHash('#/sim'); return; }
      clearInterval(sim.timerId); sim = null;
    }
    curHash = h;
    try { routeTo(h); } catch (err) { goHomeReplace(); }
  });
  // slučajan F5/zatvaranje taba usred simulacije ne sme tiho da uništi pokušaj
  window.addEventListener('beforeunload', (e) => {
    if (sim) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---------- Slika uz pitanje ----------
  // Slike se keširaju tek kad se jednom vide, pa pitanje koje nikad nije otvoreno
  // nema sliku bez interneta — a slika je kod 704 od 1327 pitanja nosilac zadatka.
  // Umesto polomljene ikone bez objašnjenja, kaže se šta se desilo.
  // (Ovo važi i u simulaciji: ne menja ni pitanja, ni bodovanje, ni vreme — samo
  // objašnjava prazninu koju bi korisnik inače video kao kvar aplikacije.)
  function pratiSliku(im) {
    im.addEventListener('error', () => {
      const p = document.createElement('div');
      p.className = 'qImgFail';
      p.textContent = L('imgFail');
      im.replaceWith(p);
    });
    return im;
  }
  function slikaPitanja(q) {
    const im = document.createElement('img');
    im.className = 'qImg';
    im.alt = L('imgAlt');
    pratiSliku(im);
    im.src = 'img/' + q.id + '.jpg';   // src tek POSLE osluškivača, da se greška ne propusti
    return im;
  }

  // ---------- Provera unosa ----------
  // Pravilo: nijedno polje ne sme da ćuti. Ako unos ne valja, korisnik mora da vidi
  // ŠTA jeste prihvatljivo — ne samo da mu se ništa ne desi kad pritisne dugme.
  function ocistiPoruku(polje) {
    if (!polje) return;
    polje.removeAttribute('aria-invalid');
    const p = polje.parentElement && polje.parentElement.querySelector('.unosPoruka');
    if (p) p.remove();
  }
  function poruciUzPolje(polje, tekst) {
    ocistiPoruku(polje);
    const d = document.createElement('div');
    d.className = 'unosPoruka';
    d.setAttribute('role', 'alert');
    d.textContent = tekst;
    polje.parentElement.appendChild(d);
    polje.setAttribute('aria-invalid', 'true');
    try { polje.focus(); } catch (e) { /* fokus nije presudan */ }
  }
  // Vrati ceo broj iz polja, ili null uz poruku koja objašnjava granice.
  // porukaZaMax je neobavezna — kad je gornja granica vredna posebnog objašnjenja.
  function ceoBrojIzPolja(polje, min, max, porukaZaMax) {
    const opseg = (t) => t.split('@1').join(min).split('@2').join(max);
    const sirovo = String(polje.value == null ? '' : polje.value).trim();
    if (sirovo === '') { poruciUzPolje(polje, opseg(L('unosPrazno'))); return null; }
    if (!/^\d+$/.test(sirovo)) { poruciUzPolje(polje, opseg(L('unosSamoCifre'))); return null; }
    const v = parseInt(sirovo, 10);
    if (!Number.isFinite(v)) { poruciUzPolje(polje, opseg(L('unosSamoCifre'))); return null; }
    if (v < min) { poruciUzPolje(polje, opseg(L('unosPremalo'))); return null; }
    if (v > max) { poruciUzPolje(polje, opseg(porukaZaMax || L('unosPreveliko'))); return null; }
    ocistiPoruku(polje);
    return v;
  }

  // ---------- Traka napretka sa skokom na broj ----------
  function renderProgress(title, pos, max, onJump, onBack) {
    el('qProgress').innerHTML = `<span class="qpTitle" title="${escapeHtml(title)}">${onBack ? `<button type="button" id="backToList" class="bcLink">‹ ${L('backToList')}</button> &nbsp; ` : ''}${escapeHtml(title)}</span>
      <span class="qpPos"><b>${pos}</b> ${L('ofQ')} ${max}</span>
      <span class="jumpBox"><input id="jumpN" type="text" inputmode="numeric" autocomplete="off" placeholder="${pos}" aria-label="${escapeHtml(L('goto'))}">
      <button id="jumpGo" class="secondary sBtn">${L('goto')}</button></span>
      <span class="mut kbNote">${L('kbHint')}</span>`;
    if (onBack) el('backToList').addEventListener('click', onBack);
    const doJump = () => {
      const v = ceoBrojIzPolja(el('jumpN'), 1, max, L('skokVanOpsega'));
      if (v !== null) onJump(v - 1);
    };
    el('jumpGo').addEventListener('click', doJump);
    el('jumpN').addEventListener('input', () => ocistiPoruku(el('jumpN')));
    el('jumpN').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doJump(); } });
  }

  // ---------- Prikaz jednog pitanja (zajednički engine) ----------
  // opts: {container, q, onAnswered, onNext, onPrev, nextLabelKey}
  function renderQuestion(opts) {
    const q = opts.q;
    const c = opts.container;
    c.dataset.qid = q.id;
    const shuffled = q.ch.slice();
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }

    const sel = new Set();
    let answered = false;

    c.innerHTML = '';
    const meta = document.createElement('div'); meta.className = 'qMeta';
    // Brojač: tačno i netačno ODVOJENO, ne ukupno+pogrešno. „2× odgovarano, 1× pogrešno"
    // tera čoveka da oduzima; „1× tačno · 1× netačno" se čita bez računanja.
    const hist = qr(q.id).a > 0
      ? ` &nbsp;·&nbsp; <span class="qOk">${S.q[q.id].a - S.q[q.id].w}× ${L('tacnoLbl')}</span> · <span class="${S.q[q.id].w ? 'qBad' : 'mut'}">${S.q[q.id].w}× ${L('netacnoLbl')}</span> · ${relTime(S.q[q.id].last)}`
      : '';
    meta.innerHTML = `<span><button type="button" class="bcLink" data-bc="c${q.cat}">${escapeHtml(catOf(q))}</button> › <button type="button" class="bcLink" data-bc="s${q.sub}">${escapeHtml(subOf(q))}</button></span>
      <span><span class="qNum" data-qid="${q.id}" title="${escapeHtml(FILE_MODE ? L('qNumTip') : L('qNumTip2'))}">#${q.id}</span> · ${poeni(q.pts)}${hist}</span>`;
    meta.querySelectorAll('.bcLink').forEach((b) => b.addEventListener('click', () => browse(b.dataset.bc)));
    c.appendChild(meta);

    const txt = document.createElement('div'); txt.className = 'qText'; txt.textContent = T(q.t);
    c.appendChild(txt);

    if (q.img) c.appendChild(slikaPitanja(q));

    if (q.req > 1) {
      const hint = document.createElement('div'); hint.className = 'mut'; hint.style.marginBottom = '8px';
      hint.textContent = `${L('chooseN')} ${q.req}`;
      c.appendChild(hint);
    }

    const btns = [];
    for (const ch of shuffled) {
      const b = document.createElement('button'); b.className = 'choice'; b.type = 'button';
      b.textContent = T(ch.t); b.dataset.ok = ch.ok;
      b.addEventListener('click', () => {
        if (answered) return;
        // klik samo bira; odgovor se uvek potvrđuje dugmetom (da ne bude zaletanja)
        if (sel.has(ch.id)) { sel.delete(ch.id); b.classList.remove('sel'); }
        else if (q.req === 1) { sel.clear(); btns.forEach((x) => x.classList.remove('sel')); sel.add(ch.id); b.classList.add('sel'); }
        else if (sel.size < q.req) { sel.add(ch.id); b.classList.add('sel'); }
        confirmBtn.disabled = sel.size !== q.req;
      });
      b._ch = ch;
      btns.push(b); c.appendChild(b);
    }

    const actions = document.createElement('div'); actions.className = 'qActions';

    // ← prethodno
    if (opts.onPrev) {
      const pb = document.createElement('button'); pb.className = 'secondary';
      pb.textContent = '← ' + L('prev');
      pb.addEventListener('click', opts.onPrev);
      actions.appendChild(pb);
    }

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'primary'; confirmBtn.disabled = true;
    confirmBtn.textContent = L('confirm');
    confirmBtn.addEventListener('click', () => { if (!answered && sel.size === q.req) finish(shuffled.filter((ch) => sel.has(ch.id))); });
    actions.appendChild(confirmBtn);

    // → preskoči (pre odgovora); posle odgovora postaje "Sledeće pitanje"
    let nextBtn = null;
    if (opts.onNext) {
      nextBtn = document.createElement('button'); nextBtn.className = 'secondary';
      nextBtn.textContent = L('skip') + ' →';
      nextBtn.addEventListener('click', opts.onNext);
      actions.appendChild(nextBtn);
    }

    const markWrap = document.createElement('label'); markWrap.className = 'markBox';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!qr(q.id).marked;
    cb.addEventListener('change', () => { qs(q.id).marked = cb.checked ? 1 : 0; save(); });
    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('mark')));
    actions.appendChild(markWrap);
    c.appendChild(actions);

    function finish(chosen) {
      answered = true;
      const okSet = new Set(q.ch.filter((x) => x.ok).map((x) => x.id));
      const ok = chosen.length === okSet.size && chosen.every((x) => okSet.has(x.id));
      for (const b of btns) {
        b.setAttribute('aria-disabled', 'true');   // ostaje u redosledu čitanja; klik blokira čuvar iznad
        const isChosen = chosen.includes(b._ch);
        if (b._ch.ok) b.classList.add('ok');
        else if (isChosen) b.classList.add('bad');
        b.classList.remove('sel');
        const parts = [];
        if (b._ch.ok) parts.push(`<span class="chip chipOk">✓ ${L('correctAnswer')}</span>`);
        if (isChosen) parts.push(`<span class="chip ${b._ch.ok ? 'chipYourOk' : 'chipYourBad'}">${L('yourAnswer')}</span>`);
        if (parts.length) {
          const w = document.createElement('span'); w.className = 'chipWrap'; w.innerHTML = parts.join(' ');
          b.appendChild(w);
        }
      }
      if (confirmBtn) confirmBtn.remove();
      const v = document.createElement('div'); v.className = 'verdict ' + (ok ? 'ok' : 'bad'); v.setAttribute('role', 'status');
      v.textContent = ok ? L('correct') : L('wrong') + ' ' + L('correctIs');
      c.insertBefore(v, actions);
      const ex = explNode(q);
      if (ex) c.insertBefore(ex, actions);
      if (nextBtn) { nextBtn.className = 'primary'; nextBtn.textContent = L('next'); nextBtn.focus(); }
      if (opts.recordKey && opts.recordKey === lastRecordKey) {
        // isti prikaz istog pitanja (npr. ponovni render posle promene pisma) — ne beleži se dvaput
      } else {
        if (opts.recordKey) lastRecordKey = opts.recordKey;
        opts.onAnswered(ok);
      }
    }
  }

  // ---------- Učenje redom ----------
  function startLearn(fromPos) {
    runSeq++;
    if (typeof fromPos === 'number') { S.seqPos = fromPos; save(); }
    if (S.seqPos > Q.length) S.seqPos = Q.length;   // tačno Q.length = sva pitanja završena
    if (S.seqPos < 0) S.seqPos = 0;
    current = { redraw: stepLearn };
    setHash('#/uci');
    show('question');
    stepLearn();
  }
  function stepLearn() {
    if (S.seqPos >= Q.length) {
      krajSpiska({ ids: Q.map((q) => q.id), titleFn: () => L('learn'), secKey: null, origin: browseAll });
      return;
    }
    const q = Q[S.seqPos];
    renderProgress(L('learn'), S.seqPos + 1, Q.length, (n) => { lastRecordKey = null; S.seqPos = n; save(); stepLearn(); }, browseAll);
    renderQuestion({
      container: el('qCard'), q,
      recordKey: 'L' + runSeq + '|' + S.seqPos,
      onAnswered: (ok) => record(q.id, ok),
      onNext: () => { lastRecordKey = null; S.seqPos++; save(); stepLearn(); },
      onPrev: S.seqPos > 0 ? () => { lastRecordKey = null; S.seqPos--; save(); stepLearn(); } : null,
    });
  }

  // ---------- Liste (podoblast / oblast / pogrešna / obeležena / mešano) ----------
  let listMode = null; // {ids, i, titleFn, kind, secKey, origin}
  let runSeq = 0;              // raste sa svakim novim prolazom kroz pitanja
  let lastRecordKey = null;    // "prolaz|pozicija" poslednjeg zabeleženog odgovora
  // Koliko pitanja podoblast nosi na PRAVOM ispitu — izmereno iz pet zvaničnih izvlačenja
  // (fiksne vrednosti su bile identične u svih pet; "0–1" se smenjuju za slobodne slotove).
  const NA_ISPITU = {
    103: '1', 118: '1', 131: '1', 132: '1', 133: '1', 134: '5', 135: '3', 136: '1', 137: '1',
    140: '1', 144: '1', 145: '1', 146: '1', 148: '1', 157: '2', 158: '2', 159: '1', 160: '1',
    161: '2', 162: '2', 166: '2', 170: '1', 172: '1', 175: '1', 178: '1',
    91: '0–1', 94: '0–1', 109: '0–1', 115: '0–1', 126: '0–1', 127: '0–1', 139: '0–1',
    142: '0–1', 147: '0–1', 155: '0–1', 156: '0–1', 165: '0–1',
  };

  // Redosled podoblasti prati redosled pitanja u bazi; vraća sledeću podoblast (ili prvu iz sledeće oblasti).
  function sledecaSekcija(secKey) {
    if (!secKey || secKey[0] !== 's') return null;
    const sada = +secKey.slice(1);
    const redosled = [];
    for (const q of Q) if (!redosled.includes(q.sub)) redosled.push(q.sub);
    const i = redosled.indexOf(sada);
    if (i < 0 || i + 1 >= redosled.length) return null;
    const sledeci = redosled[i + 1];
    const istaOblast = Q.find((q) => q.sub === sada).cat === Q.find((q) => q.sub === sledeci).cat;
    return { key: 's' + sledeci, ime: subShortName(sledeci), istaOblast };
  }

  // Bogat kraj spiska: pogrešna iz OVOG spiska → sledeća podoblast → red ponavljanja → simulacija.
  function krajSpiska(m) {
    const pogresna = m.ids.filter((id) => inQueue(id) && S.q[id] && S.q[id].w > 0);
    const dalje = sledecaSekcija(m.secKey || m.chainKey);
    const spremno = queueSplit().ready.length;
    const dugmad = [];
    if (pogresna.length) dugmad.push('<button class="primary" id="bEndWrong">' + L('endWrongBtn').replace('#', pogresna.length) + '</button>');
    if (dalje) dugmad.push('<button class="' + (pogresna.length ? 'secondary' : 'primary') + '" id="bEndNext">' + (dalje.istaOblast ? L('endNextSub') : L('endNextCat')).replace('#', escapeHtml(dalje.ime)) + ' ›</button>');
    if (spremno) dugmad.push('<button class="secondary" data-nav="drill">' + L('endQueue').replace('#', spremno) + '</button>');
    dugmad.push('<button class="secondary" data-nav="sim">' + L('endSimBtn') + '</button>');
    const br = m.ids.length;
    const recPitanje = (br % 10 === 1 && br % 100 !== 11) ? L('pitanjeJd') : L('pitanjaMn');
    endScreen('✅ ' + L('endTitle').replace('#', br).replace('&', recPitanje), m.origin, dugmad.join(''));
    const bw = el('bEndWrong');
    if (bw) bw.addEventListener('click', () => startList(pogresna, () => m.titleFn() + ' — 🔁', null, 'filter', { origin: m.origin, chainKey: m.secKey || m.chainKey }));
    const bn = el('bEndNext');
    // startAt: bez njega je lanac „Sledeća podoblast ›" kretao od nule i time PREPISIVAO
    // zapamćenu poziciju u toj podoblasti — jedini ulazak koji se tako ponašao.
    if (bn) bn.addEventListener('click', () => startList(Q.filter((q) => 's' + q.sub === dalje.key).map((q) => q.id), secTitleFn(dalje.key), null, 'section', { secKey: dalje.key, startAt: S.secPos[dalje.key] || 0, origin: () => browse(dalje.key) }));
  }

  function endScreen(msgHtml, origin, extraHtml) {
    el('qProgress').textContent = '';
    el('qCard').innerHTML = `<p class="qText">${msgHtml}</p>
      <div class="qActions">${extraHtml || ''}
        ${origin ? `<button class="secondary" id="bBackOrigin">‹ ${L('backToList')}</button>` : ''}
        <button type="button" class="secondary" data-nav="home">${L('backHome')}</button></div>`;
    bindNav(el('qCard'));
    const bo = el('bBackOrigin');
    if (bo) bo.addEventListener('click', origin);
  }
  function startList(ids, titleFn, emptyMsgFn, kind, opts) {
    opts = opts || {};
    if (!ids.length) {
      current = { redraw: () => startList(ids, titleFn, emptyMsgFn, kind, opts) };
      show('question');
      endScreen(emptyMsgFn ? emptyMsgFn() : '', opts.origin);
      return;
    }
    let start = opts.startAt || 0;
    if (start < 0 || start >= ids.length) start = 0;
    runSeq++;
    listMode = { ids, i: start, titleFn, kind, secKey: opts.secKey || null, chainKey: opts.chainKey || null, origin: opts.origin || null };
    current = { redraw: stepList };
    setHash('#/vezba');
    show('question');
    stepList();
  }
  function stepList() {
    const m = listMode;
    const title = m.titleFn();
    if (m.i >= m.ids.length) {
      // pogrešna: red se ponovo računa — možda je nešto i dalje spremno
      if (m.kind === 'drill') {
        const { ready, waiting } = queueSplit();
        if (ready.length) { runSeq++; listMode = { ...m, ids: ready, i: 0 }; stepList(); return; }
        if (waiting.length) {
          endScreen(`✅ ${(one(waiting.length) ? L('waitInfoOne') : L('waitInfo')).replace('#', waiting.length)}`, m.origin,
            `<button class="primary" id="btnDrillWaiting">${L('drillWaitingBtn')}</button>`);
          el('btnDrillWaiting').addEventListener('click', () => { runSeq++; listMode = { ...m, ids: waiting, i: 0, kind: 'drill-all' }; stepList(); });
        } else {
          endScreen('🎉 ' + L('endAllClear'), m.origin,
            '<button class="secondary" data-nav="sim">' + L('endSimBtn') + '</button>');
        }
        return;
      }
      if (m.secKey) { S.secPos[m.secKey] = 0; save(); }
      krajSpiska(m);
      return;
    }
    const q = byId.get(m.ids[m.i]);
    if (m.secKey) { S.secPos[m.secKey] = m.i; S.lastSec = m.secKey; save(); }
    renderProgress(title, m.i + 1, m.ids.length, (n) => { m.i = n; stepList(); }, m.origin);
    renderQuestion({
      container: el('qCard'), q,
      recordKey: 'T' + runSeq + '|' + m.i,
      onAnswered: (ok) => record(q.id, ok),
      onNext: () => { lastRecordKey = null; m.i++; stepList(); },
      onPrev: m.i > 0 ? () => { lastRecordKey = null; m.i--; stepList(); } : null,
    });
  }
  // 🎲 prekidač na stranama: izmešan redosled za vežbanja pokrenuta sa te strane
  let shuffleOn = false;
  function maybeShuffle(ids) {
    if (!shuffleOn) return ids;
    const a = ids.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function shuffleBoxHtml() {
    return `<label class="markBox" style="margin-left:0" title="${escapeHtml(L('shufTip'))}"><input type="checkbox" id="shufBox"${shuffleOn ? ' checked' : ''}> 🎲 ${L('shuffleLbl')}</label>`;
  }
  const sfx = () => (shuffleOn ? ' 🎲' : '');
  // klik na red u spisku: redom od te pozicije; sa 🎲 — počni od tog pitanja pa nastavi izmešano
  function rowStart(ids, idx, titleFn, origin) {
    if (shuffleOn) {
      const id = ids[idx];
      startList([id].concat(maybeShuffle(ids.filter((x) => x !== id))), shufTag(titleFn), null, 'filter', { origin });
    } else {
      startList(ids, titleFn, null, 'filter', { origin, startAt: idx });
    }
  }
  const legendHtml = () => `<div class="mut" style="font-size:.8rem;margin:4px 0 8px">${L('legend')}</div>`;

  // Jedan red u spisku pitanja — JEDNO mesto za sva tri spiska (podoblast, sva pitanja,
  // pogrešna/obeležena). Ranije su bila tri prepisana primerka istog koda, pa bi svaka
  // dopuna morala na tri mesta (i lako bi promašila jedno).
  // Brojač se pokazuje samo gde ima istorije: 1327 redova sa praznim brojačima bio bi šum.
  function redPitanjaHtml(q, idx, r, dodatak) {
    const icon = !r || !r.a ? '<span class="qDot">•</span>'
      : inQueue(q.id) ? '<span class="qBad">✗</span>'
      : '<span class="qOk">✓</span>';
    const stat = r && r.a
      ? `<span class="qRowStat"><span class="qOk">${r.a - r.w}✓</span>${r.w ? ` <span class="qBad">${r.w}✗</span>` : ''}</span>`
      : '';
    return `<span class="qRowN">${idx + 1}.</span> ${icon} <span class="qRowT">${escapeHtml(T(q.t))}</span>${r && r.marked ? ' 🔖' : ''}${q.img ? ' 🖼' : ''}${dodatak || ''}${stat}`;
  }

  // ---------- Objašnjenja (explanations.js, opciono prisutan) ----------
  const EX = window.EXPLAIN || { cards: {}, byQ: {}, bySub: {} };
  function explNode(q) {
    const e = EX.byQ[q.id];
    const cardKeys = [...new Set([e && e.card, (EX.bySub || {})[q.sub]].filter((k) => k && EX.cards[k]))];
    if (!e && !cardKeys.length) return null;
    const box = document.createElement('div');
    box.className = 'explBox';
    let inner = '';
    if (e && e.x) inner += `<div class="explHead">${L('explTitle')} <span class="mut explSmall">(${L('explNote')})</span></div><p>${escapeHtml(T(e.x))}</p>`;
    for (const k of cardKeys) {
      const c = EX.cards[k];
      inner += `<div><button class="explCardBtn pojBtn" data-card="${k}">📖 ${escapeHtml(T(c.t))}</button><div class="explCard" style="display:none">${T(c.h)}</div></div>`;
    }
    box.innerHTML = inner;
    box.querySelectorAll('.explCardBtn').forEach((btn) => sklopivo(btn));
    return box;
  }

  // ---------- Sklapanje kartica — jedno ponašanje na svim mestima ----------
  // Ranije su vizuelno iste kartice imale tri različita ponašanja, a kartica pri dnu
  // strane se korisniku „otvarala nagore": pregledač bi zbog svog sidrenja skrola
  // odbacio dugme i po hiljadu piksela iznad ekrana.
  // Sada je pravilo jedno i predvidivo: dugme ostaje tačno tamo gde je bilo, a ako se
  // otvorilo nisko na ekranu, strana se mekano podigne taman toliko da se vidi početak
  // sadržaja — nikad više nego što treba.
  function visinaTrake() {
    const t = document.getElementById('topbar');
    return t ? t.getBoundingClientRect().height : 0;
  }
  function sklopivo(btn, grupa) {
    const cd = btn.nextElementSibling;
    if (!cd) return;
    btn.setAttribute('aria-expanded', cd.style.display === 'none' ? 'false' : 'true');
    btn.addEventListener('click', () => {
      const otvaram = cd.style.display === 'none';
      const preTop = btn.getBoundingClientRect().top;
      if (grupa) {
        grupa.querySelectorAll('.explCard').forEach((x) => { x.style.display = 'none'; });
        grupa.querySelectorAll('.explCardBtn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      }
      cd.style.display = otvaram ? '' : 'none';
      btn.setAttribute('aria-expanded', otvaram ? 'true' : 'false');
      // 1) prikuj dugme tamo gde je bilo (poništi i pomeraj koji pregledač sam napravi)
      const posleTop = btn.getBoundingClientRect().top;
      if (posleTop !== preTop) window.scrollBy(0, posleTop - preTop);
      // 2) ako je dugme toliko nisko da se od sadržaja skoro ništa ne vidi, pomeri
      //    stranu — ali TAMAN toliko da se vidi početak, nikad do vrha ekrana.
      //    Namerno bez „behavior: smooth": taj oblik neki pregledači tiho ignorišu,
      //    a pomeraj koji se ne desi je gori od pomeraja bez animacije.
      if (otvaram) {
        const r = btn.getBoundingClientRect();
        const zeljeno = Math.min(220, cd.getBoundingClientRect().height);
        const ispod = window.innerHeight - r.bottom;
        if (ispod < zeljeno) {
          // traka na vrhu ume da se prelomi u dva reda, pa se razmak računa, ne pogađa
          const dokleSme = Math.max(0, r.top - (visinaTrake() + 10));
          const pomeraj = Math.min(zeljeno - ispod, dokleSme);
          if (pomeraj > 0) window.scrollBy(0, pomeraj);
        }
      }
    });
  }
  function bindShuffleBox(root) {
    const sb = root.querySelector('#shufBox');
    if (sb) sb.addEventListener('change', () => { shuffleOn = sb.checked; current.redraw(); });
  }
  const shufTag = (fn) => () => fn() + (shuffleOn ? ` — ${L('shuffled')}` : '');

  // ---------- Simulacija ----------
  const SIM_N = 41, SIM_PTS_MIN = 98, SIM_PTS_MAX = 99, SIM_SECONDS = 45 * 60;
  let sim = null;

  // Zvanični šablon testa za A kategoriju, izmeren iz 2 zvanične eUprava simulacije (2026-08-17):
  // matrica oblast × poeni je u svakom izvlačenju identična (41 pitanje, 98 poena),
  // nasumična su samo konkretna pitanja unutar svake ćelije. Posledice (38) nisu u testu.
  const SIM_TEMPLATE = [
    { cat: 30, pts: 2, n: 11 }, { cat: 30, pts: 3, n: 8 },   // Pravila saobraćaja: 19/46p
    { cat: 32, pts: 2, n: 5 },  { cat: 32, pts: 3, n: 8 },   // Signalizacija: 13/34p
    { cat: 29, pts: 2, n: 2 },                               // Vozilo: 2/4p
    { cat: 25, pts: 1, n: 1 },  { cat: 26, pts: 3, n: 1 },
    { cat: 28, pts: 2, n: 1 },  { cat: 33, pts: 2, n: 1 },
    { cat: 34, pts: 2, n: 1 },  { cat: 35, pts: 2, n: 1 },
    { cat: 36, pts: 2, n: 1 },
  ];
  // Finiji nalaz (3 zvanična izvlačenja, 2026-08-21): test je FIKSNA LISTA od 41 slota —
  // na svakoj poziciji uvek ista podoblast i poeni (37/41), a 4 pozicije rotiraju podoblast
  // unutar malog skupa. Redosled tema u testu je uvek isti; nasumično je samo konkretno pitanje.
  const SIM_SLOTS = [
    { p: 1, s: [91, 94] },
    { p: 2, s: [146] }, { p: 2, s: [148] }, { p: 3, s: [103] }, { p: 2, s: [139, 142, 143] }, { p: 2, s: [156, 165] },
    { p: 3, s: [157] }, { p: 3, s: [157] }, { p: 3, s: [158] }, { p: 3, s: [158] }, { p: 2, s: [159] }, { p: 2, s: [160] },
    { p: 2, s: [161] }, { p: 2, s: [161] }, { p: 2, s: [133] }, { p: 3, s: [162] }, { p: 3, s: [162] }, { p: 3, s: [166] }, { p: 3, s: [166] },
    { p: 2, s: [170] }, { p: 2, s: [172] }, { p: 2, s: [178] }, { p: 2, s: [175] }, { p: 2, s: [109, 115] }, { p: 2, s: [126, 127] }, { p: 2, s: [118] },
    { p: 3, s: [134] }, { p: 3, s: [134] }, { p: 3, s: [134] }, { p: 3, s: [134] }, { p: 3, s: [134] },
    { p: 2, s: [131] }, { p: 2, s: [132] }, { p: 3, s: [135] }, { p: 3, s: [135] }, { p: 3, s: [135] },
    { p: 2, s: [136] }, { p: 2, s: [137] }, { p: 2, s: [140] }, { p: 2, s: [144] }, { p: 2, s: [145] },
  ];
  function buildSimSet() {
    const used = new Set();
    const pick = [];
    for (const slot of SIM_SLOTS) {
      const pool = Q.filter((q) => slot.s.includes(q.sub) && q.pts === slot.p && !used.has(q.id));
      if (!pool.length) return buildSimSetCells();   // baza se promenila — grublji šablon
      const q = pool[Math.floor(Math.random() * pool.length)];
      used.add(q.id);
      pick.push(q);
    }
    return pick;
  }
  function buildSimSetCells() {
    const pick = [];
    for (const cell of SIM_TEMPLATE) {
      const pool = Q.filter((q) => q.cat === cell.cat && q.pts === cell.pts && !pick.includes(q));
      if (pool.length < cell.n) return buildSimSetFallback();
      for (let k = 0; k < cell.n; k++) {
        const i = Math.floor(Math.random() * pool.length);
        pick.push(pool.splice(i, 1)[0]);
      }
    }
    return pick;
  }
  function buildSimSetFallback() {
    const pool = Q.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    let pick = pool.slice(0, SIM_N);
    let rest = pool.slice(SIM_N);
    let sum = pick.reduce((a, q) => a + q.pts, 0);
    for (let guard = 0; guard < 4000 && (sum < SIM_PTS_MIN || sum > SIM_PTS_MAX); guard++) {
      const i = Math.floor(Math.random() * pick.length);
      const j = Math.floor(Math.random() * rest.length);
      const delta = rest[j].pts - pick[i].pts;
      if ((sum < SIM_PTS_MIN && delta > 0) || (sum > SIM_PTS_MAX && delta < 0)) {
        const tmp = pick[i]; pick[i] = rest[j]; rest[j] = tmp; sum += delta;
      }
    }
    return pick;
  }

  function startSim() {
    if (sim) { clearInterval(sim.timerId); sim = null; }   // defanzivno: nikad dva tajmera
    const set = buildSimSet();
    sim = {
      qs: set.map((q) => {
        const order = q.ch.slice();
        for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
        return { q, order, chosen: new Set(), marked: false };
      }),
      i: 0,
      showReport: false,
      deadline: Date.now() + SIM_SECONDS * 1000,
      timerId: null,
    };
    current = { redraw: () => { applySimLabels(); sim.showReport ? renderSimReport() : renderSimQ(); } };
    setHash('#/sim');
    applySimLabels();
    show('sim');
    sim.timerId = setInterval(tickSim, 500);
    tickSim();
    renderSimQ();
  }
  function applySimLabels() {
    el('btnFinishSim').textContent = L('finishSim');
    el('btnSimReport').textContent = L('report');
  }
  function tickSim() {
    if (!sim) return;
    const left = Math.max(0, Math.round((sim.deadline - Date.now()) / 1000));
    const mm = String(Math.floor(left / 60)).padStart(2, '0');
    const ss = String(left % 60).padStart(2, '0');
    const t = el('simTimer');
    t.textContent = mm + ':' + ss;
    t.classList.toggle('low', left < 300);
    if (left <= 0) finishSim(true);
  }
  function renderSimQ() {
    sim.showReport = false;
    el('simReport').style.display = 'none';
    const c = el('simQCard');
    c.style.display = '';
    const sq = sim.qs[sim.i];
    const q = sq.q;
    c.dataset.qid = q.id;
    c.innerHTML = '';
    const meta = document.createElement('div'); meta.className = 'qMeta';
    meta.innerHTML = `<span>${L('question')} ${sim.i + 1} / ${SIM_N}</span><span>${poeni(q.pts)}${q.req > 1 ? ` · ${L('chooseN')} ${q.req}` : ''}</span>`;
    c.appendChild(meta);
    const txt = document.createElement('div'); txt.className = 'qText'; txt.textContent = T(q.t); c.appendChild(txt);
    if (q.img) c.appendChild(slikaPitanja(q));
    for (const ch of sq.order) {
      const b = document.createElement('button'); b.className = 'choice' + (sq.chosen.has(ch.id) ? ' sel' : ''); b.type = 'button';
      b.textContent = T(ch.t);
      b.addEventListener('click', () => {
        if (q.req === 1) { sq.chosen.clear(); sq.chosen.add(ch.id); }
        else if (sq.chosen.has(ch.id)) sq.chosen.delete(ch.id);
        else if (sq.chosen.size < q.req) sq.chosen.add(ch.id);
        renderSimQ();
      });
      c.appendChild(b);
    }
    const actions = document.createElement('div'); actions.className = 'qActions';
    if (sim.i > 0) { const p = document.createElement('button'); p.className = 'secondary'; p.textContent = '‹ ' + L('prevQ'); p.addEventListener('click', () => { sim.i--; renderSimQ(); }); actions.appendChild(p); }
    if (sim.i < SIM_N - 1) { const n = document.createElement('button'); n.className = 'primary'; n.textContent = L('nextQ') + ' ›'; n.addEventListener('click', () => { sim.i++; renderSimQ(); }); actions.appendChild(n); }
    // Obeležavanje pitanja postoji i na pravom ispitu
    const markWrap = document.createElement('label'); markWrap.className = 'markBox';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = sq.marked;
    cb.addEventListener('change', () => { sq.marked = cb.checked; });
    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('mark')));
    actions.appendChild(markWrap);
    c.appendChild(actions);
  }
  // "Izveštaj" — kao na ispitu: tabela Pitanje / Odgovoreno / Obeleženo, klik vodi na pitanje
  function renderSimReport() {
    sim.showReport = true;
    el('simQCard').style.display = 'none';
    const rp = el('simReport');
    rp.style.display = '';
    rp.innerHTML = `<h3>${L('report')}</h3>
      <table class="stats"><thead><tr><th>${L('question')}</th><th class="num">${L('repAnswered')}</th><th class="num">${L('repMarked')}</th></tr></thead>
      <tbody>${sim.qs.map((sq, idx) =>
        `<tr class="repRow" tabindex="0" data-i="${idx}"><td>${idx + 1}</td><td class="num">${sq.chosen.size ? '✓' : '—'}</td><td class="num">${sq.marked ? '🔖' : '—'}</td></tr>`).join('')}
      </tbody></table>
      <div class="qActions" style="margin-top:12px"><button class="primary" id="btnRepBack">‹ ${L('backToTest')}</button></div>`;
    rp.querySelectorAll('.repRow').forEach((tr) => {
      const go = () => { sim.i = +tr.dataset.i; renderSimQ(); };
      tr.addEventListener('click', go);
      tr.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    });
    el('btnRepBack').addEventListener('click', renderSimQ);
  }
  function finishSim(auto) {
    if (!sim) return;
    if (!auto) {
      const unanswered = sim.qs.filter((sq) => !sq.chosen.size).length;
      const msg = unanswered === 0 ? L('simConfirm0') : L('simConfirmN').replace('#', unanswered);
      if (!confirm(msg)) return;
    }
    clearInterval(sim.timerId);
    const total = sim.qs.reduce((a, sq) => a + sq.q.pts, 0);
    let score = 0;
    const wrong = [];
    const perCat = {};
    for (const sq of sim.qs) {
      const okSet = new Set(sq.q.ch.filter((x) => x.ok).map((x) => x.id));
      const ok = sq.chosen.size === okSet.size && [...sq.chosen].every((id) => okSet.has(id));
      if (sq.marked) qs(sq.q.id).marked = 1;   // obeleženo u simulaciji ostaje u tvojoj listi
      record(sq.q.id, ok);
      const pc = perCat[sq.q.cat] || (perCat[sq.q.cat] = { n: 0, ok: 0, pts: 0, got: 0 });
      pc.n++; pc.pts += sq.q.pts;
      if (ok) { score += sq.q.pts; pc.ok++; pc.got += sq.q.pts; }
      else wrong.push({ q: sq.q, chosen: new Set(sq.chosen) });
    }
    const threshold = Math.ceil(0.85 * total);
    const passed = score >= threshold;
    const rec = { d: Date.now(), score, total, passed, wrong: wrong.map((x) => x.q.id), qs: sim.qs.map((sq) => ({ id: sq.q.id, ch: [...sq.chosen] })) };
    S.sims.push(rec);
    sim = null;          // zatvori ispit PRE upisa — neuspeo upis ne sme da ga zaglavi
    save();
    renderSimReview(rec, true);
  }

  // Pregled jedne simulacije — svež rezultat ili bilo koji pokušaj iz istorije.
  function renderSimReview(rec, fresh) {
    current = { redraw: () => renderSimReview(rec, fresh) };
    setHash('#/pregled/' + S.sims.indexOf(rec));
    const threshold = Math.ceil(0.85 * rec.total);
    const items = (rec.qs || []).map((e) => ({ q: byId.get(e.id), chosen: new Set(e.ch) })).filter((x) => x.q);
    const hasDetail = items.length > 0;
    const isOk = (it) => {
      const okSet = new Set(it.q.ch.filter((x) => x.ok).map((x) => x.id));
      return it.chosen.size === okSet.size && [...it.chosen].every((id) => okSet.has(id));
    };
    const perCat = {};
    for (const it of items) {
      const pc = perCat[it.q.cat] || (perCat[it.q.cat] = { n: 0, ok: 0, pts: 0, got: 0 });
      pc.n++; pc.pts += it.q.pts;
      if (isOk(it)) { pc.ok++; pc.got += it.q.pts; }
    }
    const d = new Date(rec.d);
    const ds = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const rc = el('simResultCard');
    rc.innerHTML = `<h3>${L('sim')} <span class="mut" style="font-weight:normal">· ${ds}</span></h3>
      <div class="bigScore ${rec.passed ? 'pass' : 'fail'}">${rec.score} / ${rec.total} ${L('points')}</div>
      <p><span class="pill ${rec.passed ? 'pass' : 'fail'}">${rec.passed ? L('passed') : L('failed')}</span>
      &nbsp; <span class="mut">${L('threshold')}: ${threshold} (85%)</span></p>
      ${hasDetail ? `<h3 style="margin-top:14px">${L('perCat')}</h3>
      <table class="stats"><thead><tr><th>${L('thArea')}</th><th class="num">${L('thQ')}</th><th class="num">${L('points')}</th></tr></thead>
      <tbody>${Object.entries(perCat).map(([cid, pc]) =>
        `<tr><td>${escapeHtml(T(catName.get(+cid)))}</td><td class="num">${pc.ok}/${pc.n}</td><td class="num">${pc.got}/${pc.pts}</td></tr>`).join('')}
      </tbody></table>` : `<p class="mut">${L('reviewOldNote')}</p>`}
      <div class="qActions" style="margin-top:14px">
        ${fresh ? `<button class="primary" id="btnSimAgain">${L('newSim')}</button>` : ''}
        <button class="secondary" id="btnShareRes">${L('shareBtn')}</button>
        <button type="button" class="secondary" data-nav="home">${L('backHome')}</button>
      </div>`;
    bindNav(rc);
    const ba = rc.querySelector('#btnSimAgain');
    if (ba) ba.addEventListener('click', startSim);
    const bs = rc.querySelector('#btnShareRes');
    if (bs) bs.addEventListener('click', () => podeliRezultat(rec, bs));

    const wl = el('simWrongList');
    wl.innerHTML = '';
    const reviewCard = (q, chosen) => {
      const card = document.createElement('div'); card.className = 'card';
      const chips = (ch) => {
        const parts = [];
        if (ch.ok) parts.push(`<span class="chip chipOk">✓ ${L('correctAnswer')}</span>`);
        if (chosen && chosen.has(ch.id)) parts.push(`<span class="chip ${ch.ok ? 'chipYourOk' : 'chipYourBad'}">${L('yourAnswer')}</span>`);
        return parts.length ? `<span class="chipWrap">${parts.join(' ')}</span>` : '';
      };
      card.innerHTML = `<div class="qMeta"><span>${escapeHtml(catOf(q))}</span><span><span class="qNum" title="${escapeHtml(L('qNumTip'))}">#${q.id}</span> · ${poeni(q.pts)}</span></div>
        <div class="qText">${escapeHtml(T(q.t))}</div>
        ${q.req > 1 ? `<div class="reqNote">${L('requiresN').replace('#', q.req)}</div>` : ''}
        ${chosen && chosen.size === 0 ? `<div class="noAnsw">${L('notAnswered')}</div>` : ''}
        ${q.img ? `<img class="qImg" src="img/${q.id}.jpg" alt="${escapeHtml(L('imgAlt'))}">` : ''}
        ${q.ch.map((ch) => `<div class="choice rev${ch.ok ? ' ok' : (chosen && chosen.has(ch.id) ? ' bad' : '')}">${escapeHtml(T(ch.t))}${chips(ch)}</div>`).join('')}`;
      { const im = card.querySelector('img.qImg'); if (im) pratiSliku(im); }
      const ex = explNode(q);
      if (ex) card.appendChild(ex);
      return card;
    };
    if (hasDetail) {
      const wrongItems = items.filter((it) => !isOk(it));
      const okItems = items.filter(isOk);
      if (wrongItems.length) {
        const hw = document.createElement('div'); hw.className = 'card';
        hw.innerHTML = `<h3>${L('simWrongTitle')} (${wrongItems.length})</h3>`;
        wl.appendChild(hw);
        for (const it of wrongItems) wl.appendChild(reviewCard(it.q, it.chosen));
      }
      if (okItems.length) {
        const ho = document.createElement('div'); ho.className = 'card';
        ho.innerHTML = `<h3>${L('correctOnesTitle')} (${okItems.length})</h3>`;
        wl.appendChild(ho);
        for (const it of okItems) wl.appendChild(reviewCard(it.q, it.chosen));
      }
    } else {
      for (const id of rec.wrong || []) {
        const q = byId.get(id);
        if (q) wl.appendChild(reviewCard(q, null));
      }
    }
    show('simresult');
  }

  // ---------- Spremnost za ispit: očekivani poeni po zvaničnom šablonu ----------
  function readiness() {
    let ta = 0, tw = 0;
    for (const q of Q) { const r = S.q[q.id]; if (r) { ta += r.a; tw += r.w; } }
    const overall = ta >= 20 ? (ta - tw) / ta : null;
    const subAcc = {};
    for (const q of Q) { const r = S.q[q.id]; if (r && r.a) { const s = subAcc[q.sub] = subAcc[q.sub] || { a: 0, w: 0 }; s.a += r.a; s.w += r.w; } }
    const pOf = (q) => {
      const r = S.q[q.id];
      if (r && r.a) return (r.a - r.w + 1) / (r.a + 2);          // ublažena lična tačnost
      const s = subAcc[q.sub];
      if (s && s.a >= 5) return (s.a - s.w) / s.a;               // tačnost podoblasti
      if (overall != null) return overall;                       // ukupna tačnost
      return 0.45;                                               // nepoznato — konzervativno
    };
    let exp = 0;
    const loss = {};   // subs-key -> {pts, subs}
    for (const slot of SIM_SLOTS) {
      const pool = Q.filter((q) => slot.s.includes(q.sub) && q.pts === slot.p);
      if (!pool.length) continue;
      const p = pool.reduce((a, q) => a + pOf(q), 0) / pool.length;
      exp += slot.p * p;
      const key = slot.s.join('/');
      (loss[key] = loss[key] || { pts: 0, subs: slot.s }).pts += slot.p * (1 - p);
    }
    const answered = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
    return { exp, loss, answered };
  }
  function renderReady() {
    const { exp, loss, answered } = readiness();
    if (answered < 30) {
      el('readyCard').innerHTML = `<h3>${L('readyTitle')}</h3><p class="mut">${L('readyNoData').replace('#', answered)}</p>`;
      return;
    }
    const e = Math.round(exp);
    const pass = e >= 84;
    const top = Object.values(loss).sort((a, b) => b.pts - a.pts).slice(0, 5);
    const subName = (sid) => T({ l: D.subs[sid].l, c: D.subs[sid].c });
    el('readyCard').innerHTML = `<h3>${L('readyTitle')}</h3>
      <div class="bigScore ${pass ? 'pass' : 'fail'}">≈ ${e} / 98</div>
      <p><span class="pill ${pass ? 'pass' : 'fail'}">${pass ? L('passed') : L('failed')}</span>
      &nbsp;<span class="mut">${L('threshold')}: 84</span>
      ${answered < 150 ? `&nbsp;<span class="mut">${L('readyRough')} (${answered}/${Q.length})</span>` : ''}</p>
      <h3 style="margin-top:12px">${L('readyLoss')}</h3>
      <table class="stats"><tbody>${top.map((t) =>
        `<tr><td>${t.subs.map((s) => escapeHtml(subName(s).slice(0, 48))).join(' / ')}</td>
         <td class="num accBad">−${t.pts.toFixed(1)} ${L('points')}</td></tr>`).join('')}
      </tbody></table>
      <p class="mut" style="margin-top:8px;font-size:.82rem">${L('readyNote')}</p>`;
  }

  // ---------- Statistika ----------
  function renderStats() {
    current = { redraw: renderStats };
    setHash('#/stats');
    renderReady();
    const rows = CATS.map((c) => {
      const qq = Q.filter((q) => q.cat === c.id);
      let seen = 0, att = 0, wr = 0;
      for (const q of qq) { const r = S.q[q.id]; if (r && r.a) { seen++; att += r.a; wr += r.w; } }
      const acc = att ? Math.round(100 * (att - wr) / att) : null;
      return { c, n: qq.length, seen, acc };
    });
    let tAtt = 0, tWr = 0, tSeen = 0;
    for (const q of Q) { const r = S.q[q.id]; if (r && r.a) { tSeen++; tAtt += r.a; tWr += r.w; } }
    const tAcc = tAtt ? Math.round(100 * (tAtt - tWr) / tAtt) : null;
    el('statsCard').innerHTML = `<h3>${L('statsTitle')}</h3>
      <div class="tblScroll">
      <table class="stats"><thead><tr><th>${L('thArea')}</th><th class="num">${L('thQ')}</th><th class="num">${L('thSeen')}</th><th class="num">${L('thAcc')}</th></tr></thead>
      <tbody>${rows.map((r) => `<tr class="statCatRow" data-cat="${r.c.id}" tabindex="0" title="${escapeHtml(L('statExpand'))}"><td>▸ ${escapeHtml(T(r.c))}</td><td class="num">${r.n}</td><td class="num">${r.seen}</td>
        <td class="num">${r.acc === null ? '—' : `<span class="${r.acc >= 90 ? 'accGood' : r.acc >= 75 ? 'accMid' : 'accBad'}">${r.acc}%</span>`}</td></tr>`).join('')}
      <tr class="totalRow"><td><b>${L('ukupno')}</b></td><td class="num"><b>${Q.length}</b></td><td class="num"><b>${tSeen}</b></td>
        <td class="num">${tAcc === null ? '—' : `<b><span class="${tAcc >= 90 ? 'accGood' : tAcc >= 75 ? 'accMid' : 'accBad'}">${tAcc}%</span></b>`}</td></tr>
      </tbody></table></div>`;

    // Raspis po PODOBLASTIMA: klik na red oblasti umetne redove podoblasti ispod njega
    el('statsCard').querySelectorAll('.statCatRow').forEach((tr) => {
      const toggle = () => {
        const cid = +tr.dataset.cat;
        const open = tr.classList.toggle('open');
        tr.cells[0].textContent = (open ? '▾ ' : '▸ ') + T(catName.get(cid));
        // ukloni postojeće sub-redove ove oblasti
        let next = tr.nextElementSibling;
        while (next && next.classList.contains('statSubRow')) { const rm = next; next = next.nextElementSibling; rm.remove(); }
        if (!open) return;
        const subIds = [...new Set(Q.filter((q) => q.cat === cid).map((q) => q.sub))];
        let ref = tr;
        for (const sid of subIds) {
          const sq = Q.filter((q) => q.sub === sid);
          let a = 0, w = 0, seen = 0;
          for (const q of sq) { const r = S.q[q.id]; if (r && r.a) { seen++; a += r.a; w += r.w; } }
          const acc = a ? Math.round(100 * (a - w) / a) : null;
          const row = document.createElement('tr');
          row.className = 'statSubRow';
          row.title = T({ l: D.subs[sid].l, c: D.subs[sid].c });
          row.innerHTML = `<td class="statSubName">${escapeHtml(subShortName(sid))}</td>
            <td class="num">${sq.length}</td><td class="num">${seen}</td>
            <td class="num">${acc === null ? '—' : `<span class="${acc >= 90 ? 'accGood' : acc >= 75 ? 'accMid' : 'accBad'}">${acc}%</span>`}</td>`;
          ref.after(row); ref = row;
        }
      };
      tr.addEventListener('click', toggle);
      tr.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } });
    });

    const bySub = {};
    for (const q of Q) {
      const r = S.q[q.id]; if (!r || !r.a) continue;
      const s = bySub[q.sub] || (bySub[q.sub] = { att: 0, wr: 0, cat: q.cat });
      s.att += r.a; s.wr += r.w;
    }
    const weak = Object.entries(bySub)
      .filter(([, s]) => s.att >= 3)
      .map(([sid, s]) => ({ sid: +sid, acc: Math.round(100 * (s.att - s.wr) / s.att), att: s.att, cat: s.cat }))
      .sort((a, b) => a.acc - b.acc).slice(0, 10);
    el('weakCard').innerHTML = `<h3>${L('weakTitle')}</h3>` + (weak.length
      ? `<table class="stats"><tbody>${weak.map((w) =>
          `<tr><td>${escapeHtml(T(catName.get(w.cat)))} › ${escapeHtml(T({ l: D.subs[w.sid].l, c: D.subs[w.sid].c }))}</td>
           <td class="num"><span class="${w.acc >= 90 ? 'accGood' : w.acc >= 75 ? 'accMid' : 'accBad'}">${w.acc}%</span> <span class="mut">(${w.att})</span></td></tr>`).join('')}</tbody></table>`
      : `<p class="mut">—</p>`);
    show('stats');
  }

  // ---------- Strana oblasti / podoblasti ----------
  // key: "c25" (oblast) ili "s91" (podoblast)
  function subShortName(sid) {
    let n = T({ l: D.subs[sid].l, c: D.subs[sid].c });
    const cut = n.indexOf(' (');
    if (cut > 0) n = n.slice(0, cut);
    return n.replace(/[;\s]+$/, '');
  }
  function secInfo(key) {
    const type = key[0], id = +key.slice(1);
    const ids = (type === 'c' ? Q.filter((q) => q.cat === id) : Q.filter((q) => q.sub === id)).map((q) => q.id);
    const name = type === 'c' ? T(catName.get(id)) : T({ l: D.subs[id].l, c: D.subs[id].c });
    return { type, id, ids, name };
  }
  function secTitleFn(key) {
    return () => secInfo(key).name;
  }
  function browse(key) {
    const { type, id, ids, name } = secInfo(key);
    if (!ids.length) return goHomeReplace();   // zastarela adresa posle osvežavanja baze
    current = { redraw: () => browse(key) };
    setHash('#/sek/' + key);
    let seen = 0, att = 0, wr = 0, inQ = 0, unseen = [], wrongNow = [];
    for (const qid of ids) {
      const r = S.q[qid];
      if (r && r.a) { seen++; att += r.a; wr += r.w; } else unseen.push(qid);
      if (inQueue(qid)) { inQ++; wrongNow.push(qid); }
    }
    const acc = att ? Math.round(100 * (att - wr) / att) : null;
    const pos = S.secPos[key] || 0;

    const head = el('browseHead');
    const catQ = type === 's' ? byId.get(ids[0]) : null;
    head.innerHTML = `
      ${type === 's' ? `<div class="qMeta"><span><button type="button" class="bcLink" data-bc="c${catQ.cat}">‹ ${escapeHtml(catOf(catQ))}</button></span></div>` : ''}
      <h3>${escapeHtml(name)}</h3>
      <div class="mut" style="margin:6px 0 10px">${nQ(ids.length)} · ${seen} ${L('answered')}${acc !== null ? ` · ${L('thAcc').toLowerCase()}: ${acc}%` : ''} · <span title="${escapeHtml(L('queueTip'))}" style="cursor:help">${inQ} ${L('inQueue')}</span></div>
      <div class="qActions">
        <button class="primary" id="bStart" ${!shuffleOn && pos > 0 ? `title="${escapeHtml(L('contTip'))}"` : ''}>${pos > 0 && !shuffleOn ? `${L('continueBtn')} (${pos + 1}/${ids.length})` : L('startBtn') + sfx()}</button>
        ${pos > 0 && !shuffleOn ? `<button class="secondary" id="bStartOver">${L('fromStart')}</button>` : ''}
        ${wrongNow.length ? `<button class="secondary" id="bWrong">${L('onlyWrong')} (${wrongNow.length})${sfx()}</button>` : ''}
        ${unseen.length && unseen.length < ids.length ? `<button class="secondary" id="bUnseen">${L('onlyUnseen')} (${unseen.length})${sfx()}</button>` : ''}
        ${shuffleBoxHtml()}
        <button type="button" class="secondary" data-nav="home">${L('backHome')}</button>
      </div>`;
    bindNav(head);
    bindShuffleBox(head);
    head.querySelectorAll('.bcLink').forEach((b) => b.addEventListener('click', () => browse(b.dataset.bc)));
    const origin = () => browse(key);
    el('bStart').addEventListener('click', () => {
      if (shuffleOn) startList(maybeShuffle(ids), shufTag(secTitleFn(key)), null, 'filter', { origin });
      else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: S.secPos[key] || 0, origin });
    });
    const so = el('bStartOver'); if (so) so.addEventListener('click', () => startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: 0, origin }));
    const bw = el('bWrong'); if (bw) bw.addEventListener('click', () => startList(maybeShuffle(wrongNow), shufTag(() => `${secInfo(key).name} — ${L('onlyWrong').toLowerCase()}`), null, 'filter', { origin }));
    const bu = el('bUnseen'); if (bu) bu.addEventListener('click', () => startList(maybeShuffle(unseen), shufTag(() => `${secInfo(key).name} — ${L('onlyUnseen').toLowerCase()}`), null, 'filter', { origin }));

    const list = el('browseList');
    list.innerHTML = '';
    if (type === 'c') {
      const subIds = [...new Set(Q.filter((q) => q.cat === id).map((q) => q.sub))];
      const sh = document.createElement('h3'); sh.textContent = L('podoblasti'); list.appendChild(sh);
      for (const sid of subIds) {
        const sq = Q.filter((q) => q.sub === sid);
        const sSeen = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
        let sAtt = 0, sWr = 0;
        for (const q of sq) { const r = S.q[q.id]; if (r) { sAtt += r.a; sWr += r.w; } }
        const sAcc = sAtt ? Math.round(100 * (sAtt - sWr) / sAtt) : null;
        const b = document.createElement('button'); b.className = 'subRow';
        b.title = T({ l: D.subs[sid].l, c: D.subs[sid].c });
        const naIsp = NA_ISPITU[sid];
        b.innerHTML = `<span class="subName">${escapeHtml(subShortName(sid))}${naIsp ? ` <span class="subExam" title="${escapeHtml(L('naIspituTip'))}">${L('naIspitu').replace('#', naIsp)}</span>` : ''}</span>
          <span class="subCnt">${sSeen}/${sq.length}</span>
          <span class="subAcc">${sAcc !== null ? sAcc + '%' : ''}</span>`;
        b.addEventListener('click', () => browse('s' + sid));
        list.appendChild(b);
      }
    }
    const qh = document.createElement('h3'); qh.textContent = L('allQuestions'); qh.style.marginTop = '12px'; list.appendChild(qh);
    list.insertAdjacentHTML('beforeend', legendHtml());
    let lastSub = null;
    ids.forEach((qid, idx) => {
      const q = byId.get(qid);
      if (type === 'c' && q.sub !== lastSub) {
        lastSub = q.sub;
        const d = document.createElement('div');
        d.className = 'qDivider';
        d.title = T({ l: D.subs[q.sub].l, c: D.subs[q.sub].c });
        d.textContent = subShortName(q.sub);
        list.appendChild(d);
      }
      const r = S.q[qid];
      const b = document.createElement('button'); b.className = 'qRow';
      b.innerHTML = redPitanjaHtml(q, idx, r);
      b.addEventListener('click', () => {
        if (shuffleOn) rowStart(ids, idx, secTitleFn(key), origin);
        else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: idx, origin });
      });
      list.appendChild(b);
    });
    show('browse');
  }

  // ---------- Strana "Sva pitanja" (učenje redom + filteri + spisak) ----------
  function browseAll() {
    current = { redraw: browseAll };
    setHash('#/sva');
    let seen = 0, att = 0, wr = 0, inQ = 0;
    const unseen = [], wrongNow = [];
    for (const q of Q) {
      const r = S.q[q.id];
      if (r && r.a) { seen++; att += r.a; wr += r.w; } else unseen.push(q.id);
      if (inQueue(q.id)) { inQ++; wrongNow.push(q.id); }
    }
    const acc = att ? Math.round(100 * (att - wr) / att) : null;
    const head = el('browseHead');
    head.innerHTML = `<h3>${L('allPage')}</h3>
      <div class="mut" style="margin:6px 0 10px">${nQ(Q.length)} · ${seen} ${L('answered')}${acc !== null ? ` · ${L('thAcc').toLowerCase()}: ${acc}%` : ''} · <span title="${escapeHtml(L('queueTip'))}" style="cursor:help">${inQ} ${L('inQueue')}</span></div>
      <div class="qActions">
        <button class="primary" id="bCont" title="${escapeHtml(L('contTip'))}">${L('continueBtn')} (${Math.min(S.seqPos + 1, Q.length)}/${Q.length})</button>
        <button class="secondary" id="bFrom1">${L('fromStart')}${sfx()}</button>
        ${unseen.length && unseen.length < Q.length ? `<button class="secondary" id="bUnseen">${L('onlyUnseen')} (${unseen.length})${sfx()}</button>` : ''}
        ${wrongNow.length ? `<button class="secondary" id="bWrong">${L('onlyWrong')} (${wrongNow.length})${sfx()}</button>` : ''}
        ${shuffleBoxHtml()}
        <button type="button" class="secondary" data-nav="home">${L('backHome')}</button>
      </div>`;
    bindNav(head);
    bindShuffleBox(head);
    el('bCont').addEventListener('click', () => startLearn());
    el('bFrom1').addEventListener('click', () => {
      if (shuffleOn) startList(maybeShuffle(Q.map((q) => q.id)), shufTag(() => L('allPage')), null, 'filter', { origin: browseAll });
      else startLearn(0);
    });
    const bu = el('bUnseen'); if (bu) bu.addEventListener('click', () => startList(maybeShuffle(unseen), shufTag(() => `${L('allPage')} — ${L('onlyUnseen').toLowerCase()}`), null, 'filter', { origin: browseAll }));
    const bw = el('bWrong'); if (bw) bw.addEventListener('click', () => startList(maybeShuffle(wrongNow), shufTag(() => `${L('allPage')} — ${L('onlyWrong').toLowerCase()}`), null, 'filter', { origin: browseAll }));

    const list = el('browseList');
    list.innerHTML = `<h3>${L('allQuestions')}</h3>
      <input id="qSearch" type="search" class="searchBox" placeholder="${escapeHtml(L('searchPh'))}" aria-label="${escapeHtml(L('searchPh'))}">` + legendHtml();
    const allIds = Q.map((q) => q.id);
    let lastCat = null;
    Q.forEach((q, idx) => {
      if (q.cat !== lastCat) {
        lastCat = q.cat;
        const cat = D.cats.find((x) => x.id === q.cat);
        const d = document.createElement('div');
        d.className = 'qDivider';
        d.textContent = cat ? T({ l: cat.l, c: cat.c }) : '';
        d._search = '';
        list.appendChild(d);
      }
      const r = S.q[q.id];
      const b = document.createElement('button'); b.className = 'qRow';
      b.innerHTML = redPitanjaHtml(q, idx, r);
      b.addEventListener('click', () => {
        if (shuffleOn) rowStart(allIds, idx, () => L('allPage'), browseAll);
        else startLearn(idx);
      });
      b._search = (T(q.t) + ' ' + q.t.l + ' #' + q.id).toLowerCase();
      list.appendChild(b);
    });
    const sb = el('qSearch');
    // poruka kad nema pogodaka: pravi se jednom, samo se pokazuje/skriva
    const prazno = document.createElement('p');
    prazno.className = 'mut';
    prazno.style.display = 'none';
    prazno.style.marginTop = '10px';
    list.appendChild(prazno);   // unutar kartice, ispod redova — tu korisnik i gleda
    sb.addEventListener('input', () => {
      const v = sb.value.trim().toLowerCase();
      let vidljivih = 0;
      list.querySelectorAll('.qRow').forEach((row) => {
        const vidi = !v || row._search.includes(v);
        row.style.display = vidi ? '' : 'none';
        if (vidi) vidljivih++;
      });
      // dok traje pretraga, naslovi oblasti se sklanjaju (rezultati su izmešani)
      list.querySelectorAll('.qDivider').forEach((d) => { d.style.display = v ? 'none' : ''; });
      // bez ovoga korisnik dobije praznu belu karticu i ne zna da li traži pogrešno ili je nešto puklo
      // split/join, NE replace: u zameni se „$'" i „$&" tumače kao naredbe, pa bi upit
      // sa tim znakovima izlomio poruku (npr. udvostručio pola rečenice)
      if (v && !vidljivih) { prazno.textContent = L('searchEmpty').split('@1').join(sb.value.trim()); prazno.style.display = ''; }
      else prazno.style.display = 'none';
    });
    show('browse');
  }

  // ---------- Strane "Pogrešna" i "Obeležena" (spisak + vežbanje) ----------
  function browseSet(setKind) {
    current = { redraw: () => browseSet(setKind) };
    setHash('#/lista/' + (setKind === 'wrong' ? 'wrong' : 'marked'));
    const isWrong = setKind === 'wrong';
    const title = isWrong ? L('drill') : L('marked');
    let ids, ready = [], waiting = [], stale = [];
    if (isWrong) { ({ ready, waiting } = queueSplit()); stale = zaOsvezavanje(); ids = ready.concat(waiting); }
    else ids = markedIds();

    const head = el('browseHead');
    if (!ids.length && !(isWrong && stale.length)) {
      head.innerHTML = `<h3>${escapeHtml(title)}</h3>
        <p class="qText" style="font-weight:normal">${isWrong ? L('drillEmpty') : L('markedEmpty')}</p>
        <div class="qActions"><button type="button" class="secondary" data-nav="home">${L('backHome')}</button></div>`;
      bindNav(head);
      el('browseList').innerHTML = '';
      show('browse');
      return;
    }
    const origin = () => browseSet(setKind);
    head.innerHTML = `<h3>${escapeHtml(title)}</h3>
      <div class="mut" style="margin:6px 0 10px">${isWrong
        ? `<span title="${escapeHtml(L('queueTip'))}" style="cursor:help">${ready.length} ${L('ready')} · ${waiting.length} ${L('waiting')}</span>${stale.length ? ` · <span title="${escapeHtml(L('osveziTip'))}" style="cursor:help">${stale.length} ${L('osveziLbl')}</span>` : ''}`
        : `${ids.length}`}</div>
      <div class="qActions">
        ${isWrong
          ? `${ready.length ? `<button class="primary" id="bReady">${L('vezbajReady')} (${ready.length})${sfx()}</button>` : ''}
             ${waiting.length ? `<button class="secondary" id="bAll">${L('drillWaitingBtn')} (${ids.length})${sfx()}</button>` : ''}
             ${stale.length ? `<button class="secondary" id="bStale" title="${escapeHtml(L('osveziTip'))}">${L('osveziBtn')} (${stale.length})${sfx()}</button>` : ''}`
          : `<button class="primary" id="bAllM">${L('vezbaj')} (${ids.length})${sfx()}</button>`}
        ${shuffleBoxHtml()}
        <button type="button" class="secondary" data-nav="home">${L('backHome')}</button>
      </div>`;
    bindNav(head);
    bindShuffleBox(head);
    const br = el('bReady'); if (br) br.addEventListener('click', () => startList(maybeShuffle(queueSplit().ready), shufTag(() => L('drill')), () => L('drillEmpty'), shuffleOn ? 'drill-all' : 'drill', { origin }));
    const ba = el('bAll'); if (ba) ba.addEventListener('click', () => startList(maybeShuffle(ids), shufTag(() => L('drill')), null, 'drill-all', { origin }));
    const bo = el('bStale'); if (bo) bo.addEventListener('click', () => startList(maybeShuffle(zaOsvezavanje()), shufTag(() => L('osveziTitle')), () => L('drillEmpty'), 'filter', { origin }));
    const bm = el('bAllM'); if (bm) bm.addEventListener('click', () => startList(maybeShuffle(ids), shufTag(() => L('marked')), null, 'filter', { origin }));

    const list = el('browseList');
    list.innerHTML = legendHtml();
    const now = Date.now();
    ids.forEach((qid, idx) => {
      const q = byId.get(qid);
      const r = S.q[qid];
      let dueTag = '';
      if (isWrong && r && (r.due || 0) > now) {
        const days = Math.ceil((r.due - now) / DAY);
        dueTag = ` <span class="mut">(${days <= 1 ? L('dueTomorrow') : (one(days) ? L('dueDaysOne') : L('dueDays')).replace('#', days)})</span>`;
      }
      const b = document.createElement('button'); b.className = 'qRow';
      b.innerHTML = redPitanjaHtml(q, idx, r, dueTag);
      b.addEventListener('click', () => {
        if (shuffleOn) rowStart(ids, idx, () => title, origin);
        else startList(ids, () => title, null, isWrong ? 'drill-all' : 'filter', { startAt: idx, origin });
      });
      list.appendChild(b);
    });
    show('browse');
  }

  // ---------- Automatski upis napretka u fajl (File System Access) ----------
  let fsHandle = null;      // aktivna dozvola
  let fsPending = null;     // sačuvan handle koji čeka klik za dozvolu
  let backupTimer = null;
  const FSA = 'showSaveFilePicker' in window;

  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('vozackiA-fs', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function idbSet(k, v) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
  async function idbGet(k) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('kv', 'readonly'); const g = tx.objectStore('kv').get(k); g.onsuccess = () => res(g.result); g.onerror = () => rej(g.error); }); }

  function scheduleBackup() {
    if (!fsHandle) return;
    clearTimeout(backupTimer);
    backupTimer = setTimeout(async () => {
      try {
        const w = await fsHandle.createWritable();
        await w.write(JSON.stringify(S));
        await w.close();
      } catch (e) { /* dozvola istekla — dugme će se ponovo pojaviti */ fsPending = fsHandle; fsHandle = null; renderBackupLine(); }
    }, 800);
  }
  let povezivanjeUToku = false;
  async function connectBackup() {
    if (povezivanjeUToku) return;   // sistemski prozor za izbor sme da bude samo jedan
    povezivanjeUToku = true;
    try {
      const h = await window.showSaveFilePicker({
        suggestedName: 'vozacki-a-napredak.json',
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
      });
      fsHandle = h; fsPending = null;
      await idbSet('handle', h);
      scheduleBackup();
      renderBackupLine();
    } catch (e) { /* korisnik odustao */ }
    finally { povezivanjeUToku = false; }
  }
  async function resumeBackup() {
    if (!fsPending) return;
    try {
      const p = await fsPending.requestPermission({ mode: 'readwrite' });
      if (p === 'granted') { fsHandle = fsPending; fsPending = null; scheduleBackup(); }
    } catch (e) { /* ignore */ }
    renderBackupLine();
  }
  async function initBackup() {
    if (!FSA) return;
    try {
      const h = await idbGet('handle');
      if (!h) return;
      const p = await h.queryPermission({ mode: 'readwrite' });
      if (p === 'granted') { fsHandle = h; scheduleBackup(); }
      else fsPending = h;
    } catch (e) { /* ignore */ }
    renderBackupLine();
  }
  function renderBackupLine() {
    const s = el('backupLine');
    if (!s) return;
    if (!FSA) { s.innerHTML = `<span class="mut">${L('backupNA')}</span>`; return; }
    if (fsHandle) { s.innerHTML = `✅ ${L('backupOn')}: <b>${escapeHtml(fsHandle.name)}</b>`; return; }
    if (fsPending) {
      s.innerHTML = `<button class="secondary" id="btnResumeBackup">🔗 ${L('backupResume')} (${escapeHtml(fsPending.name)})</button>`;
      el('btnResumeBackup').addEventListener('click', resumeBackup);
      return;
    }
    s.innerHTML = `<button class="secondary" id="btnConnectBackup">${L('backupConnect')}</button>`;
    el('btnConnectBackup').addEventListener('click', connectBackup);
  }

  // ---------- Početna ----------
  const TOUR_STEPS = [
    { sel: '#homeSummary', key: 'tour1' },
    { sel: '.menuBtn[data-nav="learn"]', key: 'tour2' },
    { sel: '.menuBtn[data-nav="drill"]', key: 'tour3' },
    { sel: '.menuBtn[data-nav="sim"]', key: 'tour4' },
    { sel: '#catBars', key: 'tour5', card: true },
    { sel: '#pojmovnikCard', key: 'tour6' },
    { sel: '#dataTools', key: 'tour7' },
  ];
  function tourStart() {
    if (document.getElementById('tourDim')) return;
    let idx = 0, spot = null;
    const dim = document.createElement('div'); dim.id = 'tourDim';
    const tip = document.createElement('div'); tip.id = 'tourTip';
    tip.setAttribute('role', 'dialog'); tip.setAttribute('aria-modal', 'false'); tip.setAttribute('aria-label', L('tourReplay'));
    document.body.append(dim, tip);
    const clearSpot = () => { if (spot) { spot.classList.remove('tourSpot'); spot = null; } };
    const end = () => {
      clearSpot(); dim.remove(); tip.remove();
      window.removeEventListener('hashchange', end);
      document.removeEventListener('keydown', onKey);
      S.tour = 1; save();
    };
    const show = () => {
      clearSpot();
      const st = TOUR_STEPS[idx];
      let elx = document.querySelector(st.sel);
      if (elx && st.card) elx = elx.closest('.card') || elx;
      if (!elx) { next(); return; }
      spot = elx; spot.classList.add('tourSpot');
      spot.scrollIntoView({ block: 'center' });
      tip.innerHTML = `<div class="tourText">${escapeHtml(L(st.key))}</div>
        <div class="tourRow"><span class="mut">${idx + 1} / ${TOUR_STEPS.length}</span>
        <span style="flex:1"></span>
        <button type="button" class="secondary sBtn" id="tourSkip">${escapeHtml(L('tourSkip'))}</button>
        <button class="primary" id="tourNext">${escapeHtml(idx === TOUR_STEPS.length - 1 ? L('tourDone') : L('tourNext'))}</button></div>`;
      requestAnimationFrame(() => {
        if (!spot || !tip.isConnected) return;
        const r = spot.getBoundingClientRect();
        const th = tip.offsetHeight;
        let top = r.bottom + 10;
        if (top + th > window.innerHeight - 10) top = Math.max(10, r.top - th - 10);
        tip.style.top = top + 'px';
      });
      const btnNext = tip.querySelector('#tourNext');
      btnNext.addEventListener('click', next);
      btnNext.focus();   // фокус улази у водич — тастатура ради одмах
      tip.querySelector('#tourSkip').addEventListener('click', end);
    };
    const next = () => { idx++; if (idx >= TOUR_STEPS.length) end(); else show(); };
    const onKey = (ev) => {
      if (ev.key === 'Escape') { end(); return; }
      // ako je fokus na dugmetu vodiča, pusti pregledač da ga aktivira (Enter/Space)
      if (ev.target && ev.target.closest && ev.target.closest('#tourTip')) return;
      if (ev.key === 'Enter' || ev.key === 'ArrowRight') next();
    };
    window.addEventListener('hashchange', end, { once: true });
    document.addEventListener('keydown', onKey);
    show();
  }
  // ---------- Dnevni cilj ----------
  // Brojač je i pre postojao, ali je samo gledao unazad („danas: 12"). Ovde dobija smisao:
  // korisnik kaže koliko hoće, aplikacija mu odbroji i da tačno toliko — prvo ponavljanja
  // (to je dug od ranije), pa nova pitanja.
  function planStanje() {
    if (!S.plan) return null;
    const d = (S.day && S.day.d === localDay()) ? S.day : null;
    const uNovih = d ? (d.novih || 0) : 0;
    const uPon = d ? (d.pon || 0) : 0;
    const cNovih = S.plan.novih || 0, cPon = S.plan.pon || 0;
    return {
      cNovih, uNovih, cPon, uPon,
      ostaloNovih: Math.max(0, cNovih - uNovih),
      ostaloPon: Math.max(0, cPon - uPon),
    };
  }
  function planIds() {
    const p = planStanje();
    if (!p) return [];
    const nova = [];
    for (const q of Q) {
      if (nova.length >= p.ostaloNovih) break;
      if (!S.q[q.id] || !S.q[q.id].a) nova.push(q.id);
    }
    // Ako spremnih ima manje od cilja, dopuni najstarijim utvrđenim — cilj ostaje pun,
    // a davno naučeno dobija svoju proveru upravo kroz kvotu ponavljanja.
    let pon = queueSplit().ready.slice(0, p.ostaloPon);
    if (pon.length < p.ostaloPon) pon = pon.concat(zaOsvezavanje().slice(0, p.ostaloPon - pon.length));
    return pon.concat(nova);
  }
  function planBlok() {
    const p = planStanje();
    if (!p) return '';
    const red = (lbl, u, c) => (c <= 0 ? '' : `<div class="planRed"><span>${u} / ${c} ${lbl}</span>
      <span class="planBar"><span style="width:${Math.min(100, Math.round(100 * u / c))}%"></span></span>
      <span class="mut">${u >= c ? '✓' : ''}</span></div>`);
    const ispunjen = p.ostaloNovih === 0 && p.ostaloPon === 0;
    const ima = planIds().length;
    const dno = ispunjen ? `<span class="mut">${L('planIspunjen')}</span>`
      : !ima ? `<span class="mut">${L('planNemaDostupnih')}</span>`
        : `<button class="primary" id="btnPlanVezbaj">${L('planVezbaj')}</button>`;
    return `<div class="planBox"><b>${L('planNaslov')}</b>
      ${red(L('novihLbl'), p.uNovih, p.cNovih)}${red(L('ponLbl'), p.uPon, p.cPon)}
      <div style="margin-top:8px">${dno}</div></div>`;
  }

  function homeExtras() {
    const delovi = [];
    if (S.streakD === localDay() && S.streakN >= 2) delovi.push('🔥 ' + S.streakN + '. ' + L('streakDani'));
    const spremno = queueSplit().ready.length;
    if (spremno > 0) delovi.push('🔁 ' + L('planPonavljanja').replace('#', spremno));
    {
      // predlog simulacije: transparentno pravilo — pokrivenost ≥ 60% i nijedna simulacija danas;
      // u poslednjih 7 dana pred ispit: po jedna dnevno.
      const odgovoreno = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
      const pokrivenost = odgovoreno / Q.length;
      const zadnja = S.sims.length ? S.sims[S.sims.length - 1].d : 0;
      const simDanas = zadnja && new Date(zadnja).toDateString() === new Date().toDateString();
      let danaDoIspita = null;
      if (S.examDate) {
        const d0 = new Date(); d0.setHours(0, 0, 0, 0);
        danaDoIspita = Math.round((new Date(S.examDate + 'T00:00:00') - d0) / 86400000);
      }
      if (danaDoIspita !== null && danaDoIspita >= 0 && danaDoIspita <= 7) {
        if (!simDanas) delovi.push('🎯 ' + L('planSimNedelja'));
      } else if (pokrivenost >= 0.6 && !simDanas && (!zadnja || Date.now() - zadnja > 2.5 * 86400000)) {
        delovi.push('🎯 ' + L('planSim'));
      }
    }
    if (S.examDate) {
      const danas = new Date(); danas.setHours(0, 0, 0, 0);
      const ispit = new Date(S.examDate + 'T00:00:00');
      const dana = Math.round((ispit - danas) / 86400000);
      if (dana >= 0) {
        // srpska jednina: „1 dan", ne „1 dana"; na sam dan ispita ne piše se „0 dana"
        if (dana === 0) delovi.push(L('examToday'));
        else delovi.push('📅 ' + L('examIn') + ': ' + dana + ' ' + (one(dana) ? L('examDaysOne') : L('examDays')));
        const neodg = Q.filter((q) => !S.q[q.id] || !S.q[q.id].a).length;
        if (dana > 0 && neodg > 0) {
          const tempo = Math.ceil(neodg / dana);
          delovi.push((one(tempo) ? L('examPlanOne') : L('examPlan')).replace('#', tempo));
        }
      }
    }
    return delovi.length ? '<div class="homeExtras">' + delovi.join(' &nbsp;·&nbsp; ') + '</div>' : '';
  }

  function renderHome() {
    current = { redraw: renderHome };
    setHash('#/');
    const answeredCnt = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
    const { ready, waiting } = queueSplit();
    const mk = markedIds().length;
    let lastChip = '';
    if (S.lastSec) {
      const si = secInfo(S.lastSec);
      const p = S.secPos[S.lastSec] || 0;
      if (p > 0 && p < si.ids.length) {
        // jedna glavna radnja po ekranu: ako plan dana ima svoje plavo dugme, ovo je sivo
        const lastKlasa = (planStanje() && planIds().length) ? 'secondary' : 'primary';
        lastChip = `<div style="margin-top:8px"><button class="${lastKlasa}" id="btnLastSec">▶ ${L('continueBtn')}: ${escapeHtml(si.name)} (${p + 1}/${si.ids.length})</button></div>`;
      }
    }
    const today = localDay();
    const dayLine = S.day && S.day.d === today && S.day.n > 0
      ? ` · 📅 ${L('todayLbl')}: <b>${S.day.n}</b> (${L('okShort')} ${S.day.ok})` : '';
    el('homeSummary').innerHTML = `<b>${answeredCnt}</b> / ${Q.length} ${L('answered')} · <span title="${escapeHtml(L('queueTip'))}" style="cursor:help"><b>${ready.length}</b> ${L('ready')} + ${waiting.length} ${L('waiting')}</span> · 🔖 ${mk}${dayLine}${lastChip}` + homeExtras() + planBlok();
    {
      const bpv = el('btnPlanVezbaj');
      if (bpv) bpv.addEventListener('click', () => {
        const ids = planIds();
        if (!ids.length) return;
        startList(ids, () => L('planNaslov'), () => L('planNemaSta'), 'filter', { origin: () => renderHome() });
      });
    }
    const bls = el('btnLastSec');
    if (bls) bls.addEventListener('click', () => {
      const key = S.lastSec;
      const si = secInfo(key);
      startList(si.ids, secTitleFn(key), null, 'section', { secKey: key, startAt: S.secPos[key] || 0 });
    });
    el('mLearn').textContent = L('allPage');
    el('mLearnSub').textContent = `${L('continueBtn')}: ${Math.min(S.seqPos + 1, Q.length)} ${L('ofQ')} ${Q.length} · ${L('allPageSub')}`;
    el('mDrill').textContent = L('drill');
    {
      const osv = zaOsvezavanje().length;
      el('mDrillSub').textContent = `${ready.length} ${L('ready')} · ${waiting.length} ${L('waiting')}${osv ? ` · ${osv} ${L('osveziLbl')}` : ''}`;
    }
    el('mMarked').textContent = L('marked');
    el('mMarkedSub').textContent = `${mk}`;
    el('mSim').textContent = L('sim');
    el('mSimSub').textContent = L('simSub');
    el('mStats').textContent = L('stats');
    el('mStatsSub').textContent = L('statsSub');
    el('hCats').textContent = L('cats');

    const cb = el('catBars'); cb.innerHTML = '';
    {
      const seenAll = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
      const goodAll = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0 && S.q[q.id].streak >= 1).length;
      const row = document.createElement('div'); row.className = 'catRow catTotal';
      row.innerHTML = `<span class="catChevSpacer"></span>
        <button type="button" class="catMain"><span class="catName"><b>${L('ukupno')}</b></span>
        <span class="catBar"><span class="seen" style="width:${100 * seenAll / Q.length}%"></span><span class="good" style="width:${100 * goodAll / Q.length}%"></span></span>
        <span class="catCnt"><b>${seenAll}/${Q.length}</b></span></button>`;
      row.querySelector('.catMain').addEventListener('click', () => browseAll());
      cb.appendChild(row);
    }
    for (const c of CATS) {
      const qq = Q.filter((q) => q.cat === c.id);
      const seen = qq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
      const good = qq.filter((q) => S.q[q.id] && S.q[q.id].a > 0 && S.q[q.id].streak >= 1).length;
      const row = document.createElement('div'); row.className = 'catRow';
      row.innerHTML = `<button type="button" class="catChevBtn" aria-expanded="false" title="${escapeHtml(L('catExpand'))}" aria-label="${escapeHtml(L('catExpand'))}">▸</button>
        <button type="button" class="catMain" title="${escapeHtml(L('catOpen'))}"><span class="catName">${escapeHtml(T(c))}</span>
        <span class="catBar"><span class="seen" style="width:${100 * seen / qq.length}%"></span><span class="good" style="width:${100 * good / qq.length}%"></span></span>
        <span class="catCnt">${seen}/${qq.length}</span></button>`;
      row.querySelector('.catMain').addEventListener('click', () => browse('c' + c.id));
      row.querySelector('.catChevBtn').addEventListener('click', () => {
        // Akordeon kao u pojmovniku: otvaranje jedne oblasti sklapa prethodno otvorenu.
        // Bez ovoga je otklapanje svega isteglo levu kolonu na 2361px uz prazninu desno.
        const zatvoriRed = (r) => {
          r.classList.remove('open');
          const ch = r.querySelector('.catChevBtn');
          if (ch) { ch.textContent = '▸'; ch.setAttribute('aria-expanded', 'false'); }
          let n2 = r.nextElementSibling;
          while (n2 && n2.classList.contains('catSubRow')) { const rm2 = n2; n2 = n2.nextElementSibling; rm2.remove(); }
        };
        const bioOtvoren = row.classList.contains('open');
        cb.querySelectorAll('.catRow.open').forEach(zatvoriRed);
        if (bioOtvoren) return;                     // klik na otvorenu = samo zatvori
        row.classList.add('open');
        const chev = row.querySelector('.catChevBtn');
        chev.textContent = '▾';
        chev.setAttribute('aria-expanded', 'true');
        let ref = row, zi = 0;
        const addSub = (labelHtml, key, sSeen, sTot, sGood, title) => {
          const sr = document.createElement('div');
          sr.className = 'catRow catSubRow' + (zi++ % 2 ? ' zebra' : '');
          if (title) sr.title = title;
          sr.innerHTML = `<span class="catChevSpacer"></span>
            <button type="button" class="catMain"><span class="catName">${labelHtml}</span>
            <span class="catBar"><span class="seen" style="width:${sTot ? 100 * sSeen / sTot : 0}%"></span><span class="good" style="width:${sTot ? 100 * sGood / sTot : 0}%"></span></span>
            <span class="catCnt">${sSeen}/${sTot}</span></button>`;
          sr.querySelector('.catMain').addEventListener('click', () => browse(key));
          ref.after(sr); ref = sr;
        };
        for (const sid of [...new Set(qq.map((q) => q.sub))]) {
          const sq = qq.filter((q) => q.sub === sid);
          const sSeen = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
          const sGood = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0 && S.q[q.id].streak >= 1).length;
          addSub(escapeHtml(subShortName(sid)), 's' + sid, sSeen, sq.length, sGood, T({ l: D.subs[sid].l, c: D.subs[sid].c }));
        }
      });
      cb.appendChild(row);
    }

    const sh = el('simHistory');
    if (!S.sims.length) sh.innerHTML = `<h3>${L('history')}</h3><p class="mut">${L('noSims')}</p>`;
    else {
      sh.innerHTML = `<h3>${L('history')}</h3><p class="mut" style="font-size:.82rem;margin-bottom:6px">${L('historyTip')}</p>`
        + S.sims.slice().reverse().map((s, ri) => {
          const d = new Date(s.d);
          const ds = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          const brGresaka = (s.wrong || []).length;
          return `<button class="histRow histBtn" data-sim="${S.sims.length - 1 - ri}">
            <span class="histDate mut">${ds}</span>
            <b class="histScore">${s.score}/${s.total}</b>
            <span class="histPill"><span class="pill ${s.passed ? 'pass' : 'fail'}">${s.passed ? L('passed') : L('failed')}</span></span>
            <span class="histWrong mut">${brGresaka ? brGresaka + ' ✗' : ''}</span>
            <span class="histArrow mut">›</span></button>`;
        }).join('');
      sh.querySelectorAll('.histBtn').forEach((b) => b.addEventListener('click', () => renderSimReview(S.sims[+b.dataset.sim], false)));
    }

    const tc = el('trustCard');
    if (tc) {
      tc.innerHTML = `<div><button class="explCardBtn pojBtn" style="font-size:1.05rem;font-weight:600">${L('trustTitle')}</button><div class="explCard" style="display:none">${L('trustBody')}</div></div>`;
      sklopivo(tc.querySelector('.explCardBtn'));
    }

    const fq = el('faqCard');
    if (EX.cards && EX.cards.faq) {
      fq.style.display = '';
      fq.innerHTML = `<div><button class="explCardBtn pojBtn" style="font-size:1.05rem;font-weight:600">❓ ${escapeHtml(T(EX.cards.faq.t))}</button><div class="explCard" style="display:none">${T(EX.cards.faq.h)}</div></div>`;
      sklopivo(fq.querySelector('.explCardBtn'));
    } else fq.style.display = 'none';

    const gc = el('guideCard');
    gc.innerHTML = `<div class="guideHead"><div><h3 style="margin:0">${L('guideTitle')}</h3>
      <span class="mut" style="font-size:.82rem">${L('guideSub')}</span></div>
      <button class="secondary" id="btnGuide">${S.guide ? L('guideHide') : L('guideOpen')}</button></div>
      <div id="guideBody" style="${S.guide ? '' : 'display:none'}">${L('guideBody')}</div>`;
    el('btnGuide').addEventListener('click', () => {
      S.guide = S.guide ? 0 : 1; save();
      el('guideBody').style.display = S.guide ? '' : 'none';
      el('btnGuide').textContent = S.guide ? L('guideHide') : L('guideOpen');
    });

    const pk = el('pojmovnikCard');
    const cardKeys = Object.keys(EX.cards || {}).filter((k) => k !== 'faq');
    if (!cardKeys.length) pk.style.display = 'none';
    else {
      pk.style.display = '';
      // Redosled kartica prati predloženi tok učenja iz vodiča (od pojmova ka posledicama)
      const GRUPE = [
        ['grp1', ['slicni-pojmovi', 'put-pojmovi', 'kategorije-vozila', 'brzine', 'vozac-zdravlje-alkohol']],
        ['grp2', ['prvenstvo-prolaza', 'policajac-znaci', 'znakovi-porodice', 'znakovi-opasnosti', 'znakovi-naredbi', 'znakovi-obavestenja', 'semafori', 'oznake-kolovoz']],
        ['grp3', ['skretanje', 'preticanje', 'parkiranje', 'parking-table', 'pokazivaci', 'svetla']],
        ['grp4', ['pesaci-bicikli', 'pruga', 'autoput', 'nezgoda', 'razno-pravila']],
        ['grp5', ['dozvole', 'vozilo-tehnika', 'uredjaji-oprema', 'iskljucenje', 'kazne', 'kaznene-klase', 'zamke-odgovori']],
      ];
      const stavljene = new Set();
      let html = `<h3>📖 ${L('pojmovnik')}</h3><p class="mut" style="font-size:.82rem;margin-bottom:6px">${L('pojmovnikSub')}</p>`;
      const entry = (k) => `<div class="pojEntry"><button class="explCardBtn pojBtn">📖 ${escapeHtml(T(EX.cards[k].t))}</button><div class="explCard" style="display:none">${T(EX.cards[k].h)}</div></div>`;
      for (const [gk, keys] of GRUPE) {
        const imaju = keys.filter((k) => cardKeys.includes(k));
        if (!imaju.length) continue;
        html += `<div class="pojGroup">${escapeHtml(L(gk))}</div>`;
        for (const k of imaju) { html += entry(k); stavljene.add(k); }
      }
      const ostatak = cardKeys.filter((k) => !stavljene.has(k));
      for (const k of ostatak) html += entry(k);
      pk.innerHTML = html;
      // akordeon: otvaranje jedne kartice sklapa prethodno otvorenu
      pk.querySelectorAll('.explCardBtn').forEach((btn) => sklopivo(btn, pk));
    }

    // Četiri imenovane grupe umesto jednog reda nabacanih dugmadi. Podaci o bazi i prijava
    // greške su odavde preseljeni u podnožje — tamo ih ljudi i traže.
    el('dataTools').innerHTML = `
      <div class="podGrupa">
        <div class="podNaslov">${L('grupaNapredak')}</div>
        <div class="mut" style="font-size:.82rem">${L('persistNote')}</div>
        <div id="backupLine" style="margin-top:8px"></div>
        <div class="qActions" style="margin-top:8px">
          <button type="button" class="secondary" id="btnExport">${L('export')}</button>
          <button type="button" class="secondary" id="btnImport">${L('import')}</button>
          <input type="file" id="fileImport" accept=".json" style="display:none">
        </div>
      </div>
      <div class="podGrupa">
        <div class="podNaslov">${L('grupaAplikacija')}</div>
        <div class="qActions">
          <button type="button" class="secondary" id="btnInstall" style="display:none">${L('installBtn')}</button>
          <button type="button" class="secondary" id="btnCheckUpd">${L('updRepoCheck')}</button>
          <button type="button" class="secondary" id="btnTourReplay">${L('tourReplay')}</button>
        </div>
        <div id="installWhat" style="margin-top:8px"><button type="button" class="explCardBtn pojBtn">${L('installWhatTitle')}</button><div class="explCard" style="display:none">${L('installWhatBody')}</div></div>
      </div>
      <div class="podGrupa">
        <div class="podNaslov">${L('planNaslov')}</div>
        <div style="font-size:.86rem"><label>${L('examDateLabel')}
          <input type="date" id="examDate" value="${S.examDate || ''}" style="margin-left:6px"></label></div>
        <div class="mut" style="font-size:.82rem;margin:8px 0 6px">${L('planObjasnjenje')}</div>
        <div class="planPolja">
          <label class="planPolje"><span class="mut">${L('planNovih')}</span>
            <input id="planNovih" type="text" inputmode="numeric" autocomplete="off" value="${S.plan && S.plan.novih ? S.plan.novih : ''}"></label>
          <label class="planPolje"><span class="mut">${L('planPon')}</span>
            <input id="planPon" type="text" inputmode="numeric" autocomplete="off" value="${S.plan && S.plan.pon ? S.plan.pon : ''}"></label>
          <button type="button" class="secondary" id="btnPlanSave">${L('planSacuvaj')}</button>
          <button type="button" class="secondary" id="btnPlanPredlog">${L('planPredlozi')}</button>
          ${S.plan ? `<button type="button" class="secondary" id="btnPlanOff">${L('planIskljuci')}</button>` : ''}
        </div>
        <div id="planPoruka" class="mut" style="margin-top:6px"></div>
      </div>
      <div class="podGrupa podOpasno">
        <div class="podNaslov">${L('grupaOprezno')}</div>
        <div class="qActions"><button type="button" class="danger" id="btnReset">${L('reset')}</button></div>
        <div class="mut" style="font-size:.82rem;margin-top:8px">${L('resetNapomena')}</div>
      </div>`;
    renderBackupLine();
    if (installEvt) { const bi = el('btnInstall'); if (bi) bi.style.display = ''; }
    el('btnInstall').addEventListener('click', async () => {
      if (!installEvt) return;
      // događaj se preuzima i poništava PRE čekanja: prompt() sme da se pozove samo
      // jednom, a dupli klik dok je sistemski dijalog otvoren bi ga zvao ponovo
      const evt = installEvt;
      installEvt = null;
      el('btnInstall').style.display = 'none';
      try { evt.prompt(); await evt.userChoice; } catch (e) { /* korisnik odustao — u redu */ }
    });
    sklopivo(el('installWhat').querySelector('.explCardBtn'));
    el('btnCheckUpd').addEventListener('click', (ev) => { S.noUpd = 0; save(); proveriRepo(true, ev.currentTarget); });
    el('btnTourReplay').addEventListener('click', tourStart);
    // (prijava greške je preseljena u podnožje — vezuje se u renderPodnozje(), ne ovde;
    //  ostavljanje veze na ovom mestu bi je zakačilo drugi put pri svakom crtanju početne)
    // Datum ispita: prazno polje je jedini način da se datum ukloni, pa prazno UVEK briše.
    // Sve ostalo mora da prođe proveru — bez nje je otkucano „26" umesto „2026" davalo
    // godinu 0026, prolazilo regeks i davalo besmisleno odbrojavanje, a promašen unos je
    // ćutke brisao prethodno sačuvani datum.
    el('examDate').addEventListener('change', () => {
      const inp = el('examDate');
      const v = inp.value;
      ocistiPoruku(inp);
      if (v === '') { S.examDate = null; save(); renderHome(); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { poruciUzPolje(inp, L('datumLos')); return; }
      const d = new Date(v + 'T00:00:00');
      const danas = new Date(); danas.setHours(0, 0, 0, 0);
      const godina = +v.slice(0, 4);
      if (isNaN(d.getTime()) || godina < danas.getFullYear() || godina > danas.getFullYear() + 5) {
        poruciUzPolje(inp, L('datumOpseg').split('@1').join(danas.getFullYear()).split('@2').join(danas.getFullYear() + 5));
        return;
      }
      if (d < danas) { poruciUzPolje(inp, L('datumProslost')); return; }
      S.examDate = v;
      save(); renderHome();
    });
    {
      const pn = el('planNovih'), pp = el('planPon');
      const neodgovorenih = Q.filter((q) => !S.q[q.id] || !S.q[q.id].a).length;
      const kaziPosle = (t) => { const m = el('planPoruka'); if (m) m.textContent = t; };
      const prazno = (x) => String(x.value || '').trim() === '';
      if (!neodgovorenih) { pn.disabled = true; pn.value = ''; pn.placeholder = L('planSveOdgovoreno'); }
      [pn, pp].forEach((x) => x.addEventListener('input', () => { ocistiPoruku(x); kaziPosle(''); }));
      el('btnPlanSave').addEventListener('click', () => {
        if (prazno(pn) && prazno(pp)) { S.plan = null; save(); renderHome(); kaziPosle(L('planUgasen')); return; }
        let novih = null, pon = null;
        if (!prazno(pn)) {
          novih = ceoBrojIzPolja(pn, 1, Math.max(1, neodgovorenih), L('planMaxNovih'));
          if (novih === null) return;
        }
        if (!prazno(pp)) {
          pon = ceoBrojIzPolja(pp, 1, Q.length, L('unosPreveliko'));
          if (pon === null) return;
        }
        S.plan = { novih, pon };
        save(); renderHome();
        // ne branimo veliki cilj, ali kažemo koliko je to stvarno vremena
        const dnevno = (novih || 0) + (pon || 0);
        kaziPosle(dnevno > 150 ? L('planPuno').replace('#', dnevno) : L('planSacuvan'));
      });
      el('btnPlanPredlog').addEventListener('click', () => {
        if (!S.examDate) { kaziPosle(L('planBezDatuma')); return; }
        const d0 = new Date(); d0.setHours(0, 0, 0, 0);
        const dana = Math.ceil((new Date(S.examDate + 'T00:00:00') - d0) / 86400000);
        if (!Number.isFinite(dana) || dana < 1) { kaziPosle(L('planDatumProsao')); return; }
        // Novo gradivo mora da se završi PRE ispita — poslednji dani ostaju za ponavljanje
        // i simulacije. Rezerva je nedelja dana, ali nikad više od trećine preostalog
        // vremena, da kod bliskog ispita ne ostane nula dana za novo gradivo.
        const rezerva = Math.min(7, Math.floor(dana / 3));
        const danaZaNovo = Math.max(1, dana - rezerva);
        if (!pn.disabled) pn.value = String(Math.max(1, Math.ceil(neodgovorenih / danaZaNovo)));
        // Ponavljanja: koliko se stvarno može uraditi u jednoj sednici, a ne ceo zaostatak.
        // Ranije je stajalo „koliko god ih je spremno" i umelo je da ispadne 346 dnevno.
        pp.value = String(Math.min(60, Math.max(15, queueSplit().ready.length)));
        ocistiPoruku(pn); ocistiPoruku(pp);
        kaziPosle(rezerva > 0 ? L('planPredlogGotov').replace('#', rezerva) : L('planPredlogUsko'));
      });
      const off = el('btnPlanOff');
      if (off) off.addEventListener('click', () => { S.plan = null; save(); renderHome(); kaziPosle(L('planUgasen')); });
    }
    if (!S.tour && !window.__tourRan) {
      window.__tourRan = 1;
      setTimeout(() => { if (el('view-home').classList.contains('active')) tourStart(); }, 600);
    }
    el('btnExport').addEventListener('click', (ev) => {
      const d = ev.currentTarget;
      if (d.disabled) return;
      d.disabled = true; setTimeout(() => { d.disabled = false; }, 1200);
      const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'vozacki-a-napredak.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    });
    el('btnImport').addEventListener('click', () => el('fileImport').click());
    el('fileImport').addEventListener('change', (e) => {
      const f = e.target.files[0];
      e.target.value = '';   // da ponovni izbor ISTOG fajla opet okine 'change'
      if (!f) return;
      // „accept=.json" je samo filter u prozoru za izbor — korisnik ga u dva klika promeni.
      // Izvezen napredak je reda desetina kilobajta; 5 MB je i dalje ogromno, a sprečava da
      // izbor filma ili arhive zaledi karticu dok se čita u memoriju.
      if (f.size > 5 * 1024 * 1024) { alert(L('importPrevelik')); return; }
      const rd = new FileReader();
      rd.onerror = () => alert(L('importBad'));
      rd.onload = () => {
        let sirovo = null, norm = null;
        try { sirovo = JSON.parse(rd.result); norm = normalizeState(sirovo); } catch (err) { /* nevalidan JSON */ }
        if (!norm) { alert(L('importBad')); return; }
        const hasProgress = Object.keys(S.q).length > 0 || S.sims.length > 0;
        if (hasProgress && !confirm(L('importConfirm'))) return;
        S = norm;
        applyScript(); applyTheme(); applyFont();
        renderHome();
        save();
        // Zapisi za pitanja kojih nema u trenutnoj bazi se odbacuju — to je ispravno, ali
        // se do sada dešavalo nemo, pa je uvoz stare kopije izgledao kao pun uspeh.
        const bilo = sirovo && sirovo.q && typeof sirovo.q === 'object' && !Array.isArray(sirovo.q)
          ? Object.keys(sirovo.q).length : 0;
        const ostalo = Object.keys(norm.q).length;
        if (bilo > ostalo) alert(L('importDeo').split('#').join(ostalo).split('@').join(bilo));
      };
      rd.readAsText(f);
    });
    el('btnReset').addEventListener('click', () => {
      if (confirm(L('resetConfirm'))) { S = normalizeState({ q: {}, script: S.script, theme: S.theme, fs: S.fs }); save(); renderHome(); }
    });
    show('home');
  }

  // ---------- Navigacija / init ----------
  // Napuštanje aktivne simulacije traži potvrdu; napuštena se NE računa nigde.
  function leaveSimOk() {
    if (!sim) return true;
    if (!confirm(L('simLeaveConfirm'))) return false;
    clearInterval(sim.timerId);
    sim = null;
    return true;
  }
  function bindNav(root) {
    root.querySelectorAll('[data-nav]').forEach((b) => {
      if (b._navBound) return; b._navBound = true;
      b.addEventListener('click', () => {
        if (!leaveSimOk()) return;
        const v = b.dataset.nav;
        if (v === 'home') renderHome();
        else if (v === 'learn') browseAll();
        else if (v === 'drill') browseSet('wrong');
        else if (v === 'marked') browseSet('marked');
        else if (v === 'sim') startSim();
        else if (v === 'stats') renderStats();
      });
    });
  }
  bindNav(document);
  el('btnFinishSim').addEventListener('click', () => finishSim(false));
  el('btnSimReport').addEventListener('click', () => { if (sim) (sim.showReport ? renderSimQ() : renderSimReport()); });

  // Klik na kôd pitanja (#9557) kopira adresu tog pitanja — za deljenje u porukama/grupama.
  document.addEventListener('click', (ev) => {
    const qn = ev.target.closest && ev.target.closest('.qNum[data-qid]');
    if (!qn || FILE_MODE) return;
    const adresa = location.origin + location.pathname + '#/p/' + qn.dataset.qid;
    const potvrdi = () => {
      const staro = qn.textContent;
      qn.textContent = L('linkCopied');
      setTimeout(() => { qn.textContent = staro; }, 1200);
    };
    // tooltip obećava kopiranje — ako pregledač ne da (nema API-ja, odbijena dozvola),
    // adresa se pokaže u prozorčetu odakle može ručno da se prekopira
    const rezerva = () => { try { window.prompt(L('qNumTip2'), adresa); } catch (e2) { /* ništa */ } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(adresa).then(potvrdi).catch(rezerva);
    else rezerva();
  });

  // Klik na sliku pitanja otvara uvećan prikaz preko celog ekrana; klik ili Escape zatvara.
  document.addEventListener('click', (ev) => {
    const slika = ev.target.closest && ev.target.closest('img.qImg');
    if (!slika) return;
    if (!slika.naturalWidth) return;                  // slika se nije učitala — nema šta da se uveća
    if (document.getElementById('imgZoom')) return;   // jedno uvećanje, ne gomila njih jedno preko drugog
    const z = document.createElement('div');
    z.id = 'imgZoom';
    const im = document.createElement('img');
    im.src = slika.src; im.alt = slika.alt;
    z.appendChild(im);
    // Zatvaranje na JEDNOM mestu. Ranije se osluškivač za Escape skidao samo ako se
    // zatvori Escapeom — ko zatvara klikom, ostavljao je po jedan osluškivač za svako
    // otvaranje, pa su se gomilali do kraja sesije.
    // Na telefonu je dugme Nazad prirodan potez za zatvaranje punog ekrana. Bez ovoga
    // ono promeni prikaz ispod, a uvećanje ostane da visi preko novog ekrana.
    const zatvori = () => {
      z.remove();
      document.removeEventListener('keydown', naEscape);
      window.removeEventListener('hashchange', zatvori);
    };
    const naEscape = (e2) => { if (e2.key === 'Escape') zatvori(); };
    z.addEventListener('click', zatvori);
    document.addEventListener('keydown', naEscape);
    window.addEventListener('hashchange', zatvori);
    document.body.appendChild(z);
  });

  // Prečice: ← → kretanje, 1–9 izbor odgovora, Enter potvrda/sledeće
  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const qv = el('view-question').classList.contains('active');
    const sv = el('view-sim').classList.contains('active');
    if (!qv && !sv) return;
    if (sv && sim && sim.showReport) return;   // dok je Izveštaj otvoren, prečice ne diraju pitanja
    const root = qv ? el('qCard') : el('simQCard');
    const actionBtns = [...root.querySelectorAll('.qActions button')];
    if (e.key === 'ArrowRight') {
      const b = actionBtns.find((x) => /→|Sledeće|Следеће|Preskoči|Прескочи/.test(x.textContent));
      if (b) { b.click(); e.preventDefault(); }
    } else if (e.key === 'ArrowLeft') {
      const b = actionBtns.find((x) => /←|Prethodno|Претходно/.test(x.textContent));
      if (b) { b.click(); e.preventDefault(); }
    } else if (/^[1-9]$/.test(e.key)) {
      const cs = [...root.querySelectorAll('.choice')].filter((x) => !x.disabled);
      const c = cs[+e.key - 1];
      if (c) { c.click(); e.preventDefault(); }
    } else if (e.key === 'Enter') {
      const b = actionBtns.find((x) => x.classList.contains('primary') && !x.disabled);
      if (b && document.activeElement !== b) { b.click(); e.preventDefault(); }
    }
  });
  el('btnScript').addEventListener('click', () => {
    S.script = S.script === 'l' ? 'c' : 'l'; save();
    applyScript();
    current.redraw();          // ostani na istom ekranu, samo drugo pismo
  });
  // Tema: podrazumevano prati sistem; prekidač pamti izbor. Simulacija je uvek svetla (CSS).
  function applyTheme() {
    const dark = S.theme === 'dark' || (S.theme == null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('dark', dark);
    el('btnTheme').textContent = dark ? '☀️' : '🌙';
  }
  el('btnTheme').addEventListener('click', () => {
    const dark = document.body.classList.contains('dark');
    S.theme = dark ? 'light' : 'dark'; save();
    applyTheme();
  });
  // Veličina slova: 90–125%. Granice su na jednom mestu (FS_MIN/FS_MAX u normalizeState),
  // pa dugmad i učitano stanje ne mogu da se raziđu.
  function applyFont() {
    // osnova zavisi od širine ekrana (mali ekrani imaju manju osnovu), korisnički izbor je množilac
    const osnova = window.matchMedia('(max-width: 560px)').matches ? 15 : 16;
    const f = S.fs || 1;
    document.documentElement.style.fontSize = Math.round(osnova * f) + 'px';
    // dugme koje više nema šta da uradi mora i da IZGLEDA tako — inače korisnik kucka uprazno
    const m = el('btnFontMinus'), p = el('btnFontPlus');
    const naDnu = f <= FS_MIN + 1e-6, naVrhu = f >= FS_MAX - 1e-6;
    m.disabled = naDnu; p.disabled = naVrhu;
    m.title = naDnu ? L('fsMin') : L('fsSmaller');
    p.title = naVrhu ? L('fsMax') : L('fsBigger');
    m.setAttribute('aria-label', m.title);
    p.setAttribute('aria-label', p.title);
  }
  window.matchMedia('(max-width: 560px)').addEventListener('change', applyFont);
  el('btnFontMinus').addEventListener('click', () => { S.fs = Math.max(FS_MIN, round2((S.fs || 1) - FS_KORAK)); save(); applyFont(); });
  el('btnFontPlus').addEventListener('click', () => { S.fs = Math.min(FS_MAX, round2((S.fs || 1) + FS_KORAK)); save(); applyFont(); });
  function applyScript() {
    el('btnScript').innerHTML =
      `<span class="${S.script === 'c' ? 'segOn' : 'segOff'}">ЋИР</span><span class="segSep">|</span><span class="${S.script === 'l' ? 'segOn' : 'segOff'}">LAT</span>`;
    el('brandTitle').textContent = L('brand');
    el('btnHome').textContent = L('home');
    el('btnFinishSim').textContent = L('finishSim');
    el('btnSimReport').textContent = L('report');
    { const os = el('offlineStrip'); if (os) os.textContent = L('offline'); }
    document.title = L('brand') + ' — ' + (S.script === 'l' ? 'vežbanje' : 'вежбање');
    renderPodnozje();
  }

  // ---------- Podnožje ----------
  // Preuzima ono što je do sada zatrpavalo karticu podešavanja (izvor baze, verzija,
  // prijava greške) i stavlja ga tamo gde ljudi i inače traže takve podatke.
  // Namerno se NE prikazuje tokom simulacije — pravi ispit nema podnožje.
  function renderPodnozje() {
    const f = el('podnozje');
    if (!f) return;
    f.innerHTML = `<div class="podnozjeRed"><b>${escapeHtml(L('brand'))}</b> — ${L('podnozjeOpis')}</div>
      <div class="podnozjeRed mut">${L('podnozjeBaza').split('@1').join(Q.length).split('@2').join(D.generated).split('@3').join(window.APP_V || 0)}</div>
      <div class="podnozjeRed podnozjeAkcije">
        ${prijavaRadi() ? `<button type="button" class="secondary sBtn" id="btnFeedback">${L('feedback')}</button>` : ''}
        <a class="bcLink" href="${REPO}" target="_blank" rel="noopener">${L('podnozjeKod')}</a>
      </div>
      <div class="podnozjeRed mut">${L('podnozjePrivatnost')}</div>`;
    const bf = el('btnFeedback');
    if (bf) bf.addEventListener('click', otvoriPrijavu);
  }

  // Dugoživeći tab: na povratak u tab (i na ~5 min) proveri da li postoji nova verzija fajlova.
  const BOOT_V = window.APP_V || 0;
  function checkVersion() {
    if (!BOOT_V || FILE_MODE || document.getElementById('updBar')) return;
    const sc = document.createElement('script');
    sc.src = 'version.js?ts=' + Date.now();
    sc.onload = () => {
      sc.remove();
      if (window.APP_V !== BOOT_V && !document.getElementById('updBar')) {
        const b = document.createElement('div');
        b.id = 'updBar';
        b.innerHTML = `<span>${escapeHtml(L('updNote'))}</span><button class="primary" id="updBtn">${escapeHtml(L('updBtn'))}</button>`;
        document.body.appendChild(b);
        b.querySelector('#updBtn').addEventListener('click', () => location.reload());
      }
    };
    sc.onerror = () => sc.remove();
    document.head.appendChild(sc);
  }
  // ---------- Provera novije verzije na javnom repozitorijumu ----------
  // Čita se isključivo BROJ verzije (obični tekst) i poredi sa lokalnim.
  // Preuzeti sadržaj se NIKADA ne izvršava; ako nema interneta, tiho se odustaje.
  const REPO = 'https://github.com/MilanMilojevic/vozacki-a';
  const REPO_VER = 'https://raw.githubusercontent.com/MilanMilojevic/vozacki-a/main/version.js';
  const REPO_ZIP = REPO + '/archive/refs/heads/main.zip';

  async function dohvatiUdaljenuVerziju() {
    const res = await fetch(REPO_VER + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const tekst = (await res.text()).slice(0, 200);
    const m = tekst.match(/APP_V\s*=\s*(\d{1,6})/);
    if (!m) throw new Error('neočekivan sadržaj');
    return parseInt(m[1], 10);
  }

  function prikaziNovuVerziju(nova, rucno) {
    if (document.getElementById('repoUpd')) return;
    const b = document.createElement('div');
    b.id = 'repoUpd';
    b.setAttribute('role', 'status');
    b.innerHTML = `<div><b>${escapeHtml(L('updRepoTitle'))}</b>
      <div class="mut" style="font-size:.86rem;margin-top:2px">${escapeHtml(L('updRepoBody').replace('#A', BOOT_V).replace('#B', nova))}</div></div>
      <div class="repoUpdBtns">
        <a class="primary repoUpdLink" href="${REPO_ZIP}" target="_blank" rel="noopener">${escapeHtml(L('updRepoGet'))}</a>
        <button type="button" class="secondary sBtn" id="repoUpdLater">${escapeHtml(L('updRepoLater'))}</button>
        <button class="secondary sBtn" id="repoUpdOff">${escapeHtml(L('updRepoOff'))}</button>
      </div>`;
    document.body.appendChild(b);
    const zatvori = () => { S.updSeen = nova; save(); b.remove(); };
    b.querySelector('#repoUpdLater').addEventListener('click', zatvori);
    b.querySelector('#repoUpdOff').addEventListener('click', () => { S.noUpd = 1; zatvori(); renderHome(); });
  }

  let proveraUToku = false;
  async function proveriRepo(rucno, dugme) {
    if (proveraUToku) return;   // bez ovoga N klikova = N zahteva i N poruka jedna za drugom
    proveraUToku = true;
    if (dugme) dugme.disabled = true;
    try {
      const nova = await dohvatiUdaljenuVerziju();
      if (nova > BOOT_V && (rucno || nova !== S.updSeen)) { prikaziNovuVerziju(nova, rucno); return; }
      if (rucno) alert(L('updRepoNone').replace('#A', BOOT_V));
    } catch (e) {
      if (rucno) alert(L('updRepoFail'));
    } finally {
      proveraUToku = false;
      if (dugme) dugme.disabled = false;
    }
  }

  // automatska provera najviše jednom dnevno, i to samo ako korisnik nije isključio
  function mozdaProveriRepo() {
    if (S.noUpd || !BOOT_V) return;
    const dan = 24 * 60 * 60 * 1000;
    if (S.updAt && Date.now() - S.updAt < dan) return;
    S.updAt = Date.now(); save();
    setTimeout(() => proveriRepo(false), 2500);
  }
  mozdaProveriRepo();

  setInterval(checkVersion, 5 * 60 * 1000);

  // ---------- Anonimna statistika poseta (GoatCounter — bez kolačića) ----------
  // Broji samo posete i koji se delovi aplikacije koriste; nikakvi lični podaci ni napredak.
  // Učitava se ISKLJUČIVO na javnoj adresi (nikad lokalno ni sa file://) i poštuje "Do Not Track".
  if (location.protocol === 'https:' && location.hostname !== 'localhost' && navigator.doNotTrack !== '1') {
    window.goatcounter = { no_onload: true };
    const gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://gc.zgo.at/count.js';
    gs.dataset.goatcounter = 'https://vozacki.goatcounter.com/count';
    gs.addEventListener('load', () => {
      const broji = () => { try { window.goatcounter.count({ path: '/' + (curHash || '#/') }); } catch (e) { /* statistika nije presudna */ } };
      broji();
      window.addEventListener('hashchange', broji);
    });
    document.head.appendChild(gs);
  }

  // ---------- Slika rezultata simulacije (za deljenje) ----------
  // Crta se u samom pregledaču; nema ni imena ni ijednog ličnog podatka — samo rezultat i datum.
  function nacrtajRezultat(rec) {
    const W = 1080, H = 1080;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const polozio = !!rec.passed;

    g.fillStyle = polozio ? '#12603a' : '#7a2620';
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.08)';
    g.beginPath(); g.moveTo(0, H * 0.72); g.lineTo(W, H * 0.6); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)';
    g.lineWidth = 10; g.setLineDash([54, 40]);
    g.beginPath(); g.moveTo(0, H * 0.88); g.lineTo(W, H * 0.76); g.stroke();
    g.setLineDash([]);

    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.font = '600 40px "Segoe UI", Arial, sans-serif';
    g.fillText(L('shareTitle'), W / 2, 150);

    g.font = '700 210px "Segoe UI", Arial, sans-serif';
    g.fillText(rec.score + ' / ' + rec.total, W / 2, 400);
    g.font = '500 46px "Segoe UI", Arial, sans-serif';
    g.fillText(L('points'), W / 2, 462);

    g.font = '700 74px "Segoe UI", Arial, sans-serif';
    g.fillText(polozio ? L('passed') : L('failed'), W / 2, 590);

    const d = new Date(rec.d || Date.now());
    const ds = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear() + '.';
    g.font = '400 38px "Segoe UI", Arial, sans-serif';
    g.fillStyle = 'rgba(255,255,255,.85)';
    g.fillText(ds + '  ·  ' + SIM_N + ' ' + L('pitanjaMn') + '  ·  45 min', W / 2, 660);

    g.font = '600 34px "Segoe UI", Arial, sans-serif';
    g.fillStyle = 'rgba(255,255,255,.95)';
    g.fillText('milanmilojevic.github.io/vozacki-a', W / 2, H - 90);
    g.font = '400 28px "Segoe UI", Arial, sans-serif';
    g.fillStyle = 'rgba(255,255,255,.75)';
    g.fillText(L('freeNote') + ' · ' + L('officialBase'), W / 2, H - 46);
    return c;
  }

  let deljenjeUToku = false;
  async function podeliRezultat(rec, dugme) {
    if (deljenjeUToku) return;   // svaki klik crta platno 1080×1080; deset klikova = deset platna
    deljenjeUToku = true;
    if (dugme) dugme.disabled = true;
    try {
      const c = nacrtajRezultat(rec);
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
      if (!blob) throw new Error('nema slike');
      const fajl = new File([blob], 'vozacki-a-rezultat.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [fajl] })) {
        try {
          await navigator.share({ files: [fajl], title: L('shareTitle') });
          return;
        } catch (e) {
          // Zatvaranje sistemskog prozora „Podeli" (dodir izvan, dugme Nazad) stiže kao
          // AbortError. To NIJE greška — korisnik se predomislio, ne treba mu poruka.
          if (e && e.name === 'AbortError') return;
          // svaka druga greška: tiho pređi na preuzimanje slike
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vozacki-a-rezultat.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      alert(L('shareFail'));
    } finally {
      deljenjeUToku = false;
      if (dugme) dugme.disabled = false;
    }
  }

  // ---------- Prijava greške/predloga ----------
  // Google forma, otvorena sa VEĆ POPUNJENIM tehničkim podacima — korisniku ostaje samo opis.
  // PODEŠAVANJE (jedino mesto): kad stigne "unapred popunjen link" forme, upiši adresu i imena polja.
  const PRIJAVA = {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdgpVGqDeK5JvBKlLJc-zA7skfsQca985UC4NMZ548WMnS07Q/viewform',
    poljeOpis: 'entry.506680323',      // "Opis greške ili predloga"
    poljeKontekst: 'entry.1474170296', // "Tehnički podaci (ne diraj)"
  };
  const prijavaRadi = () => !!(PRIJAVA.url && PRIJAVA.poljeKontekst);

  function otvoriPrijavu() {
    if (!prijavaRadi()) return;
    const kontekst = 'verzija ' + (window.APP_V || '?') + ' · stranica ' + (curHash || '#/') +
      ' · baza ' + D.generated + ' · ' + (navigator.userAgent || '').slice(0, 120);
    const u = new URL(PRIJAVA.url);
    u.searchParams.set('usp', 'pp_url');
    u.searchParams.set(PRIJAVA.poljeKontekst, kontekst);
    if (PRIJAVA.poljeOpis) u.searchParams.set(PRIJAVA.poljeOpis, '');
    window.open(u.toString(), '_blank', 'noopener');
  }

  // ---------- Nagoveštaj rada bez interneta ----------
  {
    const strip = el('offlineStrip');
    if (strip) {
      strip.textContent = L('offline');
      const osveziStrip = () => { strip.hidden = navigator.onLine !== false; };
      window.addEventListener('online', osveziStrip);
      window.addEventListener('offline', osveziStrip);
      osveziStrip();
    }
  }

  // ---------- Ponuda instalacije ----------
  // Android/Chromium: uhvati ponudu pregledača i prikaži diskretno dugme u alatima (van toka učenja).
  // iOS Safari: nema automatske ponude — jednokratni podsetnik kako se dodaje na početni ekran.
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvt = e;
    const b = el('btnInstall');
    if (b) b.style.display = '';
  });
  const jeStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function renderInstallHint() {
    if (FILE_MODE || jeStandalone() || S.iosSeen) return;
    const jeIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!jeIOS) return;
    const strip = document.createElement('div');
    strip.id = 'iosHint';
    strip.innerHTML = `<span>${L('iosHint')}</span><button type="button" class="zatvoriX" id="iosHintX" aria-label="Zatvori">✕</button>`;
    document.body.appendChild(strip);
    el('iosHintX').addEventListener('click', () => { S.iosSeen = 1; save(); strip.remove(); });
  }
  renderInstallHint();

  // ---------- Instalacija kao aplikacija (PWA) ----------
  // Service worker daje rad bez interneta i mogućnost "Dodaj na početni ekran".
  // updateViaCache: 'none' — worker i version.js se uvek proveravaju sveži, da
  // ažuriranja nikad ne zaglave u kešu.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => { /* nije presudno */ });
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });

  applyScript();
  applyTheme();
  applyFont();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { /* nije podržano — u redu */ });
  curHash = FILE_MODE ? '#/' : (location.hash || '#/');
  try { routeTo(curHash); } catch (err) { try { renderHome(); } catch (e2) { /* errStrip će prikazati */ } }
  initBackup();

  // ---------- Razvojni prozor (SAMO localhost — za automatske provere bodovanja) ----------
  if (location.hostname === 'localhost') {
    window.__dev = {
      get S() { return S; },
      get sim() { return sim; },
      normalizeState,
      pocetakDanaZa,
      record,
      inQueue,
    };
  }
})();

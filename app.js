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
  const few = (n) => [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100);   // paukal: 2, 3, 4, 22... "nova pitanja"
  const novihPitanja = (n) => (one(n) ? L('novoJd') : few(n) ? L('novaPk') : L('novihMn'));
  const poeni = (n) => n + ' ' + (one(n) ? L('pointsOne') : L('points'));   // "1 poen", "2 poena"
  const localDay = (ts) => { const d = ts ? new Date(ts) : new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
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
    // Simulacija: tekstovi DOSLOVNO sa zvanične strane eUprave (message_* u ep.js) — ne menjati po ukusu
    chooseN: { l: 'Broj potrebnih odgovora:', c: 'Број потребних одговора:' },   // message_ChoicesRequired
    brojPoena: { l: 'Broj poena', c: 'Број поена' },                              // message_NumberOfPoints
    markSim: { l: 'Obeležite pitanje', c: 'Обележите питање' },                  // #questionMarking
    simBrojOdgovora: { l: 'Niste označili potreban broj odgovora.', c: 'Нисте означили потребан број одговора.' },   // message_IncorrectNumberOfAnswers
    simKraj: { l: 'Ispit je završen!', c: 'Испит је завршен!' },
    simPolozio: { l: 'Čestitamo, položili ste teorijski ispit.', c: 'Честитамо, положили сте теоријски испит.' },   // message_Passed
    simPao: { l: 'Nažalost, niste položili teorijski ispit.', c: 'Нажалост, нисте положили теоријски испит.' },     // message_Failed
    chooseNVezba: { l: 'Izaberi @1 odgovora, pa potvrdi.', c: 'Изабери @1 одговора, па потврди.' },
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
    brPitanja: { l: 'Pitanja', c: 'Питања' },
    brNeotvoreno: { l: 'još nisi otvorio', c: 'још ниси отворио' },
    brZaPon: { l: 'Za ponavljanje', c: 'За понављање' },
    brObelezeno: { l: 'Obeleženo', c: 'Обележено' },
    brDanasOdg: { l: 'Danas', c: 'Данас' },
    brKakoSeRacuna: { l: 'Kako se ovo računa?', c: 'Како се ово рачуна?' },
    pojmovnikDugme: { l: '📖 Pojmovnik — @1 tematskih kartica', c: '📖 Појмовник — @1 тематских картица' },
    pojmovnikPod: { l: 'priručnik za čitanje van vežbanja; iste kartice iskaču i uz pitanja kojima odgovaraju', c: 'приручник за читање ван вежбања; исте картице искачу и уз питања којима одговарају' },
    podesavanjaDugme: { l: '⚙️ Podešavanja — cilj, datum ispita, čuvanje napretka, izgled', c: '⚙️ Подешавања — циљ, датум испита, чување напретка, изглед' },
    oblastiDugme: { l: '📊 Napredak po oblastima ›', c: '📊 Напредак по областима ›' },
    oblastiPod: { l: 'trake po oblastima, tačnost i procena — na strani Statistika', c: 'траке по областима, тачност и процена — на страни Статистика' },
    osveziBtn: { l: '🔄 Osveži znanje', c: '🔄 Освежи знање' },
    osveziTip: { l: 'Utvrđena pitanja koja nisi video duže od 21 dan. Tačan odgovor ih vraća na počinak; pogrešan ih vraća u red za ponavljanje.', c: 'Утврђена питања која ниси видео дуже од 21 дан. Тачан одговор их враћа на починак; погрешан их враћа у ред за понављање.' },
    osveziTitle: { l: 'Osvežavanje', c: 'Освежавање' },
    netacnoLbl: { l: 'netačno', c: 'нетачно' },
    today: { l: 'danas', c: 'данас' },
    yesterday: { l: 'juče', c: 'јуче' },
    daysAgo: { l: 'pre # dana', c: 'пре # дана' },
    ofQ: { l: 'od', c: 'од' },
    // JEDAN rečnik ponavljanja: „za ponavljanje" je krovni pojam (sve što je u redu),
    // „danas" i „kasnije" su njegovi delovi. Ranije su isti brojevi nosili četiri imena
    // (spremno / čeka / za ponavljanje / ponavljanja danas), a objašnjenje je bilo samo u
    // oblačiću koji na telefonu ne postoji.
    inQueue: { l: 'za ponavljanje', c: 'за понављање' },
    ponDanas: { l: 'danas', c: 'данас' },
    ponKasnije: { l: 'kasnije', c: 'касније' },
    pomocPonavljanje: { l: 'Kako radi ponavljanje?', c: 'Како ради понављање?' },
    preRokaNapomena: { l: 'Pitanja za kasnije možeš da vežbaš i pre roka: odgovor ulazi u statistiku pitanja, ali ne pomera raspored ponavljanja. Pogrešan odgovor važi uvek.', c: 'Питања за касније можеш да вежбаш и пре рока: одговор улази у статистику питања, али не помера распоред понављања. Погрешан одговор важи увек.' },
    waitInfo: { l: 'Današnja ponavljanja si prošao. Kasnije na redu: # pitanja (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Данашња понављања си прошао. Касније на реду: # питања (размакнуто понављање: сутра, па за 3 дана).' },
    drillWaitingBtn: { l: 'Vežbaj i ona za kasnije', c: 'Вежбај и она за касније' },
    drillEmpty: { l: 'Nema pitanja za ponavljanje — sve što si grešio je utvrđeno. 💪', c: 'Нема питања за понављање — све што си грешио је утврђено. 💪' },
    markedEmpty: { l: 'Nema obeleženih pitanja. Obeleži pitanje kvačicom dok vežbaš.', c: 'Нема обележених питања. Обележи питање квачицом док вежбаш.' },
    finishSim: { l: 'Kraj ispita', c: 'Крај испита' },   // #btnFinishExam
    simLeaveConfirm: { l: 'Napustiti simulaciju? Odgovori iz nje NEĆE biti sačuvani niti računati.', c: 'Напустити симулацију? Одговори из ње НЕЋЕ бити сачувани нити рачунати.' },
    passed: { l: 'POLOŽIO', c: 'ПОЛОЖИО' },
    failed: { l: 'NIJE POLOŽENO', c: 'НИЈЕ ПОЛОЖЕНО' },
    threshold: { l: 'prag', c: 'праг' },
    simWrongTitle: { l: 'Pogrešna i neodgovorena pitanja', c: 'Погрешна и неодговорена питања' },
    perCat: { l: 'Po oblastima', c: 'По областима' },
    backHome: { l: 'Na početnu', c: 'На почетну' },
    navPitanja: { l: 'Pitanja', c: 'Питања' },
    navPonavljanje: { l: 'Ponavljanje', c: 'Понављање' },
    navSim: { l: 'Ispit', c: 'Испит' },
    navStats: { l: 'Statistika', c: 'Статистика' },
    slovaLbl: { l: 'Veličina slova', c: 'Величина слова' },
    porVerzijaOK: { l: 'Imaš najnoviju verziju (@1).', c: 'Имаш најновију верзију (@1).' },
    temaLbl: { l: 'Tamna ili svetla tema', c: 'Тамна или светла тема' },
    pismoLbl: { l: 'Ćirilica ili latinica', c: 'Ћирилица или латиница' },
    navGlavna: { l: 'Glavna navigacija', c: 'Главна навигација' },
    preskoci: { l: 'Preskoči na sadržaj', c: 'Прескочи на садржај' },
    porExport: { l: 'Napredak je sačuvan u fajl @1', c: 'Напредак је сачуван у фајл @1' },
    porReset: { l: 'Napredak je obrisan. Krećeš iz početka.', c: 'Напредак је обрисан. Крећеш из почетка.' },
    porUvoz: { l: 'Napredak je učitan.', c: 'Напредак је учитан.' },
    porObelezeno: { l: 'Pitanje je obeleženo · ukupno @1', c: 'Питање је обележено · укупно @1' },
    porOdobelezeno: { l: 'Oznaka je uklonjena · ukupno @1', c: 'Ознака је уклоњена · укупно @1' },
    porPovezano: { l: 'Automatsko čuvanje je uključeno.', c: 'Аутоматско чување је укључено.' },
    porNemaPitanja: { l: 'To pitanje više ne postoji u bazi.', c: 'То питање више не постоји у бази.' },
    porNemaPregleda: { l: 'Taj pregled simulacije ne postoji.', c: 'Тај преглед симулације не постоји.' },
    porSimPrekinuta: { l: 'Taj ispit više nije u toku.', c: 'Тај испит више није у току.' },
    porGreskaAdrese: { l: 'Ta adresa nije mogla da se otvori — evo početne strane.', c: 'Та адреса није могла да се отвори — ево почетне стране.' },
    porSimVracena: { l: 'Ispit je nastavljen tamo gde je stao — vreme je teklo i dok si bio odsutan.', c: 'Испит је настављен тамо где је стао — време је текло и док си био одсутан.' },
    porSimIsteklo: { l: 'Vreme za ispit je isteklo dok si bio odsutan — evo rezultata.', c: 'Време за испит је истекло док си био одсутан — ево резултата.' },
    drillEmptyNovi: { l: 'Ovde se skupljaju pitanja koja pogrešiš — vraćaju se sutra, pa za tri dana, dok ih ne savladaš. Još nisi odgovorio nijedno pitanje.', c: 'Овде се скупљају питања која погрешиш — враћају се сутра, па за три дана, док их не савладаш. Још ниси одговорио ниједно питање.' },
    krenimo: { l: '▶ Kreni: Sva pitanja', c: '▶ Крени: Сва питања' },
    otvoriSve: { l: 'Otvori sva pitanja', c: 'Отвори сва питања' },
    zatvoriSve: { l: 'Zatvori sva pitanja', c: 'Затвори сва питања' },
    planKratko: { l: 'Ostavi oba polja prazna ako ne želiš cilj. Dugme na početnoj daje tačno toliko pitanja — prvo ponavljanja, pa nova.', c: 'Остави оба поља празна ако не желиш циљ. Дугме на почетној даје тачно толико питања — прво понављања, па нова.' },
    planDetalji: { l: 'Kako se broji dnevni cilj?', c: 'Како се броји дневни циљ?' },
    newSim: { l: 'Nova simulacija', c: 'Нова симулација' },
    history: { l: 'Simulacije do sada', c: 'Симулације до сада' },
    noSims: { l: 'Još nijedna simulacija.', c: 'Још ниједна симулација.' },
    statsTitle: { l: 'Tačnost po oblastima', c: 'Тачност по областима' },
    catExpand: { l: 'Prikaži podoblasti', c: 'Прикажи подобласти' },
    catOpen: { l: 'Otvori oblast (spisak pitanja i vežbanje)', c: 'Отвори област (списак питања и вежбање)' },
    tour1: { l: 'Tvoj napredak u brojkama: koliko si odgovorio, koliko je za ponavljanje (danas i kasnije) i koliko si obeležio.', c: 'Твој напредак у бројкама: колико си одговорио, колико је за понављање (данас и касније) и колико си обележио.' },
    tour2: { l: 'Odavde kreće učenje: sva pitanja redom, sa objašnjenjem posle svakog odgovora.', c: 'Одавде креће учење: сва питања редом, са објашњењем после сваког одговора.' },
    tour3: { l: 'Pogrešna pitanja se sama vraćaju: odmah, pa sutradan, pa za tri dana — dok ih ne savladaš.', c: 'Погрешна питања се сама враћају: одмах, па сутрадан, па за три дана — док их не савладаш.' },
    tour4: { l: 'Simulacija je verna kopija pravog ispita: 41 pitanje, 45 minuta, prag 85%. Ostavi je za kraj pripreme.', c: 'Симулација је верна копија правог испита: 41 питање, 45 минута, праг 85%. Остави је за крај припреме.' },
    tour5: { l: 'Napredak po oblastima je na Statistici: traka za svaku oblast, tačnost i klik do spiska pitanja.', c: 'Напредак по областима је на Статистици: трака за сваку област, тачност и клик до списка питања.' },
    tour6: { l: 'Pojmovnik (jedno dugme, otvara se na klik): tematske kartice sa slikama i tabelama. Iste kartice iskaču i uz pitanja na koja se odnose.', c: 'Појмовник: тематске картице са сликама и табелама. Исте картице искачу и уз питања на која се односе.' },
    tour7: { l: 'Podešavanja se otvaraju na klik. Napredak se čuva u ovom pregledaču — odatle ga izvezi u fajl ili poveži stalno čuvanje — uradi to odmah, za svaki slučaj.', c: 'Напредак се чува у овом прегледачу. Овде га извези у фајл или повежи стално чување — уради то одмах, за сваки случај.' },
    tourNext: { l: 'Dalje', c: 'Даље' },
    tourSkip: { l: 'Preskoči', c: 'Прескочи' },
    tourDone: { l: 'Završi', c: 'Заврши' },
    tourReplay: { l: 'Vodič kroz aplikaciju', c: 'Водич кроз апликацију' },
    guideTitle: { l: '🎓 Kako da učiš — predloženi redosled', c: '🎓 Како да учиш — предложени редослед' },
    guideSub: { l: 'za one koji kreću iz početka; ako već imaš predznanje, slobodno preskoči', c: 'за оне који крећу из почетка; ако већ имаш предзнање, слободно прескочи' },
    feedback: { l: 'Prijavi grešku ili predlog', c: 'Пријави грешку или предлог' },

    trustTitle: { l: '🛡️ Zašto verovati ovoj vežbaonici', c: '🛡️ Зашто веровати овој вежбаоници' },
    trustBody: { l: `<ul class="trustList">
      <li><b>Baza je zvanična.</b> Svih 1327 pitanja, odgovora i slika dolazi sa eUprava servisa za kandidate (MUP). Poslednja provera: <b>@1</b> — nula izmena.</li>
      <li><b>Simulacija je merena, ne "po osećaju".</b> Sastav testa je upoređen sa <b>šest zvaničnih izvlačenja</b> pravog ispita i identičan je do poslednjeg poena (41 pitanje, 98 poena, ista matrica oblasti).</li>
      <li><b>Objašnjenja su pisana ručno</b>, uz doslovnu proveru ZOBS-a i Pravilnika, sa brojem člana — i nezavisno recenzirana. Tamo gde se ispitna baza razilazi sa važećim zakonom, to otvoreno piše.</li>
      <li><b>Kôd je javan.</b> Sve što aplikacija radi može da se proveri: <a href="https://github.com/MilanMilojevic/vozacki-a" target="_blank" rel="noopener">github.com/MilanMilojevic/vozacki-a</a>.</li>
      <li><b>Privatnost:</b> bez naloga, bez reklama; napredak ostaje samo na tvom uređaju. Meri se jedino anoniman broj poseta (bez kolačića; poštuje se „Do Not Track").</li>
    </ul>`, c: `<ul class="trustList">
      <li><b>База је званична.</b> Свих 1327 питања, одговора и слика долази са еУправа сервиса за кандидате (МУП). Последња провера: <b>@1</b> — нула измена.</li>
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
    // [9] „u podešavanjima" — na ekranu ne postoji ništa tako nazvano; grupa se zove „Dnevni cilj"
    examPlan: { l: 'predlog tempa: ~# @1 dnevno — „Predloži mi" u grupi „Dnevni cilj" (dole) ga upisuje kao cilj', c: 'предлог темпа: ~# @1 дневно — „Предложи ми" у групи „Дневни циљ" (доле) га уписује као циљ' },
    novoJd: { l: 'novo pitanje', c: 'ново питање' },
    novaPk: { l: 'nova pitanja', c: 'нова питања' },
    novihMn: { l: 'novih pitanja', c: 'нових питања' },
    planPremalo: { l: 'sa @1 dnevno do ispita prođeš ~@2 od @3 neodgovorenih — predlog: @4 dnevno', c: 'са @1 дневно до испита прођеш ~@2 од @3 неодговорених — предлог: @4 дневно' },
    imgFail: { l: 'Slika nije dostupna bez interneta — otvori ovo pitanje kad budeš na mreži pa ostaje sačuvana.', c: 'Слика није доступна без интернета — отвори ово питање кад будеш на мрежи па остаје сачувана.' },
    planPonavljanja: { l: 'za ponavljanje danas: #', c: 'за понављање данас: #' },
    planSim: { l: 'predlog: procena je @1 od 98 — uradi simulaciju danas', c: 'предлог: процена је @1 од 98 — уради симулацију данас' },
    planSimNedelja: { l: 'poslednja nedelja — po jedna simulacija dnevno', c: 'последња недеља — по једна симулација дневно' },
    endTitle: { l: 'Kraj spiska — prošao si # &.', c: 'Крај списка — прошао си # &.' },
    pitanjeJd: { l: 'pitanje', c: 'питање' },
    pitanjaMn: { l: 'pitanja', c: 'питања' },
    endWrongBtn: { l: '🔁 Ponovi pogrešna iz ovog spiska (#)', c: '🔁 Понови погрешна из овог списка (#)' },
    endNextSub: { l: 'Sledeća podoblast: #', c: 'Следећа подобласт: #' },
    endNextCat: { l: 'Sledeća oblast: #', c: 'Следећа област: #' },
    endQueue: { l: '🔁 Ponavljanje: # danas na redu', c: '🔁 Понављање: # данас на реду' },
    endAllClear: { l: 'Red za ponavljanje je potpuno prazan — sve što si učio je utvrđeno. 🎉', c: 'Ред за понављање је потпуно празан — све што си учио је утврђено. 🎉' },
    endSimBtn: { l: '🏁 Simulacija ispita', c: '🏁 Симулација испита' },
    naIspitu: { l: 'na ispitu: #', c: 'на испиту: #' },
    shareBtn: { l: '📤 Podeli rezultat', c: '📤 Подели резултат' },   // pravi karticu za deljenje; nije snimak ekrana
    shareDone: { l: 'Slika rezultata je preuzeta.', c: 'Слика резултата је преузета.' },
    historyOlder: { l: 'Starije simulacije (@1)', c: 'Старије симулације (@1)' },
    shareTitle: { l: 'Simulacija ispita — A kategorija', c: 'Симулација испита — А категорија' },
    shareFail: { l: 'Slika nije mogla da se napravi', c: 'Слика није могла да се направи' },
    freeNote: { l: 'besplatna vežbaonica', c: 'бесплатна вежбаоница' },
    fsSmaller: { l: 'Smanji slova', c: 'Смањи слова' },
    fsBigger: { l: 'Povećaj slova', c: 'Повећај слова' },
    close: { l: 'Zatvori', c: 'Затвори' },
    sekDeo: { l: 'Prikazan je deo kartice koji se odnosi na ovu podoblast.', c: 'Приказан је део картице који се односи на ову подобласт.' },
    sekCela: { l: 'Prikaži celu karticu', c: 'Прикажи целу картицу' },
    statsTip: { l: 'Isti pregled kao na početnoj, uz tačnost: klik na naziv otvara spisak pitanja, strelica otklapa podoblasti. Boja tačnosti: zeleno od 85% (prag ispita), žuto 70–84%, crveno ispod 70%.', c: 'Исти преглед као на почетној, уз тачност: клик на назив отвара списак питања, стрелица отклапа подобласти. Боја тачности: зелено од 85% (праг испита), жуто 70–84%, црвено испод 70%.' },
    grupaNapredak: { l: 'Napredak', c: 'Напредак' },
    grupaAplikacija: { l: 'Aplikacija', c: 'Апликација' },
    grupaOprezno: { l: 'Oprezno', c: 'Опрезно' },
    resetNapomena: { l: 'Briše sve na ovom uređaju: odgovore, obeležena pitanja, simulacije i dnevni cilj. Ne može da se poništi.', c: 'Брише све на овом уређају: одговоре, обележена питања, симулације и дневни циљ. Не може да се поништи.' },
    podnozjeOpis: { l: 'Besplatna vežbaonica za teorijski ispit, A kategorija. Bez reklama, bez naloga i bez plaćanja.', c: 'Бесплатна вежбаоница за теоријски испит, А категорија. Без реклама, без налога и без плаћања.' },
    podnozjeBaza: { l: 'Zvanična baza eUprave · @1 pitanja · izvučena @2 · poslednja provera @3 · verzija @4', c: 'Званична база еУправе · @1 питања · извучена @2 · последња провера @3 · верзија @4' },
    podnozjePrivatnost: { l: 'Napredak ostaje na tvom uređaju. Ništa se ne šalje i ništa se ne čuva kod nas.', c: 'Напредак остаје на твом уређају. Ништа се не шаље и ништа се не чува код нас.' },
    podnozjeKod: { l: 'Kôd na GitHub-u', c: 'Кôд на GitHub-у' },
    datumLos: { l: 'Datum nije potpun. Unesi ga u obliku dan-mesec-godina, sa punom godinom (npr. 2026).', c: 'Датум није потпун. Унеси га у облику дан-месец-година, са пуном годином (нпр. 2026).' },
    datumOpseg: { l: 'Godina mora biti između @1. i @2. Ako si otkucao samo dve cifre, dopiši punu godinu.', c: 'Година мора бити између @1. и @2. Ако си откуцао само две цифре, допиши пуну годину.' },
    datumProslost: { l: 'Taj datum je prošao. Unesi datum ispita koji tek dolazi, ili obriši polje ako ne želiš odbrojavanje.', c: 'Тај датум је прошао. Унеси датум испита који тек долази, или обриши поље ако не желиш одбројавање.' },
    importPrevelik: { l: 'Ta datoteka je prevelika da bi bila sačuvan napredak. Izaberi datoteku koju je napravilo dugme „Sačuvaj napredak (fajl)".', c: 'Та датотека је превелика да би била сачуван напредак. Изабери датотеку коју је направило дугме „Сачувај напредак (фајл)".' },
    importDeo: { l: 'Uvezeno je # od @ zapisa. Ostali se ne nalaze u trenutnoj bazi pitanja, pa su izostavljeni.', c: 'Увезено је # од @ записа. Остали се не налазе у тренутној бази питања, па су изостављени.' },
    rezervaDozvola: { l: '⚠ Rezerva u fajl je isključena jer je pregledač povukao dozvolu za pisanje. U podešavanjima je dugme da je ponovo uključiš.', c: '⚠ Резерва у фајл је искључена јер је прегледач повукао дозволу за писање. У подешавањима је дугме да је поново укључиш.' },
    rezervaNeuspeh: { l: '⚠ Rezerva u fajl trenutno ne prolazi — fajl je možda otvoren u drugom programu ili je disk pun. Napredak je i dalje u pregledaču, a upis se pokušava ponovo.', c: '⚠ Резерва у фајл тренутно не пролази — фајл је можда отворен у другом програму или је диск пун. Напредак је и даље у прегледачу, а упис се покушава поново.' },
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
    planIspunjenJos: { l: '✅ Dnevni cilj je ispunjen. Za ponavljanje ostaje još: @1 — možeš i danas, ili sutra.', c: '✅ Дневни циљ је испуњен. За понављање остаје још: @1 — можеш и данас, или сутра.' },
    planNemaPon: { l: 'nema na redu', c: 'нема на реду' },
    planPodesi: { l: 'Podesi cilj', c: 'Подеси циљ' },
    planOdNaRedu: { l: 'U redu za ponavljanje čeka @1 — to je zaostatak od ranije, ne zadatak za danas. Cilj uzima najviše @2 dnevno, a danas ti je od toga ostalo još @3.', c: 'У реду за понављање чека @1 — то је заостатак од раније, не задатак за данас. Циљ узима највише @2 дневно, а данас ти је од тога остало још @3.' },
    sudStize: { l: '✅ Ovim tempom stižeš: do ispita otvoriš svih @1 neodgovorenih i stigneš sva ponavljanja koja iz njih izađu.', c: '✅ Овим темпом стижеш: до испита отвориш свих @1 неодговорених и стигнеш сва понављања која из њих изађу.' },
    sudStizeSvePon: { l: '✅ Sve gradivo je otvoreno — ovim tempom stižeš i ponavljanja koja čekaju.', c: '✅ Све градиво је отворено — овим темпом стижеш и понављања која чекају.' },
    sudPonNeStaju: { l: '⚠ Sve gradivo je otvoreno, ali zaostala ponavljanja ne staju: čeka @1, a cilj do ispita stigne @2. Podigni ponavljanja ili prihvati da deo ostane neponovljen.', c: '⚠ Све градиво је отворено, али заостала понављања не стају: чека @1, а циљ до испита стигне @2. Подигни понављања или прихвати да део остане непоновљен.' },
    sudGradivoDa: { l: '⚠ Gradivo stižeš, ali ne i ponavljanja: uz @1 novih dnevno u red do ispita ulazi bar @2, a cilj stigne @3. Oko @4 pitanja ćeš videti samo jednom — a jedno viđenje je premalo da bi ostalo u glavi.', c: '⚠ Градиво стижеш, али не и понављања: уз @1 нових дневно у ред до испита улази бар @2, а циљ стигне @3. Око @4 питања ћеш видети само једном — а једно виђење је премало да би остало у глави.' },
    sudNeStize: { l: '⛔ Ovim tempom NE stižeš gradivo: uz @1 novih dnevno do ispita otvoriš @2 od @3 neodgovorenih, pa @4 pitanja ostaje neviđeno. To jeste prepreka — na ispitu se pitanja izvlače iz cele baze.', c: '⛔ Овим темпом НЕ стижеш градиво: уз @1 нових дневно до испита отвориш @2 од @3 неодговорених, па @4 питања остаје невиђено. То јесте препрека — на испиту се питања извлаче из целе базе.' },
    lostTempo: { l: 'Podigni na @1 novih i @2 ponavljanja dnevno', c: 'Подигни на @1 нових и @2 понављања дневно' },
    lostPrio: { l: 'Uči prvo ono što se na ispitu i pojavljuje', c: 'Учи прво оно што се на испиту и појављује' },
    lostPrioUkljucen: { l: 'Prioritet po težini na ispitu je uključen: nova pitanja idu redom od podoblasti koje ispit najviše nosi.', c: 'Приоритет по тежини на испиту је укључен: нова питања иду редом од подобласти које испит највише носи.' },
    viskDanas: { l: 'Danas si uradio @1 novih, a cilj je @2 — @3 preko cilja.', c: 'Данас си урадио @1 нових, а циљ је @2 — @3 преко циља.' },
    viskAuto: { l: ' Sutrašnja kvota će zato biti manja.', c: ' Сутрашња квота ће зато бити мања.' },
    autoNaslov: { l: 'Cilj se sam računa do ispita', c: 'Циљ се сам рачуна до испита' },
    autoOpis: { l: 'Kvota se svakog dana izvodi iz onoga što je ostalo i broja dana do ispita. Uradiš više danas — sutra ti traži manje.', c: 'Квота се сваког дана изводи из онога што је остало и броја дана до испита. Урадиш више данас — сутра ти тражи мање.' },
    autoBezDatuma: { l: '⚠ Cilj se ne može sam računati bez datuma ispita — upiši ga iznad.', c: '⚠ Циљ се не може сам рачунати без датума испита — упиши га изнад.' },
    prosaoDatum: { l: '⚠ Upisani datum ispita (@1) je prošao. Upiši novi datum, pa će cilj i procene ponovo raditi.', c: '⚠ Уписани датум испита (@1) је прошао. Упиши нови датум, па ће циљ и процене поново радити.' },
    prioNaslov: { l: 'Prioritet po težini na ispitu', c: 'Приоритет по тежини на испиту' },
    sansaNaslov: { l: 'Šansa da položiš', c: 'Шанса да положиш' },
    sansaKako: { l: 'Računato iz tvoje tačnosti po podoblastima i zvaničnog sastava testa (41 pitanje, @1 poena, prag @2): za svako mesto na testu koliko je verovatno da ga pogodiš, pa tačna raspodela zbira. Procena, ne obećanje — pretpostavlja da su pitanja nezavisna i da ti tačnost ostaje ista.', c: 'Рачунато из твоје тачности по подобластима и званичног састава теста (41 питање, @1 поена, праг @2): за свако место на тесту колико је вероватно да га погодиш, па тачна расподела збира. Процена, не обећање — претпоставља да су питања независна и да ти тачност остаје иста.' },
    spremanNaslov: { l: 'Kad smeš da kažeš „spreman sam"', c: 'Кад смеш да кажеш „спреман сам"' },
    spremanBroj: { l: 'Bar @1 simulacija ukupno (imaš @2)', c: 'Бар @1 симулација укупно (имаш @2)' },
    spremanDani: { l: 'Rađene bar @1 različita dana (imaš @2)', c: 'Рађене бар @1 различита дана (имаш @2)' },
    spremanNiz: { l: 'Poslednje @1 položene, svaka sa bar @2 poena preko praga', c: 'Последње @1 положене, свака са бар @2 поена преко прага' },
    spremanSansa: { l: 'Procena bar @1% (sada @2%)', c: 'Процена бар @1% (сада @2%)' },
    spremanDa: { l: '✅ Sve četiri stavke stoje — ovo je samopouzdanje koje ima pokriće.', c: '✅ Све четири ставке стоје — ово је самопоуздање које има покриће.' },
    spremanNe: { l: 'Jedna položena simulacija nije dokaz: da ti je stvarna šansa 70%, tri zaredom bi ti se desile u trećini slučajeva. Zato ide i procena, i razmak od bar dan između simulacija.', c: 'Једна положена симулација није доказ: да ти је стварна шанса 70%, три заредом би ти се десиле у трећини случајева. Зато иде и процена, и размак од бар дан између симулација.' },
    simUcinak: { l: 'Položeno @1 od @2 · prosek @3 poena', c: 'Положено @1 од @2 · просек @3 поена' },
    prioOpis: { l: 'Nova pitanja idu redom od podoblasti koje ispit najviše nosi (preticanje 5 pitanja, brzine 3…), pa ono što se izostavi bude ono što se retko i pojavi.', c: 'Нова питања иду редом од подобласти које испит највише носи (претицање 5 питања, брзине 3…), па оно што се изостави буде оно што се ретко и појави.' },
    planUskladi: { l: 'Uskladi cilj', c: 'Усклади циљ' },
    planUskladjen: { l: 'Cilj je usklađen: @1 novih i @2 ponavljanja dnevno.', c: 'Циљ је усклађен: @1 нових и @2 понављања дневно.' },
    skociNaOblast: { l: 'Skoči na oblast', c: 'Скочи на област' },
    naVrh: { l: 'Na vrh', c: 'На врх' },
    oVezbaonici: { l: 'ℹ️ O vežbaonici — poreklo, pouzdanost, česta pitanja', c: 'ℹ️ О вежбаоници — порекло, поузданост, честа питања' },
    planVezbaj: { l: '▶ Vežbaj po planu', c: '▶ Вежбај по плану' },
    planNemaSta: { l: 'Za danas nema više — cilj je ispunjen.', c: 'За данас нема више — циљ је испуњен.' },
    planNemaDostupnih: { l: 'Nema više pitanja koja čekaju. Cilj ostaje za sutra.', c: 'Нема више питања која чекају. Циљ остаје за сутра.' },
    planBezDatuma: { l: 'Za predlog prvo unesi datum ispita.', c: 'За предлог прво унеси датум испита.' },
    planDatumProsao: { l: 'Datum ispita je prošao — unesi novi da bih mogao da računam.', c: 'Датум испита је прошао — унеси нови да бих могао да рачунам.' },
    planPredlogGotov: { l: 'Sačuvano kao cilj: @1 i @2 ponavljanja dnevno. Novo gradivo se završava # pre ispita — ti dani ostaju za ponavljanje i simulacije. Brojeve možeš da promeniš i ponovo sačuvaš.', c: 'Сачувано као циљ: @1 и @2 понављања дневно. Ново градиво се завршава # пре испита — ти дани остају за понављање и симулације. Бројеве можеш да промениш и поново сачуваш.' },
    planPredlogUsko: { l: 'Sačuvano kao cilj: @1 i @2 ponavljanja dnevno. Ispit je blizu, pa nema rezerve — novo gradivo ide do poslednjeg dana.', c: 'Сачувано као циљ: @1 и @2 понављања дневно. Испит је близу, па нема резерве — ново градиво иде до последњег дана.' },
    planPuno: { l: 'Sačuvano — ali # dnevno je puno. Računaj oko pola sata na svakih 100 pitanja. Uvek možeš da smanjiš.', c: 'Сачувано — али # дневно је пуно. Рачунај око пола сата на сваких 100 питања. Увек можеш да смањиш.' },
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
    planObjasnjenje: { l: 'Ostavi oba polja prazna ako ne želiš cilj. Kad ga postaviš, dugme na početnoj daje tačno toliko pitanja — prvo ponavljanja, pa nova. U ponavljanja ulaze i pogrešna pitanja i ona koja si pogodio iz prve (ta dobiju jednu potvrdu posle 3 dana). Ako pitanja na redu nema dovoljno, kvota se dopunjava utvrđenim pitanjima koja nisi video duže od 21 dan. Odgovor pre roka je vežbanje i ne puni kvotu ponavljanja.', c: 'Остави оба поља празна ако не желиш циљ. Кад га поставиш, дугме на почетној даје тачно толико питања — прво понављања, па нова. У понављања улазе и погрешна питања и она која си погодио из прве (та добију једну потврду после 3 дана). Ако питања на реду нема довољно, квота се допуњава утврђеним питањима која ниси видео дуже од 21 дан. Одговор пре рока је вежбање и не пуни квоту понављања.' },
    novihLbl: { l: 'Nova pitanja', c: 'Нова питања' },
    ponLbl: { l: 'Ponavljanja', c: 'Понављања' },
    planOstaje: { l: 'ostaje', c: 'остаје' },
    unosPrazno: { l: 'Unesi ceo broj od @1 do @2.', c: 'Унеси цео број од @1 до @2.' },
    unosSamoCifre: { l: 'Dozvoljene su samo cifre — bez slova, razmaka i zareza. Unesi ceo broj od @1 do @2.', c: 'Дозвољене су само цифре — без слова, размака и зареза. Унеси цео број од @1 до @2.' },
    unosPremalo: { l: 'Najmanje što može da se unese je @1.', c: 'Најмање што може да се унесе је @1.' },
    unosPreveliko: { l: 'Toliko ih nema — najviše je @2.', c: 'Толико их нема — највише је @2.' },
    skokVanOpsega: { l: 'Ovaj spisak ima @3. Unesi broj od @1 do @2.', c: 'Овај списак има @3. Унеси број од @1 до @2.' },
    planMaxNovih: { l: 'Neodgovorenih je ostalo @2 — više od toga ne može stati u jedan dan.', c: 'Неодговорених је остало @2 — више од тога не може стати у један дан.' },
    officialBase: { l: 'zvanična baza pitanja', c: 'званична база питања' },
    naIspituTip: { l: 'Koliko pitanja iz ove podoblasti nosi svaki pravi ispit — izmereno iz pet zvaničnih izvlačenja simulacije.', c: 'Колико питања из ове подобласти носи сваки прави испит — измерено из пет званичних извлачења симулације.' },
    qNumTip2: { l: 'Klik: kopiraj adresu ovog pitanja', c: 'Клик: копирај адресу овог питања' },
    uvecajSliku: { l: 'Uvećaj sliku', c: 'Увећај слику' },
    zoomVise: { l: 'Bliže', c: 'Ближе' },
    zoomManje: { l: 'Dalje', c: 'Даље' },
    imgAlt: { l: 'Slika uz pitanje — saobraćajna situacija ili znak; pitanje se odnosi na ono što je na slici.', c: 'Слика уз питање — саобраћајна ситуација или знак; питање се односи на оно што је на слици.' },
    grp1: { l: '1 · Osnovni pojmovi', c: '1 · Основни појмови' },
    grp2: { l: '2 · Ko ide prvi — prvenstvo i signalizacija', c: '2 · Ко иде први — првенство и сигнализација' },
    grp3: { l: '3 · Radnje vozilom', c: '3 · Радње возилом' },
    grp4: { l: '4 · Posebne situacije', c: '4 · Посебне ситуације' },
    grp5: { l: '5 · Propisi, dozvole i posledice', c: '5 · Прописи, дозволе и последице' },
    guideBody: { l: `<ol class="guideList">
      <li><b>Prvo pojmovi, pa pravila.</b> U Pojmovniku pročitaj redom: <i>Slični pojmovi</i> (šta je preticanje a šta obilaženje, odstojanje naspram rastojanja), <i>Put, kolovoz, trake</i> i <i>Kategorije vozila</i>. Bez tih reči ostalo gradivo zvuči kao strani jezik.</li>
      <li><b>Ko ide prvi.</b> Kartice <i>Prvenstvo prolaza</i>, <i>Semafori</i> i <i>Porodice saobraćajnih znakova</i> — to je srce ispita i najviše pitanja.</li>
      <li><b>Radnje vozilom.</b> <i>Skretanje i prestrojavanje</i>, <i>Preticanje i obilaženje</i>, <i>Zaustavljanje i parkiranje</i>, <i>Pokazivači pravca</i>, <i>Upotreba svetala</i>.</li>
      <li><b>Posebne situacije.</b> <i>Pešaci i dvotočkaši</i>, <i>Prelaz preko pruge</i>, <i>Autoput i motoput</i>, <i>Vozila pod pratnjom</i>, <i>Postupak kod nezgode</i>.</li>
      <li><b>Tek onda pitanja.</b> Kreni na <i>Sva pitanja</i> i idi redom — posle svakog odgovora pročitaj objašnjenje, i kad pogrešiš i kad pogodiš.</li>
      <li><b>Pusti aplikaciju da te vodi.</b> U <i>Ponavljanje</i> se sama vraćaju pogrešna pitanja (odmah, pa sutradan, pa za tri dana) — ali i pitanja tačna iz prve, jednom posle tri dana: jedan pogodak još nije zapamćeno.</li>
      <li><b>Simulacije na kraju.</b> Kad se u Statistici procena približi pragu (80 i više od 98 poena), radi <i>Simulaciju ispita</i> — 41 pitanje, 45 minuta, kao pravi ispit. Posle svake pregledaj greške.</li>
    </ol>
    <p class="mut">Kaznene mere uči poslednje i bez učenja iznosa napamet — u zvaničnom ispitu za A kategoriju te oblasti nema.</p>`,
      c: `<ol class="guideList">
      <li><b>Прво појмови, па правила.</b> У Појмовнику прочитај редом: <i>Слични појмови</i> (шта је претицање а шта обилажење, одстојање наспрам растојања), <i>Пут, коловоз, траке</i> и <i>Категорије возила</i>. Без тих речи остало градиво звучи као страни језик.</li>
      <li><b>Ко иде први.</b> Картице <i>Првенство пролаза</i>, <i>Семафори</i> и <i>Породице саобраћајних знакова</i> — то је срце испита и највише питања.</li>
      <li><b>Радње возилом.</b> <i>Скретање и престројавање</i>, <i>Претицање и обилажење</i>, <i>Заустављање и паркирање</i>, <i>Показивачи правца</i>, <i>Употреба светала</i>.</li>
      <li><b>Посебне ситуације.</b> <i>Пешаци и двоточкаши</i>, <i>Прелаз преко пруге</i>, <i>Аутопут и мотопут</i>, <i>Возила под пратњом</i>, <i>Поступак код незгоде</i>.</li>
      <li><b>Тек онда питања.</b> Крени на <i>Сва питања</i> и иди редом — после сваког одговора прочитај објашњење, и кад погрешиш и кад погодиш.</li>
      <li><b>Пусти апликацију да те води.</b> У <i>Понављање</i> се сама враћају погрешна питања (одмах, па сутрадан, па за три дана) — али и питања тачна из прве, једном после три дана: један погодак још није запамћено.</li>
      <li><b>Симулације на крају.</b> Кад се у Статистици процена приближи прагу (80 и више од 98 поена), ради <i>Симулацију испита</i> — 41 питање, 45 минута, као прави испит. После сваке прегледај грешке.</li>
    </ol>
    <p class="mut">Казнене мере учи последње и без учења износа напамет — у званичном испиту за А категорију те области нема.` },
    updNote: { l: 'Stigla je nova verzija aplikacije.', c: 'Стигла је нова верзија апликације.' },
    updBtn: { l: 'Osveži', c: 'Освежи' },
    updRepoTitle: { l: 'Postoji novija verzija aplikacije', c: 'Постоји новија верзија апликације' },
    updRepoBody: { l: 'Imaš verziju #A, a objavljena je #B. Preuzmi novu i prekopiraj preko postojeće fascikle — tvoj napredak ostaje netaknut (čuva se u pregledaču).', c: 'Имаш верзију #A, а објављена је #B. Преузми нову и прекопирај преко постојеће фасцикле — твој напредак остаје нетакнут (чува се у прегледачу).' },
    updRepoGet: { l: 'Preuzmi novu verziju', c: 'Преузми нову верзију' },
    updRepoLater: { l: 'Ne sad', c: 'Не сад' },
    updRepoCheck: { l: 'Proveri ima li novije verzije', c: 'Провери има ли новије верзије' },
    updRepoFail: { l: 'Provera nije uspela (nema veze sa internetom ili je izvor nedostupan).', c: 'Провера није успела (нема везе са интернетом или је извор недоступан).' },
    updRepoOff: { l: 'Ne proveravaj automatski', c: 'Не проверавај аутоматски' },
    thArea: { l: 'Oblast', c: 'Област' },
    thQ: { l: 'Pitanja', c: 'Питања' },
    thPts: { l: 'Poeni', c: 'Поени' },
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
    vezbajReady: { l: 'Ponovi današnja', c: 'Понови данашња' },
    dueTomorrow: { l: 'sutra', c: 'сутра' },
    dueDays: { l: 'za # dana', c: 'за # дана' },
    allPage: { l: 'Sva pitanja', c: 'Сва питања' },
    allPageSub: { l: 'redom, filteri, spisak', c: 'редом, филтери, списак' },
    nastaviOd: { l: 'Nastavi od @1. pitanja', c: 'Настави од @1. питања' },
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
    reviewOldNote: { l: 'Ova simulacija je iz starije verzije aplikacije (pre 27.08.2026), kad se tvoji odgovori još nisu čuvali — prikazana su samo pogrešna pitanja sa tačnim odgovorima.', c: 'Ова симулација је из старије верзије апликације (пре 27.08.2026), кад се твоји одговори још нису чували — приказана су само погрешна питања са тачним одговорима.' },
    historyTip: { l: 'Klikni na pokušaj za ceo pregled: svako pitanje, tvoj i tačan odgovor.', c: 'Кликни на покушај за цео преглед: свако питање, твој и тачан одговор.' },
    report: { l: 'Izveštaj', c: 'Извештај' },
    repAnswered: { l: 'Odgovoreno', c: 'Одговорено' },
    repMarked: { l: 'Obeleženo', c: 'Обележено' },
    backToTest: { l: 'Nazad', c: 'Назад' },   // #btnBack
    prevQ: { l: 'Prethodno pitanje', c: 'Претходно питање' },
    nextQ: { l: 'Sledeće pitanje', c: 'Следеће питање' },
    explTitle: { l: '💡 Objašnjenje', c: '💡 Објашњење' },
    explNote: { l: 'nezvanično; osnov: Zakon o bezbednosti saobraćaja (ZOBS)', c: 'незванично; основ: Закон о безбедности саобраћаја (ЗОБС)' },
    pojmovnik: { l: 'Pojmovnik — tematske kartice', c: 'Појмовник — тематске картице' },
    pojmovnikSub: { l: 'jedna kartica objašnjava celu grupu pitanja; iste kartice iskaču i uz pitanja', c: 'једна картица објашњава целу групу питања; исте картице искачу и уз питања' },
    readyTitle: { l: '🎯 Spremnost za ispit (procena)', c: '🎯 Спремност за испит (процена)' },
    readyNote: { l: 'Ukrštanje tvoje tačnosti sa zvaničnim šablonom testa (41 pitanje, 98 poena, prag @1). Procena je pouzdanija što više vežbaš.', c: 'Укрштање твоје тачности са званичним шаблоном теста (41 питање, 98 поена, праг @1). Процена је поузданија што више вежбаш.' },
    readyLoss: { l: 'Najviše te košta', c: 'Највише те кошта' },
    readyRough: { l: '⚠ gruba procena — još je malo odgovora', c: '⚠ груба процена — још је мало одговора' },
    searchPh: { l: '🔎 Pretraga pitanja (tekst ili #broj)…', c: '🔎 Претрага питања (текст или #број)…' },
    // čuvar je @1, a NE #: u samoj rečenici stoji i doslovno „#broj pitanja"
    searchEmpty: { l: 'Nema pogodaka za „@1". Probaj kraću reč ili #broj pitanja.', c: 'Нема погодака за „@1". Пробај краћу реч или #број питања.' },
    searchHits: { l: 'Pogodaka: @1', c: 'Погодака: @1' },
    searchHitsOne: { l: 'Jedan pogodak.', c: 'Један погодак.' },
    todayLbl: { l: 'Danas', c: 'Данас' },
    okShort: { l: 'tačno', c: 'тачно' },
    shufTip: { l: 'Vežbanje pokrenuto sa ove strane ide nasumičnim redosledom (ne znaš koje je sledeće). Spisak dole ostaje po redu, a „Nastavi" uvek ide redom. Klik na pitanje u spisku: počinje od njega, pa nastavlja izmešano.', c: 'Вежбање покренуто са ове стране иде насумичним редоследом (не знаш које је следеће). Списак доле остаје по реду, а „Настави" увек иде редом. Клик на питање у списку: почиње од њега, па наставља измешано.' },
    brojeviTip: { l: '<b>Za ponavljanje</b> su pitanja koja još nisu utvrđena — svako od njih nosi svoj rok, datum kad treba ponovo da ga vidiš.<br>· <b>danas</b> — rok im je danas ili je već prošao; ta te čekaju sada.<br>· <b>kasnije</b> — rok im tek dolazi, nekog od narednih dana. Svakog jutra deo njih pređe u „danas“.<br>· <b>za osvežavanje</b> — utvrđena pitanja koja nisi video duže od 21 dan; nisu u redu, ali ih plan dopunjuje kad spremnih nema dovoljno.<br><br><b>Zašto isti broj ume da stoji na dva mesta:</b> „Danas“ broji sva pitanja koja si danas radio, svako najviše jednom. „Ponavljanja“ u dnevnom cilju broje samo ona koja si radio PONOVO (ne nova) i ne pre roka. Zato ta dva broja umeju da budu ista, a umeju i da se razlikuju.<br><br><b>Zašto red raste dok učiš:</b> svako novo pitanje ulazi u red i traži bar jednu potvrdu. Dok god otvaraš nova, red raste; počinje da pada kad prestaneš da dodaješ nova.', c: '<b>За понављање</b> су питања која још нису утврђена — свако од њих носи свој рок, датум кад треба поново да га видиш.<br>· <b>данас</b> — рок им је данас или је већ прошао; та те чекају сада.<br>· <b>касније</b> — рок им тек долази, неког од наредних дана. Сваког јутра део њих пређе у „данас“.<br>· <b>за освежавање</b> — утврђена питања која ниси видео дуже од 21 дан; нису у реду, али их план допуњује кад спремних нема довољно.<br><br><b>Зашто исти број уме да стоји на два места:</b> „Данас“ броји сва питања која си данас радио, свако највише једном. „Понављања“ у дневном циљу броје само она која си радио ПОНОВО (не нова) и не пре рока. Зато та два броја умеју да буду иста, а умеју и да се разликују.<br><br><b>Зашто ред расте док учиш:</b> свако ново питање улази у ред и тражи бар једну потврду. Док год отвараш нова, ред расте; почиње да пада кад престанеш да додајеш нова.' },
    queueTip: { l: 'Razmaknuto ponavljanje: pogrešiš → pitanje je odmah na redu; pogodiš ga → vraća se sutra; opet pogodiš → za 3 dana; treći pogodak zaredom → utvrđeno je i izlazi iz reda. I pitanje koje si pogodio iz prve vraća se jednom, za 3 dana, da se potvrdi — pa izlazi. Tačan odgovor PRE roka je vežbanje i ne pomera raspored; pogrešan važi uvek. U dnevni cilj isto pitanje ulazi najviše jednom dnevno.', c: 'Размакнуто понављање: погрешиш → питање је одмах на реду; погодиш га → враћа се сутра; опет погодиш → за 3 дана; трећи погодак заредом → утврђено је и излази из реда. И питање које си погодио из прве враћа се једном, за 3 дана, да се потврди — па излази. Тачан одговор ПРЕ рока је вежбање и не помера распоред; погрешан важи увек. У дневни циљ исто питање улази највише једном дневно.' },
    legend: { l: '✓ utvrđeno · ✗ pogrešeno, za ponavljanje · ◐ tačno iz prve, čeka jednu potvrdu · • neodgovoreno · 🔖 obeleženo · 🖼 sa slikom · desno: broj tačnih/netačnih', c: '✓ утврђено · ✗ погрешено, за понављање · ◐ тачно из прве, чека једну потврду · • неодговорено · 🔖 обележено · 🖼 са сликом · десно: број тачних/нетачних' },
    contTip: { l: 'Nastavlja redom, od prvog neodgovorenog pitanja posle mesta gde si stao.', c: 'Наставља редом, од првог неодговореног питања после места где си стао.' },
    contTipSec: { l: 'Nastavlja tačno od mesta gde si stao (uvek redom).', c: 'Наставља тачно од места где си стао (увек редом).' },
    vezbajPodoblast: { l: 'Vežbaj podoblast', c: 'Вежбај подобласт' },
    qOne: { l: 'pitanje', c: 'питање' },
    waitInfoOne: { l: 'Današnja ponavljanja si prošao. Kasnije na redu: # pitanje (razmaknuto ponavljanje: sutra, pa za 3 dana).', c: 'Данашња понављања си прошао. Касније на реду: # питање (размакнуто понављање: сутра, па за 3 дана).' },
    daysAgoOne: { l: 'pre # dan', c: 'пре # дан' },
    dueDaysOne: { l: 'za # dan', c: 'за # дан' },
    // message_ConfirmExamFinish — bez brojanja neodgovorenih: toga na ispitu nema
    simConfirm: { l: 'Da li sigurno želite završiti teorijski ispit? Nakon potvrde više nećete moći uneti bilo koju izmenu u date odgovore.', c: 'Да ли сигурно желите завршити теоријски испит? Након потврде више нећете моћи унети било коју измену у дате одговоре.' },
    importBad: { l: 'Fajl nije prepoznat kao ispravan napredak — ništa nije promenjeno.', c: 'Фајл није препознат као исправан напредак — ништа није промењено.' },
    importConfirm: { l: 'Učitavanje će ZAMENITI postojeći napredak ovim iz fajla. Nastaviti?', c: 'Учитавање ће ЗАМЕНИТИ постојећи напредак овим из фајла. Наставити?' },
    readyNoData: { l: 'Procena se prikazuje kada odgovoriš na bar 30 pitanja (do sada: #). Uradi prvi krug, pa se vrati ovde.', c: 'Процена се приказује када одговориш на бар 30 питања (до сада: #). Уради први круг, па се врати овде.' },
  };

  // ---------- Stanje ----------
  const KEY = 'vozackiA.v1';
  // Granice veličine slova — JEDNO mesto, koriste ih i dugmad i učitavanje stanja.
  // Moraju da stoje IZNAD `let S = load()`: normalizeState ih čita pri prvom učitavanju,
  // a dok su bile ispod (kao `var`), tada su još bile undefined — pa je sačuvana
  // veličina slova na svakom pokretanju tiho padala na 1.
  const FS_MIN = 0.9, FS_MAX = 1.25, FS_KORAK = 0.08;
  // Datum poslednje provere baze prema eUpravi — JEDNO mesto; čitaju ga podnožje i kartica
  // poverenja (ranije je stajao prepisan u četiri teksta i mogao da se raziđe).
  const BAZA_PROVERENA = '2026-09-03';
  // Prag ispita: 85% poena, zaokruženo naviše (84 od 98). JEDNA formula za simulaciju,
  // procenu spremnosti i sve tekstove — ranije je „84" stajalo hardkodovano na dva mesta.
  const PRAG_UDEO = 0.85;
  const prag = (total) => Math.ceil(PRAG_UDEO * total);
  const pragTekst = (total) => `${L('threshold')}: ${prag(total)} ${L('ofQ')} ${total} (${Math.round(PRAG_UDEO * 100)}%)`;
  // Predlog simulacije na početnoj: kad procena spremnosti dođe blizu praga
  // (isto pravilo citiraju vodič i tura — jedno pravilo, tri mesta).
  const SIM_PREDLOG_OD = 80;
  // Boja procenta tačnosti — ISTA na statistici i na strani oblasti, pragovi vezani za
  // ono što kandidat zna: zeleno = prošao bi (85%), crveno = daleko ispod.
  const accClass = (acc) => (acc >= 85 ? 'accGood' : acc >= 70 ? 'accMid' : 'accBad');
  // JEDAN oblik datuma svuda: dd.mm.gggg. (uz vreme: dd.mm.gggg. čč:mm).
  // Prima broj (ms), Date ili ISO dan „gggg-mm-dd".
  function fmtDatum(x, vreme) {
    const d = x instanceof Date ? x : new Date(typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x + 'T00:00:00' : x);
    if (isNaN(d.getTime())) return String(x);
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}.` + (vreme ? ` ${p(d.getHours())}:${p(d.getMinutes())}` : '');
  }
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
    // slice(-500): kad ih ima više od 500, baca se NAJSTARIJIH — ranije je bilo slice(0,500),
    // pa se pri prvom sledećem učitavanju gubilo baš ono što je korisnik tek uradio
    const sims = (Array.isArray(obj.sims) ? obj.sims : []).slice(-500).map((s) => {
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
      ? {
        novih: nInt(obj.plan.novih, 1, 5000, null),
        pon: nInt(obj.plan.pon, 1, 5000, null),
        auto: obj.plan.auto === 1 ? 1 : 0,   // kvota se računa svakog dana iz onoga što je ostalo
        prio: obj.plan.prio === 1 ? 1 : 0,   // nova pitanja idu redom po težini na ispitu
      }
      : null;
    // Auto režim ne mora da ima upisane brojeve — njih računa planStanje() iz datuma ispita.
    const plan = planObj && (planObj.novih || planObj.pon || planObj.auto) ? planObj : null;

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
  // Kratka potvrda radnje: ista traka kao upozorenja, ali tiša i sama nestaje. Jedan oblik za
  // sve radnje — ranije je isti tip radnje čas ćutao, čas dizao sistemski prozor.
  function poruci(tekst) {
    try {
      let drz = document.getElementById('trakeDrzac');
      if (!drz) { drz = document.createElement('div'); drz.id = 'trakeDrzac'; document.body.appendChild(drz); }
      drz.querySelectorAll('.poruka').forEach((p) => p.remove());   // uvek najviše jedna
      const b = document.createElement('div');
      b.className = 'poruka';
      b.setAttribute('role', 'status');
      b.setAttribute('aria-live', 'polite');
      b.textContent = tekst;
      drz.appendChild(b);
      setTimeout(() => b.remove(), 2600);
    } catch (ignore) { /* poruka nikad ne sme da obori radnju */ }
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
    const sada = Date.now();
    // MILANOVA ODLUKA (2026-09-02): tačan odgovor pomera raspored SAMO kad je pitanje
    // stvarno na redu. Strelicama nazad-napred pitanje je moglo da „diplomira" iz reda
    // za dvadeset sekundi, bez ijednog stvarnog razmaka. Odgovor pre roka je vežbanje:
    // broji se u statistici pitanja (a), ali ne dira ni streak ni rok.
    // Pogrešan odgovor VAŽI UVEK — greška je stvarna informacija, ma kad se desila.
    const preRoka = ok && !prviPut && inQueue(id) && dueOf(id) > sada;
    // isto pitanje se u dnevne brojače (i dnevni cilj) računa najviše JEDNOM dnevno,
    // da se kvota ne puni vrćenjem istog pitanja u krug
    const vecBrojanoDanas = !!r.last && localDay(r.last) === localDay();
    if (preRoka && !r.due) r.due = dueOf(id);   // nasleđen zapis bez roka: zamrzni rok pre pomeranja r.last
    r.a++; r.last = sada;
    if (preRoka) {
      // raspored ostaje netaknut
    } else if (ok) {
      r.streak++;
      if (r.w > 0 && r.streak < 3) r.due = pocetakDanaZa(r.streak === 1 ? 1 : 3);
      else if (r.w === 0 && r.streak === 1) r.due = pocetakDanaZa(3);   // utvrđivanje: druga potvrda za 3 dana
      else delete r.due;                                               // utvrđeno / izašlo iz reda
    } else {
      r.w++; r.streak = 0; r.due = Date.now();
    }
    const today = localDay();
    if (!S.day || S.day.d !== today) S.day = { d: today, n: 0, ok: 0, novih: 0, pon: 0 };
    if (!vecBrojanoDanas) {
      S.day.n++; if (ok) S.day.ok++;
      if (prviPut) S.day.novih = (S.day.novih || 0) + 1;
      else if (!preRoka) S.day.pon = (S.day.pon || 0) + 1;   // vežbanje pre roka ne puni kvotu ponavljanja
    }
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
  // „Nazad" stoji UVEK na istom mestu — levo u traci; svaki ekran ga sam postavlja posle show(),
  // a show() ga briše, pa nikad ne ostane zalutalo dugme sa prethodnog ekrana.
  function postaviNazad(tekst, fn) {
    const b = el('btnNazad');
    if (!b) return;
    if (!tekst || !fn) { b.hidden = true; b.onclick = null; return; }
    el('btnNazadText').textContent = tekst;
    b.title = tekst; b.setAttribute('aria-label', tekst);
    b.hidden = false;
    b.onclick = () => { if (leaveSimOk()) fn(); };
  }
  // Donja navigacija: označi gde se korisnik nalazi (kao u velikim aplikacijama).
  function oznaciNav(v) {
    const nav = el('donjaNav');
    if (!nav) return;
    const h = curHash || '#/';
    let cilj = null;
    if (v === 'home') cilj = 'home';
    else if (v === 'sim') cilj = 'sim';
    else if (v === 'stats') cilj = 'stats';
    else if (h === '#/sva' || h === '#/uci') cilj = 'learn';
    else if (h === '#/lista/wrong') cilj = 'drill';
    nav.querySelectorAll('[data-nav]').forEach((b) => {
      if (b.dataset.nav === cilj) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }
  // Spisak pitanja je dubok desetine hiljada piksela. Ko iz njega otvori pitanje pa se vrati,
  // ranije je uvek padao na vrh i morao ponovo da traži gde je stao. Pamti se JEDNO mesto —
  // poslednji spisak sa kog se otišlo — i troši se pri prvom povratku na taj isti spisak.
  let skrolKljuc = null;      // adresa spiska koji je trenutno iscrtan
  let skrolSpisak = null;     // { kljuc, y }
  function pamtiSkrolSpiska(kljuc) {
    // ponovno crtanje istog spiska (promena pisma/teme) takođe ne sme da baci na vrh
    if (skrolKljuc === kljuc && el('view-browse').classList.contains('active')) skrolSpisak = { kljuc, y: window.scrollY };
    skrolKljuc = kljuc;
  }
  function show(v) {
    const bio = views.find((x) => el('view-' + x).classList.contains('active'));
    if (bio === 'browse' && v === 'question' && skrolKljuc) skrolSpisak = { kljuc: skrolKljuc, y: window.scrollY };
    postaviNazad(null);
    views.forEach((x) => el('view-' + x).classList.toggle('active', x === v));
    oznaciNav(v);
    // podnožje se sklanja tokom ispita — pravi ispit ga nema
    document.body.classList.toggle('uSimulaciji', v === 'sim');
    let y = 0;
    if (v === 'browse') { if (skrolSpisak && skrolSpisak.kljuc === skrolKljuc) y = skrolSpisak.y; skrolSpisak = null; }
    else if (v !== 'question') skrolSpisak = null;   // otišao je nekud drugde — spisak se otvara od vrha
    window.scrollTo(0, y);
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
  function goHomeReplace(kljuc) {
    // korisnik koji je otvorio deljenu adresu mora da zna zašto gleda početnu
    if (kljuc) setTimeout(() => poruci(L(kljuc)), 60);
    if (FILE_MODE) { renderHome(); return; }
    location.replace('#/');
  }
  function routeTo(h) {
    if (!h || h === '#' || h === '#/') return renderHome();
    if (h === '#/sva') return browseAll();
    if (h.startsWith('#/sek/')) return browse(h.slice(6));
    // vežbanje oblasti/podoblasti ima svoju adresu: osvežavanje i „nazad" vraćaju na isto mesto
    if (h.startsWith('#/vezba/')) {
      const key = h.slice(8);
      if (/^[cs]\d+$/.test(key) && secInfo(key).ids.length) {
        const si = secInfo(key);
        return startList(si.ids, secTitleFn(key), null, 'section', { secKey: key, startAt: S.secPos[key] || 0, origin: () => browse(key), hash: h });
      }
      return goHomeReplace();
    }
    if (h === '#/lista/wrong') return browseSet('wrong');
    if (h === '#/lista/marked') return browseSet('marked');
    if (h === '#/stats') return renderStats();
    if (h === '#/uci') return startLearn();
    if (h.startsWith('#/p/')) {
      const qid = parseInt(h.slice(4), 10);
      if (byId.has(qid)) return startList([qid], () => '#' + qid, null, 'filter', { origin: () => renderHome(), nazadLbl: L('backHome'), jedno: true, hash: h });
      return goHomeReplace('porNemaPitanja');
    }
    if (h.startsWith('#/pregled/')) {
      const i = parseInt(h.slice(10), 10);
      if (S.sims[i]) return renderSimReview(S.sims[i], false);
      return goHomeReplace('porNemaPregleda');
    }
    if (h === '#/sim') {
      if (sim) { show('sim'); sim.showReport ? renderSimReport() : renderSimQ(); return; }
      if (simNastavi()) return;              // ispit iz zapisa (npr. „nazad" posle vraćanja u aplikaciju)
      return goHomeReplace('porSimPrekinuta');
    }
    return goHomeReplace();   // '#/vezba' i nepoznato: prolazna vežba se ne rekonstruiše
  }
  window.addEventListener('hashchange', () => {
    const h = location.hash || '#/';
    if (h === curHash) return;               // naš sopstveni upis, ne korisnikova strelica
    if (sim) {
      if (!confirm(L('simLeaveConfirm'))) { setHash('#/sim'); return; }
      clearInterval(sim.timerId); sim = null; simObrisi();
    }
    curHash = h;
    // greška u rutiranju ne sme da ćuti: korisnik inače završi na početnoj bez ijedne reči
    try { routeTo(h); } catch (err) { console.warn('Adresa nije mogla da se otvori:', h, err); goHomeReplace('porGreskaAdrese'); }
  });
  // Ispit se od v108 pamti, pa ga osvežavanje ne uništava — ali sat i dalje kuca dok te nema.
  // Zato upozorenje ostaje: ko zatvori tab i vrati se posle sat vremena, zatiče istekao ispit.
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
      // ako je slika u dugmetu za uvećanje, sklanja se CELO dugme — inače bi ostalo
      // prazno dugme koje se fokusira, a nema šta da uveća
      (im.closest('.qImgBtn') || im).replaceWith(p);
    });
    return im;
  }
  // Slika je u dugmetu: uvećanje se ranije otvaralo SAMO mišem, pa ga tastaturom nije bilo
  // kako dobiti — a slika nosi zadatak kod 704 od 1327 pitanja. Dugme nema svoj izgled.
  function slikaPitanja(q) {
    const dugme = document.createElement('button');
    dugme.type = 'button'; dugme.className = 'qImgBtn';
    dugme.setAttribute('aria-label', L('uvecajSliku'));
    const im = document.createElement('img');
    im.className = 'qImg';
    im.alt = L('imgAlt');
    pratiSliku(im);
    im.src = 'img/' + q.id + '.jpg';   // src tek POSLE osluškivača, da se greška ne propusti
    dugme.appendChild(im);
    return dugme;
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
  // opts.nazadLbl: natpis dugmeta nazad kad iza pitanja ne stoji spisak (npr. „Na početnu").
  // Spisak od jednog pitanja nema ni brojač „1 od 1" ni polje „Idi" — nema kroz šta da se ide.
  function renderProgress(title, pos, max, onJump, onBack, opts) {
    opts = opts || {};
    el('qProgress').innerHTML = `<span class="qpTitle" title="${escapeHtml(title)}">${escapeHtml(title)}</span>
      ${max > 1 ? `<span class="qpPos"><b>${pos}</b> ${L('ofQ')} ${max}</span>
      <span class="jumpBox"><input id="jumpN" type="text" inputmode="numeric" autocomplete="off" placeholder="${pos}" aria-label="${escapeHtml(L('goto'))}">
      <button id="jumpGo" class="secondary sBtn">${L('goto')}</button></span>` : ''}
      <span class="mut kbNote">${L('kbHint')}</span>`;
    postaviNazad(onBack ? (opts.nazadLbl || L('backToList')) : null, onBack);
    if (!el('jumpGo')) return;
    const doJump = () => {
      const v = ceoBrojIzPolja(el('jumpN'), 1, max, L('skokVanOpsega').split('@3').join(nQ(max)));
      if (v !== null) onJump(v - 1);
    };
    el('jumpGo').addEventListener('click', doJump);
    el('jumpN').addEventListener('input', () => ocistiPoruku(el('jumpN')));
    el('jumpN').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doJump(); } });
  }

  // ---------- Prikaz jednog pitanja (zajednički engine) ----------
  // opts: {container, q, onAnswered, onNext, onPrev, nextLabelKey}
  // Isti prikaz istog pitanja (promena pisma/teme usred rada) mora da izgleda isto: isti
  // redosled ponuda, isti izbor, a već dat odgovor ostaje dat. Ključ je opts.recordKey
  // (prolaz|pozicija) — isti koji čuva i od dvostrukog beleženja.
  const prikazPitanja = new Map();
  let ponovniPrikaz = false;   // true samo dok traje current.redraw() zbog promene pisma
  function renderQuestion(opts) {
    const q = opts.q;
    const c = opts.container;
    c.dataset.qid = q.id;
    const zapamceno = ponovniPrikaz && opts.recordKey ? prikazPitanja.get(opts.recordKey) : null;
    let shuffled;
    if (zapamceno) {
      shuffled = zapamceno.order.map((id) => q.ch.find((x) => x.id === id)).filter(Boolean);
    } else {
      shuffled = q.ch.slice();
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    }

    const sel = new Set(zapamceno ? zapamceno.sel : []);
    let answered = false;
    const zapamti = (odgovoreno) => {
      if (!opts.recordKey) return;
      prikazPitanja.set(opts.recordKey, { order: shuffled.map((x) => x.id), sel: [...sel], odgovoreno: odgovoreno || (zapamceno && zapamceno.odgovoreno) || null });
      if (prikazPitanja.size > 300) prikazPitanja.delete(prikazPitanja.keys().next().value);   // ne raste beskonačno
    };

    c.innerHTML = '';
    const meta = document.createElement('div'); meta.className = 'qMeta';
    // Brojač: tačno i netačno ODVOJENO, ne ukupno+pogrešno. „2× odgovarano, 1× pogrešno"
    // tera čoveka da oduzima; „1× tačno · 1× netačno" se čita bez računanja.
    const hist = qr(q.id).a > 0
      ? ` &nbsp;·&nbsp; <span class="qOk">${S.q[q.id].a - S.q[q.id].w}× ${L('tacnoLbl')}</span> · <span class="${S.q[q.id].w ? 'qBad' : 'mut'}">${S.q[q.id].w}× ${L('netacnoLbl')}</span> · ${relTime(S.q[q.id].last)}`
      : '';
    meta.innerHTML = `<span><button type="button" class="bcLink" data-bc="c${q.cat}">${escapeHtml(catOf(q))}</button> › <button type="button" class="bcLink" data-bc="s${q.sub}" title="${escapeHtml(subOf(q))}">${escapeHtml(subShortName(q.sub))}</button></span>
      <span><span class="qNum" data-qid="${q.id}" title="${escapeHtml(FILE_MODE ? L('qNumTip') : L('qNumTip2'))}">#${q.id}</span> · ${poeni(q.pts)}${hist}</span>`;
    meta.querySelectorAll('.bcLink').forEach((b) => b.addEventListener('click', () => browse(b.dataset.bc)));
    c.appendChild(meta);

    const txt = document.createElement('div'); txt.className = 'qText'; txt.textContent = T(q.t);
    c.appendChild(txt);

    if (q.img) c.appendChild(slikaPitanja(q));

    if (q.req > 1) {
      const hint = document.createElement('div'); hint.className = 'mut napomena';
      hint.textContent = L('chooseNVezba').split('@1').join(q.req);
      c.appendChild(hint);
    }

    const btns = [];
    // Izbor se ranije video SAMO po boji — čitač ekrana nije imao šta da pročita, pa se na
    // pitanju sa dva odgovora nije znalo šta je već izabrano. Sada je svaki odgovor
    // prekidač (aria-pressed), a jedno mesto osvežava i boju i objavu.
    const osveziIzbor = () => btns.forEach((x) => {
      const izabran = sel.has(x._ch.id);
      x.classList.toggle('sel', izabran);
      x.setAttribute('aria-pressed', izabran ? 'true' : 'false');
    });
    for (const ch of shuffled) {
      const b = document.createElement('button'); b.className = 'choice'; b.type = 'button';
      b.textContent = T(ch.t); b.dataset.ok = ch.ok;
      b._ch = ch;
      b.addEventListener('click', () => {
        if (answered) return;
        // klik samo bira; odgovor se uvek potvrđuje dugmetom (da ne bude zaletanja)
        if (sel.has(ch.id)) sel.delete(ch.id);
        else if (q.req === 1) { sel.clear(); sel.add(ch.id); }
        else if (sel.size < q.req) sel.add(ch.id);
        osveziIzbor();
        confirmBtn.disabled = sel.size !== q.req;
        zapamti();
      });
      btns.push(b); c.appendChild(b);
    }
    osveziIzbor();   // izbor zapamćen pre ponovnog prikaza

    const actions = document.createElement('div'); actions.className = 'qActions';

    // ← prethodno
    if (opts.onPrev) {
      const pb = document.createElement('button'); pb.className = 'secondary'; pb.dataset.uloga = 'nazad';
      pb.textContent = '← ' + L('prev');
      pb.addEventListener('click', opts.onPrev);
      actions.appendChild(pb);
    }

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'primary'; confirmBtn.disabled = sel.size !== q.req;
    confirmBtn.textContent = L('confirm');
    confirmBtn.addEventListener('click', () => { if (!answered && sel.size === q.req) finish(shuffled.filter((ch) => sel.has(ch.id))); });
    actions.appendChild(confirmBtn);

    // → preskoči (pre odgovora); posle odgovora postaje "Sledeće pitanje"
    let nextBtn = null;
    if (opts.onNext) {
      nextBtn = document.createElement('button'); nextBtn.className = 'secondary'; nextBtn.dataset.uloga = 'dalje';
      nextBtn.textContent = opts.nextLabel || (L('skip') + ' →');
      nextBtn.addEventListener('click', opts.onNext);
      actions.appendChild(nextBtn);
    }

    const markWrap = document.createElement('label'); markWrap.className = 'markBox';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!qr(q.id).marked;
    cb.addEventListener('change', () => {
      qs(q.id).marked = cb.checked ? 1 : 0; save();
      poruci((cb.checked ? L('porObelezeno') : L('porOdobelezeno')).split('@1').join(markedIds().length));
    });
    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('mark')));
    actions.appendChild(markWrap);
    c.appendChild(actions);
    // već odgovoreno u ovom prolazu: pokaži isti ishod (beleženje preskače lastRecordKey čuvar)
    if (zapamceno && zapamceno.odgovoreno) finish(shuffled.filter((ch) => zapamceno.odgovoreno.includes(ch.id)));

    function finish(chosen) {
      answered = true;
      zapamti(chosen.map((x) => x.id));
      const okSet = new Set(q.ch.filter((x) => x.ok).map((x) => x.id));
      const ok = chosen.length === okSet.size && chosen.every((x) => okSet.has(x.id));
      for (const b of btns) {
        b.setAttribute('aria-disabled', 'true');   // ostaje u redosledu čitanja; klik blokira čuvar iznad
        const isChosen = chosen.includes(b._ch);
        if (b._ch.ok) b.classList.add('ok');
        else if (isChosen) b.classList.add('bad');
        b.classList.remove('sel');
        b.setAttribute('aria-pressed', isChosen ? 'true' : 'false');   // ostaje istinito i posle odgovora
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
      if (nextBtn) {
        nextBtn.className = 'primary';
        nextBtn.textContent = opts.nextLabel || L('next');
        // Fokus ide na „dalje" zbog tastature, ali strana NE sme da skače: ako je dugme već na
        // ekranu, ne pomera se ništa (preventScroll); ako nije, pomeri se taman toliko da se vidi.
        // Ranije je `focus()` uvek doskrolovao do dugmeta, pa je ekran poskakivao na svaki odgovor.
        const r = nextBtn.getBoundingClientRect();
        const dn = el('donjaNav');
        const dno = (window.innerHeight || 0) - (dn && getComputedStyle(dn).display !== 'none' ? dn.offsetHeight : 0);
        const vidiSe = r.top >= 0 && r.bottom <= dno;
        nextBtn.focus({ preventScroll: true });
        if (!vidiSe) nextBtn.scrollIntoView({ block: 'nearest' });
      }
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
    postaviNazad(origin ? L('backToList') : null, origin);
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
    listMode = { ids, i: start, titleFn, kind, secKey: opts.secKey || null, chainKey: opts.chainKey || null, origin: opts.origin || null,
      nazadLbl: opts.nazadLbl || null, jedno: !!opts.jedno, hash: opts.hash || '#/vezba' };
    current = { redraw: stepList };
    setHash(listMode.hash);
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
    // reset čuvara kao kod svakog drugog prelaza (dalje/nazad): bez njega povratak poljem „Idi"
    // na poziciju koja je već odgovorena u ovom prolazu daje isti recordKey, pa se novi odgovor
    // NE beleži — korisnik vidi „Tačno!", a brojači i raspored ponavljanja stoje
    renderProgress(title, m.i + 1, m.ids.length, (n) => { lastRecordKey = null; m.i = n; stepList(); }, m.origin, { nazadLbl: m.nazadLbl });
    // jedno pitanje otvoreno preko adrese (#/p/ID): iza njega nema spiska, pa „dalje" vodi
    // u vežbanje njegove podoblasti, a ne na kraj nepostojećeg spiska
    const kljuc = 's' + q.sub;
    renderQuestion({
      container: el('qCard'), q,
      recordKey: 'T' + runSeq + '|' + m.i,
      onAnswered: (ok) => record(q.id, ok),
      onNext: m.jedno
        ? () => { lastRecordKey = null; startList(Q.filter((x) => x.sub === q.sub).map((x) => x.id), secTitleFn(kljuc), null, 'section', { secKey: kljuc, startAt: S.secPos[kljuc] || 0, origin: () => browse(kljuc) }); }
        : () => { lastRecordKey = null; m.i++; stepList(); },
      nextLabel: m.jedno ? `${L('vezbajPodoblast')}: ${subShortName(q.sub)} ›` : null,
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
    // dugme-prekidač (aria-pressed), isto kao ostala dugmad u redu — kvačica sa narandžastim natpisom je izgledala kao link
    return `<button type="button" class="secondary prekidac" id="shufBox" aria-pressed="${shuffleOn ? 'true' : 'false'}" title="${escapeHtml(L('shufTip'))}">🎲 ${L('shuffleLbl')}</button>`;
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
  const legendHtml = () => `<div class="mut napomena">${L('legend')}</div>`;
  // Spisak od 1327 pitanja nije spor (mereno: ~11.000 elemenata, 8 MB, pretraga ~1 ms) — problem je
  // ORIJENTACIJA: na pola dubine se ne zna u kojoj si oblasti. Zato: skok na oblast, lepljiv naslov
  // oblasti (CSS) i povratak na vrh. Straničenje bi pokvarilo „nastavi gde si stao" i traženje po broju.
  function skokNaOblastHtml(naslovi) {
    if (naslovi.length < 3) return '';
    return `<div class="skokRed"><span class="mut">${L('skociNaOblast')}:</span>${naslovi
      .map((n, i) => `<button type="button" class="secondary sBtn skokBtn" data-skok="${i}">${escapeHtml(n)}</button>`).join('')}</div>`;
  }
  // JEDAN crtač redova za sva tri spiska pitanja (sva pitanja, oblast/podoblast, pogrešna i
  // obeležena). Razlike su parametri, ne prepisan kôd: naslov grupe (ili bez grupa), dodatak
  // uz red i šta se dešava na klik. Ranije su postojala tri skoro ista crtača — zato je
  // pretraga postojala samo na jednom od njih, a svaka izmena morala da se uradi tri puta.
  // opts: { grupa(q)→tekst|null, naslovOpis(q)→title, dodatak(q, r)→html, naKlik(idx, q) }
  function crtajRedove(list, ids, opts) {
    let zadnja = null;
    ids.forEach((qid, idx) => {
      const q = byId.get(qid);
      const g = opts.grupa ? opts.grupa(q) : null;
      if (g !== null && g !== zadnja) {
        zadnja = g;
        // pravi naslov (h4), ne div: po naslovima se u dugačkom spisku skače čitačem ekrana
        const d = document.createElement('h4');
        d.className = 'grupaNaslov';
        d.textContent = g;
        if (opts.naslovOpis) d.title = opts.naslovOpis(q);
        d._search = '';
        list.appendChild(d);
      }
      const r = S.q[qid];
      const b = document.createElement('button');
      b.className = 'qRow';
      b.innerHTML = redPitanjaHtml(q, idx, r, opts.dodatak ? opts.dodatak(q, r) : '');
      b.addEventListener('click', () => opts.naKlik(idx, q));
      b._search = (T(q.t) + ' ' + q.t.l + ' #' + q.id).toLowerCase();
      list.appendChild(b);
    });
  }
  // Pretraga po tekstu i broju pitanja — na SVAKOM dovoljno dugačkom spisku, ne samo na
  // „Sva pitanja". Na kratkom spisku bi bila smetnja, pa je nema.
  const PRETRAGA_OD = 40;
  const pretragaHtml = (koliko) => (koliko < PRETRAGA_OD ? ''
    : `<input id="qSearch" type="search" class="searchBox" placeholder="${escapeHtml(L('searchPh'))}" aria-label="${escapeHtml(L('searchPh'))}">`);
  function veziPretragu(list) {
    const sb = el('qSearch');
    if (!sb) return;
    // Ishod pretrage se KAŽE, ne samo pokaže: koliko je pogodaka ili da ih nema.
    // role="status" — ko ne vidi spisak, čuje broj; ranije se spisak menjao u tišini.
    const stanje = document.createElement('p');
    stanje.className = 'mut razmakG';
    stanje.setAttribute('role', 'status');
    stanje.style.display = 'none';
    list.appendChild(stanje);   // unutar kartice, ispod redova — tu korisnik i gleda
    // broj se objavljuje sa odlaganjem: bez toga bi čitač ekrana čitao novo stanje na SVAKO slovo
    let objavaTimer = null;
    const objavi = (tekst) => {
      clearTimeout(objavaTimer);
      objavaTimer = setTimeout(() => {
        if (!tekst) { stanje.style.display = 'none'; stanje.textContent = ''; return; }
        stanje.textContent = tekst; stanje.style.display = '';
      }, 300);
    };
    sb.addEventListener('input', () => {
      const v = sb.value.trim().toLowerCase();
      let vidljivih = 0;
      list.querySelectorAll('.qRow').forEach((row) => {
        const vidi = !v || row._search.includes(v);
        row.style.display = vidi ? '' : 'none';
        if (vidi) vidljivih++;
      });
      // dok traje pretraga sklanja se sve što nije pogodak: naslovi grupa (rezultati su izmešani),
      // spisak podoblasti i red za skok — naslovi na koje bi vodio su sakriveni
      list.querySelectorAll('.grupaNaslov, .skrijUPretrazi, .skokRed').forEach((d) => { d.style.display = v ? 'none' : ''; });
      // bez ovoga korisnik dobije praznu belu karticu i ne zna da li traži pogrešno ili je nešto puklo
      // split/join, NE replace: u zameni se „$'" i „$&" tumače kao naredbe, pa bi upit
      // sa tim znakovima izlomio poruku (npr. udvostručio pola rečenice)
      if (!v) objavi(null);
      else if (!vidljivih) objavi(L('searchEmpty').split('@1').join(sb.value.trim()));
      else objavi(vidljivih === 1 ? L('searchHitsOne') : L('searchHits').split('@1').join(vidljivih));
    });
  }
  function veziSkok(koren, spisak) {
    koren.querySelectorAll('.skokBtn').forEach((b) => b.addEventListener('click', () => {
      const c = spisak.querySelectorAll('.grupaNaslov')[+b.dataset.skok];
      if (c) c.scrollIntoView({ block: 'start' });
    }));
  }
  // dugme „na vrh" se pojavljuje tek kad se odskroluje — inače je samo smetnja
  function veziNaVrh() {
    let b = document.getElementById('btnNaVrh');
    if (!b) {
      b = document.createElement('button');
      b.id = 'btnNaVrh'; b.type = 'button'; b.className = 'secondary';
      b.textContent = '↑ ' + L('naVrh');
      b.addEventListener('click', () => window.scrollTo({ top: 0 }));
      document.body.appendChild(b);
    } else { b.textContent = '↑ ' + L('naVrh'); }
    const proveri = () => { b.hidden = window.scrollY < 1200 || !el('view-browse').classList.contains('active'); };
    if (!b._vezan) { b._vezan = true; window.addEventListener('scroll', proveri, { passive: true }); }
    proveri();
  }
  // „?" uz brojeve ponavljanja: objašnjenje pravila se OTVARA na mestu (isti sklopivi
  // mehanizam kao kartice), umesto oblačića koji na telefonu ne postoji
  const pomocHtml = () => ` <button type="button" class="pomocBtn" title="${escapeHtml(L('pomocPonavljanje'))}" aria-label="${escapeHtml(L('pomocPonavljanje'))}">?</button>`;
  const pomocTekstHtml = (dodatno) => `<div class="pomocTekst mut napomena" style="display:none">${L('queueTip')}${dodatno ? '<br>' + dodatno : ''}</div>`;
  function veziPomoc(root) {
    const b = root.querySelector('.pomocBtn'), t = root.querySelector('.pomocTekst');
    if (b && t) sklopivo(b, null, t);
  }

  // Jedan red u spisku pitanja — JEDNO mesto za sva tri spiska (podoblast, sva pitanja,
  // pogrešna/obeležena). Ranije su bila tri prepisana primerka istog koda, pa bi svaka
  // dopuna morala na tri mesta (i lako bi promašila jedno).
  // Brojač se pokazuje samo gde ima istorije: 1327 redova sa praznim brojačima bio bi šum.
  function redPitanjaHtml(q, idx, r, dodatak) {
    // tri stanja u redu, ne dva: pitanje pogođeno iz prve koje čeka potvrdu NIJE greška,
    // pa ne sme da nosi isti crveni ✗ kao pogrešeno (prvog dana je pola spiska bilo „crveno")
    const icon = !r || !r.a ? '<span class="qDot">•</span>'
      : !inQueue(q.id) ? '<span class="qOk">✓</span>'
      : r.w > 0 ? '<span class="qBad">✗</span>'
      : '<span class="qWait">◐</span>';
    const stat = r && r.a
      ? `<span class="qRowStat"><span class="qOk">${r.a - r.w}✓</span>${r.w ? ` <span class="qBad">${r.w}✗</span>` : ''}</span>`
      : '';
    return `<span class="qRowN">${idx + 1}.</span> ${icon} <span class="qRowT">${escapeHtml(T(q.t))}</span>${r && r.marked ? ' 🔖' : ''}${q.img ? ' 🖼' : ''}${dodatak || ''}${stat}`;
  }

  // ---------- Objašnjenja (explanations.js, opciono prisutan) ----------
  const EX = window.EXPLAIN || { cards: {}, byQ: {}, bySub: {} };
  function explNode(q) {
    const e = EX.byQ[q.id];
    // Kartica se kači uz pitanje SAMO ako mu tema odgovara. Podoblasti su zvanično spojevi više
    // tema, pa pitanje sme da kaže: uzmi ovu karticu (card) ili nemoj nijednu (nocard). Bolje bez
    // kartice nego kartica koja sa pitanjem nema veze — objašnjenje ionako stoji uz svako pitanje.
    const izSub = (e && e.nocard) ? null : (EX.bySub || {})[q.sub];
    const cardKeys = [...new Set([e && e.card, izSub].filter((k) => k && EX.cards[k]))];
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
    box.querySelectorAll('.explCard').forEach((cd) => suziKarticu(cd, q.sub));
    return box;
  }

  // Zbirna kartica uz pitanje pokazuje SAMO odeljke te podoblasti (.kSek[data-sub]);
  // ostalo je šum koji ne pomaže baš tom pitanju. Cela kartica je na jedan klik, a u
  // pojmovniku se i dalje vidi cela.
  function suziKarticu(cd, sub) {
    const sek = [...cd.querySelectorAll('.kSek[data-sub]')];
    if (!sek.length) return;
    const pogodak = sek.filter((x) => x.dataset.sub.split(',').map((y) => y.trim()).includes(String(sub)));
    if (!pogodak.length) return;
    let sakriveno = 0;
    [...cd.children].forEach((x) => { if (!pogodak.includes(x)) { x.classList.add('kSekSkriven'); sakriveno++; } });
    if (!sakriveno) return;
    const d = document.createElement('div');
    d.className = 'kSekNapomena mut';
    d.innerHTML = `<span>${L('sekDeo')}</span> <button type="button" class="secondary sBtn">${L('sekCela')}</button>`;
    d.querySelector('button').addEventListener('click', () => { cd.querySelectorAll('.kSekSkriven').forEach((x) => x.classList.remove('kSekSkriven')); d.remove(); });
    cd.appendChild(d);
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
  // `napuni` (neobavezno): sadržaj se pravi tek pri PRVOM otvaranju. Sklopljene kartice su
  // inače gradile hiljade skrivenih elemenata (pojmovnik na početnoj, pregled ispita) i
  // povlačile slike koje se nikad ne vide.
  // sadržaj se pravi najviše jednom, ma ko ga otvorio (dugme kartice ili „Otvori sva pitanja")
  function napuniAko(cd) {
    if (!cd || !cd._napuni || cd._napunjeno) return;
    cd._napunjeno = true;
    cd._napuni(cd);
  }
  function sklopivo(btn, grupa, cilj, napuni) {
    const cd = cilj || btn.nextElementSibling;
    if (!cd) return;
    if (napuni) cd._napuni = napuni;
    btn.setAttribute('aria-expanded', cd.style.display === 'none' ? 'false' : 'true');
    btn.addEventListener('click', () => {
      const otvaram = cd.style.display === 'none';
      if (otvaram) napuniAko(cd);
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
    if (sb) sb.addEventListener('click', () => { shuffleOn = !shuffleOn; current.redraw(); });
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
  // ---------- Ispit u toku preživljava osvežavanje ----------
  // Na pravom ispitu odgovori idu na server, pa osvežavanje strane ili ugašen tab ne poništavaju
  // pokušaj — vreme i dalje teče. Kod nas je ceo ispit živeo u jednoj promenljivoj, pa je F5
  // (ili telefon koji izbaci tab iz memorije) brisao 45 minuta rada. Zato se tok ispita upisuje
  // posebno od napretka: ispit u toku NIJE napredak i ne ulazi u izvoz.
  const SIM_KEY = 'vozackiA.sim';
  function simSnimi() {
    if (!sim) return;
    try {
      localStorage.setItem(SIM_KEY, JSON.stringify({
        v: 1,
        d: sim.deadline,
        i: sim.i,
        r: sim.showReport ? 1 : 0,
        qs: sim.qs.map((sq) => ({ id: sq.q.id, o: sq.order.map((c) => c.id), c: [...sq.chosen], m: sq.marked ? 1 : 0 })),
      }));
    } catch (e) { /* skladište odbija upis — na to već upozorava upozoriDaSeNeCuva() */ }
  }
  function simObrisi() { try { localStorage.removeItem(SIM_KEY); } catch (e) { /* nema šta da se radi */ } }
  // Vraća ispit iz zapisa ili null. Sve što nije tačno onako kako je upisano — druga verzija
  // zapisa, pitanje kog više nema u bazi, izmenjeni odgovori — briše zapis i vraća null:
  // pola ispita je gore od nijednog.
  function simVrati() {
    let z = null;
    try { z = JSON.parse(localStorage.getItem(SIM_KEY) || 'null'); } catch (e) { z = null; }
    if (!z || z.v !== 1 || !Array.isArray(z.qs) || z.qs.length !== SIM_N || typeof z.d !== 'number' || !Number.isFinite(z.d)) { simObrisi(); return null; }
    const qs = [];
    for (const s of z.qs) {
      const q = s && Number.isInteger(s.id) ? byId.get(s.id) : null;
      if (!q) { simObrisi(); return null; }
      const po = new Map(q.ch.map((c) => [c.id, c]));
      const order = (Array.isArray(s.o) ? s.o : []).map((id) => po.get(id)).filter(Boolean);
      if (order.length !== q.ch.length) { simObrisi(); return null; }
      const chosen = new Set((Array.isArray(s.c) ? s.c : []).filter((id) => po.has(id)).slice(0, q.req));
      qs.push({ q, order, chosen, marked: s.m === 1 });
    }
    return { qs, i: nInt(z.i, 0, SIM_N - 1, 0), showReport: z.r === 1, deadline: z.d, timerId: null };
  }
  // Vraća true ako je ispit nastavljen (ili istekao i završen) — tada rutiranje nema šta da radi.
  function simNastavi() {
    if (sim) return false;
    const s = simVrati();
    if (!s) return false;
    sim = s;
    current = { redraw: () => { applySimLabels(); sim.showReport ? renderSimReport() : renderSimQ(); } };
    setHash('#/sim');
    applySimLabels();
    show('sim');
    sim.timerId = setInterval(tickSim, 500);
    tickSim();                       // ako je vreme isteklo dok te nije bilo, ovo završava ispit
    if (!sim) { poruci(L('porSimIsteklo')); return true; }
    sim.showReport ? renderSimReport() : renderSimQ();
    poruci(L('porSimVracena'));
    return true;
  }

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
    { const ub = document.getElementById('updBar'); if (ub) ub.remove(); }   // ekran ispita je čist, kao pravi
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
    renderSimQ();      // renderSimQ upisuje tok ispita (simSnimi na kraju)
  }
  function applySimLabels() {
    el('btnFinishSim').textContent = L('finishSim');
    el('btnSimReport').textContent = L('report');
  }
  function tickSim() {
    if (!sim) return;
    const left = Math.max(0, Math.round((sim.deadline - Date.now()) / 1000));
    // isti oblik kao zvanični tajmer (displayTime): minuti bez vodeće nule — 45:00, 9:59, 0:07
    const mm = String(Math.floor(left / 60));
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
    // zvanično zaglavlje: „Питање: 3/41" i „Број поена: 2" (GoToQuestion u ep.js)
    meta.innerHTML = `<span>${L('question')}: ${sim.i + 1}/${SIM_N}</span><span>${L('brojPoena')}: ${q.pts}</span>`;
    c.appendChild(meta);
    const txt = document.createElement('div'); txt.className = 'qText'; txt.textContent = T(q.t); c.appendChild(txt);
    if (q.req > 1) {
      // kao na ispitu: kurzivna plava oznaka ISPOD teksta pitanja (GenerateQuestionsFrame u ep.js)
      const rq = document.createElement('div'); rq.className = 'simReq';
      rq.textContent = `${L('chooseN')} ${q.req}`;
      c.appendChild(rq);
    }
    if (q.img) c.appendChild(slikaPitanja(q));
    sq.order.forEach((ch, redni) => {
      const b = document.createElement('button'); b.className = 'choice' + (sq.chosen.has(ch.id) ? ' sel' : ''); b.type = 'button';
      b.textContent = T(ch.t);
      b.setAttribute('aria-pressed', sq.chosen.has(ch.id) ? 'true' : 'false');
      b.addEventListener('click', () => {
        if (q.req === 1) { sq.chosen.clear(); sq.chosen.add(ch.id); }
        else if (sq.chosen.has(ch.id)) sq.chosen.delete(ch.id);
        else if (sq.chosen.size < q.req) sq.chosen.add(ch.id);
        renderSimQ();
        // kartica se ponovo gradi, pa bi fokus pao na telo strane — tastatura bi
        // posle svakog izbora morala ispočetka. Vraća se na isti odgovor.
        const nov = el('simQCard').querySelectorAll('.choice')[redni];
        if (nov && document.activeElement === document.body) nov.focus({ preventScroll: true });
      });
      c.appendChild(b);
    });
    const actions = document.createElement('div'); actions.className = 'qActions';
    if (sim.i > 0) { const p = document.createElement('button'); p.className = 'secondary'; p.dataset.uloga = 'nazad'; p.textContent = '‹ ' + L('prevQ'); p.addEventListener('click', () => { if (!simSmeDalje()) return; sim.i--; renderSimQ(); }); actions.appendChild(p); }
    if (sim.i < SIM_N - 1) { const n = document.createElement('button'); n.className = 'primary'; n.dataset.uloga = 'dalje'; n.textContent = L('nextQ') + ' ›'; n.addEventListener('click', () => { if (!simSmeDalje()) return; sim.i++; renderSimQ(); }); actions.appendChild(n); }
    // Obeležavanje pitanja postoji i na pravom ispitu
    const markWrap = document.createElement('label'); markWrap.className = 'markBox';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = sq.marked;
    cb.addEventListener('change', () => { sq.marked = cb.checked; simSnimi(); });
    markWrap.appendChild(cb); markWrap.appendChild(document.createTextNode(' ' + L('markSim')));
    actions.appendChild(markWrap);
    c.appendChild(actions);
    simSnimi();        // JEDNO mesto: svaka promena pitanja/izbora prolazi kroz crtanje
  }
  // Kao na ispitu (SaveUserInput u ep.js): pitanje sa VIŠE odgovora ne može da se napusti dok
  // nije označen ni jedan ili tačno traženi broj — pola odgovora zaustavlja i poruči.
  function simSmeDalje() {
    if (!sim || sim.showReport) return true;
    const sq = sim.qs[sim.i];
    if (sq.chosen.size > 0 && sq.chosen.size !== sq.q.req) { alert(L('simBrojOdgovora')); return false; }
    return true;
  }
  // "Izveštaj" — kao na ispitu: tabela Pitanje / Broj poena / Odgovoreno / Obeleženo, klik vodi na pitanje
  function renderSimReport() {
    sim.showReport = true;
    el('simQCard').style.display = 'none';
    const rp = el('simReport');
    rp.style.display = '';
    rp.innerHTML = `<h3>${L('report')}</h3>
      <table class="stats"><thead><tr><th>${L('question')}</th><th class="num">${L('brojPoena')}</th><th class="num">${L('repAnswered')}</th><th class="num">${L('repMarked')}</th></tr></thead>
      <tbody>${sim.qs.map((sq, idx) =>
        `<tr class="repRow" tabindex="0" data-i="${idx}"><td>${L('question')} ${idx + 1}</td><td class="num">${sq.q.pts}</td><td class="num">${sq.chosen.size === sq.q.req ? '✓' : '—'}</td><td class="num">${sq.marked ? '🔖' : '—'}</td></tr>`).join('')}
      </tbody></table>
      <div class="qActions" style="margin-top:12px"><button class="primary" id="btnRepBack">‹ ${L('backToTest')}</button></div>`;
    rp.querySelectorAll('.repRow').forEach((tr) => {
      const go = () => { sim.i = +tr.dataset.i; renderSimQ(); };
      tr.addEventListener('click', go);
      tr.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    });
    el('btnRepBack').addEventListener('click', renderSimQ);
    simSnimi();
  }
  function finishSim(auto) {
    if (!sim) return;
    if (!auto) {
      if (!simSmeDalje()) return;
      if (!confirm(L('simConfirm'))) return;   // doslovno pitanje sa ispita, bez brojanja neodgovorenih
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
    const threshold = prag(total);
    const passed = score >= threshold;
    const rec = { d: Date.now(), score, total, passed, wrong: wrong.map((x) => x.q.id), qs: sim.qs.map((sq) => ({ id: sq.q.id, ch: [...sq.chosen] })) };
    S.sims.push(rec);
    if (S.sims.length > 500) S.sims = S.sims.slice(-500);   // ista granica kao pri učitavanju
    sim = null;          // zatvori ispit PRE upisa — neuspeo upis ne sme da ga zaglavi
    simObrisi();         // ispit je gotov: sačuvani tok se briše, da se ne obnovi posle osvežavanja
    save();
    renderSimReview(rec, true);
  }

  // Pregled jedne simulacije — svež rezultat ili bilo koji pokušaj iz istorije.
  function renderSimReview(rec, fresh) {
    current = { redraw: () => renderSimReview(rec, fresh) };
    setHash('#/pregled/' + S.sims.indexOf(rec));
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
    const rc = el('simResultCard');
    rc.innerHTML = `<h3>${L('sim')} <span class="mut" style="font-weight:normal">· ${fmtDatum(rec.d, true)}</span></h3>
      <div class="bigScore ${rec.passed ? 'pass' : 'fail'}">${rec.score} / ${rec.total} ${L('points')}</div>
      <p><span class="pill ${rec.passed ? 'pass' : 'fail'}">${rec.passed ? L('passed') : L('failed')}</span>
      &nbsp; <span class="mut">${pragTekst(rec.total)}</span></p>
      <p><b>${L('simKraj')}</b> ${rec.passed ? L('simPolozio') : L('simPao')}</p>
      ${hasDetail ? `<h3>${L('perCat')}</h3>
      <table class="stats"><thead><tr><th>${L('thArea')}</th><th class="num">${L('thQ')}</th><th class="num">${L('thPts')}</th></tr></thead>
      <tbody>${Object.entries(perCat).map(([cid, pc]) =>
        `<tr><td>${escapeHtml(T(catName.get(+cid)))}</td><td class="num">${pc.ok}/${pc.n}</td><td class="num">${pc.got}/${pc.pts}</td></tr>`).join('')}
      </tbody></table>` : `<p class="mut napomena">${L('reviewOldNote')}</p>`}
      <div class="qActions">
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
      // Telo pregleda se pravi tek pri otvaranju: 41 sklopljeno pitanje je inače gradilo oko
      // 552.000 znakova skrivenog HTML-a i povlačilo ~1,3 MB slika koje se ne vide.
      const napraviTelo = () => {
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
          ${q.img ? `<button type="button" class="qImgBtn" aria-label="${escapeHtml(L('uvecajSliku'))}"><img class="qImg" loading="lazy" src="img/${q.id}.jpg" alt="${escapeHtml(L('imgAlt'))}"></button>` : ''}
          ${q.ch.map((ch) => `<div class="choice rev${ch.ok ? ' ok' : (chosen && chosen.has(ch.id) ? ' bad' : '')}">${escapeHtml(T(ch.t))}${chips(ch)}</div>`).join('')}`;
        { const im = card.querySelector('img.qImg'); if (im) pratiSliku(im); }
        const ex = explNode(q);
        if (ex) card.appendChild(ex);
        return card;
      };
      // Sklopljeno na jedan red: 40 otvorenih pregleda je pravilo stranu od 34.000px na telefonu.
      // Naslov kaže sve što treba za odluku „otvoriti ili ne": ishod, broj i početak pitanja.
      const omot = document.createElement('div');
      omot.className = 'card pregledStavka';
      const dobro = chosen && (() => { const okSet = new Set(q.ch.filter((x) => x.ok).map((x) => x.id)); return chosen.size === okSet.size && [...chosen].every((id) => okSet.has(id)); })();
      const znak = !chosen || chosen.size === 0 ? '•' : dobro ? '✓' : '✗';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'explCardBtn pojBtn pregledNaslov';
      btn.innerHTML = `<span class="pregZnak ${dobro ? 'qOk' : (!chosen || !chosen.size ? 'qDot' : 'qBad')}">${znak}</span> <span class="pregTekst">${escapeHtml(T(q.t))}</span>`;
      const telo = document.createElement('div');
      telo.className = 'explCard';
      telo.style.display = 'none';
      omot.append(btn, telo);
      sklopivo(btn, null, null, (cd) => cd.appendChild(napraviTelo()));
      return omot;
    };
    // jedno dugme za sve — ko hoće da pregleda ceo test, ne otvara 40 puta
    const dugmeSve = (drzac) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'secondary sBtn razmakG';
      b.textContent = L('otvoriSve');
      b.addEventListener('click', () => {
        // SAMO omotači pitanja: '.pregledStavka .explCard' hvata i karticu pojmovnika unutar
        // otvorenog pitanja, pa su se brojevi razilazili i otvaranje je pucalo na sredini
        const stavke = [...drzac.querySelectorAll('.pregledStavka > .explCard')];
        const otvaram = stavke.some((x) => x.style.display === 'none');
        stavke.forEach((x) => {
          if (otvaram) napuniAko(x);   // tela se prave tek sad, isto kao pri pojedinačnom otvaranju
          x.style.display = otvaram ? '' : 'none';
          const naslov = x.parentElement.querySelector('.pregledNaslov');
          if (naslov) naslov.setAttribute('aria-expanded', otvaram ? 'true' : 'false');
        });
        b.textContent = otvaram ? L('zatvoriSve') : L('otvoriSve');
      });
      return b;
    };
    if (hasDetail) {
      const wrongItems = items.filter((it) => !isOk(it));
      const okItems = items.filter(isOk);
      if (wrongItems.length) {
        const hw = document.createElement('div'); hw.className = 'card';
        hw.innerHTML = `<h3>${L('simWrongTitle')} (${wrongItems.length})</h3>`;
        hw.appendChild(dugmeSve(wl));
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
    const slotovi = [];   // {pts, p} po slotu — ulaz za tačnu raspodelu poena
    for (const slot of SIM_SLOTS) {
      const pool = Q.filter((q) => slot.s.includes(q.sub) && q.pts === slot.p);
      if (!pool.length) continue;
      const p = pool.reduce((a, q) => a + pOf(q), 0) / pool.length;
      slotovi.push({ pts: slot.p, p });
      exp += slot.p * p;
      const key = slot.s.join('/');
      (loss[key] = loss[key] || { pts: 0, subs: slot.s }).pts += slot.p * (1 - p);
    }
    const answered = Q.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
    return { exp, loss, answered, slotovi };
  }

  // Šansa da položiš — TAČAN račun, ne procena. Ispit je 41 slot sa poznatim poenima (2 ili 3);
  // ako je p verovatnoća da slot bude tačan, raspodela ZBIRA poena se dobija dinamičkim
  // programiranjem preko 99 mogućih poena (41 × 99 koraka). Odatle P(zbir ≥ prag).
  // Pretpostavka je nezavisnost slotova — ona je i inače pretpostavka svakog ovakvog računa,
  // a marginale su tačne: verovatnoća slota je prosek po skupu pitanja koja u njega mogu.
  function sansaZaProlaz(slotovi) {
    if (!slotovi || !slotovi.length) return null;
    const ukupno = slotovi.reduce((a, s) => a + s.pts, 0);
    let raspodela = new Float64Array(ukupno + 1);
    raspodela[0] = 1;
    for (const s of slotovi) {
      const nova = new Float64Array(ukupno + 1);
      for (let i = 0; i <= ukupno; i++) {
        const v = raspodela[i];
        if (!v) continue;
        nova[i] += v * (1 - s.p);
        if (i + s.pts <= ukupno) nova[i + s.pts] += v * s.p;
      }
      raspodela = nova;
    }
    const prag_ = prag(ukupno);
    let sansa = 0;
    for (let i = prag_; i <= ukupno; i++) sansa += raspodela[i];
    return { sansa, ukupno, prag: prag_ };
  }

  // Kad se sme reći „spreman sam" — tri uslova, ne osećaj. Jedna položena simulacija ne dokazuje
  // ništa: ako je stvarna šansa 70%, tri zaredom dešavaju se u 34% slučajeva. Zato ide i procena.
  const SIM_MIN = 5;            // najmanje toliko simulacija ukupno
  const SIM_NIZ = 3;            // poslednje toliko moraju biti položene
  const SIM_MARGINA = 5;        // svaka sa bar toliko poena preko praga
  const SIM_SANSA = 0.85;       // i procenjena šansa bar tolika
  function spremnost() {
    const r = readiness();
    const s = sansaZaProlaz(r.slotovi);
    const sims = S.sims || [];
    const zadnje = sims.slice(-SIM_NIZ);
    const nizOk = zadnje.length === SIM_NIZ && zadnje.every((x) => x.score >= prag(x.total) + SIM_MARGINA);
    const dani = new Set(sims.map((x) => localDay(x.d)));
    return {
      sansa: s ? s.sansa : null,
      prag: s ? s.prag : prag(SIM_PTS_MIN),
      ukupno: s ? s.ukupno : SIM_PTS_MIN,
      exp: r.exp,
      odgovoreno: r.answered,
      broj: sims.length,
      dana: dani.size,
      nizOk,
      brojOk: sims.length >= SIM_MIN,
      daniOk: dani.size >= SIM_NIZ,
      sansaOk: !!s && s.sansa >= SIM_SANSA,
    };
  }
  function renderReady() {
    const { exp, loss, answered } = readiness();
    if (answered < 30) {
      el('readyCard').innerHTML = `<h3>${L('readyTitle')}</h3><p class="mut">${L('readyNoData').replace('#', answered)}</p>
        <div class="qActions"><button type="button" class="primary" data-nav="learn">${L('krenimo')}</button></div>`;
      bindNav(el('readyCard'));
      return;
    }
    const e = Math.round(exp);
    const pass = e >= prag(SIM_PTS_MIN);
    const top = Object.values(loss).sort((a, b) => b.pts - a.pts).slice(0, 5);
    const sp = spremnost();
    const pct = sp.sansa === null ? null : Math.round(sp.sansa * 100);
    // stavka pravila: ✓ ili ✗ i tačan broj — da se vidi šta tačno fali
    const stavka = (ok, tekst) => `<div class="brRed"><span>${ok ? '✓' : '✗'}</span> <span class="${ok ? '' : 'mut'}">${tekst}</span></div>`;
    el('readyCard').innerHTML = `<h3>${L('readyTitle')}</h3>
      <div class="bigScore ${pass ? 'pass' : 'fail'}">≈ ${e} / ${SIM_PTS_MIN}</div>
      <p><span class="pill ${pass ? 'pass' : 'fail'}">${pass ? L('passed') : L('failed')}</span>
      &nbsp;<span class="mut">${pragTekst(SIM_PTS_MIN)}</span>
      ${answered < 150 ? `&nbsp;<span class="mut">${L('readyRough')} (${answered}/${Q.length})</span>` : ''}</p>
      ${pct === null ? '' : `<h3>${L('sansaNaslov')}</h3>
      <div class="bigScore ${pct >= 85 ? 'pass' : 'fail'}">${pct}%</div>
      <p class="mut napomena">${L('sansaKako').split('@1').join(sp.ukupno).split('@2').join(sp.prag)}</p>`}
      <h3>${L('spremanNaslov')}</h3>
      ${stavka(sp.brojOk, L('spremanBroj').split('@1').join(SIM_MIN).split('@2').join(sp.broj))}
      ${stavka(sp.daniOk, L('spremanDani').split('@1').join(SIM_NIZ).split('@2').join(sp.dana))}
      ${stavka(sp.nizOk, L('spremanNiz').split('@1').join(SIM_NIZ).split('@2').join(SIM_MARGINA))}
      ${stavka(sp.sansaOk, L('spremanSansa').split('@1').join(Math.round(SIM_SANSA * 100)).split('@2').join(pct === null ? '—' : pct))}
      <p class="mut napomena">${sp.brojOk && sp.daniOk && sp.nizOk && sp.sansaOk ? L('spremanDa') : L('spremanNe')}</p>
      <h3>${L('readyLoss')}</h3>
      <table class="stats"><tbody>${top.map((t) =>
        `<tr class="statLink" data-sub="${t.subs[0]}" tabindex="0" title="${escapeHtml(L('catOpen'))}"><td>${t.subs.map((s) => escapeHtml(subShortName(s))).join(' / ')}</td>
         <td class="num accBad">−${t.pts.toFixed(1)} ${L('points')}</td></tr>`).join('')}
      </tbody></table>
      <p class="mut napomena">${L('readyNote').split('@1').join(prag(SIM_PTS_MIN))}</p>`;
    el('readyCard').querySelectorAll('.statLink').forEach((tr) => {
      const idi = () => browse('s' + tr.dataset.sub);
      tr.addEventListener('click', idi);
      tr.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); idi(); } });
    });
  }

  // ---------- Statistika ----------
  function renderStats() {
    current = { redraw: renderStats };
    setHash('#/stats');
    renderReady();
    el('statsCard').innerHTML = `<h3>${L('statsTitle')}</h3><p class="mut napomena">${L('statsTip')}</p><div id="statsBars"></div>`;
    nacrtajOblasti(el('statsBars'), { tacnost: true });
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
    pamtiSkrolSpiska('#/sek/' + key);
    let seen = 0, att = 0, wr = 0, inQ = 0, unseen = [], wrongNow = [];
    for (const qid of ids) {
      const r = S.q[qid];
      if (r && r.a) { seen++; att += r.a; wr += r.w; } else unseen.push(qid);
      if (inQueue(qid)) { inQ++; wrongNow.push(qid); }
    }
    const acc = att ? Math.round(100 * (att - wr) / att) : null;
    // sačuvana pozicija se ograničava na tekuću dužinu spiska: ako se baza smanji, natpis
    // dugmeta bi inače pisao „Nastavi (900/471)" (samo prikaz — startList je i ranije bio siguran)
    const pos = Math.min(S.secPos[key] || 0, Math.max(0, ids.length - 1));

    const head = el('browseHead');
    const catQ = type === 's' ? byId.get(ids[0]) : null;
    head.innerHTML = `
      <h3>${escapeHtml(name)}</h3>
      <div class="mut opisRed">${nQ(ids.length)} · ${seen} ${L('answered')}${acc !== null ? ` · ${L('thAcc').toLowerCase()}: <span class="${accClass(acc)}">${acc}%</span>` : ''} · ${inQ} ${L('inQueue')}${pomocHtml()}</div>
      ${pomocTekstHtml()}
      <div class="qActions">
        <button class="primary" id="bStart" ${!shuffleOn && pos > 0 ? `title="${escapeHtml(L('contTipSec'))}"` : ''}>${pos > 0 && !shuffleOn ? `${L('continueBtn')} (${pos + 1}/${ids.length})` : L('startBtn') + sfx()}</button>
        ${pos > 0 && !shuffleOn ? `<button class="secondary" id="bStartOver">${L('fromStart')}</button>` : ''}
        ${wrongNow.length ? `<button class="secondary" id="bWrong">${L('onlyWrong')} (${wrongNow.length})${sfx()}</button>` : ''}
        ${unseen.length && unseen.length < ids.length ? `<button class="secondary" id="bUnseen">${L('onlyUnseen')} (${unseen.length})${sfx()}</button>` : ''}
        ${shuffleBoxHtml()}
      </div>`;
    bindNav(head);
    bindShuffleBox(head);
    veziPomoc(head);
    const origin = () => browse(key);
    el('bStart').addEventListener('click', () => {
      if (shuffleOn) startList(maybeShuffle(ids), shufTag(secTitleFn(key)), null, 'filter', { origin });
      else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: S.secPos[key] || 0, origin, hash: '#/vezba/' + key });
    });
    const so = el('bStartOver'); if (so) so.addEventListener('click', () => startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: 0, origin, hash: '#/vezba/' + key }));
    const bw = el('bWrong'); if (bw) bw.addEventListener('click', () => startList(maybeShuffle(wrongNow), shufTag(() => `${secInfo(key).name} — ${L('onlyWrong').toLowerCase()}`), null, 'filter', { origin }));
    const bu = el('bUnseen'); if (bu) bu.addEventListener('click', () => startList(maybeShuffle(unseen), shufTag(() => `${secInfo(key).name} — ${L('onlyUnseen').toLowerCase()}`), null, 'filter', { origin }));

    const list = el('browseList');
    list.innerHTML = '';
    if (type === 'c') {
      const subIds = [...new Set(Q.filter((q) => q.cat === id).map((q) => q.sub))];
      const sh = document.createElement('h3'); sh.className = 'skrijUPretrazi'; sh.textContent = L('podoblasti'); list.appendChild(sh);
      for (const sid of subIds) {
        const sq = Q.filter((q) => q.sub === sid);
        const sSeen = sq.filter((q) => S.q[q.id] && S.q[q.id].a > 0).length;
        let sAtt = 0, sWr = 0;
        for (const q of sq) { const r = S.q[q.id]; if (r) { sAtt += r.a; sWr += r.w; } }
        const sAcc = sAtt ? Math.round(100 * (sAtt - sWr) / sAtt) : null;
        const b = document.createElement('button'); b.className = 'subRow skrijUPretrazi';
        b.title = T({ l: D.subs[sid].l, c: D.subs[sid].c });
        const naIsp = NA_ISPITU[sid];
        b.innerHTML = `<span class="subName">${escapeHtml(subShortName(sid))}${naIsp ? ` <span class="subExam" title="${escapeHtml(L('naIspituTip'))}">${L('naIspitu').replace('#', naIsp)}</span>` : ''}</span>
          <span class="subCnt">${sSeen}/${sq.length}</span>
          <span class="subAcc">${sAcc !== null ? `<span class="${accClass(sAcc)}">${sAcc}%</span>` : ''}</span>`;
        b.addEventListener('click', () => browse('s' + sid));
        list.appendChild(b);
      }
    }
    const qh = document.createElement('h3'); qh.textContent = L('allQuestions'); list.appendChild(qh);
    list.insertAdjacentHTML('beforeend', pretragaHtml(ids.length) + legendHtml());
    crtajRedove(list, ids, {
      grupa: type === 'c' ? ((q) => subShortName(q.sub)) : null,
      naslovOpis: (q) => T({ l: D.subs[q.sub].l, c: D.subs[q.sub].c }),
      naKlik: (idx) => {
        if (shuffleOn) rowStart(ids, idx, secTitleFn(key), origin);
        else startList(ids, secTitleFn(key), null, 'section', { secKey: key, startAt: idx, origin });
      },
    });
    veziPretragu(list);
    if (type === 'c') {
      const naslovi = [...list.querySelectorAll('.grupaNaslov')].map((n) => n.textContent);
      const drz = document.createElement('div');
      drz.innerHTML = skokNaOblastHtml(naslovi);
      if (drz.firstChild) { list.insertBefore(drz.firstChild, list.querySelector('.grupaNaslov')); veziSkok(list, list); }
    }
    show('browse');
    veziNaVrh();
    // podoblast se vraća u svoju oblast; oblast nema „nazad" — početna je brend na sredini
    if (type === 's') postaviNazad(catOf(catQ), () => browse('c' + catQ.cat));
  }

  // ---------- Strana "Sva pitanja" (učenje redom + filteri + spisak) ----------
  function browseAll() {
    current = { redraw: browseAll };
    setHash('#/sva');
    pamtiSkrolSpiska('#/sva');
    let seen = 0, att = 0, wr = 0, inQ = 0;
    const unseen = [], wrongNow = [];
    for (const q of Q) {
      const r = S.q[q.id];
      if (r && r.a) { seen++; att += r.a; wr += r.w; } else unseen.push(q.id);
      if (inQueue(q.id)) { inQ++; wrongNow.push(q.id); }
    }
    const acc = att ? Math.round(100 * (att - wr) / att) : null;
    const head = el('browseHead');
    // isti redosled dugmadi kao na strani oblasti: nastavi · od početka · pogrešna · neodgovorena · 🎲 · početna
    head.innerHTML = `<h3>${L('allPage')}</h3>
      <div class="mut opisRed">${nQ(Q.length)} · ${seen} ${L('answered')}${acc !== null ? ` · ${L('thAcc').toLowerCase()}: <span class="${accClass(acc)}">${acc}%</span>` : ''} · ${inQ} ${L('inQueue')}${pomocHtml()}</div>
      ${pomocTekstHtml()}
      <div class="qActions">
        <button class="primary" id="bCont" title="${escapeHtml(L('contTip'))}">${L('continueBtn')} (${Math.min(prviNeodgOd(S.seqPos) + 1, Q.length)}/${Q.length})</button>
        <button class="secondary" id="bFrom1">${L('fromStart')}${sfx()}</button>
        ${wrongNow.length ? `<button class="secondary" id="bWrong">${L('onlyWrong')} (${wrongNow.length})${sfx()}</button>` : ''}
        ${unseen.length && unseen.length < Q.length ? `<button class="secondary" id="bUnseen">${L('onlyUnseen')} (${unseen.length})${sfx()}</button>` : ''}
        ${shuffleBoxHtml()}
      </div>`;
    bindNav(head);
    bindShuffleBox(head);
    veziPomoc(head);
    el('bCont').addEventListener('click', () => startLearn(prviNeodgOd(S.seqPos)));
    el('bFrom1').addEventListener('click', () => {
      if (shuffleOn) startList(maybeShuffle(Q.map((q) => q.id)), shufTag(() => L('allPage')), null, 'filter', { origin: browseAll });
      else startLearn(0);
    });
    const bu = el('bUnseen'); if (bu) bu.addEventListener('click', () => startList(maybeShuffle(unseen), shufTag(() => `${L('allPage')} — ${L('onlyUnseen').toLowerCase()}`), null, 'filter', { origin: browseAll }));
    const bw = el('bWrong'); if (bw) bw.addEventListener('click', () => startList(maybeShuffle(wrongNow), shufTag(() => `${L('allPage')} — ${L('onlyWrong').toLowerCase()}`), null, 'filter', { origin: browseAll }));

    const list = el('browseList');
    const imenaOblasti = [];
    { let zadnja = null; for (const q of Q) { if (q.cat !== zadnja) { zadnja = q.cat; const c = D.cats.find((x) => x.id === q.cat); imenaOblasti.push(c ? T({ l: c.l, c: c.c }) : ''); } } }
    list.innerHTML = `<h3>${L('allQuestions')}</h3>` + pretragaHtml(Q.length)
      + skokNaOblastHtml(imenaOblasti) + legendHtml();
    const allIds = Q.map((q) => q.id);
    const imeOblasti = (q) => { const c = D.cats.find((x) => x.id === q.cat); return c ? T({ l: c.l, c: c.c }) : ''; };
    crtajRedove(list, allIds, {
      grupa: imeOblasti,
      naKlik: (idx) => { if (shuffleOn) rowStart(allIds, idx, () => L('allPage'), browseAll); else startLearn(idx); },
    });
    veziPretragu(list);
    veziSkok(list, list);
    show('browse');
    veziNaVrh();
  }

  // ---------- Strane "Pogrešna" i "Obeležena" (spisak + vežbanje) ----------
  function browseSet(setKind) {
    current = { redraw: () => browseSet(setKind) };
    setHash('#/lista/' + (setKind === 'wrong' ? 'wrong' : 'marked'));
    pamtiSkrolSpiska('#/lista/' + (setKind === 'wrong' ? 'wrong' : 'marked'));
    const isWrong = setKind === 'wrong';
    const title = isWrong ? L('drill') : L('marked');
    let ids, ready = [], waiting = [], stale = [];
    if (isWrong) { ({ ready, waiting } = queueSplit()); stale = zaOsvezavanje(); ids = ready.concat(waiting); }
    else ids = markedIds();

    const head = el('browseHead');
    if (!ids.length && !(isWrong && stale.length)) {
      // prazno stanje mora da vodi NAPRED (u radnju koja ga puni), a ne samo nazad;
      // i tekst mora da odgovara stanju: ko nije odgovorio nijedno pitanje nije ništa „savladao"
      const nista = !Q.some((q) => S.q[q.id] && S.q[q.id].a);
      const poruka = isWrong ? (nista ? L('drillEmptyNovi') : L('drillEmpty')) : L('markedEmpty');
      const dalje = isWrong && !nista
        ? `<button type="button" class="primary" data-nav="sim">${L('endSimBtn')}</button>`
        : `<button type="button" class="primary" data-nav="learn">${L('krenimo')}</button>`;
      head.innerHTML = `<h3>${escapeHtml(title)}</h3>
        <p class="qText" style="font-weight:normal">${poruka}</p>
        <div class="qActions">${dalje}</div>`;
      bindNav(head);
      el('browseList').innerHTML = '';
      el('browseList').hidden = true;   // prazan .card je inače ostajao kao beli pravougaonik
      show('browse');
      veziNaVrh();
      return;
    }
    el('browseList').hidden = false;
    const origin = () => browseSet(setKind);
    head.innerHTML = `<h3>${escapeHtml(title)}</h3>
      <div class="mut opisRed">${isWrong
        ? `${ids.length} ${L('inQueue')}: ${ready.length} ${L('ponDanas')} · ${waiting.length} ${L('ponKasnije')}${stale.length ? ` · ${stale.length} ${L('osveziLbl')}` : ''}${pomocHtml()}`
        : `${ids.length}`}</div>
      ${isWrong ? pomocTekstHtml(stale.length ? L('osveziTip') : '') : ''}
      <div class="qActions">
        ${isWrong
          ? `${ready.length ? `<button class="primary" id="bReady">${L('vezbajReady')} (${ready.length})${sfx()}</button>` : ''}
             ${waiting.length ? `<button class="secondary" id="bAll">${L('drillWaitingBtn')} (${ids.length})${sfx()}</button>` : ''}
             ${stale.length ? `<button class="secondary" id="bStale" title="${escapeHtml(L('osveziTip'))}">${L('osveziBtn')} (${stale.length})${sfx()}</button>` : ''}`
          : `<button class="primary" id="bAllM">${L('vezbaj')} (${ids.length})${sfx()}</button>`}
        ${shuffleBoxHtml()}
      </div>
      ${isWrong && waiting.length ? `<div class="mut napomena razmakG">${L('preRokaNapomena')}</div>` : ''}`;
    bindNav(head);
    bindShuffleBox(head);
    veziPomoc(head);
    const br = el('bReady'); if (br) br.addEventListener('click', () => startList(maybeShuffle(queueSplit().ready), shufTag(() => L('drill')), () => L('drillEmpty'), shuffleOn ? 'drill-all' : 'drill', { origin }));
    const ba = el('bAll'); if (ba) ba.addEventListener('click', () => startList(maybeShuffle(ids), shufTag(() => L('drill')), null, 'drill-all', { origin }));
    const bo = el('bStale'); if (bo) bo.addEventListener('click', () => startList(maybeShuffle(zaOsvezavanje()), shufTag(() => L('osveziTitle')), () => L('drillEmpty'), 'filter', { origin }));
    const bm = el('bAllM'); if (bm) bm.addEventListener('click', () => startList(maybeShuffle(ids), shufTag(() => L('marked')), null, 'filter', { origin }));

    const list = el('browseList');
    list.innerHTML = pretragaHtml(ids.length) + legendHtml();
    const now = Date.now();
    crtajRedove(list, ids, {
      dodatak: (q, r) => {
        if (!isWrong || !r || (r.due || 0) <= now) return '';
        const days = Math.ceil((r.due - now) / DAY);
        return ` <span class="mut">(${days <= 1 ? L('dueTomorrow') : (one(days) ? L('dueDaysOne') : L('dueDays')).replace('#', days)})</span>`;
      },
      naKlik: (idx) => {
        if (shuffleOn) rowStart(ids, idx, () => title, origin);
        else startList(ids, () => title, null, isWrong ? 'drill-all' : 'filter', { startAt: idx, origin });
      },
    });
    veziPretragu(list);
    show('browse');
    // i ova strana ume da bude duboka (svi pogrešni, sve obeleženo) — dugme „na vrh" je i
    // ranije umelo da se pojavi ovde, ali samo ako se pre toga posetila strana koja ga pravi
    veziNaVrh();
  }

  // ---------- Automatski upis napretka u fajl (File System Access) ----------
  let fsHandle = null;      // aktivna dozvola
  let fsPending = null;     // sačuvan handle koji čeka klik za dozvolu
  let backupTimer = null;
  const FSA = 'showSaveFilePicker' in window;

  // Čuvanje fajla na JEDNOM mestu, za napredak i za sliku rezultata. Gde pregledač to ume
  // (Chrome i Edge na računaru), pita GDE i POD KOJIM IMENOM — kao svaki drugi program.
  // Gde ne ume (telefon, Firefox, Safari), pada na preuzimanje u podrazumevanu fasciklu,
  // jer drugog puta nema. Odustajanje u sistemskom prozoru NIJE greška: vraća null i ćuti.
  async function sacuvajFajl(blob, ime, tipovi) {
    if (FSA) {
      try {
        const h = await window.showSaveFilePicker({ suggestedName: ime, types: tipovi });
        const w = await h.createWritable();
        await w.write(blob);
        await w.close();
        return h.name || ime;
      } catch (e) {
        if (e && e.name === 'AbortError') return null;
        console.warn('Čuvanje kroz sistemski prozor nije prošlo, ide preuzimanje:', e);
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = ime;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return ime;
  }

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

  // Rezerva u fajl se ranije gasila na PRVU grešku, ma kakva bila, i to bez ijedne reči: jedini
  // trag je bilo dugme koje se vrati u podešavanjima, gde korisnik i ne gleda. Sada:
  //  · izgubljena dozvola je jedini razlog za gašenje (tad dugme za ponovno povezivanje ima smisla),
  //  · prolazna greška (zaključan fajl, dva upisa u letu) dobija još jedan pokušaj,
  //  · ako ni on ne prođe, kaže se naglas i rezerva OSTAJE uključena,
  //  · upis se ne preklapa sam sa sobom (ista brava kao kod povezivanja),
  //  · piše se preko postojećeg sadržaja pa se dužina skrati na kraju — prekid struje između
  //    upisa i zatvaranja ne ostavlja prazan fajl umesto kopije.
  let upisUToku = false;
  let upozorenONeuspehuRezerve = false;
  async function upisiRezervu() {
    const tekst = JSON.stringify(S);
    const w = await fsHandle.createWritable({ keepExistingData: true });
    await w.write({ type: 'write', position: 0, data: tekst });
    await w.truncate(new Blob([tekst]).size);
    await w.close();
  }
  function scheduleBackup() {
    if (!fsHandle) return;
    clearTimeout(backupTimer);
    backupTimer = setTimeout(async () => {
      if (!fsHandle || upisUToku) return;
      upisUToku = true;
      try {
        try {
          await upisiRezervu();
        } catch (e) {
          if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) throw e;
          await new Promise((r) => setTimeout(r, 2000));   // prolazna smetnja — još jedan pokušaj
          await upisiRezervu();
        }
        upozorenONeuspehuRezerve = false;
      } catch (e) {
        if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) {
          fsPending = fsHandle; fsHandle = null; renderBackupLine();   // dozvola istekla
          trakaUpozorenja(L('rezervaDozvola'));
        } else if (!upozorenONeuspehuRezerve) {
          upozorenONeuspehuRezerve = true;
          console.warn('Rezerva u fajl nije upisana:', e);
          trakaUpozorenja(L('rezervaNeuspeh'));
        }
      } finally { upisUToku = false; }
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
      poruci(L('porPovezano'));
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
  // Dugme za povezivanje stoji u ISTOJ mreži kao „Sačuvaj/Učitaj" (jednake ćelije), a stanje
  // (povezano / nije podržano) ide kao napomena ispod — ranije je dugme bilo samo u svom redu.
  function renderBackupLine() {
    const s = el('backupLine'), slot = el('backupSlot');
    if (!s || !slot) return;
    s.innerHTML = ''; slot.innerHTML = ''; slot.style.display = 'none';
    if (!FSA) { s.textContent = L('backupNA'); return; }
    if (fsHandle) { s.innerHTML = `✅ ${L('backupOn')}: <b>${escapeHtml(fsHandle.name)}</b>`; return; }
    slot.style.display = 'contents';
    if (fsPending) {
      slot.innerHTML = `<button type="button" class="secondary" id="btnResumeBackup">🔗 ${L('backupResume')} (${escapeHtml(fsPending.name)})</button>`;
      el('btnResumeBackup').addEventListener('click', resumeBackup);
      return;
    }
    slot.innerHTML = `<button type="button" class="secondary" id="btnConnectBackup">${L('backupConnect')}</button>`;
    el('btnConnectBackup').addEventListener('click', connectBackup);
  }

  // ---------- Početna ----------
  const TOUR_STEPS = [
    { sel: '#homeSummary', key: 'tour1' },
    { sel: '.menuBtn[data-nav="learn"]', key: 'tour2' },
    { sel: '.menuBtn[data-nav="drill"]', key: 'tour3' },
    { sel: '.menuBtn[data-nav="sim"]', key: 'tour4' },
    { sel: '#btnOblasti', key: 'tour5' },
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
      // visok element (kartica duža od ekrana) se poravnava na VRH — centriranje bi mu
      // gurnulo početak iznad ekrana, pa korisnik gleda sredinu onoga što mu se objašnjava
      spot.scrollIntoView({ block: spot.offsetHeight > window.innerHeight * 0.6 ? 'start' : 'center' });
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
      btnNext.focus({ preventScroll: true });   // фокус улази у водич — тастатура ради одмах, али страна не скаче
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
  // JEDNA formula tempa — nju koriste i sažetak na početnoj i „Predloži mi". Ranije su bile
  // dve (sažetak bez rezerve), pa je isti ekran nudio 54 i 81 za istu stvar.
  // Novo gradivo mora da se završi PRE ispita — poslednji dani ostaju za ponavljanje
  // i simulacije. Rezerva je nedelja dana, ali nikad više od trećine preostalog vremena.
  // Koliko pitanja iz koje podoblasti PROSEČNO nosi jedan ispit — izvedeno iz zvaničnog šablona
  // (SIM_SLOTS): slot sa više mogućih podoblasti deli svoju jedinicu na njih. Podoblast 134
  // (preticanje) tako nosi 5, a 91 nula. Ko nema vremena za sve, uči prvo ono što se i pojavljuje.
  let _tezine = null;
  function tezinaPodoblasti() {
    if (_tezine) return _tezine;
    const t = {};
    for (const slot of SIM_SLOTS) for (const s of slot.s) t[s] = (t[s] || 0) + 1 / slot.s.length;
    _tezine = t;
    return t;
  }

  function predlogTempa(dana, neodg) {
    const rezerva = Math.min(7, Math.floor(dana / 3));
    const danaZaNovo = Math.max(1, dana - rezerva);
    const novih = neodg ? Math.max(1, Math.ceil(neodg / danaZaNovo)) : null;
    // ponavljanja: koliko se stvarno može u jednoj sednici, ne ceo zaostatak
    const pon = Math.min(60, Math.max(15, queueSplit().ready.length));
    return { rezerva, danaZaNovo, novih, pon };
  }
  // Dani do ispita: obe tačke su lokalna ponoć, pa je razlika ceo broj dana ±1h (letnje/zimsko
  // vreme) — zato round, nikad ceil. Ranije su sažetak (round) i „Predloži mi" (ceil) mogli da se
  // razlikuju za dan, pa i za tempo.
  function danaDoIspita() {
    if (!S.examDate) return null;
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const d = Math.round((new Date(S.examDate + 'T00:00:00') - d0) / DAY);
    return Number.isFinite(d) ? d : null;
  }
  const neodgovorenih = () => Q.filter((q) => !S.q[q.id] || !S.q[q.id].a).length;
  // „Nastavi" na Sva pitanja: prvo NEODGOVORENO pitanje od mesta gde si stao. Ko uči kroz
  // plan dana ili oblasti ne sme na „Nastavi" da dobije pitanje 1 koje je odavno rešio.
  function prviNeodgOd(pos) {
    for (let i = pos; i < Q.length; i++) if (!S.q[Q[i].id] || !S.q[Q[i].id].a) return i;
    return Math.min(pos, Q.length);
  }
  // Auto režim: dnevna kvota se izvodi iz onoga što je OSTALO i broja dana do ispita, svakog dana
  // iznova. Zato višak urađen danas sam po sebi snižava sutrašnju kvotu — ne pamti se nikakav dug.
  function autoKvota() {
    const dana = danaDoIspita();
    if (dana === null || dana < 1) return null;      // bez datuma ispita nema od čega da se računa
    const neodg = neodgovorenih();
    const { danaZaNovo } = predlogTempa(dana, neodg);
    const cNovih = neodg ? Math.max(1, Math.ceil(neodg / danaZaNovo)) : 0;
    // svako novo pitanje traži bar jednu potvrdu, a tu je i zaostali red — otud sabirak
    const naRedu = queueSplit().ready.length;
    const cPon = Math.min(120, Math.max(20, cNovih + Math.ceil(naRedu / dana)));
    return { cNovih, cPon, dana };
  }
  function planStanje() {
    if (!S.plan) return null;
    const d = (S.day && S.day.d === localDay()) ? S.day : null;
    const uNovih = d ? (d.novih || 0) : 0;
    const uPon = d ? (d.pon || 0) : 0;
    const auto = S.plan.auto ? autoKvota() : null;
    const cNovih = auto ? auto.cNovih : (S.plan.novih || 0);
    const cPon = auto ? auto.cPon : (S.plan.pon || 0);
    return {
      auto: !!auto,
      // uključen auto, a kvota nema od čega da se izračuna — razlog se razlikuje:
      // nema datuma / datum prošao / ispit je danas (tada niko ne planira kvote)
      autoBezDatuma: !!S.plan.auto && !auto && danaDoIspita() === null,
      autoProsaoDatum: !!S.plan.auto && !auto && danaDoIspita() !== null && danaDoIspita() < 0,
      cNovih, uNovih, cPon, uPon,
      ostaloNovih: Math.max(0, cNovih - uNovih),
      ostaloPon: Math.max(0, cPon - uPon),
      // kvota bez gradiva: prvog dana nema šta da se ponavlja, na kraju nema novih
      nemaNovih: neodgovorenih() === 0,
      nemaPon: !queueSplit().ready.length && !zaOsvezavanje().length,
    };
  }
  function planIds() {
    const p = planStanje();
    if (!p) return [];
    let nova = [];
    if (S.plan && S.plan.prio) {
      // prvo ono što se na ispitu i pojavljuje: podoblast koja nosi 5 pitanja pre one koja nosi 0
      const tez = tezinaPodoblasti();
      nova = Q.filter((q) => !S.q[q.id] || !S.q[q.id].a)
        .sort((a, b) => (tez[b.sub] || 0) - (tez[a.sub] || 0))
        .slice(0, p.ostaloNovih).map((q) => q.id);
    } else {
      for (const q of Q) {
        if (nova.length >= p.ostaloNovih) break;
        if (!S.q[q.id] || !S.q[q.id].a) nova.push(q.id);
      }
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
    // Kvota bez gradiva se smatra ispunjenom — inače bi prvog dana (nema šta da se
    // ponavlja) i u poslednjoj nedelji (nema novih) cilj zauvek stajao „neispunjen".
    // Ime ide ISPRED brojeva, a koliko još ostaje piše se izričito — ranije se „ostalo 7`
    // moglo izvesti samo oduzimanjem 60 − 53 u glavi, pa je rečenica ispod izgledala kao da
    // protivreči traci iznad.
    const red = (lbl, u, c, nema, nemaLbl) => (c <= 0 ? '' : `<div class="planRed"><span class="planIme">${lbl}: <b>${u}</b> / ${c}${nema && u < c ? ` <span class="mut">(${nemaLbl})</span>` : (u < c ? ` <span class="mut">· ${L('planOstaje')} ${c - u}</span>` : '')}</span>
      <span class="planBar"><span style="width:${Math.min(100, Math.round(100 * u / c))}%"></span></span>
      <span class="mut">${u >= c || nema ? '✓' : ''}</span></div>`);
    const ispunjen = (p.ostaloNovih === 0 || p.nemaNovih) && (p.ostaloPon === 0 || p.nemaPon);
    const ima = planIds().length;
    const naRedu = queueSplit().ready.length;
    // Ako je zaostalo više nego što staje u kvotu, kaže se ODAKLE dokle: dnevni cilj je kvota, ne dug,
    // pa velika brojka ne sme da izgleda kao obaveza za danas.
    const zaostatak = (!ispunjen && naRedu > p.cPon && p.cPon > 0)
      ? `<div class="mut napomena">${L('planOdNaRedu').split('@1').join(nQ(naRedu)).split('@2').join(p.cPon).split('@3').join(p.ostaloPon)}</div>` : '';
    // PRESUDA, ne uteha. Sve tri grane su donja granica, ne prognoza: svako novo pitanje ulazi u
    // red i traži bar jednu potvrdu (inQueue), pa je „potrebno ponavljanja` zbir zaostalog reda i
    // broja novih koje ćeš otvoriti. Ako ni taj minimum ne staje — to se kaže, sa lostovima.
    let neStize = '';
    {
      const dana = danaDoIspita();
      const neodg = neodgovorenih();
      if (dana !== null && dana > 0 && (p.cNovih > 0 || p.cPon > 0)) {
        const otvoriS = Math.min(neodg, p.cNovih * dana);
        const stigneGradivo = otvoriS >= neodg;
        const potrebnoPon = naRedu + otvoriS;
        const kapacitetPon = p.cPon * dana;
        const t = predlogTempa(dana, neodg);
        const trebaNovih = neodg ? Math.max(1, Math.ceil(neodg / t.danaZaNovo)) : 0;
        const trebaPon = Math.min(200, Math.ceil((naRedu + neodg) / dana));
        const lostovi = [];
        if (!p.auto && (trebaNovih > p.cNovih || trebaPon > p.cPon)) {
          lostovi.push(`<button type="button" class="secondary sBtn" id="btnLostTempo" data-novih="${trebaNovih}" data-pon="${trebaPon}">${L('lostTempo').split('@1').join(trebaNovih).split('@2').join(trebaPon)}</button>`);
        }
        if (!(S.plan && S.plan.prio)) lostovi.push(`<button type="button" class="secondary sBtn" id="btnLostPrio">${L('lostPrio')}</button>`);
        const dugmad = lostovi.length ? `<div class="razmakG">${lostovi.join(' ')}</div>` : '';
        if (!stigneGradivo && p.cNovih > 0) {
          neStize = `<div class="mut napomena">${L('sudNeStize').split('@1').join(p.cNovih).split('@2').join(otvoriS).split('@3').join(neodg).split('@4').join(neodg - otvoriS)}</div>${dugmad}`;
        } else if (potrebnoPon > kapacitetPon) {
          neStize = neodg === 0
            ? `<div class="mut napomena">${L('sudPonNeStaju').split('@1').join(nQ(potrebnoPon)).split('@2').join(kapacitetPon)}</div>${dugmad}`
            : `<div class="mut napomena">${L('sudGradivoDa').split('@1').join(p.cNovih).split('@2').join(potrebnoPon).split('@3').join(kapacitetPon).split('@4').join(potrebnoPon - kapacitetPon)}</div>${dugmad}`;
        } else {
          neStize = `<div class="mut napomena">${neodg === 0 ? L('sudStizeSvePon') : L('sudStize').split('@1').join(neodg)}</div>`;
        }
        if (S.plan && S.plan.prio) neStize += `<div class="mut napomena">${L('lostPrioUkljucen')}</div>`;
      }
      if (p.autoBezDatuma) neStize = `<div class="mut napomena">${L('autoBezDatuma')}</div>`;
      // datum prošao: kaže se to, a ne „nema datuma"; na sam dan ispita presuda ćuti —
      // red „ispit je danas — srećno!" iz homeExtras govori umesto nje
      if (p.autoProsaoDatum) neStize = `<div class="mut napomena">${L('prosaoDatum').split('@1').join(fmtDatum(S.examDate))}</div>`;
    }
    // Višak preko cilja se VIDI — u auto režimu on sam snižava sutrašnju kvotu.
    const visak = (p.cNovih > 0 && p.uNovih > p.cNovih)
      ? `<div class="mut napomena">${L('viskDanas').split('@1').join(p.uNovih).split('@2').join(p.cNovih).split('@3').join(p.uNovih - p.cNovih)}${p.auto ? L('viskAuto') : ''}</div>` : '';
    // posle ispunjenog cilja ne kaže se „vidimo se sutra" dok istovremeno nešto čeka na redu
    const dno = ispunjen ? `<span class="mut">${naRedu ? L('planIspunjenJos').split('@1').join(nQ(naRedu)) : L('planIspunjen')}</span>${naRedu ? ` <button type="button" class="secondary sBtn" data-nav="drill">${L('drill')} ›</button>` : ''}`
      : !ima ? `<span class="mut">${L('planNemaDostupnih')}</span>`
        : `<button class="primary" id="btnPlanVezbaj">${L('planVezbaj')} (${ima})</button>`;
    return `<div class="planBox"><b>${L('planNaslov')}</b> &nbsp;<button type="button" class="bcLink" id="btnPlanPodesi">${L('planPodesi')} ›</button>
      ${red(L('novihLbl'), p.uNovih, p.cNovih, p.nemaNovih, L('planSveOdgovoreno'))}${red(L('ponLbl'), p.uPon, p.cPon, p.nemaPon, L('planNemaPon'))}
      ${zaostatak}${visak}${neStize}<div class="razmakG">${dno}</div></div>`;
  }

  function homeExtras() {
    const delovi = [];
    if (S.streakD === localDay() && S.streakN >= 2) delovi.push('🔥 ' + S.streakN + '. ' + L('streakDani'));
    // kad cilj postoji, kvota ponavljanja stoji u bloku cilja — isti broj ne ide dvaput
    const naRedu = queueSplit().ready.length;
    if (naRedu > 0 && !S.plan) delovi.push('🔁 ' + L('planPonavljanja').replace('#', naRedu));
    {
      // predlog simulacije: JEDNO pravilo za sažetak, vodič i turu — procena spremnosti
      // blizu praga (80+ od 98) i nijedna simulacija danas; u poslednjih 7 dana pred
      // ispit: po jedna dnevno.
      const { exp, answered } = readiness();
      const procena = answered >= 30 ? Math.round(exp) : null;
      const zadnja = S.sims.length ? S.sims[S.sims.length - 1].d : 0;
      const simDanas = zadnja && new Date(zadnja).toDateString() === new Date().toDateString();
      const doIspita = danaDoIspita();
      if (doIspita !== null && doIspita >= 0 && doIspita <= 7) {
        if (!simDanas) delovi.push('🎯 ' + L('planSimNedelja'));
      } else if (procena !== null && procena >= SIM_PREDLOG_OD && !simDanas && (!zadnja || Date.now() - zadnja > 2.5 * DAY)) {
        delovi.push('🎯 ' + L('planSim').split('@1').join(procena));
      }
    }
    if (S.examDate) {
      const dana = danaDoIspita();
      // datum u prošlosti: do sada se NIŠTA nije prikazivalo — ni „do ispita", ni upozorenje,
      // pa je čovek posle ispita zauvek nosio mrtav datum u stanju a da to nigde ne vidi
      if (dana !== null && dana < 0) delovi.push(L('prosaoDatum').split('@1').join(fmtDatum(S.examDate)));
      if (dana !== null && dana >= 0) {
        // srpska jednina: „1 dan", ne „1 dana"; na sam dan ispita ne piše se „0 dana"
        if (dana === 0) delovi.push(L('examToday'));
        else delovi.push('📅 ' + L('examIn') + ': ' + dana + ' ' + (one(dana) ? L('examDaysOne') : L('examDays')));
        const neodg = neodgovorenih();
        if (dana > 0 && neodg > 0) {
          const tempo = predlogTempa(dana, neodg).novih;
          if (!S.plan) delovi.push(L('examPlan').replace('#', tempo).split('@1').join(novihPitanja(tempo)));
          else if (S.plan.novih && S.plan.novih * dana < neodg) {
            // cilj ne stiže do kraja gradiva pre ispita — to se kaže, ne ćuti se
            delovi.push('⚠ ' + L('planPremalo').split('@1').join(S.plan.novih + ' ' + novihPitanja(S.plan.novih)).split('@2').join(S.plan.novih * dana).split('@3').join(neodg).split('@4').join(tempo)
              + ` <button type="button" class="secondary sBtn" id="btnUskladiCilj">${L('planUskladi')}</button>`);
          }
        }
      }
    }
    return delovi.length ? '<div class="homeExtras">' + delovi.join(' &nbsp;·&nbsp; ') + '</div>' : '';
  }

  // ---------- Oblasti: JEDAN crtač za početnu i statistiku ----------
  // Ranije je statistika imala svoju tabelu bez veza ka pitanjima; sada oba mesta koriste
  // iste redove — traka napretka, brojač, klik vodi na spisak, strelica otklapa podoblasti
  // (akordeon). Statistika uz to prikazuje i tačnost.
  function nacrtajOblasti(cont, opts) {
    opts = opts || {};
    cont.innerHTML = '';
    const stat = (qq) => {
      let seen = 0, good = 0, att = 0, wr = 0;
      for (const q of qq) { const r = S.q[q.id]; if (r && r.a) { seen++; att += r.a; wr += r.w; if (r.streak >= 1) good++; } }
      return { seen, good, att, wr, acc: att ? Math.round(100 * (att - wr) / att) : null };
    };
    const accHtml = (st) => !opts.tacnost ? '' : `<span class="catAcc">${st.acc === null ? '—' : `<span class="${accClass(st.acc)}">${st.acc}%</span>`}</span>`;
    const redHtml = (labelHtml, st, tot, jak) => `<button type="button" class="catMain"><span class="catName">${jak ? '<b>' + labelHtml + '</b>' : labelHtml}</span>
        <span class="catBar"><span class="seen" style="width:${tot ? 100 * st.seen / tot : 0}%"></span><span class="good" style="width:${tot ? 100 * st.good / tot : 0}%"></span></span>
        <span class="catCnt">${jak ? '<b>' + st.seen + '/' + tot + '</b>' : st.seen + '/' + tot}</span>${accHtml(st)}</button>`;
    {
      const st = stat(Q);
      const row = document.createElement('div'); row.className = 'catRow catTotal';
      row.innerHTML = '<span class="catChevSpacer"></span>' + redHtml(L('ukupno'), st, Q.length, true);
      row.querySelector('.catMain').addEventListener('click', () => browseAll());
      cont.appendChild(row);
    }
    for (const c of CATS) {
      const qq = Q.filter((q) => q.cat === c.id);
      const st = stat(qq);
      const row = document.createElement('div'); row.className = 'catRow';
      row.innerHTML = `<button type="button" class="catChevBtn" aria-expanded="false" title="${escapeHtml(L('catExpand'))}" aria-label="${escapeHtml(L('catExpand'))}">▸</button>` + redHtml(escapeHtml(T(c)), st, qq.length, false);
      row.querySelector('.catMain').setAttribute('title', L('catOpen'));
      row.querySelector('.catMain').addEventListener('click', () => browse('c' + c.id));
      row.querySelector('.catChevBtn').addEventListener('click', () => {
        // akordeon: otvaranje jedne oblasti sklapa prethodno otvorenu
        const zatvoriRed = (r) => {
          r.classList.remove('open');
          const ch = r.querySelector('.catChevBtn');
          if (ch) { ch.textContent = '▸'; ch.setAttribute('aria-expanded', 'false'); }
          let n2 = r.nextElementSibling;
          while (n2 && n2.classList.contains('catSubRow')) { const rm2 = n2; n2 = n2.nextElementSibling; rm2.remove(); }
        };
        const bioOtvoren = row.classList.contains('open');
        cont.querySelectorAll('.catRow.open').forEach(zatvoriRed);
        if (bioOtvoren) return;
        row.classList.add('open');
        const chev = row.querySelector('.catChevBtn');
        chev.textContent = '▾';
        chev.setAttribute('aria-expanded', 'true');
        let ref = row, zi = 0;
        for (const sid of [...new Set(qq.map((q) => q.sub))]) {
          const sq = qq.filter((q) => q.sub === sid);
          const sr = document.createElement('div');
          sr.className = 'catRow catSubRow' + (zi++ % 2 ? ' zebra' : '');
          sr.title = T({ l: D.subs[sid].l, c: D.subs[sid].c });
          sr.innerHTML = '<span class="catChevSpacer"></span>' + redHtml(escapeHtml(subShortName(sid)), stat(sq), sq.length, false);
          sr.querySelector('.catMain').addEventListener('click', () => browse('s' + sid));
          ref.after(sr); ref = sr;
        }
      });
      cont.appendChild(row);
    }
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
        lastChip = `<div class="razmakG"><button class="${lastKlasa}" id="btnLastSec">▶ ${L('continueBtn')}: ${escapeHtml(si.name)} (${p + 1}/${si.ids.length})</button></div>`;
      }
    }
    const today = localDay();
    // Svaki broj ima IME ispred sebe i svoj red. Ranije je ceo sažetak bio jedan niz brojeva
    // razdvojen tačkama, pa se nije videlo ni šta je koji broj ni odakle se dobija: vlasnik je
    // pitao „odakle ti broj 401`. Sabirci sada stoje sa znakom plus, a ispod je imenovano
    // dugme koje otvara objašnjenje (ranije goli upitnik).
    const uRedu = ready.length + waiting.length;
    const osv = zaOsvezavanje().length;
    const neotvoreno = Q.length - answeredCnt;
    const brRed = (ime, telo) => `<div class="brRed"><span class="brIme">${ime}:</span> <span>${telo}</span></div>`;
    const danasN = S.day && S.day.d === today ? S.day.n : 0;
    const redovi = [
      brRed(L('brPitanja'), `<b>${answeredCnt}</b> ${L('ofQ')} ${Q.length} ${L('answered')}${neotvoreno ? ` · <b>${neotvoreno}</b> ${L('brNeotvoreno')}` : ''}`),
      (uRedu || osv) ? brRed(L('brZaPon'), `<b>${uRedu}</b>${uRedu ? ` = ${ready.length} ${L('ponDanas')} + ${waiting.length} ${L('ponKasnije')}` : ''}${osv ? ` · <b>${osv}</b> ${L('osveziLbl')}` : ''}`) : '',
      danasN ? brRed(L('brDanasOdg'), `${nQ(danasN)}, ${S.day.ok} ${L('okShort')}`) : '',
      mk ? brRed(L('brObelezeno'), `<b>${mk}</b>`) : '',
    ].filter(Boolean).join('');
    el('homeSummary').innerHTML = redovi
      + `<div><button type="button" class="pomocBtn2 bcLink" id="btnBrojevi">${L('brKakoSeRacuna')}</button>
         <div class="pomocTekst mut napomena" id="brojeviTekst" style="display:none">${L('brojeviTip')}<br><br>${L('queueTip')}</div></div>`
      + lastChip + homeExtras() + planBlok();
    sklopivo(el('btnBrojevi'), null, el('brojeviTekst'));
    bindNav(el('homeSummary'));
    {
      // Lostovi iz presude: podigni tempo na izračunat, ili uči prvo ono što ispit nosi.
      const bt = el('btnLostTempo');
      if (bt) bt.addEventListener('click', () => {
        S.plan = { ...(S.plan || {}), novih: +bt.dataset.novih, pon: +bt.dataset.pon };
        save(); renderHome();
        poruci(L('planUskladjen').split('@1').join(bt.dataset.novih).split('@2').join(bt.dataset.pon));
      });
      const bp = el('btnLostPrio');
      if (bp) bp.addEventListener('click', () => {
        S.plan = { ...(S.plan || {}), prio: 1 };
        save(); renderHome();
        poruci(L('lostPrioUkljucen'));
      });
    }
    {
      // „Uskladi cilj": upisuje predloženi tempo odmah, da čovek ne mora da traži polja u podešavanjima
      const buc = el('btnUskladiCilj');
      if (buc) buc.addEventListener('click', () => {
        const dana = danaDoIspita();
        if (dana === null || dana < 1) return;
        const { novih, pon } = predlogTempa(dana, neodgovorenih());
        S.plan = { novih, pon };
        save(); renderHome();
        poruci(L('planUskladjen').split('@1').join(novih === null ? 0 : novih).split('@2').join(pon));
      });
      const bpp = el('btnPlanPodesi');
      if (bpp) bpp.addEventListener('click', () => {
        // kontrole cilja su u podešavanjima, na dnu strane — skok do njih, ne skrol kroz sve
        const g = el('planGrupa');
        if (g) g.scrollIntoView({ block: 'start' });
        const pn = el('planNovih'); if (pn && !pn.disabled) pn.focus({ preventScroll: true });
      });
    }
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
    // redni broj, ne brojanje: „493 od 1327" je stajalo tik ispod „492 od 1327 odgovoreno",
    // a to su dve različite vrste broja koje se slučajno poklope
    el('mLearnSub').textContent = `${L('nastaviOd').split('@1').join(Math.min(prviNeodgOd(S.seqPos) + 1, Q.length))} · ${L('allPageSub')}`;
    el('mDrill').textContent = L('drill');
    {
      const osv = zaOsvezavanje().length;
      el('mDrillSub').textContent = `${ready.length} ${L('ponDanas')} · ${waiting.length} ${L('ponKasnije')}${osv ? ` · ${osv} ${L('osveziLbl')}` : ''}`;
    }
    el('mMarked').textContent = L('marked');
    el('mMarkedSub').textContent = `${mk}`;
    el('mSim').textContent = L('sim');
    {
      // procena stoji uz dugme za ispit — tamo je i odluka „hoću li danas na simulaciju"
      const sp = spremnost();
      const pct = sp.odgovoreno >= 30 && sp.sansa !== null ? Math.round(sp.sansa * 100) : null;
      el('mSimSub').textContent = L('simSub') + (pct === null ? '' : ` · ${L('sansaNaslov').toLowerCase()} ${pct}%`);
    }
    el('mStats').textContent = L('stats');
    el('mStatsSub').textContent = L('statsSub');
    el('catBars').innerHTML = `<button type="button" class="explCardBtn pojBtn" id="btnOblasti">${L('oblastiDugme')}</button>
      <div class="mut napomena">${L('oblastiPod')}</div>`;
    el('btnOblasti').addEventListener('click', renderStats);

    const sh = el('simHistory');
    if (!S.sims.length) sh.innerHTML = `<h3>${L('history')}</h3><p class="mut">${L('noSims')}</p>`;
    else {
      // kartica ne raste beskonačno: poslednjih 5 je uvek vidljivo, starije se otklapaju na zahtev
      const NOVIJIH = 5;
      const redovi = S.sims.slice().reverse().map((s, ri) => {
        const brGresaka = (s.wrong || []).length;
        return `<button class="histRow histBtn" data-sim="${S.sims.length - 1 - ri}">
            <span class="histDate mut">${fmtDatum(s.d, true)}</span>
            <b class="histScore">${s.score} / ${s.total}</b>
            <span class="histPill"><span class="pill ${s.passed ? 'pass' : 'fail'}">${s.passed ? L('passed') : L('failed')}</span></span>
            <span class="histWrong mut">${brGresaka ? brGresaka + ' ✗' : ''}</span>
            <span class="histArrow mut">›</span></button>`;
      });
      // učinak u jednom redu — istorija bez sabiranja u glavi
      const polozeno = S.sims.filter((x) => x.passed).length;
      const prosek = Math.round(S.sims.reduce((a, x) => a + x.score, 0) / S.sims.length);
      const ucinak = `<p class="mut napomena">${L('simUcinak').split('@1').join(polozeno).split('@2').join(S.sims.length).split('@3').join(prosek)}</p>`;
      sh.innerHTML = `<h3>${L('history')}</h3>${ucinak}<p class="mut napomena">${L('historyTip')}</p>` + redovi.slice(0, NOVIJIH).join('')
        + (redovi.length > NOVIJIH ? `<div><button type="button" class="pojBtn" id="btnHistOlder">${L('historyOlder').split('@1').join(redovi.length - NOVIJIH)}</button><div id="histOlder" style="display:none">${redovi.slice(NOVIJIH).join('')}</div></div>` : '');
      const bho = el('btnHistOlder'); if (bho) sklopivo(bho);
      sh.querySelectorAll('.histBtn').forEach((b) => b.addEventListener('click', () => renderSimReview(S.sims[+b.dataset.sim], false)));
    }

    // Milanova odluka (04.09.2026): „Zašto verovati" i „Česta pitanja" su se sadržajno preklapali
    // (isto pitanje imalo odgovor na dva mesta), pa su spojeni u jednu karticu — poreklo baze i
    // pouzdanost pa česta pitanja, jedno ispod drugog.
    { const tc = el('trustCard'); if (tc) { tc.innerHTML = ''; tc.style.display = 'none'; } }
    const fq = el('faqCard');
    fq.style.display = '';
    fq.innerHTML = `<div><button class="explCardBtn pojBtn istaknuto">${L('oVezbaonici')}</button>
      <div class="explCard" style="display:none">${L('trustBody').split('@1').join(fmtDatum(BAZA_PROVERENA))}
      ${(EX.cards && EX.cards.faq) ? `<h4 class="grupaNaslov">${escapeHtml(T(EX.cards.faq.t))}</h4>${T(EX.cards.faq.h)}` : ''}</div></div>`;
    sklopivo(fq.querySelector('.explCardBtn'));

    const gc = el('guideCard');
    // isti sklopivi obrazac kao pojmovnik, česta pitanja i poverenje — ranije je vodič jedini
    // imao posebno dugme „Prikaži", pa su tri susedne kartice imale tri različita otklapanja
    gc.innerHTML = `<div><button type="button" class="explCardBtn pojBtn istaknuto" id="btnGuide">${L('guideTitle')}</button>
      <div class="explCard" id="guideBody" style="${S.guide ? '' : 'display:none'}"><p class="mut napomena">${L('guideSub')}</p>${L('guideBody')}</div></div>`;
    sklopivo(el('btnGuide'));
    // otvoren/zatvoren vodič se pamti; sluša se POSLE sklopivo, pa čita stanje koje je ono postavilo
    el('btnGuide').addEventListener('click', () => { S.guide = el('btnGuide').getAttribute('aria-expanded') === 'true' ? 1 : 0; save(); });

    const pk = el('pojmovnikCard');
    const cardKeys = Object.keys(EX.cards || {}).filter((k) => k !== 'faq');
    if (!cardKeys.length) pk.style.display = 'none';
    else {
      pk.style.display = '';
      // Redosled kartica prati predloženi tok učenja iz vodiča (od pojmova ka posledicama)
      const GRUPE = [
        ['grp1', ['slicni-pojmovi', 'put-pojmovi', 'kategorije-vozila', 'brzine', 'vozac-zdravlje-alkohol']],
        ['grp2', ['prvenstvo-prolaza', 'policajac-znaci', 'znakovi-porodice', 'znakovi-opasnosti', 'znakovi-naredbi', 'znakovi-obavestenja', 'semafori', 'oznake-kolovoz', 'svetlosne-oznake']],
        ['grp3', ['kretanje-po-putu', 'skretanje', 'preticanje', 'parkiranje', 'parking-table', 'pokazivaci', 'svetla']],
        ['grp4', ['pesaci-bicikli', 'pruga', 'autoput', 'nezgoda', 'razno-pravila']],
        ['grp5', ['dozvole', 'vozilo-tehnika', 'uredjaji-oprema', 'iskljucenje', 'kazne', 'kaznene-klase', 'zamke-odgovori']],
      ];
      const stavljene = new Set();
      let html = '';
      // telo kartice se NE gradi unapred (33 kartice = oko 4.900 skrivenih elemenata pri
      // svakom crtanju početne); pravi se pri prvom otvaranju, ključ stoji u data-poj
      const entry = (k) => `<div class="pojEntry"><button class="explCardBtn pojBtn" data-poj="${escapeHtml(k)}">📖 ${escapeHtml(T(EX.cards[k].t))}</button><div class="explCard" style="display:none"></div></div>`;
      for (const [gk, keys] of GRUPE) {
        const imaju = keys.filter((k) => cardKeys.includes(k));
        if (!imaju.length) continue;
        html += `<h4 class="grupaNaslov">${escapeHtml(L(gk))}</h4>`;
        for (const k of imaju) { html += entry(k); stavljene.add(k); }
      }
      const ostatak = cardKeys.filter((k) => !stavljene.has(k));
      for (const k of ostatak) html += entry(k);
      // Ceo spisak je iza JEDNOG dugmeta i pravi se tek pri prvom otvaranju: pojmovnik je
      // priručnik koji se čita namerno, a ne nešto što stoji otvoreno na početnoj i jede
      // 1.919px od 4.743px koliko je početna nekad bila visoka.
      pk.innerHTML = `<button type="button" class="explCardBtn pojBtn istaknuto" id="btnPojmovnik">${L('pojmovnikDugme').split('@1').join(cardKeys.length)}</button>
        <div class="mut napomena">${L('pojmovnikPod')}</div>
        <div id="pojmovnikTelo" style="display:none"></div>`;
      sklopivo(el('btnPojmovnik'), null, el('pojmovnikTelo'), (cd) => {
        cd.innerHTML = html;
        // akordeon: otvaranje jedne kartice sklapa prethodno otvorenu
        cd.querySelectorAll('.explCardBtn').forEach((btn) => sklopivo(btn, cd, null, (c2) => { c2.innerHTML = T(EX.cards[btn.dataset.poj].h); }));
      });
    }

    // Četiri imenovane grupe umesto jednog reda nabacanih dugmadi. Podaci o bazi i prijava
    // greške su odavde preseljeni u podnožje — tamo ih ljudi i traže.
    // Podešavanja se sklapaju iza jednog dugmeta. Telo se pravi ODMAH (ne lenjo): sve
    // dugmad unutra vezuju se po id-u odmah posle crtanja, pa moraju da postoje u DOM-u.
    el('dataTools').innerHTML = `<button type="button" class="explCardBtn pojBtn" id="btnPodesavanja">${L('podesavanjaDugme')}</button>
      <div id="podesavanjaTelo" style="display:none">
      <div class="podGrupa">
        <h4 class="grupaNaslov">${L('grupaNapredak')}</h4>
        <div class="mut napomena">${L('persistNote')}</div>
        <div class="podDugmad">
          <span id="backupSlot" style="display:none"></span>
          <button type="button" class="secondary" id="btnExport">${L('export')}</button>
          <button type="button" class="secondary" id="btnImport">${L('import')}</button>
          <input type="file" id="fileImport" accept=".json" style="display:none">
        </div>
        <div id="backupLine" class="mut napomena razmakG"></div>
      </div>
      <div class="podGrupa">
        <h4 class="grupaNaslov">${L('grupaAplikacija')}</h4>
        <div class="podDugmad">
          <button type="button" class="secondary" id="btnInstall" style="display:none">${L('installBtn')}</button>
          <button type="button" class="secondary" id="btnCheckUpd">${L('updRepoCheck')}</button>
          <button type="button" class="secondary" id="btnTourReplay">${L('tourReplay')}</button>
        </div>
        <div class="slovaRed"><span class="mut">${L('slovaLbl')}:</span>
          <button type="button" class="secondary sBtn" id="btnFontMinus">A−</button>
          <span class="slovaVrednost" id="fsVrednost"></span>
          <button type="button" class="secondary sBtn" id="btnFontPlus">A+</button></div>
        <div id="installWhat" class="razmakG"><button type="button" class="explCardBtn pojBtn">${L('installWhatTitle')}</button><div class="explCard" style="display:none">${L('installWhatBody')}</div></div>
      </div>
      <div class="podGrupa" id="planGrupa">
        <h4 class="grupaNaslov">${L('planNaslov')}</h4>
        <div class="tekstSm"><label>${L('examDateLabel')}
          <input type="date" id="examDate" value="${S.examDate || ''}"></label></div>
        <div class="mut napomena">${L('planKratko')}
          <button type="button" class="pomocBtn" id="btnPlanPomoc" aria-label="${escapeHtml(L('planDetalji'))}" title="${escapeHtml(L('planDetalji'))}">?</button></div>
        <div class="mut napomena" id="planPomocTekst" style="display:none">${L('planObjasnjenje')}</div>
        <div class="podDugmad">
          <button type="button" class="secondary prekidac" id="btnPlanAuto" aria-pressed="${S.plan && S.plan.auto ? 'true' : 'false'}">${L('autoNaslov')}</button>
          <button type="button" class="secondary prekidac" id="btnPlanPrio" aria-pressed="${S.plan && S.plan.prio ? 'true' : 'false'}">${L('prioNaslov')}</button>
        </div>
        <div class="mut napomena">${L('autoOpis')}</div>
        <div class="mut napomena">${L('prioOpis')}</div>
        <div class="planPolja">
          <label class="planPolje"><span class="mut">${L('planNovih')}</span>
            <input id="planNovih" type="text" inputmode="numeric" autocomplete="off" value="${S.plan && S.plan.novih ? S.plan.novih : ''}"></label>
          <label class="planPolje"><span class="mut">${L('planPon')}</span>
            <input id="planPon" type="text" inputmode="numeric" autocomplete="off" value="${S.plan && S.plan.pon ? S.plan.pon : ''}"></label>
        </div>
        <div class="podDugmad">
          <button type="button" class="secondary" id="btnPlanSave">${L('planSacuvaj')}</button>
          <button type="button" class="secondary" id="btnPlanPredlog">${L('planPredlozi')}</button>
          ${S.plan ? `<button type="button" class="secondary" id="btnPlanOff">${L('planIskljuci')}</button>` : ''}
        </div>
        <div id="planPoruka" class="mut razmakG"></div>
      </div>
      <div class="podGrupa podOpasno">
        <h4 class="grupaNaslov">${L('grupaOprezno')}</h4>
        <div class="qActions"><button type="button" class="danger" id="btnReset">${L('reset')}</button></div>
        <div class="mut napomena">${L('resetNapomena')}</div>
      </div></div>`;
    sklopivo(el('btnPodesavanja'), null, el('podesavanjaTelo'));
    renderBackupLine();
    // Prekinuta rezerva u fajl je jedina stvar iz podešavanja koja NE sme da čeka da je neko
    // otvori: tada se kartica otvara sama, da crveni red ne završi ispod sklopljenog dugmeta.
    if (fsPending) { el('podesavanjaTelo').style.display = ''; el('btnPodesavanja').setAttribute('aria-expanded', 'true'); }
    { const bp = el('btnPlanPomoc'); if (bp) sklopivo(bp, null, el('planPomocTekst')); }
    applyFont();   // dugmad i procenat veličine slova žive u ovoj kartici — crtaju se sa njom
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
      const neodg = neodgovorenih();
      const kaziPosle = (t) => { const m = el('planPoruka'); if (m) m.textContent = t; };
      const prazno = (x) => String(x.value || '').trim() === '';
      if (!neodg) { pn.disabled = true; pn.value = ''; pn.placeholder = L('planSveOdgovoreno'); }
      [pn, pp].forEach((x) => x.addEventListener('input', () => { ocistiPoruku(x); kaziPosle(''); }));
      // Auto režim sam računa kvotu, pa polja za brojeve tada nemaju šta da kažu — ostaju
      // upisana za slučaj da se auto ugasi, ali se ne koriste.
      el('btnPlanAuto').addEventListener('click', () => {
        const bio = !!(S.plan && S.plan.auto);
        S.plan = { ...(S.plan || {}), auto: bio ? 0 : 1 };
        if (!S.plan.auto && !S.plan.novih && !S.plan.pon) S.plan = null;
        save(); renderHome();
        poruci(bio ? L('planUgasen') : L('autoNaslov'));
      });
      el('btnPlanPrio').addEventListener('click', () => {
        const bio = !!(S.plan && S.plan.prio);
        S.plan = { ...(S.plan || {}), prio: bio ? 0 : 1 };
        if (!S.plan.auto && !S.plan.novih && !S.plan.pon && !S.plan.prio) S.plan = null;
        save(); renderHome();
        poruci(bio ? L('planUgasen') : L('lostPrioUkljucen'));
      });
      el('btnPlanSave').addEventListener('click', () => {
        if (prazno(pn) && prazno(pp)) { S.plan = null; save(); renderHome(); kaziPosle(L('planUgasen')); return; }
        let novih = null, pon = null;
        if (!prazno(pn)) {
          novih = ceoBrojIzPolja(pn, 1, Math.max(1, neodg), L('planMaxNovih'));
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
        kaziPosle(dnevno > 150 ? L('planPuno').replace('#', nQ(dnevno)) : L('planSacuvan'));
      });
      el('btnPlanPredlog').addEventListener('click', () => {
        // poruka o datumu stoji UZ polje datuma (i fokusira ga) — ono je iznad dugmeta,
        // pa je „unesi datum ispod" slalo čoveka na pogrešnu stranu
        if (!S.examDate) { poruciUzPolje(el('examDate'), L('planBezDatuma')); return; }
        const dana = danaDoIspita();
        if (dana === null || dana < 1) { poruciUzPolje(el('examDate'), L('planDatumProsao')); return; }
        const { rezerva, novih, pon } = predlogTempa(dana, neodg);
        // predlog se ODMAH čuva kao cilj — ranije je samo punio polja, pa je osvežavanje
        // strane vraćalo stare brojeve i izgledalo kao da se ništa nije desilo
        S.plan = { novih, pon };
        save(); renderHome();
        const brNovih = novih === null ? 0 : novih;
        kaziPosle((rezerva > 0 ? L('planPredlogGotov').replace('#', rezerva + ' ' + (one(rezerva) ? L('examDaysOne') : L('examDays'))) : L('planPredlogUsko'))
          .split('@1').join(brNovih + ' ' + novihPitanja(brNovih)).split('@2').join(pon));
      });
      const off = el('btnPlanOff');
      if (off) off.addEventListener('click', () => { S.plan = null; save(); renderHome(); kaziPosle(L('planUgasen')); });
    }
    if (!S.tour && !window.__tourRan) {
      window.__tourRan = 1;
      setTimeout(() => { if (el('view-home').classList.contains('active')) tourStart(); }, 600);
    }
    el('btnExport').addEventListener('click', async (ev) => {
      const d = ev.currentTarget;
      if (d.disabled) return;
      d.disabled = true;
      try {
        const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
        // datum u imenu: dva izvoza u istoj fascikli se ne gaze i vidi se koji je noviji
        const ime = 'vozacki-a-napredak-' + localDay() + '.json';
        const sacuvano = await sacuvajFajl(blob, ime, [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]);
        if (sacuvano) poruci(L('porExport').split('@1').join(sacuvano));
      } finally { d.disabled = false; }
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
        else poruci(L('porUvoz'));
      };
      rd.readAsText(f);
    });
    el('btnReset').addEventListener('click', () => {
      if (confirm(L('resetConfirm'))) { S = normalizeState({ q: {}, script: S.script, theme: S.theme, fs: S.fs }); save(); renderHome(); poruci(L('porReset')); }
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
    simObrisi();       // napušten ispit se ne obnavlja pri sledećem pokretanju
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
  el('btnSimReport').addEventListener('click', () => { if (!sim) return; if (sim.showReport) renderSimQ(); else if (simSmeDalje()) renderSimReport(); });

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

  // Klik na sliku pitanja otvara je preko celog ekrana, u DVA koraka: prvo koliko god stane
  // (slike su 800px, a kartica pitanja na širokom ekranu 860px — zato se ranije ništa nije
  // menjalo osim pozadine), pa onda pravo uvećanje 2× uz pomeranje prstom ili mišem.
  document.addEventListener('click', (ev) => {
    // dugme (tastatura: Enter/razmak šalju klik na dugme) ili sama slika (miš)
    const meta = ev.target.closest && ev.target.closest('.qImgBtn, img.qImg');
    if (!meta) return;
    const slika = meta.tagName === 'IMG' ? meta : meta.querySelector('img.qImg');
    if (!slika) return;
    if (!slika.naturalWidth) return;                  // slika se nije učitala — nema šta da se uveća
    if (document.getElementById('imgZoom')) return;   // jedno uvećanje, ne gomila njih jedno preko drugog
    const vracaFokus = document.activeElement;
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
      z.remove(); gore.remove(); dole.remove();
      document.removeEventListener('keydown', naEscape);
      window.removeEventListener('hashchange', zatvori);
      if (vracaFokus && vracaFokus.focus) vracaFokus.focus({ preventScroll: true });
    };
    const naEscape = (e2) => { if (e2.key === 'Escape') { e2.preventDefault(); zatvori(); } };

    // ✕ zatvori (gore desno) i +/− uvećanje (dole na sredini) — oba su dugmad, ne veze
    const gore = document.createElement('div'); gore.className = 'zoomAlat gore';
    const bZatvori = document.createElement('button'); bZatvori.type = 'button';
    bZatvori.textContent = '✕ ' + L('close');
    gore.appendChild(bZatvori);
    const dole = document.createElement('div'); dole.className = 'zoomAlat dole';
    const bBlize = document.createElement('button'); bBlize.type = 'button';
    dole.appendChild(bBlize);

    const osveziAlat = () => {
      const blizu = z.classList.contains('blizu');
      bBlize.textContent = blizu ? '− ' + L('zoomManje') : '+ ' + L('zoomVise');
      bBlize.setAttribute('aria-pressed', blizu ? 'true' : 'false');
    };
    const prebaci = () => {
      const blizu = !z.classList.contains('blizu');
      z.classList.toggle('blizu', blizu);
      osveziAlat();
      // uvećano: kreni od sredine slike, da se ne gleda u ćošak
      if (blizu) { z.scrollLeft = (z.scrollWidth - z.clientWidth) / 2; z.scrollTop = (z.scrollHeight - z.clientHeight) / 2; }
    };
    osveziAlat();
    bZatvori.addEventListener('click', (e2) => { e2.stopPropagation(); zatvori(); });
    bBlize.addEventListener('click', (e2) => { e2.stopPropagation(); prebaci(); });
    im.addEventListener('click', (e2) => { e2.stopPropagation(); prebaci(); });   // dodir na sliku = bliže/dalje
    z.addEventListener('click', zatvori);                                        // klik pored slike = zatvori
    document.addEventListener('keydown', naEscape);
    window.addEventListener('hashchange', zatvori);
    document.body.append(z, gore, dole);
    // Na telefonu je slika u kartici već skoro preko cele širine, pa bi „koliko god stane" bilo
    // isto što i pre otvaranja — a to je i bila primedba („slika nije veća"). Zato se tu odmah
    // otvara drugi korak; na širokom ekranu prvi korak stvarno uvećava, pa ostaje.
    // Posle append-a: prebaci() računa pomeraj, a on na elementu van strane ne bi radio.
    {
      const dw = Math.max(0, window.innerWidth - 36), dh = Math.max(0, window.innerHeight - 36);
      const stane = Math.min(dw, dh * (slika.naturalWidth / slika.naturalHeight));
      if (stane < slika.getBoundingClientRect().width * 1.25) prebaci();
    }
    bZatvori.focus({ preventScroll: true });   // tastatura ulazi u uvećanje, ne ostaje iza njega
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
    // Dugmad se traže po ULOZI (data-uloga), ne po natpisu: natpis zavisi od pisma i od
    // toga da li je pitanje odgovoreno, pa je prečica ranije zavisila od teksta na dugmetu.
    if (e.key === 'ArrowRight') {
      const b = actionBtns.find((x) => x.dataset.uloga === 'dalje');
      if (b) { b.click(); e.preventDefault(); }
    } else if (e.key === 'ArrowLeft') {
      const b = actionBtns.find((x) => x.dataset.uloga === 'nazad');
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
  bindNav(el('donjaNav'));
  // „Preskoči na sadržaj" NE sme da menja adresu: hash '#glavni' ruter ne poznaje i vratio bi
  // korisnika sa Statistike na početnu. Veza samo prebacuje fokus i pogled na sadržaj.
  { const p = document.querySelector('.preskoci');
    if (p) p.addEventListener('click', (e) => { e.preventDefault(); const m = el('glavni'); if (!m) return; m.focus({ preventScroll: true }); m.scrollIntoView({ block: 'start' }); }); }
  el('btnScript').addEventListener('click', () => {
    S.script = S.script === 'l' ? 'c' : 'l'; save();
    applyScript();
    ponovniPrikaz = true;      // pitanje na ekranu zadržava redosled ponuda, izbor i dat odgovor
    try { current.redraw(); } finally { ponovniPrikaz = false; }   // ostani na istom ekranu, samo drugo pismo
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
    // dugmad su sada u podešavanjima — postoje samo dok je početna nacrtana
    const m = el('btnFontMinus'), p = el('btnFontPlus'), v = el('fsVrednost');
    if (!m || !p) return;
    const naDnu = f <= FS_MIN + 1e-6, naVrhu = f >= FS_MAX - 1e-6;
    m.disabled = naDnu; p.disabled = naVrhu;
    m.title = naDnu ? L('fsMin') : L('fsSmaller');
    p.title = naVrhu ? L('fsMax') : L('fsBigger');
    m.setAttribute('aria-label', m.title);
    p.setAttribute('aria-label', p.title);
    if (v) v.textContent = Math.round(f * 100) + '%';
  }
  window.matchMedia('(max-width: 560px)').addEventListener('change', applyFont);
  // delegirano: dugmad se iznova crtaju sa karticom podešavanja
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest && e.target.closest('#btnFontMinus, #btnFontPlus');
    if (!t || t.disabled) return;
    const smer = t.id === 'btnFontPlus' ? 1 : -1;
    S.fs = Math.min(FS_MAX, Math.max(FS_MIN, round2((S.fs || 1) + smer * FS_KORAK)));
    save(); applyFont();
  });
  function applyScript() {
    el('btnScript').innerHTML =
      `<span class="${S.script === 'c' ? 'segOn' : 'segOff'}">ЋИР</span><span class="segSep">|</span><span class="${S.script === 'l' ? 'segOn' : 'segOff'}">LAT</span>`;
    // čitač ekrana mora da zna KOJIM pismom je tekst — inače srpski čita kao da je latinica uvek
    document.documentElement.lang = S.script === 'c' ? 'sr-Cyrl' : 'sr-Latn';
    { const n = el('naslovStrane'); if (n) n.textContent = L('brand') + ' — ' + L('podnozjeOpis'); }
    { const p = document.querySelector('.preskoci'); if (p) p.textContent = L('preskoci'); }
    el('brandTitle').textContent = L('brand');
    el('topbar').querySelector('.brand').title = L('home');
    el('topbar').querySelector('.brand').setAttribute('aria-label', L('home'));
    el('btnTheme').title = L('temaLbl'); el('btnTheme').setAttribute('aria-label', L('temaLbl'));
    el('btnScript').title = L('pismoLbl'); el('btnScript').setAttribute('aria-label', L('pismoLbl'));
    el('dnHome').textContent = L('home');
    el('dnLearn').textContent = L('navPitanja');
    el('dnDrill').textContent = L('navPonavljanje');
    el('dnSim').textContent = L('navSim');
    el('dnStats').textContent = L('navStats');
    el('donjaNav').setAttribute('aria-label', L('navGlavna'));
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
      <div class="podnozjeRed mut">${L('podnozjeBaza').split('@1').join(Q.length).split('@2').join(fmtDatum(D.generated)).split('@3').join(fmtDatum(BAZA_PROVERENA)).split('@4').join(window.APP_V || 0)}</div>
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
    if (sim) return;   // usred ispita se traka ne pokazuje: klik na nju osvežava stranu i gasi ispit
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
      <div class="mut tekstSm">${escapeHtml(L('updRepoBody').replace('#A', BOOT_V).replace('#B', nova))}</div></div>
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
      if (rucno) poruci(L('porVerzijaOK').split('@1').join(BOOT_V));
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
    const ds = fmtDatum(d);
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
      // nema sistemskog deljenja (računar): sačuvaj sliku — sa pitanjem gde i pod kojim imenom
      const sacuvano = await sacuvajFajl(blob, 'vozacki-a-rezultat-' + localDay() + '.png',
        [{ description: 'PNG slika', accept: { 'image/png': ['.png'] } }]);
      if (sacuvano && dugme) { const staro = dugme.textContent; dugme.textContent = L('shareDone'); setTimeout(() => { dugme.textContent = staro; }, 2500); }
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
  // Ispit u toku ima prvenstvo nad adresom: ko je osvežio stranu usred ispita (ili mu je telefon
  // izbacio tab), vraća se u isti ispit sa vremenom koje je i dalje teklo.
  if (!simNastavi()) {
    try { routeTo(curHash); }
    catch (err) {
      console.warn('Adresa nije mogla da se otvori:', curHash, err);
      try { renderHome(); poruci(L('porGreskaAdrese')); } catch (e2) { /* errStrip će prikazati */ }
    }
  }
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
      sansaZaProlaz,
      spremnost,
      planStanje,
    };
  }
})();

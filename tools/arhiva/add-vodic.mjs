import fs from 'node:fs';
let a = fs.readFileSync('../app.js', 'utf8');
let h = fs.readFileSync('../index.html', 'utf8');
let c = fs.readFileSync('../style.css', 'utf8');
let fails = 0;
function rep(src, o, n, label) {
  const cnt = src.split(o).length - 1;
  if (cnt !== 1) { console.log('FAIL [' + label + '] count=' + cnt); fails++; return src; }
  console.log('ok  [' + label + ']');
  return src.split(o).join(n);
}

// mesto za vodič: odmah ispod tabele oblasti u desnoj koloni
h = rep(h, `    <div class="card" id="pojmovnikCard"></div>`,
`    <div class="card" id="guideCard"></div>
    <div class="card" id="pojmovnikCard"></div>`, 'html');

// tekstovi
a = rep(a, "tourReplay: { l: 'Vodič kroz aplikaciju', c: 'Водич кроз апликацију' },",
`tourReplay: { l: 'Vodič kroz aplikaciju', c: 'Водич кроз апликацију' },
    guideTitle: { l: '🎓 Kako da učiš — predloženi redosled', c: '🎓 Како да учиш — предложени редослед' },
    guideSub: { l: 'za one koji kreću iz početka; ako već imaš predznanje, slobodno preskoči', c: 'за оне који крећу из почетка; ако већ имаш предзнање, слободно прескочи' },
    guideOpen: { l: 'Prikaži', c: 'Прикажи' },
    guideHide: { l: 'Sakrij', c: 'Сакриј' },
    guideBody: { l: \`<ol class="guideList">
      <li><b>Prvo pojmovi, pa pravila.</b> U Pojmovniku pročitaj redom: <i>Slični pojmovi</i> (šta je preticanje a šta obilaženje, odstojanje vs rastojanje), <i>Put, kolovoz, trake</i> i <i>Kategorije vozila</i>. Bez tih reči ostalo gradivo zvuči kao strani jezik.</li>
      <li><b>Ko ide prvi.</b> Kartice <i>Prvenstvo prolaza</i>, <i>Semafori</i> i <i>Porodice saobraćajnih znakova</i> — to je srce ispita i najviše pitanja.</li>
      <li><b>Radnje vozilom.</b> <i>Skretanje i prestrojavanje</i>, <i>Preticanje i obilaženje</i>, <i>Zaustavljanje i parkiranje</i>, <i>Pokazivači pravca</i>, <i>Upotreba svetala</i>.</li>
      <li><b>Posebne situacije.</b> <i>Pešaci i dvotočkaši</i>, <i>Prelaz preko pruge</i>, <i>Autoput i motoput</i>, <i>Vozila pod pratnjom</i>, <i>Postupak kod nezgode</i>.</li>
      <li><b>Tek onda pitanja.</b> Kreni na <i>Sva pitanja</i> i idi redom — posle svakog odgovora pročitaj objašnjenje, i kad pogrešiš i kad pogodiš.</li>
      <li><b>Pusti aplikaciju da te vodi.</b> Pogrešna pitanja se sama vraćaju u <i>Ponovi pogrešna</i>: odmah, pa sutradan, pa za tri dana. Radi ih dok ne isprazniš red.</li>
      <li><b>Simulacije na kraju.</b> Kad u Statistici procena pređe prag, radi <i>Simulaciju ispita</i> — 41 pitanje, 45 minuta, kao pravi ispit. Posle svake pregledaj greške.</li>
    </ol>
    <p class="mut">Kaznene mere uči poslednje i bez učenja iznosa napamet — u zvaničnom ispitu za A kategoriju te oblasti nema.</p>\`,
      c: \`<ol class="guideList">
      <li><b>Прво појмови, па правила.</b> У Појмовнику прочитај редом: <i>Слични појмови</i> (шта је претицање а шта обилажење, одстојање vs растојање), <i>Пут, коловоз, траке</i> и <i>Категорије возила</i>. Без тих речи остало градиво звучи као страни језик.</li>
      <li><b>Ко иде први.</b> Картице <i>Првенство пролаза</i>, <i>Семафори</i> и <i>Породице саобраћајних знакова</i> — то је срце испита и највише питања.</li>
      <li><b>Радње возилом.</b> <i>Скретање и престројавање</i>, <i>Претицање и обилажење</i>, <i>Заустављање и паркирање</i>, <i>Показивачи правца</i>, <i>Употреба светала</i>.</li>
      <li><b>Посебне ситуације.</b> <i>Пешаци и двоточкаши</i>, <i>Прелаз преко пруге</i>, <i>Аутопут и мотопут</i>, <i>Возила под пратњом</i>, <i>Поступак код незгоде</i>.</li>
      <li><b>Тек онда питања.</b> Крени на <i>Сва питања</i> и иди редом — после сваког одговора прочитај објашњење, и кад погрешиш и кад погодиш.</li>
      <li><b>Пусти апликацију да те води.</b> Погрешна питања се сама враћају у <i>Понови погрешна</i>: одмах, па сутрадан, па за три дана. Ради их док не испразниш ред.</li>
      <li><b>Симулације на крају.</b> Кад у Статистици процена пређе праг, ради <i>Симулацију испита</i> — 41 питање, 45 минута, као прави испит. После сваке прегледај грешке.</li>
    </ol>
    <p class="mut">Казнене мере учи последње и без учења износа напамет — у званичном испиту за А категорију те области нема.\` },`, 'str');

// render + pamćenje stanja
a = rep(a, `    const pk = el('pojmovnikCard');`,
`    const gc = el('guideCard');
    gc.innerHTML = \`<div class="guideHead"><div><h3 style="margin:0">\${L('guideTitle')}</h3>
      <span class="mut" style="font-size:.82rem">\${L('guideSub')}</span></div>
      <button class="secondary" id="btnGuide">\${S.guide ? L('guideHide') : L('guideOpen')}</button></div>
      <div id="guideBody" style="\${S.guide ? '' : 'display:none'}">\${L('guideBody')}</div>\`;
    el('btnGuide').addEventListener('click', () => {
      S.guide = S.guide ? 0 : 1; save();
      el('guideBody').style.display = S.guide ? '' : 'none';
      el('btnGuide').textContent = S.guide ? L('guideHide') : L('guideOpen');
    });

    const pk = el('pojmovnikCard');`, 'render');

// stanje
a = rep(a, `      tour: obj.tour === 1 ? 1 : 0,`, `      tour: obj.tour === 1 ? 1 : 0,
      guide: obj.guide === 1 ? 1 : 0,`, 'state');

// stil
c += `
/* Vodič za učenje */
.guideHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.guideList { margin: 10px 0 0; padding-left: 22px; line-height: 1.5; }
.guideList li { margin-bottom: 8px; }
`;

if (fails) { console.log('NE PIŠEM'); process.exit(1); }
fs.writeFileSync('../app.js', a);
fs.writeFileSync('../index.html', h);
fs.writeFileSync('../style.css', c);
console.log('vodič ugrađen');

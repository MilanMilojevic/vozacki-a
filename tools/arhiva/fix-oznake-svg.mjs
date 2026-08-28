import fs from 'node:fs';
let s = fs.readFileSync('build-explanations.mjs', 'utf8');
const start = s.indexOf('<svg viewBox="0 0 470 148"');
const endMark = '<p style="margin-top:10px"><b>Poprečne i ostale oznake';
const end = s.indexOf(endMark);
if (start < 0 || end < 0 || end < start) { console.log('FAIL', start, end); process.exit(1); }
const svg = `<svg viewBox="0 0 470 312" role="img" style="max-width:470px;width:100%;display:block;margin:4px auto">
  <g font-size="10.5" text-anchor="middle" fill="#334">
    <rect x="10" y="4" width="96" height="112" fill="#9aa7b4"/><line x1="58" y1="8" x2="58" y2="112" stroke="#fff" stroke-width="3.5" stroke-dasharray="14 10"/>
    <text x="58" y="130">isprekidana</text><text x="58" y="142" fill="#667">sme preko</text>
    <rect x="126" y="4" width="96" height="112" fill="#9aa7b4"/><line x1="174" y1="6" x2="174" y2="114" stroke="#fff" stroke-width="3.5"/>
    <text x="174" y="130">neisprekidana</text><text x="174" y="142" fill="#667">ne sme preko</text>
    <rect x="242" y="4" width="96" height="112" fill="#9aa7b4"/><line x1="284" y1="6" x2="284" y2="114" stroke="#fff" stroke-width="3.5"/><line x1="296" y1="6" x2="296" y2="114" stroke="#fff" stroke-width="3.5"/>
    <text x="290" y="130">udvojena neisprekidana</text><text x="290" y="142" fill="#667">ne sme niko</text>
    <rect x="358" y="4" width="96" height="112" fill="#9aa7b4"/><line x1="400" y1="8" x2="400" y2="112" stroke="#fff" stroke-width="3.5" stroke-dasharray="14 10"/><line x1="412" y1="8" x2="412" y2="112" stroke="#fff" stroke-width="3.5" stroke-dasharray="14 10"/>
    <text x="406" y="130">udvojena isprekidana</text><text x="406" y="142" fill="#667">izmenljiv smer</text>
    <rect x="10" y="160" width="96" height="112" fill="#9aa7b4"/><line x1="52" y1="162" x2="52" y2="270" stroke="#fff" stroke-width="3.5"/><line x1="64" y1="164" x2="64" y2="268" stroke="#fff" stroke-width="3.5" stroke-dasharray="14 10"/>
    <text x="58" y="286">kombinovana</text><text x="58" y="298" fill="#667">važi linija bliža tebi</text>
    <rect x="126" y="160" width="96" height="112" fill="#9aa7b4"/><line x1="174" y1="162" x2="174" y2="270" stroke="#fff" stroke-width="3.5" stroke-dasharray="24 6"/>
    <text x="174" y="286">linija upozorenja</text><text x="174" y="298" fill="#667">najava pune linije</text>
    <rect x="242" y="160" width="96" height="112" fill="#9aa7b4"/><line x1="252" y1="162" x2="252" y2="270" stroke="#fff" stroke-width="3.5"/><line x1="290" y1="164" x2="290" y2="268" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>
    <text x="290" y="286">ivična linija</text><text x="290" y="298" fill="#667">označava ivicu kolovoza</text>
    <rect x="358" y="160" width="96" height="112" fill="#9aa7b4"/><line x1="400" y1="162" x2="400" y2="216" stroke="#fff" stroke-width="3.5" stroke-dasharray="14 10"/><line x1="400" y1="222" x2="400" y2="270" stroke="#fff" stroke-width="3.5"/><line x1="412" y1="162" x2="412" y2="216" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 5"/>
    <text x="406" y="286">linija vodilja</text><text x="406" y="298" fill="#667">kratka isprekidana, kroz raskrsnicu</text>
  </g>
</svg>
`;
s = s.slice(0, start) + svg + s.slice(end);
fs.writeFileSync('build-explanations.mjs', s);
console.log('uzdužni panel prelomljen u 2 reda (8 uzoraka)');

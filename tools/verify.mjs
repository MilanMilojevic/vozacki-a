// Jedna komanda za lokalne/CI provere. Ne generiše podatke, ne menja verziju,
// ne otvara Chrome i ne preuzima bazu sa portala. Browser provere su zasebne.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const core = ['style.css', 'version.js', 'data.js', 'explanations.js', 'app.js'];

function run(args, label) {
  console.log('\n' + label);
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true, timeout: 300000 });
  if (result.error || result.signal || result.status !== 0) throw Error(label + ' nije prošla.');
}

try {
  if (Number(process.versions.node.split('.')[0]) < 22) throw Error('Potreban je Node.js 22 ili noviji.');
  const version = fs.readFileSync(path.join(root, 'version.js'), 'utf8').match(/^\s*self\.APP_V\s*=\s*(0|[1-9]\d*)\s*;\s*$/);
  if (!version || !Number.isSafeInteger(Number(version[1]))) throw Error('Neispravan broj izdanja.');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const marked = [...html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)].map(m => m[2]).filter(url => url.includes('?v='));
  if (marked.length !== core.length || core.some(file => !marked.includes(`${file}?v=${version[1]}`))) {
    throw Error('HTML mora učitati svih pet resursa sa tačnim brojem izdanja.');
  }
  for (const file of [...core, 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'sw.js']) {
    const stat = fs.statSync(path.join(root, file));
    if (!stat.isFile() || !stat.size) throw Error('Nedostaje javni resurs: ' + file);
  }
  JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  console.log(`Izdanje v${version[1]}: javni resursi i oznake se slažu.`);

  // Samo aktivni alati: arhivirane jednokratne zakrpe nisu deo postupka razvoja.
  const scripts = ['app.js', 'data.js', 'explanations.js', 'version.js', 'sw.js', 'serve.mjs'];
  for (const directory of ['tools', 'tools/tests', 'tools/fixtures']) {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      if (entry.isFile() && /\.(?:mjs|js)$/.test(entry.name)) scripts.push(directory + '/' + entry.name);
    }
  }
  for (const file of scripts.sort()) {
    const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000 });
    if (result.error || result.signal || result.status !== 0) {
      process.stderr.write(result.stderr || 'Provera sintakse nije završena.\n');
      throw Error('Neispravna sintaksa: ' + file);
    }
  }
  console.log(`Sintaksa: ${scripts.length} aktivnih skripti.`);
  const tests = fs.readdirSync(path.join(root, 'tools/tests')).filter(name => name.endsWith('.test.mjs')).sort();
  for (const required of ['scoring-harness-safety.test.mjs', 'storage-recovery.test.mjs', 'content-audit.test.mjs', 'service-worker.test.mjs']) {
    if (!tests.includes(required)) throw Error('Nedostaje obavezna provera: ' + required);
  }
  run(['--test', ...tests.map(file => 'tools/tests/' + file)], 'Node provere');
  run(['tools/audit-content.mjs', '--check'], 'Aktuelnost evidencije sadržaja');
  console.log('\nLOKALNE PROVERE PROŠLE. Browser tokovi i semantička revizija imaju zasebne rezultate.');
} catch (error) {
  console.error('FAIL: ' + error.message);
  process.exitCode = 1;
}

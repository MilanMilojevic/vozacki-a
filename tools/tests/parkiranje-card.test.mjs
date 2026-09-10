// Format and bank-consistency regressions, not an automated legal review.
import fs from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseAssignment} from '../audit-content.mjs';

const read = name => fs.readFileSync(new URL('../../' + name, import.meta.url), 'utf8');
const explain = parseAssignment(read('explanations.js'), 'EXPLAIN');
const quiz = parseAssignment(read('data.js'), 'QUIZ');
const card = explain.cards.parkiranje.h;
const diagrams = script => [...card[script].matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(m => m[0]);

test('Middle-of-carriageway parking shows the sign required by its explanation in both scripts', () => {
  for (const script of ['l', 'c']) {
    const drawing = diagrams(script).find(svg => /aria-label="[^"]*(?:plavim znakom za parkiranje|плавим знаком за паркирање)/.test(svg));
    assert.ok(drawing, 'Diagram with an accessible description of the parking sign');
    assert.match(drawing, /<text\b[^>]*>P<\/text>/, 'The visible sign uses a Latin P in either script');
  }
});

test('Cyrillic diagram descriptions are localized while official sign identifiers retain Roman numerals', () => {
  assert.ok(diagrams('c').length > 0);
  for (const svg of diagrams('c')) {
    const label = svg.match(/aria-label="([^"]*)"/)?.[1];
    assert.ok(label && /[А-Яа-я]/.test(label), 'A Cyrillic accessible description');
    assert.doesNotMatch(label.replace(/\b(?:P|m)\b/g, ''), /[A-Za-z]/);
  }
  for (const script of ['l', 'c']) {
    for (const id of ['II-3', 'II-41.1']) assert.ok(card[script].includes(id), script + '/' + id);
    assert.doesNotMatch(card[script], /ИИ-(?:3|41\.1)/);
  }
});

test('The distractor chart is explicitly limited to this question bank and its counts agree with actual answer keys', () => {
  const questions = quiz.questions.filter(q => q.sub === 140);
  assert.equal(questions.length, 27);
  const patterns = [
    /^(dozvoljeno je zaustavljanje, a nije dozvoljeno parkiranje|sme da zaustavi, a ne sme da parkira)/i,
    /1,60\s*m/i, /manjoj od 10\s*m/i,
    /^samo na (pešačkom prelazu|raskrsnici|prelazu biciklističke|prelazu puta)/i,
    /auto\s*taksi/i, /sigurnosnim? trougl|sigurnosni trougao|sve pokazivače pravca/i,
    /^samo na biciklističkoj (stazi|traci)/i, /najduže do 3 minuta/i,
  ];
  const counts = patterns.map(re => questions.filter(q => q.ch.some(c => re.test(c.t.l))).length);
  assert.ok(counts.every(n => n > 0), 'Every plotted group has matching questions');
  for (const re of patterns) for (const q of questions) for (const c of q.ch) {
    if (re.test(c.t.l)) assert.equal(c.ok, 0, `A plotted distractor is actually correct: ${q.id}/${c.id}`);
  }
  for (const script of ['l', 'c']) {
    const graph = diagrams(script).find(svg => /aria-label="[^"]*27[^"]*"/.test(svg));
    assert.ok(graph, 'The chart accessible name states the 27-question scope');
    const plotted = [...graph.matchAll(/<text\b[^>]*>(\d+)<\/text>/g)].map(m => Number(m[1]));
    assert.deepEqual(plotted, counts);
  }
});

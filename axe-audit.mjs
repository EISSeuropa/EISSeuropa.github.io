import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

const SITE = '_site';
const pages = process.argv.slice(2);
const results = [];

for (const rel of pages) {
  const file = path.join(SITE, rel);
  if (!fs.existsSync(file)) { console.log(`SKIP (missing) ${rel}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  for (const theme of ['light', 'dark']) {
    const dom = new JSDOM(html, { url: 'https://eiss-europa.com/' + rel, pretendToBeVisual: true, runScripts: 'outside-only' });
    const { window } = dom;
    window.document.documentElement.setAttribute('data-theme', theme);
    // axe needs these; jsdom lacks them
    window.matchMedia = window.matchMedia || (() => ({ matches: theme === 'dark', addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
    const axeSource = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
    window.eval(axeSource);
    if (!window.axe) { console.log(`ERROR ${theme} ${rel}: axe did not attach`); window.close(); continue; }
    try {
      const r = await window.axe.run(window.document, {
        runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] },
        resultTypes: ['violations'],
      });
      for (const v of r.violations) {
        results.push({ page: rel, theme, id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: (n.failureSummary||'').split('\n').slice(0,3).join(' | '), html: (n.html||'').slice(0,180) })) });
      }
      console.log(`${r.violations.length === 0 ? 'PASS' : 'FAIL'}  ${theme.padEnd(5)}  ${rel}  (${r.violations.length} violation types)`);
    } catch (e) {
      console.log(`ERROR ${theme} ${rel}: ${e.message}`);
    }
    window.close();
  }
}
fs.writeFileSync('/tmp/axe-results.json', JSON.stringify(results, null, 1));
console.log('\n=== violations ===');
if (!results.length) console.log('none');
for (const r of results) console.log(`${r.impact}\t${r.id}\t${r.n} node(s)\t${r.page} [${r.theme}]\t${r.help}`);

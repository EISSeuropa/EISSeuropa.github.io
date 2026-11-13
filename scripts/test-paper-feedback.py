#!/usr/bin/env python3
"""Author correction routes (#1863). Run after npm run build, from the repo root."""
import json
from pathlib import Path
import subprocess
import unittest
from html.parser import HTMLParser
from urllib.parse import parse_qs, urlsplit


class Links(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.links, self.row, self.link = [], None, None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'li' and 'data-paper-entry' in attrs:
            self.row = attrs['id']
        if tag == 'a':
            self.link = dict(attrs, row=self.row, text='')

    def handle_data(self, text):
        if self.link is not None:
            self.link['text'] += text

    def handle_endtag(self, tag):
        if tag == 'a' and self.link is not None:
            self.links.append(self.link)
            self.link = None
        if tag == 'li':
            self.row = None


class PaperFeedback(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Render the real shared macro with synthetic edge cases, alongside
        # the actual corpus. Nunjucks is already an Eleventy dependency.
        cls.data = json.loads(subprocess.check_output(['node', '-e', r'''
const nj = require('nunjucks');
const env = nj.configure('src/_includes', { autoescape: true });
const i18n = require('./src/_data/i18n.js');
const site = require('./src/_data/site.js');
const papers = require('./src/_data/paperIndex.js').papers;
const pages = require('./src/_data/paperPages.js')();
const fixture = { title: 'L’étude & "peace"? #1 <script> + 100% / O\'Brien',
  year: 2017, slug: '2017-fixture', abstractEligible: true, abstract: null };
const fixtures = ['en', 'fr', 'de'].flatMap(lang =>
  [fixture, { ...fixture, abstract: 'Already on file' },
   ...['keynote', 'roundtable', 'poster', 'workshop'].map(title =>
     ({ ...fixture, title, abstractEligible: false }))].map(p => ({
    lang, p, html: env.renderString(
      '{% from "paper-feedback.njk" import paperFeedback %}{{ paperFeedback(p, site, labels) }}',
      { p, site: { ...site, contactEmail: 'review@example.org' }, labels: i18n[lang].paperFeedback })
  })));
console.log(JSON.stringify({ site, papers, pages, fixtures,
  labels: Object.fromEntries(['en', 'fr', 'de'].map(l => [l, i18n[l].paperFeedback])) }));
'''], text=True))

    def check_link(self, link, paper, lang, recipient):
        url = urlsplit(link['href'])
        self.assertEqual((url.scheme, url.path, url.fragment), ('mailto', recipient, ''))
        self.assertNotRegex(link['href'], r'[\s<>"\']')
        query = parse_qs(url.query, strict_parsing=True)
        self.assertEqual(set(query), {'subject', 'body'})
        self.assertIn(str(paper['year']), query['subject'][0])
        self.assertIn(paper['slug'], query['subject'][0])
        body = query['body'][0]
        for context in (f"Title: {paper['title']}", f"Year: {paper['year']}",
                        f"Reference: {paper['slug']}",
                        f"{self.data['site']['url']}/anthology.html?view=papers&paper={paper['slug']}"):
            self.assertIn(context, body)
        self.assertNotIn('\n', body.replace('\r\n', ''))
        self.assertIn('%0D%0A', link['href'])
        labels = self.data['labels'][lang]
        invite = paper['abstractEligible'] and not paper['abstract']
        action = labels['correctionOrAbstract' if invite else 'correction']
        self.assertEqual(link['text'].strip(), action)
        self.assertEqual(link['aria-label'], f"{action}: {paper['title']}")
        self.assertNotIn('target', link)
        self.assertEqual(labels['abstractRequest'] in body, invite)
        self.assertIn(labels['request'], body)

    def test_encoding_and_eligibility_in_each_locale(self):
        for fixture in self.data['fixtures']:
            with self.subTest(lang=fixture['lang'], paper=fixture['p']):
                links = Links(fixture['html']).links
                self.assertEqual(len(links), 1)
                self.assertNotIn('<script>', fixture['html'])
                self.check_link(links[0], fixture['p'], fixture['lang'], 'review@example.org')

    def test_every_index_record_has_a_route_in_each_locale(self):
        title_only = [p for p in self.data['papers'] if not p['hasPage']]
        self.assertTrue(any(p['abstractEligible'] for p in title_only))
        for lang in ('en', 'fr', 'de'):
            html = Path(f'_site/fragments/anthology-papers.{lang}.html').read_text()
            links = Links(html).links
            routes = [a for a in links if '?subject=Anthology' in a.get('href', '')]
            self.assertEqual(len(routes), len(self.data['papers']))
            by_row = {a['row']: a for a in routes}
            for p in self.data['papers']:
                with self.subTest(lang=lang, slug=p['slug']):
                    self.check_link(by_row[f"paper-{p['slug']}"], p, lang, self.data['site']['contactEmail'])
            self.assertIn(self.data['site']['contactEmail'], html)

    def test_existing_pages_and_no_thin_pages(self):
        expected = {p['slug'] for p in self.data['papers'] if p['hasPage']}
        actual = {p.stem for p in Path('_site/papers').glob('*.html')}
        self.assertEqual(actual, expected)
        self.assertEqual({p['slug'] for p in self.data['pages']}, expected)
        for p in self.data['pages']:
            with self.subTest(slug=p['slug']):
                html = Path(f"_site/papers/{p['slug']}.html").read_text()
                routes = [a for a in Links(html).links if '?subject=Anthology' in a.get('href', '')]
                self.assertEqual(len(routes), 1)
                self.check_link(routes[0], p, 'en', self.data['site']['contactEmail'])


if __name__ == '__main__':
    unittest.main()

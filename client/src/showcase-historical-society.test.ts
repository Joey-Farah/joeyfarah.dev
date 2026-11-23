import { readFileSync } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// The Historical Society's wow moment is a walking tour on the visitor's phone:
// a map of the town, a walker that moves from stop to stop, and the story of each stop.

const html = readFileSync(path.resolve(__dirname, '../public/showcase/historical-society/index.html'), 'utf8');
const open = (query = '') =>
  new JSDOM(html, { url: `http://localhost/showcase/historical-society/${query}`, runScripts: 'dangerously', pretendToBeVisual: true }).window.document;
const card = (doc: Document) => doc.getElementById('stop-card')!.textContent!.replace(/\s+/g, ' ');
const primary = (doc: Document) => doc.getElementById('tour-next') as HTMLButtonElement;

describe('Historical Society: walking tour', () => {
  it('starts with an overview, and "Start the tour" opens stop 1 of 6 with its story', () => {
    const doc = open();
    expect(card(doc)).toMatch(/six stops/i);
    expect(primary(doc).textContent).toMatch(/start the tour/i);
    primary(doc).click();
    expect(card(doc)).toMatch(/Stop 1 of 6/);
    expect(card(doc)).toMatch(/The Falls/);
    expect(doc.querySelector('.pin[aria-current="step"]')?.getAttribute('aria-label')).toMatch(/^Stop 1: The Falls/);
  });
});

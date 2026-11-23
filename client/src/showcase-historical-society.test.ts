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

  it('"Next stop" walks to the next stop, says how far the one after is, and keeps focus on the button', () => {
    const doc = open();
    primary(doc).click();
    expect(card(doc)).toMatch(/Next: The Granite Mill, 4 min walk/);
    primary(doc).focus();
    primary(doc).click();
    expect(card(doc)).toMatch(/Stop 2 of 6/);
    expect(card(doc)).toMatch(/The Granite Mill/);
    expect(card(doc)).toMatch(/Next: The Depot, 6 min walk/);
    expect(primary(doc).textContent).toMatch(/next stop/i);
    expect(doc.activeElement).toBe(primary(doc));
    expect(doc.getElementById('walker')!.dataset.stop).toBe('2');
  });

  it('tapping a stop on the map goes straight to it, and marks the stops already passed', () => {
    const doc = open();
    const pins = () => [...doc.querySelectorAll<HTMLButtonElement>('.pin')];
    pins()[3].click();
    expect(card(doc)).toMatch(/Stop 4 of 6/);
    expect(card(doc)).toMatch(/Main Street/);
    expect(pins()[3].getAttribute('aria-current')).toBe('step');
    expect(pins().map((p) => p.classList.contains('visited'))).toEqual([true, true, true, false, false, false]);
    expect(doc.getElementById('walker')!.dataset.stop).toBe('4');
  });
});

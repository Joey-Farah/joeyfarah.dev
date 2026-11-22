import { readFileSync } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Ember & Oat's main interactive moment: drag the sun through the day and the
// menu follows it (morning, midday, evening, closed). The page opens at the
// visitor's local time, or at ?at=HH:MM when a link asks for one.

const html = readFileSync(path.resolve(__dirname, '../public/showcase/ember-and-oat/index.html'), 'utf8');

function open({ query = '', now }: { query?: string; now?: Date } = {}) {
  const dom = new JSDOM(html, {
    url: `http://localhost/showcase/ember-and-oat/${query}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(w) {
      if (!now) return;
      const RealDate = w.Date;
      class FixedDate extends RealDate {
        constructor(...args: ConstructorParameters<DateConstructor> | []) {
          if (args.length) super(...(args as ConstructorParameters<DateConstructor>));
          else super(now.getTime());
        }
        static now() { return now!.getTime(); }
      }
      w.Date = FixedDate as DateConstructor;
    },
  });
  return dom.window.document;
}

const menuTitle = (doc: Document) => doc.getElementById('menu-title')?.textContent ?? '';
const menuText = (doc: Document) => doc.getElementById('menu')?.textContent ?? '';

function dragTo(doc: Document, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const clock = doc.querySelector<HTMLInputElement>('input[type="range"]')!;
  clock.value = String(h * 60 + m);
  clock.dispatchEvent(new doc.defaultView!.Event('input', { bubbles: true }));
}

describe('Ember & Oat: the menu follows the time of day', () => {
  it.each([
    ['07:00', /morning/i, 'Maple oat bowl'],
    ['10:55', /morning/i, 'Cardamom bun'],
    ['11:00', /midday/i, 'Wild rice soup'],
    ['15:55', /midday/i, 'Smoked trout toast'],
    ['16:00', /evening/i, 'Sweet corn & honey pizza'],
    ['20:55', /evening/i, 'Oat & rhubarb crisp'],
  ])('at %s it serves the right menu', (at, title, dish) => {
    const doc = open({ query: `?at=${at}` });
    expect(menuTitle(doc)).toMatch(title);
    expect(menuText(doc)).toContain(dish);
  });

  it.each(['06:30', '21:00', '22:00'])('at %s it says the café is closed and offers the morning menu to order ahead', (at) => {
    const doc = open({ query: `?at=${at}` });
    expect(menuTitle(doc)).toMatch(/closed/i);
    expect(menuText(doc)).toContain('Maple oat bowl');
  });

  it('dragging the sun switches the menu', () => {
    const doc = open({ query: '?at=09:00' });
    dragTo(doc, '13:00');
    expect(menuTitle(doc)).toMatch(/midday/i);
    dragTo(doc, '18:30');
    expect(menuTitle(doc)).toMatch(/evening/i);
    expect(doc.getElementById('greeting')?.textContent).toMatch(/evening/i);
  });

  it('describes the time and menu to screen readers', () => {
    const doc = open({ query: '?at=07:40' });
    const clock = doc.querySelector('input[type="range"]')!;
    expect(clock.getAttribute('aria-valuetext')).toBe('7:40 am, morning menu');
  });

  it("opens at the visitor's local time", () => {
    const doc = open({ now: new Date(2026, 10, 22, 13, 5) });
    expect(menuTitle(doc)).toMatch(/midday/i);
    expect(doc.querySelector<HTMLInputElement>('input[type="range"]')!.value).toBe(String(13 * 60 + 5));
  });

  it('lands on the closed night scene for a visitor after 10 pm', () => {
    const doc = open({ now: new Date(2026, 10, 22, 23, 30) });
    expect(menuTitle(doc)).toMatch(/closed/i);
  });
});

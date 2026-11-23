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

  it('rounds the start time down, so a visitor at 10:58 still gets the morning menu', () => {
    const doc = open({ now: new Date(2026, 10, 22, 10, 58) });
    expect(menuTitle(doc)).toMatch(/morning/i);
    expect(doc.querySelector<HTMLInputElement>('input[type="range"]')!.value).toBe(String(10 * 60 + 55));
  });

  it('lands on the closed night scene for a visitor after 10 pm', () => {
    const doc = open({ now: new Date(2026, 10, 22, 23, 30) });
    expect(menuTitle(doc)).toMatch(/closed/i);
  });
});

describe('Ember & Oat: order ahead for pickup', () => {
  function openBagWithOneItem(at: string) {
    const doc = open({ query: `?at=${at}` });
    doc.querySelector<HTMLButtonElement>('#menu .add')!.click();
    doc.getElementById('bag-btn')!.click();
    const slots = [...doc.querySelectorAll<HTMLButtonElement>('#slots button')];
    return { doc, slots, label: doc.getElementById('pickup-label')?.textContent ?? '' };
  }

  it('offers pickup times starting 15 minutes after the time on the clock', () => {
    const { slots, label } = openBagWithOneItem('07:40');
    expect(slots.map((s) => s.textContent)).toEqual(['7:55 am', '8:10 am', '8:25 am', '8:40 am']);
    expect(label).toMatch(/today/i);
  });

  it('stops offering times once the café closes', () => {
    const { slots } = openBagWithOneItem('20:30');
    expect(slots.map((s) => s.textContent)).toEqual(['8:45 pm']);
  });

  it.each([['22:00', /tomorrow/i], ['20:50', /tomorrow/i], ['06:30', /today/i]])(
    'at %s (closed) it offers the 7:00 am opening',
    (at, day) => {
      const { slots, label } = openBagWithOneItem(at);
      expect(slots[0]?.textContent).toBe('7:00 am');
      expect(label).toMatch(day);
    },
  );

  it('orders for the pickup time on screen, even if the clock moved while the bag was open', () => {
    const { doc, slots } = openBagWithOneItem('07:40');
    slots[1].click();
    dragTo(doc, '20:50');
    doc.getElementById('place')!.click();
    const notice = doc.querySelector('[data-demo-notice]')!.textContent;
    expect(notice).toContain('pickup at 8:10 am');
    expect(notice).not.toMatch(/tomorrow/);
  });

  it('makes the page behind the bag inert while the bag is open, so Tab stays inside it', () => {
    const { doc } = openBagWithOneItem('07:40');
    const behind = ['[data-concept-banner]', 'header.nav', 'main', 'footer.site'].map((sel) => doc.querySelector(sel)!);
    expect(behind.map((el) => el.hasAttribute('inert'))).toEqual([true, true, true, true]);
    expect(doc.getElementById('bag')!.hasAttribute('inert')).toBe(false);
    doc.getElementById('bag-close')!.click();
    expect(behind.some((el) => el.hasAttribute('inert'))).toBe(false);
  });

  it('hides the subtotal while the bag is empty', () => {
    const doc = open({ query: '?at=07:40' });
    doc.getElementById('bag-btn')!.click();
    expect(doc.defaultView!.getComputedStyle(doc.getElementById('bag-total-row')!).display).toBe('none');
  });

  it('keeps keyboard focus on the quantity buttons as the bag redraws', () => {
    const { doc } = openBagWithOneItem('07:40');
    const btn = (label: RegExp) => [...doc.querySelectorAll<HTMLButtonElement>('#bag-lines button')].find((b) => label.test(b.getAttribute('aria-label')!))!;
    btn(/one more/i).focus();
    btn(/one more/i).click();
    expect(doc.activeElement?.getAttribute('aria-label')).toMatch(/one more/i);
    btn(/one fewer/i).click();
    expect(doc.activeElement?.getAttribute('aria-label')).toMatch(/one fewer/i);
    btn(/one fewer/i).click(); // the line is gone now
    expect(doc.activeElement?.id).toBe('bag-close');
  });

  it('places the order for the pickup time you pick', () => {
    const { doc, slots } = openBagWithOneItem('07:40');
    slots[1].click();
    expect(slots[1].getAttribute('aria-checked')).toBe('true');
    doc.getElementById('place')!.click();
    const notice = doc.querySelector('[data-demo-notice]')!.textContent;
    expect(notice).toContain('pickup at 8:10 am');
    expect(notice).toMatch(/this is a demo/i);
  });
});

describe('Ember & Oat: the scene', () => {
  const clockOf = (doc: Document) => doc.querySelector<HTMLInputElement>('input[type="range"]')!.value;
  const pointer = (doc: Document, type: string, clientX: number, buttons: number) =>
    doc.getElementById('scene')!.dispatchEvent(new doc.defaultView!.MouseEvent(type, { clientX, clientY: 100, buttons, bubbles: true }));

  it('moves the sun when you drag sideways across the scene', () => {
    const doc = open({ query: '?at=07:40' });
    pointer(doc, 'pointerdown', 100, 1);
    pointer(doc, 'pointermove', 700, 1);
    expect(clockOf(doc)).not.toBe(String(7 * 60 + 40));
  });

  it("doesn't keep moving the sun on hover after a drag that ended outside the scene", () => {
    const doc = open({ query: '?at=07:40' });
    pointer(doc, 'pointerdown', 100, 1);
    pointer(doc, 'pointermove', 700, 0); // button already released somewhere else
    expect(clockOf(doc)).toBe(String(7 * 60 + 40));
  });

  it('lights the sidewalk outside the window at night', () => {
    const spill = open({ query: '?at=20:30' }).getElementById('spill')!;
    expect(spill.tagName).toBe('path');
    expect(Number(spill.getAttribute('opacity'))).toBeGreaterThan(0);
  });
});

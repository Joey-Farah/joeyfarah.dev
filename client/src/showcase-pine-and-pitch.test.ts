import { readFileSync } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Pine & Pitch's class schedule redraws on every pick; keyboard users must not lose their place.

const html = readFileSync(path.resolve(__dirname, '../public/showcase/pine-and-pitch/index.html'), 'utf8');
const open = () =>
  new JSDOM(html, { url: 'http://localhost/showcase/pine-and-pitch/', runScripts: 'dangerously', pretendToBeVisual: true }).window.document;

describe('Pine & Pitch: class schedule', () => {
  it('keeps focus on the day you picked', () => {
    const doc = open();
    const day = doc.querySelectorAll<HTMLButtonElement>('#days button')[2];
    day.focus();
    day.click();
    const now = doc.querySelectorAll<HTMLButtonElement>('#days button')[2];
    expect(now.getAttribute('aria-selected')).toBe('true');
    expect(doc.activeElement).toBe(now);
  });

  it('keeps focus on the class you just booked', () => {
    const doc = open();
    const books = () => [...doc.querySelectorAll<HTMLButtonElement>('#class-list .book')];
    const i = books().findIndex((b) => !b.disabled);
    books()[i].focus();
    books()[i].click();
    expect(doc.activeElement).toBe(books()[i]);
    expect(books()[i].textContent).toMatch(/you're in/i);
  });
});

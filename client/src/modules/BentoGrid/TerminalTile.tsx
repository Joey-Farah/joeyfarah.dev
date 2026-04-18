import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const POOL = [
  { tag: 'falco', text: 'Laser height is everything. Low lasers clip jump animations; high lasers stuff recoveries.' },
  { tag: 'falco', text: 'Dair has 2 active frames of spike. You have more time than you think.' },
  { tag: 'falco', text: 'Multishine is 7 frames — same as a single shine. Practice shine → jump → shine until it\'s one motion.' },
  { tag: 'falco', text: 'Your nair is the best aerial in the game for neutral. Stop sleeping on it.' },
  { tag: 'falco', text: 'Pillaring is cool but shine OOS is what wins scrambles.' },
  { tag: 'falco', text: 'CC low percent and wait for them to adapt — then abandon it before they do.' },
  { tag: 'falco', text: 'Side-B is a real option. People never respect it until they absolutely should.' },
  { tag: 'falco', text: 'Your illusion is a recovery tool, not a mixup. Mix it up anyway.' },
  { tag: 'book', text: '"Ego is the Enemy" — read it before your next big thing. Seriously.' },
  { tag: 'book', text: 'Dune is the greatest world-building ever put to paper. Just start it.' },
  { tag: 'book', text: '"The Will to Keep Winning" by Daigo Umehara. Required reading if you compete in anything.' },
  { tag: 'book', text: 'Meditations is a field guide for the mind. Marcus Aurelius would\'ve been a top player.' },
  { tag: 'book', text: '"The Obstacle is the Way" — the title is the lesson. Everything else is elaboration.' },
  { tag: 'oracle', text: 'When BIP fails, check your date parameters first. It\'s always the date parameters.' },
  { tag: 'oracle', text: 'HDL loads in order: Elements → Workers → Assignments. Write your conversions that way.' },
  { tag: 'oracle', text: 'Every Oracle table suffix tells you something: _F is date-effective, _B is base, _VL is translated.' },
  { tag: 'oracle', text: 'OTBI is for analysts. BIP is for developers. Know which one you actually need before you start.' },
  { tag: 'oracle', text: 'Fast Formula errors are always line 1. Scroll past line 1.' },
  { tag: 'misc', text: 'Nobody who ever shipped said "I\'m glad I waited until it was perfect."' },
  { tag: 'misc', text: 'The best character is the one you\'ve played for 10,000 hours.' },
  { tag: 'misc', text: 'You are the result of 4 billion years of evolutionary success. Act like it.' },
  { tag: 'misc', text: 'Done is better than perfect. Shipped is better than done.' },
];

const TAG_COLORS: Record<string, string> = {
  falco: 'text-cyan-400',
  book: 'text-purple-400',
  oracle: 'text-yellow-400',
  misc: 'text-brand-text/60',
};

type HistoryLine = { prompt?: string; output: string; tag?: string };

function pickRandom(tag?: string) {
  const pool = tag ? POOL.filter((p) => p.tag === tag) : POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

const COMMANDS: Record<string, () => HistoryLine> = {
  help: () => ({ output: 'commands: random · falco · book · oracle · whoami · clear' }),
  whoami: () => ({ output: 'joey farah — oracle consultant, melee player, independent developer' }),
  random: () => { const p = pickRandom(); return { prompt: 'random', output: p.text, tag: p.tag }; },
  falco: () => { const p = pickRandom('falco'); return { prompt: 'falco', output: p.text, tag: 'falco' }; },
  book: () => { const p = pickRandom('book'); return { prompt: 'book', output: p.text, tag: 'book' }; },
  oracle: () => { const p = pickRandom('oracle'); return { prompt: 'oracle', output: p.text, tag: 'oracle' }; },
};

const TerminalTile: React.FC = () => {
  const [history, setHistory] = useState<HistoryLine[]>([
    { output: 'type "help" for commands — or tap [random]' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const run = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === 'clear') { setHistory([]); return; }
    const handler = COMMANDS[trimmed];
    const line: HistoryLine = handler
      ? handler()
      : { prompt: trimmed, output: `command not found: ${trimmed}` };
    setHistory((h) => [...h, line]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    run(input);
    setInput('');
  };

  return (
    <motion.div
      className="rounded-xl border border-brand-primary/20 bg-brand-bg overflow-hidden font-mono text-sm"
      whileHover={{ borderColor: 'rgba(6,182,212,0.5)', boxShadow: '0 0 16px rgba(6,182,212,0.08)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-brand-primary/10">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-brand-text/40">terminal</span>
        <span className="ml-auto text-xs" style={{ color: '#06b6d4' }}>{'>_'}</span>
      </div>

      {/* History */}
      <div className="px-4 py-3 flex flex-col gap-2 max-h-44 overflow-y-auto">
        {history.map((line, i) => (
          <div key={i}>
            {line.prompt && (
              <div className="flex items-center gap-2 text-xs">
                <span style={{ color: '#06b6d4' }}>$</span>
                <span className="text-brand-text/50">{line.prompt}</span>
              </div>
            )}
            <p className={`text-xs leading-relaxed ${TAG_COLORS[line.tag ?? ''] ?? 'text-brand-text/60'} ${line.prompt ? 'pl-4' : ''}`}>
              {line.output}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="border-t border-brand-primary/10 px-4 py-2 flex items-center gap-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs shrink-0" style={{ color: '#06b6d4' }}>$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent outline-none text-xs text-brand-text flex-1 min-w-0 placeholder-brand-text/20"
            placeholder="type a command..."
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </form>
        <button
          onClick={() => run('random')}
          className="shrink-0 text-xs px-2 py-1 rounded border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 transition-colors"
        >
          random
        </button>
      </div>
    </motion.div>
  );
};

export default TerminalTile;

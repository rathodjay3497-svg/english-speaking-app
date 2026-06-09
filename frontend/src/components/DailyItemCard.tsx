import { useState } from 'react';
import { BookmarkIcon, CheckIcon, MicIcon, SpeakerIcon, StopIcon } from './Icon';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { Idiom, VocabWord } from '../types';

const DIFF_STYLE: Record<string, React.CSSProperties> = {
  Beginner:     { background: 'var(--teal-soft)',  color: 'var(--teal)' },
  Intermediate: { background: 'var(--amber-soft)', color: 'var(--saffron-deep)' },
  Advanced:     { background: 'var(--rose-soft)',  color: '#c0392b' },
};

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, phrase: string) {
  if (!phrase) return <>{text}</>;
  const regex = new RegExp(`(${escapeRegExp(phrase)})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === phrase.toLowerCase()
          ? <strong key={i} style={{ color: 'var(--ink)' }}>{part}</strong>
          : part
      )}
    </>
  );
}

// Single unified bottom action bar: [🔊 Speak] [🎙 Mic] [🔖 Bookmark] [✓ Mark as learned]
function ActionBar({
  target,
  bookmarked,
  onToggleBookmark,
  read,
  onToggleRead,
  learnLabel,
  learnedLabel,
}: {
  target: string;
  bookmarked: boolean;
  onToggleBookmark?: () => void;
  read: boolean;
  onToggleRead: () => void;
  learnLabel: string;
  learnedLabel: string;
}) {
  const { speak, isSpeaking } = useSpeechSynthesis();
  const [heard, setHeard] = useState<string | null>(null);
  const [match, setMatch] = useState<boolean | null>(null);
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
      const ok = normalize(transcript).includes(normalize(target)) || normalize(target).includes(normalize(transcript));
      setHeard(transcript);
      setMatch(ok);
    },
  });

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center gap-2">
        {/* Speak button */}
        <button
          type="button"
          onClick={() => { setMatch(null); setHeard(null); speak(target); }}
          disabled={isSpeaking}
          aria-label="Speak"
          className="w-9 h-9 rounded-xl grid place-items-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-40"
          style={{ background: 'var(--teal-soft)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }}
        >
          <SpeakerIcon className="w-4 h-4" />
        </button>

        {/* Mic button */}
        {isSupported && (
          <button
            type="button"
            onClick={() => {
              if (isListening) { stopListening(); return; }
              setHeard(null); setMatch(null);
              startListening();
            }}
            disabled={isSpeaking}
            aria-label={isListening ? 'Stop' : 'Speak it'}
            className="w-9 h-9 rounded-xl grid place-items-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-40"
            style={{
              background: isListening ? '#ef4444' : 'var(--rose-soft)',
              color: isListening ? '#fff' : '#c0392b',
              border: 'none', cursor: 'pointer',
            }}
          >
            {isListening ? <StopIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
          </button>
        )}

        {/* Bookmark */}
        {onToggleBookmark && (
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-label="Bookmark"
            className="w-9 h-9 rounded-xl grid place-items-center flex-shrink-0 transition-all active:scale-90"
            style={{
              background: bookmarked ? 'var(--amber-soft)' : 'var(--paper-2)',
              color: bookmarked ? 'var(--saffron-deep)' : 'var(--ink-soft)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <BookmarkIcon className="w-4 h-4" filled={bookmarked} />
          </button>
        )}

        {/* Mark as learned — fills remaining width */}
        <button
          type="button"
          onClick={onToggleRead}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95"
          style={
            read
              ? { background: 'var(--teal-soft)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }
              : { background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }
          }
        >
          <CheckIcon className="w-4 h-4" />
          {read ? learnedLabel : learnLabel}
        </button>
      </div>

      {/* Mic feedback */}
      {match !== null && heard && (
        <p className="text-[11px] font-medium px-1" style={{ color: match ? 'var(--teal)' : '#c0392b' }}>
          {match ? '✓ Great pronunciation!' : `Heard: "${heard}" — try again`}
        </p>
      )}
    </div>
  );
}

interface Props {
  emoji?: string;
  title: string;
  subtitle?: string;
  meaningEn: string;
  meaningGu: string;
  example?: string;
  read: boolean;
  onToggleRead: () => void;
  accent?: 'teal' | 'amber';
  idiom?: Idiom;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  word?: VocabWord;
  wordBookmarked?: boolean;
  onToggleWordBookmark?: () => void;
}

export default function DailyItemCard({
  emoji,
  title,
  subtitle,
  meaningEn,
  meaningGu,
  example,
  read,
  onToggleRead,
  accent = 'teal',
  idiom,
  bookmarked,
  onToggleBookmark,
  word,
  wordBookmarked,
  onToggleWordBookmark,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = accent === 'amber' ? 'var(--saffron-deep)' : 'var(--teal)';
  const accentSoft  = accent === 'amber' ? 'var(--amber-soft)'   : 'var(--teal-soft)';

  return (
    <div
      className="rounded-[15px] overflow-hidden transition-all"
      style={{
        background: 'var(--card)',
        border: read ? '1.5px solid var(--teal)' : '1px solid var(--line)',
        opacity: read ? 0.75 : 1,
      }}
    >
      {/* Collapsed row */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-3.5 text-left transition-all active:scale-[.99]"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span
          className="w-9 h-9 rounded-[11px] grid place-items-center text-lg flex-shrink-0"
          style={{ background: accentSoft }}
        >
          {read ? <CheckIcon className="w-4 h-4" /> : emoji ?? '✨'}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-serif text-[15px] font-semibold leading-tight truncate" style={{ color: 'var(--ink)' }}>
            {title}
          </span>
          {subtitle && (
            <span className="block text-[11px] leading-snug truncate" style={{ color: 'var(--ink-soft)' }}>
              {subtitle}
            </span>
          )}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{ color: 'var(--ink-soft)', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded — rich idiom */}
      {expanded && idiom && (
        <div className="px-3.5 pb-4 -mt-1 space-y-3">
          <span
            className="inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
            style={DIFF_STYLE[idiom.difficulty] ?? DIFF_STYLE.Intermediate}
          >
            {idiom.difficulty}
          </span>

          <p className="text-[13px] font-medium" style={{ color: 'var(--teal)' }}>
            {idiom.gujarati_meaning}
          </p>

          <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--paper-2)' }}>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink)' }}>
              {idiom.english_meaning}
            </p>
          </div>

          {idiom.examples && idiom.examples.length > 0 && (
            <div className="space-y-1.5">
              {idiom.examples.map((ex, i) => (
                <p key={i} className="text-[12px] italic leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  {highlight(ex, idiom.idiom)}
                </p>
              ))}
            </div>
          )}

          {/* Unified action bar */}
          <ActionBar
            target={idiom.idiom}
            bookmarked={!!bookmarked}
            onToggleBookmark={onToggleBookmark}
            read={read}
            onToggleRead={onToggleRead}
            learnLabel="Mark as learned"
            learnedLabel="Learned"
          />
        </div>
      )}

      {/* Expanded — rich word */}
      {expanded && word && (
        <div className="px-3.5 pb-4 -mt-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
              style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}>
              {word.part_of_speech}
            </span>
            {word.difficulty && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
                style={DIFF_STYLE[word.difficulty] ?? DIFF_STYLE.Intermediate}>
                {word.difficulty}
              </span>
            )}
          </div>

          <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--paper-2)' }}>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink)' }}>
              {word.english_meaning}
            </p>
          </div>

          {word.gujarati_meaning && (
            <p className="text-[13px] font-medium" style={{ color: 'var(--saffron-deep)' }}>
              {word.gujarati_meaning}
            </p>
          )}

          {word.examples && word.examples.length > 0 && (
            <div className="space-y-1.5">
              {word.examples.map((ex, i) => (
                <p key={i} className="text-[12px] italic leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  "{ex}"
                </p>
              ))}
            </div>
          )}

          {word.synonyms && word.synonyms.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-soft)' }}>Synonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {word.synonyms.map(s => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {word.antonyms && word.antonyms.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-soft)' }}>Antonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {word.antonyms.map(a => (
                  <span key={a} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--rose-soft)', color: '#c0392b' }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {word.collocations && word.collocations.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-soft)' }}>Collocations</p>
              <div className="flex flex-wrap gap-1.5">
                {word.collocations.map(c => (
                  <span key={c} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {word.word_forms && word.word_forms.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-soft)' }}>Word Forms</p>
              <div className="flex flex-wrap gap-1.5">
                {word.word_forms.map(f => (
                  <span key={f} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--paper-2)', color: 'var(--ink)' }}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {word.memory_tip && (
            <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--amber-soft)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--saffron-deep)' }}>Memory Tip</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink)' }}>{word.memory_tip}</p>
            </div>
          )}

          {word.usage_note && (
            <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--paper-2)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)' }}>Usage Note</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--ink)' }}>{word.usage_note}</p>
            </div>
          )}

          {/* Unified action bar */}
          <ActionBar
            target={word.word}
            bookmarked={!!wordBookmarked}
            onToggleBookmark={onToggleWordBookmark}
            read={read}
            onToggleRead={onToggleRead}
            learnLabel="Mark as learned"
            learnedLabel="Learned"
          />
        </div>
      )}

      {/* Expanded — minimal fallback (grammar cards) */}
      {expanded && !idiom && !word && (
        <div className="px-3.5 pb-3.5 -mt-1">
          <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: 'var(--paper-2)' }}>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink)' }}>{meaningEn}</p>
            {meaningGu && (
              <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: accentColor }}>
                {meaningGu}
              </p>
            )}
            {example && (
              <p className="text-[12px] italic mt-2 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                "{example}"
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleRead}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95"
            style={
              read
                ? { background: 'var(--teal-soft)', color: 'var(--teal)', border: 'none', cursor: 'pointer' }
                : { background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }
            }
          >
            <CheckIcon className="w-4 h-4" />
            {read ? 'Read' : 'Mark as read'}
          </button>
        </div>
      )}
    </div>
  );
}

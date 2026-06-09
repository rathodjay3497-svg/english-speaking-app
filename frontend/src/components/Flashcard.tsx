import { useState } from 'react';
import type { VocabWord } from '../types';
import { BookmarkIcon, CheckIcon, FlipIcon } from './Icon';
import PronounceButton from './PronounceButton';

const POS_ICON: Record<string, { emoji: string; bg: string }> = {
  'verb':         { emoji: '⚡', bg: '#DBEAFE' },
  'noun':         { emoji: '📦', bg: '#D1FAE5' },
  'adjective':    { emoji: '🎨', bg: '#EDE9FE' },
  'phrase':       { emoji: '💬', bg: '#FEF3C7' },
  'phrasal verb': { emoji: '🔀', bg: '#FCE7F3' },
  'adverb':       { emoji: '🌀', bg: '#ECFDF5' },
};
const POS_FALLBACK = { emoji: '📝', bg: 'var(--paper-2)' };

interface Props {
  word: VocabWord;
  learned?: boolean;
  spoken?: boolean;
  bookmarked?: boolean;
  onToggleLearned?: () => void;
  onSpoken?: () => void;
  onToggleBookmark?: () => void;
}

export default function Flashcard({ word, learned, spoken, bookmarked, onToggleLearned, onSpoken, onToggleBookmark }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="rounded-[15px] p-4 relative"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      {/* difficulty + learned tick */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
          style={
            word.difficulty === 'Advanced'
              ? { background: 'var(--rose-soft)', color: 'var(--rose)' }
              : { background: 'var(--amber-soft)', color: 'var(--amber)' }
          }
        >
          {word.difficulty}
        </span>
        <div className="flex items-center gap-1.5">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              aria-label="Bookmark word"
              className="w-7 h-7 rounded-full grid place-items-center transition-transform active:scale-90"
              style={{ color: bookmarked ? 'var(--saffron-deep)' : 'var(--ink-soft)', border: 'none', cursor: 'pointer' }}
            >
              <BookmarkIcon className="w-4 h-4" filled={bookmarked} />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLearned}
            aria-label="Mark learned"
            className="w-7 h-7 rounded-full grid place-items-center transition-transform active:scale-90"
            style={
              learned
                ? { background: 'var(--teal)', color: '#fff' }
                : { background: 'var(--paper-2)', color: 'var(--ink-soft)' }
            }
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Front: word */}
      <button type="button" onClick={() => setFlipped(f => !f)} className="text-left w-full">
        {(() => {
          const posKey = word.part_of_speech?.toLowerCase() ?? '';
          const icon = POS_ICON[posKey] ?? POS_FALLBACK;
          return (
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-7 h-7 rounded-[7px] grid place-items-center text-sm flex-shrink-0"
                style={{ background: icon.bg }}
              >
                {icon.emoji}
              </div>
            </div>
          );
        })()}
        <h4 className="font-serif text-xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
          {word.word}
        </h4>
        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
          {word.part_of_speech} · <span className="font-guj">{word.gujarati_pronunciation}</span>
        </p>
      </button>

      {/* Back: meaning + details (revealed on flip) */}
      {flipped && (
        <div className="mt-3 space-y-2.5 bubble-pop">
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink)' }}>
            {word.english_meaning}
          </p>
          <p className="text-[13px] font-guj leading-relaxed" style={{ color: 'var(--teal)' }}>
            {word.gujarati_meaning}
          </p>

          {word.collocations && word.collocations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {word.collocations.map(c => (
                <span
                  key={c}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Synonyms & Antonyms */}
          {((word.synonyms && word.synonyms.length > 0) || (word.antonyms && word.antonyms.length > 0)) && (
            <div className="space-y-1.5 pt-0.5">
              {word.synonyms && word.synonyms.length > 0 && (
                <div className="text-[11px] flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[10px]" style={{ color: 'var(--ink-soft)' }}>Synonyms:</span>
                  {word.synonyms.map(syn => (
                    <span
                      key={syn}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
                    >
                      {syn}
                    </span>
                  ))}
                </div>
              )}
              {word.antonyms && word.antonyms.length > 0 && (
                <div className="text-[11px] flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[10px]" style={{ color: 'var(--ink-soft)' }}>Antonyms:</span>
                  {word.antonyms.map(ant => (
                    <span
                      key={ant}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ background: 'var(--rose-soft)', color: 'var(--rose)' }}
                    >
                      {ant}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {word.examples?.[0] && (
            <p className="text-[12px] italic leading-relaxed pt-0.5" style={{ color: 'var(--ink-soft)' }}>
              “{word.examples[0]}”
            </p>
          )}

          {/* More Examples */}
          {word.examples && word.examples.length > 1 && (
            <div className="space-y-1 pt-0.5">
              <span className="text-[11px] font-bold" style={{ color: 'var(--ink-soft)' }}>More Examples:</span>
              <div className="space-y-1 pl-2.5 border-l border-dashed" style={{ borderColor: 'var(--line)' }}>
                {word.examples.slice(1).map((ex, idx) => (
                  <p key={idx} className="text-[11px] italic leading-snug" style={{ color: 'var(--ink-soft)' }}>
                    • “{ex}”
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Usage Note */}
          {word.usage_note && (
            <div
              className="rounded-lg p-2 text-[11px] leading-snug mt-2"
              style={{
                background: 'var(--amber-soft)',
                color: 'var(--ink-soft)',
                borderLeft: '3px solid var(--amber)'
              }}
            >
              <span className="font-bold mr-1">💡 Usage:</span>
              {word.usage_note}
            </div>
          )}

          {/* Memory Tip */}
          {word.memory_tip && (
            <div
              className="rounded-lg p-2 text-[11px] leading-snug mt-1"
              style={{
                background: 'rgba(232, 118, 58, 0.08)',
                color: 'var(--ink-soft)',
                borderLeft: '3px solid var(--saffron)'
              }}
            >
              <span className="font-bold mr-1">🔑 Memory Tip:</span>
              <span className="font-guj">{word.memory_tip}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer: flip + pronounce */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
        <button
          type="button"
          onClick={() => setFlipped(f => !f)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--ink-soft)' }}
        >
          <FlipIcon className="w-4 h-4" />
          {flipped ? 'Hide' : 'Reveal'}
        </button>
        <PronounceButton
          target={word.word}
          size="sm"
          onResult={(ok) => { if (ok) onSpoken?.(); }}
        />
      </div>

      {spoken && (
        <span className="absolute bottom-2 right-3 text-[10px] font-semibold" style={{ color: 'var(--teal)' }}>
          ✓ spoken
        </span>
      )}
    </div>
  );
}

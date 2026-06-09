import { useState } from 'react';
import type { VocabWord } from '../types';
import type { WordProgress } from '../hooks/useLocalProgress';
import PronounceButton from './PronounceButton';

interface WordRowProps {
  word: VocabWord;
  progress: WordProgress;
  onBookmark: () => void;
  onLearned: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const DIFF_BADGE: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: '#d4f5e2', text: '#1a7a45' },
  intermediate: { bg: '#fff3cd', text: '#856404' },
  advanced:     { bg: '#fde8e8', text: '#b91c1c' },
};

export default function WordRow({ word, progress, onBookmark, onLearned, isOpen, onToggle }: WordRowProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const handleToggle = onToggle ?? (() => setInternalOpen(o => !o));

  const diff = word.difficulty?.toLowerCase() ?? 'intermediate';
  const badge = DIFF_BADGE[diff] ?? DIFF_BADGE.intermediate;
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
      {/* Collapsed header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none active:bg-surface-container-low transition-colors"
        onClick={handleToggle}
      >
        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-[9px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 mb-1"
            style={{ background: badge.bg, color: badge.text }}
          >
            {word.difficulty}
          </span>
          <div className="font-bold text-base text-on-surface leading-tight">{word.word}</div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">
            <span className="italic">{word.part_of_speech}</span>
            {word.gujarati_pronunciation && (
              <span className="ml-1">· {word.gujarati_pronunciation}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            aria-label={progress.bookmarked ? 'Remove bookmark' : 'Bookmark word'}
            onClick={onBookmark}
            className="text-lg leading-none transition-colors"
            style={{ color: progress.bookmarked ? '#2d6a4f' : '#d0d0d0' }}
          >
            🔖
          </button>
          <button
            aria-label={progress.learned ? 'Mark unlearned' : 'Mark learned'}
            onClick={onLearned}
            className="text-lg leading-none transition-colors"
            style={{ color: progress.learned ? '#2d6a4f' : '#d0d0d0' }}
          >
            ✓
          </button>
        </div>
        <span
          className="text-[11px] text-on-surface-variant transition-transform duration-200 shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
        >
          ▼
        </span>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-outline-variant/10 bg-[#faf8f5] space-y-3">
          {/* English meaning */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60 mb-1">
              English Meaning
            </div>
            <div className="text-sm text-on-surface leading-relaxed">{word.english_meaning}</div>
          </div>

          {/* Gujarati meaning */}
          {word.gujarati_meaning && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60 mb-1">
                Gujarati Meaning
              </div>
              <div className="text-sm text-on-surface-variant leading-relaxed">{word.gujarati_meaning}</div>
            </div>
          )}

          {/* First example */}
          {word.examples?.[0] && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60 mb-1">
                Example
              </div>
              <div className="text-xs italic text-on-surface-variant leading-relaxed">
                "{word.examples[0]}"
              </div>
            </div>
          )}

          {/* Synonyms */}
          {word.synonyms && word.synonyms.length > 0 && (
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60 mb-1">
                Synonyms
              </div>
              <div className="flex flex-wrap gap-1.5">
                {word.synonyms.map(s => (
                  <span
                    key={s}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#e4f2ec', color: '#1e5c3a' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Memory tip */}
          {word.memory_tip && (
            <div
              className="rounded-r-lg px-3 py-2 text-xs leading-relaxed"
              style={{ background: '#fff8e6', borderLeft: '3px solid #f0a500', color: '#7a5c00' }}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#c08000' }}>
                💡 Memory Tip
              </div>
              {word.memory_tip}
            </div>
          )}

          {/* Action row */}
          <div className="flex gap-2 pt-1">
            <PronounceButton target={word.word} size="sm" />
            <button
              onClick={onLearned}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-colors"
              style={
                progress.learned
                  ? { background: '#e4f2ec', color: '#1e5c3a' }
                  : { background: '#f0ece6', color: '#555' }
              }
            >
              {progress.learned ? '✓ Learned' : '✓ Mark learned'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

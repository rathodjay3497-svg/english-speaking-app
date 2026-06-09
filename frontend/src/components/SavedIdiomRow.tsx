import React from 'react';

interface SavedIdiomRowProps {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  englishMeaning?: string;
  example?: string;
  isOpen: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

const DIFF_COLOR: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: '#d4f5e2', text: '#1a7a45' },
  intermediate: { bg: '#fff3cd', text: '#856404' },
  advanced:     { bg: '#fde8e8', text: '#b91c1c' },
};

function highlight(text: string, phrase: string): React.ReactNode {
  if (!phrase) return text;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === phrase.toLowerCase()
      ? <strong key={i}>{p}</strong>
      : p
  );
}

export default function SavedIdiomRow({
  title,
  category,
  difficulty,
  englishMeaning,
  example,
  isOpen,
  onToggle,
  onRemove,
}: SavedIdiomRowProps) {
  const diff = difficulty.toLowerCase();
  const badge = DIFF_COLOR[diff] ?? DIFF_COLOR.intermediate;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
      {/* Collapsed header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none active:bg-surface-container-low transition-colors"
        onClick={onToggle}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary-container/20 shrink-0">
          <span className="material-symbols-outlined text-secondary text-base">auto_stories</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Idiom</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: badge.bg, color: badge.text }}
            >
              {difficulty.slice(0, 3).toUpperCase()}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-on-surface truncate mt-0.5">{title}</h4>
          <p className="text-xs text-on-surface-variant">{category}</p>
        </div>
        <button
          className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
          onClick={e => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove bookmark"
        >
          bookmark
        </button>
        <span
          className="text-[11px] text-on-surface-variant shrink-0 transition-transform duration-200"
          style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </div>

      {/* Expanded panel */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-outline-variant/10 bg-[#faf8f5] space-y-2">
          {englishMeaning && (
            <p className="text-sm text-on-surface leading-relaxed">{englishMeaning}</p>
          )}
          {example && (
            <p className="text-xs italic text-on-surface-variant leading-relaxed">
              "{highlight(example, title)}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}

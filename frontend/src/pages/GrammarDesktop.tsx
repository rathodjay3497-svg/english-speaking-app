import DesktopLayout from '../components/DesktopLayout';
import ChapterCard from '../components/ChapterCard';
import type { GrammarChapterSummary, GrammarIndex, GrammarLevel } from '../types';

interface GrammarDesktopProps {
  index: GrammarIndex | null;
  loading: boolean;
  level: string;
  setLevel: (lvl: 'All' | GrammarLevel) => void;
  grammarCompletedSet: Set<string>;
  progress: any;
  toggleGrammarComplete: (slug: string) => void;
  navigate: (path: string) => void;
  groupedChapters: Record<GrammarLevel, GrammarChapterSummary[]>;
  levelCounts: Record<GrammarLevel, { done: number; total: number }>;
}

const LEVEL_COLORS: Record<GrammarLevel, { bg: string; text: string; header: string }> = {
  Beginner: { bg: 'bg-primary-fixed/30', text: 'text-primary', header: 'text-primary' },
  Intermediate: { bg: 'bg-secondary-fixed/30', text: 'text-secondary', header: 'text-secondary' },
  Advanced: { bg: 'bg-tertiary-fixed/30', text: 'text-tertiary', header: 'text-tertiary' },
};

export default function GrammarDesktop({
  index,
  loading,
  level,
  setLevel,
  grammarCompletedSet,
  progress,
  toggleGrammarComplete,
  navigate,
  groupedChapters,
  levelCounts,
}: GrammarDesktopProps) {
  if (loading) {
    return (
      <DesktopLayout activeTab="grammar">
        <div className="flex-grow flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant font-bold font-serif">
          Loading grammar chapters…
        </div>
      </DesktopLayout>
    );
  }

  const total = index?.total_chapters ?? 0;
  const completedCount = (index?.chapters ?? []).filter(c => grammarCompletedSet.has(c.slug)).length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const left = total - completedCount;

  return (
    <DesktopLayout activeTab="grammar">
      <div className="max-w-container-max mx-auto p-margin-desktop w-full flex flex-col gap-stack-lg">
        {/* Header */}
        <div className="pb-4 border-b border-outline-variant/10">
          <h1 className="font-display-lg text-display-lg text-on-background mb-1 font-serif">Grammar Chapters</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Bilingual lessons with explanations, examples, and practice exercises.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex border-b border-outline-variant/20 mb-2">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => {
            const isActive = level === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
                  isActive
                    ? 'text-primary border-primary font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Body: chapters (9 cols) + progress sidebar (3 cols) */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* Chapters grid */}
          <div className="col-span-9 flex flex-col gap-8">
            {(['Beginner', 'Intermediate', 'Advanced'] as GrammarLevel[]).map((lvl) => {
              const chapters = groupedChapters[lvl];
              if (!chapters || chapters.length === 0) return null;
              const lc = levelCounts[lvl];

              return (
                <div key={lvl} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                    <h2 className={`font-headline-lg text-headline-lg font-serif font-bold ${LEVEL_COLORS[lvl].header}`}>
                      {lvl}
                    </h2>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                      {lc.done}/{lc.total} Completed
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {chapters.map((ch) => (
                      <ChapterCard
                        key={ch.slug}
                        chapter={ch}
                        completed={grammarCompletedSet.has(ch.slug)}
                        score={progress.grammarScores?.[ch.slug]}
                        onOpen={() => navigate(`/grammar/${ch.slug}`)}
                        onToggleComplete={() => toggleGrammarComplete(ch.slug)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right sidebar: per-level progress */}
          <div className="col-span-3 sticky top-6 flex flex-col gap-4">
            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
              <h3 className="font-serif text-sm font-bold text-on-surface mb-4">Progress by Level</h3>
              {(['Beginner', 'Intermediate', 'Advanced'] as GrammarLevel[]).map((lvl) => {
                const lc = levelCounts[lvl];
                if (!lc || lc.total === 0) return null;
                const lpct = Math.round((lc.done / lc.total) * 100);
                return (
                  <div key={lvl} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`text-xs font-bold ${LEVEL_COLORS[lvl].text}`}>{lvl}</span>
                      <span className="text-[10px] text-on-surface-variant">{lc.done}/{lc.total}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden bg-outline-variant/20">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${lpct}%`,
                          background: lvl === 'Beginner' ? '#004f46' : lvl === 'Intermediate' ? '#924b1c' : '#7c3aed',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall */}
            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
              <h3 className="font-serif text-sm font-bold text-on-surface mb-3">Overall</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-serif text-3xl font-bold text-primary">{pct}%</span>
                <span className="text-xs text-on-surface-variant mb-1">{completedCount}/{total} done</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden bg-outline-variant/20">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              {left === 0
                ? <p className="text-[11px] mt-2 text-primary font-semibold">🎉 All complete!</p>
                : <p className="text-[11px] mt-2 text-on-surface-variant">{left} chapter{left === 1 ? '' : 's'} left</p>
              }
            </div>
          </div>

        </div>
      </div>
    </DesktopLayout>
  );
}

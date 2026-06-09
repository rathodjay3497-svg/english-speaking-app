import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import ExplanationBlockComponent from '../components/ExplanationBlock';
import PracticeItemComponent from '../components/PracticeItem';
import Bi from '../components/Bi';
import { CheckIcon } from '../components/Icon';
import type { GrammarChapter as Chapter, GrammarChapterSummary, GrammarLevel } from '../types';

interface GrammarChapterDesktopProps {
  chapter: Chapter;
  chapterList: GrammarChapterSummary[];
  slug: string;
  loading: boolean;
  tab: 'learn' | 'practice';
  setTab: (tab: 'learn' | 'practice') => void;
  completed: boolean;
  gradedTotal: number;
  correctCount: number;
  scorePct: number;
  handleAnswered: (idx: number, correct: boolean) => void;
  markComplete: () => void;
  prevChapter: GrammarChapterSummary | null;
  nextChapter: GrammarChapterSummary | null;
  level: GrammarLevel;
}

export default function GrammarChapterDesktop({
  chapter,
  tab,
  setTab,
  completed,
  gradedTotal,
  correctCount,
  scorePct,
  handleAnswered,
  markComplete,
  prevChapter,
  nextChapter,
  level,
}: GrammarChapterDesktopProps) {
  const navigate = useNavigate();

  return (
    <DesktopLayout activeTab="grammar">
      <div className="max-w-container-max mx-auto p-margin-desktop flex flex-col gap-stack-lg w-full">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
          <button 
            onClick={() => navigate('/grammar')} 
            className="hover:text-primary transition-colors cursor-pointer font-bold"
          >
            Grammar
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-background">{chapter.title.en}</span>
        </nav>

        {/* Lesson Header (Mastery Block) */}
        <header className="bg-primary rounded-xl overflow-hidden shadow-sm relative isolate flex flex-col lg:flex-row items-center">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container via-primary to-primary opacity-80 -z-10"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -z-10"></div>
          <div className="flex-1 p-stack-lg z-10 flex flex-col gap-stack-sm">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-on-primary border border-white/30 px-3 py-1 rounded-full font-label-sm text-label-sm w-fit uppercase tracking-wider backdrop-blur-sm font-bold">
                Chapter {chapter.order}
              </span>
              <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full font-label-sm text-label-sm w-fit uppercase tracking-wider font-bold">
                {level}
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-primary font-serif leading-none">
              {chapter.title.en}
            </h1>
            {chapter.title.gu && (
              <h2 className="font-headline-lg text-headline-lg text-primary-fixed font-light mt-2 font-guj">
                {chapter.title.gu}
              </h2>
            )}
            {chapter.summary && (
              <div className="mt-4 max-w-2xl text-on-primary/95">
                <Bi 
                  t={chapter.summary} 
                  enClass="text-body-lg font-body-lg leading-relaxed text-on-primary"
                  guClass="text-primary-fixed-dim italic mt-2 font-guj block leading-relaxed"
                />
              </div>
            )}
          </div>
          <div className="w-full lg:w-64 h-48 lg:h-auto bg-primary-container relative shrink-0">
            <img 
              alt="Decorative graphic related to grammar learning" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhdkZ0mp7EDh7d05_AUvtcK5ycvBjdJp_1H4juVUtd7e2esi0KVeZcxcmIEv6JqPRD-PjkqMzuvFZ-CjLRs7T5WkGtHM2gBW-HaFS-9YFW-k3Z8tbOI6wEP4ToEA0a-JJ2Rd04L-tokD9ogZpwEexQ2sZgMsBJ0iqwUwhjiqoeECU0iehB1a0Gq_cQ8LOw86-JVB9YnpuqRKfPC98CyxoLmEOAx7A-HCbYtVMNHt59wKgj5ZH9a-ddXUx6pXOdVrsMCPD_-Q6CT-k"
            />
          </div>
        </header>

        {/* Learn / Practice Switcher Tabs */}
        <div className="flex border-b border-outline-variant/20 mb-2">
          <button
            onClick={() => setTab('learn')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              tab === 'learn'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Learn ({chapter.explanations.length})
          </button>
          <button
            onClick={() => setTab('practice')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              tab === 'practice'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Practice ({chapter.practice.length})
          </button>
        </div>

        {/* Shared 2-col layout: content (8) + sidebar (4) */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* Main content column */}
          <div className="col-span-8">
            {tab === 'learn' ? (
              <div className="flex flex-col gap-5">
                {chapter.explanations.map((block, idx) => (
                  <div key={block.id ?? idx} className="transition-all duration-300 hover:-translate-y-0.5">
                    <ExplanationBlockComponent block={block} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {gradedTotal > 0 && (
                  <div className="flex items-center justify-between rounded-xl p-4 bg-surface border border-outline-variant/20 shadow-sm">
                    <span className="text-sm font-bold text-on-surface">Practice Score</span>
                    <span className="font-serif text-lg font-bold text-primary">
                      {correctCount} / {gradedTotal} ({scorePct}%)
                    </span>
                  </div>
                )}
                {chapter.practice.map((item, idx) => (
                  <div key={item.id ?? idx} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-stack-md shadow-sm">
                    <PracticeItemComponent
                      item={item}
                      index={idx}
                      onAnswered={(correct) => handleAnswered(idx, correct)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar — same for both tabs */}
          <div className="col-span-4 sticky top-6 flex flex-col gap-4">
            {/* Chapter info */}
            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Chapter {chapter.order}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                  {level}
                </span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">
                  {chapter.explanations.length} explanation{chapter.explanations.length !== 1 ? 's' : ''} · {chapter.practice.length} practice item{chapter.practice.length !== 1 ? 's' : ''}
                </p>
              </div>
              {/* Mark complete */}
              <button
                onClick={markComplete}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  completed
                    ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                <CheckIcon className="w-4 h-4" />
                {completed ? '✓ Completed' : 'Mark Complete'}
              </button>
            </div>

            {/* Switch tab CTA */}
            {tab === 'learn' ? (
              <button
                onClick={() => setTab('practice')}
                className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit_document</span>
                Practice this chapter
              </button>
            ) : (
              <button
                onClick={() => setTab('learn')}
                className="w-full py-3 rounded-xl bg-surface-container text-on-surface font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-sm">menu_book</span>
                Back to Learn
              </button>
            )}

            {/* Chapter nav */}
            <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">Navigation</p>
              {prevChapter && (
                <button
                  onClick={() => navigate(`/grammar/${prevChapter.slug}`)}
                  className="w-full text-left flex items-center gap-2 p-2.5 rounded-xl hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary">arrow_back</span>
                  <div className="min-w-0">
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">Previous</p>
                    <p className="text-xs font-semibold text-on-surface truncate">{prevChapter.title.en}</p>
                  </div>
                </button>
              )}
              {nextChapter && (
                <button
                  onClick={() => navigate(`/grammar/${nextChapter.slug}`)}
                  className="w-full text-left flex items-center gap-2 p-2.5 rounded-xl hover:bg-surface-container-high transition-colors group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary">arrow_forward</span>
                  <div className="min-w-0">
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">Next</p>
                    <p className="text-xs font-semibold text-on-surface truncate">{nextChapter.title.en}</p>
                  </div>
                </button>
              )}
              {!prevChapter && !nextChapter && (
                <p className="text-xs text-on-surface-variant text-center py-2">No adjacent chapters</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </DesktopLayout>
  );
}

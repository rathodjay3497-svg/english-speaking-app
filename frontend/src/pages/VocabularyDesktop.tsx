import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import Flashcard from '../components/Flashcard';
import type { VocabIndex, VocabWord } from '../types';

interface VocabularyDesktopProps {
  index: VocabIndex | null;
  loading: boolean;
  tab: 'categories' | 'unread' | 'saved';
  setTab: (tab: 'categories' | 'unread' | 'saved') => void;
  progress: any;
  setWord: (key: string, data: { learned?: boolean; spoken?: boolean; bookmarked?: boolean }) => void;
  catNameToId: Record<string, number>;
  savedWords: VocabWord[];
  unreadWords: VocabWord[];
  learnedIn: (categoryId: number) => number;
}

const PAGE_SIZE = 20;

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('place') || n.includes('location') || n.includes('city')) return 'location_city';
  if (n.includes('feel') || n.includes('emotion') || n.includes('mood')) return 'mood';
  if (n.includes('work') || n.includes('job') || n.includes('profession') || n.includes('business')) return 'work';
  if (n.includes('everyday') || n.includes('daily') || n.includes('situation')) return 'shopping_bag';
  return 'menu_book';
};

const getCategoryColors = (idx: number) => {
  const options = [
    { bg: 'bg-secondary-fixed', icon: 'text-on-secondary-fixed' },
    { bg: 'bg-tertiary-fixed', icon: 'text-on-tertiary-fixed-variant' },
    { bg: 'bg-primary-fixed', icon: 'text-on-primary-fixed-variant' },
  ];
  return options[idx % options.length];
};

export default function VocabularyDesktop({
  index,
  loading,
  tab,
  setTab,
  progress,
  setWord,
  catNameToId,
  savedWords,
  unreadWords,
  learnedIn,
}: VocabularyDesktopProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(PAGE_SIZE);
  const [savedCount, setSavedCount] = useState(PAGE_SIZE);
  const unreadSentinelRef = useRef<HTMLDivElement>(null);
  const savedSentinelRef = useRef<HTMLDivElement>(null);

  // Reset counts when search changes or tab switches
  useEffect(() => {
    setUnreadCount(PAGE_SIZE);
    setSavedCount(PAGE_SIZE);
  }, [searchQuery, tab]);

  const filteredUnread = useMemo(() => {
    if (!searchQuery) return unreadWords;
    return unreadWords.filter(
      (w) =>
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.english_meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [unreadWords, searchQuery]);

  const filteredSaved = useMemo(() => {
    if (!searchQuery) return savedWords;
    return savedWords.filter(
      (w) =>
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.english_meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedWords, searchQuery]);

  const displayedUnread = filteredUnread.slice(0, unreadCount);
  const displayedSaved = filteredSaved.slice(0, savedCount);
  const hasMoreUnread = unreadCount < filteredUnread.length;
  const hasMoreSaved = savedCount < filteredSaved.length;

  useEffect(() => {
    if (!unreadSentinelRef.current || !hasMoreUnread) return;
    const el = unreadSentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setUnreadCount(c => c + PAGE_SIZE); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreUnread, displayedUnread.length]);

  useEffect(() => {
    if (!savedSentinelRef.current || !hasMoreSaved) return;
    const el = savedSentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSavedCount(c => c + PAGE_SIZE); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreSaved, displayedSaved.length]);

  if (loading) {
    return (
      <DesktopLayout activeTab="vocabulary">
        <div className="flex-grow flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant font-bold font-serif">
          Loading vocabulary…
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout activeTab="vocabulary">
      <div className="max-w-container-max mx-auto p-margin-desktop w-full flex flex-col gap-stack-lg">
        {/* Header Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md pb-4 border-b border-outline-variant/10">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-background mb-2 font-serif">Vocabulary</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                {index?.total_words ?? 280} words to master to reach advanced fluency.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-surface-container-high rounded-full px-4 py-2 border border-outline-variant/20 focus-within:border-primary/50 transition-all">
                <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface w-40 placeholder-on-surface-variant/50 outline-none"
                  placeholder="Search words..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => navigate('/flashcards')}
                className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Flashcards Mode
              </button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/20 mb-2">
          <button
            onClick={() => setTab('categories')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              tab === 'categories'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setTab('unread')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              tab === 'unread'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Unread ({unreadWords.length})
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`px-6 py-4 font-title-md text-title-md cursor-pointer transition-all border-b-2 font-serif ${
              tab === 'saved'
                ? 'text-primary border-primary font-bold'
                : 'text-on-surface-variant border-transparent hover:text-primary'
            }`}
          >
            Saved ({savedWords.length})
          </button>
        </div>

        {/* Bento Grid Content */}
        {tab === 'categories' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {index?.category_summary.map((c, i) => {
              const learned = learnedIn(c.id);
              const pct = c.total_words ? Math.round((learned / c.total_words) * 100) : 0;

              if (i === 0) {
                return (
                  <div
                    key={c.id}
                    className="md:col-span-8 bg-surface-container rounded-xl p-stack-md flex flex-col justify-between relative overflow-hidden group min-h-[300px] border border-outline-variant/10 shadow-sm"
                  >
                    <div
                      className="absolute inset-0 z-0 opacity-25 transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: "url('/everyday_situations.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 bg-surface/80 rounded-full font-label-sm text-label-sm text-primary mb-4 backdrop-blur-sm font-bold">
                          Featured Module
                        </span>
                        <h2 className="font-headline-lg text-headline-lg text-on-background mb-2 font-serif">
                          {c.category}
                        </h2>
                        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                          Essential vocabulary for daily interactions, shopping, and navigating common scenarios with confidence.
                        </p>
                      </div>
                      <div className="mt-stack-lg bg-surface/90 backdrop-blur-md rounded-lg p-4 border border-outline-variant/10 flex items-center justify-between shadow-sm">
                        <div className="flex-1 mr-6">
                          <div className="flex justify-between mb-2">
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">Progress</span>
                            <span className="font-label-sm text-label-sm text-primary font-bold">
                              {learned}/{c.total_words} Words ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full progress-track rounded-full overflow-hidden bg-primary/10">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/vocabulary/${c.id}`)}
                          className="bg-primary text-on-primary w-11 h-11 rounded-full flex items-center justify-center hover:bg-primary-container transition-all active:scale-95 shadow cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined">play_arrow</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              const colors = getCategoryColors(i);
              const icon = getCategoryIcon(c.category);
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/vocabulary/${c.id}`)}
                  className="md:col-span-4 glass-card rounded-xl p-stack-md flex flex-col hover:border-primary/30 transition-all cursor-pointer shadow-sm min-h-[220px]"
                >
                  <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mb-stack-sm`}>
                    <span className={`material-symbols-outlined ${colors.icon}`}>{icon}</span>
                  </div>
                  <h3 className="font-title-md text-title-md text-on-background mb-2 font-serif font-bold">
                    {c.category}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-auto line-clamp-2 leading-relaxed">
                    Improve fluency in {c.category.toLowerCase()} contexts with targeted vocabulary words.
                  </p>
                  <div className="mt-stack-sm pt-stack-sm border-t border-outline-variant/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] text-on-surface-variant font-bold">Mastered</span>
                      <span className="font-title-md text-title-md text-primary font-bold">
                        {learned}/{c.total_words}
                      </span>
                    </div>
                    <div className="h-1.5 w-full progress-track rounded-full overflow-hidden bg-primary/10">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Review CTA */}
            <div
              onClick={() => navigate('/flashcards')}
              className="md:col-span-4 bg-primary text-on-primary rounded-xl p-stack-md flex flex-col justify-center items-center text-center relative overflow-hidden group hover:opacity-95 transition-all cursor-pointer shadow-sm min-h-[220px]"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <span className="material-symbols-outlined text-[48px] mb-4 relative z-10">flash_on</span>
              <h3 className="font-title-md text-title-md mb-2 relative z-10 font-serif font-bold">Quick Review</h3>
              <p className="font-body-md text-body-md opacity-80 relative z-10">
                Practice vocabulary words due for repetition in Flashcards Mode.
              </p>
            </div>
          </div>
        ) : tab === 'unread' ? (
          <div className="space-y-4">
            {filteredUnread.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {displayedUnread.map((w) => {
                    const catId = catNameToId[w.category];
                    const wordKey = `${catId}-${w.id}`;
                    const wp = progress.vocab[wordKey] ?? {};
                    return (
                      <Flashcard
                        key={wordKey}
                        word={w}
                        learned={wp.learned}
                        spoken={wp.spoken}
                        bookmarked={wp.bookmarked}
                        onToggleLearned={() => setWord(wordKey, { learned: !wp.learned })}
                        onSpoken={() => setWord(wordKey, { spoken: true })}
                        onToggleBookmark={() => setWord(wordKey, { bookmarked: !wp.bookmarked })}
                      />
                    );
                  })}
                </div>
                {hasMoreUnread && (
                  <div ref={unreadSentinelRef} className="flex items-center justify-center gap-2 py-4 text-sm text-on-surface-variant">
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'currentColor' }}
                    />
                    Loading more…
                  </div>
                )}
                {!hasMoreUnread && filteredUnread.length > PAGE_SIZE && (
                  <p className="text-center text-sm py-3 text-on-surface-variant">
                    🎉 All {filteredUnread.length} unread words loaded
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-16 px-4 bg-surface-container rounded-xl border border-outline-variant/10 max-w-md mx-auto">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-sm font-semibold text-on-background font-bold">All words completed!</p>
                <p className="text-xs mt-1 text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                  {searchQuery
                    ? "No words match your search filter."
                    : "Great job! You have marked all words in the library as learned."
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSaved.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {displayedSaved.map((w) => {
                    const catId = catNameToId[w.category];
                    const wordKey = `${catId}-${w.id}`;
                    const wp = progress.vocab[wordKey] ?? {};
                    return (
                      <Flashcard
                        key={wordKey}
                        word={w}
                        learned={wp.learned}
                        spoken={wp.spoken}
                        bookmarked={wp.bookmarked}
                        onToggleLearned={() => setWord(wordKey, { learned: !wp.learned })}
                        onSpoken={() => setWord(wordKey, { spoken: true })}
                        onToggleBookmark={() => setWord(wordKey, { bookmarked: !wp.bookmarked })}
                      />
                    );
                  })}
                </div>
                {hasMoreSaved && (
                  <div ref={savedSentinelRef} className="flex items-center justify-center gap-2 py-4 text-sm text-on-surface-variant">
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'currentColor' }}
                    />
                    Loading more…
                  </div>
                )}
                {!hasMoreSaved && filteredSaved.length > PAGE_SIZE && (
                  <p className="text-center text-sm py-3 text-on-surface-variant">
                    🔖 All {filteredSaved.length} saved words loaded
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-16 px-4 bg-surface-container rounded-xl border border-outline-variant/10 max-w-md mx-auto">
                <div className="text-4xl mb-3">🔖</div>
                <p className="text-sm font-semibold text-on-background font-bold">No saved words</p>
                <p className="text-xs mt-1 text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
                  {searchQuery
                    ? "No saved words match your search filter."
                    : "Tap the bookmark icon on any flashcard inside a category to save it here for quick practice."
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DesktopLayout>
  );
}

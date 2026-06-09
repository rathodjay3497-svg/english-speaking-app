import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ChapterCard from '../components/ChapterCard';
import DailyItemCard from '../components/DailyItemCard';
import ScrollToTop from '../components/ScrollToTop';
import { ProgressIcon } from '../components/Icon';
import { useAutoHide } from '../hooks/useAutoHide';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { useIsDesktop } from '../hooks/useIsDesktop';
import HomeDesktop from './HomeDesktop';
import {
  grammarApi,
  idiomsApi,
  progressApi,
  scenariosApi,
  vocabularyApi,
} from '../services/api';
import type {
  DailyChallenge,
  GrammarChapterSummary,
  Idiom,
  Scenario,
  VocabWord,
} from '../types';
import { getOrPickDaily, hashSeed, pickDaily, todayKey } from '../utils/daily';

const IDIOMS_PER_DAY = 5;
const WORDS_PER_DAY = 5;
const GRAMMAR_PER_DAY = 2;

export default function Home() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [idioms, setIdioms] = useState<Idiom[]>([]);
  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [catNameToId, setCatNameToId] = useState<Record<string, number>>({});
  const [grammarChapters, setGrammarChapters] = useState<GrammarChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { visible: uiVisible } = useAutoHide(scrollRef);
  const { progress, toggleIdiomLearned, setWord, toggleGrammarComplete, toggleIdiomBookmark, setStreak, markCelebratedToday } = useLocalProgress();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      scenariosApi.list(),
      progressApi.dailyChallenge(),
      progressApi.get(),
      idiomsApi.list(),
      grammarApi.index(),
      vocabularyApi.index().then(idx => {
        const map: Record<string, number> = {};
        for (const c of idx.category_summary) map[c.category] = c.id;
        return Promise.all(idx.category_summary.map(c => vocabularyApi.category(c.id)))
          .then(details => ({ map, words: details.flatMap(d => d.words) }));
      }),
    ])
      .then(([s, c, p, lib, gram, vocab]) => {
        if (!active) return;
        setScenarios(Array.isArray(s) ? s : []);
        setChallenge(c);
        setStreak(p.current_streak);
        setIdioms(lib.idioms ?? []);
        setGrammarChapters(gram.chapters ?? []);
        setCatNameToId(vocab.map);
        setAllWords(vocab.words);
      })
      .catch(err => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const challengeScenario = challenge
    ? (scenarios.find(s => s.id === challenge.scenario_id) ?? null)
    : null;

  const seed = useMemo(() => hashSeed(todayKey()), []);
  const learnedIdiomSet = useMemo(() => new Set(progress.learnedIdioms ?? []), [progress.learnedIdioms]);
  const idiomBookmarkSet = useMemo(() => new Set(progress.idiomBookmarks ?? []), [progress.idiomBookmarks]);
  const grammarCompletedSet = useMemo(() => new Set(progress.grammarCompleted ?? []), [progress.grammarCompleted]);

  const wordKey = (w: VocabWord) => `${catNameToId[w.category]}-${w.id}`;

  /**
   * The day's target sets are LOCKED once chosen and persisted (see getOrPickDaily).
   * They intentionally do NOT depend on live read-state, so marking an item read
   * keeps it in the list (shown as completed) instead of refilling with a new item.
   * Read-state is read from `progress` only at the moment of the first pick.
   */

  // Today's idioms — 5 ids chosen once from the then-unread pool, fixed for the day.
  const todaysIdioms = useMemo(() => {
    if (!idioms.length) return [];
    const learnedAtPick = new Set(progress.learnedIdioms ?? []);
    const ids = getOrPickDaily<number>('idioms', () =>
      pickDaily(idioms.filter(i => !learnedAtPick.has(i.id)).map(i => i.id), IDIOMS_PER_DAY, seed)
    );
    const byId = new Map(idioms.map(i => [i.id, i]));
    return ids.map(id => byId.get(id)).filter((i): i is Idiom => !!i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idioms, seed]);

  // Today's words — 5 word-keys chosen once from the then-unread pool, fixed for the day.
  const todaysWords = useMemo(() => {
    if (!allWords.length || !Object.keys(catNameToId).length) return [];
    const ids = getOrPickDaily<string>('words', () =>
      pickDaily(
        allWords.filter(w => !progress.vocab[wordKey(w)]?.learned).map(w => wordKey(w)),
        WORDS_PER_DAY,
        seed + 1
      )
    );
    const byKey = new Map(allWords.map(w => [wordKey(w), w]));
    return ids.map(k => byKey.get(k)).filter((w): w is VocabWord => !!w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, catNameToId, seed]);

  // Today's grammar — next un-completed chapters IN SEQUENCE, locked for the day.
  const todaysGrammar = useMemo(() => {
    if (!grammarChapters.length) return [];
    const completedAtPick = new Set(progress.grammarCompleted ?? []);
    const ids = getOrPickDaily<string>('grammar', () =>
      grammarChapters
        .filter(c => !completedAtPick.has(c.slug))
        .slice(0, GRAMMAR_PER_DAY)
        .map(c => c.slug)
    );
    const bySlug = new Map(grammarChapters.map(c => [c.slug, c]));
    return ids.map(s => bySlug.get(s)).filter((c): c is GrammarChapterSummary => !!c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grammarChapters, seed]);

  // Per-bucket "completed today" counts, for the target-complete message.
  const idiomsDone = todaysIdioms.filter(i => learnedIdiomSet.has(i.id)).length;
  const wordsDone = todaysWords.filter(w => !!progress.vocab[wordKey(w)]?.learned).length;
  const grammarDone = todaysGrammar.filter(c => grammarCompletedSet.has(c.slug)).length;

  const today = todayKey();
  const allDailyDone =
    !loading &&
    todaysIdioms.length > 0 &&
    todaysWords.length > 0 &&
    idiomsDone === todaysIdioms.length &&
    wordsDone === todaysWords.length;

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
    markCelebratedToday(today);
  }, [markCelebratedToday, today]);

  useEffect(() => {
    if (allDailyDone && progress.lastActiveDate !== today) {
      setStreak(progress.streak + 1);
      markCelebratedToday(today);
      // small delay so the last card's "mark learned" animation settles first
      const t = setTimeout(() => setShowCelebration(true), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDailyDone]);

  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <HomeDesktop
        challenge={challenge}
        todaysIdioms={todaysIdioms}
        todaysWords={todaysWords}
        todaysGrammar={todaysGrammar}
        loading={loading}
        progress={progress}
        toggleIdiomLearned={toggleIdiomLearned}
        toggleIdiomBookmark={toggleIdiomBookmark}
        toggleGrammarComplete={toggleGrammarComplete}
        setWord={setWord}
        wordKey={wordKey}
        challengeScenario={challengeScenario}
        showCelebration={showCelebration}
        onDismissCelebration={dismissCelebration}
      />
    );
  }

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: 'var(--paper)' }}>
      {/* Header */}
      <div style={{ overflow: 'hidden', maxHeight: uiVisible ? '80px' : '0', transition: 'max-height 0.3s ease', flexShrink: 0 }}>
      <header
        className="flex items-center justify-between px-5 py-3"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[11px] grid place-items-center font-serif text-xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(140deg, var(--saffron), var(--saffron-deep))' }}
          >
            બ
          </div>
          <div>
            <h1 className="font-serif text-[17px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
              Bolo English
            </h1>
            <p className="text-[11px] font-guj" style={{ color: 'var(--ink-soft)' }}>
              તમારે અંગ્રેજી બોલવાનો સાથ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--teal-soft)] text-[var(--teal)] transition-all active:scale-95 hover:opacity-90"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            <ProgressIcon className="w-3.5 h-3.5" />
            <span>Progress</span>
          </button>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }}
          >
            🔥 <span>{progress.streak}</span>
          </div>
        </div>
      </header>
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-5 pb-2">
        {/* Greeting */}
        <div className="mb-5">
          <h2 className="font-serif text-2xl font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
            Today's lesson
          </h2>
          <p className="font-guj text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            આજનો અભ્યાસ — થોડું થોડું, દરરોજ.
          </p>
        </div>

        {/* Daily Challenge */}
        {challenge && (
          <div
            className="rounded-[18px] p-5 mb-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--teal) 0%, #155f53 100%)' }}
          >
            <p className="text-[10.5px] font-bold uppercase tracking-widest mb-1 opacity-80 text-white">
              Today's Challenge
            </p>
            <h3 className="font-serif text-xl font-semibold text-white mt-1 mb-1 leading-snug">
              {challengeScenario?.title ?? 'Daily Practice'}
            </h3>
            <p className="text-[13px] text-white opacity-90 leading-relaxed mb-3">
              {challenge.prompt}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {challenge.target_phrases.map(p => (
                <span key={p} className="text-[11px] px-2.5 py-1 rounded-full font-medium text-white"
                  style={{ background: 'rgba(255,255,255,0.18)' }}>
                  "{p}"
                </span>
              ))}
            </div>
            <button
              onClick={() => challengeScenario && navigate(`/practice/${challengeScenario.id}`, { state: { scenario: challengeScenario } })}
              className="relative z-10 text-sm font-bold px-4 py-2.5 rounded-xl transition-transform active:scale-95"
              style={{ background: 'var(--card)', color: 'var(--teal)' }}
            >
              Start speaking →
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--ink-soft)' }}>
            Loading today's lesson…
          </div>
        ) : (
          <>
            {/* Today's Idioms */}
            <Section
              title="Today's Idioms"
              done={idiomsDone}
              total={todaysIdioms.length}
              onSeeAll={() => navigate('/idioms')}
            >
              {todaysIdioms.length === 0 ? (
                <AllDone label="idioms" onGo={() => navigate('/idioms')} />
              ) : (
                <div className="space-y-2.5">
                  {idiomsDone === todaysIdioms.length && (
                    <TargetComplete label="idioms" onSeeAll={() => navigate('/idioms')} />
                  )}
                  {todaysIdioms.map(i => (
                    <DailyItemCard
                      key={i.id}
                      emoji="💬"
                      accent="teal"
                      title={i.idiom}
                      subtitle={`${i.category} · ${i.difficulty}`}
                      meaningEn={i.english_meaning}
                      meaningGu={i.gujarati_meaning}
                      example={i.examples?.[0]}
                      read={learnedIdiomSet.has(i.id)}
                      onToggleRead={() => toggleIdiomLearned(i.id)}
                      idiom={i}
                      bookmarked={idiomBookmarkSet.has(i.id)}
                      onToggleBookmark={() => toggleIdiomBookmark(i.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Today's Words */}
            <Section
              title="Today's Words"
              done={wordsDone}
              total={todaysWords.length}
              onSeeAll={() => navigate('/vocabulary')}
            >
              {todaysWords.length === 0 ? (
                <AllDone label="words" onGo={() => navigate('/vocabulary')} />
              ) : (
                <div className="space-y-2.5">
                  {wordsDone === todaysWords.length && (
                    <TargetComplete label="words" onSeeAll={() => navigate('/vocabulary')} />
                  )}
                  {todaysWords.map(w => {
                    const key = wordKey(w);
                    return (
                      <DailyItemCard
                        key={key}
                        emoji="📖"
                        accent="amber"
                        title={w.word}
                        subtitle={`${w.category} · ${w.part_of_speech}`}
                        meaningEn={w.english_meaning}
                        meaningGu={w.gujarati_meaning}
                        example={w.examples?.[0]}
                        read={!!progress.vocab[key]?.learned}
                        onToggleRead={() => setWord(key, { learned: !progress.vocab[key]?.learned })}
                        word={w}
                        wordBookmarked={!!progress.vocab[key]?.bookmarked}
                        onToggleWordBookmark={() => setWord(key, { bookmarked: !progress.vocab[key]?.bookmarked })}
                      />
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Today's Grammar */}
            <Section
              title="Today's Grammar"
              done={grammarDone}
              total={todaysGrammar.length}
              onSeeAll={() => navigate('/grammar')}
            >
              {todaysGrammar.length === 0 ? (
                <AllDone label="grammar chapters" onGo={() => navigate('/grammar')} />
              ) : (
                <div className="space-y-2.5">
                  {grammarDone === todaysGrammar.length && (
                    <TargetComplete label="grammar" onSeeAll={() => navigate('/grammar')} />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {todaysGrammar.map(ch => (
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
              )}
            </Section>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => navigate('/dialogues')}
                className="text-left rounded-[15px] p-4 transition-all active:scale-[.97]"
                style={{ background: 'var(--teal-soft)', border: '1px solid var(--line)' }}
              >
                <div className="text-2xl mb-2">💬</div>
                <h4 className="text-[14px] font-bold leading-tight" style={{ color: 'var(--teal)' }}>
                  Dialogues
                </h4>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                  Read real conversations aloud
                </p>
              </button>
              <button
                onClick={() => navigate('/flashcards')}
                className="text-left rounded-[15px] p-4 transition-all active:scale-[.97]"
                style={{ background: 'var(--amber-soft)', border: '1px solid var(--line)' }}
              >
                <div className="text-2xl mb-2">🃏</div>
                <h4 className="text-[14px] font-bold leading-tight" style={{ color: 'var(--saffron-deep)' }}>
                  Flashcards
                </h4>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                  Learn words with quick cards
                </p>
              </button>
            </div>
          </>
        )}
      </div>

      <ScrollToTop targetRef={scrollRef} />
      <BottomNav active="home" visible={uiVisible} />

      {showCelebration && (
        <DailyCelebration streak={progress.streak} onDismiss={dismissCelebration} />
      )}
    </div>
  );
}

/** Section header (title + done/total progress + "See all") wrapping its content. */
function Section({
  title,
  done,
  total,
  onSeeAll,
  children,
}: {
  title: string;
  done: number;
  total: number;
  onSeeAll: () => void;
  children: React.ReactNode;
}) {
  const allDone = total > 0 && done === total;
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
            {title}
          </h3>
          {total > 0 && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--paper-2)',
                color: allDone ? 'var(--teal)' : 'var(--ink-soft)',
              }}
            >
              {done}/{total}
            </span>
          )}
        </div>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)' }}
        >
          See all →
        </button>
      </div>
      {children}
    </div>
  );
}

/** Shown above the cards once every one of today's items in a bucket is read. */
function TargetComplete({ label, onSeeAll }: { label: string; onSeeAll: () => void }) {
  return (
    <div
      className="rounded-[15px] p-4 flex items-center gap-3"
      style={{ background: 'var(--teal-soft)', border: '1px solid var(--line)' }}
    >
      <span className="text-2xl flex-shrink-0">🎉</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold" style={{ color: 'var(--teal)' }}>
          Today's {label} target is completed!
        </p>
        <button
          onClick={onSeeAll}
          className="text-[12px] font-semibold mt-0.5 transition-opacity hover:opacity-70"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', padding: 0 }}
        >
          See all {label} →
        </button>
      </div>
    </div>
  );
}

/** Full-screen celebration overlay shown once per day when all daily tasks are done. */
function DailyCelebration({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-[28px] p-8 flex flex-col items-center text-center overflow-hidden"
        style={{ background: 'var(--card)', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Confetti dots decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[28px]">
          {['top-3 left-5', 'top-6 right-8', 'top-12 left-1/3', 'top-2 right-1/4',
            'bottom-10 left-6', 'bottom-6 right-10', 'bottom-14 left-1/2'].map((pos, i) => (
            <span
              key={i}
              className={`absolute w-2 h-2 rounded-full opacity-60 ${pos}`}
              style={{ background: ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#ef4444','#06b6d4'][i] }}
            />
          ))}
        </div>

        {/* Trophy */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
        >
          <span className="text-4xl">🏆</span>
        </div>

        <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
          Day Complete!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
          You've finished all of today's vocabulary and idioms. Amazing work!
        </p>

        {/* Streak badge */}
        <div
          className="flex items-center gap-3 px-6 py-4 rounded-2xl mb-6 w-full justify-center"
          style={{ background: 'var(--amber-soft)' }}
        >
          <span className="text-3xl">🔥</span>
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--saffron-deep)', opacity: 0.7 }}>
              Current Streak
            </p>
            <p className="font-serif text-3xl font-bold leading-none" style={{ color: 'var(--saffron-deep)' }}>
              {streak} {streak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--teal), #155f53)' }}
        >
          Keep it up! 💪
        </button>
      </div>
    </div>
  );
}

/** Friendly "all caught up" state when a daily pool is empty (nothing left to learn). */
function AllDone({ label, onGo }: { label: string; onGo: () => void }) {
  return (
    <button
      onClick={onGo}
      className="w-full text-left rounded-[15px] p-4 transition-all active:scale-[.98]"
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
        🎉 You've read every one of the {label}!
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
        Explore the full library →
      </p>
    </button>
  );
}

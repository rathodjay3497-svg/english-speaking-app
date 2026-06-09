import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ScrollToTop from '../components/ScrollToTop';
import { useAutoHide } from '../hooks/useAutoHide';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { idiomsApi, progressApi, scenariosApi, conversationsApi, vocabularyApi } from '../services/api';
import type { Progress, Idiom, ConversationSummary, Scenario, VocabIndex } from '../types';
import ProgressDesktop from './ProgressDesktop';

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon, bar, barColor }: {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  bar?: number;
  barColor?: string;
}) {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between h-40 border border-outline-variant/10 shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</span>
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <div>
        <span className="text-4xl font-bold text-on-surface font-serif">{value}</span>
        {unit && <span className="text-sm text-on-surface-variant ml-1">{unit}</span>}
      </div>
      {bar !== undefined && barColor && (
        <div className="w-full bg-surface-dim rounded-full h-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(bar, 100)}%`, background: barColor }} />
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ type, title, category, difficulty, onRemove, onTap }: {
  type: 'idiom' | 'conversation';
  title: string;
  category: string;
  difficulty: string;
  onRemove: () => void;
  onTap: () => void;
}) {
  const isIdiom = type === 'idiom';
  const diffColor = difficulty.toLowerCase() === 'advanced'
    ? 'bg-secondary/10 text-secondary'
    : difficulty.toLowerCase() === 'intermediate'
    ? 'bg-tertiary-container/10 text-tertiary'
    : 'bg-primary/10 text-primary';

  return (
    <div
      className="bg-white rounded-xl p-4 flex gap-4 items-center border border-outline-variant/10 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onTap}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIdiom ? 'bg-secondary-container/20' : 'bg-primary-container/20'}`}>
        <span className={`material-symbols-outlined ${isIdiom ? 'text-secondary' : 'text-primary'}`}>
          {isIdiom ? 'auto_stories' : 'chat_bubble'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isIdiom ? 'text-secondary' : 'text-primary'}`}>
            {isIdiom ? 'Idiom' : 'Conversation'}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${diffColor}`}>
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
    </div>
  );
}

function DonutChart({ read, total, color, label }: {
  read: number;
  total: number;
  color: string;
  label: string;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 50); return () => clearTimeout(t); }, []);

  const pct = total > 0 ? Math.round((read / total) * 100) : 0;
  const circumference = 2 * Math.PI * 48;
  const offset = animated ? circumference - (circumference * pct) / 100 : circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" className="rotate-[-90deg]">
          <circle cx="56" cy="56" r="48" fill="none" stroke="#dddacf" strokeWidth="9" />
          <circle
            cx="56" cy="56" r="48" fill="none"
            stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl font-bold text-on-surface">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
      <p className="text-[11px] text-on-surface-variant">{read} / {total} read</p>
    </div>
  );
}

// ── Resolved bookmark shape ──────────────────────────────────────────────────

interface ResolvedBookmark {
  key: string;
  type: 'idiom' | 'conversation';
  title: string;
  category: string;
  difficulty: string;
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [bookmarks, setBookmarks] = useState<ResolvedBookmark[]>([]);
  const [vocabIndex, setVocabIndex] = useState<VocabIndex | null>(null);
  const [totalIdioms, setTotalIdioms] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { progress: local, toggleIdiomBookmark, toggleConvoBookmark, setStreak } = useLocalProgress();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { visible: uiVisible } = useAutoHide(scrollRef);

  const wordsLearned = Object.values(local.vocab).filter(v => v.learned).length;
  const idiomsLearned = local.learnedIdioms?.length ?? 0;
  const isDesktop = useIsDesktop();

  const clearAllBookmarks = useCallback(() => {
    [...local.idiomBookmarks].forEach(id => toggleIdiomBookmark(id));
    [...local.convoBookmarks].forEach(key => toggleConvoBookmark(key));
  }, [local.idiomBookmarks, local.convoBookmarks, toggleIdiomBookmark, toggleConvoBookmark]);

  useEffect(() => {
    const hasBookmarks = local.idiomBookmarks.length > 0 || local.convoBookmarks.length > 0;

    Promise.all([
      progressApi.get().catch(() => null),
      hasBookmarks ? idiomsApi.list().catch(() => null) : Promise.resolve(null),
      hasBookmarks ? scenariosApi.list().catch(() => null) : Promise.resolve(null),
      hasBookmarks ? conversationsApi.list().catch(() => null) : Promise.resolve(null),
      vocabularyApi.index().catch(() => null),
      idiomsApi.list().catch(() => null),
    ]).then(([prog, idiomsLib, scenarios, convos, vocabIdx, idiomsLib2]) => {
      if (prog?.current_streak != null) setStreak(prog.current_streak);
      setProgress(prog);
      setVocabIndex(vocabIdx);
      setTotalIdioms(idiomsLib2?.total_idioms ?? idiomsLib?.total_idioms ?? 0);

      const resolved: ResolvedBookmark[] = [];

      if (idiomsLib) {
        const idiomMap = new Map<number, Idiom>(idiomsLib.idioms.map(i => [i.id, i]));
        for (const id of local.idiomBookmarks) {
          const idiom = idiomMap.get(id);
          resolved.push({
            key: `idiom-${id}`,
            type: 'idiom',
            title: idiom?.idiom ?? '—',
            category: idiom?.category ?? '—',
            difficulty: idiom?.difficulty ?? 'Beginner',
          });
        }
      }

      if (convos || scenarios) {
        const convoMap = new Map<string, ConversationSummary>(
          (convos ?? []).map(c => [c.id, c])
        );
        const scenarioMap = new Map<number, Scenario>(
          (scenarios ?? []).map(s => [s.id, s])
        );
        for (const key of local.convoBookmarks) {
          if (key.startsWith('dialogue-')) {
            const id = key.replace('dialogue-', '');
            const c = convoMap.get(id);
            resolved.push({
              key,
              type: 'conversation',
              title: c?.title ?? '—',
              category: c ? c.speakers.join(' & ') : '—',
              difficulty: 'Intermediate',
            });
          } else if (key.startsWith('scenario-')) {
            const id = parseInt(key.replace('scenario-', ''), 10);
            const s = scenarioMap.get(id);
            resolved.push({
              key,
              type: 'conversation',
              title: s?.title ?? '—',
              category: s?.category ?? '—',
              difficulty: s?.difficulty ?? 'Intermediate',
            });
          }
        }
      }

      setBookmarks(resolved);
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = progress ?? {
    total_sessions: 0, total_minutes: 0, current_streak: 0,
    best_streak: 0, vocabulary_count: 0, avg_score: 0,
    level: 'beginner', recent_sessions: [],
  };

  if (isDesktop) {
    return (
      <ProgressDesktop
        loading={loading}
        stats={stats}
        wordsLearned={wordsLearned}
        idiomsLearned={idiomsLearned}
        totalIdioms={totalIdioms}
        totalWords={vocabIndex?.total_words ?? 0}
        bookmarks={bookmarks}
        onRemoveIdiomBookmark={toggleIdiomBookmark}
        onRemoveConvoBookmark={toggleConvoBookmark}
        onClearAllBookmarks={clearAllBookmarks}
      />
    );
  }

  const dayLabel = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { weekday: 'short' });

  const sessions = stats.recent_sessions.slice(0, 7);
  const maxScore = sessions.length > 0
    ? Math.max(...sessions.map((s: any) => s.overall_score ?? 0), 1)
    : 1;

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-x-hidden w-full" style={{ background: '#fff8f3' }}>
      {/* AppBar */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 h-16"
        style={{ background: '#fff8f3', borderBottom: '1px solid rgba(191,201,197,0.2)' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="hover:bg-surface-container-low transition-colors rounded-full p-2 flex items-center justify-center active:scale-95"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-serif text-xl font-bold text-primary">Bolo English</h1>
        </div>
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm bg-surface-container-low flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-on-surface-variant mt-16">
          Loading…
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-20 pb-24 space-y-10">

          {/* Hero heading */}
          <section className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-on-surface">Your Learning Journey</h2>
            <p className="text-sm text-on-surface-variant">Track your growth and review your saved lessons.</p>
          </section>

          {/* Learning Distribution donuts */}
          <section className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-inner">
            <h3 className="font-serif text-lg font-semibold text-on-surface mb-6">Learning Distribution</h3>
            <div className="grid grid-cols-2 gap-6">
              <DonutChart
                read={wordsLearned}
                total={vocabIndex?.total_words ?? 160}
                color="#004f46"
                label="Vocabulary"
              />
              <DonutChart
                read={idiomsLearned}
                total={totalIdioms || 156}
                color="#924b1c"
                label="Idioms"
              />
            </div>
          </section>

          {/* Quick Stats bento */}
          <div className="grid grid-cols-1 gap-4">
            <StatCard
              label="Practice Time"
              value={Math.round(stats.total_minutes / 60)}
              unit="hours"
              icon="schedule"
              bar={Math.min((stats.total_minutes / 720) * 100, 100)}
              barColor="#004f46"
            />
            <StatCard
              label="🔥 Streak"
              value={`${stats.current_streak}`}
              unit="days"
              icon="local_fire_department"
            />
            <StatCard
              label="Average Score"
              value={stats.avg_score > 0 ? Math.round(stats.avg_score) : '—'}
              unit="/100"
              icon="star"
              bar={stats.avg_score}
              barColor="#924b1c"
            />
          </div>

          {/* Saved for Review */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-semibold text-on-surface">Saved for Review</h3>
              {bookmarks.length > 0 && (
                <button
                  onClick={clearAllBookmarks}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">No saved items yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {bookmarks.map(bm => (
                  <BookmarkCard
                    key={bm.key}
                    type={bm.type}
                    title={bm.title}
                    category={bm.category}
                    difficulty={bm.difficulty}
                    onTap={() => navigate(bm.type === 'idiom' ? '/idioms' : '/conversations')}
                    onRemove={() => {
                      if (bm.type === 'idiom') {
                        const id = parseInt(bm.key.replace('idiom-', ''), 10);
                        toggleIdiomBookmark(id);
                      } else {
                        toggleConvoBookmark(bm.key);
                      }
                      setBookmarks(prev => prev.filter(b => b.key !== bm.key));
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity bar chart */}
          {sessions.length > 0 && (
            <section className="bg-surface-container rounded-2xl p-6 space-y-4 border border-outline-variant/20 shadow-inner">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-semibold text-on-surface">Recent Activity</h3>
                <div className="flex bg-surface-dim rounded-full p-1">
                  <button className="px-4 py-1.5 rounded-full bg-white text-on-surface text-xs font-semibold shadow-sm">Week</button>
                  <button className="px-4 py-1.5 rounded-full text-on-surface-variant text-xs font-semibold">Month</button>
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {sessions.map((s: any, i: number) => {
                  const score = s.overall_score ?? 0;
                  const heightPct = Math.round((score / maxScore) * 100);
                  return (
                    <div key={s.id ?? i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        className="w-full rounded-t-lg transition-colors"
                        style={{
                          height: `${Math.max(heightPct, 8)}%`,
                          background: i === 0 ? '#004f46' : 'rgba(0,79,70,0.2)',
                        }}
                      />
                      <span className="text-[10px] text-on-surface-variant font-semibold">
                        {dayLabel(s.started_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}

      {!loading && <ScrollToTop targetRef={scrollRef} />}
      <BottomNav active="progress" visible={uiVisible} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import type { Progress } from '../types';

interface ResolvedBookmark {
  key: string;
  type: 'idiom' | 'conversation';
  title: string;
  category: string;
  difficulty: string;
}

function StatCard({ label, value, unit, icon, bar, barColor }: {
  label: string; value: string | number; unit?: string; icon: string; bar?: number; barColor?: string;
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
  type: 'idiom' | 'conversation'; title: string; category: string; difficulty: string;
  onRemove: () => void; onTap: () => void;
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
  read: number; total: number; color: string; label: string;
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
          <circle cx="56" cy="56" r="48" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
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

export interface ProgressDesktopProps {
  loading: boolean;
  stats: Progress | {
    total_sessions: number; total_minutes: number; current_streak: number;
    best_streak: number; vocabulary_count: number; avg_score: number;
    level: string; recent_sessions: any[];
  };
  wordsLearned: number;
  idiomsLearned: number;
  totalWords: number;
  totalIdioms: number;
  bookmarks: ResolvedBookmark[];
  onRemoveIdiomBookmark: (id: number) => void;
  onRemoveConvoBookmark: (key: string) => void;
  onClearAllBookmarks: () => void;
}

export default function ProgressDesktop({
  loading, stats, wordsLearned, idiomsLearned, totalWords, totalIdioms,
  bookmarks, onRemoveIdiomBookmark, onRemoveConvoBookmark, onClearAllBookmarks,
}: ProgressDesktopProps) {
  const navigate = useNavigate();

  const dayLabel = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short' });
  const sessions = stats.recent_sessions.slice(0, 7);
  const maxScore = sessions.length > 0 ? Math.max(...sessions.map((s: any) => s.overall_score ?? 0), 1) : 1;

  if (loading) {
    return (
      <DesktopLayout>
        <div className="flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant">
          Loading…
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-8">

        {/* Hero heading */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-on-surface">Your Learning Journey</h2>
            <p className="text-sm text-on-surface-variant mt-1">Track your growth and review your saved lessons.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl font-bold text-white text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #e8763a, #c8551c)' }}
          >
            Practice Now 🗣️
          </button>
        </div>

        {/* Stats row — 3 equal cards spanning full width */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard label="Practice Time" value={Math.round(stats.total_minutes / 60)} unit="hours" icon="schedule"
            bar={Math.min((stats.total_minutes / 720) * 100, 100)} barColor="#004f46" />
          <StatCard label="🔥 Streak" value={`${stats.current_streak}`} unit="days" icon="local_fire_department" />
          <StatCard label="Average Score" value={stats.avg_score > 0 ? Math.round(stats.avg_score) : '—'} unit="/100" icon="star"
            bar={stats.avg_score} barColor="#924b1c" />
        </div>

        {/* Main 3-column body */}
        <div className="grid grid-cols-12 gap-5 items-start">

          {/* Left: Learning Distribution — donuts side-by-side */}
          <div className="col-span-3 bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
            <h3 className="font-serif text-base font-semibold text-on-surface mb-5">Learning Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <DonutChart read={wordsLearned} total={totalWords || 160} color="#004f46" label="Vocabulary" />
              <DonutChart read={idiomsLearned} total={totalIdioms || 156} color="#924b1c" label="Idioms" />
            </div>
          </div>

          {/* Center: Bookmarks — fills available space */}
          <div className="col-span-6 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-base font-semibold text-on-surface">Saved for Review</h3>
              {bookmarks.length > 0 && (
                <button onClick={onClearAllBookmarks} className="text-primary text-sm font-semibold hover:underline">
                  Clear all
                </button>
              )}
            </div>
            {bookmarks.length === 0 ? (
              <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/20 flex flex-col items-center gap-3 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">bookmark_border</span>
                <p className="text-sm text-on-surface-variant">No saved items yet.<br/>Bookmark idioms and conversations to review them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
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
                        onRemoveIdiomBookmark(parseInt(bm.key.replace('idiom-', ''), 10));
                      } else {
                        onRemoveConvoBookmark(bm.key);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Recent Activity */}
          <div className="col-span-3 bg-surface-container rounded-2xl p-5 border border-outline-variant/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-base font-semibold text-on-surface">Recent Activity</h3>
              <div className="flex bg-surface-dim rounded-full p-0.5">
                <button className="px-3 py-1 rounded-full bg-white text-on-surface text-[10px] font-semibold shadow-sm">Week</button>
                <button className="px-3 py-1 rounded-full text-on-surface-variant text-[10px] font-semibold">Month</button>
              </div>
            </div>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">bar_chart</span>
                <p className="text-xs text-on-surface-variant">No sessions yet.<br/>Complete a practice to see your activity.</p>
              </div>
            ) : (
              <div className="h-44 flex items-end justify-between gap-1.5">
                {sessions.map((s: any, i: number) => {
                  const score = s.overall_score ?? 0;
                  const heightPct = Math.round((score / maxScore) * 100);
                  return (
                    <div key={s.id ?? i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-t-md transition-colors"
                        style={{
                          height: `${Math.max(heightPct, 6)}%`,
                          background: i === 0 ? '#004f46' : 'rgba(0,79,70,0.2)',
                        }}
                      />
                      <span className="text-[9px] text-on-surface-variant font-semibold">{dayLabel(s.started_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </DesktopLayout>
  );
}

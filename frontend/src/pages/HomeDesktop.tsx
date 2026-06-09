import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../components/DesktopLayout';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { DailyChallenge, GrammarChapterSummary, Idiom, Scenario, VocabWord } from '../types';

interface HomeDesktopProps {
  challenge: DailyChallenge | null;
  todaysIdioms: Idiom[];
  todaysWords: VocabWord[];
  todaysGrammar: GrammarChapterSummary[];
  loading: boolean;
  progress: any;
  toggleIdiomLearned: (id: number) => void;
  toggleIdiomBookmark: (id: number) => void;
  toggleGrammarComplete: (slug: string) => void;
  setWord: (key: string, data: object) => void;
  wordKey: (w: VocabWord) => string;
  challengeScenario: Scenario | null;
  showCelebration: boolean;
  onDismissCelebration: () => void;
}

export default function HomeDesktop({
  challenge,
  todaysIdioms,
  todaysWords,
  todaysGrammar,
  loading,
  progress,
  toggleIdiomLearned,
  toggleIdiomBookmark,
  toggleGrammarComplete,
  setWord,
  wordKey,
  challengeScenario,
  showCelebration,
  onDismissCelebration,
}: HomeDesktopProps) {
  const navigate = useNavigate();
  const { speak, isSpeaking } = useSpeechSynthesis();
  const [listeningFor, setListeningFor] = useState<string | null>(null);
  const [heard, setHeard] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<boolean | null>(null);
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      if (!listeningFor) return;
      const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
      const t = normalize(listeningFor);
      const h = normalize(transcript);
      const ok = h === t || h.includes(t) || t.includes(h);
      setHeard(transcript);
      setMatchResult(ok);
    },
  });
  const idiomBookmarkSet = new Set<number>(progress.idiomBookmarks ?? []);

  if (loading) {
    return (
      <DesktopLayout activeTab="home">
        <div className="flex-grow flex items-center justify-center min-h-[300px] text-sm text-on-surface-variant font-bold font-serif">
          Loading today's lesson…
        </div>
      </DesktopLayout>
    );
  }

  return (
    <>
    <DesktopLayout activeTab="home">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        {/* Hero Section: Today's Challenge */}
        {challenge && (
          <section className="bg-primary text-on-primary rounded-xl p-stack-md md:p-stack-lg flex flex-col-reverse md:flex-row gap-gutter overflow-hidden relative isolate">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #ffffff 0%, transparent 50%)' }}></div>
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary-fixed/20 text-primary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm w-fit mb-stack-sm">
                <span className="material-symbols-outlined text-sm">today</span>
                Daily Lesson
              </div>
              <h1 className="font-display-lg text-display-lg mb-stack-sm leading-tight font-serif">
                {challengeScenario?.title ?? 'Mastering Small Talk'}
              </h1>
              <p className="font-body-lg text-body-lg text-primary-fixed-dim mb-stack-md max-w-md leading-relaxed">
                {challenge.prompt}
              </p>
              <div className="flex flex-wrap gap-2 mb-stack-md">
                {challenge.target_phrases.map((phrase) => (
                  <span 
                    key={phrase} 
                    className="text-[12px] px-3 py-1 rounded-full font-medium text-white bg-white/10 border border-white/10"
                  >
                    "{phrase}"
                  </span>
                ))}
              </div>
              <button 
                onClick={() => challengeScenario && navigate(`/practice/${challengeScenario.id}`, { state: { scenario: challengeScenario } })}
                className="bg-secondary text-on-secondary px-8 py-3.5 rounded-full font-label-sm text-label-sm w-fit uppercase tracking-wider hover:bg-secondary-container transition-all active:scale-95 shadow-sm cursor-pointer font-bold"
              >
                Begin Challenge
              </button>
            </div>
            <div className="w-full md:w-5/12 h-64 md:h-auto rounded-lg overflow-hidden relative z-10 shadow-sm border border-white/10">
              <img 
                alt="Today's challenge graphic" 
                className="w-full h-full object-cover" 
                src="/meeting_new_colleague.png"
              />
            </div>
          </section>
        )}

        {/* Bento/Grid Layout for Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Main 8-column layout (Idioms and Words) */}
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            {/* Today's Idioms Section */}
            <section>
              <div className="flex items-center justify-between mb-stack-md border-b border-outline-variant/20 pb-2">
                <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-3 font-serif">
                  <span className="material-symbols-outlined text-3xl">auto_stories</span>
                  Today's Idioms
                </h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                  {todaysIdioms.length} Phrases
                </span>
              </div>

              {todaysIdioms.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-6 text-center border border-outline-variant/10">
                  <p className="font-body-md text-on-surface-variant">All idioms for today completed!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-stack-sm">
                  {todaysIdioms.map((idiom, idx) => {
                    const isLearned = (progress.learnedIdioms ?? []).includes(idiom.id);
                    return (
                      <details 
                        key={idiom.id} 
                        className="bg-surface-container-lowest rounded-lg border border-primary/10 shadow-sm group hover:border-primary/30 transition-colors"
                        open={idx === 0}
                      >
                        <summary className="flex items-center justify-between p-stack-sm cursor-pointer font-title-md text-title-md text-on-surface hover:bg-primary/5 transition-colors rounded-t-lg group-open:rounded-b-none group-open:bg-primary/5 outline-none select-none">
                          <div className="flex items-center gap-stack-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleIdiomLearned(idiom.id);
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                isLearned 
                                  ? 'bg-primary border-primary text-white' 
                                  : 'bg-primary-fixed/20 border-primary/10 text-primary hover:bg-primary/10'
                              }`}
                            >
                              {isLearned ? (
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                              ) : (
                                <span className="font-label-sm text-label-sm">{idx + 1}</span>
                              )}
                            </button>
                            <span className={isLearned ? 'line-through text-on-surface-variant' : ''}>
                              {idiom.idiom}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-300 group-open:rotate-180">
                            expand_more
                          </span>
                        </summary>
                        <div className="p-stack-sm pt-0 border-t border-outline-variant/10 bg-surface-container-lowest rounded-b-lg space-y-3">
                          <p className="font-body-md text-body-md text-on-surface-variant mt-3 leading-relaxed">
                            {idiom.english_meaning}
                          </p>
                          {idiom.gujarati_meaning && (
                            <p className="font-body-md text-body-md text-primary italic">
                              {idiom.gujarati_meaning}
                            </p>
                          )}
                          {idiom.examples && idiom.examples.length > 0 && (
                            <div className="space-y-2">
                              {idiom.examples.map((ex, ei) => (
                                <div key={ei} className="p-3 bg-surface-container-low rounded-md border-l-4 border-primary">
                                  <p className="font-body-md text-body-md text-on-surface italic">"{ex}"</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-1">
                            <div className="flex gap-3">
                              <button
                                onClick={() => speak(idiom.idiom)}
                                disabled={isSpeaking}
                                className="text-secondary font-label-sm text-label-sm uppercase hover:text-secondary-container transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 font-bold"
                              >
                                <span className="material-symbols-outlined text-sm">volume_up</span> Pronounce
                              </button>
                              {isSupported && (
                                <button
                                  onClick={() => {
                                    if (isListening && listeningFor === idiom.idiom) { stopListening(); return; }
                                    setHeard(null); setMatchResult(null);
                                    setListeningFor(idiom.idiom);
                                    startListening();
                                  }}
                                  disabled={isSpeaking}
                                  className="text-secondary font-label-sm text-label-sm uppercase hover:text-secondary-container transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 font-bold"
                                >
                                  <span className="material-symbols-outlined text-sm">{isListening && listeningFor === idiom.idiom ? 'stop' : 'mic'}</span>
                                  {isListening && listeningFor === idiom.idiom ? 'Stop' : 'Speak'}
                                </button>
                              )}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleIdiomBookmark(idiom.id); }}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-none"
                              style={{ color: idiomBookmarkSet.has(idiom.id) ? 'var(--saffron-deep)' : 'var(--on-surface-variant)', background: 'var(--surface-container)' }}
                            >
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: idiomBookmarkSet.has(idiom.id) ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                            </button>
                          </div>
                          {isListening && listeningFor === idiom.idiom && (
                            <p className="text-xs text-secondary">Listening…</p>
                          )}
                          {matchResult !== null && listeningFor === idiom.idiom && (
                            <p className="text-xs font-medium" style={{ color: matchResult ? 'var(--teal)' : '#c0392b' }}>
                              {matchResult ? '✓ Great pronunciation!' : `Heard: "${heard}" — try again`}
                            </p>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Today's Words Section */}
            <section>
              <div className="flex items-center justify-between mb-stack-md border-b border-outline-variant/20 pb-2">
                <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-3 font-serif">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                  Today's Words
                </h2>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                  {todaysWords.length} Words
                </span>
              </div>

              {todaysWords.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-6 text-center border border-outline-variant/10">
                  <p className="font-body-md text-on-surface-variant">All words for today completed!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-sm">
                  {todaysWords.map((word) => {
                    const key = wordKey(word);
                    const isLearned = !!progress.vocab[key]?.learned;
                    return (
                      <article
                        key={key}
                        className={`bg-surface-container-lowest border rounded-xl p-stack-md flex flex-col gap-base transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5 ${
                          isLearned ? 'border-primary/40 bg-surface-container-low/40' : 'border-primary/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                                {word.part_of_speech}
                              </span>
                              {word.difficulty && (
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                                  style={
                                    word.difficulty === 'Advanced' ? { background: 'var(--rose-soft)', color: '#c0392b' }
                                    : word.difficulty === 'Intermediate' ? { background: 'var(--amber-soft)', color: 'var(--saffron-deep)' }
                                    : { background: 'var(--teal-soft)', color: 'var(--teal)' }
                                  }>
                                  {word.difficulty}
                                </span>
                              )}
                            </div>
                            <h3 className={`font-title-md text-title-md text-on-background font-serif ${isLearned ? 'line-through opacity-75' : ''}`}>
                              {word.word}
                            </h3>
                          </div>
                          <button
                            onClick={() => setWord(key, { learned: !isLearned })}
                            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                              isLearned
                                ? 'bg-primary border-primary text-white'
                                : 'bg-surface border-outline-variant/50 text-outline hover:text-primary hover:border-primary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          </button>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">{word.english_meaning}</p>
                        {word.gujarati_meaning && (
                          <p className="font-body-md text-body-md text-on-surface-variant italic border-l-2 border-outline-variant/30 pl-3">
                            {word.gujarati_meaning}
                          </p>
                        )}
                        {word.examples && word.examples.length > 0 && (
                          <div className="space-y-2">
                            {word.examples.map((ex, ei) => (
                              <div key={ei} className="bg-surface-variant/30 rounded-lg p-3">
                                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block mb-1">Example:</span>
                                <p className="font-body-md text-body-md text-on-background italic">"{ex}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {word.synonyms && word.synonyms.length > 0 && (
                          <div>
                            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1.5">Synonyms</p>
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
                            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1.5">Antonyms</p>
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
                            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1.5">Collocations</p>
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
                            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1.5">Word Forms</p>
                            <div className="flex flex-wrap gap-1.5">
                              {word.word_forms.map(f => (
                                <span key={f} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: 'var(--surface-container)', color: 'var(--on-surface)' }}>{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {word.memory_tip && (
                          <div className="rounded-lg p-3" style={{ background: 'var(--amber-soft)' }}>
                            <p className="font-label-sm text-label-sm uppercase tracking-wider mb-1" style={{ color: 'var(--saffron-deep)' }}>Memory Tip</p>
                            <p className="text-[12px] leading-relaxed text-on-background">{word.memory_tip}</p>
                          </div>
                        )}
                        {word.usage_note && (
                          <div className="rounded-lg p-3 bg-surface-container-low">
                            <p className="font-label-sm text-label-sm uppercase tracking-wider mb-1 text-outline">Usage Note</p>
                            <p className="text-[12px] leading-relaxed text-on-background">{word.usage_note}</p>
                          </div>
                        )}
                        <div className="mt-auto pt-3 border-t border-outline-variant/10 flex justify-between items-center">
                          <div className="flex gap-3">
                            <button
                              onClick={() => speak(word.word)}
                              disabled={isSpeaking}
                              className="text-primary font-label-sm text-label-sm uppercase hover:underline transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">volume_up</span> Pronounce
                            </button>
                            {isSupported && (
                              <button
                                onClick={() => {
                                  if (isListening && listeningFor === word.word) { stopListening(); return; }
                                  setHeard(null); setMatchResult(null);
                                  setListeningFor(word.word);
                                  startListening();
                                }}
                                disabled={isSpeaking}
                                className="text-secondary font-label-sm text-label-sm uppercase hover:underline transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-sm">{isListening && listeningFor === word.word ? 'stop' : 'mic'}</span>
                                {isListening && listeningFor === word.word ? 'Stop' : 'Speak'}
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => setWord(key, { bookmarked: !progress.vocab[key]?.bookmarked })}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border-none"
                            style={{ color: progress.vocab[key]?.bookmarked ? 'var(--saffron-deep)' : 'var(--outline)', background: 'none' }}
                          >
                            <span className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: progress.vocab[key]?.bookmarked ? "'FILL' 1" : "'FILL' 0" }}>
                              bookmark
                            </span>
                          </button>
                        </div>
                        {matchResult !== null && listeningFor === word.word && (
                          <p className="text-xs font-medium" style={{ color: matchResult ? 'var(--teal)' : '#c0392b' }}>
                            {matchResult ? '✓ Great pronunciation!' : `Heard: "${heard}" — try again`}
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar 4-column layout (Grammar, Info graphic) */}
          <div className="lg:col-span-4 flex flex-col gap-stack-lg">
            {/* Today's Grammar Section */}
            <section className="bg-surface-container p-stack-md rounded-xl border border-outline-variant/10">
              <div className="flex items-center justify-between mb-stack-sm pb-2 border-b border-outline-variant/20">
                <h3 className="font-title-md text-title-md text-primary font-bold font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined">architecture</span>
                  Today's Grammar
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full">
                  {todaysGrammar.length} Chapters
                </span>
              </div>

              {todaysGrammar.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-on-surface-variant">All grammar for today completed!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todaysGrammar.map((chapter) => {
                    const isCompleted = (progress.grammarCompleted ?? []).includes(chapter.slug);
                    return (
                      <div 
                        key={chapter.slug}
                        className="bg-surface-container-lowest rounded-lg border border-primary/10 p-4 hover:border-primary/30 transition-colors flex justify-between items-center"
                      >
                        <div 
                          onClick={() => navigate(`/grammar/${chapter.slug}`)}
                          className="cursor-pointer flex-1 min-w-0"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                              {chapter.level}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">
                              · Chapter {chapter.order}
                            </span>
                          </div>
                          <h4 className={`font-serif text-sm font-semibold truncate leading-snug text-on-surface ${
                            isCompleted ? 'line-through opacity-70' : ''
                          }`}>
                            {chapter.title.en}
                          </h4>
                          {chapter.title.gu && (
                            <p className="text-[11px] text-primary truncate font-guj mt-0.5">
                              {chapter.title.gu}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleGrammarComplete(chapter.slug)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ml-3 shrink-0 ${
                            isCompleted 
                              ? 'bg-primary border-primary text-white' 
                              : 'bg-surface border-outline-variant/50 text-outline hover:text-primary hover:border-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Contextual Side Graphic */}
            <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant/10">
              <h3 className="font-title-md text-title-md text-primary mb-3 font-serif">Why learn idioms?</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-sm leading-relaxed">
                Idioms add color and nuance to the English language. Mastering them transforms your speech from technically correct to naturally fluent, helping you sound more like a native speaker in both social and professional contexts.
              </p>
              <div className="w-full h-32 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center mb-4 relative overflow-hidden group">
                <div 
                  className="absolute inset-0 bg-primary/10 transition-transform duration-700 group-hover:scale-105" 
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,70,53,0.05) 10px, rgba(0,70,53,0.05) 20px)' }}
                ></div>
                <span className="material-symbols-outlined text-5xl text-primary opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  forum
                </span>
              </div>
              <button 
                onClick={() => navigate('/idioms')}
                className="font-label-sm text-label-sm text-primary uppercase tracking-wide hover:underline flex items-center gap-1 w-fit cursor-pointer font-bold"
              >
                View all 150+ idioms 
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>

    {showCelebration && (
      <DailyCelebration streak={progress.streak} onDismiss={onDismissCelebration} />
    )}
  </>
  );
}

function DailyCelebration({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-md rounded-[32px] p-10 flex flex-col items-center text-center overflow-hidden"
        style={{ background: 'var(--card)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
          {['top-4 left-6', 'top-8 right-10', 'top-16 left-1/3', 'top-3 right-1/4',
            'bottom-12 left-8', 'bottom-7 right-12', 'bottom-16 left-1/2'].map((pos, i) => (
            <span
              key={i}
              className={`absolute w-2.5 h-2.5 rounded-full opacity-50 ${pos}`}
              style={{ background: ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#ef4444','#06b6d4'][i] }}
            />
          ))}
        </div>

        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-deep))' }}
        >
          <span className="text-5xl">🏆</span>
        </div>

        <h2 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
          Day Complete!
        </h2>
        <p className="text-base mb-8" style={{ color: 'var(--ink-soft)' }}>
          You've finished all of today's vocabulary and idioms. Amazing work!
        </p>

        <div
          className="flex items-center gap-4 px-8 py-5 rounded-2xl mb-8 w-full justify-center"
          style={{ background: 'var(--amber-soft)' }}
        >
          <span className="text-4xl">🔥</span>
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--saffron-deep)', opacity: 0.7 }}>
              Current Streak
            </p>
            <p className="font-serif text-4xl font-bold leading-none" style={{ color: 'var(--saffron-deep)' }}>
              {streak} {streak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--teal), #155f53)' }}
        >
          Keep it up! 💪
        </button>
      </div>
    </div>
  );
}

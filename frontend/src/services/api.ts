import axios from 'axios';
import type {
  ConversationDetail,
  ConversationSummary,
  DailyChallenge,
  EndSessionResponse,
  FlashcardDeck,
  GrammarChapter,
  GrammarIndex,
  IdiomsLibrary,
  Progress,
  Scenario,
  SendMessageResponse,
  Session,
  SessionDetail,
  VocabCategoryDetail,
  VocabIndex,
} from '../types';

// In dev, Vite proxies "/api" → localhost:8000 (see vite.config.ts).
// In production set VITE_API_BASE_URL to the deployed backend, e.g.
// "https://english-speaking-app-backend.onrender.com/api".
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api' });

// In-memory cache for static, read-only content. Lives as long as the JS
// bundle (i.e. until a full page reload), so navigating between pages reuses
// the already-fetched data instead of re-firing the same requests. Storing the
// Promise (not the resolved value) also de-duplicates concurrent in-flight
// calls — e.g. a `Promise.all` over all categories from two components that
// mount close together shares one request per key.
const cache = new Map<string, Promise<unknown>>();

function memoize<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit as Promise<T>;
  const p = fetcher().catch(err => {
    cache.delete(key); // don't cache failures — allow retry on next call
    throw err;
  });
  cache.set(key, p);
  return p;
}

export const scenariosApi = {
  list: () => memoize('scenarios:list', () => api.get<Scenario[]>('/scenarios').then(r => r.data)),
  get: (id: number) =>
    memoize(`scenarios:${id}`, () => api.get<Scenario>(`/scenarios/${id}`).then(r => r.data)),
};

export const sessionsApi = {
  start: (scenario_id: number, difficulty: string) =>
    api.post<Session>('/sessions', { scenario_id, difficulty }).then(r => r.data),

  sendMessage: (session_id: string, content: string) =>
    api
      .post<SendMessageResponse>(`/sessions/${session_id}/message`, { content })
      .then(r => r.data),

  get: (session_id: string) =>
    api.get<SessionDetail>(`/sessions/${session_id}`).then(r => r.data),

  end: (session_id: string) =>
    api.post<EndSessionResponse>(`/sessions/${session_id}/end`).then(r => r.data),
};

export const progressApi = {
  get: () => api.get<Progress>('/progress').then(r => r.data),
  dailyChallenge: () => api.get<DailyChallenge>('/daily-challenge').then(r => r.data),
};

export const idiomsApi = {
  list: () => memoize('idioms:list', () => api.get<IdiomsLibrary>('/idioms').then(r => r.data)),
};

export const vocabularyApi = {
  index: () => memoize('vocab:index', () => api.get<VocabIndex>('/vocabulary').then(r => r.data)),
  category: (id: number) =>
    memoize(`vocab:cat:${id}`, () =>
      api.get<VocabCategoryDetail>(`/vocabulary/categories/${id}`).then(r => r.data)),
};

export const conversationsApi = {
  list: () =>
    memoize('conversations:list', () =>
      api.get<ConversationSummary[]>('/conversations').then(r => r.data)),
  get: (id: string) =>
    memoize(`conversations:${id}`, () =>
      api.get<ConversationDetail>(`/conversations/${id}`).then(r => r.data)),
};

export const flashcardsApi = {
  decks: () =>
    memoize('flashcards:decks', () => api.get<FlashcardDeck[]>('/flashcards').then(r => r.data)),
};

export const grammarApi = {
  index: () => memoize('grammar:index', () => api.get<GrammarIndex>('/grammar').then(r => r.data)),
  chapter: (slug: string) =>
    memoize(`grammar:chapter:${slug}`, () =>
      api.get<GrammarChapter>(`/grammar/${slug}`).then(r => r.data)),
};

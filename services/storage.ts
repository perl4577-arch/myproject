import { Chapter, User, UserResponses, SavedResponse } from "../types";

const LS_USERS = 'qcm_users_v1';
const LS_CHAPTERS = 'qcm_chapters_v1';
const LS_AUTH = 'qcm_auth_v1';
const LS_RESPONSES = 'qcm_responses_v1';

// Helpers
export const loadJSON = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const saveJSON = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const id = () => Math.random().toString(36).slice(2, 9);
export const nowISO = () => new Date().toISOString();
export const addYearsISO = (dateISO: string, years: number) => {
  const d = new Date(dateISO);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
};

// User Service
export const getUsers = (): User[] => loadJSON(LS_USERS, []);
export const saveUsers = (users: User[]) => saveJSON(LS_USERS, users);

export const getAuthId = (): string | null => {
  return sessionStorage.getItem(LS_AUTH) || localStorage.getItem(LS_AUTH);
};

export const setAuthId = (uid: string | null, remember: boolean = true) => {
  if (!uid) {
    sessionStorage.removeItem(LS_AUTH);
    localStorage.removeItem(LS_AUTH);
    return;
  }
  if (remember) {
    localStorage.setItem(LS_AUTH, uid);
    sessionStorage.removeItem(LS_AUTH);
  } else {
    sessionStorage.setItem(LS_AUTH, uid);
    localStorage.removeItem(LS_AUTH);
  }
};

export const getCurrentUser = (): User | null => {
  const users = getUsers();
  const uid = getAuthId();
  if (!uid) return null;
  return users.find((u) => u.id === uid) || null;
};

// Response Service
export const loadAllResponses = (): Record<string, UserResponses> => loadJSON(LS_RESPONSES, {});
export const saveAllResponses = (obj: Record<string, UserResponses>) => saveJSON(LS_RESPONSES, obj);

export const getChapterResponses = (userId: string, chapterKey: string): Record<number, SavedResponse> => {
  const all = loadAllResponses();
  const userRes = all[userId] || {};
  return userRes[chapterKey] || {};
};

export const saveUserResponse = (userId: string, chapterKey: string, qIndex: number, data: SavedResponse) => {
  const all = loadAllResponses();
  if (!all[userId]) all[userId] = {};
  if (!all[userId][chapterKey]) all[userId][chapterKey] = {};
  all[userId][chapterKey][qIndex] = data;
  saveAllResponses(all);
};

// Chapter Service
export const getChapters = (): Chapter[] => {
  // Ensure default chapters exist if storage is empty
  const stored = loadJSON<Chapter[]>(LS_CHAPTERS, []);
  if (stored.length === 0) {
    const defaults = [
      { id: id(), title: 'Glucides', qcms: [] },
      { id: id(), title: 'Lipides', qcms: [] },
      { id: id(), title: 'Acides aminés, peptides et protéines', qcms: [] },
      { id: id(), title: 'Acides nucléiques', qcms: [] }
    ];
    saveJSON(LS_CHAPTERS, defaults);
    return defaults;
  }
  return stored;
};
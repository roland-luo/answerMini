import type { AnswerRecord, QuestionType, QuizMode, UserState } from "@/types/quiz";

const STORAGE_KEY = "cert-quiz-user-state-v1";
const MAX_ATTEMPTS = 500;

const defaultProgress: Record<QuestionType, number> = {
  single: 0,
  multiple: 0,
  judge: 0,
};

export function createDefaultState(): UserState {
  return {
    mode: "practice",
    progressByType: { ...defaultProgress },
    favorites: [],
    wrongs: {},
    attempts: [],
  };
}

function normalizeState(value: Partial<UserState> | null | undefined): UserState {
  const fallback = createDefaultState();
  const safeValue = value ?? {};
  return {
    mode: safeValue.mode === "exam" ? "exam" : "practice",
    progressByType: {
      ...fallback.progressByType,
      ...(safeValue.progressByType ?? {}),
    },
    favorites: Array.isArray(safeValue.favorites) ? safeValue.favorites : [],
    wrongs: safeValue.wrongs && typeof safeValue.wrongs === "object" ? safeValue.wrongs : {},
    attempts: Array.isArray(safeValue.attempts) ? safeValue.attempts : [],
  };
}

export function getUserState(): UserState {
  try {
    const value = uni.getStorageSync(STORAGE_KEY) as Partial<UserState> | "";
    if (!value) {
      return createDefaultState();
    }
    return normalizeState(value);
  } catch (error) {
    console.warn("读取学习记录失败", error);
    return createDefaultState();
  }
}

export function saveUserState(state: UserState): void {
  uni.setStorageSync(STORAGE_KEY, normalizeState(state));
}

export function clearUserState(): void {
  uni.removeStorageSync(STORAGE_KEY);
}

export function setQuizMode(mode: QuizMode): UserState {
  const state = getUserState();
  state.mode = mode;
  saveUserState(state);
  return state;
}

export function toggleFavorite(questionId: number): UserState {
  const state = getUserState();
  const exists = state.favorites.includes(questionId);
  state.favorites = exists
    ? state.favorites.filter((id) => id !== questionId)
    : [questionId, ...state.favorites];
  saveUserState(state);
  return state;
}

export function recordAnswer(record: AnswerRecord): UserState {
  const state = getUserState();
  state.attempts = [record, ...state.attempts.filter((item) => item.questionId !== record.questionId)].slice(
    0,
    MAX_ATTEMPTS,
  );

  if (record.correct) {
    delete state.wrongs[String(record.questionId)];
  } else {
    state.wrongs[String(record.questionId)] = record;
  }

  saveUserState(state);
  return state;
}

export function updateProgress(type: QuestionType, index: number): UserState {
  const state = getUserState();
  state.progressByType[type] = Math.max(index, 0);
  saveUserState(state);
  return state;
}

export function getTodayStats(state = getUserState()): { total: number; correct: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const attempts = state.attempts.filter((item) => item.answeredAt >= start);
  return {
    total: attempts.length,
    correct: attempts.filter((item) => item.correct).length,
  };
}

export function getOverallStats(state = getUserState()): { total: number; correct: number } {
  return {
    total: state.attempts.length,
    correct: state.attempts.filter((item) => item.correct).length,
  };
}

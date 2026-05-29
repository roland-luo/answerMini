export type QuestionType = "single" | "multiple" | "judge";

export type QuizMode = "practice" | "exam";

export type ExamSize = 10 | 100;

export interface QuizOption {
  label: string;
  text: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  typeLabel: string;
  stem: string;
  options: QuizOption[];
  answer: string[];
  answerText: string;
  rawAnswer: string;
}

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  softColor: string;
}

export interface AnswerRecord {
  questionId: number;
  type: QuestionType;
  mode: QuizMode;
  selected: string[];
  correct: boolean;
  answeredAt: number;
}

export interface UserState {
  mode: QuizMode;
  progressByType: Record<QuestionType, number>;
  favorites: number[];
  wrongs: Record<string, AnswerRecord>;
  attempts: AnswerRecord[];
}

export const questionTypeMetas: QuestionTypeMeta[] = [
  {
    type: "single",
    label: "单选题",
    shortLabel: "单选",
    icon: "checkmark-circle",
    color: "#2f7df6",
    softColor: "#eaf2ff",
  },
  {
    type: "multiple",
    label: "多选题",
    shortLabel: "多选",
    icon: "checkbox-mark",
    color: "#18b884",
    softColor: "#e8f8f2",
  },
  {
    type: "judge",
    label: "判断题",
    shortLabel: "判断",
    icon: "edit-pen",
    color: "#f59e0b",
    softColor: "#fff7e6",
  },
];

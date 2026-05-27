import questions from "@/data/questions";
import {
  questionTypeMetas,
  type Question,
  type QuestionType,
  type QuestionTypeMeta,
} from "@/types/quiz";

export const allQuestions = questions;

export function getQuestionTypeMeta(type: QuestionType): QuestionTypeMeta {
  return questionTypeMetas.find((item) => item.type === type) ?? questionTypeMetas[0];
}

export function getQuestionsByType(type: QuestionType): Question[] {
  return allQuestions.filter((question) => question.type === type);
}

export function getQuestionById(id: number): Question | undefined {
  return allQuestions.find((question) => question.id === id);
}

export function getQuestionsByIds(ids: number[]): Question[] {
  const idSet = new Set(ids);
  return allQuestions.filter((question) => idSet.has(question.id));
}

export function getQuestionCountByType(type: QuestionType): number {
  return getQuestionsByType(type).length;
}

export function normalizeAnswer(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

export function isAnswerCorrect(question: Question, selected: string[]): boolean {
  const answer = normalizeAnswer(question.answer);
  const userAnswer = normalizeAnswer(selected);
  return answer.length === userAnswer.length && answer.every((item, index) => item === userAnswer[index]);
}

export function formatPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 100);
}

export function formatSelectedAnswer(selected: string[]): string {
  return selected.length > 0 ? normalizeAnswer(selected).join("、") : "未作答";
}

export function getTotalQuestionCount(): number {
  return allQuestions.length;
}

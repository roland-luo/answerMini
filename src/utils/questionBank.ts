import questions from "@/data/questions";
import {
  questionTypeMetas,
  type ExamSize,
  type Question,
  type QuestionType,
  type QuestionTypeMeta,
} from "@/types/quiz";

export const allQuestions = questions;

const examQuotas: Record<ExamSize, Record<QuestionType, number>> = {
  10: {
    single: 4,
    multiple: 2,
    judge: 4,
  },
  100: {
    single: 40,
    multiple: 20,
    judge: 40,
  },
};

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

export function getRandomExamQuestions(size: ExamSize): Question[] {
  const quota = examQuotas[size];
  const selected = questionTypeMetas.flatMap((meta) =>
    shuffleQuestions(getQuestionsByType(meta.type)).slice(0, quota[meta.type]),
  );
  return shuffleQuestions(selected);
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

function shuffleQuestions(items: Question[]): Question[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]];
  }
  return shuffled;
}

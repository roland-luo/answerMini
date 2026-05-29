<template>
  <view class="page">
    <AppHeader :title="headerTitle" :subtitle="headerSubtitle" show-back>
      <button v-if="currentQuestion" class="favorite-button" hover-class="favorite-button--hover" @click="toggleCurrentFavorite">
        <u-icon :name="isCurrentFavorite ? 'star-fill' : 'star'" size="22" :color="isCurrentFavorite ? '#f59e0b' : '#6b7688'" />
      </button>
    </AppHeader>

    <view v-if="currentQuestion" class="quiz-shell">
      <view class="progress-row">
        <text class="progress-text"><text class="progress-current">{{ currentIndex + 1 }}</text>/{{ questionList.length }}</text>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </view>
        <text class="mode-chip">{{ mode === "practice" ? "练习模式" : "模拟模式" }}</text>
      </view>

      <view class="question-card">
        <view class="question-labels">
          <text class="type-label">{{ currentQuestion.typeLabel }}</text>
          <text class="question-id">#{{ currentQuestion.id }}</text>
        </view>
        <text class="question-stem">{{ currentQuestion.stem }}</text>

        <view class="options">
          <button
            v-for="option in currentQuestion.options"
            :key="option.label"
            class="option"
            :class="optionClass(option)"
            hover-class="option--hover"
            @click="selectOption(option)"
          >
            <view class="option-mark">
              <u-icon v-if="isOptionSelected(option)" name="checkbox-mark" size="16" color="#ffffff" />
              <text v-else>{{ option.label }}</text>
            </view>
            <text class="option-text">{{ option.text }}</text>
          </button>
        </view>

        <view v-if="shouldRevealAnswer" class="answer-panel" :class="{ 'answer-panel--right': currentIsCorrect }">
          <view class="answer-panel-head">
            <u-icon :name="currentIsCorrect ? 'checkmark-circle-fill' : 'close-circle-fill'" size="20" :color="currentIsCorrect ? '#18b884' : '#ef4444'" />
            <text>{{ currentIsCorrect ? "回答正确" : "回答错误" }}</text>
          </view>
          <text class="answer-line">正确答案：{{ currentQuestion.answerText }}</text>
          <text class="answer-line">你的答案：{{ formatCurrentSelection() }}</text>
        </view>
      </view>

      <view v-if="examFinished" class="result-card">
        <text class="result-title">模拟结果</text>
        <text class="result-score">{{ examCorrectCount }}/{{ questionList.length }}</text>
        <text class="result-subtitle">正确率 {{ examAccuracy }}%，错题已写入错题本</text>
      </view>
    </view>

    <view v-else class="empty-state">
      <u-empty text="暂无题目" mode="data" />
    </view>

    <view v-if="currentQuestion" class="footer-actions">
      <button class="footer-icon" hover-class="footer-hover" @click="toggleCurrentFavorite">
        <u-icon :name="isCurrentFavorite ? 'star-fill' : 'star'" size="23" :color="isCurrentFavorite ? '#f59e0b' : '#6b7688'" />
        <text>收藏</text>
      </button>
      <button class="secondary-button" :disabled="currentIndex === 0" hover-class="footer-hover" @click="prevQuestion">
        上一题
      </button>
      <button class="primary-button" hover-class="footer-hover" @click="primaryAction">
        {{ primaryButtonText }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import AppHeader from "@/components/AppHeader.vue";
import {
  formatPercent,
  formatSelectedAnswer,
  getQuestionsByIds,
  getQuestionsByType,
  isAnswerCorrect,
  getQuestionTypeMeta,
  getRandomExamQuestions,
} from "@/utils/questionBank";
import { getUserState, recordAnswer, toggleFavorite, updateProgress } from "@/utils/storage";
import type { ExamSize, Question, QuizMode, QuestionType, QuizOption } from "@/types/quiz";

type QueryValue = string | string[] | undefined;

const mode = ref<QuizMode>("practice");
const questionType = ref<QuestionType>("single");
const examSize = ref<ExamSize | null>(null);
const questionList = ref<Question[]>([]);
const currentIndex = ref(0);
const selectedById = ref<Record<string, string[]>>({});
const submittedById = ref<Record<string, boolean>>({});
const favorites = ref<number[]>([]);
const examFinished = ref(false);
const examCorrectCount = ref(0);
const canUpdateProgress = ref(false);

const currentQuestion = computed(() => questionList.value[currentIndex.value]);
const meta = computed(() => getQuestionTypeMeta(currentQuestion.value?.type ?? questionType.value));
const isExamMode = computed(() => mode.value === "exam");
const headerTitle = computed(() => (isExamMode.value ? "模拟考试" : currentQuestion.value ? meta.value.label : "答题"));
const headerSubtitle = computed(() => `${mode.value === "practice" ? "练习" : "模拟"} · ${questionList.value.length} 题`);
const progressPercent = computed(() => formatPercent(currentIndex.value + 1, Math.max(questionList.value.length, 1)));
const isCurrentFavorite = computed(() => (currentQuestion.value ? favorites.value.includes(currentQuestion.value.id) : false));
const currentSelected = computed(() => selectedById.value[String(currentQuestion.value?.id ?? "")] ?? []);
const currentSubmitted = computed(() => submittedById.value[String(currentQuestion.value?.id ?? "")] ?? false);
const shouldRevealAnswer = computed(() => mode.value === "practice" ? currentSubmitted.value : examFinished.value);
const currentIsCorrect = computed(() =>
  currentQuestion.value ? isAnswerCorrect(currentQuestion.value, currentSelected.value) : false,
);
const examAccuracy = computed(() => formatPercent(examCorrectCount.value, questionList.value.length));
const primaryButtonText = computed(() => {
  if (mode.value === "exam") {
    return currentIndex.value === questionList.value.length - 1 ? "交卷" : "下一题";
  }
  return currentSubmitted.value ? "下一题" : "提交答案";
});

initQuiz();

onLoad((query) => {
  initQuiz(query);
});

function initQuiz(query?: Record<string, QueryValue>) {
  const state = getUserState();
  const pageQuery = readPageQuery(query);

  favorites.value = state.favorites;
  mode.value = readMode(pageQuery.mode);
  examSize.value = mode.value === "exam" ? readExamSize(pageQuery.examSize) : null;
  currentIndex.value = 0;
  selectedById.value = {};
  submittedById.value = {};
  examFinished.value = false;
  examCorrectCount.value = 0;
  canUpdateProgress.value = false;

  const source = readString(pageQuery.source);
  const ids = parseIds(readString(pageQuery.ids));
  const type = readQuestionType(pageQuery.type);
  questionType.value = type;

  if (ids.length > 0) {
    questionList.value = getQuestionsByIds(ids);
  } else if (source === "wrong") {
    questionList.value = getQuestionsByIds(Object.keys(state.wrongs).map(Number));
  } else if (source === "favorite") {
    questionList.value = getQuestionsByIds(state.favorites);
  } else if (mode.value === "exam") {
    questionList.value = getRandomExamQuestions(examSize.value ?? 10);
  } else {
    canUpdateProgress.value = true;
    questionList.value = getQuestionsByType(type);
    currentIndex.value = Math.min(state.progressByType[type] ?? 0, Math.max(questionList.value.length - 1, 0));
  }
}

function readPageQuery(query: Record<string, QueryValue> | undefined): Record<string, QueryValue> {
  const pageQuery: Record<string, QueryValue> = { ...(query ?? {}) };

  // #ifdef H5
  const search = window.location.hash.split("?")[1] ?? "";
  const params = new URLSearchParams(search);
  params.forEach((value, key) => {
    if (!pageQuery[key]) {
      pageQuery[key] = value;
    }
  });
  // #endif

  return pageQuery;
}

function readString(value: QueryValue): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readMode(value: QueryValue): QuizMode {
  return readString(value) === "exam" ? "exam" : "practice";
}

function readQuestionType(value: QueryValue): QuestionType {
  const raw = readString(value);
  return raw === "multiple" || raw === "judge" ? raw : "single";
}

function readExamSize(value: QueryValue): ExamSize {
  return readString(value) === "100" ? 100 : 10;
}

function parseIds(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function getOptionValue(option: QuizOption): string {
  return currentQuestion.value?.type === "judge" ? option.text : option.label;
}

function isOptionSelected(option: QuizOption): boolean {
  return currentSelected.value.includes(getOptionValue(option));
}

function isOptionCorrect(option: QuizOption): boolean {
  return currentQuestion.value?.answer.includes(getOptionValue(option)) ?? false;
}

function optionClass(option: QuizOption) {
  return {
    "option--selected": isOptionSelected(option),
    "option--correct": shouldRevealAnswer.value && isOptionCorrect(option),
    "option--wrong": shouldRevealAnswer.value && isOptionSelected(option) && !isOptionCorrect(option),
  };
}

function selectOption(option: QuizOption) {
  const question = currentQuestion.value;
  if (!question || shouldRevealAnswer.value) {
    return;
  }

  const value = getOptionValue(option);
  const key = String(question.id);
  const selected = selectedById.value[key] ?? [];

  if (question.type === "multiple") {
    selectedById.value[key] = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
  } else {
    selectedById.value[key] = [value];
  }
}

function ensureSelected(): boolean {
  if (currentSelected.value.length > 0) {
    return true;
  }
  uni.showToast({ title: "请选择答案", icon: "none" });
  return false;
}

function primaryAction() {
  if (mode.value === "exam") {
    if (!ensureSelected()) {
      return;
    }
    if (currentIndex.value === questionList.value.length - 1) {
      finishExam();
    } else {
      nextQuestion();
    }
    return;
  }

  if (!currentSubmitted.value) {
    submitPracticeAnswer();
    return;
  }
  nextQuestion();
}

function submitPracticeAnswer() {
  const question = currentQuestion.value;
  if (!question || !ensureSelected()) {
    return;
  }

  const correct = isAnswerCorrect(question, currentSelected.value);
  submittedById.value[String(question.id)] = true;
  recordAnswer({
    questionId: question.id,
    type: question.type,
    mode: mode.value,
    selected: [...currentSelected.value],
    correct,
    answeredAt: Date.now(),
  });

  if (canUpdateProgress.value) {
    updateProgress(question.type, Math.min(currentIndex.value + 1, questionList.value.length));
  }

  favorites.value = getUserState().favorites;
}

function finishExam() {
  let correctCount = 0;

  questionList.value.forEach((question) => {
    const selected = selectedById.value[String(question.id)] ?? [];
    const correct = isAnswerCorrect(question, selected);
    if (correct) {
      correctCount += 1;
    }
    recordAnswer({
      questionId: question.id,
      type: question.type,
      mode: mode.value,
      selected,
      correct,
      answeredAt: Date.now(),
    });
  });

  const firstQuestion = questionList.value[0];
  if (firstQuestion && canUpdateProgress.value) {
    updateProgress(firstQuestion.type, questionList.value.length);
  }

  examCorrectCount.value = correctCount;
  examFinished.value = true;
  favorites.value = getUserState().favorites;
}

function nextQuestion() {
  if (currentIndex.value < questionList.value.length - 1) {
    currentIndex.value += 1;
  } else {
    uni.showToast({ title: "已到最后一题", icon: "none" });
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
}

function toggleCurrentFavorite() {
  const question = currentQuestion.value;
  if (!question) {
    return;
  }
  favorites.value = toggleFavorite(question.id).favorites;
}

function formatCurrentSelection(): string {
  return formatSelectedAnswer(currentSelected.value);
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 0 28rpx 156rpx;
  background: #f5f8fb;
}

.favorite-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(31, 43, 66, 0.06);
}

.favorite-button--hover,
.footer-hover,
.option--hover {
  opacity: 0.75;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.progress-text {
  min-width: 92rpx;
  color: #6b7688;
  font-size: 26rpx;
  font-weight: 800;
}

.progress-current {
  color: #2f7df6;
  font-size: 34rpx;
}

.progress-track {
  flex: 1;
  height: 8rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #e4eaf2;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
  background: #2f7df6;
}

.mode-chip {
  padding: 8rpx 16rpx;
  border: 1rpx solid #c8ecdf;
  border-radius: 999rpx;
  color: #18a06f;
  background: #effbf6;
  font-size: 22rpx;
  font-weight: 800;
}

.question-card,
.result-card {
  padding: 28rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 48rpx rgba(31, 43, 66, 0.06);
}

.question-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.type-label {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  color: #2f7df6;
  background: #eaf2ff;
  font-size: 23rpx;
  font-weight: 900;
}

.question-id {
  color: #9aa6b8;
  font-size: 23rpx;
  font-weight: 700;
}

.question-stem {
  display: block;
  color: #162033;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 50rpx;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 28rpx;
}

.option {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 20rpx;
  min-height: 84rpx;
  padding: 22rpx;
  border: 1rpx solid #dfe7f1;
  border-radius: 16rpx;
  background: #ffffff;
  text-align: left;
}

.option-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38rpx;
  width: 38rpx;
  height: 38rpx;
  border: 2rpx solid #c7d0dd;
  border-radius: 10rpx;
  color: #46556a;
  font-size: 22rpx;
  font-weight: 900;
}

.option-text {
  flex: 1;
  min-width: 0;
  color: #273247;
  font-size: 28rpx;
  font-weight: 650;
  line-height: 40rpx;
}

.option--selected {
  border-color: #8fb9ff;
  background: #f1f6ff;
}

.option--selected .option-mark {
  border-color: #2f7df6;
  background: #2f7df6;
  color: #ffffff;
}

.option--correct {
  border-color: #9be6c7;
  background: #eefbf6;
}

.option--correct .option-mark {
  border-color: #18b884;
  background: #18b884;
  color: #ffffff;
}

.option--wrong {
  border-color: #ffc5c5;
  background: #fff1f1;
}

.option--wrong .option-mark {
  border-color: #ef4444;
  background: #ef4444;
  color: #ffffff;
}

.answer-panel {
  margin-top: 28rpx;
  padding: 22rpx;
  border: 1rpx solid #ffc9c9;
  border-radius: 16rpx;
  background: #fff2f2;
}

.answer-panel--right {
  border-color: #a8ebcf;
  background: #effbf6;
}

.answer-panel-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: #162033;
  font-size: 28rpx;
  font-weight: 900;
}

.answer-line {
  display: block;
  margin-top: 14rpx;
  color: #46556a;
  font-size: 25rpx;
  font-weight: 700;
}

.result-card {
  margin-top: 24rpx;
  text-align: center;
}

.result-title,
.result-score,
.result-subtitle {
  display: block;
}

.result-title {
  color: #162033;
  font-size: 30rpx;
  font-weight: 900;
}

.result-score {
  margin-top: 14rpx;
  color: #2f7df6;
  font-size: 54rpx;
  font-weight: 900;
}

.result-subtitle {
  margin-top: 8rpx;
  color: #6b7688;
  font-size: 24rpx;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 620rpx;
}

.footer-actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 112rpx 1fr 1.45fr;
  gap: 18rpx;
  align-items: center;
  padding: 18rpx 28rpx calc(env(safe-area-inset-bottom) + 18rpx);
  border-top: 1rpx solid #e8eef6;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -12rpx 32rpx rgba(31, 43, 66, 0.06);
}

.footer-icon,
.secondary-button,
.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 82rpx;
  border-radius: 16rpx;
  font-size: 27rpx;
  font-weight: 900;
}

.footer-icon {
  flex-direction: column;
  gap: 4rpx;
  color: #6b7688;
  font-size: 22rpx;
}

.secondary-button {
  border: 1rpx solid #d8e4f2;
  color: #273247;
  background: #ffffff;
}

.secondary-button[disabled] {
  color: #aab4c1;
  background: #f1f4f8;
}

.primary-button {
  color: #ffffff;
  background: #2f7df6;
  box-shadow: 0 14rpx 28rpx rgba(47, 125, 246, 0.22);
}
</style>

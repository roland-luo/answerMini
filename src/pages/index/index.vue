<template>
  <view class="page">
    <AppHeader title="职考刷题" subtitle="C证复训题库 · 本地练习" />

    <view class="summary-card">
      <view class="summary-top">
        <text class="section-title">今日学习</text>
        <text class="summary-time">共 {{ totalQuestions }} 题</text>
      </view>
      <view class="summary-grid">
        <view class="metric">
          <view class="metric-icon metric-icon--blue">
            <u-icon name="edit-pen" size="24" color="#2f7df6" />
          </view>
          <view>
            <text class="metric-value">{{ today.total }}</text>
            <text class="metric-label">今日做题</text>
          </view>
        </view>
        <view class="metric">
          <view class="metric-icon metric-icon--green">
            <u-icon name="checkmark-circle" size="24" color="#18b884" />
          </view>
          <view>
            <text class="metric-value">{{ accuracy }}%</text>
            <text class="metric-label">正确率</text>
          </view>
        </view>
      </view>
      <button class="primary-action" hover-class="primary-action--hover" @tap="continuePractice">
        <u-icon name="play-right-fill" size="18" color="#ffffff" />
        <text>继续练习</text>
      </button>
    </view>

    <view class="mode-switch">
      <button
        class="mode-button"
        :class="{ 'mode-button--active': mode === 'practice' }"
        @tap="changeMode('practice')"
      >
        练习
      </button>
      <button class="mode-button" :class="{ 'mode-button--active': mode === 'exam' }" @tap="changeMode('exam')">
        模拟
      </button>
    </view>

    <view class="section-head">
      <text class="section-title">题型练习</text>
      <text class="section-meta">按现有题库分组</text>
    </view>

    <view class="type-list">
      <button
        v-for="item in typeCards"
        :key="item.meta.type"
        class="type-card"
        hover-class="type-card--hover"
        @tap="startType(item.meta.type)"
      >
        <view class="type-icon" :style="{ background: item.meta.softColor }">
          <u-icon :name="item.meta.icon" size="25" :color="item.meta.color" />
        </view>
        <view class="type-main">
          <view class="type-row">
            <text class="type-title">{{ item.meta.label }}</text>
            <text class="type-count">{{ item.done }}/{{ item.total }} 题</text>
          </view>
          <view class="progress-track">
            <view class="progress-fill" :style="{ width: item.percent + '%', background: item.meta.color }" />
          </view>
        </view>
        <u-icon name="arrow-right" size="18" color="#9aa6b8" />
      </button>
    </view>

    <AppTabBar active="home" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppHeader from "@/components/AppHeader.vue";
import AppTabBar from "@/components/AppTabBar.vue";
import { getQuestionCountByType, getQuestionsByType, getTotalQuestionCount, formatPercent } from "@/utils/questionBank";
import { getTodayStats, getUserState, setQuizMode } from "@/utils/storage";
import { questionTypeMetas, type QuestionType, type QuizMode, type UserState } from "@/types/quiz";

const state = ref<UserState>(getUserState());

const mode = computed(() => state.value.mode);
const today = computed(() => getTodayStats(state.value));
const accuracy = computed(() => formatPercent(today.value.correct, today.value.total));
const totalQuestions = getTotalQuestionCount();

const typeCards = computed(() =>
  questionTypeMetas.map((meta) => {
    const total = getQuestionCountByType(meta.type);
    const done = Math.min(state.value.progressByType[meta.type] ?? 0, total);
    return {
      meta,
      total,
      done,
      percent: formatPercent(done, total),
    };
  }),
);

onShow(() => {
  state.value = getUserState();
});

function changeMode(nextMode: QuizMode) {
  state.value = setQuizMode(nextMode);
}

function startType(type: QuestionType) {
  uni.navigateTo({ url: `/pages/quiz/index?type=${type}&mode=${mode.value}` });
}

function continuePractice() {
  const target =
    typeCards.value.find((item) => item.done > 0 && item.done < item.total) ??
    typeCards.value.find((item) => item.done < item.total) ??
    typeCards.value[0];
  startType(target.meta.type);
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 0 28rpx 148rpx;
  background: #f5f8fb;
}

.summary-card {
  padding: 28rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 48rpx rgba(31, 43, 66, 0.07);
}

.summary-top,
.section-head,
.type-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  color: #162033;
  font-size: 30rpx;
  font-weight: 800;
}

.summary-time,
.section-meta,
.type-count {
  color: #6b7688;
  font-size: 24rpx;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-top: 28rpx;
}

.metric {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 18rpx;
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 38rpx;
}

.metric-icon--blue {
  background: #eaf2ff;
}

.metric-icon--green {
  background: #e8f8f2;
}

.metric-value {
  display: block;
  color: #162033;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 48rpx;
}

.metric-label {
  display: block;
  margin-top: 6rpx;
  color: #6b7688;
  font-size: 23rpx;
}

.primary-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10rpx;
  height: 88rpx;
  margin-top: 30rpx;
  border-radius: 14rpx;
  background: #2f7df6;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  box-shadow: 0 18rpx 36rpx rgba(47, 125, 246, 0.24);
}

.primary-action--hover,
.type-card--hover {
  opacity: 0.78;
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8rpx;
  height: 84rpx;
  margin: 28rpx 0;
  padding: 8rpx;
  border: 1rpx solid #e3eaf3;
  border-radius: 16rpx;
  background: #ffffff;
}

.mode-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  color: #46556a;
  font-size: 28rpx;
  font-weight: 700;
}

.mode-button--active {
  background: #2f7df6;
  color: #ffffff;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 18rpx;
}

.type-card {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 20rpx;
  min-height: 112rpx;
  padding: 22rpx 22rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 18rpx;
  background: #ffffff;
}

.type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70rpx;
  height: 70rpx;
  border-radius: 18rpx;
}

.type-main {
  flex: 1;
  min-width: 0;
}

.type-title {
  color: #162033;
  font-size: 28rpx;
  font-weight: 800;
}

.progress-track {
  height: 8rpx;
  margin-top: 16rpx;
  overflow: hidden;
  border-radius: 10rpx;
  background: #eef3f8;
}

.progress-fill {
  height: 100%;
  border-radius: 10rpx;
}
</style>

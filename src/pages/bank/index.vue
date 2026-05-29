<template>
  <view class="page">
    <AppHeader title="题库" subtitle="按单选、多选、判断三类刷题" />

    <view class="bank-overview">
      <view>
        <text class="overview-value">{{ totalQuestions }}</text>
        <text class="overview-label">题库总题量</text>
      </view>
      <view class="overview-split" />
      <view>
        <text class="overview-value">{{ answeredCount }}</text>
        <text class="overview-label">已练习题数</text>
      </view>
    </view>

    <view class="bank-list">
      <view v-for="item in typeCards" :key="item.meta.type" class="bank-card">
        <view class="bank-card-head">
          <view class="type-icon" :style="{ background: item.meta.softColor }">
            <u-icon :name="item.meta.icon" size="26" :color="item.meta.color" />
          </view>
          <view class="type-copy">
            <text class="type-title">{{ item.meta.label }}</text>
            <text class="type-subtitle">{{ item.total }} 题 · 已完成 {{ item.done }} 题</text>
          </view>
          <text class="type-percent">{{ item.percent }}%</text>
        </view>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: item.percent + '%', background: item.meta.color }" />
        </view>
        <view class="bank-actions">
          <button class="ghost-button" hover-class="button-hover" @click="startType(item.meta.type)">
            练习
          </button>
        </view>
      </view>
    </view>

    <AppTabBar active="bank" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppHeader from "@/components/AppHeader.vue";
import AppTabBar from "@/components/AppTabBar.vue";
import { formatPercent, getQuestionCountByType, getTotalQuestionCount } from "@/utils/questionBank";
import { getUserState } from "@/utils/storage";
import { questionTypeMetas, type QuestionType, type UserState } from "@/types/quiz";

const state = ref<UserState>(getUserState());
const totalQuestions = getTotalQuestionCount();

const answeredCount = computed(() =>
  Math.min(
    Object.values(state.value.progressByType).reduce((sum, count) => sum + count, 0),
    totalQuestions,
  ),
);

const typeCards = computed(() =>
  questionTypeMetas.map((meta) => {
    const total = getQuestionCountByType(meta.type);
    const done = Math.min(state.value.progressByType[meta.type] ?? 0, total);
    return { meta, total, done, percent: formatPercent(done, total) };
  }),
);

onShow(() => {
  state.value = getUserState();
});

function startType(type: QuestionType) {
  uni.navigateTo({ url: `/pages/quiz/index?type=${type}&mode=practice` });
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 0 28rpx 148rpx;
  background: #f5f8fb;
}

.bank-overview {
  display: grid;
  grid-template-columns: 1fr 1rpx 1fr;
  align-items: center;
  padding: 28rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 48rpx rgba(31, 43, 66, 0.06);
}

.overview-split {
  height: 74rpx;
  background: #e8eef6;
}

.overview-value,
.overview-label {
  display: block;
  text-align: center;
}

.overview-value {
  color: #162033;
  font-size: 46rpx;
  font-weight: 900;
}

.overview-label {
  margin-top: 8rpx;
  color: #6b7688;
  font-size: 24rpx;
}

.bank-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-top: 28rpx;
}

.bank-card {
  padding: 26rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 20rpx;
  background: #ffffff;
}

.bank-card-head {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 20rpx;
}

.type-copy {
  flex: 1;
  min-width: 0;
}

.type-title {
  display: block;
  color: #162033;
  font-size: 30rpx;
  font-weight: 800;
}

.type-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #6b7688;
  font-size: 24rpx;
}

.type-percent {
  color: #2f7df6;
  font-size: 30rpx;
  font-weight: 900;
}

.progress-track {
  height: 10rpx;
  margin-top: 24rpx;
  overflow: hidden;
  border-radius: 10rpx;
  background: #eef3f8;
}

.progress-fill {
  height: 100%;
  border-radius: 10rpx;
}

.bank-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18rpx;
  margin-top: 24rpx;
}

.ghost-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 76rpx;
  border-radius: 14rpx;
  font-size: 27rpx;
  font-weight: 800;
}

.ghost-button {
  border: 1rpx solid #d8e4f2;
  color: #2f7df6;
  background: #ffffff;
}

.button-hover {
  opacity: 0.75;
}
</style>

<template>
  <view class="page">
    <AppHeader title="错题" subtitle="错题本和收藏题都保存在本地" />

    <view class="segmented">
      <button class="segment" :class="{ 'segment--active': activeKind === 'wrong' }" @tap="activeKind = 'wrong'">
        错题本
      </button>
      <button class="segment" :class="{ 'segment--active': activeKind === 'favorite' }" @tap="activeKind = 'favorite'">
        收藏题
      </button>
    </view>

    <view v-if="visibleQuestions.length > 0" class="list-head">
      <text class="list-title">{{ activeKind === "wrong" ? "待复习错题" : "已收藏题目" }}</text>
      <button class="review-button" hover-class="button-hover" @tap="reviewAll">开始重做</button>
    </view>

    <view v-if="visibleQuestions.length > 0" class="question-list">
      <button
        v-for="question in visibleQuestions"
        :key="question.id"
        class="question-card"
        hover-class="question-card--hover"
        @tap="openQuestion(question.id)"
      >
        <view class="question-top">
          <text class="question-type">{{ question.typeLabel }}</text>
          <text class="question-id">#{{ question.id }}</text>
        </view>
        <text class="question-stem">{{ question.stem }}</text>
        <text class="question-answer">正确答案：{{ question.answerText }}</text>
      </button>
    </view>

    <view v-else class="empty-state">
      <u-empty :text="activeKind === 'wrong' ? '暂无错题' : '暂无收藏'" mode="list" />
    </view>

    <AppTabBar active="wrong" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppHeader from "@/components/AppHeader.vue";
import AppTabBar from "@/components/AppTabBar.vue";
import { getQuestionsByIds } from "@/utils/questionBank";
import { getUserState } from "@/utils/storage";
import type { UserState } from "@/types/quiz";

const state = ref<UserState>(getUserState());
const activeKind = ref<"wrong" | "favorite">("wrong");

const visibleQuestions = computed(() => {
  const ids =
    activeKind.value === "wrong" ? Object.keys(state.value.wrongs).map(Number) : state.value.favorites;
  return getQuestionsByIds(ids);
});

onShow(() => {
  state.value = getUserState();
});

function reviewAll() {
  const source = activeKind.value === "wrong" ? "wrong" : "favorite";
  uni.navigateTo({ url: `/pages/quiz/index?source=${source}&mode=practice` });
}

function openQuestion(id: number) {
  uni.navigateTo({ url: `/pages/quiz/index?ids=${id}&mode=practice` });
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 0 28rpx 148rpx;
  background: #f5f8fb;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8rpx;
  height: 84rpx;
  padding: 8rpx;
  border: 1rpx solid #e3eaf3;
  border-radius: 16rpx;
  background: #ffffff;
}

.segment {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  color: #46556a;
  font-size: 28rpx;
  font-weight: 800;
}

.segment--active {
  background: #2f7df6;
  color: #ffffff;
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 28rpx 0 18rpx;
}

.list-title {
  color: #162033;
  font-size: 30rpx;
  font-weight: 800;
}

.review-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: 30rpx;
  background: #eaf2ff;
  color: #2f7df6;
  font-size: 24rpx;
  font-weight: 800;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.question-card {
  display: block;
  width: 100%;
  min-height: 184rpx;
  padding: 24rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 18rpx;
  background: #ffffff;
  text-align: left;
}

.question-card--hover,
.button-hover {
  opacity: 0.75;
}

.question-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14rpx;
}

.question-type {
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  background: #eaf2ff;
  color: #2f7df6;
  font-size: 22rpx;
  font-weight: 800;
}

.question-id {
  color: #9aa6b8;
  font-size: 22rpx;
}

.question-stem {
  display: -webkit-box;
  overflow: hidden;
  color: #162033;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 42rpx;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.question-answer {
  display: block;
  margin-top: 14rpx;
  color: #18a06f;
  font-size: 24rpx;
  font-weight: 700;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 520rpx;
}
</style>

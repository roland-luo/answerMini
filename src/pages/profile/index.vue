<template>
  <view class="page">
    <AppHeader title="我的" subtitle="学习数据仅保存在本机" />

    <view class="profile-card">
      <view class="avatar">
        <u-icon name="account-fill" size="34" color="#2f7df6" />
      </view>
      <view class="profile-copy">
        <text class="profile-title">本地学习档案</text>
        <text class="profile-subtitle">无需登录，打开即可刷题</text>
      </view>
    </view>

    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value">{{ overall.total }}</text>
        <text class="stat-label">累计做题</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ overallAccuracy }}%</text>
        <text class="stat-label">累计正确率</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ wrongCount }}</text>
        <text class="stat-label">错题数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ favoriteCount }}</text>
        <text class="stat-label">收藏题</text>
      </view>
    </view>

    <view class="settings-list">
      <view class="setting-row">
        <view>
          <text class="setting-title">题库来源</text>
          <text class="setting-subtitle">C证复训题库解析.xlsx · 1000题</text>
        </view>
      </view>
      <view class="setting-row">
        <view>
          <text class="setting-title">当前模式</text>
          <text class="setting-subtitle">{{ state.mode === "practice" ? "练习模式" : "模拟模式" }}</text>
        </view>
      </view>
      <button class="danger-row" hover-class="danger-row--hover" @tap="confirmClear">
        <text>清空本地学习记录</text>
        <u-icon name="trash" size="18" color="#ef4444" />
      </button>
    </view>

    <AppTabBar active="profile" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import AppHeader from "@/components/AppHeader.vue";
import AppTabBar from "@/components/AppTabBar.vue";
import { formatPercent } from "@/utils/questionBank";
import { clearUserState, getOverallStats, getUserState } from "@/utils/storage";
import type { UserState } from "@/types/quiz";

const state = ref<UserState>(getUserState());

const overall = computed(() => getOverallStats(state.value));
const overallAccuracy = computed(() => formatPercent(overall.value.correct, overall.value.total));
const wrongCount = computed(() => Object.keys(state.value.wrongs).length);
const favoriteCount = computed(() => state.value.favorites.length);

onShow(() => {
  state.value = getUserState();
});

function confirmClear() {
  uni.showModal({
    title: "清空学习记录",
    content: "错题、收藏、进度和答题记录都会被清空，题库不会删除。",
    confirmText: "清空",
    confirmColor: "#ef4444",
    success(result) {
      if (result.confirm) {
        clearUserState();
        state.value = getUserState();
        uni.showToast({ title: "已清空", icon: "success" });
      }
    },
  });
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 0 28rpx 148rpx;
  background: #f5f8fb;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 28rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 18rpx 48rpx rgba(31, 43, 66, 0.06);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #eaf2ff;
}

.profile-copy {
  flex: 1;
  min-width: 0;
}

.profile-title {
  display: block;
  color: #162033;
  font-size: 32rpx;
  font-weight: 900;
}

.profile-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #6b7688;
  font-size: 24rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  margin-top: 24rpx;
}

.stat-card {
  padding: 26rpx;
  border: 1rpx solid #e8eef6;
  border-radius: 18rpx;
  background: #ffffff;
}

.stat-value,
.stat-label {
  display: block;
}

.stat-value {
  color: #162033;
  font-size: 42rpx;
  font-weight: 900;
}

.stat-label {
  margin-top: 8rpx;
  color: #6b7688;
  font-size: 24rpx;
}

.settings-list {
  margin-top: 24rpx;
  overflow: hidden;
  border: 1rpx solid #e8eef6;
  border-radius: 18rpx;
  background: #ffffff;
}

.setting-row,
.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 108rpx;
  padding: 22rpx 26rpx;
  border-bottom: 1rpx solid #edf2f7;
  text-align: left;
}

.setting-row:last-child,
.danger-row:last-child {
  border-bottom: 0;
}

.setting-title,
.setting-subtitle {
  display: block;
}

.setting-title {
  color: #162033;
  font-size: 28rpx;
  font-weight: 800;
}

.setting-subtitle {
  margin-top: 8rpx;
  color: #6b7688;
  font-size: 23rpx;
}

.danger-row {
  width: 100%;
  color: #ef4444;
  font-size: 28rpx;
  font-weight: 800;
}

.danger-row--hover {
  opacity: 0.72;
}
</style>

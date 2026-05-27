<template>
  <view class="app-header">
    <button v-if="showBack" class="header-back" hover-class="header-back--hover" @tap="goBack">
      <u-icon name="arrow-left" size="22" color="#172033" />
    </button>
    <view class="header-copy">
      <text class="header-title">{{ title }}</text>
      <text v-if="subtitle" class="header-subtitle">{{ subtitle }}</text>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    showBack?: boolean;
  }>(),
  {
    subtitle: "",
    showBack: false,
  },
);

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.redirectTo({ url: "/pages/index/index" });
  }
}
</script>

<style scoped lang="scss">
.app-header {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 116rpx;
  padding: calc(var(--status-bar-height) + 18rpx) 32rpx 20rpx;
  background: #f5f8fb;
}

.header-copy {
  flex: 1;
  min-width: 0;
}

.header-title {
  display: block;
  color: #162033;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 44rpx;
}

.header-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #6b7688;
  font-size: 24rpx;
  line-height: 32rpx;
}

.header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-right: 12rpx;
  border-radius: 32rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(31, 43, 66, 0.06);
}

.header-back--hover {
  opacity: 0.75;
}
</style>

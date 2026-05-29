<template>
  <view class="tabbar-shell">
    <button
      v-for="item in items"
      :key="item.key"
      class="tabbar-item"
      :class="{ 'tabbar-item--active': item.key === active }"
      hover-class="tabbar-item--hover"
      @click="go(item.url)"
    >
      <u-icon :name="item.icon" size="22" :color="item.key === active ? '#2f7df6' : '#6b7688'" />
      <text>{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  active: "home" | "bank" | "wrong" | "profile";
}>();

const items = [
  { key: "home", label: "首页", icon: "home", url: "/pages/index/index" },
  { key: "bank", label: "题库", icon: "grid", url: "/pages/bank/index" },
  { key: "wrong", label: "错题", icon: "star", url: "/pages/wrong/index" },
  { key: "profile", label: "我的", icon: "account", url: "/pages/profile/index" },
] as const;

function go(url: string) {
  uni.redirectTo({ url });
}
</script>

<style scoped lang="scss">
.tabbar-shell {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 12rpx 18rpx calc(env(safe-area-inset-bottom) + 12rpx);
  border-top: 1rpx solid #e8eef6;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -12rpx 32rpx rgba(31, 43, 66, 0.06);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 6rpx;
  min-width: 0;
  height: 82rpx;
  color: #6b7688;
  font-size: 22rpx;
  font-weight: 600;
}

.tabbar-item--active {
  color: #2f7df6;
}

.tabbar-item--hover {
  opacity: 0.7;
}
</style>

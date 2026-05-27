<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("职考刷题启动");
});
onShow(() => {
  console.log("职考刷题显示");
});
onHide(() => {
  console.log("职考刷题隐藏");
});
</script>
<style lang="scss">
@import "uview-plus/index.scss";

page {
  min-height: 100%;
  background: #f5f8fb;
  color: #162033;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

view,
text,
button {
  box-sizing: border-box;
}

button {
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
  line-height: 1;
}

button::after {
  border: 0;
}
</style>

<template>
  <view class="profile">
    <!-- 顶部背景装饰 -->
    <view class="bg-decoration"></view>

    <ProfileNav></ProfileNav>
    <ProfileForm></ProfileForm>
  </view>
</template>

<script lang="ts" setup>
  import ProfileForm from './components/ProfileForm/ProfileForm.vue'
  import ProfileNav from './components/ProfileNav/ProfileNav.vue'
</script>

<style scoped lang="scss">
  .profile {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f7f8fa;
    width: 100%;

    /* 顶部背景装饰 */
    .bg-decoration {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 50vh;
      background: linear-gradient(180deg, #8db9e9 10%, #f7f8fa 100%);
      z-index: 0;
    }
  }
</style>

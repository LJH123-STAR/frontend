<template>
  <el-container class="layout-container">
    <!-- 桌面端侧边栏 (大屏幕可见) -->
    <el-aside width="240px" class="sidebar hidden-xs-only">
      <div class="logo">
        <el-icon :size="28"><Headset /></el-icon>
        <span>AI法理编曲</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#fff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/compose">
          <el-icon><Edit /></el-icon>
          <span>智能编曲工作台</span>
        </el-menu-item>
        <el-menu-item index="/review">
          <el-icon><UserFilled /></el-icon>
          <span>三方审核工作台</span>
        </el-menu-item>
        <el-menu-item index="/library">
          <el-icon><FolderOpened /></el-icon>
          <span>普法资源库</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 移动端抽屉菜单 (小屏幕可见) -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="240px"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="logo" style="margin-bottom: 20px;">
        <el-icon :size="28"><Headset /></el-icon>
        <span>AI法理编曲</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#fff"
        @select="drawerVisible = false"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <el-menu-item index="/compose">
          <el-icon><Edit /></el-icon>
          <span>智能编曲工作台</span>
        </el-menu-item>
        <el-menu-item index="/review">
          <el-icon><UserFilled /></el-icon>
          <span>三方审核工作台</span>
        </el-menu-item>
        <el-menu-item index="/library">
          <el-icon><FolderOpened /></el-icon>
          <span>普法资源库</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <el-container>
      <!-- 顶部栏：移动端显示菜单按钮，桌面端隐藏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button class="hidden-sm-and-up" type="text" @click="drawerVisible = true" style="margin-right: 16px;">
            <el-icon :size="24"><Menu /></el-icon>
          </el-button>
          <span class="header-title">{{ $route.meta.title }}</span>
        </div>
        <div class="header-user">
          <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="hidden-xs-only" style="margin-left: 8px;">管理员</span>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
const drawerVisible = ref(false)
</script>

<style scoped>
/* 全局布局 */
.layout-container {
  height: 100%;
}

/* 桌面端侧边栏 */
.sidebar {
  background-color: #001529;
  color: white;
  height: 100%;
  overflow-y: auto;
}
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.el-menu {
  border-right: none;
}

/* 顶部栏 */
.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  border-bottom: 1px solid #f0f0f0;
  height: 56px;
}
.header-left {
  display: flex;
  align-items: center;
}
.header-title {
  font-size: 18px;
  font-weight: 500;
}
.header-user {
  display: flex;
  align-items: center;
}

/* 主内容区 */
.main-content {
  background: #f0f2f5;
  padding: 16px;
  overflow-y: auto;
  /* 移动端底部留白，避免被底部栏遮挡 */
}

/* 响应式隐藏：利用 Element Plus 的断点类 */
/* 小屏幕隐藏侧边栏，显示抽屉按钮 */
@media (max-width: 767px) {
  .header {
    padding: 0 12px;
  }
  .main-content {
    padding: 12px;
  }
}
</style>

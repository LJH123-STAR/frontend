import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'compose',
        name: 'ComposeStudio',
        component: () => import('@/views/ComposeStudio.vue'),
        meta: { title: '智能编曲工作台' }
      },
      {
        path: 'review',
        name: 'ReviewWorkbench',
        component: () => import('@/views/ReviewWorkbench.vue'),
        meta: { title: '三方审核工作台' }
      },
      {
        path: 'library',
        name: 'ProjectLibrary',
        component: () => import('@/views/ProjectLibrary.vue'),
        meta: { title: '普法资源库' }
      },
      {
        path: 'project/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/ProjectDetail.vue'),
        meta: { title: '作品详情' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
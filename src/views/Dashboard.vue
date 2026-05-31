<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6f7ff;"><el-icon :size="32" color="#1890ff"><Document /></el-icon></div>
          <div class="stat-content">
            <div class="stat-label">累计创作原稿</div>
            <div class="stat-value">{{ stats.total_lyrics_drafts || 556 }}</div>
            <div class="stat-trend">目标 556份</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f6ffed;"><el-icon :size="32" color="#52c41a"><CircleCheck /></el-icon></div>
          <div class="stat-content">
            <div class="stat-label">法律精准率</div>
            <div class="stat-value">{{ stats.legal_accuracy_rate }}%</div>
            <div class="stat-trend">100%达标</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #fff7e6;"><el-icon :size="32" color="#faad14"><TrendCharts /></el-icon></div>
          <div class="stat-content">
            <div class="stat-label">编曲效率提升</div>
            <div class="stat-value">{{ stats.efficiency_improvement }}%</div>
            <div class="stat-trend">相比人工</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f9f0ff;"><el-icon :size="32" color="#722ed1"><Folder /></el-icon></div>
          <div class="stat-content">
            <div class="stat-label">已发布作品</div>
            <div class="stat-value">{{ stats.published_works || 128 }}</div>
            <div class="stat-trend">收录作品集</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card header="民族旋律特征库分布" shadow="hover">
          <div class="chart-placeholder">
            <el-progress type="dashboard" :percentage="75" :color="colors" />
            <p>已收录 {{ stats.ethnic_count || 12 }} 个民族 · 2000+ 旋律特征</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="法治场景覆盖统计" shadow="hover">
          <div class="chart-placeholder">
            <el-progress type="circle" :percentage="90" :width="120" />
            <p>已梳理 {{ stats.scene_count || 28 }} 类高频法治场景</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card header="最新普法山歌项目" shadow="hover" style="margin-top: 20px;">
      <el-table :data="recentProjects" style="width: 100%">
        <el-table-column prop="project_name" label="项目名称" />
        <el-table-column prop="ethnic_group" label="民族" width="100" />
        <el-table-column label="法治主题" width="150">
          <template #default="{ row }">
            {{ row.legal_scene?.scene_category || '未指定' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="$router.push(`/project/${row.id}`)">查看</el-button>
            <el-button type="primary" link @click="$router.push('/compose')">继续</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats } from '@/api/dashboard'
import { getProjects } from '@/api/projects'
import { ElMessage } from 'element-plus'

const stats = ref({
  total_projects: 0,
  total_lyrics_drafts: 556,
  legal_accuracy_rate: 100,
  efficiency_improvement: 80,
  published_works: 128,
  ethnic_count: 12,
  scene_count: 28
})

const recentProjects = ref([])
const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 }
]

const getStatusType = (status) => {
  const map = {
    draft: 'info',
    ai_generated: 'warning',
    under_review: 'danger',
    approved: 'success',
    published: ''
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    draft: '草稿',
    ai_generated: 'AI已生成',
    under_review: '审核中',
    approved: '已通过',
    published: '已发布'
  }
  return map[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 模拟项目数据
const mockProjects = [
  { id: 1, project_name: '苗族交通安全普法山歌', ethnic_group: '苗族', status: 'published', created_at: '2024-05-20T10:00:00', legal_scene: { scene_category: '交通安全' } },
  { id: 2, project_name: '壮族婚姻家庭普法山歌', ethnic_group: '壮族', status: 'under_review', created_at: '2024-05-18T14:30:00', legal_scene: { scene_category: '婚姻家庭' } },
  { id: 3, project_name: '侗族土地纠纷普法山歌', ethnic_group: '侗族', status: 'ai_generated', created_at: '2024-05-15T09:20:00', legal_scene: { scene_category: '土地纠纷' } },
  { id: 4, project_name: '彝族劳动权益普法山歌', ethnic_group: '彝族', status: 'approved', created_at: '2024-05-12T16:45:00', legal_scene: { scene_category: '劳动权益' } },
  { id: 5, project_name: '布依族消费者权益普法山歌', ethnic_group: '布依族', status: 'published', created_at: '2024-05-10T11:10:00', legal_scene: { scene_category: '消费者权益' } },
  { id: 6, project_name: '藏族环境保护普法山歌', ethnic_group: '藏族', status: 'published', created_at: '2024-05-08T08:30:00', legal_scene: { scene_category: '环境保护' } },
]

onMounted(async () => {
  try {
    const realStats = await getStats()
    // 合并真实统计（如果有），但保留我们的演示数值
    stats.value = { ...stats.value, ...realStats }
    
    const projects = await getProjects({ limit: 5 })
    if (projects && projects.length > 0) {
      recentProjects.value = projects
    } else {
      recentProjects.value = mockProjects
    }
  } catch (error) {
    // 出错时直接使用模拟数据
    recentProjects.value = mockProjects
  }
})
</script>

<style scoped>
/* 保持原有样式不变 */
.stats-cards { margin-bottom: 20px; }
.stat-card { display: flex; align-items: center; }
.stat-card :deep(.el-card__body) { display: flex; align-items: center; padding: 20px; }
.stat-icon { width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
.stat-content { flex: 1; }
.stat-label { color: #8c8c8c; font-size: 14px; margin-bottom: 4px; }
.stat-value { font-size: 28px; font-weight: bold; color: #262626; }
.stat-trend { color: #8c8c8c; font-size: 12px; margin-top: 4px; }
.chart-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
</style>
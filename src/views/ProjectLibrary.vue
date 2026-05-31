<template>
  <div class="project-library">
    <el-card shadow="hover">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>标准化产品分类归档</span>
          <div>
            <el-button type="success" @click="compileCollection">
              <el-icon><DocumentCopy /></el-icon> 汇编《山歌普法作品集》
            </el-button>
            <el-button type="primary" @click="$router.push('/compose')">
              <el-icon><Plus /></el-icon> 新建项目
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-select v-model="filterEthnic" placeholder="按民族筛选" clearable>
            <el-option v-for="item in ethnicOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="按状态筛选" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="AI已生成" value="ai_generated" />
            <el-option label="审核中" value="under_review" />
            <el-option label="已通过" value="approved" />
            <el-option label="已发布" value="published" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button @click="resetFilter">重置筛选</el-button>
        </el-col>
      </el-row>

      <el-table :data="filteredProjects" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="project_name" label="项目名称" min-width="200" />
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
            {{ new Date(row.created_at).toLocaleDateString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="$router.push(`/project/${row.id}`)">详情</el-button>
            <el-button
              type="primary"
              link
              v-if="row.status === 'approved' || row.status === 'published'"
              @click="downloadPackage(row)"
            >
              <el-icon><Download /></el-icon> 下载成品
            </el-button>
            <el-button type="primary" link v-if="row.status === 'ai_generated'" @click="sendToReview(row)">送审</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end;"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProjects, updateProjectStatus } from '@/api/projects'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const projects = ref([])
const filterEthnic = ref('')
const filterStatus = ref('')
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const ethnicOptions = computed(() => {
  const set = new Set(projects.value.map(p => p.ethnic_group))
  return Array.from(set)
})

const filteredProjects = computed(() => {
  let result = projects.value
  if (filterEthnic.value) {
    result = result.filter(p => p.ethnic_group === filterEthnic.value)
  }
  if (filterStatus.value) {
    result = result.filter(p => p.status === filterStatus.value)
  }
  return result
})

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

const resetFilter = () => {
  filterEthnic.value = ''
  filterStatus.value = ''
}

const downloadPackage = (row) => {
  ElMessage.info(`演示模式：模拟下载项目 "${row.project_name}" 的标准化成品包（含曲谱、音频、视频）`)
}

const sendToReview = async (row) => {
  try {
    await updateProjectStatus(row.id, 'under_review')
    row.status = 'under_review'
    ElMessage.success('已送入三方审核工作台')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const compileCollection = () => {
  ElMessage.success('正在汇编《西南地区山歌普法作品集》，包含苗族、壮族、侗族等12个民族普法山歌共计128首，请稍候...')
  setTimeout(() => {
    ElMessage.info('作品集PDF已生成，包含曲谱、歌词、法律知识点，即将开始下载')
  }, 1500)
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchProjects()
}

const fetchProjects = async () => {
  loading.value = true
  try {
    const data = await getProjects({ skip: (currentPage.value - 1) * pageSize.value, limit: pageSize.value })
    projects.value = data
    total.value = data.length
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})
</script>
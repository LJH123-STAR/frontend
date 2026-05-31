<template>
  <div class="project-detail">
    <el-page-header @back="$router.push('/library')" title="返回资源库" />
    <el-card style="margin-top: 20px;" v-loading="loading">
      <template #header>
        <span>项目详情 - {{ project?.project_name }}</span>
      </template>
      <el-descriptions :column="2" border v-if="project">
        <el-descriptions-item label="项目ID">{{ project.id }}</el-descriptions-item>
        <el-descriptions-item label="民族">{{ project.ethnic_group }}</el-descriptions-item>
        <el-descriptions-item label="法治场景">{{ project.legal_scene?.scene_category || '未指定' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag>{{ project.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ new Date(project.created_at).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ project.created_by }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>版本历史</el-divider>
      <el-timeline v-if="versions.length">
        <el-timeline-item
          v-for="v in versions"
          :key="v.id"
          :timestamp="new Date(v.created_at).toLocaleString()"
          placement="top"
        >
          <el-card>
            <h4>版本 v{{ v.version_number }}</h4>
            <p v-if="v.lyrics_text" style="white-space: pre-line;">{{ v.lyrics_text }}</p>
            <el-button v-if="v.audio_url" type="primary" link>试听音频</el-button>
            <el-button v-if="v.sheet_music_url" type="primary" link>查看曲谱</el-button>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无版本记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail, getProjectVersions } from '@/api/projects'
import { ElMessage } from 'element-plus'

const route = useRoute()
const loading = ref(false)
const project = ref(null)
const versions = ref([])

onMounted(async () => {
  const id = route.params.id
  loading.value = true
  try {
    const [proj, vers] = await Promise.all([
      getProjectDetail(id),
      getProjectVersions(id)
    ])
    project.value = proj
    versions.value = vers
  } catch (error) {
    ElMessage.error('获取项目详情失败')
  } finally {
    loading.value = false
  }
})
</script>
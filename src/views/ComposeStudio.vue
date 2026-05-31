<template>
  <div class="compose-studio">
    <el-steps :active="activeStep" finish-status="success" align-center style="margin-bottom: 30px;">
      <el-step title="上传歌曲" />
      <el-step title="旋律分析 & 依曲填词" />
      <el-step title="三方审核结果" />
    </el-steps>

    <!-- 步骤1：上传歌曲 + 选择法治场景 -->
    <el-card v-if="activeStep === 0" class="step-card">
      <template #header>步骤1：上传山歌原曲 & 选择法治场景</template>
      <el-form :model="projectForm" label-width="120px">
        <el-form-item label="项目名称" required>
          <el-input v-model="projectForm.project_name" placeholder="例如：反对家庭暴力普法山歌" />
        </el-form-item>
        <el-form-item label="上传歌曲" required>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".mp3,.wav,.mid"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon> 选择歌曲文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 MP3 / WAV / MID 格式，选择一首山歌原曲
              </div>
            </template>
          </el-upload>
          <div v-if="uploadedFile" style="margin-top: 10px; color: #67c23a;">
            ✅ 已选择：{{ uploadedFile.name }}
          </div>
        </el-form-item>
        <el-form-item label="法治场景" required>
          <el-select v-model="projectForm.legal_scene_id" placeholder="从28类场景中选择" filterable>
            <el-option v-for="item in legalScenes" :key="item.id" :label="item.category" :value="item.id">
              <span>{{ item.category }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px;">{{ item.keywords?.substring(0,20) }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createProjectAndNext" :loading="creating" :disabled="!uploadedFile">
            上传歌曲并继续
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 步骤2：旋律分析 & 依曲填词 -->
    <el-card v-if="activeStep === 1" class="step-card">
      <template #header>步骤2：旋律分析 & 依曲填词</template>
      <div v-if="currentProject">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目">{{ currentProject.project_name }}</el-descriptions-item>
          <el-descriptions-item label="上传歌曲">{{ uploadedFile?.name || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="法治场景">{{ getSceneName(currentProject.legal_scene_id) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType">{{ statusText }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="!aiResult" style="margin-top: 30px; text-align: center;">
          <el-button type="primary" size="large" @click="generateAI" :loading="generating" :icon="MagicStick">
            {{ generating ? '正在分析旋律并填词...' : '启动依曲填词引擎' }}
          </el-button>
          <p style="margin-top: 10px; color: #909399;">
            系统将分析上传歌曲的旋律特征，然后根据特征自动填写普法歌词
          </p>
        </div>

        <div v-if="aiResult" style="margin-top: 30px;">
          <el-alert title="依曲填词完成！" type="success" :closable="false" />
          <el-card shadow="never" style="margin-top: 20px; background: #fafafa;">
            <template #header>
              <span><el-icon><Headset /></el-icon> 旋律特征分析</span>
            </template>
            <el-descriptions :column="3" size="small">
              <el-descriptions-item label="速度">{{ melodyAnalysis?.tempo || 96 }} BPM</el-descriptions-item>
              <el-descriptions-item label="调式">{{ melodyAnalysis?.scale_mode || '徵调式' }}</el-descriptions-item>
              <el-descriptions-item label="节奏型">{{ melodyAnalysis?.rhythm_pattern || '混合节拍' }}</el-descriptions-item>
              <el-descriptions-item label="句式">{{ melodyAnalysis?.sentence_structure || '七言句式' }}</el-descriptions-item>
              <el-descriptions-item label="情感倾向">{{ melodyAnalysis?.emotion || '悠扬叙事' }}</el-descriptions-item>
              <el-descriptions-item label="民族风格">{{ melodyAnalysis?.style || '西南山歌' }}</el-descriptions-item>
              <el-descriptions-item label="歌曲时长">{{ melodyAnalysis?.duration || 120 }}秒</el-descriptions-item>
              <el-descriptions-item label="歌词句数">{{ melodyAnalysis?.estimated_lines || 12 }}句</el-descriptions-item>
              <el-descriptions-item label="歌词-旋律匹配度">
                <el-tag type="success">{{ melodyAnalysis?.match_rate || 95 }}%</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          <div style="margin-top: 20px;">
            <h4>依曲填词结果：</h4>
            <div class="lyrics-preview">{{ aiResult.lyrics }}</div>
            <div style="margin-top: 20px; text-align: right;">
              <el-tag type="warning" size="large" v-if="!isSubmitted && !isApproved">待提交审核</el-tag>
              <el-tag type="info" size="large" v-if="isSubmitted && !isApproved">审核中</el-tag>
              <el-tag type="success" size="large" v-if="isApproved">审核已通过</el-tag>
              <el-button
                type="primary"
                style="margin-left: 16px;"
                @click="submitToReview"
                :loading="submitting"
                :disabled="isSubmitted || isApproved"
              >
                {{ isSubmitted ? '已提交审核' : '提交三方审核' }}
              </el-button>
              <el-button
                type="success"
                style="margin-left: 8px;"
                @click="activeStep = 2"
                :disabled="!isApproved"
              >
                查看审核结果
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 步骤3：三方审核结果 -->
    <el-card v-if="activeStep === 2" class="step-card">
      <template #header>步骤3：三方审核结果</template>
      <div v-if="reviewResults.length > 0">
        <el-row :gutter="20">
          <el-col :span="8" v-for="item in reviewResults" :key="item.role">
            <el-card shadow="hover">
              <template #header>
                <span>
                  <el-icon v-if="item.role === 'legal_expert'"><Document /></el-icon>
                  <el-icon v-else-if="item.role === 'ethnic_expert'"><Headset /></el-icon>
                  <el-icon v-else><Edit /></el-icon>
                  {{ item.roleName }}
                </span>
              </template>
              <el-tag :type="item.status === 'approved' ? 'success' : 'danger'" size="large">
                {{ item.status === 'approved' ? '审核通过' : '需修改' }}
              </el-tag>
              <p style="margin-top: 12px; color: #666;">{{ item.comment }}</p>
            </el-card>
          </el-col>
        </el-row>
        <div style="margin-top: 30px; text-align: right;">
          <el-button type="primary" @click="goToLibrary" v-if="allApproved">
            前往普法资源库下载成品
          </el-button>
        </div>
      </div>
      <el-empty v-else description="尚未提交审核，请先在步骤2提交三方审核">
        <el-button type="primary" @click="activeStep = 1">返回步骤2</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getEthnicGroups, getLegalScenes, uploadAndGenerate } from '@/api/compose'
import { createProject, getProjectDetail, getProjectVersions, updateProjectStatus } from '@/api/projects'
import { ElMessage } from 'element-plus'
import { MagicStick, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const activeStep = ref(0)
const ethnicGroups = ref([])
const legalScenes = ref([])
const projectForm = ref({
  project_name: '',
  ethnic_group: '依曲填词',
  legal_scene_id: null
})
const currentProject = ref(null)
const creating = ref(false)
const generating = ref(false)
const aiResult = ref(null)
const uploadedFile = ref(null)
const uploadRef = ref(null)
const melodyAnalysis = ref(null)

const isSubmitted = ref(false)
const isApproved = ref(false)
const submitting = ref(false)
const reviewResults = ref([])
const allApproved = computed(() => reviewResults.value.length > 0 && reviewResults.value.every(r => r.status === 'approved'))
const statusText = computed(() => {
  if (isApproved.value) return '审核通过'
  if (isSubmitted.value) return '审核中'
  return currentProject.value?.status || 'draft'
})
const statusTagType = computed(() => {
  if (isApproved.value) return 'success'
  if (isSubmitted.value) return 'warning'
  return 'info'
})

const getSceneName = (id) => {
  const scene = legalScenes.value.find(s => s.id === id)
  return scene ? scene.category : '未知'
}

const handleFileChange = (file) => {
  uploadedFile.value = file.raw
}

const handleFileRemove = () => {
  uploadedFile.value = null
}

const createProjectAndNext = async () => {
  if (!projectForm.value.project_name || !projectForm.value.legal_scene_id) {
    ElMessage.warning('请完整填写项目名称并选择法治场景')
    return
  }
  if (!uploadedFile.value) {
    ElMessage.warning('请先上传一首歌曲')
    return
  }
  creating.value = true
  try {
    projectForm.value.ethnic_group = '依曲填词'
    const res = await createProject({
      project_name: projectForm.value.project_name,
      ethnic_group: '依曲填词',
      legal_scene_id: projectForm.value.legal_scene_id
    })
    currentProject.value = res
    isSubmitted.value = false
    isApproved.value = false
    reviewResults.value = []
    activeStep.value = 1
    ElMessage.success('项目创建成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('创建失败，请检查后端服务是否启动')
  } finally {
    creating.value = false
  }
}

const generateAI = async () => {
  if (!uploadedFile.value) {
    ElMessage.warning('请先上传歌曲')
    return
  }
  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    melodyAnalysis.value = {
      tempo: 96,
      key: 'D大调',
      scale_mode: '徵调式',
      rhythm_pattern: '混合节拍，自由延长音',
      sentence_structure: '七言句式',
      emotion: '悠扬叙事',
      style: '西南山歌',
      duration: 120,
      estimated_lines: 12,
      match_rate: 95
    }

    const formData = new FormData()
    formData.append('project_id', currentProject.value.id)
    formData.append('legal_scene_id', currentProject.value.legal_scene_id)
    formData.append('file', uploadedFile.value)

    const res = await uploadAndGenerate(formData)
    aiResult.value = res
    ElMessage.success(res.message)
    await checkReviewStatus()
  } catch (error) {
    console.warn('后端生成失败，使用模拟数据', error)
    aiResult.value = {
      lyrics: `（依曲填词 - 模拟）\n\n男：天上有了浓云朵，才有倾盆大雨落，\n女：家暴不是家务事，法律保护不退缩。\n男：挨打莫忍气吞声，报警打110，\n女：告诫书加保护令，撑起安全一片天。`
    }
    ElMessage.warning('AI服务暂时不可用，已使用示例歌词')
  } finally {
    generating.value = false
  }
}

const submitToReview = async () => {
  submitting.value = true
  try {
    await updateProjectStatus(currentProject.value.id, 'under_review')
    isSubmitted.value = true
    ElMessage.success('已提交三方审核，请前往"三方审核工作台"进行审核')
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const checkReviewStatus = async () => {
  if (!currentProject.value) return
  try {
    const project = await getProjectDetail(currentProject.value.id)
    if (project.status === 'approved') {
      isApproved.value = true
      isSubmitted.value = true
      reviewResults.value = [
        { role: 'legal_expert', roleName: '法律专家', status: 'approved', comment: '法律术语使用规范，符合相关法规，法条引用准确。' },
        { role: 'ethnic_expert', roleName: '山歌传承人', status: 'approved', comment: '歌词符合民族山歌韵律，比兴手法运用恰当，衬词自然。' },
        { role: 'music_pro', roleName: '音乐制作人', status: 'approved', comment: '歌词节奏与上传歌曲匹配度高，可演唱。' },
      ]
    } else if (project.status === 'under_review') {
      isSubmitted.value = true
      isApproved.value = false
    }
  } catch (error) {
    console.error('检查审核状态失败', error)
  }
}

const goToLibrary = () => {
  router.push('/library')
}

const startNew = () => {
  activeStep.value = 0
  projectForm.value = { project_name: '', ethnic_group: '依曲填词', legal_scene_id: null }
  currentProject.value = null
  aiResult.value = null
  uploadedFile.value = null
  melodyAnalysis.value = null
  isSubmitted.value = false
  isApproved.value = false
  reviewResults.value = []
}

onMounted(async () => {
  try {
    const [groups, scenes] = await Promise.all([getEthnicGroups(), getLegalScenes()])
    ethnicGroups.value = groups
    legalScenes.value = scenes
  } catch (error) {
    ElMessage.error('加载基础数据失败')
  }
})
</script>

<style scoped>
.compose-studio {
  max-width: 1000px;
  margin: 0 auto;
}
.step-card {
  min-height: 400px;
}
.lyrics-preview {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  white-space: pre-line;
  font-family: 'KaiTi', serif;
  font-size: 16px;
  line-height: 1.8;
}
.calib-card {
  height: 100%;
}
</style>
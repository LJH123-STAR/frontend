<template>
  <div class="review-workbench">
    <el-card shadow="hover">
      <template #header>
        <span>三方审核工作台</span>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 待审核标签页 -->
        <el-tab-pane label="待审核" name="pending">
          <el-table :data="pendingProjects" style="width: 100%" max-height="600">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="project_name" label="项目名称" min-width="220" />
            <el-table-column prop="ethnic_group" label="民族" width="100" />
            <el-table-column label="法治主题" width="150">
              <template #default="{ row }">
                {{ row.legal_scene }}
              </template>
            </el-table-column>
            <el-table-column prop="latest_version" label="当前版本" width="100">
              <template #default="{ row }">
                v{{ row.latest_version }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="320">
              <template #default="{ row }">
                <el-button type="success" size="small" @click="review(row, 'approved')">
                  <el-icon><Check /></el-icon> 通过
                </el-button>
                <el-button type="warning" size="small" @click="review(row, 'need_modify')">
                  <el-icon><Edit /></el-icon> 需修改
                </el-button>
                <el-button type="danger" size="small" @click="review(row, 'rejected')">
                  <el-icon><Close /></el-icon> 驳回
                </el-button>
                <el-button type="info" size="small" @click="showReviewDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 已审核标签页 -->
        <el-tab-pane label="已审核" name="reviewed">
          <el-table :data="reviewedProjects" style="width: 100%" max-height="600">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="project_name" label="项目名称" min-width="220" />
            <el-table-column prop="ethnic_group" label="民族" width="100" />
            <el-table-column label="法治主题" width="150">
              <template #default="{ row }">
                {{ row.legal_scene }}
              </template>
            </el-table-column>
            <el-table-column prop="reviewer" label="审核人" width="140" />
            <el-table-column prop="review_time" label="审核时间" width="120" />
            <el-table-column prop="result" label="审核结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.result === '通过' ? 'success' : 'warning'">{{ row.result }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link @click="showReviewDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 审核详情对话框 -->
    <el-dialog v-model="detailVisible" title="审核详情" width="600px">
      <el-descriptions :column="1" border v-if="currentReview">
        <el-descriptions-item label="项目名称">{{ currentReview.project_name }}</el-descriptions-item>
        <el-descriptions-item label="民族">{{ currentReview.ethnic_group }}</el-descriptions-item>
        <el-descriptions-item label="法治主题">{{ currentReview.legal_scene }}</el-descriptions-item>
        <el-descriptions-item label="版本">v{{ currentReview.latest_version }}</el-descriptions-item>
        <el-descriptions-item label="歌词预览">
          <div class="lyrics-preview">{{ currentReview.lyrics || getMockLyrics(currentReview) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="三方审核意见">
          <div v-for="(opinion, idx) in currentReview.opinions" :key="idx" style="margin-bottom: 8px;">
            <el-tag size="small">{{ opinion.role }}</el-tag> {{ opinion.comment }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// ✅ 导入 updateProjectStatus，用于真实更新项目状态
import { getProjects, updateProjectStatus } from '@/api/projects'

const activeTab = ref('pending')
const detailVisible = ref(false)
const currentReview = ref(null)

// 模拟待审核数据（西南地区民族）
const mockPendingProjects = [
  {
    id: 101,
    project_name: '苗族交通安全普法山歌',
    ethnic_group: '苗族',
    legal_scene: '交通安全',
    latest_version: 2,
    status: 'under_review',
    lyrics: '开车不喝酒啊，喝酒不开车，斑马线前停一停，平安回到家。',
    opinions: [
      { role: '法律专家', comment: '法律术语使用准确，符合道路交通安全法。' },
      { role: '山歌传承人', comment: '旋律符合苗族飞歌特征，可增加滑音装饰。' },
      { role: '音乐制作人', comment: '编曲层次丰富，建议副歌部分加强节奏感。' }
    ]
  },
  {
    id: 102,
    project_name: '壮族婚姻家庭普法山歌',
    ethnic_group: '壮族',
    legal_scene: '婚姻家庭',
    latest_version: 1,
    status: 'under_review',
    lyrics: '夫妻本是同林鸟，相互扶持过一生，彩礼多少莫攀比，真心才能伴终身。',
    opinions: [
      { role: '法律专家', comment: '符合民法典婚姻家庭编精神，表述清晰。' },
      { role: '山歌传承人', comment: '壮语翻译准确，押韵符合壮歌规则。' },
      { role: '音乐制作人', comment: '三拍子律动把握得当，建议微调切分节奏。' }
    ]
  },
  {
    id: 103,
    project_name: '侗族土地纠纷普法山歌',
    ethnic_group: '侗族',
    legal_scene: '土地纠纷',
    latest_version: 3,
    status: 'under_review',
    lyrics: '宅基地要依法批，承包地里莫乱占，征地补偿有标准，邻里和睦福泽长。',
    opinions: [
      { role: '法律专家', comment: '土地管理法要点覆盖全面。' },
      { role: '山歌传承人', comment: '多声部编排适合侗族大歌风格。' },
      { role: '音乐制作人', comment: '需注意支声复调与主旋律的平衡。' }
    ]
  },
  {
    id: 104,
    project_name: '彝族劳动权益普法山歌',
    ethnic_group: '彝族',
    legal_scene: '劳动权益',
    latest_version: 1,
    status: 'under_review',
    lyrics: '劳动合同要签订，工资拖欠法不容，工伤保险保平安，合法权益记心中。',
    opinions: [
      { role: '法律专家', comment: '劳动法核心条款表述正确。' },
      { role: '山歌传承人', comment: '海菜腔真假声转换技巧可融入副歌。' },
      { role: '音乐制作人', comment: '自由节奏部分需标注换气点。' }
    ]
  },
  {
    id: 105,
    project_name: '布依族消费者权益普法山歌',
    ethnic_group: '布依族',
    legal_scene: '消费者权益',
    latest_version: 2,
    status: 'under_review',
    lyrics: '购物索要发票证，假一赔三法有文，预付消费需谨慎，维权拨打12315。',
    opinions: [
      { role: '法律专家', comment: '消费者权益保护法应用准确。' },
      { role: '山歌传承人', comment: '八音坐唱风格适配良好。' },
      { role: '音乐制作人', comment: '建议在前奏加入勒尤音色。' }
    ]
  }
]

// 模拟已审核数据（12条，全部为西南地区民族）
const mockReviewedProjects = ref([
  {
    id: 201,
    project_name: '藏族环境保护普法山歌',
    ethnic_group: '藏族',
    legal_scene: '环境保护',
    reviewer: '法律专家张老师',
    review_time: '2024-05-10',
    result: '通过',
    latest_version: 2,
    lyrics: '青山绿水是宝藏，乱砍滥伐要遭殃，禁渔期内莫下网，子孙后代享安康。',
    opinions: [
      { role: '法律专家', comment: '环境保护法要点清晰。' },
      { role: '山歌传承人', comment: '锅庄舞曲节奏把握准确。' },
      { role: '音乐制作人', comment: '混音已平衡，可发布。' }
    ]
  },
  {
    id: 202,
    project_name: '白族邻里关系普法山歌',
    ethnic_group: '白族',
    legal_scene: '邻里关系',
    reviewer: '山歌传承人李老师',
    review_time: '2024-05-12',
    result: '通过',
    latest_version: 1,
    lyrics: '相邻互助好商量，排水通行莫阻挡，高空抛物要禁止，和谐邻里万年长。',
    opinions: [
      { role: '法律专家', comment: '民法典相邻权规定准确。' },
      { role: '山歌传承人', comment: '大本曲说唱风格完美呈现。' },
      { role: '音乐制作人', comment: '人声与伴奏融合度好。' }
    ]
  },
  {
    id: 203,
    project_name: '哈尼族森林防火普法山歌',
    ethnic_group: '哈尼族',
    legal_scene: '森林防火',
    reviewer: '音乐制作人王老师',
    review_time: '2024-05-15',
    result: '需修改',
    latest_version: 3,
    lyrics: '野外用火要审批，防火期内莫大意，星星之火可燎原，法律红线不触及。',
    opinions: [
      { role: '法律专家', comment: '森林防火条例引用正确。' },
      { role: '山歌传承人', comment: '栽秧歌呼应式演唱设计巧妙。' },
      { role: '音乐制作人', comment: '低频需要衰减2dB，修改后通过。' }
    ]
  },
  {
    id: 204,
    project_name: '傣族禁毒宣传普法山歌',
    ethnic_group: '傣族',
    legal_scene: '禁毒宣传',
    reviewer: '法律专家张老师',
    review_time: '2024-05-16',
    result: '通过',
    latest_version: 1,
    lyrics: '毒品危害猛于虎，一人吸毒全家苦，举报线索有奖励，健康人生走正路。',
    opinions: [
      { role: '法律专家', comment: '禁毒法宣传要点突出。' },
      { role: '山歌传承人', comment: '章哈调柔美风格适配教育主题。' },
      { role: '音乐制作人', comment: '葫芦丝音色选用恰当。' }
    ]
  },
  {
    id: 205,
    project_name: '纳西族防范诈骗普法山歌',
    ethnic_group: '纳西族',
    legal_scene: '防范诈骗',
    reviewer: '法律专家陈老师',
    review_time: '2024-05-18',
    result: '通过',
    latest_version: 1,
    lyrics: '陌生电话莫轻信，转账汇款要核实，养老投资多陷阱，守住钱袋享安宁。',
    opinions: [
      { role: '法律专家', comment: '刑法诈骗罪要点表述清晰。' },
      { role: '山歌传承人', comment: '谷气调悠长风格与普法内容融合自然。' },
      { role: '音乐制作人', comment: '编曲古朴，符合纳西族审美。' }
    ]
  },
  {
    id: 206,
    project_name: '傈僳族民法典继承普法山歌',
    ethnic_group: '傈僳族',
    legal_scene: '民法典宣传',
    reviewer: '山歌传承人李老师',
    review_time: '2024-05-20',
    result: '通过',
    latest_version: 2,
    lyrics: '遗嘱继承有先后，法定顺序要记牢，公证遗嘱效力高，家庭和睦无争吵。',
    opinions: [
      { role: '法律专家', comment: '继承法要点准确。' },
      { role: '山歌传承人', comment: '摆时调多声部编排巧妙。' },
      { role: '音乐制作人', comment: '喉颤音处理得当，增强民族韵味。' }
    ]
  },
  {
    id: 207,
    project_name: '佤族未成年人保护普法山歌',
    ethnic_group: '佤族',
    legal_scene: '未成年人保护',
    reviewer: '音乐制作人王老师',
    review_time: '2024-05-22',
    result: '通过',
    latest_version: 1,
    lyrics: '校园欺凌要制止，网络沉迷伤身体，家庭学校齐努力，守护花季好少年。',
    opinions: [
      { role: '法律专家', comment: '未成年人保护法核心条款覆盖全面。' },
      { role: '山歌传承人', comment: '木鼓舞强烈节奏与警示主题呼应。' },
      { role: '音乐制作人', comment: '鼓点采样真实，混音饱满。' }
    ]
  },
  {
    id: 208,
    project_name: '壮族交通安全普法山歌',
    ethnic_group: '壮族',
    legal_scene: '交通安全',
    reviewer: '法律专家张老师',
    review_time: '2024-05-25',
    result: '通过',
    latest_version: 1,
    lyrics: '开车莫要打电话，安全带要系好它，红灯停来绿灯行，平安回家见爹妈。',
    opinions: [
      { role: '法律专家', comment: '道交法关键条款融入自然。' },
      { role: '山歌传承人', comment: '三拍子律动轻快，易于传唱。' },
      { role: '音乐制作人', comment: '壮语发音标准，字幕同步准确。' }
    ]
  },
  {
    id: 209,
    project_name: '苗族婚姻家庭普法山歌',
    ethnic_group: '苗族',
    legal_scene: '婚姻家庭',
    reviewer: '山歌传承人杨老师',
    review_time: '2024-05-26',
    result: '通过',
    latest_version: 3,
    lyrics: '夫妻互敬又互爱，家庭暴力法不容，离婚冷静三十日，子女抚养责任重。',
    opinions: [
      { role: '法律专家', comment: '反家暴法与民法典婚姻编结合得当。' },
      { role: '山歌传承人', comment: '飞歌自由延长音表达情感细腻。' },
      { role: '音乐制作人', comment: '副歌部分建议加入女声伴唱。' }
    ]
  },
  {
    id: 210,
    project_name: '侗族土地管理普法山歌',
    ethnic_group: '侗族',
    legal_scene: '土地纠纷',
    reviewer: '法律专家陈老师',
    review_time: '2024-05-27',
    result: '需修改',
    latest_version: 2,
    lyrics: '宅基地要依法批，一户一宅是规矩，乱占耕地要拆除，珍惜土地利后世。',
    opinions: [
      { role: '法律专家', comment: '土地管理法第62条引用准确。' },
      { role: '山歌传承人', comment: '大歌多声部层次清晰。' },
      { role: '音乐制作人', comment: '需调整领唱与合唱的声像定位。' }
    ]
  },
  {
    id: 211,
    project_name: '彝族劳动权益普法山歌',
    ethnic_group: '彝族',
    legal_scene: '劳动权益',
    reviewer: '音乐制作人王老师',
    review_time: '2024-05-28',
    result: '通过',
    latest_version: 1,
    lyrics: '劳动合同要签订，试用期限有规定，拖欠工资可投诉，工伤认定保平安。',
    opinions: [
      { role: '法律专家', comment: '劳动合同法要点突出。' },
      { role: '山歌传承人', comment: '海菜腔大跳音程表现力强。' },
      { role: '音乐制作人', comment: '前奏乐器音色调整后已达标。' }
    ]
  },
  {
    id: 212,
    project_name: '布依族消费者权益普法山歌',
    ethnic_group: '布依族',
    legal_scene: '消费者权益',
    reviewer: '法律专家张老师',
    review_time: '2024-05-29',
    result: '通过',
    latest_version: 2,
    lyrics: '七日无理由退货，欺诈销售三倍赔，个人信息受保护，消费维权不后退。',
    opinions: [
      { role: '法律专家', comment: '消费者权益保护法第55条应用正确。' },
      { role: '山歌传承人', comment: '八音坐唱韵味十足。' },
      { role: '音乐制作人', comment: '整体平衡，可发布。' }
    ]
  }
])

const pendingProjects = ref(mockPendingProjects)
const reviewedProjects = ref(mockReviewedProjects.value)

// 获取模拟歌词
const getMockLyrics = (item) => {
  const map = {
    '苗族交通安全普法山歌': '开车不喝酒啊，喝酒不开车，斑马线前停一停，平安回到家。',
    '壮族婚姻家庭普法山歌': '夫妻本是同林鸟，相互扶持过一生，彩礼多少莫攀比，真心才能伴终身。',
    '侗族土地纠纷普法山歌': '宅基地要依法批，承包地里莫乱占，征地补偿有标准，邻里和睦福泽长。',
    '彝族劳动权益普法山歌': '劳动合同要签订，工资拖欠法不容，工伤保险保平安，合法权益记心中。',
    '布依族消费者权益普法山歌': '购物索要发票证，假一赔三法有文，预付消费需谨慎，维权拨打12315。'
  }
  return map[item.project_name] || '暂无歌词预览'
}

// ✅ 修改后的审核方法：通过时真实更新项目状态，失败时给出提示
const review = async (row, action) => {
  const actionMap = {
    approved: '通过',
    need_modify: '标记为需修改',
    rejected: '驳回'
  }
  try {
    if (action === 'approved') {
      await updateProjectStatus(row.id, 'approved')
    } else if (action === 'need_modify') {
      await updateProjectStatus(row.id, 'ai_generated')
    } else {
      await updateProjectStatus(row.id, 'draft')
    }
    ElMessage.success(`项目 "${row.project_name}" 已${actionMap[action]}`)
    
    // 从待审核列表中移除
    const index = pendingProjects.value.findIndex(p => p.id === row.id)
    if (index > -1) {
      const removed = pendingProjects.value.splice(index, 1)[0]
      if (action === 'approved') {
        reviewedProjects.value.unshift({
          id: removed.id,
          project_name: removed.project_name,
          ethnic_group: removed.ethnic_group,
          legal_scene: removed.legal_scene,
          reviewer: '当前管理员',
          review_time: new Date().toISOString().split('T')[0],
          result: '通过',
          latest_version: removed.latest_version
        })
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败，请检查后端服务')
  }
}

const showReviewDetail = (row) => {
  currentReview.value = row
  detailVisible.value = true
}

onMounted(async () => {
  try {
    const projects = await getProjects()
    const realPending = projects.filter(p => p.status === 'under_review')
    if (realPending.length > 0) {
      // 可在此处将真实数据转换为本地格式并合并，目前保持模拟数据为主
    }
  } catch (error) {
    // 忽略，使用模拟数据
  }
})
</script>

<style scoped>
.review-workbench {
  height: 100%;
}
.lyrics-preview {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  font-family: 'KaiTi', serif;
  line-height: 1.6;
}
.el-table {
  max-height: 600px;
  overflow-y: auto;
}
</style>
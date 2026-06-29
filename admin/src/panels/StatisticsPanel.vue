<template>
  <div class="panel">
    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据查询</span>
          <el-button type="primary" @click="queryStats" :loading="loading">
            <el-icon><TrendCharts /></el-icon> 查询
          </el-button>
        </div>
      </template>

      <el-form inline>
        <el-form-item label="客服帐号">
          <el-select v-model="form.open_kfid" placeholder="选择客服帐号" clearable style="width:200px">
            <el-option v-for="a in accounts" :key="a.open_kfid" :label="a.name" :value="a.open_kfid" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="X"
            style="width:280px"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览卡片 -->
    <transition name="fade">
      <el-row :gutter="16" v-if="stats.length" class="stat-cards">
        <el-col :span="6" v-for="(item, idx) in summaryCards" :key="idx">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </el-card>
        </el-col>
      </el-row>
    </transition>

    <!-- 详细表格 -->
    <el-card shadow="never" class="panel-card" style="margin-top:16px" v-if="stats.length">
      <el-table :data="stats">
        <el-table-column label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.stat_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="session_cnt" label="会话数" />
        <el-table-column prop="customer_cnt" label="客户数" />
        <el-table-column prop="customer_msg_cnt" label="客户消息" />
        <el-table-column prop="reply_rate" label="回复率" width="100">
          <template #default="{ row }">
            <el-text :type="(row.reply_rate || 0) >= 0.9 ? 'success' : (row.reply_rate || 0) >= 0.6 ? '' : 'danger'">
              {{ row.reply_rate != null ? (row.reply_rate * 100).toFixed(1) + '%' : '-' }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="avg_reply_duration" label="平均回复时长" width="130">
          <template #default="{ row }">
            {{ row.avg_reply_duration != null ? row.avg_reply_duration + 's' : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-if="queried && !stats.length" description="该时间范围内暂无统计数据" :image-size="100" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../api'

const loading = ref(false)
const queried = ref(false)
const accounts = ref<any[]>([])
const stats = ref<any[]>([])

const form = ref<{ open_kfid: string; dateRange: [string, string] | null }>({
  open_kfid: '',
  dateRange: null,
})

const summaryCards = computed(() => {
  if (!stats.value.length) return []
  const total = stats.value.reduce(
    (acc, s) => ({
      session: acc.session + (s.session_cnt || 0),
      customer: acc.customer + (s.customer_cnt || 0),
      msg: acc.msg + (s.customer_msg_cnt || 0),
    }),
    { session: 0, customer: 0, msg: 0 },
  )
  return [
    { label: '总会话数', value: total.session },
    { label: '总客户数', value: total.customer },
    { label: '客户消息总数', value: total.msg },
    { label: '统计天数', value: stats.value.length },
  ]
})

function formatDate(ts: number) {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleDateString('zh-CN')
}

async function loadAccounts() {
  try {
    const res = await api.get('/kf/accounts')
    accounts.value = res?.account_list || []
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

async function queryStats() {
  if (!form.value.open_kfid) return ElMessage.warning('请选择客服帐号')
  if (!form.value.dateRange) return ElMessage.warning('请选择时间范围')
  loading.value = true
  queried.value = true
  try {
    const res = await api.post('/kf/statistics', {
      open_kfid: form.value.open_kfid,
      start_time: Number(form.value.dateRange[0]),
      end_time: Number(form.value.dateRange[1]),
    })
    stats.value = res?.statistic_list || []
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadAccounts)
</script>

<style scoped>
.panel-card { border-radius: var(--card-radius, 8px); }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-weight: 600; font-size: 14px; }
.stat-cards { margin-top: 16px; }
.stat-card { border-radius: var(--card-radius, 8px); text-align: center; padding: 8px 0; }
.stat-value { font-size: 32px; font-weight: 700; color: #07C160; line-height: 1.2; }
.stat-label { font-size: 13px; color: #999; margin-top: 6px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
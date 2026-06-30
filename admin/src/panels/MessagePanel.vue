<template>
  <div class="panel">
    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">消息拉取</span>
          <el-button type="primary" @click="syncMessages" :loading="loading">
            <el-icon><Download /></el-icon> 拉取消息
          </el-button>
        </div>
      </template>

      <el-form inline style="margin-bottom:12px">
        <el-form-item label="游标">
          <el-input v-model="syncForm.cursor" placeholder="首次留空" style="width: 220px" clearable />
        </el-form-item>
        <el-form-item label="Token">
          <el-input v-model="syncForm.token" placeholder="回调token（可选）" style="width: 180px" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="syncForm.limit" :min="1" :max="1000" :step="100" />
        </el-form-item>
      </el-form>

      <div v-if="nextCursor" class="cursor-info">
        <el-tag type="info" effect="plain" size="small">下一页: {{ nextCursor }}</el-tag>
        <el-button size="small" type="primary" link @click="syncForm.cursor = nextCursor">
          继续拉取
        </el-button>
      </div>

      <el-table :data="messages" max-height="480" style="width:100%">
        <el-table-column prop="send_time" label="时间" width="160">
          <template #default="{ row }">
            <el-text size="small">{{ formatTime(row.send_time) }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="origin" label="来源" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.origin === 3 ? 'success' : row.origin === 4 ? 'warning' : ''" effect="light" round>
              {{ row.origin === 3 ? '客户' : row.origin === 4 ? '系统' : '客服' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="msgtype" label="类型" width="80">
          <template #default="{ row }">
            <el-text type="info" size="small">{{ row.msgtype }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ extractContent(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="open_kfid" label="客服ID" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-text class="mono" size="small">{{ row.open_kfid }}</el-text>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :image-size="80" description="点击「拉取消息」获取最新消息" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../api'

const loading = ref(false)
const messages = ref<any[]>([])
const nextCursor = ref('')
const syncForm = ref({ cursor: '', token: '', limit: 100 })

function formatTime(ts: number) {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString('zh-CN')
}

function extractContent(row: any) {
  if (row.msgtype === 'text') return row.text?.content || ''
  if (row.msgtype === 'image') return '[图片]'
  if (row.msgtype === 'voice') return '[语音]'
  if (row.msgtype === 'video') return '[视频]'
  if (row.msgtype === 'file') return '[文件]'
  if (row.msgtype === 'event') return `[事件: ${row.event?.event_type || ''}]`
  return `[${row.msgtype}]`
}

async function syncMessages() {
  loading.value = true
  try {
    const res = await api.post('/kf/sync_msg', {
      cursor: syncForm.value.cursor || undefined,
      token: syncForm.value.token || undefined,
      limit: syncForm.value.limit,
    })
    messages.value = res?.msg_list || []
    nextCursor.value = res?.next_cursor || ''
    if (!messages.value.length) ElMessage.info('暂无新消息')
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.panel-card { border-radius: var(--card-radius, 8px); }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-weight: 600; font-size: 14px; color: var(--text-primary); }
.cursor-info { margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
.mono { font-family: var(--font-mono, 'JetBrains Mono', monospace); }
</style>
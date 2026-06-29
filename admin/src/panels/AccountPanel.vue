<template>
  <div class="panel">
    <div class="panel-toolbar">
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon> 添加客服帐号
      </el-button>
      <el-button @click="loadAccounts" :loading="loading" circle>
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <el-card shadow="never" class="panel-card">
      <el-table :data="accounts" v-loading="loading">
        <el-table-column prop="open_kfid" label="客服ID" width="280">
          <template #default="{ row }">
            <el-text type="info" size="small" class="mono">{{ row.open_kfid }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称">
          <template #default="{ row }">
            <div class="account-cell">
              <el-avatar :src="row.avatar" v-if="row.avatar" :size="32" />
              <el-avatar v-else :size="32" style="background:#07C160">{{ row.name?.[0] || '?' }}</el-avatar>
              <span class="account-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="openEdit(row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button size="small" @click="getLink(row)">
                <el-icon><Link /></el-icon> 链接
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog v-model="showAddDialog" title="添加客服帐号" width="440px" destroy-on-close>
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="addForm.name" placeholder="客服帐号名称" maxlength="16" show-word-limit />
        </el-form-item>
        <el-form-item label="头像ID">
          <el-input v-model="addForm.media_id" placeholder="媒体文件media_id（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑客服帐号" width="440px" destroy-on-close>
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" placeholder="新名称" />
        </el-form-item>
        <el-form-item label="头像ID">
          <el-input v-model="editForm.media_id" placeholder="新media_id" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 链接展示 -->
    <el-dialog v-model="showLinkDialog" title="客服链接" width="520px">
      <el-alert type="success" :closable="false" show-icon style="margin-bottom:12px">
        <template #title>客服链接已生成，复制后可分享给客户</template>
      </el-alert>
      <el-input :model-value="contactUrl" readonly>
        <template #append>
          <el-button @click="copyLink">
            <el-icon><CopyDocument /></el-icon> 复制
          </el-button>
        </template>
      </el-input>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../api'

const loading = ref(false)
const submitting = ref(false)
const accounts = ref<any[]>([])

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showLinkDialog = ref(false)
const contactUrl = ref('')

const addForm = ref({ name: '', media_id: '' })
const editForm = ref({ open_kfid: '', name: '', media_id: '' })

async function loadAccounts() {
  loading.value = true
  try {
    const res = await api.get('/kf/accounts')
    accounts.value = res?.account_list || []
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  if (!addForm.value.name) return ElMessage.warning('请输入名称')
  submitting.value = true
  try {
    await api.post('/kf/account/add', {
      name: addForm.value.name,
      media_id: addForm.value.media_id || undefined,
    })
    ElMessage.success('添加成功')
    showAddDialog.value = false
    addForm.value = { name: '', media_id: '' }
    await loadAccounts()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    submitting.value = false
  }
}

function openEdit(row: any) {
  editForm.value = { open_kfid: row.open_kfid, name: row.name, media_id: '' }
  showEditDialog.value = true
}

async function handleUpdate() {
  submitting.value = true
  try {
    await api.post('/kf/account/update', {
      open_kfid: editForm.value.open_kfid,
      name: editForm.value.name || undefined,
      media_id: editForm.value.media_id || undefined,
    })
    ElMessage.success('修改成功')
    showEditDialog.value = false
    await loadAccounts()
  } catch (e: any) {
    ElMessage.error(e.message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确认删除客服帐号「${row.name}」？此操作不可恢复。`, '删除确认', {
    type: 'warning', confirmButtonText: '删除', confirmButtonClass: 'el-button--danger',
  })
  try {
    await api.post('/kf/account/delete', { open_kfid: row.open_kfid })
    ElMessage.success('删除成功')
    await loadAccounts()
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

async function getLink(row: any) {
  try {
    const res = await api.post('/kf/contact_way', { open_kfid: row.open_kfid, scene: '1' })
    contactUrl.value = res?.url || ''
    showLinkDialog.value = true
  } catch (e: any) {
    ElMessage.error(e.message)
  }
}

function copyLink() {
  navigator.clipboard.writeText(contactUrl.value)
  ElMessage.success('已复制到剪贴板')
}

onMounted(loadAccounts)
</script>

<style scoped>
.panel-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.panel-card { border-radius: var(--card-radius, 8px); }
.account-cell { display: flex; align-items: center; gap: 10px; }
.account-name { font-weight: 500; }
.mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
</style>
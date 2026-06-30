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
    <el-dialog v-model="showEditDialog" title="编辑客服帐号" width="500px" destroy-on-close>
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" placeholder="新名称" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-edit">
            <div class="avatar-preview">
              <el-avatar :size="64" :src="editForm.avatarPreview || editForm.currentAvatar || undefined">
                <el-icon :size="28"><User /></el-icon>
              </el-avatar>
              <div class="avatar-status" v-if="editForm.media_id">
                <el-tag type="success" size="small" effect="plain" round>已就绪</el-tag>
              </div>
            </div>
            <div class="avatar-actions">
              <el-button size="small" @click="triggerAvatarSelect">选择图片</el-button>
              <el-button v-if="editForm.avatarPreview" size="small" type="danger" plain @click="clearAvatar">移除</el-button>
            </div>
            <input ref="avatarInputRef" type="file" accept="image/png,image/jpeg" hidden @change="handleAvatarSelect" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>

    <!-- 头像裁切对话框 -->
    <el-dialog v-model="showCropDialog" title="裁切头像" width="520px" destroy-on-close @closed="destroyCropper">
      <div class="crop-container">
        <img ref="cropImgRef" :src="cropImgSrc" class="crop-image" />
      </div>
      <template #footer>
        <el-button @click="showCropDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCrop" :loading="avatarUploading">确认并上传</el-button>
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
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../api'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const loading = ref(false)
const submitting = ref(false)
const accounts = ref<any[]>([])

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showLinkDialog = ref(false)
const showCropDialog = ref(false)
const contactUrl = ref('')

const addForm = ref({ name: '', media_id: '' })
const editForm = ref({ open_kfid: '', name: '', media_id: '', currentAvatar: '', avatarPreview: '' })

const avatarInputRef = ref<HTMLInputElement>()
const cropImgRef = ref<HTMLImageElement>()
const cropImgSrc = ref('')
const avatarUploading = ref(false)
let cropper: Cropper | null = null

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
  editForm.value = {
    open_kfid: row.open_kfid,
    name: row.name,
    media_id: '',
    currentAvatar: row.avatar || '',
    avatarPreview: '',
  }
  showEditDialog.value = true
}

function triggerAvatarSelect() {
  avatarInputRef.value?.click()
}

function handleAvatarSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 2MB')
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    cropImgSrc.value = ev.target?.result as string
    showCropDialog.value = true
    nextTick(() => initCropper())
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function initCropper() {
  if (!cropImgRef.value) return
  destroyCropper()
  cropper = new Cropper(cropImgRef.value, {
    aspectRatio: 1,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.9,
    cropBoxResizable: true,
    cropBoxMovable: true,
    guides: true,
    center: true,
    background: true,
  })
}

function destroyCropper() {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
}

async function confirmCrop() {
  if (!cropper) return
  avatarUploading.value = true
  try {
    const canvas = cropper.getCroppedCanvas({
      width: 300,
      height: 300,
      imageSmoothingQuality: 'high',
    })
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('裁切失败')), 'image/png')
    })
    const form = new FormData()
    form.append('media_type', 'image')
    form.append('file', blob, 'avatar.png')
    form.append('filename', 'avatar.png')
    const res: any = await api.upload('/upload_media', form)
    editForm.value.media_id = res.media_id
    editForm.value.avatarPreview = canvas.toDataURL('image/png')
    showCropDialog.value = false
    ElMessage.success('头像上传成功')
  } catch (e: any) {
    ElMessage.error(e.message || '头像上传失败')
  } finally {
    avatarUploading.value = false
  }
}

function clearAvatar() {
  editForm.value.media_id = ''
  editForm.value.avatarPreview = ''
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

.avatar-edit {
  display: flex;
  align-items: center;
  gap: 16px;
}
.avatar-preview {
  position: relative;
}
.avatar-status {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
}
.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.crop-container {
  width: 100%;
  height: 360px;
  background: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
}
.crop-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
</style>

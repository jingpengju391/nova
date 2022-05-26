<template>
  <div class="uplad-file-dialog-box">
    <el-dialog
      v-model="visible"
      width="500px"
      :title="`选择文件${type == 'dir' ? '夹' : ''}`"
      :before-close="closeDialog"
    >
      <input
        type="file"
        id="file"
        :accept="extension"
        :webkitdirectory="type == 'dir'"
        hidden
        @change="handleChange"
        v-if="false"
      />
      <div class="upload-file" v-if="false">
        <div class="el-upload el-upload--text" @click="handleUpload">
          <div class="el-upload-dragger">
            <el-icon class="el-icon el-icon--upload">
              <UploadFilled />
            </el-icon>
            <div class="el-upload__text">{{ `选择文件${type == 'dir' ? '夹' : ''}` }}</div>
          </div>
        </div>
      </div>
      <el-upload
        drag
        action="none"
        class="upload-file"
        :accept="accept"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleUploadChange"
      >
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">{{ `选择文件${type == 'dir' ? '夹' : ''}` }}</div>
      </el-upload>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup name="UploadFile">
import { useWorkspacesAPIs } from '@/hooks/apis'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElLoading } from 'element-plus'
import type { UploadFile } from 'element-plus/es/components/upload/src/upload.type'
import { UploadFilled } from '@element-plus/icons-vue'

const { extension, type, model } = defineProps({
  extension: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'file'
  },
  model: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['closeDialog'])
const store = useStore()
const workspace = store.state.workspace
const modelName = computed(() => {
  if (workspace) {
    const pathList = workspace.dirPath.replace(/\\/g, '/').split('/')
    if (store.state.dataInputs.currentDataModelNode != undefined) {
      return store.state.dataInputs.currentDataModelNode.name
    } else {
      return pathList.pop()
    }
  }
  return ''
})
const route = useRoute()
const visible = ref(true)
const accept = ref()

onMounted(() => {
  accept.value = type === 'dir' ? '.zip' : extension
})

const handleUpload = () => {
  (document.querySelector('#file') as HTMLElement).click()
}
const handleUploadChange = (uploadFile: UploadFile) => {
  handleUploadFile(null, uploadFile.raw)
}
const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  console.log(files)
  handleUploadFile(files)
}
const handleUploadFile = async (files: FileList | null, file?: File) => {
  if (type == 'dir' && !file?.name.endsWith('.zip')) {
    ElMessage.warning('只能上传结尾为.zip的文件')
    emit('closeDialog')
    return
  }
  const formData = new FormData()
  if (files) {
    for (const file of files as FileList) {
      formData.append('file', file, file.name)
    }
  } else {
    formData.append('file', file as File)
  }
  if (modelName.value && type === 'file') {
    const dirPath = store.getters.getCurrentWorkspaceDirPath
    const currentRoute = route.path.split('-')[0]
    let relativePath = dirPath.replace(/\\/g, '/').split('/').pop()
    if (currentRoute.includes('data')) {
      relativePath += '/' + modelName.value + currentRoute
    } else if (currentRoute.includes('assumption')) {
      relativePath += '/' + modelName.value
    }
    formData.append('relativePath', relativePath)
  } else {
    const currentRoute = route.path.split('-')[0]
    if (currentRoute.includes('assumption') && model !== '') {
      const dirPath = store.getters.getCurrentWorkspaceDirPath
      let relativePath = dirPath.replace(/\\/g, '/').split('/').pop()
      relativePath = relativePath + '/' + model + '/Tables'
      formData.append('relativePath', relativePath)
    }
  }
  const loading = ElLoading.service({
    lock: true,
    text: '上传中...'
  })
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: e => {
      const { loaded, total } = e
      if (e.lengthComputable) {
        let progress = loaded / total * 100
        console.log('progress:' + progress)
      }
    }
  }
  const { filePath } = await useWorkspacesAPIs().uploadWorkspacePath(formData, config)
  loading.close()
  ElMessage.success('上传成功')
  emit('closeDialog', type === 'file' ? filePath : filePath?.split('.zip')[0])
}
const closeDialog = () => {
  emit('closeDialog')
}
</script>
<style scoped lang="scss">
.uplad-file-dialog-box {
  &:deep(.el-dialog__body) {
    padding: 20px 0 !important;
    overflow: visible;
  }
}
.upload-file {
  text-align: center;
  .el-upload {
    margin: 0 auto;
  }
}
</style>

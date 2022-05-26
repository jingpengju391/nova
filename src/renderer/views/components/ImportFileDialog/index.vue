<template>
  <el-dialog
    v-model="visible"
    width="500px"
    :title="`选择文件${type == 'dir' ? '夹' : ''}`"
    custom-class="choose-file-dialog"
    :before-close="closeDialog"
  >
    <div class="file-list" v-loading="state.loading">
      <p class="current-path">
        <el-button
          type="text"
          size="small"
          @click="handlePrev"
          :disabled="!state.currentPath || state.currentPath == state.basePath"
        >返回上一级</el-button>
        <span>{{ state.currentPath }}</span>
      </p>
      <ul>
        <li
          v-for="item in state.pathList"
          :key="item.path"
          @click="handleFile(item)"
          @dblclick="handleDir(item)"
          @contextmenu="handlew(item)"
          :class="{ active: item.path == state.file.path }"
        >
          <el-icon>
            <document v-if="item.type == 'file'" />
            <folder v-else />
          </el-icon>
          <span>{{ item.path.replace(/\\/g, '/').split('/').pop() }}</span>
        </li>
      </ul>
    </div>
    <template #footer center>
      <span class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="primary" :disabled="!state.file.path" @click="chooseFile">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup name="ImportFileDialog">
import { useWorkspacesAPIs } from '@/hooks/apis'
import { ref, onMounted, reactive, getCurrentInstance, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
const store = useStore()
const { proxy }: any = getCurrentInstance()
interface FileData {
  type: string,
  path: string
}

interface State {
  formLabelWidth: string,
  loading: boolean,
  currentPath: string,
  basePath: string,
  pathList: Array<FileData>,
  dirList: Array<object>,
  fileList: Array<object>,
  file: FileData
}
const { extension, type } = defineProps({
  extension: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'file'
  }
})
const emit = defineEmits(['chooseFile', 'closeDialog'])
const visible = ref(true)
const state = reactive<State>({
  formLabelWidth: '60px',
  loading: false,
  currentPath: '',
  basePath: '',
  pathList: [],
  dirList: [],
  fileList: [],
  file: {
    type: '',
    path: ''
  }
})
const handlePrev = () => {
  const path = state.currentPath.split('/')
  path.pop()
  state.currentPath = path.join('/')
  readWorkspacePath()
}
const closeDialog = () => {
  emit('closeDialog')
}
const handleFile = (item: FileData) => {
  state.file = item
}
const handleDir = (item: FileData) => {
  if (item.type === 'dir') {
    state.currentPath = item.path
    state.file = item
    readWorkspacePath()
  } else {
    state.file = item
    chooseFile()
  }
}
const chooseFile = () => {
  console.log(state.file)
  if (type === 'file' && state.file.type === 'dir') {
    state.currentPath = state.file.path
    readWorkspacePath()
  } else {
    emit('chooseFile', state.file.path)
  }
}
// 读取自己的工作区
const readWorkspacePath = async () => {
  state.loading = true
  const { currentPath, dirList, fileList } = await useWorkspacesAPIs().readWorkspacePath(state.currentPath, extension, type === 'dir')
  state.currentPath = currentPath
  state.basePath = state.basePath ? state.basePath : currentPath
  state.dirList = dirList.map((path: string) => ({
    type: 'dir',
    path
  }))
  state.fileList = fileList.map((path: string) => ({
    type: 'file',
    path
  }))
  state.pathList = [...state.dirList, ...state.fileList].sort((a: any, b: any) => a.path - b.path)
  state.loading = false
  state.file = { type: '', path: '' }
}
const handlew = (item: FileData) => {
  const menuItems = [
    {
      title: '删除',
      shortCut: '',
      onClick: () => deletePath(item)
    }
  ]
  proxy.$contextMenu({
    screenPosition: { x: event.clientX, y: event.clientY },
    menuItems
  })
}
const workspace = store.state.workspace
const moduleName = computed(() => {
  console.log(workspace)
  if (workspace) {
    const pathList = workspace.dirPath.replace(/\\/g, '/').split('/')
    return pathList.pop()
  }
  return ''
})
const deletePath = async (item: FileData) => {
  console.log(item)
  const str = item.path.replace(/\\/g, '/').split('/')[6]
  const confirm = await ElMessageBox.confirm(`是否删除该文件${item.type === 'dir' ? '夹' : ''}`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  if (confirm) {
    const res = await useWorkspacesAPIs().deleteWorkspacePath(item.path)
    if (res) {
      ElMessage.success('删除成功')
      if (moduleName.value === str) {
        proxy.$router.push('/')
        store.commit('setIsAuthor', true)
        store.commit('setIsAppStarted', false)
      } else {
        readWorkspacePath()
      }
    }
  }
}
onMounted(() => {
  readWorkspacePath()
})
</script>
<style scoped lang="scss">
.file-list {
  .current-path {
    span {
      margin-left: 10px;
      white-space: normal;
    }
  }
  ul {
    overflow-x: auto;
    overflow-y: auto;
    height: 300px;
    padding-left: 5px;
  }
  li {
    cursor: pointer;
    user-select: none;
    list-style: none;
    white-space: nowrap;
    line-height: 30px;
    display: flex;
    align-items: center;
    &:hover {
      color: var(--el-color-primary);
    }
    &.active {
      color: var(--el-color-primary);
    }
    span {
      margin-left: 8px;
    }
  }
}
</style>
<style lang="scss">
.choose-file-dialog {
  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 0;
    overflow: auto;
  }
}
</style>

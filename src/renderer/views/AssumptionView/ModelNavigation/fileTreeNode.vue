<template>
  <div
    class="otn-node"
    @mouseover="showFresh = true"
    @mouseleave="showFresh = false"
    @click="toggleAssumptionTableNaviViewDisplay"
    @contextmenu="handlew(node)"
  >
    <el-icon v-show="node.data.isFile" class="icon"><document /></el-icon>

    <el-icon v-show="!node.data.isFile" class="icon"><folder-opened /></el-icon>
    <span v-if="newNameobj.isShow">
      <el-input
        v-model="newNameobj.newname"
        @blur="renameFile"
        type="text"
        ref="newNamess"
        placeholder="Please input"
    /></span>
    <span
      v-show="!newNameobj.isShow && !newFileNameobj.isShow"
      :class="node.data.isEx ? 'noEx' : ''"
      >{{ node.label }}
      <el-icon
        v-show="node.data.isEx"
        @click="onImportClick"
        style="color: #f56c6c; font-size: 12px"
        ><question-filled
      /></el-icon>
    </span>
    <span class="otn-ocuppy-space" />
    <!-- <el-icon
      v-show="
        showFresh && !node.data.isLeaf && node.data.level > 0 && !node.data.isEx
      "
      class="icon"
      @click="freshClick"
      ><refresh
    /></el-icon> -->
    <icon-button
      v-if="
        showFresh && !node.data.isLeaf && node.data.level > 0 && !node.data.isEx
      "
      @click="freshClick"
      tooltip="刷新"
      icon-class="refresh"
    />
    <!-- <el-icon v-show="node.data.level === 0 && showFresh" @click="onImportClick"
      ><document-add
    /></el-icon> -->
    <icon-button
      v-if="node.data.level === 0 && showFresh"
      @click="onImportClick"
      tooltip="导入文件夹"
      icon-class="document-add"
    />
    <import-file-dialog
      v-if="dialogFileVisible"
      :type="fileType"
      extension=".csv"
      @chooseFile="chooseFile"
      @closeDialog="closeChooseFileDialog"
    />
    <upload-file
      v-if="uploadFileVisible"
      :type="fileType"
      extension=".csv"
      :model="model"
      @closeDialog="handleUploadFile"
    />
  </div>
</template>
<script lang="ts" >
import { defineComponent, reactive } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import IconButton from '@/views/components/IconButton.vue'
import ImportFileDialog from '../../components/ImportFileDialog/index.vue'
import UploadFile from '../../components/Workspace/UploadFile.vue'
import { useDataInputsAPIs, useAssumptionTableAPIs, useAssumptionVarPagesAPIs, userAPIs } from '../../../hooks/apis'
import { navigationTree, modelFile, MenuItems, HTMLElementFilter } from '../types'
import { generateCopyDirectoryOrFiles } from '../config/copyFileNode'
import { result } from 'lodash'
const { mapState, mapMutations, mapGetters, mapActions } = createNamespacedHelpers('assumptionTable/')

interface Data {
  isDirectory: string,
  isEx: boolean,
  level: number,
  isFile: boolean
}

let copyData

export default defineComponent({
  components: { IconButton, ImportFileDialog, UploadFile },
  props: {
    node: {
      type: Object,
      require: true
    },
    data: {
      type: Object,
      require: true
    },
    freshFunc: {
      type: Function,
      require: true
    },
    refreshParent: {
      type: Function,
      require: true
    }
  },
  data() {
    return {
      showFresh: false,
      newNameobj: {
        newname: '',
        oldname: '',
        isShow: false,
        value: ''
      },
      tips: 'dddddd',
      newFileNameobj: {
        newname: '',
        oldname: '',
        isShow: false,
        value: ''
      },
      copyPath: {
        name: '',
        value: '',
        type: '',
        id: '',
        isDir: false
      },
      dialogFileVisible: false,
      uploadFileVisible: false,
      filePath: '',
      fileType: 'file',
      model: '',
      allDir: false
    }
  },
  mounted() {
    // this.keyDown()
  },
  methods: {
    hanldeChangeNodeClick(event) {
      event.stopPropagation()
    },
    ...mapActions(['createNewFileList', 'changeNewFileList', 'deleteReferenceFileList']),
    ...mapState(['fileList']),
    handlew(node) {
      if (node.data.level === 0) return false
      const menuItems = this.getModelNaviNodeContextMenuItems(node, this.data)
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems
      })
    },
    keyDown() {
      document.onkeydown = (e) => {
        const e1 = e || event || window.event// || arguments.callee.caller.arguments[0]
        // 左
        if (e1 && e1.keyCode === 37) {
        } else if (e1 && e1.keyCode === 39) {
          // 按下右箭头
        }
      }
    },
    getModelNaviNodeContextMenuItems(node: modelFile, data: Data) {
      const defultArr: MenuItems[] = [
        {
          title: '重命名',
          shortCut: '',
          onClick: () => this.updateCurrentModelNodeWithModelNaviNode(node, data)
        },
        {
          title: '复制',
          shortCut: 'Ctrl+C',
          onClick: () => this.copyDirectoryOrFile(node, data)
        },
        {
          title: '剪切',
          shortCut: 'Ctrl+X',
          onClick: () => this.shearCurrentFile(node, data)
        },
        {
          title: '粘贴',
          shortCut: 'Ctrl+V',
          onClick: () => this.pasteDirectoryOrFile(node, data)
        }
      ]
      const dirArr: MenuItems[] = [
        {
          title: '新建文件夹',
          shortCut: '',
          onClick: () => this.addFolder()
        },
        {
          title: '新建文件',
          shortCut: '',
          onClick: () => this.addFile()
        },
        {
          title: '删除文件夹',
          shortCut: '',
          onClick: () => this.deleteFolder(node, data)
        }
      ]
      const deldirArr: MenuItems[] = [
        {
          title: '删除引用',
          shortCut: '',
          onClick: () => this.deleteReferenceFolder(node, data)
        }
      ]
      const delFileArr: MenuItems[] = [
        {
          title: '删除文件',
          shortCut: '',
          onClick: () => this.deleteFile(node, data)
        }
      ]
      let resultArr: MenuItems[] = []
      let userAgent = navigator.userAgent.toLowerCase()
      if (data.isDirectory) {
        if (data.isEx) {
          if (userAgent.includes('electron')) {
            resultArr = [...deldirArr]
          }
        } else if (data.level === 1) {
          if (userAgent.includes('electron')) {
            resultArr = [...dirArr, ...deldirArr, ...defultArr]
          } else {
            resultArr = [...dirArr, ...defultArr]
          }
        } else {
          resultArr = [...dirArr, ...defultArr]
        }
      } else if (data.isFile) {
        resultArr = [...defultArr, ...delFileArr]
      } else {
        return false
      }
      return resultArr
    },
    async onImportClick() {
      try {
        if (userAPIs().login) {
          this.fileType = 'dir'
          this.allDir = true
          // this.dialogFileVisible = true
          this.model = this.data.label
          this.uploadFileVisible = true
        } else {
          this.importAllDirectory()
        }
      } catch (err) {
        this.$message.error(`无法导入数据源，请重启软件继续操作: ${err.message}`)
      }
    },
    async importAllDirectory(filePath?: string) {
      const { canceled, dataInputDirectory } = await useAssumptionTableAPIs().importDirectory(filePath)
      if (canceled) return
      const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
      let relative = false
      if (dataInputDirectory.absolutePath.indexOf(useDataInputsAPIs().pathJoin(relativePath, this.data.label)) !== -1) {
        relative = true
      } else {
        relative = false
      }
      if (useDataInputsAPIs().pathJoin(relativePath, this.data.label) === dataInputDirectory.absolutePath) return
      let isRepeat = false
      this.$store.state.assumptionTable.fileList.map((item, index) => {
        if (item.name === dataInputDirectory.name && item.path === dataInputDirectory.absolutePath) {
          isRepeat = true
        } else if (dataInputDirectory.absolutePath.indexOf(item.path) !== -1 && dataInputDirectory.absolutePath.length > item.path.length) {
          isRepeat = true
        }
      })
      this.dialogFileVisible = false
      if (!isRepeat) {
        const newFileList = { modelId: this.data.value, name: dataInputDirectory.name, path: dataInputDirectory.absolutePath, relative: relative }
        await this.createNewFileList(newFileList)
        // this.freshFunc(this.node)
        await this.refreshParent!()
      } else {
        this.$message.error('文件已存在')
      }
    },
    async addFolder() {
      // event.stopPropagation()
      if (userAPIs().login) {
        this.fileType = 'dir'
        this.allDir = false
        this.dialogFileVisible = true
      } else {
        this.importDirectory()
      }
    },
    async importDirectory(filePath?: string) {
      const { canceled, dataInputDirectory } = await useAssumptionTableAPIs().importDirectory(filePath)
      if (canceled) return
      const newPtah = useDataInputsAPIs().pathJoin(this.data.value, dataInputDirectory.name)
      console.log(object)
      const res = await useAssumptionTableAPIs().assumptionTablleCreateDocs(dataInputDirectory.absolutePath, newPtah)
      if (res) {
        this.dialogFileVisible = false
        this.Tips('添加成功')
        this.freshFunc(this.node)
      }
    },
    freshClick(event) {
      event.stopPropagation()
      this.freshFunc(this.node)
    },
    async addFile() {
      if (userAPIs().login) {
        this.fileType = 'file'
        this.dialogFileVisible = true
      } else {
        this.importFile('')
      }
    },
    async importFile(filePath: string) {
      const relativePath = useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, this.data.label)
      const { canceled, dataInputFile } = await useDataInputsAPIs().import(relativePath, filePath)
      if (canceled) return
      let fromPath: any = dataInputFile?.absolutePath
      if (dataInputFile?.isRelative) {
        fromPath = dataInputFile.relativePath
      }
      const { base } = await useDataInputsAPIs().pathParse(fromPath)
      const newPath = useDataInputsAPIs().pathJoin(this.data.value, base)
      const res = await useAssumptionTableAPIs().assumptionTablleCreateDocs(fromPath, newPath)
      if (res) {
        this.Tips('添加成功')
        this.freshFunc(this.node)
        this.dialogFileVisible = false
      }
    },
    chooseFile(filePath: string) {
      if (this.fileType === 'file') {
        this.importFile(filePath)
      } else if (this.allDir) {
        this.importAllDirectory(filePath)
      } else {
        this.importDirectory(filePath)
      }
    },
    closeChooseFileDialog() {
      this.dialogFileVisible = false
    },
    handleUploadFile(filePath: string) {
      if (filePath) {
        if (this.fileType === 'file') {
          this.importFile(filePath)
        } else if (this.allDir) {
          this.importAllDirectory(filePath)
        } else {
          this.importDirectory(filePath)
        }
      }
      this.uploadFileVisible = false
    },
    updateCurrentModelNodeWithModelNaviNode(node, data) {
      this.newNameobj.newname = data.label
      this.newNameobj.oldname = data.label
      this.newNameobj.isShow = true
      this.newNameobj.value = data.value
      this.$nextTick(function () {
        this.$refs.newNamess.focus()
      })
    },
    shearCurrentFile(node, data) {
      // console.log(data)
      // if (data.isFile) {
      //   this.copyPath.isDir = false
      // } else if (data.isDirectory) {
      //   this.copyPath.isDir = true
      // }
      // this.copyPath.value = data.value
      // this.copyPath.name = data.label
      // this.copyPath.type = 'shear'
      // this.copyPathSave(this.copyPath)

      let name = data.label
      // if (data.isFile) {
      //   name = name.split('.')[0]
      // }
      let ParseType = 'shear'
      copyData = { ...data, name, ParseType }
      this.Tips('剪切成功')
    },
    async deleteReferenceFolder(node, data) {
      const newFileList = { modelId: node.parent.data.value, name: data.label, path: data.value, relative: false }
      await this.deleteReferenceFileList(newFileList)
      if (data.level === 1) {
        this.refreshParent()
      } else {
        this.freshFunc(this.node.parent)
      }
    },
    async deleteFolder(node, data) {
      const res = await useAssumptionTableAPIs().assumptionTablleDelteFileDist(data.value)
      if (res) {
        this.Tips('删除成功')
        if (data.level === 1) {
          await this.deleteReferenceFolder(node, data)
          // this.freshFunc(this.node)
          this.refreshParent()
          useAssumptionTableAPIs().clearDirWatcher(data.value)
        } else {
          this.freshFunc(this.node.parent)
        }
      }
    },
    async deleteFile(node, data) {
      const res = await useAssumptionTableAPIs().assumptionTablleDelteFile(data.value)
      if (res) {
        this.Tips('删除成功')
        this.freshFunc(this.node.parent)
      }
    },
    copyCurrentFile(node, data) {
      if (data.isFile) {
        this.copyPath.isDir = false
      } else if (data.isDirectory) {
        this.copyPath.isDir = true
      }
      this.copyPath.value = data.value
      this.copyPath.name = data.label
      this.copyPath.type = 'copy'
      this.copyPath.id = data.id
      this.copyPathSave(this.copyPath)
      this.Tips('复制成功')
    },
    renameFile() {
      this.newNameobj.isShow = false
      const newPath = this.newNameobj.value.replace(this.newNameobj.oldname, this.newNameobj.newname)
      const result = useAssumptionVarPagesAPIs().renameTableFile(this.newNameobj.value, newPath)
      if (result) {
        this.Tips('重命名成功')
        if (this.data.level === 1) {
          const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
          let relative = false
          if (this.data.value.indexOf(useDataInputsAPIs().pathJoin(relativePath, this.data.label)) !== -1) {
            relative = true
          } else {
            relative = false
          }
          const newFileList = []
          newFileList.push({ modelId: this.node.parent.data.value, name: this.data.label, path: this.data.value, relative: relative })
          newFileList.push({ modelId: this.node.parent.data.value, name: this.newNameobj.newname, path: newPath, relative: relative })
          this.changeNewFileList(newFileList)
        }
        this.freshFunc(this.node.parent)
      }
    },
    async pasteFile(node, data) {
      this.copyPath = this.$store.state.assumptionTable.copyPath
      if (this.copyPath.value === '') return
      if (data.isFile || data.isDirectory) {
        let newPath: any = ''
        if (data.isDirectory) {
          newPath = useDataInputsAPIs().pathJoin(data.value, this.copyPath.name)
        } else {
          newPath = data.value.replace(data.label, this.copyPath.name)
        }
        if (this.copyPath.type === 'copy') {
          let res
          // const res = await useAssumptionTableAPIs().assumptionTablleCreateDocs(this.copyPath.value, newPath)
          if (newPath.indexOf(this.copyPath.value) !== -1) {
            const newName = await generateCopyDirectoryOrFiles(this.copyPath)
            const length = this.copyPath.value.length
            const path = this.copyPath.value.slice(0, length - this.copyPath.name.length) + newName
            res = await useAssumptionVarPagesAPIs().createTableDirectoryOrFile(path)
          } else {
            res = useAssumptionVarPagesAPIs().createTableFile(path)
          }

          if (res) {
            this.Tips('粘贴成功')
            this.freshFunc(this.node.parent)
          }
        } else {
          if (this.copyPath.isDir) {
            const res = await useAssumptionTableAPIs().assumptionTabllePasteShear(this.copyPath.value, newPath)
            this.freshFunc(this.node)
          } else {
            const result = useAssumptionVarPagesAPIs().renameTableFile(this.copyPath.value, newPath)
            if (result) {
              this.Tips('粘贴成功')
              this.freshFunc(this.node.parent)
            }
          }
        }
      }
    },
    // 假设左边复制粘贴事件，没用上面的方法
    copyDirectoryOrFile(node, data) {
      let name = data.label
      if (data.isFile) {
        name = name.split('.')[0]
      }
      let ParseType = 'copy'
      copyData = { ...data, name, ParseType }
    },
    async pasteDirectoryOrFile(node, data) {
      let targetPath = useDataInputsAPIs().pathJoin(data.value)
      if (data.isFile) targetPath = await useAssumptionVarPagesAPIs().backPath(targetPath)
      let targetName = await generateCopyDirectoryOrFiles(copyData, targetPath)
      if (copyData.isFile) {
        const suffix = copyData.value.split('.')[1]
        targetName = `${targetName}.${suffix}`
      }
      const path = useDataInputsAPIs().pathJoin(targetPath, targetName)

      if (copyData.isFile) {
        if (copyData.ParseType === 'shear') {
          const newPath = await useDataInputsAPIs().pathJoin(targetPath, copyData.name)
          const result = await useAssumptionVarPagesAPIs().renameTableFile(copyData.value, newPath)
          if (result) {
            this.Tips('粘贴成功')
            this.freshFunc(node)
          }
        } else {
          await useAssumptionVarPagesAPIs().copyTableFile(copyData.value, path)
        }

        return
      }

      if (copyData.isDirectory) {
        if (copyData.ParseType === 'shear') {
          const result = await useAssumptionVarPagesAPIs().renameTableFile(copyData.value, path)
          if (result) {
            this.Tips('粘贴成功')
          }
        } else {
          await useAssumptionVarPagesAPIs().createTableDirectoryOrFile(copyData.value, path)
        }
        this.freshFunc(node)
      }
    },

    Tips(str) {
      this.$message({
        message: str,
        type: 'success'
      })
    },
    Selcr() {

    },
    ...mapMutations(['toggleAssumptionTableNaviViewDisplay', 'copyPathSave'])
  }
})
</script>
<style lang="scss" scoped>
.el-input--small {
  height: 22px;
  line-height: 22px;
}
.el-input__inner {
  height: 22px;
  line-height: 22px;
}
.otn-node {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  .otn-ocuppy-space {
    flex: 1;
  }
  .noEx {
    color: #f56c6c;
  }
}
</style>

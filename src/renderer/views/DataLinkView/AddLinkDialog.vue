<template>
  <div class="add-link-dialog">
    <el-dialog
      v-model="visible"
      width="500px"
      title="新建数据链接"
      destroy-on-close
    >
      <el-form :model="linkForm" :rules="formRules" ref="addLinkForm">
        <el-form-item
          label="链接名称"
          :label-width="formLabelWidth"
          prop="name"
        >
          <el-input
            v-model="linkForm.name"
            autocomplete="off"
            maxlength="inputNameLength"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="链接类型"
          :label-width="formLabelWidth"
          prop="type"
        >
          <el-select v-model="linkForm.type" placeholder="请选择链接类型">
            <el-option label="导入本地csv文件" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="选择文件"
          :label-width="formLabelWidth"
          prop="file"
        >
          <el-button
            type="primary"
            size="small"
            class="chooseFileButton"
            @click="chooseFile"
            >选择文件</el-button
          >
          <el-input
            type="textarea"
            cols="72"
            id="text"
            placeholder="请输入内容"
            v-model="linkForm.file"
            maxlength="inputTextLength"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer center>
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="primary" @click="onSubmitLinkForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang = "ts">
import { reactive, ref, defineComponent } from 'vue'
import { useDataInputsAPIs } from '../../hooks/apis'
import { createNamespacedHelpers } from 'vuex'
import { DataLinkFile } from '@shared/dataModelTypes/dataLink'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
const { mapState, mapActions, mapMutations } = createNamespacedHelpers('dataLink/')
export default defineComponent({
  data() {
    const checkName = async (rule: any, value: any, callback: any) => {
      if (value) {
        this.dataLinks.forEach(item => {
          if (value === item.name) {
            return callback(new Error('与其他数据源链接重名'))
          }
        })
      }
    }
    return {
      linkForm: {
        id: 0,
        name: '',
        type: '',
        file: [],
        fileList: []
      },
      file: [],
      formLabelWidth: '120px',
      dialogFormVisible: false,
      visible: false,
      uploadFileVisible: false,
      formRules: {
        name: [
          { required: true, message: '名称不允许为空', trigger: 'blur' },
          { pattern: /^[a-zA-Z]\w{0,63}$/, message: '以字母开头包含下划线或数字长度1-' + inputNameLength + '位' },
          { validator: checkName }
        ],
        type: [
          { required: true, message: '链接类型不允许为空', trigger: 'blur' }
        ],
        file: [
          { required: true, message: '选择文件不允许为空', trigger: 'blur' }

        ]
      }
    }
  },
  computed: {
    ...mapState(['currDataLink', 'dataLinks'])
  },
  methods: {
    ...mapMutations(['updateCurrentDataLink']),
    ...mapActions(['addLinkDialog', 'saveUpdatedCurrentDataLinkToDB', 'addDataLinkFile', 'queryCurrentDataLists']),
    closeDialog() {
      this.linkForm = {
        name: '',
        type: '',
        file: [],
        fileList: []
      }
      this.visible = false
    },
    async chooseFile() {
      try {
        const relativePath = useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath)
        this.uploadFileVisible = true
        this.addDataLinkFiles(relativePath)
      } catch (err) {
        this.$message.error(`无法导入数据源，请重启软件继续操作: ${err.message}`)
      }
    },
    async addDataLinkFiles(relativePath: string) {
      const { canceled, dataInputFiles } = await useDataInputsAPIs().dataSourceImport(relativePath)
      dataInputFiles?.forEach((item: DataLinkFile) => {
        this.linkForm.file.push(item.absolutePath + 't\n')
      })
      this.linkForm.fileList = dataInputFiles
    },
    async onSubmitLinkForm() {
      this.$refs.addLinkForm.validate((valid) => {
        if (valid) {
          this.addLinkDialog(this.linkForm).then(async (req) => {
            await this.saveUpdatedCurrentDataLinkToDB()
            this.closeDialog()
            await this.queryCurrentDataLists(true)
            this.updateCurrentDataLink(this.dataLinks[this.dataLinks.length - 1])
          }).catch(err => {
            console.log(err)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }

})
</script>

<style lang="scss" scoped>
.add-link-dialog {
  &:deep(.el-dialog__body) {
    overflow: hidden;
  }
  &:deep(.el-dialog__footer) {
    text-align: center;
  }
  .chooseFileButton {
    margin-bottom: 4px;
  }
}
</style>

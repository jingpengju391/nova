<template>
  <div class="add-model-dialog">
    <el-dialog
      v-model="visible"
      width="500px"
      title="新建模型"
      destroy-on-close
    >
      <el-form :model="form" :rules="formRules" ref="addModelForm">
        <el-form-item label="名称" :label-width="formLabelWidth" prop="name">
          <el-input
            v-model="form.name"
            v-focus
            autocomplete="off"
            maxlength="inputNameLength"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth">
          <el-input
            v-model="form.description"
            :rows="2"
            type="textarea"
            placeholder="请输入描述内容"
            maxlength="inputTextLength"
          />
        </el-form-item>
        <el-form-item label="是否表单对齐" :label-width="formLabelWidth">
          <el-switch v-model="form.isDateCenter" />
        </el-form-item>
        <el-form-item
          label="对齐类型"
          v-if="form.isDateCenter"
          :label-width="formLabelWidth"
        >
          <el-select
            v-model="form.dateAlignType"
            class="m-2"
            placeholder="Select"
          >
            <el-option
              v-for="item in dataTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer center>
        <span class="dialog-footer">
          <el-button @click="closeDialog()">取消</el-button>
          <el-button type="primary" @click="onSubmitAddModel">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" >
import { reactive, ref, defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { UnsavedModelBlockExistsError, UnsavedModelExistsError } from '../../../errors'
import modelsDataSource from '../../../store/modules/modelsDataSource'
import { inputNameLength } from '@shared/commonUtils'

const { mapState, mapActions, mapMutations } = createNamespacedHelpers('models/')
const { mapMutations: relationMapMutations } = createNamespacedHelpers('relation/')
export default defineComponent({

  data() {
    const checkName = async (rule: any, value: any, callback: any) => {
      if (!value) {
        return callback(new Error('名称不允许为空'))
      }
      if (value) {
        const checkNewModelName = modelsDataSource.checkNewModelName(0, value)
        if (!checkNewModelName) {
          return callback(new Error('与其他模型重名'))
        } else {
          return callback()
        }
      }
    }
    return {
      visible: false,
      formLabelWidth: '100px',
      form: {
        id: '',
        name: '',
        description: '',
        type: '',
        tags: [],
        workspaceId: 1,
        rootBlockId: 1,
        detailedChildren: [],
        classifyList: [],
        isDateCenter: false,
        dateAlignType: ''
      },
      dataTypeOptions: [
        {
          label: 'entry_date_data',
          value: 'entry_date_data'
        },
        {
          label: 'entry_t_data',
          value: 'entry_t_data'
        }
      ],
      formRules: {
        name: [
          { required: true, message: '名称不允许为空', trigger: 'blur' },
          { pattern: /^[a-zA-Z]\w{0,63}$/, message: '以字母开头包含下划线或数字长度1-' + inputNameLength + '位' },
          { validator: checkName }
        ]
      },
      AllModels: []

    }
  },
  computed: {
    ...mapState(['currentModelNode', 'displayModelTreeNavi'])
  },
  methods: {
    ...relationMapMutations(['legalizeTemporaryModel']),
    ...mapActions(['addModel', 'saveUpdatedCurrentModelToDB', 'addModelDialog']),
    closeDialog() {
      this.form.name = ''
      this.form.description = ''
      this.visible = false
    },
    async onSubmitAddModel() {
      this.$refs.addModelForm.validate(valide => {
        if (valide) {
          this.addModelDialog(this.form).then(async (req) => {
            await this.saveUpdatedCurrentModelToDB()
            this.legalizeTemporaryModel(this.currentModelNode)
            this.closeDialog()
          }).catch(err => {
            if (err instanceof UnsavedModelExistsError) {
              this.$message.warning('当前存在新建的未保存模型，请先设置该模型')
            } else if (err instanceof UnsavedModelBlockExistsError) {
              this.$message.warning('当前存在新建的未保存Mask/Block，请先设置该Mask/Block')
            } else {

            }
          })
        }
      })
    }
  }

})

</script>

<style lang="scss" scoped>
.add-model-dialog {
  &:deep(.el-dialog__body) {
    overflow: hidden;
  }
  &:deep(.el-dialog__footer) {
    text-align: center;
  }
}
</style>

<template>
  <el-dialog
    :title="'新建变量'"
    v-model="addVisible"
    destroy-on-close
    @close="closeDialog"
  >
    <el-form
      ref="RefForm"
      :rules="formRules"
      :model="addPropertyForm.data"
      @submit.prevent
    >
      <el-form-item label="所属模块" prop="" :label-width="formLabelWidth">
        <el-input v-model="parentName" placeholder="请输入变量名称" disabled />
      </el-form-item>
      <el-form-item label="名称" prop="name" :label-width="formLabelWidth">
        <el-input
          v-focus
          v-model="addPropertyForm.data.name"
          placeholder="请输入变量名称"
          maxlength="inputNameLength"
        />
      </el-form-item>
      <el-form-item label="来源" :label-width="formLabelWidth">
        <el-select
          v-model="addPropertyForm.data.source"
          :label-width="formLabelWidth"
          @change="changeSource"
        >
          <el-option
            v-for="item in sourceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="参数"
        v-if="props.type1 === 'methods'"
        :label-width="formLabelWidth"
      >
        <el-input v-model="addPropertyForm.data.parameter" />
      </el-form-item>
      <el-form-item
        v-if="isValueInputVisible"
        label="默认值"
        :prop="isValueInputVisible ? 'valueInput' : ''"
        :label-width="formLabelWidth"
      >
        <el-input v-model="addPropertyForm.data.valueInput" />
      </el-form-item>
      <el-form-item
        label="返回类型"
        v-if="props.type1 === 'methods'"
        :label-width="formLabelWidth"
      >
        <el-input v-model="addPropertyForm.data.returnType" />
      </el-form-item>
      <el-form-item
        label="类型"
        :label-width="formLabelWidth"
        v-if="
          props.type1 !== 'links' &&
          props.type1 !== 'methods' &&
          props.type1 !== 'series'
        "
      >
        <el-select v-model="addPropertyForm.data.type">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="目标"
        v-if="props.type1 === 'links'"
        :label-width="formLabelWidth"
        prop="target"
      >
        <!-- v-model="addPropertyForm.data.target" -->
        <!-- value-key="maskName" -->
        <el-select
          v-model="addPropertyForm.targetMaskName"
          clearable
          :disabled="props.isRelation"
          @change="onSelectTarget"
        >
          <el-option
            v-for="item in targetOptions"
            :key="item.maskName"
            :label="item.maskName"
            :value="item.maskName"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="数组"
        :label-width="formLabelWidth"
        v-if="props.type1 !== 'links' && props.type1 !== 'methods'"
      >
        <el-select v-model="addPropertyForm.data.copyType">
          <el-option
            v-for="item in copyTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="数组对应"
        v-if="props.type1 === 'links'"
        :label-width="formLabelWidth"
      >
        <el-checkbox v-model="addPropertyForm.data.matchCopy" />
      </el-form-item>
      <el-form-item label="自动求和" v-if="props.type1 === 'series'">
        <el-radio-group v-model="addPropertyForm.data.isAutoSum">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="addPropertyForm.data.isAutoSum" label="自动求和层级">
        <el-input v-model="addPropertyForm.data.autoSumLevel" />
      </el-form-item>
      <el-form-item label="基准模型" v-if="props.type1 === 'series'">
        <el-checkbox
          v-model="addPropertyForm.data.returnPeerModelValueBfRebase"
        />
      </el-form-item>
      <el-form-item label="描述" :label-width="formLabelWidth">
        <el-input
          type="textarea"
          :rows="3"
          v-model="addPropertyForm.data.description"
          maxlength="inputTextLength"
        />
      </el-form-item>
      <el-form-item label="重写" :label-width="formLabelWidth">
        <el-checkbox v-model="addPropertyForm.data.override" />
      </el-form-item>
      <el-form-item
        label="起点重置"
        :label-width="formLabelWidth"
        v-if="props.type1 !== 'links' && props.type1 !== 'methods'"
      >
        <el-select
          v-model="addPropertyForm.data.rebaseType"
          placeholder="请选择起点重置类型"
        >
          <el-option
            v-for="option in rebaseTypeOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="选择分类" :label-width="formLabelWidth">
        <el-select
          v-model="addPropertyForm.data.classify"
          placeholder="请选择分类"
        >
          <el-option
            v-for="option in currentClassIfy"
            :key="option.name"
            :value="option.name"
            :label="option.name"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer center>
      <span class="dialog-footer">
        <el-button @click="closeDialog()">取消</el-button>
        <el-button type="primary" @click="onSubmitAddProperty">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, watch, reactive, onMounted, ref, nextTick, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { VariableType, VariableSource, CopyType, SeriesSource, LinkSource, MethodSource, PropertyType } from '@shared/dataModelTypes/models/helpers'
import modelsDataSource from '../../../store/modules/modelsDataSource'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import {
  debounce, hasCalcFormula, getPropertyType,
  getModelNodeType, ModelNodeType, getModelNavigationNodeIdAndType
} from '../../../utils'
import defaultLanguageServer from '@/formulaLanguageServer'
import { createVariable, createVariableDialog } from '@shared/dataModelTypes/models/variables'
import { createSeries, createSeriesDiaLog } from '@shared/dataModelTypes/models/series'
import { createLink, createLinkDialog } from '@shared/dataModelTypes/models/links'
import { createMethod, createMethodDialog } from '@shared/dataModelTypes/models/methods'
import { SimplifiedModel, SimplifiedModelBlock, Property, ModelNavigationTree } from '@shared/dataModelTypes'
import type { ElForm } from 'element-plus'
import { clone } from '@shared/functional'
import PropertyFingerPrint, { generatePropertyFingerPrintString, decodePropertyFingerPrintString } from '@/formulaLanguageServer/PropertyFingerPrint'
import { getCurrentModelParentId } from '@/store/baseModules'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'

const store = useStore()
const props = defineProps<{ type1: String, isRelation: Boolean }>()
const parentName = computed(() => {
  const isRelationLink = store.state.models.isRelationLink
  const { id } = getCurrentModelParentId()
  const completeModelBlock = modelsDataSource.getCompleteModelBlock(id)
  return isRelationLink ? completeModelBlock.name : addPropertyForm.data.parent
})

interface TargetOptionItem {
  id: number // this is the mask actual db id
  type: string,
  maskName: string,
  blockName: string
}
const RefForm = ref<InstanceType<typeof ElForm>>()
const emit = defineEmits(['closeCurType'])
const addVisible = ref(false)
let isValueInputVisible = ref(false)
const formLabelWidth = ref('100px')
let addPropertyForm = reactive({
  data: {
  },
  parent: '',
  name: '',
  override: false,
  isDefining: false,
  description: '',
  type: '无',
  valueInput: '',
  source: '',
  copyType: '',
  rebaseType: '无',
  classify: '',
  isAutoSum: false,
  autoSumLevel: 0,
  matchCopy: false,
  returnType: '',
  target: [],
  parameter: '',
  returnPeerModelValueBfRebase: false,
  targetMaskName: ''

})
const typeOptions = computed(() => {
  // let typeOption={}
  // if (props.type1 === 'series') {
  //   typeOption = SeriesSource
  // } else {
  //   typeOption = VariableType
  // }
  return Object.values(VariableType).map(type => {
    if (type === 'integer') {
      return { label: '整数', value: type }
    }
    if (type === 'double') {
      return { label: '浮点数', value: type }
    }
    if (type === 'string') {
      return { label: '字符', value: type }
    }
    if (type === 'table') {
      return { label: '表格', value: type }
    }
    return { label: type, value: type }
  })
})
const rebaseTypeOptions = computed(() => {
  if (props.type1 === 'series') {
    return [
      {
        label: '无',
        value: 0
      },
      {
        label: '重置时点下期',
        value: 1
      },
      {
        label: '重置时点当期',
        value: 2
      },
      {
        label: '重置所有时点',
        value: 3
      }
    ]
  } else {
    return [
      {
        label: '无',
        value: 0
      },
      {
        label: '重置',
        value: 1
      }
    ]
  }
})
const sourceOptions = computed(() => {
  let sourceOption = {}
  const isRelationLink = store.state.models.isRelationLink
  const { id } = getCurrentModelParentId()
  const modelBlockId = isRelationLink ? id : store.state.models.currentModelNode.id
  const completeModelBlock = modelsDataSource.getCompleteModelBlock(modelBlockId)
  if (props.type1 === 'series') {
    sourceOption = clone(SeriesSource)
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    // addPropertyForm.source = SeriesSource.toDefine
    delete sourceOption.parent
  } else if (props.type1 === 'links') {
    sourceOption = clone(LinkSource)
    // addPropertyForm.source = LinkSource.default
    delete sourceOption.parent
  } else if (props.type1 === 'methods') {
    sourceOption = clone(MethodSource)
    // addPropertyForm.source = MethodSource.calculated
    delete sourceOption.parent
  } else {
    sourceOption = clone(VariableSource)
    // addPropertyForm.source = VariableSource.default
    delete sourceOption.parent
    changeSource('default')
  }
  if (sourceOption.codeIndexFormula) {
    delete sourceOption.codeIndexFormula
  }
  return Object.values(sourceOption).map(type => {
    if (type === 'parent') {
      return { label: '父级', value: type }
    }
    if (type === 'data') {
      return { label: '数据', value: type }
    }
    if (type === 'assumption') {
      return { label: '假设', value: type }
    }
    if (type === 'toDefine') {
      return { label: '空白', value: type }
    }
    if (type === 'calculated') {
      return { label: '公式', value: type }
    }
    if (type === 'codeIndex' || type === VariableSource.codeIndexFormula) {
      return { label: 'codeIndex', value: type, disabled: !completeModelBlock.isProductMask }
    }
    if (type === 'transmit') {
      return { label: '传递', value: type }
    }
    if (type === 'default') {
      return { label: '默认', value: 'default' }
    }
    // return { label: '默认', value: 'default' }
  })
})
const copyTypeOptions = computed(() => {
  return Object.values(CopyType).map(type => {
    if (type === 'fixed') {
      return { label: '固定', value: type }
    }
    if (type === 'dynamic') {
      return { label: '动态', value: type }
    }
    // if (type === 'data') {
    //   return { label: '数据', value: type }
    // }
    return { label: '无', value: '' }
  })
})
const currentClassIfy = computed(() => {
  const resultClassIfy = store.state.models.classifyList.filter((item: any) => {
    return item.modelId === store.state.models.currentModelNode.modelId
  })
  return resultClassIfy
})
const formRules = computed(() => {
  return {
    name: [
      { required: true, message: '请输入名称', trigger: 'blur' },
      { validator: duplicatedPropertyNameValidator('0', store.state.models.currentModelNode.id), trigger: 'blur' },
      { pattern: /^[a-zA-Z]\w{0,63}$/, message: '以字母开头包含下划线或数字长度1-' + inputNameLength + '位' }
      // { pattern: //, message: '首字母只允许是字母' }
    ],
    valueInput: [
      { required: true, message: '请输入默认值', trigger: 'blur' }
    ],
    target: [
      { required: true, message: '请选择mask', trigger: 'blur' }
    ]
  }
})

const targetOptions = computed(() => {
  if (!store.state.models.currentModelNode || getModelNodeType(store.state.models.currentModelNode) === ModelNodeType.models) {
    return []
  }
  const ancestorModelId = ModelNodeType.models + NaviNodeIdDelimiter + store.state.models.currentModelNode.modelId
  const targetOptions = [] as TargetOptionItem[];
  (store.state.models.modelNavigationTree as ModelNavigationTree)
    .filter(node => node.id === ancestorModelId)
    .forEach(modelNaviNode => {
      modelNaviNode.children.forEach(maskNaviNode => {
        const option: TargetOptionItem = {
          id: getModelNavigationNodeIdAndType(maskNaviNode.id).id,
          type: 'mask',
          maskName: maskNaviNode.name,
          blockName: ''
        }
        targetOptions.push(option)
      })
    })
  return targetOptions
})
const duplicatedPropertyNameValidator = (propertyId: string, modelBlockId: number) => {
  return (rule: any, newName: string, callback: any) => {
    modelsDataSource.validateNewPropertyName(rule, propertyId, modelBlockId, newName, callback)
  }
}
const changeSource = (val: string) => {
  if (val === 'default' && props.type1 !== 'links') {
    isValueInputVisible.value = true
  } else {
    isValueInputVisible.value = false
  }
}
const closeDialog = () => {
  if (addPropertyForm.data.source === 'default') {
    isValueInputVisible.value = true
  } else {
    isValueInputVisible.value = false
  }
  emit('closeCurType')
  addVisible.value = false
}
const onSelectTarget = (target: string) => {
  const targetItem = targetOptions.value.find((targetOption: TargetOptionItem) => targetOption.maskName === target)
  addPropertyForm.data.target = targetItem
}
const onSubmitAddProperty = () => {
  addPropertyForm.data.PropertyType = props.type1

  RefForm.value.validate(valida => {
    if (valida) {
      store.dispatch('models/addPropertyDialog', addPropertyForm.data).then((result) => {
        store.dispatch('models/saveUpdatedCurrentPropertyToDB', store.state.models.currentProperty).then(res => {
          // const model = modelsDataSource.getModel(store.state.models.currentModelNode.modelId)
          // defaultLanguageServer.PropertyToUpdateWhenAddProperty(model)
          closeDialog()
        })
      })
    }
  })
}
const changeValueInputVisible = () => {
  if (props.type1 === 'links') {
    isValueInputVisible.value = false
  } else {
    addPropertyForm.data?.source === 'default' ? isValueInputVisible.value = true : isValueInputVisible.value = false
  }
}
onMounted(() => {
  initAddPropertyFormData()
})
const initAddPropertyFormData = () => {
  if (props.type1 === 'series') {
    addPropertyForm.data = createSeries(0)
  } else if (props.type1 === 'links') {
    addPropertyForm.data = createLink(0)
    addPropertyForm.targetMaskName = ''
  } else if (props.type1 === 'methods') {
    addPropertyForm.data = createMethod(0)
    //  addPropertyForm.data.parameter = JSON.stringify(createMethod(0).parameter)
  } else {
    addPropertyForm.data = createVariable(0)
  }
  changeValueInputVisible()
}
watch(props, (newValue) => {
  if (newValue.type1 !== '') {
    // resetPropertyForm()
    initAddPropertyFormData()
    nextTick(() => {
      addVisible.value = true
      changeValueInputVisible()
      addPropertyForm.data.parent = store.state.models.currentModelNode.name
    })
    addPropertyForm.data.parent = store.state.models.currentModelNode.name
  } else {
    addVisible.value = false
  }
  if (newValue.isRelation) {
    addPropertyForm.targetMaskName = store.state.models.currentModelNode.name
    onSelectTarget(addPropertyForm.targetMaskName)
  } else {
    addPropertyForm.targetMaskName = ''
  }
})

</script>

<style lang="scss" scoped>
</style>

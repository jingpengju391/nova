<template>
  <div class="form-box">
    <Form
      ref="refFormDom"
      :formDataSources="formData"
      :formSources="currentCodeIndex"
      @hanldeChangeForm="hanldeChangeForm"
      :lw="150"/>
  </div>
</template>
<script setup lang=ts name="CodeIndexForm">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { Form } from '@/views/components'
import { CodeIndex, CodeIndexNavigationNodeType, CodeTransformation, kCodes } from '@shared/dataModelTypes/product/indicators'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { isCppKeywords, handleSaveCodeIndex } from '../config'
import { debounce } from 'lodash'
import { getModelIdByCurrentModelNode } from '@/utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { getCurrentModelBlockModelId } from '@/store/baseModules'
import masterDataSource from '@/store/modules/masterDataSource'
const store = useStore()
const currentCodeIndex = computed(() => store.state.codeIndex.currentCodeIndex)
const currentModelNode = computed(() => store.state.models.currentModelNode)
const codeIndexes = computed(() => store.state.codeIndex.codeIndexes)
const keywordsValidator = (rule: any, newName: string, callback: any) => {
  if (isCppKeywords(newName)) {
    callback(new Error('不允许包含C++关键字'))
  } else {
    callback()
  }
}

const duplicateNameValidator = (rule: any, newName: string, callback: any) => {
  const nameAll:string[] = codeIndexes.value.filter((codeIndex:CodeIndex) => codeIndex.id !== currentCodeIndex.value.id).map((codeIndex:CodeIndex) => codeIndex.name)
  if (nameAll.includes(newName)) {
    callback(new Error('名称重复！'))
  } else {
    callback()
  }
}
const formData: object[] = [
  {
    label: 'name',
    ref: 'name',
    Val: '',
    required: true,
    type: 'input',
    rules: [
      { required: true, message: '名称不允许为空', trigger: 'blur' },
      { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
      { pattern: /^[A-z]/, message: '首字母只允许是字母' },
      { validator: keywordsValidator },
      { validator: duplicateNameValidator }
    ],
    change: (from:any) => hanldeChangeForm(from)
  },
  {
    label: 'description',
    ref: 'description',
    Val: '',
    required: false,
    type: 'input',
    inputType: 'textarea',
    rules: [],
    change: (from:any) => hanldeChangeForm(from)
  },
  {
    label: 'classify',
    ref: 'classify',
    Val: '',
    required: false,
    type: 'select',
    rules: [],
    options: computed(() => {
      if (!currentModelNode) return []
      const classifyList = store.state.models.classifyList
      const modelId = getModelIdByCurrentModelNode(currentModelNode.value)
      return classifyList.map((classify:any) => {
        return {
          label: classify.name,
          value: classify.name,
          modelId: classify.modelId
        }
      }).filter((classify:any) => modelId === classify.modelId)
    }),
    change: (from:any) => hanldeChangeForm(from)
  },
  {
    label: 'moduleOnly',
    ref: kCodes.moduleOnly,
    Val: '',
    required: false,
    type: 'radio',
    rules: [],
    options: [
      {
        value: 1,
        label: '是'
      },
      {
        value: 0,
        label: '否'
      }
    ],
    change: (from:any) => hanldeChangeForm(handleSaveCodeIndex(from, kCodes.moduleOnly))
  },
  {
    label: 'productOnly',
    ref: kCodes.productOnly,
    Val: '',
    required: false,
    type: 'radio',
    rules: [],
    options: [
      {
        value: 1,
        label: '是'
      },
      {
        value: 0,
        label: '否'
      }
    ],
    change: (from:any) => hanldeChangeForm(handleSaveCodeIndex(from, kCodes.productOnly))
  },
  {
    label: 'newProductDefault',
    ref: kCodes.newProductDefault,
    Val: '',
    required: false,
    type: 'radio',
    rules: [],
    options: [
      {
        value: 1,
        label: '是'
      },
      {
        value: 0,
        label: '否'
      }
    ],
    change: (from:any) => hanldeChangeForm(handleSaveCodeIndex(from, kCodes.newProductDefault))
  },
  {
    label: 'newBlockDefault',
    ref: kCodes.newBlockDefault,
    Val: '',
    required: false,
    type: 'radio',
    rules: [],
    options: [
      {
        value: 1,
        label: '是'
      },
      {
        value: 0,
        label: '否'
      }
    ],
    change: (from:any) => hanldeChangeForm(handleSaveCodeIndex(from, kCodes.newBlockDefault))
  }
  // {
  //   label: 'chooseIf',
  //   ref: 'chooseIf',
  //   Val: '',
  //   required: false,
  //   type: 'input',
  //   rules: []
  // },
  // {
  //   label: 'abandonIf',
  //   ref: 'abandonIf',
  //   Val: '',
  //   required: false,
  //   type: 'input',
  //   rules: []
  // }
]
const refFormDom = ref<null | HTMLElementAny>(null)

const hanldeChangeForm = debounce(async (codeIndex:CodeTransformation) => {
  const param = {
    ...codeIndex,
    modelId: currentModelNode.value.id,
    workspaceId: currentModelNode.value.workspaceId
  }
  refFormDom.value.validateFn(async () => {
    const path = codeIndex.id
      ? 'codeIndex/updateCodeIndexFromDB'
      : 'codeIndex/insertCodeIndexFromDB'
    await store.dispatch(path, param)

    codeIndex.id && store.commit('models/updateCurrentFormulaItem', {
      id: CodeIndexNavigationNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id,
      name: codeIndex.name + '.' + '(' + currentModelNode.value!.name + ')',
      content: '',
      key: '',
      modelName: currentModelNode.value!.name,
      modelId: codeIndex.modelId,
      propertyType: CodeIndexNavigationNodeType.codeIndex,
      propertyId: CodeIndexNavigationNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id,
      unsaved: false,
      readOnly: false,
      hasCalcFormula: true,
      breadcrumb: [currentModelNode.value!.name, codeIndex.name],
      openTime: new Date().getTime(),
      modifiedAt: codeIndex.updatedAt,
      chooseIf: codeIndex.chooseIf,
      abandonIf: codeIndex.abandonIf,
      isCodeIndex: true
    })
    const modelId = getCurrentModelBlockModelId() as number
    const products = masterDataSource.getCompleteMastersByModelId(modelId)
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      product.updateCodeIndexName(codeIndex.id, codeIndex.name)
      await store.dispatch('masters/updateMasterFromDB', product)
    }
  })
}, 600)

</script>
<style lang="scss" scoped>
.form-box{
  width: 100%;
  height: 100%;
  padding: 20px 20px 0 0;
}
</style>

import { createNamespacedHelpers } from 'vuex'
import TagsInput from '../../components/TagsInput.vue'
import FormulaInput from '../../components/FormulaInput.vue'
import {
  CopyType, CopyTypeBlock, SeriesSource, LinkSource, PropertyType, VariableSource, MethodSource
} from '@shared/dataModelTypes/models/helpers'
import { hasCalcFormula, getPropertyType, getModelNodeType, ModelNodeType, getModelNavigationNodeIdAndType } from '../../../utils'
import type { ComponentOptionsMixin } from 'vue'
import { SimplifiedModel, SimplifiedModelBlock, Property, ModelNavigationTree, ModelBlock } from '@shared/dataModelTypes'
import modelsDataSource from '../../../store/modules/modelsDataSource'
import { equals, clone, omit } from '@shared/functional'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import { dataInputBlockIDDelimiter } from '@shared/dataModelTypes/dataInputs'
import { throttle, debounce } from 'lodash'
import eventBus, { resetFormulaContent } from '@/views/CoderView/eventBus'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'

const { mapState, mapGetters, mapMutations, mapActions } = createNamespacedHelpers('models/')
const { mapActions: mapOutputsActions } = createNamespacedHelpers('outputs/')
const isCppKeywords = (value: string): boolean => {
  const list = [
    'auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const',
    'continue', 'default', 'delete', 'do', 'double', 'else', 'enum', 'false',
    'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long',
    'mutable', 'namespace', 'new', 'operator', 'private', 'protected', 'public',
    'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
    'template', 'this', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
    'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'while', 'name', 'profile', 'links', 'series', 'variables'
  ]
  return list.indexOf(value) !== -1
}
interface TargetOptionItem {
  id: number // this is the mask actual db id
  type: string,
  maskName: string,
  blockName: string
}

const omitProperty = [
  'modifiedAt',
  'copySizeFunctionLines',
  'initializeFormula',
  'finalizeFormula',
  'runAfterRebaseFormula',
  'rebaseBaseFunctionLines',
  'copyFormula',
  'copyFormula'
]

const keywordsValidator = (rule: any, newName: string, callback: any) => {
  if (isCppKeywords(newName)) {
    callback(new Error('不允许包含C++关键字'))
  } else {
    callback()
  }
}

// only trigger save to db when changing the same currentModelNode
// switching to a different model node should not trigger db saving
const saveModelOrModelBlockToDB = debounce((newValue: SimplifiedModel | SimplifiedModelBlock, oldValue: SimplifiedModel | SimplifiedModelBlock, context: any) => {
  context.$refs.form?.validate((valid: boolean) => {
    if (valid) {
      if (getModelNodeType(newValue) === ModelNodeType.modelBlocks) {
        context.saveUpdatedCurrentModelBlockToDB()
      } else {
        context.saveUpdatedCurrentModelToDB()
      }
    }
  })
}, 600)

const duplicatedModelBlockNameValidator = (modelBlockId: number) => {
  return (rule: any, newName: string, callback: (...args: any[]) => void) => {
    modelsDataSource.validateNewModelBlockName(rule, modelBlockId, newName, callback)
  }
}

const duplicatedModelNameValidator = (modelId: number) => {
  return (rule: any, newName: string, callback: (...args: any[]) => void) => {
    modelsDataSource.validateNewModelName(rule, modelId, newName, callback)
  }
}

export const modelNodeMixin: ComponentOptionsMixin = {
  components: { TagsInput, FormulaInput },
  data() {
    return {
      dataTypeOptions: [
        {
          label: 'entry_date_data',
          value: 'entry_date_data'
        },
        {
          label: 'entry_t_data',
          value: 'entry_t_data'
        }
      ]
    }
  },
  computed: {
    ...mapState(['currentModelNode', 'openedFormulaItems', 'classifyList', 'currentFormulaItem', 'temporaryModelNode', 'displayModelTreeNavi']),
    ...mapGetters(['modelMap', 'modelBlockMap']),
    isProductDisabled(): boolean {
      const detailedChildren = this.currentModelNode?.detailedChildren || [] as ModelBlock[]
      const noProductChildren = detailedChildren.filter((child: ModelBlock) => !child.isProductMask)
      return this.$route.path === '/product' ||
        (noProductChildren.length || this.currentModelNode.parentId)
    },
    formRules() {
      const nameRules: any[] = [
        { required: true, message: '名称不允许为空', trigger: 'blur' },
        // { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
        { pattern: /^[a-zA-Z]\w{0,63}$/, message: '只允许以字母开头,包含下划线、字母或数字,长度1-' + inputNameLength + '位' },
        { validator: keywordsValidator }
      ]
      if (getModelNodeType(this.currentModelNode) === ModelNodeType.modelBlocks) {
        nameRules.push({ validator: duplicatedModelBlockNameValidator(this.currentModelNode.id), trigger: 'blur' })
      } else {
        nameRules.push({ validator: duplicatedModelNameValidator(this.currentModelNode.id), trigger: 'blur' })
      }
      return {
        name: nameRules
      }
    },
    newCurrentModelNode() {
      return this.currentModelNode
    },
    groupSeparatorOptions() {
      const dataMappingItems = modelsDataSource.getDataMappingItemsForABlock(this.currentModelNode.id)
      return dataMappingItems.map(item => {
        return { label: item.name, value: item.blockId + dataInputBlockIDDelimiter + item.name }
      })
    }
  },
  watch: {
    currentModelNode: {
      handler(newValue, oldValue) {
        const context = this as any
        if (!newValue) {
          context.oldProperty = undefined
          return
        }
        // if (context.ShowModelTreeNav) return
        const oim = ['series', 'variables', 'detailedChildren', 'detailedParent', 'links', 'methods']
        context.newProperty = omit(oim, newValue)
        // only trigger save to db when changing the same property
        // switching to a different property should not trigger db saving
        if (newValue) {
          if (context.oldProperty && newValue.id === context.oldProperty.id) {
            if (getModelNodeType(newValue) === getModelNodeType(context.oldProperty)) {
              const newObject = omit([...omitProperty, ...oim], newValue)
              const oldObject = omit(omitProperty, context.oldProperty)
              const flag = equals(newObject, oldObject)
              //  const flag = equalsProperty(context.newProperty, context.oldProperty)
              if (!flag) {
                console.log('block save db')
                // console.log(newValue, '  console.log(newValue)')
                saveModelOrModelBlockToDB(newValue, oldValue, this)
              }
            }
          }
        }
        context.oldProperty = clone(context.newProperty)
      },
      deep: true,
      immediate: true
    },
    displayModelTreeNavi: {
      handler(newVal) {
        const context = this as any
        context.ShowModelTreeNav = newVal
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapMutations(['updateCurrentFormulaItem', 'closeFormula']),
    ...mapActions(['saveUpdatedCurrentModelBlockToDB', 'saveUpdatedCurrentModelToDB', 'selectProperty']),
    ...mapOutputsActions(['updatedOutputs']),
    editFormula(content: string, key: string) {
      this.updateCurrentFormulaItem(modelsDataSource.generateBlockFormulaItem(this.currentModelNode.name, this.currentModelNode.id, key, content))
    }
  }
}

const savePropertyToDB = throttle((newValue: Property, context: any, oldProperty: Property) => {
  context.$refs.form?.validate(async (valid: boolean) => {
    if (valid) {
      await context.saveUpdatedCurrentPropertyToDB(newValue)
      !newValue.isDefining && oldProperty.isDefining &&
        eventBus.emit(resetFormulaContent)
    }
    // context.saveFormulaForCurrentFormulaItem(newValue)
  })
}, 600)

const duplicatedPropertyNameValidator = (propertyId: string, modelBlockId: number) => {
  return (rule: any, newName: string, callback: any) => {
    modelsDataSource.validateNewPropertyName(rule, propertyId, modelBlockId, newName, callback)
  }
}

export const propertyMixin: ComponentOptionsMixin = {
  components: { FormulaInput },
  data() {
    return {
      oldProperty: undefined,
      curDate: 0,
      ShowModelTreeNavi: false,
      disabledProduct: false
    }
  },
  computed: {
    ...mapState(['currentModelNode', 'currentProperty', 'classifyList', 'currentFormulaItem', 'displayModelTreeNavi']),
    ...mapGetters(['modelMap', 'modelBlockMap']),
    ...mapActions(['selectProperty']),
    isFormulaDisabled(): boolean {
      return this.currentProperty?.isDirect
        ? false : !this.currentProperty.isDefining
    },
    isFieldDisabled(): boolean {
      return !this.currentProperty?.isDirect
    },
    isOverrideDisabled(): boolean {
      return this.isFormulaDisabled || this.currentProperty.source === 'toDefine'
    },
    isOverrideVisible(): boolean {
      return modelsDataSource.getModelBlockType(this.currentModelNode.id) !== ModelBlockType.childBlocks
    },
    isDefiningDisabled(): boolean {
      if (this.displayModelTreeNavi) return true
      try {
        const parentModelBlock = modelsDataSource.getCompleteModelBlock(this.currentModelNode.parentId)!
        const propertyType = getPropertyType(this.currentProperty)
        const parentProperty = parentModelBlock[propertyType][this.currentProperty.id] as any
        // if parent property's override is false, return true
        if (parentProperty.override === false) return true
        // if parent property's override is true
        // then if parent property's source === toDefine, return true
        // then else return false
        if (parentProperty.override && parentProperty.source === 'toDefine') return true
        return false
      } catch {
        return false
      }
    },
    isValueInputVisible(): boolean {
      if (this.displayModelTreeNavi) return true
      if (this.currentProperty.source === 'parent') {
        const parentModelBlock = modelsDataSource.getCompleteModelBlock(this.currentModelNode.parentId)!
        const propertyType = getPropertyType(this.currentProperty)
        const parentProperty = parentModelBlock[propertyType][this.currentProperty.id] as any
        if (parentProperty.source === 'parent') {
          const mask = modelsDataSource.getCompleteModelBlock(parentModelBlock.parentId!)!
          const maskProperty = mask[propertyType][this.currentProperty.id] as any
          return maskProperty.source === 'default' || maskProperty.source === 'assumption'
        }
        return parentProperty.source === 'default' || parentProperty.source === 'assumption'
      } else {
        return this.currentProperty.source === 'default' || this.currentProperty.source === 'assumption'
      }
    },
    isCalcFormulaVisible(): boolean {
      if (this.displayModelTreeNavi) return true
      if (this.currentProperty.source === 'parent') {
        const parentModelBlock = modelsDataSource.getCompleteModelBlock(this.currentModelNode.parentId)!
        const propertyType = getPropertyType(this.currentProperty)
        const parentProperty = parentModelBlock[propertyType][this.currentProperty.id] as any
        if (parentProperty && parentProperty.source === 'parent') {
          const mask = modelsDataSource.getCompleteModelBlock(parentModelBlock.parentId!)!
          const maskProperty = mask[propertyType][this.currentProperty.id] as any
          return maskProperty.source === 'calculated'
        } else if (parentProperty) {
          return parentProperty.source === 'calculated'
        }
        return this.currentProperty.source === 'calculated'
      } else {
        return this.currentProperty.source === 'calculated'
      }
    },
    formRules() {
      return {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: this.currentProperty ? duplicatedPropertyNameValidator(this.currentProperty.id, this.currentModelNode.id) : (rule: any, newName: string, callback: any) => callback(), trigger: 'blur' },
          // { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
          // { pattern: /^[A-z]/, message: '首字母只允许是字母' },
          { pattern: /^[a-zA-Z]\w{0,63}$/, message: '只允许以字母开头,包含下划线、字母或数字,长度1-' + inputNameLength + '位' },
          { validator: keywordsValidator }
        ]
      }
    },
    sourceOptions() {
      let sourceEnum: typeof VariableSource | typeof SeriesSource | typeof LinkSource
      const propertyType = getPropertyType(this.currentProperty)
      if (propertyType === PropertyType.variables) {
        sourceEnum = VariableSource as any
      } else if (propertyType === PropertyType.series) {
        sourceEnum = SeriesSource as any
      } else if (propertyType === PropertyType.links) {
        sourceEnum = LinkSource as any
      } else {
        sourceEnum = MethodSource as any
      }

      const modelBlockType = modelsDataSource.getModelBlockType(this.currentModelNode.id)
      const options = Object.values(sourceEnum)
        .filter(type => {
          const noProduct = this.$route.path !== '/product'
          if (noProduct) {
            return type !== sourceEnum.codeIndexFormula
          }
          return type
        })
        .filter(type => {
          if (modelBlockType === ModelBlockType.masks) {
            return type !== sourceEnum.parent
          } else {
            const parentModelBlock = modelsDataSource.getCompleteModelBlock(this.currentModelNode.parentId)!
            const parentProperty = parentModelBlock[propertyType][this.currentProperty.id] as any
            if (parentProperty && parentProperty.source === sourceEnum.toDefine) {
              return type !== sourceEnum.toDefine && type !== sourceEnum.parent
            } else if (parentProperty && this.currentProperty.isDefining) {
              return type !== sourceEnum.toDefine && type !== sourceEnum.parent
            } else if (parentProperty) {
              return type !== sourceEnum.toDefine
            } else {
              return type !== sourceEnum.toDefine && type !== sourceEnum.parent
            }
          }
        })
        .map(type => {
          if (type === 'calculated') {
            return { label: '公式', value: type }
          }
          if (type === 'parent') {
            return { label: '父级', value: type }
          }
          if (type === 'toDefine') {
            return { label: '空白', value: type }
          }
          if (type === 'default') {
            return { label: '默认', value: type }
          }
          if (type === 'transmit') {
            return { label: '传递', value: type }
          }
          if (type === 'data') {
            return { label: '数据', value: type }
          }
          if (type === 'assumption') {
            return { label: '假设', value: type }
          }
          if (type === 'codeIndex' || type === 'codeIndexFormula') {
            return { label: '索引', value: type }
          }
          return { label: type, value: type }
        })
      return options
    },
    currentClassIfy() {
      const resultClassIfy = this.classifyList.filter((item: any) => {
        return item.modelId === this.currentModelNode.modelId
      })
      const newResultClassify = resultClassIfy.filter((item: any) => {
        return item.name === this.currentProperty.classify
      })
      if (newResultClassify.length === 0) {
        this.currentProperty.classify = ''
      }
      //  this.currentProperty.modifiedAt = new Date().getTime()
      return resultClassIfy
    },
    linkTargetName() {
      if (this.currentProperty) {
        if (this.currentProperty.target) {
          return this.currentProperty.target.maskName
        }
      }
      return ''
    }
  },
  watch: {
    currentProperty: {
      handler(newValue, oldValue) {
        const context = this as any
        if (!newValue) {
          context.oldProperty = undefined
          return
        }
        // if (context.ShowModelTreeNav) return

        if (oldValue) {
          const newObject = omit(omitProperty, newValue)
          const oldObject = omit(omitProperty, context.oldProperty)
          const flag = equals(newObject, oldObject)
          // only trigger save to db when changing the same property
          // switching to a different property should not trigger db saving
          if (!flag) {
            if (newValue && context.oldProperty && newValue.id === context.oldProperty.id) {
              console.log('property save db')
              if (newValue.modifiedAt === undefined) {
                newValue.modifiedAt = new Date().getTime()
              } else if ((new Date().getTime() - newValue.modifiedAt) > 60000) {
                newValue.modifiedAt = new Date().getTime()
              }
              savePropertyToDB(newValue, this, clone(context.oldProperty))
              // context.onSourceChangeToChangeCurrentFormula(newValue)
            }
          }
        }
        newValue.returnPeerModelValueBfRebase = !!newValue.returnPeerModelValueBfRebase
        context.oldProperty = clone(newValue)
      },
      deep: true,
      immediate: true
    },
    displayModelTreeNavi: {
      handler(newVal) {
        const context = this as any
        context.ShowModelTreeNav = newVal
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapMutations(['updateCurrentFormulaItem', 'closeFormula', 'updateCurrentFormulaItemForBySource']),
    ...mapActions(['saveUpdatedCurrentPropertyToDB', 'saveFormulaForCurrentFormulaItem']),
    editFormula(content: string, key: string) {
      let parentProperty: Property | undefined
      if (this.currentModelNode.parentId) {
        const parentModelBlock = modelsDataSource.getCompleteModelBlock(this.currentModelNode.parentId)!
        const propertyType = getPropertyType(this.currentProperty)
        parentProperty = parentModelBlock[propertyType][this.currentProperty.id] as any
      }
      const f = {
        name: this.currentProperty.name + '.' + key + ' (' + this.currentModelNode.name + ')',
        content,
        key,
        blockName: this.currentModelNode.name,
        modelId: modelsDataSource.getModelIdFormula(this.currentModelNode.id),
        blockId: this.currentModelNode.id,
        propertyType: getPropertyType(this.currentProperty),
        propertyId: this.currentProperty.id,
        unsaved: false,
        readOnly: this.isFormulaDisabled,
        hasCalcFormula: hasCalcFormula(this.currentProperty, parentProperty),
        breadcrumb: modelsDataSource.getBreadcrumb(this.currentModelNode.id, this.currentProperty, key),
        modifiedAt: new Date().getTime(),
        isCodeIndex: this.currentProperty.source === 'codeIndex'
      }
      this.updateCurrentFormulaItem({
        ...f,
        id: modelsDataSource.getUniqueIdentificationFormula(f)
      })
    },
    onSourceChangeToChangeCurrentFormula(newValue: any) {
      this.updateCurrentFormulaItem({
        ...this.currentFormulaItem,
        hasCalcFormula: hasCalcFormula(newValue!)
      })
    },
    onSourceChange(value: string) {
      if (value === 'toDefine') {
        this.currentProperty.override = true
        if (this.currentProperty.parentId) {
          this.currentProperty.isDefining = false
        }
      } else {
        this.currentProperty.isDefining = true
      }
    },
    onDefiningChange(value: boolean) {
      if (value && this.currentProperty.source === 'parent') {
        this.currentProperty.source = 'calculated'
      }
    },
    onSelectTarget(target: string) {
      const targetItem = this.targetOptions.find((targetOption: TargetOptionItem) => targetOption.maskName === target)
      this.currentProperty.target = targetItem
    }
  }
}

export const copyTypeOptionsMixin: ComponentOptionsMixin = {
  copyTypeOptions: Object.values(CopyType).map(type => {
    if (type === 'fixed') {
      return { label: '固定', value: type }
    }
    if (type === 'dynamic') {
      return { label: '动态', value: type }
    }
    // if (type === 'data') {
    //   return { label: '数据', value: type }
    // }
    return { label: '无', value: type }
  })
}

export const copyTypeBlockOptionsMixin: ComponentOptionsMixin = {
  copyTypeBlockOptions: Object.values(CopyTypeBlock).map(type => {
    if (type === 'fixed') {
      return { label: '固定', value: type }
    }
    if (type === 'dynamic') {
      return { label: '动态', value: type }
    }
    if (type === 'data') {
      return { label: '数据', value: type }
    }
    return { label: '无', value: type }
  })
}

export const seriesSourceOptionsMixin: ComponentOptionsMixin = {
  sourceOptions: Object.values(SeriesSource).map(type => {
    if (type === 'parent') {
      return { label: '父级', value: type }
    }
    if (type === 'toDefine') {
      return { label: '空白', value: type }
    }
    if (type === 'calculated') {
      return { label: '公式', value: type }
    }
    return { label: type, value: type }
  })
}

export const linkSourceOptionsMixin: ComponentOptionsMixin = {
  sourceOptions: Object.values(LinkSource).map(type => {
    if (type === 'parent') {
      return { label: '父级', value: type }
    }
    if (type === 'toDefine') {
      return { label: '空白', value: type }
    }
    if (type === 'calculated') {
      return { label: '公式', value: type }
    }
    if (type === 'transmit') {
      return { label: '传递', value: type }
    }
    return { label: type, value: type }
  }),
  computed: {
    ...mapState(['modelNavigationTree']),
    targetOptions(): TargetOptionItem[] {
      if (!this.currentModelNode || getModelNodeType(this.currentModelNode) === ModelNodeType.models) {
        return []
      }
      const ancestorModelId = ModelNodeType.models + NaviNodeIdDelimiter + this.currentModelNode.modelId
      const targetOptions = [] as TargetOptionItem[];
      (this.modelNavigationTree as ModelNavigationTree)
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
    }
  }
}

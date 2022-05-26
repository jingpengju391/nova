<script lang="ts">
import MaskNavigation from '../ModelNavigation/MaskNavigation.vue'
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import modelsDataSource from '@/store/modules/modelsDataSource'
import type { Model, ModelBlock, SimplifiedModelBlock } from '@shared/dataModelTypes'
import {
  NaviNodeIdDelimiter,
  ModelNavigationNodeType,
  ModelNavigationNode, ModelNavigationTree
} from '@shared/dataModelTypes/models/models'
import type { ContextMenuItemProps } from '../../components/ContextMenu/types'
import { LinkSource } from '@shared/dataModelTypes/models/helpers'
import { getModelNavigationNodeIdAndType, copyTypeBlockOptions, ModelNodeType, getModelNodeType } from '@/utils'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
const { mapState, mapMutations, mapActions } = createNamespacedHelpers('relation/')
const { mapMutations: modelMapMutations } = createNamespacedHelpers('models/')
interface QueueElement {
  modelBlock: ModelBlock
  parentTreeNode: ModelNavigationNode | undefined
  previousLinkedMaskNames: Set<string> | undefined
  previousAllDefaultLinks: Set<string> | undefined
  previousAllLinks: Set<string> | undefined
}

export default defineComponent({
  name: 'BlockView',
  extends: MaskNavigation,
  data() {
    return {
      nodeKey: 'nodeKey'
    }
  },
  computed: {
    ...mapState(['modelNavigationTree', 'toModelNavigationTree']),
    fromMaskandLinkRules() {
      const maskRules: any[] = [
        { required: true, message: '名称不允许为空', trigger: 'blur' },
        { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
        { pattern: /^[A-z]/, message: '首字母只允许是字母' },
        { validator: this.keywordsValidator },
        { validator: this.duplicatedModelBlockNameValidator(0), trigger: 'blur' }
      ]
      return {
        maskName: maskRules,
        linkName: maskRules
      }
    }
    // partNavigationTree() {
    //   return this.buildAllModelTrees()
    // }
  },
  methods: {
    ...modelMapMutations(['clearCurrentMaskAndLink']),
    ...mapMutations(['addModelsToDataSourceAndNaviTree', 'deleteModelFromDataSourceAndNaviTree', 'updateCurrentNavigationNode', 'updatedRelationModelNavigationTreeByProperty']),
    ...mapActions(['updateModelRootBlockIdToDb', 'addModelBlockToDb', 'saveUpdatedRelationModelBlockToDb', 'delRelationLinkByModelBlockToDb']),
    isCppKeywords(value: string) {
      const list = [
        'auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const',
        'continue', 'default', 'delete', 'do', 'double', 'else', 'enum', 'false',
        'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long',
        'mutable', 'namespace', 'new', 'operator', 'private', 'protected', 'public',
        'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
        'template', 'this', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
        'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'while'
      ]
      return list.indexOf(value) !== -1
    },
    keywordsValidator(rule: any, newName: string, callback: any) {
      if (this.isCppKeywords(newName)) {
        callback(new Error('不允许包含C++关键字'))
      } else {
        callback()
      }
    },
    duplicatedModelBlockNameValidator(rule: any, newName: string, callback: any) {
      const { id, type } = getModelNavigationNodeIdAndType(this.addBlocksDialogFormData.modelId)
      callback && modelsDataSource.validateNewModelBlockName(rule, 0, newName, callback, id)
    },
    buildAllModelTrees(): ModelNavigationTree {
      this.isHideCopyModelBlock = true
      const allModels = modelsDataSource.getAllModels()
      const tree = [] as ModelNavigationTree
      allModels.filter(model => model.id).forEach(model => {
        const modelTreeNode: any = {
          name: model.name,
          id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + model.id,
          children: []
        }
        tree.push(modelTreeNode)
        if (!model.rootBlockId) return
        this.buildModelTreeForModel(model, modelTreeNode)
      })
      return tree
    },
    buildModelTreeForModel(model: Model, modelTreeNode: ModelNavigationNode) {
      if (!model.rootBlockId) return
      const rootBlock = modelsDataSource.getCompleteModelBlock(model.rootBlockId)
      if (!rootBlock || !rootBlock.modelId) return
      const allModelBlocks = modelsDataSource.getAllModelBlocksForAModel(rootBlock.modelId)
      const modelBlockNameMap = allModelBlocks.reduce((acc, cur) => {
        acc.set(cur.name, cur)
        return acc
      }, new Map<string, ModelBlock>())
      const queue = [{
        modelBlock: rootBlock,
        parentTreeNode: modelTreeNode,
        previousLinkedMaskNames: new Set<string>(),
        previousAllDefaultLinks: new Set<string>(),
        previousAllLinks: new Set<string>()
      }] as QueueElement[]
      const nextQueue = [] as QueueElement[]
      const linkQueue = [] as QueueElement[]
      let newPreviousLinkedMaskNames: Set<string> | undefined
      const previousAllDefaultLinks = new Set<string>()
      const previousAllLinks = new Set<string>()
      while (queue.length > 0) {
        const currentElement = queue.shift()!
        const currentTreeNode: any = {
          name: currentElement.modelBlock.name,
          children: [],
          parentNode: currentElement.parentTreeNode
        }
        currentTreeNode.id = currentElement.modelBlock.id

        if (typeof currentTreeNode.id === 'number') {
          currentTreeNode.id = ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + currentElement.modelBlock.id
        }
        currentTreeNode.nodeKey =
          currentElement.parentTreeNode
            ? currentElement.modelBlock.id + NaviNodeIdDelimiter + currentElement?.parentTreeNode?.id || 0
            : currentTreeNode.id
        newPreviousLinkedMaskNames = currentElement.previousLinkedMaskNames
        newPreviousLinkedMaskNames && newPreviousLinkedMaskNames.add(currentElement.modelBlock.name)
        currentElement.parentTreeNode?.children.push(currentTreeNode)
        const sameLevelLinkedMaskName = new Set<string>()
        Object.values(currentElement.modelBlock.links).forEach((link: any) => {
          linkQueue.push(link)
          if (!link.target || !link.target.maskName || !link.target.type) return
          if (newPreviousLinkedMaskNames && newPreviousLinkedMaskNames.has(link.target.maskName)) return
          if (sameLevelLinkedMaskName.has(link.target.maskName)) return
          if (link.source === LinkSource.default && previousAllDefaultLinks.has(link.target.maskName)) return
          if (previousAllLinks.has(link.target.maskName + '::' + link.name)) return
          sameLevelLinkedMaskName.add(link.target.maskName)
          const newModelBlock = modelBlockNameMap.get(link.target.maskName)
          const newParentTreeNode = currentTreeNode
          nextQueue.push({
            modelBlock: newModelBlock,
            parentTreeNode: newParentTreeNode,
            previousLinkedMaskNames: new Set<string>(newPreviousLinkedMaskNames),
            previousAllDefaultLinks: new Set<string>(previousAllDefaultLinks),
            previousAllLinks: new Set<string>(previousAllLinks)
          })
        })
        if (queue.length === 0) {
          while (nextQueue.length > 0) {
            const currentElement = nextQueue.shift()!
            if (currentElement.modelBlock) {
              previousAllDefaultLinks.add(currentElement.modelBlock.name)
              queue.push(currentElement)
            }
          }
          while (linkQueue.length > 0) {
            const currentLink: any = linkQueue.shift()!
            if (currentLink.target) {
              if (currentLink.source === LinkSource.default) {
                previousAllDefaultLinks.add(currentLink.target.maskName)
              }
              previousAllLinks.add(currentLink.target.maskName + '::' + currentLink.name)
            }
          }
        }
      }
    },
    onClickNewModelBlock(node: ModelNavigationNode) {
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      if (type === ModelNodeType.models) {
        this.addModelMaskOrBlockVisible = true
        this.addBlocksDialogFormData.parent = node.name
        this.addBlocksDialogFormData.modelId = node.id
        return
      }
      this.modelTreeVisible = true
      this.updateCurrentNavigationNode(node)
    },
    onSubmit() {
      (this.$refs.formMaskandLink as HTMLElementAny).validate(async (valid: boolean) => {
        if (!valid) return
        await this.addModelBlockToDb().catch(err => this.showCreateModelBlockErrorMessage(err))
        await this.saveUpdatedRelationModelBlockToDb()
        this.modelTreeVisible = false
      })
    },
    getMaskNaviNodeContextMenuItems(maskId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
      const { type } = getModelNavigationNodeIdAndType(node.parentNode.id)
      return type === ModelNodeType.models
        ? this.getRootMaskNaviNodeContextMenuItems(maskId, node)
        : this.getUnRootMaskNaviNodeContextMenuItems(maskId, node)
    },
    getRootMaskNaviNodeContextMenuItems(maskId: number, node: ModelNavigationNode) {
      return [
        {
          title: '属性',
          shortCut: 'Ctrl+r',
          onClick: () => this.updateCurrentModelNodeWithModelNaviNode(node)
        },
        {
          title: '删除',
          shortCut: 'Ctrl+d',
          onClick: async () => {
            this.$alert(`确定要删除Mask ${node.name}?`, '提示', {
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              showCancelButton: true
            }).then(() => {
              this.deleteMask(maskId)
            }).catch(() => { })
          }
        }
      ]
    },
    getUnRootMaskNaviNodeContextMenuItems(maskId: number, node: ModelNavigationNode) {
      return [
        {
          title: '属性',
          shortCut: 'Ctrl+r',
          onClick: () => this.updateCurrentModelNodeWithModelNaviNode(node)
        },
        {
          title: '删除关联',
          shortCut: 'Ctrl+d',
          onClick: async () => {
            this.$alert(`确定要删除关联关系Mask ${node.name}?`, '提示', {
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              showCancelButton: true
            }).then(() => {
              this.delRelationLinkByModelBlockToDb(maskId)
            }).catch(() => { })
          }
        }
      ]
    }
  },
  watch: {
    modelTreeVisible(val) {
      !val && this.clearCurrentMaskAndLink()
      !val && this.updateCurrentNavigationNode(undefined)
    },
    toModelNavigationTree: {
      handler(newValue) {
        const { addModelsToDataSourceAndNaviTree, buildAllModelTrees } = this
        addModelsToDataSourceAndNaviTree(buildAllModelTrees())
        this.updatedRelationModelNavigationTreeByProperty(false)
      },
      deep: true,
      immediate: true
    }
  }
})
</script>
<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";
@import "../scss/mask-navigation.scss";
</style>

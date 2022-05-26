<template>
  <div class="model-nav-tree">
    <el-input
      class="filter-input"
      prefix-icon="search"
      placeholder="输入关键字过滤"
      v-model="filterText"
    />
    <el-tree
      ref="modelNaviTree"
      class="navi-tree"
      :node-key="nodeKey"
      :data="modelNavigationTree"
      :props="defaultProps"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      empty-text="无匹配结果"
      :check-on-click-node="true"
      :highlight-current="true"
      @node-contextmenu="onRightClickModelNaviNode"
      @node-click="onClickModelNaviNode"
    >
      <template #default="{ node }">
        <span class="navi-node">
          <span :class="node.data.id === '0' ? 'title warn-text' : 'title'">
            <el-icon class="icon"><document /> </el-icon
            >{{ node.data.name || temporaryModelNodeName(node.data) }}</span
          >
          <span class="tool-sets">
            <icon-button
              v-if="isSubNodeAddable(node.data) && !isHideNewModelBlock"
              :tooltip="modelNodeAddTooltip(node.data)"
              @click.stop="onClickNewModelBlock(node.data)"
              icon-class="document-add"
            />
            <icon-button
              v-if="isCopy"
              :tooltip="modelNodeCopyTooltip(node.data)"
              icon-class="document-copy"
              @click.stop="onClickDuplicateModelBlock(node.data)"
            />
          </span>
        </span>
      </template>
    </el-tree>
    <div class="classify-dialog">
      <el-dialog title="编辑分类" v-model="dialogTableVisible" top="30vh">
        <el-button size="small" type="primary" @click="handleAddNewClassify()"
          >新增</el-button
        >
        <el-table class="classifys-list" :data="classifys" height="200">
          <el-table-column property="name" label="名称" width="150">
            <template #default="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column property="remarks" label="备注">
            <template #default="scope">
              {{ scope.row.remarks }}
            </template>
          </el-table-column>
          <el-table-column width="250" label="操作" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteNewClassify(scope.$index, scope.row)"
                >删除</el-button
              >
              <el-button
                size="small"
                type="primary"
                @click="handleEditNewClassify(scope.$index, scope.row)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <div class="classify-inner-dialog">
          <el-dialog
            :title="dialogFromTitle === 'add' ? '新增' : '编辑'"
            v-model="dialogFromVisible"
            top="25vh"
            width="30%"
            :before-close="resetForm"
          >
            <el-form
              :model="dialogFromData"
              ref="fromClassifyrules"
              :rules="fromClassifyrules"
            >
              <el-form-item label="名称" label-width="60px" prop="name">
                <el-input
                  v-model="dialogFromData.name"
                  placeholder="请输入分类名称"
                  autocomplete="off"
                ></el-input>
              </el-form-item>
              <el-form-item label="备注" label-width="60px">
                <el-input
                  v-model="dialogFromData.remarks"
                  placeholder="请输入备注"
                  autocomplete="no"
                ></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="resetForm()">取消</el-button>
                <el-button type="primary" @click="dialogFromConfirm()"
                  >确定</el-button
                >
              </span>
            </template>
          </el-dialog>
        </div>
      </el-dialog>
    </div>
    <el-dialog v-model="modelTreeVisible" title="输入名称...">
      <el-form
        label-position="right"
        label-width="100px"
        :model="currentMaskAndLink"
        :rules="fromMaskandLinkRules"
        ref="formMaskandLink"
      >
        <el-form-item label="关联模块" prop="maskName">
          <el-input v-model="currentMaskAndLink.maskName"></el-input>
        </el-form-item>
        <el-form-item label="关联链接" prop="linkName">
          <el-input v-model="currentMaskAndLink.linkName"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="modelTreeVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit()">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="addModelMaskOrBlockVisible" title="新建模块">
      <el-form
        label-position="right"
        label-width="100px"
        :model="addBlocksDialogFormData"
        :rules="formRules"
        ref="addBlocksDialog"
      >
        <el-form-item label="上级" prop="parent">
          <el-input
            v-model="addBlocksDialogFormData.parent"
            placeholder="请输入模块/子模块名称"
            disabled
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input
            v-focus
            v-model="addBlocksDialogFormData.name"
            placeholder="请输入模块/子模块名称"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            :rows="3"
            v-model="addBlocksDialogFormData.description"
          />
        </el-form-item>
        <el-form-item label="标签">
          <tags-input v-model="addBlocksDialogFormData.tags" />
        </el-form-item>
        <el-form-item label="数组模块">
          <el-select v-model="addBlocksDialogFormData.copyType">
            <el-option
              v-for="item in copyTypeBlockOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="起点重置">
          <el-radio-group v-model="addBlocksDialogFormData.rebaseNeeded">
            <el-radio label="yes">是</el-radio>
            <el-radio label="no">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="滑动窗口">
          <el-checkbox v-model="addBlocksDialogFormData.slidingWindow" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancelAddNewBlocks()">取消</el-button>
          <el-button type="primary" @click="onSubmitNewBlocks()"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { getModelNavigationNodeIdAndType, copyTypeBlockOptions, ModelNodeType, getModelNodeType } from '../../../utils'
import IconButton from '@/views/components/IconButton.vue'
import { ElTree, ElMessage } from 'element-plus'
import type { ModelBlock, ModelNavigationNode } from '@shared/dataModelTypes'
import { ModelNavigationNodeType, NaviNodeIdDelimiter, ModelNavigationTree } from '@shared/dataModelTypes/models/models'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import modelsDataSource from '../../../store/modules/modelsDataSource'
import type { ContextMenuItemProps } from '../../components/ContextMenu/types'
import TagsInput from '../../components/TagsInput.vue'
import { UnsavedModelBlockExistsError, UnsavedModelExistsError } from '../../../errors'
import { useWorkspacesAPIs } from '@/hooks'
import { useProductsAPIs } from '@/hooks/apis'
import { CodeIndex } from '@shared/dataModelTypes/product/indicators'
import { inputNameLength } from '@shared/commonUtils'

const { mapState, mapActions, mapMutations, mapGetters } = createNamespacedHelpers('models/')
const { mapMutations: mapCodeIndexMutations, mapActions: mapCodeIndexActions } = createNamespacedHelpers('codeIndex/')
const { mapMutations: relationMapMutations } = createNamespacedHelpers('relation/')
const { mapState: tasksMapState } = createNamespacedHelpers('tasks/')
export default defineComponent({
  components: { IconButton, TagsInput },
  data() {
    var validateClassifyName = (rule, value, callback) => {
      if (this.classifys.length) {
        const filter = this.classifys.filter(item => {
          return item.name === value
        })
        if (filter.length) {
          if (this.dialogFromTitle === 'edit') {
            callback()
          }
          callback(new Error('分类名称已存在'))
        } else {
          callback()
        }
      } else {
        if (value === '') {
          callback(new Error('分类名称不可为空'))
        } else {
          callback()
        }
      }
    }
    return {
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      classifys: [{
        name: '分类1',
        remarks: '这是分类1'
      }],
      fromClassifyrules: {
        name: [
          {
            required: true,
            message: 'Please input classify name',
            trigger: 'blur'
          },
          { validator: validateClassifyName, trigger: 'blur' }

        ]
      },
      isHideNewModelBlock: false,
      dialogTableVisible: false,
      dialogFromVisible: false,
      modelTreeVisible: false,
      addModelMaskOrBlockVisible: false,
      currentEditInd: 0,
      dialogFromData: {
        name: '',
        remarks: '',
        modelId: 0
      },
      nodeKey: 'id',
      formLabelWidth: '120px',
      dialogFromTitle: 'add',
      currentClassifyModelId: 0,
      addBlocksDialogFormData: {
        id: '',
        modelId: '',
        name: '',
        tags: [],
        parent: '',
        rebaseNeeded: 'no',
        slidingWindow: false,
        description: '',
        copyType: ''
      },
      copyTypeBlockOptions: [
        { label: '无', value: '' },
        { label: '固定', value: 'fixed' },
        { label: '动态', value: 'dynamic' },
        { label: '数据', value: 'data' }
      ]
    }
  },
  computed: {
    fromMaskandLinkRules() { return {} },
    ...mapState(['currentMaskAndLink', 'currentModelNode', 'classifyList', 'displayModelTreeNavi', 'modelNavigationTree']),
    ...tasksMapState(['isCompiling', 'isRunning']),
    formRules() {
      const nameRules: any[] = [
        { required: true, message: '名称不允许为空', trigger: 'blur' },
        // { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
        { pattern: /^[a-zA-Z]\w{0,63}$/, message: '以字母开头包含下划线或数字长度1-' + inputNameLength + '位' }
        //  { validator: keywordsValidator }
      ]
      nameRules.push({ validator: this.duplicatedModelBlockNameValidator, trigger: 'blur' })
      return {
        name: nameRules
      }
    },
    isCopy() {
      return !this.displayModelTreeNavi
    }
  },
  watch: {
    filterText(value: string) {
      (this.$refs.modelNaviTree as InstanceType<typeof ElTree>).filter(value)
    },
    currentModelNode(newValue) {
      if (!newValue) return
      newValue.modelId && this.updateCurrentCodeIndex(undefined)
      const modeNodeType = newValue.modelId
        ? ModelNavigationNodeType.modelBlocks : ModelNavigationNodeType.models
      const newCurrentKey = modeNodeType + NaviNodeIdDelimiter + newValue.id
      // highlight new current node
      this.$nextTick(() => {
        const naviTree = this.$refs.modelNaviTree as InstanceType<typeof ElTree>
        naviTree.setCurrentKey(newCurrentKey)
        this.$nextTick(() => {
          const treeElement = naviTree.$el as HTMLElement
          const currentNodeElement = document.getElementsByClassName('el-tree-node is-current')[0] as HTMLElement
          if (currentNodeElement) {
            const yDiff = currentNodeElement.getBoundingClientRect().y - treeElement.getBoundingClientRect().y
            if (yDiff > treeElement.getBoundingClientRect().height) {
              treeElement.scrollTop = treeElement.scrollTop + yDiff
            }
          }
        })
      })
    }
  },
  methods: {
    ...mapMutations(['updateCurrentModelNodeWithModelNaviNode', 'updateRelationCurrentModelNodeSourceNaviNode', 'showPropertyView']),
    ...mapCodeIndexMutations(['updateCurrentCodeIndex']),
    ...mapActions([
      'importModelsWithDBSync', 'addModel', 'addMask', 'addBlock', 'addBlockDialog', 'addChildBlock', 'addChildBlockDialog',
      'deleteModel', 'removeModelTempFolder', 'removeTempFolder', 'deleteMask', 'deleteBlock', 'deleteChildBlock', 'updateModelRootBlockIdToDb',
      'copyModel', 'copyModelBlock', 'saveUpdatedCurrentModelBlockToDB', 'addMaskDialog', 'createNewClassifyList', 'updateBlockLinks'
    ]),
    ...relationMapMutations(['updateRelationCurrentModelNodeSourceNaviNode']),
    duplicatedModelBlockNameValidator(rule: any, newName: string, callback: any) {
      const { id, type } = getModelNavigationNodeIdAndType(this.addBlocksDialogFormData.modelId)
      modelsDataSource.validateNewModelBlockName(rule, 0, newName, callback, id)
    },
    isShowAddButton(node: ModelNavigationNode): boolean {
      if (!this.displayModelTreeNavi) return true
      const { type } = getModelNavigationNodeIdAndType(node.id)
      return type !== ModelNavigationNodeType.models
    },
    ...mapCodeIndexActions(['importCodeIndexFromDB']),
    handleAddNewClassify() {
      this.dialogFromVisible = true
      this.dialogFromTitle = 'add'
      this.dialogFromData = {
        modelId: this.currentClassifyModelId,
        name: '',
        remarks: ''
      }
    },

    handleEditNewClassify(index, row) {
      const newFromData = this.classifys[index]
      const rows = JSON.parse(JSON.stringify(row))
      this.dialogFromVisible = true
      this.dialogFromTitle = 'edit'
      this.currentEditInd = index
      this.dialogFromData = rows
    },
    handleDeleteNewClassify(index, row) {
      this.classifys.splice(index, 1)
      const newArr = this.classifyList.filter(item => {
        return item.modelId !== this.currentClassifyModelId
      })
      newArr.push(...this.classifys)
      const classifyObj = { modelId: this.currentClassifyModelId, ClassifyList: this.classifys }
      this.createNewClassifyList(classifyObj)
    },
    resetForm(done) {
      this.$refs.fromClassifyrules.resetFields()
      this.dialogFromVisible = false
    },
    dialogFromConfirm() {
      this.$refs.fromClassifyrules.validate((valid) => {
        if (valid) {
          if (this.dialogFromTitle === 'add') {
            this.classifys.push(this.dialogFromData)
          } else if (this.dialogFromTitle === 'edit') {
            this.classifys[this.currentEditInd] = this.dialogFromData
          }
          this.dialogFromVisible = false
          const newArr = this.classifyList.filter(item => {
            return item.modelId !== this.currentClassifyModelId
          })

          newArr.push(...this.classifys)
          const classifyObj = { modelId: this.currentClassifyModelId, ClassifyList: this.classifys }
          this.createNewClassifyList(classifyObj)
        } else {
          return false
        }
      })
    },
    filterNode(value: string, data: Partial<ModelBlock>) {
      if (!value) return true
      return data.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    isSubNodeAddable(node: ModelNavigationNode) {
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      if (type === ModelNavigationNodeType.modelBlocks) {
        const modelBlockType = modelsDataSource.getModelBlockType(id)
        if (modelBlockType === ModelBlockType.childBlocks) {
          return false
        }
      }
      return true
    },
    temporaryModelNodeName(node: ModelNavigationNode) {
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      if (type === ModelNavigationNodeType.models) {
        return 'NEW MODEL (UNSAVED)'
      }
      const modelBlockType = modelsDataSource.getModelBlockType(id)
      switch (modelBlockType) {
        case ModelBlockType.masks:
          return 'NEW MASK (UNSAVED)'
        default:
          return 'NEW BLOCK (UNSAVED)'
      }
    },
    isATemporaryModelNode(node: ModelNavigationNode): boolean {
      const { id } = getModelNavigationNodeIdAndType(node.id)
      return parseInt(id) === 0
    },

    modelNodeAddTooltip(node: ModelNavigationNode): string {
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      if (type === ModelNavigationNodeType.models) {
        return '新建模块'
      }
      const modelBlockType = modelsDataSource.getModelBlockType(id)
      switch (modelBlockType) {
        case ModelBlockType.masks:
          return '新建子模块'
        default:
          return '新建子模块'
      }
    },
    modelNodeCopyTooltip(node: ModelNavigationNode): string {
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      if (type === ModelNavigationNodeType.models) {
        return '拷贝该模型'
      }
      const modelBlockType = modelsDataSource.getModelBlockType(id)
      switch (modelBlockType) {
        case ModelBlockType.masks:
          return '拷贝该Mask'
        case ModelBlockType.blocks:
          return '拷贝该Block'
        default:
          return '拷贝该Block'
      }
    },
    onClickModelNaviNode(modelNaviNode) {
      this.updateRelationCurrentModelNodeSourceNaviNode(modelNaviNode)
      this.updateCurrentModelNodeWithModelNaviNode(modelNaviNode)
    },
    onRightClickModelNaviNode(event: MouseEvent, node: ModelNavigationNode) {
      let menuItems: ContextMenuItemProps[]
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      if (type === ModelNavigationNodeType.models) {
        menuItems = this.getModelNaviNodeContextMenuItems(id, node)
      } else {
        const modelBlockType = modelsDataSource.getModelBlockType(id)
        switch (modelBlockType) {
          case ModelBlockType.masks:
            menuItems = this.getMaskNaviNodeContextMenuItems(id, node)
            break
          case ModelBlockType.blocks:
            menuItems = this.getBlockNaviNodeContextMenuItems(id, node)
            break
          default:
            menuItems = this.getChildBlockNaviNodeContextMenuItems(id, node)
        }
      }

      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems
      })
    },
    onSubmitNewBlocks() {
      this.$refs.addBlocksDialog.validate((valid) => {
        if (valid) {
          const { id, type } = getModelNavigationNodeIdAndType(this.addBlocksDialogFormData.modelId)
          this.addBlocksDialogFormData.id = id
          if (type === ModelNavigationNodeType.models) {
            this.addMaskDialog(this.addBlocksDialogFormData).then(async result => {
              this.onCancelAddNewBlocks()
              await this.saveUpdatedCurrentModelBlockToDB()
              this.displayModelTreeNavi && this.updateModelRootBlockIdToDb(this.currentModelNode.id)
            }).catch(err =>
              this.showCreateModelBlockErrorMessage(err)
            )
            return false
          }
          const modelBlockType = modelsDataSource.getModelBlockType(parseInt(id))
          switch (modelBlockType) {
            case ModelBlockType.masks:
              this.addBlockDialog(this.addBlocksDialogFormData).then(resulit => {
                this.onCancelAddNewBlocks()
                this.saveUpdatedCurrentModelBlockToDB()
              }).catch(err =>
                this.showCreateModelBlockErrorMessage(err)
              )
              break
            default:
              this.addChildBlockDialog(this.addBlocksDialogFormData).then(resulit => {
                this.onCancelAddNewBlocks()
                this.saveUpdatedCurrentModelBlockToDB()
              }).catch(err =>
                this.showCreateModelBlockErrorMessage(err)
              )
          }
        }
      })
    },
    onCancelAddNewBlocks() {
      this.addModelMaskOrBlockVisible = false
      this.addBlocksDialogFormData = {
        id: '',
        modelId: '',
        name: '',
        tags: [],
        parent: '',
        rebaseNeeded: 'no',
        slidingWindow: false,
        description: '',
        copyType: ''
      }
    },
    onClickNewModelBlock(node: ModelNavigationNode) {
      this.addModelMaskOrBlockVisible = true
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      this.addBlocksDialogFormData.parent = node.name
      this.addBlocksDialogFormData.modelId = node.id
      // const { id, type } = getModelNavigationNodeIdAndType(node.id)
      // if (type === ModelNavigationNodeType.models) {
      //   this.addMask(parseInt(id)).catch(err =>
      //     this.showCreateModelBlockErrorMessage(err)
      //   )
      //   return
      // }
      // const modelBlockType = modelsDataSource.getModelBlockType(parseInt(id))
      // switch (modelBlockType) {
      //   case ModelBlockType.masks:
      //     this.addBlock(parseInt(id)).catch(err =>
      //       this.showCreateModelBlockErrorMessage(err)
      //     )
      //     break
      //   default:
      //     this.addChildBlock(parseInt(id)).catch(err =>
      //       this.showCreateModelBlockErrorMessage(err)
      //     )
      // }
    },
    onClickDuplicateModelBlock(node: ModelNavigationNode) {
      const { id, type } = getModelNavigationNodeIdAndType(node.id)
      if (type === ModelNavigationNodeType.models) {
        this.copyModel(parseInt(id)).then(result => {
          !result.success && this.$message.error(result.error?.message)
        })
        return
      }
      this.copyModelBlock(id)
    },
    async copyCodeIndex(modelId: number) {
      const result = await useProductsAPIs()
        .indicators
        .db
        .queryCodeIndexesByModelId(modelId)
      const codeIndexes = result.map((codeIndex: CodeIndex) => {
        return {
          ...codeIndex,
          modelId: this.currentModelNode.id
        }
      })
      this.importCodeIndexFromDB(codeIndexes)
    },
    showCreateModelBlockErrorMessage(err: Error) {
      if (err instanceof UnsavedModelExistsError) {
        this.$message.warning('当前存在新建的未保存模型，请先设置该模型')
      } else if (err instanceof UnsavedModelBlockExistsError) {
        this.$message.warning('当前存在新建的未保存Mask/Block，请先设置该Mask/Block')
      }
    },
    getModelNaviNodeContextMenuItems(modelId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
      return [
        {
          title: '属性',
          shortCut: 'Ctrl+r',
          onClick: () => this.updateCurrentModelNodeWithModelNaviNode(node)
        },
        {
          title: '删除',
          shortCut: 'Ctrl+d',
          onClick: () => {
            this.$alert(`确定要删除模型 ${node.name}?`, '提示', {
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              showCancelButton: true
            }).then(() => {
              this.deleteModel(modelId).catch(err =>
                this.$message.error(err.message)
              )
            }).catch(() => { })
          }
        },
        {
          title: '清除模型临时文件',
          disabled: this.isCompiling || this.isRunning > 0,
          shortCut: '',
          onClick: () => {
            try {
              this.removeModelTempFolder(modelId)
            } catch (err) {
              this.$message.error(err.message)
            } finally {
              this.$message.info('模型临时文件已清除')
            }
          }
        },
        {
          title: '清除所有临时文件',
          disabled: this.isCompiling || this.isRunning > 0,
          shortCut: '',
          onClick: () => {
            try {
              this.removeTempFolder()
            } catch (err) {
              this.$message.error(err.message)
            } finally {
              this.$message.info('临时文件已清除')
            }
          }
        },
        {
          title: '编辑分类',
          shortCut: '',
          onClick: () => {
            this.currentClassifyModelId = modelId
            this.classifys = []
            const classifyListCopy = JSON.parse(JSON.stringify(this.classifyList))
            this.classifyList.map((item, index) => {
              if (item.modelId === modelId) {
                this.classifys.push(item)
              }
            })
            this.dialogTableVisible = true
          }
        }
      ]
    },
    getMaskNaviNodeContextMenuItems(maskId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
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
              // this.updateBlockLinks(node)
            }).catch(() => { })
          }
        }
      ]
    },
    getBlockNaviNodeContextMenuItems(blockId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
      return [
        {
          title: '属性',
          shortCut: 'Ctrl+r',
          onClick: () => this.updateCurrentModelNodeWithModelNaviNode(node)
        },
        {
          title: '删除',
          shortCut: 'Ctrl+d',
          onClick: () => {
            this.$alert(`确定要删除Block ${node.name}?`, '提示', {
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              showCancelButton: true
            }).then(() => {
              this.deleteBlock(blockId)
            }).catch(() => { })
          }
        }
      ]
    },
    getChildBlockNaviNodeContextMenuItems(blockId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
      return [
        {
          title: '属性',
          shortCut: 'Ctrl+r',
          onClick: () => this.updateCurrentModelNodeWithModelNaviNode(node)
        },
        {
          title: '删除',
          shortCut: 'Ctrl+d',
          onClick: () => {
            this.$alert(`确定要删除Block ${node.name}?`, '提示', {
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              showCancelButton: true
            }).then(() => {
              this.deleteChildBlock(blockId)
            }).catch(() => { })
          }
        }
      ]
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";
@import "../scss/mask-navigation.scss";
.model-nav-tree {
  &:deep(.el-dialog__body) {
    overflow: hidden;
  }
  &:deep(.el-dialog__footer) {
    text-align: center;
  }
}
</style>

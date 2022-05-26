<template>
  <div class="property-navi">
    <!-- eslint-disable-next-line vue/no-v-model-argument -->
    <tool-bar
      :filterMenuItems="filterMenuItems"
      :isRelation="isRelation"
      :propertySearch="propertySearch"
      @left-buttons-click="onLeftButtonsClicked"
      @on-search="onSearch"
    />
    <div class="filter-box" v-show="propertySearch">
      <el-input
        v-model="filterText"
        class="filter-input"
        prefix-icon="search"
        placeholder="输入关键字过滤"
        maxlength="inputNameLength"
      />
      <el-input
        v-model="filterClassifyName"
        class="filter-input"
        prefix-icon="search"
        placeholder="输入分类名称过滤"
        maxlength="inputNameLength"
      />
    </div>
    <el-table
      row-key="id"
      ref="propertyTable"
      class="property-table sl-menu-table"
      :height="tableHeight"
      :data="propertyList"
      highlight-current-row
      @row-click="onPropertySelected"
      row-class-name="property-row"
      header-cell-class-name="property-column"
      @row-contextmenu="onPropertyRightClick"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="40"> </el-table-column>
      <el-table-column
        :sortable="true"
        v-for="item in tableColumnItems"
        :key="item.title"
        :fixed="item.tableColumnProp === 'name'"
        :prop="item.tableColumnProp"
        :label="item.title"
        show-overflow-tooltip
        :sort-method="(a, b) => sortMethod(a, b, item)"
      >
        <template #default="scope">
          <span class="row-box">
            <el-icon
              v-if="item.tableColumnProp === 'name'"
              class="property-name-icon"
            >
              <component :is="getPropteryIconClass(scope.row)"></component>
            </el-icon>
            {{
              scope.row[item.tableColumnProp] ||
              (item.tableColumnProp === "name"
                ? temproaryPropertyName(scope.row)
                : "--")
            }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <teleport to="#app">
      <property-creation-dialog
        :isRelation="isRelation"
        ref="propertyCreationDialog"
      />
    </teleport>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue'
import ToolBar from './ToolBar.vue'
import PropertyCreationDialog from './PropertyCreationDialog.vue'
import { createNamespacedHelpers } from 'vuex'
import defaultLanguageServer from '@/formulaLanguageServer'
import type {
  SimplifiedModelBlock,
  SimplifiedModel,
  SimplifiedProperty,
  Property,
  FormulaTabItem
} from '@shared/dataModelTypes'
import modelsDataSource from '@/store/modules/modelsDataSource'
import masterDataSource from '@/store/modules/masterDataSource'
import PropertyFingerPrint,
{ LinkExpression, generatePropertyFingerPrintString, decodePropertyFingerPrintString, generateFullLinkChainWithoutBlockSelector }
  from '@/formulaLanguageServer/PropertyFingerPrint'
import { PropertyType, VariableSource } from '@shared/dataModelTypes/models/helpers'
import { ElTable } from 'element-plus'
import { asyncForEach, inputNameLength, inputTextLength } from '@shared/commonUtils'
import useWindowWidthAndHeight from '../../composables/useWindowWidthAndHeight'
import {
  getModelNodeType,
  ModelNodeType,
  getModelNavigationNodeIdAndType,
  getMasterNavigationNodeIdAndType,
  noFormatCodeIndex,
  getZhCnProperty
} from '@/utils'
import { setCurrentFormula, isProduct } from '../config'
import { log } from 'console'
import { clone } from 'lodash'
const { mapState, mapActions, mapMutations } = createNamespacedHelpers('models/')
const { mapActions: relationMapActions } = createNamespacedHelpers('relation/')
const { mapState: mastersMapState } = createNamespacedHelpers('masters/')
export default defineComponent({
  components: { ToolBar, PropertyCreationDialog },
  setup() {
    const { windowHeight } = useWindowWidthAndHeight()
    // 36 is top tool bar height
    // 4 is the property navigation view top padding
    // 30 is the property navigation tool bar height
    // 52 is the filter input height plus top and buttom margins
    // 26 is the bottom bar height
    const tableHeight = computed(
      () => windowHeight.value - 36 - 4 - 30 - 52 - 26
    )
    return {
      tableHeight
    }
  },
  data() {
    return {
      isRelation: false,
      filterMenuItems: [
        {
          tableColumnProp: 'name',
          tableColumnWidth: '',
          title: '名称',
          isDefault: true,
          checked: true
        },
        {
          tableColumnProp: 'modifiedAt',
          tableColumnWidth: '120',
          title: '修改时间',
          isDefault: false,
          checked: true
        },
        // { tableColumnProp: 'creator', tableColumnWidth: '100', title: '创建作者', isDefault: false, checked: false },
        {
          tableColumnProp: 'creator',
          tableColumnWidth: '120',
          title: '修改作者',
          isDefault: false,
          checked: false
        },
        // { tableColumnProp: 'inheritanceSource', tableColumnWidth: '100', title: '继承来源', isDefault: false, checked: false },
        {
          tableColumnProp: 'source',
          tableColumnWidth: '100',
          title: '来源',
          isDefault: false,
          checked: false
        },
        {
          tableColumnProp: 'classify',
          tableColumnWidth: '100',
          title: '分类',
          isDefault: false,
          checked: false
        }
        // eslint-disable-next-line no-undef
      ] as FilterMenuItemType[],
      propertySearch: false,
      propertyFilters: {
        showVaraibles: true,
        showSeries: true,
        showLinks: true,
        showMethods: true
      },
      filterText: '',
      filterClassifyName: '',
      // propertyListCopy: [] as any[]
      // filterClassifySort: null
      multipleSelection: [] as SimplifiedProperty[]
    }
  },
  watch: {
    currentProperty(newValue, oldValue) {
      const table = this.$refs.propertyTable as InstanceType<typeof ElTable>
      this.$nextTick(() => {
        if (!newValue) {
          table.setCurrentRow()
          return
        }
        const currentRow = table.data.find((row) => row.id === newValue.id)
        if (!currentRow) return

        table.setCurrentRow(currentRow)
        this.$nextTick(() => {
          const currentRowClassName = 'el-table__row current-row property-row' // this is what element-ui used
          const tableWrapperClassName = 'el-table__body-wrapper is-scrolling-none'
          const currentRowElement = document.getElementsByClassName(
            currentRowClassName
          )[0] as HTMLElement

          const tableWrapperElement = document.getElementsByClassName(
            tableWrapperClassName
          )[0] as HTMLElement
          if (tableWrapperElement) {
            const yDiff =
              currentRowElement.getBoundingClientRect().y -
              tableWrapperElement.getBoundingClientRect().y
            if (yDiff > tableWrapperElement.getBoundingClientRect().height) {
              tableWrapperElement.scrollTop =
                tableWrapperElement.scrollTop + yDiff
            }
          }
        })
      })
    }
    // currentModelNode(newVal, oidVal) {
    //   this.propertyListCopy = this.propertyList
    // },
    // propertyList(newVal, oidVal) {
    //   this.propertyListCopy = this.propertyList
    // }
  },
  computed: {
    ...mapState([
      'currentModelNode',
      'currentProperty',
      'propertyClipboard',
      'temporaryModelNode',
      'displayModelTreeNavi',
      'currentBlockNode',
      'dependencyViewVisible',
      'openedFormulaItems',
      'isRelationLink'
    ]),
    ...mastersMapState(['currentMasterNode']),
    // eslint-disable-next-line no-undef
    tableColumnItems(): FilterMenuItemType[] {
      return this.filterMenuItems.filter((item) => item.checked)
    },
    propertyList() {
      // when no node is selected or selected node is a model
      const { propertyFilters, currentModelNode, filterText, filterClassifyName, sortOrder, currentMasterNode, formatDate, $route } = this
      if (!currentModelNode || !currentModelNode.modelId) return []
      let masterId: number = 0
      if (this.currentMasterNode?.id) {
        const { id } = getMasterNavigationNodeIdAndType(this.currentMasterNode.id)
        masterId = this.currentMasterNode.masterId || id
      }
      const completeMaster = masterDataSource.getCompleteMaster(masterId)
      const filterTextLower = filterText.toLowerCase()
      const filterClassifyNameLower = filterClassifyName.toLowerCase()
      const sources = []
      propertyFilters.showVaraibles && sources.push(...currentModelNode.variables)
      propertyFilters.showSeries && sources.push(...currentModelNode.series)
      propertyFilters.showLinks && sources.push(...currentModelNode.links)
      propertyFilters.showMethods && sources.push(...currentModelNode.methods)
      return sortOrder(sources.filter(source => {
        return (!filterText || source.name.toLowerCase().includes(filterTextLower)) &&
          (!filterClassifyName || source.classify.toLowerCase().includes(filterClassifyNameLower)) &&
          noFormatCodeIndex(source, currentModelNode, $route.path, completeMaster)
      }).map(item => {
        return {
          ...item,
          source: getZhCnProperty(item.source),
          modifiedAt: item.modifiedAt && formatDate(item.modifiedAt)
        }
      }))
    }
  },
  mounted() {
    // this.propertyListCopy = this.propertyList
  },
  methods: {
    ...mapActions([
      'selectProperty',
      'deleteProperty',
      'lookUpFullPropertyFor',
      'copyProperty',
      'pastePropertyFromClipboard'
    ]),
    ...mapMutations(['showDependencyView', 'updateCurrentModelNodeWithModelNaviNode', 'updateOpenedFormulaItemsAll', 'updateRelationLink']),
    ...relationMapActions(['deleteRelationLinkModelBlock']),
    temproaryPropertyName(property: SimplifiedProperty) {
      switch (property.type) {
        case PropertyType.links:
          return 'NEW LINk (UNSAVED)'
        case PropertyType.variables:
          return 'NEW VARIABLE (UNSAVED)'
        case PropertyType.methods:
          return 'NEW METHOD (UNSAVED)'
        default:
          return 'NEW SERIES (UNSAVED)'
      }
    },
    sortOrder(list) {
      let ascending = true
      if (ascending) {
        list.sort((a, b) => {
          const nameA = a?.name?.toLowerCase() || ''
          const nameB = b?.name?.toLowerCase() || ''
          if (a.classify === b.classify) {
            return nameA > nameB ? 1 : (nameA < nameB ? -1 : 0)
          } else if (a.classify === null) {
            return 1
          } else if (b.classify === null) {
            return -1
          } else {
            return a.classify < b.classify ? -1 : 1
          }
        })
      } else {
        list.sort((a, b) => {
          const nameA = a.name.toLowerCase()
          const nameB = b.name.toLowerCase()
          if (a.classify === b.classify) {
            return nameA > nameB ? -1 : (nameA < nameB ? 1 : 0)
          } else if (a.classify === null) {
            return -1
          } else if (b.classify === null) {
            return 1
          } else {
            return a.classify < b.classify ? 1 : -1
          }
        })
      }
      return list
    },
    // sortChange(val) {
    //   // const propertyListClone = JSON.parse(JSON.stringify(this.propertyList))
    //   this.updateRelationLink(this.isRelation)
    //   const sortingType = val.order
    //   const sortName = val.name

    //   this.filterClassifySort = val
    // },
    handleSelectionChange(val: SimplifiedProperty[]) {
      this.multipleSelection = val
    },
    formatDate(d) {
      const now = new Date(d)
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const date = now.getDate()
      const hour = now.getHours()
      const minute = now.getMinutes()
      const second = now.getSeconds()
      const minutes = minute < 10 ? '0' + minute : minute
      const hours = hour < 10 ? '0' + hour : hour
      const dates = date < 10 ? '0' + date : date
      const months = month < 10 ? '0' + month : month
      return year + '-' + months + '-' + dates + ' ' + hours + ':' + minutes
    },
    sortMethod(a, b, item) {
      const key = item.tableColumnProp
      if (key === 'name') {
        const nameA = a?.name?.toLowerCase() || ''
        const nameB = b?.name?.toLowerCase() || ''
        return nameA > nameB ? 1 : (nameA < nameB ? -1 : 0)
      }
      const valueA = a[key]
      const valueB = b[key]
      if (valueA === valueB) return 0
      if (valueA === undefined) return 1
      if (valueB === undefined) return -1
      return valueA > valueB ? 1 : -1
    },
    onSearch() {
      this.propertySearch = !this.propertySearch
    },
    onLeftButtonsClicked({ type, filters, isRelation }) {
      this.isRelation = isRelation
      this.updateRelationLink(this.isRelation)
      if (type === 'CreateProperty') {
        if (
          !this.currentModelNode ||
          getModelNodeType(this.currentModelNode) !== ModelNodeType.modelBlocks
        ) {
          this.$message.warning('请先选择一个Mask/Block')
          return
        } else if (this.currentModelNode.id === 0) {
          this.$message.warning('请先设置好该Mask/Block，再进行下一步操作')
          return
        }
        (
          this.$refs
            .propertyCreationDialog as InstanceType<PropertyCreationDialog>
        ).visible = true
      } else {
        this.propertyFilters = filters
      }
    },
    onPropertySelected(current) {
      this.updateRelationLink(this.isRelation)
      this.selectProperty(current)
    },
    getPropteryIconClass(current: SimplifiedProperty): string {
      switch (current.type) {
        case PropertyType.links:
          return 'share'
        case PropertyType.variables:
          return 'ticket'
        case PropertyType.methods:
          return 'menu'
        default:
          return 'comment'
      }
    },
    onPropertyRightClick(
      property: SimplifiedProperty,
      column: any,
      event: MouseEvent
    ) {
      if (isProduct()) return
      const menuItems = []
      this.updateRelationLink(this.isRelation)
      const baseMenuItems = [
        {
          title: '新建',
          shortCut: 'Ctrl+n',
          onClick: () => {
            (
              this.$refs
                .propertyCreationDialog as InstanceType<PropertyCreationDialog>
            ).visible = true
          }
        }

      ]
      if (this.dependencyViewVisible) {
        menuItems.push(
          {
            title: '依赖关系',
            shortCut: '',
            onClick: () => this.openDependencyViewForProperty(property)
          }
        )
      } else {
        menuItems.push(...baseMenuItems)
        if (this.propertyClipboard) {
          menuItems.push({
            title: '粘贴',
            shortCut: 'Ctrl+v',
            onClick: () => this.tryToPastePropertyFromClipboard()
          })
        }

        if (this.multipleSelection.length) {
          menuItems.push(
            ...[

              {
                title: '批量复制',
                shortCut: '',
                onClick: () => this.tryToCopyBatchProperty(this.multipleSelection)
              },
              {
                title: '批量删除',
                shortCut: '',
                onClick: () => this.tryToDeleteBatchProperty(this.multipleSelection)
              }
            ]
          )
        } else {
          menuItems.push(
            ...[
              {
                title: '复制',
                shortCut: 'Ctrl+c',
                onClick: () => this.tryToCopyProperty(property)
              },
              {
                title: '删除',
                shortCut: 'Ctrl+d',
                onClick: () => this.tryToDeleteProperty(property)
              }
            ]
          )
        }
        menuItems.push(
          ...[
            {
              title: '属性',
              shortCut: 'Ctrl+r',
              onClick: () => this.selectProperty(property)
            },
            {
              title: '依赖关系',
              shortCut: '',
              onClick: () => this.openDependencyViewForProperty(property)
            }

          ]
        )
      }
      // if (this.propertyClipboard) {
      //   menuItems.push({
      //     title: '粘贴',
      //     shortCut: 'Ctrl+v',
      //     onClick: () => this.tryToPastePropertyFromClipboard()
      //   })
      // }
      // menuItems.push(
      //   ...[
      //     {
      //       title: '属性',
      //       shortCut: 'Ctrl+r',
      //       onClick: () => this.selectProperty(property)
      //     },
      //     {
      //       title: '依赖关系',
      //       shortCut: '',
      //       onClick: () => this.openDependencyViewForProperty(property)
      //     },
      //     {
      //       title: '删除',
      //       shortCut: 'Ctrl+d',
      //       onClick: () => this.tryToDeleteProperty(property)
      //     }
      //   ]
      // )

      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems
      })
    },
    openDependencyViewForProperty(property: SimplifiedProperty) {
      this.selectProperty(property)
      this.showDependencyView()
    },
    async tryToDeleteProperty(property: SimplifiedProperty) {
      const propertyType = this.getPropertyTypeInChinese(property)
      const fullProperty: Property = await this.lookUpFullPropertyFor(property)
      if (!this.isRelationLink && !fullProperty?.isDirect) {
        // cannot delete inherited properties
        this.$message({
          message: `不能删除继承的${propertyType}.`,
          type: 'warning'
        })
        return
      }
      this.$alert(`确定要删除${propertyType} ${property.name}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      })
        .then(async () => {
          const openedFormulaItems = this.filterOpenedFormulaItems(property)
          this.updateOpenedFormulaItemsAll(openedFormulaItems)
          setCurrentFormula()
          try {
            await this.deleteRelationLinkModelBlock(property)
          } catch { }
          !this.isRelationLink && await this.deleteProperty(property)
          const currentPropertyFPWithoutLinkExpression = {
            blockId: this.currentModelNode.id,
            linkExpression: 'NA',
            propertyId: property.id,
            propertyName: property.name,
            propertyType: property.type
          }
          const fpString = generatePropertyFingerPrintString(currentPropertyFPWithoutLinkExpression)
          defaultLanguageServer.getPropertyToUpdateWhenDeleted(this.currentModelNode.modelId, fpString)
        })
        .catch(() => { })
    },
    async tryToDeleteBatchProperty(propertys: SimplifiedProperty[]) {
      let isDirect = true
      let propertyNames = [] as String[]
      let propertyType = ''
      await asyncForEach(propertys, async (property) => {
        propertyNames.push(property.name)
        const fullProperty: Property = await this.lookUpFullPropertyFor(property)
        if (!fullProperty?.isDirect) {
          isDirect = false
          propertyType = await this.getPropertyTypeInChinese(property)
        }
      })
      if (!this.isRelationLink && !isDirect) {
        // cannot delete inherited properties
        this.$message({
          message: `不能删除继承的${propertyType}.`,
          type: 'warning'
        })
        return
      }
      this.$alert(`确定要批量删除 ${propertyNames}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      })
        .then(async () => {
          const propertysClone = clone(propertys)
          await asyncForEach(propertys, async (property) => {
            const openedFormulaItems = this.filterOpenedFormulaItems(property)
            this.updateOpenedFormulaItemsAll(openedFormulaItems)
            setCurrentFormula()
            try {
              await this.deleteRelationLinkModelBlock(property)
            } catch { }
            !this.isRelationLink && await this.deleteProperty(property)
            const currentPropertyFPWithoutLinkExpression = {
              blockId: this.currentModelNode.id,
              linkExpression: 'NA',
              propertyId: property.id,
              propertyName: property.name,
              propertyType: property.type
            }
            const fpString = generatePropertyFingerPrintString(currentPropertyFPWithoutLinkExpression)
            defaultLanguageServer.getPropertyToUpdateWhenDeleted(this.currentModelNode.modelId, fpString)
          })
        })
        .catch(() => { })
    },
    filterOpenedFormulaItems(property: SimplifiedProperty) {
      return this.openedFormulaItems.filter((formula: FormulaTabItem) => formula.propertyId !== property.id)
    },
    async tryToCopyProperty(property: SimplifiedProperty) {
      const propertyType = this.getPropertyTypeInChinese(property)
      try {
        await this.copyProperty([property])
        this.$message.success(`复制${propertyType}${property.name}`)
      } catch (err) {
        this.$message.error(`无法复制: ${err.message}`)
      }
    },
    async tryToCopyBatchProperty(propertys: SimplifiedProperty[]) {
      try {
        let propertyNames = []
        for (let i = 0; i < propertys.length; i++) {
          propertyNames.push(propertys[i].name)
        }
        await this.copyProperty(propertys)
        this.$message.success(`复制${propertyNames}`)
      } catch (err) {
        this.$message.error(`无法复制: ${err.message}`)
      }
    },
    async tryToPastePropertyFromClipboard() {
      try {
        await this.pastePropertyFromClipboard()
      } catch (err) {
        this.$message.error(`无法粘贴: ${err.message}`)
      }
    },
    getPropertyTypeInChinese(property: SimplifiedProperty): string {
      switch (property.type) {
        case PropertyType.variables:
          return '变量'
        case PropertyType.series:
          return '序列'
        case PropertyType.links:
          return '链接'
        default:
          return '方法'
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../scss/property-navi.scss";
</style>

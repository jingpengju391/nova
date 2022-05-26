<template>
<div id="dataInputMapping" @click="selectShow">
  <split-panel
    class="mapping-box"
    :main-pane-default-ratio="0.6"
    split-direction="vertical"
    :hide-side-pane="hideSidePane"
  >
    <template #main>
      <div
        class="con-box"
        ref="conBox"
        v-show="dataMappingItemsArr.length > 0 && blocksTable.length > 0"
      >
        <!-- <el-button-group class="button-group-box">
          <icon-button
            v-for="item in ButtonGroup"
            :key="item.value"
            :tooltip="item.tooltip"
            :icon-class="item.icon"
            @click="handleTable(item)"
          ></icon-button>
        </el-button-group> -->
        <el-button
          class="button-group-box"
          v-for="item in ButtonGroup"
          :key="item.value"
          :tooltip="item.tooltip"
          :icon="item.icon"
          :type="item.type"
          @click="handleTable(item)"
          >{{ item.label }}</el-button
        >
        <el-table
          ref="singleTable"
          :height="height"
          highlight-current-row
          border
          :data="loadData"
          v-loading="loadData.length === 0 && !flag"
        >
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="columnsWidth"
            :fixed="column.fixed"
            v-for="(column,cIndex) in columns.filter(item=>{return item.isShow===true})"
            :key="column.prop"
            v-show="column.isShow"
          >
          <template #header v-if="column.isShow">

            <div v-if="cIndex===0" class="header-search-box">
                  <el-popover
                    v-model:visible="variableModelNamevisble"
                    placement="bottom"
                    :width="modelNameWidth"
                  >
                  <div class="down-serch" >
                  <el-select
                    class="column-header"
                    v-model="variableModelNameSelect"
                    multiple
                    filterable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="筛选模块名称"
                    size="large"
                    @change="variableModelNameSelectChange"
                    @click.stop>

                    <el-option
                      v-for="item in variableModelNameOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                        <el-tooltip
                       v-if="item.length>10"
                        class="box-item"
                        effect="dark"
                        :content="item"
                        placement="top-start"
                      >
                        <span>{{ item }}</span>
                      </el-tooltip>
                      <span v-else>{{ item }}</span>
                   </el-option>
                  </el-select>
                      </div>
                  <template #reference>
                    <span class="popover-header" :style="variableModelNameSelect.length ? 'color: #409eff' : ''">
                      {{ column.label}}
                      <el-icon style="margin-left: 5px; cursor: pointer;" @click.stop="changeVariableModelNamevisble"><Search /></el-icon
                    ></span>
                  </template>
                    </el-popover>
                </div>
                <span v-else> {{column.label}}</span>

         </template>
            <template #default="scope">
                <div class="" v-if="scope.column.rawColumnKey === 'field'&&scope.$index===0">
                    <el-popover
                    v-model:visible="variableNamevisble"
                    placement="bottom"
                    :width="width"
                  >
                  <div class="down-serch" >
                  <el-select
                    class="column-header"
                    v-model="variableNameSelect"
                    multiple
                    filterable
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="筛选变量名称"
                    size="large"
                    @change="variableNameSelectChange"
                    @click.stop>

                    <el-option
                      v-for="item in variableNameOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                     <el-tooltip
                       v-if="item.label.length>10"
                        class="box-item"
                        effect="dark"
                        :content="item.label"
                        placement="top-start"
                      >
                       <span>{{ item.label }}</span>
                      </el-tooltip>
                      <span v-else>{{ item.label }}</span>
                     </el-option>
                  </el-select>
                      </div>
                  <template #reference>
                    <span class="popover-header" :style="variableNameSelect.length ? 'color: #409eff' : ''">
                      {{ scope.row.field}}
                      <el-icon style="margin-left: 5px; cursor: pointer;" @click.stop="changeVariableNamevisble"><Search /></el-icon
                    ></span>
                  </template>
                    </el-popover>
                </div>
            <div class="" v-else-if="scope.column.rawColumnKey === 'field'&&scope.$index===1">
              <el-popover
                  v-model:visible="visble"
                  placement="bottom"
                  :width="typeSelectWidth"
                >
                 <div class="down-serch" >
                <el-select
                  class="column-header"
                  v-model="variableTypeSelect"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="筛选变量类型"
                  size="large"
                  @change="variableTypeSelectChange"
                    @click.stop>

                  <el-option
                    v-for="item in variableTypeOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                    :width="160">
                     <el-tooltip
                       v-if="item.length>10"
                        class="box-item"
                        effect="dark"
                        :content="item"
                        placement="top-start"
                      >
                       <span>{{ item }}</span>
                      </el-tooltip>
                      <span v-else>{{ item }}</span>
                   </el-option>
                </el-select>
                     </div>
                <template #reference>
                  <span class="popover-header" :style="variableTypeSelect.length ? 'color: #409eff' : ''">
                    {{ scope.row.field}}
                    <el-icon style="margin-left: 5px; cursor: pointer;" @click.stop="changeVariableTypevisble"><Search /></el-icon
                  ></span>
                </template>
              </el-popover>
          <!-- <data-Search
            :column="scope.row"

            @handelFilter="handelFilterRunName"
          ></data-Search> -->
            <!-- </div> -->
            </div>

            <div v-else>
              <el-select-v2
                class="column-header"
                v-if="
                  column.prop === currColumnProp &&
                  scope.$index === dataPreview.value?.$index &&
                  scope.column.rawColumnKey !== 'field'
                "
                v-model="scope.row[column.prop]"
                :options="fields.arr"
                :loading="!fields.arr.length"
                :remote-method="filterNodeMethod"
                filterable
                remote
                allow-create
                default-first-option
                clearable
                placeholder="请选择"
                collapse-tags
                collapse-tags-tooltip
                @visible-change="getFields(scope)"
                @change="onSubmit(scope)"
              >
                  <template #default="{ item }">

                       <el-tooltip
                       v-if="item.label.length>6"
                        class="box-item"
                        effect="dark"
                        :content="item.label"
                        placement="top-start"
                      >
                      <span>{{ item.label }}</span>
                      </el-tooltip>
                      <span v-else>{{ item.label }}</span>

                  </template>
                </el-select-v2>
              <div
                class="column-header"
                v-else
                @contextmenu="
                  (event) =>
                    contextmenu(
                      event,
                      scope,
                      column.prop,
                      scope.row[column.prop]
                    )
                "
                @click="currColumnProp = scope.row.id ? column.prop : ''"
                @dblclick="dataPreview.value = scope.row.id ? scope : {}"
              >
                {{ scope.row[column.prop] || "暂无数据" }}
              </div>
              </div>
            </template>
            <!--映射管理中注释一个点击事件：双击数据不需要展示数据内容 <div class="eventClick"  @dblclick="dataPreview.value = scope.row.id ? scope : {}"></div> -->
          </el-table-column>
        </el-table>
      </div>
      <el-empty
        v-show="dataMappingItemsArr.length === 0 || blocksTable.length === 0"
        style="height: 100%"
      />
    </template>
    <template #side>
      <DataPreview
        :dataPreview="dataPreview"
        @handleClosePreviewOpen="handleClosePreviewOpen"
      />
    </template>
  </split-panel>
  <!-- <teleport to="#data-input-view">
    <ImportDialog :columns="columns" />
  </teleport> -->
  </div>
</template>

<script lang=ts>
import { defineComponent } from 'vue'
import { useDataInputsAPIs } from '../../hooks/apis'
import type { DataInputFile, DataMappingItem } from '@shared/dataModelTypes'
import DataPreview from './DataPreview.vue'
import { SplitPanel, IconButton } from '@/views/components'
import { ArrayToString, tableColumnWidth, dataInputBlockIDDelimiter } from '@shared/dataModelTypes/dataInputs'
import { createNamespacedHelpers } from 'vuex'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Action } from 'element-plus'
import { ButtonGroup } from './config'
import { importData } from './combination/DataInputMappingManagement'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { FordateAlignType } from '../../utils'
// import { ImportDialog } from './Dialog'
import { Item } from 'ant-design-vue/es/menu'
import { log } from 'console'
import { set } from 'lodash'
const { mapGetters, mapState, mapActions } = createNamespacedHelpers('dataInputs/')
const { mapState: modelMapState } = createNamespacedHelpers('models/')
export default defineComponent({
  // components: { SplitPanel, DataPreview, ImportDialog },
  components: { SplitPanel, DataPreview },
  props: {
    componentId: {
      type: String,
      require: true
    }
  },
  setup() {
    return { ButtonGroup, importData }
  },
  data() {
    return {
      width: 0,
      typeSelectWidth: 0,
      modelNameWidth: 0,
      fields: {
        arr: [] as any
      },
      allfields: {
        arr: [] as any
      },
      visble: false,
      variableNamevisble: false,
      variableModelNamevisble: false,
      flag: false,
      dataPreview: {} as any,
      provisional: null as any,
      currColumnProp: '',
      height: 0,
      variableTypeSelect: [],
      variableModelNameSelect: [],
      variableNameSelect: [],
      variableModelNameHeaderArr: [] as string[],
      variableTypeHeaderArr: [] as string[],
      filterHeaderArr: [] as string[]
      // variableTypeOptions: []

    }
  },
  computed: {
    ...mapGetters(['dataMappingItems', 'getFiles', 'getDataModel']),
    ...mapState(['currentDataModelNode']),
    columns(): any {
      if (this.componentId === 'DataInputMappingManagement') {
        const dataArr = this.buildColumnData(this.dataMappingItemsArr).map((item, index) => {
          if (this.filterHeaderArr.length) {
            const fil = this.filterHeaderArr.findIndex(filte => {
              return filte === item.prop
            })
            if (item.prop === 'field') {
              return {
                isShow: true,
                ...item
              }
            }
            if (fil !== -1) {
              return {
                isShow: true,
                ...item
              }
            } else {
              return {
                isShow: false,
                ...item
              }
            }
          } else {
            return {
              isShow: true,
              ...item
            }
          }
        })
        return dataArr
      }
      return []
    },
    hideSidePane() {
      const flag1 = !this.dataPreview?.value?.row
      const flag2 = !!this.dataPreview?.value?.column?.no
      const flag3 = this.dataPreview?.value?.row?.blockVal?.length <= 1
      const flag = flag1 || flag2 || flag3
      return flag
    },
    dataMappingItemsArr(): DataMappingItem[] {
      return this.dataMappingItems || []
    },
    blocksTable(): DataInputFile[] {
      return this.getFiles || []
    },
    loadData(): any {
      if (!this.flag) return []
      const arr = this.buildTableData(this.dataMappingItemsArr, this.blocksTable)
      return arr
    },
    variableTypeOptions():any[] {
      let resultArr = []
      const data = this.loadData[1]
      for (let key in data) {
        resultArr.push(data[key])
      }
      return Array.from(new Set(resultArr))
    },
    variableNameOptions():any[] {
      let resultArr = []
      const data = this.loadData[0]
      for (let key in data) {
        resultArr.push({
          label: data[key],
          value: key
        })
      }
      return resultArr
    },
    variableModelNameOptions():any[] {
      if (this.componentId === 'DataInputMappingManagement') {
        const ddd = this.buildColumnData(this.dataMappingItemsArr).map(item => {
          return item.label
        })
        return Array.from(new Set(ddd))
      }
      return []
    },
    columnsWidth(): any {
      return tableColumnWidth
    }
  },
  methods: {
    selectShow() {
      this.variableModelNamevisble = false
      this.variableNamevisble = false
      this.visble = false
    },
    changeVariableModelNamevisble() {
      this.variableModelNamevisble = !this.variableModelNamevisble
      this.variableNamevisble = false
      this.visble = false
    },
    changeVariableNamevisble() {
      this.variableModelNamevisble = false
      this.variableNamevisble = !this.variableNamevisble
      this.visble = false
    },
    changeVariableTypevisble() {
      this.variableModelNamevisble = false
      this.variableNamevisble = false
      this.visble = !this.visble
    },
    variableModelNameSelectChange(val) {
      this.variableModelNameHeaderArr = []
      let sData = [] as any []
      if (this.componentId === 'DataInputMappingManagement') {
        sData = this.buildColumnData(this.dataMappingItemsArr)
      }
      this.variableModelNameSelect.forEach(forE => {
        sData.forEach(sfor => {
          if (sfor.label === forE) {
            this.variableModelNameHeaderArr.push(sfor.prop)
          }
        })
      })
      this.formatFilterHeader(this.variableModelNameHeaderArr)
    },
    variableNameSelectChange(val) {
      this.formatFilterHeader(this.variableNameSelect)
    },
    variableTypeSelectChange(val) {
      this.variableTypeHeaderArr = []
      const sData = this.loadData[1]
      this.variableTypeSelect.forEach(forE => {
        for (let key in sData) {
          if (sData[key] === forE) {
            this.variableTypeHeaderArr.push(key)
          }
        }
      })
      this.formatFilterHeader(this.variableTypeHeaderArr)
    },
    formatFilterHeader(arr:any[]) {
      if (!this.variableTypeHeaderArr.length && !this.variableNameSelect.length && !this.variableModelNameHeaderArr.length) {
        this.filterHeaderArr = []
      }
      if (this.variableTypeHeaderArr.length) {
        if (!this.variableNameSelect.length && !this.variableModelNameHeaderArr.length) {
          this.filterHeaderArr = this.variableTypeHeaderArr
        } else if (this.variableNameSelect.length && !this.variableModelNameHeaderArr.length) {
          this.filterHeaderArr = this.variableTypeHeaderArr.filter(fil => this.variableNameSelect.indexOf(fil) > -1)
        } else if (!this.variableNameSelect.length && this.variableModelNameHeaderArr.length) {
          this.filterHeaderArr = this.variableTypeHeaderArr.filter(fil => this.variableModelNameHeaderArr.indexOf(fil) > -1)
        } else {
          this.filterHeaderArr = this.variableTypeHeaderArr.filter(fil => this.variableModelNameHeaderArr.indexOf(fil) > -1).filter(fil => this.variableNameSelect.indexOf(fil) > -1)
        }
      } else {
        if (!this.variableNameSelect.length && !this.variableModelNameHeaderArr.length) {
          this.filterHeaderArr = []
        } else if (this.variableNameSelect.length && !this.variableModelNameHeaderArr.length) {
          this.filterHeaderArr = this.variableNameSelect
        } else if (!this.variableNameSelect.length && this.variableModelNameHeaderArr.length) {
          this.filterHeaderArr = this.variableModelNameHeaderArr// .filter(fil => this.variableModelNameHeaderArr.indexOf(fil) > -1)
        } else {
          this.filterHeaderArr = this.variableNameSelect.filter(fil => this.variableModelNameHeaderArr.indexOf(fil) > -1)
        }
      }
    },
    filterNodeMethod (value:string) {
      if (!value) {
        this.fields.arr = []
        this.fields.arr.push(...this.allfields.arr)
      } else {
        this.fields.arr = []
        this.fields.arr.push(...this.allfields.arr.filter((item:any) => { return item.label.toUpperCase().includes(value.toUpperCase()) }))
      }
    },
    onSubmit(scope: any) {
      const row = scope.row
      const blockKeyArr = [] as string[]
      const blockValArr = [] as string[]
      this.columns.forEach((item: any) => {
        blockKeyArr.push(item.prop)
        blockValArr.push(row[item.prop])
      })
      row.blockKey = blockKeyArr.join(ArrayToString)
      row.blockVal = blockValArr.join(ArrayToString)
      this.updateDataInputsFilesWithDBSync(row).then(res => {
        row.blockKey = blockKeyArr
        row.blockVal = blockValArr
        // this.dataPreview.value = scope
        this.provisional = null
        this.currColumnProp = ''
      })
    },
    handleClosePreviewOpen() {
      this.dataPreview.value = null
    },
    buildColumnData(items: DataMappingItem[]) {
      const columns = items.map((item: DataMappingItem, index: number) => {
        return { label: item.block, prop: item.blockId + dataInputBlockIDDelimiter + item.name, blockId: item.blockId }
      }) || []
      if (this.getDataModel.isDateCenter) {
        return [
          {
            prop: 'field',
            label: '模块名称',
            fixed: true,
            blockId: 0
          },
          ...columns,
          {
            prop: FordateAlignType(this.getDataModel.dateAlignType),
            label: FordateAlignType(this.getDataModel.dateAlignType),
            fixed: false,
            blockId: 0
          },
          {
            prop: '_PROD_CODE',
            label: '_PROD_CODE',
            fixed: false,
            blockId: 0
          }
        ]
      } else {
        return [
          {
            prop: 'field',
            label: '模块名称',
            fixed: true,
            blockId: 0
          },
          ...columns,
          {
            prop: '_PROD_CODE',
            label: '_PROD_CODE',
            fixed: false,
            blockId: 0
          }
        ]
      }
    },
    buildTableData(items: DataMappingItem[], blocksTable: DataInputFile[]) {
      const columnsId = items.map(item => item.id)
      const mapper = (fn: any) => items.reduce((acc: any, item: any, index: any) => {
        acc[item.blockId + dataInputBlockIDDelimiter + item.name] = fn(item)
        return acc
      }, {})
      const arr = [
        { field: '变量名称', ...mapper((item: any) => item.name) },
        { field: '变量类型', ...mapper((item: any) => item.type) }
      ]
      if (this.getDataModel.isDateCenter) {
        const dateAlignType = FordateAlignType(this.getDataModel.dateAlignType)
        arr[0][dateAlignType] = dateAlignType
        arr[1][dateAlignType] = 'integer'
      }
      arr[0]._PROD_CODE = '_PROD_CODE'
      arr[1]._PROD_CODE = 'string'
      blocksTable.forEach((item: DataInputFile) => {
        if (!Array.isArray(item.blockKey)) {
          item.blockKey = (item.blockKey as string)?.split(ArrayToString) || []
          item.blockVal = (item.blockVal as string)?.split(ArrayToString) || []
          item.blockKey.forEach((iter: string, index: number) => {
            if (iter === 'field') {
              item[iter] = item.name
            } else if (iter.indexOf('_ENTRY_') !== -1) {
              delete item[iter]
              item[FordateAlignType(this.getDataModel.dateAlignType)] = item.blockVal[index]
            } else if (iter === '_PROD_CODE') {
              item[iter] = item.blockVal[index]
            } else {
              const blockKeys = iter.split(dataInputBlockIDDelimiter)
              const blockKey = blockKeys.pop()
              if (blockKeys.length === 0) iter = index === 0 ? iter = '0' + dataInputBlockIDDelimiter + iter : items[index - 1].blockId + dataInputBlockIDDelimiter + iter
              item[iter] = item.blockVal[index]
            }
          })
        }
        arr.push(item)
      })
      return arr
    },
    async getFields(scope: any) {
      const row = scope.row
      const options = await useDataInputsAPIs().readCsvFileMeta(row.absolutePath)
      this.fields.arr = options.map((item: string) => {
        return { label: item, value: item }
      })
      this.allfields.arr = options.map((item: string) => {
        return { label: item, value: item }
      })
    },
    async getHeaderList(scope: any) {
      try {
        this.fields.arr = await useDataInputsAPIs().readCsvFileMeta(scope.row.absolutePath)
      } catch (err) {
        return false
      }
    },
    ...mapActions(['updateDataInputsFilesWithDBSync']),
    contextmenu(event: MouseEvent, scope: any, currKey: any, currValue: any) {
      if (!scope.row.id) return false
      const menuItems = this.getModelNaviNodeContextMenuItems(scope, currKey, currValue)
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems
      })
    },
    getModelNaviNodeContextMenuItems(scope: any, currKey: any, currValue: any) {
      return [
        {
          title: '复制',
          shortCut: 'ctrl + c',
          disabled: currValue === '',
          onClick: () => this.handleCopy(scope, currKey, currValue)
        },
        {
          title: '粘贴',
          shortCut: 'ctrl + v',
          disabled: !this.provisional,
          onClick: () => this.handleStick(scope, currKey, currValue)
        }
      ]
    },
    handleCopy(scope: any, currKey: any, currValue: any) {
      this.provisional = {
        row: scope.row,
        keyValue: currValue
      }
    },
    handleStick(scope: any, currKey: any, currValue: any) {
      if (!this.provisional) {
        ElMessage({
          message: '请选择复制对象！',
          type: 'warning'
        })
        return false
      }
      const flag = scope.column.fixed
      const provisional = JSON.parse(JSON.stringify(this.provisional))
      if (flag) {
        provisional.row.blockKey.forEach((item: string) => {
          const blockKey = item.split(dataInputBlockIDDelimiter).push()
          if (item !== 'field') scope.row[item] = provisional.row[item]
        })
      } else {
        scope.row[currKey] = provisional.keyValue
      }
      this.onSubmit(scope)
    },
    handleTable(currButton: any) {
      this[currButton.fn]()
    }

  },
  mounted() {
    this.flag = false
    setTimeout(() => {
      this.flag = true
    }, 300)
    if (this.$refs.conBox) {
      const Erd = ElementResizeDetectorMaker()
      Erd.listenTo(this.$refs.conBox, (element: HTMLElement) => {
        this.height = element.offsetHeight
      })
    }
  },
  watch: {
    $route(to, from) {
      if (to.path !== '/data-input') {
        this.variableModelNamevisble = false
        this.variableNamevisble = false
        this.visble = false
      }
    },
    variableNameSelect: {
      handler(newVal, oldVal) {
        const x = Math.max(...(newVal.map(el => el.length)))
        this.width = x * 10 + 'px'
      }
    },
    variableTypeSelect: {
      handler(newVal, oldVal) {
        const s = Math.max(...(newVal.map(el => el.length)))
        this.typeSelectWidth = s * 9 + 'px'
      }
    },
    variableModelNameSelect: {
      handler(newVal, oldVal) {
        const m = Math.max(...(newVal.map(el => el.length)))
        this.modelNameWidth = m * 16 + 'px'
      }
    }
  }
})

</script>
<style lang="scss" scoped>
#dataInputMapping{
   width: 100%;
  height: calc(100% - 40px);
}
.mapping-box {
  display: flex;
  width: 100%;
  height: calc(100%);
  flex-direction: column;
  .popover-header{
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
  .column-header {
    width: 100%;
    cursor: default;
    user-select: none;

  }
  .button-group-box {
    width: 73px;
    margin: 10px 0;
  }
  .con-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  .header-search-box{
    width: 100%;
    position: relative;
    z-index: inherit;
    span{
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
    }
    .search-box{
      position: absolute;
      left: 0;
      top: 100%;
    }

  }
}
  .down-serch{
   padding: 0;
  }
.el-select-dropdown__item {
      width: 100%!important;
    }
</style>

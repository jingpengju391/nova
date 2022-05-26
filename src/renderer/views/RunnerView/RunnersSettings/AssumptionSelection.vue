<template>
  <split-panel
    class="assumption-selection"
    split-direction="horizontal"
    :main-pane-default-ratio="0.4"
    :mainPaneMinimumRatio="0.3"
  >
    <template #main>
      <!-- <h4 id="side-content-title">假设预览</h4> -->
      <el-empty
        v-show="!formData.value?.length"
        description="请添加假设信息"
        style="height: 100%"
      />
      <el-form
        class="pane-content"
        :model="currentRunner.assumption"
        :label-width="80"
        v-show="formData.value?.length"
      >
        <el-form-item
          class="form-item"
          v-for="item in formData.value"
          :label="item.name"
          :key="item.id"
        >
          <el-select
            v-if="flagSelect"
            v-model="currentRunner.assumption[item.id]"
            @change="handleChange(item)"
            @visible-change="(e) => handleVisibleChange(e, item)"
          >
            <el-option
              v-for="iter in item.options"
              :label="iter.label"
              :value="iter.id"
              :key="iter.id"
            ></el-option>
          </el-select>
          <el-button
            v-if="item.name === '选择假设'"
            type="primary"
            style="margin: 0 0 0 20px"
            >新建假设</el-button
          >
        </el-form-item>
      </el-form>
    </template>
    <template #side>
      <div
        class="preview pane-content"
        style="border-left: 1px solid #d0d0d0; height: 100%"
      >
        <el-button
          style="margin-bottom: 15px"
          :disabled="!currentPage?.value?.modelId || flag || true"
          icon="folder"
          type="primary"
          @click="handleDrawer"
          >新建情景</el-button
        >
        <el-empty v-if="!currentPage?.value?.modelId" />
        <el-table class="table-box" v-else ref="tableDom" border :data="V">
          <template v-for="(item, index) in S">
            <el-table-column
              v-if="item.status || item.value === 'name'"
              :prop="item.value"
              :label="item.label"
              :width="tableColumnWidth"
              :key="item.value"
            >
              <template #header="scope">
                <span
                  v-if="!item.isEdit"
                  :class="item.active ? 'select-section' : ''"
                  >{{ scope.column.label }}</span
                >
                <el-input
                  :class="scope.column.label ? '' : 'rlue-style'"
                  v-else
                  v-focus
                  v-model="scope.column.label"
                  placeholder="请输入内容"
                  @blur="hanldeEnter(scope.column, item)"
                  @keyup.enter="$event.target.blur()"
                  maxlength="inputNameLength"
                ></el-input>
              </template>
              <template #default="scope">
                <div v-if="index">
                  <el-input-number
                    :class="scope.row[item.value] ? '' : 'rlue-style'"
                    v-if="scope.row.type === 'number'"
                    v-model="scope.row[item.value]"
                    controls-position="right"
                    :disabled="!scope.column.label || true"
                    @blur="hanldeVariableField(scope)"
                    @input="hanldeVariableField(scope)"
                    @keyup.enter="$event.target.blur()"
                  />
                  <el-input
                    v-else
                    :class="scope.row[item.value] ? '' : 'rlue-style'"
                    :disabled="!scope.column.label || true"
                    v-model="scope.row[item.value]"
                    @blur="hanldeVariableField(scope)"
                    @keyup.enter="$event.target.blur()"
                  ></el-input>
                </div>
                <span
                  v-else
                  @contextmenu="(e) => hanldeEeditCell(e, scope, item, 1)"
                  >{{ scope.row[item.value] }}</span
                >
                <!-- <span :class="item.active ? 'select-section' : ''">{{
                  scope.row[item.value]
                }}</span> -->
              </template>
            </el-table-column>
          </template>
          <el-table-column fixed="right" width="35">
            <template #header>
              <el-popover placement="bottom" :width="250" trigger="click">
                <template #reference>
                  <el-icon><arrow-right /></el-icon>
                </template>
                <SectionList />
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </split-panel>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, watch, ref, nextTick, getCurrentInstance, defineEmits, toRefs } from 'vue'
import { useStore } from 'vuex'
import SplitPanel from '@/views/components/SplitPanel.vue'
import SectionList from '@/views/AssumptionView/PropertyNavigation/SectionList.vue'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
import { ArrayToString, tableColumnWidth, HTMLElementAny, VariableSectionlimiter, VariableSectionlimiterHeader } from '@shared/dataModelTypes/assumptions'
import { ElMessage } from 'element-plus'
export default defineComponent({
  components: { SplitPanel, SectionList },
  setup() {
    let temporaryName = {}
    const currentPage: any = reactive({})
    const currFile: any = reactive({})
    const flag = ref(false)
    const flagSelect = ref(false)
    const BaseURL = 'assumptionVar/'
    const store = useStore()
    const formData: any = reactive([])
    const V = store.getters['assumptionVar/variable']
    const S = store.getters['assumptionVar/section']
    const currentRunner = store.getters['runs/currentRunner']
    const tableDom = ref<null | HTMLElementAny>(null)
    const { proxy }: any = getCurrentInstance()
    // const emit = defineEmits(['createSection', 'createVariable'])
    const hanldeEeditCell = (event: MouseEvent, scope: any, curr: any, num: number) => {
      const menuItems = getModelNaviNodeContextMenuItems(scope, curr, num)
      proxy.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems
      })
    }
    const getModelNaviNodeContextMenuItems = (data: any, curr: any, num: number) => {
      return [
        {
          title: '编辑',
          shortCut: 'F12',
          onClick: () => updateCurrentModelNodeWithModelNaviNode(data, curr)
        },
        {
          title: '删除',
          shortCut: 'Ctrl+d',
          onClick: () => {
            const val = num ? '变量' : 'section'
            const name = num ? data.row.name : data.column.label
            proxy.$alert(`确定要删除${val} ${name}?`, '提示', {
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              showCancelButton: true
            }).then(() => {
              deleteModelFiles(data, curr)
            }).catch(() => { })
          }
        }
      ]
    }
    const updateCurrentModelNodeWithModelNaviNode = (data: any, curr: any) => {
      temporaryName = curr.label
      if (data.row) {
        data.row.drawer = true
        // emit('handleDrawer', data.row)
        store.commit('assumptionVar/addCurrVariable', data.row)
      } else {
        curr.isEdit = true
      }
    }
    const deleteModelFiles = (data: any, curr: any) => {
      const obj = data.row ? { id: data.row.id } : curr
      const path = data.row ? 'assumptionVar/deleteVariableInputsWithDBSync' : 'assumptionVar/deleteSectionInputsWithDBSync'
      store.dispatch(path, obj)
    }
    const renderSectionData = () => {
      V.forEach((item: any) => {
        const sKey = item?.sectionKey?.split(ArrayToString) ?? []
        const sVal = item?.sectionVal?.split(ArrayToString) ?? []
        sKey.map((iter: any, index: any) => {
          item[iter] = sVal[index]
        })
      })
    }
    const handleVisibleChange = (e: any, curr: any) => {
      currFile.value = curr
      if (!e || !curr || !curr.id) return
      const VariablePath = 'rollBackAssumptionVarVariableName'
      const SectionPath = 'rollBackAssumptionVarSectionName'
      store.dispatch(BaseURL + VariablePath, curr).then(_ => {
        store.dispatch(BaseURL + SectionPath, curr).then(_ => {
          renderSectionData()
          handleChange(curr)
        })
      })
    }
    const handleChange = (currItem: any) => {
      currentPage.value = currItem
      S.forEach((item: any) => {
        item.active = item.id === currentRunner.assumption[currItem.id]
      })
      nextTick(() => {
        const tableElement: any = tableDom.value && tableDom.value.$refs.bodyWrapper as HTMLElement
        const currentNodeElement = document.getElementsByClassName('select-section')[0] as HTMLElement
        if (currentNodeElement) {
          const TW = tableElement.offsetWidth / 2
          const CW = currentNodeElement.offsetWidth / 2
          const TX = tableElement.getBoundingClientRect().x
          const CX = currentNodeElement.getBoundingClientRect().x
          tableElement.scrollLeft = CX - TX - CW - TW
        }
        flagSelect.value = true
      })
    }
    const initData = async (id: number) => {
      if (!id) {
        ElMessage({
          message: '请选择模型！',
          type: 'warning'
        })
        return false
      }
      const PagesPath = 'recoverAssumptionVarPagesFromDB'
      const SectionPath = 'rollBackAssumptionVarSectionName'
      const pages = await store.dispatch(BaseURL + PagesPath, [id])
      pages.forEach(async (item: any) => {
        item.ref = item.name
        const sections = await store.dispatch(BaseURL + SectionPath, item)
        const sectionsFilter = sections.filter((item: any) => item.value !== 'name')
        item.options = sectionsFilter
      })
      formData.value = pages
      handleVisibleChange(true, formData.value[0])
    }
    const handleDrawer = () => {
      const G = {
        label: '',
        value: '',
        isEdit: true,
        status: true,
        width: tableColumnWidth
      }
      store.commit('assumptionVar/addSectionInputs', G)
      addSectionScroll()
    }
    const addSectionScroll = () => {
      nextTick(() => {
        const tableElement: any = tableDom.value && tableDom.value.$refs.bodyWrapper as HTMLElement
        const currentNodeElement = document.getElementsByClassName('el-table__body')[0] as HTMLElement
        tableElement.scrollLeft = currentNodeElement.offsetWidth
      })
    }
    const hanldeVariableField = (data: any) => {
      const obj = {
        form: {},
        treeIds: []
      }
      const sKey = []
      const sVal = []
      for (const i in data.row) {
        const str = i.split(VariableSectionlimiter)[0]
        if (str === VariableSectionlimiterHeader) {
          sKey.push(i)
          sVal.push(data.row[i])
        }
      }
      data.row.sectionKey = sKey.join(ArrayToString)
      data.row.sectionVal = sVal.join(ArrayToString)
      obj.form = data.row
      obj.treeIds = data.row.source.split(ArrayToString)
      store.dispatch('assumptionVar/updateVariableInputsWithDBSync', JSON.parse(JSON.stringify(obj.form)))
      //  emit('createVariable', obj)
    }
    const hanldeEnter = (data: any, curr: any) => {
      const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
      const flag = reg.test(data.label)
      if (!flag || !data.label) {
        ElMessage({
          message: '名称格式错误！',
          type: 'error'
        })
        return false
      }
      let num = 0
      S.forEach((item: any) => {
        if (item.label === data.label) {
          num++
        }
      })
      if (curr.id) {
        if (num > 1) {
          ElMessage({
            message: '名称重复！',
            type: 'error'
          })
          return false
        }
      } else {
        if (num > 0) {
          ElMessage({
            message: '名称重复！',
            type: 'error'
          })
          return false
        }
      }
      const timestamp = (new Date()).valueOf()
      const U = {
        label: data.label,
        value: curr.value ? curr.value : `${VariableSectionlimiterHeader}${VariableSectionlimiter}${timestamp}`,
        pageId: currentPage.value.id,
        status: true,
        id: curr.id,
        modelId: currentPage.value.modelId,
        sort: timestamp
      }
      const path = U.id ? 'assumptionVar/updateSectionInputsWithDBSync' : 'assumptionVar/addSectionInputsWithDBSync'
      store.dispatch(path, U)
    }
    onMounted(() => {
      initData(currentRunner.modelId)
    })
    watch(() => currentRunner.modelId, (newVal) => {
      initData(currentRunner.modelId)
    })
    watch(S, (newValue) => {
      const r = newValue.filter((item: any) => !item.label)
      const l = r.length
      flag.value = !!l
    })
    return {
      S,
      V,
      flag,
      flagSelect,
      formData,
      tableDom,
      tableColumnWidth,
      currentRunner,
      currentPage,
      handleChange,
      handleVisibleChange,
      handleDrawer,
      hanldeEnter,
      hanldeVariableField,
      SectionList
    }
  }
})
</script>

<style lang="scss" scoped>
@import "./global.scss";
.table-box {
  --el-table-border-color: transparent;
  --el-border-color-lighter: transparent;
  width: fit-content;
  .rlue-style {
    &:deep(.el-input__inner) {
      border-color: #dc7a7a;
    }
  }
  &:deep(.cell) {
    line-height: 32px;
  }
}
.assumption-selection {
  width: calc(100% - 180px);
  .pane-content {
    padding-right: 15px;
  }
  .preview {
    padding-left: 15px;
  }
  .select-section {
    color: #409eff;
  }
}
</style>

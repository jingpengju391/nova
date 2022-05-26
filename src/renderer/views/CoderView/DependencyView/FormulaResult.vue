<template>
  <div class="select-box">
    计算结果
    <el-select
      v-model="Selectvalue"
      @change="handelCurrentTasks"
      placeholder="请选择输出目录"
    >
      <el-option
        v-for="item in taskMonitsOptions"
        :key="item.value"
        :label="
          item.outputChildAddress === ''
            ? item.outputAddress
            : item.outputChildAddress
        "
        :value="item.id"
      >
      </el-option>
    </el-select>
    <div v-for="item in filesOptions" :key="item.value">
      <el-cascader
        v-model="item.value"
        :options="item.children"
        :props="{}"
        @change="handleChange"
        ref="cascader"
      >
        <template #default="{ data }">
          <span>{{ data.label }}</span>
          <!-- <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span> -->
        </template>
      </el-cascader>
    </div>
    <!-- <el-cascader
      v-model="value"
      :options="filesOptions"
      :props="{}"
      @change="handleChange"
      @expand-change="chag"
      ref="cascader"
    >
      <template #default="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
      </template>
    </el-cascader>
    <el-select
      v-model="fileSelectvalue"
      @change="handelFileSelect"
      placeholder="请选择输出文件"
    >
      <el-option
        v-for="item in fileOptions"
        :key="item.value"
        :label="item.name"
        :value="item.id"
      >
      </el-option>
    </el-select>
    <el-select
      v-model="SelectType"
      @change="handelCurrentType"
      placeholder="请选类型"
    >
      <el-option
        v-for="item in typeArray"
        :key="item.value"
        :label="item.node"
        :value="item.id"
      >
      </el-option>
    </el-select> -->
  </div>
  <div class="spilt-out-box">
    <split-panel
      split-direction="horizontal"
      style="height: 100%"
      :mainPaneDefaultRatio="0.4"
      class="panel-box"
    >
      <template #main>
        <div class="result-box">
          <ReferencePreview :childrenData="childrenData" :type="'prve'" />
        </div>
      </template>
      <template #side>
        <split-panel
          split-direction="horizontal"
          style="height: 100%"
          :mainPaneDefaultRatio="0.35"
        >
          <template #main>
            <div class="result-box">
              <ReferencePreview :childrenData="childrenData" :type="'cur'" />
            </div>
          </template>
          <template #side>
            <div class="result-box-right">
              <ReferencePreview :childrenData="childrenData" :type="'next'" />
            </div>
          </template>
        </split-panel>
      </template>
    </split-panel>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch, inject, nextTick } from 'vue'
import { createNamespacedHelpers, useStore } from 'vuex'
import { useTasksAPIs, useDataInputsAPIs, useModelsAPIs } from '../../../hooks/apis'
import store from '@/store'
import
PropertyFingerPrint,
{ LinkExpression, generatePropertyFingerPrintString, decodePropertyFingerPrintString, generateFullLinkChainWithoutBlockSelector }
  from '@/formulaLanguageServer/PropertyFingerPrint'
import defaultLanguageServer from '@/formulaLanguageServer'
import SplitPanel from '@/views/components/SplitPanel.vue'
import ReferencePreview from './ReferencePreview.vue'
import modelsDataSource from '@/store/modules/modelsDataSource'
import elementResizeDetectorMaker from 'element-resize-detector'
import { split } from 'lodash'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('tasks/')

export default defineComponent({
  components: { SplitPanel, ReferencePreview },
  setup() {
    const store = useStore()
    const taskList = store.getters['tasks/getTaskList']
    const taskMonitsOptions = ref([])
    const fileOptions = ref([])
    const value = ref([])
    const typeArray = ref([])
    const currentPropertyFP = inject('currentPropertyFP')
    const updateCurrentPropertyFP = inject('updateCurrentPropertyFP')
    const Selectvalue = ref('')
    const fileSelectvalue = ref('')
    const SelectType = ref('')
    const resultBoxH = ref(100)
    const tableBlockId = ref(0)
    const cascader = ref<null | HTMLElement>(null)
    let H = ref(0)
    const filesOptions = ref([])

    const currentProperty = store.state.models.currentProperty
    const modelNavigationTree = store.state.models.modelNavigationTree

    const ReferencePreviewData = reactive({ filterData: {}, path: '', blockId: 0, headerLen: 0 | null, indexData: {}, count: 0 })
    const csvFileData = reactive({ cols: [], rows: [] })
    const csvFileDataAll = reactive({ data: [] })

    const childrenData = reactive({ data: [], csvFileData: [], tableBlockId: 0, resultBoxH: 0 })
    const taskMonits = computed(() => {
      const currentModelNode = store.state.models?.currentModelNode
      const restaskList = taskList.filter(item => {
        if (currentModelNode !== undefined) {
          return item.modelId === currentModelNode?.modelId
        }
      })
      return restaskList
    })

    onMounted(() => {
      loadTaskListData(taskMonits.value)

      const self = this
      const erd = elementResizeDetectorMaker()
      erd.listenTo(document.getElementsByClassName('result-box'), function (element) {
        var Height = element.offsetHeight
        H.value = Height
        childrenData.resultBoxH = Height
      })
    })

    const ReferencePreviewList = computed(() => {
      const currentModelNode = store.state.models.currentModelNode
      if (!currentPropertyFP.data || currentModelNode === undefined || !currentModelNode.modelId) return { referringPropertiesList: [], currentPropertiesList: [], referredPropertiesList: [] }

      const currentPropertyFPWithoutLinkExpression = {
        ...currentPropertyFP.data,
        linkExpression: 'NA'
      }

      const fpString = generatePropertyFingerPrintString(currentPropertyFPWithoutLinkExpression)
      // if (currentModelNode === undefined) {
      //   return { referringPropertiesList: [], currentPropertiesList: [], referredPropertiesList: [] }
      // }

      const referredProperties = defaultLanguageServer.getReferredProperties(currentModelNode?.modelId, fpString)
      const referringProperties = defaultLanguageServer.getReferringProperties(currentModelNode?.modelId, fpString)
      const referringPropertiesList = []
      const referredPropertiesList = []
      const currentPropertiesList = []
      referringProperties.map(referringProperties => {
        try {
          const referringPropertyFP = decodePropertyFingerPrintString(referringProperties)
          const blockName = modelsDataSource.getCompleteModelBlock(referringPropertyFP.blockId).name
          if (referringPropertyFP.propertyType === 'series' || referringPropertyFP.propertyType === 'variables') {
            referringPropertiesList.push({
              id: referringPropertyFP.propertyId,
              name: referringPropertyFP.propertyName,
              type: referringPropertyFP.propertyType,
              blockId: referringPropertyFP.blockId,
              blockName: blockName
            })
          }
        } catch (e) {
          console.log(e)
        }
      })
      referredProperties.map(referred => {
        try {
          const referredPropertiesFP = decodePropertyFingerPrintString(referred)
          const blockName = modelsDataSource.getCompleteModelBlock(referredPropertiesFP.blockId).name
          if (referredPropertiesFP.propertyType === 'series' || referredPropertiesFP.propertyType === 'variables') {
            referredPropertiesList.push({
              id: referredPropertiesFP.propertyId,
              name: referredPropertiesFP.propertyName,
              type: referredPropertiesFP.propertyType,
              blockId: referredPropertiesFP.blockId,
              blockName: blockName
            })
          }
        } catch (e) {
          console.log(e)
        }
      })
      const CurBlockName = modelsDataSource.getCompleteModelBlock(currentPropertyFP.data.blockId).name
      if (currentPropertyFP.data.propertyType === 'series' || currentPropertyFP.data.propertyType === 'variables') {
        currentPropertiesList.push({
          id: currentPropertyFP.data.propertyId,
          name: currentPropertyFP.data.propertyName,
          type: currentPropertyFP.data.propertyType,
          blockId: currentPropertyFP.data.blockId,
          blockName: CurBlockName
        })
      }

      return { referringPropertiesList: referringPropertiesList, currentPropertiesList: currentPropertiesList, referredPropertiesList: referredPropertiesList }
    })

    // watch(taskMonits, (newVal) => {
    //   console.log(newVal)
    // })
    watch(ReferencePreviewList, (newVal) => {
      if (newVal) loadTaskListData(taskMonits.value)
    })
    const loadTaskListData = (taskmonits) => {
      taskmonits = JSON.parse(JSON.stringify(taskmonits))

      if (taskmonits.length === 0) return false
      const retasks = taskmonits.reverse()
      if (Selectvalue.value === '') {
        Selectvalue.value = retasks[0].id
        handelCurrentTasks(retasks[0].id)
      } else {
        handelCurrentTasks(Selectvalue.value)
      }

      taskMonitsOptions.value = retasks
    }
    const loadfileOptionsData = async (fillPath, curModelId) => {
      let blockIdArr = []
      let curBlockId = 0
      ReferencePreviewList.value.currentPropertiesList.map(item => {
        blockIdArr.push(item.blockId)
        curBlockId = item.blockId
      })
      ReferencePreviewList.value.referredPropertiesList.map(item => {
        blockIdArr.push(item.blockId)
      })
      ReferencePreviewList.value.referringPropertiesList.map(item => {
        blockIdArr.push(item.blockId)
      })

      //  blockIdArr.push(3)

      blockIdArr = Array.from(new Set(blockIdArr))
      const fileOptionArr = []
      let blockNameArr = []
      const outputs = store.state.outputs.outputs
      await outputs.map(async output => {
        const targetMask = await modelsDataSource.getTargetMaskForLinkChain(output.linkChain)
        blockIdArr.map(item => {
          if (targetMask.id === item && curModelId === targetMask.modelId) {
            fileOptionArr.push({
              name: output.name,
              blockId: targetMask.id,
              blockName: targetMask.name
            })
            blockNameArr.push(targetMask.name)
          }
        })
      })
      blockNameArr = Array.from(new Set(blockNameArr))
      let resultArr = []

      await blockNameArr.map(blockname => {
        resultArr.push({
          value: [],
          label: blockname,
          children: []
        })
      })
      const outputsFileList = useDataInputsAPIs().readDirectory(fillPath)
      // const re = await loadFilesOptions(fileOptionArr, blockNameArr, outputsFileList, fillPath)
      await outputsFileList.then(fileLists => {
        fileLists.map(fileList => {
          if (fileList.isFile) {
            fileOptionArr.map((fileOption, index) => {
              if (fileList.name.split('.')[1] === fileOption.name.toLowerCase() && fileList.name.split('.')[2] === 'csv') {
                resultArr.map(result => {
                  if (result.label === fileOption.blockName) {
                    result.children.push({
                      id: index,
                      value: index,
                      label: fileOption.name,
                      name: fileOption.name,
                      absolutePath: fileList.absolutePath,
                      baseFilePath: fillPath,
                      blockId: fileOption.blockId,
                      blockName: fileOption.blockName,
                      children: []
                    })
                  }
                })
              }
            })
          }
        })
      })
      await resultArr.map(async outMask => {
        outMask.children.map(async outFile => {
          const typeDataArr = await loadTypeDataAll(outFile.baseFilePath, outFile.name)
          outFile.children.push(...typeDataArr)
        })
      })

      nextTick(() => {
        // filesOptions.value = resultArr
        //  filesOptions.value = resultArr
      })

      setTimeout(async () => {
        filesOptions.value = resultArr
        let selectArr = []
        await resultArr.map(resu => {
          if (resu.children.length > 0) {
            resu.value.push(resu.children[0].id)
            resu.value.push(resu.children[0].children[0].node)
            selectArr.push({ data: resu.children[0].children[0], blockId: resu.children[0].blockId })
          }
        })
        initCsvDataAlld(selectArr, curBlockId)
      }, 1000)
    }

    const loadFilesOptions = async (fileOptionArr, blockNameArr, outputsFileList, fillPath) => {
      let resultArr = []
      await outputsFileList.then(fileLists => {
        fileLists.map(fileList => {
          if (fileList.isFile) {
            fileOptionArr.map((fileOption, index) => {
              if (fileList.name.split('.')[1] === fileOption.name && fileList.name.split('.')[2] === 'csv') {
                resultArr.map(result => {
                  if (result.label === fileOption.blockName) {
                    result.children.push({
                      id: index,
                      value: index,
                      label: fileOption.name,
                      name: fileOption.name,
                      absolutePath: fileList.absolutePath,
                      baseFilePath: fillPath,
                      blockId: fileOption.blockId,
                      blockName: fileOption.blockName,
                      children: []
                    })
                  }
                })
              }
            })
          }
        })
      })
      await resultArr.map(async outMask => {
        outMask.children.map(async outFile => {
          const typeDataArr = await loadTypeDataAll(outFile.baseFilePath, outFile.name)
          outFile.children.push(...typeDataArr)
        })
      })

      let selectArr = []
      return resultArr
    }
    const loadcsvData = (dataArr) => {

    }

    const loadTypeDataAll = async (fileBasrPath, fileName) => {
      const fillPath = useDataInputsAPIs().pathJoin(fileBasrPath, 'index')
      const outputsFileList = useDataInputsAPIs().readDirectory(fillPath)
      let fileOptionsResult: any = ''
      await outputsFileList.then(fileLists => {
        fileLists.map(fileList => {
          if (fileList.isFile) {
            if (fileList.name.split('.')[1] === fileName.toLowerCase() && fileList.name.split('.')[2] === 'csv') {
              fileOptionsResult = fileList.absolutePath
            }
          }
        })
      })
      const result1 = useDataInputsAPIs().readCsvFile(fileOptionsResult, 5000)
      const resultArr = []
      await result1.then(ite => {
        ite.rows.map((item, index) => {
          if (item[0] === 'R') {
            resultArr.push({
              id: index,
              node: item[1],
              value: item[1],
              label: item[1],
              fileName: item[2],
              pos: item[3],
              len: item[4],
              path: fileOptionsResult,
              headerLen: item[5],
              basePath: fileBasrPath
            })
          }
        })
      })
      typeArray.value = resultArr
      // return resultArr[0]
      return resultArr
    }

    const handelCurrentTasks = async (val) => {
      const relativePath = store.getters.getCurrentWorkspaceDirPath
      const curTaskMonit = taskMonits.value.filter(item => { return item.id === val })
      let fillPath = ''
      const modelName = await useModelsAPIs().db.queryModel(curTaskMonit[0].modelId)
      if (curTaskMonit[0].outputChildAddress === '') {
        fillPath = useDataInputsAPIs().pathJoin(relativePath, modelName.name, curTaskMonit[0].outputAddress)
      } else {
        fillPath = useDataInputsAPIs().pathJoin(relativePath, modelName.name, curTaskMonit[0].outputAddress, curTaskMonit[0].outputChildAddress)
      }
      loadfileOptionsData(fillPath, curTaskMonit[0].modelId)
    }

    const initCsvDataAlld = async (data, curBlockId) => {
      const csvFileDataAlla = []
      csvFileDataAll.data = []
      ReferencePreviewData.filterData = {}
      await data.map(async item => {
        const fillPath = await useDataInputsAPIs().pathJoin(item.data.basePath, item.data.fileName)
        const resultHeaderCsvFile = await useModelsAPIs().readFileIndexPos(fillPath, parseInt(item.data.headerLen), 0)
        const resultCsvFile = await useModelsAPIs().readFileIndexPos(fillPath, (parseInt(item.data.len - 1)), parseInt(item.data.pos))
        const resultCsvFileArr = resultCsvFile.split('\n')

        csvFileDataAlla.push({
          blockId: item.blockId,
          cols: resultHeaderCsvFile.split(','),
          rows: resultCsvFileArr.slice(0, resultCsvFileArr.length)
        })
      })

      setTimeout(() => {
        tableBlockId.value = curBlockId
        ReferencePreviewData.filterData = ReferencePreviewList.value
        childrenData.data = ReferencePreviewList.value
        childrenData.csvFileData = []
        childrenData.tableBlockId = curBlockId
        childrenData.resultBoxH = H.value
        childrenData.csvFileData.push(...csvFileDataAlla)
        csvFileDataAll.data.push(...csvFileDataAlla)
        resultBoxH.value = H.value
      }, 1000)
    }
    const handleChange = async (value) => {
      let selectArr1 = []

      await filesOptions.value.map(resu => {
        resu.children.map(outC => {
          if (outC.id === resu.value[0]) {
            outC.children?.map(innerC => {
              if (innerC.node === resu.value[1]) {
                selectArr1.push({ data: innerC, blockId: outC.blockId })
              }
            })
          }
        })
      })
      initCsvDataAlld(selectArr1, tableBlockId.value)
    }

    return {
      typeArray,
      loadFilesOptions,
      taskList,
      taskMonits,
      taskMonitsOptions,
      fileOptions,
      ReferencePreviewData,
      childrenData,
      Selectvalue,
      fileSelectvalue,
      csvFileData,
      SelectType,
      resultBoxH,
      tableBlockId,
      H,
      value,
      filesOptions,
      csvFileDataAll,
      handelCurrentTasks,
      loadTaskListData,
      loadfileOptionsData,
      loadTypeDataAll,
      initCsvDataAlld,
      handleChange,
      cascader
    }
  }

})
</script>

<style lang="scss" scoped>
.select-box {
  width: 100%;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  p {
    margin: 0;
    padding: 15px 0px;
  }
  div {
    margin-right: 10px;
  }
  .el-select {
    width: 150px;
    margin: 0 10px;
  }
}
.spilt-out-box {
  height: calc(100% - 80px);
  padding: 0;
  margin: 0px 20px;
  // padding: 10px 0;
  border: 1px solid var(--nova-border-color);

  .panel-box {
    div.result-box {
      height: 100%;
      padding: 0 10px;
      border-right: 1px solid var(--nova-border-color);
    }
    div.result-box-right {
      height: 100%;
      padding: 0 10px;
    }
  }
}
</style>

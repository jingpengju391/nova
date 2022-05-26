<template>
  <div class="help-tree-box">
    <el-tree
      :data="dataAll.newD"
      :props="defaultProps"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, ref, onMounted, nextTick, toRaw, toRefs, computed } from 'vue'
import { useStore, createNamespacedHelpers } from 'vuex'
import { useHelpsAPIs, useDataInputsAPIs } from '../../../hooks/apis'
import { TreeDataType } from '../types'
const store = useStore()
const props1 = defineProps<{ treeData: any }>()
const emit = defineEmits(['hanldeChangeCurList'])

const dataAll = reactive({
  newD: [] as TreeDataType[]
})
const defaultProps = reactive({
  children: 'children',
  label: 'label'
})
const treeSourceData: TreeDataType[] = []
const handleNodeClick = (data, node) => {
  emit('hanldeChangeCurList', data)
}
const loadCurrNavData = async (src, dataAll) => {
  const indexPtah = useDataInputsAPIs().pathJoin(src, 'index.md')
  const currNavList = await useHelpsAPIs().readDocFile(indexPtah)
  const currNavLists = currNavList.split('\r\n')
  for (let i = 0; i < currNavLists.length; i++) {
    if (currNavLists[i] !== '') {
      const navl = await useHelpsAPIs().helpFileInfos(useDataInputsAPIs().pathJoin(src, currNavLists[i]))
      store.commit('helps/addNavSerchList', {
        label: navl.name.split('.')[0],
        isFile: navl.isFile,
        isDirectory: navl.isDirectory,
        id: navl.id,
        children: [],
        absolutePath: navl.absolutePath,
        name: navl.name
      })
      if (navl.isDirectory) {
        dataAll.push(
          {
            label: navl.name.split('.')[0],
            isFile: navl.isFile,
            isDirectory: navl.isDirectory,
            id: navl.id,
            children: [],
            absolutePath: navl.absolutePath,
            name: navl.name
          }
        )
        await loadCurrNavData(navl.absolutePath, dataAll[i].children)
      } else {
        dataAll.push(
          {
            label: navl.name.split('.')[0],
            isFile: navl.isFile,
            isDirectory: navl.isDirectory,
            id: navl.id,
            children: [],
            absolutePath: navl.absolutePath,
            name: navl.name
          }
        )
      }
    } else {
      currNavLists.splice(i, 1)
      i--
    }
  }
  return dataAll
}

const loadChildNavData = async () => {
  const treeSourceDataArr = await loadCurrNavData(props1.treeData, treeSourceData)
  for (let i = 0; i < treeSourceDataArr.length; i++) {
    dataAll.newD.push(treeSourceDataArr[i])
  }
}

const claerDefafult = async () => {
  dataAll.newD.splice(0, dataAll.newD.length)
  treeSourceData.splice(0, treeSourceData.length)
}

onMounted(async () => {
  loadChildNavData()
})
watch(props1, async (newV) => {
  await claerDefafult()
  loadChildNavData()
})

</script>

<style lang="scss" scoped>
.help-tree-box {
  .el-tree {
    background: transparent;
  }
  &:deep(.el-tree-node__content) {
    font-size: 14px;
    height: 32px;
    > .el-tree-node__expand-icon {
      // padding: 6px 8px;
    }
  }
  &:deep(.el-tree-node:focus) {
    > .el-tree-node__content {
      // background-color: #d9eeff;
      color: black;
      font-weight: 600;
      color: #3b8bff;
    }
  }

  &:deep(.el-tree-node.is-current) {
    > .el-tree-node__content {
      //  background-color: #cce9ff;
      //  border: 1px solid #3b8bff;
      font-weight: 700;
      color: #3b8bff;
    }
  }

  &:deep(.el-tree-node__content:hover) {
    background-color: #cce9ff;

    .mask-block-node > .tool-sets {
      opacity: 1;
    }
  }
}
</style>

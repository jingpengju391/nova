<template>
  <div id="project-variable">
    <div id="header">
      <span>数据变量</span>
    </div>
    <div class="table-box">
      <el-table
        :data="dataSurceVariables"
        border
        height="100%"
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="source" label="来源" />
        <!-- <el-table-column prop="type" label="类型" /> -->
        <el-table-column label="类型" width="180">
        <template #default="scope">
          <el-select v-model="scope.row.type" class="m-2" placeholder="请选择类型">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
    </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang = "ts">
import { clone } from '@shared/functional'
import path from 'path'
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { useDataCleanAPIs, useDataInputsAPIs } from '../../hooks/apis'
const { mapState, mapMutations, mapActions } = createNamespacedHelpers('project/')
export default defineComponent({
  data() {
    return {
      dataSource: [],
      oldPath: '',
      options: [
        {
          value: 'string',
          label: '字符串'
        },
        {
          value: 'integer',
          label: '整数'
        },
        {
          value: 'double',
          label: 'Double'
        }
      ]
    }
  },
  computed: {
    ...mapState(['projects', 'currProject', 'dataSurceVariables', 'currentDataSurceVariable'])
  },
  watch: {
    currProject: {
      handler(newValue, oldValue) {
        // console.log(newValue, 'newValue')
        // if (!newValue) return
        // let path = ''
        // if (newValue.parentId === undefined) {
        //   if (newValue.children === undefined) {
        //     path = newValue.path
        //     //  this.formatDataSurceVariables(newValue.path)
        //   } else if (newValue.children[0].children.length) {
        //     path = newValue.children[0].children[0].absolutePath
        //     //  this.formatDataSurceVariables(path)
        //     this.formatDataSurceOutputVariables(newValue.children[0])
        //   } else {
        //     // path = ''
        //     // this.dataSource = []
        //     // this.addDataSurceVariables([])
        //   }
        // } else if (newValue.parentId === 0) {
        //   if (newValue.children[0].children.length) {
        //     path = newValue.children[0].children[0].absolutePath
        //     this.formatDataSurceOutputVariables(newValue.children[0])
        //     // this.formatDataSurceVariables(path)
        //   } else {
        //     // path = ''
        //     // this.dataSource = []
        //     // this.addDataSurceVariables([])
        //   }
        // } else {
        //   if (newValue.type === 'dataSource') {
        //     path = newValue.absolutePath
        //     if (path === undefined && newValue.children.length) {
        //       path = newValue.children[0].absolutePath
        //     }
        //   } else {
        //     const newCur = this.projects.filter(filter => { return filter.id === newValue.parentId })[0]
        //     if (newCur.children[0].children.length) {
        //       path = newCur.children[0].children[0].absolutePath
        //       // this.formatDataSurceVariables(path)
        //       this.formatDataSurceOutputVariables(newCur.children[0])
        //     } else {
        //       // path = ''
        //       // this.dataSource = []
        //       // this.addDataSurceVariables([])
        //     }
        //   }
        // }
        // if (path && path !== this.oldPath) {
        //   this.formatDataSurceVariables(path)
        // }
        // console.log(path, 'pathpathpath')

        // this.oldPath = clone(path)
      },
      deep: true,
      immediate: true
    },
    currentDataSurceVariable: {
      handler(newValue, oldValue) {
        if (!newValue) return
        console.log(newValue, 'newValuenewValue')
        this.formatDataSurceVariables(newValue.currentPath)
        this.formatDataSurceOutputVariables1(newValue.outputsPathArr)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapMutations(['addDataSurceVariables', 'addDataSurceOutputVariables']),
    async formatDataSurceVariables(datapath: string) {
      if (!datapath) {
        this.addDataSurceVariables([])
        return
      }
      this.dataSource.length = 0
      const resultData = await useDataInputsAPIs().readCsvFile(datapath.toString(), 10)
      await resultData.columns.map(item => {
        this.dataSource.push({ name: item, source: resultData.name + '.csv' })
      })
      this.addDataSurceVariables(this.dataSource)
    },
    async formatDataSurceOutputVariables(dataSourceArr: any[]) {
      this.dataSource.length = 0
      const dataSourceAll = []
      for (let i = 0; i < dataSourceArr.children.length; i++) {
        const resultData = await useDataInputsAPIs().readCsvFile(dataSourceArr.children[i].absolutePath.toString(), 3)
        dataSourceAll.push(...resultData.columns)
      }
      const result = Array.from(new Set(dataSourceAll))
      this.addDataSurceOutputVariables(result)
    },
    async formatDataSurceOutputVariables1(dataSourceArr: any[]) {
      this.dataSource.length = 0
      if (!dataSourceArr.length) {
        this.addDataSurceOutputVariables([])
        return
      }
      const dataSourceAll = []
      for (let i = 0; i < dataSourceArr.length; i++) {
        const resultData = await useDataInputsAPIs().readCsvFile(dataSourceArr[i], 3)
        dataSourceAll.push(...resultData.columns)
      }
      const result = Array.from(new Set(dataSourceAll))
      this.addDataSurceOutputVariables(result)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";
#project-variable {
  height: 100%;
  border-left: 1px solid var(--nova-border-color);
  padding: 10px;
  #header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    margin-bottom: 10px;
    span {
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
  .table-box {
    height: calc(100% - 35px);
  }
}
</style>

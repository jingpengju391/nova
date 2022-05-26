<template>
  <div class="task-console-box">
    <p v-for="(item, index) in consoleInfo" :key="index">
      {{ item }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { formatDate } from './utils'
import { useDataInputsAPIs, useTasksAPIs } from '../../../../hooks/apis'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('tasks/')
export default defineComponent({
  data() {
    return {
      consoleInfo: []
    }
  },
  computed: {
    ...mapState(['taskConsoleFolderPath']),
    taskConsoleFolderPathStr() {
      if (Object.keys(this.taskConsoleFolderPath).length) {
        const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
        const folderConsolePath = useDataInputsAPIs().pathJoin(relativePath, this.taskConsoleFolderPath.modelName, this.taskConsoleFolderPath.outputAddress)
        return folderConsolePath
      } else {
        return ''
      }
    }
  },
  mounted() {
    this.setConfig()
  },
  methods: {
    async setConfig() {
      if (Object.keys(this.taskConsoleFolderPath).length) {
        const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
        const folderConsolePath = await useDataInputsAPIs().pathJoin(relativePath, this.taskConsoleFolderPath.modelName, this.taskConsoleFolderPath.outputAddress)
        const res = await useDataInputsAPIs().readDirectory(folderConsolePath)
        const nameReg = /(.+(?=[.txt]$))/
        const childrenArr = res.filter(item => { return nameReg.test(item.name) })
        const readResult = await useTasksAPIs().readConsoleFile(childrenArr[0].absolutePath)

        const startReg = /starts\.$/gm
        const str = readResult.match(startReg)

        this.consoleInfo = readResult.split('\r\n')
      }
    }
  },
  watch: {
    taskConsoleFolderPathStr: {
      handler(newName, oldName) {
        this.setConfig()
      },
      deep: true
    }
  }

})
</script>
<style scoped lang="scss">
.task-console-box {
  padding: 20px 10px;
  width: 100%;
  border-right: 1px solid var(--nova-border-color);
  // height: 100%;
  // overflow-y: scroll;
  p {
    margin: 0;
    font-size: 12px;
  }
}
</style>

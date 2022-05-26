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
import { useDataInputsAPIs, useTasksAPIs } from '../../../hooks/apis'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('tasks/')
export default defineComponent({
  components: {

  },
  props: {
    FolderPath: {
      type: Object
    }
  },
  data() {
    return {
      consoleInfo: ''
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {
    async setConfig() {
      const res = await useDataInputsAPIs().readDirectory(this.FolderPath.path)
      const nameReg = /(.+(?=[.txt]$))/
      const childrenArr = res.filter(item => { return nameReg.test(item.name) })
      const readResult = await useTasksAPIs().readConsoleFile(childrenArr[0].absolutePath)

      const startReg = /starts\.$/gm
      const str = readResult.match(startReg)
      //  console.log(str)

      this.consoleInfo = readResult.split('\r\n')
    }
  },
  watch: {
    FolderPath: {
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
  padding: 10px;
  width: 100%;
  // height: 100%;
  // overflow-y: scroll;
  p {
    margin: 0;
    font-size: 12px;
  }
}
</style>

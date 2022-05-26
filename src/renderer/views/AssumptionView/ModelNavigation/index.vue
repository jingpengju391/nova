<template>
  <div class="model-box">
    <WorkNavigation :workbar="ModelNavigationWorkBar" @hanldeChangeGetH="hanldeChangeGetH">
      <template v-slot:Variables>
        <VariablesTree
          @hanldeChangeNode="hanldeChangeNode"
        />
      </template>
      <template v-slot:files>
        <FileTree
          @hanldeChangeNode="hanldeChangeNode"
          :tableH="tableH"
        />
      </template>
    </WorkNavigation>
  </div>
</template>
<script setup lang=ts name="ModelNavigation">
import { ref } from 'vue'
import { WorkNavigation } from '@/views/components'
import { ModelNavigationWorkBar } from '../config'
import VariablesTree from './VariablesTree.vue'
import FileTree from './FileTree.vue'
import { modelFile } from '../types'
const emit = defineEmits(['hanldeChangeNodeButton', 'hanldeChangeNavigation'])

const hanldeChangeNode = (node: modelFile) => {
  emit('hanldeChangeNodeButton', node)
}
const tableH = ref(0)
const hanldeChangeGetH = (hei: number) => {
  console.log(hei)
  tableH.value = hei
}

</script>
<style lang="scss" scoped>
.model-box {
  height: 100%;
  padding: 10px;
  border-right: 1px solid #d0d0d0;
  background: #f4f9fd;
}
</style>

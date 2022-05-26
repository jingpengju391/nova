<template>
  <div class="diff-center">
    <!-- <el-tabs class="tabs-box" v-model="activeName" @change="onChange">
      <el-tab-pane v-for="tab in diffTabs" :key="tab.value" :label="tab.label" :name="tab.value"></el-tab-pane>
    </el-tabs> -->
    <component :is="componentId" ></component>
  </div>
</template>
<script lang="ts" setup name="DiffCenter">
import { computed } from 'vue'
import { useStore } from 'vuex'
import DiffEditor from '@/views/components/DiffEditor.vue'
import DiffAttribute from '../DiffAttribute/index.vue'
import { code } from '@shared/PrivateDeployment'
const store = useStore()
const componentId = computed(() => {
  const currentFormulaItem = store.state.models.currentFormulaItem
  const K = currentFormulaItem.original[0].split(' ')
  return code.includes(K[K.length - 1]) ? DiffEditor : DiffAttribute
})
</script>
<style lang="scss" scoped>
.diff-center{
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .tabs-box{
    padding: 0 15px;
  }
  .diff-label{
    &:deep(.el-form-item__label){
      color:red
    }
  }
}
</style>
<style lang="scss">
.diff-center{
  .diff-label{
    .el-form-item__label{
      color:red
    }
  }
  .tag{
    margin: 0 10px 10px 0;
  }
}
</style>

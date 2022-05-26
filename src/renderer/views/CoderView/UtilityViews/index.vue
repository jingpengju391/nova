<template>
  <div class="top-box">
    <el-tabs class="tabs-box" v-model="activeValue" :type="tabs.type">
      <el-tab-pane
        v-for="tab in tabs.tabPanes"
        :key="tab.value"
        :label="tab.label"
      ></el-tab-pane>
    </el-tabs>
    <div class="icon-box">
      <!-- <el-icon color="#000" @click="store.commit('models/updateMainPaneDefaultRatio',0)">
        <full-screen />
      </el-icon> -->
      <el-icon
        color="#000"
        @click="store.commit('models/toggleConsoleDisplay')"
      >
        <minus />
      </el-icon>
    </div>
  </div>
  <div id="np-rogress">
    <component :is="component"></component>
  </div>
</template>
<script setup lang=ts name="UtilityViews">
import { computed, watch } from 'vue'
import { Console, ErrorList, Watch, PrivateDeployment } from './components'
import GlobalSearchReplace from '@/views/GlobalSearchReplace/index.vue'
import { tabs } from '../config'
import { activeValue } from '../config/tabs'
import { useStore } from 'vuex'
import { setSourceControlCenter } from '@/views/PrivateDeployment/config'
import TaskTableList from '@/views/taskView/TaskTableList/index.vue'
const store = useStore()
const component = computed(() => {
  let active = null
  switch (activeValue.value) {
    // case '0':
    //   active = ErrorList
    //   break
    case '0':
      active = Console
      break
    // case '2':
    //   active = Watch
    //   break
    case '1':
      active = TaskTableList
      break
    case '2':
      active = GlobalSearchReplace
      break
    case '3':
      active = PrivateDeployment
      break
  }
  return active
})

watch(component, () => {
  component.value === PrivateDeployment && setSourceControlCenter()
})
</script>
<style lang="scss" scoped>
@import "./scss/index.scss";
#np-rogress{
  width: 100%;
  height: 100%;
}
</style>

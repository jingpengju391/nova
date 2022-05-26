<template>
  <div style="height: 100%; z-index: 9">
    <div class="top-box">
      <el-tabs class="tabs-box" v-model="activeValue" :type="tabs.type">
        <el-tab-pane
          v-for="tab in tabs.tabPanes"
          :key="tab.value"
          :label="tab.label"
        ></el-tab-pane>
      </el-tabs>
      <div class="icon-box">
        <el-icon
          color="#000"
          @click="
            store.commit('tasks/setConsoleHide', !store.state.tasks.hideConsole)
          "
        >
          <minus />
        </el-icon>
      </div>
    </div>
    <div :class="activeValue === '0' ? 'compoent-box no-s' : 'compoent-box'">
      <TaskTableList v-show="activeValue === '1'" />
      <div class="console-box">
        <Console v-show="activeValue === '0'" />
      </div>
    </div>
  </div>
</template>
<script setup lang=ts name="UtilityViews">
import { computed, ref } from 'vue'
// import { Console, TaskTableList } from './components'
import Console from '@/views/components/Console.vue'
import TaskTableList from '@/views/taskView/TaskTableList/index.vue'
// import { tabs } from '../config'
// import { activeValue } from '../config/tabs'
import { useStore } from 'vuex'
const store = useStore()
const activeValue = ref('0')
// const Console = Consoles
// const TaskTableList = TaskTableLists
const tabs = {
  type: 'border-card',
  tabPanes: [
    {
      value: '0',
      label: '信息'
    },
    {
      value: '1',
      label: '本地任务'
    }
  ]
}
const component = computed(() => {
  let active = null
  switch (activeValue.value) {
    case '0':
      active = Console
      break
    case '1':
      active = TaskTableList
      break
  }
  return active
})
</script>
<style lang="scss">
</style>
<style lang="scss" scoped>
.console-box {
  height: calc(100% - 40px);
}
.top-box {
  display: flex;
  width: 100%;
  border-right: 1px solid var(--nova-border-color);
  .tabs-box {
    flex: 1;
    width: 0;
    box-shadow: none;
    border-right: 0px;
    border-left: 0px;
    border-bottom: 0px;
    &:deep(.el-tabs__content) {
      padding: 0;
    }
  }
  .icon-box {
    display: flex;
    height: 40px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-top: 1px solid #e4e7ed;
    justify-content: center;
    align-items: center;
    i {
      margin-left: 10px;
    }
    i:last-child {
      margin-right: 10px;
    }
  }
}
.compoent-box {
  height: calc(100%);
  // overflow-y: scroll;
}
.no-s {
  overflow-y: hidden;
  border-right: 1px solid lightgray;
}
</style>

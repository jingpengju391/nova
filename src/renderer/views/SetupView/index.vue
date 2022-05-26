<template>
<div class="setup-box">
  <app-tool-bar
      @left-toggle-click="store.commit('masters/toggleMasterNaviViewDisplay')"
      @right-toggle-click="store.commit('masters/togglePropertyViewDisplay')"
      @save-button-click="eventBus.emit(SaveCurrentFormulaChannel)"
    />
  <el-tabs class="setupTab" type="border-card">
    <el-tab-pane label="设置"></el-tab-pane>
    <setup-main  class="setup-main" />
  </el-tabs>
  <app-status-bar />
</div>
</template>

<script setup lang="ts" name="setup">
import { AppStatusBar, AppToolBar } from '@/views/components'
import { useStore } from 'vuex'
import eventBus, { SaveCurrentFormulaChannel } from '@/views/CoderView/eventBus'
// import { SetupMain } from './components'
import SetupMain from './components/SetupMain/index.vue'

const store = useStore()
</script>

<style lang=scss scoped>
@import './scss/setup.scss'
</style>

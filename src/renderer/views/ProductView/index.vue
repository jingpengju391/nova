<template>
  <div class="product-box">
    <app-tool-bar
      @left-toggle-click="store.commit('masters/toggleMasterNaviViewDisplay')"
      @right-toggle-click="store.commit('masters/togglePropertyViewDisplay')"
      @save-button-click="eventBus.emit(SaveCurrentFormulaChannel)"
    />
    <product-main class="product-main" />
    <app-status-bar @toggle-console="store.commit('models/toggleConsoleDisplay')" />
  </div>
  <master-dialog />
  <product-dialog />
</template>
<script setup lang=ts name="product">
import { AppStatusBar, AppToolBar } from '@/views/components'
import { ProductMain } from './components'
import { Master as MasterDialog, Product as ProductDialog } from './components/Dialog'
import { useStore } from 'vuex'
import { watch, computed } from 'vue'
import eventBus, { SaveCurrentFormulaChannel } from '@/views/CoderView/eventBus'
const store = useStore()
</script>
<style lang=scss scoped>
@import './scss/product.scss';
</style>

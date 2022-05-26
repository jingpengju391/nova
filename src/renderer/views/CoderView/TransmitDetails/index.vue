<template>
  <div class="transmit-box">
    <component-tool-bar />
    <component-transmit-table />
  </div>
</template>
<script setup lang="ts" name="TransmitDetails">
import { ToolBar, TransmitTable } from './components'
const ComponentToolBar = ToolBar
const ComponentTransmitTable = TransmitTable
</script>
<style lang="scss" scoped>
@import '../scss/transmit-details.scss';
</style>

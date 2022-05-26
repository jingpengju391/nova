<template>
  <div class="tool-bar" @click="onButtonsClicked">
    <icon-button
      class="create-property-button tool-bar-item"
      tooltip="新建索引"
      icon-class="folder-add"
    />
  </div>
</template>
<script lang=ts setup name="IndicatorToolBar">
import IconButton from '../../components/IconButton.vue'
import { onButtonsClicked } from '../config'
</script>
<style lang="scss" scoped>
.tool-bar {
  display: flex;
  padding: 0 10px;
  .more:last-child {
    margin-left: auto;
  }
}
</style>

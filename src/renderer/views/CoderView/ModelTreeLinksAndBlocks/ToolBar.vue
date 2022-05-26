<template>
  <div id="tool-bar">
    <icon-button class="tool-bar-item" tooltip="新建模型" icon-class="folder-add" @click="emit('onClickNewModelBlock')" />
    <icon-button
        class="toggle-methods-button tool-bar-item"
        :tooltip="'关联Link'"
        :icon-class="'management'"
        @click="store.commit('relation/updatedIsRelationLink')"
      />
  </div>
</template>
<script lang=ts setup>
import { computed } from 'vue'
import IconButton from '../../components/IconButton.vue'
import { useStore } from 'vuex'
const emit = defineEmits(['onClickNewModelBlock'])
const store = useStore()
</script>
<style lang="scss" scoped>
#tool-bar {
  padding-left: 10px;
}
.tool-bar-item {
  margin-left: 10px;
}
</style>

<template>
  <div id="tool-bar">
    <icon-button class="tool-bar-item" tooltip="新建模型" icon-class="folder-add" @click="$emit('create-model')" />
    <icon-button class="tool-bar-item" tooltip="导入模型" icon-class="download" @click="$emit('import-model')" />
    <icon-button class="tool-bar-item" tooltip="导出模型" icon-class="upload" @click="$emit('export-model')" />
    <icon-button :modelValue="naviButtonState" class="tool-bar-item" :icon-class="naviButtonIconClass"
      :tooltip="naviButtonToolTip" @click="$emit('update:naviButtonState', !naviButtonState)" />
    <!-- <icon-button v-if="displayModelTreeNavi" class="tool-bar-item" icon-class="el-icon-money" @click="updatePanelComponent()" /> -->
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import IconButton from '../../components/IconButton.vue'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapMutations } = createNamespacedHelpers('models/')
export default defineComponent({
  components: { IconButton },
  emits: ['create-model', 'import-model', 'export-model', 'update:naviButtonState'],
  props: {
    naviButtonState: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    ...mapState(['displayModelTreeNavi']),
    naviButtonIconClass(): string {
      return this.naviButtonState ? 'files' : 'guide'
    },
    naviButtonToolTip(): string {
      return this.naviButtonState ? '切换至Mask导航' : '切换至模型树导航'
    }
  },
  methods: {
    ...mapMutations([
      'updatePanelComponent'
    ])
  }
})
</script>
<style lang="scss" scoped>
#tool-bar {
  padding-left: 10px;
}
.tool-bar-item {
  margin-left: 10px;
}
</style>

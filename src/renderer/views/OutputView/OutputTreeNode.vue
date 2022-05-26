<template>
  <div class="otn-node"
    @mouseover="showFresh=true"
    @mouseleave="showFresh=false"
  >
    <el-icon class="icon"><document /></el-icon>
    <span>{{node.label}} </span>
    <span class="otn-ocuppy-space" />
    <el-icon v-show="showFresh && !node.data.isLeaf" class="icon" @click="freshClick"><refres /></el-icon>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    node: {
      type: Object,
      require: true
    },
    freshFunc: {
      type: Function,
      require: true
    }
  },
  data() {
    return {
      showFresh: false
    }
  },
  methods: {
    freshClick(event) {
      event.stopPropagation()
      this.freshFunc(this.node)
    }
  }
})
</script>
<style lang="scss" scoped>
.otn-node{
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  .otn-ocuppy-space {
    flex: 1
  }
}
</style>

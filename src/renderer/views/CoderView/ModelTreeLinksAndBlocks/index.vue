<template>
  <component ref="componentRef" class="lanks-blocks-com-box" :is="activeName"></component>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import LinkView from './LinkView.vue'
import BlockView from './BlockView.vue'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('relation/')
export default defineComponent({
  components: { LinkView, BlockView },
  computed: {
    ...mapState(['isRelationLink']),
    activeName() {
      return this.isRelationLink ? 'LinkView' : 'BlockView'
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../scss/linkandblock.scss';
</style>

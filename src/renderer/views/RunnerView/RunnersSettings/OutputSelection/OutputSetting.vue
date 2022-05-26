<script lang="ts">
import ImportOutputPreview from '@/views/OutputView/index.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'BlockView',
  extends: ImportOutputPreview
})
</script>
<style lang="scss" scoped>
.output-view {
  overflow: hidden;
  width: 100%;
  height: 100%;
  .coder-panes {
    width: 100%;
    height: 100%;
  }
}
#navigator {
  border-right: 1px solid var(--nova-border-color);
  height: 100%;
  background: #f4f9fd;
}
.output-panes {
  height: calc(100% - 63px);
}
.out-box {
  &:deep(.el-collapse-item__header) {
    background: #cce9ff;
  }
}
</style>

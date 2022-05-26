
<script lang="ts">
import ModelTreeLinksAndBlocks from '@/views/CoderView/ModelTreeLinksAndBlocks/index.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  extends: ModelTreeLinksAndBlocks
})
</script>
<style lang="scss" scoped>
@import '@/views/CoderView/scss/linkandblock.scss';
</style>
<style lang="scss">
  .lanks-blocks-com-box{
    height: calc(100% - 108px);
    .navi-tree{
      height: 100%;
    }
  }
  .top-box{
    .create-links-button{
      margin: -10px 0 0 10px;
    }
  }
</style>

<template>
  <div id="project-code">
    <project-code-edit />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import ProjectCodeEdit from './ProjectCodeEdit.vue'
export default defineComponent({
  components: { ProjectCodeEdit }

})
</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";
#project-code {
  height: 100%;
  padding: 10px;
  #header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    span {
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
}
</style>

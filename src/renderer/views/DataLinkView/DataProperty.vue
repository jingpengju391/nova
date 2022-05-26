<template>
  <div id = "dataLink-property">
    <div id = "header">
      <span>数据链接属性</span>
      <icon-button
        icon-class="document-add"
        tooltip="创建链接"
        @click ="onCreateLink"
      />
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";
#dataLink-property{
  height: 100%;
  border-left: 1px solid var(--nova-border-color);
  padding: 10px;
  #header{
    display: flex;
    justify-content: space-between;
    align-content: center;
    span{
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
}
</style>

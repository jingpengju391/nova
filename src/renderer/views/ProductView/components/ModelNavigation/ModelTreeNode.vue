<template>
  <div class="tree-node">
    <span class="text-node">
      <el-icon class="icon"><document /></el-icon>
      {{data.name}}
    </span>
    <template v-if="getMasterNavigationNodeIdAndType(data.id).type === type">
      <icon-button
        class="tool-sets"
        v-for="(button, index) in buttons"
        :key="index"
        :tooltip="button.tooltip"
        @click.stop="button.click(data)"
        :icon-class="button.iconClass"
      />
    </template>
  </div>
</template>
<script lang=ts setup name="ModelTreeNode">
import { IconButton } from '@/views/components'
import { SimplifiedProduct } from '@shared/dataModelTypes/product/products'
import { ElTree } from 'element-plus'
import { addNewProduct, openProductDialog, copyMaster } from '../../config'
import { getMasterNavigationNodeIdAndType, MasterNodeType } from '@/utils'
interface treeNode{
  node: typeof ElTree,
  data: SimplifiedProduct
}
const props = defineProps<treeNode>()

const type = MasterNodeType.master

const buttons = [
  {
    tooltip: '添加porduct',
    iconClass: 'document-add',
    click: (data) => {
      addNewProduct(data)
      openProductDialog()
    }
  },
  {
    tooltip: '复制master',
    iconClass: 'document-copy',
    click: (node) => copyMaster(node.id)
  }
]
</script>
<style lang="scss" scope>
@import '../../scss/master-tree-node.scss';
</style>

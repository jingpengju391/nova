<template>
  <el-dialog title="导出模型" v-model="visible" destroy-on-close>
    <el-tree
      :data="gettersModelNavigationTree"
      :props="defaultProps"
      default-expand-all
      show-checkbox
      node-key="id"
      :default-checked-keys="defaultCheckedKeys"
      ref="toExportModelTree"
    />
    <template #footer>
      <span>
        <el-button style="margin-right: 8px" @click="visible = false"
          >取 消</el-button
        >
        <el-checkbox
          style="margin-right: 8px"
          v-model="checkAllToExport"
          label="全 选"
          border
        />
        <el-button
          style="margin-right: 8px"
          type="primary"
          @click="confirmExportModel"
          >导 出</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { useModelsAPIs } from '../../../hooks/apis'
import { getDefaultCheckedKeys } from './utils'
import { ElTree } from 'element-plus'

const { mapGetters, mapState } = createNamespacedHelpers('models/')

export default defineComponent({
  emits: ['close'],
  data() {
    return {
      visible: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      checkAllToExport: true
    }
  },
  computed: {
    ...mapGetters(['gettersModelNavigationTree']),
    ...mapState(['models']),
    defaultCheckedKeys(): (number | string)[] {
      return getDefaultCheckedKeys(this.gettersModelNavigationTree)
    }
  },
  watch: {
    checkAllToExport(value: boolean) {
      const keys: (number | string)[] = value ? this.defaultCheckedKeys : [];
      (this.$refs.toExportModelTree as InstanceType<typeof ElTree>).setCheckedKeys(keys, false)
    }
  },
  methods: {
    async confirmExportModel() {
      try {
        const { canceled, filePath } = await useModelsAPIs().export()
        if (canceled) return
        this.visible = false
        const allSelectedIds = (this.$refs.toExportModelTree as InstanceType<typeof ElTree>).getCheckedKeys(false) as number[]
        // transform modelTree to model block array for export
        // TODO: add selected export
        await useModelsAPIs().writeModelJSONFileToDisk(filePath!, allSelectedIds)
      } catch (err) {
        this.$message.error(`出错了，${err.message}`)
      }
    }
  }
})
</script>

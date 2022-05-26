<template>
  <div class="preview-box">
    <h4 id="side-content-title">数据预览</h4>
    <div v-if="currentRunner.inputId || currentRunner.blockInputId?.length">
      <div class="input-preview-item">
        <span class="label">名称: </span>
        <span class="value">{{selectedInput?.value?.name || ''}}</span>
      </div>
      <div class="input-preview-item">
        <el-table
          v-if="previewTableData.value && previewTableData.value.length"
          class="value"
          :data="previewTableData.value"
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
        >
          <el-table-column
            v-for="(columnHeader, index) in previewTableHeaders.value"
            :key="index"
            :label="columnHeader"
            :prop="columnHeader"
          />
        </el-table>
        <el-empty v-else class="empty-box"/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="DataPreview">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { selectedInput, previewTableData, previewTableHeaders } from './data-preview'
import { Runner } from '@shared/runs/runners'
const store = useStore()
const currentRunner = computed<Runner>(() => store.getters['runs/currentRunner'])
</script>
<style lang="scss" scoped>
.preview-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  .input-preview-item {
    margin-bottom: 20px;
  }
}
</style>

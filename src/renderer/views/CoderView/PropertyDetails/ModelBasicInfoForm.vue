<template>
  <el-form
    ref="form"
    :rules="formRules"
    :model="currentModelNode"
    @submit.prevent
  >
    <el-form-item label="名称" prop="name">
      <!-- auto focus the name input when this is a new model -->
      <el-input
        v-if="currentModelNode.id === 0"
        v-focus
        v-model="currentModelNode.name"
        placeholder="请输入模型名称"
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentModelNode.name"
        placeholder="请输入模型名称"
        maxlength="inputNameLength"
      />
    </el-form-item>
    <el-form-item label="入口模块">
      <root-block-selector v-model="currentModelNode.rootBlockId" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input
        type="textarea"
        :rows="3"
        v-model="currentModelNode.description"
        maxlength="inputTextLength"
      />
    </el-form-item>
    <el-form-item label="标签">
      <tags-input v-model="currentModelNode.tags" />
    </el-form-item>
    <el-form-item label="是否表单对齐">
      <el-switch v-model="currentModelNode.isDateCenter" />
    </el-form-item>
    <el-form-item label="对齐类型" v-if="currentModelNode.isDateCenter">
      <el-select
        v-model="currentModelNode.dateAlignType"
        class="m-2"
        placeholder="Select"
      >
        <el-option
          v-for="item in dataTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { modelNodeMixin } from './mixins'
import RootBlockSelector from '../../components/RootBlockSelector.vue'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'

export default defineComponent({
  components: { RootBlockSelector },
  mixins: [modelNodeMixin]
})
</script>

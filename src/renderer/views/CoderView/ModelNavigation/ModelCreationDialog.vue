<template>
  <el-dialog v-model="visible" title="新建模型">
    <el-form :model="form" label-width="80px">
      <el-form-item label="模型名称" required >
        <el-input v-model="form.name" autocomplete="off" v-focus/>
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" :rows="4" v-model="form.description" autocomplete="off" />
      </el-form-item>
      <el-form-item label="标签名称">
        <tags-input v-model="form.tags" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="visible = false">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TagsInput from '../../components/TagsInput.vue'

export default defineComponent({
  components: { TagsInput },
  data() {
    return {
      visible: false,
      form: {
        name: '',
        description: '',
        tags: []
      }
    }
  }
})
</script>

<template>
  <div>
    <el-tag
      class="tag"
      v-for="tag in modelValue"
      :key="tag"
      closable
      :disable-transitions="true"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      class="input-new-tag"
      v-if="inputVisible"
      v-model="inputValue"
      ref="saveTagInput"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    >
    </el-input>
    <el-button size="small" v-else class="button-new-tag" @click="showInput"  :disabled="$route.path === '/product'"
      >+ 新增标签</el-button
    >
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ElInput, ElMessage } from 'element-plus'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapMutations } = createNamespacedHelpers('models/')

export default defineComponent({
  emits: [('update:modelValue' as string)],
  props: {
    modelValue: {
      type: Array as PropType<Array<string>>,
      required: true
    }
  },
  data() {
    return {
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
    ...mapState(['displayModelTreeNavi'])
  },
  methods: {
    handleClose(tag: string) {
      const tags = [...this.modelValue]
      tags.splice(tags.indexOf(tag), 1)
      this.$emit('update:modelValue', tags)
    },
    showInput() {
      // if (this.displayModelTreeNavi) {
      //   ElMessage({
      //     message: '此功能暂时被禁用',
      //     type: 'warning'
      //   })
      //   return true
      // }

      this.inputVisible = true
      this.$nextTick(() => {
        ((this.$refs.saveTagInput as InstanceType<typeof ElInput>).$refs.input as HTMLInputElement).focus()
      })
    },
    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        const tags = [...this.modelValue]
        tags.push(inputValue)
        this.$emit('update:modelValue', tags)
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  }
})
</script>

<style lang="scss" scoped>
.tag {
  margin: 0 10px 10px 0;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-bottom: 10px;
  vertical-align: bottom;
}
</style>

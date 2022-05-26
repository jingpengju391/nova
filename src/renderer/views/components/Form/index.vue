<template>
  <el-form
    ref="ruleFormDom"
    :model="form"
    :label-width="lw"
    :rules="rules"
    class="demo-ruleForm"
    :inline="props.inline"
    @submit.prevent
  >
    <el-form-item
      v-for="item in formData"
      :key="item.ref"
      :label="item.label"
      :prop="item.ref"
    >
      <component
        v-if="item.customComporent"
        :is="item.customComporent"
      ></component>
      <el-input
        v-if="item.type == 'input' && !item.customComporent"
        v-model="form[item.ref]"
        autocomplete="off"
        :type="item.inputType"
        :rows="item.rows"
        :placeholder="`请输入${item.label}`"
        @input="linkageData(item)"
        maxlength="inputNameLength"
      ></el-input>

      <el-input-number
        v-if="item.type == 'input-number' && !item.customComporent"
        v-model="form[item.ref]"
        :min="item.min"
        :max="item.max"
        @input="linkageData(item)"
      />

      <el-switch
        v-if="item.type == 'switch' && !item.customComporent"
        v-model="form[item.ref]"
        :size="item.size"
        :active-text="item.activeText"
        :inactive-text="item.inactiveText"
        :active-color="item.activeColor"
        :inactive-color="item.inactiveColor"
        @input="linkageData(item)"
      />

      <el-select
        v-if="item.type == 'select' && !item.customComporent"
        v-model="form[item.ref]"
        :placeholder="`请选择${item.label}`"
        @change="linkageData(item)"
      >
        <el-option
          v-for="iter in item.options"
          :key="iter.value"
          :label="iter.label"
          :value="iter.value"
        >
        </el-option>
      </el-select>
      <el-radio-group
        v-if="item.type == 'radio' && !item.customComporent"
        v-model="form[item.ref]"
        @change="linkageData(item)"
      >
        <el-radio
          v-for="iter in item.options"
          :key="iter.value"
          :label="iter.value"
        >
          {{ iter.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
  <span v-if="false">{{ lw }}</span>
</template>
<script setup lang=ts>
import { reactive, watch, ref, computed } from 'vue'
import type { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
const emit = defineEmits(['hanldeChangeForm'])
const formData: any = reactive([])

const form: any = reactive({})

const rules: any = reactive({})

const props = defineProps({
  formDataSources: {
    type: Array,
    required: true,
    default: () => []
  },
  formSources: {
    type: Object,
    required: true,
    default: () => { }
  },
  lw: {
    type: Number,
    required: false,
    default: () => 100
  },
  inline: {
    type: Boolean,
    required: false,
    default: () => false
  }
})

const lw = computed(() => props.lw)
const initData = () => {
  formData.length = 0
  props.formDataSources.forEach((item: any) => {
    if (!item.iHide) {
      formData.push(item)
      form[item.ref] = !props.formSources[item.ref] && props.formSources[item.ref] !== 0
        ? '' : props.formSources[item.ref]
      const p = item.type === 'input' ? '请输入' : '请选择'
      const ruleBase = {
        required: item.required,
        message: `${p}${item.label}`,
        trigger: item.trigger || 'blur'
      }
      rules[item.ref] = item.rules ? [ruleBase, ...item.rules] : [ruleBase]
    }
  })
  for (const i in props.formSources) {
    form[i] = props.formSources[i]
  }
}

const ruleFormDom = ref<null | HTMLElementAny>(null)

const validateFn = (callback: any) => {
  ruleFormDom?.value && ruleFormDom.value.validate((valid: boolean) => {
    valid && callback()
  })
}

const resetForm = () => {
  for (const i in form) {
    form[i] = ''
  }
}

const linkageData = (node: any) => {
  node.change && node.change(form, validateFn)
}

initData()

watch(() => props.formSources, (newValue, oldValue) => initData(), { deep: true })

// watch(form, (newValue, oldValue) => {
//   emit('hanldeChangeForm', newValue)
// }, { deep: true })

defineExpose({ validateFn, form, resetForm })
</script>

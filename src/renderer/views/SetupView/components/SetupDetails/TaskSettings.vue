<template>
  <div class="scroll-item" ref="refTask">
    <h3>任务设置</h3>
    <task-setting-form
      :formDataSources="formDataSources"
      :formSources="currentDetailNodeTask"
      inline
      :lw="300"
    />
  </div>
</template>

<script setup lang="ts" name="setup">
import { Form as TaskSettingForm } from '@/views/components'
import { computed, ref, onMounted, nextTick } from 'vue'
import { arrNode } from '../../config/setupNavi'
import { useStore } from 'vuex'
const store = useStore()
const { formDataSources } = defineProps<{ formDataSources: any }>()
const currentDetailNodeTask = computed(() => store.state.settings.taskSettingsData)

const refTask = ref<HTMLElement | null>(null)
onMounted(() => nextTick(() => refTask.value && arrNode.push(refTask.value)))
</script>

<style lang=scss scoped>
@import "../../scss/common.scss";
</style>

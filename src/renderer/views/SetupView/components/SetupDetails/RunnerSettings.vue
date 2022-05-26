<template>
  <div class="scroll-item" ref="refRun">
    <h3>运行设置</h3>
    <runner-settings-form
      v-if="currentDetailNodeRunner"
      :formDataSources="formDataSources"
      :formSources="currentDetailNodeRunner"
      inline
      :lw="300"
    >
    </runner-settings-form>
  </div>
</template>

<script setup lang="ts" name="setup">
import { computed, ref, onMounted, nextTick } from 'vue'
import { Form as RunnerSettingsForm } from '@/views/components'
import { useStore } from 'vuex'
import { arrNode } from '../../config/setupNavi'
const store = useStore()
const currentDetailNodeRunner = computed(() => store.state.settings.runnerSettingsData)
const { formDataSources } = defineProps<{ formDataSources: any }>()

const refRun = ref<HTMLElement | null>(null)
onMounted(() => nextTick(() => refRun.value && arrNode.push(refRun.value)))

</script>

<style lang=scss scoped>
@import "../../scss/common.scss";
</style>

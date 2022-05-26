<template>
  <div class="scroll-item" ref="refSoft">
    <h3>软件设置</h3>
    <software-settings-form
      v-if="currentMasterNode"
      :formDataSources="formDataSources"
      :formSources="currentMasterNode"
      inline
      :lw="300"
    ></software-settings-form>
  </div>
</template>
<script setup lang="ts" name="setup">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { Form as SoftwareSettingsForm } from '@/views/components'
import { arrNode } from '../../config/setupNavi'
const { formDataSources } = defineProps<{ formDataSources: any }>()
const store = useStore()
const currentMasterNode = computed(() => store.state.settings.softwareSettingsData)

const refSoft = ref<HTMLElement | null>(null)
onMounted(() => nextTick(() => refSoft.value && arrNode.push(refSoft.value)))

</script>

<style lang="scss" scope>
@import "../../scss/common.scss";
</style>

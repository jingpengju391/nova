<template>
  <div class="feedLine" v-for='(item, index) in printLines' :key='index'>
    {{item}}
  </div>
</template>
<script setup lang="ts" name="Console">
import { relative } from 'path'
import { computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const printLines = computed(() => store.getters['assumptionVar/gettersPrintLines'])
</script>

<template>
  <div class="indicator-library">
    <indicator-classify />
    <indicator-details />
  </div>
</template>
<script setup lang=ts name="IndicatorLibrary">
import { ref, onMounted } from 'vue'
import IndicatorClassify from './IndicatorClassify.vue'
import IndicatorDetails from './IndicatorDetails.vue'
</script>
<style lang="scss" scope>
@import "../../scss/indicator-library.scss";
</style>

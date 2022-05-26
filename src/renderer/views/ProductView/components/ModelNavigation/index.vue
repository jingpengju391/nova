<template>
  <div class="model-navigation">
    <tool-bar :toolButtons="modelButtons" />
    <filter-text v-show="modelSearch" />
    <navigation />
  </div>
</template>

<script lang="ts" setup name="ModelNavigation">
import ToolBar from '../ToolBar.vue'
import FilterText from './FilterText.vue'
import Navigation from './Navigation.vue'
import { modelButtons, modelSearch } from '../../config'
</script>
<style lang="scss" scoped>
@import "../../scss/product-navigation.scss";
</style>

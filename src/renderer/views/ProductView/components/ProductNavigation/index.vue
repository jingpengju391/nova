<template>
  <div class="product-navigation">
    <tool-bar :toolButtons="toolButtons" />
    <filter-text v-show="productSearch" />
    <navigation />
  </div>
</template>

<script lang="ts" setup name="ProductNavigation">
import ToolBar from '../ToolBar.vue'
import FilterText from './FilterText.vue'
import Navigation from './Navigation.vue'
import { toolButtons, productSearch } from '../../config'
</script>
<style lang="scss" scoped>
@import "../../scss/product-navigation.scss";
</style>

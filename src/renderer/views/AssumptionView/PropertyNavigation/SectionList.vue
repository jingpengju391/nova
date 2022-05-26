<template>
  <div>
    <span>变量名称</span>
    <span>(默认)</span>
  </div>
  <div v-for="item in S" :key="item.value" @click="handleSectionCheck(item)">
    <em :class="item.status ? 'check' : ''">{{item.label}}</em>
    <el-icon v-if="item.status"><check /></el-icon>
  </div>
</template>
<script setup lang="ts" name="SectionList">
import { useStore } from 'vuex'
import { AssumptionVariable, AssumptionSection } from '@shared/dataModelTypes/assumptions'
const store = useStore()
const S:AssumptionSection[] = store.getters['assumptionVar/section']
const handleSectionCheck = (currSection:AssumptionVariable) => {
  currSection.status = !currSection.status
  store.dispatch('assumptionVar/updateSectionInputsWithDBSync', currSection)
}
</script>
<style lang="scss" scoped>
div{
  display: flex;
  width: 100%;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  span{
    color: #1989FA;
  }
  em{
    font-style: normal;
    color: #5A5E66;
  }
  em.check{
    color: #1989FA;
  }
  i{
    color: #1989FA;
    font-weight: 500;
  }
}
</style>

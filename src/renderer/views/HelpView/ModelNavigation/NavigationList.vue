<template>
  <div class="help-nav-list-box">
    <ul>
      <li
        v-for="list in navlistData"
        :key="list.id"
        :class="list.curSelect ? 'active' : ''"
        @click="SelectCurNav(list.id)"
      >
        {{ list.name }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts" name="NavigationList">
import { reactive, watch, ref, onMounted } from 'vue'
import { useStore, createNamespacedHelpers } from 'vuex'
const store = useStore()
const props = defineProps<{ listData: any[], dataType: string }>()
const navlistData = reactive([])
const handeldataType = reactive(props.listData.type)
const emit = defineEmits(['hanldeChangeCurList'])

const loadData = () => {
  navlistData.splice(0, navlistData.length)
  props.listData.map((item) => {
    if (item.type === props.dataType) {
      navlistData.push(item)
    }
  })
}
const SelectCurNav = (id) => {
  const curObj = {
    id: id,
    type: props.dataType
  }
  store.commit('helps/addNavSerchList', curObj)
  emit('hanldeChangeCurList', curObj)
}
onMounted(() => {
  loadData()
})
watch(props, (newValue) => {
  loadData()
})
</script>
<style lang="scss" scoped>
.help-nav-list-box {
  height: 100%;

  height: 100%;

  background: #f4f9fd;
  ul {
    width: 100%;
    list-style: none;
    padding: 0;
    li {
      cursor: pointer;
      width: 100%;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      padding: 0 20px;
      color: rgba(0, 0, 0, 0.65);
    }
    li.active {
      color: #1989fa;
      font-weight: 600;
    }
    li:hover {
      background: #cce9ff;
      box-shadow: 0px 0px 0px #a8c5da;
    }
  }
}
</style>

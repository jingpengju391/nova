<template>
  <div class="work-navigation" v-for="item in navigation.arr" :key="item.value">
    <span ref="toplist" :class="item.scrollTop ? 'active' : ''" @click="handleCurrClick(item)">
      <em>{{item.label}}</em>
      <el-icon ><component :is="item.height ? 'arrow-down' : 'arrow-up'"/></el-icon>
    </span>
    <aside :style="{'height':item.height}">
      <div :style="{ 'height': scrollbarHeight }">
        <el-scrollbar :height="scrollbarHeight" @scroll="handleScroll(item)">
          <slot
            :ref="item.slotName"
            :name="item.slotName">
          </slot>
        </el-scrollbar>
      </div>
    </aside>
  </div>
</template>
<script setup lang=ts name="worknavigation">
import { PropType, ref, reactive, onMounted, nextTick } from 'vue'
import { ContextWorBarProps } from './types'
import { useStore } from 'vuex'
const store = useStore()
const props = defineProps({
  workbar: {
    type: Array as PropType<ContextWorBarProps[]>,
    required: true
  },
  hanldeChangeGetH: {
    type: Function,
    require: true
  }
})
const scrollbarHeight = ref('')
const emit = defineEmits(['hanldeChangeGetH'])
const toplist = ref<null | HTMLElement>(null)
const navigation:any = reactive({
  arr: []
})
const handleCurrClick = (currItem:any):void => {
  currItem.scrollTop = 0
  store.commit('navigation/setCurrentNavigation', {})
  navigation.arr.forEach((item:any) => {
    item.height = currItem.value === item.value && !item.height ? scrollbarHeight.value : 0
    currItem.value === item.value && item.height && store.commit('navigation/setCurrentNavigation', currItem)
  })
}

const calcHeight = (callback:any) => {
  // todo 48应该替换为动态确定
  const HT = toplist.value ? (toplist.value.offsetHeight ? toplist.value.offsetHeight : 48) : 48
  const HC = document.documentElement.clientHeight
  const LE = navigation.arr.length
  const HS = HC - HT * LE - 70 - 5 * (LE - 1) + 'px'
  const HS1 = HC - HT * LE - 70 - 5 * (LE - 1)
  scrollbarHeight.value = HS
  emit('hanldeChangeGetH', HS1)
  callback && callback()
}

function handleScroll(item:any) {
  return (e:any) => {
    item.scrollTop = e.scrollTop
  }
}

onMounted(() => {
  navigation.arr = JSON.parse(JSON.stringify(props.workbar))
  nextTick(() => calcHeight(() => handleCurrClick(navigation.arr[0])))
})

window.addEventListener('resize', () => {
  // 防抖处理
  setTimeout(function() {
    calcHeight(() => {
      navigation.arr.forEach((item:any) => {
        item.height = item.height ? scrollbarHeight.value : 0
      })
    })
  }, 300)
})

</script>
<style lang="scss" scoped>
@import './index.scss';
</style>

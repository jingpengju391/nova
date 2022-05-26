<template>
  <div class="updown-input">
    <div class="icon">
      <el-icon @click="upType()"><caret-top /></el-icon>
      <el-icon @click="downType()"><caret-bottom /></el-icon>
    </div>
    <el-input v-model="cur[curType]" placeholder="" disabled />
  </div>
</template>

<script lang="ts" >
import { defineComponent, onMounted, reactive, ref, getCurrentInstance, watch } from 'vue'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
export default defineComponent({
  props: {
    list: {
      type: Array
    },
    curData: {
      type: Object
    },
    fieldType: {
      type: String
    }
  },
  setup(props, { emit }) {
    const cur = reactive(props.curData)
    const curType = ref(props.fieldType)
    const curList = reactive(props.list)
    const upType = () => {
      console.log(cur)
      const len = curList.length
      var curIn: Number = 0
      for (let i = 0; i < curList.length; i++) {
        if (curList[i].label === cur[curType.value]) {
          curIn = i
        }
      }
      if (curIn === 0) {
        cur[curType.value] = curList[len - 1].label
      } else {
        var cIn = curIn - 1
        // eslint-disable-next-line vue/no-mutating-props
        cur[curType.value] = curList[cIn].label
      }
      emit('handleInputChange', cur)
    }
    const downType = () => {
      const len = curList.length
      var curIn: Number = 0
      for (let i = 0; i < curList.length; i++) {
        if (curList[i].label === cur[curType.value]) {
          curIn = i
        }
      }
      if (curIn === len - 1) {
        cur[curType.value] = curList[0].label
      } else {
        var cIn = curIn + 1
        cur[curType.value] = curList[cIn].label
      }
      emit('handleInputChange', cur)
    }
    onMounted(() => {
      console.log(cur[curType.value])
      console.log(curType)
    })
    return {
      cur,
      upType,
      downType,
      curType,
      curList
    }
  }
})
</script>

<style lang="scss">
.updown-input {
  width: 100%;
  position: relative;
  .icon {
    position: absolute;
    right: 5px;
    top: 3px;
    width: 15px;
    height: 26px;
    display: flex;
    flex-wrap: wrap;
    z-index: 99;
    align-items: center;
    i {
      font-size: 12px;
      cursor: pointer;
    }
  }
}
</style>

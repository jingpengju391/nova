<template>
  <div class="doc-details-box" ref="docBox">
    <div class="serach-box" v-show="filterBoxShow">
      <el-input
        class="filter-input"
        placeholder="搜索内容"
        @input="filterTextChange"
        v-model="filterText"
        maxlength="inputTextLength"
      />
      {{ curSerchNum }}/{{ totalSerchNum }} |
      <el-icon @click="prevSerach"><arrow-up /></el-icon>
      <el-icon @click="nextSerach"><arrow-down /></el-icon>
      <el-icon @click="CloseSerach"><close /></el-icon>
    </div>

    <el-empty v-if="isEmpty" style="height: 100%" />
    <div v-else>
      <!-- <v-md-editor
        v-model="text"
        @change="updateDoc"
        height="400px"
      ></v-md-editor> -->
      <v-md-preview
        width="100%"
        height="400px"
        ref="preview"
        :text="text"
      ></v-md-preview>
    </div>
  </div>
</template>

<script setup lang=ts name="docDetails" >
import { filter } from 'lodash'
import { reactive, watch, ref, onMounted, nextTick } from 'vue'
import { useStore, createNamespacedHelpers } from 'vuex'
import { useHelpsAPIs, useDataInputsAPIs } from '../../../hooks/apis'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
const props = defineProps<{ curList: {} }>()
const curData: any = reactive({})
const isEmpty = ref(true)
const text = ref('')
const textResult = ref('')
const filterText = ref('')
const docBox = ref('')
const filterBoxShow = ref(false)
const curSerchNum = ref(0)
const totalSerchNum = ref(0)
const preview = ref('preview')
const loadData = async (src) => {
  // console.log(readImgs)
  useHelpsAPIs().readDocFile(src.absolutePath).then(async (result) => {
    // console.log(result.split('\n'))
    // console.log(src)
    // console.log(result)
    const newResult = await replaceImgSrc(src, result)
    text.value = newResult
    textResult.value = newResult
  })
}
const replaceImgSrc = async (src, data) => {
  const basePath = '/' + src.absolutePath.replace(src.name, '').replace(/\\/g, '/')
  console.log(basePath)
  let newdataArr = []
  let reData = data.split('\n')
  console.log(reData)
  reData.map((item: any, index) => {
    if (item.indexOf('![Image]') > -1) {
      console.log(index)
      item.replace('./', 'basePath')
      newdataArr.push(item.replace('./', basePath))
    } else {
      newdataArr.push(item)
    }
  })
  console.log(newdataArr)
  return newdataArr.join('\n')
}
const BuriedPointReport = (title) => {
  console.log({ userId: 1, title: title })
  // setTimer(3000)
  // let
}
const filterTextChange = (filters) => {
  curSerchNum.value = 0
  text.value = textResult.value
  text.value = brightenKeyword(text.value, filters)
  nextTick(() => {
    const allSerachTags = document.getElementsByTagName('font')
    totalSerchNum.value = allSerachTags.length
    if (allSerachTags.length === 0) return false
    document.getElementsByTagName('font')[0].style.background = '#e6a23c'
  })
}
const nextSerach = () => {
  curSerchNum.value++
  if (curSerchNum.value < totalSerchNum.value) {
    document.getElementsByTagName('font')[curSerchNum.value - 1].style.background = 'yellow'
    document.getElementsByTagName('font')[curSerchNum.value].style.background = '#e6a23c'
  } else {
    curSerchNum.value = 0
    document.getElementsByTagName('font')[totalSerchNum.value - 1].style.background = 'yellow'
    document.getElementsByTagName('font')[0].style.background = '#e6a23c'
  }
  // nextTick(() => {
  //   document.documentElement.scrollTop = 1300
  // })
}
const prevSerach = () => {
  if (curSerchNum.value >= 1) {
    curSerchNum.value--
  }
  document.getElementsByTagName('font')[curSerchNum.value + 1].style.background = 'yellow'
  document.getElementsByTagName('font')[curSerchNum.value].style.background = '#e6a23c'
}

const CloseSerach = () => {
  filterBoxShow.value = false
  curSerchNum.value = 0
  totalSerchNum.value = 0
  filterText.value = ''
  text.value = textResult.value
}
const brightenKeyword = (val, keyword) => {
  if (keyword.length > 0) {
    if (val.indexOf(keyword) !== -1 && keyword !== '') {
      val = val.replace(
        new RegExp(keyword, 'g'),
        '<font style="background: yellow">' + keyword + '</font>'
      )
    }
    // })
    return val
  } else {
    return val
  }
}
let conutTimer: number = 0
const setTimer = (timers) => {
  const time = setTimeout(() => {
    BuriedPointReport('timer' + timers)
    clearTimeout(time)
  }, timers)
  clearTimeout(time)
}

onMounted(() => {
  // console.log(textResult)
  let ctrlDown = 0
  document.onkeydown = function (e) {
    let key = window.event.keyCode
    if (key === 70 && event.ctrlKey && !event.shiftKey) {
      window.event.preventDefault()
      filterBoxShow.value = true
    }
    if (key === 70 && event.ctrlKey && event.shiftKey) {
      window.event.preventDefault()
    }
  }
})
watch(props, (newValue) => {
  docBox.value.scrollTop = 0
  if (!newValue) {
    isEmpty.value = true
  } else {
    isEmpty.value = false

    if (newValue.curList.value.isFile) {
      console.log(newValue.curList.value)
      loadData(newValue.curList.value)
      BuriedPointReport(newValue.curList.value.name)
    } else {
      isEmpty.value = true

      for (let i = 0; i < newValue.curList.value.children.length; i++) {
        if (newValue.curList.value.children[i].isFile) {
          // newValue.curList.value.isCurrent = false
          loadData(newValue.curList.value.children[i].absolutePath)
          BuriedPointReport(newValue.curList.value.children[i].name)
          isEmpty.value = false
          break
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "./index.scss";
.serach-box {
  width: 300px;
  height: 40px;
  position: fixed;
  right: 50px;
  top: 50px;
  font-size: 12px;
  color: #606266;
  background: #ffffff;

  border: 1px solid #eeeeee;
  border-radius: 5px;
  display: flex;
  align-items: center;
  &:deep(.el-input) {
    width: 65%;
    font-size: 12px;
    color: #606266;
  }
  &:deep(.el-input__inner) {
    border: none;
    color: #606266;
  }
  i {
    padding: 0 5px;
    cursor: pointer;
  }
}
</style>

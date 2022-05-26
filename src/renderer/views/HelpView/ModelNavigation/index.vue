<template>
  <div class="model-box">
    <div class="refresh-box" @click="loadData">
      <el-icon><refresh-left /></el-icon>
      刷新
    </div>
    <!-- <el-input
      class="filter-input"
      prefix-icon="search"
      placeholder="查询帮助"
      v-model="filterText"
    /> -->
    <el-autocomplete
      v-model="state"
      :fetch-suggestions="querySearchAsync"
      placeholder="查询帮助"
      @select="handleSelect"
      prefix-icon="search"
    >
      <template #default="{ item }">
        <div class="value">{{ item.label }}</div>
        <!-- <span class="link">{{ item.link }}</span> -->
      </template>
    </el-autocomplete>
    <NavigationTree
      :treeData="basePath"
      @hanldeChangeCurList="hanldeChangeCurList"
    />
    <!-- <el-collapse v-model="activeName" accordion ref="collaps">
      <el-collapse-item
        v-for="item in ModelNavigationWorkBar"
        :key="item.id"
        :title="item.name"
        :name="item.id"
        @click="cur(item)"
        height="250px"
      >
        <NavigationTree
          :treeData="item"
          @hanldeChangeCurList="hanldeChangeCurList"
        />
      </el-collapse-item>
    </el-collapse> -->
  </div>
</template>
<script setup lang=ts name="ModelNavigation">
import { reactive, watch, ref, onMounted } from 'vue'
import { useStore, createNamespacedHelpers } from 'vuex'
import { Calendar, Search, Refresh, RefreshLeft } from '@element-plus/icons-vue'
import { WorkNavigation } from '@/views/components'
import NavigationList from './NavigationList.vue'
import NavigationTree from './NavigationTree.vue'
import { useHelpsAPIs } from '../../../hooks/apis'
import { TreeDataType } from '../types'
import { filter } from 'lodash'
import { ElMessage } from 'element-plus'
const store = useStore()

const { mapState, mapMutations, mapGetters, mapActions } = createNamespacedHelpers('helps/')
const navlist = reactive(store.state.helps.navLists)
const activeName = ref('0')
const ModelNavigationWorkBar = reactive([] as TreeDataType[])
const indexArr = reactive([])
const filterText = ref('')
const state = ref('')
const basePath = ref('')
const newArr1 = []
const ModelNavigationWorkBarList: TreeDataType[] = []
const resetNav = async () => {
  ModelNavigationWorkBar.splice(0, ModelNavigationWorkBar.length)
  newArr1.map(item => {
    ModelNavigationWorkBar.push(ModelNavigationWorkBarList.filter(filters => filters.name === item.trim())[0])
  })
  // ModelNavigationWorkBar.value.filter(filters => { })
}
const cur = (data) => {
  console.log(data)
  // emit('hanldeChangecurListButton', data)
}

const links = ref([])
const loadAll = () => {
  return [] as TreeDataType[]
}

let timeout
const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  const results = queryString
    ? navlist.filter(createFilter(queryString))
    : []
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    if (results.length > 0) {
      cb(results)
    } else {
      ElMessage('没有当前搜索内容')
      cb(results)
    }
  }, 1000)
}
const createFilter = (queryString: string) => {
  return (restaurant) => {
    return (
      restaurant.label.toLowerCase().indexOf(queryString.toLowerCase()) !== -1 && restaurant.isFile
    )
  }
}
const handleSelect = (item: TreeDataType) => {
  emit('hanldeChangecurListButton', item)
}

const collaps = ref('')
const loadData = async () => {
  await store.commit('helps/clearAllSerchList')
  newArr1.splice(0, newArr1.length)
  basePath.value = ''
  ModelNavigationWorkBarList.splice(0, ModelNavigationWorkBarList.length)
  await useHelpsAPIs().readHelpdir('').then(async result => {
    basePath.value = result[0].basePath
    await result.map(async item => {
      if (item.isDirectory) {
        ModelNavigationWorkBarList.push(item)
      }
      if (item.name === 'index.md') {
        await useHelpsAPIs().readDocFile(item.absolutePath).then(data => {
          for (let i = 0; i < data.split('\r\n').length; i++) {
            if (data.split('\r\n')[i] !== '') {
              newArr1.push(data.split('\r\n')[i])
            }
          }
          resetNav()
        })
      }
    })
  })
}

onMounted(async () => {
  loadData()

  links.value = loadAll()
})
watch(navlist, (newList) => {
  // useHelpsAPIs().readHelpdir('').then(result => {
  //   console.log(result)
  // })
})
const emit = defineEmits(['hanldeChangecurListButton'])

const hanldeChangeCurList = (node) => {
  emit('hanldeChangecurListButton', node)
}
</script>
<style lang="scss" scoped>
@mixin contentHight($height) {
  // border-radius: $radius;
  height: calc(100vh - $height);
}
.model-box {
  height: 100%;
  padding: 10px;
  border-right: 1px solid #d0d0d0;
  background: #f4f9fd;
  &:deep(.el-collapse-item__content) {
    background: #f4f9fd;
    padding-bottom: 50px;
    // height: calc(100vh - 250px);
    // @include contentHight(250px);
  }
  &:deep(.el-collapse-item__header) {
    background: #cce9ff;
    padding: 0 20px;
  }
  &:deep(.el-autocomplete-suggestion) {
    color: #3b8bff;
  }
  &:deep(.el-autocomplete) {
    margin-bottom: 10px;
    width: 100%;
  }
  .filter-input {
    margin-bottom: 10px;
  }
  .refresh-box {
    font-size: 13px;
    display: flex;
    justify-content: flex-end;
    padding: 10px;
    cursor: pointer;
    align-items: center;
    i {
      font-size: 12px;
      margin-right: 5px;
    }
  }
}
</style>

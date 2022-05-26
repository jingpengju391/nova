<template>
  <div class="search">
    <el-popover placement="bottom-end" trigger="click">
      <template #reference>
        <div class = "iconButton">
          <el-button type="text" class="grid tool-bar-item" icon="grid" />
          <el-button type="text" class="caretBottom tool-bar-item" icon="CaretBottom" />
        </div>
      </template>
      <ul class="filter-list" >
        <filter-search-item v-for="(item,index) in filterSearchItems" @click="onFilterSearchClicked1(index)" :key="item.title" :menuItem="item"/>
      </ul>
    </el-popover>

    <el-input
      class="filter-input"
      prefix-icon="search"
      placeholder="输入关键字过滤"
      @change="filterChange"
      v-model="filterText"
    />
  </div>
</template>

<script lang="ts">
import { log } from 'console'
import { defineComponent, PropType } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import FilterSearchItem from './filterSearchItem.vue'
const { mapState, mapActions, mapMutations } = createNamespacedHelpers('models/')
export default defineComponent({
  components: { FilterSearchItem },
  data() {
    return {
      filterSearchItems: [
        {
          searchProp: 'model',
          title: '模型',
          isDefault: false,
          checked: true
        },
        {
          searchProp: 'mask',
          title: '模块',
          isDefault: false,
          checked: true
        },
        {
          searchProp: 'varaibles',
          title: '变量',
          isDefault: false,
          checked: false
        },
        {
          searchProp: 'Series',
          title: '序列',
          isDefault: false,
          checked: false
        },
        {
          searchProp: 'links',
          title: '链接',
          isDefault: false,
          checked: false
        },
        {
          searchProp: 'methods',
          searchWidth: '',
          title: '方法',
          isDefault: false,
          checked: false
        },
        {
          searchProp: 'indexes',
          title: '索引',
          isDefault: false,
          checked: false
        }
      ],
      filterText: ''
    }
  },
  computed: {
    ...mapState(['modelAndPropertyNavFilterText', 'modelAndPropertyNavFilterSearchItems'])
  },
  methods: {
    ...mapMutations(['changeNavFilterText', 'navFilterSearchItems']),
    onFilterSearchClicked(event) {
      // console.log(event)
      const s = event.target as HTMLElement
      // console.log(s)
      // console.log(s.dataset.title)
      // console.log(s.parentElement.dataset.title)
      // console.log(s.parentElement.parentElement.dataset.title)
      const clickedItemTitle = s.dataset.title ||
        s.parentElement?.dataset.title ||
        s.parentElement?.parentElement?.dataset.title
      // console.log(clickedItemTitle)

      const updatedFilterSearchItems = [...this.filterSearchItems]
      const result = updatedFilterSearchItems.find(item => item.title === clickedItemTitle)
      console.log(result)
      if (result && !result.isDefault) {
        result.checked = !result.checked
      }
    },
    onFilterSearchClicked1(ind) {
      if (this.filterSearchItems[ind].isDefault) return
      this.filterSearchItems[ind].checked = !this.filterSearchItems[ind].checked
      this.navFilterSearchItems(this.filterSearchItems)
    },
    filterChange() {
      console.log(this.filterSearchItems)
      console.log(this.filterText)
      console.log(this.modelAndPropertyNavFilterText)
      this.changeNavFilterText(this.filterText)
    }

  },
  watch: {
    modelAndPropertyNavFilterText: {
      handler(newVal) {
        console.log(newVal)
      },
      deep: true
    }
  }

})
</script>

<style lang="scss" scoped>
.tool-bar-item {
  margin-left: 0px;
}

.filter-list {
  list-style-type: none;
  padding: 6px 0 0 14px;
  box-sizing: border-box;
}

.searchType {

}
.search {
  display: flex;
  padding: 10px 10px;
  border-right: 1px solid #D0D0D0;
  background: #f4f9fd;
 .iconButton{
  display: flex;
  .el-button{
    color: #606266;
    padding: 0;
    min-height: 30px;
    margin: 0;
  }
  .grid{
    font-size: 24px;
  }
 }
}
</style>

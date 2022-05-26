<template>
  <div class="tool-bar">
    <div id="left">
      <!-- <h5 class="title-txt">变量</h5> -->
      <icon-button
        class="create-property-button tool-bar-item"
        tooltip="新建变量/序列/方法/链接"
        icon-class="folder-add"
        @click="onLeftButtonsClicked(true)"
        :disabled="$route.path === '/product'"
      />
      <icon-button
        checkable
        v-if="!isRelation"
        v-model="filters.showVaraibles"
        class="toggle-variables-button tool-bar-item"
        :tooltip="filters.showVaraibles ? '隐藏变量' : '展示变量'"
        icon-class="ticket"
        @click="onLeftButtonsClicked"
      />
      <icon-button
        checkable
        v-if="!isRelation"
        v-model="filters.showSeries"
        class="toggle-series-button tool-bar-item"
        :tooltip="filters.showSeries ? '隐藏序列' : '展示序列'"
        icon-class="comment"
        @click="onLeftButtonsClicked"
      />
      <icon-button
        checkable
        v-if="!isRelation"
        v-model="filters.showLinks"
        class="toggle-links-button tool-bar-item"
        :tooltip="filters.showLinks ? '隐藏链接' : '展示链接'"
        icon-class="share"
        @click="onLeftButtonsClicked"
      />
      <icon-button
        checkable
        v-if="!isRelation"
        v-model="filters.showMethods"
        class="toggle-methods-button tool-bar-item"
        :tooltip="filters.showMethods ? '隐藏方法' : '展示方法'"
        icon-class="menu"
        @click="onLeftButtonsClicked"
      />
      <icon-button
        checkable
        v-if="isRelation"
        :model-value="isRelation"
        class="toggle-methods-button tool-bar-item"
        :tooltip="isRelationLink ? '关联Block' : '关联Link'"
        :icon-class="isRelationLink ? 'share' : 'management'"
        @click="updatedIsRelationLink"
      />
    </div>
    <div id="right" class="right-box">
      <el-tooltip
        class="tool-bar"
        effect="dark"
        :content="propertySearch ? '隐藏搜索' : '显示搜索'"
        placement="bottom"
      >
        <el-icon class="search-icon">
          <search @click="onSearch" />
        </el-icon>
      </el-tooltip>
      <el-popover placement="bottom" :width="200">
        <template #reference>
          <el-button type="text" class="more tool-bar-item" icon="more" />
        </template>
        <ul
          class="filter-list"
          @click.capture.stop.prevent="onFilterMenuClicked"
        >
          <filter-menu-item
            v-for="item in filterMenuItems"
            :key="item.title"
            :menuItem="item"
          />
        </ul>
      </el-popover>
    </div>
  </div>
</template>
<script lang="ts">
import { getModelNavigationNodeIdAndType, getModelNodeType, treeFind } from '@/utils'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { defineComponent, PropType } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import IconButton from '../../components/IconButton.vue'
import FilterMenuItem from './filterMenuItem.vue'
import { ElMessage } from 'element-plus'
const { mapActions: PropertyMapActions, mapState: PropertymapState } = createNamespacedHelpers('models/')
const { mapMutations, mapState } = createNamespacedHelpers('relation/')
export default defineComponent({
  components: { IconButton, FilterMenuItem },
  emits: ['update:filterMenuItems', 'left-buttons-click'],
  props: {
    filterMenuItems: {
      // eslint-disable-next-line no-undef
      type: Array as PropType<FilterMenuItemType[]>,
      required: true
    },
    isRelation: {
      type: Boolean,
      required: false
    },
    propertySearch: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      filters: {
        showVaraibles: true,
        showSeries: true,
        showLinks: true,
        showMethods: true
      }
    }
  },
  computed: {
    ...PropertymapState(['displayModelTreeNavi', 'currentModelNode']),
    ...mapState(['isRelationLink', 'modelNavigationTree'])
  },
  methods: {
    ...mapMutations(['updatedIsRelationLink']),
    onFilterMenuClicked(event: MouseEvent) {
      const t = event.target as HTMLElement
      const clickedItemTitle = t.dataset.title ||
        t.parentElement?.dataset.title ||
        t.parentElement?.parentElement?.dataset.title
      const updatedFilterMenuItems = [...this.filterMenuItems]
      const result = updatedFilterMenuItems.find(item => item.title === clickedItemTitle)
      if (result && !result.isDefault) {
        result.checked = !result.checked
      }
      this.$emit('update:filterMenuItems', updatedFilterMenuItems)
    },
    onLeftButtonsClicked(isCreated: boolean) {
      if (this.isRelation) {
        const typeStr = getModelNodeType(this.currentModelNode)
        const pModelNode = treeFind(this.modelNavigationTree, data => typeStr + NaviNodeIdDelimiter + this.currentModelNode.id === data.id)
        if (!pModelNode.parentNode) {
          ElMessage.warning('目标选择错误！')
          return
        }
        const { type } = getModelNavigationNodeIdAndType(pModelNode.parentNode.id)
        if (ModelNavigationNodeType.models === type) {
          ElMessage.warning('目标选择错误！')
          return
        }
      }
      const type = isCreated === true ? 'CreateProperty' : 'ToggleFilters'
      const filters = isCreated === true ? null : this.filters
      this.$emit('left-buttons-click', { type: type, filters: filters, isRelation: this.isRelation })
    },
    onSearch() {
      this.$emit('on-search')
    }
  }
})
</script>
<style lang="scss" scoped>
.tool-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.tool-bar-item {
  margin-left: 10px;
}

.filter-list {
  list-style-type: none;
  padding: 0;
}
.title-txt {
  display: inline-block;
  margin: 0 5px 0 0;
  font-size: 16px;
  border: 0px;
}
.more {
  font-size: 20px;
  color: #606266;
  padding: 0;
  min-height: 30px;
  &:focus {
    color: #606266;
  }
  &:hover {
    color: #66b1ff;
  }
}
#left {
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  overflow: hidden;
  &:deep(.el-button.is-disabled) {
    background: transparent;
  }
}
.right-box {
  display: flex;
  align-items: center;
  .search-icon {
    font-size: 20px;
  }
}
</style>

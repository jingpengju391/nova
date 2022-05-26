<template>
  <div class="bar-box" ref="barBox">
    <div
      :class="hideReplace ? 'left-box' : 'left-box replace-show'"
      @click="store.commit('globalSearchReplace/updateHideReplace')"
    >
      <el-icon>
        <arrow-right />
      </el-icon>
    </div>
    <div class="right-box">
      <div class="find-part">
        <el-input
          v-model="searchValue"
          placeholder="search"
          @input="onChangeSearchValue"
          @keyup.enter="someContentToFind"
          :maxlength="20"
        />
        <div class="controls">
          <div
            class="monaco-custom-checkbox codicon codicon-case-sensitive"
            :style="{ background: caseSensitive ? '#0090f133' : '' }"
            @click="findRule('updateCaseSensitive')"
          ></div>
          <div
            class="monaco-custom-checkbox codicon codicon-whole-word"
            :style="{ background: matchWhole ? '#0090f133' : '' }"
            @click="findRule('updateMatchWhole')"
          ></div>
          <div
            class="monaco-custom-checkbox codicon codicon-regex"
            :style="{ background: regularExpress ? '#0090f133' : '' }"
            @click="findRule('updateRegularExpress')"
          ></div>
          <span
            class="monaco-custom-checkbox iconfont icon-orbit-full"
            :style="{ background: matchPath ? '#0090f133' : '' }"
            @click="findRule('updateMatchPath')"
          ></span>
          <el-tooltip
            effect="dark"
            content="views and More Action..."
            placement="bottom"
          >
            <div class="more-box">
              <el-popover
              :placement="scc.placement"
              :width="scc.width"
              :trigger="scc.trigger">
                <template #reference>
                  <span class="monaco-custom-checkbox iconfont icon-shuxing"></span>
                </template>
                <control-list />
              </el-popover>
            </div>
          </el-tooltip>
          <div class="monaco-custom-checkbox iconfont" @click="someContentToFind">
            &#xe673;
          </div>
          <el-icon
            :style="{ color: searchRange ? '#409eff' : '',marginLeft:'5px' }"
            @click="findRule('updateSearchRange')">
            <Search />
          </el-icon>
        </div>
      </div>
      <div class="replace-part" v-if="!hideReplace">
        <div class="replace-input">
          <el-input
            :model-value="replaceValue"
            placeholder="replace"
            @input="onChangeReplaceValue"
          />
          <div class="controls">
            <div
              class="monaco-custom-checkbox codicon codicon-preserve-case"
              :style="{ background: preserveCase ? '#0090f133' : '' }"
              @click="findRule('updatePreserveCase')"
            ></div>
          </div>
        </div>
        <div class="replace-actions">
          <!-- <div class="button codicon codicon-find-replace"></div> -->
          <div
            :class="
              replaceValue
                ? 'button codicon codicon-find-replace-all'
                : 'button codicon codicon-find-replace-all disabled'
            "
            @click="replaceAll"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang=ts name="SearchReplace">
import { useStore } from 'vuex'
import { ref, computed, onMounted, nextTick } from 'vue'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { debounce } from 'lodash'
import { SourceControlConstant as scc, searchReplaceHeight, replaceAll, someContentToFind } from '../config'
import ControlList from './ControlList.vue'
const store = useStore()

const searchValue = ref(store.state.globalSearchReplace.searchValue)
const replaceValue = computed(() => store.getters['globalSearchReplace/gettersReplaceValue'])
const caseSensitive = computed(() => store.getters['globalSearchReplace/gettersCaseSensitive'])
const matchWhole = computed(() => store.getters['globalSearchReplace/gettersMatchWhole'])
const regularExpress = computed(() => store.getters['globalSearchReplace/gettersRegularExpress'])
const preserveCase = computed(() => store.getters['globalSearchReplace/gettersPreserveCase'])
const hideReplace = computed(() => store.getters['globalSearchReplace/gettersHideReplace'])
const matchPath = computed(() => store.getters['globalSearchReplace/gettersMatchPath'])
const searchRange = computed(() => store.getters['globalSearchReplace/gettersSearchRange'])

const onChangeSearchValue = debounce((searchValue: string) => {
  const path = 'globalSearchReplace/updateSearchValue'
  store.commit(path, searchValue)
}, 600)

const onChangeReplaceValue = (replaceValue: string) => {
  const path = 'globalSearchReplace/updateReplaceValue'
  store.commit(path, replaceValue)
}

const findRule = (rule: string) => {
  const path = `globalSearchReplace/${rule}`
  store.commit(path)
}

const barBox = ref<HTMLElement>()
const handleSearchReplaceHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(barBox.value as HTMLElement, (element: HTMLElement) => {
    searchReplaceHeight.value = element.offsetHeight
  })
}

onMounted(() => nextTick(() => handleSearchReplaceHeight()))

</script>
<style lang="scss" scoped>
@import "../scss/search-replace.scss";
</style>

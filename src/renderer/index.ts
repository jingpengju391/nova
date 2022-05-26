import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import { interceptor } from '../lib/routerInterceptor'
import store from './store'
import 'virtual:svg-icons-register'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import '@/assets/font/iconfont.css'
import '@/assets/css/global/splitpanes.css'
import {
  ElContainer, ElAside, ElMenu, ElMenuItem, ElTabs, ElTabPane, ElButton,
  ElTable, ElTableColumn, ElDatePicker, ElInput, ElInputNumber, ElForm, ElFormItem, ElDrawer, ElTree,
  ElEmpty, ElTooltip, ElDialog, ElCheckbox, ElTag, ElMessage, ElLoading, ElPopover, ElSelect,
  ElOption, ElRadio, ElRadioGroup, ElCol, ElRow, ElBreadcrumb, ElBreadcrumbItem, ElMessageBox, ElCascader,
  ElCollapse, ElCollapseItem, ElSteps, ElStep, ElScrollbar, ElIcon, ElSelectV2, ElButtonGroup, ElTreeV2, ElAutocomplete, ElDivider
} from 'element-plus'

import {
  Minus, FullScreen, Expand, CaretBottom, Finished, ArrowRight, Delete, MoreFilled, RefreshRight, DocumentCopy, Close, DocumentAdd, FolderOpened, Document, Refresh, QuestionFilled,
  Search, FolderAdd, Ticket, Comment, Share, Menu, More, Folder, Paperclip, Download, Upload, Loading, Files, Setting,
  Guide, TurnOff, VideoPause, Help, VideoPlay, Open, ArrowDown, ArrowUp, Fold, Check, CaretTop, ArrowLeft, Sort, UserFilled, Postcard, Management
} from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import { Cascader } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import '@/assets/css/global/element-table.css'
// TODO: remove @kangc/v-md-editor
// @ts-ignore
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
// @ts-ignore
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
// @ts-ignore
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

import ContextMenu from './views/components/ContextMenu'

const app = createApp(App)
VMdEditor.use(githubTheme)
VMdPreview.use(githubTheme)
app.use(router)
app.use(store)

app.use(VMdEditor)
app.use(VMdPreview)

app.component(ElContainer.name, ElContainer)
app.component(ElAside.name, ElAside)
app.component(ElMenu.name, ElMenu)
app.component(ElMenuItem.name, ElMenuItem)
app.component(ElTabs.name, ElTabs)
app.component(ElTabPane.name, ElTabPane)
app.component(ElButton.name, ElButton)
app.component(ElTable.name, ElTable)
app.component(ElTableColumn.name, ElTableColumn)
app.component(ElDatePicker.name, ElDatePicker)
app.component(ElInput.name, ElInput)
app.component(ElInputNumber.name, ElInputNumber)
app.component(ElForm.name, ElForm)
app.component(ElFormItem.name, ElFormItem)
app.component(ElDrawer.name, ElDrawer)
app.component(ElTree.name, ElTree)
app.component(ElEmpty.name, ElEmpty)
app.component(ElTooltip.name, ElTooltip)
app.component(ElDialog.name, ElDialog)
app.component(ElCheckbox.name, ElCheckbox)
app.component(ElTag.name, ElTag)
app.component(ElPopover.name, ElPopover)
app.component(ElSelect.name, ElSelect)
app.component(ElOption.name, ElOption)
app.component(ElRadio.name, ElRadio)
app.component(ElRadioGroup.name, ElRadioGroup)
app.component(ElCol.name, ElCol)
app.component(ElRow.name, ElRow)
app.component(ElBreadcrumb.name, ElBreadcrumb)
app.component(ElBreadcrumbItem.name, ElBreadcrumbItem)
app.component(ElCascader.name, ElCascader)
app.component(ElCollapse.name, ElCollapse)
app.component(ElCollapseItem.name, ElCollapseItem)
app.component(ElSteps.name, ElSteps)
app.component(ElStep.name, ElStep)
app.component(ElScrollbar.name, ElScrollbar)
app.component(ElIcon.name, ElIcon)
app.component(ElSelectV2.name, ElSelectV2)
app.component(ElButtonGroup.name, ElButtonGroup)
app.component(ElTreeV2.name, ElTreeV2)

app.component(Minus.name, Minus)
app.component(FullScreen.name, FullScreen)
app.component(Expand.name, Expand)
app.component(CaretBottom.name, CaretBottom)
app.component(ArrowRight.name, ArrowRight)
app.component(Finished.name, Finished)
app.component(Delete.name, Delete)
app.component(ElAutocomplete.name, ElAutocomplete)
app.component(ElDivider.name, ElDivider)
app.component(MoreFilled.name, MoreFilled)
app.component(RefreshRight.name, RefreshRight)
app.component(DocumentCopy.name, DocumentCopy)
app.component(Close.name, Close)
app.component(DocumentAdd.name, DocumentAdd)
app.component(FolderOpened.name, FolderOpened)
app.component(Document.name, Document)
app.component(Refresh.name, Refresh)
app.component(QuestionFilled.name, QuestionFilled)
app.component(Search.name, Search)
app.component(FolderAdd.name, FolderAdd)
app.component(Ticket.name, Ticket)
app.component(Comment.name, Comment)
app.component(Share.name, Share)
app.component(Menu.name, Menu)
app.component(More.name, More)
app.component(Folder.name, Folder)
app.component(Paperclip.name, Paperclip)
app.component(Download.name, Download)
app.component(Upload.name, Upload)
app.component(Loading.name, Loading)
app.component(Files.name, Files)
app.component(Guide.name, Guide)
app.component(TurnOff.name, TurnOff)
app.component(VideoPause.name, VideoPause)
app.component(Help.name, Help)
app.component(VideoPlay.name, VideoPlay)
app.component(Open.name, Open)
app.component(Setting.name, Setting)
app.component(ArrowDown.name, ArrowDown)
app.component(ArrowUp.name, ArrowUp)
app.component(Fold.name, Fold)
app.component(Check.name, Check)
app.component(CaretTop.name, CaretTop)
app.component(ArrowLeft.name, ArrowLeft)
app.component(Sort.name, Sort)
app.component(UserFilled.name, UserFilled)
app.component(Postcard.name, Postcard)
app.component(Management.name, Management)
app.use(ElMessage)
app.use(ElMessageBox)
app.use(ElLoading)
app.use(ContextMenu)
app.use(VXETable) // 表格
app.use(Cascader)

app.config.globalProperties.$ELEMENT = { size: 'small', zIndex: 3000 }

app.directive('focus', {
  mounted(element: HTMLElement, bind, dir:any) {
    // element-ui input
    if (element.className.includes('el-input')) {
      // when element-ui input is enclosed inside element-ui dialog
      setTimeout(() => {
        if (element.children.length > 0) {
          try {
            dir.dirs[0].instance.focus()
            dir.dirs[0].instance.select()
            // (element.children[0] as HTMLInputElement).select()
          } catch (e) {
            console.log(e)
          }
        }
      })
    }
  }
})
interceptor()
app.mount('#app')
router.replace('/coder')

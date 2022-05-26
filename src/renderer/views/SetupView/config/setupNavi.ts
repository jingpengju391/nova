import { LinkTargetType } from '@shared/dataModelTypes/models/helpers'
import { Vue } from '@vueuse/core/node_modules/vue-demi'
import { createApp, ref, defineAsyncComponent, markRaw } from 'vue'
import store from '@/store'
import { AppSettings, TaskSettings, RunnerSettings } from '@shared/dataModelTypes/appSettings'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
export const arrNode:HTMLElementAny[] = []
export const addids = ref<number>(0)
export const scrollTop = ref(0)
export function showRightContent() {
  console.log(addids.value, 'addid')
  console.dir(arrNode[addids.value - 1].offsetTop, '555')
  scrollTop.value = arrNode[addids.value - 1].offsetTop
  console.log(scrollTop.value, 'scrollTop.value')
}

export const arraySubMenu:any = [
  {
    id: 1,
    title: '软件默认设置',
    name: '软件设置',
    componentId: defineAsyncComponent(() => import('../components/SetupDetails/SoftwareSettings.vue')),
    comporentData: [
      {
        label: '堆栈高度限制',
        ref: 'calculationStackHeightLimit',
        type: 'input-number',
        inputType: '',
        required: false,
        rules: [],
        change: (form:AppSettings, validateFn:any) => !validateFn(onSubmitApp(form))
      }, {
        label: '错误链条长度',
        ref: 'errorTraceLength',
        type: 'input-number',
        inputType: '',
        required: false,
        rules: [],
        change: (form:AppSettings, validateFn:any) => !validateFn(onSubmitApp(form))
      }
    ]
  },
  {
    id: 2,
    title: '任务默认设置',
    name: '任务设置',
    componentId: defineAsyncComponent(() => import('../components/SetupDetails/TaskSettings.vue')),
    comporentData: [
      {
        label: '默认输出文件夹',
        ref: 'outputFolder',
        type: '',
        inputType: '',
        required: false,
        rules: [],
        customComporent: markRaw(defineAsyncComponent(() => import('../components/SetupParts/OutputFile.vue')))
      },
      {
        label: '默认输出精度',
        ref: 'outputPrecision',
        type: 'input-number',
        inputType: '',
        required: false,
        rules: [],
        change: (form:TaskSettings, validateFn:any) => !validateFn(onSubmitTask(form))
      },
      {
        label: '默认运行方式',
        ref: 'mode',
        type: 'input',
        inputType: '',
        required: false,
        rules: [],
        change: (form:TaskSettings, validateFn:any) => !validateFn(onSubmitTask(form))
      }, {
        label: '默认分文件夹输出',
        ref: 'childFolderSelect',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:TaskSettings, validateFn:any) => !validateFn(onSubmitTask(form))
      }

    ]
  },
  {
    id: 3,
    title: '运行配置默认设置',
    module: '运行设置',
    componentId: defineAsyncComponent(() => import('../components/SetupDetails/RunnerSettings.vue')),
    comporentData: [
      {
        label: '默认线程数',
        ref: 'multiThreadNumber',
        type: 'input-number',
        inputType: '',
        required: false,
        rules: [],
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认滑动窗口',
        ref: 'slidingWindow',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认起点重置开关',
        ref: 'rebaseSwitch',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认起点重置过程',
        ref: 'rebaseDepth',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认设定数据范围',
        ref: 'allowScope',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认模型点输出',
        ref: 'modelPointsOutput',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认循环计算',
        ref: 'allowIterationWhenCircularReference',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认设定一级循环',
        ref: 'allowInnerLoopNumber',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认设定二级循环',
        ref: 'allowOuterLoopNumber',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认独立一级循环',
        ref: 'independentInnerLoop',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }, {
        label: '默认独立二级循环',
        ref: 'independentOuterLoop',
        type: 'switch',
        inputType: '',
        required: false,
        rules: [],
        size: 'large',
        activeText: '开',
        inactiveText: '关',
        activeColor: '#13ce66',
        change: (form:RunnerSettings, validateFn:any) => !validateFn(onSubmitRunner(form))
      }
    ]

  }
]

function onSubmitApp(data:AppSettings) {
  store.dispatch('settings/updateSoftwareSettingsData', data)
}

function onSubmitTask(data:TaskSettings) {
  store.dispatch('settings/updateTaskSettingsData', data)
}

function onSubmitRunner(data:RunnerSettings) {
  store.dispatch('settings/updateRunnerSettingsData', data)
}

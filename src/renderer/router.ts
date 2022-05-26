import { createRouter, createMemoryHistory } from 'vue-router'
import CoderView from '@/views/CoderView/index.vue'
import DataInputView from '@/views/DataInputView/index.vue'
import RunnerView from './views/RunnerView/index.vue'
import OutputView from './views/OutputView/index.vue'
import AssumptionView from '@/views/AssumptionView/index.vue'
import HelpView from '@/views/HelpView/index.vue'
import TaskView from '@/views/taskView/index.vue'
import ProductView from '@/views/ProductView/index.vue'
import SetupView from '@/views/SetupView/index.vue'
import DataLinkView from '@/views/DataLinkView/index.vue'
import ProjectView from '@/views/ProjectView/index.vue'
import DcsView from '@/views/DcsView/index.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      redirect: '/coder'
    },
    {
      path: '/coder',
      component: CoderView
    },
    {
      path: '/data-input',
      component: DataInputView
    },
    {
      path: '/runner',
      component: RunnerView
    },
    {
      path: '/output',
      component: OutputView
    },
    {
      path: '/assumption',
      component: AssumptionView
    },
    {
      path: '/help',
      component: HelpView
    },
    {
      path: '/task',
      component: TaskView
    },
    {
      path: '/product',
      component: ProductView
    },
    {
      path: '/setup',
      component: SetupView
    },
    {
      path: '/dataLink',
      component: DataLinkView
    },
    {
      path: '/project',
      component: ProjectView
    },
    {
      path: '/dcsview',
      component: DcsView
    }
  ]
})
export default router

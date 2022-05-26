import { ref } from 'vue'
const active = ref(4)

const defaultProps = {
  children: 'children'
}

const nodeKey = 'id'

const treeData: any = [
  // {
  //   id: 5,
  //   label: '运行参数',
  //   children: [
  //     {
  //       id: 1,
  //       label: '目标参数'
  //     },
  //     {
  //       id: 4,
  //       label: '输出参数'
  //     }
  //   ]
  // },
  // {
  //   id: 2,
  //   label: '运行配置'
  // },
  // {
  //   id: 3,
  //   label: '任务列表'
  // }
  {
    id: 1,
    label: '目标参数',
    name: 'TargetSettings'
  },
  {
    id: 2,
    label: '输出参数',
    name: 'OutputView'
  },
  {
    id: 3,
    label: '运行配置',
    name: 'RunnersSettings'
  },
  {
    id: 4,
    label: '任务列表',
    name: 'ProjectionsSettings'
  }
]

function onClickRunnerNaviNode(node: any) {
  if (node.id !== 4) active.value = node.id
}

export { active, defaultProps, nodeKey, treeData, onClickRunnerNaviNode }

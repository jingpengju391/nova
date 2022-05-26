<template>
  <div class="run-queue">
    <div id="header">
      <span>运行队列</span>
    </div>
    <el-button class="add-btn" @click="createNewQueue(-1)" type="primary"
      >添加运行队列</el-button
    >
    <div class="queue-box">
      <!-- <el-empty v-if="!queueListData.length" description="空队列"></el-empty> -->
      <el-tree
        :data="queueListData"
        node-key="id"
        accordion
        class="navi-tree"
        default-expand-all
        :expand-on-click-node="false"
        :check-on-click-node="true"
        :highlight-current="true"
        @node-click="handelCurQueue"
        @node-contextmenu="onRightClickQueueNaviNode"
        ref="queueTree"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node navi-node">
            <span
              v-if="data.name !== 'newRunner' && data.name !== 'newQueue'"
              >{{ data.name }}</span
            >

            <el-input
              v-else-if="data.name === 'newQueue' && data.children"
              type="text"
              v-model="input1"
              size="small"
              :class="isQueueNameEmpty ? 'is-queue-empty' : ''"
              :width="150"
              @input="changeQueuename"
              @blur="addAndUpdateQueue(node, data)"
              placeholder="添加运行队列"
              maxlength="inputNameLength"
            >
            </el-input>
            <el-select
              v-model="runnerId"
              size="small"
              width="150px"
              v-else-if="data.name === 'newRunner' && !data.children"
              placeholder="请选择运行项"
              @change="addRunnerItem(node, data)"
            >
              <el-option
                v-for="option in runnerSelectionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <span class="tool-sets">
              <icon-button
                v-if="data.children !== undefined"
                tooltip="新建运行项"
                @click.stop="appendRunner(data)"
                icon-class="document-add"
              />
              <icon-button
                v-if="data.children === undefined"
                tooltip="删除运行项"
                @click.stop="deleteQueueRunner(data, node)"
                icon-class="delete"
              />
              <i
                v-if="data.children === undefined"
                style="
                  color: #409eff;
                  font-size: 12px;
                  cursor: pointer;
                  font-style: normal;
                "
                @click.stop="recoveryQueueRunner(node, data)"
                >恢复队列配置</i
              >
            </span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts" >
import IconButton from '@/views/components/IconButton.vue'
import { defineComponent, reactive, ref, watch, computed, getCurrentInstance, nextTick } from 'vue'
import { Queue, createBaseRunConfigurationItem } from '@shared/dataModelTypes/runs/projections'
import { clone, omit, equals } from '@shared/functional'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import jsJoin from '@/hooks/jsPath'
import { useRunsAPIs } from '@/hooks/apis'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
interface Tree {
  id: string | number
  label: string
  children?: Tree[]
}
export default defineComponent({
  components: { IconButton },
  setup() {
    let id = 1000
    let parentId = 0
    const input1 = ref()
    const runnerId = ref()
    const isRename = ref(false)
    const isQueueNameEmpty = ref(false)
    const store = useStore()
    const currentProjection = ref(computed(() => {
      return store.state.runs.currentProjection
    }))
    const currentQueue = computed(() => {
      return store.state.runs.currentQueue
    })
    const queueTree = ref(null)
    const runners = ref(computed(() => {
      return store.state.runs.runners
    }))
    const runnerSelectionOptions = ref(computed(() => {
      return runners.value.map(r => ({ label: r.name, value: r.id }))
    }))
    const { proxy }: any = getCurrentInstance()
    const queueList = computed(() => {
      return store.state.runs.queueList
    })
    const queueListData = ref([])
    const appendRunner = async (data) => {
      parentId = data.id
      const newChild = { id: 'new-' + id++, name: 'newRunner' }
      data.children.push(newChild)
      queueListData.value = [...queueListData.value]
      // await store.commit('runs/updateCurrentQueue', data.id)
      // queueTree.value.setCurrentKey(queueTree.value.getCurrentKey())
    }
    let oldcurrentQueue = ref()
    const deleteQueueRunner = (data, node) => {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.id === data.id)
      children.splice(index, 1)
      store.commit('runs/deleteQueueRunner', data.id)
      store.commit('runs/changeIsProjectionSaveStatus', false)
      queueListData.value = [...queueListData.value]
    }

    const addRunnerItem = async (node, data) => {
      const tempRunnerItem = {}
      const newruner = runners.value.filter(runner => { return runner.id === runnerId.value })
      tempRunnerItem.runnerId = newruner[0].id
      tempRunnerItem.id = data.id
      tempRunnerItem.parentId = parentId
      tempRunnerItem.name = newruner[0].name
      data.name = newruner[0].name
      await store.commit('runs/addNewQueueRunnerItem', tempRunnerItem)
      runnerId.value = ''
      await store.commit('runs/updateCurrentQueue', data.id)
      // queueTree.value.setCurrentKey(queueTree.value.getCurrentKey())
    }
    const handelCurQueue = async (node, data) => {
      await store.commit('runs/updateCurrentQueue', node.id)
      // queueTree.value.setCurrentKey(queueTree.value.getCurrentKey())
    }
    const changeQueuename = (val) => {
      if (val === '' || val === undefined) {
        isQueueNameEmpty.value = true
      } else {
        isQueueNameEmpty.value = false
      }
    }
    const addAndUpdateQueue = async (node, data) => {
      if (input1.value === '' || input1.value === undefined) return ElMessage.error('队列名称不可为空！！')
      if (store.state.runs.queueList.length) {
        const filterQueue = queueList.value.filter(queue => { return queue.name === input1.value })
        if (filterQueue.length) return ElMessage.error('队列名称已存在！！')

        data.name = clone(input1.value)
        if (isRename.value) {
          await store.commit('runs/renameQueue', { id: data.id, name: data.name })
          isRename.value = false
        } else {
          addQueue(data)
        }
      } else {
        data.name = clone(input1.value)
        addQueue(data)
      }
    }
    const addQueue = async (data) => {
      await store.commit('runs/addNewQueue', data)
      await store.commit('runs/updateCurrentQueue', data.id)
      input1.value = ''
    }
    const recoveryQueueRunner = (node, data) => {
      node.canFocus = false
      data.inherit = true
      queueListData.value = [...queueListData.value]
      nextTick(() => {
        queueTree.value.setCurrentNode(node.parent.data)
        queueTree.value.setCurrentKey(node.parent.data.id)
      })
      store.commit('runs/recoveryQueueRunner', { parentId: node.parent.data.id, recoveryId: data.id })
      ElMessage.success('恢复队列配置成功')
    }
    const createNewQueue = (parentId: number) => {
      store.commit('runs/changeIsProjectionSaveStatus', false)
      // if (!isQueueNameEmpty.value) {
      // isQueueNameEmpty.value = true
      const newChild = { id: 'new-' + id++, name: 'newQueue', children: [] }
      queueListData.value.push(newChild)
      // }
    }
    const onRightClickQueueNaviNode = (event: MouseEvent, node) => {
      if (node.children) {
        const menuItems = [
          {
            title: '重命名',
            shortCut: '',
            onClick: () => {
              node.name = 'newQueue'
              isRename.value = true
            }
          },
          {
            title: '拷贝',
            shortCut: '',
            onClick: () => CopyQueue(node.id)
          },
          {
            title: '删除',
            shortCut: '',
            onClick: () => deleteQueue(node.id)
          },
          {
            title: '添加运行项',
            shortCut: '',
            onClick: () => appendRunner(node)
          }
        ]
        proxy.$contextMenu({
          screenPosition: { x: event.clientX, y: event.clientY },
          menuItems
        })
      }
    }
    const deleteQueue = (id) => {
      const index = queueListData.value.findIndex(item => item.id === id)
      if (id.toString().indexOf('new-') !== -1 && input1.value === '') {
        queueListData.value.splice(index, 1)
        isQueueNameEmpty.value = false
      } else {
        queueListData.value.splice(index, 1)
        isQueueNameEmpty.value = false
      }
      queueListData.value = [...queueListData.value]
      store.commit('runs/deleteQueue', id)
      store.commit('runs/changeIsProjectionSaveStatus', false)
    }
    const CopyQueue = (id) => {
      store.dispatch('runs/CopyQueue', id)
    }
    watch(currentProjection, (newValue) => {
    }, { deep: true, immediate: true })
    watch(queueList, async (newValue, oldValue) => {
      const cloneData = clone(queueList.value)
      const flag = equals(queueList.value, queueListData.value)
      nextTick(() => {
        //  queueTree.value.setCurrentNode(newValue)
        if (newValue && currentQueue.value) {
          queueTree.value.setCurrentKey(currentQueue.value.id)
        }
      })
      if (!flag) {
        if (queueListData.value.length !== 0 && currentProjection.value.id === queueListData.value[0].projectionId) {
          store.commit('runs/changeIsProjectionSaveStatus', false)
        } else if (queueListData.value.length !== 0 && queueList.value.length !== 0 && currentProjection.value.id !== queueListData.value[0].projectionId) {
          await store.commit('runs/updateCurrentQueue', cloneData[0].id)
          nextTick(() => {
            queueTree.value.setCurrentKey(cloneData[0].id)
          })
        }
      }

      for (let i = 0; i < cloneData.length; i++) {
        let child = cloneData[i].children
        for (let j = 0; j < child.length; j++) {
          const count = runners.value.filter(item => { return item.id === child[j].runnerId })
          if (count.length === 0) {
            // await useRunsAPIs().db.deleteQueueRunnerItem([child[j].id])
            await store.commit('runs/deleteQueueRunner', [child[j].id])
            await store.dispatch('runs/saveUpdatedCurrentQueueToDB', currentProjection.value.id)
            await store.dispatch('runs/saveUpdatedCurrentProjectionToDB', currentProjection.value)
            // cloneData[i].children.splice(j, 1)
          }
        }
      }

      queueListData.value.length = 0
      queueListData.value.push(...cloneData)
    }, { deep: true, immediate: true })
    const cuFlag = ref(false)
    watch(currentQueue, (newValue, oldValue) => {
      if (!newValue) return
      if (oldValue && newValue.id === oldValue.id) {
        const flag = equals(newValue, oldcurrentQueue.value)
        if (cuFlag.value && !flag) {
          store.commit('runs/changeIsProjectionSaveStatus', false)
        }
        cuFlag.value = true
      }
      oldcurrentQueue.value = clone(newValue)
      nextTick(() => {
        //  queueTree.value.setCurrentNode(newValue)
        queueTree.value.setCurrentKey(newValue.id)
      })
    }, { deep: true, immediate: true })
    watch(runners, async (newVal, oldValue) => {
      for (let i = 0; i < queueListData.value.length; i++) {
        let child = queueListData.value[i].children
        for (let j = 0; j < child.length; j++) {
          const count = runners.value.filter(item => { return item.id === child[j].runnerId })
          if (count.length === 0) {
            await store.commit('runs/deleteQueueRunner', [child[j].id])
            await store.dispatch('runs/saveUpdatedCurrentQueueToDB', currentProjection.value.id)
            await store.dispatch('runs/saveUpdatedCurrentProjectionToDB', currentProjection.value)
          } else if (count.length && child[j].name !== count[0].name) {
            child[j].name = count[0].name
            await useRunsAPIs().db.updateQueueRunner(child[j].id, omit(['id', 'children'], child[j]))
            await store.commit('runs/updateQueue', queueListData.value[i])

            await store.dispatch('runs/saveUpdatedCurrentQueueToDB', currentProjection.value.id)
            await store.dispatch('runs/saveUpdatedCurrentProjectionToDB', currentProjection.value)
          }
        }
      }
    }, { deep: true, immediate: true })
    return {
      queueListData,
      input1,
      oldcurrentQueue,
      runners,
      runnerSelectionOptions,
      runnerId,
      queueTree,
      isRename,
      currentQueue,
      isQueueNameEmpty,
      currentProjection,
      cuFlag,
      appendRunner,
      createNewQueue,
      addAndUpdateQueue,
      changeQueuename,
      addQueue,
      handelCurQueue,
      addRunnerItem,
      onRightClickQueueNaviNode,
      deleteQueue,
      CopyQueue,
      deleteQueueRunner,
      recoveryQueueRunner
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";
.run-queue {
  // overflow-y: scroll;
  height: 100%;
  border-right: 1px solid var(--nova-border-color);
  .add-btn {
    margin: 20px 10px;
  }

  .queue-box {
    width: 90%;
    margin: 0 5%;
    height: calc(100% - 110px);
    .el-tree {
      height: 100%;
      &:deep(.el-tree-node:focus) {
        > .el-tree-node__content {
          background-color: #ffffff;
          color: black;
          font-weight: 500;
        }
      }
      &:deep(.el-tree-node.is-current:focus) {
        > .el-tree-node__content {
          background-color: #cce9ff;
          color: black;
          font-weight: 500;
        }
      }
      .el-tree-node.is-current > .el-tree-node__content {
        background-color: #cce9ff;
        border: 1 px solid #3b8bff;
        color: black;
        font-weight: 500;
      }
    }
  }
  .is-queue-empty {
    &:deep(.el-input__inner) {
      border: 1px solid red;
      color: red;
    }
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;

    &:deep(.el-input__inner, .el-select) {
      width: 150px;
    }
    &:deep(.el-select) {
      width: 150px;
    }
  }
  #header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0 4px 10px;
    background-color: transparent;
    flex: 0 0 1;
    span {
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
}
</style>

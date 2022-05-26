<template>
  <div id="header">
    <span>运行项配置</span>
  </div>
  <div class="runner-item">
    <p>运行队列名称：{{ queueName }}</p>
    <p>
      运行项名称：
      <el-tag
        v-for="item in runnerItems"
        :key="item.id"
        class="mx-1"
        effect="plain"
        :closable="item.isClose"
        @close="removeRunnerItem(item.id)"
      >
        {{ item.name }}
      </el-tag>
    </p>
  </div>
  <el-form
    id="projection-detailed-settings-form"
    :rules="ProjectionDetailedSettings"
    :model="currentProjection"
  >
    <!-- <el-form-item label="堆栈高度限制">
      <el-input-number
        v-model="currentProjection.calculationStackHeightLimit"
        :min="100"
        :max="20000"
      />
    </el-form-item> -->
    <el-form-item label="评估时点" prop="evaluationTimePoint">
      <el-date-picker
        v-model="currentProjection.evaluationTimePoint"
        type="date"
        placeholder="Pick a day"
        value-format="YYYYMMDD"
      >
      </el-date-picker>
    </el-form-item>
    <el-form-item label="线程数">
      <el-input-number v-model="currentProjection.multiThreadNumber" :min="1" />
    </el-form-item>
    <!-- <el-form-item label="错误链条长度">
      <el-input-number v-model="currentProjection.errorTraceLength" :min="1" />
    </el-form-item> -->
    <!-- <el-form-item label="评估时点">
      <el-date-picker
        v-model="currentProjection.evaluationTimePoint"
        type="date"
        placeholder="Pick a day"
      >
      </el-date-picker>
    </el-form-item> -->
    <el-form-item label="滑动窗口">
      <el-checkbox v-model="currentProjection.slidingWindow" />
    </el-form-item>
    <el-form-item label="起点重置开关">
      <el-checkbox v-model="currentProjection.rebaseSwitch" />
    </el-form-item>
    <el-form-item label="起点重置过程">
      <el-checkbox v-model="currentProjection.rebaseDepth" />
    </el-form-item>
    <!-- <el-form-item label="Share Block Results">
      <el-radio-group v-model="currentProjection.shareBlockResults">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="Allow Static Blocks">
      <el-radio-group v-model="currentProjection.allowStaticBlocks">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item> -->
    <el-form-item label="设定数据范围">
      <el-radio-group v-model="currentProjection.allowScope">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="数据范围" v-if="currentProjection.allowScope">
      <el-col :span="11">
        <el-input-number v-model="currentProjection.scopeFrom" :min="0" />
      </el-col>
      <el-col :span="2" style="margin: 0 10px">-</el-col>
      <el-col :span="11">
        <el-input-number
          v-model="currentProjection.scopeTo"
          :min="currentProjection.scopeFrom"
        />
      </el-col>
    </el-form-item>
    <el-form-item label="设定二级循环">
      <el-radio-group v-model="currentProjection.allowInnerLoopNumber">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="设定一级循环">
      <el-radio-group v-model="currentProjection.allowOuterLoopNumber">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      label="一级循环范围"
      v-if="currentProjection.allowOuterLoopNumber"
    >
      <el-col :span="11">
        <el-input-number
          v-model="currentProjection.outerLoopNumberFrom"
          :min="0"
          :max="currentProjection.outerLoopNumberTo"
        />
      </el-col>
      <el-col :span="2" style="margin: 0 10px">-</el-col>
      <el-col :span="11">
        <el-input-number
          v-model="currentProjection.outerLoopNumberTo"
          :min="currentProjection.outerLoopNumberFrom"
        />
      </el-col>
    </el-form-item>
    <el-form-item
      label="二级循环范围"
      v-if="currentProjection.allowInnerLoopNumber"
    >
      <el-col :span="11">
        <el-input-number
          v-model="currentProjection.innerLoopNumberFrom"
          :min="0"
          :max="currentProjection.innerLoopNumberTo"
        />
      </el-col>
      <el-col :span="2" style="margin: 0 10px">-</el-col>
      <el-col :span="11">
        <el-input-number
          v-model="currentProjection.innerLoopNumberTo"
          :min="currentProjection.innerLoopNumberFrom"
        />
      </el-col>
    </el-form-item>
    <el-form-item label="模型点输出">
      <el-radio-group v-model="currentProjection.modelPointsOutput">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="独立一级循环">
      <el-radio-group v-model="currentProjection.independentOuterLoop">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="独立二级循环">
      <el-radio-group v-model="currentProjection.independentInnerLoop">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <!-- <el-form-item label="输出文件夹">
      <el-input v-model="currentProjection.outputFolder" />
    </el-form-item> -->
    <el-form-item label="循环计算">
      <el-checkbox
        v-model="currentProjection.allowIterationWhenCircularReference"
      />
    </el-form-item>
    <!-- <el-form-item label="Output Prefix">
      <el-input v-model="currentProjection.outputPrefix" />
    </el-form-item> -->
    <!-- <el-form-item label="输出精度">
      <el-input-number v-model="currentProjection.outputPrecision" :min="0" />
    </el-form-item> -->
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { clone, equals, omit } from '@shared/functional'
import { createBaseRunConfigurationItem } from '@shared/dataModelTypes/runs/projections'
const { mapState, mapMutations } = createNamespacedHelpers('runs/')

export default defineComponent({
  data() {
    return {
      queueName: '',
      runnerItems: [],
      oldcurrentQueue: {}
    }
  },
  computed: {
    ...mapState(['queueList', 'currentQueue']),
    currentProjection() {
      if (this.currentQueue && this.queueList.length > 0) {
        return this.currentQueue
      } else {
        return createBaseRunConfigurationItem()
      }
    },
    ProjectionDetailedSettings() {
      return {
        evaluationTimePoint: [
          { required: true, message: '名称不允许为空', trigger: 'blur' },
          { validator: this.duplicatedevaluationTimePointValidator, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
  },
  watch: {
    queueList: {
      handler(newValue, oldValue) {
        if (!newValue.length) {
          this.queueName = ''
          this.runnerItems = []
        }
      },
      deep: true,
      immediate: true
    },
    currentQueue: {
      handler(newValue, oldValue) {
        if (!newValue) return
        if (!newValue.children && newValue.id === oldValue?.id) {
          const newVal = omit(['isInherit'], newValue)
          const oldVal = omit(['isInherit'], this.oldcurrentQueue)
          const flag = equals(newVal, oldVal)
          const parentQ = omit(['isInherit', 'id', 'parentId', 'children', 'name', 'runnerId'], this.queueList.find((item:any) => { return item.id === newValue.parentId }))
          const pNewVal = omit(['isInherit', 'id', 'parentId', 'name', 'runnerId'], newValue)
          const flag2 = equals(parentQ, pNewVal)
          if (flag2) {
            this.recoveryQueueRunner({ parentId: newValue.parentId, recoveryId: newValue.id })
          }
          if (!flag2 && !flag) {
            this.removeQueueInheritRunnerItem({ parentId: this.currentQueue.parentId, removeId: this.currentQueue.id })
          }
        }

        if (newValue && newValue.parentId === 0) {
          const flag = equals(newValue, this.oldcurrentQueue)

          if (!flag) {
            this.formatQueueInheritRunnerItem(newValue.id)
          }
        }
        //   if (newValue.children && newValue.id === oldValue?.id && newValue.parentId === 0) this.formatQueueInheritRunnerItem(newValue.id)
        this.InitializeHeaderName()
        this.oldcurrentQueue = clone(newValue)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapMutations(['removeQueueInheritRunnerItem', 'formatQueueInheritRunnerItem', 'recoveryQueueRunner']),
    changes(val, old) {
    },
    InitializeHeaderName() {
      this.queueName = ''
      this.runnerItems = []
      const currentQueue = clone(this.currentQueue)
      if (this.currentQueue.parentId.toString() === '0') {
        this.queueName = this.currentQueue.name
        this.currentQueue.children?.map(child => {
          if (child.isInherit) {
            this.runnerItems.push({
              name: child.name,
              id: child.id,
              isClose: true
            })
          }
        })
      } else {
        const queueList = clone(this.queueList)

        const curQueue = this.queueList.filter(queue => { return queue.id.toString() === this.currentQueue.parentId.toString() })[0]
        this.queueName = curQueue.name
        this.runnerItems.push({
          name: currentQueue.name,
          id: currentQueue.id,
          isClose: false
        })
      }
    },
    removeRunnerItem(id) {
      this.removeQueueInheritRunnerItem({ parentId: this.currentQueue.id, removeId: id })
    },
    duplicatedevaluationTimePointValidator() {
      return (rule: any, evaluationTimePoint: string, callback: any) => {
        try {
          if (evaluationTimePoint === 'NaNNaNNaN') {
            throw new Error('评估时点不可为空！！！')
          }
          callback()
        } catch (err) {
          callback(err)
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
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
.runner-item {
  padding-left: 10px;
}
#projection-detailed-settings-form {
  height: calc(100% - 111px);
  width: 100%;
  overflow-y: scroll;
  padding: 40px;
  z-index: 9;
}
</style>

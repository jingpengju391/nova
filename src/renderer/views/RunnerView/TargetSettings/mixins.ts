import type { ComponentOptionsMixin } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { Target, TargetVSItemType } from '@shared/dataModelTypes/runs/targets'
import { validateNameLegality, validateEmptyName, validateDuplicatedName, validateLinkChain } from '@/utils'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { Series, Variable, SimplifiedProperty } from '@shared/dataModelTypes'
import { VariableType } from '@shared/dataModelTypes/models/helpers'
import { clone } from '@shared/functional'
const { mapState, mapActions, mapMutations } = createNamespacedHelpers('runs/')
interface SelectOption {
  id: string
  name: string
  type?: TargetVSItemType
}

const defaultTargetOptionsValue = {
  periodFrom: 0,
  periodTo: 1,
  periodOutputFrom: 0,
  periodOutputTo: 1,
  shouldOutput: false
}

const size = 40

let context: any = null
let _this: any = null
const currentTargetMixin: ComponentOptionsMixin = {
  data() {
    return {
      loadData: [],
      cacheData: [],
      ddf: 1
      // variablesAndSeriesOptions: []
    }
  },
  mounted() {
    _this = this
    // _this.variablesAndSeriesOptions = _this.getVariablesAndSeriesOptions()
  },
  computed: {
    ...mapState(['currentTarget', 'targets']),
    checkAll() {
      return this.currentTarget.variablesAndSeries.length > 0 &&
        this.currentTarget.variablesAndSeries.length === this.filterTextData.length
    },
    isIndeterminate() {
      return this.currentTarget.variablesAndSeries.length > 0 &&
        this.currentTarget.variablesAndSeries.length < this.variablesAndSeriesOptions.length
    },
    variablesAndSeriesOptions(): SelectOption[] {
      try {
        const targetMask = modelsDataSource.getTargetMaskForLinkChain(this.currentTarget?.linkChain)
        if (!targetMask) return []
        const variablesOptions = targetMask.variables.filter((variable: SimplifiedProperty) => { return variable.valueType !== VariableType.table }).map((item: SimplifiedProperty) => {
          return { id: item.id, name: item.name, type: TargetVSItemType.variables }
        })
        const seriesOptions = targetMask.series.map((item: SimplifiedProperty) => {
          return { id: item.id, name: item.name, type: TargetVSItemType.series }
        })
        const variablesAndSeries = seriesOptions.concat(variablesOptions)
        this.currentTarget?.variablesAndSeries.map((item: any, index: number) => {
          const findDeleteIndex = variablesAndSeries.findIndex((find: any) => { return find.id === item.id })
          if (findDeleteIndex === -1) {
            this.currentTarget?.variablesAndSeries.splice(index, 1)
            this.saveUpdatedCurrentTargetToDB()
          } else if (item.name !== variablesAndSeries[findDeleteIndex].name) {
            item.name = variablesAndSeries[findDeleteIndex].name
            this.saveUpdatedCurrentTargetToDB()
          }
        })
        const dd = this.ddf
        return variablesAndSeries
      } catch (e) {
        console.error(e, 'maybe linkChain Broken')
        return []
      }
    },
    pageSize() {
      return this.cacheData.length >= size ? size : this.cacheData.length
    },
    loading() {
      return !this.loadData.length
    }
  },
  methods: {
    ...mapActions(['saveUpdatedCurrentTargetToDB', 'setRunOptionsAsync']),
    ...mapMutations(['updateCurrentTarget']),
    onCurrentTargetChange(clearOptions?: boolean) {
      if (!validateEmptyName(this.currentTarget)) {
        this.$message.error('名称不能留空，请设置名称')
        return
      }

      if (!validateNameLegality(this.currentTarget)) {
        this.$message.error('名称只允许包含字母数字或下划线，且首字符必须是英文字母')
        return
      }

      if (!validateDuplicatedName(this.currentTarget, this.targets)) {
        this.$message.error('名称不能与其他目标重名，请重新修改名称')
        return
      }
      const { result, errorMessage } = validateTargetSettings(this.currentTarget)
      if (!result && errorMessage) {
        this.$message.error(errorMessage)
        return
      }

      if (!validateLinkChain(this.currentTarget)) {
        this.$message.error('目标Link不能留空，请选择')
        return
      }
      if (clearOptions === true) {
        this.currentTarget.variablesAndSeries.length = 0
      }
      this.saveUpdatedCurrentTargetToDB()
    },
    // getVariablesAndSeriesOptions() {
    //   try {
    //     const targetMask = modelsDataSource.getTargetMaskForLinkChain(this.currentTarget?.linkChain)
    //     if (!targetMask) return []
    //     const variablesOptions = targetMask.variables.filter((variable: SimplifiedProperty) => { return variable.valueType !== VariableType.table }).map((item: SimplifiedProperty) => {
    //       return { id: item.id, name: item.name, type: TargetVSItemType.variables }
    //     })
    //     const seriesOptions = targetMask.series.map((item: SimplifiedProperty) => {
    //       return { id: item.id, name: item.name, type: TargetVSItemType.series }
    //     })

    //     return seriesOptions.concat(variablesOptions)
    //   } catch (e) {
    //     console.error(e, 'maybe linkChain Broken')
    //     return []
    //   }
    // },
    handleSelect() {
      const options = this.checkAll ? [] : this.filterTextData
      const targetOptions = options.map((element: any) => {
        return {
          ...element,
          ...defaultTargetOptionsValue
        }
      })
      this.setRunOptionsAsync(targetOptions).then(() => {
        this.onCurrentTargetChange(false)
        // this.saveUpdatedCurrentTargetToDB()
      })
    },
    updateCurrentTargetTable() {
      const elScroll = document.getElementsByClassName('el-table__body-wrapper')[0] as HTMLElement
      if (elScroll) {
        elScroll.scrollTop = 0
      }
    }
  },
  watch: {
    $route: {
      handler(newObj) {
        _this = this
        _this.ddf++
        if (newObj.path === '/runner' && _this.currentTarget) {
          setTimeout(() => {
            if (_this.currentTarget?.variablesAndSeries) {
              _this.currentTarget?.variablesAndSeries.map((item: any, index: number) => {
                const findDeleteIndex = _this.variablesAndSeriesOptions.findIndex((find: any) => { return find.id === item.id })
                if (findDeleteIndex === -1) {
                  _this.currentTarget?.variablesAndSeries.splice(index, 1)
                  _this.saveUpdatedCurrentTargetToDB()
                }
              })
              _this.cacheData = clone(_this.currentTarget?.variablesAndSeries)
              _this.loadData = _this.cacheData // .splice(0, this.pageSize)
            }
          }, 0)
        } else {
          _this.loadData = []
        }
      },
      deep: true,
      immediate: true
    },
    currentTarget: {
      handler(newVal) {
        _this = this
        setTimeout(() => {
          //   _this.variablesAndSeriesOptions = _this.getVariablesAndSeriesOptions()
          if (_this.currentTarget?.variablesAndSeries) {
            _this.currentTarget?.variablesAndSeries.map((item: any, index: number) => {
              const findDeleteIndex = _this.variablesAndSeriesOptions.findIndex((find: any) => { return find.id === item.id })
              if (findDeleteIndex === -1) {
                _this.currentTarget?.variablesAndSeries.splice(index, 1)
                _this.saveUpdatedCurrentTargetToDB()
              }
            })
            _this.cacheData = clone(_this.currentTarget?.variablesAndSeries)
            _this.loadData = _this.cacheData // .splice(0, this.pageSize)
          }
        }, 0)
      },
      deep: true
    }
  }

}

function validateTargetSettings(currentTarget: Target): { result: boolean, errorMessage?: string } {
  for (const item of currentTarget.variablesAndSeries) {
    if (item.type === TargetVSItemType.variables) continue
    if (item.periodFrom > item.periodTo) {
      return { result: false, errorMessage: `序列${item.name}设置不合法，Period From的值应小于Period To的值` }
    } else if (item.periodOutputFrom > item.periodOutputTo) {
      return { result: false, errorMessage: `序列${item.name}设置不合法，Period Output From的值应小于Period Output To的值` }
    } else if (Math.abs(item.periodFrom) > 1440 ||
      Math.abs(item.periodTo) > 1440) {
      return { result: false, errorMessage: `序列${item.name}设置不合法，Period From和Period To的绝对值都应小于1440` }
    } else if (Math.abs(item.periodOutputFrom) > 1440 ||
      Math.abs(item.periodOutputTo) > 1440) {
      return { result: false, errorMessage: `序列${item.name}设置不合法，Period Output From和Period Output To的绝对值都应小于1440` }
    }
  }
  return { result: true }
}

export default currentTargetMixin

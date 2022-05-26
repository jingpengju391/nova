<template>
  <a-cascader
    class="cascader-box"
    :value="value"
    :options="linkOptions"
    placeholder="请选择目标链接"
    expand-trigger="hover"
    change-on-select
    @change="onTargetChange"
  >
    <template #displayRender="{ labels }">
      <span>{{ labels.join("->") }}</span>
    </template>
  </a-cascader>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { Model, ModelBlock, SimplifiedModelBlock } from '@shared/dataModelTypes'
import { Link } from '@shared/dataModelTypes/models/types'
import { LinkSource } from '@shared/dataModelTypes/models/helpers'

interface TargetLinkOption {
  value: string[]
  label: string
  loading?: boolean;
  isLeaf?: boolean;
  children?: TargetLinkOption[]
}

export default defineComponent({
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: {
      type: Array as PropType<String[]>,
      default: () => []
    },
    rootBlockId: {
      type: Number,
      required: true
    }
  },
  /** lazily loading link options */
  data() {
    return {
      linkOptions: [] as TargetLinkOption[]
    }
  },
  /**
   * This will initialize the first level link options
   * Options of following levels will be lazily generated through "loadLinkOptions" method
   */
  // created() {
  //   if (!this.rootBlockId) return

  //   const rootBlock = modelsDataSource.getCompleteModelBlock(this.rootBlockId)
  //   const options = [] as TargetLinkOption[]

  //   const allModelBlocks = modelsDataSource.getAllModelBlocksForAModel(rootBlock.modelId)
  //   const modelBlockNameMap = allModelBlocks.reduce((acc, cur) => {
  //     acc.set(cur.name, cur)
  //     return acc
  //   }, new Map<string, ModelBlock>())

  //   this.linkOptions = Object.values(rootBlock.links).filter(l => {
  //     return l.target && l.target.maskName && l.target.type && l.target.maskName !== rootBlock.name
  //   }).map(link => {
  //     const nextMask = modelBlockNameMap.get(link.target.maskName)
  //     const option = {
  //       value: link.name + '->' + nextMask.id,
  //       label: link.name,
  //       isLeaf: Object.values(nextMask.links).length <= 0
  //     }
  //     return option
  //   })
  // },
  computed: {
    value(): number[] {
      if (!this.rootBlockId) return []
      if (!this.modelValue) return []
      return this.modelValue
    },
    modelId(): number | undefined {
      if (!this.rootBlockId) return undefined
      const rootBlock = modelsDataSource.getCompleteModelBlock(this.rootBlockId)
      return rootBlock.modelId
    }
  },
  mounted() {
    setTimeout(() => {
      this.linkOptions = this.getLinkOptions()
    }, 0)
  },
  watch: {
    rootBlockId() {
      this.linkOptions = this.getLinkOptions()
    }
  },
  methods: {
    onTargetChange(value: number[]) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    getLinkOptions(): TargetLinkOption[] {
      const rootBlock = modelsDataSource.getCompleteModelBlock(this.rootBlockId)
      if (!rootBlock) return []
      const allModelBlocks = modelsDataSource.getAllModelBlocksForAModel(rootBlock.modelId)

      const modelBlockNameMap = allModelBlocks.reduce((acc, cur) => {
        acc.set(cur.name, cur)
        return acc
      }, new Map<string, SimplifiedModelBlock>())

      interface QueueElement {
        modelBlock: ModelBlock
        parentLinkOptions: TargetLinkOption[]
      }

      const linkOptions = [{
        value: 'entry' + '->' + rootBlock.id,
        label: rootBlock.name,
        children: []
      }] as TargetLinkOption[]
      const newParentLinkOptions = linkOptions[0].children
      const queue = [{
        modelBlock: rootBlock,
        parentLinkOptions: newParentLinkOptions,
        previousLinkedMaskNames: new Set<string>(),
        previousAllDefaultLinks: new Set<string>(),
        previousAllLinks: new Set<string>()
      }] as QueueElement[]
      const nextQueue = [] as QueueElement[]
      const linkQueue = [] as QueueElement[]
      let newPreviousLinkedMaskNames: Set<string> | undefined
      const previousAllDefaultLinks = new Set<string>()
      const previousAllLinks = new Set<string>()
      while (queue.length > 0) {
        const currentElement = queue.shift()!
        // const sameLevelLinkedMaskName = new Set<string>()
        newPreviousLinkedMaskNames = currentElement.previousLinkedMaskNames
        newPreviousLinkedMaskNames.add(currentElement.modelBlock.name)
        Object.values(currentElement.modelBlock.links).forEach(link => {
          linkQueue.push(link)
          if (!link.target || !link.target.maskName || !link.target.type) return
          if (newPreviousLinkedMaskNames.has(link.target.maskName)) return
          /* if (sameLevelLinkedMaskName.has(link.target.maskName)) {
            linkQueue.push(link.target.maskName + '::' + link.name)
            return
          } */
          if (link.source === LinkSource.default && previousAllDefaultLinks.has(link.target.maskName)) return
          if (previousAllLinks.has(link.target.maskName + '::' + link.name)) return
          // sameLevelLinkedMaskName.add(link.target.maskName)
          try {
            const newModelBlock = modelBlockNameMap.get(link.target.maskName)
            const currentLinkOption = {
              value: link.name + '->' + newModelBlock?.id,
              label: link.name,
              children: []
            }
            currentElement.parentLinkOptions.push(currentLinkOption)
            const newParentLinkOptions = currentLinkOption.children
            nextQueue.push({
              modelBlock: newModelBlock,
              parentLinkOptions: newParentLinkOptions,
              previousLinkedMaskNames: new Set<string>(newPreviousLinkedMaskNames),
              previousAllDefaultLinks: new Set<string>(previousAllDefaultLinks),
              previousAllLinks: new Set<string>(previousAllLinks)
            })
          } catch (e) {
            console.log(e, link, 'linkChainBroken')
          }
        })
        if (queue.length === 0) {
          while (nextQueue.length > 0) {
            const currentElement = nextQueue.shift()!
            if (currentElement.modelBlock) {
              queue.push(currentElement)
            }
          }
          while (linkQueue.length > 0) {
            const currentLink = linkQueue.shift()!
            if (currentLink.source === LinkSource.default) {
              previousAllDefaultLinks.add(currentLink.target?.maskName)
            }
            previousAllLinks.add(currentLink.target?.maskName + '::' + currentLink.name)
          }
        }
      }

      return linkOptions
    }
    /** lazily loading link options */
    // loadLinkOptions(selectedOptions: TargetLinkOption[]) {
    //   if (!this.modelId) return []
    //   const targetOption = selectedOptions[selectedOptions.length - 1]
    //   targetOption.loading = true
    //   const maskId = parseInt(targetOption.value.split('->')[1])
    //   const allModelBlocks = modelsDataSource.getAllModelBlocksForAModel(this.modelId)
    //   const modelBlockNameMap = allModelBlocks.reduce((acc, cur) => {
    //     acc.set(cur.name, cur)
    //     return acc
    //   }, new Map<string, ModelBlock>())

    //   const currentMask = modelsDataSource.getCompleteModelBlock(maskId)
    //   const allAncestorLinkedMaskName = new Set<string>([currentMask.name])
    //   selectedOptions.forEach(option => {
    //     const maskId = parseInt(option.value.split('->')[1])
    //     const mask = modelsDataSource.getCompleteModelBlock(maskId)
    //     allAncestorLinkedMaskName.add(mask.name)
    //   })
    //   targetOption.children = Object.values(currentMask.links).filter(l => {
    //     return l.target && l.target.maskName && l.target.type && !allAncestorLinkedMaskName.has(l.target.maskName)
    //   }).map(link => {
    //     const nextMask = modelBlockNameMap.get(link.target.maskName)
    //     const option = {
    //       value: link.name + '->' + nextMask.id,
    //       label: link.name,
    //       isLeaf: Object.values(nextMask.links).length <= 0
    //     }
    //     return option
    //   })
    //   this.linkOptions = [...this.linkOptions]
    //   targetOption.loading = false
    // }
  }
})
</script>

<template>
  <div class="reference-view">
    <mermaid-component
      :nodes="nodes"
      :config="config"
      type="graph LR"
      @nodeClick="editNode"
    />
  </div>
</template>

<script lang='ts'>
import { defineComponent, provide } from 'vue'
import MermaidComponent from './MermaidComponent.vue'
import defaultLanguageServer from '@/formulaLanguageServer'
import
PropertyFingerPrint,
{ LinkExpression, generatePropertyFingerPrintString, decodePropertyFingerPrintString, generateFullLinkChainWithoutBlockSelector }
  from '@/formulaLanguageServer/PropertyFingerPrint'
import type { Mask, Property } from '@shared/dataModelTypes'
import { createNamespacedHelpers } from 'vuex'
import { getPropertyType, debounce } from '@/utils'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import modelsDataSource from '@/store/modules/modelsDataSource'

const { mapState, mapActions } = createNamespacedHelpers('models/')

export default defineComponent({
  components: { MermaidComponent },
  data() {
    return {
      config: {
        flowchart: {
          width: '100%',
          useMaxWidth: false,
          diagramPadding: 1,
          entityPadding: 1,
          nodeSpacing: 20,
          rankSpacing: 100,
          height: '35px',
          curve: 'linear'
        }
      }
    }
  },
  inject: ['currentPropertyFP', 'updateCurrentPropertyFP'],
  computed: {
    ...mapState(['currentModelNode', 'currentProperty']),
    nodes() {
      if (!this.currentPropertyFP.data || this.currentModelNode === undefined || !this.currentModelNode.modelId) return []
      const currentPropertyFPWithoutLinkExpression = {
        ...this.currentPropertyFP.data,
        linkExpression: 'NA'
      }
      if (this.currentModelNode === undefined) return []
      const fpString = generatePropertyFingerPrintString(currentPropertyFPWithoutLinkExpression)
      const referredProperties = defaultLanguageServer.getReferredProperties(this.currentModelNode?.modelId, fpString)
      const referringProperties = defaultLanguageServer.getReferringProperties(this.currentModelNode?.modelId, fpString)

      const nodes = []
      referredProperties.forEach(referringFPString => {
        try {
          const referringPropertyFP = decodePropertyFingerPrintString(referringFPString)
          const blockName = modelsDataSource.getCompleteModelBlock(referringPropertyFP.blockId).name
          const nodeText = referringPropertyFP.propertyName + ' (' + blockName + ')'
          if (!referringPropertyFP) return
          if (this.currentPropertyFP.data.blockId === referringPropertyFP.blockId) {
            nodes.push({
              id: nodes.length,
              text: this.getNodeName(referringPropertyFP),
              // text: `"${nodeText}"`,
              editable: true,
              fpString: referringFPString
            })
          } else {
            nodes.push({
              id: nodes.length,
              // text: this.getNodeName(referringPropertyFP),
              text: `"${nodeText}"`,
              editable: true,
              fpString: referringFPString
            })
          }
        } catch (e) {
          console.log(e)
        }
      })
      const referringNodeIds = nodes.map(node => node.id)
      const currentNode = {
        id: nodes.length,
        text: this.getNodeName(this.currentPropertyFP.data),
        editable: true,
        next: referringNodeIds,
        fpString,
        style: 'stroke:#333,stroke-width:2px '
      }
      nodes.push(currentNode)
      referringProperties.forEach(referredFPString => {
        try {
          const referredPropertyFP = decodePropertyFingerPrintString(referredFPString)
          if (!referredPropertyFP) return
          const blockName = modelsDataSource.getCompleteModelBlock(referredPropertyFP.blockId).name
          const nodeText = referredPropertyFP.propertyName + ' (' + blockName + ')'
          nodes.push({
            id: nodes.length,
            /** has to be enclosed inside another double quotes to render the parenthesis */
            text: `"${nodeText}"`,
            editable: true,
            next: [currentNode.id],
            fpString: referredFPString
          })
        } catch (e) {
          console.log(e)
        }
      })
      return nodes
    }
  },
  watch: {
    currentProperty: {
      handler(newValue: Property) {
        if (!newValue) return
        let modelBlockId = this.currentModelNode.id
        const propertyType = getPropertyType(newValue)
        if (newValue.source === 'parent') {
          const modelBlock = modelsDataSource.getCompleteModelBlock(this.currentModelNode?.id)
          let parent = modelsDataSource.getCompleteModelBlock(modelBlock.parentId)
          let parentProperty = parent[propertyType][newValue.id]
          while (parentProperty.source === 'parent' && parent) {
            parent = modelsDataSource.getCompleteModelBlock(parent.parentId)
            parentProperty = parent[propertyType][parentProperty.id]
          }
          modelBlockId = parent.id
        }
        const newPropertyFP = new PropertyFingerPrint(
          newValue.id,
          newValue.name,
          getPropertyType(newValue),
          modelBlockId
        )
        this.updateCurrentPropertyFP(newPropertyFP)
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['selectProperty']),
    editNode(nodeId: number) {
      const node = this.nodes.find(node => node.id === +nodeId)
      if (!node) return
      debounce(() => {
        const nextPropertyFPString = node.fpString
        try {
          const nextPropertyFP = decodePropertyFingerPrintString(nextPropertyFPString)!
          this.updateCurrentPropertyFP(nextPropertyFP)

          this.selectProperty(
            {
              id: nextPropertyFP.propertyId,
              name: nextPropertyFP.propertyName,
              type: nextPropertyFP.propertyType,
              blockId: nextPropertyFP.blockId
            }
          )
        } catch (e) {
          console.log(e)
        }
      }, 200)()
    },
    getNodeName(fp: PropertyFingerPrint): string {
      return fp.linkExpression === 'NA'
        ? fp.propertyName
        : generateFullLinkChainWithoutBlockSelector(JSON.parse(fp.linkExpression) as LinkExpression[]) + fp.propertyName
    }
  }
})
</script>

<style lang='scss' scoped>
div {
  height: 100%;
  width: 100%;

  // overflow-y: scroll;
  border-bottom: 1px solid var(--nova-border-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  p {
    width: 100%;
    padding: 0px 20px;
    margin: 0;
  }
}
</style>

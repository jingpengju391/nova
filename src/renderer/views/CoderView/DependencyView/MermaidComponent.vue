<template>
  <div id="mermaid" class="mermaid">{{ parseCode }}</div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import mermaid from 'mermaid'
import { size } from 'lodash'

export default defineComponent({
  emits: ['nodeClick'],
  props: {
    type: {
      type: String,
      default: 'graph LR'
    },
    nodes: {
      type: Array,
      required: true
    },
    styles: {
      type: Array,
      default() {
        return []
      }
    },
    config: {
      type: Object,
      default() {
        return {}
      }
    },
    defaultConfig: {
      type: Object,
      default() {
        return {
          theme: 'default',
          startOnLoad: false,
          securityLevel: 'loose',
          flowchart: { width: '100%' }
        }
      }
    },
    stopOnError: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      edges: [
        { type: 'default', open: '[', close: ']' },
        { type: 'round', open: '(', close: ')' },
        { type: 'stadium', open: '([', close: '])' },
        { type: 'subroutine', open: '[[', close: ']]' },
        { type: 'cylindrical', open: '[(', close: ')]' },
        { type: 'circle', open: '((', close: '))' },
        { type: 'asymetric', open: '>', close: ']' },
        { type: 'rhombus', open: '{', close: '}' },
        { type: 'hexagon', open: '{{', close: '}}' },
        { type: 'parallelogram', open: '[/', close: '/]' },
        { type: 'parallelogram_alt', open: '[\\', close: '\\]' },
        { type: 'trapezoid', open: '[/', close: '\\]' },
        { type: 'trapezoid_alt', open: '[\\', close: '/]' }
      ]
    }
  },
  mounted() {
    this.init()
    this.loadNodes()
  },
  computed: {
    nodeObject() {
      const { nodes } = this
      if (Array.isArray(nodes) && nodes.length > 0) {
        const arrayToObject = (arr, keyField) =>
          Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))
        return arrayToObject(nodes, 'id')
      } else {
        return {}
      }
    },
    customStyle() {
      const { nodes, styles } = this
      const nodeStyles = nodes
        .filter(node => node.style)
        .map(node => `style ${node.id} ${node.style}`)
      const nodeLinkStyles = nodes
        .filter(node => node.linkStyle)
        .map(
          node =>
            `linkStyle ${node.linkNumber || nodes.indexOf(node)} ${node.linkStyle
            }`
        )
      return nodeStyles.concat(styles).concat(nodeLinkStyles)
    },
    parseCode() {
      const { nodes } = this
      if (Array.isArray(nodes) && nodes.length > 0) {
        const parseCode = this.type + '\n'
        const groupNodes = this.getGroupNodes(nodes)
        const code = parseCode + groupNodes + this.customStyle.join(' \n')
        this.load(code)
        return code
      } else {
        return ''
      }
    }
  },
  methods: {
    getGroupNodes(nodes) {
      const innerMap = new Map()
      nodes.forEach(element => {
        const group = element.group || ''
        const data = innerMap.get(group) || { nids: new Set(), narr: [] }
        data.nids.add(element.id)
        data.narr.push(element)
        innerMap.set(group, data)
      })
      return [...innerMap.entries()]
        .map(item => {
          const [groupName, entry] = item
          const { nids, narr } = entry
          if (groupName !== '') {
            const innerNodes = []
            const outNodes = []
            narr.forEach(node => {
              if (node.next) {
                innerNodes.push({
                  id: node.id,
                  text: node.text,
                  style: node.style,
                  editable: node.editable
                })
                node.next.forEach(id => {
                  if (nids.has(id)) {
                    innerNodes.push({
                      id: node.id,
                      text: node.text,
                      link: node.link,
                      next: [id]
                    })
                  } else {
                    outNodes.push({
                      id: node.id,
                      text: node.text,
                      link: node.link,
                      next: [id]
                    })
                  }
                })
              } else {
                innerNodes.push(node)
              }
            })
            const innerNodesStr = this.buildNodesStr(innerNodes)
            const outNodeStr = this.buildNodesStr(outNodes)
            return `subgraph ${groupName} \n ${innerNodesStr} end \n ${outNodeStr}`
          } else {
            const nodesStr = this.buildNodesStr(narr)
            return nodesStr
          }
        })
        .join(' \n')
    },
    buildNodesStr(nodes) {
      return (
        nodes
          .map(item => {
            if (item.next && item.next.length > 0) {
              return item.next
                .map((n, index) => {
                  const next = this.nodeObject[n] || this.nodeObject[n.id]
                  if (next !== null && typeof next !== 'undefined') {
                    return `${this.buildNode(item)}${this.buildLink(
                      item,
                      index
                    )}${this.buildNode(next)}`
                  } else {
                    // TODO error
                    return `${this.buildNode(item)}`
                  }
                })
                .join('\n')
            } else {
              return `${this.buildNode(item)}`
            }
          })
          .join('\n') +
        '\n' +
        nodes
          .filter(item => item.editable)
          .map(item => {
            return `click ${item.id} mermaidClick`
          })
          .join('\n') +
        '\n' +
        nodes
          .filter(item => item.url)
          .map(item => {
            return `click ${item.id} '${item.url}'`
          })
          .join('\n') +
        '\n'
      )
    },
    buildNode(item) {
      const edge = !item.edgeType
        ? this.edges.find(e => e.type === 'default')
        : this.edges.find(e => e.type === item.edgeType)
      return `${item.id}${edge.open}${item.text}${edge.close}`
    },
    buildLink(item, index) {
      const link = '-->'
      if (item.link) {
        if (Array.isArray(item.link)) {
          if (item.link.length > index) return item.link[index]
          else return item.link[item.link.length - 1]
        } else {
          return item.link
        }
      }
      return link
    },
    loadNodes() {
      this.load(this.parseCode)
    },
    init() {
      const _t = this
      window.mermaidClick = function (id) {
        _t.edit(id)
      }
      mermaid.initialize(Object.assign(this.defaultConfig, this.config))
    },
    load(code) {
      if (code) {
        this.$nextTick(() => {
          const container = document.getElementById('mermaid')
          if (container) {
            container.removeAttribute('data-processed')
            container.replaceChild(
              document.createTextNode(code),
              container.firstChild
            )
            try {
              mermaid.init(code, container)
              mermaid.flowchartConfig = {
                width: '100%',
                fontSize: '12px'
              }
            } catch (error) {
              if (this.stopOnError) {
                throw error
              }
            }
          }
        })
      }
    },
    edit(id) {
      this.$emit('nodeClick', id)
    }
  }
})
</script>

<style lang="scss" scoped>
#mermaid {
  width: 100%;
  border: none;
  text-align: center;
  overflow-y: scroll;
  z-index: inherit;
  padding: 20px;
  background: white;
  height: calc(100% - 22px);
  &:deep(svg[id^="mermaid-"]) {
    font-size: 12px;
    padding: 0;
  }
  &:deep(g[id^="flowchart-"]) {
    // height: 30px;
    // line-height: 20px;
  }
  &:deep(g.label) {
    // padding: 0;
    // height: 30px;
  }
  &:deep(rect[height]) {
    // height: 30px;
    // padding: 0;
  }
  g.label {
    height: 30px;
  }
}
</style>

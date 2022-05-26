import type { ContextMenuItemProps } from '@/views/components/ContextMenu/types'
import { SimplifiedProduct, Product } from '@shared/dataModelTypes/product/products'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ModelNavigationNode } from '@shared/dataModelTypes/models/models'
import { deleteMaster, copyMaster, deleteProduct, copyProduct, openMasterDialog } from '../config'
import store from '@/store'
export function getMasterNaviNodeContextMenuItems(id:string, node:SimplifiedProduct):ContextMenuItemProps[] {
  return [
    {
      title: '属性',
      shortCut: 'Ctrl+r',
      onClick: () => {}
    },
    {
      title: '复制',
      shortCut: 'Ctrl+c',
      onClick: () => copyMaster(id)
    },
    {
      title: '修改',
      shortCut: 'Ctrl+c',
      onClick: () => openMasterDialog()
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        ElMessageBox.confirm(`您确定删除master [ ${node.name} ] 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => deleteMaster(node.id)).catch(_ => {
          ElMessage({
            type: 'info',
            message: `已取消删除master [ ${node.name} ] `
          })
        })
      }
    }
  ]
}

export function getProductNaviNodeContextMenuItems(id:string, node:Product):ContextMenuItemProps[] {
  return [
    {
      title: '属性',
      shortCut: 'Ctrl+r',
      onClick: () => {}
    },
    {
      title: '复制',
      shortCut: 'Ctrl+c',
      onClick: () => copyProduct(id, node)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        ElMessageBox.confirm(`您确定删除product [ ${node.name} ] 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => deleteProduct(node.id))
      }
    }
  ]
}

export function getModelNaviNodeContextMenuItems(modelId: string, node: ModelNavigationNode): ContextMenuItemProps[] {
  return [
    {
      title: '属性',
      shortCut: 'Ctrl+r',
      onClick: () => store.dispatch('models/updateCurrentModelNodeWithModelNaviNode', node)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        ElMessageBox.confirm(`确定要删除模型 ${node.name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => store.dispatch('models/deleteModel', modelId).catch((err:any) => ElMessage.error(err.message)))
      }
    },
    {
      title: '清除模型临时文件',
      shortCut: '',
      onClick: () => {
        try {
          store.dispatch('models/removeModelTempFolder', modelId)
        } catch (err: any) {
          ElMessage.error(err.message)
        } finally {
          ElMessage('模型临时文件已清除')
        }
      }
    },
    {
      title: '清除所有临时文件',
      shortCut: '',
      onClick: () => {
        try {
          store.dispatch('models/removeTempFolder')
        } catch (err: any) {
          ElMessage.error(err.message)
        } finally {
          ElMessage('临时文件已清除')
        }
      }
    },
    {
      title: '编辑分类',
      shortCut: '',
      onClick: () => {
        // this.currentClassifyModelId = modelId
        // this.classifys = []
        // this.classifyList.map((item, index) => {
        //   if (item.modelId === modelId) {
        //     this.classifys.push(item)
        //   }
        // })
        // this.dialogTableVisible = true
      }
    }
  ]
}

export function getMaskNaviNodeContextMenuItems(maskId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
  return [
    {
      title: '属性',
      shortCut: 'Ctrl+r',
      onClick: () => store.dispatch('models/updateCurrentModelNodeWithModelNaviNode', node)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        ElMessageBox.confirm(`确定要删除Mask ${node.name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => store.dispatch('models/deleteMask', maskId)
          .then(_ => store.dispatch('models/updateBlockLinks', node))
          .catch((err: any) => ElMessage.error(err.message)))
      }
    }
  ]
}

export function getBlockNaviNodeContextMenuItems(blockId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
  return [
    {
      title: '属性',
      shortCut: 'Ctrl+r',
      onClick: () => store.dispatch('models/updateCurrentModelNodeWithModelNaviNode', node)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        ElMessageBox.confirm(`确定要删除Block ${node.name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => store.dispatch('models/deleteBlock', blockId)
          .catch((err: any) => ElMessage.error(err.message)))
      }
    }
  ]
}

export function getChildBlockNaviNodeContextMenuItems(blockId: number, node: ModelNavigationNode): ContextMenuItemProps[] {
  return [
    {
      title: '属性',
      shortCut: 'Ctrl+r',
      onClick: () => store.dispatch('models/updateCurrentModelNodeWithModelNaviNode', node)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        ElMessageBox.confirm(`确定要删除Block ${node.name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(_ => store.dispatch('models/deleteChildBlock', blockId)
          .catch((err: any) => ElMessage.error(err.message)))
      }
    }
  ]
}

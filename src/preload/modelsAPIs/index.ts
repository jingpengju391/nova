import { ipcRenderer } from 'electron'
import type { OpenDialogReturnValue } from 'electron'
import { readJSON, writeJSON } from 'fs-extra'
import type { ModelJSON, ModelBlockJSON, ModelBlock, Model } from '@shared/dataModelTypes'
import { ClassifyList } from '@shared/dataModelTypes/models/models'
import DBClient from '../../service/db/dbClient'
import os from 'os'
import fs from 'fs'
import {
  convertModelBlockJSONToModelBlock, convertModelBlocksToModelBlocksJSON,
  reformatBlockForDB, reformatProductForDB,
  convertModelQueryResultToModelArray, reformatModelJSONForModelDBInsertion,
  reformatModelForDB, iterateModelBlockInPreOrder, parseAModelBlockFromDBQuery,
  blockHeaderUpdated, blockFormulaUpdated, parseAProductFromDBQuery, parseAModelFromDBQuery,
  reformatBlockForDBCopy
} from './utils'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { convertToNumber } from '@shared/commonUtils'
import RCS, { RCSAddType } from '../rcs'
import { tupleExpression } from '@babel/types'
import { clone, omit } from '@shared/functional'
import { AnchorProduct, AnchorProductInterface, AnchorProductJson } from '@shared/dataModelTypes/product/products'
import { createBranch } from '../rcs/branches'
import path from 'path'
import config from '../../../package.json'
// const { sortBy, clone, omit, pick } = require('ramda')
// import dbService from '../../service/db/index'

const modelAPIs = {
  username: '',
  userSpace: '',
  // version: process.env.ARCHITECTURE !== 'bs' ? require('../package.json').version : require('../../package.json').version,
  version: config.version,
  async openFileDialog() {
    const result: OpenDialogReturnValue = await ipcRenderer.invoke('dialog:showOpenDialog', {
      properties: ['openFile'],
      filters: [{ name: '模型JSON文件', extensions: ['json'] }]
    })
    return { canceled: result.canceled, filePath: result.filePaths[0] }
  },
  // separate importModelJSON and openFileDialog into two functions to not block UI
  async importModelJSON(filePath: string): Promise<any> {
    if (filePath === undefined) {
      return null
    }
    const modelJSON: ModelJSON = await readJSON(filePath)
    return modelJSON
  },
  async export() {
    const result = await ipcRenderer.invoke('dialog:showSaveDialog', {
      title: '导出模型',
      defaultPath: 'Models_' + new Date().getTime(),
      buttonLabel: '导出',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (!result.canceled) {
      const filePath = result.filePath
      return { canceled: false, filePath }
    } else {
      return { canceled: true, filePath: null }
    }
  },
  async writeModelJSONFileToDisk(filePath: string, modelId: number) {
    const model = await modelAPIs.db.queryModelWithItsBlocks(modelId)
    const json = {
      version: modelAPIs.version,
      blocks: convertModelBlocksToModelBlocksJSON(model!.detailedChildren),
      // products: model?.anchorProducts, // todo Query Products to DB
      name: model?.name,
      rootBlockId: model?.rootBlockId
    }
    const modelConfigJson = {
      version: modelAPIs.version,
      name: model?.name,
      rootBlockId: model?.rootBlockId
    }
    await writeJSON(filePath, json, { spaces: '\t' })
    await writeJSON(path.join(path.dirname(filePath), path.basename(filePath, '.json') + '.config.json'), modelConfigJson, { spaces: '\t' })
  },
  async getModelCreator(): Promise<string> {
    if (process.env.ARCHITECTURE === 'bs') {
      return modelAPIs.username
    } else {
      return os.userInfo().username
    }
  },
  async readFileIndexPos(filePath: string, len: number, pos: number): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.open(filePath, 'r', (err, fd) => {
        if (err) return
        let buf = Buffer.alloc(len)
        fs.read(fd, buf, 0, len, pos, (err, bytesRead) => {
          if (err) return
          resolve(buf.toString())
          fs.close(fd, () => {
            //   console.log('关闭')
          })
        })
      })
    })
  },
  db: {
    async queryAllModelsOfWorkspace(workspaceId: number): Promise<Model[]> {
      const knex = DBClient.getInstance(modelAPIs.userSpace)
      const results = await knex('models').select(
        '*',
        knex.ref('models.id').as('modelId'),
        knex.ref('models.name').as('modelName'),
        knex.ref('models.rootBlockId').as('modelRootBlockId'),
        knex.ref('models.tags').as('modelTags'),
        knex.ref('models.isDateCenter').as('modelIsDateCenter'),
        knex.ref('models.dateAlignType').as('modelDateAlignType'),
        knex.ref('models.description').as('modelDescription')
      ).where({ 'models.workspaceId': workspaceId }
      ).leftJoin('blocks', 'models.id', 'blocks.modelId')
      const products = await modelAPIs.db.queryAllProduct(workspaceId)
      return convertModelQueryResultToModelArray(results, products)
      // return await dbService.queryAllModelsOfWorkspace(workspaceId)
    },
    async queryModel(modelId: number): Promise<Model | null> {
      const models = await modelAPIs.db.queryModels([modelId])
      return models.find(m => m.id === modelId) ?? null
    },
    async queryModels(modelIds: number[]): Promise<Model[]> {
      return DBClient.getInstance(modelAPIs.userSpace)('models').whereIn('id', modelIds)
        .select('*')
        .then(results => {
          return Promise.all(results.map(result => {
            return {
              ...result
            }
          }))
        })
    },
    async queryProduct(productId: number): Promise<AnchorProductInterface | null> {
      const models = await modelAPIs.db.queryProducts([productId])
      return models.find(m => m.id === productId) ?? null
    },
    async queryProducts(productIds: number[]): Promise<AnchorProductInterface[]> {
      return DBClient.getInstance(modelAPIs.userSpace)('products').whereIn('id', productIds)
        .select('*')
        .then(results => {
          return Promise.all(results.map(result => {
            return {
              ...result
            }
          }))
        })
    },
    async queryAllProduct(workspaceId: number): Promise<AnchorProductInterface[]> {
      return DBClient.getInstance(modelAPIs.userSpace)('products').select(
        '*'
      ).where({ 'products.workspaceId': workspaceId }
      ).then(results => {
        return Promise.all(results.map(result => {
          return parseAProductFromDBQuery(result)
        }))
      })
    },

    async queryAllProductByModel(modelId: number): Promise<AnchorProductInterface[]> {
      return DBClient.getInstance(modelAPIs.userSpace)('products').select(
        '*'
      ).where({ 'products.modelId': modelId }
      ).then(results => {
        return Promise.all(results.map(result => {
          return parseAProductFromDBQuery(result)
        }))
      })
    },
    async queryModelWithItsBlocks(modelId: number): Promise<Model | null> {
      const knex = DBClient.getInstance(modelAPIs.userSpace)
      const result = await knex('models').select(
        '*',
        knex.ref('models.id').as('modelId'),
        knex.ref('models.name').as('modelName'),
        knex.ref('models.rootBlockId').as('modelRootBlockId'),
        knex.ref('models.tags').as('modelTags'),
        knex.ref('models.description').as('modelDescription'),
        knex.ref('models.isDateCenter').as('modelIsDateCenter'),
        knex.ref('models.dateAlignType').as('modelDateAlignType')
      ).where({ 'models.id': modelId }
      ).leftJoin('blocks', 'models.id', 'blocks.modelId')
      // const products = await modelAPIs.db.queryAllProductByModel(modelId)
      const models = convertModelQueryResultToModelArray(result)
      return models.find(m => m.id === modelId) ?? null
    },
    async importModelJSON(modelJSON: ModelJSON): Promise<Model> {
      // all db manipulation should stay inside one transaction
      // insert a model first, then insert blocks
      await DBClient.getInstance(modelAPIs.userSpace)('models').where('name', modelJSON.name)
        .select('*').then(resu => {
          if (resu.length) {
            modelJSON.name = modelJSON.name + '_' + new Date().getTime()
          }
        })

      return await DBClient.getInstance(modelAPIs.userSpace).transaction(async trx => {
        const [newModelId]: number[] = await trx('models').insert({
          ...reformatModelJSONForModelDBInsertion(modelJSON),
          rootBlockId: null
        })
        // this is to ensure each parent mask or block get inserted before its children
        const allBlocksJSON: ModelBlockJSON[] = modelJSON.blocks.sort((a, b) => convertToNumber(a.id) - convertToNumber(b.id))
        // const allProductJson: AnchorProductInterface[] = modelJSON.products ? modelJSON.products.sort((a, b) => convertToNumber(a.id) - convertToNumber(b.id)) : []
        const allBlocks = allBlocksJSON.map(blockJSON =>
          convertModelBlockJSONToModelBlock(blockJSON, newModelId, modelJSON.workspaceId!)
        )
        // insert all blocks into db and replace their id with db's generated ids
        const jsonIdToDatabaseIdMap = new Map<string | number, number>()
        const jsonNameToDatabaseIdMap = new Map<string, number>()
        let newRootBlockId = 0
        for (const block of allBlocks) {
          if (block.parent?.id) {
            const parentDatabaseId = jsonIdToDatabaseIdMap.get(block.parent.id)
            if (!parentDatabaseId) {
              throw new Error(`invalid parentDatabaseId: ${block.parent.id}, block name: ${block.name}`)
            }
            block.parentId = parentDatabaseId
            block.parent.id = parentDatabaseId
          }
          const blockForDB = reformatBlockForDB(block)

          const [databaseID] = await trx('blocks').insert(blockForDB)
          if (!block.parent?.id) {
            jsonNameToDatabaseIdMap.set(block.name!, databaseID)
          } else {
            jsonNameToDatabaseIdMap.set(block.parent?.name + '::' + block.name!, databaseID)
          }
          jsonIdToDatabaseIdMap.set(block.id!, databaseID)
          if (block.id === modelJSON.rootBlockId) {
            await trx('models').where('id', newModelId).update({ rootBlockId: databaseID })
            newRootBlockId = databaseID
          }
          block.id = databaseID
          block.updatedAt = blockForDB.updatedAt
          block.updatedFormulaAt = blockForDB.updatedFormulaAt
          block.updatedHeaderAt = blockForDB.updatedPropertyAt
          block.updatedPropertyAt = blockForDB.updatedPropertyAt
        }
        for (let index = 0; index < allBlocks.length; index++) {
          const block = allBlocks[index]
          const links = Object.values(block.links)
          const linksJosn: any = {}
          if (links.length > 0) {
            for (const link of links) {
              const target = link.target
              if (target) {
                if (target.blockName && target.maskName) {
                  const databaseId = jsonNameToDatabaseIdMap.get(target.blockName + '::' + target.maskName)
                  if (!databaseId) {
                    //  throw new Error(`invalid link: ${link.name}, target name: ${link.target?.maskName}`)
                    console.log(`invalid link: ${link.name}, target name: ${target.maskName + '::' + link.target?.blockName}`)
                  } else {
                    target.id = databaseId
                  }
                  // target.id = databaseId
                } else if (target.maskName) {
                  const databaseId = jsonNameToDatabaseIdMap.get(target.maskName)
                  if (!databaseId) {
                    // throw new Error(`invalid link: ${link.name}, target name: ${link.target?.maskName}`)
                    console.log(`invalid link: ${link.name}, target name: ${link.target?.maskName}`)
                  } else {
                    target.id = databaseId
                  }
                }
              }
              linksJosn[link.id] = link
            }

            const fieldsToUpdate: any = {
              links: linksJosn
            }
            try {
              await trx('blocks').where('id', block.id).update(
                reformatBlockForDB(fieldsToUpdate, false, false))
            } catch (e) {
              console.log(e)
            }
          }
        }
        return {
          id: newModelId,
          name: modelJSON.name ?? 'Model_' + new Date().getTime(),
          tags: modelJSON.tags,
          description: modelJSON.description,
          rootBlockId: newRootBlockId,
          detailedChildren: allBlocks as any[],
          workspaceId: modelJSON.workspaceId
          // anchorProducts: allProductJson // todo import product direct to DB
        }
      })
    },
    /**
     *
     * @param modelBlock is the block to be inserted
     * @param maskId is the id of mask of this block. Use this to update mask to make conditional compiling working
     */
    async insertModelBlock(modelBlock: Partial<ModelBlock>, maskId?: number): Promise<number> {
      const [id] = await DBClient.getInstance(modelAPIs.userSpace)('blocks').insert(
        reformatBlockForDB(modelBlock)
      )
      if (maskId) {
        await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', maskId).update(reformatBlockForDB(undefined, true, true))
      }
      return id
    },
    async insertModelBlocks(modelBlocks: Partial<ModelBlock[]>, maskId?: number): Promise<number[]> {
      const ids: number[] = []
      await DBClient.getInstance(modelAPIs.username).transaction(async trx => {
        for (let i = 0; i < modelBlocks.length; i++) {
          const modelBlock = modelBlocks[i]
          const id = await trx('blocks').insert(reformatBlockForDB(modelBlock))
          ids.push(...id)
        }
      })
      if (maskId) {
        await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', maskId).update(reformatBlockForDB(undefined, true, true))
      }
      return ids
    },
    async insertProduct(product: Partial<AnchorProduct>): Promise<number> {
      const [id] = await DBClient.getInstance(modelAPIs.userSpace)('products').insert(
        reformatProductForDB(product)
      )
      return id
    },
    async queryModelBlock(modelBlockId: number): Promise<ModelBlock | null> {
      const modelBlocks = await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', modelBlockId).select('*')
      return modelBlocks.length > 0 ? parseAModelBlockFromDBQuery(modelBlocks[0]) : null
    },
    // TODO: update all usages of this api, so '@param fields' only contain the fields that need to be updated
    /**
     *
     * @param id
     * @param fields have to be an object with fields that only contains the columns defined in 'blocks' table
     * @param maskId is the id of mask of this block. Use this to update mask to make conditional compiling working
     * @param updatedFormula has formula updated
     * @returns {void}
     */
    async updateModelBlock(id: number, fields: Partial<ModelBlock>, maskId?: number, updatedFormula?: boolean, updatedHeader?: boolean): Promise<void> {
      // id: number, modelBlock: Partial<ModelBlock>, maskId?: number, formulaOnly?: boolean
      // for version control
      if (updatedFormula === undefined || updatedHeader === undefined) {
        const oldModelBlock = await modelAPIs.db.queryModelBlock(id)
        if (oldModelBlock) {
          updatedFormula = blockFormulaUpdated(oldModelBlock, fields)
          updatedHeader = blockHeaderUpdated(oldModelBlock, fields)
        } else {
          updatedFormula = true
          updatedHeader = true
        }
      }
      await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', id).update(
        reformatBlockForDB(fields, updatedFormula, updatedHeader)
      )
      if (maskId) {
        await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', maskId).update(reformatBlockForDB(undefined, updatedFormula, updatedHeader))
      }
      // for version control
      // const keys = [...Object.keys(fields), 'id', 'modelId']
      // oldModelBlock && await RCS.add(RCSAddType.modelBlocks, pick(keys, oldModelBlock))
    },
    async updateProduct(id: number, fields: Partial<AnchorProduct>): Promise<void> {
      // id: number, modelBlock: Partial<ModelBlock>, maskId?: number, formulaOnly?: boolean
      // for version control
      await DBClient.getInstance(modelAPIs.userSpace)('product').where('id', id).update(
        reformatProductForDB(fields)
      )
      // for version control
      // const keys = [...Object.keys(fields), 'id', 'modelId']
      // oldModelBlock && await RCS.add(RCSAddType.modelBlocks, pick(keys, oldModelBlock))
    },
    async updateModelBlocks(ids: number[], modelBlocks: Partial<ModelBlock[]>, updatedFormula?: boolean, updatedHeader?: boolean, maskId?:number): Promise<void> {
      // id: number, modelBlock: Partial<ModelBlock>, maskId?: number, formulaOnly?: boolean
      // for version control
      if (updatedFormula === undefined || updatedHeader === undefined) {
        const oldModelBlock = await modelAPIs.db.queryModelBlock(ids[0])
        if (oldModelBlock) {
          updatedFormula = blockFormulaUpdated(oldModelBlock, modelBlocks[0]!)
          updatedHeader = blockHeaderUpdated(oldModelBlock, modelBlocks[0]!)
        } else {
          updatedFormula = true
          updatedHeader = true
        }
      }
      await DBClient.getInstance(modelAPIs.userSpace).transaction(async trx => {
        if (modelBlocks !== undefined) {
          for (let i = 0; i < modelBlocks.length; i++) {
            const item = modelBlocks[i]!
            await trx('blocks')
              .where('id', ids[i])
              .update(reformatBlockForDB(item, updatedFormula, updatedHeader))
          }
        }
      })
      if (maskId) {
        await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', maskId).update(reformatBlockForDB(undefined, updatedFormula, updatedHeader))
      }
    },
    async updateProducts(ids: number[], products: Partial<AnchorProductInterface[]>, updatedFormula?: boolean, updatedHeader?: boolean): Promise<void> {
      const params = JSON.parse(JSON.stringify(products))
      return await DBClient.getInstance(modelAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          await trx('product')
            .where('id', ids[i])
            .update(reformatProductForDB(item))
        }
      })
    },
    async insertModel(model: Partial<Model>): Promise<number> {
      const [id] = await DBClient.getInstance(modelAPIs.userSpace)('models').insert(
        reformatModelForDB(model)
      )
      return id
    },
    async updateModelRootBlockId(modelId:number, rootBlockId:number | null): Promise<void> {
      return await DBClient.getInstance(modelAPIs.userSpace)('models')
        .where('id', modelId)
        .update({
          rootBlockId
        })
    },
    /**
     *
     * @param id
     * @param fields have to be an object with fields that only contains the columns defined in 'models' table
     * @returns {void}
     */
    // TODO: update all usages of this api, so '@param fields' only contain the fields that need to be updated
    async updateModel(id: number, fields: Partial<Model>): Promise<void> {
      // for version control
      // const oldModel = await modelAPIs.db.queryModel(id)
      await DBClient.getInstance(modelAPIs.userSpace)('models').where('id', id).update(reformatModelForDB(fields))
      // for version control
      // const keys = [...Object.keys(fields), 'id']
      // oldModel && await RCS.add(RCSAddType.models, pick(keys, oldModel))
    },

    async copyModel(modelToCopy: Model, newModelName: string, allModelBlocks: ModelBlock[]): Promise<Model> {
      const newModel: Model = clone(omit(['detailedChildren', 'anchorProducts'], modelToCopy))
      newModel.name = newModelName
      newModel.detailedChildren = []
      // newModel.anchorProducts = []
      await DBClient.getInstance(modelAPIs.userSpace).transaction(async trx => {
        // first copy the model
        const [newModelId]: number[] = await trx('models').insert(
          reformatModelForDB(newModel)
        )
        newModel.id = newModelId
        // then copy all blocks into db and
        // and update their parentId with db's generated new ids for their parents
        // the detailed children are sorted first, so parent model block will be copied first
        const originalIdToNewIdMap = new Map<number, number>()
        const originalPIdToNewPIdMap = new Map<number, number>()
        const allBlocks: ModelBlock[] = allModelBlocks.sort((a, b) => convertToNumber(a.id) - convertToNumber(b.id))
        // for (const product of products) {
        //   const newProduct: AnchorProductInterface = clone(product)
        //   newProduct.modelId = newModelId
        //   const productForDB = reformatProductForDB(newProduct)
        //   const [newProductID] = await trx('products').insert(productForDB)
        //   newProduct.id = newProductID
        //   // newModel.anchorProducts.push(newProduct)
        //   originalPIdToNewPIdMap.set(product.id, newProductID)
        // }
        for (const block of allBlocks) {
          let newParentId = null
          // let newProductId = null
          if (block.parentId) {
            newParentId = originalIdToNewIdMap.get(block.parentId)
            if (!newParentId) {
              throw new Error(`invalid parentDatabaseId: ${block.parentId}, block name: ${block.name}`)
            }
          }
          // if (block.productId !== undefined && block.productId !== null) {
          //   newProductId = originalPIdToNewPIdMap.get(block.productId)
          //   if (!newParentId) {
          //     throw new Error(`invalid productDatabaseId: ${block.productId}, block name: ${block.name}`)
          //   }
          // }
          // since the model name has been changed, the model block name do not need to be changed
          const newBlock = clone(omit(['detailedChildren'], block))
          newBlock.modelId = newModelId
          newBlock.parentId = newParentId
          // if (newBlock.productId !== undefined) newBlock.productId = newProductId
          const blockForDB = reformatBlockForDB(newBlock, true, true)
          try {
            const [newModelBlockID] = await trx('blocks').insert(blockForDB)
            newBlock.id = newModelBlockID
            newBlock.updatedAt = blockForDB.updatedAt
            newBlock.updatedFormulaAt = blockForDB.updatedFormulaAt
            newBlock.updatedHeaderAt = blockForDB.updatedHeaderAt
            newBlock.updatedPropertyAt = blockForDB.updatedPropertyAt
            newModel.detailedChildren.push(newBlock)
            originalIdToNewIdMap.set(block.id as number, newModelBlockID)
          } catch (err) {
            console.log(err)
          }
        }
      })
      return parseAModelFromDBQuery(newModel) as Model
    },
    async copyModelBlock(modelBlockToCopy: ModelBlock, names: string[], maskId?: number): Promise<ModelBlock[]> {
      // modelBlockArray are already sorted, so parent model block is guaranteed to be copied first
      let modelBlockArrayToCopy: string | any[]
      if (process.env.ARCHITECTURE === 'bs') {
        const bsModel = await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', modelBlockToCopy.id).select('*')
        const bsModel1 = await DBClient.getInstance(modelAPIs.userSpace).raw('with RECURSIVE cte as (select *  from blocks where parentId = ' + modelBlockToCopy.id + ' union all select a.* from blocks as a  join  cte on a.parentId=cte.id ) select * from cte')
        const tempSort = [...bsModel, ...bsModel1]
        const tempSortAfter = [] as ModelBlock[]
        const regPos = /^\d+(\.\d+)?$/
        for (let i = 0; i < names.length; i++) {
          for (let j = 0; j < tempSort.length; j++) {
            let namesLast = regPos.test(names[i].substring(names[i].length - 1, names[i].length)) ? names[i].substring(0, names[i].length - 1) : names[i]
            let bsLast = regPos.test(tempSort[j].name.substring(tempSort[j].name.length - 1, tempSort[j].name.length)) ? tempSort[j].name.substring(0, tempSort[j].name.length - 1) : tempSort[j].name
            if (namesLast === bsLast) {
              tempSortAfter.push(tempSort[j])
            }
          }
        }
        modelBlockArrayToCopy = tempSortAfter
      } else {
        modelBlockArrayToCopy = iterateModelBlockInPreOrder(modelBlockToCopy)
      }
      const modelBlockArrayToReturn = [] as ModelBlock[]
      await DBClient.getInstance(modelAPIs.userSpace).transaction(async trx => {
        const originalIdToNewIdMap = new Map<number, number>()
        for (let i = 0; i < modelBlockArrayToCopy.length; i++) {
          const block = modelBlockArrayToCopy[i]
          let newParentId = null
          if (block.parentId) {
            newParentId = originalIdToNewIdMap.get(block.parentId) ?? block.parentId
          }
          // the same model does not allow two model blocks have the same name
          const newBlock = clone(omit(['detailedChildren'], block))
          newBlock.name = names[i]
          newBlock.parentId = newParentId
          const blockForDB = (process.env.ARCHITECTURE === 'bs') ? reformatBlockForDBCopy(newBlock) : reformatBlockForDB(newBlock)
          if (blockForDB.name !== undefined && blockForDB.name !== null) {
            const [newModelBlockID] = await trx('blocks').insert(blockForDB)
            newBlock.id = newModelBlockID
            newBlock.updatedAt = blockForDB.updatedAt
            newBlock.updatedFormulaAt = blockForDB.updatedFormulaAt
            newBlock.updatedHeaderAt = blockForDB.updatedHeaderAt
            newBlock.updatedPropertyAt = blockForDB.updatedPropertyAt
            newBlock.tags = typeof newBlock.tags === 'string' ? JSON.parse(blockForDB.tags) : blockForDB.tags
            newBlock.variables = typeof newBlock.variables === 'string' ? JSON.parse(blockForDB.variables) : blockForDB.variables
            newBlock.series = typeof newBlock.series === 'string' ? JSON.parse(blockForDB.series) : blockForDB.series
            newBlock.links = typeof newBlock.links === 'string' ? JSON.parse(blockForDB.links) : blockForDB.links
            newBlock.methods = typeof newBlock.methods === 'string' ? JSON.parse(blockForDB.methods) : blockForDB.methods
            modelBlockArrayToReturn.push(newBlock)
            originalIdToNewIdMap.set(block.id as number, newModelBlockID)
          }
        }
      })
      if (maskId) {
        await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', maskId).update(reformatBlockForDB())
      }

      return modelBlockArrayToReturn
    },
    async deleteModel(id: number): Promise<void> {
      await DBClient.getInstance(modelAPIs.userSpace)('models').where('id', id).del()
    },
    async deleteProduct(id: number): Promise<void> {
      await DBClient.getInstance(modelAPIs.userSpace)('product').where('id', id).del()
    },
    /**
     * API for deletion of Mask, Block or Child Block
     * @param id
     * @param maskId is the id of mask of this block. Use this to update mask to make conditional compiling working
     */
    async deleteModelBlock(id: number, maskId?: number): Promise<void> {
      await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', id).del()
      if (maskId) {
        await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', maskId).update(reformatBlockForDB())
      }
    },
    async deleteModelBlocks(ids: number[]): Promise<void> {
      await DBClient.getInstance(modelAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < ids.length; i++) {
          await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', ids[i]).del()
        }
      })
    },
    async deleteProperty(id: string, type: PropertyType, block: ModelBlock, maskId?: number): Promise<void> {
      // delete block's property, then block's children properties, then block's grand children properties
      await DBClient.getInstance(modelAPIs.userSpace).transaction(async trx => {
        block.detailedChildren?.forEach(async childBlock => {
          childBlock.detailedChildren?.forEach(async grandChildBlock => {
            const newGrandChildBlockProperties = clone(grandChildBlock[type])
            delete newGrandChildBlockProperties[id]
            const timeUpdate = new Date().getTime()
            await trx('blocks').where('id', grandChildBlock.id).update({
              [type]: JSON.stringify(newGrandChildBlockProperties),
              updatedAt: timeUpdate,
              updatedPropertyAt: timeUpdate
            })
          })

          const newChildBlockProperties = clone(childBlock[type])
          delete newChildBlockProperties[id]
          const timeUpdate = new Date().getTime()
          await trx('blocks').where('id', childBlock.id).update({
            [type]: JSON.stringify(newChildBlockProperties),
            updatedAt: timeUpdate,
            updatedPropertyAt: timeUpdate
          })
        })
        const newModelBlockProperties = clone(block[type])
        delete newModelBlockProperties[id]
        const timeUpdate = new Date().getTime()
        await trx('blocks').where('id', block.id).update({
          [type]: JSON.stringify(newModelBlockProperties),
          updatedAt: timeUpdate,
          updatedPropertyAt: timeUpdate
        })
      })
      if (maskId) {
        await DBClient.getInstance(modelAPIs.userSpace)('blocks').where('id', maskId).update(reformatBlockForDB())
      }
    },
    async insertModelsClassifyListToDB(workspaceId: number, ClassifyList: ClassifyList[]) {
      var ta = clone(ClassifyList)
      return await DBClient.getInstance(modelAPIs.userSpace)('models').where('id', workspaceId).update({
        classifyList: JSON.stringify(ClassifyList)
      })
    },
    async queryAllClassifyListFromDB(workspaceId: number) {
      return DBClient.getInstance(modelAPIs.userSpace)('models').where('workspaceId', workspaceId)
        .select('classifyList')
        .then((results: { classifyList: string }[]) => {
          return results.map(item => item.classifyList)
            .filter(item => item)
            .map(classifyListString => JSON.parse(classifyListString))
        })
    }
  }
}

export default modelAPIs

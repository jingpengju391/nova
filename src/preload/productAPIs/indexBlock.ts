import DBClient from '../../service/db/dbClient'
import { CodeIndex, IndexBlock } from '@shared/dataModelTypes/product/indicators'
import { ObjectSerialize } from './utils'
import { omit } from '@shared/functional'
const IndexBlockApis = {
  userSpace: '',
  db: {
    async insertIndexBlock(indexBlocks:IndexBlock[]): Promise<any> {
      let result:number[] = []
      const params = JSON.parse(JSON.stringify(indexBlocks))
      await DBClient.getInstance(IndexBlockApis.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = omit(['id'], params[i])
          const ids = await trx('indexBlock').insert(ObjectSerialize(item))
          result = [...result, ...ids]
        }
      })
      return result
    },
    async deleteIndexBlocksById(ids:number[]) {
      return await DBClient.getInstance(IndexBlockApis.userSpace)('indexBlock')
        .whereIn('id', ids)
        .delete()
    },
    async updateIndexBlocksById(indexBlocks:Partial<IndexBlock>[]) {
      const params = JSON.parse(JSON.stringify(indexBlocks))
      return await DBClient.getInstance(IndexBlockApis.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const id = params[i].id
          const item = omit(['id'], params[i])
          await trx('indexBlock')
            .where('id', id)
            .update(ObjectSerialize(item))
        }
      })
    },
    async queryAllIndexBlocksOfWorkspace(workspaceId: number) {
      return await DBClient.getInstance(IndexBlockApis.userSpace)('indexBlock')
        .where('workspaceID', workspaceId)
        .select('*')
    },
    async queryIndexBlockById(id:string) {
      return await DBClient.getInstance(IndexBlockApis.userSpace)('indexBlock')
        .where('id', id)
        .select('*')
    },
    async queryIndexBlockByModelId(modelIds:number[]) {
      return await DBClient.getInstance(IndexBlockApis.userSpace)('indexBlock')
        .whereIn('modelId', modelIds)
        .select('*')
    }
  }
}

export default IndexBlockApis

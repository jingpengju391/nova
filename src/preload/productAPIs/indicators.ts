import DBClient from '../../service/db/dbClient'
import { CodeIndex } from '@shared/dataModelTypes/product/indicators'
import { omit } from '@shared/functional'
const IndicatorsApis = {
  userSpace: '',
  db: {
    async insertCodeIndexes(codeIndex:CodeIndex): Promise<any> {
      const param = omit(['id'], codeIndex)
      return DBClient.getInstance(IndicatorsApis.userSpace)('codeIndex').insert(param).then(([id]: any) => id)
    },
    async importCodeIndexes(codeIndexes:CodeIndex[]): Promise<{ids:number[], updatedAt:number}> {
      const updatedAt = new Date().getTime()
      return await DBClient.getInstance(IndicatorsApis.userSpace).transaction(async trx => {
        const r = []
        for (let i = 0; i < codeIndexes.length; i++) {
          const item = omit(['id'], {
            ...codeIndexes[i],
            updatedAt: codeIndexes[i]?.updatedAt ? codeIndexes[i].updatedAt : updatedAt
          })
          const [id] = await trx('codeIndex').insert(item)
          r.push(id)
        }
        return {
          ids: r,
          updatedAt
        }
      })
    },
    async deleteCodeIndexesById(ids:number[]) {
      return await DBClient.getInstance(IndicatorsApis.userSpace)('codeIndex')
        .whereIn('id', ids)
        .delete()
    },
    async updateCodeIndexById(codeIndex:Partial<CodeIndex>) {
      const params = JSON.parse(JSON.stringify(codeIndex))
      return DBClient.getInstance(IndicatorsApis.userSpace)('codeIndex')
        .where('id', params.id)
        .update(params)
    },
    async updateCodeIndexes(codeIndexes:Partial<CodeIndex[]>) {
      const params = JSON.parse(JSON.stringify(codeIndexes))
      return await DBClient.getInstance(IndicatorsApis.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          await trx('codeIndex')
            .where('id', item.id)
            .update({
              chooseIf: item.chooseIf,
              abandonIf: item.abandonIf,
              updatedAt: item.updatedAt
            })
        }
      })
    },
    async queryAllCodeIndexesOfWorkspace(workspaceId: number) {
      return await DBClient.getInstance(IndicatorsApis.userSpace)('codeIndex')
        .where('workspaceID', workspaceId)
        .select('*')
    },
    async queryCodeIndexById(id:string) {
      return await DBClient.getInstance(IndicatorsApis.userSpace)('codeIndex')
        .where('id', id)
        .select('*')
    },
    async queryCodeIndexesByModelId(modelId:number) {
      return await DBClient.getInstance(IndicatorsApis.userSpace)('codeIndex')
        .where('modelId', modelId)
        .select('*')
    },
    async queryCodeIndexesByCodeIndexId(codeIndexId:number) {
      const result = await DBClient.getInstance(IndicatorsApis.userSpace)('codeIndex')
        .where('id', codeIndexId)
        .select('*')
      return result[0]
    }
  }
}

export default IndicatorsApis

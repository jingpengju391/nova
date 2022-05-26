import type { Output } from '@shared/dataModelTypes/runs/outputs'
import DBClient from '../../service/db/dbClient'
import { reformatOutputForDB, parseAnOutputFromDBQueryResult } from './utils'

let outputsAPIs = {
  userSpace: '',
  db: {
    async queryAllOutputsOfWorkspace(workspaceId: number): Promise<Output[]> {
      return DBClient.getInstance(outputsAPIs.userSpace)('outputs').where('workspaceId', workspaceId)
        .select('*')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseAnOutputFromDBQueryResult(result)
          }))
        })
    },
    async queryOutputs(outputIds: number[]): Promise<Output[]> {
      return DBClient.getInstance(outputsAPIs.userSpace)('outputs').whereIn('id', outputIds)
        .select('*')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseAnOutputFromDBQueryResult(result)
          }))
        })
    },
    async insertOutput(output: Partial<Output>): Promise<number> {
      const [id] = await DBClient.getInstance(outputsAPIs.userSpace)('outputs').insert(
        reformatOutputForDB(output)
      )
      return id
    },
    async updateOutput(id: number, fields: Partial<Output>): Promise<void> {
      await DBClient.getInstance(outputsAPIs.userSpace)('outputs').where('id', id).update(
        reformatOutputForDB(fields)
      )
    },
    async deleteOutput(id: number): Promise<void> {
      await DBClient.getInstance(outputsAPIs.userSpace)('outputs').where('id', id).del()
    },
    async updateOutputs(fields: Partial<Output>) {}
  }
}

export default outputsAPIs

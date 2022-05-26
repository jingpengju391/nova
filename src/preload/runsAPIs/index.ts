import type { Target, CpuContrast } from '@shared/dataModelTypes/runs/targets'
import DBClient from '../../service/db/dbClient'
import {
  reformatTargetForDB, parseATargetFromDBQueryResult,
  reformatRunnerForDB, parseARunnerFromDBQueryResult,
  reformatProjectionForDB, parseAProjectionFromDBQueryResult, parseQueueFromDBQueryResult, parseQueueFromDBQueryResult1, reformatQueueForDB, parseCpuContrastResult
} from './utils'
import { Runner } from '@shared/dataModelTypes/runs/runners'
import { Projection, Queue } from '@shared/dataModelTypes/runs/projections'
import { ipcRenderer } from 'electron'
let runsAPIs = {
  userSpace: '',
  username: '',
  db: {
    async queryAllTargetsOfWorkspace(workspaceId: number): Promise<Target[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('targets').where('workspaceId', workspaceId)
        .select('*')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseATargetFromDBQueryResult(result)
          }))
        })
    },
    async queryTargets(targetIds: number[]): Promise<Target[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('targets').whereIn('id', targetIds)
        .select('*')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseATargetFromDBQueryResult(result)
          }))
        })
    },
    async insertTarget(target: Partial<Target>): Promise<number> {
      const [id] = await DBClient.getInstance(runsAPIs.userSpace)('targets').insert(
        reformatTargetForDB(target)
      )
      return id
    },
    async updateTarget(id: number, fields: Partial<Target>): Promise<void> {
      await DBClient.getInstance(runsAPIs.userSpace)('targets').where('id', id).update(
        reformatTargetForDB(fields)
      )
    },
    async deleteTarget(id: number): Promise<void> {
      await DBClient.getInstance(runsAPIs.userSpace)('targets').where('id', id).del()
    },
    async queryAllRunnersOfWorkspace(workspaceId: number): Promise<Runner[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('runners').where('workspaceId', workspaceId)
        .select('*')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseARunnerFromDBQueryResult(result)
          }))
        })
    },
    async queryAllRunnersOfModel(modelId: number): Promise<Runner[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('runners').where('modelId', modelId)
        .select('*')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseARunnerFromDBQueryResult(result)
          }))
        })
    },
    async queryRunner(runnerId: number): Promise<Runner | null> {
      const runners = await this.queryRunners([runnerId])
      return runners.find(r => r.id === runnerId) ?? null
    },
    async queryRunners(runnerIds: number[]): Promise<Runner[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('runners').whereIn('id', runnerIds)
        .select('*')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseARunnerFromDBQueryResult(result)
          }))
        })
    },
    async insertRunner(runner: Partial<Runner>): Promise<number> {
      const [id] = await DBClient.getInstance(runsAPIs.userSpace)('runners').insert(
        reformatRunnerForDB(runner)
      )
      return id
    },
    async updateRunner(id: number, fields: Partial<Runner>): Promise<void> {
      await DBClient.getInstance(runsAPIs.userSpace)('runners').where('id', id).update(
        reformatRunnerForDB(fields)
      )
    },
    async deleteRunner(id: number): Promise<void> {
      await DBClient.getInstance(runsAPIs.userSpace)('runners').where('id', id).del()
    },
    async queryAllProjectionsOfWorkspace(workspaceId: number): Promise<Projection[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('projections').where('workspaceId', workspaceId)
        .select('*')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseAProjectionFromDBQueryResult(result)
          }))
        })
    },
    async queryProjection(projectionId: number): Promise<Projection | null> {
      const projections = await this.queryProjections([projectionId])
      return projections.find(p => p.id === projectionId) ?? null
    },
    async queryProjections(projectionIds: number[]): Promise<Projection[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('projections').whereIn('id', projectionIds)
        .select('*')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseAProjectionFromDBQueryResult(result)
          }))
        })
    },
    async insertProjection(projection: Partial<Projection>): Promise<number> {
      const [id] = await DBClient.getInstance(runsAPIs.userSpace)('projections').insert(
        reformatProjectionForDB(projection)
      )
      return id
    },
    async updateProjection(id: number, fields: Partial<Projection>): Promise<void> {
      await DBClient.getInstance(runsAPIs.userSpace)('projections').where('id', id).update(
        reformatProjectionForDB(fields)
      )
    },
    async deleteProjection(id: number): Promise<void> {
      await DBClient.getInstance(runsAPIs.userSpace)('projections').where('id', id).del()
      await DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').where('projectionId', id).del()
    },
    async queryQueueRunner(queueRunnerId: number): Promise<Queue | null> {
      const runners = await this.queryQueueRunners([queueRunnerId])
      return runners.find(r => r.id === queueRunnerId) ?? null
    },
    async queryQueueRunners(queueRunnerIds: number[]): Promise<Queue[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').whereIn('id', queueRunnerIds)
        .select('*')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseQueueFromDBQueryResult1(result)
          }))
        })
    },
    async insertQueueRunner(queueRunner: Partial<Queue>): Promise<number> {
      const [id] = await DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').insert(
        reformatQueueForDB(queueRunner)
      )
      return id
    },
    async updateQueueRunner(id: number, fields: Partial<Queue>): Promise<void> {
      console.log(id)
      await DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').where('id', id).update(reformatQueueForDB(fields))
    },
    async queryProjectionQueues(workspaceId: number, projectionId: number, mode: string, parentId: number): Promise<Queue[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').where({ workspaceId: workspaceId, projectionId: projectionId, mode: mode, parentId: parentId })
        .select('*')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseQueueFromDBQueryResult(result)
          }))
        })
    },
    async queryAllProjectionQueues(workspaceId: number): Promise<Queue[]> {
      return DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').where({ workspaceId: workspaceId })
        .select('*')
        .then(results => {
          return Promise.all(results.map(result => {
            return parseQueueFromDBQueryResult(result)
          }))
        })
    },
    async deleteQueueRunnerItem(ids: number[]): Promise<void> {
      ids.map(async (id) => {
        await DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').where('id', id).del()
      })
    },
    async queryCpusFromDB(id: number): Promise<CpuContrast> {
      const original = await DBClient.getInstance(runsAPIs.userSpace)('projections').where('id', id).select('*')
        .then(async (results) => {
          let sum = 0
          await Promise.all(results.map(async (result) => {
            const projection = parseAProjectionFromDBQueryResult(result)
            const column = projection.runQueueSelections[0]

            for (let i = 0; i < column.length; i++) {
              const { multiThreadNumber } = await DBClient.getInstance(runsAPIs.userSpace)('projectionqueue').where({ id: column[i] })
                .select('multiThreadNumber')
                .then(result => {
                  return result[0]
                })
              sum += multiThreadNumber
            }
          }))
          return sum
        })
      let target
      if (process.env.ARCHITECTURE === 'bs') {
        target = require('../../service/process').queryCpus()
      } else {
        target = ipcRenderer.sendSync('app:queryCpus') as number
      }
      return parseCpuContrastResult(original, target)
    }
  }
}

export default runsAPIs

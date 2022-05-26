import UserDBClient from '../../service/db/userDbClient'
import { AppSettings, TaskSettings, RunnerSettings } from '@shared/dataModelTypes/appSettings'
import { parseARunnerDoc, parseTaskDoc } from './utils'

let settingsAPIS = {
  app: {
    async update(fields: Partial<AppSettings>, userName: string = ''): Promise<number> {
      return await UserDBClient.getInstance()('app').where({ name: 'default', userName }).update({
        ...fields
      })
    },

    async query(userName: string = ''): Promise<AppSettings> {
      let docs = await UserDBClient.getInstance()('app').where({ name: 'default', userName }).select('*')
      return docs[0]
    },

    async insert(fields: AppSettings): Promise<void> {
      await UserDBClient.getInstance()('app').insert({
        ...fields
      })
    }
  },

  task: {
    async update(fields: Partial<TaskSettings>, userName: string = ''): Promise<number> {
      return await UserDBClient.getInstance()('tasks').where({ name: 'default', userName }).update({
        ...fields
      })
    },

    async query(userName: string = ''): Promise<TaskSettings> {
      let docs = await UserDBClient.getInstance()('tasks').where({ name: 'default', userName }).select('*')
      parseTaskDoc(docs[0])
      return docs[0]
    },

    async insert(fields: TaskSettings): Promise<void> {
      await UserDBClient.getInstance()('tasks').insert({
        ...fields
      })
    }
  },

  runner: {
    async update(fields: Partial<RunnerSettings>, userName: string = ''): Promise<number> {
      return await UserDBClient.getInstance()('runners').where({ name: 'default', userName }).update({
        ...fields
      })
    },

    async query(userName: string = ''): Promise<RunnerSettings> {
      let docs = await UserDBClient.getInstance()('runners').where({ name: 'default', userName }).select('*')
      let defaultDoc = docs[0]
      parseARunnerDoc(defaultDoc)
      return defaultDoc
    },

    async insert(fields: RunnerSettings): Promise<void> {
      await UserDBClient.getInstance()('runners').insert({
        ...fields
      })
    }
  },
  async insertDefaultSettings(userName: string): Promise<void> {
    await this.app.insert(new AppSettings(userName))
    await this.task.insert(new TaskSettings(userName))
    await this.runner.insert(new RunnerSettings(userName))
  }
}

export default settingsAPIS

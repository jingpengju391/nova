import settingsAPIs from '../../preload/settingsAPIs'

class Settings {
  async updateAppSettings(ctx: any): Promise<void> {
    let username = ctx.session.username
    let { fields } = ctx.request.body
    await settingsAPIs.app.update(fields, username)
    ctx.body = {
      status: 200
    }
  }

  async queryAppSettings(ctx: any): Promise<void> {
    let username = ctx.session.username
    let data = await settingsAPIs.app.query(username)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateTaskSettings(ctx: any): Promise<void> {
    let username = ctx.session.username
    let { fields } = ctx.request.body
    await settingsAPIs.task.update(fields, username)
    ctx.body = {
      status: 200
    }
  }

  async queryTaskSettings(ctx: any): Promise<void> {
    let username = ctx.session.username
    let data = await settingsAPIs.task.query(username)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateRunnerSettings(ctx: any): Promise<void> {
    let username = ctx.session.username
    let { fields } = ctx.request.body
    await settingsAPIs.runner.update(fields, username)
    ctx.body = {
      status: 200
    }
  }

  async queryRunnerSettings(ctx: any): Promise<void> {
    let username = ctx.session.username
    let data = await settingsAPIs.runner.query(username)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new Settings()

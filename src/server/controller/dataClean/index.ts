import dataCleanAPIs from '../../../preload/dataCleanAPIs'

class DataClean {
  async run(ctx: any) {
    const userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataCleanAPIs.run(userSpace)
    if (data) {
      ctx.body = {
        data,
        msg: '开始清洗',
        status: 200
      }
    }
  }
}

export default new DataClean()

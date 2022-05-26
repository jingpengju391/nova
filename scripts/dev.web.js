process.env.NODE_ENV = 'development'
const { join, resolve } = require('path')
const { createServer } = require('vite')
const { createServer: createSocketServer } = require('net')

async function startRenderer() {
  const config = require('./vite.config')
  console.log(config)
  // config.proxy = {
  //   '/get-apis': {
  //     target: 'http://127.0.0.1:3000',
  //     changeOrigin: true,
  //     // rewrite: path => path.replace(/^\/lsbdb/, '')
  //   }
  config.mode = process.env.NODE_ENV

  const server = await createServer(config)
  return server.listen(8080)
}
async function main() {
  await startRenderer()
}
main()

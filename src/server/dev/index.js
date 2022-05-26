const { run } = require('runjs')
async function runDev() {
  await run('npm run server:pre', { async: true }).then((data) => {
    console.log('server开始执行')
    run(`npm run server`, { cwd: `mock` })
    console.log('mock可能执行完毕')
  }).catch(e=>{
    console.log('npm run server:pre出错')
    run(`npm run server`, { cwd: `mock` })
  })
}
runDev()

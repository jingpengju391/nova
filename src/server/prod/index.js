var sys = require('util')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) { sys.puts(stdout) }
exec("npm run server:pre", function(err, stdout, stderr) {
  console.log('err:',err)
  console.log('stdout:',stdout)
  console.log('stderr:',stderr)
  console.log('npm run server:pre执行完了');
  exec("npm run server:run", function(err, stdout, stderr) {
    console.log('err:',err)
    console.log('stdout:',stdout)
    console.log('stderr:',stderr)
    console.log('npm run server:run执行完了');

  })
})


// const { run } = require('runjs')
// async function runDev() {
//   await run('npm run server:pre', { async: true }).then((data) => {
//     console.log('server开始执行')
//     run(`npm run server`, { cwd: `mock` })
//     console.log('mock可能执行完毕')
//   }).catch(e=>{
//     console.log('npm run server:pre出错')
//     run(`npm run server:run`, { cwd: `mock` })
//   })
// }
// runDev()

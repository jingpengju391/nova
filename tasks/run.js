const parseArgs = require('minimist')
const { outputLine, outputErrLine } = require('./utils')
const { spawn } = require('child_process')
const { join } = require('path')

main(process.argv.slice(2))

function main(args) {
  const {
    _: [projectionDirPath],
    m: modelName,
    r: runnerName
  } = parseArgs(args)
  const binaryPath = process.platform === 'win32'
    ? modelName + '.exe'
    : './' + modelName
  outputLine('Running' + binaryPath)
  try {
    // const child = exec(`"${binaryPath}"` + ' ' + runnerName + '.json', { cwd: projectionDirPath, stdio: [0, 1, 2] }, (error, stdout, stderr) => {
    // // const { stdout, stderr, pid } = exec(`"${binaryPath}"` + ' ' + runnerName + '.json', { cwd: projectionDirPath, stdio: [0, 1, 2] }, (error, stdout, stderr) => {
    //   if (error) {
    //     // outputErrLine(error)
    //     outputErrLine('exit with error')
    //     process.exit(2)
    //   }
    // })
    let cmd = [runnerName + '.json']
    // const { stdout, stderr } = execFile(binaryPath, cmd, { stdio: [0, 1, 2] }, (error, stdout, stderr) => {
    //   if (error) {
    //     outputErrLine('exit with error')
    //     process.exit(2)
    //   }
    // })
    process.chdir(projectionDirPath)
    const child = spawn(binaryPath, cmd, { cwd: projectionDirPath })
    child.on('error', err => {
      outputErrLine(err)
    })
    child.on('close', (code) => {
      process.stdout.write(stdString)
      if (stdStringErr.length > 0) {
        process.stdout.write(stdStringErr)
      }
      if (code !== 0 && code !== -2 && code !== 254) {
        outputErrLine('exit code[', code, '] with error')
        process.exit(code)
      } else {
        process.exit(code)
      }
    })
    // child.stdout.pipe(process.stdout)
    // child.stderr.pipe(process.stderr)
    const gap = 500
    let start = Date.now()
    let stdString = ''
    child.stdout.on('data', buf => {
      let end = Date.now()
      stdString += buf.toString()
      if (end - start > gap) {
        process.stdout.write(stdString)
        stdString = ''
        start = end
      }
    })
    let startErr = Date.now()
    let stdStringErr = ''
    child.stderr.on('data', buf => {
      let endErr = Date.now()
      stdStringErr += buf.toString()
      if (endErr - startErr > gap) {
        process.stderr.write(stdStringErr)
        stdStringErr = ''
        startErr = endErr
      }
    })
  } catch (e) {
    outputErrLine('exit with error')
    // outputErrLine(e)

    process.exit(2)
  }
}

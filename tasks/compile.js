const { join } = require('path')
const { readFileSync, ensureDirSync, existsSync, statSync, writeFileSync, copySync } = require('fs-extra')
const parseArgs = require('minimist')
const { spawn } = require('child_process')

const ejs = require('ejs')
const { outputLine, outputErrLine } = require('./utils')

main(process.argv.slice(2))

function main(args) {
  const {
    m: modelName,
    _: [compileTempOutputPath],
    c: commandTaskPath,
    p: projectionOutputPath,
    t: threadNum
  } = parseArgs(args)
  if (!compileTempOutputPath || !commandTaskPath || !projectionOutputPath) process.exit(1)
  try {
    compile(modelName, compileTempOutputPath, commandTaskPath, projectionOutputPath, threadNum)
  } catch (e) {
    console.error(e.name + ': ' + e.message)
    process.exit(2)
    // outputErrLine('exit with error')
  }
}

function compile(modelName, compileTempOutputPath, commandTaskPath, projectionOutputPath, threadNum) {
  const modelJSONPath = join(compileTempOutputPath, 'model.json')
  const modelJSON = readFileSync(modelJSONPath, 'utf-8')
  const define = JSON.parse(modelJSON)

  // outputLine('start generating cpp files')
  const cppOutputsPath = join(compileTempOutputPath, 'jinShaJiang/Model')
  ensureDirSync(cppOutputsPath)
  let recompile = false
  const needRecompileAllBlocks = compileMain(define, cppOutputsPath)
  for (let index = 0; index < define.blocks.length; index++) {
    const block = define.blocks[index]
    if (!block.parent.id || !block.parent.name) {
      const blockDefine = {
        modelName: modelName,
        version: define.version,
        blocks: [block],
        wholeBlocks: define.blocks,
        constants: define.globalConstants,
        projections: define.projections
      }
      recompile = compileProjection(blockDefine, cppOutputsPath, needRecompileAllBlocks) === true ? true : recompile
    }
  }
  // outputLine('start generating makefile')
  const makefilePath = join(compileTempOutputPath, 'makefile')
  const commandBinariesPath = join(commandTaskPath, 'mingw64', 'bin')
  if (needRecompileAllBlocks || !existsSync(makefilePath)) {
    const cxxPath = 'g++'
    generateMakefile(modelName, define.blocks, makefilePath, compileTempOutputPath, cxxPath)
  }
  // outputLine('start compiling files')
  makeProjection(modelName, compileTempOutputPath, commandBinariesPath, projectionOutputPath, true, threadNum)
}

function compileProjection(blockDefine, cppOutputsPath, needRecompileAllBlocks) {
  // 需要模板替换的cpp列表
  let file = 'Definitions.hpp.tpl'
  let target = blockDefine.blocks[0].name + file.replace(/\.[^.]+$/, '') // remove last ext
  let targetPath = join(cppOutputsPath, target)
  let recompile = false
  if (needRecompileAllBlocks || !existsSync(targetPath) ||
    statSync(targetPath).mtimeMs < blockDefine.blocks[0].updatedHeaderAt) {
    // outputLine('Compiling: ' + target)
    const tplPath = join(__dirname, '/tpl', file)
    const tplBody = readFileSync(tplPath, 'utf-8')
    let outputBody = ejs.compile(tplBody)({ workspace: blockDefine })
    outputBody = outputBody.replace(/(\s*)\n/g, '\n') // remove blank line
    writeFileSync(targetPath, outputBody)
    recompile = true
    // outputLine('Compile succeeded: ' + target)
  }
  file = 'Formula.cpp.tpl'
  target = blockDefine.blocks[0].name + file.replace(/\.[^.]+$/, '') // remove last ext
  targetPath = join(cppOutputsPath, target)
  if (needRecompileAllBlocks || !existsSync(targetPath) || recompile ||
    statSync(targetPath).mtimeMs < blockDefine.blocks[0].updatedFormulaAt) {
    // outputLine('Compiling: ' + target)
    const tplPath = join(__dirname, '/tpl', file)
    const tplBody = readFileSync(tplPath, 'utf-8')
    let outputBody = ejs.compile(tplBody)({ workspace: blockDefine })
    outputBody = outputBody.replace(/(\s*)\n/g, '\n') // remove blank line
    writeFileSync(targetPath, outputBody)
    recompile = true
    // outputLine('Compile succeeded: ' + target)
  }
  return recompile
}

/**
 *
 * @returns {boolean} whether to need recompile all blocks
 */
function compileMain(define, cppOutputsPath) {
  const list = ['ALLBLOCKSDefinitions.hpp.tpl', 'Main.cpp.tpl']
  let needRecompileAllBlocks = false
  for (const file of list) {
    const tplPath = join(__dirname, '/tpl', file)
    const target = file.replace(/\.[^.]+$/, '') // remove last ext
    const targetPath = join(cppOutputsPath, target)
    const tplBody = readFileSync(tplPath, 'utf-8')
    let outputBody = ejs.compile(tplBody)({ workspace: define })
    outputBody = outputBody.replace(/(\s*)\n/g, '\n') // remove blank line
    // check if this file is compiled already and unchanged
    if (!existsSync(targetPath) || readFileSync(targetPath) === outputBody) {
      // outputLine('compiling: ', target)
      needRecompileAllBlocks = true
      writeFileSync(targetPath, outputBody)
      // outputLine('compile succeeded: ' + target)
    }
  }
  return needRecompileAllBlocks
}

function generateMakefile(modelName, blocks, makefilePath, compileTempOutputPath, cxxPath) {
  const templateIncPath = join(__dirname, '/tpl/templateInc')
  const templateFormulaPath = join(__dirname, '/tpl/templateFormula')
  const templateSpacePath = join(__dirname, '/tpl/templateSpace')
  let templateInc = readFileSync(templateIncPath, 'utf-8')
  let templateFormula = readFileSync(templateFormulaPath, 'utf-8')
  let templateSpace = readFileSync(templateSpacePath, 'utf-8')
  const list = {}
  blocks.forEach(b => {
    if (!b.parent.id || !b.parent.name) { list[b.name] = b.id }
  })

  const coreFilesPath = join(compileTempOutputPath, 'core')
  const headerFilesPath = join(compileTempOutputPath, 'jinShaJiang')

  const path = { coreFilesPath, headerFilesPath, cxxPath, modelName }
  templateInc = ejs.compile(templateInc)({ path })
  templateFormula = ejs.compile(templateFormula)({ path })
  templateSpace = ejs.compile(templateSpace)({ path })
  let output = templateInc
  let modelObj = 'MODEL_OBJ := '

  for (const key in list) {
    output = output + templateFormula.replace(/CHINALIFELIAB/ig, key) + '\n\n'
    modelObj = modelObj + '$(' + key + 'FORMULA_O) '
  }
  output = output + modelObj + templateSpace

  writeFileSync(makefilePath, output, { flag: 'w' }, function(err) {
    if (err) {
      outputLine(err)
      throw err
    }
  })
}

function makeProjection(modelName, compileTempOutputPath, commandBinariesPath, projectionOutputPath, recompile, threadNum) {
  if (recompile) {
    // const cmd = process.platform === 'win32' ? join('mingw32-make') : 'make'
    // const makePath = join(compileTempOutputPath, 'makefile')
    const releasePath = join(compileTempOutputPath, '/jinShaJiang/release')
    ensureDirSync(releasePath)
    const cpuUse = Math.max(1, Math.min(8, threadNum))
    const args = [
      // '-f',
      // makePath,
      'all',
      '-j' + cpuUse
    ]
    if (process.platform === 'win32') {
      args.push('"CPP_FLAG =-w -std=c++20 -m64 -O3 -fexec-charset=gbk -DNDEBUG -Wl,--stack=8388608"')
    } else {
      args.push('"CPP_FLAG =-w -std=c++17 -m64 -O3 -DNDEBUG -Wl"')
    }
    // outputLine(command)
    try {
      // console.log('($env:path+= "C:\\Program Files\\feiyan\\resources\\tasks\\mingw64\\bin)" & gcc -v & ', makePath)
      // execSync("set temp = 'C:\\Program Files\\feiyan\\resources\\tasks\\mingw64\\bin'")
      // const child = spawn(makePath, args, { cwd: compileTempOutputPath, windowsVerbatimArguments: true })
      let child = null
      if (process.platform === 'win32') {
        // process.chdir(shellPath)
        // process.chdir(compileTempOutputPath)
        // child = spawn('powershell.exe', ['./compile.ps1', '"' + commandBinariesPath + '"', '"' + compileTempOutputPath + '"', args], { cwd: shellPath, windowsVerbatimArguments: false })
        const envVar = process.env
        if (envVar.path) {
          // console.log('path1', envVar.path)
          envVar.path = commandBinariesPath + ';' + envVar.path
          // console.log('path1', commandBinariesPath)
        } else if (envVar.PATH) {
          // console.log('path2', envVar.PATH)
          envVar.PATH = commandBinariesPath + ';' + envVar.PATH
          // console.log('path2', commandBinariesPath)
        }
        child = spawn('mingw32-make', args, { cwd: compileTempOutputPath, env: envVar, windowsVerbatimArguments: true })
      } else {
        const envVar = process.env
        if (process.platform === 'linux') {
          if (envVar.path) {
            console.log('path1', envVar.path)
            // console.log('path1', commandBinariesPath)
          } else if (envVar.PATH) {
            envVar.PATH = '/usr/local/gcc/bin' + ':' + envVar.PATH
            // console.log('path2', compileTempOutputPath, envVar.PATH)
            // console.log('path2', commandBinariesPath)
          }
        }
        child = spawn('make', args, { cwd: compileTempOutputPath, env: envVar, windowsVerbatimArguments: false })
      }
      // const { stdout, stderr } = exec(command, { cwd: compileTempOutputPath, stdio: [0, 1, 2] }, (error, stdout, stderr) => {
      // const { stdout, stderr } = execFile(makePath, args, { cwd: compileTempOutputPath, stdio: [0, 1, 2] }, (error, stdout, stderr) => {
      // if (error) {
      //   outputErrLine(error.name + ': ' + error.message)
      //   outputErrLine('exit with error')
      //   process.exit(2)
      //   // return
      // }
      child.on('error', err => {
        outputErrLine(err)
        process.exit(2)
      })
      child.on('close', (code) => {
        if (code !== 0) {
          process.exit(code)
        }
        let overwrite = true
        const projectionBinaryName = process.platform === 'win32' ? modelName + '.exe' : modelName
        const targetPath = join(projectionOutputPath, projectionBinaryName)
        const orgPath = join(compileTempOutputPath, projectionBinaryName)
        if (existsSync(targetPath)) {
          try {
            if (statSync(targetPath).mtimeMs >= statSync(orgPath).mtimeMs || !recompile) {
              overwrite = false
            }
          } catch (e) {
            process.exit(0)
          }
        }
        try {
          copySync(
            orgPath,
            targetPath,
            { overwrite: overwrite }
          )
        } catch (e) {
          process.exit(0)
        }
      })
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)
    } catch (e) {
      // outputErrLine('exit with error')
      outputErrLine(e.name + ': ' + e.message)
      outputErrLine(e)
      process.exit(2)
    }
  }
}

process.env.NODE_ENV = 'production'

const { join } = require('path')
const { build } = require('vite')
const chalk = require('chalk')
const { build: electronBuilder } = require('electron-builder')
const { remove, writeFile } = require('fs-extra')
const { loadRollupConfig } = require('./util')

/**
 * Generate the distribution version of package json
 */
async function generatePackageJson() {
  const original = require('../package.json')
  const result = {
    name: original.name,
    author: original.author,
    version: original.version,
    license: original.license,
    description: original.description,
    main: './index.js',
    dependencies: Object.entries(original.dependencies).filter(([name, version]) => original.external.indexOf(name) !== -1).reduce((object, entry) => ({ ...object, [entry[0]]: entry[1] }), {})
  }
  await writeFile('dist/package.json', JSON.stringify(result))
}


/**
 * Use vite to build renderer process
 */
function buildRenderer() {
  const config = require('./vite.config')

  console.log(chalk.bold.underline('Build renderer process'))

  return build({
    ...config,
    mode: process.env.NODE_ENV
  })
}

async function start() {

  await remove(join(__dirname, '../dist'))
  const startTime = Date.now()
  await buildRenderer()
  console.log(
    `Build renderer completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s.\n`
  )
  if (process.env.BUILD_TARGET) {
    await generatePackageJson()
  }
}

start().catch((e) => {
  console.error(chalk.red(e.toString()))
  process.exit(1)
})

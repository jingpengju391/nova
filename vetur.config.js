/** @type {import('vls').VeturConfig} */
const config = {
  settings: {
    'vetur.useWorkspaceDependencies': true,
    'vetur.experimental.templateInterpolationService': false,
    'vetur.validation.interpolation': false,
    'vetur.validation.script': false
  },
  projects: [{
    root: './src/renderer',
    tsconfig: './tsconfig.json'
  }]
}

module.exports = config

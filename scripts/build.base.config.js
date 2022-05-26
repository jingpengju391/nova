
/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  productName: '飞燕',
  appId: 'com.deep-light.feiyan',
  electronVersion: process.env.ELECTRON_VERSION, // only used for development debugging
  directories: {
    output: 'build',
    buildResources: 'build',
    app: 'dist'
  },
  // assign publish for auto-updater
  // set this to your own repo!
  // publish: [{
  //   provider: 'github',
  //   owner: '',
  //   repo: ''
  // }],
  files: [
    // https://www.electron.build/configuration/contents
  ],
  extraResources: [
    './db/migrations/*',
    './db/seeds/*',
    './db/userMigrations/*'
  ],
  fileAssociations: {
    ext: 'feiyanworkspace'
  }
}

module.exports = config

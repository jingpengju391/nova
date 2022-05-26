const baseConfig = require('./build.base.config')

/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  ...baseConfig,
  mac: {
    icon: 'build/icons/icon.icns',
    target: [
      {
        target: 'zip'
      }
    ],
    files: [
      // 'node_modules/7zip-bin/**/*',
      // '!node_modules/7zip-bin/linux/**',
      // '!node_modules/7zip-bin/win/**'
    ],
    extraResources: [
      './tasks/libs_mac',
      './tasks/core_mac',
      './tasks/helps'
    ]
  },
  win: {
    icon: 'build/icons/icon.ico',
    target: [
      {
        target: 'zip',
        arch: [
          'x64',
          'ia32'
        ]
      }
    ],
    files: [
      // 'node_modules/7zip-bin/**/*',
      // '!node_modules/7zip-bin/linux/**',
      // '!node_modules/7zip-bin/mac/**'
    ],
    extraResources: [
      './tasks/mingw64',
      './tasks/libs_windows',
      './tasks/core_windows',
      './tasks/helps',
      './tasks/headers'
    ]
  },
  linux: {
    icon: 'build/icons',
    target: [
      {
        target: 'tar.gz'
      }
    ],
    files: [
      // 'node_modules/7zip-bin/**/*',
      // '!node_modules/7zip-bin/win/**',
      // '!node_modules/7zip-bin/mac/**'
    ],
    extraResources: [
      './tasks/libs_linux',
      './tasks/core_linux',
      './tasks/headers',
      './tasks/helps'
    ]
  }
}

module.exports = config

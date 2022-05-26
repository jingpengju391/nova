const baseConfig = require('./build.base.config')

/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  ...baseConfig,
  nsis: {
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${productName}-Setup-${version}.${ext}',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: true,
    differentialPackage: true,
    license: 'license/windows/license.txt'
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },
  mac: {
    icon: 'build/icons/icon.icns',
    target: [
      {
        target: 'zip'
      },
      {
        target: 'dmg'
      }
    ],
    extraResources: [
      './tasks/libs_mac',
      './tasks/core_mac',
      './tasks/headers',
      './tasks/helps'
    ]
  },
  win: {
    icon: 'build/icons/icon.ico',
    target: [
      // disable build for x32 by default
      // 'nsis:ia32',
      'nsis:x64',
      // uncomment to generate web installer
      // electron-builder can use either web or offline installer to auto update
      // {
      //   target: 'nsis-web',
      //   arch: [
      //     'x64',
      //   ]
      // },
      {
        target: 'zip',
        arch: [
          'x64'
        ]
      }
    ],
    extraResources: [
      './tasks/mingw64',
      './tasks/libs_windows',
      './tasks/core_windows',
      './tasks/headers',
      './tasks/helps',
      './tasks/compile.ps1'
    ]
  },
  linux: {
    icon: 'build/icons',
    target: [
      {
        target: 'deb'
      },
      {
        target: 'rpm'
      },
      {
        target: 'AppImage'
      },
      {
        target: 'snap'
      }
    ],
    extraResources: [
      './tasks/headers',
      './tasks/libs_linux',
      './tasks/core_linux',
      './tasks/helps'
    ]
  },
  snap: {
    publish: [
      'github'
    ]
  }
}

module.exports = config

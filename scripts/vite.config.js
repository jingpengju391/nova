
const { join, resolve } = require('path')
const { external } = require('../package.json')
const { default: vue } = require('@vitejs/plugin-vue')
const { readdirSync } = require('fs')
const ViteComponents = require('unplugin-vue-components/vite')
const { AntDesignVueResolver, ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const { default: viteSvgIcons } = require('vite-plugin-svg-icons')
const { default: styleImport } = require('vite-plugin-style-import')
const AutoImport = require('unplugin-auto-import/vite')

const entries = readdirSync(join(__dirname, '../src/renderer')).filter(f => f.endsWith('.html'))
  .map(f => join(__dirname, '../src/renderer', f))
/**
 * Vite shared config, assign alias and root dir
 * @type {import('vite').UserConfig}
 */
// const baseUrl = 'http://127.0.0.1:3000'
const config = {
  root: join(__dirname, '../src/renderer'),
  base: '', // has to set to empty string so the html assets path will be relative
  build: {
    rollupOptions: {
      input: entries,
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('monaco-editor')) {
              return 'vendor_edit'
            }
            if (id.includes('vxe-table') || id.includes('knex') || id.includes('csv-parse')) {
              return 'vendor_data'
            }
            return 'vendor'
          }
        }
      }
    },
    outDir: resolve(__dirname, '../dist/renderer'),
    assetsInlineLimit: 0,
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@shared': join(__dirname, '../src/shared'),
      '@': join(__dirname, '../src/renderer')
    }
  },
  optimizeDeps: {
    entries: join(__dirname, '../src/renderer'),
    exclude: external
  },
  css: {
    // postcss: {
    //   plugins: [
    //     {
    //       postcssPlugin: 'internal:charset-removal',
    //       AtRule: {
    //         charset: (atRule) => {
    //           if (atRule.name === 'charset') {
    //             atRule.remove()
    //           }
    //         }
    //       }
    //     }
    //   ]
    // },
    preprocessorOptions: {
      scss: {
        charset: false
      }
    }
  },
  // @ts-ignore
  plugins: [
    vue(),
    styleImport({
      libs: [
        {
          libraryName: 'vxe-table',
          esModule: true,
          resolveComponent: (name) => `vxe-table/es/${name}`,
          resolveStyle: (name) => `vxe-table/es/${name}/style.css`
        }
      ]
    }),
    // @ts-ignore
    AutoImport({
      resolvers: [ElementPlusResolver(), AntDesignVueResolver()]
    }),
    // @ts-ignore
    ViteComponents({
      resolvers: [
        AntDesignVueResolver(),
        ElementPlusResolver()
      ]
    }),
    viteSvgIcons({
      // Specify the icon folder to be cached
      iconDirs: [resolve(__dirname, '../src/renderer/assets/icons')],
      // Specify symbolId format
      symbolId: 'icon-[name]'
    })

  ],
  server: {
    host: '0.0.0.0'
  }
}

module.exports = config

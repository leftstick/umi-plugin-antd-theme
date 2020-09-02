/** @format */

// - https://umijs.org/plugin/develop.html
import { IApi } from 'umi'
import { join } from 'path'
import serveStatic from 'serve-static'
import rimraf from 'rimraf'
import { existsSync, mkdirSync } from 'fs'
import defaultTheme from './defaultTheme'

const buildCss = require('antd-pro-merge-less')
const winPath = require('slash2')

interface themeConfig {
  theme?: string
  fileName: string
  key: string
  modifyVars?: { [key: string]: string }
}

export default function(api: IApi) {
  api.modifyDefaultConfig(config => {
    config.cssLoader = {
      modules: {
        getLocalIdent: (
          context: {
            resourcePath: string
          },
          _: string,
          localName: string
        ) => {
          if (
            context.resourcePath.includes('node_modules') ||
            context.resourcePath.includes('ant.design.pro.less') ||
            context.resourcePath.includes('global.less')
          ) {
            return localName
          }
          const match = context.resourcePath.match(/src(.*)/)
          if (match && match[1]) {
            const antdProPath = match[1].replace('.less', '')
            const arr = winPath(antdProPath)
              .split('/')
              .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
              .map((a: string) => a.toLowerCase())
            return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-')
          }
          return localName
        }
      }
    }
    return config
  })
  // 给一个默认的配置
  let options: {
    theme: themeConfig[]
    min?: boolean
  } = defaultTheme

  // 从固定的路径去读取配置，而不是从 config 中读取
  const themeConfigPath = winPath(join(api.paths.cwd, 'config/theme.config.json'))
  if (existsSync(themeConfigPath)) {
    options = require(themeConfigPath)
  }
  const { cwd, absOutputPath, absNodeModulesPath } = api.paths
  const outputPath = absOutputPath
  const themeTemp = winPath(join(absNodeModulesPath, '.plugin-theme'))
  let needBuildCss = false,
    isFirstCompileFinished = true

  // 增加中间件
  api.addMiddewares(() => {
    return serveStatic(themeTemp)
  })

  // 增加一个对象，用于 layout 的配合
  api.addHTMLHeadScripts(() => [
    {
      content: `window.umi_plugin_ant_themeVar = ${JSON.stringify(options.theme)}`
    }
  ])

  // 编译完成之后
  api.onBuildComplete(({ err }) => {
    if (err) {
      return
    }
    api.logger.info('💄  build theme')

    try {
      if (existsSync(winPath(join(outputPath, 'theme')))) {
        rimraf.sync(winPath(join(outputPath, 'theme')))
      }
      mkdirSync(winPath(join(outputPath, 'theme')))
    } catch (error) {
      // console.log(error);
    }

    buildCss(
      cwd,
      options.theme.map(
        theme => ({
          ...theme,
          fileName: winPath(join(outputPath, 'theme', theme.fileName))
        }),
        {
          min: true,
          ...options
        }
      )
    )
      .then(() => {
        api.logger.log('🎊  build theme success')
      })
      .catch(e => {
        console.log(e)
      })
  })

  class WebpackPluginForUmiPluginAntdTheme {
    apply(compiler: any) {
      compiler.hooks.watchRun.tapAsync('WebpackPluginForUmiPluginAntdTheme', (_compiler: any, done: any) => {
        const watchFileSystem = (_compiler as any).watchFileSystem
        const watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher
        const lessFiles = Object.keys(watcher.mtimes).filter(fileName => /\.less\b/.test(fileName))
        needBuildCss = isFirstCompileFinished || lessFiles.length > 0
        done()
      })
    }
  }

  api.chainWebpack({
    fn(initialValue) {
      initialValue.plugin('WebpackPluginForUmiPluginAntdTheme').use(WebpackPluginForUmiPluginAntdTheme)
      return initialValue
    }
  })

  // dev 之后
  api.onDevCompileDone(() => {
    isFirstCompileFinished = false
    if (!needBuildCss) {
      api.logger.info('skip merge-less since no less files changed')
      return
    }

    api.logger.info('cache in :' + themeTemp)
    api.logger.info('💄  build theme')
    // 建立相关的临时文件夹
    try {
      if (existsSync(themeTemp)) {
        rimraf.sync(themeTemp)
      }
      if (existsSync(winPath(join(themeTemp, 'theme')))) {
        rimraf.sync(winPath(join(themeTemp, 'theme')))
      }

      mkdirSync(themeTemp)

      mkdirSync(winPath(join(themeTemp, 'theme')))
    } catch (error) {
      // console.log(error);
    }

    buildCss(
      cwd,
      options.theme.map(theme => ({
        ...theme,
        fileName: winPath(join(themeTemp, 'theme', theme.fileName))
      })),
      {
        ...options
      }
    )
      .then(() => {
        api.logger.log('🎊  build theme success')
      })
      .catch(e => {
        console.log(e)
      })
  })
}

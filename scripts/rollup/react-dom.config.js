import gPkgJSON from 'rollup-plugin-generate-package-json'
import alias from '@rollup/plugin-alias'
import { getBaseRollupPlugin, getPkgJSON, resolvePkgPath } from './utils'

const { name, module } = getPkgJSON('react-dom')

const pkgPath = resolvePkgPath(name, false)

const distPath = resolvePkgPath(name, true)

export default [
  {
    input: `${pkgPath}/${module}`,
    output: [
      {
        file: `${distPath}/index.js`,
        name: 'index.js',
        // 兼容 CommonJS 和 ES Module
        format: 'umd',
      },
      {
        file: `${distPath}/client.js`,
        name: 'client.js',
        // 兼容 CommonJS 和 ES Module
        format: 'umd',
      },
    ],
    plugins: [
      ...getBaseRollupPlugin({}),
      alias({
        entries: {
          hostConfig: `${pkgPath}/src/hostConfig.ts`,
        },
      }),
      gPkgJSON({
        inputFolder: pkgPath,
        outputFolder: distPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          peerDependecies: {
            react: version,
          },
          main: 'index.js',
        }),
      }),
    ],
  },
]

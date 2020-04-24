import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript2';
import ts from 'typescript';

const pkg = require('./package.json');

const external = Object.keys(pkg.peerDependencies);

const extensions = ['.js', '.tsx'];

const plugins = [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      typescript: ts,
      compilerOptions: {
        module: 'es2015',
      },
    },
  }),
  babel({
    exclude: 'node_modules/**',
    extensions,
  }),
  resolve({
    mainFields: ['module', 'main', 'umd'],
    extensions,
  }),
];

const exports = [
  { format: 'cjs', file: pkg.main, plugins: plugins.concat([commonjs(), uglify()]) },
  { format: 'umd', file: pkg.umd, plugins: plugins.concat([commonjs(), uglify()]) },
  { format: 'es', file: pkg.module, plugins },
];

const globals = {
  react: 'React',
  'react-router': 'ReactRouter',
};

export default exports.map((item) => ({
  input: 'src/index.tsx',
  plugins: item.plugins,
  external,
  output: {
    exports: 'named',
    file: item.file,
    format: item.format,
    name: 'use-react-router-breadcrumbs',
    globals,
    sourcemap: true,
  },
}));

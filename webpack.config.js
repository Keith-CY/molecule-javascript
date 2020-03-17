const path = require('path')

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    index: './src/index.ts',
    schema: './src/schema/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: ['/node_modules/', '/src/cli.ts'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'umd'),
    libraryTarget: 'umd',
    library: 'MoleculeJavaScript',
    globalObject: 'globalThis',
  },
}

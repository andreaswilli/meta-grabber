const path = require('path')

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'target'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        loader: '@svgr/webpack',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    react: 'commonjs react',
  },
}

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const { ESBuildPlugin } = require('esbuild-loader')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  stats: 'errors-only',
  devServer: {
    clientLogLevel: 'silent',
    stats: 'errors-only',
    open: true,
    port: 9000,
    contentBase: path.resolve(__dirname, './public'),
    contentBasePublicPath: '/',
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2017' // Syntax to compile to (see options below for possible values)
        }
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ESBuildPlugin(),
  ]
});

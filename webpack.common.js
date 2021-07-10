const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, './public'),
    filename: '[name].[fullhash].js',
    publicPath: '',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/assets', to: 'assets' },
        { from: './src/vendor/cannon.js', to: 'cannon.js' },
        { from: './src/vendor/cannon.debugger.js', to: 'cannon.debugger.js' },
      ],
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
    }),
  ]
};

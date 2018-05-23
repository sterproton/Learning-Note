const webpack = require('webpack')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const merge = require('webpack-merge')
const webpackCommonConfig = require('./webpack.common')
const path = require('path')

module.exports = merge(webpackCommonConfig, {
  devtool: 'source-map',
  plugins: [
    new ErrorOverlayPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: "webpack-boilerplate",
      template: path.resolve(__dirname, '../src/template/index.html'),
      minify: { //压缩HTML文件
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: true //删除空白符与换行符
      }
    }),
  ],
  devServer: {
    stats: "errors-only",
    open: true,
    historyApiFallback: true,
    overlay: true,
    hotOnly: true,
  },
  module: {
    rules: [{
        test: /\.scss$/,
        use: ['style-loader', {
            loader: 'css-loader',
            options: {
              minimize: true,
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("autoprefixer")()]
            },
          },
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader',
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("autoprefixer")()]
            },
          }
        ]
      }
    ]
  },
  mode: "development"
})
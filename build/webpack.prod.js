const HtmlWebpackPlugin = require("html-webpack-plugin")
const merge = require('webpack-merge')
const webpackCommonConfig = require('./webpack.common')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')
const PurifyCSSPlugin = require("purifycss-webpack")
const glob = require('glob')
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

module.exports = merge(webpackCommonConfig, {
  recordsPath: path.join(__dirname, "../records.json"),
  optimization:{
    minimize: true,
    minimizer: [new UglifyWebpackPlugin({
      sourceMap: true,
      uglifyOptions: {
        ecma: 8,
        compress: {
          warnings: true,
          drop_debugger: true,
          drop_console: true
        }
      }
    })],
    runtimeChunk: {
      name: "manifest",
    },
  },
  plugins: [
    //在build前清理原来build出的dist
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '../'),
      verbose: true
    }),
    //将webpack默认inline CSS改为提取单独的CSS文件
    new ExtractTextPlugin({
      allChunks: true,
      //修改css文件输出的路径(可选)
      filename: (getPath) => {
        return getPath('css/[name].[hash].css').replace('css/js','css')
      }
    }),
    new OptimizeCSSAssetsPlugin({
      cssProcessor: require("cssnano"),
      cssProcessorOptions: {
        discardComments: {
          removeAll: true,
        },
        // Run cssnano in safe mode to avoid
        // potentially unsafe transformations.
        safe: true,
      },
      canPrint: false,
    }),
    // 去除绝大多数多余的css规则，glob里设置需要被purify的组件的路径 //可能导致去除掉不希望
    new PurifyCSSPlugin({
      paths: glob.sync(path.join(__dirname, "../src/**/*.js"), {
        nodir: true
      }),
      minimize: true,
      purifyOptions: {
        rejected: true
      },
      styleExtensions: [path.resolve(__dirname,'../src/assets/scss/global.scss')]
    }),
    new HtmlWebpackPlugin({
      title: "webpack-boilerplate",
      template: path.resolve(__dirname, '../src/template/index.html'),
      minify: { //压缩HTML文件
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: true //删除空白符与换行符
      }
    }),
  ],
  module: {
    rules: [{
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
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
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [{
              loader: 'css-loader',
              options: {
                minimize: true
              }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: () => [require("autoprefixer")()]
              },
            }
          ]
        })
      }
    ]
  },
  mode: "production",
})
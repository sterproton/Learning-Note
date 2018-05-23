const path = require('path')
const rootPath = path.resolve(__dirname)
const entryPath = path.resolve(rootPath, "../src/index.jsx")
const outputPath = path.resolve(rootPath, "../dist")
const srcPath = path.resolve(rootPath, "../src")
// const HappyPack = require("happypack")

module.exports = {
  entry: {
    "js/index": entryPath
  },
  output: {
    path: outputPath,
    filename: "[name].js",
    publicPath: "/",
    chunkFilename: "[name].[chunkhash:5].js"
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "js/public/vender",
          chunks: "initial",
        },
      },
    }
  },
  // plugins: [
  //   new HappyPack({
  //     id: 'jsx',
  //     threads: 4,
  //     loaders: [
  //       'babel-loader',
  //       'eslint-loader'
  //     ],
  //   })
  // ],
  module: {
    rules: [{
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        //如果img大小小于limit将inline img，超出limit则隐式fallback到 file-loader
        {
          loader: 'url-loader',
          options: {
            limit: 3000,
            name: 'imgs/[hash:8].[ext]',
          }
        },
        //压缩图片，选项里可设置质量
        // {
        //   loader: 'image-webpack-loader',
        //   options: {
        //     bypassOnDebug: true
        //   }
        // }
      ]
    }, {
      test: /\.(js|jsx)$/,
      include: path.resolve(__dirname, '../src'),
      exclude: /node_modules/,
      use: ['babel-loader', 'eslint-loader'],
    }, {
      test: /\.json$/,
      use: 'json-loader'
    }, {
      // Match woff2 in addition to patterns like .woff?v=1.1.1.
      test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      use: {
        loader: 'url-loader',
        options: {
          // Limit at 50k. Above that it emits separate files
          limit: 5000,

          // url-loader sets mimetype if it's passed.
          // Without this it derives it from the file extension
          mimetype: "application/font-woff",

          // Output below fonts directory
          name: "./fonts/[name].[ext]",
        },
      }
    }, ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  }
};
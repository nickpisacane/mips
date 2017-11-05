const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: './index.tsx',
  output: {
    path: path.normalize(path.join(__dirname, '..', 'docs', 'js')),
    filename: 'app.js',
    publicPath: '/js/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
          },
        ],
      },
    ],
  },
  devServer: {
    contentBase: path.normalize(path.join(__dirname, '..', 'docs')),
    port: 8000,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
}
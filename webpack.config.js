const path = require('path');

module.exports = {
  mode: 'development',
  entry: './my-electron-app/index.js',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'my-electron-app/build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
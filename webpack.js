const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin()
  ],
  resolve: {
    modules: ['node_modules']
  }
};

webpack(config, (err) => {
  if (err !== null) console.error(err);
  else console.log('done');
});
const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
  output: {
    filename: '[name].js',
    library: 'soyagaci-parser',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'dist'), // where to place webpack files
  },
  entry: {
    main: './src/index.ts'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new WebpackShellPlugin({ onBuildEnd: ['node dist/main.js'], dev: false })
  ],
  module: {
    rules: [{
      test: /\.ts$/,
      use: [
        {
          loader: 'ts-loader',
        }
      ]
    }],
  },
  target: 'node',
  externals: {
    'pdfjs-dist': 'pdfjs-dist'
  }
};

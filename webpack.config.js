const path = require('path');

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

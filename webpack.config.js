const path = require('path');

module.exports = {
  output: {
    filename: '[name].js',
    library: 'soyagaci-parser',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'dist'), // where to place webpack files
  },
  entry: {
    pdf: './src/PDFParser.ts',
    html: './src/HTMLParser.ts',
    text: './src/TextParser.ts'
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
    'pdfjs-dist': 'pdfjs-dist',
    'jsdom': 'jsdom',
  }
};

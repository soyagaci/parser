const path = require('path');

module.exports = {
  output: {
    filename: '[name].js',
    library: 'soyagaciParser',
    libraryTarget: 'var',
    path: path.join(__dirname, 'webBuild'), // where to place webpack files
  },
  entry: {
    'soyagaci-parser-html': './lib/html.ts',
    'soyagaci-parser-pdf': './lib/pdf.ts',
    'soyagaci-parser-text': './lib/text.ts',
    'soyagaci-parser': './lib/index.ts'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [
        {
          loader: 'ts-loader?configFile=web.tsconfig.json',
        }
      ]
    }],
  },
  target: 'web',
  externals: {
    'pdfjs-dist': 'pdfjs-dist',
    'jsdom': 'jsdom',
  }
};

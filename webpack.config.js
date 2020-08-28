const path = require('path');

const PATHS = {
  src: path.join(__dirname, 'src/'), 
  dist: path.join(__dirname, 'assets/js/app/')
};

module.exports = {
  entry: PATHS.src + 'main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'main.js',
    path: PATHS.dist,
  }
};
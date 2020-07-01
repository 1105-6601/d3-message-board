const path = require('path');

module.exports = {
  entry:   './src/index.ts',
  module:  {
    rules: [
      {
        test:    /\.tsx?$/,
        use:     'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s[ac]ss$/i,
        use:  [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  mode:    'production',
  output:  {
    filename:      'index.js',
    path:          path.resolve(__dirname, 'dist'),
    library:       'D3MessageBoard',
    libraryTarget: 'umd',
    globalObject:  'typeof self !== \'undefined\' ? self : this'
  }
};

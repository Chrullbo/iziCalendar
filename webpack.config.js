const path = require('path');
module.exports = {
    entry: './src/iziCalendar.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'bundle.js'
    },
    module: {
        loaders: [{ 
          test: /\.js$/, 
          exclude: /node_modules/, 
          loader: "babel-loader" 
        }]
      }
  };
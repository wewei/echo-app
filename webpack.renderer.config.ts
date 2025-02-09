import type { Configuration } from 'webpack';
import path from 'node:path';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  devServer: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self' 'unsafe-inline' 'unsafe-eval' data: ws: echo-asset://*;
        img-src 'self' echo-asset://*/;
        connect-src 'self' ws:;
      `.replace(/\s+/g, ' ').trim()
    }
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: { '@': path.resolve(__dirname, 'src/') }
  },
};

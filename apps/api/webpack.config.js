const nodeExternals = require('webpack-node-externals');

module.exports = (options, webpack) => {
  return {
    ...options,
    externals: [
      nodeExternals({
        allowlist: [/@ruleta\//],
      }),
    ],
  };
};

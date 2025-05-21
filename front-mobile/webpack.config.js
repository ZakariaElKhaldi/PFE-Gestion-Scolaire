const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
    },
    argv
  );

  // Add resolve alias for nanoid
  config.resolve.alias = {
    ...config.resolve.alias,
    'nanoid/non-secure': require.resolve('nanoid/non-secure')
  };

  // Add dangerously add module paths for SDK 52
  config.module.rules.push({
    test: /\.(js|ts|tsx)$/,
    include: [
      /node_modules\/@expo\/vector-icons/,
      /node_modules\/nanoid/
    ],
    use: {
      loader: 'babel-loader',
    },
  });

  return config;
};

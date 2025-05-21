module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      'nativewind/babel',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './',
            '@components': './components',
            '@screens': './app',
            '@hooks': './hooks',
            '@constants': './utils/constants',
            '@types': './types',
          },
        },
      ],
    ],
  };
};

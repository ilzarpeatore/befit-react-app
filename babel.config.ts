module.exports = function (api: any) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@components": "./components",
            "@pages": "./pages",
            "@assets": "./assets",
            "@constants": "./constants",
            "@helper": "./helper",
            "@store": "./store",
            "@api": "./api",
            "@hooks": "./hooks"
          }
        },
      ],
    ]
  };
};

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@components": "./components",
            "@constants": "./constants",
            "@hooks": "./hooks",
            "@utils": "./utils",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      ],
    ],
  };
};

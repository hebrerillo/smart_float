const path = require("path");
const WatchExternalFilesPlugin = require("webpack-watch-external-files-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
  },
  plugins: [
    new WatchExternalFilesPlugin({
      files: ["test/*"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias : {
      src: path.resolve(__dirname, "src/")
    },
    extensions: [".js"],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};

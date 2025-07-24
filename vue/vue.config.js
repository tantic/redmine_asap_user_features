// const TerserPlugin = require('terser-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//     .BundleAnalyzerPlugin;
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    // Disable the hash in the name of the generated files
    filenameHashing: false,

    // where to output built files
    // outputDir: 'dist',

    // where to put static assets (js/css/img/font/...)
    // if mode = production put the js in the plugin directory
    // else put the js files in the public directory
    assetsDir: process.env.NODE_ENV === 'production'
      ? '../../assets/javascripts'
      : '../../../../public/plugin_assets/redmine_asap_user_features/javascripts',

    // whether to use eslint-loader for lint on save.
    // valid values: true | false | 'error'
    // when set to 'error', lint errors will cause compilation to fail.
    lintOnSave: false,

    // use the full build with in-browser compiler?
    // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
    runtimeCompiler: false,

    // babel-loader skips `node_modules` deps by default.
    // explicitly transpile a dependency with this option.
    transpileDependencies: [/* string or regex */],

    // generate sourceMap for production build?
    productionSourceMap: false,

    // tweak internal webpack configuration.
    // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
    chainWebpack: () => {},
    // chainWebpack: config => config.optimization.minimize(true),
    configureWebpack: config => {
      optimization: {
        minimizer: [
          new UglifyJsPlugin({
            uglifyOptions: {
              warnings: false,
              parse: {},
              compress: {},
              mangle: true, // Note `mangle.properties` is `false` by default.
              output: null,
              toplevel: false,
              nameCache: null,
              ie8: false,
              keep_fnames: false,
           },
       }),
    ]}

     },
     configureWebpack: {
      plugins: [
        // new BundleAnalyzerPlugin(),
        // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      ]
    },

    // CSS related options
    css: {
      // extract CSS in components into a single CSS file (only in production)
      // can also be an object of options to pass to extract-text-webpack-plugin
      extract: true,

      // Enable CSS modules for all css / pre-processor files.
      // This option does not affect *.vue files.
      // modules: false,

      // enable CSS source maps?
      sourceMap: false,

      // pass custom options to pre-processor loaders. e.g. to pass options to
      // sass-loader, use { sass: { ... } }
      loaderOptions: {}
    },

    // options for 3rd party plugins
    pluginOptions: {

      // ...
    }
  };

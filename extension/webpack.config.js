const fs = require('fs');
const path = require('path');

const sass = require('node-sass');

const dir = '../build_extension';

const mkdirp = require('mkdirp');

function writeFile (destination, contents, callback = () => null) {
  mkdirp(path.dirname(destination), function (error) {
    if (error) {
      return callback(error);
    }
    fs.writeFile(destination, contents, callback);
  });
}

/*
 * Minifies locale files by leaving only "message" attributes.
 */
function minifyLocale (locale) {
  const original = JSON.parse(locale.toString());
  const minimal = {};
  for (const message in original) {
    minimal[message] = {
      message: original[message].message
    };
  }
  return JSON.stringify(minimal);
}

// TODO: fix upstream bug
function manifest (buildDirLong, mode, platform) {
  console.log('Rebuilding manifest.json', mode, platform);
  const manifest = require('./manifest.json');
  const outputPath = buildDirLong + '/manifest.json';

  // Apply Firefox overrides
  if (platform === 'firefox') {
    const overrides = require('./manifest_override_firefox.json');
    for (const entry in overrides) {
      manifest[entry] = overrides[entry];
    }
  }

  // Apply Chrome overrides
  if (platform === 'chrome') {
    const overrides = require('./manifest_override_chrome.json');
    for (const entry in overrides) {
      manifest[entry] = overrides[entry];
    }
  }

  // Apply development overrides
  if (mode === 'development') {
    const overrides = require('./manifest_override_development.json');
    for (const entry in overrides) {
      manifest[entry] = overrides[entry];
    }
  }

  // TODO: error handling?
  writeFile(outputPath, JSON.stringify(manifest));
}

function buildSass (buildDirLong, mode, platform) {
  const outFile = buildDirLong + '/pages/options_ui/options_ui.css';
  console.log('Building SASS...', buildDirLong, mode, platform);
  sass.render({
    file: 'extension/pages/options_ui/options_ui.scss',
    outFile: outFile,
    outputStyle: 'compressed'
    // [, options..]
  },
  function (error, result) {
    if (!error) {
      // No errors during the compilation, write this result on the disk
      writeFile(outFile, result.css, function (err) {
        if (!err) {
          console.log('Building SASS... done.');
          // file written on disk
        }
      });
    }
  }
  );
}

// Add all files that do require processing to webpack work order
const entries = {
  'background.js': './extension/background/background.ts',
  'content_scripts.js': './extension/content_scripts/content_scripts.ts',
  'pages/options_ui/options_ui.js': './extension/pages/options_ui/options_ui.ts'
};

const CopyPlugin = require('copy-webpack-plugin');

// Ask webpack to process these files
module.exports = (env, argv) => {
  // Environment variables
  const platform = process.env.platform || 'firefox';
  const mode = argv.mode || process.env.mode || 'production';

  // build can be absolute path
  const buildDirBaseLong = path.resolve(__dirname, dir);
  const buildDirLong = buildDirBaseLong + '/' + platform + '/';

  if (!fs.existsSync(buildDirBaseLong)) {
    fs.mkdirSync(buildDirBaseLong);
  }

  if (!fs.existsSync(buildDirLong)) {
    fs.mkdirSync(buildDirLong);
  }

  const copy = [
    {
      from: 'extension/_locales/',
      to: '_locales/',
      transform: minifyLocale
    },
    {
      from: 'extension/pages/',
      to: 'pages/',
      ignore: ['*.scss', '*.ts']
    },
    {
      from: 'extension/images/',
      to: 'images/'
    }
  ];

  // This is a production config used as a base for development config as well
  const config = {
    entry: entries,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    output: {
      // build can be absolute or relative path
      path: buildDirLong,
      filename: '[name]'
    },
    optimization: {
      minimize: true,
      usedExports: true
    },
    plugins: [
      new CopyPlugin(copy)
    ]
  };

  manifest(buildDirLong, mode, platform);

  buildSass(buildDirLong, mode, platform);

  // If this is development build, keep bundle readable.
  if (mode === 'development') {
    // Do not minimize (maintain indentation and comments)
    config.optimization.minimize = false;
    // Keep source code as is
    config.devtool = 'source-map';

    // Live rebuild
    // To utilize this, need to specify --mode=development --watch
    // config.watch = true
    const ExtensionReloader = require('webpack-extension-reloader');
    config.plugins.push(
      new ExtensionReloader({
        manifest: path.resolve(__dirname, './manifest.json')
      })
    );
  }

  return config;
};

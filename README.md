# umi-plugin-dynamic-antd-theme

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
![][david-url]
![][dt-url]
[![code style: prettier][prettier-image]][prettier-url]
![][license-url]

With `umi@3`, Just install `umi-plugin-dynamic-antd-theme`, it shall be loaded by `umi` automatically.

## Usage

### Theme configuration

You should not use `.umirc.ts`, but with `config/config.ts` instead.

And add theme configure file `config/theme.config.json` with below content:

```json
{
  "theme": [
    {
      "theme": "dark", // theme key
      "fileName": "dark.css", // theme file name, will be generated as static assets
      "modifyVars": {
        // variables that will be replaced in antd
        "@primary-color": "#F5222D"
      }
    },
    {
      "theme": "mingQing",
      "fileName": "mingQing.css",
      "modifyVars": {
        "@primary-color": "#13C2C2"
      }
    }
  ],
  // minify css
  "min": true,
  // css module
  "isModule": true,
  // ignore antd dependency
  "ignoreAntd": false,
  // ignore pro-layout dependency
  "ignoreProLayout": false,
  // no cache
  "cache": false
}
```

You can use this config via `window.umi_plugin_ant_themeVar`.

### App-level theme variables

Define app-level theme variables(with prefix `--`) in `global.less`, for example:

```less
.body-wrap-theme1 {
  --font-color: #000000;
  --bg-color: #011313;
}

.body-wrap-theme2 {
  --font-color: #ffffff;
  --bg-color: #ffffff;
}
```

> `theme1`, `theme2` is the theme key we mentioned in [configuration](#theme-configuration)

Use app-level theme variables(with `var` function) in your component `.less` file, for example:

```less
.flatButton {
  color: var(--font-color);
  background: var(--bg-color);
}
```

### Switch theme dynamically

Please refer to [ThemeSwitch.tsx](https://github.com/DFocusGroup/generator-umi/blob/master/generators/app/templates/src/components/buttons/ThemeSwitch/index.tsx)

## LICENSE

[MIT License](https://raw.githubusercontent.com/leftstick/umi-plugin-dynamic-antd-theme/master/LICENSE)

[npm-url]: https://npmjs.org/package/umi-plugin-dynamic-antd-theme
[npm-image]: https://badge.fury.io/js/umi-plugin-dynamic-antd-theme.png
[david-url]: https://david-dm.org/leftstick/umi-plugin-dynamic-antd-theme.png
[travis-image]: https://www.travis-ci.org/leftstick/umi-plugin-dynamic-antd-theme.svg?branch=master
[travis-url]: https://travis-ci.com/leftstick/umi-plugin-dynamic-antd-theme
[dt-url]: https://img.shields.io/npm/dt/umi-plugin-dynamic-antd-theme.svg
[license-url]: https://img.shields.io/github/license/leftstick/umi-plugin-dynamic-antd-theme
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier

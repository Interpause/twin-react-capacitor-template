# twin-react-capacitor-template

> template for capacitor app using react framework with twin.macro and typescript

Code isn't just about language performance, it is also about letting the developer express their creativity. React's declarative-style coupled with their functional components provide what I feel is the most clear-cut way of defining components yet without restricting their power. Then, add twin.macro, a fusion of TailwindCSS utility classes and CSS-in-JS libraries like Emotion, allowing you to dynamically control the style of components yet making it obvious what each CSS class does. Combined together, it provides the most fun developer experience I believe exists out there due to simply how powerful it is.

While it isn't as performant as say, React Native or Flutter, packaging web apps like this comes with the obvious advantages of much smaller app size, getting to use a wider range of packages, while still maintaining access to native APIs as plugins. In this case, I have chosen to use Capacitor as the successor to Cordova.

Either directly clone this template to use it, or follow along in the commit history to learn how I set this up.

When customizing the template for your own use, besides changing `package.json`, remember to change `appId` and `appName` in `capacitor.config.ts`.

## Table of Contents

* [Initialize App](#initialize-app)
* [Install Typescript](#install-typescript)
* [Install React](#install-react)
* [VSCode Setup (optional)](#vscode-setup--optional-)
* [Install Webpack](#install-webpack)
* [Setup Babel](#setup-babel)
* [Setup Webpack](#setup-webpack)
* [Setup React Fast Refresh](#setup-react-fast-refresh)
* [Setup Babel polyfills using core-js](#setup-babel-polyfills-using-core-js)
* [Setup twin.macro](#setup-twinmacro)
* [VSCode twin.macro Intellisense Extension (optional)](#vscode-twinmacro-intellisense-extension--optional-)
* [Package with Capacitor](#package-with-capacitor)
* [Last Notes](#last-notes)

## Initialize App

```sh
yarn init # or npm init
```

Install `cross-env` to help with setting environment variables, and `npm-run-all` to help with running scripts:

```sh
yarn add --dev cross-env npm-run-all
```

## Install Typescript

Install Typescript support using:

```sh
yarn add --dev typescript
yarn tsc --init # or npx tsc --init
```

My personal preference can be found in [`tsconfig.json`](./tsconfig.json) but the most important settings are:

```json
{
  // ...
  "compilerOptions": {
    // ...
    "jsx": "preserve", // needed for twin.macro to properly apply transforms later as ts-loader seems to escape 'tw' prop
    "outDir": "./dist/" // this directory is the build output and is in .gitignore
  },
  // include files as according to folder structure
  "include": ["index.ts", "./src/**/*"]
}
```

## Install React

```sh
yarn add react react-dom
yarn add --dev @types/react @types/react-dom
```

At this point, we also create `index.ts`, which automatically appends the react root container to the document, and `./src/App.tsx`, which contains our actual App component:

```ts
// index.ts
import { createElement as e } from 'react'
import { render } from 'react-dom'

import App from './src/App'

const container = document.createElement('div')
document.body.append(container)

render(e(App), container)
```

```tsx
// App.tsx
import React from 'react'

export default function App() {
  return (
    <>
      <h1>Hello World!</h1>
      <h6>Capacitor app template using React, twin.macro and typescript</h6>
    </>
  )
}
```

I also added `.prettierrc` according to my own personal preferences, which should be picked up by most editors (for example, vscode has a prettier plugin).

## VSCode Setup (optional)

Paste this in `.vscode/settings.json` to enable auto-formatting according to `.prettierrc` and auto-detection of typescript used:

```json
{
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "DavidAnson.vscode-markdownlint"
  },
  "typescript.tsdk": "common\\node_modules\\typescript\\lib"
}
```

## Install Webpack

First, we will start with Webpack:

```sh
yarn add --dev webpack webpack-nano webpack-plugin-serve
```

Instead of `webpack-cli` as one might usually expect, we are using `webpack-nano` as it is [better](https://github.com/shellscape/webpack-nano). We will also use `webpack-plugin-serve` to preview our dev builds.

Next, we install the Webpack loaders for Babel and Typescript:

```sh
yarn add --dev @babel/core babel-loader ts-loader
```

The plan is to use `ts-loader` to first type-check and transform typescript to javascript, before using `babel-loader` to apply transformations and transpile it. I am aware that there is a faster babel plugin for typescript, but `ts-loader` now has optimization configs and the ability to be turned off during production builds that allows it match the plugin's speed.

Lastly, add this helpful plugin that auto-generates `index.html` during build:

```sh
yarn add --dev html-webpack-plugin
```

## Setup Babel

We earlier already installed `@babel/core` and `babel-loader`. Now to add in some of the Babel plugins used during transpilation:

```sh
yarn add --dev @babel/plugin-transform-react-jsx @babel/preset-env babel-plugin-transform-remove-console
```

Taking a look at `.babelrc.js`:

```js
// .babelrc.js
const presets = ['@babel/preset-env'] // preset-env reads browserslist key in package.json

const plugins = ['@babel/plugin-transform-react-jsx']

if (process.env.NODE_ENV === 'production') {
  // remove console.log and so on in production
  plugins.push('transform-remove-console')
}

module.exports = { presets, plugins }
```

Configure this in `package.json`:

```json
{
  //...
  "browserslist": "chrome 60" // matches minimum support of Capacitor
}
```

## Setup Webpack

Finally, lets take a look at `webpack.config.js`:

```js
// webpack.config.js
const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { WebpackPluginServe } = require('webpack-plugin-serve')

const isDev = process.env.NODE_ENV == 'development'
const outPath = path.resolve(__dirname, 'dist')

const config = {
  mode: isDev ? 'development' : 'production', // enables builtin webpack 5 optimizers
  entry: [isDev && 'webpack-plugin-serve/client', './index.ts'].filter(Boolean),
  output: {
    path: outPath,
    filename: '[name].bundle.js',
    clean: true, // clears ./dist/ each time we build
  },
  target: 'browserslist',
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: !isDev, // compile faster for production build
              onlyCompileBundledFiles: true,
              experimentalFileCaching: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'twin-react-capacitor-template',
    }),
    isDev &&
      new WebpackPluginServe({
        host: 'localhost',
        port: 8080,
        progress: 'minimal',
        static: outPath,
      }),
  ].filter(Boolean),
  watch: isDev,
  devtool: isDev ? 'eval-source-map' : false, // don't include sourcemaps for production build
}

module.exports = config
```

Finally, we are ready to build the app. Add these scripts to `package.json`:

```json
{
  // ...
  "scripts": {
    // ...
    "dev": "cross-env NODE_ENV=development wp",
    "prod": "cross-env NODE_ENV=production wp"
  }
}
```

```sh
yarn dev # or npm run dev
```

Congrats! You have just built the app and run it.

## Setup React Fast Refresh

First, install:

```sh
yarn add --dev @pmmmwh/react-refresh-webpack-plugin react-refresh react-refresh-typescript
```

Then, modify `webpack.config.js`:

```js
// add these imports
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
```

```js
{
  loader: 'ts-loader',
  options: {
    // add getCustomTransformers
    getCustomTransformers: () => ({
      before: isDev ? [ReactRefreshTypeScript()] : [],
    }),
    // ...
  },
}
```

```js
plugins: [
  // ...
  isDev && new ReactRefreshWebpackPlugin(), // add the plugin
]
```

Now, when making edits, instead of the entire page reloading, only the modified component will reload while still preserving its own state.

## Setup Babel polyfills using core-js

Install `core-js`:

```sh
yarn add core-js
```

Edit `.babelrc.js`:

```js
const presets = [
  [
    '@babel/preset-env',
    {
      useBuiltIns: 'usage',
      corejs: '3.16.2', //put the version in package.json here
    },
  ],
]
```

`preset-env` will use the `browserslist` key in `package.json` to determine what it needs to polyfill, adding in polyfills from `core-js` as needed.

## Setup twin.macro

```sh
yarn add twin.macro @emotion/react @emotion/styled
```

Modify `index.ts`:

```ts
import { GlobalStyles } from 'twin.macro'

// ...
render([e(GlobalStyles), e(App)], container)
```

Now, add a bunch more plugins to Babel:

```sh
yarn add -D babel-plugin-macros @emotion/babel-plugin-jsx-pragmatic @emotion/babel-plugin
```

```js
// .babelrc.js
const plugins = [
  '@emotion/babel-plugin',
  'babel-plugin-macros',
  [
    '@emotion/babel-plugin-jsx-pragmatic',
    {
      export: 'jsx',
      import: '__cssprop',
      module: '@emotion/react',
    },
  ],
  [
    '@babel/plugin-transform-react-jsx',
    {
      pragma: '__cssprop',
      pragmaFrag: 'React.Fragment',
    },
  ],
]
```

Finally, typings to get everything working with Typescript. Create `src/twin.d.ts`:

```ts
// https://github.com/ben-rogerson/twin.examples
import 'twin.macro'
import styledImport from '@emotion/styled'
import { css as cssImport } from '@emotion/react'

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport
  const css: typeof cssImport
}

// fixes I searched quite hard for to retype the added props

// The css prop
import {} from '@emotion/react/types/css-prop'

// The 'as' prop on styled components
declare global {
  namespace JSX {
    interface IntrinsicAttributes<T> extends DOMAttributes<T> {
      as?: keyof HTMLElementTagNameMap
    }
  }
}
```

Now you can start playing with `twin.macro` magic! see `Card.tsx` for example.

```tsx
// ...
export interface CardProps {
  variant?: 'outline' | 'filled'
}

/** Card component that is a styled div. Accepts CardProps. */
export const Card = styled.div`
  ${tw`relative inline-flex flex-col justify-between text-left rounded overflow-x-hidden bg-opacity-10`}
  min-height: 30ch;
  width: 50ch;

  ${({ variant = 'outline' }: CardProps) =>
    ({
      outline: tw`bg-opacity-0 border-2`,
      filled: tw`shadow-md`,
    }[variant])}
`

/** Styled div that should be wrapped in Card. */
export const CardHeader = tw.div`order-1 p-1`
/** Styled div that should be wrapped in Card. */
export const CardBody = tw.div`order-2 flex-grow my-1 px-1 overflow-x-hidden overflow-y-auto`
/** Styled div that should be wrapped in Card. */
export const CardFooter = tw.div`order-3 p-1`
```

## VSCode twin.macro Intellisense Extension (optional)

Gives much needed intellisense for `twin.macro`: <https://marketplace.visualstudio.com/items?itemName=lightyen.tailwindcss-intellisense-twin>

## Package with Capacitor

Install Capacitor first:

```sh
yarn add @capacitor/core
yarn add -D @capacitor/cli
```

Then init Capacitor:

```sh
yarn cap init # NOTE: specify 'dist' for Web asset directory!
```

I use Android mainly, so to add it as a platform:

```sh
yarn add @capacitor/android
yarn cap add android
```

Note, you might need to setup Android Studio and add stuff to path beforehand, see: <https://capacitorjs.com/docs/getting-started/environment-setup>.

Finally, add some scripts for testing purposes:

```json
{
  // ...
  "scripts": {
    // ...
    "build": "run-s prod && cap sync",
    "android": "run-s build && cap run android"
  }
}
```

Now if you were to do `yarn android`, you should be able to run the production build of your app on an emulator! Neat.

Capacitor's APIs are modular and have to be individually installed to be used, see: <https://capacitorjs.com/docs/apis>.

## Last Notes

* When customizing the template for your own use, besides changing `package.json`, remember to change `appId` and `appName` in `capacitor.config.ts`.

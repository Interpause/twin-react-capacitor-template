# twin-react-capacitor-template

> template for capacitor app using react framework with twin.macro and typescript

## Initialize Package

First, initialize using:

```sh
yarn init # or use npm
```

We will also be installing `cross-env` to help with setting environment variables, and `npm-run-all` to help with running scripts:

```sh
yarn add --dev cross-env npm-run-all
```

## Initialize Typescript

Install Typescript support using:

```sh
yarn add --dev typescript
```

Next, initialize `tsconfig.json` which is used to configure the type-strictness, compiler options and so on:

```sh
yarn tsc --init # or npx tsc --init
```

My personal preference can be found in [`tsconfig.json`](./tsconfig.json) but the most important settings are:

```json
{
  // ...
  "compilerOptions": {
    // ...
    "jsx": "preserve", // needed for twin.macro to properly apply transforms later as ts-loader seems to escape 'tw' prop
    "outDir": "./dist/", // this directory will be referenced in later steps for the build script
  },
  // include files as according to folder structure
  "include": [
    "index.ts",
    "./src/**/*",
  ]
}
```

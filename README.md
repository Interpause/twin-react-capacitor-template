# twin-react-capacitor-template

> template for capacitor app using react framework with twin.macro and typescript

Install `cross-env` to help with setting environment variables, and `npm-run-all` to help with running scripts:

```sh
yarn add --dev cross-env npm-run-all
```

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
    "outDir": "./dist/" // this directory will be referenced in later steps for the build script
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

```ts
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

}
```

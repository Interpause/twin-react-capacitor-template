import { createElement as e } from 'react'
import { render } from 'react-dom'

import { GlobalStyles } from 'twin.macro'
import App from './src/App'

const container = document.createElement('div')
document.body.append(container)

render([e(GlobalStyles), e(App)], container)

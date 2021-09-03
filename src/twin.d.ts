import 'twin.macro'
import styledImport from '@emotion/styled'
import { css as cssImport } from '@emotion/react'

declare module 'twin.macro' {
	const styled: typeof styledImport
	const css: typeof cssImport
}

import {} from '@emotion/react/types/css-prop'

import { ElementType } from 'react'
declare global {
	namespace JSX {
		interface IntrinsicAttributes<T> extends DOMAttributes<T> {
			as?: ElementType
		}
	}
}

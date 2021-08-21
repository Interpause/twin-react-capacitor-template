import React from 'react'
import tw, { css } from 'twin.macro'
import { SimpleCard } from './Card'

export default function App() {
	return (
		<div tw='relative w-screen h-screen overflow-hidden px-80 py-20 text-center bg-gray-50'>
			<h1 tw='text-6xl text-blue-400'>Hello World!</h1>
			<h6 tw='text-xl pb-4'>
				Capacitor app template using React, twin.macro and typescript!
			</h6>
			<SimpleCard
				tw='bg-white'
				css={css`
					.header {
						${tw`text-3xl`}
					}
				`}
				header='Nice Card'
				body='made using twin.macro'
			/>
		</div>
	)
}

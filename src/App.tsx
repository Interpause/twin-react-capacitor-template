import React, { useEffect } from 'react'
import tw, { css } from 'twin.macro'
import { SimpleCard } from './components/Card'
import { Device, DeviceInfo } from '@capacitor/device'
import { useStorage } from './providers/StorageProvider'

export default function App() {
	const [info, setInfo] = useStorage<DeviceInfo>('cachedInfo')

	useEffect(() => {
		if (info) return console.log('Already Cached!')
		Device.getInfo().then(setInfo)
		console.log('Caching...')
	}, [])
	return (
		<div tw='relative w-screen h-screen overflow-hidden py-20 text-center bg-gray-50'>
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
				body={`Running on ${info?.model ?? 'unknown'}`}
				footer='Made using twin.macro'
			/>
		</div>
	)
}

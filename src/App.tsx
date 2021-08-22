import React, { useEffect } from 'react'
import tw, { css } from 'twin.macro'
import { SimpleCard } from './components/Card'
import { Device, DeviceInfo } from '@capacitor/device'
import { createKey } from './providers/StorageProvider'

const [DeviceInfoProvider, useDeviceInfo] = createKey<DeviceInfo>('cachedInfo')
const [SavedToggleProvider, useSavedToggle] = createKey<boolean>(
	'savedToggle',
	false,
)

function DeviceInfoCard() {
	const [info, setInfo] = useDeviceInfo()

	useEffect(() => {
		if (info) return console.log('Already Cached!')
		Device.getInfo().then(setInfo)
		console.log('Caching...')
	}, [])

	return (
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
	)
}

function SavedToggle() {
	const [on, setOn] = useSavedToggle()

	return (
		<button
			tw='bg-blue-600 rounded hover:bg-blue-300 text-white p-1 m-1'
			onClick={() => setOn(!on)}
		>{`isOn: ${on}`}</button>
	)
}

export default function App() {
	return (
		<div tw='relative w-screen h-screen overflow-hidden py-20 text-center bg-gray-50'>
			<h1 tw='text-6xl text-blue-400'>Hello World!</h1>
			<h6 tw='text-xl pb-4'>
				Capacitor app template using React, twin.macro and typescript!
			</h6>
			<SavedToggleProvider>
				<SavedToggle />
			</SavedToggleProvider>
			<br />
			<br />
			<DeviceInfoProvider>
				<DeviceInfoCard />
			</DeviceInfoProvider>
		</div>
	)
}

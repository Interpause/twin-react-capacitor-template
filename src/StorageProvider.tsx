// working around @capacitor/storage to make it more React-friendly
import { Storage } from '@capacitor/storage'
import {
	createContext,
	ReactNode,
	useState,
	useContext,
	useCallback,
} from 'react'

type KeyValueStorage = {
	[key: string]: any
}

const initialStorage: KeyValueStorage = {}

const StorageContext = createContext({
	state: initialStorage,
	setState: (newState: KeyValueStorage) =>
		console.error('StorageProvider needed!'),
})

/** Run this before App is rendered */
export async function initStorage() {
	const { value } = await Storage.get({ key: 'storage' })
	const storage: KeyValueStorage =
		value === null ? initialStorage : JSON.parse(value)
	;(globalThis as any).__INIT_STORAGE_TEMPORARY_IGNORE_THIS__ = storage
}

/** Wrap App with this Provider */
export function StorageProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<KeyValueStorage>(
		(globalThis as any).__INIT_STORAGE_TEMPORARY_IGNORE_THIS__,
	)
	return (
		<StorageContext.Provider value={{ state, setState }}>
			{children}
		</StorageContext.Provider>
	)
}

/** Use this Hook in order to access objects in storage, defaults to fallback when key not found if provided */
export function useStorage<T>(key: string): [T | undefined, (v: T) => void]
export function useStorage<T>(key: string, fallback: T): [T, (v: T) => void]
export function useStorage<T>(key: string, fallback?: T) {
	const { state, setState } = useContext(StorageContext)
	const update = useCallback(
		(value: T) => {
			const newState = { ...state, [key]: value }
			// save every time a key is updated
			Storage.set({ key: 'storage', value: JSON.stringify(newState) })
			setState(newState)
		},
		[setState],
	)

	return [state[key] ?? fallback, update]
}

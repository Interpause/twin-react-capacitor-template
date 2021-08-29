/**
 * working around @capacitor/storage to make it more React-friendly
 * feels like a cacheProvider with eager-loading
 * there isn't any cacheProvider package as far as I can tell unfortunately
 * probably should publish this as a gist
 */

import { Storage } from '@capacitor/storage'
import {
	createContext,
	useState,
	useContext,
	useCallback,
	SetStateAction,
	Dispatch,
	ProviderProps,
} from 'react'

const keyOfKeyList = '__STORAGE_PROVIDER_KEYS_PRESENT_IGNORE_ME__'
const keyOfStorage = '__STORAGE_PROVIDER_LOAD_ON_INIT_IGNORE_ME__'

/** creates key-value pair in storage, returning Provider that should be wrapped around component & hook to use storage */
export function createKey<T>(key: string, initial?: T) {
	const globalStorage = (globalThis as any)[keyOfStorage] as
		| Record<string, T>
		| undefined
	const globalKeys = (globalThis as any)[keyOfKeyList] as string[] | undefined

	if (globalStorage === undefined || globalKeys === undefined)
		throw 'initStorage must be called before ReactDOM.render!'
	const initialValue = globalStorage[key] ?? initial

	type KeyContextData = {
		value?: T
		setValue: Dispatch<SetStateAction<T | undefined>>
	}

	const KeyContext = createContext<KeyContextData>({
		value: initialValue,
		setValue: () => {
			throw 'createKey Provider needed!'
		},
	})

	/** provider that should be wrapped around component using the storage */
	const KeyProvider = (props: Omit<ProviderProps<KeyContextData>, 'value'>) => {
		const [value, setValue] = useState(initialValue)
		return <KeyContext.Provider value={{ value, setValue }} {...props} />
	}

	/** hook to use storage */
	const useKey = () => {
		const { value, setValue } = useContext(KeyContext)

		/** save to storage without updating state, useful in some cases */
		const save = useCallback((newValue: T) => {
			globalStorage[key] = newValue
			if (globalKeys.indexOf(key) === -1) {
				globalKeys.push(key)
				Storage.set({ key: keyOfKeyList, value: JSON.stringify(globalKeys) })
			}

			Storage.set({ key, value: JSON.stringify(newValue) })
		}, [])

		/** updates state and save to storage */
		const update = useCallback((newValue: T) => {
			setValue(newValue)
			save(newValue)
		}, [])

		return [value, update, save] as [typeof value, typeof update, typeof save]
	}

	return [KeyProvider, useKey] as [typeof KeyProvider, typeof useKey]
}

/** run this before ReactDOM.render */
export async function initStorage() {
	const storage: Record<string, any> = {}
	const keys: string[] = JSON.parse(
		(await Storage.get({ key: keyOfKeyList })).value ?? '[]',
	)
	for (const key of keys)
		storage[key] = JSON.parse((await Storage.get({ key })).value ?? 'null')
	;(globalThis as any)[keyOfStorage] = storage
	;(globalThis as any)[keyOfKeyList] = keys
}

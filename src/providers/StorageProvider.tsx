/**
 * working around @capacitor/storage to make it more React-friendly
 * feels like a cacheProvider with eager-loading
 * there isn't any cacheProvider package as far as I can tell unfortunately
 * probably should publish this as a gist
 * TODO: consider making this global
 * consider allow it to accept some sort of useValue hook
 * currently it uses useState but above would allow useReducer or useTracked
 * ^would allow me to cut some code while keeping this store library agnostic
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

type KeyContextData<T> = [
	T | undefined,
	Dispatch<SetStateAction<T | undefined>>,
]

type KeyProviderProps<T> = Omit<ProviderProps<KeyContextData<T>>, 'value'>

/**
 * creates key-value pair in storage, returning Provider that should be wrapped around component & hook to use storage
 * @param key string used to identify value in storage
 * @param initial initial value to use
 * @param onSave any modifications to make before saving
 * @param onLoad if using classes, this can be used to revive the class from JSON
 */
export function createKey<T>(
	key: string,
	initial: T,
	onSave?: (data: T) => T | undefined,
	onLoad?: (data: T) => T | undefined,
): [
	(props: KeyProviderProps<T>) => JSX.Element,
	() => [T, (newValue: T) => void, (newValue: T) => void],
]
export function createKey<T>(
	key: string,
	onSave?: (data: T) => T | undefined,
	onLoad?: (data: T) => T | undefined,
): [
	(props: KeyProviderProps<T>) => JSX.Element,
	() => [T | undefined, (newValue: T) => void, (newValue: T) => void],
]
export function createKey<T>(
	key: string,
	initial?: T,
	onSave?: (data: T) => T | undefined,
	onLoad?: (data: T) => T | undefined,
) {
	const globalStorage = (globalThis as any)[keyOfStorage] as
		| Record<string, T>
		| undefined
	const globalKeys = (globalThis as any)[keyOfKeyList] as string[] | undefined

	if (globalStorage === undefined || globalKeys === undefined)
		throw 'initStorage must be called before ReactDOM.render!'
	const getCachedValue = () => {
		const raw = globalStorage[key]
		if (onLoad && raw !== undefined) return onLoad(raw) ?? raw ?? initial
		else return raw ?? initial
	}

	const KeyContext = createContext<KeyContextData<T>>([
		initial, //if used outside context, returns initialValue used in createKey()
		() => {
			throw 'createKey Provider needed!'
		},
	])

	/** provider that should be wrapped around component using the storage */
	const KeyProvider = (props: KeyProviderProps<T>) => {
		const hook = useState(getCachedValue)
		return <KeyContext.Provider value={hook} {...props} />
	}

	/** hook to use storage */
	const useKey = () => {
		const [value, setValue] = useContext(KeyContext)

		/** save to storage without updating state, useful in some cases */
		const save = useCallback((newValue: T) => {
			if (onSave) newValue = onSave(newValue) ?? newValue
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

		return [value, update, save]
	}

	return [KeyProvider, useKey]
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

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

type KeyContextData<T> = {
	value?: T
	setValue: Dispatch<SetStateAction<T | undefined>>
}

type KeyProviderProps<T> = Omit<ProviderProps<KeyContextData<T>>, 'value'>

/** creates key-value pair in storage, returning Provider that should be wrapped around component & hook to use storage */
export function createKey<T>(
	key: string,
	initial: T,
): [
	(props: KeyProviderProps<T>) => JSX.Element,
	() => [T, (newValue: T) => void, (newValue: T) => void],
]
export function createKey<T>(
	key: string,
): [
	(props: KeyProviderProps<T>) => JSX.Element,
	() => [T | undefined, (newValue: T) => void, (newValue: T) => void],
]
export function createKey<T>(key: string, initial?: T) {
	const globalStorage = (globalThis as any)[keyOfStorage] as
		| Record<string, T>
		| undefined
	const globalKeys = (globalThis as any)[keyOfKeyList] as string[] | undefined

	if (globalStorage === undefined || globalKeys === undefined)
		throw 'initStorage must be called before ReactDOM.render!'
	const getCachedValue = () => globalStorage[key] ?? initial

	const KeyContext = createContext<KeyContextData<T>>({
		value: initial, //if used outside context, returns initialValue used in createKey()
		setValue: () => {
			throw 'createKey Provider needed!'
		},
	})

	/** provider that should be wrapped around component using the storage */
	const KeyProvider = (props: KeyProviderProps<T>) => {
		const [value, setValue] = useState(getCachedValue)
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

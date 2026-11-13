import { useSyncExternalStore } from 'react';
import { dataStore } from '../services/dataStore';

const subscribe = (listener) => dataStore.subscribe(listener);
const getSnapshot = () => dataStore.version;

export function useDataStoreVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useDataStoreVersion;


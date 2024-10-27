import { openDB } from 'idb';

const CACHE_DB_NAME = 'cache-db';
const CACHE_STORE_NAME = 'cache-store';
const VERSION_STORE_NAME = 'version-store';

let db; 

async function initDB() {
  db = await openDB(CACHE_DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore(CACHE_STORE_NAME, { keyPath: 'objectID' });
      database.createObjectStore(VERSION_STORE_NAME, { keyPath: 'id' });
    },
  });
}

async function fetchJSONFile(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to load ${filePath}`);
  }
  return response.json();
}

export async function initCache() {
  await initDB();

  const cacheVersionData = await fetchJSONFile('/cache/cache-version.json');
  const { version, file } = cacheVersionData;

  const currentVersion = await db.get(VERSION_STORE_NAME, 'version');

  if (!currentVersion || currentVersion.version !== version) {
    const newData = await fetchJSONFile(`${file}`);

    const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
    await tx.objectStore(CACHE_STORE_NAME).clear();

    for (const element of newData) {
      await tx.objectStore(CACHE_STORE_NAME).add(element);
    }
    await tx.done;

    await db.put(VERSION_STORE_NAME, { id: 'version', version });
  }
}

export const getElement = async (objectID) => {
  if (!db) return null;
  const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
  const store = tx.objectStore(CACHE_STORE_NAME);
  return store.get(objectID);
};

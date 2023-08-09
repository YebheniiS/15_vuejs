const DBNAME = 'scratchyDB';

const MEDIA = "media";
const STATE = "state";

let DB: IDBDatabase;

class DbObject {
    key?: string;
    blob?: Blob;
    etag?: string;
    localUrl?: string;
    value?: any;
}

enum StorageType {
    media = 'media',
    state = 'state'
}

export default {
    storage: StorageType,
    async initDB() {

        return new Promise<IDBDatabase>((resolve, reject) => {
            if (DB) {
                return resolve(DB);
            }
            const request = window.indexedDB.open(DBNAME);

            request.onerror = e => {
                console.error("Error opening database", e);
                reject('Error')
            }

            request.onsuccess = e => {
                DB = request.result
                resolve(DB);
            };

            request.onupgradeneeded = e => {
                console.log('upgradeneeded');
                const db = request.result;

                if (!db.objectStoreNames.contains(MEDIA)) {
                    const mediaStore = db.createObjectStore(MEDIA, { keyPath: "key" });
                    mediaStore.createIndex('etag', 'etag', { unique: true });
                }

                if (!db.objectStoreNames.contains(STATE)) {
                    db.createObjectStore(STATE, { keyPath: "key" });
                }
            }


        })
    },

    async dropObjectStore() {
        const db = await this.initDB();
        
        return new Promise<void>((resolve, reject) => {

            const transaction = db.transaction(MEDIA, 'readwrite');
            const storage = transaction.objectStore(MEDIA);

            storage.clear();


            transaction.oncomplete = () => {
                console.log('ObjectStore cleared successfully: ' + MEDIA)
                resolve()
            }

            transaction.onerror = (e) => {
                console.error("Error when clearing objectstore: " + MEDIA)
                reject(e.target)
            }


        })
        
    },

    async deleteRecord(key: string, storage: StorageType) {
        console.log(`deleting record: ${key}`);
        const db = await this.initDB();

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(storage, 'readwrite');

            transaction.oncomplete = () => {
                resolve()
            }

            const store = transaction.objectStore(storage);
            store.delete(key)
        })
    },
    async getRecord(key: string, storage: StorageType) {
        console.log(`getting record: ${key}`);
        const db = await this.initDB();

        return new Promise<DbObject>((resolve) => {
            const transaction = db.transaction(storage, 'readonly');

            transaction.oncomplete = () => {
                resolve(data)
            }

            const store = transaction.objectStore(storage)

            let data: DbObject;

            const query = store.get(key);

            query.onsuccess = (event) => {
                // @ts-ignore
                const result = event.target?.result as DbObject || null;
                // console.log('got result', result.key);
                data = result;
            }
        })
    },
    async getRecordByEtag(storage: StorageType, etag?: string,) {
        console.log(`getting record: ${etag}`);
        const db = await this.initDB();

        return new Promise<DbObject>((resolve) => {
            const transaction = db.transaction(storage, 'readonly');

            transaction.oncomplete = () => {
                resolve(data)
            }

            const store = transaction.objectStore(storage)

            let data: DbObject;
            if (!etag) return null;
            const query = store.get(etag);

            query.onsuccess = (event) => {
                // @ts-ignore
                const result = event.target?.result as RecordInterface || null;
                // console.log('got result', result.key);
                data = result;
            }
        })
    },
    async addRecord(record: DbObject, storage: StorageType) {
        console.log(`adding record: ${record.key}`);
        const db = await this.initDB();

        return new Promise<void>((resolve) => {
            const transaction = db.transaction(storage, 'readwrite');

            transaction.oncomplete = () => {
                console.log('record added: ' + record.key)
                resolve();
            }

            const store = transaction.objectStore(storage)

            store.put(record)
        })
    },
    async destroyRecords() {
        const db = await this.initDB();

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(DBNAME, 'readwrite');

            transaction.onerror = () => {
                reject(transaction.error)
            }

            transaction.oncomplete = () => {
                resolve()
            }

            for (const storage of db.objectStoreNames) {
                transaction.objectStore(storage).clear()
                console.log(`storage name ${storage} cleared`)
            }
        })
    }
}
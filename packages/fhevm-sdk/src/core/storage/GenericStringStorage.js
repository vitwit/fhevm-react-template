/**
 * Generic key-value storage for browser and Node.js environments.
 * Automatically selects storage backend based on environment.
 */
export class GenericStringStorage {
    _storage;
    _trace;
    constructor(options) {
        this._trace = options?.trace;
        if (typeof window !== "undefined" && window.indexedDB) {
            this._trace?.("[GenericStringStorage] Using IndexedDB backend");
            this._storage = new IndexedDBBackend("FhevmSDKStorage");
        }
        else {
            this._trace?.("[GenericStringStorage] Using in-memory Node backend");
            this._storage = new NodeMemoryBackend();
        }
    }
    async set(key, value) {
        this._trace?.(`[GenericStringStorage] set key=${key}`);
        await this._storage.set(key, value);
    }
    async get(key) {
        this._trace?.(`[GenericStringStorage] get key=${key}`);
        return this._storage.get(key);
    }
    async remove(key) {
        this._trace?.(`[GenericStringStorage] remove key=${key}`);
        await this._storage.remove(key);
    }
    async clear() {
        this._trace?.("[GenericStringStorage] clear all keys");
        await this._storage.clear();
    }
}
/** Node.js in-memory storage */
class NodeMemoryBackend {
    map = new Map();
    async set(key, value) {
        this.map.set(key, value);
    }
    async get(key) {
        return this.map.get(key) || null;
    }
    async remove(key) {
        this.map.delete(key);
    }
    async clear() {
        this.map.clear();
    }
}
/** IndexedDB storage for browsers */
class IndexedDBBackend {
    dbName;
    storeName = "keyval";
    constructor(dbName) {
        this.dbName = dbName;
    }
    async getDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async set(key, value) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            tx.objectStore(this.storeName).put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async get(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const request = tx.objectStore(this.storeName).get(key);
            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    }
    async remove(key) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            tx.objectStore(this.storeName).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    async clear() {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            tx.objectStore(this.storeName).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}

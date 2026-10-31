
const DB_NAME = "TymlyDatabase";
const DB_VERSION = 1;
const STORE_NAME = "engagements";

const TymlyDB = (() => {

    // Open or create the database
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: "id"
                    });

                    store.createIndex("date", "date", {
                        unique: false
                    });

                    store.createIndex("status", "status", {
                        unique: false
                    });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Add a new engagement
    async function addEngagement(engagement) {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            store.add(engagement);

            transaction.oncomplete = () => {
                db.close();
                resolve(engagement);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    // Retrieve all engagements
    async function getAllEngagements() {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);

            transaction.oncomplete = () => db.close();
            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    // Retrieve one engagement by ID
    async function getEngagement(id) {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);

            transaction.oncomplete = () => db.close();
            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    // Update an existing engagement
    async function updateEngagement(engagement) {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            store.put(engagement);

            transaction.oncomplete = () => {
                db.close();
                resolve(engagement);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    // Delete an engagement
    async function deleteEngagement(id) {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            store.delete(id);

            transaction.oncomplete = () => {
                db.close();
                resolve(true);
            };

            transaction.onerror = () => {
                db.close();
                reject(transaction.error);
            };
        });
    }

    return {
        openDB,
        addEngagement,
        getAllEngagements,
        getEngagement,
        updateEngagement,
        deleteEngagement
    };

})();

window.TymlyDB = TymlyDB;

const cacheStore = new Map();

const getCacheEntry = (key) => {
    const entry = cacheStore.get(key);

    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        cacheStore.delete(key);
        return null;
    }

    return entry.value;
};

const setCacheEntry = (key, value, ttlInSeconds = 300) => {
    cacheStore.set(key, {
        value,
        expiresAt: Date.now() + ttlInSeconds * 1000,
    });

    return value;
};

const clearExpiredEntries = () => {
    for (const [key, entry] of cacheStore.entries()) {
        if (entry.expiresAt <= Date.now()) {
            cacheStore.delete(key);
        }
    }
};

setInterval(clearExpiredEntries, 5 * 60 * 1000).unref();

module.exports = {
    getCacheEntry,
    setCacheEntry,
};
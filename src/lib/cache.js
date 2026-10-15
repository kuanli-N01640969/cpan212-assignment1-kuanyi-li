// TODO (you): an in-memory cache where each entry expires after a set time.
// It needs a way to get a value (counting a hit or a miss), store a value,
// and report { entries, hits, misses, ttlSeconds }. The exact counting rules
// are on the assignment page. A Map with { value, expiresAt } entries works well.
export class TtlCache {
    //Track cache hit/miss and report stats
    constructor(ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
    }
    //Retrieve value and record hit/miss
    get(key) {
    const entry = this.cache.get(key);
    //Missed cache
    if (!entry) {
        this.misses += 1;
        return undefined;
    }
    //If the entry has expired, remove it and count a miss
    if (Date.now() >= entry.expiresAt) {
        this.cache.delete(key);
        this.misses += 1;
        return undefined;
    }
    //Successful cache
    this.hits += 1;
    return entry.value;
    }
    //Store value
    set(key, value) {
        this.cache.set(key, {value, expiresAt: Date.now() + this.ttlSeconds * 1000,});
    }
}
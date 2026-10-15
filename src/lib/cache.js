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

}
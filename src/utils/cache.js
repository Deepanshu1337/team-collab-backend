// Simple in-memory cache implementation
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = 300) { // Default TTL is 5 minutes
    const expiration = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiration });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Create a global cache instance
const cache = new SimpleCache();

export default cache;
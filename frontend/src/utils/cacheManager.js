/**
 * Simple in-memory cache for API responses
 * Reduces redundant API calls and improves performance
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * Get cached data if it exists and is not expired
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   * @returns {any|null} - Cached data or null
   */
  get(key, ttl = 5 * 60 * 1000) {
    if (!this.cache.has(key)) {
      return null;
    }

    const timestamp = this.timestamps.get(key);
    const now = Date.now();

    // Check if cache is expired
    if (now - timestamp > ttl) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
  }

  /**
   * Invalidate cache by key or pattern
   * @param {string|RegExp} pattern - Key or pattern to invalidate
   */
  invalidate(pattern) {
    if (typeof pattern === 'string') {
      this.cache.delete(pattern);
      this.timestamps.delete(pattern);
    } else if (pattern instanceof RegExp) {
      // Invalidate all keys matching pattern
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
          this.timestamps.delete(key);
        }
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Create a cached version of an API function
 * @param {Function} apiFunction - The API function to cache
 * @param {string} cacheKey - The cache key
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Function} - Cached version of the function
 */
export const withCache = (apiFunction, cacheKey, ttl = 5 * 60 * 1000) => {
  return async (...args) => {
    // Create unique cache key with arguments
    const key = `${cacheKey}-${JSON.stringify(args)}`;
    
    // Check cache first
    const cached = cacheManager.get(key, ttl);
    if (cached !== null) {
      console.log(`Cache hit: ${key}`);
      return cached;
    }

    // Cache miss - call API
    console.log(`Cache miss: ${key}`);
    const result = await apiFunction(...args);
    
    // Store in cache
    cacheManager.set(key, result);
    
    return result;
  };
};

/**
 * Debounce function for search/filter operations
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for scroll/resize events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default cacheManager;

// src/services/apiCache.js
import axios from 'axios';

// In-memory response cache and pending request map
const responseCache = new Map();
const pendingRequests = new Map();

// Default cache expiration time: 3 minutes (180,000 ms)
const DEFAULT_CACHE_TTL = 3 * 60 * 1000;

// Endpoints that should be cached for fast switching
const CACHEABLE_ENDPOINTS = [
  '/api/equipment',
  '/api/lab',
  '/api/laboratories',
  '/api/maintenance',
  '/api/activity-logs',
  '/api/reports',
];

// Helper to determine if a URL matches cacheable paths
const isCacheableUrl = (url = '') => {
  return CACHEABLE_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Generate a deterministic cache key from axios config
const getCacheKey = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${method}:${url}:${params}`;
};

/**
 * Manually invalidate cache matching a substring or pattern
 * Example: invalidateCache('/api/equipment')
 */
export const invalidateCache = (pattern) => {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = () => {
  responseCache.clear();
  pendingRequests.clear();
};

/**
 * Invalidate related caches when a mutation (POST, PUT, DELETE, PATCH) happens
 */
const autoInvalidateRelatedCache = (url = '') => {
  if (url.includes('/api/equipment') || url.includes('/api/borrow')) {
    invalidateCache('/api/equipment');
    invalidateCache('/api/borrow');
  }
  if (url.includes('/api/maintenance')) {
    invalidateCache('/api/maintenance');
    invalidateCache('/api/equipment');
  }
  if (url.includes('/api/lab') || url.includes('/api/laboratories')) {
    invalidateCache('/api/lab');
    invalidateCache('/api/laboratories');
  }
  if (url.includes('/api/activity-log')) {
    invalidateCache('/api/activity-log');
  }
};

/**
 * Setup caching adapter on an Axios instance
 */
export function setupAxiosCache(axiosInstance) {
  const originalAdapter = axiosInstance.getAdapter(axiosInstance.defaults.adapter);

  axiosInstance.defaults.adapter = async function cachedAdapter(config) {
    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';

    // Handle mutations (POST, PUT, DELETE, PATCH) -> perform request then invalidate cache
    if (method !== 'get') {
      try {
        const response = await originalAdapter(config);
        autoInvalidateRelatedCache(url);
        return response;
      } catch (err) {
        throw err;
      }
    }

    // Check if caching is explicitly bypassed (e.g. { noCache: true } or headers 'no-cache')
    const bypassCache =
      config.noCache ||
      config.headers?.['Cache-Control'] === 'no-cache' ||
      config.headers?.['pragma'] === 'no-cache';

    if (bypassCache || !isCacheableUrl(url)) {
      return originalAdapter(config);
    }

    const cacheKey = getCacheKey(config);
    const ttl = config.ttl || DEFAULT_CACHE_TTL;
    const now = Date.now();

    // 1. Check if cached and still fresh
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (now - cached.timestamp < ttl) {
        // Return a fresh clone of the cached response with current request config
        return {
          ...cached.response,
          config,
          fromCache: true,
        };
      } else {
        // Expired
        responseCache.delete(cacheKey);
      }
    }

    // 2. In-flight request deduplication: if identical request is already running, reuse promise
    if (pendingRequests.has(cacheKey)) {
      const sharedResponse = await pendingRequests.get(cacheKey);
      return {
        ...sharedResponse,
        config,
        fromCache: true,
      };
    }

    // 3. Make real network request
    const requestPromise = (async () => {
      try {
        const response = await originalAdapter(config);
        responseCache.set(cacheKey, {
          response: {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: { ...response.headers },
          },
          timestamp: Date.now(),
        });
        return response;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  };
}

// Automatically configure default axios instance
setupAxiosCache(axios);

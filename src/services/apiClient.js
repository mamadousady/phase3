const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiError extends Error {
    constructor(status, message, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}
class NetworkError extends Error {
    constructor(message = 'Erreur réseau, veuillez vérifier votre connexion') {
        super(message);
        this.name = 'NetworkError';
    }
}
class TimeoutError extends Error {
    constructor(message = 'La requête a expiré') {
        super(message);
        this.name = 'TimeoutError';
    }
}
const DEFAULT_TIMEOUT = 30000; 
const RETRY_CONFIG = {
    maxRetries: 3,
    delay: 1000, 
    backoff: 2 
};

const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    let data;
    try {
        data = isJson ? await response.json() : await response.text();
    } catch (error) {
        throw new ApiError(response.status, 'Erreur de parsing de la réponse', null);
    }
    if (!response.ok) {
        const errorMessage = isJson 
            ? data.message || data.error || `Erreur ${response.status}`
            : `Erreur ${response.status} : ${response.statusText}`;
        throw new ApiError(response.status, errorMessage, data);
    }
    return data;
};

const withTimeout = (fetchPromise, timeoutMs = DEFAULT_TIMEOUT) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new TimeoutError(`La requête a expiré après ${timeoutMs}ms`));
        }, timeoutMs);

        fetchPromise
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeoutId));
    });
};

const withRetry = async (requestFn, retries = RETRY_CONFIG.maxRetries, delay = RETRY_CONFIG.delay, backoff = RETRY_CONFIG.backoff) => {
    let lastError;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;
            
            // Ne pas retenter pour certaines erreurs
            if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                throw error;
            }
            if (error instanceof TimeoutError && attempt < retries) {
                console.warn(`⏳ Tentative ${attempt}/${retries} échouée (timeout), nouvelle tentative dans ${currentDelay}ms`);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= backoff;
                continue;
            }
            
            if (attempt < retries) {
                console.warn(`🔄 Tentative ${attempt}/${retries} échouée, nouvelle tentative dans ${currentDelay}ms`);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= backoff;
            } else {
                throw lastError;
            }
        }
    }
    throw lastError;
};

class ApiClient {
    constructor(options = {}) {
        this.baseURL = options.baseURL || API_BASE_URL;
        this.defaultHeaders = options.headers || {
            'Content-Type': 'application/json',
        };
        this.timeout = options.timeout || DEFAULT_TIMEOUT;
        this.retryConfig = options.retryConfig || RETRY_CONFIG;
        this.enableCache = options.enableCache !== undefined ? options.enableCache : true;
        this.cacheTTL = options.cacheTTL || 300;
        this.lastHeaders = {};
        this.cache = new Map();
    }
        _getCacheKey(endpoint, options = {}) {
            const { method = 'GET', body, headers } = options;
            const bodyStr = body ? JSON.stringify(body) : '';
           
            const hasAuth = headers?.Authorization || headers?.authorization;
            return `${method}:${endpoint}:${bodyStr}:${hasAuth ? 'auth' : 'public'}`;
        }
        _isCacheable(endpoint, options = {}) {
            const { method = 'GET' } = options;
           
            if (method !== 'GET') return false;
           
            if (endpoint.includes('/auth')) return false;
           
            if (!this.enableCache) return false;
            
            if (options.cache === 'no-cache') return false;
            return true;
        }
        _getFromCache(key) {
            if (!this.enableCache) return null;
            
            const cached = this.cache.get(key);
            if (!cached) return null;
            
            const { data, timestamp, ttl } = cached;
            const age = (Date.now() - timestamp) / 1000;
            
            if (age > ttl) {
                this.cache.delete(key);
                return null;
            }
            
            return data;
        }

        _setInCache(key, data, ttl = this.cacheTTL) {
            if (!this.enableCache) return;
            
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                ttl
            });
        }

        invalidateCache(keyPattern) {
            if (!keyPattern) {
                this.cache.clear();
                return;
            }
            
            for (const key of this.cache.keys()) {
                if (key.includes(keyPattern)) {
                    this.cache.delete(key);
                }
            }
        }
        invalidateLieuCache(lieuId) {
            this.invalidateCache(`/lieux/${lieuId}`);
            this.invalidateCache('/lieux');
            this.invalidateCache(`lieux_ambiance_${lieuId}`);
        }
        getCacheStats() {
            const entries = Array.from(this.cache.entries());
            const total = entries.length;
            const expired = entries.filter(([_, value]) => {
                const age = (Date.now() - value.timestamp) / 1000;
                return age > value.ttl;
            }).length;
            
            return {
                total,
                expired,
                active: total - expired,
                keys: Array.from(this.cache.keys())
            };
        }
        async request(endpoint, options = {}) {
            const {
                method = 'GET',
                headers = {},
                body,
                timeout = this.timeout,
                retries = this.retryConfig.maxRetries,
                cache = true,
                cacheTTL = this.cacheTTL,
                skipCache = false,
                ...restOptions
            } = options;
    
            const url = `${this.baseURL}${endpoint}`;
            const token = localStorage.getItem('authToken');
            
            
            const finalHeaders = {
                ...this.defaultHeaders,
                ...headers,
                ...(token && { 'Authorization': `Bearer ${token}` }),
            };
            const cacheKey = this._getCacheKey(endpoint, options);
            const isCacheable = !skipCache && cache && this._isCacheable(endpoint, options);
            
            if (isCacheable) {
                const cachedData = this._getFromCache(cacheKey);
                if (cachedData !== null) {
                    console.log(`📦 Cache HIT: ${method} ${endpoint}`);
                    return cachedData;
                }
                console.log(`📦 Cache MISS: ${method} ${endpoint}`);
            }
    
            
            const fetchOptions = {
                method,
                headers: finalHeaders,
                ...restOptions,
            };
            if (body) {
                fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
            }
    
           
            const requestFn = () => 
                withTimeout(fetch(url, fetchOptions), timeout)
                    .then(response => handleResponse(response, timeout));
                    try {
                        const data = await withRetry(requestFn, retries);
                        
                       
                        if (isCacheable) {
                            this._setInCache(cacheKey, data, cacheTTL);
                            console.log(`💾 Cache STORED: ${method} ${endpoint} (TTL: ${cacheTTL}s)`);
                        }
                        
                        return data;
                    } catch (error) {
                      
                        if (isCacheable && (error instanceof NetworkError || error instanceof TimeoutError)) {
                            
                            const cachedData = this.cache.get(cacheKey);
                            if (cachedData) {
                                console.warn(`⚠️ Utilisation du cache expiré pour ${method} ${endpoint} (erreur réseau)`);
                                return cachedData.data;
                            }
                        }
                        throw error;
                    }
                }
                async get(endpoint, options = {}) {
                    return this.request(endpoint, { method: 'GET', ...options });
                }
                async post(endpoint, data, options = {}) {
                    
                    const shouldInvalidate = endpoint.includes('/lieux') || endpoint.includes('/observations');
                    
                    const result = await this.request(endpoint, { 
                        method: 'POST', 
                        body: data, 
                        ...options,
                        skipCache: true
                    });
                    if (shouldInvalidate) {
                        this.invalidateCache('/lieux');
                        if (endpoint.includes('/lieux') && data?.lieuId) {
                            this.invalidateLieuCache(data.lieuId);
                        }
                        console.log('🧹 Cache invalidé après POST');
                    }
                    
                    return result;
                }
                async put(endpoint, data, options = {}) {
                    const shouldInvalidate = endpoint.includes('/lieux') || endpoint.includes('/observations');
                    
                    const result = await this.request(endpoint, { 
                        method: 'PUT', 
                        body: data, 
                        ...options,
                        skipCache: true
                    });
                    
                    if (shouldInvalidate) {
                        this.invalidateCache('/lieux');
                        const id = endpoint.split('/').pop();
                        if (id) {
                            this.invalidateLieuCache(id);
                        }
                        console.log('🧹 Cache invalidé après PUT');
                    }
                    
                    return result;
                }
                async delete(endpoint, options = {}) {
                    const shouldInvalidate = endpoint.includes('/lieux') || endpoint.includes('/observations');
                    
                    const result = await this.request(endpoint, { 
                        method: 'DELETE', 
                        ...options,
                        skipCache: true
                    });
                    
                    if (shouldInvalidate) {
                        this.invalidateCache('/lieux');
                        const id = endpoint.split('/').pop();
                        if (id) {
                            this.invalidateLieuCache(id);
                        }
                        console.log('🧹 Cache invalidé après DELETE');
                    }
                    
                    return result;
                }
                getLastHeaders() {
                    return this.lastHeaders || {};
                }
            }const apiClient = new ApiClient();
            export { 
                ApiClient, 
                ApiError, 
                NetworkError, 
                TimeoutError 
            };
    
    

export default apiClient;
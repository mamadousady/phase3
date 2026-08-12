import { useEffect, useState, useRef, useCallback } from 'react';

export function useApi(apiFunction,dependencies,options){
    dependencies = dependencies || [];
    options = options || {};
    var initialData = options.initialData || null;
    var skip = options.skip || false;
    var enableCache = options.enableCache !== undefined ? options.enableCache : false;
    var cacheTTL = options.cacheTTL || 300;
    var cacheKey = options.cacheKey || null;
    var onSuccess = options.onSuccess || null;
    var onError = options.onError || null;
    var retries = options.retries || 3;
    var timeout = options.timeout || 30000;
    
    var [data, setData] = useState(initialData);
    var [loading, setLoading] = useState(!skip);
    var [error, setError] = useState(null);
    var [isEmpty, setIsEmpty] = useState(false);
    var [isCached, setIsCached] = useState(false);

    var isMounted = useRef(true);
    var isFetching = useRef(false);
    var cacheKeyRef = useRef(cacheKey);
    
    var loadFromCache = useCallback(function() {
        if (!enableCache || !cacheKeyRef.current) return null;
        
        try {
            var cached = localStorage.getItem('cache_' + cacheKeyRef.current);
            if (cached) {
                var parsed = JSON.parse(cached);
                var age = (Date.now() - parsed.timestamp) / 1000;
                if (age < cacheTTL) {
                    return parsed.data;
                }
            }
        } catch (e) {
            // Ignorer les erreurs de cache
        }
        return null;
    }, [enableCache, cacheTTL]);
    var saveToCache = useCallback(function(dataToCache) {
        if (!enableCache || !cacheKeyRef.current) return;
        
        try {
            localStorage.setItem('cache_' + cacheKeyRef.current, JSON.stringify({
                data: dataToCache,
                timestamp: Date.now()
            }));
        } catch (e) {
            // Ignorer les erreurs de cache
        }
    }, [enableCache]);
    var invalidateCache = useCallback(function() {
        if (!cacheKeyRef.current) return;
        try {
            localStorage.removeItem('cache_' + cacheKeyRef.current);
        } catch (e) {
            // Ignorer
        }
    }, []);
    var fetchData = useCallback(function(forceRefresh) {
        forceRefresh = forceRefresh || false;

        // Éviter les appels simultanés
        if (isFetching.current) {
            return Promise.resolve();
        }

        isFetching.current = true;
        if (!forceRefresh && enableCache) {
            var cachedData = loadFromCache();
            if (cachedData !== null) {
                if (isMounted.current) {
                    setData(cachedData);
                    setIsCached(true);
                    setLoading(false);
                    setError(null);
                    setIsEmpty(false);
                }
                isFetching.current = false;
                return Promise.resolve(cachedData);
            }
        }
        if (isMounted.current) {
            setLoading(true);
            setError(null);
            setIsEmpty(false);
            setIsCached(false);
        }
        var fetchWithTimeout = function() {
            return new Promise(function(resolve, reject) {
                var timeoutId = setTimeout(function() {
                    reject(new Error('La requête a expiré après ' + timeout + 'ms'));
                }, timeout);

                var result = apiFunction();
                Promise.resolve(result)
                    .then(function(data) {
                        clearTimeout(timeoutId);
                        resolve(data);
                    })
                    .catch(function(err) {
                        clearTimeout(timeoutId);
                        reject(err);
                    });
            });
        };
        var fetchWithRetry = function(retryCount) {
            retryCount = retryCount || 0;
            return fetchWithTimeout()
                .catch(function(err) {
                    if (retryCount < retries) {
                        var delay = Math.pow(2, retryCount) * 1000;
                        console.warn('🔄 Tentative ' + (retryCount + 1) + '/' + retries + ' échouée, nouvelle tentative dans ' + delay + 'ms');
                        return new Promise(function(resolve) {
                            setTimeout(function() {
                                resolve(fetchWithRetry(retryCount + 1));
                            }, delay);
                        });
                    }
                    throw err;
                });
        };
        return fetchWithRetry()
            .then(function(result) {
                if (isMounted.current) {
                    setData(result);
                    setLoading(false);
                    setError(null);
                    setIsEmpty(!result || (Array.isArray(result) && result.length === 0) || (typeof result === 'object' && Object.keys(result).length === 0));
                    
                    // Sauvegarder dans le cache
                    if (enableCache) {
                        saveToCache(result);
                        setIsCached(true);
                    }

                    if (onSuccess) {
                        onSuccess(result);
                    }
                }
                isFetching.current = false;
                return result;
            })
            .catch(function(err) {
                if (isMounted.current) {
                    var errorMessage = err.message || 'Une erreur est survenue';
                    setError(errorMessage);
                    setLoading(false);
                    setData(initialData);
                    
                    if (err.status === 404) {
                        setIsEmpty(true);
                    }

                    if (onError) {
                        onError(err);
                    }
                }
                isFetching.current = false;
                throw err;
            });
    }, [apiFunction, initialData, enableCache, loadFromCache, saveToCache, onSuccess, onError, timeout, retries]);

    var refetch = useCallback(function() {
        return fetchData(true);
    }, [fetchData]);
    var reset = useCallback(function() {
        if (isMounted.current) {
            setData(initialData);
            setLoading(false);
            setError(null);
            setIsEmpty(false);
            setIsCached(false);
            isFetching.current = false;
        }
    }, [initialData]);
    useEffect(function() {
        isMounted.current = true;

        if (!skip) {
            fetchData(false);
        } else {
            setLoading(false);
        }

        return function() {
            isMounted.current = false;
            isFetching.current = true;
        };
    }, dependencies);
    return {
        data: data,
        loading: loading,
        error: error,
        isEmpty: isEmpty,
        isCached: isCached,
        refetch: refetch,
        reset: reset,
        invalidateCache: invalidateCache
    };
}
export function usePaginatedApi(apiFunction, dependencies, options) {
    dependencies = dependencies || [];
    options = options || {};
    
    var initialPage = options.initialPage || 1;
    var limit = options.limit || 10;
    var enableCache = options.enableCache || false;

    var [data, setData] = useState([]);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState(null);
    var [hasMore, setHasMore] = useState(true);
    var [page, setPage] = useState(initialPage);
    var [isCached, setIsCached] = useState(false);

    var isMounted = useRef(true);
    var isFetching = useRef(false);
    var cacheKey = useRef('paginated_' + (options.cacheKey || 'default'));

    var loadFromCache = useCallback(function() {
        if (!enableCache) return null;
        
        try {
            var cached = localStorage.getItem('cache_' + cacheKey.current);
            if (cached) {
                var parsed = JSON.parse(cached);
                var age = (Date.now() - parsed.timestamp) / 1000;
                if (age < 300) { // 5 minutes
                    return parsed.data;
                }
            }
        } catch (e) {
            // Ignorer
        }
        return null;
    }, [enableCache]);
    var saveToCache = useCallback(function(dataToCache) {
        if (!enableCache) return;
        
        try {
            localStorage.setItem('cache_' + cacheKey.current, JSON.stringify({
                data: dataToCache,
                timestamp: Date.now()
            }));
        } catch (e) {
            // Ignorer
        }
    }, [enableCache]);
    var loadMore = useCallback(function() {
        if (!loading && hasMore) {
            setPage(function(prev) {
                return prev + 1;
            });
        }
    }, [loading, hasMore]);
    var reset = useCallback(function() {
        if (isMounted.current) {
            setData([]);
            setPage(initialPage);
            setHasMore(true);
            setError(null);
            setIsCached(false);
        }
    }, [initialPage]);
    useEffect(function() {
        isMounted.current = true;
        isFetching.current = false;

        var fetchData = function() {
            if (isFetching.current) return;
            isFetching.current = true;

            // Vérifier le cache pour la première page
            if (page === initialPage && enableCache) {
                var cachedData = loadFromCache();
                if (cachedData && cachedData.data && cachedData.data.length > 0) {
                    if (isMounted.current) {
                        setData(cachedData.data);
                        setHasMore(cachedData.hasMore !== undefined ? cachedData.hasMore : true);
                        setIsCached(true);
                        setLoading(false);
                    }
                    isFetching.current = false;
                    return;
                }
            }
            if (isMounted.current) {
                setLoading(true);
                setError(null);
            }
            apiFunction(page, limit)
            .then(function(result) {
                if (isMounted.current) {
                    // Fusionner les données
                    var newData = result.data || [];
                    var hasMoreData = result.hasMore !== undefined ? result.hasMore : (newData.length === limit);
                    
                    if (page === initialPage) {
                        setData(newData);
                    } else {
                        setData(function(prev) {
                            return prev.concat(newData);
                        });
                    }
                    setHasMore(hasMoreData);
                        setLoading(false);
                        setIsCached(false);

                        // Sauvegarder dans le cache pour la première page
                        if (page === initialPage && enableCache) {
                            saveToCache({
                                data: newData,
                                hasMore: hasMoreData
                            });
                        }
                    }
                    isFetching.current = false;
                })
                .catch(function(err) {
                    if (isMounted.current) {
                        setError(err.message || 'Une erreur est survenue');
                        setLoading(false);
                    }
                    isFetching.current = false;
                });
        };

        fetchData();
        return function() {
            isMounted.current = false;
            isFetching.current = true;
        };
    }, [apiFunction, page, limit, initialPage, enableCache, loadFromCache, saveToCache]);

    var invalidateCache = useCallback(function() {
        try {
            localStorage.removeItem('cache_' + cacheKey.current);
            setIsCached(false);
        } catch (e) {
            // Ignorer
        }
    }, []);
    return {
        data: data,
        loading: loading,
        error: error,
        hasMore: hasMore,
        loadMore: loadMore,
        reset: reset,
        isCached: isCached,
        invalidateCache: invalidateCache
    };
}
export function useCachedApi(cacheKey, apiFunction, dependencies, options) {
    options = options || {};
    options.cacheKey = cacheKey;
    options.enableCache = true;
    return useApi(apiFunction, dependencies, options);
}
export default useApi;


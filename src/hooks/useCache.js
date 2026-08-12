import {useState,useEffect,useCallback} from 'react';

export function useCache(key,fetchFunction,options={}){

    const {ttl=3600,
        skip=false,
        initialData = null,
        onSuccess = null,
        onError = null
    }=options;

    const[data,setData]=useState(initialData);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const [isCached, setIsCached] = useState(false);

    const cacheKey=`cache_${key}`;

    const loadFromCache=useCallback(()=>{
        try{
            const cached = localStorage.getItem(cacheKey);
            if(cached){
                const { data: cachedData, timestamp } = JSON.parse(cached);
                const age = (Date.now() - timestamp)

                if(age<ttl){
                    setData(cachedData);
                    setIsCached(true);
                    return true;
                }
            }
            return false;

        }catch(err){
            console.warn(`Erreur lecture cache ${key}:`, err);
            return false;
        }
    },[cacheKey,ttl,key]);

    const saveToCache=useCallback((dataToCache)=>{
        try{
            localStorage.setItem(cacheKey, JSON.stringify({
                data: dataToCache,
                timestamp: Date.now()
            }));
            setIsCached(true);
        }catch(err){
            console.warn(`Erreur sauvegarde cache ${key}:`, err);
        }
    },[cacheKey]);

    const invalidate=useCallback(() => {
        try {
            localStorage.removeItem(cacheKey);
            setIsCached(false);
            setData(initialData);
        } catch (err) {
            console.warn(`Erreur invalidation cache ${key}:`, err);
        }
    }, [cacheKey, initialData]);

    const fetchData=useCallback( async (forceRefresh=false)=>{
        if(skip){
            setLoading(false);
            return;

        }
        setLoading(true);
        setError(null);

        try{
            const result = await fetchFunction();
            setData(result);
            saveToCache(result);
            if (onSuccess) onSuccess(result);
        } catch(err){
            setError(err.message || 'Une erreur est survenue');
            if (onError) onError(err);
        }

        try{
            const cached = localStorage.getItem(cacheKey);
            if(cached){
                const{data:cachedData}=JSON.parse(cached);
                setData(cachedData);
                setIsCached(true);
            }
        }catch(err){

        }finally{
            setLoading(false);
        }

    },[key,fetchFunction,skip,loadFromCache,saveToCache,onSuccess,onError]);

    const refetch=useCallback(()=>{
        return fetchData(true);
    },[fetchData]);


    useEffect(()=>{
        if(!skip){
            fetchData(false);
        }
    },[skip]);

    return{
        data,loading,error,refetch,invalidate,isCached,
        isExpired:()=>{
            try{
                const cached = localStorage.getItem(cacheKey);
                if (!cached) return true;
                const { timestamp } = JSON.parse(cached);
                return (Date.now() - timestamp) / 1000 > ttl;

            }catch(err){
                return true;
            }
        },
        getAge:()=>{
            try{
                const cached = localStorage.getItem(cacheKey);
                if (!cached) return null;
                const { timestamp } = JSON.parse(cached);
                return Math.round((Date.now() - timestamp) / 1000);
            }catch{
                return null;

            }
        }
    };

}

export function useMultiCache(caches){
    const results = {};
    const keys = Object.keys(caches);

    keys.forEach(key=>{
        const{ fetch, options = {} } = caches[key];
        results[key] = useCache(key, fetch, options);

    });
    return results;
}

export function useAutoCache(key,fetchFunction,dependencies=[],options={}){
    const cache = useCache(key, fetchFunction, options);

    useEffect(()=>{
        if(dependencies.length>0){
            cache.invalidate();

        }
    },[dependencies]);
    return cache;
}

export default useCache;
const cacheServices=require("../services/cacheService");

const cacheMiddleware=(ttl=300)=>{
    return(req,res,next)=>{
        if(cacheServices.isCacheable(req)){
            return next();
        }
        const cacheKey = req.originalUrl || req.url;
        const cached = cacheServices.get(cacheKey);
        if(cached){
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached);
        }
        const originalJson = res.json;
        res.json=function(data){
            if (res.statusCode < 400) {
                cacheServices.set(cacheKey, data, ttl);
                res.setHeader('X-Cache', 'MISS');
            }
            return originalJson.call(this, data);
        };
        next();

    };
};
const invalideCache=(pattern)=>{
    return(req,res,next)=>{
        const originalJson = res.json;
        res.json=function(data){

            if(res.statusCode>=200&& res.statusCode<300){
                if(pattern==='lieu'){
                    cacheServices.invalidateLieu(req.params.id);
                }
                else if(pattern==='all'){
                    cacheServices.invalidateAllLieux();

                }
            }
            return originalJson.call(this, data);
        };
        next();

    };
};

module.exports = {
    cacheMiddleware,
    invalideCache
};

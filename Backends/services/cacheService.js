var NodeCache = require('node-cache');

function CacheService() {
    this.cache = new NodeCache({
        stdTTL: 300,
        checkperiod: 120,
        useClones: false
    });
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.invalidations = 0;
    this.startTime = new Date();
}

CacheService.prototype.resetStats = function() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.invalidations = 0;
    this.startTime = new Date();
};

CacheService.prototype.get = function(key) {
    var value = this.cache.get(key);
    if (value !== undefined) {
        this.hits++;
        return value;
    }
    this.misses++;
    return null;
};

CacheService.prototype.set = function(key, value, ttl) {
    ttl = ttl || 300;
    var success = this.cache.set(key, value, ttl);
    if (success) {
        this.sets++;
    }
    return success;
};

CacheService.prototype.del = function(key) {
    var deleted = this.cache.del(key);
    if (deleted > 0) {
        this.deletes += deleted;
    }
    return deleted;
};

CacheService.prototype.has = function(key) {
    return this.cache.has(key);
};

CacheService.prototype.keys = function(pattern) {
    var keys = this.cache.keys();
    if (pattern) {
        var regex = new RegExp(pattern);
        var result = [];
        for (var i = 0; i < keys.length; i++) {
            if (regex.test(keys[i])) {
                result.push(keys[i]);
            }
        }
        return result;
    }
    return keys;
};

CacheService.prototype.flush = function() {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.invalidations = 0;
};

CacheService.prototype.invalidateLieu = function(lieuId) {
    this.invalidations++;
    this.del('lieu_' + lieuId);
    this.del('lieux_ambiance_' + lieuId);
    this.del('lieux_details_' + lieuId);
    this.invalidateAllLieux();
};

CacheService.prototype.invalidateAllLieux = function() {
    this.invalidations++;
    this.del('lieux_list');
    var keys = this.cache.keys();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.indexOf('lieu_') === 0 || key.indexOf('lieux_') === 0) {
            this.del(key);
        }
    }
};

CacheService.prototype.invalidateUtilisateur = function(userId) {
    this.invalidations++;
    this.del('utilisateur_' + userId);
    this.del('utilisateur_' + userId + '_observations');
};

CacheService.prototype.invalidateAllObservations = function() {
    this.invalidations++;
    var keys = this.cache.keys();
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('observations_') === 0) {
            this.del(keys[i]);
        }
    }
};

CacheService.prototype.isCacheable = function(req) {
    if (req.method !== 'GET') return false;
    if (req.path && req.path.indexOf('/auth') !== -1) return false;
    if (req.query) {
        if (req.query.page || req.query.limit || req.query.skip) return false;
        if (req.query.search || req.query.q) return false;
    }
    if (req.headers && req.headers['cache-control'] === 'no-cache') return false;
    return true;
};

CacheService.prototype.generateKey = function(req) {
    var base = req.originalUrl || req.url || '';
    var userId = (req.utilisateur && req.utilisateur._id) ? req.utilisateur._id : 'public';
    var key = base + '_' + userId;
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
};

CacheService.prototype.getTTL = function(req, defaultTTL) {
    defaultTTL = defaultTTL || 300;
    if (req.path && req.path.indexOf('/ambiance') !== -1) {
        return 180;
    }
    if (req.path && req.path.indexOf('/lieux') !== -1 && req.path.indexOf('/ambiance') === -1) {
        return 600;
    }
    return defaultTTL;
};

CacheService.prototype.getStats = function() {
    var total = this.hits + this.misses;
    var hitRate = total > 0 ? Math.round((this.hits / total) * 100) : 0;
    var uptime = Math.round((new Date() - this.startTime) / 1000);
    var days = Math.floor(uptime / 86400);
    var hours = Math.floor((uptime % 86400) / 3600);
    var minutes = Math.floor((uptime % 3600) / 60);
    var seconds = uptime % 60;
    var uptimeFormatted = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
    
    return {
        hits: this.hits,
        misses: this.misses,
        hitRate: hitRate,
        sets: this.sets,
        deletes: this.deletes,
        invalidations: this.invalidations,
        keyCount: this.cache.keys().length,
        uptime: uptime,
        uptimeFormatted: uptimeFormatted,
        startTime: this.startTime.toISOString()
    };
};

CacheService.prototype.getOrFetch = function(key, fetcher, ttl) {
    ttl = ttl || 300;
    var self = this;
    
    var cached = this.get(key);
    if (cached !== null) {
        return Promise.resolve(cached);
    }
    
    return new Promise(function(resolve, reject) {
        try {
            var result = fetcher();
            Promise.resolve(result)
                .then(function(value) {
                    self.set(key, value, ttl);
                    resolve(value);
                })
                .catch(reject);
        } catch (err) {
            reject(err);
        }
    });
};

CacheService.prototype.mget = function(keys) {
    var result = {};
    for (var i = 0; i < keys.length; i++) {
        result[keys[i]] = this.get(keys[i]);
    }
    return result;
};




CacheService.prototype.mset = function(entries, ttl) {
    ttl = ttl || 300;
    var count = 0;
    var keys = Object.keys(entries);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = entries[key];
        
       
        if (value === undefined || value === null) {
            continue;
        }
        
       
        var isSerializable = true;
        try {
            
            if (typeof value === 'object' && value !== null) {
               
                if (typeof value.toString === 'function') {
                    try {
                        value.toString();
                    } catch (e) {
                        isSerializable = false;
                    }
                }
               
                if (isSerializable) {
                    JSON.stringify(value);
                }
            } else {
                
                JSON.stringify(value);
            }
        } catch (e) {
            isSerializable = false;
        }
        
        if (isSerializable) {
            if (this.set(key, value, ttl)) {
                count++;
            }
        }
    }
    return count;
};

CacheService.prototype.sync = function(key, fetcher, ttl) {
    ttl = ttl || 300;
    var cached = this.get(key);
    if (cached !== null) {
        return cached;
    }
    var value = fetcher();
    this.set(key, value, ttl);
    return value;
};

// ✅ CORRIGÉ : Implémenter cleanup manuellement (sans flushExpired)
CacheService.prototype.cleanup = function() {
    var self = this;
    var keys = this.cache.keys();
    var expired = 0;
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = self.cache.get(key);
        // Si la valeur est undefined, la clé est expirée
        if (value === undefined) {
            self.cache.del(key);
            expired++;
        }
    }
    return expired;
};

var cacheService = new CacheService();

module.exports = cacheService;
module.exports.CacheService = CacheService;
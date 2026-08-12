const cacheService = require('../../services/cacheService');

describe('Cache Service - Tests unitaires', () => {
    beforeEach(() => {
        cacheService.flush();
        cacheService.resetStats();
    });
    describe('Opérations de base', () => {
        test('set et get fonctionnent correctement', () => {
            const key = 'test_key';
            const value = { data: 'test_value', nested: { foo: 'bar' } };
            
            cacheService.set(key, value);
            const result = cacheService.get(key);
            
            expect(result).toEqual(value);
        });
        test('get retourne null pour une clé inexistante', () => {
            const result = cacheService.get('inexistant');
            expect(result).toBeNull();
        });

        test('has vérifie correctement l\'existence', () => {
            const key = 'test_key';
            expect(cacheService.has(key)).toBe(false);
            
            cacheService.set(key, 'value');
            expect(cacheService.has(key)).toBe(true);
        });
        test('del supprime correctement une clé', () => {
            const key = 'test_key';
            cacheService.set(key, 'value');
            expect(cacheService.has(key)).toBe(true);
            
            const deleted = cacheService.del(key);
            expect(deleted).toBe(1);
            expect(cacheService.has(key)).toBe(false);
        });
    });
    describe('TTL et expiration', () => {
        test('set avec TTL expire après le délai', (done) => {
            const key = 'ttl_test';
            cacheService.set(key, 'value', 1); // 1 seconde
            
            expect(cacheService.get(key)).toBe('value');
            
            setTimeout(() => {
                expect(cacheService.get(key)).toBeNull();
                done();
            }, 1100);
        });
        test('set sans TTL utilise le TTL par défaut', () => {
            const key = 'default_ttl';
            cacheService.set(key, 'value');
            expect(cacheService.get(key)).toBe('value');
        });
        test('get ne renouvelle pas le TTL', (done) => {
            const key = 'ttl_no_renew';
            cacheService.set(key, 'value', 1);
            
            setTimeout(() => {
                cacheService.get(key); 
                expect(cacheService.get(key)).toBeNull();
                done();
            }, 1100);
        });
    });
    describe('Statistiques', () => {
        test('compte correctement les hits et misses', () => {
            cacheService.get('inexistant'); 
            cacheService.get('inexistant'); 
            cacheService.set('existant', 'value');
            cacheService.get('existant'); 
            cacheService.get('existant'); 
            
            const stats = cacheService.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(2);
            expect(stats.hitRate).toBe(50);
        });
        test('compte correctement les sets et deletes', () => {
            cacheService.set('key1', 'value');
            cacheService.set('key2', 'value');
            cacheService.set('key3', 'value');
            cacheService.del('key1');
            cacheService.del('key2');
            
            const stats = cacheService.getStats();
            expect(stats.sets).toBe(3);
            expect(stats.deletes).toBe(2);
        });
        test('uptime est calculé correctement', () => {
            const stats = cacheService.getStats();
            expect(stats.uptime).toBeGreaterThanOrEqual(0);
            expect(stats.uptimeFormatted).toBeDefined();
            expect(stats.uptimeFormatted).toMatch(/\d+d \d+h \d+m \d+s/);
        });
    });
    describe('Stratégies d\'invalidation', () => {
        test('invalidateLieu supprime toutes les clés liées', () => {
            const lieuId = '12345';
            cacheService.set(`lieu_${lieuId}`, 'value');
            cacheService.set(`lieux_ambiance_${lieuId}`, 'value');
            cacheService.set(`lieux_details_${lieuId}`, 'value');
            cacheService.set('lieux_list', 'value');
            cacheService.set('autre_key', 'value');
            
            cacheService.invalidateLieu(lieuId);
            
            expect(cacheService.has(`lieu_${lieuId}`)).toBe(false);
            expect(cacheService.has(`lieux_ambiance_${lieuId}`)).toBe(false);
            expect(cacheService.has(`lieux_details_${lieuId}`)).toBe(false);
            expect(cacheService.has('lieux_list')).toBe(false);
            expect(cacheService.has('autre_key')).toBe(true);
        });
        test('invalidateUtilisateur supprime les clés utilisateur', () => {
            const userId = 'user123';
            cacheService.set(`utilisateur_${userId}`, 'value');
            cacheService.set(`utilisateur_${userId}_observations`, 'value');
            cacheService.set('autre_key', 'value');
            
            cacheService.invalidateUtilisateur(userId);
            
            expect(cacheService.has(`utilisateur_${userId}`)).toBe(false);
            expect(cacheService.has(`utilisateur_${userId}_observations`)).toBe(false);
            expect(cacheService.has('autre_key')).toBe(true);
        });
        test('invalidateAllObservations supprime toutes les clés d\'observations', () => {
            cacheService.set('observations_123', 'value');
            cacheService.set('observations_456', 'value');
            cacheService.set('autre_key', 'value');
            
            cacheService.invalidateAllObservations();
            
            expect(cacheService.has('observations_123')).toBe(false);
            expect(cacheService.has('observations_456')).toBe(false);
            expect(cacheService.has('autre_key')).toBe(true);
        });
    });
    describe('Logique de cachabilité', () => {
        test('isCacheable retourne true pour GET', () => {
            const req = { method: 'GET', path: '/lieux' };
            expect(cacheService.isCacheable(req)).toBe(true);
        });

        test('isCacheable retourne false pour POST', () => {
            const req = { method: 'POST', path: '/observations' };
            expect(cacheService.isCacheable(req)).toBe(false);
        });

        test('isCacheable retourne false pour PUT', () => {
            const req = { method: 'PUT', path: '/lieux/123' };
            expect(cacheService.isCacheable(req)).toBe(false);
        });

        test('isCacheable retourne false pour DELETE', () => {
            const req = { method: 'DELETE', path: '/lieux/123' };
            expect(cacheService.isCacheable(req)).toBe(false);
        });
    });

        describe('Génération de clés', () => {
            test('generateKey crée une clé unique pour une URL', () => {
                const req = { originalUrl: '/lieux/123' };
                const key = cacheService.generateKey(req);
                expect(key).toContain('lieux_123');
                expect(key).not.toContain('/');
                expect(key).not.toContain('?');
            });
    
            test('generateKey inclut l\'utilisateur si présent', () => {
                const req = { 
                    originalUrl: '/auth/me', 
                    utilisateur: { _id: 'user123' } 
                };
                const key = cacheService.generateKey(req);
                expect(key).toContain('user123');
            });
    
            test('generateKey utilise public si pas d\'utilisateur', () => {
                const req = { originalUrl: '/lieux' };
                const key = cacheService.generateKey(req);
                expect(key).toContain('public');
            });
        });
        describe('TTL par type de requête', () => {
            test('getTTL retourne 180s pour /ambiance', () => {
                const req = { path: '/lieux/123/ambiance' };
                expect(cacheService.getTTL(req)).toBe(180);
            });
    
            test('getTTL retourne 600s pour /lieux', () => {
                const req = { path: '/lieux' };
                expect(cacheService.getTTL(req)).toBe(600);
            });
    
            test('getTTL retourne 300s par défaut', () => {
                const req = { path: '/autre' };
                expect(cacheService.getTTL(req)).toBe(300);
            });
        });
        describe('Méthodes utilitaires', () => {
            test('mget récupère plusieurs clés', () => {
                cacheService.set('key1', 'value1');
                cacheService.set('key2', 'value2');
                
                const result = cacheService.mget(['key1', 'key2', 'inexistant']);
                expect(result.key1).toBe('value1');
                expect(result.key2).toBe('value2');
                expect(result.inexistant).toBeNull();
            });
    
            test('mget retourne un objet vide pour un tableau vide', () => {
                const result = cacheService.mget([]);
                expect(result).toEqual({});
            });
            test('mset définit plusieurs clés', () => {
                const entries = {
                    'key1': 'value1',
                    'key2': 'value2',
                    'key3': 'value3'
                };
                
                const count = cacheService.mset(entries);
                expect(count).toBe(3);
                expect(cacheService.get('key1')).toBe('value1');
                expect(cacheService.get('key2')).toBe('value2');
                expect(cacheService.get('key3')).toBe('value3');
            });
            test('getOrFetch utilise le cache même s\'il est expiré', async () => {
                const key = 'expired';
                cacheService.set(key, 'old_value', 1);
                
                await new Promise(resolve => setTimeout(resolve, 1100));
                
                const fetcher = jest.fn().mockResolvedValue('new_value');
                const result = await cacheService.getOrFetch(key, fetcher, 60);
                
                
                expect(result).toBe('new_value');
                expect(fetcher).toHaveBeenCalledTimes(1);
            });   
            test('sync utilise le cache existant', () => {
                const key = 'existing';
                cacheService.set(key, 'cached_value');
                
                const fetcher = jest.fn().mockReturnValue('new_value');
                const result = cacheService.sync(key, fetcher, 60);
                
                expect(result).toBe('cached_value');
                expect(fetcher).not.toHaveBeenCalled();
            });
        });
        describe('Nettoyage', () => {
            test('cleanup supprime les clés expirées', (done) => {
                cacheService.set('expired', 'value', 1);
                cacheService.set('valid', 'value', 300);
                
                setTimeout(() => {
                    const cleaned = cacheService.cleanup();
                    expect(cleaned).toBe(1);
                    expect(cacheService.has('expired')).toBe(false);
                    expect(cacheService.has('valid')).toBe(true);
                    done();
                }, 1500);
            });
            test('cleanup retourne 0 si aucune clé expirée', () => {
                cacheService.set('valid1', 'value', 300);
                cacheService.set('valid2', 'value', 300);
                
                const cleaned = cacheService.cleanup();
                expect(cleaned).toBe(0);
                expect(cacheService.keys().length).toBe(2);
            });
        });
        describe('Gestion des erreurs', () => {
            test('set avec une valeur non sérialisable fonctionne', () => {
                const obj = { 
                    toString: () => { throw new Error('Test error'); } 
                };
                expect(() => cacheService.set('key', obj)).not.toThrow();
            });
    
            test('get sur une clé avec valeur corrompue', () => {
                
                cacheService.cache.set('corrupted', 'invalid');
                
                const result = cacheService.get('corrupted');
               
                expect(result).toBe('invalid');
            });
            test('mset avec des valeurs non sérialisables', () => {
                const entries = {
                    'valid': 'value',
                    'invalid': { toString: () => { throw new Error('Error'); } }
                };
                const count = cacheService.mset(entries);
                expect(count).toBe(1);
                expect(cacheService.has('valid')).toBe(true);
                expect(cacheService.has('invalid')).toBe(false);
            });
        });
    });
    



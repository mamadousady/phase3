// hooks/useFilters.js
import { useState, useMemo, useCallback, useEffect } from 'react';


function getValue(item, path) {
    return path.split('.').reduce(function(acc, part) {
        return (acc === undefined || acc === null) ? undefined : acc[part];
    }, item);
}

function normaliser(valeur) {
    return valeur
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}



export function useFilters(items, filterConfig, initialFilters) {
    items = items || [];
    filterConfig = filterConfig || {};
    initialFilters = initialFilters || {};

    var [filters, setFilters] = useState(initialFilters);
    var [searchTerm, setSearchTerm] = useState('');

    var filteredItems = useMemo(function() {
        if (!items || items.length === 0) return [];
        var result = items.slice();

        var configKeys = Object.keys(filterConfig);
        for (var i = 0; i < configKeys.length; i++) {
            var key = configKeys[i];
            var config = filterConfig[key];
            var filterValue = filters[key];

            // Ignorer les valeurs vides
            if (filterValue === undefined || filterValue === null) continue;
            if (config.type === 'select' && filterValue === '') continue;
            if (config.type !== 'select' && filterValue === '') continue;

            if (config.type === 'string') {
                result = result.filter(function(item) {
                    var value = (item[key] && item[key].toString().toLowerCase()) || '';
                    return value.indexOf(filterValue.toLowerCase()) !== -1;
                });
            } else if (config.type === 'select') {
                result = result.filter(function(item) {
                    var itemValue = getValue(item, config.field || key);
                    if (itemValue === undefined || itemValue === null) return false;
                    
                    return normaliser(itemValue) === normaliser(filterValue);
                });
            } else if (config.type === 'range') {
                result = result.filter(function(item) {
                    var value = item[key];
                    if (value === undefined || value === null) return true;

                    var min = filterValue.min;
                    var max = filterValue.max;
                    if (min !== undefined && value < min) return false;
                    if (max !== undefined && value > max) return false;
                    return true;
                });
            } else if (config.type === 'checkbox') {
                if (Array.isArray(filterValue) && filterValue.length > 0) {
                    result = result.filter(function(item) {
                        var value = (item[key] && item[key].toString()) || '';
                        return filterValue.indexOf(value) !== -1;
                    });
                }
            } else if (config.type === 'boolean') {
                result = result.filter(function(item) {
                    var value = !!item[key];
                    return value === filterValue;
                });
            } else if (config.type === 'date') {
                result = result.filter(function(item) {
                    var itemDate = new Date(item[key]);
                    if (isNaN(itemDate.getTime())) return true;

                    var start = filterValue.start;
                    var end = filterValue.end;
                    if (start && itemDate < new Date(start)) return false;
                    if (end && itemDate > new Date(end)) return false;
                    return true;
                });
            } else if (config.type === 'custom') {
                if (config.filterFn) {
                    result = result.filter(function(item) {
                        return config.filterFn(item, filterValue);
                    });
                }
            }
        }

        // Recherche textuelle
        if (searchTerm && searchTerm.trim() !== '') {
            var term = searchTerm.toLowerCase().trim();
            var searchFields = filterConfig.searchFields || ['nom', 'description', 'adresse'];

            result = result.filter(function(item) {
                for (var j = 0; j < searchFields.length; j++) {
                    var field = searchFields[j];
                    var value = (item[field] && item[field].toString().toLowerCase()) || '';
                    if (value.indexOf(term) !== -1) {
                        return true;
                    }
                }
                return false;
            });
        }

        // Tri
        var sortConfig = filterConfig.sort;
        if (sortConfig && filters.sortBy) {
            var field = filters.sortBy.field;
            var direction = filters.sortBy.direction || 'asc';
            if (field) {
                result.sort(function(a, b) {
                    var valA = a[field];
                    var valB = b[field];
                    if (valA === undefined || valA === null) return 1;
                    if (valB === undefined || valB === null) return -1;
                    if (typeof valA === 'string') {
                        return direction === 'asc'
                            ? valA.localeCompare(valB)
                            : valB.localeCompare(valA);
                    }
                    return direction === 'asc' ? valA - valB : valB - valA;
                });
            }
        }

        return result;
    }, [items, filters, searchTerm, filterConfig]);

    var setFilter = useCallback(function(key, value) {
        setFilters(function(prev) {
            var newFilters = {};
            for (var k in prev) {
                if (prev.hasOwnProperty(k)) {
                    newFilters[k] = prev[k];
                }
            }
            newFilters[key] = value;
            return newFilters;
        });
    }, []);

    var setFiltersBatch = useCallback(function(newFilters) {
        setFilters(function(prev) {
            var merged = {};
            for (var k in prev) {
                if (prev.hasOwnProperty(k)) {
                    merged[k] = prev[k];
                }
            }
            for (var k2 in newFilters) {
                if (newFilters.hasOwnProperty(k2)) {
                    merged[k2] = newFilters[k2];
                }
            }
            return merged;
        });
    }, []);

    var resetFilters = useCallback(function() {
        setFilters({});
        setSearchTerm('');
    }, []);

    var resetFilter = useCallback(function(key) {
        setFilters(function(prev) {
            var newFilters = {};
            for (var k in prev) {
                if (prev.hasOwnProperty(k) && k !== key) {
                    newFilters[k] = prev[k];
                }
            }
            return newFilters;
        });
    }, []);

    var activeFiltersCount = useMemo(function() {
        var count = 0;
        var filterKeys = Object.keys(filters);
        for (var i = 0; i < filterKeys.length; i++) {
            var key = filterKeys[i];
            var value = filters[key];
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    if (value.length > 0) count++;
                } else {
                    count++;
                }
            }
        }
        return count;
    }, [filters]);

    var isFilterActive = useCallback(function(key) {
        var value = filters[key];
        if (value === undefined || value === null || value === '') return false;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    }, [filters]);

    var getFilterValue = useCallback(function(key) {
        return filters[key];
    }, [filters]);

    var hasFilters = useMemo(function() {
        return activeFiltersCount > 0 || (searchTerm && searchTerm.trim() !== '');
    }, [activeFiltersCount, searchTerm]);

    var updateUrlFilters = useCallback(function() {
        var params = new URLSearchParams();
        var filterKeys = Object.keys(filters);
        for (var i = 0; i < filterKeys.length; i++) {
            var key = filterKeys[i];
            var value = filters[key];
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    params.set(key, value.join(','));
                } else {
                    params.set(key, String(value));
                }
            }
        }
        if (searchTerm) {
            params.set('search', searchTerm);
        }
        var newUrl = window.location.pathname + '?' + params.toString();
        window.history.pushState({}, '', newUrl);
    }, [filters, searchTerm]);

    useEffect(function() {
        var params = new URLSearchParams(window.location.search);
        var newFilters = {};

        params.forEach(function(value, key) {
            if (key === 'search') {
                setSearchTerm(value);
            } else {
                if (value.indexOf(',') !== -1) {
                    newFilters[key] = value.split(',');
                } else if (!isNaN(value) && value !== '') {
                    newFilters[key] = Number(value);
                } else if (value === 'true') {
                    newFilters[key] = true;
                } else if (value === 'false') {
                    newFilters[key] = false;
                } else {
                    newFilters[key] = value;
                }
            }
        });

        var newKeys = Object.keys(newFilters);
        if (newKeys.length > 0) {
            setFilters(function(prev) {
                var merged = {};
                for (var k in prev) {
                    if (prev.hasOwnProperty(k)) {
                        merged[k] = prev[k];
                    }
                }
                for (var k2 in newFilters) {
                    if (newFilters.hasOwnProperty(k2)) {
                        merged[k2] = newFilters[k2];
                    }
                }
                return merged;
            });
        }
    }, []);

    return {
        filteredItems: filteredItems,
        filters: filters,
        setFilter: setFilter,
        setFiltersBatch: setFiltersBatch,
        resetFilter: resetFilter,
        resetFilters: resetFilters,
        searchTerm: searchTerm,
        setSearchTerm: setSearchTerm,
        activeFiltersCount: activeFiltersCount,
        updateUrlFilters: updateUrlFilters,
        isFilterActive: isFilterActive,
        getFilterValue: getFilterValue,
        hasFilters: hasFilters
    };
}

export default useFilters;
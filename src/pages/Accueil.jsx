
import React from 'react';
import { useCache } from '../hooks/useCache'; 
import { useFilters } from '../hooks/useFilters';
import lieuxServices from '../services/lieuxServices';
import LieuCard from '../components/LieuCard';
import FilterBar from '../components/common/FilterBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { StatGrid } from '../components/common/StatCard';

const Accueil = () => {
    // Récupérer les données avec cache
    const { data: lieux, loading, error, refetch, isCached } = useCache(
        'lieux_list',
        lieuxServices.getLieux,
        { ttl: 300 } // 5 minutes
    );

    // Configuration des filtres
    const filterConfig = {
        type: {
            type: 'select',
            label: 'Type de lieu',
            options: [
             
                { value: 'café', label: '☕ Café' },
                { value: 'bibliothèque', label: '📚 Bibliothèque' },
                { value: 'parc', label: '🌳 Parc' },
                { value: 'restaurant', label: '🍽️ Restaurant' },
                { value: 'bar', label: '🍺 Bar' },
                { value: 'lieu', label: '📍 Autre' }
            ]
        },
        classification: {
            type: 'select',
            label: 'Ambiance',
            field: 'ambiance.classification',
            options: [
                { value: 'calme', label: '😌 Calme' },
                { value: 'modéré', label: '😊 Modéré' },
                { value: 'animé', label: '🤩 Animé' },
                { value: 'inconnu', label: '❓ Inconnu' }
            ]
        },
        minMesures: {
            type: 'number',
            label: 'Minimum de mesures',
            min: 0,
            max: 100,
            placeholder: '0'
        },
        searchFields: ['nom', 'adresse', 'type']
    };

   
    const {
        filteredItems,
        filters,
        setFilter,
        resetFilters,
        searchTerm,
        setSearchTerm,
        activeFiltersCount,
        hasFilters
    } = useFilters(lieux || [], filterConfig);

 
    const stats = React.useMemo(function() {
        if (!lieux || lieux.length === 0) return null;

        var total = lieux.length;
        var avecMesures = lieux.filter(function(l) {
            return l.ambiance && l.ambiance.nombreMesures > 0;
        }).length;
        
        var classifications = lieux.reduce(function(acc, l) {
            var cls = (l.ambiance && l.ambiance.classification) || 'inconnu';
            acc[cls] = (acc[cls] || 0) + 1;
            return acc;
        }, {});

        var valeurs = lieux
            .filter(function(l) {
                return l.ambiance && l.ambiance.derniereMesure && l.ambiance.derniereMesure.valeur !== undefined;
            })
            .map(function(l) {
                return l.ambiance.derniereMesure.valeur;
            });

        var moyenne = valeurs.length > 0 
            ? Math.round(valeurs.reduce(function(a, b) { return a + b; }, 0) / valeurs.length * 10) / 10
            : null;

        var nbMesures = lieux.reduce(function(acc, l) {
            return acc + ((l.ambiance && l.ambiance.nombreMesures) || 0);
        }, 0);

        return {
            total: total,
            avecMesures: avecMesures,
            sansMesures: total - avecMesures,
            classifications: classifications,
            moyenne: moyenne,
            nbMesures: nbMesures
        };
    }, [lieux]);

    
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner message="Chargement des lieux..." size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <ErrorMessage 
                    message={error} 
                    onRetry={refetch} 
                    title="Impossible de charger les lieux" 
                />
            </div>
        );
    }

    if (!lieux || lieux.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <EmptyState
                    title="Aucun lieu disponible"
                    description="Aucun lieu n'a été enregistré pour le moment."
                    action={{ label: "Actualiser", onClick: refetch }}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* En-tête */}
            <header className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                             Découvrez l'ambiance des lieux
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Consultez l'ambiance en temps réel des lieux autour de vous
                            {isCached && <span className="ml-2 text-xs text-green-500">⬇️ Données en cache</span>}
                        </p>
                    </div>
                    <button
                        onClick={refetch}
                        className="mt-2 sm:mt-0 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition text-sm flex items-center gap-1"
                    >
                        🔄 Actualiser
                    </button>
                </div>
            </header>

            {/* Statistiques */}
            {stats && (
                <div className="mb-6">
                    <StatGrid
                        stats={[
                            {
                                title: 'Total lieux',
                                value: stats.total,
                                icon: '📍',
                                color: 'bg-white dark:bg-gray-800'
                            },
                            {
                                title: 'Avec mesures',
                                value: stats.avecMesures,
                                subtitle: stats.sansMesures + ' sans mesure',
                                icon: '📊',
                                color: 'bg-white dark:bg-gray-800',
                                trend: stats.avecMesures > 0 ? { value: Math.round(stats.avecMesures / stats.total * 100), label: '%' } : null
                            },
                            {
                                title: 'Moyenne globale',
                                value: stats.moyenne !== null ? stats.moyenne + ' dB' : 'N/A',
                                subtitle: stats.nbMesures + ' mesures totales',
                                icon: '📈',
                                color: 'bg-white dark:bg-gray-800'
                            }
                        ]}
                        columns={3}
                    />
                </div>
            )}

            <div className="mb-6">
                <FilterBar
                    filters={Object.entries(filterConfig)
                        .filter(function(key) {
                            return key[0] !== 'searchFields';
                        })
                        .map(function(key) {
                            return { key: key[0], ...key[1] };
                        })}
                    values={filters}
                    onChange={setFilter}
                    onReset={resetFilters}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    activeCount={activeFiltersCount}
                    placeholder="Rechercher un lieu par nom ou adresse..."
                    variant="default"
                />
            </div>

          
            <div className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredItems.length} lieu{filteredItems.length > 1 ? 'x' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
                        {hasFilters && ' (' + activeFiltersCount + ' filtre' + (activeFiltersCount > 1 ? 's' : '') + ' actif' + (activeFiltersCount > 1 ? 's' : '') + ')'}
                        {!hasFilters && ' - ' + lieux.length + ' lieu' + (lieux.length > 1 ? 'x' : '') + ' au total'}
                    </p>
                    {hasFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                        >
                            ✕ Réinitialiser tous les filtres
                        </button>
                    )}
                </div>
            </div>

           
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(function(lieu) {
                        return <LieuCard key={lieu.id} lieu={lieu} />;
                    })}
                </div>
            ) : (
                <div className="mt-8">
                    <EmptyState
                        title="Aucun résultat"
                        description="Aucun lieu ne correspond à vos critères de recherche"
                        action={{ label: "Réinitialiser les filtres", onClick: resetFilters }}
                    />
                </div>
            )}
        </div>
    );
};

export default Accueil;
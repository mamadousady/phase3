// pages/LieuxDétails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import lieuxServices from '../services/lieuxServices';
import authService from '../services/authService';
import { StatGrid} from '../components/common/StatCard';
import BadgeClassification from '../components/BadgeClassification';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import ObservationForm from '../components/ObservationForm';
import { useAuth } from '../context/AuthContext';
import { useCache } from '../hooks/useCache';

const LieuxDétails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { estConnecte } = useAuth();

  
    const { 
        data: ambianceData, 
        loading, 
        error, 
        refetch: refetchAmbiance,
        invalidate: invalidateCache
    } = useCache(
        `ambiance_${id}`,
        function() {
            return lieuxServices.getAmbiance(id);
        },
        { ttl: 180 }
    );

    const [showForm, setShowForm] = useState(false);
    const [estFavori, setEstFavori] = useState(false);
    const [favoriLoading, setFavoriLoading] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);

    // Vérifier si le lieu est en favori
    useEffect(function() {
        if (!estConnecte) return;

        async function verifierFavori() {
            try {
                var profil = await authService.getProfil();
                var ids = profil.lieuxFavoris.map(function(l) {
                    return l._id || l.toString();
                });
                setEstFavori(ids.indexOf(id) !== -1);
            } catch (err) {
                console.error('Erreur vérification favori:', err);
            }
        }

        verifierFavori();
    }, [id, estConnecte]);

    // Gestion des favoris
    function handleToggleFavori() {
        setFavoriLoading(true);
        authService.toggleFavori(id)
            .then(function(res) {
                setEstFavori(res.estFavori);
            })
            .catch(function(err) {
                console.error('Erreur toggle favori:', err);
            })
            .finally(function() {
                setFavoriLoading(false);
            });
    }

    // Gestion après soumission d'une observation
    var handleObservationSuccess = useCallback(function() {
        setShowForm(false);
        invalidateCache();
        refetchAmbiance();
    }, [invalidateCache, refetchAmbiance]);

    // ✅ Fonction handleRetry AJOUTÉE
    function handleRetry() {
        refetchAmbiance();
    }

    // Vérifier si les données sont vides
    useEffect(function() {
        if (ambianceData && !loading) {
            var hasData = ambianceData.historique && ambianceData.historique.length > 0;
            setIsEmpty(!hasData);
        }
    }, [ambianceData, loading]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <LoadingSpinner message="Chargement du portrait d'ambiance..." size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <ErrorMessage 
                    message={error} 
                    onRetry={handleRetry}
                    title="Impossible de charger le portrait d'ambiance" 
                />
            </div>
        );
    }

    if (isEmpty || !ambianceData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <EmptyState
                    title="Aucune donnée d'ambiance"
                    description="Ce lieu n'a pas encore de mesures d'ambiance disponibles"
                    action={{ label: "Revenir à l'accueil", onClick: function() { navigate('/'); } }}
                />
            </div>
        );
    }

    var lieu = ambianceData.lieu || {};
    var classification = ambianceData.classification || 'inconnu';
    var echelles = ambianceData.echelles || null;
    var historique = ambianceData.historique || [];
    var creneauxCalmes = ambianceData.creneauxCalmes || [];
    var derniereMesure = ambianceData.derniereMesure || null;
    var nombreMesures = ambianceData.nombreMesures || 0;
    var stats = ambianceData.stats || null;

    // Statistiques pour la page
    var statCards = [
        {
            title: 'Nombre de mesures',
            value: nombreMesures || 0,
            icon: '📊',
            color: 'bg-white dark:bg-gray-800'
        },
        {
            title: 'Dernière mesure',
            value: derniereMesure ? derniereMesure.valeur + ' ' + (derniereMesure.unite || 'dB') : 'N/A',
            subtitle: derniereMesure ? new Date(derniereMesure.date).toLocaleString('fr-FR') : '',
            icon: '📈',
            color: 'bg-white dark:bg-gray-800'
        },
        {
            title: 'Ambiance actuelle',
            value: classification || 'Inconnue',
            icon: '🎯',
            color: 'bg-white dark:bg-gray-800'
        },
        {
            title: 'Moyenne',
            value: stats && stats.moyenne !== null ? stats.moyenne + ' dB' : 'N/A',
            icon: '📉',
            color: 'bg-white dark:bg-gray-800'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Barre de navigation */}
            <div className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Retour à l'Accueil
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* ─── Carte principale ─── */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    {/* Nom + Badge + Bouton Favori */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {lieu.nom || 'Lieu sans nom'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {lieu.adresse || 'Adresse non disponible'}
                            </p>
                            {lieu.latitude && lieu.longitude && (
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Coordonnées : {lieu.latitude.toFixed(4)}, {lieu.longitude.toFixed(4)}
                                </p>
                            )}
                            {lieu.type && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Type : {lieu.type}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-4 md:mt-0">
                            <BadgeClassification
                                classification={classification || 'inconnu'}
                                size="large"
                                showLabel={true}
                            />

                            {estConnecte && (
                                <button
                                    onClick={handleToggleFavori}
                                    disabled={favoriLoading}
                                    className="ml-2 px-3 py-1.5 border border-yellow-400 dark:border-yellow-500 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    {favoriLoading ? (
                                        <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin inline-block" />
                                    ) : (
                                        estFavori ? '⭐ Favori' : '☆ Ajouter aux favoris'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bloc Échelles */}
                    {echelles && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Échelles d'ambiances
                            </h4>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                    <span className="text-green-600 dark:text-green-400">🟢 Calme</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">&lt; {echelles.calme} dB</span>
                                </div>
                                <div>
                                    <span className="text-yellow-600 dark:text-yellow-400">🟡 Modéré</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">&lt; {echelles.modéré} dB</span>
                                </div>
                                <div>
                                    <span className="text-red-600 dark:text-red-400">🔴 Animé</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">&gt; {echelles.animé} dB</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bloc Formulaire observation */}
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                        {estConnecte ? (
                            <>
                                {!showForm ? (
                                    <button
                                        onClick={function() { setShowForm(true); }}
                                        className="w-full py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">🎙️</span>
                                        Soumettre une observation pour ce lieu
                                    </button>
                                ) : (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Nouvelle observation
                                            </h3>
                                            <button
                                                onClick={function() { setShowForm(false); }}
                                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <ObservationForm
                                            lieuId={id}
                                            onSuccess={handleObservationSuccess}
                                            onCancel={function() { setShowForm(false); }}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                                    🔒 Connectez-vous pour soumettre une observation
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                                    >
                                        Se connecter
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        Créer un compte
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Statistiques ─── */}
                <div className="mb-6">
                    <StatGrid stats={statCards} columns={4} />
                </div>

                {/* ─── Historique des mesures ─── */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        📊 Historique des mesures
                    </h2>
                    {historique && historique.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {historique.map(function(item, index) {
                                return (
                                    <div key={index} className="flex flex-wrap items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                        <div className="flex-1 min-w-[200px]">
                                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                {new Date(item.date).toLocaleDateString('fr-FR')}{' '}
                                                {new Date(item.date).toLocaleTimeString('fr-FR')}
                                            </span>
                                            {item.notes && (
                                                <span className="text-sm text-gray-400 dark:text-gray-500 ml-2">
                                                    - {item.notes}
                                                </span>
                                            )}
                                            {item.auteur && (
                                                <span className="text-xs text-blue-400 dark:text-blue-400 ml-2">
                                                    👤 {item.auteur}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {item.valeur} {item.unite || 'dB'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="min-h-[100px] flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucune mesure disponible</p>
                        </div>
                    )}
                </div>

                {/* ─── Créneaux Calmes ─── */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        🌿 Créneaux Calmes
                    </h2>
                    {creneauxCalmes && creneauxCalmes.length > 0 ? (
                        <div className="space-y-2">
                            {creneauxCalmes.map(function(creneau, index) {
                                return (
                                    <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-green-800 dark:text-green-300 font-medium text-sm">
                                            📅 {new Date(creneau.debut).toLocaleString('fr-FR')}
                                            <span className="mx-2">→</span>
                                            {new Date(creneau.fin).toLocaleString('fr-FR')}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            ⏱️ Durée : {creneau.dureeMinutes || Math.round((new Date(creneau.fin) - new Date(creneau.debut)) / 60000)} minutes
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="min-h-[100px] flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucun créneau calme identifié</p>
                        </div>
                    )}
                </div>

                {/* ─── Statistiques détaillées ─── */}
                {stats && stats.nombre > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            📈 Statistiques détaillées
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Moyenne</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.moyenne} dB</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Minimum</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.min} dB</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Maximum</p>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.max} dB</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Écart-type</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.ecartType} dB</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LieuxDétails;
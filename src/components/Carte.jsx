
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCache } from '../hooks/useCache';
import lieuxServices from '../services/lieuxServices';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Marqueur from './Marqueur';
import EmptyState from './common/EmptyState';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


function MapLegend() {
    return (
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md z-[1000] text-sm border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Classification</h4>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600 dark:text-gray-400">😌 Calme</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-gray-600 dark:text-gray-400">😊 Modéré</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-gray-600 dark:text-gray-400">🤩 Animé</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="text-gray-600 dark:text-gray-400">❓ Inconnu</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-gray-400 rounded-full opacity-50"></span>
                        <span className="text-gray-400 dark:text-gray-500 text-xs">Données obsolètes (+48h)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Carte() {
    var center = [45.5017, -73.5673];
    var zoom = 13;

    
    var { data: lieux, loading, error, refetch, isCached } = useCache(
        'lieux_list',
        lieuxServices.getLieux,
        { ttl: 300 }
    );

    

    if (loading) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <LoadingSpinner message="Chargement de la carte..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ErrorMessage
                    message={error}
                    onRetry={refetch}
                    title="Impossible de charger la carte"
                />
            </div>
        );
    }

    
    var isEmpty = !lieux || lieux.length === 0;

    if (isEmpty) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <EmptyState
                    title="Aucun lieu"
                    description="Aucun lieu à afficher sur la carte"
                    icon="🗺️"
                />
            </div>
        );
    }

   
    var lieuxAvecCoordonnees = lieux.filter(function(l) {
        return l.latitude && l.longitude;
    });

    if (lieuxAvecCoordonnees.length === 0) {
        return (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <EmptyState
                    title="Aucune coordonnée"
                    description="Les lieux n'ont pas de coordonnées à afficher"
                    icon="📍"
                />
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg relative">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ width: '100%', height: '400px' }}
                scrollWheelZoom={true}
                zoomControl={true}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {lieuxAvecCoordonnees.map(function(lieu) {
                    return (
                        <Marqueur
                            key={lieu.id}
                            lieu={lieu}
                            showPopup={true}
                        />
                    );
                })}
            </MapContainer>

            <MapLegend />

            <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md z-[1000] text-sm border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">
                    📍 {lieuxAvecCoordonnees.length} lieu{lieuxAvecCoordonnees.length > 1 ? 'x' : ''} affiché{lieuxAvecCoordonnees.length > 1 ? 's' : ''}
                    {lieux.length !== lieuxAvecCoordonnees.length && (
                        <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                            ({lieux.length - lieuxAvecCoordonnees.length} sans coordonnées)
                        </span>
                    )}
                    {isCached && (
                        <span className="ml-2 text-xs text-green-500">⬇️ cache</span>
                    )}
                </span>
            </div>
        </div>
    );
}

export default Carte;
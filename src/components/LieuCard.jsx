import React from 'react';
import {Link} from 'react-router-dom';
import BadgeClassification from './BadgeClassification';

const LieuCard=({lieu}) =>{
    const getClassification=() =>{
        if(!lieu.ambiance || !lieu.ambiance.classification){
            return 'modéré';
        }
        return lieu.ambiance.classification;
    };
    const formatAdress=(adresse)=>{
        if (!adresse) return 'Adresse non disponible';
        return adresse.length>40 ? adresse.substring(0,40) + '...':adresse;
    };
    const isRecent = () => {
        if (!lieu.ambiance?.derniereMesure?.date) return false;
        const now = new Date();
        const measureDate = new Date(lieu.ambiance.derniereMesure.date);
        const diffHours = (now - measureDate) / (1000 * 60 * 60);
        return diffHours <= 48;
    };


    return(
        
        <Link to={`/lieu/${lieu.id}`} className="block">
        <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition

       shadow duration-200 overflow-hidden '>
        <div className='p-6'>
            <div className='flex items-center justify-between mb-2'>
                <h3 className='text-lg font-semibold text-gray-900 truncate'>{lieu.nom || 'lieu sans nom'}</h3>
                <BadgeClassification classification={getClassification()}/>
            </div>
            <p className='text-sm text-gray-600 mb-3'>
                {formatAdress(lieu.adresse)}
            </p>
            {lieu.type && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                            🏷️ {lieu.type}
                        </p>
                    )}
            <div className='text-xs text-gray-400 mb-3'>
                {lieu.latitude && lieu.longitude ? (<span> {lieu.latitude.toFixed(4)}, {lieu.longitude.toFixed(4)}</span>)
                :(<span>Cordonnées non disponibles</span>)}
            </div>
            {lieu.ambiance && lieu.ambiance.derniereMesure ?(<div className='flex items-center justify-between text-sm'>
                <span className="text-gray-500">{lieu.ambiance.derniereMesure.valeur} dB</span>
                {!isRecent() && (
                                    <span className="ml-2 text-xs text-red-500 dark:text-red-400">
                                         obsolète
                                    </span>
                                )}
                <br/>
                <span className='text-xs text-gray-400'>{new Date(lieu.ambiance.derniereMesure.date).toLocaleDateString()}</span>
            </div>):(<p className='text-sm text-gray-400 italic'>Aucune mesure récente</p>)}

            {lieu.ambiance?.nombreMesures > 0 && (
                        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            📊 {lieu.ambiance.nombreMesures} mesure{lieu.ambiance.nombreMesures > 1 ? 's' : ''}
                        </div>
                    )}

            <div className='mt-4 flex justify-end'>
                <span className='text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors'>Voir le portrait →

                </span>

            </div>
        </div>
       </div>
       </Link>
    );
};

export default LieuCard;
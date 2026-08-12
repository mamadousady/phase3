import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import BadgeClassification from './BadgeClassification';

const createIcon=(classification,isRecent=true)=>{
    const colors={
        calme:"#22c55e",
        modéré:"#eab308",
        animé:"#ef4444",
        inconnu:"#9ca3af",
    };
    const color=isRecent ? colors[classification] || colors.inconnu:"#9ca3af";
    const opacity=isRecent ?1:0.5;

    return L.divIcon({
        className:'custom-div-icon',
        html:`<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        opacity: ${opacity};
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      "> <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">${getIconSymbol(classification)}</span>
      </div>`,iconSize:[30,30],
      iconAnchor:[15,30],
      popupAnchor:[0,-30],
    });
};

const getIconSymbol=(classification)=>{
    const symbols={
        calme:'😌',
        modéré:'😊',
        animé: '🤩',
       inconnu: '❓',

    };
    return symbols[classification] || symbols.inconnu;

};
const isRecentMeasure=(derniereMesure)=>{
    if(!derniereMesure || ! derniereMesure.date)
        return false;
    const now=new Date();
    const measureDate=new Date( derniereMesure.date);
    const diffHours=(now-measureDate)/(1000*60*60);
    return diffHours<=48;
};
const Marqueur=({lieu,showPopup = true})=>{
    if(!lieu || !lieu.latitude || !lieu.longitude){
        console.warn('Lieu sans coordonnées:', lieu);
        return null;
    }
    const classification=lieu.ambiance?.classification ||'inconnu';
    const derniereMesure=lieu.ambiance?.derniereMesure;
    const recent=isRecentMeasure(derniereMesure);


const icon=createIcon(classification,recent);

return (<Marker
    position
    ={[lieu.latitude,lieu.longitude]}
    icon={icon}
    eventHandlers={{ click:()=>{

    },
    }}>
        {showPopup && (
            <Popup>
                <div className='min-w-[200px]'>
                    <h3 className='font-bold text-lg text-gray-900 mb-1'>
                        {lieu.nom || 'lieu sans nom'}
                    </h3>

                    {lieu.type && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                🏷️ {lieu.type}
                            </p>
                        )}
                    <div className='mt-2'>
                        <BadgeClassification classification={classification}
                        size='small'
                        showLabel={true}/>
                    </div>
                    {derniereMesure && (<div className='mt-2 text-sm'>
                        <p className='text-gray-600'>Dernière mesure:{derniereMesure.valeur} dB</p>
                        <p className='text-xs text-gray-400'>
                            {new Date(derniereMesure.date).toLocaleString('fr-FR')}
                        </p>
                        {!recent && (<p className='text-xs text-red-500 font-medium mt-1'>Données obsolètes (+48h)</p>)}
                    

                    
                    {lieu.ambiance?.nombreMesures > 0 && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        📊 {lieu.ambiance.nombreMesures} mesures
                                    </p>
                                )}
                                </div>
                        )}

                    <div className='mt-3'>
                        <Link to={`/lieu/${lieu.id}`} 
                        className='inline-block w-full text-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition'>Voir le portrait </Link>
                    </div>
                    {lieu.adresse && (<p className='text-xs text-gray-400 mt-2 truncate'>{lieu.adresse}</p>)}

                </div>
            </Popup>
        )}
    </Marker>


);
};

export default Marqueur;

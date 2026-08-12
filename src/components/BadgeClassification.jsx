import React from 'react';
const BadgeClassification=({classification,size='medium',showLabel='true'})=>{
    const config={
        calme:{
            color:"bg-green-100 text-green-800 border-green-300",
            label:"calme",
            emoji:'😌',
            description:'ambiance paisible'
        },
        modéré:{
            color:"bg-yellow-100 text-yellow-800 border-yellow-300",
            label:"Modéré",
            emoji:"😊",
            description:"Ambiance modéré",

        },
        animé:{
            color:"bg-red-100 text-red-800 border-red-300",
            label:"Animé",
            emoji:"🤩",
            description:"Ambiance animé"
        },
        inconnu:{
            color:"bg-gray-100 text-gray-600 border-gray-300",
            label:"Inconnu",
            emoji:"❓",
            description:"Classification non disponible",
        },

    };
    const badgeConfig=config[classification] || config.inconnu;

    const sizeClasses={
        small:"px-2 py-0.5 text-xs",
        medium:"px-3 py-1 text-sm",
        large:"px-4 py-1.5 text-base",
    };

    return (<span className={`inline-flex items-center rounded-full border${badgeConfig.color}
    ${sizeClasses[size] || sizeClasses.medium} font-medium transition-all duration-200`}
    title={badgeConfig.description}>
        <span className='mr-1'>{badgeConfig.emoji}</span>
        {showLabel && badgeConfig.label}
        
    </span>);
};

export default BadgeClassification;
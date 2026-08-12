import React from 'react';

const LoadingSpinner=({message='Chargement...', size='medium'})=>{
    const sizeClasses={
        small:'w-6 h-6',
        medium:'w-12 h-12',
        large:'w-16 h-16',
    };
    return (
        <div className='flex flex-col items-center justify-center p-8'>
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-500`}></div>
            {message && (<p className='mt-4 text-gray-600 text-sm'>{message}</p>)}

        </div>
    );
};
export default LoadingSpinner;
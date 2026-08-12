import React from 'react';
const ErrorMessage=({message,onRetry,title ='Une erreur est survenue'})=>{
    return (
        <div className='flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200'>
            <h3 className='text-lg font-semibold text-red-700 mb-2'>{title}</h3>
            <p className='text-red-600 text-sm mb-4 text-center'>{message}</p>
            {onRetry &&(<button onClick={onRetry} className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>Reéssayer</button>)}


        </div>
    );
};
export default ErrorMessage;
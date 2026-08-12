import React from 'react';

const EmptyState=({title='Aucune donnée disponible',
    description='Il n\'y a pas encore de données à afficher',
    action
})=>{
    return (<div className='flex flex-col items-center justify-content p-8 bg-gray-50 rounded-lg border border-gray-200'>

        <h3 className='text-lg font-semibold text-gray-700 mb-2'>{title}</h3>
        <p className='text-gray-500 text-sm mb-4 text-center'>{description}</p>
        {action && ( <button onClick={action.onClick} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transitions-colors'>{action.label}</button>)}

    </div>);
};
export default EmptyState;
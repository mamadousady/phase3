import React from 'react';

const StatCard=({
    title,
    value,
    subtitle,
    icon,
    color = 'bg-white',
    textColor = 'text-gray-900',
    children,
    className = '',
    onClick,
    loading = false,
    trend = null
})=>{

    const renderTrend=()=>{
        if (!trend) return null;
        const isPositive = trend.value > 0;
        const color = isPositive ? 'text-green-500' : 'text-red-500';
        const arrow = isPositive ? '↑' : '↓';
        return (
            <span className={`ml-2 text-sm font-medium ${color}`}>
                {arrow} {Math.abs(trend.value)}%
                {trend.label && <span className="text-xs text-gray-400 ml-1">{trend.label}</span>}
            </span>
        );
    };
    return (
        <div
            className={`
                ${color} rounded-lg shadow-md p-4 transition-all duration-200
                ${onClick ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                        {title}
                    </h4>
                    {loading ? (
                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <div className="flex items-baseline">
                            <p className={`text-2xl font-bold ${textColor}`}>
                                {value !== undefined && value !== null ? value : '—'}
                            </p>
                            {renderTrend()}
                        </div>
                         )}
                         {subtitle && (
                             <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                         )}
                     </div>
                     {icon && (
                         <div className="text-3xl ml-4 flex-shrink-0">
                             {icon}
                         </div>
                     )}
                 </div>
                 {children && (
                     <div className="mt-3 pt-3 border-t border-gray-100">
                         {children}
                     </div>
                 )}
             </div>
         );
     };

     export const StatGrid = ({ stats, columns = 3 }) => {
        const colClasses = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        };
    
        return (
            <div className={`grid ${colClasses[columns] || colClasses[3]} gap-4`}>
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>
        );
    };

    export default StatCard;
            
        
    

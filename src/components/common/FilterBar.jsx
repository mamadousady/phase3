// components/common/FilterBar.jsx
import React from 'react';

const FilterBar = ({
    filters = [],
    values = {},
    onChange,
    onReset,
    searchTerm = '',
    onSearchChange,
    activeCount = 0,
    className = '',
    collapsible = true,
    placeholder = 'Rechercher...',
    showReset = true
}) => {
    const [isExpanded, setIsExpanded] = React.useState(!collapsible);

    const handleFilterChange = (key, value) => {
        if (onChange) {
            // ✅ Si la valeur est une chaîne vide, envoyer undefined pour ignorer le filtre
            if (value === '') {
                onChange(key, undefined);
            } else {
                onChange(key, value);
            }
        }
    };

    const handleReset = () => {
        if (onReset) {
            onReset();
        }
    };

    const renderFilterInput = (filter) => {
        const { key, type, label, options, placeholder: filterPlaceholder, min, max } = filter;
        const value = values[key] || '';

        switch (type) {
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        <option value="">📌 Tous</option>
                        {options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label || opt.value}
                            </option>
                        ))}
                    </select>
                );

            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        placeholder={filterPlaceholder || label}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        placeholder={filterPlaceholder || label}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        min={min}
                        max={max}
                    />
                );

            case 'range':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={value.min || ''}
                            onChange={(e) => handleFilterChange(key, { ...value, min: e.target.value })}
                            placeholder="Min"
                            className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        />
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                        <input
                            type="number"
                            value={value.max || ''}
                            onChange={(e) => handleFilterChange(key, { ...value, max: e.target.value })}
                            placeholder="Max"
                            className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        />
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="flex flex-wrap gap-2">
                        {options?.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(value) && value.includes(opt.value)}
                                    onChange={(e) => {
                                        const newValue = Array.isArray(value) ? [...value] : [];
                                        if (e.target.checked) {
                                            newValue.push(opt.value);
                                        } else {
                                            const index = newValue.indexOf(opt.value);
                                            if (index > -1) newValue.splice(index, 1);
                                        }
                                        handleFilterChange(key, newValue);
                                    }}
                                    className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                                {opt.label || opt.value}
                            </label>
                        ))}
                    </div>
                );

            case 'boolean':
                return (
                    <select
                        value={value === undefined ? '' : String(value)}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleFilterChange(key, val === '' ? undefined : val === 'true');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        <option value="">Tous</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                    </select>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
            {/* Barre de recherche et toggle */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder={placeholder}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            🔍
                        </span>
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange?.('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                aria-label="Effacer la recherche"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {collapsible && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition whitespace-nowrap"
                        >
                            {isExpanded ? '▲ Masquer filtres' : '▼ Afficher filtres'}
                            {activeCount > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-full">
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    )}
                    {showReset && (activeCount > 0 || searchTerm) && (
                        <button
                            onClick={handleReset}
                            className="px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition whitespace-nowrap"
                        >
                            ✕ Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* Filtres */}
            {(!collapsible || isExpanded) && filters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.key} className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {filter.label}
                                    {filter.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {renderFilterInput(filter)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
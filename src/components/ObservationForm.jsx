import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import observationsService from '../services/observationsService';

const ObservationForm = ({ lieuId, onSuccess,onCancel }) => {
    const { estConnecte } = useAuth();
    const [valeur, setValeur] = useState('');
    const [notes, setNotes] = useState('');
    const [unite, setUnite] = useState('dB');
    const [erreur, setErreur] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    if (!estConnecte) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                Connecte-toi pour soumettre une observation pour ce lieu.
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur(null);
        setEnvoi(true);
        try {
            await observationsService.submitObservation({ lieuId, valeur: Number(valeur), notes });
            setValeur('');
            setNotes('');
            setUnite('dB');
            if (onSuccess) onSuccess();
        } catch (err) {
            setErreur(err.message || "Impossible de soumettre l'observation.");
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Niveau sonore (dB)
                </label>
                <input
                    type="number"
                    min="0"
                    max="120"
                    step="1"
                    placeholder="0-120"
                    value={valeur}
                    onChange={(e) => setValeur(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
            </div>
            <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unité
                    </label>
                    <select
                        value={unite}
                        onChange={(e) => setUnite(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="dB">dB</option>
                        <option value="dBA">dBA</option>
                        <option value="dB(C)">dB(C)</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optionnel)
                </label>
                <input
                    type="text"
                    placeholder="Ex: Matinée calme, peu de monde..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength="500"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {notes.length}/500 caractères
                </p>
            </div>
            {erreur && (
                <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    ❌ {erreur}
                </p>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={envoi}
                    className="flex-1 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                     {envoi ? '⏳ Envoi...' : '📤 Soumettre'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
};

export default ObservationForm;
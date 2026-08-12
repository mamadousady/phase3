import apiClient from "./apiClient";

export const observationsService = {
    submitObservation: async (observation) => {
        try {
            if (!observation.lieuId) throw new Error("L'Id du lieu est requis");
            if (observation.valeur === undefined || observation.valeur === null) throw new Error("La valeur est requise");
            if (observation.valeur < 0 || observation.valeur > 120) throw new Error("La valeur doit être comprise entre 0 et 120");

            const response = await apiClient.post('/observations', observation);
            if (response.success) return response.data;
            throw new Error(response.message || "Erreur lors de la soumission de l'observation");
        } catch (error) {
            console.error('Erreur submitObservation:', error);
            throw error;
        }
    },

    getMesObservations: async () => {
        try {
            const response = await apiClient.get('/observations/mes-observations');
            if (response.success) return response.data;
            throw new Error(response.message || "Erreur lors de la récupération de vos observations");
        } catch (error) {
            console.error('Erreur getMesObservations:', error);
            throw error;
        }
    },
};

export default observationsService;
import apiClient from "./apiClient";

export const authService = {
    register: async ({ nom, email, motDePasse }) => {
        try {
            const response = await apiClient.post('/auth/register', { nom, email, motDePasse });
            if (response.success) return response.data;
            throw new Error(response.message || "Erreur lors de l'inscription");
        } catch (error) {
            console.error('Erreur register:', error);
            throw error;
        }
    },

    login: async ({ email, motDePasse }) => {
        try {
            const response = await apiClient.post('/auth/login', { email, motDePasse });
            if (response.success) return response.data;
            throw new Error(response.message || "Erreur lors de la connexion");
        } catch (error) {
            console.error('Erreur login:', error);
            throw error;
        }
    },

    getProfil: async () => {
        try {
            const response = await apiClient.get('/auth/me');
            if (response.success) return response.data;
            throw new Error(response.message || "Erreur lors de la récupération du profil");
        } catch (error) {
            console.error('Erreur getProfil:', error);
            throw error;
        }
    },

    toggleFavori: async (lieuId) => {
        try {
            const response = await apiClient.post(`/auth/favoris/${lieuId}`, {});
            if (response.success) return response;
            throw new Error(response.message || "Erreur lors de la mise à jour des favoris");
        } catch (error) {
            console.error('Erreur toggleFavori:', error);
            throw error;
        }
    },
};

export default authService;
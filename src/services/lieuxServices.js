import apiClient from "./apiClient";

export const lieuxServices={

    getLieux:async()=>{
        try{
            const response=await apiClient.get('/lieux');
            if(response.success){
                return response.data;
            }
            throw new Error(response.message || 'Erreur lors de la récupération des lieux');

        }catch(error){
            console.error('Erreur getLieux:',error);
            throw error;
        }
    },
    getAmbiance:async(lieuId)=>{

        try{
            if (!lieuId){
                throw new Error('L\'Id  du lieu est requis');
            }
            const response=await apiClient.get(`/lieux/${lieuId}/ambiance`);
            if (response.success){
                return response.data;  
            }
            throw new Error(response.message || 'Erreur lors de la récupération de l\'ambiance'); 
        }catch(error){
            console.error(`Erreur getAmbiance pour ${lieuId}:`,error);
            throw error;
        }
    },
    getLieuxDetails:async(lieuId)=>{
        try{
            if(!lieuId){
                throw new Error('L\'Id  du lieu est requis');
            }
            const response=await apiClient.get(`/lieux/${lieuId}`);
            if(response.success){
                return response.data;
            }
            throw new Error(response.message || 'Erreur lors de la récupération des détails du lieux');
        }catch(error){
            console.error(`Erreur getDetails pour ${lieuId}:`,error);
            throw error;
        }
    },

    };
    export default lieuxServices;





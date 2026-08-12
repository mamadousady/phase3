const validerEmail=(email)=>{
    if (!email) return { valide: false, erreur: "L'email est requis" };
    const regex = /^\S+@\S+\.\S+$/;
    if(!regex.test(email)){
        return {valide:false,erreur:"Format d'email invalide"};
    }
    return{valide:true};
}
const validerMotDePasse = function(motDePasse) {
    
    if (!motDePasse) {
        return { valide: false, erreur: "Le mot de passe est requis" };
    }
   
    if (typeof motDePasse !== 'string') {
        return { valide: false, erreur: "Le mot de passe doit être une chaîne de caractères" };
    }
    if (motDePasse.length < 6) {
        return { valide: false, erreur: "Le mot de passe doit avoir au moins 6 caractères" };
    }
    return { valide: true };
};

const validerNom=(nom)=>{
    if (!nom) return { valide: false, erreur: "Le nom est requis" };
    if(nom.length<2){
        return { valide: false, erreur: "Le nom doit avoir au moins 2 caractères" };
    }
    if(nom.length>50){
        return { valide: false, erreur: "Le nom ne peut pas dépasser 50 caractères" };
    }
    return {valide:true};
};

const validerInscription=(data)=>{
    const erreurs = [];
    const nomValidation = validerNom(data.nom);
    if (!nomValidation.valide) erreurs.push(nomValidation.erreur);
    const emailValidation = validerEmail(data.email);
    if (!emailValidation.valide) erreurs.push(emailValidation.erreur);
    const mdpValidation = validerMotDePasse(data.motDePasse);
    if (!mdpValidation.valide) erreurs.push(mdpValidation.erreur);
    
    return{
        valide:erreurs.length===0,
        erreurs
    };
};

const validerConnexion=(data)=>{
    const erreurs = [];
    const emailValidation = validerEmail(data.email);
    if (!emailValidation.valide) erreurs.push(emailValidation.erreur);
    if(!data.motDePasse){
        erreurs.push("Le mot de passe est requis");
    }
    return{
        valide: erreurs.length === 0,
        erreurs
    };
};
const formaterUtilisateurReponse=(utilisateur,token)=>{
    return{
        token,
        utilisateur:{
            id:utilisateur._id,
            nom: utilisateur.nom,
            email: utilisateur.email,
            createdAt: utilisateur.createdAt
        }
    };
};
module.exports = {
    validerEmail,
    validerMotDePasse,
    validerNom,
    validerInscription,
    validerConnexion,
    formaterUtilisateurReponse
};
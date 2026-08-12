const Lieu=require("../models/Lieu");
const Observation=require("../models/Observation");

const classifyAmbiance=(valeur)=>{
    if(valeur<40) return 'calme';
    if(valeur<=60) return 'modéré';
    return 'animé';

};
const getEchelles =()=>({
    calme:40,
    modéré:60,
    animé:60,
});

const trouverCreneauxCalmes=(observations)=>{
    if (!observations || observations.length===0){
        return [];
    }
    const creneaux=[];
    let debutCreneau=null;

    for(let i=0;i<observations.length-1;i++){
        const obs=observations[i];
        const nextObs=observations[i+1];

        if(obs.valeur<40){
            if(!debutCreneau){
                debutCreneau=obs.date;

            }
        }else{
            if(debutCreneau){
                creneaux.push({
                    debut:debutCreneau,
                    fin:obs.date,
                    duree:Math.round((new Date(obs.date) - new Date(debutCreneau)) / (1000 * 60)),
                });
                debutCreneau=null;

            }
        }
    }
    return creneaux;
};

exports.getLieuxAvecAmbiance = async (req, res) => {
    try {
        const lieux = await Lieu.find({});
        
        const resultats = await Promise.all(lieux.map(async (lieu) => {
            const observations = await Observation.find({ lieu: lieu._id })
                .sort({ date: -1 })
                .limit(30);
            
            const derniereObs = observations.length > 0 ? observations[0] : null;
            
            return {
                id: lieu._id,
                nom: lieu.nom,
                adresse: lieu.adresse,
                latitude: lieu.latitude,
                longitude: lieu.longitude,
                type: lieu.type,
                ambiance: derniereObs ? {
                    classification: getClassification(derniereObs.valeur),
                    derniereMesure: {
                        valeur: derniereObs.valeur,
                        date: derniereObs.date,
                        unite: derniereObs.unite || 'dB'
                    },
                    nombreMesures: observations.length
                } : {
                    classification: 'inconnu',
                    derniereMesure: null,
                    nombreMesures: 0
                }
            };
        }));
        
        res.json({
            success: true,
            data: resultats
        });
    } catch (error) {
        console.error('Erreur getLieuxAvecAmbiance:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des lieux'
        });
    }
};



exports.getAmbiance=async(req,res)=>{
    try{
        const {id}=req.params;

        const lieu=await Lieu.findById(id);
        if(!lieu){
            return res.status(404).json({
                success: false,
                message: 'Lieu non trouvé',
            });
        }
        const observation=await Observation.find({lieu:id})
        .sort({date:-1})
        .limit(30);

        if(observation.length===0){
            return res.json({
                success:true,
                data:{
                    lieu:{
                        id:lieu._id,
                        nom:lieu.nom,
                        adresse:lieu.adresse,
                        latitude:lieu.latitude,
                        longitude:lieu.longitude,
                    },
                    classification:'inconnu',
                    echelles:getEchelles(),
                    historique:[],
                    creneauxCalmes:[],
                    message:'Aucune observation disponible pour ce lieu',

                },
            });
        }
        const derniereObs=observation[0];
        const classification=classifyAmbiance(derniereObs.valeur);
        const historique=observation.map(obs=>({
            date:obs.date,
            valeur:obs.valeur,
            unite:obs.unite ||'dB',
            notes:obs.notes,
            auteur:obs.auteur ? obs.auteur.nom:'Anonyme',
        }));

        const observationAsc=observation.slice().reverse();
        const creneauxCalmes=trouverCreneauxCalmes(observationAsc);

        res.json({
            success:true,
            data:{
                lieu:{
                    id:lieu._id,
                        nom:lieu.nom,
                        adresse:lieu.adresse,
                        latitude:lieu.latitude,
                        longitude:lieu.longitude,

                },
                classification:classification,
                echelles:getEchelles(),
                historique:historique,
                creneauxCalmes:creneauxCalmes.map(creneau=>({
                    debut:creneau.debut,
                    fin:creneau.fin,
                    duree:creneau.duree,
                })),
                derniereMesure:{
                    valeur:derniereObs.valeur,
                    date:derniereObs.date,
                    unite:derniereObs.unite ||'dB',
                },
                nombresMesures:observation.length,
            },
        });

    } catch(err){
        console.error('Erreur getAmbiance', err);
        res.status(500).json({
            success:false,
            message:'Erreur lors de la récupération de l\'ambiance',
            error:err.message
        });
    }
};

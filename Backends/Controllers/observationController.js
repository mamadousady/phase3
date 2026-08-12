const observation=require('../models/Observation');
const lieu=require('../models/Lieu');


exports.createObservation = async (req, res) => {
    try {
        const { lieuId, valeur, unite, notes, date } = req.body;
        const userId = req.userId;
        
        // Vérifier que le lieu existe
        const lieu = await Lieu.findById(lieuId);
        if (!lieu) {
            return res.status(404).json({
                success: false,
                message: 'Lieu non trouvé'
            });
        }
        
        // Valider la valeur
        if (valeur === undefined || valeur === null || valeur < 0 || valeur > 120) {
            return res.status(400).json({
                success: false,
                message: 'La valeur doit être comprise entre 0 et 120'
            });
        }
        
        // Créer l'observation (la classification est calculée automatiquement par le middleware)
        const observation = new Observation({
            lieu: lieuId,
            auteur: userId,
            valeur: valeur,
            unite: unite || 'dB',
            notes: notes || '',
            date: date || new Date()
        });
        
        await observation.save();
        
        res.status(201).json({
            success: true,
            data: {
                id: observation._id,
                lieu: observation.lieu,
                auteur: observation.auteur,
                valeur: observation.valeur,
                unite: observation.unite,
                date: observation.date,
                notes: observation.notes,
                classification: observation.classification
            }
        });
        
    } catch (error) {
        console.error('Erreur createObservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'observation'
        });
    }
};


exports.getObservations=async(req,res)=>{
    try{
        const {lieuId,auteurId,startDate,endDate}=req.query;
        let filter={};
        if (lieuId) filter.lieu=lieuId;
        if(auteurId) filter.auteur=auteurId;
        if (startDate || endDate){
            filter.date={};
            if (startDate) filter.date.$gte=new Date(startDate);
            if(endDate) filter.date.$lte=new Date(endDate);

        }
        const observations=await observation.find(filter)
        .populate('lieu','nom adresse latitude longitude')
        .populate('auteur','nom email')
        .sort({date:-1});

        const observationFormat=observations.map(obs=>({
            id:obs._id,
            valeur:obs.valeur,
            unite:obs.unite,
            date:obs.date,
            notes:obs.notes,
            lieu:obs.lieu,
            auteur:obs.auteur ?{
                id:obs.auteur._id,
                nom:obs.auteur.nom,
                email:obs.auteur.email,

            }:null,

        }));
        res.json({
            success:true,
            data:observationFormat,
            count:observationFormat.length,
        })

    } catch(err){
        console.error('Erreur getObservations:', err);
        res.status(500).json({
            success:false,
            message:'Erreur lors de la récupération des observations',
            err:err.message
        });
    }
};
exports.getObservationsByUser=async (req,res)=>{
    try{
        const {userId}=req.params;
        const observations=await observation.find({auteur:userId})
        .populate('lieu','nom adresse latitude longitude')
        .sort({date:-1});

        const observationFormat=observations.map(obs=>({
            id:obs._id,
            valeur:obs.valeur,
            unite:obs.unite,
            date:obs.date,
            notes:obs.notes,
            lieu:{
                id:obs.lieu._id,
                nom:obs.lieu.nom,
                adresse:obs.lieu.adresse,
                latitude:obs.lieu.latitude,
                longitude:obs.lieu.longitude,
            }

        }));
        res.json({
            success:true,
            data:observationFormat,
            count:observationFormat.length,
        })

    }catch(error){
        console.error('Erreur getObservationsByUser:', error);
        res.status(500).json({
            success:false,
            message:'Erreur lors de la récupération des observations de l\'utilisateur',
            error:error.message
        });

    }
};


const express = require('express');
const router = express.Router();
const Observation = require('../models/Observation');
const Lieu = require('../models/Lieu');
const { protect } = require('../middleware/auth');
const cacheService = require('../services/cacheService');
const lieuService = require('../services/lieuServices');




router.post('/', protect, async (req, res) => {
    try {
        const { lieuId, valeur, notes, unite } = req.body;
        const validation=lieuService.validerObservation({lieuId,valeur,notes});

        if(!validation.valide){
            return res.status(400).json({
                success:false,
                message: 'Données invalides',
                erreurs: validation.erreurs

            })
        }


        const lieu = await Lieu.findById(lieuId);
        if (!lieu) {
            return res.status(404).json({
                success: false,
                message: 'Lieu non trouvé.'
            });
        }

        const observation = await Observation.create({
            lieu: lieuId,
            auteur: req.utilisateur._id,
            valeur,
            unite: unite || 'dB',
            notes,
            date: new Date()
        });

        
        lieu.observations.push(observation._id);
        await lieu.save();

        cacheService.invalidateLieu(lieuId);

        await observation.populate('auteur', 'nom email');
        await observation.populate('lieu', 'nom adresse');

        res.status(201).json({
            success: true,
            message: 'Observation soumise avec succès.',
            data: {
                id: observation._id,
                valeur: observation.valeur,
                unite: observation.unite,
                date: observation.date,
                notes: observation.notes,
                lieu: {
                    id: observation.lieu._id,
                    nom: observation.lieu.nom
                },
                auteur: {
                    id: observation.auteur._id,
                    nom: observation.auteur.nom
                }
            }
        });

    } catch (err) {
        console.error('Erreur POST /observations:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission.',
            error: err.message
        });
    }
});


router.get('/mes-observations', protect, async (req, res) => {
    try {
        const observations = await Observation.find({ auteur: req.utilisateur._id })
            .populate('lieu', 'nom adresse latitude longitude')
            .sort({ date: -1 });

        const data = observations.map(obs => ({
            id: obs._id,
            valeur: obs.valeur,
            unite: obs.unite,
            date: obs.date,
            notes: obs.notes,
            lieu: obs.lieu ? {
                id: obs.lieu._id,
                nom: obs.lieu.nom,
                adresse: obs.lieu.adresse,
                latitude: obs.lieu.latitude,
                longitude: obs.lieu.longitude
            } : null
        }));

        res.json({
            success: true,
            data,
            count: data.length
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des observations.',
            error: err.message
        });
    }
});

module.exports = router;
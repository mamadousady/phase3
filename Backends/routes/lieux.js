const express = require('express');
const router = express.Router();
const Lieu = require('../models/Lieu');
const Observation = require('../models/Observation');
const cacheService = require('../services/cacheService');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');
const lieuService=require('../services/lieuServices');

;
router.get('/',cacheMiddleware(300), async (req, res) => {
    try {
        const lieux = await Lieu.find();

        const lieuxAvecAmbiance = await Promise.all(lieux.map(async (lieu) => {
            const derniereObs = await Observation.findOne({ lieu: lieu._id })
                .sort({ date: -1 })
                .populate('auteur', 'nom');

                const nbMesures = await Observation.countDocuments({ lieu: lieu._id });
                return lieuService.formaterLieuAmbiance(lieu, derniereObs, nbMesures);
        }));

        res.json({
            success: true,
            data: lieuxAvecAmbiance,
            count: lieuxAvecAmbiance.length,
            cached:res.getHeader('X-Cache')==='HIT'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des lieux.',
            error: err.message
        });
    }
});


router.get('/:id/ambiance',cacheMiddleware(300), async (req, res) => {
    try {
        const lieu = await Lieu.findById(req.params.id);
        if (!lieu) {
            return res.status(404).json({
                success: false,
                message: 'Lieu non trouvé.'
            });
        }

        const observations = await Observation.find({ lieu: lieu._id })
            .populate('auteur', 'nom')
            .sort({ date: -1 })
            .limit(30);

        if (observations.length === 0) {
            return res.json({
                success: true,
                data: {
                    lieu: {
                        id: lieu._id,
                        nom: lieu.nom,
                        adresse: lieu.adresse,
                        latitude: lieu.latitude,
                        longitude: lieu.longitude
                    },
                    classification: 'inconnu',
                    echelles: lieuService.getEchelles(),
                    historique: [],
                    creneauxCalmes: [],
                    stats:lieuService.calculerStatAmbiance([]),
                    message: 'Aucune observation disponible.',
                    cached:res.getHeader('X-Cache')==='HIT'
                }
            });
        }
        const data = lieuService.formaterAmbianceDetail(lieu, observations);
        data.cached = res.getHeader('X-Cache') === 'HIT';

        
        res.json({
            success: true,
            data   
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'ambiance.',
            error: err.message
        });
    }
});


router.get('/:id',cacheMiddleware(300), async (req, res) => {
    try {
        const lieu = await Lieu.findById(req.params.id);
        if (!lieu) {
            return res.status(404).json({
                success: false,
                message: 'Lieu non trouvé.'
            });
        }

        res.json({
            success: true,
            data: {
                id: lieu._id,
                nom: lieu.nom,
                adresse: lieu.adresse,
                type: lieu.type,
                latitude: lieu.latitude,
                longitude: lieu.longitude
            },
            cached:res.getHeader('X-Cache')==='HIT'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du lieu.',
            error: err.message
        });
    }
});

module.exports = router;
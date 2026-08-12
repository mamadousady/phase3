const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');
const { protect } = require('../middleware/auth');


const genererToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};


router.post('/register', async (req, res) => {
    try {
        const { nom, email, motDePasse } = req.body;

        // Validation
        if (!nom || !email || !motDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Nom, email et mot de passe sont requis.'
            });
        }

        // Vérifier si l'email existe déjà
        const existeDeja = await Utilisateur.findOne({ email });
        if (existeDeja) {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec cet email existe déjà.'
            });
        }

        
        const utilisateur = await Utilisateur.create({
            nom,
            email,
            motDePasse
        });

        const token = genererToken(utilisateur._id);

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès.',
            data: {
                token,
                utilisateur: {
                    id: utilisateur._id,
                    nom: utilisateur.nom,
                    email: utilisateur.email
                }
            }
        });

    } catch (err) {
        console.error('Erreur register:', err);
        
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du compte.',
            error: err.message
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        if (!email || !motDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe sont requis.'
            });
        }

        
        const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
        
        if (!utilisateur) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        // Vérifier le mot de passe
        const motDePasseValide = await utilisateur.comparerMotDePasse(motDePasse);
        
        if (!motDePasseValide) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect.'
            });
        }

        const token = genererToken(utilisateur._id);

        res.json({
            success: true,
            message: 'Connexion réussie.',
            data: {
                token,
                utilisateur: {
                    id: utilisateur._id,
                    nom: utilisateur.nom,
                    email: utilisateur.email
                }
            }
        });

    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion.',
            error: err.message
        });
    }
});


router.get('/me', protect, async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.utilisateur._id)
            .populate('lieuxFavoris', 'nom adresse latitude longitude');

        res.json({
            success: true,
            data: {
                id: utilisateur._id,
                nom: utilisateur.nom,
                email: utilisateur.email,
                lieuxFavoris: utilisateur.lieuxFavoris,
                createdAt: utilisateur.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil.',
            error: err.message
        });
    }
});


router.post('/favoris/:lieuId', protect, async (req, res) => {
    try {
        const { lieuId } = req.params;
        const utilisateur = await Utilisateur.findById(req.utilisateur._id);

        const indexFavori = utilisateur.lieuxFavoris.indexOf(lieuId);
        
        if (indexFavori === -1) {
            
            utilisateur.lieuxFavoris.push(lieuId);
            await utilisateur.save();
            res.json({
                success: true,
                message: 'Lieu ajouté aux favoris.',
                estFavori: true
            });
        } else {
            
            utilisateur.lieuxFavoris.splice(indexFavori, 1);
            await utilisateur.save();
            res.json({
                success: true,
                message: 'Lieu retiré des favoris.',
                estFavori: false
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la gestion des favoris.',
            error: err.message
        });
    }
});

module.exports = router;
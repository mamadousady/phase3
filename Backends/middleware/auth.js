const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const protect = async (req, res, next) => {
    try {
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès refusé. Token manquant.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Trouver l'utilisateur
        const utilisateur = await Utilisateur.findById(decoded.id);
        
        if (!utilisateur) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé.'
            });
        }

        
        req.utilisateur = utilisateur;
        next();

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide.'
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré. Veuillez vous reconnecter.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'authentification.',
            error: err.message
        });
    }
};

module.exports = { protect };
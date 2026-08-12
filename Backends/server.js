const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { readFileSync } = require('fs');
const { join } = require('path');

const authRoutes = require('./routes/auth.js');
const lieuxRoutes = require('./routes/lieux.js');
const observationsRoutes = require('./routes/observations.js');
const Lieu = require('./models/Lieu.js');
const Observation = require('./models/Observation.js');
const cacheService=require('./services/cacheService.js');
const { cacheMiddleware, invalidateCache } = require('./middleware/cache');


dotenv.config();
mongoose.set('autoIndex', true);
mongoose.set('strictQuery', false);
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


const seedDatabase = async () => {
    try {
        console.log('📦 Début du seed...');
        const fichiers = [
            { file: 'collecteA.json' },
            { file: 'collecteB.json' },
            { file: 'collecteC.json' }
        ];

        for (const { file } of fichiers) {
            
            const collecte = JSON.parse(
                readFileSync(join(__dirname, 'data', file), 'utf-8')
            );

            // Vérifier si le lieu existe déjà
            const lieuExistant = await Lieu.findOne({ nom: collecte.lieu.nom });

            if (lieuExistant) {
                console.log(`ℹ️  Lieu déjà existant: ${collecte.lieu.nom}`);
                continue; // Passer au fichier suivant
            }

            // Créer le lieu
            const lieu = await Lieu.create({
                nom: collecte.lieu.nom,
                adresse: collecte.lieu.adresse,
                latitude: collecte.lieu.latitude,
                longitude: collecte.lieu.longitude,
                type: collecte.lieu.type || 'lieu'
            });
            console.log(`Lieu créé: ${lieu.nom}`);

            // Créer les observations SANS auteur
            for (const obs of collecte.observations) {
                const observation = await Observation.create({
                    lieu: lieu._id,
                    //  Pas d'auteur pour les données seed
                    valeur: obs.valeur,
                    unite: obs.unite || 'dB',
                    date: new Date(obs.date),
                    notes: obs.notes || ''
                });
                lieu.observations.push(observation._id);
            }

            await lieu.save();
            console.log(`${collecte.observations.length} observations créées pour ${lieu.nom}`);
        }

        console.log('Seed terminé avec succès');

    } catch (err) {
        console.error('Erreur seed:', err.message);
    }
};


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MONGODB connecté');
        await seedDatabase();
    } catch (err) {
        console.error('Erreur MongoDB:', err.message);
        process.exit(1);
    }
};


app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Ambiance - Phase 2',
        version: '2.0.0',
        cache:cacheService.getStats(),
        routes: {
            lieux: 'GET /lieux',
            ambiance: 'GET /lieux/:id/ambiance',
            register: 'POST /auth/register',
            login: 'POST /auth/login',
            profil: 'GET /auth/me',
            observations: 'POST /observations',
            mesObservations: 'GET /observations/mes-observations'
        }
    });
});

app.use('/auth', authRoutes);
app.use('/lieux', lieuxRoutes);
app.use('/observations', observationsRoutes);

app.get('/cache/stats', (req, res) => {
    res.json({
        success: true,
        data: cacheService.getStats()
    });
});
app.delete('/cache', (req, res) => {
    cacheService.flush();
    res.json({
        success: true,
        message: 'Cache vidé avec succès'
    });
});



app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route non trouvée: ${req.method} ${req.url}`
    });
});


app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err.message);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
        console.log(`Routes: /lieux | /auth | /observations`);
        console.log(`Cache TTL: 300s (5min)`);
        console.log('='.repeat(60));
    });
});
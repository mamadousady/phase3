const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
jest.setTimeout(30000);

global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    await mongoose.connect(uri);
});

fterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
    jest.clearAllMocks();
});
afterAll(async () => {
    if (mongod) {
        await mongoose.disconnect();
        await mongod.stop();
    }
});
global.createTestUser = async () => {
    const bcrypt = require('bcryptjs');
    const Utilisateur = require('../models/Utilisateur');
    
    const user = await Utilisateur.create({
        nom: 'Test User',
        email: 'test@example.com',
        motDePasse: await bcrypt.hash('password123', 10)
    });
    return user;
};
global.createTestLieu = async () => {
    const Lieu = require('../models/Lieu');
    const lieu = await Lieu.create({
        nom: 'Test Lieu',
        adresse: '123 Test Street',
        latitude: 45.5017,
        longitude: -73.5673,
        type: 'café'
    });
    return lieu;
};
global.createTestObservation = async (lieuId, userId = null) => {
    const Observation = require('../models/Observation');
    const observation = await Observation.create({
        lieu: lieuId,
        auteur: userId,
        valeur: 45,
        unite: 'dB',
        notes: 'Test observation',
        date: new Date()
    });
    return observation;
};
global.generateTestToken = (userId) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
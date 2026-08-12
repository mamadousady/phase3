const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
    nom:{
        type: String,
        required: [true, 'le nom est requis'],
        trim: true,
        minLength: [2, 'Le nom doit avoir au moins 2 caracteres'],
        maxLength: [50, 'Le nom ne peut pas depasser 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    motDePasse: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minLength: [6, 'Le mot de passe doit avoir au moin 6 caracteres'],
        select: false
    },
    lieuxFavoris: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lieu'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

utilisateurSchema.pre('save', async function(next) {
        if (!this.isModified('motDePasse')) return next();
        const salt = await bcrypt.genSalt(10);
        this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
        next();
});

utilisateurSchema.methods.comparerMotDePasse = async function(motDePasseCandidat){
    return await bcrypt.compare(motDePasseCandidat, this.motDePasse);
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
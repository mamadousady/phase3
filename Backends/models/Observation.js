const mongoose=require("mongoose");

const observationShema=new mongoose.Schema({
    lieu:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Lieu',
        required:true

    },
    auteur:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Utilisateur',
        required:false
    },
    valeur:{
        type:Number,
        required:true,
        min:0,
        max:120

    },
    unite:{
        type:String,
        default:'dB'
    },
    date:{
        type:Date,
        default:Date.now
    },
    notes:{
        type:String,
        maxLength:500
    }
});
observationShema.index({lieu:1,date:-1});
observationShema.index({auteur:1,date:-1});

module.exports=mongoose.model('observation',observationShema);

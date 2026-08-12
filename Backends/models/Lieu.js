const mongoose=require("mongoose");
const lieuSchema=new mongoose.Schema({
    nom:{
        type:String,
        required:true,
        unique:true
    },
    adresse:{
        type:String,
        required:true
    },
    latitude:{
        type:Number,
        required:true,
        validate:{
            validator:function(v){
                return v >=-90 && v<=90 ;

            },
            message:props=>`{props.value} n'est pas une latitude valide.`
        }
    },
    longitude:{
        type:Number,
        required:true,
        validate:{
            validator:function(v){
                return v >=-180 && v<=180 ;

            },
            message:props=>`{props.value} n'est pas une longitude valide.`
        }

    },

    type: {
        type: String,
        default: 'lieu'
    },

    observations:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Observation'
    }],
    createdAt:{
        type:Date,
        default:Date.now

    },
    updateAt:{
        type:Date,
        default:Date.now
    }

});

lieuSchema.pre('save',function(next){
    this.updateAt=Date.now();
    next();
});

lieuSchema.methods.getDerniereObservation=function() {
    if(!this.observations || this.observations.length===0){
        return null;
    }
    return this.observations[this.observations.length-1];
};

module.exports=mongoose.model('Lieu',lieuSchema);
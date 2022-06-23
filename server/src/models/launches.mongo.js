 // schema

 const mongoose = require('mongoose');

 
 const launchesSchema=mongoose.Schema({            // pasiing defination of schema as object
    flightNumber:{
        type: Number,
        required:true,
        //   default:100,
        //    min:100,
        //    max:999,
    },
    launchDate:{
        type: Date,
        required:true,
    },
    mission:{
            type: String,
            required:true,
    },
    
    rocket:{
            type:String,
            required:true,
    },
    target:{
        type: String,
    },
    customers: [{type:String} ],
    upcoming:{
        type:Boolean,
        required:true,
    },
    success:{
        type:Boolean,
        required:true,
        default:true,
    },
    
    
});

// connets launchesSchema with the "launches" collection
//"Launch" is colection in mongo DB
module.exports= mongoose.model('Launch',launchesSchema);
     
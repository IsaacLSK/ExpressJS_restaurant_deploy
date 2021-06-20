const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({ 
    name : {
        type : String,
        required : true
    },
    borough : String,
    cuisine : String,
    photo: Buffer,
    photo_mimetype : String,
    address : {
        street : String,
        building : String,
        zipcode : String,
        coord : [{
            coord_lat : {
                type : Number
            },
            coord_lon : {
                type : Number
            }
        }]
        },
    grades: [{
        user : String,
        score:{
            type : Number,
            default: 1,
            min : [1, 'Min is 1'], 
            max : [10, 'Max  is 10'],
            
        }
    }],
    owner : {
        type : String, 
        required : true
    }
});



module.exports = mongoose.model('Restaurant', restaurantSchema);

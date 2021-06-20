const mongoose = require('mongoose');

const userSchema = mongoose.Schema({ 
    userid: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String
    } ,
    email: String,
    date :{
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('User', userSchema);


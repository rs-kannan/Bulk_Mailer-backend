const mongoose = require('mongoose')

const registerUser = mongoose.Schema({

    firstName:{
        type:String,
        require:true
    },
    lastName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    key:{
        type:String,
        require:true
    },
})

module.exports = mongoose.model('Users',registerUser)
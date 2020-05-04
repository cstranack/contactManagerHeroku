// model for adding contact
var mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    number: {
        type: String
    },
    date: {
        type: Date,
        defult: Date.now
    }
});


module.exports = Contact = mongoose.model('contact', ContactSchema);
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//defining a data structure and database
const User = require('../models/User');


//function directly in module exports
//done - similar to try or catch - the middlewear has to be complete before
//next part is executed so done lets the api know this function is done
module.exports = (passport) =>{
    passport.use(
        new LocalStrategy((username, password, done) =>{
            User.findOne({ username })
            .then(user =>{
                //if user doesn't exist
                if(!user){
                    return done(null, false, {message: 'Username does not exisit'});
                }
                //password input by user and the password inside the database is compared
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;
                    if(isMatch){
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Incorrect Password'});
                    }
                })
            })
        })
    );
    //once a user is authenticated - serializeUser allows them to continue with
    //the session - permisions and access
    passport.serializeUser((user, done)=>{
        done(null, user.id)
    });
    //deserialize removes these permissions
    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user) =>{
            done(err, user);
        })
    })
}

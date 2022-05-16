const User = require('../models/user');

/* helps secure the User password by encrypting (salting + hashing) */
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.postSignIn = (req, res, next) => {
    let username = req.body.username;
    let phoneNo = parseInt(req.body.phoneNo);
    let email = req.body.email;
    let password = req.body.password;

    //bcrypt password encryption
    bcrypt
        .genSalt(saltRounds)
        .then(salt => {
            return bcrypt.hash(password, salt);
        })
        .then(hash => {
            return User.create({
                username: username,
                phoneNo: phoneNo,
                email: email,
                password: hash
            })
        })
        .then(result => {
            res.status(200).json({
                'user': 'created successfully'
            });
        })
        .catch(err => {
            if(err.name == 'SequelizeUniqueConstraintError') {
                // forbidden (user already exists)
                res.status(403).json({
                    'user': 'already exists'
                });
            }
            else {
                // bad request (client error!)
                res.status(400).json({
                    'user': 'error'
                });
            }
        });
};
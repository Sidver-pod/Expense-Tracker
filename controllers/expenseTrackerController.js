const User = require('../models/user');

/* helps secure the User password by encrypting (salting + hashing) */
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.postSignIn = (req, res, next) => {
    let username = req.body.username;
    let phoneNo = req.body.phoneNo;
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
            });
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

exports.postLogin = (req, res, next) => {
    let email = req.body.email;
    let plainTextPassword = req.body.password;

    User.findAll({
        where: {
            email: email
        }
    })
    .then(user => {
        // 'email' is correct! (the length is greater than 0)
        if(user.length) {
            let hash = user[0].dataValues.password;

            bcrypt
                .compare(plainTextPassword, hash)
                .then(result => {
                    // 'true' (they match!)
                    if(result) {
                        res.status(200).json({
                            'login': 'logged in successfully'
                        });
                    }
                    // 'false' (they don't match)
                    else {
                        // 'password' is incorrect! - bad request (client error!)
                        res.status(400).json({
                            'login': 'password is incorrect'
                        });
                    }
                })
                .catch(err => {
                    console.error(err);

                    // server error!
                    res.status(500).json({
                        'login': 'server error'
                    });
                });
        }
        else {
            // 'email' is incorrect! - not found (client error!)
            res.status(404).json({
                'login': 'email is incorrect'
            });
        }
    })
    .catch(err => {
        console.error(err);
        // server error!
        res.status(500).json({
            'login': 'server error'
        });
    });
};
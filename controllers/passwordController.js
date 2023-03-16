const path = require('path');
const sequelize = require('../util/database'); // for transaction!
const User = require('../models/user');
const ForgotPassword = require('../models/forgotPassword');

/* helps secure the User password by encrypting (salting + hashing) */
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.forgotPassword = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        let emailAddress = req.body.emailAddress;

        let user = await User.findOne({
            where: {
                email: emailAddress
            }
        });
    
        let result;
    
        if(user) {
            result = await user.createForgotPassword({
                isActive: true
            }, { transaction: t });
        }
        else res.sendStatus(404); // invalid email; does not exist in the database!
    
        let uuid = result.dataValues.id; 
        let link = `https://localhost:3000/password/reset/${uuid}`;
    
        // using Twilio SendGrid's v3 Node.js Library
        // https://github.com/sendgrid/sendgrid-nodejs
    
        const sgMail = require('@sendgrid/mail');
    
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
        const msg = {
            to: emailAddress, // Change to your recipient
            from: {
                name: 'Expense Tracker',
                email: process.env.EMAIL_ADDRESS
            }, // Change to your verified sender
            subject: 'Reset Your Password',
            text: `To reset your password visit the link provided:- ${link}`,
            html: `<strong>To reset your password visit the link provided:- </strong><br><a href=${link} target='_blank'>Reset Password</a>`
        };
    
        let response = await sgMail.send(msg);
    
        console.log('Email sent');
        console.log(response);
        
        await t.commit();

        res.status(200).json({
            'email': 'Please check your registered e-mail for instructions to reset the password.'
        });
    }
    catch(error) {
        await t.rollback();

        console.error(error);
        res.sendStatus(500);
    }
};

exports.resetPassword = async (req, res, next) => {
    let t; // transaction

    try {
        let uuid = req.params.uuid;
    
        let user_password = await ForgotPassword.findOne({
            where: {
                id: uuid,
                isActive: true
            }
        });
    
        let result;
    
        if(user_password) {
            t = await sequelize.transaction(); // transaction

            result = await user_password.update({
                isActive: false
            }, { transaction: t }); // making the active link inactive
        }
        else {
            result = false; // link was already inactive!
        }
    
        // for link that was already inactive
        if(result === false) {
            return res.status(303).sendFile(path.join(__dirname, '../views/reset-password-error.html'));
        }
    
        await t.commit();

        // for link that was active
        res.status(200).sendFile(path.join(__dirname, '../views/reset-password.html'));
    }
    catch(err) {
        await t.rollback();

        console.error(err);
        res.sendStatus(404);
    }
}

// #1 Only allow those links that are active to change their password!
// #2 'isActive' should be changed to 'inActive' (false)

exports.updatePassword = async (req, res, next) => {
    let t; // transaction

    try {
        let uuid = req.params.uuid;
        let newPassword = req.body.password;
        let newEncryptedPassword;
        let userId;

        let user_password = await ForgotPassword.findOne({
            where: {
                id: uuid,
                isActive: false
            },
            attributes: [ 'userId' ]
        });

        if(user_password) {
            userId = user_password.dataValues.userId;
        }
        else throw 'User does not exist!';
    
        //bcrypt password encryption
        let salt = await bcrypt.genSalt(saltRounds);
        let hash = await bcrypt.hash(newPassword, salt);
    
        newEncryptedPassword = hash;
    
        t = await sequelize.transaction(); // transaction

        let result = await User.update({ password: newEncryptedPassword }, {
            where: {
                id: userId
            },
            transaction: t
        }); // password update!
    
        if(!result) {
            throw 'User does not exist!'
        }
    
        await t.commit();

        res.status(200).json({
            'password': 'Your password has been reset successfully!'
        });
    }
    catch(err) {
        await t.rollback();

        console.error(err);
        res.sendStatus(403); // User does not exist!
    }
};
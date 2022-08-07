const User = require('../models/user');
const ForgotPassword = require('../models/forgotPassword');

/* helps secure the User password by encrypting (salting + hashing) */
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.forgotPassword = (req, res, next) => {
    let emailAddress = req.body.emailAddress;

    User.findOne({
        where: {
            email: emailAddress
        }
    })
    .then(result => {
        if(result) {
            return ForgotPassword.create({
                isActive: true,
                userId: result.dataValues.id
            });
        }
        else res.sendStatus(404); // invalid email; does not exist in the database!
    })
    .then(result => {
        let uuid = result.dataValues.id; 
        let link = `http://localhost:3000/password/reset/${uuid}`;

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
    
        return sgMail.send(msg);
    })
    .then(response => {
        console.log('Email sent');
        console.log(response);
        
        res.status(200).json({
            'email': 'Please check your registered e-mail for instructions to reset the password.'
        });
    })
    .catch((error) => {
        console.error(error);
    });
};

exports.resetPassword = (req, res, next) => {
    let uuid = req.params.uuid;
    let userId;

    ForgotPassword.findOne({
        where: {
            id: uuid,
            isActive: true
        }
    })
    .then(result => {
        if(result) {
            userId = result.dataValues.userId;
            return result.update({ isActive: false }); // making the active link inactive
        }
        else {
            return false; // link was already inactive!
        }
    })
    .then(result => {
        // for link that was already inactive
        if(result === false) {
            return res.status(303).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error | Expense Tracker</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Indie+Flower&family=Poppins:wght@200;400;600&display=swap" rel="stylesheet">
                </head>
                <body style="font-family: Poppins;">
                    <div style='display: flex; justify-content: center; align-items: center;'>
                        <div style='width: 65%;'>
                            <p style='font-size: 2vw;'>
                                Error! Link is inactive. Please generate a new link to reset your password by going back to the <a href='file:///Users/sidver/Documents/JS/Expense%20Tracker/views/login.html'>login page</a> and clicking on <strong>Forgot Password?</strong> once again.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        // for link that was active
        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Forgot Password | Expense Tracker</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Indie+Flower&family=Poppins:wght@200;400;600&display=swap" rel="stylesheet">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.2/axios.min.js" defer></script>
            </head>
            <body style="font-family: Poppins, sans-serif; background-color: #f6f6f6;">
                <main style="display: flex; justify-content: center; align-items: center;">
                    <div class="one">
                        <h1>Reset Your Password</h1>
                        <form action="" method="post" style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
            
                            <input type="password" name="reset" id="reset_1" placeholder="New Password" style="width: 100%; height: 28px; padding: 5px; border: 1px solid white; border-radius: 5px;" required>
            
                            <input type="password" name="reset" id="reset_2" placeholder="Retype New Password" style="width: 100%; height: 28px; padding: 5px; border: 1px solid white; border-radius: 5px; margin-top: 12px;" required>
                            
                            <input type="submit" style="width: 100%; height: 38px; padding: 5px; background-color: #393939; border: 1px solid #393939; border-radius: 5px; color: #f6f6f6; cursor: pointer;margin-top: 30px;">
            
                        </form>
                    </div>
                </main>
                <script>
                    let form = document.getElementsByTagName('form')[0];
                    let password1 = document.getElementsByTagName('input')[0];
                    let password2 = document.getElementsByTagName('input')[1];
            
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
            
                        if(password1.value !== password2.value) {
                            password1.style.borderColor = '#F35D5D';
                            password2.style.borderColor = '#F35D5D';
                            
                            let div_one = document.getElementsByClassName('one')[0];
            
                            if(!document.getElementsByTagName('p')[0]) {
                                let p = document.createElement('p');
                                div_one.appendChild(p);
                                p.innerText = '* Passwords do not match!';
                                p.style.color = '#F35D5D';
                                p.style.marginTop = '-65px';
                                p.style.fontSize = 'small';
                            }
                        }
                        else {
                            axios.post('http://localhost:3000/password/update/${userId}', {
                                'password': password1.value
                            })
                            .then(result => {
                                password1.value = '';
                                password2.value = '';
                                alert(result.data.password);
                            })
                            .catch(err => {
                                alert('Error! Please try again by generating a new reset link by heading back to the login page and clicking on Forgot Password?');

                                console.error(err);
                            });
                        }
                    });
            
                    password1.addEventListener('click', (e) => {
                        e.preventDefault();
            
                        if(e.target.style.borderColor === 'rgb(243, 93, 93)') {
                            e.target.style.borderColor = 'white';
                            e.target.nextElementSibling.style.borderColor = 'white';
                            e.target.parentElement.nextElementSibling.remove();
                        }
                    });
            
                    password2.addEventListener('click', (e) => {
                        e.preventDefault();
            
                        if(e.target.style.borderColor === 'rgb(243, 93, 93)') {
                            e.target.style.borderColor = 'white';
                            e.target.previousElementSibling.style.borderColor = 'white';
                            e.target.parentElement.nextElementSibling.remove();
                        }
                    });
                </script>
            </body>
            </html>
        `);
    })
    .catch(err => {
        console.error(err);
        res.sendStatus(404);
    });
}

// #1 Only allow those links that are active to change their password!
// #2 'isActive' should be changed to 'inActive' (false)

exports.updatePassword = (req, res, next) => {
    let userId = req.params.userId;
    let newPassword = req.body.password;
    let newEncryptedPassword;

    //bcrypt password encryption
    bcrypt
        .genSalt(saltRounds)
        .then(salt => {
            return bcrypt.hash(newPassword, salt);
        })
        .then(hash => {
            newEncryptedPassword = hash;

            return User.findOne({
                where: {
                    id: userId
                }
            });
        })
        .then(user => {
            if(user) {
                return user.update({ password: newEncryptedPassword }); // password update!
            }
            else throw 'User does not exist!'
        })
        .then(result => {
            res.status(200).json({
                'password': 'Your password has been reset successfully!'
            });
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(403); // User does not exist!
        });
};
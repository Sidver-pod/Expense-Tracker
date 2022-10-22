const User = require('../models/user');
const DailyExpense = require('../models/dailyExpense');
const DownloadHistory = require('../models/downloadHistory');

/* helps secure the User password by encrypting (salting + hashing) */
const bcrypt = require('bcrypt');
const saltRounds = 10;

/* helps the User remain logged in */
const jwt = require('jsonwebtoken');

/*
    #1 helps to connect with Amazon S3 for donwloading the generated report
    #2 imported from the 'services' folder
*/
const AWS_S3_service = require('../services/AWS-S3-service');

function generateAccessToken(userId) {
    return jwt.sign(userId, process.env.TOKEN_SECRET);
}

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
                        let username = user[0].dataValues.username.split(' ')[0];
                        let isPremiumUser = user[0].dataValues.isPremiumUser;
                        const token = generateAccessToken({id: user[0].dataValues.id});

                        res.status(200).json({
                            'login': 'logged in successfully',
                            'username': username,
                            'isPremiumUser': isPremiumUser,
                            'token': token
                        });
                    }
                    // 'false' (they don't match)
                    else {
                        // 'password' is incorrect! - unauthorised (client error!)
                        res.status(401).json({
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

exports.postTrackExpense = (req, res, next) => {
    let category = req.body.track.category;
    let expense = req.body.track.expense;
    let description = req.body.track.description;

    req.user.createDailyExpense({
        category: category,
        amount: expense,
        description: description
    })
    .then(result => {
        res.status(200).json({
            'dailyExpense': 'created successfully'
        });
    })
    .catch(err => {
        console.log(err);
        // server error!
        res.status(500).json({
            'dailyExpense': 'server error'
        });
    });
};

exports.getTrackExpense = (req, res, next) => {
    let userId = req.userId;

    User.findAll({
        where: {
            id: userId
        }
    })
    .then(user => {
        if(user.length) {
            let username = user[0].dataValues.username.split(' ')[0];
            let isPremiumUser =  user[0].dataValues.isPremiumUser;

            res.status(200).json({
                'username': username,
                'isPremiumUser': isPremiumUser
            });
        }
        else {
            throw 'User does not exist in the database!';
        }
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(403); // User does not exist (invalid token!)
    });
};

exports.getMyExpense = (req, res, next) => {
    let userId = req.userId;

    if(req.headers['userid']) {
        userId = req.headers['userid'];
    }

    DailyExpense.findAll({
        where: {
            userId: userId
        }
    })
    .then(user_expense => {
        if(user_expense.length) {
            let user_data = user_expense;

            res.status(200).json({
                'user_data': user_data
            });
        }
        else {
            res.sendStatus(404); // Not Found
        }
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(403); // User does not exist (invalid token!)
    });
};

exports.deleteMyExpense = (req, res, next) => {
    const userId = req.userId;
    const id = req.body.id;

    DailyExpense.destroy({
        where: {
            id: id,
            userId: userId
        }
    })
    .then(result => {
        console.log(result);
        res.status(200).json({
            'delete': 'successful'
        });
    })
    .catch(err => {
        console.error(err);
        res.sendStatus(404);
    });
};

exports.getMyLeaderboard = (req, res, next) => {
    let arr = [];

    DailyExpense.findAll()
    .then(users_data => {
        let myMap = new Map(); // hashtable

        for(let user_data of users_data) {
            let userId = user_data.dataValues.userId;
            let expenseAmount = user_data.dataValues.amount;

            // for a 'userId' that already exists in the hashtable
            if(myMap.get(userId)) {
                myMap.set(userId, (myMap.get(userId) + expenseAmount));
            }
            // for a new 'userId'
            else {
                myMap.set(userId, expenseAmount);
                arr.push({
                    userId: userId,
                    name: 'temporary',
                    totalExpenseAmount: 0
                });
            }
        }

        // putting all the summed up values from the hashtable into the array's objects
        for(let i of arr) {
            let totalExpenseAmount = myMap.get(i.userId);
            i.totalExpenseAmount = totalExpenseAmount;
        }

        // sorting the array with respect to the 'totalExpenseAmount'
        arr.sort((a, b) => {
            if(a.totalExpenseAmount < b.totalExpenseAmount) {
                return -1;
            }
            else if(a.totalExpenseAmount > b.totalExpenseAmount) {
                return 1;
            }
            else return 0;
        });
    })
    .then(() => {
        return User.findAll();
    })
    .then(users_data => {
        let myMap = new Map(); // new hashtable
        
        for(let user_data of users_data) {
            let userId = user_data.dataValues.id;
            let username = user_data.dataValues.username;
            myMap.set(userId, username);
        }

        for(let i of arr) {
            let name = myMap.get(i.userId);
            i.name = name;
        }

        res.status(200).json({
            arr : arr,
            userId: req.userId
        });
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500); // Internal Server Error!
    });
};

// #1 get all the data from 'DailyExpense'

// #2 keep a hashtable to bookmark => new IDs with an expense amount / increment existing ones by adding
    // when you come across a 'new ID' => form a new element in an array with values {userId: #, name: 'temporary', totalExpenseAmount: 0}

// #3 at the end, after all of the above are accomplished, iterate through the array and check against the 'userId' in the hashtable and take out the 'expense amount' and store it in totalExpenseAmount for every element of the array

// #4 sort the array with respect to totalExpenseAmount

// #5 Now, get all the data from 'User'

// #6 Iterate through the data and keep recording the 'names' in a new hashtable with 'userId' as the key

// #7 Iterate through the array and put in the correct 'name' with the help of the 'userId'

// #8 send the array!

let getMyReport;
let report; // for 'downloadMyReport'
exports.getMyReport = getMyReport = (req, res, next) => {
    DailyExpense.findAll({
        where: {
            userId: req.userId
        }
    })
    .then(userData => {
        let arr = [];
        
        for(i of userData) {
            let category = i.dataValues.category;
            let amount = i.dataValues.amount;
            let createdAt = i.dataValues.createdAt;

            let date = createdAt.getDate() + '/' + (createdAt.getMonth()+1 < 10 ? '0' + (createdAt.getMonth()+1) : createdAt.getMonth()+1) + '/' + createdAt.getFullYear();

            let obj = {
                category : category,
                expense : amount,
                date : date
            }

            arr.push(obj);
        }

        report = arr; // for 'downloadMyReport'
        
        res.status(200).json({
            arr : arr
        });
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500); // Internal Server Error!
    });
}

exports.downloadMyReport = async (req, res, next) => {
    try {
        await req.userId.getMyReport; // helps assign user data to the variable 'report'

        // client error!
        if(report === undefined) {
            return res.status(400).json({fileURL: undefined, success: false, error: 'Client Error'}); // Bad Request
        }

        console.log(report);

        let obj = {
            data: report
        }

        let stringifiedData = JSON.stringify(obj);

        console.log(stringifiedData);
        
        let fileName = `Daily Expense Report ${req.userId}/${new Date()}.txt`; // doing so eliminates the problem of overwriting the same file in Amazon S3!
    
        let fileURL = await AWS_S3_service.uploadToS3(stringifiedData, fileName);
        
        // saving the 'fileURL' in 'downloadHistory' table
        req.user.createDownloadHistory({
            url: fileURL
        });

        return res.status(200).json({fileURL: fileURL, success: true});
    }
    catch(err) {
        console.log('Something went wrong!', err);
        return res.status(500).json({fileURL: '', success: false, error: err}); // Internal Server Error!
    }
}

exports.getDownloadHistory = (req, res, next) => {
    DownloadHistory.findAll({
        where: {
            userId: req.userId
        }
    })
    .then(userDownloadHistory => {
        console.log(userDownloadHistory);
        res.status(200).json({history: userDownloadHistory});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}
const sequelize = require('../util/database'); // for raw SQL query & transaction!
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

let EXPENSES_PER_PAGE = 7; // default value

function generateAccessToken(userId) {
    return jwt.sign(userId, process.env.TOKEN_SECRET);
}

exports.postSignIn = async (req, res, next) => {
    const t = await sequelize.transaction(); // transaction

    try {
        let username = req.body.username;
        let phoneNo = req.body.phoneNo;
        let email = req.body.email;
        let password = req.body.password;
        let totalExpenseAmount = 0;
        
        //bcrypt password encryption
        let salt = await bcrypt.genSalt(saltRounds);

        let hash = await bcrypt.hash(password, salt);

        await User.create({
            username: username,
            phoneNo: phoneNo,
            email: email,
            password: hash,
            totalExpenseAmount: totalExpenseAmount
        }, { transaction: t });

        await t.commit(); // If execution reaches this line, no error was thrown! Transaction is committed!

        res.status(200).json({
            'user': 'created successfully'
        });
    }
    catch(err) {
        await t.rollback(); // If execution reaches this line, an error was thrown! Transaction is rolled back!

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
    }
};

exports.postLogin = async (req, res, next) => {
    try {
        let email = req.body.email;
        let plainTextPassword = req.body.password;
    
        // optimised SQL query!
        let user = await User.findAll({
            where: {
                email: email
            },
            attributes: [
                'id', 'username', 'password', 'isPremiumUser'
            ]
        });
    
        // 'email' is correct! (the length is greater than 0)
        if(user.length) {
            let hash = user[0].dataValues.password;
            
            let result = await bcrypt.compare(plainTextPassword, hash);
    
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
        }
        else {
            // 'email' is incorrect! - not found (client error!)
            res.status(404).json({
                'login': 'email is incorrect'
            });
        }
    }
    catch(err) {
        console.error(err);
        // server error!
        res.status(500).json({
            'login': 'server error'
        });
    }
};

exports.postTrackExpense = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const userId = req.userId;
        let category = req.body.track.category;
        let expense = req.body.track.expense;
        let description = req.body.track.description;
    
        /* #1 adding a new expense */
        await req.user.createDailyExpense({
            category: category,
            amount: expense,
            description: description
        }, { transaction: t });
    
        /* #2 updating totalExpenseAmount in User table */
        let oldExpenseAmount = req.user.dataValues.totalExpenseAmount;
        let newExpenseAmount = Number(oldExpenseAmount) + Number(expense);
    
        await User.update({ totalExpenseAmount: newExpenseAmount }, {
            where: {
                id: userId
            },
            transaction: t
        });
    
        await t.commit();

        res.status(200).json({
            'dailyExpense': 'created successfully'
        });
    }
    catch(err) {
        await t.rollback();

        console.log(err);
        // server error!
        res.status(500).json({
            'dailyExpense': 'server error'
        });
    }
};

exports.getTrackExpense = async (req, res, next) => {
    try {
        let userId = req.userId;

        // optimised SQL query!
        let user = await User.findAll({
            where: {
                id: userId
            },
            attributes: [
                'username', 'isPremiumUser'
            ]
        });
    
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
    }
    catch(err) {
        console.log(err);
        res.sendStatus(403); // User does not exist (invalid token!)
    }
};

exports.getMyExpense = async (req, res, next) => {
    try {
        let userId = req.userId;
        let currentPageNumber = req.body.currentPageNumber;
        let rowsPerPage = parseInt(req.body.rowsPerPage);
        let totalExpenses;
    
        // Dynamic Pagination
        if(rowsPerPage) {
            EXPENSES_PER_PAGE = rowsPerPage;
        }
        else EXPENSES_PER_PAGE = 7; // resetting to default value!
    
        // for Leaderboard ('view expense graph')
        if(req.headers['userid']) {
            userId = req.headers['userid'];
        }
    
        let numOfExpenses = await DailyExpense.count({
            where: {
                userId: userId
            }
        })
    
        totalExpenses = numOfExpenses;
        let user_expense;
    
        // for 'view-expense-graph'
        if(currentPageNumber === -1) {
            user_expense = await DailyExpense.findAll({
                where: {
                    userId: userId
                }
            });
        }
        // for Pagination of all the expenses
        else {
            // optimised SQL query!
            user_expense = await DailyExpense.findAll({
                where: {
                    userId: userId
                },
                offset: (currentPageNumber - 1) * EXPENSES_PER_PAGE,
                limit: EXPENSES_PER_PAGE,
                attributes: [
                    'id', 'category', 'amount', 'description'
                ]
            })
        }
    
        if(user_expense.length) {
            let user_data = user_expense;
            
            res.status(200).json({
                'user_data': user_data,
                'totalExpenses': totalExpenses,
                'EXPENSES_PER_PAGE': EXPENSES_PER_PAGE
            });
        }
        else {
            res.sendStatus(404); // Not Found
        }
    }
    catch(err) {
        console.log(err);
        res.sendStatus(403); // User does not exist (invalid token!)
    }
};

exports.deleteMyExpense = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const userId = req.userId;
        const id = req.body.id;
        const expenseAmount = req.body.expenseAmount;
    
        /* #1 deleting an expense */
        await DailyExpense.destroy({
            where: {
                id: id,
                userId: userId
            },
            transaction: t
        });
    
        /* #2 updating totalExpenseAmount in User table */
        let oldExpenseAmount = req.user.dataValues.totalExpenseAmount;
        let newExpenseAmount = Number(oldExpenseAmount) - Number(expenseAmount);
    
        await User.update({ totalExpenseAmount: newExpenseAmount }, {
            where: {
                id: userId
            },
            transaction: t
        });
    
        await t.commit();

        res.status(200).json({
            'delete': 'successful'
        });
    }
    catch(err) {
        await t.rollback();

        console.error(err);
        res.sendStatus(404);
    }
};

exports.getMyLeaderboard = async (req, res, next) => {
    try {
        // optimised SQL query!
        let result = await sequelize.query(`
            SELECT id AS userId, username AS name, totalExpenseAmount
            FROM users
            ORDER BY totalExpenseAmount ASC;
        `);

        res.status(200).json({
            arr : result[0],
            userId: req.userId
        });   
    }
    catch(err) {
        console.log(err);
        res.sendStatus(500); // Internal Server Error!
    }
};

exports.getMyReport = async (req, res, next) => {
    try {
        // optimised SQL query!
        let userData = await sequelize.query(`
            SELECT category, SUM(amount) AS amount
            FROM dailyExpenses
            WHERE userId = ${req.userId}
            GROUP BY category;
        `)

        res.status(200).json({
            arr : userData[0]
        });
    }
    catch(err) {
        console.log(err);
        res.sendStatus(500); // Internal Server Error!
    }
}

exports.downloadMyReport = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        // optimised by minimizing redundant calls to the Database (fetched data from frontend instead!)
        let report = req.body.reportArr;
        let totalExpense = req.body.totalExpense;

        // client error!
        if(report === undefined) {
            return res.status(400).json({fileURL: undefined, success: false, error: 'Client Error'}); // Bad Request
        }
        
        let obj = {
            data: report,
            totalExpense: totalExpense
        }

        let stringifiedData = JSON.stringify(obj);
        
        let fileName = `Daily Expense Report ${req.userId}/${new Date()}.txt`; // doing so eliminates the problem of overwriting the same file in Amazon S3!
    
        let fileURL = await AWS_S3_service.uploadToS3(stringifiedData, fileName);
        
        // saving the 'fileURL' in 'downloadHistory' table
        await req.user.createDownloadHistory({
            url: fileURL
        }, { transaction: t });

        await t.commit();

        return res.status(200).json({fileURL: fileURL, success: true});
    }
    catch(err) {
        await t.rollback();

        console.log('Something went wrong!', err);
        return res.status(500).json({fileURL: '', success: false, error: err}); // Internal Server Error!
    }
}

exports.getDownloadHistory = async (req, res, next) => {
    try {
        // optimised SQL query!
        let userDownloadHistory = await DownloadHistory.findAll({
            where: {
                userId: req.userId
            },
            attributes: [
                'url', 'createdAt'
            ]
        })

        res.status(200).json({history: userDownloadHistory});
    }
    catch(err) {
        console.log(err);
        res.status(500).json({error: err});
    }
}
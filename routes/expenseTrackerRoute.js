const express = require('express');

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

const expenseTrackerController = require('../controllers/expenseTrackerController');

router.post('/sign-in', expenseTrackerController.postSignIn);
router.post('/login', expenseTrackerController.postLogin);
router.post('/track-expense', authenticateToken, expenseTrackerController.postTrackExpense);
router.get('/track-expense', authenticateToken, expenseTrackerController.getTrackExpense);
router.post('/my-expense', authenticateToken, expenseTrackerController.getMyExpense);
router.post('/my-expense/delete', authenticateToken, expenseTrackerController.deleteMyExpense);
router.get('/my-leaderboard', authenticateToken, expenseTrackerController.getMyLeaderboard);
router.get('/report', authenticateToken, expenseTrackerController.getMyReport);
router.post('/report/download', authenticateToken, expenseTrackerController.downloadMyReport);
router.get('/report/history', authenticateToken, expenseTrackerController.getDownloadHistory);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // the second part says get the second element from "Bearer JWT_token" leaving out the spaces; while the first part comes in handy to check whether or not the token actually exists - so if the token is 'undefined' then we'll get that from the first part or else the token itself from the second part!

    if(token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.TOKEN_SECRET, (err, userId) => {
        if(err) return res.sendStatus(403); // Forbidden (User has an invalid token)

        req.userId = userId.id;
        
        User.findByPk(req.userId)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.error(err);
            res.sendStatus('500'); // server error!
        });
    });
}

module.exports = router;
const express = require('express');

const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');

const paymentController = require('../controllers/paymentController');

router.get('/premiumMembership', authenticateToken, paymentController.premiumMembership);
router.post('/updateTransactionStatus', authenticateToken, paymentController.updateTransactionStatus);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.TOKEN_SECRET, (err, userId) => {
        if(err) return res.sendStatus(403); // Forbidden (User has an invalid token)

        User.findByPk(userId.id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(404);
        });
    });
}

module.exports = router;
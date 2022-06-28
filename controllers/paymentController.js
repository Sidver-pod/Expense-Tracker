const Razorpay = require('razorpay');

const Order = require('../models/order');

exports.premiumMembership = (req, res, next) => {
    var rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const amount = 2500;

    rzp.orders.create({ amount: amount, currency: "INR" }, (err, order) => {
        if(err) {
            throw new Error(err);
        }
        req.user.createOrder({ razorpay_order_id: order.id, status: 'PENDING' })
        .then(() => {
            let username = req.user.dataValues.username;
            let phoneNo = req.user.dataValues.phoneNo;
            let email = req.user.dataValues.email;

            return res.status(201).json({
                'order' : order,
                'key_id' : rzp.key_id,
                'username' : username,
                'phoneNo' : phoneNo,
                'email' : email
            });
        })
        .catch(err => {
            // throw new Error(err)
            res.status(403).json({
                'message': 'Something went wrong',
                'error': err
            })
        })
    })
    .catch(err => {
        console.log(JSON.stringify(err));
        res.sendStatus(403);
    });
};

exports.updateTransactionStatus = (req, res, next) => {
    try {
        const { payment_id, order_id } = req.body;
        Order.findOne({ where : { razorpay_order_id : order_id } })
        .then(order => {
            order.update({ razorpay_payment_id : payment_id, status: 'SUCCESSFUL' })
            .then(() => {
                req.user.update({ isPremiumUser: true })
                return res.status(202).json({
                    'success': true,
                    'message': "Transaction Successful"
                });
            })
            .catch((err) => {
                throw new Error(err);
            })
        })
        .catch(err => {
            throw new Error(err);
        })
    }
    catch(err) {
        console.log(err);
        res.status(403).json({
            'error': err,
            'message': 'Something went wrong'
        });
    }
};
const Razorpay = require('razorpay'); // from Razorpay API

const sequelize = require('../util/database'); // for transaction!
const Order = require('../models/order');

exports.premiumMembership = async (req, res, next) => {
    const t = await sequelize.transaction(); // transaction

    try {
        var rzp = await new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    
        const amount = 2500;
        let order;
    
        await rzp.orders.create({ amount: amount, currency: "INR" }, (err, result) => {
            if(err) {
                throw new Error(err);
            }
            else {
                order = result;
            }
        });
    
        await req.user.createOrder({
            razorpay_order_id: order.id,
            status: 'PENDING'
        }, { transaction: t });
    
        let username = req.user.dataValues.username;
        let phoneNo = req.user.dataValues.phoneNo;
        let email = req.user.dataValues.email;
    
        await t.commit(); // If execution reaches this line, no error was thrown! Transaction is committed!

        return res.status(201).json({
            'order' : order,
            'key_id' : rzp.key_id,
            'username' : username,
            'phoneNo' : phoneNo,
            'email' : email
        });
    }
    catch(err) {
        await t.rollback(); // If execution reaches this line, an error was thrown! Transaction is rolled back!

        console.log(JSON.stringify(err));
        res.status(403).json({
            'message': 'Something went wrong',
            'error': err
        });
    }
};

exports.updateTransactionStatus = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { payment_id, order_id } = req.body;

        let order = await Order.findOne({ where : { razorpay_order_id : order_id } });

        await order.update({
            razorpay_payment_id : payment_id,
            status: 'SUCCESSFUL'
        }, { transaction: t });

        await req.user.update({
            isPremiumUser: true
        }, { transaction: t });

        await t.commit();

        return res.status(202).json({
            'success': true,
            'message': "Transaction Successful"
        });
    }
    catch(err) {
        await t.rollback();

        console.log(err);
        res.status(403).json({
            'error': err,
            'message': 'Something went wrong'
        });
    }
};
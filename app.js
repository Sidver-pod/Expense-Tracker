const path = require('path');

const bodyParser = require('body-parser');

const express = require('express');

require('dotenv').config();

const sequelize = require('./util/database');

//database models
const User = require('./models/user');
const DailyExpense = require('./models/dailyExpense');
const Order = require('./models/order');
const ForgotPassword = require('./models/forgotPassword');

const cors = require('cors');

const app = express();

const expenseTrackerRoute = require('./routes/expenseTrackerRoute');
const paymentRoute = require('./routes/paymentRoute');
const passwordRoute = require('./routes/passwordRoute');

app.use(bodyParser.json());
app.use(cors());

app.use('/expense-tracker', expenseTrackerRoute);
app.use('/payment', paymentRoute);
app.use('/password', passwordRoute);

// One-Many association
User.hasMany(DailyExpense);
DailyExpense.belongsTo(User);

// One-One association
User.hasMany(Order);
Order.belongsTo(User);

// One-Many association
User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

sequelize.sync()
 .then(result => {
     console.log('database sync: CHECK');
     app.listen('3000');
 })
 .catch(err => console.error(err));
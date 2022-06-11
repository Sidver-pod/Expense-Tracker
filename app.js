const path = require('path');

const bodyParser = require('body-parser');

const express = require('express');

require('dotenv').config();

const sequelize = require('./util/database');

//database models
const User = require('./models/user');
const DailyExpense = require('./models/dailyExpense');

const cors = require('cors');

const app = express();

const expenseTrackerRoute = require('./routes/expenseTrackerRoute');

app.use(bodyParser.json());
app.use(cors());

app.use('/expense-tracker', expenseTrackerRoute);

// One-Many association
User.hasMany(DailyExpense);
DailyExpense.belongsTo(User);

sequelize.sync()
 .then(result => {
     console.log('database sync: CHECK');
     app.listen('3000');
 })
 .catch(err => console.error(err));
const path = require('path');

const bodyParser = require('body-parser');

const express = require('express');

require('dotenv').config();

const sequelize = require('./util/database');

const cors = require('cors');

const app = express();

const expenseTrackerRoute = require('./routes/expenseTrackerRoute');

app.use(bodyParser.json());
app.use(cors());

app.use('/expense-tracker', expenseTrackerRoute);

sequelize.sync()
 .then(result => {
     console.log('database sync: CHECK');
     app.listen('3000');
 })
 .catch(err => console.error(err));
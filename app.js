const path = require('path');
const fs = require('fs');
const https = require('https'); // for SSL/TLS (OpenSSL)

const bodyParser = require('body-parser');

const express = require('express');

require('dotenv').config();

const sequelize = require('./util/database');

const helmet = require('helmet'); // helps provide secure response headers
const morgan = require('morgan'); // helps log requests, responses and errors

//database models
const User = require('./models/user');
const DailyExpense = require('./models/dailyExpense');
const Order = require('./models/order');
const ForgotPassword = require('./models/forgotPassword');
const DownloadHistory = require('./models/downloadHistory');

const cors = require('cors');

const app = express();

const expenseTrackerRoute = require('./routes/expenseTrackerRoute');
const paymentRoute = require('./routes/paymentRoute');
const passwordRoute = require('./routes/passwordRoute');

// creating a file 'access.log' for storing all the logs
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' } // appends 'new log' to 'existing log' instead of overwriting! 
);

// SSL/TLS (OpenSSL); helps encrypt data being shared between Server and Client!!
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert'); // public key + server identity

app.use(bodyParser.json());
app.use(cors());
app.use(helmet()); // helps provide secure response headers
app.use(morgan('combined', { stream: accessLogStream })); // helps log requests, responses and errors

app.use('/expense-tracker', expenseTrackerRoute);
app.use('/payment', paymentRoute);
app.use('/password', passwordRoute);

// #1 One-Many association
User.hasMany(DailyExpense);
DailyExpense.belongsTo(User);

// #2 One-Many association
User.hasMany(Order);
Order.belongsTo(User);

// #3 One-Many association
User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

// #4 One-Many association
User.hasMany(DownloadHistory);
DownloadHistory.belongsTo(User);

sequelize.sync()
 .then(result => {
     console.log('database sync: CHECK');
     // provides 'https' in the URL, thereby allowing to send a 'certificate' to the client!
     https.createServer({ key: privateKey, cert: certificate }, app).listen(process.env.PORT || 3000);
 })
 .catch(err => console.error(err));
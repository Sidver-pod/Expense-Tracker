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
/* Helmet */
app.use(helmet({
  crossOriginEmbedderPolicy: false
})); // #1 helps provide secure response headers
app.use(
    helmet.contentSecurityPolicy({ // #2 making a few changes to Content-Security-Policy!
      directives: {
        "script-src": ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.2/axios.min.js", "'sha256-GVFXnKDf+eUepT5PI/14bajfAss1KadNdHYkQcYg1SA='", "https://checkout.razorpay.com/", "https://api.razorpay.com/"],
        "img-src": ["'self'", "https://cdn.dribbble.com/", "https://img.freepik.com/"],
        "frame-src": ["'self'", "https://api.razorpay.com/"],
        "connect-src": ["'self'", "https://rudderstack.razorpay.com/", "https://localhost:3000/"]
      }
    }),
    helmet.crossOriginResourcePolicy({
      policy: "cross-origin" // #3.1 setting 'cross-origin' for a background image from another server
    })
);
/* morgan */
app.use(morgan('combined', { stream: accessLogStream })); // helps log requests, responses and errors

app.use('/expense-tracker', expenseTrackerRoute);
app.use('/payment', paymentRoute);
app.use('/password', passwordRoute);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, req.url)); // sends the file from the file path mentioned in the URL to the Client!
});

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
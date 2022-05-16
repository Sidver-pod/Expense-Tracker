const express = require('express');

const router = express.Router();

const expenseTrackerController = require('../controllers/expenseTrackerController');

router.post('/sign-in', expenseTrackerController.postSignIn);

module.exports = router;
const express = require('express');

const router = express.Router();

const expenseTrackerController = require('../controllers/expenseTrackerController');

router.post('/sign-in', expenseTrackerController.postSignIn);
router.post('/login', expenseTrackerController.postLogin);

module.exports = router;
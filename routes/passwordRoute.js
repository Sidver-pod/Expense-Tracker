const express = require('express');

const router = express.Router();

const passwordController = require('../controllers/passwordController');

router.post('/forgot', passwordController.forgotPassword);
router.get('/reset/:uuid', passwordController.resetPassword);
router.post('/update/:uuid', passwordController.updatePassword);

module.exports = router;
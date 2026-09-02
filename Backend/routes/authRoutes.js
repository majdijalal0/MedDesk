const express = require('express');
const router = express.Router();

const {protect} =  require('../middleware/authMiddleware');


const {login,register,getMe} = require('../controllers/authControllers');
const { registerRules, loginRules } = require('../middleware/validator');

router.post('/register',registerRules,register);
router.post('/login',loginRules,login);
router.get('/me', protect, getMe);

module.exports = router;
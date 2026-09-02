const express = require('express');
const router = express.Router();
const {protect,restrictTo} = require('../middleware/authMiddleware.js');

const {addUser,changeStatus,getUsers} = require("../controllers/adminController");

router.get('/',protect,restrictTo('admin'),getUsers);
router.post('/',protect,restrictTo('admin'),addUser);
router.patch('/:id_user',protect,restrictTo('admin'),changeStatus);

module.exports = router;
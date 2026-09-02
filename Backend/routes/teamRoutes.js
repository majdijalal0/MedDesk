const express = require('express');
const router = express.Router();

const {protect} =  require('../middleware/authMiddleware');

const {getMyDoctors,getMyTeam,addSecretary,removeSecretary} = require('../controllers/teamController.js');

router.get('/my-doctors',protect,getMyDoctors);
router.get('/my-secretaries',protect,getMyTeam);

router.post('/add-secretary',protect,addSecretary);

router.delete('/:secretary_id/remove-secretary',protect,removeSecretary);

module.exports = router;
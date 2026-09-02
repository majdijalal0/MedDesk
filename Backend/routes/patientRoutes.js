const express = require('express');
const router = express.Router();
const {addPatient,getPatients,getPatient,updatePatient,deletePatient,generateSummary} = require('../controllers/patientController');
const {protect,restrictTo} = require('../middleware/authMiddleware');


router.post('/addpatient',protect,addPatient);
router.get('/getpatients',protect,restrictTo('médecin','secrétaire'),getPatients);
router.get('/:id',protect,restrictTo('médecin'),getPatient);
router.put('/:id',protect,updatePatient);
router.delete('/:id',protect,restrictTo('médecin'),deletePatient);

router.post('/:id/summarize', protect, restrictTo('médecin'), generateSummary);

module.exports = router;
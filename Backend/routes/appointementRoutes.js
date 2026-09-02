const express = require('express');
const router = express.Router();
const {addAppointement,
    getAppointement,
    getAppointements,
    getPatientAppointements,
    updateAppointement,
    deleteAppointement,
    getTodayAppointements,
    getRefDoctorAppointements} = require('../controllers/appointementController.js');
    
const {protect,restrictTo} = require('../middleware/authMiddleware.js');

router.post('/:id',protect,restrictTo("médecin","secrétaire"),addAppointement);

router.get('/rdvs',protect,restrictTo("médecin","secrétaire"),getAppointements);

router.get('/tdrdvs', protect, getTodayAppointements);

router.get('/secretary', protect,restrictTo("secrétaire"), getRefDoctorAppointements);

router.get('/:id/rdv',protect,restrictTo("médecin","secrétaire"),getAppointement);

router.get('/:id/rdvs',protect,restrictTo("médecin","secrétaire"),getPatientAppointements);


router.put('/:id/rdv',protect,restrictTo("médecin","secrétaire"),updateAppointement);

router.delete('/:id/rdv',protect,restrictTo("médecin","secrétaire"),deleteAppointement);





module.exports = router;
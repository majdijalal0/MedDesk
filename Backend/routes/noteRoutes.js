const express = require('express');
const router = express.Router();
const {addNote, getPatientNotes,updateNote,deleteNote,organizeNote,validateNote} = require('../controllers/noteController');
const {protect,restrictTo} = require('../middleware/authMiddleware');



router.get('/:patient_id', protect, restrictTo('médecin'), getPatientNotes);
router.put('/:id_note', protect, restrictTo('médecin'), updateNote);
router.delete('/:id_note', protect, restrictTo('médecin'), deleteNote);

router.post('/organize', protect,restrictTo('médecin'), organizeNote);  
router.post('/:id_note/organize',protect,restrictTo('médecin'),organizeNote);
router.post('/:patient_id', protect, restrictTo('médecin'),addNote);

router.put('/:id_note/validate',protect,restrictTo('médecin'),validateNote);

module.exports = router;
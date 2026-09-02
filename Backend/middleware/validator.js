const { body } = require('express-validator');

const registerRules = [
    body('last_name')
        .trim()
        .notEmpty().withMessage("Le nom est requis"),
    body('first_name')
        .trim()
        .notEmpty().withMessage("Le prénom est requis"),
    body('email')
        .trim()
        .isEmail().withMessage("Format d'adresse email invalide")
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères")
        .matches(/[a-z]/).withMessage("Le mot de passe doit inclure au moins une lettre minuscule")
        .matches(/[A-Z]/).withMessage("Le mot de passe doit inclure au moins une lettre majuscule")
        .matches(/[0-9]/).withMessage("Le mot de passe doit inclure au moins un chiffre")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Le mot de passe doit inclure au moins un caractère spécial"),
    body('role')
        .isIn(['médecin', 'secrétaire']).withMessage("Rôle invalide"),
    
];

const loginRules = [
    body('email')
        .trim()
        .isEmail().withMessage("Format d'adresse email invalide")
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage("Le mot de passe est requis")
];

module.exports = { registerRules, loginRules };